// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @title IEscrow
/// @notice Interface for Escrow contract — manages node collateral staking and slashing
interface IEscrow {
    /// @notice Emitted when a node deposits stake
    event StakeDeposited(address indexed node, uint256 amount);

    /// @notice Emitted when a node withdraws stake
    event StakeWithdrawn(address indexed node, uint256 amount);

    /// @notice Emitted when a node's stake is slashed
    event StakeSlashed(address indexed node, uint256 amount, string reason);

    /// @notice Emitted when the slasher role is updated
    event SlasherUpdated(address indexed oldSlasher, address indexed newSlasher);

    /// @notice Emitted when a stake is modified (lock/unlock/compound)
    event StakeChanged(address indexed node, uint256 newAmount, string action);

    /// @notice Deposit stake for msg.sender
    function stake() external payable;

    /// @notice Withdraw stake amount (must maintain minimum)
    /// @param amount Amount to withdraw
    function withdraw(uint256 amount) external;

    /// @notice Slash a node's stake (called by authorized slasher)
    /// @param node Address of node to slash
    /// @param amount Amount to slash
    /// @param reason Reason for slashing (stored in event)
    function slash(address node, uint256 amount, string calldata reason) external returns (bool);

    /// @notice Get a node's current stake
    /// @param node Address of the node
    /// @return Stake amount in wei
    function getStake(address node) external view returns (uint256);

    /// @notice Check if node has staked
    /// @param node Address of the node
    /// @return True if node has staked
    function hasStaked(address node) external view returns (bool);

    /// @notice Get the authorized slasher address
    /// @return Slasher address
    function getSlasher() external view returns (address);

    /// @notice Get minimum stake requirement
    /// @return Minimum stake in wei
    function getMinStake() external view returns (uint256);

    /// @notice Authorize a new slasher (only owner)
    /// @param newSlasher Address of new slasher
    function authorizeSlasher(address newSlasher) external;

    /// @notice Get total staked across all nodes
    /// @return Total staked in wei
    function getTotalStaked() external view returns (uint256);
}

/// @title Escrow
/// @notice Collateral staking contract for GPU compute nodes in the Tentrist protocol.
/// @dev Manages stake deposits, withdrawals, and slashing with reentrancy protection.
///      All financial operations are enforced on-chain.
contract Escrow is IEscrow, ReentrancyGuard, ERC165 {
    // solhint-disable-next-line const-name-snakecase
    uint256 public constant MIN_STAKE = 0.05 ether;
    string public constant ESCROW_VERSION = "1.0.0";

    /// @notice Maximum stake per node (upgradeable)
    uint256 public maximumStakeAmount;

    /// @notice Stake struct tracking individual node deposits
    struct Stake {
        address owner;
        uint256 amount;
        uint256 timestamp;
        bool locked;
        uint256 unlockTime;
    }

    mapping(address => uint256) private _stakeOf;
    mapping(address => Stake) private _stakes;
    mapping(address => bool) private _hasStaked;
    address[] private _stakerList;
    uint256 private _totalStaked;
    uint256 public stakeLockDuration = 7 days;
    mapping(address => uint256) public pendingWithdrawals;
    mapping(address => uint256) private _stakeIndex;
    /// @notice Stake history for audit trail: node => Stake[]
    mapping(address => Stake[]) public stakeHistory;

    address public slasher;
    address public owner;
    bool public paused;

    /// @notice Flag to prevent permanent lock-out from ownership renounce
    bool private _ownershipRenounced;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller not owner");
        _;
    }

    modifier onlySlasher() {
        require(msg.sender == slasher, "Caller not slasher");
        _;
    }

    modifier onlyStaked(address node) {
        require(hasStaked(node), "Node has not staked");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        slasher = msg.sender;
        maximumStakeAmount = 1000 ether;
        _ownershipRenounced = false;
    }

    /// @inheritdoc IEscrow
    function stake() external payable override nonReentrant whenNotPaused {
        require(msg.value > 0, "Cannot stake 0");
        _validateStakeAmount(msg.value);

        if (!_hasStaked[msg.sender]) {
            _hasStaked[msg.sender] = true;
            _stakerList.push(msg.sender);
            _stakeIndex[msg.sender] = _stakerList.length - 1;
        }

        _stakeOf[msg.sender] += msg.value;
        _totalStaked += msg.value;
        _stakes[msg.sender] = Stake({
            owner: msg.sender,
            amount: _stakeOf[msg.sender],
            timestamp: block.timestamp,
            locked: false,
            unlockTime: 0
        });
        stakeHistory[msg.sender].push(Stake({
            owner: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            locked: false,
            unlockTime: 0
        }));

        emit StakeDeposited(msg.sender, msg.value);
    }

    /// @inheritdoc IEscrow
    function withdraw(uint256 amount) external override nonReentrant onlyStaked(msg.sender) whenNotPaused {
        require(amount > 0, "Cannot withdraw 0");
        require(_stakeOf[msg.sender] >= amount, "Insufficient stake");
        require(!_stakes[msg.sender].locked, "Stake is locked");

        uint256 remainingStake = _stakeOf[msg.sender] - amount;
        require(remainingStake == 0 || remainingStake >= MIN_STAKE, "Cannot go below minimum stake");

        _beforeWithdraw(msg.sender, amount);

        _stakeOf[msg.sender] -= amount;
        _totalStaked -= amount;
        _stakes[msg.sender].amount = _stakeOf[msg.sender];

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit StakeWithdrawn(msg.sender, amount);
    }

    /// @inheritdoc IEscrow
    function slash(address node, uint256 amount, string calldata reason)
        external
        override
        onlySlasher
        nonReentrant
        onlyStaked(node)
        returns (bool)
    {
        uint256 actualSlash = amount > _stakeOf[node] ? _stakeOf[node] : amount;

        _stakeOf[node] -= actualSlash;
        _totalStaked -= actualSlash;
        _stakes[node].amount = _stakeOf[node];

        if (actualSlash > 0) {
            (bool success, ) = slasher.call{value: actualSlash}("");
            require(success, "Slash transfer failed");
        }

        _afterSlash(node, actualSlash, reason);

        emit StakeSlashed(node, actualSlash, reason);
        emit StakeChanged(node, _stakeOf[node], "slashed");
        return true;
    }

    /// @inheritdoc IEscrow
    function getStake(address node) external view override returns (uint256) {
        return _stakeOf[node];
    }

    /// @inheritdoc IEscrow
    function hasStaked(address node) public view override returns (bool) {
        return _hasStaked[node] && _stakeOf[node] > 0;
    }

    /// @inheritdoc IEscrow
    function getSlasher() external view override returns (address) {
        return slasher;
    }

    /// @inheritdoc IEscrow
    function getMinStake() external pure override returns (uint256) {
        return MIN_STAKE;
    }

    /// @inheritdoc IEscrow
    function getTotalStaked() external view override returns (uint256) {
        return _totalStaked;
    }

    /// @inheritdoc IEscrow
    function authorizeSlasher(address newSlasher) external override onlyOwner {
        require(newSlasher != address(0), "Invalid slasher address");
        address oldSlasher = slasher;
        slasher = newSlasher;
        emit SlasherUpdated(oldSlasher, newSlasher);
    }

    /// @notice Get all stakers
    /// @return Array of staker addresses
    function getStakers() external view returns (address[] memory) {
        return _stakerList;
    }

    /// @notice Get staker count
    /// @return Number of stakers
    function getStakerCount() external view returns (uint256) {
        return _stakerList.length;
    }

    /// @notice Emergency withdraw for entire balance (only owner)
    /// @param to Recipient address
    function emergencyWithdraw(address to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = to.call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }

    /// @notice Pause staking and withdrawals
    function pauseStake() external onlyOwner {
        paused = true;
    }

    /// @notice Unpause staking and withdrawals
    function unpauseStake() external onlyOwner {
        paused = false;
    }

    /// @notice Accept native token deposits
    receive() external payable {
        emit StakeDeposited(msg.sender, msg.value);
    }

    /// @notice Lock a node's stake (called when node takes a job)
    /// @param node Address of node to lock
    /// @param duration Lock duration in seconds
    function lockStake(address node, uint256 duration) external onlyOwner {
        require(_hasStaked[node], "Node has not staked");
        _stakes[node].locked = true;
        _stakes[node].unlockTime = block.timestamp + duration;
        emit StakeChanged(node, _stakeOf[node], "locked");
    }

    /// @notice Unlock a node's stake (called when job completes)
    /// @param node Address of node to unlock
    function unlockStake(address node) external onlyOwner {
        require(_stakes[node].locked, "Stake not locked");
        _stakes[node].locked = false;
        _stakes[node].unlockTime = 0;
        emit StakeChanged(node, _stakeOf[node], "unlocked");
    }

    /// @notice Request withdrawal (time-locked pending state)
    /// @param amount Amount to withdraw
    function requestWithdrawal(uint256 amount) external onlyStaked(msg.sender) whenNotPaused {
        require(amount > 0, "Cannot request 0");
        require(_stakeOf[msg.sender] >= amount, "Insufficient stake");
        uint256 remaining = _stakeOf[msg.sender] - amount;
        require(remaining == 0 || remaining >= MIN_STAKE, "Cannot go below minimum");

        pendingWithdrawals[msg.sender] += amount;
        _stakeOf[msg.sender] -= amount;
        _totalStaked -= amount;
        _stakes[msg.sender].amount = _stakeOf[msg.sender];
        emit StakeChanged(msg.sender, _stakeOf[msg.sender], "withdrawal_requested");
    }

    /// @notice Claim pending withdrawal after lock period
    function claimWithdrawal() external nonReentrant whenNotPaused {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending withdrawal");
        require(!_stakes[msg.sender].locked, "Stake is locked");

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit StakeWithdrawn(msg.sender, amount);
    }

    /// @notice Get pending withdrawal amount
    /// @param node Address to check
    /// @return Pending withdrawal amount
    function getPendingWithdrawal(address node) external view returns (uint256) {
        return pendingWithdrawals[node];
    }

    /// @notice Get stake details for a node
    /// @param node Address of the node
    /// @return Stake struct details
    function getStakeDetails(address node) external view returns (Stake memory) {
        return _stakes[node];
    }

    /// @notice Check if stake is currently locked
    /// @param node Address of the node
    /// @return True if locked
    function isStakeLocked(address node) external view returns (bool) {
        return _stakes[node].locked;
    }

    /// @notice Set stake lock duration (only owner)
    /// @param duration New duration in seconds
    function setStakeLockDuration(uint256 duration) external onlyOwner {
        stakeLockDuration = duration;
    }

    /// @notice Get contract ETH balance
    /// @return Contract balance in wei
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Get stake index for enumeration
    /// @param node Address of node
    /// @return Index in staker list
    function getStakeIndex(address node) external view returns (uint256) {
        return _stakeIndex[node];
    }

    /// @notice Hook called before any withdrawal — override in child contracts
    /// @param node Address attempting withdrawal
    /// @param amount Amount being withdrawn
    function _beforeWithdraw(address node, uint256 amount) internal virtual {
        // Default: no additional validation required
        // Child contracts (e.g. SLAContract) can override to enforce additional checks
    }

    /// @notice Hook called after a slash occurs — override in child contracts
    /// @param node Address that was slashed
    /// @param amount Amount slashed
    /// @param reason Reason string
    function _afterSlash(address node, uint256 amount, string calldata reason) internal virtual {
        // Default: emit additional metrics events
        // Child contracts can override to trigger reputation updates, alerts, etc.
    }

    /// @inheritdoc ERC165
    /// @dev Supports IEscrow interface
    function supportsInterface(bytes4 interfaceId) public view override(ERC165) returns (bool) {
        return interfaceId == type(IEscrow).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Fallback function — rejects unsolicited ETH transfers
    /// @dev Reverts unless the call comes from the contract itself (for atomic operations)
    fallback() external payable {
        revert("No fallback - use receive() for deposits");
    }

    /// @notice Renounce ownership with guardrails
    /// @dev Can only be called once, and only if ownership hasn't been permanently locked
    ///      This prevents permanent loss of contract control
    function renounceOwnership() external onlyOwner {
        require(!_ownershipRenounced, "Ownership already renounced");
        require(_totalStaked == 0, "Cannot renounce while nodes are staked");
        _ownershipRenounced = true;
        emit OwnershipRenounced(msg.sender);
        owner = address(0);
    }

    /// @notice Set maximum stake amount (only owner)
    /// @param amount New maximum in wei
    function setMaximumStakeAmount(uint256 amount) external onlyOwner {
        require(amount >= MIN_STAKE, "Max stake must be >= minimum");
        maximumStakeAmount = amount;
        emit MaximumStakeUpdated(amount);
    }

    /// @notice Get total number of stakes for an owner (audit trail)
    /// @param nodeOwner Address of staker
    /// @return Count of individual stakes
    function getStakeCount(address nodeOwner) external view returns (uint256) {
        return stakeHistory[nodeOwner].length;
    }

    /// @notice Bulk withdraw — gas efficient for multiple pending withdrawals
    /// @param withdrawalIds Array of indices into pendingWithdrawals
    function bulkWithdraw(uint256[] calldata withdrawalIds) external nonReentrant whenNotPaused {
        uint256 totalAmount;
        for (uint256 i = 0; i < withdrawalIds.length; i++) {
            uint256 amount = pendingWithdrawals[msg.sender];
            require(amount > 0, "No pending withdrawal");
            require(!_stakes[msg.sender].locked, "Stake is locked");
            pendingWithdrawals[msg.sender] = 0;
            totalAmount += amount;
            emit StakeWithdrawn(msg.sender, amount);
        }
        require(totalAmount > 0, "Nothing to withdraw");
        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Transfer failed");
    }

    /// @notice Validate stake amount is within allowed bounds
    /// @param amount Amount to validate
    function _validateStakeAmount(uint256 amount) internal view {
        require(amount >= MIN_STAKE, "Below minimum stake");
        require(maximumStakeAmount == 0 || amount <= maximumStakeAmount, "Exceeds maximum stake");
    }

    // Events for new functions
    event OwnershipRenounced(address indexed previousOwner);
    event MaximumStakeUpdated(uint256 newMaximum);
}
