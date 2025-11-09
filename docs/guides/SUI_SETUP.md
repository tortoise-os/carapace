# Sui Setup Guide

This guide will help you set up Sui for deploying Move contracts.

## Current Status

You have:
- ✅ Sui CLI installed (v1.58.2)
- ✅ Testnet environment configured
- ✅ Active address: `0xe91b754c809f16c3a88e7be33a56b348532c377fbea30ed92ea34371c68466b9`
- ✅ Balance: 1.31 SUI on testnet

## Quick Start - Deploy to Testnet

Since you already have testnet set up, you can deploy immediately:

```bash
# Deploy to testnet (recommended)
task move:publish:testnet

# Or manually
cd move
sui client switch --env testnet
sui client publish --gas-budget 100000000
```

## Option 1: Using Testnet (Recommended)

Testnet is the easiest way to test your contracts without running a local node.

### Setup Testnet

```bash
# Initialize testnet environment
task sui:init:testnet

# Check your balance
sui client gas

# Request testnet SUI if needed
# Visit: https://discord.gg/sui (use #testnet-faucet channel)
```

### Deploy to Testnet

```bash
# Build contracts
task move:build

# Test contracts
task move:test

# Deploy to testnet
task move:publish:testnet
```

## Option 2: Using Local Network

For local development without internet dependency, you can run a local Sui node.

### Prerequisites

You need to run a local Sui node. There are two ways:

#### Option A: Using sui-test-validator (Simplest)

```bash
# Start local validator (in a separate terminal)
sui-test-validator

# This will start a local Sui network on http://127.0.0.1:9000
# Keep this running while developing
```

#### Option B: Using Docker

```bash
# Start Sui local network via Docker
cd tooling/docker
docker compose up sui-node -d

# Check logs
docker compose logs -f sui-node
```

### Setup Local Network

Once your local node is running:

```bash
# Initialize local environment
task sui:init

# This will:
# 1. Create localnet environment (http://127.0.0.1:9000)
# 2. Switch to localnet
# 3. Create/activate an address
# 4. Request tokens from local faucet
```

### Deploy to Local Network

```bash
# Build contracts
task move:build

# Test contracts
task move:test

# Deploy to local network
task move:publish:local
```

## Troubleshooting

### Error: "Connection refused" when using localnet

**Problem:** No local Sui node is running.

**Solution:**
```bash
# Option 1: Start sui-test-validator
sui-test-validator

# Option 2: Use testnet instead
task move:publish:testnet
```

### Error: "Client/Server api version mismatch"

**Problem:** Your Sui CLI version (1.58.2) differs from the server version.

**Solution:**
```bash
# Update Sui CLI (on macOS with Homebrew)
brew upgrade sui

# Or download latest from https://docs.sui.io/build/install
```

This is usually just a warning and won't prevent deployment.

### Error: "Insufficient gas"

**Problem:** Not enough SUI to pay for gas.

**Solution:**
```bash
# For testnet: Get more SUI from Discord faucet
# Visit https://discord.gg/sui and use #testnet-faucet

# For localnet: Request from local faucet
sui client faucet
```

### Error: "Environment not found"

**Problem:** The environment hasn't been created yet.

**Solution:**
```bash
# For testnet
task sui:init:testnet

# For localnet (requires local node running)
task sui:init
```

## Common Commands

```bash
# List all environments
sui client envs

# Switch environments
sui client switch --env testnet
sui client switch --env localnet

# Check current environment
sui client active-env

# List addresses
sui client addresses

# Check balance
sui client gas

# Get address
sui client active-address
```

## Recommended Workflow

For development, we recommend this workflow:

1. **Local Testing:**
   - Build: `task move:build`
   - Test: `task move:test`

2. **Testnet Deployment:**
   - Deploy: `task move:publish:testnet`
   - Test on testnet frontend
   - Iterate

3. **Mainnet (when ready):**
   - Final audit
   - Deploy: `task move:publish:mainnet`

## Next Steps

After successful deployment:

1. **Save the Package ID** - You'll see output like:
   ```
   Published package: 0xabcd1234...
   ```
   Save this Package ID.

2. **Update Environment Variables** - Add to `.env`:
   ```
   NEXT_PUBLIC_PACKAGE_ID=0xabcd1234...
   ```

3. **Test the Frontend** - Start the web app and test the integration:
   ```bash
   bun run dev
   ```

## Resources

- [Sui Documentation](https://docs.sui.io)
- [Sui Testnet Faucet](https://discord.gg/sui)
- [Sui Explorer (Testnet)](https://suiexplorer.com/?network=testnet)
- [Move Language Book](https://move-language.github.io/move/)
