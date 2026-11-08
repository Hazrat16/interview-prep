import { defineQuestions } from '../../lib/content/curated-schema';

export default defineQuestions([
  {
    id: 'node-single-thread-concurrency',
    question: 'Node.js is single-threaded — how does it handle thousands of concurrent requests?',
    category: 'backend',
    perspective: 'concept',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['nodejs', 'javascript', 'performance'],
    answer: `Your **JavaScript runs on one thread**, but Node is built for **non-blocking I/O**. When a request handler calls the database or another API, Node hands that work to the OS (sockets via epoll/kqueue) or to **libuv's thread pool** (file system, DNS, crypto, zlib) and moves on to the next request. When the I/O completes, the callback or promise continuation is queued and the event loop runs it.

So one thread can juggle thousands of connections because most of a web request is **waiting**, not computing.

The catch is **CPU-bound work**. A big \`JSON.parse\`, image resizing, a synchronous \`bcrypt\` or a heavy loop **blocks the event loop**, and every other request waits. Options:

- **Worker threads** for CPU-heavy tasks, or move the work to a **queue + background worker**.
- **Scale out** across cores with the \`cluster\` module, PM2 or multiple containers behind a load balancer.
- Stream large payloads instead of buffering them.`,
    analogy: `One waiter in a busy restaurant. The waiter doesn't stand in the kitchen while food cooks; they take the order, hand it to the kitchen (OS / thread pool) and serve other tables. Problems start only if the waiter personally carves a whole roast at one table (CPU work). Then nobody else gets served.`,
    quickRevision: [
      'JS on one thread; I/O delegated to the OS / libuv thread pool',
      'Great for I/O-bound work: most request time is waiting',
      'CPU-bound work blocks everyone → worker threads or a job queue',
      'Use all cores: cluster / PM2 / multiple containers',
      'Thread pool default size 4 (`UV_THREADPOOL_SIZE`)',
    ],
    followUps: [
      'What is in the libuv thread pool and when can it become a bottleneck?',
      'How would you detect event loop blocking in production?',
      '`process.nextTick` vs `setImmediate`?',
    ],
    relatedCollected: ['javascript/nodejs-runtime/node-is-single-threaded--how-does-it-handle-many-requests'],
  },
  {
    id: 'express-middleware-error-handling',
    question: 'How does Express middleware work, including error-handling middleware?',
    category: 'backend',
    perspective: 'concept',
    difficulty: 'easy',
    frequency: 'very-high',
    tags: ['express', 'nodejs', 'api-design'],
    answer: `Middleware is a function \`(req, res, next)\` in a **pipeline**. Express runs middleware **in the order it's registered**. Each one can read or modify \`req\`/\`res\`, **end the response**, or call \`next()\` to pass control on. Typical order: request ID and logging → security headers (helmet), CORS → body parsing → rate limiting → auth → validation → route handler.

**Error-handling middleware** has **four arguments** \`(err, req, res, next)\` and is registered **last**. Calling \`next(err)\` (or throwing in a sync handler) skips the normal middleware and jumps to it. That gives one place to map errors to status codes and a consistent JSON shape, and to log with the request ID, without leaking stack traces in production.

One gotcha: in Express 4, a **rejected promise in an async handler isn't caught automatically**. You need a wrapper (\`asyncHandler\`) or \`express-async-errors\`. Express 5 handles rejected promises natively.`,
    analogy: `Airport security. Each checkpoint (middleware) inspects you in order: ID check, bag scan, boarding pass. Any checkpoint can send you back (end the response) or wave you through (\`next()\`). If something goes wrong anywhere, you're escorted straight to one central office (error middleware) instead of each checkpoint handling it differently.`,
    quickRevision: [
      '`(req, res, next)`: modify, respond, or `next()`',
      'Order of registration = order of execution',
      'Error middleware: 4 args, registered last, reached via `next(err)`',
      'Express 4: wrap async handlers; Express 5 catches rejections',
      'Central error handler → consistent JSON, no stack traces in prod',
    ],
    followUps: [
      'Write a middleware that checks a role: `requireRole("admin")`.',
      'What happens if middleware neither responds nor calls `next()`?',
      'Difference between `app.use` and `router.use`?',
    ],
    relatedCollected: ['backend/node-api-questions/what-is-middleware'],
  },
  {
    id: 'rest-api-design-practices',
    question: 'What makes a well-designed REST API?',
    category: 'backend',
    perspective: 'design',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['api-design', 'express'],
    answer: `I think about it in a few layers:

- **Resources and verbs**: plural nouns (\`/invoices/:id/payments\`), HTTP methods for actions (GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes). GET is safe, and PUT/DELETE are **idempotent**.
- **Correct status codes**: 200/201 (+ \`Location\`)/204; 400 for malformed input, 401 not authenticated, 403 not allowed, 404, 409 conflict, 422 validation errors, 429 rate limited, 5xx only for server faults.
- **Consistent error shape**, e.g. \`{ error: { code, message, details } }\`, so the frontend can handle errors in one place.
- **Validation** at the edge (Zod/Joi) for body, params and query.
- **Pagination, filtering, sorting** on list endpoints. Cursor-based pagination for large or fast-changing data, offset for simple admin tables.
- **Versioning** (\`/v1\`), and evolve with backward-compatible changes.
- **Idempotency keys** for POSTs that create money-related records.
- **Security**: auth on every route, authorisation per resource (not just "logged in"), rate limits, no sensitive data in URLs.
- **Docs**: an OpenAPI spec, ideally generated from the schemas.`,
    analogy: `A good API is like a well-run library: books (resources) have predictable shelf locations (URLs), the desk follows the same rules for everyone (methods and status codes), and when something's wrong you always get the same kind of slip explaining why (error format).`,
    quickRevision: [
      'Nouns for resources, HTTP verbs for actions',
      '401 = who are you? 403 = not allowed. 422 = invalid data. 409 = conflict',
      'One error shape; validate at the edge',
      'Paginate lists (cursor for large/live data)',
      'Version, idempotency keys, rate limits, OpenAPI docs',
    ],
    followUps: [
      'Offset vs cursor pagination: trade-offs?',
      'PUT vs PATCH?',
      'REST vs GraphQL: when would you pick GraphQL?',
      'How do you make a breaking change without breaking clients?',
    ],
  },
  {
    id: 'auth-jwt-access-refresh',
    question: 'How do you implement JWT authentication with access and refresh tokens securely?',
    category: 'backend',
    perspective: 'design',
    difficulty: 'hard',
    frequency: 'very-high',
    tags: ['auth-security', 'api-design', 'react'],
    answer: `A **JWT** is a signed token (header.payload.signature). The server can verify it **without a database lookup**, which is the benefit. The downside is that it's hard to **revoke** before it expires.

So I use two tokens:

- **Access token**: short-lived (5–15 min), sent on each request, verified statelessly. Keep claims minimal (user ID, role), never secrets.
- **Refresh token**: long-lived, stored in an **httpOnly, Secure, SameSite cookie** so JavaScript (and XSS) can't read it. It's used only on \`/auth/refresh\`. It's **stored hashed in the DB**, so I can revoke it (logout, password change), and **rotated** on every use. If an old refresh token is reused, that signals theft, so I revoke the whole family.

Frontend: keep the access token in memory. On a 401, call refresh **once** and queue the other failing requests behind that single refresh (otherwise parallel requests race and log the user out), then retry them.

Plus: hash passwords with bcrypt or argon2, rate-limit login, use CSRF protection if auth relies on cookies, and check **authorisation per resource**, not just authentication.`,
    analogy: `A festival. The refresh token is your ID card kept in a locked wallet (httpOnly cookie). The access token is a day wristband: anyone at a gate can check it quickly without phoning the office (stateless), and if it's stolen it's only useful until tonight. Each morning you show your ID to get a new wristband, and the office can cancel your ID at any time.`,
    quickRevision: [
      'Access: short-lived, stateless, minimal claims',
      'Refresh: httpOnly+Secure+SameSite cookie, hashed in DB, rotated, revocable',
      'Reuse of an old refresh token → revoke the family',
      'Client: single in-flight refresh, queue + retry other 401s',
      'AuthN ≠ AuthZ: check ownership/role per resource',
    ],
    followUps: [
      'Where would you store tokens in a SPA, and why not localStorage?',
      'How do you log a user out everywhere?',
      'JWT vs server-side sessions: when would you choose sessions?',
      'How does OAuth2/OIDC SSO (e.g. Microsoft MSAL) fit in?',
    ],
  },
  {
    id: 'api-idempotency-double-submit',
    question: 'How do you prevent duplicate orders or double payments when a request is retried?',
    category: 'backend',
    perspective: 'scenario',
    difficulty: 'hard',
    frequency: 'high',
    tags: ['api-design', 'sql', 'mongodb'],
    answer: `Duplicates come from double-clicks, client retries after a timeout and network replays. You can't stop retries, so you make the operation **idempotent**: doing it twice has the same effect as doing it once.

Layers I'd use:

1. **Idempotency key**: the client generates a UUID per logical action and sends it in an \`Idempotency-Key\` header. The server stores \`key → status/result\` (with a unique constraint). A repeat with the same key **returns the stored result** instead of executing again. A concurrent duplicate gets 409 or waits.
2. **Database constraints** as the final safety net: a unique index on e.g. \`(invoiceId, paymentReference)\` or \`(proposalId)\` for "one invoice per proposal". The DB rejects the duplicate even if the app logic has a race.
3. **Transactions or atomic conditional updates**, e.g. \`UPDATE ... SET status='paid' WHERE id=$1 AND status='pending'\` and check the affected row count.
4. **UX**: disable the button while pending and show progress. This is good UX but **not** a guarantee.
5. **Payment providers**: pass the same idempotency key to Stripe and similar providers, and handle their webhooks idempotently too, since webhooks are delivered at least once.`,
    analogy: `A lift button. Pressing it five times doesn't call five lifts. The system recognises it's the same request (idempotency key) and shows the lift that's already coming (the stored result).`,
    quickRevision: [
      'Retries are inevitable → make writes idempotent',
      'Idempotency-Key header + stored result + unique constraint',
      'DB unique index = final safety net',
      'Conditional update: `WHERE status = \'pending\'` + row count',
      'Disabled button is UX, not a guarantee; webhooks are at-least-once',
    ],
    followUps: [
      'How long would you keep idempotency keys?',
      'How do you handle two identical requests arriving at the same millisecond?',
      'At-least-once vs exactly-once delivery in queues?',
    ],
    relatedCollected: ['backend/node-api-questions/prevent-double-payment--double-submit'],
  },
  {
    id: 'api-security-basics',
    question: 'How do you secure a Node.js API? Walk through the main risks.',
    category: 'backend',
    perspective: 'practical',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['auth-security', 'express', 'api-design'],
    answer: `I go through the common OWASP risks and the control for each:

- **Broken access control** (the #1 risk): check on every request that **this user may access this record**, e.g. \`WHERE id = $1 AND org_id = $user.orgId\`, not just "is logged in". Guessable IDs plus missing checks is how IDOR happens.
- **Injection**: parameterised queries or an ORM. For Mongo, validate input types so \`{ "$gt": "" }\` can't sneak into a query. Never build shell commands from input.
- **Input validation**: a Zod/Joi schema for body, params and query; reject unknown fields to avoid mass assignment (\`role: "admin"\`).
- **Authentication**: bcrypt/argon2, rate-limit login and OTP endpoints, account lockout or backoff, short-lived tokens.
- **XSS and CSRF**: escape output (React does this by default; be careful with \`dangerouslySetInnerHTML\`), a CSP header, and \`SameSite\` cookies or CSRF tokens.
- **Transport and headers**: HTTPS only, \`helmet\`, a strict **CORS allow-list** (not \`*\` with credentials).
- **Secrets and dependencies**: secrets in a manager or env, never in git. \`npm audit\` / Dependabot, and pinned lockfiles.
- **Abuse and visibility**: rate limiting, request size limits, timeouts, and logs without passwords, tokens or PII.`,
    analogy: `Securing a building: locks on every door, not just the entrance (per-resource authorisation); checking parcels before they come in (validation and injection); a guest list at reception (CORS); a limit on how often someone can try the code pad (rate limiting); and CCTV that doesn't record PIN numbers (safe logging).`,
    quickRevision: [
      'Authorise every resource access (IDOR), not just authentication',
      'Parameterised queries; validate types (NoSQL injection)',
      'Schema validation; reject unknown fields (mass assignment)',
      'helmet, HTTPS, CORS allow-list, CSP, SameSite cookies',
      'Rate limit, size limits, secret management, dependency scanning',
    ],
    followUps: [
      'What is CORS actually protecting, and what does it not protect?',
      'How does NoSQL injection work in MongoDB?',
      'How would you store API keys for third-party services?',
    ],
  },
  {
    id: 'api-slow-in-production',
    question: 'An API endpoint is slow in production. How do you investigate and fix it?',
    category: 'backend',
    perspective: 'debugging',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['performance', 'sql', 'mongodb', 'caching'],
    answer: `Measure, find the bottleneck, fix it, measure again.

1. **Scope it**: which endpoint, since when (a deploy? data growth?), is it every request or only p95/p99, and only for certain users or payload sizes?
2. **Find where the time goes**: APM traces (Datadog, New Relic, OpenTelemetry) or timing logs per step. It's usually the **database**, an **external API**, or **CPU work** blocking the event loop.
3. **Database fixes** (most common):
   - \`EXPLAIN ANALYZE\` / Mongo \`explain()\`: look for full scans and add the right (composite) **index**;
   - fix **N+1 queries** with joins, \`$lookup\`, or batching;
   - select only needed fields; **paginate**;
   - check connection pool exhaustion.
4. **Other fixes**: **cache** hot, expensive reads in Redis with sensible invalidation; call external services in **parallel** with timeouts; move slow side-effects (emails, PDFs) to a **queue**; compress responses.
5. **Verify** with the same metric, and add an alert on latency so it's caught next time.

Interview tip: tie it to a real number, e.g. "I cut response times 25–35% by adding compound indexes, projections and Redis caching for the dashboard queries."`,
    analogy: `A slow checkout line. Before hiring more cashiers, watch where people wait. Is the scanner slow (database)? Does every customer need a manager's approval (external API)? Is one person doing all the bagging (CPU work)? Fix the real bottleneck, then time the line again.`,
    quickRevision: [
      'Scope: which endpoint, since when, p95/p99, which data',
      'Trace: DB vs external API vs CPU',
      'DB: EXPLAIN, indexes, N+1, projection, pagination, pool',
      'Cache hot reads; parallelise; queue slow side-effects',
      'Re-measure and add a latency alert',
    ],
    followUps: [
      'What is the N+1 problem? Show an example.',
      'How do you decide what to cache and for how long?',
      'Why look at p99 rather than the average?',
    ],
    relatedCollected: ['backend/node-api-questions/the-api-is-slow-how-do-you-debug-it'],
  },
  {
    id: 'realtime-websocket-sse-scaling',
    question: 'WebSockets vs SSE vs polling — and how do you scale Socket.IO across multiple servers?',
    category: 'backend',
    perspective: 'trade-off',
    difficulty: 'hard',
    frequency: 'high',
    tags: ['realtime', 'redis', 'nodejs', 'system-design'],
    answer: `**Choosing a transport:**

- **Polling**: the client asks every N seconds. Simplest and works everywhere, but it's wasteful and has delay. Fine for "check export status every 5s".
- **SSE (Server-Sent Events)**: one long-lived HTTP response, **server → client only**, with automatic reconnect. Great for notifications, live prices and progress, and for streaming AI responses.
- **WebSockets**: a **full-duplex** persistent connection. Needed for chat, collaboration and multiplayer, where the client also sends frequently.

**Scaling Socket.IO:** each server only knows **its own** connected sockets. If user A is on server 1 and user B on server 2, a message emitted on server 1 never reaches B. The fix:

1. Use the **Redis adapter** (pub/sub): every server publishes events, and the server holding the target socket delivers them. Rooms work across instances.
2. Use **sticky sessions** at the load balancer if long-polling fallback is enabled, since the handshake must hit the same server.
3. **Authenticate on connection** (token in the handshake), join users to rooms like \`user:<id>\` and \`org:<id>\`, and handle **reconnection**. Persist messages in the DB so missed events can be fetched after reconnecting, rather than trusting the socket for delivery.`,
    analogy: `Polling is calling a shop every five minutes to ask "is my order ready?". SSE is the shop texting you updates. WebSockets is an open phone line both sides can talk on. With several shop branches (servers), the Redis adapter is the shared intercom: whichever branch has your order announces it, and the branch you're standing in passes it on.`,
    quickRevision: [
      'Polling = simple, wasteful; SSE = server→client, auto-reconnect; WS = two-way',
      'Each Socket.IO server only knows its own sockets',
      'Redis adapter (pub/sub) broadcasts across instances',
      'Sticky sessions if long-polling fallback is used',
      'Auth on handshake, rooms per user/org, persist messages, handle reconnects',
    ],
    followUps: [
      'Why might a WebSocket work locally but fail behind a proxy or load balancer?',
      'How would you guarantee message ordering and no duplicates in chat?',
      'Why does streaming break behind some reverse proxies (buffering)?',
    ],
    relatedCollected: ['backend/node-api-questions/scaling-socketio-to-many-servers'],
  },
  {
    id: 'system-scale-node-app',
    question: 'Your Node.js app needs to go from 1,000 to 100,000 users. How would you scale it?',
    category: 'backend',
    perspective: 'design',
    difficulty: 'hard',
    frequency: 'high',
    tags: ['system-design', 'nodejs', 'caching', 'redis', 'docker', 'aws'],
    answer: `I'd **measure first** to find which resource saturates, then scale in steps rather than redesigning everything.

1. **Make the app stateless**: no sessions or uploads on local disk. Sessions or tokens go to Redis/JWT and files to S3. Then I can run **N instances** behind a **load balancer** (containers on ECS/Kubernetes, or PM2 cluster on a VM) and autoscale on CPU or latency.
2. **The database is usually the first real bottleneck**:
   - indexes and query fixes;
   - a connection pool (pgBouncer for Postgres);
   - **read replicas** for read-heavy traffic;
   - partitioning or sharding only much later.
3. **Caching**: a CDN for static assets and public pages; **Redis** for hot, expensive reads, with clear invalidation.
4. **Async work**: move emails, PDFs, image processing and webhooks to a **queue** (BullMQ, SQS) with workers that scale separately.
5. **Protect the system**: rate limiting, timeouts, retries with backoff, circuit breakers for third parties.
6. **Real-time**: the Socket.IO Redis adapter across instances.
7. **Observability**: metrics, logs and traces with alerts, plus load testing (k6) before launch to confirm the bottleneck moved.

The key message in an interview: **stateless app tier, scale out, protect the DB, cache, make slow work asynchronous, and measure**.`,
    analogy: `Growing a café into a chain. First make sure any barista can serve any customer (stateless). Then open more counters (instances) with a host directing the queue (load balancer). Pre-make popular items (cache), send catering orders to a back kitchen (queue), and remember the bottleneck is usually the single shared fridge (the database).`,
    quickRevision: [
      'Measure → find the saturated resource',
      'Stateless instances + load balancer + autoscaling',
      'DB: indexes, pooling, read replicas, then partitioning',
      'CDN + Redis cache; queues for slow work',
      'Rate limits, timeouts, circuit breakers; observability + load tests',
    ],
    followUps: [
      'What breaks when you go from 1 instance to 2?',
      'How do you handle cache invalidation at scale?',
      'Vertical vs horizontal scaling?',
    ],
  },
  {
    id: 'docker-images-multistage',
    question: 'Docker: image vs container, and why use multi-stage builds?',
    category: 'backend',
    perspective: 'practical',
    difficulty: 'easy',
    frequency: 'very-high',
    tags: ['docker', 'ci-cd'],
    answer: `An **image** is a read-only, layered template: OS base, runtime, dependencies, your code and a start command. A **container** is a **running instance** of an image with its own writable layer, process, network and limits. One image can run as many containers.

**Multi-stage builds** use one stage with the full toolchain to **build** (install dev dependencies, compile TypeScript, build Next.js), then **copy only the output** into a small runtime stage (e.g. \`node:22-alpine\` or distroless) with production dependencies only. Benefits:

- **Much smaller images**: faster pulls and deploys, cheaper storage.
- **Smaller attack surface**: no compilers, source or dev tooling in production.
- **Better layer caching**: copy \`package*.json\` and run \`npm ci\` **before** copying source, so changing code doesn't reinstall dependencies.

Other good practices: \`.dockerignore\` (node_modules, .git, .env), run as a **non-root user**, a \`HEALTHCHECK\`, config through env vars, and tag images with the **git SHA** so you can roll back to an exact version.`,
    analogy: `An image is a recipe plus pre-measured ingredients; a container is the dish being cooked from it, and you can cook many at once. A multi-stage build is cooking in a full kitchen but delivering only the finished plate, not the pots, knives and peelings.`,
    quickRevision: [
      'Image = immutable template; container = running instance',
      'Multi-stage: build stage → copy artifacts → slim runtime stage',
      'Smaller, safer, faster to deploy',
      'Copy lockfile + `npm ci` before source for layer caching',
      'Non-root user, `.dockerignore`, healthcheck, SHA tags',
    ],
    followUps: [
      'A container keeps restarting. How do you debug it?',
      'Docker volumes vs bind mounts?',
      'What is in your docker-compose for local development?',
    ],
  },
  {
    id: 'cicd-pipeline-zero-downtime',
    question: 'Describe a CI/CD pipeline you would set up, including zero-downtime deploys and rollback.',
    category: 'backend',
    perspective: 'design',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['ci-cd', 'docker', 'aws'],
    answer: `**CI on every pull request** (GitHub Actions): install with a cached lockfile → lint → type-check → unit and integration tests (with a Postgres/Mongo service container) → build → dependency and secret scanning. Branch protection requires it to pass plus a review.

**CD on merge to main:**

1. Build the Docker image **once**, tag it with the **commit SHA**, push it to a registry (ECR/GHCR).
2. Deploy that **same image** to **staging** automatically → run migrations → smoke tests.
3. **Promote the same image** to production after manual approval (a GitHub environment). Never rebuild for production.

**Zero downtime:** rolling or blue-green deploys behind the load balancer, with **health checks**, so old containers are only removed once new ones are healthy. Graceful shutdown (stop accepting, finish in-flight requests). **Backward-compatible database migrations** (expand → migrate → contract) so old and new code can run at the same time.

**Rollback:** redeploy the previous SHA tag, which takes seconds because the image already exists. Migrations stay backward compatible, so rolling back code doesn't need a database rollback. Secrets come from OIDC-assumed roles or a secrets manager, never stored in the repo.`,
    analogy: `A restaurant changing its menu during service. You test new dishes in the kitchen (CI), serve them to a tasting table first (staging), then swap tables over one at a time while old dishes are still being served (rolling deploy). If guests complain, you bring back yesterday's menu, which is already printed (previous image tag).`,
    quickRevision: [
      'PR: lint → typecheck → test → build → scan',
      'Build once, tag by SHA, promote the same image',
      'Staging auto + smoke tests; prod with approval',
      'Rolling/blue-green + health checks + graceful shutdown',
      'Expand/contract migrations; rollback = redeploy previous SHA',
    ],
    followUps: [
      'How would you rename a database column without downtime?',
      'How do you handle secrets in GitHub Actions?',
      'What is the difference between continuous delivery and continuous deployment?',
    ],
    relatedCollected: ['backend/devops-questions/how-would-you-set-up-cicd-for-a-new-project'],
  },
  {
    id: 'observability-logging-monitoring',
    question: 'How do you monitor a production application and find the root cause of an issue?',
    category: 'backend',
    perspective: 'debugging',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['nodejs', 'aws', 'ci-cd', 'performance'],
    answer: `I rely on the three pillars plus alerts:

- **Logs**: **structured JSON** (pino) with a **request/correlation ID** carried through every service and job, log levels, and no secrets or PII. Centralised in CloudWatch, Loki or Datadog so I can search by request ID or user.
- **Metrics**: request rate, error rate, latency **p95/p99**, CPU and memory, DB pool usage, queue depth, plus business metrics (failed payments).
- **Traces**: OpenTelemetry/APM to see which span (DB query, external call) took the time.
- **Frontend errors**: Sentry or LogRocket with release versions and session replay.
- **Alerts** on symptoms users feel (error rate, latency, failed jobs) routed to Slack or on-call, not on every CPU blip.

**Root-cause process** during an incident: (1) **mitigate first**: roll back, toggle a feature flag, scale up; (2) correlate the start time with deploys, traffic or config changes; (3) follow one failing request through logs and traces; (4) reproduce and fix; (5) write a short **blameless postmortem** with an action item, such as a test, an alert or a limit, so it doesn't happen again.`,
    analogy: `Running a hospital ward. Logs are patient notes, metrics are the vital-sign monitors, traces are the record of every test a patient went through, and alerts are the alarm that goes off when a vital sign crosses a line. In an emergency you stabilise the patient first, then find the cause.`,
    quickRevision: [
      'Structured logs + correlation ID, no secrets/PII',
      'Metrics: rate, errors, p95/p99 latency, saturation',
      'Traces show which dependency is slow',
      'Alert on user-facing symptoms',
      'Incident: mitigate → correlate → trace → fix → postmortem',
    ],
    followUps: [
      'What is the difference between monitoring and observability?',
      'How do you propagate a request ID into background jobs?',
      'Tell me about a production incident you handled.',
    ],
  },
]);
