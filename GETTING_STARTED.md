# Getting Started with TortoiseSwap

Complete guide to running TortoiseSwap locally and creating test pools.

## Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://www.docker.com/) installed
- [Sui CLI](https://docs.sui.io/build/install) installed (for creating pools)
- Sui wallet (for testing swaps)

## Quick Start

### 1. Start Services

```bash
# Start database, redis, and monitoring services
cd tooling/docker
docker compose up -d

# Verify services are running
docker ps
```

Services will be available on:
- PostgreSQL: `localhost:3502`
- Redis: `localhost:3503`
- Grafana: `http://localhost:3504`
- Prometheus: `http://localhost:3505`

### 2. Start API Server

```bash
cd apps/api
bun install
bun run dev
```

API will be available at: `http://localhost:3500`

### 3. Start Web App

```bash
cd apps/web
bun install
bun run dev
```

Web app will be available at: `http://localhost:3501`

### 4. Verify Everything is Running

```bash
# Check API health
curl http://localhost:3500/health

# Check web app
open http://localhost:3501
```

## Creating Test Pools

To use the swap functionality, you need to create at least one pool with liquidity.

### Option 1: Using Sui CLI (Recommended for Testing)

1. **Get Testnet SUI**
   ```bash
   # Join Sui Discord and use the faucet channel
   # https://discord.com/channels/916379725201563759/971488439931392130
   ```

2. **Export Your Private Key**
   ```bash
   sui keytool export --key-identity <your-address>
   # Copy the private key (without 0x prefix)
   ```

3. **Set Environment Variable**
   ```bash
   export SUI_PRIVATE_KEY="your-private-key-here"
   export AMM_PACKAGE_ID="0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d"
   ```

4. **Run the Pool Creation Script**
   ```bash
   cd scripts
   bun create-test-pool.ts
   ```

### Option 2: Using the Sui Move CLI

```bash
# Create a pool for SUI/USDC
sui client call \
  --package 0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d \
  --module pool \
  --function create_pool \
  --type-args "0x2::sui::SUI" "YOUR_TOKEN_TYPE" \
  --gas-budget 100000000
```

### Adding Liquidity to a Pool

After creating a pool, you need to add liquidity:

```bash
sui client call \
  --package 0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d \
  --module pool \
  --function add_liquidity \
  --type-args "0x2::sui::SUI" "YOUR_TOKEN_TYPE" \
  --args POOL_ID COIN_X_ID COIN_Y_ID AMOUNT_X AMOUNT_Y MIN_LIQUIDITY \
  --gas-budget 100000000
```

## Testing the Swap Interface

Once you have a pool with liquidity:

1. **Open the Web App**
   - Navigate to `http://localhost:3501`

2. **Connect Your Wallet**
   - Click "Connect Wallet" in the top right
   - Select your Sui wallet (Sui Wallet, Suiet, Ethos, etc.)
   - Approve the connection

3. **Make a Test Swap**
   - Select tokens in the swap interface
   - Enter an amount
   - Review the quote (rate, price impact, fees)
   - Click "Swap" to execute

## Architecture

```
TortoiseSwap Stack
├── Move Contracts (Sui blockchain)
│   ├── AMM Pool Contract
│   └── Vault Contracts
├── API Server (Port 3500)
│   ├── REST API for pools, swaps, vaults
│   ├── Quote calculation
│   └── Transaction building
├── Indexer (Background service)
│   ├── Monitors blockchain events
│   └── Updates PostgreSQL database
├── Web App (Port 3501)
│   ├── Next.js 15 with App Router
│   ├── Sui wallet integration
│   └── Beautiful swap interface
└── Infrastructure
    ├── PostgreSQL (Port 3502)
    ├── Redis (Port 3503)
    ├── Grafana (Port 3504)
    └── Prometheus (Port 3505)
```

## Deployment Info

**Package ID (Testnet):**
```
0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d
```

**Network:**
```
testnet
```

**Explorer:**
```
https://testnet.suivision.xyz/package/0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d
```

## Common Issues

### Issue: "Cannot find module @carapace/sdk"

**Solution:** The SDK uses Bun workspace resolution. Make sure you're using `bun` (not `npm` or `yarn`).

### Issue: "Database connection failed"

**Solution:**
```bash
# Restart the database with fresh volumes
cd tooling/docker
docker compose down -v postgres
docker compose up -d postgres
```

### Issue: "No pools available"

**Solution:** You need to create at least one pool with liquidity. See "Creating Test Pools" above.

### Issue: "Wallet not connecting"

**Solution:**
- Make sure you have a Sui wallet extension installed
- Check that you're on testnet in your wallet
- Try refreshing the page

## Development Workflow

### Running Tests

```bash
# Run Move contract tests
cd contracts/carapace
sui move test

# Run SDK tests
cd packages/sdk
bun test

# Run API tests
cd apps/api
bun test
```

### Database Migrations

Migrations are automatically applied when the database container starts. Schema files are in:
```
tooling/docker/postgres/init.sql
```

### Monitoring

Access Grafana at `http://localhost:3504` to monitor:
- API performance
- Database queries
- Indexer status
- Transaction metrics

Default credentials:
- Username: `admin`
- Password: `admin`

## Next Steps

1. ✅ Get the system running (API + Web + Database)
2. ✅ Connect your wallet
3. 🔲 Create test pools with liquidity
4. 🔲 Test swapping
5. 🔲 Explore vaults (coming soon)
6. 🔲 Add more features

## Resources

- [Sui Documentation](https://docs.sui.io)
- [Move Language Book](https://move-language.github.io/move/)
- [Project Documentation](./docs)
- [API Documentation](./apps/api/README.md)

## Support

If you run into issues:

1. Check the logs:
   ```bash
   # API logs
   cd apps/api && bun run dev

   # Database logs
   docker logs carapace-postgres

   # Indexer logs
   docker logs carapace-indexer
   ```

2. Verify all services are running:
   ```bash
   docker ps
   curl http://localhost:3500/health
   ```

3. Check the database:
   ```bash
   docker exec -it carapace-postgres psql -U carapace -d carapace -c "\dt amm.*"
   ```

---

**Built with 🐢 by the TortoiseOS team**
