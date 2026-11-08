import { defineEnrichments } from '../../../lib/content/enrich-schema';

/**
 * Coding solutions: the note has the code; `answer` is how to TALK through it
 * in a live round (approach → edge cases → complexity).
 */
export default defineEnrichments('javascript/coding-round-solutions.md', {
  // ---------------------------------------------------------------- Implement it yourself
  'debounce--throttle': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `**Debounce**: keep a timer in a closure. On every call, clear the previous timer and start a new one, so the function only runs after calls stop for \`wait\` ms. I preserve \`this\` and the latest arguments with \`fn.apply(this, args)\` and expose \`cancel()\` for cleanup.

**Throttle**: keep the time of the last run (or a "waiting" flag). If enough time has passed, run immediately; otherwise ignore the call (or schedule one trailing call). So it runs **at most once per interval**.

Use debounce for search inputs and auto-save, throttle for scroll and resize handlers.`,
    analogy: 'Debounce is a lift door that waits until nobody has walked in for a few seconds; throttle is a bus that leaves on a fixed schedule however many people arrive.',
    quickRevision: [
      'Debounce: `clearTimeout` + `setTimeout` on every call',
      'Throttle: run if `now - last >= wait`, else skip/schedule trailing',
      'Keep `this` + args with `apply`',
      'Expose `cancel()`; optional leading/trailing options',
    ],
    followUps: ['Add a `leading` option to debounce.', 'Write a `useDebounce` React hook.', 'Throttle with trailing call: how?'],
  },
  'promiseall': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `I return a new Promise. I keep a \`results\` array and a \`completed\` counter. For each input I wrap it with \`Promise.resolve()\` (so plain values work), and on success store the value **at its index**, not with \`push\`, so the order matches the input. When \`completed === length\` I resolve. The first rejection rejects the whole thing. Edge case: an empty array resolves immediately with \`[]\`.

Complexity: O(n) extra space; time is the slowest promise, since they run concurrently.`,
    analogy: 'A teacher collecting homework: each paper goes into the slot with the student\'s number (index), the bundle is handed in only when every slot is filled, and one missing paper with a note "failed" stops the whole hand-in.',
    quickRevision: [
      'Wrap each item with `Promise.resolve`',
      'Store by index → order preserved',
      'Counter → resolve when all done',
      'First rejection rejects; empty input → `[]`',
    ],
    followUps: ['Now implement `allSettled`.', 'Why not use `results.push`?', 'How would you add a concurrency limit?'],
  },
  'promiseallsettled--promiserace--promiseany': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `They follow the same skeleton as \`Promise.all\`, with different settle rules:

- **allSettled**: never reject. Store \`{ status: 'fulfilled', value }\` or \`{ status: 'rejected', reason }\` at each index, and resolve when all are done.
- **race**: resolve or reject with whichever promise settles first. Just forward \`resolve\` and \`reject\` to each one.
- **any**: resolve with the first **fulfilment**. Count rejections, and if all reject, reject with an \`AggregateError\` of the reasons.`,
    analogy: 'allSettled is a full report card; race is "first to cross the line, win or fall"; any is "first one who actually finishes".',
    quickRevision: [
      'allSettled: always resolves with status objects',
      'race: first settled (good for timeouts)',
      'any: first fulfilled; all rejected → AggregateError',
    ],
    followUps: ['Use `race` to add a timeout to fetch.', 'Does `race` cancel the losers?'],
  },
  'sleep--promisify': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `**sleep**: \`ms => new Promise(resolve => setTimeout(resolve, ms))\`. It doesn't block anything; it just resolves later.

**promisify**: return a function that takes the args, returns a new Promise, and calls the original function with an extra **error-first callback** \`(err, value) => err ? reject(err) : resolve(value)\`. Keep \`this\` with \`fn.call(this, ...args, cb)\`.`,
    analogy: 'promisify is a travel adapter: the old callback plug stays the same, but now it fits the modern `await` socket.',
    quickRevision: [
      'sleep = Promise + setTimeout',
      'promisify: wrap in a Promise, append an error-first callback',
      'Node has `util.promisify` built in',
    ],
    followUps: ['How would you add cancellation to sleep?', 'What if the callback is called twice?'],
  },
  'retry-with-exponential-backoff': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Loop up to \`retries\` times: try the async function and return on success. On failure, if attempts remain, wait \`base * 2 ** attempt\` ms **plus random jitter**, then try again; otherwise rethrow the last error.

What I say out loud: only retry **idempotent** or safe operations, and only on retryable errors like timeouts, 429 or 503 (not 400s). Cap the maximum delay. Jitter prevents every client retrying at the same moment (thundering herd).`,
    analogy: 'Calling a busy friend: you wait a little, then longer each time, and you don\'t all call at exactly the same second (jitter).',
    quickRevision: [
      'Delay = base × 2^attempt + jitter, capped',
      'Retry only idempotent operations / retryable errors',
      'Rethrow after the last attempt',
      'Respect `Retry-After` for 429',
    ],
    followUps: ['Why add jitter?', 'How does a circuit breaker relate to retries?', 'Would you retry a payment request?'],
  },
  'concurrency-limit-run-n-async-tasks-at-a-time': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `I start **N workers**. Each worker loops: take the next index (\`const i = next++\`), await \`tasks[i]()\`, store the result at \`results[i]\`, and repeat until no tasks are left. Then \`await Promise.all(workers)\` and return the results.

Taking the index with \`next++\` is safe because JavaScript is single-threaded between awaits. Results keep input order. At most N tasks are in flight at any time. Edge cases: \`limit > tasks.length\`, an empty list, and deciding whether one failure should stop everything or be collected.`,
    analogy: 'A bank with N cashiers and one queue: each cashier calls "next!" as soon as they finish, so at most N customers are served at once and nobody waits for a whole batch to finish.',
    quickRevision: [
      'N workers pulling from a shared index',
      '`next++` is safe (single-threaded between awaits)',
      'Store by index → ordered results',
      '`Promise.all(workers)` to finish',
    ],
    followUps: ['How would you collect errors instead of failing fast?', 'Why is this better than batches of N with `Promise.all`?', 'Libraries that do this? (p-limit)'],
  },
  'deep-clone-handles-date-arrays-cycles': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `A recursive function with a \`WeakMap\` of already-cloned objects:

1. Primitives and functions: return as is.
2. If the object is in the map, return the existing clone (this handles **cycles**).
3. \`Date\` → \`new Date(value)\`, plus RegExp, Map and Set if needed.
4. Create an empty array or object (keeping the prototype if required), **store it in the map before recursing**, then clone each own key.

In real code I'd use \`structuredClone\`, which handles Dates, Maps, Sets and cycles.`,
    analogy: 'Photocopying a binder where some pages refer back to earlier pages: you keep a list of pages you\'ve already copied, so you never copy the same page twice or loop forever.',
    quickRevision: [
      'Recursion + WeakMap for cycles',
      'Put the clone in the map **before** recursing',
      'Special-case Date (and Map/Set/RegExp)',
      'In practice: `structuredClone`',
    ],
    followUps: ['Why WeakMap instead of Map?', 'What does `JSON.parse(JSON.stringify())` lose?'],
  },
  'flatten-array-with-depth': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Recursive \`reduce\`: for each item, if it's an array **and** \`depth > 0\`, concatenate \`flatten(item, depth - 1)\`; otherwise push the item. Default \`depth = 1\` to match \`Array.prototype.flat\`, and \`Infinity\` flattens completely.

An iterative version uses a stack to avoid deep recursion. O(n) over the total number of elements.`,
    analogy: 'Unpacking nested gift boxes, but only opening as many layers as you were told to.',
    quickRevision: ['`reduce` + recursion with `depth - 1`', 'Default depth 1; `Infinity` for full', 'Iterative stack version avoids recursion limits'],
    followUps: ['Write it without recursion.', 'How does `Array.prototype.flat` handle holes?'],
  },
  'polyfills-map-filter-reduce': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Add to \`Array.prototype\` using a **regular function** (so \`this\` is the array). Loop over indexes, **skip holes** (\`if (i in this)\`), and call the callback with \`(element, index, array)\` and an optional \`thisArg\`.

- **map** builds a new array of the same length.
- **filter** pushes items whose callback is truthy.
- **reduce** starts from \`initialValue\`, or the first element if none is given, and throws a \`TypeError\` on an empty array with no initial value.`,
    analogy: 'Rebuilding a familiar tool from scratch to prove you know exactly how the original works, including the awkward edge cases.',
    quickRevision: [
      'Regular function so `this` = array',
      'Callback args: (el, i, arr); support `thisArg`',
      'reduce: missing initial → first element; empty → TypeError',
      'Skip holes with `i in this`',
    ],
    followUps: ['Why not use an arrow function for the polyfill?', 'What does reduce do with an empty array?'],
  },
  'polyfills-call-apply-bind': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `**call**: temporarily attach the function to the context object under a unique \`Symbol\` key, call it as \`ctx[key](...args)\` so \`this\` is the context, delete the key, and return the result. Use \`globalThis\` if the context is null.

**apply**: same, but the arguments come as an array.

**bind**: return a new function that calls the original with the bound \`this\` and **merged arguments** (\`[...boundArgs, ...laterArgs]\`). If the bound function is called with \`new\`, the new object should win over the bound \`this\`.`,
    analogy: 'call/apply lend the function a temporary name badge saying "I belong to this object" for one call; bind prints a permanent badge.',
    quickRevision: [
      'Attach under a Symbol, call, delete',
      'apply = call with an array of args',
      'bind returns a function with pre-filled this + args',
      'Handle null context and `new` with bind',
    ],
    followUps: ['Why use a Symbol key?', 'Can you re-bind a bound function?'],
  },
  'memoize--once--curry': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `All three are **closures**:

- **memoize**: a \`Map\` cache keyed by the arguments (\`JSON.stringify(args)\` or a custom resolver). Return the cached value if present, otherwise compute and store it. Only safe for pure functions, and the cache should be bounded.
- **once**: a \`called\` flag and a saved \`result\`. The first call runs the function; later calls return the saved result.
- **curry**: if the number of collected arguments is at least \`fn.length\`, call \`fn\`; otherwise return a function that collects more. So \`sum(1)(2)(3)\` works.`,
    analogy: 'memoize is a cheat sheet of answers already worked out; once is a single-use ticket; curry is filling in a form one field at a time until it\'s complete.',
    quickRevision: [
      'memoize: Map cache, pure functions only, bound the size',
      'once: flag + stored result',
      'curry: compare collected args with `fn.length`',
      'All rely on closures',
    ],
    followUps: ['How do you choose a cache key for object args?', 'Infinite curry: `sum(1)(2)(3)()`?'],
  },
  'event-emitter': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `A class with a \`Map<event, Set<listener>>\`:

- **on**: add the listener and return an unsubscribe function.
- **off**: delete the listener.
- **emit**: copy the listeners first (\`[...set]\`) so listeners that unsubscribe during emit don't break the loop, then call each with the args.
- **once**: wrap the listener in a function that calls \`off\` and then the original, and keep a reference so \`off(original)\` still works.`,
    analogy: 'A newsletter: people subscribe to topics, the publisher sends each issue to everyone on that list, and "once" subscribers are unsubscribed automatically after the first issue.',
    quickRevision: [
      'Map of event → Set of listeners',
      '`on` returns an unsubscribe function',
      'Copy listeners before emitting',
      '`once` = wrapper that removes itself',
    ],
    followUps: ['How would you avoid memory leaks with emitters?', 'How is this similar to Node\'s EventEmitter?'],
  },
  'getobj-path-default': {
    difficulty: 'easy',
    frequency: 'medium',
    answer: `Normalise the path into keys: accept an array, or turn \`'a[0].b'\` into \`['a', '0', 'b']\` with a regex replace and split. Walk the keys, stopping and returning the default as soon as the current value is \`null\` or \`undefined\`. At the end, return the default only if the result is \`undefined\`, so legitimate \`null\`, \`0\` or \`false\` values are kept.`,
    analogy: 'Following directions room by room in a building, and if a door doesn\'t exist you stop and use the backup address instead of crashing into a wall.',
    quickRevision: ['Normalise path (dots + brackets)', 'Stop on null/undefined', 'Default only for `undefined` result', 'Modern code: optional chaining'],
    followUps: ['Now write `set(obj, path, value)`.', 'How does optional chaining compare?'],
  },
  'deep-equal': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `Recursive comparison:

1. If \`Object.is(a, b)\`, return true (this handles \`NaN\`).
2. If either isn't an object, or one is null, return false.
3. Arrays vs objects must match, and so must constructors and prototypes.
4. Compare key counts, then recurse into every key.
5. Special-case \`Date\` (compare times), and optionally Map, Set and cycles (with a seen map).`,
    analogy: 'Comparing two LEGO models brick by brick, not just checking that both boxes say "castle".',
    quickRevision: ['`Object.is` first', 'Type/array/prototype checks', 'Same key count, recurse per key', 'Special cases: Date, NaN, cycles'],
    followUps: ['How would you handle circular references?', 'Where do you need deep equality in React?'],
  },
  'lru-cache': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `A JavaScript \`Map\` keeps **insertion order**, which makes LRU simple:

- **get**: if the key exists, delete it and set it again (moving it to the "most recent" end), then return the value.
- **put**: delete the key if it exists, set it, and if \`size > capacity\` remove the **oldest** entry, which is \`map.keys().next().value\`.

Both are O(1). The classic alternative is a hash map plus a doubly linked list, which is what you'd explain in a language without ordered maps.`,
    analogy: 'A small desk with limited space: anything you touch moves to the top of the pile, and when the desk is full, the thing at the bottom (least recently used) goes back on the shelf.',
    quickRevision: [
      'Map preserves insertion order',
      'get: delete + set to refresh',
      'put: evict `keys().next().value` when over capacity',
      'O(1) get/put; classic: hashmap + doubly linked list',
    ],
    followUps: ['Implement it with a doubly linked list.', 'Where would you use an LRU in a real app?', 'LRU vs LFU?'],
  },
  // ---------------------------------------------------------------- Output prediction
  'event-loop-order': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `Go in three passes: **sync code** first (including the body of an async function up to its first \`await\`), then **all microtasks** in the order they were queued (\`.then\` callbacks and \`await\` continuations), then **macrotasks** like \`setTimeout\`. For the snippet in my notes that gives \`1 4 6 3 5 2\`.`,
    analogy: 'Three queues at an airport: people already at the desk (sync), then priority boarding (microtasks), then everyone else (macrotasks).',
    quickRevision: ['Sync → microtasks → macrotasks', 'Async function body runs sync until `await`', 'Microtasks in queue order', 'Answer: 1 4 6 3 5 2'],
    followUps: ['Add `process.nextTick`: where does it go?', 'What if a `.then` schedules another `.then`?'],
  },
  'node-nexttick-vs-promise-vs-setimmediate': {
    difficulty: 'hard',
    frequency: 'medium',
    answer: `In Node, \`process.nextTick\` callbacks run **before** promise microtasks, and both run before the event loop moves on. Then the timers phase (\`setTimeout\`) and the check phase (\`setImmediate\`) run. So: \`nextTick promise timeout immediate\`. The order of the last two can vary in the main module, but inside an I/O callback \`setImmediate\` always comes first.`,
    analogy: 'nextTick is cutting in at the very front of the line, promises are the express lane, and timeout/immediate are two different later bus stops.',
    quickRevision: ['nextTick > promises > timers/check', 'Main module: timeout vs immediate order varies', 'Inside I/O callback: immediate first'],
    followUps: ['Why can `nextTick` starve I/O?', 'Name the event-loop phases.'],
  },
  'var-vs-let-in-a-loop': {
    sameAs: 'javascript/closures/why-does-var-in-a-loop-print-the-same-value-with-settimeout',
  },
  'hoisting--tdz': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Walk each line: \`var\` is hoisted and initialised as \`undefined\`, so it logs **undefined**. \`let\` is hoisted but in the **TDZ**, so it throws **ReferenceError**. Function **declarations** are fully hoisted, so calling one early works. A **function expression** assigned to \`var\` is still \`undefined\` at that point, so calling it throws **TypeError: not a function**.`,
    analogy: 'A guest list made before the party: some guests are already inside (function declarations), some are listed but not here yet (var = undefined), and some are listed but the bouncer won\'t let you talk to them yet (TDZ).',
    quickRevision: ['var → undefined', 'let/const → ReferenceError (TDZ)', 'function declaration → works', 'var fn expression → TypeError'],
    followUps: ['Are classes hoisted?', 'What does `typeof` do in the TDZ?'],
  },
  'this': {
    sameAs: 'javascript/this-and-arrow-functions/how-is-this-determined',
  },
  'coercion': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `State the rule, then the result. \`+\` with a string **concatenates** (\`'5' + 2 → '52'\`). Other maths operators **convert to numbers** (\`'5' - 2 → 3\`). Objects and arrays convert to primitives through \`toString\` (\`[] + {} → '[object Object]'\`). \`null == undefined\` is a special rule. \`NaN\` isn't equal to itself. And \`0.1 + 0.2 !== 0.3\` because of floating point, which is why money should be stored in integer minor units.`,
    analogy: 'Mixing currencies at a shop: `+` with a string staples the notes together instead of adding them; `-` converts everything to the same currency first.',
    quickRevision: ['`+` with string → concatenation', '`- * /` → numbers', '`null == undefined` true, `===` false', '`NaN !== NaN` → `Number.isNaN`', '0.1+0.2 → store money as integers'],
    followUps: ['What is `[] == ![]`?', 'How do you safely sum money in JS?'],
  },
  'closures': {
    difficulty: 'easy',
    answer: `Each call to \`counter()\` creates a **new scope** with its own \`count\`. \`c1\` and \`c2\` close over different variables, so after \`c1.inc()\` twice and \`c2.inc()\` once, it prints \`2 1\`.`,
    analogy: 'Two separate piggy banks from the same factory: dropping coins into one doesn\'t change the other.',
    quickRevision: ['Each call → new closure scope', 'c1 and c2 don\'t share `count`', 'Output: 2 1'],
    followUps: ['How would you make them share a count?', 'Is `count` accessible from outside?'],
  },
  'references': {
    sameAs: 'javascript/types-and-coercion/pass-by-value-vs-pass-by-reference-in-js',
  },
  'promise-chain-with-error': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `The throw in the first \`.then\` rejects the chain, so the next \`.then\` is **skipped** and \`.catch\` runs: **caught fail**. Because \`catch\` **returns a value** (2), the chain is fulfilled again, so the last \`.then\` logs **after 2**.`,
    analogy: 'A relay race where a runner trips: the next runner is skipped, the medic (catch) patches things up, and the race continues with the medic\'s baton (the returned value).',
    quickRevision: ['throw → skip to next catch', 'catch returning a value recovers the chain', 'Rethrow in catch to keep it rejected'],
    followUps: ['What if `catch` rethrows?', 'Where does `finally` fit and what does it receive?'],
  },
  // ---------------------------------------------------------------- DSA
  'two-sum-hash-map--on': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `Brute force is O(n²) with two loops. Better: one pass with a **Map from value to index**. For each number, compute \`need = target - num\`. If \`need\` is already in the map, return both indexes; otherwise store the current number. That's **O(n) time, O(n) space**. Check the number **before** inserting it so the same element isn't used twice.`,
    analogy: 'Looking for a dance partner whose height fits: instead of comparing everyone with everyone, each person writes their height on a board, and you just check the board for the height you need.',
    quickRevision: ['Map value → index', 'Check `target - num` before inserting', 'O(n) time, O(n) space', 'Brute force O(n²) to mention first'],
    followUps: ['What if the array is sorted? (two pointers, O(1) space)', 'Return all pairs instead of one?'],
  },
  'contains-duplicate--first-unique-character': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `**Contains duplicate**: add items to a \`Set\`, and if one is already there, return true. O(n). (Or compare \`new Set(arr).size !== arr.length\`.)

**First unique character**: first pass, count frequencies in a Map; second pass, return the first index whose count is 1. O(n) time, O(k) space for the alphabet.`,
    analogy: 'A guest list at the door: if a name is already ticked, it\'s a duplicate. To find the first person who came alone, count everyone first, then walk the queue again.',
    quickRevision: ['Set for "seen before"', 'Frequency Map + second pass for first unique', 'O(n) time'],
    followUps: ['Solve without extra space?', 'What changes for a stream of characters?'],
  },
  'group-anagrams--on--k-log-k': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Anagrams share the same letters, so I give each word a **canonical key**: its sorted letters (\`'eat' → 'aet'\`). Group words in a \`Map<key, string[]>\` and return the values. Time is O(n · k log k) for sorting each word. An O(n · k) alternative uses a 26-letter count array joined into the key.`,
    analogy: 'Sorting Scrabble tiles of each word alphabetically: words made of the same tiles end up with the identical tile row and land in the same pile.',
    quickRevision: ['Key = sorted letters (or 26-count signature)', 'Map key → list', 'O(n·k log k) or O(n·k)'],
    followUps: ['Why is the count-array key faster?', 'Handle Unicode or uppercase?'],
  },
  'valid-anagram--valid-palindrome-two-pointers': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `**Valid anagram**: if the lengths differ, return false. Otherwise count characters up for the first string and down for the second, and every count must end at 0. O(n).

**Valid palindrome**: **two pointers** from both ends. Skip non-alphanumeric characters, compare lowercase characters, move inward, and return false on any mismatch. O(n) time, O(1) space.`,
    analogy: 'Palindrome check is two people reading a word from opposite ends toward the middle, shouting if their letters ever differ.',
    quickRevision: ['Anagram: length check + char counts', 'Palindrome: two pointers inward', 'Skip non-alphanumerics, lowercase', 'O(n) time, O(1) space for palindrome'],
    followUps: ['Valid palindrome if you can delete one character?', 'Why not reverse the string?'],
  },
  'container-with-most-water-two-pointers--on': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `Two pointers at both ends. Area = \`min(h[l], h[r]) * (r - l)\`; track the maximum. Then **move the shorter side** inward, because moving the taller one can never increase the area (the width shrinks and the height is still limited by the shorter line). O(n) time, O(1) space.`,
    analogy: 'Two walls of a fish tank: the water level is set by the shorter wall, so the only hope of more water is replacing the shorter wall, not the taller one.',
    quickRevision: ['Pointers at both ends', 'Area = min height × width', 'Move the shorter side', 'O(n), O(1)'],
    followUps: ['Prove why moving the shorter side is safe.', 'Trapping Rain Water: how is it different?'],
  },
  'longest-substring-without-repeating-characters-sliding-window--on': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `**Sliding window** with a Map of each character's last index. Move \`right\` across the string. If the character was seen **inside the current window**, jump \`left\` to \`lastIndex + 1\`. Update the last index and the best length \`right - left + 1\`. Each character is processed once, so it's O(n).`,
    analogy: 'A train window sliding along the track: as soon as you see a repeat inside the window, you slide the back of the window forward past the old copy.',
    quickRevision: ['Window [left, right]', 'Map char → last index', 'On repeat inside window: left = last + 1', 'O(n) time'],
    followUps: ['Why `Math.max(left, last + 1)`?', 'Return the substring itself, not just the length?'],
  },
  'max-sum-subarray-kadane--on': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `**Kadane's algorithm**: keep \`current\`, the best sum ending at this index, as \`max(num, current + num)\`. In other words, drop the running sum as soon as it would hurt. Track \`best = max(best, current)\`. Start both at the first element so all-negative arrays work. O(n), O(1).`,
    analogy: 'Walking with a running bank balance: if your balance goes below the next deposit alone, you start fresh from that deposit.',
    quickRevision: ['current = max(num, current + num)', 'best = max(best, current)', 'Init with first element (all negatives)', 'O(n), O(1)'],
    followUps: ['Return the start and end indexes too.', 'Max product subarray: what changes?'],
  },
  'valid-parentheses-stack--on': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `Use a **stack**. Push opening brackets. For a closing bracket, the top of the stack must be its matching opener (look it up in a map); otherwise return false. At the end the stack must be **empty**. O(n) time and space.`,
    analogy: 'Russian dolls: every doll you open must be closed in reverse order, and the last doll opened is the first one closed.',
    quickRevision: ['Push openers', 'Closer must match the top', 'Stack empty at the end', 'O(n) time and space'],
    followUps: ['Minimum insertions to make it valid?', 'Longest valid parentheses substring?'],
  },
  'binary-search--olog-n': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `On a **sorted** array: \`lo = 0, hi = n - 1\`. While \`lo <= hi\`, take \`mid\`. If it equals the target, return it. If it's smaller, \`lo = mid + 1\`; otherwise \`hi = mid - 1\`. Return -1 if not found. O(log n). Watch for off-by-one errors and use \`lo + Math.floor((hi - lo) / 2)\` for mid. The same template finds the first or last occurrence and insert positions.`,
    analogy: 'Finding a word in a dictionary: open in the middle, decide which half it\'s in, and throw the other half away.',
    quickRevision: ['Requires sorted input', 'lo <= hi; move lo/hi past mid', 'O(log n)', 'Variants: first/last occurrence, lower bound'],
    followUps: ['Search in a rotated sorted array.', 'Find the first position ≥ target.'],
  },
  'reverse-linked-list--detect-cycle--merge-two-sorted-lists': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Reverse**: three pointers (\`prev\`, \`curr\`, \`next\`). Point \`curr.next\` back to \`prev\` and step forward. O(n), O(1).
- **Detect cycle**: Floyd's **slow/fast** pointers. If fast ever meets slow, there's a cycle; if fast reaches null, there isn't. O(1) space.
- **Merge two sorted lists**: a **dummy head** and a tail pointer. Attach the smaller node each time, then attach the rest. O(n + m).`,
    analogy: 'Cycle detection is a runner and a walker on a track: on a loop, the runner eventually laps the walker; on a straight road, the runner just reaches the end.',
    quickRevision: ['Reverse: prev/curr/next', 'Cycle: slow 1 step, fast 2 steps', 'Merge: dummy head + tail', 'All O(1) extra space'],
    followUps: ['Find where the cycle starts.', 'Reverse a list recursively.'],
  },
  'trees-max-depth-invert-level-order-validate-bst': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Max depth**: recursion, \`1 + max(depth(left), depth(right))\`.
- **Invert**: swap left and right at every node (recursively, or with BFS).
- **Level order**: **BFS with a queue**, processing \`queue.length\` nodes per level.
- **Validate BST**: pass down a valid **(min, max) range**, not just compare with the parent. Each node must satisfy \`min < val < max\`.

All are O(n). The recursion depth is the tree height.`,
    analogy: 'Validating a BST is like checking seat numbers in a theatre section: each seat must fit inside the whole section\'s range, not just be bigger than the seat next to it.',
    quickRevision: ['Depth: 1 + max(left, right)', 'Invert: swap children', 'Level order: queue, size per level', 'BST: carry (min, max) bounds'],
    followUps: ['Why does comparing only with the parent fail for BST validation?', 'Iterative inorder traversal?'],
  },
  'number-of-islands-grid-dfs--orows--cols': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Scan every cell. When I find land ('1'), increment the count and **flood-fill** (DFS or BFS) to mark the whole island as visited, either by setting cells to '0' or with a visited set, exploring four directions with bounds checks. Every cell is visited a constant number of times, so it's O(rows × cols). Use BFS or an explicit stack for very large grids to avoid recursion limits.`,
    analogy: 'Colouring a map: each time you find uncoloured land, you count a new island and paint all the land connected to it so you never count it twice.',
    quickRevision: ['Scan cells; on land → count++ and flood fill', 'Mark visited (mutate or Set)', '4 directions + bounds', 'O(rows·cols)'],
    followUps: ['Max area of an island?', 'Do it without mutating the grid.'],
  },
  'merge-intervals--on-log-n': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `**Sort by start time**. Walk through the intervals: if the current one starts **at or before** the end of the last merged interval, extend that end to \`max(lastEnd, currentEnd)\`; otherwise push a new interval. Sorting dominates, so O(n log n).`,
    analogy: 'Merging meeting bookings in a calendar: sort them by start time, and any meeting that starts before the previous one ends is folded into the same block.',
    quickRevision: ['Sort by start', 'Overlap if start <= lastEnd', 'Extend end with max', 'O(n log n)'],
    followUps: ['Insert a new interval into a sorted list.', 'Minimum meeting rooms needed?'],
  },
  'dynamic-programming-climbing-stairs-house-robber-coin-change': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `Same recipe each time: define the **state**, write the **recurrence**, set the **base cases**, then optimise memory.

- **Climbing stairs**: \`ways(n) = ways(n-1) + ways(n-2)\` (Fibonacci). Keep two variables, O(1) space.
- **House robber**: \`best(i) = max(best(i-1), best(i-2) + nums[i])\`, so at each house you either skip it or rob it.
- **Coin change** (minimum coins): \`dp[amount] = min(dp[amount - coin] + 1)\` over the coins, with \`dp[0] = 0\` and unreachable as Infinity → return -1.`,
    analogy: 'Building a staircase of answers: each step\'s answer is made only from the answers of the steps just below it, so you never recompute anything.',
    quickRevision: ['State → recurrence → base case → optimise', 'Stairs: f(n-1) + f(n-2)', 'Robber: max(skip, rob + i-2)', 'Coins: dp[a] = min(dp[a-c] + 1)'],
    followUps: ['Top-down memoisation vs bottom-up?', 'Number of ways to make change (not minimum coins)?'],
  },
  'strings-reverse-words-compression': {
    difficulty: 'easy',
    frequency: 'medium',
    answer: `**Reverse words**: \`trim\`, split on runs of whitespace (\`/\\s+/\`), reverse, join with a single space. O(n).

**Compression** (\`'aaabbbbcc' → 'a3b4c2'\`): walk the string with a counter, append \`char + count\` when the character changes, and return the original string if the result isn't shorter. Build the result in an array and \`join\`, which is efficient.`,
    analogy: 'Compression is like writing "3 apples, 4 bananas" on a shopping list instead of writing each fruit separately.',
    quickRevision: ['Reverse words: trim + split(/\\s+/) + reverse + join', 'Compression: count runs; return original if not shorter', 'Use an array buffer, then join'],
    followUps: ['Reverse words in place (character array)?', 'Decompress the string back?'],
  },
  // ---------------------------------------------------------------- SQL
  'sql-answers': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `My notes cover the classic SQL round set. The patterns to name out loud:

- **Second / Nth highest**: \`MAX\` with a subquery, or \`DENSE_RANK()\` to handle ties.
- **Employee vs manager**: a **self join** on \`manager_id\`.
- **Groups with more than N**: \`GROUP BY … HAVING COUNT(*) > N\`.
- **Top N per group**: a window function (\`ROW_NUMBER() OVER (PARTITION BY …)\`).
- **Customers with no orders**: \`LEFT JOIN … WHERE o.id IS NULL\` (or \`NOT EXISTS\`).
- **Duplicates**: \`GROUP BY email HAVING COUNT(*) > 1\`.
- **Running totals**: \`SUM() OVER (ORDER BY …)\`.

Always clarify ties, NULLs and whether the result should include zero rows.`,
    analogy: 'SQL questions are a small set of recipes (self join, GROUP BY + HAVING, window functions, anti-join); once you recognise which recipe a question needs, the query almost writes itself.',
    quickRevision: ['Ties → DENSE_RANK', 'Filter groups → HAVING', 'Top N per group → ROW_NUMBER OVER PARTITION', 'Missing rows → LEFT JOIN … IS NULL / NOT EXISTS', 'Running total → SUM() OVER'],
    followUps: ['WHERE vs HAVING?', 'RANK vs DENSE_RANK vs ROW_NUMBER?', 'How would you index for these queries?'],
  },
});
