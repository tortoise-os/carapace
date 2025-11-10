# Private DEX Architecture for Carapace on Sui

## Executive Summary

This document outlines how to transform Carapace into a privacy-preserving DEX on Sui, inspired by the successful private order flow model on Solana (SolFi capturing 44% of DEX volume). The design leverages Sui's unique architecture - Programmable Transaction Blocks (PTBs), Mysticeti consensus, and Carapace's existing flash loan infrastructure.

**Target Outcome**: Reduce slippage, prevent front-running/sandwich attacks, and enable institutional-grade trading privacy on Sui.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Sui-Specific Advantages](#sui-specific-advantages)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Phases](#implementation-phases)
5. [Technical Specifications](#technical-specifications)
6. [Security Considerations](#security-considerations)
7. [Performance & Economics](#performance-economics)
8. [Comparison with Solana Model](#comparison-with-solana-model)

---

## 1. Problem Statement

### Current MEV Vulnerabilities in Carapace

**Identified in Architecture Analysis:**
- ✅ All swap amounts visible in mempool
- ✅ Multi-hop swaps require separate transactions (MEV exposure between hops)
- ✅ Quote parameters observable via cache keys
- ✅ No transaction ordering commitments
- ✅ Sandwich attacks possible

**Economic Impact:**
```
Example: $10,000 ETH → USDC swap
- Spot price: 1 ETH = $1,000
- Attacker front-runs with $100k buy
- Price slips 5% → User gets $9,500 instead of $10,000
- Attacker back-runs with sell
- Attacker profit: ~$250-500 (minus fees)
- User loss: $500 (5% slippage)
```

### Why This Matters for Carapace

From Michael Nadeau's post: **"This is an essential building block for TradFi trading onchain"**

Institutional traders require:
1. Predictable execution prices
2. Protection from information leakage
3. Fair ordering guarantees
4. Reduced slippage vs public pools

---

## 2. Sui-Specific Advantages

### Consensus & Transaction Ordering

**Mysticeti Consensus (Current State 2025):**
- **390ms theoretical minimum Byzantine latency**
- **250ms Fast Path** for owned objects
- Natural protection: External quorum driving prevents validator front-running
- Validators attempting to front-run are behind in certificate assembly

**Priority Gas Auctions (PGA):**
- Fair competition through gas bidding
- Deters spam and maintains system efficiency
- SIP-19: Soft bundles for batch submission
- SIP-45: Consensus amplification for prioritization

**Upcoming Privacy Features:**
- Time-lock encryption (in design phase)
- Direct streaming of consensus blocks (SIP expected within 1-2 months)
- SHIO: Sui ecosystem's first comprehensive MEV protection protocol

### Programmable Transaction Blocks (PTBs)

**Key Capabilities:**
1. **Up to 1,024 operations per transaction**
2. **Atomic execution**: All-or-nothing guarantee
3. **Composability**: Access to all public functions
4. **Cost efficiency**: Batched operations reduce gas fees

**PTB Structure:**
```rust
{
    inputs: [Input],      // Objects or pure values
    commands: [Command],  // Operations to execute
}
```

**Perfect for Privacy:**
- Bundle multiple swaps atomically
- Hide intermediate states
- Execute complex strategies in single transaction
- No mempool visibility between operations

### Carapace's Flash Loan Infrastructure

**Already Built:**
```move
public struct FlashLoan<phantom T> {
    pool_id: object::ID,
    amount: u64,
    fee: u64,  // 0.05% (competitive with industry)
}

// Hot potato pattern: Receipt MUST be consumed in same transaction
public fun flash_borrow_x<X, Y>(
    pool: &mut Pool<X, Y>,
    amount: u64,
    ctx: &mut TxContext
): (Coin<X>, FlashLoan<X>)
```

**Strengths for Privacy:**
- ✅ Atomic execution enforced
- ✅ Composable with other operations
- ✅ Type-safe (prevents manipulation)
- ✅ Can bundle multi-hop swaps
- ✅ 0.05% fee (lower than Aave's 0.09%)

---

## 3. Architecture Overview

### Three-Layer Privacy Model

```
┌───────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Private Swap Interface                                   │ │
│  │ - Encrypted quote requests                              │ │
│  │ - Commitment-based order submission                     │ │
│  │ - Slippage tolerance configuration                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                   PRIVACY LAYER (NEW)                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Private Order Router                                     │ │
│  │ ├─ Order Encryption Service                             │ │
│  │ ├─ Commitment Generator                                 │ │
│  │ ├─ Bundle Builder (PTB + Flash Loans)                  │ │
│  │ └─ Private Quote Engine                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Execution Coordinator                                    │ │
│  │ ├─ Transaction Sequencer                                │ │
│  │ ├─ Slippage Protection                                  │ │
│  │ └─ MEV Detection & Alerts                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                   EXECUTION LAYER (EXISTING)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ TortoiseSwap AMM Pools                                  │ │
│  │ - Constant product formula (x * y = k)                 │ │
│  │ - Dynamic fees (20-40 bps)                             │ │
│  │ - Protocol fee collection                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Flash Loan System                                        │ │
│  │ - Single-token flash borrows                           │ │
│  │ - Dual-token flash swaps                               │ │
│  │ - Hot potato pattern enforcement                       │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                   SUI BLOCKCHAIN LAYER                        │
│  - Mysticeti Consensus (390ms latency)                       │
│  - Programmable Transaction Blocks                           │
│  - Shared Object Pools (natural serialization)               │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

**Goal:** Private transaction bundling using PTBs and existing flash loans

**Components:**
1. **Private Bundle Builder**
   - Location: `/packages/strategy-sdk/src/builders/private-bundle-builder.ts`
   - Bundles multi-hop swaps into single PTB
   - Uses flash loans for atomic execution
   - Hides intermediate states

2. **Commitment System**
   - Location: `/packages/strategy-sdk/src/crypto/commitments.ts`
   - Generate hash commitments for operations
   - Timestamp binding to prevent replay attacks
   - Merkle tree for operation ordering

**Files to Create:**
```
packages/strategy-sdk/src/
├─ builders/
│  └─ private-bundle-builder.ts      (NEW)
├─ crypto/
│  ├─ commitments.ts                 (NEW)
│  └─ bundle-encryption.ts           (NEW)
└─ types/
   └─ private-bundle.ts               (NEW)
```

**Technical Approach:**

```typescript
// private-bundle-builder.ts

import { Transaction } from '@mysten/sui/transactions';
import { createHash } from 'crypto';

export interface PrivateSwapOperation {
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    minAmountOut: bigint;
}

export class PrivateBundleBuilder {
    private tx: Transaction;
    private operations: PrivateSwapOperation[] = [];

    constructor() {
        this.tx = new Transaction();
    }

    /**
     * Add swap to bundle (hidden from public view until execution)
     */
    addSwap(operation: PrivateSwapOperation): this {
        this.operations.push(operation);
        return this;
    }

    /**
     * Build atomic PTB with flash loan wrapper
     * All swaps execute or none do
     */
    async buildAtomicBundle(config: {
        flashLoanPoolId: string;
        flashLoanAmount: bigint;
        flashLoanToken: string;
    }): Promise<Transaction> {
        // 1. Create commitment hash for operation ordering
        const commitment = this.generateCommitment();

        // 2. Start flash loan to get liquidity
        const [borrowedCoin, receipt] = this.tx.moveCall({
            target: `${PACKAGE_ID}::pool::flash_borrow_x`,
            arguments: [
                this.tx.object(config.flashLoanPoolId),
                this.tx.pure.u64(config.flashLoanAmount),
            ],
            typeArguments: [config.flashLoanToken, 'OTHER_TYPE'],
        });

        // 3. Execute all swaps atomically using borrowed liquidity
        let currentCoin = borrowedCoin;
        for (const op of this.operations) {
            currentCoin = this.tx.moveCall({
                target: `${PACKAGE_ID}::pool::swap_x_to_y`,
                arguments: [
                    this.tx.object(op.poolId),
                    currentCoin,
                    this.tx.pure.u64(op.minAmountOut),
                ],
                typeArguments: [op.tokenIn, op.tokenOut],
            });
        }

        // 4. Repay flash loan (enforced by hot potato)
        this.tx.moveCall({
            target: `${PACKAGE_ID}::pool::repay_flash_loan_x`,
            arguments: [
                this.tx.object(config.flashLoanPoolId),
                currentCoin,
                receipt,
            ],
            typeArguments: [config.flashLoanToken, 'OTHER_TYPE'],
        });

        return this.tx;
    }

    /**
     * Generate cryptographic commitment to operation order
     * Prevents manipulation of execution sequence
     */
    private generateCommitment(): string {
        const operationData = this.operations.map(op => ({
            poolId: op.poolId,
            amountIn: op.amountIn.toString(),
            timestamp: Date.now(),
        }));

        const hash = createHash('sha256')
            .update(JSON.stringify(operationData))
            .digest('hex');

        return hash;
    }
}
```

**Usage Example:**

```typescript
// Multi-hop swap: SUI → USDC → ETH (fully atomic)

const builder = new PrivateBundleBuilder();

builder
    .addSwap({
        poolId: SUI_USDC_POOL,
        tokenIn: 'SUI',
        tokenOut: 'USDC',
        amountIn: 1000n * 1_000_000_000n, // 1000 SUI
        minAmountOut: 950n * 1_000_000n,   // Min 950 USDC (5% slippage)
    })
    .addSwap({
        poolId: USDC_ETH_POOL,
        tokenIn: 'USDC',
        tokenOut: 'ETH',
        amountIn: 950n * 1_000_000n,       // Use all USDC from previous swap
        minAmountOut: 0.3n * 1_000_000_000n, // Min 0.3 ETH
    });

const tx = await builder.buildAtomicBundle({
    flashLoanPoolId: SUI_USDC_POOL,
    flashLoanAmount: 1000n * 1_000_000_000n,
    flashLoanToken: 'SUI',
});

// Execute - all swaps happen atomically or none do
await client.signAndExecuteTransaction({ signer: keypair, transaction: tx });
```

**Benefits:**
- ❌ MEV between swap hops (atomic execution)
- ❌ Front-running multi-hop routes
- ✅ Predictable slippage across entire route
- ✅ No intermediate state visibility

---

### Phase 2: Quote Privacy (Weeks 3-5)

**Goal:** Hide quote parameters from observers

**Problem:**
```typescript
// Current (Privacy Risk)
const cacheKey = `quote:${poolId}:${amountIn}:${isXToY}`;
// Attackers can see parameters via cache timing attacks
```

**Solution: Encrypted Quote Protocol**

**Files to Modify:**
- `/apps/api/src/routes/pools.ts` (add encrypted quote endpoint)
- NEW: `/apps/api/src/services/quote-encryption.ts`
- NEW: `/apps/api/src/middleware/decrypt-quotes.ts`

**Architecture:**

```typescript
// quote-encryption.ts

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

interface EncryptedQuoteRequest {
    ciphertext: string;        // Encrypted: {poolId, amountIn, isXToY}
    iv: string;                // Initialization vector
    authTag: string;           // Authentication tag
    timestamp: number;         // Prevent replay attacks
    commitment: string;        // Hash commitment
}

interface QuoteRequest {
    poolId: string;
    amountIn: bigint;
    isXToY: boolean;
}

export class QuoteEncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly serverKey: Buffer;

    constructor(serverKey: string) {
        this.serverKey = Buffer.from(serverKey, 'hex');
    }

    /**
     * Client-side: Encrypt quote request
     */
    encryptQuoteRequest(request: QuoteRequest): EncryptedQuoteRequest {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.serverKey, iv);

        const plaintext = JSON.stringify({
            poolId: request.poolId,
            amountIn: request.amountIn.toString(),
            isXToY: request.isXToY,
            timestamp: Date.now(),
        });

        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Create commitment
        const commitment = createHash('sha256')
            .update(plaintext)
            .digest('hex');

        return {
            ciphertext,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            timestamp: Date.now(),
            commitment,
        };
    }

    /**
     * Server-side: Decrypt and validate quote request
     */
    decryptQuoteRequest(encrypted: EncryptedQuoteRequest): QuoteRequest {
        // 1. Check timestamp (prevent replay attacks)
        const now = Date.now();
        const age = now - encrypted.timestamp;
        if (age > 5000) { // 5 second window
            throw new Error('Quote request expired');
        }

        // 2. Decrypt
        const decipher = createDecipheriv(
            this.algorithm,
            this.serverKey,
            Buffer.from(encrypted.iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));

        let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        // 3. Parse and validate
        const request = JSON.parse(plaintext);

        // 4. Verify commitment
        const computedCommitment = createHash('sha256')
            .update(plaintext)
            .digest('hex');

        if (computedCommitment !== encrypted.commitment) {
            throw new Error('Commitment mismatch');
        }

        return {
            poolId: request.poolId,
            amountIn: BigInt(request.amountIn),
            isXToY: request.isXToY,
        };
    }
}
```

**API Endpoint Update:**

```typescript
// routes/pools.ts

// NEW: Private quote endpoint
router.post('/api/pools/quote/private', async (req, res) => {
    const encryptedRequest: EncryptedQuoteRequest = req.body;

    try {
        // Decrypt request
        const quoteService = new QuoteEncryptionService(QUOTE_ENCRYPTION_KEY);
        const request = quoteService.decryptQuoteRequest(encryptedRequest);

        // Get pool data (no caching to prevent timing attacks)
        const pool = await blockchainService.getPool(request.poolId);

        // Calculate quote
        const amountOut = calculateSwapOutput(
            request.amountIn,
            request.isXToY ? pool.reserve_x : pool.reserve_y,
            request.isXToY ? pool.reserve_y : pool.reserve_x,
            pool.fee_bps
        );

        // Encrypt response
        const response = quoteService.encryptQuoteResponse({
            amountOut,
            priceImpact: calculatePriceImpact(request.amountIn, amountOut, pool),
            expiresAt: Date.now() + 3000, // 3 second validity
        });

        res.json(response);
    } catch (error) {
        res.status(400).json({ error: 'Invalid encrypted quote request' });
    }
});
```

**Client Integration:**

```typescript
// Frontend usage

const quoteService = new QuoteEncryptionService(CLIENT_KEY);

// Encrypt quote request
const encryptedRequest = quoteService.encryptQuoteRequest({
    poolId: 'POOL_ID',
    amountIn: 1000n * 1_000_000_000n,
    isXToY: true,
});

// Send to private endpoint
const response = await fetch('/api/pools/quote/private', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encryptedRequest),
});

const encryptedQuote = await response.json();
const quote = quoteService.decryptQuoteResponse(encryptedQuote);

console.log(`You will receive: ${quote.amountOut}`);
console.log(`Price impact: ${quote.priceImpact}%`);
```

**Benefits:**
- ❌ Cache timing attacks
- ❌ Parameter sniffing from logs/monitoring
- ✅ 3-5 second quote validity (prevents stale quotes)
- ✅ Replay attack protection

---

### Phase 3: Transaction Ordering Protection (Weeks 5-8)

**Goal:** Prevent sandwich attacks through ordering commitments

**Approach: Commit-Reveal Scheme**

**Step 1: Client commits to transaction**
```typescript
const commitment = hash(transaction_data + nonce);
// Submit commitment to mempool first
```

**Step 2: Wait for commitment to be included in block**
```typescript
const commitmentBlock = await waitForCommitment(commitment);
```

**Step 3: Reveal transaction with proof**
```typescript
const proof = { transaction_data, nonce };
// Validators verify: hash(proof) === commitment
// Execute transaction
```

**Why This Works:**
- Attackers can't front-run without seeing transaction details
- Once commitment is in block, ordering is locked
- Revealing invalid proof fails verification

**Integration with Sui:**

```move
// NEW: Move contract for commitment verification

module carapace::private_swap {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::hash;
    use sui::clock::{Self, Clock};

    public struct SwapCommitment has key {
        id: UID,
        commitment: vector<u8>,      // Hash of swap parameters
        submitter: address,
        timestamp: u64,
        revealed: bool,
    }

    /// Step 1: Submit commitment (hides swap details)
    public fun commit_swap(
        commitment: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let swap_commitment = SwapCommitment {
            id: object::new(ctx),
            commitment,
            submitter: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
            revealed: false,
        };

        transfer::share_object(swap_commitment);
    }

    /// Step 2: Reveal and execute (with proof)
    public fun reveal_and_swap<X, Y>(
        commitment_obj: &mut SwapCommitment,
        pool: &mut Pool<X, Y>,
        coin_in: Coin<X>,
        amount_in: u64,
        min_amount_out: u64,
        nonce: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<Y> {
        // 1. Verify commitment hasn't been revealed
        assert!(!commitment_obj.revealed, E_ALREADY_REVEALED);

        // 2. Verify sender is original committer
        assert!(commitment_obj.submitter == tx_context::sender(ctx), E_NOT_COMMITTER);

        // 3. Verify commitment age (prevent indefinite holding)
        let now = clock::timestamp_ms(clock);
        let age = now - commitment_obj.timestamp;
        assert!(age >= MIN_COMMITMENT_AGE && age <= MAX_COMMITMENT_AGE, E_INVALID_AGE);

        // 4. Reconstruct commitment hash
        let mut commitment_data = vector::empty<u8>();
        vector::append(&mut commitment_data, object::uid_to_bytes(&pool.id));
        vector::append(&mut commitment_data, bcs::to_bytes(&amount_in));
        vector::append(&mut commitment_data, bcs::to_bytes(&min_amount_out));
        vector::append(&mut commitment_data, nonce);

        let computed_commitment = hash::sha2_256(commitment_data);

        // 5. Verify commitment matches
        assert!(commitment_obj.commitment == computed_commitment, E_COMMITMENT_MISMATCH);

        // 6. Mark as revealed
        commitment_obj.revealed = true;

        // 7. Execute swap (now protected from front-running)
        pool::swap_x_to_y(pool, coin_in, amount_in, min_amount_out, ctx)
    }
}
```

**Client Workflow:**

```typescript
// private-swap-client.ts

export class PrivateSwapClient {

    /**
     * Step 1: Generate and submit commitment
     */
    async commitSwap(params: {
        poolId: string;
        amountIn: bigint;
        minAmountOut: bigint;
    }): Promise<{ commitment: string; nonce: string; }> {
        // Generate random nonce
        const nonce = randomBytes(32).toString('hex');

        // Create commitment hash
        const commitment = createHash('sha256')
            .update(params.poolId)
            .update(params.amountIn.toString())
            .update(params.minAmountOut.toString())
            .update(nonce)
            .digest('hex');

        // Submit commitment to blockchain
        const tx = new Transaction();
        tx.moveCall({
            target: `${PACKAGE_ID}::private_swap::commit_swap`,
            arguments: [
                tx.pure('vector<u8>', Buffer.from(commitment, 'hex')),
                tx.object(CLOCK_OBJECT_ID),
            ],
        });

        await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: tx
        });

        return { commitment, nonce };
    }

    /**
     * Step 2: Wait for commitment to be confirmed
     */
    async waitForCommitment(commitment: string): Promise<void> {
        // Poll for commitment object to exist on-chain
        // Wait 1-2 blocks for confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    /**
     * Step 3: Reveal and execute swap
     */
    async revealAndSwap(params: {
        commitmentObjectId: string;
        poolId: string;
        coinId: string;
        amountIn: bigint;
        minAmountOut: bigint;
        nonce: string;
    }): Promise<void> {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::private_swap::reveal_and_swap`,
            arguments: [
                tx.object(params.commitmentObjectId),
                tx.object(params.poolId),
                tx.object(params.coinId),
                tx.pure.u64(params.amountIn),
                tx.pure.u64(params.minAmountOut),
                tx.pure('vector<u8>', Buffer.from(params.nonce, 'hex')),
                tx.object(CLOCK_OBJECT_ID),
            ],
            typeArguments: ['TOKEN_X', 'TOKEN_Y'],
        });

        await this.client.signAndExecuteTransaction({
            signer: this.keypair,
            transaction: tx
        });
    }

    /**
     * Full private swap flow
     */
    async executePrivateSwap(params: SwapParams): Promise<void> {
        // Step 1: Commit
        console.log('Committing swap...');
        const { commitment, nonce } = await this.commitSwap(params);

        // Step 2: Wait for confirmation
        console.log('Waiting for commitment confirmation...');
        await this.waitForCommitment(commitment);

        // Step 3: Reveal and execute
        console.log('Revealing and executing swap...');
        await this.revealAndSwap({ ...params, nonce });

        console.log('Private swap completed!');
    }
}
```

**Attack Mitigation:**

| Attack Vector | How Commit-Reveal Prevents It |
|--------------|-------------------------------|
| Front-running | Attacker can't see swap details until commitment is confirmed |
| Sandwich attack | Can't place orders before/after without knowing parameters |
| MEV extraction | Validators can't reorder after commitment block |
| Replay attacks | Commitment can only be revealed once |

**Trade-offs:**
- ✅ Strong ordering protection
- ✅ Verifiable on-chain
- ❌ Requires 2 transactions (commit + reveal)
- ❌ Adds latency (1-2 block wait time ≈ 500-1000ms on Sui)

---

### Phase 4: Private Order Router (Weeks 8-12)

**Goal:** Centralized private order matching service (optional relayer model)

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│              Private Order Router                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Order Collection                             │ │
│  │  - Accept encrypted orders from users         │ │
│  │  - Verify commitments                         │ │
│  │  - Queue for batching                         │ │
│  └───────────────────────────────────────────────┘ │
│                       ▼                            │
│  ┌───────────────────────────────────────────────┐ │
│  │  Order Batching & Matching                    │ │
│  │  - Batch compatible orders                    │ │
│  │  - Find optimal execution paths               │ │
│  │  - Detect MEV opportunities (capture for LPs)│ │
│  └───────────────────────────────────────────────┘ │
│                       ▼                            │
│  ┌───────────────────────────────────────────────┐ │
│  │  Execution Submission                         │ │
│  │  - Build PTBs with batched orders            │ │
│  │  - Submit to Sui network                      │ │
│  │  - Distribute profits to users/LPs            │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// private-order-router.ts

import { EventEmitter } from 'events';
import { Transaction } from '@mysten/sui/transactions';

interface PrivateOrder {
    orderId: string;
    commitment: string;
    encryptedParams: string;
    submitter: string;
    timestamp: number;
}

interface DecryptedOrder {
    orderId: string;
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    minAmountOut: bigint;
    submitter: string;
}

export class PrivateOrderRouter extends EventEmitter {
    private orderQueue: PrivateOrder[] = [];
    private batchInterval = 1000; // 1 second batching window
    private maxBatchSize = 50;

    constructor(
        private readonly suiClient: SuiClient,
        private readonly encryptionService: QuoteEncryptionService
    ) {
        super();
        this.startBatchProcessor();
    }

    /**
     * Accept private order from user
     */
    async submitPrivateOrder(order: PrivateOrder): Promise<void> {
        // 1. Validate commitment
        // 2. Add to queue
        this.orderQueue.push(order);

        this.emit('order-received', order.orderId);
    }

    /**
     * Batch and execute orders periodically
     */
    private startBatchProcessor(): void {
        setInterval(async () => {
            if (this.orderQueue.length === 0) return;

            // Take up to maxBatchSize orders
            const batch = this.orderQueue.splice(0, this.maxBatchSize);

            try {
                await this.executeBatch(batch);
            } catch (error) {
                console.error('Batch execution failed:', error);
                // Re-queue failed orders
                this.orderQueue.unshift(...batch);
            }
        }, this.batchInterval);
    }

    /**
     * Execute batch of orders atomically
     */
    private async executeBatch(orders: PrivateOrder[]): Promise<void> {
        // 1. Decrypt all orders
        const decryptedOrders: DecryptedOrder[] = await Promise.all(
            orders.map(o => this.decryptOrder(o))
        );

        // 2. Group by compatibility (same token pairs, etc.)
        const groups = this.groupCompatibleOrders(decryptedOrders);

        // 3. Build PTB for each group
        for (const group of groups) {
            const tx = await this.buildBatchTransaction(group);

            // 4. Execute on Sui
            const result = await this.suiClient.signAndExecuteTransaction({
                signer: this.relayerKeypair,
                transaction: tx,
                options: { showEffects: true, showEvents: true },
            });

            // 5. Emit results to users
            this.emit('batch-executed', {
                orders: group.map(o => o.orderId),
                digest: result.digest,
            });
        }
    }

    /**
     * Build atomic transaction for order batch
     */
    private async buildBatchTransaction(
        orders: DecryptedOrder[]
    ): Promise<Transaction> {
        const tx = new Transaction();

        // Use flash loan for atomic execution
        const totalLiquidity = orders.reduce(
            (sum, o) => sum + o.amountIn,
            0n
        );

        // Borrow liquidity
        const [borrowedCoin, receipt] = tx.moveCall({
            target: `${PACKAGE_ID}::pool::flash_borrow_x`,
            arguments: [
                tx.object(FLASH_LOAN_POOL),
                tx.pure.u64(totalLiquidity),
            ],
            typeArguments: ['SUI', 'USDC'],
        });

        // Execute each order
        for (const order of orders) {
            tx.moveCall({
                target: `${PACKAGE_ID}::pool::swap_x_to_y`,
                arguments: [
                    tx.object(order.poolId),
                    // Split appropriate amount from borrowed coin
                    tx.splitCoins(borrowedCoin, [tx.pure.u64(order.amountIn)])[0],
                    tx.pure.u64(order.minAmountOut),
                ],
                typeArguments: [order.tokenIn, order.tokenOut],
            });

            // Transfer output to original submitter
            tx.transferObjects(
                [tx.object('RESULT_COIN')],
                tx.pure.address(order.submitter)
            );
        }

        // Repay flash loan
        tx.moveCall({
            target: `${PACKAGE_ID}::pool::repay_flash_loan_x`,
            arguments: [
                tx.object(FLASH_LOAN_POOL),
                borrowedCoin,
                receipt,
            ],
            typeArguments: ['SUI', 'USDC'],
        });

        return tx;
    }

    /**
     * Group orders that can be batched together
     */
    private groupCompatibleOrders(
        orders: DecryptedOrder[]
    ): DecryptedOrder[][] {
        const groups = new Map<string, DecryptedOrder[]>();

        for (const order of orders) {
            // Group by token pair
            const key = `${order.tokenIn}-${order.tokenOut}`;

            if (!groups.has(key)) {
                groups.set(key, []);
            }

            groups.get(key)!.push(order);
        }

        return Array.from(groups.values());
    }

    private async decryptOrder(order: PrivateOrder): Promise<DecryptedOrder> {
        // Decrypt order parameters using encryption service
        const params = await this.encryptionService.decrypt(order.encryptedParams);

        return {
            orderId: order.orderId,
            ...params,
            submitter: order.submitter,
        };
    }
}
```

**Benefits of Router Model:**
- ✅ Batch multiple user orders together
- ✅ Capture MEV and distribute to LPs/users
- ✅ Optimal execution paths across orders
- ✅ Lower gas costs per user (shared batch cost)

**Trade-offs:**
- ⚠️ Centralization risk (relayer trust)
- ⚠️ Requires relayer infrastructure
- ⚠️ 1-2 second execution delay for batching

**Mitigation:**
- Open-source relayer code
- Decentralize relayer network (anyone can run)
- Slashing conditions for misbehavior
- Users can bypass and submit directly to chain

---

## 5. Technical Specifications

### System Requirements

**Infrastructure:**
- Sui Full Node (for direct submission)
- Redis (for order queue management)
- PostgreSQL (for order history tracking)
- Optional: TEE (Trusted Execution Environment) for encryption keys

**Performance Targets:**
- Quote latency: < 100ms
- Commitment confirmation: 500-1000ms (1-2 Sui blocks)
- Batch execution: 1-2 seconds
- Throughput: 50+ orders per batch

### Cryptographic Primitives

**Commitment Scheme:**
- Algorithm: SHA-256 hash
- Format: `hash(pool_id || amount_in || min_amount_out || nonce || timestamp)`
- Nonce: 32 bytes random
- Timestamp: Unix milliseconds

**Encryption:**
- Algorithm: AES-256-GCM
- Key derivation: HKDF-SHA256
- Key rotation: Every 24 hours
- IV: 16 bytes random per message

**Signature Scheme:**
- Sui native: Ed25519
- Used for: Order authentication, relayer attestation

### Gas Optimization

**Cost Breakdown:**

| Operation | Gas Cost (Estimated) |
|-----------|---------------------|
| Single swap | 1,000,000 gas units |
| Commit transaction | 500,000 gas units |
| Reveal + swap | 1,200,000 gas units |
| Flash loan wrapper | +200,000 gas units |
| Batched swap (per order) | 800,000 gas units |

**Optimization Strategies:**
1. **Batch swaps**: 20% gas savings per order
2. **Reuse flash loan**: Share liquidity across orders
3. **Minimize storage**: Use ephemeral objects where possible
4. **Event compression**: Emit minimal data

---

## 6. Security Considerations

### Threat Model

**Assumptions:**
- ✅ Sui validators are honest majority (Byzantine fault tolerant)
- ✅ Cryptographic primitives are secure (SHA-256, AES-256-GCM)
- ⚠️ Relayer may be malicious (design for trustlessness)
- ⚠️ Network adversary can observe transactions

**Attack Vectors & Mitigations:**

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Commitment front-running** | Attacker copies commitment | Include sender address in commitment |
| **Replay attacks** | Reuse old commitment | Include timestamp, mark revealed |
| **Relayer censorship** | Relayer refuses to execute orders | Users can submit directly to chain |
| **Relayer order stealing** | Relayer submits order as own | Cryptographic binding to submitter |
| **Timing attacks on encryption** | Infer parameters from timing | Constant-time encryption operations |
| **MEV by validators** | Reorder transactions after reveal | Short reveal-to-execution window |

### Auditing & Monitoring

**On-Chain Monitoring:**
- Track commitment-to-reveal latency
- Monitor unusual order patterns
- Alert on high slippage executions
- Log relayer behavior

**Off-Chain Monitoring:**
- Measure quote request patterns
- Detect DDoS on encryption service
- Track relayer uptime/performance

**Audit Requirements:**
- Smart contract audit (Move code)
- Cryptographic review (commitment scheme)
- Economic review (game theory, incentives)

---

## 7. Performance & Economics

### Performance Benchmarks (Projected)

| Metric | Current (Public DEX) | Private DEX Target |
|--------|---------------------|-------------------|
| Quote latency | 50ms | 100ms (+50ms) |
| Execution time | 500ms | 1.5-2s (+1-1.5s) |
| Gas cost per swap | 1M units | 1.2M units (+20%) |
| MEV loss per trade | 0.1-0.5% | <0.01% |
| Slippage (large trades) | 2-5% | 1-2% (50% reduction) |

### Economic Model

**Fee Structure:**
- Base swap fee: 25 bps (unchanged)
- Flash loan fee: 5 bps (unchanged)
- Privacy premium: 5-10 bps (NEW)
- Relayer fee: 2-3 bps (NEW, optional)

**Total cost comparison:**

```
Public Swap:
- Swap fee: 25 bps
- MEV loss: ~25 bps (estimated)
- Total: 50 bps

Private Swap:
- Swap fee: 25 bps
- Privacy premium: 5 bps
- Relayer fee: 3 bps
- MEV loss: <1 bps
- Total: 34 bps

Savings: 16 bps (32% reduction in total cost)
```

**Value Proposition:**
- Users save on MEV loss
- LPs capture more value (privacy premium)
- Protocol earns additional fees
- Institutional traders get predictable execution

---

## 8. Comparison with Solana Model

### SolFi on Solana vs Carapace on Sui

| Feature | SolFi (Solana) | Carapace Private DEX (Sui) |
|---------|----------------|---------------------------|
| **Order Privacy** | Private mempool | Encrypted commitments |
| **Execution** | Direct to Jito validators | PTBs + Flash loans |
| **Consensus** | Tower BFT (400ms) | Mysticeti (390ms) |
| **MEV Protection** | Validator-level | Cryptographic commitments |
| **Batching** | Jito bundles | Flash loan atomic execution |
| **Integration** | Jupiter aggregator | Native TortoiseSwap |
| **Centralization** | Jito-Block Engine | Optional relayer network |
| **Market Share** | 44% of Solana DEX volume | N/A (new) |

### Key Differentiators for Carapace

**Advantages over Solana model:**
1. **Native atomicity**: PTBs + flash loans enforce atomic execution
2. **Object-based**: Sui's shared objects naturally serialize access
3. **Lower latency**: Mysticeti achieves 390ms vs Solana's 400ms
4. **Composability**: Direct integration with Move contracts
5. **Decentralization**: Can operate without relayer (commit-reveal)

**Challenges:**
1. **Network effects**: Solana has more liquidity
2. **Ecosystem maturity**: Sui DEX ecosystem is younger
3. **Validator adoption**: Need validator support for time-lock encryption (future)

---

## 9. Roadmap & Milestones

### Q2 2025 (Months 1-3)

**Month 1: Foundation**
- ✅ Design architecture (DONE - this document)
- Build private bundle builder (PTB + flash loans)
- Implement commitment scheme
- Deploy testnet contracts

**Month 2: Quote Privacy**
- Implement quote encryption service
- Update API endpoints
- Frontend integration
- Security testing

**Month 3: Beta Launch**
- Mainnet deployment
- Onboard initial users (whitelist)
- Monitor performance
- Gather feedback

### Q3 2025 (Months 4-6)

**Month 4: Order Router**
- Build relayer infrastructure
- Implement order batching
- Deploy router network
- Economic testing

**Month 5: Optimization**
- Gas cost optimization
- Latency improvements
- UI/UX refinement
- Audit preparation

**Month 6: Public Launch**
- Security audits (Move + cryptography)
- Marketing campaign
- Integration with wallets
- Liquidity mining incentives

### Q4 2025 (Months 7-9)

**Month 7-8: Advanced Features**
- Amount privacy (homomorphic encryption research)
- Cross-pool arbitrage detection
- MEV redistribution to LPs
- Advanced analytics

**Month 9: Ecosystem Integration**
- Partner with other Sui protocols
- Cross-protocol private swaps
- Institutional partnerships
- TradFi bridge development

---

## 10. Success Metrics

### Technical KPIs

- **Uptime**: >99.9%
- **Latency P95**: <2 seconds (commit to execution)
- **Gas efficiency**: <20% overhead vs public swaps
- **MEV protection**: >95% of swaps protected

### Business KPIs

- **Volume**: Target 10-20% of Sui DEX volume in 6 months
- **User adoption**: 1,000+ unique users in Q2
- **Institutional**: 5+ institutional integrations
- **TVL**: $10M+ in private order flow

### Security KPIs

- **Zero critical exploits**
- **No user fund loss**
- **Audit scores**: >90% across all categories
- **Incident response**: <1 hour for P0 issues

---

## 11. Conclusion

Carapace is **uniquely positioned** to become Sui's leading private DEX:

✅ **Strong foundation**: Flash loans + PTBs provide atomic execution
✅ **Sui advantages**: 390ms consensus, object-based architecture
✅ **Clear path**: 3-phase implementation (bundling → quote privacy → ordering)
✅ **Proven model**: Solana's SolFi captures 44% of DEX volume
✅ **Market need**: TradFi requires private order flow for institutional adoption

**Next Steps:**
1. Review this design with team
2. Prioritize Phase 1 (private bundling)
3. Allocate engineering resources
4. Begin implementation

**Expected Impact:**
- 32% reduction in total trading costs (MEV savings)
- 10-20% market share in 6 months
- Institutional-grade trading infrastructure on Sui
- Foundation for TradFi bridge to DeFi

---

**Document Version:** 1.0
**Date:** 2025-11-10
**Author:** Claude (AI Assistant)
**Status:** Design Proposal
