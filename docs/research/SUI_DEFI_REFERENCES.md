# Sui DeFi Reference Repositories for Carapace Development

> Analysis of production Sui DeFi protocols to inform Carapace's AMM, vault, and AI integration design

## Executive Summary

This document analyzes five battle-tested Sui DeFi repositories that provide complementary insights for Carapace's development:

1. **CetusProtocol/cetus-clmm**: Concentrated liquidity AMM (CLMM) - AMM optimization reference
2. **naviprotocol/navi-lending**: Lending protocol - Yield vault and risk management patterns
3. **turbos-finance/turbos**: Hybrid DEX - Scalability and high-throughput design
4. **avocadodefi/sc-dex**: Pure Move DEX - Clean reference implementation for auditing
5. **caterpillardev/Sui-AI-Agent-Kit**: AI agents for DeFi - AI/ML integration patterns

These repositories complement our existing Percolator research (Solana perpetuals) by providing **Sui-native** implementations and Move language best practices.

---

## 1. CetusProtocol/cetus-clmm

**URL**: https://github.com/CetusProtocol/cetus-clmm
**Category**: Concentrated Liquidity Market Maker (CLMM)
**Stars**: ~500+ | **Status**: Production (Leading Sui DEX)

### Why Study for Carapace

Cetus is the leading DEX on Sui with significant TVL and volume. As a concentrated liquidity AMM (like Uniswap V3), it offers advanced capital efficiency mechanisms that can inspire TortoiseSwap's design, particularly for AI-driven liquidity optimization.

### Key Features to Explore

#### 1.1 Concentrated Liquidity Pools
- **Tick-based pricing mechanism**: Discretizes price ranges for capital efficiency
- **Position management**: Users provide liquidity in specific price ranges
- **Relevance to Carapace**: Our RL optimizer could automatically adjust LP positions to optimal ranges

**Study Priority**: 🔴 CRITICAL
**Files to Review**:
- `sources/pool.move` - Core pool logic
- `sources/position.move` - Position management
- `sources/tick.move` - Tick-based pricing

#### 1.2 Flash Swap Implementation
- **Atomic flash loans**: Borrow without collateral, repay in same transaction
- **Fee collection**: Sophisticated fee accounting for concentrated positions
- **Relevance**: Carapace Phase 1A includes flash swaps

**Study Priority**: 🟠 HIGH
**Integration Task**: Adapt flash swap patterns for TortoiseSwap

#### 1.3 SDK Architecture
- **TypeScript SDK**: Clean abstraction for pool interactions
- **Transaction builders**: Composable PTB (Programmable Transaction Blocks)
- **Relevance**: Template for `packages/sdk/` structure

**Study Priority**: 🟠 HIGH
**Files to Review**:
- `sdk/src/` - Full SDK implementation
- Transaction builder patterns

#### 1.4 Oracle Integration
- **TWAP (Time-Weighted Average Price)**: On-chain price oracle
- **Price observation accumulation**: Historical price tracking
- **Relevance**: Phase 1B price oracle integration

**Study Priority**: 🟡 MEDIUM

### Specific Learnings for Carapace

| Feature | Cetus Implementation | Carapace Application |
|---------|---------------------|----------------------|
| Liquidity Concentration | Tick-based ranges | AI-optimized auto-ranging for vault strategies |
| Fee Tiers | Multiple fixed tiers (0.01%, 0.05%, 0.3%) | Dynamic ML-adjusted fees based on volatility |
| Position NFTs | NFT-based LP positions | Tokenized vault shares with metadata |
| Flash Swaps | Atomic borrow-repay | TortoiseArb arbitrage execution |

### Action Items

- [ ] Clone and build Cetus locally: `git clone https://github.com/CetusProtocol/cetus-clmm`
- [ ] Review tick-based math in `sources/tick.move` and `sources/tick_math.move`
- [ ] Study flash swap implementation for integration pattern
- [ ] Analyze SDK structure for `packages/sdk/` design
- [ ] Benchmark concentrated liquidity vs constant product for capital efficiency
- [ ] Prototype AI-driven range adjustment for concentrated positions (Phase 2 feature)

**Timeline**: Week 1-2 (Phase 1A) for core AMM, Week 7+ for advanced features

---

## 2. naviprotocol/navi-lending

**URL**: https://github.com/naviprotocol/navi-lending
**Category**: Lending & Borrowing Protocol
**Stars**: ~300+ | **Status**: Production

### Why Study for Carapace

Navi Protocol implements lending markets with isolated pools and leveraged yield farming. This aligns directly with TortoiseVault's multi-strategy approach and provides patterns for risk management and yield aggregation.

### Key Features to Explore

#### 2.1 Isolated Lending Pools
- **Risk isolation**: Each pool has independent risk parameters
- **Collateral factors**: Configurable LTV (Loan-to-Value) ratios
- **Relevance**: TortoiseVault's multi-strategy isolation and risk scoring

**Study Priority**: 🔴 CRITICAL
**Files to Review**:
- `sources/pool.move` - Lending pool implementation
- `sources/risk_manager.move` - Risk parameter management

#### 2.2 Interest Rate Models
- **Utilization-based rates**: Dynamic interest rates based on supply/demand
- **Compound interest calculation**: Continuous compounding logic
- **Relevance**: Vault share price calculation and yield accrual

**Study Priority**: 🟠 HIGH
**Integration Task**: Adapt interest accrual for vault share pricing

#### 2.3 Liquidation Mechanism
- **Health factor tracking**: Monitor collateralization ratios
- **Incentivized liquidations**: Reward liquidators with discounts
- **Relevance**: Complements Percolator's liquidation framework (Phase 1J)

**Study Priority**: 🔴 CRITICAL
**Cross-Reference**: PERCOLATOR_RESEARCH.md Section 1 (Risk Management)

#### 2.4 Oracle Integration
- **Pyth Network**: Real-time price feeds
- **Switchboard**: Fallback oracle
- **Multiple oracle aggregation**: Median price calculation
- **Relevance**: Phase 1B price oracle integration

**Study Priority**: 🟠 HIGH

### Specific Learnings for Carapace

| Feature | Navi Implementation | Carapace Application |
|---------|---------------------|----------------------|
| Risk Isolation | Per-market risk params | Per-strategy risk allocation in vault |
| Liquidation | Health factor + incentives | Cross-pool netting + RL prediction |
| Yield Compounding | Manual + automated strategies | TEE-based RL auto-compounding |
| Oracle Aggregation | Multi-source median | Dynamic fee adjustment inputs |

### Action Items

- [ ] Clone and analyze Navi: `git clone https://github.com/naviprotocol/navi-lending`
- [ ] Study isolated pool architecture for vault strategy isolation
- [ ] Review liquidation health factor calculation
- [ ] Analyze interest rate model for vault share pricing
- [ ] Benchmark Pyth vs Switchboard oracle latency/cost
- [ ] Prototype risk-adjusted strategy allocation (Phase 1E)

**Timeline**: Week 5-6 (Phase 1E - Vault Implementation)

---

## 3. turbos-finance/turbos

**URL**: https://github.com/turbos-finance/turbos
**Category**: Hybrid Orderbook-AMM DEX
**Stars**: ~200+ | **Status**: Production

### Why Study for Carapace

Turbos implements a hybrid model combining orderbook efficiency with AMM liquidity. This offers scalability lessons crucial for Phase 2 (TortoiseUSD, TortoiseArb) and complements Phase 1J's sharding research.

### Key Features to Explore

#### 3.1 Hybrid Execution Model
- **Orderbook for large trades**: Price-time priority matching
- **AMM for long-tail**: Automated market making for less liquid pairs
- **Relevance**: Multi-hop routing and Phase 4 orderbook launcher

**Study Priority**: 🟡 MEDIUM (Phase 2+)
**Files to Review**:
- `sources/clob.move` - Central limit order book
- `sources/pool.move` - AMM integration

#### 3.2 Gas-Efficient Swaps
- **Batch settlement**: Group multiple swaps for gas savings
- **Optimized data structures**: Minimal state access patterns
- **Relevance**: Phase 1J batch processing and gas optimization

**Study Priority**: 🟠 HIGH
**Cross-Reference**: PERCOLATOR_RESEARCH.md Section 2 (Batch Processing)

#### 3.3 Sharded Pool Architecture
- **Horizontal scaling**: Multiple pool instances per pair
- **Load balancing**: Distribute transactions across shards
- **Relevance**: Phase 1J Section 7J.3 (Scalability)

**Study Priority**: 🔴 CRITICAL (for Phase 1J)
**Cross-Reference**: TODO_PERCOLATOR.md "Sharding Architecture Design"

#### 3.4 Frontend SDK
- **React hooks**: Clean integration patterns
- **Real-time quotes**: WebSocket price updates
- **Relevance**: `apps/web/` frontend optimization

**Study Priority**: 🟡 MEDIUM

### Specific Learnings for Carapace

| Feature | Turbos Implementation | Carapace Application |
|---------|---------------------|----------------------|
| Hybrid Model | Orderbook + AMM | Multi-hop routing + AI optimization |
| Batch Settlement | Transaction grouping | Phase 1J MEV-protected batching |
| Sharding | Per-pair shards | Dynamic TVL-based sharding |
| Gas Optimization | Minimal state reads | Fixed-point math + optimized allocators |

### Action Items

- [ ] Clone and explore Turbos: `git clone https://github.com/turbos-finance/turbos`
- [ ] Study sharded pool implementation for Phase 1J design
- [ ] Review batch settlement patterns for MEV protection
- [ ] Analyze gas optimization techniques (state access patterns)
- [ ] Benchmark hybrid model vs pure AMM for capital efficiency
- [ ] Document sharding lessons in `docs/architecture/sharding.md`

**Timeline**: Week 7-9 (Phase 1J - Sharding Architecture)

---

## 4. avocadodefi/sc-dex

**URL**: https://github.com/avocadodefi/sc-dex
**Category**: Uniswap V2-style DEX in Pure Move
**Stars**: ~100+ | **Status**: Reference Implementation

### Why Study for Carapace

Avocado implements classic Uniswap V2 and Solidly invariants in clean, auditable Move code. This serves as an ideal reference for validating Carapace's core AMM math and provides a benchmark for fixed-point precision.

### Key Features to Explore

#### 4.1 Constant Product Formula
- **Clean x*y=k implementation**: No external dependencies
- **LP token math**: Accurate share calculation
- **Relevance**: Audit reference for `move/sources/amm/pool.move`

**Study Priority**: 🔴 CRITICAL
**Files to Review**:
- `sources/swap.move` - Core swap logic
- `sources/router.move` - Multi-hop routing

#### 4.2 Solidly Stable Swap Invariant
- **StableSwap curve**: Optimized for correlated assets (e.g., stablecoins)
- **Lower slippage**: Better rates for like-kind swaps
- **Relevance**: Future TortoiseUSD pools (Phase 2)

**Study Priority**: 🟡 MEDIUM (Phase 2)

#### 4.3 Factory Pattern
- **Deterministic pool creation**: Predictable addresses
- **Registry management**: Indexable pool list
- **Relevance**: Pool creation UI (Phase 1C)

**Study Priority**: 🟠 HIGH

#### 4.4 Fixed-Point Math
- **Precision handling**: Decimal operations without floats
- **Overflow protection**: Safe arithmetic
- **Relevance**: Phase 1J Section 7J.1 (Fixed-Point Math Library)

**Study Priority**: 🔴 CRITICAL
**Cross-Reference**: TODO_PERCOLATOR.md "Fixed-Point Math Library"

### Specific Learnings for Carapace

| Feature | Avocado Implementation | Carapace Application |
|---------|---------------------|----------------------|
| Constant Product | Clean x*y=k | Core TortoiseSwap formula |
| Fixed-Point Math | Safe decimal operations | Phase 1J precision library |
| Factory Pattern | Deterministic pool addresses | Enhanced object derivation (Phase 1J) |
| Stable Invariant | Solidly curve | TortoiseUSD pools (Phase 2) |

### Action Items

- [ ] Clone Avocado DEX: `git clone https://github.com/avocadodefi/sc-dex`
- [ ] Audit constant product implementation against Carapace's pool.move
- [ ] Port fixed-point math utilities to `move/sources/math/fixed_point.move`
- [ ] Study factory pattern for deterministic object derivation
- [ ] Benchmark stable swap invariant for Phase 2 planning
- [ ] Unit test Carapace math against Avocado reference implementation

**Timeline**: Week 1-2 (Phase 1A - immediate reference) + Week 7 (Phase 1J - math library)

---

## 5. caterpillardev/Sui-AI-Agent-Kit

**URL**: https://github.com/caterpillardev/Sui-AI-Agent-Kit
**Category**: AI Agents for Sui DeFi
**Stars**: ~50+ | **Status**: Active Development

### Why Study for Carapace

This repository directly addresses AI-DeFi integration on Sui, which is Carapace's core differentiator. It provides patterns for off-chain AI agents interacting with on-chain protocols via MCP (Model Context Protocol) tools.

### Key Features to Explore

#### 5.1 MCP Tools for DeFi
- **Automated trading agents**: AI-driven swap execution
- **Lending automation**: One-click borrow/lend with AI optimization
- **Relevance**: TortoiseVault RL optimizer and TortoiseArb (Phase 2)

**Study Priority**: 🔴 CRITICAL (for Phase 1F)
**Files to Review**:
- `src/tools/` - MCP tool implementations
- `src/agents/` - AI agent logic

#### 5.2 Secure Off-Chain Execution
- **Capability-based access**: Limited scope for AI actions
- **Transaction simulation**: Dry-run before execution
- **Relevance**: Phase 1J Section 7J.4 + Phase 1F Section 6.4

**Study Priority**: 🔴 CRITICAL
**Cross-Reference**: PERCOLATOR_RESEARCH.md Section 4 (Scoped Capabilities)

#### 5.3 Walrus Storage Integration
- **Model weight storage**: Off-chain ML model hosting
- **On-chain verification**: Commitment hashes for model integrity
- **Relevance**: Phase 1F ML fee optimization + RL vault strategies

**Study Priority**: 🟠 HIGH

#### 5.4 TEE Integration Patterns
- **Nautilus TEE**: Secure enclave for sensitive computations
- **Attestation**: Proof of correct execution
- **Relevance**: Phase 1F Section 6.2 (RL in TEE)

**Study Priority**: 🔴 CRITICAL (for Phase 1F)

### Specific Learnings for Carapace

| Feature | Sui-AI-Agent-Kit | Carapace Application |
|---------|-----------------|----------------------|
| MCP Tools | DeFi automation | TortoiseVault RL signals, TortoiseArb |
| Capability System | Scoped AI access | Phase 1J + 1F secure AI interaction |
| Walrus Storage | ML model hosting | Fee optimizer + vault strategy models |
| TEE Execution | Nautilus integration | Secure RL optimization |

### Action Items

- [ ] Clone AI Agent Kit: `git clone https://github.com/caterpillardev/Sui-AI-Agent-Kit`
- [ ] Study MCP tool architecture for vault AI integration
- [ ] Review capability-based access patterns (compare with Percolator)
- [ ] Analyze Walrus Storage integration for ML model deployment
- [ ] Test Nautilus TEE setup for RL optimizer prototype
- [ ] Integrate patterns into `apps/api/src/services/rl-optimizer.ts`

**Timeline**: Week 10-13 (Phase 1F - AI/ML Integration)

---

## Cross-Repository Integration Strategy

### Phased Learning Approach

#### Phase 1A-B: Core AMM (Weeks 1-4)
**Focus**: Cetus + Avocado
- Study Avocado's clean reference implementation first
- Port fixed-point math from Avocado to Carapace
- Review Cetus's advanced features (flash swaps, SDK)
- Benchmark capital efficiency (concentrated vs constant product)

**Deliverables**:
- Complete `move/sources/amm/pool.move` with audited math
- `move/sources/math/fixed_point.move` from Avocado patterns
- Flash swap implementation from Cetus patterns

#### Phase 1E: Vault Implementation (Weeks 5-6)
**Focus**: Navi Lending
- Study isolated pool risk management
- Adapt interest rate models for share pricing
- Review liquidation mechanisms for vault safety
- Integrate oracle patterns for multi-strategy evaluation

**Deliverables**:
- `move/sources/vault/vault.move` with risk isolation
- Oracle integration for strategy performance tracking
- Health factor monitoring for vault positions

#### Phase 1F: AI Integration (Weeks 10-13)
**Focus**: Sui-AI-Agent-Kit
- Implement MCP tools for vault automation
- Deploy Walrus Storage for ML models
- Set up Nautilus TEE environment
- Integrate scoped capabilities from Phase 1J

**Deliverables**:
- `apps/api/src/services/rl-optimizer.ts` with MCP integration
- TEE-based RL agent for strategy optimization
- Walrus Storage deployment for model weights

#### Phase 1J: Percolator + Turbos (Weeks 7-9)
**Focus**: Turbos (sharding) + Percolator research
- Study Turbos sharded architecture
- Compare with Percolator's slab design
- Design Sui-native sharding approach
- Prototype batch processing from both sources

**Deliverables**:
- `docs/architecture/sharding.md` with Sui-specific design
- Batch processing implementation in `move/sources/amm/batch.move`
- Sharding infrastructure tests

---

## Comparative Analysis

### AMM Designs Comparison

| Feature | Cetus (CLMM) | Avocado (V2) | Turbos (Hybrid) | Carapace Target |
|---------|--------------|--------------|-----------------|-----------------|
| **Formula** | Concentrated liquidity | Constant product | Orderbook + AMM | Constant product + AI fees |
| **Capital Efficiency** | High (tick-based) | Medium | High (hybrid) | Medium → High (AI-optimized) |
| **Complexity** | High | Low | Very High | Medium (hide in AI) |
| **Gas Cost** | Medium-High | Low | Medium | Low (Phase 1J optimization) |
| **Best For** | Stable/major pairs | Long-tail assets | High-volume | AI-enhanced all pairs |

**Carapace Strategy**: Start with Avocado's simplicity, add Cetus's flash swaps, integrate AI for dynamic optimization (avoiding CLMM complexity).

### Vault/Yield Strategies

| Feature | Navi Lending | Carapace Vault |
|---------|--------------|----------------|
| **Core Function** | Lend/borrow with interest | Auto-compound yield |
| **Risk Model** | Isolated pools + liquidation | Multi-strategy + cross-pool netting |
| **Optimization** | Utilization-based rates | RL in TEE |
| **Oracle** | Pyth + Switchboard | Same + on-chain TWAP |

**Carapace Advantage**: RL-driven strategy allocation vs static interest curves.

### AI Integration

| Feature | Sui-AI-Agent-Kit | Carapace Implementation |
|---------|------------------|-------------------------|
| **AI Location** | Off-chain agents | TEE (Nautilus) |
| **Access Control** | MCP tool scoping | Phase 1J capabilities + MCP |
| **Model Storage** | Walrus | Walrus |
| **Use Cases** | Trading automation | Fee optimization + vault strategies |

**Carapace Advantage**: TEE security + capability-based access for production-grade safety.

---

## Best Practices to Adopt

### 1. Move Smart Contract Patterns

#### From Cetus
- ✅ Versioned module design: `pool_v1`, `pool_v2` for upgradability
- ✅ Event-driven architecture: Rich event emission for indexers
- ✅ Generic types: `Pool<CoinX, CoinY>` for type safety

#### From Avocado
- ✅ Pure math modules: Separate math from state logic
- ✅ Exhaustive unit tests: 100% coverage for critical functions
- ✅ Minimal external dependencies: Reduce attack surface

#### From Navi
- ✅ Access control patterns: Role-based admin functions
- ✅ Emergency pause: Global kill switch for critical bugs
- ✅ Gradual rollout: Testnet → limited mainnet → full mainnet

### 2. SDK and Frontend Patterns

#### From Cetus SDK
- ✅ Transaction builders: Composable PTB construction
- ✅ Type safety: Full TypeScript types for all functions
- ✅ Error handling: Graceful degradation with retries

#### From Turbos Frontend
- ✅ Real-time quotes: WebSocket for live price updates
- ✅ Optimistic UI: Update UI before transaction confirmation
- ✅ Gas estimation: Show estimated costs before execution

### 3. AI/ML Integration Patterns

#### From Sui-AI-Agent-Kit
- ✅ MCP tool architecture: Modular, composable AI tools
- ✅ Simulation-first: Always dry-run before execution
- ✅ Capability scoping: Limit AI agent permissions strictly
- ✅ Walrus Storage: Off-chain model storage with on-chain hashes

### 4. Testing and Security

#### From All Repositories
- ✅ Fuzzing: Property-based testing for invariants
- ✅ Integration tests: End-to-end scenarios with real blockchain state
- ✅ Gas benchmarks: Track gas costs across versions
- ✅ Formal verification: Move Prover for critical math

---

## Repository Study Schedule

### Week 1 (Phase 1A Start)
- **Monday-Tuesday**: Clone all repos, build locally, run tests
- **Wednesday-Thursday**: Deep dive into Avocado DEX (reference implementation)
- **Friday**: Document fixed-point math patterns from Avocado

### Week 2 (Phase 1A Continued)
- **Monday-Wednesday**: Study Cetus CLMM (tick math, flash swaps, SDK)
- **Thursday-Friday**: Compare Cetus vs Avocado vs Carapace design decisions

### Week 3-4 (Phase 1B-C)
- **Ad-hoc reviews**: Reference repos as needed for specific features
- **Focus**: Navi oracle integration patterns

### Week 5-6 (Phase 1E - Vault)
- **Full week**: Navi lending protocol deep dive
- **Focus**: Risk management, interest models, liquidations

### Week 7-9 (Phase 1J - Percolator)
- **Week 7**: Turbos sharding architecture
- **Week 8**: Batch processing patterns (Turbos + Percolator)
- **Week 9**: Integration testing and documentation

### Week 10-13 (Phase 1F - AI)
- **Week 10-11**: Sui-AI-Agent-Kit full integration
- **Week 12**: MCP tools for vault automation
- **Week 13**: TEE setup and RL prototype

---

## Open Questions & Research Tasks

### For Cetus Study
- [ ] How does concentrated liquidity affect IL (impermanent loss) vs constant product?
- [ ] What's the gas cost delta between CLMM and simple AMM on Sui?
- [ ] Can we use RL to auto-adjust LP ranges in concentrated positions? (Phase 2 feature)

### For Navi Study
- [ ] How do they handle oracle failures/manipulation?
- [ ] What's the liquidation success rate and liquidator profitability?
- [ ] Can we combine lending with vault strategies for leveraged yields?

### For Turbos Study
- [ ] What's the actual throughput improvement from sharding?
- [ ] How do they handle cross-shard liquidity fragmentation?
- [ ] Is hybrid orderbook-AMM worth the complexity for Carapace?

### For Sui-AI-Agent-Kit Study
- [ ] What's the latency of TEE execution vs normal compute?
- [ ] How do they validate ML model outputs on-chain?
- [ ] Can we use MCP for cross-protocol composability (Phase 2)?

---

## Success Metrics for Repository Learning

### Code Quality Improvements
- [ ] Adopt versioned module pattern from Cetus
- [ ] Implement 100% test coverage like Avocado
- [ ] Add event-driven architecture inspired by Cetus

### Performance Improvements
- [ ] 20%+ gas reduction using Turbos patterns
- [ ] < 100ms quote latency using Cetus SDK patterns
- [ ] Shard design validated with Turbos benchmarks

### Security Improvements
- [ ] Emergency pause mechanism from Navi
- [ ] Capability scoping from AI Agent Kit
- [ ] Formal verification of math modules (Avocado-style)

### Feature Completeness
- [ ] Flash swaps (Cetus pattern)
- [ ] Multi-oracle aggregation (Navi pattern)
- [ ] AI automation (AI Agent Kit pattern)

---

## Integration Priorities

### Immediate (This Week)
1. 🔴 Avocado DEX math audit → Validate Carapace pool.move
2. 🔴 Cetus flash swap study → Implement in Phase 1A
3. 🟠 Navi oracle patterns → Design Phase 1B integration

### Short-Term (Weeks 2-4)
1. 🟠 Cetus SDK architecture → Refactor packages/sdk/
2. 🟠 Avocado factory pattern → Pool creation (Phase 1C)
3. 🟡 Turbos gas optimization → Apply to pool.move

### Mid-Term (Weeks 5-9)
1. 🔴 Navi lending deep dive → Vault risk management (Phase 1E)
2. 🔴 Turbos sharding → Phase 1J architecture design
3. 🟠 All repos: Best practice adoption

### Long-Term (Weeks 10+)
1. 🔴 Sui-AI-Agent-Kit → Phase 1F AI integration
2. 🟡 Cetus CLMM → Phase 2 concentrated liquidity (optional)
3. 🟡 Turbos hybrid model → Phase 4 orderbook launcher

---

## Resources & Links

### Repository URLs
- [Cetus CLMM](https://github.com/CetusProtocol/cetus-clmm)
- [Navi Lending](https://github.com/naviprotocol/navi-lending)
- [Turbos Finance](https://github.com/turbos-finance/turbos)
- [Avocado DEX](https://github.com/avocadodefi/sc-dex)
- [Sui AI Agent Kit](https://github.com/caterpillardev/Sui-AI-Agent-Kit)

### Related Documentation
- [Sui Move Documentation](https://docs.sui.io/concepts/sui-move-concepts)
- [Pyth Price Feeds](https://docs.pyth.network/price-feeds/sui)
- [Walrus Storage](https://docs.walrus.site)
- [Nautilus TEE](https://docs.nautilus.network) (placeholder)

### Internal References
- [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md) - Solana perpetuals learnings
- [ROADMAP.md](./ROADMAP.md) - Full development roadmap
- [TODO_PERCOLATOR.md](./TODO_PERCOLATOR.md) - Percolator integration checklist

---

## Notes

- **All repositories are actively maintained as of October 2025**
- **Focus on Sui Move best practices** - These are production implementations
- **Complement, don't replace Percolator research** - Percolator provides cross-chain patterns, these provide Sui-specific implementations
- **Prioritize Avocado → Cetus → Navi → AI Agent Kit → Turbos** for sequential learning
- **Clone all repos to local `research/` directory** for easy reference during development

---

**Last Updated**: 2025-10-22
**Status**: Active Research Phase
**Next Review**: After each major phase (1A, 1E, 1F, 1J completion)
