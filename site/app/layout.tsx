import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar, MobileTopBar, BottomTabs } from '@/components/Nav';
import { SearchDialog } from '@/components/SearchDialog';
import { themeScript } from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Interview Prep', template: '%s · Interview Prep' },
  description: 'Interview questions from my own notes plus a curated FAQ: React, Next.js, Node.js, databases, system design and DevOps.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1d' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <div className="flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <MobileTopBar />
            <main className="mx-auto w-full max-w-4xl px-4 pb-40 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">{children}</main>
          </div>
        </div>
        <BottomTabs />
        <SearchDialog />
      </body>
    </html>
  );
}
