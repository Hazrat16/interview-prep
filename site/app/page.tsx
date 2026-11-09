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
      <section className="stagger mb-8">
        <p className="mb-2 text-sm font-medium text-accent">Interview prep for full-stack developers</p>
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
          Read a topic, test yourself on it, and come back to what you missed.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-muted">
          {s.guides.length} guides and {total} interview questions across {ts.length} topics, from JavaScript and React to system design. Every answer comes with an analogy,
          quick-revision hooks and likely follow-ups. Free, no account, and your progress stays in your browser.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/${s.guides[0].key}/`} className="press inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white">
            Start studying <Icon name="right" size={16} />
          </Link>
          <RandomGuide keys={s.guides.map((g) => g.key)} className="press inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium hover:border-accent" />
        </div>
        <SearchButton className="mt-4 flex h-12 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 text-[15px] text-muted shadow-sm hover:border-accent lg:hidden" />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Your progress</h2>
        <HomeProgress catalog={catalog()} />
      </section>

      <section className="mb-10">
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight">Practice</h2>
          <p className="text-sm text-muted">Reading is half of it. These make you answer.</p>
        </div>
        <div className="stagger grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <Link key={m.href} href={m.href} className="lift group flex items-start gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-accent">
              <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${m.tone}`}>
                <Icon name={m.icon} size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold group-hover:text-accent">{m.title}</span>
                <span className="block text-sm text-muted">{m.blurb}</span>
              </span>
              <Icon name="right" size={18} className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {teaser && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">What does this return?</h2>
          <Teaser href={`/javascript/output-prediction/#${teaser.id}`} question={<><p className="mb-3 font-semibold" dangerouslySetInnerHTML={{ __html: teaser.titleHtml }} />{teaser.snippetHtml && <Html html={teaser.snippetHtml} />}</>} answer={<Html html={teaser.answerHtml} />} />
        </section>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Topics</h2>
            <p className="text-sm text-muted">~{hours} hours of reading in total.</p>
          </div>
          <Link href="/topics/" className="text-sm text-accent">
            All topics →
          </Link>
        </div>
        <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ts.map((t) => (
            <div key={t.slug} className="lift flex flex-col rounded-2xl border border-line bg-surface p-4 hover:border-accent">
              <Link href={`/${t.slug}/`} className="group flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon name={t.icon as IconName} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold group-hover:text-accent">{t.label}</span>
                  <span className="block text-xs text-muted">
                    {t.guides.length} guides · {t.count} questions
                  </span>
                </span>
              </Link>
              <ul className="mt-3 space-y-0.5 text-sm">
                {t.guides.slice(0, 4).map((g) => (
                  <li key={g.key}>
                    <Link href={`/${g.key}/`} className="flex items-center gap-2 rounded-lg px-1 py-1 text-muted hover:text-ink">
                      <span className="min-w-0 flex-1 truncate">{g.title}</span>
                      <span className="shrink-0 text-xs tabular-nums">{g.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {t.guides.length > 4 && (
                <Link href={`/${t.slug}/`} className="mt-auto pt-2 text-xs font-medium text-accent">
                  Show all {t.guides.length} guides
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {sheets.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Cheat sheets</h2>
              <p className="text-sm text-muted">{sheets.length} one-page references for the last hour before an interview.</p>
            </div>
            <Link href="/cheatsheets/" className="text-sm text-accent">
              All cheat sheets →
            </Link>
          </div>
          <div className="stagger no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 xl:grid-cols-4">
            {sheets.map((c) => (
              <Link key={c.slug} href={`/cheatsheets/${c.slug}/`} className="lift group w-44 shrink-0 rounded-2xl border border-line bg-surface p-4 hover:border-accent sm:w-auto">
                <Icon name={c.icon as IconName} size={20} className="text-accent" />
                <span className="mt-2 block text-sm font-semibold group-hover:text-accent">{c.title}</span>
                <span className="block text-xs text-muted">{minutes(c.minutes)} read</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
