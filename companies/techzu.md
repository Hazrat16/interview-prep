# Techzu — Technical Interview Questions

Questions asked in the Techzu interview (from notes). Use this as a revision checklist; deeper notes are linked where they already exist.

## Question list

1. React lifecycle
2. Middleware
3. Indexing
4. Node — event loop (with example)
5. Debouncing
6. `useEffect` vs `useLayoutEffect`
7. ISR, SSR, SSG (Next.js)
8. `useMemo`, `useCallback`
9. MongoDB — pipeline aggregation
10. `res.send` / `res` / `req` (Express)

---

## 1. React lifecycle

**Class components** had explicit phases: mounting → updating → unmounting (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`).

**Hooks map** (what interviewers usually want now):

| Class lifecycle | Hooks equivalent |
|-----------------|------------------|
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentDidUpdate` | `useEffect(() => { ... }, [deps])` |
| `componentWillUnmount` | cleanup: `return () => { ... }` inside `useEffect` |

Spoken answer:

> In modern React we think in terms of render + effects. Mount runs an effect with an empty dependency array, updates re-run when deps change, and cleanup runs on unmount or before the next effect.

---

## 2. Middleware

Middleware is a function that sits **between** the request and the final route handler.

Express example:

```js
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next(); // pass control to the next middleware / route
});
```

Common uses: auth, logging, body parsing, CORS, error handling, rate limiting.

Spoken answer:

> Middleware intercepts the request/response cycle. It can read or modify `req`/`res`, end the response early, or call `next()` to continue the chain.

---

## 3. Indexing

Deeper notes: [database/indexing.md](../database/indexing.md)

Spoken answer:

> An index is a data structure (usually a B-tree) that lets the DB find rows without a full table scan. Great for frequent filters/joins/sorts; costly on writes and storage, so don’t index every column.

---

## 4. Node — event loop (with example)

Deeper notes: [javascript/event-loop.md](../javascript/event-loop.md), [javascript/nodejs-runtime.md](../javascript/nodejs-runtime.md)

Classic example interviewers ask:

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Output: 1, 4, 3, 2
```

Why: sync first → microtasks (`Promise`) before macrotasks (`setTimeout`).

---

## 5. Debouncing

Deeper notes: [javascript/debounce-throttle.md](../javascript/debounce-throttle.md)

Spoken answer:

> Debounce delays a function until activity pauses — e.g. search-as-you-type fires once after the user stops typing, not on every keystroke.

---

## 6. `useEffect` vs `useLayoutEffect`

| | `useEffect` | `useLayoutEffect` |
|-|-------------|-------------------|
| When | After paint | After DOM mutate, **before** paint |
| Blocking? | Non-blocking | Blocks paint |
| Use for | Data fetch, subscriptions, most side effects | Measure DOM, sync visual tweaks to avoid flicker |

Spoken answer:

> Both run after render. `useLayoutEffect` runs before the browser paints, so use it only when you must read/adjust layout synchronously. Prefer `useEffect` for almost everything else.

---

## 7. ISR, SSR, SSG (Next.js)

Blank in notes is almost certainly **SSG**.

| Mode | Meaning | When |
|------|---------|------|
| **SSR** | Server renders HTML **per request** | Personalized / always-fresh data |
| **SSG** | HTML built **at build time** | Mostly static pages |
| **ISR** | Static pages that **revalidate** on an interval | Static + periodically updated content |

Spoken answer:

> SSR renders on each request, SSG at build time, ISR serves static pages but regenerates them in the background after a revalidate window.

---

## 8. `useMemo` / `useCallback`

| Hook | What it memoizes |
|------|------------------|
| `useMemo` | A **computed value** |
| `useCallback` | A **function identity** |

```js
const total = useMemo(() => expensiveSum(items), [items]);
const onSave = useCallback(() => save(id), [id]);
```

Spoken answer:

> `useMemo` caches a value; `useCallback` caches a function reference so child memo components don’t re-render unnecessarily. Don’t use them by default — only for expensive work or stable deps.

---

## 9. MongoDB — pipeline aggregation

Aggregation processes documents through a **pipeline** of stages.

```js
db.orders.aggregate([
  { $match: { status: 'paid' } },
  { $group: { _id: '$userId', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
]);
```

Common stages: `$match`, `$group`, `$project`, `$sort`, `$lookup`, `$unwind`, `$limit`.

Spoken answer:

> Aggregation is Mongo’s multi-stage pipeline for filtering, grouping, reshaping, and joining documents — like SQL `WHERE` + `GROUP BY` + joins in a chain.

---

## 10. `req` / `res` / `res.send` (Express)

| Piece | Role |
|-------|------|
| `req` | Incoming request (params, query, body, headers, cookies) |
| `res` | Outgoing response helpers |
| `res.send` | Sends response (string/object/buffer); sets Content-Type when needed and ends the response |

Related: `res.json()`, `res.status()`, `res.redirect()`, `res.end()`.

Spoken answer:

> `req` is the request object, `res` is the response. `res.send` writes the body and finishes the response; calling it twice throws.

---

## Quick revision order

```text
Express req/res + middleware
        ↓
Node event loop example
        ↓
Indexing + Mongo aggregation
        ↓
Debounce
        ↓
React lifecycle + effects/memo hooks
        ↓
Next.js SSR / SSG / ISR
```
