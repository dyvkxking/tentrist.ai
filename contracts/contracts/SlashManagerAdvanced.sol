// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SlashManager.sol";

/// @title SlashManagerAdvanced
/// @notice Extension for SlashManager: health scoring, penalty analytics, risk profiles, recommendations.
contract SlashManagerAdvanced {
    SlashManager public slashManager;

    uint256 public constant RISK_LOW = 0;
    uint256 public constant RISK_MEDIUM = 1;
    uint256 public constant RISK_HIGH = 2;
    uint256 public constant RISK_CRITICAL = 3;

    uint256 public constant PERFORMANCE_WINDOW = 30 days;
    uint256 public constant RECOVERY_WINDOW = 30 days;
    uint256 public constant DEFAULT_GRACE_PERIOD = 2592000;
    uint256 public constant SEVERITY_THRESHOLD = 500;

    uint256[] public healthThresholds = [50, 70, 85, 95];
    uint256 public penaltyGracePeriod = DEFAULT_GRACE_PERIOD;

    mapping(address => uint256) public nodeGraceStart;
    mapping(address => bool) public graceEligible;
    mapping(address => uint256[]) public penaltyHistory;
    mapping(address => uint256) public cumulativePenalty;
    mapping(address => uint256) public penaltyCount;
    mapping(address => uint256) public lastPenaltyTime;
    mapping(address => uint256) public recoveryStartTime;
    mapping(address => uint256) public nodeRecoveryRate;
    mapping(address => uint256) public nodeHealthScore;
    mapping(address => uint256) public nodePerformanceScore;
    mapping(address => uint256) public rebalanceScore;
    uint256 public rebalanceThreshold = 1000;
    uint256 public rebalanceWindow = 86400;

    constructor(address payable _slashManager) {
        require(_slashManager != address(0), "Zero address");
        slashManager = SlashManager(_slashManager);
    }

    // ---- Internal helpers (declared first) ----

    function _penaltyFrequency(address node) internal view returns (uint256) {
        if (penaltyCount[node] == 0) return 0;
        uint256 span = block.timestamp - lastPenaltyTime[node];
        if (span == 0) return 0;
        return (penaltyCount[node] * 1e18) / span;
    }

    function _avgPenalty(address node) internal view returns (uint256) {
        if (penaltyCount[node] == 0) return 0;
        return cumulativePenalty[node] / penaltyCount[node];
    }

    function _riskProfile(address node) internal view returns (uint256) {
        uint256 health = nodeHealthScore[node];
        uint256 freq = _penaltyFrequency(node);
        uint256 sev = _avgPenalty(node);
        if (health < healthThresholds[0] || sev >= 500 || freq >= 10) return RISK_CRITICAL;
        if (health < healthThresholds[1] || sev >= 200 || freq >= 5) return RISK_HIGH;
        if (health < healthThresholds[2] || sev >= 100 || freq >= 2) return RISK_MEDIUM;
        return RISK_LOW;
    }

    // ---- Basic getters/setters ----

    function getNodeHealthScore(address node) external view returns (uint256) {
        return nodeHealthScore[node];
    }

    function setHealthScore(address node, uint256 score) external {
        nodeHealthScore[node] = score;
    }

    function getNodePerformanceScore(address node) external view returns (uint256) {
        return nodePerformanceScore[node];
    }

    function setPerformanceScore(address node, uint256 score) external {
        nodePerformanceScore[node] = score;
    }

    function getHealthStatus(address node) external view returns (string memory) {
        uint256 s = nodeHealthScore[node];
        if (s >= healthThresholds[3]) return "Excellent";
        if (s >= healthThresholds[2]) return "Good";
        if (s >= healthThresholds[1]) return "Fair";
        if (s >= healthThresholds[0]) return "Poor";
        return "Critical";
    }

    // ---- Historical performance ----

    function getHistoricalPerformance(address node) external view returns (uint256[] memory) {
        uint256[] memory h = new uint256[](30);
        for (uint256 i = 0; i < 30; i++) h[i] = nodePerformanceScore[node];
        return h;
    }

    function getPerformanceTrend(address node) external view returns (string memory) {
        uint256 curr = nodePerformanceScore[node];
        uint256 prev = nodePerformanceScore[node];
        if (curr > prev + 100) return "improving";
        if (curr + 100 < prev) return "declining";
        return "stable";
    }

    function getMomentum(address node) external view returns (int256) {
        return int256(nodePerformanceScore[node]) - int256(nodePerformanceScore[node]);
    }

    // ---- Grace period ----

    function getPenaltyGracePeriod(address node) external view returns (uint256) {
        return penaltyGracePeriod;
    }

    function setPenaltyGracePeriod(uint256 _period) external {
        penaltyGracePeriod = _period;
    }

    function isPenaltyGraceEligible(address node) public view returns (bool) {
        return graceEligible[node] && block.timestamp < nodeGraceStart[node] + penaltyGracePeriod;
    }

    // ---- Penalty history ----

    function getPenaltyHistory(address node) external view returns (uint256[] memory) {
        return penaltyHistory[node];
    }

    function addPenaltyRecord(address node, uint256 amount) public {
        penaltyHistory[node].push(amount);
        cumulativePenalty[node] += amount;
        penaltyCount[node]++;
        lastPenaltyTime[node] = block.timestamp;
    }

    function getCumulativePenalty(address node) external view returns (uint256) {
        return cumulativePenalty[node];
    }

    function getPenaltyCount(address node) external view returns (uint256) {
        return penaltyCount[node];
    }

    // ---- Penalty frequency & trends ----

    function getPenaltyFrequency(address node) external view returns (uint256) {
        return _penaltyFrequency(node);
    }

    function getPenaltyTrend(address node) external view returns (string memory) {
        uint256 freq = _penaltyFrequency(node);
        uint256 avg = _avgPenalty(node);
        if (avg == 0) return "stable";
        uint256 ratio = (freq * 100) / avg;
        if (ratio > 120) return "increasing";
        if (ratio < 80) return "decreasing";
        return "stable";
    }

    function getPenaltyPrediction(address node) external view returns (uint256) {
        return _penaltyFrequency(node) * 30 days / 1 days;
    }

    // ---- Penalty risk & severity ----

    function getPenaltyRisk(address node) external view returns (uint256) {
        return _riskProfile(node);
    }

    function getPenaltySeverity(address node) external view returns (uint256) {
        return _avgPenalty(node);
    }

    function getSeverePenaltyCount(address node) external view returns (uint256) {
        uint256 cnt;
        for (uint256 i = 0; i < penaltyHistory[node].length; i++) {
            if (penaltyHistory[node][i] >= SEVERITY_THRESHOLD) cnt++;
        }
        return cnt;
    }

    function getMinorPenaltyCount(address node) external view returns (uint256) {
        uint256 cnt;
        for (uint256 i = 0; i < penaltyHistory[node].length; i++) {
            if (penaltyHistory[node][i] < SEVERITY_THRESHOLD) cnt++;
        }
        return cnt;
    }

    function classifyPenaltySeverity(uint256 amount) external pure returns (string memory) {
        if (amount >= SEVERITY_THRESHOLD * 2) return "Severe";
        if (amount >= SEVERITY_THRESHOLD) return "Major";
        return "Minor";
    }

    // ---- Recovery ----

    function getPenaltyRecoveryRate(address node) external view returns (uint256) {
        uint256 last = lastPenaltyTime[node];
        if (last == 0) return 10000;
        uint256 since = block.timestamp - last;
        if (since > RECOVERY_WINDOW) return 10000;
        return (since * 10000) / RECOVERY_WINDOW;
    }

    function getPenaltyRecoveryTime(address node) external view returns (uint256) {
        uint256 end = nodeGraceStart[node] + penaltyGracePeriod;
        if (end <= block.timestamp) return 0;
        return end - block.timestamp;
    }

    function getPenaltyImpactScore(address node) external view returns (uint256) {
        if (penaltyCount[node] == 0) return 0;
        return (cumulativePenalty[node] * 10000) / (penaltyCount[node] * 1 ether);
    }

    // ---- Risk profiles ----

    function getNodeRiskProfile(address node) external view returns (string memory) {
        uint256 r = _riskProfile(node);
        if (r == RISK_CRITICAL) return "Critical";
        if (r == RISK_HIGH) return "High";
        if (r == RISK_MEDIUM) return "Medium";
        return "Low";
    }

    // ---- Recommendations ----

    function getNodeRecommendation(address node) external view returns (string memory) {
        uint256 r = _riskProfile(node);
        uint256 health = nodeHealthScore[node];
        if (r == RISK_CRITICAL) return "IMMEDIATE_ACTION: Node health critical. Consider temporary suspension.";
        if (r == RISK_HIGH) return "URGENT: Node at high risk. Review recent penalties.";
        if (health < healthThresholds[2]) return "WARNING: Node health below fair. Check hardware.";
        if (health >= healthThresholds[3]) return "OPTIMAL: Node performing excellently.";
        return "NOTICE: Node is healthy. Continue standard monitoring.";
    }

    function getActionableInsights(address node) external view returns (string[] memory) {
        string[] memory insights = new string[](4);
        uint256 idx;
        if (nodeHealthScore[node] < healthThresholds[1]) {
            insights[idx++] = "Schedule immediate hardware diagnostic";
        }
        uint256 freq = _penaltyFrequency(node);
        if (freq > 0) {
            insights[idx++] = "Review penalty patterns in recent events";
        }
        if (nodePerformanceScore[node] < 5000) {
            insights[idx++] = "Investigate performance bottleneck";
        }
        if (idx < 4) {
            insights[idx++] = "Continue standard 30-second heartbeat monitoring";
        }
        return insights;
    }

    // ---- Node value & ROI ----

    function getNodeValue(address node) external view returns (uint256) {
        return address(this).balance;
    }

    function getNodeROI(address node) external view returns (uint256) {
        if (penaltyCount[node] == 0) return 10000;
        return (cumulativePenalty[node] * 10000) / (penaltyCount[node] * 1 ether);
    }

    function getProjectedAnnualReward(address node) external view returns (uint256) {
        return nodeRecoveryRate[node] * 365 days / 1 days;
    }

    function getActualAnnualReward(address node) external view returns (uint256) {
        return nodeRecoveryRate[node] * 365;
    }

    function getRewardEfficiency(address node) external view returns (uint256) {
        return nodeRecoveryRate[node];
    }

    function getSlashedEfficiency(address node) external view returns (uint256) {
        if (penaltyCount[node] == 0) return 0;
        return (cumulativePenalty[node] * 10000) / penaltyCount[node];
    }

    function getNetROI(address node) external view returns (int256) {
        return int256(nodeRecoveryRate[node]) - int256(_avgPenalty(node));
    }

    // ---- Rebalancing ----

    function getRebalanceScore(address node) external view returns (uint256) {
        return rebalanceScore[node];
    }

    function getRebalancePenalty(address node) external view returns (uint256) {
        return rebalanceScore[node] < rebalanceThreshold ? rebalanceThreshold : 0;
    }

    function applyRebalancePenalty(address node, uint256 penalty) external {
        require(penalty <= 10000, "Penalty too large");
        uint256 s = rebalanceScore[node];
        rebalanceScore[node] = s > penalty ? s - penalty : 0;
    }

    // ---- Provider health ----

    function getProviderHealth(address p) external view returns (uint256) {
        return nodeHealthScore[p];
    }

    function getProviderRisk(address p) external view returns (uint256) {
        return _riskProfile(p);
    }

    // ---- Interop ----

    function recordPenalty(address node, uint256 amount) external {
        addPenaltyRecord(node, amount);
    }

    function updateHealthFromSlash(address node, uint256 severity) external {
        uint256 current = nodeHealthScore[node];
        nodeHealthScore[node] = current >= severity ? current - severity : 0;
    }

    function recordSuccessfulOperation(address node) external {
        uint256 current = nodeHealthScore[node];
        nodeHealthScore[node] = current + 10 > 10000 ? 10000 : current + 10;
    }
}
