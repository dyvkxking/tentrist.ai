package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gorilla/mux"

	"github.com/tentrist.ai/backend/pkg/supabase"
)

// WalletLinkHandler handles wallet linking to OAuth accounts
type WalletLinkHandler struct {
	nonceStore     map[string]*nonceEntry
	supabaseClient *supabase.Client
}

// Profile is an alias for supabase.Profile for compatibility
type Profile = supabase.Profile

type nonceEntry struct {
	nonce     string
	userID    string
	expiresAt time.Time
}

// NewWalletLinkHandler creates a new wallet link handler
func NewWalletLinkHandler() *WalletLinkHandler {
	return &WalletLinkHandler{
		nonceStore: make(map[string]*nonceEntry),
	}
}

// SetSupabaseClient sets the Supabase client for database operations
func (h *WalletLinkHandler) SetSupabaseClient(client *supabase.Client) {
	h.supabaseClient = client
}

// GenerateChallenge generates a nonce for wallet signing
// POST /api/v1/auth/wallet/challenge
func (h *WalletLinkHandler) GenerateChallenge(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID string `json:"user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	// Generate random nonce
	nonceBytes := make([]byte, 32)
	if _, err := rand.Read(nonceBytes); err != nil {
		http.Error(w, "failed to generate nonce", http.StatusInternalServerError)
		return
	}
	nonce := hex.EncodeToString(nonceBytes)

	// Store nonce with 5-minute expiry
	h.nonceStore[nonce] = &nonceEntry{
		nonce:     nonce,
		userID:    req.UserID,
		expiresAt: time.Now().Add(5 * time.Minute),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"nonce":  nonce,
		"message": fmt.Sprintf("Sign this message to link your wallet. Nonce: %s", nonce),
	})
}

// VerifyAndLink verifies wallet signature and links wallet to user profile
// POST /api/v1/auth/wallet/verify
func (h *WalletLinkHandler) VerifyAndLink(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID        string `json:"user_id"`
		Nonce        string `json:"nonce"`
		Signature    string `json:"signature"`
		WalletAddress string `json:"wallet_address"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.UserID == "" || req.Nonce == "" || req.Signature == "" || req.WalletAddress == "" {
		http.Error(w, "user_id, nonce, signature, and wallet_address are required", http.StatusBadRequest)
		return
	}

	// Validate wallet address format
	if !common.IsHexAddress(req.WalletAddress) {
		http.Error(w, "invalid wallet address", http.StatusBadRequest)
		return
	}

	// Check nonce exists and belongs to user
	entry, exists := h.nonceStore[req.Nonce]
	if !exists {
		http.Error(w, "invalid or expired nonce", http.StatusBadRequest)
		return
	}

	if entry.userID != req.UserID {
		http.Error(w, "nonce does not belong to this user", http.StatusBadRequest)
		return
	}

	if time.Now().After(entry.expiresAt) {
		delete(h.nonceStore, req.Nonce)
		http.Error(w, "nonce expired", http.StatusBadRequest)
		return
	}

	// Verify signature
	message := fmt.Sprintf("Link wallet to Tentrist account. Nonce: %s", req.Nonce)
	signatureBytes, err := hex.DecodeString(req.Signature)
	if err != nil {
		http.Error(w, "invalid signature format", http.StatusBadRequest)
		return
	}

	// Recover address from signature
	signedMessage := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	messageHash := crypto.Keccak256Hash([]byte(signedMessage))

	pubKey, err := crypto.SigToPub(messageHash.Bytes(), signatureBytes)
	if err != nil {
		http.Error(w, "signature verification failed", http.StatusUnauthorized)
		return
	}

	recoveredAddr := crypto.PubkeyToAddress(*pubKey)

	// Verify recovered address matches provided address
	if recoveredAddr.Hex() != common.HexToAddress(req.WalletAddress).Hex() {
		http.Error(w, "signature verification failed", http.StatusUnauthorized)
		return
	}

	// Delete used nonce
	delete(h.nonceStore, req.Nonce)

	// Write wallet address to Supabase profile
	if h.supabaseClient != nil {
		if err := h.supabaseClient.LinkWalletToProfile(r.Context(), req.UserID, req.WalletAddress); err != nil {
			http.Error(w, "failed to link wallet: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Return success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"wallet_address": req.WalletAddress,
		"message":        "Wallet linked successfully",
	})
}

// GetLinkedWallet returns the wallet address linked to a user (if any)
// GET /api/v1/auth/wallet/{userId}
func (h *WalletLinkHandler) GetLinkedWallet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	if userID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	if h.supabaseClient != nil {
		profile, err := h.supabaseClient.GetProfile(r.Context(), userID)
		if err == nil && profile.WalletAddr != "" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"linked":         true,
				"wallet_address": profile.WalletAddr,
			})
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"linked":         false,
		"wallet_address": nil,
	})
}
