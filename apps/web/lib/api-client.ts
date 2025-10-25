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

export interface ProtocolAnalytics {
  totalValueLocked: string;
  volume24h: string;
  volume7d: string;
  fees24h: string;
  fees7d: string;
  totalPools: number;
  totalTransactions: number;
}

export interface PoolAnalytics {
  poolId: string;
  tvl: string;
  volume24h: string;
  volume7d: string;
  fees24h: string;
  fees7d: string;
  apr: number;
}

export interface PoolWithAnalytics extends Pool {
  analytics: PoolAnalytics;
}

export interface LiquidityPosition {
  id: string;
  poolId: string;
  userAddress: string;
  lpTokenBalance: string;
  shareOfPool: number;
  tokenXAmount: string;
  tokenYAmount: string;
  tokenXSymbol: string;
  tokenYSymbol: string;
  valueUSD: string;
  feesEarnedUSD: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface UserPositions {
  positions: LiquidityPosition[];
  totalValueUSD: string;
  totalFeesEarnedUSD: string;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  verified: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenListResponse {
  tokens: Token[];
  total: number;
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

  async getProtocolAnalytics(): Promise<ProtocolAnalytics> {
    const response = await fetch(`${this.baseUrl}/api/analytics/protocol`);
    if (!response.ok) {
      throw new Error('Failed to fetch protocol analytics');
    }
    const data = await response.json();
    return data.data;
  }

  async getPoolAnalytics(params?: {
    limit?: number;
    offset?: number;
    sortBy?: 'tvl' | 'volume24h' | 'apr';
    order?: 'asc' | 'desc';
  }): Promise<PoolWithAnalytics[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params?.order) queryParams.set('order', params.order);

    const response = await fetch(
      `${this.baseUrl}/api/analytics/pools?${queryParams.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch pool analytics');
    }
    const data = await response.json();
    return data.data;
  }

  async getPoolAnalyticsById(poolId: string): Promise<{
    pool: Pool;
    analytics: PoolAnalytics;
  }> {
    const response = await fetch(`${this.baseUrl}/api/analytics/${poolId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pool analytics');
    }
    const data = await response.json();
    return data.data;
  }

  async getUserPositions(address: string): Promise<UserPositions> {
    const response = await fetch(`${this.baseUrl}/api/positions/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user positions');
    }
    const data = await response.json();
    return data.data;
  }

  async getPosition(address: string, poolId: string): Promise<LiquidityPosition> {
    const response = await fetch(`${this.baseUrl}/api/positions/${address}/${poolId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch position');
    }
    const data = await response.json();
    return data.data;
  }

  async calculateAddLiquidity(params: {
    poolId: string;
    tokenXAmount: string;
    tokenYAmount: string;
  }): Promise<{
    amountX: string;
    amountY: string;
    lpTokens: string;
    shareOfPool: number;
  }> {
    const response = await fetch(`${this.baseUrl}/api/positions/calculate-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Failed to calculate add liquidity');
    }
    const data = await response.json();
    return data.data;
  }

  async calculateRemoveLiquidity(params: {
    poolId: string;
    lpTokenAmount: string;
  }): Promise<{
    amountX: string;
    amountY: string;
    feesX: string;
    feesY: string;
    totalX: string;
    totalY: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/positions/calculate-remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Failed to calculate remove liquidity');
    }
    const data = await response.json();
    return data.data;
  }

  async getTokens(params?: {
    enabled?: boolean;
    verified?: boolean;
  }): Promise<TokenListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.enabled !== undefined) queryParams.set('enabled', params.enabled.toString());
    if (params?.verified !== undefined) queryParams.set('verified', params.verified.toString());

    const response = await fetch(
      `${this.baseUrl}/api/tokens?${queryParams.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch tokens');
    }
    return response.json();
  }

  async getToken(id: string): Promise<Token | null> {
    const response = await fetch(`${this.baseUrl}/api/tokens/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }
    return response.json();
  }

  async getTokenByAddress(address: string): Promise<Token | null> {
    const response = await fetch(`${this.baseUrl}/api/tokens/address/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }
    return response.json();
  }

  async addToken(params: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoUrl?: string;
  }): Promise<Token> {
    const response = await fetch(`${this.baseUrl}/api/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Failed to add token');
    }
    return response.json();
  }

  async updateToken(id: string, params: {
    name?: string;
    logoUrl?: string;
    verified?: boolean;
    enabled?: boolean;
  }): Promise<Token> {
    const response = await fetch(`${this.baseUrl}/api/tokens/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Failed to update token');
    }
    return response.json();
  }

  async deleteToken(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/tokens/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete token');
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
