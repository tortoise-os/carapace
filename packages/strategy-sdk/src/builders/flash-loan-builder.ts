/**
 * Flash Loan Transaction Builder
 * Provides utilities to build flash loan transactions
 */

import type { CoinType, ObjectId } from "@carapace/sdk";
import { Transaction } from "@mysten/sui/transactions";
import type { FlashLoanRequest } from "../types";

export class FlashLoanBuilder {
	constructor(private packageId: string) {}

	/**
	 * Build flash borrow transaction for token X
	 */
	buildFlashBorrowX<X extends CoinType, Y extends CoinType>(
		tx: Transaction,
		poolId: ObjectId,
		amount: bigint,
	): { borrowedCoin: any; receipt: any } {
		const [borrowedCoin, receipt] = tx.moveCall({
			target: `${this.packageId}::pool::flash_borrow_x`,
			typeArguments: [X as string, Y as string],
			arguments: [tx.object(poolId), tx.pure.u64(amount)],
		});

		return { borrowedCoin, receipt };
	}

	/**
	 * Build flash borrow transaction for token Y
	 */
	buildFlashBorrowY<X extends CoinType, Y extends CoinType>(
		tx: Transaction,
		poolId: ObjectId,
		amount: bigint,
	): { borrowedCoin: any; receipt: any } {
		const [borrowedCoin, receipt] = tx.moveCall({
			target: `${this.packageId}::pool::flash_borrow_y`,
			typeArguments: [X as string, Y as string],
			arguments: [tx.object(poolId), tx.pure.u64(amount)],
		});

		return { borrowedCoin, receipt };
	}

	/**
	 * Build flash repay transaction for token X
	 */
	buildFlashRepayX<X extends CoinType, Y extends CoinType>(
		tx: Transaction,
		poolId: ObjectId,
		repaymentCoin: any,
		receipt: any,
	): void {
		tx.moveCall({
			target: `${this.packageId}::pool::repay_flash_loan_x`,
			typeArguments: [X as string, Y as string],
			arguments: [tx.object(poolId), repaymentCoin, receipt],
		});
	}

	/**
	 * Build flash repay transaction for token Y
	 */
	buildFlashRepayY<X extends CoinType, Y extends CoinType>(
		tx: Transaction,
		poolId: ObjectId,
		repaymentCoin: any,
		receipt: any,
	): void {
		tx.moveCall({
			target: `${this.packageId}::pool::repay_flash_loan_y`,
			typeArguments: [X as string, Y as string],
			arguments: [tx.object(poolId), repaymentCoin, receipt],
		});
	}

	/**
	 * Build a complete flash loan transaction
	 * This is a template that can be customized with the callback
	 */
	buildFlashLoanTransaction<X extends CoinType, Y extends CoinType>(
		request: FlashLoanRequest,
		callback: (tx: Transaction, borrowedCoin: any, receipt: any) => any,
	): Transaction {
		const tx = new Transaction();

		// Borrow
		const { borrowedCoin, receipt } = request.isTokenX
			? this.buildFlashBorrowX<X, Y>(tx, request.poolId, request.amount)
			: this.buildFlashBorrowY<X, Y>(tx, request.poolId, request.amount);

		// Execute custom logic with borrowed coins (callback)
		const repaymentCoin = callback(tx, borrowedCoin, receipt);

		// Repay
		if (request.isTokenX) {
			this.buildFlashRepayX<X, Y>(tx, request.poolId, repaymentCoin, receipt);
		} else {
			this.buildFlashRepayY<X, Y>(tx, request.poolId, repaymentCoin, receipt);
		}

		return tx;
	}

	/**
	 * Build simple flash loan for arbitrage
	 * Borrows from one pool, swaps on another, repays
	 */
	buildArbitrageFlashLoan<X extends CoinType, Y extends CoinType>(
		borrowPoolId: ObjectId,
		swapPoolId: ObjectId,
		borrowAmount: bigint,
		minReturnAmount: bigint,
		isTokenX: boolean,
	): Transaction {
		return this.buildFlashLoanTransaction<X, Y>(
			{
				poolId: borrowPoolId,
				tokenType: (isTokenX ? "X" : "Y") as any,
				amount: borrowAmount,
				isTokenX,
			},
			(tx, borrowedCoin, receipt) => {
				// Swap borrowed coins on different pool
				const [swappedCoin] = tx.moveCall({
					target: isTokenX
						? `${this.packageId}::pool::swap_x_to_y`
						: `${this.packageId}::pool::swap_y_to_x`,
					typeArguments: [X as string, Y as string],
					arguments: [
						tx.object(swapPoolId),
						borrowedCoin,
						tx.pure.u64(minReturnAmount),
					],
				});

				// The swapped coin becomes repayment
				return swappedCoin;
			},
		);
	}

	/**
	 * Calculate flash loan fee
	 */
	static calculateFlashLoanFee(amount: bigint, feeBps: number = 5): bigint {
		return (amount * BigInt(feeBps)) / 10000n;
	}

	/**
	 * Calculate total repayment amount
	 */
	static calculateRepayment(amount: bigint, feeBps: number = 5): bigint {
		return amount + FlashLoanBuilder.calculateFlashLoanFee(amount, feeBps);
	}
}
