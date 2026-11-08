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
import { Block, NumberedList } from '@/components/Block';
import { MobileQuestionBar, PracticeToggle, Reveal, SectionNav, VariantTabs } from '@/components/QuestionClient';
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
      <Link
        href={`/source/${q.source.docSlug}/${q.source.anchor ? `#${q.source.anchor}` : ''}`}
        className="inline-flex items-center gap-1.5 hover:text-accent"
      >
        <Icon name="file" size={15} />
        {doc?.title ?? q.source.path}
      </Link>
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

/** Previous / next within the same file (notes) or the same curated set (in authoring order). */
function neighbours(q: SiteQuestion) {
  const list = site()
    .questions.filter((x) =>
      x.kind === 'question' && (q.source ? x.source?.path === q.source.path : x.origin === 'curated' && x.category === q.category),
    )
    .sort((a, b) => (a.curated && b.curated ? a.curated.order - b.curated.order : 0));
  const i = list.findIndex((x) => x.id === q.id);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 ? list[i + 1] : undefined };
}

export default async function QuestionPage({ params }: Props) {
  const { id: parts } = await params;
  const q = question(parts.join('/'));
  if (!q) notFound();
  const labels = categoryLabels();
  const siblings = duplicateSiblings(q);
  const related = q.relatedIds.map((id) => question(id)).filter(Boolean) as SiteQuestion[];
  const doc = q.source ? documentByPath(q.source.path) : undefined;
  const { prev, next } = neighbours(q);
  const c = q.curated ?? q.prep;
  const notesAndPolished = !!q.prep?.answerHtml && !!q.bodyHtml;
  const isCareer = q.category === 'career';

  const nav = [
    { id: 'answer', label: 'Answer', dot: 'bg-answer', show: true },
    { id: 'notes', label: 'My notes', dot: 'bg-collected', show: notesAndPolished },
    { id: 'versions', label: 'Versions', dot: 'bg-variant', show: !!c?.variantsHtml?.length },
    { id: 'analogy', label: isCareer ? 'Framing' : 'Analogy', dot: 'bg-analogy', show: !!c },
    { id: 'revise', label: 'Revise', dot: 'bg-revise', show: !!c || q.kind === 'revision' },
    { id: 'deeper', label: 'Deeper', dot: 'bg-deep', show: !!c?.deepDiveHtml },
    { id: 'avoid', label: "Don't say", dot: 'bg-avoid', show: !!c?.avoidHtml?.length },
    { id: 'follow-ups', label: 'Follow-ups', dot: 'bg-follow', show: !!c },
    { id: 'other-answers', label: `Other answers (${siblings.length})`, dot: 'bg-collected', show: siblings.length > 0 },
    { id: 'related', label: 'Related', dot: 'bg-muted', show: related.length > 0 },
  ].filter((n) => n.show);

  return (
    <article>
      <TrackView id={q.id} />

      {/* ---- Header ---- */}
      <header className="mb-5">
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted">
          <Link href={isCareer ? '/career/' : `/categories/${q.category}/`} className="hover:text-accent">
            {labels[q.category] ?? q.category}
          </Link>
          <span aria-hidden>›</span>
          {q.source ? (
            <Link href={`/source/${q.source.docSlug}/`} className="hover:text-accent">{doc?.title ?? q.source.path}</Link>
          ) : (
            <span>{q.curated?.section ?? 'Frequently asked'}</span>
          )}
        </nav>
        <h1
          className="text-[1.45rem] font-semibold leading-[1.3] tracking-tight text-balance sm:text-3xl"
          dangerouslySetInnerHTML={{ __html: q.titleHtml }}
        />
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <OriginBadge origin={q.origin} />
          {q.perspective ? <Badge>{PERSPECTIVE_LABELS[q.perspective]}</Badge> : <Badge>{TYPE_LABELS[q.contentType]}</Badge>}
          <DifficultyBadge difficulty={q.difficulty} />
          {q.frequency && <Badge tone="accent">{FREQUENCY_LABELS[q.frequency]}</Badge>}
          {!q.hasAnswer && <Badge tone="warn">No answer yet</Badge>}
        </div>
        <div className="mt-4 hidden items-center gap-2 lg:flex">
          <FavoriteButton id={q.id} />
          {(q.hasAnswer || !!c) && <PracticeToggle />}
        </div>
        {q.source && (
          <div className="mt-3">
            <SourceLine q={q} />
          </div>
        )}
      </header>

      <SectionNav items={nav} />

      <div className="space-y-5">
        {/* ---- Answer ---- */}
        {q.curated ? (
          <Block id="answer" tone="answer" icon="mic" title={isCareer ? 'Your answer' : 'Interview answer'} hint="say this in your own words">
            <Reveal>
              <Html html={q.bodyHtml} />
            </Reveal>
          </Block>
        ) : q.kind === 'revision' ? (
          <Block id="revise" tone="revise" icon="check" title="Key takeaways" hint="from my notes">
            <NumberedList items={q.revisionItemsHtml ?? []} tone="revise" />
          </Block>
        ) : (
          <>
            {q.prep?.answerHtml && (
              <Block id="answer" tone="answer" icon="mic" title="Interview answer" hint="say this in your own words">
                <Reveal>
                  <Html html={q.prep.answerHtml} />
                </Reveal>
              </Block>
            )}
            {q.bodyHtml ? (
              <Block
                id={notesAndPolished ? 'notes' : 'answer'}
                tone={notesAndPolished ? 'neutral' : 'answer'}
                icon="notes"
                title="My notes"
                hint={q.source?.sectionPath.join(' › ') || 'original Markdown'}
              >
                {notesAndPolished ? (
                  <Html html={q.bodyHtml} />
                ) : (
                  <Reveal>
                    <Html html={q.bodyHtml} />
                  </Reveal>
                )}
              </Block>
            ) : (
              !q.prep?.answerHtml && (
                <Block id="answer" tone="neutral" icon="mic" title="Practice prompt">
                  <p className="text-muted">
                    There's no written answer in my notes yet. Answer it out loud, then compare with the related questions below.
                  </p>
                </Block>
              )
            )}
          </>
        )}

        {c?.variantsHtml && c.variantsHtml.length > 0 && (
          <Block id="versions" tone="variant" icon="layers" title="Tailored versions" hint="pick the one that fits the role">
            <VariantTabs variants={c.variantsHtml} />
          </Block>
        )}

        {c && (
          <Block id="analogy" tone="analogy" icon="bulb" title={isCareer ? 'How to frame it' : 'Analogy'} hint={isCareer ? undefined : 'explain it simply'}>
            <Html html={c.analogyHtml} className="text-ink" />
          </Block>
        )}

        {c && (
          <Block id="revise" tone="revise" icon="check" title="Quick revision" hint="memory hooks">
            <NumberedList items={c.quickRevisionHtml} tone="revise" />
          </Block>
        )}

        {c?.deepDiveHtml && (
          <Block id="deeper" tone="deep" icon="code" title="Go deeper">
            <Html html={c.deepDiveHtml} />
          </Block>
        )}

        {c?.avoidHtml && c.avoidHtml.length > 0 && (
          <Block id="avoid" tone="avoid" icon="ban" title="Don't say">
            <NumberedList items={c.avoidHtml} tone="avoid" />
          </Block>
        )}

        {c && (
          <Block id="follow-ups" tone="follow" icon="chat" title="Likely follow-ups" hint="they may ask next">
            <NumberedList items={c.followUpsHtml} tone="follow" />
          </Block>
        )}

        {/* ---- Same question in other sources (never discarded) ---- */}
        {siblings.length > 0 && (
          <Block id="other-answers" tone="neutral" icon="layers" title={`Also answered in ${siblings.length === 1 ? 'another source' : `${siblings.length} other sources`}`}>
            <div className="divide-y divide-line">
              {siblings.map((s) => (
                <div key={s.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <OriginBadge origin={s.origin} />
                    <Link href={`/q/${s.id}/`} className="text-sm font-medium hover:text-accent">{s.titleText}</Link>
                  </div>
                  {s.source && <div className="mb-3"><SourceLine q={s} /></div>}
                  {s.hasAnswer ? <Html html={s.bodyHtml} /> : <p className="text-sm text-muted">No written answer.</p>}
                </div>
              ))}
            </div>
          </Block>
        )}

        {related.length > 0 && (
          <section id="related" className="scroll-mt-32 lg:scroll-mt-20">
            <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wider text-muted">Related</h2>
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/q/${r.id}/`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:border-accent">
                    <span className={`size-2 shrink-0 rounded-full ${r.origin === 'curated' ? 'bg-curated' : 'bg-collected'}`} />
                    <span className="min-w-0 flex-1 text-[15px] leading-snug">{r.titleText}</span>
                    <span className="hidden shrink-0 text-xs text-muted sm:inline">{ORIGIN_LABELS[r.origin]}</span>
                    <Icon name="right" size={16} className="shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {q.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {q.tags.map((t) => <TagLink key={t} tag={t} />)}
        </div>
      )}

      {/* ---- Prev / next (desktop) ---- */}
      <nav className="mt-10 hidden grid-cols-2 gap-3 border-t border-line pt-6 text-sm lg:grid" aria-label="Neighbouring questions">
        {prev ? (
          <Link href={`/q/${prev.id}/`} className="rounded-2xl border border-line bg-surface p-4 hover:border-accent">
            <span className="flex items-center gap-1 text-xs text-muted"><Icon name="left" size={13} /> Previous</span>
            <span className="mt-1 line-clamp-2 block">{prev.titleText}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/q/${next.id}/`} className="rounded-2xl border border-line bg-surface p-4 text-right hover:border-accent">
            <span className="flex items-center justify-end gap-1 text-xs text-muted">Next <Icon name="right" size={13} /></span>
            <span className="mt-1 line-clamp-2 block">{next.titleText}</span>
          </Link>
        ) : <span />}
      </nav>

      <MobileQuestionBar id={q.id} prev={prev ? `/q/${prev.id}/` : undefined} next={next ? `/q/${next.id}/` : undefined} />
    </article>
  );
}
