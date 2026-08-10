# Event Loop & Async Basics

## Concept

JavaScript (in browsers and Node) runs on a **single main thread** for JS execution, but can handle async work via the **event loop**.

Core pieces:

1. **Call stack** — where sync code runs now
2. **Web APIs / Node APIs** — timers, I/O, HTTP, DOM events (outside the stack)
3. **Callback / task queues** — waiting to re-enter the stack
4. **Event loop** — moves tasks to the stack when it’s empty

```text
Sync code runs on call stack
      ↓
Async work handed to APIs (timer, network, disk)
      ↓
When done → callback queued
      ↓
Event loop pushes callback to stack when stack is clear
```

---

## Microtasks vs macrotasks

| Queue | Examples | Priority |
|-------|----------|----------|
| Microtasks | `Promise.then`, `queueMicrotask`, `MutationObserver` | Run before next macrotask |
| Macrotasks (tasks) | `setTimeout`, `setInterval`, I/O callbacks, UI events | After current stack + microtasks |

Typical order for one turn:

```text
1. Run sync code
2. Drain microtask queue completely
3. Take one macrotask
4. Drain microtasks again
5. Repeat
```

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");

// A, D, C, B
```

---

## Why single-threaded can feel concurrent

JS doesn’t run two JS functions in parallel on the main thread.

It **interleaves** waiting work:

- while one request waits on DB/network, the thread can run other callbacks
- CPU-heavy sync loops still block everything

Blocking example:

```js
while (true) {} // freezes UI / stops other callbacks
```

---

## Interview Q&A

### Q1: What is the event loop?

**Answer:**

> The event loop is the mechanism that coordinates the call stack and task queues. When the call stack is empty, it takes the next task and executes it. This lets JavaScript stay single-threaded for JS execution while still handling asynchronous operations like timers and I/O.

---

### Q2: Difference between microtasks and macrotasks?

**Answer:**

> Microtasks include Promise callbacks and are processed right after the current call stack, before the next macrotask. Macrotasks include `setTimeout` and many I/O/UI events. That’s why a resolved Promise often runs before a `setTimeout(..., 0)`.

---

### Q3: Is JavaScript multi-threaded?

**Answer:**

> JavaScript execution on the main thread is single-threaded. Concurrency comes from the event loop plus background APIs/OS threads for I/O. Web Workers / worker threads can add real parallelism, but they’re separate from normal main-thread JS.

---

### Q4: Why can `setTimeout(fn, 0)` still be delayed?

**Answer:**

> Zero delay means “as soon as possible after the current stack and pending microtasks,” not literally immediate. The callback waits in the macrotask queue and may be delayed further if the stack is busy.

---

## Key takeaways

- One JS call stack at a time
- Async ≠ parallel JS on main thread
- Promises (microtasks) beat `setTimeout(0)`
- Long sync work blocks the event loop
