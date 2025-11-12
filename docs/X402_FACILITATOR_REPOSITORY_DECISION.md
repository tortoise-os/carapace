# x402 Facilitator Repository Decision: Monorepo vs Standalone

## Executive Summary

**Recommendation: Start as a package in the Carapace monorepo, with a plan to extract to standalone later.**

**Why this hybrid approach?**
1. **Faster initial development** (weeks instead of months)
2. **Shared infrastructure** with Carapace (DB, config, monitoring)
3. **Easy to extract later** when ready for public adoption
4. **Follows Coinbase's pattern** (x402 itself is a monorepo with multi-language support)

---

## Table of Contents

1. [Current Carapace Structure Analysis](#current-structure)
2. [Option 1: Package in Carapace Monorepo](#option-1-monorepo)
3. [Option 2: Standalone Repository](#option-2-standalone)
4. [Option 3: Hybrid Approach (RECOMMENDED)](#option-3-hybrid)
5. [Implementation Plan](#implementation-plan)
6. [Migration Strategy](#migration-strategy)

---

## 1. Current Carapace Structure Analysis

### Monorepo Organization

```
carapace/
├── apps/
│   ├── api/              # Carapace API (port 3500)
│   ├── indexer/          # Blockchain indexer
│   └── web/              # Next.js frontend (port 3501)
├── packages/
│   ├── carapace-ui/      # UI component library
│   ├── sdk/              # Carapace SDK
│   └── strategy-sdk/     # Flash loan strategies
├── move/                 # Sui smart contracts
├── docs/                 # Documentation
└── tooling/             # Dev tools
```

### Key Characteristics

- **Package manager**: Bun + Turbo
- **Monorepo tool**: Turborepo
- **Workspaces**: `apps/*` and `packages/*`
- **Shared config**: TypeScript, Biome, Playwright
- **Current apps**: 3 (api, indexer, web)

---

## 2. Option 1: Package in Carapace Monorepo

### Structure

```
carapace/
├── apps/
│   ├── x402-facilitator/        # NEW: x402 facilitator service
│   │   ├── src/
│   │   │   ├── index.ts         # Main server
│   │   │   ├── routes/
│   │   │   │   ├── verify.ts    # POST /verify
│   │   │   │   ├── settle.ts    # POST /settle
│   │   │   │   └── supported.ts # GET /supported
│   │   │   ├── services/
│   │   │   │   ├── sui-client.ts
│   │   │   │   └── signature-verifier.ts
│   │   │   └── config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   ├── api/                     # Carapace API
│   └── web/                     # Frontend
├── packages/
│   ├── x402-types/              # NEW: Shared x402 types
│   │   ├── src/
│   │   │   ├── payment.ts
│   │   │   └── facilitator.ts
│   │   └── package.json
│   └── sdk/                     # Carapace SDK
└── docs/
    └── x402/                    # NEW: x402-specific docs
        ├── FACILITATOR_API.md
        └── SUI_INTEGRATION.md
```

### Pros

**Development Speed:**
- ✅ **Immediate access to shared infrastructure**
  - Database (Postgres via Docker)
  - Monitoring (Grafana, Prometheus)
  - Dev environment (Taskfile, Docker Compose)
  - CI/CD (existing Turbo pipelines)

- ✅ **Shared dependencies**
  - `@mysten/sui` already in monorepo
  - TypeScript config inheritance
  - Linting/formatting (Biome) pre-configured

- ✅ **Faster iteration**
  - Can reference Carapace API code directly
  - Test integration with Carapace immediately
  - Hot reload with Turbo dev mode

**Integration Benefits:**
- ✅ **Direct integration with Carapace API**
  ```typescript
  // apps/api/src/middleware/x402.ts
  import { X402FacilitatorClient } from '@carapace/x402-facilitator';
  // Direct import, no separate npm package needed
  ```

- ✅ **Shared database for payment tracking**
  ```typescript
  // Both Carapace API and facilitator can access same DB
  // Track payments, revenue, analytics in one place
  ```

- ✅ **Unified deployment**
  - Deploy all services together
  - Single Docker Compose file
  - Shared secrets/environment variables

**Developer Experience:**
- ✅ **Single `bun install`** for all dependencies
- ✅ **Turborepo caching** speeds up builds
- ✅ **One codebase** to navigate
- ✅ **Shared tooling** (testing, linting, formatting)

### Cons

**Public Distribution:**
- ❌ **Harder for external contributors**
  - Must clone entire Carapace monorepo
  - More complex navigation to find x402 code
  - Carapace-specific context required

- ❌ **Coupling risk**
  - May inadvertently depend on Carapace-specific code
  - Hard to ensure x402 is truly independent

**Versioning:**
- ❌ **Shared versioning**
  - x402 facilitator version tied to Carapace releases
  - Can't independently version/release

**Discoverability:**
- ❌ **Less visible as separate project**
  - No dedicated GitHub repo with stars/forks
  - Harder to find via search (buried in monorepo)

**Complexity:**
- ❌ **Monorepo overhead**
  - External users must understand Turborepo
  - More complex contribution guide

### Best For

- ✅ **Initial development phase** (first 2-3 months)
- ✅ **When integration with Carapace is primary use case**
- ✅ **Small team focused on Carapace ecosystem**

---

## 3. Option 2: Standalone Repository

### Structure

```
sui-x402-facilitator/          # Separate GitHub repo
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── verify.ts
│   │   ├── settle.ts
│   │   └── supported.ts
│   ├── services/
│   │   ├── sui-client.ts
│   │   └── signature-verifier.ts
│   └── config.ts
├── tests/
│   ├── verify.test.ts
│   └── settle.test.ts
├── examples/
│   ├── basic-setup/
│   └── with-docker/
├── docs/
│   ├── README.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── publish.yml
├── package.json
├── tsconfig.json
└── LICENSE
```

### Pros

**Public Adoption:**
- ✅ **Easy for external contributors**
  - Clone single focused repo
  - Clear scope: "Sui x402 facilitator only"
  - No Carapace-specific context needed

- ✅ **Better discoverability**
  - Dedicated GitHub repo with own stars/forks
  - Can be listed on x402.org
  - Easy to find via "sui x402" search

- ✅ **Independent branding**
  - `sui-x402-facilitator` is descriptive
  - Can have own logo, docs site
  - Not tied to Carapace brand

**Independence:**
- ✅ **No coupling**
  - Guaranteed to work standalone
  - No accidental dependencies on Carapace
  - Clear public API contract

- ✅ **Independent versioning**
  - Semantic versioning (1.0.0, 1.1.0, etc.)
  - Release cadence independent of Carapace
  - Can follow x402 spec updates independently

**Distribution:**
- ✅ **Easier to package**
  - Publish to npm as standalone package
  - Docker images simpler
  - Can be installed globally: `npm install -g sui-x402-facilitator`

### Cons

**Development Overhead:**
- ❌ **Duplicate infrastructure**
  - Need separate CI/CD setup
  - Own monitoring/logging config
  - Separate deployment scripts

- ❌ **Slower initial development**
  - Set up from scratch
  - No shared Carapace utilities
  - Recreate common patterns

**Integration:**
- ❌ **Harder to integrate with Carapace**
  - Must publish npm package first
  - Integration testing more complex
  - Versioning coordination needed

**Maintenance:**
- ❌ **Two repos to maintain**
  - Separate security updates
  - Duplicate documentation
  - Two places for issues/PRs

### Best For

- ✅ **After MVP is validated** (3-6 months in)
- ✅ **When targeting broader Sui ecosystem**
- ✅ **If planning to accept external contributions**

---

## 4. Option 3: Hybrid Approach (RECOMMENDED)

### Strategy: "Develop in Monorepo, Distribute as Standalone"

This is the **best of both worlds** and follows industry patterns (see: Embedded Artistry blog post).

### Phase 1: Develop in Monorepo (Weeks 1-8)

**Location:** `carapace/apps/x402-facilitator/`

**Benefits:**
- Fast iteration with Carapace
- Shared infrastructure
- Easy testing of integration
- No external repo management overhead

**Structure:**
```
carapace/apps/x402-facilitator/
├── src/
│   ├── index.ts              # Main server
│   ├── routes/               # API endpoints
│   ├── services/             # Sui integration
│   └── types.ts              # x402 types
├── tests/
├── Dockerfile
└── package.json              # Dependencies
```

**Key Design Principles:**
1. **Keep it self-contained**
   - No imports from `apps/api` or other apps
   - Can only import from `packages/*` (shared code)
   - Document all external dependencies

2. **Design for extraction**
   - Use clear public API boundaries
   - Environment-based configuration (no hardcoded Carapace values)
   - Comprehensive documentation

3. **Test standalone deployment**
   - Docker container can run independently
   - No required Carapace services (optional integrations only)

### Phase 2: Extract to Standalone (Week 9+)

**Trigger for extraction:**
- ✅ MVP is working and validated
- ✅ 50+ stars/interest from community
- ✅ External contributors want to help
- ✅ Non-Carapace Sui projects want to use it

**Extraction Process:**

```bash
# 1. Create new repo
mkdir sui-x402-facilitator
cd sui-x402-facilitator
git init

# 2. Copy code from monorepo (automated script)
cp -r ../carapace/apps/x402-facilitator/* .

# 3. Update package.json
# - Remove monorepo-specific scripts
# - Add standalone build/dev scripts
# - Update repository URL

# 4. Add standalone tooling
# - CI/CD workflows (.github/workflows/)
# - Docker Compose for standalone deployment
# - Contribution guide (CONTRIBUTING.md)

# 5. Publish to npm
npm publish @sui/x402-facilitator
```

**Maintenance Model:**

```
┌─────────────────────────────────────────────────────────────┐
│  Development happens in BOTH repos                          │
├─────────────────────────────────────────────────────────────┤
│  Monorepo (carapace/apps/x402-facilitator/)                │
│  - Carapace-specific features                               │
│  - Integration testing                                      │
│  - Rapid iteration                                          │
│                                                             │
│  Standalone (sui-x402-facilitator/)                         │
│  - Public releases                                          │
│  - External contributions                                   │
│  - Sui ecosystem adoption                                   │
│                                                             │
│  Sync: Weekly merge from monorepo → standalone             │
└─────────────────────────────────────────────────────────────┘
```

**Sync Strategy:**

```bash
# Weekly sync script (run from standalone repo)
git remote add carapace https://github.com/tortoise-os/carapace
git fetch carapace
git merge --squash carapace/main:apps/x402-facilitator
git push origin main
```

### Why This Works

**Coinbase x402 itself uses a monorepo!**
- TypeScript, Python, Go, Java all in one repo
- `examples/` directory for sample code
- Multi-language support in single codebase

**Industry precedent:**
- React (Meta): Developed in monorepo, distributed as standalone packages
- Next.js (Vercel): Monorepo with multiple npm packages
- Turborepo itself: Started in monorepo, extracted when popular

**Embedded Artistry approach:**
> "Develop in a monorepo for efficiency, but automatically distribute to standalone repositories for users"

### Implementation Example

**Week 1-8: Monorepo Development**

`carapace/apps/x402-facilitator/package.json`:
```json
{
  "name": "@carapace/x402-facilitator",
  "version": "0.1.0",
  "private": true,
  "description": "Sui x402 payment facilitator (in-development)",
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --outdir dist",
    "test": "bun test"
  },
  "dependencies": {
    "@mysten/sui": "^1.14.0",
    "express": "^4.18.2"
  }
}
```

**Week 9+: Standalone Extraction**

`sui-x402-facilitator/package.json`:
```json
{
  "name": "@sui/x402-facilitator",
  "version": "1.0.0",
  "public": true,
  "description": "Production-ready x402 payment facilitator for Sui blockchain",
  "keywords": ["sui", "x402", "payments", "blockchain"],
  "repository": "github:sui-foundation/x402-facilitator",
  "bin": {
    "sui-x402": "./dist/cli.js"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm,cjs",
    "test": "vitest",
    "docker:build": "docker build -t sui-x402-facilitator .",
    "docker:run": "docker-compose up"
  },
  "dependencies": {
    "@mysten/sui": "^1.14.0",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 5. Implementation Plan

### Week 1-2: Monorepo Setup

**Task 1.1: Create package structure**

```bash
# Create directories
mkdir -p apps/x402-facilitator/src/{routes,services}
mkdir -p apps/x402-facilitator/tests
mkdir -p packages/x402-types/src

# Create package.json files
cd apps/x402-facilitator
bun init -y
```

**Task 1.2: Set up basic server**

`apps/x402-facilitator/src/index.ts`:
```typescript
import express from 'express';
import verifyRouter from './routes/verify';
import settleRouter from './routes/settle';
import supportedRouter from './routes/supported';

const app = express();
app.use(express.json());

// Routes
app.use('/verify', verifyRouter);
app.use('/settle', settleRouter);
app.use('/supported', supportedRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', version: '0.1.0' });
});

const PORT = process.env.PORT || 3402;
app.listen(PORT, () => {
    console.log(`Sui x402 Facilitator running on port ${PORT}`);
});
```

**Task 1.3: Update Turbo config**

`turbo.json`:
```json
{
    "tasks": {
        "dev": {
            "cache": false,
            "persistent": true
        },
        "build": {
            "dependsOn": ["^build"],
            "outputs": ["dist/**"]
        }
    }
}
```

**Task 1.4: Add to root package.json**

```json
{
    "scripts": {
        "dev:x402": "turbo run dev --filter=@carapace/x402-facilitator",
        "build:x402": "turbo run build --filter=@carapace/x402-facilitator"
    }
}
```

**Deliverables:**
- [ ] `apps/x402-facilitator/` directory structure
- [ ] Basic Express server
- [ ] Integrated with Turborepo
- [ ] Can run `bun run dev:x402`

---

### Week 3-4: Core Implementation

**Task 2.1: Implement verification endpoint**

`apps/x402-facilitator/src/routes/verify.ts`:
```typescript
import { Router } from 'express';
import { SuiClient } from '@mysten/sui/client';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';

const router = Router();
const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL });

router.post('/', async (req, res) => {
    const { signature, publicKey, amount, recipient, nonce } = req.body;

    try {
        // 1. Verify signature
        const message = new TextEncoder().encode(
            `x402-payment:${amount}:${recipient}:${nonce}`
        );

        const isValid = await verifyPersonalMessageSignature(
            message,
            signature,
            publicKey
        );

        if (!isValid) {
            return res.json({ valid: false, reason: 'Invalid signature' });
        }

        // 2. Check balance
        const address = deriveAddressFromPublicKey(publicKey);
        const balance = await suiClient.getBalance({
            owner: address,
            coinType: '0x2::sui::SUI',
        });

        const hasBalance = BigInt(balance.totalBalance) >= BigInt(amount);

        res.json({
            valid: hasBalance,
            reason: hasBalance ? undefined : 'Insufficient balance',
        });
    } catch (error) {
        res.status(500).json({ valid: false, reason: error.message });
    }
});

export default router;
```

**Task 2.2: Implement settlement endpoint**

`apps/x402-facilitator/src/routes/settle.ts`:
```typescript
import { Router } from 'express';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

const router = Router();
const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL });
const facilitatorKey = Ed25519Keypair.fromSecretKey(
    process.env.FACILITATOR_PRIVATE_KEY
);

router.post('/', async (req, res) => {
    const { amount, recipient } = req.body;

    try {
        const tx = new Transaction();

        // Transfer payment with gas sponsorship
        tx.transferObjects(
            [tx.splitCoins(tx.gas, [tx.pure.u64(amount)])],
            tx.pure.address(recipient)
        );

        // Execute transaction
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

export default router;
```

**Deliverables:**
- [ ] `/verify` endpoint working
- [ ] `/settle` endpoint working
- [ ] `/supported` endpoint
- [ ] Integration tests

---

### Week 5-6: Testing & Documentation

**Task 3.1: Write tests**

`apps/x402-facilitator/tests/verify.test.ts`:
```typescript
import { describe, it, expect } from 'bun:test';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

describe('POST /verify', () => {
    it('should accept valid payment signature', async () => {
        const keypair = Ed25519Keypair.generate();
        const message = `x402-payment:1000000:0xRECIPIENT:${Date.now()}`;
        const signature = await keypair.sign(new TextEncoder().encode(message));

        const response = await fetch('http://localhost:3402/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                signature: Buffer.from(signature).toString('base64'),
                publicKey: keypair.getPublicKey().toBase64(),
                amount: '1000000',
                recipient: '0xRECIPIENT',
                nonce: Date.now().toString(),
            }),
        });

        const result = await response.json();
        expect(result.valid).toBe(true);
    });
});
```

**Task 3.2: Write documentation**

`apps/x402-facilitator/README.md`:
```markdown
# Sui x402 Facilitator

A production-ready payment facilitator for the x402 protocol on Sui blockchain.

## Features

- ✅ Ed25519 signature verification
- ✅ Sui balance checking
- ✅ Gas-sponsored transactions
- ✅ RESTful API
- ✅ Docker support

## Quick Start

### Development
\`\`\`bash
cd carapace
bun install
bun run dev:x402
\`\`\`

### Production
\`\`\`bash
docker build -t sui-x402-facilitator .
docker run -p 3402:3402 sui-x402-facilitator
\`\`\`

## API Reference

### POST /verify
Verify payment signature and balance.

### POST /settle
Execute on-chain payment with gas sponsorship.

### GET /supported
List supported schemes and networks.
```

**Deliverables:**
- [ ] Test suite (80%+ coverage)
- [ ] API documentation
- [ ] Deployment guide
- [ ] Contributing guide

---

### Week 7-8: Docker & Deployment

**Task 4.1: Create Dockerfile**

`apps/x402-facilitator/Dockerfile`:
```dockerfile
FROM oven/bun:1.3.1

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Build
RUN bun run build

# Expose port
EXPOSE 3402

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run -e "fetch('http://localhost:3402/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Run
CMD ["bun", "run", "dist/index.js"]
```

**Task 4.2: Add to Docker Compose**

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  x402-facilitator:
    build:
      context: ./apps/x402-facilitator
      dockerfile: Dockerfile
    ports:
      - "3402:3402"
    environment:
      - SUI_RPC_URL=${SUI_RPC_URL}
      - FACILITATOR_PRIVATE_KEY=${FACILITATOR_PRIVATE_KEY}
      - PORT=3402
    restart: unless-stopped
    depends_on:
      - postgres
```

**Deliverables:**
- [ ] Dockerfile
- [ ] Docker Compose integration
- [ ] Deployed to testnet
- [ ] Monitoring setup

---

## 6. Migration Strategy (Week 9+)

### When to Extract

**Signals that it's time:**
1. ✅ **MVP validated** - 100+ successful payments on testnet
2. ✅ **Community interest** - 50+ GitHub stars or external inquiries
3. ✅ **External contributors** - Someone outside Carapace team wants to contribute
4. ✅ **Non-Carapace adoption** - Other Sui projects want to use it
5. ✅ **Feature complete** - All core x402 spec requirements implemented

### Extraction Checklist

**Pre-extraction:**
- [ ] Ensure zero dependencies on Carapace-specific code
- [ ] Test standalone Docker deployment
- [ ] Document all environment variables
- [ ] Write comprehensive README
- [ ] Create contribution guide

**Extraction steps:**
1. Create new GitHub repo: `sui-foundation/x402-facilitator` or `your-org/sui-x402-facilitator`
2. Copy code from monorepo
3. Update package.json for standalone
4. Add standalone CI/CD workflows
5. Publish to npm: `@sui/x402-facilitator`
6. Add to x402.org ecosystem page
7. Announce on Sui forums/Discord

**Post-extraction:**
- [ ] Keep both repos in sync (weekly merges)
- [ ] Carapace monorepo: Use published npm package
- [ ] Standalone repo: Accept external PRs
- [ ] Merge improvements back to monorepo

---

## 7. Comparison Matrix

| Aspect | Monorepo Only | Standalone Only | Hybrid (Recommended) |
|--------|---------------|-----------------|---------------------|
| **Development Speed** | ⚡ Fast (week 1) | 🐌 Slow (week 3+) | ⚡ Fast (week 1) |
| **Integration with Carapace** | ✅ Seamless | ⚠️ Requires npm | ✅ Seamless initially |
| **Public Adoption** | ❌ Difficult | ✅ Easy | ✅ Easy (after extraction) |
| **Independent Versioning** | ❌ No | ✅ Yes | ✅ Yes (after extraction) |
| **Contribution Complexity** | ⚠️ Monorepo context needed | ✅ Simple | ✅ Simple (standalone repo) |
| **Maintenance Overhead** | ✅ Low (1 repo) | ⚠️ Medium (2 repos) | ⚠️ Medium (sync needed) |
| **Time to MVP** | ✅ 2 weeks | ⚠️ 4-6 weeks | ✅ 2 weeks |
| **Time to Public Release** | ⚠️ Requires extraction | ✅ Immediate | ✅ Week 9+ |
| **Best For** | Internal tools | Public libraries | This project! |

---

## 8. Final Recommendation

### Start in Monorepo, Extract When Ready

**Phase 1 (Weeks 1-8): Monorepo Development**
```
Location: carapace/apps/x402-facilitator/

Goals:
- ✅ Fast MVP development
- ✅ Seamless Carapace integration
- ✅ Validate x402 on Sui works
- ✅ Test with real Carapace usage

Keep it extraction-ready:
- No imports from apps/api
- Environment-based config
- Comprehensive docs
```

**Phase 2 (Week 9+): Standalone Extraction**
```
Trigger: Community interest OR 100+ mainnet transactions

Steps:
1. Create sui-x402-facilitator repo
2. Copy code from monorepo
3. Publish to npm
4. Accept external contributions

Sync:
- Weekly merge monorepo → standalone
- Major features → merge back to monorepo
```

### Why This is Best

1. **Follows Coinbase pattern** - x402 itself is a monorepo with TypeScript, Python, Go implementations
2. **Industry proven** - React, Next.js, Turborepo all use this approach
3. **Pragmatic** - Start fast, optimize for open source later
4. **Low risk** - Can extract anytime, not locked in
5. **Best of both worlds** - Speed now, community later

### Action Items

**This Week:**
- [ ] Create `apps/x402-facilitator/` directory
- [ ] Set up basic Express server
- [ ] Integrate with Turborepo
- [ ] Implement `/verify` endpoint

**Next Week:**
- [ ] Implement `/settle` endpoint
- [ ] Write tests
- [ ] Deploy to Sui testnet

**Week 9 Decision:**
- [ ] Evaluate community interest
- [ ] Decide: Stay in monorepo or extract
- [ ] If extracting: Follow migration checklist

---

**Document Version:** 1.0
**Created:** 2025-11-10
**Decision:** Hybrid Approach (Monorepo → Standalone)
**Next Steps:** Create `apps/x402-facilitator/` package
