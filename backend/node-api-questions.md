# Node.js, Express & API Interview Questions

Common backend questions for full-stack roles. Runtime internals (event loop, libuv) are in [../javascript/nodejs-runtime.md](../javascript/nodejs-runtime.md), and DB topics in [../database/](../database/).

---

## 1. Node.js core

| Question | Short answer |
|----------|--------------|
| Is Node single-threaded? | JS runs on one thread. libuv uses a thread pool (fs, crypto, dns) and OS async I/O. CPU-heavy work blocks everything, so use worker threads or a queue. |
| How do you handle CPU-heavy work? | `worker_threads`, offload to a job queue (BullMQ), or a separate service. |
| Streams? | Process data in chunks (readable, writable, transform, duplex). Used for big files and uploads. `pipeline()` handles backpressure and errors. |
| CommonJS vs ES modules? | `require` is synchronous and dynamic. `import` is static, enabling tree shaking and top-level `await`. |
| `process.nextTick` vs `setImmediate`? | `nextTick` runs before other microtasks. `setImmediate` runs in the check phase. See the event loop notes. |
| Unhandled rejections? | Since Node 15 the process crashes by default. Always handle them, and log and exit gracefully. |
| Graceful shutdown? | On `SIGTERM`: stop accepting connections, finish in-flight requests, close DB and Redis, then exit. Important in ECS and Kubernetes. |
| Clustering? | `cluster` / PM2 run one process per core. In containers, usually run one process per container and scale containers instead. |

## 2. Express

| Question | Short answer |
|----------|--------------|
| What is middleware? | `(req, res, next)` functions run in order. Used for auth, logging, validation and parsing. Call `next()` or send a response. |
| Error-handling middleware? | It has 4 args `(err, req, res, next)` and is registered last. Express 5 forwards rejected async handlers to it automatically. |
| `res.send` vs `res.json` vs `res.end`? | See [Techzu notes](../companies/techzu.md). |
| How do you structure an Express app? | routes → controllers (HTTP) → services (business logic) → models/repositories. Centralized errors, config from env. |
| Validation? | Zod or Joi schemas in middleware, validating body, params and query. Never trust the client. |
| Express 4 vs 5? | Express 5 has native async error handling, removes deprecated APIs and changes path matching syntax. |
| Why Fastify? | Faster, schema-based validation and serialization, a plugin system. You used it in the AI SQL Assistant. |

## 3. REST API design

| Question | Short answer |
|----------|--------------|
| REST principles? | Resources as nouns, HTTP verbs, stateless, proper status codes, consistent errors. |
| PUT vs PATCH? | PUT replaces the whole resource and is idempotent. PATCH is a partial update. |
| Idempotency? | Repeating the request gives the same result: GET, PUT, DELETE. For POST payments, use an **Idempotency-Key** header stored server-side. |
| Status codes to know? | 200, 201, 204, 301/302, 304, 400, 401 (unauthenticated) vs 403 (forbidden), 404, 409 conflict, 422, 429, 500, 502, 503. |
| Pagination? | Offset/limit is simple but slow at large offsets and unstable. Cursor-based (`?after=id`) is stable and fast. |
| API versioning? | `/api/v1`, a header, or evolve without breaking changes. |
| Rate limiting? | Token bucket or sliding window, stored in Redis so it works across instances. Return 429. |
| REST vs GraphQL? | GraphQL: the client chooses fields, one endpoint, avoids over- and under-fetching, but caching and N+1 are harder. |
| Webhooks: how to handle safely? | Verify the signature, respond 2xx fast, process async, dedupe by event ID (they can arrive twice). |

## 4. Authentication & security

| Question | Short answer |
|----------|--------------|
| Session vs JWT? | Session: state on the server, easy to revoke. JWT: stateless and signed, hard to revoke, so use short expiry plus refresh tokens. |
| Access + refresh token flow? | Short access token (~15 min), long refresh token in an httpOnly cookie, rotate the refresh token on use, revoke on logout. |
| Where do you store passwords? | bcrypt or argon2 hashes with a salt. Never encrypt or store plain text. |
| OAuth 2.0 vs OIDC? | OAuth is authorization (access tokens). OIDC adds authentication (ID token). Microsoft SSO with MSAL uses Authorization Code + PKCE. |
| RBAC implementation? | User → roles → permissions. Middleware like `authorize('invoice:create')` checks permissions on every request. |
| OWASP top risks? | Injection (including NoSQL `$ne` injection), broken auth, broken access control (IDOR), XSS, misconfiguration, sensitive data exposure. |
| CORS? | A browser policy. The server allows origins via headers. It isn't security for the server itself. |
| Secrets? | Env vars or a secrets manager (AWS Secrets Manager), never committed to git. Use OIDC in CI instead of static keys. |
| Security headers? | `helmet`: CSP, HSTS, X-Frame-Options, etc. |

## 5. MongoDB & Mongoose

| Question | Short answer |
|----------|--------------|
| Embed vs reference? | Embed data read together and bounded in size. Reference data that is large, unbounded or shared. |
| Indexes? | Single, compound (ESR rule: Equality, Sort, Range), unique, TTL, text. Check with `explain()`. See [indexing](../database/indexing.md). |
| Aggregation pipeline? | `$match` → `$group` → `$lookup` → `$project` → `$sort`. Put `$match` early so it can use indexes. |
| Transactions in MongoDB? | Multi-document ACID on replica sets via sessions. Use them for money movement, but they cost performance. |
| Mongoose `lean()`? | Returns plain objects instead of documents, which is faster for reads. |
| N+1 with `populate`? | Populate runs extra queries. Use `$lookup` or batch loading for lists. |
| Money storage? | Integer minor units (cents) or `Decimal128`, never JS floats. Relevant to multi-currency invoicing. |
| MongoDB vs PostgreSQL: when? | Postgres for relational data, strong consistency, complex joins and reporting. Mongo for flexible schemas and document-shaped data. |

## 6. Redis, queues & real-time

| Question | Short answer |
|----------|--------------|
| What do you use Redis for? | Cache, sessions, rate limiting, pub/sub, distributed locks, BullMQ queues, Socket.IO adapter. |
| Caching strategies? | Cache-aside (most common), write-through, write-behind. Set a TTL, invalidate on write. See [caching](../database/caching.md). |
| Cache stampede? | Many misses at once hit the DB. Fixes: a lock or single-flight, early refresh, jittered TTL. |
| Why a job queue (BullMQ)? | Move slow or unreliable work (emails, PDFs, webhooks) out of the request. You get retries with backoff, delays, concurrency control and dead-letter jobs. |
| WebSocket vs polling vs SSE? | WebSocket is two-way. SSE is server → client only and simpler. Polling is simple but wasteful. |
| Scaling Socket.IO to many servers? | Sticky sessions at the load balancer plus the **Redis adapter** to broadcast across instances. You did this in SmartJobHub. |
| Socket auth? | Verify the JWT in the handshake middleware and join the user to a `user:{id}` room. |

## 7. Testing & observability

| Question | Short answer |
|----------|--------------|
| How do you test an API? | Unit tests for services, integration tests with Supertest against a test DB, contract checks. You have 15 suites in SmartJobHub. |
| Mocking external APIs? | Mock at the HTTP boundary (nock / MSW) or inject the client. |
| Logging? | Structured JSON logs (pino) with a request ID, no secrets or PII. |
| Monitoring? | Metrics (Prometheus), errors (Sentry), logs (Loki/CloudWatch), alerts on error rate and latency. |

## 8. Scenario questions (very common)

1. **The API is slow. How do you debug it?** Measure first (APM, logs with timing) → find the slow query (`explain`, slow query log) → add an index, projection, caching or pagination → measure again. Link this to your 25–35% improvement.
2. **Prevent double payment / double submit.** Idempotency key, unique index, disable the button on the client, DB transaction.
3. **Two users book the same slot / buy the last item.** Atomic conditional update (`findOneAndUpdate({stock: {$gt: 0}}, {$inc: {stock: -1}})`), unique constraint, or a row lock. See [row-level locking](../database/row-level-locking.md).
4. **Upload a 1GB file.** Presigned S3 URL so the client uploads directly, and multipart upload. Don't stream it through Node unless you must.
5. **Send 100k emails.** Queue with batching, rate limits and retries, tracking status per job.
6. **A third-party API is down.** Timeouts, retries with exponential backoff and jitter, circuit breaker, fallback or queue for later, alerting.
