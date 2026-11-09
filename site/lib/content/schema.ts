/**
 * Content schema. A topic is a folder under site/content/guides/, a guide is
 * one file in it, and a guide holds questions:
 *
 *   content/guides/javascript/closures.ts
 *   export default defineGuide({ title: 'Closures', description: '…', questions: [ … ] });
 *
 * Topic labels and guide order live in content/topics.ts. Every Markdown field
 * supports `code`, lists, tables and fenced code blocks.
 */
import { z } from 'zod';

export const PERSPECTIVES = [
  'concept', // "What is X?" — definition + why it exists
  'practical', // "Where have you used X?" — real usage
  'trade-off', // "X vs Y — when would you choose which?"
  'debugging', // "Something is broken — how do you find it?"
  'scenario', // "What would you do if…"
  'coding', // "Implement / write… / what does this print?"
  'design', // architecture / system design
  'behavioral', // experience-based
] as const;

export const FREQUENCIES = ['very-high', 'high', 'medium'] as const;
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

const kebab = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be kebab-case');

export const QuestionSchema = z.object({
  /** kebab-case, unique inside its guide; becomes the anchor and part of the stored id. */
  id: kebab,
  /** The question. Inline Markdown. */
  question: z.string().min(4),
  /** Code shown with the question, e.g. for "what does this print?". Markdown (usually one fenced block). */
  snippet: z.string().optional(),
  perspective: z.enum(PERSPECTIVES),
  difficulty: z.enum(DIFFICULTIES),
  frequency: z.enum(FREQUENCIES),
  tags: z.array(z.string().min(2)).min(1),
  /** Interview-ready answer, ~30–90 seconds when spoken. Markdown. */
  answer: z.string().min(20),
  /** A practical, everyday analogy (or "how to frame it" for HR questions). Markdown. */
  analogy: z.string().min(20),
  /** 2–7 one-line memory hooks. Inline Markdown. Also used as the back of Last-Minute cards. */
  quickRevision: z.array(z.string().min(3)).min(2).max(8),
  /** Likely follow-up questions. Inline Markdown. */
  followUps: z.array(z.string().min(5)).min(1).max(8),
  /** Code sample or deeper detail shown below the answer. Markdown. */
  deepDive: z.string().optional(),
  /** Alternative answers (e.g. "Short version", "Frontend role"). */
  variants: z.array(z.object({ label: z.string().min(2), answer: z.string().min(10) })).optional(),
  /** Things not to say. Inline Markdown. */
  avoid: z.array(z.string().min(3)).optional(),
  /** Optional group heading inside the guide (e.g. "Easy", "Scenario-based"). */
  section: z.string().optional(),
});

export const GuideSchema = z.object({
  title: z.string().min(2),
  /** One sentence shown on topic pages and the guide header. */
  description: z.string().min(10),
  /** Questions asked in this context that live in another guide: "topic/guide/question-id". */
  alsoAsked: z.array(z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/)).optional(),
  questions: z.array(QuestionSchema).min(1),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Guide = z.infer<typeof GuideSchema>;
export type Perspective = (typeof PERSPECTIVES)[number];
export type Frequency = (typeof FREQUENCIES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface TopicDef {
  slug: string;
  label: string;
  description: string;
  /** Icon name from components/Icons.tsx. */
  icon: string;
  /** Guide file names (without .ts) in display order. */
  guides: string[];
}

export interface CheatSheetDef {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

/** Identity helpers for authoring with type checking. */
export const defineGuide = (g: Guide) => g;
export const defineTopics = (t: TopicDef[]) => t;
