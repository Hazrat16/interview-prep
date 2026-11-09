import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Design Problems',
  description: 'Classic walkthroughs: URL shortener, chat, news feed, rate limiter, booking and more.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'database/transactions-and-acid/db-transactions-isolation-race',
    'backend/rest-api-design/rate-limiting',
    'backend/backend-scenarios/upload-a-1gb-file',
  ],
  questions: [
    {
      id: 'worked-example-flash-sale-inventory-your-sneaker-drop',
      question: 'Design flash-sale inventory for a limited sneaker drop.',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['system-design'],
      answer: `\`\`\`text
Requirements: 1 product, 500 units, 50k users at drop time, no overselling, 60s hold.

Client ──▶ LB ──▶ API (stateless, N instances) ──▶ Redis (stock counter, holds w/ TTL)
                         │                              │
                         ├──▶ Postgres (orders, source of truth)
                         └──▶ Socket.IO + Redis adapter ──▶ live stock to clients

Reserve:  DECR stock in Redis atomically (or Lua script); if < 0 → INCR back, reject
          create hold key with 60s TTL
Checkout: within TTL → payment (idempotency key) → order row in DB transaction
Expire:   keyspace event / sweeper job → INCR stock → broadcast update
Spike:    rate limit per user, queue/waiting room, CDN for static assets
\`\`\`

Trade-offs to mention: Redis as the fast gate vs the DB as source of truth (reconcile), what happens if Redis restarts, and sticky sessions for sockets.`,
      analogy: `A concert ticket drop: a fast ticket counter at the door (Redis counter) decides instantly who gets a ticket, the official box office ledger (Postgres) records the real sales, and unpaid holds go back on sale when their 60-second timer runs out.`,
      quickRevision: [
        'Redis atomic DECR (or Lua) as the fast gate',
        'Hold key with 60s TTL; expiry → INCR stock + broadcast',
        'Checkout: idempotent payment → order in a DB transaction',
        'Postgres is the source of truth; reconcile with Redis',
        'Spike: per-user rate limit, waiting room, CDN',
      ],
      followUps: [
        'What happens if Redis restarts mid-drop?',
        'How do you reconcile Redis and the database?',
        'How would you stop bots buying everything?',
      ],
    },
    {
      id: 'url-shortener-1',
      question: 'Design a URL shortener.',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['system-design'],
      answer: `- **Requirements:** create a short link, redirect, optional expiry and click analytics. Very **read-heavy** (about 100 reads per write).
- **API:** \`POST /links {url}\` → \`{code}\`; \`GET /:code\` → 301/302 redirect.
- **Data:** \`links(code PK, longUrl, userId, createdAt, expiresAt)\`, \`clicks(code, ts, country…)\`.
- **ID generation:** a global counter (DB sequence or Redis \`INCR\`) encoded in **base62** gives short, unique codes with no collisions. Alternative: hash the URL and take 7 characters, but you must handle collisions. Random codes are guessable if they're short.
- **Design:** client → LB → stateless API → **Redis cache** (code → URL) → DB. Most redirects come from the cache.
- **301 vs 302:** a 301 is cached by browsers (less load, but you lose analytics). A 302 hits your server every time, so you can count clicks.
- **Analytics:** don't write to the DB during the redirect. Push the click event to a queue and aggregate it asynchronously.
- **Scale:** read replicas, CDN/edge redirects, and partition the DB by code.`,
      analogy: `A cloakroom: you hand over a long coat (URL) and get a small numbered ticket (short code); the attendant keeps the busiest coats right at the front desk (cache) so most returns are instant.`,
      quickRevision: [
        'Read-heavy (~100:1) → cache code → URL in Redis',
        'IDs: counter + base62 (no collisions) vs hash (collisions)',
        '301 cached by browsers vs 302 counts every click',
        'Analytics via queue, never during the redirect',
        'Scale: replicas, edge redirects, partition by code',
      ],
      followUps: [
        'How do you stop people guessing other links?',
        'How would you support custom aliases?',
        'How do you expire links?',
        'Estimate storage for 100M links.',
      ],
    },
    {
      id: 'chat-app-whatsapp-messenger-1',
      question: 'Design a chat app like WhatsApp or Messenger.',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'very-high',
      tags: ['system-design'],
      answer: `- **Requirements:** 1-to-1 and group messages, online status, delivered/read receipts, history, offline delivery.
- **Connection:** WebSockets to a **gateway/chat server**. A user is connected to one server.
- **Cross-server delivery:** Redis pub/sub (Socket.IO Redis adapter) or a broker (Kafka/NATS). Server A publishes, and the server holding the receiver's socket delivers. *(This is what you did in SmartJobHub.)*
- **Storage:** \`messages(conversationId, messageId (time-ordered), senderId, body, createdAt)\`, partitioned by \`conversationId\` and paginated by cursor. Write-heavy, so Cassandra or DynamoDB at huge scale, but MongoDB or Postgres is fine for most apps.
- **Flow:** send → persist → ack to sender (✓) → deliver to receiver → receiver acks (✓✓ delivered) → read event (read).
- **Offline user:** the message is stored, and a push notification (FCM/APNs) goes through a queue. On reconnect, fetch messages after the last seen ID.
- **Presence:** heartbeat with a Redis key and TTL. Broadcast only to the user's contacts.
- **Ordering:** order per conversation by server timestamp or sequence number. Client-generated IDs dedupe retries.`,
      analogy: `Postal sorting offices: each user is connected to one local office (chat server); when a letter is for someone at another office, it's sent over the inter-office network (Redis pub/sub), and every letter is logged before delivery (persist first).`,
      quickRevision: [
        'WebSockets to chat servers; one server per user connection',
        'Cross-server via Redis pub/sub / broker (did it in SmartJobHub)',
        'Persist → ack ✓ → deliver → ✓✓ → read',
        'Offline: store + push via queue; fetch after last ID on reconnect',
        'Presence with Redis TTL heartbeats; order per conversation',
      ],
      followUps: [
        'How do you guarantee ordering and no duplicates?',
        'How would group chats with 10k members change the design?',
        'How do you scale presence updates?',
      ],
    },
    {
      id: 'notification-system-1',
      question: 'Design a notification system (email, SMS, push, in-app).',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design'],
      answer: `- **Requirements:** email, SMS, push and in-app; user preferences; templates; retries; no duplicates.
- **Design:** services call \`POST /notify {userId, type, data}\` → the notification service checks **preferences** and rate limits → renders a **template** → puts a job on a **queue per channel** → workers send via providers (SES, Twilio, FCM).
- **Reliability:** retries with exponential backoff, a dead-letter queue, an **idempotency key** per event so a retry doesn't send twice, and provider fallback.
- **In-app:** store in a \`notifications\` table and push live via WebSocket. Mark as read.
- **Scale:** workers scale independently. Batch digests for low-priority notifications.`,
      analogy: `A central post room for a company: departments drop off messages, the post room checks each person's delivery preferences, puts them in the right outgoing tray (email, SMS, push), and resends anything that bounced, without ever sending the same letter twice.`,
      quickRevision: [
        'POST /notify → preferences + rate limits → template',
        'Queue per channel → workers → providers',
        'Retries + backoff, DLQ, idempotency key per event',
        'In-app: table + WebSocket push, mark as read',
        'Scale workers independently; digests for low priority',
      ],
      followUps: [
        'How do you prevent duplicate notifications?',
        'How do you respect quiet hours and time zones?',
        'How would you add a new channel?',
      ],
    },
    {
      id: 'booking-system-doctor-hotel-movie-seats-1',
      question: 'Design a booking system (doctor appointments, hotel rooms or movie seats).',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design'],
      answer: `- **Requirements:** show availability; no double booking; temporary hold during payment.
- **Data:** \`slots(id, resourceId, startTime, status)\` with \`bookings(slotId UNIQUE, userId, status)\`.
- **Double booking:** a **unique constraint** on \`(resourceId, startTime)\` or \`slotId\` in bookings, or \`UPDATE slots SET status='held' WHERE id=? AND status='free'\` (check the rows affected). Movie seats: lock several seats in one transaction.
- **Hold:** \`held_until\` timestamp. A sweeper job frees expired holds.
- **Read path:** cache availability, but always re-check in the write transaction.
- **Extras:** timezone handling (store UTC), reminders through a queue, cancellations returning slots.`,
      analogy: `Putting a "reserved" card on a restaurant table: only one card fits per table (unique constraint), and if the guest doesn't arrive in time, staff remove the card (hold expiry).`,
      quickRevision: [
        'Unique constraint on slot / (resource, time)',
        'Conditional update status free → held, check affected rows',
        'held_until + sweeper job frees expired holds',
        'Cache availability, re-check inside the write transaction',
        'Store times in UTC; reminders via queue',
      ],
      followUps: [
        'How do you book several movie seats atomically?',
        'How do you handle overlapping appointment lengths?',
        'Optimistic vs pessimistic locking here?',
      ],
    },
    {
      id: 'payment-invoicing-system-1',
      question: 'Design a payment and invoicing system.',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['system-design'],
      answer: `- **Requirements:** create invoices, record payments, multi-currency, exact amounts, audit trail.
- **Money:** integer minor units plus a currency code. Store the exchange rate on the invoice when it's issued.
- **Ledger:** a **double-entry** style ledger (each movement is a debit and a credit that sum to zero). Balances are derived from the entries and never updated in place. Entries are append-only.
- **State machine:** \`draft → issued → partially_paid → paid\` / \`void\`. An issued invoice can't be edited, so you issue a credit note instead.
- **Idempotency:** payment requests and webhooks deduped by key or provider event ID.
- **Reconciliation:** a daily job compares the provider settlement report with the ledger and flags mismatches.
- **Audit:** who changed what and when. PDF generated once when issued and stored in S3.`,
      analogy: `An accountant's ledger written in pen: you never erase an entry, you add a correcting one (credit note), and every debit has a matching credit so the books always balance.`,
      quickRevision: [
        'Integer minor units + currency; store FX rate at issue',
        'Double-entry, append-only ledger; balances derived',
        'draft → issued → partially_paid → paid / void; credit notes',
        'Idempotency for payments and webhooks',
        'Daily reconciliation; audit trail; PDF stored once',
      ],
      followUps: [
        'Why derive balances instead of updating them?',
        'How do you handle a partial refund?',
        'How did you prevent duplicate invoices at Firmwide?',
      ],
    },
    {
      id: 'news-feed-timeline-1',
      question: 'Design a news feed / timeline.',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['system-design'],
      answer: `- **Fan-out on write (push):** when a user posts, write the post ID into each follower's feed (Redis list). Reads are fast, but writes are expensive for users with millions of followers.
- **Fan-out on read (pull):** build the feed when it's opened by merging posts from the people you follow. Cheap writes, slow reads.
- **Hybrid:** push for normal users, pull for celebrities, and merge at read time.
- **Store:** posts in a DB, feed IDs in Redis, media on S3 + CDN. Cursor pagination. Ranking can come later.`,
      analogy: `Fan-out on write is a newspaper delivered to every subscriber's door when it's printed; fan-out on read is everyone walking to the newsstand and assembling their own paper when they want it.`,
      quickRevision: [
        'Push (fan-out on write): fast reads, expensive for celebrities',
        'Pull (fan-out on read): cheap writes, slow reads',
        'Hybrid: push for most, pull for celebrities',
        'Feed IDs in Redis, posts in DB, media on S3 + CDN',
        'Cursor pagination; ranking later',
      ],
      followUps: [
        'How would ranking change the design?',
        'How do you handle a deleted post already fanned out?',
      ],
    },
    {
      id: 'job-portal-search-1',
      question: 'Design a job portal with search.',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['system-design'],
      answer: `- **Data:** jobs, companies, applications (with status history), users, saved jobs.
- **Search:** full-text plus filters (location, salary, type). Use Postgres FTS or Mongo Atlas Search at small scale, and Elasticsearch/OpenSearch at large scale, synced from the main DB through events.
- **Applications:** a unique \`(jobId, userId)\` constraint, and a status history table for the timeline.
- **Notifications:** queue-based emails and real-time updates.
- **Scale:** cache popular searches, cursor pagination, read replicas.`,
      analogy: `A library: the main catalogue (database) is the source of truth, while a fast search index at the front desk (Elasticsearch) is kept in sync so visitors can find books by any keyword or filter instantly.`,
      quickRevision: [
        'Core entities: jobs, companies, applications (+ status history)',
        'Search: Postgres FTS / Atlas Search small; OpenSearch large',
        'Sync the search index via events',
        'Unique (jobId, userId) for applications',
        'Cache popular searches; cursor pagination',
      ],
      followUps: [
        'How do you keep the search index in sync?',
        'How would you rank search results?',
        'How did SmartJobHub handle this?',
      ],
    },
    {
      id: 'real-time-dashboard-live-prices',
      question: 'Design a real-time dashboard showing live prices.',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['realtime'],
      answer: `- **Transport:** SSE if it's one-way server → client (simpler, auto-reconnect); WebSocket if two-way.
- **Fan-out:** the price source → pub/sub (Redis/Kafka) → socket servers → clients subscribed to topics/rooms per symbol.
- **Load:** throttle or batch updates (e.g. every 500ms) and send deltas, not full snapshots. On connect, send a snapshot first.
- **Frontend:** update only the changed rows, use virtualized tables, and pause updates in background tabs.`,
      analogy: `A stadium scoreboard: it doesn't redraw the whole board for every point, it updates only the changed numbers a few times a second, and anyone arriving late first sees the current score (snapshot).`,
      quickRevision: [
        'SSE for one-way, WebSocket for two-way',
        'Source → pub/sub → socket servers → rooms per symbol',
        'Throttle/batch updates, send deltas; snapshot on connect',
        'Frontend: update changed rows, virtualise, pause in background tabs',
      ],
      followUps: [
        'How do you handle 100k concurrent viewers?',
        'What if a client falls behind on updates?',
      ],
    },
    {
      id: 'sd-design-url-shortener',
      question: 'Design a URL shortener web app (like bit.ly).',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['system-design', 'redis', 'caching', 'api-design', 'react'],
      answer: `**1. Requirements**

- Functional: create a short link for a long URL (optional custom alias and expiry), **redirect** fast, and show **click analytics** to the owner. Users may log in to manage links.
- Non-functional: **very read-heavy** (~100:1), low-latency redirects (<50ms), highly available, codes that aren't easily guessable.

**2. Estimates**: 100M new links/month → ~40 writes/s; ~4k redirects/s average, ~10k at peak; ~3TB over 5 years.

**3. API**

- \`POST /api/links { url, alias?, expiresAt? }\` → \`{ code, shortUrl }\` (authenticated, rate-limited);
- \`GET /:code\` → **302** redirect;
- \`GET /api/links/:code/stats\` for analytics.

**4. Data**

- \`links(code PK, long_url, owner_id, created_at, expires_at)\`;
- clicks go to an **events stream**, aggregated into \`daily_clicks(code, day, count, country…)\`.

**5. Code generation**: a **unique counter** (DB sequence, or Redis \`INCR\` handing out ranges to each app server) encoded in **base62**. Seven characters gives ~3.5 trillion codes with **no collisions**. To avoid sequential, guessable codes, shuffle the ID with a reversible bijection or add random bits. Hashing the URL also works, but needs collision checks.

**6. High-level flow**: client → CDN/LB → stateless API → **Redis cache** (\`code → long_url\`) → DB. Redirects are mostly cache hits. On each redirect, publish a click event to a **queue** (never write analytics synchronously) and aggregate it in workers.

**7. The web app**: a Next.js frontend with a create form (validation, **copy-to-clipboard**, QR code), a dashboard listing links with pagination, and charts for clicks. The marketing page is static or SSG behind a CDN.

**8. Trade-offs**: **302** keeps analytics accurate (browsers cache 301). Use a negative cache for unknown codes. Expired links are cleaned by TTL or a job. Spam and malware URLs are checked with Safe Browsing APIs.`,
      variants: [
        { label: 'Frontend-focused version', answer: `For a frontend-heavy interview I'd still sketch the backend briefly, then go deep on the **web app**:

- A **create page** with a URL input, client-side validation (Zod), optimistic UI, a **copy button** with feedback, and a QR code.
- A **dashboard** with a paginated table of links (TanStack Query, cursor pagination), search and filters, and per-link **analytics charts** (clicks over time, countries, referrers) loaded lazily.
- **Performance**: the landing page as SSG on a CDN, and the dashboard code-split.
- **Auth** with httpOnly cookies.
- **Accessibility** (labels, focus, announcements after copying), plus error and empty states.` },
      ],
      analogy: `A cloakroom: you hand in a long coat (URL), get a small ticket (code), and the attendant keeps the most-collected coats at the front desk (cache), while a clerk tallies how often each ticket is used (analytics queue) without slowing down the line.`,
      quickRevision: [
        'Read-heavy → Redis cache code → URL',
        'Counter + base62 (7 chars ≈ 3.5T), shuffled to avoid guessing',
        '302 for analytics; clicks via queue, aggregated async',
        'API: POST /api/links, GET /:code, GET stats',
        'Web: create form + copy/QR + dashboard with charts',
      ],
      deepDive: `\`\`\`text
             ┌──────── CDN (static web app) ────────┐
Browser ───▶ Load balancer ──▶ API (stateless × N) ──▶ Redis  (code → url, TTL)
                                   │        │
                                   │        └──▶ Postgres / DynamoDB (links)
                                   └──▶ Queue ──▶ Analytics workers ──▶ daily_clicks
\`\`\`

Base62: \`0-9a-zA-Z\` → 62⁷ ≈ 3.5 × 10¹² codes.`,
      followUps: [
        'How do you support custom aliases without collisions?',
        'How do you stop abuse (spam, phishing links)?',
        'What changes at 100× the traffic?',
        'How do you generate unique IDs across many servers?',
      ],
    },
    {
      id: 'sd-design-chat-app',
      question: 'Design a real-time chat application (like WhatsApp or Messenger).',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'very-high',
      tags: ['system-design', 'realtime', 'redis', 'nodejs'],
      answer: `**Requirements**: 1:1 and group chats, real-time delivery, sent/delivered/read receipts, history, online presence, and offline users get messages later (plus push notifications).

**Connections**: clients keep a **WebSocket** to a **chat gateway** server. Each user is connected to one server, so I track \`userId → serverId\` in Redis, or rely on the Socket.IO Redis adapter with \`user:{id}\` rooms.

**Sending a message**:

1. The client sends \`{ clientMsgId, conversationId, body }\`.
2. The server validates membership and **persists** the message, ordered by a per-conversation sequence or a time-sortable ID. Then it **acks** the sender (✓).
3. The server publishes to **pub/sub**. The gateway holding each recipient's socket delivers the message. The recipient acks → **delivered** (✓✓), then **read** events.
4. If the recipient is offline: queue a **push notification**. On reconnect, the client fetches messages **after its last seen sequence**.

**Storage**: \`messages(conversationId, seq, senderId, body, createdAt)\`, partitioned by conversation and paginated by cursor. Postgres or Mongo is fine for most apps; Cassandra or DynamoDB at huge scale. Media goes to S3 with a CDN and presigned URLs.

**Presence**: heartbeats set a Redis key with a TTL, and status changes go only to contacts.

**Reliability**: \`clientMsgId\` makes retries **idempotent**, and ordering is per conversation. For groups, fan out on write for small groups; very large groups need different handling.

I built the cross-server part in **SmartJobHub**: the Socket.IO Redis adapter, plus a test with two servers on one Redis.`,
      analogy: `A network of post offices: each person is registered at their local office (gateway); a letter is first filed in the archive (persisted), then sent over the inter-office network (pub/sub) to the recipient's office, and if they're away, a "you've got mail" card is posted (push).`,
      quickRevision: [
        'WebSockets to gateways; userId → server mapping',
        'Persist → ack ✓ → pub/sub deliver → ✓✓ → read',
        'Offline: push notification + fetch after last seq',
        'Messages partitioned by conversation; cursor pagination',
        'Idempotent clientMsgId; presence via Redis TTL',
      ],
      followUps: [
        'How do you guarantee message ordering?',
        'How would group chats with 10,000 members work?',
        'How do you implement end-to-end encryption at a high level?',
        'What happens when a gateway server crashes?',
      ],
    },
    {
      id: 'sd-design-notification-system',
      question: 'Design a notification system (email, SMS, push and in-app).',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design', 'nodejs', 'realtime'],
      answer: `**Requirements**: other services trigger notifications; channels are email, SMS, mobile push and in-app; user **preferences** and quiet hours; templates; retries; **no duplicates**; tracking of delivery and opens.

**Flow**:

1. Services call \`POST /notify { userId, type, data, idempotencyKey }\`, or publish an event.
2. The **notification service**:
   - **dedupes** by idempotency key;
   - loads **preferences** (channels, opt-outs, quiet hours, time zone);
   - applies **rate limits** (don't spam);
   - renders the **template** per channel and language.
3. It puts a job on a **queue per channel**, so a slow SMS provider doesn't block emails.
4. **Workers** send through providers (SES, Twilio, FCM/APNs) with **retries and backoff**, a **dead-letter queue**, and fallback to a secondary provider.
5. **In-app**: insert into a \`notifications\` table and push live over WebSocket. Mark as read; unread count.
6. **Tracking**: store status per notification (queued → sent → delivered / failed / opened) from provider webhooks.

**Scale**: workers scale per channel. Low-priority notifications are batched into **digests**. Bulk campaigns go on a separate, rate-limited queue so they don't delay transactional messages like OTPs.`,
      analogy: `A company post room: departments drop off messages, the post room checks each recipient's delivery preferences and do-not-disturb hours, sorts them into separate trays for courier, SMS and internal mail, and logs every delivery.`,
      quickRevision: [
        'Idempotency key → no duplicates',
        'Preferences, quiet hours, rate limits, templates',
        'Queue per channel; workers with retries + DLQ',
        'In-app: table + WebSocket push + unread count',
        'Separate queues for transactional vs bulk',
      ],
      followUps: [
        'How do you make sure an OTP is never delayed by a marketing campaign?',
        'How do you handle provider outages?',
        'How would you add a new channel like WhatsApp?',
      ],
    },
    {
      id: 'sd-design-rate-limiter',
      question: 'Design a distributed rate limiter.',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design', 'redis', 'api-design'],
      answer: `**Requirements**: limit requests per user, API key or IP (e.g. 100/min). Apply it across **many API instances**, with low added latency (~1ms), clear responses, and configurable rules per endpoint or plan.

**Where**: at the **API gateway** or edge (cheapest: rejects before work), or as middleware in each service. Often both: coarse limits at the edge, fine-grained per endpoint.

**Algorithm**:

- **Fixed window**: simplest, but allows a 2× burst at window edges.
- **Sliding window log/counter**: more accurate.
- **Token bucket**: refill rate + bucket size. It allows short bursts and is the most common choice.

**Shared state**: counters live in **Redis**, so all instances agree. Updates must be **atomic**: \`INCR\` + \`EXPIRE\`, or a **Lua script** for the token bucket (read tokens, refill by elapsed time, decrement, all in one step).

**Response**: **429** with \`Retry-After\` and \`X-RateLimit-Remaining\` headers.

**Failure mode**: if Redis is down, **fail open** for normal endpoints (availability) but **fail closed** for sensitive ones like login and OTP.

**Scale**: shard Redis by key, keep a local in-memory pre-check for very hot keys, and keep rules in config so they can change without a deploy.`,
      analogy: `A token dispenser at a theme-park ride: tokens refill at a steady rate, you can use a few saved-up tokens at once, but when they're gone you wait. Every entrance shares the same dispenser (Redis), so you can't cheat by using another gate.`,
      quickRevision: [
        'Edge/gateway + per-endpoint middleware',
        'Token bucket (bursts) vs fixed/sliding window',
        'Atomic Redis ops / Lua for shared counters',
        '429 + Retry-After + remaining headers',
        'Fail open generally, closed for auth endpoints',
      ],
      followUps: [
        'Write the Redis logic for a fixed-window limiter.',
        'How do you rate-limit by plan (free vs paid)?',
        'How do you handle clock differences between servers?',
      ],
    },
    {
      id: 'sd-design-news-feed',
      question: 'Design a social media news feed (like Facebook or Twitter/X).',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['system-design', 'redis', 'caching'],
      answer: `**Requirements**: users post (text, images); a home feed shows posts from people they follow, newest or ranked first; infinite scroll; feeds load fast (<200ms). It's **read-heavy**.

**Core data**: \`users\`, \`follows(follower, followee)\`, \`posts(id, author, body, media, created_at)\`. Media goes to **S3 + CDN**.

**Building the feed** is the key decision:

- **Fan-out on write (push)**: when someone posts, a worker inserts the post ID into each follower's **feed list** (a Redis sorted set). **Reads are instant**, but writes are expensive for accounts with millions of followers.
- **Fan-out on read (pull)**: when the feed is opened, fetch recent posts from everyone you follow and merge them. Writes are cheap, but **reads are slow**.
- **Hybrid** (what real systems do): **push** for normal users, and **pull** for celebrities, merged at read time.

**Read path**: get the feed IDs from Redis with **cursor pagination**, then batch-fetch the post details (cached), then hydrate authors and like counts.

**Other parts**:

- likes and comments as separate counters (eventually consistent);
- **ranking** later (an ML score instead of time);
- deleted posts filtered at read time;
- old feed entries trimmed (keep the last ~800 IDs).`,
      analogy: `Push is a newspaper delivered to every subscriber's door when it's printed (fast to read, lots of delivery work); pull is everyone walking to the newsstand and assembling their own paper. For celebrities with millions of readers, you don't deliver; you let readers fetch.`,
      quickRevision: [
        'Push: fast reads, expensive writes (celebrity problem)',
        'Pull: cheap writes, slow reads',
        'Hybrid: push normal users, pull celebrities',
        'Feed IDs in Redis sorted sets; cursor pagination',
        'Posts in DB, media in S3 + CDN; counters eventually consistent',
      ],
      followUps: [
        'How do you handle a user with 50M followers posting?',
        'How would ranking change the design?',
        'How do you remove a deleted post from feeds?',
      ],
    },
    {
      id: 'sd-design-file-storage',
      question: 'Design a file storage and sharing service (like Dropbox or Google Drive).',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['system-design', 'aws', 'api-design'],
      answer: `**Requirements**: upload and download files (up to GBs), folders, share with users or by link (with permissions), sync across devices, version history. It must be durable (never lose files).

**Separate metadata from content**:

- **Metadata DB** (Postgres): \`files(id, owner, parent_folder, name, size, version, checksum)\`, \`shares(file_id, user_id/link, role)\`, \`versions(...)\`. Consistency matters here.
- **Blob storage** (S3) holds the bytes. It's durable and cheap, with lifecycle rules for old versions.

**Upload**: the client asks the API → the API checks quota and permissions and returns **presigned multipart URLs** → the client uploads **chunks directly to S3** in parallel, resumable → on completion, the API records a new **version** with its checksum. Big files never pass through app servers.

**Sync and deduplication** (deeper level): split files into **chunks** (say 4MB) addressed by a **content hash**. Only changed chunks are uploaded, and identical chunks are stored once. Devices learn about changes through a **change feed** (long polling or WebSocket) with a per-user cursor.

**Download and sharing**: **short-lived signed URLs** (CloudFront) after a permission check. Share links carry a token, an optional password and an expiry.

**Other**: virus scanning and thumbnails asynchronously through a queue, conflict copies on concurrent edits, and quotas per user.`,
      analogy: `A library with a card catalogue (metadata DB) and a separate warehouse of boxes (S3): the catalogue says who owns which box and who may borrow it, and you pick up boxes from the warehouse dock directly with a time-limited pass (signed URL).`,
      quickRevision: [
        'Metadata in a DB, bytes in S3',
        'Presigned multipart uploads, direct to S3, resumable',
        'Versions + checksums; chunk hashing for sync/dedupe',
        'Signed short-lived download URLs after permission check',
        'Async scan/thumbnails; change feed for sync',
      ],
      followUps: [
        'How do you handle two devices editing the same file offline?',
        'How do you enforce storage quotas?',
        'How would you make share links secure?',
      ],
    },
    {
      id: 'sd-design-live-location',
      question: 'Design live location tracking for a food delivery or ride-hailing app.',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['system-design', 'realtime', 'redis'],
      answer: `**Requirements**: drivers send their location every few seconds; customers see their driver moving on a map in near real time; the system finds **nearby available drivers** for new orders; history is kept for disputes and analytics.

**Ingest**: the driver app sends \`{ driverId, lat, lng, ts }\` every 3–5 seconds over a WebSocket or lightweight HTTP. With 100k active drivers that's ~25k updates per second, so the write path must be cheap.

**Current location**: store **only the latest position** in **Redis with geo indexing** (\`GEOADD drivers:available lng lat driverId\`) plus a TTL heartbeat. Use \`GEOSEARCH\` by radius to find nearby drivers. At large scale, partition by city or region, or use geohash/H3 cells.

**History**: stream updates into a queue (Kafka/Kinesis) and batch-write them to cheap storage (a time-series DB or S3). Never write each ping to the main DB synchronously.

**Live tracking for the customer**: the customer subscribes to \`order:{id}\`. The location service publishes updates for that driver through pub/sub to the socket server holding the customer's connection. **Throttle** to one update every 2–3 seconds, and let the client **interpolate** movement smoothly.

**Matching**: find nearby available drivers → score them (distance, ETA, rating) → offer the order with a short **lock or TTL**, so two orders don't grab the same driver.

**Edge cases**: GPS jitter (filter jumps), drivers going offline (TTL expiry), battery use (adaptive update rate).`,
      analogy: `An air-traffic control screen: each plane reports its position every few seconds, the screen only shows the latest dot (not the whole history), and the tower can instantly ask "which planes are within 10km?" (geo search).`,
      quickRevision: [
        'Frequent small updates → cheap write path',
        'Latest position in Redis GEO + TTL heartbeat',
        'History via queue → batch storage',
        'Customer tracking via pub/sub + sockets, throttled, interpolated',
        'Matching with geo search + lock/TTL on the driver',
      ],
      followUps: [
        'How do you scale to 1 million drivers?',
        'How do you calculate ETA?',
        'How do you prevent assigning one driver to two orders?',
      ],
    },
    {
      id: 'sd-design-autocomplete',
      question: 'Design search autocomplete (typeahead) — backend and frontend.',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design', 'react', 'caching', 'performance'],
      answer: `**Requirements**: as the user types, show the top 5–10 suggestions in **under ~100ms**, ranked by popularity (and maybe personalisation), tolerating typos. It's extremely read-heavy.

**Backend**:

- **Data**: count queries from **search logs**, aggregated offline (hourly or daily) into prefix → top suggestions.
- **Serving structure**:
  - a **trie** where each node stores its **precomputed top-k** completions, so a lookup is just walking the prefix;
  - or a prefix → top-k map in **Redis**;
  - or a search engine (Elasticsearch completion suggester / OpenSearch) for typo tolerance.
- **Caching**: popular prefixes are cached at the edge (CDN) and in memory. Responses are tiny, so cache aggressively.
- **Updates**: rebuild or merge periodically. Trending terms can be boosted via a streaming pipeline.

**Frontend**:

- **debounce** (~150–300ms) and a minimum of 2 characters;
- **cancel stale requests** (\`AbortController\`) or ignore out-of-order responses;
- **cache results per prefix** on the client;
- **keyboard navigation** (↑ ↓ Enter Esc) and ARIA \`combobox\`/\`listbox\` with \`aria-activedescendant\`;
- highlight the matched part, plus loading, empty and error states.`,
      analogy: `A barista who knows the top orders for every first word: you say "flat" and they already have "flat white" ready, because they counted yesterday's orders overnight (offline aggregation), instead of searching every receipt while you wait.`,
      quickRevision: [
        'Offline aggregation of search logs → top-k per prefix',
        'Trie with precomputed top-k / Redis / search engine',
        'Cache popular prefixes at edge + memory',
        'Frontend: debounce, abort stale, cache per prefix',
        'Keyboard + ARIA combobox; highlight matches',
      ],
      followUps: [
        'How would you add typo tolerance?',
        'How do you personalise suggestions?',
        'How do you keep offensive suggestions out?',
      ],
    },
  ],
});
