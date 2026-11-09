import Link from 'next/link';
import type { GuideMeta } from '@/lib/content/types';
import { minutes } from '@/lib/labels';
import { DifficultyBar } from './Badges';
import { GuideCardProgress } from './ProgressClient';

export function GuideCard({ g, n }: { g: GuideMeta; n?: number }) {
  return (
    <Link href={`/${g.key}/`} className="group flex flex-col rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent">
      <div className="flex items-start gap-3">
        {n !== undefined && <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-semibold tabular-nums text-muted">{n}</span>}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug group-hover:text-accent">{g.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <DifficultyBar mix={g.difficulty} />
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span>{g.count} questions</span>
          <span>· {minutes(g.minutes)}</span>
          <GuideCardProgress guideKey={g.key} count={g.count} />
        </div>
      </div>
    </Link>
  );
}

export function GuideGrid({ guides, numbered }: { guides: GuideMeta[]; numbered?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {guides.map((g, i) => (
        <GuideCard key={g.key} g={g} n={numbered ? i + 1 : undefined} />
      ))}
    </div>
  );
}
