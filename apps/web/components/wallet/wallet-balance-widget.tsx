"use client";

import { Card, TokenIcon } from "@carapace/carapace-ui";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { RefreshCw, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { useTokenBalance } from "@/lib/hooks/use-token-balance";
import { formatUSD, useTokenPrice } from "@/lib/hooks/use-token-price";
import { useTokens } from "@/lib/hooks/use-tokens";

export function WalletBalanceWidget() {
	const account = useCurrentAccount();
	const {
		tokens,
		loading: tokensLoading,
		refresh,
	} = useTokens({ enabled: true });
	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refresh();
		setTimeout(() => setRefreshing(false), 1000);
	};

	if (!account) {
		return (
			<Card className="p-6">
				<div className="flex items-center gap-3 mb-4">
					<Wallet className="h-5 w-5 text-muted-foreground" />
					<h3 className="font-semibold">Wallet Balances</h3>
				</div>
				<div className="text-center py-8">
					<Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
					<p className="text-sm text-muted-foreground">
						Connect wallet to view balances
					</p>
				</div>
			</Card>
		);
	}

	if (tokensLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center gap-3 mb-4">
					<Wallet className="h-5 w-5 text-muted-foreground" />
					<h3 className="font-semibold">Wallet Balances</h3>
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
				<div className="flex items-center gap-3">
					<Wallet className="h-5 w-5 text-muted-foreground" />
					<h3 className="font-semibold">Wallet Balances</h3>
				</div>
				<button
					type="button"
					onClick={handleRefresh}
					disabled={refreshing}
					className="p-2 rounded-lg hover:bg-accent/50 transition-colors disabled:opacity-50"
					title="Refresh balances"
				>
					<RefreshCw
						className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
					/>
				</button>
			</div>

			<div className="space-y-3">
				{tokens.slice(0, 4).map((token) => (
					<TokenBalanceRow
						key={token.address}
						symbol={token.symbol}
						address={token.address}
						decimals={token.decimals}
					/>
				))}
			</div>

			<TotalPortfolioValue tokens={tokens} />
		</Card>
	);
}

function TokenBalanceRow({
	symbol,
	address,
	decimals,
}: {
	symbol: string;
	address: string;
	decimals: number;
}) {
	const { formattedBalance, isLoading } = useTokenBalance(address, decimals);
	const { price } = useTokenPrice(symbol);

	const usdValue =
		formattedBalance && price ? parseFloat(formattedBalance) * price : 0;

	return (
		<div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
			<div className="flex items-center gap-3">
				<TokenIcon
					symbol={symbol}
					size="sm"
					gradient="bg-brand-gradient-ocean"
				/>
				<div>
					<div className="font-medium">{symbol}</div>
					<div className="text-xs text-muted-foreground">
						{isLoading ? "..." : parseFloat(formattedBalance || "0").toFixed(4)}
					</div>
				</div>
			</div>
			<div className="text-right">
				<div className="font-medium">{formatUSD(usdValue)}</div>
				{price && (
					<div className="text-xs text-muted-foreground">
						${price.toFixed(2)}
					</div>
				)}
			</div>
		</div>
	);
}

function TotalPortfolioValue({ tokens: _tokens }: { tokens: any[] }) {
	// Calculate total portfolio value
	const calculateTotal = () => {
		// This would normally aggregate all token balances
		// For now, return a mock value
		return 12345.67;
	};

	return (
		<div className="mt-4 pt-4 border-t">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<TrendingUp className="h-4 w-4 text-green-600" />
					<span className="text-sm font-medium text-muted-foreground">
						Total Value
					</span>
				</div>
				<div className="text-right">
					<div className="text-2xl font-bold">
						{formatUSD(calculateTotal())}
					</div>
					<div className="text-xs text-green-600">+2.5% today</div>
				</div>
			</div>
		</div>
	);
}

export function CompactWalletBalance() {
	const account = useCurrentAccount();
	const { formattedBalance, isLoading } = useTokenBalance("0x2::sui::SUI", 9);
	const { price: suiPrice } = useTokenPrice("SUI");

	if (!account) return null;

	const usdValue =
		formattedBalance && suiPrice ? parseFloat(formattedBalance) * suiPrice : 0;

	return (
		<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
			<TokenIcon symbol="SUI" size="xs" gradient="bg-brand-gradient-ocean" />
			<div>
				<div className="text-xs font-medium">
					{isLoading
						? "..."
						: `${parseFloat(formattedBalance || "0").toFixed(2)} SUI`}
				</div>
				<div className="text-[10px] text-muted-foreground">
					{formatUSD(usdValue)}
				</div>
			</div>
		</div>
	);
}
