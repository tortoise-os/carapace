/**
 * Pool Client - Interact with AMM pools
 */

import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import type {
  PoolInfo,
  SwapQuote,
  LiquidityQuote,
  TxOptions,
  CoinType,
  ObjectId,
} from './types';
import { CONSTANTS } from './config';

export class PoolClient {
  constructor(
    private client: SuiClient,
    private packageId: string,
  ) {}

  /**
   * Get pool information
   */
  async getPool<X extends CoinType, Y extends CoinType>(
    poolId: ObjectId,
  ): Promise<PoolInfo<X, Y>> {
    const poolObject = await this.client.getObject({
      id: poolId,
      options: { showContent: true },
    });

    if (!poolObject.data || !poolObject.data.content || poolObject.data.content.dataType !== 'moveObject') {
      throw new Error('Pool not found');
    }

    const fields = poolObject.data.content.fields as any;

    return {
      poolId,
      tokenX: fields.reserve_x.type as X,
      tokenY: fields.reserve_y.type as Y,
      reserveX: BigInt(fields.reserve_x.fields.value || '0'),
      reserveY: BigInt(fields.reserve_y.fields.value || '0'),
      lpSupply: BigInt(fields.lp_supply.fields.value || '0'),
      feeBps: Number(fields.fee_bps || '0'),
      protocolFeeBps: Number(fields.protocol_fee_bps || '0'),
      protocolFeeX: BigInt(fields.protocol_fee_x.fields.value || '0'),
      protocolFeeY: BigInt(fields.protocol_fee_y.fields.value || '0'),
    };
  }

  /**
   * Calculate swap output amount
   */
  calculateSwapOutput(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeBps: number = CONSTANTS.DEFAULT_FEE_BPS,
  ): bigint {
    if (amountIn === 0n || reserveIn === 0n || reserveOut === 0n) {
      return 0n;
    }

    // Calculate fee
    const fee = (amountIn * BigInt(feeBps)) / BigInt(CONSTANTS.BPS_DENOMINATOR);
    const amountInAfterFee = amountIn - fee;

    // Constant product formula: (reserve_in + amount_in) * (reserve_out - amount_out) = k
    // amount_out = (amount_in * reserve_out) / (reserve_in + amount_in)
    const numerator = amountInAfterFee * reserveOut;
    const denominator = reserveIn + amountInAfterFee;

    return numerator / denominator;
  }

  /**
   * Calculate swap input amount needed for desired output
   */
  calculateSwapInput(
    amountOut: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeBps: number = CONSTANTS.DEFAULT_FEE_BPS,
  ): bigint {
    if (amountOut === 0n || reserveIn === 0n || reserveOut <= amountOut) {
      throw new Error('Invalid amounts');
    }

    // amount_in_before_fee = (reserve_in * amount_out) / (reserve_out - amount_out)
    const numerator = reserveIn * amountOut;
    const denominator = reserveOut - amountOut;
    const amountInBeforeFee = numerator / denominator + 1n; // Round up

    // Add fee: amount_in = amount_in_before_fee / (1 - fee_rate)
    const bps = BigInt(CONSTANTS.BPS_DENOMINATOR);
    const amountIn = (amountInBeforeFee * bps) / (bps - BigInt(feeBps)) + 1n; // Round up

    return amountIn;
  }

  /**
   * Get swap quote
   */
  async getSwapQuote(
    poolId: ObjectId,
    amountIn: bigint,
    isXToY: boolean,
  ): Promise<SwapQuote> {
    const pool = await this.getPool(poolId);

    const [reserveIn, reserveOut] = isXToY
      ? [pool.reserveX, pool.reserveY]
      : [pool.reserveY, pool.reserveX];

    const amountOut = this.calculateSwapOutput(
      amountIn,
      reserveIn,
      reserveOut,
      pool.feeBps,
    );

    const fee = (amountIn * BigInt(pool.feeBps)) / BigInt(CONSTANTS.BPS_DENOMINATOR);

    // Calculate price impact
    const spotPriceBefore = Number(reserveOut) / Number(reserveIn);
    const spotPriceAfter = Number(reserveOut - amountOut) / Number(reserveIn + amountIn);
    const priceImpact = ((spotPriceAfter - spotPriceBefore) / spotPriceBefore) * 100;

    return {
      amountIn,
      amountOut,
      priceImpact,
      fee,
      route: [poolId],
    };
  }

  /**
   * Get spot price (Y per X)
   */
  async getSpotPrice(poolId: ObjectId): Promise<number> {
    const pool = await this.getPool(poolId);
    return Number(pool.reserveY * CONSTANTS.PRICE_PRECISION / pool.reserveX) / Number(CONSTANTS.PRICE_PRECISION);
  }

  /**
   * Create a new pool
   */
  createPool<X extends CoinType, Y extends CoinType>(
    options?: TxOptions,
  ): TransactionBlock {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${this.packageId}::pool::create_pool`,
      typeArguments: [X as string, Y as string],
      arguments: [],
    });

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Add liquidity to pool
   */
  addLiquidity<X extends CoinType, Y extends CoinType>(
    poolId: ObjectId,
    coinX: ObjectId,
    coinY: ObjectId,
    amountX: bigint,
    amountY: bigint,
    minLiquidity: bigint = 0n,
    options?: TxOptions,
  ): TransactionBlock {
    const tx = new TransactionBlock();

    // Split coins to exact amounts
    const [coinXSplit] = tx.splitCoins(tx.object(coinX), [tx.pure(amountX)]);
    const [coinYSplit] = tx.splitCoins(tx.object(coinY), [tx.pure(amountY)]);

    tx.moveCall({
      target: `${this.packageId}::pool::add_liquidity`,
      typeArguments: [X as string, Y as string],
      arguments: [
        tx.object(poolId),
        coinXSplit,
        coinYSplit,
        tx.pure(minLiquidity),
      ],
    });

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Remove liquidity from pool
   */
  removeLiquidity<X extends CoinType, Y extends CoinType>(
    poolId: ObjectId,
    lpToken: ObjectId,
    lpAmount: bigint,
    minAmountX: bigint = 0n,
    minAmountY: bigint = 0n,
    options?: TxOptions,
  ): TransactionBlock {
    const tx = new TransactionBlock();

    const [lpSplit] = tx.splitCoins(tx.object(lpToken), [tx.pure(lpAmount)]);

    tx.moveCall({
      target: `${this.packageId}::pool::remove_liquidity`,
      typeArguments: [X as string, Y as string],
      arguments: [
        tx.object(poolId),
        lpSplit,
        tx.pure(minAmountX),
        tx.pure(minAmountY),
      ],
    });

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Swap X for Y
   */
  swapXToY<X extends CoinType, Y extends CoinType>(
    poolId: ObjectId,
    coinX: ObjectId,
    amountIn: bigint,
    minAmountOut: bigint = 0n,
    options?: TxOptions,
  ): TransactionBlock {
    const tx = new TransactionBlock();

    const [coinSplit] = tx.splitCoins(tx.object(coinX), [tx.pure(amountIn)]);

    tx.moveCall({
      target: `${this.packageId}::pool::swap_x_to_y`,
      typeArguments: [X as string, Y as string],
      arguments: [
        tx.object(poolId),
        coinSplit,
        tx.pure(minAmountOut),
      ],
    });

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Swap Y for X
   */
  swapYToX<X extends CoinType, Y extends CoinType>(
    poolId: ObjectId,
    coinY: ObjectId,
    amountIn: bigint,
    minAmountOut: bigint = 0n,
    options?: TxOptions,
  ): TransactionBlock {
    const tx = new TransactionBlock();

    const [coinSplit] = tx.splitCoins(tx.object(coinY), [tx.pure(amountIn)]);

    tx.moveCall({
      target: `${this.packageId}::pool::swap_y_to_x`,
      typeArguments: [X as string, Y as string],
      arguments: [
        tx.object(poolId),
        coinSplit,
        tx.pure(minAmountOut),
      ],
    });

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }
}
