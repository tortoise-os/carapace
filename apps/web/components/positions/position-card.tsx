"use client"

import { Button, Card, TokenIcon } from "@carapace/carapace-ui"
import { Droplets, TrendingUp } from "lucide-react"
import type { LiquidityPosition } from "@/lib/api-client"
import { formatCurrency } from "@/lib/hooks/use-analytics"

interface PositionCardProps {
  position: LiquidityPosition
}

export function PositionCard({ position }: PositionCardProps) {
  const tokenXFormatted = (Number(position.tokenXAmount) / 1e9).toFixed(4)
  const tokenYFormatted = (Number(position.tokenYAmount) / 1e9).toFixed(4)

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header with token pair */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <TokenIcon
              symbol={position.tokenXSymbol}
              size="md"
              gradient="bg-brand-gradient-ocean"
            />
            <TokenIcon
              symbol={position.tokenYSymbol}
              size="md"
              gradient="bg-brand-gradient-seafoam"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {position.tokenXSymbol} / {position.tokenYSymbol}
            </h3>
            <p className="text-xs text-muted-foreground">Liquidity Pool</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{formatCurrency(position.valueUSD)}</div>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Your Share</div>
          <div className="text-lg font-semibold">{position.shareOfPool.toFixed(4)}%</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Fees Earned</div>
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(position.feesEarnedUSD)}
          </div>
        </div>
      </div>

      {/* Token Amounts */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
          <div className="flex items-center gap-2">
            <TokenIcon
              symbol={position.tokenXSymbol}
              size="sm"
              gradient="bg-brand-gradient-ocean"
            />
            <span className="text-sm font-medium">{position.tokenXSymbol}</span>
          </div>
          <span className="font-semibold">{tokenXFormatted}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
          <div className="flex items-center gap-2">
            <TokenIcon
              symbol={position.tokenYSymbol}
              size="sm"
              gradient="bg-brand-gradient-seafoam"
            />
            <span className="text-sm font-medium">{position.tokenYSymbol}</span>
          </div>
          <span className="font-semibold">{tokenYFormatted}</span>
        </div>
      </div>

      {/* LP Token Balance */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-teal-600" />
          <span className="text-sm font-medium">LP Tokens</span>
        </div>
        <span className="font-semibold">{(Number(position.lpTokenBalance) / 1e9).toFixed(4)}</span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full" disabled>
          <TrendingUp className="h-4 w-4 mr-2" />
          Add Liquidity
        </Button>
        <Button variant="outline" className="w-full" disabled>
          Remove
        </Button>
      </div>

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        Last updated: {new Date(position.lastUpdatedAt).toLocaleString()}
      </div>
    </Card>
  )
}
