/**
 * Utility functions for flash loan calculations
 */

/**
 * Calculate flash loan fee in basis points
 */
export function calculateFlashLoanFee(
	amount: bigint,
	feeBps: number = 5,
): bigint {
	return (amount * BigInt(feeBps)) / 10000n;
}

/**
 * Calculate total repayment (amount + fee)
 */
export function calculateRepayment(amount: bigint, feeBps: number = 5): bigint {
	return amount + calculateFlashLoanFee(amount, feeBps);
}

/**
 * Calculate profit from arbitrage after fees
 */
export function calculateArbitrageProfit(
	amountIn: bigint,
	amountOut: bigint,
	flashLoanFeeBps: number = 5,
	swapFeeBps: number = 25,
): bigint {
	const flashLoanFee = calculateFlashLoanFee(amountIn, flashLoanFeeBps);
	const swapFee = calculateFlashLoanFee(amountOut, swapFeeBps);

	const totalCost = amountIn + flashLoanFee + swapFee;

	if (amountOut <= totalCost) {
		return 0n;
	}

	return amountOut - totalCost;
}

/**
 * Check if arbitrage is profitable
 */
export function isArbitrageProfitable(
	amountIn: bigint,
	amountOut: bigint,
	flashLoanFeeBps: number = 5,
	swapFeeBps: number = 25,
	minProfitBps: number = 10, // Minimum 0.1% profit
): boolean {
	const profit = calculateArbitrageProfit(
		amountIn,
		amountOut,
		flashLoanFeeBps,
		swapFeeBps,
	);

	const minProfit = (amountIn * BigInt(minProfitBps)) / 10000n;

	return profit >= minProfit;
}

/**
 * Calculate price impact of a swap
 */
export function calculatePriceImpact(
	amountIn: bigint,
	reserveIn: bigint,
	reserveOut: bigint,
): number {
	if (reserveIn === 0n || reserveOut === 0n) {
		return 0;
	}

	const spotPrice = Number(reserveOut) / Number(reserveIn);
	const newReserveIn = reserveIn + amountIn;
	const amountOut = (amountIn * reserveOut) / newReserveIn;
	const executionPrice = Number(amountOut) / Number(amountIn);

	const priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice) * 100;

	return priceImpact;
}

/**
 * Format amount with decimals
 */
export function formatAmount(amount: bigint, decimals: number = 9): string {
	const divisor = 10n ** BigInt(decimals);
	const whole = amount / divisor;
	const fraction = amount % divisor;

	return `${whole}.${fraction.toString().padStart(decimals, "0")}`;
}

/**
 * Parse amount from string
 */
export function parseAmount(amount: string, decimals: number = 9): bigint {
	const [whole, fraction = "0"] = amount.split(".");
	const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);

	return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(paddedFraction);
}
