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
      <PageHeader title="Topics" description="Pick a topic, read a guide, then test yourself on it." />
      <div className="grid gap-3 sm:grid-cols-2">
        {topics().map((t) => (
          <Link key={t.slug} href={`/${t.slug}/`} className="group rounded-2xl border border-line bg-surface p-4 hover:border-accent">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon name={t.icon as IconName} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold group-hover:text-accent">{t.label}</h2>
                <p className="text-xs text-muted">
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
