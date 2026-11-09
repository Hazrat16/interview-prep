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
      question: 'Why not cache all data?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['caching'],
      answer: `- RAM is limited and expensive
- Invalidation becomes complex (“cache consistency nightmare”)
- Low-value / rare data doesn’t benefit
- Some data must always be fresh (balances, payments, critical inventory)`,
      analogy: `You don't keep your whole wardrobe on the chair by the bed; only the clothes you wear every day. The rest stays in the cupboard (database).`,
      quickRevision: [
        'Memory is limited and costly',
        'Every cached item needs invalidation',
        'Cache only hot, expensive, shared reads',
        'Correctness-critical data stays in the DB',
      ],
      followUps: [
        'How do you decide what is "hot"?',
        'What eviction policy would you choose?',
      ],
    },
    {
      id: 'what-is-caching',
      question: 'What is caching?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['caching'],
      answer: `> Caching stores previously fetched or computed results in fast storage like memory or Redis so repeated requests can be served without hitting the database every time. It reduces latency and database load.`,
      analogy: `Keeping the most-asked-for books on the librarian's desk instead of walking to the archive every time someone asks.`,
      quickRevision: [
        'Store computed/fetched results in fast storage',
        'Memory / Redis / CDN / browser',
        'Reduces latency and DB load',
        'Trade-off: possible stale data',
      ],
      followUps: [
        'Where can you cache in a web app (layers)?',
        'What is cache-aside?',
      ],
    },
    {
      id: 'what-problem-can-caching-create-when-data-changes-often',
      question: 'What problem can caching create when data changes often?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['caching'],
      answer: `> Stale cache. The database may already have newer data, but the application still serves an old cached value until the cache is invalidated or expires. This creates temporary data inconsistency.`,
      analogy: `A printed price list in the shop window: if prices change and nobody reprints it, customers see the old price (stale cache).`,
      quickRevision: [
        'Stale data: DB updated, cache not',
        'Temporary inconsistency',
        'Fix with invalidation and TTL',
        'Fast-changing data is a poor cache candidate',
      ],
      followUps: [
        'How stale is acceptable for a dashboard vs a balance?',
        'How do you invalidate a list cache?',
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
      question: 'Why use caching even if indexes already exist?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql', 'caching'],
      answer: `> Because even optimized database queries are still slower and more expensive than memory lookups. Caching avoids repeated query planning, storage engine work, network calls, and concurrency overhead, which matters under high traffic.`,
      analogy: `An index is a well-organised library catalogue that helps you find the book quickly; a cache is having the book already in your hand, so you skip the trip entirely.`,
      quickRevision: [
        'Indexed queries still cost DB work + network',
        'Cache avoids the query entirely',
        'Matters under high traffic',
        'Use both: index for queries, cache for hot reads',
      ],
      followUps: [
        'When is caching not worth it?',
        'What would you cache for a dashboard?',
      ],
    },
  ],
});
