import type { QuestionSummary, SiteQuestion } from './content/site-types';

export function toSummary(q: SiteQuestion, groupSize = 1): QuestionSummary {
  return {
    id: q.id,
    t: q.titleText,
    c: q.category,
    o: q.origin,
    y: q.contentType,
    p: q.perspective,
    d: q.difficulty,
    f: q.frequency,
    g: q.tags,
    a: q.hasAnswer,
    n: groupSize,
    u: q.duplicateGroup,
    s: q.source?.path,
  };
}
