# Troubleshooting Guide

Common issues and their solutions for Carapace development.

---

## Port Migration Issues (2025-10-20)

### Issue: Services on Old Ports

**Symptoms:**
- Services not accessible on new ports (3500-3600)
- Connection refused errors

**Solution:**
1. Stop all services
2. Update .env files from examples
3. Restart services

```bash
task docker:down
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/indexer/.env.example apps/indexer/.env
task docker:up
```

**Reference:** [PORT_MAPPING.md](./PORT_MAPPING.md)

---

## SDK Module Resolution (Fixed 2025-10-20)

### Issue: Cannot find module "@carapace/sdk"

**Error:**
```
error: Cannot find module "@carapace/sdk" from "/Users/.../apps/api/src/index.ts"
```

**Root Cause:**
SDK package.json pointed to `dist/` folder that didn't exist. Bun workspaces need direct source file references.

**Solution Applied:**
Updated `packages/sdk/package.json`:

```json
{
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "bun": "./src/index.ts",
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  }
}
```

**Why This Works:**
- Bun can run TypeScript directly
- No build step needed for development
- Workspace resolution works with source files

---

## Database Connection Issues

### Issue 1: Password Authentication Failed

**Error:**
```
PostgresError: password authentication failed for user "carapace"
code: "28P01"
```

**Root Cause:**
Database volume persisted from previous setup, init script didn't run.

**Solution:**
Recreate database with fresh volumes:

```bash
cd tooling/docker
docker compose down -v postgres
docker compose up -d postgres
```

**Verification:**
```bash
docker exec carapace-postgres psql -U carapace -c "\du"
# Should show carapace user

docker exec carapace-postgres psql -U carapace -d carapace -c "\dt amm.*"
# Should show pools, swaps, liquidity_events tables
```

### Issue 2: Wrong Port

**Error:**
```
connection to server on localhost:5432 failed
```

**Solution:**
Update DATABASE_URL in .env files to use port 3502:

```env
DATABASE_URL=postgresql://carapace:carapace_dev_password@localhost:3502/carapace
```

---

## Service-Specific Issues

### API Server

**Port 3500 issues:**
```bash
# Check if port is in use
lsof -i :3500

# Kill process if needed
kill -9 $(lsof -ti :3500)

# Start API
cd apps/api
bun run dev
```

**Module not found:**
- Make sure .env exists: `cp .env.example .env`
- Verify SDK package.json points to `./src/index.ts`
- Reinstall if needed: `bun install`

### Web App

**Port 3501 issues:**
```bash
# Check if port is in use
lsof -i :3501

# Kill process if needed
kill -9 $(lsof -ti :3501)

# Start web
cd apps/web
bun run dev
```

**API connection failed:**
- Check NEXT_PUBLIC_API_URL in .env: `http://localhost:3500`
- Verify API is running: `curl http://localhost:3500/health`

### Indexer

**Database connection:**
- Verify DATABASE_URL uses port 3502
- Check database is running: `docker ps | grep postgres`
- Test connection: See database section above

**No events being indexed:**
- Verify SUI_AMM_PACKAGE_ID in .env matches deployment
- Check package ID: `0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d`
- Ensure pools exist on-chain

---

## Docker Issues

### Services Not Starting

**Check status:**
```bash
docker ps
docker ps -a  # Show stopped containers too
```

**View logs:**
```bash
docker logs carapace-postgres
docker logs carapace-redis
docker logs carapace-grafana
docker logs carapace-prometheus
```

**Restart specific service:**
```bash
cd tooling/docker
docker compose restart postgres
docker compose restart redis
```

**Full restart:**
```bash
cd tooling/docker
docker compose down
docker compose up -d
```

### Port Conflicts

**Find what's using a port:**
```bash
lsof -i :3502  # PostgreSQL
lsof -i :3503  # Redis
lsof -i :3504  # Grafana
lsof -i :3505  # Prometheus
```

**Kill process:**
```bash
kill -9 $(lsof -ti :3502)
```

### Volume Issues

**Clean all volumes (WARNING: deletes data):**
```bash
cd tooling/docker
docker compose down -v
docker compose up -d
```

**Clean specific volume:**
```bash
cd tooling/docker
docker compose down -v postgres
docker compose up -d postgres
```

---

## Workspace Issues

### Bun Workspace Not Resolving

**Symptoms:**
- Can't find workspace packages
- Import errors for @carapace/* packages

**Solution:**
```bash
# Reinstall workspace dependencies
rm -rf node_modules
bun install

# Verify workspace configuration
cat package.json | grep -A 5 workspaces
```

### TypeScript Errors

**Type checking:**
```bash
# Check specific package
cd apps/api
bun run type-check

# Check all packages
bun run --filter './apps/*' --filter './packages/*' typecheck
```

---

## Network Issues

### Can't Reach API from Web

**Check CORS:**
```env
# apps/api/.env
CORS_ORIGIN=http://localhost:3501
```

**Test API directly:**
```bash
curl http://localhost:3500/health
curl http://localhost:3500/api/pools
```

### Can't Connect to Database

**From host machine:**
```bash
# If you have psql installed
PGPASSWORD=carapace_dev_password psql -h localhost -p 3502 -U carapace -d carapace

# Using docker
docker exec -it carapace-postgres psql -U carapace -d carapace
```

**From application:**
- Verify DATABASE_URL in .env
- Check port is 3502, not 5432
- Ensure database is running: `docker ps | grep postgres`

---

## Move Contract Issues

### Build Failures

**Clean and rebuild:**
```bash
cd move
sui move clean
sui move build
```

**Dependency issues:**
```bash
# Framework dependencies are auto-included
# Don't add explicit Sui dependency to Move.toml
```

### Test Failures

**Run tests:**
```bash
cd move
sui move test
```

**Verbose output:**
```bash
sui move test --verbose
```

---

## Quick Diagnostic Commands

### Check All Ports

```bash
for port in 3500 3501 3502 3503 3504 3505; do
  echo -n "Port $port: "
  lsof -i :$port >/dev/null 2>&1 && echo "✅ IN USE" || echo "❌ Available"
done
```

### Check All Services

```bash
echo "=== Docker Services ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== API Health ==="
curl -s http://localhost:3500/health || echo "❌ API not responding"

echo -e "\n=== Database ==="
docker exec carapace-postgres psql -U carapace -c "SELECT 1" >/dev/null 2>&1 && echo "✅ Database OK" || echo "❌ Database error"

echo -e "\n=== Redis ==="
docker exec carapace-redis redis-cli ping >/dev/null 2>&1 && echo "✅ Redis OK" || echo "❌ Redis error"
```

### Full Reset (Nuclear Option)

**WARNING: This deletes ALL data and restarts everything**

```bash
# Stop all services
cd tooling/docker
docker compose down -v

# Clean workspace
cd ../..
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Reinstall
bun install

# Recreate .env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/indexer/.env.example apps/indexer/.env

# Start infrastructure
cd tooling/docker
docker compose up -d

# Wait for database to initialize
sleep 10

# Verify database
docker exec carapace-postgres psql -U carapace -d carapace -c "\dt amm.*"

# Start services
cd ../../apps/api
bun run dev &

cd ../indexer
bun run dev &

cd ../web
bun run dev &
```

---

## Getting Help

1. **Check this guide** first
2. **Review logs:**
   - API: Terminal output
   - Indexer: Terminal output
   - Database: `docker logs carapace-postgres`
   - Redis: `docker logs carapace-redis`
3. **Check documentation:**
   - [PORT_MAPPING.md](./PORT_MAPPING.md)
   - [QUICKSTART.md](./QUICKSTART.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Port references:**
   - API: 3500
   - Web: 3501
   - PostgreSQL: 3502
   - Redis: 3503
   - Grafana: 3504
   - Prometheus: 3505

---

**Last Updated:** 2025-10-20
**Most Recent Fixes:**
- SDK workspace resolution (pointed to source files)
- Database initialization (recreated with fresh volumes)
- Port migration (3500-3600 range)
