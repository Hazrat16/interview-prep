'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RevisionCard } from '@/lib/content/site-types';
import { loadCards } from '@/lib/client/data';
import { useFavorites, useRevisionState } from '@/lib/client/storage';
import { tagLabel } from '@/lib/labels';
import { Icon } from './Icons';
import { DifficultyBadge, OriginBadge, Badge } from './Badges';
import { FavoriteButton } from './FavoriteButton';

type Source = '' | 'points' | 'qa' | 'takeaways';
const SOURCE_LABELS: Record<Exclude<Source, ''>, string> = {
  points: 'Curated revision points',
  qa: 'My Q&A answers',
  takeaways: 'My key takeaways',
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RevisionDeck({ categoryLabels }: { categoryLabels: Record<string, string> }) {
  const [cards, setCards] = useState<RevisionCard[] | null>(null);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<Source>('');
  const [cat, setCat] = useState('');
  const [tag, setTag] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);
  const [hideKnown, setHideKnown] = useState(false);
  const [mode, setMode] = useState<'cards' | 'scan'>('cards');
  const [deck, setDeck] = useState<RevisionCard[]>([]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const { favs } = useFavorites();
  const [state, setState] = useRevisionState();
  const touch = useRef<{ x: number; y: number } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCards().then(setCards).catch(() => setError(true));
    const p = new URLSearchParams(window.location.search);
    setCat(p.get('cat') ?? '');
    setTag(p.get('tag') ?? '');
    if (p.get('saved')) setOnlySaved(true);
  }, []);

  const filtered = useMemo(
    () =>
      (cards ?? []).filter(
        (c) =>
          (!source || c.kind === source) &&
          (!cat || c.c === cat) &&
          (!tag || c.g.includes(tag)) &&
          (!onlySaved || favs.includes(c.id)) &&
          (!hideKnown || state[c.id]?.s !== 'known'),
      ),
    // state only matters for the "hide known" filter at deck-build time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards, source, cat, tag, onlySaved, hideKnown, favs],
  );

  // Rebuild the deck whenever filters change.
  useEffect(() => {
    setDeck(shuffled ? shuffle(filtered) : filtered);
    setPos(0);
    setRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const card = deck[pos];
  const done = deck.length > 0 && pos >= deck.length;
  const knownInDeck = deck.filter((c) => state[c.id]?.s === 'known').length;

  const mark = useCallback(
    (s: 'known' | 'again') => {
      if (!card) return;
      setState((prev) => ({ ...prev, [card.id]: { s, t: Date.now() } }));
      setRevealed(false);
      setPos((p) => p + 1);
      topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    [card, setState],
  );

  useEffect(() => {
    if (mode !== 'cards') return;
    const onKey = (e: KeyboardEvent) => {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      } else if (revealed && (e.key === 'ArrowRight' || e.key === 'g')) mark('known');
      else if (revealed && (e.key === 'ArrowLeft' || e.key === 'a')) mark('again');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, revealed, mark]);

  const tags = useMemo(() => {
    const m = new Map<string, number>();
    (cards ?? []).forEach((c) => c.g.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [cards]);
  const cats = useMemo(() => [...new Set((cards ?? []).map((c) => c.c))], [cards]);

  const select = 'h-10 shrink-0 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent';

  if (error) return <p className="text-hard">Could not load revision cards.</p>;
  if (!cards) return <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />;

  return (
    <div ref={topRef} className="scroll-mt-20">
      {/* Controls */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <div className="flex h-10 shrink-0 rounded-xl border border-line bg-surface p-0.5 text-sm">
          {(['cards', 'scan'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-[10px] px-3 ${mode === m ? 'bg-accent text-white' : 'text-muted'}`}
            >
              {m === 'cards' ? 'Flashcards' : 'Scan list'}
            </button>
          ))}
        </div>
        <select aria-label="Card source" className={select} value={source} onChange={(e) => setSource(e.target.value as Source)}>
          <option value="">All cards</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select aria-label="Category" className={select} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c} value={c}>{categoryLabels[c] ?? c}</option>
          ))}
        </select>
        <select aria-label="Technology" className={select} value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tech</option>
          {tags.map((t) => (
            <option key={t} value={t}>{tagLabel(t)}</option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={onlySaved} onChange={(e) => setOnlySaved(e.target.checked)} />
          Saved only
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={hideKnown} onChange={(e) => setHideKnown(e.target.checked)} />
          Hide cards I know
        </label>
        {mode === 'cards' && (
          <button
            type="button"
            className="flex items-center gap-1.5 text-accent"
            onClick={() => {
              setShuffled(true);
              setDeck(shuffle(filtered));
              setPos(0);
              setRevealed(false);
            }}
          >
            <Icon name="shuffle" size={16} /> Shuffle
          </button>
        )}
      </div>

      {deck.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
          No cards match. {onlySaved && 'Save questions with ♥ to build your own deck.'}
        </p>
      ) : mode === 'scan' ? (
        <ScanList deck={deck} categoryLabels={categoryLabels} />
      ) : done ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-2 text-xl font-semibold">Deck complete</h2>
          <p className="mt-1 text-muted">
            You know {knownInDeck} of {deck.length}. {deck.length - knownInDeck} to review again.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="h-11 rounded-xl bg-accent px-5 font-medium text-white"
              onClick={() => {
                setDeck(deck.filter((c) => state[c.id]?.s !== 'known'));
                setPos(0);
              }}
              disabled={deck.length === knownInDeck}
            >
              Review the {deck.length - knownInDeck} again
            </button>
            <button type="button" className="h-11 rounded-xl border border-line px-5" onClick={() => setPos(0)}>
              Restart all
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="mb-3 flex items-center gap-3 text-sm text-muted">
            <span className="tabular-nums">
              {pos + 1} / {deck.length}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(pos / deck.length) * 100}%` }} />
            </div>
            <span className="tabular-nums text-collected">{knownInDeck} known</span>
          </div>

          {/* Card */}
          <article
            className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm"
            onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
            onTouchEnd={(e) => {
              const t = touch.current;
              touch.current = null;
              if (!t || !revealed) return;
              const dx = e.changedTouches[0].clientX - t.x;
              const dy = e.changedTouches[0].clientY - t.y;
              if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) mark(dx > 0 ? 'known' : 'again');
            }}
          >
            <div className="flex items-start gap-2 p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <OriginBadge origin={card.o} />
                  <Badge>{categoryLabels[card.c] ?? card.c}</Badge>
                  {card.kind === 'takeaways' && <Badge tone="accent">Key takeaways</Badge>}
                  <DifficultyBadge difficulty={card.d} />
                  {state[card.id] && (
                    <Badge tone={state[card.id].s === 'known' ? 'accent' : 'warn'}>
                      {state[card.id].s === 'known' ? 'Known' : 'Reviewing'}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-balance sm:text-2xl" dangerouslySetInnerHTML={{ __html: card.q }} />
              </div>
              <FavoriteButton id={card.id} compact />
            </div>

            {revealed ? (
              <div className={`border-t px-5 py-4 sm:px-6 ${card.kind === 'qa' ? 'border-answer/20 bg-answer-soft/60' : 'border-revise/20 bg-revise-soft/60'}`}>
                <div className={`mb-2 text-[12px] font-semibold uppercase tracking-wider ${card.kind === 'qa' ? 'text-answer' : 'text-revise'}`}>
                  {card.kind === 'qa' ? 'Answer from my notes' : card.kind === 'points' ? 'Quick revision points' : 'Key takeaways'}
                </div>
                <div className="md prose max-w-none" dangerouslySetInnerHTML={{ __html: card.a }} />
                {card.id.includes('/') && (
                  <Link href={`/q/${card.id}/`} className="mt-3 inline-flex items-center gap-1 text-sm text-accent">
                    Open full question <Icon name="right" size={14} />
                  </Link>
                )}
              </div>
            ) : (
              <p className="px-5 pb-5 text-sm text-muted sm:px-6">Say your answer out loud, then reveal.</p>
            )}
          </article>

          {/* Actions: sticky above the mobile tab bar */}
          <div className="pb-safe sticky bottom-14 z-20 -mx-4 mt-4 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 lg:bottom-0">
            {!revealed ? (
              <button type="button" onClick={() => setRevealed(true)} className="h-12 w-full rounded-xl bg-accent text-base font-medium text-white">
                Show answer <span className="ml-1 hidden text-xs opacity-75 sm:inline">(Space)</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => mark('again')} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-hard/40 bg-hard/10 font-medium text-hard">
                  <Icon name="again" size={18} /> Again
                </button>
                <button type="button" onClick={() => mark('known')} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-collected font-medium text-white dark:text-black">
                  <Icon name="check" size={18} /> Got it
                </button>
              </div>
            )}
            <p className="mt-2 text-center text-xs text-muted">
              <span className="sm:hidden">After revealing, swipe → got it · ← again</span>
              <span className="hidden sm:inline">Space reveal · → got it · ← again</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ScanList({ deck, categoryLabels }: { deck: RevisionCard[]; categoryLabels: Record<string, string> }) {
  const [limit, setLimit] = useState(30);
  return (
    <div className="space-y-3">
      {deck.slice(0, limit).map((c) => (
        <details key={c.id} className="group rounded-2xl border border-line bg-surface open:shadow-sm">
          <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <Icon name="right" size={18} className="mt-0.5 shrink-0 text-muted transition-transform group-open:rotate-90" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium leading-snug" dangerouslySetInnerHTML={{ __html: c.q }} />
              <span className="mt-1 block text-xs text-muted">
                {c.o === 'curated' ? 'Curated' : 'My notes'} · {categoryLabels[c.c] ?? c.c}
              </span>
            </span>
          </summary>
          <div className="md prose prose-sm max-w-none border-t border-line px-4 py-3 sm:prose-base" dangerouslySetInnerHTML={{ __html: c.a }} />
        </details>
      ))}
      {deck.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + 60)} className="h-12 w-full rounded-2xl border border-line bg-surface text-sm font-medium">
          Show more ({deck.length - limit} left)
        </button>
      )}
    </div>
  );
}
