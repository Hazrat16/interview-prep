import { defineEnrichments } from '../../../lib/content/enrich-schema';

const D = 'backend/system-design-questions';

/**
 * The detailed "Answers for each prompt" sections are already interview-ready,
 * so they get analogy / revision / follow-ups only. The summary table rows at
 * the top reuse them with sameAs.
 */
export default defineEnrichments('backend/system-design-questions.md', {
  // ---------------------------------------------------------------- detailed answers
  'url-shortener-1': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: 'A cloakroom: you hand over a long coat (URL) and get a small numbered ticket (short code); the attendant keeps the busiest coats right at the front desk (cache) so most returns are instant.',
    quickRevision: [
      'Read-heavy (~100:1) → cache code → URL in Redis',
      'IDs: counter + base62 (no collisions) vs hash (collisions)',
      '301 cached by browsers vs 302 counts every click',
      'Analytics via queue, never during the redirect',
      'Scale: replicas, edge redirects, partition by code',
    ],
    followUps: ['How do you stop people guessing other links?', 'How would you support custom aliases?', 'How do you expire links?', 'Estimate storage for 100M links.'],
  },
  'chat-app-whatsapp--messenger-1': {
    difficulty: 'hard',
    frequency: 'very-high',
    analogy: 'Postal sorting offices: each user is connected to one local office (chat server); when a letter is for someone at another office, it\'s sent over the inter-office network (Redis pub/sub), and every letter is logged before delivery (persist first).',
    quickRevision: [
      'WebSockets to chat servers; one server per user connection',
      'Cross-server via Redis pub/sub / broker (did it in SmartJobHub)',
      'Persist → ack ✓ → deliver → ✓✓ → read',
      'Offline: store + push via queue; fetch after last ID on reconnect',
      'Presence with Redis TTL heartbeats; order per conversation',
    ],
    followUps: ['How do you guarantee ordering and no duplicates?', 'How would group chats with 10k members change the design?', 'How do you scale presence updates?'],
  },
  'notification-system-1': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'A central post room for a company: departments drop off messages, the post room checks each person\'s delivery preferences, puts them in the right outgoing tray (email, SMS, push), and resends anything that bounced, without ever sending the same letter twice.',
    quickRevision: [
      'POST /notify → preferences + rate limits → template',
      'Queue per channel → workers → providers',
      'Retries + backoff, DLQ, idempotency key per event',
      'In-app: table + WebSocket push, mark as read',
      'Scale workers independently; digests for low priority',
    ],
    followUps: ['How do you prevent duplicate notifications?', 'How do you respect quiet hours and time zones?', 'How would you add a new channel?'],
  },
  'e-commerce-checkout--flash-sale-1': {
    sameAs: 'faq/db-transactions-isolation-race',
  },
  'worked-example-flash-sale-inventory-your-sneaker-drop': {
    difficulty: 'hard',
    frequency: 'high',
    analogy: 'A concert ticket drop: a fast ticket counter at the door (Redis counter) decides instantly who gets a ticket, the official box office ledger (Postgres) records the real sales, and unpaid holds go back on sale when their 60-second timer runs out.',
    quickRevision: [
      'Redis atomic DECR (or Lua) as the fast gate',
      'Hold key with 60s TTL; expiry → INCR stock + broadcast',
      'Checkout: idempotent payment → order in a DB transaction',
      'Postgres is the source of truth; reconcile with Redis',
      'Spike: per-user rate limit, waiting room, CDN',
    ],
    followUps: ['What happens if Redis restarts mid-drop?', 'How do you reconcile Redis and the database?', 'How would you stop bots buying everything?'],
  },
  'booking-system-doctor--hotel--movie-seats-1': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Putting a "reserved" card on a restaurant table: only one card fits per table (unique constraint), and if the guest doesn\'t arrive in time, staff remove the card (hold expiry).',
    quickRevision: [
      'Unique constraint on slot / (resource, time)',
      'Conditional update status free → held, check affected rows',
      'held_until + sweeper job frees expired holds',
      'Cache availability, re-check inside the write transaction',
      'Store times in UTC; reminders via queue',
    ],
    followUps: ['How do you book several movie seats atomically?', 'How do you handle overlapping appointment lengths?', 'Optimistic vs pessimistic locking here?'],
  },
  'payment--invoicing-system-1': {
    difficulty: 'hard',
    frequency: 'high',
    analogy: 'An accountant\'s ledger written in pen: you never erase an entry, you add a correcting one (credit note), and every debit has a matching credit so the books always balance.',
    quickRevision: [
      'Integer minor units + currency; store FX rate at issue',
      'Double-entry, append-only ledger; balances derived',
      'draft → issued → partially_paid → paid / void; credit notes',
      'Idempotency for payments and webhooks',
      'Daily reconciliation; audit trail; PDF stored once',
    ],
    followUps: ['Why derive balances instead of updating them?', 'How do you handle a partial refund?', 'How did you prevent duplicate invoices at Firmwide?'],
  },
  'news-feed--timeline-1': {
    difficulty: 'hard',
    frequency: 'high',
    analogy: 'Fan-out on write is a newspaper delivered to every subscriber\'s door when it\'s printed; fan-out on read is everyone walking to the newsstand and assembling their own paper when they want it.',
    quickRevision: [
      'Push (fan-out on write): fast reads, expensive for celebrities',
      'Pull (fan-out on read): cheap writes, slow reads',
      'Hybrid: push for most, pull for celebrities',
      'Feed IDs in Redis, posts in DB, media on S3 + CDN',
      'Cursor pagination; ranking later',
    ],
    followUps: ['How would ranking change the design?', 'How do you handle a deleted post already fanned out?'],
  },
  'rate-limiter-1': { sameAs: 'backend/node-api-questions/rate-limiting' },
  'file-upload-service-1': { sameAs: 'backend/node-api-questions/upload-a-1gb-file' },
  'job-portal--search-1': {
    difficulty: 'medium',
    frequency: 'medium',
    analogy: 'A library: the main catalogue (database) is the source of truth, while a fast search index at the front desk (Elasticsearch) is kept in sync so visitors can find books by any keyword or filter instantly.',
    quickRevision: [
      'Core entities: jobs, companies, applications (+ status history)',
      'Search: Postgres FTS / Atlas Search small; OpenSearch large',
      'Sync the search index via events',
      'Unique (jobId, userId) for applications',
      'Cache popular searches; cursor pagination',
    ],
    followUps: ['How do you keep the search index in sync?', 'How would you rank search results?', 'How did SmartJobHub handle this?'],
  },
  'real-time-dashboard--live-prices': {
    difficulty: 'medium',
    frequency: 'medium',
    analogy: 'A stadium scoreboard: it doesn\'t redraw the whole board for every point, it updates only the changed numbers a few times a second, and anyone arriving late first sees the current score (snapshot).',
    quickRevision: [
      'SSE for one-way, WebSocket for two-way',
      'Source → pub/sub → socket servers → rooms per symbol',
      'Throttle/batch updates, send deltas; snapshot on connect',
      'Frontend: update changed rows, virtualise, pause in background tabs',
    ],
    followUps: ['How do you handle 100k concurrent viewers?', 'What if a client falls behind on updates?'],
  },
  'autocomplete--typeahead': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'A helpful shop assistant who waits until you\'ve said a few letters, remembers answers to questions already asked, and ignores an old answer if you\'ve since changed your question.',
    quickRevision: [
      'Debounce ~300ms + min characters',
      'Abort/ignore stale requests',
      'Cache results per query',
      'Keyboard + ARIA combobox/listbox/aria-activedescendant',
      'Highlight matches; loading/empty states; virtualise',
    ],
    followUps: ['How would the backend serve suggestions fast (trie, prefix index)?', 'How do you make it fully keyboard accessible?'],
  },
  'infinite-scroll-feed': { sameAs: 'frontend/react-live-coding-solutions/infinite-scroll-with-intersectionobserver' },
  'component-library': { sameAs: 'frontend/react-interview-questions/designing-a-reusable-component' },
  'large-spa-architecture': { sameAs: 'frontend/react-interview-questions/how-do-you-structure-a-large-react-app' },
  'real-time-notifications-ui': {
    difficulty: 'medium',
    frequency: 'medium',
    analogy: 'One radio per household tuned to your personal channel: it reconnects if the signal drops, and when it comes back it asks "what did I miss since message #42?".',
    quickRevision: [
      'One socket per app (context provider), auth in handshake',
      'Reconnect with backoff; refetch since last ID',
      'Socket events update the TanStack Query cache',
      'Optimistic mark-as-read with rollback',
    ],
    followUps: ['How do you keep the unread badge consistent across tabs?', 'What happens to notifications sent while offline?'],
  },
  // ---------------------------------------------------------------- summary table rows → detailed answers
  'url-shortener': { sameAs: `${D}/url-shortener-1` },
  'chat-app-whatsapp--messenger': { sameAs: `${D}/chat-app-whatsapp--messenger-1` },
  'notification-system': { sameAs: `${D}/notification-system-1` },
  'e-commerce-checkout--flash-sale': { sameAs: 'faq/db-transactions-isolation-race' },
  'booking-system-doctor--hotel--movie-seats': { sameAs: `${D}/booking-system-doctor--hotel--movie-seats-1` },
  'payment--invoicing-system': { sameAs: `${D}/payment--invoicing-system-1` },
  'news-feed--timeline': { sameAs: `${D}/news-feed--timeline-1` },
  'rate-limiter': { sameAs: 'backend/node-api-questions/rate-limiting' },
  'file-upload-service': { sameAs: 'backend/node-api-questions/upload-a-1gb-file' },
  'job-portal--search': { sameAs: `${D}/job-portal--search-1` },
  'real-time-dashboard--live-stock-prices': { sameAs: `${D}/real-time-dashboard--live-prices` },
  'design-an-autocomplete--typeahead': { sameAs: `${D}/autocomplete--typeahead` },
  'design-an-infinite-scroll-feed': { sameAs: 'frontend/react-live-coding-solutions/infinite-scroll-with-intersectionobserver' },
  'design-a-component-library': { sameAs: 'frontend/react-interview-questions/designing-a-reusable-component' },
  'design-a-large-spas-architecture': { sameAs: 'frontend/react-interview-questions/how-do-you-structure-a-large-react-app' },
  'design-a-real-time-collaborative-form--notifications-ui': { sameAs: `${D}/real-time-notifications-ui` },
});
