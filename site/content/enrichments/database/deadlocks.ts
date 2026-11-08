import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('database/deadlocks.md', {
  'why-prevent-deadlocks-if-the-db-already-handles-them': {
    difficulty: 'medium',
    frequency: 'medium',
    analogy: 'A referee who breaks up a fight by sending one player off: the game continues, but you\'d rather the fights didn\'t happen, because each one costs time, a player, and fans\' patience.',
    quickRevision: ['DB kills a victim, its work is wasted', 'Retries add load and latency', 'Users see failures (checkout, payment)', 'Frequent deadlocks hurt throughput at scale'],
    followUps: ['How do you retry safely after a deadlock?', 'How do you monitor deadlock frequency?'],
  },
  'explain-deadlock-in-your-own-words': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'Two cars meeting on a narrow one-lane bridge from opposite ends: each waits for the other to reverse, so neither ever moves.',
    quickRevision: ['Two+ transactions wait on each other\'s locks', 'Circular wait → no progress', 'Coffman: mutual exclusion, hold and wait, no preemption, circular wait', 'DB detects and kills a victim'],
    followUps: ['What are the four Coffman conditions?', 'Deadlock vs lock wait timeout?'],
  },
  'why-can-opposite-update-order-cause-deadlock': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Two people each pick up one chopstick and wait for the other\'s: if everyone always picked up the left chopstick first, the standoff couldn\'t happen.',
    quickRevision: ['T1 locks A then wants B', 'T2 locks B then wants A', 'Each holds what the other needs → cycle', 'Fix: always lock in the same order'],
    followUps: ['How would you enforce lock order in a transfer between two accounts?', 'Can SELECT queries deadlock?'],
  },
  'how-does-a-database-detect-deadlock': {
    difficulty: 'medium',
    analogy: 'A traffic controller drawing arrows from each waiting car to the car blocking it: if the arrows form a circle, there\'s a gridlock to break.',
    quickRevision: ['Wait-for graph of transactions', 'Cycle in the graph = deadlock', 'Checked periodically or on lock wait', 'Postgres: deadlock_timeout before checking'],
    followUps: ['What does Postgres return to the application?', 'Why not just use lock timeouts?'],
  },
  'how-does-the-db-choose-which-transaction-to-kill': {
    difficulty: 'medium',
    analogy: 'Breaking up a queue standoff by asking whoever has done the least work so far to step back: the cheapest one to redo.',
    quickRevision: ['Victim is rolled back, others continue', 'Usually the cheapest to roll back (least work)', 'Engine-specific rules (InnoDB: fewest rows changed)', 'App must catch the error and retry'],
    followUps: ['Which error code signals a deadlock in Postgres/MySQL?', 'How would you write retry logic?'],
  },
  'name-three-practical-ways-to-prevent-deadlocks-in-production': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Traffic rules that avoid gridlock: everyone drives the same direction round the roundabout (lock order), nobody parks in the junction (short transactions), and if you do get stuck you back out and try again (retry).',
    quickRevision: ['Lock rows in a consistent order', 'Keep transactions short; no external calls inside', 'Retry on deadlock with backoff', 'Good indexes (lock fewer rows)', 'Right isolation level'],
    followUps: ['Why do missing indexes cause more locking?', 'How do you lock "smaller id first" in a transfer?'],
  },
  'why-does-consistent-locking-order-prevent-deadlocks': {
    sameAs: 'database/deadlocks/why-can-opposite-update-order-cause-deadlock',
  },
  'if-the-db-auto-handles-deadlocks-why-still-prevent-them': {
    sameAs: 'database/deadlocks/why-prevent-deadlocks-if-the-db-already-handles-them',
  },
});
