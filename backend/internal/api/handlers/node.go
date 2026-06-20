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

	"github.com/ethereum/go-ethereum/common"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/tentrist.ai/backend/internal/contract"
	"github.com/tentrist.ai/backend/pkg/types"
)

// NodeHandler handles node-related API requests.
type NodeHandler struct {
	mu    sync.RWMutex
	nodes map[string]*types.Node

	// External dependencies
	contractClient interface{}
	supabaseClient interface{}
	db            *pgxpool.Pool
}

// NewNodeHandler creates a new NodeHandler with in-memory storage.
func NewNodeHandler() *NodeHandler {
	return &NodeHandler{
		nodes: make(map[string]*types.Node),
	}
}

// SetContractClient sets the contract client for blockchain interactions.
func (h *NodeHandler) SetContractClient(client interface{}) {
	h.contractClient = client
}

// SetSupabaseClient sets the Supabase client for database operations.
func (h *NodeHandler) SetSupabaseClient(client interface{}) {
	h.supabaseClient = client
}

// SetDB sets the PostgreSQL connection pool.
func (h *NodeHandler) SetDB(pool *pgxpool.Pool) {
	h.db = pool
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

	// Parse stake amount
	stakeAmount := big.NewInt(0)
	if req.StakeAmount != "" {
		stakeAmount = ParseBigInt(req.StakeAmount)
	}

	now := time.Now()

	// PostgreSQL is the primary store; fall back to in-memory if unavailable
	ctx, cancel := withDBTimeout(r.Context())
	defer cancel()

	if h.db != nil {
		_, err = h.db.Exec(ctx,
			`INSERT INTO public.nodes (wallet_address, status, reputation_score, created_at, updated_at)
			 VALUES ($1, 'online', 0, $2, $2)
			 ON CONFLICT (wallet_address) DO UPDATE SET
				status = 'online', updated_at = $2`,
			req.NodeAddress,
			now,
		)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to persist node: %v", err), http.StatusInternalServerError)
			return
		}
	} else {
		// Fallback: store in-memory
		h.mu.Lock()
		h.nodes[req.NodeAddress] = &types.Node{
			Address:      parseAddress(req.NodeAddress),
			Status:       types.NodeOnline,
			StakeAmount:  stakeAmount,
			Reputation:   big.NewInt(0),
			RegisteredAt: now,
		}
		h.mu.Unlock()
	}

	// Call contract Stake if contract client is available and stake amount > 0
	if stakeAmount.Sign() > 0 && h.contractClient != nil {
		if cc, ok := h.contractClient.(*contract.ContractClient); ok {
			nodeAddr := common.HexToAddress(req.NodeAddress)
			_, stkErr := cc.Stake(ctx, nodeAddr, stakeAmount)
			if stkErr != nil {
				http.Error(w, fmt.Sprintf("failed to stake on contract: %v", stkErr), http.StatusInternalServerError)
				return
			}
		}
	}

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

	// Try PostgreSQL first if available
	if h.db != nil {
		ctx, cancel := withDBTimeout(r.Context())
		defer cancel()

		var dbNode struct {
			WalletAddress   string
			Status          string
			ReputationScore int
			LastHeartbeatAt *time.Time
			CreatedAt       time.Time
		}

		err := h.db.QueryRow(ctx,
			`SELECT wallet_address, status, reputation_score, last_heartbeat_at, created_at
			 FROM public.nodes
			 WHERE wallet_address = $1 OR id = $1`,
			nodeID,
		).Scan(
			&dbNode.WalletAddress,
			&dbNode.Status,
			&dbNode.ReputationScore,
			&dbNode.LastHeartbeatAt,
			&dbNode.CreatedAt,
		)

		if err == nil {
			lastHeartbeat := int64(0)
			if dbNode.LastHeartbeatAt != nil {
				lastHeartbeat = dbNode.LastHeartbeatAt.Unix()
			}
			resp := NodeStatusResponse{
				NodeAddress:   dbNode.WalletAddress,
				Reputation:    fmt.Sprintf("%d", dbNode.ReputationScore),
				Status:        dbNode.Status,
				LastHeartbeat: lastHeartbeat,
				RegisteredAt:  dbNode.CreatedAt.Unix(),
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(resp)
			return
		}
	}

	// Fallback: try in-memory
	h.mu.RLock()
	node, exists := h.nodes[nodeID]
	h.mu.RUnlock()
	if !exists {
		http.Error(w, "node not found", http.StatusNotFound)
		return
	}
	lastHeartbeat := int64(0)
	if !node.LastHeartbeat.IsZero() {
		lastHeartbeat = node.LastHeartbeat.Unix()
	}
	resp := NodeStatusResponse{
		NodeAddress:   nodeID,
		Reputation:    node.Reputation.String(),
		Status:        nodeStatusToString(node.Status),
		LastHeartbeat: lastHeartbeat,
		RegisteredAt:  node.RegisteredAt.Unix(),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetEligibleNodes handles GET /api/v1/nodes/eligible — List nodes meeting stake threshold.
func (h *NodeHandler) GetEligibleNodes(w http.ResponseWriter, r *http.Request) {
	minStake := big.NewInt(1e18)
	var eligible []NodeStatusResponse

	if h.db != nil {
		ctx, cancel := withDBTimeout(r.Context())
		defer cancel()
		rows, err := h.db.Query(ctx,
			`SELECT wallet_address, status, reputation_score, last_heartbeat_at, created_at, stake_amount
			 FROM public.nodes WHERE status = 'online' AND stake_amount >= $1`,
			minStake,
		)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var node struct {
					WalletAddress   string
					Status         string
					ReputationScore int
					LastHeartbeatAt *time.Time
					CreatedAt       time.Time
					StakeAmount    string
				}
				if err := rows.Scan(&node.WalletAddress, &node.Status, &node.ReputationScore,
					&node.LastHeartbeatAt, &node.CreatedAt, &node.StakeAmount); err != nil {
					continue
				}
				lastHeartbeat := int64(0)
				if node.LastHeartbeatAt != nil {
					lastHeartbeat = node.LastHeartbeatAt.Unix()
				}
				eligible = append(eligible, NodeStatusResponse{
					NodeAddress:   node.WalletAddress,
					StakeAmount:   node.StakeAmount,
					Reputation:    fmt.Sprintf("%d", node.ReputationScore),
					Status:        node.Status,
					LastHeartbeat: lastHeartbeat,
					RegisteredAt:  node.CreatedAt.Unix(),
				})
			}
		}
	}

	// Fallback: filter in-memory nodes
	if h.db == nil || len(eligible) == 0 {
		h.mu.RLock()
		for addr, node := range h.nodes {
			if node.Status == types.NodeOnline && node.StakeAmount != nil &&
				node.StakeAmount.Cmp(minStake) >= 0 {
				eligible = append(eligible, NodeStatusResponse{
					NodeAddress:   addr,
					StakeAmount:   node.StakeAmount.String(),
					Reputation:   node.Reputation.String(),
					Status:        nodeStatusToString(node.Status),
					LastHeartbeat: 0,
					RegisteredAt:  node.RegisteredAt.Unix(),
				})
			}
		}
		h.mu.RUnlock()
	}

	resp := EligibleNodesResponse{Nodes: eligible, Count: len(eligible)}
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

	// PostgreSQL primary; call contract if available, fall back to in-memory
	ctx, cancel := withDBTimeout(r.Context())
	defer cancel()

	// Call contract Stake if contract client is available
	if h.contractClient != nil {
		if cc, ok := h.contractClient.(*contract.ContractClient); ok {
			nodeAddr := common.HexToAddress(nodeID)
			_, stkErr := cc.Stake(ctx, nodeAddr, amount)
			if stkErr != nil {
				http.Error(w, fmt.Sprintf("failed to stake on contract: %v", stkErr), http.StatusInternalServerError)
				return
			}
		}
	}

	if h.db != nil {
		_, dbErr := h.db.Exec(ctx,
			`UPDATE public.nodes SET stake_amount = stake_amount + $1, updated_at = NOW()
			 WHERE wallet_address = $2 OR id = $2`,
			amount,
			nodeID,
		)
		if dbErr != nil {
			http.Error(w, fmt.Sprintf("failed to update node: %v", dbErr), http.StatusInternalServerError)
			return
		}
	} else {
		// Fallback: update in-memory
		h.mu.Lock()
		if n, ok := h.nodes[nodeID]; ok {
			if n.StakeAmount == nil {
				n.StakeAmount = new(big.Int)
			}
			n.StakeAmount.Add(n.StakeAmount, amount)
			h.mu.Unlock()
		} else {
			h.mu.Unlock()
			http.Error(w, "node not found", http.StatusNotFound)
			return
		}
	}

	// Read total stake for response
	h.mu.RLock()
	totalStake := amount.String()
	if n, ok := h.nodes[nodeID]; ok && n.StakeAmount != nil {
		totalStake = n.StakeAmount.String()
	}
	h.mu.RUnlock()

	resp := NodeStakeResponse{
		NodeAddress: nodeID,
		StakeAmount: totalStake,
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
