// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockEscrow
/// @notice Minimal mock of Escrow for testing SLAContract
/// @dev Only implements the interface methods that SLAContract needs
contract MockEscrow {
    function getStake(address node) external pure returns (uint256) {
        return 0;
    }

    function hasStaked(address node) external pure returns (bool) {
        return false;
    }
}