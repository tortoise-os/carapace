'use client';

import { useState, useEffect } from 'react';
import { apiClient, type ProtocolAnalytics, type PoolWithAnalytics } from '@/lib/api-client';

export function useProtocolAnalytics() {
  const [analytics, setAnalytics] = useState<ProtocolAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProtocolAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

export function usePoolAnalytics(params?: {
  limit?: number;
  sortBy?: 'tvl' | 'volume24h' | 'apr';
  order?: 'asc' | 'desc';
}) {
  const [pools, setPools] = useState<PoolWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPoolAnalytics(params);
      setPools(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pool analytics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, [params?.limit, params?.sortBy, params?.order]);

  return {
    pools,
    loading,
    error,
    refetch: fetchPools,
  };
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '$0.00';

  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }

  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }

  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }

  return `$${num.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
