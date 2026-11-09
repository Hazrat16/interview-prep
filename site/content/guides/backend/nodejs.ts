import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Node.js Core & Runtime',
  description: 'libuv, the event loop phases, streams, worker threads and the core APIs.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'javascript/output-prediction/node-nexttick-vs-promise-vs-setimmediate',
  ],
  questions: [
    {
      id: 'node-single-thread-concurrency',
      question: 'Node.js is single-threaded — how does it handle thousands of concurrent requests?',
      section: 'Core APIs',
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
    },
    {
      id: 'how-do-you-handle-cpu-heavy-work',
      question: 'How do you handle CPU-heavy work?',
      section: 'Core APIs',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['nodejs'],
      answer: `CPU-heavy work (image resizing, PDF generation, big parsing, hashing) **blocks the event loop**, so every other request waits. My options, depending on the case:

1. **Move it out of the request**: put a job on a **queue** (BullMQ, SQS), return \`202 Accepted\` with a job ID, and let a separate **worker process** do the work. The client polls or gets a notification. This is my default for anything slow.
2. **\`worker_threads\`** when it must happen in the same service, ideally with a worker pool (Piscina).
3. A **separate service** in a better-suited language, or a managed service (Lambda), when it's a big, independent workload.

Also: use async versions of crypto and zlib, and stream large data instead of buffering it.`,
      variants: [
        { label: 'Short version', answer: '`worker_threads`, offload to a job queue (BullMQ), or a separate service.' },
      ],
      analogy: `A restaurant doesn't let the waiter bake a wedding cake at the table: the order goes to the back kitchen (queue + worker), and the waiter keeps serving.`,
      quickRevision: [
        'CPU work blocks the event loop',
        'Default: queue + worker, return 202 + job ID',
        'worker_threads (pool) for in-process work',
        'Async crypto/zlib; stream big data',
      ],
      followUps: [
        'How does the client learn the job finished?',
        'worker_threads vs child_process vs cluster?',
        'How would you retry failed jobs?',
      ],
    },
    {
      id: 'streams',
      question: 'Streams?',
      section: 'Core APIs',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['nodejs'],
      answer: `Streams process data **in chunks** instead of loading it all into memory. Types: **Readable** (file read, HTTP request), **Writable** (file write, HTTP response), **Transform** (gzip, CSV parsing) and **Duplex** (sockets).

They matter for **large files, uploads, exports and proxies**: memory stays flat whether the file is 1MB or 5GB. The key concept is **backpressure**: if the writer is slower than the reader, the reader must pause. \`stream.pipeline()\` (or \`pipeline\` from \`stream/promises\`) wires streams together, **handles backpressure** and **propagates errors and cleanup**, which \`.pipe()\` alone doesn't.`,
      variants: [
        { label: 'Short version', answer: `Process data in chunks (readable, writable, transform, duplex). Used for big files and uploads. \`pipeline()\` handles backpressure and errors.` },
      ],
      analogy: `Drinking through a straw instead of trying to swallow the whole bottle at once; backpressure is pausing when your mouth is full.`,
      quickRevision: [
        'Chunks, constant memory',
        'Readable / Writable / Transform / Duplex',
        'Backpressure = slow consumer pauses producer',
        'Use `pipeline()` for errors + cleanup',
      ],
      followUps: [
        'Stream a large CSV export from the database.',
        'What happens if you ignore backpressure?',
      ],
    },
    {
      id: 'js-esm-vs-commonjs',
      question: 'ES Modules vs CommonJS — what is the difference and why does it matter in Node?',
      section: 'Core APIs',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript', 'nodejs'],
      answer: `**CommonJS** (\`require\` / \`module.exports\`) is Node's original system. It loads **synchronously at runtime**, \`require\` can be called anywhere, and you get a **copy** of exported values.

**ES Modules** (\`import\` / \`export\`) is the standard. Imports are **static** and resolved before the code runs, which allows **tree-shaking** and top-level \`await\`. Loading is asynchronous, and imports are **live bindings**.

Why it matters in practice:

- In Node, a file is ESM if it ends in \`.mjs\` or \`package.json\` has \`"type": "module"\`. Otherwise it's CJS.
- ESM can import CJS. CJS loading ESM historically needed \`await import()\` (newer Node versions support \`require(esm)\` for synchronous modules).
- \`__dirname\` and \`require\` don't exist in ESM; use \`import.meta.url\` / \`import.meta.dirname\`.
- Bundlers can only tree-shake ESM reliably, so libraries ship ESM for smaller frontend bundles.`,
      analogy: `CommonJS is ordering at a counter: you ask (\`require\`) whenever you like and wait right there. ESM is a pre-booked set menu: the kitchen sees the whole order up front (static imports), so it can skip dishes nobody ordered (tree-shaking) and prepare in parallel.`,
      quickRevision: [
        'CJS: `require`, sync, dynamic, value copies',
        'ESM: `import`, static, async, live bindings, tree-shakeable',
        'Node picks the system from `.mjs`/`.cjs` or `"type"` in package.json',
        'ESM has no `__dirname`; use `import.meta`',
        'Dynamic `import()` works in both',
      ],
      followUps: [
        'What is tree-shaking and why does it need static imports?',
        'How would you publish a library that supports both?',
        'What is a circular dependency and how do both systems handle it?',
      ],
    },
    {
      id: 'unhandled-rejections',
      question: 'Unhandled rejections?',
      section: 'Core APIs',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `An unhandled rejection is a promise that rejects with **no \`.catch\` or \`try/catch\`** anywhere. Since **Node 15** the default is to **crash the process**, because continuing in an unknown state is risky.

What I do:

- handle errors at the right level (a \`try/catch\` in async handlers, plus Express 5 or a wrapper to forward them to error middleware);
- add a **process-level** \`unhandledRejection\` and \`uncaughtException\` handler that **logs with context** (Sentry) and then **exits gracefully**;
- let the orchestrator (ECS, Kubernetes, PM2) **restart** the process.

Never swallow errors and keep running.`,
      variants: [
        { label: 'Short version', answer: 'Since Node 15 the process crashes by default. Always handle them, and log and exit gracefully.' },
      ],
      analogy: `An alarm nobody answers: Node now treats it as a fire and evacuates (crashes), so you'd better have someone assigned to every alarm and a building manager who logs it and restarts safely.`,
      quickRevision: [
        'Rejection with no handler',
        'Node 15+: crashes by default',
        'Handle locally; global handler logs then exits',
        'Orchestrator restarts the process',
      ],
      followUps: [
        'Why exit instead of continuing?',
        'How do you avoid dropping in-flight requests when exiting?',
      ],
    },
    {
      id: 'graceful-shutdown',
      question: 'Graceful shutdown?',
      section: 'Core APIs',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['nodejs'],
      answer: `When the platform stops a container it sends **\`SIGTERM\`**, waits for a grace period, then sends \`SIGKILL\`. Graceful shutdown means:

1. **Stop accepting new connections** (\`server.close()\`) and fail the readiness or health check, so the load balancer stops routing traffic.
2. **Finish in-flight requests** and jobs (with a timeout).
3. **Close resources**: database pools, Redis, queue workers, sockets.
4. **Exit** with code 0, or force-exit after the timeout.

This is what makes rolling deployments on ECS or Kubernetes **zero-downtime**: users don't see dropped requests.`,
      variants: [
        { label: 'Short version', answer: `On \`SIGTERM\`: stop accepting connections, finish in-flight requests, close DB and Redis, then exit. Important in ECS and Kubernetes.` },
      ],
      analogy: `Closing a shop at the end of the day: lock the front door to new customers, serve the people already inside, cash up, then turn off the lights.`,
      quickRevision: [
        'SIGTERM → grace period → SIGKILL',
        'Stop accepting + fail health check',
        'Finish in-flight work with a timeout',
        'Close DB/Redis/queues, then exit',
      ],
      followUps: [
        'How do you handle long-running WebSocket connections on shutdown?',
        'What is a readiness probe?',
      ],
    },
    {
      id: 'clustering',
      question: 'Clustering?',
      section: 'Core APIs',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `One Node process uses **one CPU core** for JavaScript. The \`cluster\` module (or **PM2 cluster mode**) forks **one worker per core** behind a shared port, so a VM can use all its cores and survive a worker crash.

In **containers**, the usual practice is **one process per container**, and you scale by running **more containers** (ECS tasks, Kubernetes pods) behind a load balancer. The orchestrator then handles restarts, health checks and autoscaling. Either way the app must be **stateless** (sessions in Redis, files in S3), and Socket.IO needs the Redis adapter.`,
      variants: [
        { label: 'Short version', answer: `\`cluster\` / PM2 run one process per core. In containers, usually run one process per container and scale containers instead.` },
      ],
      analogy: `One chef can only cook at one stove; clustering opens a stove per chef in the same kitchen, while containers open more identical kitchens.`,
      quickRevision: [
        'One Node process ≈ one core for JS',
        'cluster / PM2: one worker per core',
        'Containers: one process each, scale out',
        'Must be stateless',
      ],
      followUps: [
        'What breaks when you run two instances?',
        'cluster vs worker_threads?',
      ],
    },
    {
      id: 'what-is-nodejs',
      question: 'What is Node.js?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['nodejs'],
      answer: `> Node.js is a JavaScript runtime built on V8 that lets us run JS on the server. It provides APIs for filesystem, networking, and processes, and uses an event-driven non-blocking I/O model through libuv.`,
      analogy: `Node takes the JavaScript engine out of the browser and puts it in a server room, adding tools for files, networks and processes.`,
      quickRevision: [
        'JS runtime built on V8 + libuv',
        'Event-driven, non-blocking I/O',
        'Great for APIs, real-time, tooling',
        'Not ideal for heavy CPU work on the main thread',
      ],
      followUps: [
        'What does libuv do?',
        'Node vs browser JavaScript?',
      ],
    },
    {
      id: 'node-is-single-threaded-how-does-it-handle-many-requests',
      question: 'Node is single-threaded — how does it handle many requests?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['nodejs'],
      answer: `> JavaScript on the main thread is single-threaded, so only one JS callback runs at a time. Node still handles many concurrent requests because I/O operations are non-blocking: while one request waits on a database or network, the event loop can process other requests. libuv and the OS handle the waiting work in the background, and some tasks use a thread pool.`,
      analogy: `One waiter takes orders and hands them to the kitchen instead of cooking each meal personally, so they can serve many tables while food cooks.`,
      quickRevision: [
        'Requests mostly wait on I/O (DB, network)',
        'I/O is delegated to the OS / libuv thread pool',
        'Callbacks resume on the event loop when ready',
        'CPU-heavy work blocks everyone → workers or queues',
      ],
      followUps: [
        'What blocks the event loop?',
        'How do you use all CPU cores?',
        'How do you detect event-loop lag?',
      ],
    },
    {
      id: 'is-nodejs-single-threaded-completely',
      question: 'Is Node.js single-threaded completely?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `> The JavaScript execution is single-threaded, but Node is not literally one OS thread overall. libuv maintains a thread pool for certain operations, and the OS may use multiple threads for I/O. Worker threads and child processes can add more parallelism when needed.`,
      analogy: `The manager (your JS) works alone at the front desk, but there's a back office (libuv thread pool + OS) quietly doing file, DNS and crypto work.`,
      quickRevision: [
        'Your JS: one main thread',
        'libuv thread pool (default 4): fs, dns.lookup, crypto, zlib',
        'Network I/O uses OS async APIs (epoll/kqueue)',
        'Worker Threads give you extra JS threads',
      ],
      followUps: [
        'What is `UV_THREADPOOL_SIZE`?',
        'Why can heavy `bcrypt` calls slow down file reads?',
      ],
    },
    {
      id: 'what-blocks-the-node-event-loop',
      question: 'What blocks the Node event loop?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript', 'nodejs'],
      answer: `> Synchronous CPU-heavy code, \`*Sync\` I/O methods, and long loops block the event loop. While blocked, Node can’t process other callbacks, so latency spikes for all clients on that process.`,
      analogy: `One person hogging the only checkout counter: big loops, sync file reads or giant JSON parsing make everyone else in the queue wait.`,
      quickRevision: [
        'Sync APIs: `readFileSync`, `bcrypt.hashSync`, `crypto.*Sync`',
        'Large `JSON.parse`/`stringify`, heavy loops, regex backtracking',
        'Fix: async APIs, streaming, chunking with `setImmediate`',
        'CPU work → Worker Threads or a job queue',
      ],
      followUps: [
        'How would you measure event-loop delay?',
        'What is ReDoS?',
      ],
    },
    {
      id: 'difference-between-setimmediate-and-settimeoutfn-0',
      question: 'Difference between `setImmediate` and `setTimeout(fn, 0)`?',
      section: 'Runtime internals',
      perspective: 'trade-off',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `> Both schedule a callback soon, but they queue in different phases. In many I/O callback contexts, \`setImmediate\` runs before \`setTimeout(..., 0)\`. Exact ordering can depend on context; the key interview point is they are different timers with different event-loop phases.`,
      analogy: `Two buses from different stops: in the main script it depends on timing which arrives first; inside an I/O callback, the \`setImmediate\` stop (check phase) always comes next.`,
      quickRevision: [
        '`setTimeout(0)` → timers phase; `setImmediate` → check phase',
        'Main module: order is not guaranteed',
        'Inside an I/O callback: `setImmediate` always first',
        '`process.nextTick` and promises run before both',
      ],
      followUps: [
        'Name the Node event-loop phases.',
        'Why can `nextTick` starve I/O?',
      ],
    },
    {
      id: 'when-would-you-use-worker-threads',
      question: 'When would you use Worker Threads?',
      section: 'Runtime internals',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `> When work is CPU-bound — image processing, heavy encryption, large JSON transforms — and would otherwise freeze the event loop. I/O-bound workloads usually don’t need workers; the event loop already handles those well.`,
      analogy: `Hiring a specialist for the heavy lifting so the receptionist (main thread) can keep answering the phone.`,
      quickRevision: [
        'CPU-bound tasks: image processing, PDF generation, hashing, big parsing',
        'Not for I/O (async already handles it)',
        'Communicate via messages; share memory only with SharedArrayBuffer',
        'Alternatives: job queue + separate worker process',
      ],
      followUps: [
        'Worker Threads vs `cluster`?',
        'Worker Threads vs a BullMQ queue?',
      ],
    },
    {
      id: 'why-is-node-popular-for-apis',
      question: 'Why is Node popular for APIs?',
      section: 'Runtime internals',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `> It’s strong for I/O-heavy, concurrent workloads like APIs and real-time apps, uses one language across stack with JavaScript/TypeScript, has a huge package ecosystem, and non-blocking I/O helps serve many connections efficiently on a single process.`,
      analogy: `A switchboard operator who connects many calls quickly: perfect when most of the job is waiting and routing, not heavy thinking.`,
      quickRevision: [
        'Non-blocking I/O handles many concurrent connections',
        'One language across frontend and backend; shared types',
        'Huge npm ecosystem; fast to build JSON APIs',
        'Great for real-time (WebSockets)',
      ],
      followUps: [
        'When would you not choose Node?',
        'Express vs Fastify vs NestJS?',
      ],
    },
  ],
});
