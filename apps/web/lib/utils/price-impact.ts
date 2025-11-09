/**
 * Price Impact Utilities
 * Calculate and format price impact for swaps
 */

export interface PriceImpactData {
	percentage: number;
	severity: "low" | "medium" | "high" | "critical";
	color: string;
	shouldWarn: boolean;
}

/**
 * Calculate price impact for a swap
 *
 * Price Impact Formula:
 * - Spot Price (before) = reserveOut / reserveIn
 * - Execution Price = amountOut / amountIn
 * - Price Impact = |1 - (executionPrice / spotPrice)| * 100
 */
export function calculatePriceImpact(
	amountIn: bigint,
	amountOut: bigint,
	reserveIn: bigint,
	reserveOut: bigint,
): PriceImpactData {
	if (amountIn === 0n || reserveIn === 0n || reserveOut === 0n) {
		return {
			percentage: 0,
			severity: "low",
			color: "text-green-600",
			shouldWarn: false,
		};
	}

	// Calculate spot price (scaled by 1e18 for precision)
	const PRECISION = 10n ** 18n;
	const spotPrice = (reserveOut * PRECISION) / reserveIn;

	// Calculate execution price
	const executionPrice = (amountOut * PRECISION) / amountIn;

	// Price impact percentage
	const impact =
		spotPrice > executionPrice
			? ((spotPrice - executionPrice) * 10000n) / spotPrice
			: ((executionPrice - spotPrice) * 10000n) / spotPrice;

	const percentage = Number(impact) / 100; // Convert basis points to percentage

	return {
		percentage,
		...getSeverityData(percentage),
	};
}

/**
 * Get severity data based on price impact percentage
 */
function getSeverityData(percentage: number): {
	severity: "low" | "medium" | "high" | "critical";
	color: string;
	shouldWarn: boolean;
} {
	if (percentage < 1) {
		return {
			severity: "low",
			color: "text-green-600",
			shouldWarn: false,
		};
	}

	if (percentage < 3) {
		return {
			severity: "medium",
			color: "text-yellow-600",
			shouldWarn: true,
		};
	}

	if (percentage < 5) {
		return {
			severity: "high",
			color: "text-orange-600",
			shouldWarn: true,
		};
	}

	return {
		severity: "critical",
		color: "text-red-600",
		shouldWarn: true,
	};
}

/**
 * Format price impact for display
 */
export function formatPriceImpact(percentage: number): string {
	if (percentage < 0.01) {
		return "< 0.01%";
	}

	if (percentage < 1) {
		return `${percentage.toFixed(2)}%`;
	}

	return `${percentage.toFixed(1)}%`;
}

/**
 * Get warning message based on severity
 */
export function getPriceImpactWarning(
	severity: PriceImpactData["severity"],
): string {
	switch (severity) {
		case "low":
			return "Price impact is low";
		case "medium":
			return "Price impact is moderate. Consider splitting into smaller trades.";
		case "high":
			return "High price impact! You may receive significantly less than expected.";
		case "critical":
			return "Critical price impact! This trade will move the market significantly. Consider using a different route or splitting the trade.";
		default:
			return "";
	}
}

/**
 * Calculate minimum received after slippage
 */
export function calculateMinimumReceived(
	amountOut: bigint,
	slippageBps: number, // basis points (50 = 0.5%)
): bigint {
	return (amountOut * BigInt(10000 - slippageBps)) / 10000n;
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(
	amount: bigint,
	decimals: number = 9,
): string {
	const divisor = 10n ** BigInt(decimals);
	const whole = amount / divisor;
	const fraction = amount % divisor;

	if (fraction === 0n) {
		return whole.toString();
	}

	const fractionStr = fraction.toString().padStart(decimals, "0");
	const trimmed = fractionStr.replace(/0+$/, "");

	return `${whole}.${trimmed}`;
}
