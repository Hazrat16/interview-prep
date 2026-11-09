'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, Difficulty } from '@/lib/content/types';
import type { Catalog } from '@/lib/data';
import { useSrs, type Grade } from '@/lib/client/srs';
import { useBookmarks, useHydrated, useKnown } from '@/lib/client/storage';
import { shuffle } from '@/lib/paths';
import { Icon } from '../Icons';
import { btnGhost, btnPrimary, Done, FlipCard, GradeBar, Loading, ProgressBar, ScopePicker, useCards, useFlipKey, useGuideTitles, useScopeParams } from './Shared';

export function Quiz({ catalog }: { catalog: Catalog }) {
  const { cards, error } = useCards();
  const { topic, setTopic, guide, setGuide } = useScopeParams();
  const [difficulty, setDifficulty] = useState<'' | Difficulty>('');
  const [unknownOnly, setUnknownOnly] = useState(false);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const bookmarks = useBookmarks().list;
  useEffect(() => setOnlyBookmarks(new URLSearchParams(window.location.search).has('bookmarks')), []);
  const [shuffled, setShuffled] = useState(true);
  const [deck, setDeck] = useState<Card[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<Grade, string[]>>({ again: [], hard: [], good: [], easy: [] });
  const { srs, grade } = useSrs();
  const { known } = useKnown();
  const ready = useHydrated();
  const title = useGuideTitles(catalog);
  const top = useRef<HTMLDivElement>(null);

  const pool = useMemo(
    () =>
      (cards ?? []).filter(
        (c) =>
          (!topic || c.g.startsWith(topic + '/')) && (!guide || c.g === guide) && (!difficulty || c.d === difficulty) && (!unknownOnly || !known[c.k]) &&
          (!onlyBookmarks || bookmarks.includes(c.k)),
      ),
    // `known` is only read when the deck is (re)built
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards, topic, guide, difficulty, unknownOnly, onlyBookmarks, ready],
  );

  const restart = useCallback(
    (list = pool) => {
      setDeck(shuffled ? shuffle(list) : list);
      setPos(0);
      setFlipped(false);
      setTally({ again: [], hard: [], good: [], easy: [] });
    },
    [pool, shuffled],
  );
  useEffect(() => restart(), [restart]);

  const card = deck[pos];
  const done = deck.length > 0 && pos >= deck.length;
  const flip = useCallback(() => setFlipped((f) => !f), []);
  useFlipKey(flip, !!card);

  const onGrade = useCallback(
    (g: Grade) => {
      if (!card) return;
      grade(card.k, g);
      setTally((t) => ({ ...t, [g]: [...t[g], card.k] }));
      setFlipped(false);
      setPos((p) => p + 1);
      top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    [card, grade],
  );

  if (error) return <p className="text-hard">Could not load questions.</p>;
  if (!cards) return <Loading />;

  const missed = deck.filter((c) => tally.again.includes(c.k) || tally.hard.includes(c.k));

  return (
    <div ref={top} className="scroll-mt-20">
      <ScopePicker catalog={catalog} topic={topic} guide={guide} onTopic={setTopic} onGuide={setGuide}>
        <select aria-label="Difficulty" className="h-10 shrink-0 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}>
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm">
          <input type="checkbox" checked={unknownOnly} onChange={(e) => setUnknownOnly(e.target.checked)} className="accent-[var(--accent)]" />
          Skip known
        </label>
        <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm">
          <input type="checkbox" checked={onlyBookmarks} onChange={(e) => setOnlyBookmarks(e.target.checked)} className="accent-[var(--accent)]" />
          Bookmarked only
        </label>
        <button type="button" onClick={() => setShuffled((s) => !s)} aria-pressed={shuffled} className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm ${shuffled ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-muted'}`}>
          <Icon name="shuffle" size={16} /> Shuffle
        </button>
      </ScopePicker>

      {!deck.length ? (
        <Done icon="check" title="No questions found">
          {unknownOnly ? 'You already know every question here. Untick “Skip known” to go again.' : 'Try a different topic or guide.'}
        </Done>
      ) : done ? (
        <Done title="Quiz complete">
          <p>
            You went through {deck.length} question{deck.length === 1 ? '' : 's'}: {tally.easy.length + tally.good.length} known, {tally.hard.length} shaky, {tally.again.length} missed.
          </p>
          <p className="mt-1 text-sm">Missed and shaky ones come back in your Review queue.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {missed.length > 0 && (
              <button type="button" className={btnPrimary} onClick={() => restart(missed)}>
                <Icon name="again" size={16} /> Retry {missed.length} missed
              </button>
            )}
            <button type="button" className={btnGhost} onClick={() => restart()}>
              Start over
            </button>
            <Link href="/review/" className={btnGhost}>
              Go to Review
            </Link>
          </div>
        </Done>
      ) : (
        <>
          <ProgressBar value={pos} total={deck.length} />
          <FlipCard key={card.k} card={card} context={title(card.g)} flipped={flipped} onFlip={flip} />
          {flipped ? (
            <GradeBar prev={srs[card.k]} onGrade={onGrade} />
          ) : (
            <div className="mt-4 flex justify-between gap-2">
              <button type="button" className={btnGhost} disabled={pos === 0} onClick={() => setPos((p) => Math.max(0, p - 1))}>
                <Icon name="left" size={16} /> Back
              </button>
              <button type="button" className={btnPrimary} onClick={flip}>
                Reveal answer
              </button>
              <button type="button" className={btnGhost} onClick={() => setPos((p) => p + 1)}>
                Skip <Icon name="right" size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
