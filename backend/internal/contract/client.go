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

	escrow "github.com/tentrist.ai/backend/internal/contract/bindings/escrow"
	noderegistry "github.com/tentrist.ai/backend/internal/contract/bindings/noderegistry"
	slacontract "github.com/tentrist.ai/backend/internal/contract/bindings/slacontract"
	slashmanager "github.com/tentrist.ai/backend/internal/contract/bindings/slashmanager"
	reputationledger "github.com/tentrist.ai/backend/internal/contract/bindings/reputationledger"
)

// ContractClient is a unified client for all Tentrist smart contracts.
type ContractClient struct {
	ethClient           *ethclient.Client
	escrow              *escrow.Escrow
	slaContract         *slacontract.Slacontract
	slashManager        *slashmanager.Slashmanager
	reputationLedger    *reputationledger.Reputationledger
	nodeRegistry        *noderegistry.Noderegistry
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
	escrowContract, err := escrow.NewEscrow(addrs.Escrow, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind Escrow: %w", err)
	}

	slaContract, err := slacontract.NewSlacontract(addrs.SLAContract, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind SLAContract: %w", err)
	}

	slashMgr, err := slashmanager.NewSlashmanager(addrs.SlashManager, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind SlashManager: %w", err)
	}

	reputation, err := reputationledger.NewReputationledger(addrs.ReputationLedger, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind ReputationLedger: %w", err)
	}

	nodeReg, err := noderegistry.NewNoderegistry(addrs.NodeRegistry, ethClient)
	if err != nil {
		return nil, fmt.Errorf("failed to bind NodeRegistry: %w", err)
	}

	return &ContractClient{
		ethClient:         ethClient,
		escrow:             escrowContract,
		slaContract:        slaContract,
		slashManager:       slashMgr,
		reputationLedger:   reputation,
		nodeRegistry:       nodeReg,
		contractAddresses:   addrs,
	}, nil
}

// ============================================================================
// Escrow Operations
// ============================================================================

// Stake deposits ETH for a node in the Escrow contract (uses tx value).
func (c *ContractClient) Stake(ctx context.Context, node common.Address, amount *big.Int) (*types.Transaction, error) {
	return c.escrow.Stake(&bind.TransactOpts{
		From:  node,
		Value: amount,
	})
}

// Withdraw stake from Escrow.
func (c *ContractClient) Withdraw(ctx context.Context, from common.Address, amount *big.Int) (*types.Transaction, error) {
	return c.escrow.Withdraw(&bind.TransactOpts{
		From: from,
	}, amount)
}

// GetStake returns the current stake amount for a node.
func (c *ContractClient) GetStake(ctx context.Context, node common.Address) (*big.Int, error) {
	return c.escrow.GetStake(&bind.CallOpts{Context: ctx}, node)
}

// HasStaked returns true if the node has staked.
func (c *ContractClient) HasStaked(ctx context.Context, node common.Address) (bool, error) {
	return c.escrow.HasStaked(&bind.CallOpts{Context: ctx}, node)
}

// GetTotalStaked returns the total staked across all nodes.
func (c *ContractClient) GetTotalStaked(ctx context.Context) (*big.Int, error) {
	return c.escrow.GetTotalStaked(&bind.CallOpts{Context: ctx})
}

// AuthorizeSlasher sets the slasher address (owner only).
func (c *ContractClient) AuthorizeSlasher(ctx context.Context, from, slasher common.Address) (*types.Transaction, error) {
	return c.escrow.AuthorizeSlasher(&bind.TransactOpts{From: from}, slasher)
}

// ============================================================================
// NodeRegistry Operations
// ============================================================================

// RegisterNode registers a new GPU node with the protocol.
func (c *ContractClient) RegisterNode(ctx context.Context, node common.Address, stakeAmount *big.Int) (*types.Transaction, error) {
	return c.nodeRegistry.RegisterNode(&bind.TransactOpts{
		From:  node,
		Value: stakeAmount,
	}, stakeAmount)
}

// GetNode returns full node info.
func (c *ContractClient) GetNode(ctx context.Context, node common.Address) (noderegistry.INodeRegistryNode, error) {
	return c.nodeRegistry.GetNode(&bind.CallOpts{Context: ctx}, node)
}

// IsRegistered checks if a node is registered.
func (c *ContractClient) IsRegistered(ctx context.Context, node common.Address) (bool, error) {
	return c.nodeRegistry.IsRegistered(&bind.CallOpts{Context: ctx}, node)
}

// GetNodeStatus returns the node's current status.
func (c *ContractClient) GetNodeStatus(ctx context.Context, node common.Address) (uint8, error) {
	return c.nodeRegistry.GetNodeStatus(&bind.CallOpts{Context: ctx}, node)
}

// UpdateHeartbeat updates the last heartbeat timestamp for a node.
func (c *ContractClient) UpdateHeartbeat(ctx context.Context, node, from common.Address) (*types.Transaction, error) {
	return c.nodeRegistry.UpdateHeartbeat(&bind.TransactOpts{From: from}, node)
}

// GetReputation returns a node's reputation score from NodeRegistry.
func (c *ContractClient) GetNodeReputation(ctx context.Context, node common.Address) (*big.Int, error) {
	return c.nodeRegistry.GetReputation(&bind.CallOpts{Context: ctx}, node)
}

// GetAllNodes returns all registered node addresses.
func (c *ContractClient) GetAllNodes(ctx context.Context) ([]common.Address, error) {
	return c.nodeRegistry.GetAllNodes(&bind.CallOpts{Context: ctx})
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
	uptimeBig := new(big.Int).SetUint64(uptime)
	throughputBig := new(big.Int).SetUint64(throughput)
	return c.slaContract.RecordSLA(
		&bind.TransactOpts{From: from},
		jobId,
		uptimeBig,
		throughputBig,
		deadlineTs,
	)
}

// GetSLA returns SLA benchmarks for a job.
func (c *ContractClient) GetSLA(ctx context.Context, jobId [32]byte) (slacontract.SLABenchmark, error) {
	return c.slaContract.GetSLA(&bind.CallOpts{Context: ctx}, jobId)
}

// HasSLA checks if a job has SLA recorded.
func (c *ContractClient) HasSLA(ctx context.Context, jobId [32]byte) (bool, error) {
	return c.slaContract.HasSLA(&bind.CallOpts{Context: ctx}, jobId)
}

// IsFulfilled checks if a job's SLA was fulfilled.
func (c *ContractClient) IsFulfilled(ctx context.Context, jobId [32]byte) (bool, error) {
	return c.slaContract.IsFulfilled(&bind.CallOpts{Context: ctx}, jobId)
}

// IsBreached checks if a job has breached its deadline.
func (c *ContractClient) IsBreached(ctx context.Context, jobId [32]byte) (bool, error) {
	return c.slaContract.IsBreached(&bind.CallOpts{Context: ctx}, jobId)
}

// FulfillSLA marks an SLA as fulfilled or breached.
func (c *ContractClient) FulfillSLA(ctx context.Context, from common.Address, jobId [32]byte, success bool) (*types.Transaction, error) {
	return c.slaContract.FulfillSLA(&bind.TransactOpts{From: from}, jobId, success)
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
		&bind.TransactOpts{From: from},
		node,
		client,
		jobId,
		jobValue,
	)
}

// CalculateSlash returns the slash amount for a given job value.
func (c *ContractClient) CalculateSlash(ctx context.Context, jobValue *big.Int) (*big.Int, error) {
	return c.slashManager.CalculateSlash(&bind.CallOpts{Context: ctx}, jobValue)
}

// CalculateCredit returns the client credit amount for a given job value.
func (c *ContractClient) CalculateCredit(ctx context.Context, jobValue *big.Int) (*big.Int, error) {
	return c.slashManager.CalculateCredit(&bind.CallOpts{Context: ctx}, jobValue)
}

// GetSlashPercent returns the slash percentage (basis points).
func (c *ContractClient) GetSlashPercent(ctx context.Context) (*big.Int, error) {
	return c.slashManager.GetSlashPercent(&bind.CallOpts{Context: ctx})
}

// GetCreditPercent returns the credit percentage (basis points).
func (c *ContractClient) GetCreditPercent(ctx context.Context) (*big.Int, error) {
	return c.slashManager.GetCreditPercent(&bind.CallOpts{Context: ctx})
}

// ============================================================================
// ReputationLedger Operations
// ============================================================================

// InitializeNode initializes a node's reputation in the ledger.
func (c *ContractClient) InitializeNode(ctx context.Context, from, node common.Address) (*types.Transaction, error) {
	return c.reputationLedger.InitializeNode(&bind.TransactOpts{From: from}, node)
}

// IncrementReputation increases a node's reputation score.
func (c *ContractClient) IncrementReputation(ctx context.Context, from, node common.Address, delta *big.Int) (*types.Transaction, error) {
	return c.reputationLedger.IncrementReputation(&bind.TransactOpts{From: from}, node, delta)
}

// DecrementReputation decreases a node's reputation score.
func (c *ContractClient) DecrementReputation(ctx context.Context, from, node common.Address, delta *big.Int) (*types.Transaction, error) {
	return c.reputationLedger.DecrementReputation(&bind.TransactOpts{From: from}, node, delta)
}

// GetReputation returns a node's reputation score.
func (c *ContractClient) GetReputation(ctx context.Context, node common.Address) (*big.Int, error) {
	return c.reputationLedger.GetReputation(&bind.CallOpts{Context: ctx}, node)
}

// GetReputationTier returns the reputation tier string for a node.
func (c *ContractClient) GetReputationTier(ctx context.Context, node common.Address) (string, error) {
	return c.reputationLedger.GetReputationTier(&bind.CallOpts{Context: ctx}, node)
}

// ApplyDecay applies reputation decay to a node.
func (c *ContractClient) ApplyDecay(ctx context.Context, from, node common.Address) (*types.Transaction, error) {
	return c.reputationLedger.ApplyDecay(&bind.TransactOpts{From: from}, node)
}

// BatchApplyDecay applies reputation decay to multiple nodes.
func (c *ContractClient) BatchApplyDecay(ctx context.Context, from common.Address, nodes []common.Address) (*types.Transaction, error) {
	return c.reputationLedger.BatchApplyDecay(&bind.TransactOpts{From: from}, nodes)
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
