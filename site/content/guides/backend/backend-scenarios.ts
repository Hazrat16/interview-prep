import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Backend Scenarios',
  description: 'Production problems: slow APIs, race conditions, big uploads and outages.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'backend/rest-api-design/api-idempotency-double-submit',
    'database/transactions-and-acid/db-transactions-isolation-race',
  ],
  questions: [
    {
      id: 'api-slow-in-production',
      question: 'An API endpoint is slow in production. How do you investigate and fix it?',
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
    },
    {
      id: 'upload-a-1gb-file',
      question: 'Upload a 1GB file.',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['nodejs', 'express', 'api-design'],
      answer: `I wouldn't stream 1GB through my Node API: it ties up connections, memory and bandwidth. Instead:

1. The client asks the API for a **presigned S3 URL** (or a **multipart upload**: create the upload, then presigned URLs per part). The API checks auth, file type and size limits first.
2. The client **uploads directly to S3** in parallel parts, with **resume and retry** per part and a progress bar.
3. On completion (client callback or an **S3 event**), the API **records metadata** and queues processing: virus scan, thumbnails, parsing.
4. Lifecycle rules clean up incomplete multipart uploads.

If it really must go through the server, **stream** it to S3 with backpressure and never buffer it in memory.`,
      variants: [
        { label: 'Short version', answer: `Presigned S3 URL so the client uploads directly, and multipart upload. Don't stream it through Node unless you must.` },
      ],
      analogy: `Instead of carrying a sofa through your office lobby, you give the delivery company a one-time pass to the loading dock (presigned URL), and they deliver it straight to the warehouse.`,
      quickRevision: [
        'Presigned URL / multipart upload',
        'Client uploads directly to S3 (parallel, resumable)',
        'API validates first, records metadata after',
        'Async processing via queue/S3 event',
      ],
      followUps: [
        'How do you secure presigned URLs?',
        'How do you show upload progress?',
        'How do you scan uploads for viruses?',
      ],
    },
    {
      id: 'send-100k-emails',
      question: 'Send 100k emails.',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nodejs', 'express', 'api-design'],
      answer: `Never in a request loop. I'd:

1. Create a **campaign record**, then **enqueue jobs in batches** (e.g. 500 recipients per job) in BullMQ or SQS.
2. **Workers** send through an email provider (SES, SendGrid) with **concurrency and rate limits** matching the provider's quota.
3. **Retries with backoff** for temporary failures; permanent failures (bounces) are recorded, not retried.
4. **Track status per recipient** (queued, sent, failed, bounced) and make jobs **idempotent**, so a retry doesn't email someone twice.
5. Respect **unsubscribes**, and process provider **webhooks** for bounces and complaints. Show progress on a dashboard.`,
      variants: [
        { label: 'Short version', answer: 'Queue with batching, rate limits and retries, tracking status per job.' },
      ],
      analogy: `A post room mailing a big campaign: letters go out in labelled sacks (batches) at the pace the post office accepts (rate limit), and every returned letter is logged, not resent blindly.`,
      quickRevision: [
        'Queue in batches, never in a request',
        'Workers + provider rate limits',
        'Retry temporary, record permanent failures',
        'Per-recipient status, idempotent jobs',
        'Unsubscribes + bounce webhooks',
      ],
      followUps: [
        'How do you avoid sending duplicates after a worker crash?',
        'How would you schedule sending by timezone?',
      ],
    },
    {
      id: 'a-third-party-api-is-down',
      question: 'A third-party API is down.',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['api-design'],
      answer: `Design for failure:

1. **Timeouts** on every external call, so a dead API doesn't hang my requests.
2. **Retries with exponential backoff + jitter**, only for retryable errors and idempotent operations.
3. A **circuit breaker**: after repeated failures, stop calling for a while and **fail fast**, then probe again.
4. A **fallback**: cached or last-known data, a degraded feature ("rates updated an hour ago"), or **queue the work** to retry later.
5. **Alerting and visibility**: monitor its error rate, show users a clear message, and check the provider's status page.

At SmartCrowd we integrated 5+ financial APIs, so this kind of isolation was essential.`,
      variants: [
        { label: 'Short version', answer: `Timeouts, retries with exponential backoff and jitter, circuit breaker, fallback or queue for later, alerting.` },
      ],
      analogy: `If your usual supplier is closed, a good shop doesn't keep calling every second: it stops ordering for a bit (circuit breaker), sells from stock (cache), takes back-orders (queue) and tells customers honestly.`,
      quickRevision: [
        'Timeouts always',
        'Retry with backoff + jitter (retryable only)',
        'Circuit breaker → fail fast',
        'Fallback: cache / degrade / queue',
        'Alert + clear user message',
      ],
      followUps: [
        'How does a circuit breaker decide to close again?',
        'Would you retry a payment call?',
      ],
    },
  ],
});
