import type { Metadata, Viewport } from 'next';
import { Fraunces, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar, MobileTopBar, BottomTabs } from '@/components/Nav';
import { SearchDialog } from '@/components/SearchDialog';
import { themeScript } from '@/components/ThemeToggle';
import { topics } from '@/lib/data';

const body = Instrument_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', axes: ['opsz', 'SOFT'], style: ['normal', 'italic'] });
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
    { media: '(prefers-color-scheme: light)', color: '#f1ece1' },
    { media: '(prefers-color-scheme: dark)', color: '#15140f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = topics().map((t) => ({ slug: t.slug, label: t.label, icon: t.icon, guides: t.guides.map((g) => ({ slug: g.slug, title: g.title })) }));
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable} ${mono.variable}`}>
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
