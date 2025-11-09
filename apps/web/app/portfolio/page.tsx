"use client";

import {
	BlurFade,
	Button,
	Card,
	DotPattern,
	MagicCard,
} from "@carapace/carapace-ui";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
	AlertTriangle,
	ArrowUpRight,
	Clock,
	Droplets,
	ExternalLink,
	PieChart,
	TrendingDown,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { portfolioService } from "@/lib/services/portfolio-service";
import type { Portfolio, PortfolioTransaction } from "@/lib/types/portfolio";

export default function PortfolioPage() {
	const account = useCurrentAccount();
	const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
	const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedTimeframe, setSelectedTimeframe] = useState<
		"day" | "week" | "month" | "all"
	>("day");

	// Load portfolio data
	useEffect(() => {
		if (!account?.address) {
			setIsLoading(false);
			return;
		}

		const loadData = async () => {
			setIsLoading(true);
			try {
				const portfolioData = await portfolioService.getPortfolio(
					account.address,
				);
				const txData = await portfolioService.getTransactions(account.address);
				setPortfolio(portfolioData);
				setTransactions(txData);
			} catch (error) {
				console.error("Failed to load portfolio:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [account]);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	};

	const formatPercent = (value: number) => {
		const sign = value >= 0 ? "+" : "";
		return `${sign}${value.toFixed(2)}%`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getPnLForTimeframe = () => {
		if (!portfolio) return { value: 0, percent: 0 };
		const { pnl } = portfolio.stats;

		switch (selectedTimeframe) {
			case "day":
				return { value: pnl.daily, percent: pnl.dailyPercent };
			case "week":
				return { value: pnl.weekly, percent: pnl.weeklyPercent };
			case "month":
				return { value: pnl.monthly, percent: pnl.monthlyPercent };
			case "all":
				return { value: pnl.allTime, percent: pnl.allTimePercent };
		}
	};

	const getTransactionTypeIcon = (type: PortfolioTransaction["type"]) => {
		switch (type) {
			case "swap":
				return <ArrowUpRight className="h-4 w-4" />;
			case "add_liquidity":
				return <Droplets className="h-4 w-4" />;
			case "remove_liquidity":
				return <Droplets className="h-4 w-4" />;
			case "claim_rewards":
				return <TrendingUp className="h-4 w-4" />;
		}
	};

	const getTransactionTypeLabel = (type: PortfolioTransaction["type"]) => {
		switch (type) {
			case "swap":
				return "Swap";
			case "add_liquidity":
				return "Add Liquidity";
			case "remove_liquidity":
				return "Remove Liquidity";
			case "claim_rewards":
				return "Claim Rewards";
		}
	};

	if (!account) {
		return (
			<div className="relative min-h-screen py-12">
				<DotPattern className="opacity-10" />
				<div className="relative z-10 max-w-7xl mx-auto px-4">
					<Card className="p-12 text-center">
						<Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
						<h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
						<p className="text-muted-foreground">
							Please connect your wallet to view your portfolio
						</p>
					</Card>
				</div>
			</div>
		);
	}

	if (isLoading || !portfolio) {
		return (
			<div className="relative min-h-screen py-12">
				<DotPattern className="opacity-10" />
				<div className="relative z-10 max-w-7xl mx-auto px-4">
					<Card className="p-12 text-center">
						<p className="text-muted-foreground">Loading portfolio...</p>
					</Card>
				</div>
			</div>
		);
	}

	const pnl = getPnLForTimeframe();
	const allocation = portfolioService.getAssetAllocation(portfolio);
	const suggestions = portfolioService.getRebalancingSuggestions(portfolio);

	return (
		<div className="relative min-h-screen py-12">
			<DotPattern className="opacity-10" />
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<BlurFade delay={0.1}>
					<div className="mb-12">
						<h1 className="text-4xl md:text-5xl font-bold mb-2">Portfolio</h1>
						<p className="text-lg text-muted-foreground">
							Track your assets, positions, and performance
						</p>
					</div>
				</BlurFade>

				{/* Total Value Card */}
				<BlurFade delay={0.2}>
					<MagicCard className="p-8 mb-8">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<div>
								<p className="text-sm text-muted-foreground mb-2">
									Total Portfolio Value
								</p>
								<h2 className="text-4xl md:text-5xl font-bold mb-2">
									{formatCurrency(portfolio.stats.totalValue)}
								</h2>
								<div className="flex items-center gap-4">
									<div
										className={`flex items-center gap-1 ${
											pnl.value >= 0 ? "text-green-600" : "text-red-600"
										}`}
									>
										{pnl.value >= 0 ? (
											<TrendingUp className="h-5 w-5" />
										) : (
											<TrendingDown className="h-5 w-5" />
										)}
										<span className="text-lg font-semibold">
											{formatCurrency(Math.abs(pnl.value))}
										</span>
										<span className="text-sm">
											({formatPercent(pnl.percent)})
										</span>
									</div>
									<div className="flex gap-2">
										{(["day", "week", "month", "all"] as const).map((tf) => (
											<Button
												key={tf}
												variant={
													selectedTimeframe === tf ? "default" : "outline"
												}
												size="sm"
												onClick={() => setSelectedTimeframe(tf)}
											>
												{tf === "day"
													? "24h"
													: tf === "week"
														? "7d"
														: tf === "month"
															? "30d"
															: "All"}
											</Button>
										))}
									</div>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-2 gap-4">
								<div className="text-right">
									<p className="text-xs text-muted-foreground mb-1">Assets</p>
									<p className="text-2xl font-bold">
										{portfolio.stats.totalTokens}
									</p>
								</div>
								<div className="text-right">
									<p className="text-xs text-muted-foreground mb-1">
										LP Positions
									</p>
									<p className="text-2xl font-bold">
										{portfolio.stats.totalPositions}
									</p>
								</div>
							</div>
						</div>
					</MagicCard>
				</BlurFade>

				{/* Performance Highlights */}
				{(portfolio.stats.topGainer || portfolio.stats.topLoser) && (
					<BlurFade delay={0.3}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
							{portfolio.stats.topGainer && (
								<Card className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground mb-1">
												Top Gainer
											</p>
											<p className="text-lg font-bold">
												{portfolio.stats.topGainer.token}
											</p>
										</div>
										<div className="text-right">
											<div className="flex items-center gap-1 text-green-600">
												<TrendingUp className="h-4 w-4" />
												<span className="text-lg font-semibold">
													{formatPercent(portfolio.stats.topGainer.change)}
												</span>
											</div>
										</div>
									</div>
								</Card>
							)}
							{portfolio.stats.topLoser && (
								<Card className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground mb-1">
												Top Loser
											</p>
											<p className="text-lg font-bold">
												{portfolio.stats.topLoser.token}
											</p>
										</div>
										<div className="text-right">
											<div className="flex items-center gap-1 text-red-600">
												<TrendingDown className="h-4 w-4" />
												<span className="text-lg font-semibold">
													{formatPercent(portfolio.stats.topLoser.change)}
												</span>
											</div>
										</div>
									</div>
								</Card>
							)}
						</div>
					</BlurFade>
				)}

				{/* Rebalancing Suggestions */}
				{suggestions.length > 0 && (
					<BlurFade delay={0.4}>
						<Card className="p-4 mb-8 border-orange-200 dark:border-orange-800">
							<div className="flex items-start gap-3">
								<AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
								<div className="flex-1">
									<h3 className="font-semibold mb-2">Portfolio Optimization</h3>
									<ul className="space-y-2">
										{suggestions.map((suggestion, i) => (
											<li key={i} className="text-sm text-muted-foreground">
												• {suggestion.message}
											</li>
										))}
									</ul>
								</div>
							</div>
						</Card>
					</BlurFade>
				)}

				{/* Asset Allocation */}
				<BlurFade delay={0.5}>
					<Card className="p-6 mb-8">
						<div className="flex items-center gap-2 mb-4">
							<PieChart className="h-5 w-5" />
							<h2 className="text-xl font-bold">Asset Allocation</h2>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm text-muted-foreground">
										Token Balances
									</span>
									<span className="font-semibold">
										{allocation.tokens.toFixed(1)}%
									</span>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div
										className="h-full bg-primary"
										style={{ width: `${allocation.tokens}%` }}
									/>
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{formatCurrency(portfolio.stats.tokenBalanceValue)}
								</p>
							</div>
							<div>
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm text-muted-foreground">
										Liquidity Positions
									</span>
									<span className="font-semibold">
										{allocation.liquidity.toFixed(1)}%
									</span>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div
										className="h-full bg-accent"
										style={{ width: `${allocation.liquidity}%` }}
									/>
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{formatCurrency(portfolio.stats.liquidityPositionValue)}
								</p>
							</div>
						</div>
					</Card>
				</BlurFade>

				{/* Token Balances */}
				<BlurFade delay={0.6}>
					<Card className="p-6 mb-8">
						<div className="flex items-center gap-2 mb-4">
							<Wallet className="h-5 w-5" />
							<h2 className="text-xl font-bold">Token Balances</h2>
						</div>
						<div className="space-y-3">
							{portfolio.tokenBalances.map((token, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
											{token.tokenSymbol.charAt(0)}
										</div>
										<div>
											<p className="font-semibold">{token.tokenSymbol}</p>
											<p className="text-sm text-muted-foreground">
												{parseFloat(token.balance).toFixed(4)} tokens
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold">
											{formatCurrency(token.valueUSD)}
										</p>
										<div className="flex items-center justify-end gap-1">
											<span className="text-xs text-muted-foreground">
												{token.allocation.toFixed(1)}%
											</span>
											<span
												className={`text-xs ${
													token.change24h >= 0
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{formatPercent(token.change24h)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</Card>
				</BlurFade>

				{/* Liquidity Positions */}
				{portfolio.liquidityPositions.length > 0 && (
					<BlurFade delay={0.7}>
						<Card className="p-6 mb-8">
							<div className="flex items-center gap-2 mb-4">
								<Droplets className="h-5 w-5" />
								<h2 className="text-xl font-bold">Liquidity Positions</h2>
							</div>
							<div className="space-y-3">
								{portfolio.liquidityPositions.map((position, index) => (
									<div key={index} className="p-4 bg-muted/30 rounded-lg">
										<div className="flex items-center justify-between mb-3">
											<div>
												<p className="font-semibold">
													{position.tokenXSymbol}/{position.tokenYSymbol}
												</p>
												<p className="text-sm text-muted-foreground">
													Pool Liquidity
												</p>
											</div>
											<div className="text-right">
												<p className="font-semibold">
													{formatCurrency(position.valueUSD)}
												</p>
												<p className="text-xs text-muted-foreground">
													{position.allocation.toFixed(1)}% of portfolio
												</p>
											</div>
										</div>
										<div className="grid grid-cols-3 gap-4 text-sm">
											<div>
												<p className="text-muted-foreground mb-1">APY</p>
												<p className="font-semibold text-green-600">
													{position.apy.toFixed(1)}%
												</p>
											</div>
											<div>
												<p className="text-muted-foreground mb-1">Fees (24h)</p>
												<p className="font-semibold">
													{formatCurrency(position.feesEarned24h)}
												</p>
											</div>
											<div>
												<p className="text-muted-foreground mb-1">Total Fees</p>
												<p className="font-semibold">
													{formatCurrency(position.feesEarnedTotal)}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</Card>
					</BlurFade>
				)}

				{/* Recent Transactions */}
				<BlurFade delay={0.8}>
					<Card className="p-6">
						<div className="flex items-center gap-2 mb-4">
							<Clock className="h-5 w-5" />
							<h2 className="text-xl font-bold">Recent Transactions</h2>
						</div>
						<div className="space-y-3">
							{transactions.map((tx, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
											{getTransactionTypeIcon(tx.type)}
										</div>
										<div>
											<p className="font-semibold">
												{getTransactionTypeLabel(tx.type)}
											</p>
											<p className="text-sm text-muted-foreground">
												{formatDate(tx.timestamp)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right">
											{tx.tokens.map((token, i) => (
												<p
													key={i}
													className={`text-sm ${
														token.amount.startsWith("-")
															? "text-red-600"
															: "text-green-600"
													}`}
												>
													{token.amount} {token.symbol}
												</p>
											))}
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												window.open(
													`https://suiexplorer.com/txblock/${tx.txDigest}?network=testnet`,
													"_blank",
												)
											}
										>
											<ExternalLink className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</Card>
				</BlurFade>
			</div>
		</div>
	);
}
