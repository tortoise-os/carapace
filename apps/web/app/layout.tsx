import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { SuiProvider } from '@/providers/sui-provider';
import { ThemeProvider, ThemeToggle } from '@carapace/ui';
import { EnhancedWalletButton } from '@/components/enhanced-wallet-button';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TortoiseSwap - AI-Powered DEX on Sui',
  description: 'Experience the future of DeFi with AI-powered adaptive fees and intelligent yield optimization on Sui blockchain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SuiProvider>
            <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="glass sticky top-0 z-50 w-full border-b">
              <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="text-2xl transition-transform group-hover:scale-110">🐢</div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">
                      TortoiseSwap
                    </h1>
                    <p className="text-[10px] text-brand-gradient font-semibold leading-none">AI-Powered DEX</p>
                  </div>
                </Link>

                <nav className="hidden md:flex items-center gap-2">
                  <Link
                    href="/swap"
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent/10 hover:text-accent transition-all"
                  >
                    Swap
                  </Link>
                  <Link
                    href="/pools"
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent/10 hover:text-accent transition-all"
                  >
                    Pools
                  </Link>
                  <a
                    href="https://github.com/yourusername/tortoise-os"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent/10 hover:text-accent transition-all"
                  >
                    Docs
                  </a>
                </nav>

                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <EnhancedWalletButton />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30 py-8 mt-auto">
              <div className="container max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-3xl">🐢</div>
                      <h2 className="text-xl font-bold">TortoiseSwap</h2>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md">
                      AI-powered DEX on Sui blockchain. Trade smarter with adaptive fees and intelligent yield optimization.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Product</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><Link href="/swap" className="hover:text-primary transition-colors">Swap</Link></li>
                      <li><Link href="/pools" className="hover:text-primary transition-colors">Pools</Link></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Vaults</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Analytics</a></li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Community</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Docs</a></li>
                    </ul>
                  </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                  <p>© 2025 TortoiseSwap. Built on Sui. Powered by AI.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" richColors />
        </SuiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
