# Caching

## Concept

**Caching** stores frequently fetched or computed results in fast storage (memory / Redis) so repeated requests do not hit the database every time.

Mental model:

- **Index** → helps the DB find data faster
- **Cache** → avoids the DB completely for repeated reads

---

## Why caching exists

Even an indexed query is still more expensive than a memory lookup because a DB query can involve:

1. Disk I/O
2. CPU work (parse, plan, filter, join, sort)
3. Network round-trip (app ↔ DB)
4. Connection / concurrency overhead

At scale (e.g. 1000 identical requests/sec):

```text
Without cache → 1000 DB queries/sec
With cache    → 1 DB query + 999 cache hits
```

---

## Index vs cache

| Layer | Purpose |
|-------|---------|
| Index | Make DB queries fast |
| Cache | Avoid DB queries |
| Both | Used together in production |

```text
Index  → still goes to DB
Cache  → often never reaches DB
```

---

## Main risk: stale cache

If DB data changes but cache is not updated, clients can see old data.

Example:

1. Cache stores `job.status = "active"`
2. DB updates status to `"closed"`
3. Cache still returns `"active"` → **stale / inconsistent**

### How systems handle it

1. **Cache invalidation** (most common)  
   On update/delete, remove or refresh the cache key.

2. **TTL (Time To Live)**  
   Cache expires automatically after N seconds. Simple, but temporary staleness is allowed.

3. **Write-through / write-back** (advanced)  
   Writes update cache and storage together (or asynchronously). More complex.

---

## Why we don’t cache everything

Cache only when data is:

1. **Frequently accessed** (hot data)
2. **Expensive to query/compute**
3. **Shared across many users** (same result reused)

### Why not cache all data?

- RAM is limited and expensive
- Invalidation becomes complex (“cache consistency nightmare”)
- Low-value / rare data doesn’t benefit
- Some data must always be fresh (balances, payments, critical inventory)

### Good cache candidates

- Job listings / product catalog
- Homepages and feeds
- Heavy aggregations / JOIN-heavy read APIs

### Poor cache candidates (or very careful caching)

- Bank balances
- Payment / wallet state
- Real-time inventory during checkout

---

## Partial updates myth

Cache is usually **key → whole payload**, not column-based.

If one field changes, common approaches are:

- Invalidate the whole key and refetch
- Rewrite the whole cached object
- Use short TTL

Trying to surgically patch one field inside many cache entries often becomes fragile.

---

## Interview Q&A

### Q1: What is caching?

**Answer:**

> Caching stores previously fetched or computed results in fast storage like memory or Redis so repeated requests can be served without hitting the database every time. It reduces latency and database load.

---

### Q2: Difference between indexing and caching?

**Answer:**

> Indexing is a database-side structure that speeds up query execution, but the query still hits the database. Caching stores results outside the database and can avoid the query entirely. In production systems we often use both.

---

### Q3: What problem can caching create when data changes often?

**Answer:**

> Stale cache. The database may already have newer data, but the application still serves an old cached value until the cache is invalidated or expires. This creates temporary data inconsistency.

---

### Q4: How do you keep cache consistent?

**Answer:**

> The most common approach is cache invalidation: when data is updated, delete or refresh the related cache keys. Another approach is TTL, where cache entries expire automatically. Some systems use write-through caching for stronger consistency, but that is more complex.

---

### Q5: Why use caching even if indexes already exist?

**Answer:**

> Because even optimized database queries are still slower and more expensive than memory lookups. Caching avoids repeated query planning, storage engine work, network calls, and concurrency overhead, which matters under high traffic.

---

### Q6: Why don’t we cache everything?

**Answer:**

> Memory is limited, invalidation becomes complex, and not all data is hot enough to justify caching. Critical data that must always be fresh — like balances or payments — is often read from the database instead of cache.

---

## Key takeaways

- Cache = avoid DB; Index = speed up DB
- Biggest risk = stale data → invalidate or TTL
- Cache hot, expensive, shared reads
- Don’t cache everything; memory and consistency have a cost
- Correctness-sensitive data usually stays closer to the DB
