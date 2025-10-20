# Port Mapping Reference

All Carapace services use ports in the **3500-3600** range for consistency and to avoid conflicts.

---

## Port Assignments

| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| **API Server** | `3500` | HTTP | Express REST API backend |
| **Web App** | `3501` | HTTP | Next.js frontend application |
| **PostgreSQL** | `3502` | TCP | Database (mapped from 5432) |
| **Redis** | `3503` | TCP | Cache & sessions (mapped from 6379) |
| **Grafana** | `3504` | HTTP | Metrics & monitoring dashboard |
| **Prometheus** | `3505` | HTTP | Metrics collection & scraping |

---

## Service URLs

### Development (Local)

```bash
# User-facing services
Web Application:    http://localhost:3501
API Server:         http://localhost:3500
API Health Check:   http://localhost:3500/health

# Monitoring
Grafana Dashboard:  http://localhost:3504
Prometheus Metrics: http://localhost:3505

# Internal services (CLI access)
PostgreSQL:         localhost:3502
Redis:              localhost:3503
```

---

## Environment Variables

### API Server (`apps/api/.env`)
```env
API_PORT=3500
API_HOST=0.0.0.0
```

### Web App (`apps/web/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3500
PORT=3501
```

### Database Connection (`apps/api/.env`, `apps/indexer/.env`)
```env
DATABASE_URL=postgresql://carapace:carapace_dev_password@localhost:3502/carapace
```

### Redis Connection (`apps/api/.env`)
```env
REDIS_URL=redis://localhost:3503
```

---

## Docker Port Mappings

In `tooling/docker/docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "3502:5432"  # External:Internal

  redis:
    ports:
      - "3503:6379"  # External:Internal

  grafana:
    ports:
      - "3504:3000"  # External:Internal

  prometheus:
    ports:
      - "3505:9090"  # External:Internal
```

---

## CORS Configuration

API CORS settings should allow the web app origin:

```env
# apps/api/.env
CORS_ORIGIN=http://localhost:3501
```

For production, update to your production web app URL.

---

## Firewall Rules (Production)

When deploying to production, ensure these ports are accessible:

**Public (Internet-facing):**
- `3501` - Web application (or behind reverse proxy)
- `3500` - API server (or behind reverse proxy)

**Internal (VPC/Private network only):**
- `3502` - PostgreSQL
- `3503` - Redis
- `3504` - Grafana (optional: expose for monitoring)
- `3505` - Prometheus (optional: expose for monitoring)

---

## Checking Port Availability

Before starting services, verify ports are available:

```bash
# Check if ports are in use
lsof -i :3500  # API
lsof -i :3501  # Web
lsof -i :3502  # PostgreSQL
lsof -i :3503  # Redis
lsof -i :3504  # Grafana
lsof -i :3505  # Prometheus

# Or check all at once
for port in 3500 3501 3502 3503 3504 3505; do
  echo -n "Port $port: "
  lsof -i :$port >/dev/null 2>&1 && echo "IN USE" || echo "Available"
done
```

---

## Troubleshooting Port Conflicts

If you encounter "port already in use" errors:

### Find what's using the port
```bash
# macOS/Linux
lsof -i :3500

# Get PID
lsof -ti :3500
```

### Kill the process (if safe)
```bash
# macOS/Linux
kill -9 $(lsof -ti :3500)

# Or use task command
task docker:down  # Stops all Docker services
```

### Change ports (if needed)
Edit the relevant `.env` file and restart the service.

---

## Historical Note

**Previous Port Assignments (Before 2025-10-20):**
- API: 3001 → **Changed to 3500**
- Web: 3000 → **Changed to 3501**
- PostgreSQL: 5432 → **Changed to 3502**
- Redis: 6379 → **Changed to 3503**
- Grafana: 3030 → **Changed to 3504**
- Prometheus: 9090 → **Changed to 3505**

**Reason for change:** Standardize all ports to 3500-3600 range for easier management and to avoid conflicts with commonly used ports.

---

## Adding New Services

When adding new services to the project, assign ports from the **3506-3600** range:

**Available ports:** 3506-3600 (95 ports available)

**Next suggested assignments:**
- 3506 - (Available)
- 3507 - (Available)
- 3508 - (Available)
- ...
- 3600 - (Available)

---

## Production Considerations

### Reverse Proxy (Recommended)

In production, use a reverse proxy (Nginx, Caddy, Traefik) on standard ports:

```nginx
# Nginx example
server {
    listen 80;
    listen 443 ssl;
    server_name app.carapace.finance;

    location / {
        proxy_pass http://localhost:3501;  # Web app
    }

    location /api/ {
        proxy_pass http://localhost:3500;  # API server
    }
}
```

### Load Balancer

For high availability, run multiple instances on different ports:

```yaml
# Example: Multiple API instances
API Instance 1: 3500
API Instance 2: 3510
API Instance 3: 3520
Load Balancer: 80/443 → [3500, 3510, 3520]
```

---

## Quick Reference Card

```
┌─────────────────────────────────────┐
│     CARAPACE PORT REFERENCE         │
├─────────────────────────────────────┤
│ Service          Port   Type        │
├─────────────────────────────────────┤
│ API Server       3500   HTTP        │
│ Web App          3501   HTTP        │
│ PostgreSQL       3502   TCP         │
│ Redis            3503   TCP         │
│ Grafana          3504   HTTP        │
│ Prometheus       3505   HTTP        │
├─────────────────────────────────────┤
│ Range: 3500-3600 (6/101 used)       │
└─────────────────────────────────────┘
```

---

**Last Updated:** 2025-10-20
**Port Range:** 3500-3600
**Ports Used:** 6/101
**Ports Available:** 3506-3600
