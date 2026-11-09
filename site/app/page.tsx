import Link from 'next/link';
import { catalog, cheatsheets, guide, site, topics } from '@/lib/data';
import { Icon, type IconName } from '@/components/Icons';
import { SearchButton } from '@/components/SearchDialog';
import { HomeProgress, RandomGuide } from '@/components/ProgressClient';
import { Teaser } from '@/components/Teaser';
import { Html } from '@/components/Html';
import { minutes } from '@/lib/labels';

const MODES: { href: string; title: string; blurb: string; icon: IconName; tone: string }[] = [
  { href: '/quiz/', title: 'Quiz', blurb: 'Answer questions from any guide, then compare with the written answer.', icon: 'cards', tone: 'bg-answer-soft text-answer' },
  { href: '/interview/', title: 'Interview Simulator', blurb: 'A timed mock interview with random questions.', icon: 'timer', tone: 'bg-analogy-soft text-analogy' },
  { href: '/last-minute/', title: 'Last-Minute Cards', blurb: 'The must-know questions with memory hooks, in minutes.', icon: 'bolt', tone: 'bg-revise-soft text-revise' },
  { href: '/review/', title: 'Review', blurb: 'Spaced repetition brings back the questions you found hard.', icon: 'again', tone: 'bg-follow-soft text-follow' },
];

export default function Home() {
  const s = site();
  const ts = topics();
  const total = s.guides.reduce((n, g) => n + g.count, 0);
  const hours = Math.round(s.guides.reduce((n, g) => n + g.minutes, 0) / 60);
  const sheets = cheatsheets();
  const teaser = guide('javascript/output-prediction')?.questions[0];

  return (
    <>
      <section className="stagger mb-12">
        <div className="eyebrow mb-6 flex items-center gap-3 border-y border-line py-2 text-muted">
          <span className="text-accent">No. 01</span>
          <span className="h-3 w-px bg-line" />
          <span className="truncate">The full-stack interview notebook</span>
          <span className="ml-auto hidden sm:inline">Free · offline-friendly</span>
        </div>
        <h1 className="max-w-3xl text-[2.6rem] font-semibold leading-[0.98] text-balance sm:text-6xl lg:text-7xl">
          Read it. <em className="font-normal italic text-accent">Say it</em> out loud. Come back to <span className="marker">what you missed.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] text-muted sm:text-base">
          Every answer comes with an analogy, quick-revision hooks and the follow-ups interviewers ask next. No account: your progress stays in this browser.
        </p>
        <dl className="mt-6 grid max-w-xl grid-cols-3 border-y border-line">
          {[
            [ts.length, 'topics'],
            [s.guides.length, 'guides'],
            [total, 'questions'],
          ].map(([n, l], i) => (
            <div key={l} className={`py-3 ${i ? 'border-l border-line pl-4' : ''}`}>
              <dt className="eyebrow text-muted">{l}</dt>
              <dd className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">{n}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/${s.guides[0].key}/`} className="press inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-white">
            Start studying <Icon name="right" size={16} />
          </Link>
          <RandomGuide keys={s.guides.map((g) => g.key)} className="press inline-flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-5 text-sm font-medium hover:border-accent" />
        </div>
        <SearchButton className="mt-4 flex h-12 w-full items-center gap-3 rounded-md border border-line bg-surface px-4 text-[15px] text-muted hover:border-accent lg:hidden" />
      </section>

      <section className="mb-14">
        <SectionHead n="01" title="Your progress" />
        <HomeProgress catalog={catalog()} />
      </section>

      <section className="mb-14">
        <SectionHead n="02" title="Practice" note="Reading is half of it. These make you answer." />
        <div className="stagger grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <Link key={m.href} href={m.href} className="lift group flex items-start gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-accent">
              <span className={`grid size-11 shrink-0 place-items-center rounded-md border border-current/30 ${m.tone}`}>
                <Icon name={m.icon} size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-semibold leading-tight group-hover:text-accent">{m.title}</span>
                <span className="block text-sm text-muted">{m.blurb}</span>
              </span>
              <Icon name="right" size={18} className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {teaser && (
        <section className="mb-14">
          <SectionHead n="03" title="What does this return?" />
          <Teaser href={`/javascript/output-prediction/#${teaser.id}`} question={<><p className="mb-3 font-semibold" dangerouslySetInnerHTML={{ __html: teaser.titleHtml }} />{teaser.snippetHtml && <Html html={teaser.snippetHtml} />}</>} answer={<Html html={teaser.answerHtml} />} />
        </section>
      )}

      <section className="mb-14">
        <SectionHead n="04" title="Topics" note={`~${hours} hours of reading in total.`} href="/topics/" link="All topics" />
        <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ts.map((t, i) => (
            <div key={t.slug} className="lift relative flex flex-col rounded-2xl border border-line bg-surface p-4 hover:border-accent">
              <span className="pointer-events-none absolute right-4 top-3 font-display text-4xl font-semibold italic leading-none text-rule tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <Link href={`/${t.slug}/`} className="group flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-line bg-bg text-ink">
                  <Icon name={t.icon as IconName} size={20} />
                </span>
                <span className="min-w-0 flex-1 pr-10">
                  <span className="block font-display text-lg font-semibold leading-tight group-hover:text-accent">{t.label}</span>
                  <span className="eyebrow block text-[10px] text-muted">
                    {t.guides.length} guides · {t.count} questions
                  </span>
                </span>
              </Link>
              <ul className="mt-3 divide-y divide-dashed divide-rule border-t border-dashed border-rule text-sm">
                {t.guides.slice(0, 4).map((g) => (
                  <li key={g.key}>
                    <Link href={`/${g.key}/`} className="flex items-center gap-2 px-0.5 py-1.5 text-muted hover:text-ink">
                      <span className="min-w-0 flex-1 truncate">{g.title}</span>
                      <span className="shrink-0 font-mono text-[11px] tabular-nums">{g.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {t.guides.length > 4 && (
                <Link href={`/${t.slug}/`} className="eyebrow mt-auto pt-3 text-[10px] text-accent">
                  Show all {t.guides.length} guides
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {sheets.length > 0 && (
        <section className="mb-14">
          <SectionHead n="05" title="Cheat sheets" note={`${sheets.length} one-page references for the last hour before an interview.`} href="/cheatsheets/" link="All cheat sheets" />
          <div className="stagger no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 xl:grid-cols-4">
            {sheets.map((c) => (
              <Link key={c.slug} href={`/cheatsheets/${c.slug}/`} className="lift group w-44 shrink-0 rounded-2xl border border-line bg-surface p-4 hover:border-accent sm:w-auto">
                <Icon name={c.icon as IconName} size={20} className="text-accent" />
                <span className="mt-3 block font-display text-[15px] font-semibold leading-snug group-hover:text-accent">{c.title}</span>
                <span className="eyebrow mt-1 block text-[10px] text-muted">{minutes(c.minutes)} read</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHead({ n, title, note, href, link }: { n: string; title: string; note?: string; href?: string; link?: string }) {
  return (
    <div className="mb-4 flex items-start gap-4 border-b border-line pb-2">
      <span className="eyebrow pt-3 text-accent">§{n}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-semibold leading-tight sm:text-[1.75rem]">{title}</h2>
        {note && <p className="text-sm text-muted">{note}</p>}
      </div>
      {href && (
        <Link href={href} className="eyebrow shrink-0 self-end pb-1.5 text-ink hover:text-accent">
          {link} →
        </Link>
      )}
    </div>
  );
}
