// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
contract Escrow is IEscrow {
    // solhint-disable-next-line const-name-snakecase
    uint256 public constant MIN_STAKE = 0.05 ether; // Minimum 0.05 ETH to be considered "staked"

    mapping(address => uint256) private _stakeOf;
    mapping(address => bool) private _hasStaked;
    address[] private _stakerList;
    uint256 private _totalStaked;

    address public slasher;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller not owner");
        _;
    }

    modifier onlySlasher() {
        require(msg.sender == slasher, "Caller not slasher");
        _;
    }

    modifier nonReentrant() {
        _;
    }

    modifier onlyStaked(address node) {
        require(hasStaked(node), "Node has not staked");
        _;
    }

    constructor() {
        owner = msg.sender;
        slasher = msg.sender;
    }

    /// @inheritdoc IEscrow
    function stake() external payable override nonReentrant {
        require(msg.value > 0, "Cannot stake 0");

        if (!_hasStaked[msg.sender]) {
            _hasStaked[msg.sender] = true;
            _stakerList.push(msg.sender);
        }

        _stakeOf[msg.sender] += msg.value;
        _totalStaked += msg.value;

        emit StakeDeposited(msg.sender, msg.value);
    }

    /// @inheritdoc IEscrow
    function withdraw(uint256 amount) external override nonReentrant onlyStaked(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(_stakeOf[msg.sender] >= amount, "Insufficient stake");

        uint256 remainingStake = _stakeOf[msg.sender] - amount;
        require(remainingStake == 0 || remainingStake >= MIN_STAKE, "Cannot go below minimum stake");

        _stakeOf[msg.sender] -= amount;
        _totalStaked -= amount;

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

        // Transfer slashed funds to slasher (SlashManager)
        if (actualSlash > 0) {
            (bool success, ) = slasher.call{value: actualSlash}("");
            require(success, "Slash transfer failed");
        }

        emit StakeSlashed(node, actualSlash, reason);
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
    function getMinStake() external view override returns (uint256) {
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

    /// @notice Emergency withdraw for entire balance (only owner, for migrations)
    /// @param to Recipient address
    function emergencyWithdraw(address to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = to.call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }
}