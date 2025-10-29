/**
 * Pool Client - Interact with AMM pools
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import type {
  PoolInfo,
  SwapQuote,
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

    // Extract token types from pool type
    const poolType = poolObject.data.content.type;
    const typeMatch = poolType.match(/Pool<(.+),\s*(.+)>/);
    const tokenX = (typeMatch ? typeMatch[1]!.trim() : '') as X;
    const tokenY = (typeMatch ? typeMatch[2]!.trim() : '') as Y;

    return {
      poolId,
      tokenX: tokenX as X,
      tokenY: tokenY as Y,
      reserveX: BigInt(fields.reserve_x || '0'),
      reserveY: BigInt(fields.reserve_y || '0'),
      lpSupply: BigInt(fields.lp_supply?.fields?.value || '0'),
      feeBps: Number(fields.fee_bps || '0'),
      protocolFeeBps: Number(fields.protocol_fee_bps || '0'),
      protocolFeeX: BigInt(fields.protocol_fee_x || '0'),
      protocolFeeY: BigInt(fields.protocol_fee_y || '0'),
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
  createPool(
    typeX: string,
    typeY: string,
    senderAddress: string,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    // Call create_pool - returns AdminCap
    const adminCap = tx.moveCall({
      target: `${this.packageId}::pool::create_pool`,
      typeArguments: [typeX, typeY],
      arguments: [],
    });

    // Transfer AdminCap to sender
    tx.transferObjects([adminCap], senderAddress);

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Add liquidity to pool
   */
  addLiquidity(
    poolId: ObjectId,
    typeX: string,
    typeY: string,
    coinX: ObjectId | null,
    coinY: ObjectId | null,
    amountX: bigint,
    amountY: bigint,
    senderAddress: string,
    minLiquidity: bigint = 0n,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    // For SUI tokens, use gas coin
    const isSuiX = typeX === '0x2::sui::SUI';
    const isSuiY = typeY === '0x2::sui::SUI';

    let coinXSplit;
    let coinYSplit;

    if (isSuiX && isSuiY) {
      // Both are SUI, split from gas
      [coinXSplit] = tx.splitCoins(tx.gas, [tx.pure.u64(amountX)]);
      [coinYSplit] = tx.splitCoins(tx.gas, [tx.pure.u64(amountY)]);
    } else if (isSuiX) {
      // X is SUI, use gas
      [coinXSplit] = tx.splitCoins(tx.gas, [tx.pure.u64(amountX)]);
      [coinYSplit] = tx.splitCoins(tx.object(coinY!), [tx.pure.u64(amountY)]);
    } else if (isSuiY) {
      // Y is SUI, use gas
      [coinXSplit] = tx.splitCoins(tx.object(coinX!), [tx.pure.u64(amountX)]);
      [coinYSplit] = tx.splitCoins(tx.gas, [tx.pure.u64(amountY)]);
    } else {
      // Neither is SUI
      [coinXSplit] = tx.splitCoins(tx.object(coinX!), [tx.pure.u64(amountX)]);
      [coinYSplit] = tx.splitCoins(tx.object(coinY!), [tx.pure.u64(amountY)]);
    }

    // Call add_liquidity - returns LP token
    const lpToken = tx.moveCall({
      target: `${this.packageId}::pool::add_liquidity`,
      typeArguments: [typeX, typeY],
      arguments: [
        tx.object(poolId),
        coinXSplit!,
        coinYSplit!,
        tx.pure.u64(minLiquidity),
      ],
    });

    // Transfer LP token to sender
    tx.transferObjects([lpToken], senderAddress);

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Remove liquidity from pool
   */
  removeLiquidity(
    poolId: ObjectId,
    typeX: string,
    typeY: string,
    lpToken: ObjectId,
    lpAmount: bigint,
    senderAddress: string,
    minAmountX: bigint = 0n,
    minAmountY: bigint = 0n,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    const [lpSplit] = tx.splitCoins(tx.object(lpToken), [tx.pure.u64(lpAmount)]);

    // Call remove_liquidity - returns (Coin<X>, Coin<Y>)
    const result = tx.moveCall({
      target: `${this.packageId}::pool::remove_liquidity`,
      typeArguments: [typeX, typeY],
      arguments: [
        tx.object(poolId),
        lpSplit,
        tx.pure.u64(minAmountX),
        tx.pure.u64(minAmountY),
      ],
    });

    // Transfer withdrawn coins to sender
    tx.transferObjects([result[0]!, result[1]!], senderAddress);

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Swap X for Y
   */
  swapXToY(
    poolId: ObjectId,
    typeX: string,
    typeY: string,
    coinX: ObjectId | null,
    amountIn: bigint,
    senderAddress: string,
    minAmountOut: bigint = 0n,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    // For SUI, use gas coin; otherwise use provided coin
    const isSuiX = typeX === '0x2::sui::SUI';
    const [coinSplit] = isSuiX
      ? tx.splitCoins(tx.gas, [tx.pure.u64(amountIn)])
      : tx.splitCoins(tx.object(coinX!), [tx.pure.u64(amountIn)]);

    // Call swap_x_to_y - returns Coin<Y>
    const coinOut = tx.moveCall({
      target: `${this.packageId}::pool::swap_x_to_y`,
      typeArguments: [typeX, typeY],
      arguments: [
        tx.object(poolId),
        coinSplit,
        tx.pure.u64(minAmountOut),
      ],
    });

    // Transfer output coin to sender
    tx.transferObjects([coinOut], senderAddress);

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Swap Y for X
   */
  swapYToX(
    poolId: ObjectId,
    typeX: string,
    typeY: string,
    coinY: ObjectId | null,
    amountIn: bigint,
    senderAddress: string,
    minAmountOut: bigint = 0n,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    // For SUI, use gas coin; otherwise use provided coin
    const isSuiY = typeY === '0x2::sui::SUI';
    const [coinSplit] = isSuiY
      ? tx.splitCoins(tx.gas, [tx.pure.u64(amountIn)])
      : tx.splitCoins(tx.object(coinY!), [tx.pure.u64(amountIn)]);

    // Call swap_y_to_x - returns Coin<X>
    const coinOut = tx.moveCall({
      target: `${this.packageId}::pool::swap_y_to_x`,
      typeArguments: [typeX, typeY],
      arguments: [
        tx.object(poolId),
        coinSplit,
        tx.pure.u64(minAmountOut),
      ],
    });

    // Transfer output coin to sender
    tx.transferObjects([coinOut], senderAddress);

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }
}
