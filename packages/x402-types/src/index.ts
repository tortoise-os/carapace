/**
 * x402 Payment Protocol Types for Sui
 *
 * Based on: https://github.com/coinbase/x402
 * Adapted for: Sui blockchain
 */

/**
 * Supported payment schemes
 * - exact: Fixed payment amount
 */
export type PaymentScheme = 'exact';

/**
 * Supported Sui networks
 */
export type SuiNetwork = 'sui:mainnet' | 'sui:testnet' | 'sui:devnet';

/**
 * Payment requirement from server
 */
export interface PaymentRequirement {
  scheme: PaymentScheme;
  network: SuiNetwork;
  amount: string;        // Amount in MIST (1 SUI = 1e9 MIST)
  recipient: string;     // Sui address (0x...)
  timeout: number;       // Seconds until payment expires
}

/**
 * Payment options sent in 402 response
 */
export interface PaymentOptions {
  paymentRequirements: PaymentRequirement[];
}

/**
 * Payment payload from client
 */
export interface X402Payment {
  scheme: PaymentScheme;
  network: SuiNetwork;
  amount: string;           // Amount in MIST
  recipient: string;        // Sui address
  signature: string;        // Ed25519 signature (base64)
  publicKey: string;        // Ed25519 public key (base64)
  nonce: string;            // Unique identifier (UUID)
}

/**
 * Payment verification result
 */
export interface VerificationResult {
  valid: boolean;
  reason?: string;          // Error reason if invalid
}

/**
 * Payment settlement result
 */
export interface SettlementResult {
  success: boolean;
  txHash?: string;          // Sui transaction digest
  network?: SuiNetwork;
  error?: string;           // Error message if failed
}

/**
 * Supported schemes and networks response
 */
export interface SupportedOptions {
  schemes: PaymentScheme[];
  networks: SuiNetwork[];
}

/**
 * Payment response header
 */
export interface PaymentResponse {
  transactionHash: string;
  network: SuiNetwork;
  status: 'confirmed' | 'pending' | 'failed';
}

/**
 * Configuration for x402 facilitator
 */
export interface FacilitatorConfig {
  suiRpcUrl: string;
  facilitatorPrivateKey: string;
  port?: number;
  networks?: SuiNetwork[];
}

/**
 * Helper to create payment message for signing
 */
export function createPaymentMessage(
  amount: string,
  recipient: string,
  nonce: string
): string {
  return `x402-payment:${amount}:${recipient}:${nonce}`;
}

/**
 * Helper to encode payment for X-PAYMENT header
 */
export function encodePayment(payment: X402Payment): string {
  return Buffer.from(JSON.stringify(payment)).toString('base64');
}

/**
 * Helper to decode payment from X-PAYMENT header
 */
export function decodePayment(encoded: string): X402Payment {
  const json = Buffer.from(encoded, 'base64').toString('utf8');
  return JSON.parse(json);
}
