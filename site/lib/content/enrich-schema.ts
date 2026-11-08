/**
 * Enrichments add the curated sections (interview answer, analogy, quick
 * revision, follow-ups, difficulty) to questions collected from Markdown —
 * without touching the Markdown. One file per source note:
 *
 *   content/enrichments/javascript/closures.ts
 *   export default defineEnrichments('javascript/closures.md', {
 *     'what-is-a-closure': { difficulty: 'easy', analogy: '…', quickRevision: […], followUps: […] },
 *   });
 *
 * Keys are the last part of the question id (see the parse report or the URL
 * /q/<path>/<key>/). If a heading in the note is renamed, the build warns that
 * the enrichment no longer matches anything.
 */
import { z } from 'zod';
import { FREQUENCIES } from './curated-schema';

export const EnrichmentSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  frequency: z.enum(FREQUENCIES).optional(),
  /** Polished, interview-ready answer. Omit when the note's own answer already is one. */
  answer: z.string().min(80).optional(),
  analogy: z.string().min(30),
  quickRevision: z.array(z.string().min(5)).min(2).max(7),
  followUps: z.array(z.string().min(8)).min(2).max(6),
  deepDive: z.string().optional(),
  avoid: z.array(z.string().min(5)).optional(),
  tags: z.array(z.string()).optional(),
});

/** Reuse another question's enrichment (e.g. a task list row and its solution). */
export const SameAsSchema = z.object({ sameAs: z.string().min(3) });

export const EnrichmentEntrySchema = z.union([EnrichmentSchema, SameAsSchema]);

export type Enrichment = z.infer<typeof EnrichmentSchema>;
export type EnrichmentEntry = z.infer<typeof EnrichmentEntrySchema>;

export interface EnrichmentFile {
  source: string;
  entries: Record<string, EnrichmentEntry>;
}

export const defineEnrichments = (source: string, entries: Record<string, EnrichmentEntry>): EnrichmentFile => ({
  source,
  entries,
});
