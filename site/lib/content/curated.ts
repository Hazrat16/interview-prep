import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CuratedQuestionSchema, type CuratedQuestion } from './curated-schema';

export interface LoadedCurated extends CuratedQuestion {
  file: string; // e.g. content/curated/frontend.ts
}

/**
 * Discover every site/content/curated/**\/*.ts file and validate its default
 * export. Throws (failing the build) on schema errors or duplicate ids.
 */
export async function loadCurated(siteDir: string): Promise<LoadedCurated[]> {
  const dir = path.join(siteDir, 'content', 'curated');
  if (!fs.existsSync(dir)) return [];
  const files = (fs.readdirSync(dir, { recursive: true }) as string[])
    .filter((f) => /\.(ts|js|json)$/.test(f) && !f.endsWith('.d.ts'))
    .sort();
  const out: LoadedCurated[] = [];
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const f of files) {
    const abs = path.join(dir, f);
    const rel = path.posix.join('content/curated', f.split(path.sep).join('/'));
    const mod = f.endsWith('.json')
      ? { default: JSON.parse(fs.readFileSync(abs, 'utf8')) }
      : await import(pathToFileURL(abs).href);
    const list = mod.default;
    if (!Array.isArray(list)) {
      errors.push(`${rel}: default export must be an array of questions`);
      continue;
    }
    list.forEach((q: unknown, i: number) => {
      const res = CuratedQuestionSchema.safeParse(q);
      if (!res.success) {
        const where = (q as any)?.id ?? `#${i}`;
        for (const issue of res.error.issues)
          errors.push(`${rel} [${where}] ${issue.path.join('.')}: ${issue.message}`);
        return;
      }
      if (seen.has(res.data.id)) errors.push(`${rel}: duplicate id "${res.data.id}" (also in ${seen.get(res.data.id)})`);
      seen.set(res.data.id, rel);
      out.push({ ...res.data, file: rel });
    });
  }
  if (errors.length) throw new Error(`Curated question validation failed:\n  ${errors.join('\n  ')}`);
  return out;
}

// ---------------------------------------------------------------------------
import { EnrichmentEntrySchema, type Enrichment } from './enrich-schema';

export interface LoadedEnrichments {
  /** full question id → enrichment (sameAs already resolved) */
  byId: Map<string, Enrichment & { file: string }>;
  warnings: string[];
  files: number;
}

/**
 * Discover site/content/enrichments/**\/*.ts. Schema errors fail the build;
 * ids that don't match a collected question only warn (a heading may have been
 * renamed in the notes).
 */
export async function loadEnrichments(
  siteDir: string,
  knownIds: Set<string>,
  curated: LoadedCurated[] = [],
): Promise<LoadedEnrichments> {
  const dir = path.join(siteDir, 'content', 'enrichments');
  const byId = new Map<string, Enrichment & { file: string }>();
  const warnings: string[] = [];
  if (!fs.existsSync(dir)) return { byId, warnings, files: 0 };
  const files = (fs.readdirSync(dir, { recursive: true }) as string[]).filter((f) => /\.ts$/.test(f)).sort();
  const errors: string[] = [];
  const pending: [string, string, string][] = []; // id, sameAs, file
  for (const f of files) {
    const rel = path.posix.join('content/enrichments', f.split(path.sep).join('/'));
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    const file = mod.default as { source?: string; entries?: Record<string, unknown> };
    if (!file?.source || !file.entries) {
      errors.push(`${rel}: default export must be defineEnrichments('<path>.md', { … })`);
      continue;
    }
    const base = file.source.replace(/\.(md|markdown)$/i, '');
    for (const [key, value] of Object.entries(file.entries)) {
      const id = `${base}/${key}`;
      const res = EnrichmentEntrySchema.safeParse(value);
      if (!res.success) {
        for (const issue of res.error.issues) errors.push(`${rel} [${key}] ${issue.path.join('.')}: ${issue.message}`);
        continue;
      }
      if (!knownIds.has(id)) warnings.push(`${rel}: "${key}" doesn't match any question in ${file.source} (heading renamed or file excluded?)`);
      if ('sameAs' in res.data) pending.push([id, res.data.sameAs, rel]);
      else byId.set(id, { ...res.data, file: rel });
    }
  }
  if (errors.length) throw new Error(`Enrichment validation failed:\n  ${errors.join('\n  ')}`);
  // `sameAs: 'faq/<id>'` reuses a curated question, so a note and its curated twin stay identical.
  const faq = new Map(
    curated.map((q) => [
      `faq/${q.id}`,
      {
        difficulty: q.difficulty,
        frequency: q.frequency,
        answer: q.answer,
        analogy: q.analogy,
        quickRevision: q.quickRevision,
        followUps: q.followUps,
        deepDive: q.deepDive,
        avoid: q.avoid,
        tags: q.tags,
        file: q.file,
      },
    ]),
  );
  // Resolve sameAs chains in any order (a → b → c); unresolved targets warn.
  let left = pending;
  for (let pass = 0; left.length && pass < 10; pass++) {
    const next: typeof pending = [];
    for (const item of left) {
      const t = byId.get(item[1]) ?? faq.get(item[1]);
      if (t) byId.set(item[0], t);
      else next.push(item);
    }
    if (next.length === left.length) break;
    left = next;
  }
  for (const [, target, rel] of left) warnings.push(`${rel}: sameAs "${target}" has no enrichment`);
  return { byId, warnings, files: files.length };
}
