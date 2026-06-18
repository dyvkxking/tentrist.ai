// Package orchestrator handles workload splitting, assignment, checkpoint management,
// and secure containerized execution for GPU compute jobs.
package orchestrator

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/tentrist.ai/backend/pkg/types"
)

// ContainerRuntime is an interface for container runtime operations.
// This allows for mock implementations in tests without requiring Docker.
type ContainerRuntime interface {
	PullImage(ctx context.Context, image string) error
	LaunchContainer(ctx context.Context, cfg ContainerConfig, jobID string) (string, error)
	WaitForCompletion(ctx context.Context, containerID string) (*ExecutionResult, error)
	TerminateImmediately(containerID string) error
}

// ContainerConfig defines runtime constraints for a sandboxed workload execution.
type ContainerConfig struct {
	// Image is the container image to pull and run.
	Image string

	// WorkloadCommand is the entrypoint command to execute inside the container.
	WorkloadCommand []string

	// CPU shares (relative weight). Value of 0 means no limit.
	CPUShares uint64

	// CPU quota (microseconds per second). Value of 0 means no limit.
	CPUQuota int64

	// MemoryLimitMB is the hard memory ceiling in megabytes.
	MemoryLimitMB uint64

	// VRAMLimitMB is the NVIDIA GPU memory limit in megabytes.
	// Requires nvidia-container-runtime.
	VRAMLimitMB uint64

	// NetworkMode controls network access. "none" = completely isolated.
	NetworkMode string

	// Timeout is the max execution duration before force-kill.
	Timeout time.Duration

	// ReadOnlyRootFS makes the root filesystem read-only.
	ReadOnlyRootFS bool

	// WorkDir is the working directory inside the container.
	WorkDir string

	// Envvars is a list of environment variables in "KEY=VALUE" format.
	Envvars []string

	// Mounts is a list of volume mounts (host path -> container path).
	Mounts []VolumeMount
}

// VolumeMount describes a host-to-container volume binding.
type VolumeMount struct {
	Source   string // host path
	Target   string // container path
	ReadOnly bool
}

// ExecutionResult captures the outcome of a sandboxed execution.
type ExecutionResult struct {
	ExitCode    int
	TimedOut    bool
	Stdout      string
	Stderr      string
	StartedAt   time.Time
	FinishedAt  time.Time
	ContainerID string
}

// SandboxDriver manages the lifecycle of containerized workload executions.
type SandboxDriver struct {
	runtime ContainerRuntime

	// activeContainers tracks containers that are currently running.
	// Key is container ID, value is context cancel func.
	activeContainers map[string]context.CancelFunc
	mu               sync.RWMutex

	// DefaultTimeout is the default execution timeout if none specified.
	DefaultTimeout time.Duration
}

// NewSandboxDriver creates a new SandboxDriver using the provided runtime.
// For production, pass a DockerRuntime or PodmanRuntime.
// For testing, pass a MockRuntime.
func NewSandboxDriver(runtime ContainerRuntime) *SandboxDriver {
	return &SandboxDriver{
		runtime:          runtime,
		activeContainers:  make(map[string]context.CancelFunc),
		DefaultTimeout:   10 * time.Minute,
	}
}

// LaunchContainer creates and starts a container with strict constraints.
func (sd *SandboxDriver) LaunchContainer(ctx context.Context, cfg ContainerConfig, jobID string) (string, error) {
	if cfg.Timeout == 0 {
		cfg.Timeout = sd.DefaultTimeout
	}

	// Validate constraints before launch
	if err := ValidateContainerConfig(cfg); err != nil {
		return "", fmt.Errorf("invalid container config: %w", err)
	}

	containerID, err := sd.runtime.LaunchContainer(ctx, cfg, jobID)
	if err != nil {
		return "", err
	}

	// Register for tracking
	sd.mu.Lock()
	sd.activeContainers[containerID] = func() {}
	sd.mu.Unlock()

	return containerID, nil
}

// WaitForCompletion blocks until the container exits and returns the result.
func (sd *SandboxDriver) WaitForCompletion(ctx context.Context, containerID string) (*ExecutionResult, error) {
	result, err := sd.runtime.WaitForCompletion(ctx, containerID)

	// Unregister from tracking
	sd.mu.Lock()
	delete(sd.activeContainers, containerID)
	sd.mu.Unlock()

	return result, err
}

// ExecuteWorkload is a convenience method that launches a container and waits for completion.
func (sd *SandboxDriver) ExecuteWorkload(ctx context.Context, cfg ContainerConfig, jobID string) (*ExecutionResult, error) {
	containerID, err := sd.LaunchContainer(ctx, cfg, jobID)
	if err != nil {
		return nil, err
	}

	return sd.WaitForCompletion(ctx, containerID)
}

// TerminateImmediately kills a running container without graceful shutdown.
func (sd *SandboxDriver) TerminateImmediately(containerID string) error {
	sd.mu.Lock()
	delete(sd.activeContainers, containerID)
	sd.mu.Unlock()

	return sd.runtime.TerminateImmediately(containerID)
}

// ActiveContainerCount returns the number of currently running containers.
func (sd *SandboxDriver) ActiveContainerCount() int {
	sd.mu.RLock()
	defer sd.mu.RUnlock()
	return len(sd.activeContainers)
}

// IsNetworkIsolated validates that the network mode provides zero host network access.
func IsNetworkIsolated(networkMode string) bool {
	isolatedModes := map[string]bool{
		"none":    true,
		"private": true,
		"host":    false, // explicitly NOT isolated
	}
	return isolatedModes[networkMode]
}

// ValidateContainerConfig performs static validation on container constraints.
// Returns an error if any constraint is invalid.
func ValidateContainerConfig(cfg ContainerConfig) error {
	if cfg.Image == "" {
		return fmt.Errorf("container image cannot be empty")
	}

	if len(cfg.WorkloadCommand) == 0 {
		return fmt.Errorf("workload command cannot be empty")
	}

	if cfg.MemoryLimitMB > 0 && cfg.MemoryLimitMB < 64 {
		return fmt.Errorf("memory limit must be at least 64MB, got %dMB", cfg.MemoryLimitMB)
	}

	if cfg.VRAMLimitMB > 0 && cfg.VRAMLimitMB < 128 {
		return fmt.Errorf("VRAM limit must be at least 128MB, got %dMB", cfg.VRAMLimitMB)
	}

	if cfg.CPUShares > 0 && cfg.CPUShares < 2 {
		return fmt.Errorf("CPU shares must be at least 2, got %d", cfg.CPUShares)
	}

	if cfg.Timeout > 0 && cfg.Timeout < time.Second {
		return fmt.Errorf("timeout must be at least 1 second, got %v", cfg.Timeout)
	}

	// Network isolation check
	if !IsNetworkIsolated(cfg.NetworkMode) {
		return fmt.Errorf("network mode %q does not provide host network isolation", cfg.NetworkMode)
	}

	return nil
}

// GenerateSandboxConstraints creates a ContainerConfig from a Job's SLA requirements.
// This maps the high-level SLA contract to concrete container constraints.
func GenerateSandboxConstraints(job *types.Job, availableVRAMMB uint64) ContainerConfig {
	// Default high-security configuration
	cfg := ContainerConfig{
		// Use a GPU-enabled CUDA base image
		Image:           "nvidia/cuda:12.4-base-ubuntu22.04",
		WorkloadCommand: []string{"/bin/bash", "-c", "echo 'workload'"},

		// CPU: allocate proportionally based on VRAM ratio
		// Rough heuristic: 2 vCPU per 10GB VRAM
		CPUShares: uint64(1024 * availableVRAMMB / 10240),
		CPUQuota:  100000, // 100% of one CPU

		// Memory: allocate 2x the VRAM limit as system RAM
		MemoryLimitMB: availableVRAMMB * 2,

		// VRAM: limit to what's available
		VRAMLimitMB: availableVRAMMB,

		// Network: STRICT ISOLATION - no network access
		NetworkMode: "none",

		// Timeout: use job deadline or default
		Timeout: 30 * time.Minute,

		// Security hardening
		ReadOnlyRootFS: true,

		// No environment variables by default (secure by default)
		Envvars: []string{
			"CUDA_VISIBLE_DEVICES=0",
			"NVIDIA_DRIVER_CAPABILITIES=compute,utility",
		},
	}

	// Override defaults if job has specific SLA requirements
	if job != nil {
		// Adjust timeout based on SLA deadline
		if !job.Deadline.IsZero() {
			maxDuration := time.Until(job.Deadline)
			if maxDuration > 0 && maxDuration < cfg.Timeout {
				cfg.Timeout = maxDuration
			}
		}
	}

	return cfg
}

// generateContainerName creates a deterministic name for the container.
func generateContainerName(jobID string) string {
	if len(jobID) < 8 {
		return fmt.Sprintf("tentrist-workload-%s", jobID)
	}
	return fmt.Sprintf("tentrist-workload-%s", jobID[:8])
}
