// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title INodeRegistry
/// @notice Interface for NodeRegistry contract events and function signatures
interface INodeRegistry {
    /// @notice Emitted when a node registers with the registry
    event NodeRegistered(address indexed node, uint256 stakeAmount);

    /// @notice Emitted when a node updates its stake
    event StakeUpdated(address indexed node, uint256 newStakeAmount);

    /// @notice Emitted when a node's status changes
    event NodeStatusChanged(address indexed node, NodeStatus oldStatus, NodeStatus newStatus);

    /// @notice Emitted when the minimum stake requirement is updated
    event MinStakeUpdated(uint256 oldMinStake, uint256 newMinStake);

    /// @notice Node status enum
    enum NodeStatus {
        Offline,
        Online,
        Stale,
        Slashed
    }

    /// @notice Node struct containing all node state
    struct Node {
        uint256 stakeAmount;       // Amount of collateral staked
        NodeStatus status;         // Current node status
        uint256 registeredAt;      // Registration timestamp
        uint256 lastHeartbeat;    // Last heartbeat timestamp
        int256 reputationScore;   // Node reputation (can be negative)
    }

    /// @notice Register a new node with initial stake
    /// @param initialStake The initial stake amount in wei
    function registerNode(uint256 initialStake) external payable;

    /// @notice Update node's stake amount (add more collateral)
    /// @param additionalStake Amount of additional stake to add
    function updateStake(uint256 additionalStake) external payable;

    /// @notice Withdraw stake (must not go below minimum)
    /// @param amount Amount to withdraw
    function withdrawStake(uint256 amount) external;

    /// @notice Update node status
    /// @param node Address of the node
    /// @param newStatus New status to set
    function updateNodeStatus(address node, NodeStatus newStatus) external;

    /// @notice Update last heartbeat timestamp
    /// @param node Address of the node
    function updateHeartbeat(address node) external;

    /// @notice Update node reputation score
    /// @param node Address of the node
    /// @param delta Change in reputation (positive or negative)
    function updateReputation(address node, int256 delta) external;

    /// @notice Get node information
    /// @param node Address of the node
    /// @return Node struct containing node state
    function getNode(address node) external view returns (Node memory);

    /// @notice Get node's current stake
    /// @param node Address of the node
    /// @return Stake amount in wei
    function getStake(address node) external view returns (uint256);

    /// @notice Get node's current status
    /// @param node Address of the node
    /// @return NodeStatus enum value
    function getNodeStatus(address node) external view returns (NodeStatus);

    /// @notice Get node's reputation score
    /// @param node Address of the node
    /// @return Reputation score
    function getReputation(address node) external view returns (int256);

    /// @notice Check if node is registered
    /// @param node Address of the node
    /// @return True if registered
    function isRegistered(address node) external view returns (bool);

    /// @notice Check if node meets minimum stake requirement
    /// @param node Address of the node
    /// @return True if stake >= minimum stake
    function meetsMinStake(address node) external view returns (bool);

    /// @notice Get minimum stake requirement
    /// @return Minimum stake in wei
    function getMinStake() external view returns (uint256);

    /// @notice Get all registered node addresses
    /// @return Array of node addresses
    function getAllNodes() external view returns (address[] memory);

    /// @notice Slash node stake (called by authorized slasher)
    /// @param node Address of the node to slash
    /// @param amount Amount to slash from stake
    /// @return Amount actually slashed
    function slashStake(address node, uint256 amount) external returns (uint256);
}

/// @title NodeRegistry
/// @notice Central registry for GPU compute nodes in the Tentrist protocol.
/// @dev Manages node registration, collateral staking, status tracking, and reputation.
///      All financial operations (staking, slashing) are enforced on-chain.
contract NodeRegistry is INodeRegistry {
    // solhint-disable-next-line const-name-snakecase
    uint256 public constant MIN_STAKE = 0.1 ether; // Minimum 0.1 ETH stake

    mapping(address => Node) private _nodes;
    mapping(address => bool) private _registered;
    address[] private _nodeList;
    uint256 private _minStake = MIN_STAKE;

    // Authorized callers (SlashManager, Heartbeat service)
    mapping(address => bool) private _authorizedCallers;

    modifier onlyAuthorized() {
        require(_authorizedCallers[msg.sender], "Caller not authorized");
        _;
    }

    modifier onlyRegistered(address node) {
        require(isRegistered(node), "Node not registered");
        _;
    }

    modifier onlyAboveMinStake(uint256 amount) {
        require(amount >= _minStake, "Below minimum stake");
        _;
    }

    constructor() {
        _authorizedCallers[msg.sender] = true;
    }

    /// @inheritdoc INodeRegistry
    function registerNode(uint256 initialStake) external payable override onlyAboveMinStake(initialStake) {
        require(!isRegistered(msg.sender), "Already registered");
        require(msg.value >= initialStake, "Incorrect ETH value");

        Node storage node = _nodes[msg.sender];
        node.stakeAmount = msg.value;
        node.status = NodeStatus.Online;
        node.registeredAt = block.timestamp;
        node.lastHeartbeat = block.timestamp;
        node.reputationScore = 0;

        _registered[msg.sender] = true;
        _nodeList.push(msg.sender);

        emit NodeRegistered(msg.sender, msg.value);
    }

    /// @inheritdoc INodeRegistry
    function updateStake(uint256 additionalStake) external payable override onlyRegistered(msg.sender) {
        require(msg.value >= additionalStake, "Incorrect ETH value");

        Node storage node = _nodes[msg.sender];
        node.stakeAmount += msg.value;

        emit StakeUpdated(msg.sender, node.stakeAmount);
    }

    /// @inheritdoc INodeRegistry
    function withdrawStake(uint256 amount) external override onlyRegistered(msg.sender) {
        Node storage node = _nodes[msg.sender];
        require(node.stakeAmount >= amount, "Insufficient stake");
        require(node.stakeAmount - amount >= _minStake, "Cannot go below minimum stake");

        node.stakeAmount -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit StakeUpdated(msg.sender, node.stakeAmount);
    }

    /// @inheritdoc INodeRegistry
    function updateNodeStatus(address node, NodeStatus newStatus) external override onlyAuthorized onlyRegistered(node) {
        NodeStatus oldStatus = _nodes[node].status;
        _nodes[node].status = newStatus;
        emit NodeStatusChanged(node, oldStatus, newStatus);
    }

    /// @inheritdoc INodeRegistry
    function updateHeartbeat(address node) external override onlyRegistered(node) {
        _nodes[node].lastHeartbeat = block.timestamp;
        if (_nodes[node].status == NodeStatus.Stale) {
            _nodes[node].status = NodeStatus.Online;
        }
    }

    /// @inheritdoc INodeRegistry
    function updateReputation(address node, int256 delta) external override onlyAuthorized onlyRegistered(node) {
        Node storage n = _nodes[node];
        n.reputationScore += delta;
        emit StakeUpdated(node, n.stakeAmount); // reuse event for reputation tracking
    }

    /// @inheritdoc INodeRegistry
    function getNode(address node) external view override onlyRegistered(node) returns (Node memory) {
        return _nodes[node];
    }

    /// @inheritdoc INodeRegistry
    function getStake(address node) external view override returns (uint256) {
        if (!isRegistered(node)) return 0;
        return _nodes[node].stakeAmount;
    }

    /// @inheritdoc INodeRegistry
    function getNodeStatus(address node) external view override returns (NodeStatus) {
        if (!isRegistered(node)) return NodeStatus.Offline;
        return _nodes[node].status;
    }

    /// @inheritdoc INodeRegistry
    function getReputation(address node) external view override returns (int256) {
        if (!isRegistered(node)) return 0;
        return _nodes[node].reputationScore;
    }

    /// @inheritdoc INodeRegistry
    function isRegistered(address node) public view override returns (bool) {
        return _registered[node];
    }

    /// @inheritdoc INodeRegistry
    function meetsMinStake(address node) external view override returns (bool) {
        if (!isRegistered(node)) return false;
        return _nodes[node].stakeAmount >= _minStake;
    }

    /// @inheritdoc INodeRegistry
    function getMinStake() external view override returns (uint256) {
        return _minStake;
    }

    /// @inheritdoc INodeRegistry
    function getAllNodes() external view override returns (address[] memory) {
        return _nodeList;
    }

    /// @inheritdoc INodeRegistry
    function slashStake(address node, uint256 amount) external override onlyAuthorized onlyRegistered(node) returns (uint256) {
        Node storage n = _nodes[node];
        uint256 slashAmount = amount > n.stakeAmount ? n.stakeAmount : amount;
        n.stakeAmount -= slashAmount;
        n.status = NodeStatus.Slashed;
        emit NodeStatusChanged(node, NodeStatus.Online, NodeStatus.Slashed);
        return slashAmount;
    }

    /// @notice Authorize a caller (e.g., SlashManager, Heartbeat)
    /// @param caller Address to authorize
    function authorizeCaller(address caller) external {
        _authorizedCallers[caller] = true;
    }

    /// @notice Revoke caller authorization
    /// @param caller Address to revoke
    function revokeCaller(address caller) external {
        _authorizedCallers[caller] = false;
    }

    /// @notice Update minimum stake requirement
    /// @param newMinStake New minimum stake in wei
    function updateMinStake(uint256 newMinStake) external {
        uint256 oldMinStake = _minStake;
        _minStake = newMinStake;
        emit MinStakeUpdated(oldMinStake, newMinStake);
    }
}