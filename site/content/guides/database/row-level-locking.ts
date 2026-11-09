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
      question: 'Why is row-level locking better than table locking in high traffic?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Row-level locking locks only the specific rows being modified, so other transactions can still access other rows. That improves concurrency, scalability, and throughput compared with locking the entire table.`,
      analogy: `Locking one hotel room for cleaning instead of closing the whole hotel: other guests keep using their rooms.`,
      quickRevision: [
        'Locks only the rows being changed',
        'Other rows stay available → concurrency',
        'Table locks block everyone',
        'Needs indexes so few rows are locked',
      ],
      followUps: [
        'When might a database escalate to a bigger lock?',
        'Why do missing indexes make row locking worse?',
      ],
    },
    {
      id: 'what-happens-if-two-users-update-the-same-row-without-locking',
      question: 'What happens if two users update the same row without locking?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> A race condition can occur. Both transactions may read the same value before either writes, causing lost updates or inconsistent state — for example selling the same last item twice.

\`\`\`text
A reads stock = 1
B reads stock = 1
A sets stock = 0
B sets stock = 0
\`\`\``,
      analogy: `Two people editing the same paper form from two photocopies: whoever hands theirs in last silently wipes out the other's changes (lost update).`,
      quickRevision: [
        'Lost update / race condition',
        'Both read the old value, both write',
        'Result: wrong stock or balance',
        'Fix: atomic update, FOR UPDATE, or optimistic version',
      ],
      followUps: [
        'Show the lost update with stock = 1.',
        'How does optimistic locking detect it?',
      ],
    },
    {
      id: 'what-does-for-update-do',
      question: 'What does `FOR UPDATE` do?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> \`FOR UPDATE\` places an exclusive lock on the selected rows for the duration of the transaction. Other transactions that try to lock or update those same rows must wait until the current transaction commits or rolls back.`,
      analogy: `Putting your hand on the last item on the shelf while you decide: others can see it, but nobody else can take it until you let go (commit or rollback).`,
      quickRevision: [
        'Locks the selected rows until commit/rollback',
        'Other writers (and FOR UPDATE readers) wait',
        'Use inside a transaction',
        'NOWAIT / SKIP LOCKED variants',
      ],
      followUps: [
        'What does SKIP LOCKED do and when is it useful?',
        'FOR UPDATE vs FOR SHARE?',
      ],
    },
    {
      id: 'why-should-transactions-be-short-when-using-locks',
      question: 'Why should transactions be short when using locks?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Locks are held for the whole transaction. Long transactions increase lock contention, block other work, reduce concurrency, hurt performance, and raise deadlock risk. Keep critical sections short and commit quickly.`,
      analogy: `Holding the only bathroom key: the longer you keep it (calling an API, waiting for the user), the longer the queue outside gets.`,
      quickRevision: [
        'Locks held until commit',
        'Long transactions → waiting, timeouts, deadlocks',
        'No external API calls or user waits inside',
        'Do slow work before/after the transaction',
      ],
      followUps: [
        'How do you call a payment API safely around a transaction?',
        'What is lock_timeout?',
      ],
    },
  ],
});
