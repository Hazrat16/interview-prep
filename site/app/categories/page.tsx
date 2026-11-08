import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/data';
import { PageHeader, Section } from '@/components/Page';

export const metadata: Metadata = { title: 'Categories' };

export default function Categories() {
  const s = site();
  return (
    <>
      <PageHeader title="Categories" description="Browse by topic folder or by technology." />
      <Section title="Topics">
        <div className="grid gap-3 sm:grid-cols-2">
          {s.categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}/`} className="rounded-2xl border border-line bg-surface p-5 hover:border-accent">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-medium">{c.label}</span>
                <span className="text-sm tabular-nums text-muted">{c.questionCount}</span>
              </div>
              {c.introHtml && <p className="md-inline mt-1 line-clamp-2 text-sm text-muted" dangerouslySetInnerHTML={{ __html: c.introHtml }} />}
              <div className="mt-3 flex gap-3 text-xs text-muted">
                {c.collectedCount > 0 && <span className="text-collected">{c.collectedCount} from my notes</span>}
                {c.curatedCount > 0 && <span className="text-curated">{c.curatedCount} curated</span>}
                {c.documentPaths.length > 0 && <span>{c.documentPaths.filter((p) => !/readme\.md$/i.test(p)).length} files</span>}
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <Section title="Technologies">
        <div className="flex flex-wrap gap-2">
          {s.tags.map((t) => (
            <Link key={t.slug} href={`/tags/${t.slug}/`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm hover:border-accent">
              {t.label}
              <span className="text-xs tabular-nums text-muted">{t.count}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
