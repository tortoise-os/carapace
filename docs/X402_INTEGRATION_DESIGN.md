# x402 Integration for Carapace Private DEX on Sui

## Executive Summary

The x402 protocol is an **HTTP-native micropayment standard** that can transform Carapace into a **programmable payment layer** for AI agents, APIs, and automated trading systems. While x402 is currently optimized for Base and Solana, this document outlines how to:

1. **Implement x402 on Sui** (custom facilitator required)
2. **Integrate x402 with Carapace's private DEX**
3. **Enable new use cases**: AI agent trading, programmatic order flow, privacy-preserving payments

**Key Insight**: x402 + Private DEX creates a **"pay-per-trade"** model where AI agents and APIs can execute swaps with zero-knowledge privacy and HTTP-native payments.

---

## Table of Contents

1. [What is x402?](#what-is-x402)
2. [Why x402 + Private DEX = Powerful Combination](#why-x402-private-dex-powerful)
3. [Can x402 Be Used on Sui?](#can-x402-be-used-on-sui)
4. [x402 Integration Architecture](#x402-integration-architecture)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Use Cases Enabled by x402 + Private DEX](#use-cases)
7. [Technical Specifications](#technical-specifications)
8. [Comparison: With vs Without x402](#comparison)

---

## 1. What is x402?

### Overview

**x402** is a payment protocol built on HTTP that resurrects the dormant `402 Payment Required` status code. It enables:

- **Micropayments**: As low as $0.001 per transaction
- **Fast settlement**: Under 2 seconds on Base
- **Zero friction**: No logins, sessions, or accounts
- **Privacy**: Users pay with wallet signatures only
- **AI-ready**: Perfect for autonomous agent payments

### How It Works (12-Step Flow)

```
┌─────────┐                    ┌──────────────┐                   ┌─────────────┐
│ Client  │                    │Resource Server│                   │ Facilitator │
│(Wallet) │                    │  (Carapace)  │                   │  (Sui)      │
└────┬────┘                    └──────┬───────┘                   └──────┬──────┘
     │                                │                                   │
     │ 1. GET /api/pools/quote        │                                   │
     ├───────────────────────────────>│                                   │
     │                                │                                   │
     │ 2. 402 Payment Required        │                                   │
     │    X-PAYMENT-OPTIONS           │                                   │
     │<───────────────────────────────┤                                   │
     │                                │                                   │
     │ 3. Client creates signed       │                                   │
     │    payment payload             │                                   │
     │                                │                                   │
     │ 4. GET /api/pools/quote        │                                   │
     │    X-PAYMENT: <signed_payload> │                                   │
     ├───────────────────────────────>│                                   │
     │                                │                                   │
     │                                │ 5. POST /verify (payment)         │
     │                                ├──────────────────────────────────>│
     │                                │                                   │
     │                                │ 6. Signature valid ✓              │
     │                                │<──────────────────────────────────┤
     │                                │                                   │
     │ 7. 200 OK with quote data      │                                   │
     │<───────────────────────────────┤                                   │
     │                                │                                   │
     │                                │ 8. POST /settle (finalize)        │
     │                                ├──────────────────────────────────>│
     │                                │                                   │
     │                                │ 9. Sui transaction submitted      │
     │                                │<──────────────────────────────────┤
     │                                │                                   │
     │ 10. X-PAYMENT-RESPONSE header  │                                   │
     │     with tx hash               │                                   │
     │<───────────────────────────────┤                                   │
```

### Key Technical Features

**HTTP-Native:**
- Uses standard `402 Payment Required` status code
- Payment metadata in `X-PAYMENT` and `X-PAYMENT-OPTIONS` headers
- Works with any HTTP client (curl, browsers, SDKs)

**Chain-Agnostic:**
- Currently supports: Base, Solana
- Extensible to: Sui, Avalanche, Polygon, Arbitrum
- Requires custom facilitator for non-EVM chains

**Privacy-Preserving:**
- No account creation or KYC
- Wallet signature is the only credential
- No session tracking or cookies

---

## 2. Why x402 + Private DEX = Powerful Combination

### The Synergy

| Feature | Private DEX (Alone) | x402 (Alone) | x402 + Private DEX |
|---------|---------------------|--------------|-------------------|
| **MEV Protection** | ✅ Commit-reveal, bundling | ❌ No MEV protection | ✅ MEV-protected + paid access |
| **Privacy** | ✅ Encrypted quotes, hidden amounts | ✅ Wallet-only auth | ✅✅ Full privacy stack |
| **AI Agent Trading** | ⚠️ Requires custom integration | ✅ HTTP-native | ✅✅ Seamless API payments |
| **Programmatic Access** | ⚠️ Manual wallet signing | ✅ Automated payments | ✅✅ Fully automated |
| **Monetization** | ⚠️ Only swap fees | ⚠️ Only payment fees | ✅✅ Multi-layer revenue |

### New Capabilities Unlocked

#### 1. **Paid Privacy-as-a-Service**

```typescript
// Without x402: Free but limited privacy
GET /api/pools/quote
→ 200 OK (encrypted quote)

// With x402: Premium privacy features
GET /api/pools/quote/premium
→ 402 Payment Required ($0.01)
→ Client pays $0.01 → 200 OK (ultra-private quote + MEV guarantee)
```

**Revenue Model:**
- Free tier: Basic privacy (commit-reveal)
- Premium tier ($0.01/quote): Full privacy + MEV insurance + priority execution

#### 2. **AI Agent Trading Without Wallets**

```python
# AI agent can trade without managing private keys
import requests

response = requests.get(
    'https://carapace.sui/api/bundles/quote',
    headers={
        'X-PAYMENT': generate_x402_payment(amount=0.001)  # $0.001 fee
    }
)

if response.status_code == 200:
    quote = response.json()
    execute_trade(quote)
```

**Benefits:**
- AI agents don't need to hold SUI for gas
- Pay-per-API-call model (no subscriptions)
- Automatic rate limiting via payments

#### 3. **Private Order Flow Marketplace**

```
Institutional traders → Pay premium → Access private order flow
                     ↓
            Reduced MEV + Better execution
                     ↓
            Share revenue with LPs (incentive alignment)
```

**Economic Flow:**
1. Trader pays $0.05 per private swap (via x402)
2. Carapace takes $0.02 (40% protocol fee)
3. LPs get $0.03 (60% revenue share)
4. Result: LPs earn more than public DEX fees alone

#### 4. **Tiered Privacy Levels**

| Tier | Cost | Privacy Features | Use Case |
|------|------|------------------|----------|
| **Free** | $0 | Public swaps, basic slippage | Retail users |
| **Basic** | $0.01 | Encrypted quotes, commit-reveal | Privacy-conscious users |
| **Premium** | $0.05 | Full privacy bundle + MEV insurance | Pro traders |
| **Institutional** | $0.10 | Private order flow + batch auctions | Institutions |

---

## 3. Can x402 Be Used on Sui?

### Current Status: **Not Natively, But Yes with Custom Facilitator**

**Official Support:**
- ✅ Base (Ethereum L2)
- ✅ Solana
- ❌ Sui (not yet supported by CDP-hosted facilitator)

**Path to Sui Support:**
- **Self-hosted facilitator** with Sui-specific implementation
- Sui is **chain-agnostic compatible** (x402 is blockchain-neutral)
- Requires custom payment verification and settlement logic

### Technical Requirements for Sui x402 Facilitator

#### 1. **Sui RPC Endpoint**
```typescript
const suiClient = new SuiClient({
    url: 'https://fullnode.mainnet.sui.io:443'
});
```

#### 2. **Gas Sponsorship Wallet**
```typescript
// Facilitator needs SUI tokens to sponsor gas fees
const facilitatorKeypair = Ed25519Keypair.fromSecretKey(FACILITATOR_PRIVATE_KEY);
```

#### 3. **Payment Verification Logic**

```typescript
// Verify user signed payment correctly
async function verifyPayment(payment: X402Payment): Promise<boolean> {
    const { signature, publicKey, amount, recipient } = payment;

    // 1. Verify signature using Sui's Ed25519
    const message = encodePaymentMessage(amount, recipient);
    const isValid = await verifyEd25519Signature(signature, message, publicKey);

    // 2. Check wallet has sufficient balance
    const balance = await suiClient.getBalance({
        owner: publicKey,
        coinType: '0x2::sui::SUI'
    });

    return isValid && balance.totalBalance >= amount;
}
```

#### 4. **Settlement Logic**

```typescript
// Execute on-chain payment after resource delivered
async function settlePayment(payment: X402Payment): Promise<string> {
    const tx = new Transaction();

    // Transfer payment from user to protocol
    tx.transferObjects(
        [tx.splitCoins(tx.gas, [tx.pure.u64(payment.amount)])],
        tx.pure.address(PROTOCOL_TREASURY)
    );

    // Execute with gas sponsorship
    const result = await suiClient.signAndExecuteTransaction({
        signer: facilitatorKeypair,
        transaction: tx
    });

    return result.digest; // Return tx hash
}
```

### Feasibility Assessment

| Requirement | Status | Complexity |
|------------|--------|------------|
| Sui RPC Access | ✅ Available | LOW |
| Ed25519 Signature Verification | ✅ Native to Sui | LOW |
| Balance Checking | ✅ Simple RPC call | LOW |
| Gas Sponsorship | ✅ Supported by Sui | MEDIUM |
| Custom Facilitator Code | ⚠️ Needs implementation | MEDIUM |
| x402 Spec Compliance | ⚠️ Need to validate | MEDIUM |

**Verdict: FEASIBLE** - Estimated 2-3 weeks for MVP facilitator

---

## 4. x402 Integration Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Web Browser │  │  AI Agent    │  │  Trading Bot             │ │
│  │  (Wallet)    │  │  (HTTP SDK)  │  │  (Automated)             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────────┘ │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │                  │
          │ x402 Payment Headers (X-PAYMENT)    │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────────────┐
│                   CARAPACE API LAYER                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ x402 Middleware                                                │ │
│  │ - Intercepts requests                                          │ │
│  │ - Checks X-PAYMENT header                                      │ │
│  │ - Returns 402 if payment missing/invalid                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ API Endpoints (with x402 protection)                           │ │
│  │ - GET /api/pools/quote/premium  (402-protected)               │ │
│  │ - POST /api/bundles/build       (402-protected)               │ │
│  │ - GET /api/analytics/mev        (402-protected)               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬──────────────────────────────────┘
                                    │
                                    │ Verify & Settle
                                    │
┌───────────────────────────────────▼──────────────────────────────────┐
│                   SUI x402 FACILITATOR                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Verification Service                                           │ │
│  │ - POST /verify → Check signature + balance                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Settlement Service                                             │ │
│  │ - POST /settle → Execute Sui transaction                       │ │
│  │ - Gas sponsorship                                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬──────────────────────────────────┘
                                    │
                                    │ Sui Transactions
                                    │
┌───────────────────────────────────▼──────────────────────────────────┐
│                        SUI BLOCKCHAIN                                │
│  - Payment settlements                                               │
│  - Private DEX swaps                                                 │
│  - Flash loan bundles                                                │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. **x402 Middleware (Carapace API)**

**File**: `apps/api/src/middleware/x402.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { X402FacilitatorClient } from '../services/x402-facilitator';

interface X402Config {
    amount: string;        // Payment amount in SUI
    recipient: string;     // Protocol treasury address
    timeout: number;       // Payment validity (seconds)
    schemes: string[];     // Supported payment schemes ['exact']
    networks: string[];    // Supported networks ['sui:mainnet']
}

export function x402Protection(config: X402Config) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const paymentHeader = req.headers['x-payment'] as string;

        // 1. No payment header → Return 402
        if (!paymentHeader) {
            return res.status(402).json({
                error: 'Payment Required',
                paymentOptions: {
                    paymentRequirements: [{
                        scheme: 'exact',
                        network: 'sui:mainnet',
                        amount: config.amount,
                        recipient: config.recipient,
                        timeout: config.timeout,
                    }],
                },
            }).header('X-PAYMENT-OPTIONS', JSON.stringify({
                schemes: config.schemes,
                networks: config.networks,
            }));
        }

        // 2. Decode payment payload
        let payment: X402Payment;
        try {
            payment = JSON.parse(
                Buffer.from(paymentHeader, 'base64').toString('utf8')
            );
        } catch {
            return res.status(400).json({ error: 'Invalid payment format' });
        }

        // 3. Verify payment with facilitator
        const facilitator = new X402FacilitatorClient(FACILITATOR_URL);
        const verification = await facilitator.verify(payment);

        if (!verification.valid) {
            return res.status(402).json({
                error: 'Invalid payment',
                reason: verification.reason,
            });
        }

        // 4. Payment valid → Continue to route handler
        req.x402Payment = payment;
        next();

        // 5. After response sent → Settle payment on-chain
        res.on('finish', async () => {
            if (res.statusCode === 200) {
                const settlement = await facilitator.settle(payment);

                // Add settlement info to response header
                res.setHeader('X-PAYMENT-RESPONSE', JSON.stringify({
                    transactionHash: settlement.txHash,
                    network: 'sui:mainnet',
                    status: 'confirmed',
                }));
            }
        });
    };
}
```

#### 2. **Sui x402 Facilitator Service**

**File**: `services/x402-facilitator/src/facilitator.ts`

```typescript
import express from 'express';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';

const app = express();
const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL });
const facilitatorKey = Ed25519Keypair.fromSecretKey(process.env.FACILITATOR_KEY);

interface X402Payment {
    scheme: 'exact';
    network: 'sui:mainnet';
    amount: string;
    recipient: string;
    signature: string;
    publicKey: string;
    nonce: string;
}

/**
 * POST /verify
 * Verify payment signature and balance
 */
app.post('/verify', async (req, res) => {
    const payment: X402Payment = req.body;

    try {
        // 1. Reconstruct signed message
        const message = new TextEncoder().encode(
            `x402-payment:${payment.amount}:${payment.recipient}:${payment.nonce}`
        );

        // 2. Verify signature
        const isValidSignature = await verifyPersonalMessageSignature(
            message,
            payment.signature,
            payment.publicKey
        );

        if (!isValidSignature) {
            return res.json({ valid: false, reason: 'Invalid signature' });
        }

        // 3. Check balance
        const address = new Ed25519Keypair({ publicKey: payment.publicKey }).toSuiAddress();
        const balance = await suiClient.getBalance({
            owner: address,
            coinType: '0x2::sui::SUI',
        });

        const hasBalance = BigInt(balance.totalBalance) >= BigInt(payment.amount);

        if (!hasBalance) {
            return res.json({ valid: false, reason: 'Insufficient balance' });
        }

        // 4. Payment is valid
        res.json({ valid: true });
    } catch (error) {
        res.status(500).json({ valid: false, reason: error.message });
    }
});

/**
 * POST /settle
 * Execute on-chain payment
 */
app.post('/settle', async (req, res) => {
    const payment: X402Payment = req.body;

    try {
        const tx = new Transaction();

        // User's address
        const userAddress = new Ed25519Keypair({
            publicKey: payment.publicKey
        }).toSuiAddress();

        // Transfer payment from user to recipient
        // Note: In production, use gas-sponsored transactions
        tx.transferObjects(
            [tx.splitCoins(tx.gas, [tx.pure.u64(payment.amount)])],
            tx.pure.address(payment.recipient)
        );

        // Execute transaction with facilitator as sponsor
        const result = await suiClient.signAndExecuteTransaction({
            signer: facilitatorKey,
            transaction: tx,
            options: { showEffects: true },
        });

        if (result.effects?.status?.status !== 'success') {
            throw new Error('Transaction failed');
        }

        res.json({
            success: true,
            txHash: result.digest,
            network: 'sui:mainnet',
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /supported
 * List supported schemes and networks
 */
app.get('/supported', (req, res) => {
    res.json({
        schemes: ['exact'],
        networks: ['sui:mainnet', 'sui:testnet', 'sui:devnet'],
    });
});

app.listen(3402, () => {
    console.log('Sui x402 Facilitator running on port 3402');
});
```

#### 3. **Protected API Endpoints**

**File**: Update `apps/api/src/routes/pools.ts`

```typescript
import { x402Protection } from '../middleware/x402';

/**
 * GET /api/pools/quote/premium
 * Premium private quote with MEV insurance (requires payment)
 */
router.get(
    '/quote/premium',
    x402Protection({
        amount: '10000000', // 0.01 SUI = 10M MIST
        recipient: PROTOCOL_TREASURY,
        timeout: 30,
        schemes: ['exact'],
        networks: ['sui:mainnet'],
    }),
    async (req: Request, res: Response) => {
        // This code only runs if payment is valid

        const { poolId, amountIn, isXToY } = req.query;

        // Get ultra-private quote with MEV guarantee
        const quote = await getPrivateQuoteWithMEVInsurance({
            poolId: poolId as string,
            amountIn: amountIn as string,
            isXToY: isXToY === 'true',
        });

        res.json({
            ...quote,
            mevProtection: true,
            priorityExecution: true,
            paidVia: 'x402',
        });
    }
);

/**
 * POST /api/bundles/build/institutional
 * Build private bundle with institutional guarantees (requires payment)
 */
router.post(
    '/bundles/build/institutional',
    x402Protection({
        amount: '100000000', // 0.1 SUI = 100M MIST
        recipient: PROTOCOL_TREASURY,
        timeout: 60,
        schemes: ['exact'],
        networks: ['sui:mainnet'],
    }),
    async (req: Request, res: Response) => {
        // Premium bundling service with:
        // - Guaranteed MEV protection
        // - Priority execution
        // - Private order flow routing
        // - Real-time analytics

        const bundle = await buildInstitutionalBundle(req.body);

        res.json(bundle);
    }
);
```

---

## 5. Implementation Roadmap

### Phase 1: Sui x402 Facilitator (Weeks 1-2)

**Goal**: Build custom facilitator for Sui blockchain

**Tasks:**

#### Week 1: Core Facilitator
- [ ] Set up Express.js service
- [ ] Implement `/verify` endpoint
  - Signature verification using Sui's Ed25519
  - Balance checking via Sui RPC
- [ ] Implement `/settle` endpoint
  - Gas-sponsored transactions
  - Payment execution
- [ ] Implement `/supported` endpoint
- [ ] Write unit tests

**Deliverables:**
- `services/x402-facilitator/` directory
- Docker container for facilitator
- Test suite

#### Week 2: Testing & Deployment
- [ ] Test on Sui Devnet
- [ ] Test on Sui Testnet
- [ ] Gas sponsorship optimization
- [ ] Deploy to production infrastructure
- [ ] Monitor metrics (latency, success rate)

**Deliverables:**
- Deployed facilitator on Testnet
- Performance benchmarks
- Monitoring dashboard

---

### Phase 2: Carapace API Integration (Weeks 2-3)

**Goal**: Add x402 middleware to Carapace API

**Tasks:**

#### Week 2-3: Middleware Implementation
- [ ] Create x402 middleware (`apps/api/src/middleware/x402.ts`)
- [ ] Add facilitator client SDK
- [ ] Protect premium endpoints:
  - `/api/pools/quote/premium`
  - `/api/bundles/build/institutional`
  - `/api/analytics/mev` (new)
- [ ] Add payment tracking database
- [ ] Implement revenue analytics

**Deliverables:**
- x402-protected API endpoints
- Revenue tracking system
- Admin dashboard for payments

---

### Phase 3: Client SDK & UI (Weeks 3-4)

**Goal**: Enable clients to make x402 payments

**Tasks:**

#### Week 3: SDK Development
- [ ] Create x402 client library (`packages/sdk/src/x402/`)
- [ ] Implement payment signing
- [ ] Add automatic payment retry logic
- [ ] Write TypeScript types

**File**: `packages/sdk/src/x402/client.ts`

```typescript
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export class X402Client {
    constructor(
        private readonly keypair: Ed25519Keypair,
        private readonly facilitatorUrl: string
    ) {}

    /**
     * Generate x402 payment payload
     */
    async createPayment(params: {
        amount: string;
        recipient: string;
    }): Promise<string> {
        // 1. Generate nonce
        const nonce = crypto.randomUUID();

        // 2. Create message to sign
        const message = new TextEncoder().encode(
            `x402-payment:${params.amount}:${params.recipient}:${nonce}`
        );

        // 3. Sign message
        const signature = await this.keypair.sign(message);

        // 4. Create payment payload
        const payment = {
            scheme: 'exact',
            network: 'sui:mainnet',
            amount: params.amount,
            recipient: params.recipient,
            signature: Buffer.from(signature).toString('base64'),
            publicKey: this.keypair.getPublicKey().toBase64(),
            nonce,
        };

        // 5. Encode as base64 for X-PAYMENT header
        return Buffer.from(JSON.stringify(payment)).toString('base64');
    }

    /**
     * Make x402-protected API request
     */
    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        // 1. Try request without payment first
        let response = await fetch(url, options);

        // 2. If 402, create payment and retry
        if (response.status === 402) {
            const paymentOptions = await response.json();
            const requirement = paymentOptions.paymentRequirements[0];

            // Create payment
            const payment = await this.createPayment({
                amount: requirement.amount,
                recipient: requirement.recipient,
            });

            // Retry with payment header
            response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'X-PAYMENT': payment,
                },
            });
        }

        return response;
    }
}
```

#### Week 4: UI Integration
- [ ] Add "Premium" toggle to swap interface
- [ ] Show payment amount before swap
- [ ] Display payment confirmation
- [ ] Add payment history page

**UI Component**: `apps/web/components/PremiumSwap.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { X402Client } from '@carapace/sdk';

export function PremiumSwap() {
    const { keypair } = useWallet();
    const [usePremium, setUsePremium] = useState(false);

    const getQuote = async () => {
        const x402Client = new X402Client(keypair, FACILITATOR_URL);

        const endpoint = usePremium
            ? '/api/pools/quote/premium'
            : '/api/pools/quote';

        // Automatically handles x402 payment
        const response = await x402Client.fetch(endpoint, {
            method: 'GET',
            // ... query params
        });

        const quote = await response.json();

        if (usePremium) {
            console.log('MEV Protection:', quote.mevProtection);
            console.log('Priority Execution:', quote.priorityExecution);
        }

        return quote;
    };

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={usePremium}
                    onChange={e => setUsePremium(e.target.checked)}
                />
                Use Premium (0.01 SUI) - MEV Insurance + Priority
            </label>

            {usePremium && (
                <div className="premium-badge">
                    Premium Features:
                    ✓ MEV Protection
                    ✓ Priority Execution
                    ✓ Private Order Flow
                    ✓ Real-time Analytics
                </div>
            )}

            <button onClick={getQuote}>Get Quote</button>
        </div>
    );
}
```

**Deliverables:**
- x402 Client SDK
- Premium swap UI
- Payment history dashboard

---

### Phase 4: AI Agent Integration (Weeks 4-5)

**Goal**: Enable AI agents to trade programmatically

**Example: Python Trading Bot**

```python
import requests
import json
from sui_sdk import SuiClient, Ed25519Keypair

class CarapaceX402Client:
    def __init__(self, keypair: Ed25519Keypair, api_url: str):
        self.keypair = keypair
        self.api_url = api_url

    def create_x402_payment(self, amount: str, recipient: str) -> str:
        """Create x402 payment header"""
        import uuid
        nonce = str(uuid.uuid4())

        # Sign message
        message = f"x402-payment:{amount}:{recipient}:{nonce}"
        signature = self.keypair.sign(message.encode())

        # Create payment payload
        payment = {
            'scheme': 'exact',
            'network': 'sui:mainnet',
            'amount': amount,
            'recipient': recipient,
            'signature': signature.hex(),
            'publicKey': self.keypair.public_key.hex(),
            'nonce': nonce,
        }

        # Encode as base64
        import base64
        return base64.b64encode(json.dumps(payment).encode()).decode()

    def get_premium_quote(self, pool_id: str, amount_in: str):
        """Get premium quote with MEV protection"""
        url = f"{self.api_url}/api/pools/quote/premium"

        # Try without payment first
        response = requests.get(url, params={
            'poolId': pool_id,
            'amountIn': amount_in,
            'isXToY': 'true'
        })

        # If 402, add payment and retry
        if response.status_code == 402:
            payment_options = response.json()
            requirement = payment_options['paymentRequirements'][0]

            payment_header = self.create_x402_payment(
                requirement['amount'],
                requirement['recipient']
            )

            response = requests.get(url,
                params={'poolId': pool_id, 'amountIn': amount_in, 'isXToY': 'true'},
                headers={'X-PAYMENT': payment_header}
            )

        return response.json()

# Usage
keypair = Ed25519Keypair.from_secret_key(AI_AGENT_KEY)
client = CarapaceX402Client(keypair, 'https://carapace.sui')

# AI agent can now trade with MEV protection
quote = client.get_premium_quote(
    pool_id='POOL_ID',
    amount_in='1000000000'  # 1 SUI
)

print(f"Quote: {quote['amountOut']}")
print(f"MEV Protected: {quote['mevProtection']}")
```

**Deliverables:**
- Python SDK for x402
- JavaScript/TypeScript SDK
- Example trading bots
- Documentation

---

## 6. Use Cases Enabled by x402 + Private DEX

### Use Case 1: **AI Agent Trading Swarm**

**Scenario**: 100 AI agents execute coordinated trading strategy

**Without x402:**
- Each agent needs SUI wallet with gas
- Manual wallet management (security risk)
- Complex authentication

**With x402:**
- Agents pay $0.01 per trade via HTTP
- No wallet management needed
- Automatic rate limiting

**Implementation:**

```typescript
// Swarm coordinator
class TradingSwarm {
    agents: AIAgent[] = [];

    async coordinatedTrade(strategy: Strategy) {
        // All agents pay $0.01 for premium quotes
        const quotes = await Promise.all(
            this.agents.map(agent =>
                agent.getPremiumQuote(strategy.poolId)
            )
        );

        // Execute trades atomically (MEV protected)
        await this.executeBatch(quotes);
    }
}
```

**Revenue**: 100 agents × $0.01 × 1000 trades/day = **$1,000/day**

---

### Use Case 2: **Institutional Private Order Flow**

**Scenario**: Hedge fund executes large trades with zero slippage

**Features:**
- Pay $0.10 per trade for institutional tier
- Private order flow routing
- Batch auction execution
- MEV capture redistributed to LPs

**Implementation:**

```typescript
// Institutional client
const quote = await x402Client.fetch('/api/bundles/build/institutional', {
    method: 'POST',
    body: JSON.stringify({
        operations: [
            { poolId: 'A', amountIn: '1000000000000' }, // 1M SUI
            { poolId: 'B', amountIn: '...' },
        ],
        mevInsurance: true,
        batchAuction: true,
    })
});
```

**Benefits:**
- Zero front-running
- Best execution price
- Transparent fee structure
- Revenue sharing with LPs

---

### Use Case 3: **MEV Analytics as a Service**

**Scenario**: Provide real-time MEV data to traders

**Endpoint**: `GET /api/analytics/mev` (x402-protected)

**Pricing:**
- $0.005 per query
- Data includes: sandwich attacks detected, MEV extracted, pool vulnerability scores

**Implementation:**

```typescript
router.get(
    '/api/analytics/mev',
    x402Protection({ amount: '5000000' }), // 0.005 SUI
    async (req, res) => {
        const mevData = await analyzeMEVActivity();

        res.json({
            sandwichAttacks: mevData.attacks,
            mevExtracted: mevData.totalMEV,
            vulnerablePoolsS: mevData.pools,
            recommendations: mevData.suggestions,
        });
    }
);
```

**Market**: Traders, bots, institutions

---

### Use Case 4: **Pay-Per-Flash-Loan**

**Scenario**: Flash loan arbitrage opportunities as a service

**Model:**
- Free: See flash loan opportunities (delayed 5 min)
- $0.02: Real-time flash loan opportunities
- $0.05: Executable flash loan bundle (pre-built transaction)

**Implementation:**

```typescript
// Free tier (delayed)
GET /api/flash-loans/opportunities
→ 200 OK (5 min delay)

// Real-time tier (paid)
GET /api/flash-loans/opportunities/realtime
→ 402 Payment Required ($0.02)
→ 200 OK (real-time data)

// Executable tier (premium paid)
GET /api/flash-loans/bundle/executable
→ 402 Payment Required ($0.05)
→ 200 OK (ready-to-execute transaction)
```

---

## 7. Technical Specifications

### x402 Payment Payload Specification

```typescript
interface X402Payment {
    scheme: 'exact';           // Payment scheme
    network: 'sui:mainnet';    // Blockchain network
    amount: string;            // Payment amount in MIST (1 SUI = 1e9 MIST)
    recipient: string;         // Protocol treasury address
    signature: string;         // Ed25519 signature (base64)
    publicKey: string;         // Ed25519 public key (base64)
    nonce: string;             // Unique payment identifier (UUID)
}
```

### Signature Generation

```typescript
// Message to sign
const message = `x402-payment:${amount}:${recipient}:${nonce}`;

// Sign with Ed25519
const signature = await keypair.sign(new TextEncoder().encode(message));

// Encode for payload
const signatureBase64 = Buffer.from(signature).toString('base64');
```

### HTTP Headers

**Request (Client → Server):**
```
X-PAYMENT: <base64-encoded-payment-payload>
```

**Response (Server → Client):**
```
X-PAYMENT-RESPONSE: {"transactionHash": "...", "network": "sui:mainnet", "status": "confirmed"}
```

**402 Response (Payment Required):**
```json
{
    "error": "Payment Required",
    "paymentOptions": {
        "paymentRequirements": [{
            "scheme": "exact",
            "network": "sui:mainnet",
            "amount": "10000000",
            "recipient": "0x...",
            "timeout": 30
        }]
    }
}
```

### Facilitator API Specification

**POST /verify**
```json
{
    "scheme": "exact",
    "network": "sui:mainnet",
    "amount": "10000000",
    "recipient": "0x...",
    "signature": "...",
    "publicKey": "...",
    "nonce": "..."
}
```

Response:
```json
{
    "valid": true
}
```

**POST /settle**
```json
{
    "scheme": "exact",
    "network": "sui:mainnet",
    "amount": "10000000",
    "recipient": "0x...",
    "signature": "...",
    "publicKey": "...",
    "nonce": "..."
}
```

Response:
```json
{
    "success": true,
    "txHash": "0x...",
    "network": "sui:mainnet"
}
```

**GET /supported**
Response:
```json
{
    "schemes": ["exact"],
    "networks": ["sui:mainnet", "sui:testnet", "sui:devnet"]
}
```

---

## 8. Comparison: With vs Without x402

### Feature Matrix

| Feature | Private DEX (No x402) | Private DEX + x402 |
|---------|----------------------|-------------------|
| **MEV Protection** | ✅ Commit-reveal | ✅ Commit-reveal |
| **Privacy** | ✅ Encrypted quotes | ✅ Encrypted quotes |
| **AI Agent Support** | ⚠️ Requires wallet | ✅ HTTP-native |
| **Monetization** | Swap fees only | Multi-tier pricing |
| **Programmatic Access** | Manual integration | Built-in HTTP standard |
| **Rate Limiting** | IP-based | Payment-based |
| **Premium Features** | Not available | Tiered access |
| **Revenue Streams** | 1 (swap fees) | 4+ (swaps, quotes, analytics, bundles) |

### Revenue Comparison (Monthly)

**Scenario**: 1,000 daily active users, 10 swaps/user/day

**Without x402:**
```
Revenue = Swap fees only
= 1,000 users × 10 swaps × 30 days × 0.25% fee × $100 avg swap
= 300,000 swaps × $0.25 = $75,000/month
```

**With x402 (Multi-tier model):**
```
Revenue = Swap fees + x402 fees

Breakdown:
- Free tier (500 users): $0 x402 fees
- Basic tier (300 users): 300 × 10 × 30 × $0.01 = $900
- Premium tier (150 users): 150 × 10 × 30 × $0.05 = $2,250
- Institutional (50 users): 50 × 10 × 30 × $0.10 = $1,500

Swap fees: $75,000
x402 fees: $4,650
Analytics/API: $5,000 (estimated)

Total = $84,650/month (+13% increase)
```

### User Experience Comparison

| Aspect | Without x402 | With x402 |
|--------|-------------|----------|
| **Setup** | Connect wallet | Connect wallet |
| **Authentication** | Manual signing | Automatic payment |
| **Premium Features** | Not available | Optional upgrade |
| **AI Agent Integration** | Complex | Simple HTTP |
| **Gas Management** | User responsibility | Facilitator handles |
| **Rate Limits** | Hard caps | Pay-as-you-go |

---

## 9. Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| **Payment Replay** | Nonce validation (one-time use) |
| **Signature Forgery** | Ed25519 verification on Sui |
| **Insufficient Balance** | Pre-flight balance check |
| **Double Spending** | Facilitator tracks settled payments |
| **Facilitator Compromise** | Multi-sig treasury, gas limits |
| **MEV on x402 Payments** | Payments are small ($0.01-0.10) |

### Gas Sponsorship Risks

**Problem**: Facilitator sponsors gas, could be drained

**Mitigations:**
1. **Rate limiting**: Max 100 settlements/minute per user
2. **Gas budget**: Cap gas at 10M per transaction
3. **Multi-sig treasury**: Requires 3/5 signatures for large withdrawals
4. **Monitoring**: Alert on unusual activity

### Privacy Analysis

**What's Private:**
- ✅ Swap amounts (via private DEX)
- ✅ User identity (wallet signature only)
- ✅ Order flow (commit-reveal)

**What's NOT Private:**
- ❌ Payment amounts (visible in x402 header)
- ❌ API endpoint accessed (HTTP logs)
- ⚠️ On-chain settlement (public transaction)

**Recommendation**: Combine with ZK proofs for full privacy

---

## 10. Roadmap & Timeline

### Implementation Timeline

```
Week 1-2: Sui x402 Facilitator
├─ Week 1: Core facilitator development
└─ Week 2: Testing & deployment

Week 2-3: Carapace API Integration
├─ x402 middleware
├─ Protected endpoints
└─ Revenue tracking

Week 3-4: Client SDK & UI
├─ Week 3: SDK development
└─ Week 4: UI integration

Week 4-5: AI Agent Integration
├─ Python SDK
├─ Example bots
└─ Documentation

Week 6: Launch & Marketing
├─ Beta testing
├─ Security audit
└─ Public launch
```

### Success Metrics

**Technical KPIs:**
- Facilitator latency: <500ms (verify + settle)
- Payment success rate: >99%
- Gas sponsorship cost: <$0.001 per settlement

**Business KPIs:**
- 100+ premium users in first month
- $5,000+ x402 revenue in first month
- 10+ AI agents integrated

**User KPIs:**
- 4.5+ star rating for premium features
- <1% churn rate for paid tiers
- 20%+ conversion from free to paid

---

## 11. Conclusion

### Key Takeaways

**1. x402 CAN Be Used on Sui**
- Requires custom facilitator (2-3 weeks to build)
- Sui's Ed25519 and gas sponsorship make it feasible
- Chain-agnostic design is compatible

**2. x402 + Private DEX = Powerful Synergy**
- Enables AI agent trading without wallet management
- Creates new revenue streams beyond swap fees
- Provides tiered privacy/feature access

**3. Unique Value Proposition**
- First x402-enabled DEX on Sui
- Privacy-as-a-Service model
- Institutional-grade order flow

### Recommended Actions

**Immediate (Week 1):**
1. ✅ Review this design document
2. Start building Sui x402 facilitator
3. Set up test infrastructure

**Short-term (Weeks 2-4):**
1. Integrate x402 into Carapace API
2. Build client SDKs
3. Launch beta with select users

**Medium-term (Weeks 5-8):**
1. Add AI agent examples
2. Expand premium feature set
3. Partner with institutions

### Expected Impact

**Technical:**
- Industry-first x402 implementation on Sui
- Seamless AI agent integration
- HTTP-native blockchain payments

**Business:**
- 13%+ revenue increase from x402 fees
- New market: AI agent trading
- Institutional partnerships

**Ecosystem:**
- Proves Sui's extensibility
- Advances x402 adoption
- Sets standard for private DEX

---

**Document Version:** 1.0
**Created:** 2025-11-10
**Status:** Design Proposal
**Next Steps:** Build Sui x402 Facilitator (Phase 1)
