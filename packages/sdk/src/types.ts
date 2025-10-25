/**
 * Carapace SDK Type Definitions
 */

// Network Configuration
export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

export interface NetworkConfig {
  rpcUrl: string;
  faucetUrl?: string;
}

// Package IDs (will be set after deployment)
export interface PackageIds {
  carapace: string;
}

// Pool Types
export interface PoolInfo<X = string, Y = string> {
  poolId: string;
  tokenX: X;
  tokenY: Y;
  reserveX: bigint;
  reserveY: bigint;
  lpSupply: bigint;
  feeBps: number;
  protocolFeeBps: number;
  protocolFeeX: bigint;
  protocolFeeY: bigint;
}

export interface SwapQuote {
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number;
  fee: bigint;
  route: string[];
}

export interface LiquidityQuote {
  amountX: bigint;
  amountY: bigint;
  lpTokens: bigint;
  shareOfPool: number;
}

// Transaction Options
export interface TxOptions {
  gasBudget?: bigint;
  sender?: string;
}

// SDK Options
export interface CarapaceSDKOptions {
  network: Network;
  rpcUrl?: string;
  packageIds?: Partial<PackageIds>;
}

// Event Types
export interface PoolCreatedEvent {
  poolId: string;
  feeBps: number;
}

export interface LiquidityEvent {
  poolId: string;
  provider: string;
  amountX: bigint;
  amountY: bigint;
  liquidity: bigint;
}

export interface SwapEvent {
  poolId: string;
  amountIn: bigint;
  amountOut: bigint;
  isXToY: boolean;
  feeAmount: bigint;
}

// Helper types
export type CoinType = string;
export type ObjectId = string;
export type Address = string;
