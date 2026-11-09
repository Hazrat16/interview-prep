import type { Metadata } from 'next';
import Link from 'next/link';
import { cheatsheets } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { Icon, type IconName } from '@/components/Icons';
import { minutes } from '@/lib/labels';

export const metadata: Metadata = { title: 'Cheat Sheets' };

export default function CheatSheets() {
  const list = cheatsheets();
  return (
    <>
      <PageHeader title="Cheat Sheets" description={`${list.length} one-page references, from Git to Big-O. Skim them the hour before an interview.`} />
      <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <Link key={c.slug} href={`/cheatsheets/${c.slug}/`} className="lift group flex gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-accent">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Icon name={c.icon as IconName} size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold group-hover:text-accent">{c.title}</span>
              <span className="mt-0.5 block text-sm text-muted">{c.description}</span>
              <span className="mt-2 block text-xs text-muted">{minutes(c.minutes)} read</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
