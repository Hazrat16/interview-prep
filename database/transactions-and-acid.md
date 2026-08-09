# Transactions & ACID

## Concept

A **transaction** is a sequence of one or more database operations treated as a **single unit of work**.

Either:

- everything succeeds, or
- everything fails / rolls back

No partial update.

Transactions are about **atomicity and consistency**, not about “how many queries.” Even a single statement is usually an implicit transaction.

---

## Why transactions are needed

Without transactions, related operations can leave the database in an invalid state.

```sql
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
-- server crashes here
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
```

Result: sender lost money, receiver got nothing.

Transactions prevent this kind of logical corruption.

### Real-world examples

- Banking transfer (debit + credit)
- E-commerce checkout (order + stock + payment)
- Ticket booking
- Wallet / mobile banking
- Inventory updates with order creation

---

## Basic syntax

```sql
BEGIN;

UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;

COMMIT;   -- save permanently
-- or
ROLLBACK; -- undo all uncommitted changes
```

| Command | Meaning |
|---------|---------|
| `COMMIT` | Permanently save transaction changes |
| `ROLLBACK` | Undo uncommitted changes and restore previous consistent state |

Analogy: fill a bank transfer form → **Submit = COMMIT**, **Cancel = ROLLBACK**.

---

## ACID properties

### A — Atomicity

All or nothing. If any step fails, previous changes in the transaction are rolled back.

```text
1 AND 1 AND 1 = 1
1 AND 1 AND 0 = 0
```

Interview wording:

> Either all operations succeed, or all previous changes are rolled back. No partial updates remain.

---

### C — Consistency

Before and after the transaction, the database must remain valid according to constraints and business rules.

Examples of rules:

- balance cannot be negative
- order must reference a valid user
- foreign keys must stay valid

Consistency is about **rules remaining valid**.

---

### I — Isolation

Concurrent transactions should not interfere with each other. Each behaves as if it were running alone.

Without isolation (last item, stock = 1):

```text
User A reads stock = 1
User B reads stock = 1
Both buy → stock becomes -1
```

Isolation solves concurrency problems such as dirty reads, lost updates, and race conditions.

Memory line:

- Atomicity → no partial work
- Consistency → rules stay valid
- Isolation → no interference
- Durability → saved forever

---

### D — Durability

Once committed, data must survive crashes, power failure, or restarts.

Databases typically rely on persistent storage and write-ahead logs (WAL) for recovery.

> Committed means permanent, even after crash.

---

## Full ACID summary

| Property | One-liner |
|----------|-----------|
| Atomicity | All succeed or all roll back |
| Consistency | Rules / integrity remain valid |
| Isolation | Concurrent transactions don’t corrupt each other |
| Durability | Committed data survives failures |

---

## Interview Q&A

### Easy

#### Q1: What is a transaction?

**Answer:**

> A transaction is a sequence of one or more database operations treated as a single unit of work. Either all operations succeed together or all fail together to maintain data consistency. For example, a bank transfer where money is deducted from one account and added to another.

---

#### Q2: Why are transactions needed?

**Answer:**

> Transactions ensure data consistency when multiple related operations must happen together. If one operation fails, previous operations are rolled back so the database does not enter an invalid state. In a food ordering system, creating the order, deducting stock, deducting balance, and assigning a rider should all succeed together or fail together.

---

#### Q3: What does Atomicity mean?

**Answer:**

> Atomicity means a transaction is indivisible. Either all operations succeed or none of the changes are kept. If any step fails, the database rolls back previous changes to prevent partial updates.

---

#### Q4: Difference between COMMIT and ROLLBACK?

**Answer:**

> COMMIT permanently saves all changes made in the current transaction. After commit, those changes cannot be undone with rollback. ROLLBACK undoes uncommitted changes and restores the database to the consistent state before the transaction started.

---

#### Q5: Give one real-life transaction example.

**Answer:**

> In an e-commerce checkout, confirming the order, reducing stock, deducting user balance, and initiating delivery should run in one transaction. If any step fails, everything rolls back so you don’t get unpaid orders or wrong inventory.

---

### Medium

#### Q6: What problem does Isolation solve?

**Answer:**

> Isolation ensures concurrent transactions do not interfere with each other. It prevents issues like dirty reads, lost updates, and incorrect stock when multiple users operate at the same time. Each transaction behaves as if it is executing alone.

Note: “rules stay valid” is **Consistency**, not Isolation. Isolation is about **concurrency control**.

---

#### Q7: What happens if a transaction fails after partial update?

**Answer:**

> The database performs a rollback. All changes made by that transaction are undone, and the database returns to its previous consistent state. For example, if an account is debited and the next step fails, rollback restores the original balance.

---

#### Q8: Why do banking systems depend on ACID?

**Answer:**

> Banking systems handle sensitive money operations under high concurrency. ACID prevents incorrect balances, partial updates, duplicate deductions, and data loss. Even a small inconsistency can mean real financial loss, so correctness and durability are critical.

---

#### Q9: Can a single SQL query need a transaction?

**Answer:**

> Yes. Most databases treat a single statement as an implicit transaction to guarantee atomicity and consistency. A transaction is about safe unit-of-work semantics, not the number of queries.

---

#### Q10: What is data inconsistency?

**Answer:**

> Data inconsistency means the database no longer reflects a correct real-world state, or related data no longer agrees across records. It often happens after partial updates, missing rollbacks, or concurrent interference — for example, an order exists but stock was never reduced.

---

### Scenario-based

#### Q11: Balance deducted but order not created. Which ACID property failed?

**Answer:**

> Atomicity. Related operations should succeed together, but only part completed. The transaction should have rolled back so neither balance deduction nor incomplete order remained.

---

#### Q12: Two users buy the last item at the same time. Which property matters most?

**Answer:**

> Isolation. Concurrent transactions can both read stock = 1 and both succeed unless isolation (and locking) prevents interference. Negative stock is often the *result* of poor isolation; consistency rules alone don’t stop the race by themselves.

---

#### Q13: Power failure after COMMIT. Which property guarantees safety?

**Answer:**

> Durability. Once committed, changes are permanently stored and must survive crashes, typically via persistent storage and recovery logs.

---

#### Q14: Why keep order creation and stock reduction in the same transaction?

**Answer:**

> To preserve atomicity and consistency between business state and inventory state. If they run separately, you can create an order without reducing stock, or reduce stock without an order. In one transaction, both succeed together or fail together.

---

## Bonus mock questions (practice)

Use these for deeper prep (system-design flavor):

1. In checkout (order + inventory + wallet + confirmation), which steps belong in one DB transaction, and which should stay outside?
2. DB crashes after stock reduce but before order create — what happens and how do you recover?
3. Design a DB-level approach to prevent overselling the last item.
4. Pessimistic vs optimistic locking — when would you use each?
5. Flash sale: 10,000 users hit Buy Now in one second — what is your DB strategy?
6. Payment succeeds but order service fails — how do you recover?

---

## Key takeaways

- Transaction = unit of work, not “multiple queries”
- Prefer wording: consistency / integrity / prevent partial updates (not vague “sync”)
- Isolation ≠ Consistency
- Interview formula: **definition + why it matters + example**
- Banking / checkout / wallets are classic ACID examples
