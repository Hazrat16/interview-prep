'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon, type IconName } from './Icons';
import { SearchButton } from './SearchDialog';
import { ThemeToggle } from './ThemeToggle';

export const NAV: { href: string; label: string; short: string; icon: IconName }[] = [
  { href: '/', label: 'Dashboard', short: 'Home', icon: 'home' },
  { href: '/questions/', label: 'All Questions', short: 'Questions', icon: 'list' },
  { href: '/collected/', label: 'My Collected', short: 'My notes', icon: 'notes' },
  { href: '/faq/', label: 'Frequently Asked', short: 'FAQ', icon: 'faq' },
  { href: '/career/', label: 'Career Prep', short: 'Career', icon: 'briefcase' },
  { href: '/categories/', label: 'Categories', short: 'Topics', icon: 'grid' },
  { href: '/favorites/', label: 'Favorites', short: 'Saved', icon: 'heart' },
  { href: '/revision/', label: 'Quick Revision', short: 'Revise', icon: 'bolt' },
];

const MOBILE_TABS = ['/', '/questions/', '/career/', '/revision/', '/favorites/'];

function useActive() {
  const pathname = usePathname() || '/';
  const norm = pathname.endsWith('/') ? pathname : pathname + '/';
  return (href: string) => {
    if (href === '/') return norm === '/';
    if (href === '/questions/') return norm.startsWith('/questions/') || (norm.startsWith('/q/') && !norm.startsWith('/q/faq/career-') && !norm.startsWith('/q/faq/behavioral-'));
    if (href === '/career/') return norm.startsWith('/career/') || norm.startsWith('/q/faq/career-') || norm.startsWith('/q/faq/behavioral-');
    if (href === '/collected/') return norm.startsWith('/collected/') || norm.startsWith('/source/');
    if (href === '/categories/') return norm.startsWith('/categories/') || norm.startsWith('/tags/');
    return norm.startsWith(href);
  };
}

export function Sidebar() {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2 text-[15px] font-semibold tracking-tight">
        <span className="grid size-7 place-items-center rounded-lg bg-accent text-sm text-white">IP</span>
        Interview Prep
      </Link>
      <SearchButton className="mb-4 flex h-10 w-full items-center gap-2 rounded-xl border border-line bg-bg px-3 text-sm text-muted hover:border-accent" />
      <nav className="flex flex-col gap-0.5" aria-label="Main">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive(n.href) ? 'page' : undefined}
            className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm ${
              isActive(n.href) ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <Icon name={n.icon} size={18} />
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex items-center justify-between px-1">
        <span className="text-xs text-muted">Static · no tracking</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function MobileTopBar() {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const isActive = useActive();
  useEffect(() => setMenu(false), [pathname]);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-line bg-surface/90 px-2 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenu(true)}
          className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2"
        >
          <Icon name="menu" />
        </button>
        <Link href="/" className="flex-1 truncate text-[15px] font-semibold tracking-tight">
          Interview Prep
        </Link>
        <SearchButton label={false} className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2" />
        <ThemeToggle />
      </header>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
          <nav className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-0.5 bg-surface p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="font-semibold">Menu</span>
              <button type="button" aria-label="Close menu" onClick={() => setMenu(false)} className="grid size-10 place-items-center rounded-full hover:bg-surface-2">
                <Icon name="x" />
              </button>
            </div>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex h-12 items-center gap-3 rounded-xl px-3 ${
                  isActive(n.href) ? 'bg-accent-soft font-medium text-accent' : 'text-ink hover:bg-surface-2'
                }`}
              >
                <Icon name={n.icon} />
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

export function BottomTabs() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Quick navigation"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {NAV.filter((n) => MOBILE_TABS.includes(n.href)).map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive(n.href) ? 'page' : undefined}
            className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] ${
              isActive(n.href) ? 'font-semibold text-accent' : 'text-muted'
            }`}
          >
            <span className={`grid h-7 w-14 place-items-center rounded-full transition-colors ${isActive(n.href) ? 'bg-accent-soft' : ''}`}>
              <Icon name={n.icon} size={20} filled={isActive(n.href) && n.icon === 'heart'} strokeWidth={isActive(n.href) ? 2.2 : 1.8} />
            </span>
            {n.short}
          </Link>
        ))}
      </div>
    </nav>
  );
}
