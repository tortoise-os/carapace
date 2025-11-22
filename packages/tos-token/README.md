# TOS Token - Tortoise OS Ecosystem Token

🐢 **Slow and Steady Builds the Future**

The official utility token for the Tortoise OS / Carapace ecosystem on Sui Network.

---

## Token Details

- **Name**: Tortoise OS Token
- **Symbol**: TOS
- **Decimals**: 9
- **Total Supply**: 1,000,000,000 TOS (1 billion)
- **Blockchain**: Sui Network
- **Standard**: Sui Coin Standard

---

## Quick Links

- **Contract**: [Sui Explorer Link]
- **Website**: https://tortoise-os.io
- **Docs**: https://docs.tortoise-os.io/token
- **Twitter**: [@TortoiseOS](https://twitter.com/TortoiseOS)
- **Discord**: [Join Discord]

---

## Utility

### 1. Gas Fee Payments
- Pay for transactions on Tortoise OS apps
- 20% discount when using TOS vs SUI
- Example: x402 payment facilitator

### 2. Governance
- Vote on protocol upgrades
- Propose new features
- Adjust fee parameters

### 3. Staking
- Stake TOS to earn 7-17% APY
- Rewards paid in TOS or SUI
- Loyalty bonuses for long-term stakers

### 4. Access & Rewards
- Premium features for TOS holders
- Early access to new dApps
- Community rewards program

---

## Tokenomics

### Distribution

```
Ecosystem Development:  30% (300M TOS) - 3yr vesting
Community Rewards:      25% (250M TOS) - milestone-based
Team & Advisors:        15% (150M TOS) - 4yr vesting, 1yr cliff
Liquidity Pool:         15% (150M TOS) - unlocked
Treasury:               10% (100M TOS) - 2yr lock
Public Sale/Airdrop:     5% ( 50M TOS) - unlocked
```

### Deflationary Model

- Quarterly token burns from ecosystem revenue
- Target: 10% annual supply reduction
- Floor: Minimum 500M total supply

---

## Deployment

### Testnet Deployment ✅

**Status**: Deployed
**Date**: November 21, 2025
**Transaction**: `7ffQQiLj433igN486ozUrxaXWfwVB7wt2u1inBXt2pFt`

#### Contract Addresses

```
Package ID:     0x3ccba4fb5de5fccf31aa6c5fe27723f2467d0fbe3e47e65e91290ddf3adfae1e
Coin Type:      0x3ccba4fb5de5fccf31aa6c5fe27723f2467d0fbe3e47e65e91290ddf3adfae1e::token::TOKEN
TreasuryCap:    0x86864a25a3f3ab86dddf8985e78f11f9ca32d627aea589bf23c004c0e6baccf1
CoinMetadata:   0x4181e05e1813e3b21782a4489cdd960e26f6915102435e73335108a232980ff5
UpgradeCap:     0xbda186d5be7f8b92e27420bdbb0e8298a9b995fb33c73f22c9842bf43d358129
```

#### Explorer Links

- **Package**: https://testnet.suivision.xyz/package/0x3ccba4fb5de5fccf31aa6c5fe27723f2467d0fbe3e47e65e91290ddf3adfae1e
- **Deployment Tx**: https://testnet.suivision.xyz/txblock/7ffQQiLj433igN486ozUrxaXWfwVB7wt2u1inBXt2pFt

#### Configuration Files

Environment config: `.env.testnet`
TypeScript config: `config/testnet.ts`

```typescript
import { TOS_TOKEN_CONFIG } from '@carapace/tos-token/config/testnet';

// Use in your app
const packageId = TOS_TOKEN_CONFIG.packageId;
const coinType = TOS_TOKEN_CONFIG.coinType;
```

### Prerequisites

```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Verify installation
sui --version
```

### Build

```bash
cd packages/tos-token
sui move build
```

### Test

```bash
sui move test
```

### Deploy to Mainnet

```bash
# Switch to mainnet
sui client switch --env mainnet

# Publish with dependency verification
sui client publish --gas-budget 100000000 --verify-deps
```

---

## Token Distribution Process

After deployment, you'll receive:
1. **TreasuryCap** - For burning tokens (keep secure!)
2. **1B TOS Coin** - Total supply to distribute

### Recommended Distribution Steps

```bash
# 1. Create distribution wallet addresses
sui client new-address ed25519 ecosystem
sui client new-address ed25519 community
sui client new-address ed25519 team
sui client new-address ed25519 liquidity
sui client new-address ed25519 treasury
sui client new-address ed25519 public

# 2. Split the total supply
sui client split-coin \
  --coin-id <TOTAL_SUPPLY_COIN_ID> \
  --amounts 300000000000000000,250000000000000000,150000000000000000,150000000000000000,100000000000000000,50000000000000000 \
  --gas-budget 10000000

# 3. Transfer to respective wallets
sui client transfer \
  --to <ECOSYSTEM_ADDRESS> \
  --object-id <COIN_1_ID> \
  --gas-budget 10000000

# Repeat for all allocations...
```

---

## Integration with x402 Facilitator

Update facilitator to accept TOS:

```typescript
// In config.ts
export const config = {
  // ... existing config
  
  // Accepted payment tokens
  paymentTokens: [
    {
      type: "0x2::sui::SUI",
      symbol: "SUI",
      decimals: 9,
      discount: 0, // No discount for SUI
    },
    {
      type: "<TOS_PACKAGE_ID>::token::TOS",
      symbol: "TOS",
      decimals: 9,
      discount: 20, // 20% discount for TOS
    },
  ],
}
```

---

## Security

### Multi-Sig Treasury (Recommended)

```bash
# Create 3/5 multisig for treasury management
sui client multi-sig create \
  --threshold 3 \
  --pks <PK1>,<PK2>,<PK3>,<PK4>,<PK5>

# Transfer TreasuryCap to multisig
sui client transfer \
  --to <MULTISIG_ADDRESS> \
  --object-id <TREASURY_CAP_ID> \
  --gas-budget 10000000
```

### Audit

- Contract audited by: [Audit Firm]
- Audit report: [Link to report]
- Last audit date: [Date]

---

## Community

- **Holders**: Track on [Sui Explorer]
- **Staking**: [Staking Dashboard Link]
- **Governance**: [Governance Portal Link]
- **Support**: Discord #tos-support

---

## Legal

TOS is a utility token designed for use within the Tortoise OS ecosystem. It is not an investment contract or security. Please consult with legal and tax professionals in your jurisdiction before purchasing.

---

## License

MIT License - See LICENSE file for details

---

## Contact

- Email: team@tortoise-os.io
- Twitter: @TortoiseOS
- Discord: [Invite Link]

🐢 **Slow and Steady Builds the Future**
