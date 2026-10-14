# PriceEstimator (Firmwide) — Real Contributions & Stories

Everything here comes from the git history of `PriceEstimator/Frontend` and `PriceEstimator/Backend-V3.0`. The commit hashes are listed so you can open the diff and refresh your memory before the interview.

---

## What you actually did (from the repos)

| Repo | Your commits | Share | Your role |
|------|--------------|-------|-----------|
| Frontend | ~1,148 of 1,253 | **~92%** | Primary frontend engineer: architecture, almost all features, CI/CD, Nginx |
| Backend-V3.0 | ~208 of 787 | **~26%** | Major backend modules. The main backend developer is Sahiqur Rahman Tipu. |

**Time span:** first commits Nov 2025, still active Oct 2026.

### Product in one sentence

> PriceEstimator is an internal platform for an architecture firm (SCDA): it reads client enquiry emails from Microsoft 365, uses AI to extract project details and predict fees, manages proposals and their versions, and then tracks billing: milestones, "ready to bill" confirmations from the project team, multi-currency invoices and PDF export.

### Your backend modules (by area)

- **Auth & access:** JWT access/refresh with session limits for non-super-admins (`sessionStartAt`), Microsoft SSO user authorization, roles (`super_admin`, admin, director, user) with `requireAdminOrSuperAdminForWrites` middleware.
- **User lifecycle:** registration and approval, password hashing with a pepper, OTP **invitation flow** with expiry, email verification, password reset.
- **Proposals:** search and filters (consultancy variants, numeric ranges for site area / interior area / BUA), **proposal versions** (snapshots, batch fetch, soft delete), notes shared by enquiries and proposals, **background batch upload** (up to 10 files, concurrency 3, pollable batch ID).
- **AI integration:** summaries, fee prediction, AI dashboard and analytics endpoints, upload progress while waiting for the AI service.
- **Real-time:** notification system, proposal change notifier, Socket.IO email-extraction events.
- **Billing:** invoice PDF + email sending, ready-to-bill confirmation with admin verification, team surveys, cash payment method, soft-deleted schedules, **original currency + amount** alongside USD, invoice number prefixes, change-order fee lines.
- **DevOps:** Dockerfile, GitHub Actions build/push/verify workflows.

### Your frontend work (by area)

- Migrated the app to TypeScript, then restructured it into a **domain-based architecture** (`src/domains/*`, ~457 TS files) with **ESLint `no-restricted-imports` boundaries**.
- Enquiry organizer, proposals, dashboard (charts, table view, inner pages), AI price wizard, chatbot with **streaming**.
- Auth: Microsoft login callback, token refresh, RBAC UI.
- Notifications with `socket.io-client`.
- The whole **invoice UI**: generate/edit invoices, PDF generation (jsPDF), bilingual PDF labels, currency formatting, pagination of PDF pages.
- CI/CD deploy workflow (GHCR, staging VM), Nginx configs for staging and production.

---

## ⚠️ Fix these before the interview

1. **Dates.** Your CV says "Firmwide, May 2026 – Present", but your first commits are from **November 2025**, while you were still at SmartCrowd until April 2026. An interviewer who asks "when did you start on this project?" will expect an answer that matches. Decide on the honest version, for example: *"I started on it part-time / as a freelancer in November 2025, and moved to a full-time contract in May 2026."* Then update the CV if needed.
2. **"Primary engineer."** True for the **frontend** (~92% of commits). On the backend you built major modules, but another developer wrote most of it. Safer wording:
   > "I was the primary frontend engineer and owned several backend modules: authentication and roles, user invitations, notifications, proposal versioning and most of the billing workflow."
3. **Client name.** The production domain shows the client is an architecture firm. Check whether you're allowed to name it. If unsure, say "an architecture and design firm".

---

## Story ranking — which to tell

| Rank | Story | Type | Why it's strong |
|------|-------|------|-----------------|
| ⭐ 1 | AI chatbot streaming broken only in production (Nginx buffering) | Complex bug | Works locally, fails in production. A real infrastructure root cause. |
| ⭐ 2 | Users stuck on an old version after deploys (stale chunks) | Complex bug | Deep understanding of SPA caching and deployment |
| ⭐ 3 | Billing "ready to bill" workflow with versioned survey links | Critical build + bug | Money, workflow states, a stale-link bug |
| 4 | Random logouts / 401s from concurrent token refresh | Complex bug | Classic race condition |
| 5 | Upload progress stuck at 15% → background batch processing | Bug → design improvement | UX + async backend design |
| 6 | Duplicate key error on user creation (`msId`) | Bug | MongoDB index details |
| 7 | Fee-schedule rows jumping after sending an invoice | Small bug | Good if they want a quick example |
| 8 | Deploy failing with `KeyError: 'ContainerConfig'` | DevOps bug | For DevOps-flavoured interviews |

**Recommendation:** "complex bug" → Story 1 (backup: Story 2). "Critical thing you built" → Story 3.

---

## ⭐ Story 1 — AI chatbot streaming worked locally but not in production

Commits: `1a096ea` (Chatbot stream fix #50), `27d9d54`, `72e848f`, `3b1fe90` — 2026-03-03

**Ready-to-say (about 2 minutes):**

> In PriceEstimator we have an AI chatbot where users ask questions about past proposals. The AI service streams its answer chunk by chunk, like ChatGPT, and I built the frontend to read the stream with `fetch` and a `ReadableStream` reader, appending text as it arrives.
>
> Locally it streamed perfectly. In production, users waited a long time and then the whole answer appeared at once, which felt like the app was frozen.
>
> Since the same code behaved differently, I suspected the layer between them: production traffic goes through **Nginx as a reverse proxy**. I tested with `curl -N` directly against the production endpoint and the output arrived all at once, so the frontend wasn't the problem. Something in the proxy was holding the response.
>
> The root cause was that **Nginx buffers proxied responses by default**: it collects the upstream response and sends it when it's done. **Gzip compression** also buffers to compress. So the stream was turned into one big response.
>
> For the chatbot route I disabled proxy buffering, request buffering, caching and gzip, set `proxy_max_temp_file_size 0`, cleared the `Connection` header for HTTP/1.1 keep-alive, and increased the read timeout to 5 minutes for long answers. On the frontend I also made the parser handle SSE, plain-text and JSON responses, so it doesn't break if the AI service changes its content type.
>
> I documented the fix and a `curl -N` test in an `NGINX_STREAMING.md`, so anyone deploying a new server can check that streaming works. After deploying, answers streamed in production the same as locally.

**Follow-ups:**
- *Why does buffering exist?* It protects slow clients: Nginx reads quickly from the upstream and frees it. That's good for normal requests and bad for streaming.
- *Alternative?* The upstream can send the `X-Accel-Buffering: no` header to disable buffering per response.
- *SSE vs WebSocket?* SSE is one-way server → client over plain HTTP, which is ideal for streaming AI answers.
- *What did it take to find?* It took several production deploys (four commits in one day). Be honest about that: you narrowed it down step by step (buffering → gzip → temp files → headers).

---

## ⭐ Story 2 — Users stuck on an old version after deployments (stale chunks)

Commits: `6a0c5fa` (2026-05-12, no-cache for the SPA shell), `04c625d` (2026-09-17, reload on stale chunk, #229)

> After we started deploying more often, we got two kinds of reports. Some users didn't see new features at all: new pages redirected to login, as if they didn't exist. Others got "Could not create the invoice PDF" right after a deploy.
>
> Both had the same root cause. Vite builds JavaScript files with a **content hash in the filename**, and `index.html` points to those files.
>
> **First problem:** browsers were caching `index.html`. So users kept the *old* HTML pointing to old bundles, and new routes didn't exist in their copy of the app. I fixed it in all Nginx configs by serving `index.html` with `Cache-Control: no-store, no-cache, must-revalidate`, while the hashed JS and CSS files can still be cached long term because their names change on every build. I also added a deployment marker page to check which build is actually being served.
>
> **Second problem:** a user who had the app **open during a deploy** still had the old `index.html` in memory. When they clicked "Generate invoice PDF", the app lazy-loaded the jsPDF chunk using the *old* hashed filename, which no longer existed on the new server, so the import failed with "Failed to fetch dynamically imported module".
>
> I fixed it by listening to Vite's `vite:preloadError` event and **reloading the page once** to pick up the new build. I guarded it with a 10-second cooldown in `sessionStorage`, so a really broken deploy can't put the tab into a reload loop. In the PDF flow I detect that specific error and show "A new version is available, refreshing" instead of a confusing failure.

**Follow-ups:**
- *Why not cache nothing?* Hashed assets are immutable and should be cached for a long time, for performance. Only the HTML entry point must stay fresh.
- *Other solutions?* Keep old chunks on the server for a while after a deploy, or use a version-check endpoint with a "new version available" banner.

---

## ⭐ Story 3 — Billing "Ready to Bill" workflow (critical build) + stale survey link bug

Commits (backend): `b2e453e`, `9ffb2e0`, `aee2b40`, `c9d1ef0`, `e795377`, `14e4623`, `9015d6f`, `09e2306` (Sept 2026)

**The critical build:**

> The most critical part I worked on is billing. Every project has a fee schedule split into milestones per consultancy and phase. Before finance can invoice a milestone, the **project team must confirm the work is done**. So I built a "Ready to Bill" flow: an admin clicks "Ask Team", the project lead gets an email with a **signed survey link**, they answer whether the stage is complete (or give a new expected date), and an admin verifies before the milestone becomes ready to bill. Then the invoice is generated with the original contract currency and USD, exported as PDF and emailed.
>
> It's critical because mistakes mean billing a client for unfinished work, or never billing finished work.

**The bug inside it:**

> After release we found a subtle problem: admins sometimes clicked "Ask Team" again, to correct something or ask about a new date. But the **old email link still worked**, and opening it showed the previous answer, "Response recorded", or let someone answer an outdated question. Separately, some milestones still had a pending survey confirmation even though their status had already changed manually, so the admin screen showed wrong states.
>
> I fixed it with **versioning**: each milestone has a `surveyVersion` that's incremented on every "Ask Team", and that version is **signed into the link's token**. When a link is opened, the backend compares the token's version with the milestone's current version, and old links are treated as superseded. Re-asking also clears the previous response, and if the milestone was already confirmed but not invoiced, it moves back to "Not Ready" so the new answer counts. Old tokens without a version were treated as version 0, so they kept working.
>
> For the inconsistent data, I first fixed every code path that changed the status without clearing the pending survey. Then I wrote a one-off **cleanup script with a `--dry-run` mode** to list and then fix the orphaned records already in the database.

**Follow-ups:**
- *Why version instead of deleting old tokens?* JWT-style signed tokens can't be revoked individually without storing them. A version number is a cheap way to invalidate all older ones.
- *Why dry-run?* It changes production billing data, so you check what will change before changing it.
- *How is money stored?* Check your code before answering. The milestone has `amountUsd` plus an original currency and original amount (`9015d6f`). Explain why you keep both.

---

## Story 4 — Random logouts and 401 errors from concurrent token refresh

Commits: `530ab99` (2026-02-28 "fixed logout issue"), `b3a8032`, `78f201c`, `1a78da0` (Token mismatch issue #92, 2026-04-28)

> Users were being logged out randomly, and some pages showed 401 errors right after opening the app.
>
> When the access token expired, a page like the dashboard fired **several API requests at once**. Each got a 401, and each one tried to refresh the token at the same time. Our backend **rotates refresh tokens**: using one invalidates it (`jwtService.invalidateRefreshToken`). So the first refresh succeeded, and the parallel ones sent a refresh token that had just been invalidated, got a 401, and the app logged the user out.
>
> I made the refresh **single-flight**: the first 401 starts the refresh and stores the promise in a ref. Every other request waits for that **same promise** instead of starting its own. Requests that failed during the refresh are queued in the Axios interceptor and retried with the new token.
>
> The second part (#92) was the first load: protected queries mounted before the app had a fresh token, so the first requests always failed with 401 and then retried. I added an **auth bootstrap**: if a refresh token exists, the provider refreshes once and sets `isReady` before rendering the app. I also refresh the token every 12 minutes, since it expires after 15.

---

## Story 5 — Upload progress stuck at 15% → background batch processing

Commits (backend): `b5c1bb7`, `c5155ad` (2026-03-06), `da87c85` (2026-08-23)

> Users upload past proposal PDFs, and an AI service extracts the fee data. The progress bar went to 15% and stayed there for one or two minutes, so users thought it was broken and re-uploaded, creating duplicates.
>
> The cause: the server reported progress only at fixed steps, and the longest step, waiting for the AI service, sent no updates at all. There was also a fake timer adding 1% per second that could fight with the real progress updates.
>
> I replaced the fake timer with a progress callback passed into the service. Progress values are clamped, only move forward, and never overwrite a finished or failed job. While waiting for the AI, progress moves slowly from 15 to 39% with a "Waiting for AI to process the file…" message, and the timer is always cleared in a `finally` block.
>
> Later, users needed to upload many proposals at once, so I added **background batch processing**: up to 10 files per request, processed with a **concurrency limit of 3** so we don't overload the AI service. The API immediately returns `202 Accepted` with a batch ID, and the frontend polls the batch status.

Be ready for: *"Is the 15→39% ramp real progress?"* No, it's a perceived-progress indicator, because the AI service doesn't report progress. The real fix would be the AI service sending progress events. Saying this honestly sounds senior.

---

## Story 6 — Duplicate key error when creating users (MongoDB unique index on `msId`)

Commits (backend): `fc233d5`, `cdc9442`, `cfe65d0`, `53d4794`, `5537aed` (May 2026)

> Users can sign in with Microsoft (they have an `msId`) or be created through registration (no `msId`). After the second non-Microsoft user, creation failed with a generic "Failed to create user".
>
> The real error was MongoDB `E11000 duplicate key` on `msId`. A **unique index treats a missing or empty value as a value too**, so the second user without a Microsoft ID clashed with the first.
>
> I normalized empty or whitespace `msId` values to *unset* in a pre-save hook, tried a sparse and then a partial unique index, and learned that changing the schema **doesn't change an index that already exists** in MongoDB: you need `syncIndexes` or a migration. I also mapped duplicate-key errors to clear `409 Conflict` messages ("This Microsoft account is already linked to another user") instead of a generic 400.

⚠️ The final code has **no unique index** on `msId` (the partial index was removed in `5537aed` after review). Check why before telling this story, and say what the final decision was.

---

## Story 7 — Fee-schedule rows jumping after sending an invoice (quick example)

Commits: `6ca95bf`, `5370905` (2026-09-17)

> After generating or sending an invoice, the milestone row jumped to the top of the fee schedule. The backend returned milestones in an order that changed when one was updated, and the UI trusted that order. I sorted by the milestone's **immutable ID** on the client, and handled a missing ID so the sort can't crash. Lesson: never rely on database order for display unless you sort explicitly.

---

## Story 8 — Deploy failing with `KeyError: 'ContainerConfig'`

Commit: `4d7e0fa` (2026-05-11)

> The staging deploy started failing at `docker-compose up --force-recreate`. The VM had docker-compose **v1.29.2**, which has a known bug when recreating containers from **BuildKit-built images**. Instead of upgrading the VM during a release, I changed the workflow to take the container down and start it fresh, which is the same pattern our Makefile already used, then verify it's running. Upgrading to Compose v2 is the long-term fix.

---

## Updated "Tell me about Firmwide" (honest version)

> Since `[Nov 2025 part-time / May 2026 full-time]` I've worked on PriceEstimator for an architecture firm. It reads client enquiry emails from Microsoft 365, uses AI to extract project details and estimate fees, and manages proposals through to billing. I'm the primary frontend engineer: I moved it to TypeScript and a domain-based architecture, and built most of the UI, including the invoice and PDF system. On the backend I own authentication and roles, user invitations, notifications, proposal versioning and most of the billing workflow. I also set up the Docker builds and GitHub Actions deployments.
