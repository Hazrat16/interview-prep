'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Catalog } from '@/lib/data';
import { useBookmarks, useHydrated } from '@/lib/client/storage';
import { guideOf, questionHref } from '@/lib/paths';
import { Icon } from '../Icons';
import { DifficultyBadge } from '../Badges';
import { BookmarkButton } from '../QuestionClient';
import { btnPrimary, Done, Loading, useCards, useGuideTitles } from './Shared';

export function Bookmarks({ catalog }: { catalog: Catalog }) {
  const { cards, error } = useCards();
  const { list } = useBookmarks();
  const ready = useHydrated();
  const title = useGuideTitles(catalog);
  const byKey = useMemo(() => new Map((cards ?? []).map((c) => [c.k, c])), [cards]);

  if (error) return <p className="text-hard">Could not load questions.</p>;
  if (!cards || !ready) return <Loading />;
  const items = list.map((k) => byKey.get(k)).filter(Boolean) as NonNullable<ReturnType<typeof byKey.get>>[];
  if (!items.length)
    return (
      <Done icon="check" title="No bookmarks yet">
        <p>
          Tap <Icon name="bookmark" size={14} className="inline align-[-2px]" /> on any question to save it here.
        </p>
      </Done>
    );

  const groups = new Map<string, typeof items>();
  for (const c of items) groups.set(guideOf(c.k), [...(groups.get(guideOf(c.k)) ?? []), c]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link href="/quiz/?bookmarks=1" className={btnPrimary}>
          <Icon name="cards" size={16} /> Quiz my bookmarks
        </Link>
      </div>
      {[...groups].map(([g, cs]) => (
        <section key={g}>
          <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wider text-muted">{title(g)}</h2>
          <ul className="space-y-2">
            {cs.map((c) => (
              <li key={c.k} className="flex items-center gap-2 rounded-2xl border border-line bg-surface pr-2 hover:border-accent">
                <Link href={questionHref(c.k)} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                  <span className="md-inline min-w-0 flex-1 text-[15px] leading-snug" dangerouslySetInnerHTML={{ __html: c.t }} />
                  <DifficultyBadge difficulty={c.d} />
                </Link>
                <BookmarkButton id={c.k} compact />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
