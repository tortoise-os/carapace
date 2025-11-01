'use client';

import { useState, useEffect } from 'react';
import {
  BlurFade,
  MagicCard,
  Card,
  Badge,
  Button,
  DotPattern,
} from '@carapace/carapace-ui';
import {
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Coins,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { governanceService } from '@/lib/services/governance-service';
import type {
  Proposal,
  ProposalStatus,
  VoteChoice,
  GovernanceStats,
  GovernanceToken,
} from '@/lib/types/governance';
import { toast } from 'sonner';

export default function GovernancePage() {
  const account = useCurrentAccount();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [governanceToken, setGovernanceToken] =
    useState<GovernanceToken | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | ProposalStatus>(
    'all'
  );
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );

  // Load data
  useEffect(() => {
    const loadData = () => {
      const allProposals = governanceService.getProposals();
      const governanceStats = governanceService.getGovernanceStats();
      const token = governanceService.getGovernanceToken(account?.address);

      setProposals(allProposals);
      setStats(governanceStats);
      setGovernanceToken(token);
    };

    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [account]);

  const formatNumber = (value: string | number) => {
    return new Intl.NumberFormat('en-US').format(Number(value));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  const getStatusBadge = (status: ProposalStatus) => {
    const variants: Record<
      ProposalStatus,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        label: 'Pending',
      },
      active: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-700 dark:text-blue-300',
        label: 'Active',
      },
      succeeded: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-700 dark:text-green-300',
        label: 'Succeeded',
      },
      defeated: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-700 dark:text-red-300',
        label: 'Defeated',
      },
      queued: {
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        text: 'text-yellow-700 dark:text-yellow-300',
        label: 'Queued',
      },
      executed: {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-700 dark:text-purple-300',
        label: 'Executed',
      },
      cancelled: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        label: 'Cancelled',
      },
      expired: {
        bg: 'bg-orange-100 dark:bg-orange-900',
        text: 'text-orange-700 dark:text-orange-300',
        label: 'Expired',
      },
    };

    const variant = variants[status];
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>{variant.label}</Badge>
    );
  };

  const handleVote = (proposalId: string, choice: VoteChoice) => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      governanceService.vote({ proposalId, choice }, account.address);
      toast.success(`Vote submitted: ${choice.toUpperCase()}`);

      // Refresh data
      const allProposals = governanceService.getProposals();
      setProposals(allProposals);
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  const filteredProposals =
    selectedStatus === 'all'
      ? proposals
      : proposals.filter((p) => p.status === selectedStatus);

  if (!account) {
    return (
      <div className="relative min-h-screen py-12">
        <DotPattern className="opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <Card className="p-12 text-center">
            <Vote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to participate in governance
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-12">
      <DotPattern className="opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Vote className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Governance</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Participate in protocol decisions through decentralized voting
            </p>
          </div>
        </BlurFade>

        {/* Governance Token Card */}
        {governanceToken && (
          <BlurFade delay={0.2}>
            <MagicCard className="p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Your Balance
                  </div>
                  <div className="text-2xl font-bold">
                    {formatNumber(governanceToken.yourBalance)} {governanceToken.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Voting Power
                  </div>
                  <div className="text-2xl font-bold">
                    {formatNumber(governanceToken.votingPower)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Supply
                  </div>
                  <div className="text-2xl font-bold">
                    {formatNumber(governanceToken.totalSupply)}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button variant="outline">Delegate</Button>
                </div>
              </div>
            </MagicCard>
          </BlurFade>
        )}

        {/* Stats Cards */}
        {stats && (
          <BlurFade delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Total Proposals',
                  value: stats.totalProposals.toString(),
                  icon: MessageSquare,
                },
                {
                  label: 'Active',
                  value: stats.activeProposals.toString(),
                  icon: Clock,
                  color: 'text-blue-600',
                },
                {
                  label: 'Total Voters',
                  value: formatNumber(stats.totalVoters),
                  icon: Users,
                },
                {
                  label: 'Participation',
                  value: `${stats.averageParticipation.toFixed(1)}%`,
                  icon: TrendingUp,
                  color: 'text-green-600',
                },
              ].map((stat, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    <stat.icon
                      className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`}
                    />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </Card>
              ))}
            </div>
          </BlurFade>
        )}

        {/* Filters */}
        <BlurFade delay={0.4}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {[
                'all',
                'active',
                'pending',
                'succeeded',
                'defeated',
                'executed',
              ].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setSelectedStatus(status as typeof selectedStatus)
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Proposal
            </Button>
          </div>
        </BlurFade>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No proposals found</p>
            </Card>
          ) : (
            filteredProposals.map((proposal, index) => {
              const results = governanceService.getVotingResults(proposal);

              return (
                <BlurFade key={proposal.id} delay={0.5 + index * 0.05}>
                  <MagicCard className="p-6">
                    {/* Proposal Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">
                                {proposal.title}
                              </h3>
                              {getStatusBadge(proposal.status)}
                              <Badge variant="outline">
                                {proposal.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {proposal.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By {proposal.proposerName || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{formatDate(proposal.createdAt)}</span>
                          {proposal.status === 'active' && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">
                                {getTimeRemaining(proposal.endTime)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Voting Results */}
                    <div className="space-y-3 mb-4">
                      {/* For Votes */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-600 font-semibold">
                            For
                          </span>
                          <span className="text-muted-foreground">
                            {formatNumber(proposal.votesFor)} (
                            {results.forPercent.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600"
                            style={{ width: `${results.forPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Against Votes */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600 font-semibold">
                            Against
                          </span>
                          <span className="text-muted-foreground">
                            {formatNumber(proposal.votesAgainst)} (
                            {results.againstPercent.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600"
                            style={{ width: `${results.againstPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Abstain Votes */}
                      {parseFloat(proposal.votesAbstain) > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 font-semibold">
                              Abstain
                            </span>
                            <span className="text-muted-foreground">
                              {formatNumber(proposal.votesAbstain)} (
                              {results.abstainPercent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-600"
                              style={{ width: `${results.abstainPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Quorum Progress */}
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            Quorum: {proposal.quorum}% required
                          </span>
                          <span>
                            {results.quorumProgress.toFixed(2)}% reached
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              results.quorumProgress >=
                              parseFloat(proposal.quorum)
                                ? 'bg-green-600'
                                : 'bg-yellow-600'
                            }`}
                            style={{
                              width: `${Math.min(results.quorumProgress, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Voting Buttons */}
                    {proposal.status === 'active' && !proposal.userVote && (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => handleVote(proposal.id, 'for')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Vote For
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => handleVote(proposal.id, 'against')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Vote Against
                        </Button>
                        <Button
                          className="flex-1"
                          variant="ghost"
                          onClick={() => handleVote(proposal.id, 'abstain')}
                        >
                          Abstain
                        </Button>
                      </div>
                    )}

                    {/* User Already Voted */}
                    {proposal.userVote && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold">
                            You voted {proposal.userVote.choice.toUpperCase()}{' '}
                            with {formatNumber(proposal.userVote.power)} voting
                            power
                          </span>
                        </div>
                      </div>
                    )}
                  </MagicCard>
                </BlurFade>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
