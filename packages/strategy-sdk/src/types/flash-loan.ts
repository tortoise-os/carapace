/**
 * Flash Loan Type Definitions
 */

import type { CoinType, ObjectId, Address } from '@carapace/sdk';

/**
 * Flash loan receipt (hot potato) - must be repaid in same transaction
 */
export interface FlashLoanReceipt<T extends CoinType = CoinType> {
  poolId: ObjectId;
  amount: bigint;
  fee: bigint;
  tokenType: T;
}

/**
 * Flash loan request parameters
 */
export interface FlashLoanRequest<T extends CoinType = CoinType> {
  poolId: ObjectId;
  tokenType: T;
  amount: bigint;
  isTokenX: boolean; // true if borrowing token X, false for token Y
}

/**
 * Flash loan execution result
 */
export interface FlashLoanResult {
  borrowedAmount: bigint;
  feeAmount: bigint;
  repaidAmount: bigint;
  transactionDigest: string;
}

/**
 * Flash loan options
 */
export interface FlashLoanOptions {
  gasBudget?: bigint;
  slippageTolerance?: number; // in basis points
}

/**
 * Flash loan statistics
 */
export interface FlashLoanStats {
  poolId: ObjectId;
  totalLoans: bigint;
  totalVolume: bigint;
  totalFees: bigint;
  availableLiquidity: bigint;
}

/**
 * Flash loan event - emitted when flash loan is borrowed
 */
export interface FlashLoanBorrowedEvent {
  poolId: ObjectId;
  amount: bigint;
  fee: bigint;
  borrower?: Address;
}

/**
 * Flash loan repaid event - emitted when flash loan is repaid
 */
export interface FlashLoanRepaidEvent {
  poolId: ObjectId;
  amount: bigint;
  fee: bigint;
  borrower?: Address;
}

/**
 * Callback function type for flash loan execution
 * This function receives the borrowed coins and must return repayment coins
 */
export type FlashLoanCallback<T extends CoinType = CoinType> = (
  borrowedCoins: ObjectId[],
  receipt: FlashLoanReceipt<T>,
) => Promise<ObjectId[]>; // Returns repayment coin IDs

/**
 * Flash loan quote - estimation of costs and returns
 */
export interface FlashLoanQuote {
  borrowAmount: bigint;
  feeAmount: bigint;
  totalRepayment: bigint;
  feePercentage: number; // in basis points
  availableLiquidity: bigint;
}
