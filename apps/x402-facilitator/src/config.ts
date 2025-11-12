/**
 * Configuration for x402 facilitator
 */

import type { SuiNetwork } from '@carapace/x402-types';

export const config = {
  // Server configuration
  port: Number.parseInt(process.env.PORT || '3402'),

  // Sui RPC configuration
  suiRpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.devnet.sui.io:443',

  // Facilitator keypair for gas sponsorship
  facilitatorPrivateKey: process.env.FACILITATOR_PRIVATE_KEY || '',

  // Supported networks
  networks: (process.env.SUPPORTED_NETWORKS?.split(',') || [
    'sui:devnet',
    'sui:testnet',
    'sui:mainnet'
  ]) as SuiNetwork[],

  // Payment validation
  maxPaymentAgeMs: Number.parseInt(process.env.MAX_PAYMENT_AGE_MS || '30000'), // 30 seconds

  // Gas limits
  maxGasPerTransaction: Number.parseInt(process.env.MAX_GAS_PER_TX || '10000000'), // 0.01 SUI
} as const;

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.facilitatorPrivateKey) {
    errors.push('FACILITATOR_PRIVATE_KEY environment variable is required');
  }

  if (!config.suiRpcUrl) {
    errors.push('SUI_RPC_URL environment variable is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
