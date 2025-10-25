/**
 * Positions Routes (Elysia Plugin)
 * User liquidity position management
 */

import { Elysia, t } from 'elysia';
import type { CarapaceSDK } from '@carapace/sdk';

export interface LiquidityPosition {
  id: string;
  poolId: string;
  userAddress: string;
  lpTokenBalance: string;
  shareOfPool: number; // Percentage (0-100)
  tokenXAmount: string;
  tokenYAmount: string;
  tokenXSymbol: string;
  tokenYSymbol: string;
  valueUSD: string;
  feesEarnedUSD: string;
  createdAt: string;
  lastUpdatedAt: string;
}

/**
 * Calculate user's share of a pool
 */
function calculatePosition(
  lpTokenBalance: string,
  totalLpSupply: string,
  reserveX: string,
  reserveY: string,
  poolId: string,
  userAddress: string
): LiquidityPosition {
  const balance = BigInt(lpTokenBalance);
  const supply = BigInt(totalLpSupply);

  if (supply === 0n) {
    return createEmptyPosition(poolId, userAddress);
  }

  // Calculate share percentage
  const shareOfPool = (Number(balance) / Number(supply)) * 100;

  // Calculate token amounts owned
  const reserveXBig = BigInt(reserveX);
  const reserveYBig = BigInt(reserveY);

  const tokenXAmount = (reserveXBig * balance) / supply;
  const tokenYAmount = (reserveYBig * balance) / supply;

  // Calculate USD value (mock - use real prices in production)
  const tokenXValue = Number(tokenXAmount) / 1e9 * 2; // Assume $2 per SUI
  const tokenYValue = Number(tokenYAmount) / 1e9 * 2;
  const valueUSD = tokenXValue + tokenYValue;

  // Estimate fees earned (mock - track real fees in production)
  const feesEarnedUSD = valueUSD * 0.001; // 0.1% fees earned estimate

  return {
    id: `${poolId}-${userAddress}`,
    poolId,
    userAddress,
    lpTokenBalance,
    shareOfPool,
    tokenXAmount: tokenXAmount.toString(),
    tokenYAmount: tokenYAmount.toString(),
    tokenXSymbol: 'SUI',
    tokenYSymbol: 'USDC',
    valueUSD: valueUSD.toFixed(2),
    feesEarnedUSD: feesEarnedUSD.toFixed(2),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

function createEmptyPosition(poolId: string, userAddress: string): LiquidityPosition {
  return {
    id: `${poolId}-${userAddress}`,
    poolId,
    userAddress,
    lpTokenBalance: '0',
    shareOfPool: 0,
    tokenXAmount: '0',
    tokenYAmount: '0',
    tokenXSymbol: 'SUI',
    tokenYSymbol: 'USDC',
    valueUSD: '0.00',
    feesEarnedUSD: '0.00',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

export const createPositionsPlugin = new Elysia({ prefix: '/api/positions' })
  /**
   * GET /api/positions/:address
   * Get all liquidity positions for a user
   */
  .get(
    '/:address',
    async ({ params, sdk }) => {
      try {
        const { address } = params;

        // Get all pools
        const pools = await sdk.pool.getAllPools({ limit: 100 });

        // For each pool, check if user has LP tokens
        const positions: LiquidityPosition[] = [];

        for (const pool of pools) {
          // In production, query user's LP token balance from blockchain
          // For now, create mock positions
          const mockLpBalance = '1000000000'; // 1 LP token (9 decimals)

          if (mockLpBalance !== '0') {
            const position = calculatePosition(
              mockLpBalance,
              pool.lpSupply,
              pool.reserveX,
              pool.reserveY,
              pool.id,
              address
            );

            positions.push(position);
          }
        }

        return {
          success: true,
          data: {
            positions,
            totalValueUSD: positions.reduce(
              (sum, p) => sum + parseFloat(p.valueUSD),
              0
            ).toFixed(2),
            totalFeesEarnedUSD: positions.reduce(
              (sum, p) => sum + parseFloat(p.feesEarnedUSD),
              0
            ).toFixed(2),
          },
        };
      } catch (error) {
        console.error('Error fetching positions:', error);
        throw new Error('Failed to fetch positions');
      }
    }
  )

  /**
   * GET /api/positions/:address/:poolId
   * Get specific position details
   */
  .get(
    '/:address/:poolId',
    async ({ params, sdk }) => {
      try {
        const { address, poolId } = params;

        // Get pool details
        const pool = await sdk.pool.getPool(poolId);

        // Mock LP balance - in production, query from blockchain
        const mockLpBalance = '1000000000';

        const position = calculatePosition(
          mockLpBalance,
          pool.lpSupply,
          pool.reserveX,
          pool.reserveY,
          poolId,
          address
        );

        return {
          success: true,
          data: position,
        };
      } catch (error) {
        console.error('Error fetching position:', error);
        throw new Error('Failed to fetch position');
      }
    }
  )

  /**
   * POST /api/positions/calculate-add
   * Calculate amounts for adding liquidity
   */
  .post(
    '/calculate-add',
    async ({ body, sdk }) => {
      try {
        const { poolId, tokenXAmount, tokenYAmount } = body as {
          poolId: string;
          tokenXAmount: string;
          tokenYAmount: string;
        };

        const pool = await sdk.pool.getPool(poolId);

        const reserveX = BigInt(pool.reserveX);
        const reserveY = BigInt(pool.reserveY);
        const supply = BigInt(pool.lpSupply);

        let amountX = BigInt(tokenXAmount);
        let amountY = BigInt(tokenYAmount);

        // Calculate optimal amounts maintaining pool ratio
        if (supply === 0n) {
          // First liquidity provision
          const lpTokens = (amountX * amountY) ** 1n; // Simplified sqrt
          return {
            success: true,
            data: {
              amountX: amountX.toString(),
              amountY: amountY.toString(),
              lpTokens: lpTokens.toString(),
              shareOfPool: 100,
            },
          };
        }

        // Calculate based on X amount
        const requiredY = (amountX * reserveY) / reserveX;
        if (requiredY <= amountY) {
          amountY = requiredY;
        } else {
          // Calculate based on Y amount
          amountX = (amountY * reserveX) / reserveY;
        }

        // Calculate LP tokens to mint
        const lpTokens = (amountX * supply) / reserveX;

        // Calculate share
        const newSupply = supply + lpTokens;
        const shareOfPool = (Number(lpTokens) / Number(newSupply)) * 100;

        return {
          success: true,
          data: {
            amountX: amountX.toString(),
            amountY: amountY.toString(),
            lpTokens: lpTokens.toString(),
            shareOfPool,
          },
        };
      } catch (error) {
        console.error('Error calculating add liquidity:', error);
        throw new Error('Failed to calculate add liquidity');
      }
    }
  )

  /**
   * POST /api/positions/calculate-remove
   * Calculate amounts for removing liquidity
   */
  .post(
    '/calculate-remove',
    async ({ body, sdk }) => {
      try {
        const { poolId, lpTokenAmount } = body as {
          poolId: string;
          lpTokenAmount: string;
        };

        const pool = await sdk.pool.getPool(poolId);

        const reserveX = BigInt(pool.reserveX);
        const reserveY = BigInt(pool.reserveY);
        const supply = BigInt(pool.lpSupply);
        const lpTokens = BigInt(lpTokenAmount);

        // Calculate token amounts to receive
        const amountX = (lpTokens * reserveX) / supply;
        const amountY = (lpTokens * reserveY) / supply;

        // Calculate fees earned (simplified)
        const feesX = amountX * 3n / 1000n; // 0.3%
        const feesY = amountY * 3n / 1000n;

        return {
          success: true,
          data: {
            amountX: amountX.toString(),
            amountY: amountY.toString(),
            feesX: feesX.toString(),
            feesY: feesY.toString(),
            totalX: (amountX + feesX).toString(),
            totalY: (amountY + feesY).toString(),
          },
        };
      } catch (error) {
        console.error('Error calculating remove liquidity:', error);
        throw new Error('Failed to calculate remove liquidity');
      }
    }
  );
