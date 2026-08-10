# Promises & async/await

## Concept

A **Promise** represents a value that will be available now, later, or never.

States:

1. **Pending**
2. **Fulfilled** (resolved)
3. **Rejected**

Once settled, a Promise doesn’t change state again.

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done"), 100);
});

p.then((value) => console.log(value)).catch((err) => console.error(err));
```

---

## Why Promises exist

Callbacks can lead to **callback hell** (deep nesting, hard error handling).

Promises give:

- flatter chaining
- centralized error handling with `.catch`
- composition helpers (`Promise.all`, etc.)

---

## async/await

`async/await` is syntax over Promises.

```js
async function loadUser() {
  try {
    const res = await fetch("/api/user");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
```

- `async` functions always return a Promise
- `await` pauses that function until the Promise settles (without blocking the whole JS thread)

---

## Common helpers

| Helper | Behavior |
|--------|----------|
| `Promise.all` | Fails fast if any rejects; waits for all successes |
| `Promise.allSettled` | Waits for all; never short-circuits on reject |
| `Promise.race` | Settles with the first settled Promise |
| `Promise.any` | Resolves with first fulfillment; rejects if all reject |

```js
const [users, posts] = await Promise.all([
  fetch("/users").then((r) => r.json()),
  fetch("/posts").then((r) => r.json()),
]);
```

---

## Error handling patterns

```js
fetch("/api")
  .then((r) => {
    if (!r.ok) throw new Error("Request failed");
    return r.json();
  })
  .then(console.log)
  .catch(console.error)
  .finally(() => console.log("done"));
```

Unhandled rejections are a common production bug — always handle errors.

---

## Interview Q&A

### Q1: What is a Promise?

**Answer:**

> A Promise is an object representing an asynchronous operation’s eventual result. It starts pending, then becomes fulfilled with a value or rejected with a reason. Consumers attach `.then` / `.catch` handlers or use async/await.

---

### Q2: Promise vs async/await?

**Answer:**

> They’re the same underlying model. async/await is syntactic sugar that makes asynchronous code look synchronous and improves readability, especially for sequential steps and try/catch error handling.

---

### Q3: Difference between Promise.all and allSettled?

**Answer:**

> `Promise.all` rejects as soon as one Promise rejects. `Promise.allSettled` waits for every Promise and returns an array of outcome objects for both successes and failures.

---

### Q4: Does await block the main thread?

**Answer:**

> No. `await` pauses only the surrounding async function. While waiting, the event loop can run other tasks. The main thread is blocked only by synchronous CPU work, not by awaiting I/O.

---

### Q5: How do you convert callback APIs to Promises?

**Answer:**

> Wrap them in `new Promise((resolve, reject) => ...)` and call resolve/reject inside the callback. Many Node APIs also have `util.promisify` or built-in promise versions.

---

## Key takeaways

- Promise = eventual value + state machine
- async/await = cleaner Promises
- `all` vs `allSettled` is a frequent interview ask
- Always handle rejections
