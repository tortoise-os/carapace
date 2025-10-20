/**
 * Carapace SDK - TypeScript SDK for Carapace DeFi on Sui
 */

import { SuiClient } from '@mysten/sui.js/client';
import { PoolClient } from './pool-client';
import { NETWORK_CONFIGS, DEFAULT_PACKAGE_IDS } from './config';
import type { CarapaceSDKOptions, Network, PackageIds } from './types';

export class CarapaceSDK {
  public client: SuiClient;
  public pool: PoolClient;
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
export * from './config';
export { PoolClient } from './pool-client';
