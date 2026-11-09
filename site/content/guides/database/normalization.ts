import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Normalization',
  description: 'Normal forms, denormalisation and designing schemas that scale.',
  questions: [
    {
      id: 'what-is-normalization',
      question: 'What is normalization? Explain 1NF, 2NF and 3NF briefly.',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['sql'],
      answer: `Normalization is organising tables so that **each fact is stored in exactly one place**. That removes duplication and the **update anomalies** that come with it: if a customer's address is copied into every order, changing it means updating many rows, and missing one leaves the data contradicting itself.

The first three normal forms, in plain words:

- **1NF**: every column holds **one atomic value**, with no repeating groups. No \`phone1, phone2, phone3\` columns and no comma-separated lists: put phone numbers in their own table.
- **2NF**: 1NF, and every non-key column depends on the **whole** primary key. This matters for composite keys: in \`order_items(order_id, product_id, product_name)\`, \`product_name\` depends only on \`product_id\`, so it belongs in \`products\`.
- **3NF**: 2NF, and non-key columns depend **only on the key, not on other non-key columns**. In \`employees(id, dept_id, dept_name)\`, \`dept_name\` depends on \`dept_id\`, so it moves to \`departments\`.

The short version people quote: every column depends on "**the key, the whole key, and nothing but the key**". For transactional data I aim for 3NF, then denormalise deliberately where reads need it.`,
      analogy: `Storing each contact's address once in your phonebook and referring to it, instead of writing it on every letter. Change it once and it's right everywhere.`,
      quickRevision: [
        'Each fact stored once → no update anomalies',
        '1NF: atomic values, no repeating groups',
        '2NF: depends on the whole key (composite keys)',
        '3NF: no non-key → non-key dependencies',
        '"The key, the whole key, and nothing but the key"',
      ],
      followUps: [
        'What is denormalization?',
        'What is BCNF?',
        'What are insert, update and delete anomalies?',
      ],
    },
    {
      id: 'what-is-denormalization',
      question: 'What is denormalization, and when is it worth it?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['sql'],
      answer: `Denormalization is **deliberately duplicating or precomputing data** so reads need fewer joins or calculations. Examples:

- Storing \`comment_count\` on \`posts\` instead of running \`COUNT(*)\` every time a feed loads.
- Copying \`customer_name\` and the **price at purchase time** onto an order. That one is actually a requirement, not just an optimisation: the order must keep the price it was sold at, even if the product price changes later.
- A **read model** or materialised view that pre-joins data for a search page or dashboard.

It's worth it on **read-heavy, latency-sensitive paths** where profiling shows the joins or aggregates are the bottleneck. The cost is that **writes get harder**: every duplicated value must be kept in sync, and a missed update means inconsistent data.

So I keep the **normalised tables as the source of truth** and treat the denormalised copy as derived, updated in the **same transaction** (counters), by **triggers**, by **events** (eventually consistent read models), or by refreshing a **materialised view**. And I add a reconciliation job if drift would matter.`,
      analogy: `Writing a friend's name on the party invitation as well as keeping it in the address book: faster to read, but if they change their name you must update both.`,
      quickRevision: [
        'Duplicate or precompute data to speed up reads',
        'Examples: counters, price at purchase, read models',
        'Worth it on read-heavy, measured hot paths',
        'Cost: harder writes, risk of drift',
        'Normalised tables stay the source of truth',
      ],
      followUps: [
        'How do you keep a denormalized counter in sync?',
        'What is a materialized view?',
        'Why store the price on the order line?',
      ],
    },
    {
      id: 'for-a-linkedin-like-job-platform-normalize-denormalize-or-hybrid',
      question: 'For a LinkedIn-like job platform, would you normalize, denormalize, or use a hybrid? Why?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `A **hybrid**, split by how each part of the data is used.

**Normalised (source of truth)**: \`users\`, \`companies\`, \`jobs\`, \`applications\`, \`skills\` and their join tables. These are written transactionally and must stay correct: an application must point to a real user and job, a job's status must change in one place, and a user editing their headline shouldn't have to update thousands of rows.

**Denormalised (read side)** for the hot, read-heavy surfaces:

- **Job search** goes to a **search index** (Elasticsearch/OpenSearch, or Postgres full-text) with a flattened document per job: title, company name, location, skills, salary range.
- **Job cards and feeds** use a precomputed view or cache with the company name and logo already joined in.
- **Counters** like "applicants: 132" are stored on the job and incremented, not counted on every page view.

The read models are **derived from events** (job created, application submitted) or rebuilt periodically, so they can be **slightly stale**, which is fine for search results but never for the application record itself.`,
      analogy: `A shop keeps one accurate stock ledger (normalised) but also prints a fast "today's best sellers" board (denormalised) for customers.`,
      quickRevision: [
        'Hybrid: normalised writes, denormalised reads',
        'Normalised: users, companies, jobs, applications, skills',
        'Search index with flattened job documents',
        'Precomputed cards/feeds + counters',
        'Read models derived from events; may be slightly stale',
      ],
      followUps: [
        'How would you keep the search index in sync?',
        'What data must never be stale?',
        'How would you model skills?',
      ],
    },
    {
      id: 'if-we-denormalize-for-performance-why-do-we-still-need-joins',
      question: 'If we denormalize for performance, why do we still need JOINs?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql', 'performance'],
      answer: `Because denormalised data is a **derived copy**, not the source of truth, and it only covers the queries you **planned for**.

JOINs are still needed to:

- **Build and refresh** the denormalised data in the first place: the materialised view, search document or cache entry is produced by joining the normalised tables.
- **Answer queries you didn't precompute**: admin screens, reports, one-off analysis, new features. Precomputing every combination isn't possible.
- **Keep integrity**: foreign keys and constraints live on the normalised tables; that's what guarantees an application references a real job.
- **Repair drift**: when a copy goes out of sync, you recompute it from the normalised data.

So the two coexist. Normalised tables plus **JOINs with good indexes** handle correctness and flexible queries; denormalised read models handle a few **hot paths**. Most queries in a well-indexed database are fast enough with JOINs, and denormalising is the exception you justify with measurements.`,
      analogy: `A cheat sheet speeds up the exam questions you expected, but you still need the full textbook for everything else.`,
      quickRevision: [
        'Denormalised data is derived, not the source of truth',
        'JOINs build and refresh read models',
        'Ad-hoc and new queries still need JOINs',
        'Integrity lives on the normalised tables',
        'Denormalise only measured hot paths',
      ],
      followUps: [
        'How do you detect drift between source and copy?',
        'When is a materialized view enough?',
      ],
    },
    {
      id: 'how-do-normalization-indexing-and-caching-work-together',
      question: 'How do normalization, indexing and caching work together in a real system?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql', 'caching'],
      answer: `They solve different problems at different layers, and I apply them **in that order**:

1. **Normalization keeps the data correct.** Each fact lives in one place, constraints and foreign keys protect it, and writes are simple and transactional. This is the source of truth.
2. **Indexing makes the normalised queries fast.** Normalised data means joins and filters; the right indexes (foreign keys, composite indexes for real query patterns) make those queries take milliseconds instead of scanning tables. Most performance problems end here.
3. **Caching removes repeated work for hot data.** When the same expensive result is requested again and again (a product page, a dashboard aggregate, session data), cache it in **Redis** or at the HTTP/CDN layer, with a TTL and invalidation on writes.
4. **Denormalization** is the last step, for read paths where even indexed joins are too slow or too frequent.

The order matters because each layer adds complexity and a risk of **staleness**. If a query is slow, I check \`EXPLAIN\` and indexes before reaching for a cache, since caching a slow query just hides it until the cache misses.`,
      analogy: `A well-organised library (normalisation), a good catalogue (indexes), and a shelf of popular books by the entrance (cache): each solves a different part of finding books fast.`,
      quickRevision: [
        'Normalization → correctness (source of truth)',
        'Indexing → fast joins and filters',
        'Caching → skip repeated work for hot data',
        'Denormalization → last resort for hot reads',
        'Fix with EXPLAIN + indexes before adding a cache',
      ],
      followUps: [
        'Why not cache instead of indexing?',
        'How do you invalidate a cache when data changes?',
      ],
    },
  ],
});
