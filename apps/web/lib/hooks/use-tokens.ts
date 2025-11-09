"use client";

import { useEffect, useState } from "react";
import { apiClient, type Token, type TokenListResponse } from "../api-client";

export interface UseTokensOptions {
	enabled?: boolean;
	verified?: boolean;
	autoRefresh?: boolean;
	refreshInterval?: number;
}

export interface UseTokensReturn {
	tokens: Token[];
	loading: boolean;
	error: Error | null;
	refresh: () => Promise<void>;
}

export function useTokens(options: UseTokensOptions = {}): UseTokensReturn {
	const {
		enabled,
		verified,
		autoRefresh = false,
		refreshInterval = 30000,
	} = options;

	const [tokens, setTokens] = useState<Token[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchTokens = async () => {
		try {
			setLoading(true);
			setError(null);
			const response: TokenListResponse = await apiClient.getTokens({
				enabled,
				verified,
			});
			setTokens(response.tokens);
		} catch (err) {
			setError(err as Error);
			console.error("Failed to fetch tokens:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTokens();

		if (autoRefresh) {
			const interval = setInterval(fetchTokens, refreshInterval);
			return () => clearInterval(interval);
		}
	}, [autoRefresh, refreshInterval, fetchTokens]);

	return {
		tokens,
		loading,
		error,
		refresh: fetchTokens,
	};
}

export interface UseTokenReturn {
	token: Token | null;
	loading: boolean;
	error: Error | null;
}

export function useToken(id: string): UseTokenReturn {
	const [token, setToken] = useState<Token | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await apiClient.getToken(id);
				setToken(data);
			} catch (err) {
				setError(err as Error);
				console.error("Failed to fetch token:", err);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchToken();
		}
	}, [id]);

	return { token, loading, error };
}
