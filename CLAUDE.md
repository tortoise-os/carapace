# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ MANDATORY: Quality Gates

**BEFORE marking ANY feature, bug fix, or refactoring as complete, ALL of these MUST pass:**

```bash
# 1. TypeScript Type Checking
turbo run typecheck

# 2. Lint - Code style and best practices
turbo run lint

# 3. Lint Repo - Monorepo dependency health
bun run lint:repo

# 4. Build - Ensure all packages compile successfully
turbo run build

# 5. Tests - All unit and E2E tests pass
bun run test        # Unit tests
bun run test:e2e    # E2E tests (web app)
```

**Quality Gate Checklist:**
- [ ] ✅ `turbo run typecheck` - No type errors
- [ ] ✅ `turbo run lint` - No linting errors
- [ ] ✅ `bun run lint:repo` - Sherif checks pass
- [ ] ✅ `turbo run build` - Build completes successfully
- [ ] ✅ `bun run test` - All tests pass

**If ANY quality gate fails:**
1. **STOP** - Do not proceed or mark complete
2. **FIX** - Address all errors immediately
3. **VERIFY** - Re-run all quality gates
4. **ONLY THEN** - Mark feature as complete

**No exceptions. No shortcuts. Quality is non-negotiable.**

---

## Project Overview

Carapace is a DeFi protocol on the Sui blockchain, part of the TortoiseOS ecosystem. It provides an AMM (Automated Market Maker) with advanced features including flash loans, liquidity pools, and swap routing.

## Current Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Blockchain**: Sui SDK (@mysten/sui)
- **Wallet Integration**: @mysten/dapp-kit
- **Styling**: Tailwind CSS v4 + shadcn/ui + MagicUI
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: Zod schemas for validation
- **Testing**: Playwright for E2E

### Smart Contracts (Move)
- **Blockchain**: Sui Move
- **Package Structure**: Modular pool, swap, and flash loan contracts
- **Testing**: Sui Move testing framework

### Backend Services
- **API**: Elysia.js (TypeScript) for REST endpoints
- **Indexer**: Real-time blockchain event indexer
- **Database**: PostgreSQL for analytics and pool data
- **Cache**: Optional Redis integration

### SDKs & Tools
- **@carapace/sdk**: TypeScript SDK for pool operations
- **@carapace/strategy-sdk**: Flash loan and arbitrage strategies
- **@carapace/carapace-ui**: Shared UI component library

### Infrastructure
- **Monorepo**: Turborepo with Bun package manager
- **Package Manager**: Bun (v1.3.1+)
- **Linting**: Biome for TypeScript/JavaScript
- **Formatting**: Biome
- **Monorepo Health**: Sherif

## Development Workflow

### Quick Start
```bash
# Install dependencies
bun install

# Start web app (with API and services)
bun run dev

# Build all packages
turbo run build

# Run tests
bun run test
```

### Available Scripts

```bash
# Development
bun run dev              # Start web app on port 3501
turbo run dev            # Start all dev servers

# Building
turbo run build          # Build all packages
bun run build            # Same as above

# Testing
bun run test             # Run unit tests
bun run test:e2e         # Run Playwright E2E tests
bun run test:unit        # Run unit tests only

# Quality Checks
turbo run lint           # Lint all packages
turbo run typecheck      # TypeScript type checking
bun run lint:repo        # Check monorepo dependencies (sherif)
bun run lint:repo:fix    # Auto-fix monorepo issues

# Formatting
bun run format           # Format code with Biome
bun run format:check     # Check formatting without changes

# Sui Move Contracts
cd move && sui move build    # Build Move contracts
cd move && sui move test     # Test Move contracts
```

### Service Ports
- Web App: 3501
- API (if running): 3500

## Architecture Guidelines

### Frontend (Next.js)

**Component Structure**:
- Server Components by default
- Use 'use client' sparingly
- Mobile-first responsive design
- All shared UI components in `packages/carapace-ui`
- App-specific components in `apps/web/components`

**Code Style**:
```typescript
// Prefer interfaces over types
interface PoolProps {
  poolId: string;
  tokenX: string;
  tokenY: string;
}

// Functional components only
export function PoolCard({ poolId, tokenX, tokenY }: PoolProps) {
  // Early returns and guard clauses
  if (!poolId) return null;

  return <div>...</div>;
}
```

**State Management**:
- React Query for blockchain/API data
- Local state with useState only when needed
- Avoid unnecessary useEffect

**Styling Best Practices**:
- Use Tailwind CSS utility classes
- Leverage `cn()` helper from `@carapace/carapace-ui` for conditional classes
- Mobile-first responsive design
- Use shadcn/ui and MagicUI components

**Blockchain Integration**:
- Use @mysten/dapp-kit hooks for wallet connection
- Use @carapace/sdk for pool operations
- Handle transaction states properly (pending, success, error)

**Performance**:
- Use Server Components for static content
- Lazy load heavy components
- Optimize images with Next.js Image

### Smart Contracts (Sui Move)

**Module Structure**:
```
move/sources/
├── pool.move           # Core AMM pool logic
├── swap.move           # Token swapping
├── flash_loan.move     # Flash loan functionality
└── tests/              # Move tests
```

**Development Workflow**:
```bash
# Build contracts
sui move build

# Run tests
sui move test

# Deploy to testnet
sui client publish --gas-budget 100000000
```

**Testing**:
- Write Move tests in `tests/` directory
- Test all edge cases and error conditions
- Use `#[test]` and `#[test_only]` attributes

### TypeScript SDKs

**SDK Structure**:
```typescript
// @carapace/sdk - Core pool operations
import { Pool } from '@carapace/sdk';

// @carapace/strategy-sdk - Advanced strategies
import { FlashLoanClient } from '@carapace/strategy-sdk';
```

**Error Handling**:
```typescript
// Use Result pattern or try/catch
try {
  const result = await sdk.pool.swap(params);
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

## Code Quality Standards

### Linting & Formatting
- **TypeScript/JavaScript**: Biome
- **Monorepo Health**: Sherif
- **Move**: Built-in Move linter

### Commit Messages
Follow conventional commits:
```
feat: add flash loan strategy builder
fix: correct pool reserve calculation
docs: update SDK documentation
refactor: simplify swap routing
test: add flash loan integration tests
chore: update dependencies
```

### Pull Request Process
1. Create feature branch from main
2. Implement feature
3. Run all quality gates locally
4. Create PR with description
5. Ensure CI passes
6. Request review

## Common Patterns

### Error Handling
```typescript
// TypeScript - Result pattern
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function swapTokens(): Promise<Result<SwapResult>> {
  try {
    const result = await executeSwap();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Blockchain Transactions
```typescript
// Use SDK for transactions
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

const { mutate: signAndExecute } = useSignAndExecuteTransaction();
const account = useCurrentAccount();

// Build and execute transaction
const tx = sdk.pool.buildSwapTransaction(params);
signAndExecute({ transaction: tx }, {
  onSuccess: (result) => console.log('Success:', result),
  onError: (error) => console.error('Error:', error),
});
```

## Performance Considerations

- Use React Query caching strategically
- Implement pagination for large datasets
- Optimize blockchain queries (batch when possible)
- Enable Turbo caching for builds

## Security Best Practices

- Never commit private keys or secrets
- Validate all transaction inputs
- Handle wallet connection errors gracefully
- Use Sui's security best practices for Move contracts
- Regular dependency updates

## Troubleshooting

### Common Issues

**Build failures**:
```bash
# Clean and rebuild
bun run clean
bun run clean:workspaces
bun install
turbo run build
```

**Type errors**:
```bash
# Check types
turbo run typecheck
```

**Sui CLI issues**:
```bash
# Check Sui installation
sui --version

# Reset Sui client
sui client
```

## Important Notes

1. **Use Turbo for parallel builds** - Faster than bun run
2. **Sui testnet for development** - Don't use mainnet during development
3. **SDK for blockchain interactions** - Don't write raw transactions
4. **Quality gates must pass** - No exceptions

## Links and Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Sui Documentation](https://docs.sui.io/)
- [Sui Move Book](https://move-book.com/)
- [Next.js App Router](https://nextjs.org/docs)
- [Biome](https://biomejs.dev/)
