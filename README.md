# Carapace

> **Phase 1 of TortoiseOS**: Building the foundation for AI-powered DeFi on Sui

Carapace is the foundational layer of the TortoiseOS DeFi ecosystem, implementing core liquidity infrastructure through an intelligent AMM (TortoiseSwap) and auto-compounding vault (TortoiseVault) on the Sui blockchain.

## Overview

**Carapace** delivers two essential DeFi primitives enhanced with AI capabilities:

- **TortoiseSwap AMM**: Constant product automated market maker with ML-powered adaptive fee optimization
- **TortoiseVault**: Auto-compounding yield aggregator using reinforcement learning in TEE

This project serves as the liquidity backbone for the broader TortoiseOS ecosystem, enabling efficient token swaps and automated yield optimization.

## Features

### TortoiseSwap (AMM)
- Constant product market maker (x * y = k)
- AI-driven dynamic fee adjustment based on volatility
- Sui-native implementation with shared object pools
- Capital-efficient liquidity provision
- Flash swap support

### TortoiseVault
- Automated yield compounding strategies
- Reinforcement learning optimizer running in Nautilus TEE
- Multi-strategy portfolio management
- Gas-optimized auto-compounding
- Transparent fee structure

### Infrastructure
- Next.js 14 web interface with Magic UI
- Express API backend on Bun runtime
- Sui Move smart contracts
- TypeScript SDK for blockchain interaction
- Docker-based development environment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Bun >= 1.1.0 |
| **Smart Contracts** | Sui Move |
| **Frontend** | Next.js 14 + React + Tailwind CSS |
| **Backend** | Express on Bun |
| **UI Components** | Magic UI |
| **Blockchain SDK** | @mysten/sui.js |
| **AI/ML** | Walrus Storage + Nautilus TEE |
| **DevOps** | Docker Compose, Task automation |
| **Testing** | Bun Test, Playwright |

## Development Status

**Current State:** Active Development - Phase 1

This project is under active development. The following components are functional:
- ✅ Frontend web app (Next.js)
- ✅ E2E testing with Playwright
- ✅ Move smart contracts (building and testing)
- ✅ SDK for blockchain interaction
- ⚠️ Type checking (has errors to fix)
- ⚠️ Build process (blocked by type errors)
- ⚠️ Linting (setup in progress)

For detailed status, see [FUNCTIONAL_STATUS.md](./FUNCTIONAL_STATUS.md)

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.1.0
- [Docker](https://www.docker.com/) and Docker Compose (optional, for database & monitoring)
- [Sui CLI](https://docs.sui.io/build/install) >= 1.0.0 (for Move contract development)
- [Task](https://taskfile.dev) (optional, provides helpful automation commands)

### Installation

```bash
# Clone the repository
git clone https://github.com/tortoise-os/carapace.git
cd carapace

# Install dependencies
bun install

# Start development server (web app only)
bun run dev
```

The web app will be available at `http://localhost:3501`.

**Verified Working Commands:**
- ✅ `bun install` - Install dependencies
- ✅ `bun run dev` - Start development server
- ✅ `bun test` - Run E2E tests (requires Playwright browsers: `bunx playwright install chromium`)
- ✅ `bun run format` - Format code with Prettier

### Optional: Docker Services

If you want to run the full stack with database, monitoring, and API:

```bash
# Start Docker services (from tooling/docker directory)
cd tooling/docker
docker compose up -d
cd ../..

# Or use Task automation (if Task is installed)
task docker:up
```

### Optional: Sui Development Setup

For Move contract development:

```bash
# Initialize Sui environment (requires Sui CLI)
task sui:init

# Or manually
sui client new-env --alias localnet --rpc http://127.0.0.1:9000
sui client switch --env localnet
```

## Project Structure

```
carapace/
├── apps/
│   ├── web/                    # Next.js 14 frontend application
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   └── lib/                # Frontend utilities
│   └── api/                    # Express API server
│       ├── routes/             # API endpoints
│       └── services/           # Business logic
├── packages/
│   ├── core/                   # Shared core utilities
│   ├── sdk/                    # Sui SDK wrapper & blockchain interaction
│   └── ui/                     # Magic UI component library
├── move/
│   └── sources/
│       ├── amm/                # TortoiseSwap AMM contracts
│       └── vault/              # TortoiseVault contracts
├── docker/                     # Docker configurations
├── Taskfile.yml                # Task automation
└── package.json                # Monorepo configuration
```

## Development

### Available Commands

#### Core Development Commands (No additional tools required)

```bash
# Development
bun run dev              # Start web app in dev mode (localhost:3501)

# Building
bun run build            # Build all apps and packages

# Testing
bun test                 # Run E2E tests with Playwright
bun run test:unit        # Run unit tests (if any)

# Code Quality
bun run lint             # Lint all code (setup in progress)
bun run type-check       # TypeScript type checking (has some errors to fix)
bun run format           # Format code with Prettier
bun run format -- --check # Check formatting without writing
```

#### Task Automation Commands (Requires [Task](https://taskfile.dev) CLI)

```bash
# Development
task dev                 # Start all services (Docker + Web)
task dev:web             # Start Next.js web app only
task dev:api             # Start API server

# Sui Development
task sui:init            # Initialize Sui environment
task sui:check           # Check if Sui CLI is installed
task sui:balance         # Check SUI balance
task sui:faucet          # Request tokens from faucet

# Move Contracts
task move:build          # Build Move contracts
task move:test           # Test Move contracts
task move:publish:local  # Publish to local network
task move:publish:testnet # Publish to testnet

# Docker Services
task docker:up           # Start Docker services
task docker:down         # Stop Docker services
task docker:logs         # View Docker logs

# Testing
task test                # Run all tests (Move + E2E)
task test:e2e            # Run E2E tests
task test:move           # Run Move contract tests

# Building
task build               # Build all packages
task build:web           # Build web app only

# Utilities
task setup               # Complete project setup
task status              # Show status of all services
task clean               # Clean build artifacts
```

#### Workspace-specific Commands

```bash
# Web App (from apps/web)
cd apps/web
bun run dev              # Start Next.js dev server
bun run build            # Build production bundle
bun run test:e2e         # Run Playwright tests
bun run test:e2e:ui      # Run Playwright with UI mode
```

### Working with Move Contracts

Requires: [Sui CLI](https://docs.sui.io/build/install)

```bash
# Using Task (recommended)
task move:build          # Build contracts
task move:test           # Test contracts
task move:publish:local  # Publish to local network

# Using Sui CLI directly
cd move
sui move build           # Build Move contracts
sui move test            # Test Move contracts
```

**Publishing Contracts:**

```bash
# Local network (requires local Sui node running)
task move:publish:local

# Testnet (requires testnet SUI tokens)
task move:publish:testnet

# Or manually
cd move
sui client publish --gas-budget 100000000
```

## Architecture

### AMM Design (TortoiseSwap)

```
┌─────────────────────────────────────────────┐
│          TortoiseSwap AMM                   │
├─────────────────────────────────────────────┤
│  Liquidity Pools (Shared Objects)           │
│  ├── Token X Reserve                        │
│  ├── Token Y Reserve                        │
│  └── LP Token Supply                        │
├─────────────────────────────────────────────┤
│  Core Functions                             │
│  ├── add_liquidity()                        │
│  ├── remove_liquidity()                     │
│  ├── swap()                                 │
│  └── get_amounts()                          │
├─────────────────────────────────────────────┤
│  AI Fee Optimizer (Off-chain)              │
│  ├── Volatility Model (ML)                 │
│  ├── Dynamic Fee Adjustment                │
│  └── Walrus Storage for Models             │
└─────────────────────────────────────────────┘
```

### Vault Design (TortoiseVault)

```
┌─────────────────────────────────────────────┐
│        TortoiseVault Auto-compounder        │
├─────────────────────────────────────────────┤
│  Vault Shared Object                        │
│  ├── User Deposits (shares)                │
│  ├── Strategy Allocations                  │
│  └── Reward Tracking                       │
├─────────────────────────────────────────────┤
│  Strategy Manager                           │
│  ├── Yield Farm Integration                │
│  ├── Auto-compound Logic                   │
│  ├── Rebalancing Functions                 │
│  └── Fee Collection                        │
├─────────────────────────────────────────────┤
│  AI Optimizer (Nautilus TEE)               │
│  ├── RL Strategy Optimizer                 │
│  ├── Secure Execution in TEE               │
│  ├── Performance Analytics                 │
│  └── Risk Management                       │
└─────────────────────────────────────────────┘
```

## TortoiseOS Ecosystem

Carapace is **Phase 1** of the TortoiseOS roadmap:

### Phase 1 (Current) - Foundation
- TortoiseSwap AMM
- TortoiseVault Auto-compounder

### Phase 2 - Expansion
- TortoiseUSD (NFT-backed stablecoin)
- TortoiseArb (AI arbitrage bot)

### Phase 3 - Cross-chain & RWA
- TortoiseBridgeX (Cross-chain bridge)
- RWA Vault (Real-world assets)
- BTCfi Aggregator

### Phase 4 - Advanced Products
- Privacy Vault (zkProofs)
- Prediction Market (AI-powered)
- Orderbook Launcher

[Learn more about TortoiseOS](https://github.com/tortoise-os/bun-move)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`bun test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Security

This project handles financial assets. Security is our top priority:

- All Move contracts undergo comprehensive testing
- External security audits planned before mainnet
- Bug bounty program coming soon
- Report vulnerabilities to: security@tortoiseos.dev

## Documentation

### Core Documents (Root)
- **[README.md](./README.md)** - This file (project overview)
- **[ROADMAP.md](./ROADMAP.md)** - Complete Phase 1 roadmap
- **[FUNCTIONAL_STATUS.md](./FUNCTIONAL_STATUS.md)** - Current functional status (updated: 2025-10-22)

### Documentation Index
📚 **[docs/INDEX.md](./docs/INDEX.md)** - Complete documentation index with organization and history

### Quick Links
- **Getting Started**: [docs/guides/GETTING_STARTED.md](./docs/guides/GETTING_STARTED.md)
- **Testnet Deployment**: [docs/guides/TESTNET_DEPLOYMENT.md](./docs/guides/TESTNET_DEPLOYMENT.md)
- **Troubleshooting**: [docs/guides/TROUBLESHOOTING.md](./docs/guides/TROUBLESHOOTING.md)
- **Security Audit Guide**: [docs/security/SECURITY_AUDIT_GUIDE.md](./docs/security/SECURITY_AUDIT_GUIDE.md)
- **Sui DeFi Research**: [docs/research/SUI_DEFI_REFERENCES.md](./docs/research/SUI_DEFI_REFERENCES.md)
- **Percolator Research**: [docs/research/PERCOLATOR_RESEARCH.md](./docs/research/PERCOLATOR_RESEARCH.md)

### External Documentation
- [TortoiseOS Main Repo](https://github.com/tortoise-os/bun-move)
- [Sui Documentation](https://docs.sui.io)
- [Move Language Guide](https://move-language.github.io/move/)

### Reference Implementations (Sui DeFi)
- [Cetus CLMM](https://github.com/CetusProtocol/cetus-clmm) - Concentrated liquidity AMM
- [Navi Protocol](https://github.com/naviprotocol/navi-lending) - Lending protocol
- [Turbos Finance](https://github.com/turbos-finance/turbos) - Hybrid DEX
- [Avocado DEX](https://github.com/avocadodefi/sc-dex) - Clean reference implementation
- [Sui AI Agent Kit](https://github.com/caterpillardev/Sui-AI-Agent-Kit) - AI/DeFi integration

### Community
- [Discord](https://discord.gg/tortoiseos)
- [Twitter](https://twitter.com/tortoiseos)
- [Telegram](https://t.me/tortoiseos)

### Tools
- [Sui Explorer](https://suiexplorer.com)
- [Sui Wallet](https://docs.sui.io/build/wallet)
- [Walrus Documentation](https://docs.walrus.site)

## License

MIT License - see [LICENSE](LICENSE) file for details

---

Built with slow and steady precision by the TortoiseOS team.
