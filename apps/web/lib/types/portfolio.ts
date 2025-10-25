export interface TokenBalance {
  token: string;
  tokenSymbol: string;
  balance: string;
  valueUSD: number;
  priceUSD: number;
  change24h: number;
  allocation: number; // Percentage of total portfolio
}

export interface LiquidityPosition {
  poolId: string;
  tokenX: string;
  tokenY: string;
  tokenXSymbol: string;
  tokenYSymbol: string;
  liquidityAmount: string;
  valueUSD: number;
  allocation: number;
  apy: number;
  feesEarned24h: number;
  feesEarnedTotal: number;
}

export interface PortfolioHistory {
  timestamp: number;
  totalValue: number;
  tokenBalanceValue: number;
  liquidityPositionValue: number;
}

export interface PortfolioPnL {
  daily: number;
  dailyPercent: number;
  weekly: number;
  weeklyPercent: number;
  monthly: number;
  monthlyPercent: number;
  allTime: number;
  allTimePercent: number;
}

export interface PortfolioStats {
  totalValue: number;
  tokenBalanceValue: number;
  liquidityPositionValue: number;
  totalTokens: number;
  totalPositions: number;
  pnl: PortfolioPnL;
  topGainer: {
    token: string;
    change: number;
  } | null;
  topLoser: {
    token: string;
    change: number;
  } | null;
}

export interface Portfolio {
  address: string;
  tokenBalances: TokenBalance[];
  liquidityPositions: LiquidityPosition[];
  stats: PortfolioStats;
  history: PortfolioHistory[];
  lastUpdated: number;
}

export interface PortfolioTransaction {
  id: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'claim_rewards';
  timestamp: number;
  tokens: {
    symbol: string;
    amount: string;
    valueUSD: number;
  }[];
  txDigest: string;
  status: 'success' | 'failed';
}
