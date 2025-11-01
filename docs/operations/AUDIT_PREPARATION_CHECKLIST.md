# Carapace Security Audit Preparation Checklist

*Last Updated: October 22, 2025*

This checklist guides the Carapace team through comprehensive security audit preparation before mainnet launch. Follow this systematically to ensure audit readiness.

**Related Documents:**
- [SECURITY_AUDIT_GUIDE.md](./SECURITY_AUDIT_GUIDE.md) - Detailed security best practices
- [ROADMAP.md](./ROADMAP.md) - Phase 1K integration timeline

**Target Audit Firms:** OtterSec (primary), SlowMist (secondary)
**Budget:** $80-120K for primary audit + $200K+ bug bounty reserve
**Timeline:** 3-4 weeks preparation + 2-3 weeks audit execution

---

## Phase 1: Pre-Audit Preparation (Week 1-2)

### Code Quality & Completeness
- [ ] All contract functions fully implemented (no TODOs in production code)
- [ ] All public functions have comprehensive NatSpec comments
- [ ] Code follows consistent naming conventions
- [ ] Remove all debug code, console logs, and test artifacts
- [ ] All compiler warnings resolved
- [ ] Move.toml dependencies pinned to specific versions

### Move-Specific Security Enhancements
- [ ] **Hot Potato Pattern** implemented for all atomic operations
  - [ ] Flash loans use receipt consumption pattern
  - [ ] Swap operations validated upfront
  - [ ] Test that receipts cannot be duplicated or dropped

- [ ] **Capability Scoping** properly implemented
  - [ ] All admin capabilities have TTL (time-to-live) expiry fields
  - [ ] Capability rotation mechanism coded (90-day cycles)
  - [ ] Multi-sig enforcement for operations moving >5% TVL
  - [ ] Capability action allowlists defined
  - [ ] Test expired capability rejection

- [ ] **Fixed-Point Math Precision**
  - [ ] All fee calculations use 1e12 precision constant
  - [ ] Division operations use scaled arithmetic
  - [ ] Test boundary cases (dust amounts, u64::MAX values)
  - [ ] Compare precision against Avocado DEX implementation

### Critical Invariants (Must Verify)
- [ ] **Pool Constant Product Invariant**
  ```move
  assert!(
      (reserve_x as u128) * (reserve_y as u128) >= pool.last_k,
      E_INVARIANT_VIOLATION
  );
  ```
  - [ ] Invariant checked after every swap
  - [ ] Invariant checked after liquidity changes
  - [ ] Accounts for fee accumulation

- [ ] **Vault Solvency Invariant**
  ```move
  assert!(
      total_shares * share_price <= total_assets,
      E_VAULT_INSOLVENCY
  );
  ```
  - [ ] Checked before every withdrawal
  - [ ] Checked after rebalancing operations

- [ ] **Flash Loan Atomicity**
  ```move
  assert!(
      repaid_amount >= borrowed_amount + fee,
      E_INSUFFICIENT_REPAYMENT
  );
  ```
  - [ ] Receipt destruction enforces repayment
  - [ ] Fee calculation cannot overflow

- [ ] **RL Fee Bounds**
  ```move
  assert!(
      fee_bps >= MIN_FEE_BPS && fee_bps <= MAX_FEE_BPS,
      E_FEE_OUT_OF_BOUNDS
  );
  ```
  - [ ] Hard-coded bounds: 0.01% - 1% (1-100 bps)
  - [ ] Cannot be bypassed by AI model

### Oracle Security
- [ ] **Multi-Source Oracle Integration**
  - [ ] Pyth Network integration complete
  - [ ] Switchboard integration complete
  - [ ] Supra Oracles integration complete (if available)
  - [ ] Minimum 3 oracle sources required for pricing

- [ ] **Oracle Validation Logic**
  - [ ] 30-second freshness check implemented
  - [ ] Median price calculation (resist outliers)
  - [ ] Circuit breaker for >10% price deviation
  - [ ] Test oracle failure scenarios (1 or 2 sources down)
  - [ ] Test stale price rejection

### Access Control Review
- [ ] **Admin Functions Audit**
  - [ ] List all functions requiring AdminCap
  - [ ] Verify each has proper capability check
  - [ ] No public mutators without capability gates
  - [ ] Emergency pause function restricted to AdminCap

- [ ] **Ownership Management**
  - [ ] Initial ownership transfer mechanism secure
  - [ ] Ownership transfer requires acceptance (2-step process)
  - [ ] No ability to renounce ownership without multi-sig

### Anti-Pattern Prevention (Sui-Specific)
- [ ] **No Unbounded Loops**
  - [ ] All loops have explicit bounds
  - [ ] Batch processing limits enforced (e.g., max 100 items)
  - [ ] Gas estimation tests for worst-case scenarios

- [ ] **Shared Object Contention Minimized**
  - [ ] Sharding strategy documented
  - [ ] Per-token-pair pool design (not global pool)
  - [ ] Test parallel transaction execution

- [ ] **No Missing Access Controls**
  - [ ] Audit every `public fun` for capability requirements
  - [ ] No setter functions callable by anyone
  - [ ] Event emission doesn't bypass access control

---

## Phase 2: Testing & Verification (Week 2-3)

### Unit Testing
- [ ] **Test Coverage Metrics**
  - [ ] >85% line coverage across all modules
  - [ ] 100% coverage for critical paths (swaps, deposits, withdrawals)
  - [ ] Run `sui move test --coverage` and review report

- [ ] **Boundary Testing**
  - [ ] Test with amount = 0 (should revert)
  - [ ] Test with amount = u64::MAX (check overflow handling)
  - [ ] Test with dust amounts (< 1000 units)
  - [ ] Test fee calculations at min and max bounds

- [ ] **State Transition Testing**
  - [ ] Test all valid state transitions
  - [ ] Test invalid state transitions revert
  - [ ] Test concurrent operations (multi-user scenarios)

### Integration Testing
- [ ] **End-to-End Scenarios**
  - [ ] Complete swap flow (quote → execute → verify)
  - [ ] Complete liquidity provision flow (deposit → receive LP → verify)
  - [ ] Complete liquidity removal flow (burn LP → withdraw → verify)
  - [ ] Complete vault flow (deposit → rebalance → withdraw)

- [ ] **Multi-User Testing**
  - [ ] Multiple users adding liquidity simultaneously
  - [ ] Interleaved swaps and liquidity changes
  - [ ] Vault deposits from multiple users
  - [ ] Concurrent rebalancing attempts

- [ ] **Failure Mode Testing**
  - [ ] Oracle failures (all 3 sources down)
  - [ ] TEE unavailability (fallback to static fees)
  - [ ] Network partition during multi-pool rebalancing
  - [ ] Emergency pause activation during active operations

### Fuzzing & Property-Based Testing
- [ ] **Implement Property Tests**
  - [ ] Property: `swap_x_to_y` followed by `swap_y_to_x` restores original state (minus fees)
  - [ ] Property: Total LP shares * share price ≤ pool reserves
  - [ ] Property: Sum of user balances = total supply
  - [ ] Property: Fees always accumulate (never decrease)

- [ ] **Fuzzing Campaign**
  - [ ] Run 1M+ iterations with random inputs
  - [ ] Randomize transaction orderings
  - [ ] Test with malicious sequences (sandwich attacks, front-running)
  - [ ] Document any crashes or assertion failures

### Formal Verification (Move Prover)
- [ ] **Formal Specification Written**
  - [ ] Pool invariant spec (`spec pool::swap`)
  - [ ] Vault solvency spec (`spec vault::withdraw`)
  - [ ] Flash loan spec (`spec pool::flash_loan`)
  - [ ] Fee bounds spec (`spec pool::set_fee`)

- [ ] **Move Prover Execution**
  - [ ] Run `sui move prove` on all modules
  - [ ] Address all errors (warnings allowed initially)
  - [ ] Document assumptions in `spec` blocks
  - [ ] Set up CI job to run prover on every commit

---

## Phase 3: TEE & AI Security (Week 3)

### Nautilus TEE Hardening
- [ ] **SGX Attestation**
  - [ ] Intel SGX remote attestation implemented
  - [ ] Attestation verification on-chain or via trusted service
  - [ ] Test attestation failure rejection

- [ ] **Replay Protection**
  - [ ] Nonce-based replay protection implemented
  - [ ] Nonces stored in contract state
  - [ ] Test duplicate nonce rejection
  - [ ] Test nonce increment logic

- [ ] **Rate Limiting**
  - [ ] RL model updates limited to 1 per epoch
  - [ ] Test rapid update rejection
  - [ ] Emergency rate limit increase mechanism (for crises)

### RL Model Safety
- [ ] **Hard-Coded Fee Bounds**
  - [ ] MIN_FEE_BPS = 1 (0.01%)
  - [ ] MAX_FEE_BPS = 100 (1%)
  - [ ] Bounds enforced in contract (not just TEE)
  - [ ] Test fee outside bounds gets rejected

- [ ] **Circuit Breakers**
  - [ ] >3 standard deviation fee change triggers pause
  - [ ] Historical fee tracking for std dev calculation
  - [ ] Test circuit breaker activation
  - [ ] Manual override for false positives

- [ ] **Fallback Mechanisms**
  - [ ] Static fee used when TEE unreachable
  - [ ] Automatic fallback after N failed TEE calls
  - [ ] Test TEE timeout handling

### Walrus Storage Integrity
- [ ] **Blob Hash Verification**
  - [ ] Model hash stored on-chain
  - [ ] Hash verified before loading model from Walrus
  - [ ] Test hash mismatch rejection

- [ ] **Redundant Storage**
  - [ ] Models stored across multiple Walrus epochs
  - [ ] Automatic re-upload if epoch expires
  - [ ] Test epoch expiry handling

- [ ] **Last-Known-Good Caching**
  - [ ] Contract caches last valid model hash
  - [ ] Fallback to cached model if Walrus unavailable
  - [ ] Test cache invalidation logic

---

## Phase 4: Documentation & Audit Package (Week 3-4)

### Technical Documentation
- [ ] **Architecture Overview**
  - [ ] High-level system architecture diagram
  - [ ] Contract interaction flow diagrams
  - [ ] State machine diagrams for critical operations
  - [ ] Sharding architecture (if implemented)

- [ ] **Contract Documentation**
  - [ ] NatSpec comments for all public functions
  - [ ] Parameter descriptions and constraints
  - [ ] Return value descriptions
  - [ ] Error code explanations

- [ ] **Security Model Documentation**
  - [ ] Threat model for TEE integration
  - [ ] Oracle manipulation resistance design
  - [ ] MEV protection mechanisms (batching, ARG)
  - [ ] Emergency response procedures

### Audit Package Preparation
- [ ] **Code Repository**
  - [ ] Clean, dedicated audit branch
  - [ ] All dependencies in repo (no external fetches)
  - [ ] Commit hash locked for audit
  - [ ] README with build instructions

- [ ] **Test Suite**
  - [ ] Full test suite runnable with single command
  - [ ] Test coverage report generated
  - [ ] Integration test environment documented
  - [ ] Fuzzing setup instructions

- [ ] **Known Issues Document**
  - [ ] List of known limitations (if any)
  - [ ] Open questions for auditor input
  - [ ] Trade-offs and design decisions explained
  - [ ] Future improvements planned (Phase 2 features)

- [ ] **Contact Information**
  - [ ] Primary technical contact(s)
  - [ ] Communication channel (Slack, Discord, Telegram)
  - [ ] Availability for questions (timezone, hours)
  - [ ] Emergency escalation path

### Sui Move Registry
- [ ] **Package Registration**
  - [ ] All Carapace packages registered in Sui Move Registry
  - [ ] Package metadata accurate (description, author, license)
  - [ ] Dependency tree visible in registry

- [ ] **CI/CD Integration**
  - [ ] GitHub Actions verify registry on PRs
  - [ ] Auto-alert on dependency vulnerabilities
  - [ ] Registry check blocks merge if failing

---

## Phase 5: Audit Firm Engagement (Week 4)

### Firm Selection & Contracting
- [ ] **Shortlist Audit Firms**
  - [ ] OtterSec (recommended - MMT Finance, Cetus experience)
  - [ ] SlowMist (fast turnaround, automated tooling)
  - [ ] Trail of Bits (formal verification expertise)

- [ ] **Request Quotes**
  - [ ] Provide code size and complexity estimate
  - [ ] Request timeline estimates
  - [ ] Clarify scope (contracts only vs. SDK/frontend)
  - [ ] Confirm deliverables (report format, re-audit after fixes)

- [ ] **Contracting**
  - [ ] Review and sign engagement agreement
  - [ ] Clarify payment terms and milestones
  - [ ] Establish NDA if needed
  - [ ] Define audit timeline and code freeze date

### Pre-Audit Kickoff
- [ ] **Share Audit Package**
  - [ ] Send repository access (audit branch)
  - [ ] Provide documentation package
  - [ ] Share test suite and coverage reports
  - [ ] Highlight areas of concern for deep review

- [ ] **Schedule Kickoff Call**
  - [ ] Walkthrough of architecture
  - [ ] Explain TEE integration and RL approach
  - [ ] Discuss known complexity areas (cross-pool netting, batching)
  - [ ] Answer initial questions

- [ ] **Establish Communication Protocol**
  - [ ] Daily standup time (if needed)
  - [ ] Async communication channel (Slack/Discord)
  - [ ] Issue tracking method (GitHub, Jira, spreadsheet)
  - [ ] Escalation path for blockers

---

## Phase 6: During Audit Execution (2-3 Weeks)

### Code Freeze & Coordination
- [ ] **Code Freeze Enforcement**
  - [ ] No commits to audit branch after handoff
  - [ ] Critical bug fixes communicated to auditors first
  - [ ] Maintain separate development branch for ongoing work

- [ ] **Daily Coordination**
  - [ ] Respond to auditor questions within 4 hours
  - [ ] Clarify design decisions as needed
  - [ ] Provide additional test cases if requested

### Finding Triage
- [ ] **Track All Findings**
  - [ ] Maintain shared spreadsheet or issue tracker
  - [ ] Categorize by severity (Critical, High, Medium, Low, Informational)
  - [ ] Assign owner for each finding
  - [ ] Track status (Open, In Progress, Fixed, Won't Fix)

- [ ] **Severity Agreement**
  - [ ] Critical: Immediate funds loss, protocol break
  - [ ] High: Significant risk, requires fix before mainnet
  - [ ] Medium: Minor risk, fix before mainnet preferred
  - [ ] Low: Best practice, fix if time permits
  - [ ] Informational: No fix needed, documentation only

### Remediation Planning
- [ ] **Critical & High Findings**
  - [ ] Fix immediately, provide patch to auditor
  - [ ] Re-test fix comprehensively
  - [ ] Request auditor re-review of fix

- [ ] **Medium Findings**
  - [ ] Plan fixes before testnet launch
  - [ ] Batch similar fixes together
  - [ ] Provide fix plan to auditor

- [ ] **Low & Informational**
  - [ ] Document for future improvement
  - [ ] Address if time permits before mainnet
  - [ ] Include in known issues if unfixed

---

## Phase 7: Post-Audit Actions (1-2 Weeks)

### Fix Implementation
- [ ] **Address All Critical/High Findings**
  - [ ] 100% of critical findings fixed
  - [ ] 100% of high findings fixed or justified
  - [ ] All fixes reviewed by auditor

- [ ] **Address Medium Findings**
  - [ ] Target 90%+ medium findings fixed
  - [ ] Remaining medium findings documented in known issues
  - [ ] Risk assessment for unfixed medium findings

### Re-Audit & Verification
- [ ] **Submit Fixes for Re-Review**
  - [ ] Clean commit history for fixes
  - [ ] Annotate each fix with finding reference
  - [ ] Provide test cases demonstrating fix

- [ ] **Auditor Sign-Off**
  - [ ] Receive final audit report
  - [ ] All critical/high findings marked as resolved
  - [ ] No new critical/high findings introduced by fixes

### Public Disclosure
- [ ] **Publish Audit Report**
  - [ ] Upload to project website and GitHub
  - [ ] Announce on social media (Twitter, Discord)
  - [ ] Summarize key findings and resolutions
  - [ ] Transparency builds trust

- [ ] **Known Issues Documentation**
  - [ ] Publicly document any unfixed medium/low findings
  - [ ] Explain rationale for not fixing
  - [ ] Provide timeline for future fixes (if applicable)

---

## Phase 8: Bug Bounty Launch (Post-Audit)

### Bounty Program Setup
- [ ] **Platform Selection**
  - [ ] Hacken (MMT Finance uses, integrates with audit)
  - [ ] Immunefi (industry standard for DeFi)

- [ ] **Scope Definition**
  - [ ] In-scope: All deployed smart contracts
  - [ ] In-scope: TEE integration logic (if exposed)
  - [ ] Out-of-scope: Frontend, API, known issues
  - [ ] Out-of-scope: Third-party dependencies (Sui Move framework)

- [ ] **Reward Tiers**
  - [ ] Critical: $50,000 (funds loss, protocol halt)
  - [ ] High: $20,000 (significant risk, no immediate loss)
  - [ ] Medium: $5,000 (minor risk, edge cases)
  - [ ] Low: $1,000 (best practice, informational)

- [ ] **Reserve Allocation**
  - [ ] Minimum $200,000 in stablecoins (USDC/USDT on Sui)
  - [ ] Multi-sig wallet for payouts (3-of-5)
  - [ ] Replenish reserve if depleted below $100K

### Testnet Bug Bounty (Optional Pre-Launch)
- [ ] **Testnet Bounty Period**
  - [ ] 2-week community review on testnet
  - [ ] Lower rewards (50% of mainnet tiers)
  - [ ] Encourage stress testing and edge case discovery

- [ ] **Testnet Findings Review**
  - [ ] Fix all valid testnet findings before mainnet
  - [ ] Reward testnet reporters with tokens or early access
  - [ ] Use findings to refine mainnet deployment

### Bounty Program Monitoring
- [ ] **Incident Response Plan**
  - [ ] 24-hour SLA for critical reports
  - [ ] 48-hour SLA for high severity reports
  - [ ] Clear escalation path to core team

- [ ] **Regular Reviews**
  - [ ] Monthly review of open reports
  - [ ] Quarterly reward payout analysis
  - [ ] Annual scope and reward tier updates

---

## Phase 9: Emergency Preparedness (Ongoing)

### Pause Mechanism Testing
- [ ] **Emergency Pause Implementation**
  - [ ] Pause functions in all critical modules (pool, vault)
  - [ ] Pause callable only by AdminCap
  - [ ] Test pause stops swaps, deposits, withdrawals
  - [ ] Test unpause restores functionality

- [ ] **Monthly Drills**
  - [ ] Simulate emergency scenario
  - [ ] Practice multi-sig pause activation (3-of-5)
  - [ ] Verify communication procedures
  - [ ] Document response time

### Incident Response Plan
- [ ] **Severity Definitions**
  - [ ] Critical: Exploit in progress, funds at risk
  - [ ] High: Vulnerability discovered, no active exploit
  - [ ] Medium: Minor issue, no immediate risk

- [ ] **Response Procedures**
  - [ ] Critical: Immediate pause, notify users, engage IR team
  - [ ] High: Prepare patch, coordinate disclosure, deploy fix (<24h)
  - [ ] Medium: Schedule fix in next release (<1 week)

- [ ] **Communication Plan**
  - [ ] Twitter/Discord announcement templates
  - [ ] User notification via app banner
  - [ ] Post-mortem publication timeline
  - [ ] Media contact (if needed)

### Multi-Sig Governance
- [ ] **Multi-Sig Setup**
  - [ ] 3-of-5 multi-sig for admin operations
  - [ ] Signers from different geographic regions
  - [ ] Hardware wallet enforcement for signers
  - [ ] Regular key rotation (every 6 months)

- [ ] **Governance Testing**
  - [ ] Test multi-sig transaction creation
  - [ ] Test signature collection process
  - [ ] Test transaction execution
  - [ ] Document governance procedures

---

## Phase 10: Continuous Security (Post-Mainnet)

### Ongoing Monitoring
- [ ] **Security Metrics Dashboard**
  - [ ] Test coverage percentage (target: >85%)
  - [ ] Bug bounty reports per month
  - [ ] Mean time to patch (target: <48h for high)
  - [ ] Security incidents (target: 0)

- [ ] **Automated Alerts**
  - [ ] On-chain monitoring for anomalous activity
  - [ ] Large withdrawals or swaps (>10% TVL)
  - [ ] Oracle price deviations
  - [ ] TEE failure rates

### Quarterly Security Reviews
- [ ] **Q1 Review (3 months post-launch)**
  - [ ] Review all incident reports
  - [ ] Update threat model based on learnings
  - [ ] Plan security improvements for next quarter

- [ ] **Annual Re-Audit**
  - [ ] Re-audit after major feature additions
  - [ ] Budget $50-80K for annual review
  - [ ] Focus on new code and integrations

---

## Checklist Summary

### Pre-Audit Readiness Score
Calculate readiness score: (Completed items / Total items in Phases 1-4) * 100%

**Target:** >90% before engaging audit firm

### Critical Blockers (Must Complete)
- [ ] All critical invariants implemented and tested
- [ ] Test coverage >85%
- [ ] Multi-source oracle integration complete
- [ ] Capability scoping with TTL implemented
- [ ] Hot potato pattern for flash operations
- [ ] Emergency pause mechanism functional

### Recommended (Highly Encouraged)
- [ ] Formal verification passing on all critical modules
- [ ] Fuzzing campaign completed (1M+ iterations)
- [ ] TEE replay protection implemented
- [ ] Sui Move Registry integration

### Nice-to-Have (Can Defer Post-Audit)
- [ ] Annual re-audit planned
- [ ] Testnet bug bounty completed
- [ ] Quarterly security review schedule

---

## Budget Breakdown

### Audit Costs
- **Primary Audit (OtterSec or SlowMist):** $80,000 - $120,000
- **Re-audit after fixes:** Included or +$10,000
- **Formal verification (Trail of Bits, if separate):** +$40,000

### Bug Bounty Reserve
- **Initial reserve:** $200,000 in USDC/USDT
- **Annual replenishment:** $50,000 - $100,000

### Total Security Budget (Year 1)
- **Low estimate:** $280,000 (audit $80K + bounty $200K)
- **High estimate:** $420,000 (audit $120K + formal verification $40K + bounty $200K + replenishment $60K)

**Recommended allocation:** $350,000 - $400,000

---

## Timeline Summary

### 3-Week Fast Track (Minimum)
- **Week 1:** Code quality, invariants, testing (Phase 1-2)
- **Week 2:** TEE security, documentation (Phase 3-4)
- **Week 3:** Audit firm engagement & handoff (Phase 5)

### 4-Week Recommended
- **Week 1:** Code quality, invariants (Phase 1)
- **Week 2:** Testing, fuzzing, verification (Phase 2)
- **Week 3:** TEE security, documentation (Phase 3-4)
- **Week 4:** Audit package prep & firm engagement (Phase 5)

### Audit Execution: 2-3 Weeks
### Post-Audit Fixes: 1-2 Weeks

**Total Timeline:** 6-9 weeks from start to mainnet-ready

---

## Continuous Improvement

This checklist should be treated as a living document:
- Update after each audit with lessons learned
- Add new checks as Sui ecosystem best practices evolve
- Remove deprecated items (e.g., if Move Prover becomes standard)
- Share with Sui DeFi community for feedback

**Last Review Date:** October 22, 2025
**Next Review Date:** Q1 2026 (post-mainnet launch)

---

*For questions or suggestions, contact the Carapace core team or open an issue in the repository.*
