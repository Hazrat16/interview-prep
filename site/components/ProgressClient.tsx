'use client';
import Link from 'next/link';
import { useHydrated, useKnown, useCheckpoints } from '@/lib/client/storage';
import { useSrs } from '@/lib/client/srs';
import type { Catalog } from '@/lib/data';
import { Icon } from './Icons';

const knownIn = (known: Record<string, number>, prefix: string) => Object.keys(known).filter((k) => k.startsWith(prefix + '/')).length;

export function GuideCardProgress({ guideKey, count }: { guideKey: string; count: number }) {
  const { known } = useKnown();
  const ready = useHydrated();
  if (!ready) return null;
  const n = knownIn(known, guideKey);
  if (!n) return null;
  return (
    <span className={`ml-auto inline-flex items-center gap-1 font-medium ${n >= count ? 'text-easy' : 'text-ink'}`}>
      {n >= count && <Icon name="check" size={13} strokeWidth={3} />}
      {n}/{count}
    </span>
  );
}

export function TopicProgress({ prefix, total }: { prefix: string; total: number }) {
  const { known } = useKnown();
  const ready = useHydrated();
  const n = ready ? knownIn(known, prefix) : 0;
  const pct = Math.round((n / (total || 1)) * 100);
  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-easy transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums">{pct}%</span>
    </div>
  );
}

/** Home dashboard: overall progress, review due, continue reading. */
export function HomeProgress({ catalog }: { catalog: Catalog }) {
  const { known } = useKnown();
  const { srs, due } = useSrs();
  const [checkpoints] = useCheckpoints();
  const ready = useHydrated();
  const total = catalog.guides.reduce((n, g) => n + g.count, 0);
  const totalMin = catalog.guides.reduce((n, g) => n + g.minutes, 0);
  const knownN = ready ? Object.keys(known).length : 0;
  const finished = ready ? catalog.guides.filter((g) => knownIn(known, g.key) >= g.count).length : 0;
  const leftMin = ready
    ? catalog.guides.reduce((n, g) => n + g.minutes * (1 - Math.min(1, knownIn(known, g.key) / (g.count || 1))), 0)
    : totalMin;
  const recent = ready
    ? Object.entries(checkpoints)
        .filter(([k]) => catalog.guides.some((g) => g.key === k))
        .sort((a, b) => b[1].t - a[1].t)
        .slice(0, 3)
    : [];
  const guideTitle = (k: string) => catalog.guides.find((g) => g.key === k)?.title ?? k;
  const stats = [
    { label: 'Questions known', value: `${knownN}`, sub: `of ${total}` },
    { label: 'Guides finished', value: `${finished}`, sub: `of ${catalog.guides.length}` },
    { label: 'Due for review', value: `${ready ? due.length : 0}`, sub: `${ready ? Object.keys(srs).length : 0} in queue`, href: '/review/' },
    { label: 'Reading left', value: leftMin < 60 ? `${Math.round(leftMin)} min` : `${Math.round(leftMin / 6) / 10} h`, sub: 'at your pace' },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <>
              <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
              <div className="text-sm text-ink">{s.label}</div>
              <div className="text-xs text-muted">{s.sub}</div>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-surface p-4 hover:border-accent">{inner}</Link>
          ) : (
            <div key={s.label} className="rounded-2xl border border-line bg-surface p-4">{inner}</div>
          );
        })}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2" aria-label={`${Math.round((knownN / total) * 100)}% known`}>
        <div className="h-full rounded-full bg-easy transition-all" style={{ width: `${(knownN / (total || 1)) * 100}%` }} />
      </div>
      {recent.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted">Continue where you left off</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {recent.map(([k, c]) => (
              <Link key={k} href={`/${k}/#${c.q}`} className="group flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:border-accent">
                <Icon name="flag" size={18} className="shrink-0 text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{guideTitle(k)}</span>
                  <span className="block truncate text-xs text-muted">{c.title}</span>
                </span>
                <Icon name="right" size={16} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Random guide button. */
export function RandomGuide({ keys, className = '' }: { keys: string[]; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const k = keys[Math.floor(Math.random() * keys.length)];
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/${k}/`;
      }}
    >
      <Icon name="dice" size={18} />
      Open a random guide
    </button>
  );
}
