'use client';

import { EnhancedSwapInterface } from '@/components/swap/enhanced-swap-interface';
import { BlurFade, DotPattern } from '@carapace/ui';

export default function SwapPage() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-8">
      <DotPattern className="opacity-10" />
      <BlurFade delay={0.1}>
        <EnhancedSwapInterface />
      </BlurFade>
    </div>
  );
}
