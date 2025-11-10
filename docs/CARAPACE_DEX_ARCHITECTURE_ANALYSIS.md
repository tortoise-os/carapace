# Carapace DEX Architecture Analysis

## Executive Summary

Carapace is a foundational DEX layer for TortoiseOS built on Sui, implementing a constant product AMM (TortoiseSwap) with flash loans and an auto-compounding vault. The architecture is currently **privacy-agnostic** - transactions are fully transparent on-chain with no transaction ordering protections or privacy features. This analysis identifies current capabilities and integration points for privacy features.

**Key Finding:** The flash loan infrastructure is well-designed with "hot potato" patterns that could be leveraged for privacy-preserving bundled transactions.

---

## 1. POOL STRUCTURE (Move Contracts)

### Location
- `/move/sources/amm/pool.move` - Core AMM implementation
- `/move/sources/common/math.move` - Mathematical utilities
- `/move/sources/vault/vault.move` - Auto-compounding vault

### Pool Architecture

```move
public struct Pool<phantom X, phantom Y> has key {
    id: object::UID,
    reserve_x: Balance<X>,
    reserve_y: Balance<Y>,
    lp_supply: Supply<LP<X, Y>>,
    fee_bps: u64,                    // 20-40 bps configurable
    protocol_fee_bps: u64,           // 16.67% of swap fees
    protocol_fee_x: Balance<X>,
    protocol_fee_y: Balance<Y>,
    paused: bool,
}
```

**Key Characteristics:**
- Constant product formula: `(reserve_in + amount_in) * (reserve_out - amount_out) = k`
- Dynamic fees: 25 bps default (adjustable 20-40 bps range)
- Protocol fee collection: 16.67% of swap fees (≈4.17 bps of total)
- Minimum liquidity lock: 1000 units burned on pool creation
- Shared object pools: Transactions serialize access naturally

**Visibility Issues:**
- ✅ Pool structure is immutable and transparent
- ❌ Reserve changes are visible in transaction events
- ❌ All swap details emitted in `Swapped` events with amounts and direction
- ❌ Order of execution visible from transaction block structure

### Fee Structure
```
Transaction Fee Flow:
1. Swap fee: amountIn * 25 bps = swap_fee
2. Protocol fee: swap_fee * 1667 bps = protocol_fee (≈4.17% of input)
3. LP fee: swap_fee - protocol_fee (≈20.83 bps stays in pool)
```

**MEV Vector:**
- No fee slippage protection beyond min_amount_out
- Clear fee schedule visible to all actors
- No sandwich attack mitigation

---

## 2. TRANSACTION/SWAP EXECUTION

### SDK Transaction Building (pool-client.ts)

```typescript
swapXToY(
    poolId: ObjectId,
    typeX: string,
    typeY: string,
    coinX: ObjectId | null,
    amountIn: bigint,
    senderAddress: string,
    minAmountOut: bigint = 0n,
): Transaction
```

**Execution Flow:**
1. User specifies `amountIn` and `minAmountOut` (slippage tolerance)
2. Transaction splits coin and calls `pool::swap_x_to_y`
3. Pool validates slippage: `assert!(amount_out >= min_amount_out)`
4. Constant product formula applied on-chain
5. Output coin transferred to sender in same transaction

**No Transaction Batching:**
- Each swap is an atomic single-transaction operation
- Multi-hop swaps require sequential transactions (3 separate transactions for 3-hop)
- No bundling mechanism for atomic operations across pools

### API Endpoints (routes/pools.ts)

```
GET /api/pools                  # List all pools
GET /api/pools/:id              # Pool details
GET /api/pools/:id/quote        # Swap quote (off-chain calculation)
GET /api/pools/:id/price        # Current spot price
GET /api/pools/:id/price-history # Historical data (mocked)
POST /api/pools/:id/swap        # Create swap transaction
```

**Quote Calculation:**
```typescript
calculateSwapOutput(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeBps: number
): bigint {
    const fee = (amountIn * BigInt(feeBps)) / 10000n;
    const amountInAfterFee = amountIn - fee;
    const numerator = amountInAfterFee * reserveOut;
    const denominator = reserveIn + amountInAfterFee;
    return numerator / denominator;
}
```

**Privacy Issues:**
- ✅ Quotes are calculated off-chain (can't be front-run for estimation)
- ❌ Actual execution on-chain is fully observable
- ❌ Quote caching is visible to attackers (same cache key = same parameters)
- ❌ No quote expiry or signing mechanism

---

## 3. FLASH LOAN IMPLEMENTATION

### Flash Loan Architecture (pool.move)

#### Single-Token Flash Loan (Recommended)

```move
public struct FlashLoan<phantom T> {
    pool_id: object::ID,
    amount: u64,
    fee: u64,  // 0.05% of borrowed amount
}

public fun flash_borrow_x<X, Y>(
    pool: &mut Pool<X, Y>,
    amount: u64,
    ctx: &mut TxContext
): (Coin<X>, FlashLoan<X>)

public fun repay_flash_loan_x<X, Y>(
    pool: &mut Pool<X, Y>,
    repayment: Coin<X>,
    receipt: FlashLoan<X>,
)
```

#### Flash Swap (Dual-Token)

```move
public struct FlashSwap<phantom X, phantom Y> {
    pool_id: object::ID,
    borrowed_x: u64,
    borrowed_y: u64,
    repay_x: u64,
    repay_y: u64,
}

public fun flash_swap<X, Y>(
    pool: &mut Pool<X, Y>,
    borrow_x: u64,
    borrow_y: u64,
): (Coin<X>, Coin<Y>, FlashSwap<X, Y>)
```

**Key Features:**
- ✅ "Hot potato" pattern: Receipt must be consumed in same transaction
- ✅ Enforces atomic execution: Can't escape without repayment
- ✅ Fee: 0.05% (5 bps) of borrowed amount
- ✅ Protocol fee collection: 16.67% of flash loan fees
- ✅ Can borrow up to (reserve - 1) units

**Flash Loan Use Cases (Current SDK):**

```typescript
buildArbitrageFlashLoan(
    borrowPoolId: ObjectId,
    swapPoolId: ObjectId,
    borrowAmount: bigint,
    minReturnAmount: bigint,
    isTokenX: boolean,
): Transaction
```

Borrow from pool A → Swap on pool B → Repay to pool A (in single transaction)

**Privacy Implications:**
- ✅ Hot potato prevents external manipulation
- ❌ Entire flash loan sequence visible on-chain
- ❌ Borrowed amounts, swap details all in transaction events
- ❌ No mechanism to hide arbitrage intent or endpoints

---

## 4. CURRENT PRIVACY FEATURES (LACK THEREOF)

### What's NOT Implemented

#### Transaction Privacy
- ❌ No transaction encryption
- ❌ No sender address hiding
- ❌ No amount obfuscation
- ❌ All transaction data in public mempool

#### Order Privacy
- ❌ No transaction ordering protections
- ❌ No fair ordering service
- ❌ No MEV-resistant sequencing
- ❌ Sui validators could reorder/sandwich naturally

#### Pool Privacy
- ❌ No hidden reserve information
- ❌ All pool states publicly readable
- ❌ No zero-knowledge proofs for swaps

#### Quote Privacy
- ❌ Quote calculations are deterministic and visible
- ❌ Cache keys reveal parameters to attackers
- ❌ No quote confidentiality

### Existing Slippage Protection
- ✅ `minAmountOut` parameter prevents extreme slippage
- ✅ Price impact warnings in UI (1%, 3%, 5% thresholds)
- ✅ High-impact confirmation dialogs
- ❌ But: No MEV/sandwich attack protection

**Example:** Swap with 1% max slippage:
```typescript
const expectedOut = 1000 * 1e6;  // Based on current spot price
const minAmountOut = expectedOut * 0.99n;  // Allow 1% slippage

swapXToY(
    poolId,
    tokenX,
    tokenY,
    coinX,
    amountIn,
    senderAddress,
    minAmountOut
)
```

---

## 5. TRANSACTION BUNDLING & MEV

### Current MEV Vulnerabilities

#### Sandwich Attacks
```
Attacker sees pending swap in mempool:
1. Attacker buys before (increases spot price)
2. User's swap executes at worse price
3. Attacker sells after (price returns, profit locked in)

Example (5% slippage):
- Spot price: 1 ETH = 1000 USDC
- User: Swap 10 ETH for USDC
- Attacker buys 1000 ETH first → price slips to 1 ETH = 900 USDC
- User gets 9000 USDC instead of 10000 (1000 USDC loss)
- Attacker sells 1000 ETH back → price recovers
- Profit: ~500 USDC - fees
```

#### Atomic Swap Limitations
- 3-hop swaps require 3 separate transactions
- Vulnerabilities between hops (MEV exposure)
- Price could move between hop 1 and hop 2

#### No Execution Ordering Commitment
- Validators on Sui control transaction ordering
- No cryptographic commitment to order
- No threshold encryption

### Where Bundling is Needed

| Scenario | Current State | Privacy Need |
|----------|---------------|--------------|
| Multi-hop swaps (3+ hops) | Sequential transactions | Atomic bundling |
| Liquidations | Visible on-chain | Order privacy |
| Large swaps | Mempool visibility | Amount privacy |
| Arbitrage | Observable pattern | Intent privacy |
| Flash loans | All details visible | Operation privacy |

---

## 6. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                     Carapace DEX Layer                          │
└─────────────────────────────────────────────────────────────────┘

                    Frontend Layer
         ┌──────────────────────────────┐
         │  Next.js Web App (Port 3501) │
         │  - Swap Interface            │
         │  - Analytics Dashboard       │
         │  - Vault Management          │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   Backend API (Bun/Express)  │
         │   - Routes: /api/pools       │
         │   - /api/transactions        │
         │   - /api/analytics           │
         └──────────────┬───────────────┘
                        │
              ┌─────────┼─────────┐
              │         │         │
              ▼         ▼         ▼
         ┌────────┐ ┌──────┐ ┌───────────┐
         │ Cache  │ │  DB  │ │Blockchain │
         │(Redis) │ │      │ │ Service   │
         └────────┘ └──────┘ └────┬──────┘
                                  │
                        ┌─────────┴─────────┐
                        │                   │
                        ▼                   ▼
                ┌──────────────────┐  ┌──────────────────┐
                │   Sui Network    │  │  TypeScript SDK  │
                │  - Move Contracts│  │  - PoolClient    │
                │  - Object Pools  │  │  - RouterClient  │
                │  - Flash Loans   │  │  - Transaction   │
                │                  │  │    Builder       │
                └──────────────────┘  └──────────────────┘

                    Strategy SDK (Separate Package)
         ┌──────────────────────────────────────────────┐
         │  FlashLoanBuilder & FlashLoanClient          │
         │  - Arbitrage flash loans                     │
         │  - Flash loan execution                      │
         │  - Fee calculations                          │
         └──────────────────────────────────────────────┘
```

---

## 7. PRIVACY INTEGRATION POINTS

### High-Confidence Integration Points

#### 1. **Flash Loan Bundling** ✅ READY
- Location: `/move/sources/amm/pool.move` (lines 497-614)
- Current state: Hot potato pattern already enforces atomicity
- Integration: Wrap flash loans with threshold encryption
- Benefit: Bundles multiple operations atomically
- Complexity: LOW

```move
// Current structure can support wrapped execution
public fun flash_borrow_x<X, Y>(
    pool: &mut Pool<X, Y>,
    amount: u64,
    ctx: &mut TxContext
): (Coin<X>, FlashLoan<X>)
```

**Privacy Addition:**
```move
// New: Encrypted callback for bundled operations
public fun flash_borrow_x_private<X, Y>(
    pool: &mut Pool<X, Y>,
    amount: u64,
    encrypted_callback: vector<u8>,  // Encrypted operations
    commitment: vector<u8>,          // Hash commitment
    ctx: &mut TxContext
): (Coin<X>, FlashLoan<X>)
```

#### 2. **Quote Privacy (Off-Chain)** ✅ IMPLEMENTABLE
- Location: `/packages/sdk/src/pool-client.ts` (lines 116-151)
- Current state: Quotes are deterministic, visible pattern
- Integration: Add quote encryption to API layer
- Benefit: Hide quote parameters from attackers
- Complexity: MEDIUM

```typescript
// Current (Privacy Risk)
async getSwapQuote(poolId, amountIn, isXToY)

// Future (Private)
async getSwapQuoteEncrypted(poolId, encryptedParams, commitment)
```

#### 3. **Transaction Ordering in Bundles** ✅ DESIGNABLE
- Location: Strategy SDK (`/packages/strategy-sdk/`)
- Current state: Flash loans already atomic
- Integration: Add ordering randomization to builder
- Benefit: Prevent sandwich attacks within bundles
- Complexity: MEDIUM

```typescript
class PrivateFlashLoanBuilder {
    buildBundledTransaction(operations: Operation[]): EncryptedTx {
        // 1. Shuffle operations randomly
        // 2. Create commitments for order hiding
        // 3. Encrypt execution details
        // 4. Create atomic bundle
    }
}
```

#### 4. **Amount Privacy (Homomorphic Encryption)** ⚠️ RESEARCH NEEDED
- Location: Move contract swap logic
- Current state: All amounts visible in events
- Integration: Replace event emissions with encrypted proofs
- Benefit: Hide swap amounts from public view
- Complexity: HIGH (Requires new cryptography)

#### 5. **Sender Anonymity** ❌ BLOCKCHAIN LEVEL
- Constraint: Sui blockchain is transparent
- Workaround: Use account abstraction, relayers, proxies
- Future: Privacy-enhanced L2 or rollups

---

## 8. WHERE TO ADD PRIVACY FEATURES

### Recommended Integration Strategy

#### Phase 1: Transaction Bundling (2-4 weeks)
**Files to Modify:**
- `/packages/strategy-sdk/src/builders/flash-loan-builder.ts`
- New: `/packages/strategy-sdk/src/builders/private-bundle-builder.ts`
- New: `/packages/strategy-sdk/src/crypto/bundle-encryption.ts`

**Changes:**
1. Add commitment system for bundled operations
2. Encrypt intermediate results between operations
3. Hot potato pattern already enforces atomicity
4. Create private multi-hop swap builder

**Expected Impact:**
- Prevents sandwich attacks on multi-hop swaps
- Hides operation sequence from public mempool
- Compatible with existing pool contracts

#### Phase 2: Quote Confidentiality (1-2 weeks)
**Files to Modify:**
- `/apps/api/src/routes/pools.ts` (quote endpoint)
- New: `/apps/api/src/services/quote-encryption.ts`

**Changes:**
1. Client encrypts quote request (amountIn hidden)
2. Server returns encrypted quote response
3. Add cache bypass for encrypted quotes
4. Implement quote signing/commitment

#### Phase 3: Amount Privacy (6-12 weeks)
**Files to Modify:**
- `/move/sources/amm/pool.move` (swap functions)
- New: `/move/sources/crypto/encrypted-swap.move`

**Changes:**
1. Use homomorphic encryption for amount verification
2. Create encrypted swap events
3. Implement zero-knowledge proofs
4. Replace amount visibility with proofs

#### Phase 4: Sender Anonymity (Future)
- Requires relayer infrastructure
- Out of scope for current Sui architecture
- Consider for L2 solutions

---

## 9. FLASH LOAN ARCHITECTURE FOR PRIVACY

### Current Strengths
1. **Atomic Execution:** Hot potato pattern forces completion in same transaction
2. **Composability:** Can call other functions within flash loan callback
3. **Fee Structure:** Clear incentive for legitimate use
4. **Type Safety:** Prevents accidental non-repayment

### Privacy-Enhanced Design

```move
// Phase 1: Bundled Flash Loans
public struct BundledFlashLoan<phantom X, phantom Y> {
    pool_id: object::ID,
    amount_x: u64,
    amount_y: u64,
    bundle_commitment: vector<u8>,  // Hash of bundled operations
    operations: vector<u8>,          // Encrypted operation list
}

public fun bundled_flash_loan<X, Y>(
    pool: &mut Pool<X, Y>,
    borrow_x: u64,
    borrow_y: u64,
    operations: vector<u8>,         // Encrypted
    commitment: vector<u8>,         // Operation hash
): (Coin<X>, Coin<Y>, BundledFlashLoan<X, Y>)

public fun repay_bundled_flash_loan<X, Y>(
    pool: &mut Pool<X, Y>,
    repay_x: Coin<X>,
    repay_y: Coin<Y>,
    receipt: BundledFlashLoan<X, Y>,
)
```

### Benefits Over Current Implementation
- Multiple operations execute atomically
- Operation details encrypted until execution
- Prevents external observation of intermediate states
- Still maintains flash loan guarantees

---

## 10. RECOMMENDATIONS FOR PRIVACY INTEGRATION

### Immediate Actions (This Week)
1. **Document Flash Loan Structure** ✅ DONE
   - Create detailed specification for bundled flash loans
   - Map out hot potato pattern usage

2. **Analyze MEV Vulnerabilities**
   - Identify specific sandwich attack vectors in codebase
   - Create test cases for MEV scenarios

3. **Design Quote Encryption**
   - Create proposal for encrypted quote API
   - Define client-side encryption library needs

### Short-Term (Weeks 2-4)
1. **Implement Private Bundle Builder**
   - `/packages/strategy-sdk/src/builders/private-bundle-builder.ts`
   - Add commitment-based ordering
   - Test with multi-hop swaps

2. **Add Quote Encryption**
   - Update API endpoints to support encrypted requests
   - Implement server-side decryption
   - Add cache policies for encrypted quotes

3. **Create Privacy Audit**
   - Security review of flash loan implementation
   - MEV vulnerability assessment
   - Regulatory compliance check

### Medium-Term (Weeks 5-8)
1. **Amount Privacy Framework**
   - Research homomorphic encryption approaches
   - Design Sui Move integration points
   - Create proof-of-concept

2. **Bundle Testing**
   - Comprehensive test suite for bundled operations
   - Gas optimization analysis
   - Performance benchmarking

### Long-Term (Months 3+)
1. **Sender Anonymity**
   - Evaluate relayer infrastructure
   - Design account abstraction layer
   - Consider privacy-enhanced rollups

---

## 11. TECHNICAL DEBT & NOTES

### Current Limitations
1. **Cache Visibility:** Cache keys reveal swap parameters
   ```typescript
   // Current (Privacy Risk)
   const cacheKey = `quote:${id}:${amountIn}:${isXToY}`
   // Attackers can see parameters in cache layer timing
   ```

2. **Event Transparency:** All swap events publicly visible
   ```move
   sui::event::emit(Swapped<X, Y> {
       pool_id,
       amount_in,        // Visible
       amount_out,       // Visible
       is_x_to_y,        // Visible
       fee_amount,       // Visible
   });
   ```

3. **Sequencer Ordering:** Sui validators control transaction order
   - No cryptographic commitment to order
   - No threshold encryption layer

4. **Multi-Hop Exposure:** 3+ hop swaps need multiple transactions
   - Current mitigation: RouterClient finds best path
   - Privacy mitigation: Bundle with flash loans (future)

---

## 12. COMPARISON WITH INDUSTRY STANDARDS

### Flash Loan Security
| Aspect | Carapace | dYdX | Aave |
|--------|----------|------|------|
| Hot Potato | ✅ Yes | ✅ Yes | ✅ Yes |
| Fee Structure | ✅ 0.05% | ✅ 0.09% | ✅ 0.05% |
| Multi-token | ✅ Yes | ❌ Single | ✅ Yes |
| Privacy | ❌ None | ❌ None | ❌ None |

### AMM Design
| Aspect | Carapace | Uniswap V2 | Curve |
|--------|----------|-----------|-------|
| Formula | CPAMM | CPAMM | Stable |
| Dynamic Fees | ⚠️ Manual | ❌ Fixed | ✅ Dynamic |
| Shared Pools | ✅ Sui native | ❌ Separate | ✅ Yes |
| MEV Protection | ❌ None | ❌ None | ⚠️ CRV voting |

---

## 13. FILES SUMMARY

### Move Contracts
- **pool.move (787 lines)**: Core AMM with flash loans
- **vault.move (203 lines)**: Auto-compounding vault structure
- **math.move (110 lines)**: Utility functions

### TypeScript SDK
- **pool-client.ts (442 lines)**: Pool interactions
- **router-client.ts**: Multi-hop routing (P1 feature)
- **pool-client.ts**: Swap quote calculations

### Backend API
- **routes/pools.ts (488 lines)**: Pool endpoints
- **routes/transactions.ts (110 lines)**: Tx history
- **services/blockchain-service.ts (198 lines)**: Sui integration
- **services/cache-service.ts (186 lines)**: Redis cache

### Strategy SDK
- **flash-loan-builder.ts (173 lines)**: Flash loan construction
- **flash-loan-client.ts**: Execution wrapper
- **types/flash-loan.ts (95 lines)**: Type definitions

---

## 14. CONCLUSION

Carapace has a **solid foundation for privacy integration**:

✅ **Strengths:**
- Hot potato flash loans enforce atomic execution
- Pool design supports bundling
- Type-safe Move contracts prevent foot-guns
- SDK already has builder patterns for complex operations

❌ **Gaps:**
- No transaction bundling for MEV protection
- Quote parameters are observable
- All event data publicly visible
- No sender anonymity mechanism

**Recommended Path:**
1. Add flash loan bundling (weeks 1-2)
2. Encrypt quotes (weeks 2-3)
3. Implement amount privacy research (weeks 4-8)
4. Consider sender anonymity through future architecture

**Priority:** Medium-high (MEV is real threat, but not privacy-critical compared to other features like yield optimization)

---

**Document Created:** 2025-11-10
**Analysis Scope:** Core Carapace DEX architecture, Move contracts, TypeScript SDK
**Next Steps:** Detailed technical specifications for privacy features
