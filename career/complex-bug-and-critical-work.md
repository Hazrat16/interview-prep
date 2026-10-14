# "Tell me about a complex bug you fixed / something critical you built"

Interviewers ask this to check **how you think**: how you find the root cause, whether you understand the system, and whether you prevent it from happening again.

> ⚠️ **Use only stories that really happened.** Below are story drafts built from your CV and notes. Keep the parts that are true, replace or remove the rest, and fill in the `[brackets]`. One follow-up question ("what did the logs show?") will expose a made-up story.

---

## How to structure the answer (2 minutes)

```text
1. Context      — what system, why it mattered (users, money, deadline)
2. Symptom      — what was going wrong, how it was noticed
3. Investigation — how you narrowed it down (logs, Sentry, reproduce, hypothesis)
4. Root cause   — the real reason, in one clear sentence
5. Fix          — what you changed, and why that fix
6. Prevention   — test, alert, guard, documentation
7. Result       — impact, numbers if you have them
```

**What makes it sound senior:** you reproduced the bug before fixing it, you found the *root cause* instead of patching the symptom, and you added something so it can't happen again.

---

## Which story to pick

| They ask… | Best story |
|-----------|------------|
| "Complex bug you fixed" | Story 1 (Socket.IO across servers) or Story 4 (production bug) |
| "Something critical you built" | Story 2 (Share Transfer Facility) or Story 3 (registration flow) |
| "Performance problem" | Story 5 (load time) |
| "Concurrency / race condition" | Story 6 (sneaker drop overselling) |
| "Something at your current job" | Story 7 (proposal-to-invoice) |

Have **one bug story** and **one critical-build story** ready to tell perfectly. Keep the others as backups.

---

## Story 1 — Real-time messages lost across multiple servers (SmartJobHub) 🐞

**Strong because:** distributed-systems bug, clear root cause, and you wrote a test that proves the fix.

> In my job portal project, SmartJobHub, I built real-time chat with Socket.IO. It worked perfectly locally, but once I ran more than one API instance behind the load balancer, some messages and online-status updates simply didn't arrive. It looked random, and it was hard to reproduce.
>
> I reproduced it by running two server instances locally and connecting two users. When both users were on the same instance, chat worked. When they were on different instances, the message never arrived. So the root cause was that Socket.IO keeps its rooms and connections **in memory per process**. Server A had no idea that the receiver was connected to server B.
>
> The fix was the **Socket.IO Redis adapter**, which uses Redis pub/sub so every instance broadcasts events to the others. I also stored online status in Redis instead of memory and configured sticky sessions so the WebSocket handshake stays on one instance.
>
> To make sure it never comes back, I wrote an integration test that starts **two servers connected to one Redis**, connects a client to each, and asserts that a message sent through server A reaches the client on server B. That test runs in CI.
>
> What I learned: anything stored in memory breaks once you scale horizontally. Now I design state for multiple instances from the start.

Likely follow-ups:
- *Why sticky sessions?* Socket.IO starts with HTTP long-polling before upgrading, and those requests must reach the same server.
- *What if Redis goes down?* Cross-instance events stop. Use managed Redis (ElastiCache) with replication, and the app reconnects automatically.
- *Alternatives?* A message broker (Kafka or NATS), or a managed service like Pusher or Ably.

---

## Story 2 — Share Transfer Facility: a critical feature that moved money (SmartCrowd) ⭐

**Strong because:** high stakes (investor money), cross-team leadership, zero major issues.

> At SmartCrowd, investors own fractional shares of properties. Their main problem was liquidity: once they invested, they couldn't easily exit. The Share Transfer Facility let investors list their shares and other investors buy them.
>
> It was critical because it moved real money and share ownership in a regulated platform. A mistake could mean wrong ownership records or a wrong balance.
>
> I led the delivery. I worked with the backend and design teams to define the flow and, importantly, the edge cases **before** coding: what if two buyers try to buy the same listing, what if a payment fails halfway, partial transfers, cancelled listings, and what each user sees in each state. `[On the frontend I built … / on the backend I built …]`. We validated everything on the server and treated the transfer as a clear state flow `[listed → reserved → paid → transferred / cancelled]`, so no step could be skipped.
>
> Before release we tested the edge cases on staging with QA, and after release I monitored Sentry and LogRocket closely.
>
> It launched with **no major production issues**, and it became an important exit option for investors.

Fill in before using:
```text
[ ] What exactly did I build myself (screens, APIs, validation)?
[ ] How was a double purchase prevented? (DB transaction / status check / lock?)
[ ] How many people were on the team? How long did it take?
[ ] Any number: transfers completed, volume, users?
```

---

## Story 3 — Registration flow redesign for regulatory approval (SmartCrowd) ⭐

**Strong because:** business-critical (approval was blocked on it), tight deadline, backward compatibility.

> After DFSA and DIFC reviewed our investor onboarding, they asked for several compliance changes before approval, on a short deadline. The hard part wasn't adding fields. We had to change a **live** registration flow without breaking it for thousands of existing users who were registered under the old flow, some partially through it.
>
> I owned the frontend. I split one crowded step into several steps, added the new fields and validation, and built document upload and "document requested" flows. For backward compatibility I `[checked each user's registration status / version and routed legacy users only to the missing steps]`, so existing users didn't have to start again.
>
> We delivered on time, the flow was approved, and existing users continued without disruption.

---

## Story 4 — Production bug found with Sentry / LogRocket (template) 🐞

Use your **real** incident. Choose one where you found the root cause. Typical real-world causes in React/Node apps that you can recognize from your own experience:

| Symptom | Common root cause |
|---------|-------------------|
| Data from one screen appears on another / wrong user's data shows briefly | Stale cache or global state not cleared on logout or account switch |
| Page shows old results after fast typing or filter changes | Race condition: an older request finishes after the newer one (fix: AbortController / TanStack Query) |
| Works in English, broken in Arabic | RTL / longer text / third-party SDK not supporting RTL |
| Amount off by a few cents | Floating-point math on money (fix: integer minor units / decimal) |
| Duplicate records / double submit | No idempotency, button not disabled, retry without a key |
| Random 401 after some time | Token refresh race: several requests refreshing at once |
| Works locally, fails in production | Env var missing, timezone (UTC vs local), case-sensitive paths in Linux |
| Memory grows until crash | Event listeners / intervals / sockets not cleaned up |

Answer template:

> At `[company]`, Sentry showed `[error]` affecting `[who / how many]`. I couldn't reproduce it at first, so I used LogRocket session replays to see exactly what the user did before the error: `[steps]`. That showed it happened only when `[condition]`. The root cause was `[one sentence]`. I fixed it by `[fix]`, and to prevent it I `[added a test / guard / alert]`. After the release, the error `[stopped / dropped to zero]` in Sentry.

**Example (only use it if it matches something you actually saw): race condition in search results**

> On a list page with filters, users sometimes saw results that didn't match the selected filter. Sentry showed no error, so the clue came from LogRocket replays: it happened when users changed filters quickly. Each filter change sent a request, and sometimes an **older, slower request finished after the newer one** and overwrote the state. I fixed it by cancelling the previous request with an AbortController (later we moved that data to TanStack Query, which handles this), and I debounced the filter input. I added a test that resolves responses out of order to prove that only the latest one is shown.

---

## Story 5 — Cutting initial load time by 30–45% (SmartCrowd) ⚡

> SmartCrowd's web app had grown over the years and the initial load was slow, especially on mobile. Users had to download the whole app, including screens they never opened.
>
> I first measured: I used `[Lighthouse / Chrome DevTools / bundle analyzer]` and found that `[the main bundle was huge / heavy chart and PDF libraries / legacy components]` were loaded upfront. I introduced **route-based code splitting** with `React.lazy` and `Suspense`, lazy-loaded heavy libraries only on the pages that needed them, and reworked legacy components that `[re-rendered too much / imported whole libraries]`.
>
> I measured again with the same method: initial load time dropped by **30 to 45 percent**, depending on the page and device.

Must know: how you measured (before and after, same conditions), and which chunks were split.

---

## Story 6 — Preventing overselling in a limited-stock drop (Sneaker Drop project) 🐞

> In my Sneaker Drop project, many shoppers try to reserve the same limited stock at the same moment. A naive "read stock → check > 0 → write stock − 1" fails under concurrency: two requests read the same stock value and **both succeed**, so you sell more than you have.
>
> I made the reservation **atomic**, so the check and the decrement happen in one operation `[conditional update `UPDATE … SET stock = stock - 1 WHERE id = ? AND stock > 0` with Prisma / a transaction]`. If no row was updated, the item is sold out. Each reservation creates a 60-second hold, and an expired hold returns the stock. The new stock count is broadcast to everyone via Socket.IO.
>
> I tested it by firing many concurrent reservation requests at once and checking that the number of successful holds never exceeded the stock.

---

## Story 7 — Proposal-to-invoice workflow (Firmwide, current job) ⭐

> At Firmwide I'm the primary engineer on PriceEstimator, a fee estimation and billing platform. The most critical part I built is the proposal-to-invoice workflow: an enquiry comes in, it's scoped, a proposal is generated, and when it's accepted it's billed through milestone-based invoices in multiple currencies, exportable as PDF.
>
> It's critical because it's about money, so correctness matters more than speed. The decisions I made: `[amounts stored as integer minor units / decimal, not floats]`; `[exchange rate fixed on the invoice when it's issued, so totals don't change later]`; `[status flow draft → sent → paid / void so an invoice can't be edited after it's sent]`; validation on every API with Zod; and role-based access so only `[roles]` can issue invoices.

⚠️ Only mention the decisions you actually implemented. Interviewers **will** ask "how do you store money?" for this one.

---

## Bonus: RTL / third-party SDK problem (SmartCrowd)

> When we added Arabic, some third-party SDKs we embedded, like `[IdWise for identity verification / the checkout widget]`, didn't support RTL properly and broke the layout. We couldn't change their code, so I wrote wrapper logic that `[forced LTR inside the widget container / adjusted direction and styles around it]` while the rest of the page stayed RTL. I also centralized RTL handling instead of fixing pages one by one.

---

## Questions they ask after any bug story

| Follow-up | What to say |
|-----------|-------------|
| How did you find the root cause? | Reproduce → narrow down (logs, Sentry, replays, binary search with git bisect) → form a hypothesis → confirm |
| Why not a quick fix? | The quick fix hides the symptom and it comes back somewhere else |
| How did you make sure it didn't happen again? | A test that fails without the fix, plus an alert or guard |
| How long did it take? | Be honest. Hard bugs taking days is normal. |
| What would you do differently? | Add monitoring or tests for that area earlier |
| How did you communicate it? | Informed the lead/PM about impact and ETA, and wrote a short summary after the fix |
