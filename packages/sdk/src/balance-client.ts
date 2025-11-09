/**
 * Balance Client - Fetch user token balances
 */

import type { SuiClient } from "@mysten/sui/client";
import type { CoinType } from "./types";

export interface TokenBalance {
	coinType: string;
	totalBalance: bigint;
	coins: Array<{
		objectId: string;
		balance: bigint;
	}>;
}

export class BalanceClient {
	constructor(private client: SuiClient) {}

	/**
	 * Get user's balance for a specific token
	 */
	async getTokenBalance(
		owner: string,
		coinType: CoinType,
	): Promise<TokenBalance> {
		try {
			const coins = await this.client.getCoins({
				owner,
				coinType,
			});

			const totalBalance = coins.data.reduce(
				(sum, coin) => sum + BigInt(coin.balance),
				0n,
			);

			return {
				coinType,
				totalBalance,
				coins: coins.data.map((coin) => ({
					objectId: coin.coinObjectId,
					balance: BigInt(coin.balance),
				})),
			};
		} catch (error) {
			console.error(`Failed to fetch balance for ${coinType}:`, error);
			return {
				coinType,
				totalBalance: 0n,
				coins: [],
			};
		}
	}

	/**
	 * Get user's balances for multiple tokens
	 */
	async getTokenBalances(
		owner: string,
		coinTypes: CoinType[],
	): Promise<Map<CoinType, TokenBalance>> {
		const balances = await Promise.all(
			coinTypes.map((coinType) => this.getTokenBalance(owner, coinType)),
		);

		return new Map(balances.map((balance) => [balance.coinType, balance]));
	}

	/**
	 * Get all token balances for a user
	 * Note: This only returns coin types that have a balance > 0
	 */
	async getAllBalances(owner: string): Promise<TokenBalance[]> {
		try {
			const allCoins = await this.client.getAllCoins({ owner });

			// Group coins by type
			const coinsByType = new Map<string, typeof allCoins.data>();

			for (const coin of allCoins.data) {
				const existing = coinsByType.get(coin.coinType) || [];
				existing.push(coin);
				coinsByType.set(coin.coinType, existing);
			}

			// Calculate totals
			const balances: TokenBalance[] = [];
			for (const [coinType, coins] of coinsByType.entries()) {
				const totalBalance = coins.reduce(
					(sum, coin) => sum + BigInt(coin.balance),
					0n,
				);

				balances.push({
					coinType,
					totalBalance,
					coins: coins.map((coin) => ({
						objectId: coin.coinObjectId,
						balance: BigInt(coin.balance),
					})),
				});
			}

			return balances;
		} catch (error) {
			console.error("Failed to fetch all balances:", error);
			return [];
		}
	}

	/**
	 * Get the largest coin object for a given token type
	 * Useful for selecting which coin to use in transactions
	 */
	async getLargestCoin(
		owner: string,
		coinType: CoinType,
	): Promise<{ objectId: string; balance: bigint } | null> {
		const balance = await this.getTokenBalance(owner, coinType);

		if (balance.coins.length === 0) {
			return null;
		}

		// Return the coin with the largest balance
		return balance.coins.reduce((largest, coin) =>
			coin.balance > largest.balance ? coin : largest,
		);
	}

	/**
	 * Select coins to cover a specific amount
	 * Returns array of coin objects that sum to at least the required amount
	 */
	async selectCoins(
		owner: string,
		coinType: CoinType,
		amount: bigint,
	): Promise<Array<{ objectId: string; balance: bigint }>> {
		const balance = await this.getTokenBalance(owner, coinType);

		if (balance.totalBalance < amount) {
			throw new Error(
				`Insufficient balance: need ${amount}, have ${balance.totalBalance}`,
			);
		}

		// Sort coins by balance (largest first) for efficient selection
		const sorted = [...balance.coins].sort((a, b) =>
			Number(b.balance - a.balance),
		);

		const selected: Array<{ objectId: string; balance: bigint }> = [];
		let total = 0n;

		for (const coin of sorted) {
			selected.push(coin);
			total += coin.balance;

			if (total >= amount) {
				break;
			}
		}

		return selected;
	}

	/**
	 * Format balance for display (convert from smallest unit to decimal)
	 */
	formatBalance(balance: bigint, decimals: number): string {
		const divisor = BigInt(10 ** decimals);
		const wholePart = balance / divisor;
		const fractionalPart = balance % divisor;

		const fractionalStr = fractionalPart.toString().padStart(decimals, "0");

		// Trim trailing zeros
		const trimmed = fractionalStr.replace(/0+$/, "");

		if (trimmed === "") {
			return wholePart.toString();
		}

		return `${wholePart}.${trimmed}`;
	}

	/**
	 * Parse user input amount to smallest unit
	 */
	parseAmount(amount: string, decimals: number): bigint {
		const [whole = "0", fraction = "0"] = amount.split(".");
		const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
		const combined = whole + paddedFraction;
		return BigInt(combined);
	}
}
