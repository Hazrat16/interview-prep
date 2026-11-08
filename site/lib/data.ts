/** Server-only access to the build-time content index. */
import fs from 'node:fs';
import path from 'node:path';
import type { SiteData, SiteQuestion, SiteDocument } from './content/site-types';
import { toSummary } from './summary';

let cache: SiteData | undefined;

export function site(): SiteData {
  if (!cache) {
    const file = path.join(process.cwd(), '.generated', 'site.json');
    if (!fs.existsSync(file)) throw new Error('Missing .generated/site.json — run `npm run content` first.');
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as SiteData;
  }
  return cache;
}

const byIdCache = new Map<string, SiteQuestion>();
export function question(id: string) {
  if (!byIdCache.size) for (const q of site().questions) byIdCache.set(q.id, q);
  return byIdCache.get(id);
}

export function questions(filter?: (q: SiteQuestion) => boolean) {
  return site().questions.filter((q) => q.kind === 'question' && (!filter || filter(q)));
}

export function summaries(filter?: (q: SiteQuestion) => boolean) {
  const sizes = new Map(site().duplicateGroups.map((g) => [g.id, g.recordIds.length]));
  return questions(filter).map((q) => toSummary(q, q.duplicateGroup ? sizes.get(q.duplicateGroup) : 1));
}

export function documentBySlug(slug: string): SiteDocument | undefined {
  return site().documents.find((d) => d.slug === slug);
}

export function documentByPath(p: string): SiteDocument | undefined {
  return site().documents.find((d) => d.path === p);
}

export function categoryLabels(): Record<string, string> {
  return Object.fromEntries(site().categories.map((c) => [c.slug, c.label]));
}

export function category(slug: string) {
  return site().categories.find((c) => c.slug === slug);
}

export function duplicateSiblings(q: SiteQuestion) {
  if (!q.duplicateGroup) return [];
  const g = site().duplicateGroups.find((x) => x.id === q.duplicateGroup);
  return (g?.recordIds ?? []).filter((id) => id !== q.id).map((id) => question(id)!).filter(Boolean);
}

/** Questions in a category, plus questions from other folders tagged with the same slug. */
export const inCategory = (slug: string) => {
  const includeTagged = !!category(slug)?.includeTagged;
  return (q: SiteQuestion) => q.category === slug || (includeTagged && q.tags.includes(slug));
};
