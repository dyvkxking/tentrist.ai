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
	"github.com/jackc/pgx/v5/pgxpool"

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
	databaseURL := flag.String("database-url", "", "PostgreSQL connection string (e.g. postgres://user:pass@host:5432/db)")
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
			Escrow:           common.HexToAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3"),
			SLAContract:      common.HexToAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"),
			SlashManager:     common.HexToAddress("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"),
			ReputationLedger: common.HexToAddress("0xCf7Ed3AccA5a467e9e704C703E8d87F634fB0Fc9"),
			NodeRegistry:     common.HexToAddress("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"),
		}
		contractClient, err = contract.NewContractClient(ethClient, addrs)
		if err != nil {
			log.Printf("Warning: Failed to create contract client: %v", err)
			contractClient = nil
		} else {
			log.Println("Contract client initialized")
		}
	}

	// Initialize Supabase client (used for auth.users writes)
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

	// Initialize PostgreSQL connection pool (pgx) for job/node persistence
	var dbPool *pgxpool.Pool
	if *databaseURL != "" {
		dbPool, err = pgxpool.New(ctx, *databaseURL)
		if err != nil {
			log.Printf("Warning: Failed to create database pool: %v (continuing without DB)", err)
			dbPool = nil
		} else {
			log.Println("PostgreSQL connection pool initialized")
		}
	} else {
		log.Println("Database URL not provided, PostgreSQL features disabled")
	}

	// Initialize handlers with dependencies
	jobHandler := handlers.NewJobHandler()
	jobHandler.SetContractClient(contractClient)
	jobHandler.SetSupabaseClient(sbClient)
	if dbPool != nil {
		jobHandler.SetDB(dbPool)
	}

	nodeHandler := handlers.NewNodeHandler()
	nodeHandler.SetContractClient(contractClient)
	nodeHandler.SetSupabaseClient(sbClient)
	if dbPool != nil {
		nodeHandler.SetDB(dbPool)
	}

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

	// Slash event ingestion endpoint - persists slashing events to DB
	handleSlashEvent := func(w http.ResponseWriter, r *http.Request) {
		var ev struct {
			NodeAddress string `json:"nodeAddress"`
			Amount     string `json:"amount"`
			Reason     string `json:"reason"`
			JobID      string `json:"jobId"`
			Timestamp  int64  `json:"timestamp"`
		}
		if err := json.NewDecoder(r.Body).Decode(&ev); err != nil {
			http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
			return
		}
		log.Printf("Slash event: node=%s amount=%s reason=%s job=%s",
			ev.NodeAddress, ev.Amount, ev.Reason, ev.JobID)
		if dbPool != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, err := dbPool.Exec(ctx,
				`INSERT INTO public.slashing_events (node_address, amount, reason, job_id, event_timestamp, created_at)
				 VALUES ($1, $2, $3, $4, $5, NOW())`,
				ev.NodeAddress, ev.Amount, ev.Reason, ev.JobID, ev.Timestamp,
			)
			if err != nil {
				log.Printf("Warning: failed to insert slash event: %v", err)
			}
		}
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok"}`)
	}
	muxRouter.HandleFunc("/api/v1/telemetry/slash", handleSlashEvent).Methods(http.MethodPost)

	// Telemetry heartbeat endpoint
	handleHeartbeatWithDB := func(w http.ResponseWriter, r *http.Request) {
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

		// Insert heartbeat into node_heartbeats table if db is available
		if dbPool != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, err := dbPool.Exec(ctx,
				`INSERT INTO public.node_heartbeats (node_id, vram_used_mb, vram_total_mb, packet_latency_ms, timestamp, created_at)
				 VALUES ($1, $2, $3, $4, $5, NOW())`,
				hb.NodeID, hb.VRAMUsedMB, hb.VRAMTotalMB, hb.PacketLatencyMs, hb.Timestamp,
			)
			if err != nil {
				log.Printf("Warning: failed to insert heartbeat: %v", err)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok","receivedAt":%d}`, time.Now().Unix())
	}
	muxRouter.HandleFunc("/api/v1/telemetry/heartbeat", handleHeartbeatWithDB).Methods(http.MethodPost)

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
	if dbPool != nil {
		dbPool.Close()
	}
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}

	log.Println("Server stopped")
}

// handleHealth returns server health status.
func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"ok","timestamp":%d,"service":"tentrist-backend"}`, time.Now().Unix())
}
