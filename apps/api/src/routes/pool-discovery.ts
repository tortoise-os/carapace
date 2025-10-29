/**
 * Pool Discovery Routes (Elysia Plugin)
 */

import { Elysia, t } from 'elysia';
import type { PoolDiscoveryService } from '../services/pool-discovery';

export const createPoolDiscoveryPlugin = (discoveryService: PoolDiscoveryService) => {
  return new Elysia({ prefix: '/api/pool-discovery' })
    /**
     * GET /api/pool-discovery/status
     * Get pool discovery service status
     */
    .get(
      '/status',
      async () => {
        return {
          success: true,
          data: {
            enabled: true,
            poolCount: discoveryService.getPoolCount(),
            scanning: false, // Would need to expose this from service
          },
        };
      }
    )

    /**
     * GET /api/pool-discovery/discovered
     * List all discovered pools
     */
    .get(
      '/discovered',
      async () => {
        const discovered = discoveryService.getAllDiscoveredPools();

        return {
          success: true,
          data: discovered,
          meta: {
            count: discovered.length,
          },
        };
      }
    )

    /**
     * POST /api/pool-discovery/scan
     * Trigger manual pool scan
     */
    .post(
      '/scan',
      async () => {
        try {
          const newPools = await discoveryService.scanForPools();

          return {
            success: true,
            data: {
              newPoolsFound: newPools.length,
              pools: newPools,
            },
          };
        } catch (error) {
          console.error('Error during manual scan:', error);
          throw new Error('Failed to scan for pools');
        }
      }
    )

    /**
     * POST /api/pool-discovery/add
     * Manually add a pool to discovery
     */
    .post(
      '/add',
      async ({ body }) => {
        try {
          const pool = {
            poolId: body.poolId,
            tokenX: body.tokenX || 'unknown',
            tokenY: body.tokenY || 'unknown',
            discoveredAt: new Date(),
            transactionDigest: body.transactionDigest || 'manual',
          };

          discoveryService.addPool(pool);

          return {
            success: true,
            data: pool,
          };
        } catch (error) {
          console.error('Error adding pool:', error);
          throw new Error('Failed to add pool');
        }
      },
      {
        body: t.Object({
          poolId: t.String(),
          tokenX: t.Optional(t.String()),
          tokenY: t.Optional(t.String()),
          transactionDigest: t.Optional(t.String()),
        }),
      }
    );
};
