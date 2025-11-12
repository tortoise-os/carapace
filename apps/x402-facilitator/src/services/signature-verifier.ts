/**
 * Ed25519 signature verification service
 */

import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { createPaymentMessage } from '@carapace/x402-types';

/**
 * Verify x402 payment signature
 */
export async function verifyPaymentSignature(
  amount: string,
  recipient: string,
  nonce: string,
  signature: string,
  publicKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // 1. Reconstruct the message that should have been signed
    const message = createPaymentMessage(amount, recipient, nonce);
    const messageBytes = new TextEncoder().encode(message);

    // 2. Decode signature and public key from base64
    const signatureBytes = Buffer.from(signature, 'base64');
    const publicKeyBytes = Buffer.from(publicKey, 'base64');

    // 3. Verify signature using Sui's built-in verifier
    const isValid = await verifyPersonalMessageSignature(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid signature - signature does not match message',
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Signature verification error:', error);
    return {
      valid: false,
      error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
