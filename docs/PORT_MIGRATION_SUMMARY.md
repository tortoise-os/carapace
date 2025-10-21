# Port Migration Summary

## Overview

All Carapace services have been migrated to the **3500-3600** port range for consistency and to avoid conflicts with commonly used ports.

**Date:** 2025-10-20
**Status:** ✅ Complete

---

## Port Changes

| Service | Old Port | New Port | Change |
|---------|----------|----------|---------|
| **API Server** | 3001 | **3500** | +499 |
| **Web App** | 3000 | **3501** | +501 |
| **PostgreSQL** | 5432 | **3502** | -1930 |
| **Redis** | 6379 | **3503** | -2876 |
| **Grafana** | 3030 | **3504** | +474 |
| **Prometheus** | 9090 | **3505** | -5585 |

---

## Files Updated

### Configuration Files ✅

1. **tooling/docker/docker-compose.yml**
   - PostgreSQL: `5432:5432` → `3502:5432`
   - Redis: `6379:6379` → `3503:6379`
   - Grafana: `3030:3000` → `3504:3000`
   - Prometheus: `9090:9090` → `3505:9090`

2. **.env.example** (root)
   - `APP_URL`, `NEXT_PUBLIC_APP_URL`: `3000` → `3501`
   - `NEXT_PUBLIC_API_URL`, `API_PORT`: `3001` → `3500`
   - `DATABASE_URL`, `DATABASE_PORT`: `5432` → `3502`
   - `REDIS_URL`, `REDIS_PORT`: `6379` → `3503`
   - `GRAFANA_URL`: `3030` → `3504`
   - `PROMETHEUS_URL`: `9090` → `3505`
   - `CORS_ORIGIN`: `3000` → `3501`
   - `E2E_BASE_URL`: `3000` → `3501`
   - `TEST_DATABASE_URL`: `5432` → `3502`

3. **packages/sdk/.env.example**
   - Created with testnet package ID ✅

4. **apps/api/.env.example**
   - `API_PORT`: `3001` → `3500`
   - `DATABASE_URL`: `5432` → `3502`
   - `REDIS_URL`: `6379` → `3503`
   - `CORS_ORIGIN`: `3000` → `3501`

5. **apps/web/.env.example**
   - `NEXT_PUBLIC_API_URL`: `3001` → `3500`

6. **apps/web/package.json**
   - `dev` script: `next dev` → `next dev -p 3501`
   - `start` script: `next start` → `next start -p 3501`

7. **apps/indexer/.env.example**
   - `DATABASE_URL`: `5432` → `3502`

8. **tooling/docker/prometheus/prometheus.yml**
   - API target: `3001` → `3500`

### Documentation Files ✅

Updated all port references in:

1. **README.md**
   - All localhost URLs updated

2. **QUICKSTART.md**
   - Service URLs table updated
   - All curl examples updated
   - Troubleshooting section updated

3. **TESTNET_DEPLOYMENT.md**
   - Configuration examples updated
   - Service URLs updated
   - Monitoring section updated

4. **DEPLOYMENT.md**
   - All deployment steps updated
   - API testing examples updated

5. **BUILD_SUMMARY.md**
   - Statistics section updated
   - Port references updated

6. **PORT_MAPPING.md** (NEW)
   - Comprehensive port reference guide
   - Quick reference card
   - Troubleshooting guide

7. **PORT_MIGRATION_SUMMARY.md** (THIS FILE)
   - Migration documentation

---

## Verification Checklist

### Pre-Migration ✅
- [x] Document current port assignments
- [x] Plan new port range (3500-3600)
- [x] Create port mapping documentation

### Configuration Updates ✅
- [x] Update Docker Compose port mappings
- [x] Update all .env.example files
- [x] Update package.json scripts
- [x] Update Prometheus configuration
- [x] Update root .env.example

### Documentation Updates ✅
- [x] Update README.md
- [x] Update QUICKSTART.md
- [x] Update TESTNET_DEPLOYMENT.md
- [x] Update DEPLOYMENT.md
- [x] Update BUILD_SUMMARY.md
- [x] Create PORT_MAPPING.md reference
- [x] Create migration summary (this file)

### Testing (To Be Done)
- [ ] Test Docker Compose startup
- [ ] Test API server on port 3500
- [ ] Test Web app on port 3501
- [ ] Test database connection on port 3502
- [ ] Test Redis connection on port 3503
- [ ] Test Grafana on port 3504
- [ ] Test Prometheus on port 3505
- [ ] Verify CORS settings
- [ ] Run full integration test

---

## Migration Impact

### Breaking Changes ⚠️

**All existing .env files must be updated:**

```bash
# Stop all services
task docker:down
cd apps/api && pkill -f "bun run dev"
cd apps/web && pkill -f "bun run dev"
cd apps/indexer && pkill -f "bun run dev"

# Update .env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/indexer/.env.example apps/indexer/.env

# Edit each .env file as needed

# Restart services
task docker:up
cd apps/api && bun run dev &
cd apps/indexer && bun run dev &
cd apps/web && bun run dev &
```

### Non-Breaking Changes ✅

- Docker Compose will automatically use new ports
- No code changes required (all port references are from env vars)
- Documentation updated to reflect new ports

---

## Rollback Procedure

If needed, rollback by reverting these files:

```bash
# Rollback to old ports
git checkout HEAD -- \
  tooling/docker/docker-compose.yml \
  .env.example \
  apps/api/.env.example \
  apps/web/.env.example \
  apps/web/package.json \
  apps/indexer/.env.example \
  tooling/docker/prometheus/prometheus.yml

# Update documentation
git checkout HEAD -- *.md

# Restart services
task docker:restart
```

---

## Benefits

1. **Consistency** - All ports in single range (3500-3600)
2. **Conflict Avoidance** - No conflicts with common services:
   - 3000: Common dev servers
   - 3001: Common API servers
   - 5432: PostgreSQL default
   - 6379: Redis default
   - 9090: Prometheus default
3. **Easy Management** - Simple firewall rules: allow 3500-3600
4. **Scalability** - 95 ports available for future services
5. **Documentation** - Clear PORT_MAPPING.md reference

---

## Testing Instructions

After migration, verify all services:

```bash
# 1. Start infrastructure
task docker:up

# 2. Verify Docker services
docker ps
# Should show all containers on new ports

# 3. Test API
curl http://localhost:3500/health
# Expected: {"status":"ok",...}

# 4. Test database
psql postgresql://carapace:carapace_dev_password@localhost:3502/carapace -c "SELECT 1"
# Expected: 1 row

# 5. Test Redis
redis-cli -p 3503 ping
# Expected: PONG

# 6. Test Grafana
curl -I http://localhost:3504
# Expected: HTTP 200

# 7. Test Prometheus
curl http://localhost:3505/-/healthy
# Expected: Prometheus is Healthy

# 8. Test web app
curl -I http://localhost:3501
# Expected: HTTP 200 (after starting Next.js)

# 9. Check port availability
for port in 3500 3501 3502 3503 3504 3505; do
  echo -n "Port $port: "
  lsof -i :$port >/dev/null 2>&1 && echo "✅ IN USE" || echo "❌ Not in use"
done
```

---

## Next Steps

1. **Test the migration** - Run the testing instructions above
2. **Update existing deployments** - If you have running instances, update their .env files
3. **Communicate changes** - Inform team members of new port assignments
4. **Monitor** - Watch for any port-related issues in first 24h
5. **Document** - Add any migration notes or issues encountered

---

## Support

If you encounter issues:

1. **Check PORT_MAPPING.md** for reference
2. **Verify .env files** are updated
3. **Check for port conflicts** using `lsof -i :PORT`
4. **Review logs** for port binding errors
5. **Rollback if needed** using procedure above

---

**Migration Status:** ✅ **COMPLETE**

All configuration and documentation files have been updated to use the new port range (3500-3600).

**Next:** Test the changes by starting all services and verifying each port.
