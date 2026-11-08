/**
 * Content configuration — the ONLY file you need to edit to control what the
 * site reads from your Markdown notes. Your .md files are never modified.
 *
 * All globs are relative to the repository root (picomatch syntax).
 */
import type { ContentConfig } from './lib/content/types';

const config: ContentConfig = {
  /** Repository root, relative to site/. */
  contentRoot: '..',

  github: { repo: 'Hazrat16/interview-prep', branch: 'main' },

  /**
   * PRIVACY: files matching these globs are never read, indexed or published.
   * Remove `career/**` here when you are ready to publish (some of) it, or
   * add individual files, e.g. 'companies/techzu.md'.
   */
  exclude: [
    'career/**',
    'README.md', // repo-level index; links into career/
  ],

  /**
   * Always excluded (site code, tooling). You normally don't touch this.
   */
  alwaysExclude: ['site/**', '.github/**', '**/node_modules/**', '.claude/**'],

  /**
   * Files shown under "My Collected" as whole-document notes only — never
   * split into questions, never in All Questions or Quick Revision.
   * Also settable per file with frontmatter `type: note`.
   */
  notesOnly: [
    'career/star-stories.md',
    'career/priceestimator-real-stories.md',
    'career/complex-bug-and-critical-work.md',
    'career/smartcrowd.md',
    'career/linkedin-profile.md',
    'career/interview-tips.md',
    'career/tell-me-about-yourself.md',
    'career/questions-to-ask.md',
  ],

  /**
   * Files where plain (non-"?") leaf headings are themselves questions,
   * e.g. "### URL shortener" or "## 1. React lifecycle".
   */
  headingQuestionFiles: ['**/*questions*.md', '**/*solutions*.md', 'companies/**/*.md'],

  /**
   * Section headings that are structural, never questions (case-insensitive,
   * matched against the heading text with any leading "1." numbering removed).
   */
  structuralHeadings: [
    /^concept$/i,
    /^framework\b/i,
    /^common mistakes/i,
    /^questions to ask/i,
    /^question list$/i,
    /^quick revision/i,
    /^key takeaways/i,
    /^suggested study order/i,
    /^study order/i,
    /^file format/i,
    /^topics$/i,
    /^structure$/i,
    /^how to use/i,
    /^live coding etiquette/i,
    /^most common prompts/i,
    /^answers for each prompt/i,
    /^frontend system design: answers/i,
  ],

  /**
   * Leaf headings in question-bank files that are overviews / checklists
   * (a list of tasks), not a single question. Matched against the heading
   * with numbering and any trailing "(…)" removed, e.g. "SQL round (often included)". Their list items may still be
   * picked up as practice prompts.
   */
  bankOverviewHeadings: [/\b(questions|tasks|patterns|prompts|checklist|round)$/i],

  /**
   * Under headings matching these, plain list items ending in "?" become
   * practice prompts (questions without a written answer yet).
   */
  practicePromptHeadings: [/\b(questions|practice|mock|prompts)\b/i],

  /** Sections whose list items become Quick Revision cards. */
  revisionHeadings: [/^key takeaways/i, /^takeaways/i, /^tl;?dr/i, /cheat ?sheet/i],

  /**
   * Pretty labels for categories (top-level folders or curated `category`).
   * Unknown ones are auto title-cased. `includeTagged: true` also lists
   * questions from other folders tagged with the same slug (e.g. the DSA
   * solutions in javascript/ appear under DSA & Algorithms).
   */
  categories: {
    javascript: { label: 'JavaScript', order: 1 },
    frontend: { label: 'Frontend', order: 2 },
    backend: { label: 'Backend', order: 3 },
    database: { label: 'Database', order: 4 },
    'system-design': { label: 'System Design', order: 5, includeTagged: true },
    dsa: { label: 'DSA & Algorithms', order: 6, includeTagged: true },
    companies: { label: 'Company Interviews', order: 7 },
    career: { label: 'Career & HR', order: 8 },
  },

  privacy: {
    /**
     * Terms flagged in the parse report so you can review them before
     * publishing. Flagging never changes or hides content.
     */
    flagTerms: [
      'SmartJobHub',
      'Firmwide',
      'SmartCrowd',
      'PriceEstimator',
      'Sneaker Drop',
      'Doctor Appointment',
      'Techzu',
      'Talvette',
      'block-browser-back',
      'your CV',
      'DevOps CV',
      'salary expectation',
      'notice period',
    ],
  },
};

export default config;
