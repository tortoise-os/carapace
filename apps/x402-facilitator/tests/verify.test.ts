/**
 * TDD Tests for POST /verify endpoint
 *
 * Test-Driven Development: Write tests first, then implement
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import type { X402Payment } from '@carapace/x402-types';
import { createPaymentMessage } from '@carapace/x402-types';

// Will implement the app later
let app: any;
const BASE_URL = 'http://localhost:3402';

describe('POST /verify', () => {
  beforeAll(async () => {
    // TODO: Import and start Elysia app
    // const { createApp } = await import('../src/index');
    // app = createApp();
    // await app.listen(3402);
  });

  describe('Signature Validation', () => {
    it('should accept valid payment signature', async () => {
      // Arrange: Create valid payment
      const keypair = new Ed25519Keypair();
      const amount = '1000000'; // 0.001 SUI
      const recipient = '0x' + '1'.repeat(64);
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

      // Act: Send to /verify
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert: Should validate signature (may fail on balance check)
      expect(response.status).toBe(200);
      const result = await response.json();

      // Signature should be valid
      // May fail on balance check if test wallet has no funds
      if (!result.valid && result.reason) {
        expect(result.reason).toContain('balance');
      }
    });

    it('should reject invalid signature', async () => {
      // Arrange: Create payment with wrong signature
      const keypair = new Ed25519Keypair();
      const otherKeypair = new Ed25519Keypair(); // Different key

      const amount = '1000000';
      const recipient = '0x' + '1'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);

      // Sign with different keypair
      const signatureBytes = await otherKeypair.signPersonalMessage(messageBytes);

      const payment: X402Payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(), // Wrong key
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('signature');
    });

    it('should reject tampered amount', async () => {
      // Arrange: Sign one amount, send different amount
      const keypair = new Ed25519Keypair();
      const signedAmount = '1000000';
      const sentAmount = '2000000'; // Tampered!
      const recipient = '0x' + '1'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(signedAmount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment: X402Payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount: sentAmount, // Different from signed amount
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('signature');
    });
  });

  describe('Balance Validation', () => {
    it('should check if sender has sufficient balance', async () => {
      // Arrange: Create payment (likely insufficient balance on random wallet)
      const keypair = new Ed25519Keypair();
      const amount = '1000000000000'; // 1000 SUI (way too much)
      const recipient = '0x' + '1'.repeat(64);
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
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/balance|insufficient/i);
    });
  });

  describe('Input Validation', () => {
    it('should reject missing fields', async () => {
      // Arrange: Invalid payment (missing signature)
      const payment = {
        scheme: 'exact',
        network: 'sui:devnet',
        amount: '1000000',
        recipient: '0x' + '1'.repeat(64),
        // Missing: signature, publicKey, nonce
      };

      // Act
      const response = await fetch(`${BASE_URL}/verify`, {
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
      // Arrange: Payment with unsupported network
      const keypair = new Ed25519Keypair();
      const amount = '1000000';
      const recipient = '0x' + '1'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment = {
        scheme: 'exact',
        network: 'ethereum:mainnet', // Invalid!
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toMatch(/network/i);
    });

    it('should reject invalid scheme', async () => {
      // Arrange: Payment with unsupported scheme
      const keypair = new Ed25519Keypair();
      const amount = '1000000';
      const recipient = '0x' + '1'.repeat(64);
      const nonce = crypto.randomUUID();

      const message = createPaymentMessage(amount, recipient, nonce);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);

      const payment = {
        scheme: 'streaming', // Invalid!
        network: 'sui:devnet',
        amount,
        recipient,
        signature: Buffer.from(signatureBytes).toString('base64'),
        publicKey: keypair.getPublicKey().toBase64(),
        nonce,
      };

      // Act
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      // Assert
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toMatch(/scheme/i);
    });
  });

  describe('Performance', () => {
    it('should respond within 1 second', async () => {
      // Arrange
      const keypair = new Ed25519Keypair();
      const amount = '1000000';
      const recipient = '0x' + '1'.repeat(64);
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
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      const duration = Date.now() - startTime;

      // Assert
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Under 1 second
    });
  });
});
