import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { site, question, duplicateSiblings, categoryLabels, documentByPath } from '@/lib/data';
import type { SiteQuestion } from '@/lib/content/site-types';
import { FREQUENCY_LABELS, PERSPECTIVE_LABELS, TYPE_LABELS, ORIGIN_LABELS } from '@/lib/labels';
import { Html } from '@/components/Html';
import { Badge, DifficultyBadge, OriginBadge, TagLink } from '@/components/Badges';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Icon } from '@/components/Icons';
import { TrackView } from '@/components/DashboardProgress';

export const dynamicParams = false;
export function generateStaticParams() {
  return site().questions.map((q) => ({ id: q.id.split('/') }));
}

type Props = { params: Promise<{ id: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const q = question(id.join('/'));
  return { title: q?.titleText ?? 'Question' };
}

function SourceLine({ q }: { q: SiteQuestion }) {
  if (!q.source) return null;
  const doc = documentByPath(q.source.path);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
      <span className="inline-flex items-center gap-1.5">
        <Icon name="file" size={15} />
        <Link href={`/source/${q.source.docSlug}/${q.source.anchor ? `#${q.source.anchor}` : ''}`} className="hover:text-accent">
          {doc?.title ?? q.source.path}
        </Link>
      </span>
      <span className="font-mono text-xs">
        {q.source.path}:{q.source.startLine}
        {q.source.endLine !== q.source.startLine && `–${q.source.endLine}`}
      </span>
      <a href={q.source.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
        GitHub <Icon name="external" size={13} />
      </a>
    </div>
  );
}

function Neighbours({ q }: { q: SiteQuestion }) {
  const list = site().questions.filter((x) =>
    x.kind === 'question' && (q.source ? x.source?.path === q.source.path : x.origin === 'curated' && x.category === q.category),
  );
  const i = list.findIndex((x) => x.id === q.id);
  if (i < 0) return null;
  const prev = list[i - 1], next = list[i + 1];
  return (
    <nav className="mt-10 grid grid-cols-2 gap-3 border-t border-line pt-6 text-sm" aria-label="Neighbouring questions">
      {prev ? (
        <Link href={`/q/${prev.id}/`} className="rounded-xl border border-line p-3 hover:border-accent">
          <span className="flex items-center gap-1 text-xs text-muted"><Icon name="left" size={13} /> Previous</span>
          <span className="mt-1 line-clamp-2 block">{prev.titleText}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={`/q/${next.id}/`} className="rounded-xl border border-line p-3 text-right hover:border-accent">
          <span className="flex items-center justify-end gap-1 text-xs text-muted">Next <Icon name="right" size={13} /></span>
          <span className="mt-1 line-clamp-2 block">{next.titleText}</span>
        </Link>
      ) : <span />}
    </nav>
  );
}

function H2({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return <h2 className="mb-3 mt-8 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">{icon}{children}</h2>;
}

export default async function QuestionPage({ params }: Props) {
  const { id: parts } = await params;
  const q = question(parts.join('/'));
  if (!q) notFound();
  const labels = categoryLabels();
  const siblings = duplicateSiblings(q);
  const related = q.relatedIds.map((id) => question(id)).filter(Boolean) as SiteQuestion[];
  const doc = q.source ? documentByPath(q.source.path) : undefined;

  return (
    <article>
      <TrackView id={q.id} />
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href={`/categories/${q.category}/`} className="hover:text-accent">{labels[q.category] ?? q.category}</Link>
        <span>/</span>
        {q.source ? (
          <Link href={`/source/${q.source.docSlug}/`} className="hover:text-accent">{doc?.title ?? q.source.path}</Link>
        ) : (
          <Link href="/faq/" className="hover:text-accent">Frequently Asked</Link>
        )}
      </nav>

      <h1 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl" dangerouslySetInnerHTML={{ __html: q.titleHtml }} />

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <OriginBadge origin={q.origin} />
        {q.perspective ? <Badge>{PERSPECTIVE_LABELS[q.perspective]}</Badge> : <Badge>{TYPE_LABELS[q.contentType]}</Badge>}
        <DifficultyBadge difficulty={q.difficulty} />
        {q.frequency && <Badge tone="accent">{FREQUENCY_LABELS[q.frequency]}</Badge>}
        {!q.hasAnswer && <Badge tone="warn">No answer yet</Badge>}
        {q.source?.sectionPath.length ? <Badge>{q.source.sectionPath.join(' › ')}</Badge> : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <FavoriteButton id={q.id} />
        <SourceLine q={q} />
      </div>

      {/* ---- Body ---- */}
      {q.curated ? (
        <>
          <H2>Interview answer</H2>
          <Html html={q.bodyHtml} />
          <div className="mt-6 rounded-2xl border border-curated/30 bg-curated-soft p-4 sm:p-5">
            <div className="mb-1 text-sm font-semibold text-curated">💡 Analogy</div>
            <Html html={q.curated.analogyHtml} />
          </div>
          <H2 icon={<Icon name="bolt" size={15} />}>Quick revision</H2>
          <ul className="space-y-2">
            {q.curated.quickRevisionHtml.map((x, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-[15px]">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-collected-soft text-[11px] font-semibold text-collected">{i + 1}</span>
                <span className="md-inline md min-w-0" dangerouslySetInnerHTML={{ __html: x }} />
              </li>
            ))}
          </ul>
          {q.curated.deepDiveHtml && (
            <>
              <H2>Go deeper</H2>
              <Html html={q.curated.deepDiveHtml} />
            </>
          )}
          <H2>Likely follow-up questions</H2>
          <ul className="space-y-2">
            {q.curated.followUpsHtml.map((x, i) => (
              <li key={i} className="flex gap-3 text-[15px]">
                <span className="text-accent">→</span>
                <span className="md min-w-0" dangerouslySetInnerHTML={{ __html: x }} />
              </li>
            ))}
          </ul>
        </>
      ) : q.kind === 'revision' ? (
        <>
          <H2>Key takeaways</H2>
          <ul className="space-y-2">
            {(q.revisionItemsHtml ?? []).map((x, i) => (
              <li key={i} className="rounded-xl border border-line bg-surface px-3 py-2.5 text-[15px]">
                <span className="md" dangerouslySetInnerHTML={{ __html: x }} />
              </li>
            ))}
          </ul>
        </>
      ) : q.hasAnswer ? (
        <div className="mt-6">
          <Html html={q.bodyHtml} />
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-5 text-muted">
          This is a practice prompt from my notes with no written answer yet. Try answering it out loud, then compare with related questions below.
        </p>
      )}

      {/* ---- Same question, other answers (never discarded) ---- */}
      {siblings.length > 0 && (
        <section className="mt-10">
          <H2>Also answered in {siblings.length === 1 ? 'another source' : `${siblings.length} other sources`}</H2>
          <div className="space-y-4">
            {siblings.map((s) => (
              <div key={s.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <OriginBadge origin={s.origin} />
                  <Link href={`/q/${s.id}/`} className="text-sm font-medium hover:text-accent">{s.titleText}</Link>
                </div>
                {s.source && <div className="mb-3"><SourceLine q={s} /></div>}
                {s.hasAnswer ? <Html html={s.bodyHtml} /> : <p className="text-sm text-muted">No written answer.</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <H2>Related</H2>
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {related.map((r) => (
              <li key={r.id} className="border-b border-line last:border-0">
                <Link href={`/q/${r.id}/`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                  <span className={`size-2 shrink-0 rounded-full ${r.origin === 'curated' ? 'bg-curated' : 'bg-collected'}`} />
                  <span className="min-w-0 flex-1 text-[15px]">{r.titleText}</span>
                  <span className="hidden shrink-0 text-xs text-muted sm:inline">{ORIGIN_LABELS[r.origin]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {q.tags.map((t) => <TagLink key={t} tag={t} />)}
        </div>
      )}

      <Neighbours q={q} />
    </article>
  );
}
