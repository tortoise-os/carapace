import {
  StakingPosition,
  RewardProgram,
  StakingStats,
  ClaimHistory,
  StakeParams,
  UnstakeParams,
  ClaimRewardsParams,
  LOCK_PERIOD_OPTIONS,
} from '../types/liquidity-mining';

// In-memory storage for demo (in production, this would be on-chain)
const stakingPositions = new Map<string, StakingPosition>();
const rewardPrograms = new Map<string, RewardProgram>();
const claimHistory = new Map<string, ClaimHistory[]>();

export class LiquidityMiningService {
  constructor() {
    // Initialize with some mock reward programs
    this.initializeMockPrograms();
  }

  /**
   * Initialize mock reward programs for demo
   */
  private initializeMockPrograms() {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const programs: RewardProgram[] = [
      {
        id: 'program_sui_usdc',
        poolId: 'pool_sui_usdc',
        poolName: 'SUI/USDC',
        tokenX: '0x2::sui::SUI',
        tokenY: '0x2::usdc::USDC',
        tokenXSymbol: 'SUI',
        tokenYSymbol: 'USDC',
        rewardToken: '0x2::sui::SUI',
        rewardTokenSymbol: 'SUI',
        totalRewards: '1000000',
        rewardsRemaining: '850000',
        startTime: now - 30 * day,
        endTime: now + 60 * day,
        minStakeDuration: 0,
        baseAPR: 25,
        bonusAPR: 50,
        totalStaked: '5000000',
        totalStakedUSD: 12000000,
        participantCount: 342,
        status: 'active',
      },
      {
        id: 'program_eth_usdc',
        poolId: 'pool_eth_usdc',
        poolName: 'ETH/USDC',
        tokenX: '0x2::eth::ETH',
        tokenY: '0x2::usdc::USDC',
        tokenXSymbol: 'ETH',
        tokenYSymbol: 'USDC',
        rewardToken: '0x2::sui::SUI',
        rewardTokenSymbol: 'SUI',
        totalRewards: '500000',
        rewardsRemaining: '425000',
        startTime: now - 15 * day,
        endTime: now + 45 * day,
        minStakeDuration: 30,
        baseAPR: 18,
        bonusAPR: 36,
        totalStaked: '3000000',
        totalStakedUSD: 8400000,
        participantCount: 198,
        status: 'active',
      },
      {
        id: 'program_btc_usdc',
        poolId: 'pool_btc_usdc',
        poolName: 'BTC/USDC',
        tokenX: '0x2::btc::BTC',
        tokenY: '0x2::usdc::USDC',
        tokenXSymbol: 'BTC',
        tokenYSymbol: 'USDC',
        rewardToken: '0x2::sui::SUI',
        rewardTokenSymbol: 'SUI',
        totalRewards: '750000',
        rewardsRemaining: '750000',
        startTime: now + 7 * day,
        endTime: now + 97 * day,
        minStakeDuration: 90,
        baseAPR: 30,
        bonusAPR: 90,
        totalStaked: '0',
        totalStakedUSD: 0,
        participantCount: 0,
        status: 'upcoming',
      },
    ];

    programs.forEach((program) => {
      rewardPrograms.set(program.id, program);
    });
  }

  /**
   * Get all active reward programs
   */
  getRewardPrograms(status?: RewardProgram['status']): RewardProgram[] {
    const programs = Array.from(rewardPrograms.values());

    if (status) {
      return programs.filter((p) => p.status === status);
    }

    return programs.sort((a, b) => {
      // Sort: active first, then upcoming, then ended
      const statusOrder = { active: 0, upcoming: 1, ended: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }

  /**
   * Get a specific reward program
   */
  getRewardProgram(programId: string): RewardProgram | null {
    return rewardPrograms.get(programId) || null;
  }

  /**
   * Stake LP tokens into a reward program
   */
  stake(params: StakeParams, userAddress: string): StakingPosition {
    const program = rewardPrograms.get(`program_${params.poolId}`);

    if (!program) {
      throw new Error('Reward program not found');
    }

    if (program.status !== 'active') {
      throw new Error('Reward program is not active');
    }

    // Find lock period multiplier
    const lockOption = LOCK_PERIOD_OPTIONS.find(
      (opt) => opt.days === params.lockPeriod
    );

    if (!lockOption) {
      throw new Error('Invalid lock period');
    }

    const positionId = `stake_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    const stakedAt = Date.now();
    const unlockAt = stakedAt + params.lockPeriod * 24 * 60 * 60 * 1000;

    // Calculate APR with lock period bonus
    const totalAPR = program.baseAPR * lockOption.aprMultiplier;

    const position: StakingPosition = {
      id: positionId,
      user: userAddress,
      poolId: params.poolId,
      poolName: program.poolName,
      tokenX: program.tokenX,
      tokenY: program.tokenY,
      tokenXSymbol: program.tokenXSymbol,
      tokenYSymbol: program.tokenYSymbol,
      lpTokensStaked: params.lpTokenAmount,
      valueUSD: parseFloat(params.lpTokenAmount) * 2.5, // Mock value
      stakedAt,
      lockPeriod: params.lockPeriod,
      unlockAt,
      apr: totalAPR,
      rewardsEarned: '0',
      rewardsEarnedUSD: 0,
      rewardToken: program.rewardToken,
      rewardTokenSymbol: program.rewardTokenSymbol,
      status: 'active',
    };

    stakingPositions.set(positionId, position);

    // Update program statistics
    program.totalStaked = (
      parseFloat(program.totalStaked) + parseFloat(params.lpTokenAmount)
    ).toString();
    program.totalStakedUSD += position.valueUSD;
    program.participantCount += 1;
    rewardPrograms.set(program.id, program);

    return position;
  }

  /**
   * Unstake LP tokens and claim rewards
   */
  unstake(params: UnstakeParams, userAddress: string): {
    position: StakingPosition;
    rewards: string;
  } {
    const position = stakingPositions.get(params.stakingPositionId);

    if (!position) {
      throw new Error('Staking position not found');
    }

    if (position.user !== userAddress) {
      throw new Error('Unauthorized');
    }

    if (position.status !== 'active') {
      throw new Error('Position is not active');
    }

    const now = Date.now();

    if (now < position.unlockAt && position.lockPeriod > 0) {
      throw new Error(
        `Position is still locked. Unlock time: ${new Date(position.unlockAt).toLocaleString()}`
      );
    }

    // Calculate final rewards
    const rewards = this.calculateRewards(position);
    position.rewardsEarned = rewards.amount;
    position.rewardsEarnedUSD = rewards.valueUSD;
    position.status = 'unlocked';

    stakingPositions.set(position.id, position);

    // Update program statistics
    const program = rewardPrograms.get(`program_${position.poolId}`);
    if (program) {
      program.totalStaked = (
        parseFloat(program.totalStaked) - parseFloat(position.lpTokensStaked)
      ).toString();
      program.totalStakedUSD -= position.valueUSD;
      program.participantCount = Math.max(0, program.participantCount - 1);
      rewardPrograms.set(program.id, program);
    }

    // Add to claim history
    this.addClaimHistory(userAddress, position, rewards.amount);

    return {
      position,
      rewards: rewards.amount,
    };
  }

  /**
   * Claim rewards without unstaking
   */
  claimRewards(params: ClaimRewardsParams, userAddress: string): {
    position: StakingPosition;
    rewards: string;
  } {
    const position = stakingPositions.get(params.stakingPositionId);

    if (!position) {
      throw new Error('Staking position not found');
    }

    if (position.user !== userAddress) {
      throw new Error('Unauthorized');
    }

    if (position.status !== 'active') {
      throw new Error('Position is not active');
    }

    // Calculate rewards
    const rewards = this.calculateRewards(position);

    // Reset rewards counter (claimed)
    position.rewardsEarned = '0';
    position.rewardsEarnedUSD = 0;
    stakingPositions.set(position.id, position);

    // Add to claim history
    this.addClaimHistory(userAddress, position, rewards.amount);

    return {
      position,
      rewards: rewards.amount,
    };
  }

  /**
   * Calculate pending rewards for a position
   */
  private calculateRewards(position: StakingPosition): {
    amount: string;
    valueUSD: number;
  } {
    const now = Date.now();
    const stakeDuration = now - position.stakedAt;
    const daysStaked = stakeDuration / (24 * 60 * 60 * 1000);

    // Calculate rewards based on APR
    // rewards = (staked_value * APR * days_staked) / 365
    const rewardsUSD =
      (position.valueUSD * (position.apr / 100) * daysStaked) / 365;

    // Convert to reward token amount (assuming SUI at $2.35)
    const rewardTokenPrice = 2.35;
    const rewardAmount = rewardsUSD / rewardTokenPrice;

    return {
      amount: rewardAmount.toFixed(4),
      valueUSD: rewardsUSD,
    };
  }

  /**
   * Get all staking positions for a user
   */
  getUserStakingPositions(userAddress: string): StakingPosition[] {
    const positions = Array.from(stakingPositions.values()).filter(
      (pos) => pos.user === userAddress
    );

    // Update rewards for all active positions
    positions.forEach((pos) => {
      if (pos.status === 'active') {
        const rewards = this.calculateRewards(pos);
        pos.rewardsEarned = rewards.amount;
        pos.rewardsEarnedUSD = rewards.valueUSD;
      }
    });

    return positions.sort((a, b) => b.stakedAt - a.stakedAt);
  }

  /**
   * Get staking statistics for a user
   */
  getUserStakingStats(userAddress: string): StakingStats {
    const positions = this.getUserStakingPositions(userAddress);
    const activePositions = positions.filter((p) => p.status === 'active');

    const totalStakedUSD = activePositions.reduce(
      (sum, pos) => sum + pos.valueUSD,
      0
    );

    const totalRewardsEarnedUSD = positions.reduce(
      (sum, pos) => sum + pos.rewardsEarnedUSD,
      0
    );

    const averageAPR =
      activePositions.length > 0
        ? activePositions.reduce((sum, pos) => sum + pos.apr, 0) /
          activePositions.length
        : 0;

    // Count unique programs
    const programsSet = new Set(activePositions.map((pos) => pos.poolId));

    return {
      totalStakedUSD,
      totalRewardsEarnedUSD,
      activePositions: activePositions.length,
      averageAPR,
      totalProgramsParticipating: programsSet.size,
    };
  }

  /**
   * Get claim history for a user
   */
  getUserClaimHistory(userAddress: string): ClaimHistory[] {
    return claimHistory.get(userAddress) || [];
  }

  /**
   * Add claim to history
   */
  private addClaimHistory(
    userAddress: string,
    position: StakingPosition,
    rewardAmount: string
  ) {
    const history = claimHistory.get(userAddress) || [];

    const claim: ClaimHistory = {
      id: `claim_${Date.now()}`,
      timestamp: Date.now(),
      poolId: position.poolId,
      poolName: position.poolName,
      rewardAmount,
      rewardToken: position.rewardToken,
      rewardTokenSymbol: position.rewardTokenSymbol,
      rewardValueUSD: parseFloat(rewardAmount) * 2.35, // Mock price
      txDigest: `0x${Math.random().toString(16).substring(2, 18)}`,
    };

    history.unshift(claim);
    claimHistory.set(userAddress, history);
  }

  /**
   * Get estimated rewards for a new stake
   */
  estimateRewards(
    poolId: string,
    lpTokenAmount: string,
    lockPeriod: number,
    durationDays: number = 365
  ): {
    dailyRewards: number;
    monthlyRewards: number;
    yearlyRewards: number;
    apr: number;
  } {
    const program = rewardPrograms.get(`program_${poolId}`);

    if (!program) {
      throw new Error('Reward program not found');
    }

    // Find lock period multiplier
    const lockOption = LOCK_PERIOD_OPTIONS.find(
      (opt) => opt.days === lockPeriod
    );

    if (!lockOption) {
      throw new Error('Invalid lock period');
    }

    const apr = program.baseAPR * lockOption.aprMultiplier;
    const valueUSD = parseFloat(lpTokenAmount) * 2.5; // Mock value

    const dailyRewards = (valueUSD * (apr / 100)) / 365;
    const monthlyRewards = dailyRewards * 30;
    const yearlyRewards = dailyRewards * 365;

    return {
      dailyRewards,
      monthlyRewards,
      yearlyRewards,
      apr,
    };
  }
}

// Singleton instance
export const liquidityMiningService = new LiquidityMiningService();
