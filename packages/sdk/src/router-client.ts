/**
 * Router Client
 * Implements multi-hop routing to find optimal swap paths
 */

import { Transaction } from "@mysten/sui/transactions";

export interface Pool {
	id: string;
	tokenX: string;
	tokenY: string;
	reserveX: string;
	reserveY: string;
	feeBps: string;
}

export interface SwapRoute {
	path: string[]; // Array of token addresses
	pools: string[]; // Array of pool IDs
	expectedOutput: bigint;
	priceImpact: number;
	minimumOutput: bigint;
}

export class RouterClient {
	constructor(private packageId: string) {}

	/**
	 * Find the best route for a swap
	 * Uses Dijkstra's algorithm to find optimal path through available pools
	 */
	async findBestRoute(
		tokenIn: string,
		tokenOut: string,
		amountIn: bigint,
		pools: Pool[],
		maxHops: number = 3,
	): Promise<SwapRoute | null> {
		// Build adjacency graph
		const graph = this.buildPoolGraph(pools);

		// Find all possible paths (up to maxHops)
		const paths = this.findAllPaths(graph, tokenIn, tokenOut, maxHops);

		if (paths.length === 0) {
			return null;
		}

		// Calculate expected output for each path
		const routes: SwapRoute[] = [];

		for (const path of paths) {
			const route = this.calculateRouteOutput(path, amountIn, pools);
			if (route) {
				routes.push(route);
			}
		}

		// Sort by expected output (descending)
		routes.sort((a, b) => (b.expectedOutput > a.expectedOutput ? 1 : -1));

		return routes[0] || null;
	}

	/**
	 * Build transaction for multi-hop swap
	 */
	buildMultiHopSwap(
		route: SwapRoute,
		amountIn: bigint,
		slippageBps: number = 50, // 0.5%
	): Transaction {
		const tx = new Transaction();

		// Calculate minimum output with slippage
		const minOutput =
			(route.expectedOutput * BigInt(10000 - slippageBps)) / BigInt(10000);

		// For now, we'll support up to 3 hops
		// In production, this would be more dynamic

		if (route.pools.length === 1) {
			// Direct swap - single pool
			const [coinIn] = tx.splitCoins(tx.gas, [tx.pure.u64(amountIn)]);

			const coinOut = tx.moveCall({
				target: `${this.packageId}::pool::swap_x_to_y`,
				arguments: [
					tx.object(route.pools[0]!),
					coinIn!,
					tx.pure.u64(minOutput),
				],
				typeArguments: [route.path[0]!, route.path[1]!],
			});

			tx.transferObjects([coinOut], tx.pure.address("sender"));
		} else if (route.pools.length === 2) {
			// Two-hop swap
			const [coinIn] = tx.splitCoins(tx.gas, [tx.pure.u64(amountIn)]);

			// First swap
			const coinIntermediate = tx.moveCall({
				target: `${this.packageId}::pool::swap_x_to_y`,
				arguments: [
					tx.object(route.pools[0]!),
					coinIn!,
					tx.pure.u64(0), // No slippage check on intermediate
				],
				typeArguments: [route.path[0]!, route.path[1]!],
			});

			// Second swap
			const coinOut = tx.moveCall({
				target: `${this.packageId}::pool::swap_x_to_y`,
				arguments: [
					tx.object(route.pools[1]!),
					coinIntermediate,
					tx.pure.u64(minOutput), // Apply slippage on final output
				],
				typeArguments: [route.path[1]!, route.path[2]!],
			});

			tx.transferObjects([coinOut], tx.pure.address("sender"));
		} else if (route.pools.length === 3) {
			// Three-hop swap
			const [coinIn] = tx.splitCoins(tx.gas, [tx.pure.u64(amountIn)]);

			const coin1 = tx.moveCall({
				target: `${this.packageId}::pool::swap_x_to_y`,
				arguments: [tx.object(route.pools[0]!), coinIn!, tx.pure.u64(0)],
				typeArguments: [route.path[0]!, route.path[1]!],
			});

			const coin2 = tx.moveCall({
				target: `${this.packageId}::pool::swap_x_to_y`,
				arguments: [tx.object(route.pools[1]!), coin1, tx.pure.u64(0)],
				typeArguments: [route.path[1]!, route.path[2]!],
			});

			const coinOut = tx.moveCall({
				target: `${this.packageId}::pool::swap_x_to_y`,
				arguments: [tx.object(route.pools[2]!), coin2, tx.pure.u64(minOutput)],
				typeArguments: [route.path[2]!, route.path[3]!],
			});

			tx.transferObjects([coinOut], tx.pure.address("sender"));
		}

		return tx;
	}

	/**
	 * Build pool graph for pathfinding
	 */
	private buildPoolGraph(pools: Pool[]): Map<string, Map<string, Pool>> {
		const graph = new Map<string, Map<string, Pool>>();

		for (const pool of pools) {
			// Add edge from tokenX to tokenY
			if (!graph.has(pool.tokenX)) {
				graph.set(pool.tokenX, new Map());
			}
			graph.get(pool.tokenX)!.set(pool.tokenY, pool);

			// Add edge from tokenY to tokenX
			if (!graph.has(pool.tokenY)) {
				graph.set(pool.tokenY, new Map());
			}
			graph.get(pool.tokenY)!.set(pool.tokenX, pool);
		}

		return graph;
	}

	/**
	 * Find all paths between two tokens using DFS
	 */
	private findAllPaths(
		graph: Map<string, Map<string, Pool>>,
		start: string,
		end: string,
		maxHops: number,
	): string[][] {
		const paths: string[][] = [];
		const visited = new Set<string>();

		const dfs = (current: string, path: string[]) => {
			if (path.length > maxHops + 1) return; // +1 because path includes tokens

			if (current === end) {
				paths.push([...path]);
				return;
			}

			visited.add(current);

			const neighbors = graph.get(current);
			if (neighbors) {
				for (const [next] of neighbors) {
					if (!visited.has(next)) {
						dfs(next, [...path, next]);
					}
				}
			}

			visited.delete(current);
		};

		dfs(start, [start]);
		return paths;
	}

	/**
	 * Calculate expected output for a route
	 */
	private calculateRouteOutput(
		path: string[],
		amountIn: bigint,
		pools: Pool[],
	): SwapRoute | null {
		let currentAmount = amountIn;
		const routePools: string[] = [];

		// Simulate swaps through each hop
		for (let i = 0; i < path.length - 1; i++) {
			const tokenIn = path[i]!;
			const tokenOut = path[i + 1]!;

			// Find pool for this pair
			const pool = pools.find(
				(p) =>
					(p.tokenX === tokenIn && p.tokenY === tokenOut) ||
					(p.tokenY === tokenIn && p.tokenX === tokenOut),
			);

			if (!pool) {
				return null; // No pool for this hop
			}

			routePools.push(pool.id);

			// Calculate output for this swap
			const isXToY = pool.tokenX === tokenIn;
			const reserveIn = BigInt(isXToY ? pool.reserveX : pool.reserveY);
			const reserveOut = BigInt(isXToY ? pool.reserveY : pool.reserveX);
			const feeBps = BigInt(pool.feeBps);

			currentAmount = this.getAmountOut(
				currentAmount,
				reserveIn,
				reserveOut,
				feeBps,
			);
		}

		// Calculate price impact
		const priceImpact = this.calculatePriceImpact(
			amountIn,
			currentAmount,
			path,
			pools,
		);

		return {
			path,
			pools: routePools,
			expectedOutput: currentAmount,
			priceImpact,
			minimumOutput: (currentAmount * BigInt(9950)) / BigInt(10000), // 0.5% slippage
		};
	}

	/**
	 * Calculate amount out for a single swap (constant product formula)
	 */
	private getAmountOut(
		amountIn: bigint,
		reserveIn: bigint,
		reserveOut: bigint,
		feeBps: bigint,
	): bigint {
		// Calculate fee
		const fee = (amountIn * feeBps) / BigInt(10000);
		const amountInAfterFee = amountIn - fee;

		// Constant product formula
		const numerator = amountInAfterFee * reserveOut;
		const denominator = reserveIn + amountInAfterFee;

		return numerator / denominator;
	}

	/**
	 * Calculate price impact percentage
	 */
	private calculatePriceImpact(
		amountIn: bigint,
		amountOut: bigint,
		path: string[],
		pools: Pool[],
	): number {
		// For simplicity, calculate based on first and last token
		// In production, this would be more sophisticated

		if (path.length === 2) {
			const pool = pools.find(
				(p) =>
					(p.tokenX === path[0] && p.tokenY === path[1]) ||
					(p.tokenY === path[0] && p.tokenX === path[1]),
			);

			if (!pool) return 0;

			const isXToY = pool.tokenX === path[0];
			const reserveIn = BigInt(isXToY ? pool.reserveX : pool.reserveY);
			const reserveOut = BigInt(isXToY ? pool.reserveY : pool.reserveX);

			// Spot price before swap
			const spotPriceBefore = Number(reserveOut) / Number(reserveIn);

			// Effective price of this swap
			const effectivePrice = Number(amountOut) / Number(amountIn);

			// Price impact = (effectivePrice - spotPrice) / spotPrice * 100
			const impact =
				((effectivePrice - spotPriceBefore) / spotPriceBefore) * 100;

			return Math.abs(impact);
		}

		// For multi-hop, estimate based on total reserves
		return 0; // Placeholder
	}
}
