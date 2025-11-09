export interface StakingPosition {
	id: string;
	user: string;
	poolId: string;
	poolName: string;
	tokenX: string;
	tokenY: string;
	tokenXSymbol: string;
	tokenYSymbol: string;
	lpTokensStaked: string;
	valueUSD: number;
	stakedAt: number;
	lockPeriod: number; // Duration in days
	unlockAt: number;
	apr: number;
	rewardsEarned: string;
	rewardsEarnedUSD: number;
	rewardToken: string;
	rewardTokenSymbol: string;
	status: "active" | "unlocking" | "unlocked";
}

export interface RewardProgram {
	id: string;
	poolId: string;
	poolName: string;
	tokenX: string;
	tokenY: string;
	tokenXSymbol: string;
	tokenYSymbol: string;
	rewardToken: string;
	rewardTokenSymbol: string;
	totalRewards: string;
	rewardsRemaining: string;
	startTime: number;
	endTime: number;
	minStakeDuration: number; // Days
	baseAPR: number;
	bonusAPR: number;
	totalStaked: string;
	totalStakedUSD: number;
	participantCount: number;
	status: "upcoming" | "active" | "ended";
}

export interface StakingStats {
	totalStakedUSD: number;
	totalRewardsEarnedUSD: number;
	activePositions: number;
	averageAPR: number;
	totalProgramsParticipating: number;
}

export interface ClaimHistory {
	id: string;
	timestamp: number;
	poolId: string;
	poolName: string;
	rewardAmount: string;
	rewardToken: string;
	rewardTokenSymbol: string;
	rewardValueUSD: number;
	txDigest: string;
}

export interface StakeParams {
	poolId: string;
	lpTokenAmount: string;
	lockPeriod: number; // Days: 0 (flexible), 30, 90, 180, 365
}

export interface UnstakeParams {
	stakingPositionId: string;
}

export interface ClaimRewardsParams {
	stakingPositionId: string;
}

export interface LockPeriodOption {
	days: number;
	label: string;
	aprMultiplier: number; // Additional APR based on lock period
	description: string;
}

export const LOCK_PERIOD_OPTIONS: LockPeriodOption[] = [
	{
		days: 0,
		label: "Flexible",
		aprMultiplier: 1.0,
		description: "No lock period, unstake anytime",
	},
	{
		days: 30,
		label: "30 Days",
		aprMultiplier: 1.2,
		description: "+20% APR boost",
	},
	{
		days: 90,
		label: "90 Days",
		aprMultiplier: 1.5,
		description: "+50% APR boost",
	},
	{
		days: 180,
		label: "180 Days",
		aprMultiplier: 2.0,
		description: "+100% APR boost",
	},
	{
		days: 365,
		label: "365 Days",
		aprMultiplier: 3.0,
		description: "+200% APR boost",
	},
];
