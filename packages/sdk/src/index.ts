/**
 * Carapace SDK - TypeScript SDK for Carapace DeFi on Sui
 */

import { SuiClient } from '@mysten/sui/client';
import { PoolClient } from './pool-client';
import { BalanceClient } from './balance-client';
import { OracleClient } from './oracle-client';
import { RouterClient } from './router-client';
import { TokenMetadataService } from './services/token-metadata';
import { NETWORK_CONFIGS, DEFAULT_PACKAGE_IDS } from './config';
import type { CarapaceSDKOptions, Network, PackageIds } from './types';

export class CarapaceSDK {
  public client: SuiClient;
  public pool: PoolClient;
  public balance: BalanceClient;
  public oracle: OracleClient;
  public router: RouterClient;
  public tokenMetadata: TokenMetadataService;
  public packageIds: PackageIds;
  public network: Network;

  constructor(options: CarapaceSDKOptions) {
    this.network = options.network;

    // Initialize Sui client
    const config = NETWORK_CONFIGS[options.network];
    const rpcUrl = options.rpcUrl || config.rpcUrl;
    this.client = new SuiClient({ url: rpcUrl });

    // Set package IDs
    this.packageIds = {
      ...DEFAULT_PACKAGE_IDS[options.network],
      ...options.packageIds,
    };

    // Initialize clients
    this.pool = new PoolClient(this.client, this.packageIds.carapace);
    this.balance = new BalanceClient(this.client);
    this.oracle = new OracleClient(options.network);
    this.router = new RouterClient(this.packageIds.carapace);
    this.tokenMetadata = new TokenMetadataService(this.client);
  }

  /**
   * Update package IDs after deployment
   */
  setPackageIds(packageIds: Partial<PackageIds>) {
    this.packageIds = { ...this.packageIds, ...packageIds };
    this.pool = new PoolClient(this.client, this.packageIds.carapace);
  }
}

// Re-export types and utilities
export * from './types';
export * from './types/token';
export * from './config';
export { PoolClient } from './pool-client';
export { BalanceClient } from './balance-client';
export type { TokenBalance } from './balance-client';
export { OracleClient, PYTH_PRICE_FEED_IDS } from './oracle-client';
export type { TokenPrice } from './oracle-client';
export { RouterClient } from './router-client';
export type { Pool, SwapRoute } from './router-client';
export { TokenMetadataService } from './services/token-metadata';
