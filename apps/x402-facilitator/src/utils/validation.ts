/**
 * Input validation utilities
 */

/**
 * Validate Sui address format (0x followed by 64 hex characters)
 */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address)
}

/**
 * Validate amount is positive and not exceeding limits
 */
export function isValidAmount(amount: string, maxAmount?: string): boolean {
  try {
    const amountBigInt = BigInt(amount)

    if (amountBigInt <= 0n) {
      return false
    }

    if (maxAmount && amountBigInt > BigInt(maxAmount)) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validate nonce format (UUID v4)
 */
export function isValidNonce(nonce: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(nonce)
}
