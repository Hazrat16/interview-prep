import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { site, summaries, categoryLabels } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { QuestionList } from '@/components/QuestionList';
import { Icon } from '@/components/Icons';

export const dynamicParams = false;
export function generateStaticParams() {
  return site().tags.map((t) => ({ tag: t.slug }));
}

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: site().tags.find((t) => t.slug === tag)?.label ?? 'Tag' };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const t = site().tags.find((x) => x.slug === tag);
  if (!t) notFound();
  return (
    <>
      <nav className="mb-2 text-sm text-muted"><Link href="/categories/" className="hover:text-accent">Technologies</Link> /</nav>
      <PageHeader title={t.label} description={`${t.count} questions tagged ${t.label}.`}>
        <Link href={`/revision/?tag=${tag}`} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-white">
          <Icon name="bolt" size={16} /> Revise {t.label}
        </Link>
      </PageHeader>
      <QuestionList items={summaries((q) => q.tags.includes(tag))} categoryLabels={categoryLabels()} />
    </>
  );
}
