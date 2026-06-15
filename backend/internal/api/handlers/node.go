// Package handlers provides HTTP handlers for the Tentrist API.
package handlers

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"

	"github.com/tentrist.ai/backend/pkg/types"
)

// NodeHandler handles node-related API requests.
type NodeHandler struct {
	mu    sync.RWMutex
	nodes map[string]*types.Node
}

// NewNodeHandler creates a new NodeHandler with in-memory storage.
func NewNodeHandler() *NodeHandler {
	return &NodeHandler{
		nodes: make(map[string]*types.Node),
	}
}

// NodeRegisterRequest represents a node registration request.
type NodeRegisterRequest struct {
	NodeAddress string `json:"nodeAddress"`
	StakeAmount string `json:"stakeAmount"`
}

// NodeRegisterResponse represents the response after registering a node.
type NodeRegisterResponse struct {
	NodeAddress   string `json:"nodeAddress"`
	StakeAmount   string `json:"stakeAmount"`
	Reputation    string `json:"reputation"`
	Status        string `json:"status"`
	RegisteredAt  int64  `json:"registeredAt"`
}

// NodeStatusResponse represents a node status response.
type NodeStatusResponse struct {
	NodeAddress   string `json:"nodeAddress"`
	StakeAmount   string `json:"stakeAmount"`
	Reputation    string `json:"reputation"`
	Status        string `json:"status"`
	LastHeartbeat int64  `json:"lastHeartbeat"`
	RegisteredAt  int64  `json:"registeredAt"`
}

// NodeStakeRequest represents a stake request.
type NodeStakeRequest struct {
	Amount string `json:"amount"`
}

// NodeStakeResponse represents a stake response.
type NodeStakeResponse struct {
	NodeAddress string `json:"nodeAddress"`
	StakeAmount  string `json:"stakeAmount"`
	Status      string `json:"status"`
	Message     string `json:"message"`
}

// EligibleNodesResponse represents a list of eligible nodes.
type EligibleNodesResponse struct {
	Nodes []NodeStatusResponse `json:"nodes"`
	Count int                   `json:"count"`
}

// ServeNodes registers all node routes on the given router.
func (h *NodeHandler) ServeNodes(r *mux.Router) {
	r.HandleFunc("/api/v1/nodes/register", h.RegisterNode).Methods(http.MethodPost)
	r.HandleFunc("/api/v1/nodes/eligible", h.GetEligibleNodes).Methods(http.MethodGet)
	r.HandleFunc("/api/v1/nodes/{id}", h.GetNode).Methods(http.MethodGet)
	r.HandleFunc("/api/v1/nodes/{id}/stake", h.StakeNode).Methods(http.MethodPost)
}

// RegisterNode handles POST /api/v1/nodes/register — Register new GPU node.
func (h *NodeHandler) RegisterNode(w http.ResponseWriter, r *http.Request) {
	var req NodeRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	if req.NodeAddress == "" {
		http.Error(w, "nodeAddress is required", http.StatusBadRequest)
		return
	}

	// Strip 0x prefix if present
	addrHex := req.NodeAddress
	if len(addrHex) >= 2 && addrHex[:2] == "0x" {
		addrHex = addrHex[2:]
	}

	// Validate node address format (hex string)
	nodeBytes, err := hex.DecodeString(addrHex)
	if err != nil || len(nodeBytes) != 20 {
		http.Error(w, "nodeAddress must be a valid 20-byte hex string", http.StatusBadRequest)
		return
	}

	// Convert to fixed-size array
	var nodeAddr [20]byte
	copy(nodeAddr[:], nodeBytes)

	h.mu.Lock()
	defer h.mu.Unlock()

	// Check if node is already registered
	nodeID := req.NodeAddress
	if _, exists := h.nodes[nodeID]; exists {
		http.Error(w, "node is already registered", http.StatusConflict)
		return
	}

	// Parse stake amount
	stakeAmount := big.NewInt(0)
	if req.StakeAmount != "" {
		stakeAmount = ParseBigInt(req.StakeAmount)
	}

	now := time.Now()
	node := &types.Node{
		Address:       nodeAddr,
		StakeAmount:   stakeAmount,
		Reputation:    big.NewInt(0),
		Status:        types.NodeOnline,
		LastHeartbeat: now,
		RegisteredAt:  now,
	}

	h.nodes[nodeID] = node

	resp := NodeRegisterResponse{
		NodeAddress:  req.NodeAddress,
		StakeAmount: stakeAmount.String(),
		Reputation:   "0",
		Status:      "online",
		RegisteredAt: now.Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// GetNode handles GET /api/v1/nodes/:id — Get node status and reputation.
func (h *NodeHandler) GetNode(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	nodeID := vars["id"]

	h.mu.RLock()
	node, exists := h.nodes[nodeID]
	h.mu.RUnlock()

	if !exists {
		http.Error(w, "node not found", http.StatusNotFound)
		return
	}

	resp := NodeStatusResponse{
		NodeAddress:  nodeID,
		StakeAmount: node.StakeAmount.String(),
		Reputation:  node.Reputation.String(),
		Status:     nodeStatusToString(node.Status),
		LastHeartbeat: node.LastHeartbeat.Unix(),
		RegisteredAt:  node.RegisteredAt.Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetEligibleNodes handles GET /api/v1/nodes/eligible — List nodes meeting stake threshold.
func (h *NodeHandler) GetEligibleNodes(w http.ResponseWriter, r *http.Request) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	// Minimum stake threshold (in wei) - approximately 1 ETH
	minStake := big.NewInt(1e18)

	var eligible []NodeStatusResponse
	for id, node := range h.nodes {
		// Node must be online and have sufficient stake
		if node.Status == types.NodeOnline && node.StakeAmount.Cmp(minStake) >= 0 {
			eligible = append(eligible, NodeStatusResponse{
				NodeAddress:   id,
				StakeAmount:  node.StakeAmount.String(),
				Reputation:   node.Reputation.String(),
				Status:       nodeStatusToString(node.Status),
				LastHeartbeat: node.LastHeartbeat.Unix(),
				RegisteredAt:  node.RegisteredAt.Unix(),
			})
		}
	}

	resp := EligibleNodesResponse{
		Nodes: eligible,
		Count: len(eligible),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// StakeNode handles POST /api/v1/nodes/:id/stake — Stake collateral.
func (h *NodeHandler) StakeNode(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	nodeID := vars["id"]

	var req NodeStakeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	if req.Amount == "" {
		http.Error(w, "amount is required", http.StatusBadRequest)
		return
	}

	amount := ParseBigInt(req.Amount)
	if amount.Sign() <= 0 {
		http.Error(w, "amount must be greater than 0", http.StatusBadRequest)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	node, exists := h.nodes[nodeID]
	if !exists {
		http.Error(w, "node not found", http.StatusNotFound)
		return
	}

	// Add to stake amount
	node.StakeAmount = new(big.Int).Add(node.StakeAmount, amount)

	resp := NodeStakeResponse{
		NodeAddress: nodeID,
		StakeAmount: node.StakeAmount.String(),
		Status:      "staked",
		Message:     fmt.Sprintf("successfully staked %s", amount.String()),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Helper functions

func nodeStatusToString(status types.NodeStatus) string {
	switch status {
	case types.NodeOffline:
		return "offline"
	case types.NodeOnline:
		return "online"
	case types.NodeStale:
		return "stale"
	case types.NodeSlashed:
		return "slashed"
	default:
		return "unknown"
	}
}

// AddNodeForTesting adds a node directly to the handler for testing purposes.
func (h *NodeHandler) AddNodeForTesting(nodeID string, node *types.Node) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.nodes[nodeID] = node
}

// GetNodeForTesting retrieves a node for testing purposes.
func (h *NodeHandler) GetNodeForTesting(nodeID string) (*types.Node, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	node, exists := h.nodes[nodeID]
	return node, exists
}

// UpdateNodeStatusForTesting updates node status for testing.
func (h *NodeHandler) UpdateNodeStatusForTesting(nodeID string, status types.NodeStatus) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	node, exists := h.nodes[nodeID]
	if !exists {
		return false
	}
	node.Status = status
	return true
}

// UpdateNodeReputationForTesting updates node reputation for testing.
func (h *NodeHandler) UpdateNodeReputationForTesting(nodeID string, reputation *big.Int) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	node, exists := h.nodes[nodeID]
	if !exists {
		return false
	}
	node.Reputation = reputation
	return true
}

// GetAllNodesForTesting returns all nodes for testing.
func (h *NodeHandler) GetAllNodesForTesting() map[string]*types.Node {
	h.mu.RLock()
	defer h.mu.RUnlock()
	result := make(map[string]*types.Node, len(h.nodes))
	for k, v := range h.nodes {
		result[k] = v
	}
	return result
}
