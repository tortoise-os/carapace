import type { SuiClient } from "@mysten/sui/client";
import type { TokenMetadata } from "../types/token";

/**
 * Service for fetching and caching token metadata
 * Priority: Sui on-chain metadata -> Static registry -> Default fallback
 */
export class TokenMetadataService {
	private cache = new Map<string, TokenMetadata>();
	private pendingRequests = new Map<string, Promise<TokenMetadata>>();
	private suiClient: SuiClient;

	constructor(suiClient: SuiClient) {
		this.suiClient = suiClient;
	}

	/**
	 * Get token metadata with caching and fallbacks
	 */
	async getTokenMetadata(coinType: string): Promise<TokenMetadata> {
		// 1. Check cache first
		if (this.cache.has(coinType)) {
			return this.cache.get(coinType)!;
		}

		// 2. Check if there's already a pending request for this token
		if (this.pendingRequests.has(coinType)) {
			return this.pendingRequests.get(coinType)!;
		}

		// 3. Create new request
		const request = this.fetchTokenMetadata(coinType);
		this.pendingRequests.set(coinType, request);

		try {
			const metadata = await request;
			this.cache.set(coinType, metadata);
			return metadata;
		} finally {
			this.pendingRequests.delete(coinType);
		}
	}

	/**
	 * Fetch token metadata from various sources
	 */
	private async fetchTokenMetadata(coinType: string): Promise<TokenMetadata> {
		// Try Sui on-chain metadata first
		try {
			const onChainMetadata = await this.fetchSuiMetadata(coinType);
			if (onChainMetadata) {
				return onChainMetadata;
			}
		} catch (error) {
			console.warn(`Failed to fetch on-chain metadata for ${coinType}:`, error);
		}

		// Fallback to static registry
		const staticMetadata = this.getStaticMetadata(coinType);
		if (staticMetadata) {
			return staticMetadata;
		}

		// Final fallback to default
		return this.getDefaultMetadata(coinType);
	}

	/**
	 * Fetch metadata from Sui blockchain
	 */
	private async fetchSuiMetadata(
		coinType: string,
	): Promise<TokenMetadata | null> {
		try {
			const metadata = await this.suiClient.getCoinMetadata({ coinType });

			if (!metadata) {
				return null;
			}

			return {
				coinType,
				symbol: metadata.symbol,
				name: metadata.name,
				decimals: metadata.decimals,
				iconUrl: metadata.iconUrl || undefined,
				description: metadata.description,
			};
		} catch (error) {
			console.error("Error fetching Sui metadata:", error);
			return null;
		}
	}

	/**
	 * Get metadata from static registry
	 * This is a fallback for well-known tokens
	 */
	private getStaticMetadata(coinType: string): TokenMetadata | null {
		const staticRegistry: Record<string, TokenMetadata> = {
			"0x2::sui::SUI": {
				coinType: "0x2::sui::SUI",
				symbol: "SUI",
				name: "Sui",
				decimals: 9,
				iconUrl:
					"https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
				description: "The native token of the Sui blockchain",
				metadata: {
					coingeckoId: "sui",
					website: "https://sui.io",
					twitter: "https://twitter.com/SuiNetwork",
				},
			},
			// Add more well-known tokens here
		};

		return staticRegistry[coinType] || null;
	}

	/**
	 * Generate default metadata when no other source is available
	 */
	private getDefaultMetadata(coinType: string): TokenMetadata {
		// Extract symbol from coin type (e.g., '0x...::usdc::USDC' -> 'USDC')
		const parts = coinType.split("::");
		const symbol = parts[parts.length - 1]?.toUpperCase() || "UNKNOWN";

		return {
			coinType,
			symbol,
			name: symbol,
			decimals: 9, // Default decimals
			description: "Unknown token",
		};
	}

	/**
	 * Preload metadata for multiple tokens
	 */
	async preloadTokens(coinTypes: string[]): Promise<void> {
		await Promise.allSettled(
			coinTypes.map((coinType) => this.getTokenMetadata(coinType)),
		);
	}

	/**
	 * Clear cache
	 */
	clearCache(): void {
		this.cache.clear();
	}

	/**
	 * Get cache size
	 */
	getCacheSize(): number {
		return this.cache.size;
	}
}
