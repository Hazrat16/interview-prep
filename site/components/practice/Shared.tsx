'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Card } from '@/lib/content/types';
import type { Catalog } from '@/lib/data';
import { loadCards } from '@/lib/client/data';
import { GRADES, nextLabel, type Grade, type SrsItem } from '@/lib/client/srs';
import { PERSPECTIVE_LABELS } from '@/lib/labels';
import { questionHref } from '@/lib/paths';
import { DifficultyBadge, Badge } from '../Badges';
import { Icon } from '../Icons';
import { BookmarkButton } from '../QuestionClient';

export function useCards() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    loadCards().then(setCards).catch(() => setError(true));
  }, []);
  return { cards, error };
}

export function useGuideTitles(catalog: Catalog) {
  return useMemo(() => {
    const m = new Map(catalog.guides.map((g) => [g.key, g.title]));
    const t = new Map(catalog.topics.map((x) => [x.slug, x.label]));
    return (guideKey: string) => `${t.get(guideKey.split('/')[0]) ?? ''} › ${m.get(guideKey) ?? guideKey}`;
  }, [catalog]);
}

export function Loading() {
  return <div className="h-80 animate-pulse rounded-3xl bg-surface-2" />;
}

/** Topic + guide pickers. "" = all. */
export function ScopePicker({
  catalog,
  topic,
  guide,
  onTopic,
  onGuide,
  children,
}: {
  catalog: Catalog;
  topic: string;
  guide: string;
  onTopic: (t: string) => void;
  onGuide: (g: string) => void;
  children?: React.ReactNode;
}) {
  const select = 'h-10 min-w-0 shrink-0 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent';
  return (
    <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <select
        aria-label="Topic"
        className={select}
        value={topic}
        onChange={(e) => {
          onTopic(e.target.value);
          onGuide('');
        }}
      >
        <option value="">All topics</option>
        {catalog.topics.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.label}
          </option>
        ))}
      </select>
      <select aria-label="Guide" className={`${select} max-w-[16rem]`} value={guide} onChange={(e) => onGuide(e.target.value)}>
        <option value="">{topic ? 'All guides in topic' : 'All guides'}</option>
        {catalog.guides
          .filter((g) => !topic || g.topic === topic)
          .map((g) => (
            <option key={g.key} value={g.key}>
              {g.title} ({g.count})
            </option>
          ))}
      </select>
      {children}
    </div>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  return (
    <div className="mb-3 flex items-center gap-3 text-xs text-muted">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all duration-500 ease-out" style={{ width: `${(Math.min(value, total) / (total || 1)) * 100}%` }} />
      </div>
      <span className="tabular-nums">
        {Math.min(value + 1, total)} / {total}
      </span>
    </div>
  );
}

/**
 * Flip card. Front: the question. Back: quick revision + the full answer
 * (or only the quick revision when `revisionOnly`).
 */
export function FlipCard({
  card,
  context,
  flipped,
  onFlip,
  revisionOnly,
}: {
  card: Card;
  context: string;
  flipped: boolean;
  onFlip: () => void;
  revisionOnly?: boolean;
}) {
  const [full, setFull] = useState(false);
  useEffect(() => setFull(false), [card.k]);
  return (
    <div className="anim-card overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs text-muted sm:px-6">
        <span className="min-w-0 flex-1 truncate">{context}</span>
        <DifficultyBadge difficulty={card.d} />
        <Badge>{PERSPECTIVE_LABELS[card.p]}</Badge>
        <BookmarkButton id={card.k} compact />
      </div>
      <button type="button" onClick={onFlip} className="block w-full px-5 py-8 text-left sm:px-8 sm:py-10" aria-label={flipped ? 'Show the question' : 'Show the answer'}>
        <div className="text-[1.2rem] font-semibold leading-snug tracking-tight text-balance sm:text-2xl" dangerouslySetInnerHTML={{ __html: card.t }} />
        {card.s && <div className="md prose prose-sm mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: card.s }} />}
        {!flipped && (
          <div className="mt-8 inline-flex items-center gap-2 text-sm text-muted">
            <Icon name="eye" size={16} /> Answer out loud, then tap to reveal <kbd className="hidden rounded border border-line px-1.5 text-[10px] sm:inline">Space</kbd>
          </div>
        )}
      </button>
      {flipped && (
        <div className="anim-reveal space-y-4 border-t border-line bg-bg/40 px-5 py-5 sm:px-8">
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-revise">Quick revision</div>
            <ol className="space-y-2">
              {card.r.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-revise-soft text-xs font-semibold text-revise">{i + 1}</span>
                  <span className="md min-w-0 flex-1 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: h }} />
                </li>
              ))}
            </ol>
          </div>
          {!revisionOnly || full ? (
            <div>
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-answer">Interview answer</div>
              <div className="md prose prose-sm max-w-none sm:prose-base" dangerouslySetInnerHTML={{ __html: card.a }} />
            </div>
          ) : (
            <button type="button" onClick={() => setFull(true)} className="text-sm font-medium text-accent">
              Show the full answer
            </button>
          )}
          <Link href={questionHref(card.k)} className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
            Open in guide (analogy, follow-ups…) <Icon name="right" size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

/** Again / Hard / Good / Easy with the interval each one schedules. Keys 1–4. */
export function GradeBar({ prev, onGrade }: { prev?: SrsItem; onGrade: (g: Grade) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)) return;
      const g = GRADES.find((x) => x.key === e.key);
      if (g) onGrade(g.grade);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onGrade]);
  const tone: Record<Grade, string> = {
    again: 'border-hard/40 text-hard hover:bg-hard/10',
    hard: 'border-medium/40 text-medium hover:bg-medium/10',
    good: 'border-easy/40 text-easy hover:bg-easy/10',
    easy: 'border-accent/40 text-accent hover:bg-accent-soft',
  };
  return (
    <div className="mt-4">
      <p className="mb-2 text-center text-xs text-muted">How well did you know it?</p>
      <div className="grid grid-cols-4 gap-2">
        {GRADES.map((g) => (
          <button key={g.grade} type="button" onClick={() => onGrade(g.grade)} className={`press anim-reveal flex flex-col items-center rounded-2xl border bg-surface py-2.5 text-sm font-semibold ${tone[g.grade]}`}>
            {g.label}
            <span className="text-[11px] font-normal text-muted">
              {nextLabel(prev, g.grade)} <kbd className="hidden sm:inline">· {g.key}</kbd>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Space / Enter flips the card. */
export function useFlipKey(flip: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      // Focused buttons/links handle Space/Enter themselves; don't flip twice.
      if (/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip, enabled]);
}

export function Done({ icon = 'trophy', title, children }: { icon?: 'trophy' | 'check'; title: string; children?: React.ReactNode }) {
  return (
    <div className="anim-scale rounded-3xl border border-line bg-surface px-6 py-12 text-center">
      <span className="anim-pop mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent [animation-delay:120ms]">
        <Icon name={icon} size={26} />
      </span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <div className="mt-2 text-muted">{children}</div>
    </div>
  );
}

export const btn = 'press inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium';
export const btnPrimary = `${btn} bg-accent text-white`;
export const btnGhost = `${btn} border border-line hover:border-accent`;

/** Read ?topic= and ?guide= once on mount. */
export function useScopeParams() {
  const [topic, setTopic] = useState('');
  const [guide, setGuide] = useState('');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const g = p.get('guide') ?? '';
    setGuide(g);
    setTopic(p.get('topic') ?? (g ? g.split('/')[0] : ''));
  }, []);
  return { topic, setTopic, guide, setGuide };
}
