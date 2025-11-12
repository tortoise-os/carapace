# Sui x402 Facilitator - Quick Start

## TL;DR

```bash
# 1. Install dependencies
bun install

# 2. Generate Sui keypair
sui client new-address ed25519
sui keytool export --key-identity <your-address>

# 3. Get devnet tokens
curl -X POST https://faucet.devnet.sui.io/gas \
  -H 'Content-Type: application/json' \
  -d '{"FixedAmountRequest":{"recipient":"<your-address>"}}'

# 4. Configure
cd apps/x402-facilitator
cp .env.example .env
# Edit .env with your facilitator private key

# 5. Run
bun run dev

# Server starts on http://localhost:3402
```

## Available Commands

```bash
# Development (from monorepo root)
bun run dev:x402        # Start dev server
bun run build:x402      # Build for production
bun run test:x402       # Run tests

# Development (from apps/x402-facilitator)
bun run dev             # Start dev server
bun test                # Run tests
bun run typecheck       # Type check
bun run build           # Build
bun run start           # Run production build
```

## Test the API

```bash
# Health check
curl http://localhost:3402/health

# Supported networks
curl http://localhost:3402/supported

# Verify payment (requires valid signature)
curl -X POST http://localhost:3402/verify \
  -H 'Content-Type: application/json' \
  -d '{"scheme":"exact","network":"sui:devnet","amount":"1000000",...}'
```

## What's Built

✅ **4 Endpoints**
- `GET /health` - Health check
- `POST /verify` - Verify payment signature & balance
- `POST /settle` - Execute on-chain payment with gas sponsorship
- `GET /supported` - List supported schemes & networks

✅ **TDD Approach**
- 30+ test cases written FIRST
- Full test coverage for all endpoints
- Integration tests included

✅ **Production Ready**
- Elysia (Bun-native) for speed
- Ed25519 signature verification
- Gas sponsorship support
- Docker support
- Type-safe with TypeScript

## Architecture

```
Client → Elysia (3402)
           ↓
    ┌──────┴──────┐
    │   Routes    │
    ├─────────────┤
    │ verify.ts   │ → SignatureVerifier → SuiClient
    │ settle.ts   │ → SuiClient (gas sponsorship)
    │ supported.ts│
    │ health.ts   │
    └─────────────┘
```

## Next Steps

1. **Test locally**: Run `bun run dev:x402` and hit the endpoints
2. **Integrate with Carapace**: Add x402 middleware to API
3. **Deploy**: Use Docker or deploy directly with Bun
4. **Go public**: Extract to standalone repo when ready

## Documentation

- Full setup guide: `../../docs/X402_FACILITATOR_SETUP.md`
- API reference: `README.md`
- Integration design: `../../docs/X402_INTEGRATION_DESIGN.md`
- Private DEX design: `../../docs/PRIVATE_DEX_DESIGN.md`
