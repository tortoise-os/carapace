/**
 * Transaction History Service
 * Queries blockchain events and provides transaction history
 */

import type { SuiClient, SuiEvent } from "@mysten/sui/client";

export interface Transaction {
	id: string;
	type: "swap" | "add_liquidity" | "remove_liquidity" | "flash_swap";
	timestamp: number;
	poolId: string;
	sender: string;
	amounts: {
		tokenX?: string;
		tokenY?: string;
		liquidity?: string;
	};
	fee?: string;
	txDigest: string;
}

export class TransactionHistoryService {
	private client: SuiClient;
	private packageId: string;

	constructor(client: SuiClient, packageId: string) {
		this.client = client;
		this.packageId = packageId;
	}

	/**
	 * Get transaction history for a specific address
	 */
	async getTransactionHistory(
		address: string,
		options: {
			limit?: number;
			cursor?: string;
			poolId?: string;
			type?: string;
		} = {},
	): Promise<{
		transactions: Transaction[];
		hasNextPage: boolean;
		nextCursor: string | null;
	}> {
		const limit = options.limit || 50;
		const transactions: Transaction[] = [];

		try {
			// Query all relevant events from the pool module
			const eventTypes = [
				`${this.packageId}::pool::Swapped`,
				`${this.packageId}::pool::LiquidityAdded`,
				`${this.packageId}::pool::LiquidityRemoved`,
				`${this.packageId}::pool::FlashSwapped`,
			];

			// Fetch events for each type
			for (const eventType of eventTypes) {
				const result = await this.client.queryEvents({
					query: {
						MoveEventType: eventType,
					},
					limit,
					order: "descending",
				});

				// Parse events
				for (const event of result.data) {
					// Filter by sender address if provided
					const txData = await this.client.getTransactionBlock({
						digest: event.id.txDigest,
						options: {
							showEffects: true,
							showEvents: true,
						},
					});

					const sender = txData.transaction?.data.sender;
					if (sender !== address) {
						continue;
					}

					// Filter by pool ID if provided
					const parsedJson = event.parsedJson as any;
					if (options.poolId && parsedJson.pool_id !== options.poolId) {
						continue;
					}

					const transaction = this.parseEvent(event);
					if (transaction) {
						transactions.push(transaction);
					}
				}
			}

			// Sort by timestamp descending
			transactions.sort((a, b) => b.timestamp - a.timestamp);

			// Apply limit
			const limitedTransactions = transactions.slice(0, limit);
			const hasNextPage = transactions.length > limit;

			return {
				transactions: limitedTransactions,
				hasNextPage,
				nextCursor: hasNextPage
					? limitedTransactions[limitedTransactions.length - 1]?.id
					: null,
			};
		} catch (error) {
			console.error("Error fetching transaction history:", error);
			return {
				transactions: [],
				hasNextPage: false,
				nextCursor: null,
			};
		}
	}

	/**
	 * Get transaction history for a specific pool
	 */
	async getPoolTransactionHistory(
		poolId: string,
		options: {
			limit?: number;
			cursor?: string;
		} = {},
	): Promise<{
		transactions: Transaction[];
		hasNextPage: boolean;
		nextCursor: string | null;
	}> {
		return this.getTransactionHistory("", {
			...options,
			poolId,
		});
	}

	/**
	 * Parse event into Transaction object
	 */
	private parseEvent(event: SuiEvent): Transaction | null {
		try {
			const parsedJson = event.parsedJson as any;
			const eventType = event.type.split("::").pop() || "";
			const timestamp = parseInt(event.timestampMs || "0");

			const base = {
				id: event.id.txDigest + "_" + event.id.eventSeq,
				timestamp,
				poolId: parsedJson.pool_id,
				sender: "", // Will be filled by caller
				txDigest: event.id.txDigest,
			};

			switch (eventType) {
				case "Swapped":
					return {
						...base,
						type: "swap",
						amounts: {
							tokenX: parsedJson.is_x_to_y
								? parsedJson.amount_in
								: parsedJson.amount_out,
							tokenY: parsedJson.is_x_to_y
								? parsedJson.amount_out
								: parsedJson.amount_in,
						},
						fee: parsedJson.fee_amount,
					};

				case "LiquidityAdded":
					return {
						...base,
						type: "add_liquidity",
						amounts: {
							tokenX: parsedJson.amount_x,
							tokenY: parsedJson.amount_y,
							liquidity: parsedJson.liquidity,
						},
					};

				case "LiquidityRemoved":
					return {
						...base,
						type: "remove_liquidity",
						amounts: {
							tokenX: parsedJson.amount_x,
							tokenY: parsedJson.amount_y,
							liquidity: parsedJson.liquidity,
						},
					};

				case "FlashSwapped":
					return {
						...base,
						type: "flash_swap",
						amounts: {
							tokenX: parsedJson.borrowed_x,
							tokenY: parsedJson.borrowed_y,
						},
					};

				default:
					return null;
			}
		} catch (error) {
			console.error("Error parsing event:", error);
			return null;
		}
	}
}
