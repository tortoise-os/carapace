"use client";

import type { TokenBalance } from "@carapace/sdk";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { useCarapaceSDK } from "@/providers/sui-provider";

interface UseTokenBalanceOptions {
	/** Refresh interval in milliseconds (default: 30000 = 30s) */
	refreshInterval?: number;
	/** Whether to start fetching immediately (default: true) */
	enabled?: boolean;
}

interface UseTokenBalanceResult {
	balance: bigint;
	formattedBalance: string;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	coins: Array<{ objectId: string; balance: bigint }>;
}

/**
 * Hook to fetch and track a single token balance for the connected wallet
 */
export function useTokenBalance(
	tokenAddress: string,
	decimals: number = 9,
	options: UseTokenBalanceOptions = {},
): UseTokenBalanceResult {
	const account = useCurrentAccount();
	const sdk = useCarapaceSDK();

	const { refreshInterval = 30000, enabled = true } = options;

	const [balance, setBalance] = useState<bigint>(0n);
	const [coins, setCoins] = useState<
		Array<{ objectId: string; balance: bigint }>
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchBalance = async () => {
		if (!account || !enabled) {
			setBalance(0n);
			setCoins([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const tokenBalance = await sdk.balance.getTokenBalance(
				account.address,
				tokenAddress,
			);

			setBalance(tokenBalance.totalBalance);
			setCoins(tokenBalance.coins);
		} catch (err) {
			console.error("Failed to fetch token balance:", err);
			setError(err instanceof Error ? err : new Error("Unknown error"));
			setBalance(0n);
			setCoins([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Initial fetch
	useEffect(() => {
		fetchBalance();
	}, [fetchBalance]);

	// Polling
	useEffect(() => {
		if (!enabled || refreshInterval <= 0) {
			return;
		}

		const interval = setInterval(fetchBalance, refreshInterval);
		return () => clearInterval(interval);
	}, [enabled, refreshInterval, fetchBalance]);

	const formattedBalance = sdk.balance.formatBalance(balance, decimals);

	return {
		balance,
		formattedBalance,
		isLoading,
		error,
		refetch: fetchBalance,
		coins,
	};
}

/**
 * Hook to fetch balances for multiple tokens
 */
export function useTokenBalances(
	tokens: Array<{ address: string; decimals: number }>,
	options: UseTokenBalanceOptions = {},
): Map<string, UseTokenBalanceResult> {
	const account = useCurrentAccount();
	const sdk = useCarapaceSDK();

	const { refreshInterval = 30000, enabled = true } = options;

	const [balances, setBalances] = useState<Map<string, TokenBalance>>(
		new Map(),
	);
	const [isLoading, setIsLoading] = useState(true);

	const fetchBalances = async () => {
		if (!account || !enabled) {
			setBalances(new Map());
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);

			const tokenBalances = await sdk.balance.getTokenBalances(
				account.address,
				tokens.map((t) => t.address),
			);

			setBalances(tokenBalances);
		} catch (err) {
			console.error("Failed to fetch token balances:", err);
			setBalances(new Map());
		} finally {
			setIsLoading(false);
		}
	};

	// Initial fetch
	useEffect(() => {
		fetchBalances();
	}, [fetchBalances]);

	// Polling
	useEffect(() => {
		if (!enabled || refreshInterval <= 0) {
			return;
		}

		const interval = setInterval(fetchBalances, refreshInterval);
		return () => clearInterval(interval);
	}, [enabled, refreshInterval, fetchBalances]);

	// Convert to result format
	const results = new Map<string, UseTokenBalanceResult>();

	for (const token of tokens) {
		const tokenBalance = balances.get(token.address);
		const balance = tokenBalance?.totalBalance ?? 0n;
		const coins = tokenBalance?.coins ?? [];

		results.set(token.address, {
			balance,
			formattedBalance: sdk.balance.formatBalance(balance, token.decimals),
			isLoading,
			error: null,
			refetch: fetchBalances,
			coins,
		});
	}

	return results;
}

/**
 * Hook to get all token balances for the connected wallet
 */
export function useAllTokenBalances(options: UseTokenBalanceOptions = {}): {
	balances: TokenBalance[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
} {
	const account = useCurrentAccount();
	const sdk = useCarapaceSDK();

	const { refreshInterval = 30000, enabled = true } = options;

	const [balances, setBalances] = useState<TokenBalance[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchBalances = async () => {
		if (!account || !enabled) {
			setBalances([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const allBalances = await sdk.balance.getAllBalances(account.address);
			setBalances(allBalances);
		} catch (err) {
			console.error("Failed to fetch all balances:", err);
			setError(err instanceof Error ? err : new Error("Unknown error"));
			setBalances([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Initial fetch
	useEffect(() => {
		fetchBalances();
	}, [fetchBalances]);

	// Polling
	useEffect(() => {
		if (!enabled || refreshInterval <= 0) {
			return;
		}

		const interval = setInterval(fetchBalances, refreshInterval);
		return () => clearInterval(interval);
	}, [enabled, refreshInterval, fetchBalances]);

	return {
		balances,
		isLoading,
		error,
		refetch: fetchBalances,
	};
}
