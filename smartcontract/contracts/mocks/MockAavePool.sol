// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IAavePool.sol";

/**
 * @title MockAavePool
 * @dev Mock Aave Pool for testing
 */
contract MockAavePool is IAavePool {
    mapping(address => mapping(address => uint256)) public deposits;
    
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external override {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        deposits[asset][onBehalfOf] += amount;
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external override returns (uint256) {
        require(deposits[asset][msg.sender] >= amount, "Insufficient deposit");
        deposits[asset][msg.sender] -= amount;
        IERC20(asset).transfer(to, amount);
        return amount;
    }

    function getUserAccountData(address user)
        external
        view
        override
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        // Mock implementation
        return (0, 0, 0, 0, 0, type(uint256).max);
    }

    function getDeposit(address asset, address user) external view returns (uint256) {
        return deposits[asset][user];
    }
} 