export interface GovernanceToken {
	symbol: string;
	name: string;
	address: string;
	totalSupply: string;
	circulatingSupply: string;
	yourBalance: string;
	votingPower: string;
	delegatedTo?: string;
	delegatedFrom?: string[];
}

export type ProposalStatus =
	| "pending"
	| "active"
	| "succeeded"
	| "defeated"
	| "queued"
	| "executed"
	| "cancelled"
	| "expired";

export type ProposalType =
	| "parameter_change"
	| "treasury"
	| "upgrade"
	| "general";

export type VoteChoice = "for" | "against" | "abstain";

export interface Proposal {
	id: string;
	title: string;
	description: string;
	proposer: string;
	proposerName?: string;
	type: ProposalType;
	status: ProposalStatus;

	// Voting
	votesFor: string;
	votesAgainst: string;
	votesAbstain: string;
	totalVotes: string;
	quorum: string; // Required percentage of total supply
	threshold: string; // Required percentage to pass

	// Timing
	createdAt: number;
	startTime: number;
	endTime: number;
	executionDelay: number; // Timelock delay in seconds
	executedAt?: number;

	// Execution details (specific to proposal type)
	actions?: ProposalAction[];

	// User voting
	userVote?: {
		choice: VoteChoice;
		power: string;
		timestamp: number;
	};
}

export interface ProposalAction {
	target: string; // Contract address
	function: string; // Function to call
	parameters: any[]; // Function parameters
	value?: string; // Optional SUI value to send
	description: string;
}

export interface CreateProposalParams {
	title: string;
	description: string;
	type: ProposalType;
	actions: ProposalAction[];
	votingDuration: number; // Duration in days
	quorum: number; // Percentage (e.g., 10 for 10%)
	threshold: number; // Percentage (e.g., 60 for 60%)
}

export interface VoteParams {
	proposalId: string;
	choice: VoteChoice;
	reason?: string;
}

export interface DelegateParams {
	delegatee: string;
}

export interface GovernanceStats {
	totalProposals: number;
	activeProposals: number;
	succeededProposals: number;
	defeatedProposals: number;
	totalVoters: number;
	totalVotingPower: string;
	treasuryBalance: string;
	averageParticipation: number; // Percentage
}

export interface VoteHistory {
	proposalId: string;
	proposalTitle: string;
	choice: VoteChoice;
	votingPower: string;
	timestamp: number;
	txDigest: string;
}

export interface ProposalFilter {
	status?: ProposalStatus[];
	type?: ProposalType[];
	proposer?: string;
}

// Common proposal templates
export const PROPOSAL_TEMPLATES = {
	parameter_change: {
		type: "parameter_change" as ProposalType,
		title: "Update Protocol Parameter",
		description:
			"Propose changes to protocol parameters such as fees, limits, or timeouts.",
		quorum: 10,
		threshold: 60,
		votingDuration: 7,
	},
	treasury: {
		type: "treasury" as ProposalType,
		title: "Treasury Allocation",
		description:
			"Propose allocation of treasury funds for grants, partnerships, or protocol development.",
		quorum: 15,
		threshold: 70,
		votingDuration: 7,
	},
	upgrade: {
		type: "upgrade" as ProposalType,
		title: "Protocol Upgrade",
		description:
			"Propose smart contract upgrades or new feature implementations.",
		quorum: 20,
		threshold: 75,
		votingDuration: 10,
	},
	general: {
		type: "general" as ProposalType,
		title: "General Proposal",
		description: "General community proposal for discussion and voting.",
		quorum: 5,
		threshold: 50,
		votingDuration: 5,
	},
};

// Delegation tiers based on voting power
export interface DelegationTier {
	name: string;
	minPower: string;
	badge: string;
	description: string;
}

export const DELEGATION_TIERS: DelegationTier[] = [
	{
		name: "Delegate",
		minPower: "100",
		badge: "🎖️",
		description: "Community member with delegated voting power",
	},
	{
		name: "Trusted Delegate",
		minPower: "1000",
		badge: "🏅",
		description: "Established delegate with significant voting power",
	},
	{
		name: "Council Member",
		minPower: "10000",
		badge: "⭐",
		description: "Top-tier delegate with substantial influence",
	},
];
