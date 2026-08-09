# Database Interview Notes

SQL and database concepts for backend interviews.

## Topics

1. [JOINs & Subqueries](joins-and-subqueries.md)
2. [Indexing](indexing.md)
3. [Caching](caching.md)
4. [Normalization & Denormalization](normalization.md)
5. [Transactions & ACID](transactions-and-acid.md)
6. [Row-Level Locking](row-level-locking.md)
7. [Deadlocks](deadlocks.md)

## Suggested study order

```text
JOINs / Subqueries
        ↓
    Indexing
        ↓
     Caching
        ↓
 Normalization / Denormalization
        ↓
 Transactions & ACID
        ↓
 Row-Level Locking
        ↓
     Deadlocks
```

## File format

Each topic file follows the same pattern:

- **Concept** — clear definition and mental model
- **Examples** — SQL / real-world scenarios
- **Interview Q&A** — polished answers you can say in a viva
- **Key takeaways** — short memory lines

## Adding a new DB topic

Create a new file under `database/`, for example:

```text
database/isolation-levels.md
database/normalization.md
database/pagination.md
```

Then link it in this README and the root README.
