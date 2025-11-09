/**
 * Flash Loan Arbitrage Example
 *
 * This example demonstrates how to execute a flash loan arbitrage
 * between two Carapace pools.
 */

import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { StrategySDK } from "../src";
import type { FlashLoanRequest } from "../src/types";

// Configuration
const NETWORK = "testnet";
const RPC_URL = "https://fullnode.testnet.sui.io:443";
const PACKAGE_ID =
	"0x998379bb53423871a9e4f8f779c339c096622209309452995ae5ed395779106e";

// Pool IDs (replace with actual pool IDs)
const POOL_A = "0x..."; // Pool to borrow from
const POOL_B = "0x..."; // Pool to swap on

// Token types
const TOKEN_X = "0x2::sui::SUI";
const TOKEN_Y = "0x...::usdc::USDC";

/**
 * Example 1: Simple Flash Loan Quote
 */
async function getFlashLoanQuote() {
	const client = new SuiClient({ url: RPC_URL });
	const sdk = new StrategySDK(client, PACKAGE_ID);

	// Get quote for borrowing 1000 SUI
	const quote = await sdk.flashLoan.getFlashLoanQuote(
		POOL_A,
		1000_000_000_000n, // 1000 SUI (9 decimals)
		5, // 0.05% fee
	);

	console.log("=== Flash Loan Quote ===");
	console.log(`Borrow Amount: ${quote.borrowAmount / 1_000_000_000n} SUI`);
	console.log(`Fee Amount: ${quote.feeAmount / 1_000_000_000n} SUI`);
	console.log(`Total Repayment: ${quote.totalRepayment / 1_000_000_000n} SUI`);
	console.log(`Fee Percentage: ${quote.feePercentage / 100}%`);
	console.log(
		`Available Liquidity: ${quote.availableLiquidity / 1_000_000_000n} SUI`,
	);
}

/**
 * Example 2: Check Flash Loan Feasibility
 */
async function checkFeasibility() {
	const client = new SuiClient({ url: RPC_URL });
	const sdk = new StrategySDK(client, PACKAGE_ID);

	const amount = 1000_000_000_000n; // 1000 SUI

	const canExecute = await sdk.flashLoan.canExecuteFlashLoan(
		POOL_A,
		amount,
		true, // Borrowing token X
	);

	if (canExecute) {
		console.log("✓ Flash loan is feasible");
	} else {
		console.log("✗ Insufficient liquidity for flash loan");
	}
}

/**
 * Example 3: Build Flash Loan Transaction (Dry Run)
 */
async function buildFlashLoanTransaction() {
	const client = new SuiClient({ url: RPC_URL });
	const sdk = new StrategySDK(client, PACKAGE_ID);

	const request: FlashLoanRequest = {
		poolId: POOL_A,
		tokenType: TOKEN_X,
		amount: 1000_000_000_000n,
		isTokenX: true,
	};

	const tx = sdk.flashLoan.buildFlashLoanTx<typeof TOKEN_X, typeof TOKEN_Y>(
		request,
		(tx, borrowedCoin, receipt) => {
			// Custom logic: Swap borrowed tokens on different pool
			const [swappedCoin] = tx.moveCall({
				target: `${PACKAGE_ID}::pool::swap_x_to_y`,
				typeArguments: [TOKEN_X, TOKEN_Y],
				arguments: [
					tx.object(POOL_B),
					borrowedCoin,
					tx.pure.u64(0), // Min amount out (set appropriately in production)
				],
			});

			// Return swapped coin as repayment
			return swappedCoin;
		},
	);

	console.log("=== Flash Loan Transaction Built ===");
	console.log("Transaction blocks:", tx.blockData.transactions.length);
}

/**
 * Example 4: Calculate Arbitrage Profitability
 */
async function calculateArbitrageProfitability() {
	const { calculateArbitrageProfit, isArbitrageProfitable } = await import(
		"../src/utils/calculations"
	);

	const amountIn = 1000_000_000_000n; // 1000 SUI
	const amountOut = 1100_000_000_000n; // 1100 SUI (expected from swap)

	const profit = calculateArbitrageProfit(
		amountIn,
		amountOut,
		5, // Flash loan fee (0.05%)
		25, // Swap fee (0.25%)
	);

	console.log("=== Arbitrage Profitability ===");
	console.log(`Amount In: ${amountIn / 1_000_000_000n} SUI`);
	console.log(`Amount Out: ${amountOut / 1_000_000_000n} SUI`);
	console.log(`Profit: ${profit / 1_000_000_000n} SUI`);

	const profitable = isArbitrageProfitable(
		amountIn,
		amountOut,
		5,
		25,
		10, // Min 0.1% profit
	);

	if (profitable) {
		console.log("✓ Arbitrage is profitable");
	} else {
		console.log("✗ Arbitrage is not profitable");
	}
}

/**
 * Example 5: Execute Arbitrage (REQUIRES SIGNER)
 */
async function executeArbitrage() {
	const client = new SuiClient({ url: RPC_URL });
	const sdk = new StrategySDK(client, PACKAGE_ID);

	// NOTE: In production, you would use an actual keypair
	const senderAddress = "0x..."; // Your address

	try {
		const result = await sdk.flashLoan.executeArbitrage<
			typeof TOKEN_X,
			typeof TOKEN_Y
		>(
			POOL_A, // Borrow from Pool A
			POOL_B, // Swap on Pool B
			1000_000_000_000n, // Borrow 1000 SUI
			1005_000_000_000n, // Expect at least 1005 SUI back
			true, // Borrow token X
			senderAddress,
			{ gasBudget: 100_000_000n },
		);

		console.log("=== Arbitrage Executed ===");
		console.log(`Transaction: ${result.transactionDigest}`);
		console.log(`Borrowed: ${result.borrowedAmount / 1_000_000_000n} SUI`);
		console.log(`Fee: ${result.feeAmount / 1_000_000_000n} SUI`);
		console.log(`Repaid: ${result.repaidAmount / 1_000_000_000n} SUI`);

		const profit =
			result.repaidAmount - result.borrowedAmount - result.feeAmount;
		console.log(`Profit: ${profit / 1_000_000_000n} SUI`);
	} catch (error) {
		console.error("Arbitrage failed:", error);
	}
}

/**
 * Example 6: Calculate Price Impact
 */
async function calculatePriceImpact() {
	const { calculatePriceImpact: calcImpact } = await import(
		"../src/utils/calculations"
	);

	const scenarios = [
		{ amount: 10_000_000_000n, label: "10 SUI" },
		{ amount: 100_000_000_000n, label: "100 SUI" },
		{ amount: 1000_000_000_000n, label: "1000 SUI" },
	];

	const reserveIn = 100_000_000_000_000n; // 100k SUI
	const reserveOut = 200_000_000_000_000n; // 200k SUI

	console.log("=== Price Impact Analysis ===");
	for (const { amount, label } of scenarios) {
		const impact = calcImpact(amount, reserveIn, reserveOut);
		console.log(`${label}: ${impact.toFixed(4)}% price impact`);
	}
}

/**
 * Main function - run all examples
 */
async function main() {
	console.log("🚀 Carapace Flash Loan Examples\n");

	// Example 1: Get flash loan quote
	console.log("\n📊 Example 1: Flash Loan Quote");
	await getFlashLoanQuote();

	// Example 2: Check feasibility
	console.log("\n✅ Example 2: Check Feasibility");
	await checkFeasibility();

	// Example 3: Build transaction
	console.log("\n🔨 Example 3: Build Transaction");
	await buildFlashLoanTransaction();

	// Example 4: Calculate profitability
	console.log("\n💰 Example 4: Calculate Profitability");
	await calculateArbitrageProfitability();

	// Example 6: Price impact
	console.log("\n📈 Example 6: Price Impact");
	await calculatePriceImpact();

	console.log("\n✅ All examples completed!");
	console.log(
		"\nNote: Example 5 (Execute Arbitrage) requires a signer and is commented out.",
	);
}

// Run examples if executed directly
if (import.meta.main) {
	main().catch(console.error);
}

export {
	getFlashLoanQuote,
	checkFeasibility,
	buildFlashLoanTransaction,
	calculateArbitrageProfitability,
	executeArbitrage,
	calculatePriceImpact,
};
