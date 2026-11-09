import type { Metadata } from 'next';
import Link from 'next/link';
import { topics } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { Icon, type IconName } from '@/components/Icons';
import { TopicProgress } from '@/components/ProgressClient';

export const metadata: Metadata = { title: 'Topics' };

export default function TopicsPage() {
  return (
    <>
      <PageHeader eyebrow="Index" title="Topics" description="Pick a topic, read a guide, then test yourself on it." />
      <div className="stagger grid gap-3 sm:grid-cols-2">
        {topics().map((t, i) => (
          <Link key={t.slug} href={`/${t.slug}/`} className="lift group relative rounded-2xl border border-line bg-surface p-4 hover:border-accent">
            <span className="pointer-events-none absolute right-4 top-3 font-display text-4xl font-semibold italic leading-none text-rule tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md border border-line bg-bg text-ink">
                <Icon name={t.icon as IconName} size={20} />
              </span>
              <div className="min-w-0 flex-1 pr-10">
                <h2 className="text-xl font-semibold leading-tight group-hover:text-accent">{t.label}</h2>
                <p className="eyebrow text-[10px] text-muted">
                  {t.guides.length} guides · {t.count} questions
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted">{t.description}</p>
            <div className="mt-3">
              <TopicProgress prefix={t.slug} total={t.count} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
