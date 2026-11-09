import type { Difficulty } from '@/lib/content/schema';

const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap';

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

export function Badge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'accent' | 'warn' }) {
  const t = { muted: 'bg-surface-2 text-muted', accent: 'bg-accent-soft text-accent', warn: 'bg-surface-2 text-medium' }[tone];
  return <span className={`${base} ${t}`}>{children}</span>;
}

/** Stacked easy/medium/hard bar. */
export function DifficultyBar({ mix }: { mix: Record<Difficulty, number> }) {
  const total = mix.easy + mix.medium + mix.hard || 1;
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-2" title={`${mix.easy} easy · ${mix.medium} medium · ${mix.hard} hard`}>
      <span className="bg-easy" style={{ width: `${(mix.easy / total) * 100}%` }} />
      <span className="bg-medium" style={{ width: `${(mix.medium / total) * 100}%` }} />
      <span className="bg-hard" style={{ width: `${(mix.hard / total) * 100}%` }} />
    </div>
  );
}
