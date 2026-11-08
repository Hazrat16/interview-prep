import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('database/caching.md', {
  'why-not-cache-all-data': {
    difficulty: 'easy',
    analogy: 'You don\'t keep your whole wardrobe on the chair by the bed; only the clothes you wear every day. The rest stays in the cupboard (database).',
    quickRevision: ['Memory is limited and costly', 'Every cached item needs invalidation', 'Cache only hot, expensive, shared reads', 'Correctness-critical data stays in the DB'],
    followUps: ['How do you decide what is "hot"?', 'What eviction policy would you choose?'],
  },
  'what-is-caching': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'Keeping the most-asked-for books on the librarian\'s desk instead of walking to the archive every time someone asks.',
    quickRevision: ['Store computed/fetched results in fast storage', 'Memory / Redis / CDN / browser', 'Reduces latency and DB load', 'Trade-off: possible stale data'],
    followUps: ['Where can you cache in a web app (layers)?', 'What is cache-aside?'],
  },
  'difference-between-indexing-and-caching': { sameAs: 'database/indexing/index-vs-cache' },
  'what-problem-can-caching-create-when-data-changes-often': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'A printed price list in the shop window: if prices change and nobody reprints it, customers see the old price (stale cache).',
    quickRevision: ['Stale data: DB updated, cache not', 'Temporary inconsistency', 'Fix with invalidation and TTL', 'Fast-changing data is a poor cache candidate'],
    followUps: ['How stale is acceptable for a dashboard vs a balance?', 'How do you invalidate a list cache?'],
  },
  'how-do-you-keep-cache-consistent': { sameAs: 'faq/db-redis-caching-strategy' },
  'why-use-caching-even-if-indexes-already-exist': {
    difficulty: 'medium',
    analogy: 'An index is a well-organised library catalogue that helps you find the book quickly; a cache is having the book already in your hand, so you skip the trip entirely.',
    quickRevision: ['Indexed queries still cost DB work + network', 'Cache avoids the query entirely', 'Matters under high traffic', 'Use both: index for queries, cache for hot reads'],
    followUps: ['When is caching not worth it?', 'What would you cache for a dashboard?'],
  },
  'why-dont-we-cache-everything': { sameAs: 'database/caching/why-not-cache-all-data' },
});
