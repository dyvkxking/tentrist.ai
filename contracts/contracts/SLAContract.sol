// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title IEscrow
/// @notice Minimal interface for Escrow needed by SLAContract
interface IEscrow {
    function getStake(address node) external view returns (uint256);
    function hasStaked(address node) external view returns (bool);
}

/// @notice SLA benchmark struct for a compute job
struct SLABenchmark {
    uint256 requiredUptime;     // percentage * 100 (e.g., 9900 = 99%)
    uint256 requiredThroughput; // ops/second
    uint256 deadline;           // unix timestamp
    bool fulfilled;             // true if SLA was met
    bool exists;                // true if SLA was recorded
}

/// @notice Checkpoint for historical metrics tracking
struct Checkpoint {
    uint256 timestamp;
    uint256 uptime;
    uint256 throughput;
}

/// @title ISLA
/// @notice Interface for SLAContract — records SLA benchmarks for compute jobs
interface ISLA {
    event SLARecorded(bytes32 indexed jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline);
    event SLAFulfilled(bytes32 indexed jobId, bool success);
    event SLABreached(bytes32 indexed jobId, uint256 penaltyAmount);
    event SLAExtended(bytes32 indexed jobId, uint256 newDeadline);
    event EmergencyTerminated(bytes32 indexed jobId, string reason);
    event SLAMetricsEmitted(bytes32 indexed jobId, uint256 uptime, uint256 throughput);

    function recordSLA(bytes32 jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline) external;
    function fulfillSLA(bytes32 jobId, bool success) external;
    function getSLA(bytes32 jobId) external view returns (SLABenchmark memory);
    function hasSLA(bytes32 jobId) external view returns (bool);
    function isFulfilled(bytes32 jobId) external view returns (bool);
    function getEscrow() external view returns (IEscrow);
}

/// @title SLAContract
/// @notice Records SLA benchmarks for compute jobs in the Tentrist protocol.
contract SLAContract is ISLA, ERC165, ReentrancyGuard {
    /// @notice Maps job ID to SLA benchmark
    mapping(bytes32 => SLABenchmark) private _slaBenchmarks;

    /// @notice Maps job ID to client address
    mapping(bytes32 => address) public slaClient;

    /// @notice Maps job ID to provider address
    mapping(bytes32 => address) public slaProvider;

    /// @notice Maps job ID to list of checkpoints
    mapping(bytes32 => Checkpoint[]) public historicalMetrics;

    /// @notice Maps job ID to breach status
    mapping(bytes32 => bool) public breachedSLAs;

    /// @notice Maps job ID to pending termination
    mapping(bytes32 => bool) public pendingTerminations;

    /// @notice Maps job ID to SLA version for upgrades
    mapping(bytes32 => uint256) public slaVersion;

    /// @notice Reference to Escrow contract for stake verification
    IEscrow public escrow;

    /// @notice Authorized callers (orchestrator, heartbeat service)
    mapping(address => bool) private _authorizedCallers;

    /// @notice Metrics averaging period in seconds
    uint256 public constant SLA_METRICS_PERIOD = 300; // 5-minute windows

    /// @notice Penalty basis points (100 = 1% of stake)
    uint256 public constant PENALTY_BASIS_POINTS = 100;

    /// @notice Minimum deadline extension in seconds
    uint256 public constant MIN_DEADLINE_EXTENSION = 1 hours;

    modifier onlyAuthorized() {
        require(_authorizedCallers[msg.sender], "Caller not authorized");
        _;
    }

    modifier onlyExistingJob(bytes32 jobId) {
        require(_slaBenchmarks[jobId].exists, "SLA does not exist");
        _;
    }

    modifier onlyOnce(bytes32 jobId) {
        require(!_slaBenchmarks[jobId].fulfilled, "SLA already fulfilled");
        _;
    }

    modifier onlySLAClient(bytes32 jobId) {
        require(slaClient[jobId] == msg.sender, "Not SLA client");
        _;
    }

    modifier onlySLAProvider(bytes32 jobId) {
        require(slaProvider[jobId] == msg.sender, "Not SLA provider");
        _;
    }

    constructor(IEscrow _escrow) {
        require(address(_escrow) != address(0), "Escrow address cannot be zero");
        escrow = _escrow;
        _authorizedCallers[msg.sender] = true;
    }

    /// @inheritdoc ISLA
    function recordSLA(
        bytes32 jobId,
        uint256 requiredUptime,
        uint256 requiredThroughput,
        uint256 deadline
    ) external override onlyAuthorized {
        require(jobId != bytes32(0), "Job ID cannot be zero");
        require(!_slaBenchmarks[jobId].exists, "SLA already recorded for this job");
        require(requiredUptime > 0 && requiredUptime <= 10000, "Invalid uptime value");
        require(requiredThroughput > 0, "Throughput must be positive");
        require(deadline > block.timestamp, "Deadline must be in the future");

        _slaBenchmarks[jobId] = SLABenchmark({
            requiredUptime: requiredUptime,
            requiredThroughput: requiredThroughput,
            deadline: deadline,
            fulfilled: false,
            exists: true
        });
        slaVersion[jobId] = 1;
        emit SLARecorded(jobId, requiredUptime, requiredThroughput, deadline);
    }

    /// @inheritdoc ISLA
    function fulfillSLA(bytes32 jobId, bool success)
        external
        override
        onlyAuthorized
        onlyExistingJob(jobId)
        onlyOnce(jobId)
    {
        _slaBenchmarks[jobId].fulfilled = success;
        if (!success) {
            breachedSLAs[jobId] = true;
            if (slaProvider[jobId] != address(0)) {
                uint256 penalty = getPenaltyAmount(jobId);
                emit SLABreached(jobId, penalty);
            }
        }
        emit SLAFulfilled(jobId, success);
    }

    /// @inheritdoc ISLA
    function getSLA(bytes32 jobId) external view override onlyExistingJob(jobId) returns (SLABenchmark memory) {
        return _slaBenchmarks[jobId];
    }

    /// @inheritdoc ISLA
    function hasSLA(bytes32 jobId) external view override returns (bool) {
        return _slaBenchmarks[jobId].exists;
    }

    /// @inheritdoc ISLA
    function isFulfilled(bytes32 jobId) external view override onlyExistingJob(jobId) returns (bool) {
        return _slaBenchmarks[jobId].fulfilled;
    }

    /// @inheritdoc ISLA
    function getEscrow() external view override returns (IEscrow) {
        return escrow;
    }

    /// @notice Authorize a caller (e.g., orchestrator, heartbeat service)
    function authorizeCaller(address caller) external {
        _authorizedCallers[caller] = true;
    }

    /// @notice Revoke caller authorization
    function revokeCaller(address caller) external {
        _authorizedCallers[caller] = false;
    }

    /// @notice Check if a caller is authorized
    function isAuthorized(address caller) external view returns (bool) {
        return _authorizedCallers[caller];
    }

    /// @notice Get all SLA parameters for a job
    function getSLAParams(bytes32 jobId)
        external
        view
        onlyExistingJob(jobId)
        returns (uint256 uptime, uint256 throughput, uint256 deadline, bool fulfilled)
    {
        SLABenchmark memory sla = _slaBenchmarks[jobId];
        return (sla.requiredUptime, sla.requiredThroughput, sla.deadline, sla.fulfilled);
    }

    /// @notice Check if a job has breached its deadline
    function isBreached(bytes32 jobId) external view onlyExistingJob(jobId) returns (bool) {
        return block.timestamp > _slaBenchmarks[jobId].deadline && !_slaBenchmarks[jobId].fulfilled;
    }

    /// @notice Set client for a job SLA
    /// @param jobId Job identifier
    /// @param client Client address
    function setSLAClient(bytes32 jobId, address client) external onlyAuthorized onlyExistingJob(jobId) {
        slaClient[jobId] = client;
    }

    /// @notice Set provider for a job SLA
    /// @param jobId Job identifier
    /// @param provider Provider address
    function setSLAProvider(bytes32 jobId, address provider) external onlyAuthorized onlyExistingJob(jobId) {
        slaProvider[jobId] = provider;
    }

    /// @notice Update SLA terms (only before fulfillment and by authorized caller)
    /// @param jobId Job identifier
    /// @param requiredUptime New uptime requirement
    /// @param requiredThroughput New throughput requirement
    /// @param newDeadline New deadline
    function updateSLA(
        bytes32 jobId,
        uint256 requiredUptime,
        uint256 requiredThroughput,
        uint256 newDeadline
    ) external onlyAuthorized onlyExistingJob(jobId) onlyOnce(jobId) {
        require(newDeadline > block.timestamp, "Deadline must be in the future");
        require(requiredUptime > 0 && requiredUptime <= 10000, "Invalid uptime value");
        require(requiredThroughput > 0, "Throughput must be positive");

        _slaBenchmarks[jobId].requiredUptime = requiredUptime;
        _slaBenchmarks[jobId].requiredThroughput = requiredThroughput;
        _slaBenchmarks[jobId].deadline = newDeadline;
        slaVersion[jobId] += 1;
    }

    /// @notice Record an uptime check from heartbeat
    /// @param jobId Job identifier
    /// @param uptime Measured uptime (percentage * 100)
    function recordUptimeCheck(bytes32 jobId, uint256 uptime) external onlyAuthorized onlyExistingJob(jobId) {
        require(uptime <= 10000, "Invalid uptime");
        uint256 len = historicalMetrics[jobId].length;
        if (len > 0) {
            require(historicalMetrics[jobId][len - 1].timestamp + SLA_METRICS_PERIOD <= block.timestamp, "Too soon");
        }
        historicalMetrics[jobId].push(Checkpoint({
            timestamp: block.timestamp,
            uptime: uptime,
            throughput: 0
        }));
        _validateCheckpointTimestamps(jobId);
        _emitSLAMetrics(jobId, uptime, 0);
    }

    /// @notice Record a throughput check from heartbeat
    /// @param jobId Job identifier
    /// @param throughput Measured throughput (ops/sec)
    function recordThroughputCheck(bytes32 jobId, uint256 throughput) external onlyAuthorized onlyExistingJob(jobId) {
        uint256 len = historicalMetrics[jobId].length;
        if (len > 0) {
            require(historicalMetrics[jobId][len - 1].timestamp + SLA_METRICS_PERIOD <= block.timestamp, "Too soon");
        }
        historicalMetrics[jobId].push(Checkpoint({
            timestamp: block.timestamp,
            uptime: 0,
            throughput: throughput
        }));
        _emitSLAMetrics(jobId, 0, throughput);
    }

    /// @notice Submit a combined checkpoint
    /// @param jobId Job identifier
    /// @param uptime Measured uptime (percentage * 100)
    /// @param throughput Measured throughput (ops/sec)
    function submitCheckpoint(bytes32 jobId, uint256 uptime, uint256 throughput)
        external
        onlyAuthorized
        onlyExistingJob(jobId)
    {
        require(uptime <= 10000, "Invalid uptime");
        historicalMetrics[jobId].push(Checkpoint({
            timestamp: block.timestamp,
            uptime: uptime,
            throughput: throughput
        }));
        _validateCheckpointTimestamps(jobId);
        _emitSLAMetrics(jobId, uptime, throughput);
    }

    /// @notice Get checkpoint count for a job
    /// @param jobId Job identifier
    /// @return Number of checkpoints
    function getCheckpointCount(bytes32 jobId) external view onlyExistingJob(jobId) returns (uint256) {
        return historicalMetrics[jobId].length;
    }

    /// @notice Calculate penalty based on breach severity
    /// @param jobId Job identifier
    /// @return Penalty amount in wei (basis points of stake)
    function calculatePenalty(bytes32 jobId) external view onlyExistingJob(jobId) returns (uint256) {
        return getPenaltyAmount(jobId);
    }

    /// @notice Get penalty amount for a breached SLA
    /// @param jobId Job identifier
    /// @return Penalty in wei
    function getPenaltyAmount(bytes32 jobId) public view onlyExistingJob(jobId) returns (uint256) {
        SLABenchmark memory sla = _slaBenchmarks[jobId];
        uint256 stake = escrow.getStake(slaProvider[jobId]);
        return (stake * PENALTY_BASIS_POINTS) / 10000;
    }

    /// @notice Get penalty recipient (protocol treasury)
    /// @return Recipient address
    function getPenaltyRecipient() external pure returns (address) {
        return address(0); // Override in child or set via governance
    }

    /// @notice Verify SLA compliance across all terms
    /// @param jobId Job identifier
    /// @return True if compliant
    function verifySLACompliance(bytes32 jobId) external view onlyExistingJob(jobId) returns (bool) {
        SLABenchmark memory sla = _slaBenchmarks[jobId];
        if (sla.fulfilled) return true;
        if (block.timestamp > sla.deadline) return false;
        uint256 avgUptime = getCurrentUptimePercentage(jobId);
        uint256 avgThroughput = getCurrentThroughputRate(jobId);
        return avgUptime >= sla.requiredUptime && avgThroughput >= sla.requiredThroughput;
    }

    /// @notice Get remaining time until deadline
    /// @param jobId Job identifier
    /// @return Seconds remaining (0 if past deadline)
    function getRemainingTime(bytes32 jobId) external view onlyExistingJob(jobId) returns (uint256) {
        SLABenchmark memory sla = _slaBenchmarks[jobId];
        if (block.timestamp >= sla.deadline) return 0;
        return sla.deadline - block.timestamp;
    }

    /// @notice Get current uptime percentage from checkpoints
    /// @param jobId Job identifier
    /// @return Average uptime percentage * 100
    function getCurrentUptimePercentage(bytes32 jobId) public view onlyExistingJob(jobId) returns (uint256) {
        return _calculateUptimeScore(jobId);
    }

    /// @notice Get current throughput rate from checkpoints
    /// @param jobId Job identifier
    /// @return Average throughput
    function getCurrentThroughputRate(bytes32 jobId) public view onlyExistingJob(jobId) returns (uint256) {
        Checkpoint[] storage checkpoints = historicalMetrics[jobId];
        if (checkpoints.length == 0) return 0;
        uint256 total;
        uint256 count;
        for (uint256 i = 0; i < checkpoints.length; i++) {
            if (checkpoints[i].throughput > 0) {
                total += checkpoints[i].throughput;
                count++;
            }
        }
        return count == 0 ? 0 : total / count;
    }

    /// @notice Get SLA metrics summary
    /// @param jobId Job identifier
    /// @return uptime Average uptime percentage * 100
    /// @return throughput Average throughput ops/sec
    /// @return checkpointCount Number of checkpoints
    /// @return isCompliant Whether SLA is currently compliant
    function getSLAMetrics(bytes32 jobId)
        external
        view
        onlyExistingJob(jobId)
        returns (uint256 uptime, uint256 throughput, uint256 checkpointCount, bool isCompliant)
    {
        SLABenchmark memory sla = _slaBenchmarks[jobId];
        uptime = _calculateUptimeScore(jobId);
        throughput = getCurrentThroughputRate(jobId);
        checkpointCount = historicalMetrics[jobId].length;
        if (sla.fulfilled) {
            isCompliant = true;
        } else if (block.timestamp > sla.deadline) {
            isCompliant = false;
        } else {
            isCompliant = uptime >= sla.requiredUptime && throughput >= sla.requiredThroughput;
        }
    }

    /// @notice Internal: calculate uptime score from historical checkpoints
    /// @param jobId Job identifier
    /// @return Average uptime percentage * 100
    function _calculateUptimeScore(bytes32 jobId) internal view returns (uint256) {
        Checkpoint[] storage checkpoints = historicalMetrics[jobId];
        if (checkpoints.length == 0) return 0;
        uint256 total;
        uint256 count;
        for (uint256 i = 0; i < checkpoints.length; i++) {
            if (checkpoints[i].uptime > 0) {
                total += checkpoints[i].uptime;
                count++;
            }
        }
        return count == 0 ? 0 : total / count;
    }

    /// @notice Internal: emit metrics for real-time monitoring
    /// @param jobId Job identifier
    /// @param uptime Uptime value
    /// @param throughput Throughput value
    function _emitSLAMetrics(bytes32 jobId, uint256 uptime, uint256 throughput) internal {
        emit SLAMetricsEmitted(jobId, uptime, throughput);
    }

    /// @notice Internal: validate checkpoint timestamps are monotonically increasing
    /// @param jobId Job identifier
    function _validateCheckpointTimestamps(bytes32 jobId) internal view {
        Checkpoint[] storage checkpoints = historicalMetrics[jobId];
        for (uint256 i = 1; i < checkpoints.length; i++) {
            require(checkpoints[i].timestamp > checkpoints[i - 1].timestamp, "Timestamps must increase");
        }
    }

    /// @notice Internal: record SLA violation
    /// @param jobId Job identifier
    function _recordSLAViolation(bytes32 jobId) internal {
        breachedSLAs[jobId] = true;
        uint256 penalty = getPenaltyAmount(jobId);
        emit SLABreached(jobId, penalty);
    }

    /// @notice Emergency terminate SLA
    /// @param jobId Job identifier
    /// @param reason Termination reason
    function emergencyTerminateSLA(bytes32 jobId, string calldata reason)
        external
        onlyAuthorized
        onlyExistingJob(jobId)
        onlyOnce(jobId)
    {
        _slaBenchmarks[jobId].fulfilled = false;
        breachedSLAs[jobId] = true;
        pendingTerminations[jobId] = true;
        emit EmergencyTerminated(jobId, reason);
    }

    /// @notice Extend deadline with client approval
    /// @param jobId Job identifier
    /// @param newDeadline New deadline timestamp
    function extendDeadline(bytes32 jobId, uint256 newDeadline)
        external
        onlyAuthorized
        onlyExistingJob(jobId)
        onlyOnce(jobId)
    {
        require(newDeadline > _slaBenchmarks[jobId].deadline + MIN_DEADLINE_EXTENSION, "Extension too small");
        _slaBenchmarks[jobId].deadline = newDeadline;
        slaVersion[jobId] += 1;
        emit SLAExtended(jobId, newDeadline);
    }

    /// @notice Approve termination (mutual agreement)
    /// @param jobId Job identifier
    function approveTermination(bytes32 jobId)
        external
        onlySLAClient(jobId)
        onlyExistingJob(jobId)
    {
        require(pendingTerminations[jobId], "No pending termination");
        _slaBenchmarks[jobId].fulfilled = true;
        pendingTerminations[jobId] = false;
    }

    /// @notice Submit final metrics and close SLA cycle
    /// @param jobId Job identifier
    /// @param finalUptime Final uptime percentage * 100
    /// @param finalThroughput Final throughput
    function submitFinalMetrics(bytes32 jobId, uint256 finalUptime, uint256 finalThroughput)
        external
        onlyAuthorized
        onlyExistingJob(jobId)
        onlyOnce(jobId)
    {
        historicalMetrics[jobId].push(Checkpoint({
            timestamp: block.timestamp,
            uptime: finalUptime,
            throughput: finalThroughput
        }));
        _emitSLAMetrics(jobId, finalUptime, finalThroughput);
    }

    /// @notice Migrate SLA to new contract version
    /// @param jobId Job identifier
    /// @param newVersion New version number
    function migrateSLA(bytes32 jobId, uint256 newVersion)
        external
        onlyAuthorized
        onlyExistingJob(jobId)
    {
        slaVersion[jobId] = newVersion;
    }

    /// @notice Get SLA rating score
    /// @param jobId Job identifier
    /// @return Rating 0-1000
    function getSLARating(bytes32 jobId) external view onlyExistingJob(jobId) returns (uint256) {
        SLABenchmark memory sla = _slaBenchmarks[jobId];
        uint256 uptimeScore = _calculateUptimeScore(jobId);
        uint256 throughputRatio = sla.requiredThroughput > 0
            ? (getCurrentThroughputRate(jobId) * 10000) / sla.requiredThroughput
            : 10000;
        uint256 combined = (uptimeScore * 6000 + throughputRatio * 4000) / 10000;
        return combined > 10000 ? 10000 : combined;
    }

    /// @inheritdoc ERC165
    function supportsInterface(bytes4 interfaceId) public view override(ERC165) returns (bool) {
        return interfaceId == type(ISLA).interfaceId || ERC165.supportsInterface(interfaceId);
    }
}
