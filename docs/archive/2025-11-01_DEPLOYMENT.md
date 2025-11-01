# Deployment Guide

This guide covers deploying Carapace to Sui testnet and running the full stack locally.

## Prerequisites

- Sui CLI installed and configured
- Bun runtime (v1.0+)
- Docker and Docker Compose
- PostgreSQL (via Docker)

## Phase 1: Deploy Move Contracts to Testnet

### 1. Build and Test Contracts

```bash
# Navigate to Move package
cd move

# Build the contracts
sui move build

# Run all tests (should pass 16/16)
sui move test
```

### 2. Deploy to Testnet

```bash
# Make sure you have testnet configured
sui client switch --env testnet

# Check your active address and balance
sui client active-address
sui client gas

# If you need testnet SUI
sui client faucet

# Deploy the package
sui client publish --gas-budget 100000000

# Save the output! You'll need:
# - Package ID
# - Published-At address
```

### 3. Update Configuration

After deployment, update these files with your package ID:

**packages/sdk/.env**
```env
SUI_AMM_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
```

**apps/api/.env**
```env
SUI_NETWORK=testnet
SUI_AMM_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
```

**apps/web/.env**
```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_AMM_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
```

**apps/indexer/.env**
```env
SUI_NETWORK=testnet
SUI_AMM_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
```

## Phase 2: Set Up Local Infrastructure

### 1. Start Docker Services

```bash
# Start PostgreSQL, Redis, Grafana, Prometheus
task docker:up

# Check services are running
docker ps

# View logs
task docker:logs
```

### 2. Initialize Database

The database will be automatically initialized with the schema from `tooling/docker/postgres/init.sql`.

Verify it:
```bash
task db:shell
# Then in psql:
\dn  # List schemas
\dt amm.*  # List AMM tables
\q  # Exit
```

## Phase 3: Start Backend Services

### 1. Start API Server

```bash
cd apps/api

# Copy environment file
cp .env.example .env
# Edit .env and add your package ID

# Install dependencies (if not done)
bun install

# Start the server
bun run dev

# Server runs on http://localhost:3500
```

Test the API:
```bash
curl http://localhost:3500/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Start Event Indexer

```bash
cd apps/indexer

# Copy environment file
cp .env.example .env
# Edit .env and add your package ID

# Install dependencies (if not done)
bun install

# Start the indexer
bun run dev

# Indexer will start listening for events
```

## Phase 4: Start Frontend

### 1. Start Web App

```bash
cd apps/web

# Copy environment file
cp .env.example .env
# Edit .env and add your package ID

# Install dependencies (if not done)
bun install

# Start the dev server
bun run dev

# App runs on http://localhost:3501
```

### 2. Test the UI

1. Open http://localhost:3501 in your browser
2. Click "Connect Wallet"
3. Connect your Sui wallet (e.g., Sui Wallet, Ethos)
4. Try creating a test pool or swapping tokens

## Phase 5: Create Test Pool

You'll need to create at least one pool to test swaps:

### Using the SDK

```bash
cd packages/sdk

# Create a test script
cat > test-pool.ts << 'EOF'
import { CarapaceSDK } from './src';

async function main() {
  const sdk = new CarapaceSDK({
    network: 'testnet',
    packageIds: {
      carapace: process.env.SUI_AMM_PACKAGE_ID!,
    },
  });

  // Create a pool between SUI and USDC
  const tx = sdk.pool.createPool(
    '0x2::sui::SUI',
    '0xYOUR_TOKEN_PACKAGE::usdc::USDC'
  );

  console.log('Pool created!');
}

main();
EOF

# Run it
bun run test-pool.ts
```

## Monitoring and Debugging

### View Logs

```bash
# API logs
cd apps/api && bun run dev

# Indexer logs
cd apps/indexer && bun run dev

# Docker logs
task docker:logs
```

### Database Queries

```bash
# Connect to database
task db:shell

# Check pools
SELECT * FROM amm.pools;

# Check swaps
SELECT * FROM amm.swaps ORDER BY timestamp DESC LIMIT 10;

# Check indexer progress
SELECT * FROM indexer.checkpoints ORDER BY checkpoint DESC LIMIT 1;
```

### API Testing

```bash
# List pools
curl http://localhost:3500/api/pools

# Get pool details
curl http://localhost:3500/api/pools/0xPOOL_ID

# Get swap quote
curl "http://localhost:3500/api/pools/0xPOOL_ID/quote?amountIn=1000000000&isXToY=true"

# Get spot price
curl http://localhost:3500/api/pools/0xPOOL_ID/price
```

## Troubleshooting

### Contracts won't deploy
- Check gas balance: `sui client gas`
- Request testnet SUI: `sui client faucet`
- Verify build: `sui move build`

### API can't connect to database
- Check Docker is running: `docker ps`
- Verify DATABASE_URL in .env
- Check logs: `task docker:logs postgres`

### Indexer not finding events
- Verify package ID in .env
- Check if pools exist on-chain
- Look for error logs in indexer output

### Frontend can't connect to wallet
- Make sure you're on testnet
- Check wallet extension is installed
- Verify wallet has testnet SUI

### Database connection errors
- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check credentials match .env
- Try restarting: `task docker:restart`

## Production Deployment

For production deployment:

1. **Sui Mainnet**
   - Deploy contracts to mainnet
   - Update all package IDs
   - Use mainnet RPC endpoints

2. **API Server**
   - Deploy to cloud provider (AWS, GCP, etc.)
   - Use managed PostgreSQL
   - Set up Redis cluster
   - Configure CORS for your domain

3. **Web App**
   - Deploy to Vercel or similar
   - Update NEXT_PUBLIC_API_URL
   - Configure custom domain

4. **Indexer**
   - Run as background service
   - Set up monitoring/alerts
   - Configure auto-restart

5. **Database**
   - Use managed PostgreSQL (RDS, Cloud SQL)
   - Set up backups
   - Configure read replicas for scaling

## Next Steps

1. ✅ Deploy contracts to testnet
2. ✅ Update all package IDs
3. ✅ Start local infrastructure
4. ✅ Create test pools
5. ✅ Test swap functionality
6. Add liquidity to pools
7. Monitor indexer performance
8. Run integration tests
9. Security audit
10. Deploy to mainnet
