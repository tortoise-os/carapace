"use client";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Input,
} from "@carapace/carapace-ui";
import { AlertTriangle, ExternalLink, Settings } from "lucide-react";
import { useState } from "react";

interface SwapSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SwapSettingsDialog({
	open,
	onOpenChange,
}: SwapSettingsDialogProps) {
	const [slippage, setSlippage] = useState("0.5");
	const [customSlippage, setCustomSlippage] = useState("");
	const [deadline, setDeadline] = useState("20");
	const [gasBudget, setGasBudget] = useState("");
	const [usingLedger, setUsingLedger] = useState(false);
	const [rpc, setRpc] = useState("https://fullnode.mainnet.sui.io:443");
	const [explorer, setExplorer] = useState("https://suiscan.xyz");

	const slippagePresets = ["0.1", "0.5", "1.0", "3.0"];

	const handleSlippageChange = (value: string) => {
		setSlippage(value);
		setCustomSlippage("");
	};

	const handleCustomSlippage = (value: string) => {
		setCustomSlippage(value);
		setSlippage("custom");
	};

	const getSlippageWarning = () => {
		const numSlippage = parseFloat(
			slippage === "custom" ? customSlippage : slippage,
		);
		if (Number.isNaN(numSlippage)) return null;

		if (numSlippage < 0.1) {
			return {
				level: "error",
				message: "Your transaction may fail due to low slippage",
			};
		}
		if (numSlippage < 0.5) {
			return { level: "warning", message: "Your transaction may fail" };
		}
		if (numSlippage > 5) {
			return {
				level: "error",
				message: "High slippage - you may be front-run",
			};
		}
		if (numSlippage > 1) {
			return { level: "warning", message: "High slippage tolerance" };
		}
		return null;
	};

	const slippageWarning = getSlippageWarning();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Swap Settings
					</DialogTitle>
					<DialogDescription>Customize your swap preferences</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Slippage Tolerance */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm font-semibold">
								Slippage Tolerance
							</label>
							<span className="text-xs text-muted-foreground">
								{slippage === "custom" ? customSlippage : slippage}%
							</span>
						</div>

						<div className="grid grid-cols-4 gap-2">
							{slippagePresets.map((preset) => (
								<Button
									key={preset}
									variant={slippage === preset ? "default" : "outline"}
									size="sm"
									onClick={() => handleSlippageChange(preset)}
									className="h-9"
								>
									{preset}%
								</Button>
							))}
						</div>

						<div className="flex items-center gap-2">
							<Input
								type="number"
								placeholder="Custom"
								value={customSlippage}
								onChange={(e) => handleCustomSlippage(e.target.value)}
								className="h-9"
								step="0.1"
								min="0"
								max="50"
							/>
							<span className="text-sm text-muted-foreground">%</span>
						</div>

						{slippageWarning && (
							<div
								className={`flex items-center gap-2 p-3 rounded-lg ${
									slippageWarning.level === "error"
										? "bg-red-500/10 text-red-600 border border-red-500/20"
										: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
								}`}
							>
								<AlertTriangle className="h-4 w-4 shrink-0" />
								<span className="text-xs font-medium">
									{slippageWarning.message}
								</span>
							</div>
						)}

						<p className="text-xs text-muted-foreground">
							Your transaction will revert if the price changes unfavorably by
							more than this percentage.
						</p>
					</div>

					{/* Transaction Deadline */}
					<div className="space-y-3">
						<label className="text-sm font-semibold">
							Transaction Deadline
						</label>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								value={deadline}
								onChange={(e) => setDeadline(e.target.value)}
								className="h-9"
								min="1"
								max="4320"
							/>
							<span className="text-sm text-muted-foreground">minutes</span>
						</div>
						<p className="text-xs text-muted-foreground">
							Your transaction will revert if it is pending for more than this
							long.
						</p>
					</div>

					{/* RPC Endpoint */}
					<div className="space-y-3">
						<label className="text-sm font-semibold">RPC Endpoint</label>
						<div className="flex items-center gap-2">
							<Input
								type="text"
								value={rpc}
								onChange={(e) => setRpc(e.target.value)}
								className="h-9 text-sm"
								placeholder="https://fullnode.mainnet.sui.io:443"
							/>
							<Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
								<ExternalLink className="h-4 w-4" />
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Custom RPC endpoint for Sui network
						</p>
					</div>

					{/* Explorer */}
					<div className="space-y-3">
						<label className="text-sm font-semibold">Block Explorer</label>
						<div className="flex items-center gap-2">
							<select
								value={explorer}
								onChange={(e) => setExplorer(e.target.value)}
								className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								<option value="https://suiscan.xyz">Suiscan</option>
								<option value="https://suivision.xyz">SuiVision</option>
								<option value="https://explorer.sui.io">Sui Explorer</option>
							</select>
							<Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
								<ExternalLink className="h-4 w-4" />
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Choose your preferred block explorer
						</p>
					</div>

					{/* Gas Budget */}
					<div className="space-y-3">
						<label className="text-sm font-semibold">
							Gas Budget (Optional)
						</label>
						<Input
							type="text"
							value={gasBudget}
							onChange={(e) => setGasBudget(e.target.value)}
							placeholder="Leave blank for auto"
							className="h-9"
						/>
						<p className="text-xs text-muted-foreground">
							Maximum gas you're willing to pay. Leave blank for automatic
							estimation.
						</p>
					</div>

					{/* Using Ledger */}
					<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
						<div className="space-y-1">
							<label className="text-sm font-semibold">Using a Ledger</label>
							<p className="text-xs text-muted-foreground">
								Enable blind signing for Ledger hardware wallet
							</p>
						</div>
						<Button
							variant={usingLedger ? "default" : "outline"}
							size="sm"
							onClick={() => setUsingLedger(!usingLedger)}
							className="h-9"
						>
							{usingLedger ? "Enabled" : "Disabled"}
						</Button>
					</div>

					{/* Reset to Defaults */}
					<Button
						variant="outline"
						className="w-full"
						onClick={() => {
							setSlippage("0.5");
							setCustomSlippage("");
							setDeadline("20");
							setGasBudget("");
							setUsingLedger(false);
							setRpc("https://fullnode.mainnet.sui.io:443");
							setExplorer("https://suiscan.xyz");
						}}
					>
						Reset to Defaults
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
