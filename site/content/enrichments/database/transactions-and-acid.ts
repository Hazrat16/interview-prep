import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('database/transactions-and-acid.md', {
  // ---------------------------------------------------------------- Easy
  'what-is-a-transaction': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'A bank transfer slip: money leaves one account and arrives in the other as one action; if anything fails, the whole slip is cancelled.',
    quickRevision: ['Group of operations as one unit', 'All succeed (COMMIT) or none (ROLLBACK)', 'Protects consistency', 'BEGIN … COMMIT / ROLLBACK'],
    followUps: ['What are the ACID properties?', 'What is autocommit?'],
  },
  'why-are-transactions-needed': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'Moving house with a checklist that\'s all-or-nothing: you never want half your furniture at the old flat and half at the new one with the old lease already cancelled.',
    quickRevision: ['Multi-step changes must not half-complete', 'Failures, crashes, concurrent users', 'Examples: transfers, checkout, booking', 'Keeps data consistent'],
    followUps: ['What could go wrong in checkout without a transaction?', 'Do you need a transaction for a single insert?'],
  },
  'what-does-atomicity-mean': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'A light switch: it\'s either fully on or fully off, never half-way.',
    quickRevision: ['All or nothing', 'Failure mid-way → everything rolled back', 'No partial updates visible after failure'],
    followUps: ['How does the DB undo partial work (undo log)?', 'Atomicity vs isolation?'],
  },
  'difference-between-commit-and-rollback': {
    difficulty: 'easy',
    analogy: 'COMMIT is pressing "Send" on an email; ROLLBACK is "Discard draft". Until you choose, nobody else sees it.',
    quickRevision: ['COMMIT: make changes permanent and visible', 'ROLLBACK: undo all changes since BEGIN', 'Savepoints allow partial rollback'],
    followUps: ['What are savepoints?', 'What happens to locks on COMMIT/ROLLBACK?'],
  },
  'give-one-real-life-transaction-example': {
    difficulty: 'easy',
    analogy: 'Buying a ticket: the seat must be marked sold and the payment recorded together, or neither should happen.',
    quickRevision: ['Bank transfer: debit + credit', 'Checkout: order + stock + payment record', 'Invoice: invoice row + line items + proposal status'],
    followUps: ['Which steps of a checkout would you keep outside the transaction?', 'What would go wrong if the steps were separate commits?'],
  },
  // ---------------------------------------------------------------- Medium
  'what-problem-does-isolation-solve': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Two chefs working from the same recipe card: isolation makes sure one chef doesn\'t act on the other\'s half-written changes.',
    quickRevision: ['Concurrent transactions don\'t see each other\'s partial work', 'Prevents dirty reads, non-repeatable reads, phantoms', 'Levels: Read Committed → Repeatable Read → Serializable', 'Higher isolation = more safety, less concurrency'],
    followUps: ['What is a dirty read?', 'Which isolation level is the Postgres default?', 'What is a phantom read?'],
  },
  'what-happens-if-a-transaction-fails-after-partial-update': {
    difficulty: 'medium',
    analogy: 'If the printer jams halfway through a contract, you shred the half-printed copy and start again rather than signing half a contract.',
    quickRevision: ['The DB rolls back all changes in the transaction', 'Nothing partial is committed', 'App gets an error → retry or report', 'Without a transaction: inconsistent data'],
    followUps: ['How should the app handle the error?', 'What if the failure happens after COMMIT?'],
  },
  'why-do-banking-systems-depend-on-acid': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'A bank vault\'s rules: every movement is complete (A), the books always balance (C), tellers don\'t trip over each other (I), and nothing is forgotten after a power cut (D).',
    quickRevision: ['Money must never be lost or created', 'A: transfer all-or-nothing', 'C: balances follow rules', 'I: concurrent transfers stay correct', 'D: committed = survives crashes'],
    followUps: ['How would you design a transfer between two accounts?', 'Why use a ledger instead of updating balances?'],
  },
  'can-a-single-sql-query-need-a-transaction': {
    difficulty: 'medium',
    analogy: 'One instruction can still involve many steps behind the scenes; the database wraps a single statement as a mini all-or-nothing action for you.',
    quickRevision: ['Each statement is already atomic (autocommit)', 'A multi-row UPDATE succeeds or fails as a whole', 'Explicit transactions needed for several statements', 'Read-then-write still needs locking/atomic update'],
    followUps: ['Is `UPDATE stock = stock - 1 WHERE stock > 0` safe alone?', 'What is autocommit mode?'],
  },
  'what-is-data-inconsistency': {
    difficulty: 'medium',
    analogy: 'Two copies of a recipe with different amounts of sugar: which one is right? Nobody knows anymore.',
    quickRevision: ['Data contradicts itself or business rules', 'Causes: partial updates, races, stale copies', 'Prevent: transactions, constraints, single source of truth', 'Detect: reconciliation jobs'],
    followUps: ['How do constraints help?', 'How would you detect inconsistency in production?'],
  },
  // ---------------------------------------------------------------- Scenarios
  'balance-deducted-but-order-not-created-which-acid-property-failed': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Paying at the till but walking out with no shopping: the "pay and receive" pair wasn\'t treated as one action.',
    quickRevision: ['Atomicity failed', 'Debit + order must be one transaction', 'Fix: same transaction or a saga with compensation'],
    followUps: ['What if the balance and orders live in different services?', 'What is a compensating transaction?'],
  },
  'two-users-buy-the-last-item-at-the-same-time-which-property-matters-most': { sameAs: 'faq/db-transactions-isolation-race' },
  'power-failure-after-commit-which-property-guarantees-safety': {
    difficulty: 'easy',
    analogy: 'Once the notary stamps the document, it\'s recorded in the official register, even if the lights go out a second later.',
    quickRevision: ['Durability', 'Committed data is in the write-ahead log on disk', 'Replayed on restart', 'Replication adds safety'],
    followUps: ['What is a write-ahead log?', 'Can durability be weakened for speed (synchronous_commit)?'],
  },
  'why-keep-order-creation-and-stock-reduction-in-the-same-transaction': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Handing over the goods and writing the receipt at the same counter at the same moment, so the stock book and sales book always agree.',
    quickRevision: ['Otherwise: stock reduced without an order, or order without stock', 'Atomic: both or neither', 'Use a conditional decrement inside it', 'Keep it short'],
    followUps: ['Where does the payment call go?', 'What if payment is slow?'],
  },
  // ---------------------------------------------------------------- Bonus practice prompts (no answer in the note)
  'in-checkout-order--inventory--wallet--confirmation-which-steps-belong-in-o': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `**Inside one short DB transaction**: things that must stay consistent **in the same database**:

- reserve or decrement stock with a conditional update (\`stock >= qty\`);
- create the order and order lines (status \`pending_payment\` or \`paid\`);
- debit the wallet if it's an internal wallet in the same DB (conditional on enough balance), plus the ledger entry.

**Outside the transaction**:

- **External payment calls**: slow and unreliable, so never hold locks while waiting. Do them before (with an idempotency key) or after, and update the order status on the result or webhook.
- **Confirmation emails, SMS, analytics**: a side effect enqueued **after commit** (an outbox table plus a worker, so the message isn't lost if the process dies).

Rule of thumb: the transaction covers **state changes that must be atomic**, and anything slow or external happens around it, made reliable with **idempotency and an outbox**.`,
    analogy: 'At the till, scanning items, taking them off the shelf count and writing the receipt happen together; phoning the customer\'s bank and posting the thank-you card happen outside that moment.',
    quickRevision: ['Inside: stock, order, internal wallet + ledger', 'Outside: external payment, emails, analytics', 'No locks held during network calls', 'Outbox pattern for post-commit side effects', 'Idempotency keys for retries'],
    followUps: ['What is the transactional outbox pattern?', 'What if the payment succeeds but the order update fails?'],
  },
  'db-crashes-after-stock-reduce-but-before-order-create--what-happens-and-how-do-': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `**If both steps are in one transaction**, nothing bad happens. The transaction **never committed**, so on restart the database recovers from its **write-ahead log** and the stock reduction is **rolled back**. Stock and orders stay consistent, the client gets an error or timeout, and it can **retry safely with an idempotency key**.

**If they were separate commits**, stock is now reduced with no order. The fix is to put them in **one transaction**. For holds and reservations, add a **TTL / \`held_until\`** and a **sweeper job** that returns expired reservations to stock. A periodic **reconciliation** job (stock vs orders) catches anything left over.`,
    analogy: 'If the power cuts while you\'re filling in a form and you hadn\'t pressed "submit", nothing was filed; you just start again. The danger is only when half the form was submitted separately.',
    quickRevision: ['Same transaction → automatic rollback on recovery (WAL)', 'Client retries with an idempotency key', 'Separate commits → inconsistency', 'Holds with TTL + sweeper; reconciliation job'],
    followUps: ['How does the WAL make recovery possible?', 'How would the client know whether to retry?'],
  },
  'design-a-db-level-approach-to-prevent-overselling-the-last-item': { sameAs: 'faq/db-transactions-isolation-race' },
  'pessimistic-vs-optimistic-locking--when-would-you-use-each': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `- **Pessimistic locking**: **lock first**, then work (\`SELECT … FOR UPDATE\`). Others wait. Use it when **conflicts are likely** and retries are expensive: the last items in a flash sale, seat booking, money transfers. Keep transactions short, and lock in a consistent order to avoid deadlocks.
- **Optimistic locking**: **don't lock**. Read a \`version\` (or \`updated_at\`), and update with \`WHERE id = ? AND version = ?\`. If 0 rows are affected, someone else changed it, so reload and retry or show a conflict. Use it when **conflicts are rare**, reads dominate, or users edit for a long time (forms, documents), where holding locks would be impossible. Mongoose and Prisma support version fields.

A simple **atomic conditional update** (\`stock = stock - 1 WHERE stock > 0\`) is often the best of both for counters.`,
    analogy: 'Pessimistic is booking the meeting room before you walk there; optimistic is walking there and, if someone\'s already in it, coming back later. Book ahead when the room is always busy.',
    quickRevision: ['Pessimistic: FOR UPDATE, others wait (high contention)', 'Optimistic: version check, retry on conflict (low contention)', 'Long user edits → optimistic', 'Counters → atomic conditional update'],
    followUps: ['How would you show an optimistic-lock conflict to a user?', 'How does Mongoose\'s versionKey work?'],
  },
  'flash-sale-10000-users-hit-buy-now-in-one-second--what-is-your-db-strategy': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `The goal is to **protect the database** and **never oversell**:

1. **Don't let 10,000 requests reach the DB at once.** Put a **per-user rate limit** and a **queue or virtual waiting room** in front, and serve static pages from a CDN.
2. **Fast atomic gate in Redis**: \`DECR stock\` (or a Lua script). If the result is below 0, \`INCR\` it back and reply "sold out" immediately. Most of the 10,000 requests end here without touching the DB.
3. **Reservation with a TTL** (for example 60 seconds) for winners. Expired holds return stock (a sweeper job or keyspace events) and the UI is updated live.
4. **The DB stays the source of truth**: on checkout, in **one short transaction**, run an **atomic conditional update** (\`UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0\`) and create the order, with a \`CHECK (stock >= 0)\` as a safety net and an **idempotency key** for the payment.
5. **Reconcile** Redis against the DB, and plan for a Redis restart (reload the counter from the DB).

This is the design I built in my **Sneaker Drop** project.`,
    analogy: 'A concert drop: a fast ticket counter at the door turns most people away instantly, winners get a ticket that expires if unpaid, and the official box-office ledger records the real sales.',
    quickRevision: ['Rate limit + waiting room before the DB', 'Redis atomic DECR as the fast gate', 'TTL holds; expired holds return stock', 'DB conditional update + order in one transaction', 'Reconcile Redis with the DB'],
    followUps: ['What happens if Redis restarts mid-sale?', 'How do you stop bots?', 'Why not just use SELECT … FOR UPDATE for everyone?'],
  },
  'payment-succeeds-but-order-service-fails--how-do-you-recover': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `The money is taken, so the system must **finish the order or refund**, and never lose track of it:

1. **Record intent first**: create the order as \`pending_payment\` **before** charging, with an **idempotency key** shared with the payment provider.
2. **Trust the provider's webhook** (or server-side verification), not the client redirect. When "payment succeeded" arrives, an **idempotent** handler moves the order to \`paid\`. If the order service was down, the webhook is **retried** by the provider, or the event sits in our **queue** until it recovers.
3. **Reconciliation job**: periodically compare successful payments with orders. Any paid payment without a completed order is either **completed automatically** or **refunded** (a compensating action), and flagged for support.
4. **Customer communication**: show "processing" rather than an error, and email when it's resolved.

This is the **saga** idea: each step has a retry or a compensation.`,
    analogy: 'If you\'ve paid at the counter but the kitchen lost your order, the restaurant checks the receipt book against the orders, then either cooks your meal or refunds you; it doesn\'t just forget.',
    quickRevision: ['Create order (pending) before charging', 'Idempotency key with the provider', 'Webhook-driven, idempotent status updates', 'Reconciliation: complete or refund', 'Saga: retries + compensating actions'],
    followUps: ['What is the saga pattern?', 'Why not trust the redirect after payment?', 'How do you avoid double refunds?'],
  },
});
