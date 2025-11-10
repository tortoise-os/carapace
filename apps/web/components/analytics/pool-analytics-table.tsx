"use client"

import { Card, TokenIcon } from "@carapace/carapace-ui"
import { ArrowUpDown, TrendingUp } from "lucide-react"
import { useState } from "react"
import type { PoolWithAnalytics } from "@/lib/api-client"
import { formatCurrency, formatPercentage, usePoolAnalytics } from "@/lib/hooks/use-analytics"

export function PoolAnalyticsTable() {
  const [sortBy, setSortBy] = useState<"tvl" | "volume24h" | "apr">("tvl")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const { pools, loading } = usePoolAnalytics({ sortBy, order, limit: 50 })

  const handleSort = (column: "tvl" | "volume24h" | "apr") => {
    if (sortBy === column) {
      setOrder(order === "desc" ? "asc" : "desc")
    } else {
      setSortBy(column)
      setOrder("desc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 opacity-30" />
    return (
      <ArrowUpDown
        className={`h-4 w-4 transition-transform ${order === "desc" ? "rotate-180" : ""}`}
      />
    )
  }

  if (loading && pools.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Pool Analytics</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                Pool
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort("tvl")}
              >
                <div className="flex items-center justify-end gap-1">
                  TVL
                  {getSortIcon("tvl")}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort("volume24h")}
              >
                <div className="flex items-center justify-end gap-1">
                  24h Volume
                  {getSortIcon("volume24h")}
                </div>
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">
                7d Volume
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">
                24h Fees
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort("apr")}
              >
                <div className="flex items-center justify-end gap-1">
                  APR
                  {getSortIcon("apr")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => (
              <PoolRow key={pool.pool_id} pool={pool} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function PoolRow({ pool }: { pool: PoolWithAnalytics }) {
  const { analytics } = pool

  return (
    <tr className="border-b border-border/50 hover:bg-muted/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <TokenIcon symbol="SUI" size="sm" gradient="bg-brand-gradient-ocean" />
            <TokenIcon symbol="USDC" size="sm" gradient="bg-brand-gradient-seafoam" />
          </div>
          <div>
            <div className="font-semibold">SUI / USDC</div>
            <div className="text-xs text-muted-foreground">0.3% fee</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-right font-semibold">{formatCurrency(analytics.tvl)}</td>
      <td className="py-4 px-4 text-right">{formatCurrency(analytics.volume24h)}</td>
      <td className="py-4 px-4 text-right">{formatCurrency(analytics.volume7d)}</td>
      <td className="py-4 px-4 text-right text-green-600 dark:text-green-400">
        {formatCurrency(analytics.fees24h)}
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-1 text-teal-600 dark:text-teal-400 font-semibold">
          <TrendingUp className="h-4 w-4" />
          {formatPercentage(analytics.apr)}
        </div>
      </td>
    </tr>
  )
}
