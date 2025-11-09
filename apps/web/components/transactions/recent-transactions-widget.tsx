"use client";

import { Card } from "@carapace/carapace-ui";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
	ArrowLeftRight,
	CheckCircle,
	Clock,
	ExternalLink,
	Minus,
	Plus,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Transaction {
	id: string;
	digest: string;
	type: "swap" | "add_liquidity" | "remove_liquidity" | "create_pool";
	status: "success" | "failed" | "pending";
	timestamp: number;
	tokenIn?: string;
	tokenOut?: string;
	amountIn?: string;
	amountOut?: string;
	explorerUrl?: string;
}

export function RecentTransactionsWidget() {
	const account = useCurrentAccount();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!account?.address) {
			setLoading(false);
			return;
		}

		const fetchTransactions = async () => {
			try {
				const response = await fetch(
					`http://localhost:3500/api/transactions/${account.address}?limit=5`,
				);
				const data = await response.json();
				setTransactions(data.transactions || []);
			} catch (error) {
				console.error("Failed to fetch recent transactions:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTransactions();

		// Refresh every 30 seconds
		const interval = setInterval(fetchTransactions, 30000);
		return () => clearInterval(interval);
	}, [account?.address]);

	if (!account) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-semibold">Recent Transactions</h3>
				</div>
				<div className="text-center py-8">
					<Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
					<p className="text-sm text-muted-foreground">
						Connect wallet to view transactions
					</p>
				</div>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-semibold">Recent Transactions</h3>
				</div>
				<div className="flex items-center justify-center py-8">
					<div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold">Recent Transactions</h3>
				<Link
					href="/history"
					className="text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					View all →
				</Link>
			</div>

			{transactions.length === 0 ? (
				<div className="text-center py-8">
					<Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
					<p className="text-sm text-muted-foreground">No transactions yet</p>
				</div>
			) : (
				<div className="space-y-2">
					{transactions.map((tx) => (
						<TransactionItem key={tx.id} transaction={tx} />
					))}
				</div>
			)}
		</Card>
	);
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
	const getIcon = () => {
		switch (transaction.type) {
			case "swap":
				return <ArrowLeftRight className="h-4 w-4" />;
			case "add_liquidity":
				return <Plus className="h-4 w-4" />;
			case "remove_liquidity":
				return <Minus className="h-4 w-4" />;
			default:
				return <ArrowLeftRight className="h-4 w-4" />;
		}
	};

	const getStatusIcon = () => {
		switch (transaction.status) {
			case "success":
				return <CheckCircle className="h-3 w-3 text-green-600" />;
			case "failed":
				return <XCircle className="h-3 w-3 text-red-600" />;
			case "pending":
				return <Clock className="h-3 w-3 text-yellow-600 animate-pulse" />;
		}
	};

	const getTypeLabel = () => {
		switch (transaction.type) {
			case "swap":
				return "Swap";
			case "add_liquidity":
				return "Add Liquidity";
			case "remove_liquidity":
				return "Remove Liquidity";
			case "create_pool":
				return "Create Pool";
			default:
				return transaction.type;
		}
	};

	const formatTimestamp = (timestamp: number) => {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	};

	return (
		<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
			{/* Icon */}
			<div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 bg-opacity-10 shrink-0">
				{getIcon()}
			</div>

			{/* Transaction Details */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span className="text-sm font-medium">{getTypeLabel()}</span>
					{getStatusIcon()}
				</div>
				<div className="text-xs text-muted-foreground truncate">
					{transaction.tokenIn && transaction.tokenOut ? (
						<>
							{transaction.tokenIn} → {transaction.tokenOut}
						</>
					) : (
						formatTimestamp(transaction.timestamp)
					)}
				</div>
			</div>

			{/* Time & Explorer Link */}
			<div className="flex items-center gap-2 shrink-0">
				<span className="text-xs text-muted-foreground hidden sm:block">
					{formatTimestamp(transaction.timestamp)}
				</span>
				{transaction.explorerUrl && (
					<a
						href={transaction.explorerUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="p-1 hover:bg-accent/50 rounded transition-colors"
						title="View in explorer"
					>
						<ExternalLink className="h-3 w-3" />
					</a>
				)}
			</div>
		</div>
	);
}

export function CompactRecentTransactions({ limit = 3 }: { limit?: number }) {
	const account = useCurrentAccount();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!account?.address) {
			setLoading(false);
			return;
		}

		const fetchTransactions = async () => {
			try {
				const response = await fetch(
					`http://localhost:3500/api/transactions/${account.address}?limit=${limit}`,
				);
				const data = await response.json();
				setTransactions(data.transactions || []);
			} catch (error) {
				console.error("Failed to fetch recent transactions:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTransactions();
	}, [account?.address, limit]);

	if (!account || loading || transactions.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			{transactions.map((tx) => (
				<div
					key={tx.id}
					className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs"
				>
					<div className="p-1.5 rounded bg-gradient-to-br from-teal-500 to-cyan-500 bg-opacity-10">
						{tx.type === "swap" ? (
							<ArrowLeftRight className="h-3 w-3" />
						) : tx.type === "add_liquidity" ? (
							<Plus className="h-3 w-3" />
						) : (
							<Minus className="h-3 w-3" />
						)}
					</div>
					<span className="flex-1 truncate">
						{tx.tokenIn && tx.tokenOut
							? `${tx.tokenIn} → ${tx.tokenOut}`
							: "Transaction"}
					</span>
					{tx.status === "success" && (
						<CheckCircle className="h-3 w-3 text-green-600" />
					)}
					{tx.status === "failed" && (
						<XCircle className="h-3 w-3 text-red-600" />
					)}
					{tx.status === "pending" && (
						<Clock className="h-3 w-3 text-yellow-600" />
					)}
				</div>
			))}
		</div>
	);
}
