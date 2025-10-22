'use client';

import { useState, useEffect } from 'react';
import { useCarapaceSDK } from '@/providers/sui-provider';
import type { TokenPrice } from '@carapace/sdk';

interface UseTokenPriceOptions {
  /** Refresh interval in milliseconds (default: 60000 = 1 minute) */
  refreshInterval?: number;
  /** Whether to start fetching immediately (default: true) */
  enabled?: boolean;
}

interface UseTokenPriceResult {
  price: number;
  priceData: TokenPrice | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and track USD price for a single token
 */
export function useTokenPrice(
  symbol: string,
  options: UseTokenPriceOptions = {}
): UseTokenPriceResult {
  const sdk = useCarapaceSDK();

  const {
    refreshInterval = 60000, // 1 minute polling
    enabled = true,
  } = options;

  const [price, setPrice] = useState<number>(0);
  const [priceData, setPriceData] = useState<TokenPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = async () => {
    if (!enabled || !symbol) {
      setPrice(0);
      setPriceData(null);
      setIsLoading(false);
      return;
    }

    // Check if price feed exists
    if (!sdk.oracle.hasPriceFeed(symbol)) {
      setPrice(0);
      setPriceData(null);
      setIsLoading(false);
      setError(new Error(`No price feed for ${symbol}`));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tokenPrice = await sdk.oracle.getTokenPrice(symbol);

      setPrice(tokenPrice.price);
      setPriceData(tokenPrice);
    } catch (err) {
      console.error(`Failed to fetch price for ${symbol}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPrice(0);
      setPriceData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPrice();
  }, [symbol, enabled]);

  // Polling
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, enabled, refreshInterval]);

  return {
    price,
    priceData,
    isLoading,
    error,
    refetch: fetchPrice,
  };
}

/**
 * Hook to fetch prices for multiple tokens
 */
export function useTokenPrices(
  symbols: string[],
  options: UseTokenPriceOptions = {}
): {
  prices: Map<string, number>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const sdk = useCarapaceSDK();

  const {
    refreshInterval = 60000,
    enabled = true,
  } = options;

  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = async () => {
    if (!enabled || symbols.length === 0) {
      setPrices(new Map());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tokenPrices = await sdk.oracle.getPrices(symbols);
      setPrices(tokenPrices);
    } catch (err) {
      console.error('Failed to fetch token prices:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPrices(new Map());
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [JSON.stringify(symbols), enabled]);

  // Polling
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [JSON.stringify(symbols), enabled, refreshInterval]);

  return {
    prices,
    isLoading,
    error,
    refetch: fetchPrices,
  };
}

/**
 * Calculate USD value for a token amount
 */
export function useTokenValue(
  symbol: string,
  amount: number | string
): {
  usdValue: number;
  formattedValue: string;
  isLoading: boolean;
} {
  const { price, isLoading } = useTokenPrice(symbol);

  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  const usdValue = isNaN(amountNum) ? 0 : amountNum * price;

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdValue);

  return {
    usdValue,
    formattedValue,
    isLoading,
  };
}

/**
 * Format a price as USD
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a price with compact notation for large numbers
 */
export function formatCompactUSD(value: number): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }

  return formatUSD(value);
}
