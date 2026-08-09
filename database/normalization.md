# Normalization & Denormalization

## Concept

### Normalization

Organize data into related tables to **reduce duplication** and keep data consistent.

### Denormalization

**Intentionally duplicate** data (or precompute views) to reduce JOINs and speed up reads.

Real systems are almost never purely one or the other — they use a **hybrid**.

---

## Normalization example

### Not normalized (bad)

| user_name | job_title | company |
|-----------|-----------|---------|
| Ali       | Dev       | Google  |
| Ali       | Dev       | Google  |

Problems:

- Repeated data
- Hard updates (change company in many rows)
- Easy inconsistency

### Normalized

**users**

| id | name |
|----|------|
| 1  | Ali  |

**jobs**

| id | title | company |
|----|-------|---------|
| 1  | Dev   | Google  |

**applications**

| user_id | job_id |
|---------|--------|
| 1       | 1      |

Benefits:

- Less duplication
- Easier correct updates
- Stronger data integrity

Trade-off: more tables → more JOINs → sometimes slower/complex reads.

---

## Denormalization example

| user_name | job_title | company |
|-----------|-----------|---------|
| Ali       | Dev       | Google  |

Benefits:

- Faster reads
- Simpler queries (fewer JOINs)
- Good for read-heavy paths

Trade-off: if `company` changes, many rows must update → inconsistency risk.

---

## Comparison

| Feature | Normalization | Denormalization |
|---------|---------------|-----------------|
| Duplication | Low | Higher |
| Storage | Efficient | More |
| Read speed | Often slower (JOINs) | Faster |
| Integrity | High | Riskier |
| Typical use | OLTP / transactions | Read-heavy / analytics / feeds |

### Where each shines

**Normalize when correctness matters:**

- banking
- payments
- user accounts
- applications / orders

**Denormalize when speed matters:**

- feeds
- dashboards
- search result cards
- analytics views
- cache-friendly payloads

---

## How this connects to other topics

| Concept | Role |
|---------|------|
| JOINs | Needed because data is normalized |
| Indexes | Make normalized JOINs / filters affordable |
| Cache | Serve hot read results without repeating JOINs |
| Denormalization | Prebuild read-friendly shapes to reduce JOINs |

Production stack often looks like:

```text
Core DB        → normalized (source of truth)
Read models    → denormalized
Cache          → fastest access
Indexes        → optimize both
```

This is close to **CQRS-style thinking**: write path optimized for correctness, read path optimized for speed.

---

## Job platform (hybrid) example

### Normalized core (must be correct)

- `users`
- `jobs`
- `applications`

If a job title changes, update it in **one** place.

### Denormalized read paths (must be fast)

- job feed
- search results
- dashboards

Example denormalized payload:

```json
{
  "job_title": "Frontend Dev",
  "company_name": "Google",
  "applicant_count": 120
}
```

Built/refreshed from JOINs (or events), then served quickly.

---

## Why JOINs still exist after denormalization

1. **Source of truth stays normalized** — relationships and integrity live there.
2. **Denormalized data is usually a copy/view**, not the primary store.
3. **Not every query is precomputed** — ad-hoc or admin queries still JOIN.
4. **Full denormalization increases update complexity and stale data risk.**

Mental model:

- Normalized DB → where truth lives
- Denormalized layer → optimized view for speed
- JOINs → reconstruct truth when needed

---

## Interview Q&A

### Q1: What is normalization?

**Answer:**

> Normalization organizes data into related tables to minimize duplication and keep data consistent. Updates happen in one place, which improves integrity, though queries may need more JOINs.

---

### Q2: What is denormalization?

**Answer:**

> Denormalization intentionally duplicates or precomputes data to reduce JOINs and improve read performance. It is useful for read-heavy paths, but updates become harder and consistency risk increases.

---

### Q3: For a LinkedIn-like job platform, normalize, denormalize, or hybrid?

**Answer:**

> Hybrid. Core transactional data like users, jobs, and applications should stay normalized for consistency. Frequently read surfaces like feeds and search cards can be denormalized or cached to reduce expensive joins and improve latency.

---

### Q4: If we denormalize for performance, why do we still need JOINs?

**Answer:**

> Because denormalized data is usually a derived read model, not the source of truth. JOINs are still needed to maintain relationships, enforce integrity, build or refresh denormalized views, and answer queries that are not precomputed.

---

### Q5: How do normalization, indexing, and caching work together?

**Answer:**

> Normalization keeps writes correct. Indexing makes the resulting JOINs and filters fast enough. Caching (and sometimes denormalized read models) avoids repeating expensive queries for hot data. Together they balance correctness and performance.

---

## Key takeaways

- Normalize for truth; denormalize for speed
- Real systems are hybrid by workload
- Denormalized data is usually derived, not primary
- JOINs remain essential for correctness and rebuilding views
- Chain: Index → Cache → Normalize → Denormalize → JOIN
