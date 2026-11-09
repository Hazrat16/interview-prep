'use client';
/**
 * Tiny localStorage store (per browser, per device). Every access is wrapped
 * so private mode / blocked storage just behaves like an empty store.
 */
import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

const parsed = new Map<string, { raw: string | null; value: unknown }>();
function snapshot<T>(key: string, fallback: T): T {
  const raw = read(key);
  const hit = parsed.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try {
    if (raw) value = JSON.parse(raw);
  } catch {}
  parsed.set(key, { raw, value });
  return value;
}

export function readStored<T>(key: string, fallback: T): T {
  return snapshot(key, fallback);
}

export function useStored<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => snapshot(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = snapshot(key, fallback);
      const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      write(key, JSON.stringify(v));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set] as const;
}

/** True after hydration; use to avoid rendering stored values on the server. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const KEYS = {
  bookmarks: 'ph:bookmarks',
  known: 'ph:known',
  srs: 'ph:srs',
  checkpoints: 'ph:checkpoints',
  interviews: 'ph:interviews',
  practice: 'ph:practice',
  theme: 'ip:theme', // read by the pre-paint theme script
} as const;

// ---- bookmarks ----------------------------------------------------------------
const EMPTY: string[] = [];
export function useBookmarks() {
  const [list, setList] = useStored<string[]>(KEYS.bookmarks, EMPTY);
  const toggle = useCallback((key: string) => setList((l) => (l.includes(key) ? l.filter((x) => x !== key) : [key, ...l])), [setList]);
  return { list, toggle, has: (key: string) => list.includes(key) };
}

// ---- known (progress) ------------------------------------------------------------
export type KnownMap = Record<string, number>; // question key → time marked
const EMPTY_MAP = {};
export function useKnown() {
  const [known, setKnown] = useStored<KnownMap>(KEYS.known, EMPTY_MAP);
  const set = useCallback(
    (key: string, on: boolean) =>
      setKnown((m) => {
        if (on === !!m[key]) return m;
        const next = { ...m };
        if (on) next[key] = Date.now();
        else delete next[key];
        return next;
      }),
    [setKnown],
  );
  return { known, set, has: (key: string) => !!known[key] };
}

// ---- checkpoints ("where you left off") ------------------------------------------
export type Checkpoint = { q: string; title: string; t: number };
export function useCheckpoints() {
  return useStored<Record<string, Checkpoint>>(KEYS.checkpoints, EMPTY_MAP);
}

// ---- interview simulator history ---------------------------------------------------
export type InterviewResult = { t: number; total: number; nailed: number; partly: number; missed: number; seconds: number };
const EMPTY_RESULTS: InterviewResult[] = [];
export function useInterviewHistory() {
  return useStored<InterviewResult[]>(KEYS.interviews, EMPTY_RESULTS);
}
