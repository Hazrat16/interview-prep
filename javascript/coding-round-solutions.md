# Coding Round Solutions

Answers for [coding-round-questions.md](coding-round-questions.md). Practise writing each one **without looking**, and explain the time and space complexity out loud.

---

## Part 1 — Implement it yourself

### debounce / throttle

```js
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
```

Debounce: run **after** the calls stop (search input). Throttle: run **at most once** per interval (scroll, resize).

### Promise.all

```js
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
```

### Promise.allSettled / Promise.race / Promise.any

```js
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
```

### sleep / promisify

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, result) => (err ? reject(err) : resolve(result)));
    });
}
// const readFile = promisify(fs.readFile);
```

### Retry with exponential backoff

```js
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
```

Say: only retry **idempotent** or safe operations. Jitter prevents all clients retrying at the same moment.

### Concurrency limit (run N async tasks at a time)

```js
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
```

### Deep clone (handles Date, arrays, cycles)

```js
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
```

Mention that the built-in `structuredClone(obj)` exists now.

### Flatten array (with depth)

```js
function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item) && depth > 0) acc.push(...flatten(item, depth - 1));
    else acc.push(item);
    return acc;
  }, []);
}
// flatten([1, [2, [3, [4]]]], 1) → [1, 2, [3, [4]]]
```

### Polyfills: map, filter, reduce

```js
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
```

### Polyfills: call, apply, bind

```js
Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis;
  const key = Symbol('fn');
  ctx[key] = this;                 // `this` is the function
  const result = ctx[key](...args);
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
```

### memoize / once / curry

```js
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
```

### Event emitter

```js
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
```

### get(obj, path, default)

```js
function get(obj, path, defaultValue) {
  const keys = Array.isArray(path) ? path : path.replace(/\[(\w+)\]/g, '.$1').split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue;
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}
// get({ a: { b: [{ c: 5 }] } }, 'a.b[0].c') → 5
```

### Deep equal

```js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}
```

### LRU cache

```js
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
```

O(1) for both. The "classic" answer is a hash map plus a doubly linked list. Mention that `Map` gives the same result in JS.

---

## Part 2 — Output prediction (with answers)

### 1. Event loop order

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
(async () => {
  console.log('4');
  await null;
  console.log('5');
})();
console.log('6');
```

**Output:** `1 4 6 3 5 2`
Synchronous code first (1, 4, 6). The async function runs synchronously until `await`. Then **microtasks** run in the order they were queued (3, 5). Then **macrotasks** (2).

### 2. Node: nextTick vs promise vs setImmediate

```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
```

**Output (CommonJS):** `nextTick promise timeout immediate`. The order of the last two can vary in the main module. Inside an I/O callback, `immediate` always comes first.

### 3. var vs let in a loop

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j));
```

**Output:** `3 3 3` then `0 1 2`. `var` has one shared function-scoped variable. `let` creates a new binding on every iteration.

### 4. Hoisting & TDZ

```js
console.log(a); // undefined  (var is hoisted and initialized as undefined)
var a = 1;

console.log(b); // ReferenceError (let is in the temporal dead zone)
let b = 2;

foo();          // "hi"  (function declarations are fully hoisted)
function foo() { console.log('hi'); }

bar();          // TypeError: bar is not a function (var bar is undefined)
var bar = function () {};
```

### 5. `this`

```js
const obj = {
  name: 'A',
  regular() { return this.name; },
  arrow: () => this?.name,
  delayed() { setTimeout(function () { console.log(this?.name); }); },
  delayedArrow() { setTimeout(() => console.log(this.name)); },
};

obj.regular();        // 'A'
obj.arrow();          // undefined — arrow takes `this` from the outer scope (module/global)
const fn = obj.regular;
fn();                 // lost `this`: TypeError in strict mode (this is undefined); sloppy mode reads globalThis.name
obj.delayed();        // NOT 'A' — plain function: `this` is window (browser) or the Timeout object (Node)
obj.delayedArrow();   // 'A' — arrow keeps `this` from delayedArrow
```

### 6. Coercion

| Expression | Result | Why |
|------------|--------|-----|
| `'5' + 2` | `'52'` | `+` with a string concatenates |
| `'5' - 2` | `3` | `-` converts to numbers |
| `[] + []` | `''` | both become empty strings |
| `[] + {}` | `'[object Object]'` | |
| `true + 1` | `2` | |
| `null == undefined` | `true` | special rule |
| `null === undefined` | `false` | different types |
| `NaN === NaN` | `false` | use `Number.isNaN` |
| `0 == ''` | `true` | both become 0 |
| `typeof null` | `'object'` | historic bug |
| `typeof NaN` | `'number'` | |
| `[1,2,3] == '1,2,3'` | `true` | array converted to a string |
| `0.1 + 0.2 === 0.3` | `false` | floating point. That's why money uses integers. |

### 7. Closures

```js
function counter() {
  let count = 0;
  return { inc: () => ++count, get: () => count };
}
const c1 = counter();
const c2 = counter();
c1.inc(); c1.inc(); c2.inc();
console.log(c1.get(), c2.get()); // 2 1 — each call has its own `count`
```

### 8. References

```js
const a = { x: 1 };
const b = a;
b.x = 2;
console.log(a.x); // 2 — same object

function change(obj) { obj.x = 3; obj = { x: 4 }; }
change(a);
console.log(a.x); // 3 — reassigning the parameter doesn't affect the caller
```

### 9. Promise chain with error

```js
Promise.resolve(1)
  .then((v) => { throw new Error('fail'); })
  .then(() => console.log('skipped'))
  .catch((e) => { console.log('caught', e.message); return 2; })
  .then((v) => console.log('after', v));
```

**Output:** `caught fail` then `after 2`. `catch` returns a value, so the chain continues as fulfilled.

---

## Part 3 — DSA patterns (classic problems with solutions)

### Two Sum (hash map) — O(n)

```js
function twoSum(nums, target) {
  const seen = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
```

### Contains Duplicate / First unique character

```js
const containsDuplicate = (nums) => new Set(nums).size !== nums.length;

function firstUniqChar(s) {
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;
  for (let i = 0; i < s.length; i++) if (count[s[i]] === 1) return i;
  return -1;
}
```

### Group Anagrams — O(n · k log k)

```js
function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}
```

### Valid Anagram / Valid Palindrome (two pointers)

```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;
  for (const ch of t) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}

function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = clean.length - 1;
  while (l < r) if (clean[l++] !== clean[r--]) return false;
  return true;
}
```

### Container With Most Water (two pointers) — O(n)

```js
function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++; else r--; // move the shorter side
  }
  return best;
}
```

### Longest substring without repeating characters (sliding window) — O(n)

```js
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let start = 0, best = 0;
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= start) start = lastSeen.get(ch) + 1;
    lastSeen.set(ch, end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}
```

### Max sum subarray (Kadane) — O(n)

```js
function maxSubArray(nums) {
  let current = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // extend or restart
    best = Math.max(best, current);
  }
  return best;
}
```

### Valid Parentheses (stack) — O(n)

```js
function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else stack.push(ch);
  }
  return stack.length === 0;
}
```

### Binary search — O(log n)

```js
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}
```

### Reverse linked list / detect cycle / merge two sorted lists

```js
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

function hasCycle(head) {           // Floyd's fast & slow pointers
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

function mergeTwoLists(a, b) {
  const dummy = { next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}
```

### Trees: max depth, invert, level order, validate BST

```js
const maxDepth = (root) => (root ? 1 + Math.max(maxDepth(root.left), maxDepth(root.right)) : 0);

function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}

function levelOrder(root) {          // BFS
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const size = queue.length, level = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

function isValidBST(node, min = -Infinity, max = Infinity) {
  if (!node) return true;
  if (node.val <= min || node.val >= max) return false;
  return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);
}
```

### Number of Islands (grid DFS) — O(rows · cols)

```js
function numIslands(grid) {
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') { count++; sink(r, c); }
    }
  }
  return count;
}
```

### Merge Intervals — O(n log n)

```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (const [start, end] of intervals.slice(1)) {
    const last = result[result.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else result.push([start, end]);
  }
  return result;
}
```

### Dynamic programming: Climbing Stairs, House Robber, Coin Change

```js
function climbStairs(n) {           // ways(n) = ways(n-1) + ways(n-2)
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

function rob(nums) {                // best = max(skip this house, rob it + best two back)
  let prev = 0, curr = 0;
  for (const n of nums) [prev, curr] = [curr, Math.max(curr, prev + n)];
  return curr;
}

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

### Strings: reverse words, compression

```js
const reverseWords = (s) => s.trim().split(/\s+/).reverse().join(' ');

function compress(s) {              // "aaabbbbcc" → "a3b4c2" (returns s if not shorter)
  let out = '';
  for (let i = 0, count = 1; i < s.length; i++, count++) {
    if (s[i] !== s[i + 1]) { out += s[i] + count; count = 0; }
  }
  return out.length < s.length ? out : s;
}
```

### Big-O cheat sheet

| Operation | Complexity |
|-----------|------------|
| Array access by index, Map/Set get/set/has | O(1) |
| Array `push`/`pop` | O(1) |
| Array `shift`/`unshift`, `includes`, `indexOf` | O(n) |
| Sorting | O(n log n) |
| Binary search | O(log n) |
| Nested loop over the same array | O(n²) |
| Recursion depth d with 2 branches | O(2^d) |

---

## Part 4 — SQL answers

Assume tables `employees(id, name, salary, department_id, manager_id)`, `departments(id, name)`, `customers(id, name, email)`, `orders(id, customer_id, amount, created_at)`.

```sql
-- Second highest salary
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Nth highest (N = 3) with a window function (handles ties)
SELECT DISTINCT salary
FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees) t
WHERE rnk = 3;

-- Employees earning more than their manager (self join)
SELECT e.name
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;

-- Departments with more than 5 employees
SELECT d.name, COUNT(*) AS employee_count
FROM employees e
JOIN departments d ON d.id = e.department_id
GROUP BY d.name
HAVING COUNT(*) > 5;

-- Highest paid employee in each department (top N per group)
SELECT department_id, name, salary
FROM (
  SELECT e.*, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn
  FROM employees e
) t
WHERE rn = 1;

-- Customers with no orders
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- Duplicate emails
SELECT email, COUNT(*)
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;

-- Total order amount per customer per month
SELECT customer_id, DATE_TRUNC('month', created_at) AS month, SUM(amount) AS total
FROM orders
GROUP BY customer_id, month
ORDER BY month, total DESC;

-- Running total of orders (window)
SELECT id, created_at, amount,
       SUM(amount) OVER (ORDER BY created_at) AS running_total
FROM orders;
```

Know the difference: `WHERE` filters rows **before** grouping, `HAVING` filters groups **after**. `ROW_NUMBER` is unique per row, `RANK` leaves gaps after ties, `DENSE_RANK` doesn't.

**MongoDB equivalent** (they may ask, since it's on your CV): total per customer, top 5

```js
db.orders.aggregate([
  { $group: { _id: '$customer_id', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } },
  { $limit: 5 },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { _id: 0, name: '$customer.name', total: 1 } },
]);
```
