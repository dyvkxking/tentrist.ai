// Package bindings contains mock bindings for integration testing.
package bindings

import (
	"sync"
	"time"
)

// MockEscrow is a mock implementation of the Escrow contract for testing.
type MockEscrow struct {
	mu         sync.RWMutex
	stakes     map[string]uint64
	totalStaked uint64
}

// NewMockEscrow creates a new MockEscrow.
func NewMockEscrow() *MockEscrow {
	return &MockEscrow{
		stakes: make(map[string]uint64),
	}
}

// GetStake returns the stake for an address.
func (m *MockEscrow) GetStake(nodeID string) uint64 {
	m.mu.RLock()
	defer m.mu.RUnlock()
	stake, ok := m.stakes[nodeID]
	if !ok {
		return 0
	}
	return stake
}

// AddStake adds stake for an address.
func (m *MockEscrow) AddStake(nodeID string, amount uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.stakes[nodeID] += amount
	m.totalStaked += amount
}

// GetTotalStaked returns the total staked amount.
func (m *MockEscrow) GetTotalStaked() uint64 {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.totalStaked
}

// MockSlashManager is a mock implementation of the SlashManager for testing.
type MockSlashManager struct {
	mu          sync.RWMutex
	slashEvents []SlashEvent
}

// SlashEvent represents a slash event.
type SlashEvent struct {
	Node      string
	Client    string
	JobID     string
	Amount    uint64
	Timestamp time.Time
}

// NewMockSlashManager creates a new MockSlashManager.
func NewMockSlashManager() *MockSlashManager {
	return &MockSlashManager{
		slashEvents: make([]SlashEvent, 0),
	}
}

// RecordSlash records a slash event.
func (m *MockSlashManager) RecordSlash(nodeID, clientID, jobID string, amount uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.slashEvents = append(m.slashEvents, SlashEvent{
		Node:      nodeID,
		Client:    clientID,
		JobID:     jobID,
		Amount:    amount,
		Timestamp: time.Now(),
	})
}

// GetSlashEvents returns all slash events.
func (m *MockSlashManager) GetSlashEvents() []SlashEvent {
	m.mu.Lock()
	defer m.mu.Unlock()
	events := make([]SlashEvent, len(m.slashEvents))
	copy(events, m.slashEvents)
	return events
}

// GetSlashCount returns the number of slash events.
func (m *MockSlashManager) GetSlashCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.slashEvents)
}

// MockReputationLedger is a mock implementation of the ReputationLedger for testing.
type MockReputationLedger struct {
	mu          sync.RWMutex
	reputations map[string]int64
}

// NewMockReputationLedger creates a new MockReputationLedger.
func NewMockReputationLedger() *MockReputationLedger {
	return &MockReputationLedger{
		reputations: make(map[string]int64),
	}
}

// GetReputation returns the reputation for an address.
func (m *MockReputationLedger) GetReputation(nodeID string) int64 {
	m.mu.RLock()
	defer m.mu.RUnlock()
	rep, ok := m.reputations[nodeID]
	if !ok {
		return 0
	}
	return rep
}

// IncrementReputation increments a node's reputation.
func (m *MockReputationLedger) IncrementReputation(nodeID string, delta int64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.reputations[nodeID] += delta
}

// DecrementReputation decrements a node's reputation.
func (m *MockReputationLedger) DecrementReputation(nodeID string, delta int64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.reputations[nodeID] -= delta
}

// MockNodeRegistry is a mock implementation of the NodeRegistry for testing.
type MockNodeRegistry struct {
	mu           sync.RWMutex
	nodes        map[string]*MockNode
	lastHeartbeat map[string]time.Time
}

// MockNode represents a node in the mock registry.
type MockNode struct {
	Address       string
	StakeAmount   uint64
	Reputation    int64
	Status        uint8 // 0=offline, 1=online, 2=stale, 3=slashed
	LastHeartbeat time.Time
}

// NewMockNodeRegistry creates a new MockNodeRegistry.
func NewMockNodeRegistry() *MockNodeRegistry {
	return &MockNodeRegistry{
		nodes:        make(map[string]*MockNode),
		lastHeartbeat: make(map[string]time.Time),
	}
}

// RegisterNode registers a new node.
func (m *MockNodeRegistry) RegisterNode(nodeID string, stake uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.nodes[nodeID] = &MockNode{
		Address:       nodeID,
		StakeAmount:   stake,
		Reputation:    0,
		Status:        1, // online
		LastHeartbeat: time.Now(),
	}
	m.lastHeartbeat[nodeID] = time.Now()
}

// UpdateHeartbeat updates the last heartbeat time.
func (m *MockNodeRegistry) UpdateHeartbeat(nodeID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.lastHeartbeat[nodeID] = time.Now()
	if node, ok := m.nodes[nodeID]; ok {
		node.LastHeartbeat = time.Now()
	}
}

// GetNode returns a node.
func (m *MockNodeRegistry) GetNode(nodeID string) (*MockNode, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	node, ok := m.nodes[nodeID]
	return node, ok
}

// GetLastHeartbeat returns the last heartbeat time for a node.
func (m *MockNodeRegistry) GetLastHeartbeat(nodeID string) (time.Time, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	t, ok := m.lastHeartbeat[nodeID]
	return t, ok
}

// IsStale checks if a node is stale (no heartbeat within threshold).
func (m *MockNodeRegistry) IsStale(nodeID string, threshold time.Duration) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	t, ok := m.lastHeartbeat[nodeID]
	if !ok {
		return true
	}
	return time.Since(t) > threshold
}

// GetOnlineNodes returns all online nodes.
func (m *MockNodeRegistry) GetOnlineNodes() []*MockNode {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var online []*MockNode
	for _, node := range m.nodes {
		if node.Status == 1 { // online
			online = append(online, node)
		}
	}
	return online
}
