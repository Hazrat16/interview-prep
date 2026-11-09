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
      question: 'Explain deadlock in your own words.',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `> A deadlock occurs when two or more transactions each hold locks and wait for a lock held by another transaction in a cycle, so all of them wait indefinitely. The database typically resolves this by rolling back one transaction.`,
      analogy: `Two cars meeting on a narrow one-lane bridge from opposite ends: each waits for the other to reverse, so neither ever moves.`,
      quickRevision: [
        'Two+ transactions wait on each other\'s locks',
        'Circular wait → no progress',
        'Coffman: mutual exclusion, hold and wait, no preemption, circular wait',
        'DB detects and kills a victim',
      ],
      followUps: [
        'What are the four Coffman conditions?',
        'Deadlock vs lock wait timeout?',
      ],
    },
    {
      id: 'why-can-opposite-update-order-cause-deadlock',
      question: 'Why can opposite update order cause deadlock?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Transaction A locks row 1 and then needs row 2, while Transaction B locks row 2 and then needs row 1. Each holds a lock the other needs, forming a circular wait. Because locks are held until the transaction ends, neither can proceed.`,
      analogy: `Two people each pick up one chopstick and wait for the other's: if everyone always picked up the left chopstick first, the standoff couldn't happen.`,
      quickRevision: [
        'T1 locks A then wants B',
        'T2 locks B then wants A',
        'Each holds what the other needs → cycle',
        'Fix: always lock in the same order',
      ],
      followUps: [
        'How would you enforce lock order in a transfer between two accounts?',
        'Can SELECT queries deadlock?',
      ],
    },
    {
      id: 'how-does-a-database-detect-deadlock',
      question: 'How does a database detect deadlock?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> Databases maintain a wait-for graph where nodes are transactions and edges represent waiting dependencies. If a cycle is detected, a deadlock exists, and the database rolls back one transaction to break the cycle.`,
      analogy: `A traffic controller drawing arrows from each waiting car to the car blocking it: if the arrows form a circle, there's a gridlock to break.`,
      quickRevision: [
        'Wait-for graph of transactions',
        'Cycle in the graph = deadlock',
        'Checked periodically or on lock wait',
        'Postgres: deadlock_timeout before checking',
      ],
      followUps: [
        'What does Postgres return to the application?',
        'Why not just use lock timeouts?',
      ],
    },
    {
      id: 'how-does-the-db-choose-which-transaction-to-kill',
      question: 'How does the DB choose which transaction to kill?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> It uses a victim selection strategy based on cost factors such as work already done, number of locks held, transaction age, and rollback cost. The goal is to minimize recovery cost, not simply kill the longest transaction.`,
      analogy: `Breaking up a queue standoff by asking whoever has done the least work so far to step back: the cheapest one to redo.`,
      quickRevision: [
        'Victim is rolled back, others continue',
        'Usually the cheapest to roll back (least work)',
        'Engine-specific rules (InnoDB: fewest rows changed)',
        'App must catch the error and retry',
      ],
      followUps: [
        'Which error code signals a deadlock in Postgres/MySQL?',
        'How would you write retry logic?',
      ],
    },
    {
      id: 'name-three-practical-ways-to-prevent-deadlocks-in-production',
      question: 'Name three practical ways to prevent deadlocks in production.',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Keep transactions short to reduce lock duration, acquire locks in a consistent order to eliminate circular waits, and implement application-level retry when a deadlock rollback occurs. Proper indexing and suitable isolation levels also reduce contention.`,
      analogy: `Traffic rules that avoid gridlock: everyone drives the same direction round the roundabout (lock order), nobody parks in the junction (short transactions), and if you do get stuck you back out and try again (retry).`,
      quickRevision: [
        'Lock rows in a consistent order',
        'Keep transactions short; no external calls inside',
        'Retry on deadlock with backoff',
        'Good indexes (lock fewer rows)',
        'Right isolation level',
      ],
      followUps: [
        'Why do missing indexes cause more locking?',
        'How do you lock "smaller id first" in a transfer?',
      ],
    },
  ],
});
