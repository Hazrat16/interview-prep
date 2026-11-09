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
      question: 'What is a database index, how does it work, and when would you create one?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `An index is a **separate, sorted data structure** that points to table rows, so the database can find matching rows **without scanning the whole table**. The default in Postgres and MySQL is a **B-tree**: a balanced tree where a lookup takes \`O(log n)\` steps, and because it's sorted it also serves **range queries** (\`>\`, \`BETWEEN\`) and **\`ORDER BY\`** without a separate sort.

I add an index when a query on a **large table** filters, joins or sorts on a column and it's **frequent or slow**:

- Columns in \`WHERE\` clauses that are **selective** (they narrow the result a lot): \`email\`, \`user_id\`, \`order_number\`.
- **Foreign keys** used in \`JOIN\`s. Postgres doesn't index them automatically, and an unindexed FK also makes deletes on the parent slow.
- Columns used for \`ORDER BY\` with \`LIMIT\` (feeds, "latest orders").
- **Unique constraints** (which create an index anyway).

I don't guess: I find the slow query (\`pg_stat_statements\`, slow query log), run **\`EXPLAIN ANALYZE\`**, look for a sequential scan on a big table, add the index, and check that the plan and timing actually improved.`,
      analogy: `The index at the back of a textbook: instead of reading every page to find "deadlock", you look it up alphabetically and jump to page 214.`,
      quickRevision: [
        'Separate sorted structure (B-tree) pointing to rows',
        'O(log n) lookups, ranges and ORDER BY without sorting',
        'Index selective WHERE columns, foreign keys, sort columns',
        'Small tables / low-selectivity columns rarely benefit',
        'Prove it with `EXPLAIN ANALYZE` before and after',
      ],
      deepDive: `\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
-- Seq Scan on orders (rows=2,000,000) … 480 ms

CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders (customer_id);

EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
-- Index Scan using idx_orders_customer_id … 0.4 ms
\`\`\`

\`CONCURRENTLY\` builds the index without blocking writes on a live table (Postgres).`,
      followUps: [
        'How do you know if a query uses an index?',
        'Why doesn\'t Postgres index foreign keys automatically?',
        'What other index types exist besides B-tree?',
      ],
    },
    {
      id: 'what-index-for-where-status-active-order-by-createdat-desc',
      question: `Which index would you create for \`WHERE status = 'active' ORDER BY created_at DESC LIMIT 20\`, and why does column order matter?`,
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `A **composite index on \`(status, created_at DESC)\`**.

Column order matters because a B-tree on several columns is sorted by the **first column, then by the second within each first value**, like a phone book sorted by last name, then first name. So:

- \`status\` goes **first** because it's an **equality** filter: the database jumps straight to the \`'active'\` section.
- Inside that section, entries are **already sorted by \`created_at\`**, so the database reads the first 20 and stops. **No sort step**, no scanning every active row.

If the order were \`(created_at, status)\`, the index couldn't jump to the active rows; it would walk dates and filter, which is much worse when most rows aren't active.

The general rule is **equality columns first, then range or sort columns**. This index also serves queries filtering on \`status\` alone (the **leftmost prefix**), but not ones filtering on \`created_at\` alone. If almost all queries are for \`'active'\`, a **partial index** (\`… WHERE status = 'active'\`) is smaller still.`,
      analogy: `A filing cabinet sorted first by status drawer, then by date inside each drawer: you open the "active" drawer and the files are already in date order.`,
      quickRevision: [
        '`(status, created_at DESC)`',
        'Equality columns first, then range/sort columns',
        'Index already sorted → read 20 rows and stop, no sort',
        'Leftmost prefix: serves `status` alone, not `created_at` alone',
        'Partial index if you only ever query `active`',
      ],
      deepDive: `\`\`\`sql
CREATE INDEX idx_jobs_status_created_at ON jobs (status, created_at DESC);

-- Or, if only active jobs are ever listed:
CREATE INDEX idx_jobs_active_created_at ON jobs (created_at DESC) WHERE status = 'active';
\`\`\``,
      followUps: [
        'What is the leftmost-prefix rule?',
        'What is a covering index?',
        'When would a partial index be better?',
      ],
    },
    {
      id: 'why-can-indexing-everything-be-harmful',
      question: 'Why is indexing every column a bad idea? What are the costs of an index?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `Indexes speed up reads, but they **aren't free**:

- **Slower writes.** Every \`INSERT\`, every \`DELETE\`, and every \`UPDATE\` of an indexed column must also update **every index** on the table. A table with ten indexes does roughly ten extra writes per insert, and more WAL and replication traffic.
- **Storage and memory.** Indexes take disk space and, more importantly, compete for **RAM** in the buffer cache. When indexes no longer fit in memory, everything slows down.
- **Little benefit on low-selectivity columns.** An index on a boolean like \`is_active\`, where half the rows match, is often ignored by the planner because a sequential scan is cheaper.
- **Planner confusion and maintenance.** Many overlapping indexes make plans harder to predict, and they all need vacuuming and occasional rebuilding.

So I index for **real query patterns**: start from slow-query logs, prefer one well-designed **composite** index over several single-column ones, and periodically drop **unused indexes** (Postgres shows them in \`pg_stat_user_indexes\` with \`idx_scan = 0\`).`,
      analogy: `A book with an index entry for every single word: it's heavier, slower to update every time you edit a page, and nobody uses most of it.`,
      quickRevision: [
        'Each index adds work to every INSERT/DELETE and relevant UPDATE',
        'Costs disk and, more importantly, RAM',
        'Low-selectivity columns rarely help',
        'Index real query patterns; prefer composite indexes',
        'Drop unused indexes (`idx_scan = 0`)',
      ],
      followUps: [
        'How do you find unused indexes?',
        'Why might the planner ignore an index?',
        'What is index bloat?',
      ],
    },
    {
      id: 'index-vs-cache',
      question: 'What is the difference between a database index and a cache?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['sql', 'caching'],
      answer: `They both make reads faster, but at different layers and in different ways.

An **index** lives **inside the database**. It's a sorted lookup structure (usually a B-tree) that helps the database **find rows quickly**, but the **query still runs**: there's still a network round trip, planning, reading the rows and returning them. Indexes are **always consistent**, because the database updates them in the same transaction as the data. The cost is **slower writes** and storage.

A **cache** lives **outside the database**, in Redis or in memory. It stores the **finished result** (an object, a JSON response, a computed aggregate), so a cache hit **skips the database entirely**. The cost is **staleness**: the cache can be out of date until it expires or is invalidated, and you have to write that invalidation logic.

So for a slow endpoint I add the **index first**: it fixes the root cause and never serves wrong data. Then I add a **cache** if the same expensive result is read very often, or the database needs protecting from load.`,
      analogy: `An index is a faster route to the shop; a cache is already having the groceries at home. One speeds up the trip, the other skips it.`,
      quickRevision: [
        'Index: inside the DB, speeds up finding rows; query still runs',
        'Index is always consistent; costs write speed',
        'Cache: outside the DB, stores results; hit skips the DB',
        'Cache costs staleness + invalidation logic',
        'Index first, cache for hot repeated reads',
      ],
      deepDive: `| | Index | Cache |
|---|---|---|
| Where | Inside the DB | Outside (Redis / memory) |
| Stores | Lookup structure | Finished results |
| On a hit | Query still runs, faster | DB skipped |
| Consistency | Always consistent | Can be stale |
| Cost | Slower writes, storage | Memory, invalidation logic |`,
      followUps: [
        'Which would you add first for a slow endpoint?',
        'Can an index ever be stale?',
      ],
    },
  ],
});
