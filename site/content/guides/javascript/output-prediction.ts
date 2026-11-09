import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Output Prediction',
  description: '"What does this print?" questions on the event loop, hoisting, this and references.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'javascript/closures/why-does-var-in-a-loop-print-the-same-value-with-settimeout',
    'javascript/this-and-arrow-functions/how-is-this-determined',
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
      answer: `Go in three passes: **sync code** first (including the body of an async function up to its first \`await\`), then **all microtasks** in the order they were queued (\`.then\` callbacks and \`await\` continuations), then **macrotasks** like \`setTimeout\`. This snippet prints \`1 4 6 3 5 2\`.`,
      analogy: `Three queues at an airport: people already at the desk (sync), then priority boarding (microtasks), then everyone else (macrotasks).`,
      quickRevision: [
        'Sync → microtasks → macrotasks',
        'Async function body runs sync until `await`',
        'Microtasks in queue order',
        'Answer: 1 4 6 3 5 2',
      ],
      deepDive: `**Output:** \`1 4 6 3 5 2\`
Synchronous code first (1, 4, 6). The async function runs synchronously until \`await\`. Then **microtasks** run in the order they were queued (3, 5). Then **macrotasks** (2).`,
      followUps: [
        'Add `process.nextTick`: where does it go?',
        'What if a `.then` schedules another `.then`?',
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
      answer: `In Node, \`process.nextTick\` callbacks run **before** promise microtasks, and both run before the event loop moves on. Then the timers phase (\`setTimeout\`) and the check phase (\`setImmediate\`) run. So: \`nextTick promise timeout immediate\`. The order of the last two can vary in the main module, but inside an I/O callback \`setImmediate\` always comes first.`,
      analogy: `nextTick is cutting in at the very front of the line, promises are the express lane, and timeout/immediate are two different later bus stops.`,
      quickRevision: [
        'nextTick > promises > timers/check',
        'Main module: timeout vs immediate order varies',
        'Inside I/O callback: immediate first',
      ],
      deepDive: `**Output (CommonJS):** \`nextTick promise timeout immediate\`. The order of the last two can vary in the main module. Inside an I/O callback, \`immediate\` always comes first.`,
      followUps: [
        'Why can `nextTick` starve I/O?',
        'Name the event-loop phases.',
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
      answer: `Walk each line: \`var\` is hoisted and initialised as \`undefined\`, so it logs **undefined**. \`let\` is hoisted but in the **TDZ**, so it throws **ReferenceError**. Function **declarations** are fully hoisted, so calling one early works. A **function expression** assigned to \`var\` is still \`undefined\` at that point, so calling it throws **TypeError: not a function**.`,
      analogy: `A guest list made before the party: some guests are already inside (function declarations), some are listed but not here yet (var = undefined), and some are listed but the bouncer won't let you talk to them yet (TDZ).`,
      quickRevision: [
        'var → undefined',
        'let/const → ReferenceError (TDZ)',
        'function declaration → works',
        'var fn expression → TypeError',
      ],
      deepDive: `\`\`\`js
console.log(a); // undefined  (var is hoisted and initialized as undefined)
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
      answer: `State the rule, then the result. \`+\` with a string **concatenates** (\`'5' + 2 → '52'\`). Other maths operators **convert to numbers** (\`'5' - 2 → 3\`). Objects and arrays convert to primitives through \`toString\` (\`[] + {} → '[object Object]'\`). \`null == undefined\` is a special rule. \`NaN\` isn't equal to itself. And \`0.1 + 0.2 !== 0.3\` because of floating point, which is why money should be stored in integer minor units.`,
      variants: [
        { label: 'Detailed version', answer: `| Expression | Result | Why |
|------------|--------|-----|
| \`'5' + 2\` | \`'52'\` | \`+\` with a string concatenates |
| \`'5' - 2\` | \`3\` | \`-\` converts to numbers |
| \`[] + []\` | \`''\` | both become empty strings |
| \`[] + {}\` | \`'[object Object]'\` | |
| \`true + 1\` | \`2\` | |
| \`null == undefined\` | \`true\` | special rule |
| \`null === undefined\` | \`false\` | different types |
| \`NaN === NaN\` | \`false\` | use \`Number.isNaN\` |
| \`0 == ''\` | \`true\` | both become 0 |
| \`typeof null\` | \`'object'\` | historic bug |
| \`typeof NaN\` | \`'number'\` | |
| \`[1,2,3] == '1,2,3'\` | \`true\` | array converted to a string |
| \`0.1 + 0.2 === 0.3\` | \`false\` | floating point. That's why money uses integers. |` },
      ],
      analogy: `Mixing currencies at a shop: \`+\` with a string staples the notes together instead of adding them; \`-\` converts everything to the same currency first.`,
      quickRevision: [
        '`+` with string → concatenation',
        '`- * /` → numbers',
        '`null == undefined` true, `===` false',
        '`NaN !== NaN` → `Number.isNaN`',
        '0.1+0.2 → store money as integers',
      ],
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
      answer: `Each call to \`counter()\` creates a **new scope** with its own \`count\`. \`c1\` and \`c2\` close over different variables, so after \`c1.inc()\` twice and \`c2.inc()\` once, it prints \`2 1\`.`,
      analogy: 'Two separate piggy banks from the same factory: dropping coins into one doesn\'t change the other.',
      quickRevision: [
        'Each call → new closure scope',
        'c1 and c2 don\'t share `count`',
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
      answer: `The throw in the first \`.then\` rejects the chain, so the next \`.then\` is **skipped** and \`.catch\` runs: **caught fail**. Because \`catch\` **returns a value** (2), the chain is fulfilled again, so the last \`.then\` logs **after 2**.`,
      analogy: `A relay race where a runner trips: the next runner is skipped, the medic (catch) patches things up, and the race continues with the medic's baton (the returned value).`,
      quickRevision: [
        'throw → skip to next catch',
        'catch returning a value recovers the chain',
        'Rethrow in catch to keep it rejected',
      ],
      deepDive: `**Output:** \`caught fail\` then \`after 2\`. \`catch\` returns a value, so the chain continues as fulfilled.`,
      followUps: [
        'What if `catch` rethrows?',
        'Where does `finally` fit and what does it receive?',
      ],
    },
  ],
});
