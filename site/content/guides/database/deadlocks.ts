import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Deadlocks',
  description: 'How deadlocks happen, how databases detect them and how to prevent them.',
  questions: [
    {
      id: 'why-prevent-deadlocks-if-the-db-already-handles-them',
      question: 'Why prevent deadlocks if the DB already handles them?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `DB recovery is not free:

1. **Wasted work** — rolled-back CPU/DB work must rerun
2. **Performance hit** — retries, extra load, higher latency
3. **Worse UX** — payment/checkout may fail or feel slow
4. **Instability at scale** — frequent deadlocks thrash throughput

Engineering principle: prevention is cheaper than recovery.

> DB can fix deadlocks, but prevention avoids cost and delay.`,
      analogy: `A referee who breaks up a fight by sending one player off: the game continues, but you'd rather the fights didn't happen, because each one costs time, a player, and fans' patience.`,
      quickRevision: [
        'DB kills a victim, its work is wasted',
        'Retries add load and latency',
        'Users see failures (checkout, payment)',
        'Frequent deadlocks hurt throughput at scale',
      ],
      followUps: [
        'How do you retry safely after a deadlock?',
        'How do you monitor deadlock frequency?',
      ],
    },
    {
      id: 'explain-deadlock-in-your-own-words',
      question: 'What is a deadlock? Explain it in your own words with an example.',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `A deadlock is when two (or more) transactions are **each waiting for a lock the other one holds**, so none of them can ever continue.

The classic example is two transfers running at the same time:

- Transaction 1 transfers A → B: it locks **row A**, then asks for **row B**.
- Transaction 2 transfers B → A: it locks **row B**, then asks for **row A**.

Now 1 waits for 2 and 2 waits for 1. That's a **cycle**, and it won't resolve on its own, because locks are only released at commit or rollback.

Four conditions have to hold for this (the Coffman conditions): **mutual exclusion** (locks are exclusive), **hold and wait** (you keep your locks while asking for more), **no preemption** (nobody can take a lock away) and **circular wait**. Breaking any one prevents deadlocks. In practice we break **circular wait** by always locking rows in the same order.

Databases detect the cycle and **abort one transaction** (the "victim") with a deadlock error, so the application must be ready to **retry**.`,
      analogy: `Two cars meeting on a narrow one-lane bridge from opposite ends: each waits for the other to reverse, so neither ever moves.`,
      quickRevision: [
        'Each transaction waits for a lock the other holds',
        'Example: transfers A→B and B→A at the same time',
        'Coffman: mutual exclusion, hold and wait, no preemption, circular wait',
        'Break circular wait: consistent lock order',
        'DB kills a victim → app retries',
      ],
      followUps: [
        'What are the four Coffman conditions?',
        'Deadlock vs lock wait timeout?',
        'How would you prevent it in the transfer example?',
      ],
    },
    {
      id: 'why-can-opposite-update-order-cause-deadlock',
      question: `Why does updating rows in opposite order cause deadlocks, and how does a consistent lock order prevent them?`,
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `Locks are acquired **one statement at a time** and held **until the transaction ends**. If transaction 1 updates row 1 then row 2, while transaction 2 updates row 2 then row 1, there's a moment where each holds its first row and requests the other's. Both wait forever: a **circular wait**.

If **every** transaction locks rows in the **same global order** (for example, ascending primary key), a cycle is impossible: whoever gets row 1 first also gets to row 2 first, and the other transaction simply **waits** for it to commit rather than deadlocking.

How I apply it:

- In a transfer, lock \`min(fromId, toId)\` first, regardless of direction, or lock both at once with \`SELECT … WHERE id IN (…) ORDER BY id FOR UPDATE\`.
- In batch updates, **sort the ids** before updating.
- Keep the same **table order** across code paths too (always \`orders\` then \`order_items\`, never the reverse).

Plain \`SELECT\`s don't take locks under MVCC, but \`SELECT … FOR UPDATE\` and foreign-key checks do, so they can be part of a deadlock as well.`,
      analogy: `Two people each pick up one chopstick and wait for the other's: if everyone always picked up the left chopstick first, the standoff couldn't happen.`,
      quickRevision: [
        'T1: A then B; T2: B then A → circular wait',
        'Locks held until commit, so neither can proceed',
        'Same global order (ascending id) makes cycles impossible',
        'Transfers: lock the lower id first; batches: sort ids',
        'Same table order across code paths',
      ],
      deepDive: `\`\`\`sql
-- Deadlock-safe transfer: lock both rows in id order in one statement
BEGIN;
SELECT id FROM accounts WHERE id IN (:from, :to) ORDER BY id FOR UPDATE;
UPDATE accounts SET balance = balance - :amount WHERE id = :from;
UPDATE accounts SET balance = balance + :amount WHERE id = :to;
COMMIT;
\`\`\``,
      followUps: [
        'How would you enforce lock order in a transfer between two accounts?',
        'Can SELECT queries deadlock?',
        'Can foreign keys cause deadlocks?',
      ],
    },
    {
      id: 'how-does-a-database-detect-deadlock',
      question: 'How does a database detect a deadlock?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `It builds a **wait-for graph**: each transaction is a node, and there's an edge from T1 to T2 when T1 is waiting for a lock T2 holds. A deadlock is simply a **cycle** in that graph.

When it's checked differs by engine:

- **Postgres** doesn't check on every wait. A transaction that has waited longer than **\`deadlock_timeout\`** (1 second by default) triggers a check. If it finds a cycle, it aborts one transaction with \`ERROR: deadlock detected\` (SQLSTATE \`40P01\`).
- **MySQL InnoDB** runs detection **immediately** when a lock wait starts, and rolls back the transaction that's cheapest to undo, with error **1213**. On very high-concurrency systems detection can be turned off in favour of \`innodb_lock_wait_timeout\`.

Detection is better than relying only on **lock timeouts**, because a timeout can't tell a deadlock from a slow transaction: you'd either wait too long or abort legitimate work. The error message usually includes both queries, which is what I check in the logs to find the conflicting code paths.`,
      analogy: `A traffic controller drawing arrows from each waiting car to the car blocking it: if the arrows form a circle, there's a gridlock to break.`,
      quickRevision: [
        'Wait-for graph: T1 → T2 if T1 waits on T2\'s lock',
        'Cycle in the graph = deadlock',
        'Postgres: checks after `deadlock_timeout` (1 s), SQLSTATE 40P01',
        'InnoDB: checks immediately, error 1213',
        'Logs show both queries: use them to find the code paths',
      ],
      followUps: [
        'What does Postgres return to the application?',
        'Why not just use lock timeouts?',
        'How would you find which code paths deadlock?',
      ],
    },
    {
      id: 'how-does-the-db-choose-which-transaction-to-kill',
      question: `When a deadlock happens, how does the database choose which transaction to abort, and what should the app do?`,
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `The aborted transaction is called the **victim**. The database rolls it back (releasing its locks) so the others can continue. Engines pick the victim to **minimise wasted work**:

- **InnoDB** rolls back the transaction that has modified the **fewest rows** (smallest undo log).
- **Postgres** aborts the transaction **that ran the detection**, the one that waited past \`deadlock_timeout\`, which is usually fine since it was blocked anyway.
- SQL Server lets you hint priority with \`DEADLOCK_PRIORITY\`.

You can't control the choice reliably from application code, so the important part is **handling it**:

1. Treat the deadlock error (\`40P01\` / \`1213\`) as **transient** and **retry the whole transaction**, not just the failed statement, because everything before it was rolled back.
2. Retry a **small number of times with jittered backoff**, so both transactions don't collide again immediately.
3. Make the operation **idempotent** so a retry can't double-apply side effects.
4. **Log and alert** on deadlock rates, because frequent deadlocks mean a lock-ordering bug to fix, not just to retry.`,
      analogy: `Breaking up a queue standoff by asking whoever has done the least work so far to step back: the cheapest one to redo.`,
      quickRevision: [
        'Victim = transaction rolled back to break the cycle',
        'InnoDB: fewest rows changed; Postgres: the one that detected it',
        'App: retry the whole transaction',
        'Few retries, jittered backoff, idempotent operations',
        'Frequent deadlocks = fix the lock order',
      ],
      deepDive: `\`\`\`js
async function withRetry(fn, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await db.transaction(fn);
    } catch (err) {
      const transient = err.code === '40P01' || err.code === '40001'; // deadlock / serialization
      if (!transient || i === attempts) throw err;
      await new Promise((r) => setTimeout(r, 50 * 2 ** i + Math.random() * 50));
    }
  }
}
\`\`\``,
      followUps: [
        'Which error code signals a deadlock in Postgres/MySQL?',
        'How would you write retry logic?',
        'Why retry the whole transaction rather than the last statement?',
      ],
    },
    {
      id: 'name-three-practical-ways-to-prevent-deadlocks-in-production',
      question: 'What are practical ways to prevent deadlocks in production?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `You can't eliminate them completely in a busy system, but you can make them rare and harmless:

1. **Lock in a consistent order.** Always lock rows by ascending id and tables in the same order across all code paths. This removes the circular wait, which is the most common cause.
2. **Keep transactions short.** No API calls, no user input, no heavy computation inside; the shorter the window, the less chance of overlap.
3. **Lock fewer rows.** Make sure the \`WHERE\` clauses of hot \`UPDATE\`s and \`DELETE\`s use **indexes**, otherwise InnoDB locks every row it scans (plus gaps).
4. **Lock up front.** If you'll need several rows, take them in one \`SELECT … ORDER BY id FOR UPDATE\` at the start, instead of acquiring them gradually.
5. **Use atomic statements** where possible (\`UPDATE … SET stock = stock - 1 WHERE stock > 0\`) instead of read-then-write across statements.
6. **Retry** deadlock errors with backoff, since the database will still occasionally pick a victim, and **monitor** the deadlock rate so a new bad code path gets noticed.`,
      analogy: `Traffic rules that avoid gridlock: everyone drives the same direction round the roundabout (lock order), nobody parks in the junction (short transactions), and if you do get stuck you back out and try again (retry).`,
      quickRevision: [
        'Consistent lock order (ascending id, same table order)',
        'Short transactions, nothing external inside',
        'Indexes on hot UPDATE/DELETE conditions',
        'Take all needed locks up front in id order',
        'Atomic statements; retry with backoff; monitor',
      ],
      followUps: [
        'Why do missing indexes cause more locking?',
        'How do you lock "smaller id first" in a transfer?',
        'How would you monitor deadlocks?',
      ],
    },
  ],
});
