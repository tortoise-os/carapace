# Carapace Security Audit Guide

*Last Updated: October 22, 2025*

## Executive Summary

This guide provides security best practices for Carapace's Sui Move-based DeFi protocol, drawing from 2025 audit findings across the Sui ecosystem. Move's resource-oriented model eliminates many common vulnerabilities (e.g., reentrancy) but introduces unique risks in object management, capability scoping, and oracle dependencies.

**Key Statistic:** Audited Sui protocols experienced 50% fewer security incidents in 2025 compared to unaudited projects.

---

## Move-Specific Security Advantages

### 1. Resource-Oriented Safety
**Built-In Protections:**
- **Linear Types:** Resources cannot be duplicated or accidentally destroyed
- **Borrow Checker:** Prevents callback exploits common in Solidity
- **No Reentrancy:** Move's execution model eliminates reentrancy attacks by design

**Carapace Application:**
```move
// Safe flash loan using "hot potato" pattern
public fun flash_loan<X, Y>(
    pool: &mut Pool<X, Y>,
    amount: u64
): (Coin<X>, FlashLoanReceipt) {
    // FlashLoanReceipt is a "hot potato" - must be consumed
    let coin = extract_liquidity(pool, amount);
    let receipt = FlashLoanReceipt {
        amount,
        pool_id: object::id(pool)
    };
    (coin, receipt)
}

public fun repay_flash_loan<X, Y>(
    pool: &mut Pool<X, Y>,
    coin: Coin<X>,
    receipt: FlashLoanReceipt
) {
    // Receipt is destroyed here, ensuring repayment
    let FlashLoanReceipt { amount, pool_id } = receipt;
    assert!(coin::value(&coin) >= amount, E_INSUFFICIENT_REPAYMENT);
    deposit_liquidity(pool, coin);
}
```

**Trail of Bits Recommendation:** Adopt "hot potato" resources for all atomic operations (swaps, flash loans) to enable upfront validation and prevent runtime failures.

---

## Critical Sui-Specific Vulnerabilities

### 1. Improper Capability Scoping
**Risk:** Admin capabilities without proper TTL (time-to-live) or multi-sig enforcement
**Prevalence:** Found in 25% of 2025 Sui DeFi audits (Three Sigma, QuillAudits)

**Vulnerable Pattern:**
```move
// VULNERABLE: No expiry on admin cap
struct AdminCap has key, store {
    id: UID,
}

public fun emergency_withdraw(
    _: &AdminCap,
    pool: &mut Pool<X, Y>
) {
    // No time restrictions!
}
```

**Secure Pattern for Carapace:**
```move
struct TimedAdminCap has key {
    id: UID,
    expiry: u64,
    actions_allowed: vector<String>,
}

public fun emergency_withdraw(
    cap: &TimedAdminCap,
    pool: &mut Pool<X, Y>,
    clock: &Clock,
    ctx: &TxContext
) {
    assert!(clock::timestamp_ms(clock) < cap.expiry, E_CAP_EXPIRED);
    assert!(vector::contains(&cap.actions_allowed, &string::utf8(b"emergency_withdraw")), E_UNAUTHORIZED);
    // Proceed with withdrawal
}
```

**Action Items:**
- [ ] Add expiry timestamps to all admin capabilities
- [ ] Implement capability rotation every 90 days
- [ ] Enforce multi-sig for critical operations (>5% TVL movements)

---

### 2. Oracle Manipulation
**Risk:** Price feed manipulation in yield vaults and swap calculations
**Prevalence:** 15% of yield aggregator audits flagged oracle issues (Antier Solutions)

**Vulnerable Pattern:**
```move
// VULNERABLE: Single price source
public fun calculate_lp_value(
    pool: &Pool<X, Y>,
    oracle: &PriceOracle
): u64 {
    let price_x = oracle::get_price(oracle, type_name::get<X>());
    // Single point of failure!
}
```

**Secure Pattern for Carapace:**
```move
public fun calculate_lp_value_safe(
    pool: &Pool<X, Y>,
    oracles: vector<ID>, // Multiple oracle sources
    clock: &Clock,
    ctx: &TxContext
): u64 {
    let mut prices = vector::empty<u64>();
    let mut valid_count = 0;

    let i = 0;
    while (i < vector::length(&oracles)) {
        let oracle_id = *vector::borrow(&oracles, i);
        let (price, timestamp, valid) = get_price_with_metadata(oracle_id);

        // Check freshness (within 30 seconds)
        if (valid && clock::timestamp_ms(clock) - timestamp < 30_000) {
            vector::push_back(&mut prices, price);
            valid_count = valid_count + 1;
        };
        i = i + 1;
    };

    assert!(valid_count >= 3, E_INSUFFICIENT_ORACLES);

    // Use median to resist outliers
    median(&prices)
}
```

**Action Items for TortoiseVault:**
- [ ] Integrate 3+ oracle sources (Pyth, Switchboard, Supra)
- [ ] Implement 30-second freshness checks
- [ ] Use median pricing to resist manipulation
- [ ] Add circuit breakers for >10% price deviations

---

### 3. Fixed-Point Math Precision Loss
**Risk:** Rounding errors in fee calculations and liquidity accounting
**Common Issue:** Identified in pool designs with complex fee tiers

**Vulnerable Pattern:**
```move
// VULNERABLE: Precision loss in division
public fun calculate_fee(amount: u64, fee_bps: u64): u64 {
    amount * fee_bps / 10_000 // May lose precision!
}
```

**Secure Pattern for Carapace:**
```move
const PRECISION: u128 = 1_000_000_000_000; // 1e12

public fun calculate_fee_precise(amount: u64, fee_bps: u64): u64 {
    let amount_scaled = (amount as u128) * PRECISION;
    let fee_scaled = amount_scaled * (fee_bps as u128) / 10_000;
    let fee = fee_scaled / PRECISION;
    (fee as u64)
}

// Verify invariant
public fun verify_pool_invariant<X, Y>(pool: &Pool<X, Y>) {
    let reserve_x = balance::value(&pool.reserve_x);
    let reserve_y = balance::value(&pool.reserve_y);
    let k = (reserve_x as u128) * (reserve_y as u128);
    assert!(k >= pool.last_k, E_INVARIANT_VIOLATION);
}
```

**Action Items:**
- [ ] Use 1e12 precision for all fee calculations
- [ ] Add invariant checks after every swap/liquidity change
- [ ] Unit test boundary cases (dust amounts, max values)

---

### 4. Cross-Pool Netting Risks
**Risk:** Atomicity failures in multi-pool operations (unique to TortoiseVault)

**Secure Pattern:**
```move
// Use programmable transaction blocks for atomicity
public fun rebalance_multi_pool(
    vault: &mut TortoiseVault,
    pools: vector<&mut Pool>,
    allocations: vector<u64>,
    ctx: &TxContext
) {
    // Validate total allocations = 100%
    assert!(sum(&allocations) == 100, E_INVALID_ALLOCATION);

    // All-or-nothing execution via PTB
    let i = 0;
    while (i < vector::length(&pools)) {
        let pool = vector::borrow_mut(&mut pools, i);
        let allocation = *vector::borrow(&allocations, i);
        adjust_position(vault, pool, allocation);
        i = i + 1;
    };

    // Verify vault invariant
    verify_vault_health(vault);
}
```

---

## Sui Move Registry & Transparency

### On-Chain Registry Benefits
**Impact:** 40% reduction in exploit risks for registered protocols (Sui Foundation Report, 2025)

**Features:**
- Real-time vulnerability scanning
- Dependency tracking for transitive vulnerabilities
- Automatic alerts for package upgrades

**Carapace Integration:**
```bash
# Register package on-chain
sui client publish --with-registry

# Enable auto-scanning in CI/CD
sui move verify --registry-check
```

**Action Items:**
- [ ] Register all Carapace packages in Move Registry
- [ ] Set up GitHub Actions for registry verification on PRs
- [ ] Monitor registry alerts for dependency vulnerabilities

---

## Formal Verification Priorities

### Must-Verify Invariants

1. **Pool Constant Product (TortoiseSwap)**
   ```
   ∀ swaps: reserve_x * reserve_y ≥ k_last (accounting for fees)
   ```

2. **Vault Solvency (TortoiseVault)**
   ```
   ∀ states: total_shares * share_price ≤ total_assets
   ```

3. **Flash Loan Atomicity**
   ```
   ∀ flash_loan: borrowed_amount + fee = repaid_amount
   ```

4. **RL Fee Bounds**
   ```
   ∀ fee_adjustments: 0.01% ≤ dynamic_fee ≤ 1%
   ```

**Tools:**
- Move Prover for property verification
- SlowMist's Move Analyzer for control flow audits
- Custom Z3 assertions for RL model constraints

**Action Items:**
- [ ] Write formal specs for all invariants
- [ ] Run Move Prover in CI (allow warnings initially, then enforce)
- [ ] Document assumptions in module comments

---

## Recommended Audit Firms

### Tier 1: Move Specialists
1. **OtterSec**
   - Experience: MMT Finance, Cetus, Turbos
   - Strengths: Deep Sui Move expertise, post-audit monitoring
   - Cost: $80-120K for comprehensive audit

2. **SlowMist**
   - Experience: 30+ Sui protocols audited
   - Strengths: Automated tooling, fast turnaround
   - Cost: $50-80K

3. **Trail of Bits**
   - Experience: Aptos/Sui Move research
   - Strengths: Formal verification, academic rigor
   - Cost: $120-200K (includes formal verification)

### Tier 2: Comprehensive Security
4. **QuillAudits**
   - Strengths: Cost-effective, good for initial review
   - Cost: $30-50K

5. **Hacken**
   - Strengths: Bug bounty platform integration
   - Cost: $40-60K + ongoing bounty management

### Recommended Approach
**Phase 1: Pre-Audit (Self-Service)**
1. Run SlowMist's automated analyzer
2. Internal security review using this guide
3. Formal verification of critical invariants

**Phase 2: Primary Audit ($80-120K)**
- OtterSec for comprehensive Move audit
- Focus on pool mechanics, vault strategies, TEE integration

**Phase 3: Bug Bounty ($200K+ reserve)**
- Launch via Hacken or Immunefi
- Tiered rewards: Critical ($50K), High ($20K), Medium ($5K)

**Total Budget:** $300-400K for comprehensive security program

---

## Phased Audit Checklist

### Pre-Audit (Before Engaging Firms)
- [ ] Complete unit tests for all public functions (>80% coverage)
- [ ] Run Move Prover on critical modules
- [ ] Document all admin capabilities and privileges
- [ ] Create threat model for TEE integration
- [ ] Test emergency pause mechanisms
- [ ] Verify all math operations use fixed-point precision

### Integration Testing (Before Testnet)
- [ ] End-to-end swap scenarios (including edge cases)
- [ ] Multi-user vault deposit/withdrawal stress tests
- [ ] Oracle failure simulations
- [ ] Network partition scenarios for TEE communication
- [ ] Gas optimization benchmarks (target <1M gas per swap)

### Fuzzing & Invariant Testing
- [ ] Implement property-based tests for all invariants
- [ ] Run fuzzing campaigns (1M+ iterations)
- [ ] Test with randomized transaction orderings
- [ ] Simulate malicious user behaviors (sandwich attacks, front-running)

### Security Review (With Audit Firm)
- [ ] Provide comprehensive documentation package
- [ ] 2-week code freeze during audit
- [ ] Daily standups with audit team
- [ ] Address all findings before testnet launch
- [ ] Public disclosure of audit report

### Post-Audit (Ongoing)
- [ ] Launch bug bounty program
- [ ] Monthly security reviews of new features
- [ ] Community security working group
- [ ] Incident response plan with 24-hour SLA

---

## Emergency Response Plan

### Severity Levels

**Critical (Response: Immediate)**
- Exploit in progress, funds at risk
- Actions: Emergency pause, notify users, engage incident response team

**High (Response: <24 hours)**
- Vulnerability discovered, no active exploit
- Actions: Prepare patch, coordinate disclosure, deploy fix

**Medium (Response: <1 week)**
- Minor vulnerability or optimization
- Actions: Schedule fix in next release

### Pause Mechanism
```move
struct EmergencyPause has key {
    id: UID,
    paused: bool,
    reason: String,
    paused_at: u64,
}

public fun emergency_pause(
    _: &AdminCap,
    pause: &mut EmergencyPause,
    reason: String,
    clock: &Clock
) {
    pause.paused = true;
    pause.reason = reason;
    pause.paused_at = clock::timestamp_ms(clock);
    // Emit event for monitoring
}
```

**Action Items:**
- [ ] Implement pause mechanism in all critical modules
- [ ] Test pause/unpause procedures monthly
- [ ] Establish multi-sig unpause process (3-of-5)

---

## Common Sui DeFi Anti-Patterns

### 1. Unbounded Loops
```move
// AVOID: Gas bombs
while (i < vector::length(&all_users)) {
    process_user(...);
    i = i + 1;
}

// PREFER: Batched processing
public fun process_batch(start: u64, end: u64) {
    assert!(end - start <= 100, E_BATCH_TOO_LARGE);
    // Process bounded range
}
```

### 2. Shared Object Contention
```move
// AVOID: Hot shared objects
struct GlobalPool has key {
    id: UID,
    liquidity: Balance<SUI>,
}

// PREFER: Sharded design
struct ShardedPool has key {
    id: UID,
    shards: Table<u64, Balance<SUI>>,
}
```

### 3. Missing Access Controls
```move
// AVOID: Public mutators without checks
public fun set_fee(pool: &mut Pool, fee: u64) {
    pool.fee = fee; // Anyone can call!
}

// PREFER: Capability-gated
public fun set_fee(_: &AdminCap, pool: &mut Pool, fee: u64) {
    assert!(fee <= MAX_FEE, E_FEE_TOO_HIGH);
    pool.fee = fee;
}
```

---

## Carapace-Specific Security Considerations

### 1. TEE Integration Security
**Risks:**
- Side-channel attacks on confidential compute
- Model poisoning via malicious training data
- Replay attacks on RL decisions

**Mitigations:**
- [ ] Use Intel SGX attestation for TEE verification
- [ ] Implement nonce-based replay protection
- [ ] Rate-limit RL model updates (max 1 per epoch)
- [ ] Store model hashes on Walrus for tamper detection

### 2. RL Model Safety
**Risks:**
- Adversarial inputs causing extreme fee adjustments
- Model divergence under black swan events

**Mitigations:**
- [ ] Hard-code fee bounds (0.01% - 1%) in contract
- [ ] Implement circuit breakers for >3 std dev deviations
- [ ] Fallback to static fees if TEE unreachable

### 3. Walrus Storage Integrity
**Risks:**
- Blob unavailability during critical operations
- Desync between on-chain hash and stored model

**Mitigations:**
- [ ] Store redundant copies across Walrus epochs
- [ ] Verify blob hash before loading model
- [ ] Cache last-known-good model in contract

---

## Security Metrics & KPIs

### Track Monthly
- Test coverage percentage (target: >85%)
- Critical findings resolved (target: 100% before mainnet)
- Bug bounty payouts (indicates active researcher engagement)
- Mean time to patch (target: <48 hours for high severity)

### Benchmark Against Ecosystem
- TVL per security incident (higher = better)
- Audit score vs. similar protocols
- Community security contributions (via GitHub issues)

---

## Resources

### Sui Security Documentation
- [Sui Move Security Guide](https://docs.sui.io/guides/developer/advanced/security)
- [Move Prover Tutorial](https://github.com/move-language/move/tree/main/language/move-prover)
- [Sui Foundation Security Resources](https://sui.io/security)

### Audit Reports (For Reference)
- Cetus DEX: OtterSec report (May 2025)
- Turbos Finance: SlowMist report (March 2025)
- MMT Finance: Hacken report (September 2025)

### Community
- Sui Security Working Group (Discord)
- Move Language Security Forum
- Weekly security office hours (Sui Foundation)

---

## Next Steps

### Immediate (Before Testnet)
1. Complete self-audit using this guide
2. Engage OtterSec for primary audit
3. Implement formal verification for invariants
4. Set up Move Registry monitoring

### Short-Term (Testnet Phase)
1. Run public bug bounty (testnet rewards)
2. Community security review period (2 weeks)
3. Address all medium+ findings
4. Conduct emergency drill

### Long-Term (Post-Mainnet)
1. Quarterly security audits for new features
2. Maintain $200K+ bug bounty reserve
3. Annual third-party penetration testing
4. Security-focused DAO governance proposals

---

*This guide should be reviewed quarterly and updated based on ecosystem learnings and new attack vectors.*
