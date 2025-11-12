/**
 * POST /settle - Execute on-chain payment with gas sponsorship
 */

import { Elysia, t } from 'elysia';
import { Transaction } from '@mysten/sui/transactions';
import type { X402Payment, SettlementResult } from '@carapace/x402-types';
import { suiClient, getFacilitatorKeypair } from '../services/sui-client';
import { config } from '../config';

export const settleRoute = new Elysia()
  .post(
    '/settle',
    async ({ body }): Promise<SettlementResult> => {
      const payment = body as X402Payment;

      // 1. Validate scheme
      if (payment.scheme !== 'exact') {
        return {
          success: false,
          error: `Unsupported scheme: ${payment.scheme}`,
        };
      }

      // 2. Validate network
      if (!config.networks.includes(payment.network)) {
        return {
          success: false,
          error: `Unsupported network: ${payment.network}`,
        };
      }

      // 3. Validate amount (must be positive)
      const amount = BigInt(payment.amount);
      if (amount <= 0n) {
        return {
          success: false,
          error: 'Amount must be positive',
        };
      }

      // 4. Check gas limit
      if (amount > BigInt(config.maxGasPerTransaction)) {
        return {
          success: false,
          error: `Amount exceeds max limit: ${config.maxGasPerTransaction} MIST`,
        };
      }

      try {
        // 5. Get facilitator keypair for gas sponsorship
        const facilitatorKeypair = getFacilitatorKeypair();

        // 6. Build transaction
        const tx = new Transaction();

        // Split coins from gas coin and transfer to recipient
        tx.transferObjects(
          [tx.splitCoins(tx.gas, [tx.pure.u64(payment.amount)])],
          tx.pure.address(payment.recipient)
        );

        // Set gas budget
        tx.setGasBudget(config.maxGasPerTransaction);

        // 7. Execute transaction with facilitator as sponsor
        const result = await suiClient.signAndExecuteTransaction({
          signer: facilitatorKeypair,
          transaction: tx,
          options: {
            showEffects: true,
            showEvents: true,
          },
        });

        // 8. Check transaction status
        if (result.effects?.status?.status !== 'success') {
          const error = result.effects?.status?.error || 'Transaction failed';
          console.error('Settlement failed:', error);
          return {
            success: false,
            error: `Transaction failed: ${error}`,
          };
        }

        // 9. Return success with transaction hash
        return {
          success: true,
          txHash: result.digest,
          network: payment.network,
        };
      } catch (error) {
        console.error('Settlement error:', error);
        return {
          success: false,
          error: `Settlement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
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
  );
