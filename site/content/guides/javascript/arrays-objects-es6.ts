import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Arrays, Objects & ES6',
  description: 'Destructuring, spread, map/filter/reduce, copying objects and other everyday ES6 features.',
  questions: [
    {
      id: 'difference-between-map-and-foreach',
      question: 'What is the difference between `map` and `forEach` (and where do `filter` and `reduce` fit)?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `**\`map\` returns a new array** of the same length, where each item is the callback's return value. **\`forEach\` returns \`undefined\`**; it just runs the callback for its side effects (logging, pushing somewhere, calling an API).

So I pick by intent: \`map\` to **transform** data (very common in React: \`items.map(i => <Row key={i.id} … />)\`), \`forEach\` for **side effects** only. Using \`map\` and ignoring the result is a smell.

The family around them:

- **\`filter\`** returns a new array with only the items whose callback returns truthy.
- **\`reduce\`** folds the array into **one value** of any shape: a sum, an object grouped by key, a lookup map.
- **\`find\`/\`some\`/\`every\`** stop early, which neither \`map\` nor \`forEach\` can do; for early exit with side effects I use \`for…of\` with \`break\`.

None of them mutate the array themselves, and none of them wait for \`async\` callbacks: \`forEach(async …)\` fires everything and moves on, so I use \`for…of\` with \`await\` or \`Promise.all(items.map(…))\` instead.`,
      analogy: `\`map\` is a photocopier that hands you a new stack of transformed pages; \`forEach\` is someone reading each page aloud: things happen, but you get nothing back.`,
      quickRevision: [
        '`map` → new array, same length; `forEach` → `undefined`',
        '`filter` → subset; `reduce` → any single value',
        '`find`/`some`/`every` stop early; `map`/`forEach` can\'t',
        '`forEach(async …)` doesn\'t wait: use `for…of` or `Promise.all(map)`',
      ],
      deepDive: `\`\`\`js
const orders = [
  { id: 1, status: 'paid', total: 40 },
  { id: 2, status: 'pending', total: 15 },
  { id: 3, status: 'paid', total: 25 },
];

const ids = orders.map((o) => o.id);                       // [1, 2, 3]
const paid = orders.filter((o) => o.status === 'paid');    // 2 orders
const revenue = paid.reduce((sum, o) => sum + o.total, 0); // 65
const byStatus = orders.reduce((acc, o) => {
  (acc[o.status] ??= []).push(o);
  return acc;
}, {});                                                    // { paid: [...], pending: [...] }

// Parallel async work
const details = await Promise.all(orders.map((o) => fetchOrder(o.id)));
\`\`\``,
      followUps: [
        'When would you use `reduce` instead of `map`?',
        'How do you stop a `forEach` early?',
        'What happens with `forEach` and `async` callbacks?',
      ],
    },
    {
      id: 'what-is-a-higher-order-function',
      question: 'What is a higher-order function? Give examples you use.',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `A higher-order function either **takes a function as an argument**, **returns a function**, or both. It's possible because functions in JavaScript are **first-class values**: you can store them, pass them and return them like any other value.

Examples I use all the time:

- **Taking a function**: \`map\`, \`filter\`, \`reduce\`, \`setTimeout\`, \`addEventListener\`, \`Array.prototype.sort\` with a comparator.
- **Returning a function**: \`debounce(fn, 300)\`, \`memoize(fn)\`, an Express **middleware factory** like \`requireRole('admin')\`, or a curried helper.
- **In React**: higher-order components like \`withAuth(Component)\`, and event handler factories like \`handleChange('email')\`.

The benefit is separating the **generic behaviour** (looping, timing, caching, auth checks) from the **specific logic** you plug in, which keeps code small and reusable. Returning functions relies on closures to remember the configuration.`,
      analogy: `A coffee machine that accepts pods: the machine (higher-order function) stays the same, and the pod you plug in (callback) decides the drink.`,
      quickRevision: [
        'Takes a function as an argument **or** returns one',
        'Works because functions are first-class values',
        'Takers: `map`, `filter`, `setTimeout`, `addEventListener`',
        'Returners: `debounce`, `memoize`, middleware factories, HOCs',
        'Returned functions use closures to remember config',
      ],
      deepDive: `\`\`\`js
const withLogging = (fn) => (...args) => {
  console.time(fn.name);
  const result = fn(...args);
  console.timeEnd(fn.name);
  return result;
};

const multiply = (a) => (b) => a * b;   // curried
const double = multiply(2);
[1, 2, 3].map(double);                  // [2, 4, 6]
\`\`\``,
      followUps: [
        'Write a function that returns a function.',
        'How do closures relate to higher-order functions?',
        'What is currying?',
      ],
    },
    {
      id: 'spread-vs-rest',
      question: 'What is the difference between the spread and rest operators?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `They're the same \`...\` syntax doing **opposite jobs**, and you tell them apart by position:

- **Spread expands** an iterable or object into individual items. It appears where values are **used**: in array literals (\`[...a, ...b]\`), object literals (\`{ ...defaults, ...options }\`) and function calls (\`Math.max(...nums)\`).
- **Rest collects** several items into one array or object. It appears where values are **received**: function parameters (\`function log(level, ...messages)\`) and destructuring (\`const { password, ...safeUser } = user\`).

Two details interviewers check. Spread copies are **shallow**: nested objects are still shared. And with objects, **later properties win**, so \`{ ...defaults, ...options }\` lets options override defaults. Rest must be the **last** parameter or destructuring element.

The rest-in-destructuring trick is my go-to for removing a key immutably, like stripping \`password\` before sending a user to the client.`,
      analogy: `Same \`...\` symbol, opposite jobs: **spread** unpacks a suitcase onto the bed; **rest** packs the leftover clothes into one bag.`,
      quickRevision: [
        'Spread expands: `[...arr]`, `{...obj}`, `fn(...args)`',
        'Rest collects: `(a, ...others)`, `const { id, ...rest } = obj`',
        'Spread copies are **shallow**; later keys win',
        'Rest must be last',
        'Remove a key immutably: `const { password, ...safe } = user`',
      ],
      deepDive: `\`\`\`js
const merged = { ...{ theme: 'light', lang: 'en' }, ...{ theme: 'dark' } };
// { theme: 'dark', lang: 'en' }

function sum(first, ...rest) {
  return rest.reduce((a, b) => a + b, first);
}
sum(1, 2, 3); // 6

const { password, ...safeUser } = { id: 1, email: 'a@b.c', password: 'x' };
// safeUser = { id: 1, email: 'a@b.c' }
\`\`\``,
      followUps: [
        'Does object spread deep-copy nested objects?',
        'How would you remove a key from an object immutably?',
        'What is the difference between `arguments` and rest parameters?',
      ],
    },
    {
      id: 'vs',
      question: 'What is the difference between `??` (nullish coalescing) and `||`, and how does `?.` fit in?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Both give a fallback, but they disagree on what counts as "missing":

- **\`a || b\`** returns \`b\` when \`a\` is **falsy**: \`0\`, \`''\`, \`false\`, \`NaN\`, \`null\` or \`undefined\`.
- **\`a ?? b\`** returns \`b\` only when \`a\` is **\`null\` or \`undefined\`**.

So \`??\` is the right default when \`0\`, \`''\` or \`false\` are valid values: a quantity of 0, an empty search string, a \`false\` setting. \`settings.volume || 50\` turns a muted volume of 0 into 50, which is a real bug I've seen; \`settings.volume ?? 50\` keeps it.

**Optional chaining \`?.\`** pairs naturally with it: \`user?.address?.city ?? 'Unknown'\` stops at the first \`null\`/\`undefined\` instead of throwing, then falls back. There are also assignment forms: \`a ??= b\`, \`a ||= b\`, \`a &&= b\`. One syntax rule: you can't mix \`??\` with \`||\` or \`&&\` without parentheses.`,
      analogy: `\`||\` replaces anything that *looks* empty (0, "", false); \`??\` only replaces things that are *truly missing* (null, undefined), like a form that keeps "0 items" instead of overwriting it with the default.`,
      quickRevision: [
        '`a || b` → b when a is **falsy**',
        '`a ?? b` → b only when a is **null or undefined**',
        'Use `??` when 0, "" or false are valid',
        '`?.` short-circuits on null/undefined instead of throwing',
        '`??=`, `||=`, `&&=` assignment forms',
      ],
      deepDive: `\`\`\`js
0 || 10;            // 10
0 ?? 10;            // 0
'' ?? 'default';    // ''
null ?? 'default';  // 'default'

const city = user?.address?.city ?? 'Unknown';
user.prefs ??= {};  // assign only if null/undefined
// a || b ?? c      // SyntaxError: needs parentheses
\`\`\``,
      followUps: [
        'What does `0 || 10` vs `0 ?? 10` return?',
        'How does optional chaining `?.` combine with `??`?',
        'Can you call a function with optional chaining?',
      ],
    },
    {
      id: 'pure-function',
      question: 'What is a pure function, and why does it matter in React and Redux?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript', 'react'],
      answer: `A pure function has two properties:

1. **Same input, same output**, every time. It doesn't depend on anything outside its arguments, like globals, \`Date.now()\` or \`Math.random()\`.
2. **No side effects**: it doesn't mutate its arguments or outside state, and doesn't do I/O like network calls, logging or writing to storage.

Pure functions are **easy to test** (no mocks), **safe to cache** (memoisation relies on it), and **easy to reason about**.

It matters in React because **components must be pure during render**: React may render a component several times, pause it, or throw a render away (Strict Mode deliberately double-renders to catch impurity). Side effects belong in event handlers or \`useEffect\`. **Redux reducers** must be pure too: they return a new state instead of mutating, which is what makes time-travel debugging and cheap reference checks work.

A watch-out: some built-ins mutate. \`sort\`, \`reverse\` and \`splice\` change the array in place; \`toSorted\`, \`toReversed\` and \`toSpliced\` are the pure versions.`,
      analogy: `A calculator: the same buttons always give the same result, and pressing them doesn't change anything else in the room.`,
      quickRevision: [
        'Same input → same output',
        'No side effects: no mutation, I/O, globals, randomness',
        'Easy to test, memoise and reason about',
        'React render and Redux reducers must be pure',
        '`sort`/`reverse` mutate; `toSorted`/`toReversed` don\'t',
      ],
      deepDive: `\`\`\`js
// Impure: mutates its argument and depends on time
function addItem(cart, item) {
  cart.items.push({ ...item, addedAt: Date.now() });
  return cart;
}

// Pure: new object, time passed in
function addItemPure(cart, item, now) {
  return { ...cart, items: [...cart.items, { ...item, addedAt: now }] };
}
\`\`\``,
      followUps: [
        'Why must Redux reducers be pure?',
        'Is `Array.prototype.sort` pure?',
        'How do you handle side effects in an otherwise pure codebase?',
      ],
    },
    {
      id: 'destructuring',
      question: 'How does destructuring work, and what are the common patterns you use?',
      perspective: 'practical',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript', 'react'],
      answer: `Destructuring **unpacks values from arrays or properties from objects into variables** in one statement.

- **Objects** match by **name**: \`const { name, email } = user\`. You can **rename** (\`{ name: userName }\`), give **defaults** (\`{ role = 'viewer' }\`), go **nested** (\`{ address: { city } }\`) and collect the rest (\`{ id, ...others }\`).
- **Arrays** match by **position**: \`const [first, second] = list\`, skip with commas (\`[, second]\`), and swap without a temp: \`[a, b] = [b, a]\`.

Where it shows up daily:

- **Function parameters**: \`function createUser({ name, role = 'viewer' } = {})\` gives named arguments with defaults, so the call order doesn't matter.
- **React**: props (\`function Card({ title, children })\`) and \`useState\`, which returns a pair: \`const [count, setCount] = useState(0)\`.
- **Imports and API responses**: \`const { data, error } = await supabase…\`.

One gotcha: destructuring \`undefined\` or \`null\` throws, so a nested pattern on optional data needs a default like \`{ address: { city } = {} }\`.`,
      analogy: `Unpacking a delivery box by label: you take out exactly the items you need and put each on the right shelf, instead of carrying the whole box around.`,
      quickRevision: [
        'Objects by name, arrays by position',
        'Rename `{ a: x }`, default `{ a = 1 }`, nested, rest `...`',
        'Parameter destructuring = named args with defaults',
        'React props and `useState` pairs',
        'Destructuring `null`/`undefined` throws → add `= {}` defaults',
      ],
      deepDive: `\`\`\`js
const user = { id: 7, profile: { name: 'Ana' }, tags: ['admin', 'dev'] };

const {
  id,
  profile: { name: displayName },
  address: { city } = {},   // safe: address is undefined
  tags: [primaryTag],
} = user;

function connect({ host = 'localhost', port = 5432, ssl = false } = {}) {
  return \`\${host}:\${port} ssl=\${ssl}\`;
}
connect({ port: 6543 });    // 'localhost:6543 ssl=false'
\`\`\``,
      followUps: [
        'Why does `useState` return an array instead of an object?',
        'How do you give a default to a nested destructured value?',
        'How do you swap two variables without a temp?',
      ],
    },
  ],
});
