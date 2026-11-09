import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar, MobileTopBar, BottomTabs } from '@/components/Nav';
import { SearchDialog } from '@/components/SearchDialog';
import { themeScript } from '@/components/ThemeToggle';
import { topics } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Interview Prep', template: '%s · Interview Prep' },
  description: 'Full-stack interview prep: topic guides with interview-ready answers, quizzes, a timed interview simulator, spaced-repetition review and cheat sheets.',
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
  const nav = topics().map((t) => ({ slug: t.slug, label: t.label, icon: t.icon, guides: t.guides.map((g) => ({ slug: g.slug, title: g.title })) }));
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <div className="flex">
          <Sidebar topics={nav} />
          <div className="min-w-0 flex-1">
            <MobileTopBar topics={nav} />
            <main className="mx-auto w-full max-w-5xl px-4 pb-40 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">{children}</main>
          </div>
        </div>
        <BottomTabs />
        <SearchDialog />
      </body>
    </html>
  );
}
