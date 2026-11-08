import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/data';
import { PageHeader, Section } from '@/components/Page';
import { Icon } from '@/components/Icons';
import { Badge } from '@/components/Badges';

export const metadata: Metadata = { title: 'My Collected Questions' };

export default function Collected() {
  const s = site();
  const counts = new Map<string, { q: number; notes: number; rev: number }>();
  for (const q of s.questions) {
    if (q.origin !== 'collected' || !q.source) continue;
    const c = counts.get(q.source.path) ?? { q: 0, notes: 0, rev: 0 };
    if (q.kind === 'question') c.q++;
    else if (q.kind === 'note') c.notes++;
    else c.rev++;
    counts.set(q.source.path, c);
  }
  const total = [...counts.values()].reduce((n, c) => n + c.q, 0);
  const files = s.documents.filter((d) => !d.isIndex).length;

  return (
    <>
      <PageHeader
        title="My Collected Questions"
        description={`${total} questions extracted from ${files} Markdown files in my repository. Every file is shown exactly as written, with links back to GitHub.`}
      >
        <Link href="/questions/?origin=collected" className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-white">
          <Icon name="list" size={16} /> Browse all {total} as a list
        </Link>
      </PageHeader>

      {s.categories
        .filter((c) => c.documentPaths.length)
        .map((c) => {
          const docs = s.documents.filter((d) => d.category === c.slug && !d.isIndex);
          if (!docs.length) return null;
          return (
            <Section key={c.slug} title={c.label} action={<Link href={`/categories/${c.slug}/`} className="text-sm text-accent">Category →</Link>}>
              <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
                {docs.map((d) => {
                  const n = counts.get(d.path) ?? { q: 0, notes: 0, rev: 0 };
                  return (
                    <li key={d.path} className="border-b border-line last:border-0">
                      <Link href={`/source/${d.slug}/`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                        <Icon name="file" size={18} className="shrink-0 text-muted" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] leading-snug">{d.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted">{d.path}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1 sm:flex-row">
                          {n.q > 0 && <Badge tone="accent">{n.q} Q</Badge>}
                          {n.notes > 0 && <Badge>Note</Badge>}
                          {n.rev > 0 && <Badge>Takeaways</Badge>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Section>
          );
        })}
    </>
  );
}
