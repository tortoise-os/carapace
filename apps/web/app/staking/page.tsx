"use client"

import { Badge, BlurFade, Button, Card, DotPattern, Input, MagicCard } from "@carapace/carapace-ui"
import { useCurrentAccount } from "@mysten/dapp-kit"
import {
  AlertCircle,
  Calendar,
  Coins,
  ExternalLink,
  Gift,
  Lock,
  Plus,
  Sparkles,
  TrendingUp,
  Unlock,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { liquidityMiningService } from "@/lib/services/liquidity-mining-service"
import type {
  ClaimHistory,
  RewardProgram,
  StakeParams,
  StakingPosition,
  StakingStats,
} from "@/lib/types/liquidity-mining"
import { LOCK_PERIOD_OPTIONS } from "@/lib/types/liquidity-mining"

export default function StakingPage() {
  const account = useCurrentAccount()
  const [programs, setPrograms] = useState<RewardProgram[]>([])
  const [positions, setPositions] = useState<StakingPosition[]>([])
  const [stats, setStats] = useState<StakingStats | null>(null)
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([])
  const [selectedTab, setSelectedTab] = useState<"programs" | "positions" | "history">("programs")

  // Staking modal state
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<RewardProgram | null>(null)
  const [stakeAmount, setStakeAmount] = useState("")
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(0)

  // Load data
  useEffect(() => {
    const loadData = () => {
      const allPrograms = liquidityMiningService.getRewardPrograms()
      setPrograms(allPrograms)

      if (account?.address) {
        const userPositions = liquidityMiningService.getUserStakingPositions(account.address)
        const userStats = liquidityMiningService.getUserStakingStats(account.address)
        const history = liquidityMiningService.getUserClaimHistory(account.address)

        setPositions(userPositions)
        setStats(userStats)
        setClaimHistory(history)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [account])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTimeRemaining = (timestamp: number) => {
    const remaining = timestamp - Date.now()
    if (remaining <= 0) return "Unlocked"

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

    if (days > 0) {
      return `${days}d ${hours}h`
    }
    return `${hours}h`
  }

  const handleStake = () => {
    if (!account?.address || !selectedProgram) return

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      const params: StakeParams = {
        poolId: selectedProgram.poolId,
        lpTokenAmount: stakeAmount,
        lockPeriod: selectedLockPeriod,
      }

      liquidityMiningService.stake(params, account.address)

      toast.success(
        `Successfully staked ${stakeAmount} LP tokens in ${selectedProgram.poolName} pool!`
      )

      // Refresh data
      const userPositions = liquidityMiningService.getUserStakingPositions(account.address)
      const userStats = liquidityMiningService.getUserStakingStats(account.address)
      setPositions(userPositions)
      setStats(userStats)

      // Close modal
      setShowStakeModal(false)
      setStakeAmount("")
      setSelectedLockPeriod(0)
      setSelectedProgram(null)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to stake")
    }
  }

  const handleUnstake = (positionId: string) => {
    if (!account?.address) return

    try {
      const result = liquidityMiningService.unstake(
        { stakingPositionId: positionId },
        account.address
      )

      toast.success(
        `Successfully unstaked and claimed ${result.rewards} ${result.position.rewardTokenSymbol}!`
      )

      // Refresh data
      const userPositions = liquidityMiningService.getUserStakingPositions(account.address)
      const userStats = liquidityMiningService.getUserStakingStats(account.address)
      const history = liquidityMiningService.getUserClaimHistory(account.address)

      setPositions(userPositions)
      setStats(userStats)
      setClaimHistory(history)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to unstake")
    }
  }

  const handleClaimRewards = (positionId: string) => {
    if (!account?.address) return

    try {
      const result = liquidityMiningService.claimRewards(
        { stakingPositionId: positionId },
        account.address
      )

      toast.success(`Successfully claimed ${result.rewards} ${result.position.rewardTokenSymbol}!`)

      // Refresh data
      const userPositions = liquidityMiningService.getUserStakingPositions(account.address)
      const history = liquidityMiningService.getUserClaimHistory(account.address)

      setPositions(userPositions)
      setClaimHistory(history)
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to claim rewards")
    }
  }

  const getProgramStatusBadge = (status: RewardProgram["status"]) => {
    const variants: Record<RewardProgram["status"], { bg: string; text: string; label: string }> = {
      active: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-700 dark:text-green-300",
        label: "Active",
      },
      upcoming: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-700 dark:text-blue-300",
        label: "Upcoming",
      },
      ended: {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-400",
        label: "Ended",
      },
    }

    const variant = variants[status]
    return <Badge className={`${variant.bg} ${variant.text}`}>{variant.label}</Badge>
  }

  if (!account) {
    return (
      <div className="relative min-h-screen py-12">
        <DotPattern className="opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <Card className="p-12 text-center">
            <Coins className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to stake LP tokens and earn rewards
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen py-12">
      <DotPattern className="opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Liquidity Mining</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Stake your LP tokens to earn additional rewards
            </p>
          </div>
        </BlurFade>

        {/* Stats Cards */}
        {stats && (
          <BlurFade delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                {
                  label: "Total Staked",
                  value: formatCurrency(stats.totalStakedUSD),
                  icon: Lock,
                },
                {
                  label: "Rewards Earned",
                  value: formatCurrency(stats.totalRewardsEarnedUSD),
                  icon: Gift,
                  color: "text-green-600",
                },
                {
                  label: "Active Positions",
                  value: stats.activePositions.toString(),
                  icon: Coins,
                },
                {
                  label: "Avg APR",
                  value: `${stats.averageAPR.toFixed(1)}%`,
                  icon: TrendingUp,
                  color: "text-green-600",
                },
                {
                  label: "Programs",
                  value: stats.totalProgramsParticipating.toString(),
                  icon: Users,
                },
              ].map((stat) => (
                <Card key={stat.label} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </Card>
              ))}
            </div>
          </BlurFade>
        )}

        {/* Tabs */}
        <BlurFade delay={0.3}>
          <div className="flex gap-2 mb-6 border-b">
            {[
              { key: "programs", label: "Reward Programs" },
              { key: "positions", label: "My Positions" },
              { key: "history", label: "Claim History" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={selectedTab === tab.key ? "default" : "ghost"}
                onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
                className="rounded-b-none"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </BlurFade>

        {/* Reward Programs Tab */}
        {selectedTab === "programs" && (
          <div className="space-y-4">
            {programs.map((program, index) => (
              <BlurFade key={program.id} delay={0.4 + index * 0.05}>
                <MagicCard className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">💰</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{program.poolName}</h3>
                            {getProgramStatusBadge(program.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Earn {program.rewardTokenSymbol} rewards
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Base APR</div>
                          <div className="font-bold text-green-600 text-lg">{program.baseAPR}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Max APR</div>
                          <div className="font-bold text-green-600 text-lg">
                            {program.bonusAPR}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Total Staked</div>
                          <div className="font-semibold">
                            {formatCurrency(program.totalStakedUSD)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Participants</div>
                          <div className="font-semibold">{program.participantCount}</div>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(program.startTime)} - {formatDate(program.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Button
                        size="lg"
                        disabled={program.status !== "active"}
                        onClick={() => {
                          setSelectedProgram(program)
                          setShowStakeModal(true)
                        }}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Stake
                      </Button>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        )}

        {/* My Positions Tab */}
        {selectedTab === "positions" && (
          <div className="space-y-4">
            {positions.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No staking positions yet</p>
              </Card>
            ) : (
              positions.map((position, index) => (
                <BlurFade key={position.id} delay={0.4 + index * 0.05}>
                  <MagicCard className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {position.status === "active" ? (
                            <Lock className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Unlock className="h-5 w-5 text-green-600" />
                          )}
                          <div>
                            <h3 className="text-lg font-bold">{position.poolName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Staked {formatDate(position.stakedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Staked Value</div>
                            <div className="font-semibold">{formatCurrency(position.valueUSD)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">APR</div>
                            <div className="font-semibold text-green-600">
                              {position.apr.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Rewards Earned</div>
                            <div className="font-semibold">
                              {parseFloat(position.rewardsEarned).toFixed(4)}{" "}
                              {position.rewardTokenSymbol}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">
                              {position.lockPeriod > 0 ? "Unlock Time" : "Status"}
                            </div>
                            <div className="font-semibold">
                              {position.lockPeriod > 0
                                ? getTimeRemaining(position.unlockAt)
                                : "Flexible"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {position.status === "active" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClaimRewards(position.id)}
                              disabled={parseFloat(position.rewardsEarned) <= 0}
                            >
                              <Gift className="mr-2 h-4 w-4" />
                              Claim Rewards
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUnstake(position.id)}
                              disabled={Date.now() < position.unlockAt && position.lockPeriod > 0}
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Unstake
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </MagicCard>
                </BlurFade>
              ))
            )}
          </div>
        )}

        {/* Claim History Tab */}
        {selectedTab === "history" && (
          <div className="space-y-4">
            {claimHistory.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No claim history yet</p>
              </Card>
            ) : (
              claimHistory.map((claim, index) => (
                <BlurFade key={claim.id} delay={0.4 + index * 0.05}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Gift className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            Claimed {parseFloat(claim.rewardAmount).toFixed(4)}{" "}
                            {claim.rewardTokenSymbol}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {claim.poolName} • {formatDate(claim.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(claim.rewardValueUSD)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://suiexplorer.com/txblock/${claim.txDigest}?network=testnet`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </BlurFade>
              ))
            )}
          </div>
        )}

        {/* Stake Modal */}
        {showStakeModal && selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <BlurFade delay={0}>
              <Card className="max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Stake in {selectedProgram.poolName}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowStakeModal(false)
                      setSelectedProgram(null)
                      setStakeAmount("")
                      setSelectedLockPeriod(0)
                    }}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label htmlFor="stake-amount" className="block text-sm font-medium mb-2">
                      LP Token Amount
                    </label>
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                  </div>

                  {/* Lock Period Selection */}
                  <div>
                    <label htmlFor="lock-period" className="block text-sm font-medium mb-2">
                      Lock Period
                    </label>
                    <div id="lock-period" className="grid grid-cols-3 gap-2">
                      {LOCK_PERIOD_OPTIONS.map((option) => (
                        <Button
                          key={option.days}
                          variant={selectedLockPeriod === option.days ? "default" : "outline"}
                          onClick={() => setSelectedLockPeriod(option.days)}
                          className="flex-col h-auto py-3"
                        >
                          <div className="font-bold">{option.label}</div>
                          <div className="text-xs">{option.description}</div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* APR Display */}
                  <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        Your APR
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {(
                        selectedProgram.baseAPR *
                        (LOCK_PERIOD_OPTIONS.find((o) => o.days === selectedLockPeriod)
                          ?.aprMultiplier || 1)
                      ).toFixed(1)}
                      %
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowStakeModal(false)
                        setSelectedProgram(null)
                        setStakeAmount("")
                        setSelectedLockPeriod(0)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleStake}>
                      Stake
                    </Button>
                  </div>
                </div>
              </Card>
            </BlurFade>
          </div>
        )}
      </div>
    </div>
  )
}
