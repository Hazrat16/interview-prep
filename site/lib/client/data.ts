'use client';
import type { QuestionSummary, RevisionCard } from '../content/site-types';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const cache = new Map<string, Promise<unknown>>();

export function loadJson<T>(name: string): Promise<T> {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`${base}/data/${name}`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${name}`);
        return name.endsWith('index.json') ? r.text() : r.json();
      }),
    );
  }
  return cache.get(name) as Promise<T>;
}

export const loadSummaries = () => loadJson<QuestionSummary[]>('questions.json');
export const loadCards = () => loadJson<RevisionCard[]>('revision.json');
export const loadSearchIndexText = () => loadJson<string>('search-index.json');

export const href = (p: string) => `${base}${p}`;
