import type { ContentType, Detector, Difficulty, SourceRef } from './types';
import type { Perspective } from './curated-schema';

export type Origin = 'collected' | 'curated';

export interface SiteQuestion {
  id: string;
  origin: Origin;
  kind: 'question' | 'note' | 'revision';
  titleText: string;
  titleHtml: string;
  bodyHtml: string;
  category: string;
  contentType: ContentType;
  perspective?: Perspective;
  difficulty?: Difficulty;
  frequency?: 'very-high' | 'high' | 'medium';
  tags: string[];
  hasAnswer: boolean;
  revisionEligible: boolean;
  detector?: Detector | 'curated';
  /** Collected only: where the text came from. */
  source?: SourceRef & { docSlug: string };
  /** Curated only. */
  curated?: {
    file: string;
    analogyHtml: string;
    quickRevisionHtml: string[];
    followUpsHtml: string[];
    deepDiveHtml?: string;
  };
  revisionItemsHtml?: string[];
  duplicateGroup?: string;
  relatedIds: string[];
}

export interface SiteDocument {
  path: string;
  slug: string;
  title: string;
  category: string;
  isIndex: boolean;
  isNote: boolean;
  html: string;
  headings: { depth: number; text: string; anchor: string; line: number }[];
  lineCount: number;
  lastModified?: string;
  recordIds: string[];
  githubUrl: string;
}

export interface SiteCategory {
  slug: string;
  label: string;
  order: number;
  introHtml?: string;
  documentPaths: string[];
  questionCount: number;
  collectedCount: number;
  curatedCount: number;
}

export interface SiteTag {
  slug: string;
  label: string;
  count: number;
}

export interface SiteData {
  generatedAt: string;
  categories: SiteCategory[];
  tags: SiteTag[];
  documents: SiteDocument[];
  questions: SiteQuestion[];
  duplicateGroups: { id: string; recordIds: string[] }[];
}

/** Compact row shipped to the browser for lists, favorites and search results. */
export interface QuestionSummary {
  id: string;
  t: string; // title text
  c: string; // category
  o: Origin;
  y: ContentType;
  p?: Perspective;
  d?: Difficulty;
  f?: SiteQuestion['frequency'];
  g: string[]; // tags
  a: boolean; // has answer
  n: number; // number of answers in its duplicate group (1 = unique)
  u?: string; // duplicate group id
  s?: string; // source path (collected)
}

export interface RevisionCard {
  id: string; // question id (or revision record id)
  kind: 'qa' | 'takeaways' | 'points';
  q: string; // front (html)
  a: string; // back (html)
  c: string;
  o: Origin;
  g: string[];
  d?: Difficulty;
}

export interface SearchDoc {
  id: string;
  t: string; // title
  x: string; // body text
  g: string; // tags joined
  c: string; // category label
  k: 'question' | 'note' | 'doc';
  o?: Origin;
  y?: string;
}
