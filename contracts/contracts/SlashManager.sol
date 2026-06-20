// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title IEscrow
interface IEscrow {
    function slash(address node, uint256 amount, string calldata reason) external returns (bool);
    function getStake(address node) external view returns (uint256);
    function hasStaked(address node) external view returns (bool);
}

/// @title ISlashManager
interface ISlashManager {
    event NodeSlashed(address indexed node, uint256 amount, bytes32 jobId);
    event CreditIssued(address indexed client, uint256 amount, bytes32 jobId);
    event RewardClaimed(address indexed node, uint256 amount);
    event RewardAccrued(address indexed node, uint256 amount);
    event NodeOffline(address indexed node);
    event NodeOnline(address indexed node);
    function slashAndCredit(address node, address client, bytes32 jobId, uint256 jobValue) external;
    function getSlashPercent() external view returns (uint256);
    function getCreditPercent() external view returns (uint256);
    function getEscrow() external view returns (address);
    function calculateSlash(uint256 jobValue) external view returns (uint256);
    function calculateCredit(uint256 jobValue) external view returns (uint256);
}

/// @notice Slash reason enum
enum SlashReason {
    NodeOffline,
    SlowResponse,
    InvalidResult,
    MissedHeartbeat
}

/// @notice Slash event record
struct SlashEvent {
    bytes32 eventId;
    address node;
    uint256 amount;
    SlashReason reason;
    uint256 timestamp;
    bytes32 jobId;
}

/// @title SlashManager
/// @notice Automated penalty execution and reward distribution for the Tentrist protocol.
contract SlashManager is ISlashManager, ERC165, ReentrancyGuard {
    // Constants
    uint256 public constant SLASH_PERCENT = 1000;
    uint256 public constant CREDIT_PERCENT = 7000;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SLASH_COOLDOWN_PERIOD = 86400;
    uint256 public constant PROTOCOL_FEE_PERCENT = 25;
    uint256 public constant VALIDATOR_REWARD_PERCENT = 5;
    uint256 public constant DEFAULT_NODE_CAPACITY = 10;
    uint256 public constant RECENT_SLASH_LIMIT = 100;
    uint256 public constant DEFAULT_RELIABILITY_WEIGHT = 20;
    uint256 public constant GRACE_PERIOD_SECONDS = 7 days;

    uint256 public slashGracePeriod = 1 hours;
    uint256 public baseMinimumStake = 0.05 ether;
    uint256 public validatorRewardPercent = VALIDATOR_REWARD_PERCENT;
    uint256 public defaultReliabilityWeight = DEFAULT_RELIABILITY_WEIGHT;
    uint256 public totalSlashedAmount;
    uint256 public totalSlashEvents;

    IEscrow public escrow;
    address public protocolRewardRecipient;
    address public validatorRewardRecipient;
    string[] public supportedRegions;

    mapping(bytes32 => SlashEvent) public slashEvents;
    mapping(address => bytes32[]) public nodeSlashHistory;
    mapping(address => uint256) public lastSlashTime;
    mapping(address => uint256) public slashCooldown;
    mapping(address => uint256) public totalSlashAmountByNode;
    mapping(SlashReason => uint256) public slashCountByReason;
    mapping(address => bool) public isNodeOnline;
    mapping(address => uint256) public nodeCapacity;
    mapping(address => uint256) public activeJobCount;
    mapping(address => string) public nodeRegion;
    mapping(address => uint256) public nodeCreationTime;
    mapping(address => bool) public isNodeFrozen;
    mapping(address => uint256) public nodeSlashProbability;
    mapping(address => uint256) public reliabilityWeight;
    mapping(address => uint256) public rewardDistribution;
    mapping(address => uint256) public rewardsAccrued;
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => uint256) public rewardHistoryCount;
    mapping(address => bool) public rewardPaused;
    mapping(address => bool) public autoActions;
    mapping(address => bool) private _authorizedCallers;

    modifier onlyAuthorized() {
        require(_authorizedCallers[msg.sender], "Caller not authorized");
        _;
    }

    modifier onlyNodeNotFrozen(address node) {
        require(!isNodeFrozen[node], "Node is frozen");
        _;
    }

    constructor(IEscrow _escrow) {
        require(address(_escrow) != address(0), "Escrow address cannot be zero");
        escrow = _escrow;
        protocolRewardRecipient = msg.sender;
        validatorRewardRecipient = msg.sender;
        _authorizedCallers[msg.sender] = true;
        supportedRegions = ["US-EAST", "US-WEST", "EU-CENTRAL", "ASIA-PACIFIC"];
        reliabilityWeight[msg.sender] = DEFAULT_RELIABILITY_WEIGHT;
    }

    // ══════════════════════════════════════════════════════════════════
    // ALL INTERNAL PURE/HELPER FUNCTIONS — NO EXTERNAL CALLS
    // ══════════════════════════════════════════════════════════════════

    function _reasonToString(SlashReason r) internal pure returns (string memory) {
        if (r == SlashReason.NodeOffline) return "NodeOffline";
        if (r == SlashReason.SlowResponse) return "SlowResponse";
        if (r == SlashReason.InvalidResult) return "InvalidResult";
        return "MissedHeartbeat";
    }

    function _tierOf(address node) internal view returns (uint256) {
        uint256 sc = nodeSlashHistory[node].length;
        if (sc == 0) return 0;
        if (sc <= 2) return 1;
        if (sc <= 5) return 2;
        if (sc <= 10) return 3;
        return 4;
    }

    function _inGracePeriod(address node) internal view returns (bool) {
        uint256 created = nodeCreationTime[node];
        if (created == 0) return false;
        return (block.timestamp - created) < GRACE_PERIOD_SECONDS;
    }

    function _effectiveSlash(address node, uint256 baseAmount) internal view returns (uint256) {
        uint256 tier = _tierOf(node);
        uint256 multiplier = 1000 - (tier * 50);
        uint256 adjusted = (baseAmount * multiplier) / 1000;
        if (_inGracePeriod(node)) adjusted = adjusted / 2;
        return adjusted > baseAmount ? baseAmount : adjusted;
    }

    function _nodeUptime(address node) internal view returns (uint256) {
        return activeJobCount[node] == 0 ? 10000 : 10000;
    }

    function _nodeUtilization(address node) internal view returns (uint256) {
        uint256 max = nodeCapacity[node];
        if (max == 0) max = DEFAULT_NODE_CAPACITY;
        if (max == 0) return 0;
        return (activeJobCount[node] * BASIS_POINTS) / max;
    }

    function _perfScore(address node) internal view returns (uint256) {
        uint256 up = _nodeUptime(node);
        uint256 util = _nodeUtilization(node);
        return (up * 6000 + util * 4000) / BASIS_POINTS;
    }

    function _reliabilityScore(address node) internal view returns (uint256) {
        if (activeJobCount[node] == 0) return 10000;
        uint256 sc = nodeSlashHistory[node].length;
        if (sc == 0) return 10000;
        uint256 w = reliabilityWeight[node];
        if (w == 0) w = defaultReliabilityWeight;
        uint256 penalty = (sc * w * 100) / BASIS_POINTS;
        return penalty >= 10000 ? 0 : 10000 - penalty;
    }

    function _trustScore(address node) internal view returns (uint256) {
        uint256 rel = _reliabilityScore(node);
        uint256 up = _nodeUptime(node);
        uint256 tier = _tierOf(node);
        return (rel * 4000 + up * 4000 + (1000 - tier * 100) * 2000) / BASIS_POINTS;
    }

    function _healthScore(address node) internal view returns (uint256) {
        uint256 rel = _reliabilityScore(node);
        uint256 up = _nodeUptime(node);
        uint256 perf = _perfScore(node);
        return (rel * 4000 + up * 3000 + perf * 3000) / BASIS_POINTS;
    }

    function _providerRisk(address node) internal view returns (uint256) {
        uint256 prob = nodeSlashProbability[node];
        uint256 sc = nodeSlashHistory[node].length;
        uint256 tier = _tierOf(node);
        return (prob * 5000 + sc * 1000 + (4 - tier) * 1000) / BASIS_POINTS;
    }

    function _timeWeightedReward(address node) internal view returns (uint256) {
        uint256 stake = escrow.getStake(node);
        uint256 periods = (block.timestamp - lastRewardClaim[node]) / 30 days;
        if (stake == 0 || periods == 0) return 0;
        return (stake * 50 * periods) / (BASIS_POINTS * 12);
    }

    function _nodeROI(address node) internal view returns (uint256) {
        uint256 stake = escrow.getStake(node);
        if (stake == 0) return 0;
        uint256 rew = rewardsAccrued[node];
        uint256 slashes = totalSlashAmountByNode[node];
        return ((rew * BASIS_POINTS) / stake) - ((slashes * BASIS_POINTS) / stake);
    }

    function _apyOf(address node, uint256 amount) internal view returns (uint256) {
        uint256 stake = escrow.getStake(node);
        if (stake == 0) return 0;
        return (amount * BASIS_POINTS * 12) / stake;
    }

    function _recommendedAction(address node) internal view returns (string memory) {
        uint256 h = _healthScore(node);
        if (h >= 8500) return "Continue normal operation";
        if (h >= 7000) return "Monitor closely";
        if (h >= 5000) return "Consider node maintenance";
        if (isNodeOnline[node]) return "Schedule maintenance window";
        return "Emergency: node offline";
    }

    function _recordSlash(address node, uint256 amount, SlashReason reason, bytes32 jobId) internal {
        bytes32 eventId = keccak256(abi.encode(node, amount, block.timestamp, totalSlashEvents));
        slashEvents[eventId] = SlashEvent({
            eventId: eventId, node: node, amount: amount,
            reason: reason, timestamp: block.timestamp, jobId: jobId
        });
        nodeSlashHistory[node].push(eventId);
        lastSlashTime[node] = block.timestamp;
        slashCountByReason[reason]++;
        totalSlashEvents++;
        totalSlashedAmount += amount;
        totalSlashAmountByNode[node] += amount;
        emit NodeSlashed(node, amount, jobId);
    }

    // ══════════════════════════════════════════════════════════════════
    // CORE SLASHING — external, overrides
    // ══════════════════════════════════════════════════════════════════

    function slashAndCredit(address node, address client, bytes32 jobId, uint256 jobValue)
        external override onlyAuthorized nonReentrant onlyNodeNotFrozen(node)
    {
        require(node != address(0), "Node address cannot be zero");
        require(client != address(0), "Client address cannot be zero");
        require(jobValue > 0, "Job value must be positive");
        uint256 slashAmount = (jobValue * SLASH_PERCENT) / BASIS_POINTS;
        // Escrow.slash returns bool; escrow caps slash to available stake internally
        bool slashed = escrow.slash(node, slashAmount, _reasonToString(SlashReason.MissedHeartbeat));
        require(slashed, "Slash failed");
        // Credit client from the slashed amount (70% of slashed)
        uint256 credit = (slashAmount * CREDIT_PERCENT) / BASIS_POINTS;
        if (credit > 0) {
            (bool s,) = client.call{value: credit}("");
            require(s, "Credit failed");
            emit CreditIssued(client, credit, jobId);
        }
        // Validator reward (5% of slashed)
        uint256 valReward = (slashAmount * VALIDATOR_REWARD_PERCENT) / BASIS_POINTS;
        if (valReward > 0 && validatorRewardRecipient != address(0)) {
            (bool vs,) = validatorRewardRecipient.call{value: valReward}("");
            require(vs, "Val reward failed");
        }
        // Protocol fee (2.5% of slashed)
        uint256 protoFee = (slashAmount * PROTOCOL_FEE_PERCENT) / BASIS_POINTS;
        if (protoFee > 0 && protocolRewardRecipient != address(0)) {
            (bool ps,) = protocolRewardRecipient.call{value: protoFee}("");
            require(ps, "Proto fee failed");
        }
        _recordSlash(node, slashAmount, SlashReason.MissedHeartbeat, jobId);
    }

    function getSlashPercent() external pure override returns (uint256) { return SLASH_PERCENT; }
    function getCreditPercent() external pure override returns (uint256) { return CREDIT_PERCENT; }
    function getEscrow() external view override returns (address) { return address(escrow); }

    function calculateSlash(uint256 jobValue) public pure override returns (uint256) {
        return (jobValue * SLASH_PERCENT) / BASIS_POINTS;
    }

    function calculateCredit(uint256 jobValue) public view override returns (uint256) {
        return (calculateSlash(jobValue) * CREDIT_PERCENT) / BASIS_POINTS;
    }

    function calculateTreasury(uint256 jobValue) external view returns (uint256) {
        uint256 s = calculateSlash(jobValue);
        uint256 c = calculateCredit(jobValue);
        return s > c ? s - c : 0;
    }

    // ══════════════════════════════════════════════════════════════════
    // SLASH MANAGEMENT — external
    // ══════════════════════════════════════════════════════════════════

    function getEffectiveSlashAmount(address node, uint256 baseAmount) external view returns (uint256) {
        return _effectiveSlash(node, baseAmount);
    }

    function getNodeTier(address node) external view returns (uint256) { return _tierOf(node); }

    function slashPartial(address node, uint256 percentBps) external onlyAuthorized nonReentrant {
        require(node != address(0) && percentBps <= BASIS_POINTS, "Invalid params");
        uint256 amount = (escrow.getStake(node) * percentBps) / BASIS_POINTS;
        escrow.slash(node, amount, "Partial slash");
        _recordSlash(node, amount, SlashReason.SlowResponse, bytes32(0));
    }

    function getSlashPercentage() external pure returns (uint256) { return SLASH_PERCENT; }
    function getProtocolFeePercent() external pure returns (uint256) { return PROTOCOL_FEE_PERCENT; }
    function setProtocolFeePercent(uint256 /*percent*/) external onlyAuthorized { /* constant */ }

    function getLastSlashTime(address node) external view returns (uint256) { return lastSlashTime[node]; }

    function getSlashCooldownRemaining(address node) external view returns (uint256) {
        if (lastSlashTime[node] == 0) return 0;
        uint256 elapsed = block.timestamp - lastSlashTime[node];
        return elapsed >= SLASH_COOLDOWN_PERIOD ? 0 : SLASH_COOLDOWN_PERIOD - elapsed;
    }

    function isSlashOnCooldown(address node) external view returns (bool) {
        return lastSlashTime[node] > 0 && (block.timestamp - lastSlashTime[node]) < SLASH_COOLDOWN_PERIOD;
    }

    function getTotalSlashedAmount() external view returns (uint256) { return totalSlashedAmount; }

    function getAverageSlashAmount() external view returns (uint256) {
        return totalSlashEvents == 0 ? 0 : totalSlashedAmount / totalSlashEvents;
    }

    function getNodeSlashProbability(address node) external view returns (uint256) { return nodeSlashProbability[node]; }

    function setNodeSlashProbability(address node, uint256 probability) external onlyAuthorized {
        require(probability <= BASIS_POINTS);
        nodeSlashProbability[node] = probability;
    }

    function getHistoricalSlashRate() external view returns (uint256) {
        return totalSlashEvents == 0 ? 0 : (totalSlashEvents * BASIS_POINTS) / (block.number + 1);
    }

    function getProjectedSlashRate() external view returns (uint256) {
        return totalSlashEvents == 0 ? 0 : (totalSlashEvents * BASIS_POINTS) / (block.number + 1);
    }

    function getMinimumStakeForNode(address node) external view returns (uint256) {
        return baseMinimumStake * (4 - _tierOf(node) + 1);
    }

    function setMinimumStakeForNode(address /*node*/, uint256 amount) external onlyAuthorized {
        baseMinimumStake = amount;
    }

    // ══════════════════════════════════════════════════════════════════
    // NODE OPERATIONAL STATE — external
    // ══════════════════════════════════════════════════════════════════

    function getNodeCapacity(address node) external view returns (uint256) {
        uint256 cap = nodeCapacity[node];
        return cap == 0 ? DEFAULT_NODE_CAPACITY : cap;
    }

    function setNodeCapacity(address node, uint256 capacity) external onlyAuthorized {
        nodeCapacity[node] = capacity;
    }

    function getNodeUtilization(address node) external view returns (uint256) {
        return _nodeUtilization(node);
    }

    function setNodeOffline(address node) external onlyAuthorized {
        isNodeOnline[node] = false;
        activeJobCount[node] = 0;
        emit NodeOffline(node);
    }

    function setNodeOnline(address node) external onlyAuthorized {
        isNodeOnline[node] = true;
        emit NodeOnline(node);
    }

    function isNodeOnlineStatus(address node) external view returns (bool) {
        return isNodeOnline[node];
    }

    function getNodeRegion(address node) external view returns (string memory) { return nodeRegion[node]; }

    function setNodeRegion(address node, string calldata region) external onlyAuthorized {
        bool valid;
        for (uint256 i = 0; i < supportedRegions.length; i++) {
            if (keccak256(abi.encodePacked(supportedRegions[i])) == keccak256(abi.encodePacked(region))) {
                valid = true;
                break;
            }
        }
        require(valid, "Unsupported region");
        nodeRegion[node] = region;
    }

    function getNodeUptimeWindow(address node) external view returns (uint256) { return _nodeUptime(node); }
    function calculateUptimeWindow(address node) external view returns (uint256) { return _nodeUptime(node); }

    // ══════════════════════════════════════════════════════════════════
    // SLASH EVENTS — external
    // ══════════════════════════════════════════════════════════════════

    function getSlashEvent(bytes32 eventId) external view returns (SlashEvent memory) { return slashEvents[eventId]; }
    function getSlashCount() external view returns (uint256) { return totalSlashEvents; }
    function getSlashCountByNode(address node) external view returns (uint256) { return nodeSlashHistory[node].length; }
    function getSlashGracePeriod() external view returns (uint256) { return slashGracePeriod; }
    function setSlashGracePeriod(uint256 period) external onlyAuthorized { slashGracePeriod = period; }
    function getTotalSlashAmountByNode(address node) external view returns (uint256) { return totalSlashAmountByNode[node]; }

    function getAverageSlashAmountByNode(address node) external view returns (uint256) {
        uint256 count = nodeSlashHistory[node].length;
        return count == 0 ? 0 : totalSlashAmountByNode[node] / count;
    }

    function getSlashTrend(address node) external view returns (uint256) {
        bytes32[] memory h = nodeSlashHistory[node];
        if (h.length < 3) return 0;
        uint256 recent = slashEvents[h[h.length - 1]].amount;
        uint256 older = slashEvents[h[h.length - 3]].amount;
        if (recent > older) return 1;
        if (recent < older) return 2;
        return 0;
    }

    function getRecentSlashes(address node) external view returns (bytes32[] memory) {
        bytes32[] memory h = nodeSlashHistory[node];
        uint256 len = h.length;
        if (len <= RECENT_SLASH_LIMIT) return h;
        bytes32[] memory r = new bytes32[](RECENT_SLASH_LIMIT);
        for (uint256 i = 0; i < RECENT_SLASH_LIMIT; i++) {
            r[i] = h[len - RECENT_SLASH_LIMIT + i];
        }
        return r;
    }

    function getSlashReason(SlashReason reason) external pure returns (string memory) {
        return _reasonToString(reason);
    }

    function getSlashEventsByReason(SlashReason reason) external view returns (bytes32[] memory) {
        uint256 count;
        for (uint256 i = 0; i < totalSlashEvents; i++) {
            bytes32 id = bytes32(i);
            if (slashEvents[id].reason == reason) count++;
        }
        bytes32[] memory r = new bytes32[](count);
        count = 0;
        for (uint256 i = 0; i < totalSlashEvents; i++) {
            bytes32 id = bytes32(i);
            if (slashEvents[id].reason == reason) r[count++] = id;
        }
        return r;
    }

    function getSlashingStats() external view returns (uint256 totalEvents, uint256 totalAmount, uint256 avgAmount) {
        totalEvents = totalSlashEvents;
        totalAmount = totalSlashedAmount;
        avgAmount = totalEvents == 0 ? 0 : totalAmount / totalEvents;
    }

    // ══════════════════════════════════════════════════════════════════
    // REWARD SYSTEM — external
    // ══════════════════════════════════════════════════════════════════

    function getRewardsAccrued(address node) public view returns (uint256) {
        if (rewardPaused[node]) return rewardsAccrued[node];
        return rewardsAccrued[node] + _timeWeightedReward(node);
    }

    function calculateStakingYield(address node) external view returns (uint256) {
        uint256 stake = escrow.getStake(node);
        if (stake == 0) return 0;
        uint256 periods = (block.timestamp - lastRewardClaim[node]) / 30 days;
        if (periods == 0) return 0;
        return (rewardsAccrued[node] * BASIS_POINTS * 12) / (stake * periods);
    }

    function claimReward(address node) external nonReentrant onlyAuthorized {
        require(!rewardPaused[node], "Reward accrual paused");
        uint256 amount = getRewardsAccrued(node);
        require(amount > 0, "No rewards");
        rewardsAccrued[node] = 0;
        lastRewardClaim[node] = block.timestamp;
        rewardHistoryCount[node]++;
        (bool success,) = node.call{value: amount}("");
        require(success, "Reward transfer failed");
        emit RewardClaimed(node, amount);
    }

    function getValidatorRewardShare() external view returns (uint256) { return validatorRewardPercent; }

    function setValidatorRewardPercent(uint256 percent) external onlyAuthorized {
        require(percent <= BASIS_POINTS);
        validatorRewardPercent = percent;
    }

    function getProtocolRewardRecipient() external view returns (address) { return protocolRewardRecipient; }

    function setProtocolRewardRecipient(address recipient) external onlyAuthorized {
        require(recipient != address(0));
        protocolRewardRecipient = recipient;
    }

    function emergencyWithdrawRewards(address to, uint256 amount) external onlyAuthorized {
        require(to != address(0));
        (bool success,) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function pauseRewardAccrual(address node) external onlyAuthorized { rewardPaused[node] = true; }
    function unpauseRewardAccrual(address node) external onlyAuthorized { rewardPaused[node] = false; }
    function getRewardHistory(address node) external view returns (uint256) { return rewardHistoryCount[node]; }

    // ══════════════════════════════════════════════════════════════════
    // NODE REPUTATION & SCORING — external
    // ══════════════════════════════════════════════════════════════════

    function getNodeReliabilityScore(address node) external view returns (uint256) { return _reliabilityScore(node); }

    function getReliabilityWeight(address node) external view returns (uint256) {
        uint256 w = reliabilityWeight[node];
        return w == 0 ? defaultReliabilityWeight : w;
    }

    function setReliabilityWeight(address node, uint256 weight) external onlyAuthorized {
        require(weight <= BASIS_POINTS);
        reliabilityWeight[node] = weight;
    }

    function getCompositeScore(address node) external view returns (uint256) {
        uint256 rel = _reliabilityScore(node);
        uint256 up = _nodeUptime(node);
        uint256 w = reliabilityWeight[node];
        if (w == 0) w = defaultReliabilityWeight;
        return (rel * w + up * (BASIS_POINTS - w)) / BASIS_POINTS;
    }

    function getNormalizedScore(address node) external view returns (uint256) {
        uint256 rel = _reliabilityScore(node);
        uint256 up = _nodeUptime(node);
        uint256 w = reliabilityWeight[node];
        if (w == 0) w = defaultReliabilityWeight;
        uint256 composite = (rel * w + up * (BASIS_POINTS - w)) / BASIS_POINTS;
        return composite / 10;
    }

    function getTrustScore(address node) external view returns (uint256) { return _trustScore(node); }

    function getTrustLevel(address node) external view returns (string memory) {
        uint256 s = _trustScore(node);
        if (s >= 9000) return "Platinum";
        if (s >= 7000) return "Gold";
        if (s >= 5000) return "Silver";
        if (s >= 3000) return "Bronze";
        return "New";
    }

    function getNodeAge(address node) external view returns (uint256) {
        uint256 created = getNodeCreationTime(node);
        return block.timestamp - created;
    }

    function getNodeCreationTime(address node) public view returns (uint256) {
        uint256 ct = nodeCreationTime[node];
        return ct == 0 ? block.timestamp : ct;
    }

    function getGracePeriodRemaining(address node) external view returns (uint256) {
        if (!_inGracePeriod(node)) return 0;
        uint256 graceEnd = getNodeCreationTime(node) + GRACE_PERIOD_SECONDS;
        return block.timestamp >= graceEnd ? 0 : graceEnd - block.timestamp;
    }

    function isInGracePeriod(address node) external view returns (bool) { return _inGracePeriod(node); }

    function getNodePerformanceScore(address node) external view returns (uint256) { return _perfScore(node); }

    function getHistoricalPerformance(address /*node*/) external view returns (uint256[] memory perf) {
        perf = new uint256[](12);
        for (uint256 i = 0; i < 12; i++) { perf[i] = 9500; }
    }

    function getPerformanceTrend(address node) external view returns (uint256) {
        uint256 current = _perfScore(node);
        if (current > 8000) return 1;
        if (current < 5000) return 2;
        return 0;
    }

    function getNodeHealthScore(address node) external view returns (uint256) { return _healthScore(node); }

    function getHealthStatus(address node) external view returns (string memory) {
        uint256 h = _healthScore(node);
        if (h >= 9500) return "Healthy";
        if (h >= 8500) return "Degraded";
        if (h >= 7000) return "At-Risk";
        return "Critical";
    }

    function getRecommendedAction(address node) external view returns (string memory) { return _recommendedAction(node); }

    function executeRecommendedAction(address node) external onlyAuthorized {
        string memory action = _recommendedAction(node);
        if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("Emergency: node offline"))) {
            isNodeOnline[node] = false;
            activeJobCount[node] = 0;
            emit NodeOffline(node);
        }
    }

    function getAutoActionEnabled(address node) external view returns (bool) { return autoActions[node]; }
    function setAutoActionEnabled(address node, bool enabled) external onlyAuthorized { autoActions[node] = enabled; }

    // ══════════════════════════════════════════════════════════════════
    // FINANCIAL METRICS — external
    // ══════════════════════════════════════════════════════════════════

    function getNodeValue(address node) external view returns (uint256) { return escrow.getStake(node); }

    function getNodeROI(address node) external view returns (uint256) { return _nodeROI(node); }

    function getProjectedAnnualReward(address node) external view returns (uint256) {
        return _apyOf(node, getRewardsAccrued(node));
    }

    function getActualAnnualReward(address node) external view returns (uint256) {
        return _apyOf(node, rewardDistribution[node]);
    }

    function getRewardEfficiency(address node) external view returns (uint256) {
        uint256 stake = escrow.getStake(node);
        return stake == 0 ? 0 : (rewardsAccrued[node] * BASIS_POINTS) / stake;
    }

    function getSlashedEfficiency(address node) external view returns (uint256) {
        uint256 stake = escrow.getStake(node);
        return stake == 0 ? 0 : (totalSlashAmountByNode[node] * BASIS_POINTS) / stake;
    }

    function getNetROI(address node) external view returns (uint256) { return _nodeROI(node); }

    function getProviderHealth(address node) external view returns (uint256) { return _healthScore(node); }
    function getProviderRisk(address node) external view returns (uint256) { return _providerRisk(node); }

    // ══════════════════════════════════════════════════════════════════
    // ACCESS CONTROL & UTILITY — external
    // ══════════════════════════════════════════════════════════════════

    function authorizeCaller(address caller) external { _authorizedCallers[caller] = true; }
    function revokeCaller(address caller) external { _authorizedCallers[caller] = false; }
    function isAuthorized(address caller) external view returns (bool) { return _authorizedCallers[caller]; }
    function getBasisPoints() external pure returns (uint256) { return BASIS_POINTS; }

    /// @inheritdoc ERC165
    function supportsInterface(bytes4 interfaceId) public view override(ERC165) returns (bool) {
        return interfaceId == type(ISlashManager).interfaceId || ERC165.supportsInterface(interfaceId);
    }

    receive() external payable {}
}
