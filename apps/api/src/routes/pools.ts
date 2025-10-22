/**
 * Pool Routes (Elysia Plugin)
 */

import { Elysia, t } from 'elysia';
import type { CarapaceSDK } from '@carapace/sdk';
import { poolQueries } from '../db/client';
import { mockDataProvider } from '../db/mock-data';

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
