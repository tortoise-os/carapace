'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Droplet, Star } from 'lucide-react';
import { BlurFade, MagicCard, Button, DotPattern, ShimmerButton, TokenIcon } from '@carapace/carapace-ui';
import { apiClient, type Pool } from '@/lib/api-client';
import { LiquidityDialog } from '@/components/liquidity/liquidity-dialog';
import { useFavoritePools } from '@/lib/hooks/use-favorite-pools';

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'remove'>('add');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritePools();

  // Fetch pools from API
  useEffect(() => {
    apiClient.getPools().then(setPools).catch(console.error);
  }, []);

  const openLiquidityDialog = (pool: Pool, mode: 'add' | 'remove') => {
    setSelectedPool(pool);
    setDialogMode(mode);
    setIsDialogOpen(true);
  };

  // Filter pools based on favorites
  const filteredPools = showFavoritesOnly
    ? pools.filter((pool) => isFavorite(pool.pool_id))
    : pools;

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
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="lg"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center gap-2"
              >
                <Star className={`h-5 w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </Button>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Pool
              </Button>
            </div>
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
          {filteredPools.map((pool, i) => {
            const tokenXSymbol = pool.token_x.split('::').pop() || 'Token X';
            const tokenYSymbol = pool.token_y.split('::').pop() || 'Token Y';
            const tvl = ((Number(pool.reserve_x) / 1e9 * 1.5 + Number(pool.reserve_y) / 1e6)).toFixed(2);
            const feePercent = (pool.fee_rate / 100).toFixed(2);
            const isPoolFavorite = isFavorite(pool.pool_id);

            return (
              <BlurFade key={pool.pool_id} delay={0.3 + i * 0.1}>
                <MagicCard className="p-6 card group/card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Pool Info */}
                    <div className="flex items-center gap-4 group-hover/card:scale-[1.01] transition-transform">
                      <button
                        onClick={() => toggleFavorite(pool.pool_id)}
                        className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
                        title={isPoolFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          className={`h-5 w-5 transition-all ${
                            isPoolFavorite
                              ? 'fill-yellow-500 text-yellow-500 scale-110'
                              : 'text-muted-foreground hover:text-yellow-500'
                          }`}
                        />
                      </button>
                      <div className="flex -space-x-3">
                        <TokenIcon
                          symbol={tokenXSymbol}
                          size="lg"
                          gradient="bg-brand-gradient-ocean"
                          className="border-4 border-card shadow-lg"
                        />
                        <TokenIcon
                          symbol={tokenYSymbol}
                          size="lg"
                          gradient="bg-brand-gradient-seafoam"
                          className="border-4 border-card shadow-lg"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {tokenXSymbol} / {tokenYSymbol}
                        </h3>
                        <p className="text-sm text-muted-foreground font-semibold">Fee: {feePercent}%</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8 group-hover/card:scale-[1.01] transition-transform">
                      <div>
                        <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wide">TVL</div>
                        <div className="text-lg font-bold text-foreground">${tvl}M</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wide">Reserve {tokenXSymbol}</div>
                        <div className="text-lg font-bold text-foreground">{(Number(pool.reserve_x) / 1e9).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wide">Reserve {tokenYSymbol}</div>
                        <div className="text-lg font-bold text-foreground">{(Number(pool.reserve_y) / 1e6).toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => openLiquidityDialog(pool, 'remove')}
                        className="hover:scale-110 hover:shadow-xl transition-all duration-200 font-bold hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                      >
                        Remove
                      </Button>
                      <ShimmerButton
                        shimmerColor="rgba(0, 255, 241, 0.9)"
                        background="linear-gradient(135deg, hsl(var(--brand-teal)), hsl(var(--brand-cyan)))"
                        className="px-6 hover:scale-110 hover:shadow-2xl transition-all duration-200 font-bold"
                        onClick={() => openLiquidityDialog(pool, 'add')}
                      >
                        Add Liquidity
                      </ShimmerButton>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            );
          })}
        </div>

        {/* Empty State Message */}
        {filteredPools.length === 0 && (
          <BlurFade delay={0.3}>
            <div className="text-center py-12">
              {showFavoritesOnly ? (
                <>
                  <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-semibold mb-2">No favorite pools</h3>
                  <p className="text-muted-foreground mb-6">
                    Star pools to add them to your favorites
                  </p>
                  <Button size="lg" onClick={() => setShowFavoritesOnly(false)}>
                    View All Pools
                  </Button>
                </>
              ) : (
                <>
                  <Droplet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-semibold mb-2">No pools found</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create a liquidity pool
                  </p>
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create First Pool
                  </Button>
                </>
              )}
            </div>
          </BlurFade>
        )}
      </div>

      {/* Liquidity Dialog */}
      {selectedPool && (
        <LiquidityDialog
          pool={selectedPool}
          mode={dialogMode}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}
