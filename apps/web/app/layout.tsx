import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SuiProvider } from '@/providers/sui-provider';
import { EnhancedWalletButton } from '@/components/enhanced-wallet-button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TortoiseSwap - DEX on Sui',
  description: 'Decentralized exchange built on Sui blockchain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SuiProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
              <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🐢</div>
                  <h1 className="text-lg font-semibold">TortoiseSwap</h1>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                  <a href="/" className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-muted transition-colors">
                    Swap
                  </a>
                  <a href="/pools" className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-xl hover:bg-muted transition-colors">
                    Pools
                  </a>
                </nav>

                <EnhancedWalletButton />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container px-4 py-8 max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </SuiProvider>
      </body>
    </html>
  );
}
