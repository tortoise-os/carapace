/**
 * Vault Client - Interact with Carapace vaults
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import type { CoinType, ObjectId, TxOptions } from './types';

// ============================================================================
// Types
// ============================================================================

export interface VaultInfo<T extends CoinType> {
  vaultId: ObjectId;
  tokenType: T;
  totalDeposits: bigint;
  totalShares: bigint;
  sharePrice: bigint;
  performanceFeeBps: number;
  managementFeeBps: number;
  lastHarvest: number;
}

// ============================================================================
// Vault Client Class
// ============================================================================

export class VaultClient {
  constructor(
    private client: SuiClient,
    private packageId: string,
  ) {}

  /**
   * Get vault information
   */
  async getVault<T extends CoinType>(
    vaultId: ObjectId,
  ): Promise<VaultInfo<T>> {
    const vaultObject = await this.client.getObject({
      id: vaultId,
      options: { showContent: true },
    });

    if (!vaultObject.data || !vaultObject.data.content || vaultObject.data.content.dataType !== 'moveObject') {
      throw new Error('Vault not found');
    }

    const fields = vaultObject.data.content.fields as any;

    // Extract token type from vault type
    const vaultType = vaultObject.data.content.type;
    const typeMatch = vaultType.match(/Vault<(.+)>/);
    const tokenType = (typeMatch ? typeMatch[1]!.trim() : '') as T;

    return {
      vaultId,
      tokenType,
      totalDeposits: BigInt(fields.deposits?.fields?.value || '0'),
      totalShares: BigInt(fields.share_supply?.fields?.value || '0'),
      sharePrice: await this.getSharePrice(vaultId),
      performanceFeeBps: Number(fields.performance_fee_bps || '0'),
      managementFeeBps: Number(fields.management_fee_bps || '0'),
      lastHarvest: Number(fields.last_harvest || '0'),
    };
  }

  /**
   * Get share price (deposits per share)
   */
  async getSharePrice(vaultId: ObjectId): Promise<bigint> {
    const vault = await this.getVault(vaultId);

    if (vault.totalShares === 0n) {
      return 1000000n; // Default price with 6 decimals precision
    }

    return (vault.totalDeposits * 1000000n) / vault.totalShares;
  }

  /**
   * Calculate shares received for deposit amount
   */
  calculateSharesForDeposit(
    depositAmount: bigint,
    totalDeposits: bigint,
    totalShares: bigint,
  ): bigint {
    if (totalShares === 0n) {
      // Initial deposit: 1:1 ratio
      return depositAmount;
    }

    // shares = (amount * total_shares) / total_deposits
    return (depositAmount * totalShares) / totalDeposits;
  }

  /**
   * Calculate tokens received for share amount
   */
  calculateTokensForShares(
    shareAmount: bigint,
    totalDeposits: bigint,
    totalShares: bigint,
  ): bigint {
    if (totalShares === 0n) {
      return 0n;
    }

    // tokens = (shares * total_deposits) / total_shares
    return (shareAmount * totalDeposits) / totalShares;
  }

  /**
   * Create a new vault
   */
  createVault<T extends CoinType>(
    tokenType: T,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vault::create_vault`,
      typeArguments: [tokenType],
      arguments: [],
    });

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Deposit tokens into vault
   */
  deposit<T extends CoinType>(
    vaultId: ObjectId,
    tokenType: T,
    coin: ObjectId | null,
    amount: bigint,
    senderAddress: string,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    // For SUI, use gas coin; otherwise use provided coin
    const isSui = tokenType === '0x2::sui::SUI';
    const [coinSplit] = isSui
      ? tx.splitCoins(tx.gas, [tx.pure.u64(amount)])
      : tx.splitCoins(tx.object(coin!), [tx.pure.u64(amount)]);

    // Call deposit - returns VaultShare token
    const shareToken = tx.moveCall({
      target: `${this.packageId}::vault::deposit`,
      typeArguments: [tokenType],
      arguments: [tx.object(vaultId), coinSplit],
    });

    // Transfer share token to sender
    tx.transferObjects([shareToken], senderAddress);

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Withdraw tokens from vault
   */
  withdraw<T extends CoinType>(
    vaultId: ObjectId,
    tokenType: T,
    shareToken: ObjectId,
    shareAmount: bigint,
    senderAddress: string,
    options?: TxOptions,
  ): Transaction {
    const tx = new Transaction();

    const [shareSplit] = tx.splitCoins(tx.object(shareToken), [
      tx.pure.u64(shareAmount),
    ]);

    // Call withdraw - returns token
    const token = tx.moveCall({
      target: `${this.packageId}::vault::withdraw`,
      typeArguments: [tokenType],
      arguments: [tx.object(vaultId), shareSplit],
    });

    // Transfer withdrawn token to sender
    tx.transferObjects([token], senderAddress);

    if (options?.gasBudget) {
      tx.setGasBudget(options.gasBudget);
    }

    return tx;
  }

  /**
   * Get user's vault share balance
   */
  async getUserShares(
    userAddress: string,
    _vaultId: ObjectId,
  ): Promise<bigint> {
    // Get all coins owned by user
    const coins = await this.client.getAllCoins({
      owner: userAddress,
    });

    // Filter for VaultShare tokens from this vault
    // Type will be like: 0x{package}::vault::VaultShare<{token_type}>
    const shareTypePrefix = `${this.packageId}::vault::VaultShare`;

    let totalShares = 0n;
    for (const coin of coins.data) {
      if (coin.coinType.startsWith(shareTypePrefix)) {
        totalShares += BigInt(coin.balance);
      }
    }

    return totalShares;
  }

  /**
   * Get vault APY (estimated)
   */
  async getVaultAPY(_vaultId: ObjectId): Promise<number> {
    // TODO: Calculate based on historical performance
    // For now, return placeholder
    return 0;
  }

  /**
   * Get vault TVL (Total Value Locked)
   */
  async getVaultTVL(vaultId: ObjectId): Promise<bigint> {
    const vault = await this.getVault(vaultId);
    return vault.totalDeposits;
  }
}
