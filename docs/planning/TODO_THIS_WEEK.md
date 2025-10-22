# Carapace: This Week's Action Items

> Week 1 priorities combining Percolator research and Sui DeFi reference studies
> Generated: 2025-10-22

## Overview

This week focuses on **foundational code review and math library integration**. We're starting Phase 1A with parallel study of production Sui DeFi implementations while laying groundwork for Phase 1J (Percolator enhancements).

---

## Priority Tasks (This Week)

### 1. 🔴 CRITICAL: Clone All Reference Repositories

**Goal**: Set up local research environment with all 5 Sui DeFi repos

**Steps**:
```bash
# Create research directory
mkdir -p research/sui-defi
cd research/sui-defi

# Clone all repositories
git clone https://github.com/avocadodefi/sc-dex avocado-dex
git clone https://github.com/CetusProtocol/cetus-clmm cetus
git clone https://github.com/naviprotocol/navi-lending navi
git clone https://github.com/turbos-finance/turbos turbos
git clone https://github.com/caterpillardev/Sui-AI-Agent-Kit ai-agent-kit

# Build and test each (example for Avocado)
cd avocado-dex
sui move build
sui move test
```

**Deliverables**:
- [ ] All 5 repos cloned and built successfully
- [ ] All tests passing locally
- [ ] Document any build issues in `research/SETUP_NOTES.md`

**Time**: 4-6 hours (Monday-Tuesday morning)

---

### 2. 🔴 CRITICAL: Deep Dive into Avocado DEX Math

**Goal**: Audit Avocado's constant product implementation as reference for Carapace

**Files to Review** (in `avocado-dex/`):
- `sources/swap.move` - Core swap logic
- `sources/router.move` - Multi-hop routing
- `sources/math.move` or similar - Fixed-point math utilities

**Analysis Tasks**:
- [ ] Understand constant product formula implementation (x * y = k)
- [ ] Review LP token share calculation
- [ ] Study slippage protection mechanisms
- [ ] Analyze fixed-point decimal handling
- [ ] Check for edge cases (zero amounts, overflow protection)
- [ ] Compare with Carapace's `move/sources/amm/pool.move` (currently incomplete)

**Deliverables**:
- [ ] Annotated code review notes in `research/avocado_analysis.md`
- [ ] List of differences/improvements for Carapace
- [ ] Identified bugs or edge cases in current Carapace implementation

**Time**: 8 hours (Tuesday afternoon + Wednesday)

---

### 3. 🔴 CRITICAL: Port Fixed-Point Math Library

**Goal**: Extract and adapt Avocado's fixed-point math to Carapace (Phase 1J requirement)

**Source**: `avocado-dex/sources/math.move` (or equivalent)
**Target**: `move/sources/math/fixed_point.move` (new file)

**Implementation Checklist**:
- [ ] Create `move/sources/math/fixed_point.move`
- [ ] Implement core operations:
  - [ ] `to_fixed(u64) -> FixedPoint`
  - [ ] `from_fixed(FixedPoint) -> u64`
  - [ ] `mul(FixedPoint, FixedPoint) -> FixedPoint`
  - [ ] `div(FixedPoint, FixedPoint) -> FixedPoint`
  - [ ] `add(FixedPoint, FixedPoint) -> FixedPoint`
  - [ ] `sub(FixedPoint, FixedPoint) -> FixedPoint`
- [ ] Add safety checks (overflow, underflow, division by zero)
- [ ] Set precision (recommend 6 decimals to match Percolator)
- [ ] Write unit tests in `move/tests/fixed_point_tests.move`

**Integration Points**:
- `move/sources/amm/pool.move` - Fee calculations
- `move/sources/vault/vault.move` - Share price calculations

**Deliverables**:
- [ ] Complete `fixed_point.move` module
- [ ] 100% test coverage for math operations
- [ ] Integration plan documented in code comments

**Time**: 6-8 hours (Thursday-Friday)

**Code Reference**: See [TODO_PERCOLATOR.md](./TODO_PERCOLATOR.md) Section "Fixed-Point Math Library"

---

### 4. 🟠 HIGH: Complete AMM pool.move Swap Functions

**Goal**: Finalize swap logic with audited math from Avocado reference

**File**: `move/sources/amm/pool.move`

**Functions to Complete**:
- [ ] `swap_x_to_y(pool, amount_in, min_amount_out)`
  - Use constant product formula: `amount_out = (reserve_y * amount_in) / (reserve_x + amount_in)`
  - Apply fee deduction (use fixed-point math from Task #3)
  - Slippage check: `assert!(amount_out >= min_amount_out)`
- [ ] `swap_y_to_x(pool, amount_in, min_amount_out)` (symmetric)
- [ ] `get_amount_out(reserve_in, reserve_out, amount_in, fee)` - Pure calculation
- [ ] Emit swap events

**Audit Against Avocado**:
- [ ] Formula matches Avocado's implementation
- [ ] Fee calculation is consistent
- [ ] Overflow protection in place
- [ ] Edge cases handled (zero amounts, etc.)

**Deliverables**:
- [ ] Complete swap functions in `pool.move`
- [ ] Unit tests in `move/tests/pool_tests.move`
- [ ] Gas benchmarks documented

**Time**: 4-6 hours (Friday)

---

### 5. 🟠 HIGH: Implement Enhanced Object Derivation

**Goal**: Add deterministic object ID generation (Phase 1J + Avocado pattern)

**File**: `move/sources/utils/object_helpers.move` (new)

**Functions to Implement**:
```move
// Derive escrow object ID
public fun derive_escrow_id(user: address, strategy_id: u64): ID {
    // Pattern: hash(b"escrow" || user || strategy_id)
}

// Derive pool object ID
public fun derive_pool_id(token_x: TypeName, token_y: TypeName): ID {
    // Pattern: hash(b"pool" || sorted(token_x, token_y))
}
```

**Integration**:
- [ ] Use in `vault.move` for escrow creation
- [ ] Use in `pool.move` factory pattern (Phase 1C prep)
- [ ] Add versioning support for upgrades

**Deliverables**:
- [ ] `object_helpers.move` module
- [ ] Unit tests for derivation consistency
- [ ] Documentation in code comments

**Time**: 3-4 hours (Friday afternoon)

**Code Reference**: See [TODO_PERCOLATOR.md](./TODO_PERCOLATOR.md) Section "Enhanced Object Derivation"

---

## Stretch Goals (If Time Permits)

### 6. 🟡 MEDIUM: Study Cetus Flash Swap Implementation

**Goal**: Prepare for Week 2 deep dive into Cetus

**Files to Preview** (in `cetus/`):
- `sources/pool.move` - Flash swap entry points
- `sources/flash_swap.move` (if separate)

**Tasks**:
- [ ] Understand flash swap flow (borrow → callback → repay)
- [ ] Identify differences from Avocado (if Avocado has flash swaps)
- [ ] Document pattern for Carapace integration

**Time**: 2-3 hours (if Friday finishes early)

---

## Documentation Tasks

### Code Review Notes
- [ ] Create `research/avocado_analysis.md`
- [ ] Document math audit findings
- [ ] List Carapace improvements needed

### Implementation Tracking
- [ ] Update `move/sources/amm/pool.move` with TODOs
- [ ] Add comments referencing Avocado patterns
- [ ] Document fixed-point precision decisions

### Weekly Report (Friday EOD)
- [ ] Summary of completed tasks
- [ ] Blockers encountered
- [ ] Prep notes for Week 2 (Cetus study)

---

## Testing Checklist

### Move Contract Tests
- [ ] `sui move test` passes for all new modules
- [ ] Fixed-point math: 100% coverage
- [ ] Pool swap functions: Happy path + edge cases
- [ ] Object derivation: Determinism verified

### Integration Tests (if applicable)
- [ ] Pool math matches Avocado's results (same inputs → same outputs)
- [ ] Gas costs documented and reasonable

---

## Success Criteria

By end of week, you should have:

1. ✅ All 5 Sui DeFi repos cloned and buildable
2. ✅ Complete understanding of Avocado's constant product implementation
3. ✅ Working fixed-point math library (6-decimal precision)
4. ✅ Audited swap functions in `pool.move`
5. ✅ Enhanced object derivation helpers
6. ✅ All unit tests passing

**Key Metric**: Carapace's math should produce identical results to Avocado for same inputs (swap amounts, LP shares).

---

## Daily Breakdown

### Monday (6 hours)
- **Morning (3h)**: Clone all repos, build, run tests (Task #1)
- **Afternoon (3h)**: Start Avocado code review (Task #2)

### Tuesday (8 hours)
- **Morning (4h)**: Complete Avocado code review (Task #2)
- **Afternoon (4h)**: Deep dive into Avocado math module (Task #2)

### Wednesday (8 hours)
- **Full day**: Analyze Avocado math, document findings (Task #2)
- **Evening**: Plan fixed-point math port (Task #3 prep)

### Thursday (8 hours)
- **Full day**: Implement fixed-point math library (Task #3)
- **Tests and edge cases**

### Friday (8 hours)
- **Morning (4h)**: Complete pool swap functions (Task #4)
- **Afternoon (3h)**: Enhanced object derivation (Task #5)
- **EOD (1h)**: Weekly report and Week 2 prep

---

## Resources

### Documentation
- [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md) - Full repo analysis
- [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md) - Percolator patterns
- [TODO_PERCOLATOR.md](./TODO_PERCOLATOR.md) - Phase 1J checklist
- [ROADMAP.md](./ROADMAP.md) - Full development roadmap

### Repository Links
- [Avocado DEX](https://github.com/avocadodefi/sc-dex)
- [Cetus CLMM](https://github.com/CetusProtocol/cetus-clmm)
- [Navi Lending](https://github.com/naviprotocol/navi-lending)
- [Turbos Finance](https://github.com/turbos-finance/turbos)
- [Sui AI Agent Kit](https://github.com/caterpillardev/Sui-AI-Agent-Kit)

### Sui Documentation
- [Move Language Guide](https://move-language.github.io/move/)
- [Sui Object Model](https://docs.sui.io/concepts/object-ownership)
- [Move Testing](https://docs.sui.io/concepts/sui-move-concepts/testing)

---

## Blockers & Questions

### Potential Blockers
- **Build issues with repos**: Some repos may have outdated dependencies
  - *Solution*: Document issues, check repo Issues/Discussions for fixes
- **Math precision differences**: Avocado may use different decimal precision
  - *Solution*: Standardize on 6 decimals (Percolator standard)
- **Missing Sui CLI tools**: Older Sui version needed
  - *Solution*: Use Docker or version managers

### Open Questions
- [ ] What decimal precision does Avocado use? (Document in analysis)
- [ ] Does Avocado have flash swaps? (Affects Week 2 Cetus study priority)
- [ ] Are there known bugs in Avocado math? (Check Issues tab)

---

## Next Week Preview (Week 2)

### Primary Focus: Cetus CLMM Study
- Advanced AMM mechanics (concentrated liquidity)
- Flash swap implementation (must-have for Phase 1A)
- SDK architecture (for `packages/sdk/` design)
- TWAP oracle patterns (prep for Phase 1B)

### Tasks Carried Over (if not completed)
- Any incomplete items from Week 1
- Fixed-point math refinements based on testing

---

**Generated**: 2025-10-22
**Status**: Week 1 of Phase 1A
**Next Review**: Friday EOD (weekly report)

---

## Quick Command Reference

```bash
# Build Carapace contracts
cd move && sui move build

# Test specific module
sui move test --filter fixed_point

# Test all
sui move test

# Check gas costs
sui move build --dump-bytecode-as-base64

# Clone research repos (if not done)
./scripts/setup_research.sh  # (create this script)
```

---

**Pro Tip**: Keep a running `research/NOTES.md` file with discoveries, patterns, and "aha!" moments from each repo. This will be invaluable for documentation and decision-making later.
