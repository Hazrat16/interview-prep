/**
 * Turns one Markdown file into question / note / revision records.
 *
 * The files in this repo do NOT share one format, so a chain of detectors runs
 * over the document. Each top-level node can be claimed by at most one
 * detector; anything unclaimed is reported as "uncovered" (it is still shown in
 * the original-document view, never dropped).
 *
 *   1. qa-heading        "### Q3: Why …"                       (topic notes)
 *   2. table-row         | Question | Short answer |           (question banks)
 *   3. bold-list-item    1. **Question?** answer               (scenario lists)
 *   4. takeaways         ## Key takeaways                      (revision cards)
 *   5. question-heading  any heading ending in "?"
 *   6. bank-heading      leaf heading in a *questions* / *solutions* / companies file
 *   7. prompt-list-item  "- Plain question?" under a questions/practice heading (no answer)
 *   8. whole-document    notesOnly files, or files where nothing above matched
 */
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import picomatch from 'picomatch';
import type { Heading, List, ListItem, Root, RootContent, Table } from 'mdast';
import type {
  CollectedRecord,
  ContentConfig,
  ContentType,
  Detector,
  Difficulty,
  SourceDocument,
} from './types';
import { inferTags } from './tags';
import { scanPrivacy } from './privacy';

const QA_RE = /^Q\d+\s*[:.)\-–—]\s*/i;
const NUMBERING_RE = /^(?:part\s+\d+\s*[—–:-]\s*|\d+[.)]\s+)/i;
const ENDS_WITH_QUESTION_RE = /\?\s*(\([^)]*\))?\s*[\p{Extended_Pictographic}\s]*$/u;
const QUESTION_TABLE_HEADER_RE = /^(questions?|tasks?|prompts?|q|scenarios?)$/i;
const QUESTION_CONTEXT_RE = /\b(questions?|scenarios?|faq|asked)\b/i;
const DIFFICULTY_RULES: [RegExp, Difficulty][] = [
  [/^(easy|basic|beginner|junior)\b/i, 'easy'],
  [/^(medium|intermediate|mid)\b/i, 'medium'],
  [/^(hard|advanced|senior|expert)\b/i, 'hard'],
];

interface HeadingInfo {
  idx: number;
  depth: number;
  text: string; // plain text
  inline: string; // original inline Markdown
  anchor: string;
  line: number;
  end: number; // exclusive child index where this section ends
  firstChildHeading: number; // index of first sub-heading or `end`
  ancestors: HeadingInfo[];
}

export interface ParseInput {
  path: string;
  raw: string;
  config: ContentConfig;
  lastModified?: string;
}

export function parseDocument({ path, raw, config, lastModified }: ParseInput) {
  const fm = matter(raw);
  const content = fm.content;
  const frontmatter = fm.data as Record<string, unknown>;
  const lineOffset = raw.slice(0, raw.length - content.length).split('\n').length - 1;

  const tree = unified().use(remarkParse).use(remarkGfm).parse(content) as Root;
  const children = tree.children;
  const slice = (a: { position?: any }, b: { position?: any } = a) =>
    content.slice(a.position!.start.offset, b.position!.end.offset);
  const lineOf = (n: { position?: any }) => n.position!.start.line + lineOffset;
  const endLineOf = (n: { position?: any }) => n.position!.end.line + lineOffset;
  const inlineRaw = (n: { children?: any[]; position?: any }) =>
    n.children && n.children.length
      ? slice(n.children[0], n.children[n.children.length - 1]).trim()
      : '';

  const segments = path.split('/');
  const fileName = segments[segments.length - 1];
  const category = String(frontmatter.category ?? (segments.length > 1 ? segments[0] : 'general'));
  const isIndex = /^readme\.md$/i.test(fileName);
  const isNote =
    frontmatter.type === 'note' || picomatch.isMatch(path, config.notesOnly, { dot: true });
  const isBankFile = picomatch.isMatch(path, config.headingQuestionFiles, { dot: true });

  // ---- heading tree -------------------------------------------------------
  const anchorSlugger = new GithubSlugger();
  const headings: HeadingInfo[] = [];
  const stack: HeadingInfo[] = [];
  const enclosing: HeadingInfo[][] = []; // per child index
  children.forEach((node, idx) => {
    if (node.type === 'heading') {
      const h = node as Heading;
      while (stack.length && stack[stack.length - 1].depth >= h.depth) stack.pop();
      const text = toString(h).trim();
      const info: HeadingInfo = {
        idx,
        depth: h.depth,
        text,
        inline: inlineRaw(h),
        anchor: anchorSlugger.slug(text),
        line: lineOf(h),
        end: children.length,
        firstChildHeading: children.length,
        ancestors: [...stack],
      };
      headings.push(info);
      stack.push(info);
    }
    enclosing[idx] = [...stack];
  });
  for (const h of headings) {
    for (let j = h.idx + 1; j < children.length; j++) {
      const n = children[j];
      if (n.type !== 'heading') continue;
      if ((n as Heading).depth <= h.depth) {
        h.end = j;
        break;
      }
      if (h.firstChildHeading === children.length) h.firstChildHeading = j;
    }
    // No sub-headings: direct content runs to the end of this section.
    if (h.firstChildHeading > h.end) h.firstChildHeading = h.end;
  }

  const h1 = headings.find((h) => h.depth === 1);
  const title = String(frontmatter.title ?? h1?.text ?? fileName.replace(/\.md$/i, ''));
  const docTags = Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [];
  const docDifficulty = parseDifficulty(String(frontmatter.difficulty ?? ''));

  // ---- record helpers ------------------------------------------------------
  const claimed = new Set<number>();
  const records: CollectedRecord[] = [];
  const idSlugger = new GithubSlugger();
  const baseId = path.replace(/\.md$/i, '');
  const githubBase = `https://github.com/${config.github.repo}/blob/${config.github.branch}/${path}`;

  const sectionPathFor = (stackAt: HeadingInfo[]) =>
    stackAt.filter((h) => h.depth > 1).map((h) => h.text);

  const difficultyFor = (stackAt: HeadingInfo[]): Difficulty | undefined => {
    for (let i = stackAt.length - 1; i >= 0; i--) {
      const d = parseDifficulty(stackAt[i].text);
      if (d) return d;
    }
    return docDifficulty;
  };

  /** Child index range [a, b) without trailing thematic breaks / blank nodes. */
  const trimRange = (a: number, b: number): [number, number] => {
    while (b > a && children[b - 1].type === 'thematicBreak') b--;
    while (a < b && children[a].type === 'thematicBreak') a++;
    return [a, b];
  };

  const push = (r: {
    title: string;
    kind?: CollectedRecord['kind'];
    body: string;
    revisionItems?: string[];
    detector: Detector;
    contentType: ContentType;
    stackAt: HeadingInfo[];
    startLine: number;
    endLine: number;
    anchor?: string;
    revisionEligible?: boolean;
    hasAnswer?: boolean;
  }) => {
    const titleText = stripInlineMarkdown(r.title);
    const sectionPath = sectionPathFor(r.stackAt);
    records.push({
      id: `${baseId}/${idSlugger.slug(titleText.slice(0, 80) || 'item')}`,
      origin: 'collected',
      kind: r.kind ?? 'question',
      title: r.title,
      titleText,
      bodyMarkdown: r.body.trim(),
      revisionItems: r.revisionItems,
      category,
      contentType: r.contentType,
      difficulty: difficultyFor(r.stackAt),
      tags: (() => {
        // Strongest signal first; weaker signals only when nothing matched yet.
        const strong = inferTags(titleText, sectionPath.join(' '));
        const tags = strong.length
          ? strong
          : inferTags(title).length
            ? inferTags(title)
            : inferTags(r.body.slice(0, 400));
        return [...new Set([...docTags, ...tags])];
      })(),
      detector: r.detector,
      source: {
        path,
        startLine: r.startLine,
        endLine: r.endLine,
        anchor: r.anchor,
        githubUrl: r.anchor
          ? `${githubBase}#${r.anchor}`
          : `${githubBase}?plain=1#L${r.startLine}-L${r.endLine}`,
        sectionPath,
      },
      hasAnswer: r.hasAnswer ?? true,
      revisionEligible: (r.revisionEligible ?? false) && (r.hasAnswer ?? true),
    });
  };

  const typeFor = (titleText: string, stackAt: HeadingInfo[], body: string): ContentType => {
    const ctx = stackAt.map((h) => h.text).join(' ');
    if (category === 'companies') return 'company-log';
    if (category === 'career') return 'behavioral';
    if (/system.design/i.test(path) || /system design/i.test(ctx)) return 'system-design';
    if (/scenario/i.test(ctx) || /^(what would you do|how would you handle)/i.test(titleText))
      return 'scenario';
    if (
      /solutions?|coding/i.test(fileName) ||
      /^(write|implement|build|code|create)\b/i.test(titleText) ||
      /output.prediction|live.coding/i.test(ctx)
    )
      return 'coding';
    if (/```/.test(body) && /\b(implement|write|polyfill)\b/i.test(titleText)) return 'coding';
    return 'concept-qa';
  };

  if (!isIndex && !isNote) {
    // 1. qa-heading ----------------------------------------------------------
    for (const h of headings) {
      if (h.depth < 2 || !QA_RE.test(h.text)) continue;
      const [a, b] = trimRange(h.idx + 1, h.firstChildHeading);
      for (let i = h.idx; i < h.end; i++) claimed.add(i);
      if (a >= b) continue;
      const titleInline = h.inline.replace(QA_RE, '');
      const body = slice(children[a], children[b - 1]);
      const stackAt = [...h.ancestors];
      const ctx = stackAt.map((x) => x.text).join(' ');
      push({
        title: titleInline,
        body,
        detector: 'qa-heading',
        contentType: /scenario/i.test(ctx)
          ? 'scenario'
          : typeFor(stripInlineMarkdown(titleInline), stackAt, body),
        stackAt,
        startLine: h.line,
        endLine: endLineOf(children[b - 1]),
        anchor: h.anchor,
        revisionEligible: true,
      });
    }

    // 2. table-row ----------------------------------------------------------
    children.forEach((node, idx) => {
      if (claimed.has(idx) || node.type !== 'table') return;
      const table = node as Table;
      const [headerRow, ...rows] = table.children;
      if (!headerRow || headerRow.children.length < 2) return;
      const headers = headerRow.children.map((c) => toString(c).trim());
      if (!QUESTION_TABLE_HEADER_RE.test(headers[0]) && !/question/i.test(headers[0])) return;
      const stackAt = enclosing[idx];
      const ctx = stackAt.map((h) => h.text).join(' ');
      for (const row of rows) {
        const cells = row.children;
        if (!cells[0] || !toString(cells[0]).trim()) continue;
        const q = inlineRaw(cells[0]);
        const answerParts = cells.slice(1).map((c, i) => ({ h: headers[i + 1], v: inlineRaw(c) }));
        const body =
          answerParts.length === 1
            ? answerParts[0].v
            : answerParts.filter((p) => p.v).map((p) => `**${p.h}:** ${p.v}`).join('\n\n');
        const contentType: ContentType = /^tasks?$/i.test(headers[0])
          ? 'coding'
          : /^prompts?$/i.test(headers[0]) || /system.design/i.test(path)
            ? 'system-design'
            : /scenario/i.test(ctx)
              ? 'scenario'
              : category === 'companies'
                ? 'company-log'
                : 'quick-answer';
        push({
          title: q,
          body,
          detector: 'table-row',
          contentType,
          stackAt,
          startLine: lineOf(row),
          endLine: endLineOf(row),
          revisionEligible: contentType === 'quick-answer' || contentType === 'scenario',
        });
      }
      claimed.add(idx);
    });

    // 3. bold-list-item -----------------------------------------------------
    children.forEach((node, idx) => {
      if (claimed.has(idx) || node.type !== 'list') return;
      const list = node as List;
      const stackAt = enclosing[idx];
      const inQuestionContext = stackAt.some(
        (h) => h.depth > 1 && QUESTION_CONTEXT_RE.test(h.text),
      );
      const hits: { item: ListItem; strong: any }[] = [];
      for (const item of list.children) {
        const first = item.children[0];
        if (first?.type !== 'paragraph') continue;
        const strong = first.children[0];
        if (strong?.type !== 'strong') continue;
        const strongText = toString(strong).trim();
        if (ENDS_WITH_QUESTION_RE.test(strongText) || (inQuestionContext && strongText.length > 8))
          hits.push({ item, strong });
      }
      if (!hits.length) return;
      for (const { item, strong } of hits) {
        const body = content
          .slice(strong.position.end.offset, item.position!.end.offset)
          .replace(/^[\s:—–-]+/, '');
        if (!body.trim()) continue;
        push({
          title: inlineRaw(strong),
          body,
          detector: 'bold-list-item',
          contentType: /scenario/i.test(stackAt.map((h) => h.text).join(' '))
            ? 'scenario'
            : typeFor(toString(strong), stackAt, body),
          stackAt,
          startLine: lineOf(item),
          endLine: endLineOf(item),
          revisionEligible: true,
        });
      }
      if (hits.length * 2 >= list.children.length) claimed.add(idx);
    });

    // 4. takeaways ----------------------------------------------------------
    for (const h of headings) {
      if (!config.revisionHeadings.some((re) => re.test(cleanHeading(h.text)))) continue;
      const [a, b] = trimRange(h.idx + 1, h.end);
      if (a >= b) continue;
      const items: string[] = [];
      for (let i = a; i < b; i++) {
        const n = children[i];
        if (n.type === 'list') for (const li of n.children) items.push(slice(li.children[0], li.children[li.children.length - 1]));
        else if (n.type === 'paragraph' || n.type === 'blockquote') items.push(slice(n).replace(/^>\s?/gm, ''));
        else if (n.type === 'table')
          for (const row of (n as Table).children.slice(1))
            items.push(row.children.map((c) => inlineRaw(c)).filter(Boolean).join(' → '));
      }
      for (let i = h.idx; i < h.end; i++) claimed.add(i);
      push({
        title: `${title} — ${h.text}`,
        kind: 'revision',
        body: slice(children[a], children[b - 1]),
        revisionItems: items.map((s) => s.trim()).filter(Boolean),
        detector: 'takeaways',
        contentType: 'concept-qa',
        stackAt: [...h.ancestors, h],
        startLine: h.line,
        endLine: endLineOf(children[b - 1]),
        anchor: h.anchor,
        revisionEligible: true,
      });
    }

    // 5 + 6. question-heading / bank-heading --------------------------------
    for (const h of headings) {
      if (h.depth < 2 || claimed.has(h.idx)) continue;
      const clean = cleanHeading(h.text);
      if (config.structuralHeadings.some((re) => re.test(clean))) continue;
      const isLeaf = h.firstChildHeading >= h.end;
      const endsQ = ENDS_WITH_QUESTION_RE.test(h.text);
      const isOverview = config.bankOverviewHeadings.some((re) => re.test(clean.replace(/\s*\([^)]*\)\s*$/, '')));
      if (!endsQ && !(isBankFile && isLeaf && !isOverview)) continue;

      // Prefer the whole subtree; fall back to direct content if parts are claimed.
      let [a, b] = trimRange(h.idx + 1, h.end);
      const subtreeClaimed = range(a, b).some((i) => claimed.has(i));
      if (subtreeClaimed) [a, b] = trimRange(h.idx + 1, h.firstChildHeading);
      if (a >= b || range(a, b).some((i) => claimed.has(i))) continue;

      for (let i = h.idx; i < (subtreeClaimed ? h.firstChildHeading : h.end); i++) claimed.add(i);
      const titleInline = h.inline.replace(NUMBERING_RE, '');
      const body = slice(children[a], children[b - 1]);
      push({
        title: titleInline,
        body,
        detector: endsQ ? 'question-heading' : 'bank-heading',
        contentType: typeFor(stripInlineMarkdown(titleInline), h.ancestors, body),
        stackAt: h.ancestors,
        startLine: h.line,
        endLine: endLineOf(children[b - 1]),
        anchor: h.anchor,
        revisionEligible: endsQ && body.length < 1200,
      });
    }
  }

  // 7. prompt-list-item ---------------------------------------------------
  if (!isIndex && !isNote) {
    children.forEach((node, idx) => {
      if (claimed.has(idx) || node.type !== 'list') return;
      const stackAt = enclosing[idx];
      const h = stackAt.at(-1);
      if (!h || h.depth < 2) return;
      const clean = cleanHeading(h.text);
      if (config.structuralHeadings.some((re) => re.test(clean))) return; // e.g. "Questions to ask"
      if (!config.practicePromptHeadings.some((re) => re.test(clean))) return;
      // "Mock / practice" lists are all prompts; plain "questions" lists need a "?".
      const acceptAll = /\b(mock|practice)\b/i.test(clean);
      const items = (node as List).children.filter(
        (li) =>
          li.children.length === 1 &&
          li.children[0].type === 'paragraph' &&
          (acceptAll || ENDS_WITH_QUESTION_RE.test(toString(li).trim())),
      );
      if (!items.length) return;
      for (const li of items) {
        const q = inlineRaw(li.children[0] as any);
        push({
          title: q,
          body: '',
          detector: 'prompt-list-item',
          contentType: typeFor(stripInlineMarkdown(q), stackAt, ''),
          stackAt,
          startLine: lineOf(li),
          endLine: endLineOf(li),
          hasAnswer: false,
        });
      }
      if (items.length * 2 >= (node as List).children.length) claimed.add(idx);
    });
  }

  // 8. whole-document --------------------------------------------------------
  const hasQuestions = records.some((r) => r.kind === 'question');
  if (!isIndex && (isNote || !hasQuestions)) {
    if (isNote) records.length = 0;
    const firstContent = h1 ? h1.idx + 1 : 0;
    if (firstContent < children.length) {
      push({
        title,
        kind: 'note',
        body: slice(children[firstContent], children[children.length - 1]),
        detector: 'whole-document',
        contentType: category === 'career' ? 'behavioral' : 'note',
        stackAt: [],
        startLine: lineOf(children[firstContent]),
        endLine: endLineOf(children[children.length - 1]),
        anchor: undefined,
      });
      for (let i = 0; i < children.length; i++) claimed.add(i);
    }
  }

  // ---- uncovered sections (reported, still visible in the document view) ----
  const uncovered: SourceDocument['uncovered'] = [];
  if (!isIndex) {
    let current: { heading: string; startLine: number; endLine: number } | null = null;
    children.forEach((node, idx) => {
      const skip =
        claimed.has(idx) ||
        node.type === 'thematicBreak' ||
        (node.type === 'heading' && (node as Heading).depth === 1) ||
        (h1 && idx > h1.idx && idx < (headings.find((x) => x.depth > 1)?.idx ?? 0)); // file intro
      if (node.type === 'heading') {
        if (current) uncovered.push(current);
        current = null;
      }
      if (skip) return;
      const heading = enclosing[idx].at(-1)?.text ?? '(top of file)';
      if (node.type === 'heading') return; // only count real content under it
      if (current && current.heading === heading) current.endLine = endLineOf(node);
      else {
        if (current) uncovered.push(current);
        current = { heading, startLine: lineOf(node), endLine: endLineOf(node) };
      }
    });
    if (current) uncovered.push(current);
  }

  const doc: SourceDocument = {
    path,
    title,
    category,
    isIndex,
    isNote,
    frontmatter,
    rawMarkdown: raw,
    lineCount: raw.split('\n').length,
    lastModified,
    headings: headings.map((h) => ({ depth: h.depth, text: h.text, anchor: h.anchor, line: h.line })),
    recordIds: records.map((r) => r.id),
    uncovered,
    privacyFlags: scanPrivacy(raw, config.privacy.flagTerms),
  };

  const intro =
    h1 && children[h1.idx + 1]?.type === 'paragraph' ? slice(children[h1.idx + 1]) : undefined;

  return { doc, records, intro };
}

function range(a: number, b: number) {
  return Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
}

function cleanHeading(text: string) {
  return text.replace(NUMBERING_RE, '').replace(/^\d+\)\s*/, '').trim();
}

function parseDifficulty(text: string): Difficulty | undefined {
  for (const [re, d] of DIFFICULTY_RULES) if (re.test(text.trim())) return d;
  return undefined;
}

export function stripInlineMarkdown(s: string) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type { RootContent };
