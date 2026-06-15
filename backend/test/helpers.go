// Package test provides integration test helpers for the Tentrist backend.
package test

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"
	"testing"
	"time"

	"github.com/tentrist.ai/backend/pkg/types"
)

// =============================================================================
// Test Accounts & Addresses
// =============================================================================

// TestAccounts holds pre-funded test accounts for integration testing.
type TestAccounts struct {
	Deployer [20]byte
	Slasher  [20]byte
	Client   [20]byte
	Node1    [20]byte
	Node2    [20]byte
	Node3    [20]byte
}

// DefaultTestAccounts returns a set of default test accounts.
// These match the Hardhat named accounts configured in hardhat.config.cjs.
func DefaultTestAccounts() *TestAccounts {
	return &TestAccounts{
		Deployer: hexToAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
		Slasher:  hexToAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
		Client:   hexToAddress("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"),
		Node1:    hexToAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906"),
		Node2:    hexToAddress("0x15dCb0B3cD3Ba2a38BEE68Da1E27E8a7a4d5a6b9"),
		Node3:    hexToAddress("0x8f864C2Cc76d7C44Be2E7fB1c3C3d2a6E8f9c1D3"),
	}
}

// =============================================================================
// Test Node Fixtures
// =============================================================================

// TestNodeFixture creates a pre-configured test node.
type TestNodeFixture struct {
	Address    [20]byte
	StakeAmount *big.Int
	Reputation *big.Int
	Status     types.NodeStatus
}

// NewTestNodeFixture creates a new test node with default values.
func NewTestNodeFixture(addr [20]byte) *TestNodeFixture {
	return &TestNodeFixture{
		Address:    addr,
		StakeAmount: big.NewInt(2e18), // 2 ETH default stake
		Reputation: big.NewInt(100),
		Status:     types.NodeOnline,
	}
}

// WithStake sets a custom stake amount.
func (f *TestNodeFixture) WithStake(amount *big.Int) *TestNodeFixture {
	f.StakeAmount = amount
	return f
}

// WithReputation sets a custom reputation.
func (f *TestNodeFixture) WithReputation(rep *big.Int) *TestNodeFixture {
	f.Reputation = rep
	return f
}

// WithStatus sets a custom status.
func (f *TestNodeFixture) WithStatus(status types.NodeStatus) *TestNodeFixture {
	f.Status = status
	return f
}

// ToNode converts the fixture to a types.Node.
func (f *TestNodeFixture) ToNode() *types.Node {
	return &types.Node{
		Address:       f.Address,
		StakeAmount:   f.StakeAmount,
		Reputation:    f.Reputation,
		Status:        f.Status,
		LastHeartbeat: time.Now(),
		RegisteredAt:  time.Now(),
	}
}

// =============================================================================
// Test Job Fixtures
// =============================================================================

// TestJobFixture creates a pre-configured test job.
type TestJobFixture struct {
	ID              [32]byte
	ClientID        [20]byte
	RequiredUptime   uint64
	RequiredThroughput uint64
	Deadline        time.Time
	Status          types.JobStatus
	AssignedNodes   [][20]byte
}

// NewTestJobFixture creates a new test job with default values.
func NewTestJobFixture(clientID [20]byte) *TestJobFixture {
	var jobID [32]byte
	rand.Read(jobID[:])

	return &TestJobFixture{
		ID:              jobID,
		ClientID:        clientID,
		RequiredUptime:   9900, // 99%
		RequiredThroughput: 100,
		Deadline:        time.Now().Add(1 * time.Hour),
		Status:          types.JobPending,
		AssignedNodes:   make([][20]byte, 0),
	}
}

// WithDeadline sets a custom deadline.
func (f *TestJobFixture) WithDeadline(deadline time.Time) *TestJobFixture {
	f.Deadline = deadline
	return f
}

// WithUptime sets a custom uptime requirement.
func (f *TestJobFixture) WithUptime(uptime uint64) *TestJobFixture {
	f.RequiredUptime = uptime
	return f
}

// WithThroughput sets a custom throughput requirement.
func (f *TestJobFixture) WithThroughput(tp uint64) *TestJobFixture {
	f.RequiredThroughput = tp
	return f
}

// WithStatus sets a custom status.
func (f *TestJobFixture) WithStatus(status types.JobStatus) *TestJobFixture {
	f.Status = status
	return f
}

// WithAssignedNode adds an assigned node.
func (f *TestJobFixture) WithAssignedNode(node [20]byte) *TestJobFixture {
	f.AssignedNodes = append(f.AssignedNodes, node)
	return f
}

// ToJob converts the fixture to a types.Job.
func (f *TestJobFixture) ToJob() *types.Job {
	return &types.Job{
		ID:            f.ID,
		ClientID:      f.ClientID,
		SLABenchmark: types.SLABenchmark{
			RequiredUptime:     f.RequiredUptime,
			RequiredThroughput: f.RequiredThroughput,
			Deadline:           f.Deadline,
			Fulfilled:          false,
		},
		Status:        f.Status,
		AssignedNodes: f.AssignedNodes,
		Deadline:      f.Deadline,
		CreatedAt:     time.Now(),
	}
}

// ToSLABenchmark converts the fixture to a types.SLABenchmark.
func (f *TestJobFixture) ToSLABenchmark() *types.SLABenchmark {
	return &types.SLABenchmark{
		RequiredUptime:     f.RequiredUptime,
		RequiredThroughput: f.RequiredThroughput,
		Deadline:           f.Deadline,
		Fulfilled:          false,
	}
}

// =============================================================================
// Test Heartbeat Fixtures
// =============================================================================

// TestHeartbeatFixture creates a pre-configured test heartbeat.
type TestHeartbeatFixture struct {
	NodeID          [20]byte
	VRAMUsedMB      uint64
	VRAMTotalMB     uint64
	PacketLatencyMs uint64
	Timestamp      time.Time
}

// NewTestHeartbeatFixture creates a new test heartbeat with default values.
func NewTestHeartbeatFixture(nodeID [20]byte) *TestHeartbeatFixture {
	return &TestHeartbeatFixture{
		NodeID:          nodeID,
		VRAMUsedMB:      4096,
		VRAMTotalMB:     8192,
		PacketLatencyMs: 15,
		Timestamp:       time.Now(),
	}
}

// WithVRAM sets VRAM usage.
func (f *TestHeartbeatFixture) WithVRAM(used, total uint64) *TestHeartbeatFixture {
	f.VRAMUsedMB = used
	f.VRAMTotalMB = total
	return f
}

// WithLatency sets packet latency.
func (f *TestHeartbeatFixture) WithLatency(latency uint64) *TestHeartbeatFixture {
	f.PacketLatencyMs = latency
	return f
}

// WithTimestamp sets a custom timestamp.
func (f *TestHeartbeatFixture) WithTimestamp(ts time.Time) *TestHeartbeatFixture {
	f.Timestamp = ts
	return f
}

// ToHeartbeat converts the fixture to a types.Heartbeat.
func (f *TestHeartbeatFixture) ToHeartbeat() *types.Heartbeat {
	return &types.Heartbeat{
		NodeID:          f.NodeID,
		VRAMUsedMB:      f.VRAMUsedMB,
		VRAMTotalMB:     f.VRAMTotalMB,
		PacketLatencyMs: f.PacketLatencyMs,
		Timestamp:       f.Timestamp,
	}
}

// =============================================================================
// Test Config Fixtures
// =============================================================================

// TestConfig returns a test configuration.
func TestConfig() *types.Config {
	cfg := types.NewDefaultConfig()
	cfg.HeartbeatInterval = 5 * time.Second  // Shortened for testing
	cfg.StaleThreshold = 10 * time.Second   // Shortened for testing
	cfg.CheckpointInterval = 5 * time.Second
	return cfg
}

// =============================================================================
// Utility Functions
// =============================================================================

// hexToAddress converts a hex string to a 20-byte address.
func hexToAddress(s string) [20]byte {
	var addr [20]byte
	data, err := hex.DecodeString(s)
	if err != nil || len(data) != 20 {
		// Return empty address if invalid
		return addr
	}
	copy(addr[:], data)
	return addr
}

// RandomAddress generates a random 20-byte address.
func RandomAddress() [20]byte {
	var addr [20]byte
	rand.Read(addr[:])
	return addr
}

// RandomJobID generates a random 32-byte job ID.
func RandomJobID() [32]byte {
	var id [32]byte
	rand.Read(id[:])
	return id
}

// =============================================================================
// Assertions (for test helpers)
// =============================================================================

// AssertNodeStatus checks if a node has the expected status.
func AssertNodeStatus(t *testing.T, node *types.Node, expected types.NodeStatus) {
	if node.Status != expected {
		t.Errorf("expected node status %v, got %v", expected, node.Status)
	}
}

// AssertJobStatus checks if a job has the expected status.
func AssertJobStatus(t *testing.T, job *types.Job, expected types.JobStatus) {
	if job.Status != expected {
		t.Errorf("expected job status %v, got %v", expected, job.Status)
	}
}

// AssertSlashResult validates a slash result.
func AssertSlashResult(t *testing.T, result *types.SlashResult) {
	if result.SlashAmount.Sign() <= 0 {
		t.Error("expected positive slash amount")
	}
	if result.CreditAmount.Sign() <= 0 {
		t.Error("expected positive credit amount")
	}
	if result.SlashAmount.Cmp(result.CreditAmount) < 0 {
		t.Error("slash amount should be >= credit amount")
	}
}

// Mock testing.T for non-test context
type mockT struct {
	errs []string
}

func (m *mockT) Errorf(format string, args ...interface{}) {
	m.errs = append(m.errs, fmt.Sprintf(format, args...))
}

func (m *mockT) Failed() bool {
	return len(m.errs) > 0
}
