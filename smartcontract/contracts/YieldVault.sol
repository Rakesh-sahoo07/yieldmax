// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Aave V3 interfaces
interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

// Compound V3 interfaces
interface IComet {
    function supply(address asset, uint amount) external;
    function withdraw(address asset, uint amount) external;
    function balanceOf(address account) external view returns (uint256);
    function baseToken() external view returns (address);
}

contract YieldVault is CCIPReceiver, AutomationCompatibleInterface, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    uint256 public constant MIN_DEPOSIT = 1e6; // 1 USDC
    enum Protocol { NONE, AAVE, COMPOUND }

    IERC20 public immutable USDC;
    IERC20 public immutable aUSDC;
    LinkTokenInterface public immutable LINK;
    address public immutable CCIP_ROUTER;
    
    Protocol public currentProtocol;
    uint256 public idleUSDC; // USDC not deployed to protocols
    uint256 public totalShares;

    // Protocol contracts
    IPool public aavePool;
    IComet public compoundComet;

    struct UserInfo {
        uint256 shares;
        uint256 lastDepositTime;
    }
    mapping(address => UserInfo) public userInfo;

    // CCIP config
    mapping(uint64 => address) public allowedSenders;
    mapping(uint64 => address) public destinationReceivers;
    mapping(uint64 => uint256) public gasLimits;

    // Automation config
    uint256 public lastRebalanceTime;
    uint256 public rebalanceInterval = 1 days;
    uint256 public rebalanceThreshold = 100e6;
    bool public aiRebalanceRequested;
    string public aiSuggestion;
    string public currentStrategy;
    uint256 public strategyTimestamp;

    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event ProtocolDeposit(Protocol protocol, uint256 amount);
    event ProtocolWithdraw(Protocol protocol, uint256 amount);
    event ProtocolRebalance(Protocol from, Protocol to, uint256 amount);
    event CrossChainTransfer(uint64 indexed dstChain, bytes32 messageId, address indexed recipient, uint256 amount);
    event CrossChainReceived(bytes32 indexed messageId, uint64 indexed srcChain, address sender, uint256 amount);
    event AIRebalanceRequest(string currentStrategy, uint256 aaveBalance, uint256 compoundBalance);
    event AIRebalanceExecuted(string suggestion, Protocol newProtocol, uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event RebalanceFailure(string reason);

    constructor(
        address _router,
        address _usdc,
        address _aUsdc,
        address _link,
        address _aaveProvider,
        address _compoundComet
    ) CCIPReceiver(_router) {
        USDC = IERC20(_usdc);
        aUSDC = IERC20(_aUsdc);
        LINK = LinkTokenInterface(_link);
        CCIP_ROUTER = _router;
        
        _initializeProtocols(_aaveProvider, _compoundComet);
        lastRebalanceTime = block.timestamp;
        currentStrategy = "INITIAL_SETUP";
        strategyTimestamp = block.timestamp;
        
        _approveTokens();
    }

    // User deposit (only stores in contract)
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_DEPOSIT, "Min 1 USDC");
        
        USDC.safeTransferFrom(msg.sender, address(this), amount);
        idleUSDC += amount;

        uint256 shares = totalShares == 0 
            ? amount 
            : (amount * totalShares) / totalAssets();

        UserInfo storage u = userInfo[msg.sender];
        u.shares += shares;
        u.lastDepositTime = block.timestamp;
        totalShares += shares;

        emit Deposit(msg.sender, amount, shares);
    }

    // User withdraw (only from contract balance)
    function withdraw(uint256 shares) public nonReentrant whenNotPaused {
        require(shares > 0, "Zero shares");
        UserInfo storage u = userInfo[msg.sender];
        require(u.shares >= shares, "Insufficient shares");

        uint256 amount = (shares * totalAssets()) / totalShares;
        require(idleUSDC >= amount, "Insufficient contract liquidity");

        idleUSDC -= amount;
        USDC.safeTransfer(msg.sender, amount);

        u.shares -= shares;
        totalShares -= shares;

        emit Withdraw(msg.sender, amount, shares);
    }

    // Protocol operations (owner only)
    function depositToProtocol(uint256 amount, Protocol protocol) external onlyOwner {
        require(amount <= idleUSDC, "Exceeds idle balance");
        idleUSDC -= amount;
        
        if (protocol == Protocol.AAVE) {
            _depositToAave(amount);
        } else if (protocol == Protocol.COMPOUND) {
            _depositToCompound(amount);
        } else {
            revert("Invalid protocol");
        }
        
        currentProtocol = protocol;
        emit ProtocolDeposit(protocol, amount);
    }

    function withdrawFromProtocol(uint256 amount, Protocol protocol) external onlyOwner {
        uint256 withdrawn;
        
        if (protocol == Protocol.AAVE) {
            withdrawn = _withdrawFromAave(amount);
        } else if (protocol == Protocol.COMPOUND) {
            withdrawn = _withdrawFromCompound(amount);
        } else {
            revert("Invalid protocol");
        }
        
        idleUSDC += withdrawn;
        emit ProtocolWithdraw(protocol, withdrawn);
    }

    function rebalanceProtocol(Protocol newProtocol) public onlyOwner {
        require(newProtocol != Protocol.NONE, "Invalid protocol");
        require(newProtocol != currentProtocol, "Same protocol");
        require(_isAvailable(newProtocol), "Protocol not available");

        Protocol oldProtocol = currentProtocol;
        uint256 amount = _getProtocolBalance(oldProtocol);

        if (amount > 0) {
            uint256 withdrawn = _withdrawFromProtocol(amount, oldProtocol);
            _depositToProtocol(withdrawn, newProtocol);
        }

        currentProtocol = newProtocol;
        lastRebalanceTime = block.timestamp;
        emit ProtocolRebalance(oldProtocol, newProtocol, amount);
    }

    // Cross-chain functions
    function sendCrossChain(
        uint64 dstChain,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant returns (bytes32) {
        require(
            destinationReceivers[dstChain] != address(0),
            "Unconfigured destination"
        );
        require(amount > 0 && amount <= totalAssets(), "Invalid amount");

        // Ensure sufficient idle USDC
        if (idleUSDC < amount) {
            uint256 needed = amount - idleUSDC;
            uint256 withdrawn = _withdrawFromProtocol(needed, currentProtocol);
            idleUSDC += withdrawn;
            if (idleUSDC < amount) amount = idleUSDC;
        }

        idleUSDC -= amount;
        USDC.safeApprove(CCIP_ROUTER, amount);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(recipient),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            extraArgs: abi.encodePacked(uint32(gasLimits[dstChain])),
            feeToken: address(LINK)
        });
        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(USDC),
            amount: amount
        });

        IRouterClient router = IRouterClient(CCIP_ROUTER);
        uint256 fee = router.getFee(dstChain, message);
        require(LINK.balanceOf(address(this)) >= fee, "Insufficient LINK");
        LINK.approve(CCIP_ROUTER, fee);

        bytes32 messageId = router.ccipSend(dstChain, message);
        emit CrossChainTransfer(dstChain, messageId, recipient, amount);
        return messageId;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        address sender = abi.decode(message.sender, (address));
        require(
            allowedSenders[message.sourceChainSelector] == sender,
            "Unauthorized"
        );

        if (message.destTokenAmounts.length > 0) {
            Client.EVMTokenAmount memory tokenAmount = message.destTokenAmounts[0];
            require(
                tokenAmount.token == address(USDC),
                "Invalid token"
            );
            _processCrossChainReceived(
                message.messageId,
                message.sourceChainSelector,
                sender,
                tokenAmount.amount
            );
        }
    }

    function _processCrossChainReceived(
        bytes32 messageId,
        uint64 srcChain,
        address sender,
        uint256 amount
    ) internal {
        idleUSDC += amount;
        emit CrossChainReceived(messageId, srcChain, sender, amount);
    }

    // Automation functions
    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bool timeCondition = (block.timestamp - lastRebalanceTime) >= rebalanceInterval;
        bool amountCondition = totalAssets() >= rebalanceThreshold;
        upkeepNeeded =
            (timeCondition && amountCondition) ||
            aiRebalanceRequested;

        if (upkeepNeeded) {
            performData = abi.encode(totalAssets());
        }
    }

    function performUpkeep(bytes calldata) external override {
        bool timeCondition = (block.timestamp - lastRebalanceTime) >= rebalanceInterval;
        bool amountCondition = totalAssets() >= rebalanceThreshold;
        require(
            (timeCondition && amountCondition) || aiRebalanceRequested,
            "No upkeep"
        );

        _autoRebalance();
        aiRebalanceRequested = false;
        lastRebalanceTime = block.timestamp;
    }

    function requestAIRebalanceAdvice() external onlyOwner {
        emit AIRebalanceRequest(
            currentStrategy,
            _getProtocolBalance(Protocol.AAVE),
            _getProtocolBalance(Protocol.COMPOUND)
        );
    }

    function executeAIRebalance(
        string calldata suggestion,
        Protocol newProtocol
    ) external onlyOwner {
        require(_isAvailable(newProtocol), "Protocol unavailable");
        aiRebalanceRequested = true;
        aiSuggestion = suggestion;

        if (newProtocol != currentProtocol) {
            rebalanceProtocol(newProtocol);
        }

        currentStrategy = suggestion;
        strategyTimestamp = block.timestamp;
        emit AIRebalanceExecuted(suggestion, newProtocol, totalAssets());
    }

    // Internal protocol operations
    function _depositToAave(uint256 amount) internal {
        uint256 before = aUSDC.balanceOf(address(this));
        aavePool.supply(address(USDC), amount, address(this), 0);
        uint256 afterBalance = aUSDC.balanceOf(address(this));
        require(afterBalance - before >= amount, "Aave deposit mismatch");
    }

    function _depositToCompound(uint256 amount) internal {
        uint256 before = compoundComet.balanceOf(address(this));
        compoundComet.supply(address(USDC), amount);
        uint256 afterBalance = compoundComet.balanceOf(address(this));
        require(afterBalance - before >= amount, "Compound deposit mismatch");
    }

    function _withdrawFromAave(uint256 amount) internal returns (uint256) {
        uint256 before = USDC.balanceOf(address(this));
        aavePool.withdraw(address(USDC), amount, address(this));
        return USDC.balanceOf(address(this)) - before;
    }

    function _withdrawFromCompound(uint256 amount) internal returns (uint256) {
        uint256 before = USDC.balanceOf(address(this));
        compoundComet.withdraw(address(USDC), amount);
        return USDC.balanceOf(address(this)) - before;
    }

    function _depositToProtocol(uint256 amount, Protocol protocol) internal {
        if (protocol == Protocol.AAVE) {
            _depositToAave(amount);
        } else if (protocol == Protocol.COMPOUND) {
            _depositToCompound(amount);
        }
    }

    function _withdrawFromProtocol(
        uint256 amount,
        Protocol protocol
    ) internal returns (uint256) {
        if (protocol == Protocol.AAVE) {
            return _withdrawFromAave(amount);
        } else if (protocol == Protocol.COMPOUND) {
            return _withdrawFromCompound(amount);
        }
        return 0;
    }

    // View functions
    function totalAssets() public view returns (uint256) {
        return idleUSDC + _getProtocolBalance(currentProtocol);
    }

    function _getProtocolBalance(Protocol protocol) internal view returns (uint256) {
        if (protocol == Protocol.AAVE) {
            return aUSDC.balanceOf(address(this));
        } else if (protocol == Protocol.COMPOUND) {
            return compoundComet.balanceOf(address(this));
        }
        return 0;
    }

    function getUserBalance(address user) public view returns (uint256) {
        UserInfo storage u = userInfo[user];
        if (totalShares == 0 || u.shares == 0) return 0;
        return (u.shares * totalAssets()) / totalShares;
    }

    // Management functions
    function _initializeProtocols(
        address _aaveProvider,
        address _compoundComet
    ) internal {
        if (_aaveProvider != address(0)) {
            IPoolAddressesProvider p = IPoolAddressesProvider(_aaveProvider);
            aavePool = IPool(p.getPool());
        }
        if (_compoundComet != address(0)) {
            compoundComet = IComet(_compoundComet);
            require(
                compoundComet.baseToken() == address(USDC),
                "Invalid base token"
            );
        }
    }

    function _approveTokens() internal {
        if (address(aavePool) != address(0)) {
            USDC.safeApprove(address(aavePool), type(uint256).max);
        }
        if (address(compoundComet) != address(0)) {
            USDC.safeApprove(address(compoundComet), type(uint256).max);
        }
        USDC.safeApprove(CCIP_ROUTER, type(uint256).max);
    }

    function _isAvailable(Protocol protocol) internal view returns (bool) {
        if (protocol == Protocol.AAVE) {
            return address(aavePool) != address(0);
        } else if (protocol == Protocol.COMPOUND) {
            return address(compoundComet) != address(0);
        }
        return false;
    }

    function _autoRebalance() internal {
        uint256 aaveBalance = _getProtocolBalance(Protocol.AAVE);
        uint256 compoundBalance = _getProtocolBalance(Protocol.COMPOUND);

        try this.tryAutoRebalance(aaveBalance, compoundBalance) {} catch {
            emit RebalanceFailure("Auto-rebalance failed");
        }
    }

    function tryAutoRebalance(
        uint256 aaveBalance,
        uint256 compoundBalance
    ) external {
        require(msg.sender == address(this), "Unauthorized");
        if (aaveBalance > compoundBalance * 2 && _isAvailable(Protocol.COMPOUND)) {
            rebalanceProtocol(Protocol.COMPOUND);
            currentStrategy = "AUTO_TO_COMPOUND";
        } else if (compoundBalance > aaveBalance * 2 && _isAvailable(Protocol.AAVE)) {
            rebalanceProtocol(Protocol.AAVE);
            currentStrategy = "AUTO_TO_AAVE";
        }
    }

    // Owner functions
    function setAllowedSender(uint64 chain, address sender) external onlyOwner {
        allowedSenders[chain] = sender;
    }

    function setDestinationReceiver(uint64 chain, address receiver) external onlyOwner {
        destinationReceivers[chain] = receiver;
    }

    function setGasLimit(uint64 chain, uint256 gas) external onlyOwner {
        gasLimits[chain] = gas;
    }

    function setRebalanceInterval(uint256 interval) external onlyOwner {
        rebalanceInterval = interval;
    }

    function setRebalanceThreshold(uint256 threshold) external onlyOwner {
        rebalanceThreshold = threshold;
    }

    function setAavePool(address provider) external onlyOwner {
        if (address(aavePool) != address(0)) {
            USDC.safeApprove(address(aavePool), 0);
        }
        if (provider != address(0)) {
            IPoolAddressesProvider p = IPoolAddressesProvider(provider);
            aavePool = IPool(p.getPool());
            USDC.safeApprove(address(aavePool), type(uint256).max);
        } else {
            aavePool = IPool(address(0));
        }
    }

    function setCompoundComet(address comet) external onlyOwner {
        if (address(compoundComet) != address(0)) {
            USDC.safeApprove(address(compoundComet), 0);
        }
        compoundComet = IComet(comet);
        if (comet != address(0)) {
            require(
                IComet(comet).baseToken() == address(USDC),
                "Invalid base token"
            );
            USDC.safeApprove(comet, type(uint256).max);
        }
    }

    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
        if (token == address(USDC)) {
            idleUSDC = idleUSDC > amount ? idleUSDC - amount : 0;
        }
        emit EmergencyWithdraw(token, amount);
    }

    function pause() external onlyOwner {
        _pause();
        USDC.safeApprove(address(aavePool), 0);
        USDC.safeApprove(address(compoundComet), 0);
        USDC.safeApprove(CCIP_ROUTER, 0);
    }

    function unpause() external onlyOwner {
        _unpause();
        _approveTokens();
    }
}