import matter from 'gray-matter';
import MiniSearch from 'minisearch';
import type { ContentConfig, ContentIndex, ContentType } from './types';
import type { LoadedCurated, LoadedEnrichments } from './curated';
import type { Perspective } from './curated-schema';
import type {
  QuestionSummary,
  RevisionCard,
  SearchDoc,
  SiteCategory,
  SiteData,
  SiteDocument,
  SiteQuestion,
} from './site-types';
import { createRenderer, docSlug, markdownToText } from './render';
import { linkDuplicates, link } from './dedupe';
import { tagLabel } from './tags';
import { SEARCH_OPTIONS } from '../search-options';
import { toSummary } from '../summary';

const PERSPECTIVE_TYPE: Record<Perspective, ContentType> = {
  concept: 'concept-qa',
  practical: 'concept-qa',
  'trade-off': 'concept-qa',
  debugging: 'scenario',
  scenario: 'scenario',
  coding: 'coding',
  design: 'system-design',
  behavioral: 'behavioral',
};
const FREQ_RANK = { 'very-high': 0, high: 1, medium: 2 } as const;

export async function buildSite(opts: {
  index: ContentIndex;
  curated: LoadedCurated[];
  enrichments: LoadedEnrichments;
  config: ContentConfig;
  basePath: string;
}) {
  const { index, curated, enrichments, config, basePath } = opts;
  const warnings: string[] = [];
  const githubBlob = `https://github.com/${config.github.repo}/blob/${config.github.branch}`;
  const categorySlugs = new Set([
    ...index.categories.map((c) => c.slug),
    ...curated.map((q) => q.category),
  ]);
  const renderer = createRenderer({
    basePath,
    githubBlob,
    publishedDocs: new Set(index.documents.map((d) => d.path)),
    categories: categorySlugs,
  });
  // Salary placeholders (XXXX/YYYY/ZZZZ) are highlighted so they're obviously "fill me in".
  const mark = (html: string) => html.replace(/(?<![\w-])(XXXX|YYYY|ZZZZ)(?![\w-])/g, '<mark class="ph">$1</mark>');
  const render = {
    block: async (md: string, from?: string, frag?: boolean) => mark(await renderer.block(md, from, frag)),
    inline: async (md: string, from?: string) => mark(await renderer.inline(md, from)),
  };

  // ---- documents ----------------------------------------------------------
  const documents: SiteDocument[] = [];
  for (const d of index.documents) {
    documents.push({
      path: d.path,
      slug: docSlug(d.path),
      title: d.title,
      category: d.category,
      isIndex: d.isIndex,
      isNote: d.isNote,
      html: await render.block(matter(d.rawMarkdown).content, d.path),
      headings: d.headings,
      lineCount: d.lineCount,
      lastModified: d.lastModified,
      recordIds: d.recordIds,
      githubUrl: `${githubBlob}/${d.path}`,
    });
  }

  // ---- collected records ----------------------------------------------------
  const questions: SiteQuestion[] = [];
  for (const r of index.records) {
    const e = r.kind === 'question' ? enrichments.byId.get(r.id) : undefined;
    questions.push({
      id: r.id,
      origin: 'collected',
      kind: r.kind,
      titleText: r.titleText,
      titleHtml: await render.inline(r.title, r.source.path),
      bodyHtml: await render.block(r.bodyMarkdown, r.source.path, true),
      category: r.category,
      contentType: r.contentType,
      difficulty: r.difficulty ?? e?.difficulty,
      frequency: e?.frequency,
      tags: e?.tags ? [...new Set([...r.tags, ...e.tags])] : r.tags,
      hasAnswer: r.hasAnswer || !!e?.answer,
      revisionEligible: r.revisionEligible || !!e,
      prep: e
        ? {
            file: e.file,
            answerHtml: e.answer ? await render.block(e.answer) : undefined,
            analogyHtml: await render.block(e.analogy),
            quickRevisionHtml: await Promise.all(e.quickRevision.map((x) => render.inline(x))),
            followUpsHtml: await Promise.all(e.followUps.map((x) => render.inline(x))),
            deepDiveHtml: e.deepDive ? await render.block(e.deepDive) : undefined,
            avoidHtml: e.avoid ? await Promise.all(e.avoid.map((x) => render.inline(x))) : undefined,
          }
        : undefined,
      detector: r.detector,
      source: { ...r.source, docSlug: docSlug(r.source.path) },
      revisionItemsHtml: r.revisionItems
        ? await Promise.all(r.revisionItems.map((x) => render.inline(x, r.source.path)))
        : undefined,
      relatedIds: [],
    });
  }

  // ---- curated --------------------------------------------------------------
  for (const [order, q] of curated.entries()) {
    questions.push({
      id: `faq/${q.id}`,
      origin: 'curated',
      kind: 'question',
      titleText: q.question.replace(/[`*_]/g, ''),
      titleHtml: await render.inline(q.question),
      bodyHtml: await render.block(q.answer),
      category: q.category,
      contentType: PERSPECTIVE_TYPE[q.perspective],
      perspective: q.perspective,
      difficulty: q.difficulty,
      frequency: q.frequency,
      tags: q.tags,
      hasAnswer: true,
      revisionEligible: true,
      detector: 'curated',
      curated: {
        file: q.file,
        analogyHtml: await render.block(q.analogy),
        quickRevisionHtml: await Promise.all(q.quickRevision.map((x) => render.inline(x))),
        followUpsHtml: await Promise.all(q.followUps.map((x) => render.inline(x))),
        deepDiveHtml: q.deepDive ? await render.block(q.deepDive) : undefined,
        section: q.section,
        order,
        variantsHtml: q.variants
          ? await Promise.all(q.variants.map(async (v) => ({ label: v.label, html: await render.block(v.answer) })))
          : undefined,
        avoidHtml: q.avoid ? await Promise.all(q.avoid.map((x) => render.inline(x))) : undefined,
      },
      relatedIds: [],
    });
  }

  // ---- duplicates across collected + curated (nothing removed) ----------------
  const byId = new Map(questions.map((q) => [q.id, q]));
  const qOnly = questions.filter((q) => q.kind === 'question');
  const items = qOnly.map((q) => ({
    id: q.id,
    titleText: q.titleText,
    path: q.source?.path ?? q.curated!.file,
    detector: q.detector ?? '',
  }));
  const { groups } = linkDuplicates(items as any[]);
  items.forEach((it: any, i) => {
    qOnly[i].duplicateGroup = it.duplicateGroup;
    qOnly[i].relatedIds = it.relatedIds ?? [];
  });
  for (const q of curated) {
    for (const rid of q.relatedCollected ?? []) {
      const target = byId.get(rid);
      if (!target) {
        warnings.push(`curated "${q.id}" relatedCollected → unknown id "${rid}"`);
        continue;
      }
      link(byId.get(`faq/${q.id}`)!, rid);
      link(target, `faq/${q.id}`);
    }
  }

  // ---- ordering: category order → curated (by frequency) → collected (file order) ----
  const catOrder = (slug: string) => config.categories[slug]?.order ?? 100;
  questions.sort(
    (a, b) =>
      catOrder(a.category) - catOrder(b.category) ||
      a.category.localeCompare(b.category) ||
      (a.origin === b.origin ? 0 : a.origin === 'curated' ? -1 : 1) ||
      (a.frequency && b.frequency ? FREQ_RANK[a.frequency] - FREQ_RANK[b.frequency] : 0) ||
      (a.source && b.source
        ? a.source.path.localeCompare(b.source.path) || a.source.startLine - b.source.startLine
        : 0),
  );

  // ---- categories & tags -----------------------------------------------------
  const intros = new Map(index.categories.map((c) => [c.slug, c.intro]));
  const categories: SiteCategory[] = [];
  for (const slug of categorySlugs) {
    const src = index.categories.find((c) => c.slug === slug);
    const qs = questions.filter((q) => q.category === slug && q.kind === 'question');
    const intro = intros.get(slug);
    categories.push({
      slug,
      label: config.categories[slug]?.label ?? src?.label ?? slug,
      order: catOrder(slug),
      introHtml: intro ? await render.inline(intro, `${slug}/README.md`) : undefined,
      documentPaths: src?.documentPaths ?? [],
      questionCount: qs.length,
      collectedCount: qs.filter((q) => q.origin === 'collected').length,
      curatedCount: qs.filter((q) => q.origin === 'curated').length,
    });
  }
  categories.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

  const tagCounts = new Map<string, number>();
  for (const q of questions)
    if (q.kind === 'question') for (const t of q.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const tags = [...tagCounts.entries()]
    .map(([slug, count]) => ({ slug, label: tagLabel(slug), count }))
    .sort((a, b) => b.count - a.count);

  const site: SiteData = {
    generatedAt: new Date().toISOString(),
    categories,
    tags,
    documents,
    questions,
    duplicateGroups: groups.map((g) => ({ id: g.id, recordIds: g.recordIds })),
  };

  // ---- browser payloads --------------------------------------------------------
  const groupSize = new Map(groups.map((g) => [g.id, g.recordIds.length]));
  const summaries: QuestionSummary[] = questions
    .filter((q) => q.kind === 'question')
    .map((q) => toSummary(q, q.duplicateGroup ? groupSize.get(q.duplicateGroup) ?? 1 : 1));

  const cards: RevisionCard[] = [];
  for (const q of questions) {
    if (!q.revisionEligible) continue;
    if (q.kind === 'revision') {
      cards.push({
        id: q.id,
        kind: 'takeaways',
        q: q.titleHtml,
        a: `<ul>${(q.revisionItemsHtml ?? []).map((x) => `<li>${x}</li>`).join('')}</ul>`,
        c: q.category,
        o: q.origin,
        g: q.tags,
      });
    } else if (q.kind === 'question' && (q.curated || q.prep)) {
      const p = (q.curated ?? q.prep)!;
      cards.push({
        id: q.id,
        kind: 'points',
        q: q.titleHtml,
        a: `<ul>${p.quickRevisionHtml.map((x) => `<li>${x}</li>`).join('')}</ul>`,
        c: q.category,
        o: q.origin,
        g: q.tags,
        d: q.difficulty,
      });
    } else if (q.kind === 'question') {
      cards.push({ id: q.id, kind: 'qa', q: q.titleHtml, a: q.bodyHtml, c: q.category, o: q.origin, g: q.tags, d: q.difficulty });
    }
  }

  const catLabel = new Map(categories.map((c) => [c.slug, c.label]));
  const searchDocs: SearchDoc[] = [];
  const raw = new Map<string, string>();
  for (const r of index.records) {
    const e = enrichments.byId.get(r.id);
    raw.set(r.id, [r.bodyMarkdown, e?.answer, e?.analogy, e?.quickRevision.join(' '), e?.followUps.join(' ')].filter(Boolean).join('\n'));
  }
  for (const q of curated)
    raw.set(
      `faq/${q.id}`,
      [q.answer, q.analogy, q.quickRevision.join(' '), q.followUps.join(' '), ...(q.variants ?? []).map((v) => v.answer)].join('\n'),
    );
  for (const q of questions) {
    if (q.kind === 'revision') continue;
    searchDocs.push({
      id: q.id,
      t: q.titleText,
      x: markdownToText(raw.get(q.id) ?? '').slice(0, 2000),
      g: q.tags.map(tagLabel).join(' '),
      c: catLabel.get(q.category) ?? q.category,
      k: q.kind === 'note' ? 'note' : 'question',
      o: q.origin,
      y: q.contentType,
    });
  }
  for (const d of documents) {
    if (d.isIndex) continue;
    searchDocs.push({
      id: `doc:${d.slug}`,
      t: d.title,
      x: d.headings.map((h) => h.text).join(' · '),
      g: '',
      c: catLabel.get(d.category) ?? d.category,
      k: 'doc',
    });
  }
  const ms = new MiniSearch<SearchDoc>(SEARCH_OPTIONS);
  ms.addAll(searchDocs);

  return { site, summaries, cards, searchIndex: JSON.stringify(ms), warnings };
}
