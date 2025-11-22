/**
 * Ed25519 signature verification service
 */

import { createPaymentMessage } from "@carapace/x402-types"
import { verifyPersonalMessageSignature } from "@mysten/sui/verify"

/**
 * Verify x402 payment signature
 */
export async function verifyPaymentSignature(
  amount: string,
  recipient: string,
  nonce: string,
  signature: string,
  _publicKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // 1. Reconstruct the message that should have been signed
    const message = createPaymentMessage(amount, recipient, nonce)
    const messageBytes = new TextEncoder().encode(message)

    // 2. Verify signature using Sui's built-in verifier
    // The signature is a base64 string which verifyPersonalMessageSignature accepts
    const isValid = await verifyPersonalMessageSignature(messageBytes, signature)

    if (!isValid) {
      return {
        valid: false,
        error: "Invalid signature - signature does not match message",
      }
    }

    return { valid: true }
  } catch (error) {
    console.error("Signature verification error:", error)
    return {
      valid: false,
      error: `Signature verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
