# System Design Questions (Mid-Level)

For a Level 3 / mid-level role, expect a **30–45 minute design discussion** about a familiar product. They want structured thinking and trade-offs, not perfect diagrams.

---

## Framework (use it every time)

```text
1. Clarify requirements   → functional + non-functional (users, scale, latency, consistency)
2. Estimate (rough)       → requests/sec, storage, read vs write heavy
3. API design             → main endpoints
4. Data model             → entities, relationships, DB choice
5. High-level design      → client → LB → services → DB / cache / queue
6. Deep dive              → the hardest part (concurrency, scaling, real-time)
7. Trade-offs & failures  → what breaks, how you monitor, what you'd do next
```

**Building blocks to name:** load balancer, stateless app servers, DB with replicas / indexes, Redis cache, message queue, object storage + CDN, WebSockets, rate limiter, monitoring.

---

## Most common prompts

| Prompt | Key points interviewers look for |
|--------|----------------------------------|
| **URL shortener** | ID generation (base62 counter vs hash, collisions), read-heavy so cache redirects in Redis, 301 vs 302 (analytics), expiry |
| **Chat app** (WhatsApp / Messenger) | WebSockets, Redis pub/sub or adapter across servers, message storage partitioned by conversation, delivered/read receipts, offline push. **You built this in SmartJobHub.** |
| **Notification system** | Queue per channel (email/SMS/push), retries, user preferences, templates, dedupe, rate limits |
| **E-commerce checkout / flash sale** | Inventory reservation with TTL, atomic decrement, preventing overselling, payment idempotency, queue the spike. **Your Sneaker Drop project.** |
| **Booking system** (doctor / hotel / movie seats) | Slot locking, unique constraint on (slot, time), hold expiry, double-booking prevention. **Your Doctor Appointment project.** |
| **Payment / invoicing system** | Ledger (double-entry), idempotency keys, state machine (draft → sent → paid → void), multi-currency, reconciliation, audit log. **Firmwide.** |
| **News feed / timeline** | Fan-out on write vs on read, celebrity problem, cache feed in Redis, cursor pagination |
| **Rate limiter** | Token bucket / sliding window in Redis, per user / IP / API key, 429 + `Retry-After` |
| **File upload service** | Presigned S3 URLs, multipart, virus scan async, CDN for downloads, metadata in DB |
| **Job portal / search** | Search index (Elasticsearch / Atlas Search / Postgres FTS), filters, pagination, application status history |
| **Real-time dashboard / live stock prices** | WebSocket or SSE, throttle updates, pub/sub, snapshot + delta |

---

## Frontend system design (if the role is frontend-heavy)

| Prompt | Talk about |
|--------|-----------|
| Design an autocomplete / typeahead | Debounce, cancel stale requests (AbortController), cache results, keyboard navigation, ARIA combobox |
| Design an infinite-scroll feed | IntersectionObserver, virtualization, cursor pagination, skeletons, scroll restoration |
| Design a component library | Tokens/theming, accessibility, composition API, versioning, Storybook, tree-shakeable exports |
| Design a large SPA's architecture | Feature slices, routing + code splitting, server vs client state, error boundaries, monitoring |
| Design a real-time collaborative form / notifications UI | Socket client lifecycle, reconnection, optimistic UI, conflict handling |

---

## Worked example: Flash-sale inventory (your Sneaker Drop)

```text
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
```

Trade-offs to mention: Redis as the fast gate vs the DB as source of truth (reconcile), what happens if Redis restarts, and sticky sessions for sockets.

---

## Answers for each prompt

Each answer follows the framework. Say the requirements first, then draw the boxes.

### URL shortener

- **Requirements:** create a short link, redirect, optional expiry and click analytics. Very **read-heavy** (about 100 reads per write).
- **API:** `POST /links {url}` → `{code}`; `GET /:code` → 301/302 redirect.
- **Data:** `links(code PK, longUrl, userId, createdAt, expiresAt)`, `clicks(code, ts, country…)`.
- **ID generation:** a global counter (DB sequence or Redis `INCR`) encoded in **base62** gives short, unique codes with no collisions. Alternative: hash the URL and take 7 characters, but you must handle collisions. Random codes are guessable if they're short.
- **Design:** client → LB → stateless API → **Redis cache** (code → URL) → DB. Most redirects come from the cache.
- **301 vs 302:** a 301 is cached by browsers (less load, but you lose analytics). A 302 hits your server every time, so you can count clicks.
- **Analytics:** don't write to the DB during the redirect. Push the click event to a queue and aggregate it asynchronously.
- **Scale:** read replicas, CDN/edge redirects, and partition the DB by code.

### Chat app (WhatsApp / Messenger)

- **Requirements:** 1-to-1 and group messages, online status, delivered/read receipts, history, offline delivery.
- **Connection:** WebSockets to a **gateway/chat server**. A user is connected to one server.
- **Cross-server delivery:** Redis pub/sub (Socket.IO Redis adapter) or a broker (Kafka/NATS). Server A publishes, and the server holding the receiver's socket delivers. *(This is what you did in SmartJobHub.)*
- **Storage:** `messages(conversationId, messageId (time-ordered), senderId, body, createdAt)`, partitioned by `conversationId` and paginated by cursor. Write-heavy, so Cassandra or DynamoDB at huge scale, but MongoDB or Postgres is fine for most apps.
- **Flow:** send → persist → ack to sender (✓) → deliver to receiver → receiver acks (✓✓ delivered) → read event (read).
- **Offline user:** the message is stored, and a push notification (FCM/APNs) goes through a queue. On reconnect, fetch messages after the last seen ID.
- **Presence:** heartbeat with a Redis key and TTL. Broadcast only to the user's contacts.
- **Ordering:** order per conversation by server timestamp or sequence number. Client-generated IDs dedupe retries.

### Notification system

- **Requirements:** email, SMS, push and in-app; user preferences; templates; retries; no duplicates.
- **Design:** services call `POST /notify {userId, type, data}` → the notification service checks **preferences** and rate limits → renders a **template** → puts a job on a **queue per channel** → workers send via providers (SES, Twilio, FCM).
- **Reliability:** retries with exponential backoff, a dead-letter queue, an **idempotency key** per event so a retry doesn't send twice, and provider fallback.
- **In-app:** store in a `notifications` table and push live via WebSocket. Mark as read.
- **Scale:** workers scale independently. Batch digests for low-priority notifications.

### E-commerce checkout / flash sale

- **Requirements:** never oversell; handle a traffic spike; payment must be safe.
- **Inventory:** reserve with an **atomic conditional decrement** (`stock > 0`) in the DB, or Redis `DECR` / a Lua script as a fast gate. Each reservation holds stock with a **TTL**, and stock is released if checkout doesn't complete.
- **Order state machine:** `created → reserved → paid → fulfilled` / `cancelled / expired`.
- **Payment:** an idempotency key on payment creation; trust the gateway's **webhook / server verification**, not the redirect.
- **Spike:** a CDN for static pages, rate limit per user, a queue or virtual waiting room, and pre-warmed autoscaling.
- See the worked example below.

### Booking system (doctor / hotel / movie seats)

- **Requirements:** show availability; no double booking; temporary hold during payment.
- **Data:** `slots(id, resourceId, startTime, status)` with `bookings(slotId UNIQUE, userId, status)`.
- **Double booking:** a **unique constraint** on `(resourceId, startTime)` or `slotId` in bookings, or `UPDATE slots SET status='held' WHERE id=? AND status='free'` (check the rows affected). Movie seats: lock several seats in one transaction.
- **Hold:** `held_until` timestamp. A sweeper job frees expired holds.
- **Read path:** cache availability, but always re-check in the write transaction.
- **Extras:** timezone handling (store UTC), reminders through a queue, cancellations returning slots.

### Payment / invoicing system

- **Requirements:** create invoices, record payments, multi-currency, exact amounts, audit trail.
- **Money:** integer minor units plus a currency code. Store the exchange rate on the invoice when it's issued.
- **Ledger:** a **double-entry** style ledger (each movement is a debit and a credit that sum to zero). Balances are derived from the entries and never updated in place. Entries are append-only.
- **State machine:** `draft → issued → partially_paid → paid` / `void`. An issued invoice can't be edited, so you issue a credit note instead.
- **Idempotency:** payment requests and webhooks deduped by key or provider event ID.
- **Reconciliation:** a daily job compares the provider settlement report with the ledger and flags mismatches.
- **Audit:** who changed what and when. PDF generated once when issued and stored in S3.

### News feed / timeline

- **Fan-out on write (push):** when a user posts, write the post ID into each follower's feed (Redis list). Reads are fast, but writes are expensive for users with millions of followers.
- **Fan-out on read (pull):** build the feed when it's opened by merging posts from the people you follow. Cheap writes, slow reads.
- **Hybrid:** push for normal users, pull for celebrities, and merge at read time.
- **Store:** posts in a DB, feed IDs in Redis, media on S3 + CDN. Cursor pagination. Ranking can come later.

### Rate limiter

- **Where:** API gateway or middleware, keyed by user ID, API key or IP.
- **Algorithms:** fixed window (simple, but allows bursts at the window edge), **sliding window** (accurate), **token bucket** (allows short bursts, then a steady rate; the most common).
- **Distributed:** counters in **Redis** with atomic `INCR` + `EXPIRE` or a Lua script, so all instances share the limits.
- **Response:** `429 Too Many Requests` with a `Retry-After` header and `X-RateLimit-Remaining`.
- **Failure:** if Redis is down, decide whether to fail open (allow, the usual choice) or fail closed (for sensitive endpoints like login).

### File upload service

- **Flow:** the client asks the API for a **presigned S3 URL** → uploads directly to S3 (the API isn't in the data path) → S3 event / client callback → the API saves metadata.
- **Large files:** multipart upload, resumable.
- **Processing:** async through a queue: virus scan, thumbnails, resume parsing (like SmartJobHub).
- **Download:** private bucket + CloudFront with signed URLs.
- **Validation:** size and MIME type limits in the presigned policy and server side.

### Job portal / search

- **Data:** jobs, companies, applications (with status history), users, saved jobs.
- **Search:** full-text plus filters (location, salary, type). Use Postgres FTS or Mongo Atlas Search at small scale, and Elasticsearch/OpenSearch at large scale, synced from the main DB through events.
- **Applications:** a unique `(jobId, userId)` constraint, and a status history table for the timeline.
- **Notifications:** queue-based emails and real-time updates.
- **Scale:** cache popular searches, cursor pagination, read replicas.

### Real-time dashboard / live prices

- **Transport:** SSE if it's one-way server → client (simpler, auto-reconnect); WebSocket if two-way.
- **Fan-out:** the price source → pub/sub (Redis/Kafka) → socket servers → clients subscribed to topics/rooms per symbol.
- **Load:** throttle or batch updates (e.g. every 500ms) and send deltas, not full snapshots. On connect, send a snapshot first.
- **Frontend:** update only the changed rows, use virtualized tables, and pause updates in background tabs.

---

## Frontend system design: answers

### Autocomplete / typeahead

- Debounce input (~300ms) and set a minimum number of characters.
- Cancel stale requests with AbortController, or ignore results that don't match the latest query.
- Cache results per query in a `Map` or TanStack Query.
- Keyboard: up/down to move, Enter to select, Escape to close. ARIA `combobox` / `listbox` / `aria-activedescendant`.
- Highlight the matching text, show loading and empty states, and virtualize long lists.

### Infinite-scroll feed

- IntersectionObserver sentinel, cursor-based API, and a guard against double loads.
- Virtualize when the list gets long (TanStack Virtual).
- Skeleton loaders. Restore the scroll position when the user comes back (cache the pages).
- Handle new items arriving at the top with a "new posts" banner instead of jumping the scroll.

### Component library

- Design tokens (colour, spacing, typography) as CSS variables for theming and dark mode.
- Accessible primitives (or built on Radix), with composition APIs (`<Select><Select.Item/></Select>`).
- TypeScript props, tree-shakeable ESM build, semantic versioning and a changelog.
- Storybook for documentation and visual tests. Lint rules to prevent one-off duplicate components.

### Large SPA architecture

- Feature-sliced folders with import boundaries (your Firmwide approach).
- Route-based code splitting. Server state in TanStack Query, small client state in Context/Zustand/Redux.
- API layer with typed clients and central error handling.
- Error boundaries per route, Sentry, Web Vitals monitoring.
- CI: lint, type-check, tests and bundle-size checks.

### Real-time notifications UI

- One socket connection per app (in a context provider), authenticated in the handshake.
- Reconnection with backoff. On reconnect, refetch missed notifications since the last ID.
- Update the TanStack Query cache from socket events, so the unread count stays consistent.
- Optimistic "mark as read", rolled back on error.

---

## Questions to ask while designing

- How many users / requests per second? Is it read-heavy or write-heavy?
- Does it need strong consistency (money, inventory) or is eventual consistency OK (likes, feeds)?
- What latency target?
- Mobile, web or both? Global users?

## Common mistakes

- Jumping to microservices. Start with a **modular monolith** and split only when needed.
- No numbers at all. Rough estimates show maturity.
- Ignoring failure: what if the DB, cache or a third party goes down?
- Not explaining *why* you chose each component.
