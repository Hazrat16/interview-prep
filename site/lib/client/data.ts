'use client';
import type { Card } from '../content/types';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const cache = new Map<string, Promise<unknown>>();

export function loadJson<T>(name: string, asText = false): Promise<T> {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`${base}/data/${name}`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${name}`);
        return asText ? r.text() : r.json();
      }),
    );
  }
  return cache.get(name) as Promise<T>;
}

export const loadCards = () => loadJson<Card[]>('cards.json');
export const loadSearchIndexText = () => loadJson<string>('search-index.json', true);

export const href = (p: string) => `${base}${p}`;

export { questionHref, guideOf, shuffle } from '../paths';
