/**
 * Build-time content pipeline.
 *   npm run content   → .generated/site.json + public/data/{cards,search-index}.json
 *
 * Reads content/topics.ts, content/guides/<topic>/<guide>.ts and
 * content/cheatsheets/*.md. Fails the build on schema errors, unknown or
 * unlisted guides, duplicate ids and broken alsoAsked references.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import MiniSearch from 'minisearch';
import topics from '../content/topics';
import { GuideSchema, type Guide } from '../lib/content/schema';
import { createRenderer, headingsOf, markdownToText } from '../lib/content/render';
import type { Card, CheatSheet, GuideData, QuestionData, SearchDoc, SiteData, TopicData } from '../lib/content/types';
import { SEARCH_OPTIONS } from '../lib/search-options';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(siteDir, 'content');
const errors: string[] = [];
const r = createRenderer();
const WPM = 180;
const minutesOf = (words: number) => Math.max(1, Math.round(words / WPM));
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

// ---- guides -------------------------------------------------------------------
const raw = new Map<string, Guide>();
for (const t of topics) {
  const dir = path.join(contentDir, 'guides', t.slug);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => f.slice(0, -3)) : [];
  for (const f of files) if (!t.guides.includes(f)) errors.push(`content/guides/${t.slug}/${f}.ts is not listed in content/topics.ts`);
  for (const g of t.guides) {
    if (!files.includes(g)) {
      errors.push(`content/topics.ts lists "${t.slug}/${g}" but content/guides/${t.slug}/${g}.ts is missing`);
      continue;
    }
    const mod = await import(pathToFileURL(path.join(dir, `${g}.ts`)).href);
    const res = GuideSchema.safeParse(mod.default);
    if (!res.success) {
      for (const i of res.error.issues) errors.push(`content/guides/${t.slug}/${g}.ts ${i.path.join('.')}: ${i.message}`);
      continue;
    }
    const ids = new Set<string>();
    for (const q of res.data.questions) {
      if (ids.has(q.id)) errors.push(`content/guides/${t.slug}/${g}.ts: duplicate question id "${q.id}"`);
      ids.add(q.id);
    }
    raw.set(`${t.slug}/${g}`, res.data);
  }
}
for (const d of fs.readdirSync(path.join(contentDir, 'guides')))
  if (!topics.some((t) => t.slug === d)) errors.push(`content/guides/${d}/ is not a topic in content/topics.ts`);

const allKeys = new Set([...raw].flatMap(([gk, g]) => g.questions.map((q) => `${gk}/${q.id}`)));
for (const [gk, g] of raw)
  for (const ref of g.alsoAsked ?? []) if (!allKeys.has(ref)) errors.push(`content/guides/${gk}.ts alsoAsked: "${ref}" doesn't exist`);
fail();

const guides: GuideData[] = [];
const cards: Card[] = [];
const search: SearchDoc[] = [];
const topicData: TopicData[] = [];
const titleText = (md: string) => markdownToText(md);

for (const t of topics) {
  const metas = [];
  for (const slug of t.guides) {
    const key = `${t.slug}/${slug}`;
    const g = raw.get(key)!;
    const questions: QuestionData[] = [];
    let wc = 0;
    for (const q of g.questions) {
      const qd: QuestionData = {
        key: `${key}/${q.id}`,
        id: q.id,
        titleHtml: await r.inline(q.question),
        titleText: titleText(q.question),
        snippetHtml: q.snippet ? await r.block(q.snippet) : undefined,
        section: q.section,
        perspective: q.perspective,
        difficulty: q.difficulty,
        frequency: q.frequency,
        tags: q.tags,
        answerHtml: await r.block(q.answer),
        variants: q.variants ? await Promise.all(q.variants.map(async (v) => ({ label: v.label, html: await r.block(v.answer) }))) : undefined,
        analogyHtml: await r.block(q.analogy),
        quickRevisionHtml: await Promise.all(q.quickRevision.map((x) => r.inline(x))),
        deepDiveHtml: q.deepDive ? await r.block(q.deepDive) : undefined,
        avoidHtml: q.avoid ? await Promise.all(q.avoid.map((x) => r.inline(x))) : undefined,
        followUpsHtml: await Promise.all(q.followUps.map((x) => r.inline(x))),
      };
      questions.push(qd);
      const text = [q.answer, q.analogy, ...q.quickRevision, q.deepDive ?? ''].map(markdownToText).join(' ');
      wc += words(qd.titleText) + words(text);
      cards.push({ k: qd.key, g: key, t: qd.titleHtml, s: qd.snippetHtml, d: q.difficulty, f: q.frequency, p: q.perspective, a: qd.answerHtml, r: qd.quickRevisionHtml });
      search.push({ id: qd.key, t: qd.titleText, x: text, g: q.tags.join(' '), c: `${t.label} › ${g.title}`, k: 'question' });
    }
    const difficulty = { easy: 0, medium: 0, hard: 0 };
    for (const q of g.questions) difficulty[q.difficulty]++;
    const meta = { key, topic: t.slug, slug, title: g.title, description: g.description, count: questions.length, minutes: minutesOf(wc), difficulty };
    guides.push({ ...meta, questions, alsoAsked: [] });
    metas.push(meta);
    search.push({ id: `guide:${key}`, t: g.title, x: g.description, g: '', c: t.label, k: 'guide' });
  }
  topicData.push({ slug: t.slug, label: t.label, description: t.description, icon: t.icon, guides: metas, count: metas.reduce((n, m) => n + m.count, 0) });
}
const byKey = new Map(guides.flatMap((g) => g.questions.map((q) => [q.key, { q, g }] as const)));
for (const g of guides)
  g.alsoAsked = (raw.get(g.key)!.alsoAsked ?? []).map((k) => ({ key: k, titleText: byKey.get(k)!.q.titleText, guideTitle: byKey.get(k)!.g.title }));

// ---- cheat sheets -------------------------------------------------------------
const sheetDir = path.join(contentDir, 'cheatsheets');
const sheets: (CheatSheet & { order: number })[] = [];
if (fs.existsSync(sheetDir)) {
  for (const f of fs.readdirSync(sheetDir).filter((f) => f.endsWith('.md'))) {
    const { data, content } = matter(fs.readFileSync(path.join(sheetDir, f), 'utf8'));
    const slug = f.slice(0, -3);
    if (!data.title || !data.description) {
      errors.push(`content/cheatsheets/${f}: frontmatter needs title and description`);
      continue;
    }
    const html = await r.block(content);
    sheets.push({
      slug,
      title: data.title,
      description: data.description,
      icon: data.icon ?? 'file',
      order: data.order ?? 100,
      html,
      headings: headingsOf(html),
      minutes: minutesOf(words(markdownToText(content))),
    });
    search.push({ id: `sheet:${slug}`, t: data.title, x: markdownToText(content), g: '', c: 'Cheat sheet', k: 'sheet' });
  }
}
sheets.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
fail();

// ---- write --------------------------------------------------------------------
const site: SiteData = {
  generatedAt: new Date().toISOString(),
  topics: topicData,
  guides,
  cheatsheets: sheets.map(({ order, ...s }) => s),
};
const outDir = path.join(siteDir, '.generated');
const publicData = path.join(siteDir, 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(publicData, { recursive: true });
fs.writeFileSync(path.join(outDir, 'site.json'), JSON.stringify(site));
fs.writeFileSync(path.join(publicData, 'cards.json'), JSON.stringify(cards));
const ms = new MiniSearch<SearchDoc>(SEARCH_OPTIONS);
ms.addAll(search);
fs.writeFileSync(path.join(publicData, 'search-index.json'), JSON.stringify(ms));

const kb = (f: string) => `${Math.round(fs.statSync(path.join(publicData, f)).size / 1024)} KB`;
console.log(
  `content: ${topicData.length} topics, ${guides.length} guides, ${cards.length} questions, ${sheets.length} cheat sheets ` +
    `(cards.json ${kb('cards.json')}, search ${kb('search-index.json')})`,
);

function fail() {
  if (!errors.length) return;
  console.error(`Content validation failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
