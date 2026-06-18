package orchestrator

import (
	"testing"
	"time"

	"github.com/tentrist.ai/backend/pkg/types"
)

// --- ContainerConfig validation tests ---

func TestValidateContainerConfig_ValidConfig(t *testing.T) {
	cfg := ContainerConfig{
		Image:           "nvidia/cuda:12.4-base-ubuntu22.04",
		WorkloadCommand:  []string{"/bin/bash", "-c", "echo hello"},
		CPUShares:       1024,
		MemoryLimitMB:   4096,
		VRAMLimitMB:     8192,
		NetworkMode:     "none",
		Timeout:         10 * time.Minute,
		ReadOnlyRootFS:  true,
	}

	err := ValidateContainerConfig(cfg)
	if err != nil {
		t.Errorf("expected valid config, got error: %v", err)
	}
}

func TestValidateContainerConfig_EmptyImage(t *testing.T) {
	cfg := ContainerConfig{
		Image:           "",
		WorkloadCommand:  []string{"/bin/bash"},
		MemoryLimitMB:    1024,
		VRAMLimitMB:      2048,
		NetworkMode:      "none",
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for empty image, got nil")
	}
	if err != nil && err.Error() != "container image cannot be empty" {
		t.Errorf("unexpected error message: %v", err)
	}
}

func TestValidateContainerConfig_EmptyCommand(t *testing.T) {
	cfg := ContainerConfig{
		Image:          "nvidia/cuda:12.4",
		WorkloadCommand: nil,
		MemoryLimitMB:   1024,
		VRAMLimitMB:     2048,
		NetworkMode:     "none",
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for empty command, got nil")
	}
}

func TestValidateContainerConfig_MemoryTooLow(t *testing.T) {
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   32, // below minimum of 64MB
		VRAMLimitMB:     0,
		NetworkMode:     "none",
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for memory < 64MB, got nil")
	}
}

func TestValidateContainerConfig_VRAMTooLow(t *testing.T) {
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   1024,
		VRAMLimitMB:     64, // below minimum of 128MB
		NetworkMode:     "none",
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for VRAM < 128MB, got nil")
	}
}

func TestValidateContainerConfig_CPUSharesTooLow(t *testing.T) {
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		CPUShares:      1, // below minimum of 2
		MemoryLimitMB:   1024,
		VRAMLimitMB:     0,
		NetworkMode:     "none",
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for CPU shares < 2, got nil")
	}
}

func TestValidateContainerConfig_TimeoutTooShort(t *testing.T) {
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   1024,
		VRAMLimitMB:     0,
		NetworkMode:     "none",
		Timeout:         500 * time.Millisecond, // below 1 second minimum
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for timeout < 1s, got nil")
	}
}

func TestValidateContainerConfig_NetworkNotIsolated(t *testing.T) {
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   1024,
		VRAMLimitMB:     0,
		NetworkMode:     "bridge", // NOT isolated
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for non-isolated network mode, got nil")
	}
}

func TestValidateContainerConfig_HostNetworkExplicitlyDenied(t *testing.T) {
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   1024,
		VRAMLimitMB:     0,
		NetworkMode:     "host", // explicitly not isolated
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected error for host network mode, got nil")
	}
}

// --- Network isolation tests ---

func TestIsNetworkIsolated_None(t *testing.T) {
	if !IsNetworkIsolated("none") {
		t.Error("expected 'none' to be isolated")
	}
}

func TestIsNetworkIsolated_Private(t *testing.T) {
	if !IsNetworkIsolated("private") {
		t.Error("expected 'private' to be isolated")
	}
}

func TestIsNetworkIsolated_Host(t *testing.T) {
	if IsNetworkIsolated("host") {
		t.Error("expected 'host' to NOT be isolated")
	}
}

func TestIsNetworkIsolated_Bridge(t *testing.T) {
	if IsNetworkIsolated("bridge") {
		t.Error("expected 'bridge' to NOT be isolated")
	}
}

func TestIsNetworkIsolated_Unknown(t *testing.T) {
	// Unknown modes return false (not verified as isolated)
	if IsNetworkIsolated("custom-net") {
		t.Error("expected unknown network mode to NOT be isolated")
	}
}

// --- Container name generation tests ---

func TestGenerateContainerName(t *testing.T) {
	testCases := []struct {
		jobID    string
		expected string
	}{
		{"job_001", "tentrist-workload-job_001"},
		{"abcdef1234567890", "tentrist-workload-abcdef12"},
		{"short", "tentrist-workload-short"},
	}

	for _, tc := range testCases {
		result := generateContainerName(tc.jobID)
		if result != tc.expected {
			t.Errorf("generateContainerName(%q) = %q, expected %q", tc.jobID, result, tc.expected)
		}
	}
}

// --- Constraint generation from Job SLA tests ---

func TestGenerateSandboxConstraints_Basic(t *testing.T) {
	job := &types.Job{
		Deadline: time.Now().Add(1 * time.Hour),
	}
	availableVRAMMB := uint64(16384) // 16GB

	cfg := GenerateSandboxConstraints(job, availableVRAMMB)

	// Verify image is set
	if cfg.Image == "" {
		t.Error("expected Image to be set")
	}

	// Verify memory is 2x VRAM
	expectedMemory := availableVRAMMB * 2
	if cfg.MemoryLimitMB != expectedMemory {
		t.Errorf("MemoryLimitMB = %d, expected %d", cfg.MemoryLimitMB, expectedMemory)
	}

	// Verify VRAM is set to available (not job requirement)
	if cfg.VRAMLimitMB != availableVRAMMB {
		t.Errorf("VRAMLimitMB = %d, expected %d", cfg.VRAMLimitMB, availableVRAMMB)
	}

	// Verify network is isolated
	if !IsNetworkIsolated(cfg.NetworkMode) {
		t.Errorf("NetworkMode = %q, expected isolated", cfg.NetworkMode)
	}

	// Verify timeout doesn't exceed deadline
	if cfg.Timeout > time.Until(job.Deadline) {
		t.Errorf("Timeout = %v exceeds deadline %v", cfg.Timeout, time.Until(job.Deadline))
	}

	// Verify read-only rootfs
	if !cfg.ReadOnlyRootFS {
		t.Error("expected ReadOnlyRootFS to be true")
	}
}

func TestGenerateSandboxConstraints_NoDeadline(t *testing.T) {
	job := &types.Job{
		Deadline: time.Time{}, // zero time = no deadline
	}
	cfg := GenerateSandboxConstraints(job, 8192)

	// Should use default timeout when no deadline
	if cfg.Timeout != 30*time.Minute {
		t.Errorf("Timeout = %v, expected 30 minutes default", cfg.Timeout)
	}
}

func TestGenerateSandboxConstraints_DeadlineTooSoon(t *testing.T) {
	job := &types.Job{
		Deadline: time.Now().Add(5 * time.Second), // very short deadline
	}
	cfg := GenerateSandboxConstraints(job, 8192)

	// Timeout should be capped by the deadline
	if cfg.Timeout > 10*time.Second {
		t.Errorf("Timeout = %v, expected to be capped by short deadline", cfg.Timeout)
	}
}

func TestGenerateSandboxConstraints_NilJob(t *testing.T) {
	cfg := GenerateSandboxConstraints(nil, 16384)

	// Should still generate valid defaults
	if cfg.Image == "" {
		t.Error("expected Image to be set even with nil job")
	}
	if cfg.MemoryLimitMB == 0 {
		t.Error("expected MemoryLimitMB to be set")
	}
	if cfg.NetworkMode != "none" {
		t.Errorf("NetworkMode = %q, expected 'none'", cfg.NetworkMode)
	}
}

func TestGenerateSandboxConstraints_CPUSharesCalculation(t *testing.T) {
	testCases := []struct {
		availableVRAMMB uint64
		expectedShares uint64
	}{
		{10240, 1024},  // 10GB -> 1024 shares (2 per GB)
		{20480, 2048},  // 20GB -> 2048 shares
		{4096,  409},   // 4GB -> 409 shares
	}

	for _, tc := range testCases {
		cfg := GenerateSandboxConstraints(nil, tc.availableVRAMMB)
		if cfg.CPUShares != tc.expectedShares {
			t.Errorf("for VRAM=%d: CPUShares = %d, expected %d",
				tc.availableVRAMMB, cfg.CPUShares, tc.expectedShares)
		}
	}
}

func TestGenerateSandboxConstraints_EnvVars(t *testing.T) {
	cfg := GenerateSandboxConstraints(nil, 8192)

	// Should have secure env vars set
	if len(cfg.Envvars) == 0 {
		t.Error("expected Envvars to be set")
	}

	// Verify CUDA env var is present
	foundCUDA := false
	for _, env := range cfg.Envvars {
		if env == "CUDA_VISIBLE_DEVICES=0" {
			foundCUDA = true
			break
		}
	}
	if !foundCUDA {
		t.Error("expected CUDA_VISIBLE_DEVICES env var to be set")
	}
}

// --- Boundary condition tests ---

func TestValidateContainerConfig_ZeroMemory(t *testing.T) {
	// Zero values should be allowed (means no limit)
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   0, // no limit
		VRAMLimitMB:     0, // no GPU
		NetworkMode:     "none",
	}

	err := ValidateContainerConfig(cfg)
	if err != nil {
		t.Errorf("expected zero values to be valid, got: %v", err)
	}
}

func TestValidateContainerConfig_ZeroTimeout(t *testing.T) {
	// Zero timeout means use default
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   1024,
		VRAMLimitMB:     0,
		NetworkMode:     "none",
		Timeout:         0, // will use default
	}

	err := ValidateContainerConfig(cfg)
	if err != nil {
		t.Errorf("expected zero timeout to be valid, got: %v", err)
	}
}

func TestGenerateSandboxConstraints_ZeroVRAM(t *testing.T) {
	// CPU-only job with no GPU
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   512,
		VRAMLimitMB:     0, // CPU only
		NetworkMode:     "none",
	}

	err := ValidateContainerConfig(cfg)
	if err != nil {
		t.Errorf("expected zero VRAM to be valid (CPU job), got: %v", err)
	}
}

// --- Security-focused tests ---

func TestGenerateSandboxConstraints_SecurityHardening(t *testing.T) {
	cfg := GenerateSandboxConstraints(nil, 8192)

	// Security checks
	if !cfg.ReadOnlyRootFS {
		t.Error("RootFS should be read-only for security")
	}

	if cfg.NetworkMode != "none" {
		t.Errorf("Network should be disabled, got %s", cfg.NetworkMode)
	}

	// Should NOT have any privileged operations
	// (these are defaults we set, not guaranteed by the test)
}

func TestValidateContainerConfig_PrivilegedContainer(t *testing.T) {
	// A config with host network would fail isolation check
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"echo", "hello"},
		MemoryLimitMB:   1024,
		VRAMLimitMB:     0,
		NetworkMode:     "host", // BAD - no network isolation
	}

	err := ValidateContainerConfig(cfg)
	if err == nil {
		t.Error("expected validation to fail for host network mode")
	}
}

// --- Container boundary simulation tests ---

func TestContainerBoundary_MemoryLimit(t *testing.T) {
	// Simulate a memory-constrained workload
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"python3", "-c", "import numpy; numpy.zeros((1024,1024))"},
		MemoryLimitMB:   256, // 256MB limit
		VRAMLimitMB:     0,
		NetworkMode:     "none",
	}

	// Validation should pass (config is valid)
	if err := ValidateContainerConfig(cfg); err != nil {
		t.Errorf("config should be valid: %v", err)
	}

	// In a real test with Docker, we'd verify:
	// 1. Container is created with --memory=256m
	// 2. OOM-killer triggers if limit exceeded
	// We can only validate the config here, not the runtime behavior
}

func TestContainerBoundary_VRAMLimit(t *testing.T) {
	// Simulate a GPU-constrained workload
	cfg := ContainerConfig{
		Image:          "nvidia/cuda:12.4-base-ubuntu22.04",
		WorkloadCommand: []string{"nvidia-smi"},
		MemoryLimitMB:   4096,
		VRAMLimitMB:     4096, // 4GB GPU memory limit
		NetworkMode:     "none",
	}

	if err := ValidateContainerConfig(cfg); err != nil {
		t.Errorf("config should be valid: %v", err)
	}
}

func TestContainerBoundary_TimeoutDeadline(t *testing.T) {
	// Simulate a job that times out
	deadline := time.Now().Add(30 * time.Second)
	cfg := ContainerConfig{
		Image:          "ubuntu:22.04",
		WorkloadCommand: []string{"sleep", "300"}, // 5 minute sleep
		MemoryLimitMB:   512,
		VRAMLimitMB:     0,
		NetworkMode:     "none",
		Timeout:         time.Until(deadline), // 30 seconds
	}

	if err := ValidateContainerConfig(cfg); err != nil {
		t.Errorf("config should be valid: %v", err)
	}

	// The container should be killed when timeout fires
	// In real test: verify container is force-killed after 30s
}

// --- Concurrency safety tests ---

func TestActiveContainers_Tracking(t *testing.T) {
	// This tests the conceptual tracking, not actual Docker
	// In production, we'd verify:
	// 1. Multiple concurrent LaunchContainer calls
	// 2. Each gets tracked in activeContainers map
	// 3. TerminateImmediately cancels specific containers
	// 4. cleanupContainer removes from tracking

	// Placeholder: actual concurrency test requires Docker daemon
	t.Skip("requires Docker daemon for full integration test")
}

// --- Constraint validation edge cases ---

func TestValidateContainerConfig_MinimumValid(t *testing.T) {
	// Smallest valid config
	cfg := ContainerConfig{
		Image:          "alpine:latest",
		WorkloadCommand: []string{"echo"},
		CPUShares:      2,
		MemoryLimitMB:   64,
		VRAMLimitMB:     128,
		NetworkMode:     "none",
		Timeout:         time.Second,
	}

	if err := ValidateContainerConfig(cfg); err != nil {
		t.Errorf("minimum valid config should pass: %v", err)
	}
}

func TestValidateContainerConfig_MaxValues(t *testing.T) {
	// Maximum constraint values (practical limits)
	cfg := ContainerConfig{
		Image:           "nvidia/cuda:12.4-base-ubuntu22.04",
		WorkloadCommand:  []string{"/bin/bash"},
		CPUShares:       8192, // 8x weight
		MemoryLimitMB:    131072, // 128GB
		VRAMLimitMB:      65536, // 64GB
		NetworkMode:      "none",
		Timeout:         24 * time.Hour,
		ReadOnlyRootFS:  true,
	}

	if err := ValidateContainerConfig(cfg); err != nil {
		t.Errorf("maximum config should pass: %v", err)
	}
}
