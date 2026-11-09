/** Server-only access to the build-time content (.generated/site.json). */
import fs from 'node:fs';
import path from 'node:path';
import type { GuideData, SiteData, TopicData } from './content/types';

let cache: SiteData | undefined;

export function site(): SiteData {
  if (!cache) {
    const file = path.join(process.cwd(), '.generated', 'site.json');
    if (!fs.existsSync(file)) throw new Error('Missing .generated/site.json — run `npm run content` first.');
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as SiteData;
  }
  return cache;
}

export const topics = (): TopicData[] => site().topics;
export const topic = (slug: string) => site().topics.find((t) => t.slug === slug);
export const guide = (key: string): GuideData | undefined => site().guides.find((g) => g.key === key);
export const cheatsheets = () => site().cheatsheets;
export const cheatsheet = (slug: string) => site().cheatsheets.find((s) => s.slug === slug);

/** Lightweight catalog for client components (no question bodies). */
export interface Catalog {
  topics: { slug: string; label: string; icon: string }[];
  guides: { key: string; topic: string; title: string; count: number; minutes: number }[];
}
export function catalog(): Catalog {
  return {
    topics: site().topics.map((t) => ({ slug: t.slug, label: t.label, icon: t.icon })),
    guides: site().guides.map((g) => ({ key: g.key, topic: g.topic, title: g.title, count: g.count, minutes: g.minutes })),
  };
}

/** Guides in reading order across all topics (for prev/next). */
export function neighbours(key: string) {
  const list = site().topics.flatMap((t) => t.guides);
  const i = list.findIndex((g) => g.key === key);
  return { prev: list[i - 1], next: list[i + 1] };
}
