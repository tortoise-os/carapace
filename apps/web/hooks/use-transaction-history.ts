"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

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

export interface UseTransactionHistoryResult {
	transactions: Transaction[];
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	hasNextPage: boolean;
	loadMore: () => Promise<void>;
}

/**
 * Hook to fetch transaction history for the current user
 */
export function useTransactionHistory(
	options: {
		limit?: number;
		poolId?: string;
		type?: string;
		enabled?: boolean;
	} = {},
): UseTransactionHistoryResult {
	const account = useCurrentAccount();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [cursor, setCursor] = useState<string | null>(null);

	const { limit = 20, poolId, type, enabled = true } = options;

	const fetchTransactions = async (loadMore = false) => {
		if (!account?.address || !enabled) {
			setLoading(false);
			return;
		}

		try {
			if (!loadMore) {
				setLoading(true);
			}
			setError(null);

			const params = new URLSearchParams({
				limit: limit.toString(),
				...(loadMore && cursor ? { cursor } : {}),
				...(poolId ? { poolId } : {}),
				...(type ? { type } : {}),
			});

			const response = await fetch(
				`http://localhost:3501/transactions/history/${account.address}?${params}`,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch transaction history");
			}

			const result = await response.json();

			if (loadMore) {
				setTransactions((prev) => [...prev, ...result.data.transactions]);
			} else {
				setTransactions(result.data.transactions);
			}

			setHasNextPage(result.data.hasNextPage);
			setCursor(result.data.nextCursor);
		} catch (err) {
			setError(
				err instanceof Error
					? err
					: new Error("Failed to fetch transaction history"),
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	return {
		transactions,
		loading,
		error,
		refetch: () => fetchTransactions(false),
		hasNextPage,
		loadMore: () => fetchTransactions(true),
	};
}

/**
 * Hook to fetch transaction history for a specific pool
 */
export function usePoolTransactionHistory(
	poolId: string | undefined,
	options: {
		limit?: number;
		enabled?: boolean;
	} = {},
): UseTransactionHistoryResult {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [cursor, setCursor] = useState<string | null>(null);

	const { limit = 20, enabled = true } = options;

	const fetchTransactions = async (loadMore = false) => {
		if (!poolId || !enabled) {
			setLoading(false);
			return;
		}

		try {
			if (!loadMore) {
				setLoading(true);
			}
			setError(null);

			const params = new URLSearchParams({
				limit: limit.toString(),
				...(loadMore && cursor ? { cursor } : {}),
			});

			const response = await fetch(
				`http://localhost:3501/transactions/pool/${poolId}?${params}`,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch pool transaction history");
			}

			const result = await response.json();

			if (loadMore) {
				setTransactions((prev) => [...prev, ...result.data.transactions]);
			} else {
				setTransactions(result.data.transactions);
			}

			setHasNextPage(result.data.hasNextPage);
			setCursor(result.data.nextCursor);
		} catch (err) {
			setError(
				err instanceof Error
					? err
					: new Error("Failed to fetch pool transaction history"),
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	return {
		transactions,
		loading,
		error,
		refetch: () => fetchTransactions(false),
		hasNextPage,
		loadMore: () => fetchTransactions(true),
	};
}

/**
 * Format transaction type for display
 */
export function formatTransactionType(type: string): string {
	switch (type) {
		case "swap":
			return "Swap";
		case "add_liquidity":
			return "Add Liquidity";
		case "remove_liquidity":
			return "Remove Liquidity";
		case "flash_swap":
			return "Flash Swap";
		default:
			return type;
	}
}

/**
 * Format transaction timestamp
 */
export function formatTransactionTime(timestamp: number): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	// Less than 1 minute
	if (diff < 60000) {
		return "Just now";
	}

	// Less than 1 hour
	if (diff < 3600000) {
		const minutes = Math.floor(diff / 60000);
		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	}

	// Less than 1 day
	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000);
		return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	}

	// Less than 1 week
	if (diff < 604800000) {
		const days = Math.floor(diff / 86400000);
		return `${days} day${days > 1 ? "s" : ""} ago`;
	}

	// Format as date
	return date.toLocaleDateString();
}
