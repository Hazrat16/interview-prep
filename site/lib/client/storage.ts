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

export const KEYS = {
  favorites: 'ip:favorites',
  revision: 'ip:revision',
  recent: 'ip:recent',
  theme: 'ip:theme',
} as const;

const EMPTY: string[] = [];
export function useFavorites() {
  const [favs, setFavs] = useStored<string[]>(KEYS.favorites, EMPTY);
  const toggle = useCallback(
    (id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])),
    [setFavs],
  );
  return { favs, setFavs, toggle, has: (id: string) => favs.includes(id) };
}

export type RevisionState = Record<string, { s: 'known' | 'again'; t: number }>;
const EMPTY_REV: RevisionState = {};
export function useRevisionState() {
  return useStored<RevisionState>(KEYS.revision, EMPTY_REV);
}

export function useRecent() {
  return useStored<string[]>(KEYS.recent, EMPTY);
}
