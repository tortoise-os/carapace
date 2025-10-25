import { Elysia, t } from 'elysia';
import type { SuiClient } from '@mysten/sui/client';

export interface Transaction {
  id: string;
  digest: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'create_pool';
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  from: string;
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: string;
  amountOut?: string;
  fee?: string;
  poolId?: string;
  gasUsed?: string;
  explorerUrl?: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  hasMore: boolean;
}

// Mock transaction data generator
function generateMockTransactions(address: string, limit: number, offset: number): Transaction[] {
  const types: Transaction['type'][] = ['swap', 'add_liquidity', 'remove_liquidity'];
  const tokens = ['SUI', 'USDC', 'USDT', 'WETH'];
  const now = Date.now();

  const transactions: Transaction[] = [];

  for (let i = 0; i < limit; i++) {
    const index = offset + i;
    const type = types[index % types.length]!;
    const tokenIn = tokens[index % tokens.length]!;
    const tokenOut = tokens[(index + 1) % tokens.length]!;
    const status: Transaction['status'] = index % 10 === 0 ? 'failed' : 'success';

    const amountIn = (Math.random() * 1000).toFixed(6);
    const amountOut = (Math.random() * 1000).toFixed(6);
    const fee = (Math.random() * 5).toFixed(6);
    const gasUsed = (Math.random() * 0.01).toFixed(6);

    transactions.push({
      id: `tx_${index}`,
      digest: `0x${index.toString(16).padStart(64, '0')}`,
      type,
      status,
      timestamp: now - index * 3600000, // 1 hour apart
      from: address,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      fee,
      poolId: `pool_${tokenIn}_${tokenOut}`.toLowerCase(),
      gasUsed,
      explorerUrl: `https://suiscan.xyz/testnet/tx/${index}`,
    });
  }

  return transactions;
}

export const createTransactionHistoryPlugin = (client: SuiClient) => {
  return new Elysia({ prefix: '/transactions' })
    // GET /api/transactions/:address - Get transaction history for an address
    .get(
      '/:address',
      async ({ params, query }): Promise<TransactionHistoryResponse> => {
        const { address } = params;
        const { limit = 50, offset = 0, type } = query;

        const numLimit = Math.min(parseInt(limit as string) || 50, 100);
        const numOffset = parseInt(offset as string) || 0;

        // Generate mock transactions
        let transactions = generateMockTransactions(address, numLimit, numOffset);

        // Filter by type if specified
        if (type) {
          transactions = transactions.filter((tx) => tx.type === type);
        }

        return {
          transactions,
          total: 1000, // Mock total
          hasMore: numOffset + numLimit < 1000,
        };
      },
      {
        params: t.Object({
          address: t.String(),
        }),
        query: t.Object({
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String()),
          type: t.Optional(t.String()),
        }),
      }
    )

    // GET /api/transactions/tx/:digest - Get single transaction details
    .get(
      '/tx/:digest',
      async ({ params, set }): Promise<Transaction | null> => {
        const { digest } = params;

        // Parse the digest to get an index for consistent mock data
        const index = parseInt(digest.replace(/^0x0*/, ''), 16) || 0;

        // Generate a single transaction
        const transactions = generateMockTransactions('mock_address', 1, index);
        const transaction = transactions[0];

        if (!transaction) {
          set.status = 404;
          return null;
        }

        return transaction;
      },
      {
        params: t.Object({
          digest: t.String(),
        }),
      }
    )

    // GET /api/transactions/stats/:address - Get transaction statistics
    .get(
      '/stats/:address',
      async ({ params }) => {
        const { address } = params;

        // Mock statistics
        return {
          totalTransactions: 1000,
          totalSwaps: 650,
          totalLiquidityAdded: 250,
          totalLiquidityRemoved: 100,
          totalVolume: '1250000.50',
          totalFeesPaid: '1250.75',
          successRate: 95.5,
          averageGasUsed: '0.0075',
        };
      },
      {
        params: t.Object({
          address: t.String(),
        }),
      }
    );
};
