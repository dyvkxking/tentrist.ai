// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockEscrowForSlash
/// @notice Minimal mock of Escrow for testing SlashManager
/// @dev Implements only the interface methods that SlashManager needs
contract MockEscrowForSlash {
    mapping(address => uint256) private _stakes;
    uint256 private _totalSlashed;

    // Slashed events for testing
    event SlashExecuted(address indexed node, uint256 amount, string reason);

    function slash(address node, uint256 amount, string calldata reason) external returns (bool) {
        uint256 actualSlash = amount > _stakes[node] ? _stakes[node] : amount;
        _stakes[node] -= actualSlash;
        _totalSlashed += actualSlash;
        emit SlashExecuted(node, actualSlash, reason);
        return true;
    }

    function getStake(address node) external view returns (uint256) {
        return _stakes[node];
    }

    // Test helper to set stake
    function setStake(address node, uint256 amount) external {
        _stakes[node] = amount;
    }

    // Test helper to get total slashed
    function getTotalSlashed() external view returns (uint256) {
        return _totalSlashed;
    }

    // Receive ether for slashing
    receive() external payable {}
}