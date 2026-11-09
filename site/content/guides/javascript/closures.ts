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
      deepDive: `\`\`\`js
function createCounter() {
  let count = 0;                 // private: nothing outside can touch it
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const c = createCounter();
c.increment();
c.increment();
console.log(c.get());            // 2
console.log(c.count);            // undefined

const requireRole = (role) => (req, res, next) =>
  req.user?.role === role ? next() : res.status(403).end();
app.delete('/users/:id', requireRole('admin'), deleteUser);
\`\`\``,
      followUps: [
        'Why does a `for (var i…)` loop with `setTimeout` print the same number?',
        'Can closures cause memory leaks? When?',
        'Explain a stale closure in `useEffect` and three ways to fix it.',
        'Implement `once(fn)` or `memoize(fn)`.',
      ],
    },
    {
      id: 'why-does-var-in-a-loop-print-the-same-value-with-settimeout',
      question: 'Why does a `for (var i…)` loop with `setTimeout` print the same value every time?',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      snippet: `\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
\`\`\``,
      answer: `It prints **\`3 3 3\`**. \`var\` is **function-scoped**, so there is **one \`i\`** shared by the whole loop, and all three callbacks close over that same variable. The callbacks only run after the loop has finished (they're macrotasks), and by then \`i\` is \`3\`.

Changing \`var\` to **\`let\`** prints **\`0 1 2\`**, because \`let\` is block-scoped and the spec creates a **new binding for each iteration**, so each callback captures its own \`i\`.

Before \`let\`, people fixed it with an IIFE that took \`i\` as an argument, or by passing it as the third argument to \`setTimeout\`. Both work by creating a new scope per iteration.`,
      analogy: `With \`var\`, all three timers share **one** whiteboard that says "i"; by the time they read it, the loop has written 3. With \`let\`, each iteration gets its own whiteboard.`,
      quickRevision: [
        '`var` is function-scoped: one shared `i`',
        'Callbacks run after the loop finishes → all see 3',
        '`let` creates a new binding per iteration → 0 1 2',
        'Old fixes: IIFE or `setTimeout(fn, 0, i)`',
      ],
      deepDive: `\`\`\`js
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0 1 2

// pre-ES6 fix: a new function scope per iteration
for (var j = 0; j < 3; j++) {
  (function (k) {
    setTimeout(() => console.log(k), 0);
  })(j);
}

for (var n = 0; n < 3; n++) setTimeout(console.log, 0, n); // extra args are passed to the callback
\`\`\``,
      followUps: [
        'How did people fix this before `let`?',
        'What does this print with `const` in a `for…of` loop?',
        'Would `setTimeout(…, 1000 * i)` change the output?',
      ],
    },
    {
      id: 'do-closures-cause-memory-leaks',
      question: 'Can closures cause memory leaks? How would you find and fix one?',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript', 'performance'],
      answer: `Not by themselves. A closure keeps its captured variables alive **only as long as the closure itself is reachable**. When nothing references the function any more, the garbage collector frees both.

Leaks happen when a closure is **reachable for longer than intended** and it captured something big:

- An **event listener** or **\`setInterval\`** that's never removed keeps its callback, and everything the callback references, alive. In an SPA that often means a whole unmounted component's data.
- A **long-lived cache or global array** that keeps adding callbacks.
- A callback that closes over a **large object** when it only needs one field.

To find one, I use Chrome DevTools: take a **heap snapshot**, repeat the action (open and close a page a few times), take another, and compare. Growing counts of detached DOM nodes or listeners point at the culprit. The fixes are cleanup (\`removeEventListener\`, \`clearInterval\`, the \`useEffect\` cleanup function, \`AbortController\`), capturing only what you need, and \`WeakMap\` for caches keyed by objects.`,
      analogy: `A closure is a lease on memory: harmless while you need it, a leak if you forget to end the lease (a listener or timer that is never removed keeps everything it captured alive).`,
      quickRevision: [
        'Closures only hold memory while they\'re reachable',
        'Common cause: listeners and intervals never removed',
        'Captured large objects live as long as the closure',
        'Find it: heap snapshots before/after a repeated action',
        'Fix: cleanup in `useEffect`, `removeEventListener`, `clearInterval`, `WeakMap`',
      ],
      deepDive: `\`\`\`js
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  const id = setInterval(poll, 5000);
  return () => {
    window.removeEventListener('resize', onResize); // without these, the closures
    clearInterval(id);                              // keep the unmounted component alive
  };
}, []);
\`\`\``,
      followUps: [
        'How would you find a leak in Chrome DevTools?',
        'What does `WeakMap` help with?',
        'What are detached DOM nodes?',
      ],
    },
    {
      id: 'stale-closure-in-react',
      question: 'What is a stale closure in React, and how do you fix it?',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript', 'react'],
      answer: `Every render of a component is a fresh function call, so every handler and effect **closes over the props and state of that specific render**. A **stale closure** is a callback that was created in an old render and keeps running later, so it still sees the **old values**.

The classic case is \`setInterval\` inside \`useEffect(…, [])\`: the effect runs once, the interval callback captured \`count = 0\`, and \`setCount(count + 1)\` keeps setting it to \`1\` forever.

Three fixes, depending on the situation:

1. **Functional update**: \`setCount(c => c + 1)\` doesn't read \`count\` from the closure at all. Best fix when you only need the previous state.
2. **Correct dependencies**: list \`count\` in the dependency array so the effect re-subscribes with fresh values. The \`react-hooks/exhaustive-deps\` lint rule catches most of these.
3. **A ref**: store the latest value or callback in \`useRef\` and read \`ref.current\` inside the long-lived callback, when you don't want to re-subscribe.`,
      analogy: `A photo of a scoreboard: the callback is looking at a picture taken during an old render, not the live board.`,
      quickRevision: [
        'Each render = new closures over that render\'s state',
        'Stale closure: an old callback still running with old values',
        'Classic: `setInterval` in `useEffect(…, [])`',
        'Fix: functional update, correct deps, or a ref',
        '`exhaustive-deps` lint rule catches most cases',
      ],
      deepDive: `\`\`\`jsx
// Bug: always sets 1
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);

// Fix 1: functional update
useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(id);
}, []);

// Fix 3: latest value in a ref
const latest = useRef(onTick);
latest.current = onTick;
useEffect(() => {
  const id = setInterval(() => latest.current(), 1000);
  return () => clearInterval(id);
}, []);
\`\`\``,
      avoid: ['Disabling the `exhaustive-deps` lint rule to "fix" it: that hides the bug'],
      followUps: [
        'Why does React run effects twice in Strict Mode?',
        'When would you use `useRef` over adding a dependency?',
        'What is `useEffectEvent` meant to solve?',
      ],
    },
  ],
});
