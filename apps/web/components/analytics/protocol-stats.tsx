'use client';

import { Card } from '@carapace/ui';
import { TrendingUp, Activity, DollarSign, Layers } from 'lucide-react';
import { useProtocolAnalytics, formatCurrency } from '@/lib/hooks/use-analytics';

export function ProtocolStats() {
  const { analytics, loading } = useProtocolAnalytics();

  const stats = [
    {
      title: 'Total Value Locked',
      value: analytics?.totalValueLocked || '0',
      icon: DollarSign,
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      title: '24h Volume',
      value: analytics?.volume24h || '0',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      title: '24h Fees',
      value: analytics?.fees24h || '0',
      icon: Activity,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Total Pools',
      value: analytics?.totalPools.toString() || '0',
      icon: Layers,
      gradient: 'from-orange-500 to-red-500',
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-3xl font-bold">
                    {stat.isCount ? stat.value : formatCurrency(stat.value)}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10`}>
                <Icon className={`h-6 w-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
