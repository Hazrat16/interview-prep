/**
 * Markdown → HTML at build time (no Markdown or highlighting JS ships to the
 * browser). Relative links between your .md files are rewritten to site
 * routes; links to files that aren't published point to GitHub instead.
 */
import path from 'node:path';
import { unified, type Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { toString as mdToString } from 'mdast-util-to-string';
import type { Element, Root as HastRoot } from 'hast';

export interface LinkContext {
  basePath: string;
  githubBlob: string; // https://github.com/<repo>/blob/<branch>
  publishedDocs: Set<string>; // repo-relative .md paths that have a page
  categories: Set<string>;
}

interface FileData {
  fromPath?: string;
  isFragment?: boolean;
}

function rehypeRewriteLinks(ctx: LinkContext) {
  return (tree: HastRoot, vfile: { data: unknown }) => {
    const file = vfile as { data: FileData };
    const from = file.data.fromPath;
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && typeof node.properties?.href === 'string') {
        const href = node.properties.href;
        if (/^(https?:|mailto:)/i.test(href)) {
          node.properties.target = '_blank';
          node.properties.rel = ['noopener', 'noreferrer'];
          return;
        }
        if (href.startsWith('#')) {
          // In-file anchor: from an extracted answer, point at the full document.
          if (from && file.data.isFragment) node.properties.href = docUrl(ctx, from) + href;
          return;
        }
        if (!from) return;
        node.properties.href = resolveRelative(ctx, from, href);
      }
      if (node.tagName === 'img' && typeof node.properties?.src === 'string' && from) {
        const src = node.properties.src;
        if (!/^(https?:|data:)/i.test(src)) {
          const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), src));
          node.properties.src = `${ctx.githubBlob.replace('/blob/', '/raw/')}/${target}`;
        }
        node.properties.loading = 'lazy';
      }
    });
  };
}

export function docSlug(mdPath: string) {
  return mdPath.replace(/\.(md|markdown)$/i, '');
}

function docUrl(ctx: LinkContext, mdPath: string) {
  return `${ctx.basePath}/source/${docSlug(mdPath)}/`;
}

function resolveRelative(ctx: LinkContext, from: string, href: string) {
  const [rawTarget, hash] = href.split('#');
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), rawTarget));
  const anchor = hash ? `#${hash}` : '';
  if (/\.(md|markdown)$/i.test(target)) {
    return ctx.publishedDocs.has(target)
      ? docUrl(ctx, target) + anchor
      : `${ctx.githubBlob}/${target}${anchor}`;
  }
  const folder = target.replace(/\/$/, '');
  if (ctx.categories.has(folder)) return `${ctx.basePath}/categories/${folder}/`;
  return `${ctx.githubBlob}/${target}${anchor}`;
}

export function createRenderer(ctx: LinkContext) {
  const block = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeRewriteLinks, ctx)
    .use(rehypePrettyCode, {
      theme: { light: 'github-light', dark: 'github-dark-dimmed' },
      keepBackground: false,
      defaultLang: { block: 'text', inline: 'plaintext' },
      bypassInlineCode: true,
    })
    .use(rehypeStringify) as unknown as Processor;

  const inline = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeRewriteLinks, ctx)
    .use(rehypeStringify) as unknown as Processor;

  const cache = new Map<string, string>();

  return {
    /** Full Markdown block (answers, documents). */
    async block(md: string, fromPath?: string, isFragment = false): Promise<string> {
      if (!md.trim()) return '';
      const key = `${fromPath}|${isFragment}|${md}`;
      const hit = cache.get(key);
      if (hit) return hit;
      const file = await block.process({ value: md, data: { fromPath, isFragment } });
      const html = String(file);
      cache.set(key, html);
      return html;
    },
    /** One line of inline Markdown (titles, bullet points) without the <p>. */
    async inline(md: string, fromPath?: string): Promise<string> {
      const file = await inline.process({ value: md, data: { fromPath, isFragment: true } });
      return String(file).trim().replace(/^<p>([\s\S]*)<\/p>$/, '$1');
    },
  };
}

/** Plain text for search indexing. */
export function markdownToText(md: string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(md);
  return mdToString(tree).replace(/\s+/g, ' ').trim();
}
