import { defineQuestions } from '../../lib/content/curated-schema';

export default defineQuestions([
  {
    id: 'db-sql-vs-nosql-choice',
    question: 'SQL (PostgreSQL) vs NoSQL (MongoDB) — how do you choose for a project?',
    category: 'database',
    perspective: 'trade-off',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['sql', 'mongodb', 'system-design'],
    answer: `I decide based on the **shape of the data** and **how it's accessed**, not on hype.

**PostgreSQL** fits when data is **relational** (users, orders, invoices, payments that reference each other), needs **strong consistency and multi-row transactions** (money, inventory), and benefits from **constraints** (foreign keys, unique, check) and flexible ad-hoc queries and reporting with joins. Postgres also has \`JSONB\` for the semi-structured parts.

**MongoDB** fits when data is **document-shaped** and usually read as a whole (a product with variants, a CMS page, event logs), the **schema varies** or evolves quickly, and you need easy horizontal scaling for huge write volumes. It does support multi-document transactions, but if you need them everywhere, that's a sign the data is relational.

The deciding questions: what are the main **queries**? How important are **cross-entity consistency** and reporting? What does the team know? For most business apps (invoicing, bookings) I default to **Postgres**. I've used MongoDB with Mongoose successfully where documents map naturally to screens, and I enforce structure with schema validation and indexes.`,
    analogy: `Postgres is a well-organised filing cabinet with cross-referenced folders and strict forms: great when everything links together and must stay consistent. MongoDB is a set of self-contained folders where each folder has everything about one thing: fast to grab and flexible, but cross-referencing between folders is your job.`,
    quickRevision: [
      'Relational + transactions + constraints + reporting → Postgres',
      'Document-shaped, read as a whole, evolving schema → MongoDB',
      'Postgres JSONB covers many "flexible field" needs',
      'Needing transactions everywhere in Mongo = probably relational data',
      'Decide by access patterns and consistency needs',
    ],
    followUps: [
      'How would you model an order with line items in each?',
      'What is eventual consistency?',
      'How do joins compare to `$lookup`?',
    ],
  },
  {
    id: 'db-indexes-composite',
    question: 'How do database indexes work, and how do you choose a composite index?',
    category: 'database',
    perspective: 'concept',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['sql', 'mongodb', 'performance'],
    answer: `An index is a separate, **sorted data structure** (usually a **B-tree**) that maps column values to row locations. The database can **jump** to matching rows in O(log n) instead of **scanning the whole table**. It also helps \`ORDER BY\` and range queries, because the entries are already sorted.

**Composite indexes**: column order matters because of the **leftmost-prefix rule**. An index on \`(status, created_at)\` can serve \`WHERE status = ?\` and \`WHERE status = ? ORDER BY created_at\`, but **not** \`WHERE created_at > ?\` alone. My rule of thumb: **equality filters first, then range or sort columns** (the ESR rule in Mongo: Equality, Sort, Range).

The trade-offs: every index **slows writes** (it must be updated on each insert or update) and uses disk and memory. Low-selectivity columns (a boolean) rarely help alone. So I add indexes for **real slow queries** and confirm with \`EXPLAIN ANALYZE\` (Index Scan instead of Seq Scan) or Mongo's \`explain('executionStats')\` (IXSCAN, and docs examined close to docs returned).`,
    analogy: `A book's index. Instead of reading every page to find "deadlock", you look it up alphabetically and jump to page 147. A composite index is like a phone book sorted by surname, then first name: great for finding "Rahman, Karim", useless for finding everyone named Karim regardless of surname.`,
    quickRevision: [
      'Index = sorted B-tree → jump instead of full scan',
      'Composite: leftmost-prefix rule; equality → sort → range',
      'Helps WHERE, JOIN, ORDER BY',
      'Cost: slower writes, more storage',
      'Verify with EXPLAIN ANALYZE / explain()',
    ],
    followUps: [
      'What index would you create for `WHERE user_id = ? AND status = ? ORDER BY created_at DESC`?',
      'What is a covering index?',
      'Why might the planner ignore your index?',
    ],
    relatedCollected: ['database/indexing/what-is-an-index'],
  },
  {
    id: 'db-transactions-isolation-race',
    question: 'Two users try to buy the last item at the same time. How do you prevent overselling?',
    category: 'database',
    perspective: 'scenario',
    difficulty: 'hard',
    frequency: 'very-high',
    tags: ['sql', 'mongodb', 'redis', 'system-design'],
    answer: `This is a **race condition**. Both read "stock = 1", both decide to sell, and both write. Reading and then writing in application code isn't safe. The check and the update must be **atomic**. Options, from simplest:

1. **Atomic conditional update** (my default):
   \`UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0\`. If **0 rows** are affected, it's sold out. In Mongo: \`findOneAndUpdate({ _id, stock: { $gt: 0 } }, { $inc: { stock: -1 } })\`.
2. **Pessimistic locking**: \`SELECT ... FOR UPDATE\` inside a transaction locks the row, so the second buyer waits. Good when you need several checks before writing. Keep the transaction short to avoid lock contention and deadlocks.
3. **Optimistic locking**: a \`version\` column, \`UPDATE ... WHERE id = ? AND version = ?\`, retry on conflict. Good when conflicts are rare.
4. **Constraints**: \`CHECK (stock >= 0)\` as a safety net.

Put the order creation and the stock decrement in **one transaction** so you never get stock reduced without an order. For **flash sales**, use a fast Redis atomic counter (\`DECR\`) or a short-lived **reservation with a TTL** (hold for 10 minutes until payment), then confirm in the DB, with a queue absorbing the spike.`,
    analogy: `Two people reaching for the last concert ticket at two different counters. If both counters check a printed list, both sell it. The fix is one central system where "check and take" is a single action. The first request takes it, and the second is told "sold out" immediately.`,
    quickRevision: [
      'Read-then-write in app code = race condition',
      'Atomic: `UPDATE … WHERE stock > 0` + check affected rows',
      'Pessimistic: `SELECT … FOR UPDATE` (short transactions)',
      'Optimistic: version column + retry',
      'Order + stock in one transaction; flash sale → Redis DECR / TTL reservation + queue',
    ],
    followUps: [
      'What are isolation levels, and which anomalies does each prevent?',
      'What is a deadlock and how do you avoid it?',
      'Pessimistic vs optimistic locking: when to use each?',
    ],
    relatedCollected: ['database/transactions-and-acid/two-users-buy-the-last-item-at-the-same-time-which-property-matters-most'],
  },
  {
    id: 'db-n-plus-one',
    question: 'What is the N+1 query problem, and how do you fix it?',
    category: 'database',
    perspective: 'debugging',
    difficulty: 'easy',
    frequency: 'high',
    tags: ['sql', 'mongodb', 'performance', 'api-design'],
    answer: `N+1 happens when you run **1 query to get a list**, then **1 more query per item** to get related data. Fetching 50 invoices and then the client for each one is **51 round-trips**. Each query is fast on its own, so it's easy to miss in development with 5 rows and painful in production with 500.

It's common with ORMs (lazy loading), in GraphQL resolvers, and with Mongoose when calling \`populate\` or \`findById\` inside a loop.

Fixes:

- **Join** in SQL, or use the ORM's eager loading (Prisma \`include\`, Sequelize \`include\`, TypeORM relations).
- **Batch**: collect IDs and run **one** \`WHERE id IN (...)\` / Mongo \`$in\`, then map the results in memory.
- **\`$lookup\`** in a Mongo aggregation, or **denormalise** fields that are always shown together (store \`clientName\` on the invoice).
- **DataLoader** in GraphQL to batch and cache per request.

Detect it by logging query counts per request, or with APM traces that show many identical queries.`,
    analogy: `Going to the supermarket 51 times: once for the shopping list, then a separate trip for each item. The fix is one trip with the full list (\`IN\` / join).`,
    quickRevision: [
      '1 list query + N per-item queries = N+1',
      'Hidden in dev, slow in prod',
      'Fix: JOIN / eager load, batch with `IN`/`$in`, `$lookup`, DataLoader',
      'Denormalise always-shown fields when it makes sense',
      'Detect via query counts / traces',
    ],
    followUps: [
      'How does DataLoader batch requests?',
      'When is denormalising worth the update complexity?',
    ],
  },
  {
    id: 'db-mongo-embed-vs-reference',
    question: 'MongoDB schema design: when do you embed documents and when do you reference them?',
    category: 'database',
    perspective: 'design',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['mongodb', 'system-design'],
    answer: `The rule in Mongo is **design for how the data is read**.

**Embed** (sub-documents or arrays inside the parent) when the child:

- is **always read together** with the parent (an address on a user, line items on an order);
- belongs to only that parent and has **no independent life**;
- has a **bounded** size (a few dozen items, not unbounded growth).

You get one read with no joins, plus atomic updates on a single document.

**Reference** (store an \`ObjectId\` and query or \`populate\` separately) when the child:

- is **shared** by many parents (a product referenced by many orders, a user in many projects);
- **grows without bound** (comments, messages, logs). Remember the **16 MB document limit**;
- is **queried or updated independently**.

The common middle ground is **reference plus a small denormalised copy**: store \`customerId\` and \`customerName\` on an invoice so lists render without a lookup, and accept updating the copy when the name changes (or treat it as a historical snapshot, which for invoices is often correct).`,
    analogy: `A passport vs a library card. Your photo and details are **embedded** in the passport because they're always needed together and belong only to you. Your library card holds a **reference** number; the books themselves live on shared shelves because many people borrow them.`,
    quickRevision: [
      'Model for reads (access patterns)',
      'Embed: read together, owned, bounded',
      'Reference: shared, unbounded, independently queried',
      '16 MB document limit → never embed unbounded arrays',
      'Hybrid: reference + denormalised display fields',
    ],
    followUps: [
      'How would you model chat conversations and messages?',
      'What does `populate` do under the hood?',
      'How do you keep denormalised fields in sync?',
    ],
  },
  {
    id: 'db-redis-caching-strategy',
    question: 'How do you add Redis caching to an API without serving stale or wrong data?',
    category: 'database',
    perspective: 'practical',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['redis', 'caching', 'performance', 'api-design'],
    answer: `I use **cache-aside**, the most common pattern: on a read, check Redis; on a miss, read the DB, store the result with a **TTL**, and return it. On writes, update the DB and then **delete (invalidate) the related keys**, so the next read repopulates them.

Getting it right:

- **What to cache**: hot, expensive, read-heavy data that tolerates a little staleness (dashboards, product lists, config). Not balances or anything that must be exact; read those from the DB.
- **Keys**: namespaced and scoped to the right tenant or user (\`org:42:dashboard:v1\`), so one user never sees another's data. That's a real security bug if you get it wrong.
- **TTL** always, as a safety net even with invalidation, with some **jitter** so keys don't all expire at once.
- **Invalidation**: delete on write, ideally in one place (a service or repository layer). For lists, use versioned keys or tag sets.
- **Stampede protection**: when a hot key expires, use a lock or "single flight" so only one request rebuilds it.
- **Fail open**: if Redis is down, fall back to the DB, don't crash.

Measure the hit rate and latency before and after to show it helped.`,
    analogy: `A café that pre-makes its most popular sandwiches (cache). Each sandwich has a "best before" sticker (TTL). When the recipe changes (a write), you throw the old ones away (invalidation). And if the whole lunch rush arrives the moment the tray empties, only one cook makes the new batch (stampede protection).`,
    quickRevision: [
      'Cache-aside: read → miss → DB → set with TTL',
      'On write: update DB then delete keys',
      'Scope keys per tenant/user (security!)',
      'TTL + jitter; prevent stampedes with a lock',
      "Don't cache must-be-exact data; fail open if Redis is down",
    ],
    followUps: [
      'Write-through vs write-back vs cache-aside?',
      'How do you invalidate a cached paginated list?',
      'Redis eviction policies (LRU, LFU)?',
    ],
    relatedCollected: ['database/caching/how-do-you-keep-cache-consistent'],
  },
]);
