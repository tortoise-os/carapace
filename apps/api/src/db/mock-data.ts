/**
 * Mock Data Provider
 * Used when database is unavailable or for development
 */

export interface Pool {
  pool_id: string;
  token_x: string;
  token_y: string;
  reserve_x: string;
  reserve_y: string;
  lp_supply: string;
  fee_rate: number;
  protocol_fee: number;
  created_at: string;
  updated_at: string;
}

// Mock pool data matching the frontend expectations
export const MOCK_POOLS: Pool[] = [
  {
    pool_id: '0x1234...pool1',
    token_x: '0x2::sui::SUI',
    token_y: '0x5678::usdc::USDC',
    reserve_x: '1000000000000000', // 1M SUI (9 decimals)
    reserve_y: '1500000000000', // 1.5M USDC (6 decimals)
    lp_supply: '1224744871391589', // sqrt(1M * 1.5M)
    fee_rate: 30, // 0.30% = 30 bps
    protocol_fee: 5, // 0.05%
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    pool_id: '0x1234...pool2',
    token_x: '0x2::sui::SUI',
    token_y: '0x9abc::usdt::USDT',
    reserve_x: '800000000000000', // 800K SUI
    reserve_y: '1200000000000', // 1.2M USDT
    lp_supply: '979795897113271',
    fee_rate: 30,
    protocol_fee: 5,
    created_at: new Date('2024-01-02').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    pool_id: '0x1234...pool3',
    token_x: '0x5678::usdc::USDC',
    token_y: '0x9abc::usdt::USDT',
    reserve_x: '2000000000000', // 2M USDC
    reserve_y: '2000000000000', // 2M USDT
    lp_supply: '2000000000000',
    fee_rate: 20, // 0.20% for stablecoin pair
    protocol_fee: 5,
    created_at: new Date('2024-01-03').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export class MockDataProvider {
  private pools: Pool[] = [...MOCK_POOLS];

  getPool(poolId: string): Pool | undefined {
    return this.pools.find((p) => p.pool_id === poolId);
  }

  getAllPools(limit = 100, offset = 0): Pool[] {
    return this.pools.slice(offset, offset + limit);
  }

  updatePool(poolId: string, data: Partial<Pool>): Pool | undefined {
    const index = this.pools.findIndex((p) => p.pool_id === poolId);
    if (index === -1) return undefined;

    this.pools[index] = {
      ...this.pools[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return this.pools[index];
  }

  createPool(pool: Omit<Pool, 'created_at' | 'updated_at'>): Pool {
    const newPool: Pool = {
      ...pool,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.pools.push(newPool);
    return newPool;
  }

  // Calculate spot price for a pool (Y per X)
  getSpotPrice(poolId: string): number | null {
    const pool = this.getPool(poolId);
    if (!pool) return null;

    const reserveX = BigInt(pool.reserve_x);
    const reserveY = BigInt(pool.reserve_y);

    if (reserveX === 0n) return null;

    // Price with 6 decimal precision
    const price = Number(reserveY) / Number(reserveX);
    return price;
  }

  // Calculate swap output using constant product formula
  calculateSwapOutput(
    poolId: string,
    amountIn: bigint,
    isXToY: boolean
  ): {
    amountOut: bigint;
    priceImpact: number;
    fee: bigint;
  } | null {
    const pool = this.getPool(poolId);
    if (!pool) return null;

    const reserveX = BigInt(pool.reserve_x);
    const reserveY = BigInt(pool.reserve_y);
    const feeBps = BigInt(pool.fee_rate);

    const [reserveIn, reserveOut] = isXToY
      ? [reserveX, reserveY]
      : [reserveY, reserveX];

    if (amountIn === 0n || reserveIn === 0n || reserveOut === 0n) {
      return null;
    }

    // Calculate fee (e.g., 30 bps = 0.3%)
    const fee = (amountIn * feeBps) / 10000n;
    const amountInAfterFee = amountIn - fee;

    // Constant product formula: (reserveIn + amountIn) * (reserveOut - amountOut) = k
    // amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee)
    const numerator = amountInAfterFee * reserveOut;
    const denominator = reserveIn + amountInAfterFee;
    const amountOut = numerator / denominator;

    // Calculate price impact
    const spotPriceBefore = Number(reserveOut) / Number(reserveIn);
    const spotPriceAfter =
      Number(reserveOut - amountOut) / Number(reserveIn + amountIn);
    const priceImpact =
      ((spotPriceAfter - spotPriceBefore) / spotPriceBefore) * 100;

    return {
      amountOut,
      priceImpact,
      fee,
    };
  }
}

export const mockDataProvider = new MockDataProvider();
