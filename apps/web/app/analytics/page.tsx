"use client"

import { BlurFade, DotPattern } from "@carapace/carapace-ui"
import { PoolAnalyticsTable } from "@/components/analytics/pool-analytics-table"
import { ProtocolStats } from "@/components/analytics/protocol-stats"
import { RecentTransactionsWidget } from "@/components/transactions/recent-transactions-widget"

export default function AnalyticsPage() {
  return (
    <div className="relative min-h-screen py-8 px-4">
      <DotPattern className="opacity-10" />
      <div className="max-w-7xl mx-auto space-y-8">
        <BlurFade delay={0.1}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Protocol-wide statistics and pool performance metrics
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <ProtocolStats />
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BlurFade delay={0.3}>
              <PoolAnalyticsTable />
            </BlurFade>
          </div>

          <div className="lg:col-span-1">
            <BlurFade delay={0.4}>
              <RecentTransactionsWidget />
            </BlurFade>
          </div>
        </div>
      </div>
    </div>
  )
}
