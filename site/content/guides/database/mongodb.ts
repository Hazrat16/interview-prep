import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'MongoDB & Mongoose',
  description: 'Documents vs tables, schema design, indexes and the aggregation pipeline.',
  questions: [
    {
      id: 'db-mongo-embed-vs-reference',
      question: 'MongoDB schema design: when do you embed documents and when do you reference them?',
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
      id: 'db-indexes-composite',
      question: 'How do database indexes work, and how do you choose a composite index?',
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
    },
    {
      id: 'aggregation-pipeline',
      question: 'What is the MongoDB aggregation pipeline? Give an example.',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['mongodb'],
      answer: `The aggregation pipeline processes documents through **stages**, each transforming the stream:

- \`$match\` filters, and should go **early** so it can use indexes and shrink the data;
- \`$group\` aggregates (totals, counts per status or month);
- \`$lookup\` joins another collection;
- \`$unwind\` flattens arrays;
- \`$project\` / \`$addFields\` shape fields;
- \`$sort\`, \`$limit\` and \`$facet\` (several aggregations in one query, e.g. results plus counts).

I've used it for **dashboards and analytics**: totals per currency and month, invoice status counts, top clients. Performance tips: \`$match\` and \`$sort\` early on indexed fields, \`$project\` to reduce document size, check \`explain()\`, and watch the 100MB stage memory limit (\`allowDiskUse\`).`,
      variants: [
        { label: 'Short version', answer: '`$match` → `$group` → `$lookup` → `$project` → `$sort`. Put `$match` early so it can use indexes.' },
      ],
      analogy: `A factory conveyor belt: items are filtered at the first station, grouped at the next, labelled, then boxed, and the earlier you remove rejects, the less work later stations do.`,
      quickRevision: [
        'Stages transform a document stream',
        '$match early (indexes, less data)',
        '$group, $lookup, $unwind, $project, $facet',
        'Check explain(); memory limit / allowDiskUse',
      ],
      followUps: [
        'Write a pipeline for revenue per month.',
        '$lookup vs populate?',
        'When would you precompute instead of aggregating live?',
      ],
    },
    {
      id: 'transactions-in-mongodb',
      question: 'Does MongoDB support transactions, and when do you need them?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql', 'mongodb'],
      answer: `MongoDB supports **multi-document ACID transactions** (on replica sets and sharded clusters) through a **session**: start the session, do the writes inside \`withTransaction()\`, and it commits or aborts as one unit, retrying on transient errors.

I use them when **several documents must change together**, such as money movement or "create invoice + update proposal status". But **single-document writes are already atomic**, so I first try to **design for single-document updates** (embedding, atomic operators like \`$inc\` with conditions). Transactions add latency and lock contention, so I keep them **short**.`,
      variants: [
        { label: 'Short version', answer: `Multi-document ACID on replica sets via sessions. Use them for money movement, but they cost performance.` },
      ],
      analogy: `A transaction is a moving-house checklist where either every box arrives at the new place or the whole move is called off; but if everything fits in one box (one document), you don't need the checklist.`,
      quickRevision: [
        'Multi-doc ACID via sessions (replica set)',
        'Single-document writes already atomic',
        'Prefer single-doc design + atomic operators',
        'Keep transactions short; retry transient errors',
      ],
      followUps: [
        'Why do transactions need a replica set?',
        'How would you transfer money between two wallets in Mongo?',
      ],
    },
    {
      id: 'mongoose-lean',
      question: 'What does Mongoose `lean()` do, and when should you use it?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['mongodb'],
      answer: `By default, Mongoose turns every result into a full **Mongoose document**, with change tracking, getters and setters, virtuals and methods like \`.save()\`. That's memory and CPU overhead.

\`.lean()\` returns **plain JavaScript objects**, which are much faster and lighter, ideal for **read-only** endpoints and lists. The trade-off: no \`.save()\`, no virtuals, getters or defaults (unless you use lean plugins), and \`_id\` stays an ObjectId. I use \`lean()\` for most GET endpoints, together with \`select()\` to project only the needed fields.`,
      variants: [
        { label: 'Short version', answer: 'Returns plain objects instead of documents, which is faster for reads.' },
      ],
      analogy: `Ordering a coffee to take away instead of a full table service: you just get the coffee (plain object), without the waiter, cutlery and refills (document features).`,
      quickRevision: [
        'Plain objects instead of documents',
        'Faster + less memory for reads',
        'No save(), virtuals, getters',
        'Combine with select() projections',
      ],
      followUps: [
        'When shouldn\'t you use lean()?',
        'How do you get virtuals with lean?',
      ],
    },
    {
      id: 'db-n-plus-one',
      question: 'What is the N+1 query problem, and how do you fix it?',
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
      id: 'money-storage',
      question: 'How should you store money values in MongoDB (or any database)?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['mongodb'],
      answer: `Never store money as a JavaScript **float**: \`0.1 + 0.2 !== 0.3\`, and rounding errors add up in totals and taxes. Options:

- **Integer minor units**: cents as integers (\`1999\` = 19.99 USD), with the **currency code** stored next to them. Simple and exact.
- **Decimal types**: \`Decimal128\` in MongoDB, \`NUMERIC(12,2)\` in Postgres, plus a decimal library in code.

For **multi-currency** invoicing (like at Firmwide) I store the **original currency and amount**, plus the **converted amount and the exchange rate used at that time**, so historical invoices don't change when rates do. Rounding happens at defined points, with consistent rules.`,
      variants: [
        { label: 'Short version', answer: 'Integer minor units (cents) or `Decimal128`, never JS floats. Relevant to multi-currency invoicing.' },
      ],
      analogy: `Counting coins instead of pouring liquid: whole cents can't spill or evaporate the way floating-point fractions do.`,
      quickRevision: [
        'No floats for money',
        'Integer minor units + currency code',
        'Or Decimal128 / NUMERIC',
        'Store original currency, converted amount and rate used',
      ],
      followUps: [
        'How do you handle currencies with 0 or 3 decimal places?',
        'Where should rounding happen?',
      ],
    },
    {
      id: 'db-sql-vs-nosql-choice',
      question: 'SQL (PostgreSQL) vs NoSQL (MongoDB) — how do you choose for a project?',
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
  ],
});
