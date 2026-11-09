import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Promises & async/await',
  description: 'Promise states, combinators, error handling and running async work in parallel.',
  questions: [
    {
      id: 'js-promise-combinators',
      question: 'Promise.all vs Promise.allSettled vs Promise.race vs Promise.any — when do you use each?',
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
      id: 'what-is-a-promise',
      question: 'What is a Promise?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> A Promise is an object representing an asynchronous operation’s eventual result. It starts pending, then becomes fulfilled with a value or rejected with a reason. Consumers attach \`.then\` / \`.catch\` handlers or use async/await.`,
      analogy: `A restaurant buzzer: you get it now, and it later buzzes either "food ready" (fulfilled) or "sorry, sold out" (rejected). It only ever does one of the two, once.`,
      quickRevision: [
        'Object representing a future value',
        'States: pending → fulfilled or rejected (settled once)',
        '`.then`, `.catch`, `.finally`; chains return new promises',
        'Solves callback hell and gives one error path',
      ],
      followUps: [
        'What does `.then` return?',
        'What happens if you throw inside `.then`?',
        'Implement `Promise.all`.',
      ],
    },
    {
      id: 'promise-vs-asyncawait',
      question: 'Promise vs async/await?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> They’re the same underlying model. async/await is syntactic sugar that makes asynchronous code look synchronous and improves readability, especially for sequential steps and try/catch error handling.`,
      analogy: `Same recipe, different handwriting: \`async/await\` is promises written so they read top-to-bottom like normal code.`,
      quickRevision: [
        '`async` functions always return a promise',
        '`await` pauses the function, not the thread',
        'Errors: `try/catch` instead of `.catch`',
        'Sequential `await` in a loop is slow → `Promise.all` for parallel',
      ],
      followUps: [
        'How do you run two awaits in parallel?',
        'What happens if you forget `await`?',
      ],
    },
    {
      id: 'difference-between-promiseall-and-allsettled',
      question: 'Difference between Promise.all and allSettled?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> \`Promise.all\` rejects as soon as one Promise rejects. \`Promise.allSettled\` waits for every Promise and returns an array of outcome objects for both successes and failures.`,
      analogy: `\`all\` is a group trip cancelled if one person drops out; \`allSettled\` goes ahead and reports who made it and who didn't.`,
      quickRevision: [
        '`all`: rejects on the first failure; results in input order',
        '`allSettled`: never rejects; `{status, value | reason}` each',
        'Use `all` when every result is required',
        'Use `allSettled` for bulk jobs / partial success',
      ],
      followUps: [
        'What about `race` and `any`?',
        'Does `Promise.all` cancel the other promises?',
      ],
    },
    {
      id: 'does-await-block-the-main-thread',
      question: 'Does await block the main thread?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> No. \`await\` pauses only the surrounding async function. While waiting, the event loop can run other tasks. The main thread is blocked only by synchronous CPU work, not by awaiting I/O.`,
      analogy: `\`await\` is putting a bookmark in your book and helping someone else; you come back to the page when the delivery arrives, and nobody waited on you.`,
      quickRevision: [
        'No: it suspends only the current async function',
        'The rest of the program keeps running',
        'Continuation resumes as a microtask',
        'CPU-heavy code inside async functions still blocks',
      ],
      followUps: [
        'So why can an async function still freeze the UI?',
        'Top-level await: where does it work?',
      ],
    },
    {
      id: 'how-do-you-convert-callback-apis-to-promises',
      question: 'How do you convert callback APIs to Promises?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `> Wrap them in \`new Promise((resolve, reject) => ...)\` and call resolve/reject inside the callback. Many Node APIs also have \`util.promisify\` or built-in promise versions.`,
      analogy: `Putting an old appliance on an adapter plug: the inside stays the same, but now it fits the modern socket (\`await\`).`,
      quickRevision: [
        'Wrap in `new Promise((resolve, reject) => …)`',
        'Node: `util.promisify(fn)` for error-first callbacks',
        'Many modules ship promise versions (`fs/promises`)',
        'Call resolve/reject exactly once',
      ],
      followUps: [
        'Implement `promisify` yourself.',
        'Implement `sleep(ms)`.',
      ],
    },
  ],
});
