# x402 Facilitator - Fly.io Deployment Guide

Complete guide to deploying the x402 payment facilitator to fly.io.

---

## Prerequisites

### 1. Install Fly CLI

```bash
# macOS/Linux
brew install flyctl

# Or with curl
curl -L https://fly.io/install.sh | sh

# Verify installation
fly version
```

### 2. Create Fly.io Account

```bash
# Sign up and login
fly auth signup

# Or login if you have an account
fly auth login
```

### 3. Prepare Facilitator Wallet

```bash
# Generate a new Ed25519 keypair for the facilitator
sui keytool generate ed25519

# Output will show:
# - Private key (suiprivkey1...)  <- Save this securely!
# - Public key
# - Sui address  <- Fund this address with SUI

# Fund the address with testnet SUI
# 1. Copy the Sui address
# 2. Go to: https://discord.gg/sui
# 3. Use !faucet <address> in #testnet-faucet channel
# 4. Verify: sui client gas <address>

# For mainnet: Transfer 5-10 SUI to this address
```

---

## Deployment Steps

### Step 1: Navigate to Project Root

```bash
# IMPORTANT: Deploy from monorepo root, not from app directory
cd /Users/decebaldobrica/Projects/blockchain/tortoise-os/carapace
```

### Step 2: Create Fly.io App

```bash
# Create app (choose a unique name)
fly apps create x402-facilitator

# Or let fly.io generate a name
fly apps create

# Note: App name will be part of URL: https://x402-facilitator.fly.dev
```

### Step 3: Set Secrets

```bash
# Required: Facilitator private key
fly secrets set FACILITATOR_PRIVATE_KEY="suiprivkey1qz2mlze0nuphxtj0u79ftcx6qjru9zjc5p3p4rpur7wdp4ll8a3hvezn2w0"

# Required: Sui RPC URL
# For testnet:
fly secrets set SUI_RPC_URL="https://fullnode.testnet.sui.io:443"

# For mainnet:
# fly secrets set SUI_RPC_URL="https://fullnode.mainnet.sui.io:443"

# Required: CORS allowed origins
fly secrets set ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"

# Optional: Rate limiting
fly secrets set RATE_LIMIT_MAX="200"

# Optional: Minimum wallet balance alert threshold
fly secrets set MIN_WALLET_BALANCE="2.0"

# Verify secrets were set
fly secrets list
```

### Step 4: Deploy

```bash
# Deploy from monorepo root
cd /Users/decebaldobrica/Projects/blockchain/tortoise-os/carapace

# Deploy to fly.io
fly deploy --config apps/x402-facilitator/fly.toml

# Follow deployment progress
# Build time: ~2-3 minutes
# Deploy time: ~30 seconds
```

### Step 5: Verify Deployment

```bash
# Check app status
fly status

# View recent logs
fly logs

# Open the app in browser
fly open

# Test health endpoint
curl https://x402-facilitator.fly.dev/health

# Test metrics endpoint
curl https://x402-facilitator.fly.dev/metrics | head -20

# Test OpenAPI docs
open https://x402-facilitator.fly.dev/docs
```

---

## Post-Deployment Configuration

### Set Up Custom Domain (Optional)

```bash
# Add custom domain
fly certs add facilitator.yourdomain.com

# Get DNS instructions
fly certs show facilitator.yourdomain.com

# Add CNAME record in your DNS:
# facilitator.yourdomain.com -> x402-facilitator.fly.dev
```

### Scale Resources

```bash
# Check current scaling
fly scale show

# Scale to performance machine (for production)
fly scale vm performance-1x

# Increase memory
fly scale memory 512

# Add more instances (HA)
fly scale count 2

# Enable autoscaling
fly autoscale set min=1 max=3
```

### Configure Monitoring

```bash
# View metrics dashboard
fly dashboard

# Set up Grafana Cloud (free tier)
# See: OBSERVABILITY.md for full guide

# Add Sentry for error tracking (optional)
fly secrets set SENTRY_DSN="https://..."
```

---

## Environment-Specific Deployments

### Staging Environment

```bash
# Create staging app
fly apps create x402-facilitator-staging

# Set staging secrets
fly secrets set \
  FACILITATOR_PRIVATE_KEY="staging-key" \
  SUI_RPC_URL="https://fullnode.testnet.sui.io:443" \
  ALLOWED_ORIGINS="https://staging.yourdomain.com" \
  --app x402-facilitator-staging

# Deploy to staging
fly deploy --config apps/x402-facilitator/fly.toml --app x402-facilitator-staging
```

### Production Environment

```bash
# Create production app
fly apps create x402-facilitator-prod

# Set production secrets (use mainnet!)
fly secrets set \
  FACILITATOR_PRIVATE_KEY="prod-key" \
  SUI_RPC_URL="https://fullnode.mainnet.sui.io:443" \
  ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com" \
  --app x402-facilitator-prod

# Deploy to production
fly deploy --config apps/x402-facilitator/fly.toml --app x402-facilitator-prod
```

---

## Monitoring & Debugging

### View Logs

```bash
# Real-time logs
fly logs

# Follow logs
fly logs -a x402-facilitator

# Filter by instance
fly logs -i 148ed626c47e89

# Search logs
fly logs | grep "ERROR"

# Export logs (last 1000 lines)
fly logs --limit 1000 > logs.txt
```

### Check App Health

```bash
# App status
fly status

# VM list
fly vms list

# Check health checks
fly checks list

# SSH into machine
fly ssh console

# View resource usage
fly ssh console -C "top"
```

### Debugging Failed Deployments

```bash
# View deployment history
fly releases

# Rollback to previous version
fly releases rollback <version>

# Check build logs
fly logs --deployment

# Restart all instances
fly apps restart
```

---

## Secrets Management

### View Secrets

```bash
# List all secrets (values are hidden)
fly secrets list
```

### Update Secrets

```bash
# Update a secret (triggers redeploy)
fly secrets set FACILITATOR_PRIVATE_KEY="new-key"

# Update multiple secrets at once
fly secrets set \
  SECRET1="value1" \
  SECRET2="value2"

# Import from .env file (for staging)
fly secrets import < .env.staging
```

### Remove Secrets

```bash
# Remove a secret
fly secrets unset SECRET_NAME

# Remove multiple secrets
fly secrets unset SECRET1 SECRET2
```

---

## Wallet Management

### Check Facilitator Balance

```bash
# Get facilitator address from health endpoint
curl https://x402-facilitator.fly.dev/health | jq '.facilitator'

# Output:
# {
#   "address": "0xe91b754c809f16c3a88e7be33a56b348532c377fbea30ed92ea34371c68466b9",
#   "balanceSUI": 9.97
# }

# Check on Sui Explorer
# Testnet: https://testnet.suivision.xyz/account/<address>
# Mainnet: https://suivision.xyz/account/<address>
```

### Top Up Facilitator Wallet

```bash
# Testnet: Use Discord faucet
# Mainnet: Transfer SUI from treasury

# Verify transfer completed
curl https://x402-facilitator.fly.dev/health | jq '.facilitator.balanceSUI'
```

### Set Up Balance Alerts

```bash
# Using Better Uptime (free tier)
# 1. Sign up: https://betteruptime.com
# 2. Create Heartbeat monitor
# 3. Add webhook: https://x402-facilitator.fly.dev/health
# 4. Set alert condition: facilitator.balanceSUI < 1

# Or use Grafana Cloud (see OBSERVABILITY.md)
```

---

## Cost Optimization

### Free Tier (Hobby)

```bash
# Use shared-cpu-1x (default)
# Includes:
# - 3 shared-cpu-1x VMs (free)
# - 160GB outbound transfer (free)
# - Automatically included with signup
```

### Production Tier

```bash
# Recommended for production:
fly scale vm performance-1x  # $12.69/month
fly scale memory 2048        # Included

# With HA (2 instances):
fly scale count 2            # ~$25/month

# Add Redis for distributed rate limiting:
fly redis create             # $5/month
```

### Cost Breakdown

| Tier | vCPU | RAM | Cost/month | Use Case |
|------|------|-----|------------|----------|
| shared-cpu-1x | 1 shared | 256MB | Free* | Testing, low volume |
| performance-1x | 1 dedicated | 2GB | $12.69 | Production (< 50k tx/day) |
| performance-2x | 2 dedicated | 4GB | $25.38 | Production (> 50k tx/day) |

*Free tier includes 3 shared-cpu-1x VMs

---

## Troubleshooting

### Deployment Fails

```bash
# Check build logs
fly logs --deployment

# Common issues:
# 1. Workspace dependency error -> Build from monorepo root
# 2. Out of memory -> Increase VM size
# 3. Health check failing -> Check FACILITATOR_PRIVATE_KEY secret
```

### App Not Responding

```bash
# Check health
fly status
fly checks list

# Restart app
fly apps restart

# Check resource usage
fly ssh console -C "df -h && free -m"

# Scale up if needed
fly scale vm performance-1x
```

### High Error Rate

```bash
# Check logs for errors
fly logs | grep ERROR

# Common errors:
# 1. RPC timeout -> Check circuit breaker metrics
# 2. Low wallet balance -> Top up facilitator wallet
# 3. Invalid signature -> Check FACILITATOR_PRIVATE_KEY
```

### Health Check Failing

```bash
# SSH into machine
fly ssh console

# Check if app is running
curl localhost:3606/health

# Check environment variables
env | grep SUI

# Restart app
fly apps restart
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]
    paths:
      - 'apps/x402-facilitator/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Fly CLI
        uses: superfly/flyctl-actions/setup-flyctl@master
        
      - name: Deploy to Fly.io
        run: |
          cd /path/to/carapace
          flyctl deploy --config apps/x402-facilitator/fly.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Set `FLY_API_TOKEN` in GitHub Secrets:
```bash
# Get token
fly auth token

# Add to GitHub: Settings -> Secrets -> New repository secret
# Name: FLY_API_TOKEN
# Value: <paste token>
```

---

## Security Checklist

- [ ] Facilitator private key stored in fly.io secrets (not in code)
- [ ] ALLOWED_ORIGINS configured for production domains
- [ ] Rate limiting enabled (RATE_LIMIT_MAX set)
- [ ] Wallet balance monitoring/alerts set up
- [ ] HTTPS enforced (fly.toml: force_https = true)
- [ ] Health checks configured
- [ ] Non-root user in Docker (USER bun)
- [ ] Secrets rotation plan in place
- [ ] Monitoring dashboard configured
- [ ] Incident response plan documented

---

## Quick Reference

```bash
# Deploy
fly deploy --config apps/x402-facilitator/fly.toml

# Logs
fly logs

# Status
fly status

# Restart
fly apps restart

# Scale up
fly scale vm performance-1x

# Set secret
fly secrets set KEY=value

# Rollback
fly releases rollback

# SSH
fly ssh console
```

---

## Support

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/
- x402 Protocol: https://github.com/coinbase/x402
- Sui Docs: https://docs.sui.io/

