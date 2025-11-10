"use client"

import { BlurFade, DotPattern } from "@carapace/carapace-ui"
import { useEffect, useState } from "react"
import { LiquidityDepthChart } from "@/components/charts/liquidity-depth-chart"
import { PriceChart } from "@/components/charts/price-chart"
import { EnhancedSwapInterface } from "@/components/swap/enhanced-swap-interface"
import { WalletBalanceWidget } from "@/components/wallet/wallet-balance-widget"

interface PriceDataPoint {
  timestamp: number
  price: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

export default function SwapPage() {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch price history for the default pool (SUI/USDC)
    const fetchPriceHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:3500/api/pools/pool_sui_usdc/price-history?timeframe=24h&interval=1h"
        )
        const data = await response.json()
        if (data.success) {
          setPriceData(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch price history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPriceHistory()
  }, [])

  return (
    <div className="relative min-h-screen py-8 px-4">
      <DotPattern className="opacity-10" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Swap Interface */}
          <div className="flex items-start justify-center lg:sticky lg:top-8 lg:h-fit">
            <BlurFade delay={0.1}>
              <EnhancedSwapInterface />
            </BlurFade>
          </div>

          {/* Charts & Wallet Balance */}
          <div className="space-y-6">
            <BlurFade delay={0.2}>
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <PriceChart data={priceData} tokenSymbol="SUI/USDC" showVolume />
              )}
            </BlurFade>

            <BlurFade delay={0.3}>
              <LiquidityDepthChart poolId="pool_sui_usdc" tokenPair="SUI/USDC" />
            </BlurFade>

            <BlurFade delay={0.4}>
              <WalletBalanceWidget />
            </BlurFade>
          </div>
        </div>
      </div>
    </div>
  )
}
