/**
 * POST /verify - Verify payment signature and balance
 */

import { Elysia, t } from 'elysia';
import type { X402Payment, VerificationResult } from '@carapace/x402-types';
import { verifyPaymentSignature } from '../services/signature-verifier';
import { checkBalance, getAddressFromPublicKey } from '../services/sui-client';
import { config } from '../config';

export const verifyRoute = new Elysia()
  .post(
    '/verify',
    async ({ body }): Promise<VerificationResult> => {
      const payment = body as X402Payment;

      // 1. Validate scheme
      if (payment.scheme !== 'exact') {
        return {
          valid: false,
          reason: `Unsupported scheme: ${payment.scheme}. Only 'exact' is supported.`,
        };
      }

      // 2. Validate network
      if (!config.networks.includes(payment.network)) {
        return {
          valid: false,
          reason: `Unsupported network: ${payment.network}. Supported networks: ${config.networks.join(', ')}`,
        };
      }

      // 3. Verify signature
      const signatureResult = await verifyPaymentSignature(
        payment.amount,
        payment.recipient,
        payment.nonce,
        payment.signature,
        payment.publicKey
      );

      if (!signatureResult.valid) {
        return {
          valid: false,
          reason: signatureResult.error || 'Invalid signature',
        };
      }

      // 4. Get sender address from public key
      const senderAddress = getAddressFromPublicKey(payment.publicKey);

      // 5. Check balance
      const balanceCheck = await checkBalance(senderAddress, payment.amount);

      if (!balanceCheck.sufficient) {
        return {
          valid: false,
          reason: `Insufficient balance. Required: ${payment.amount} MIST, Available: ${balanceCheck.balance} MIST`,
        };
      }

      // 6. All checks passed
      return { valid: true };
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
  );
