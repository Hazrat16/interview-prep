import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Closures',
  description: 'What a closure captures, real uses like privacy and memoisation, and the classic loop bug.',
  questions: [
    {
      id: 'js-closures-real-use',
      question: 'What is a closure, and where have you actually used one?',
      perspective: 'practical',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript', 'react'],
      answer: `A closure is a function that **remembers the variables of the scope it was created in**, even after that outer function has returned. JavaScript functions keep a reference to their lexical environment, not a copy of it.

Real uses I've written:

- **Debounce/throttle**: the timer ID lives in the closure between calls.
- **Factories and private state**: \`createApiClient(baseUrl)\` returns methods that all share \`baseUrl\` and a token without exposing them.
- **React**: every event handler and \`useEffect\` callback is a closure over that render's props and state. That's also the source of the **stale closure** bug, where an interval keeps seeing the old \`count\`.
- **Middleware factories** in Express: \`requireRole('admin')\` returns a middleware that remembers \`'admin'\`.`,
      analogy: `A backpack. When a function is created, it packs the variables around it into a backpack and carries it everywhere. Even after leaving home (the outer function returns), it can still open the backpack. Two functions made in the same call share the same backpack.`,
      quickRevision: [
        'Function + its lexical environment = closure',
        'Holds a **reference** to variables, not a snapshot',
        'Uses: data privacy, factories, debounce, memoize, middleware config',
        'React stale closure: effect/interval sees old state → fix deps, functional update, or ref',
        '`var` in a loop shares one binding; `let` creates one per iteration',
      ],
      followUps: [
        'Why does a `for (var i…)` loop with `setTimeout` print the same number?',
        'Can closures cause memory leaks? When?',
        'Explain a stale closure in `useEffect` and three ways to fix it.',
        'Implement `once(fn)` or `memoize(fn)`.',
      ],
    },
    {
      id: 'what-is-a-closure',
      question: 'What is a closure?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> A closure is formed when a function retains access to variables from its lexical outer scope even after that outer function has returned. The inner function “closes over” those variables and can read or update them later.`,
      analogy: `A backpack: when a function is created it packs the variables around it and carries them everywhere, even after it leaves home (the outer function has returned).`,
      quickRevision: [
        'Function + the lexical scope it was created in',
        'Keeps a **reference** to variables, not a copy',
        'Created every time a function is created',
        'Basis of data privacy, factories, debounce, memoize',
      ],
      followUps: [
        'Give a real use case.',
        'Can closures cause memory leaks?',
        'What is a stale closure in React?',
      ],
    },
    {
      id: 'give-a-real-use-case',
      question: 'Give a real use case for a closure.',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> Closures are used for private state, like a counter or wallet balance that outside code can’t access directly. They’re also common in callbacks, event handlers, and function factories.`,
      analogy: `A coat-check ticket: the function you get back holds a private ticket (the variable) that nobody else can reach, but it can always use it.`,
      quickRevision: [
        'Debounce/throttle keep the timer ID in a closure',
        'Factories: `createCounter()`, `createApiClient(baseUrl)`',
        'Express: `requireRole("admin")` returns middleware remembering the role',
        'React: event handlers close over props and state',
      ],
      followUps: [
        'Implement a counter with private state.',
        'Implement `once(fn)`.',
      ],
    },
    {
      id: 'why-does-var-in-a-loop-print-the-same-value-with-settimeout',
      question: 'Why does `var` in a loop print the same value with setTimeout?',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> Because \`var\` is function-scoped, every callback closes over the same \`i\`. By the time the timers run, the loop finished and \`i\` is the final value. \`let\` creates a new binding per iteration, so each callback sees the correct index.`,
      analogy: `With \`var\`, all three timers share **one** whiteboard that says "i"; by the time they read it, the loop has written 3. With \`let\`, each iteration gets its own whiteboard.`,
      quickRevision: [
        '`var` is function-scoped: one shared `i`',
        'Callbacks run after the loop finishes → all see 3',
        '`let` creates a new binding per iteration → 0 1 2',
        'Old fix: IIFE or `setTimeout(fn, 0, i)`',
      ],
      followUps: [
        'How did people fix this before `let`?',
        'What does this print with `const` in a `for…of`?',
      ],
    },
    {
      id: 'do-closures-cause-memory-leaks',
      question: 'Do closures cause memory leaks?',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript', 'performance'],
      answer: `> Closures keep referenced outer variables alive, which is intended. A leak can happen if a long-lived closure accidentally retains large objects that are no longer needed. Avoid closing over unnecessary heavy data.`,
      analogy: `A closure is a lease on memory: harmless while you need it, a leak if you forget to end the lease (a listener or timer that is never removed keeps everything it captured alive).`,
      quickRevision: [
        'Not by themselves; only if the closure stays reachable',
        'Common cause: listeners/intervals never removed',
        'Captured large objects stay alive as long as the closure does',
        'Fix: cleanup in `useEffect`, `removeEventListener`, `clearInterval`',
      ],
      followUps: [
        'How would you find a leak in Chrome DevTools?',
        'What does `WeakMap` help with?',
      ],
    },
  ],
});
