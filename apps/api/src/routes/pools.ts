/**
 * Pool Routes (Elysia Plugin)
 */

import { Elysia, t } from 'elysia';
import type { CarapaceSDK } from '@carapace/sdk';
import { poolQueries } from '../db/client';
import { mockDataProvider } from '../db/mock-data';

interface PriceDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

// Helper function to generate mock historical price data
function getHistoricalPriceData(
  poolId: string,
  timeframe: string,
  interval: string
): PriceDataPoint[] | null {
  const pool = mockDataProvider.getPool(poolId);
  if (!pool) return null;

  const currentPrice = mockDataProvider.getSpotPrice(poolId) || 2.0;
  const now = Date.now();

  // Calculate number of data points based on timeframe and interval
  const timeframeMs = parseTimeframe(timeframe);
  const intervalMs = parseInterval(interval);
  const numPoints = Math.min(Math.floor(timeframeMs / intervalMs), 500); // Max 500 points

  const dataPoints: PriceDataPoint[] = [];

  for (let i = numPoints - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;

    // Generate realistic-looking price fluctuations
    const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
    const trendFactor = 1 + (i / numPoints) * 0.05; // Slight upward trend
    const basePrice = currentPrice * randomFactor * trendFactor;

    const volatility = basePrice * 0.02; // 2% volatility
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = basePrice + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;

    // Generate volume with some randomness
    const baseVolume = 10000 + Math.random() * 50000;

    dataPoints.push({
      timestamp,
      price: close,
      volume: baseVolume,
      high,
      low,
      open,
      close,
    });
  }

  return dataPoints;
}

function parseTimeframe(timeframe: string): number {
  const map: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
  };
  return map[timeframe] || map['24h'];
}

function parseInterval(interval: string): number {
  const map: Record<string, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  };
  return map[interval] || map['1h'];
}

export const createPoolPlugin = new Elysia({ prefix: '/api/pools' })
  /**
   * GET /api/pools
   * List all pools
   */
  .get(
    '/',
    async ({ query }) => {
      try {
        const limit = Math.min(parseInt(query.limit as string) || 100, 1000);
        const offset = parseInt(query.offset as string) || 0;

        let pools;
        try {
          pools = await poolQueries.getAll(limit, offset);
          // If database returns empty, use mock data
          if (!pools || pools.length === 0) {
            console.log('No pools in database, using mock data');
            pools = mockDataProvider.getAllPools(limit, offset);
          }
        } catch (dbError) {
          console.log('Database unavailable, using mock data');
          pools = mockDataProvider.getAllPools(limit, offset);
        }

        return {
          success: true,
          data: pools,
          meta: {
            limit,
            offset,
            count: pools.length,
          },
        };
      } catch (error) {
        console.error('Error fetching pools:', error);
        throw new Error('Failed to fetch pools');
      }
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
    }
  )

  /**
   * GET /api/pools/:id
   * Get pool details
   */
  .get(
    '/:id',
    async ({ params, set }) => {
      try {
        const { id } = params;

        let pool;
        try {
          // Try database first (faster)
          pool = await poolQueries.getById(id);

          // If not in DB, try mock data
          if (!pool) {
            pool = mockDataProvider.getPool(id);
          }
        } catch (dbError) {
          console.log('Database unavailable, using mock data');
          pool = mockDataProvider.getPool(id);
        }

        if (!pool) {
          set.status = 404;
          return {
            success: false,
            error: 'Pool not found',
          };
        }

        return {
          success: true,
          data: pool,
        };
      } catch (error) {
        console.error('Error fetching pool:', error);
        throw new Error('Failed to fetch pool');
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  /**
   * GET /api/pools/:id/quote
   * Get swap quote
   */
  .get(
    '/:id/quote',
    async ({ params, query, set }) => {
      try {
        const { id } = params;
        const { amountIn, isXToY } = query;

        if (!amountIn || isXToY === undefined) {
          set.status = 400;
          return {
            success: false,
            error: 'Missing required parameters: amountIn, isXToY',
          };
        }

        const amountInBigInt = BigInt(amountIn);
        const isXToYBool = isXToY === 'true';

        // Try mock data calculation
        const mockQuote = mockDataProvider.calculateSwapOutput(
          id,
          amountInBigInt,
          isXToYBool
        );

        if (!mockQuote) {
          set.status = 404;
          return {
            success: false,
            error: 'Pool not found',
          };
        }

        return {
          success: true,
          data: {
            amountIn: amountInBigInt.toString(),
            amountOut: mockQuote.amountOut.toString(),
            priceImpact: mockQuote.priceImpact,
            fee: mockQuote.fee.toString(),
            route: [id],
          },
        };
      } catch (error) {
        console.error('Error getting quote:', error);
        throw new Error('Failed to get quote');
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        amountIn: t.String(),
        isXToY: t.String(),
      }),
    }
  )

  /**
   * GET /api/pools/:id/price
   * Get spot price
   */
  .get(
    '/:id/price',
    async ({ params, set }) => {
      try {
        const { id } = params;
        const price = mockDataProvider.getSpotPrice(id);

        if (price === null) {
          set.status = 404;
          return {
            success: false,
            error: 'Pool not found',
          };
        }

        return {
          success: true,
          data: { price },
        };
      } catch (error) {
        console.error('Error getting price:', error);
        throw new Error('Failed to get price');
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  /**
   * GET /api/pools/:id/price-history
   * Get historical price data
   */
  .get(
    '/:id/price-history',
    async ({ params, query, set }) => {
      try {
        const { id } = params;
        const { timeframe = '24h', interval = '1h' } = query;

        // Generate mock historical data
        const dataPoints = getHistoricalPriceData(id, timeframe, interval);

        if (!dataPoints) {
          set.status = 404;
          return {
            success: false,
            error: 'Pool not found',
          };
        }

        return {
          success: true,
          data: dataPoints,
        };
      } catch (error) {
        console.error('Error getting price history:', error);
        throw new Error('Failed to get price history');
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        timeframe: t.Optional(t.String()), // 1h, 24h, 7d, 30d, 1y
        interval: t.Optional(t.String()),   // 1m, 5m, 15m, 1h, 1d
      }),
    }
  )

  /**
   * POST /api/pools/:id/swap
   * Get swap transaction
   */
  .post(
    '/:id/swap',
    async ({ params, body, sdk }) => {
      try {
        const { id } = params;

        const tx = body.isXToY
          ? sdk.pool.swapXToY(
              id,
              body.tokenIn,
              body.tokenOut,
              body.coinIn,
              BigInt(body.amountIn),
              body.minAmountOut ? BigInt(body.minAmountOut) : 0n,
            )
          : sdk.pool.swapYToX(
              id,
              body.tokenIn,
              body.tokenOut,
              body.coinIn,
              BigInt(body.amountIn),
              body.minAmountOut ? BigInt(body.minAmountOut) : 0n,
            );

        // Serialize transaction
        const txBytes = await tx.build({
          client: sdk.client,
        });

        return {
          success: true,
          data: {
            transaction: Buffer.from(txBytes).toString('base64'),
          },
        };
      } catch (error) {
        console.error('Error creating swap tx:', error);
        throw new Error('Failed to create swap transaction');
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        tokenIn: t.String(),
        tokenOut: t.String(),
        coinIn: t.String(),
        amountIn: t.String(),
        minAmountOut: t.Optional(t.String()),
        isXToY: t.Boolean(),
      }),
    }
  );
