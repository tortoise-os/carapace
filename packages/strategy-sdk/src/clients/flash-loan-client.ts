/**
 * Flash Loan Client
 * High-level API for executing flash loans on Carapace pools
 */

import type { CoinType, ObjectId, PoolInfo } from "@carapace/sdk";
import type { SuiClient } from "@mysten/sui/client";
import type { Transaction } from "@mysten/sui/transactions";
import { FlashLoanBuilder } from "../builders/flash-loan-builder";
import type {
	FlashLoanOptions,
	FlashLoanQuote,
	FlashLoanRequest,
	FlashLoanResult,
	FlashLoanStats,
} from "../types";

export class FlashLoanClient {
	private builder: FlashLoanBuilder;

	constructor(
		private client: SuiClient,
		private packageId: string,
	) {
		this.builder = new FlashLoanBuilder(packageId);
	}

	/**
	 * Get a quote for a flash loan
	 */
	async getFlashLoanQuote(
		poolId: ObjectId,
		amount: bigint,
		feeBps: number = 5,
	): Promise<FlashLoanQuote> {
		// Get pool info to check available liquidity
		const poolObject = await this.client.getObject({
			id: poolId,
			options: { showContent: true },
		});

		if (
			!poolObject.data ||
			!poolObject.data.content ||
			poolObject.data.content.dataType !== "moveObject"
		) {
			throw new Error("Pool not found");
		}

		const fields = poolObject.data.content.fields as any;
		const reserveX = BigInt(fields.reserve_x || "0");
		const reserveY = BigInt(fields.reserve_y || "0");
		const availableLiquidity = reserveX + reserveY;

		const feeAmount = FlashLoanBuilder.calculateFlashLoanFee(amount, feeBps);
		const totalRepayment = amount + feeAmount;

		return {
			borrowAmount: amount,
			feeAmount,
			totalRepayment,
			feePercentage: feeBps,
			availableLiquidity,
		};
	}

	/**
	 * Execute a flash loan with custom transaction logic
	 * The callback receives the transaction, borrowed coin, and receipt
	 * It must return the repayment coin
	 */
	async executeFlashLoan<X extends CoinType, Y extends CoinType>(
		request: FlashLoanRequest,
		callback: (tx: Transaction, borrowedCoin: any, receipt: any) => any,
		sender: string,
		options?: FlashLoanOptions,
	): Promise<FlashLoanResult> {
		// Build transaction
		const tx = this.builder.buildFlashLoanTransaction<X, Y>(request, callback);

		// Set gas budget if provided
		if (options?.gasBudget) {
			tx.setGasBudget(options.gasBudget);
		}

		// Set sender
		tx.setSender(sender);

		// Execute transaction
		const result = await this.client.signAndExecuteTransaction({
			transaction: tx,
			signer: sender as any, // In practice, you'd use a Keypair here
			options: {
				showEffects: true,
				showEvents: true,
			},
		});

		if (result.effects?.status?.status !== "success") {
			throw new Error(
				`Flash loan transaction failed: ${result.effects?.status?.error}`,
			);
		}

		// Calculate amounts from quote
		const quote = await this.getFlashLoanQuote(request.poolId, request.amount);

		return {
			borrowedAmount: request.amount,
			feeAmount: quote.feeAmount,
			repaidAmount: quote.totalRepayment,
			transactionDigest: result.digest,
		};
	}

	/**
	 * Build a flash loan transaction without executing it
	 * Useful for dry-run testing or custom execution
	 */
	buildFlashLoanTx<X extends CoinType, Y extends CoinType>(
		request: FlashLoanRequest,
		callback: (tx: Transaction, borrowedCoin: any, receipt: any) => any,
	): Transaction {
		return this.builder.buildFlashLoanTransaction<X, Y>(request, callback);
	}

	/**
	 * Execute a simple arbitrage using flash loans
	 * Borrows from borrowPool, swaps on swapPool, repays to borrowPool
	 */
	async executeArbitrage<X extends CoinType, Y extends CoinType>(
		borrowPoolId: ObjectId,
		swapPoolId: ObjectId,
		borrowAmount: bigint,
		minReturnAmount: bigint,
		isTokenX: boolean,
		sender: string,
		options?: FlashLoanOptions,
	): Promise<FlashLoanResult> {
		const tx = this.builder.buildArbitrageFlashLoan<X, Y>(
			borrowPoolId,
			swapPoolId,
			borrowAmount,
			minReturnAmount,
			isTokenX,
		);

		if (options?.gasBudget) {
			tx.setGasBudget(options.gasBudget);
		}

		tx.setSender(sender);

		const result = await this.client.signAndExecuteTransaction({
			transaction: tx,
			signer: sender as any,
			options: {
				showEffects: true,
				showEvents: true,
			},
		});

		if (result.effects?.status?.status !== "success") {
			throw new Error(
				`Arbitrage transaction failed: ${result.effects?.status?.error}`,
			);
		}

		const quote = await this.getFlashLoanQuote(borrowPoolId, borrowAmount);

		return {
			borrowedAmount: borrowAmount,
			feeAmount: quote.feeAmount,
			repaidAmount: quote.totalRepayment,
			transactionDigest: result.digest,
		};
	}

	/**
	 * Get flash loan statistics for a pool
	 */
	async getFlashLoanStats(poolId: ObjectId): Promise<FlashLoanStats> {
		const poolObject = await this.client.getObject({
			id: poolId,
			options: { showContent: true },
		});

		if (
			!poolObject.data ||
			!poolObject.data.content ||
			poolObject.data.content.dataType !== "moveObject"
		) {
			throw new Error("Pool not found");
		}

		const fields = poolObject.data.content.fields as any;
		const reserveX = BigInt(fields.reserve_x || "0");
		const reserveY = BigInt(fields.reserve_y || "0");
		const protocolFeeX = BigInt(fields.protocol_fee_x || "0");
		const protocolFeeY = BigInt(fields.protocol_fee_y || "0");

		// Note: We don't have specific flash loan counters in the contract yet
		// These would need to be added to track flash loan specific stats
		return {
			poolId,
			totalLoans: 0n, // Would need contract support
			totalVolume: 0n, // Would need contract support
			totalFees: protocolFeeX + protocolFeeY,
			availableLiquidity: reserveX + reserveY,
		};
	}

	/**
	 * Check if a flash loan is feasible
	 */
	async canExecuteFlashLoan(
		poolId: ObjectId,
		amount: bigint,
		isTokenX: boolean,
	): Promise<boolean> {
		try {
			const poolObject = await this.client.getObject({
				id: poolId,
				options: { showContent: true },
			});

			if (
				!poolObject.data ||
				!poolObject.data.content ||
				poolObject.data.content.dataType !== "moveObject"
			) {
				return false;
			}

			const fields = poolObject.data.content.fields as any;
			const reserve = isTokenX
				? BigInt(fields.reserve_x || "0")
				: BigInt(fields.reserve_y || "0");

			// Check if pool has enough liquidity (must be strictly less than reserve)
			return amount < reserve;
		} catch {
			return false;
		}
	}

	/**
	 * Calculate optimal flash loan amount for arbitrage
	 * This is a simplified version - in production you'd use more sophisticated algorithms
	 */
	calculateOptimalAmount(
		reserveIn: bigint,
		reserveOut: bigint,
		feeBps: number = 5,
	): bigint {
		// Simple heuristic: use 10% of smaller reserve
		const smallerReserve = reserveIn < reserveOut ? reserveIn : reserveOut;
		return smallerReserve / 10n;
	}
}
