// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IFunctionsClient
 * @dev Simplified Chainlink Functions interface
 */
abstract contract FunctionsClient {
    address internal s_router;

    constructor(address router) {
        s_router = router;
    }

    function _sendRequest(
        bytes memory data,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donId
    ) internal returns (bytes32 requestId) {
        // Simplified implementation - in real deployment this would call the Functions router
        requestId = keccak256(abi.encodePacked(block.timestamp, msg.sender, data));
        return requestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal virtual;
}

/**
 * @title FunctionsRequest
 * @dev Library for building Functions requests
 */
library FunctionsRequest {
    struct Request {
        string codeLocation;
        string language;
        string source;
        bytes encryptedSecretsUrls;
        string[] args;
        bytes[] bytesArgs;
    }

    function initializeRequestForInlineJavaScript(
        Request memory self,
        string memory sourceCode
    ) internal pure {
        self.codeLocation = "inline";
        self.language = "JavaScript";
        self.source = sourceCode;
    }

    function setArgs(Request memory self, string[] memory args) internal pure {
        self.args = args;
    }

    function addSecretsReference(Request memory self, string memory secretsRef) internal pure {
        // Simplified implementation
    }

    function encodeCBOR(Request memory self) internal pure returns (bytes memory) {
        return abi.encode(self.source, self.args);
    }
} 