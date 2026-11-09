import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Transactions & ACID',
  description: 'Atomicity to durability, isolation levels and anomalies like dirty and phantom reads.',
  questions: [
    {
      id: 'what-is-a-transaction',
      question: 'What is a database transaction? Explain COMMIT and ROLLBACK with a real example.',
      section: 'Easy',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `A transaction is a group of database operations that the database treats as **one unit of work**: either **all of them take effect, or none do**.

You start it with \`BEGIN\`, run your statements, and finish with:

- **\`COMMIT\`**: make every change permanent and visible to other sessions.
- **\`ROLLBACK\`**: throw every change away, as if the transaction never ran. The database also rolls back automatically if the connection drops or a statement fails mid-way.

The classic example is a **bank transfer**: debit account A and credit account B. If the credit fails after the debit, a rollback puts the money back, so money is never lost or created. In e-commerce it's **checkout**: create the order, insert its line items and decrement stock together, so you never have an order without reserved stock or stock gone with no order.

Outside an explicit transaction, most databases run in **autocommit** mode, where each statement is its own tiny transaction. Savepoints let you roll back part of a transaction without abandoning all of it.`,
      analogy: `A bank transfer slip: money leaves one account and arrives in the other as one action; if anything fails, the whole slip is cancelled.`,
      quickRevision: [
        'Group of operations as one unit: all or nothing',
        'BEGIN → work → COMMIT (permanent) or ROLLBACK (discard)',
        'Auto-rollback on failure or dropped connection',
        'Examples: bank transfer, checkout (order + items + stock)',
        'Autocommit = each statement is its own transaction',
      ],
      deepDive: `\`\`\`sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- any error above → ROLLBACK, nothing changed
COMMIT;
\`\`\`

\`\`\`js
// node-postgres
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, from]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, to]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
\`\`\``,
      followUps: [
        'What are the ACID properties?',
        'What is autocommit?',
        'What are savepoints?',
      ],
    },
    {
      id: 'acid-properties',
      question: 'What does ACID stand for? Explain each property with an example.',
      section: 'Easy',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `ACID is the set of guarantees a transaction gives you:

- **Atomicity**: all or nothing. If a transfer debits A and then crashes before crediting B, the debit is undone. The database uses an **undo log** to roll back partial work.
- **Consistency**: a transaction moves the database from one **valid state to another**. Constraints, foreign keys and checks (\`balance >= 0\`, unique email) are never left violated after a commit. Your business rules are part of this too.
- **Isolation**: concurrent transactions **don't see each other's half-finished work**. Two people buying the last ticket behave as if they ran one after the other, to the degree the **isolation level** promises.
- **Durability**: once \`COMMIT\` returns, the change **survives crashes and power loss**, because it's in the **write-ahead log** on disk before the commit is acknowledged.

A good way to keep them apart: atomicity is about **failure** inside one transaction, isolation is about **concurrency** between transactions, consistency is about **rules**, and durability is about **crashes after commit**.`,
      analogy: `A bank vault's rules: every movement is complete (A), the books always balance (C), tellers don't trip over each other (I), and nothing is forgotten after a power cut (D).`,
      quickRevision: [
        'Atomicity: all or nothing (undo log)',
        'Consistency: constraints and rules always hold after commit',
        'Isolation: concurrent transactions don\'t see partial work',
        'Durability: committed data survives crashes (WAL)',
        'A = failure, I = concurrency, C = rules, D = crashes',
      ],
      avoid: [
        `Mixing up consistency and isolation: "rules stay valid" is C, "concurrent users don't interfere" is I`,
      ],
      followUps: [
        'How does the DB undo partial work?',
        'Which isolation level is the Postgres default?',
        'What is a write-ahead log?',
      ],
    },
    {
      id: 'what-problem-does-isolation-solve',
      question: 'What problem does isolation solve? Explain the isolation levels and the anomalies they prevent.',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `Isolation controls **what one transaction can see of others running at the same time**. Without it, concurrent users interfere and you get anomalies:

- **Dirty read**: reading another transaction's **uncommitted** change, which might be rolled back.
- **Non-repeatable read**: reading the same row twice in one transaction and getting **different values** because someone committed in between.
- **Phantom read**: running the same query twice and getting **different rows** because someone inserted or deleted matching rows.
- **Lost update**: two transactions read-modify-write the same row and one silently overwrites the other.

The SQL levels trade safety for concurrency: **Read Uncommitted** allows all of them; **Read Committed** (the **Postgres** default) stops dirty reads; **Repeatable Read** (the **MySQL InnoDB** default) also stops non-repeatable reads, and both engines prevent most phantoms there through snapshots and gap locks; **Serializable** behaves as if transactions ran one at a time, and may abort some with a serialization error you must retry.

In practice I stay on the default and protect the specific hot spots: an **atomic conditional update**, \`SELECT … FOR UPDATE\`, or a version column. I raise the level only where the logic really needs it.`,
      analogy: `Two chefs working from the same recipe card: isolation makes sure one chef doesn't act on the other's half-written changes.`,
      quickRevision: [
        'Dirty read: see uncommitted data',
        'Non-repeatable read: same row, different value',
        'Phantom: same query, different rows',
        'Read Committed (PG default) → Repeatable Read (MySQL default) → Serializable',
        'Higher level = safer but more blocking/retries',
      ],
      deepDive: `| Level | Dirty read | Non-repeatable | Phantom |
|---|---|---|---|
| Read Uncommitted | possible | possible | possible |
| Read Committed | — | possible | possible |
| Repeatable Read | — | — | possible (mostly prevented in PG/InnoDB) |
| Serializable | — | — | — |

\`\`\`sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- … may fail with: could not serialize access (SQLSTATE 40001) → retry the whole transaction
COMMIT;
\`\`\``,
      followUps: [
        'What is a dirty read?',
        'Which isolation level is the Postgres default?',
        'Does Repeatable Read prevent lost updates?',
      ],
    },
    {
      id: 'what-happens-if-a-transaction-fails-after-partial-update',
      question: 'What happens if a transaction fails halfway through, and how should the application handle it?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `The database **rolls back everything the transaction did**, using its undo information, so other sessions never see the partial change. If account A was debited and the credit to B fails, A's balance is restored. Locks the transaction held are released.

The application's job is the part the database can't do:

1. **Catch the error and roll back explicitly** if you're managing the transaction yourself (and always release the connection in \`finally\`), otherwise the connection may stay in an aborted state.
2. **Decide whether to retry.** Deadlocks, serialization failures and timeouts are **transient**: retry the whole transaction with backoff. Constraint violations or bad input aren't: return a clear error.
3. **Make retries safe** with an **idempotency key** so a retried request doesn't create a second order.

Without a transaction, a failure halfway leaves the data **inconsistent**: an order with no stock reserved, or stock reduced with no order. That's exactly what transactions exist to prevent.`,
      analogy: `If the printer jams halfway through a contract, you shred the half-printed copy and start again rather than signing half a contract.`,
      quickRevision: [
        'DB rolls back all changes; locks released',
        'App: catch, ROLLBACK, release the connection',
        'Retry transient errors (deadlock, serialization, timeout) with backoff',
        'Don\'t retry validation/constraint errors',
        'Idempotency keys make retries safe',
      ],
      followUps: [
        'How should the app handle the error?',
        'What if the failure happens after COMMIT?',
        'Which errors are safe to retry?',
      ],
    },
    {
      id: 'why-do-banking-systems-depend-on-acid',
      question: 'Why do banking and payment systems depend on ACID, and how would you design a money transfer?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `Because with money, **"mostly correct" is wrong**. Every ACID property maps to a real failure: a transfer that debits but doesn't credit (atomicity), a balance going negative against the rules (consistency), two simultaneous withdrawals both seeing enough funds (isolation), or a confirmed payment vanishing after a crash (durability).

For a transfer, I would:

- Run the debit and credit in **one transaction**.
- Lock both accounts with \`SELECT … FOR UPDATE\` **in a consistent order** (lower id first) to avoid deadlocks, then check the balance and write.
- Enforce rules in the database too: \`CHECK (balance >= 0)\`, and store amounts as **integers in minor units** (cents), never floats.
- Prefer a **ledger**: an append-only \`entries\` table with one debit and one credit row per transfer, summing to zero. The balance is derived from (or cached alongside) the ledger, which gives a full audit trail.
- Use an **idempotency key** per transfer request, so a retried API call can't move the money twice.`,
      analogy: `A bank vault's rules: every movement is complete (A), the books always balance (C), tellers don't trip over each other (I), and nothing is forgotten after a power cut (D).`,
      quickRevision: [
        'Each ACID letter prevents a real money bug',
        'One transaction for debit + credit',
        'Lock accounts in a consistent order (lower id first)',
        'Integers in minor units; `CHECK (balance >= 0)`',
        'Append-only ledger + idempotency keys',
      ],
      deepDive: `\`\`\`sql
BEGIN;
SELECT id, balance FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
-- app checks balance of account 1 >= 5000
INSERT INTO ledger_entries (transfer_id, account_id, amount) VALUES
  ('tr_123', 1, -5000),
  ('tr_123', 2,  5000);
UPDATE accounts SET balance = balance - 5000 WHERE id = 1;
UPDATE accounts SET balance = balance + 5000 WHERE id = 2;
COMMIT;
\`\`\``,
      followUps: [
        'How would you design a transfer between two accounts?',
        'Why use a ledger instead of updating balances?',
        'How do you make the transfer API idempotent?',
      ],
    },
    {
      id: 'can-a-single-sql-query-need-a-transaction',
      question: 'Does a single SQL statement need a transaction? Is a read-then-write safe on its own?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `A single statement is **already atomic**. In autocommit mode the database wraps it in its own implicit transaction, so a multi-row \`UPDATE\` either changes every matching row or none, and a failure halfway is rolled back. You don't need an explicit \`BEGIN\` just for one statement.

The trap is the **read-then-write** pattern across **two** statements:

\`\`\`sql
SELECT stock FROM products WHERE id = 1;      -- app sees 1
UPDATE products SET stock = 0 WHERE id = 1;   -- another request did the same
\`\`\`

Each statement is atomic, but the **pair isn't**, and even wrapping them in a transaction at Read Committed doesn't stop two requests from both reading \`1\`.

The fixes are to **make it one atomic statement** with the condition inside it, which is my default:

\`\`\`sql
UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0;
-- 1 row updated = success, 0 rows = sold out
\`\`\`

or to **lock the row** with \`SELECT … FOR UPDATE\` inside a transaction, or to use **optimistic locking** with a version column.`,
      analogy: `One instruction can still involve many steps behind the scenes; the database wraps a single statement as a mini all-or-nothing action for you.`,
      quickRevision: [
        'One statement = atomic (implicit transaction)',
        'Read-then-write across statements is a race',
        'A transaction alone at Read Committed doesn\'t fix it',
        'Best: conditional atomic UPDATE, check rows affected',
        'Or `FOR UPDATE`, or a version column',
      ],
      followUps: [
        'Is `UPDATE stock = stock - 1 WHERE stock > 0` safe alone?',
        'What is autocommit mode?',
        'How does optimistic locking work?',
      ],
    },
    {
      id: 'balance-deducted-but-order-not-created-which-acid-property-failed',
      question: `A customer's balance was deducted but no order was created. Which ACID property failed, and how do you fix it?`,
      section: 'Scenario-based',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `**Atomicity.** Deducting the balance and creating the order are one business action, but they ran as **separate commits**, so the first succeeded and the second failed, leaving a partial update.

The fix depends on where the data lives:

- **Same database**: put both writes in **one transaction**. If the order insert fails, the deduction rolls back automatically.
- **Different services** (wallet service and order service), where one transaction isn't possible: use a **saga**. Each step commits locally and has a **compensating action**: if creating the order fails, issue a refund to the wallet. Use the **outbox pattern** so the "balance deducted" event is reliably published together with the local commit, and make every step **idempotent** so retries are safe.

For the customers already affected, I'd run a **reconciliation** query (deductions with no matching order) and refund them, and add monitoring so it's caught automatically next time.`,
      analogy: `Paying at the till but walking out with no shopping: the "pay and receive" pair wasn't treated as one action.`,
      quickRevision: [
        'Atomicity failed: partial update',
        'Same DB → one transaction',
        'Different services → saga + compensating refund',
        'Outbox pattern for reliable events; idempotent steps',
        'Reconcile and refund affected users',
      ],
      followUps: [
        'What if the balance and orders live in different services?',
        'What is a compensating transaction?',
        'What is the outbox pattern?',
      ],
    },
    {
      id: 'db-transactions-isolation-race',
      question: 'Two users try to buy the last item at the same time. How do you prevent overselling?',
      section: 'Scenario-based',
      perspective: 'scenario',
      difficulty: 'hard',
      frequency: 'very-high',
      tags: ['sql', 'mongodb', 'redis', 'system-design'],
      answer: `This is a **race condition**. Both read "stock = 1", both decide to sell, and both write. Reading and then writing in application code isn't safe. The check and the update must be **atomic**. Options, from simplest:

1. **Atomic conditional update** (my default):
   \`UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0\`. If **0 rows** are affected, it's sold out. In Mongo: \`findOneAndUpdate({ _id, stock: { $gt: 0 } }, { $inc: { stock: -1 } })\`.
2. **Pessimistic locking**: \`SELECT ... FOR UPDATE\` inside a transaction locks the row, so the second buyer waits. Good when you need several checks before writing. Keep the transaction short to avoid lock contention and deadlocks.
3. **Optimistic locking**: a \`version\` column, \`UPDATE ... WHERE id = ? AND version = ?\`, retry on conflict. Good when conflicts are rare.
4. **Constraints**: \`CHECK (stock >= 0)\` as a safety net.

Put the order creation and the stock decrement in **one transaction** so you never get stock reduced without an order. For **flash sales**, use a fast Redis atomic counter (\`DECR\`) or a short-lived **reservation with a TTL** (hold for 10 minutes until payment), then confirm in the DB, with a queue absorbing the spike.`,
      analogy: `Two people reaching for the last concert ticket at two different counters. If both counters check a printed list, both sell it. The fix is one central system where "check and take" is a single action. The first request takes it, and the second is told "sold out" immediately.`,
      quickRevision: [
        'Read-then-write in app code = race condition',
        'Atomic: `UPDATE … WHERE stock > 0` + check affected rows',
        'Pessimistic: `SELECT … FOR UPDATE` (short transactions)',
        'Optimistic: version column + retry',
        'Order + stock in one transaction; flash sale → Redis DECR / TTL reservation + queue',
      ],
      followUps: [
        'What are isolation levels, and which anomalies does each prevent?',
        'What is a deadlock and how do you avoid it?',
        'Pessimistic vs optimistic locking: when to use each?',
      ],
    },
    {
      id: 'power-failure-after-commit-which-property-guarantees-safety',
      question: 'The power fails right after COMMIT returns. Is the data safe? Which property guarantees it, and how?',
      section: 'Scenario-based',
      perspective: 'scenario',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['sql'],
      answer: `Yes. That's **durability**: once \`COMMIT\` has returned success, the change must survive a crash.

The mechanism is the **write-ahead log (WAL)** (the redo log in InnoDB). Before acknowledging a commit, the database **appends the change to the log and flushes it to disk with \`fsync\`**. The actual table and index pages can be written later, lazily. If the power fails, on restart the database **replays the log** to redo committed changes and discards uncommitted ones.

So the guarantee is about the log reaching stable storage, which is why durability can be **tuned**: Postgres' \`synchronous_commit = off\` or InnoDB's \`innodb_flush_log_at_trx_commit = 2\` make commits faster but can lose the last moments of commits in a crash. I'd only accept that for data like analytics events.

Durability on one machine doesn't protect against **disk loss**, so production adds **replication** (ideally synchronous for critical data) and **backups with point-in-time recovery**.`,
      analogy: `Once the notary stamps the document, it's recorded in the official register, even if the lights go out a second later.`,
      quickRevision: [
        'Durability: committed = survives crashes',
        'WAL flushed to disk before COMMIT returns',
        'Restart replays the log (redo committed, drop uncommitted)',
        'Can be relaxed for speed (`synchronous_commit = off`)',
        'Disk loss needs replication + backups',
      ],
      followUps: [
        'What is a write-ahead log?',
        'Can durability be weakened for speed?',
        'What is point-in-time recovery?',
      ],
    },
    {
      id: 'why-keep-order-creation-and-stock-reduction-in-the-same-transaction',
      question: 'Why should order creation and stock reduction happen in the same transaction?',
      section: 'Scenario-based',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `Because they describe **one fact**: "this stock now belongs to this order". If they commit separately, a failure between them leaves the two tables **disagreeing**:

- **Stock reduced, no order**: inventory disappears, and the product may show as sold out when it isn't.
- **Order created, no stock reduced**: you **oversell** and have to cancel on a customer.

In one transaction both happen or neither does. Inside it, I'd decrement with a **conditional atomic update** (\`SET stock = stock - :qty WHERE id = :id AND stock >= :qty\`) and check the affected row count. That also handles concurrency: if two buyers race for the last item, only one update matches.

What I keep **out** of the transaction is anything slow or external: the **payment gateway call**, emails and webhooks. Holding row locks while waiting on a third-party API blocks other buyers and invites deadlocks and timeouts. The usual flow is: reserve stock and create a \`pending\` order in one short transaction, take payment, then mark it \`paid\` (or release the reservation) in another.`,
      analogy: `Handing over the goods and writing the receipt at the same counter at the same moment, so the stock book and sales book always agree.`,
      quickRevision: [
        'Separate commits → stock without order, or overselling',
        'One transaction: both or neither',
        'Conditional decrement + check rows affected',
        'Keep payment calls and emails outside the transaction',
        'Reserve (pending) → pay → confirm or release',
      ],
      followUps: [
        'Where does the payment call go?',
        'What if payment is slow or fails?',
        'How do you release reservations that are never paid?',
      ],
    },
    {
      id: 'in-checkout-order-inventory-wallet-confirmation-which-steps-belong-in-o',
      question: `In checkout (order + inventory + wallet + confirmation), which steps belong in one DB transaction, and which should stay outside?`,
      section: 'Bonus questions',
      perspective: 'concept',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['sql'],
      answer: `**Inside one short DB transaction**: things that must stay consistent **in the same database**:

- reserve or decrement stock with a conditional update (\`stock >= qty\`);
- create the order and order lines (status \`pending_payment\` or \`paid\`);
- debit the wallet if it's an internal wallet in the same DB (conditional on enough balance), plus the ledger entry.

**Outside the transaction**:

- **External payment calls**: slow and unreliable, so never hold locks while waiting. Do them before (with an idempotency key) or after, and update the order status on the result or webhook.
- **Confirmation emails, SMS, analytics**: a side effect enqueued **after commit** (an outbox table plus a worker, so the message isn't lost if the process dies).

Rule of thumb: the transaction covers **state changes that must be atomic**, and anything slow or external happens around it, made reliable with **idempotency and an outbox**.`,
      analogy: `At the till, scanning items, taking them off the shelf count and writing the receipt happen together; phoning the customer's bank and posting the thank-you card happen outside that moment.`,
      quickRevision: [
        'Inside: stock, order, internal wallet + ledger',
        'Outside: external payment, emails, analytics',
        'No locks held during network calls',
        'Outbox pattern for post-commit side effects',
        'Idempotency keys for retries',
      ],
      followUps: [
        'What is the transactional outbox pattern?',
        'What if the payment succeeds but the order update fails?',
      ],
    },
    {
      id: 'db-crashes-after-stock-reduce-but-before-order-create-what-happens-and-how-do',
      question: 'DB crashes after stock reduce but before order create — what happens and how do you recover?',
      section: 'Bonus questions',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `**If both steps are in one transaction**, nothing bad happens. The transaction **never committed**, so on restart the database recovers from its **write-ahead log** and the stock reduction is **rolled back**. Stock and orders stay consistent, the client gets an error or timeout, and it can **retry safely with an idempotency key**.

**If they were separate commits**, stock is now reduced with no order. The fix is to put them in **one transaction**. For holds and reservations, add a **TTL / \`held_until\`** and a **sweeper job** that returns expired reservations to stock. A periodic **reconciliation** job (stock vs orders) catches anything left over.`,
      analogy: `If the power cuts while you're filling in a form and you hadn't pressed "submit", nothing was filed; you just start again. The danger is only when half the form was submitted separately.`,
      quickRevision: [
        'Same transaction → automatic rollback on recovery (WAL)',
        'Client retries with an idempotency key',
        'Separate commits → inconsistency',
        'Holds with TTL + sweeper; reconciliation job',
      ],
      followUps: [
        'How does the WAL make recovery possible?',
        'How would the client know whether to retry?',
      ],
    },
    {
      id: 'pessimistic-vs-optimistic-locking-when-would-you-use-each',
      question: 'Pessimistic vs optimistic locking — when would you use each?',
      section: 'Bonus questions',
      perspective: 'trade-off',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['performance'],
      answer: `- **Pessimistic locking**: **lock first**, then work (\`SELECT … FOR UPDATE\`). Others wait. Use it when **conflicts are likely** and retries are expensive: the last items in a flash sale, seat booking, money transfers. Keep transactions short, and lock in a consistent order to avoid deadlocks.
- **Optimistic locking**: **don't lock**. Read a \`version\` (or \`updated_at\`), and update with \`WHERE id = ? AND version = ?\`. If 0 rows are affected, someone else changed it, so reload and retry or show a conflict. Use it when **conflicts are rare**, reads dominate, or users edit for a long time (forms, documents), where holding locks would be impossible. Mongoose and Prisma support version fields.

A simple **atomic conditional update** (\`stock = stock - 1 WHERE stock > 0\`) is often the best of both for counters.`,
      analogy: `Pessimistic is booking the meeting room before you walk there; optimistic is walking there and, if someone's already in it, coming back later. Book ahead when the room is always busy.`,
      quickRevision: [
        'Pessimistic: FOR UPDATE, others wait (high contention)',
        'Optimistic: version check, retry on conflict (low contention)',
        'Long user edits → optimistic',
        'Counters → atomic conditional update',
      ],
      followUps: [
        'How would you show an optimistic-lock conflict to a user?',
        'How does Mongoose\'s versionKey work?',
      ],
    },
    {
      id: 'flash-sale-10000-users-hit-buy-now-in-one-second-what-is-your-db-strategy',
      question: 'Flash sale: 10,000 users hit Buy Now in one second — what is your DB strategy?',
      section: 'Bonus questions',
      perspective: 'concept',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['sql'],
      answer: `The goal is to **protect the database** and **never oversell**:

1. **Don't let 10,000 requests reach the DB at once.** Put a **per-user rate limit** and a **queue or virtual waiting room** in front, and serve static pages from a CDN.
2. **Fast atomic gate in Redis**: \`DECR stock\` (or a Lua script). If the result is below 0, \`INCR\` it back and reply "sold out" immediately. Most of the 10,000 requests end here without touching the DB.
3. **Reservation with a TTL** (for example 60 seconds) for winners. Expired holds return stock (a sweeper job or keyspace events) and the UI is updated live.
4. **The DB stays the source of truth**: on checkout, in **one short transaction**, run an **atomic conditional update** (\`UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0\`) and create the order, with a \`CHECK (stock >= 0)\` as a safety net and an **idempotency key** for the payment.
5. **Reconcile** Redis against the DB, and plan for a Redis restart (reload the counter from the DB).

This is the design I built in my **Sneaker Drop** project.`,
      analogy: `A concert drop: a fast ticket counter at the door turns most people away instantly, winners get a ticket that expires if unpaid, and the official box-office ledger records the real sales.`,
      quickRevision: [
        'Rate limit + waiting room before the DB',
        'Redis atomic DECR as the fast gate',
        'TTL holds; expired holds return stock',
        'DB conditional update + order in one transaction',
        'Reconcile Redis with the DB',
      ],
      followUps: [
        'What happens if Redis restarts mid-sale?',
        'How do you stop bots?',
        'Why not just use SELECT … FOR UPDATE for everyone?',
      ],
    },
    {
      id: 'payment-succeeds-but-order-service-fails-how-do-you-recover',
      question: 'Payment succeeds but order service fails — how do you recover?',
      section: 'Bonus questions',
      perspective: 'concept',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['sql'],
      answer: `The money is taken, so the system must **finish the order or refund**, and never lose track of it:

1. **Record intent first**: create the order as \`pending_payment\` **before** charging, with an **idempotency key** shared with the payment provider.
2. **Trust the provider's webhook** (or server-side verification), not the client redirect. When "payment succeeded" arrives, an **idempotent** handler moves the order to \`paid\`. If the order service was down, the webhook is **retried** by the provider, or the event sits in our **queue** until it recovers.
3. **Reconciliation job**: periodically compare successful payments with orders. Any paid payment without a completed order is either **completed automatically** or **refunded** (a compensating action), and flagged for support.
4. **Customer communication**: show "processing" rather than an error, and email when it's resolved.

This is the **saga** idea: each step has a retry or a compensation.`,
      analogy: `If you've paid at the counter but the kitchen lost your order, the restaurant checks the receipt book against the orders, then either cooks your meal or refunds you; it doesn't just forget.`,
      quickRevision: [
        'Create order (pending) before charging',
        'Idempotency key with the provider',
        'Webhook-driven, idempotent status updates',
        'Reconciliation: complete or refund',
        'Saga: retries + compensating actions',
      ],
      followUps: [
        'What is the saga pattern?',
        'Why not trust the redirect after payment?',
        'How do you avoid double refunds?',
      ],
    },
  ],
});
