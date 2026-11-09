import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guide, neighbours, site, topic } from '@/lib/data';
import type { QuestionData } from '@/lib/content/types';
import { minutes } from '@/lib/labels';
import { Icon } from '@/components/Icons';
import { DifficultyBar } from '@/components/Badges';
import { QuestionItem } from '@/components/QuestionView';
import { GuideProgress, GuideShell, PracticeToggle } from '@/components/QuestionClient';
import { questionHref } from '@/lib/paths';

export const dynamicParams = false;
export function generateStaticParams() {
  return site().guides.map((g) => ({ topic: g.topic, guide: g.slug }));
}
type Props = { params: Promise<{ topic: string; guide: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const g = guide(`${p.topic}/${p.guide}`);
  return { title: g ? `${g.title} interview questions` : 'Guide', description: g?.description };
}

/** Consecutive questions grouped by their optional section heading. */
function groups(qs: QuestionData[]) {
  const out: { section?: string; items: { q: QuestionData; n: number }[] }[] = [];
  qs.forEach((q, i) => {
    const last = out[out.length - 1];
    if (last && last.section === q.section) last.items.push({ q, n: i + 1 });
    else out.push({ section: q.section, items: [{ q, n: i + 1 }] });
  });
  return out;
}

export default async function GuidePage({ params }: Props) {
  const p = await params;
  const g = guide(`${p.topic}/${p.guide}`);
  const t = topic(p.topic);
  if (!g || !t) notFound();
  const { prev, next } = neighbours(g.key);
  const sections = groups(g.questions);
  const career = g.topic === 'career';

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-8">
      <article className="min-w-0">
        <header className="mb-6">
          <nav className="mb-3 flex items-center gap-1 text-sm text-muted">
            <Link href={`/${t.slug}/`} className="hover:text-accent">
              {t.label}
            </Link>
            <span aria-hidden>›</span>
            <span className="truncate">{g.title}</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{g.title}</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-muted">{g.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="list" size={15} /> {g.count} questions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={15} /> ~{minutes(g.minutes)}
            </span>
            <span className="w-28">
              <DifficultyBar mix={g.difficulty} />
            </span>
          </div>
          <div className="mt-4 max-w-md">
            <GuideProgress keys={g.questions.map((q) => q.key)} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/quiz/?guide=${g.key}`} className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-sm font-medium text-white">
              <Icon name="cards" size={16} /> Quiz this guide
            </Link>
            <Link href={`/interview/?guide=${g.key}`} className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-medium hover:border-accent">
              <Icon name="timer" size={16} /> Mock interview
            </Link>
            <PracticeToggle />
          </div>
        </header>

        <GuideShell guideKey={g.key}>
          <div className="space-y-6">
            {sections.map((s, i) => (
              <section key={i} className="stagger space-y-3">
                {s.section && <h2 className="px-1 pt-2 text-[13px] font-semibold uppercase tracking-wider text-muted">{s.section}</h2>}
                {s.items.map(({ q, n }) => (
                  <QuestionItem key={q.id} q={q} n={n} defaultOpen={n === 1} career={career} />
                ))}
              </section>
            ))}
          </div>
        </GuideShell>

        {g.alsoAsked.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-1 px-1 text-[13px] font-semibold uppercase tracking-wider text-muted">Also asked here</h2>
            <p className="mb-3 px-1 text-sm text-muted">These come up in this context too. Their full answers live in other guides.</p>
            <ul className="space-y-2">
              {g.alsoAsked.map((a) => (
                <li key={a.key}>
                  <Link href={questionHref(a.key)} className="lift flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:border-accent">
                    <span className="min-w-0 flex-1 text-[15px] leading-snug">{a.titleText}</span>
                    <span className="hidden shrink-0 text-xs text-muted sm:inline">{a.guideTitle}</span>
                    <Icon name="right" size={16} className="shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="mt-10 grid grid-cols-2 gap-3 border-t border-line pt-6 text-sm" aria-label="Neighbouring guides">
          {prev ? (
            <Link href={`/${prev.key}/`} className="lift rounded-2xl border border-line bg-surface p-4 hover:border-accent">
              <span className="flex items-center gap-1 text-xs text-muted">
                <Icon name="left" size={13} /> Previous guide
              </span>
              <span className="mt-1 line-clamp-2 block font-medium">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/${next.key}/`} className="lift rounded-2xl border border-line bg-surface p-4 text-right hover:border-accent">
              <span className="flex items-center justify-end gap-1 text-xs text-muted">
                Next guide <Icon name="right" size={13} />
              </span>
              <span className="mt-1 line-clamp-2 block font-medium">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="hidden xl:block">
        <div className="no-scrollbar sticky top-10 max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">In this guide</h2>
          <ol className="space-y-0.5 border-l border-line text-[13px]">
            {g.questions.map((q, i) => (
              <li key={q.id}>
                <a href={`#${q.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 leading-snug text-muted hover:border-accent hover:text-ink">
                  <span className="tabular-nums">{i + 1}.</span> {q.titleText}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
