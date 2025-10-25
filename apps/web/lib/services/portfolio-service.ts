import {
  Portfolio,
  TokenBalance,
  LiquidityPosition,
  PortfolioStats,
  PortfolioHistory,
  PortfolioPnL,
  PortfolioTransaction,
} from '../types/portfolio';

// Mock price data (in production, fetch from price oracles like Pyth)
const MOCK_PRICES: Record<string, { price: number; change24h: number }> = {
  SUI: { price: 2.35, change24h: 5.2 },
  USDC: { price: 1.0, change24h: 0.1 },
  BTC: { price: 45000, change24h: -2.3 },
  ETH: { price: 2800, change24h: 3.1 },
  USDT: { price: 1.0, change24h: 0.0 },
};

export class PortfolioService {
  /**
   * Get portfolio data for a user address
   */
  async getPortfolio(userAddress: string): Promise<Portfolio> {
    // In production, fetch actual balances from Sui blockchain
    const tokenBalances = await this.fetchTokenBalances(userAddress);
    const liquidityPositions = await this.fetchLiquidityPositions(userAddress);
    const history = await this.fetchPortfolioHistory(userAddress);

    const stats = this.calculateStats(tokenBalances, liquidityPositions, history);

    return {
      address: userAddress,
      tokenBalances,
      liquidityPositions,
      stats,
      history,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Fetch token balances for user
   */
  private async fetchTokenBalances(
    userAddress: string
  ): Promise<TokenBalance[]> {
    // Mock data - in production, query Sui RPC for actual balances
    const mockBalances: TokenBalance[] = [
      {
        token: '0x2::sui::SUI',
        tokenSymbol: 'SUI',
        balance: '1250.50',
        priceUSD: MOCK_PRICES.SUI.price,
        valueUSD: 1250.5 * MOCK_PRICES.SUI.price,
        change24h: MOCK_PRICES.SUI.change24h,
        allocation: 0,
      },
      {
        token: '0x2::usdc::USDC',
        tokenSymbol: 'USDC',
        balance: '5000.00',
        priceUSD: MOCK_PRICES.USDC.price,
        valueUSD: 5000.0 * MOCK_PRICES.USDC.price,
        change24h: MOCK_PRICES.USDC.change24h,
        allocation: 0,
      },
      {
        token: '0x2::btc::BTC',
        tokenSymbol: 'BTC',
        balance: '0.15',
        priceUSD: MOCK_PRICES.BTC.price,
        valueUSD: 0.15 * MOCK_PRICES.BTC.price,
        change24h: MOCK_PRICES.BTC.change24h,
        allocation: 0,
      },
      {
        token: '0x2::eth::ETH',
        tokenSymbol: 'ETH',
        balance: '2.5',
        priceUSD: MOCK_PRICES.ETH.price,
        valueUSD: 2.5 * MOCK_PRICES.ETH.price,
        change24h: MOCK_PRICES.ETH.change24h,
        allocation: 0,
      },
    ];

    return mockBalances;
  }

  /**
   * Fetch liquidity positions for user
   */
  private async fetchLiquidityPositions(
    userAddress: string
  ): Promise<LiquidityPosition[]> {
    // Mock data - in production, query pools for user positions
    const mockPositions: LiquidityPosition[] = [
      {
        poolId: 'pool_sui_usdc',
        tokenX: '0x2::sui::SUI',
        tokenY: '0x2::usdc::USDC',
        tokenXSymbol: 'SUI',
        tokenYSymbol: 'USDC',
        liquidityAmount: '500',
        valueUSD: 2500,
        allocation: 0,
        apy: 25.5,
        feesEarned24h: 12.5,
        feesEarnedTotal: 450,
      },
      {
        poolId: 'pool_eth_usdc',
        tokenX: '0x2::eth::ETH',
        tokenY: '0x2::usdc::USDC',
        tokenXSymbol: 'ETH',
        tokenYSymbol: 'USDC',
        liquidityAmount: '100',
        valueUSD: 1500,
        allocation: 0,
        apy: 18.2,
        feesEarned24h: 8.3,
        feesEarnedTotal: 280,
      },
    ];

    return mockPositions;
  }

  /**
   * Fetch portfolio value history
   */
  private async fetchPortfolioHistory(
    userAddress: string
  ): Promise<PortfolioHistory[]> {
    // Mock data - generate 30 days of history
    const history: PortfolioHistory[] = [];
    const now = Date.now();
    const baseValue = 15000;

    for (let i = 30; i >= 0; i--) {
      const timestamp = now - i * 24 * 60 * 60 * 1000;
      // Simulate some volatility
      const volatility = Math.sin(i / 5) * 1000 + Math.random() * 500;
      const totalValue = baseValue + volatility + (30 - i) * 50; // Trending up

      history.push({
        timestamp,
        totalValue,
        tokenBalanceValue: totalValue * 0.7,
        liquidityPositionValue: totalValue * 0.3,
      });
    }

    return history;
  }

  /**
   * Calculate portfolio statistics
   */
  private calculateStats(
    tokenBalances: TokenBalance[],
    liquidityPositions: LiquidityPosition[],
    history: PortfolioHistory[]
  ): PortfolioStats {
    // Calculate total values
    const tokenBalanceValue = tokenBalances.reduce(
      (sum, token) => sum + token.valueUSD,
      0
    );
    const liquidityPositionValue = liquidityPositions.reduce(
      (sum, pos) => sum + pos.valueUSD,
      0
    );
    const totalValue = tokenBalanceValue + liquidityPositionValue;

    // Calculate allocations
    tokenBalances.forEach((token) => {
      token.allocation = (token.valueUSD / totalValue) * 100;
    });
    liquidityPositions.forEach((pos) => {
      pos.allocation = (pos.valueUSD / totalValue) * 100;
    });

    // Calculate P&L
    const pnl = this.calculatePnL(history, totalValue);

    // Find top gainer and loser
    const sortedByChange = [...tokenBalances].sort(
      (a, b) => b.change24h - a.change24h
    );
    const topGainer =
      sortedByChange.length > 0 && sortedByChange[0].change24h > 0
        ? { token: sortedByChange[0].tokenSymbol, change: sortedByChange[0].change24h }
        : null;
    const topLoser =
      sortedByChange.length > 0 &&
      sortedByChange[sortedByChange.length - 1].change24h < 0
        ? {
            token: sortedByChange[sortedByChange.length - 1].tokenSymbol,
            change: sortedByChange[sortedByChange.length - 1].change24h,
          }
        : null;

    return {
      totalValue,
      tokenBalanceValue,
      liquidityPositionValue,
      totalTokens: tokenBalances.length,
      totalPositions: liquidityPositions.length,
      pnl,
      topGainer,
      topLoser,
    };
  }

  /**
   * Calculate profit/loss over different time periods
   */
  private calculatePnL(
    history: PortfolioHistory[],
    currentValue: number
  ): PortfolioPnL {
    const getDayAgoValue = (days: number) => {
      const targetTime = Date.now() - days * 24 * 60 * 60 * 1000;
      const closest = history.reduce((prev, curr) =>
        Math.abs(curr.timestamp - targetTime) <
        Math.abs(prev.timestamp - targetTime)
          ? curr
          : prev
      );
      return closest.totalValue;
    };

    const dayAgoValue = history.length >= 1 ? getDayAgoValue(1) : currentValue;
    const weekAgoValue = history.length >= 7 ? getDayAgoValue(7) : currentValue;
    const monthAgoValue =
      history.length >= 30 ? getDayAgoValue(30) : currentValue;
    const firstValue = history.length > 0 ? history[0].totalValue : currentValue;

    const daily = currentValue - dayAgoValue;
    const weekly = currentValue - weekAgoValue;
    const monthly = currentValue - monthAgoValue;
    const allTime = currentValue - firstValue;

    return {
      daily,
      dailyPercent: (daily / dayAgoValue) * 100,
      weekly,
      weeklyPercent: (weekly / weekAgoValue) * 100,
      monthly,
      monthlyPercent: (monthly / monthAgoValue) * 100,
      allTime,
      allTimePercent: (allTime / firstValue) * 100,
    };
  }

  /**
   * Get recent transactions
   */
  async getTransactions(
    userAddress: string,
    limit: number = 20
  ): Promise<PortfolioTransaction[]> {
    // Mock data - in production, query Sui blockchain events
    const mockTransactions: PortfolioTransaction[] = [
      {
        id: 'tx_1',
        type: 'swap',
        timestamp: Date.now() - 3600000,
        tokens: [
          { symbol: 'SUI', amount: '-100', valueUSD: -235 },
          { symbol: 'USDC', amount: '+235', valueUSD: 235 },
        ],
        txDigest: '0xabcd1234...',
        status: 'success',
      },
      {
        id: 'tx_2',
        type: 'add_liquidity',
        timestamp: Date.now() - 7200000,
        tokens: [
          { symbol: 'SUI', amount: '-50', valueUSD: -117.5 },
          { symbol: 'USDC', amount: '-117.5', valueUSD: -117.5 },
        ],
        txDigest: '0xefgh5678...',
        status: 'success',
      },
      {
        id: 'tx_3',
        type: 'claim_rewards',
        timestamp: Date.now() - 14400000,
        tokens: [{ symbol: 'SUI', amount: '+25', valueUSD: 58.75 }],
        txDigest: '0xijkl9012...',
        status: 'success',
      },
    ];

    return mockTransactions.slice(0, limit);
  }

  /**
   * Calculate asset allocation by type
   */
  getAssetAllocation(portfolio: Portfolio): {
    tokens: number;
    liquidity: number;
  } {
    const total = portfolio.stats.totalValue;
    return {
      tokens: (portfolio.stats.tokenBalanceValue / total) * 100,
      liquidity: (portfolio.stats.liquidityPositionValue / total) * 100,
    };
  }

  /**
   * Get rebalancing suggestions
   */
  getRebalancingSuggestions(portfolio: Portfolio): {
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[] {
    const suggestions: {
      message: string;
      severity: 'low' | 'medium' | 'high';
    }[] = [];
    const allocation = this.getAssetAllocation(portfolio);

    // Check if too concentrated in tokens
    if (allocation.tokens > 80) {
      suggestions.push({
        message:
          'Portfolio is heavily concentrated in token holdings. Consider providing liquidity to earn fees.',
        severity: 'medium',
      });
    }

    // Check for individual token concentration
    const topToken = portfolio.tokenBalances.reduce(
      (max, token) => (token.allocation > max.allocation ? token : max),
      portfolio.tokenBalances[0]
    );
    if (topToken && topToken.allocation > 50) {
      suggestions.push({
        message: `${topToken.tokenSymbol} represents ${topToken.allocation.toFixed(1)}% of your portfolio. Consider diversifying.`,
        severity: 'high',
      });
    }

    // Check for low-performing positions
    portfolio.liquidityPositions.forEach((pos) => {
      if (pos.apy < 5) {
        suggestions.push({
          message: `${pos.tokenXSymbol}/${pos.tokenYSymbol} pool has low APY (${pos.apy.toFixed(1)}%). Consider alternative pools.`,
          severity: 'low',
        });
      }
    });

    return suggestions;
  }
}

// Singleton instance
export const portfolioService = new PortfolioService();
