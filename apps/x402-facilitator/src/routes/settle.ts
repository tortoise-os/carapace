/**
 * POST /settle - Execute on-chain payment with gas sponsorship
 */

import type { SettlementResult, X402Payment } from "@carapace/x402-types"
import { Transaction } from "@mysten/sui/transactions"
import { Elysia, t } from "elysia"
import pRetry from "p-retry"
import { config } from "../config"
import { logger } from "../services/logger"
import { isNonceUsed, markNonceAsUsed } from "../services/nonce-tracker"
import { verifyPaymentSignature } from "../services/signature-verifier"
import { getAddressFromPublicKey, getFacilitatorKeypair, resilientSuiClient, suiClient } from "../services/sui-client"
import { isValidAmount, isValidNonce, isValidSuiAddress } from "../utils/validation"

export const settleRoute = new Elysia().post(
  "/settle",
  async ({ body, set }): Promise<SettlementResult | { error: string }> => {
    const payment = body as X402Payment
    const startTime = Date.now()

    logger.info({ payment: { ...payment, signature: "[REDACTED]" } }, "Settlement request received")

    // 1. Validate scheme
    if (payment.scheme !== "exact") {
      set.status = 422
      logger.warn({ scheme: payment.scheme }, "Unsupported payment scheme")
      return {
        error: `Unsupported scheme: ${payment.scheme}`,
      }
    }

    // 2. Validate network
    if (!config.networks.includes(payment.network)) {
      set.status = 422
      logger.warn({ network: payment.network }, "Unsupported network")
      return {
        error: `Unsupported network: ${payment.network}`,
      }
    }

    // 3. Validate recipient address
    if (!isValidSuiAddress(payment.recipient)) {
      set.status = 422
      logger.warn({ recipient: payment.recipient }, "Invalid recipient address")
      return {
        error: "Invalid recipient address format",
      }
    }

    // 4. Validate amount
    if (!isValidAmount(payment.amount, config.maxGasPerTransaction.toString())) {
      set.status = 422
      logger.warn({ amount: payment.amount }, "Invalid payment amount")
      return {
        error: "Invalid amount",
      }
    }

    const amount = BigInt(payment.amount)
    if (amount <= 0n) {
      set.status = 422
      return {
        error: "Amount must be positive",
      }
    }

    // 5. Check gas limit
    if (amount > BigInt(config.maxGasPerTransaction)) {
      set.status = 413
      logger.warn(
        { amount: payment.amount, limit: config.maxGasPerTransaction },
        "Amount exceeds limit"
      )
      return {
        error: `Amount exceeds max limit: ${config.maxGasPerTransaction} MIST`,
      }
    }

    // 6. Validate nonce
    if (!isValidNonce(payment.nonce)) {
      set.status = 422
      logger.warn({ nonce: payment.nonce }, "Invalid nonce format")
      return {
        error: "Invalid nonce format",
      }
    }

    // 7. Check for nonce replay
    const senderAddress = getAddressFromPublicKey(payment.publicKey)
    if (isNonceUsed(payment.nonce, senderAddress)) {
      set.status = 422
      logger.warn(
        { nonce: payment.nonce, address: senderAddress },
        "Nonce replay detected in settlement"
      )
      return {
        error: "Nonce has already been used",
      }
    }

    // 8. Verify signature
    const signatureResult = await verifyPaymentSignature(
      payment.amount,
      payment.recipient,
      payment.nonce,
      payment.signature,
      payment.publicKey
    )

    if (!signatureResult.valid) {
      set.status = 422
      logger.warn(
        { nonce: payment.nonce, error: signatureResult.error },
        "Signature verification failed"
      )
      return {
        error: signatureResult.error || "Invalid signature",
      }
    }

    try {
      // 9. Get facilitator keypair for gas sponsorship
      const facilitatorKeypair = getFacilitatorKeypair()

      // 10. Build transaction
      const tx = new Transaction()

      // Split coins from gas coin and transfer to recipient
      tx.transferObjects(
        [tx.splitCoins(tx.gas, [tx.pure.u64(payment.amount)])],
        tx.pure.address(payment.recipient)
      )

      // Set proper gas budget (for transaction execution, not payment amount)
      tx.setGasBudget(config.gasBudget)

      // 11. Execute transaction with resilient client (retry + circuit breaker)
      const result = await resilientSuiClient.signAndExecuteTransaction({
        signer: facilitatorKeypair,
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      })

      // 12. Check transaction status
      if (result.effects?.status?.status !== "success") {
        const error = result.effects?.status?.error || "Transaction failed"
        logger.error({ nonce: payment.nonce, txError: error }, "Transaction execution failed")
        return {
          success: false,
          error: `Transaction failed: ${error}`,
        }
      }

      // 13. Mark nonce as used (only after successful transaction)
      markNonceAsUsed(payment.nonce, senderAddress)

      // 14. Return success with transaction hash
      const duration = Date.now() - startTime
      logger.info(
        {
          nonce: payment.nonce,
          txHash: result.digest,
          recipient: payment.recipient,
          amount: payment.amount,
          duration,
        },
        "Settlement successful"
      )

      return {
        success: true,
        txHash: result.digest,
        network: payment.network,
      }
    } catch (error) {
      logger.error({ error, nonce: payment.nonce }, "Settlement failed with exception")
      return {
        success: false,
        error:
          config.nodeEnv === "production"
            ? "Settlement failed"
            : `Settlement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
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
