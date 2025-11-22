# Carapace Monorepo - Production Deployment Checklist

**Date Created**: 2025-11-12  
**Version**: 1.0  
**Status**: Pre-Production

---

## Overview

This checklist covers the complete production deployment of the Carapace ecosystem:
- TOS Token (Sui Move contract)
- x402 Payment Facilitator (Backend API)
- Carapace Move Contracts (DeFi strategies)
- Web App (Frontend)
- SDK & UI Libraries

**Estimated Timeline**: 2-4 weeks for full production deployment

---

## Table of Contents

1. [Pre-Deployment: Preparation](#pre-deployment-preparation)
2. [Component 1: TOS Token](#component-1-tos-token)
3. [Component 2: Carapace Move Contracts](#component-2-carapace-move-contracts)
4. [Component 3: x402 Facilitator](#component-3-x402-facilitator)
5. [Component 4: Web Application](#component-4-web-application)
6. [Component 5: SDKs & Libraries](#component-5-sdks--libraries)
7. [Post-Deployment: Operations](#post-deployment-operations)
8. [Production Readiness Checklist](#production-readiness-checklist)

---

## Pre-Deployment: Preparation

### Infrastructure Setup

- [ ] **Domain Setup**
  - [ ] Register domain: tortoise-os.io (or similar)
  - [ ] Configure DNS records
  - [ ] Set up SSL certificates
  - [ ] Plan subdomains:
    - `app.tortoise-os.io` - Web app
    - `api.tortoise-os.io` - x402 facilitator
    - `docs.tortoise-os.io` - Documentation

- [ ] **Cloud Accounts**
  - [ ] Fly.io account created and verified
  - [ ] Grafana Cloud account (free tier)
  - [ ] Better Uptime account (free tier)
  - [ ] GitHub account with proper access
  - [ ] Sui wallet with sufficient gas (10+ SUI)

- [ ] **Security**
  - [ ] Set up password manager (1Password, Bitwarden)
  - [ ] Generate secure private keys
  - [ ] Create multi-sig wallets (3/5 recommended)
  - [ ] Document key holders and responsibilities
  - [ ] Set up 2FA on all accounts

### Code Preparation

- [ ] **Version Control**
  - [ ] Create production branch: `main`
  - [ ] Create staging branch: `staging`
  - [ ] Set up branch protection rules
  - [ ] Tag current version: `v1.0.0`

- [ ] **Testing**
  - [ ] Run full test suite: `bun test`
  - [ ] Check linting: `bunx biome check src/`
  - [ ] Type checking: `bun run typecheck`
  - [ ] Integration tests passing
  - [ ] Load testing completed

- [ ] **Documentation**
  - [ ] README.md updated with production info
  - [ ] API documentation complete (OpenAPI)
  - [ ] Deployment guides reviewed
  - [ ] Runbook for common issues created

---

## Component 1: TOS Token

**Priority**: HIGH (Deploy First)  
**Estimated Time**: 1 day  
**Dependencies**: None

### Pre-Deployment

- [ ] **Code Review**
  - [ ] Review `packages/tos-token/sources/tos.move`
  - [ ] Verify total supply: 1,000,000,000 TOS
  - [ ] Check decimals: 9
  - [ ] Confirm burn mechanism works

- [ ] **Testing**
  ```bash
  cd packages/tos-token
  sui move build
  sui move test
  ```
  - [ ] Build succeeds without errors
  - [ ] All tests pass
  - [ ] Test on testnet first

- [ ] **Security Audit**
  - [ ] Code review by 2+ Sui developers
  - [ ] Consider formal audit (optional for v1)
  - [ ] Bug bounty program planned
  - [ ] Emergency contacts documented

### Deployment to Testnet

- [ ] **Deploy Contract**
  ```bash
  cd packages/tos-token
  sui client switch --env testnet
  sui client publish --gas-budget 100000000
  ```

- [ ] **Save Important Info**
  - [ ] Package ID: `_________________`
  - [ ] TreasuryCap Object ID: `_________________`
  - [ ] Total Supply Coin ID: `_________________`
  - [ ] Metadata Object ID: `_________________`

- [ ] **Test Basic Functions**
  - [ ] Transfer TOS between addresses
  - [ ] Verify balance queries work
  - [ ] Test burn function
  - [ ] Check metadata (name, symbol, decimals)

- [ ] **Testnet Distribution**
  - [ ] Create test distribution wallets
  - [ ] Split coins according to tokenomics
  - [ ] Test vesting schedules (if applicable)
  - [ ] Monitor for 48 hours

### Deployment to Mainnet

- [ ] **Pre-Mainnet Checks**
  - [ ] Testnet has been stable for 1+ week
  - [ ] All tests passing
  - [ ] Security review completed
  - [ ] Multi-sig wallet ready (3/5)
  - [ ] Distribution wallets created

- [ ] **Deploy to Mainnet**
  ```bash
  sui client switch --env mainnet
  sui client publish --gas-budget 100000000
  ```

- [ ] **Save Mainnet Info**
  - [ ] Mainnet Package ID: `_________________`
  - [ ] Mainnet TreasuryCap: `_________________`
  - [ ] Total Supply Coin: `_________________`
  - [ ] Backup all object IDs securely

- [ ] **Token Distribution**
  - [ ] Transfer TreasuryCap to multi-sig wallet
  - [ ] Distribute to allocation wallets:
    - [ ] Ecosystem: 300M TOS → `0x...`
    - [ ] Community: 250M TOS → `0x...`
    - [ ] Team: 150M TOS → `0x...`
    - [ ] Liquidity: 150M TOS → `0x...`
    - [ ] Treasury: 100M TOS → `0x...`
    - [ ] Public: 50M TOS → `0x...`

- [ ] **Create Liquidity Pool**
  - [ ] Choose DEX (Cetus recommended)
  - [ ] Create TOS-SUI pair
  - [ ] Add initial liquidity: 100M TOS + equivalent SUI
  - [ ] Lock liquidity (optional)

- [ ] **Post-Deployment**
  - [ ] Verify on Sui Explorer
  - [ ] Update website with contract address
  - [ ] Announce on social media
  - [ ] Submit to CoinGecko/CoinMarketCap (after 7 days)

---

## Component 2: Carapace Move Contracts

**Priority**: HIGH  
**Estimated Time**: 2-3 days  
**Dependencies**: TOS Token deployed

### Pre-Deployment

- [ ] **Code Review**
  - [ ] Review all contracts in `move/sources/`
  - [ ] Check flash loan implementation
  - [ ] Verify strategy contracts
  - [ ] Review permissions and access control

- [ ] **Testing**
  ```bash
  cd move
  sui move build
  sui move test
  ```
  - [ ] Build succeeds
  - [ ] All unit tests pass
  - [ ] Integration tests pass
  - [ ] Gas optimization checked

- [ ] **Security**
  - [ ] Formal audit completed (REQUIRED for DeFi)
  - [ ] Audit report published
  - [ ] Critical issues resolved
  - [ ] Bug bounty program live

### Deployment to Testnet

- [ ] **Deploy Contracts**
  ```bash
  cd move
  sui client switch --env testnet
  sui client publish --gas-budget 500000000
  ```

- [ ] **Save Package IDs**
  - [ ] Main Package: `_________________`
  - [ ] Flash Loan Module: `_________________`
  - [ ] Strategy Modules: `_________________`

- [ ] **Test Strategies**
  - [ ] Execute test flash loan
  - [ ] Test strategy execution
  - [ ] Verify profit calculations
  - [ ] Test emergency stop mechanisms

- [ ] **Monitor Testnet**
  - [ ] Run strategies for 1+ week
  - [ ] Monitor for unexpected behavior
  - [ ] Test under various market conditions
  - [ ] Verify gas costs are reasonable

### Deployment to Mainnet

- [ ] **Pre-Mainnet Checks**
  - [ ] Audit completed and issues resolved
  - [ ] Testnet stable for 2+ weeks
  - [ ] Emergency procedures documented
  - [ ] Admin keys secured in multi-sig

- [ ] **Deploy to Mainnet**
  ```bash
  sui client switch --env mainnet
  sui client publish --gas-budget 500000000
  ```

- [ ] **Save Mainnet Package IDs**
  - [ ] Mainnet Package: `_________________`
  - [ ] Backup all package IDs

- [ ] **Post-Deployment**
  - [ ] Verify contracts on Sui Explorer
  - [ ] Update SDK with new package IDs
  - [ ] Update documentation
  - [ ] Announce deployment

- [ ] **Risk Management**
  - [ ] Start with low TVL limits ($10k max)
  - [ ] Gradually increase limits over time
  - [ ] Monitor all transactions
  - [ ] Set up alerts for unusual activity

---

## Component 3: x402 Facilitator

**Priority**: HIGH (Core Infrastructure)  
**Estimated Time**: 1 day  
**Dependencies**: TOS Token deployed

### Pre-Deployment

- [ ] **Configuration**
  - [ ] Review `.env.example`
  - [ ] Create `.env.production` with real values
  - [ ] Set ALLOWED_ORIGINS for production domain
  - [ ] Configure rate limits for production load
  - [ ] Set MIN_WALLET_BALANCE alert threshold

- [ ] **Testing**
  ```bash
  cd apps/x402-facilitator
  bun test
  ```
  - [ ] 19/19 tests passing
  - [ ] Load test completed (100 req/s)
  - [ ] Circuit breaker tested under failures
  - [ ] Rate limiting verified

- [ ] **Security**
  - [ ] Generate new facilitator keypair for production
  - [ ] Fund facilitator wallet (10+ SUI)
  - [ ] Store private key securely
  - [ ] Document wallet address
  - [ ] Set up balance monitoring

### Deployment to Fly.io (Testnet)

- [ ] **Install Fly CLI**
  ```bash
  brew install flyctl
  fly auth login
  ```

- [ ] **Create Staging App**
  ```bash
  cd /path/to/carapace
  fly apps create x402-facilitator-staging
  ```

- [ ] **Set Secrets (Testnet)**
  ```bash
  fly secrets set \
    FACILITATOR_PRIVATE_KEY="suiprivkey1..." \
    SUI_RPC_URL="https://fullnode.testnet.sui.io:443" \
    ALLOWED_ORIGINS="https://staging.tortoise-os.io" \
    --app x402-facilitator-staging
  ```

- [ ] **Deploy**
  ```bash
  fly deploy --config apps/x402-facilitator/fly.toml --app x402-facilitator-staging
  ```

- [ ] **Verify Staging**
  - [ ] Health check: `curl https://x402-facilitator-staging.fly.dev/health`
  - [ ] Metrics: `curl https://x402-facilitator-staging.fly.dev/metrics`
  - [ ] OpenAPI docs: Visit `/docs`
  - [ ] Test payment flow end-to-end

- [ ] **Monitor Staging**
  - [ ] Run for 48 hours minimum
  - [ ] Check wallet balance regularly
  - [ ] Monitor error rates
  - [ ] Review logs for issues

### Deployment to Fly.io (Production)

- [ ] **Create Production App**
  ```bash
  fly apps create x402-facilitator-prod
  ```

- [ ] **Set Production Secrets**
  ```bash
  fly secrets set \
    FACILITATOR_PRIVATE_KEY="<PRODUCTION_KEY>" \
    SUI_RPC_URL="https://fullnode.mainnet.sui.io:443" \
    ALLOWED_ORIGINS="https://tortoise-os.io,https://app.tortoise-os.io" \
    MIN_WALLET_BALANCE="5.0" \
    --app x402-facilitator-prod
  ```

- [ ] **Deploy to Production**
  ```bash
  fly deploy --config apps/x402-facilitator/fly.toml --app x402-facilitator-prod
  ```

- [ ] **Configure Custom Domain**
  ```bash
  fly certs add api.tortoise-os.io --app x402-facilitator-prod
  ```
  - [ ] Add CNAME record in DNS
  - [ ] Verify SSL certificate issued

- [ ] **Scale for Production**
  ```bash
  fly scale vm performance-1x --app x402-facilitator-prod
  fly scale memory 2048 --app x402-facilitator-prod
  ```

- [ ] **Post-Deployment**
  - [ ] Health check: `curl https://api.tortoise-os.io/health`
  - [ ] Fund facilitator wallet with 10+ SUI
  - [ ] Set up monitoring (Grafana Cloud)
  - [ ] Configure alerts (wallet balance, error rate)
  - [ ] Test payment settlement

### Observability Setup

- [ ] **Grafana Cloud (Free Tier)**
  - [ ] Sign up: https://grafana.com/auth/sign-up
  - [ ] Get Prometheus credentials
  - [ ] Configure metrics scraping
  - [ ] Import dashboard (from docs)
  - [ ] Set up alerts:
    - [ ] Wallet balance < 2 SUI → Critical
    - [ ] Error rate > 5% → Warning
    - [ ] Circuit breaker open → Critical

- [ ] **Better Uptime**
  - [ ] Sign up: https://betteruptime.com
  - [ ] Add monitor: https://api.tortoise-os.io/health
  - [ ] Set check interval: 1 minute
  - [ ] Configure Slack/email alerts

- [ ] **Log Aggregation (Optional)**
  - [ ] Logtail or Grafana Loki
  - [ ] 7-day retention minimum
  - [ ] Search capability

---

## Component 4: Web Application

**Priority**: MEDIUM  
**Estimated Time**: 2 days  
**Dependencies**: x402 facilitator, TOS token, Move contracts

### Pre-Deployment

- [ ] **Configuration**
  - [ ] Update `apps/web/.env.production`
  - [ ] Set API URLs to production endpoints
  - [ ] Configure TOS token contract address
  - [ ] Set Carapace Move contract addresses
  - [ ] Update analytics IDs (if applicable)

- [ ] **Build & Test**
  ```bash
  cd apps/web
  bun run build
  bun run typecheck
  ```
  - [ ] Build succeeds
  - [ ] No TypeScript errors
  - [ ] Lighthouse score > 90
  - [ ] Test all user flows

- [ ] **Content Review**
  - [ ] Update branding to TOS token
  - [ ] Replace TEST with TOS references
  - [ ] Verify all links work
  - [ ] Check responsive design
  - [ ] Test wallet connection (Sui Wallet)

### Deployment to Vercel (Staging)

- [ ] **Connect to Vercel**
  - [ ] Install Vercel CLI: `npm i -g vercel`
  - [ ] Login: `vercel login`
  - [ ] Link project: `vercel link`

- [ ] **Deploy Staging**
  ```bash
  cd apps/web
  vercel --env staging
  ```

- [ ] **Configure Environment Variables**
  - [ ] Go to Vercel dashboard
  - [ ] Add production environment variables
  - [ ] Set `NEXT_PUBLIC_FACILITATOR_URL=https://api.tortoise-os.io`
  - [ ] Set `NEXT_PUBLIC_TOS_CONTRACT=<MAINNET_PACKAGE_ID>`
  - [ ] Set `NEXT_PUBLIC_NETWORK=mainnet`

- [ ] **Test Staging**
  - [ ] Visit staging URL
  - [ ] Test wallet connection
  - [ ] Test payment flow with x402
  - [ ] Verify TOS token integration
  - [ ] Check all pages load correctly

### Deployment to Production

- [ ] **Production Deploy**
  ```bash
  vercel --prod
  ```

- [ ] **Configure Custom Domain**
  - [ ] Add `tortoise-os.io` in Vercel
  - [ ] Add `app.tortoise-os.io` in Vercel
  - [ ] Update DNS records
  - [ ] Verify SSL certificates

- [ ] **Post-Deployment**
  - [ ] Run full smoke test
  - [ ] Test from multiple devices/browsers
  - [ ] Verify analytics working
  - [ ] Check error tracking (Sentry if configured)

- [ ] **Performance**
  - [ ] Run Lighthouse audit
  - [ ] Check Core Web Vitals
  - [ ] Verify CDN caching
  - [ ] Test load time from different regions

---

## Component 5: SDKs & Libraries

**Priority**: MEDIUM  
**Estimated Time**: 1 day  
**Dependencies**: All contracts deployed

### Strategy SDK

- [ ] **Update Configuration**
  - [ ] Update package IDs in `packages/strategy-sdk/src/config.ts`
  - [ ] Set mainnet contract addresses
  - [ ] Update TOS token address

- [ ] **Testing**
  ```bash
  cd packages/strategy-sdk
  bun test
  ```
  - [ ] All tests pass
  - [ ] Integration tests with mainnet contracts

- [ ] **Publishing**
  ```bash
  bun run build
  npm publish --access public
  ```
  - [ ] Published to npm: `@carapace/strategy-sdk`
  - [ ] Version tagged: `v1.0.0`

### Carapace UI

- [ ] **Update Components**
  - [ ] Replace TEST references with TOS
  - [ ] Update token icons
  - [ ] Check component compatibility

- [ ] **Build & Publish**
  ```bash
  cd packages/carapace-ui
  bun run build
  npm publish --access public
  ```
  - [ ] Published to npm: `@carapace/ui`

### Main SDK

- [ ] **Update & Publish**
  ```bash
  cd packages/sdk
  bun run build
  npm publish --access public
  ```
  - [ ] Published to npm: `@carapace/sdk`

### Documentation

- [ ] **Update Docs**
  - [ ] Update contract addresses in docs
  - [ ] Add production API endpoints
  - [ ] Update code examples
  - [ ] Add troubleshooting guides

- [ ] **Deploy Docs Site** (if applicable)
  - [ ] Build docs: `bun run docs:build`
  - [ ] Deploy to docs.tortoise-os.io
  - [ ] Test all examples

---

## Post-Deployment: Operations

### Week 1: Intensive Monitoring

- [ ] **Daily Tasks**
  - [ ] Check facilitator wallet balance
  - [ ] Review error logs
  - [ ] Monitor transaction volume
  - [ ] Check system health dashboards
  - [ ] Verify TOS token liquidity

- [ ] **Metrics to Track**
  - [ ] x402 payment settlements: `_____` per day
  - [ ] TOS holders: `_____`
  - [ ] Website traffic: `_____` visits/day
  - [ ] API uptime: `_____%`
  - [ ] Error rate: `_____%`

### Week 2-4: Stabilization

- [ ] **Weekly Tasks**
  - [ ] Review weekly metrics
  - [ ] Analyze user feedback
  - [ ] Plan improvements
  - [ ] Update documentation as needed
  - [ ] Consider scaling if needed

- [ ] **Performance Tuning**
  - [ ] Optimize slow endpoints
  - [ ] Increase cache TTLs if appropriate
  - [ ] Scale infrastructure if needed
  - [ ] Review and adjust rate limits

### Ongoing Maintenance

- [ ] **Monthly Tasks**
  - [ ] Security updates
  - [ ] Dependency updates
  - [ ] Review and rotate keys
  - [ ] Backup important data
  - [ ] Financial reporting (if applicable)

- [ ] **Quarterly Tasks**
  - [ ] Security audit
  - [ ] Performance review
  - [ ] Cost optimization
  - [ ] Feature roadmap planning
  - [ ] TOS token burns (if revenue sufficient)

---

## Production Readiness Checklist

### Security ✅

- [ ] All private keys stored securely
- [ ] Multi-sig wallets configured (3/5)
- [ ] 2FA enabled on all accounts
- [ ] Rate limiting active
- [ ] CORS configured properly
- [ ] Input validation in place
- [ ] HTTPS everywhere
- [ ] Secrets in Fly.io secrets (not in code)
- [ ] Emergency procedures documented
- [ ] Incident response plan ready

### Monitoring ✅

- [ ] Health checks configured
- [ ] Prometheus metrics exposed
- [ ] Grafana dashboards created
- [ ] Alerts configured (Slack/email)
- [ ] Wallet balance monitoring
- [ ] Error rate monitoring
- [ ] Uptime monitoring (Better Uptime)
- [ ] Log aggregation (optional)

### Documentation ✅

- [ ] README.md updated
- [ ] API documentation complete (OpenAPI)
- [ ] Deployment guides current
- [ ] Runbook created
- [ ] Architecture diagrams
- [ ] Troubleshooting guides
- [ ] Contact information for emergencies

### Infrastructure ✅

- [ ] Production domain configured
- [ ] SSL certificates active
- [ ] CDN configured (for web app)
- [ ] Backups configured (if stateful)
- [ ] Disaster recovery plan
- [ ] Scaling plan documented

### Testing ✅

- [ ] Unit tests: 100% passing
- [ ] Integration tests: 100% passing
- [ ] Load tests completed
- [ ] Security tests passed
- [ ] User acceptance testing done
- [ ] Smoke tests documented

### Compliance ✅

- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Legal disclaimer for TOS token
- [ ] GDPR compliance (if EU users)
- [ ] KYC/AML plan (if needed)

---

## Emergency Contacts

**Infrastructure**:
- Fly.io Support: `_________________`
- Vercel Support: `_________________`
- DNS Provider: `_________________`

**Team**:
- Technical Lead: `_________________`
- DevOps: `_________________`
- Security: `_________________`

**Multi-Sig Key Holders**:
1. Name: `_________________`, Contact: `_________________`
2. Name: `_________________`, Contact: `_________________`
3. Name: `_________________`, Contact: `_________________`
4. Name: `_________________`, Contact: `_________________`
5. Name: `_________________`, Contact: `_________________`

---

## Rollback Procedures

### If TOS Token Issues

```bash
# Cannot rollback token - plan carefully!
# If issues found:
# 1. Pause trading on DEX
# 2. Communicate with community
# 3. Plan migration if necessary
```

### If x402 Facilitator Issues

```bash
# Rollback to previous version
fly releases rollback --app x402-facilitator-prod

# Or scale down
fly scale count 0 --app x402-facilitator-prod

# Investigate and fix, then redeploy
```

### If Move Contracts Issues

```bash
# Cannot rollback deployed contracts
# If critical bug:
# 1. Pause contract (if emergency stop exists)
# 2. Deploy patched version
# 3. Migrate users to new version
```

### If Web App Issues

```bash
# Vercel instant rollback
vercel rollback <deployment-url>

# Or use Vercel dashboard
```

---

## Success Criteria

### Day 1
- [ ] All components deployed and healthy
- [ ] No critical errors in logs
- [ ] First successful payment processed
- [ ] TOS token trading on DEX

### Week 1
- [ ] 100+ TOS holders
- [ ] 10+ successful payments via x402
- [ ] 99% uptime for all services
- [ ] No security incidents

### Month 1
- [ ] 1,000+ TOS holders
- [ ] 1,000+ payments processed
- [ ] 3+ dApps using Carapace infrastructure
- [ ] Community engaged and growing

---

## Budget Tracking

### Infrastructure Costs (Monthly)

```
Fly.io (x402 facilitator):  $13.00
Vercel (web app):           $0.00 (free tier)
Grafana Cloud:              $0.00 (free tier)
Better Uptime:              $0.00 (free tier)
Domain (yearly/12):         $1.00
─────────────────────────────────
Total:                      ~$14/month
```

### Gas Costs (Estimated)

```
TOS Token Deployment:       ~0.5 SUI
Move Contracts Deploy:      ~2.0 SUI
Facilitator Operations:     ~1.0 SUI/day
────────────────────────────────
Initial: ~2.5 SUI
Monthly: ~30 SUI
```

---

## Notes

- **Take it slow**: Deploy to testnet first, monitor for at least 1 week
- **Communicate**: Keep community informed throughout deployment
- **Monitor closely**: First 72 hours are critical
- **Have backups**: Always have a rollback plan
- **Document everything**: Record all package IDs, wallet addresses, decisions

---

**Good luck with your production deployment! 🐢**

**"Slow and Steady Builds the Future"**
