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

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.1.0
- [Docker](https://www.docker.com/) and Docker Compose
- [Sui CLI](https://docs.sui.io/build/install) >= 1.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/tortoise-os/carapace.git
cd carapace

# Install dependencies
bun install

# Start Docker services (Sui local network, Walrus, etc.)
docker compose up -d

# Initialize Sui environment
task sui:init

# Start development servers
bun run dev
```

The web app will be available at `http://localhost:3501` and the API at `http://localhost:3500`.

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

```bash
# Development
bun run dev              # Start all services in dev mode
bun run dev:web          # Start Next.js web app only
bun run dev:api          # Start Express API only

# Building
bun run build            # Build all packages
bun run build:web        # Build web app
bun run build:api        # Build API

# Testing
bun test                 # Run all tests
bun test:move            # Test Move contracts
bun test:e2e             # Run E2E tests with Playwright

# Sui Development
task sui:init            # Initialize Sui environment
task sui:publish         # Publish Move contracts
task sui:test            # Test Move contracts
task sui:deploy          # Deploy to testnet/mainnet

# Linting & Formatting
bun run lint             # Lint all code
bun run format           # Format with Prettier
bun run typecheck        # TypeScript type checking
```

### Working with Move Contracts

```bash
# Create new Move module
cd move
sui move new <module-name>

# Build Move contracts
sui move build

# Test Move contracts
sui move test

# Publish to local network
task sui:publish:local

# Publish to testnet
task sui:publish:testnet
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

## Resources

### Documentation
- [Carapace Docs](./docs/README.md)
- [TortoiseOS Main Repo](https://github.com/tortoise-os/bun-move)
- [Sui Documentation](https://docs.sui.io)
- [Move Language Guide](https://move-language.github.io/move/)

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
