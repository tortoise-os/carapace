/**
 * Carapace Strategy SDK
 * Advanced strategy tools for flash loans, arbitrage, and leverage
 */

import { SuiClient } from '@mysten/sui/client';
import { FlashLoanClient } from './clients/flash-loan-client';
import { FlashLoanBuilder } from './builders/flash-loan-builder';

/**
 * Main Strategy SDK class
 */
export class StrategySDK {
  public client: SuiClient;
  public flashLoan: FlashLoanClient;
  public flashLoanBuilder: FlashLoanBuilder;

  constructor(
    client: SuiClient,
    packageId: string,
  ) {
    this.client = client;
    this.flashLoan = new FlashLoanClient(client, packageId);
    this.flashLoanBuilder = new FlashLoanBuilder(packageId);
  }
}

// Export all types
export * from './types';

// Export clients
export { FlashLoanClient } from './clients/flash-loan-client';

// Export builders
export { FlashLoanBuilder } from './builders/flash-loan-builder';

// Export utilities
export * from './utils/calculations';
