# Closures

## Concept

A **closure** is when an inner function remembers and can access variables from its outer function’s scope, even after the outer function has finished running.

Mental model: the function carries a backpack of the variables it closed over.

```js
function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
```

`count` is private to the closure. Each call to `makeCounter()` creates a **new** closed-over `count`.

---

## Why closures matter

Used for:

- Data privacy / encapsulation
- Function factories
- Callbacks and event handlers
- Partial application / currying
- React hooks (conceptually related to remembering state across renders — different mechanism, same “remembered environment” intuition in interviews)

---

## Classic interview pitfall: loop + `var`

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3, 3, 3
```

All callbacks share the same `var i`, which is `3` when they run.

Fix with `let` (block scope per iteration):

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0, 1, 2
```

Or an IIFE / explicit binding with `var`.

---

## Module pattern (simple)

```js
function createWallet(initial = 0) {
  let balance = initial;
  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}
```

`balance` can’t be accessed directly from outside.

---

## Interview Q&A

### Q1: What is a closure?

**Answer:**

> A closure is formed when a function retains access to variables from its lexical outer scope even after that outer function has returned. The inner function “closes over” those variables and can read or update them later.

---

### Q2: Give a real use case.

**Answer:**

> Closures are used for private state, like a counter or wallet balance that outside code can’t access directly. They’re also common in callbacks, event handlers, and function factories.

---

### Q3: Why does `var` in a loop print the same value with setTimeout?

**Answer:**

> Because `var` is function-scoped, every callback closes over the same `i`. By the time the timers run, the loop finished and `i` is the final value. `let` creates a new binding per iteration, so each callback sees the correct index.

---

### Q4: Do closures cause memory leaks?

**Answer:**

> Closures keep referenced outer variables alive, which is intended. A leak can happen if a long-lived closure accidentally retains large objects that are no longer needed. Avoid closing over unnecessary heavy data.

---

## Key takeaways

- Closure = function + remembered outer variables
- Great for privacy and factories
- Loop + async + `var` is a favorite interview trap
