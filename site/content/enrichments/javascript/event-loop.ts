import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/event-loop.md', {
  'what-is-the-event-loop': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: 'A chef (call stack) cooks one dish at a time; waiters drop finished-order tickets into trays, and the chef only picks up the next ticket when the current dish is done.',
    quickRevision: [
      'One call stack runs JS',
      'Async work finishes outside it and queues a callback',
      'Loop: stack empty → run all microtasks → one macrotask → render',
      'Long sync code blocks everything',
    ],
    followUps: ['Predict the output of a setTimeout + Promise snippet.', 'Where does rendering happen?', 'How is Node\'s loop different?'],
  },
  'difference-between-microtasks-and-macrotasks': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: 'Microtasks are VIP tickets: the whole VIP queue is cleared before the next regular ticket (macrotask) gets served.',
    quickRevision: [
      'Microtasks: `Promise.then`, `await`, `queueMicrotask`, MutationObserver',
      'Macrotasks: `setTimeout`, `setInterval`, I/O, UI events',
      'All microtasks drain after each task',
      'Endless microtasks can starve rendering',
    ],
    followUps: ['Where does `process.nextTick` fit?', 'Why does `Promise.then` run before `setTimeout(fn, 0)`?'],
  },
  'is-javascript-multi-threaded': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'One cashier (your JS thread) with a back office of helpers (browser/libuv threads) who handle deliveries and phone calls, then leave notes for the cashier.',
    quickRevision: [
      'Your JS runs on **one** thread',
      'The runtime uses other threads for I/O, timers, networking',
      'Real parallel JS: Web Workers / Worker Threads',
      'Workers share no memory by default (message passing)',
    ],
    followUps: ['When would you use a Web Worker?', 'What is `SharedArrayBuffer`?'],
  },
  'why-can-settimeoutfn-0-still-be-delayed': {
    difficulty: 'medium',
    analogy: 'Booking "the next available table" doesn\'t mean you sit now; you wait until the current diners (sync code and microtasks) are done.',
    quickRevision: [
      '0 means "minimum delay", not "immediately"',
      'Runs only when the stack is empty and microtasks are drained',
      'Nested timers are clamped to ~4ms; background tabs throttle more',
      'Long tasks before it delay it further',
    ],
    followUps: ['How would you yield to the browser to stay responsive?', 'What is `requestAnimationFrame` for?'],
  },
});
