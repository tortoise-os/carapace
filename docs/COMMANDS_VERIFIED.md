# Verified Commands

This document lists all commands that have been verified to work correctly.

## ✅ Working Commands

### Core Development
```bash
bun install                    # Install dependencies
bun run dev                    # Start development server (localhost:3501)
bun run format                 # Format code with Prettier
bun run format -- --check      # Check formatting without writing
```

### Testing
```bash
# E2E Testing (requires Playwright browsers installed)
bunx playwright install chromium  # Install browser first
bun test                          # Run E2E tests
```

### Move Contracts (requires Sui CLI)
```bash
cd move
sui move build                 # Build Move contracts
sui move test                  # Test Move contracts
```

## ⚠️ Commands with Issues

### Type Checking
```bash
bun run type-check            # Has TypeScript errors to fix
```
**Issue:** Multiple type errors in apps/web (unused imports, type mismatches)

### Build
```bash
bun run build                 # Fails due to type errors
```
**Issue:** Build fails because Next.js type checking finds errors

### Linting
```bash
bun run lint                  # ESLint not configured
```
**Issue:** ESLint needs to be set up for packages/carapace-ui and apps/web

## 📦 Package Manager Commands

All `bun` commands work as expected:
- `bun install` - Install dependencies
- `bun add <package>` - Add dependency
- `bun remove <package>` - Remove dependency
- `bun run <script>` - Run package.json script

## 🐳 Docker Commands (requires Docker)

```bash
cd tooling/docker
docker compose up -d          # Start services
docker compose down           # Stop services
docker compose ps             # Check status
```

## 🎯 Task Commands (requires Task CLI)

If you have [Task](https://taskfile.dev) installed:
```bash
task --list                   # List all available tasks
task dev                      # Start all services
task move:build               # Build Move contracts
task move:test                # Test Move contracts
```

## Summary

**Fully Working:** Development server, formatting, E2E testing, Move contracts
**Needs Fixing:** Type checking, build process, linting setup
**Optional:** Docker services, Task automation

Last verified: 2025-11-08
