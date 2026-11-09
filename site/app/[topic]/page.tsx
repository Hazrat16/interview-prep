import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { topic, topics } from '@/lib/data';
import { minutes } from '@/lib/labels';
import { Icon, type IconName } from '@/components/Icons';
import { GuideGrid } from '@/components/GuideCards';
import { TopicProgress } from '@/components/ProgressClient';
import { careerProfile } from '@/content/career-profile';

export const dynamicParams = false;
export function generateStaticParams() {
  return topics().map((t) => ({ topic: t.slug }));
}
type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = topic((await params).topic);
  return { title: t?.label, description: t?.description };
}

export default async function TopicPage({ params }: Props) {
  const t = topic((await params).topic);
  if (!t) notFound();
  const mins = t.guides.reduce((n, g) => n + g.minutes, 0);
  return (
    <>
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <Icon name={t.icon as IconName} size={22} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.label}</h1>
        </div>
        <p className="max-w-2xl text-[15px] text-muted">{t.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>{t.guides.length} guides</span>
          <span>{t.count} questions</span>
          <span>~{minutes(mins)} reading</span>
        </div>
        <div className="mt-4 max-w-md">
          <TopicProgress prefix={t.slug} total={t.count} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/quiz/?topic=${t.slug}`} className="press inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white">
            <Icon name="cards" size={16} /> Quiz this topic
          </Link>
          <Link href={`/interview/?topic=${t.slug}`} className="press inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium hover:border-accent">
            <Icon name="timer" size={16} /> Mock interview
          </Link>
        </div>
      </header>

      {t.slug === 'career' && (
        <section className="mb-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">My profile at a glance</h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {careerProfile.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-muted">{f.label}</dt>
                <dd className="text-sm font-medium">{f.value}</dd>
                <dd className="text-xs text-muted">{f.detail}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
            {careerProfile.proofPoints.map((p) => (
              <li key={p} className="flex gap-2">
                <Icon name="check" size={16} className="mt-0.5 shrink-0 text-easy" />
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      <GuideGrid guides={t.guides} numbered />
    </>
  );
}
