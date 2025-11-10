import type { Pool } from "../api-client";

export interface RouteHop {
	pool: Pool;
	tokenIn: string;
	tokenOut: string;
	amountIn: string;
	amountOut: string;
	priceImpact: number;
}

export interface SwapRoute {
	hops: RouteHop[];
	totalAmountIn: string;
	totalAmountOut: string;
	totalPriceImpact: number;
	totalFees: string;
	path: string[]; // Array of token addresses
}

export class RouteOptimizer {
	private pools: Pool[];
	private maxHops: number;

	constructor(pools: Pool[], maxHops: number = 3) {
		this.pools = pools;
		this.maxHops = maxHops;
	}

	/**
	 * Find all possible routes between two tokens
	 */
	findAllRoutes(
		tokenIn: string,
		tokenOut: string,
		amountIn: string,
	): SwapRoute[] {
		const routes: SwapRoute[] = [];
		const visited = new Set<string>();

		// DFS to find all possible paths
		this.dfs(tokenIn, tokenOut, amountIn, [], visited, routes, 0);

		// Sort routes by best output amount
		return routes.sort(
			(a, b) => parseFloat(b.totalAmountOut) - parseFloat(a.totalAmountOut),
		);
	}

	/**
	 * Find the optimal route with best output
	 */
	findBestRoute(
		tokenIn: string,
		tokenOut: string,
		amountIn: string,
	): SwapRoute | null {
		const routes = this.findAllRoutes(tokenIn, tokenOut, amountIn);
		return routes.length > 0 ? (routes[0] ?? null) : null;
	}

	/**
	 * Depth-first search to find all paths
	 */
	private dfs(
		currentToken: string,
		targetToken: string,
		amountIn: string,
		path: RouteHop[],
		visited: Set<string>,
		routes: SwapRoute[],
		depth: number,
	): void {
		// Base cases
		if (depth > this.maxHops) return;
		if (visited.has(currentToken)) return;

		// Found target
		if (currentToken === targetToken && path.length > 0) {
			routes.push(this.buildRoute(path));
			return;
		}

		visited.add(currentToken);

		// Find all pools with currentToken
		const availablePools = this.pools.filter(
			(pool) => pool.token_x === currentToken || pool.token_y === currentToken,
		);

		for (const pool of availablePools) {
			const nextToken =
				pool.token_x === currentToken ? pool.token_y : pool.token_x;

			// Skip if already visited
			if (visited.has(nextToken)) continue;

			// Calculate swap output for this hop
			const hop = this.calculateHop(pool, currentToken, nextToken, amountIn);

			if (hop) {
				path.push(hop);
				this.dfs(
					nextToken,
					targetToken,
					hop.amountOut,
					path,
					visited,
					routes,
					depth + 1,
				);
				path.pop();
			}
		}

		visited.delete(currentToken);
	}

	/**
	 * Calculate output amount for a single hop using constant product formula
	 */
	private calculateHop(
		pool: Pool,
		tokenIn: string,
		tokenOut: string,
		amountIn: string,
	): RouteHop | null {
		const isXtoY = pool.token_x === tokenIn;
		const reserveIn = isXtoY ? BigInt(pool.reserve_x) : BigInt(pool.reserve_y);
		const reserveOut = isXtoY ? BigInt(pool.reserve_y) : BigInt(pool.reserve_x);

		const amountInBigInt = BigInt(Math.floor(parseFloat(amountIn) * 1e9));

		// Apply fee (e.g., 0.3% = 9970/10000)
		const feeRate = BigInt(pool.fee_rate);
		const amountInWithFee =
			(amountInBigInt * (BigInt(10000) - feeRate)) / BigInt(10000);

		// Constant product formula: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
		const numerator = amountInWithFee * reserveOut;
		const denominator = reserveIn + amountInWithFee;
		const amountOut = numerator / denominator;

		// Calculate price impact
		const priceImpact =
			(Number(amountInWithFee) /
				(Number(reserveIn) + Number(amountInWithFee))) *
			100;

		return {
			pool,
			tokenIn,
			tokenOut,
			amountIn,
			amountOut: (Number(amountOut) / 1e9).toFixed(6),
			priceImpact,
		};
	}

	/**
	 * Build a complete route from hops
	 */
	private buildRoute(hops: RouteHop[]): SwapRoute {
		if (hops.length === 0) {
			throw new Error("Cannot build route from empty hops array");
		}

		const firstHop = hops[0];
		if (!firstHop) {
			throw new Error("First hop is undefined");
		}

		const path = [firstHop.tokenIn, ...hops.map((hop) => hop.tokenOut)];

		const totalAmountIn = firstHop.amountIn;
		const lastHop = hops[hops.length - 1];
		if (!lastHop) {
			throw new Error("Last hop is undefined");
		}
		const totalAmountOut = lastHop.amountOut;

		// Calculate total price impact (multiplicative)
		const totalPriceImpact =
			hops.reduce((acc, hop) => acc * (1 + hop.priceImpact / 100), 1) - 1;

		// Calculate total fees
		const totalFees = hops.reduce((acc, hop) => {
			const feeAmount = (parseFloat(hop.amountIn) * hop.pool.fee_rate) / 10000;
			return acc + feeAmount;
		}, 0);

		return {
			hops,
			totalAmountIn,
			totalAmountOut,
			totalPriceImpact: totalPriceImpact * 100,
			totalFees: totalFees.toFixed(6),
			path,
		};
	}

	/**
	 * Compare direct swap vs multi-hop
	 */
	compareRoutes(
		tokenIn: string,
		tokenOut: string,
		amountIn: string,
	): {
		directRoute: SwapRoute | null;
		bestMultiHopRoute: SwapRoute | null;
		savingsPercent: number;
	} {
		const allRoutes = this.findAllRoutes(tokenIn, tokenOut, amountIn);

		// Find direct route (1 hop)
		const directRoute =
			allRoutes.find((route) => route.hops.length === 1) || null;

		// Find best multi-hop route (2+ hops)
		const multiHopRoutes = allRoutes.filter((route) => route.hops.length > 1);
		const bestMultiHopRoute: SwapRoute | null =
			multiHopRoutes.length > 0 ? (multiHopRoutes[0] ?? null) : null;

		let savingsPercent = 0;
		if (directRoute && bestMultiHopRoute) {
			const directOutput = parseFloat(directRoute.totalAmountOut);
			const multiHopOutput = parseFloat(bestMultiHopRoute.totalAmountOut);
			savingsPercent = ((multiHopOutput - directOutput) / directOutput) * 100;
		}

		return {
			directRoute,
			bestMultiHopRoute,
			savingsPercent,
		};
	}
}
