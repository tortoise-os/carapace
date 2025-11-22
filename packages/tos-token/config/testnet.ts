/**
 * TOS Token Configuration - Sui Testnet
 *
 * Deployed: 2025-11-21
 * Transaction: 7ffQQiLj433igN486ozUrxaXWfwVB7wt2u1inBXt2pFt
 */

export const TOS_TOKEN_CONFIG = {
  // Package ID (Main Contract)
  packageId: '0x3ccba4fb5de5fccf31aa6c5fe27723f2467d0fbe3e47e65e91290ddf3adfae1e',

  // Coin Type (Full Type Identifier)
  coinType: '0x3ccba4fb5de5fccf31aa6c5fe27723f2467d0fbe3e47e65e91290ddf3adfae1e::token::TOKEN',

  // Object IDs
  objects: {
    treasuryCap: '0x86864a25a3f3ab86dddf8985e78f11f9ca32d627aea589bf23c004c0e6baccf1',
    coinMetadata: '0x4181e05e1813e3b21782a4489cdd960e26f6915102435e73335108a232980ff5',
    initialSupplyCoin: '0xe77aff4ac5ebf98605886763f1074f88bcfa237eabe0c46e9a5f742016c15bc1',
    upgradeCap: '0xbda186d5be7f8b92e27420bdbb0e8298a9b995fb33c73f22c9842bf43d358129',
  },

  // Token Details
  token: {
    symbol: 'TOS',
    name: 'Tortoise OS Token',
    decimals: 9,
    totalSupply: '1000000000000000000', // 1B * 10^9
    description: 'Utility token powering the Carapace ecosystem. Slow and Steady Builds the Future.',
    iconUrl: 'https://tortoise-os.io/tos-icon.png',
  },

  // Network
  network: {
    name: 'testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
  },

  // Explorer URLs
  explorer: {
    package: 'https://testnet.suivision.xyz/package/0x3ccba4fb5de5fccf31aa6c5fe27723f2467d0fbe3e47e65e91290ddf3adfae1e',
    deploymentTx: 'https://testnet.suivision.xyz/txblock/7ffQQiLj433igN486ozUrxaXWfwVB7wt2u1inBXt2pFt',
  },

  // Functions
  functions: {
    burn: `${this.packageId}::token::burn`,
    totalSupply: `${this.packageId}::token::total_supply`,
  },
} as const;

// Helper to format TOS amounts (from smallest unit to human-readable)
export function formatTOS(amount: string | number | bigint): string {
  const decimals = TOS_TOKEN_CONFIG.token.decimals;
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  return `${integerPart}.${fractionalStr}`.replace(/\.?0+$/, '');
}

// Helper to parse TOS amounts (from human-readable to smallest unit)
export function parseTOS(amount: string | number): bigint {
  const decimals = TOS_TOKEN_CONFIG.token.decimals;
  const [integerStr = '0', fractionalStr = '0'] = amount.toString().split('.');
  const fractionalPadded = fractionalStr.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integerStr) * BigInt(10 ** decimals) + BigInt(fractionalPadded);
}

// Type exports
export type TOSTokenConfig = typeof TOS_TOKEN_CONFIG;
