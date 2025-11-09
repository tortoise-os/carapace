"use client";

import { useEffect, useMemo, useState } from "react";
import type { Pool } from "../api-client";
import { RouteOptimizer, type SwapRoute } from "../services/route-optimizer";

export function useRouteOptimizer(
	pools: Pool[],
	tokenIn: string | null,
	tokenOut: string | null,
	amountIn: string,
) {
	const [routes, setRoutes] = useState<SwapRoute[]>([]);
	const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
	const [isCalculating, setIsCalculating] = useState(false);

	// Create optimizer instance
	const optimizer = useMemo(() => {
		if (pools.length === 0) return null;
		return new RouteOptimizer(pools, 3); // Max 3 hops
	}, [pools]);

	// Calculate routes when inputs change
	useEffect(() => {
		if (
			!optimizer ||
			!tokenIn ||
			!tokenOut ||
			!amountIn ||
			parseFloat(amountIn) <= 0
		) {
			setRoutes([]);
			return;
		}

		setIsCalculating(true);

		// Use setTimeout to avoid blocking the UI
		const timer = setTimeout(() => {
			try {
				const foundRoutes = optimizer.findAllRoutes(
					tokenIn,
					tokenOut,
					amountIn,
				);
				setRoutes(foundRoutes);
				setSelectedRouteIndex(0); // Reset to best route
			} catch (error) {
				console.error("Route calculation error:", error);
				setRoutes([]);
			} finally {
				setIsCalculating(false);
			}
		}, 300); // Debounce

		return () => clearTimeout(timer);
	}, [optimizer, tokenIn, tokenOut, amountIn]);

	// Get selected route
	const selectedRoute = routes.length > 0 ? routes[selectedRouteIndex] : null;

	// Get direct route (1 hop)
	const directRoute = useMemo(() => {
		return routes.find((route) => route.hops.length === 1) || null;
	}, [routes]);

	// Get best multi-hop route
	const bestMultiHopRoute = useMemo(() => {
		const multiHopRoutes = routes.filter((route) => route.hops.length > 1);
		return multiHopRoutes.length > 0 ? multiHopRoutes[0] : null;
	}, [routes]);

	// Calculate savings
	const savings = useMemo(() => {
		if (!directRoute || !bestMultiHopRoute) return null;

		const directOutput = parseFloat(directRoute.totalAmountOut);
		const multiHopOutput = parseFloat(bestMultiHopRoute.totalAmountOut);
		const savingsPercent =
			((multiHopOutput - directOutput) / directOutput) * 100;

		return {
			directOutput,
			multiHopOutput,
			savingsPercent,
			savingsAmount: (multiHopOutput - directOutput).toFixed(6),
		};
	}, [directRoute, bestMultiHopRoute]);

	return {
		routes,
		selectedRoute,
		selectedRouteIndex,
		setSelectedRouteIndex,
		directRoute,
		bestMultiHopRoute,
		savings,
		isCalculating,
		hasRoutes: routes.length > 0,
	};
}
