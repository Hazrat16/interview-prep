'use client';
/**
 * Spaced repetition (SM-2). Every graded card gets an ease factor, an interval
 * in days and a due date. "Again" brings it back tomorrow; "Easy" pushes it
 * far out. Grading Good/Easy also marks the question as known for progress.
 */
import { useCallback } from 'react';
import { KEYS, readStored, useStored, type KnownMap } from './storage';

export type Grade = 'again' | 'hard' | 'good' | 'easy';
export const GRADES: { grade: Grade; label: string; q: number; key: string }[] = [
  { grade: 'again', label: 'Again', q: 1, key: '1' },
  { grade: 'hard', label: 'Hard', q: 3, key: '2' },
  { grade: 'good', label: 'Good', q: 4, key: '3' },
  { grade: 'easy', label: 'Easy', q: 5, key: '4' },
];

export interface SrsItem {
  ef: number; // ease factor
  iv: number; // interval (days)
  rep: number; // successful repetitions in a row
  due: string; // YYYY-MM-DD
  last: string;
}
export type SrsMap = Record<string, SrsItem>;

export const today = () => toDay(new Date());
function toDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDay(d);
}

export function schedule(prev: SrsItem | undefined, grade: Grade): SrsItem {
  const q = GRADES.find((g) => g.grade === grade)!.q;
  let { ef, iv, rep } = prev ?? { ef: 2.5, iv: 0, rep: 0 };
  if (q >= 3) {
    iv = rep === 0 ? 1 : rep === 1 ? 6 : Math.round(iv * ef);
    if (grade === 'hard') iv = Math.max(1, Math.round(iv * 0.6));
    if (grade === 'easy') iv = Math.round(iv * 1.3) + 1;
    rep += 1;
  } else {
    rep = 0;
    iv = 0; // due again today/tomorrow
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  return { ef: Math.round(ef * 100) / 100, iv, rep, due: addDays(Math.max(iv, grade === 'again' ? 1 : iv)), last: today() };
}

/** Human label for when a grade will bring the card back. */
export function nextLabel(prev: SrsItem | undefined, grade: Grade) {
  const d = schedule(prev, grade).iv;
  if (grade === 'again' || d <= 1) return '1d';
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}mo`;
  return `${Math.round(d / 365)}y`;
}

const EMPTY = {};
export function useSrs() {
  const [srs, setSrs] = useStored<SrsMap>(KEYS.srs, EMPTY);
  const [, setKnown] = useStored<KnownMap>(KEYS.known, EMPTY);
  const grade = useCallback(
    (key: string, g: Grade) => {
      setSrs((m) => ({ ...m, [key]: schedule(m[key], g) }));
      setKnown((m) => {
        const next = { ...m };
        if (g === 'good' || g === 'easy') next[key] ??= Date.now();
        else if (g === 'again') delete next[key];
        return next;
      });
    },
    [setSrs, setKnown],
  );
  /** Put a question in the queue, due today, without grading it. */
  const add = useCallback(
    (key: string) => setSrs((m) => (m[key] ? m : { ...m, [key]: { ef: 2.5, iv: 0, rep: 0, due: today(), last: '' } })),
    [setSrs],
  );
  const remove = useCallback(
    (key: string) =>
      setSrs((m) => {
        const next = { ...m };
        delete next[key];
        return next;
      }),
    [setSrs],
  );
  const t = today();
  const due = Object.entries(srs)
    .filter(([, v]) => v.due <= t)
    .map(([k]) => k);
  return { srs, grade, add, remove, due };
}

export const dueCount = () => {
  const t = today();
  return Object.values(readStored<SrsMap>(KEYS.srs, {})).filter((v) => v.due <= t).length;
};
