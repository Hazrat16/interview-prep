/**
 * Build-time content pipeline.
 *   npm run content          → .generated/content.json + .generated/parse-report.md
 *   npm run content:report   → same, and prints every record to the console
 *
 * Reads Markdown from the repo root; never writes outside site/.generated.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../content.config';
import { buildContentIndex } from '../lib/content/build';
import { loadCurated, loadEnrichments } from '../lib/content/curated';
import { buildSite } from '../lib/content/site-build';
import type { CollectedRecord, ContentIndex } from '../lib/content/types';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(siteDir, config.contentRoot);
const outDir = path.join(siteDir, '.generated');
const verbose = process.argv.includes('--verbose');

const basePath = (process.env.PAGES_BASE_PATH ?? '').replace(/\/$/, '');

const { index, nearDuplicates } = buildContentIndex(root, config);
const curated = await loadCurated(siteDir); // throws → build fails on invalid curated data
const enrichments = await loadEnrichments(siteDir, new Set(index.records.filter((r) => r.kind === 'question').map((r) => r.id)), curated);
const { site, summaries, cards, searchIndex, warnings } = await buildSite({ index, curated, enrichments, config, basePath });
warnings.push(...enrichments.warnings);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'site.json'), JSON.stringify(site));
const publicData = path.join(siteDir, 'public', 'data');
fs.mkdirSync(publicData, { recursive: true });
fs.writeFileSync(path.join(publicData, 'questions.json'), JSON.stringify(summaries));
fs.writeFileSync(path.join(publicData, 'revision.json'), JSON.stringify(cards));
fs.writeFileSync(path.join(publicData, 'search-index.json'), searchIndex);

let report = renderReport(index, nearDuplicates);
report += `\n\n## Curated questions\n\n- ${curated.length} questions from ${new Set(curated.map((q) => q.file)).size} files\n`;
for (const w of warnings) report += `- ⚠️ ${w}\n`;
{
  const qs = index.records.filter((r) => r.kind === 'question');
  const done = qs.filter((r) => enrichments.byId.has(r.id)).length;
  report += `\n## Enrichment coverage (curated-style sections for my notes)\n\n${done} of ${qs.length} collected questions enriched.\n\n| File | Enriched |\n|---|--:|\n`;
  const byFile = new Map<string, [number, number]>();
  for (const r of qs) {
    const c = byFile.get(r.source.path) ?? [0, 0];
    c[1]++;
    if (enrichments.byId.has(r.id)) c[0]++;
    byFile.set(r.source.path, c);
  }
  for (const [f, [d, t]] of byFile) report += `| ${f} | ${d}/${t}${d === t ? ' ✅' : ''} |\n`;
}
fs.writeFileSync(path.join(outDir, 'parse-report.md'), report);

// ---- console summary --------------------------------------------------------
const count = (pred: (r: CollectedRecord) => boolean) => index.records.filter(pred).length;
console.log(
  `content: ${index.documents.length} files, ${count((r) => r.kind === 'question')} questions, ` +
    `${count((r) => r.kind === 'note')} notes, ${count((r) => r.kind === 'revision')} revision sets, ` +
    `${index.duplicateGroups.length} duplicate groups, ${index.excludedFiles.length} excluded files`,
);
console.log(
  `site:    ${curated.length} curated questions, ${summaries.length} questions total, ${cards.length} revision cards, ` +
    `${site.duplicateGroups.length} duplicate groups (collected + curated)`,
);
{
  const total = index.records.filter((r) => r.kind === 'question').length;
  const done = index.records.filter((r) => r.kind === 'question' && enrichments.byId.has(r.id)).length;
  console.log(`enrich:  ${done}/${total} collected questions have curated-style sections (${enrichments.files} files)`);
}
for (const w of warnings) console.warn(`warning: ${w}`);
console.log(`report:  ${path.relative(process.cwd(), path.join(outDir, 'parse-report.md'))}`);
if (verbose) console.log('\n' + report);

// ---- report -----------------------------------------------------------------
function renderReport(ix: ContentIndex, near: [string, string, number][]) {
  const L: string[] = [];
  const recs = ix.records;
  const byId = new Map(recs.map((r) => [r.id, r]));
  const tally = (key: (r: CollectedRecord) => string | undefined, list = recs) => {
    const m = new Map<string, number>();
    for (const r of list) {
      const k = key(r) ?? '—';
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join(' · ');
  };
  const questions = recs.filter((r) => r.kind === 'question');

  L.push('# Parse report', '', `Generated ${ix.generatedAt}`, '');
  L.push('## Summary', '');
  L.push(`- Files discovered: **${ix.documents.length + ix.excludedFiles.length}** (included ${ix.documents.length}, excluded ${ix.excludedFiles.length})`);
  L.push(`- Records: ${tally((r) => r.kind)}`);
  L.push(`- Questions by detector: ${tally((r) => r.detector, questions)}`);
  L.push(`- Questions by content type: ${tally((r) => r.contentType, questions)}`);
  L.push(`- Questions by category: ${tally((r) => r.category, questions)}`);
  L.push(`- Questions by difficulty: ${tally((r) => r.difficulty ?? 'unrated', questions)}`);
  L.push(`- Quick-revision eligible: ${questions.filter((r) => r.revisionEligible).length} questions + ${recs.filter((r) => r.kind === 'revision').reduce((n, r) => n + (r.revisionItems?.length ?? 0), 0)} takeaway lines`);
  L.push(`- Exact duplicate groups: ${ix.duplicateGroups.length} · near-duplicate links: ${near.length}`);
  L.push('');

  L.push('## Excluded files (not read, not published)', '');
  for (const f of ix.excludedFiles) L.push(`- ${f}`);
  L.push('');

  L.push('## Files', '');
  L.push('| File | Q | Notes | Rev | Detectors | Uncovered lines | Privacy flags |');
  L.push('|---|--:|--:|--:|---|--:|--:|');
  for (const d of ix.documents) {
    const rs = recs.filter((r) => r.source.path === d.path);
    const dets = [...new Set(rs.map((r) => r.detector))].join(', ') || (d.isIndex ? '(category index)' : '—');
    const unc = d.uncovered.reduce((n, u) => n + (u.endLine - u.startLine + 1), 0);
    L.push(
      `| ${d.path} | ${rs.filter((r) => r.kind === 'question').length} | ${rs.filter((r) => r.kind === 'note').length} | ${rs.filter((r) => r.kind === 'revision').length} | ${dets} | ${unc} | ${d.privacyFlags.length} |`,
    );
  }
  L.push('');

  L.push('## Records per file', '');
  L.push('Format: `line` [detector · type · difficulty] title — tags', '');
  for (const d of ix.documents) {
    if (d.isIndex) continue;
    L.push(`### ${d.path}`, '');
    for (const r of recs.filter((x) => x.source.path === d.path)) {
      const meta = [r.detector, r.contentType, r.difficulty].filter(Boolean).join(' · ');
      const extra =
        r.kind === 'revision'
          ? ` (${r.revisionItems?.length} cards)`
          : r.kind === 'note'
            ? ' (whole document)'
            : '';
      L.push(`- \`L${r.source.startLine}\` [${meta}] ${r.titleText}${extra}${r.tags.length ? ` — _${r.tags.join(', ')}_` : ''}`);
    }
    if (d.uncovered.length) {
      L.push('', '  Not turned into records (still shown in the full-document view):');
      for (const u of d.uncovered) L.push(`  - \`L${u.startLine}–${u.endLine}\` under “${u.heading}”`);
    }
    L.push('');
  }

  L.push('## Duplicates', '', '### Exact (same question after normalising — all answers kept and shown together)', '');
  if (!ix.duplicateGroups.length) L.push('_None._');
  for (const g of ix.duplicateGroups) {
    L.push(`- **${byId.get(g.recordIds[0])?.titleText}**`);
    for (const id of g.recordIds) {
      const r = byId.get(id)!;
      L.push(`  - ${r.source.path}:${r.source.startLine} — “${r.titleText}”`);
    }
  }
  L.push('', '### Near duplicates (linked as “Also covered in”)', '');
  if (!near.length) L.push('_None._');
  for (const [a, b, s] of near.sort((x, y) => y[2] - x[2])) {
    const ra = byId.get(a)!, rb = byId.get(b)!;
    L.push(`- ${s.toFixed(2)} · “${ra.titleText}” (${ra.source.path}:${ra.source.startLine}) ↔ “${rb.titleText}” (${rb.source.path}:${rb.source.startLine})`);
  }
  L.push('');

  L.push('## Quality checks', '');
  const warnings: string[] = [];
  for (const r of recs) {
    if (!r.bodyMarkdown && r.hasAnswer) warnings.push(`- Empty body: ${r.source.path}:${r.source.startLine} “${r.titleText}”`);
    if (r.titleText.length > 140) warnings.push(`- Very long title (${r.titleText.length} chars): ${r.source.path}:${r.source.startLine}`);
    if (r.kind === 'question' && r.tags.length === 0) warnings.push(`- No technology tags: ${r.source.path}:${r.source.startLine} “${r.titleText}”`);
  }
  L.push(...(warnings.length ? warnings : ['_No issues._']), '');
  const prompts = recs.filter((r) => !r.hasAnswer);
  L.push('### Practice prompts without a written answer', '');
  L.push('Shown in All Questions with a “no answer yet” badge; excluded from Quick Revision.', '');
  L.push(...(prompts.length ? prompts.map((r) => `- ${r.source.path}:${r.source.startLine} “${r.titleText}”`) : ['_None._']), '');

  L.push('## Privacy audit (included files only)', '');
  L.push('Flags are for review only — nothing is changed or hidden automatically. Use `exclude` in `site/content.config.ts` or `publish: false` frontmatter to keep a file off the site.', '');
  for (const d of ix.documents) {
    if (!d.privacyFlags.length) continue;
    L.push(`### ${d.path}`, '');
    const byLine = new Map<number, typeof d.privacyFlags>();
    for (const f of d.privacyFlags) byLine.set(f.line, [...(byLine.get(f.line) ?? []), f]);
    for (const [line, fs_] of byLine) {
      L.push(`- \`L${line}\` [${[...new Set(fs_.map((f) => f.rule))].join(', ')}] ${fs_[0].excerpt.replace(/\|/g, '\\|')}`);
    }
    L.push('');
  }
  return L.join('\n');
}
