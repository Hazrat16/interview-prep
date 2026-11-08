import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('database/indexing.md', {
  'what-is-an-index': { sameAs: 'faq/db-indexes-composite' },
  'when-would-you-create-an-index': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Adding an index to a book only for the topics readers actually look up, not every word on every page.',
    quickRevision: ['Columns in frequent WHERE / JOIN / ORDER BY', 'High-selectivity columns', 'Confirmed slow query (EXPLAIN shows a scan)', 'Unique constraints (also an index)', 'Not on write-heavy, rarely queried columns'],
    followUps: ['What is selectivity?', 'How do you find missing indexes in production?'],
  },
  'what-index-for-where-status--active-order-by-createdat-desc': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'A filing cabinet sorted first by status drawer, then by date inside each drawer: you open the "active" drawer and the files are already in date order.',
    quickRevision: ['Composite index (status, created_at DESC)', 'Equality column first, then sort column', 'Avoids a separate sort step', 'Add LIMIT for pagination'],
    followUps: ['Would (created_at, status) work as well?', 'What if you also filter by user_id?'],
  },
  'why-can-indexing-everything-be-harmful': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'A book with an index entry for every single word: it\'s heavier, slower to update every time you edit a page, and nobody uses most of it.',
    quickRevision: ['Every insert/update/delete must update each index', 'More storage and memory', 'Planner may pick badly; unused indexes are waste', 'Index for real query patterns only'],
    followUps: ['How do you find unused indexes?', 'What is write amplification?'],
  },
  'index-vs-cache': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'An index is a faster route to the shop; a cache is already having the groceries at home. One speeds up the trip, the other skips it.',
    quickRevision: ['Index: DB structure, speeds up the query', 'Query still runs with an index', 'Cache: stores the result, skips the query', 'Use both; cache adds staleness risk'],
    followUps: ['Which would you add first for a slow endpoint?', 'Can an index ever be stale?'],
  },
});
