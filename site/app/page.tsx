import Link from 'next/link';
import { site, questions, categoryLabels } from '@/lib/data';
import { PageHeader, Section } from '@/components/Page';
import { Icon } from '@/components/Icons';
import { DashboardProgress } from '@/components/DashboardProgress';
import { SearchButton } from '@/components/SearchDialog';
import { DifficultyBadge, Badge } from '@/components/Badges';
import { PERSPECTIVE_LABELS } from '@/lib/labels';

export default function Dashboard() {
  const s = site();
  const all = questions();
  const curated = all.filter((q) => q.origin === 'curated');
  const collected = all.filter((q) => q.origin === 'collected');
  const cards = s.questions.filter((q) => q.revisionEligible).length;
  const labels = categoryLabels();
  const recentDocs = s.documents
    .filter((d) => !d.isIndex && d.lastModified)
    .sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''))
    .slice(0, 5);
  const mustKnow = curated.filter((q) => q.frequency === 'very-high' && q.category !== 'career').slice(0, 6);

  const stats = [
    { label: 'Questions', value: all.length, href: '/questions/' },
    { label: 'From my notes', value: collected.length, href: '/collected/' },
    { label: 'Curated FAQ', value: curated.length, href: '/faq/' },
    { label: 'Revision cards', value: cards, href: '/revision/' },
  ];

  return (
    <>
      <PageHeader title="Interview Prep" description="My own interview notes plus a curated set of frequently asked questions. Search everything, save favorites and drill with Quick Revision.">
        <SearchButton className="mt-4 flex h-12 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 text-[15px] text-muted shadow-sm hover:border-accent lg:hidden" />
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((st) => (
          <Link key={st.label} href={st.href} className="rounded-2xl border border-line bg-surface p-4 hover:border-accent">
            <div className="text-2xl font-semibold tabular-nums">{st.value}</div>
            <div className="text-sm text-muted">{st.label}</div>
          </Link>
        ))}
      </div>

      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        <Link href="/revision/" className="group flex items-center gap-4 rounded-2xl bg-accent p-5 text-white">
          <Icon name="bolt" size={28} />
          <div className="flex-1">
            <div className="font-semibold">Start Quick Revision</div>
            <div className="text-sm opacity-85">Flashcards from curated points and my notes</div>
          </div>
          <Icon name="right" className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/career/" className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 hover:border-accent">
          <Icon name="briefcase" size={28} className="text-analogy" />
          <div className="flex-1">
            <div className="font-semibold">Career prep</div>
            <div className="text-sm text-muted">Intro & HR answers for my situation</div>
          </div>
          <Icon name="right" className="text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/faq/" className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 hover:border-accent">
          <Icon name="faq" size={28} className="text-curated" />
          <div className="flex-1">
            <div className="font-semibold">Frequently asked</div>
            <div className="text-sm text-muted">{curated.length} answers with analogies & follow-ups</div>
          </div>
          <Icon name="right" className="text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="-mt-6 mb-10 grid grid-cols-2 gap-3">
        {[
          { slug: 'system-design', icon: 'layers' as const, blurb: 'Fundamentals + design walkthroughs' },
          { slug: 'dsa', icon: 'code' as const, blurb: 'Patterns, problems & JS solutions' },
        ].map((c) => {
          const cat = s.categories.find((x) => x.slug === c.slug);
          if (!cat) return null;
          return (
            <Link key={c.slug} href={`/categories/${c.slug}/`} className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-accent">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name={c.icon} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{cat.label}</span>
                <span className="block truncate text-xs text-muted">{cat.questionCount} · {c.blurb}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <Section title="Your progress">
        <DashboardProgress totalCards={cards} />
      </Section>

      <Section title="Must-know questions" action={<Link href="/faq/" className="text-sm text-accent">All FAQ →</Link>}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {mustKnow.map((q) => (
            <li key={q.id}>
              <Link href={`/q/${q.id}/`} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 hover:border-accent">
                <span className="text-[15px] font-medium leading-snug">{q.titleText}</span>
                <span className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  <Badge>{labels[q.category]}</Badge>
                  {q.perspective && <Badge>{PERSPECTIVE_LABELS[q.perspective]}</Badge>}
                  <DifficultyBadge difficulty={q.difficulty} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Categories" action={<Link href="/categories/" className="text-sm text-accent">Browse →</Link>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {s.categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}/`} className="rounded-2xl border border-line bg-surface p-4 hover:border-accent">
              <div className="font-medium">{c.label}</div>
              <div className="mt-1 text-sm text-muted">
                {c.questionCount} questions
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-surface-2">
                <span className="bg-collected" style={{ width: `${(c.collectedCount / Math.max(c.questionCount, 1)) * 100}%` }} />
                <span className="bg-curated" style={{ width: `${(c.curatedCount / Math.max(c.questionCount, 1)) * 100}%` }} />
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-2 flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-collected" />My notes</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-curated" />Curated</span>
        </p>
      </Section>

      {recentDocs.length > 0 && (
        <Section title="Recently updated notes" action={<Link href="/collected/" className="text-sm text-accent">All notes →</Link>}>
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {recentDocs.map((d) => (
              <li key={d.path} className="border-b border-line last:border-0">
                <Link href={`/source/${d.slug}/`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                  <Icon name="file" size={18} className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px]">{d.title}</span>
                    <span className="block text-xs text-muted">{d.path}</span>
                  </span>
                  <time className="shrink-0 text-xs text-muted" dateTime={d.lastModified}>
                    {new Date(d.lastModified!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
