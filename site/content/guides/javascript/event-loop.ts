import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Event Loop',
  description: 'Call stack, microtasks vs macrotasks and why async code runs in the order it does.',
  questions: [
    {
      id: 'js-event-loop-microtasks-macrotasks',
      question: 'How does the JavaScript event loop work, and what is the difference between microtasks and macrotasks?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript', 'nodejs'],
      answer: `JavaScript runs on a **single call stack**. Slow work like timers, network and file I/O is handed to the browser or to libuv in Node. When that work finishes, its callback is put in a queue. The **event loop** checks whether the call stack is empty and, if it is, pushes the next callback onto it.

There are two kinds of queue:

- **Microtasks**: \`Promise.then\`, \`await\` continuations, \`queueMicrotask\`, \`MutationObserver\`. After every task, the loop **drains the whole microtask queue** before doing anything else.
- **Macrotasks**: \`setTimeout\`, \`setInterval\`, I/O callbacks, UI events, \`MessageChannel\`. The loop runs **one** of these per turn.

That's why \`Promise.resolve().then(a)\` always runs before \`setTimeout(b, 0)\`. In the browser, rendering happens between macrotasks, so a long synchronous job or an endless chain of microtasks freezes the UI.`,
      analogy: `A chef (the call stack) cooks one dish at a time. Waiters bring tickets. **VIP tickets** (microtasks) are always cleared before the next **regular ticket** (macrotask) is picked up, even if more VIP tickets keep arriving. The oven timer (\`setTimeout\`) only drops a ticket into the regular pile; it doesn't interrupt the chef.`,
      quickRevision: [
        'One call stack; async work finishes outside it and queues a callback',
        'Order: sync code → **all** microtasks → one macrotask → render (browser) → repeat',
        'Microtasks: promises, `await`, `queueMicrotask`',
        'Macrotasks: `setTimeout`, I/O, events',
        '`setTimeout(fn, 0)` means "at least 0ms", never "now"',
      ],
      deepDive: `\`\`\`js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
(async () => { await null; console.log('D'); })();
console.log('E');
// A E C D B
\`\`\``,
      followUps: [
        'What does `console.log(1); setTimeout(()=>log(2)); Promise.resolve().then(()=>log(3)); log(4)` print?',
        'Where do `process.nextTick` and `setImmediate` fit in Node?',
        'How can microtasks starve rendering?',
        'How would you break up a long-running loop so the UI stays responsive?',
      ],
    },
    {
      id: 'is-javascript-multi-threaded',
      question: 'Is JavaScript single-threaded? Then how does it handle many things at once?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript', 'nodejs'],
      answer: `**Your JavaScript code runs on one thread**: one call stack, one thing at a time. But the **runtime around it is multi-threaded**. The browser has threads for networking, timers and rendering; Node has **libuv**, which uses the OS's async I/O and a small **thread pool** (file system, DNS, crypto, compression).

So JS gets **concurrency without parallelism**: you start an operation, the runtime does the waiting elsewhere, and the callback comes back through the event loop when it's done. That's why one Node process can hold thousands of open connections: almost all of that time is waiting on I/O, not running JS.

When you need **real parallel JS** for CPU-heavy work (image processing, parsing big files, heavy maths), you use **Web Workers** in the browser or **\`worker_threads\`** in Node. Workers have their own event loop and memory, and communicate by **message passing** (or \`SharedArrayBuffer\` with \`Atomics\` for shared memory).`,
      analogy: `One cashier (your JS thread) with a back office of helpers (browser/libuv threads) who handle deliveries and phone calls, then leave notes for the cashier.`,
      quickRevision: [
        'Your JS runs on **one** thread',
        'The runtime uses other threads for I/O, timers, networking',
        'Concurrency (interleaving) ≠ parallelism',
        'Real parallel JS: Web Workers / `worker_threads`',
        'Workers share no memory by default: message passing',
      ],
      followUps: [
        'When would you use a Web Worker?',
        'What does libuv\'s thread pool handle?',
        'What is `SharedArrayBuffer` for?',
      ],
    },
    {
      id: 'why-can-settimeoutfn-0-still-be-delayed',
      question: 'Why can `setTimeout(fn, 0)` run much later than 0 ms?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `The delay is a **minimum**, not a schedule. \`setTimeout(fn, 0)\` puts \`fn\` in the **macrotask queue** once the timer expires, and it only runs when:

1. the **current synchronous code** has finished,
2. **every pending microtask** has run (promise callbacks, \`await\` continuations), and
3. any **macrotasks ahead of it** in line have run.

On top of that, browsers **clamp nested timers** to at least about 4 ms after a few levels of nesting, and **throttle timers in background tabs** to once per second or less. So a busy main thread, a long promise chain, or an inactive tab can all push a "0 ms" timer back noticeably.

It's still useful for **yielding**: deferring work until after the current task, letting the browser render in between. For animation I use \`requestAnimationFrame\` instead, and for breaking up heavy work, chunking with \`setTimeout\`/\`scheduler.yield()\` or moving it to a Web Worker.`,
      analogy: `Booking "the next available table" doesn't mean you sit now; you wait until the current diners (sync code and microtasks) are done.`,
      quickRevision: [
        '0 means "minimum delay", not "immediately"',
        'Waits for sync code and **all** microtasks',
        'Nested timers clamp to ~4 ms; background tabs throttle',
        'Use it to yield; use `requestAnimationFrame` for animation',
      ],
      deepDive: `\`\`\`js
// Long work blocks every timer and every render
function processInChunks(items, handle, chunkSize = 500) {
  let i = 0;
  function next() {
    const end = Math.min(i + chunkSize, items.length);
    for (; i < end; i++) handle(items[i]);
    if (i < items.length) setTimeout(next, 0); // yield so the browser can paint
  }
  next();
}
\`\`\``,
      followUps: [
        'How would you yield to the browser to stay responsive?',
        'What is `requestAnimationFrame` for?',
        'Why are timers slower in background tabs?',
      ],
    },
    {
      id: 'request-animation-frame',
      question: 'Where do rendering and `requestAnimationFrame` fit into the event loop?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript', 'performance'],
      answer: `In the browser, after a macrotask and its microtasks finish, the loop **may render a frame**. It does that roughly every 16 ms on a 60 Hz screen, and only when something changed. The rendering step runs, in order: **\`requestAnimationFrame\` callbacks**, then **style recalculation, layout, and paint**.

So \`requestAnimationFrame(cb)\` means "run \`cb\` right **before the next paint**". That makes it the right place for visual updates and JS animations: your change lands exactly once per frame, in sync with the screen, and it **pauses automatically in background tabs**. A \`setTimeout\`-based animation drifts against the frame rate and can update twice per frame or skip frames.

It also explains jank: if a task or a microtask chain takes longer than a frame, the render step simply can't happen, and the page freezes. The fix is keeping tasks short (chunking, Web Workers) and **batching DOM reads before writes** inside one frame to avoid forced layout.`,
      analogy: `A train that leaves every 16 ms: \`requestAnimationFrame\` is a guaranteed seat on the next train; \`setTimeout\` is turning up at the station whenever and hoping one is there.`,
      quickRevision: [
        'Render step can happen after a task + its microtasks',
        'Order in a frame: rAF callbacks → style → layout → paint',
        'rAF = run right before the next paint, once per frame',
        'Paused in background tabs; better than `setTimeout` for animation',
        'Long tasks block the frame → jank',
      ],
      followUps: [
        'What is layout thrashing and how do you avoid it?',
        'How is `requestIdleCallback` different?',
        'Why do CSS transforms animate more smoothly than `top`/`left`?',
      ],
    },
  ],
});
