/**
 * Hook to fetch and manage pool data from the blockchain
 */

import type { CoinType } from "@carapace/sdk";
import { useEffect, useState } from "react";
import { useCarapaceSDK } from "@/providers/sui-provider";

export interface PoolInfo {
	poolId: string;
	tokenX: string;
	tokenY: string;
	reserveX: bigint;
	reserveY: bigint;
	lpSupply: bigint;
	feeBps: number;
}

export function usePools() {
	const sdk = useCarapaceSDK();
	const [pools, setPools] = useState<PoolInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		// For now, we'll maintain a hardcoded list of known pools
		// In production, this would query events to discover all pools
		const knownPools: string[] = [];

		const fetchPools = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const poolInfos = await Promise.all(
					knownPools.map(async (poolId) => {
						try {
							const pool = await sdk.pool.getPool(
								"0x2::sui::SUI" as CoinType,
								"0x2::sui::SUI" as CoinType,
								poolId,
							);
							return {
								poolId,
								tokenX: pool.tokenX,
								tokenY: pool.tokenY,
								reserveX: pool.reserveX,
								reserveY: pool.reserveY,
								lpSupply: pool.lpSupply,
								feeBps: pool.feeBps,
							};
						} catch (err) {
							console.error(`Failed to fetch pool ${poolId}:`, err);
							return null;
						}
					}),
				);

				setPools(poolInfos.filter((p): p is PoolInfo => p !== null));
			} catch (err) {
				setError(
					err instanceof Error ? err : new Error("Failed to fetch pools"),
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPools();
	}, [sdk]);

	const findPool = (tokenA: string, tokenB: string): PoolInfo | undefined => {
		return pools.find(
			(p) =>
				(p.tokenX === tokenA && p.tokenY === tokenB) ||
				(p.tokenX === tokenB && p.tokenY === tokenA),
		);
	};

	const refetch = () => {
		// Trigger re-fetch by updating state
		setIsLoading(true);
	};

	return {
		pools,
		isLoading,
		error,
		findPool,
		refetch,
	};
}

/**
 * Hook to get swap quote from SDK
 */
export function useSwapQuote(
	poolId: string | null,
	tokenIn: string,
	tokenOut: string,
	amountIn: bigint | null,
) {
	const sdk = useCarapaceSDK();
	const [quote, setQuote] = useState<{
		amountOut: bigint;
		fee: bigint;
		priceImpact: number;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!poolId || !amountIn || amountIn === 0n) {
			setQuote(null);
			return;
		}

		const fetchQuote = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const result = await sdk.pool.getSwapQuote(
					poolId,
					tokenIn as CoinType,
					tokenOut as CoinType,
					amountIn,
					true, // isXToY - determine based on token order
				);

				setQuote({
					amountOut: result.amountOut,
					fee: result.fee,
					priceImpact: result.priceImpact,
				});
			} catch (err) {
				console.error("Failed to get swap quote:", err);
				setError(err instanceof Error ? err : new Error("Failed to get quote"));
				setQuote(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuote();
	}, [sdk, poolId, tokenIn, tokenOut, amountIn]);

	return { quote, isLoading, error };
}
