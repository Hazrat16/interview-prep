import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Promises & async/await',
  description: 'Promise states, combinators, error handling and running async work in parallel.',
  questions: [
    {
      id: 'what-is-a-promise',
      question: 'What is a Promise, and what problem does it solve?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `A Promise is an object that represents the **eventual result of an async operation**. It starts **pending** and settles **once**, either **fulfilled** with a value or **rejected** with a reason. After that it never changes.

You consume it with \`.then(onFulfilled)\`, \`.catch(onRejected)\` and \`.finally()\`. The key detail is that **each \`.then\` returns a new promise**: whatever you return from the handler becomes the next value, and if you return another promise, the chain waits for it. If a handler throws, the chain jumps to the next \`.catch\`.

The problems it solved compared with callbacks:

- **Callback hell**: nested callbacks become a flat chain, or plain-looking \`async/await\` code.
- **Error handling**: one \`.catch\` (or one \`try/catch\`) handles errors from every step, instead of checking \`err\` in each callback.
- **Composition**: \`Promise.all\`, \`race\` and friends combine operations, which is awkward with callbacks.
- **Trust**: a promise can only settle once, so a buggy library can't call your callback twice.`,
      analogy: `A restaurant buzzer: you get it now, and it later buzzes either "food ready" (fulfilled) or "sorry, sold out" (rejected). It only ever does one of the two, once.`,
      quickRevision: [
        'Object representing a future value',
        'pending → fulfilled or rejected; settles exactly once',
        'Each `.then` returns a new promise; return values flow down the chain',
        'A throw skips to the next `.catch`',
        'Fixes callback hell, scattered error handling, composition',
      ],
      deepDive: `\`\`\`js
getUser(id)
  .then((user) => getOrders(user.id))   // returning a promise: chain waits
  .then((orders) => orders.length)
  .catch((err) => {                     // catches errors from any step above
    console.error(err);
    return 0;                           // recover with a value
  })
  .finally(() => setLoading(false));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
\`\`\``,
      followUps: [
        'What does `.then` return?',
        'What happens if you throw inside `.then`?',
        'Implement `Promise.all`.',
      ],
    },
    {
      id: 'js-promise-combinators',
      question: '`Promise.all` vs `Promise.allSettled` vs `Promise.race` vs `Promise.any`: when do you use each?',
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
      deepDive: `\`\`\`js
const results = await Promise.allSettled(users.map((u) => sendEmail(u)));
const failed = results
  .map((r, i) => ({ r, user: users[i] }))
  .filter(({ r }) => r.status === 'rejected');

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
const data = await Promise.race([fetch('/api/report'), timeout(5000)]);
\`\`\``,
      followUps: [
        'Implement `Promise.all` from scratch.',
        'How would you run 100 requests with at most 5 in flight?',
        'Sequential `await` in a loop vs `Promise.all`: what\'s the difference in timing?',
      ],
    },
    {
      id: 'promise-vs-asyncawait',
      question: 'Promises vs async/await: what is the difference, and what mistakes do people make with `await`?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `They're the **same mechanism**. An \`async\` function **always returns a promise**, and \`await\` pauses that function until a promise settles, then continues with its value (or throws its error). It's syntax that makes promise code read top to bottom, with ordinary \`try/catch\`, \`if\` and loops.

I default to \`async/await\` for readability, and still use promise methods for **combining**: \`Promise.all\`, \`race\` and so on.

The mistakes I look for in reviews:

- **Accidental sequential awaits**: \`const a = await getA(); const b = await getB();\` takes the sum of both times even when they're independent. Start both, then \`await Promise.all([getA(), getB()])\`.
- **Forgetting \`await\`**: you get a pending promise instead of the value, and its error becomes an **unhandled rejection** that \`try/catch\` never sees.
- **\`await\` inside \`forEach\`**: \`forEach\` ignores the returned promises, so nothing waits. Use \`for…of\` (sequential) or \`Promise.all(items.map(…))\` (parallel).
- **\`return\` vs \`return await\` inside \`try\`**: without \`await\`, a rejection skips your \`catch\`.`,
      analogy: `Same recipe, different handwriting: \`async/await\` is promises written so they read top-to-bottom like normal code.`,
      quickRevision: [
        '`async` functions always return a promise',
        '`await` pauses the function, not the thread',
        'Errors: `try/catch` instead of `.catch`',
        'Independent awaits → `Promise.all` for parallel',
        'No `await` in `forEach`; `return await` inside `try`',
      ],
      deepDive: `\`\`\`js
// Slow: ~2s
const user = await getUser();     // 1s
const posts = await getPosts();   // 1s

// Fast: ~1s
const [user2, posts2] = await Promise.all([getUser(), getPosts()]);

async function load() {
  try {
    return await fetchJson('/api'); // with await, a rejection is caught below
  } catch (e) {
    return null;
  }
}
\`\`\``,
      followUps: [
        'How do you run two awaits in parallel?',
        'What happens if you forget `await`?',
        'Why doesn\'t `await` work inside `forEach`?',
      ],
    },
    {
      id: 'does-await-block-the-main-thread',
      question: 'Does `await` block the main thread?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `No. \`await\` **suspends only the async function it's in**. The function returns a pending promise to its caller, the call stack unwinds, and the event loop is free to run other tasks: other requests in Node, clicks and rendering in the browser. When the awaited promise settles, the rest of the function is scheduled as a **microtask** and continues from where it stopped.

What **does** block the thread is **synchronous CPU work**, wherever it is. An \`async\` function that parses a 50 MB JSON string or loops over a million items freezes everything while that code runs, because \`async\` doesn't move work to another thread. Only the *waiting* is non-blocking.

So for heavy computation I either chunk the work and yield between chunks, or move it to a **Web Worker** / **\`worker_threads\`**. In Node, also watch out for sync APIs like \`fs.readFileSync\` or \`bcrypt.hashSync\` inside request handlers.`,
      analogy: `\`await\` is putting a bookmark in your book and helping someone else; you come back to the page when the delivery arrives, and nobody waited on you.`,
      quickRevision: [
        'No: it suspends only the current async function',
        'The continuation resumes as a microtask',
        '`async` doesn\'t move work off the thread',
        'CPU-heavy sync code still blocks: chunk it or use workers',
        'Node: avoid `*Sync` APIs in request handlers',
      ],
      followUps: [
        'So why can an async function still freeze the UI?',
        'Where does top-level `await` work?',
        'How do you offload CPU work in Node?',
      ],
    },
    {
      id: 'how-do-you-convert-callback-apis-to-promises',
      question: 'How do you convert a callback-based API to Promises?',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript', 'nodejs'],
      answer: `Wrap the call in **\`new Promise((resolve, reject) => …)\`** and call \`resolve\` or \`reject\` from inside the callback. For Node's **error-first callbacks** (\`(err, result) => …\`) that's a generic pattern, so I'd write a \`promisify\` helper. Node also ships one: \`util.promisify\`.

Things to get right:

- Call \`resolve\`/\`reject\` **exactly once**. A promise ignores later calls, but double-calling usually signals a bug.
- **Preserve \`this\`** when wrapping methods: \`fn.call(this, …)\`.
- Prefer built-in promise versions when they exist: \`fs/promises\`, \`timers/promises\` (\`setTimeout\` you can \`await\`), \`stream/promises\`.
- For **event-based** APIs that can fire many times (streams, sockets), a promise only fits a single event, like "finished" or "first message". \`events.once(emitter, 'ready')\` does that.`,
      analogy: `Putting an old appliance on an adapter plug: the inside stays the same, but now it fits the modern socket (\`await\`).`,
      quickRevision: [
        'Wrap in `new Promise((resolve, reject) => …)`',
        'Node: `util.promisify(fn)` for error-first callbacks',
        'Use `fs/promises`, `timers/promises` when available',
        'Settle exactly once; preserve `this`',
        'Events: `events.once(emitter, name)`',
      ],
      deepDive: `\`\`\`js
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => (err ? reject(err) : resolve(result)));
    });
  };
}

const readFile = promisify(require('fs').readFile);
const text = await readFile('notes.txt', 'utf8');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
\`\`\``,
      followUps: [
        'Implement `promisify` yourself.',
        'Implement `sleep(ms)`.',
        'How would you turn a stream into a promise?',
      ],
    },
    {
      id: 'async-error-handling',
      question: 'How do you handle errors in async code, and what is an unhandled rejection?',
      perspective: 'practical',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript', 'nodejs'],
      answer: `With \`async/await\`, errors from awaited promises are thrown at the \`await\`, so I use **\`try/catch\`** around the part I can actually handle, and let the rest bubble up to one central handler (an Express error middleware, a React error boundary or query \`onError\`). With promise chains it's **\`.catch\`** at the end of the chain.

An **unhandled rejection** is a promise that rejects with **no handler attached**: a missing \`await\`, a forgotten \`.catch\`, or a fire-and-forget call. The browser logs it; **Node 15+ crashes the process by default**, which is the safer behaviour because the app could be in an unknown state.

My habits:

- Always \`await\` or \`return\` promises, and lint for it (\`no-floating-promises\` in TypeScript).
- For intentional fire-and-forget, attach a \`.catch\` that logs.
- **Throw \`Error\` objects**, not strings, so stack traces survive; add context with \`new Error('Failed to load orders', { cause: err })\`.
- Add a **global safety net** (\`process.on('unhandledRejection')\` or \`window.onunhandledrejection\`) for logging, not for recovery.`,
      analogy: `A rejected promise is a phone ringing in an empty office: if nobody's assigned to answer (no catch), the call is lost, and Node now treats that as a fire alarm.`,
      quickRevision: [
        '`try/catch` around `await`; `.catch` on chains',
        'Handle where you can recover, bubble the rest to one handler',
        'Unhandled rejection = rejected promise with no handler',
        'Node 15+ crashes on it by default',
        'Throw `Error` objects; use `{ cause }` for context',
      ],
      deepDive: `\`\`\`js
async function loadDashboard(userId) {
  try {
    const [user, orders] = await Promise.all([getUser(userId), getOrders(userId)]);
    return { user, orders };
  } catch (err) {
    throw new Error(\`Dashboard failed for \${userId}\`, { cause: err });
  }
}

sendAnalytics(event).catch((err) => logger.warn('analytics failed', err)); // fire-and-forget

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandled rejection');
  process.exit(1); // let the process manager restart cleanly
});
\`\`\``,
      followUps: [
        'How do you handle errors in Express with async route handlers?',
        'What is an error boundary, and does it catch async errors?',
        'What does `Error.cause` give you?',
      ],
    },
  ],
});
