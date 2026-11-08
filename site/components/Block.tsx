import { Icon, type IconName } from './Icons';

export type Tone = 'answer' | 'analogy' | 'revise' | 'follow' | 'variant' | 'avoid' | 'deep' | 'neutral';

// Literal class strings so Tailwind can see them.
const TONES: Record<Tone, { box: string; head: string; badge: string; body: string }> = {
  answer: { box: 'border-answer/25', head: 'bg-answer-soft text-answer', badge: 'bg-answer text-white dark:text-black', body: '' },
  analogy: { box: 'border-analogy/30', head: 'text-analogy', badge: 'bg-analogy text-white dark:text-black', body: 'bg-analogy-soft' },
  revise: { box: 'border-revise/25', head: 'bg-revise-soft text-revise', badge: 'bg-revise text-white dark:text-black', body: '' },
  follow: { box: 'border-follow/25', head: 'bg-follow-soft text-follow', badge: 'bg-follow text-white dark:text-black', body: '' },
  variant: { box: 'border-variant/25', head: 'bg-variant-soft text-variant', badge: 'bg-variant text-white dark:text-black', body: '' },
  avoid: { box: 'border-avoid/25', head: 'bg-avoid-soft text-avoid', badge: 'bg-avoid text-white dark:text-black', body: '' },
  deep: { box: 'border-line', head: 'bg-deep-soft text-deep', badge: 'bg-deep text-white dark:text-black', body: '' },
  neutral: { box: 'border-line', head: 'bg-surface-2 text-muted', badge: 'bg-muted text-white dark:text-black', body: '' },
};

export function Block({
  id,
  tone,
  icon,
  title,
  hint,
  aside,
  children,
}: {
  id?: string;
  tone: Tone;
  icon: IconName;
  title: string;
  hint?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section id={id} className={`scroll-mt-32 overflow-hidden rounded-2xl border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:scroll-mt-20 ${t.box} ${t.body}`}>
      <header className={`flex items-center gap-2.5 px-4 py-2.5 sm:px-5 ${t.head}`}>
        <span className={`grid size-6 shrink-0 place-items-center rounded-full ${t.badge}`}>
          <Icon name={icon} size={14} strokeWidth={2.2} />
        </span>
        <h2 className="text-[13px] font-semibold uppercase tracking-wider">{title}</h2>
        {hint && <span className="hidden truncate text-xs font-normal text-muted sm:inline">· {hint}</span>}
        {aside && <span className="ml-auto">{aside}</span>}
      </header>
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  );
}

/** Numbered rows used for revision points and follow-ups. */
export function NumberedList({ items, tone }: { items: string[]; tone: 'revise' | 'follow' | 'avoid' }) {
  const dot = { revise: 'bg-revise-soft text-revise', follow: 'bg-follow-soft text-follow', avoid: 'bg-avoid-soft text-avoid' }[tone];
  return (
    <ol className="space-y-2.5">
      {items.map((html, i) => (
        <li key={i} className="flex gap-3">
          <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${dot}`}>
            {tone === 'avoid' ? '✕' : i + 1}
          </span>
          <span className="md min-w-0 flex-1 text-[15px] leading-relaxed sm:text-base" dangerouslySetInnerHTML={{ __html: html }} />
        </li>
      ))}
    </ol>
  );
}
