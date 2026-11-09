import type { QuestionData } from '@/lib/content/types';
import { FREQUENCY_LABELS, PERSPECTIVE_LABELS } from '@/lib/labels';
import { Block, NumberedList } from './Block';
import { Html } from './Html';
import { Badge, DifficultyBadge } from './Badges';
import { BookmarkButton, KnownButton, KnownDot, QuestionShell, Reveal, ReviewButton, VariantTabs } from './QuestionClient';

export function QuestionHeader({ q, n }: { q: QuestionData; n: number }) {
  return (
    <span className="flex gap-3">
      <span className="mt-1 w-9 shrink-0 font-mono text-xs font-semibold tabular-nums text-accent">Q.{String(n).padStart(2, '0')}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[17px] font-semibold leading-snug sm:text-[19px]">
          <span className="md-inline" dangerouslySetInnerHTML={{ __html: q.titleHtml }} />
          <KnownDot id={q.key} />
        </span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          <DifficultyBadge difficulty={q.difficulty} />
          <Badge>{PERSPECTIVE_LABELS[q.perspective]}</Badge>
          {q.frequency !== 'medium' && <Badge tone="accent">{FREQUENCY_LABELS[q.frequency]}</Badge>}
        </span>
      </span>
    </span>
  );
}

/** The answer sections: Answer → Versions → Analogy → Quick revision → Go deeper → Don't say → Follow-ups. */
export function QuestionBody({ q, career }: { q: QuestionData; career?: boolean }) {
  return (
    <div className="space-y-5">
      {q.snippetHtml && <Html html={q.snippetHtml} className="-my-2" />}
      <Block tone="answer" icon="mic" title={career ? 'Your answer' : 'Interview answer'} hint="say this in your own words">
        <Reveal>
          <Html html={q.answerHtml} />
        </Reveal>
      </Block>

      {q.variants && q.variants.length > 0 && (
        <Block tone="variant" icon="layers" title="Other versions" hint="pick the one that fits">
          <VariantTabs variants={q.variants} />
        </Block>
      )}

      <Block tone="analogy" icon="bulb" title={career ? 'How to frame it' : 'Analogy'} hint={career ? undefined : 'explain it simply'}>
        <Html html={q.analogyHtml} className="text-ink" />
      </Block>

      <Block tone="revise" icon="check" title="Quick revision" hint="memory hooks">
        <NumberedList items={q.quickRevisionHtml} tone="revise" />
      </Block>

      {q.deepDiveHtml && (
        <Block tone="deep" icon="code" title="Go deeper">
          <Html html={q.deepDiveHtml} />
        </Block>
      )}

      {q.avoidHtml && q.avoidHtml.length > 0 && (
        <Block tone="avoid" icon="ban" title="Don't say">
          <NumberedList items={q.avoidHtml} tone="avoid" />
        </Block>
      )}

      <Block tone="follow" icon="chat" title="Likely follow-ups" hint="they may ask next">
        <NumberedList items={q.followUpsHtml} tone="follow" />
      </Block>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <KnownButton id={q.key} />
        <ReviewButton id={q.key} />
        <BookmarkButton id={q.key} />
        {q.tags.length > 0 && (
          <span className="ml-auto flex flex-wrap gap-1.5">
            {q.tags.map((t) => (
              <span key={t} className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">
                {t}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export function QuestionItem({ q, n, defaultOpen, career }: { q: QuestionData; n: number; defaultOpen?: boolean; career?: boolean }) {
  return (
    <QuestionShell id={q.id} title={q.titleText} defaultOpen={defaultOpen} header={<QuestionHeader q={q} n={n} />}>
      <QuestionBody q={q} career={career} />
    </QuestionShell>
  );
}
