'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon, type IconName } from './Icons';
import { SearchButton } from './SearchDialog';
import { ThemeToggle } from './ThemeToggle';
import { useSrs } from '@/lib/client/srs';
import { useHydrated } from '@/lib/client/storage';

export type NavTopic = { slug: string; label: string; icon: string; guides: { slug: string; title: string }[] };

const PRACTICE: { href: string; label: string; icon: IconName }[] = [
  { href: '/quiz/', label: 'Quiz', icon: 'cards' },
  { href: '/interview/', label: 'Interview Simulator', icon: 'timer' },
  { href: '/last-minute/', label: 'Last-Minute Cards', icon: 'bolt' },
  { href: '/review/', label: 'Review', icon: 'again' },
];
const LIBRARY: { href: string; label: string; icon: IconName }[] = [
  { href: '/cheatsheets/', label: 'Cheat Sheets', icon: 'sheet' },
  { href: '/bookmarks/', label: 'Bookmarks', icon: 'bookmark' },
];
const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/topics/', label: 'Topics', icon: 'book' },
  { href: '/quiz/', label: 'Practice', icon: 'cards' },
  { href: '/review/', label: 'Review', icon: 'again' },
  { href: '/bookmarks/', label: 'Saved', icon: 'bookmark' },
];

function usePath() {
  const p = usePathname() || '/';
  return p.endsWith('/') ? p : p + '/';
}

function DueBadge() {
  const { due } = useSrs();
  const ready = useHydrated();
  if (!ready || !due.length) return null;
  return <span className="anim-pop ml-auto rounded-full bg-follow px-1.5 text-[11px] font-semibold leading-5 text-white tabular-nums dark:text-black">{due.length}</span>;
}

function NavLink({ href, label, icon, active, onClick }: { href: string; label: string; icon: IconName; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex h-9 items-center gap-3 rounded-xl px-3 text-sm ${active ? 'bg-ink font-medium text-bg' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
    >
      <Icon name={icon} size={17} />
      <span className="truncate">{label}</span>
      {href === '/review/' && <DueBadge />}
    </Link>
  );
}

function NavContent({ topics, onNavigate }: { topics: NavTopic[]; onNavigate?: () => void }) {
  const path = usePath();
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const current = path.split('/')[1];
  useEffect(() => setOpenTopic(topics.some((t) => t.slug === current) ? current : null), [current, topics]);
  const heading = 'eyebrow mb-1.5 mt-6 px-3 text-muted';
  return (
    <>
      <NavLink href="/" label="Home" icon="home" active={path === '/'} onClick={onNavigate} />
      <div className={heading}>Practice</div>
      {PRACTICE.map((n) => (
        <NavLink key={n.href} {...n} active={path.startsWith(n.href)} onClick={onNavigate} />
      ))}
      <div className={heading}>Library</div>
      {LIBRARY.map((n) => (
        <NavLink key={n.href} {...n} active={path.startsWith(n.href)} onClick={onNavigate} />
      ))}
      <div className={heading}>Topics</div>
      {topics.map((t) => {
        const open = openTopic === t.slug;
        return (
          <div key={t.slug}>
            <div className="flex items-center">
              <Link
                href={`/${t.slug}/`}
                onClick={onNavigate}
                className={`flex h-9 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-sm ${
                  path === `/${t.slug}/` ? 'bg-ink font-medium text-bg' : current === t.slug ? 'font-medium text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <Icon name={t.icon as IconName} size={17} />
                <span className="truncate">{t.label}</span>
              </Link>
              <button
                type="button"
                aria-label={open ? `Collapse ${t.label}` : `Expand ${t.label}`}
                aria-expanded={open}
                onClick={() => setOpenTopic(open ? null : t.slug)}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2"
              >
                <Icon name="down" size={15} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {open && (
              <div className="anim-drop mb-1 ml-[1.35rem] border-l border-line pl-2">
                {t.guides.map((g) => {
                  const href = `/${t.slug}/${g.slug}/`;
                  return (
                    <Link
                      key={g.slug}
                      href={href}
                      onClick={onNavigate}
                      className={`block truncate rounded-lg px-2.5 py-1.5 text-[13px] ${path === href ? 'bg-marker/70 font-medium text-ink dark:bg-marker/25' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
                    >
                      {g.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function Sidebar({ topics }: { topics: NavTopic[] }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/80 backdrop-blur lg:flex">
      <div className="px-3 pt-4">
        <Link href="/" className="mb-5 flex items-center gap-2.5 px-2 font-display text-[19px] font-semibold tracking-tight">
          <Wordmark />
        </Link>
        <SearchButton className="mb-2 flex h-10 w-full items-center gap-2 rounded-xl border border-line bg-bg px-3 text-sm text-muted hover:border-accent" />
      </div>
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        <NavContent topics={topics} />
      </nav>
      <div className="flex items-center justify-between border-t border-line px-4 py-2">
        <span className="eyebrow text-[10px] text-muted">Free · no account</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

/** The mark: a vermilion index card on a printed shadow, with a Q that doubles as a magnifier. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="shrink-0">
      <rect x="8.5" y="8.5" width="53" height="53" rx="8" fill="var(--shadow)" />
      <rect x="2.5" y="2.5" width="53" height="53" rx="8" fill="var(--accent)" stroke="var(--border)" strokeWidth="3" />
      <circle cx="27.5" cy="27.5" r="12.5" fill="none" stroke="var(--surface)" strokeWidth="6.5" />
      <path d="M34 34 44.5 44.5" stroke="var(--surface)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/** Logo + serif wordmark: "Interview" upright, "Prep" in accent italic. */
export function Wordmark() {
  return (
    <>
      <Logo />
      <span className="truncate">
        Interview <em className="font-normal italic text-accent">Prep</em>
      </span>
    </>
  );
}

export function MobileTopBar({ topics }: { topics: NavTopic[] }) {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMenu(false), [pathname]);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-line bg-surface/90 px-2 backdrop-blur lg:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setMenu(true)} className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2">
          <Icon name="menu" />
        </button>
        <Link href="/" className="flex flex-1 items-center gap-2 truncate font-display text-[17px] font-semibold tracking-tight">
          <Wordmark />
        </Link>
        <SearchButton label={false} className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2" />
        <ThemeToggle />
      </header>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="anim-fade absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
          <nav className="anim-drawer absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-line bg-surface p-3 shadow-[6px_0_0_var(--shadow)]">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="eyebrow text-muted">Menu</span>
              <button type="button" aria-label="Close menu" onClick={() => setMenu(false)} className="grid size-10 place-items-center rounded-full hover:bg-surface-2">
                <Icon name="x" />
              </button>
            </div>
            <NavContent topics={topics} onNavigate={() => setMenu(false)} />
          </nav>
        </div>
      )}
    </>
  );
}

export function BottomTabs() {
  const path = usePath();
  const practice = ['/quiz/', '/interview/', '/last-minute/'];
  const isActive = (href: string) =>
    href === '/' ? path === '/' : href === '/quiz/' ? practice.some((p) => path.startsWith(p)) : href === '/topics/' ? path.startsWith('/topics/') : path.startsWith(href);
  return (
    <nav aria-label="Quick navigation" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((n) => {
          const active = isActive(n.href);
          return (
            <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] ${active ? 'font-semibold text-ink' : 'text-muted'}`}>
              <span className={`relative grid h-7 w-14 place-items-center rounded-full transition-all duration-300 ${active ? 'scale-100 bg-ink text-bg' : 'scale-90'}`}>
                <Icon name={n.icon} size={20} filled={active && n.icon === 'bookmark'} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
