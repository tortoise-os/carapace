'use client';

import { Plus, TrendingUp, Droplet } from 'lucide-react';
import { BlurFade, MagicCard, Button, DotPattern, ShimmerButton } from '@carapace/ui';

// Mock pool data
const pools = [
  {
    id: 1,
    token0: { symbol: 'SUI', icon: '🌊' },
    token1: { symbol: 'USDC', icon: '💵' },
    tvl: '$2.5M',
    volume24h: '$1.2M',
    apr: '24.5%',
    fee: '0.25%',
  },
  {
    id: 2,
    token0: { symbol: 'SUI', icon: '🌊' },
    token1: { symbol: 'USDT', icon: '💰' },
    tvl: '$1.8M',
    volume24h: '$850K',
    apr: '18.2%',
    fee: '0.25%',
  },
  {
    id: 3,
    token0: { symbol: 'USDC', icon: '💵' },
    token1: { symbol: 'USDT', icon: '💰' },
    tvl: '$3.2M',
    volume24h: '$2.1M',
    apr: '12.8%',
    fee: '0.20%',
  },
];

export default function PoolsPage() {
  return (
    <div className="relative min-h-screen py-12">
      <DotPattern className="opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <BlurFade delay={0.1}>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Liquidity Pools</h1>
              <p className="text-lg text-muted-foreground">
                Provide liquidity and earn trading fees
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <Button size="lg" className="mt-4 md:mt-0">
              <Plus className="mr-2 h-5 w-5" />
              Create Pool
            </Button>
          </BlurFade>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Value Locked', value: '$12.5M', icon: Droplet, gradient: 'bg-accent-gradient-blue', cardGradient: 'from-accent-blue/30 to-accent-indigo/25' }, // Water, liquidity - BLUE
            { label: 'Total Volume (24h)', value: '$5.8M', icon: TrendingUp, gradient: 'bg-accent-gradient-orange', cardGradient: 'from-accent-orange/30 to-accent-amber/25' }, // Activity, heat - ORANGE
            { label: 'Total Pools', value: '12', icon: Plus, gradient: 'bg-accent-gradient-purple', cardGradient: 'from-accent-purple/30 to-accent-violet/25' }, // Creation, growth - PURPLE
          ].map((stat, i) => (
            <BlurFade key={i} delay={0.2 + i * 0.1}>
              <MagicCard className={`p-6 card group cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-xl bg-gradient-to-br ${stat.cardGradient}`}>
                <div className={`w-14 h-14 rounded-xl ${stat.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wide">{stat.label}</div>
                <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{stat.value}</div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 gap-6">
          {pools.map((pool, i) => (
            <BlurFade key={pool.id} delay={0.3 + i * 0.1}>
              <MagicCard className="p-6 card group/card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Pool Info */}
                  <div className="flex items-center gap-4 group-hover/card:scale-[1.01] transition-transform">
                    <div className="flex -space-x-3">
                      {/* Token 0: Ocean gradient for SUI (wave emoji 🌊) */}
                      <div className="w-14 h-14 rounded-full bg-brand-gradient-ocean flex items-center justify-center text-2xl border-4 border-card shadow-lg">
                        {pool.token0.icon}
                      </div>
                      {/* Token 1: Seafoam gradient for stablecoins (money emoji 💵💰) */}
                      <div className="w-14 h-14 rounded-full bg-brand-gradient-seafoam flex items-center justify-center text-2xl border-4 border-card shadow-lg">
                        {pool.token1.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {pool.token0.symbol} / {pool.token1.symbol}
                      </h3>
                      <p className="text-sm text-muted-foreground font-semibold">Fee: {pool.fee}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-8 group-hover/card:scale-[1.01] transition-transform">
                    <div>
                      <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wide">TVL</div>
                      <div className="text-lg font-bold text-foreground">{pool.tvl}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wide">Volume (24h)</div>
                      <div className="text-lg font-bold text-foreground">{pool.volume24h}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wide">APR</div>
                      <div className="text-lg font-bold text-brand-gradient">{pool.apr}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="hover:scale-110 hover:shadow-xl transition-all duration-200 font-bold hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    >
                      Remove
                    </Button>
                    <ShimmerButton
                      shimmerColor="rgba(0, 255, 241, 0.9)"
                      background="linear-gradient(135deg, hsl(var(--brand-teal)), hsl(var(--brand-cyan)))"
                      className="px-6 hover:scale-110 hover:shadow-2xl transition-all duration-200 font-bold"
                    >
                      Add Liquidity
                    </ShimmerButton>
                  </div>
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* Empty State Message */}
        {pools.length === 0 && (
          <BlurFade delay={0.3}>
            <div className="text-center py-12">
              <Droplet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">No pools found</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to create a liquidity pool
              </p>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create First Pool
              </Button>
            </div>
          </BlurFade>
        )}
      </div>
    </div>
  );
}
