# TDD Checklist for Carapace Development

## MANDATORY: Read Before ANY Feature Work

This checklist MUST be followed for every feature, refactoring, or bug fix. No exceptions.

---

## Definition of Ready (DoR)

Before starting ANY task, verify:

- [ ] Task has clear acceptance criteria
- [ ] Task is testable (unit, integration, or E2E)
- [ ] Dependencies are identified
- [ ] You understand the ENTIRE scope of changes needed

**If ANY checkbox is unchecked, STOP and clarify with the user.**

---

## TDD Workflow (RED-GREEN-REFACTOR)

### Phase 1: RED - Write Failing Tests First

**BEFORE writing ANY implementation code:**

1. [ ] **Identify test types needed:**
   - [ ] Unit tests (business logic, utility functions)
   - [ ] Integration tests (SDK functions, API endpoints)
   - [ ] E2E tests (user flows in web app)
   - [ ] Move tests (smart contract logic)

2. [ ] **Write tests that FAIL:**
   ```typescript
   // Example: SDK test FIRST
   describe('Pool SDK', () => {
     it('calculates swap output correctly', () => {
       const pool = new Pool(poolData);
       const output = pool.calculateSwapOutput(1000n, true);
       expect(output).toBe(990n); // Will FAIL until implemented
     });
   });
   ```

3. [ ] **Run tests to verify they FAIL:**
   ```bash
   bun test  # Should FAIL - that's good!
   ```

### Phase 2: GREEN - Make Tests Pass

4. [ ] **Write MINIMAL code to pass tests:**
   - Implement only what's needed to make tests pass
   - No extra features or "nice to haves"

5. [ ] **Run tests again:**
   ```bash
   bun test  # Should PASS now
   ```

6. [ ] **Verify build still works:**
   ```bash
   turbo run build
   ```

### Phase 3: REFACTOR - Clean Up

7. [ ] **Improve code quality:**
   - Remove duplication
   - Improve naming
   - Add TypeScript types
   - Optimize performance

8. [ ] **Run tests AGAIN:**
   ```bash
   bun test  # Should still PASS
   ```

---

## Regression Prevention Checklist

### For Smart Contract Changes (Move):

- [ ] **Write Move tests:**
  ```move
  #[test]
  fun test_swap_calculation() {
      // Test setup
      let pool = create_test_pool();

      // Execute swap
      let output = calculate_swap_output(&pool, 1000, true);

      // Verify result
      assert!(output == 990, 0);
  }
  ```

- [ ] Run all Move tests: `sui move test`
- [ ] Test edge cases (zero amounts, overflow, underflow)
- [ ] Test error conditions

### For SDK Changes:

- [ ] **Write TypeScript unit tests:**
  ```typescript
  import { describe, it, expect } from 'bun:test';
  import { Pool } from '@carapace/sdk';

  describe('Pool SDK', () => {
    it('builds swap transaction correctly', () => {
      const sdk = new Pool(params);
      const tx = sdk.buildSwapTransaction({
        poolId: '0x123',
        amountIn: 1000n,
        minAmountOut: 990n,
        isTokenX: true
      });
      expect(tx).toBeDefined();
    });
  });
  ```

- [ ] Test all public SDK methods
- [ ] Test transaction building
- [ ] Test error handling

### For Component Changes:

- [ ] **Write component tests:**
  ```typescript
  import { render, screen } from '@testing-library/react';
  import { PoolCard } from './PoolCard';

  describe('PoolCard', () => {
    it('renders pool information', () => {
      render(<PoolCard poolId="0x123" tokenX="SUI" tokenY="USDC" />);
      expect(screen.getByText('SUI')).toBeInTheDocument();
      expect(screen.getByText('USDC')).toBeInTheDocument();
    });
  });
  ```

- [ ] Test loading states
- [ ] Test error states
- [ ] Test user interactions
- [ ] Test wallet connection flows

### For API/Backend Changes:

- [ ] **Write integration tests:**
  ```typescript
  describe('Pool API', () => {
    it('returns pool data', async () => {
      const response = await fetch('/api/pools/0x123');
      const data = await response.json();
      expect(data.poolId).toBe('0x123');
      expect(data.reserveX).toBeDefined();
      expect(data.reserveY).toBeDefined();
    });
  });
  ```

---

## Definition of Done (DoD)

Before marking task as complete, verify:

- [ ] ✅ **ALL tests passing** (`bun test`)
- [ ] ✅ **Build successful** (`turbo run build`)
- [ ] ✅ **Type checks passing** (`turbo run typecheck`)
- [ ] ✅ **Linters passing** (`turbo run lint`)
- [ ] ✅ **Repo health check** (`bun run lint:repo`)
- [ ] ✅ **Move tests passing** (if applicable: `sui move test`)
- [ ] ✅ **No console errors** in browser
- [ ] ✅ **Manual testing** completed
- [ ] ✅ **Documentation updated** (if needed)
- [ ] ✅ **No regressions** (existing features still work)

**If ANY checkbox is unchecked, task is NOT done.**

---

## Test Coverage Requirements

| Type | Minimum Coverage | When Required |
|------|-----------------|---------------|
| Unit Tests | 80% | All business logic |
| Integration Tests | N/A | All SDK methods |
| Component Tests | 70% | All UI components |
| E2E Tests | N/A | Critical user flows |
| Move Tests | 100% | All smart contract functions |

---

## Example: TDD for Flash Loan Feature

```typescript
// ❌ WRONG: Implement first, test later
// 1. Write FlashLoanClient class
// 2. Add methods
// 3. Hope it works

// ✅ CORRECT: Test first
// 1. Write failing test
describe('FlashLoanClient', () => {
  it('builds flash loan transaction', () => {
    const client = new FlashLoanClient(config);
    const tx = client.buildFlashLoanTx({
      poolId: '0x123',
      amount: 1000n,
      isTokenX: true,
      coinTypeX: 'SUI',
      coinTypeY: 'USDC'
    }, callback);

    expect(tx).toBeDefined();
    expect(tx.kind).toBe('ProgrammableTransaction');
  });

  it('calculates flash loan fee correctly', () => {
    const fee = FlashLoanClient.calculateFlashLoanFee(1000n, 5);
    expect(fee).toBe(0n); // 1000 * 5 / 10000 = 0.5 → 0 (rounded)
  });
});

// 2. Run tests - they FAIL (good!)
// 3. Implement minimal code to make tests pass
// 4. Run tests again - they PASS
// 5. Refactor if needed
// 6. Run tests again - still PASS
```

---

## When Tests Can Be Skipped

**NEVER.** Tests cannot be skipped.

If you think you need to skip tests:
1. Stop
2. Re-read this checklist
3. Write the tests

---

## Accountability

**Claude Code commits to:**
- Always following TDD RED-GREEN-REFACTOR cycle
- Writing tests BEFORE implementation
- Running tests and verifying they fail/pass
- Never marking tasks complete without passing DoD checklist
- Asking for clarification if DoR is not met

**User commits to:**
- Providing clear acceptance criteria
- Allowing time for proper TDD workflow
- Reviewing test coverage in PRs
- Holding Claude accountable to this process

---

## Quick Reference Commands

```bash
# Run all TypeScript tests
bun test

# Run tests in watch mode (TDD)
bun test --watch

# Run specific test file
bun test path/to/file.test.ts

# Run tests with coverage
bun test --coverage

# Run Move tests
cd move && sui move test

# Type check
turbo run typecheck

# Lint
turbo run lint

# Build
turbo run build

# Full CI pipeline (run before marking task done)
bun test && turbo run typecheck && turbo run lint && turbo run build
```

---

**Last Updated:** 2025-01-11
**Version:** 2.0.0
