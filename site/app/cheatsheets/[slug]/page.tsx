import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cheatsheet, cheatsheets } from '@/lib/data';
import { Html } from '@/components/Html';
import { minutes } from '@/lib/labels';

export const dynamicParams = false;
export function generateStaticParams() {
  return cheatsheets().map((c) => ({ slug: c.slug }));
}
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = cheatsheet((await params).slug);
  return { title: c ? `${c.title} cheat sheet` : 'Cheat sheet', description: c?.description };
}

export default async function CheatSheetPage({ params }: Props) {
  const c = cheatsheet((await params).slug);
  if (!c) notFound();
  const toc = c.headings.filter((h) => h.depth === 2);
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-8">
      <article className="min-w-0">
        <nav className="mb-3 text-sm text-muted">
          <Link href="/cheatsheets/" className="hover:text-accent">
            Cheat Sheets
          </Link>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{c.title}</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          {c.description} · {minutes(c.minutes)} read
        </p>
        {toc.length > 2 && (
          <div className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 xl:hidden">
            {toc.map((h) => (
              <a key={h.id} href={`#${h.id}`} className="h-8 shrink-0 rounded-md border border-line px-3 text-[13px] leading-8 text-muted hover:text-ink">
                {h.text}
              </a>
            ))}
          </div>
        )}
        <div className="mt-6 rounded-2xl border border-line bg-surface px-4 py-5 sm:px-6">
          <Html html={c.html} className="cheatsheet" />
        </div>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-10">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">On this page</h2>
          <ol className="space-y-0.5 border-l border-line text-[13px]">
            {toc.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-muted hover:border-accent hover:text-ink">
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
