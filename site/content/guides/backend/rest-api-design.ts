import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'REST API Design',
  description: 'Resources, status codes, pagination, versioning, idempotency and rate limiting.',
  questions: [
    {
      id: 'rest-api-design-practices',
      question: 'What makes a well-designed REST API?',
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
      id: 'put-vs-patch',
      question: 'What is the difference between PUT and PATCH?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['api-design'],
      answer: `- **PUT** **replaces** the whole resource with the representation you send. Missing fields are cleared or defaulted. It's **idempotent**: sending the same PUT twice gives the same result.
- **PATCH** applies a **partial update**: only the fields you send change. It *can* be idempotent (\`{ "status": "paid" }\`) but isn't guaranteed to be (\`{ "op": "increment" }\`).

In practice most APIs I build use **PATCH** for edits (with a Zod schema of optional fields) and **POST** for actions with side effects.`,
      variants: [
        { label: 'Short version', answer: 'PUT replaces the whole resource and is idempotent. PATCH is a partial update.' },
      ],
      analogy: `PUT is replacing the whole form with a new copy; PATCH is using correction fluid on just the fields that changed.`,
      quickRevision: [
        'PUT: full replacement, idempotent',
        'PATCH: partial update',
        'Missing fields: PUT clears, PATCH keeps',
        'Validate PATCH with optional-field schema',
      ],
      followUps: [
        'Is PATCH idempotent?',
        'What is JSON Patch vs JSON Merge Patch?',
      ],
    },
    {
      id: 'api-idempotency-double-submit',
      question: 'How do you prevent duplicate orders or double payments when a request is retried?',
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
    },
    {
      id: 'status-codes-to-know',
      question: 'Which HTTP status codes should an API use, and when?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['api-design'],
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
      variants: [
        { label: 'Short version', answer: `200, 201, 204, 301/302, 304, 400, 401 (unauthenticated) vs 403 (forbidden), 404, 409 conflict, 422, 429, 500, 502, 503.` },
      ],
      analogy: `Status codes are the post office stamps: delivered (2xx), forwarded (3xx), your address was wrong (4xx), our van broke down (5xx).`,
      quickRevision: [
        '201 + Location, 202 for async, 204 empty',
        '401 = who are you? 403 = not allowed',
        '409 conflict, 422 validation, 429 rate limit',
        '502/503/504 = upstream / overloaded / timeout',
      ],
      followUps: [
        'Should a missing resource you\'re not allowed to see return 403 or 404?',
        'Which errors are safe to retry?',
      ],
    },
    {
      id: 'pagination',
      question: 'How do you paginate an API: offset or cursor?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['api-design'],
      answer: `- **Offset/limit** (\`?page=3&limit=20\` → \`OFFSET 40\`): simple and supports "jump to page 7", but the database still **scans and skips** all earlier rows, so it gets slow at large offsets. It's also **unstable**: inserts and deletes shift items between pages (duplicates or gaps).
- **Cursor / keyset** (\`?after=<lastId or lastCreatedAt+id>\`): \`WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20\`. It's **fast at any depth** (it uses the index) and **stable**. The trade-off: no random page jumps.

I use offset for small admin tables, and cursors for feeds, infinite scroll and large or fast-changing data. Always cap \`limit\` and return a \`nextCursor\`.`,
      variants: [
        { label: 'Short version', answer: `Offset/limit is simple but slow at large offsets and unstable. Cursor-based (\`?after=id\`) is stable and fast.` },
      ],
      analogy: `Offset is reading a book by counting pages from the start every time; a cursor is a bookmark: you open straight to where you left off, even if pages were added earlier.`,
      quickRevision: [
        'Offset: simple, page jumps, slow + unstable deep',
        'Cursor: fast, stable, no random jumps',
        'Cursor needs a unique ordering (created_at, id)',
        'Cap limit; return nextCursor',
      ],
      followUps: [
        'How do you build a cursor from a non-unique sort column?',
        'Which index supports keyset pagination?',
      ],
    },
    {
      id: 'api-versioning',
      question: 'How do you version an API?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['api-design'],
      answer: `First, I try **not to need new versions**: evolve the API with **backward-compatible changes**, like adding optional fields or new endpoints, and never removing or renaming fields without notice.

When a breaking change is unavoidable, the options are:

- **URL versioning** (\`/api/v1/...\`): explicit, easy to route and cache. This is the most common, and what I use.
- **Header versioning** (\`Accept: application/vnd.app.v2+json\`): cleaner URLs, harder to test.

Then run v1 and v2 side by side, **announce a deprecation timeline** (\`Deprecation\`/\`Sunset\` headers), monitor v1 usage, and remove it only when traffic is gone.`,
      variants: [
        { label: 'Short version', answer: '`/api/v1`, a header, or evolve without breaking changes.' },
      ],
      analogy: `Renovating a shop while it's open: add new aisles without moving existing ones, and if you must rebuild, open the new wing first and only close the old one when customers have moved over.`,
      quickRevision: [
        'Prefer backward-compatible evolution',
        'URL versioning (/v1) is most common',
        'Header versioning is the alternative',
        'Run both, deprecate with notice, monitor usage',
      ],
      followUps: [
        'What counts as a breaking change?',
        'How do you version a mobile app API with old clients?',
      ],
    },
    {
      id: 'rate-limiting',
      question: 'How do you implement rate limiting for an API?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['api-design'],
      answer: `Rate limiting protects the API from abuse (brute-force login, scraping) and protects shared resources. Algorithms:

- **Fixed window**: count per minute. Simple, but allows bursts at window edges.
- **Sliding window**: smoother.
- **Token bucket**: tokens refill at a steady rate, which **allows short bursts** with a fixed long-term rate. My usual choice.

With **multiple instances**, the counters must be **shared**, so they live in **Redis** (atomic \`INCR\` + \`EXPIRE\`, or a Lua script). I key limits by user ID or API key (IP for anonymous traffic), apply **stricter limits on login and OTP** endpoints, and return **429** with \`Retry-After\` and rate-limit headers. An edge layer (Nginx, API Gateway, Cloudflare) can block floods before they reach Node.`,
      variants: [
        { label: 'Short version', answer: 'Token bucket or sliding window, stored in Redis so it works across instances. Return 429.' },
      ],
      analogy: `A token bucket is a ticket dispenser that refills one ticket per second: you can grab a few at once if they've piled up, but you can't take more than the refill rate over time.`,
      quickRevision: [
        'Fixed / sliding window / token bucket',
        'Token bucket allows bursts',
        'Shared counters in Redis across instances',
        'Key by user/API key/IP; stricter on auth',
        '429 + Retry-After',
      ],
      followUps: [
        'Implement a fixed-window limiter with Redis.',
        'How would you rate-limit per tenant plan?',
      ],
    },
    {
      id: 'rest-vs-graphql',
      question: 'REST vs GraphQL: when would you choose each?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['api-design'],
      answer: `**REST**: multiple resource endpoints with HTTP semantics. It's simple, **HTTP caching** works naturally, status codes are meaningful, and the tooling is easy.

**GraphQL**: **one endpoint** and a typed schema, and the **client asks for exactly the fields it needs**. That avoids over- and under-fetching, and it's great when many different clients (web, mobile) need different shapes. The costs: **caching is harder** (POST, a single URL), **N+1 queries** in resolvers (you need DataLoader), query cost limits for security, and more setup.

I default to **REST** for most business APIs. I'd pick GraphQL when frontends compose data from many sources and change fast.`,
      variants: [
        { label: 'Short version', answer: `GraphQL: the client chooses fields, one endpoint, avoids over- and under-fetching, but caching and N+1 are harder.` },
      ],
      analogy: `REST is a set menu from different counters; GraphQL is a buffet where you fill your plate with exactly what you want, but the kitchen must work harder to keep it organised.`,
      quickRevision: [
        'REST: simple, HTTP caching, status codes',
        'GraphQL: one endpoint, client picks fields',
        'GraphQL costs: caching, N+1, query limits',
        'REST by default; GraphQL for many varied clients',
      ],
      followUps: [
        'How does DataLoader solve N+1?',
        'How do you secure GraphQL from expensive queries?',
      ],
    },
    {
      id: 'webhooks-how-to-handle-safely',
      question: 'How do you receive and process webhooks safely?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['api-design'],
      answer: `Webhooks are **untrusted, at-least-once** HTTP calls from another system (Stripe, SSLCommerz, GitHub). Handling them safely:

1. **Verify the signature** (HMAC with the shared secret, over the **raw body**) and the timestamp, to stop forged or replayed calls.
2. **Respond 2xx fast**: store the event and push it to a **queue**, then process it asynchronously. Otherwise the provider times out and retries.
3. **Deduplicate** by event ID with a unique constraint, because the same event can arrive **more than once**.
4. Make processing **idempotent** and **order-tolerant** (events can arrive out of order), and fetch the latest state from the provider when in doubt.
5. **Log and alert** on failures, and keep a way to replay events.`,
      variants: [
        { label: 'Short version', answer: 'Verify the signature, respond 2xx fast, process async, dedupe by event ID (they can arrive twice).' },
      ],
      analogy: `A courier who might deliver the same parcel twice and could be an impostor: check their ID (signature), sign for it quickly (2xx), log the tracking number (dedupe), and unpack it later.`,
      quickRevision: [
        'Verify signature on the raw body + timestamp',
        'Ack fast (2xx), process via queue',
        'Dedupe by event ID',
        'Idempotent + order-tolerant processing',
        'Log, alert, allow replay',
      ],
      followUps: [
        'Why must you verify against the raw body?',
        'How do you handle events arriving out of order?',
      ],
    },
  ],
});
