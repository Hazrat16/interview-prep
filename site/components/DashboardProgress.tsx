'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { QuestionSummary } from '@/lib/content/site-types';
import { loadSummaries } from '@/lib/client/data';
import { useFavorites, useRecent, useRevisionState } from '@/lib/client/storage';
import { Icon } from './Icons';

export function DashboardProgress({ totalCards }: { totalCards: number }) {
  const { favs } = useFavorites();
  const [rev] = useRevisionState();
  const [recent] = useRecent();
  const [all, setAll] = useState<Map<string, QuestionSummary> | null>(null);
  useEffect(() => {
    if (recent.length) loadSummaries().then((s) => setAll(new Map(s.map((x) => [x.id, x]))));
  }, [recent.length]);

  const known = Object.values(rev).filter((r) => r.s === 'known').length;
  const again = Object.values(rev).filter((r) => r.s === 'again').length;
  const pct = totalCards ? Math.round((known / totalCards) * 100) : 0;
  const recentItems = (all ? recent.map((id) => all.get(id)).filter(Boolean) : []) as QuestionSummary[];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Revision progress</span>
          <span className="text-sm font-medium tabular-nums">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-collected" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <span><b className="tabular-nums">{known}</b> <span className="text-muted">known</span></span>
          <span><b className="tabular-nums">{again}</b> <span className="text-muted">to review</span></span>
          <span><b className="tabular-nums">{favs.length}</b> <span className="text-muted">saved</span></span>
        </div>
        <Link href="/revision/" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
          Continue revising <Icon name="right" size={14} />
        </Link>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4">
        <span className="text-sm text-muted">Recently viewed</span>
        {recentItems.length ? (
          <ul className="mt-2 space-y-1.5">
            {recentItems.slice(0, 4).map((r) => (
              <li key={r.id}>
                <Link href={`/q/${r.id}/`} className="line-clamp-1 text-sm hover:text-accent">{r.t}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Questions you open will appear here.</p>
        )}
      </div>
    </div>
  );
}

export function TrackView({ id }: { id: string }) {
  const [, setRecent] = useRecent();
  useEffect(() => {
    setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 20));
  }, [id, setRecent]);
  return null;
}
