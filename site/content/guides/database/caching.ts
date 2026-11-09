import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Caching',
  description: 'Cache-aside, write-through, invalidation, TTLs and Redis in front of a database.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'database/indexing/index-vs-cache',
  ],
  questions: [
    {
      id: 'why-not-cache-all-data',
      question: 'Why not just cache all of your data?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['caching'],
      answer: `Because a cache is only a win when it's **cheap to hold, likely to be read again, and acceptable if slightly stale**. Caching everything breaks all three:

- **Memory is limited and expensive.** Redis keeps data in RAM. Filling it with rarely read rows evicts the hot keys that actually help, lowering the **hit rate**.
- **Low-value data doesn't benefit.** A record read once a month gains nothing from caching, but still costs memory and invalidation logic.
- **Invalidation grows with what you cache.** Every cached item is something a write must remember to update or delete. More cached shapes means more places to miss, and more stale-data bugs.
- **Some data must always be fresh**: account balances, payment status, inventory during checkout, permissions. Serving those from a cache can cause real harm, so they're read from the database (sometimes with a lock).
- **Consistency and security.** Cached per-user data can leak between users with a wrong cache key.

So I cache **hot, expensive, read-heavy** data with a measured hit rate, and leave the rest to a well-indexed database.`,
      analogy: `You don't keep your whole wardrobe on the chair by the bed; only the clothes you wear every day. The rest stays in the cupboard (database).`,
      quickRevision: [
        'RAM is limited; cold data evicts hot data',
        'Rarely read data gains nothing',
        'More cached data → more invalidation bugs',
        'Never cache: balances, payments, checkout inventory, permissions',
        'Measure hit rate; cache hot + expensive data only',
      ],
      followUps: [
        'How do you measure whether a cache is worth it?',
        'What eviction policy would you choose?',
      ],
    },
    {
      id: 'what-is-caching',
      question: 'What is caching, where can you cache in a web app, and what problems does it bring?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['caching'],
      answer: `Caching means **keeping a copy of data or a computed result in faster storage**, so repeated requests don't redo the expensive work: a database query, an API call, a rendered page. It cuts **latency** and **load** on the database.

There are layers, from closest to the user:

- **Browser cache** via HTTP headers (\`Cache-Control\`, \`ETag\`).
- **CDN** for static assets and cacheable pages.
- **Application cache** in a shared store like **Redis**: query results, sessions, rate-limit counters.
- **In-process memory** (an LRU map): fastest, but not shared between instances.
- The **database's own buffer cache**.

The problems it brings:

- **Stale data**: the database changed but the cache still serves the old value until it's invalidated or expires.
- **Invalidation complexity**: knowing which keys a write affects.
- **Stampedes**: a hot key expires and thousands of requests hit the database at once.
- **Consistency** across instances.

So I cache **read-heavy, expensive, tolerant-of-slight-staleness** data, always with a **TTL**, and invalidate on writes.`,
      analogy: `Keeping the most-asked-for books on the librarian's desk instead of walking to the archive every time someone asks.`,
      quickRevision: [
        'Copy of data/results in faster storage → less latency and DB load',
        'Layers: browser, CDN, Redis, in-process, DB buffer',
        'Problems: stale data, invalidation, stampedes',
        'Cache read-heavy, expensive, staleness-tolerant data',
        'Always a TTL + invalidate on write',
      ],
      followUps: [
        'What is cache-aside?',
        'How do you prevent a cache stampede?',
        'What data should never be cached?',
      ],
    },
    {
      id: 'db-redis-caching-strategy',
      question: 'How do you add Redis caching to an API without serving stale or wrong data?',
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
        'Don\'t cache must-be-exact data; fail open if Redis is down',
      ],
      followUps: [
        'Write-through vs write-back vs cache-aside?',
        'How do you invalidate a cached paginated list?',
        'Redis eviction policies (LRU, LFU)?',
      ],
    },
    {
      id: 'why-use-caching-even-if-indexes-already-exist',
      question: 'If the database already has good indexes, why would you still add a cache?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql', 'caching'],
      answer: `Because an indexed query is **fast, but not free**, and under high traffic the cost adds up.

Even an index lookup involves a **network round trip** to the database, **query parsing and planning**, **disk or buffer reads**, and holding a **connection** from a limited pool. A Redis \`GET\` is a sub-millisecond in-memory lookup, and an in-process cache doesn't even touch the network.

That matters when:

- The result is **expensive to compute**, not just to look up: joins across several tables, aggregates, or a product page assembled from many queries. An index helps find rows; it doesn't avoid the computation.
- The same data is read **thousands of times per second**. The database's connection pool and CPU become the bottleneck even when each query is fast.
- You need to **protect the database** from traffic spikes.

So indexes make each query efficient; caching makes **repeated** queries unnecessary. They're complementary. I'd still fix queries with indexes first, then cache the hot, expensive results.`,
      analogy: `An index is a well-organised library catalogue that helps you find the book quickly; a cache is having the book already in your hand, so you skip the trip entirely.`,
      quickRevision: [
        'Indexed query still costs round trip, planning, I/O, a connection',
        'Redis GET: sub-millisecond; in-process: no network',
        'Caches avoid the computation, not just the lookup',
        'High read volume → pool/CPU become the bottleneck',
        'Indexes first, cache hot expensive results second',
      ],
      followUps: [
        'What is the difference between an index and a cache?',
        'Where would you cache a product page?',
      ],
    },
  ],
});
