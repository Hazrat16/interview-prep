# Row-Level Locking

## Concept

**Row-level locking** locks only the specific row(s) a transaction is using, not the whole table.

Goal: prevent multiple transactions from modifying the same row at the same time, while still allowing high concurrency on other rows.

Common in:

- banking / wallets
- inventory systems
- ticket booking
- payment processing
- high-traffic write paths

---

## The problem without locking

Table:

| id | product | stock |
|----|---------|-------|
| 1  | Sneaker | 1     |

Two users buy at the same time:

```text
A reads stock = 1
B reads stock = 1
A updates to 0
B updates to 0 (or -1)
```

Sold 2 items though only 1 existed → **race condition / lost update / data inconsistency**.

Concurrency itself is not the bug. Uncontrolled concurrent writes are.

---

## How row-level locking helps

```sql
BEGIN;

SELECT *
FROM products
WHERE id = 1
FOR UPDATE;

UPDATE products
SET stock = stock - 1
WHERE id = 1;

COMMIT;
```

`FOR UPDATE` means: *I intend to update this row, so lock it exclusively.*

Flow:

1. Transaction A locks row `id = 1`
2. Transaction B trying the same `FOR UPDATE` waits
3. A commits (or rolls back) → lock released
4. B continues with the latest data

Other rows (e.g. `id = 2`) stay usable.

---

## Lock types

### Shared lock (read lock)

- Multiple readers allowed
- Blocks writers
- Example idea: `LOCK IN SHARE MODE` / `FOR SHARE`

### Exclusive lock (write lock)

- Only one transaction may modify the row
- Blocks other writers (and sometimes readers, depending on isolation)
- `FOR UPDATE` takes an exclusive row lock

---

## Row lock vs table lock

| Type | What it locks | Concurrency |
|------|---------------|-------------|
| Row-level | Specific rows | High |
| Table lock | Entire table | Low |

Row locks scale better for high-traffic systems.

---

## Real examples

### E-commerce inventory

```sql
BEGIN;

SELECT stock
FROM products
WHERE id = 1
FOR UPDATE;

UPDATE products
SET stock = stock - 1
WHERE id = 1;

COMMIT;
```

Prevents overselling.

### Bank debit

```sql
BEGIN;

SELECT balance
FROM accounts
WHERE id = 1
FOR UPDATE;

UPDATE accounts
SET balance = balance - 100
WHERE id = 1;

COMMIT;
```

Prevents double spending / lost updates.

---

## `SKIP LOCKED`

```sql
SELECT *
FROM jobs
FOR UPDATE SKIP LOCKED;
```

Instead of waiting on locked rows, skip them.

Used in:

- job queues
- worker pools
- background processors

---

## Best practices

1. **Keep transactions short** — locks are held until commit/rollback.
2. **Do not do slow work inside a lock** — no external API calls, sleeps, or user waits.
3. **Lock rows in a consistent order** — e.g. always smaller `id` first — to reduce deadlocks.
4. Use `FOR UPDATE` only when you will actually update (or need a strong read lock).

Bad pattern:

```sql
BEGIN;
SELECT ... FOR UPDATE;
-- long API call / heavy processing while holding lock
COMMIT;
```

---

## Deadlock connection

Opposite lock order can deadlock:

```sql
-- A
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
SELECT * FROM accounts WHERE id = 2 FOR UPDATE;

-- B
SELECT * FROM accounts WHERE id = 2 FOR UPDATE;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
```

DB detects circular wait and rolls back one transaction. See [deadlocks.md](deadlocks.md).

---

## Interview Q&A

### Q1: Why is row-level locking better than table locking in high traffic?

**Answer:**

> Row-level locking locks only the specific rows being modified, so other transactions can still access other rows. That improves concurrency, scalability, and throughput compared with locking the entire table.

---

### Q2: What happens if two users update the same row without locking?

**Answer:**

> A race condition can occur. Both transactions may read the same value before either writes, causing lost updates or inconsistent state — for example selling the same last item twice.

```text
A reads stock = 1
B reads stock = 1
A sets stock = 0
B sets stock = 0
```

---

### Q3: What does `FOR UPDATE` do?

**Answer:**

> `FOR UPDATE` places an exclusive lock on the selected rows for the duration of the transaction. Other transactions that try to lock or update those same rows must wait until the current transaction commits or rolls back.

---

### Q4: What is a deadlock (locking context)?

**Answer:**

> Deadlock happens when two or more transactions each hold locks and wait for each other’s locks, forming a cycle so none can proceed. The database usually detects this and rolls back one transaction (the victim).

---

### Q5: Why should transactions be short when using locks?

**Answer:**

> Locks are held for the whole transaction. Long transactions increase lock contention, block other work, reduce concurrency, hurt performance, and raise deadlock risk. Keep critical sections short and commit quickly.

---

### Q6: How do databases handle deadlocks?

**Answer:**

> Most databases detect circular waits (wait-for graph cycles), choose a victim transaction, roll it back, and let the others continue. Applications also prevent deadlocks with consistent lock ordering, short transactions, and retries. Row-level locking improves concurrency but does not by itself prevent deadlocks.

---

## Key takeaways

- Lock the row you will change; leave other rows free
- `FOR UPDATE` = exclusive intent to update
- Race without locking → oversell / lost update
- Short transactions + consistent lock order
- `SKIP LOCKED` is great for worker queues
