// Package contract provides a unified Go client for interacting with the Tentrist smart contracts.
package contract

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"

	bindings "github.com/tentrist.ai/backend/internal/contract/bindings"
)

// ContractClient is a unified client for all Tentrist smart contracts.
type ContractClient struct {
	ethClient           *ethclient.Client
	escrow              *bindings.Escrow
	slaContract         *bindings.SLAContract
	slashManager        *bindings.SlashManager
	reputationLedger    *bindings.ReputationLedger
	nodeRegistry        *bindings.NodeRegistry
	contractAddresses    ContractAddresses
}

// ContractAddresses holds all deployed contract addresses.
type ContractAddresses struct {
	Escrow            common.Address
	SLAContract       common.Address
	SlashManager      common.Address
	ReputationLedger  common.Address
	NodeRegistry      common.Address
}

// NewContractClient creates a new ContractClient with the given ethclient and contract addresses.
func NewContractClient(ethClient *ethclient.Client, addrs ContractAddresses) (*ContractClient, error) {
	escrow, err := bindings.NewEscrow(addrs.Escrow, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind Escrow: %w", err)
	}

	slaContract, err := bindings.NewSLAContract(addrs.SLAContract, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind SLAContract: %w", err)
	}

	slashManager, err := bindings.NewSlashManager(addrs.SlashManager, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind SlashManager: %w", err)
	}

	reputationLedger, err := bindings.NewReputationLedger(addrs.ReputationLedger, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind ReputationLedger: %w", err)
	}

	nodeRegistry, err := bindings.NewNodeRegistry(addrs.NodeRegistry, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind NodeRegistry: %w", err)
	}

	return &ContractClient{
		ethClient:         ethClient,
		escrow:             escrow,
		slaContract:        slaContract,
		slashManager:       slashManager,
		reputationLedger:   reputationLedger,
		nodeRegistry:       nodeRegistry,
		contractAddresses:   addrs,
	}, nil
}

// ============================================================================
// Escrow Operations
// ============================================================================

// Stake deposits ETH for a node in the Escrow contract.
func (c *ContractClient) Stake(ctx context.Context, node common.Address, amount *big.Int) (*types.Transaction, error) {
	return c.escrow.Stake(&bind.TransactOpts{
		From:  node,
		Value: amount,
		ctx:   ctx,
	})
}

// Withdraw stake from Escrow.
func (c *ContractClient) Withdraw(ctx context.Context, node, from common.Address, amount *big.Int) (*types.Transaction, error) {
	return c.escrow.Withdraw(&bind.TransactOpts{
		From: from,
		ctx:  ctx,
	}, amount)
}

// GetStake returns the current stake amount for a node.
func (c *ContractClient) GetStake(ctx context.Context, node common.Address) (*big.Int, error) {
	return c.escrow.GetStake(&bind.CallOpts{ctx: ctx}, node)
}

// HasStaked returns true if the node has staked.
func (c *ContractClient) HasStaked(ctx context.Context, node common.Address) (bool, error) {
	return c.escrow.HasStaked(&bind.CallOpts{ctx: ctx}, node)
}

// GetTotalStaked returns the total staked across all nodes.
func (c *ContractClient) GetTotalStaked(ctx context.Context) (*big.Int, error) {
	return c.escrow.GetTotalStaked(&bind.CallOpts{ctx: ctx})
}

// AuthorizeSlasher sets the slasher address (owner only).
func (c *ContractClient) AuthorizeSlasher(ctx context.Context, from, slasher common.Address) (*types.Transaction, error) {
	return c.escrow.AuthorizeSlasher(&bind.TransactOpts{From: from, ctx: ctx}, slasher)
}

// ============================================================================
// NodeRegistry Operations
// ============================================================================

// RegisterNode registers a new GPU node with the protocol.
func (c *ContractClient) RegisterNode(ctx context.Context, node common.Address, stakeAmount *big.Int) (*types.Transaction, error) {
	return c.nodeRegistry.RegisterNode(&bind.TransactOpts{
		From:  node,
		Value: stakeAmount,
		ctx:   ctx,
	}, stakeAmount)
}

// GetNode returns full node info.
func (c *ContractClient) GetNode(ctx context.Context, node common.Address) (bindings.NodeRegistryNode, error) {
	return c.nodeRegistry.GetNode(&bind.CallOpts{ctx: ctx}, node)
}

// IsRegistered checks if a node is registered.
func (c *ContractClient) IsRegistered(ctx context.Context, node common.Address) (bool, error) {
	return c.nodeRegistry.IsRegistered(&bind.CallOpts{ctx: ctx}, node)
}

// GetNodeStatus returns the node's current status.
func (c *ContractClient) GetNodeStatus(ctx context.Context, node common.Address) (uint8, error) {
	return c.nodeRegistry.GetNodeStatus(&bind.CallOpts{ctx: ctx}, node)
}

// UpdateHeartbeat updates the last heartbeat timestamp for a node.
func (c *ContractClient) UpdateHeartbeat(ctx context.Context, node, from common.Address) (*types.Transaction, error) {
	return c.nodeRegistry.UpdateHeartbeat(&bind.TransactOpts{From: from, ctx: ctx}, node)
}

// GetReputation returns a node's reputation score from NodeRegistry.
func (c *ContractClient) GetNodeReputation(ctx context.Context, node common.Address) (*big.Int, error) {
	return c.nodeRegistry.GetReputation(&bind.CallOpts{ctx: ctx}, node)
}

// GetAllNodes returns all registered node addresses.
func (c *ContractClient) GetAllNodes(ctx context.Context) ([]common.Address, error) {
	return c.nodeRegistry.GetAllNodes(&bind.CallOpts{ctx: ctx})
}

// ============================================================================
// SLAContract Operations
// ============================================================================

// RecordSLA records SLA benchmarks for a compute job.
func (c *ContractClient) RecordSLA(
	ctx context.Context,
	from common.Address,
	jobId [32]byte,
	uptime, throughput uint64,
	deadline time.Time,
) (*types.Transaction, error) {
	deadlineTs := big.NewInt(deadline.Unix())
	return c.slaContract.RecordSLA(
		&bind.TransactOpts{From: from, ctx: ctx},
		jobId,
		uptime,
		throughput,
		deadlineTs,
	)
}

// GetSLA returns SLA benchmarks for a job.
func (c *ContractClient) GetSLA(ctx context.Context, jobId [32]byte) (bindings.SLAContractSLABenchmark, error) {
	return c.slaContract.GetSLA(&bind.CallOpts{ctx: ctx}, jobId)
}

// HasSLA checks if a job has SLA recorded.
func (c *ContractClient) HasSLA(ctx context.Context, jobId [32]byte) (bool, error) {
	return c.slaContract.HasSLA(&bind.CallOpts{ctx: ctx}, jobId)
}

// IsFulfilled checks if a job's SLA was fulfilled.
func (c *ContractClient) IsFulfilled(ctx context.Context, jobId [32]byte) (bool, error) {
	return c.slaContract.IsFulfilled(&bind.CallOpts{ctx: ctx}, jobId)
}

// IsBreached checks if a job has breached its deadline.
func (c *ContractClient) IsBreached(ctx context.Context, jobId [32]byte) (bool, error) {
	return c.slaContract.IsBreached(&bind.CallOpts{ctx: ctx}, jobId)
}

// FulfillSLA marks an SLA as fulfilled or breached.
func (c *ContractClient) FulfillSLA(ctx context.Context, from common.Address, jobId [32]byte, success bool) (*types.Transaction, error) {
	return c.slaContract.FulfillSLA(&bind.TransactOpts{From: from, ctx: ctx}, jobId, success)
}

// ============================================================================
// SlashManager Operations
// ============================================================================

// SlashAndCredit slashes a node's stake and credits the affected client.
func (c *ContractClient) SlashAndCredit(
	ctx context.Context,
	from common.Address,
	node, client common.Address,
	jobId [32]byte,
	jobValue *big.Int,
) (*types.Transaction, error) {
	return c.slashManager.SlashAndCredit(
		&bind.TransactOpts{From: from, ctx: ctx},
		node,
		client,
		jobId,
		jobValue,
	)
}

// CalculateSlash returns the slash amount for a given job value.
func (c *ContractClient) CalculateSlash(ctx context.Context, jobValue *big.Int) (*big.Int, error) {
	return c.slashManager.CalculateSlash(&bind.CallOpts{ctx: ctx}, jobValue)
}

// CalculateCredit returns the client credit amount for a given job value.
func (c *ContractClient) CalculateCredit(ctx context.Context, jobValue *big.Int) (*big.Int, error) {
	return c.slashManager.CalculateCredit(&bind.CallOpts{ctx: ctx}, jobValue)
}

// GetSlashPercent returns the slash percentage (basis points).
func (c *ContractClient) GetSlashPercent(ctx context.Context) (*big.Int, error) {
	return c.slashManager.GetSlashPercent(&bind.CallOpts{ctx: ctx})
}

// GetCreditPercent returns the credit percentage (basis points).
func (c *ContractClient) GetCreditPercent(ctx context.Context) (*big.Int, error) {
	return c.slashManager.GetCreditPercent(&bind.CallOpts{ctx: ctx})
}

// ============================================================================
// ReputationLedger Operations
// ============================================================================

// InitializeNode initializes a node's reputation in the ledger.
func (c *ContractClient) InitializeNode(ctx context.Context, from, node common.Address) (*types.Transaction, error) {
	return c.reputationLedger.InitializeNode(&bind.TransactOpts{From: from, ctx: ctx}, node)
}

// IncrementReputation increases a node's reputation score.
func (c *ContractClient) IncrementReputation(ctx context.Context, from, node common.Address, delta *big.Int) (*types.Transaction, error) {
	return c.reputationLedger.IncrementReputation(&bind.TransactOpts{From: from, ctx: ctx}, node, delta)
}

// DecrementReputation decreases a node's reputation score.
func (c *ContractClient) DecrementReputation(ctx context.Context, from, node common.Address, delta *big.Int) (*types.Transaction, error) {
	return c.reputationLedger.DecrementReputation(&bind.TransactOpts{From: from, ctx: ctx}, node, delta)
}

// GetReputation returns a node's reputation score.
func (c *ContractClient) GetReputation(ctx context.Context, node common.Address) (*big.Int, error) {
	return c.reputationLedger.GetReputation(&bind.CallOpts{ctx: ctx}, node)
}

// GetReputationTier returns the reputation tier string for a node.
func (c *ContractClient) GetReputationTier(ctx context.Context, node common.Address) (string, error) {
	return c.reputationLedger.GetReputationTier(&bind.CallOpts{ctx: ctx}, node)
}

// ApplyDecay applies reputation decay to a node.
func (c *ContractClient) ApplyDecay(ctx context.Context, from, node common.Address) (*types.Transaction, error) {
	return c.reputationLedger.ApplyDecay(&bind.TransactOpts{From: from, ctx: ctx}, node)
}

// BatchApplyDecay applies reputation decay to multiple nodes.
func (c *ContractClient) BatchApplyDecay(ctx context.Context, from common.Address, nodes []common.Address) (*types.Transaction, error) {
	return c.reputationLedger.BatchApplyDecay(&bind.TransactOpts{From: from, ctx: ctx}, nodes)
}

// ============================================================================
// Utility Methods
// ============================================================================

// Client returns the underlying ethclient.
func (c *ContractClient) Client() *ethclient.Client {
	return c.ethClient
}

// Addresses returns the contract addresses.
func (c *ContractClient) Addresses() ContractAddresses {
	return c.contractAddresses
}

// WaitForTx waits for a transaction to be mined.
func (c *ContractClient) WaitForTx(ctx context.Context, tx *types.Transaction) (*types.Receipt, error) {
	return c.ethClient.TransactionReceipt(ctx, tx.Hash())
}
