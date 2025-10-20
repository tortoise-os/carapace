/**
 * Pool Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import type { CarapaceSDK } from '@carapace/sdk';
import { poolQueries } from '../db/client';

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

      const pools = await poolQueries.getAll(limit, offset);

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

      // Try database first (faster)
      let pool = await poolQueries.getById(id);

      // If not in DB, fetch from chain
      if (!pool) {
        const chainPool = await sdk.pool.getPool(id);

        // Save to DB
        await poolQueries.create({
          pool_id: id,
          token_x: chainPool.tokenX,
          token_y: chainPool.tokenY,
          reserve_x: chainPool.reserveX.toString(),
          reserve_y: chainPool.reserveY.toString(),
          lp_supply: chainPool.lpSupply.toString(),
          fee_rate: chainPool.feeBps,
          protocol_fee: chainPool.protocolFeeBps,
        });

        pool = await poolQueries.getById(id);
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

      const quote = await sdk.pool.getSwapQuote(
        id,
        BigInt(amountIn as string),
        isXToY === 'true',
      );

      res.json({
        success: true,
        data: {
          amountIn: quote.amountIn.toString(),
          amountOut: quote.amountOut.toString(),
          priceImpact: quote.priceImpact,
          fee: quote.fee.toString(),
          route: quote.route,
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
      const price = await sdk.pool.getSpotPrice(id);

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
