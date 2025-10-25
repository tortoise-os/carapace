/**
 * Oracle Client - Fetch token prices from Pyth Network
 */

import type { Network } from './types';

/**
 * Pyth price feed IDs for tokens
 * See: https://pyth.network/developers/price-feed-ids
 */
export const PYTH_PRICE_FEED_IDS = {
  'SUI': '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  'USDC': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
} as const;

/**
 * Pyth Hermes API endpoint
 * For testnet, use: https://hermes-beta.pyth.network
 * For mainnet, use: https://hermes.pyth.network
 * For devnet/localnet, fallback to testnet
 */
const HERMES_ENDPOINTS: Record<Network, string> = {
  mainnet: 'https://hermes.pyth.network',
  testnet: 'https://hermes-beta.pyth.network',
  devnet: 'https://hermes-beta.pyth.network',
  localnet: 'https://hermes-beta.pyth.network',
};

interface PythPriceData {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

interface PythPriceResponse {
  parsed: PythPriceData[];
}

export interface TokenPrice {
  symbol: string;
  price: number;
  confidence: number;
  publishTime: number;
  exponent: number;
}

interface CachedPrice extends TokenPrice {
  cachedAt: number;
}

export class OracleClient {
  private hermesUrl: string;
  private priceCache: Map<string, CachedPrice> = new Map();
  private cacheDuration: number;

  constructor(
    network: Network = 'testnet',
    options: { cacheDuration?: number } = {}
  ) {
    this.hermesUrl = HERMES_ENDPOINTS[network];
    this.cacheDuration = options.cacheDuration ?? 60_000; // 1 minute default
  }

  /**
   * Get the current USD price for a token symbol
   */
  async getPrice(symbol: string): Promise<number> {
    const tokenPrice = await this.getTokenPrice(symbol);
    return tokenPrice.price;
  }

  /**
   * Get detailed price data for a token symbol
   */
  async getTokenPrice(symbol: string): Promise<TokenPrice> {
    // Check cache first
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.cachedAt < this.cacheDuration) {
      return {
        symbol: cached.symbol,
        price: cached.price,
        confidence: cached.confidence,
        publishTime: cached.publishTime,
        exponent: cached.exponent,
      };
    }

    // Get feed ID for symbol
    const feedId = this.getPriceFeedId(symbol);
    if (!feedId) {
      throw new Error(`No price feed found for symbol: ${symbol}`);
    }

    // Fetch from Hermes API
    const url = `${this.hermesUrl}/v2/updates/price/latest?ids[]=${feedId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as PythPriceResponse;

      if (!data.parsed || data.parsed.length === 0) {
        throw new Error(`No price data returned for ${symbol}`);
      }

      const priceData = data.parsed[0]!;

      // Convert to human-readable format
      // Price is stored as price * 10^expo, so we need to adjust
      const rawPrice = BigInt(priceData.price.price);
      const expo = priceData.price.expo;
      const price = Number(rawPrice) * Math.pow(10, expo);

      const rawConf = BigInt(priceData.price.conf);
      const confidence = Number(rawConf) * Math.pow(10, expo);

      const tokenPrice: TokenPrice = {
        symbol,
        price,
        confidence,
        publishTime: priceData.price.publish_time,
        exponent: expo,
      };

      // Cache the result
      this.priceCache.set(symbol, {
        ...tokenPrice,
        cachedAt: Date.now(),
      });

      return tokenPrice;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      throw new Error(`Failed to fetch price for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get prices for multiple token symbols
   */
  async getPrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();

    // Fetch all prices in parallel
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getPrice(symbol))
    );

    symbols.forEach((symbol, index) => {
      const result = results[index]!;
      if (result.status === 'fulfilled') {
        prices.set(symbol, result.value);
      } else {
        console.error(`Failed to get price for ${symbol}:`, result.reason);
        prices.set(symbol, 0);
      }
    });

    return prices;
  }

  /**
   * Get detailed price data for multiple tokens
   */
  async getTokenPrices(symbols: string[]): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();

    // Fetch all prices in parallel
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getTokenPrice(symbol))
    );

    symbols.forEach((symbol, index) => {
      const result = results[index]!;
      if (result.status === 'fulfilled') {
        prices.set(symbol, result.value);
      } else {
        console.error(`Failed to get price for ${symbol}:`, result.reason);
      }
    });

    return prices;
  }

  /**
   * Subscribe to price updates for a token
   * Note: This uses polling, not WebSocket (for simplicity)
   */
  subscribeToPrice(
    symbol: string,
    callback: (price: number) => void,
    interval: number = 10_000 // 10 seconds
  ): () => void {
    const timer = setInterval(async () => {
      try {
        const price = await this.getPrice(symbol);
        callback(price);
      } catch (error) {
        console.error(`Failed to fetch price update for ${symbol}:`, error);
      }
    }, interval);

    // Return unsubscribe function
    return () => clearInterval(timer);
  }

  /**
   * Clear the price cache
   */
  clearCache(): void {
    this.priceCache.clear();
  }

  /**
   * Get price feed ID for a symbol
   */
  private getPriceFeedId(symbol: string): string | undefined {
    const upperSymbol = symbol.toUpperCase() as keyof typeof PYTH_PRICE_FEED_IDS;
    return PYTH_PRICE_FEED_IDS[upperSymbol];
  }

  /**
   * Check if a price feed exists for a symbol
   */
  hasPriceFeed(symbol: string): boolean {
    return this.getPriceFeedId(symbol) !== undefined;
  }

  /**
   * Get all supported symbols
   */
  getSupportedSymbols(): string[] {
    return Object.keys(PYTH_PRICE_FEED_IDS);
  }
}
