# Private DEX Implementation Roadmap

## Quick Start Guide for Carapace Private DEX

This document provides a **concrete, actionable roadmap** for implementing private order flow on Carapace, broken down into specific tasks, file changes, and code examples.

---

## Table of Contents

1. [Implementation Overview](#implementation-overview)
2. [Phase 1: Private Transaction Bundling (Weeks 1-3)](#phase-1-private-transaction-bundling)
3. [Phase 2: Quote Privacy (Weeks 3-5)](#phase-2-quote-privacy)
4. [Phase 3: Transaction Ordering Protection (Weeks 5-8)](#phase-3-transaction-ordering-protection)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Plan](#deployment-plan)
7. [Monitoring & Operations](#monitoring-operations)

---

## Implementation Overview

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Bundling          │ PTB + Flash Loans (Weeks 1-3)   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 2: Quote Privacy     │ Encryption Layer (Weeks 3-5)    │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 3: Order Protection  │ Commit-Reveal (Weeks 5-8)       │
└─────────────────────────────────────────────────────────────────┘
```

### Team Allocation (Recommended)

- **Smart Contract Engineer (1)**: Move contract modifications
- **Backend Engineer (1)**: API and encryption services
- **Frontend Engineer (1)**: UI integration
- **DevOps (0.5)**: Infrastructure and monitoring
- **Security Auditor (0.5)**: Ongoing security review

---

## Phase 1: Private Transaction Bundling

### Goal
Enable atomic multi-hop swaps using PTBs and flash loans to prevent MEV between hops.

### Tasks Breakdown

#### Week 1: Private Bundle Builder

**Task 1.1: Create PrivateBundleBuilder class**

**File**: `packages/strategy-sdk/src/builders/private-bundle-builder.ts`

```typescript
import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';

export interface SwapOperation {
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    minAmountOut: bigint;
}

export class PrivateBundleBuilder {
    private operations: SwapOperation[] = [];

    constructor(
        private readonly client: SuiClient,
        private readonly packageId: string
    ) {}

    /**
     * Add swap operation to bundle
     */
    addSwap(operation: SwapOperation): this {
        this.operations.push(operation);
        return this;
    }

    /**
     * Build atomic PTB with flash loan wrapper
     */
    async build(senderAddress: string): Promise<Transaction> {
        const tx = new Transaction();
        tx.setSender(senderAddress);

        if (this.operations.length === 0) {
            throw new Error('No operations to bundle');
        }

        // Determine flash loan pool and amount
        const firstOp = this.operations[0];
        const flashLoanAmount = firstOp.amountIn;

        // 1. Flash borrow liquidity
        const [borrowedCoin, receipt] = tx.moveCall({
            target: `${this.packageId}::pool::flash_borrow_x`,
            arguments: [
                tx.object(firstOp.poolId),
                tx.pure.u64(flashLoanAmount),
            ],
            typeArguments: [firstOp.tokenIn, firstOp.tokenOut],
        });

        // 2. Execute all swaps sequentially
        let currentCoin = borrowedCoin;
        for (let i = 0; i < this.operations.length; i++) {
            const op = this.operations[i];

            currentCoin = tx.moveCall({
                target: `${this.packageId}::pool::swap_x_to_y`,
                arguments: [
                    tx.object(op.poolId),
                    currentCoin,
                    tx.pure.u64(op.minAmountOut),
                ],
                typeArguments: [op.tokenIn, op.tokenOut],
            })[0]; // Get output coin
        }

        // 3. Repay flash loan
        tx.moveCall({
            target: `${this.packageId}::pool::repay_flash_loan_x`,
            arguments: [
                tx.object(firstOp.poolId),
                currentCoin, // Repay with final coin
                receipt,
            ],
            typeArguments: [firstOp.tokenIn, this.operations[this.operations.length - 1].tokenOut],
        });

        return tx;
    }

    /**
     * Reset builder for reuse
     */
    reset(): this {
        this.operations = [];
        return this;
    }
}
```

**Checklist:**
- [ ] Create file structure
- [ ] Implement basic builder pattern
- [ ] Add flash loan integration
- [ ] Add PTB construction logic
- [ ] Write unit tests

---

**Task 1.2: Add types and interfaces**

**File**: `packages/strategy-sdk/src/types/private-bundle.ts`

```typescript
export interface SwapOperation {
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    minAmountOut: bigint;
}

export interface BundleResult {
    digest: string;
    operations: SwapOperation[];
    gasUsed: bigint;
    executionTimeMs: number;
}

export interface BundleConfig {
    maxOperations?: number;        // Default: 10
    slippageToleranceBps?: number; // Default: 50 (0.5%)
    deadlineMs?: number;           // Default: 30000 (30s)
}

export enum BundleStatus {
    PENDING = 'pending',
    EXECUTING = 'executing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}
```

**Checklist:**
- [ ] Define core interfaces
- [ ] Export types for SDK consumers
- [ ] Document all interfaces

---

**Task 1.3: Create FlashLoanClient wrapper**

**File**: Update `packages/strategy-sdk/src/clients/flash-loan-client.ts`

```typescript
import type { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client';
import type { Keypair } from '@mysten/sui/cryptography';
import { Transaction } from '@mysten/sui/transactions';
import { PrivateBundleBuilder } from '../builders/private-bundle-builder';
import type { SwapOperation, BundleResult } from '../types/private-bundle';

export class FlashLoanClient {
    constructor(
        private readonly client: SuiClient,
        private readonly packageId: string
    ) {}

    /**
     * Execute multi-hop swap atomically using flash loans
     */
    async executeAtomicSwaps(
        operations: SwapOperation[],
        keypair: Keypair
    ): Promise<BundleResult> {
        const startTime = Date.now();

        // Build transaction
        const builder = new PrivateBundleBuilder(this.client, this.packageId);
        operations.forEach(op => builder.addSwap(op));

        const tx = await builder.build(keypair.getPublicKey().toSuiAddress());

        // Execute
        const result = await this.client.signAndExecuteTransaction({
            signer: keypair,
            transaction: tx,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        // Parse result
        if (result.effects?.status?.status !== 'success') {
            throw new Error(`Bundle execution failed: ${result.effects?.status?.error}`);
        }

        const gasUsed = BigInt(result.effects?.gasUsed?.computationCost || 0);
        const executionTimeMs = Date.now() - startTime;

        return {
            digest: result.digest,
            operations,
            gasUsed,
            executionTimeMs,
        };
    }

    /**
     * Estimate gas cost for bundle
     */
    async estimateGas(operations: SwapOperation[], sender: string): Promise<bigint> {
        const builder = new PrivateBundleBuilder(this.client, this.packageId);
        operations.forEach(op => builder.addSwap(op));

        const tx = await builder.build(sender);

        // Dry run to estimate gas
        const dryRun = await this.client.dryRunTransactionBlock({
            transactionBlock: await tx.build({ client: this.client }),
        });

        return BigInt(dryRun.effects.gasUsed.computationCost);
    }
}
```

**Checklist:**
- [ ] Implement executeAtomicSwaps method
- [ ] Add gas estimation
- [ ] Add error handling
- [ ] Write integration tests

---

#### Week 2: API Integration

**Task 2.1: Add bundled swap endpoint**

**File**: `apps/api/src/routes/bundles.ts` (NEW)

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import { FlashLoanClient } from '@carapace/strategy-sdk';
import { suiClient } from '../services/blockchain-service';
import { PACKAGE_ID } from '../config';

const router = Router();

interface BundleSwapRequest {
    operations: Array<{
        poolId: string;
        tokenIn: string;
        tokenOut: string;
        amountIn: string;
        minAmountOut: string;
    }>;
    senderAddress: string;
}

/**
 * POST /api/bundles/quote
 * Get quote for bundled multi-hop swap
 */
router.post('/quote', async (req: Request, res: Response) => {
    try {
        const { operations, senderAddress }: BundleSwapRequest = req.body;

        // Validate input
        if (!operations || operations.length === 0) {
            return res.status(400).json({ error: 'No operations provided' });
        }

        if (operations.length > 10) {
            return res.status(400).json({ error: 'Maximum 10 operations allowed' });
        }

        // Convert to internal format
        const swapOps = operations.map(op => ({
            poolId: op.poolId,
            tokenIn: op.tokenIn,
            tokenOut: op.tokenOut,
            amountIn: BigInt(op.amountIn),
            minAmountOut: BigInt(op.minAmountOut),
        }));

        // Estimate gas cost
        const client = new FlashLoanClient(suiClient, PACKAGE_ID);
        const estimatedGas = await client.estimateGas(swapOps, senderAddress);

        // Calculate expected output (simplified - should use actual pool reserves)
        const expectedOutput = swapOps[swapOps.length - 1].minAmountOut;

        res.json({
            operations: operations.length,
            expectedOutput: expectedOutput.toString(),
            estimatedGas: estimatedGas.toString(),
            expiresAt: Date.now() + 30000, // 30 second validity
        });
    } catch (error) {
        console.error('Bundle quote error:', error);
        res.status(500).json({ error: 'Failed to generate bundle quote' });
    }
});

/**
 * POST /api/bundles/build
 * Build transaction for bundled swap (user signs client-side)
 */
router.post('/build', async (req: Request, res: Response) => {
    try {
        const { operations, senderAddress }: BundleSwapRequest = req.body;

        // Convert to internal format
        const swapOps = operations.map(op => ({
            poolId: op.poolId,
            tokenIn: op.tokenIn,
            tokenOut: op.tokenOut,
            amountIn: BigInt(op.amountIn),
            minAmountOut: BigInt(op.minAmountOut),
        }));

        // Build transaction
        const builder = new PrivateBundleBuilder(suiClient, PACKAGE_ID);
        swapOps.forEach(op => builder.addSwap(op));

        const tx = await builder.build(senderAddress);

        // Serialize transaction bytes
        const txBytes = await tx.build({ client: suiClient });

        res.json({
            transactionBytes: Buffer.from(txBytes).toString('base64'),
            operations: operations.length,
        });
    } catch (error) {
        console.error('Bundle build error:', error);
        res.status(500).json({ error: 'Failed to build bundle transaction' });
    }
});

export default router;
```

**File**: Update `apps/api/src/index.ts`

```typescript
import bundleRoutes from './routes/bundles';

// Add route
app.use('/api/bundles', bundleRoutes);
```

**Checklist:**
- [ ] Create bundles route file
- [ ] Implement quote endpoint
- [ ] Implement build endpoint
- [ ] Add validation
- [ ] Add error handling
- [ ] Update API documentation

---

#### Week 3: Frontend Integration

**Task 3.1: Create BundleSwap component**

**File**: `apps/web/components/BundleSwap.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';

interface SwapStep {
    poolId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
}

export function BundleSwap() {
    const { signAndExecuteTransaction, address } = useWallet();
    const [steps, setSteps] = useState<SwapStep[]>([
        { poolId: '', tokenIn: '', tokenOut: '', amountIn: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const addStep = () => {
        setSteps([...steps, { poolId: '', tokenIn: '', tokenOut: '', amountIn: '' }]);
    };

    const updateStep = (index: number, field: keyof SwapStep, value: string) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const executeBundle = async () => {
        if (!address) {
            alert('Please connect wallet');
            return;
        }

        setLoading(true);
        try {
            // 1. Get quote
            const quoteResponse = await fetch('/api/bundles/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operations: steps.map(s => ({
                        ...s,
                        minAmountOut: '0', // Calculate based on slippage
                    })),
                    senderAddress: address,
                }),
            });

            const quote = await quoteResponse.json();
            console.log('Quote:', quote);

            // 2. Build transaction
            const buildResponse = await fetch('/api/bundles/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operations: steps.map(s => ({
                        ...s,
                        minAmountOut: '0',
                    })),
                    senderAddress: address,
                }),
            });

            const { transactionBytes } = await buildResponse.json();

            // 3. Sign and execute
            const tx = Transaction.from(Buffer.from(transactionBytes, 'base64'));

            const result = await signAndExecuteTransaction({
                transaction: tx,
            });

            setResult(`Success! Digest: ${result.digest}`);
        } catch (error) {
            console.error('Bundle execution failed:', error);
            setResult(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">Private Multi-Hop Swap</h2>

            {steps.map((step, index) => (
                <div key={index} className="mb-4 p-3 border rounded">
                    <h3 className="font-semibold mb-2">Step {index + 1}</h3>
                    <input
                        placeholder="Pool ID"
                        value={step.poolId}
                        onChange={e => updateStep(index, 'poolId', e.target.value)}
                        className="w-full mb-2 p-2 border rounded"
                    />
                    <input
                        placeholder="Token In"
                        value={step.tokenIn}
                        onChange={e => updateStep(index, 'tokenIn', e.target.value)}
                        className="w-full mb-2 p-2 border rounded"
                    />
                    <input
                        placeholder="Token Out"
                        value={step.tokenOut}
                        onChange={e => updateStep(index, 'tokenOut', e.target.value)}
                        className="w-full mb-2 p-2 border rounded"
                    />
                    <input
                        placeholder="Amount In"
                        value={step.amountIn}
                        onChange={e => updateStep(index, 'amountIn', e.target.value)}
                        className="w-full p-2 border rounded"
                        type="number"
                    />
                </div>
            ))}

            <button
                onClick={addStep}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Add Step
            </button>

            <button
                onClick={executeBundle}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
            >
                {loading ? 'Executing...' : 'Execute Atomic Swap'}
            </button>

            {result && (
                <div className="mt-4 p-3 border rounded">
                    <pre className="text-sm">{result}</pre>
                </div>
            )}
        </div>
    );
}
```

**Checklist:**
- [ ] Create BundleSwap component
- [ ] Add to swap interface
- [ ] Style with Tailwind
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with testnet

---

### Phase 1 Deliverables

**Code Artifacts:**
- `PrivateBundleBuilder` class
- `FlashLoanClient` updates
- `/api/bundles` endpoints
- `BundleSwap` UI component

**Documentation:**
- API endpoint documentation
- SDK usage examples
- User guide for multi-hop swaps

**Tests:**
- Unit tests for builder
- Integration tests for flash loans
- E2E tests for full flow

---

## Phase 2: Quote Privacy

### Goal
Hide quote parameters from observers using encryption.

### Tasks Breakdown

#### Week 4: Encryption Service

**Task 4.1: Create QuoteEncryptionService**

**File**: `apps/api/src/services/quote-encryption.ts` (NEW)

```typescript
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

export interface EncryptedQuoteRequest {
    ciphertext: string;
    iv: string;
    authTag: string;
    timestamp: number;
    commitment: string;
}

export interface QuoteRequest {
    poolId: string;
    amountIn: string;
    isXToY: boolean;
}

export interface QuoteResponse {
    amountOut: string;
    priceImpact: number;
    expiresAt: number;
}

export class QuoteEncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;
    private readonly maxAgeMs = 5000; // 5 second window

    constructor(hexKey: string) {
        if (!hexKey || hexKey.length !== 64) {
            throw new Error('Invalid encryption key: must be 32 bytes (64 hex chars)');
        }
        this.key = Buffer.from(hexKey, 'hex');
    }

    /**
     * Encrypt quote request (client-side)
     */
    encrypt(request: QuoteRequest): EncryptedQuoteRequest {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);

        const plaintext = JSON.stringify({
            ...request,
            timestamp: Date.now(),
        });

        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        const authTag = cipher.getAuthTag();

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
     * Decrypt quote request (server-side)
     */
    decrypt(encrypted: EncryptedQuoteRequest): QuoteRequest {
        // 1. Check timestamp
        const age = Date.now() - encrypted.timestamp;
        if (age > this.maxAgeMs) {
            throw new Error('Quote request expired');
        }

        // 2. Decrypt
        const decipher = createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(encrypted.iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));

        let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        // 3. Parse
        const request = JSON.parse(plaintext);

        // 4. Verify commitment
        const computedCommitment = createHash('sha256')
            .update(plaintext)
            .digest('hex');

        if (computedCommitment !== encrypted.commitment) {
            throw new Error('Commitment mismatch - possible tampering');
        }

        return {
            poolId: request.poolId,
            amountIn: request.amountIn,
            isXToY: request.isXToY,
        };
    }

    /**
     * Encrypt quote response
     */
    encryptResponse(response: QuoteResponse): EncryptedQuoteRequest {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);

        const plaintext = JSON.stringify(response);

        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            ciphertext,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            timestamp: Date.now(),
            commitment: '',
        };
    }

    /**
     * Decrypt quote response (client-side)
     */
    decryptResponse(encrypted: EncryptedQuoteRequest): QuoteResponse {
        const decipher = createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(encrypted.iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));

        let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        return JSON.parse(plaintext);
    }
}
```

**File**: Update `apps/api/src/config.ts`

```typescript
export const QUOTE_ENCRYPTION_KEY = process.env.QUOTE_ENCRYPTION_KEY ||
    'a'.repeat(64); // Generate secure key in production!
```

**Checklist:**
- [ ] Implement encryption service
- [ ] Add key management
- [ ] Add timestamp validation
- [ ] Add commitment verification
- [ ] Write unit tests

---

**Task 4.2: Add private quote endpoint**

**File**: Update `apps/api/src/routes/pools.ts`

```typescript
import { QuoteEncryptionService } from '../services/quote-encryption';
import { QUOTE_ENCRYPTION_KEY } from '../config';

const encryptionService = new QuoteEncryptionService(QUOTE_ENCRYPTION_KEY);

/**
 * POST /api/pools/quote/private
 * Get encrypted quote (hides parameters)
 */
router.post('/quote/private', async (req: Request, res: Response) => {
    try {
        const encryptedRequest = req.body;

        // Decrypt request
        const request = encryptionService.decrypt(encryptedRequest);

        // Get pool data (no caching!)
        const pool = await blockchainService.getPool(request.poolId);

        if (!pool) {
            return res.status(404).json({ error: 'Pool not found' });
        }

        // Calculate quote
        const amountIn = BigInt(request.amountIn);
        const reserveIn = request.isXToY ? pool.reserve_x : pool.reserve_y;
        const reserveOut = request.isXToY ? pool.reserve_y : pool.reserve_x;

        const amountOut = calculateSwapOutput(
            amountIn,
            reserveIn,
            reserveOut,
            pool.fee_bps
        );

        // Calculate price impact
        const spotPrice = Number(reserveOut) / Number(reserveIn);
        const executionPrice = Number(amountOut) / Number(amountIn);
        const priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice) * 100;

        // Encrypt response
        const response = encryptionService.encryptResponse({
            amountOut: amountOut.toString(),
            priceImpact,
            expiresAt: Date.now() + 3000,
        });

        res.json(response);
    } catch (error) {
        console.error('Private quote error:', error);
        res.status(400).json({ error: error.message });
    }
});
```

**Checklist:**
- [ ] Add private quote endpoint
- [ ] Bypass cache for private quotes
- [ ] Add rate limiting
- [ ] Add monitoring
- [ ] Test encryption/decryption

---

#### Week 5: Client SDK Integration

**Task 5.1: Add encryption to SDK**

**File**: `packages/sdk/src/encryption/quote-encryption.ts` (NEW)

```typescript
// Browser-compatible encryption (using Web Crypto API)

export interface EncryptedQuote {
    ciphertext: string;
    iv: string;
    authTag: string;
    timestamp: number;
    commitment: string;
}

export class QuoteEncryption {
    private key: CryptoKey | null = null;

    async initialize(hexKey: string): Promise<void> {
        const keyData = this.hexToBytes(hexKey);
        this.key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async encrypt(data: object): Promise<EncryptedQuote> {
        if (!this.key) throw new Error('Encryption key not initialized');

        const iv = crypto.getRandomValues(new Uint8Array(16));
        const plaintext = JSON.stringify(data);

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.key,
            new TextEncoder().encode(plaintext)
        );

        const commitment = await this.hash(plaintext);

        return {
            ciphertext: this.bytesToHex(new Uint8Array(encrypted)),
            iv: this.bytesToHex(iv),
            authTag: '', // Included in ciphertext with AES-GCM
            timestamp: Date.now(),
            commitment,
        };
    }

    async decrypt(encrypted: EncryptedQuote): Promise<any> {
        if (!this.key) throw new Error('Encryption key not initialized');

        const ciphertext = this.hexToBytes(encrypted.ciphertext);
        const iv = this.hexToBytes(encrypted.iv);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            this.key,
            ciphertext
        );

        const plaintext = new TextDecoder().decode(decrypted);
        return JSON.parse(plaintext);
    }

    private async hash(data: string): Promise<string> {
        const encoded = new TextEncoder().encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
        return this.bytesToHex(new Uint8Array(hashBuffer));
    }

    private hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
    }

    private bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}
```

**Checklist:**
- [ ] Implement Web Crypto API encryption
- [ ] Add browser compatibility checks
- [ ] Add fallback for Node.js
- [ ] Write tests

---

### Phase 2 Deliverables

**Code Artifacts:**
- `QuoteEncryptionService` (server)
- `QuoteEncryption` (client SDK)
- `/api/pools/quote/private` endpoint
- Updated UI to use private quotes

**Documentation:**
- Encryption protocol specification
- Key management guide
- Security best practices

---

## Phase 3: Transaction Ordering Protection

### Goal
Prevent front-running using commit-reveal scheme.

### Tasks Breakdown

#### Week 6-7: Move Contract Updates

**Task 6.1: Add commitment contract**

**File**: `move/sources/private/private_swap.move` (NEW)

```move
module carapace::private_swap {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::hash;
    use sui::clock::{Self, Clock};
    use carapace::pool::{Self, Pool};
    use sui::coin::{Self, Coin};

    const E_ALREADY_REVEALED: u64 = 1;
    const E_NOT_COMMITTER: u64 = 2;
    const E_INVALID_AGE: u64 = 3;
    const E_COMMITMENT_MISMATCH: u64 = 4;

    const MIN_COMMITMENT_AGE: u64 = 500;  // 0.5 seconds
    const MAX_COMMITMENT_AGE: u64 = 30000; // 30 seconds

    public struct SwapCommitment has key {
        id: UID,
        commitment: vector<u8>,
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

    /// Step 2: Reveal and execute swap
    public fun reveal_and_swap_x_to_y<X, Y>(
        commitment_obj: &mut SwapCommitment,
        pool: &mut Pool<X, Y>,
        coin_in: Coin<X>,
        amount_in: u64,
        min_amount_out: u64,
        nonce: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<Y> {
        // 1. Verify not revealed
        assert!(!commitment_obj.revealed, E_ALREADY_REVEALED);

        // 2. Verify sender
        assert!(commitment_obj.submitter == tx_context::sender(ctx), E_NOT_COMMITTER);

        // 3. Verify age
        let now = clock::timestamp_ms(clock);
        let age = now - commitment_obj.timestamp;
        assert!(
            age >= MIN_COMMITMENT_AGE && age <= MAX_COMMITMENT_AGE,
            E_INVALID_AGE
        );

        // 4. Verify commitment
        let mut data = vector::empty<u8>();
        vector::append(&mut data, object::id_to_bytes(&pool::id(pool)));
        vector::append(&mut data, bcs::to_bytes(&amount_in));
        vector::append(&mut data, bcs::to_bytes(&min_amount_out));
        vector::append(&mut data, nonce);

        let computed = hash::sha2_256(data);
        assert!(commitment_obj.commitment == computed, E_COMMITMENT_MISMATCH);

        // 5. Mark revealed
        commitment_obj.revealed = true;

        // 6. Execute swap
        pool::swap_x_to_y(pool, coin_in, amount_in, min_amount_out, ctx)
    }

    /// Helper: Delete used commitment
    public fun delete_commitment(commitment: SwapCommitment) {
        let SwapCommitment { id, commitment: _, submitter: _, timestamp: _, revealed: _ } = commitment;
        object::delete(id);
    }
}
```

**Checklist:**
- [ ] Create private_swap module
- [ ] Implement commitment logic
- [ ] Add reveal verification
- [ ] Add age checks
- [ ] Test on devnet
- [ ] Deploy to testnet

---

**Task 6.2: Update pool module integration**

**File**: Update `move/sources/amm/pool.move`

```move
// Add friend declaration
friend carapace::private_swap;

// Make swap functions accessible to private_swap module
public(friend) fun swap_x_to_y<X, Y>(
    pool: &mut Pool<X, Y>,
    coin_in: Coin<X>,
    amount_in: u64,
    min_amount_out: u64,
    ctx: &mut TxContext
): Coin<Y> {
    // Existing swap logic
    // ...
}
```

**Checklist:**
- [ ] Add friend relationship
- [ ] Update visibility modifiers
- [ ] Test integration
- [ ] Update documentation

---

#### Week 8: SDK and API Integration

**Task 8.1: Create PrivateSwapClient**

**File**: `packages/sdk/src/clients/private-swap-client.ts` (NEW)

```typescript
import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';
import { createHash, randomBytes } from 'crypto';

export class PrivateSwapClient {
    constructor(
        private readonly client: SuiClient,
        private readonly packageId: string,
        private readonly clockObjectId: string = '0x6'
    ) {}

    /**
     * Step 1: Generate and submit commitment
     */
    async commitSwap(params: {
        poolId: string;
        amountIn: bigint;
        minAmountOut: bigint;
    }): Promise<{ commitmentId: string; nonce: string }> {
        // Generate nonce
        const nonce = randomBytes(32).toString('hex');

        // Create commitment hash
        const commitment = createHash('sha256')
            .update(params.poolId)
            .update(params.amountIn.toString())
            .update(params.minAmountOut.toString())
            .update(nonce)
            .digest();

        // Submit commitment
        const tx = new Transaction();
        tx.moveCall({
            target: `${this.packageId}::private_swap::commit_swap`,
            arguments: [
                tx.pure('vector<u8>', Array.from(commitment)),
                tx.object(this.clockObjectId),
            ],
        });

        const result = await this.client.signAndExecuteTransaction({
            transaction: tx,
            options: { showObjectChanges: true },
        });

        // Extract commitment object ID
        const created = result.objectChanges?.find(
            c => c.type === 'created' && c.objectType.includes('SwapCommitment')
        );

        if (!created || created.type !== 'created') {
            throw new Error('Failed to create commitment');
        }

        return {
            commitmentId: created.objectId,
            nonce,
        };
    }

    /**
     * Step 2: Wait for commitment confirmation
     */
    async waitForCommitment(commitmentId: string): Promise<void> {
        // Poll for object to exist
        let attempts = 0;
        while (attempts < 10) {
            try {
                await this.client.getObject({ id: commitmentId });
                return; // Found!
            } catch {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }
        }
        throw new Error('Commitment not confirmed after 5 seconds');
    }

    /**
     * Step 3: Reveal and execute
     */
    async revealAndSwap(params: {
        commitmentId: string;
        poolId: string;
        coinId: string;
        amountIn: bigint;
        minAmountOut: bigint;
        tokenX: string;
        tokenY: string;
        nonce: string;
    }): Promise<string> {
        const tx = new Transaction();

        const outputCoin = tx.moveCall({
            target: `${this.packageId}::private_swap::reveal_and_swap_x_to_y`,
            arguments: [
                tx.object(params.commitmentId),
                tx.object(params.poolId),
                tx.object(params.coinId),
                tx.pure.u64(params.amountIn),
                tx.pure.u64(params.minAmountOut),
                tx.pure('vector<u8>', Buffer.from(params.nonce, 'hex')),
                tx.object(this.clockObjectId),
            ],
            typeArguments: [params.tokenX, params.tokenY],
        });

        // Transfer output to sender
        tx.transferObjects([outputCoin], tx.pure.address(await this.client.getAddress()));

        const result = await this.client.signAndExecuteTransaction({
            transaction: tx,
            options: { showEffects: true },
        });

        return result.digest;
    }

    /**
     * Full private swap flow (commit + reveal)
     */
    async executePrivateSwap(params: {
        poolId: string;
        coinId: string;
        amountIn: bigint;
        minAmountOut: bigint;
        tokenX: string;
        tokenY: string;
    }): Promise<string> {
        console.log('Step 1: Committing swap...');
        const { commitmentId, nonce } = await this.commitSwap({
            poolId: params.poolId,
            amountIn: params.amountIn,
            minAmountOut: params.minAmountOut,
        });

        console.log('Step 2: Waiting for commitment confirmation...');
        await this.waitForCommitment(commitmentId);

        console.log('Step 3: Revealing and executing swap...');
        const digest = await this.revealAndSwap({
            ...params,
            commitmentId,
            nonce,
        });

        console.log('Private swap completed!', digest);
        return digest;
    }
}
```

**Checklist:**
- [ ] Implement PrivateSwapClient
- [ ] Add error handling
- [ ] Add progress callbacks
- [ ] Write integration tests
- [ ] Update SDK exports

---

### Phase 3 Deliverables

**Code Artifacts:**
- `private_swap.move` contract
- `PrivateSwapClient` SDK
- Updated UI with commit-reveal flow

**Documentation:**
- Commit-reveal protocol docs
- Security analysis
- User guide

---

## Testing Strategy

### Unit Tests

**Coverage Targets:**
- PrivateBundleBuilder: 100%
- QuoteEncryptionService: 100%
- PrivateSwapClient: 100%

**Test Files:**
```
packages/strategy-sdk/tests/
├─ private-bundle-builder.test.ts
├─ flash-loan-client.test.ts
└─ private-swap-client.test.ts

apps/api/tests/
├─ bundles.test.ts
├─ quote-encryption.test.ts
└─ private-quotes.test.ts
```

### Integration Tests

**Scenarios:**
1. 2-hop swap via PTB + flash loan
2. 3-hop swap with price impact
3. Encrypted quote request/response
4. Commit-reveal swap flow
5. Failed commitment (wrong nonce)

**Test Network:**
- Sui Devnet for development
- Sui Testnet for staging
- Mainnet for production

### Load Testing

**Tools:**
- Apache JMeter for API load testing
- Custom scripts for blockchain stress testing

**Targets:**
- 100 concurrent users
- 1000 swaps/minute throughput
- <2s p95 latency

---

## Deployment Plan

### Phase 1 Deployment

**Week 3:**
1. Deploy to Devnet
2. Internal testing (1 week)
3. Deploy to Testnet
4. Public beta (select users)
5. Collect feedback
6. Deploy to Mainnet (after audit)

### Phase 2 Deployment

**Week 5:**
1. Deploy encryption service to staging
2. Test with testnet
3. Generate production encryption keys
4. Deploy to production
5. Monitor for 1 week

### Phase 3 Deployment

**Week 8:**
1. Audit Move contracts (external)
2. Deploy to Testnet
3. Bug bounty program
4. Deploy to Mainnet
5. Public announcement

---

## Monitoring & Operations

### Metrics to Track

**Performance:**
- Bundle execution time (p50, p95, p99)
- Gas costs per operation
- API latency
- Encryption/decryption time

**Business:**
- Bundle swap volume
- Private quote requests
- Commit-reveal success rate
- User adoption (wallets using private swaps)

**Security:**
- Failed commitment attempts
- Quote encryption errors
- Unusual patterns (potential attacks)

**Dashboards:**
- Grafana for metrics visualization
- Custom dashboard for bundle analytics

### Alerting

**Critical Alerts:**
- Smart contract paused
- High failure rate (>5%)
- API downtime
- Encryption service errors

**Warning Alerts:**
- High gas costs (>150% baseline)
- Slow commit confirmation (>2s)
- Increased error rate

---

## Success Criteria

### Phase 1 Success
- ✅ 100+ successful bundled swaps on testnet
- ✅ <20% gas overhead vs sequential swaps
- ✅ Zero failed transactions due to bundle issues
- ✅ 10+ beta users

### Phase 2 Success
- ✅ 1000+ private quote requests
- ✅ Zero encryption failures
- ✅ <100ms encryption latency

### Phase 3 Success
- ✅ 500+ commit-reveal swaps
- ✅ Zero front-running incidents
- ✅ Smart contract audit passed
- ✅ 50+ daily active users

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Flash loan exploit | HIGH | LOW | Audit, formal verification |
| Encryption key leak | HIGH | MEDIUM | HSM, key rotation |
| High gas costs | MEDIUM | MEDIUM | Optimize, subsidize initially |
| User confusion | MEDIUM | HIGH | Clear UI, documentation |
| Validator collusion | HIGH | LOW | Diversify validators |

---

## Next Steps

1. **Review this roadmap** with engineering team
2. **Allocate resources** (engineers, auditors)
3. **Set up project tracking** (Jira, Linear, etc.)
4. **Create GitHub milestones** for each phase
5. **Begin Phase 1 implementation** (PrivateBundleBuilder)

**Estimated Total Timeline:** 8-10 weeks to MVP
**Estimated Cost:** 2-3 engineers full-time

---

**Document Version:** 1.0
**Created:** 2025-11-10
**Status:** Ready for Implementation
