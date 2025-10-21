export interface TokenMetadata {
  /** Full coin type (e.g., '0x2::sui::SUI') */
  coinType: string;
  /** Token symbol (e.g., 'SUI', 'USDC') */
  symbol: string;
  /** Full token name (e.g., 'Sui', 'USD Coin') */
  name: string;
  /** Number of decimals */
  decimals: number;
  /** Icon URL (can be HTTP, IPFS, or data URI) */
  iconUrl?: string;
  /** Token description */
  description?: string;
  /** Additional metadata */
  metadata?: {
    coingeckoId?: string;
    website?: string;
    twitter?: string;
  };
}

export interface TokenIconProps {
  coinType: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export enum TokenIconSize {
  xs = 16,
  sm = 24,
  md = 32,
  lg = 48,
  xl = 64,
}
