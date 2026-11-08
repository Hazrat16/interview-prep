import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/nodejs-runtime.md', {
  'single-threaded--how-does-it-handle-multiple-tasks': {
    sameAs: 'javascript/nodejs-runtime/node-is-single-threaded--how-does-it-handle-many-requests',
  },
  'what-is-nodejs': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'Node takes the JavaScript engine out of the browser and puts it in a server room, adding tools for files, networks and processes.',
    quickRevision: [
      'JS runtime built on V8 + libuv',
      'Event-driven, non-blocking I/O',
      'Great for APIs, real-time, tooling',
      'Not ideal for heavy CPU work on the main thread',
    ],
    followUps: ['What does libuv do?', 'Node vs browser JavaScript?'],
  },
  'node-is-single-threaded--how-does-it-handle-many-requests': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: 'One waiter takes orders and hands them to the kitchen instead of cooking each meal personally, so they can serve many tables while food cooks.',
    quickRevision: [
      'Requests mostly wait on I/O (DB, network)',
      'I/O is delegated to the OS / libuv thread pool',
      'Callbacks resume on the event loop when ready',
      'CPU-heavy work blocks everyone → workers or queues',
    ],
    followUps: ['What blocks the event loop?', 'How do you use all CPU cores?', 'How do you detect event-loop lag?'],
  },
  'is-nodejs-single-threaded-completely': {
    difficulty: 'medium',
    analogy: 'The manager (your JS) works alone at the front desk, but there\'s a back office (libuv thread pool + OS) quietly doing file, DNS and crypto work.',
    quickRevision: [
      'Your JS: one main thread',
      'libuv thread pool (default 4): fs, dns.lookup, crypto, zlib',
      'Network I/O uses OS async APIs (epoll/kqueue)',
      'Worker Threads give you extra JS threads',
    ],
    followUps: ['What is `UV_THREADPOOL_SIZE`?', 'Why can heavy `bcrypt` calls slow down file reads?'],
  },
  'what-blocks-the-node-event-loop': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'One person hogging the only checkout counter: big loops, sync file reads or giant JSON parsing make everyone else in the queue wait.',
    quickRevision: [
      'Sync APIs: `readFileSync`, `bcrypt.hashSync`, `crypto.*Sync`',
      'Large `JSON.parse`/`stringify`, heavy loops, regex backtracking',
      'Fix: async APIs, streaming, chunking with `setImmediate`',
      'CPU work → Worker Threads or a job queue',
    ],
    followUps: ['How would you measure event-loop delay?', 'What is ReDoS?'],
  },
  'difference-between-setimmediate-and-settimeoutfn-0': {
    difficulty: 'hard',
    analogy: 'Two buses from different stops: in the main script it depends on timing which arrives first; inside an I/O callback, the `setImmediate` stop (check phase) always comes next.',
    quickRevision: [
      '`setTimeout(0)` → timers phase; `setImmediate` → check phase',
      'Main module: order is not guaranteed',
      'Inside an I/O callback: `setImmediate` always first',
      '`process.nextTick` and promises run before both',
    ],
    followUps: ['Name the Node event-loop phases.', 'Why can `nextTick` starve I/O?'],
  },
  'when-would-you-use-worker-threads': {
    difficulty: 'medium',
    analogy: 'Hiring a specialist for the heavy lifting so the receptionist (main thread) can keep answering the phone.',
    quickRevision: [
      'CPU-bound tasks: image processing, PDF generation, hashing, big parsing',
      'Not for I/O (async already handles it)',
      'Communicate via messages; share memory only with SharedArrayBuffer',
      'Alternatives: job queue + separate worker process',
    ],
    followUps: ['Worker Threads vs `cluster`?', 'Worker Threads vs a BullMQ queue?'],
  },
  'why-is-node-popular-for-apis': {
    difficulty: 'easy',
    analogy: 'A switchboard operator who connects many calls quickly: perfect when most of the job is waiting and routing, not heavy thinking.',
    quickRevision: [
      'Non-blocking I/O handles many concurrent connections',
      'One language across frontend and backend; shared types',
      'Huge npm ecosystem; fast to build JSON APIs',
      'Great for real-time (WebSockets)',
    ],
    followUps: ['When would you not choose Node?', 'Express vs Fastify vs NestJS?'],
  },
});
