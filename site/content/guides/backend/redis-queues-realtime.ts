import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Redis, Queues & Real-time',
  description: 'Caching with Redis, background jobs, pub/sub, WebSockets and SSE.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'database/caching/db-redis-caching-strategy',
  ],
  questions: [
    {
      id: 'what-do-you-use-redis-for',
      question: 'What do you use Redis for?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['redis', 'realtime', 'system-design'],
      answer: `Redis is an in-memory data store, very fast, with useful data structures. I use it for:

- **caching** hot, expensive reads (cache-aside with TTL);
- **sessions** and refresh-token or OTP storage with expiry;
- **rate limiting** with atomic counters;
- **queues**: **BullMQ** for emails, PDFs and background jobs;
- **pub/sub** and the **Socket.IO Redis adapter** for real-time across instances;
- **distributed locks** for short critical sections.

It's in-memory, so I treat it as a **cache or coordination layer**, not the source of truth for important data, unless persistence is configured deliberately.`,
      variants: [
        { label: 'Short version', answer: 'Cache, sessions, rate limiting, pub/sub, distributed locks, BullMQ queues, Socket.IO adapter.' },
      ],
      analogy: `Redis is the whiteboard next to the filing cabinet: super fast to read and update, perfect for notes and coordination, but you don't keep the only copy of the contract on it.`,
      quickRevision: [
        'Cache, sessions, OTPs (TTL)',
        'Rate limiting counters',
        'BullMQ queues',
        'Pub/sub + Socket.IO adapter',
        'Locks; not the source of truth',
      ],
      followUps: [
        'What happens to your app if Redis goes down?',
        'Redis persistence: RDB vs AOF?',
      ],
    },
    {
      id: 'cache-stampede',
      question: 'Cache stampede?',
      perspective: 'concept',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['redis', 'caching', 'realtime', 'system-design'],
      answer: `A cache stampede (thundering herd) happens when a **popular key expires** and **many requests miss at the same moment**, so they all hit the database to rebuild the same value, which can overload it.

Fixes:

- **Single-flight / lock**: the first request takes a short Redis lock (\`SET key NX PX\`) and rebuilds, while others wait briefly or serve the stale value.
- **Stale-while-revalidate / early refresh**: refresh before expiry (probabilistic early expiration) and keep serving the old value meanwhile.
- **Jittered TTLs**, so many keys don't expire together.
- **Pre-warming** important keys after deploys.`,
      variants: [
        { label: 'Short version', answer: 'Many misses at once hit the DB. Fixes: a lock or single-flight, early refresh, jittered TTL.' },
      ],
      analogy: `When the café's only tray of muffins runs out, you don't want 50 staff all baking at once; one baker bakes while the others keep selling yesterday's batch for a few minutes.`,
      quickRevision: [
        'Hot key expires → many misses → DB overload',
        'Lock / single-flight rebuild',
        'Stale-while-revalidate, early refresh',
        'Jittered TTLs; pre-warm',
      ],
      followUps: [
        'Implement single-flight with Redis.',
        'Cache penetration vs stampede?',
      ],
    },
    {
      id: 'why-a-job-queue-bullmq',
      question: 'Why a job queue (BullMQ)?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['redis', 'realtime', 'system-design'],
      answer: `I move work **out of the request/response cycle** when it's **slow, unreliable or bursty**: sending emails, generating PDFs, calling flaky third-party APIs, processing uploads, webhooks. The API **enqueues a job and responds quickly**, and **workers** process jobs separately.

BullMQ (on Redis) gives:

- **retries with backoff**;
- **delayed and scheduled** jobs;
- **concurrency control** and **rate limiting** per queue;
- priorities;
- **failed-job tracking** (dead-letter style);
- progress events.

Workers **scale independently** of the API. At Firmwide, batch proposal uploads run in the background with a pollable batch ID, instead of keeping the request open.`,
      variants: [
        { label: 'Short version', answer: `Move slow or unreliable work (emails, PDFs, webhooks) out of the request. You get retries with backoff, delays, concurrency control and dead-letter jobs.` },
      ],
      analogy: `A ticket system at a repair shop: you drop off the item and get a ticket (job ID) immediately, the technicians work through the queue at their own pace, and they retry if a part is missing.`,
      quickRevision: [
        'Slow/unreliable work → queue',
        'Respond fast; workers process',
        'Retries + backoff, delays, concurrency, priorities',
        'Failed jobs tracked; scale workers separately',
      ],
      followUps: [
        'How do you make jobs idempotent?',
        'How does the client learn a job finished?',
        'BullMQ vs SQS?',
      ],
    },
    {
      id: 'realtime-websocket-sse-scaling',
      question: 'WebSockets vs SSE vs polling — and how do you scale Socket.IO across multiple servers?',
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
    },
    {
      id: 'socket-auth',
      question: 'Socket auth?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['auth-security', 'redis', 'realtime', 'system-design'],
      answer: `Authenticate **during the handshake**, not after connecting:

1. The client sends the access token in \`auth\` (\`io(url, { auth: { token } })\`) or relies on an httpOnly cookie.
2. A Socket.IO **middleware** (\`io.use\`) verifies the JWT, rejects invalid tokens with an error, and attaches \`socket.data.user\`.
3. On connection, **join rooms** like \`user:{id}\` and \`org:{id}\`, so the server can target notifications with \`io.to('user:42').emit(...)\`.
4. Handle **token expiry**: disconnect or ask the client to reconnect with a fresh token.
5. **Authorise each event**: being connected doesn't mean being allowed to join any room or emit anything.

That's how notifications are scoped at Firmwide.`,
      variants: [
        { label: 'Short version', answer: 'Verify the JWT in the handshake middleware and join the user to a `user:{id}` room.' },
      ],
      analogy: `Checking tickets at the venue entrance (handshake) instead of letting everyone in and checking later, then seating each guest in their own section (rooms).`,
      quickRevision: [
        'Verify the token in handshake middleware',
        'Attach user to socket.data',
        'Join user:{id} / org:{id} rooms',
        'Handle expiry; authorise each event',
      ],
      followUps: [
        'What happens when the access token expires mid-connection?',
        'How do you prevent a user joining another org\'s room?',
      ],
    },
  ],
});
