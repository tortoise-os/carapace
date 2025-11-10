"use client"

import { BlurFade, Button, Card, DotPattern } from "@carapace/carapace-ui"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { DollarSign, Sparkles, TrendingUp, Wallet } from "lucide-react"
import { PositionCard } from "@/components/positions/position-card"
import { formatCurrency } from "@/lib/hooks/use-analytics"
import { useUserPositions } from "@/lib/hooks/use-positions"

export default function PositionsPage() {
  const account = useCurrentAccount()
  const { positions, loading, error } = useUserPositions()

  if (!account) {
    return (
      <div className="relative min-h-screen py-8 px-4">
        <DotPattern className="opacity-10" />
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">My Positions</h1>
              <p className="text-muted-foreground">
                Manage your liquidity positions and track earnings
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <Card className="p-12 text-center">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to view and manage your liquidity positions
              </p>
              <Button size="lg">Connect Wallet</Button>
            </Card>
          </BlurFade>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-screen py-8 px-4">
        <DotPattern className="opacity-10" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Positions</h1>
            <p className="text-muted-foreground">Loading your positions...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen py-8 px-4">
        <DotPattern className="opacity-10" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Positions</h1>
            <p className="text-muted-foreground">Error loading positions</p>
          </div>
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">{error.message}</p>
            <Button variant="outline">Try Again</Button>
          </Card>
        </div>
      </div>
    )
  }

  const hasPositions = positions && positions.positions.length > 0

  return (
    <div className="relative min-h-screen py-8 px-4">
      <DotPattern className="opacity-10" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Positions</h1>
            <p className="text-muted-foreground">
              Manage your liquidity positions and track earnings
            </p>
          </div>
        </BlurFade>

        {/* Stats Overview */}
        {hasPositions && (
          <BlurFade delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                    <p className="text-3xl font-bold">{formatCurrency(positions.totalValueUSD)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 bg-opacity-10">
                    <DollarSign className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Fees Earned</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(positions.totalFeesEarnedUSD)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 bg-opacity-10">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Positions</p>
                    <p className="text-3xl font-bold">{positions.positions.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-10">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>
          </BlurFade>
        )}

        {/* Positions List */}
        {hasPositions ? (
          <BlurFade delay={0.3}>
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Positions</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {positions.positions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            </div>
          </BlurFade>
        ) : (
          <BlurFade delay={0.3}>
            <Card className="p-12 text-center">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Positions Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start earning fees by providing liquidity to pools
              </p>
              <Button size="lg" asChild>
                <a href="/pools">Browse Pools</a>
              </Button>
            </Card>
          </BlurFade>
        )}
      </div>
    </div>
  )
}
