import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { site, category, summaries, categoryLabels } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { QuestionList } from '@/components/QuestionList';
import { Icon } from '@/components/Icons';

export const dynamicParams = false;
export function generateStaticParams() {
  return site().categories.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: category(slug)?.label ?? 'Category' };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const c = category(slug);
  if (!c) notFound();
  const docs = site().documents.filter((d) => d.category === slug && !d.isIndex);
  const readme = site().documents.find((d) => d.category === slug && d.isIndex);
  return (
    <>
      <nav className="mb-2 text-sm text-muted"><Link href="/categories/" className="hover:text-accent">Categories</Link> /</nav>
      <PageHeader title={c.label} description={c.introHtml ? <span dangerouslySetInnerHTML={{ __html: c.introHtml }} /> : undefined}>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/revision/?cat=${slug}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-white">
            <Icon name="bolt" size={16} /> Revise {c.label}
          </Link>
          {readme && (
            <Link href={`/source/${readme.slug}/`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm">
              <Icon name="file" size={16} /> Folder README
            </Link>
          )}
        </div>
      </PageHeader>
      {docs.length > 0 && (
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {docs.map((d) => (
            <Link key={d.path} href={`/source/${d.slug}/`} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm hover:border-accent">
              <Icon name="file" size={14} className="text-muted" />
              {d.title}
            </Link>
          ))}
        </div>
      )}
      <QuestionList items={summaries((q) => q.category === slug)} categoryLabels={categoryLabels()} showCategoryFilter={false} />
    </>
  );
}
