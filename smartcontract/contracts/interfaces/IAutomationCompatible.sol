// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AutomationCompatibleInterface
 * @dev Interface for Chainlink Automation compatible contracts
 */
interface AutomationCompatibleInterface {
    /**
     * @notice Check if upkeep is needed
     * @param checkData data passed to the contract when checking for upkeep
     * @return upkeepNeeded whether upkeep is needed
     * @return performData data that should be passed to performUpkeep
     */
    function checkUpkeep(bytes calldata checkData)
        external
        view
        returns (bool upkeepNeeded, bytes memory performData);

    /**
     * @notice Perform the upkeep
     * @param performData data that was returned by checkUpkeep
     */
    function performUpkeep(bytes calldata performData) external;
} 