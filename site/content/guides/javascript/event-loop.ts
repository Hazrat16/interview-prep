import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Event Loop',
  description: 'Call stack, microtasks vs macrotasks and why async code runs in the order it does.',
  questions: [
    {
      id: 'js-event-loop-microtasks-macrotasks',
      question: `How does the JavaScript event loop work, and what is the difference between microtasks and macrotasks?`,
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
        `What does \`console.log(1); setTimeout(()=>log(2)); Promise.resolve().then(()=>log(3)); log(4)\` print?`,
        'Where do `process.nextTick` and `setImmediate` fit in Node?',
        'How can microtasks starve rendering?',
        'How would you break up a long-running loop so the UI stays responsive?',
      ],
    },
    {
      id: 'what-is-the-event-loop',
      question: 'What is the event loop?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> The event loop is the mechanism that coordinates the call stack and task queues. When the call stack is empty, it takes the next task and executes it. This lets JavaScript stay single-threaded for JS execution while still handling asynchronous operations like timers and I/O.`,
      analogy: `A chef (call stack) cooks one dish at a time; waiters drop finished-order tickets into trays, and the chef only picks up the next ticket when the current dish is done.`,
      quickRevision: [
        'One call stack runs JS',
        'Async work finishes outside it and queues a callback',
        'Loop: stack empty → run all microtasks → one macrotask → render',
        'Long sync code blocks everything',
      ],
      followUps: [
        'Predict the output of a setTimeout + Promise snippet.',
        'Where does rendering happen?',
        'How is Node\'s loop different?',
      ],
    },
    {
      id: 'difference-between-microtasks-and-macrotasks',
      question: 'Difference between microtasks and macrotasks?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> Microtasks include Promise callbacks and are processed right after the current call stack, before the next macrotask. Macrotasks include \`setTimeout\` and many I/O/UI events. That’s why a resolved Promise often runs before a \`setTimeout(..., 0)\`.`,
      analogy: `Microtasks are VIP tickets: the whole VIP queue is cleared before the next regular ticket (macrotask) gets served.`,
      quickRevision: [
        'Microtasks: `Promise.then`, `await`, `queueMicrotask`, MutationObserver',
        'Macrotasks: `setTimeout`, `setInterval`, I/O, UI events',
        'All microtasks drain after each task',
        'Endless microtasks can starve rendering',
      ],
      followUps: [
        'Where does `process.nextTick` fit?',
        'Why does `Promise.then` run before `setTimeout(fn, 0)`?',
      ],
    },
    {
      id: 'is-javascript-multi-threaded',
      question: 'Is JavaScript multi-threaded?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> JavaScript execution on the main thread is single-threaded. Concurrency comes from the event loop plus background APIs/OS threads for I/O. Web Workers / worker threads can add real parallelism, but they’re separate from normal main-thread JS.`,
      analogy: `One cashier (your JS thread) with a back office of helpers (browser/libuv threads) who handle deliveries and phone calls, then leave notes for the cashier.`,
      quickRevision: [
        'Your JS runs on **one** thread',
        'The runtime uses other threads for I/O, timers, networking',
        'Real parallel JS: Web Workers / Worker Threads',
        'Workers share no memory by default (message passing)',
      ],
      followUps: [
        'When would you use a Web Worker?',
        'What is `SharedArrayBuffer`?',
      ],
    },
    {
      id: 'why-can-settimeoutfn-0-still-be-delayed',
      question: 'Why can `setTimeout(fn, 0)` still be delayed?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `> Zero delay means “as soon as possible after the current stack and pending microtasks,” not literally immediate. The callback waits in the macrotask queue and may be delayed further if the stack is busy.`,
      analogy: `Booking "the next available table" doesn't mean you sit now; you wait until the current diners (sync code and microtasks) are done.`,
      quickRevision: [
        '0 means "minimum delay", not "immediately"',
        'Runs only when the stack is empty and microtasks are drained',
        'Nested timers are clamped to ~4ms; background tabs throttle more',
        'Long tasks before it delay it further',
      ],
      followUps: [
        'How would you yield to the browser to stay responsive?',
        'What is `requestAnimationFrame` for?',
      ],
    },
  ],
});
