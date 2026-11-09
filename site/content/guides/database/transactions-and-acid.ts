import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Transactions & ACID',
  description: 'Atomicity to durability, isolation levels and anomalies like dirty and phantom reads.',
  questions: [
    {
      id: 'what-is-a-transaction',
      question: 'What is a transaction?',
      section: 'Easy',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `> A transaction is a sequence of one or more database operations treated as a single unit of work. Either all operations succeed together or all fail together to maintain data consistency. For example, a bank transfer where money is deducted from one account and added to another.`,
      analogy: `A bank transfer slip: money leaves one account and arrives in the other as one action; if anything fails, the whole slip is cancelled.`,
      quickRevision: [
        'Group of operations as one unit',
        'All succeed (COMMIT) or none (ROLLBACK)',
        'Protects consistency',
        'BEGIN … COMMIT / ROLLBACK',
      ],
      followUps: [
        'What are the ACID properties?',
        'What is autocommit?',
      ],
    },
    {
      id: 'why-are-transactions-needed',
      question: 'Why are transactions needed?',
      section: 'Easy',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Transactions ensure data consistency when multiple related operations must happen together. If one operation fails, previous operations are rolled back so the database does not enter an invalid state. In a food ordering system, creating the order, deducting stock, deducting balance, and assigning a rider should all succeed together or fail together.`,
      analogy: `Moving house with a checklist that's all-or-nothing: you never want half your furniture at the old flat and half at the new one with the old lease already cancelled.`,
      quickRevision: [
        'Multi-step changes must not half-complete',
        'Failures, crashes, concurrent users',
        'Examples: transfers, checkout, booking',
        'Keeps data consistent',
      ],
      followUps: [
        'What could go wrong in checkout without a transaction?',
        'Do you need a transaction for a single insert?',
      ],
    },
    {
      id: 'what-does-atomicity-mean',
      question: 'What does Atomicity mean?',
      section: 'Easy',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Atomicity means a transaction is indivisible. Either all operations succeed or none of the changes are kept. If any step fails, the database rolls back previous changes to prevent partial updates.`,
      analogy: 'A light switch: it\'s either fully on or fully off, never half-way.',
      quickRevision: [
        'All or nothing',
        'Failure mid-way → everything rolled back',
        'No partial updates visible after failure',
      ],
      followUps: [
        'How does the DB undo partial work (undo log)?',
        'Atomicity vs isolation?',
      ],
    },
    {
      id: 'difference-between-commit-and-rollback',
      question: 'Difference between COMMIT and ROLLBACK?',
      section: 'Easy',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> COMMIT permanently saves all changes made in the current transaction. After commit, those changes cannot be undone with rollback. ROLLBACK undoes uncommitted changes and restores the database to the consistent state before the transaction started.`,
      analogy: `COMMIT is pressing "Send" on an email; ROLLBACK is "Discard draft". Until you choose, nobody else sees it.`,
      quickRevision: [
        'COMMIT: make changes permanent and visible',
        'ROLLBACK: undo all changes since BEGIN',
        'Savepoints allow partial rollback',
      ],
      followUps: [
        'What are savepoints?',
        'What happens to locks on COMMIT/ROLLBACK?',
      ],
    },
    {
      id: 'give-one-real-life-transaction-example',
      question: 'Give one real-life example of a database transaction.',
      section: 'Easy',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> In an e-commerce checkout, confirming the order, reducing stock, deducting user balance, and initiating delivery should run in one transaction. If any step fails, everything rolls back so you don’t get unpaid orders or wrong inventory.`,
      analogy: `Buying a ticket: the seat must be marked sold and the payment recorded together, or neither should happen.`,
      quickRevision: [
        'Bank transfer: debit + credit',
        'Checkout: order + stock + payment record',
        'Invoice: invoice row + line items + proposal status',
      ],
      followUps: [
        'Which steps of a checkout would you keep outside the transaction?',
        'What would go wrong if the steps were separate commits?',
      ],
    },
    {
      id: 'what-problem-does-isolation-solve',
      question: 'What problem does Isolation solve?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Isolation ensures concurrent transactions do not interfere with each other. It prevents issues like dirty reads, lost updates, and incorrect stock when multiple users operate at the same time. Each transaction behaves as if it is executing alone.

Note: “rules stay valid” is **Consistency**, not Isolation. Isolation is about **concurrency control**.`,
      analogy: `Two chefs working from the same recipe card: isolation makes sure one chef doesn't act on the other's half-written changes.`,
      quickRevision: [
        'Concurrent transactions don\'t see each other\'s partial work',
        'Prevents dirty reads, non-repeatable reads, phantoms',
        'Levels: Read Committed → Repeatable Read → Serializable',
        'Higher isolation = more safety, less concurrency',
      ],
      followUps: [
        'What is a dirty read?',
        'Which isolation level is the Postgres default?',
        'What is a phantom read?',
      ],
    },
    {
      id: 'what-happens-if-a-transaction-fails-after-partial-update',
      question: 'What happens if a transaction fails after partial update?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> The database performs a rollback. All changes made by that transaction are undone, and the database returns to its previous consistent state. For example, if an account is debited and the next step fails, rollback restores the original balance.`,
      analogy: `If the printer jams halfway through a contract, you shred the half-printed copy and start again rather than signing half a contract.`,
      quickRevision: [
        'The DB rolls back all changes in the transaction',
        'Nothing partial is committed',
        'App gets an error → retry or report',
        'Without a transaction: inconsistent data',
      ],
      followUps: [
        'How should the app handle the error?',
        'What if the failure happens after COMMIT?',
      ],
    },
    {
      id: 'why-do-banking-systems-depend-on-acid',
      question: 'Why do banking systems depend on ACID?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Banking systems handle sensitive money operations under high concurrency. ACID prevents incorrect balances, partial updates, duplicate deductions, and data loss. Even a small inconsistency can mean real financial loss, so correctness and durability are critical.`,
      analogy: `A bank vault's rules: every movement is complete (A), the books always balance (C), tellers don't trip over each other (I), and nothing is forgotten after a power cut (D).`,
      quickRevision: [
        'Money must never be lost or created',
        'A: transfer all-or-nothing',
        'C: balances follow rules',
        'I: concurrent transfers stay correct',
        'D: committed = survives crashes',
      ],
      followUps: [
        'How would you design a transfer between two accounts?',
        'Why use a ledger instead of updating balances?',
      ],
    },
    {
      id: 'can-a-single-sql-query-need-a-transaction',
      question: 'Can a single SQL query need a transaction?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> Yes. Most databases treat a single statement as an implicit transaction to guarantee atomicity and consistency. A transaction is about safe unit-of-work semantics, not the number of queries.`,
      analogy: `One instruction can still involve many steps behind the scenes; the database wraps a single statement as a mini all-or-nothing action for you.`,
      quickRevision: [
        'Each statement is already atomic (autocommit)',
        'A multi-row UPDATE succeeds or fails as a whole',
        'Explicit transactions needed for several statements',
        'Read-then-write still needs locking/atomic update',
      ],
      followUps: [
        'Is `UPDATE stock = stock - 1 WHERE stock > 0` safe alone?',
        'What is autocommit mode?',
      ],
    },
    {
      id: 'what-is-data-inconsistency',
      question: 'What is data inconsistency?',
      section: 'Medium',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> Data inconsistency means the database no longer reflects a correct real-world state, or related data no longer agrees across records. It often happens after partial updates, missing rollbacks, or concurrent interference — for example, an order exists but stock was never reduced.`,
      analogy: 'Two copies of a recipe with different amounts of sugar: which one is right? Nobody knows anymore.',
      quickRevision: [
        'Data contradicts itself or business rules',
        'Causes: partial updates, races, stale copies',
        'Prevent: transactions, constraints, single source of truth',
        'Detect: reconciliation jobs',
      ],
      followUps: [
        'How do constraints help?',
        'How would you detect inconsistency in production?',
      ],
    },
    {
      id: 'balance-deducted-but-order-not-created-which-acid-property-failed',
      question: 'Balance deducted but order not created. Which ACID property failed?',
      section: 'Scenario-based',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Atomicity. Related operations should succeed together, but only part completed. The transaction should have rolled back so neither balance deduction nor incomplete order remained.`,
      analogy: `Paying at the till but walking out with no shopping: the "pay and receive" pair wasn't treated as one action.`,
      quickRevision: [
        'Atomicity failed',
        'Debit + order must be one transaction',
        'Fix: same transaction or a saga with compensation',
      ],
      followUps: [
        'What if the balance and orders live in different services?',
        'What is a compensating transaction?',
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
      question: 'Power failure after COMMIT. Which property guarantees safety?',
      section: 'Scenario-based',
      perspective: 'scenario',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> Durability. Once committed, changes are permanently stored and must survive crashes, typically via persistent storage and recovery logs.`,
      analogy: `Once the notary stamps the document, it's recorded in the official register, even if the lights go out a second later.`,
      quickRevision: [
        'Durability',
        'Committed data is in the write-ahead log on disk',
        'Replayed on restart',
        'Replication adds safety',
      ],
      followUps: [
        'What is a write-ahead log?',
        'Can durability be weakened for speed (synchronous_commit)?',
      ],
    },
    {
      id: 'why-keep-order-creation-and-stock-reduction-in-the-same-transaction',
      question: 'Why keep order creation and stock reduction in the same transaction?',
      section: 'Scenario-based',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> To preserve atomicity and consistency between business state and inventory state. If they run separately, you can create an order without reducing stock, or reduce stock without an order. In one transaction, both succeed together or fail together.`,
      analogy: `Handing over the goods and writing the receipt at the same counter at the same moment, so the stock book and sales book always agree.`,
      quickRevision: [
        'Otherwise: stock reduced without an order, or order without stock',
        'Atomic: both or neither',
        'Use a conditional decrement inside it',
        'Keep it short',
      ],
      followUps: [
        'Where does the payment call go?',
        'What if payment is slow?',
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
