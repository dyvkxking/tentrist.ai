// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IReputationLedger
/// @notice Interface for ReputationLedger — tracks node reputation scores
interface IReputationLedger {
    /// @notice Emitted when a node's reputation is updated
    event ReputationUpdated(
        address indexed node,
        int256 delta,
        uint256 newScore,
        uint256 timestamp
    );

    /// @notice Increment a node's reputation score
    /// @param node Address of the node
    /// @param delta Amount to increment (positive value)
    function incrementReputation(address node, int256 delta) external;

    /// @notice Decrement a node's reputation score
    /// @param node Address of the node
    /// @param delta Amount to decrement (positive value)
    function decrementReputation(address node, int256 delta) external;

    /// @notice Get a node's current reputation score
    /// @param node Address of the node
    /// @return Reputation score (can be negative)
    function getReputation(address node) external view returns (int256);

    /// @notice Get the last update timestamp for a node
    /// @param node Address of the node
    /// @return Last update timestamp
    function getLastUpdate(address node) external view returns (uint256);

    /// @notice Check if a node exists in the ledger
    /// @param node Address of the node
    /// @return True if node has been initialized
    function hasReputation(address node) external view returns (bool);

    /// @notice Apply decay to a node's reputation (penalizes inactivity)
    /// @param node Address of the node
    function applyDecay(address node) external;

    /// @notice Batch apply decay to multiple nodes
    /// @param nodes Array of node addresses
    function batchApplyDecay(address[] calldata nodes) external;

    /// @notice Get the decay rate
    /// @return Decay rate in basis points (e.g., 100 = 1%)
    function getDecayRate() external view returns (uint256);

    /// @notice Get the minimum reputation
    /// @return Minimum reputation value
    function getMinReputation() external view returns (int256);

    /// @notice Get the maximum reputation
    /// @return Maximum reputation value
    function getMaxReputation() external view returns (int256);
}

/// @title ReputationLedger
/// @notice Tracks reputation scores for GPU compute nodes in the Tentrist protocol.
/// @dev Reputation increases with successful job completion, decreases with failures.
///      Optional decay mechanism penalizes long periods of inactivity.
contract ReputationLedger is IReputationLedger {
    /// @notice Maximum reputation score
    int256 public constant MAX_REPUTATION = 10000;

    /// @notice Minimum reputation score (can go negative due to slashing)
    int256 public constant MIN_REPUTATION = -1000;

    /// @notice Initial reputation for new nodes
    int256 public constant INITIAL_REPUTATION = 100;

    /// @notice Decay rate in basis points (100 = 1% per decay period)
    uint256 public constant DECAY_RATE = 100; // 1% per period

    /// @notice Time period for decay (30 days in seconds)
    uint256 public constant DECAY_PERIOD = 30 days;

    /// @notice Maps node address to reputation score
    mapping(address => int256) public reputationScore;

    /// @notice Maps node address to last update timestamp
    mapping(address => uint256) public lastUpdate;

    /// @notice Maps node address to registration timestamp
    mapping(address => uint256) public registeredAt;

    /// @notice Authorized callers (SlashManager, heartbeat service)
    mapping(address => bool) private _authorizedCallers;

    modifier onlyAuthorized() {
        require(_authorizedCallers[msg.sender], "Caller not authorized");
        _;
    }

    modifier onlyPositiveDelta(int256 delta) {
        require(delta > 0, "Delta must be positive");
        _;
    }

    constructor() {
        _authorizedCallers[msg.sender] = true;
    }

    /// @notice Initialize a node's reputation (called when node first stakes)
    /// @param node Address of the node
    function initializeNode(address node) external onlyAuthorized {
        require(node != address(0), "Node address cannot be zero");
        if (!hasReputation(node)) {
            reputationScore[node] = INITIAL_REPUTATION;
        }
        registeredAt[node] = block.timestamp;
        lastUpdate[node] = block.timestamp;
    }

    /// @inheritdoc IReputationLedger
    function incrementReputation(address node, int256 delta)
        external
        override
        onlyAuthorized
        onlyPositiveDelta(delta)
    {
        _updateReputation(node, delta);
    }

    /// @inheritdoc IReputationLedger
    function decrementReputation(address node, int256 delta)
        external
        override
        onlyAuthorized
        onlyPositiveDelta(delta)
    {
        _updateReputation(node, -int256(delta));
    }

    /// @notice Internal reputation update logic
    /// @param node Address of the node
    /// @param delta Change in reputation (positive or negative)
    function _updateReputation(address node, int256 delta) internal {
        require(node != address(0), "Node address cannot be zero");

        // Initialize if first time
        if (!hasReputation(node)) {
            reputationScore[node] = INITIAL_REPUTATION;
        }

        // Apply delta
        int256 newScore = reputationScore[node] + delta;

        // Clamp to min/max
        if (newScore > MAX_REPUTATION) {
            newScore = MAX_REPUTATION;
        } else if (newScore < MIN_REPUTATION) {
            newScore = MIN_REPUTATION;
        }

        reputationScore[node] = newScore;
        lastUpdate[node] = block.timestamp;

        emit ReputationUpdated(node, delta, uint256(newScore), block.timestamp);
    }

    /// @inheritdoc IReputationLedger
    function getReputation(address node) external view override returns (int256) {
        if (!hasReputation(node)) {
            return 0;
        }
        return reputationScore[node];
    }

    /// @inheritdoc IReputationLedger
    function getLastUpdate(address node) external view override returns (uint256) {
        return lastUpdate[node];
    }

    /// @inheritdoc IReputationLedger
    function hasReputation(address node) public view override returns (bool) {
        return lastUpdate[node] > 0;
    }

    /// @inheritdoc IReputationLedger
    function applyDecay(address node) external override {
        require(node != address(0), "Node address cannot be zero");
        require(hasReputation(node), "Node has no reputation");

        // Calculate time since last update
        uint256 timePassed = block.timestamp - lastUpdate[node];

        // Only apply decay if more than one decay period has passed
        if (timePassed >= DECAY_PERIOD) {
            uint256 periods = timePassed / DECAY_PERIOD;

            // Calculate decay amount
            // Decay is exponential: score * (decayRate/10000)^periods
            int256 decayFactor = int256(10000 - (DECAY_RATE * periods));
            if (decayFactor < 0) {
                decayFactor = 0;
            }

            int256 oldScore = reputationScore[node];
            int256 newScore = (oldScore * decayFactor) / 10000;

            // Ensure we don't go below minimum
            if (newScore < MIN_REPUTATION) {
                newScore = MIN_REPUTATION;
            }

            int256 delta = newScore - oldScore;
            reputationScore[node] = newScore;
            lastUpdate[node] = block.timestamp;

            emit ReputationUpdated(node, delta, uint256(newScore), block.timestamp);
        }
    }

    /// @inheritdoc IReputationLedger
    function batchApplyDecay(address[] calldata nodes) external override {
        for (uint256 i = 0; i < nodes.length; i++) {
            this.applyDecay(nodes[i]);
        }
    }

    /// @inheritdoc IReputationLedger
    function getDecayRate() external pure override returns (uint256) {
        return DECAY_RATE;
    }

    /// @inheritdoc IReputationLedger
    function getMinReputation() external pure override returns (int256) {
        return MIN_REPUTATION;
    }

    /// @inheritdoc IReputationLedger
    function getMaxReputation() external pure override returns (int256) {
        return MAX_REPUTATION;
    }

    /// @notice Get the initial reputation for new nodes
    /// @return Initial reputation value
    function getInitialReputation() external pure returns (int256) {
        return INITIAL_REPUTATION;
    }

    /// @notice Get the decay period in seconds
    /// @return Decay period
    function getDecayPeriod() external pure returns (uint256) {
        return DECAY_PERIOD;
    }

    /// @notice Authorize a caller (e.g., SlashManager, heartbeat service)
    /// @param caller Address to authorize
    function authorizeCaller(address caller) external {
        _authorizedCallers[caller] = true;
    }

    /// @notice Revoke caller authorization
    /// @param caller Address to revoke
    function revokeCaller(address caller) external {
        _authorizedCallers[caller] = false;
    }

    /// @notice Check if a caller is authorized
    /// @param caller Address to check
    /// @return True if authorized
    function isAuthorized(address caller) external view returns (bool) {
        return _authorizedCallers[caller];
    }

    /// @notice Get reputation tier based on score
    /// @param node Address of the node
    /// @return Tier string (Excellent/Good/Fair/Poor/Critical)
    function getReputationTier(address node) external view returns (string memory) {
        int256 score = this.getReputation(node);
        if (score >= 5000) return "Excellent";
        if (score >= 2500) return "Good";
        if (score >= 1000) return "Fair";
        if (score >= 0) return "Poor";
        return "Critical";
    }
}