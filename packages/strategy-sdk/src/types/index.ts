/**
 * Strategy SDK Type Definitions
 */

export * from './flash-loan';

import type { ObjectId, CoinType } from '@carapace/sdk';

/**
 * Strategy execution result
 */
export interface StrategyResult {
  success: boolean;
  transactionDigest?: string;
  profit?: bigint;
  error?: string;
  gasUsed?: bigint;
}

/**
 * Arbitrage opportunity
 */
export interface ArbitrageOpportunity {
  poolA: ObjectId;
  poolB: ObjectId;
  tokenIn: CoinType;
  tokenOut: CoinType;
  amountIn: bigint;
  expectedProfit: bigint;
  priceImpact: number;
}

/**
 * Common transaction options
 */
export interface TransactionOptions {
  gasBudget?: bigint;
  sender?: string;
  maxGasPrice?: bigint;
}
