import type { Metadata } from 'next';
import Link from 'next/link';
import { questions } from '@/lib/data';
import { careerProfile } from '@/content/career-profile';
import { FREQUENCY_LABELS } from '@/lib/labels';
import { Icon } from '@/components/Icons';
import { Html } from '@/components/Html';

export const metadata: Metadata = { title: 'Career Prep' };

export default function CareerPage() {
  const qs = questions((q) => q.origin === 'curated' && q.category === 'career').sort(
    (a, b) => (a.curated?.order ?? 0) - (b.curated?.order ?? 0),
  );
  const sections: { name: string; items: typeof qs }[] = [];
  for (const q of qs) {
    const name = q.curated?.section ?? 'Other';
    const s = sections.find((x) => x.name === name) ?? sections[sections.push({ name, items: [] }) - 1];
    s.items.push(q);
  }

  return (
    <>
      <header className="mb-6">
        <p className="text-sm font-medium text-accent">Introductory & HR round</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Career Prep</h1>
        <p className="mt-1.5 max-w-2xl text-[15px] text-muted">
          Answers written for my situation: the questions recruiters and hiring managers ask before the technical rounds.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/revision/?cat=career" className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-white">
            <Icon name="bolt" size={16} /> Practise all {qs.length}
          </Link>
          <Link href={`/q/${qs[0]?.id}/`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium">
            <Icon name="mic" size={16} /> Start with “Tell me about yourself”
          </Link>
        </div>
      </header>

      {/* ---- Situation at a glance ---- */}
      <section className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {careerProfile.facts.map((f) => (
          <div key={f.label} className="rounded-2xl border border-line bg-surface p-3.5 sm:p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{f.label}</div>
            <div className="mt-1 text-[15px] font-semibold leading-snug">{f.value}</div>
            <div className="mt-0.5 text-xs leading-snug text-muted">{f.detail}</div>
          </div>
        ))}
      </section>

      <div className="mb-10 grid gap-3 lg:grid-cols-5">
        <section className="rounded-2xl border border-revise/25 bg-surface lg:col-span-3">
          <h2 className="flex items-center gap-2 bg-revise-soft px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-revise">
            <Icon name="target" size={15} /> Proof points to drop in
          </h2>
          <ul className="space-y-2 p-4 text-[15px]">
            {careerProfile.proofPoints.map((p) => (
              <li key={p} className="flex gap-2.5">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-revise" />
                {p}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-analogy/30 bg-analogy-soft lg:col-span-2">
          <h2 className="flex items-center gap-2 px-4 pt-3 text-[13px] font-semibold uppercase tracking-wider text-analogy">
            <Icon name="briefcase" size={15} /> Salary placeholders
          </h2>
          <ul className="space-y-2.5 p-4 text-sm">
            {careerProfile.placeholders.map((p) => (
              <li key={p.token} className="flex items-baseline gap-3">
                <mark className="ph shrink-0">{p.token}</mark>
                <span>{p.meaning}</span>
              </li>
            ))}
          </ul>
          <p className="px-4 pb-4 text-xs text-muted">Research the market range before each call and fill these in mentally. Real numbers never go in this public site.</p>
        </section>
      </div>

      {/* ---- Questions by section ---- */}
      {sections.map((s, si) => (
        <section key={s.name} className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-sm text-accent">{si + 1}</span>
            {s.name}
            <span className="text-sm font-normal text-muted">· {s.items.length}</span>
          </h2>
          <div className="space-y-2.5">
            {s.items.map((q) => (
              <details key={q.id} className="group overflow-hidden rounded-2xl border border-line bg-surface open:border-answer/30 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-snug sm:text-base">{q.titleText}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      {q.frequency && <span className={q.frequency === 'very-high' ? 'font-medium text-accent' : ''}>{FREQUENCY_LABELS[q.frequency]}</span>}
                      {q.curated?.variantsHtml?.length ? <span>· {q.curated.variantsHtml.length} tailored versions</span> : null}
                      {q.titleText.match(/salary/i) && <span className="text-analogy">· uses placeholders</span>}
                    </span>
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted transition-transform group-open:rotate-90">
                    <Icon name="right" size={16} />
                  </span>
                </summary>
                <div className="border-t border-line px-4 pb-4 pt-4">
                  <Html html={q.bodyHtml} />
                  <Link href={`/q/${q.id}/`} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-answer-soft text-sm font-medium text-answer">
                    Versions, follow-ups & what not to say <Icon name="right" size={15} />
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
