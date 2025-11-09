/**
 * Analytics Routes (Elysia Plugin)
 * Provides protocol-wide and pool-specific analytics
 */

import type { CarapaceSDK } from "@carapace/sdk";
import { Elysia, t } from "elysia";
import { poolQueries } from "../db/client";
import { mockDataProvider } from "../db/mock-data";

interface ProtocolAnalytics {
	totalValueLocked: string; // USD value
	volume24h: string; // USD value
	volume7d: string; // USD value
	fees24h: string; // USD value
	fees7d: string; // USD value
	totalPools: number;
	totalTransactions: number;
}

interface PoolAnalytics {
	poolId: string;
	tvl: string; // USD value
	volume24h: string;
	volume7d: string;
	fees24h: string;
	fees7d: string;
	apr: number; // Annual percentage rate
}

/**
 * Calculate analytics from pools and transactions
 */
function calculateProtocolAnalytics(pools: any[]): ProtocolAnalytics {
	let totalTvl = 0;

	// Calculate TVL from all pools
	for (const pool of pools) {
		const reserveX = parseFloat(pool.reserve_x) / 10 ** 9; // Assume 9 decimals for SUI
		const reserveY = parseFloat(pool.reserve_y) / 10 ** 9;

		// For simplicity, assume 1 SUI = $2 (in production, use real oracle prices)
		const tvl = (reserveX + reserveY) * 2;
		totalTvl += tvl;
	}

	// Mock volume and fees data (in production, calculate from transaction history)
	const volume24h = totalTvl * 0.15; // 15% daily turnover
	const volume7d = volume24h * 7;
	const feeBps = 30; // 0.3% fee
	const fees24h = volume24h * (feeBps / 10000);
	const fees7d = volume7d * (feeBps / 10000);

	return {
		totalValueLocked: totalTvl.toFixed(2),
		volume24h: volume24h.toFixed(2),
		volume7d: volume7d.toFixed(2),
		fees24h: fees24h.toFixed(2),
		fees7d: fees7d.toFixed(2),
		totalPools: pools.length,
		totalTransactions: Math.floor(volume24h * 10), // Rough estimate
	};
}

function calculatePoolAnalytics(pool: any): PoolAnalytics {
	const reserveX = parseFloat(pool.reserve_x) / 10 ** 9;
	const reserveY = parseFloat(pool.reserve_y) / 10 ** 9;

	// TVL in USD (assume $2 per SUI)
	const tvl = (reserveX + reserveY) * 2;

	// Mock volume data
	const volume24h = tvl * 0.2; // 20% daily turnover
	const volume7d = volume24h * 7;

	// Calculate fees
	const feeBps = parseInt(pool.fee_bps) || 30;
	const fees24h = volume24h * (feeBps / 10000);
	const fees7d = volume7d * (feeBps / 10000);

	// Calculate APR from fees
	const apr = tvl > 0 ? ((fees7d * 52) / tvl) * 100 : 0;

	return {
		poolId: pool.pool_id,
		tvl: tvl.toFixed(2),
		volume24h: volume24h.toFixed(2),
		volume7d: volume7d.toFixed(2),
		fees24h: fees24h.toFixed(2),
		fees7d: fees7d.toFixed(2),
		apr: parseFloat(apr.toFixed(2)),
	};
}

export const createAnalyticsPlugin = new Elysia({ prefix: "/api/analytics" })
	/**
	 * GET /api/analytics/protocol
	 * Get protocol-wide analytics
	 */
	.get("/protocol", async () => {
		try {
			let pools;
			try {
				pools = await poolQueries.getAll(1000, 0);
				if (!pools || pools.length === 0) {
					pools = mockDataProvider.getAllPools(1000, 0);
				}
			} catch (dbError) {
				console.log("Database unavailable, using mock data");
				pools = mockDataProvider.getAllPools(1000, 0);
			}

			const analytics = calculateProtocolAnalytics(pools);

			return {
				success: true,
				data: analytics,
			};
		} catch (error) {
			console.error("Error fetching protocol analytics:", error);
			throw new Error("Failed to fetch protocol analytics");
		}
	})

	/**
	 * GET /api/analytics/pools
	 * Get analytics for all pools
	 */
	.get(
		"/pools",
		async ({ query }) => {
			try {
				const limit = Math.min(parseInt(query.limit as string) || 100, 1000);
				const offset = parseInt(query.offset as string) || 0;
				const sortBy = query.sortBy || "tvl"; // tvl, volume24h, apr
				const order = query.order || "desc"; // asc, desc

				let pools;
				try {
					pools = await poolQueries.getAll(limit, offset);
					if (!pools || pools.length === 0) {
						pools = mockDataProvider.getAllPools(limit, offset);
					}
				} catch (dbError) {
					console.log("Database unavailable, using mock data");
					pools = mockDataProvider.getAllPools(limit, offset);
				}

				// Calculate analytics for each pool
				const poolsWithAnalytics = pools.map((pool) => ({
					...pool,
					analytics: calculatePoolAnalytics(pool),
				}));

				// Sort by requested field
				poolsWithAnalytics.sort((a, b) => {
					const aVal = parseFloat(
						a.analytics[sortBy as keyof PoolAnalytics] as string,
					);
					const bVal = parseFloat(
						b.analytics[sortBy as keyof PoolAnalytics] as string,
					);
					return order === "desc" ? bVal - aVal : aVal - bVal;
				});

				return {
					success: true,
					data: poolsWithAnalytics,
					meta: {
						limit,
						offset,
						count: poolsWithAnalytics.length,
						sortBy,
						order,
					},
				};
			} catch (error) {
				console.error("Error fetching pool analytics:", error);
				throw new Error("Failed to fetch pool analytics");
			}
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
				sortBy: t.Optional(t.String()),
				order: t.Optional(t.String()),
			}),
		},
	)

	/**
	 * GET /api/analytics/pools/:id
	 * Get analytics for specific pool
	 */
	.get("/:id", async ({ params }) => {
		try {
			const { id } = params;

			let pool;
			try {
				pool = await poolQueries.getById(id);
				if (!pool) {
					pool = mockDataProvider.getPool(id);
				}
			} catch (dbError) {
				console.log("Database unavailable, using mock data");
				pool = mockDataProvider.getPool(id);
			}

			if (!pool) {
				throw new Error("Pool not found");
			}

			const analytics = calculatePoolAnalytics(pool);

			return {
				success: true,
				data: {
					pool,
					analytics,
				},
			};
		} catch (error) {
			console.error("Error fetching pool analytics:", error);
			throw new Error("Failed to fetch pool analytics");
		}
	});
