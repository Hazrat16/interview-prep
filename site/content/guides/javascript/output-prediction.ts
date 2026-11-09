import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Output Prediction',
  description: '"What does this print?" questions on the event loop, hoisting, this and references.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'javascript/closures/why-does-var-in-a-loop-print-the-same-value-with-settimeout',
    'javascript/this-and-arrow-functions/js-this-binding',
    'javascript/types-and-coercion/pass-by-value-vs-pass-by-reference-in-js',
  ],
  questions: [
    {
      id: 'event-loop-order',
      question: 'What does this print? (event loop order)',
      snippet: `\`\`\`js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
(async () => {
  console.log('4');
  await null;
  console.log('5');
})();
console.log('6');
\`\`\``,
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `It prints **\`1 4 6 3 5 2\`**. I trace it in three passes:

1. **Synchronous code** runs top to bottom: \`1\`. The \`setTimeout\` callback goes to the **macrotask** queue, the \`.then\` callback to the **microtask** queue. The async function starts **synchronously**, so it prints \`4\`, then hits \`await null\`: the rest of the function is queued as a microtask *after* the \`.then\`. Then \`6\`.
2. The stack is empty, so **all microtasks** run in the order they were queued: \`3\`, then the async function resumes and prints \`5\`.
3. Only then does the loop take the next **macrotask**: \`2\`.

The two rules doing the work: an async function runs synchronously **until its first \`await\`**, and \`setTimeout(…, 0)\` always loses to promise callbacks.`,
      analogy: `Three queues at an airport: people already at the desk (sync), then priority boarding (microtasks), then everyone else (macrotasks).`,
      quickRevision: [
        'Sync → all microtasks → one macrotask',
        'Async function body runs sync until `await`',
        'Code after `await` is a microtask, queued in order',
        'Answer: 1 4 6 3 5 2',
      ],
      followUps: [
        'Add `process.nextTick`: where does it go?',
        'What if a `.then` schedules another `.then`?',
        'What changes if `await null` becomes `await new Promise(r => setTimeout(r))`?',
      ],
    },
    {
      id: 'node-nexttick-vs-promise-vs-setimmediate',
      question: 'What does this print in Node? (nextTick vs promise vs setImmediate)',
      snippet: `\`\`\`js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
\`\`\``,
      perspective: 'coding',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['javascript', 'nodejs'],
      answer: `In a CommonJS script it prints **\`nextTick promise timeout immediate\`**, with one caveat on the last two.

- Node has **two microtask-level queues**, and the **\`process.nextTick\` queue is drained first**, then the promise microtask queue. Both run as soon as the current synchronous code finishes, before the event loop moves to any phase.
- Then the event loop starts. The **timers** phase runs expired \`setTimeout\`s, and later the **check** phase runs \`setImmediate\` callbacks.

The caveat: from the **main module**, \`timeout\` vs \`immediate\` order **isn't guaranteed**, because it depends on whether the 1 ms minimum timer has already expired when the loop starts. **Inside an I/O callback**, \`setImmediate\` always runs first, because the check phase comes right after the poll phase.

In real code I avoid relying on this, and I'm careful with recursive \`nextTick\`, since it can **starve I/O**: the loop never gets to move on.`,
      analogy: `nextTick is cutting in at the very front of the line, promises are the express lane, and timeout/immediate are two different later bus stops.`,
      quickRevision: [
        'nextTick queue → promise microtasks → event loop phases',
        'Timers phase (`setTimeout`) → … → check phase (`setImmediate`)',
        'Main module: timeout vs immediate order varies',
        'Inside an I/O callback: immediate first',
        'Recursive `nextTick` can starve I/O',
      ],
      followUps: [
        'Why can `nextTick` starve I/O?',
        'Name the event-loop phases.',
        'Does this differ in an ES module?',
      ],
    },
    {
      id: 'hoisting-tdz',
      question: 'What happens on each line? (hoisting & TDZ)',
      snippet: `\`\`\`js
console.log(a);
var a = 1;

console.log(b);
let b = 2;

foo();
function foo() { console.log('hi'); }

bar();
var bar = function () {};
\`\`\``,
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Taking each pair as if it ran on its own (in one script, the first error would stop everything after it):

1. **\`undefined\`**: \`var a\` is hoisted and initialised to \`undefined\`; the assignment \`= 1\` hasn't run yet.
2. **\`ReferenceError\`**: \`let b\` is hoisted but in the **temporal dead zone** until its line runs.
3. **\`"hi"\`**: function **declarations** are hoisted with their body, so calling early works.
4. **\`TypeError: bar is not a function\`**: \`var bar\` is hoisted as \`undefined\`; the function expression is only assigned on the next line, and calling \`undefined\` is a type error, not a reference error.

The pattern to state: **declarations are known up front, but only function declarations are usable before their line**, \`var\` only as \`undefined\`, and \`let\`/\`const\`/\`class\` not at all.`,
      analogy: `A guest list made before the party: some guests are already inside (function declarations), some are listed but not here yet (var = undefined), and some are listed but the bouncer won't let you talk to them yet (TDZ).`,
      quickRevision: [
        'var → undefined',
        'let/const → ReferenceError (TDZ)',
        'function declaration → works',
        'var + function expression → TypeError',
      ],
      deepDive: `\`\`\`js
console.log(a); // undefined  (var is hoisted and initialised as undefined)
var a = 1;

console.log(b); // ReferenceError (let is in the temporal dead zone)
let b = 2;

foo();          // "hi"  (function declarations are fully hoisted)
function foo() { console.log('hi'); }

bar();          // TypeError: bar is not a function (var bar is undefined)
var bar = function () {};
\`\`\``,
      followUps: [
        'Are classes hoisted?',
        'What does `typeof` do in the TDZ?',
      ],
    },
    {
      id: 'coercion',
      question: 'What do these coercion expressions evaluate to?',
      snippet: `\`\`\`js
'5' + 2
'5' - 2
[] + {}
true + 1
null == undefined
NaN === NaN
0 == ''
typeof null
0.1 + 0.2 === 0.3
\`\`\``,
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `I'd state the rule for each, then the result:

- \`'5' + 2\` → **\`'52'\`**: \`+\` with a string on either side **concatenates**.
- \`'5' - 2\` → **\`3\`**: every other maths operator **converts to numbers**.
- \`[] + {}\` → **\`'[object Object]'\`**: objects convert to primitives via \`toString\`; \`[]\` becomes \`''\`, \`{}\` becomes \`'[object Object]'\`, then they concatenate.
- \`true + 1\` → **\`2\`**: \`true\` becomes \`1\`.
- \`null == undefined\` → **\`true\`**: a special rule; they only loosely equal each other.
- \`NaN === NaN\` → **\`false\`**: \`NaN\` is never equal to anything, so use \`Number.isNaN\`.
- \`0 == ''\` → **\`true\`**: \`''\` converts to \`0\`.
- \`typeof null\` → **\`'object'\`**: a bug from the first JS version, kept for compatibility.
- \`0.1 + 0.2 === 0.3\` → **\`false\`**: floating point gives \`0.30000000000000004\`, which is why money is stored in integer cents.`,
      analogy: `Mixing currencies at a shop: \`+\` with a string staples the notes together instead of adding them; \`-\` converts everything to the same currency first.`,
      quickRevision: [
        '`+` with string → concatenation',
        '`- * /` → numbers',
        '`null == undefined` true, `===` false',
        '`NaN !== NaN` → `Number.isNaN`',
        '0.1+0.2 → store money as integers',
      ],
      deepDive: `| Expression | Result | Why |
|------------|--------|-----|
| \`[] + []\` | \`''\` | both become empty strings |
| \`null === undefined\` | \`false\` | different types |
| \`typeof NaN\` | \`'number'\` | |
| \`[1,2,3] == '1,2,3'\` | \`true\` | array converted to a string |
| \`[] == ![]\` | \`true\` | \`![]\` → \`false\` → \`0\`; \`[]\` → \`''\` → \`0\` |`,
      followUps: [
        'What is `[] == ![]`?',
        'How do you safely sum money in JS?',
      ],
    },
    {
      id: 'closures',
      question: 'What does this print? (closures)',
      snippet: `\`\`\`js
function counter() {
  let count = 0;
  return { inc: () => ++count, get: () => count };
}
const c1 = counter();
const c2 = counter();
c1.inc(); c1.inc(); c2.inc();
console.log(c1.get(), c2.get());
\`\`\``,
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `It prints **\`2 1\`**.

Each **call** to \`counter()\` runs the function again and creates a **brand-new scope** with its own \`count = 0\`. The returned \`inc\` and \`get\` close over **that call's** \`count\`. So \`c1\`'s methods share one counter, and \`c2\`'s methods share a different one.

\`c1.inc()\` twice takes \`c1\`'s count to 2; \`c2.inc()\` once takes \`c2\`'s count to 1. Neither can see or change the other's, and nothing outside can touch \`count\` directly. That's the private-state pattern closures are used for.

If I wanted both to share one counter, I'd move \`let count = 0\` **outside** \`counter()\` so every returned closure captures the same variable.`,
      analogy: `Two separate piggy banks from the same factory: dropping coins into one doesn't change the other.`,
      quickRevision: [
        'Each call → new closure scope',
        'c1 and c2 don\'t share `count`',
        'Methods from the same call do share it',
        'Output: 2 1',
      ],
      followUps: [
        'How would you make them share a count?',
        'Is `count` accessible from outside?',
      ],
    },
    {
      id: 'promise-chain-with-error',
      question: 'What does this print? (promise chain with an error)',
      snippet: `\`\`\`js
Promise.resolve(1)
  .then((v) => { throw new Error('fail'); })
  .then(() => console.log('skipped'))
  .catch((e) => { console.log('caught', e.message); return 2; })
  .then((v) => console.log('after', v));
\`\`\``,
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `It prints **\`caught fail\`** and then **\`after 2\`**. \`skipped\` never prints.

1. The first \`.then\` **throws**, so the promise it returns is **rejected** with that error.
2. A rejected promise **skips every \`.then\` that has no rejection handler**, so the second \`.then\` doesn't run.
3. \`.catch\` handles it and logs \`caught fail\`. Crucially, it **returns \`2\`**, and whatever a handler returns becomes a **fulfilled** value. The chain has recovered.
4. So the last \`.then\` runs with \`v = 2\`: \`after 2\`.

If the \`catch\` had **re-thrown** instead, the last \`.then\` would be skipped too and the rejection would continue down the chain, becoming an unhandled rejection if nothing else caught it.`,
      analogy: `A relay race where a runner trips: the next runner is skipped, the medic (catch) patches things up, and the race continues with the medic's baton (the returned value).`,
      quickRevision: [
        'throw → chain rejected → skip to next catch',
        'catch returning a value recovers the chain',
        'Rethrow in catch to keep it rejected',
        'Output: caught fail, after 2',
      ],
      followUps: [
        'What if `catch` rethrows?',
        'Where does `finally` fit and what does it receive?',
      ],
    },
  ],
});
