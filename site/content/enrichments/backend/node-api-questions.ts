import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('backend/node-api-questions.md', {
  // ---------------------------------------------------------------- 1. Node.js core
  'is-node-single-threaded': { sameAs: 'faq/node-single-thread-concurrency' },
  'how-do-you-handle-cpu-heavy-work': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `CPU-heavy work (image resizing, PDF generation, big parsing, hashing) **blocks the event loop**, so every other request waits. My options, depending on the case:

1. **Move it out of the request**: put a job on a **queue** (BullMQ, SQS), return \`202 Accepted\` with a job ID, and let a separate **worker process** do the work. The client polls or gets a notification. This is my default for anything slow.
2. **\`worker_threads\`** when it must happen in the same service, ideally with a worker pool (Piscina).
3. A **separate service** in a better-suited language, or a managed service (Lambda), when it's a big, independent workload.

Also: use async versions of crypto and zlib, and stream large data instead of buffering it.`,
    analogy: 'A restaurant doesn\'t let the waiter bake a wedding cake at the table: the order goes to the back kitchen (queue + worker), and the waiter keeps serving.',
    quickRevision: ['CPU work blocks the event loop', 'Default: queue + worker, return 202 + job ID', 'worker_threads (pool) for in-process work', 'Async crypto/zlib; stream big data'],
    followUps: ['How does the client learn the job finished?', 'worker_threads vs child_process vs cluster?', 'How would you retry failed jobs?'],
  },
  streams: {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Streams process data **in chunks** instead of loading it all into memory. Types: **Readable** (file read, HTTP request), **Writable** (file write, HTTP response), **Transform** (gzip, CSV parsing) and **Duplex** (sockets).

They matter for **large files, uploads, exports and proxies**: memory stays flat whether the file is 1MB or 5GB. The key concept is **backpressure**: if the writer is slower than the reader, the reader must pause. \`stream.pipeline()\` (or \`pipeline\` from \`stream/promises\`) wires streams together, **handles backpressure** and **propagates errors and cleanup**, which \`.pipe()\` alone doesn't.`,
    analogy: 'Drinking through a straw instead of trying to swallow the whole bottle at once; backpressure is pausing when your mouth is full.',
    quickRevision: ['Chunks, constant memory', 'Readable / Writable / Transform / Duplex', 'Backpressure = slow consumer pauses producer', 'Use `pipeline()` for errors + cleanup'],
    followUps: ['Stream a large CSV export from the database.', 'What happens if you ignore backpressure?'],
  },
  'commonjs-vs-es-modules': { sameAs: 'faq/js-esm-vs-commonjs' },
  'processnexttick-vs-setimmediate': { sameAs: 'javascript/coding-round-solutions/node-nexttick-vs-promise-vs-setimmediate' },
  'unhandled-rejections': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `An unhandled rejection is a promise that rejects with **no \`.catch\` or \`try/catch\`** anywhere. Since **Node 15** the default is to **crash the process**, because continuing in an unknown state is risky.

What I do:

- handle errors at the right level (a \`try/catch\` in async handlers, plus Express 5 or a wrapper to forward them to error middleware);
- add a **process-level** \`unhandledRejection\` and \`uncaughtException\` handler that **logs with context** (Sentry) and then **exits gracefully**;
- let the orchestrator (ECS, Kubernetes, PM2) **restart** the process.

Never swallow errors and keep running.`,
    analogy: 'An alarm nobody answers: Node now treats it as a fire and evacuates (crashes), so you\'d better have someone assigned to every alarm and a building manager who logs it and restarts safely.',
    quickRevision: ['Rejection with no handler', 'Node 15+: crashes by default', 'Handle locally; global handler logs then exits', 'Orchestrator restarts the process'],
    followUps: ['Why exit instead of continuing?', 'How do you avoid dropping in-flight requests when exiting?'],
  },
  'graceful-shutdown': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `When the platform stops a container it sends **\`SIGTERM\`**, waits for a grace period, then sends \`SIGKILL\`. Graceful shutdown means:

1. **Stop accepting new connections** (\`server.close()\`) and fail the readiness or health check, so the load balancer stops routing traffic.
2. **Finish in-flight requests** and jobs (with a timeout).
3. **Close resources**: database pools, Redis, queue workers, sockets.
4. **Exit** with code 0, or force-exit after the timeout.

This is what makes rolling deployments on ECS or Kubernetes **zero-downtime**: users don't see dropped requests.`,
    analogy: 'Closing a shop at the end of the day: lock the front door to new customers, serve the people already inside, cash up, then turn off the lights.',
    quickRevision: ['SIGTERM → grace period → SIGKILL', 'Stop accepting + fail health check', 'Finish in-flight work with a timeout', 'Close DB/Redis/queues, then exit'],
    followUps: ['How do you handle long-running WebSocket connections on shutdown?', 'What is a readiness probe?'],
  },
  clustering: {
    difficulty: 'medium',
    answer: `One Node process uses **one CPU core** for JavaScript. The \`cluster\` module (or **PM2 cluster mode**) forks **one worker per core** behind a shared port, so a VM can use all its cores and survive a worker crash.

In **containers**, the usual practice is **one process per container**, and you scale by running **more containers** (ECS tasks, Kubernetes pods) behind a load balancer. The orchestrator then handles restarts, health checks and autoscaling. Either way the app must be **stateless** (sessions in Redis, files in S3), and Socket.IO needs the Redis adapter.`,
    analogy: 'One chef can only cook at one stove; clustering opens a stove per chef in the same kitchen, while containers open more identical kitchens.',
    quickRevision: ['One Node process ≈ one core for JS', 'cluster / PM2: one worker per core', 'Containers: one process each, scale out', 'Must be stateless'],
    followUps: ['What breaks when you run two instances?', 'cluster vs worker_threads?'],
  },
  // ---------------------------------------------------------------- 2. Express
  'what-is-middleware': { sameAs: 'faq/express-middleware-error-handling' },
  'error-handling-middleware': { sameAs: 'faq/express-middleware-error-handling' },
  'ressend-vs-resjson-vs-resend': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `- **\`res.json(obj)\`**: serialises to JSON, sets \`Content-Type: application/json\` and ends the response. It's what I use for APIs.
- **\`res.send(body)\`**: sends a string, Buffer or object. It **infers the content type** (objects become JSON, strings become HTML) and ends the response.
- **\`res.end()\`**: low-level (from Node's \`http\`). It ends the response **without setting a body type**, which is useful for an empty 204 or after streaming.

Also: **\`req\`** is the incoming request (params, query, body, headers, user). Sending **twice** throws "headers already sent", so always \`return\` after responding.`,
    analogy: 'res.json is a labelled, sealed parcel; res.send is a parcel where the courier guesses the label; res.end just closes the door.',
    quickRevision: ['res.json: JSON + content type', 'res.send: infers type', 'res.end: ends without body handling (204, streams)', 'Return after responding (no double send)'],
    followUps: ['What causes "Cannot set headers after they are sent"?', 'How do you stream a file response?'],
  },
  'how-do-you-structure-an-express-app': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `In layers, so each has one job:

- **routes**: URL + method → middleware chain (auth, validation) → controller;
- **controllers**: HTTP only. Read the request, call a service, shape the response;
- **services**: **business logic** (create an invoice, check status transitions), framework-agnostic and easy to unit test;
- **repositories / models**: database access (Mongoose, Prisma).

Plus cross-cutting pieces:

- **validation** with Zod schemas;
- a **central error handler** with typed errors (\`NotFoundError\` → 404);
- **config** from validated env variables;
- **structured logging** with a request ID.

At Firmwide I group these **by domain** (enquiries, proposals, invoices), each with its own routes, controllers, services and schemas.`,
    analogy: 'A restaurant: the host (routes) seats you, the waiter (controller) takes the order, the kitchen (service) cooks by the recipe, and the pantry (repository) stores ingredients. Nobody does someone else\'s job.',
    quickRevision: ['routes → controllers → services → repositories', 'Controllers: HTTP only; services: business logic', 'Zod validation, central error handler, env config', 'Group by domain/module'],
    followUps: ['Where does authorisation logic live?', 'How do you test services without Express?', 'How would you add a new module?'],
  },
  validation: {
    difficulty: 'easy',
    frequency: 'high',
    answer: `**Never trust the client**, even my own frontend. I validate **body, params and query** at the edge with a **Zod** (or Joi) schema in a middleware: \`validate({ body: createInvoiceSchema })\`.

- On failure, return **400 or 422** with field-level errors the UI can show.
- Use \`.strict()\` or strip unknown fields to prevent **mass assignment** (\`role: "admin"\`).
- **Coerce** types for query strings, and set limits (string length, max page size, enum values).
- Reuse the inferred type (\`z.infer\`) in controllers and services, and share schemas with the frontend.

Business rules that need the database (unique email, valid state transition) belong in the **service**, not the schema.`,
    analogy: 'Airport security scanning every bag at the entrance: it\'s much safer than hoping each gate checks properly later.',
    quickRevision: ['Validate body, params, query at the edge', 'Zod/Joi middleware; 400/422 with field errors', 'Strip unknown fields (mass assignment)', 'DB-dependent rules live in services'],
    followUps: ['400 vs 422?', 'How do you validate env variables at startup?'],
  },
  'express-4-vs-5': {
    difficulty: 'medium',
    answer: `The big practical change in **Express 5** is **async error handling**: a rejected promise or a \`throw\` in an \`async\` handler is **forwarded to error middleware automatically**. In Express 4 you needed \`express-async-errors\` or a wrapper.

Other changes: removal of deprecated APIs (\`res.send(status, body)\`, \`req.param()\`), **new path-matching syntax** (path-to-regexp v8, so wildcards and optional params are written differently), \`req.query\` being read-only, and requiring Node 18+. We use **Express 5** at Firmwide, so handlers are plain async functions that throw typed errors.`,
    analogy: 'Express 5 added a safety net under async handlers: falling (throwing) now lands you in the error handler instead of on the floor (an unhandled rejection).',
    quickRevision: ['Express 5: async errors go to error middleware automatically', 'Deprecated APIs removed', 'New path syntax (path-to-regexp v8)', 'Node 18+'],
    followUps: ['What breaks when upgrading routes from 4 to 5?', 'How did you handle async errors in Express 4?'],
  },
  'why-fastify': {
    difficulty: 'medium',
    answer: `Fastify is a Node framework focused on **performance and structure**:

- **JSON Schema-based validation and serialisation**: validation is compiled, and responses serialise faster, while the schema also documents the API;
- a **plugin system** with encapsulation;
- **hooks** for the request lifecycle;
- good TypeScript support and built-in logging (pino).

I used it in my **AI SQL Assistant** project. Express is still fine and has the biggest ecosystem. I'd pick Fastify for new, high-throughput APIs, and NestJS when a team wants an opinionated structure.`,
    analogy: 'Express is a flexible workshop where you bring your own tools; Fastify is a workshop with fitted, labelled tools that make common jobs faster and more consistent.',
    quickRevision: ['Schema-based validation + fast serialisation', 'Encapsulated plugins, lifecycle hooks', 'pino logging built in', 'Used in AI SQL Assistant; Express still fine'],
    followUps: ['Express vs Fastify vs NestJS?', 'How do Fastify plugins share state?'],
  },
  // ---------------------------------------------------------------- 3. REST API design
  'rest-principles': { sameAs: 'faq/rest-api-design-practices' },
  'put-vs-patch': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `- **PUT** **replaces** the whole resource with the representation you send. Missing fields are cleared or defaulted. It's **idempotent**: sending the same PUT twice gives the same result.
- **PATCH** applies a **partial update**: only the fields you send change. It *can* be idempotent (\`{ "status": "paid" }\`) but isn't guaranteed to be (\`{ "op": "increment" }\`).

In practice most APIs I build use **PATCH** for edits (with a Zod schema of optional fields) and **POST** for actions with side effects.`,
    analogy: 'PUT is replacing the whole form with a new copy; PATCH is using correction fluid on just the fields that changed.',
    quickRevision: ['PUT: full replacement, idempotent', 'PATCH: partial update', 'Missing fields: PUT clears, PATCH keeps', 'Validate PATCH with optional-field schema'],
    followUps: ['Is PATCH idempotent?', 'What is JSON Patch vs JSON Merge Patch?'],
  },
  idempotency: { sameAs: 'faq/api-idempotency-double-submit' },
  'status-codes-to-know': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `The ones I use and can explain:

- **2xx**: **200** OK, **201** Created (+ \`Location\`), **202** Accepted (async job), **204** No Content.
- **3xx**: **301/302** redirects, **304** Not Modified (cache).
- **4xx** (client's fault):
  - **400** malformed request;
  - **401** not authenticated ("who are you?") vs **403** authenticated but not allowed;
  - **404** not found;
  - **409** conflict (duplicate, version clash);
  - **422** validation failed;
  - **429** too many requests.
- **5xx** (server's fault): **500** unexpected error, **502** bad gateway (the upstream failed), **503** unavailable (overloaded or maintenance), **504** gateway timeout.

Correct codes matter because clients, caches, monitoring and retries all behave differently based on them.`,
    analogy: 'Status codes are the post office stamps: delivered (2xx), forwarded (3xx), your address was wrong (4xx), our van broke down (5xx).',
    quickRevision: ['201 + Location, 202 for async, 204 empty', '401 = who are you? 403 = not allowed', '409 conflict, 422 validation, 429 rate limit', '502/503/504 = upstream / overloaded / timeout'],
    followUps: ['Should a missing resource you\'re not allowed to see return 403 or 404?', 'Which errors are safe to retry?'],
  },
  pagination: {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Offset/limit** (\`?page=3&limit=20\` → \`OFFSET 40\`): simple and supports "jump to page 7", but the database still **scans and skips** all earlier rows, so it gets slow at large offsets. It's also **unstable**: inserts and deletes shift items between pages (duplicates or gaps).
- **Cursor / keyset** (\`?after=<lastId or lastCreatedAt+id>\`): \`WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20\`. It's **fast at any depth** (it uses the index) and **stable**. The trade-off: no random page jumps.

I use offset for small admin tables, and cursors for feeds, infinite scroll and large or fast-changing data. Always cap \`limit\` and return a \`nextCursor\`.`,
    analogy: 'Offset is reading a book by counting pages from the start every time; a cursor is a bookmark: you open straight to where you left off, even if pages were added earlier.',
    quickRevision: ['Offset: simple, page jumps, slow + unstable deep', 'Cursor: fast, stable, no random jumps', 'Cursor needs a unique ordering (created_at, id)', 'Cap limit; return nextCursor'],
    followUps: ['How do you build a cursor from a non-unique sort column?', 'Which index supports keyset pagination?'],
  },
  'api-versioning': {
    difficulty: 'medium',
    answer: `First, I try **not to need new versions**: evolve the API with **backward-compatible changes**, like adding optional fields or new endpoints, and never removing or renaming fields without notice.

When a breaking change is unavoidable, the options are:

- **URL versioning** (\`/api/v1/...\`): explicit, easy to route and cache. This is the most common, and what I use.
- **Header versioning** (\`Accept: application/vnd.app.v2+json\`): cleaner URLs, harder to test.

Then run v1 and v2 side by side, **announce a deprecation timeline** (\`Deprecation\`/\`Sunset\` headers), monitor v1 usage, and remove it only when traffic is gone.`,
    analogy: 'Renovating a shop while it\'s open: add new aisles without moving existing ones, and if you must rebuild, open the new wing first and only close the old one when customers have moved over.',
    quickRevision: ['Prefer backward-compatible evolution', 'URL versioning (/v1) is most common', 'Header versioning is the alternative', 'Run both, deprecate with notice, monitor usage'],
    followUps: ['What counts as a breaking change?', 'How do you version a mobile app API with old clients?'],
  },
  'rate-limiting': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Rate limiting protects the API from abuse (brute-force login, scraping) and protects shared resources. Algorithms:

- **Fixed window**: count per minute. Simple, but allows bursts at window edges.
- **Sliding window**: smoother.
- **Token bucket**: tokens refill at a steady rate, which **allows short bursts** with a fixed long-term rate. My usual choice.

With **multiple instances**, the counters must be **shared**, so they live in **Redis** (atomic \`INCR\` + \`EXPIRE\`, or a Lua script). I key limits by user ID or API key (IP for anonymous traffic), apply **stricter limits on login and OTP** endpoints, and return **429** with \`Retry-After\` and rate-limit headers. An edge layer (Nginx, API Gateway, Cloudflare) can block floods before they reach Node.`,
    analogy: 'A token bucket is a ticket dispenser that refills one ticket per second: you can grab a few at once if they\'ve piled up, but you can\'t take more than the refill rate over time.',
    quickRevision: ['Fixed / sliding window / token bucket', 'Token bucket allows bursts', 'Shared counters in Redis across instances', 'Key by user/API key/IP; stricter on auth', '429 + Retry-After'],
    followUps: ['Implement a fixed-window limiter with Redis.', 'How would you rate-limit per tenant plan?'],
  },
  'rest-vs-graphql': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `**REST**: multiple resource endpoints with HTTP semantics. It's simple, **HTTP caching** works naturally, status codes are meaningful, and the tooling is easy.

**GraphQL**: **one endpoint** and a typed schema, and the **client asks for exactly the fields it needs**. That avoids over- and under-fetching, and it's great when many different clients (web, mobile) need different shapes. The costs: **caching is harder** (POST, a single URL), **N+1 queries** in resolvers (you need DataLoader), query cost limits for security, and more setup.

I default to **REST** for most business APIs. I'd pick GraphQL when frontends compose data from many sources and change fast.`,
    analogy: 'REST is a set menu from different counters; GraphQL is a buffet where you fill your plate with exactly what you want, but the kitchen must work harder to keep it organised.',
    quickRevision: ['REST: simple, HTTP caching, status codes', 'GraphQL: one endpoint, client picks fields', 'GraphQL costs: caching, N+1, query limits', 'REST by default; GraphQL for many varied clients'],
    followUps: ['How does DataLoader solve N+1?', 'How do you secure GraphQL from expensive queries?'],
  },
  'webhooks-how-to-handle-safely': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Webhooks are **untrusted, at-least-once** HTTP calls from another system (Stripe, SSLCommerz, GitHub). Handling them safely:

1. **Verify the signature** (HMAC with the shared secret, over the **raw body**) and the timestamp, to stop forged or replayed calls.
2. **Respond 2xx fast**: store the event and push it to a **queue**, then process it asynchronously. Otherwise the provider times out and retries.
3. **Deduplicate** by event ID with a unique constraint, because the same event can arrive **more than once**.
4. Make processing **idempotent** and **order-tolerant** (events can arrive out of order), and fetch the latest state from the provider when in doubt.
5. **Log and alert** on failures, and keep a way to replay events.`,
    analogy: 'A courier who might deliver the same parcel twice and could be an impostor: check their ID (signature), sign for it quickly (2xx), log the tracking number (dedupe), and unpack it later.',
    quickRevision: ['Verify signature on the raw body + timestamp', 'Ack fast (2xx), process via queue', 'Dedupe by event ID', 'Idempotent + order-tolerant processing', 'Log, alert, allow replay'],
    followUps: ['Why must you verify against the raw body?', 'How do you handle events arriving out of order?'],
  },
  // ---------------------------------------------------------------- 4. Auth & security
  'session-vs-jwt': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `- **Server sessions**: the server stores the session (in Redis or the DB) and the client holds an opaque **session ID cookie**. **Easy to revoke** (delete the session) and nothing sensitive is on the client, but every request needs a session lookup and shared storage across instances.
- **JWT**: a **signed, self-contained token** with claims. It's verified **without a lookup** (stateless), which suits multiple services and mobile clients. But it's **hard to revoke** before expiry and is bigger to send.

So with JWTs I keep **access tokens short-lived** and add **refresh tokens** stored server-side (hashed), which can be revoked. For a single web app, sessions are often the simpler and safer choice.`,
    analogy: 'A session is a cloakroom ticket: the cloakroom keeps your coat and can cancel the ticket anytime. A JWT is a signed wristband: anyone can check it instantly, but it\'s valid until it expires even if you\'d like to cancel it.',
    quickRevision: ['Session: server state, easy revoke, needs lookup', 'JWT: stateless, signed, hard to revoke', 'JWT → short access + revocable refresh', 'Single web app: sessions are simpler'],
    followUps: ['How do you log out a user everywhere with JWTs?', 'Where should the token live in the browser?'],
  },
  'access--refresh-token-flow': { sameAs: 'faq/auth-jwt-access-refresh' },
  'where-do-you-store-passwords': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `I never store passwords, only **slow, salted hashes**: **bcrypt** (with a cost factor around 10–12) or **argon2id**. A **unique salt** per password defeats rainbow tables, and the **slowness** makes brute force expensive. A **pepper** (a server-side secret added before hashing, stored outside the DB) adds protection if the database leaks. At Firmwide we hash with a pepper.

Never use encryption (it's reversible) or fast hashes like MD5 or SHA-256 for passwords. Around it: rate-limit login, lock out or back off on repeated failures, and use secure password reset with short-lived single-use tokens.`,
    analogy: 'Instead of keeping everyone\'s house key, you keep a unique fingerprint of each key that takes ages to fake; even if the fingerprints are stolen, copying the keys is impractically slow.',
    quickRevision: ['bcrypt / argon2id, never plain or encrypted', 'Unique salt per password', 'Slow on purpose (cost factor)', 'Pepper stored outside the DB', 'Rate-limit login; safe reset tokens'],
    followUps: ['Why not SHA-256?', 'Salt vs pepper?', 'How do you upgrade old hashes?'],
  },
  'oauth-20-vs-oidc': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **OAuth 2.0** is about **authorisation**: an app gets an **access token** to call an API **on behalf of a user** ("let this app read my calendar").
- **OpenID Connect (OIDC)** is a layer on top that adds **authentication**: an **ID token** (a JWT) that says **who the user is** (\`sub\`, email, name), plus standard discovery and user-info endpoints.

For "Sign in with Microsoft" at Firmwide we use **MSAL** with the **Authorization Code flow + PKCE**:

1. The user signs in with Microsoft.
2. The app receives an authorization code and exchanges it for tokens.
3. The **ID token** identifies the user. Our backend checks that this Microsoft user is allowed in, then issues **our own** session or JWT with roles.
4. **Access tokens** call Microsoft Graph.`,
    analogy: 'OAuth is a valet key: it lets someone drive your car without knowing who you are. OIDC adds an ID card, so the hotel also knows exactly who handed over the key.',
    quickRevision: ['OAuth 2.0 = authorisation (access token)', 'OIDC = authentication (ID token)', 'Auth Code + PKCE for SPAs/mobile', 'Backend maps the identity → own session/roles'],
    followUps: ['Why PKCE?', 'Access token vs ID token: which do you send to your API?', 'How do you validate an ID token?'],
  },
  'rbac-implementation': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `**Role-based access control**: users have **roles**, and roles grant **permissions** (\`invoice:create\`, \`user:approve\`). Code checks **permissions, not role names**, so adding a role doesn't mean changing code.

Implementation:

- authenticate, then load the user's roles and permissions (cached, or in the token claims);
- middleware like \`authorize('invoice:create')\` returns **403** if the permission is missing;
- **resource-level checks** in the service as well, since roles aren't enough: can this user access *this* invoice (ownership or tenant)?
- the UI hides actions for UX, but **the API enforces**.

At Firmwide the roles are super_admin, admin, director and user, with middleware such as **requiring admin for writes** on sensitive modules.`,
    analogy: 'Keycards in an office: your card (role) opens certain doors (permissions), and some rooms also check that the specific file cabinet is yours (resource-level checks).',
    quickRevision: ['Users → roles → permissions', 'Check permissions, not role names', 'Middleware + resource-level (ownership) checks', 'UI hides, API enforces'],
    followUps: ['RBAC vs ABAC?', 'How do you handle permission changes for logged-in users?'],
  },
  'owasp-top-risks': { sameAs: 'faq/api-security-basics' },
  cors: { sameAs: 'frontend/react-interview-questions/what-is-cors' },
  secrets: {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Never commit secrets** to git. Keep a \`.env.example\`, add \`.env\` to \`.gitignore\`, and run **secret scanning** (GitHub, gitleaks) so mistakes are caught.
- At runtime, load them from **environment variables** injected by the platform, or better, a **secrets manager** (AWS Secrets Manager, SSM Parameter Store), with access limited by IAM.
- In **CI/CD**, use **OIDC** to assume a cloud role instead of storing long-lived access keys. That's how my SmartJobHub pipeline deploys to AWS.
- **Rotate** secrets, give each service only what it needs, and keep secrets out of logs, error messages and AI prompts.
- If a secret leaks: **rotate immediately** first, then clean the history.`,
    analogy: 'House keys: you don\'t tape them to the front door (git), you keep them in a lockbox only the right people can open (secrets manager), and if one goes missing you change the locks first.',
    quickRevision: ['Never in git; secret scanning', 'Env vars / secrets manager with IAM', 'OIDC in CI instead of static keys', 'Rotate; least privilege; no secrets in logs', 'Leaked → rotate first'],
    followUps: ['A secret was pushed to a public repo. What do you do?', 'Secrets Manager vs Parameter Store?'],
  },
  'security-headers': {
    difficulty: 'easy',
    answer: `I add them with **\`helmet\`** in Express, or at the Nginx or CDN layer:

- **Content-Security-Policy**: which scripts, styles and images may load. The strongest XSS mitigation.
- **Strict-Transport-Security** (HSTS): force HTTPS.
- **X-Frame-Options / \`frame-ancestors\`**: stop clickjacking.
- **X-Content-Type-Options: nosniff**: stop MIME sniffing.
- **Referrer-Policy**, **Permissions-Policy**.

Also remove \`X-Powered-By\`, and set cookies with \`HttpOnly\`, \`Secure\` and \`SameSite\`.`,
    analogy: 'Security headers are the house rules taped to the front door that the browser (the guest) promises to follow: only these visitors allowed, no peeking through windows, always use the secure entrance.',
    quickRevision: ['helmet (or Nginx/CDN)', 'CSP vs XSS; HSTS for HTTPS', 'frame-ancestors vs clickjacking; nosniff', 'Secure cookie flags; hide X-Powered-By'],
    followUps: ['How do you roll out a strict CSP without breaking the site?', 'What is clickjacking?'],
  },
  // ---------------------------------------------------------------- 5. MongoDB & Mongoose
  'embed-vs-reference': { sameAs: 'faq/db-mongo-embed-vs-reference' },
  indexes: { sameAs: 'faq/db-indexes-composite' },
  'aggregation-pipeline': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `The aggregation pipeline processes documents through **stages**, each transforming the stream:

- \`$match\` filters, and should go **early** so it can use indexes and shrink the data;
- \`$group\` aggregates (totals, counts per status or month);
- \`$lookup\` joins another collection;
- \`$unwind\` flattens arrays;
- \`$project\` / \`$addFields\` shape fields;
- \`$sort\`, \`$limit\` and \`$facet\` (several aggregations in one query, e.g. results plus counts).

I've used it for **dashboards and analytics**: totals per currency and month, invoice status counts, top clients. Performance tips: \`$match\` and \`$sort\` early on indexed fields, \`$project\` to reduce document size, check \`explain()\`, and watch the 100MB stage memory limit (\`allowDiskUse\`).`,
    analogy: 'A factory conveyor belt: items are filtered at the first station, grouped at the next, labelled, then boxed, and the earlier you remove rejects, the less work later stations do.',
    quickRevision: ['Stages transform a document stream', '$match early (indexes, less data)', '$group, $lookup, $unwind, $project, $facet', 'Check explain(); memory limit / allowDiskUse'],
    followUps: ['Write a pipeline for revenue per month.', '$lookup vs populate?', 'When would you precompute instead of aggregating live?'],
  },
  'transactions-in-mongodb': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `MongoDB supports **multi-document ACID transactions** (on replica sets and sharded clusters) through a **session**: start the session, do the writes inside \`withTransaction()\`, and it commits or aborts as one unit, retrying on transient errors.

I use them when **several documents must change together**, such as money movement or "create invoice + update proposal status". But **single-document writes are already atomic**, so I first try to **design for single-document updates** (embedding, atomic operators like \`$inc\` with conditions). Transactions add latency and lock contention, so I keep them **short**.`,
    analogy: 'A transaction is a moving-house checklist where either every box arrives at the new place or the whole move is called off; but if everything fits in one box (one document), you don\'t need the checklist.',
    quickRevision: ['Multi-doc ACID via sessions (replica set)', 'Single-document writes already atomic', 'Prefer single-doc design + atomic operators', 'Keep transactions short; retry transient errors'],
    followUps: ['Why do transactions need a replica set?', 'How would you transfer money between two wallets in Mongo?'],
  },
  'mongoose-lean': {
    difficulty: 'easy',
    frequency: 'medium',
    answer: `By default, Mongoose turns every result into a full **Mongoose document**, with change tracking, getters and setters, virtuals and methods like \`.save()\`. That's memory and CPU overhead.

\`.lean()\` returns **plain JavaScript objects**, which are much faster and lighter, ideal for **read-only** endpoints and lists. The trade-off: no \`.save()\`, no virtuals, getters or defaults (unless you use lean plugins), and \`_id\` stays an ObjectId. I use \`lean()\` for most GET endpoints, together with \`select()\` to project only the needed fields.`,
    analogy: 'Ordering a coffee to take away instead of a full table service: you just get the coffee (plain object), without the waiter, cutlery and refills (document features).',
    quickRevision: ['Plain objects instead of documents', 'Faster + less memory for reads', 'No save(), virtuals, getters', 'Combine with select() projections'],
    followUps: ['When shouldn\'t you use lean()?', 'How do you get virtuals with lean?'],
  },
  'n1-with-populate': { sameAs: 'faq/db-n-plus-one' },
  'money-storage': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Never store money as a JavaScript **float**: \`0.1 + 0.2 !== 0.3\`, and rounding errors add up in totals and taxes. Options:

- **Integer minor units**: cents as integers (\`1999\` = 19.99 USD), with the **currency code** stored next to them. Simple and exact.
- **Decimal types**: \`Decimal128\` in MongoDB, \`NUMERIC(12,2)\` in Postgres, plus a decimal library in code.

For **multi-currency** invoicing (like at Firmwide) I store the **original currency and amount**, plus the **converted amount and the exchange rate used at that time**, so historical invoices don't change when rates do. Rounding happens at defined points, with consistent rules.`,
    analogy: 'Counting coins instead of pouring liquid: whole cents can\'t spill or evaporate the way floating-point fractions do.',
    quickRevision: ['No floats for money', 'Integer minor units + currency code', 'Or Decimal128 / NUMERIC', 'Store original currency, converted amount and rate used'],
    followUps: ['How do you handle currencies with 0 or 3 decimal places?', 'Where should rounding happen?'],
  },
  'mongodb-vs-postgresql-when': { sameAs: 'faq/db-sql-vs-nosql-choice' },
  // ---------------------------------------------------------------- 6. Redis, queues & real-time
  'what-do-you-use-redis-for': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Redis is an in-memory data store, very fast, with useful data structures. I use it for:

- **caching** hot, expensive reads (cache-aside with TTL);
- **sessions** and refresh-token or OTP storage with expiry;
- **rate limiting** with atomic counters;
- **queues**: **BullMQ** for emails, PDFs and background jobs;
- **pub/sub** and the **Socket.IO Redis adapter** for real-time across instances;
- **distributed locks** for short critical sections.

It's in-memory, so I treat it as a **cache or coordination layer**, not the source of truth for important data, unless persistence is configured deliberately.`,
    analogy: 'Redis is the whiteboard next to the filing cabinet: super fast to read and update, perfect for notes and coordination, but you don\'t keep the only copy of the contract on it.',
    quickRevision: ['Cache, sessions, OTPs (TTL)', 'Rate limiting counters', 'BullMQ queues', 'Pub/sub + Socket.IO adapter', 'Locks; not the source of truth'],
    followUps: ['What happens to your app if Redis goes down?', 'Redis persistence: RDB vs AOF?'],
  },
  'caching-strategies': { sameAs: 'faq/db-redis-caching-strategy' },
  'cache-stampede': {
    difficulty: 'hard',
    frequency: 'medium',
    answer: `A cache stampede (thundering herd) happens when a **popular key expires** and **many requests miss at the same moment**, so they all hit the database to rebuild the same value, which can overload it.

Fixes:

- **Single-flight / lock**: the first request takes a short Redis lock (\`SET key NX PX\`) and rebuilds, while others wait briefly or serve the stale value.
- **Stale-while-revalidate / early refresh**: refresh before expiry (probabilistic early expiration) and keep serving the old value meanwhile.
- **Jittered TTLs**, so many keys don't expire together.
- **Pre-warming** important keys after deploys.`,
    analogy: 'When the café\'s only tray of muffins runs out, you don\'t want 50 staff all baking at once; one baker bakes while the others keep selling yesterday\'s batch for a few minutes.',
    quickRevision: ['Hot key expires → many misses → DB overload', 'Lock / single-flight rebuild', 'Stale-while-revalidate, early refresh', 'Jittered TTLs; pre-warm'],
    followUps: ['Implement single-flight with Redis.', 'Cache penetration vs stampede?'],
  },
  'why-a-job-queue-bullmq': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `I move work **out of the request/response cycle** when it's **slow, unreliable or bursty**: sending emails, generating PDFs, calling flaky third-party APIs, processing uploads, webhooks. The API **enqueues a job and responds quickly**, and **workers** process jobs separately.

BullMQ (on Redis) gives:

- **retries with backoff**;
- **delayed and scheduled** jobs;
- **concurrency control** and **rate limiting** per queue;
- priorities;
- **failed-job tracking** (dead-letter style);
- progress events.

Workers **scale independently** of the API. At Firmwide, batch proposal uploads run in the background with a pollable batch ID, instead of keeping the request open.`,
    analogy: 'A ticket system at a repair shop: you drop off the item and get a ticket (job ID) immediately, the technicians work through the queue at their own pace, and they retry if a part is missing.',
    quickRevision: ['Slow/unreliable work → queue', 'Respond fast; workers process', 'Retries + backoff, delays, concurrency, priorities', 'Failed jobs tracked; scale workers separately'],
    followUps: ['How do you make jobs idempotent?', 'How does the client learn a job finished?', 'BullMQ vs SQS?'],
  },
  'websocket-vs-polling-vs-sse': { sameAs: 'faq/realtime-websocket-sse-scaling' },
  'scaling-socketio-to-many-servers': { sameAs: 'faq/realtime-websocket-sse-scaling' },
  'socket-auth': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Authenticate **during the handshake**, not after connecting:

1. The client sends the access token in \`auth\` (\`io(url, { auth: { token } })\`) or relies on an httpOnly cookie.
2. A Socket.IO **middleware** (\`io.use\`) verifies the JWT, rejects invalid tokens with an error, and attaches \`socket.data.user\`.
3. On connection, **join rooms** like \`user:{id}\` and \`org:{id}\`, so the server can target notifications with \`io.to('user:42').emit(...)\`.
4. Handle **token expiry**: disconnect or ask the client to reconnect with a fresh token.
5. **Authorise each event**: being connected doesn't mean being allowed to join any room or emit anything.

That's how notifications are scoped at Firmwide.`,
    analogy: 'Checking tickets at the venue entrance (handshake) instead of letting everyone in and checking later, then seating each guest in their own section (rooms).',
    quickRevision: ['Verify the token in handshake middleware', 'Attach user to socket.data', 'Join user:{id} / org:{id} rooms', 'Handle expiry; authorise each event'],
    followUps: ['What happens when the access token expires mid-connection?', 'How do you prevent a user joining another org\'s room?'],
  },
  // ---------------------------------------------------------------- 7. Testing & observability
  'how-do-you-test-an-api': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `In layers:

- **Unit tests** for services and business rules (status transitions, totals, permissions), with dependencies injected or mocked.
- **Integration tests** with **Supertest** against the real Express app and a **real test database** (a Docker container or in-memory Mongo), seeded per test. These catch the most bugs: validation, auth, queries, status codes.
- **Contract checks**: responses match the OpenAPI or Zod schemas.
- A few **E2E or smoke tests** after deploys.

Key cases: happy path, validation errors, **auth and authorisation failures**, edge cases (duplicates, concurrency), and error handling. They run in **CI** on every PR. My SmartJobHub API has **15 test suites**, including a test that starts **two servers on one Redis** to prove Socket.IO messages cross instances.`,
    analogy: 'Testing a car: check each part on the bench (unit), then drive the assembled car around a test track with real fuel (integration with a real DB).',
    quickRevision: ['Unit: services/business rules', 'Integration: Supertest + real test DB', 'Test auth/authz failures, validation, edge cases', 'Contract checks; run in CI', 'SmartJobHub: 15 suites incl. multi-instance socket test'],
    followUps: ['How do you isolate tests that share a database?', 'Mock the DB or use a real one?'],
  },
  'mocking-external-apis': {
    difficulty: 'medium',
    answer: `I mock at the **HTTP boundary**, so my real client code still runs:

- **nock** or **MSW** (Node) intercept outgoing requests and return fixtures, including **errors, timeouts and slow responses**, so retries and fallbacks get tested.
- Or **inject the client** (dependency injection) and pass a fake in unit tests.

I keep fixtures realistic (recorded from the real API, with secrets removed), and add a small number of **contract or sandbox tests** against the real provider (Stripe test mode, for example) so mocks don't drift from reality.`,
    analogy: 'A flight simulator: pilots practise engine failures and storms safely, but still do occasional real flights to make sure the simulator matches the plane.',
    quickRevision: ['Mock at the HTTP boundary (nock / MSW)', 'Or inject a fake client', 'Test failures: errors, timeouts, slow responses', 'Occasional sandbox/contract tests vs real API'],
    followUps: ['How do you test retry with backoff without waiting?', 'What is contract testing?'],
  },
  logging: {
    difficulty: 'easy',
    frequency: 'high',
    answer: `I use **structured JSON logs** (pino), not free-text \`console.log\`, so logs are searchable and filterable. Every log line carries a **request or correlation ID** (generated in middleware and passed to downstream calls and jobs), plus context like user ID, route and duration.

- Use **log levels** (debug in dev, info and above in prod) and **log at boundaries**: request in and out, external calls, errors with stack traces.
- **Never log** passwords, tokens, card data or personal data. Redact them.
- Ship logs to a central place (CloudWatch, Loki, Datadog), with retention limits.`,
    analogy: 'A flight recorder: every event is written in the same machine-readable format with the flight number (request ID), so investigators can replay exactly what happened, without recording passengers\' private conversations.',
    quickRevision: ['Structured JSON (pino)', 'Request/correlation ID on every line', 'Levels; log at boundaries + errors', 'Redact secrets/PII', 'Centralised with retention'],
    followUps: ['How do you trace one request across services?', 'Logs vs metrics vs traces?'],
  },
  monitoring: { sameAs: 'faq/observability-logging-monitoring' },
  // ---------------------------------------------------------------- 8. Scenarios
  'the-api-is-slow-how-do-you-debug-it': { sameAs: 'faq/api-slow-in-production' },
  'prevent-double-payment--double-submit': { sameAs: 'faq/api-idempotency-double-submit' },
  'two-users-book-the-same-slot--buy-the-last-item': { sameAs: 'faq/db-transactions-isolation-race' },
  'upload-a-1gb-file': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `I wouldn't stream 1GB through my Node API: it ties up connections, memory and bandwidth. Instead:

1. The client asks the API for a **presigned S3 URL** (or a **multipart upload**: create the upload, then presigned URLs per part). The API checks auth, file type and size limits first.
2. The client **uploads directly to S3** in parallel parts, with **resume and retry** per part and a progress bar.
3. On completion (client callback or an **S3 event**), the API **records metadata** and queues processing: virus scan, thumbnails, parsing.
4. Lifecycle rules clean up incomplete multipart uploads.

If it really must go through the server, **stream** it to S3 with backpressure and never buffer it in memory.`,
    analogy: 'Instead of carrying a sofa through your office lobby, you give the delivery company a one-time pass to the loading dock (presigned URL), and they deliver it straight to the warehouse.',
    quickRevision: ['Presigned URL / multipart upload', 'Client uploads directly to S3 (parallel, resumable)', 'API validates first, records metadata after', 'Async processing via queue/S3 event'],
    followUps: ['How do you secure presigned URLs?', 'How do you show upload progress?', 'How do you scan uploads for viruses?'],
  },
  'send-100k-emails': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `Never in a request loop. I'd:

1. Create a **campaign record**, then **enqueue jobs in batches** (e.g. 500 recipients per job) in BullMQ or SQS.
2. **Workers** send through an email provider (SES, SendGrid) with **concurrency and rate limits** matching the provider's quota.
3. **Retries with backoff** for temporary failures; permanent failures (bounces) are recorded, not retried.
4. **Track status per recipient** (queued, sent, failed, bounced) and make jobs **idempotent**, so a retry doesn't email someone twice.
5. Respect **unsubscribes**, and process provider **webhooks** for bounces and complaints. Show progress on a dashboard.`,
    analogy: 'A post room mailing a big campaign: letters go out in labelled sacks (batches) at the pace the post office accepts (rate limit), and every returned letter is logged, not resent blindly.',
    quickRevision: ['Queue in batches, never in a request', 'Workers + provider rate limits', 'Retry temporary, record permanent failures', 'Per-recipient status, idempotent jobs', 'Unsubscribes + bounce webhooks'],
    followUps: ['How do you avoid sending duplicates after a worker crash?', 'How would you schedule sending by timezone?'],
  },
  'a-third-party-api-is-down': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Design for failure:

1. **Timeouts** on every external call, so a dead API doesn't hang my requests.
2. **Retries with exponential backoff + jitter**, only for retryable errors and idempotent operations.
3. A **circuit breaker**: after repeated failures, stop calling for a while and **fail fast**, then probe again.
4. A **fallback**: cached or last-known data, a degraded feature ("rates updated an hour ago"), or **queue the work** to retry later.
5. **Alerting and visibility**: monitor its error rate, show users a clear message, and check the provider's status page.

At SmartCrowd we integrated 5+ financial APIs, so this kind of isolation was essential.`,
    analogy: 'If your usual supplier is closed, a good shop doesn\'t keep calling every second: it stops ordering for a bit (circuit breaker), sells from stock (cache), takes back-orders (queue) and tells customers honestly.',
    quickRevision: ['Timeouts always', 'Retry with backoff + jitter (retryable only)', 'Circuit breaker → fail fast', 'Fallback: cache / degrade / queue', 'Alert + clear user message'],
    followUps: ['How does a circuit breaker decide to close again?', 'Would you retry a payment call?'],
  },
});
