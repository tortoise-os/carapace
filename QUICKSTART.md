# Quick Start Guide

Get Carapace running locally in 5 minutes! 🚀

---

## ✅ Prerequisites

Before you begin, ensure you have:
- ✅ Bun installed (v1.0+)
- ✅ Docker & Docker Compose
- ✅ Sui Wallet browser extension

---

## 🚀 Quick Start (5 Steps)

### Step 1: Set Up Environment Files

Copy the example files with the testnet package ID already configured:

```bash
# Root
cp .env.example .env

# SDK
cp packages/sdk/.env.example packages/sdk/.env

# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env

# Indexer
cp apps/indexer/.env.example apps/indexer/.env
```

**✅ All files already have the testnet Package ID configured:**
```
0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d
```

---

### Step 2: Start Infrastructure

Start PostgreSQL, Redis, Grafana, and Prometheus:

```bash
task docker:up

# Verify services are running
docker ps
```

Expected output:
```
CONTAINER          STATUS         PORTS
carapace-postgres  Up 5 seconds   0.0.0.0:5432->5432/tcp
carapace-redis     Up 5 seconds   0.0.0.0:6379->6379/tcp
carapace-grafana   Up 5 seconds   0.0.0.0:3030->3000/tcp
carapace-prometheus Up 5 seconds  0.0.0.0:9090->9090/tcp
```

---

### Step 3: Start Backend Services

Open **3 separate terminal windows** and run:

**Terminal 1 - API Server:**
```bash
cd apps/api
bun run dev
```
Wait for: `🐢 Carapace API Server running at http://0.0.0.0:3001`

**Terminal 2 - Event Indexer:**
```bash
cd apps/indexer
bun run dev
```
Wait for: `🐢 Carapace Event Indexer ... Starting from checkpoint: 0`

**Terminal 3 - Web App:**
```bash
cd apps/web
bun run dev
```
Wait for: `✓ Ready in XXms`

---

### Step 4: Open the App

Open your browser to:
```
http://localhost:3501
```

You should see the TortoiseSwap interface! 🐢

---

### Step 5: Connect Your Wallet

1. Click **"Connect Wallet"** in the top right
2. Select your Sui wallet (Sui Wallet, Ethos, etc.)
3. Approve the connection
4. Make sure you're on **Testnet**

---

## 🎯 What's Next?

### Create a Test Pool

Before you can swap, you need pools! Create one using the Sui CLI:

```bash
# Example: Create SUI/USDC pool
sui client call \
  --package 0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d \
  --module pool \
  --function create_pool \
  --type-args "0x2::sui::SUI" "YOUR_TOKEN_TYPE" \
  --gas-budget 10000000
```

**Note:** You'll need a second token type deployed on testnet to create a pool.

### Add Liquidity

Once you have a pool, add liquidity:

```bash
sui client call \
  --package 0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d \
  --module pool \
  --function add_liquidity \
  --args POOL_ID COIN_X_ID COIN_Y_ID MIN_LP_TOKENS \
  --gas-budget 10000000
```

### Test a Swap

Now you can swap tokens through the UI! 🎉

---

## 🔍 Verify Everything is Working

### Health Checks

**API:**
```bash
curl http://localhost:3500/health
# Expected: {"status":"ok","timestamp":"2025-10-20T..."}
```

**Database:**
```bash
task db:shell
# Then in psql:
\dt amm.*
# Should show: pools, swaps, liquidity_events tables
```

**Indexer:**
Check the terminal running the indexer - it should show:
```
✅ Database connected
Starting from checkpoint: 0
Processing events...
```

---

## 📊 Access Services

Once running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3501 | Swap interface |
| API | http://localhost:3500 | REST API |
| API Health | http://localhost:3500/health | Health check |
| Grafana | http://localhost:3504 | Metrics dashboard |
| Prometheus | http://localhost:3505 | Metrics scraper |
| PostgreSQL | localhost:3502 | Database |
| Redis | localhost:3503 | Cache |

---

## 🛠️ Useful Commands

### Development
```bash
# Start everything
task dev

# Stop Docker services
task docker:down

# Restart Docker services
task docker:restart

# View Docker logs
task docker:logs

# Clean all build artifacts
task clean
```

### Database
```bash
# Connect to database
task db:shell

# Reset database (WARNING: deletes all data)
task db:reset

# Backup database
task db:backup
```

### Move Contracts
```bash
# Build contracts
task move:build

# Run tests
task move:test

# Rebuild and test
task move:rebuild
```

---

## 🐛 Troubleshooting

### "Can't connect to database"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart services
task docker:restart

# Check logs
task docker:logs postgres
```

### "API won't start"
```bash
# Check .env file exists
ls apps/api/.env

# Verify database is running
task db:shell

# Check for port conflicts
lsof -i :3001
```

### "Indexer not finding events"
- Make sure Package ID in `.env` is correct
- Verify you're on testnet: `sui client active-env`
- Check if pools exist (may need to create one first)

### "Web app shows blank page"
```bash
# Check if API is running
curl http://localhost:3500/health

# Verify .env file
cat apps/web/.env

# Restart web app
# Ctrl+C in terminal, then: bun run dev
```

---

## 📚 Documentation

- **Full deployment details:** [TESTNET_DEPLOYMENT.md](./TESTNET_DEPLOYMENT.md)
- **Step-by-step deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Build summary:** [BUILD_SUMMARY.md](./BUILD_SUMMARY.md)
- **Clean build info:** [CLEAN_BUILD.md](./CLEAN_BUILD.md)
- **Implementation plan:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- **Project README:** [README.md](./README.md)

---

## 🎉 You're All Set!

Your Carapace AMM is now running locally and connected to Sui testnet!

**Next Steps:**
1. ✅ Create your first pool
2. ✅ Add liquidity
3. ✅ Test swaps
4. ✅ Monitor the indexer
5. ✅ Explore the API

Happy building! 🐢🚀

---

## 💡 Tips

- **First time?** Start by creating a simple SUI pool
- **Testing?** Use testnet faucet for SUI: `sui client faucet`
- **Issues?** Check the logs in each terminal window
- **Explorer:** https://testnet.suivision.xyz/package/0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d

---

## 🚨 Important Notes

1. **Testnet only** - This is for development/testing
2. **No real value** - Testnet tokens have no value
3. **May reset** - Testnet can be reset at any time
4. **For testing** - Do not use for production

Ready to ship to mainnet? See [DEPLOYMENT.md](./DEPLOYMENT.md) for mainnet deployment guide.
