/** Shapes of the generated data (.generated/site.json and public/data/*.json). */
import type { Difficulty, Frequency, Perspective } from './schema';

export type { Difficulty, Frequency, Perspective };

export interface QuestionData {
  /** Globally unique: "topic/guide/id". Used for bookmarks, progress and review. */
  key: string;
  id: string;
  titleHtml: string;
  titleText: string;
  snippetHtml?: string;
  section?: string;
  perspective: Perspective;
  difficulty: Difficulty;
  frequency: Frequency;
  tags: string[];
  answerHtml: string;
  variants?: { label: string; html: string }[];
  analogyHtml: string;
  quickRevisionHtml: string[];
  deepDiveHtml?: string;
  avoidHtml?: string[];
  followUpsHtml: string[];
}

export interface GuideMeta {
  key: string; // "topic/guide"
  topic: string;
  slug: string;
  title: string;
  description: string;
  count: number;
  minutes: number;
  difficulty: Record<Difficulty, number>;
}

export interface GuideData extends GuideMeta {
  questions: QuestionData[];
  alsoAsked: { key: string; titleText: string; guideTitle: string }[];
}

export interface TopicData {
  slug: string;
  label: string;
  description: string;
  icon: string;
  guides: GuideMeta[];
  count: number;
}

export interface CheatSheet {
  slug: string;
  title: string;
  description: string;
  icon: string;
  html: string;
  headings: { depth: number; text: string; id: string }[];
  minutes: number;
}

export interface SiteData {
  generatedAt: string;
  topics: TopicData[];
  guides: GuideData[];
  cheatsheets: CheatSheet[];
}

/** Compact practice card shipped to the browser (public/data/cards.json). */
export interface Card {
  k: string; // question key
  g: string; // guide key
  t: string; // title html
  s?: string; // snippet html
  d: Difficulty;
  f: Frequency;
  p: Perspective;
  a: string; // answer html
  r: string[]; // quick revision html
}

export interface SearchDoc {
  id: string; // question key, "guide:<key>" or "sheet:<slug>"
  t: string; // title
  x: string; // body text
  g: string; // tags
  c: string; // context label (topic › guide)
  k: 'question' | 'guide' | 'sheet';
}
