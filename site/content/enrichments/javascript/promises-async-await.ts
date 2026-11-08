import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/promises-async-await.md', {
  'what-is-a-promise': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'A restaurant buzzer: you get it now, and it later buzzes either "food ready" (fulfilled) or "sorry, sold out" (rejected). It only ever does one of the two, once.',
    quickRevision: [
      'Object representing a future value',
      'States: pending → fulfilled or rejected (settled once)',
      '`.then`, `.catch`, `.finally`; chains return new promises',
      'Solves callback hell and gives one error path',
    ],
    followUps: ['What does `.then` return?', 'What happens if you throw inside `.then`?', 'Implement `Promise.all`.'],
  },
  'promise-vs-asyncawait': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'Same recipe, different handwriting: `async/await` is promises written so they read top-to-bottom like normal code.',
    quickRevision: [
      '`async` functions always return a promise',
      '`await` pauses the function, not the thread',
      'Errors: `try/catch` instead of `.catch`',
      'Sequential `await` in a loop is slow → `Promise.all` for parallel',
    ],
    followUps: ['How do you run two awaits in parallel?', 'What happens if you forget `await`?'],
  },
  'difference-between-promiseall-and-allsettled': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: '`all` is a group trip cancelled if one person drops out; `allSettled` goes ahead and reports who made it and who didn\'t.',
    quickRevision: [
      '`all`: rejects on the first failure; results in input order',
      '`allSettled`: never rejects; `{status, value | reason}` each',
      'Use `all` when every result is required',
      'Use `allSettled` for bulk jobs / partial success',
    ],
    followUps: ['What about `race` and `any`?', 'Does `Promise.all` cancel the other promises?'],
  },
  'does-await-block-the-main-thread': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: '`await` is putting a bookmark in your book and helping someone else; you come back to the page when the delivery arrives, and nobody waited on you.',
    quickRevision: [
      'No: it suspends only the current async function',
      'The rest of the program keeps running',
      'Continuation resumes as a microtask',
      'CPU-heavy code inside async functions still blocks',
    ],
    followUps: ['So why can an async function still freeze the UI?', 'Top-level await: where does it work?'],
  },
  'how-do-you-convert-callback-apis-to-promises': {
    difficulty: 'medium',
    analogy: 'Putting an old appliance on an adapter plug: the inside stays the same, but now it fits the modern socket (`await`).',
    quickRevision: [
      'Wrap in `new Promise((resolve, reject) => …)`',
      'Node: `util.promisify(fn)` for error-first callbacks',
      'Many modules ship promise versions (`fs/promises`)',
      'Call resolve/reject exactly once',
    ],
    followUps: ['Implement `promisify` yourself.', 'Implement `sleep(ms)`.'],
  },
});
