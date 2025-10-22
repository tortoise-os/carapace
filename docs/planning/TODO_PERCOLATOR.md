# Percolator Integration TODO Checklist

> Quick reference for implementing Percolator-inspired enhancements in Carapace
> See [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md) for detailed rationale and [ROADMAP.md](./ROADMAP.md) for full timeline

## Priority Legend
- 🔴 CRITICAL - Required for security/functionality
- 🟠 HIGH - Significant value, should implement
- 🟡 MEDIUM - Nice to have, can defer if needed
- 🟢 LOW - Future optimization

## Phase 1A-C: Foundation (Weeks 1-6)

### Fixed-Point Math Library 🔴
- [ ] Port Percolator's 6-decimal fixed-point library to Sui Move
- [ ] Add to `move/sources/math/fixed_point.move`
- [ ] Implement basic operations: add, sub, mul, div
- [ ] Add conversion functions (u64 ↔ fixed-point)
- [ ] Unit tests for edge cases (overflow, underflow, precision)
- [ ] Integration with fee calculations in `pool.move`
- [ ] Integration with PnL tracking in `vault.move`

**Files to modify:**
- `move/sources/math/fixed_point.move` (new)
- `move/sources/amm/pool.move`
- `move/sources/vault/vault.move`

### Enhanced Object Derivation 🟠
- [ ] Create object derivation helpers in `move/sources/utils/object_helpers.move`
- [ ] Implement deterministic ID generation: `derive_escrow_id(user, strategy_id)`
- [ ] Add versioned registry pattern for upgrades
- [ ] Document patterns in code comments
- [ ] Unit tests for derivation consistency

**Files to create/modify:**
- `move/sources/utils/object_helpers.move` (new)
- `move/sources/vault/vault.move`

### Basic Invariant Checks 🔴
- [ ] Add invariant module to `move/sources/utils/invariants.move`
- [ ] Pool invariants: `reserve_x * reserve_y >= k` (with tolerance)
- [ ] Vault invariants: `total_shares * share_price >= total_assets`
- [ ] Escrow invariants: `scoped_debits <= escrow_balance`
- [ ] Add assertions to all state-changing functions
- [ ] Unit tests for invariant violations

**Files to create/modify:**
- `move/sources/utils/invariants.move` (new)
- `move/sources/amm/pool.move`
- `move/sources/vault/vault.move`

---

## Phase 1J Week 1: Risk & Liquidation (Weeks 7-8)

### Liquidation Detection Framework 🟠
- [ ] Design liquidation parameters in pool config
- [ ] Add `initial_margin` and `maintenance_margin` to pool struct
- [ ] Implement `kill_band` parameters
- [ ] Create `check_liquidation_threshold()` function
- [ ] Add liquidation event emission
- [ ] Design off-chain RL integration for prediction (stub for now)
- [ ] Unit tests for liquidation triggers

**Files to modify:**
- `move/sources/amm/pool.move`
- `move/sources/amm/types.move`

### Cross-Pool Netting Architecture (Design) 🟡
- [ ] Design global position registry structure
- [ ] Sketch shared object model for multi-pool tracking
- [ ] Document user exposure aggregation logic
- [ ] Create architecture diagram
- [ ] List integration points with vault rebalancing
- [ ] Define pre-compound margin check API

**Deliverable:** Design document (can be in `docs/architecture/cross_pool_netting.md`)

---

## Phase 1J Week 2: MEV Protection (Weeks 8-9)

### Batch Processing for Swaps 🟠
- [ ] Add `batch_epoch` field to pool config
- [ ] Implement batch state machine: COLLECTING → SETTLING → COLLECTING
- [ ] Create `reserve_swap()` function (phase 1: reserve)
- [ ] Create `commit_swap()` function (phase 2: execute)
- [ ] Add batch epoch timer (block-based)
- [ ] Group liquidity operations in batch
- [ ] Leverage Sui's programmable transaction blocks
- [ ] Unit tests for batch transitions

**Files to modify:**
- `move/sources/amm/pool.move`
- `move/sources/amm/batch.move` (new module)
- `packages/sdk/src/transactions/swap.ts`

### Non-Replay Protection 🔴
- [ ] Add `nonce` field to capability struct
- [ ] Implement nonce generation and validation
- [ ] Add `used_nonces` tracking (Set or Table)
- [ ] Integrate with existing capability system
- [ ] Add nonce to off-chain AI calls (TEE integration stub)
- [ ] Unit tests for replay attack prevention

**Files to modify:**
- `move/sources/vault/capabilities.move` (new)
- `move/sources/vault/vault.move`

### ARG (Aggressor Roundtrip Guard) Framework 🟡
- [ ] Create ring buffer for tracking deposits/withdrawals
- [ ] Add `deposit_history` table (10K entries max, circular)
- [ ] Implement roundtrip detection: deposit → withdraw < threshold time
- [ ] Create dynamic fee calculation based on aggressor score
- [ ] Integration stub for RL-based fee adjustment (Phase 1F)
- [ ] Unit tests for aggressor detection

**Files to create/modify:**
- `move/sources/vault/arg.move` (new)
- `move/sources/vault/vault.move`

---

## Phase 1J Week 3: Testing & Validation (Week 9)

### Comprehensive Testing 🔴
- [ ] Unit tests for all new Move modules (>90% coverage)
- [ ] Integration test: Fixed-point math in fee calculations
- [ ] Integration test: Batch processing end-to-end
- [ ] Integration test: Non-replay protection
- [ ] Performance benchmark: Batch processing latency
- [ ] Performance benchmark: Fixed-point vs native math
- [ ] Stress test: Liquidation detection under load

**Test files to create:**
- `move/tests/fixed_point_tests.move`
- `move/tests/batch_tests.move`
- `move/tests/arg_tests.move`
- `move/tests/invariants_tests.move`

### Sharding Architecture Design 🟡
- [ ] Research Sui shared object contention patterns
- [ ] Design per-token-pair shard architecture
- [ ] Sketch central router for cross-shard swaps
- [ ] Dynamic sharding algorithm (TVL/volume-based)
- [ ] Document Sui parallel execution integration
- [ ] Create POC in local environment (docker)

**Deliverable:** Architecture document (`docs/architecture/sharding.md`)

---

## Phase 1F Integration: AI + Security (Weeks 10-13)

### Scoped Capabilities for AI 🔴
- [ ] Design capability token struct with TTL
- [ ] Implement `issue_capability(scope, ttl)` function
- [ ] Add automatic expiry checking
- [ ] Integrate with Sui's zkLogin (optional, can defer)
- [ ] Replace direct TEE calls with capability-based access
- [ ] Add capability verification in vault functions
- [ ] Unit tests for TTL expiry

**Files to create/modify:**
- `move/sources/vault/capabilities.move`
- `move/sources/vault/vault.move`
- `packages/sdk/src/ai/capabilities.ts` (new)

### RL Integration with ARG 🟡
- [ ] Extend ARG module to accept RL signals
- [ ] Design off-chain RL model API for fee optimization
- [ ] Add Walrus Storage integration for model weights
- [ ] Implement dynamic fee adjustment in `vault.move`
- [ ] Test with mock RL signals

**Files to modify:**
- `move/sources/vault/arg.move`
- `apps/api/src/services/rl-optimizer.ts` (new)

---

## Phase 1G: Testing & Quality (Weeks 11-13)

### Invariant Testing 🔴
- [ ] Expand invariant checks based on Phase 1J implementations
- [ ] Add formal verification annotations (if using Move Prover)
- [ ] Integration with audit preparation
- [ ] Fuzz testing for invariant violations
- [ ] Document all invariants in `docs/invariants.md`

### Performance Benchmarks 🟠
- [ ] Benchmark batch processing latency vs direct execution
- [ ] Benchmark fixed-point math vs native operations
- [ ] Memory usage benchmarks (state growth)
- [ ] Gas cost comparisons (before/after batching)
- [ ] Throughput tests with multiple concurrent users

---

## Phase 2: Scaling Deployment (Month 6+)

### Full Sharding Implementation 🟡
- [ ] Implement shard creation logic
- [ ] Build central router contract
- [ ] Cross-shard swap execution
- [ ] Shard rebalancing based on TVL
- [ ] Monitoring and metrics for shards

### Cross-Pool Netting Production 🟡
- [ ] Implement global position registry (shared object)
- [ ] Track user exposures across pools
- [ ] Pre-compound margin checks
- [ ] Integration with vault rebalancing
- [ ] Liquidation prevention logic

### Memory Optimization 🟡
- [ ] Implement freelist-based allocators
- [ ] Cap state growth mechanisms
- [ ] Gas budget enforcement (10MB/shard target)
- [ ] State pruning strategies

---

## Quick Wins (Start This Week!)

### Week 1 Quick Wins
1. 🔴 Create `move/sources/math/fixed_point.move` skeleton
2. 🔴 Add basic invariant checks to existing pool functions
3. 🟠 Implement simple object ID derivation helper
4. 🟢 Document Percolator research findings (done! ✅)

### Week 2 Quick Wins
1. 🔴 Complete fixed-point math unit tests
2. 🟠 Add nonce field to capability struct
3. 🟡 Design batch processing state machine

---

## Open Questions & Research Needed

- [ ] **Sharding Granularity**: Per-pair vs per-TVL-tier? (Research needed)
- [ ] **Cross-Shard Routing**: Centralized vs distributed? (Prototype both)
- [ ] **Capability Storage**: On-chain vs off-chain with proofs? (Benchmark costs)
- [ ] **Batch Window**: Fixed (2 blocks) vs dynamic? (Test both)
- [ ] **Sui Contention**: Benchmark shared object contention at scale
- [ ] **zkLogin Integration**: Feasibility for capability verification?

---

## Resources & References

### Percolator Codebase
- Repository: `decebal/percolator`
- Key files to reference:
  - Fixed-point math: `programs/percolator/src/math.rs`
  - Capability system: `programs/percolator/src/capability.rs`
  - Slab architecture: `programs/percolator/src/slab.rs`

### Sui Documentation
- [Move Language Guide](https://move-language.github.io/move/)
- [Sui Object Model](https://docs.sui.io/concepts/object-ownership)
- [Programmable Transaction Blocks](https://docs.sui.io/concepts/transactions/programmable-transaction-blocks)
- [zkLogin](https://docs.sui.io/concepts/cryptography/zklogin)

### Internal Documentation
- [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md) - Full analysis
- [ROADMAP.md](./ROADMAP.md) - Complete roadmap with timelines
- `docs/architecture/` - Architecture diagrams (to be created)

---

## Success Criteria (from Roadmap)

### Phase 1J KPIs
- ✅ Zero liquidation cascades in testnet stress tests
- ✅ < 1% position losses during extreme volatility
- ✅ 90%+ reduction in sandwich attack profitability
- ✅ < 2 second latency added by batching
- ✅ Zero capability replay attacks in audit
- ✅ 100% invariant check coverage

---

## Notes

- **Prioritize security over features**: Invariants, capabilities, non-replay first
- **Test incrementally**: Don't wait for full implementation to start testing
- **Document as you go**: Code comments, architecture docs, decision logs
- **Benchmarks are critical**: Sui's gas model differs from Solana, validate assumptions
- **Defer sharding to Phase 2**: Focus on correctness and security in Phase 1J

---

**Last Updated**: 2025-10-22
**Status**: Active Development
**Next Review**: After Phase 1A completion (Week 2)
