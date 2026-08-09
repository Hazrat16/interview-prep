# Deadlocks

## Concept

A **deadlock** happens when two or more transactions hold locks and each waits for a lock held by another, forming a cycle — so none can proceed.

Simple picture:

- Transaction A holds Resource 1, needs Resource 2
- Transaction B holds Resource 2, needs Resource 1
- Both wait forever → deadlock

Mental model:

> Deadlock = circular waiting + held locks + nobody can release

Important: locks are held until **commit or rollback**, not until a single statement finishes.

---

## Coffman conditions (interview favorite)

Deadlock needs all four:

1. **Mutual exclusion** — resource used by one transaction at a time
2. **Hold and wait** — hold one resource while waiting for another
3. **No preemption** — lock not forcibly taken (until deadlock resolution)
4. **Circular wait** — cycle in the wait graph

Break any one condition → no deadlock. Consistent lock ordering breaks circular wait.

---

## Classic SQL example

```sql
-- Transaction A
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1; -- locks 1
UPDATE accounts SET balance = balance + 100 WHERE id = 2; -- wants 2

-- Transaction B (around the same time)
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;  -- locks 2
UPDATE accounts SET balance = balance + 50 WHERE id = 1;  -- wants 1
```

Step-by-step:

| Transaction | Holds | Wants |
|-------------|-------|-------|
| A | id = 1 | id = 2 |
| B | id = 2 | id = 1 |

A waits for B, B waits for A → circular wait → deadlock.

Non-DB analogy: two people in a narrow hallway, each waiting for the other to move first.

---

## How databases detect deadlocks

Databases (PostgreSQL, MySQL, etc.) maintain a **wait-for graph**:

- Node = transaction
- Edge = “is waiting for”

If the graph has a **cycle**, a deadlock exists.

Then the DB:

1. Chooses a **victim** transaction
2. Rolls it back
3. Releases its locks
4. Lets the remaining transaction(s) continue

Interview one-liner:

> Deadlock detection = cycle detection in the wait-for graph.

---

## How the victim is chosen

Not simply “kill the longest transaction.”

Common factors:

- Rollback cost / work already done
- Transaction age
- Number of locks held
- Priority (if configured)
- Work done vs remaining work

Goal: minimize recovery cost — often kill the **cheapest-to-rollback** transaction.

---

## How to prevent / reduce deadlocks

### 1. Always lock in the same order (most important)

Bad:

- T1: A → B
- T2: B → A

Good:

- Always: A → B (or always smaller id → larger id)

Removes circular wait.

### 2. Keep transactions short

Less lock hold time → fewer overlaps.

- Commit ASAP
- No user interaction inside transactions
- No slow external calls while holding locks

### 3. Retry on deadlock (production must-have)

When DB kills a transaction:

- Catch the deadlock error
- Retry the transaction (often with backoff)

### 4. Proper indexing

Fewer rows scanned/locked → fewer conflicts.

### 5. Appropriate isolation level

Lower isolation can mean fewer locks (trade-off with consistency).

### 6. Avoid unnecessary locks

Don’t use `FOR UPDATE` unless needed.

Memory trick:

> Short transactions + same lock order + retry logic

---

## Why prevent deadlocks if the DB already handles them?

DB recovery is not free:

1. **Wasted work** — rolled-back CPU/DB work must rerun
2. **Performance hit** — retries, extra load, higher latency
3. **Worse UX** — payment/checkout may fail or feel slow
4. **Instability at scale** — frequent deadlocks thrash throughput

Engineering principle: prevention is cheaper than recovery.

> DB can fix deadlocks, but prevention avoids cost and delay.

---

## Interview Q&A

### Q1: Explain deadlock in your own words.

**Answer:**

> A deadlock occurs when two or more transactions each hold locks and wait for a lock held by another transaction in a cycle, so all of them wait indefinitely. The database typically resolves this by rolling back one transaction.

---

### Q2: Why can opposite update order cause deadlock?

**Answer:**

> Transaction A locks row 1 and then needs row 2, while Transaction B locks row 2 and then needs row 1. Each holds a lock the other needs, forming a circular wait. Because locks are held until the transaction ends, neither can proceed.

---

### Q3: How does a database detect deadlock?

**Answer:**

> Databases maintain a wait-for graph where nodes are transactions and edges represent waiting dependencies. If a cycle is detected, a deadlock exists, and the database rolls back one transaction to break the cycle.

---

### Q4: How does the DB choose which transaction to kill?

**Answer:**

> It uses a victim selection strategy based on cost factors such as work already done, number of locks held, transaction age, and rollback cost. The goal is to minimize recovery cost, not simply kill the longest transaction.

---

### Q5: Name three practical ways to prevent deadlocks in production.

**Answer:**

> Keep transactions short to reduce lock duration, acquire locks in a consistent order to eliminate circular waits, and implement application-level retry when a deadlock rollback occurs. Proper indexing and suitable isolation levels also reduce contention.

---

### Q6: Why does consistent locking order prevent deadlocks?

**Answer:**

> Consistent locking order eliminates circular wait. If every transaction acquires resources in the same predefined order, no cycle of waiting can form, so deadlock cannot occur.

One-liner:

> Same lock order removes circular wait.

---

### Q7: If the DB auto-handles deadlocks, why still prevent them?

**Answer:**

> Automatic resolution still causes rollbacks, wasted work, retries, higher latency, and poor user experience. Frequent deadlocks reduce throughput. Prevention keeps high-concurrency systems more stable and efficient.

---

## Key takeaways

- Deadlock = circular wait on locked resources
- Detection = wait-for graph cycle
- Victim ≈ cheapest rollback, not “longest”
- Best prevention = consistent lock order + short transactions + retry
- Handling ≠ free — still design to avoid deadlocks
