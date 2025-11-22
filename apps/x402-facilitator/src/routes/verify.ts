/**
 * POST /verify - Verify payment signature and balance
 */

import type { VerificationResult, X402Payment } from "@carapace/x402-types"
import { Elysia, t } from "elysia"
import { config } from "../config"
import { logger } from "../services/logger"
import { isNonceUsed, markNonceAsUsed } from "../services/nonce-tracker"
import { verifyPaymentSignature } from "../services/signature-verifier"
import { checkBalance, getAddressFromPublicKey } from "../services/sui-client"
import { isValidAmount, isValidNonce, isValidSuiAddress } from "../utils/validation"

export const verifyRoute = new Elysia().post(
  "/verify",
  async ({ body, set }): Promise<VerificationResult | { error: string }> => {
    const payment = body as X402Payment
    const startTime = Date.now()

    logger.info({ payment: { ...payment, signature: "[REDACTED]" } }, "Verify request received")

    // 1. Validate scheme
    if (payment.scheme !== "exact") {
      set.status = 422
      logger.warn({ scheme: payment.scheme }, "Unsupported payment scheme")
      return {
        error: `Unsupported scheme: ${payment.scheme}. Only 'exact' is supported.`,
      }
    }

    // 2. Validate network
    if (!config.networks.includes(payment.network)) {
      set.status = 422
      logger.warn({ network: payment.network }, "Unsupported network")
      return {
        error: `Unsupported network: ${payment.network}. Supported networks: ${config.networks.join(", ")}`,
      }
    }

    // 3. Validate recipient address
    if (!isValidSuiAddress(payment.recipient)) {
      set.status = 422
      logger.warn({ recipient: payment.recipient }, "Invalid recipient address format")
      return {
        error: "Invalid recipient address format. Must be 0x followed by 64 hex characters.",
      }
    }

    // 4. Validate amount
    if (!isValidAmount(payment.amount)) {
      set.status = 422
      logger.warn({ amount: payment.amount }, "Invalid payment amount")
      return {
        error: "Invalid amount. Must be a positive integer.",
      }
    }

    // 5. Validate nonce format
    if (!isValidNonce(payment.nonce)) {
      set.status = 422
      logger.warn({ nonce: payment.nonce }, "Invalid nonce format")
      return {
        error: "Invalid nonce format. Must be a valid UUID v4.",
      }
    }

    // 6. Check for nonce replay
    const senderAddress = getAddressFromPublicKey(payment.publicKey)
    if (isNonceUsed(payment.nonce, senderAddress)) {
      set.status = 422
      logger.warn({ nonce: payment.nonce, address: senderAddress }, "Nonce replay detected")
      return {
        error: "Nonce has already been used. Please generate a new nonce.",
      }
    }

    // 7. Verify signature
    const signatureResult = await verifyPaymentSignature(
      payment.amount,
      payment.recipient,
      payment.nonce,
      payment.signature,
      payment.publicKey
    )

    if (!signatureResult.valid) {
      logger.warn(
        { nonce: payment.nonce, error: signatureResult.error },
        "Signature verification failed"
      )
      return {
        valid: false,
        reason: signatureResult.error || "Invalid signature",
      }
    }

    // 8. Check balance
    const balanceCheck = await checkBalance(senderAddress, payment.amount)

    if (!balanceCheck.sufficient) {
      logger.info(
        { address: senderAddress, required: payment.amount, available: balanceCheck.balance },
        "Insufficient balance"
      )
      return {
        valid: false,
        reason: `Insufficient balance. Required: ${payment.amount} MIST, Available: ${balanceCheck.balance} MIST`,
      }
    }

    // 9. Mark nonce as used (prevents replay)
    markNonceAsUsed(payment.nonce, senderAddress)

    // 10. All checks passed
    const duration = Date.now() - startTime
    logger.info(
      { nonce: payment.nonce, address: senderAddress, duration },
      "Payment verification successful"
    )

    return { valid: true }
  },
  {
    body: t.Object({
      scheme: t.String(),
      network: t.String(),
      amount: t.String(),
      recipient: t.String(),
      signature: t.String(),
      publicKey: t.String(),
      nonce: t.String(),
    }),
  }
)
