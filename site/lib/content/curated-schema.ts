/**
 * Schema for curated questions. Every file in site/content/curated/*.ts that
 * default-exports `CuratedQuestion[]` is discovered automatically at build
 * time, so the set can grow to hundreds of questions by adding files — no
 * index to maintain. All Markdown fields support `code`, lists and fences.
 */
import { z } from 'zod';

export const PERSPECTIVES = [
  'concept', // "What is X?" — definition + why it exists
  'practical', // "Where have you used X?" — real usage
  'trade-off', // "X vs Y — when would you choose which?"
  'debugging', // "Something is broken — how do you find it?"
  'scenario', // "What would you do if…"
  'coding', // "Implement / write…"
  'design', // architecture / system design
  'behavioral', // experience-based, technical flavour
] as const;

export const FREQUENCIES = ['very-high', 'high', 'medium'] as const;

export const CuratedQuestionSchema = z.object({
  /** kebab-case, unique across all curated files; becomes the URL. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be kebab-case'),
  question: z.string().min(8),
  /** Must be a site category slug (javascript, frontend, backend, database, career, …). */
  category: z.string().min(2),
  perspective: z.enum(PERSPECTIVES),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  frequency: z.enum(FREQUENCIES),
  tags: z.array(z.string().min(2)).min(1),
  /** Interview-ready answer, ~30–90 seconds when spoken. Markdown. */
  answer: z.string().min(120),
  /** A practical, everyday analogy. Markdown. */
  analogy: z.string().min(30),
  /** 3–7 one-line memory hooks. Markdown (inline). */
  quickRevision: z.array(z.string().min(5)).min(3).max(7),
  /** Likely follow-up questions. Markdown (inline). */
  followUps: z.array(z.string().min(8)).min(2).max(6),
  /** Optional code sample or deeper detail shown below the answer. Markdown. */
  deepDive: z.string().optional(),
  /** Collected record ids to link explicitly (auto-linking also happens). */
  relatedCollected: z.array(z.string()).optional(),
});

export type CuratedQuestion = z.infer<typeof CuratedQuestionSchema>;
export type Perspective = (typeof PERSPECTIVES)[number];

/** Identity helper for authoring with type checking. */
export const defineQuestions = (qs: CuratedQuestion[]) => qs;
