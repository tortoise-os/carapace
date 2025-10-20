# Carapace Implementation Plan: AMM + Vault

> Phase 1 execution roadmap for TortoiseSwap AMM and TortoiseVault

## Executive Summary

This document outlines the complete implementation strategy for Carapace Phase 1, delivering:

1. **TortoiseSwap AMM** - Intelligent constant product market maker
2. **TortoiseVault** - AI-powered auto-compounding vault

**Timeline**: 8-12 weeks
**Team Size**: 2-4 developers
**Milestones**: 4 major releases

---

## Part 1: TortoiseSwap AMM

### Overview

TortoiseSwap is a constant product AMM (x * y = k) with AI-enhanced dynamic fee optimization, built on Sui's shared object model for maximum composability.

### Technical Specifications

#### Core AMM Mechanics

```
Formula: x * y = k (constant product)
Fee Structure: 0.20% - 0.40% (dynamic, AI-adjusted)
Slippage Protection: User-defined minimum output
Flash Swap Support: Yes
Pool Types: Generic liquidity pools for any SUI fungible tokens
```

#### Smart Contract Architecture

**Module Structure:**
```
move/sources/amm/
├── pool.move              # Core pool logic and state
├── router.move            # Swap routing and path finding
├── liquidity.move         # LP token management
├── math.move              # Mathematical calculations
├── fee.move               # Fee calculation and distribution
└── events.move            # Event emissions
```

#### Key Move Structs

```move
// Pool shared object
struct Pool<phantom X, phantom Y> has key {
    id: UID,
    reserve_x: Balance<X>,
    reserve_y: Balance<Y>,
    lp_supply: Supply<LP<X, Y>>,
    fee_rate: u64,  // basis points (20-40 bps)
    protocol_fee: u64,  // percentage of swap fees
}

// LP token
struct LP<phantom X, phantom Y> has drop {}

// Pool creation capability
struct PoolCap has key, store {
    id: UID,
}
```

#### Core Functions

1. **Pool Creation**
```move
public fun create_pool<X, Y>(
    ctx: &mut TxContext
): Pool<X, Y>
```

2. **Add Liquidity**
```move
public fun add_liquidity<X, Y>(
    pool: &mut Pool<X, Y>,
    token_x: Coin<X>,
    token_y: Coin<Y>,
    min_liquidity: u64,
    ctx: &mut TxContext
): Coin<LP<X, Y>>
```

3. **Remove Liquidity**
```move
public fun remove_liquidity<X, Y>(
    pool: &mut Pool<X, Y>,
    lp_token: Coin<LP<X, Y>>,
    min_x: u64,
    min_y: u64,
    ctx: &mut TxContext
): (Coin<X>, Coin<Y>)
```

4. **Swap**
```move
public fun swap_x_to_y<X, Y>(
    pool: &mut Pool<X, Y>,
    token_x: Coin<X>,
    min_out: u64,
    ctx: &mut TxContext
): Coin<Y>
```

5. **Get Quote**
```move
public fun get_amount_out<X, Y>(
    pool: &Pool<X, Y>,
    amount_in: u64,
    is_x_to_y: bool
): u64
```

#### AI Fee Optimizer (Off-chain)

**Architecture:**
```
┌─────────────────────────────────────────┐
│     Fee Optimizer Service (Node.js)     │
├─────────────────────────────────────────┤
│  Data Collection                        │
│  ├── Pool state monitoring              │
│  ├── Price volatility tracking          │
│  ├── Volume analysis                    │
│  └── Market depth metrics               │
├─────────────────────────────────────────┤
│  ML Model (TensorFlow.js)               │
│  ├── Volatility prediction              │
│  ├── Optimal fee calculation            │
│  └── Model stored on Walrus             │
├─────────────────────────────────────────┤
│  Fee Adjustment                         │
│  ├── Keeper bot                         │
│  ├── Update pool fee_rate               │
│  └── Gas optimization                   │
└─────────────────────────────────────────┘
```

**Implementation:**
- Location: `apps/api/services/fee-optimizer/`
- Framework: TensorFlow.js for Node
- Model Storage: Walrus decentralized storage
- Update Frequency: Every 1 hour or on significant volatility
- Input Features:
  - Price volatility (24h, 7d)
  - Trading volume
  - Pool TVL
  - Market depth
  - Cross-DEX spreads

### Implementation Phases

#### Phase 1.1: Core AMM (Week 1-2)

**Tasks:**
- [ ] Set up Move project structure
- [ ] Implement `pool.move` with basic pool logic
- [ ] Implement `math.move` with AMM formulas
- [ ] Write comprehensive unit tests
- [ ] Deploy to Sui devnet

**Deliverables:**
- Working pool creation
- Basic swap functionality
- LP token minting/burning
- Test coverage > 90%

#### Phase 1.2: Router & Multi-hop (Week 3)

**Tasks:**
- [ ] Implement `router.move` for optimal path finding
- [ ] Add multi-hop swap support
- [ ] Implement price impact calculation
- [ ] Add slippage protection

**Deliverables:**
- Multi-hop routing
- Optimal swap paths
- Price impact warnings

#### Phase 1.3: Frontend Integration (Week 4)

**Tasks:**
- [ ] Build SDK wrapper in `packages/sdk/`
- [ ] Create swap UI components
- [ ] Build liquidity provision interface
- [ ] Add pool analytics dashboard
- [ ] Implement wallet connection

**Deliverables:**
- Functional web interface at `apps/web/`
- Real-time pool data
- Transaction history
- Portfolio tracking

#### Phase 1.4: AI Fee Optimizer (Week 5)

**Tasks:**
- [ ] Build data collection service
- [ ] Train volatility prediction model
- [ ] Implement fee adjustment keeper
- [ ] Deploy model to Walrus
- [ ] Set up monitoring

**Deliverables:**
- Automated fee optimization
- Model performance metrics
- Fee adjustment history

---

## Part 2: TortoiseVault

### Overview

TortoiseVault is an auto-compounding yield aggregator that optimizes farming strategies using reinforcement learning in a Trusted Execution Environment (Nautilus).

### Technical Specifications

#### Vault Mechanics

```
Strategy: Auto-compounding yield farming
Optimization: RL-based allocation in TEE
Rebalancing: Dynamic based on APY changes
Fee Structure: 2% management fee + 10% performance fee
Supported Protocols: TortoiseSwap, external DEXs, lending protocols
```

#### Smart Contract Architecture

**Module Structure:**
```
move/sources/vault/
├── vault.move             # Core vault logic
├── strategy.move          # Strategy interface and implementations
├── shares.move            # Vault share token
├── rewards.move           # Reward tracking and distribution
├── rebalancer.move        # Portfolio rebalancing
└── governance.move        # Admin and governance functions
```

#### Key Move Structs

```move
// Vault shared object
struct Vault<phantom T> has key {
    id: UID,
    deposits: Balance<T>,
    total_shares: Supply<VaultShare<T>>,
    strategies: vector<StrategyInfo>,
    last_harvest: u64,
    performance_fee: u64,
    management_fee: u64,
}

// Vault share token
struct VaultShare<phantom T> has drop {}

// Strategy info
struct StrategyInfo has store {
    strategy_id: ID,
    allocation_bps: u64,  // basis points (max 10000)
    deployed_amount: u64,
    cumulative_return: u64,
}

// Strategy interface
struct Strategy has key, store {
    id: UID,
    name: String,
    protocol: String,
    risk_level: u8,
}
```

#### Core Functions

1. **Deposit**
```move
public fun deposit<T>(
    vault: &mut Vault<T>,
    amount: Coin<T>,
    ctx: &mut TxContext
): Coin<VaultShare<T>>
```

2. **Withdraw**
```move
public fun withdraw<T>(
    vault: &mut Vault<T>,
    shares: Coin<VaultShare<T>>,
    ctx: &mut TxContext
): Coin<T>
```

3. **Harvest & Compound**
```move
public fun harvest<T>(
    vault: &mut Vault<T>,
    ctx: &mut TxContext
)
```

4. **Rebalance**
```move
public fun rebalance<T>(
    vault: &mut Vault<T>,
    new_allocations: vector<u64>,
    ctx: &mut TxContext
)
```

5. **Add Strategy**
```move
public fun add_strategy<T>(
    vault: &mut Vault<T>,
    strategy: Strategy,
    allocation_bps: u64,
    ctx: &mut TxContext
)
```

#### Strategy Implementations

**Initial Strategies:**

1. **TortoiseSwap LP Strategy**
   - Provide liquidity to TortoiseSwap pools
   - Collect swap fees
   - Auto-compound rewards

2. **Lending Strategy**
   - Supply assets to lending protocols
   - Earn interest
   - Optimize rates across protocols

3. **Staking Strategy**
   - Stake native tokens
   - Collect staking rewards
   - Auto-compound

#### AI Optimizer (Nautilus TEE)

**Architecture:**
```
┌─────────────────────────────────────────┐
│   Strategy Optimizer (Nautilus TEE)    │
├─────────────────────────────────────────┤
│  Data Aggregation                       │
│  ├── Strategy APYs                      │
│  ├── Risk metrics                       │
│  ├── Gas costs                          │
│  └── Historical performance             │
├─────────────────────────────────────────┤
│  RL Agent (PyTorch in TEE)              │
│  ├── State: Portfolio allocation        │
│  ├── Actions: Rebalance decisions       │
│  ├── Rewards: Risk-adjusted returns     │
│  └── Training: Continuous learning      │
├─────────────────────────────────────────┤
│  Execution                              │
│  ├── Rebalancing signals                │
│  ├── Transaction signing in TEE         │
│  └── Performance tracking               │
└─────────────────────────────────────────┘
```

**Implementation:**
- Location: `apps/api/services/vault-optimizer/`
- Framework: PyTorch for RL
- TEE: Nautilus secure enclave
- Algorithm: Proximal Policy Optimization (PPO)
- Update Frequency: Every 6 hours or on significant APY changes
- State Space:
  - Current allocations
  - Strategy APYs
  - Risk scores
  - Gas costs
  - Portfolio value
- Action Space:
  - Allocation percentages for each strategy
  - Harvest/compound timing

### Implementation Phases

#### Phase 2.1: Core Vault (Week 6-7)

**Tasks:**
- [ ] Implement `vault.move` with deposit/withdraw
- [ ] Implement `shares.move` for share token logic
- [ ] Build share price calculation
- [ ] Implement fee collection
- [ ] Write comprehensive tests

**Deliverables:**
- Working vault deposits/withdrawals
- Share token system
- Fee collection mechanism
- Test coverage > 90%

#### Phase 2.2: Strategy Framework (Week 7-8)

**Tasks:**
- [ ] Design strategy interface
- [ ] Implement TortoiseSwap LP strategy
- [ ] Build strategy allocation logic
- [ ] Implement rebalancing mechanism
- [ ] Add harvest automation

**Deliverables:**
- Strategy plugin system
- At least 1 working strategy
- Automated compounding
- Rebalancing functions

#### Phase 2.3: Frontend Integration (Week 9)

**Tasks:**
- [ ] Build vault UI components
- [ ] Create deposit/withdraw interface
- [ ] Add strategy performance dashboard
- [ ] Show APY calculations
- [ ] Display user positions

**Deliverables:**
- Functional vault interface
- Performance metrics
- User portfolio tracking
- APY projections

#### Phase 2.4: AI Optimizer in TEE (Week 10-11)

**Tasks:**
- [ ] Set up Nautilus TEE environment
- [ ] Implement RL agent (PPO algorithm)
- [ ] Build strategy performance tracker
- [ ] Train optimization model
- [ ] Deploy to TEE
- [ ] Implement keeper for rebalancing

**Deliverables:**
- RL-optimized allocations
- Secure execution in TEE
- Automated rebalancing
- Performance analytics

---

## Integration & Testing (Week 12)

### Integration Tasks

- [ ] Connect AMM and Vault (LP tokens in vault)
- [ ] End-to-end testing
- [ ] Security audit preparation
- [ ] Performance optimization
- [ ] Gas optimization
- [ ] Documentation completion

### Testing Strategy

#### Unit Tests
- All Move functions
- Edge cases and error handling
- Mathematical correctness
- Access control

#### Integration Tests
- Multi-step flows (deposit → swap → provide liquidity)
- Cross-module interactions
- Event emissions

#### E2E Tests
- Frontend → Backend → Blockchain
- User workflows
- Error handling
- Transaction simulations

#### Security Tests
- Access control verification
- Reentrancy checks
- Integer overflow/underflow
- Price manipulation scenarios
- Flash loan attacks

---

## Deployment Strategy

### Testnet Deployment (Week 12)

1. **Sui Devnet**
   - Initial testing and debugging
   - Developer access only

2. **Sui Testnet**
   - Public testing
   - Bug bounty program
   - Community feedback

### Mainnet Deployment (Week 13+)

**Prerequisites:**
- [ ] Security audit completed
- [ ] Bug bounty run (2 weeks minimum)
- [ ] Emergency pause mechanism tested
- [ ] Monitoring and alerting set up
- [ ] Documentation finalized

**Launch Plan:**
1. Deploy contracts
2. Verify on-chain
3. Initialize pools with limited liquidity
4. Gradual TVL cap increase
5. Full launch after 1 week

---

## Technical Dependencies

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Blockchain | Sui | Smart contract platform |
| Frontend | Next.js 14 | Web interface |
| Backend | Express + Bun | API and services |
| Database | PostgreSQL | Off-chain data |
| Caching | Redis | Performance |
| Storage | Walrus | AI model storage |
| TEE | Nautilus | Secure computation |
| Monitoring | Grafana + Prometheus | System health |
| Indexer | Custom Sui indexer | Event processing |

### External APIs

- Sui RPC nodes
- Price oracles (Pyth, Switchboard)
- DEX aggregators for comparison
- Gas price feeds

---

## Resource Requirements

### Team Structure

| Role | Count | Responsibilities |
|------|-------|------------------|
| Move Developer | 2 | Smart contracts |
| Full-stack Developer | 2 | Frontend + Backend |
| ML Engineer | 1 | AI optimizer |
| DevOps | 1 | Infrastructure |
| Security Auditor | 1 | Code review |

### Infrastructure Costs (Monthly)

- Sui RPC nodes: $200
- Cloud hosting: $500
- Database: $100
- Monitoring: $50
- Storage (Walrus): $50
- TEE (Nautilus): $300
- **Total: ~$1,200/month**

---

## Risk Management

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Smart contract bugs | High | Audits, testing, bug bounty |
| Price manipulation | High | Time-weighted oracles, limits |
| AI optimizer failure | Medium | Manual override, fallback strategy |
| TEE compromise | Medium | Attestation verification, monitoring |
| Gas cost spikes | Low | Optimization, batching |

### Economic Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low liquidity | Medium | Incentive programs |
| Impermanent loss | Medium | User education, IL protection |
| Bank runs | High | Withdrawal limits, gradual rollout |
| Fee optimization errors | Medium | Conservative bounds, monitoring |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Keeper downtime | Medium | Redundant keepers, alerts |
| Oracle failures | High | Multiple oracle sources |
| Frontend bugs | Low | Thorough testing, gradual rollout |
| Key management | High | Hardware wallets, multisig |

---

## Success Metrics

### Phase 1 Goals (Month 1-3)

| Metric | Target |
|--------|--------|
| Total Value Locked (TVL) | $1M+ |
| Daily Active Users | 100+ |
| Daily Volume (AMM) | $100K+ |
| Vault APY | > Market average |
| Smart Contract Uptime | 99.9% |
| Frontend Performance | < 2s load time |
| Test Coverage | > 90% |

### Phase 1 KPIs

- Number of liquidity pools created
- Trading pairs supported
- Unique depositors in vault
- Average vault deposit size
- Fee revenue generated
- AI model prediction accuracy
- Gas cost per transaction
- User retention rate (30-day)

---

## Next Steps

### Immediate Actions (This Week)

1. **Set up development environment**
   - Install Sui CLI
   - Configure Docker
   - Set up local Sui network

2. **Initialize Move project**
   ```bash
   cd move
   sui move new tortoise_amm
   sui move new tortoise_vault
   ```

3. **Create project skeleton**
   - Set up module structure
   - Write interface definitions
   - Create initial tests

4. **Begin Phase 1.1: Core AMM**
   - Implement pool creation
   - Build basic swap logic
   - Write math functions

### Weekly Sync Points

- Monday: Sprint planning
- Wednesday: Technical review
- Friday: Demo & retrospective

### Questions to Address

1. What should the initial fee range be? (Proposal: 0.25% - 0.35%)
2. Which external protocols should vault integrate first?
3. What should TVL caps be for testnet? (Proposal: $10K initial)
4. Oracle provider preference? (Proposal: Pyth Network)
5. Bug bounty budget? (Proposal: $50K)

---

## Appendix

### Useful Resources

- [Sui Move Book](https://move-book.com)
- [Sui Framework Source](https://github.com/MystenLabs/sui)
- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)
- [Yearn Finance Docs](https://docs.yearn.fi)
- [Nautilus Documentation](https://docs.nautilus.network)
- [Walrus Documentation](https://docs.walrus.site)

### Example Implementations

- **Sui AMMs:**
  - Cetus Protocol
  - Turbos Finance
  - Aftermath Finance

- **Yield Optimizers:**
  - Yearn Finance (Ethereum)
  - Beefy Finance (Multi-chain)
  - Autofarm (BSC)

### Contact

- Project Lead: [Your Name]
- Technical Lead: [Name]
- Security: security@tortoiseos.dev
- Community: [Discord/Telegram]

---

**Last Updated**: 2025-10-18
**Version**: 1.0
**Status**: Ready for execution
