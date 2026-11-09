import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Row-Level Locking',
  description: 'Shared vs exclusive locks, SELECT … FOR UPDATE and optimistic vs pessimistic locking.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'database/deadlocks/explain-deadlock-in-your-own-words',
    'database/deadlocks/how-does-a-database-detect-deadlock',
  ],
  questions: [
    {
      id: 'why-is-row-level-locking-better-than-table-locking-in-high-traffic',
      question: 'Why is row-level locking better than table-level locking under high traffic?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `A **table lock** blocks every other writer on that table, even ones touching completely different rows. Under load, all writes to \`orders\` would queue behind one transaction. A **row lock** blocks only transactions that want **the same rows**, so a thousand users updating their own carts don't wait for each other. That's much higher **concurrency and throughput**.

Postgres and InnoDB both lock rows by default for \`UPDATE\`, \`DELETE\` and \`SELECT … FOR UPDATE\`. And thanks to **MVCC**, plain reads don't take row locks at all: readers see a snapshot and never block writers.

Two practical caveats:

- Row locking depends on **indexes**. If the \`WHERE\` clause can't use an index, InnoDB may lock every row it scans (and the gaps between them), which behaves almost like a table lock. A missing index on a hot \`UPDATE\` is a classic cause of lock waits.
- Row locks cost memory and bookkeeping, so **bulk operations** that touch most of a table are sometimes better done in batches, or with an explicit table lock during a maintenance window.`,
      analogy: `Locking one hotel room for cleaning instead of closing the whole hotel: other guests keep using their rooms.`,
      quickRevision: [
        'Table lock: blocks all writers; row lock: only same-row writers',
        'Row locks → far higher concurrency',
        'MVCC: plain reads take no row locks',
        'No usable index → many rows locked',
        'Batch big bulk updates',
      ],
      followUps: [
        'When might a database escalate to a bigger lock?',
        'Why do missing indexes make row locking worse?',
        'What is MVCC?',
      ],
    },
    {
      id: 'what-happens-if-two-users-update-the-same-row-without-locking',
      question: 'What happens if two users read and update the same row without locking? Show the lost update.',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `You get a **race condition**, usually a **lost update**. Both transactions **read the same old value**, both compute a new value from it, and the second write **silently overwrites** the first:

\`\`\`text
A reads stock = 1
B reads stock = 1
A writes stock = 0   (sells the item)
B writes stock = 0   (sells the same item again)
\`\`\`

Two orders, one item, and the database never reported an error because each statement was valid on its own. The same bug hits balances, seat bookings and counters.

Ways to prevent it, from simplest:

1. **Atomic update**: do the arithmetic in SQL with a condition, \`UPDATE … SET stock = stock - 1 WHERE id = 1 AND stock > 0\`, and check the affected row count.
2. **Pessimistic lock**: \`SELECT … FOR UPDATE\` inside a transaction, so B waits until A commits and then reads the new value.
3. **Optimistic lock**: a \`version\` column, with \`UPDATE … WHERE id = 1 AND version = 7\`. If 0 rows change, someone else won: re-read and retry.`,
      analogy: `Two people editing the same paper form from two photocopies: whoever hands theirs in last silently wipes out the other's changes (lost update).`,
      quickRevision: [
        'Both read the old value, last write wins → lost update',
        'No error is raised: silent data corruption',
        'Fix 1: atomic conditional UPDATE',
        'Fix 2: `SELECT … FOR UPDATE`',
        'Fix 3: optimistic version column + retry',
      ],
      followUps: [
        'Show the lost update with stock = 1.',
        'How does optimistic locking detect it?',
        'Which fix would you use for a flash sale?',
      ],
    },
    {
      id: 'what-does-for-update-do',
      question: 'What does `SELECT … FOR UPDATE` do, and what are `NOWAIT` and `SKIP LOCKED` for?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `\`SELECT … FOR UPDATE\` reads rows and takes an **exclusive row lock** on them, held **until the transaction commits or rolls back**. Other transactions can still do plain reads (MVCC), but any that try to **update, delete or \`FOR UPDATE\` the same rows wait**. When they continue, they see the committed result.

That makes it the standard tool for a safe **read-check-write**: lock the account, check the balance, then update it, with no one changing it in between. It only works **inside a transaction**; in autocommit the lock is released immediately.

Two variants matter in practice:

- **\`NOWAIT\`**: don't wait; fail immediately if the row is locked. Good for "someone else is editing this" UX.
- **\`SKIP LOCKED\`**: skip rows other transactions have locked. This is how you build a **job queue in Postgres**: many workers each grab a different pending job without blocking each other.

There's also **\`FOR SHARE\`**, a shared lock that blocks writers but lets other \`FOR SHARE\` readers in, used to make sure a referenced row isn't deleted while you work.`,
      analogy: `Putting your hand on the last item on the shelf while you decide: others can see it, but nobody else can take it until you let go (commit or rollback).`,
      quickRevision: [
        'Exclusive row lock until COMMIT/ROLLBACK',
        'Blocks other writers and `FOR UPDATE`; plain reads still work',
        'Only meaningful inside a transaction',
        '`NOWAIT`: fail fast; `SKIP LOCKED`: job queues',
        '`FOR SHARE`: block writers, allow other sharers',
      ],
      deepDive: `\`\`\`sql
-- Worker picks the next job without blocking other workers
BEGIN;
SELECT id, payload FROM jobs
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;
UPDATE jobs SET status = 'running' WHERE id = :id;
COMMIT;
\`\`\``,
      followUps: [
        'What does SKIP LOCKED do and when is it useful?',
        'FOR UPDATE vs FOR SHARE?',
        'What happens to the lock if the app crashes mid-transaction?',
      ],
    },
    {
      id: 'why-should-transactions-be-short-when-using-locks',
      question: 'Why should transactions that hold locks be kept short? What do you keep out of them?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `Row locks are held **until the transaction ends**, not until the statement finishes. Every extra second inside the transaction is a second other requests for the same rows **wait**. Under load that becomes a queue: lock waits, connection-pool exhaustion, timeouts, and more **deadlocks**, because the window in which two transactions can collide gets longer. Long transactions also hold back **MVCC cleanup** (vacuum in Postgres), which bloats tables.

So I keep **only the database work** inside the transaction and move everything slow outside it:

- **No external API calls** (payment gateways, emails, webhooks) between \`BEGIN\` and \`COMMIT\`.
- **No waiting on the user**: never open a transaction across HTTP requests or a confirmation dialog.
- Do validation, data fetching and heavy computation **before** \`BEGIN\`; send notifications **after** \`COMMIT\` (ideally via an outbox).

As a safety net, set \`lock_timeout\` and \`statement_timeout\` (and \`idle_in_transaction_session_timeout\` in Postgres) so one stuck transaction can't freeze a table.`,
      analogy: `Holding the only bathroom key: the longer you keep it (calling an API, waiting for the user), the longer the queue outside gets.`,
      quickRevision: [
        'Locks held until commit, not per statement',
        'Long transactions → waits, pool exhaustion, deadlocks, bloat',
        'No API calls or user waits inside',
        'Prepare before BEGIN, notify after COMMIT',
        'Set lock/statement/idle-in-transaction timeouts',
      ],
      followUps: [
        'How do you call a payment API safely around a transaction?',
        'What is lock_timeout?',
        'What is the outbox pattern?',
      ],
    },
  ],
});
