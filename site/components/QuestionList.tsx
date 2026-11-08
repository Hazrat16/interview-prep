'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { QuestionSummary } from '@/lib/content/site-types';
import { FREQUENCY_LABELS, PERSPECTIVE_LABELS, TYPE_LABELS, tagLabel } from '@/lib/labels';
import { DifficultyBadge, OriginBadge, Badge } from './Badges';
import { FavoriteButton } from './FavoriteButton';
import { Icon } from './Icons';

const PAGE = 50;

interface Filters {
  q: string;
  origin: '' | 'curated' | 'collected';
  cat: string;
  type: string;
  diff: string;
  tag: string;
  persp: string;
}
const EMPTY: Filters = { q: '', origin: '', cat: '', type: '', diff: '', tag: '', persp: '' };

export function QuestionList({
  items,
  categoryLabels,
  showOriginFilter = true,
  showCategoryFilter = true,
  showPerspective = false,
  syncUrl = true,
  emptyText = 'No questions match these filters.',
}: {
  items: QuestionSummary[];
  categoryLabels: Record<string, string>;
  showOriginFilter?: boolean;
  showCategoryFilter?: boolean;
  showPerspective?: boolean;
  syncUrl?: boolean;
  emptyText?: string;
}) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [collapse, setCollapse] = useState(true);
  const [limit, setLimit] = useState(PAGE);

  // Read ?q=&origin=&tag=… once, so filtered views are linkable.
  useEffect(() => {
    if (!syncUrl) return;
    const p = new URLSearchParams(window.location.search);
    const next = { ...EMPTY };
    (Object.keys(EMPTY) as (keyof Filters)[]).forEach((k) => {
      const v = p.get(k);
      if (v) (next as any)[k] = v;
    });
    setF(next);
  }, [syncUrl]);

  const update = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch };
    setF(next);
    setLimit(PAGE);
    if (syncUrl) {
      const p = new URLSearchParams();
      (Object.keys(next) as (keyof Filters)[]).forEach((k) => next[k] && p.set(k, next[k]));
      const qs = p.toString();
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    }
  };

  const options = useMemo(() => {
    const cats = new Set<string>(), types = new Set<string>(), tags = new Map<string, number>(), persp = new Set<string>();
    for (const i of items) {
      cats.add(i.c);
      types.add(i.y);
      if (i.p) persp.add(i.p);
      i.g.forEach((t) => tags.set(t, (tags.get(t) ?? 0) + 1));
    }
    return {
      cats: [...cats],
      types: [...types],
      persp: [...persp],
      tags: [...tags.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t),
      origins: new Set(items.map((i) => i.o)),
    };
  }, [items]);

  const filtered = useMemo(() => {
    const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    const out = items.filter(
      (i) =>
        (!f.origin || i.o === f.origin) &&
        (!f.cat || i.c === f.cat) &&
        (!f.type || i.y === f.type) &&
        (!f.diff || (f.diff === 'unrated' ? !i.d : i.d === f.diff)) &&
        (!f.tag || i.g.includes(f.tag)) &&
        (!f.persp || i.p === f.persp) &&
        (!terms.length ||
          terms.every((t) => `${i.t} ${i.g.join(' ')} ${i.s ?? ''}`.toLowerCase().includes(t))),
    );
    if (!collapse) return out;
    // Show each duplicate question once; the detail page lists every answer.
    const seen = new Set<string>();
    return out.filter((i) => {
      if (!i.u) return true;
      if (seen.has(i.u)) return false;
      seen.add(i.u);
      return true;
    });
  }, [items, f, collapse]);

  const active = (Object.keys(EMPTY) as (keyof Filters)[]).filter((k) => k !== 'q' && f[k]).length;
  const select = 'h-10 shrink-0 rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent';

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-line bg-bg/95 px-4 pb-3 pt-2 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-surface sm:p-3 lg:top-2">
        <label className="relative block">
          <span className="sr-only">Filter questions</span>
          <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder={`Filter ${items.length} questions…`}
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-base outline-none focus:border-accent sm:text-sm"
            enterKeyHint="search"
          />
        </label>
        <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {showOriginFilter && options.origins.size > 1 && (
            <select aria-label="Source" className={select} value={f.origin} onChange={(e) => update({ origin: e.target.value as Filters['origin'] })}>
              <option value="">All sources</option>
              <option value="curated">Curated FAQ</option>
              <option value="collected">My notes</option>
            </select>
          )}
          {showCategoryFilter && options.cats.length > 1 && (
            <select aria-label="Category" className={select} value={f.cat} onChange={(e) => update({ cat: e.target.value })}>
              <option value="">All categories</option>
              {options.cats.map((c) => (
                <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
              ))}
            </select>
          )}
          <select aria-label="Technology" className={select} value={f.tag} onChange={(e) => update({ tag: e.target.value })}>
            <option value="">All tech</option>
            {options.tags.map((t) => (
              <option key={t} value={t}>{tagLabel(t)}</option>
            ))}
          </select>
          {showPerspective && options.persp.length > 1 ? (
            <select aria-label="Perspective" className={select} value={f.persp} onChange={(e) => update({ persp: e.target.value })}>
              <option value="">All angles</option>
              {options.persp.map((p) => (
                <option key={p} value={p}>{PERSPECTIVE_LABELS[p as keyof typeof PERSPECTIVE_LABELS]}</option>
              ))}
            </select>
          ) : (
            options.types.length > 1 && (
              <select aria-label="Type" className={select} value={f.type} onChange={(e) => update({ type: e.target.value })}>
                <option value="">All types</option>
                {options.types.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t as keyof typeof TYPE_LABELS]}</option>
                ))}
              </select>
            )
          )}
          <select aria-label="Difficulty" className={select} value={f.diff} onChange={(e) => update({ diff: e.target.value })}>
            <option value="">Any level</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="unrated">Unrated</option>
          </select>
          {active > 0 && (
            <button type="button" className="h-10 shrink-0 rounded-xl px-3 text-sm text-accent" onClick={() => update({ ...EMPTY, q: f.q })}>
              Clear {active}
            </button>
          )}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-muted">
        <span>{filtered.length} questions</span>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={collapse} onChange={(e) => setCollapse(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          Merge duplicates
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">{emptyText}</p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
          {filtered.slice(0, limit).map((i) => (
            <li key={i.id} className="border-b border-line last:border-b-0">
              <Link href={`/q/${i.id}/`} className="flex items-start gap-2 px-4 py-3 hover:bg-surface-2 active:bg-surface-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] leading-snug">{i.t}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <OriginBadge origin={i.o} />
                    <Badge>{categoryLabels[i.c] ?? i.c}</Badge>
                    <Badge>{i.p ? PERSPECTIVE_LABELS[i.p] : TYPE_LABELS[i.y]}</Badge>
                    <DifficultyBadge difficulty={i.d} />
                    {i.f === 'very-high' && <Badge tone="accent">{FREQUENCY_LABELS[i.f]}</Badge>}
                    {!i.a && <Badge tone="warn">No answer yet</Badge>}
                    {collapse && i.n > 1 && <Badge tone="accent">{i.n} answers</Badge>}
                  </div>
                </div>
                <FavoriteButton id={i.id} compact />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE * 2)}
          className="mt-4 h-12 w-full rounded-2xl border border-line bg-surface text-sm font-medium hover:border-accent"
        >
          Show more ({filtered.length - limit} left)
        </button>
      )}
    </div>
  );
}
