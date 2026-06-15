// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IEscrow
/// @notice Minimal interface for Escrow needed by SlashManager
interface IEscrow {
    function slash(address node, uint256 amount, string calldata reason) external returns (bool);
    function getStake(address node) external view returns (uint256);
}

/// @title ISlashManager
/// @notice Interface for SlashManager — automated penalty execution
interface ISlashManager {
    /// @notice Emitted when a node is slashed
    event NodeSlashed(address indexed node, uint256 amount, bytes32 jobId);

    /// @notice Emitted when a client is credited after slashing
    event CreditIssued(address indexed client, uint256 amount, bytes32 jobId);

    /// @notice Slash a node and credit the affected client
    /// @param node Address of the node to slash
    /// @param client Address of the client to credit
    /// @param jobId The job ID associated with the violation
    /// @param jobValue The total value of the job in wei (used to calculate slash)
    function slashAndCredit(
        address node,
        address client,
        bytes32 jobId,
        uint256 jobValue
    ) external;

    /// @notice Get the Slash percent (basis points)
    /// @return Slash percent
    function getSlashPercent() external view returns (uint256);

    /// @notice Get the Credit percent (basis points)
    /// @return Credit percent
    function getCreditPercent() external view returns (uint256);

    /// @notice Get the Escrow contract address
    /// @return Escrow address
    function getEscrow() external view returns (address);

    /// @notice Calculate slash amount based on job value
    /// @param jobValue The job value in wei
    /// @return The slash amount
    function calculateSlash(uint256 jobValue) external view returns (uint256);

    /// @notice Calculate credit amount (portion of slash going to client)
    /// @param jobValue The job value in wei
    /// @return The credit amount
    function calculateCredit(uint256 jobValue) external view returns (uint256);
}

/// @title SlashManager
/// @notice Automated penalty execution for the Tentrist protocol.
/// @dev When a node fails to meet SLA requirements:
///      1. Slash is calculated as SLASH_PERCENT of job value
///      2. Node's stake is slashed via Escrow contract
///      3. CREDIT_PERCENT of slashed amount is credited to client
///      4. Remaining portion can be reserved for protocol treasury
contract SlashManager is ISlashManager {
    /// @notice Slash percent in basis points (1000 = 10%)
    uint256 public constant SLASH_PERCENT = 1000; // 10%

    /// @notice Credit percent in basis points (7000 = 70%)
    uint256 public constant CREDIT_PERCENT = 7000; // 70% of slashed goes to client

    /// @notice Basis points divisor (10000 = 100%)
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Reference to Escrow contract
    IEscrow public escrow;

    /// @notice Authorized callers (heartbeat service, orchestrator)
    mapping(address => bool) private _authorizedCallers;

    modifier onlyAuthorized() {
        require(_authorizedCallers[msg.sender], "Caller not authorized");
        _;
    }

    constructor(IEscrow _escrow) {
        require(address(_escrow) != address(0), "Escrow address cannot be zero");
        escrow = _escrow;
        _authorizedCallers[msg.sender] = true;
    }

    /// @inheritdoc ISlashManager
    function slashAndCredit(
        address node,
        address client,
        bytes32 jobId,
        uint256 jobValue
    ) external override onlyAuthorized {
        require(node != address(0), "Node address cannot be zero");
        require(client != address(0), "Client address cannot be zero");
        require(jobValue > 0, "Job value must be positive");

        // Calculate slash amount (10% of job value)
        uint256 slashAmount = calculateSlash(jobValue);

        // Slash the node via Escrow contract
        // Note: Escrow.slash returns bool indicating success
        // Slashed funds are transferred to SlashManager (this contract)
        bool slashed = escrow.slash(node, slashAmount, "SLA violation");
        require(slashed, "Slash failed");

        // Calculate credit to client (70% of slashed amount)
        uint256 creditAmount = calculateCredit(jobValue);

        // Credit the client
        if (creditAmount > 0) {
            (bool success, ) = client.call{value: creditAmount}("");
            require(success, "Credit transfer failed");
        }

        emit NodeSlashed(node, slashAmount, jobId);
        emit CreditIssued(client, creditAmount, jobId);
    }

    /// @inheritdoc ISlashManager
    function getSlashPercent() external view override returns (uint256) {
        return SLASH_PERCENT;
    }

    /// @inheritdoc ISlashManager
    function getCreditPercent() external view override returns (uint256) {
        return CREDIT_PERCENT;
    }

    /// @inheritdoc ISlashManager
    function getEscrow() external view override returns (address) {
        return address(escrow);
    }

    /// @inheritdoc ISlashManager
    function calculateSlash(uint256 jobValue) public view override returns (uint256) {
        return (jobValue * SLASH_PERCENT) / BASIS_POINTS;
    }

    /// @inheritdoc ISlashManager
    function calculateCredit(uint256 jobValue) public view override returns (uint256) {
        uint256 slashAmount = calculateSlash(jobValue);
        return (slashAmount * CREDIT_PERCENT) / BASIS_POINTS;
    }

    /// @notice Authorize a caller (e.g., heartbeat service, orchestrator)
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

    /// @notice Calculate net treasury amount (slashed - credited)
    /// @param jobValue The job value in wei
    /// @return The treasury amount
    function calculateTreasury(uint256 jobValue) external view returns (uint256) {
        uint256 slashAmount = calculateSlash(jobValue);
        uint256 creditAmount = calculateCredit(jobValue);
        return slashAmount - creditAmount;
    }

    /// @notice Get the basis points constant
    /// @return Basis points (10000)
    function getBasisPoints() external pure returns (uint256) {
        return BASIS_POINTS;
    }

    /// @notice Receive ether for crediting clients
    receive() external payable {}
}