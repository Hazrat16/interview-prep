import Link from 'next/link';
import type { Difficulty, ContentType } from '@/lib/content/types';
import type { Origin } from '@/lib/content/site-types';
import { ORIGIN_LABELS, TYPE_LABELS, tagLabel } from '@/lib/labels';

const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap';

export function OriginBadge({ origin }: { origin: Origin }) {
  return (
    <span
      className={`${base} ${origin === 'curated' ? 'bg-curated-soft text-curated' : 'bg-collected-soft text-collected'}`}
    >
      {ORIGIN_LABELS[origin]}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty?: Difficulty }) {
  if (!difficulty) return null;
  const color = { easy: 'text-easy', medium: 'text-medium', hard: 'text-hard' }[difficulty];
  return (
    <span className={`${base} border border-line ${color}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {difficulty[0].toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

export function TypeBadge({ type, label }: { type?: ContentType; label?: string }) {
  if (!type && !label) return null;
  return <span className={`${base} bg-surface-2 text-muted`}>{label ?? TYPE_LABELS[type!]}</span>;
}

export function Badge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'accent' | 'warn' }) {
  const t = { muted: 'bg-surface-2 text-muted', accent: 'bg-accent-soft text-accent', warn: 'bg-surface-2 text-medium' }[tone];
  return <span className={`${base} ${t}`}>{children}</span>;
}

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tags/${tag}/`}
      className="rounded-md border border-line px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-accent"
    >
      {tagLabel(tag)}
    </Link>
  );
}
