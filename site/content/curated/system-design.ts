import { defineQuestions } from '../../lib/content/curated-schema';

const sd = { category: 'system-design', tags: ['system-design'] };

export default defineQuestions([
  // ================================================================ Fundamentals
  {
    ...sd,
    id: 'sd-interview-framework',
    section: 'Fundamentals',
    question: 'How do you approach a system design interview?',
    perspective: 'design',
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `I follow the same structure every time, and I **say each step out loud**, because they're grading the thinking as much as the result:

1. **Clarify requirements (≈5 min)**: functional ("users can shorten a URL and get redirected") and **non-functional** (scale, latency, availability, consistency, cost). Ask who the users are and what matters most.
2. **Estimate (≈3 min)**: users, requests per second, read/write ratio, storage per year. This tells me whether one Postgres is enough or I need sharding and caching.
3. **API and data model**: the main endpoints and the core tables or collections.
4. **High-level design**: draw the boxes, client → load balancer → stateless services → cache → database, plus queues, object storage and CDN where needed. Walk one request end to end.
5. **Deep dive** into 1–2 hard parts the interviewer cares about: ID generation, consistency, hot keys, fan-out, failure handling.
6. **Bottlenecks and trade-offs**: what breaks first at 10× load, single points of failure, monitoring, and what I'd do differently with more time.

For a mid-level role they want **structured thinking and honest trade-offs**, not a perfect Google-scale architecture.`,
    analogy: `Like an architect designing a house: first ask how many people will live there and what they need (requirements), check the budget and plot size (estimates), sketch the floor plan (high-level design), then detail the tricky parts like plumbing and stairs (deep dive).`,
    quickRevision: [
      'Requirements: functional + non-functional (scale, latency, consistency)',
      'Estimate: RPS, read/write ratio, storage',
      'API + data model',
      'High-level boxes; walk one request through',
      'Deep dive 1–2 hard parts; then bottlenecks + trade-offs',
    ],
    followUps: [
      'What questions would you ask before designing anything?',
      'How do you decide what to deep-dive into?',
      'What would you monitor in this system?',
    ],
    avoid: [
      'Jumping straight into drawing boxes without requirements',
      'Naming technologies without saying why',
      'Designing for Google scale when the requirements say 10k users',
    ],
    relatedCollected: ['backend/system-design-questions/url-shortener-1'],
  },
  {
    ...sd,
    id: 'sd-scaling-load-balancing',
    section: 'Fundamentals',
    question: 'Vertical vs horizontal scaling — and how does load balancing work?',
    perspective: 'concept',
    difficulty: 'easy',
    frequency: 'very-high',
    tags: ['system-design', 'aws', 'linux-networking'],
    answer: `- **Vertical scaling** (scale up) means a **bigger machine**: more CPU, RAM, faster disk. It's simple and needs no code changes, but it has a **ceiling**, gets expensive, and the machine is still a **single point of failure**.
- **Horizontal scaling** (scale out) means **more machines** behind a **load balancer**. It's practically unlimited and fault tolerant, but the app must be **stateless**: sessions in Redis or JWT, files in S3, and real-time via a pub/sub adapter.

A **load balancer** spreads requests across healthy instances:

- **Algorithms**: round robin, **least connections**, or IP/consistent hash when you need stickiness.
- **Health checks** remove dead instances automatically.
- **Layer 7** (ALB, Nginx) can route by path or host and terminate TLS. **Layer 4** (NLB) is faster and protocol-agnostic.
- The load balancer itself is made highly available (managed, or redundant across AZs).

In practice I scale the **stateless app tier horizontally**. Databases are often scaled vertically first, then with read replicas and sharding.`,
    analogy: `Vertical scaling is hiring one super-fast chef; horizontal scaling is hiring more chefs and a head waiter (load balancer) who sends each order to whichever chef is free, and stops sending orders to a chef who's gone home sick (health checks).`,
    quickRevision: [
      'Vertical: bigger box, simple, ceiling + SPOF',
      'Horizontal: more boxes, needs stateless app',
      'LB algorithms: round robin, least connections, hashing',
      'Health checks; L7 (path/host/TLS) vs L4',
      'Scale app horizontally; DB: vertical → replicas → shards',
    ],
    followUps: [
      'What makes an app stateless?',
      'When do you need sticky sessions?',
      'How do you avoid the load balancer being a single point of failure?',
    ],
  },
  {
    ...sd,
    id: 'sd-caching-layers',
    section: 'Fundamentals',
    question: 'Where can you add caching in a system, and what are the trade-offs?',
    perspective: 'trade-off',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['system-design', 'caching', 'redis', 'performance'],
    answer: `Caching can happen at **every layer**, and the closer to the user, the faster and cheaper:

1. **Browser**: \`Cache-Control\`, ETags, service workers. Hashed static assets can be cached "forever".
2. **CDN** (CloudFront, Cloudflare): static files, images and even public API responses at edge locations near users.
3. **Reverse proxy** (Nginx): microcaching of hot pages.
4. **Application cache** (Redis, Memcached): computed results, sessions and hot DB rows, usually with **cache-aside**.
5. **In-process memory**: tiny, ultra-hot data (config, feature flags). Not shared between instances.
6. **Database**: its own buffer cache, plus **materialised views** for expensive aggregates.

The trade-offs are always the same:

- **staleness vs speed**: TTLs and invalidation;
- **consistency** between instances;
- **memory cost**;
- **cache stampedes** when hot keys expire;
- added complexity, and harder debugging ("is it the cache?").

I cache data that's **read-heavy, expensive and tolerant of slight staleness**, and keep must-be-exact data (balances, stock) coming from the source of truth.`,
    analogy: `Keeping things closer the more often you need them: your keys in your pocket (browser), snacks in the kitchen (CDN), groceries in the pantry (Redis), and the supermarket (database) only when you run out.`,
    quickRevision: [
      'Layers: browser → CDN → proxy → Redis → in-process → DB',
      'Closer to the user = faster, but harder to invalidate',
      'Cache-aside + TTL + invalidation on write',
      'Risks: staleness, stampedes, memory, debugging',
      'Never cache must-be-exact data blindly',
    ],
    followUps: [
      'How would you invalidate a CDN cache after a deploy?',
      'What is a cache stampede and how do you prevent it?',
      'Write-through vs write-back vs cache-aside?',
    ],
    relatedCollected: ['database/caching/what-is-caching'],
  },
  {
    ...sd,
    id: 'sd-database-scaling',
    section: 'Fundamentals',
    question: 'How do you scale a database? Explain replication, partitioning and sharding.',
    perspective: 'concept',
    difficulty: 'hard',
    frequency: 'very-high',
    tags: ['system-design', 'sql', 'mongodb'],
    answer: `I scale a database **in steps**, from cheapest to most complex:

1. **Optimise first**: indexes, query fixes, connection pooling (pgBouncer), and **caching** hot reads. This often buys 10×.
2. **Vertical scaling**: a bigger instance.
3. **Read replicas (replication)**: the primary handles writes, and **replicas** copy its changes and serve **reads**. Great for read-heavy apps. The catch is **replication lag**, so a user might not see their own write immediately. Read-your-own-writes from the primary.
4. **Partitioning**: split a big table **inside one database**, e.g. by month for logs or orders, so queries and maintenance touch smaller pieces.
5. **Sharding**: split data across **multiple databases** by a **shard key** (\`user_id\`, \`tenant_id\`). Each shard holds a subset, so **writes scale too**. The costs:
   - choosing a good key, to avoid **hot shards**;
   - **cross-shard queries and transactions** become hard;
   - rebalancing is painful (consistent hashing helps).

I'd only shard when a single primary truly can't handle the **write** load or the data size. Many products never need to.`,
    analogy: `A busy library: first organise the shelves (indexes), then build a bigger library (vertical), then open reading-room copies of popular books (replicas), and only as a last resort split the collection across several buildings by surname (sharding), which makes "find all books about X" much harder.`,
    quickRevision: [
      'Optimise + cache before scaling',
      'Replicas scale reads; watch replication lag',
      'Partitioning: split a table within one DB',
      'Sharding: split across DBs by shard key; scales writes',
      'Sharding costs: hot shards, cross-shard queries, rebalancing',
    ],
    followUps: [
      'How do you choose a shard key?',
      'How do you handle "read your own writes" with replicas?',
      'What is the difference between partitioning and sharding?',
    ],
    relatedCollected: ['database/normalization/how-do-normalization-indexing-and-caching-work-together'],
  },
  {
    ...sd,
    id: 'sd-cap-consistency',
    section: 'Fundamentals',
    question: 'Explain the CAP theorem and consistency models (strong vs eventual).',
    perspective: 'concept',
    difficulty: 'medium',
    frequency: 'high',
    answer: `**CAP** says that in a distributed system, during a **network partition** (P, which you can't avoid), you must choose between:

- **Consistency (C)**: every read sees the latest write, or gets an error;
- **Availability (A)**: every request gets a response, even if it might be stale.

So the real choice is **CP vs AP when something breaks**:

- **CP**: refuse or delay requests rather than return stale data. Use it for **money, inventory, bookings**.
- **AP**: keep answering, even if some replicas are behind, and reconcile later. Use it for **likes, feeds, view counts, presence**.

**Consistency models** in practice:

- **Strong consistency**: reads always reflect the latest committed write (a single Postgres primary).
- **Eventual consistency**: replicas converge "soon" (DNS, caches, read replicas, many NoSQL stores).
- In between: **read-your-own-writes**, **causal** and monotonic reads.

A good answer applies it per feature: "the payment ledger is strongly consistent, the activity feed is eventually consistent."`,
    analogy: `Two bank branches lose their phone line between them. Either they stop serving withdrawals until the line is back (consistency), or they keep serving and risk an overdraft that's fixed later (availability). Which one is right depends on whether it's cash or loyalty points.`,
    quickRevision: [
      'Partition happens → choose C or A',
      'CP: correct or error (money, stock)',
      'AP: always answers, maybe stale (feeds, likes)',
      'Strong vs eventual; read-your-own-writes in between',
      'Choose per feature, not per system',
    ],
    followUps: [
      'Is MongoDB CP or AP?',
      'What is PACELC?',
      'How would you show eventual consistency to users without confusing them?',
    ],
  },
  {
    ...sd,
    id: 'sd-message-queues',
    section: 'Fundamentals',
    question: 'When would you use a message queue? Kafka vs RabbitMQ vs SQS.',
    perspective: 'trade-off',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['system-design', 'nodejs', 'aws'],
    answer: `A queue **decouples** the producer from the consumer. Use one when work is:

- **slow** (emails, PDFs, video processing): respond fast, process later;
- **spiky**: the queue absorbs bursts and workers drain at a steady rate;
- **unreliable**: retries with backoff, and dead-letter queues;
- **fan-out**: one event, many consumers (billing, email, analytics).

Choosing:

- **SQS** (or BullMQ on Redis): a simple **job queue**. Each message is processed by one worker, it's managed and cheap, with at-least-once delivery. This is my default for background jobs.
- **RabbitMQ**: a flexible **message broker**, with routing (exchanges, topics), priorities, and per-message acknowledgement. Good for complex routing between services.
- **Kafka**: a **distributed, durable log**. Messages are **kept** (replayable), consumers track their own offsets, ordering is guaranteed **per partition**, and throughput is huge. Use it for **event streaming**, analytics pipelines and event sourcing, where many consumers read the same stream.

Whatever the tool: delivery is usually **at-least-once**, so consumers must be **idempotent**.`,
    analogy: `SQS is a ticket queue at a deli (each ticket served once); RabbitMQ is a post room that sorts letters into the right departments' trays; Kafka is a newspaper archive where every department can read every edition at its own pace, even last week's.`,
    quickRevision: [
      'Use for slow, spiky, unreliable or fan-out work',
      'SQS/BullMQ: simple job queues',
      'RabbitMQ: routing, priorities, acks',
      'Kafka: durable replayable log, per-partition order, high throughput',
      'At-least-once → idempotent consumers',
    ],
    followUps: [
      'How do you guarantee ordering?',
      'What is a dead-letter queue?',
      'What is the transactional outbox pattern?',
    ],
    relatedCollected: ['backend/node-api-questions/why-a-job-queue-bullmq'],
  },
  {
    ...sd,
    id: 'sd-consistent-hashing',
    section: 'Fundamentals',
    question: 'What is consistent hashing and why is it used?',
    perspective: 'concept',
    difficulty: 'hard',
    frequency: 'medium',
    answer: `With simple hashing, \`server = hash(key) % N\`, adding or removing **one** server changes N, so **almost every key moves** to a different server. For a cache that means a sudden storm of misses; for a database, a huge data migration.

**Consistent hashing** puts servers and keys on a **ring** (hash space 0…2³²). A key belongs to the **next server clockwise**. When a server is added or removed, **only the keys between it and its neighbour move**, about 1/N of the data.

To avoid uneven load, each server gets many **virtual nodes** spread around the ring, which smooths the distribution and lets bigger machines take more vnodes.

It's used in **distributed caches** (Memcached clients), **DynamoDB/Cassandra** partitioning, **load balancers** for sticky routing, and CDNs.`,
    analogy: `Seats around a round table: each guest (key) sits next to the nearest waiter (server) clockwise. If one waiter leaves, only the guests in their section move to the next waiter; everyone else stays put.`,
    quickRevision: [
      'hash % N → adding a server reshuffles almost everything',
      'Ring: key goes to next server clockwise',
      'Add/remove server → only ~1/N keys move',
      'Virtual nodes for even distribution',
      'Used in caches, Dynamo/Cassandra, sticky LB',
    ],
    followUps: [
      'Why do you need virtual nodes?',
      'How would you handle a hot key on one node?',
      'How does replication work on the ring?',
    ],
  },
  {
    ...sd,
    id: 'sd-estimation',
    section: 'Fundamentals',
    question: 'How do you do back-of-the-envelope estimation in a design interview?',
    perspective: 'practical',
    difficulty: 'medium',
    frequency: 'high',
    answer: `The goal is the **order of magnitude**, to justify design decisions, not precise maths. I round aggressively and say the assumptions out loud.

**Useful numbers**: 1 day ≈ **100k seconds** (86,400); 1 million requests/day ≈ **12 RPS**; peak ≈ **2–3× average**.

**Example** (a URL shortener):

- 100M new URLs per month → about **40 writes/s** on average, ~100/s at peak.
- Read:write is 100:1 → about **4,000 reads/s**, ~10k at peak, so I need a **cache**.
- Each record is about 500 bytes → 100M × 500B = **50GB/month**, ~3TB over 5 years. That fits in a sharded or large single DB, but it grows.
- Bandwidth: 4k reads/s × ~500B ≈ 2MB/s. Small.

Then I connect the numbers to decisions: "10k reads per second is easy for Redis, so cache redirects", "3TB means I should plan partitioning", "40 writes per second, so one primary is fine".`,
    analogy: `Like estimating whether your luggage fits the car: you don't weigh every shirt, you count suitcases and know roughly how big the boot is.`,
    quickRevision: [
      '1 day ≈ 100k s; 1M/day ≈ 12 RPS; peak 2–3×',
      'Estimate QPS (read/write), storage, bandwidth',
      'Round aggressively, state assumptions',
      'Turn numbers into decisions (cache? shard? queue?)',
    ],
    followUps: [
      'Estimate storage for a chat app with 10M daily users.',
      'How many servers would you need for 10k RPS?',
    ],
  },

  // ================================================================ Design problems
  {
    ...sd,
    id: 'sd-design-url-shortener',
    section: 'Design problems',
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
    analogy: `A cloakroom: you hand in a long coat (URL), get a small ticket (code), and the attendant keeps the most-collected coats at the front desk (cache), while a clerk tallies how often each ticket is used (analytics queue) without slowing down the line.`,
    quickRevision: [
      'Read-heavy → Redis cache code → URL',
      'Counter + base62 (7 chars ≈ 3.5T), shuffled to avoid guessing',
      '302 for analytics; clicks via queue, aggregated async',
      'API: POST /api/links, GET /:code, GET stats',
      'Web: create form + copy/QR + dashboard with charts',
    ],
    followUps: [
      'How do you support custom aliases without collisions?',
      'How do you stop abuse (spam, phishing links)?',
      'What changes at 100× the traffic?',
      'How do you generate unique IDs across many servers?',
    ],
    variants: [
      {
        label: 'Frontend-focused version',
        answer: `For a frontend-heavy interview I'd still sketch the backend briefly, then go deep on the **web app**:

- A **create page** with a URL input, client-side validation (Zod), optimistic UI, a **copy button** with feedback, and a QR code.
- A **dashboard** with a paginated table of links (TanStack Query, cursor pagination), search and filters, and per-link **analytics charts** (clicks over time, countries, referrers) loaded lazily.
- **Performance**: the landing page as SSG on a CDN, and the dashboard code-split.
- **Auth** with httpOnly cookies.
- **Accessibility** (labels, focus, announcements after copying), plus error and empty states.`,
      },
    ],
    deepDive: `\`\`\`text
             ┌──────── CDN (static web app) ────────┐
Browser ───▶ Load balancer ──▶ API (stateless × N) ──▶ Redis  (code → url, TTL)
                                   │        │
                                   │        └──▶ Postgres / DynamoDB (links)
                                   └──▶ Queue ──▶ Analytics workers ──▶ daily_clicks
\`\`\`

Base62: \`0-9a-zA-Z\` → 62⁷ ≈ 3.5 × 10¹² codes.`,
    relatedCollected: ['backend/system-design-questions/url-shortener-1'],
  },
  {
    ...sd,
    id: 'sd-design-chat-app',
    section: 'Design problems',
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
    relatedCollected: ['backend/system-design-questions/chat-app-whatsapp--messenger-1'],
  },
  {
    ...sd,
    id: 'sd-design-notification-system',
    section: 'Design problems',
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
    relatedCollected: ['backend/system-design-questions/notification-system-1'],
  },
  {
    ...sd,
    id: 'sd-design-rate-limiter',
    section: 'Design problems',
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
    relatedCollected: ['backend/system-design-questions/rate-limiter-1'],
  },
  {
    ...sd,
    id: 'sd-design-news-feed',
    section: 'Design problems',
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
    relatedCollected: ['backend/system-design-questions/news-feed--timeline-1'],
  },
  {
    ...sd,
    id: 'sd-design-file-storage',
    section: 'Design problems',
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
    relatedCollected: ['backend/system-design-questions/file-upload-service-1'],
  },
  {
    ...sd,
    id: 'sd-design-live-location',
    section: 'Design problems',
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
    ...sd,
    id: 'sd-design-autocomplete',
    section: 'Design problems',
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
    relatedCollected: ['backend/system-design-questions/autocomplete--typeahead'],
  },
]);
