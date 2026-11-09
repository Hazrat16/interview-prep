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
      question: 'How do you handle CPU-heavy work in a Node.js API?',
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
      question: 'What are streams in Node.js, and when do you use them?',
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
      question: 'What happens with unhandled promise rejections in Node.js, and how do you handle them?',
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
      question: 'How do you implement graceful shutdown in a Node.js server?',
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
      question: 'What is clustering in Node.js, and how does it compare to running multiple containers?',
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
      question: 'What is Node.js, and how is it different from JavaScript in the browser?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['nodejs'],
      answer: `Node.js is a **JavaScript runtime** for running JS outside the browser. It combines Google's **V8** engine (which compiles and runs the JavaScript) with **libuv**, a C library that provides the **event loop** and **non-blocking I/O**, plus built-in modules for the file system, networking, processes, crypto and streams.

Its model is **event-driven, non-blocking I/O** on a single JS thread: you start an operation (read a file, query a database, call an API), Node hands the waiting to the OS or libuv's thread pool, and your callback runs when the result is ready. That lets one process handle **thousands of concurrent connections** with little memory.

Compared with the browser it's the same language but a **different environment**:

- **No DOM, \`window\` or \`document\`**, but there's \`process\`, \`Buffer\`, \`fs\`, \`http\` and \`globalThis\`.
- **Full system access**: files, network sockets, environment variables, child processes. There's no sandbox, so security is your job.
- **Modules**: CommonJS (\`require\`) and ES modules (\`import\`).
- **You control the version**, so you can use modern features without worrying about users' browsers.`,
      analogy: `Node takes the JavaScript engine out of the browser and puts it in a server room, adding tools for files, networks and processes.`,
      quickRevision: [
        'V8 (runs JS) + libuv (event loop, async I/O) + core modules',
        'Event-driven, non-blocking I/O on one JS thread',
        'Great for I/O-heavy APIs and real-time; weak for CPU-heavy work',
        'No DOM/window; has process, fs, http, Buffer',
        'Full system access, no browser sandbox',
      ],
      followUps: [
        'What does libuv do?',
        'CommonJS vs ES modules?',
        'When would you not choose Node?',
      ],
    },
    {
      id: 'node-is-single-threaded-how-does-it-handle-many-requests',
      question: 'If Node.js is single-threaded, how does it handle thousands of concurrent requests?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['nodejs'],
      answer: `Because a typical request spends almost all its time **waiting**, not computing. It waits for the database, another API, the file system or the network. Node never makes the JS thread do that waiting.

When a request handler calls \`await db.query(…)\`, Node **hands the I/O to libuv**, which uses the OS's async mechanisms (\`epoll\`/\`kqueue\`) for network sockets and its **thread pool** for things like file access. The handler's function is suspended, the call stack is free, and the **event loop picks up the next ready callback**, often a different request. When the database answers, the continuation is queued and runs. So one thread interleaves thousands of requests, each using a few milliseconds of actual CPU time.

That's **concurrency, not parallelism**, and it has a clear limit: if a handler does **heavy synchronous CPU work** (big loops, image processing, \`bcrypt.hashSync\`), it holds the only JS thread and every other request waits. So for CPU-heavy work I use worker threads or a job queue, and to use **all CPU cores** I run several Node processes (\`cluster\`, PM2, or more containers behind a load balancer).`,
      analogy: `One waiter takes orders and hands them to the kitchen instead of cooking each meal personally, so they can serve many tables while food cooks.`,
      quickRevision: [
        'Requests mostly wait on I/O (DB, network)',
        'I/O delegated to the OS / libuv; the JS thread moves on',
        'Event loop runs whichever callback is ready → interleaving',
        'Concurrency, not parallelism',
        'CPU-heavy work blocks everyone → workers/queues; cores → more processes',
      ],
      followUps: [
        'What blocks the event loop?',
        'How do you use all CPU cores?',
        'How do you detect event-loop lag?',
      ],
    },
    {
      id: 'is-nodejs-single-threaded-completely',
      question: 'Is Node.js completely single-threaded? What does the libuv thread pool do?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `No. **Your JavaScript runs on one main thread**, but Node itself uses several threads:

- **Network I/O** (HTTP, TCP sockets, database connections) doesn't use extra threads at all. libuv uses the **OS's async mechanisms** (\`epoll\` on Linux, \`kqueue\` on macOS, IOCP on Windows), so one thread can watch thousands of sockets.
- Operations the OS can't do asynchronously go to libuv's **thread pool**, **4 threads by default**: most **\`fs\`** operations, **\`dns.lookup\`**, **\`crypto\`** functions like \`pbkdf2\`, \`scrypt\` and \`randomBytes\`, and **\`zlib\`** compression.
- V8 also has background threads for garbage collection and compilation.

The practical consequence: the pool is **shared and small**. If you fire off many expensive \`bcrypt\`/\`pbkdf2\` hashes, they occupy all four threads and unrelated **file reads queue behind them**. You can raise it with **\`UV_THREADPOOL_SIZE\`** (set before startup), but for real CPU-heavy work the answer is **\`worker_threads\`**, a separate job-queue worker, or scaling out with multiple processes.`,
      analogy: `The manager (your JS) works alone at the front desk, but there's a back office (libuv thread pool + OS) quietly doing file, DNS and crypto work.`,
      quickRevision: [
        'Your JS: one main thread',
        'Network I/O: OS async APIs (epoll/kqueue), no extra threads',
        'libuv pool (default 4): fs, dns.lookup, crypto, zlib',
        'Heavy crypto can starve file I/O in the shared pool',
        '`UV_THREADPOOL_SIZE`, worker_threads, or more processes',
      ],
      followUps: [
        'What is `UV_THREADPOOL_SIZE`?',
        'Why can heavy `bcrypt` calls slow down file reads?',
        'Why doesn\'t network I/O need the thread pool?',
      ],
    },
    {
      id: 'what-blocks-the-node-event-loop',
      question: 'What blocks the Node.js event loop, and how do you detect and fix it?',
      section: 'Runtime internals',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript', 'nodejs'],
      answer: `Anything that keeps the **main thread busy with synchronous work**. While it runs, Node can't accept connections, run callbacks or respond to any other request, so **latency spikes for every user** of that process, not just the one who triggered it.

Common culprits:

- **\`*Sync\` APIs** in request paths: \`fs.readFileSync\`, \`crypto.pbkdf2Sync\`, \`bcrypt.hashSync\`, \`execSync\`.
- **CPU-heavy JavaScript**: big loops, sorting or transforming large arrays, image or PDF work, complex calculations.
- **Huge \`JSON.parse\`/\`JSON.stringify\`** of multi-megabyte payloads.
- **Catastrophic regex backtracking** (ReDoS) on user input.

To **detect** it: measure event-loop lag with \`perf_hooks.monitorEventLoopDelay\` (or your APM), watch for p99 latency spikes alongside high CPU, and profile with \`node --cpu-prof\` or clinic.js to find the hot function.

To **fix** it: use the async APIs; **stream** large data instead of loading it whole; **paginate** big queries; split long loops into chunks with \`setImmediate\`; and move genuinely CPU-bound work to **\`worker_threads\`** or a **background job queue** (BullMQ) so the API thread only does I/O.`,
      analogy: `One person hogging the only checkout counter: big loops, sync file reads or giant JSON parsing make everyone else in the queue wait.`,
      quickRevision: [
        'Blocking = sync work on the main thread → every request waits',
        'Culprits: *Sync APIs, heavy loops, giant JSON, ReDoS',
        'Detect: event-loop delay metrics, CPU profiles',
        'Fix: async APIs, streaming, pagination, chunking',
        'CPU work → worker_threads or a job queue',
      ],
      deepDive: `\`\`\`js
const { monitorEventLoopDelay } = require('node:perf_hooks');
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();
setInterval(() => {
  console.log('event loop p99 delay (ms):', h.percentile(99) / 1e6);
  h.reset();
}, 10_000);
\`\`\``,
      followUps: [
        'How would you measure event-loop delay?',
        'What is ReDoS?',
        'Worker threads vs a job queue?',
      ],
    },
    {
      id: 'difference-between-setimmediate-and-settimeoutfn-0',
      question: `What are the phases of the Node.js event loop, and where do \`setTimeout\`, \`setImmediate\` and \`process.nextTick\` run?`,
      section: 'Runtime internals',
      perspective: 'trade-off',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `Each turn of Node's event loop goes through phases in order:

1. **Timers**: callbacks from \`setTimeout\`/\`setInterval\` whose time has passed.
2. **Pending callbacks**: some deferred system-level I/O callbacks.
3. **Poll**: wait for new I/O events and run their callbacks (most of your I/O callbacks run here).
4. **Check**: \`setImmediate\` callbacks.
5. **Close callbacks**: \`'close'\` events, like a socket closing.

Separately, after **every callback** (between and within phases), Node drains two queues: first **\`process.nextTick\`**, then **promise microtasks**.

So \`setTimeout(fn, 0)\` runs in the timers phase and \`setImmediate\` in the check phase. From the main module, which fires first **isn't guaranteed**: it depends on whether the timer's 1 ms minimum has elapsed when the loop starts. **Inside an I/O callback**, \`setImmediate\` **always** wins, because check comes right after poll.

I use \`setImmediate\` to **yield** after I/O so other work can run, and keep \`nextTick\` for rare cases, since a recursive \`nextTick\` can **starve** the loop.`,
      analogy: `Two buses from different stops: in the main script it depends on timing which arrives first; inside an I/O callback, the \`setImmediate\` stop (check phase) always comes next.`,
      quickRevision: [
        'Phases: timers → pending → poll → check → close',
        '`setTimeout` → timers; `setImmediate` → check',
        'nextTick queue, then promises, after every callback',
        'Main module: timeout vs immediate order not guaranteed',
        'Inside I/O callback: setImmediate first',
      ],
      followUps: [
        'Name the Node event-loop phases.',
        'Why can `nextTick` starve I/O?',
        'When would you use `setImmediate`?',
      ],
    },
    {
      id: 'when-would-you-use-worker-threads',
      question: 'When would you use Worker Threads in Node, and what are the alternatives?',
      section: 'Runtime internals',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `When there's **CPU-bound work** that would otherwise block the event loop: resizing images, generating PDFs, hashing or encryption in bulk, parsing or transforming very large files, heavy calculations. Each worker runs JavaScript on its **own thread with its own event loop and V8 isolate**, so the main thread keeps serving requests.

I **don't** use workers for I/O: database queries, HTTP calls and file reads are already non-blocking, and workers would only add overhead.

Things to know when using them:

- Communication is by **message passing** (\`postMessage\`), which copies data. Large binary data can be **transferred** (\`ArrayBuffer\`) or shared via \`SharedArrayBuffer\`.
- Starting a worker is relatively expensive, so use a **pool** (e.g. Piscina) rather than one worker per request.

Alternatives, depending on the job:

- A **job queue** (BullMQ + Redis) with **separate worker processes**, when the work can be **asynchronous** (send the result later) and should survive restarts, be retried and scale independently. This is my usual choice for things like report generation.
- **\`cluster\`** or multiple containers behind a load balancer, to use **all CPU cores for request handling**, which is a different goal from offloading one heavy task.`,
      analogy: `Hiring a specialist for the heavy lifting so the receptionist (main thread) can keep answering the phone.`,
      quickRevision: [
        'Workers for CPU-bound tasks, not I/O',
        'Own thread, event loop and isolate; message passing',
        'Use a pool (Piscina); transfer/share buffers for big data',
        'Async, retryable work → job queue (BullMQ) + worker processes',
        '`cluster`/containers = more cores for requests, different goal',
      ],
      followUps: [
        'Worker Threads vs `cluster`?',
        'Worker Threads vs a BullMQ queue?',
        'How do workers share memory?',
      ],
    },
    {
      id: 'why-is-node-popular-for-apis',
      question: 'Why is Node.js a popular choice for APIs, and when would you not choose it?',
      section: 'Runtime internals',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['nodejs'],
      answer: `Most API work is **I/O**: wait for the database, call another service, return JSON. Node's **non-blocking, event-driven model** handles that very efficiently: one process can keep thousands of requests in flight while they wait, using little memory per connection.

Other reasons teams pick it:

- **One language across the stack**: JavaScript/TypeScript on frontend and backend, so you can **share types and validation schemas** (Zod) and move between layers easily.
- **Huge npm ecosystem** and fast development of JSON APIs with Express, Fastify or NestJS.
- **Real-time**: WebSockets and server-sent events are natural in its event model.
- It powers **SSR frameworks** like Next.js, so the same team can run the BFF.

When I **wouldn't** choose it: **CPU-heavy** services (video encoding, ML inference, heavy numeric work), where Go, Rust, Java or Python with native libraries fit better; or teams with strong expertise and libraries in another ecosystem. Node can offload CPU work to workers, but if that's the core of the service, it's fighting the model.`,
      analogy: `A switchboard operator who connects many calls quickly: perfect when most of the job is waiting and routing, not heavy thinking.`,
      quickRevision: [
        'Non-blocking I/O → many concurrent requests cheaply',
        'One language + shared types/schemas across the stack',
        'Big ecosystem; Express/Fastify/NestJS',
        'Natural fit for real-time and SSR/BFF',
        'Avoid for CPU-heavy core workloads',
      ],
      followUps: [
        'When would you not choose Node?',
        'Express vs Fastify vs NestJS?',
        'How do you scale a Node API across cores?',
      ],
    },
  ],
});
