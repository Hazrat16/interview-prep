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
