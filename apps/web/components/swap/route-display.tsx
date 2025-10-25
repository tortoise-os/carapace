'use client';

import { SwapRoute } from '@/lib/services/route-optimizer';
import { Card, Badge } from '@carapace/ui';
import { ArrowRight, TrendingUp, TrendingDown, Zap, Info } from 'lucide-react';

interface RouteDisplayProps {
  route: SwapRoute;
  isSelected?: boolean;
  onSelect?: () => void;
  showComparison?: {
    directOutput: string;
    savingsPercent: number;
  };
}

export function RouteDisplay({
  route,
  isSelected = false,
  onSelect,
  showComparison,
}: RouteDisplayProps) {
  const getTokenSymbol = (tokenAddress: string) => {
    return tokenAddress.split('::').pop() || tokenAddress.substring(0, 8);
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-xl' : ''
      }`}
      onClick={onSelect}
    >
      {/* Route Path Visualization */}
      <div className="flex items-center gap-2 mb-4">
        {route.path.map((token, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                {getTokenSymbol(token).charAt(0)}
              </div>
              <span className="text-sm font-semibold">
                {getTokenSymbol(token)}
              </span>
            </div>
            {index < route.path.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Route Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Output</div>
          <div className="text-sm font-bold">
            {parseFloat(route.totalAmountOut).toFixed(4)}{' '}
            {getTokenSymbol(route.path[route.path.length - 1])}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Hops</div>
          <div className="text-sm font-bold flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            {route.hops.length}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Price Impact
          </div>
          <div
            className={`text-sm font-bold flex items-center gap-1 ${
              route.totalPriceImpact > 1
                ? 'text-red-600'
                : route.totalPriceImpact > 0.5
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {route.totalPriceImpact > 0.5 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {route.totalPriceImpact.toFixed(2)}%
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Total Fees</div>
          <div className="text-sm font-bold">
            {parseFloat(route.totalFees).toFixed(4)}
          </div>
        </div>
      </div>

      {/* Comparison Banner */}
      {showComparison && showComparison.savingsPercent > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            +{showComparison.savingsPercent.toFixed(2)}% better than direct
            swap
          </span>
        </div>
      )}

      {/* Hop Details (Expandable) */}
      {route.hops.length > 1 && (
        <details className="mt-3">
          <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1 hover:text-foreground transition-colors">
            <Info className="h-3 w-3" />
            View hop details
          </summary>
          <div className="mt-2 space-y-2">
            {route.hops.map((hop, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-muted/50 border border-muted"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Hop {index + 1}
                  </Badge>
                  <span className="text-xs">
                    {getTokenSymbol(hop.tokenIn)} →{' '}
                    {getTokenSymbol(hop.tokenOut)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {parseFloat(hop.amountOut).toFixed(4)}{' '}
                  {getTokenSymbol(hop.tokenOut)}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </Card>
  );
}

interface RouteComparisonProps {
  routes: SwapRoute[];
  selectedRouteIndex: number;
  onSelectRoute: (index: number) => void;
  directRoute?: SwapRoute;
}

export function RouteComparison({
  routes,
  selectedRouteIndex,
  onSelectRoute,
  directRoute,
}: RouteComparisonProps) {
  if (routes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No routes available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Available Routes</h3>
        <Badge variant="outline">{routes.length} found</Badge>
      </div>

      {routes.map((route, index) => {
        let showComparison;
        if (directRoute && route.hops.length > 1) {
          const directOutput = parseFloat(directRoute.totalAmountOut);
          const multiHopOutput = parseFloat(route.totalAmountOut);
          const savingsPercent =
            ((multiHopOutput - directOutput) / directOutput) * 100;
          showComparison = {
            directOutput: directRoute.totalAmountOut,
            savingsPercent,
          };
        }

        return (
          <RouteDisplay
            key={index}
            route={route}
            isSelected={index === selectedRouteIndex}
            onSelect={() => onSelectRoute(index)}
            showComparison={showComparison}
          />
        );
      })}
    </div>
  );
}
