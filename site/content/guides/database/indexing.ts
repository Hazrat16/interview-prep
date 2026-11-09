import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Indexing',
  description: 'B-tree indexes, composite indexes, covering indexes and when indexes hurt.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'database/mongodb/db-indexes-composite',
  ],
  questions: [
    {
      id: 'when-would-you-create-an-index',
      question: 'When would you create an index?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> I create indexes on columns frequently used in WHERE, JOIN, or ORDER BY clauses, especially on large tables. I avoid indexing rarely queried columns because indexes slow down writes and use extra storage.`,
      analogy: `Adding an index to a book only for the topics readers actually look up, not every word on every page.`,
      quickRevision: [
        'Columns in frequent WHERE / JOIN / ORDER BY',
        'High-selectivity columns',
        'Confirmed slow query (EXPLAIN shows a scan)',
        'Unique constraints (also an index)',
        'Not on write-heavy, rarely queried columns',
      ],
      followUps: [
        'What is selectivity?',
        'How do you find missing indexes in production?',
      ],
    },
    {
      id: 'what-index-for-where-status-active-order-by-createdat-desc',
      question: 'What index for `WHERE status = \'active\' ORDER BY created_at DESC`?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> A composite index on \`(status, created_at)\`. Status comes first because the query filters by it, then created_at supports ordering within that filtered set.

\`\`\`sql
CREATE INDEX idx_jobs_status_created_at
ON jobs(status, created_at DESC);
\`\`\``,
      analogy: `A filing cabinet sorted first by status drawer, then by date inside each drawer: you open the "active" drawer and the files are already in date order.`,
      quickRevision: [
        'Composite index (status, created_at DESC)',
        'Equality column first, then sort column',
        'Avoids a separate sort step',
        'Add LIMIT for pagination',
      ],
      followUps: [
        'Would (created_at, status) work as well?',
        'What if you also filter by user_id?',
      ],
    },
    {
      id: 'why-can-indexing-everything-be-harmful',
      question: 'Why can indexing everything be harmful?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Every insert, update, or delete must also maintain the indexes. Too many indexes increase write latency and storage cost. Indexes should be intentional based on real query patterns.`,
      analogy: `A book with an index entry for every single word: it's heavier, slower to update every time you edit a page, and nobody uses most of it.`,
      quickRevision: [
        'Every insert/update/delete must update each index',
        'More storage and memory',
        'Planner may pick badly; unused indexes are waste',
        'Index for real query patterns only',
      ],
      followUps: [
        'How do you find unused indexes?',
        'What is write amplification?',
      ],
    },
    {
      id: 'index-vs-cache',
      question: 'Index vs cache?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['sql', 'caching'],
      answer: `> An index lives inside the database and makes queries faster, but the query still hits the DB. A cache lives outside the DB (for example Redis) and can avoid the DB query entirely by returning stored results.

| Feature | Index | Cache |
|---------|-------|-------|
| Where | Inside DB | Outside DB (Redis/memory) |
| Purpose | Faster search | Avoid repeated DB work |
| Stores | Lookup structure | Actual results / objects |
| Trade-off | Slower writes | Stale data risk |`,
      analogy: `An index is a faster route to the shop; a cache is already having the groceries at home. One speeds up the trip, the other skips it.`,
      quickRevision: [
        'Index: DB structure, speeds up the query',
        'Query still runs with an index',
        'Cache: stores the result, skips the query',
        'Use both; cache adds staleness risk',
      ],
      followUps: [
        'Which would you add first for a slow endpoint?',
        'Can an index ever be stale?',
      ],
    },
  ],
});
