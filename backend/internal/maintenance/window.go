// Package maintenance provides maintenance window management for the Tentrist daemon.
package maintenance

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// Window represents a maintenance window.
type Window struct {
	ID        string    `json:"id"`
	NodeID    string    `json:"nodeId"`
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
	Reason    string    `json:"reason"`
	Emergency bool      `json:"emergency"`
	Status    string    `json:"status"` // "active", "completed", "cancelled"
}

// WindowManager manages maintenance windows.
type WindowManager struct {
	windows map[string]*Window
	mu      sync.RWMutex
}

// NewWindowManager creates a new window manager.
func NewWindowManager() *WindowManager {
	return &WindowManager{windows: make(map[string]*Window)}
}

// Schedule schedules a new maintenance window.
func (m *WindowManager) Schedule(nodeID string, start, end time.Time, reason string, emergency bool) string {
	m.mu.Lock()
	defer m.mu.Unlock()
	id := fmt.Sprintf("maint-%s-%d", nodeID, start.UnixNano())
	m.windows[id] = &Window{
		ID:        id,
		NodeID:    nodeID,
		StartTime: start,
		EndTime:   end,
		Reason:    reason,
		Emergency: emergency,
		Status:    "active",
	}
	return id
}

// Abort cancels an active maintenance window.
func (m *WindowManager) Abort(id string) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	if w, ok := m.windows[id]; ok && w.Status == "active" {
		w.Status = "cancelled"
		return true
	}
	return false
}

// IsSuppressed checks if a node is under maintenance.
func (m *WindowManager) IsSuppressed(nodeID string) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	now := time.Now()
	for _, w := range m.windows {
		if w.NodeID == nodeID && w.Status == "active" && now.After(w.StartTime) && now.Before(w.EndTime) {
			return true
		}
	}
	return false
}

// Process closes expired windows.
func (m *WindowManager) Process(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			m.mu.Lock()
			now := time.Now()
			for id, w := range m.windows {
				if w.Status == "active" && now.After(w.EndTime) {
					w.Status = "completed"
					_ = id // suppress unused
				}
			}
			m.mu.Unlock()
		}
	}
}

// HTTPHandler returns an HTTP handler for maintenance API.
func (m *WindowManager) HTTPHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		m.mu.RLock()
		var windows []*Window
		for _, w := range m.windows {
			windows = append(windows, w)
		}
		m.mu.RUnlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(windows)

	case http.MethodPost:
		var req struct {
			NodeID    string `json:"nodeId"`
			StartTime int64  `json:"startTime"`
			EndTime   int64  `json:"endTime"`
			Reason    string `json:"reason"`
			Emergency bool   `json:"emergency"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}
		id := m.Schedule(req.NodeID, time.Unix(req.StartTime, 0), time.Unix(req.EndTime, 0), req.Reason, req.Emergency)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"id": id})

	case http.MethodDelete:
		var req struct{ ID string }
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}
		ok := m.Abort(req.ID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"aborted": ok})
	}
}
