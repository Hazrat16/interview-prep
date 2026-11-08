import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('database/row-level-locking.md', {
  'why-is-row-level-locking-better-than-table-locking-in-high-traffic': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Locking one hotel room for cleaning instead of closing the whole hotel: other guests keep using their rooms.',
    quickRevision: ['Locks only the rows being changed', 'Other rows stay available → concurrency', 'Table locks block everyone', 'Needs indexes so few rows are locked'],
    followUps: ['When might a database escalate to a bigger lock?', 'Why do missing indexes make row locking worse?'],
  },
  'what-happens-if-two-users-update-the-same-row-without-locking': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Two people editing the same paper form from two photocopies: whoever hands theirs in last silently wipes out the other\'s changes (lost update).',
    quickRevision: ['Lost update / race condition', 'Both read the old value, both write', 'Result: wrong stock or balance', 'Fix: atomic update, FOR UPDATE, or optimistic version'],
    followUps: ['Show the lost update with stock = 1.', 'How does optimistic locking detect it?'],
  },
  'what-does-for-update-do': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Putting your hand on the last item on the shelf while you decide: others can see it, but nobody else can take it until you let go (commit or rollback).',
    quickRevision: ['Locks the selected rows until commit/rollback', 'Other writers (and FOR UPDATE readers) wait', 'Use inside a transaction', 'NOWAIT / SKIP LOCKED variants'],
    followUps: ['What does SKIP LOCKED do and when is it useful?', 'FOR UPDATE vs FOR SHARE?'],
  },
  'what-is-a-deadlock-locking-context': { sameAs: 'database/deadlocks/explain-deadlock-in-your-own-words' },
  'why-should-transactions-be-short-when-using-locks': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Holding the only bathroom key: the longer you keep it (calling an API, waiting for the user), the longer the queue outside gets.',
    quickRevision: ['Locks held until commit', 'Long transactions → waiting, timeouts, deadlocks', 'No external API calls or user waits inside', 'Do slow work before/after the transaction'],
    followUps: ['How do you call a payment API safely around a transaction?', 'What is lock_timeout?'],
  },
  'how-do-databases-handle-deadlocks': { sameAs: 'database/deadlocks/how-does-a-database-detect-deadlock' },
});
