// Package main is the entry point for the Tentrist backend API server.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gorilla/mux"

	"github.com/tentrist.ai/backend/internal/api/handlers"
	"github.com/tentrist.ai/backend/internal/api/middleware"
	"github.com/tentrist.ai/backend/internal/contract"
	"github.com/tentrist.ai/backend/internal/orchestrator"
	"github.com/tentrist.ai/backend/pkg/supabase"
)

func main() {
	// Parse command line flags
	port := flag.Int("port", 8080, "HTTP server port")
	hardhatURL := flag.String("hardhat-url", "http://127.0.0.1:8545", "Hardhat node URL")
	supabaseURL := flag.String("supabase-url", "", "Supabase project URL")
	supabaseKey := flag.String("supabase-key", "", "Supabase service role key")
	flag.Parse()

	log.Printf("Starting Tentrist Backend API Server...")
	log.Printf("Port: %d", *port)
	log.Printf("Hardhat URL: %s", *hardhatURL)

	// Create context that cancels on SIGINT/SIGTERM
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigCh
		log.Println("Received shutdown signal")
		cancel()
	}()

	// Initialize Ethereum client
	var ethClient *ethclient.Client
	var contractClient *contract.ContractClient
	var err error

	ethClient, err = ethclient.Dial(*hardhatURL)
	if err != nil {
		log.Printf("Warning: Failed to connect to Hardhat: %v (continuing without blockchain)", err)
		ethClient = nil
	} else {
		log.Println("Connected to Hardhat node")
	}

	// Initialize contract client if connected
	if ethClient != nil {
		addrs := contract.ContractAddresses{
			Escrow:           common.HexToAddress("0x5fbdb2315678afecb367f032d93f642f54180abc"),
			SLAContract:      common.HexToAddress("0xe7f1725e7734ce288f8367e1bb2a07d5e1a1d1a9"),
			SlashManager:     common.HexToAddress("0x9fE46736379c178d7c7488a1c0b4c7c1d7a1d1a9"),
			ReputationLedger: common.HexToAddress("0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"),
			NodeRegistry:     common.HexToAddress("0x5b5d078dd54b0f9a1e3d8e1c4d8e1c4d8e1c4d8e"),
		}
		contractClient, err = contract.NewContractClient(ethClient, addrs)
		if err != nil {
			log.Printf("Warning: Failed to create contract client: %v", err)
			contractClient = nil
		} else {
			log.Println("Contract client initialized")
		}
	}

	// Initialize Supabase client
	var sbClient *supabase.Client
	if *supabaseURL != "" && *supabaseKey != "" {
		sbClient, err = supabase.NewClient(supabase.Config{
			URL: *supabaseURL,
			Key: *supabaseKey,
		})
		if err != nil {
			log.Printf("Warning: Failed to create Supabase client: %v", err)
			sbClient = nil
		} else {
			log.Println("Supabase client initialized")
		}
	} else {
		log.Println("Supabase credentials not provided, database features disabled")
	}

	// Initialize handlers with dependencies
	jobHandler := handlers.NewJobHandler()
	jobHandler.SetContractClient(contractClient)
	jobHandler.SetSupabaseClient(sbClient)

	nodeHandler := handlers.NewNodeHandler()
	nodeHandler.SetContractClient(contractClient)
	nodeHandler.SetSupabaseClient(sbClient)

	walletLinkHandler := handlers.NewWalletLinkHandler()
	if sbClient != nil {
		walletLinkHandler.SetSupabaseClient(sbClient)
	}

	// Initialize orchestrator components
	checkpointMgr := orchestrator.NewCheckpointManager()
	splitter := orchestrator.NewWorkloadSplitter()
	_ = checkpointMgr
	_ = splitter

	// Create mux router with middleware
	muxRouter := mux.NewRouter()
	muxRouter.Use(middleware.Recovery)
	muxRouter.Use(middleware.Logging)
	muxRouter.Use(middleware.CORS)

	// API v1 routes
	api := muxRouter.PathPrefix("/api/v1").Subrouter()

	// Job routes
	jobHandler.ServeJobs(api)

	// Node routes
	nodeHandler.ServeNodes(api)

	// Wallet link routes
	api.HandleFunc("/auth/wallet/challenge", walletLinkHandler.GenerateChallenge).Methods(http.MethodPost)
	api.HandleFunc("/auth/wallet/verify", walletLinkHandler.VerifyAndLink).Methods(http.MethodPost)
	api.HandleFunc("/auth/wallet/{userId}", walletLinkHandler.GetLinkedWallet).Methods(http.MethodGet)

	// Telemetry heartbeat endpoint
	muxRouter.HandleFunc("/api/v1/telemetry/heartbeat", handleHeartbeat).Methods(http.MethodPost)

	// Health check
	muxRouter.HandleFunc("/health", handleHealth).Methods(http.MethodGet)

	// Create HTTP server
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", *port),
		Handler: muxRouter,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server listening on :%d", *port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	<-ctx.Done()
	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}

	log.Println("Server stopped")
}

// handleHeartbeat handles incoming heartbeat signals from telemetry nodes.
func handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	var hb struct {
		NodeID          string `json:"nodeId"`
		VRAMUsedMB      uint64 `json:"vramUsedMb"`
		VRAMTotalMB     uint64 `json:"vramTotalMb"`
		PacketLatencyMs uint64 `json:"packetLatencyMs"`
		Timestamp       int64  `json:"timestamp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&hb); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	log.Printf("Heartbeat received from node %s: VRAM=%d/%d MB, latency=%d ms",
		hb.NodeID, hb.VRAMUsedMB, hb.VRAMTotalMB, hb.PacketLatencyMs)

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"ok","receivedAt":%d}`, time.Now().Unix())
}

// handleHealth returns server health status.
func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"ok","timestamp":%d,"service":"tentrist-backend"}`, time.Now().Unix())
}
