package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gorilla/mux"

	"github.com/tentrist.ai/backend/pkg/types"
)

func TestSubmitJob(t *testing.T) {
	h := NewJobHandler()
	r := mux.NewRouter()
	h.ServeJobs(r)

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name: "valid job submission",
			requestBody: map[string]interface{}{
				"clientId":           "0x1234567890123456789012345678901234567890",
				"requiredUptime":     9900,
				"requiredThroughput": 100,
				"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body []byte) {
				var resp JobSubmitResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.JobID == "" {
					t.Error("expected non-empty jobId")
				}
				if resp.Status != "pending" {
					t.Errorf("expected status 'pending', got '%s'", resp.Status)
				}
				if resp.CreatedAt == 0 {
					t.Error("expected non-zero createdAt")
				}
			},
		},
		{
			name: "missing clientId",
			requestBody: map[string]interface{}{
				"requiredUptime":     9900,
				"requiredThroughput": 100,
				"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "invalid uptime - too high",
			requestBody: map[string]interface{}{
				"clientId":           "0x1234567890123456789012345678901234567890",
				"requiredUptime":     10001,
				"requiredThroughput": 100,
				"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "zero throughput",
			requestBody: map[string]interface{}{
				"clientId":           "0x1234567890123456789012345678901234567890",
				"requiredUptime":     9900,
				"requiredThroughput": 0,
				"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "missing deadline",
			requestBody: map[string]interface{}{
				"clientId":           "0x1234567890123456789012345678901234567890",
				"requiredUptime":     9900,
				"requiredThroughput": 100,
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs", bytes.NewReader(body))
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

func TestGetJob(t *testing.T) {
	h := NewJobHandler()
	r := mux.NewRouter()
	h.ServeJobs(r)

	// First submit a job to get a valid job ID
	body, _ := json.Marshal(map[string]interface{}{
		"clientId":           "0x1234567890123456789012345678901234567890",
		"requiredUptime":     9900,
		"requiredThroughput": 100,
		"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var submitResp JobSubmitResponse
	json.Unmarshal(w.Body.Bytes(), &submitResp)
	jobID := submitResp.JobID

	tests := []struct {
		name           string
		jobID          string
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name:           "existing job",
			jobID:          jobID,
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var resp JobStatusResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.JobID != jobID {
					t.Errorf("expected jobId '%s', got '%s'", jobID, resp.JobID)
				}
				if resp.Status != "pending" {
					t.Errorf("expected status 'pending', got '%s'", resp.Status)
				}
			},
		},
		{
			name:           "non-existent job",
			jobID:          "0xnonexistent",
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/jobs/"+tt.jobID, nil)
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

func TestGetSLA(t *testing.T) {
	h := NewJobHandler()
	r := mux.NewRouter()
	h.ServeJobs(r)

	// Submit a job first
	body, _ := json.Marshal(map[string]interface{}{
		"clientId":           "0x1234567890123456789012345678901234567890",
		"requiredUptime":     9900,
		"requiredThroughput": 100,
		"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var submitResp JobSubmitResponse
	json.Unmarshal(w.Body.Bytes(), &submitResp)
	jobID := submitResp.JobID

	tests := []struct {
		name           string
		jobID          string
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name:           "existing job SLA",
			jobID:          jobID,
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var resp SLAResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.RequiredUptime != 9900 {
					t.Errorf("expected uptime 9900, got %d", resp.RequiredUptime)
				}
				if resp.RequiredThroughput != 100 {
					t.Errorf("expected throughput 100, got %d", resp.RequiredThroughput)
				}
				if resp.Fulfilled != false {
					t.Errorf("expected fulfilled false, got %v", resp.Fulfilled)
				}
			},
		},
		{
			name:           "non-existent job SLA",
			jobID:          "0xnonexistent",
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/jobs/"+tt.jobID+"/sla", nil)
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

func TestCancelJob(t *testing.T) {
	h := NewJobHandler()
	r := mux.NewRouter()
	h.ServeJobs(r)

	// Submit a job first
	body, _ := json.Marshal(map[string]interface{}{
		"clientId":           "0x1234567890123456789012345678901234567890",
		"requiredUptime":     9900,
		"requiredThroughput": 100,
		"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var submitResp JobSubmitResponse
	json.Unmarshal(w.Body.Bytes(), &submitResp)
	jobID := submitResp.JobID

	tests := []struct {
		name           string
		jobID          string
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name:           "cancel pending job",
			jobID:          jobID,
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body []byte) {
				var resp CancelResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.Status != "cancelled" {
					t.Errorf("expected status 'cancelled', got '%s'", resp.Status)
				}
			},
		},
		{
			name:           "cancel non-existent job",
			jobID:          "0xnonexistent",
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs/"+tt.jobID+"/cancel", nil)
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

func TestJobStatusToString(t *testing.T) {
	tests := []struct {
		status   types.JobStatus
		expected string
	}{
		{types.JobPending, "pending"},
		{types.JobRunning, "running"},
		{types.JobCompleted, "completed"},
		{types.JobFailed, "failed"},
		{types.JobRequeued, "requeued"},
		{types.JobStatus(100), "unknown"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			result := jobStatusToString(tt.status)
			if result != tt.expected {
				t.Errorf("expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}

func TestGenerateJobID(t *testing.T) {
	id1 := GenerateJobID()

	if id1 == "" {
		t.Error("expected non-empty job ID")
	}

	// IDs may collide if called within same nanosecond - just verify format
	if len(id1) != 64 {
		t.Errorf("expected job ID length 64 (hex encoded 32 bytes), got %d", len(id1))
	}
}

// =============================================================================
// Serverless Job Tests
// =============================================================================

func TestSubmitServerlessJob(t *testing.T) {
	// Create handler with mock node selector
	mockSelector := NodeSelectorFunc(func(minCapacity uint64) []string {
		return []string{"0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"}
	})
	h := NewJobHandlerWithSelector(mockSelector)
	r := mux.NewRouter()
	h.ServeJobs(r)

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, body []byte)
	}{
		{
			name: "valid serverless job submission",
			requestBody: map[string]interface{}{
				"clientId":           "0x1234567890123456789012345678901234567890",
				"requiredUptime":     9900,
				"requiredThroughput": 100,
				"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
				"workloadPayload":    []byte(`{"data": "test"}`),
				"isServerless":       true,
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body []byte) {
				var resp ServerlessJobSubmitResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				if resp.JobID == "" {
					t.Error("expected non-empty jobId")
				}
				if resp.Status != "running" {
					t.Errorf("expected status 'running', got '%s'", resp.Status)
				}
				if resp.AssignedNode == "" {
					t.Error("expected auto-assigned node for serverless job")
				}
				if resp.EstimatedRate == "" {
					t.Error("expected estimated rate for serverless job")
				}
			},
		},
		{
			name: "serverless job with no healthy nodes",
			requestBody: map[string]interface{}{
				"clientId":           "0x1234567890123456789012345678901234567890",
				"requiredUptime":     9900,
				"requiredThroughput": 100,
				"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
				"isServerless":       true,
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body []byte) {
				var resp ServerlessJobSubmitResponse
				if err := json.Unmarshal(body, &resp); err != nil {
					t.Fatalf("failed to unmarshal response: %v", err)
				}
				// Should fallback to placeholder node
				if resp.AssignedNode == "" {
					t.Error("expected fallback node assignment")
				}
			},
		},
		{
			name: "serverless job missing clientId",
			requestBody: map[string]interface{}{
				"requiredUptime":     9900,
				"requiredThroughput": 100,
				"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
				"isServerless":       true,
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs/serverless", bytes.NewReader(body))
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

func TestMeteringLifecycle(t *testing.T) {
	h := NewJobHandler()
	r := mux.NewRouter()
	h.ServeJobs(r)

	// First submit a serverless job to get a valid job ID
	body, _ := json.Marshal(map[string]interface{}{
		"clientId":           "0x1234567890123456789012345678901234567890",
		"requiredUptime":     9900,
		"requiredThroughput": 100,
		"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
		"isServerless":       true,
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs/serverless", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var submitResp ServerlessJobSubmitResponse
	json.Unmarshal(w.Body.Bytes(), &submitResp)
	jobID := submitResp.JobID

	t.Run("start metering", func(t *testing.T) {
		body, _ := json.Marshal(map[string]interface{}{
			"unitIndex": 0,
			"nodeId":    "0x1111111111111111111111111111111111111111",
			"units":     1000,
		})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs/"+jobID+"/metering/start", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d. body: %s", w.Code, w.Body.String())
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp["status"] != "metering_started" {
			t.Errorf("expected status 'metering_started', got '%v'", resp["status"])
		}
	})

	t.Run("get metering", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/jobs/"+jobID+"/metering", nil)
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", w.Code)
		}

		var resp MeteringResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.Status != "active" {
			t.Errorf("expected status 'active', got '%s'", resp.Status)
		}
	})

	t.Run("stop metering", func(t *testing.T) {
		body, _ := json.Marshal(map[string]interface{}{
			"units": 2500, // 2500 units processed
		})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs/"+jobID+"/metering/stop", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d. body: %s", w.Code, w.Body.String())
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp["status"] != "metering_stopped" {
			t.Errorf("expected status 'metering_stopped', got '%v'", resp["status"])
		}
		if resp["billedMicroUSDC"] == nil || resp["billedMicroUSDC"] == "0" {
			t.Error("expected non-zero billing amount")
		}
	})

	t.Run("get metering after stop", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/jobs/"+jobID+"/metering", nil)
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", w.Code)
		}

		var resp MeteringResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.Status != "done" {
			t.Errorf("expected status 'done', got '%s'", resp.Status)
		}
		if resp.Units != 2500 {
			t.Errorf("expected units 2500, got %d", resp.Units)
		}
	})

	t.Run("metering not found", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/jobs/nonexistent/metering", nil)
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", w.Code)
		}
	})
}

func TestMeteringStatusToString(t *testing.T) {
	tests := []struct {
		status   MeteringStatus
		expected string
	}{
		{MeteringPending, "pending"},
		{MeteringActive, "active"},
		{MeteringDone, "done"},
		{MeteringStatus(100), "unknown"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			result := meteringStatusToString(tt.status)
			if result != tt.expected {
				t.Errorf("expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}

func TestServerlessJobWithMockSelector(t *testing.T) {
	// Test with an empty selector (simulates no healthy nodes)
	emptySelector := NodeSelectorFunc(func(minCapacity uint64) []string {
		return []string{} // no healthy nodes
	})

	h := NewJobHandlerWithSelector(emptySelector)
	r := mux.NewRouter()
	h.ServeJobs(r)

	body, _ := json.Marshal(map[string]interface{}{
		"clientId":           "0x1234567890123456789012345678901234567890",
		"requiredUptime":     9900,
		"requiredThroughput": 100,
		"deadlineTimestamp":  time.Now().Add(1 * time.Hour).Unix(),
		"isServerless":       true,
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs/serverless", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d. body: %s", w.Code, w.Body.String())
	}

	var resp ServerlessJobSubmitResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	// Should fallback to placeholder node
	if resp.AssignedNode == "" {
		t.Error("expected fallback node assignment when no healthy nodes available")
	}
	if resp.Status != "running" {
		t.Errorf("expected status 'running', got '%s'", resp.Status)
	}
}
