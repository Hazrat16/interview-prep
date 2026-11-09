'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Catalog } from '@/lib/data';
import { Icon } from '../Icons';
import { btnGhost, btnPrimary, Done, FlipCard, Loading, ProgressBar, useCards, useFlipKey, useGuideTitles } from './Shared';

const SECONDS_PER_CARD = 25;

/** Fast flip-through of the must-know questions; the back shows only the memory hooks. */
export function LastMinute({ catalog }: { catalog: Catalog }) {
  const { cards, error } = useCards();
  const title = useGuideTitles(catalog);
  const [set, setSet] = useState<'core' | 'all'>('core');
  const [topic, setTopic] = useState('');
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const deck = useMemo(
    () => (cards ?? []).filter((c) => (set === 'all' || c.f === 'very-high') && (topic ? c.g.startsWith(topic + '/') : !c.g.startsWith('career/'))),
    [cards, set, topic],
  );
  useEffect(() => {
    setPos(0);
    setFlipped(false);
  }, [deck]);

  const card = deck[pos];
  const flip = useCallback(() => setFlipped((f) => !f), []);
  const go = useCallback(
    (d: number) => {
      setFlipped(false);
      setPos((p) => Math.max(0, Math.min(deck.length, p + d)));
    },
    [deck.length],
  );
  useFlipKey(flip, !!card);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  if (error) return <p className="text-hard">Could not load questions.</p>;
  if (!cards) return <Loading />;

  const mins = Math.max(1, Math.round((deck.length * SECONDS_PER_CARD) / 60));
  const coreCount = cards.filter((c) => c.f === 'very-high' && (topic ? c.g.startsWith(topic + '/') : !c.g.startsWith('career/'))).length;

  return (
    <div ref={top} className="scroll-mt-20">
      <div className="no-scrollbar -mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <div className="flex h-10 shrink-0 rounded-xl border border-line bg-surface p-0.5 text-sm">
          {(['core', 'all'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSet(s)} className={`rounded-[10px] px-3 font-medium ${set === s ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}>
              {s === 'core' ? `Core set (${coreCount})` : 'Everything'}
            </button>
          ))}
        </div>
        <select aria-label="Topic" className="h-10 shrink-0 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All technical topics</option>
          {catalog.topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.label}
            </option>
          ))}
        </select>
        <span className="shrink-0 text-sm text-muted">
          <Icon name="clock" size={14} className="mr-1 inline align-[-2px]" />~{mins} min
        </span>
      </div>

      {!deck.length ? (
        <Done icon="check" title="No cards here">
          Try another topic.
        </Done>
      ) : !card ? (
        <Done title="That's every card">
          <p>Good luck in there.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" className={btnPrimary} onClick={() => setPos(0)}>
              Go again
            </button>
            {set === 'core' && (
              <button type="button" className={btnGhost} onClick={() => setSet('all')}>
                Switch to everything
              </button>
            )}
            <Link href="/interview/" className={btnGhost}>
              Try a mock interview
            </Link>
          </div>
        </Done>
      ) : (
        <>
          <ProgressBar value={pos} total={deck.length} />
          <FlipCard key={card.k} card={card} context={title(card.g)} flipped={flipped} onFlip={flip} revisionOnly />
          <div className="mt-4 flex items-center justify-between gap-2">
            <button type="button" aria-label="Previous card" className={btnGhost} disabled={pos === 0} onClick={() => go(-1)}>
              <Icon name="left" size={16} /> Prev
            </button>
            <button type="button" className={btnPrimary} onClick={flip}>
              {flipped ? 'Show the question' : 'Show the answer'}
            </button>
            <button type="button" aria-label="Next card" className={btnGhost} onClick={() => go(1)}>
              Next <Icon name="right" size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
