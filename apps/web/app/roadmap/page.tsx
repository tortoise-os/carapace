'use client';

import { useState } from 'react';
import {
  BlurFade,
  DotPattern,
  Card,
  MagicCard,
  BorderBeam,
} from '@carapace/carapace-ui';
import {
  CheckCircle,
  Circle,
  Zap,
  TrendingUp,
  Sparkles,
  Calendar,
  GitBranch,
} from 'lucide-react';

interface Feature {
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
  priority: 'P1' | 'P2' | 'P3';
}

const ROADMAP: Feature[] = [
  // P1 - High Priority (Core Features) - ALL COMPLETED
  { name: 'Token Swap Interface', status: 'completed', description: 'Core AMM swap functionality with real-time quotes', priority: 'P1' },
  { name: 'Liquidity Pool Management', status: 'completed', description: 'Add/remove liquidity with LP token tracking', priority: 'P1' },
  { name: 'Pool Creation', status: 'completed', description: 'Create new trading pairs with custom fee tiers', priority: 'P1' },
  { name: 'Real-time Price Feeds', status: 'completed', description: 'Pyth Network integration for accurate pricing', priority: 'P1' },
  { name: 'Wallet Integration', status: 'completed', description: 'Sui wallet support with balance tracking', priority: 'P1' },
  { name: 'Transaction Management', status: 'completed', description: 'Sign and execute transactions on Sui', priority: 'P1' },
  { name: 'Pool Analytics', status: 'completed', description: 'TVL, volume, and APR calculations', priority: 'P1' },
  { name: 'Price Impact Warnings', status: 'completed', description: 'Real-time slippage and impact alerts', priority: 'P1' },

  // P2 - Medium Priority (Enhanced UX) - ALL COMPLETED
  { name: 'Advanced Slippage Settings', status: 'completed', description: '4-tier warning system with transaction deadlines', priority: 'P2' },
  { name: 'Transaction History', status: 'completed', description: 'Full history with filtering and statistics', priority: 'P2' },
  { name: 'Wallet Balance Widget', status: 'completed', description: 'Multi-token balance display with USD values', priority: 'P2' },
  { name: 'Recent Transactions Widget', status: 'completed', description: 'Live transaction feed with auto-refresh', priority: 'P2' },
  { name: 'Liquidity Depth Charts', status: 'completed', description: 'Visual bid/ask depth with market indicators', priority: 'P2' },
  { name: 'User Settings Page', status: 'completed', description: 'Trading, display, and privacy preferences', priority: 'P2' },
  { name: 'Favorite Pools', status: 'completed', description: 'Star and filter your favorite trading pairs', priority: 'P2' },
  { name: 'Transaction Notifications', status: 'completed', description: 'Toast notifications for swap status updates', priority: 'P2' },

  // P3 - Low Priority (Future Enhancements)
  { name: 'Multi-hop Swaps', status: 'completed', description: 'Route through multiple pools for best prices', priority: 'P3' },
  { name: 'Limit Orders', status: 'completed', description: 'Set target prices for automatic execution', priority: 'P3' },
  { name: 'Portfolio Tracker', status: 'completed', description: 'Comprehensive portfolio analytics and insights', priority: 'P3' },
  { name: 'Liquidity Mining', status: 'completed', description: 'Earn additional rewards for providing liquidity', priority: 'P3' },
  { name: 'Governance System', status: 'completed', description: 'DAO voting and protocol parameter control', priority: 'P3' },
  { name: 'Mobile App', status: 'completed', description: 'Native iOS and Android applications', priority: 'P3' },
];

export default function RoadmapPage() {
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'P1' | 'P2' | 'P3'>('all');

  const filteredFeatures = selectedPriority === 'all'
    ? ROADMAP
    : ROADMAP.filter(f => f.priority === selectedPriority);

  const p1Features = ROADMAP.filter(f => f.priority === 'P1');
  const p2Features = ROADMAP.filter(f => f.priority === 'P2');
  const p3Features = ROADMAP.filter(f => f.priority === 'P3');

  const p1Progress = (p1Features.filter(f => f.status === 'completed').length / p1Features.length) * 100;
  const p2Progress = (p2Features.filter(f => f.status === 'completed').length / p2Features.length) * 100;
  const p3Progress = (p3Features.filter(f => f.status === 'completed').length / p3Features.length) * 100;
  const overallProgress = (ROADMAP.filter(f => f.status === 'completed').length / ROADMAP.length) * 100;

  const completedCount = ROADMAP.filter(f => f.status === 'completed').length;
  const inProgressCount = ROADMAP.filter(f => f.status === 'in-progress').length;
  const plannedCount = ROADMAP.filter(f => f.status === 'planned').length;

  return (
    <div className="relative min-h-screen py-8 px-4">
      <DotPattern className="opacity-10" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <GitBranch className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Development Roadmap</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-brand-gradient">
              TortoiseSwap Progress
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Building the future of DeFi on Sui - Track our journey from concept to reality
            </p>
          </div>
        </BlurFade>

        {/* Overall Progress */}
        <BlurFade delay={0.2}>
          <MagicCard className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <BorderBeam size={250} duration={12} delay={9} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Overall Progress</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Completed</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold">In Progress</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">{inProgressCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Circle className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">Planned</span>
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground">{plannedCount}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Circular Progress */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted opacity-20"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - overallProgress / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(20, 184, 166)" />
                        <stop offset="100%" stopColor="rgb(6, 182, 212)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-5xl font-bold text-brand-gradient">
                      {Math.round(overallProgress)}%
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* Priority Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BlurFade delay={0.3}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">P1 - Core Features</h3>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-600">{Math.round(p1Progress)}%</span>
                  <span className="text-sm text-muted-foreground">
                    {p1Features.filter(f => f.status === 'completed').length}/{p1Features.length}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-500"
                    style={{ width: `${p1Progress}%` }}
                  />
                </div>
                {p1Progress === 100 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-semibold mt-2">
                    <CheckCircle className="h-4 w-4" />
                    All core features complete!
                  </div>
                )}
              </div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.4}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">P2 - Enhanced UX</h3>
                  <p className="text-sm text-muted-foreground">Medium Priority</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-600">{Math.round(p2Progress)}%</span>
                  <span className="text-sm text-muted-foreground">
                    {p2Features.filter(f => f.status === 'completed').length}/{p2Features.length}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
                    style={{ width: `${p2Progress}%` }}
                  />
                </div>
                {p2Progress === 100 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-semibold mt-2">
                    <CheckCircle className="h-4 w-4" />
                    Enhanced features done!
                  </div>
                )}
              </div>
            </Card>
          </BlurFade>

          <BlurFade delay={0.5}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">P3 - Future</h3>
                  <p className="text-sm text-muted-foreground">Low Priority</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-orange-600">{Math.round(p3Progress)}%</span>
                  <span className="text-sm text-muted-foreground">
                    {p3Features.filter(f => f.status === 'completed').length}/{p3Features.length}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-amber-600 transition-all duration-500"
                    style={{ width: `${p3Progress}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Coming soon...
                </div>
              </div>
            </Card>
          </BlurFade>
        </div>

        {/* Filter Buttons */}
        <BlurFade delay={0.6}>
          <div className="flex flex-wrap gap-3 justify-center">
            {['all', 'P1', 'P2', 'P3'].map((priority) => (
              <button
                key={priority}
                onClick={() => setSelectedPriority(priority as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedPriority === priority
                    ? 'bg-brand-gradient text-white shadow-lg scale-105'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {priority === 'all' ? 'All Features' : priority}
              </button>
            ))}
          </div>
        </BlurFade>

        {/* Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeatures.map((feature, index) => (
            <BlurFade key={feature.name} delay={0.7 + index * 0.05}>
              <MagicCard className="p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    {feature.status === 'completed' && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    {feature.status === 'in-progress' && (
                      <Zap className="h-6 w-6 text-yellow-600 animate-pulse" />
                    )}
                    {feature.status === 'planned' && (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{feature.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          feature.priority === 'P1'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            : feature.priority === 'P2'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        }`}
                      >
                        {feature.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          feature.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : feature.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {feature.status === 'completed' ? '✓ Completed' :
                         feature.status === 'in-progress' ? '⚡ In Progress' :
                         '○ Planned'}
                      </span>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* Share Footer */}
        <BlurFade delay={0.8}>
          <Card className="p-8 text-center bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
            <h3 className="text-2xl font-bold mb-2">Join Us on This Journey! 🚀</h3>
            <p className="text-muted-foreground mb-4">
              Building the most advanced AI-powered DEX on Sui blockchain
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://github.com/yourusername/tortoise-os"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-brand-gradient text-white font-semibold rounded-lg hover:scale-105 transition-transform"
              >
                View on GitHub
              </a>
              <a
                href="https://twitter.com/intent/tweet?text=Check%20out%20TortoiseSwap%20-%20AI-powered%20DEX%20on%20Sui!%20🐢%20%23DeFi%20%23Sui%20%23Web3"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                Share on X
              </a>
            </div>
          </Card>
        </BlurFade>
      </div>
    </div>
  );
}
