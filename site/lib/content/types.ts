export interface ContentConfig {
  contentRoot: string;
  github: { repo: string; branch: string };
  exclude: string[];
  alwaysExclude: string[];
  notesOnly: string[];
  headingQuestionFiles: string[];
  structuralHeadings: RegExp[];
  bankOverviewHeadings: RegExp[];
  practicePromptHeadings: RegExp[];
  revisionHeadings: RegExp[];
  categories: Record<string, { label: string; order?: number }>;
  privacy: { flagTerms: string[] };
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ContentType =
  | 'concept-qa' // "### Q1: …" + answer in topic notes
  | 'quick-answer' // table row / short list answer
  | 'scenario' // "what would you do if…"
  | 'coding' // implement / live-coding / output prediction
  | 'system-design'
  | 'behavioral'
  | 'company-log' // asked at a specific company
  | 'note'; // whole document (stories, guides)

/** Which extraction rule produced a record — shown in the parse report. */
export type Detector =
  | 'qa-heading' // "### Q3: …"
  | 'question-heading' // heading ending in "?"
  | 'bank-heading' // leaf heading in a question-bank file
  | 'table-row' // | Question | Short answer |
  | 'bold-list-item' // 1. **Question?** answer
  | 'prompt-list-item' // 1. Plain question? (practice prompt, no answer)
  | 'takeaways' // ## Key takeaways list
  | 'whole-document'; // fallback / notesOnly

export interface SourceRef {
  /** Repo-relative path, e.g. "database/caching.md". */
  path: string;
  /** 1-based inclusive line range in the original file. */
  startLine: number;
  endLine: number;
  /** GitHub heading anchor, when the record starts at a heading. */
  anchor?: string;
  /** Deep link to the original text on GitHub. */
  githubUrl: string;
  /** Heading trail inside the file, e.g. ["Interview Q&A", "Easy"]. */
  sectionPath: string[];
}

export interface CollectedRecord {
  id: string;
  origin: 'collected';
  kind: 'question' | 'note' | 'revision';
  /** Question / title as original inline Markdown (may contain `code`). */
  title: string;
  /** Plain-text title for search and duplicate detection. */
  titleText: string;
  /** Original Markdown, sliced verbatim from the source file. */
  bodyMarkdown: string;
  /** For revision records: individual takeaway lines (verbatim Markdown). */
  revisionItems?: string[];
  category: string;
  contentType: ContentType;
  difficulty?: Difficulty;
  tags: string[];
  detector: Detector;
  source: SourceRef;
  /** Records whose question normalises to the same text (all kept). */
  duplicateGroup?: string;
  /** Similar-but-not-identical questions elsewhere. */
  relatedIds?: string[];
  /** False for practice prompts collected without a written answer. */
  hasAnswer: boolean;
  /** Content that can be shown as a flashcard in Quick Revision. */
  revisionEligible: boolean;
}

export interface SourceDocument {
  path: string;
  title: string;
  category: string;
  isIndex: boolean; // README.md
  isNote: boolean;
  frontmatter: Record<string, unknown>;
  rawMarkdown: string;
  lineCount: number;
  lastModified?: string;
  headings: { depth: number; text: string; anchor: string; line: number }[];
  recordIds: string[];
  /** Top-level sections not turned into any record (still visible in the doc view). */
  uncovered: { heading: string; startLine: number; endLine: number }[];
  privacyFlags: PrivacyFlag[];
}

export interface PrivacyFlag {
  line: number;
  rule: string;
  match: string;
  excerpt: string;
}

export interface Category {
  slug: string;
  label: string;
  order: number;
  intro?: string; // from the folder README
  documentPaths: string[];
}

export interface ContentIndex {
  generatedAt: string;
  categories: Category[];
  documents: SourceDocument[];
  records: CollectedRecord[];
  duplicateGroups: { id: string; key: string; recordIds: string[] }[];
  excludedFiles: string[];
}
