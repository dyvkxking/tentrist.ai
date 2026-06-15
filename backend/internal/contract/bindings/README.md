# Go Bindings Generation

## Prerequisites
Install Go 1.22+ and geth (for abigen):

```bash
# Install Go from https://go.dev/dl/
# Then install geth tools:
go install github.com/ethereum/go-ethereum/cmd/abigen@latest
```

## Generate Bindings

From the contracts directory, run:

```bash
# Ensure contracts are compiled
npx hardhat compile

# Generate all bindings
cd ../backend
./scripts/generate-bindings.sh
```

## Contracts to Bind
1. Escrow.sol
2. SLAContract.sol
3. SlashManager.sol
4. ReputationLedger.sol
5. NodeRegistry.sol

## Output
Bindings will be generated in `backend/internal/contract/bindings/`