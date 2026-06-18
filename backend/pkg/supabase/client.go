package supabase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client is a simple Supabase REST API client
type Client struct {
	url  string
	key  string
	http *http.Client
}

// Config holds the client configuration
type Config struct {
	URL string
	Key string // Service role key
}

// NewClient creates a new Supabase client
func NewClient(cfg Config) (*Client, error) {
	if cfg.URL == "" || cfg.Key == "" {
		return nil, fmt.Errorf("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
	}
	return &Client{
		url:  cfg.URL,
		key:  cfg.Key,
		http: &http.Client{Timeout: 30 * time.Second},
	}, nil
}

// NewClientFromEnv creates a client from environment variables
func NewClientFromEnv() (*Client, error) {
	return NewClient(Config{
		URL: "https://whudzlhpfiptiqomjfbg.supabase.co",
		Key: "",
	})
}

// Profile represents a user profile
type Profile struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	WalletAddr  string `json:"wallet_address"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// APIKey represents an API key
type APIKey struct {
	ID         string `json:"id"`
	UserID     string `json:"user_id"`
	KeyPrefix  string `json:"key_prefix"`
	Name       string `json:"name"`
	LastUsedAt string `json:"last_used_at"`
	ExpiresAt  string `json:"expires_at"`
	CreatedAt  string `json:"created_at"`
}

// Job represents a compute job
type Job struct {
	ID                      string                 `json:"id"`
	JobID256                string                 `json:"job_id_256"`
	UserID                  string                 `json:"user_id"`
	NodeID                  string                 `json:"node_id"`
	Status                  string                 `json:"status"`
	JobType                 string                 `json:"job_type"`
	InputPayload            map[string]interface{} `json:"input_payload"`
	OutputPayload           map[string]interface{} `json:"output_payload"`
	EstimatedDurationMins   int                    `json:"estimated_duration_minutes"`
	ActualDurationMins      int                    `json:"actual_duration_minutes"`
	CheckpointURL           string                 `json:"checkpoint_url"`
	SLAUptimeRequired       int                    `json:"sla_uptime_required"`
	ThroughputRequired     int                    `json:"sla_throughput_required"`
	Deadline               string                 `json:"deadline"`
	BudgetUSD               float64                `json:"budget_usd"`
	PriceChargedUSD         float64                `json:"price_charged_usd"`
	PaidAt                 string                 `json:"paid_at"`
	CreatedAt               string                 `json:"created_at"`
	UpdatedAt               string                 `json:"updated_at"`
	CompletedAt             string                 `json:"completed_at"`
}

// Node represents a GPU node
type Node struct {
	ID                 string  `json:"id"`
	WalletAddress      string  `json:"wallet_address"`
	DisplayName       string  `json:"display_name"`
	GpuModel          string  `json:"gpu_model"`
	VramTotalMB       int64   `json:"vram_total_mb"`
	Status            string  `json:"status"`
	ReputationScore   int     `json:"reputation_score"`
	TotalJobsCompleted int     `json:"total_jobs_completed"`
	LastHeartbeatAt   string  `json:"last_heartbeat_at"`
	Location          string  `json:"location"`
	PricePerMinuteUSD float64 `json:"price_per_minute_usd"`
	CreatedAt         string  `json:"created_at"`
	UpdatedAt         string  `json:"updated_at"`
}

// doRequest performs an HTTP request to Supabase REST API
func (c *Client) doRequest(ctx context.Context, method, path string, body interface{}) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(data)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.url+path, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", c.key)
	req.Header.Set("Authorization", "Bearer "+c.key)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Supabase error %d: %s", resp.StatusCode, string(body))
	}

	return io.ReadAll(resp.Body)
}

// GetProfile retrieves a user profile
func (c *Client) GetProfile(ctx context.Context, userID string) (*Profile, error) {
	data, err := c.doRequest(ctx, "GET", "/rest/v1/profiles?id=eq."+userID+"&select=*", nil)
	if err != nil {
		return nil, err
	}

	var profiles []Profile
	if err := json.Unmarshal(data, &profiles); err != nil {
		return nil, err
	}
	if len(profiles) == 0 {
		return nil, fmt.Errorf("profile not found")
	}
	return &profiles[0], nil
}

// UpdateProfile updates a user profile
func (c *Client) UpdateProfile(ctx context.Context, userID string, updates map[string]interface{}) error {
	_, err := c.doRequest(ctx, "PATCH", "/rest/v1/profiles?id=eq."+userID, updates)
	return err
}

// LinkWalletToProfile links a wallet address to a profile
func (c *Client) LinkWalletToProfile(ctx context.Context, userID, walletAddress string) error {
	return c.UpdateProfile(ctx, userID, map[string]interface{}{"wallet_address": walletAddress})
}

// ListJobs retrieves jobs for a user
func (c *Client) ListJobs(ctx context.Context, userID string, limit int) ([]Job, error) {
	path := fmt.Sprintf("/rest/v1/jobs?user_id=eq.%s&select=*&order=created_at.desc&limit=%d", userID, limit)
	data, err := c.doRequest(ctx, "GET", path, nil)
	if err != nil {
		return nil, err
	}

	var jobs []Job
	if err := json.Unmarshal(data, &jobs); err != nil {
		return nil, err
	}
	return jobs, nil
}

// GetJob retrieves a job by ID
func (c *Client) GetJob(ctx context.Context, jobID string) (*Job, error) {
	data, err := c.doRequest(ctx, "GET", "/rest/v1/jobs?id=eq."+jobID+"&select=*", nil)
	if err != nil {
		return nil, err
	}

	var jobs []Job
	if err := json.Unmarshal(data, &jobs); err != nil {
		return nil, err
	}
	if len(jobs) == 0 {
		return nil, fmt.Errorf("job not found")
	}
	return &jobs[0], nil
}

// CreateJob creates a new job
func (c *Client) CreateJob(ctx context.Context, job *Job) error {
	_, err := c.doRequest(ctx, "POST", "/rest/v1/jobs", job)
	return err
}

// UpdateJobStatus updates a job status
func (c *Client) UpdateJobStatus(ctx context.Context, jobID, status string) error {
	updates := map[string]string{"status": status}
	_, err := c.doRequest(ctx, "PATCH", "/rest/v1/jobs?id=eq."+jobID, updates)
	return err
}

// ListNodes retrieves all nodes
func (c *Client) ListNodes(ctx context.Context) ([]Node, error) {
	data, err := c.doRequest(ctx, "GET", "/rest/v1/nodes?select=*&order=reputation_score.desc", nil)
	if err != nil {
		return nil, err
	}

	var nodes []Node
	if err := json.Unmarshal(data, &nodes); err != nil {
		return nil, err
	}
	return nodes, nil
}

// GetNodeByWallet retrieves a node by wallet address
func (c *Client) GetNodeByWallet(ctx context.Context, wallet string) (*Node, error) {
	data, err := c.doRequest(ctx, "GET", "/rest/v1/nodes?wallet_address=eq."+wallet+"&select=*", nil)
	if err != nil {
		return nil, err
	}

	var nodes []Node
	if err := json.Unmarshal(data, &nodes); err != nil {
		return nil, err
	}
	if len(nodes) == 0 {
		return nil, fmt.Errorf("node not found")
	}
	return &nodes[0], nil
}

// RegisterNode registers a new node
func (c *Client) RegisterNode(ctx context.Context, node *Node) error {
	_, err := c.doRequest(ctx, "POST", "/rest/v1/nodes", node)
	return err
}

// OnboardingStatus represents a user's onboarding state
type OnboardingStatus struct {
	UserType            string `json:"user_type"`
	OnboardingCompleted bool   `json:"onboarding_completed"`
	HasWalletLinked    bool   `json:"has_wallet_linked"`
}

// GetOnboardingStatus retrieves onboarding status for a user
func (c *Client) GetOnboardingStatus(ctx context.Context, userID string) (*OnboardingStatus, error) {
	path := fmt.Sprintf("/rest/v1/user_onboarding_status?id=eq.%s&select=user_type,onboarding_completed,has_wallet_linked", userID)
	data, err := c.doRequest(ctx, "GET", path, nil)
	if err != nil {
		return nil, err
	}

	var statuses []OnboardingStatus
	if err := json.Unmarshal(data, &statuses); err != nil {
		return nil, err
	}
	if len(statuses) == 0 {
		// Profile doesn't exist yet — treat as new user (no onboarding)
		return &OnboardingStatus{UserType: "client", OnboardingCompleted: false, HasWalletLinked: false}, nil
	}
	return &statuses[0], nil
}

// UpdateOnboardingStatus updates a user's onboarding state
func (c *Client) UpdateOnboardingStatus(ctx context.Context, userID string, userType string, completed bool) error {
	updates := map[string]interface{}{
		"user_type":             userType,
		"onboarding_completed": completed,
	}
	return c.UpdateProfile(ctx, userID, updates)
}

// SetUserType sets the user type (client/provider)
func (c *Client) SetUserType(ctx context.Context, userID, userType string) error {
	return c.UpdateProfile(ctx, userID, map[string]interface{}{"user_type": userType})
}

// CompleteOnboarding marks a user's onboarding as complete
func (c *Client) CompleteOnboarding(ctx context.Context, userID string) error {
	return c.UpdateProfile(ctx, userID, map[string]interface{}{"onboarding_completed": true})
}

// UpdateNodeHeartbeat records a node heartbeat
func (c *Client) UpdateNodeHeartbeat(ctx context.Context, nodeID string, vramUsed, vramTotal int64, latency int) error {
	data := map[string]interface{}{
		"node_id":            nodeID,
		"vram_used_mb":      vramUsed,
		"vram_total_mb":     vramTotal,
		"packet_latency_ms": latency,
	}
	_, err := c.doRequest(ctx, "POST", "/rest/v1/node_heartbeats", data)
	return err
}
