import type { CollectedRecord } from './types';

const STOP = new Set(
  ('a an the is are was what whats which how why when where who do does did you your i me my ' +
    'to of in on for and or with it its this that between difference differences explain ' +
    'describe tell us can could would should will vs versus give one example examples ' +
    'q use using used')
    .split(' '),
);

/** Normalise question text to a comparable token list. */
export function questionTokens(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/^q\d+\s*[:.)\-–]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/[`*_~]/g, '')
    .replace(/\bversus\b/g, 'vs')
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/[\s/]+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((t) => t && !STOP.has(t));
}

export function normalizedKey(q: string): string {
  return [...new Set(questionTokens(q))].sort().join(' ');
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

export interface DedupeItem {
  id: string;
  titleText: string;
  /** Source file (or curated file) — same-file pairs are only linked when phrased differently. */
  path: string;
  detector: string;
  duplicateGroup?: string;
  relatedIds?: string[];
}

/**
 * Exact-normalised duplicates share a duplicateGroup (all answers kept, shown
 * side by side). Near duplicates get relatedIds links. Nothing is removed.
 */
export function linkDuplicates<T extends DedupeItem>(questions: T[]) {
  const byKey = new Map<string, T[]>();
  for (const r of questions) {
    const key = normalizedKey(r.titleText);
    if (key.length < 3) continue;
    byKey.set(key, [...(byKey.get(key) ?? []), r]);
  }
  const groups: { id: string; key: string; recordIds: string[] }[] = [];
  for (const [key, recs] of byKey) {
    if (recs.length < 2) continue;
    const id = `dup-${key.replace(/[^a-z0-9]+/g, '-').slice(0, 60)}`;
    recs.forEach((r) => (r.duplicateGroup = id));
    groups.push({ id, key, recordIds: recs.map((r) => r.id) });
  }

  const sets = questions.map((r) => new Set(questionTokens(r.titleText)));
  const near: [string, string, number][] = [];
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const a = questions[i], b = questions[j];
      if (a.duplicateGroup && a.duplicateGroup === b.duplicateGroup) continue;
      // Same file: only link distinct phrasings, not a table summary + its own detailed section.
      if (a.path === b.path && a.detector === b.detector) continue;
      if (sets[i].size < 2 || sets[j].size < 2) continue;
      const score = jaccard(sets[i], sets[j]);
      if (score >= 0.6) {
        link(a, b.id);
        link(b, a.id);
        near.push([a.id, b.id, score]);
      }
    }
  }
  return { groups, near };
}

export function link(item: { relatedIds?: string[] }, id: string) {
  item.relatedIds = [...new Set([...(item.relatedIds ?? []), id])];
}
