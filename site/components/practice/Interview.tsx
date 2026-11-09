'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, Difficulty } from '@/lib/content/types';
import type { Catalog } from '@/lib/data';
import { useSrs } from '@/lib/client/srs';
import { useInterviewHistory } from '@/lib/client/storage';
import { questionHref, shuffle } from '@/lib/paths';
import { Icon } from '../Icons';
import { btnGhost, btnPrimary, Done, FlipCard, Loading, useCards, useGuideTitles } from './Shared';

type Mark = 'nailed' | 'partly' | 'missed';
type Phase = 'setup' | 'running' | 'done';

const COUNTS = [5, 10, 15, 20];
const TIMES = [60, 120, 180, 300];

export function Interview({ catalog }: { catalog: Catalog }) {
  const { cards, error } = useCards();
  const title = useGuideTitles(catalog);
  const { grade } = useSrs();
  const [history, setHistory] = useInterviewHistory();

  const [topics, setTopics] = useState<string[]>(() => catalog.topics.filter((t) => t.slug !== 'career').map((t) => t.slug));
  const [guide, setGuide] = useState('');
  const [count, setCount] = useState(10);
  const [seconds, setSeconds] = useState(120);
  const [difficulty, setDifficulty] = useState<'' | Difficulty>('');
  const [phase, setPhase] = useState<Phase>('setup');
  const [deck, setDeck] = useState<Card[]>([]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [left, setLeft] = useState(0);
  const started = useRef(0);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const g = p.get('guide');
    const t = p.get('topic');
    if (g) {
      setGuide(g);
      setTopics([g.split('/')[0]]);
    } else if (t) setTopics([t]);
  }, []);

  const pool = useMemo(
    () => (cards ?? []).filter((c) => topics.includes(c.g.split('/')[0]) && (!guide || c.g === guide) && (!difficulty || c.d === difficulty)),
    [cards, topics, guide, difficulty],
  );

  const start = () => {
    setDeck(shuffle(pool).slice(0, count));
    setPos(0);
    setRevealed(false);
    setMarks({});
    setLeft(seconds);
    started.current = Date.now();
    setPhase('running');
    top.current?.scrollIntoView({ block: 'start' });
  };

  // Countdown per question; pauses once the answer is revealed.
  useEffect(() => {
    if (phase !== 'running' || revealed) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [phase, revealed, pos]);
  useEffect(() => {
    if (phase === 'running' && left <= 0 && !revealed) setRevealed(true);
  }, [left, phase, revealed]);

  const card = deck[pos];

  const finish = useCallback(
    (m: Record<string, Mark>) => {
      const vals = Object.values(m);
      setHistory((h) =>
        [
          {
            t: Date.now(),
            total: vals.length,
            nailed: vals.filter((v) => v === 'nailed').length,
            partly: vals.filter((v) => v === 'partly').length,
            missed: vals.filter((v) => v === 'missed').length,
            seconds: Math.round((Date.now() - started.current) / 1000),
          },
          ...h,
        ].slice(0, 20),
      );
      setPhase('done');
    },
    [setHistory],
  );

  const mark = (m: Mark) => {
    if (!card) return;
    grade(card.k, m === 'nailed' ? 'good' : m === 'partly' ? 'hard' : 'again');
    const next = { ...marks, [card.k]: m };
    setMarks(next);
    if (pos + 1 >= deck.length) finish(next);
    else {
      setPos(pos + 1);
      setRevealed(false);
      setLeft(seconds);
      top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  if (error) return <p className="text-hard">Could not load questions.</p>;
  if (!cards) return <Loading />;

  // ---- setup ------------------------------------------------------------------
  if (phase === 'setup') {
    const chip = (on: boolean) => `h-9 rounded-full border px-3.5 text-sm transition-colors ${on ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line text-muted hover:text-ink'}`;
    const label = 'mb-2 block text-[12px] font-semibold uppercase tracking-wider text-muted';
    const guideTitle = guide ? catalog.guides.find((g) => g.key === guide)?.title : '';
    return (
      <div ref={top} className="scroll-mt-20 space-y-6 rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <div>
          <span className={label}>Topics</span>
          {guide ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-accent-soft px-3 py-1.5 font-medium text-accent">Only: {guideTitle}</span>
              <button type="button" className="text-muted hover:text-ink" onClick={() => setGuide('')}>
                Clear
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {catalog.topics.map((t) => {
                const on = topics.includes(t.slug);
                return (
                  <button key={t.slug} type="button" aria-pressed={on} className={chip(on)} onClick={() => setTopics((ts) => (on ? ts.filter((x) => x !== t.slug) : [...ts, t.slug]))}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <span className={label}>Questions</span>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map((n) => (
                <button key={n} type="button" aria-pressed={count === n} className={chip(count === n)} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={label}>Time per question</span>
            <div className="flex flex-wrap gap-2">
              {TIMES.map((s) => (
                <button key={s} type="button" aria-pressed={seconds === s} className={chip(seconds === s)} onClick={() => setSeconds(s)}>
                  {s / 60} min
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={label}>Difficulty</span>
            <div className="flex flex-wrap gap-2">
              {(['', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d || 'any'} type="button" aria-pressed={difficulty === d} className={chip(difficulty === d)} onClick={() => setDifficulty(d)}>
                  {d ? d[0].toUpperCase() + d.slice(1) : 'Any'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="button" className={btnPrimary} disabled={!pool.length} onClick={start}>
            <Icon name="play" size={15} /> Start interview
          </button>
          <span className="text-sm text-muted">
            {Math.min(count, pool.length)} of {pool.length} matching questions · ~{Math.round((Math.min(count, pool.length) * seconds) / 60)} min
          </span>
        </div>
        {history.length > 0 && (
          <div className="border-t border-line pt-5">
            <span className={label}>Recent interviews</span>
            <ul className="space-y-1.5 text-sm">
              {history.slice(0, 5).map((h) => (
                <li key={h.t} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-muted">{new Date(h.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <ScoreBar nailed={h.nailed} partly={h.partly} missed={h.missed} />
                  <span className="w-12 shrink-0 text-right tabular-nums">{Math.round((h.nailed / (h.total || 1)) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ---- results ------------------------------------------------------------------
  if (phase === 'done') {
    const vals = Object.values(marks);
    const nailed = vals.filter((v) => v === 'nailed').length;
    const partly = vals.filter((v) => v === 'partly').length;
    const missed = vals.filter((v) => v === 'missed').length;
    const tone: Record<Mark, string> = { nailed: 'text-easy', partly: 'text-medium', missed: 'text-hard' };
    return (
      <div ref={top} className="scroll-mt-20 space-y-4">
        <Done title="Interview complete">
          <p className="text-3xl font-semibold tabular-nums text-ink">{Math.round((nailed / (deck.length || 1)) * 100)}%</p>
          <p className="mt-1">
            {nailed} nailed · {partly} partly · {missed} missed. Partly and missed questions are now in your Review queue.
          </p>
          <div className="mx-auto mt-4 max-w-sm">
            <ScoreBar nailed={nailed} partly={partly} missed={missed} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" className={btnPrimary} onClick={() => setPhase('setup')}>
              New interview
            </button>
            <Link href="/review/" className={btnGhost}>
              Go to Review
            </Link>
          </div>
        </Done>
        <ul className="space-y-2">
          {deck.map((c) => (
            <li key={c.k}>
              <Link href={questionHref(c.k)} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:border-accent">
                <span className={`w-14 shrink-0 text-xs font-semibold uppercase ${tone[marks[c.k] ?? 'missed']}`}>{marks[c.k] ?? '—'}</span>
                <span className="md-inline min-w-0 flex-1 text-[15px] leading-snug" dangerouslySetInnerHTML={{ __html: c.t }} />
                <Icon name="right" size={16} className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ---- running ----------------------------------------------------------------------
  const urgent = left <= 15 && !revealed;
  const mm = Math.floor(Math.max(0, left) / 60);
  const ss = String(Math.max(0, left) % 60).padStart(2, '0');
  return (
    <div ref={top} className="scroll-mt-20">
      <div className="mb-3 flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(pos / deck.length) * 100}%` }} />
        </div>
        <span className="text-sm tabular-nums text-muted">
          {pos + 1} / {deck.length}
        </span>
        <span className={`font-mono text-xl font-semibold tabular-nums ${urgent ? 'animate-pulse text-hard' : left <= 0 ? 'text-hard' : 'text-ink'}`} aria-live="off">
          {left <= 0 ? "Time's up" : `${mm}:${ss}`}
        </span>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${urgent ? 'bg-hard' : 'bg-medium'}`} style={{ width: `${(Math.max(0, left) / seconds) * 100}%` }} />
      </div>
      <FlipCard card={card} context={title(card.g)} flipped={revealed} onFlip={() => setRevealed(true)} />
      {revealed ? (
        <div className="mt-4">
          <p className="mb-2 text-center text-xs text-muted">Be honest: how did your answer compare?</p>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => mark('missed')} className="rounded-2xl border border-hard/40 bg-surface py-3 text-sm font-semibold text-hard hover:bg-hard/10">
              Missed it
            </button>
            <button type="button" onClick={() => mark('partly')} className="rounded-2xl border border-medium/40 bg-surface py-3 text-sm font-semibold text-medium hover:bg-medium/10">
              Partly
            </button>
            <button type="button" onClick={() => mark('nailed')} className="rounded-2xl border border-easy/40 bg-surface py-3 text-sm font-semibold text-easy hover:bg-easy/10">
              Nailed it
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex justify-between gap-2">
          <button type="button" className={btnGhost} onClick={() => finish(marks)}>
            End interview
          </button>
          <button type="button" className={btnPrimary} onClick={() => setRevealed(true)}>
            I&apos;m done, reveal the answer
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ nailed, partly, missed }: { nailed: number; partly: number; missed: number }) {
  const total = nailed + partly + missed || 1;
  return (
    <div className="flex h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2">
      <span className="bg-easy" style={{ width: `${(nailed / total) * 100}%` }} />
      <span className="bg-medium" style={{ width: `${(partly / total) * 100}%` }} />
      <span className="bg-hard" style={{ width: `${(missed / total) * 100}%` }} />
    </div>
  );
}
