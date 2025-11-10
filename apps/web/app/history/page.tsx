"use client"

import { BlurFade, Button, Card, DotPattern } from "@carapace/carapace-ui"
import { useCurrentAccount } from "@mysten/dapp-kit"
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Minus,
  Plus,
  Wallet,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"

interface Transaction {
  id: string
  digest: string
  type: "swap" | "add_liquidity" | "remove_liquidity" | "create_pool"
  status: "success" | "failed" | "pending"
  timestamp: number
  from: string
  tokenIn?: string
  tokenOut?: string
  amountIn?: string
  amountOut?: string
  fee?: string
  poolId?: string
  gasUsed?: string
  explorerUrl?: string
}

interface TransactionStats {
  totalTransactions: number
  totalSwaps: number
  totalLiquidityAdded: number
  totalLiquidityRemoved: number
  totalVolume: string
  totalFeesPaid: string
  successRate: number
  averageGasUsed: string
}

export default function HistoryPage() {
  const account = useCurrentAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    if (!account?.address) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Fetch transactions
        const txResponse = await fetch(
          `http://localhost:3500/api/transactions/${account.address}?limit=50`
        )
        const txData = await txResponse.json()
        setTransactions(txData.transactions || [])

        // Fetch stats
        const statsResponse = await fetch(
          `http://localhost:3500/api/transactions/stats/${account.address}`
        )
        const statsData = await statsResponse.json()
        setStats(statsData)
      } catch (error) {
        console.error("Failed to fetch transaction history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [account?.address])

  const filteredTransactions =
    filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter)

  if (!account) {
    return (
      <div className="relative min-h-screen py-8 px-4">
        <DotPattern className="opacity-10" />
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Transaction History</h1>
              <p className="text-muted-foreground">View all your transactions and activity</p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <Card className="p-12 text-center">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to view your transaction history
              </p>
              <Button size="lg">Connect Wallet</Button>
            </Card>
          </BlurFade>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-screen py-8 px-4">
        <DotPattern className="opacity-10" />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen py-8 px-4">
      <DotPattern className="opacity-10" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Transaction History</h1>
            <p className="text-muted-foreground">View all your transactions and activity</p>
          </div>
        </BlurFade>

        {/* Stats Overview */}
        {stats && (
          <BlurFade delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Total Volume</div>
                <div className="text-2xl font-bold">
                  ${parseFloat(stats.totalVolume).toLocaleString()}
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Total Swaps</div>
                <div className="text-2xl font-bold">{stats.totalSwaps}</div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Total Fees Paid</div>
                <div className="text-2xl font-bold">${stats.totalFeesPaid}</div>
              </Card>
            </div>
          </BlurFade>
        )}

        {/* Filters */}
        <BlurFade delay={0.3}>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
              <div className="flex gap-2">
                {["all", "swap", "add_liquidity", "remove_liquidity"].map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {f === "all" ? "All" : f.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </BlurFade>

        {/* Transactions List */}
        <BlurFade delay={0.4}>
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No transactions found</p>
              </Card>
            ) : (
              filteredTransactions.map((tx, index) => (
                <TransactionCard key={tx.id} transaction={tx} delay={0.4 + index * 0.05} />
              ))
            )}
          </div>
        </BlurFade>
      </div>
    </div>
  )
}

function TransactionCard({ transaction, delay }: { transaction: Transaction; delay: number }) {
  const getIcon = () => {
    switch (transaction.type) {
      case "swap":
        return <ArrowLeftRight className="h-5 w-5" />
      case "add_liquidity":
        return <Plus className="h-5 w-5" />
      case "remove_liquidity":
        return <Minus className="h-5 w-5" />
      default:
        return <ArrowRight className="h-5 w-5" />
    }
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <BlurFade delay={delay}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon */}
            <div
              className={`p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 bg-opacity-10`}
            >
              {getIcon()}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold capitalize">
                  {transaction.type.replace("_", " ")}
                </span>
                {getStatusIcon()}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(transaction.timestamp).toLocaleString()}
              </div>
              {transaction.tokenIn && transaction.tokenOut && (
                <div className="text-sm mt-1">
                  {transaction.amountIn} {transaction.tokenIn} → {transaction.amountOut}{" "}
                  {transaction.tokenOut}
                </div>
              )}
            </div>

            {/* Gas & Fee */}
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Gas</div>
              <div className="font-medium">{transaction.gasUsed} SUI</div>
              {transaction.fee && (
                <div className="text-xs text-muted-foreground mt-1">
                  Fee: {transaction.fee} {transaction.tokenIn}
                </div>
              )}
            </div>

            {/* Explorer Link */}
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <a href={transaction.explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </BlurFade>
  )
}
