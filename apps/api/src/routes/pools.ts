/**
 * Pool Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import type { CarapaceSDK } from '@carapace/sdk';
import { poolQueries } from '../db/client';
import { mockDataProvider } from '../db/mock-data';
import { config } from '../config';

export function createPoolRoutes(sdk: CarapaceSDK) {
  const router = Router();

  /**
   * GET /pools
   * List all pools
   */
  router.get('/', async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
      const offset = parseInt(req.query.offset as string) || 0;

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

      res.json({
        success: true,
        data: pools,
        meta: {
          limit,
          offset,
          count: pools.length,
        },
      });
    } catch (error) {
      console.error('Error fetching pools:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pools',
      });
    }
  });

  /**
   * GET /pools/:id
   * Get pool details
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

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
        return res.status(404).json({
          success: false,
          error: 'Pool not found',
        });
      }

      res.json({
        success: true,
        data: pool,
      });
    } catch (error) {
      console.error('Error fetching pool:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pool',
      });
    }
  });

  /**
   * GET /pools/:id/quote
   * Get swap quote
   */
  router.get('/:id/quote', async (req, res) => {
    try {
      const { id } = req.params;
      const { amountIn, isXToY } = req.query;

      if (!amountIn || isXToY === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: amountIn, isXToY',
        });
      }

      const amountInBigInt = BigInt(amountIn as string);
      const isXToYBool = isXToY === 'true';

      // Try mock data calculation
      const mockQuote = mockDataProvider.calculateSwapOutput(
        id,
        amountInBigInt,
        isXToYBool
      );

      if (!mockQuote) {
        return res.status(404).json({
          success: false,
          error: 'Pool not found',
        });
      }

      res.json({
        success: true,
        data: {
          amountIn: amountInBigInt.toString(),
          amountOut: mockQuote.amountOut.toString(),
          priceImpact: mockQuote.priceImpact,
          fee: mockQuote.fee.toString(),
          route: [id],
        },
      });
    } catch (error) {
      console.error('Error getting quote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get quote',
      });
    }
  });

  /**
   * GET /pools/:id/price
   * Get spot price
   */
  router.get('/:id/price', async (req, res) => {
    try {
      const { id } = req.params;
      const price = mockDataProvider.getSpotPrice(id);

      if (price === null) {
        return res.status(404).json({
          success: false,
          error: 'Pool not found',
        });
      }

      res.json({
        success: true,
        data: { price },
      });
    } catch (error) {
      console.error('Error getting price:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get price',
      });
    }
  });

  /**
   * POST /pools/:id/swap
   * Get swap transaction
   */
  router.post('/:id/swap', async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        tokenIn: z.string(),
        tokenOut: z.string(),
        coinIn: z.string(),
        amountIn: z.string(),
        minAmountOut: z.string().optional(),
        isXToY: z.boolean(),
      });

      const body = schema.parse(req.body);

      const tx = body.isXToY
        ? sdk.pool.swapXToY(
            id,
            body.coinIn,
            BigInt(body.amountIn),
            body.minAmountOut ? BigInt(body.minAmountOut) : 0n,
          )
        : sdk.pool.swapYToX(
            id,
            body.coinIn,
            BigInt(body.amountIn),
            body.minAmountOut ? BigInt(body.minAmountOut) : 0n,
          );

      // Serialize transaction
      const txBytes = await tx.build({
        client: sdk.client,
      });

      res.json({
        success: true,
        data: {
          transaction: Buffer.from(txBytes).toString('base64'),
        },
      });
    } catch (error) {
      console.error('Error creating swap tx:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create swap transaction',
      });
    }
  });

  return router;
}
