#!/bin/bash
# Generate Go bindings from Hardhat artifacts
# Usage: ./scripts/generate-bindings.sh

set -e

CONTRACTS_DIR="../contracts"
ARTIFACTS_DIR="$CONTRACTS_DIR/artifacts/contracts"
OUTPUT_DIR="internal/contract/bindings"

# Clean output directory
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Generate bindings for each contract
echo "Generating Go bindings..."

# Escrow
echo "  - Escrow.sol"
abigen \
  --abi "$ARTIFACTS_DIR/Escrow.sol/Escrow.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/escrow.go" \
  --type Escrow

# IEACrow (interface)
echo "  - IEscrow.sol"
abigen \
  --abi "$ARTIFACTS_DIR/Escrow.sol/IEscrow.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/i_escrow.go" \
  --type IEscrow

# SLAContract
echo "  - SLAContract.sol"
abigen \
  --abi "$ARTIFACTS_DIR/SLAContract.sol/SLAContract.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/sla_contract.go" \
  --type SLAContract

# ISLA
echo "  - ISLA.sol"
abigen \
  --abi "$ARTIFACTS_DIR/SLAContract.sol/ISLA.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/i_sla.go" \
  --type ISLA

# SlashManager
echo "  - SlashManager.sol"
abigen \
  --abi "$ARTIFACTS_DIR/SlashManager.sol/SlashManager.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/slash_manager.go" \
  --type SlashManager

# ISlashManager
echo "  - ISlashManager.sol"
abigen \
  --abi "$ARTIFACTS_DIR/SlashManager.sol/ISlashManager.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/i_slash_manager.go" \
  --type ISlashManager

# ReputationLedger
echo "  - ReputationLedger.sol"
abigen \
  --abi "$ARTIFACTS_DIR/ReputationLedger.sol/ReputationLedger.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/reputation_ledger.go" \
  --type ReputationLedger

# IReputationLedger
echo "  - IReputationLedger.sol"
abigen \
  --abi "$ARTIFACTS_DIR/ReputationLedger.sol/IReputationLedger.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/i_reputation_ledger.go" \
  --type IReputationLedger

# NodeRegistry
echo "  - NodeRegistry.sol"
abigen \
  --abi "$ARTIFACTS_DIR/NodeRegistry.sol/NodeRegistry.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/node_registry.go" \
  --type NodeRegistry

# INodeRegistry
echo "  - INodeRegistry.sol"
abigen \
  --abi "$ARTIFACTS_DIR/NodeRegistry.sol/INodeRegistry.json" \
  --pkg bindings \
  --out "$OUTPUT_DIR/i_node_registry.go" \
  --type INodeRegistry

echo "Done! Generated bindings in $OUTPUT_DIR/"
ls -la "$OUTPUT_DIR/"