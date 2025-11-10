"use client"

import { Card } from "@carapace/carapace-ui"
import { useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface PriceDataPoint {
  timestamp: number
  price: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

interface PriceChartProps {
  data: PriceDataPoint[]
  tokenSymbol?: string
  showVolume?: boolean
}

const TIMEFRAMES = [
  { label: "1H", value: "1h", interval: "1m" },
  { label: "24H", value: "24h", interval: "1h" },
  { label: "7D", value: "7d", interval: "1h" },
  { label: "30D", value: "30d", interval: "1d" },
  { label: "1Y", value: "1y", interval: "1d" },
]

export function PriceChart({ data, tokenSymbol = "Token", showVolume = false }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState("24h")

  // Format data for Recharts
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: point.timestamp,
    price: point.price,
    volume: point.volume,
  }))

  // Calculate price change
  const currentPrice = chartData[chartData.length - 1]?.price || 0
  const startPrice = chartData[0]?.price || 0
  const priceChange = currentPrice - startPrice
  const priceChangePercent = startPrice > 0 ? (priceChange / startPrice) * 100 : 0
  const isPositive = priceChange >= 0

  // Custom tooltip
  // biome-ignore lint/suspicious/noExplicitAny: Recharts tooltip type is complex
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Card className="p-3 shadow-lg border">
          <div className="text-xs text-muted-foreground mb-1">
            {new Date(data.timestamp).toLocaleString()}
          </div>
          <div className="text-lg font-bold">${data.price.toFixed(4)}</div>
          {showVolume && (
            <div className="text-xs text-muted-foreground mt-1">
              Vol: ${(data.volume / 1000).toFixed(1)}K
            </div>
          )}
        </Card>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{tokenSymbol} Price</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${currentPrice.toFixed(4)}</span>
            <span
              className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {isPositive ? "+" : ""}
              {priceChange.toFixed(4)} ({isPositive ? "+" : ""}
              {priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              type="button"
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeframe === tf.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
              <XAxis
                dataKey="time"
                stroke="#888"
                fontSize={12}
                tickMargin={10}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickMargin={10}
                domain={["dataMin - 0.1", "dataMax + 0.1"]}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#colorPrice)"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </Card>
  )
}
