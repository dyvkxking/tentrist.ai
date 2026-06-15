package handlers

import (
	"bytes"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gorilla/mux"

	"github.com/tentrist.ai/backend/pkg/types"
)

func TestRegisterNode(t *testing.T) {
	h := NewNodeHandler()
	r := mux.NewRouter()
	h.ServeNodes(r)

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name: "valid node registration",
			requestBody: map[string]interface{}{
				"nodeAddress": "0x1234567890123456789012345678901234567890",
				"stakeAmount": "1000000000000000000",
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body []byte) {
				var resp NodeRegisterResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.NodeAddress != "0x1234567890123456789012345678901234567890" {
					t.Errorf("expected nodeAddress '0x1234567890123456789012345678901234567890', got '%s'", resp.NodeAddress)
				}
				if resp.Status != "online" {
					t.Errorf("expected status 'online', got '%s'", resp.Status)
				}
				if resp.RegisteredAt == 0 {
					t.Error("expected non-zero registeredAt")
				}
			},
		},
		{
			name: "registration without stake",
			requestBody: map[string]interface{}{
				"nodeAddress": "0x1111111111111111111111111111111111111111",
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body []byte) {
				var resp NodeRegisterResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.StakeAmount != "0" {
					t.Errorf("expected stakeAmount '0', got '%s'", resp.StakeAmount)
				}
			},
		},
		{
			name: "missing nodeAddress",
			requestBody: map[string]interface{}{
				"stakeAmount": "1000000000000000000",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "invalid nodeAddress format",
			requestBody: map[string]interface{}{
				"nodeAddress": "invalid",
				"stakeAmount": "1000000000000000000",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "nodeAddress too short",
			requestBody: map[string]interface{}{
				"nodeAddress": "0x123456",
				"stakeAmount": "1000000000000000000",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes/register", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d. body: %s", tt.expectedStatus, w.Code, w.Body.String())
			}

			if tt.checkResponse != nil && w.Code == http.StatusCreated {
				tt.checkResponse(t, w.Body.Bytes())
			}
		})
	}
}

func TestGetNode(t *testing.T) {
	h := NewNodeHandler()
	r := mux.NewRouter()
	h.ServeNodes(r)

	// Register a node first
	body, _ := json.Marshal(map[string]interface{}{
		"nodeAddress": "0x1234567890123456789012345678901234567890",
		"stakeAmount": "1000000000000000000",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes/register", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	nodeID := "0x1234567890123456789012345678901234567890"

	tests := []struct {
		name           string
		nodeID         string
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name:           "existing node",
			nodeID:         nodeID,
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var resp NodeStatusResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.NodeAddress != nodeID {
					t.Errorf("expected nodeAddress '%s', got '%s'", nodeID, resp.NodeAddress)
				}
				if resp.Status != "online" {
					t.Errorf("expected status 'online', got '%s'", resp.Status)
				}
			},
		},
		{
			name:           "non-existent node",
			nodeID:         "0xnonexistent0000000000000000000000",
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/nodes/"+tt.nodeID, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.checkResponse != nil && w.Code == http.StatusOK {
				tt.checkResponse(t, w.Body.Bytes())
			}
		})
	}
}

func TestGetEligibleNodes(t *testing.T) {
	h := NewNodeHandler()
	r := mux.NewRouter()
	h.ServeNodes(r)

	// Register nodes directly via handler for reliability
	var highAddr, lowAddr, noAddr [20]byte
	copy(highAddr[:], []byte{0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11})
	copy(lowAddr[:], []byte{0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22})
	copy(noAddr[:], []byte{0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33})

	h.AddNodeForTesting("0x1111111111111111111111111111111111111111", &types.Node{
		Address: highAddr, StakeAmount: big.NewInt(2e18), Reputation: big.NewInt(0),
		Status: types.NodeOnline, LastHeartbeat: time.Now(), RegisteredAt: time.Now(),
	})
	h.AddNodeForTesting("0x2222222222222222222222222222222222222222", &types.Node{
		Address: lowAddr, StakeAmount: big.NewInt(5e17), Reputation: big.NewInt(0),
		Status: types.NodeOnline, LastHeartbeat: time.Now(), RegisteredAt: time.Now(),
	})
	h.AddNodeForTesting("0x3333333333333333333333333333333333333333", &types.Node{
		Address: noAddr, StakeAmount: big.NewInt(0), Reputation: big.NewInt(0),
		Status: types.NodeOnline, LastHeartbeat: time.Now(), RegisteredAt: time.Now(),
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/nodes/eligible", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d. body: %s", w.Code, w.Body.String())
		return
	}

	var resp EligibleNodesResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if resp.Count != 1 {
		t.Errorf("expected 1 eligible node, got %d", resp.Count)
	}
	if len(resp.Nodes) != 1 {
		t.Errorf("expected 1 node in list, got %d", len(resp.Nodes))
	}
	if resp.Nodes[0].NodeAddress != "0x1111111111111111111111111111111111111111" {
		t.Errorf("expected high stake node to be eligible, got '%s'", resp.Nodes[0].NodeAddress)
	}
}

func TestStakeNode(t *testing.T) {
	h := NewNodeHandler()
	r := mux.NewRouter()
	h.ServeNodes(r)

	// Register a node first
	body, _ := json.Marshal(map[string]interface{}{
		"nodeAddress": "0x1234567890123456789012345678901234567890",
		"stakeAmount": "1000000000000000000",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes/register", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	nodeID := "0x1234567890123456789012345678901234567890"

	tests := []struct {
		name           string
		nodeID         string
		stakeAmount    string
		expectedStatus int
		checkResponse func(t *testing.T, body []byte)
	}{
		{
			name:           "stake additional amount",
			nodeID:         nodeID,
			stakeAmount:    "500000000000000000",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var resp NodeStakeResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.StakeAmount != "1500000000000000000" {
					t.Errorf("expected stakeAmount '1500000000000000000', got '%s'", resp.StakeAmount)
				}
				if resp.Status != "staked" {
					t.Errorf("expected status 'staked', got '%s'", resp.Status)
				}
			},
		},
		{
			name:           "stake on non-existent node",
			nodeID:         "0xnonexistent0000000000000000000000",
			stakeAmount:    "500000000000000000",
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "stake with zero amount",
			nodeID:         nodeID,
			stakeAmount:    "0",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "stake with negative amount",
			nodeID:         nodeID,
			stakeAmount:    "-1000000000000000000",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(map[string]interface{}{"amount": tt.stakeAmount})
			req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes/"+tt.nodeID+"/stake", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d. body: %s", tt.expectedStatus, w.Code, w.Body.String())
			}

			if tt.checkResponse != nil && w.Code == http.StatusOK {
				tt.checkResponse(t, w.Body.Bytes())
			}
		})
	}
}

func TestNodeStatusToString(t *testing.T) {
	tests := []struct {
		status   types.NodeStatus
		expected string
	}{
		{types.NodeOffline, "offline"},
		{types.NodeOnline, "online"},
		{types.NodeStale, "stale"},
		{types.NodeSlashed, "slashed"},
		{types.NodeStatus(100), "unknown"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			result := nodeStatusToString(tt.status)
			if result != tt.expected {
				t.Errorf("expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}

func TestAddNodeForTesting(t *testing.T) {
	h := NewNodeHandler()

	var nodeAddr [20]byte
	for i := range nodeAddr {
		nodeAddr[i] = byte(i)
	}

	node := &types.Node{
		Address:       nodeAddr,
		StakeAmount:    big.NewInt(1e18),
		Reputation:     big.NewInt(100),
		Status:        types.NodeOnline,
		LastHeartbeat: time.Now(),
		RegisteredAt:  time.Now(),
	}

	nodeID := "0x" + "0101010101010101010101010101010101010101"
	h.AddNodeForTesting(nodeID, node)

	retrieved, exists := h.GetNodeForTesting(nodeID)
	if !exists {
		t.Fatal("expected node to exist after adding")
	}

	if retrieved.StakeAmount.Cmp(node.StakeAmount) != 0 {
		t.Errorf("expected stake %v, got %v", node.StakeAmount, retrieved.StakeAmount)
	}
}

func TestUpdateNodeStatusForTesting(t *testing.T) {
	h := NewNodeHandler()

	var nodeAddr [20]byte
	for i := range nodeAddr {
		nodeAddr[i] = byte(i)
	}

	node := &types.Node{
		Address:       nodeAddr,
		StakeAmount:    big.NewInt(1e18),
		Reputation:     big.NewInt(100),
		Status:        types.NodeOnline,
		LastHeartbeat: time.Now(),
		RegisteredAt:  time.Now(),
	}

	nodeID := "0x" + "0101010101010101010101010101010101010101"
	h.AddNodeForTesting(nodeID, node)

	// Update status to stale
	if !h.UpdateNodeStatusForTesting(nodeID, types.NodeStale) {
		t.Fatal("expected update to succeed")
	}

	retrieved, _ := h.GetNodeForTesting(nodeID)
	if retrieved.Status != types.NodeStale {
		t.Errorf("expected status NodeStale, got %v", retrieved.Status)
	}

	// Update non-existent node should fail
	if h.UpdateNodeStatusForTesting("0x nonexistent", types.NodeStale) {
		t.Error("expected update to fail for non-existent node")
	}
}

func TestParseBigInt(t *testing.T) {
	tests := []struct {
		input    string
		expected *big.Int
	}{
		{"1000000000000000000", big.NewInt(1e18)},
		{"0", big.NewInt(0)},
		{"invalid", big.NewInt(0)},
		{"-100", big.NewInt(-100)},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := ParseBigInt(tt.input)
			if result.Cmp(tt.expected) != 0 {
				t.Errorf("expected %v, got %v", tt.expected, result)
			}
		})
	}
}
