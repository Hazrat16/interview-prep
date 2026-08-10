# Node.js Runtime

## Concept

**Node.js** is a JavaScript runtime built on **Chrome’s V8 engine** plus platform APIs for files, network, processes, etc.

It lets JS run **outside the browser** — servers, CLIs, tooling, APIs.

```text
Your JS code
    ↓
Node.js APIs (fs, http, crypto, ...)
    ↓
V8 executes JavaScript
    ↓
libuv handles async I/O + thread pool
    ↓
OS
```

---

## How Node.js works (high level)

1. **V8** parses and executes JavaScript
2. **Event loop** (via **libuv**) schedules callbacks
3. **Non-blocking I/O** — network/file waits don’t freeze the process by default
4. A **thread pool** (libuv) handles some expensive/blocking tasks (certain file system ops, DNS, crypto, compression, etc.)

So: **JS runs on one main thread**, but Node can still juggle many concurrent connections.

---

## Single-threaded — how does it handle multiple tasks?

### What “single-threaded” means

- One main thread executes your JavaScript
- Only one JS callback runs at a time on that thread
- Heavy synchronous CPU work blocks other requests

### How concurrency still works

Node uses an **event-driven, non-blocking** model:

```text
Request A arrives → start DB query (wait in OS/libuv)
Request B arrives → start another query while A waits
DB for A ready → callback queued → event loop runs A's handler
DB for B ready → run B's handler
```

While waiting on I/O, the main thread is free for other JS work.

Analogy:

> One waiter (JS thread) takes many table orders. Kitchen (OS/I/O/thread pool) cooks in parallel. Waiter delivers food as each dish is ready — doesn’t stand idle at one table.

---

## Blocking vs non-blocking

### Non-blocking (good default for servers)

```js
const fs = require("fs");

fs.readFile("file.txt", "utf8", (err, data) => {
  console.log(data);
});
console.log("this runs first");
```

### Blocking (avoid on request path)

```js
const data = fs.readFileSync("file.txt", "utf8");
// nothing else runs until read finishes
```

CPU-heavy sync loops also block:

```js
for (let i = 0; i < 1e10; i++) {} // stalls event loop
```

For CPU-heavy work, use **Worker Threads**, child processes, or offload to another service.

---

## Node event loop phases (interview-friendly)

Simplified libuv loop phases:

1. Timers — `setTimeout` / `setInterval`
2. Pending callbacks
3. Idle / prepare
4. Poll — retrieve new I/O events
5. Check — `setImmediate`
6. Close callbacks

Between phases, **microtasks** (Promises / `process.nextTick`) are processed.

`process.nextTick` runs before other Promise microtasks (Node-specific detail interviewers sometimes ask).

---

## Cluster / scaling beyond one core

One Node process uses one CPU core effectively for JS.

To use multiple cores:

- **Cluster module** / multiple processes
- Process managers (PM2)
- Containers + load balancer
- Worker threads for parallel CPU tasks inside a process

---

## Node vs browser JS

| | Browser | Node |
|--|---------|------|
| Engine | V8 / SpiderMonkey / etc. | V8 |
| DOM / `window` | Yes | No |
| `fs` / `http` / `process` | No | Yes |
| Global | `window` | `global` / `globalThis` |
| Modules | ES modules (+ historically scripts) | CommonJS + ESM |

Same language, different runtime APIs.

---

## Interview Q&A

### Q1: What is Node.js?

**Answer:**

> Node.js is a JavaScript runtime built on V8 that lets us run JS on the server. It provides APIs for filesystem, networking, and processes, and uses an event-driven non-blocking I/O model through libuv.

---

### Q2: Node is single-threaded — how does it handle many requests?

**Answer:**

> JavaScript on the main thread is single-threaded, so only one JS callback runs at a time. Node still handles many concurrent requests because I/O operations are non-blocking: while one request waits on a database or network, the event loop can process other requests. libuv and the OS handle the waiting work in the background, and some tasks use a thread pool.

---

### Q3: Is Node.js single-threaded completely?

**Answer:**

> The JavaScript execution is single-threaded, but Node is not literally one OS thread overall. libuv maintains a thread pool for certain operations, and the OS may use multiple threads for I/O. Worker threads and child processes can add more parallelism when needed.

---

### Q4: What blocks the Node event loop?

**Answer:**

> Synchronous CPU-heavy code, `*Sync` I/O methods, and long loops block the event loop. While blocked, Node can’t process other callbacks, so latency spikes for all clients on that process.

---

### Q5: Difference between `setImmediate` and `setTimeout(fn, 0)`?

**Answer:**

> Both schedule a callback soon, but they queue in different phases. In many I/O callback contexts, `setImmediate` runs before `setTimeout(..., 0)`. Exact ordering can depend on context; the key interview point is they are different timers with different event-loop phases.

---

### Q6: When would you use Worker Threads?

**Answer:**

> When work is CPU-bound — image processing, heavy encryption, large JSON transforms — and would otherwise freeze the event loop. I/O-bound workloads usually don’t need workers; the event loop already handles those well.

---

### Q7: Why is Node popular for APIs?

**Answer:**

> It’s strong for I/O-heavy, concurrent workloads like APIs and real-time apps, uses one language across stack with JavaScript/TypeScript, has a huge package ecosystem, and non-blocking I/O helps serve many connections efficiently on a single process.

---

## Key takeaways

- Node = V8 + libuv + JS APIs
- Single JS thread ≠ can’t handle concurrency
- Non-blocking I/O is the secret
- Don’t block the event loop
- Scale with processes/workers for CPU / multi-core
