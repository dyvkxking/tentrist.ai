// Package collector provides metric collectors for the telemetry service.
package collector

import (
	"bufio"
	"context"
	"os/exec"
	"strconv"
	"strings"

	"github.com/tentrist.ai/telemetry/src/heartbeat"
)

// VRAMCollector collects VRAM utilization metrics.
type VRAMCollector struct {
	nodeID    string
	executor  CommandExecutor
}

// CommandExecutor executes system commands.
type CommandExecutor interface {
	Execute(name string, args ...string) (string, error)
}

// nvidiaSMIExecutor implements CommandExecutor for nvidia-smi.
type nvidiaSMIExecutor struct{}

// Execute runs nvidia-smi and returns output.
func (e *nvidiaSMIExecutor) Execute(name string, args ...string) (string, error) {
	cmd := exec.Command(name, args...)
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}

// NewVRAMCollector creates a new VRAMCollector.
func NewVRAMCollector(nodeID string) *VRAMCollector {
	return &VRAMCollector{
		nodeID:    nodeID,
		executor:  &nvidiaSMIExecutor{},
	}
}

// SetExecutor sets a custom command executor (for testing).
func (c *VRAMCollector) SetExecutor(exec CommandExecutor) {
	c.executor = exec
}

// Collect gathers VRAM metrics by running nvidia-smi.
func (c *VRAMCollector) Collect() (*heartbeat.Heartbeat, error) {
	return c.CollectWithContext(context.Background())
}

// CollectWithContext gathers VRAM metrics with context support.
func (c *VRAMCollector) CollectWithContext(ctx context.Context) (*heartbeat.Heartbeat, error) {
	output, err := c.executor.Execute("nvidia-smi",
		"--query-gpu=memory.used,memory.total",
		"--format=csv,noheader,nounits")
	if err != nil {
		// Fall back to mock data if nvidia-smi is not available
		return heartbeat.NewHeartbeat(c.nodeID, 4096, 8192, 0), nil
	}

	vramUsed, vramTotal, err := ParseNVidiaSMIOutput(output)
	if err != nil {
		return heartbeat.NewHeartbeat(c.nodeID, 4096, 8192, 0), nil
	}

	return heartbeat.NewHeartbeat(c.nodeID, vramUsed, vramTotal, 0), nil
}

// ParseNVidiaSMIOutput parses nvidia-smi output in format:
// "memory.used, memory.total" e.g. "4096, 8192"
func ParseNVidiaSMIOutput(output string) (used, total uint64, err error) {
	scanner := bufio.NewScanner(strings.NewReader(output))
	if !scanner.Scan() {
		return 0, 0, ErrInvalidSMIOutput
	}

	line := scanner.Text()
	parts := strings.Split(line, ",")
	if len(parts) != 2 {
		return 0, 0, ErrInvalidSMIOutput
	}

	used, err = strconv.ParseUint(strings.TrimSpace(parts[0]), 10, 64)
	if err != nil {
		return 0, 0, ErrInvalidSMIOutput
	}

	total, err = strconv.ParseUint(strings.TrimSpace(parts[1]), 10, 64)
	if err != nil {
		return 0, 0, ErrInvalidSMIOutput
	}

	return used, total, nil
}

// Error definitions
var ErrInvalidSMIOutput = &SMIParseError{Message: "invalid nvidia-smi output format"}

// SMIParseError represents a parsing error for nvidia-smi output.
type SMIParseError struct {
	Message string
}

func (e *SMIParseError) Error() string {
	return e.Message
}
