'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { PriceImpactData } from '@/lib/utils/price-impact';
import { formatPriceImpact, getPriceImpactWarning } from '@/lib/utils/price-impact';

interface PriceImpactWarningProps {
  priceImpact: PriceImpactData;
  className?: string;
}

export function PriceImpactWarning({ priceImpact, className = '' }: PriceImpactWarningProps) {
  const { severity, color, shouldWarn, percentage } = priceImpact;

  const getIcon = () => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getBgColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-green-500/10 border-green-500/20';
    }
  };

  if (!shouldWarn && severity === 'low') {
    // Don't show warning for low impact
    return null;
  }

  return (
    <div className={`rounded-xl border p-3 ${getBgColor()} ${className}`}>
      <div className="flex items-start gap-2">
        <div className={color}>{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">
              Price Impact: <span className={color}>{formatPriceImpact(percentage)}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {getPriceImpactWarning(severity)}
          </p>
        </div>
      </div>
    </div>
  );
}

interface PriceImpactBadgeProps {
  priceImpact: PriceImpactData;
  className?: string;
}

export function PriceImpactBadge({ priceImpact, className = '' }: PriceImpactBadgeProps) {
  const { severity, color, percentage } = priceImpact;

  const getBgColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10';
      case 'high':
        return 'bg-orange-500/10';
      case 'medium':
        return 'bg-yellow-500/10';
      default:
        return 'bg-green-500/10';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${getBgColor()} ${className}`}>
      <span className={`text-sm font-semibold ${color}`}>
        {formatPriceImpact(percentage)}
      </span>
    </div>
  );
}
