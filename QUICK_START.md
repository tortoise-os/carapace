# Carapace Quick Start Guide

## Current Setup ✅

Your Carapace project is now fully configured with:

- ✅ Docker services running (Postgres, Redis, Grafana, Prometheus)
- ✅ Sui CLI configured (testnet environment)
- ✅ Move contracts scaffolded with working tests
- ✅ Task automation ready
- ✅ Comprehensive README and implementation plan

## Services Status

```bash
task status
```

**Running Services:**
- **PostgreSQL**: localhost:5432 (database ready with AMM/Vault schemas)
- **Redis**: localhost:6379 (caching ready)
- **Grafana**: http://localhost:3030 (admin/admin)
- **Prometheus**: http://localhost:9090 (metrics collection)

**Sui Environment:**
- Network: testnet
- Active address: 0xe91b754c809f16c3a88e7be33a56b348532c377fbea30ed92ea34371c68466b9
- Balance: ~0.96 SUI

## Next Steps

### 1. Test Move Contracts

```bash
# Run all Move tests
task move:test

# Verbose output
task move:test:verbose

# Build contracts
task move:build
```

### 2. Start Local Sui Network (Optional)

For local development instead of testnet:

```bash
# Switch to localnet
sui client switch --env localnet

# Start local network with faucet
sui start --with-faucet --force-regenesis
```

### 3. Set Up Environment

```bash
# Copy example environment
cp .env.example .env

# Edit with your values
vim .env
```

### 4. Explore the Codebase

**Key Files:**
- `README.md` - Project overview
- `IMPLEMENTATION_PLAN.md` - 12-week execution roadmap
- `move/sources/amm/pool.move` - AMM implementation
- `move/sources/vault/vault.move` - Vault implementation
- `move/sources/common/math.move` - Math utilities

### 5. Start Building

Follow the implementation plan phases:

**Phase 1.1: Core AMM (Current)**
- Complete swap implementation in `pool.move`
- Add swap functions: `swap_x_to_y()`, `swap_y_to_x()`
- Implement AMM math: `get_amount_out()`, `get_amount_in()`
- Write comprehensive tests

**Next:**
```bash
# Edit the pool.move file
vim move/sources/amm/pool.move

# Test as you go
task move:test

# When ready, publish to testnet
task move:publish:testnet
```

## Useful Commands

### Docker Management

```bash
task docker:up          # Start services
task docker:down        # Stop services
task docker:restart     # Restart all
task docker:logs        # View logs
task docker:clean       # Clean and rebuild
```

### Sui Development

```bash
task sui:init           # Initialize Sui
task sui:faucet         # Request test tokens
task sui:balance        # Check balance
task sui:addresses      # List addresses
```

### Move Development

```bash
task move:build         # Build contracts
task move:test          # Run tests
task move:publish:local # Publish to local network
```

### Database

```bash
task db:console         # Open PostgreSQL console
```

### Monitoring

```bash
task grafana            # Open Grafana
task prometheus         # Open Prometheus
```

## Project Structure

```
carapace/
├── apps/               # Applications (empty - ready for web/api)
├── packages/           # Shared packages (empty - ready for SDK/UI)
├── move/              # Smart contracts ✅
│   ├── sources/
│   │   ├── amm/       # AMM implementation
│   │   ├── vault/     # Vault implementation
│   │   └── common/    # Shared utilities
│   └── tests/         # Test files
├── tooling/
│   └── docker/        # Docker configurations ✅
├── IMPLEMENTATION_PLAN.md  # Detailed roadmap
├── README.md          # Project overview
├── Taskfile.yml       # Task automation ✅
└── .env.example       # Environment template
```

## Development Workflow

1. **Write Code** - Edit Move contracts in `move/sources/`
2. **Test** - Run `task move:test` frequently
3. **Build** - Ensure it compiles with `task move:build`
4. **Deploy** - Publish to testnet with `task move:publish:testnet`
5. **Iterate** - Repeat

## Resources

- **Documentation**: [Sui Docs](https://docs.sui.io)
- **Move Book**: [Move Language](https://move-language.github.io/move/)
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md`
- **Community**: Discord/Telegram (links in README)

## Troubleshooting

### Docker Issues

```bash
# Clean everything and restart
task docker:clean

# Check logs
task docker:logs
```

### Sui Issues

```bash
# Check Sui installation
sui --version

# Reinitialize
task sui:init

# Get more test tokens
task sui:faucet
```

### Move Compilation Issues

```bash
# Clean build artifacts
task move:clean

# Rebuild
task move:build
```

## What to Build Next

Based on `IMPLEMENTATION_PLAN.md`, your immediate tasks are:

1. **Complete AMM swap logic** (Week 1-2)
   - Implement constant product formula
   - Add slippage protection
   - Write swap tests

2. **Build router** (Week 3)
   - Multi-hop swaps
   - Optimal path finding

3. **Create frontend** (Week 4)
   - Next.js app setup
   - Swap UI
   - Liquidity interface

Ready to start? Run:

```bash
# Test current implementation
task move:test

# Start coding!
vim move/sources/amm/pool.move
```

---

**Happy building! 🐢**
