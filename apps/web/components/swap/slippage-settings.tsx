"use client";

import { Button, Card, Input } from "@carapace/carapace-ui";
import { AlertTriangle, Check, Settings } from "lucide-react";
import { useState } from "react";

interface SlippageSettingsProps {
	slippage: number;
	onSlippageChange: (value: number) => void;
	deadline?: number;
	onDeadlineChange?: (value: number) => void;
}

const PRESET_SLIPPAGES = [0.1, 0.5, 1.0];

export function SlippageSettings({
	slippage,
	onSlippageChange,
	deadline = 20,
	onDeadlineChange,
}: SlippageSettingsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [customSlippage, setCustomSlippage] = useState(
		PRESET_SLIPPAGES.includes(slippage) ? "" : slippage.toString(),
	);
	const [customDeadline, setCustomDeadline] = useState(deadline.toString());

	const handlePresetClick = (value: number) => {
		onSlippageChange(value);
		setCustomSlippage("");
	};

	const handleCustomSlippageChange = (value: string) => {
		setCustomSlippage(value);
		const numValue = parseFloat(value);
		if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 50) {
			onSlippageChange(numValue);
		}
	};

	const handleDeadlineChange = (value: string) => {
		setCustomDeadline(value);
		const numValue = parseInt(value, 10);
		if (!Number.isNaN(numValue) && numValue > 0 && numValue <= 4320) {
			onDeadlineChange?.(numValue);
		}
	};

	const getSlippageWarning = () => {
		if (slippage < 0.1) {
			return { level: "error", message: "Your transaction may fail" };
		}
		if (slippage < 0.5) {
			return { level: "warning", message: "Your transaction may fail" };
		}
		if (slippage > 5) {
			return {
				level: "error",
				message: "High slippage - you may be front-run",
			};
		}
		if (slippage > 1) {
			return { level: "warning", message: "High slippage tolerance" };
		}
		return null;
	};

	const warning = getSlippageWarning();

	return (
		<div className="relative">
			{/* Settings Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 rounded-lg hover:bg-accent/50 transition-colors relative"
				title="Transaction settings"
			>
				<Settings className="h-5 w-5" />
				{warning && (
					<div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-500" />
				)}
			</button>

			{/* Settings Modal */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>

					{/* Settings Card */}
					<Card className="absolute right-0 top-12 z-50 w-96 p-6 shadow-xl border-2">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold">Transaction Settings</h3>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="text-muted-foreground hover:text-foreground"
							>
								✕
							</button>
						</div>

						{/* Slippage Tolerance */}
						<div className="space-y-4">
							<div>
								<label
									htmlFor="slippage-tolerance-input"
									className="text-sm font-medium block mb-3"
								>
									Slippage Tolerance
								</label>

								{/* Preset Buttons */}
								<div className="grid grid-cols-3 gap-2 mb-3">
									{PRESET_SLIPPAGES.map((value) => (
										<button
											type="button"
											key={value}
											onClick={() => handlePresetClick(value)}
											className={`px-4 py-2 rounded-lg font-medium transition-colors ${
												slippage === value && !customSlippage
													? "bg-primary text-primary-foreground"
													: "bg-muted hover:bg-muted/80"
											}`}
										>
											{value}%
										</button>
									))}
								</div>

								{/* Custom Input */}
								<div className="relative">
									<Input
										id="slippage-tolerance-input"
										type="number"
										placeholder="Custom"
										value={customSlippage}
										onChange={(e) => handleCustomSlippageChange(e.target.value)}
										className="pr-8"
										min="0"
										max="50"
										step="0.1"
									/>
									<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
										%
									</span>
								</div>

								{/* Warning Message */}
								{warning && (
									<div
										className={`flex items-center gap-2 mt-3 p-3 rounded-lg ${
											warning.level === "error"
												? "bg-red-500/10 text-red-600 border border-red-500/20"
												: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
										}`}
									>
										<AlertTriangle className="h-4 w-4 shrink-0" />
										<span className="text-sm">{warning.message}</span>
									</div>
								)}
							</div>

							{/* Transaction Deadline */}
							{onDeadlineChange && (
								<div>
									<label
										htmlFor="transaction-deadline-input"
										className="text-sm font-medium block mb-3"
									>
										Transaction Deadline
									</label>
									<div className="relative">
										<Input
											id="transaction-deadline-input"
											type="number"
											value={customDeadline}
											onChange={(e) => handleDeadlineChange(e.target.value)}
											className="pr-20"
											min="1"
											max="4320"
										/>
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
											minutes
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-2">
										Your transaction will revert if it is pending for more than
										this long.
									</p>
								</div>
							)}

							{/* Current Settings Summary */}
							<div className="pt-4 border-t">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										Current slippage:
									</span>
									<span className="font-semibold">{slippage}%</span>
								</div>
								{onDeadlineChange && (
									<div className="flex items-center justify-between text-sm mt-2">
										<span className="text-muted-foreground">Deadline:</span>
										<span className="font-semibold">{deadline} minutes</span>
									</div>
								)}
							</div>

							{/* Close Button */}
							<Button
								onClick={() => setIsOpen(false)}
								className="w-full"
								variant="outline"
							>
								<Check className="h-4 w-4 mr-2" />
								Done
							</Button>
						</div>
					</Card>
				</>
			)}
		</div>
	);
}
