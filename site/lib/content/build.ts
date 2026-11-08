import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import fg from 'fast-glob';
import matter from 'gray-matter';
import picomatch from 'picomatch';
import type { Category, CollectedRecord, ContentConfig, ContentIndex, SourceDocument } from './types';
import { parseDocument } from './parse';
import { linkDuplicates } from './dedupe';

export interface BuildResult {
  index: ContentIndex;
  nearDuplicates: [string, string, number][];
}

/** Discover every Markdown file under the repo root, minus exclusions. */
export function discoverFiles(root: string, config: ContentConfig) {
  const all = fg
    .sync('**/*.{md,markdown}', {
      cwd: root,
      dot: false,
      ignore: config.alwaysExclude,
      caseSensitiveMatch: false,
    })
    .sort();
  const isExcluded = picomatch(config.exclude, { dot: true });
  const included: string[] = [];
  const excluded: string[] = [];
  for (const f of all) {
    if (isExcluded(f)) {
      excluded.push(f);
      continue;
    }
    // Per-file opt-out: frontmatter `exclude: true` or `publish: false`.
    const fm = matter(fs.readFileSync(path.join(root, f), 'utf8')).data;
    if (fm.exclude === true || fm.publish === false) excluded.push(f);
    else included.push(f);
  }
  return { included, excluded };
}

function gitLastModified(root: string): Map<string, string> {
  const map = new Map<string, string>();
  try {
    const out = execFileSync('git', ['log', '--format=@%cI', '--name-only', '--', '*.md'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    let date = '';
    for (const line of out.split('\n')) {
      if (line.startsWith('@')) date = line.slice(1);
      else if (line && !map.has(line)) map.set(line, date);
    }
  } catch {
    /* not a git checkout (or shallow clone) — dates are optional */
  }
  return map;
}

export function buildContentIndex(root: string, config: ContentConfig): BuildResult {
  const { included, excluded } = discoverFiles(root, config);
  const dates = gitLastModified(root);
  const documents: SourceDocument[] = [];
  const records: CollectedRecord[] = [];
  const intros = new Map<string, string>();

  for (const file of included) {
    const raw = fs.readFileSync(path.join(root, file), 'utf8');
    const { doc, records: recs, intro } = parseDocument({
      path: file,
      raw,
      config,
      lastModified: dates.get(file),
    });
    documents.push(doc);
    records.push(...recs);
    if (doc.isIndex && intro) intros.set(doc.category, intro);
  }

  const qs = records.filter((r) => r.kind === 'question');
  const items = qs.map((r) => ({ id: r.id, titleText: r.titleText, path: r.source.path, detector: r.detector }));
  const { groups, near } = linkDuplicates(items);
  items.forEach((it, i) => {
    qs[i].duplicateGroup = (it as any).duplicateGroup;
    qs[i].relatedIds = (it as any).relatedIds;
  });

  const catMap = new Map<string, Category>();
  for (const d of documents) {
    const meta = config.categories[d.category];
    const cat =
      catMap.get(d.category) ??
      ({
        slug: d.category,
        label: meta?.label ?? titleCase(d.category),
        order: meta?.order ?? 100,
        intro: intros.get(d.category),
        documentPaths: [],
      } satisfies Category);
    cat.documentPaths.push(d.path);
    catMap.set(d.category, cat);
  }

  return {
    index: {
      generatedAt: new Date().toISOString(),
      categories: [...catMap.values()].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
      documents,
      records,
      duplicateGroups: groups,
      excludedFiles: excluded,
    },
    nearDuplicates: near,
  };
}

function titleCase(s: string) {
  return s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
