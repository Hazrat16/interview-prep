import { Icon, type IconName } from './Icons';

export type Tone = 'answer' | 'analogy' | 'revise' | 'follow' | 'variant' | 'avoid' | 'deep' | 'neutral';

// Literal class strings so Tailwind can see them.
const TONES: Record<Tone, { mark: string; text: string; body: string }> = {
  answer: { mark: 'bg-answer', text: 'text-answer', body: 'border-l-[3px] border-answer/70 pl-4 sm:pl-5' },
  analogy: { mark: 'bg-analogy', text: 'text-analogy', body: 'rounded-md bg-analogy-soft px-4 py-3.5 sm:px-5' },
  revise: { mark: 'bg-revise', text: 'text-revise', body: '' },
  follow: { mark: 'bg-follow', text: 'text-follow', body: '' },
  variant: { mark: 'bg-variant', text: 'text-variant', body: '' },
  avoid: { mark: 'bg-avoid', text: 'text-avoid', body: '' },
  deep: { mark: 'bg-deep', text: 'text-deep', body: '' },
  neutral: { mark: 'bg-muted', text: 'text-muted', body: '' },
};

/** A ruled notebook section: monospace "§ TITLE" label, then the content. */
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
    <section id={id} className="scroll-mt-32 border-t border-dashed border-rule pt-4 first:border-t-0 first:pt-0 lg:scroll-mt-20">
      <header className="mb-3 flex items-center gap-2.5">
        <span className={`grid size-5 shrink-0 place-items-center rounded-[3px] text-white dark:text-black ${t.mark}`}>
          <Icon name={icon} size={12} strokeWidth={2.4} />
        </span>
        <h2 className={`eyebrow ${t.text}`} style={{ fontFamily: 'var(--font-mono)' }}>
          § {title}
        </h2>
        {hint && <span className="hidden truncate font-display text-[13px] italic text-muted sm:inline">— {hint}</span>}
        {aside && <span className="ml-auto">{aside}</span>}
      </header>
      <div className={t.body}>{children}</div>
    </section>
  );
}

/** Numbered rows used for revision points and follow-ups. */
export function NumberedList({ items, tone }: { items: string[]; tone: 'revise' | 'follow' | 'avoid' }) {
  const dot = { revise: 'text-revise', follow: 'text-follow', avoid: 'text-avoid' }[tone];
  return (
    <ol className="space-y-2.5">
      {items.map((html, i) => (
        <li key={i} className="flex gap-3">
          <span className={`mt-[3px] w-6 shrink-0 font-mono text-[13px] font-semibold tabular-nums ${dot}`}>{tone === 'avoid' ? '✕' : String(i + 1).padStart(2, '0')}</span>
          <span className="md min-w-0 flex-1 text-[15px] leading-relaxed sm:text-base" dangerouslySetInnerHTML={{ __html: html }} />
        </li>
      ))}
    </ol>
  );
}
