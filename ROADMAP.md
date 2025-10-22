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
- [ ] **Complete AMM pool.move contract**
  - [ ] Implement create_pool() function
  - [ ] Finalize add_liquidity() with proper math
  - [ ] Finalize remove_liquidity() with burn logic
  - [ ] Implement swap_x_to_y() and swap_y_to_x()
  - [ ] Add flash swap support
  - [ ] Implement slippage protection
  - [ ] Add emergency pause mechanism
  - [ ] Protocol fee collection logic

- [ ] **Complete TortoiseVault contract**
  - [ ] Implement deposit() function
  - [ ] Implement withdraw() function
  - [ ] Add share calculation logic
  - [ ] Implement strategy allocation
  - [ ] Add rebalancing functions
  - [ ] Fee distribution mechanism

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
- [ ] **Build TypeScript SDK (packages/sdk/)**
  - [ ] Pool interaction functions
  - [ ] Vault interaction functions
  - [ ] Transaction building utilities
  - [ ] Event parsing/listening
  - [ ] Type definitions for contracts

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
- [ ] **Integrate price feeds**
  - [ ] Connect to Sui price oracles
  - [ ] Pyth Network integration
  - [ ] Fallback price sources
  - [ ] USD price display for all tokens

---

### Phase 1C: Pool Management Features (1 week)

**Priority: MEDIUM** - Enhanced functionality

#### 3.1 Pool Creation
- [ ] **Pool factory UI**
  - [ ] Create new pool interface
  - [ ] Token pair selection
  - [ ] Initial liquidity provision
  - [ ] Fee tier selection
  - [ ] Pool deployment transaction

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

#### 6.1 Dynamic Fee Optimization
- [ ] **ML model for fee adjustment**
  - [ ] Volatility prediction model
  - [ ] Train on historical Sui data
  - [ ] Deploy model to Walrus Storage
  - [ ] Integrate fee adjustment in contract

#### 6.2 Vault Strategy Optimizer
- [ ] **RL optimizer in Nautilus TEE**
  - [ ] Set up Nautilus TEE environment
  - [ ] Implement RL agent
  - [ ] Strategy performance tracking
  - [ ] Secure execution framework
  - [ ] Risk-adjusted optimization

#### 6.3 Performance Analytics
- [ ] **AI-powered insights**
  - [ ] Pool performance predictions
  - [ ] Optimal liquidity provision suggestions
  - [ ] Impermanent loss forecasting

---

### Phase 1G: Testing & Quality (2-3 weeks)

**Priority: CRITICAL** - Required before mainnet

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
  - [ ] Reentrancy protection
  - [ ] Integer overflow/underflow checks
  - [ ] External security audit (before mainnet)

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

## Milestone Timeline

### Month 1: Core Functionality
- **Week 1-2**: Smart contract completion & deployment
- **Week 3**: SDK integration & transaction execution
- **Week 4**: Token management & pool analytics

### Month 2: Advanced Features
- **Week 1**: Pool creation & multi-hop swaps
- **Week 2**: Vault UI & auto-compounding
- **Week 3**: Testing & security hardening
- **Week 4**: Performance optimization

### Month 3: AI Integration & Launch
- **Week 1-2**: AI/ML fee optimization & vault strategies
- **Week 3**: Final testing & audit preparation
- **Week 4**: Testnet launch & documentation

### Month 4: Mainnet Preparation
- **Week 1-2**: Security audit fixes
- **Week 3**: DevOps & monitoring setup
- **Week 4**: Mainnet deployment & launch

---

## Success Metrics

### Technical KPIs
- [ ] 100% E2E test coverage for critical flows
- [ ] < 2 second average swap execution time
- [ ] 99.9% API uptime
- [ ] All smart contracts audited with zero critical issues
- [ ] Lighthouse performance score > 90

### Product KPIs
- [ ] Support 20+ token pairs at launch
- [ ] < $10 average gas cost per swap
- [ ] 10+ active liquidity pools
- [ ] 5+ vault strategies implemented
- [ ] 1000+ unique wallet connections in first week

---

## Risk Mitigation

### Technical Risks
- **Smart contract bugs**: Comprehensive testing + external audit
- **Oracle failures**: Multiple price feed fallbacks
- **Gas price spikes**: Gas optimization + user warnings
- **Network congestion**: Transaction retry logic

### Business Risks
- **Low liquidity**: Liquidity mining incentives
- **Competitor advantage**: Focus on AI differentiation
- **Regulatory concerns**: Clear disclaimers + legal review

---

## Next Immediate Actions

### This Week (Priority Tasks)
1. Complete AMM pool.move swap functions
2. Deploy contracts to local Sui network
3. Build SDK transaction builders
4. Replace preview mode with real transactions
5. Fetch actual pool data from blockchain

### Next Week
1. Implement token balance fetching
2. Add pool creation UI
3. Integrate price feeds
4. Expand E2E test coverage
5. Set up indexer for pool events

---

## Notes

- This roadmap focuses on **Phase 1 (Carapace)** only
- Phase 2 (TortoiseUSD + TortoiseArb) will have a separate roadmap
- Timeline estimates assume 2-3 full-time developers
- AI/ML features can be implemented in parallel with core functionality
- Security audit should be scheduled 4-6 weeks before mainnet launch

---

**Last Updated**: 2025-10-22
**Status**: In Active Development
**Target Mainnet Launch**: Q1 2026
