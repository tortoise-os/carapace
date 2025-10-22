# Carapace Implementation Checklist

*Customized for TortoiseOS DeFi Protocol - Phase 1-4 Roadmap*

**Last Updated:** October 22, 2025

## Overview

This checklist is tailored to Carapace's phased development, integrating best practices from:
- **Percolator:** Risk management, anti-MEV innovations, batch processing
- **Sui DeFi Projects:** Cetus (CLMM), Navi (lending), Turbos (hybrids), Avocado (basics)
- **Upcoming Launches:** MMT Finance (sharding), EnsoFi (AI agents), Aster (MEV protection)
- **Security Auditors:** OtterSec, SlowMist, Trail of Bits insights

**Structure:**
- **Short-term:** Phase 1 (Core AMM/Vault) - Target: Before Testnet Launch
- **Medium-term:** Phase 2 (Scalability/Arbitrage) - Target: Q1 2026
- **Long-term:** Phase 3-4 (RWA/AI Depth) - Target: Q2-Q3 2026

**Goal:** 80% completion before mainnet launch (Month 6)

**Total Items:** 18 core tasks + 35 sub-tasks = 53 checkboxes

---

## Progress Tracking

### Overall Progress
- **Phase 1 (Short-term):** 0/24 completed (0%)
- **Phase 2 (Medium-term):** 0/17 completed (0%)
- **Phase 3 (Long-term):** 0/12 completed (0%)

### Priority Focus (Top 6 for Phase 1 Launch)
1. [ ] Cross-pool netting in TortoiseVault (Item 1.1)
2. [ ] Batch epochs in swaps (Item 2.1)
3. [ ] Shard pools in TortoiseSwap (Item 3.1)
4. [ ] Formalize invariants (Item 4.1)
5. [ ] Scoped capabilities (Item 4.2)
6. [ ] Code review sprint - Cetus & Navi (Item 5.1)

---

## 1. Risk Management & Liquidation

**Inspired by:** Percolator perpetuals engine + Navi Protocol lending
**Phase:** Short-term (Phase 1E, 1J) + Medium-term extensions
**Related Docs:** [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md), [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md)

### 1.1 Cross-Pool Netting in TortoiseVault
**Priority:** 🔴 CRITICAL (Top 6)
**Timeline:** Phase 1E (Weeks 8-9)
**Reference:** Percolator's global router + Navi's isolated pool architecture

- [ ] **Design global position registry**
  - [ ] Use Sui shared objects for multi-pool exposure tracking
  - [ ] Define `UserPosition` struct with aggregated equity
  - [ ] Document PDA-like derivation for position objects
  - [ ] Compare with Navi's borrow position tracking

- [ ] **Implement pre-compounding margin checks**
  - [ ] Add `verify_margin_ratio()` before vault rebalancing
  - [ ] Calculate net exposure across all strategies
  - [ ] Enforce minimum margin threshold (e.g., 110%)
  - [ ] Test with multi-strategy scenarios (3+ pools)

- [ ] **Integrate with external protocols**
  - [ ] Track positions in Cetus, Turbos, Navi via object IDs
  - [ ] Aggregate external lending/LP positions
  - [ ] Handle cross-protocol liquidation triggers
  - [ ] Prepare for AftermathFi integration (Phase 3)

**Short-term Milestone:**
- [ ] Unit tests covering 95% of liquidation scenarios
- [ ] Integration test: User with positions in 3 pools
- [ ] Gas benchmark: Cross-pool netting <500K gas units
- [ ] Documentation: Architecture diagram for netting logic

### 1.2 Monotone IM Model in TortoiseSwap
**Priority:** 🟠 HIGH
**Timeline:** Phase 1J (Week 7-8)
**Reference:** Percolator's kill-bands + liquidation detection

- [ ] **Implement monotone increasing initial margin**
  - [ ] Add `im_multiplier` to pool configuration
  - [ ] Calculate IM based on position size and volatility
  - [ ] Ensure IM curve is monotone increasing
  - [ ] Port Percolator's IM formula to Move

- [ ] **Trigger partial liquidations on high slippage**
  - [ ] Define slippage threshold (5% baseline)
  - [ ] Implement partial liquidation function
  - [ ] Test with large swap scenarios (>20% of pool reserves)
  - [ ] Add kill-band parameters (no-liquidation zone)

- [ ] **Integrate RL signals for liquidation preemption**
  - [ ] TEE provides liquidation risk score (0-100)
  - [ ] Adjust IM dynamically based on RL predictions
  - [ ] Fallback to static IM if TEE unavailable
  - [ ] Test adversarial scenarios (manipulated RL signals)

**Short-term Milestone:**
- [ ] Formal spec: `spec liquidation::trigger()`
- [ ] External audit by OtterSec on liquidation logic
- [ ] Testnet stress test: 1000 positions with varying IMs
- [ ] Compare liquidation efficiency vs. Navi Protocol

### 1.3 Fixed-Point Math Benchmarking
**Priority:** 🟠 HIGH
**Timeline:** Phase 1A (Week 1-2)
**Reference:** Percolator's 6-decimal precision + Avocado's math lib

- [ ] **Port Percolator's fixed-point library to Move**
  - [ ] Study Percolator's `FixedPoint` implementation (Rust)
  - [ ] Review Avocado DEX's Move math library
  - [ ] Implement 6-decimal fixed-point struct in Move
  - [ ] Support basis point (bps) calculations

- [ ] **Test against Navi's borrow invariants**
  - [ ] Compare precision in interest rate calculations
  - [ ] Validate fee accumulation accuracy
  - [ ] Test edge cases: dust amounts, large values
  - [ ] Benchmark performance: fixed-point vs. scaled u128

- [ ] **Integrate into pool and vault calculations**
  - [ ] Use fixed-point for all fee calculations
  - [ ] Apply to PnL tracking in vault
  - [ ] Ensure consistency across modules
  - [ ] Document precision guarantees

**Short-term Milestone:**
- [ ] Comprehensive unit tests (100% coverage for math module)
- [ ] Property test: No precision loss <0.0001%
- [ ] Integration with pool swap functions
- [ ] Performance benchmark: <5% overhead vs. native math

---

## 2. Anti-Toxicity & MEV Protections

**Inspired by:** Percolator's batch processing + Turbos DEX hybrid execution
**Phase:** Short-term (Phase 1J) + Medium-term (Phase 2 arbitrage)
**Related Docs:** [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md), [SUI_DEFI_COMPETITIVE_LANDSCAPE.md](./SUI_DEFI_COMPETITIVE_LANDSCAPE.md)

### 2.1 Batch Epochs in Swaps
**Priority:** 🔴 CRITICAL (Top 6)
**Timeline:** Phase 1J (Week 8-9)
**Reference:** Percolator's batch auction + Turbos' hybrid model

- [ ] **Implement batch processing architecture**
  - [ ] Define epoch duration (1-2 blocks, ~2-4 seconds)
  - [ ] Create `BatchQueue` struct for pending swaps
  - [ ] Group swaps by token pair
  - [ ] Settlement logic at epoch boundary

- [ ] **AI-driven dynamic batch sizing**
  - [ ] TEE provides optimal batch size based on volatility
  - [ ] Adjust epoch duration dynamically (1-5 blocks)
  - [ ] Longer epochs during high volatility (anti-JIT)
  - [ ] Test with historical Sui market data

- [ ] **Leverage Sui's programmable transaction blocks**
  - [ ] Use PTB for atomic batch settlement
  - [ ] Implement two-phase reserve/commit flow
  - [ ] Ensure all-or-nothing execution
  - [ ] Optimize for parallel execution

**Medium-term Milestone:**
- [ ] Fuzz tests: <2% exploit rate for sandwich attacks
- [ ] Benchmark vs. Aster's sub-second batching
- [ ] Gas analysis: Batch cost < 1.5x individual swaps
- [ ] User latency measurement: Median <3 seconds

### 2.2 Aggressor Roundtrip Guards (ARG) in Vault
**Priority:** 🟠 HIGH
**Timeline:** Phase 1J (Week 8-9)
**Reference:** Percolator's ARG + Turbos' execution model

- [ ] **Implement ring buffer for aggressor tracking**
  - [ ] 10K-entry circular buffer for recent operations
  - [ ] Track deposit-withdraw cycles per user
  - [ ] Identify roundtrips <10 blocks as toxic
  - [ ] Store buffer in vault state (efficient indexing)

- [ ] **RL-tuned dynamic fees on rapid cycles**
  - [ ] TEE calculates aggressor score (0-100)
  - [ ] Apply progressive fee: 0.1% → 1% for repeat offenders
  - [ ] Reward long-term LPs with reduced fees (0.05%)
  - [ ] Test fee effectiveness with backtests

- [ ] **Integrate with vault deposit/withdraw**
  - [ ] Check ARG before processing withdrawal
  - [ ] Apply fee surcharge to toxic flows
  - [ ] Emit event for monitoring
  - [ ] Dashboard for ARG metrics (admin view)

**Short-term Milestone:**
- [ ] Unit tests: ARG detection rate >90%
- [ ] Property test: Long-term LPs never penalized
- [ ] Integration with TortoiseVault (Phase 1E)
- [ ] Comparison study: ARG vs. lockup periods

### 2.3 Non-Replay Nonce Verification
**Priority:** 🟡 MEDIUM
**Timeline:** Phase 1J + 1F (Week 9-11)
**Reference:** Percolator's capability nonces + AI Agent Kit security

- [ ] **Apply nonces to all capabilities**
  - [ ] Add `nonce` field to `AdminCap`, `StrategyToken`
  - [ ] Increment nonce after each capability use
  - [ ] Store used nonces in contract state
  - [ ] Reject duplicate nonce attempts

- [ ] **Test with Playwright for frontend MEV simulations**
  - [ ] Simulate replay attack via browser dev tools
  - [ ] Test concurrent capability use
  - [ ] Verify nonce race condition handling
  - [ ] E2E test: Replay rejected with clear error

- [ ] **Extend to TEE-originated calls**
  - [ ] TEE signs calls with nonce + timestamp
  - [ ] Verify signature on-chain
  - [ ] Enforce nonce uniqueness
  - [ ] Audit trail for all TEE actions

**Short-term Milestone:**
- [ ] Zero replay attacks in security audit
- [ ] Playwright test suite: 100% replay detection
- [ ] Performance impact: <2% overhead
- [ ] Documentation: Nonce management for integrators

---

## 3. Scalability & Efficiency

**Inspired by:** Cetus CLMM tick pricing + MMT Finance sharding + FlowX modularity
**Phase:** Short-term (Phase 1J) + Medium-term (Phase 2 scaling)
**Related Docs:** [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md), [ROADMAP.md](./ROADMAP.md)

### 3.1 Shard Pools in TortoiseSwap
**Priority:** 🔴 CRITICAL (Top 6)
**Timeline:** Phase 1J (Week 7-9)
**Reference:** Cetus tick architecture + MMT's Wormhole sharding + Percolator slabs

- [ ] **Design per-token-pair shard architecture**
  - [ ] Each token pair has dedicated shard object
  - [ ] Shard ID derived from sorted token addresses
  - [ ] Central router maintains shard registry
  - [ ] Study Cetus tick-based sharding patterns

- [ ] **Implement state budget enforcement**
  - [ ] Cap shard state at 10MB (Percolator baseline)
  - [ ] Monitor reserve sizes and LP count
  - [ ] Auto-split shard when nearing limit
  - [ ] Test with TVL growth simulations

- [ ] **Central router for cross-shard swaps**
  - [ ] Router aggregates liquidity across shards
  - [ ] Multi-hop routing for deep liquidity
  - [ ] Optimize for gas efficiency
  - [ ] Compare with Turbos' hybrid orderbook-AMM

- [ ] **Leverage Sui's parallel execution**
  - [ ] Independent shards enable parallel txns
  - [ ] Benchmark: 100+ concurrent swaps
  - [ ] Monitor shared object contention
  - [ ] Prepare for MMT TGE integrations (Oct 30, 2025)

**Short-term Milestone:**
- [ ] Scale tests: 1K TPS on testnet
- [ ] Gas benchmark: Sharded swaps <75% of monolithic pool
- [ ] Cross-shard routing <1.5x single-shard latency
- [ ] Documentation: Sharding architecture diagram

### 3.2 Optimize Vault Allocations
**Priority:** 🟠 HIGH
**Timeline:** Phase 1E + 1J (Week 6-9)
**Reference:** Avocado invariants + FlowX modular liquidity + Percolator allocators

- [ ] **Freelist-based allocation for RL strategies**
  - [ ] Implement freelist allocator in Move (if supported)
  - [ ] Pool strategy slots for reuse
  - [ ] Minimize state growth per allocation
  - [ ] Benchmark vs. naive allocation

- [ ] **Enforce O(1) operations in Move**
  - [ ] Use `Table` for constant-time lookups
  - [ ] Avoid linear scans in hot paths
  - [ ] Precompute aggregates (e.g., total TVL)
  - [ ] Gas profiling: All vault ops <200K gas

- [ ] **Integrate with FlowX modular liquidity**
  - [ ] Study FlowX SDK for adaptive pools
  - [ ] Prototype strategy composition
  - [ ] Test multi-strategy allocation efficiency
  - [ ] Prepare for FlowX partnership (Jan 2026)

**Short-term Milestone:**
- [ ] Gas reduction: 50% vs. initial implementation
- [ ] Memory footprint: <1KB per strategy
- [ ] O(1) complexity verified for all public functions
- [ ] Integration test: 10 concurrent strategies

### 3.3 Docker-ized Sharded Testing
**Priority:** 🟡 MEDIUM
**Timeline:** Phase 1J (Week 9)
**Reference:** Taskfile.yml extensions + Sui local network

- [ ] **Extend Taskfile.yml for parallel Sui sims**
  - [ ] Add `task shard:test` command
  - [ ] Spin up multiple Sui nodes in Docker
  - [ ] Simulate multi-shard deployment
  - [ ] Collect metrics: TPS, latency, gas

- [ ] **Monitor gas usage**
  - [ ] Target: <50% of current monolithic gas
  - [ ] Track gas per shard vs. aggregated
  - [ ] Identify gas optimization opportunities
  - [ ] Alert if gas exceeds threshold

- [ ] **Stress testing framework**
  - [ ] Generate 1K+ concurrent transactions
  - [ ] Random user operations (swap, add/remove liquidity)
  - [ ] Monitor shard load balancing
  - [ ] Automated test runs in CI/CD

**Short-term Milestone:**
- [ ] CI/CD pipeline: Automated shard testing on PRs
- [ ] Performance report: Gas, TPS, latency metrics
- [ ] Load test: 5K TPS sustained for 5 minutes
- [ ] Documentation: Docker setup for local testing

---

## 4. Security & Auditing

**Inspired by:** Trail of Bits (hot potatoes) + SlowMist (oracle checks) + OtterSec (Sui Move expertise)
**Phase:** Short-term (Phase 1G, 1K) + Long-term (ongoing)
**Related Docs:** [SECURITY_AUDIT_GUIDE.md](./SECURITY_AUDIT_GUIDE.md), [AUDIT_PREPARATION_CHECKLIST.md](./AUDIT_PREPARATION_CHECKLIST.md)

### 4.1 Formalize Invariants
**Priority:** 🔴 CRITICAL (Top 6)
**Timeline:** Phase 1A-G (Ongoing)
**Reference:** Trail of Bits formal verification + Avocado math invariants

- [ ] **Pool balance invariants**
  - [ ] Constant product: `reserve_x * reserve_y >= k_last`
  - [ ] Fee accumulation: `fees >= 0` and monotone increasing
  - [ ] LP token supply: `sum(user_balances) == total_supply`
  - [ ] Test invariants after every operation

- [ ] **Vault solvency invariants**
  - [ ] Total shares value: `shares * price <= assets`
  - [ ] Strategy allocation: `sum(allocations) == 100%`
  - [ ] No negative balances
  - [ ] Test with multi-strategy scenarios

- [ ] **TEE RL input invariants**
  - [ ] Fee bounds: `0.01% <= dynamic_fee <= 1%`
  - [ ] Model hash: Matches Walrus-stored version
  - [ ] Nonce: Never reused
  - [ ] Timestamp: Within acceptable skew (<30s)

- [ ] **Move Registry integration**
  - [ ] Register all packages on-chain
  - [ ] Enable auto-upgrade checks
  - [ ] Monitor dependency vulnerabilities
  - [ ] CI/CD: Verify registry on every PR

**Short-term Milestone:**
- [ ] 100% invariant check coverage in critical modules
- [ ] Move Prover passing for all formal specs
- [ ] Zero invariant violations in testnet
- [ ] Audit verification: OtterSec sign-off on invariants

### 4.2 Scoped Capabilities
**Priority:** 🔴 CRITICAL (Top 6)
**Timeline:** Phase 1A + 1F + 1J (Week 2-11)
**Reference:** Percolator debit tokens + AI Agent Kit capability systems

- [ ] **TTL-limited tokens for AI access**
  - [ ] Add `expiry: u64` to all capability structs
  - [ ] Verify expiry in all capability checks
  - [ ] Rotate capabilities every 90 days (automated)
  - [ ] Test expired capability rejection

- [ ] **Emergency pause mechanism**
  - [ ] Admin capability can pause all operations
  - [ ] Multi-sig requirement for pause (3-of-5)
  - [ ] Test pause/unpause flow monthly
  - [ ] Document emergency procedures

- [ ] **Multi-sig governance**
  - [ ] 3-of-5 multi-sig for critical operations
  - [ ] Operations >5% TVL require multi-sig
  - [ ] Geographic distribution of signers
  - [ ] Hardware wallet enforcement

- [ ] **Capability action allowlists**
  - [ ] Define allowed actions per capability type
  - [ ] Enforce allowlist in contract
  - [ ] Test unauthorized action rejection
  - [ ] Audit trail for all capability uses

**Short-term Milestone:**
- [ ] Zero capability bypass in security audit
- [ ] Multi-sig tested in production-like environment
- [ ] Emergency drill: <15 minutes to pause
- [ ] SlowMist verification of capability scoping

### 4.3 Phased Audits
**Priority:** 🟠 HIGH
**Timeline:** Phase 1K (Month 5)
**Reference:** Nansen audit guide + Cetus/MMT audit reports

- [ ] **Unit testing phase**
  - [ ] >85% code coverage across all modules
  - [ ] Property-based tests for invariants
  - [ ] Boundary testing (dust, max values)
  - [ ] Automated test runs in CI

- [ ] **Integration testing phase**
  - [ ] E2E scenarios: Swap, liquidity, vault flows
  - [ ] Multi-user stress tests
  - [ ] Oracle failure simulations
  - [ ] TEE integration testing

- [ ] **Fuzzing phase**
  - [ ] 1M+ iterations with random inputs
  - [ ] Randomized transaction orderings
  - [ ] Malicious behavior simulations
  - [ ] Document all crashes and fixes

- [ ] **External audit engagement**
  - [ ] Engage OtterSec ($80-120K budget)
  - [ ] Provide comprehensive audit package
  - [ ] Daily coordination during audit
  - [ ] Address all critical/high findings

- [ ] **Bug bounty launch**
  - [ ] Platform: Hacken or Immunefi
  - [ ] Reserve: $200K in USDC/USDT
  - [ ] Tiered rewards: Critical ($50K), High ($20K), Medium ($5K)
  - [ ] 2-week testnet bounty before mainnet

**Long-term Milestone:**
- [ ] 2-3 full audits by Q1 2026
- [ ] Zero critical findings in mainnet audit
- [ ] Active bug bounty with community participation
- [ ] Integration of EnsoFi's AI agents for vault risk simulation (Phase 3)

---

## 5. Learning & Integration

**Inspired by:** Sui DeFi ecosystem + upcoming project launches
**Phase:** Short-term (immediate) + Medium-term (partnerships) + Long-term (ecosystem leadership)
**Related Docs:** [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md), [SUI_DEFI_COMPETITIVE_LANDSCAPE.md](./SUI_DEFI_COMPETITIVE_LANDSCAPE.md)

### 5.1 Code Review Sprint
**Priority:** 🔴 CRITICAL (Top 6)
**Timeline:** Weeks 1-11 (parallel with development)
**Reference:** Repository Study Schedule in ROADMAP.md

- [ ] **Week 1: Avocado DEX (Reference Implementation)**
  - [ ] Clone repository and build locally
  - [ ] Study constant product implementation
  - [ ] Audit fixed-point math library
  - [ ] Compare pool design with Carapace
  - [ ] Port relevant patterns

- [ ] **Week 2: Cetus CLMM (Advanced AMM)**
  - [ ] Study tick-based liquidity architecture
  - [ ] Analyze flash swap implementation
  - [ ] Review SDK transaction builder patterns
  - [ ] Study TWAP oracle implementation
  - [ ] Benchmark gas costs vs. Carapace

- [ ] **Week 5-6: Navi Protocol (Lending)**
  - [ ] Deep dive into isolated pool risk management
  - [ ] Study interest rate models
  - [ ] Analyze liquidation health factor calculations
  - [ ] Review multi-oracle aggregation strategy
  - [ ] Document patterns for TortoiseVault

- [ ] **Week 7: Turbos Finance (Hybrid DEX)**
  - [ ] Study sharded pool implementation
  - [ ] Review batch settlement patterns
  - [ ] Analyze gas optimization techniques
  - [ ] Benchmark hybrid orderbook-AMM model
  - [ ] Document sharding lessons

- [ ] **Week 10-11: Sui-AI-Agent-Kit (AI Integration)**
  - [ ] Explore MCP tool architecture
  - [ ] Study capability-based access patterns
  - [ ] Analyze Walrus Storage integration
  - [ ] Test Nautilus TEE setup
  - [ ] Compare with Percolator research

**Short-term Milestone:**
- [ ] 1 repo analyzed per week (5 total)
- [ ] Documentation: Key learnings from each repo
- [ ] PRs to Carapace integrating patterns
- [ ] Blog post: "Building on Sui DeFi Giants"

### 5.2 Cross-Project Composability
**Priority:** 🟡 MEDIUM
**Timeline:** Phase 1L (Q4 2025 - Q1 2026)
**Reference:** Competitor launches + partnership opportunities

- [ ] **MMT Finance integration (Launch: Oct 30, 2025)**
  - [ ] Study gasless swap mechanism post-launch
  - [ ] Prototype hook for MMT liquidity routing
  - [ ] Test cross-protocol swap (Carapace → MMT)
  - [ ] Explore ve(3,3) tokenomics for SHELL governance

- [ ] **EnsoFi integration (Launched: Oct 22, 2025)**
  - [ ] Attend EnsoFi community calls
  - [ ] Prototype EDAS agent for TortoiseVault rebalancing
  - [ ] Test lending market as collateral source
  - [ ] Compare AI agent approach vs. Carapace's TEE-RL

- [ ] **Aster integration (Launch: Q4 2025)**
  - [ ] Review MEV protection code post-launch
  - [ ] Test perpetual market access via Aster
  - [ ] Benchmark execution speed vs. TortoiseSwap
  - [ ] Study Hyperliquid integration patterns

- [ ] **FlowX Finance integration (Upgrades: Jan 2026)**
  - [ ] Evaluate FlowX SDK for TortoiseSwap
  - [ ] Analyze adaptive pool algorithms
  - [ ] Explore partnership for oracle data feeds
  - [ ] Test modular liquidity layer integration

- [ ] **AftermathFi integration (V2: Q1 2026)**
  - [ ] Benchmark vault performance vs. TortoiseVault
  - [ ] Study RWA integration approach
  - [ ] Identify collaboration opportunities
  - [ ] Analyze yield optimization strategies

**Medium-term Milestone:**
- [ ] Prototype hooks for 3+ future projects
- [ ] 2 pilot integrations by Jan 2026
- [ ] Technical partnership with at least 1 major protocol
- [ ] Joint liquidity mining program (if applicable)

### 5.3 Community Alignment
**Priority:** 🟡 MEDIUM
**Timeline:** Ongoing
**Reference:** Sui Foundation ecosystem + community engagement

- [ ] **Sui Basecamp 2025 (Dubai)**
  - [ ] Register for event
  - [ ] Prepare Carapace presentation/demo
  - [ ] Network with MMT, EnsoFi, Aster, FlowX, AftermathFi teams
  - [ ] Attend technical workshops

- [ ] **Contribute joint specifications**
  - [ ] Propose sharding invariants standard (with Turbos, MMT)
  - [ ] Collaborate on oracle aggregation best practices (with Navi, FlowX)
  - [ ] Contribute to Sui Security Working Group
  - [ ] Share RL-driven DeFi research

- [ ] **Open-source contributions**
  - [ ] PRs to Cetus SDK for improved patterns
  - [ ] Documentation improvements to Navi Protocol
  - [ ] Bug reports to AI Agent Kit (if found)
  - [ ] Share testing frameworks with community

**Long-term Milestone:**
- [ ] Carapace recognized as ecosystem leader
- [ ] 3+ PRs merged to major Sui DeFi projects
- [ ] Speaking slot at Sui conference
- [ ] Co-author Sui DeFi best practices document

---

## Phase-Specific Priorities

### Phase 1: Core AMM/Vault (Before Testnet)
**Target Completion:** 80% of Short-term items

**Must Complete (Top 6):**
1. ✅ Cross-pool netting (1.1)
2. ✅ Batch epochs (2.1)
3. ✅ Shard pools (3.1)
4. ✅ Formalize invariants (4.1)
5. ✅ Scoped capabilities (4.2)
6. ✅ Code review sprint (5.1)

**Should Complete:**
- Fixed-point math (1.3)
- ARG in vault (2.2)
- Optimize vault allocations (3.2)
- Phased audits - Unit/Integration (4.3)

**Nice to Have:**
- Non-replay nonces (2.3)
- Docker-ized testing (3.3)

### Phase 2: Scalability/Arbitrage (Q1 2026)
**Target Completion:** 80% of Medium-term items

**Focus Areas:**
- Full sharding deployment (3.1 production)
- Cross-project integrations (5.2)
- Advanced MEV protection (2.1 optimization)
- External audits complete (4.3)

### Phase 3-4: RWA/AI Depth (Q2-Q3 2026)
**Target Completion:** 100% of Long-term items

**Focus Areas:**
- EnsoFi AI agent integration (4.3, 5.2)
- AftermathFi RWA collaboration (1.1, 5.2)
- Ecosystem leadership (5.3)
- Continuous security (4.3 ongoing)

---

## Testing Automation with Bun Test

### Setup
```bash
# Install dependencies
bun install

# Run all tests
bun test

# Run specific test suites
bun test:unit        # Unit tests
bun test:integration # Integration tests
bun test:e2e         # End-to-end tests (Playwright)

# Coverage report
bun test --coverage
```

### Weekly Review Automation
```bash
# Generate checklist progress report
bun run scripts/checklist-progress.ts

# Output: Progress percentage per phase
# Alerts: Overdue items, blockers
```

### Key Test Metrics
- **Code Coverage:** >85% (target 90% for critical modules)
- **Invariant Tests:** 100% passing
- **E2E Tests:** 100% passing (7 currently, grow to 25+)
- **Fuzzing:** 1M+ iterations, 0 crashes

---

## Dependencies & Blockers

### External Dependencies
- **Sui Mainnet Features:** Sharding requires Mysticeti consensus optimizations
- **Oracle Availability:** Pyth, Switchboard, Supra on Sui
- **TEE Infrastructure:** Nautilus TEE production-ready
- **Walrus Storage:** Stable epochs and blob retrieval

### Internal Dependencies
- **Fixed-point Math (1.3)** → Blocks pool implementation (1.1, 3.1)
- **Capability System (4.2)** → Blocks TEE integration (1.2, 2.2)
- **Code Review Sprint (5.1)** → Informs all implementations
- **Invariants (4.1)** → Required for audit (4.3)

### Risk Mitigation
- **Parallel Development:** Work on independent items concurrently
- **Fallback Plans:** Static fees if RL/TEE delayed
- **Incremental Rollout:** Launch without sharding, add later
- **External Support:** Engage Sui Foundation for blockers

---

## Progress Tracking Guidelines

### Weekly Review (Every Monday)
1. Update checklist completion status
2. Identify blockers and assign owners
3. Adjust priorities based on Phase progress
4. Review dependencies for upcoming week

### Monthly Review (Last Friday of Month)
1. Calculate phase completion percentages
2. Review against roadmap milestones
3. Adjust timeline if needed
4. Report to stakeholders

### Reporting Format
```markdown
## Week X Progress Report

**Phase 1 Completion:** 45% (11/24 items)
**Top 6 Priority:** 4/6 complete

**Completed This Week:**
- [x] Cross-pool netting design (1.1)
- [x] Fixed-point math library ported (1.3)

**In Progress:**
- [ ] Batch epoch implementation (2.1) - 60% done
- [ ] Code review: Cetus CLMM (5.1) - Day 3/5

**Blockers:**
- TEE testnet environment not available (blocks 1.2)
- Awaiting OtterSec quote (blocks 4.3)

**Next Week Focus:**
- Complete batch epoch implementation
- Finalize Cetus code review
- Start invariant formalization
```

---

## Export Options

### Markdown Export
This document is already in Markdown format for easy version control and collaboration.

### Excel/CSV Export
```bash
# Generate Excel workbook with checklist
bun run scripts/export-checklist.ts --format excel

# Output: IMPLEMENTATION_CHECKLIST.xlsx
# Sheets: Phase1, Phase2, Phase3, Summary
```

### Project Management Integration
- **GitHub Projects:** Import as issues with labels (Phase1, Priority:High, etc.)
- **Jira:** Bulk create tickets with custom fields
- **Notion:** Sync with database view

---

## Item Expansions (On Request)

For detailed implementation guidance on any specific item, request:
- **Technical Specifications:** Detailed design docs
- **Code Examples:** Move contract snippets
- **Test Scenarios:** Comprehensive test cases
- **Integration Guides:** Step-by-step integration instructions

Example:
> "Expand Item 2.1 (Batch Epochs) with code examples and test scenarios"

Will provide:
- Detailed architecture diagram
- Move contract code for `BatchQueue`
- Test cases for batch settlement
- Integration guide for frontend

---

## Continuous Improvement

This checklist is a living document:
- **Update after code reviews:** Incorporate learnings from Sui DeFi repos
- **Update after competitor launches:** Adjust based on MMT, EnsoFi, etc.
- **Update after audits:** Add findings as new checklist items
- **Update after mainnet:** Refine based on production experience

**Review Cadence:**
- Weekly: Progress updates
- Monthly: Priority adjustments
- Quarterly: Strategic alignment with roadmap

**Feedback:** Open issues or PRs to suggest improvements to this checklist.

---

**Last Review Date:** October 22, 2025
**Next Review Date:** October 29, 2025 (Weekly)
**Target Mainnet Readiness:** Month 6 (80% completion)

---

*For expansions, clarifications, or export requests, contact the Carapace core team.*
