"use client";

import { BlurFade, Button, Card, DotPattern } from "@carapace/carapace-ui";
import { Bell, Eye, RotateCcw, Save, Shield, Sliders } from "lucide-react";
import { useEffect, useState } from "react";

interface UserSettings {
	// Trading Preferences
	defaultSlippage: string;
	transactionDeadline: string;
	autoRouting: boolean;

	// Display Preferences
	currency: "USD" | "EUR" | "GBP";
	decimalPlaces: number;
	showBalances: boolean;
	compactMode: boolean;

	// Notification Preferences
	txNotifications: boolean;
	priceAlerts: boolean;
	emailNotifications: boolean;

	// Privacy & Security
	analyticsEnabled: boolean;
	publicProfile: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
	defaultSlippage: "0.5",
	transactionDeadline: "20",
	autoRouting: true,
	currency: "USD",
	decimalPlaces: 4,
	showBalances: true,
	compactMode: false,
	txNotifications: true,
	priceAlerts: false,
	emailNotifications: false,
	analyticsEnabled: true,
	publicProfile: false,
};

export default function SettingsPage() {
	const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
	const [hasChanges, setHasChanges] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// Load settings from localStorage on mount
	useEffect(() => {
		const savedSettings = localStorage.getItem("userSettings");
		if (savedSettings) {
			try {
				setSettings(JSON.parse(savedSettings));
			} catch (error) {
				console.error("Failed to load settings:", error);
			}
		}
	}, []);

	const handleChange = (
		key: keyof UserSettings,
		value: string | boolean | number,
	) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
		setHasChanges(true);
		setSaved(false);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			// Save to localStorage
			localStorage.setItem("userSettings", JSON.stringify(settings));

			// In a real app, you'd also save to backend
			// await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) });

			setHasChanges(false);
			setSaved(true);

			// Clear saved message after 3 seconds
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error("Failed to save settings:", error);
		} finally {
			setSaving(false);
		}
	};

	const handleReset = () => {
		setSettings(DEFAULT_SETTINGS);
		setHasChanges(true);
		setSaved(false);
	};

	return (
		<div className="relative min-h-screen py-8 px-4">
			<DotPattern className="opacity-10" />
			<div className="max-w-4xl mx-auto space-y-6">
				<BlurFade delay={0.1}>
					<div className="mb-8">
						<h1 className="text-4xl font-bold mb-2">Settings</h1>
						<p className="text-muted-foreground">
							Manage your trading preferences and account settings
						</p>
					</div>
				</BlurFade>

				{/* Trading Preferences */}
				<BlurFade delay={0.2}>
					<Card className="p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
								<Sliders className="h-5 w-5 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-semibold">Trading Preferences</h2>
								<p className="text-sm text-muted-foreground">
									Default trading parameters
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">
									Default Slippage Tolerance (%)
									<input
										type="number"
										step="0.1"
										min="0.1"
										max="50"
										value={settings.defaultSlippage}
										onChange={(e) =>
											handleChange("defaultSlippage", e.target.value)
										}
										className="w-full px-3 py-2 rounded-lg border bg-background mt-2"
									/>
								</label>
								<p className="text-xs text-muted-foreground mt-1">
									Applied automatically when swapping tokens
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Transaction Deadline (minutes)
									<input
										type="number"
										step="1"
										min="1"
										max="60"
										value={settings.transactionDeadline}
										onChange={(e) =>
											handleChange("transactionDeadline", e.target.value)
										}
										className="w-full px-3 py-2 rounded-lg border bg-background mt-2"
									/>
								</label>
								<p className="text-xs text-muted-foreground mt-1">
									Transaction will revert if pending for longer than this
								</p>
							</div>

							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Auto-Routing</div>
									<div className="text-sm text-muted-foreground">
										Find best prices across multiple pools
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.autoRouting}
										onChange={(e) =>
											handleChange("autoRouting", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>
						</div>
					</Card>
				</BlurFade>

				{/* Display Preferences */}
				<BlurFade delay={0.3}>
					<Card className="p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
								<Eye className="h-5 w-5 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-semibold">Display Preferences</h2>
								<p className="text-sm text-muted-foreground">
									Customize your interface
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">
									Currency
									<select
										value={settings.currency}
										onChange={(e) => handleChange("currency", e.target.value)}
										className="w-full px-3 py-2 rounded-lg border bg-background mt-2"
									>
										<option value="USD">USD ($)</option>
										<option value="EUR">EUR (€)</option>
										<option value="GBP">GBP (£)</option>
									</select>
								</label>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Decimal Places
									<input
										type="number"
										step="1"
										min="2"
										max="8"
										value={settings.decimalPlaces}
										onChange={(e) =>
											handleChange(
												"decimalPlaces",
												parseInt(e.target.value, 10),
											)
										}
										className="w-full px-3 py-2 rounded-lg border bg-background mt-2"
									/>
								</label>
								<p className="text-xs text-muted-foreground mt-1">
									Number of decimal places to show for token amounts
								</p>
							</div>

							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Show Balances</div>
									<div className="text-sm text-muted-foreground">
										Display wallet balances in USD
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.showBalances}
										onChange={(e) =>
											handleChange("showBalances", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>

							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Compact Mode</div>
									<div className="text-sm text-muted-foreground">
										Reduce spacing for smaller screens
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.compactMode}
										onChange={(e) =>
											handleChange("compactMode", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>
						</div>
					</Card>
				</BlurFade>

				{/* Notification Preferences */}
				<BlurFade delay={0.4}>
					<Card className="p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
								<Bell className="h-5 w-5 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-semibold">Notifications</h2>
								<p className="text-sm text-muted-foreground">
									Choose what updates you receive
								</p>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Transaction Notifications</div>
									<div className="text-sm text-muted-foreground">
										Get notified when transactions complete
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.txNotifications}
										onChange={(e) =>
											handleChange("txNotifications", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>

							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Price Alerts</div>
									<div className="text-sm text-muted-foreground">
										Alert when tokens reach target prices
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.priceAlerts}
										onChange={(e) =>
											handleChange("priceAlerts", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>

							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Email Notifications</div>
									<div className="text-sm text-muted-foreground">
										Receive updates via email
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.emailNotifications}
										onChange={(e) =>
											handleChange("emailNotifications", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>
						</div>
					</Card>
				</BlurFade>

				{/* Privacy & Security */}
				<BlurFade delay={0.5}>
					<Card className="p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
								<Shield className="h-5 w-5 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-semibold">Privacy & Security</h2>
								<p className="text-sm text-muted-foreground">
									Control your data and privacy
								</p>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Analytics</div>
									<div className="text-sm text-muted-foreground">
										Help improve the app with usage data
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.analyticsEnabled}
										onChange={(e) =>
											handleChange("analyticsEnabled", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>

							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
								<div>
									<div className="font-medium">Public Profile</div>
									<div className="text-sm text-muted-foreground">
										Make your trading activity visible to others
									</div>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={settings.publicProfile}
										onChange={(e) =>
											handleChange("publicProfile", e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
								</label>
							</div>
						</div>
					</Card>
				</BlurFade>

				{/* Action Buttons */}
				<BlurFade delay={0.6}>
					<div className="flex items-center gap-4 justify-end">
						<Button variant="outline" onClick={handleReset} disabled={saving}>
							<RotateCcw className="h-4 w-4 mr-2" />
							Reset to Defaults
						</Button>
						<Button
							onClick={handleSave}
							disabled={!hasChanges || saving}
							className="bg-brand-gradient"
						>
							{saving ? (
								<>
									<div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
									Saving...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									{saved ? "Saved!" : "Save Changes"}
								</>
							)}
						</Button>
					</div>
				</BlurFade>
			</div>
		</div>
	);
}
