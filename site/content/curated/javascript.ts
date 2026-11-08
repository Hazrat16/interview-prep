import { defineQuestions } from '../../lib/content/curated-schema';

export default defineQuestions([
  {
    id: 'js-event-loop-microtasks-macrotasks',
    question: 'How does the JavaScript event loop work, and what is the difference between microtasks and macrotasks?',
    category: 'javascript',
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
    followUps: [
      'What does `console.log(1); setTimeout(()=>log(2)); Promise.resolve().then(()=>log(3)); log(4)` print?',
      'Where do `process.nextTick` and `setImmediate` fit in Node?',
      'How can microtasks starve rendering?',
      'How would you break up a long-running loop so the UI stays responsive?',
    ],
    deepDive: `\`\`\`js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
(async () => { await null; console.log('D'); })();
console.log('E');
// A E C D B
\`\`\``,
  },
  {
    id: 'js-closures-real-use',
    question: 'What is a closure, and where have you actually used one?',
    category: 'javascript',
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
    relatedCollected: ['javascript/closures/what-is-a-closure'],
  },
  {
    id: 'js-this-binding',
    question: 'How is `this` determined in JavaScript, and why does it get lost in callbacks?',
    category: 'javascript',
    perspective: 'concept',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['javascript'],
    answer: `For normal functions, \`this\` depends on **how the function is called**, not where it is defined. The rules, by priority:

1. \`new Fn()\`: \`this\` is the new object.
2. \`fn.call(obj)\` / \`apply\` / \`bind\`: \`this\` is \`obj\`.
3. \`obj.fn()\`: \`this\` is \`obj\` (whatever is left of the dot).
4. Plain \`fn()\`: \`undefined\` in strict mode or modules, otherwise the global object.

**Arrow functions have no own \`this\`.** They use the \`this\` of the scope around them.

It gets lost in callbacks because \`setTimeout(obj.method)\` or \`onClick={this.handle}\` passes only the function. When it's called later there is no \`obj.\` on the left, so rule 4 applies. Fixes: \`.bind(obj)\`, wrap it in an arrow (\`() => obj.method()\`), or define the method as an arrow class field.`,
    analogy: `\`this\` is like the word "me" in a phone call. It means whoever is holding the phone **when the call happens**. Pass the phone (the function) to someone else and "me" now means them. An arrow function is a recorded voicemail: "me" stays the person who recorded it.`,
    quickRevision: [
      'Priority: `new` > explicit (`call/apply/bind`) > implicit (`obj.fn()`) > default',
      'Arrow functions take `this` from the enclosing scope and cannot be rebound',
      'Passing `obj.method` as a callback loses `obj`',
      'Fix with `bind`, a wrapper arrow, or an arrow class field',
      "Don't use arrows as object methods that need `this`",
    ],
    followUps: [
      'What does `bind` return, and can you re-bind a bound function?',
      'Why can\'t arrow functions be used as constructors?',
      'Implement `Function.prototype.bind` yourself.',
    ],
  },
  {
    id: 'js-promise-combinators',
    question: 'Promise.all vs Promise.allSettled vs Promise.race vs Promise.any — when do you use each?',
    category: 'javascript',
    perspective: 'trade-off',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['javascript', 'nodejs'],
    answer: `All four take an array of promises and run them **concurrently**. They differ in when they settle:

| | Resolves when | Rejects when | Typical use |
|---|---|---|---|
| \`all\` | all fulfil (results in order) | **first** rejection | Page needs user + settings + permissions; any failure is fatal |
| \`allSettled\` | all settle (never rejects) | — | Bulk jobs: send 50 emails, report which failed |
| \`race\` | first **settles** | first settles with an error | Timeouts: \`race([fetch(), timeout(5000)])\` |
| \`any\` | first **fulfils** | all reject (\`AggregateError\`) | Fastest healthy mirror or CDN |

Two things to mention: \`Promise.all\` does **not cancel** the others when one fails (use \`AbortController\` for that), and for hundreds of tasks you want a **concurrency limit**, not one huge \`Promise.all\`.`,
    analogy: `Ordering food for a group. **all**: dinner starts when every dish arrives, and if one is cancelled the dinner is off. **allSettled**: you wait for every dish and then note what never came. **race**: whatever happens first wins, food or "kitchen closed". **any**: you eat the first dish that actually arrives.`,
    quickRevision: [
      '`all`: fail fast, results keep input order',
      '`allSettled`: never rejects, gives `{status, value|reason}`',
      '`race`: first settled (good for timeouts)',
      '`any`: first fulfilled, `AggregateError` if all fail',
      'None of them cancel the losers; use `AbortController`',
    ],
    followUps: [
      'Implement `Promise.all` from scratch.',
      'How would you run 100 requests with at most 5 in flight?',
      'Sequential `await` in a loop vs `Promise.all`: what\'s the difference in timing?',
    ],
  },
  {
    id: 'js-memory-leaks-frontend',
    question: 'What causes memory leaks in a frontend app, and how would you find one?',
    category: 'javascript',
    perspective: 'debugging',
    difficulty: 'medium',
    frequency: 'medium',
    tags: ['javascript', 'react', 'performance'],
    answer: `A leak happens when something you no longer need is **still reachable**, so the garbage collector can't free it. Common causes in SPAs:

- **Listeners and timers not cleaned up**: \`addEventListener\`, \`setInterval\`, socket subscriptions created in \`useEffect\` without a cleanup function.
- **Detached DOM nodes**: removed from the page but still referenced from JS (a cache, a closure).
- **Growing module-level caches or arrays**: a \`Map\` used as a cache with no limit or eviction.
- **Closures holding large objects**: a long-lived callback that captured a big response.
- **Unfinished async work** that writes to state after unmount.

How I'd find it: reproduce the action (open and close a modal 20 times), take **heap snapshots** in Chrome DevTools before and after, compare them, and look at what grew and its **retainers** path. The Performance monitor's JS heap and DOM node counts help confirm it. Then fix the cleanup and verify the heap comes back down.`,
    analogy: `A hotel that never checks guests out. The rooms (memory) aren't in use, but the front desk still has their names in the book (references), so housekeeping (the GC) isn't allowed to clean them. Eventually the hotel is "full".`,
    quickRevision: [
      'Leak = unneeded object still reachable',
      'Top causes: missing effect cleanup, timers, listeners, sockets, unbounded caches',
      'Always return a cleanup from `useEffect` that subscribes',
      'DevTools: heap snapshots → comparison → retainers',
      'Use `WeakMap` / LRU for caches keyed by objects',
    ],
    followUps: [
      'What does `WeakMap` solve that `Map` doesn\'t?',
      'How does `AbortController` help with fetch in `useEffect`?',
      'How would you detect a memory leak in a Node.js server?',
    ],
  },
  {
    id: 'js-implement-debounce',
    question: 'Implement debounce. What edge cases would you handle?',
    category: 'javascript',
    perspective: 'coding',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['javascript', 'react'],
    answer: `Debounce delays calling a function until calls have **stopped for \`wait\` ms**. Each new call resets the timer. It's used for search-as-you-type, resize handlers and auto-save.

\`\`\`js
function debounce(fn, wait = 300) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
\`\`\`

Edge cases I'd talk through: keeping \`this\` and the **latest** arguments; a \`cancel()\` (and maybe \`flush()\`) so a React component can clean up on unmount; a **leading** option to fire immediately on the first call; and in React, creating it **once** with \`useMemo\` or \`useRef\`, otherwise every render makes a new debounced function and it never fires as expected.`,
    analogy: `A lift door. Every time someone walks in, the door timer resets. The lift leaves only after nobody has entered for a few seconds. Throttle is a bus that leaves every 10 minutes no matter how many people keep arriving.`,
    quickRevision: [
      'Debounce = run after calls stop; throttle = run at most once per interval',
      '`clearTimeout` then `setTimeout` on every call',
      'Preserve `this` + args with `fn.apply(this, args)`',
      'Expose `cancel()` for unmount cleanup',
      'In React: create once (`useMemo`/`useRef`) or use a `useDebounce(value)` hook',
    ],
    followUps: [
      'Now implement throttle.',
      'Write a `useDebounce(value, delay)` hook.',
      'Debounce vs throttle for a scroll-based infinite list: which and why?',
    ],
    relatedCollected: ['javascript/debounce-throttle/debounce-vs-throttle'],
  },
  {
    id: 'js-esm-vs-commonjs',
    question: 'ES Modules vs CommonJS — what is the difference and why does it matter in Node?',
    category: 'javascript',
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
    id: 'ts-interface-vs-type',
    question: 'TypeScript: interface vs type alias — which do you use and when?',
    category: 'javascript',
    perspective: 'trade-off',
    difficulty: 'easy',
    frequency: 'very-high',
    tags: ['typescript'],
    answer: `Both describe object shapes, and for most objects they're interchangeable. The differences:

- **\`type\` can describe anything**: unions (\`'idle' | 'loading'\`), tuples, primitives, mapped and conditional types. \`interface\` describes only object and function shapes.
- **\`interface\` can be re-opened** (declaration merging). Two declarations with the same name merge. That's useful for extending library types (\`Window\`, Express \`Request\`) but can surprise you in app code.
- **\`extends\` vs \`&\`**: interface \`extends\` reports conflicting properties as errors. Intersections can silently produce \`never\`.

My rule: \`interface\` for public object contracts (props, API DTOs) and anything meant to be extended; \`type\` for unions, utility compositions and everything else. Most important is **staying consistent** within a codebase.`,
    analogy: `An \`interface\` is a contract template others can add clauses to later. A \`type\` is a label you can stick on anything, including "one of these options". For a plain object shape, either piece of paper works.`,
    quickRevision: [
      'Unions, tuples, mapped/conditional types → `type` only',
      'Declaration merging → `interface` only',
      '`extends` errors on conflicts; `&` may become `never`',
      'Rule: interface for object contracts, type for compositions',
    ],
    followUps: [
      'How would you add a `user` property to Express `Request`?',
      'What is a discriminated union and why is it useful?',
      'Explain `Partial`, `Pick`, `Omit` and `Record`.',
    ],
  },
  {
    id: 'ts-generics-real-example',
    question: 'Explain TypeScript generics with a real example from your work.',
    category: 'javascript',
    perspective: 'practical',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['typescript', 'react', 'api-design'],
    answer: `Generics let a function or type work with **many types while keeping the relationship between input and output**. Without them you'd choose between duplicating code or losing safety with \`any\`.

A real example is a typed API helper:

\`\`\`ts
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}

const invoices = await api<Invoice[]>('/api/invoices'); // invoices: Invoice[]
\`\`\`

Others I use often: a paginated response \`Paginated<T> = { items: T[]; total: number; page: number }\`, a reusable \`<Table<T>>\` component where column accessors are checked against \`keyof T\`, and **constraints** like \`<T extends { id: string }>\` so a helper can rely on \`id\` existing. With Zod, \`z.infer<typeof schema>\` derives the type from the validator, so runtime and compile-time agree.`,
    analogy: `A shipping box with a label slot. The box (function) is the same, but when you write "Books" on the label (\`T = Book\`), everyone who opens it knows exactly what's inside, without opening every box to check.`,
    quickRevision: [
      'Generics = type parameters; keep input/output types connected',
      'Prefer over `any`, which turns type checking off',
      'Constrain with `extends` (`<T extends { id: string }>`)',
      '`keyof T` and `T[K]` for typed property access',
      'Real uses: API client, `Paginated<T>`, generic table/select components',
    ],
    followUps: [
      'What is the difference between `unknown` and `any`?',
      'Write `function getProp<T, K extends keyof T>(obj: T, key: K): T[K]`.',
      'How do you type a generic React component?',
    ],
  },
  {
    id: 'ts-unknown-any-never-narrowing',
    question: 'unknown vs any vs never — and how does type narrowing work?',
    category: 'javascript',
    perspective: 'concept',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['typescript'],
    answer: `- **\`any\`** turns the type checker off. You can do anything with it, and it spreads silently.
- **\`unknown\`** is the safe "could be anything". You **must narrow it** before using it. Use it for \`JSON.parse\` results, \`catch (e)\` and external input.
- **\`never\`** is a value that can't exist: a function that always throws, or the leftover case after every union member has been handled.

**Narrowing** is TypeScript refining a type inside a branch, using \`typeof\`, \`instanceof\`, \`in\`, equality checks, **discriminated unions** (\`switch (action.type)\`) and custom **type guards** (\`function isUser(x): x is User\`).

A pattern I use is **exhaustiveness checking**:

\`\`\`ts
switch (status.kind) {
  case 'draft': …; case 'sent': …; case 'paid': …;
  default: const _exhaustive: never = status; // error if a new kind is added
}
\`\`\``,
    analogy: `\`any\` is a sealed box that customs waves through. \`unknown\` is a sealed box customs insists on opening before it goes anywhere. \`never\` is the "nothing should ever arrive here" slot: if something lands in it, you've found a bug.`,
    quickRevision: [
      '`any` = no checks; `unknown` = must narrow first; `never` = impossible',
      'Use `unknown` for external data and `catch (e)`',
      'Narrow with `typeof`, `instanceof`, `in`, discriminants, type guards',
      '`const x: never = value` in `default` for exhaustive switches',
    ],
    followUps: [
      'Write a type guard for an API response.',
      'Why is validating at runtime (Zod) still needed with TypeScript?',
      'What does `as const` do?',
    ],
  },
]);
