"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@carapace/carapace-ui";
import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { CheckCircle2, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

interface WalletSelectorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WalletSelectorModal({
	open,
	onOpenChange,
}: WalletSelectorModalProps) {
	const wallets = useWallets();
	const { mutate: connect } = useConnectWallet();
	const [connecting, setConnecting] = useState<string | null>(null);

	const handleConnect = async (walletName: string) => {
		setConnecting(walletName);
		try {
			connect(
				{ wallet: wallets.find((w) => w.name === walletName)! },
				{
					onSuccess: () => {
						onOpenChange(false);
						setConnecting(null);
					},
					onError: () => {
						setConnecting(null);
					},
				},
			);
		} catch (_error) {
			setConnecting(null);
		}
	};

	const getWalletIcon = (name: string): string => {
		// In production, these would be actual logo URLs
		return name.charAt(0);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Connect Wallet</DialogTitle>
					<DialogDescription>
						Connect your Sui wallet to start trading
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					{/* Available Wallets */}
					{wallets.length > 0 ? (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								<CheckCircle2 className="h-3 w-3" />
								Available Wallets
							</div>
							{wallets.map((wallet) => (
								<button
									key={wallet.name}
									onClick={() => handleConnect(wallet.name)}
									disabled={connecting !== null}
									className="w-full flex items-center justify-between p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center font-bold text-white">
											{getWalletIcon(wallet.name)}
										</div>
										<div className="text-left">
											<div className="font-semibold">{wallet.name}</div>
											<div className="text-xs text-muted-foreground">
												{connecting === wallet.name
													? "Connecting..."
													: "Ready to connect"}
											</div>
										</div>
									</div>
									{connecting === wallet.name ? (
										<div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
									) : (
										<CheckCircle2 className="h-5 w-5 text-green-500" />
									)}
								</button>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							<p className="text-sm font-medium mb-2">No wallets detected</p>
							<p className="text-xs text-muted-foreground mb-4">
								Install a Sui wallet extension to get started
							</p>
							<a
								href="https://sui.io/wallets"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
							>
								View available wallets
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>
					)}
				</div>

				{/* Info Footer */}
				<div className="mt-4 p-3 bg-muted/50 rounded-lg">
					<p className="text-xs text-muted-foreground">
						By connecting a wallet, you agree to TortoiseSwap's Terms of Service
						and acknowledge that you have read and understand the protocol
						disclaimers.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
