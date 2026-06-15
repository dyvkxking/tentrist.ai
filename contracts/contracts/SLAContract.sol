// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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

/// @title ISLA
/// @notice Interface for SLAContract — records SLA benchmarks for compute jobs
interface ISLA {
    /// @notice Emitted when an SLA is recorded for a job
    event SLARecorded(
        bytes32 indexed jobId,
        uint256 requiredUptime,
        uint256 requiredThroughput,
        uint256 deadline
    );

    /// @notice Emitted when an SLA is fulfilled or breached
    event SLAFulfilled(bytes32 indexed jobId, bool success);

    /// @notice Record SLA benchmarks for a job
    /// @param jobId Unique job identifier
    /// @param requiredUptime Required uptime percentage * 100 (e.g., 9900 = 99%)
    /// @param requiredThroughput Required throughput in ops/second
    /// @param deadline Job deadline as unix timestamp
    function recordSLA(
        bytes32 jobId,
        uint256 requiredUptime,
        uint256 requiredThroughput,
        uint256 deadline
    ) external;

    /// @notice Mark an SLA as fulfilled or breached
    /// @param jobId Unique job identifier
    /// @param success True if fulfilled, false if breached
    function fulfillSLA(bytes32 jobId, bool success) external;

    /// @notice Get SLA benchmarks for a job
    /// @param jobId Unique job identifier
    /// @return SLABenchmark struct
    function getSLA(bytes32 jobId) external view returns (SLABenchmark memory);

    /// @notice Check if a job has an SLA recorded
    /// @param jobId Unique job identifier
    /// @return True if SLA exists
    function hasSLA(bytes32 jobId) external view returns (bool);

    /// @notice Check if a job's SLA was fulfilled
    /// @param jobId Unique job identifier
    /// @return True if fulfilled, false if not
    function isFulfilled(bytes32 jobId) external view returns (bool);

    /// @notice Get the Escrow contract reference
    /// @return IEscrow interface
    function getEscrow() external view returns (IEscrow);
}

/// @title SLAContract
/// @notice Records SLA benchmarks for compute jobs in the Tentrist protocol.
/// @dev SLA benchmarks define the performance requirements nodes must meet:
///      - requiredUptime: percentage * 100 (e.g., 9900 = 99% uptime required)
///      - requiredThroughput: operations per second
///      - deadline: unix timestamp by which job must complete
contract SLAContract is ISLA {
    /// @notice Maps job ID to SLA benchmark
    mapping(bytes32 => SLABenchmark) private _slaBenchmarks;

    /// @notice Reference to Escrow contract for stake verification
    IEscrow public escrow;

    /// @notice Authorized callers (orchestrator, heartbeat service)
    mapping(address => bool) private _authorizedCallers;

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

    /// @notice Get all SLA parameters for a job (convenience function)
    /// @param jobId Unique job identifier
    /// @return uptime Required uptime percentage
    /// @return throughput Required throughput ops/sec
    /// @return deadline Job deadline timestamp
    /// @return fulfilled Whether SLA was met
    function getSLAParams(bytes32 jobId)
        external
        view
        onlyExistingJob(jobId)
        returns (
            uint256 uptime,
            uint256 throughput,
            uint256 deadline,
            bool fulfilled
        )
    {
        SLABenchmark memory sla = _slaBenchmarks[jobId];
        return (sla.requiredUptime, sla.requiredThroughput, sla.deadline, sla.fulfilled);
    }

    /// @notice Check if a job has breached its deadline
    /// @param jobId Unique job identifier
    /// @return True if deadline has passed and SLA not fulfilled
    function isBreached(bytes32 jobId) external view onlyExistingJob(jobId) returns (bool) {
        return block.timestamp > _slaBenchmarks[jobId].deadline && !_slaBenchmarks[jobId].fulfilled;
    }
}