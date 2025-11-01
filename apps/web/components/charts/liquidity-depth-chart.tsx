'use client';

import { Card } from '@carapace/carapace-ui';
import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Info } from 'lucide-react';

interface LiquidityPoint {
  price: number;
  liquidity: number;
  cumulativeLiquidity: number;
}

interface LiquidityDepthData {
  bids: LiquidityPoint[];  // Buy orders (below market price)
  asks: LiquidityPoint[];  // Sell orders (above market price)
  currentPrice: number;
}

interface LiquidityDepthChartProps {
  poolId: string;
  tokenPair?: string;
}

export function LiquidityDepthChart({ poolId, tokenPair = 'SUI/USDC' }: LiquidityDepthChartProps) {
  const [data, setData] = useState<LiquidityDepthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiquidityDepth = async () => {
      try {
        const response = await fetch(
          `http://localhost:3500/api/pools/${poolId}/liquidity-depth`
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          // Generate mock data for visualization
          setData(generateMockLiquidityData());
        }
      } catch (error) {
        console.error('Failed to fetch liquidity depth:', error);
        // Use mock data on error
        setData(generateMockLiquidityData());
      } finally {
        setLoading(false);
      }
    };

    fetchLiquidityDepth();
  }, [poolId]);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Liquidity Depth</h3>
        <div className="flex items-center justify-center h-64">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Liquidity Depth</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No liquidity data available</p>
        </div>
      </Card>
    );
  }

  // Combine bids and asks for the chart
  const chartData = [
    ...data.bids.map(point => ({
      price: point.price,
      bidLiquidity: point.cumulativeLiquidity,
      askLiquidity: null,
    })),
    ...data.asks.map(point => ({
      price: point.price,
      bidLiquidity: null,
      askLiquidity: point.cumulativeLiquidity,
    })),
  ].sort((a, b) => a.price - b.price);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0]?.payload?.price;
      const bidLiq = payload[0]?.payload?.bidLiquidity;
      const askLiq = payload[0]?.payload?.askLiquidity;

      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">Price: ${price?.toFixed(4)}</p>
          {bidLiq !== null && (
            <p className="text-green-600">Buy: ${bidLiq.toLocaleString()}</p>
          )}
          {askLiq !== null && (
            <p className="text-red-600">Sell: ${askLiq.toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Liquidity Depth</h3>
          <p className="text-xs text-muted-foreground">{tokenPair}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Hover to see details</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 rounded-lg bg-green-500/10">
          <div className="text-xs text-muted-foreground mb-1">Total Bids</div>
          <div className="font-semibold text-green-600">
            ${data.bids[data.bids.length - 1]?.cumulativeLiquidity.toLocaleString() || 0}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground mb-1">Current Price</div>
          <div className="font-semibold">${data.currentPrice.toFixed(4)}</div>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10">
          <div className="text-xs text-muted-foreground mb-1">Total Asks</div>
          <div className="font-semibold text-red-600">
            ${data.asks[data.asks.length - 1]?.cumulativeLiquidity.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="price"
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Reference line for current price */}
          <ReferenceLine
            x={data.currentPrice}
            stroke="hsl(var(--primary))"
            strokeDasharray="3 3"
            label={{ value: 'Market', position: 'top', fontSize: 11 }}
          />

          {/* Bids (Buy orders - Green) */}
          <Area
            type="stepAfter"
            dataKey="bidLiquidity"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBids)"
          />

          {/* Asks (Sell orders - Red) */}
          <Area
            type="stepBefore"
            dataKey="askLiquidity"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAsks)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Bids (Buy)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Asks (Sell)</span>
        </div>
      </div>
    </Card>
  );
}

// Generate mock liquidity depth data for visualization
function generateMockLiquidityData(): LiquidityDepthData {
  const currentPrice = 2.45; // SUI price
  const spreadPercent = 0.02; // 2% spread

  const bids: LiquidityPoint[] = [];
  const asks: LiquidityPoint[] = [];

  // Generate bid orders (below market price)
  let cumulativeBid = 0;
  for (let i = 20; i >= 0; i--) {
    const priceOffset = (i / 20) * spreadPercent * currentPrice;
    const price = currentPrice - priceOffset;
    const liquidity = Math.random() * 5000 + 2000;
    cumulativeBid += liquidity;

    bids.push({
      price: parseFloat(price.toFixed(4)),
      liquidity,
      cumulativeLiquidity: cumulativeBid,
    });
  }

  // Generate ask orders (above market price)
  let cumulativeAsk = 0;
  for (let i = 0; i <= 20; i++) {
    const priceOffset = (i / 20) * spreadPercent * currentPrice;
    const price = currentPrice + priceOffset;
    const liquidity = Math.random() * 5000 + 2000;
    cumulativeAsk += liquidity;

    asks.push({
      price: parseFloat(price.toFixed(4)),
      liquidity,
      cumulativeLiquidity: cumulativeAsk,
    });
  }

  return {
    bids,
    asks,
    currentPrice,
  };
}
