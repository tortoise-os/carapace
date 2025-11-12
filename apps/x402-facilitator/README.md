# Sui x402 Facilitator

A production-ready payment facilitator for the [x402 protocol](https://github.com/coinbase/x402) on Sui blockchain. Built with Elysia (Bun-native) for maximum performance.

## Features

- ✅ **Ed25519 signature verification** using Sui's native cryptography
- ✅ **Balance checking** via Sui RPC
- ✅ **Gas-sponsored transactions** for seamless user experience
- ✅ **RESTful API** with Elysia (Bun-native, ultra-fast)
- ✅ **TDD approach** with comprehensive test suite
- ✅ **Type-safe** with TypeScript
- ✅ **Production-ready** with proper error handling and logging

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.1.0
- Sui wallet with funds for gas sponsorship

### Installation

```bash
# From monorepo root
cd apps/x402-facilitator

# Install dependencies (handled by workspace)
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Create `.env` file:

```bash
# Sui RPC endpoint
SUI_RPC_URL=https://fullnode.devnet.sui.io:443

# Facilitator private key for gas sponsorship
# Generate with: sui keytool export --key-identity <address>
FACILITATOR_PRIVATE_KEY=suiprivkey1...

# Server port (optional, default: 3402)
PORT=3402

# Supported networks (optional)
SUPPORTED_NETWORKS=sui:devnet,sui:testnet,sui:mainnet

# Max gas per transaction in MIST (optional, default: 10000000 = 0.01 SUI)
MAX_GAS_PER_TX=10000000
```

### Development

```bash
# Run in watch mode
bun run dev

# Run tests
bun test

# Type check
bun run typecheck

# Build
bun run build

# Run production build
bun run start
```

## API Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": 1699999999999,
  "uptime": 123456
}
```

### POST /verify

Verify payment signature and balance.

**Request:**
```json
{
  "scheme": "exact",
  "network": "sui:devnet",
  "amount": "1000000",
  "recipient": "0x123...",
  "signature": "base64...",
  "publicKey": "base64...",
  "nonce": "uuid..."
}
```

**Response:**
```json
{
  "valid": true
}
```

Or if invalid:
```json
{
  "valid": false,
  "reason": "Insufficient balance"
}
```

### POST /settle

Execute on-chain payment with gas sponsorship.

**Request:**
```json
{
  "scheme": "exact",
  "network": "sui:devnet",
  "amount": "1000000",
  "recipient": "0x123...",
  "signature": "base64...",
  "publicKey": "base64...",
  "nonce": "uuid..."
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0xabc...",
  "network": "sui:devnet"
}
```

Or if failed:
```json
{
  "success": false,
  "error": "Transaction failed: ..."
}
```

### GET /supported

List supported schemes and networks.

**Response:**
```json
{
  "schemes": ["exact"],
  "networks": ["sui:devnet", "sui:testnet", "sui:mainnet"]
}
```

## Testing

### Unit Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/verify.test.ts

# Watch mode
bun test --watch
```

### Integration Tests

```bash
# Start server in one terminal
bun run dev

# Run tests in another terminal
bun test
```

## Docker

### Build

```bash
docker build -t sui-x402-facilitator .
```

### Run

```bash
docker run -p 3402:3402 \
  -e SUI_RPC_URL=https://fullnode.devnet.sui.io:443 \
  -e FACILITATOR_PRIVATE_KEY=suiprivkey1... \
  sui-x402-facilitator
```

## Architecture

```
apps/x402-facilitator/
├── src/
│   ├── index.ts              # Main Elysia app
│   ├── config.ts             # Configuration
│   ├── routes/
│   │   ├── health.ts         # GET /health
│   │   ├── verify.ts         # POST /verify
│   │   ├── settle.ts         # POST /settle
│   │   └── supported.ts      # GET /supported
│   ├── services/
│   │   ├── sui-client.ts     # Sui blockchain client
│   │   └── signature-verifier.ts  # Ed25519 verification
│   └── types.ts              # TypeScript types
├── tests/
│   ├── health.test.ts
│   ├── verify.test.ts
│   ├── settle.test.ts
│   └── supported.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Security Considerations

### Gas Sponsorship

The facilitator sponsors gas for user transactions. Important security measures:

1. **Gas Limits**: Max gas per transaction configured via `MAX_GAS_PER_TX`
2. **Rate Limiting**: Recommended to add rate limiting in production
3. **Private Key Security**: Store `FACILITATOR_PRIVATE_KEY` securely (use secrets manager)
4. **Multi-sig**: Consider multi-sig for facilitator wallet in production

### Signature Verification

All payments are verified using Ed25519 signatures:

1. Message format: `x402-payment:{amount}:{recipient}:{nonce}`
2. Signature verified against public key
3. Balance checked before settlement

## Deployment

### Environment Variables

**Required:**
- `SUI_RPC_URL`: Sui RPC endpoint
- `FACILITATOR_PRIVATE_KEY`: Private key for gas sponsorship

**Optional:**
- `PORT`: Server port (default: 3402)
- `SUPPORTED_NETWORKS`: Comma-separated list of networks
- `MAX_GAS_PER_TX`: Max gas in MIST (default: 10000000)

### Production Checklist

- [ ] Use mainnet RPC URL
- [ ] Secure facilitator private key (secrets manager)
- [ ] Add rate limiting
- [ ] Enable monitoring (Prometheus/Grafana)
- [ ] Set up alerting
- [ ] Configure CORS properly
- [ ] Add request logging
- [ ] Use multi-sig for facilitator wallet

## Contributing

This package is part of the Carapace monorepo. See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

See [LICENSE](../../LICENSE) file in repository root.

## Links

- [x402 Protocol Specification](https://github.com/coinbase/x402)
- [Sui Documentation](https://docs.sui.io)
- [Elysia Documentation](https://elysiajs.com)
- [Carapace Documentation](../../docs/README.md)
