import Link from 'next/link';
import type { GuideMeta } from '@/lib/content/types';
import { minutes } from '@/lib/labels';
import { DifficultyBar } from './Badges';
import { GuideCardProgress } from './ProgressClient';

export function GuideCard({ g, n }: { g: GuideMeta; n?: number }) {
  return (
    <Link href={`/${g.key}/`} className="lift group flex flex-col rounded-2xl border border-line bg-surface p-4 hover:border-accent">
      <div className="flex items-start gap-3">
        {n !== undefined && <span className="mt-0.5 shrink-0 font-display text-2xl font-semibold italic leading-none text-accent tabular-nums">{String(n).padStart(2, '0')}</span>}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug group-hover:text-accent">{g.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <DifficultyBar mix={g.difficulty} />
        <div className="eyebrow mt-2.5 flex items-center gap-3 text-[10px] text-muted">
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
    <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {guides.map((g, i) => (
        <GuideCard key={g.key} g={g} n={numbered ? i + 1 : undefined} />
      ))}
    </div>
  );
}
