# Carapace Tooling

**⚠️ IMPORTANT: ALL SCRIPTS MUST BE IN `tooling/<category>/src/` AS NPM PACKAGES**

This directory contains all development tooling organized as standalone npm packages.

## 📁 Directory Structure

```
tooling/
├── README.md                    # This file - always check here first
├── blockchain/                  # ⭐ Sui blockchain operations
│   ├── package.json
│   └── src/
│       ├── add-liquidity.ts
│       ├── check-tx.ts
│       ├── create-pool.ts
│       ├── debug-pool.ts
│       ├── query-pool.ts
│       └── test-swap.ts
├── dev/                         # ⭐ Development environment
│   ├── package.json
│   └── src/
│       └── cleanup-ports.sh
├── testing/                     # ⭐ Testing utilities
│   ├── package.json
│   └── src/
│       ├── e2e-blockchain-test.ts
│       └── test-api.ts
├── demo/                        # ⭐ Demo and graphics
│   ├── package.json
│   ├── src/
│   │   └── export-all.sh
│   └── graphics/               # Graphics assets
├── docs/                        # ⭐ Documentation tools
│   ├── package.json
│   └── src/
│       └── organize-docs.sh
├── sui/                         # ⭐ Sui network operations
│   ├── package.json
│   └── src/                    # (placeholder for future scripts)
├── typescript/                  # TypeScript configs
│   ├── package.json
│   ├── base.json
│   ├── nextjs.json
│   └── react-library.json
├── docker/                      # Docker Compose configs
│   └── docker-compose.yml
├── tasks/                       # Task-specific scripts
│   └── package.json
└── pool/                        # Pool-specific tooling

```

## 🎯 Package Organization Rules

### Structure

Each tooling category is a standalone npm package with:
- `package.json` - Package definition and script commands
- `src/` - All scripts and source files
- Optional: `README.md` - Category-specific documentation

### Naming Convention

- **Package names**: `@carapace/tooling-<category>`
- **Examples**:
  - `@carapace/tooling-blockchain`
  - `@carapace/tooling-dev`
  - `@carapace/tooling-testing`

### Where Scripts Should Live

| Script Type | Package | Location | Example |
|------------|---------|----------|---------|
| Dev environment | `tooling/dev` | `dev/src/` | `cleanup-ports.sh` |
| Blockchain interactions | `tooling/blockchain` | `blockchain/src/` | `create-pool.ts` |
| Sui network operations | `tooling/sui` | `sui/src/` | (future scripts) |
| Testing | `tooling/testing` | `testing/src/` | `e2e-blockchain-test.ts` |
| Documentation | `tooling/docs` | `docs/src/` | `organize-docs.sh` |
| Demo/Graphics | `tooling/demo` | `demo/src/` | `export-all.sh` |

### ⛔ Anti-Patterns (Don't Do This)

```
❌ carapace/scripts/           # NO - top-level scripts directory
❌ apps/web/scripts/           # NO - scripts in app directories
❌ tooling/scripts/            # NO - flat scripts directory
❌ tooling/blockchain/create-pool.ts  # NO - scripts in package root
```

### ✅ Correct Pattern

```
✅ tooling/blockchain/src/create-pool.ts    # YES - in package src/
✅ tooling/dev/src/cleanup-ports.sh         # YES - organized by category
✅ tooling/testing/src/e2e-test.ts          # YES - proper npm package
```

## 📦 Available Packages

### `@carapace/tooling-blockchain`

Sui blockchain interaction scripts.

**Scripts:**
- `add-liquidity.ts` - Add liquidity to a pool
- `check-tx.ts` - Check transaction status
- `create-pool.ts` - Create a new AMM pool
- `debug-pool.ts` - Debug pool issues
- `query-pool.ts` - Query pool state
- `test-swap.ts` - Test token swaps

**Usage:**
```bash
# Via npm scripts
cd tooling/blockchain && bun run add-liquidity

# Direct execution
bun run tooling/blockchain/src/create-pool.ts

# Via Task (recommended)
task pool:create
```

### `@carapace/tooling-dev`

Development environment management.

**Scripts:**
- `cleanup-ports.sh` - Interactive port cleanup

**Usage:**
```bash
# Via npm scripts
cd tooling/dev && bun run cleanup-ports

# Direct execution
./tooling/dev/src/cleanup-ports.sh

# Via Task (recommended)
task dev:cleanup
```

### `@carapace/tooling-testing`

Testing utilities and E2E tests.

**Scripts:**
- `e2e-blockchain-test.ts` - End-to-end blockchain tests
- `test-api.ts` - API endpoint tests

**Usage:**
```bash
# Via npm scripts
cd tooling/testing && bun run e2e-blockchain

# Direct execution
bun run tooling/testing/src/e2e-blockchain-test.ts

# Via Task (recommended)
task test:e2e
```

### `@carapace/tooling-demo`

Demo assets and graphics generation.

**Scripts:**
- `export-all.sh` - Export all demo graphics

**Usage:**
```bash
# Via npm scripts
cd tooling/demo && bun run export-graphics

# Direct execution
./tooling/demo/src/export-all.sh
```

### `@carapace/tooling-docs`

Documentation generation and organization.

**Scripts:**
- `organize-docs.sh` - Organize documentation files

**Usage:**
```bash
# Via npm scripts
cd tooling/docs && bun run organize

# Direct execution
./tooling/docs/src/organize-docs.sh
```

### `@carapace/tooling-sui`

Sui network operations (placeholder for future scripts).

**Usage:**
```bash
cd tooling/sui && bun run <script>
```

## 🔧 Integration with Taskfile

Scripts are integrated into `Taskfile.yml` at the project root. Always use Task commands when available:

```yaml
# Example Taskfile integration
tasks:
  dev:cleanup:
    desc: Clean up development ports
    cmds:
      - ./tooling/dev/src/cleanup-ports.sh

  pool:create:
    desc: Create a new pool
    cmds:
      - bun run ./tooling/blockchain/src/create-pool.ts

  test:e2e:
    desc: Run E2E blockchain tests
    cmds:
      - bun run ./tooling/testing/src/e2e-blockchain-test.ts
```

## 📝 Adding New Scripts

When adding a new script:

1. **Determine the category**: blockchain, dev, sui, testing, docs, or demo
2. **Place in correct package**: `tooling/<category>/src/script-name.{ts,sh}`
3. **Add to package.json**: Add npm script if commonly used
4. **Make executable** (if shell script): `chmod +x script.sh`
5. **Add to this README** under the appropriate package section
6. **Add to Taskfile.yml** if it's a common operation
7. **Document usage** with examples

**Example:**

```bash
# 1. Create script in correct location
touch tooling/blockchain/src/flash-loan.ts

# 2. Make it executable (if needed)
chmod +x tooling/blockchain/src/flash-loan.ts

# 3. Add to package.json
cd tooling/blockchain
# Add "flash-loan": "bun run src/flash-loan.ts" to scripts

# 4. Test it
bun run flash-loan

# 5. Update README.md (this file)
# 6. Add to Taskfile.yml if commonly used
```

## 📝 Adding a New Tooling Package

To create a new tooling category:

1. **Create package directory**:
   ```bash
   mkdir -p tooling/my-category/src
   ```

2. **Create package.json**:
   ```json
   {
     "name": "@carapace/tooling-my-category",
     "private": true,
     "version": "0.1.0",
     "description": "Description of category",
     "type": "module",
     "scripts": {
       "my-script": "bun run src/my-script.ts"
     },
     "dependencies": {
       "@carapace/sdk": "workspace:*"
     }
   }
   ```

3. **Add scripts to `src/`**

4. **Update workspace** (if needed in root package.json)

5. **Document in this README**

## 🔍 Finding Scripts

**Always check `tooling/<category>/src/` first!**

### Quick Reference Commands

```bash
# List all tooling packages
ls -d tooling/*/

# List scripts in a category
ls tooling/blockchain/src/

# Find a specific script
find tooling/*/src/ -name "*pool*"

# Search for script content
grep -r "createPool" tooling/*/src/

# Show recent scripts
ls -lt tooling/*/src/*.{ts,sh} 2>/dev/null | head -10
```

### AI Assistant Instructions

When working with this project:

1. **ALWAYS** place scripts in `tooling/<category>/src/`
2. **NEVER** create scripts outside of `tooling/`
3. **EACH CATEGORY** must be a proper npm package with `package.json`
4. **CHECK** this README before creating new packages
5. **UPDATE** package.json when adding scripts
6. **UPDATE** this README when adding scripts
7. **INTEGRATE** with Taskfile.yml for common operations

## 🏗️ Other Tooling Directories

### `docker/`
Docker Compose configurations for infrastructure services:
- PostgreSQL (port 3502)
- Redis (port 3503)
- Grafana (port 3504)
- Prometheus (port 3505)

### `typescript/`
TypeScript configuration presets:
- `base.json` - Base TypeScript config
- `nextjs.json` - Next.js specific config
- `react-library.json` - React library config

### `tasks/`
Task-specific scripts and configurations.

### `pool/`
Pool-specific tooling (legacy, consider migrating to blockchain package).

## 🚀 Quick Start

```bash
# Clean up ports before starting
task dev:cleanup

# Create a pool
cd tooling/blockchain && bun run create-pool

# Run E2E tests
cd tooling/testing && bun run e2e-blockchain

# Or use Task commands
task pool:create
task test:e2e
```

## 📚 Related Documentation

- [Root Taskfile.yml](../Taskfile.yml) - Main task runner configuration
- [Dev Environment Proposal](../docs/dev-environment-proposal.md) - Process management strategy
- [Docker Compose](./docker/docker-compose.yml) - Infrastructure services
- [AI Assistant Instructions](../.ai-assistant-instructions.md) - Quick reference

---

**Last Updated:** 2025-11-11
**Maintainer:** Carapace Team

**Remember:** All scripts live in `tooling/<category>/src/` as proper npm packages!
