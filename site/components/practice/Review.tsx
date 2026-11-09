'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '@/lib/content/types';
import type { Catalog } from '@/lib/data';
import { today, useSrs, type Grade } from '@/lib/client/srs';
import { useHydrated } from '@/lib/client/storage';
import { btnGhost, btnPrimary, Done, FlipCard, GradeBar, Loading, ProgressBar, useCards, useFlipKey, useGuideTitles } from './Shared';

export function Review({ catalog }: { catalog: Catalog }) {
  const { cards, error } = useCards();
  const { srs, grade } = useSrs();
  const ready = useHydrated();
  const title = useGuideTitles(catalog);
  const [queue, setQueue] = useState<Card[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const top = useRef<HTMLDivElement>(null);

  // Build the queue once (grading moves cards out of "due", but the session keeps its list).
  useEffect(() => {
    if (!cards || !ready || queue) return;
    const t = today();
    const byKey = new Map(cards.map((c) => [c.k, c]));
    const due = Object.entries(srs)
      .filter(([, v]) => v.due <= t)
      .sort((a, b) => a[1].due.localeCompare(b[1].due))
      .map(([k]) => byKey.get(k))
      .filter(Boolean) as Card[];
    setQueue(due);
  }, [cards, ready, srs, queue]);

  const card = queue?.[pos];
  const flip = useCallback(() => setFlipped((f) => !f), []);
  useFlipKey(flip, !!card);

  const onGrade = useCallback(
    (g: Grade) => {
      if (!card) return;
      grade(card.k, g);
      setReviewed((n) => n + 1);
      // "Again" puts the card back at the end of today's session.
      if (g === 'again') setQueue((q) => (q ? [...q, card] : q));
      setFlipped(false);
      setPos((p) => p + 1);
      top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    [card, grade],
  );

  const upcoming = useMemo(() => {
    const t = today();
    const future = Object.values(srs).filter((v) => v.due > t).map((v) => v.due).sort();
    return { total: Object.keys(srs).length, next: future[0] };
  }, [srs]);

  if (error) return <p className="text-hard">Could not load questions.</p>;
  if (!cards || !queue) return <Loading />;

  if (!queue.length)
    return (
      <Done icon="check" title={upcoming.total ? 'All caught up' : 'Your review queue is empty'}>
        {upcoming.total ? (
          <p>
            Nothing is due today. {upcoming.total} question{upcoming.total === 1 ? '' : 's'} in your queue
            {upcoming.next && <> · next one due {formatDay(upcoming.next)}</>}.
          </p>
        ) : (
          <p>Grade cards in the Quiz or Interview Simulator, or press “Add to review” on any question. Hard ones come back here on a schedule.</p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/quiz/" className={btnPrimary}>
            Practise more
          </Link>
          <Link href="/last-minute/" className={btnGhost}>
            Last-minute cards
          </Link>
        </div>
      </Done>
    );

  if (!card)
    return (
      <Done title="Review complete">
        <p>
          You reviewed {reviewed} card{reviewed === 1 ? '' : 's'}. Keep it up!
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/quiz/" className={btnPrimary}>
            Practise more
          </Link>
          <Link href="/" className={btnGhost}>
            Home
          </Link>
        </div>
      </Done>
    );

  return (
    <div ref={top} className="scroll-mt-20">
      <ProgressBar value={pos} total={queue.length} />
      <FlipCard card={card} context={title(card.g)} flipped={flipped} onFlip={flip} />
      {flipped ? (
        <GradeBar prev={srs[card.k]} onGrade={onGrade} />
      ) : (
        <div className="mt-4 flex justify-center">
          <button type="button" className={btnPrimary} onClick={flip}>
            Reveal answer
          </button>
        </div>
      )}
    </div>
  );
}

function formatDay(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
