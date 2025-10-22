/**
 * Network configuration for Carapace SDK
 */

import type { Network, NetworkConfig, PackageIds } from './types';

export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  mainnet: {
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
  },
  testnet: {
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    faucetUrl: 'https://faucet.testnet.sui.io/gas',
  },
  devnet: {
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    faucetUrl: 'https://faucet.devnet.sui.io/gas',
  },
  localnet: {
    rpcUrl: 'http://127.0.0.1:9000',
    faucetUrl: 'http://127.0.0.1:9123/gas',
  },
};

// Package IDs (to be updated after deployment)
export const DEFAULT_PACKAGE_IDS: Record<Network, PackageIds> = {
  mainnet: {
    carapace: '0x0', // TODO: Update after mainnet deployment
  },
  testnet: {
    carapace: '0x998379bb53423871a9e4f8f779c339c096622209309452995ae5ed395779106e',
  },
  devnet: {
    carapace: '0x0', // TODO: Update after devnet deployment
  },
  localnet: {
    carapace: '0x0', // TODO: Update after local deployment
  },
};

// Constants
export const CONSTANTS = {
  BPS_DENOMINATOR: 10000,
  MIN_FEE_BPS: 20,
  MAX_FEE_BPS: 40,
  DEFAULT_FEE_BPS: 25,
  MINIMUM_LIQUIDITY: 1000n,
  PRICE_PRECISION: 1_000_000_000n, // 1e9
};
