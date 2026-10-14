# Coding Round Questions

Bangladeshi product and service companies commonly use one or more of: an online assessment (HackerRank, LeetCode-style), a live JS coding round, or a take-home project. Practice all three.

**Solutions:** [coding-round-solutions.md](coding-round-solutions.md) (code for every task, output answers, DSA and SQL).

---

## 1. JavaScript "implement it yourself" (very common)

| Task | Concept tested |
|------|----------------|
| `debounce` / `throttle` | Closures, timers. See [debounce-throttle.md](debounce-throttle.md) |
| `Promise.all` / `Promise.allSettled` / `Promise.race` | Promises, order of results, error handling |
| `promisify`, `sleep(ms)` | Promise constructor |
| Retry with exponential backoff | async/await, loops |
| Run async tasks with a concurrency limit of N | Promise queue, a classic senior question |
| Deep clone (objects, arrays, Dates, cycles) | Recursion, `WeakMap` |
| `flatten` a nested array (with depth) | Recursion / `reduce` |
| `Array.prototype.map` / `filter` / `reduce` polyfill | `this`, prototypes |
| `Function.prototype.bind` / `call` / `apply` polyfill | `this` binding |
| `memoize` | Closures, cache keys |
| `curry` (`sum(1)(2)(3)`) | Closures, `fn.length` |
| `once` | Closures |
| Event emitter (`on`, `off`, `emit`, `once`) | Classes, maps of arrays |
| `get(obj, 'a.b.c', default)` | String parsing, optional access |
| Deep equal | Recursion, type checks |
| LRU cache | `Map` keeps insertion order. Also a backend favourite. |

**Concurrency limit example (practice until you can write it from memory):**

```js
async function runWithLimit(tasks, limit) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```

## 2. Output-prediction questions

Expect a code snippet and the question "what does this print?":

- Event loop order: `setTimeout` vs `Promise.then` vs `async/await` vs `process.nextTick`. See [event-loop.md](event-loop.md)
- `var` in a loop with `setTimeout` (prints 3,3,3) vs `let` (prints 0,1,2)
- Hoisting and the TDZ
- `this` in arrow vs regular functions, methods passed as callbacks
- Coercion: `[] + {}`, `'5' - 2`, `'5' + 2`, `null == undefined`, `NaN === NaN`
- Closures capturing variables
- Object references and mutation (`const a = {}; const b = a; b.x = 1`)

## 3. DSA patterns (for online assessments)

Focus on **easy and medium** problems. Learn the patterns, not individual problems.

| Pattern | Classic problems |
|---------|-----------------|
| Hash map / set | Two Sum, Contains Duplicate, Group Anagrams, First Unique Character |
| Two pointers | Valid Palindrome, Two Sum II, Container With Most Water, Remove Duplicates |
| Sliding window | Longest Substring Without Repeating Characters, Max Sum Subarray of size K |
| Stack | Valid Parentheses, Min Stack, Daily Temperatures |
| Binary search | Search in Sorted Array, First Bad Version, Search in Rotated Array |
| Linked list | Reverse List, Detect Cycle, Merge Two Sorted Lists |
| Trees (DFS/BFS) | Max Depth, Level Order Traversal, Validate BST, Invert Tree |
| Graph (BFS/DFS) | Number of Islands, Clone Graph |
| Sorting / intervals | Merge Intervals, Meeting Rooms |
| Dynamic programming (basic) | Climbing Stairs, House Robber, Coin Change |
| Strings | Reverse words, anagram check, string compression |

Know **Big-O** for each solution and say it out loud without being asked.

**Practice plan:** 2 problems per day from the [NeetCode 150](https://neetcode.io/practice) easy and medium lists, in JavaScript.

## 4. Take-home / live build tasks

| Typical task | What they grade |
|--------------|-----------------|
| CRUD REST API (Express + DB) with auth | Structure, validation, error handling, status codes, tests |
| React app consuming a public API (search, filter, pagination) | Components, state, loading/error states, UX |
| Full-stack todo / notes / mini e-commerce | End-to-end thinking, README, setup instructions |
| Fix bugs / refactor an existing codebase | Reading code, debugging, small focused commits |

**Take-home checklist:**

- [ ] A README with setup, decisions and trade-offs, and "what I'd do with more time"
- [ ] Clean folder structure, TypeScript, lint passes
- [ ] Validation and error handling, plus empty and loading states
- [ ] At least a few meaningful tests
- [ ] Docker Compose or one-command setup (a bonus, and matches your DevOps strength)
- [ ] Meaningful git commits, not a single commit containing everything

## 5. Live coding etiquette

1. Repeat the problem and ask about edge cases (empty input, duplicates, large input).
2. Explain the brute-force approach first, then optimize.
3. Think out loud. Silence is the most common reason people fail these rounds.
4. Test with an example by hand and fix bugs calmly.
5. State the time and space complexity.

## 6. SQL round (often included)

Write queries for these:

- Second highest salary
- Employees earning more than their manager (self join)
- Count per group with `HAVING`
- Top N per group (window function `ROW_NUMBER()`)
- Customers with no orders (`LEFT JOIN ... WHERE x IS NULL`)
- Duplicate emails

See [joins-and-subqueries.md](../database/joins-and-subqueries.md).
