import {
	BlurFade,
	DotPattern,
	RetroGrid,
	TextAnimate,
} from "@carapace/carapace-ui";
import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="relative">
			{/* Hero Section */}
			<section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
				<RetroGrid className="opacity-30" />
				<DotPattern className="opacity-20" glow />

				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<BlurFade delay={0.2}>
						<button
							type="button"
							className="group mb-4 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/30 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
						>
							<span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
								Powered by AI & Sui Blockchain
							</span>
						</button>
					</BlurFade>

					<TextAnimate
						animation="blurInUp"
						by="word"
						delay={0.3}
						className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-brand-gradient"
					>
						Trade Smarter with TortoiseSwap
					</TextAnimate>

					<BlurFade delay={0.6}>
						<p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium">
							Experience the future of DeFi with AI-powered adaptive fees and
							intelligent yield optimization on Sui
						</p>
					</BlurFade>

					<BlurFade delay={0.8}>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link href="/swap">
								<button
									type="button"
									className="bg-brand-gradient text-white text-lg px-10 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
								>
									Start Trading
									<ArrowRight className="h-5 w-5" />
								</button>
							</Link>
							<Link href="/pools">
								<button
									type="button"
									className="text-lg px-10 py-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent/5 transition-all duration-200 font-semibold"
								>
									Explore Pools
								</button>
							</Link>
						</div>
					</BlurFade>
				</div>
			</section>

			{/* Features Section */}
			<section className="relative py-24 bg-secondary/30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<BlurFade delay={0.2}>
						<h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
							Why Choose TortoiseSwap?
						</h2>
						<p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto font-medium">
							Built for traders who demand the best in speed, security, and
							intelligence
						</p>
					</BlurFade>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								icon: Zap,
								title: "AI-Powered Optimization",
								description:
									"Dynamic fee adjustment based on market conditions for optimal trading costs",
								delay: 0.3,
								gradient: "bg-accent-gradient-blue", // Electric, fast, intelligent - BLUE
								cardGradient: "from-accent-blue/25 to-accent-indigo/20", // Bright blue background
							},
							{
								icon: Shield,
								title: "Secure & Trustless",
								description:
									"Built on Sui with proven Move smart contracts and rigorous security audits",
								delay: 0.4,
								gradient: "bg-accent-gradient-purple", // Strong, stable, trustworthy - PURPLE
								cardGradient: "from-accent-purple/25 to-accent-violet/20", // Purple background
							},
							{
								icon: TrendingUp,
								title: "Auto-Compounding Vaults",
								description:
									"Maximize yields with AI-driven strategies in secure TEE environments",
								delay: 0.5,
								gradient: "bg-accent-gradient-emerald", // Growth, prosperity, yields - GREEN
								cardGradient: "from-accent-emerald/25 to-brand-seafoam/20", // Emerald green background
							},
						].map((feature, _i) => (
							<BlurFade key={feature.title} delay={feature.delay}>
								<button
									type="button"
									className={`card card-hover p-8 h-full group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-left w-full shadow-md hover:shadow-xl bg-gradient-to-br ${feature.cardGradient} hover:from-primary/10 hover:to-accent/10`}
								>
									<div
										className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}
									>
										<feature.icon className="w-7 h-7 text-white" />
									</div>
									<h3 className="text-2xl font-bold mb-4 tracking-tight text-foreground group-hover:text-primary transition-colors">
										{feature.title}
									</h3>
									<p className="text-muted-foreground leading-relaxed font-medium">
										{feature.description}
									</p>
								</button>
							</BlurFade>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="relative py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{[
							{
								value: "$0M+",
								label: "Total Value Locked",
								gradient: "from-accent-orange/25 to-accent-amber/20",
							}, // Money/value - ORANGE
							{
								value: "0+",
								label: "Active Pools",
								gradient: "from-accent-blue/25 to-accent-indigo/20",
							}, // Activity/water - BLUE
							{
								value: "0K+",
								label: "Transactions",
								gradient: "from-accent-purple/25 to-accent-violet/20",
							}, // Technology - PURPLE
							{
								value: "0.25%",
								label: "Trading Fee",
								gradient: "from-brand-teal/25 to-brand-cyan/20",
							}, // Primary feature - TEAL
						].map((stat, i) => (
							<BlurFade key={stat.label} delay={0.2 + i * 0.1}>
								<button
									type="button"
									className={`text-center p-6 rounded-lg bg-gradient-to-br ${stat.gradient} hover:from-primary/10 hover:to-accent/10 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm hover:shadow-lg w-full group`}
								>
									<div className="text-5xl md:text-6xl font-bold text-brand-gradient mb-3 group-hover:scale-110 transition-transform duration-200">
										{stat.value}
									</div>
									<div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider group-hover:text-foreground transition-colors">
										{stat.label}
									</div>
								</button>
							</BlurFade>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative py-24 bg-secondary/30">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<BlurFade delay={0.2}>
						<h2 className="text-4xl md:text-5xl font-bold mb-6">
							Ready to Start Trading?
						</h2>
						<p className="text-xl text-muted-foreground mb-10 font-medium">
							Join thousands of traders experiencing the future of DeFi
						</p>
						<Link href="/swap">
							<button
								type="button"
								className="bg-brand-gradient text-white text-lg px-12 py-5 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
							>
								Launch App
								<ArrowRight className="h-5 w-5" />
							</button>
						</Link>
					</BlurFade>
				</div>
			</section>
		</div>
	);
}
