import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Implement It Yourself',
  description: 'Polyfills and utilities asked in coding rounds: bind, Promise.all, deep clone, LRU cache and more.',
  questions: [
    {
      id: 'debounce-throttle',
      question: 'debounce / throttle',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `**Debounce**: keep a timer in a closure. On every call, clear the previous timer and start a new one, so the function only runs after calls stop for \`wait\` ms. I preserve \`this\` and the latest arguments with \`fn.apply(this, args)\` and expose \`cancel()\` for cleanup.

**Throttle**: keep the time of the last run (or a "waiting" flag). If enough time has passed, run immediately; otherwise ignore the call (or schedule one trailing call). So it runs **at most once per interval**.

Use debounce for search inputs and auto-save, throttle for scroll and resize handlers.`,
      analogy: `Debounce is a lift door that waits until nobody has walked in for a few seconds; throttle is a bus that leaves on a fixed schedule however many people arrive.`,
      quickRevision: [
        'Debounce: `clearTimeout` + `setTimeout` on every call',
        'Throttle: run if `now - last >= wait`, else skip/schedule trailing',
        'Keep `this` + args with `apply`',
        'Expose `cancel()`; optional leading/trailing options',
      ],
      deepDive: `\`\`\`js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}
\`\`\`

Debounce: run **after** the calls stop (search input). Throttle: run **at most once** per interval (scroll, resize).`,
      followUps: [
        'Add a `leading` option to debounce.',
        'Write a `useDebounce` React hook.',
        'Throttle with trailing call: how?',
      ],
    },
    {
      id: 'promiseall',
      question: 'Promise.all',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `I return a new Promise. I keep a \`results\` array and a \`completed\` counter. For each input I wrap it with \`Promise.resolve()\` (so plain values work), and on success store the value **at its index**, not with \`push\`, so the order matches the input. When \`completed === length\` I resolve. The first rejection rejects the whole thing. Edge case: an empty array resolves immediately with \`[]\`.

Complexity: O(n) extra space; time is the slowest promise, since they run concurrently.`,
      analogy: `A teacher collecting homework: each paper goes into the slot with the student's number (index), the bundle is handed in only when every slot is filled, and one missing paper with a note "failed" stops the whole hand-in.`,
      quickRevision: [
        'Wrap each item with `Promise.resolve`',
        'Store by index → order preserved',
        'Counter → resolve when all done',
        'First rejection rejects; empty input → `[]`',
      ],
      deepDive: `\`\`\`js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;
    if (promises.length === 0) return resolve(results);
    promises.forEach((p, i) => {
      Promise.resolve(p)              // also accepts non-promise values
        .then((value) => {
          results[i] = value;         // keep original order
          if (++done === promises.length) resolve(results);
        })
        .catch(reject);               // first rejection rejects everything
    });
  });
}
\`\`\``,
      followUps: [
        'Now implement `allSettled`.',
        'Why not use `results.push`?',
        'How would you add a concurrency limit?',
      ],
    },
    {
      id: 'promiseallsettled-promiserace-promiseany',
      question: 'Promise.allSettled / Promise.race / Promise.any',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `They follow the same skeleton as \`Promise.all\`, with different settle rules:

- **allSettled**: never reject. Store \`{ status: 'fulfilled', value }\` or \`{ status: 'rejected', reason }\` at each index, and resolve when all are done.
- **race**: resolve or reject with whichever promise settles first. Just forward \`resolve\` and \`reject\` to each one.
- **any**: resolve with the first **fulfilment**. Count rejections, and if all reject, reject with an \`AggregateError\` of the reasons.`,
      analogy: `allSettled is a full report card; race is "first to cross the line, win or fall"; any is "first one who actually finishes".`,
      quickRevision: [
        'allSettled: always resolves with status objects',
        'race: first settled (good for timeouts)',
        'any: first fulfilled; all rejected → AggregateError',
      ],
      deepDive: `\`\`\`js
function promiseAllSettled(promises) {
  return Promise.all(
    promises.map((p) =>
      Promise.resolve(p).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason })
      )
    )
  );
}

function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => Promise.resolve(p).then(resolve, reject));
  });
}

function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let rejected = 0;
    if (promises.length === 0) return reject(new AggregateError([], 'All promises were rejected'));
    promises.forEach((p, i) =>
      Promise.resolve(p).then(resolve, (err) => {
        errors[i] = err;
        if (++rejected === promises.length) reject(new AggregateError(errors, 'All promises were rejected'));
      })
    );
  });
}
\`\`\``,
      followUps: [
        'Use `race` to add a timeout to fetch.',
        'Does `race` cancel the losers?',
      ],
    },
    {
      id: 'sleep-promisify',
      question: 'sleep / promisify',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `**sleep**: \`ms => new Promise(resolve => setTimeout(resolve, ms))\`. It doesn't block anything; it just resolves later.

**promisify**: return a function that takes the args, returns a new Promise, and calls the original function with an extra **error-first callback** \`(err, value) => err ? reject(err) : resolve(value)\`. Keep \`this\` with \`fn.call(this, ...args, cb)\`.`,
      analogy: `promisify is a travel adapter: the old callback plug stays the same, but now it fits the modern \`await\` socket.`,
      quickRevision: [
        'sleep = Promise + setTimeout',
        'promisify: wrap in a Promise, append an error-first callback',
        'Node has `util.promisify` built in',
      ],
      deepDive: `\`\`\`js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, result) => (err ? reject(err) : resolve(result)));
    });
}
// const readFile = promisify(fs.readFile);
\`\`\``,
      followUps: [
        'How would you add cancellation to sleep?',
        'What if the callback is called twice?',
      ],
    },
    {
      id: 'retry-with-exponential-backoff',
      question: 'Retry with exponential backoff',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Loop up to \`retries\` times: try the async function and return on success. On failure, if attempts remain, wait \`base * 2 ** attempt\` ms **plus random jitter**, then try again; otherwise rethrow the last error.

What I say out loud: only retry **idempotent** or safe operations, and only on retryable errors like timeouts, 429 or 503 (not 400s). Cap the maximum delay. Jitter prevents every client retrying at the same moment (thundering herd).`,
      analogy: `Calling a busy friend: you wait a little, then longer each time, and you don't all call at exactly the same second (jitter).`,
      quickRevision: [
        'Delay = base × 2^attempt + jitter, capped',
        'Retry only idempotent operations / retryable errors',
        'Rethrow after the last attempt',
        'Respect `Retry-After` for 429',
      ],
      deepDive: `\`\`\`js
async function retry(fn, { retries = 3, baseDelay = 200 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      const delay = baseDelay * 2 ** attempt + Math.random() * 100; // backoff + jitter
      await sleep(delay);
    }
  }
}
\`\`\`

Say: only retry **idempotent** or safe operations. Jitter prevents all clients retrying at the same moment.`,
      followUps: [
        'Why add jitter?',
        'How does a circuit breaker relate to retries?',
        'Would you retry a payment request?',
      ],
    },
    {
      id: 'concurrency-limit-run-n-async-tasks-at-a-time',
      question: 'Concurrency limit (run N async tasks at a time)',
      perspective: 'coding',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['javascript'],
      answer: `I start **N workers**. Each worker loops: take the next index (\`const i = next++\`), await \`tasks[i]()\`, store the result at \`results[i]\`, and repeat until no tasks are left. Then \`await Promise.all(workers)\` and return the results.

Taking the index with \`next++\` is safe because JavaScript is single-threaded between awaits. Results keep input order. At most N tasks are in flight at any time. Edge cases: \`limit > tasks.length\`, an empty list, and deciding whether one failure should stop everything or be collected.`,
      analogy: `A bank with N cashiers and one queue: each cashier calls "next!" as soon as they finish, so at most N customers are served at once and nobody waits for a whole batch to finish.`,
      quickRevision: [
        'N workers pulling from a shared index',
        '`next++` is safe (single-threaded between awaits)',
        'Store by index → ordered results',
        '`Promise.all(workers)` to finish',
      ],
      deepDive: `\`\`\`js
async function runWithLimit(tasks, limit) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;                 // safe: JS is single-threaded between awaits
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}
\`\`\``,
      followUps: [
        'How would you collect errors instead of failing fast?',
        'Why is this better than batches of N with `Promise.all`?',
        'Libraries that do this? (p-limit)',
      ],
    },
    {
      id: 'deep-clone-handles-date-arrays-cycles',
      question: 'Deep clone (handles Date, arrays, cycles)',
      perspective: 'coding',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['javascript'],
      answer: `A recursive function with a \`WeakMap\` of already-cloned objects:

1. Primitives and functions: return as is.
2. If the object is in the map, return the existing clone (this handles **cycles**).
3. \`Date\` → \`new Date(value)\`, plus RegExp, Map and Set if needed.
4. Create an empty array or object (keeping the prototype if required), **store it in the map before recursing**, then clone each own key.

In real code I'd use \`structuredClone\`, which handles Dates, Maps, Sets and cycles.`,
      analogy: `Photocopying a binder where some pages refer back to earlier pages: you keep a list of pages you've already copied, so you never copy the same page twice or loop forever.`,
      quickRevision: [
        'Recursion + WeakMap for cycles',
        'Put the clone in the map **before** recursing',
        'Special-case Date (and Map/Set/RegExp)',
        'In practice: `structuredClone`',
      ],
      deepDive: `\`\`\`js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value);
  if (seen.has(value)) return seen.get(value);         // circular reference
  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  for (const key of Object.keys(value)) {
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}
\`\`\`

Mention that the built-in \`structuredClone(obj)\` exists now.`,
      followUps: [
        'Why WeakMap instead of Map?',
        'What does `JSON.parse(JSON.stringify())` lose?',
      ],
    },
    {
      id: 'flatten-array-with-depth',
      question: 'Flatten array (with depth)',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Recursive \`reduce\`: for each item, if it's an array **and** \`depth > 0\`, concatenate \`flatten(item, depth - 1)\`; otherwise push the item. Default \`depth = 1\` to match \`Array.prototype.flat\`, and \`Infinity\` flattens completely.

An iterative version uses a stack to avoid deep recursion. O(n) over the total number of elements.`,
      analogy: 'Unpacking nested gift boxes, but only opening as many layers as you were told to.',
      quickRevision: [
        '`reduce` + recursion with `depth - 1`',
        'Default depth 1; `Infinity` for full',
        'Iterative stack version avoids recursion limits',
      ],
      deepDive: `\`\`\`js
function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item) && depth > 0) acc.push(...flatten(item, depth - 1));
    else acc.push(item);
    return acc;
  }, []);
}
// flatten([1, [2, [3, [4]]]], 1) → [1, 2, [3, [4]]]
\`\`\``,
      followUps: [
        'Write it without recursion.',
        'How does `Array.prototype.flat` handle holes?',
      ],
    },
    {
      id: 'polyfills-map-filter-reduce',
      question: 'Polyfills: map, filter, reduce',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Add to \`Array.prototype\` using a **regular function** (so \`this\` is the array). Loop over indexes, **skip holes** (\`if (i in this)\`), and call the callback with \`(element, index, array)\` and an optional \`thisArg\`.

- **map** builds a new array of the same length.
- **filter** pushes items whose callback is truthy.
- **reduce** starts from \`initialValue\`, or the first element if none is given, and throws a \`TypeError\` on an empty array with no initial value.`,
      analogy: `Rebuilding a familiar tool from scratch to prove you know exactly how the original works, including the awkward edge cases.`,
      quickRevision: [
        'Regular function so `this` = array',
        'Callback args: (el, i, arr); support `thisArg`',
        'reduce: missing initial → first element; empty → TypeError',
        'Skip holes with `i in this`',
      ],
      deepDive: `\`\`\`js
Array.prototype.myMap = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) out[i] = cb.call(thisArg, this[i], i, this);
  }
  return out;
};

Array.prototype.myFilter = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb.call(thisArg, this[i], i, this)) out.push(this[i]);
  }
  return out;
};

Array.prototype.myReduce = function (cb, initial) {
  let i = 0;
  let acc = initial;
  if (arguments.length < 2) {
    if (this.length === 0) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[0];
    i = 1;
  }
  for (; i < this.length; i++) acc = cb(acc, this[i], i, this);
  return acc;
};
\`\`\``,
      followUps: [
        'Why not use an arrow function for the polyfill?',
        'What does reduce do with an empty array?',
      ],
    },
    {
      id: 'polyfills-call-apply-bind',
      question: 'Polyfills: call, apply, bind',
      perspective: 'coding',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['javascript'],
      answer: `**call**: temporarily attach the function to the context object under a unique \`Symbol\` key, call it as \`ctx[key](...args)\` so \`this\` is the context, delete the key, and return the result. Use \`globalThis\` if the context is null.

**apply**: same, but the arguments come as an array.

**bind**: return a new function that calls the original with the bound \`this\` and **merged arguments** (\`[...boundArgs, ...laterArgs]\`). If the bound function is called with \`new\`, the new object should win over the bound \`this\`.`,
      analogy: `call/apply lend the function a temporary name badge saying "I belong to this object" for one call; bind prints a permanent badge.`,
      quickRevision: [
        'Attach under a Symbol, call, delete',
        'apply = call with an array of args',
        'bind returns a function with pre-filled this + args',
        'Handle null context and `new` with bind',
      ],
      deepDive: `\`\`\`js
Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis;
  const key = Symbol('fn');
  ctx[key] = this;                 // \`this\` is the function
  const result = ctxkey;
  delete ctx[key];
  return result;
};

Function.prototype.myApply = function (ctx, args = []) {
  return this.myCall(ctx, ...args);
};

Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this;
  return function (...later) {
    return fn.apply(ctx, [...preset, ...later]);
  };
};
\`\`\``,
      followUps: [
        'Why use a Symbol key?',
        'Can you re-bind a bound function?',
      ],
    },
    {
      id: 'memoize-once-curry',
      question: 'memoize / once / curry',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript', 'performance'],
      answer: `All three are **closures**:

- **memoize**: a \`Map\` cache keyed by the arguments (\`JSON.stringify(args)\` or a custom resolver). Return the cached value if present, otherwise compute and store it. Only safe for pure functions, and the cache should be bounded.
- **once**: a \`called\` flag and a saved \`result\`. The first call runs the function; later calls return the saved result.
- **curry**: if the number of collected arguments is at least \`fn.length\`, call \`fn\`; otherwise return a function that collects more. So \`sum(1)(2)(3)\` works.`,
      analogy: `memoize is a cheat sheet of answers already worked out; once is a single-use ticket; curry is filling in a form one field at a time until it's complete.`,
      quickRevision: [
        'memoize: Map cache, pure functions only, bound the size',
        'once: flag + stored result',
        'curry: compare collected args with `fn.length`',
        'All rely on closures',
      ],
      deepDive: `\`\`\`js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}
// const add = curry((a, b, c) => a + b + c); add(1)(2)(3) === 6; add(1, 2)(3) === 6

// Infinite sum: sum(1)(2)(3)() === 6
const sum = (a) => (b) => (b === undefined ? a : sum(a + b));
\`\`\``,
      followUps: [
        'How do you choose a cache key for object args?',
        'Infinite curry: `sum(1)(2)(3)()`?',
      ],
    },
    {
      id: 'event-emitter',
      question: 'Event emitter',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `A class with a \`Map<event, Set<listener>>\`:

- **on**: add the listener and return an unsubscribe function.
- **off**: delete the listener.
- **emit**: copy the listeners first (\`[...set]\`) so listeners that unsubscribe during emit don't break the loop, then call each with the args.
- **once**: wrap the listener in a function that calls \`off\` and then the original, and keep a reference so \`off(original)\` still works.`,
      analogy: `A newsletter: people subscribe to topics, the publisher sends each issue to everyone on that list, and "once" subscribers are unsubscribed automatically after the first issue.`,
      quickRevision: [
        'Map of event → Set of listeners',
        '`on` returns an unsubscribe function',
        'Copy listeners before emitting',
        '`once` = wrapper that removes itself',
      ],
      deepDive: `\`\`\`js
class EventEmitter {
  #events = new Map();

  on(event, listener) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push(listener);
    return () => this.off(event, listener); // return unsubscribe
  }

  off(event, listener) {
    const list = this.#events.get(event);
    if (list) this.#events.set(event, list.filter((l) => l !== listener && l.original !== listener));
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    wrapper.original = listener;
    this.on(event, wrapper);
  }

  emit(event, ...args) {
    const list = this.#events.get(event);
    if (!list) return false;
    [...list].forEach((l) => l(...args)); // copy: listeners may remove themselves
    return true;
  }
}
\`\`\``,
      followUps: [
        'How would you avoid memory leaks with emitters?',
        'How is this similar to Node\'s EventEmitter?',
      ],
    },
    {
      id: 'getobj-path-default',
      question: 'get(obj, path, default)',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `Normalise the path into keys: accept an array, or turn \`'a[0].b'\` into \`['a', '0', 'b']\` with a regex replace and split. Walk the keys, stopping and returning the default as soon as the current value is \`null\` or \`undefined\`. At the end, return the default only if the result is \`undefined\`, so legitimate \`null\`, \`0\` or \`false\` values are kept.`,
      analogy: `Following directions room by room in a building, and if a door doesn't exist you stop and use the backup address instead of crashing into a wall.`,
      quickRevision: [
        'Normalise path (dots + brackets)',
        'Stop on null/undefined',
        'Default only for `undefined` result',
        'Modern code: optional chaining',
      ],
      deepDive: `\`\`\`js
function get(obj, path, defaultValue) {
  const keys = Array.isArray(path) ? path : path.replace(/\\[(\\w+)\\]/g, '.$1').split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue;
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}
// get({ a: { b: [{ c: 5 }] } }, 'a.b[0].c') → 5
\`\`\``,
      followUps: [
        'Now write `set(obj, path, value)`.',
        'How does optional chaining compare?',
      ],
    },
    {
      id: 'deep-equal',
      question: 'Deep equal',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `Recursive comparison:

1. If \`Object.is(a, b)\`, return true (this handles \`NaN\`).
2. If either isn't an object, or one is null, return false.
3. Arrays vs objects must match, and so must constructors and prototypes.
4. Compare key counts, then recurse into every key.
5. Special-case \`Date\` (compare times), and optionally Map, Set and cycles (with a seen map).`,
      analogy: 'Comparing two LEGO models brick by brick, not just checking that both boxes say "castle".',
      quickRevision: [
        '`Object.is` first',
        'Type/array/prototype checks',
        'Same key count, recurse per key',
        'Special cases: Date, NaN, cycles',
      ],
      deepDive: `\`\`\`js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}
\`\`\``,
      followUps: [
        'How would you handle circular references?',
        'Where do you need deep equality in React?',
      ],
    },
    {
      id: 'lru-cache',
      question: 'LRU cache',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['caching', 'dsa'],
      answer: `A JavaScript \`Map\` keeps **insertion order**, which makes LRU simple:

- **get**: if the key exists, delete it and set it again (moving it to the "most recent" end), then return the value.
- **put**: delete the key if it exists, set it, and if \`size > capacity\` remove the **oldest** entry, which is \`map.keys().next().value\`.

Both are O(1). The classic alternative is a hash map plus a doubly linked list, which is what you'd explain in a language without ordered maps.`,
      analogy: `A small desk with limited space: anything you touch moves to the top of the pile, and when the desk is full, the thing at the bottom (least recently used) goes back on the shelf.`,
      quickRevision: [
        'Map preserves insertion order',
        'get: delete + set to refresh',
        'put: evict `keys().next().value` when over capacity',
        'O(1) get/put; classic: hashmap + doubly linked list',
      ],
      deepDive: `\`\`\`js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // Map keeps insertion order: first key = least recently used
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);       // move to most-recent position
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value); // evict least recently used
    }
  }
}
\`\`\`

O(1) for both. The "classic" answer is a hash map plus a doubly linked list. Mention that \`Map\` gives the same result in JS.`,
      followUps: [
        'Implement it with a doubly linked list.',
        'Where would you use an LRU in a real app?',
        'LRU vs LFU?',
      ],
    },
  ],
});
