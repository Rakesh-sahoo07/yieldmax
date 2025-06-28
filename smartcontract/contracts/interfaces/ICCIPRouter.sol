// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICCIPRouter
 * @dev Simplified CCIP Router interface for cross-chain functionality
 */

struct EVMTokenAmount {
    address token;
    uint256 amount;
}

struct Any2EVMMessage {
    bytes32 messageId;
    uint64 sourceChainSelector;
    bytes sender;
    bytes data;
    EVMTokenAmount[] destTokenAmounts;
}

struct EVM2AnyMessage {
    bytes receiver;
    bytes data;
    EVMTokenAmount[] tokenAmounts;
    bytes extraArgs;
    address feeToken;
}

interface ICCIPRouter {
    function ccipSend(
        uint64 destinationChainSelector,
        EVM2AnyMessage calldata message
    ) external payable returns (bytes32);

    function getFee(
        uint64 destinationChainSelector,
        EVM2AnyMessage calldata message
    ) external view returns (uint256 fee);
}

/**
 * @title CCIPReceiver
 * @dev Base contract for receiving CCIP messages
 */
abstract contract CCIPReceiver {
    address internal immutable i_router;

    constructor(address router) {
        i_router = router;
    }

    modifier onlyRouter() {
        require(msg.sender == i_router, "Only router can call");
        _;
    }

    function ccipReceive(Any2EVMMessage calldata message) external onlyRouter {
        _ccipReceive(message);
    }

    function _ccipReceive(Any2EVMMessage memory message) internal virtual;
} 