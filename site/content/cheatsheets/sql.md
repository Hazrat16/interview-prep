---
title: SQL
description: Query order, joins, aggregates, window functions, indexes and transactions.
icon: database
order: 4
---

## Logical query order

`FROM` → `JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `DISTINCT` → `ORDER BY` → `LIMIT`

That's why you can't use a `SELECT` alias in `WHERE`, but you can in `ORDER BY`.

## Joins

| Join | Returns |
|---|---|
| `INNER JOIN` | Rows with a match in both tables |
| `LEFT JOIN` | All left rows; `NULL`s where the right has no match |
| `RIGHT JOIN` | Mirror of LEFT |
| `FULL OUTER JOIN` | All rows from both sides |
| `CROSS JOIN` | Every combination (cartesian product) |
| Self join | A table joined to itself (employee → manager) |

```sql
-- Customers with no orders (anti-join)
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

## Aggregates

```sql
SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spent
FROM orders
WHERE created_at >= '2026-01-01'   -- filters rows
GROUP BY customer_id
HAVING SUM(total) > 1000            -- filters groups
ORDER BY spent DESC
LIMIT 10;
```

`COUNT(*)` counts rows; `COUNT(col)` skips `NULL`s.

## Window functions

```sql
-- Top 3 earners per department
SELECT * FROM (
  SELECT name, department, salary,
         DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
  FROM employees
) t
WHERE rnk <= 3;

-- Running total
SELECT day, amount, SUM(amount) OVER (ORDER BY day) AS running_total FROM sales;
```

`ROW_NUMBER` (1,2,3,4) · `RANK` (1,2,2,4) · `DENSE_RANK` (1,2,2,3) · `LAG` / `LEAD` for previous/next row.

## Classic interview queries

```sql
-- Second highest salary
SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);

-- Duplicate emails
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
```

## Indexes

- B-tree index: fast `=`, range, `ORDER BY` on the indexed columns.
- **Composite index `(a, b)`** helps `WHERE a = ?` and `WHERE a = ? AND b = ?`, not `WHERE b = ?` alone (leftmost prefix).
- **Covering index**: contains every column the query needs, so the table isn't read.
- Indexes slow down writes and take space. Don't index low-cardinality columns alone.
- Check with `EXPLAIN` / `EXPLAIN ANALYZE`; look for sequential scans on big tables.

## Transactions & isolation

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- or ROLLBACK;
```

| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| Read Uncommitted | possible | possible | possible |
| Read Committed (Postgres default) | — | possible | possible |
| Repeatable Read (MySQL default) | — | — | possible* |
| Serializable | — | — | — |

\* InnoDB's gap locks and Postgres' snapshot prevent most phantoms at Repeatable Read.

`SELECT … FOR UPDATE` locks the selected rows until commit — the usual fix for "two users buy the last item".
