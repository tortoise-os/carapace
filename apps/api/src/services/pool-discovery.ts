/**
 * Pool Discovery Service
 * Automatically discovers and tracks pools on Sui blockchain
 */

import type { CarapaceSDK } from "@carapace/sdk";
import { config } from "../config";

export interface DiscoveredPool {
	poolId: string;
	tokenX: string;
	tokenY: string;
	discoveredAt: Date;
	transactionDigest: string;
}

export class PoolDiscoveryService {
	private discoveredPools: Map<string, DiscoveredPool> = new Map();
	private isScanning = false;
	private scanInterval?: NodeJS.Timeout;

	constructor(private sdk: CarapaceSDK) {}

	/**
	 * Start automatic pool discovery
	 */
	async start(intervalMs: number = 60000): Promise<void> {
		console.log("🔍 Starting pool discovery service...");

		// Initial scan
		await this.scanForPools();

		// Schedule periodic scans
		this.scanInterval = setInterval(async () => {
			if (!this.isScanning) {
				await this.scanForPools();
			}
		}, intervalMs);

		console.log(
			`✅ Pool discovery service started (scanning every ${intervalMs / 1000}s)`,
		);
	}

	/**
	 * Stop automatic pool discovery
	 */
	stop(): void {
		if (this.scanInterval) {
			clearInterval(this.scanInterval);
			this.scanInterval = undefined;
			console.log("🛑 Pool discovery service stopped");
		}
	}

	/**
	 * Scan blockchain for pool creation events
	 */
	async scanForPools(): Promise<DiscoveredPool[]> {
		if (this.isScanning) {
			console.log("⏭️  Scan already in progress, skipping...");
			return [];
		}

		this.isScanning = true;
		const newPools: DiscoveredPool[] = [];

		try {
			console.log("🔍 Scanning for pools...");

			// Query for PoolCreated events
			const response = await this.sdk.client.queryEvents({
				query: {
					MoveEventType: `${config.sui.packageIds.carapace}::pool::PoolCreated`,
				},
				limit: 50, // Get last 50 pool creations
			});

			console.log(`📊 Found ${response.data.length} PoolCreated events`);

			for (const event of response.data) {
				try {
					const poolId = (event.parsedJson as any)?.pool_id;
					const tokenX = (event.parsedJson as any)?.token_x;
					const tokenY = (event.parsedJson as any)?.token_y;

					if (poolId && typeof poolId === "string") {
						// Check if we already know about this pool
						if (!this.discoveredPools.has(poolId)) {
							const discoveredPool: DiscoveredPool = {
								poolId,
								tokenX: tokenX || "unknown",
								tokenY: tokenY || "unknown",
								discoveredAt: new Date(Number(event.timestampMs)),
								transactionDigest: event.id.txDigest,
							};

							this.discoveredPools.set(poolId, discoveredPool);
							newPools.push(discoveredPool);

							console.log(`✨ New pool discovered: ${poolId}`);
							console.log(`   Token X: ${discoveredPool.tokenX}`);
							console.log(`   Token Y: ${discoveredPool.tokenY}`);
						}
					}
				} catch (error: any) {
					console.error(`Error processing event:`, error.message);
				}
			}

			if (newPools.length > 0) {
				console.log(`✅ Discovered ${newPools.length} new pool(s)`);
			} else {
				console.log(`✓ No new pools found`);
			}

			return newPools;
		} catch (error: any) {
			console.error("❌ Error scanning for pools:", error.message);
			return [];
		} finally {
			this.isScanning = false;
		}
	}

	/**
	 * Get all discovered pools
	 */
	getAllDiscoveredPools(): DiscoveredPool[] {
		return Array.from(this.discoveredPools.values());
	}

	/**
	 * Get pool IDs only
	 */
	getPoolIds(): string[] {
		return Array.from(this.discoveredPools.keys());
	}

	/**
	 * Check if a pool is known
	 */
	hasPool(poolId: string): boolean {
		return this.discoveredPools.has(poolId);
	}

	/**
	 * Manually add a pool
	 */
	addPool(pool: DiscoveredPool): void {
		this.discoveredPools.set(pool.poolId, pool);
		console.log(`➕ Manually added pool: ${pool.poolId}`);
	}

	/**
	 * Get pool count
	 */
	getPoolCount(): number {
		return this.discoveredPools.size;
	}

	/**
	 * Scan for pools created in a specific time range
	 */
	async scanTimeRange(
		startTime: Date,
		endTime: Date,
	): Promise<DiscoveredPool[]> {
		const discovered: DiscoveredPool[] = [];

		try {
			let cursor: string | null = null;
			let hasMore = true;

			while (hasMore) {
				const response = await this.sdk.client.queryEvents({
					query: {
						MoveEventType: `${config.sui.packageIds.carapace}::pool::PoolCreated`,
					},
					limit: 50,
					cursor: cursor || undefined,
				});

				for (const event of response.data) {
					const eventTime = new Date(Number(event.timestampMs));

					// Check if event is in time range
					if (eventTime >= startTime && eventTime <= endTime) {
						const poolId = (event.parsedJson as any)?.pool_id;
						const tokenX = (event.parsedJson as any)?.token_x;
						const tokenY = (event.parsedJson as any)?.token_y;

						if (poolId && typeof poolId === "string") {
							const pool: DiscoveredPool = {
								poolId,
								tokenX: tokenX || "unknown",
								tokenY: tokenY || "unknown",
								discoveredAt: eventTime,
								transactionDigest: event.id.txDigest,
							};

							discovered.push(pool);

							if (!this.discoveredPools.has(poolId)) {
								this.discoveredPools.set(poolId, pool);
							}
						}
					}

					// Stop if we've gone past the end time
					if (eventTime > endTime) {
						hasMore = false;
						break;
					}
				}

				// Check if there are more results
				if (response.hasNextPage && response.nextCursor) {
					cursor = response.nextCursor as string;
				} else {
					hasMore = false;
				}
			}

			return discovered;
		} catch (error: any) {
			console.error("Error scanning time range:", error.message);
			return discovered;
		}
	}
}
