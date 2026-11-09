import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'System Design Fundamentals',
  description: 'The interview framework, scaling, caching, databases, queues and CAP.',
  questions: [
    {
      id: 'system-scale-node-app',
      question: 'Your Node.js app needs to go from 1,000 to 100,000 users. How would you scale it?',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['system-design', 'nodejs', 'caching', 'redis', 'docker', 'aws'],
      answer: `I'd **measure first** to find which resource saturates, then scale in steps rather than redesigning everything.

1. **Make the app stateless**: no sessions or uploads on local disk. Sessions or tokens go to Redis/JWT and files to S3. Then I can run **N instances** behind a **load balancer** (containers on ECS/Kubernetes, or PM2 cluster on a VM) and autoscale on CPU or latency.
2. **The database is usually the first real bottleneck**:
   - indexes and query fixes;
   - a connection pool (pgBouncer for Postgres);
   - **read replicas** for read-heavy traffic;
   - partitioning or sharding only much later.
3. **Caching**: a CDN for static assets and public pages; **Redis** for hot, expensive reads, with clear invalidation.
4. **Async work**: move emails, PDFs, image processing and webhooks to a **queue** (BullMQ, SQS) with workers that scale separately.
5. **Protect the system**: rate limiting, timeouts, retries with backoff, circuit breakers for third parties.
6. **Real-time**: the Socket.IO Redis adapter across instances.
7. **Observability**: metrics, logs and traces with alerts, plus load testing (k6) before launch to confirm the bottleneck moved.

The key message in an interview: **stateless app tier, scale out, protect the DB, cache, make slow work asynchronous, and measure**.`,
      analogy: `Growing a café into a chain. First make sure any barista can serve any customer (stateless). Then open more counters (instances) with a host directing the queue (load balancer). Pre-make popular items (cache), send catering orders to a back kitchen (queue), and remember the bottleneck is usually the single shared fridge (the database).`,
      quickRevision: [
        'Measure → find the saturated resource',
        'Stateless instances + load balancer + autoscaling',
        'DB: indexes, pooling, read replicas, then partitioning',
        'CDN + Redis cache; queues for slow work',
        'Rate limits, timeouts, circuit breakers; observability + load tests',
      ],
      followUps: [
        'What breaks when you go from 1 instance to 2?',
        'How do you handle cache invalidation at scale?',
        'Vertical vs horizontal scaling?',
      ],
    },
    {
      id: 'sd-interview-framework',
      question: 'How do you approach a system design interview?',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['system-design'],
      answer: `I follow the same structure every time, and I **say each step out loud**, because they're grading the thinking as much as the result:

1. **Clarify requirements (≈5 min)**: functional ("users can shorten a URL and get redirected") and **non-functional** (scale, latency, availability, consistency, cost). Ask who the users are and what matters most.
2. **Estimate (≈3 min)**: users, requests per second, read/write ratio, storage per year. This tells me whether one Postgres is enough or I need sharding and caching.
3. **API and data model**: the main endpoints and the core tables or collections.
4. **High-level design**: draw the boxes, client → load balancer → stateless services → cache → database, plus queues, object storage and CDN where needed. Walk one request end to end.
5. **Deep dive** into 1–2 hard parts the interviewer cares about: ID generation, consistency, hot keys, fan-out, failure handling.
6. **Bottlenecks and trade-offs**: what breaks first at 10× load, single points of failure, monitoring, and what I'd do differently with more time.

For a mid-level role they want **structured thinking and honest trade-offs**, not a perfect Google-scale architecture.`,
      analogy: `Like an architect designing a house: first ask how many people will live there and what they need (requirements), check the budget and plot size (estimates), sketch the floor plan (high-level design), then detail the tricky parts like plumbing and stairs (deep dive).`,
      quickRevision: [
        'Requirements: functional + non-functional (scale, latency, consistency)',
        'Estimate: RPS, read/write ratio, storage',
        'API + data model',
        'High-level boxes; walk one request through',
        'Deep dive 1–2 hard parts; then bottlenecks + trade-offs',
      ],
      avoid: [
        'Jumping straight into drawing boxes without requirements',
        'Naming technologies without saying why',
        'Designing for Google scale when the requirements say 10k users',
      ],
      followUps: [
        'What questions would you ask before designing anything?',
        'How do you decide what to deep-dive into?',
        'What would you monitor in this system?',
      ],
    },
    {
      id: 'sd-scaling-load-balancing',
      question: 'Vertical vs horizontal scaling — and how does load balancing work?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['system-design', 'aws', 'linux-networking'],
      answer: `- **Vertical scaling** (scale up) means a **bigger machine**: more CPU, RAM, faster disk. It's simple and needs no code changes, but it has a **ceiling**, gets expensive, and the machine is still a **single point of failure**.
- **Horizontal scaling** (scale out) means **more machines** behind a **load balancer**. It's practically unlimited and fault tolerant, but the app must be **stateless**: sessions in Redis or JWT, files in S3, and real-time via a pub/sub adapter.

A **load balancer** spreads requests across healthy instances:

- **Algorithms**: round robin, **least connections**, or IP/consistent hash when you need stickiness.
- **Health checks** remove dead instances automatically.
- **Layer 7** (ALB, Nginx) can route by path or host and terminate TLS. **Layer 4** (NLB) is faster and protocol-agnostic.
- The load balancer itself is made highly available (managed, or redundant across AZs).

In practice I scale the **stateless app tier horizontally**. Databases are often scaled vertically first, then with read replicas and sharding.`,
      analogy: `Vertical scaling is hiring one super-fast chef; horizontal scaling is hiring more chefs and a head waiter (load balancer) who sends each order to whichever chef is free, and stops sending orders to a chef who's gone home sick (health checks).`,
      quickRevision: [
        'Vertical: bigger box, simple, ceiling + SPOF',
        'Horizontal: more boxes, needs stateless app',
        'LB algorithms: round robin, least connections, hashing',
        'Health checks; L7 (path/host/TLS) vs L4',
        'Scale app horizontally; DB: vertical → replicas → shards',
      ],
      followUps: [
        'What makes an app stateless?',
        'When do you need sticky sessions?',
        'How do you avoid the load balancer being a single point of failure?',
      ],
    },
    {
      id: 'sd-caching-layers',
      question: 'Where can you add caching in a system, and what are the trade-offs?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design', 'caching', 'redis', 'performance'],
      answer: `Caching can happen at **every layer**, and the closer to the user, the faster and cheaper:

1. **Browser**: \`Cache-Control\`, ETags, service workers. Hashed static assets can be cached "forever".
2. **CDN** (CloudFront, Cloudflare): static files, images and even public API responses at edge locations near users.
3. **Reverse proxy** (Nginx): microcaching of hot pages.
4. **Application cache** (Redis, Memcached): computed results, sessions and hot DB rows, usually with **cache-aside**.
5. **In-process memory**: tiny, ultra-hot data (config, feature flags). Not shared between instances.
6. **Database**: its own buffer cache, plus **materialised views** for expensive aggregates.

The trade-offs are always the same:

- **staleness vs speed**: TTLs and invalidation;
- **consistency** between instances;
- **memory cost**;
- **cache stampedes** when hot keys expire;
- added complexity, and harder debugging ("is it the cache?").

I cache data that's **read-heavy, expensive and tolerant of slight staleness**, and keep must-be-exact data (balances, stock) coming from the source of truth.`,
      analogy: `Keeping things closer the more often you need them: your keys in your pocket (browser), snacks in the kitchen (CDN), groceries in the pantry (Redis), and the supermarket (database) only when you run out.`,
      quickRevision: [
        'Layers: browser → CDN → proxy → Redis → in-process → DB',
        'Closer to the user = faster, but harder to invalidate',
        'Cache-aside + TTL + invalidation on write',
        'Risks: staleness, stampedes, memory, debugging',
        'Never cache must-be-exact data blindly',
      ],
      followUps: [
        'How would you invalidate a CDN cache after a deploy?',
        'What is a cache stampede and how do you prevent it?',
        'Write-through vs write-back vs cache-aside?',
      ],
    },
    {
      id: 'sd-database-scaling',
      question: 'How do you scale a database? Explain replication, partitioning and sharding.',
      perspective: 'concept',
      difficulty: 'hard',
      frequency: 'very-high',
      tags: ['system-design', 'sql', 'mongodb'],
      answer: `I scale a database **in steps**, from cheapest to most complex:

1. **Optimise first**: indexes, query fixes, connection pooling (pgBouncer), and **caching** hot reads. This often buys 10×.
2. **Vertical scaling**: a bigger instance.
3. **Read replicas (replication)**: the primary handles writes, and **replicas** copy its changes and serve **reads**. Great for read-heavy apps. The catch is **replication lag**, so a user might not see their own write immediately. Read-your-own-writes from the primary.
4. **Partitioning**: split a big table **inside one database**, e.g. by month for logs or orders, so queries and maintenance touch smaller pieces.
5. **Sharding**: split data across **multiple databases** by a **shard key** (\`user_id\`, \`tenant_id\`). Each shard holds a subset, so **writes scale too**. The costs:
   - choosing a good key, to avoid **hot shards**;
   - **cross-shard queries and transactions** become hard;
   - rebalancing is painful (consistent hashing helps).

I'd only shard when a single primary truly can't handle the **write** load or the data size. Many products never need to.`,
      analogy: `A busy library: first organise the shelves (indexes), then build a bigger library (vertical), then open reading-room copies of popular books (replicas), and only as a last resort split the collection across several buildings by surname (sharding), which makes "find all books about X" much harder.`,
      quickRevision: [
        'Optimise + cache before scaling',
        'Replicas scale reads; watch replication lag',
        'Partitioning: split a table within one DB',
        'Sharding: split across DBs by shard key; scales writes',
        'Sharding costs: hot shards, cross-shard queries, rebalancing',
      ],
      followUps: [
        'How do you choose a shard key?',
        'How do you handle "read your own writes" with replicas?',
        'What is the difference between partitioning and sharding?',
      ],
    },
    {
      id: 'sd-cap-consistency',
      question: 'Explain the CAP theorem and consistency models (strong vs eventual).',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design'],
      answer: `**CAP** says that in a distributed system, during a **network partition** (P, which you can't avoid), you must choose between:

- **Consistency (C)**: every read sees the latest write, or gets an error;
- **Availability (A)**: every request gets a response, even if it might be stale.

So the real choice is **CP vs AP when something breaks**:

- **CP**: refuse or delay requests rather than return stale data. Use it for **money, inventory, bookings**.
- **AP**: keep answering, even if some replicas are behind, and reconcile later. Use it for **likes, feeds, view counts, presence**.

**Consistency models** in practice:

- **Strong consistency**: reads always reflect the latest committed write (a single Postgres primary).
- **Eventual consistency**: replicas converge "soon" (DNS, caches, read replicas, many NoSQL stores).
- In between: **read-your-own-writes**, **causal** and monotonic reads.

A good answer applies it per feature: "the payment ledger is strongly consistent, the activity feed is eventually consistent."`,
      analogy: `Two bank branches lose their phone line between them. Either they stop serving withdrawals until the line is back (consistency), or they keep serving and risk an overdraft that's fixed later (availability). Which one is right depends on whether it's cash or loyalty points.`,
      quickRevision: [
        'Partition happens → choose C or A',
        'CP: correct or error (money, stock)',
        'AP: always answers, maybe stale (feeds, likes)',
        'Strong vs eventual; read-your-own-writes in between',
        'Choose per feature, not per system',
      ],
      followUps: [
        'Is MongoDB CP or AP?',
        'What is PACELC?',
        'How would you show eventual consistency to users without confusing them?',
      ],
    },
    {
      id: 'sd-message-queues',
      question: 'When would you use a message queue? Kafka vs RabbitMQ vs SQS.',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design', 'nodejs', 'aws'],
      answer: `A queue **decouples** the producer from the consumer. Use one when work is:

- **slow** (emails, PDFs, video processing): respond fast, process later;
- **spiky**: the queue absorbs bursts and workers drain at a steady rate;
- **unreliable**: retries with backoff, and dead-letter queues;
- **fan-out**: one event, many consumers (billing, email, analytics).

Choosing:

- **SQS** (or BullMQ on Redis): a simple **job queue**. Each message is processed by one worker, it's managed and cheap, with at-least-once delivery. This is my default for background jobs.
- **RabbitMQ**: a flexible **message broker**, with routing (exchanges, topics), priorities, and per-message acknowledgement. Good for complex routing between services.
- **Kafka**: a **distributed, durable log**. Messages are **kept** (replayable), consumers track their own offsets, ordering is guaranteed **per partition**, and throughput is huge. Use it for **event streaming**, analytics pipelines and event sourcing, where many consumers read the same stream.

Whatever the tool: delivery is usually **at-least-once**, so consumers must be **idempotent**.`,
      analogy: `SQS is a ticket queue at a deli (each ticket served once); RabbitMQ is a post room that sorts letters into the right departments' trays; Kafka is a newspaper archive where every department can read every edition at its own pace, even last week's.`,
      quickRevision: [
        'Use for slow, spiky, unreliable or fan-out work',
        'SQS/BullMQ: simple job queues',
        'RabbitMQ: routing, priorities, acks',
        'Kafka: durable replayable log, per-partition order, high throughput',
        'At-least-once → idempotent consumers',
      ],
      followUps: [
        'How do you guarantee ordering?',
        'What is a dead-letter queue?',
        'What is the transactional outbox pattern?',
      ],
    },
    {
      id: 'sd-consistent-hashing',
      question: 'What is consistent hashing and why is it used?',
      perspective: 'concept',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['system-design'],
      answer: `With simple hashing, \`server = hash(key) % N\`, adding or removing **one** server changes N, so **almost every key moves** to a different server. For a cache that means a sudden storm of misses; for a database, a huge data migration.

**Consistent hashing** puts servers and keys on a **ring** (hash space 0…2³²). A key belongs to the **next server clockwise**. When a server is added or removed, **only the keys between it and its neighbour move**, about 1/N of the data.

To avoid uneven load, each server gets many **virtual nodes** spread around the ring, which smooths the distribution and lets bigger machines take more vnodes.

It's used in **distributed caches** (Memcached clients), **DynamoDB/Cassandra** partitioning, **load balancers** for sticky routing, and CDNs.`,
      analogy: `Seats around a round table: each guest (key) sits next to the nearest waiter (server) clockwise. If one waiter leaves, only the guests in their section move to the next waiter; everyone else stays put.`,
      quickRevision: [
        'hash % N → adding a server reshuffles almost everything',
        'Ring: key goes to next server clockwise',
        'Add/remove server → only ~1/N keys move',
        'Virtual nodes for even distribution',
        'Used in caches, Dynamo/Cassandra, sticky LB',
      ],
      followUps: [
        'Why do you need virtual nodes?',
        'How would you handle a hot key on one node?',
        'How does replication work on the ring?',
      ],
    },
    {
      id: 'sd-estimation',
      question: 'How do you do back-of-the-envelope estimation in a design interview?',
      perspective: 'practical',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design'],
      answer: `The goal is the **order of magnitude**, to justify design decisions, not precise maths. I round aggressively and say the assumptions out loud.

**Useful numbers**: 1 day ≈ **100k seconds** (86,400); 1 million requests/day ≈ **12 RPS**; peak ≈ **2–3× average**.

**Example** (a URL shortener):

- 100M new URLs per month → about **40 writes/s** on average, ~100/s at peak.
- Read:write is 100:1 → about **4,000 reads/s**, ~10k at peak, so I need a **cache**.
- Each record is about 500 bytes → 100M × 500B = **50GB/month**, ~3TB over 5 years. That fits in a sharded or large single DB, but it grows.
- Bandwidth: 4k reads/s × ~500B ≈ 2MB/s. Small.

Then I connect the numbers to decisions: "10k reads per second is easy for Redis, so cache redirects", "3TB means I should plan partitioning", "40 writes per second, so one primary is fine".`,
      analogy: `Like estimating whether your luggage fits the car: you don't weigh every shirt, you count suitcases and know roughly how big the boot is.`,
      quickRevision: [
        '1 day ≈ 100k s; 1M/day ≈ 12 RPS; peak 2–3×',
        'Estimate QPS (read/write), storage, bandwidth',
        'Round aggressively, state assumptions',
        'Turn numbers into decisions (cache? shard? queue?)',
      ],
      followUps: [
        'Estimate storage for a chat app with 10M daily users.',
        'How many servers would you need for 10k RPS?',
      ],
    },
  ],
});
