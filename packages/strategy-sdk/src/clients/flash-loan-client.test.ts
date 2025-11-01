/**
 * Flash Loan Client Tests
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { FlashLoanBuilder } from '../builders/flash-loan-builder';
import {
  calculateFlashLoanFee,
  calculateRepayment,
  calculateArbitrageProfit,
  isArbitrageProfitable,
  calculatePriceImpact,
} from '../utils/calculations';

describe('FlashLoanBuilder', () => {
  test('calculateFlashLoanFee with default fee', () => {
    const amount = 10000n;
    const fee = FlashLoanBuilder.calculateFlashLoanFee(amount);

    // 10000 * 5 / 10000 = 5
    expect(fee).toBe(5n);
  });

  test('calculateFlashLoanFee with custom fee', () => {
    const amount = 100000n;
    const fee = FlashLoanBuilder.calculateFlashLoanFee(amount, 10);

    // 100000 * 10 / 10000 = 100
    expect(fee).toBe(100n);
  });

  test('calculateFlashLoanFee with large amount', () => {
    const amount = 1000000n;
    const fee = FlashLoanBuilder.calculateFlashLoanFee(amount, 5);

    // 1000000 * 5 / 10000 = 500
    expect(fee).toBe(500n);
  });

  test('calculateRepayment', () => {
    const amount = 10000n;
    const repayment = FlashLoanBuilder.calculateRepayment(amount, 5);

    // 10000 + (10000 * 5 / 10000) = 10005
    expect(repayment).toBe(10005n);
  });

  test('calculateRepayment with zero fee', () => {
    const amount = 10000n;
    const repayment = FlashLoanBuilder.calculateRepayment(amount, 0);

    expect(repayment).toBe(10000n);
  });
});

describe('Flash Loan Calculations', () => {
  test('calculateFlashLoanFee utility', () => {
    expect(calculateFlashLoanFee(10000n, 5)).toBe(5n);
    expect(calculateFlashLoanFee(100000n, 5)).toBe(50n);
    expect(calculateFlashLoanFee(1000000n, 5)).toBe(500n);
  });

  test('calculateRepayment utility', () => {
    expect(calculateRepayment(10000n, 5)).toBe(10005n);
    expect(calculateRepayment(100000n, 5)).toBe(100050n);
    expect(calculateRepayment(1000000n, 5)).toBe(1000500n);
  });

  test('calculateArbitrageProfit with profit', () => {
    const amountIn = 10000n;
    const amountOut = 10500n;
    const profit = calculateArbitrageProfit(amountIn, amountOut, 5, 25);

    // amountOut (10500) - amountIn (10000) - flashFee (5) - swapFee (262) = 233
    // Note: Swap fee is on amountOut: 10500 * 25 / 10000 = 262.5 ~= 262
    expect(profit).toBeGreaterThan(0n);
  });

  test('calculateArbitrageProfit with loss', () => {
    const amountIn = 10000n;
    const amountOut = 10000n;
    const profit = calculateArbitrageProfit(amountIn, amountOut, 5, 25);

    expect(profit).toBe(0n);
  });

  test('isArbitrageProfitable returns true for profitable trades', () => {
    const amountIn = 10000n;
    const amountOut = 11000n;

    const profitable = isArbitrageProfitable(amountIn, amountOut, 5, 25, 10);
    expect(profitable).toBe(true);
  });

  test('isArbitrageProfitable returns false for unprofitable trades', () => {
    const amountIn = 10000n;
    const amountOut = 10000n;

    const profitable = isArbitrageProfitable(amountIn, amountOut, 5, 25, 10);
    expect(profitable).toBe(false);
  });

  test('calculatePriceImpact', () => {
    const amountIn = 1000n;
    const reserveIn = 100000n;
    const reserveOut = 200000n;

    const impact = calculatePriceImpact(amountIn, reserveIn, reserveOut);

    // Should be a small percentage for 1% of pool size
    expect(impact).toBeGreaterThan(0);
    expect(impact).toBeLessThan(2); // Less than 2% impact
  });

  test('calculatePriceImpact with large trade', () => {
    const amountIn = 50000n; // 50% of pool
    const reserveIn = 100000n;
    const reserveOut = 200000n;

    const impact = calculatePriceImpact(amountIn, reserveIn, reserveOut);

    // Should have significant impact
    expect(impact).toBeGreaterThan(20); // More than 20% impact
  });

  test('calculatePriceImpact with zero reserves returns 0', () => {
    const impact = calculatePriceImpact(1000n, 0n, 0n);
    expect(impact).toBe(0);
  });
});

describe('Flash Loan Fee Tiers', () => {
  test('small loan fee calculation', () => {
    const amount = 1000n;
    const fee = calculateFlashLoanFee(amount, 5);

    expect(fee).toBe(0n); // Rounds down to 0
  });

  test('medium loan fee calculation', () => {
    const amount = 100000n;
    const fee = calculateFlashLoanFee(amount, 5);

    expect(fee).toBe(50n);
  });

  test('large loan fee calculation', () => {
    const amount = 10000000n;
    const fee = calculateFlashLoanFee(amount, 5);

    expect(fee).toBe(5000n);
  });

  test('different fee tiers', () => {
    const amount = 100000n;

    expect(calculateFlashLoanFee(amount, 5)).toBe(50n);
    expect(calculateFlashLoanFee(amount, 10)).toBe(100n);
    expect(calculateFlashLoanFee(amount, 25)).toBe(250n);
  });
});

describe('Repayment Calculations', () => {
  test('repayment includes principal and fee', () => {
    const principal = 100000n;
    const feeBps = 5;

    const repayment = calculateRepayment(principal, feeBps);
    const expectedFee = calculateFlashLoanFee(principal, feeBps);

    expect(repayment).toBe(principal + expectedFee);
    expect(repayment).toBe(100050n);
  });

  test('repayment with different fees', () => {
    const principal = 100000n;

    expect(calculateRepayment(principal, 0)).toBe(100000n);
    expect(calculateRepayment(principal, 5)).toBe(100050n);
    expect(calculateRepayment(principal, 10)).toBe(100100n);
    expect(calculateRepayment(principal, 25)).toBe(100250n);
  });
});

describe('Edge Cases', () => {
  test('zero amount flash loan', () => {
    const fee = calculateFlashLoanFee(0n, 5);
    expect(fee).toBe(0n);

    const repayment = calculateRepayment(0n, 5);
    expect(repayment).toBe(0n);
  });

  test('maximum safe integer', () => {
    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
    const fee = calculateFlashLoanFee(maxSafe, 5);

    expect(fee).toBeGreaterThan(0n);

    const repayment = calculateRepayment(maxSafe, 5);
    expect(repayment).toBeGreaterThan(maxSafe);
  });

  test('very high fee percentage', () => {
    const amount = 100000n;
    const highFeeBps = 1000; // 10%

    const fee = calculateFlashLoanFee(amount, highFeeBps);
    expect(fee).toBe(10000n);

    const repayment = calculateRepayment(amount, highFeeBps);
    expect(repayment).toBe(110000n);
  });
});
