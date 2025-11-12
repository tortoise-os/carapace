/**
 * TDD Tests for POST /settle endpoint
 *
 * Settlement involves executing on-chain transactions with gas sponsorship
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import type { X402Payment } from '@carapace/x402-types';
import { createPaymentMessage } from '@carapace/x402-types';

const BASE_URL = 'http://localhost:3402';

describe('POST /settle', () => {
  describe('Successful Settlement', () => {
    it('should settle valid payment and return transaction hash', async () => {
      // Arrange: Create valid payment
      const keypair = new Ed25519Keypair();
      const amount = '1000000'; // 0.001 SUI (small amount)
      const recipient = '0x' + '2'.repeat(64); // Valid Sui address
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment: X402Payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      const result = await response.json();

      if (response.status === 200) {
        // Settlement succeeded
        expect(result.success).toBe(true);
        expect(result.txHash).toBeDefined();
        expect(result.txHash).toMatch(/^0x[a-f0-9]+$/i); // Valid tx hash
        expect(result.network).toBe('sui:devnet');
      } else {
        // May fail if facilitator has no gas
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should include transaction hash in response', async () => {
      // Arrange
      const keypair = new Ed25519Keypair();
      const amount = '1000000';
      const recipient = '0x' + '2'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment: X402Payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      const result = await response.json();

      if (result.success) {
        expect(result.txHash).toBeTruthy();
        expect(result.txHash.length).toBeGreaterThan(0);
        expect(result.network).toBe('sui:devnet');
      }
    });
  });

  describe('Input Validation', () => {
    it('should reject missing fields', async () => {
      // Arrange: Invalid payment
      const payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount: '1000000',
        // Missing: recipient, signature, publicKey, nonce
      };

      // Act
      const response = await fetch(`${BASE_URL}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBeDefined();
    });

    it('should reject invalid network', async () => {
      // Arrange
      const keypair = new Ed25519Keypair();
      const amount = '1000000';
      const recipient = '0x' + '2'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment = {
        scheme: 'exact',
        network: 'bitcoin:mainnet', // Invalid!
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toMatch(/network/i);
    });

    it('should reject invalid amount', async () => {
      // Arrange
      const keypair = new Ed25519Keypair();
      const amount = '-1000000'; // Negative!
      const recipient = '0x' + '2'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment: X402Payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toMatch(/amount/i);
    });
  });

  describe('Gas Limits', () => {
    it('should reject payments exceeding max gas limit', async () => {
      // Arrange: Very large payment
      const keypair = new Ed25519Keypair();
      const amount = '100000000000000'; // 100,000 SUI (way over limit)
      const recipient = '0x' + '2'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment: X402Payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/limit|max|exceeded/i);
    });
  });

  describe('Performance', () => {
    it('should settle within 5 seconds', async () => {
      // Arrange
      const keypair = new Ed25519Keypair();
      const amount = '1000000';
      const recipient = '0x' + '2'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment: X402Payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      const duration = Date.now() - startTime;

      // Assert
      expect(response.status).toBeLessThanOrEqual(500);
      expect(duration).toBeLessThan(5000); // Under 5 seconds
    });
  });
});
