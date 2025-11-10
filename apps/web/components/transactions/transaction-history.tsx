"use client"

import { Button, Card } from "@carapace/carapace-ui"
import { ExternalLink, RefreshCw } from "lucide-react"
import {
  formatTransactionTime,
  formatTransactionType,
  type Transaction,
  useTransactionHistory,
} from "@/hooks/use-transaction-history"

interface TransactionHistoryProps {
  poolId?: string
  limit?: number
}

export function TransactionHistory({ poolId, limit }: TransactionHistoryProps) {
  const { transactions, loading, error, refetch, hasNextPage, loadMore } = useTransactionHistory({
    poolId,
    limit,
  })

  if (loading && transactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-sm text-destructive mb-4">{error.message}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No transactions found</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <Button onClick={refetch} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-4 text-center">
          <Button onClick={loadMore} variant="outline" size="sm">
            Load More
          </Button>
        </div>
      )}
    </Card>
  )
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "swap":
        return "text-blue-500"
      case "add_liquidity":
        return "text-green-500"
      case "remove_liquidity":
        return "text-orange-500"
      case "flash_swap":
        return "text-purple-500"
      default:
        return "text-muted-foreground"
    }
  }

  const explorerUrl = `https://suiscan.xyz/testnet/tx/${transaction.txDigest}`

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
            {formatTransactionType(transaction.type)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTransactionTime(transaction.timestamp)}
          </span>
        </div>

        <div className="mt-1 text-xs text-muted-foreground font-mono">
          {transaction.txDigest.slice(0, 8)}...{transaction.txDigest.slice(-8)}
        </div>

        {/* Transaction details */}
        <div className="mt-2 space-y-1 text-xs">
          {transaction.amounts.tokenX && (
            <div>
              <span className="text-muted-foreground">Token X:</span>{" "}
              <span className="font-medium">{formatAmount(transaction.amounts.tokenX)}</span>
            </div>
          )}
          {transaction.amounts.tokenY && (
            <div>
              <span className="text-muted-foreground">Token Y:</span>{" "}
              <span className="font-medium">{formatAmount(transaction.amounts.tokenY)}</span>
            </div>
          )}
          {transaction.amounts.liquidity && (
            <div>
              <span className="text-muted-foreground">Liquidity:</span>{" "}
              <span className="font-medium">{formatAmount(transaction.amounts.liquidity)}</span>
            </div>
          )}
          {transaction.fee && (
            <div>
              <span className="text-muted-foreground">Fee:</span>{" "}
              <span className="font-medium">{formatAmount(transaction.fee)}</span>
            </div>
          )}
        </div>
      </div>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 ml-4 p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </a>
    </div>
  )
}

function formatAmount(amount: string): string {
  const num = parseFloat(amount)
  if (Number.isNaN(num)) return amount

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  return num.toFixed(2)
}
