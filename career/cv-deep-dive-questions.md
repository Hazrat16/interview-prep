# CV Deep-Dive Questions — With Answers

Interviewers pick a line from your CV and ask "how exactly?". **Every number and tool on your CV can be questioned.**

The answers below describe the **correct technical approach** for each claim. Before the interview, check each one against what you really did and adjust it. If you did it differently, explain your way and what you'd improve. `[brackets]` = fill in.

---

## Firmwide — PriceEstimator.ai

### What does the product do? What did you own?

> PriceEstimator is a project-fee estimation and billing platform for `[professional services firms]`. Users take in client enquiries, scope the work, generate fee proposals, and once a proposal is accepted, bill it through milestone-based invoices in multiple currencies. I'm the primary engineer: I built most of the backend APIs, the frontend architecture, SSO, notifications and the CI/CD pipeline. The team is `[me + N / a product owner]`.

### How is the API structured?

> Express 5 with layers: **routes** define endpoints, **middleware** handles auth, roles and Zod validation, **controllers** handle the HTTP request and response, and **services** contain business logic and talk to Mongoose models. Errors are thrown as typed errors and caught by one central error handler that returns a consistent JSON shape. Express 5 forwards async errors automatically, so there's no try/catch in every route.

### Why Zod? Where does validation happen?

> Zod validates `body`, `params` and `query` in middleware before the controller runs, so controllers always get clean data. The big advantage is that `z.infer` gives me the TypeScript type from the same schema, so validation and types never drift apart. Mongoose schema validation is the second layer at the database level.

### Walk me through the proposal-to-invoice data model

> Enquiry → Proposal → Invoices. An **enquiry** holds the client and request details. A **proposal** references the enquiry and holds scope items, fees, currency and status (`draft → sent → accepted / rejected`). When a proposal is accepted, **invoices** are created per milestone. Each references the proposal and has its own number, amount, currency, due date and status (`draft → issued → paid / void`). Statuses only move forward through defined transitions, checked in the service layer.

### How do you prevent duplicate invoices?

> A unique index on the invoice number, and on `(proposalId, milestoneId)` so the same milestone can't be invoiced twice. The create endpoint checks the status transition, and the frontend disables the button while the request is pending. For retried requests, an idempotency key would be the next step.

### How do you handle multi-currency? How do you store money?

> Never as floating-point numbers, because `0.1 + 0.2 !== 0.3` in JavaScript. Store amounts as **integer minor units** (cents) or MongoDB `Decimal128`, along with an ISO currency code. When an invoice is issued, the exchange rate is **saved on the invoice**, so the total never changes later even if rates change. Formatting uses `Intl.NumberFormat` with the currency, and rounding happens once at defined points, not on every calculation.

### Why generate PDFs on the client (jsPDF + html2canvas)?

> It reuses the same React invoice view, so what users see is what they download, and there's no server load or headless browser to run. The downsides are that html2canvas renders an image, so text isn't selectable, large invoices need manual page breaks, and output can differ slightly between browsers. If we needed official, consistent documents, or PDFs emailed automatically, I'd move generation to the server with Puppeteer or a PDF library in a queue job.

### How does Microsoft SSO with MSAL work?

> It's OpenID Connect on top of OAuth 2.0, using the **Authorization Code flow with PKCE**. MSAL in the browser redirects the user to Microsoft to sign in. Microsoft returns an authorization code, MSAL exchanges it for an **ID token** (who the user is) and an **access token** (for calling Microsoft Graph). On our backend we validate the token's signature against Microsoft's public keys (JWKS), and check issuer, audience and expiry. Then we map the Microsoft user to our own user and roles and issue our session or JWT. MSAL handles silent token refresh.

### Access token vs ID token?

> The ID token proves identity to *our* app: name, email, tenant. The access token is for calling an API, such as Microsoft Graph. You shouldn't use an ID token to call APIs.

### Where is role-based access enforced?

> On the **API**, always: middleware like `requireRole('admin')` or a permission check on every protected route. The frontend also hides buttons and routes based on role, but that's only for user experience, because anyone can call the API directly. Roles are stored on the user document and included in the token claims.

### How do OTP invitations work?

> An admin invites a user. We generate a random code with `crypto.randomInt`, store only its **hash** with an expiry (`[10–15]` minutes) and an attempt counter, and email it. On verification we compare hashes, check expiry and attempts, then mark it used so it can't be reused. Invitation endpoints are rate-limited.

### How do Socket.IO notifications work? How are sockets authenticated?

> The client connects with its JWT in the handshake `auth` field. Server middleware verifies it and joins the socket to a room `user:<id>`, and optionally a role or organisation room. When something happens, like a proposal being accepted, the service emits to the right room. With multiple instances, you need the Redis adapter so events reach users connected to other servers.

### Explain the ~450-file domain-driven frontend with vertical slices

> Instead of organizing by type, with all components in one folder and all hooks in another, the app is organized by **feature/domain**: `enquiries/`, `proposals/`, `invoices/`, `users/`. Each slice has its own components, hooks, API calls (TanStack Query), types and routes, and exposes a public `index.ts`. Shared UI lives in a `shared/` layer. I enforced **import boundaries** with ESLint rules (`[eslint-plugin-boundaries / no-restricted-imports]`) so features can't import another feature's internals. This keeps a big codebase understandable, and a change in invoices can't accidentally break enquiries.

### Walk me through the CI/CD pipeline

> On every pull request, GitHub Actions runs lint, type-check and build, and a PR can't merge if they fail. Deployment is tag-based: a tag builds a Docker image with a **multi-stage Dockerfile** (build stage with all dependencies, small runtime stage with only the output), deploys to staging, and then the same build is promoted to production. Nginx serves the frontend and reverse-proxies `/api` and the WebSocket to Node, with environment-specific configs.

### Why multi-stage Docker? How do you roll back?

> Multi-stage keeps the final image small and secure, because there are no dev dependencies, source code or build tools in production. To roll back, redeploy the previous image tag. That's why images are tagged by version or commit and not only `latest`.

---

## SmartCrowd

### What is SmartCrowd?

> A Dubai-based, DFSA-regulated fintech platform for fractional real-estate investment. Investors can invest from around AED 500 in income-generating properties and receive rental income. The platform handles registration, KYC, investing, the portfolio, transactions and exits through the Share Transfer Facility.

### Why were you promoted?

> For consistent ownership. I went from building tickets to owning whole features end to end, I improved performance by 30–45%, built the reusable component library, contributed to backend APIs and mentored juniors through code reviews. After the promotion I led the Share Transfer Facility.

### How did you make auth and transaction APIs safe?

> Input validation on every endpoint, authentication middleware, and authorization checks so users can only access their own data (no IDOR, where changing an ID in the URL shows someone else's data). For transactions: server-side calculation of amounts (never trusting the client), status checks before every change, and MongoDB transactions where several documents must change together. Sensitive actions were logged for audit.

### How did you get the 25–35% API improvement?

> I found the slow endpoints first, using `[response time logs / APM / Sentry performance]`. Then, with `explain()`, I found queries doing collection scans. The fixes were: **compound indexes** matching the query filter and sort, **projections** to return only needed fields, `.lean()` for read-only queries, replacing `populate` chains with an aggregation using `$lookup` where it made sense, and **Redis caching** for data that's read often and changes rarely, like `[property listings]`. The cache was invalidated on update and had a TTL as a safety net. I measured response times before and after for the same endpoints.

### How did you handle cache invalidation?

> Cache-aside: read from Redis, and on a miss, read from the DB and store with a TTL. When the data is updated, delete the cache key so the next read refreshes it. The TTL protects against missed invalidations.

### How did you integrate 5+ financial APIs?

> The integrations were for `[KYC/identity (IdWise), payments/checkout, banking]`. Each external API was wrapped in its own service module, so the rest of the app didn't depend on its response format. I added timeouts, error mapping into our own error types, and retries only for safe operations. On the UI, every external step had loading, failure and retry states, so a provider being down didn't break the whole flow. Webhooks were verified and handled idempotently.

### How did you measure the 30–45% load improvement?

> With `[Lighthouse and Chrome DevTools performance / load timing]` on the main pages, before and after, under the same conditions, and a bundle analyzer to see what was in the bundle. It's a range because the improvement differed by page and device: pages that previously loaded heavy libraries improved the most.

### What exactly did you split?

> Route-level splitting with `React.lazy` and `Suspense`, so each page loads its own code. Heavy libraries `[charts, PDF, date libraries]` were loaded only on the pages that need them, via dynamic `import()`. Legacy components that imported whole libraries or re-rendered too often were reworked.

### What does "led the delivery of STF" mean concretely?

> I was the main point of contact between frontend, backend and design for that feature. I broke it into tasks, clarified edge cases with product before development, built `[the core frontend flow / APIs]`, reviewed related PRs and coordinated testing on staging. See the full story in [complex-bug-and-critical-work.md](complex-bug-and-critical-work.md).

### How did you design the 20+ reusable components?

> Components like `[Button, Input, Select, Modal, Table, Stepper, FileUpload, Toast]`. Small, consistent prop APIs, composition through `children`, built-in accessibility (labels, keyboard, focus), and RTL support. To get adoption, I replaced duplicated UI in existing pages myself and pointed to the shared components in code reviews. That reduced duplicated UI code by about 35%.

### How did you use Sentry and LogRocket?

> Sentry for errors, with stack traces, release tags and alerts. LogRocket for session replay, to see exactly what the user did before an error. Together they let me reproduce bugs that users couldn't explain.

---

## Projects

### SmartJobHub

| Question | Answer |
|----------|--------|
| Why the Redis adapter for Socket.IO? | Socket.IO keeps connections in memory per server. With several servers, a message from server A can't reach a user on server B. The Redis adapter uses pub/sub to broadcast between instances. My test runs two servers on one Redis to prove it. |
| Why sticky sessions? | Socket.IO's handshake may start with HTTP long-polling, and those requests must hit the same server. |
| Why BullMQ for email? | Sending email is slow and can fail. A queue moves it out of the request, so the API responds fast, and gives retries with backoff, and failed jobs are kept for inspection. |
| How does SSLCommerz payment verification work? | Create a session server-side → redirect the user to the gateway → the gateway calls our IPN/success URL → we **validate the transaction with the SSLCommerz validation API** (never trust the redirect alone), check amount and transaction ID, then mark it paid idempotently. |
| What's in the 15 test suites? | Integration tests with Supertest for auth, jobs, applications, payments and chat. Run with the Node test runner against a test database in CI. |
| Why ECS Fargate over EC2? | No servers to patch or scale manually, pay per task, and simple rolling deploys with circuit-breaker rollback. The trade-off is higher cost per unit and less control. |
| Where is Terraform state? | Remote in S3 with locking, so two people can't apply at the same time, and separate state for staging and production. |
| What are the Prometheus metrics? | The API exposes `/metrics` (request count, latency histograms, errors) with `prom-client`. Prometheus scrapes it, and Grafana shows dashboards. |

### Doctor Appointment Platform

| Question | Answer |
|----------|--------|
| How do you prevent double-booking? | A unique index on `(doctorId, slotStart)` in MongoDB, so the second insert fails even under concurrency. Then return a 409 and show "slot no longer available". |
| Why both Terraform and Ansible? | Terraform **creates** the infrastructure (VPC, security groups, EC2). Ansible **configures** the server (Docker, Nginx, TLS, backups). Different jobs. |
| How do rolling deploys and health checks work? | Start the new container, wait until its `/health` endpoint passes, switch Nginx traffic to it, then stop the old one. If the health check fails, keep the old one running. |
| Are backups tested? | Scheduled `mongodump` to `[S3 / disk]`. A backup only counts if a restore works, so I tested restoring into a fresh database. |
| What does CodeQL do? | Static analysis that finds security issues (injection, unsafe patterns) on every PR. |

### AI SQL Assistant

| Question | Answer |
|----------|--------|
| How do you guarantee read-only SQL? | Defence in layers: parse the generated SQL into an **AST** and allow only a single `SELECT` statement (no INSERT/UPDATE/DELETE/DDL, no multiple statements); run it with a **read-only database user**; add a statement timeout and row limit. Even if the AI is tricked, the database can't be modified. |
| Prompt injection? | The user can't make it write data because of the layers above. Schema context is generated by us, and the model's output is treated as untrusted input. |
| Why Fastify? | Fast, built-in schema validation, good TypeScript support, plugin system. |
| What's the offline fallback? | If no OpenAI key or Ollama model is available, `[rule-based / template SQL for common questions]` so the app still works. |
| How does schema introspection work? | Query `information_schema` for tables, columns, types and foreign keys, and give that to the model as context. |

### Sneaker Drop

| Question | Answer |
|----------|--------|
| How do you prevent overselling? | An atomic conditional update: decrement stock only `WHERE stock > 0` in one statement or transaction. If no row was updated, it's sold out. Never "read then write". |
| How do 60-second holds expire? | Each hold has an `expiresAt`. A scheduled job or check releases expired holds and returns stock, then broadcasts the new count. Checkout verifies the hold is still valid. |
| What if the socket disconnects? | The client reconnects and fetches the current stock again. Stock truth is on the server, and the socket only pushes updates. |
| Why share types in a pnpm monorepo? | The frontend and API use the same TypeScript types, so an API change breaks the frontend build instead of production. |

### npm hooks

| Question | Answer |
|----------|--------|
| What does `block-browser-back` do? | Prevents accidental back navigation, for example during payment or checkout. It pushes a history state and listens to `popstate`, re-pushing or confirming when the user presses back. It cleans up the listener on unmount. |
| What does `checkout-risk-sdk` do? | A React hook wrapping Checkout.com's Risk SDK for fraud detection. It loads the SDK and exposes the device session ID to send with the payment. |
| How did you publish it? | Built with TypeScript into ESM/CJS and type definitions, `npm publish` with semantic versioning. |

### EKS / Terraform modules

| Question | Answer |
|----------|--------|
| Deployment vs Service? | A Deployment keeps N pods running and does rolling updates. A Service gives those pods one stable address and load-balances between them. |
| How did you expose the app? | A `LoadBalancer` Service, which creates an AWS load balancer, or an Ingress with the AWS Load Balancer Controller. |
| Security group vs NACL? | A security group is stateful and per instance, with allow rules only. A NACL is stateless and per subnet, with allow and deny rules. |
| Why tear down the cluster? | EKS costs money every hour (control plane, nodes, NAT), so I documented setup and teardown to avoid bills. |

---

## "Gotcha" questions

**"You have three different CVs. Are you frontend, full-stack or DevOps?"**
> I'm a full-stack engineer with a frontend strength, and I've invested in DevOps so I can own delivery end to end. I adjust which part I highlight depending on the role.

**"Is this production work or a personal project?"**
> Firmwide and SmartCrowd are production. SmartJobHub, Doctor Appointment, AI SQL Assistant and Sneaker Drop are my own projects, built to production standards with CI/CD and tests.

**"Which technology on your CV are you weakest in?"**
> Kubernetes. I've deployed on EKS in projects, but not run it in production. I'm strongest in React, TypeScript, Node and MongoDB.

**"Did you use AI to build these projects?"**
> I use AI tools to speed up boilerplate and research, like most engineers now, but I designed the architecture and I understand and can explain every part. Happy to walk through any of the code.

**"Why such big claims for a 3-year engineer?"**
> They're specific features I owned, and I can explain how each one works and how I measured it.

---

## Prep method

1. For each answer above, delete what isn't true for you and add one real detail.
2. Draw the architecture of SmartJobHub and PriceEstimator on paper.
3. Re-read your GitHub READMEs the day before.
