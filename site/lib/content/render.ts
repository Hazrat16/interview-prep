/**
 * Markdown → HTML at build time (no Markdown or highlighting JS ships to the
 * browser). External links open in a new tab.
 */
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

function rehypeLinks() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      const href = node.properties?.href;
      if (node.tagName === 'a' && typeof href === 'string' && /^(https?:|mailto:)/i.test(href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
      if (node.tagName === 'img') node.properties.loading = 'lazy';
    });
  };
}

export function createRenderer() {
  const block = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeLinks)
    .use(rehypePrettyCode, {
      theme: { light: 'github-light', dark: 'github-dark-dimmed' },
      keepBackground: false,
      defaultLang: { block: 'text', inline: 'plaintext' },
      bypassInlineCode: true,
    })
    .use(rehypeStringify) as unknown as Processor;

  const inline = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeLinks).use(rehypeStringify) as unknown as Processor;

  const cache = new Map<string, string>();

  return {
    /** Full Markdown block (answers, cheat sheets). */
    async block(md: string): Promise<string> {
      if (!md.trim()) return '';
      const hit = cache.get(md);
      if (hit) return hit;
      const html = String(await block.process(md));
      cache.set(md, html);
      return html;
    },
    /** One line of inline Markdown (titles, bullet points) without the <p>. */
    async inline(md: string): Promise<string> {
      const html = String(await inline.process(md));
      return html.trim().replace(/^<p>([\s\S]*)<\/p>$/, '$1');
    },
  };
}

/** Plain text for search indexing and word counts. */
export function markdownToText(md: string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(md);
  return mdToString(tree).replace(/\s+/g, ' ').trim();
}

/** Heading list (h2/h3) for a cheat sheet's table of contents. */
export function headingsOf(html: string) {
  const out: { depth: number; text: string; id: string }[] = [];
  for (const m of html.matchAll(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g))
    out.push({ depth: Number(m[1]), id: m[2], text: decodeEntities(m[3].replace(/<[^>]+>/g, '')) });
  return out;
}

function decodeEntities(s: string) {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (named[e] ?? m),
  );
}
