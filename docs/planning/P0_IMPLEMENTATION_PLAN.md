---
title: P0 Implementation Plan - Blocking MVP Tasks
created: 2025-10-22
updated: 2025-10-22
status: active
category: planning
---

# P0 Implementation Plan - Blocking MVP Tasks

> These are the critical tasks that block MVP functionality. Complete in order for maximum impact.

**Status**: In Progress
**Priority**: P0 (Highest)
**Goal**: Make Carapace functionally complete for basic demos

---

## Overview

From FUNCTIONAL_STATUS.md, these are the P0 gaps blocking MVP:
1. Token balances showing "0.00" (not fetched)
2. Price oracles: No USD values (shows "$0.00")
3. Emergency pause mechanism missing
4. Comprehensive Move tests missing
5. Flash swap support missing
6. Transaction history missing

---

## Task 1: Implement Real Token Balances

**Status**: 🔄 Next Up
**Impact**: HIGH - User-facing, makes app immediately more useful
**Complexity**: LOW

### What's Missing
- UI shows "Balance: 0.00" for all tokens
- Not fetching user's actual coin balances from blockchain
- No balance updates after transactions

### Implementation Steps

1. **Add balance fetching to SDK** (`packages/sdk/src/`)
   ```typescript
   // Add to sdk/src/balance-client.ts
   async getUserTokenBalance(
     owner: string,
     coinType: string
   ): Promise<bigint>

   async getAllUserBalances(owner: string): Promise<Map<string, bigint>>
   ```

2. **Create React hook for balances** (`apps/web/lib/hooks/`)
   ```typescript
   // apps/web/lib/hooks/use-token-balance.ts
   export function useTokenBalance(tokenAddress: string)
   export function useAllBalances()
   ```

3. **Update swap interface** (`apps/web/components/swap/enhanced-swap-interface.tsx`)
   - Replace hardcoded "0.00" with real balance
   - Show loading state while fetching
   - Auto-refresh after transactions
   - Add "MAX" button to use full balance

4. **Add balance caching**
   - Cache in React Query or similar
   - Refresh on wallet connection
   - Refresh after transactions
   - Background polling (30s interval)

### Files to Modify
- `packages/sdk/src/balance-client.ts` (create)
- `packages/sdk/src/index.ts` (export balance client)
- `apps/web/lib/hooks/use-token-balance.ts` (create)
- `apps/web/components/swap/enhanced-swap-interface.tsx` (update)

### Testing
- [ ] Balance displays correctly for SUI
- [ ] Balance updates after swap
- [ ] Balance updates after add liquidity
- [ ] Loading state works
- [ ] Error handling for failed fetches
- [ ] MAX button fills correct amount

---

## Task 2: Integrate Pyth Price Oracle

**Status**: ⏳ Pending
**Impact**: HIGH - User-facing, shows real USD values
**Complexity**: MEDIUM

### What's Missing
- All USD prices show "$0.00"
- No price feed integration
- No oracle contract calls

### Implementation Steps

1. **Research Pyth on Sui**
   - Review Pyth Sui documentation
   - Check available price feeds (SUI/USD, etc.)
   - Study integration pattern from Navi Protocol

2. **Add Pyth SDK dependency**
   ```bash
   bun add @pythnetwork/pyth-sui-js
   ```

3. **Create price oracle client** (`packages/sdk/src/oracle-client.ts`)
   ```typescript
   class OracleClient {
     async getPrice(symbol: string): Promise<number>
     async getPrices(symbols: string[]): Promise<Map<string, number>>
     subscribeToPrice(symbol: string, callback: (price: number) => void)
   }
   ```

4. **Update UI with real prices**
   - Token selector modal
   - Swap interface (token input USD values)
   - Pool analytics (TVL in USD)
   - Portfolio values

5. **Add price caching**
   - Cache prices for 1 minute
   - WebSocket subscription for real-time updates (optional)
   - Fallback to on-chain TWAP if Pyth unavailable

### Files to Create/Modify
- `packages/sdk/src/oracle-client.ts` (create)
- `packages/sdk/src/index.ts` (export oracle client)
- `apps/web/lib/hooks/use-token-price.ts` (create)
- `apps/web/components/swap/enhanced-swap-interface.tsx` (update USD display)
- `apps/web/components/swap/token-selector-modal.tsx` (update)

### Testing
- [ ] SUI/USD price displays correctly
- [ ] Prices update periodically
- [ ] USD values calculate correctly in swap interface
- [ ] Graceful fallback if oracle unavailable
- [ ] Price staleness detection

---

## Task 3: Add Emergency Pause Mechanism

**Status**: ⏳ Pending
**Impact**: CRITICAL - Security requirement
**Complexity**: MEDIUM

### What's Missing
- No way to pause pool operations in emergency
- No admin capability system
- No pause state in contract

### Implementation Steps

1. **Study pause patterns**
   - Review Navi Protocol pause implementation
   - Review Cetus emergency mechanisms
   - Decide on pause scope (per-pool vs global)

2. **Add pause capability to pool.move**
   ```move
   // Add to pool.move
   public struct AdminCap has key, store { id: UID }

   public struct PauseState has store {
       is_paused: bool,
       paused_at: u64,
       paused_by: address,
   }

   public fun pause(
       _: &AdminCap,
       pool: &mut Pool<X, Y>,
       ctx: &mut TxContext
   )

   public fun unpause(
       _: &AdminCap,
       pool: &mut Pool<X, Y>,
       ctx: &mut TxContext
   )

   // Add pause checks to all state-changing functions
   fun assert_not_paused(pool: &Pool<X, Y>)
   ```

3. **Update all pool functions**
   - Add `assert_not_paused()` to:
     - `add_liquidity()`
     - `remove_liquidity()`
     - `swap_x_to_y()`
     - `swap_y_to_x()`
   - Allow admin functions even when paused

4. **Deploy AdminCap**
   - Create admin capability on pool creation
   - Transfer to secure multi-sig address
   - Document pause procedures

5. **Add frontend pause indicator**
   - Show "PAUSED" badge on pools
   - Disable swap/liquidity buttons
   - Display pause reason if available

### Files to Modify
- `move/sources/amm/pool.move` (major update)
- `packages/sdk/src/pool-client.ts` (add pause state query)
- `apps/web/components/swap/enhanced-swap-interface.tsx` (pause UI)

### Testing
- [ ] Pause prevents swaps
- [ ] Pause prevents liquidity add/remove
- [ ] Unpause re-enables operations
- [ ] Only AdminCap holder can pause
- [ ] Pause state persists across transactions
- [ ] Frontend shows pause state correctly

---

## Task 4: Write Comprehensive Move Unit Tests

**Status**: ⏳ Pending
**Impact**: CRITICAL - Security/quality requirement
**Complexity**: MEDIUM-HIGH

### What's Missing
- pool_tests.move has minimal tests
- No edge case testing
- No integration tests
- No gas benchmarks

### Implementation Steps

1. **Expand pool_tests.move**
   ```move
   // Add to move/sources/amm/pool_tests.move

   #[test]
   fun test_create_pool()

   #[test]
   fun test_add_initial_liquidity()

   #[test]
   fun test_add_liquidity_proportional()

   #[test]
   fun test_remove_liquidity_full()

   #[test]
   fun test_remove_liquidity_partial()

   #[test]
   fun test_swap_x_to_y_basic()

   #[test]
   fun test_swap_y_to_x_basic()

   #[test]
   fun test_swap_large_amount()

   #[test]
   #[expected_failure(abort_code = ESlippageExceeded)]
   fun test_swap_slippage_protection()

   #[test]
   #[expected_failure(abort_code = EZeroAmount)]
   fun test_add_liquidity_zero_amount()

   #[test]
   #[expected_failure(abort_code = EInsufficientLiquidity)]
   fun test_remove_more_than_balance()

   #[test]
   fun test_protocol_fee_collection()

   #[test]
   fun test_constant_product_maintained()

   #[test]
   fun test_multiple_users_liquidity()
   ```

2. **Test edge cases**
   - Dust amounts (1-10 units)
   - Maximum uint64 amounts
   - Minimum liquidity locking
   - Price impact calculations
   - Rounding errors

3. **Add invariant checks**
   ```move
   fun check_invariant_k(pool: &Pool<X, Y>) {
       // k should never decrease (except for fees)
       // x * y >= k_last
   }

   fun check_lp_supply_matches_reserves(pool: &Pool<X, Y>) {
       // LP supply should correctly represent reserves
   }
   ```

4. **Run test suite**
   ```bash
   sui move test
   sui move test --gas-limit 1000000000
   ```

### Files to Modify
- `move/sources/amm/pool_tests.move` (major expansion)
- `move/sources/common/math_tests.move` (create for math utilities)

### Testing Checklist
- [ ] All basic operations tested
- [ ] Edge cases covered (zero, max, dust)
- [ ] Failure cases tested with expected_failure
- [ ] Protocol fee logic tested
- [ ] Constant product invariant tested
- [ ] Multi-user scenarios tested
- [ ] Gas consumption measured
- [ ] 100% test coverage goal

---

## Task 5: Implement Flash Swap Support

**Status**: ⏳ Pending
**Impact**: MEDIUM - Competitive feature
**Complexity**: HIGH

### What's Missing
- No flash swap/loan functionality
- Can't borrow tokens temporarily
- Missing arbitrage capabilities

### Implementation Steps

1. **Study flash swap patterns**
   - Review Cetus flash swap implementation
   - Understand hot potato pattern in Move
   - Study flash loan security considerations

2. **Design flash swap API**
   ```move
   // Hot potato pattern for flash loans
   public struct FlashLoan<phantom X> {
       amount: u64,
       fee: u64,
   }

   public fun flash_borrow_x<X, Y>(
       pool: &mut Pool<X, Y>,
       amount: u64,
       ctx: &mut TxContext
   ): (Coin<X>, FlashLoan<X>)

   public fun flash_repay_x<X, Y>(
       pool: &mut Pool<X, Y>,
       coin: Coin<X>,
       loan: FlashLoan<X>
   )
   ```

3. **Implement flash swap**
   - Borrow tokens
   - Execute user logic (via callback or PTB)
   - Repay with fee
   - Use hot potato pattern (FlashLoan must be consumed)

4. **Add flash swap fee**
   - Separate flash fee (e.g., 0.05%)
   - Add to pool reserves as protocol fee
   - Track flash swap volume

5. **SDK integration**
   ```typescript
   // SDK method for flash swap PTB
   sdk.pool.buildFlashSwapPTB(
     poolId,
     amount,
     userLogicBuilder: (borrowedCoin) => TransactionBlock
   )
   ```

### Files to Create/Modify
- `move/sources/amm/pool.move` (add flash swap functions)
- `move/sources/amm/pool_tests.move` (add flash swap tests)
- `packages/sdk/src/pool-client.ts` (add flash swap builders)

### Testing
- [ ] Flash borrow succeeds
- [ ] Flash repay with fee succeeds
- [ ] Failure to repay aborts transaction
- [ ] Fee collected correctly
- [ ] Hot potato prevents abuse
- [ ] PTB integration works
- [ ] Arbitrage scenario tested

---

## Task 6: Add Transaction History Tracking

**Status**: ⏳ Pending
**Impact**: MEDIUM - User experience
**Complexity**: MEDIUM

### What's Missing
- No transaction history page
- No swap/liquidity history
- No earnings tracking

### Implementation Steps

1. **Design history schema**
   ```typescript
   interface TransactionHistory {
     digest: string
     type: 'swap' | 'add_liquidity' | 'remove_liquidity'
     timestamp: number
     user: string
     tokenIn?: { symbol: string, amount: bigint, usd: number }
     tokenOut?: { symbol: string, amount: bigint, usd: number }
     fee?: bigint
     status: 'success' | 'failed'
   }
   ```

2. **Index transactions**
   - Option A: Query Sui RPC for user transactions
   - Option B: Listen to pool events
   - Option C: Use Sui indexer service
   - Store in PostgreSQL or cache

3. **Create history API endpoints**
   ```typescript
   // API endpoints
   GET /api/transactions/:address
   GET /api/transactions/:address/swaps
   GET /api/transactions/:address/liquidity
   ```

4. **Build history UI**
   - Transaction history page
   - Recent transactions widget
   - Transaction details modal
   - Export to CSV
   - Filter by type, date, token

5. **Real-time updates**
   - Subscribe to new transactions
   - Toast notification for completed tx
   - Update history without refresh

### Files to Create/Modify
- `apps/api/src/services/transaction-indexer.ts` (create)
- `apps/api/src/routes/transactions.ts` (create)
- `apps/web/app/(dashboard)/history/page.tsx` (create)
- `apps/web/components/history/transaction-list.tsx` (create)
- `apps/web/lib/hooks/use-transaction-history.ts` (create)

### Testing
- [ ] History fetches correctly
- [ ] All transaction types displayed
- [ ] Real-time updates work
- [ ] Pagination works
- [ ] Filters work correctly
- [ ] Export to CSV works

---

## Execution Order

Execute in this order for maximum impact:

### Week 1 Focus
1. **Task 1: Token Balances** (Days 1-2)
   - Highest user-facing impact
   - Makes app immediately more useful
   - Low complexity

2. **Task 2: Price Oracle** (Days 3-5)
   - High user-facing impact
   - Completes the UX with USD values
   - Medium complexity

### Week 2 Focus
3. **Task 3: Emergency Pause** (Days 1-3)
   - Critical security requirement
   - Required before any mainnet consideration
   - Medium complexity

4. **Task 4: Move Tests** (Days 4-5)
   - Critical quality requirement
   - Can run in parallel with other tasks
   - Medium-high complexity

### Week 3 Focus
5. **Task 5: Flash Swaps** (Days 1-3)
   - Competitive differentiator
   - Advanced feature
   - High complexity

6. **Task 6: Transaction History** (Days 4-5)
   - Nice-to-have UX improvement
   - Can iterate on later
   - Medium complexity

---

## Success Criteria

### Completion Checklist
- [ ] All 6 P0 tasks complete
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Ready for P1 phase

### MVP Readiness
After P0 completion, the app should:
- ✅ Show real token balances
- ✅ Display accurate USD prices
- ✅ Have emergency pause capability
- ✅ Have comprehensive test coverage
- ✅ Support flash swaps
- ✅ Track transaction history

---

## Next Phase

After P0, move to **P1 (Testnet-ready)**:
- Fixed-point math library
- Pool creation UI
- Audit preparation
- Formal invariant checks
- Contract-level slippage protection

---

## Notes

- **Parallel work**: Tests (Task 4) can run parallel with other tasks
- **Dependencies**: Task 1 & 2 are independent, can run parallel
- **Blockers**: Task 3 (pause) should complete before mainnet consideration
- **Nice-to-have**: Task 6 (history) can be deferred if time-constrained

---

**Plan Version**: 1.0
**Last Updated**: 2025-10-22
**Status**: Active - Ready to Execute
