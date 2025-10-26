/**
 * Gas Estimator - Estimate gas costs for transactions
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// ============================================================================
// Types
// ============================================================================

export interface GasEstimate {
  /** Total gas cost in MIST */
  totalGas: bigint;
  /** Computation cost in MIST */
  computationCost: bigint;
  /** Storage cost in MIST */
  storageCost: bigint;
  /** Storage rebate in MIST */
  storageRebate: bigint;
  /** Non-refundable storage fee in MIST */
  nonRefundableStorageFee: bigint;
  /** Gas budget required (totalGas + buffer) */
  recommendedBudget: bigint;
  /** Estimated cost in SUI */
  estimatedCostSui: string;
}

export interface GasEstimatorOptions {
  /** Safety buffer percentage (default: 20%) */
  bufferPercentage?: number;
  /** Gas price in MIST (default: fetch from network) */
  gasPrice?: bigint;
}

// ============================================================================
// Gas Estimator Class
// ============================================================================

export class GasEstimator {
  private cachedGasPrice: bigint | null = null;
  private gasPriceCacheTime: number = 0;
  private readonly GAS_PRICE_CACHE_TTL = 60000; // 1 minute

  constructor(private client: SuiClient) {}

  /**
   * Get current gas price from network
   */
  async getGasPrice(): Promise<bigint> {
    const now = Date.now();

    // Return cached if still valid
    if (
      this.cachedGasPrice &&
      now - this.gasPriceCacheTime < this.GAS_PRICE_CACHE_TTL
    ) {
      return this.cachedGasPrice;
    }

    // Fetch reference gas price
    const gasPrice = await this.client.getReferenceGasPrice();
    this.cachedGasPrice = BigInt(gasPrice);
    this.gasPriceCacheTime = now;

    return this.cachedGasPrice;
  }

  /**
   * Dry-run a transaction to estimate gas
   */
  async estimateGas(
    tx: Transaction,
    sender: string,
    options?: GasEstimatorOptions,
  ): Promise<GasEstimate> {
    const bufferPercentage = options?.bufferPercentage || 20;

    // Set sender if not already set
    tx.setSender(sender);

    // Dry run the transaction
    const result = await this.client.dryRunTransactionBlock({
      transactionBlock: await tx.build({ client: this.client }),
    });

    // Check if transaction would succeed
    if (result.effects.status.status !== 'success') {
      const error = result.effects.status.error || 'Unknown error';
      throw new Error(`Transaction dry-run failed: ${error}`);
    }

    // Extract gas costs
    const gasUsed = result.effects.gasUsed;
    const computationCost = BigInt(gasUsed.computationCost);
    const storageCost = BigInt(gasUsed.storageCost);
    const storageRebate = BigInt(gasUsed.storageRebate);
    const nonRefundableStorageFee = BigInt(gasUsed.nonRefundableStorageFee);

    const totalGas = computationCost + storageCost - storageRebate;

    // Add safety buffer
    const bufferAmount = (totalGas * BigInt(bufferPercentage)) / 100n;
    const recommendedBudget = totalGas + bufferAmount;

    // Convert to SUI (1 SUI = 1e9 MIST)
    const estimatedCostSui = (Number(totalGas) / 1e9).toFixed(6);

    return {
      totalGas,
      computationCost,
      storageCost,
      storageRebate,
      nonRefundableStorageFee,
      recommendedBudget,
      estimatedCostSui,
    };
  }

  /**
   * Estimate gas for a swap transaction
   */
  async estimateSwapGas(
    tx: Transaction,
    sender: string,
  ): Promise<GasEstimate> {
    return this.estimateGas(tx, sender, { bufferPercentage: 15 });
  }

  /**
   * Estimate gas for adding liquidity
   */
  async estimateAddLiquidityGas(
    tx: Transaction,
    sender: string,
  ): Promise<GasEstimate> {
    return this.estimateGas(tx, sender, { bufferPercentage: 20 });
  }

  /**
   * Estimate gas for removing liquidity
   */
  async estimateRemoveLiquidityGas(
    tx: Transaction,
    sender: string,
  ): Promise<GasEstimate> {
    return this.estimateGas(tx, sender, { bufferPercentage: 15 });
  }

  /**
   * Estimate gas for creating a pool
   */
  async estimateCreatePoolGas(
    tx: Transaction,
    sender: string,
  ): Promise<GasEstimate> {
    // Pool creation has higher storage costs
    return this.estimateGas(tx, sender, { bufferPercentage: 25 });
  }

  /**
   * Compare gas costs of multiple routes
   */
  async compareRouteGas(
    routes: Array<{ name: string; tx: Transaction }>,
    sender: string,
  ): Promise<Array<{ name: string; estimate: GasEstimate }>> {
    const estimates = await Promise.all(
      routes.map(async (route) => ({
        name: route.name,
        estimate: await this.estimateGas(route.tx, sender),
      })),
    );

    // Sort by total gas (lowest first)
    return estimates.sort(
      (a, b) => Number(a.estimate.totalGas - b.estimate.totalGas),
    );
  }

  /**
   * Check if user has sufficient balance for transaction
   */
  async checkSufficientBalance(
    sender: string,
    estimate: GasEstimate,
  ): Promise<{ sufficient: boolean; balance: bigint; required: bigint }> {
    const coins = await this.client.getCoins({
      owner: sender,
      coinType: '0x2::sui::SUI',
    });

    const balance = coins.data.reduce(
      (sum, coin) => sum + BigInt(coin.balance),
      0n,
    );

    return {
      sufficient: balance >= estimate.recommendedBudget,
      balance,
      required: estimate.recommendedBudget,
    };
  }

  /**
   * Get gas price in human-readable format
   */
  async getGasPriceSui(): Promise<string> {
    const gasPrice = await this.getGasPrice();
    return (Number(gasPrice) / 1e9).toFixed(9);
  }

  /**
   * Estimate cost for batch operations
   */
  async estimateBatchGas(
    transactions: Transaction[],
    sender: string,
  ): Promise<{
    individual: GasEstimate[];
    total: GasEstimate;
  }> {
    const individual = await Promise.all(
      transactions.map((tx) => this.estimateGas(tx, sender)),
    );

    // Sum up all costs
    const total: GasEstimate = {
      totalGas: individual.reduce((sum, est) => sum + est.totalGas, 0n),
      computationCost: individual.reduce(
        (sum, est) => sum + est.computationCost,
        0n,
      ),
      storageCost: individual.reduce((sum, est) => sum + est.storageCost, 0n),
      storageRebate: individual.reduce(
        (sum, est) => sum + est.storageRebate,
        0n,
      ),
      nonRefundableStorageFee: individual.reduce(
        (sum, est) => sum + est.nonRefundableStorageFee,
        0n,
      ),
      recommendedBudget: individual.reduce(
        (sum, est) => sum + est.recommendedBudget,
        0n,
      ),
      estimatedCostSui: (
        Number(
          individual.reduce((sum, est) => sum + est.totalGas, 0n),
        ) / 1e9
      ).toFixed(6),
    };

    return { individual, total };
  }
}

/**
 * Utility function to format gas estimate for display
 */
export function formatGasEstimate(estimate: GasEstimate): string {
  return `Gas: ${estimate.estimatedCostSui} SUI (Budget: ${(Number(estimate.recommendedBudget) / 1e9).toFixed(6)} SUI)`;
}

/**
 * Convert MIST to SUI
 */
export function mistToSui(mist: bigint): string {
  return (Number(mist) / 1e9).toFixed(6);
}

/**
 * Convert SUI to MIST
 */
export function suiToMist(sui: number): bigint {
  return BigInt(Math.floor(sui * 1e9));
}
