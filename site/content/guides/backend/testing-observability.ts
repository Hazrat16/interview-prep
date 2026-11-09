import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Testing & Observability',
  description: 'Unit vs integration tests, mocking, logging, metrics and tracing.',
  questions: [
    {
      id: 'how-do-you-test-an-api',
      question: 'How do you test an API?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['api-design', 'testing'],
      answer: `In layers:

- **Unit tests** for services and business rules (status transitions, totals, permissions), with dependencies injected or mocked.
- **Integration tests** with **Supertest** against the real Express app and a **real test database** (a Docker container or in-memory Mongo), seeded per test. These catch the most bugs: validation, auth, queries, status codes.
- **Contract checks**: responses match the OpenAPI or Zod schemas.
- A few **E2E or smoke tests** after deploys.

Key cases: happy path, validation errors, **auth and authorisation failures**, edge cases (duplicates, concurrency), and error handling. They run in **CI** on every PR. My SmartJobHub API has **15 test suites**, including a test that starts **two servers on one Redis** to prove Socket.IO messages cross instances.`,
      variants: [
        { label: 'Short version', answer: `Unit tests for services, integration tests with Supertest against a test DB, contract checks. You have 15 suites in SmartJobHub.` },
      ],
      analogy: `Testing a car: check each part on the bench (unit), then drive the assembled car around a test track with real fuel (integration with a real DB).`,
      quickRevision: [
        'Unit: services/business rules',
        'Integration: Supertest + real test DB',
        'Test auth/authz failures, validation, edge cases',
        'Contract checks; run in CI',
        'SmartJobHub: 15 suites incl. multi-instance socket test',
      ],
      followUps: [
        'How do you isolate tests that share a database?',
        'Mock the DB or use a real one?',
      ],
    },
    {
      id: 'mocking-external-apis',
      question: 'Mocking external APIs?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['testing'],
      answer: `I mock at the **HTTP boundary**, so my real client code still runs:

- **nock** or **MSW** (Node) intercept outgoing requests and return fixtures, including **errors, timeouts and slow responses**, so retries and fallbacks get tested.
- Or **inject the client** (dependency injection) and pass a fake in unit tests.

I keep fixtures realistic (recorded from the real API, with secrets removed), and add a small number of **contract or sandbox tests** against the real provider (Stripe test mode, for example) so mocks don't drift from reality.`,
      variants: [
        { label: 'Short version', answer: 'Mock at the HTTP boundary (nock / MSW) or inject the client.' },
      ],
      analogy: `A flight simulator: pilots practise engine failures and storms safely, but still do occasional real flights to make sure the simulator matches the plane.`,
      quickRevision: [
        'Mock at the HTTP boundary (nock / MSW)',
        'Or inject a fake client',
        'Test failures: errors, timeouts, slow responses',
        'Occasional sandbox/contract tests vs real API',
      ],
      followUps: [
        'How do you test retry with backoff without waiting?',
        'What is contract testing?',
      ],
    },
    {
      id: 'logging',
      question: 'Logging?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['testing'],
      answer: `I use **structured JSON logs** (pino), not free-text \`console.log\`, so logs are searchable and filterable. Every log line carries a **request or correlation ID** (generated in middleware and passed to downstream calls and jobs), plus context like user ID, route and duration.

- Use **log levels** (debug in dev, info and above in prod) and **log at boundaries**: request in and out, external calls, errors with stack traces.
- **Never log** passwords, tokens, card data or personal data. Redact them.
- Ship logs to a central place (CloudWatch, Loki, Datadog), with retention limits.`,
      variants: [
        { label: 'Short version', answer: 'Structured JSON logs (pino) with a request ID, no secrets or PII.' },
      ],
      analogy: `A flight recorder: every event is written in the same machine-readable format with the flight number (request ID), so investigators can replay exactly what happened, without recording passengers' private conversations.`,
      quickRevision: [
        'Structured JSON (pino)',
        'Request/correlation ID on every line',
        'Levels; log at boundaries + errors',
        'Redact secrets/PII',
        'Centralised with retention',
      ],
      followUps: [
        'How do you trace one request across services?',
        'Logs vs metrics vs traces?',
      ],
    },
    {
      id: 'observability-logging-monitoring',
      question: 'How do you monitor a production application and find the root cause of an issue?',
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
  ],
});
