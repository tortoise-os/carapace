/**
 * Sui blockchain client service
 */

import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { config } from '../config';

/**
 * Global Sui client instance
 */
export const suiClient = new SuiClient({ url: config.suiRpcUrl });

/**
 * Facilitator keypair for gas sponsorship
 */
let facilitatorKeypair: Ed25519Keypair | null = null;

/**
 * Get facilitator keypair (lazy initialization)
 */
export function getFacilitatorKeypair(): Ed25519Keypair {
  if (!facilitatorKeypair) {
    if (!config.facilitatorPrivateKey) {
      throw new Error('FACILITATOR_PRIVATE_KEY not configured');
    }

    // Decode from base64 or hex
    const keyData = config.facilitatorPrivateKey.startsWith('suiprivkey')
      ? config.facilitatorPrivateKey
      : Buffer.from(config.facilitatorPrivateKey, 'base64');

    facilitatorKeypair = Ed25519Keypair.fromSecretKey(keyData);
  }

  return facilitatorKeypair;
}

/**
 * Get Sui address from public key
 */
export function getAddressFromPublicKey(publicKeyBase64: string): string {
  const publicKeyBytes = Buffer.from(publicKeyBase64, 'base64');
  const keypair = Ed25519Keypair.fromPublicKey(publicKeyBytes);
  return keypair.toSuiAddress();
}

/**
 * Check if address has sufficient balance
 */
export async function checkBalance(
  address: string,
  requiredAmount: string
): Promise<{ sufficient: boolean; balance: string }> {
  try {
    const balanceResult = await suiClient.getBalance({
      owner: address,
      coinType: '0x2::sui::SUI',
    });

    const balance = BigInt(balanceResult.totalBalance);
    const required = BigInt(requiredAmount);

    return {
      sufficient: balance >= required,
      balance: balanceResult.totalBalance,
    };
  } catch (error) {
    console.error('Balance check failed:', error);
    return {
      sufficient: false,
      balance: '0',
    };
  }
}
