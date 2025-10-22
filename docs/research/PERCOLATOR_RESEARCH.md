# Percolator Research: Enhancement Opportunities for Carapace

> Analysis of Percolator (Solana perpetuals DEX) innovations applicable to Carapace (Sui AMM + Vault)

## Executive Summary

This document analyzes the Percolator perpetual futures exchange protocol on Solana and identifies concrete improvement opportunities for Carapace's AMM and vault infrastructure on Sui. While Percolator focuses on leveraged perpetuals and Carapace on spot liquidity/yield optimization, they share fundamental DeFi primitives that enable cross-pollination of design patterns.

## Project Comparison

### Percolator (decebal/percolator)
- **Chain**: Solana
- **Focus**: Sharded perpetual futures exchange
- **Key Features**:
  - Isolated "slabs" (liquidity pools) with independent state
  - Advanced risk management (cross-margin netting, liquidation detection)
  - Anti-toxicity mechanisms (batching, JIT penalties, ARG)
  - Fixed-point math for precision (6 decimals)
  - Capability-based security with time-limited tokens
  - Strict memory budgets (10MB/slab, O(1) allocations)

### Carapace (tortoise-os/carapace)
- **Chain**: Sui
- **Focus**: AI-enhanced AMM and auto-compounding yield vault
- **Key Features**:
  - TortoiseSwap: Constant product AMM with ML fee optimization
  - TortoiseVault: Auto-compounding vault with RL in TEE
  - Sui-native shared object pools
  - Flash swap support
  - Walrus Storage for AI models

## Enhancement Opportunities

### 1. Risk Management and Liquidation Handling

#### Percolator's Approach
- Dual-layer risk system: local slab margins + global cross-slab netting
- Precise equity tracking with unrealized PnL calculation
- Automated liquidation triggers with monotone increasing IM model
- Kill-band parameters for partial/full liquidations

#### Recommendations for Carapace

**1.1 Cross-Pool Netting in TortoiseVault**
- **Objective**: Reduce liquidation risk across multi-strategy portfolios
- **Implementation**:
  - Extend vault to track user exposures across TortoiseSwap pools and external Sui protocols
  - Use Sui's shared objects to maintain global position registry
  - Add pre-compound margin ratio checks
  - Implement cross-pool equity aggregation
- **Benefits**: Higher TVL retention, reduced losses during rebalancing
- **Priority**: HIGH (aligns with Phase 3 RWA/BTCfi)
- **Complexity**: Medium
- **Timeline**: Phase 1J + Phase 2

**1.2 Liquidation Detection in AMM**
- **Objective**: Prevent cascading failures during extreme volatility
- **Implementation**:
  - Port Percolator's monotone increasing initial margin (IM) model to Move
  - Add kill-band parameters to pool configuration
  - Implement off-chain RL signals via Walrus Storage to predict liquidations
  - Trigger partial/full liquidations during extreme slippage
- **Benefits**: Improved capital efficiency, better protection for LPs
- **Priority**: MEDIUM
- **Complexity**: High
- **Timeline**: Phase 1J

**1.3 Fixed-Point Math for Precision**
- **Objective**: Eliminate floating-point errors in AI fee adjustments
- **Implementation**:
  - Port Percolator's 6-decimal fixed-point library to Sui Move
  - Standardize basis-point calculations across contracts
  - Use for PnL, funding rates, and fee calculations
- **Benefits**: Consistent precision, reduced rounding errors
- **Priority**: HIGH
- **Complexity**: Low
- **Timeline**: Phase 1A (integrate with contract completion)

**Code Reference**: Move implementation in `move/sources/amm/pool.move`

---

### 2. Anti-Toxicity and MEV Protections

#### Percolator's Approach
- Batch windows for delayed maker posting
- JIT (just-in-time) penalty detection
- Aggressor roundtrip guards (ARG) with taxation
- Freeze levels to prevent manipulation
- 10K trade ring buffer for tracking

#### Recommendations for Carapace

**2.1 Batch Processing for Swaps**
- **Objective**: Mitigate sandwich attacks and front-running
- **Implementation**:
  - Introduce batch epochs in TortoiseSwap (1-2 block delay)
  - Group liquidity additions/removals and swaps
  - Use AI-driven batch sizing based on volatility
  - Leverage Sui's programmable transaction blocks
- **Benefits**: Reduced MEV exploitation, fairer execution
- **Priority**: HIGH
- **Complexity**: Medium
- **Timeline**: Phase 1J

**2.2 ARG-Like Taxation in Vault Compounding**
- **Objective**: Discourage toxic flows and rapid exit attacks
- **Implementation**:
  - Track aggressor entries in vault (rapid deposit-withdraw cycles)
  - Use ring buffer (similar to Percolator's 10K buffer)
  - Apply dynamic fees via RL in TEE based on behavior patterns
  - Reward long-term LPs with reduced fees
- **Benefits**: Increased LP confidence, reduced exploitation
- **Priority**: MEDIUM
- **Complexity**: Medium
- **Timeline**: Phase 1J + Phase 2

**2.3 Non-Replay Protection**
- **Objective**: Prevent replay attacks on AI interactions
- **Implementation**:
  - Add nonces to capabilities for off-chain AI calls
  - Implement two-phase reserve/commit flow (like Percolator)
  - Integrate with existing TEE security
- **Benefits**: Enhanced security for AI-driven operations
- **Priority**: HIGH
- **Complexity**: Low
- **Timeline**: Phase 1F (AI/ML Integration)

**Code Reference**: Implementation in `move/sources/amm/pool.move` and `packages/sdk/`

---

### 3. Scalability and Resource Efficiency

#### Percolator's Approach
- 10MB state budget per slab with strict enforcement
- O(1) freelist allocations
- Zero post-init allocations
- Tuned pool sizes (30K orders/positions)
- Sharded parallel execution model

#### Recommendations for Carapace

**3.1 Shard Liquidity Pools**
- **Objective**: Enable parallel execution and reduce contention
- **Implementation**:
  - Evolve shared object pools into per-token-pair shards
  - Use dynamic sharding based on TVL/volume metrics
  - Create central router for cross-shard swaps (like Percolator)
  - Leverage Sui's parallel execution capabilities
- **Benefits**: Better handling of scale, reduced gas costs
- **Priority**: HIGH (critical for Phase 2)
- **Complexity**: High
- **Timeline**: Phase 1J + Phase 2

**3.2 Memory-Optimized Vault Strategies**
- **Objective**: Prevent state bloat during RL rebalancing
- **Implementation**:
  - Adopt freelist-based allocators in Move contracts
  - Cap state growth for reward tracking and strategy allocations
  - Set limits per slab (start with 32 instruments as baseline)
  - Use Sui's gas metering to enforce budgets
- **Benefits**: Sustainable scaling, more AI models without bloat
- **Priority**: MEDIUM
- **Complexity**: Medium
- **Timeline**: Phase 1E + Phase 1F

**3.3 Docker-Based Shard Testing**
- **Objective**: Validate sharded performance before deployment
- **Implementation**:
  - Extend current Taskfile.yml automation
  - Create local test environment simulating multiple shards
  - Add performance benchmarks for parallel execution
- **Benefits**: Early detection of bottlenecks
- **Priority**: MEDIUM
- **Complexity**: Low
- **Timeline**: Phase 1G (Testing & Quality)

**Code Reference**: `move/sources/amm/pool.move`, `Taskfile.yml`, `docker/`

---

### 4. Security and Capability Models

#### Percolator's Approach
- Time-limited scoped debit tokens (2-min TTL)
- Anti-replay nonces
- Automatic token expiry
- Isolated access without direct vault mutations
- PDA-like derivation with versioned registries

#### Recommendations for Carapace

**4.1 Scoped Capabilities for AI Interactions**
- **Objective**: Secure off-chain AI access to vault data
- **Implementation**:
  - Replace direct TEE calls with capability-based access
  - Issue TTL-limited tokens for RL optimizer
  - Verify via Sui's zkLogin or object signatures
  - Add replay protection for Walrus-stored models
- **Benefits**: Reduced smart contract risk, better auditability
- **Priority**: CRITICAL
- **Complexity**: Medium
- **Timeline**: Phase 1F (AI/ML Integration)

**4.2 Enhanced Object Derivation**
- **Objective**: Prevent governance exploits and improve security
- **Implementation**:
  - Mirror Percolator's PDA helpers for Sui objects
  - Derive vault escrows as `[b"escrow", user, strategy_id]`
  - Use versioned registries for upgrade safety
  - Add deterministic object ID generation
- **Benefits**: Cleaner architecture, reduced attack surface
- **Priority**: HIGH
- **Complexity**: Low
- **Timeline**: Phase 1A (Contract Completion)

**4.3 Invariant Checks and Assertions**
- **Objective**: Catch bugs early and accelerate audits
- **Implementation**:
  - Add Percolator-style invariant checks to Move contracts
  - Verify scoped debits ≤ escrow limits
  - Check reserve ratios remain within bounds
  - Validate all state transitions
- **Benefits**: Faster pre-mainnet audits, fewer critical issues
- **Priority**: CRITICAL
- **Complexity**: Low
- **Timeline**: Phase 1A + Phase 1G

**Code Reference**: `move/sources/vault/vault.move`, `packages/sdk/`

---

## Implementation Strategy

### Phased Integration

#### Phase 1A-C Enhancements (Weeks 1-6)
- Add fixed-point math library (1.3)
- Integrate enhanced object derivation (4.2)
- Add invariant checks to contracts (4.3)
- Build foundation for capability model (4.1)

#### Phase 1J: Percolator Innovations (Weeks 7-9)
**New dedicated phase for Percolator-inspired features**

**Week 1: Risk & Liquidation**
- Implement fixed-point math utilities
- Add liquidation detection framework
- Design cross-pool netting architecture

**Week 2: MEV Protection**
- Build batch processing for swaps
- Add roundtrip guard framework
- Implement non-replay protection

**Week 3: Testing & Validation**
- Unit tests for new primitives
- Integration tests for batching
- Performance benchmarks for sharding

#### Phase 1F Integration (Weeks 10-13)
- Deploy scoped capabilities for AI (4.1)
- Integrate ARG taxation with RL (2.2)
- Add non-replay protection to TEE (2.3)

#### Phase 2 Scaling (Month 2-3)
- Implement shard architecture (3.1)
- Deploy cross-pool netting (1.1)
- Optimize memory allocation (3.2)
- Full batch processing rollout (2.1)

### Testing Strategy

**Unit Tests** (Phase 1A + 1J)
- Fixed-point math operations
- Capability token generation/validation
- Invariant checks for all operations
- Batch epoch state transitions

**Integration Tests** (Phase 1G + 1J)
- Cross-pool netting scenarios
- Batched swap execution flows
- Liquidation detection triggers
- Sharded pool interactions

**Performance Tests** (Phase 1G + Phase 2)
- Shard scalability benchmarks
- Memory budget enforcement
- Gas cost comparisons (before/after)
- Parallel execution throughput

### Success Metrics

**Risk Management**
- [ ] Zero liquidation cascades in testnet stress tests
- [ ] < 1% position losses during extreme volatility
- [ ] Cross-pool netting reduces margin requirements by 20%+

**MEV Protection**
- [ ] 90%+ reduction in sandwich attack profitability
- [ ] < 0.1% toxic flow ratio (ARG detection)
- [ ] Batch processing adds < 2 second latency

**Scalability**
- [ ] Support 100+ concurrent shards
- [ ] < 10MB state per shard maintained
- [ ] 10x throughput increase with sharding

**Security**
- [ ] Zero capability replay attacks in audit
- [ ] 100% invariant check coverage
- [ ] TTL enforcement for all AI interactions

---

## Technical Debt and Considerations

### Sui-Specific Adaptations

**Shared Objects vs Sharding**
- Sui's shared objects have different contention models than Solana's account locking
- May need hybrid approach: sharded pools for high-volume pairs, shared objects for long-tail

**Move Language Constraints**
- No direct equivalent to Solana's PDAs (adapt with object ID derivation)
- Different memory model (object-based vs account-based)
- Consider using Sui's dynamic fields for extensible state

**Gas Economics**
- Sui's gas model differs significantly from Solana
- Batch processing may have different cost/benefit tradeoffs
- Need to benchmark actual gas savings empirically

### Open Questions

1. **Sharding Granularity**: Per-pair vs per-TVL-tier?
2. **Cross-Shard Routing**: Centralized vs distributed?
3. **Capability Storage**: On-chain vs off-chain with proofs?
4. **Batch Window**: Fixed vs dynamic based on congestion?

### Recommended Research

- [ ] Benchmark Sui shared object contention at scale
- [ ] Prototype capability tokens with zkLogin
- [ ] Test fixed-point math precision requirements
- [ ] Evaluate Percolator's JIT detection on simulated Sui data

---

## Cross-Protocol Collaboration Opportunities

### Open-Source Contributions

**Joint Specification**
- Cross-chain invariants for DeFi primitives
- Standard capability token format
- Shared fixed-point math library

**Code Sharing**
- Port Percolator's fixed-point lib to Move
- Adapt ARG detection logic for AMMs
- Share testing frameworks and benchmarks

### Ecosystem Synergies

**Composability**
- Cross-chain liquidation aggregation (Percolator ↔ Carapace)
- Unified risk dashboard (multi-chain positions)
- Shared oracle infrastructure

**Research Collaboration**
- AI-driven cross-chain arbitrage (TortoiseArb + Percolator)
- MEV protection standards across Solana/Sui
- Liquidity routing optimization

---

## Conclusion

Integrating Percolator's innovations will make Carapace more resilient, efficient, and competitive:

1. **Risk Management**: Cross-pool netting and liquidation detection prevent cascading failures
2. **MEV Protection**: Batching and ARG reduce exploitation, improving LP confidence
3. **Scalability**: Sharding and memory optimization enable sustainable growth
4. **Security**: Capability model and invariants reduce attack surface

**Recommended Priority**: Start with high-priority, low-complexity items (fixed-point math, invariants, object derivation) in Phase 1A, then dedicate Phase 1J to MEV protection and risk management, reserving sharding for Phase 2.

This phased approach balances immediate value delivery with long-term architectural improvements, positioning Carapace as a leader in secure, efficient DeFi infrastructure.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Next Review**: After Phase 1A completion
