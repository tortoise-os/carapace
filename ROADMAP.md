# Carapace Development Roadmap

> Completion roadmap for Phase 1 of TortoiseOS - Building the foundation for AI-powered DeFi on Sui

## Current Status

### ✅ Completed Features

**Frontend (Web App)**
- [x] Swap interface with real-time quote display
- [x] Token selector modal with search functionality
- [x] Settings dialog (RPC, Explorer, Gas budget, Ledger, Slippage)
- [x] Enhanced wallet connection with install detection
- [x] Pools listing page
- [x] Liquidity management UI (add/remove flows)
- [x] Toast notifications for user feedback
- [x] Responsive Magic UI components
- [x] Dark mode support

**Backend (API)**
- [x] Express server on Bun runtime
- [x] Real-time swap quote calculation
- [x] Pool data endpoints
- [x] CORS and security middleware

**Testing**
- [x] E2E tests with Playwright (7 tests passing)
- [x] Headless browser testing

**Smart Contracts (Move)**
- [x] AMM pool contract structure (pool.move)
- [x] Constant product formula implementation
- [x] LP token mechanics
- [x] Fee calculation logic
- [x] Math utilities (math.move)
- [x] Vault contract structure (vault.move)

**Infrastructure**
- [x] Monorepo with Bun workspace
- [x] TypeScript configuration
- [x] Development environment setup
- [x] Package structure (apps/packages)

---

## 🎯 Roadmap to Completion

### Phase 1A: Blockchain Integration (2-3 weeks)

**Priority: CRITICAL** - Required for MVP functionality

#### 1.1 Smart Contract Completion
- [ ] **Code Review & Benchmarking** (Sui DeFi references)
  - [ ] Clone and study Avocado DEX for clean reference implementation
  - [ ] Audit constant product math against Avocado's implementation
  - [ ] Review Cetus CLMM for advanced AMM patterns
  - [ ] Study flash swap implementation from Cetus
  - [ ] Port fixed-point math library from Avocado (Phase 1J integration)

- [ ] **Complete AMM pool.move contract**
  - [ ] Implement create_pool() function (reference: Avocado factory pattern)
  - [ ] Finalize add_liquidity() with proper math (audit vs Avocado)
  - [ ] Finalize remove_liquidity() with burn logic
  - [ ] Implement swap_x_to_y() and swap_y_to_x()
  - [ ] Add flash swap support (pattern from Cetus)
  - [ ] Implement slippage protection
  - [ ] Add emergency pause mechanism (pattern from Navi)
  - [ ] Protocol fee collection logic
  - [ ] Adopt versioned module design (Cetus pattern)

- [ ] **Complete TortoiseVault contract**
  - [ ] Implement deposit() function
  - [ ] Implement withdraw() function
  - [ ] Add share calculation logic (adapt Navi interest model)
  - [ ] Implement strategy allocation (isolated pools pattern from Navi)
  - [ ] Add rebalancing functions
  - [ ] Fee distribution mechanism
  - [ ] Health factor tracking (Navi liquidation pattern)
  - [ ] Risk parameter configuration per strategy
  - [ ] Emergency pause mechanism (Navi pattern)

- [ ] **Add contract tests**
  - [ ] Unit tests for pool operations (move/tests/)
  - [ ] Integration tests for vault
  - [ ] Edge case testing (zero amounts, overflow)
  - [ ] Gas optimization tests

#### 1.2 Contract Deployment
- [ ] **Set up deployment infrastructure**
  - [ ] Create deployment scripts (Taskfile.yml)
  - [ ] Configure Sui client
  - [ ] Set up wallet management
  - [ ] Environment variable configuration

- [ ] **Deploy to networks**
  - [ ] Local Sui network deployment
  - [ ] Testnet deployment
  - [ ] Verify contract addresses
  - [ ] Document deployed addresses

#### 1.3 SDK Integration
- [ ] **Study SDK architectures** (Sui DeFi references)
  - [ ] Review Cetus SDK transaction builder patterns
  - [ ] Study type safety and error handling from Cetus
  - [ ] Analyze Turbos frontend SDK for real-time quotes
  - [ ] Document SDK design decisions

- [ ] **Build TypeScript SDK (packages/sdk/)**
  - [ ] Pool interaction functions
  - [ ] Vault interaction functions
  - [ ] Transaction building utilities (Cetus PTB patterns)
  - [ ] Event parsing/listening
  - [ ] Type definitions for contracts
  - [ ] Real-time quote system (Turbos pattern)

- [ ] **Transaction Execution**
  - [ ] Implement actual swap execution (replace preview mode)
  - [ ] Add liquidity transaction builder
  - [ ] Remove liquidity transaction builder
  - [ ] Coin selection logic
  - [ ] Multi-coin merging/splitting
  - [ ] Gas estimation

- [ ] **Wallet Integration**
  - [ ] Connect wallet functionality
  - [ ] Sign and execute transactions
  - [ ] Transaction status tracking
  - [ ] Error handling and retry logic
  - [ ] User balance fetching

#### 1.4 On-chain Data Fetching
- [ ] **Implement blockchain queries**
  - [ ] Fetch real pool data from chain
  - [ ] Get user LP token balances
  - [ ] Query transaction history
  - [ ] Listen to pool events
  - [ ] Real-time price updates

- [ ] **Update API with on-chain data**
  - [ ] Replace mock pools with real data
  - [ ] Implement caching layer (Redis/Memory)
  - [ ] Add indexer for historical data
  - [ ] WebSocket support for real-time updates

---

### Phase 1B: Token Management (1-2 weeks)

**Priority: HIGH** - Required for full functionality

#### 2.1 Token Registry
- [ ] **Create token whitelist system**
  - [ ] Token metadata structure
  - [ ] Verified token list
  - [ ] Token icon/logo storage
  - [ ] Price feed integration

- [ ] **Token discovery**
  - [ ] Fetch all user-owned coins
  - [ ] Display real token balances
  - [ ] Token approval/allowance (if needed)
  - [ ] Custom token import functionality

#### 2.2 Price Oracles
- [ ] **Study oracle patterns** (Sui DeFi references)
  - [ ] Review Navi's multi-oracle aggregation strategy
  - [ ] Study Cetus TWAP implementation for on-chain prices
  - [ ] Benchmark oracle latency and costs (Pyth vs Switchboard)

- [ ] **Integrate price feeds**
  - [ ] Connect to Sui price oracles
  - [ ] Pyth Network integration (primary, pattern from Navi)
  - [ ] Switchboard integration (fallback, pattern from Navi)
  - [ ] Multi-source median calculation (Navi pattern)
  - [ ] On-chain TWAP for internal pools (Cetus pattern)
  - [ ] USD price display for all tokens

---

### Phase 1C: Pool Management Features (1 week)

**Priority: MEDIUM** - Enhanced functionality

#### 3.1 Pool Creation
- [ ] **Study factory patterns** (Sui DeFi references)
  - [ ] Review Avocado's deterministic pool creation
  - [ ] Study Cetus factory for registry management
  - [ ] Benchmark pool creation gas costs

- [ ] **Pool factory UI**
  - [ ] Create new pool interface
  - [ ] Token pair selection
  - [ ] Initial liquidity provision
  - [ ] Fee tier selection (study Cetus multi-tier approach)
  - [ ] Pool deployment transaction
  - [ ] Deterministic address derivation (Avocado + Phase 1J pattern)

#### 3.2 Pool Analytics
- [ ] **Pool statistics**
  - [ ] Total value locked (TVL)
  - [ ] 24h volume
  - [ ] 7d volume
  - [ ] APR/APY calculations
  - [ ] Price impact visualization
  - [ ] Historical charts

---

### Phase 1D: Advanced Features (2-3 weeks)

**Priority: MEDIUM** - Enhanced UX

#### 4.1 Multi-hop Swaps
- [ ] **Routing engine**
  - [ ] Path finding algorithm
  - [ ] Best price calculation across pools
  - [ ] Multi-hop transaction builder
  - [ ] Route visualization

#### 4.2 Transaction History
- [ ] **User activity tracking**
  - [ ] Swap history
  - [ ] Liquidity provision history
  - [ ] Earnings/rewards tracking
  - [ ] Export to CSV

#### 4.3 Analytics Dashboard
- [ ] **Protocol metrics**
  - [ ] Total liquidity across all pools
  - [ ] Total volume (24h, 7d, 30d)
  - [ ] Unique users
  - [ ] Fee revenue
  - [ ] Top pools by volume/TVL

---

### Phase 1E: Vault Implementation (2-3 weeks)

**Priority: HIGH** - Core Phase 1 feature
**Reference**: See [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md) Section 2 (Navi Lending)

#### 5.0 Code Review - Navi Protocol
- [ ] **Deep dive into Navi lending** (full week recommended)
  - [ ] Clone and build Navi Protocol locally
  - [ ] Study isolated pool risk management architecture
  - [ ] Analyze interest rate models for share pricing patterns
  - [ ] Review liquidation health factor calculations
  - [ ] Study oracle integration for multi-strategy evaluation
  - [ ] Document risk parameter management patterns
  - [ ] Benchmark lending vs vault tradeoffs

#### 5.1 Vault UI
- [ ] **Vault interface**
  - [ ] Deposit interface
  - [ ] Withdraw interface
  - [ ] Portfolio overview
  - [ ] Strategy performance metrics
  - [ ] Historical returns chart

#### 5.2 Auto-Compounding Logic
- [ ] **Implement compounding**
  - [ ] Harvest rewards function
  - [ ] Reinvest logic
  - [ ] Gas optimization
  - [ ] Compound frequency optimization

#### 5.3 Multi-Strategy Support
- [ ] **Strategy management**
  - [ ] Multiple yield strategies
  - [ ] Strategy allocation UI
  - [ ] Rebalancing interface
  - [ ] Risk metrics per strategy

---

### Phase 1F: AI/ML Integration (3-4 weeks)

**Priority: MEDIUM** - Differentiator feature
**Reference**: See [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md) Section 5 (Sui-AI-Agent-Kit)

#### 6.0 Code Review - AI Agent Kit
- [ ] **Deep dive into Sui-AI-Agent-Kit** (Weeks 10-11)
  - [ ] Clone and explore AI Agent Kit repository
  - [ ] Study MCP tool architecture for DeFi automation
  - [ ] Review capability-based access patterns
  - [ ] Analyze Walrus Storage integration for ML models
  - [ ] Test Nautilus TEE setup and attestation
  - [ ] Compare capability patterns with Percolator research
  - [ ] Prototype MCP tools for vault automation

#### 6.0A Code Review - awesome-seal Ecosystem
**Reference**: See [AWESOME_SEAL_EVALUATION.md](./AWESOME_SEAL_EVALUATION.md) for comprehensive analysis
**Time Saved**: 5-7 weeks across Phase 1F and Phase 1K

- [ ] **Deep dive into Nautilus enclave patterns** (Week 10)
  - [ ] Clone and study Lockin Bot zero-trust key vault architecture
  - [ ] Review attestation and verification patterns for TEE
  - [ ] Document enclave-to-chain communication protocols
  - [ ] Benchmark vs. custom TEE implementation (estimated 2-3 weeks saved)
  - [ ] Study secure key management for RL model signing
  - [ ] Test attestation verification flows

- [ ] **Integrate Seal Rust SDK** (Week 11)
  - [ ] Add Seal Rust SDK to packages/sdk/
  - [ ] Create encryption wrapper for Walrus client
  - [ ] Implement encrypted model upload/download flow
  - [ ] Test access control for model decryption (TEE-only access)
  - [ ] Add hash verification for tamper detection
  - [ ] Estimated time saved: 1-2 weeks vs. custom encryption

- [ ] **Study Tusky token-gated access patterns** (Week 12)
  - [ ] Review token-gated vault access control implementation
  - [ ] Design tiered vault access (Basic/Premium/Institutional)
  - [ ] Integrate with ARG (Aggressor Roundtrip Guards) for LP rewards
  - [ ] Prototype LP-token threshold checks
  - [ ] Plan revenue model for premium vault features

- [ ] **Integrate Decryptable Move Enum** (Week 12)
  - [ ] Add decryptable_enum to Move dependencies
  - [ ] Implement encrypted vault strategy parameters
  - [ ] Test time-released strategy disclosure (transparency + MEV protection)
  - [ ] Add decryption logic for TEE-only access during active epoch
  - [ ] Estimated time saved: 1 week vs. custom implementation

#### 6.1 Dynamic Fee Optimization
- [ ] **ML model for fee adjustment**
  - [ ] Volatility prediction model
  - [ ] Train on historical Sui data
  - [ ] Deploy model to Walrus Storage (with Seal encryption - see 6.0A)
  - [ ] Store encrypted blob hash on-chain for tamper detection
  - [ ] Integrate fee adjustment in contract

#### 6.2 Vault Strategy Optimizer
- [ ] **RL optimizer in Nautilus TEE**
  - [ ] Set up Nautilus TEE environment (apply Lockin Bot patterns - see 6.0A)
  - [ ] Implement zero-trust key management for model signing
  - [ ] Implement RL agent
  - [ ] Strategy performance tracking
  - [ ] Secure execution framework with attestation verification
  - [ ] Risk-adjusted optimization
  - [ ] Token-gated premium vault access (Tusky pattern - see 6.0A)

#### 6.3 Performance Analytics
- [ ] **AI-powered insights**
  - [ ] Pool performance predictions
  - [ ] Optimal liquidity provision suggestions
  - [ ] Impermanent loss forecasting

#### 6.4 Scoped Capabilities for AI (Percolator + AI Agent Kit + awesome-seal)
- [ ] **Secure AI interaction framework**
  - [ ] Replace direct TEE calls with capability-based access
  - [ ] Issue TTL-limited tokens for RL optimizer (Percolator pattern)
  - [ ] Verify via Sui's zkLogin or object signatures
  - [ ] Add replay protection for Walrus-stored models (Seal attestation patterns)
  - [ ] Integrate MCP tools from AI Agent Kit
  - [ ] Implement simulation-first execution (AI Agent Kit pattern)
  - [ ] Integrate ARG taxation with RL (anti-toxicity)
  - [ ] Use Decryptable enums for private strategy parameters (awesome-seal - see 6.0A)

---

### Phase 1G: Testing & Quality (2-3 weeks)

**Priority: CRITICAL** - Required before mainnet
**Reference**: See [SECURITY_AUDIT_GUIDE.md](./SECURITY_AUDIT_GUIDE.md) for comprehensive security best practices

#### 7.1 Comprehensive Testing
- [ ] **Unit tests**
  - [ ] Frontend component tests (React Testing Library)
  - [ ] API endpoint tests
  - [ ] SDK function tests
  - [ ] Utility function tests

- [ ] **Integration tests**
  - [ ] End-to-end swap flow
  - [ ] Liquidity provision flow
  - [ ] Vault deposit/withdraw flow
  - [ ] Multi-user scenarios

- [ ] **Move contract tests**
  - [ ] Expand pool_tests.move
  - [ ] Vault contract tests
  - [ ] Formal verification (if possible)

#### 7.2 Security
- [ ] **Security measures**
  - [ ] Input validation
  - [ ] Access control verification
  - [ ] Reentrancy protection (inherent in Move)
  - [ ] Integer overflow/underflow checks
  - [ ] Fixed-point math precision validation
  - [ ] Oracle manipulation resistance testing
  - [ ] Capability scoping with TTL enforcement
  - [ ] Invariant verification for all critical operations
  - [ ] External security audit (OtterSec recommended - see Phase 1K)

#### 7.3 Performance Optimization
- [ ] **Frontend optimization**
  - [ ] Code splitting
  - [ ] Image optimization
  - [ ] Bundle size reduction
  - [ ] Lighthouse score > 90

- [ ] **Backend optimization**
  - [ ] API response caching
  - [ ] Database query optimization
  - [ ] Rate limiting
  - [ ] Load testing

---

### Phase 1J: Percolator-Inspired Enhancements (2-3 weeks)

**Priority: HIGH** - Security, scalability, and MEV protection
**Reference**: See [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md) for detailed analysis

> Based on research from the Percolator perpetual futures exchange (Solana), this phase integrates battle-tested innovations for risk management, anti-toxicity, scalability, and security into Carapace's AMM and vault infrastructure.

#### 7J.1 Risk Management and Liquidation Handling
- [ ] **Fixed-point math precision**
  - [ ] Port Percolator's 6-decimal fixed-point library to Move
  - [ ] Standardize basis-point calculations across contracts
  - [ ] Integrate with fee calculation and PnL tracking
  - [ ] Unit tests for precision edge cases

- [ ] **Liquidation detection framework**
  - [ ] Implement monotone increasing initial margin (IM) model
  - [ ] Add kill-band parameters to pool configuration
  - [ ] Integrate off-chain RL signals for liquidation prediction
  - [ ] Test partial/full liquidation triggers

- [ ] **Cross-pool netting architecture (vault)**
  - [ ] Design global position registry using shared objects
  - [ ] Track user exposures across pools and external protocols
  - [ ] Add pre-compound margin ratio checks
  - [ ] Implement equity aggregation logic

#### 7J.2 Anti-Toxicity and MEV Protections
- [ ] **Batch processing for swaps**
  - [ ] Implement batch epochs (1-2 block delay)
  - [ ] Group liquidity operations and swaps
  - [ ] AI-driven batch sizing based on volatility
  - [ ] Leverage Sui's programmable transaction blocks
  - [ ] Two-phase reserve/commit flow

- [ ] **Aggressor roundtrip guards (ARG)**
  - [ ] Track rapid deposit-withdraw cycles in vault
  - [ ] Implement 10K ring buffer for aggressor detection
  - [ ] Apply dynamic fees via RL in TEE
  - [ ] Reward long-term LPs with reduced fees

- [ ] **Non-replay protection**
  - [ ] Add nonces to capabilities for off-chain AI calls
  - [ ] Integrate with existing TEE security framework
  - [ ] Test replay attack vectors

#### 7J.3 Scalability and Resource Efficiency
- [ ] **Code Review - Turbos Finance** (Week 7)
  - [ ] Clone and explore Turbos hybrid DEX
  - [ ] Study sharded pool implementation in detail
  - [ ] Review batch settlement patterns for gas savings
  - [ ] Analyze gas optimization techniques (state access)
  - [ ] Benchmark hybrid orderbook-AMM model
  - [ ] Document sharding lessons in `docs/architecture/sharding.md`

- [ ] **Sharded liquidity pools design**
  - [ ] Design per-token-pair shard architecture (Turbos + Percolator)
  - [ ] Dynamic sharding based on TVL/volume metrics
  - [ ] Central router for cross-shard swaps (Turbos pattern)
  - [ ] Leverage Sui's parallel execution model
  - [ ] Address cross-shard liquidity fragmentation
  - [ ] Compare Turbos (horizontal) vs Percolator (slab) sharding

- [ ] **Memory-optimized vault strategies**
  - [ ] Adopt freelist-based allocators in Move
  - [ ] Cap state growth for reward tracking
  - [ ] Set instrument limits per slab (32 baseline)
  - [ ] Use Sui's gas metering for budget enforcement

- [ ] **Shard testing infrastructure**
  - [ ] Extend Taskfile.yml for shard simulation
  - [ ] Create local multi-shard test environment
  - [ ] Add performance benchmarks
  - [ ] Parallel execution stress tests

#### 7J.4 Security and Capability Models
- [ ] **Enhanced object derivation**
  - [ ] Implement PDA-like helpers for Sui objects
  - [ ] Derive vault escrows deterministically
  - [ ] Add versioned registries for upgrade safety
  - [ ] Document object ID generation patterns

- [ ] **Invariant checks and assertions**
  - [ ] Add comprehensive invariant checks to Move contracts
  - [ ] Verify scoped debits ≤ escrow limits
  - [ ] Check reserve ratios remain within bounds
  - [ ] Validate all state transitions
  - [ ] Integrate with audit preparation

- [ ] **Documentation and research**
  - [ ] Complete Percolator research analysis
  - [ ] Document Sui-specific adaptations
  - [ ] Open questions and trade-off analysis
  - [ ] Cross-protocol collaboration opportunities

---

### Phase 1K: Security Audit Preparation (3-4 weeks)

**Priority: CRITICAL** - Required before mainnet launch
**Reference**: See [SECURITY_AUDIT_GUIDE.md](./SECURITY_AUDIT_GUIDE.md) for detailed guidelines

#### 7K.1 Pre-Audit Security Hardening
- [ ] **Move-specific security enhancements**
  - [ ] Implement hot potato pattern for all flash operations
  - [ ] Add TTL expiry to all admin capabilities
  - [ ] Implement capability rotation mechanism (90-day cycles)
  - [ ] Multi-sig enforcement for critical operations (>5% TVL)
  - [ ] Capability action allowlists

- [ ] **Oracle security**
  - [ ] Integrate 3+ oracle sources (Pyth, Switchboard, Supra)
  - [ ] Implement 30-second freshness checks
  - [ ] Median pricing to resist manipulation
  - [ ] Circuit breakers for >10% price deviations

- [ ] **Precision and invariant checks**
  - [ ] Use 1e12 precision for all fee calculations
  - [ ] Add invariant checks after every swap/liquidity change
  - [ ] Unit test boundary cases (dust amounts, max values)
  - [ ] Verify pool constant product: reserve_x * reserve_y ≥ k_last
  - [ ] Verify vault solvency: total_shares * share_price ≤ total_assets

- [ ] **Cross-pool safety (TortoiseVault)**
  - [ ] Validate atomicity in multi-pool operations
  - [ ] Implement all-or-nothing PTB execution
  - [ ] Verify vault health after rebalancing

#### 7K.2 Move Registry & Transparency
- [ ] **On-chain registry integration**
  - [ ] Register all Carapace packages in Sui Move Registry
  - [ ] Set up GitHub Actions for registry verification on PRs
  - [ ] Monitor registry alerts for dependency vulnerabilities
  - [ ] Enable real-time vulnerability scanning

#### 7K.3 Formal Verification
- [ ] **Implement formal verification**
  - [ ] Write formal specs for all critical invariants
  - [ ] Pool constant product formula verification
  - [ ] Vault solvency verification
  - [ ] Flash loan atomicity verification
  - [ ] RL fee bounds verification (0.01% - 1%)
  - [ ] Run Move Prover in CI (warnings allowed initially)
  - [ ] Document all assumptions in module comments

#### 7K.4 Comprehensive Testing
- [ ] **Pre-audit test suite**
  - [ ] Complete unit tests for all public functions (>80% coverage)
  - [ ] End-to-end swap scenarios including edge cases
  - [ ] Multi-user vault deposit/withdrawal stress tests
  - [ ] Oracle failure simulations
  - [ ] Network partition scenarios for TEE communication
  - [ ] Gas optimization benchmarks (target <1M gas per swap)

- [ ] **Fuzzing and property testing**
  - [ ] Implement property-based tests for all invariants
  - [ ] Run fuzzing campaigns (1M+ iterations)
  - [ ] Test with randomized transaction orderings
  - [ ] Simulate malicious behaviors (sandwich attacks, front-running)

#### 7K.5 TEE-Specific Security
- [ ] **Nautilus TEE hardening**
  - [ ] Use Intel SGX attestation for TEE verification
  - [ ] Implement nonce-based replay protection
  - [ ] Rate-limit RL model updates (max 1 per epoch)
  - [ ] Store model hashes on Walrus for tamper detection

- [ ] **RL model safety**
  - [ ] Hard-code fee bounds (0.01% - 1%) in contract
  - [ ] Implement circuit breakers for >3 std dev deviations
  - [ ] Fallback to static fees if TEE unreachable
  - [ ] Test adversarial input scenarios

- [ ] **Walrus storage integrity**
  - [ ] Store redundant copies across Walrus epochs
  - [ ] Verify blob hash before loading model
  - [ ] Cache last-known-good model in contract

#### 7K.5A awesome-seal Security Enhancements
**Reference**: See [AWESOME_SEAL_EVALUATION.md](./AWESOME_SEAL_EVALUATION.md) Section 7

- [ ] **TEE attestation hardening (Lockin Bot patterns)**
  - [ ] Apply Lockin Bot zero-trust key vault architecture
  - [ ] Implement comprehensive enclave attestation verification
  - [ ] Test enclave compromise scenarios and fallback mechanisms
  - [ ] Verify master keys never leave enclave (zero-trust principle)
  - [ ] Add derived key rotation for model signing (90-day cycles)

- [ ] **Encrypted storage integrity (Seal SDK)**
  - [ ] Use Seal Rust SDK for all RL model encryption
  - [ ] Verify encrypted blob hashes on retrieval (tamper detection)
  - [ ] Test tamper detection mechanisms with corrupted blobs
  - [ ] Implement TEE-only decryption access control
  - [ ] Add encrypted model version tracking

- [ ] **Token-gated access security (Tusky patterns)**
  - [ ] Validate LP token balance verification is flash-loan resistant
  - [ ] Implement time-weighted LP balance checks (prevent MEV)
  - [ ] Add minimum lock periods for premium vault access
  - [ ] Test token-gating bypass attempts (flash loans, re-entrancy)
  - [ ] Document premium vault access control in audit scope

- [ ] **Decryptable enum security**
  - [ ] Audit decryption logic for capability bypass vulnerabilities
  - [ ] Test time-released strategy disclosure mechanisms
  - [ ] Verify TEE-only access during active epochs
  - [ ] Add replay protection for decryption requests
  - [ ] Document encrypted parameter security model

- [ ] **Bug bounty infrastructure (Dominion Lancer patterns)**
  - [ ] Study Dominion Lancer TEE-based escrow architecture
  - [ ] Design trustless researcher reward system (optional enhancement)
  - [ ] Launch testnet bug bounty before main audit
  - [ ] Engage Seal ecosystem security researcher network
  - [ ] Create vulnerability disclosure process with enclave verification

#### 7K.6 Audit Firm Engagement
- [ ] **Primary audit preparation**
  - [ ] Create comprehensive documentation package
  - [ ] Prepare threat model for TEE integration
  - [ ] Document all admin capabilities and privileges
  - [ ] Test emergency pause mechanisms
  - [ ] Engage OtterSec or SlowMist ($80-120K budget)

- [ ] **Audit execution**
  - [ ] 2-week code freeze during audit
  - [ ] Daily standups with audit team
  - [ ] Address all findings before testnet launch
  - [ ] Public disclosure of audit report

- [ ] **Bug bounty program**
  - [ ] Launch via Hacken or Immunefi ($200K+ reserve)
  - [ ] Tiered rewards: Critical ($50K), High ($20K), Medium ($5K)
  - [ ] Testnet bug bounty for initial validation
  - [ ] Community security review period (2 weeks)

#### 7K.7 Emergency Response Planning
- [ ] **Incident response framework**
  - [ ] Implement pause mechanism in all critical modules
  - [ ] Test pause/unpause procedures monthly
  - [ ] Establish multi-sig unpause process (3-of-5)
  - [ ] Create incident response plan with 24-hour SLA
  - [ ] Define severity levels and response times

- [ ] **Security metrics tracking**
  - [ ] Set up test coverage monitoring (target: >85%)
  - [ ] Track critical findings resolved (target: 100% before mainnet)
  - [ ] Monitor bug bounty payouts
  - [ ] Track mean time to patch (target: <48 hours for high severity)

#### 7K.8 Sui-Specific Vulnerability Mitigation
- [ ] **Common anti-patterns avoided**
  - [ ] No unbounded loops (implement batched processing)
  - [ ] Minimize shared object contention (use sharded design)
  - [ ] Capability-gated mutations only
  - [ ] No missing access controls on public functions

- [ ] **Sui ecosystem best practices**
  - [ ] Review and apply patterns from audited protocols (Cetus, Turbos, MMT Finance)
  - [ ] Study recent audit reports from OtterSec, SlowMist
  - [ ] Join Sui Security Working Group (Discord)
  - [ ] Attend Sui Foundation security office hours

---

### Phase 1H: DevOps & Deployment (1-2 weeks)

**Priority: HIGH** - Production readiness

#### 8.1 CI/CD Pipeline
- [ ] **Automated workflows**
  - [ ] GitHub Actions for testing
  - [ ] Automated contract testing
  - [ ] E2E test runs on PR
  - [ ] Automated deployments

#### 8.2 Monitoring & Logging
- [ ] **Observability**
  - [ ] Error tracking (Sentry)
  - [ ] Application monitoring
  - [ ] Smart contract event monitoring
  - [ ] Alert system for critical errors

#### 8.3 Infrastructure
- [ ] **Production deployment**
  - [ ] Frontend hosting (Vercel/Cloudflare)
  - [ ] API server deployment
  - [ ] Database setup (PostgreSQL)
  - [ ] Redis for caching
  - [ ] CDN configuration

---

### Phase 1I: Documentation & Community (1 week)

**Priority: MEDIUM** - User adoption

#### 9.1 Documentation
- [ ] **User guides**
  - [ ] How to swap tokens
  - [ ] How to provide liquidity
  - [ ] How to use vaults
  - [ ] FAQ section

- [ ] **Developer docs**
  - [ ] SDK documentation
  - [ ] API reference
  - [ ] Smart contract docs
  - [ ] Integration guide

#### 9.2 Community Building
- [ ] **Launch materials**
  - [ ] Announcement blog post
  - [ ] Twitter launch thread
  - [ ] Discord community setup
  - [ ] Tutorial videos

---

### Phase 1M: Heimdahl.xyz Data Integration (Ongoing)

**Priority: HIGH** - Enhanced data infrastructure for AI/ML and analytics
**Reference**: [Heimdahl.xyz Documentation](https://heimdahl.xyz)

> Heimdall.xyz is a blockchain data indexing and aggregation platform offering real-time access to on-chain events via high-performance REST APIs, WebSocket streams, and CLI tools. Supports multi-chain data sourcing with millisecond-latency updates—ideal for DeFi monitoring, RL model training, and cross-chain operations.

#### 1M.1 Real-Time Monitoring for TortoiseSwap (Phase 1 - Core)

**Goal**: Feed live liquidity events into RL fee optimizer for dynamic fee adjustments

- [ ] **CLI-based event monitoring (Weeks 1-2)**
  - [ ] Verify Heimdahl Sui support or request beta access via [contact form](https://forms.gle/YeNyCconLAWH21Bu6)
  - [ ] Install Heimdahl CLI: `npm install -g @heimdahl/cli`
  - [ ] Track pool Transfer/Mint/Burn events on testnet
  - [ ] Create Taskfile.yml script for automated event queries
  - [ ] Pipe event data to Bun backend for real-time processing

- [ ] **Integration with RL fee optimizer**
  - [ ] Parse liquidity events (add/remove liquidity, swaps)
  - [ ] Feed real-time data into TEE-based RL model
  - [ ] Implement batch epoch triggers based on volatility signals
  - [ ] Add fallback to Sui JSON-RPC if Heimdahl unavailable

- [ ] **Cross-chain liquidity monitoring**
  - [ ] Track USDT/USDC transfers across EVM chains and Sui
  - [ ] Detect arbitrage opportunities for TortoiseArb (Phase 2 prep)
  - [ ] Aggregate multi-chain data for unified dashboard

- [ ] **Infrastructure setup**
  - [ ] Docker-compose orchestration for CLI + backend integration
  - [ ] WebSocket subscription for sub-second event streams
  - [ ] API key management and rate limiting
  - [ ] Monitoring dashboard in Next.js frontend

**Files to Create/Modify**:
- `apps/api/src/services/heimdahl/event-monitor.ts` (create)
- `apps/api/src/services/heimdahl/cli-wrapper.ts` (create)
- `Taskfile.yml` (add Heimdahl event query tasks)
- `apps/web/components/analytics/liquidity-monitor.tsx` (create)

**Expected Impact**: 20-30% better capital efficiency in flash swaps; real-time MEV protection via batch epochs (Phase 1J integration)

#### 1M.2 AI-Driven Yield Optimization in TortoiseVault (Phase 2 - Scale/Arb)

**Goal**: Use aggregated on-chain data for RL model training and rebalancing decisions

- [ ] **Historical data aggregation (Weeks 4-6)**
  - [ ] Query aggregated Transfer events from vault escrows via REST API
  - [ ] Fetch DAI/USDC/USDT-equivalent asset flows on Sui
  - [ ] Store datasets in Walrus for TEE-accessible training data
  - [ ] Implement fixed-point precision for PnL calculations (Phase 1J integration)

- [ ] **Real-time vault analytics**
  - [ ] WebSocket streams for deposit/withdrawal events
  - [ ] Calculate unrealized PnL with 6-decimal fixed-point math (Percolator pattern)
  - [ ] Pre-compound margin ratio checks (Phase 1J cross-pool netting)
  - [ ] Anomaly detection via RL signals in TEE

- [ ] **Multi-chain exposure netting**
  - [ ] Aggregate Sui vault positions + EVM RWA positions (if Phase 3 active)
  - [ ] Net exposures across chains for risk management
  - [ ] Liquidation prediction via off-chain RL (Phase 1J integration)
  - [ ] Circuit breakers for >10% price deviations

- [ ] **Automated rebalancing**
  - [ ] CLI scripts in Taskfile.yml for daily model retraining
  - [ ] Store aggregated datasets in Walrus (hash verification)
  - [ ] Trigger rebalancing via capability-gated transactions
  - [ ] Monitor rebalancing performance vs. benchmarks

**Files to Create/Modify**:
- `apps/api/src/services/heimdahl/vault-analytics.ts` (create)
- `packages/sdk/src/heimdahl-client.ts` (create)
- `apps/api/src/services/ml/dataset-aggregator.ts` (create)
- `move/sources/vault/rebalancing.move` (update with Heimdahl triggers)

**Expected Impact**: 15% enhanced auto-compounding yields through predictive analytics; reduced liquidation risk

#### 1M.3 Security and Compliance Upgrades (Phase 2 - Ongoing)

**Goal**: Minimize oracle risks and provide audit trails for all vault/pool interactions

- [ ] **Event auditing and replay protection**
  - [ ] Stream all vault deposit/withdraw events for anomaly detection
  - [ ] Store event logs in PostgreSQL for compliance
  - [ ] Add replay protection nonces to event signatures (Phase 1J pattern)
  - [ ] Integrate with OtterSec-style fuzzing for security validation

- [ ] **Oracle manipulation resistance**
  - [ ] Use Heimdahl's direct node sourcing to verify oracle prices
  - [ ] Compare Pyth/Switchboard prices against Heimdahl on-chain events
  - [ ] Detect price manipulation via cross-oracle discrepancies
  - [ ] Circuit breakers for oracle staleness (>30 seconds)

- [ ] **Compliance monitoring for stablecoin flows**
  - [ ] Track USDC/USDT flows across Sui and EVM chains
  - [ ] Flag large transfers (>$100K) for manual review
  - [ ] Export audit logs for regulatory hooks (BTCfi Phase 3)
  - [ ] Add API key auth with non-replay nonces (Phase 1J security)

**Files to Create/Modify**:
- `apps/api/src/services/security/audit-logger.ts` (create)
- `apps/api/src/services/heimdahl/oracle-verifier.ts` (create)
- `apps/api/src/middleware/auth-middleware.ts` (update with API key validation)

**Expected Impact**: Reduced exploit surface; faster audit cycles with verifiable data logs

#### 1M.4 Cross-Chain Arbitrage Signals (Phase 2 - TortoiseArb)

**Goal**: Detect arbitrage opportunities across Sui and EVM chains for TortoiseArb module

- [ ] **Multi-chain event aggregation**
  - [ ] Subscribe to WebSocket streams for Ethereum, Arbitrum, Base, and Sui
  - [ ] Aggregate USDT/USDC/SUI price data across chains
  - [ ] Calculate cross-chain price discrepancies in real-time
  - [ ] Store arbitrage opportunities in Redis cache (30s TTL)

- [ ] **Arbitrage signal generation**
  - [ ] Detect >0.5% price gaps between chains
  - [ ] Calculate profitability after gas/bridge fees
  - [ ] Prioritize signals by liquidity depth and execution speed
  - [ ] Push alerts to TortoiseArb execution engine

- [ ] **Integration with bridge protocols**
  - [ ] Study Wormhole/LayerZero integration patterns
  - [ ] Build transaction builders for cross-chain swaps
  - [ ] Implement slippage protection across bridges
  - [ ] Monitor bridge performance and downtime

**Files to Create/Modify**:
- `apps/api/src/services/arbitrage/signal-detector.ts` (create)
- `apps/api/src/services/heimdahl/multi-chain-client.ts` (create)
- `packages/sdk/src/arbitrage-client.ts` (create)
- `apps/web/app/(dashboard)/arbitrage/page.tsx` (create)

**Expected Impact**: Unlock TortoiseArb functionality; capture cross-chain arbitrage opportunities with <2s execution time

#### 1M.5 Heimdahl SDK Integration (Ongoing)

**Goal**: Leverage Heimdahl's JS/Golang SDKs for frontend/CLI automation

- [ ] **JavaScript SDK integration**
  - [ ] Add Heimdahl JS SDK to `packages/sdk/`
  - [ ] Wrap event queries in React hooks (`useHeimdahlEvents`)
  - [ ] Real-time dashboard updates via WebSocket subscriptions
  - [ ] Error handling and reconnection logic

- [ ] **CLI automation tools**
  - [ ] Fork Heimdahl CLI for custom Sui node integration (if needed)
  - [ ] Create custom scripts for testnet monitoring
  - [ ] Automate daily data exports for RL model training
  - [ ] Add to CI/CD pipeline for integration testing

- [ ] **Testing and validation**
  - [ ] Unit tests for Heimdahl client wrappers
  - [ ] Integration tests with testnet event streams
  - [ ] Performance benchmarks (latency, throughput)
  - [ ] Fallback testing when Heimdahl unavailable

**Files to Create/Modify**:
- `packages/sdk/src/heimdahl/` (create directory)
- `apps/web/lib/hooks/use-heimdahl-events.ts` (create)
- `scripts/heimdahl-monitor.sh` (create for CLI automation)

**Expected Impact**: Unified data layer for Tortoise-OS; improved developer experience with standardized APIs

---

### Phase 1L: Competitive Intelligence & Market Positioning (Ongoing)

**Priority: MEDIUM** - Strategic awareness
**Reference**: See [SUI_DEFI_COMPETITIVE_LANDSCAPE.md](./SUI_DEFI_COMPETITIVE_LANDSCAPE.md) for detailed analysis

#### 7L.1 Competitor Analysis (Q4 2025 - Q1 2026 Launches)
- [ ] **MMT Finance monitoring (Launch: Oct 30, 2025)**
  - [ ] Review CLMM implementation post-launch
  - [ ] Study ve(3,3) tokenomics for SHELL governance
  - [ ] Monitor gas optimization techniques
  - [ ] Analyze cross-chain bridge patterns

- [ ] **EnsoFi analysis (Launched: Oct 22, 2025)**
  - [ ] Attend EnsoFi AMAs for agent architecture insights
  - [ ] Evaluate EDAS compatibility with TortoiseVault RL
  - [ ] Explore partnership for lending integration
  - [ ] Compare AI agent approach vs. Carapace's TEE-secured RL

- [ ] **Aster DEX review (Launch: Q4 2025)**
  - [ ] Benchmark execution speed against TortoiseSwap
  - [ ] Review MEV protection code for arbitrage module
  - [ ] Study Hyperliquid integration patterns
  - [ ] Consider liquidity routing integration

- [ ] **FlowX Finance integration (Major upgrades: Jan 2026)**
  - [ ] Evaluate FlowX SDK for TortoiseSwap integration
  - [ ] Analyze adaptive pool algorithms for RL fee optimization
  - [ ] Explore partnership for oracle data feeds
  - [ ] Study modular liquidity layer design

- [ ] **AftermathFi deep dive (V2 Launch: Q1 2026)**
  - [ ] Conduct architecture analysis post-V2 launch
  - [ ] Benchmark vault performance against TortoiseVault
  - [ ] Identify differentiation opportunities (TEE, verifiable RL)
  - [ ] Study RWA integration approach for Phase 3

#### 7L.2 Strategic Differentiation
- [ ] **Unique value propositions**
  - [ ] Document TEE-secured computation advantage
  - [ ] Emphasize transparent AI (Walrus-stored models)
  - [ ] Highlight MEV resistance via RL strategies
  - [ ] Promote academic rigor and research-driven approach

- [ ] **Collaboration opportunities**
  - [ ] Identify liquidity aggregation partnerships (FlowX, MMT)
  - [ ] Explore lending integration (EnsoFi)
  - [ ] Shared oracle networks (Aster, FlowX)
  - [ ] Joint bug bounty programs with established projects

#### 7L.3 Ecosystem Engagement
- [ ] **Events and networking**
  - [ ] Attend Sui Basecamp 2025 (Dubai)
  - [ ] Monitor major protocol launches (MMT Oct 30, etc.)
  - [ ] Join project Discord/Telegram for technical discussions
  - [ ] Participate in Sui DeFi working groups

- [ ] **Market intelligence**
  - [ ] Track Sui DeFi TVL growth (DefiLlama)
  - [ ] Monitor Sui Foundation ecosystem reports
  - [ ] Study community-first distribution trends
  - [ ] Analyze cross-chain liquidity patterns

#### 7L.4 Competitive Benchmarking (Quarterly Updates)
- [ ] **Performance metrics**
  - [ ] Swap execution speed vs. competitors
  - [ ] Gas costs comparison
  - [ ] Vault APY benchmarking
  - [ ] Security incident tracking (ecosystem-wide)

- [ ] **Feature parity analysis**
  - [ ] Concentrated liquidity support (vs. MMT, Cetus)
  - [ ] Cross-chain capabilities (vs. Wormhole-integrated DEXs)
  - [ ] AI/automation features (vs. EnsoFi, AftermathFi)
  - [ ] RWA integration roadmap (Phase 3 planning)

---

## Repository Study Schedule

> Dedicated timeline for studying Sui DeFi reference implementations
> See [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md) for detailed analysis

### Week 1: Avocado DEX (Reference Implementation)
- **Mon-Tue**: Clone all 5 repos, build locally, run tests
- **Wed-Thu**: Deep dive into Avocado's constant product implementation
- **Fri**: Port fixed-point math patterns to Carapace

### Week 2: Cetus CLMM (Advanced AMM)
- **Mon-Wed**: Study Cetus tick math, flash swaps, and SDK architecture
- **Thu-Fri**: Compare Cetus vs Avocado vs Carapace design decisions

### Weeks 3-4: Ad-Hoc Reviews
- Reference repos as needed for specific features
- Focus: Navi oracle patterns for Phase 1B prep

### Weeks 5-6: Navi Lending (Vault Deep Dive)
- **Full Week 5**: Navi lending protocol analysis
- Focus: Risk management, interest models, liquidations, oracles
- Document patterns for TortoiseVault implementation

### Weeks 7-9: Turbos (Sharding + Percolator)
- **Week 7**: Turbos sharding architecture study
- **Week 8**: Batch processing patterns (Turbos + Percolator)
- **Week 9**: Integration testing and documentation

### Weeks 10-13: Sui-AI-Agent-Kit (AI Integration)
- **Week 10-11**: Full AI Agent Kit integration study
- **Week 12**: MCP tools for vault automation
- **Week 13**: TEE setup and RL prototype

---

## Heimdahl.xyz Integration Roadmap

| Phase | Heimdahl Feature | Tortoise-OS Improvement | Effort Level | Timeline | Dependencies |
|-------|------------------|------------------------|--------------|----------|--------------|
| **Phase 1 (Core)** | CLI Event Queries | Real-time swap monitoring for RL fees | Low (scripting) | Weeks 1-2 | Phase 1A completion |
| **Phase 2 (Scale/Arb)** | WebSocket Streams | Cross-chain arb signals in TortoiseArb | Medium (backend hooks) | Weeks 4-6 | Phase 1M.1 completion |
| **Phase 3 (RWA)** | REST Aggregation | Multi-chain PnL for yield netting | High (TEE integration) | Weeks 8-12 | Phase 1F, 1J completion |
| **Ongoing** | JS/Golang SDK | Frontend/CLI testing automation | Low | Post-testnet launch | Phase 1M.1-1M.4 |

### Heimdahl Integration Priorities

**Immediate (Weeks 1-2)**:
1. Verify Heimdahl Sui support status
2. Install CLI and test on Sui testnet
3. Set up event monitoring scripts in Taskfile.yml
4. Create Bun backend wrapper for event streams

**Short-term (Weeks 4-6)**:
1. Integrate WebSocket streams for real-time liquidity monitoring
2. Build historical data aggregation for RL model training
3. Implement security audit logging with event replay protection

**Medium-term (Weeks 8-12)**:
1. Deploy cross-chain arbitrage signal detection
2. Integrate multi-chain exposure netting for vault strategies
3. Automate rebalancing triggers based on Heimdahl analytics

**Long-term (Post-testnet)**:
1. Fork Heimdahl CLI for custom Sui node integration (if needed)
2. Build Tortoise-OS-specific data layer on top of Heimdahl
3. Open-source custom Sui integrations back to Heimdahl community

---

## Milestone Timeline

### Month 1: Core Functionality + Repository Studies + Heimdahl Setup
- **Week 1-2**: Smart contract completion & deployment (Phase 1A)
  - **Parallel study**: Avocado DEX + Cetus CLMM (see schedule above)
  - Include fixed-point math library from Avocado (Phase 1J)
  - Enhanced object derivation (Phase 1J)
  - Basic invariant checks (Phase 1J)
  - Flash swap implementation from Cetus
  - **Heimdahl setup**: Verify Sui support, install CLI (Phase 1M.1)
- **Week 3**: SDK integration & transaction execution (Phase 1A)
  - Apply Cetus SDK patterns
  - **Heimdahl integration**: Create event monitoring scripts in Taskfile.yml (Phase 1M.1)
- **Week 4**: Token management & pool analytics (Phase 1B-C)
  - Navi oracle pattern review
  - **Heimdahl testing**: Test CLI event queries on testnet pools (Phase 1M.1)

### Month 2: Advanced Features + Vault + Percolator + Heimdahl Analytics
- **Week 1 (Week 5)**: Pool creation & multi-hop swaps (Phase 1C-D)
  - **Heimdahl WebSocket**: Begin WebSocket stream integration (Phase 1M.1)
- **Week 2 (Week 6)**: Vault UI & auto-compounding (Phase 1E)
  - **Parallel study**: Navi Lending full analysis (see schedule)
  - Apply isolated pool patterns to vault strategies
  - **Heimdahl vault data**: Start historical data aggregation for vault analytics (Phase 1M.2)
- **Week 3 (Week 7)**: Percolator innovations - Part 1 (Phase 1J)
  - **Parallel study**: Turbos sharding architecture
  - Risk management & liquidation framework
  - Fixed-point math integration
  - Cross-pool netting design
  - **Heimdahl RL integration**: Feed WebSocket events into RL fee optimizer (Phase 1M.1)
- **Week 4 (Week 8)**: Percolator innovations - Part 2 (Phase 1J)
  - Batch processing for MEV protection (Turbos + Percolator patterns)
  - ARG implementation
  - Sharding architecture design (Turbos + Percolator hybrid)
  - **Heimdahl security**: Implement audit logging and replay protection (Phase 1M.3)

### Month 3: AI Integration & Security + Heimdahl Multi-Chain + awesome-seal
- **Week 1-2 (Weeks 10-11)**: AI/ML fee optimization & vault strategies (Phase 1F)
  - **Parallel study**: Sui-AI-Agent-Kit full analysis (see schedule)
  - **awesome-seal integration**: Study Lockin Bot zero-trust key vault (Phase 1F/6.0A)
  - **awesome-seal integration**: Integrate Seal Rust SDK for model encryption (Phase 1F/6.0A)
  - Scoped capabilities for AI (Phase 1J + 1F + AI Agent Kit)
  - MCP tools integration
  - Non-replay protection
  - Walrus Storage + TEE setup (with Seal encryption)
  - **Heimdahl RL training**: Use aggregated data for RL model training (Phase 1M.2)
- **Week 3 (Week 12)**: Testing & security hardening (Phase 1G)
  - Comprehensive invariant testing
  - Percolator enhancement validation
  - AI Agent Kit MCP automation testing
  - **awesome-seal integration**: Implement token-gated premium vaults (Tusky pattern - Phase 1F/6.0A)
  - **awesome-seal integration**: Add Decryptable enums for vault strategies (Phase 1F/6.0A)
  - **Heimdahl multi-chain**: Begin cross-chain arbitrage signal detection (Phase 1M.4)
- **Week 4 (Week 13)**: Performance optimization (Phase 1G)
  - Shard testing infrastructure
  - Memory optimization benchmarks
  - RL prototype validation
  - **awesome-seal testing**: Test TEE attestation and encrypted storage
  - **Heimdahl SDK**: Integrate JS SDK for frontend dashboards (Phase 1M.5)

### Month 4: Testnet & Final Preparation + Heimdahl Production
- **Week 1**: Final Percolator integration testing (Phase 1J)
  - Cross-pool netting validation
  - Batch processing performance
  - Liquidation detection stress tests
  - **Heimdahl stress testing**: Validate event stream performance under high load (Phase 1M.5)
- **Week 2**: Security audit preparation begins (Phase 1K)
  - Pre-audit security hardening
  - Move Registry integration
  - Formal verification setup
  - **Heimdahl audit logs**: Prepare event audit trails for security review (Phase 1M.3)
- **Week 3**: DevOps & monitoring setup (Phase 1H)
  - **Heimdahl production**: Deploy Heimdahl monitoring to production infrastructure (Phase 1M.1)
- **Week 4**: Testnet launch & documentation (Phase 1I)
  - Begin competitive analysis tracking (Phase 1L)
  - **Heimdahl analytics**: Launch real-time analytics dashboard with Heimdahl data (Phase 1M.5)

### Month 5: Security Audit & Mainnet Preparation
- **Week 1**: Complete security audit preparation (Phase 1K)
  - TEE-specific security hardening (with awesome-seal patterns - Phase 1K/7K.5A)
  - **awesome-seal security**: Validate Lockin Bot attestation patterns
  - **awesome-seal security**: Test Seal SDK encrypted storage integrity
  - **awesome-seal security**: Audit token-gated access bypass resistance
  - Comprehensive testing and fuzzing
  - Audit documentation package (include awesome-seal integrations)
- **Week 2-3**: External security audit execution (Phase 1K)
  - Engage OtterSec or SlowMist
  - Daily audit team coordination
  - **awesome-seal audit scope**: TEE patterns, encrypted enums, token-gating
  - Critical findings remediation
- **Week 4**: Post-audit fixes and validation
  - Address all medium+ findings
  - Public audit report disclosure
  - Testnet bug bounty launch

### Month 6: Mainnet Launch & Market Positioning
- **Week 1**: Final mainnet deployment preparation
  - Production infrastructure setup
  - Emergency response drills
- **Week 2**: Mainnet launch
  - Launch bug bounty program ($200K+ reserve)
  - Community announcements
- **Week 3-4**: Post-launch monitoring & competitive analysis (Phase 1L)
  - Track MMT Finance launch (Oct 30)
  - Monitor competitor metrics
  - Attend Sui Basecamp 2025 (if scheduled)

### Post-Launch (Month 7+): Phase 2 Scaling
- Implement full sharding architecture (Phase 1J → Phase 2)
- Deploy cross-pool netting in production
- Optimize memory allocation for scale
- Launch TortoiseUSD & TortoiseArb

---

## Success Metrics

### Technical KPIs
- [ ] 100% E2E test coverage for critical flows
- [ ] < 2 second average swap execution time (< 4s with batching)
- [ ] 99.9% API uptime
- [ ] All smart contracts audited with zero critical issues
- [ ] Lighthouse performance score > 90
- [ ] Test coverage >85% across all modules
- [ ] Move Prover verification passing for all critical invariants

### Product KPIs
- [ ] Support 20+ token pairs at launch
- [ ] < $10 average gas cost per swap
- [ ] 10+ active liquidity pools
- [ ] 5+ vault strategies implemented
- [ ] 1000+ unique wallet connections in first week

### Security KPIs (Phase 1K)
- [ ] External audit completed with zero critical findings
- [ ] Bug bounty program active with $200K+ reserve
- [ ] 100% of medium+ audit findings resolved
- [ ] Mean time to patch < 48 hours for high severity issues
- [ ] Emergency pause mechanism tested monthly
- [ ] Multi-sig governance operational (3-of-5 minimum)
- [ ] Zero capability replay attacks in testing
- [ ] All admin capabilities have TTL enforcement

### Percolator Enhancement KPIs (Phase 1J)
- [ ] Zero liquidation cascades in testnet stress tests
- [ ] < 1% position losses during extreme volatility events
- [ ] Cross-pool netting reduces margin requirements by 20%+
- [ ] 90%+ reduction in sandwich attack profitability (batching)
- [ ] < 0.1% toxic flow ratio (ARG detection)
- [ ] Batch processing adds < 2 second latency
- [ ] Support 100+ concurrent shards (design validated)
- [ ] < 10MB state per shard maintained
- [ ] Zero capability replay attacks in audit
- [ ] 100% invariant check coverage in Move contracts

### Heimdahl Integration KPIs (Phase 1M)
- [ ] **Real-time monitoring performance**
  - [ ] Event latency < 500ms from on-chain to backend
  - [ ] 99.9% uptime for WebSocket connections
  - [ ] Zero missed critical events (swaps, liquidations)
  - [ ] Support 1000+ events/second throughput

- [ ] **RL model accuracy improvements**
  - [ ] 15% increase in vault APY via predictive rebalancing
  - [ ] 20-30% better capital efficiency in flash swaps
  - [ ] < 5% prediction error for liquidity volatility
  - [ ] Daily model retraining with <10min data fetch time

- [ ] **Security and compliance**
  - [ ] 100% of vault/pool events logged for audit
  - [ ] Zero event replay attacks in testing
  - [ ] Oracle price verification matches Heimdahl data >99.9%
  - [ ] Stablecoin flow alerts within 1 minute of large transfers

- [ ] **Cross-chain arbitrage (Phase 2)**
  - [ ] Detect arbitrage opportunities with <2s latency
  - [ ] >0.5% profit threshold after fees
  - [ ] 80%+ successful arbitrage execution rate
  - [ ] Support 3+ chains (Sui, Ethereum, Arbitrum minimum)

- [ ] **Infrastructure and reliability**
  - [ ] Graceful fallback to Sui JSON-RPC if Heimdahl unavailable
  - [ ] CLI automation scripts run without errors in CI/CD
  - [ ] SDK integration test coverage >90%
  - [ ] Real-time dashboard updates with <1s refresh rate

### awesome-seal Integration KPIs (Phase 1F, 1K)
- [ ] **TEE security and attestation**
  - [ ] 100% enclave attestation success rate (Lockin Bot patterns)
  - [ ] Zero TEE-related findings in security audit
  - [ ] Master keys never leave enclave (zero-trust validation)
  - [ ] Key rotation cycles completed every 90 days
  - [ ] Fallback mechanism tested with 100% success rate

- [ ] **Encrypted storage integrity**
  - [ ] 100% of RL models encrypted with Seal SDK
  - [ ] Zero model tampering incidents in testing
  - [ ] < 1% encrypted blob hash verification false positives
  - [ ] Model decryption latency < 100ms in TEE
  - [ ] Redundant storage across 3+ Walrus epochs

- [ ] **Token-gated access control**
  - [ ] 20%+ of vault TVL in premium vaults (token-gated)
  - [ ] Zero token-gating bypass attempts successful
  - [ ] Flash-loan resistant balance checks (100% tested)
  - [ ] Time-weighted LP tracking accuracy >99%
  - [ ] Premium vault access latency < 500ms

- [ ] **Decryptable enum security**
  - [ ] Zero capability bypass vulnerabilities in audit
  - [ ] Time-released disclosure works 100% of time
  - [ ] TEE-only access enforced during active epochs
  - [ ] Replay protection blocks 100% of duplicate requests
  - [ ] Encrypted strategy parameter size < 500 bytes per vault

- [ ] **Development velocity**
  - [ ] Saved 5-7 weeks vs. custom implementation (target met)
  - [ ] awesome-seal patterns integrated by Week 12 (Phase 1F)
  - [ ] Security enhancements completed by Month 5 (Phase 1K)
  - [ ] Zero regressions from awesome-seal dependencies

---

## Risk Mitigation

### Technical Risks
- **Smart contract bugs**: Comprehensive testing + external audit + invariant checks (Phase 1J + 1K)
- **Oracle failures**: Multiple price feed fallbacks + circuit breakers (Phase 1K)
- **Oracle manipulation**: 3+ sources with median pricing (Phase 1K)
- **Gas price spikes**: Gas optimization + user warnings
- **Network congestion**: Transaction retry logic + batch processing (Phase 1J)
- **MEV exploitation**: Batch epochs + ARG taxation (Phase 1J)
- **Liquidation cascades**: Cross-pool netting + RL prediction (Phase 1J)
- **State bloat**: Memory-optimized allocators + shard budgets (Phase 1J)
- **Capability replay attacks**: Nonce-based protection + TTL enforcement (Phase 1J + 1K)
- **TEE compromise**: SGX attestation (awesome-seal Lockin Bot patterns) + fallback mechanisms (Phase 1K)
- **Model tampering**: Seal SDK encryption + Walrus hash verification + redundant storage (Phase 1K + awesome-seal)
- **Token-gating bypass**: Flash-loan resistant checks + time-weighted balances (awesome-seal Tusky patterns)
- **Encrypted storage failures**: Multi-epoch Walrus redundancy + hash verification (awesome-seal)
- **Seal SDK dependency**: Pin versions + fork capability + comprehensive testing

### Business Risks
- **Low liquidity**: Liquidity mining incentives + LP protection (ARG)
- **Competitor advantage**: Focus on AI differentiation + Percolator innovations (Phase 1L tracking)
- **Regulatory concerns**: Clear disclaimers + legal review
- **Market timing**: Q4 2025 - Q1 2026 sees major launches (MMT, EnsoFi, AftermathFi) - differentiate early (Phase 1L)

### Sui-Specific Risks (Phase 1J)
- **Shared object contention**: Sharding strategy + parallel execution
- **Move language constraints**: PDA-like object derivation patterns
- **Gas model differences**: Empirical benchmarking of batch costs
- **Cross-shard complexity**: Centralized router for initial launch, distributed later

---

## Next Immediate Actions

**Note:** Refer to [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for detailed tracking of all tasks.

### This Week (Priority Tasks - Top 10 Focus)
1. **[Repository Study] Clone all 5 Sui DeFi repositories locally** (Checklist 5.1)
2. **[Repository Study] Deep dive into Avocado DEX - audit constant product math** (Checklist 5.1)
3. **[Phase 1J] Port fixed-point math library from Avocado to Carapace** (Checklist 1.3)
4. Complete AMM pool.move swap functions (audit vs Avocado)
5. **[Phase 1J] Implement enhanced object derivation patterns** (Checklist 4.1)
6. **[Phase 1M] Verify Heimdahl Sui support status and request beta access** (Phase 1M.1)
7. **[Phase 1M] Install Heimdahl CLI and test basic event queries** (Phase 1M.1)
8. **[Phase 1L] Monitor MMT Finance launch (Oct 30, 2025)** (Checklist 5.2)
9. **[awesome-seal] Clone Lockin Bot, Tusky, and Decryptable Enum repos** (Phase 1F prep)
10. **[awesome-seal] Review AWESOME_SEAL_EVALUATION.md for integration strategy** (Phase 1F prep)

### Next Week
1. **[Repository Study] Study Cetus CLMM - flash swaps and SDK architecture** (Checklist 5.1)
2. **[Phase 1J] Add basic invariant checks to contracts** (Checklist 4.1)
3. Replace preview mode with real transactions
4. Deploy contracts to local Sui network
5. Build SDK transaction builders (using Cetus patterns)
6. **[Phase 1M] Create Taskfile.yml scripts for Heimdahl event monitoring** (Phase 1M.1)
7. **[Phase 1M] Build Bun backend wrapper for Heimdahl event streams** (Phase 1M.1)
8. **[Phase 1L] Attend EnsoFi community calls for architecture insights** (Checklist 5.2)

### Next Two Weeks (Phase 1J Foundation + Code Review + Heimdahl Testing)
1. **[Repository Study] Review Navi oracle patterns for Phase 1B prep** (Checklist 5.1)
2. Design batch processing architecture (Checklist 2.1)
3. Prototype capability token system (Checklist 4.2)
4. Create fixed-point math test suite (compare Avocado vs Carapace) (Checklist 1.3)
5. Document PDA-like object derivation for vault escrows
6. **[Phase 1M] Test Heimdahl CLI event queries on testnet pools** (Phase 1M.1)
7. **[Phase 1M] Design WebSocket integration architecture** (Phase 1M.1)
8. **[Phase 1K] Begin security audit preparation checklist** (See AUDIT_PREPARATION_CHECKLIST.md)

---

## Notes

- This roadmap focuses on **Phase 1 (Carapace)** only
- Phase 2 (TortoiseUSD + TortoiseArb) will have a separate roadmap
- Timeline estimates assume 2-3 full-time developers
- AI/ML features can be implemented in parallel with core functionality
- Security audit should be scheduled 4-6 weeks before mainnet launch
- **Phase 1J** integrates battle-tested innovations from Percolator (perpetuals DEX on Solana)
- **Phase 1K** provides comprehensive security audit preparation framework
- **Phase 1L** tracks competitive landscape and market positioning
- **Phase 1M** integrates Heimdahl.xyz for real-time blockchain data indexing and analytics
- **awesome-seal ecosystem** provides TEE, encryption, and access control patterns (saves 5-7 weeks)
- **Sui DeFi references** provide production Sui Move implementations to study
- See [PERCOLATOR_RESEARCH.md](./PERCOLATOR_RESEARCH.md) for Solana learnings
- See [SUI_DEFI_REFERENCES.md](./SUI_DEFI_REFERENCES.md) for Sui-specific patterns
- See [SECURITY_AUDIT_GUIDE.md](./SECURITY_AUDIT_GUIDE.md) for security best practices
- See [SUI_DEFI_COMPETITIVE_LANDSCAPE.md](./SUI_DEFI_COMPETITIVE_LANDSCAPE.md) for market analysis
- See [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for actionable development tasks
- See [AUDIT_PREPARATION_CHECKLIST.md](./AUDIT_PREPARATION_CHECKLIST.md) for detailed audit prep
- See [AWESOME_SEAL_EVALUATION.md](./AWESOME_SEAL_EVALUATION.md) for Seal ecosystem integration analysis
- Percolator enhancements prioritize security, MEV protection, and scalability
- Heimdahl.xyz integration enhances data infrastructure for AI/ML, cross-chain operations, and security monitoring
- awesome-seal integration provides TEE patterns, encryption SDKs, and token-gated access control
- Repository studies run in parallel with development (see "Repository Study Schedule")
- Some Phase 1J features (sharding, cross-pool netting) will be fully deployed in Phase 2
- Some Phase 1M features (cross-chain arbitrage) will be fully utilized in Phase 2 (TortoiseArb)
- **Budget**: Allocate $300-400K for comprehensive security program (audits + bug bounty)
- **Heimdahl Note**: If Sui support isn't live, contact Heimdahl via https://forms.gle/YeNyCconLAWH21Bu6 for beta access

## Key Phase 1J Integration Points

### Immediate Integration (Phase 1A-C)
- Fixed-point math library
- Enhanced object derivation
- Basic invariant checks

### Mid-Term Integration (Phase 1F-G)
- Scoped capabilities for AI
- Batch processing for swaps
- Non-replay protection
- ARG taxation

### Long-Term Integration (Phase 2)
- Full sharding architecture
- Cross-pool netting in production
- Memory-optimized allocation at scale

## Key Phase 1M (Heimdahl) Integration Points

### Immediate Integration (Weeks 1-2)
- Verify Heimdahl Sui support and request beta access if needed
- Install CLI and test basic event queries on testnet
- Create Taskfile.yml automation scripts
- Build Bun backend wrapper for event streams

### Short-Term Integration (Weeks 4-6)
- WebSocket stream integration for real-time monitoring
- Feed liquidity events into RL fee optimizer (Phase 1F integration)
- Historical data aggregation for vault analytics
- Audit logging and replay protection (Phase 1J/1K integration)

### Mid-Term Integration (Weeks 8-12)
- Cross-chain arbitrage signal detection (Phase 2 prep)
- Multi-chain exposure netting for vault strategies
- Oracle price verification and manipulation resistance
- Automated rebalancing triggers based on analytics

### Long-Term Integration (Phase 2+)
- Fork Heimdahl CLI for custom Sui node integration (if needed)
- Full cross-chain arbitrage execution (TortoiseArb)
- Multi-chain RWA position tracking (Phase 3)
- Custom Tortoise-OS data layer on Heimdahl foundation

## Repository Integration Summary

| Repository | Primary Phase | Key Learnings | Integration Priority |
|------------|---------------|---------------|---------------------|
| **Avocado DEX** | Phase 1A | Fixed-point math, clean reference implementation | 🔴 CRITICAL (Week 1) |
| **Cetus CLMM** | Phase 1A, 1C | Flash swaps, SDK patterns, TWAP oracles | 🟠 HIGH (Week 2) |
| **Navi Lending** | Phase 1B, 1E | Oracle aggregation, risk management, liquidations | 🔴 CRITICAL (Week 5-6) |
| **Turbos Finance** | Phase 1J | Sharding, batch settlement, gas optimization | 🔴 CRITICAL (Week 7-8) |
| **Sui-AI-Agent-Kit** | Phase 1F | MCP tools, capability systems, TEE integration | 🔴 CRITICAL (Week 10-11) |
| **awesome-seal** | Phase 1F, 1K | Nautilus TEE patterns, Seal encryption, token-gated access, decryptable enums | 🔴 CRITICAL (Week 10-12) |
| **Heimdahl.xyz** | Phase 1M | Real-time event indexing, multi-chain data, WebSocket streams | 🔴 CRITICAL (Week 1-2) |

### Quick Reference: Feature Adoption

| Feature | Source Repo | Carapace Implementation | Status |
|---------|-------------|------------------------|--------|
| Fixed-point math | Avocado | `move/sources/math/fixed_point.move` | Week 1 |
| Flash swaps | Cetus | `move/sources/amm/pool.move` | Week 2 |
| Emergency pause | Navi | `move/sources/amm/pool.move`, `vault.move` | Phase 1A |
| Multi-oracle | Navi | `packages/sdk/src/oracles/` | Phase 1B |
| Sharding | Turbos + Percolator | `move/sources/amm/shard.move` | Phase 1J |
| Batch processing | Turbos | `move/sources/amm/batch.move` | Phase 1J |
| MCP tools | AI Agent Kit | `apps/api/src/services/mcp/` | Phase 1F |
| Capability tokens | AI Agent Kit + Percolator | `move/sources/vault/capabilities.move` | Phase 1F + 1J |
| **Nautilus TEE patterns** | **awesome-seal (Lockin Bot)** | `move/sources/ai/enclave_key_vault.move` | **Phase 1F (Week 10)** |
| **Seal encryption SDK** | **awesome-seal** | `packages/sdk/src/seal/encryption-client.ts` | **Phase 1F (Week 11)** |
| **Token-gated vaults** | **awesome-seal (Tusky)** | `move/sources/vault/premium_access.move` | **Phase 1F (Week 12)** |
| **Decryptable enums** | **awesome-seal** | `move/sources/vault/encrypted_strategy.move` | **Phase 1F (Week 12)** |
| Event monitoring | Heimdahl.xyz | `apps/api/src/services/heimdahl/` | Phase 1M (Week 1-2) |
| WebSocket streams | Heimdahl.xyz | `packages/sdk/src/heimdahl-client.ts` | Phase 1M (Week 5) |
| Cross-chain data | Heimdahl.xyz | `apps/api/src/services/arbitrage/` | Phase 1M (Week 12) |
| Audit logging | Heimdahl.xyz | `apps/api/src/services/security/audit-logger.ts` | Phase 1M (Week 8) |

---

**Last Updated**: 2025-10-25
**Status**: In Active Development
**Target Mainnet Launch**: Q2 2026 (extended for Phase 1J)
**Target Testnet Launch**: Q1 2026

**Note**: awesome-seal ecosystem integration added 2025-10-25 (estimated 5-7 weeks time savings)
