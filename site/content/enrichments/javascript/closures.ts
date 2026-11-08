import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/closures.md', {
  'what-is-a-closure': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'A backpack: when a function is created it packs the variables around it and carries them everywhere, even after it leaves home (the outer function has returned).',
    quickRevision: [
      'Function + the lexical scope it was created in',
      'Keeps a **reference** to variables, not a copy',
      'Created every time a function is created',
      'Basis of data privacy, factories, debounce, memoize',
    ],
    followUps: ['Give a real use case.', 'Can closures cause memory leaks?', 'What is a stale closure in React?'],
  },
  'give-a-real-use-case': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'A coat-check ticket: the function you get back holds a private ticket (the variable) that nobody else can reach, but it can always use it.',
    quickRevision: [
      'Debounce/throttle keep the timer ID in a closure',
      'Factories: `createCounter()`, `createApiClient(baseUrl)`',
      'Express: `requireRole("admin")` returns middleware remembering the role',
      'React: event handlers close over props and state',
    ],
    followUps: ['Implement a counter with private state.', 'Implement `once(fn)`.'],
  },
  'why-does-var-in-a-loop-print-the-same-value-with-settimeout': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: 'With `var`, all three timers share **one** whiteboard that says "i"; by the time they read it, the loop has written 3. With `let`, each iteration gets its own whiteboard.',
    quickRevision: [
      '`var` is function-scoped: one shared `i`',
      'Callbacks run after the loop finishes → all see 3',
      '`let` creates a new binding per iteration → 0 1 2',
      'Old fix: IIFE or `setTimeout(fn, 0, i)`',
    ],
    followUps: ['How did people fix this before `let`?', 'What does this print with `const` in a `for…of`?'],
  },
  'do-closures-cause-memory-leaks': {
    difficulty: 'medium',
    analogy: 'A closure is a lease on memory: harmless while you need it, a leak if you forget to end the lease (a listener or timer that is never removed keeps everything it captured alive).',
    quickRevision: [
      'Not by themselves; only if the closure stays reachable',
      'Common cause: listeners/intervals never removed',
      'Captured large objects stay alive as long as the closure does',
      'Fix: cleanup in `useEffect`, `removeEventListener`, `clearInterval`',
    ],
    followUps: ['How would you find a leak in Chrome DevTools?', 'What does `WeakMap` help with?'],
  },
});
