/**
 * API Client for Carapace Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

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

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  fee: string;
  route: string[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async getPools(limit = 100, offset = 0): Promise<Pool[]> {
    const response = await fetch(
      `${this.baseUrl}/api/pools?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch pools');
    }
    const data = await response.json();
    return data.data;
  }

  async getPool(poolId: string): Promise<Pool> {
    const response = await fetch(`${this.baseUrl}/api/pools/${poolId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pool');
    }
    const data = await response.json();
    return data.data;
  }

  async getSwapQuote(
    poolId: string,
    amountIn: string,
    isXToY: boolean
  ): Promise<SwapQuote> {
    const response = await fetch(
      `${this.baseUrl}/api/pools/${poolId}/quote?amountIn=${amountIn}&isXToY=${isXToY}`
    );
    if (!response.ok) {
      throw new Error('Failed to get quote');
    }
    const data = await response.json();
    return data.data;
  }

  async getSpotPrice(poolId: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/api/pools/${poolId}/price`);
    if (!response.ok) {
      throw new Error('Failed to get price');
    }
    const data = await response.json();
    return data.data.price;
  }

  async createSwapTransaction(
    poolId: string,
    params: {
      tokenIn: string;
      tokenOut: string;
      coinIn: string;
      amountIn: string;
      minAmountOut?: string;
      isXToY: boolean;
    }
  ): Promise<{ transaction: string }> {
    const response = await fetch(`${this.baseUrl}/api/pools/${poolId}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Failed to create swap transaction');
    }
    const data = await response.json();
    return data.data;
  }
}

export const apiClient = new ApiClient();
