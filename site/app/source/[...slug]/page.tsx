import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { site, documentBySlug, question, categoryLabels } from '@/lib/data';
import { Html } from '@/components/Html';
import { Badge } from '@/components/Badges';
import { Icon } from '@/components/Icons';

export const dynamicParams = false;
export function generateStaticParams() {
  return site().documents.map((d) => ({ slug: d.slug.split('/') }));
}

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: documentBySlug(slug.join('/'))?.title ?? 'Note' };
}

export default async function SourcePage({ params }: Props) {
  const { slug } = await params;
  const d = documentBySlug(slug.join('/'));
  if (!d) notFound();
  const labels = categoryLabels();
  const recs = d.recordIds.map((id) => question(id)).filter(Boolean);
  const qs = recs.filter((r) => r!.kind === 'question');
  const toc = d.headings.filter((h) => h.depth === 2);

  return (
    <article>
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/collected/" className="hover:text-accent">My notes</Link>
        <span>/</span>
        <Link href={`/categories/${d.category}/`} className="hover:text-accent">{labels[d.category] ?? d.category}</Link>
      </nav>

      <div className="mb-6 rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <Icon name="file" size={16} />
          <span className="font-mono text-xs">{d.path}</span>
          <span>· {d.lineCount} lines</span>
          {d.lastModified && (
            <span>· updated {new Date(d.lastModified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {qs.length > 0 && <Badge tone="accent">{qs.length} questions extracted</Badge>}
          {d.isNote && <Badge>Note</Badge>}
          <a href={d.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-accent">
            View on GitHub <Icon name="external" size={13} />
          </a>
        </div>
        {toc.length > 2 && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-muted">Contents ({toc.length})</summary>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {toc.map((h) => (
                <li key={h.anchor}><a href={`#${h.anchor}`} className="hover:text-accent">{h.text}</a></li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <Html html={d.html} className="sm:prose-base" />

      {qs.length > 0 && (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="mb-3 text-lg font-semibold">Questions from this file</h2>
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {qs.map((r) => (
              <li key={r!.id} className="border-b border-line last:border-0">
                <Link href={`/q/${r!.id}/`} className="flex items-baseline gap-3 px-4 py-2.5 hover:bg-surface-2">
                  <span className="w-10 shrink-0 font-mono text-xs text-muted">L{r!.source!.startLine}</span>
                  <span className="text-[15px]">{r!.titleText}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
