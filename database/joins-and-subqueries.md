# JOINs & Subqueries

## Concept

### JOIN

A **JOIN** combines related data from multiple tables using relationships (usually foreign keys).

Mental model: *"My data lives in different tables — how do I bring it together?"*

### Subquery

A **subquery** is a query nested inside another query.

Mental model: *"First get me some data… then use it in another query."*

---

## Example schema (job platform)

### `users`

| id | name |
|----|------|
| 1  | Ali  |
| 2  | Sara |

### `jobs`

| id | title        |
|----|--------------|
| 1  | Frontend Dev |
| 2  | Backend Dev  |

### `applications` (junction / bridge table)

| id | user_id | job_id |
|----|---------|--------|
| 1  | 1       | 2      |
| 2  | 2       | 1      |

Relationships:

- One user can apply to many jobs
- One job can have many applicants
- `applications` connects them → **many-to-many**

```text
users ←→ applications ←→ jobs
```

---

## INNER JOIN

Returns only matching rows.

```sql
SELECT users.name, jobs.title
FROM applications
JOIN users ON users.id = applications.user_id
JOIN jobs ON jobs.id = applications.job_id;
```

Result:

| name | title        |
|------|--------------|
| Ali  | Backend Dev  |
| Sara | Frontend Dev |

---

## LEFT JOIN

Returns all rows from the left table, even when there is no match (missing side becomes `NULL`).

```sql
SELECT users.name, applications.job_id
FROM users
LEFT JOIN applications ON users.id = applications.user_id;
```

Use when you must keep left-side rows that have no related data.

---

## Subquery examples

### Filter with `IN`

```sql
SELECT name
FROM users
WHERE id IN (
  SELECT user_id
  FROM applications
  WHERE job_id = 2
);
```

### Subquery with aggregate

```sql
SELECT name
FROM users
WHERE id IN (
  SELECT user_id
  FROM applications
  GROUP BY user_id
  HAVING COUNT(*) > 1
);
```

---

## Same problem, two ways

**Goal:** users who applied to job_id = 2

### JOIN

```sql
SELECT users.name
FROM users
JOIN applications ON users.id = applications.user_id
WHERE applications.job_id = 2;
```

### Subquery

```sql
SELECT name
FROM users
WHERE id IN (
  SELECT user_id FROM applications WHERE job_id = 2
);
```

Both are valid. JOIN is usually better when you need columns from multiple tables or expect the query to grow.

---

## When to use which

| Prefer JOIN when… | Prefer subquery when… |
|-------------------|------------------------|
| You need columns from multiple tables | You mainly need filtering logic |
| You want a combined result set | You want to break logic into steps |
| Performance often favors JOINs with indexes | Nested logic is clearer as a subquery |

### Practical advice

- Prefer JOIN + proper indexes for most backend queries
- Avoid deeply nested subqueries
- Always qualify columns (`jobs.title`, not bare `title`) to avoid ambiguity
- Use single quotes for SQL strings: `'Frontend Dev'`

---

## Interview Q&A

### Q1: What is a JOIN?

**Answer:**

> A JOIN combines rows from two or more related tables based on a condition, usually a foreign key relationship. It lets you fetch related data in one query instead of querying tables separately.

---

### Q2: Difference between INNER JOIN and LEFT JOIN?

**Answer:**

> INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table; if there is no match, right-side columns are NULL.

---

### Q3: What is a subquery?

**Answer:**

> A subquery is a query nested inside another query. The inner query runs first and its result is used by the outer query for filtering or comparison.

---

### Q4: JOIN vs subquery — which should you use?

**Answer:**

> Use JOIN when you need data from multiple tables in one result. Use a subquery when the main goal is filtering based on another query’s result. In production, JOINs with indexes are often preferred for flexibility and performance.

---

### Q5: Write a query to get job titles with the applicant’s name.

**Answer:**

```sql
SELECT users.name, jobs.title
FROM applications
JOIN users ON users.id = applications.user_id
JOIN jobs ON jobs.id = applications.job_id;
```

Start from the bridge table (`applications`), then join outward.

---

### Q6: Get users who applied only to “Frontend Dev”.

**Answer:**

```sql
SELECT users.name, jobs.title
FROM applications
JOIN users ON users.id = applications.user_id
JOIN jobs ON jobs.id = applications.job_id
WHERE jobs.title = 'Frontend Dev';
```

---

## Key takeaways

- Confused about JOINs? Ask: *Which table connects them?* and *Where is the foreign key?*
- `applications` is the junction table for many-to-many
- Qualify columns and use single quotes
- JOIN for combining; subquery for stepwise filtering
