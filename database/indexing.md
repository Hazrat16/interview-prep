# Indexing

## Concept

An **index** is a data structure (usually a B-tree) that helps the database find rows faster without scanning the whole table.

Mental model: like a book index — jump to the page instead of reading every page.

Important: indexing is **not** the same as uniqueness. Indexes can be unique or non-unique. Most indexes are non-unique.

---

## Why indexes matter

Query:

```sql
WHERE jobs.title = 'Frontend Dev'
```

### Without index

- Full table scan (check every row)
- Time complexity roughly **O(n)**
- Gets worse as data grows (e.g. 1M rows)

### With index

- Jump directly to matching entries
- Roughly **O(log n)** for B-tree lookups
- Much faster for filters, joins, and sorts

```sql
CREATE INDEX idx_jobs_title ON jobs(title);
```

---

## When to add an index

Index columns that are frequently used in:

- `WHERE`
- `JOIN`
- `ORDER BY`

Primary keys are already indexed automatically.

### Common beginner mistake

> “Index everything.”

Bad idea:

- Slower inserts/updates/deletes
- Extra storage
- Write path has more work

**Rule:** Index = faster reads, slower writes. Add indexes where reads are frequent and selective.

---

## ORDER BY example

```sql
SELECT *
FROM jobs
ORDER BY created_at DESC;
```

Without an index, the DB may read all rows and sort them — expensive.

```sql
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
```

With `LIMIT`, indexes become even more powerful:

```sql
SELECT *
FROM jobs
ORDER BY created_at DESC
LIMIT 10;
```

The DB can walk the index and stop after 10 rows instead of sorting everything.

---

## Composite indexes (order matters)

Query:

```sql
SELECT *
FROM jobs
WHERE status = 'active'
ORDER BY created_at DESC;
```

### Best approach

One **composite index**, not two separate indexes:

```sql
CREATE INDEX idx_jobs_status_created_at
ON jobs(status, created_at DESC);
```

How it helps:

1. Filter by `status = 'active'`
2. Within that group, `created_at` is already ordered

### What not to do

**Separate indexes (usually weaker):**

```sql
CREATE INDEX idx_status ON jobs(status);
CREATE INDEX idx_created_at ON jobs(created_at);
```

The optimizer often uses only one index efficiently.

**Wrong column order:**

```sql
(status, created_at)     -- good for WHERE status = ...
(created_at, status)     -- weak for that same filter
```

### Leftmost prefix rule

A composite index on `(a, b, c)` can help queries that filter on:

- `a`
- `a, b`
- `a, b, c`

It usually **cannot** efficiently help queries that only filter on `b` or `c`.

---

## High-traffic thinking

If a query runs ~1000 times/sec, indexing alone is not enough. Also consider:

1. **Caching** (Redis / memory)
2. **Select only needed columns** (`SELECT id, title` instead of `SELECT *`)
3. **Pagination** (`LIMIT` / `OFFSET` or keyset pagination)
4. **Read replicas** for read-heavy load
5. **Connection pooling**

---

## Interview Q&A

### Q1: What is an index?

**Answer:**

> An index is a data structure that speeds up searching, filtering, and sorting in a table. Instead of scanning every row, the database can jump directly to matching rows. Indexes do not create uniqueness by themselves unless defined as unique indexes.

---

### Q2: When would you create an index?

**Answer:**

> I create indexes on columns frequently used in WHERE, JOIN, or ORDER BY clauses, especially on large tables. I avoid indexing rarely queried columns because indexes slow down writes and use extra storage.

---

### Q3: What index for `WHERE status = 'active' ORDER BY created_at DESC`?

**Answer:**

> A composite index on `(status, created_at)`. Status comes first because the query filters by it, then created_at supports ordering within that filtered set.

```sql
CREATE INDEX idx_jobs_status_created_at
ON jobs(status, created_at DESC);
```

---

### Q4: Why can indexing everything be harmful?

**Answer:**

> Every insert, update, or delete must also maintain the indexes. Too many indexes increase write latency and storage cost. Indexes should be intentional based on real query patterns.

---

### Q5: Index vs cache?

**Answer:**

> An index lives inside the database and makes queries faster, but the query still hits the DB. A cache lives outside the DB (for example Redis) and can avoid the DB query entirely by returning stored results.

| Feature | Index | Cache |
|---------|-------|-------|
| Where | Inside DB | Outside DB (Redis/memory) |
| Purpose | Faster search | Avoid repeated DB work |
| Stores | Lookup structure | Actual results / objects |
| Trade-off | Slower writes | Stale data risk |

---

## Key takeaways

- Index = faster find, not “unique values”
- Index hot `WHERE` / `JOIN` / `ORDER BY` columns
- Prefer one composite index over weak separate indexes
- Column order in composite indexes matters (leftmost prefix)
- Index speeds the DB; cache can skip the DB
