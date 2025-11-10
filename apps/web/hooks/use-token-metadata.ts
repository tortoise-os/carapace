"use client";

import type { TokenMetadata } from "@carapace/sdk";
import { useEffect, useState } from "react";
import { useCarapaceSDK } from "@/providers/sui-provider";

export interface UseTokenMetadataResult {
	metadata: TokenMetadata | null;
	loading: boolean;
	error: Error | null;
}

/**
 * Hook to fetch and cache token metadata
 * @param coinType - The full coin type (e.g., '0x2::sui::SUI')
 * @returns Token metadata, loading state, and error
 */
export function useTokenMetadata(
	coinType: string | undefined,
): UseTokenMetadataResult {
	const sdk = useCarapaceSDK();
	const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!coinType || !sdk) {
			setLoading(false);
			return;
		}

		let cancelled = false;

		async function fetchMetadata() {
			try {
				setLoading(true);
				setError(null);

				const data = await sdk.tokenMetadata.getTokenMetadata(coinType!);

				if (!cancelled) {
					setMetadata(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err
							: new Error("Failed to fetch token metadata"),
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		fetchMetadata();

		return () => {
			cancelled = true;
		};
	}, [coinType, sdk]);

	return { metadata, loading, error };
}

/**
 * Hook to fetch metadata for multiple tokens
 */
export function useTokensMetadata(coinTypes: string[]): {
	metadataMap: Map<string, TokenMetadata>;
	loading: boolean;
	error: Error | null;
} {
	const sdk = useCarapaceSDK();
	const [metadataMap, setMetadataMap] = useState<Map<string, TokenMetadata>>(
		new Map(),
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!sdk || coinTypes.length === 0) {
			setLoading(false);
			return;
		}

		let cancelled = false;

		async function fetchMetadata() {
			try {
				setLoading(true);
				setError(null);

				const promises = coinTypes.map((coinType) =>
					sdk.tokenMetadata.getTokenMetadata(coinType),
				);

				const results = await Promise.all(promises);

				if (!cancelled) {
					const map = new Map<string, TokenMetadata>();
					results.forEach((metadata, index) => {
						map.set(coinTypes[index]!, metadata);
					});
					setMetadataMap(map);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err
							: new Error("Failed to fetch tokens metadata"),
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		fetchMetadata();

		return () => {
			cancelled = true;
		};
	}, [sdk, coinTypes]);

	return { metadataMap, loading, error };
}
