"use client"

import { BlurFade, DotPattern } from "@carapace/carapace-ui"
import { CreatePoolWizard } from "@/components/pool-creation/create-pool-wizard"

export default function CreatePoolPage() {
  return (
    <div className="relative min-h-screen py-8 px-4">
      <DotPattern className="opacity-10" />
      <div className="max-w-4xl mx-auto space-y-8">
        <BlurFade delay={0.1}>
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Create Liquidity Pool</h1>
            <p className="text-muted-foreground">
              Set up a new liquidity pool and start earning fees
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <CreatePoolWizard />
        </BlurFade>

        {/* Info Section */}
        <BlurFade delay={0.3}>
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <div className="text-center p-6">
              <div className="text-3xl mb-2">💧</div>
              <h3 className="font-semibold mb-1">Provide Liquidity</h3>
              <p className="text-sm text-muted-foreground">Deposit token pairs to enable trading</p>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">Earn Fees</h3>
              <p className="text-sm text-muted-foreground">
                Collect fees from every swap in your pool
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold mb-1">Track Performance</h3>
              <p className="text-sm text-muted-foreground">Monitor your pool's TVL and APR</p>
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  )
}
