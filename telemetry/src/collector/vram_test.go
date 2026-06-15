package collector

import (
	"testing"
)

func TestParseNVidiaSMIOutput_Valid(t *testing.T) {
	tests := []struct {
		name        string
		output      string
		expectedUsed uint64
		expectedTotal uint64
	}{
		{
			name:        "standard output",
			output:      "4096, 8192",
			expectedUsed: 4096,
			expectedTotal: 8192,
		},
		{
			name:        "with spaces",
			output:      "  4096 ,  8192  ",
			expectedUsed: 4096,
			expectedTotal: 8192,
		},
		{
			name:        "large values",
			output:      "16384, 32768",
			expectedUsed: 16384,
			expectedTotal: 32768,
		},
		{
			name:        "zero values",
			output:      "0, 0",
			expectedUsed: 0,
			expectedTotal: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			used, total, err := ParseNVidiaSMIOutput(tt.output)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if used != tt.expectedUsed {
				t.Errorf("expected used=%d, got %d", tt.expectedUsed, used)
			}
			if total != tt.expectedTotal {
				t.Errorf("expected total=%d, got %d", tt.expectedTotal, total)
			}
		})
	}
}

func TestParseNVidiaSMIOutput_Invalid(t *testing.T) {
	tests := []struct {
		name   string
		output string
	}{
		{
			name:   "empty string",
			output: "",
		},
		{
			name:   "single value",
			output: "4096",
		},
		{
			name:   "too many values",
			output: "4096, 8192, extra",
		},
		{
			name:   "non-numeric",
			output: "abc, def",
		},
		{
			name:   "mixed valid and invalid",
			output: "4096, abc",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, _, err := ParseNVidiaSMIOutput(tt.output)
			if err == nil {
				t.Error("expected error for invalid input")
			}
		})
	}
}

func TestNewVRAMCollector(t *testing.T) {
	collector := NewVRAMCollector("node1")
	if collector == nil {
		t.Fatal("expected non-nil VRAMCollector")
	}
	if collector.nodeID != "node1" {
		t.Errorf("expected nodeID=node1, got %s", collector.nodeID)
	}
}

func TestVRAMCollector_SetExecutor(t *testing.T) {
	collector := NewVRAMCollector("node1")
	mockExec := &mockNvidiaExecutor{}
	collector.SetExecutor(mockExec)
	if collector.executor != mockExec {
		t.Error("expected executor to be set to mock")
	}
}

// mockNvidiaExecutor is a mock for testing.
type mockNvidiaExecutor struct {
	output string
	err   error
}

func (m *mockNvidiaExecutor) Execute(name string, args ...string) (string, error) {
	return m.output, m.err
}

func TestVRAMCollector_CollectWithMockExecutor(t *testing.T) {
	collector := NewVRAMCollector("node1")
	mockExec := &mockNvidiaExecutor{
		output: "8192, 16384",
	}
	collector.SetExecutor(mockExec)

	hb, err := collector.Collect()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hb.VRAMUsedMB != 8192 {
		t.Errorf("expected VRAMUsedMB=8192, got %d", hb.VRAMUsedMB)
	}
	if hb.VRAMTotalMB != 16384 {
		t.Errorf("expected VRAMTotalMB=16384, got %d", hb.VRAMTotalMB)
	}
}

func TestVRAMCollector_CollectFallsBackOnError(t *testing.T) {
	collector := NewVRAMCollector("node1")
	mockExec := &mockNvidiaExecutor{
		err: ErrInvalidSMIOutput,
	}
	collector.SetExecutor(mockExec)

	// Should fall back to default values on error
	hb, err := collector.Collect()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Default fallback values
	if hb.VRAMUsedMB != 4096 {
		t.Errorf("expected fallback VRAMUsedMB=4096, got %d", hb.VRAMUsedMB)
	}
}

func TestSMIParseError(t *testing.T) {
	err := &SMIParseError{Message: "test error"}
	if err.Error() != "test error" {
		t.Errorf("expected 'test error', got '%s'", err.Error())
	}
}
