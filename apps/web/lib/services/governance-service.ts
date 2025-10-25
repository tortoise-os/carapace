import {
  Proposal,
  ProposalStatus,
  CreateProposalParams,
  VoteParams,
  VoteChoice,
  DelegateParams,
  GovernanceStats,
  VoteHistory,
  ProposalFilter,
  GovernanceToken,
} from '../types/governance';

// In-memory storage for demo (in production, this would be on-chain)
const proposals = new Map<string, Proposal>();
const voteHistory = new Map<string, VoteHistory[]>();
const delegations = new Map<string, string>(); // user -> delegatee

export class GovernanceService {
  constructor() {
    // Initialize with mock proposals
    this.initializeMockProposals();
  }

  /**
   * Initialize mock proposals for demo
   */
  private initializeMockProposals() {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const mockProposals: Proposal[] = [
      {
        id: 'prop_1',
        title: 'Reduce Swap Fee from 0.3% to 0.25%',
        description:
          'Proposal to reduce the default swap fee from 0.3% to 0.25% to remain competitive with other DEXs and increase trading volume. This change would apply to all new pools created after execution.',
        proposer: '0x1234...5678',
        proposerName: 'Alice',
        type: 'parameter_change',
        status: 'active',
        votesFor: '125000',
        votesAgainst: '45000',
        votesAbstain: '8000',
        totalVotes: '178000',
        quorum: '10', // 10%
        threshold: '60', // 60%
        createdAt: now - 2 * day,
        startTime: now - 2 * day,
        endTime: now + 5 * day,
        executionDelay: 2 * day,
        actions: [
          {
            target: '0x...pool_factory',
            function: 'update_default_fee',
            parameters: [25], // 0.25% = 25 basis points
            description: 'Update default fee to 0.25%',
          },
        ],
      },
      {
        id: 'prop_2',
        title: 'Allocate 50,000 SUI for Bug Bounty Program',
        description:
          'Proposal to allocate 50,000 SUI from the treasury to fund a comprehensive bug bounty program. This will incentivize security researchers to find and report vulnerabilities, enhancing the protocol\'s security.',
        proposer: '0xabcd...efgh',
        proposerName: 'Bob',
        type: 'treasury',
        status: 'active',
        votesFor: '95000',
        votesAgainst: '12000',
        votesAbstain: '3000',
        totalVotes: '110000',
        quorum: '15',
        threshold: '70',
        createdAt: now - 1 * day,
        startTime: now - 1 * day,
        endTime: now + 6 * day,
        executionDelay: 3 * day,
        actions: [
          {
            target: '0x...treasury',
            function: 'transfer',
            parameters: ['0x...bug_bounty_contract', '50000000000000'],
            value: '50000000000000',
            description: 'Transfer 50,000 SUI to bug bounty contract',
          },
        ],
      },
      {
        id: 'prop_3',
        title: 'Upgrade Pool Contract to v2.0',
        description:
          'Proposal to upgrade the pool contract to version 2.0, which includes gas optimizations, improved flash loan protections, and support for concentrated liquidity. This is a critical upgrade that has been audited by two independent security firms.',
        proposer: '0x9876...4321',
        proposerName: 'Charlie',
        type: 'upgrade',
        status: 'succeeded',
        votesFor: '280000',
        votesAgainst: '45000',
        votesAbstain: '15000',
        totalVotes: '340000',
        quorum: '20',
        threshold: '75',
        createdAt: now - 10 * day,
        startTime: now - 10 * day,
        endTime: now - 3 * day,
        executionDelay: 2 * day,
        actions: [
          {
            target: '0x...upgrade_manager',
            function: 'upgrade_contract',
            parameters: ['0x...pool_contract', '0x...new_bytecode_hash'],
            description: 'Upgrade pool contract to v2.0',
          },
        ],
      },
    ];

    mockProposals.forEach((prop) => {
      proposals.set(prop.id, prop);
    });
  }

  /**
   * Get governance token info
   */
  getGovernanceToken(userAddress?: string): GovernanceToken {
    // Mock data - in production, query on-chain state
    return {
      symbol: 'TRTL',
      name: 'Tortoise Governance Token',
      address: '0x...governance_token',
      totalSupply: '100000000',
      circulatingSupply: '75000000',
      yourBalance: userAddress ? '5000' : '0',
      votingPower: userAddress ? '5000' : '0',
      delegatedTo: delegations.get(userAddress || ''),
    };
  }

  /**
   * Create a new proposal
   */
  createProposal(
    params: CreateProposalParams,
    proposer: string
  ): Proposal {
    const proposalId = `prop_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    const now = Date.now();
    const votingDuration = params.votingDuration * 24 * 60 * 60 * 1000;

    const proposal: Proposal = {
      id: proposalId,
      title: params.title,
      description: params.description,
      proposer,
      type: params.type,
      status: 'pending',
      votesFor: '0',
      votesAgainst: '0',
      votesAbstain: '0',
      totalVotes: '0',
      quorum: params.quorum.toString(),
      threshold: params.threshold.toString(),
      createdAt: now,
      startTime: now + 24 * 60 * 60 * 1000, // Start voting after 24 hours
      endTime: now + 24 * 60 * 60 * 1000 + votingDuration,
      executionDelay: 2 * 24 * 60 * 60 * 1000, // 2 days timelock
      actions: params.actions,
    };

    proposals.set(proposalId, proposal);
    this.updateProposalStatus(proposal);

    return proposal;
  }

  /**
   * Vote on a proposal
   */
  vote(params: VoteParams, voter: string): Proposal {
    const proposal = proposals.get(params.proposalId);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active for voting');
    }

    if (proposal.userVote) {
      throw new Error('You have already voted on this proposal');
    }

    // Get user's voting power (mock - in production, query on-chain)
    const votingPower = this.getVotingPower(voter);

    if (parseFloat(votingPower) <= 0) {
      throw new Error('You have no voting power');
    }

    // Record vote
    proposal.userVote = {
      choice: params.choice,
      power: votingPower,
      timestamp: Date.now(),
    };

    // Update vote counts
    switch (params.choice) {
      case 'for':
        proposal.votesFor = (
          parseFloat(proposal.votesFor) + parseFloat(votingPower)
        ).toString();
        break;
      case 'against':
        proposal.votesAgainst = (
          parseFloat(proposal.votesAgainst) + parseFloat(votingPower)
        ).toString();
        break;
      case 'abstain':
        proposal.votesAbstain = (
          parseFloat(proposal.votesAbstain) + parseFloat(votingPower)
        ).toString();
        break;
    }

    proposal.totalVotes = (
      parseFloat(proposal.votesFor) +
      parseFloat(proposal.votesAgainst) +
      parseFloat(proposal.votesAbstain)
    ).toString();

    proposals.set(proposal.id, proposal);

    // Add to vote history
    this.addVoteHistory(voter, proposal, params.choice, votingPower);

    // Update status (may have reached quorum/threshold)
    this.updateProposalStatus(proposal);

    return proposal;
  }

  /**
   * Delegate voting power to another address
   */
  delegate(params: DelegateParams, delegator: string): void {
    if (delegator === params.delegatee) {
      throw new Error('Cannot delegate to yourself');
    }

    delegations.set(delegator, params.delegatee);
  }

  /**
   * Remove delegation (self-delegate)
   */
  undelegate(delegator: string): void {
    delegations.delete(delegator);
  }

  /**
   * Get all proposals
   */
  getProposals(filter?: ProposalFilter): Proposal[] {
    let allProposals = Array.from(proposals.values());

    // Update statuses first
    allProposals.forEach((p) => this.updateProposalStatus(p));

    if (filter) {
      if (filter.status) {
        allProposals = allProposals.filter((p) =>
          filter.status!.includes(p.status)
        );
      }
      if (filter.type) {
        allProposals = allProposals.filter((p) =>
          filter.type!.includes(p.type)
        );
      }
      if (filter.proposer) {
        allProposals = allProposals.filter(
          (p) => p.proposer === filter.proposer
        );
      }
    }

    // Sort by created date (newest first)
    return allProposals.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get a specific proposal
   */
  getProposal(proposalId: string): Proposal | null {
    const proposal = proposals.get(proposalId);
    if (proposal) {
      this.updateProposalStatus(proposal);
    }
    return proposal || null;
  }

  /**
   * Get governance statistics
   */
  getGovernanceStats(): GovernanceStats {
    const allProposals = this.getProposals();

    return {
      totalProposals: allProposals.length,
      activeProposals: allProposals.filter((p) => p.status === 'active')
        .length,
      succeededProposals: allProposals.filter(
        (p) => p.status === 'succeeded' || p.status === 'executed'
      ).length,
      defeatedProposals: allProposals.filter((p) => p.status === 'defeated')
        .length,
      totalVoters: 342, // Mock
      totalVotingPower: '75000000',
      treasuryBalance: '2500000',
      averageParticipation: 24.5, // Mock
    };
  }

  /**
   * Get user's vote history
   */
  getUserVoteHistory(userAddress: string): VoteHistory[] {
    return voteHistory.get(userAddress) || [];
  }

  /**
   * Get voting power for a user
   */
  private getVotingPower(userAddress: string): string {
    // Mock - in production, query token balance and delegated power
    return '5000';
  }

  /**
   * Update proposal status based on time and votes
   */
  private updateProposalStatus(proposal: Proposal): void {
    const now = Date.now();

    // Check if pending and should become active
    if (proposal.status === 'pending' && now >= proposal.startTime) {
      proposal.status = 'active';
    }

    // Check if active and voting has ended
    if (proposal.status === 'active' && now >= proposal.endTime) {
      // Calculate if proposal passed
      const totalSupply = 100000000; // Mock
      const quorumReached =
        (parseFloat(proposal.totalVotes) / totalSupply) * 100 >=
        parseFloat(proposal.quorum);

      const totalVotes = parseFloat(proposal.totalVotes);
      const thresholdReached =
        totalVotes > 0 &&
        (parseFloat(proposal.votesFor) / totalVotes) * 100 >=
          parseFloat(proposal.threshold);

      if (quorumReached && thresholdReached) {
        proposal.status = 'succeeded';
      } else {
        proposal.status = 'defeated';
      }
    }

    proposals.set(proposal.id, proposal);
  }

  /**
   * Add vote to history
   */
  private addVoteHistory(
    voter: string,
    proposal: Proposal,
    choice: VoteChoice,
    votingPower: string
  ): void {
    const history = voteHistory.get(voter) || [];

    const vote: VoteHistory = {
      proposalId: proposal.id,
      proposalTitle: proposal.title,
      choice,
      votingPower,
      timestamp: Date.now(),
      txDigest: `0x${Math.random().toString(16).substring(2, 18)}`,
    };

    history.unshift(vote);
    voteHistory.set(voter, history);
  }

  /**
   * Execute a succeeded proposal
   */
  executeProposal(proposalId: string): Proposal {
    const proposal = proposals.get(proposalId);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'succeeded') {
      throw new Error('Proposal has not succeeded');
    }

    const now = Date.now();
    const timelockEnd = proposal.endTime + proposal.executionDelay;

    if (now < timelockEnd) {
      throw new Error(
        `Proposal is still in timelock. Can execute after ${new Date(timelockEnd).toLocaleString()}`
      );
    }

    // Execute actions (mock - in production, execute on-chain)
    proposal.status = 'executed';
    proposal.executedAt = now;

    proposals.set(proposalId, proposal);

    return proposal;
  }

  /**
   * Calculate voting results percentages
   */
  getVotingResults(proposal: Proposal): {
    forPercent: number;
    againstPercent: number;
    abstainPercent: number;
    quorumProgress: number;
  } {
    const totalVotes = parseFloat(proposal.totalVotes);
    const totalSupply = 100000000; // Mock

    if (totalVotes === 0) {
      return {
        forPercent: 0,
        againstPercent: 0,
        abstainPercent: 0,
        quorumProgress: 0,
      };
    }

    return {
      forPercent: (parseFloat(proposal.votesFor) / totalVotes) * 100,
      againstPercent: (parseFloat(proposal.votesAgainst) / totalVotes) * 100,
      abstainPercent: (parseFloat(proposal.votesAbstain) / totalVotes) * 100,
      quorumProgress: (totalVotes / totalSupply) * 100,
    };
  }
}

// Singleton instance
export const governanceService = new GovernanceService();
