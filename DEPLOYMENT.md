# Carapace Deployment Information

## Testnet Deployment - 2025-10-25

### Package Information

**Package ID:** `0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379`

**Transaction Digest:** `HuwjzS38BanNgyzYB4xZCEapDZNYRrPzvCA5g4CgBDLF`

**Network:** Sui Testnet

**Deployer Address:** `0xe91b754c809f16c3a88e7be33a56b348532c377fbea30ed92ea34371c68466b9`

**Upgrade Cap:** `0xeeb14db7007397e0bb9387a840243181bcd5e8740d8f9dd64abc054f567cdd35`

### Deployed Modules

1. **carapace::math** - Math utilities (sqrt, mul_div, fee calculations)
2. **carapace::pool** - AMM pool with constant product formula
3. **carapace::vault** - Vault contract (Phase 2 placeholder)

### Gas Costs

- **Storage Cost:** 64.43 SUI
- **Computation Cost:** 0.001 SUI
- **Total Cost:** ~64.45 SUI

### Verification

**Sui Explorer:**
- Package: https://testnet.suivision.xyz/package/0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379
- Transaction: https://testnet.suivision.xyz/txblock/HuwjzS38BanNgyzYB4xZCEapDZNYRrPzvCA5g4CgBDLF

**SuiScan:**
- Package: https://testnet.suiscan.xyz/object/0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379
- Transaction: https://testnet.suiscan.xyz/tx/HuwjzS38BanNgyzYB4xZCEapDZNYRrPzvCA5g4CgBDLF

### Testing the Deployment

#### Check Package Info
```bash
sui client object 0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379
```

#### Call Pool Functions

**Create a Pool:**
```bash
export PACKAGE_ID=0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379
export TOKEN_X=0x2::sui::SUI
export TOKEN_Y=<YOUR_TOKEN_TYPE>

task pool:create
```

**Get Pool Information:**
```bash
export POOL_ID=<YOUR_POOL_ID>
task pool:info
```

### SDK Integration

Update your `.env` files with the new package ID:

```bash
# Web App
NEXT_PUBLIC_AMM_PACKAGE_ID=0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379

# API
SUI_AMM_PACKAGE_ID=0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379

# Indexer
SUI_AMM_PACKAGE_ID=0x2ee58b5e4761a0d24606aca37f252529946fe5825c05c66a40aba855894fd379
```

### Next Steps

1. ✅ Deploy to testnet - **COMPLETE**
2. ✅ Update environment variables - **COMPLETE**
3. 🔄 Create test pools with real tokens
4. 🔄 Test swap functionality via SDK
5. 🔄 Integrate price oracles
6. 🔄 Connect frontend to execute real transactions
7. 📋 Mainnet deployment (after testing & audit)

### Previous Deployment

**Old Package ID:** `0xfb9aa64f05eec5e108bf48666f400381861b7fd9e4aa59664f9134a436cfd73d`

This deployment supersedes the previous version with:
- Enhanced deployment scripts (Taskfile.yml)
- Full test coverage (27/27 tests passing)
- Updated documentation

### Contract Features

#### Pool Module (`carapace::pool`)
- ✅ Constant product AMM (x * y = k)
- ✅ Add/Remove liquidity with LP tokens
- ✅ Swap X ↔ Y with fees
- ✅ Flash swaps (hot potato pattern)
- ✅ Emergency pause mechanism
- ✅ Protocol fee collection
- ✅ Slippage protection

#### Math Module (`carapace::math`)
- ✅ Square root (Babylonian method)
- ✅ Mul/Div with u128 overflow protection
- ✅ Basis points fee calculation
- ✅ Min/Max utilities

#### Vault Module (`carapace::vault`)
- ⚠️ Basic framework (Phase 2)
- ✅ Deposit/Withdraw with shares
- ⚠️ Strategy system (not yet implemented)

### Support

- GitHub: https://github.com/yourusername/carapace
- Discord: [Coming Soon]
- Twitter: [Coming Soon]

---

**Last Updated:** 2025-10-25
**Status:** ✅ DEPLOYED TO TESTNET
