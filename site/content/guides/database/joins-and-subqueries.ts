import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'JOINs & Subqueries',
  description: 'Join types, subqueries vs joins and writing queries interviewers ask for.',
  questions: [
    {
      id: 'what-is-a-join',
      question: 'What is a JOIN, and what are the different types?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `A JOIN **combines rows from two or more tables** based on a related column, usually a **foreign key** matching a primary key, so you can fetch related data in one query instead of stitching it together in application code.

The types, using \`users\` and \`orders\` as the example:

- **\`INNER JOIN\`**: only rows that **match on both sides**: users who have orders, with their orders.
- **\`LEFT JOIN\`**: **every row from the left table**, plus matches from the right; where there's no match, the right-side columns are \`NULL\`. All users, including those with no orders.
- **\`RIGHT JOIN\`**: the mirror of \`LEFT\`. Rarely used; people swap the table order instead.
- **\`FULL OUTER JOIN\`**: all rows from both sides, matched where possible.
- **\`CROSS JOIN\`**: every combination of rows (a cartesian product), e.g. sizes × colours.
- A **self join** joins a table to itself, like employees to their managers.

For performance, the columns in the \`ON\` condition should be **indexed**, especially the foreign key side.`,
      analogy: `A guest list and a seating chart: INNER JOIN lists only guests who have a seat, LEFT JOIN lists every guest and leaves the seat blank for those without one.`,
      quickRevision: [
        'Combine rows from tables on a related column (FK → PK)',
        'INNER: matches only; LEFT: all left rows + NULLs',
        'FULL OUTER: everything; CROSS: every combination',
        'Self join: table to itself (employee → manager)',
        'Index the join columns, especially foreign keys',
      ],
      followUps: [
        'INNER vs LEFT JOIN?',
        'How do you find rows with no match?',
        'Why should foreign keys be indexed?',
      ],
    },
    {
      id: 'difference-between-inner-join-and-left-join',
      question: 'What is the difference between INNER JOIN and LEFT JOIN? How do you find rows with no match?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `**\`INNER JOIN\`** keeps only rows that have a **match in both tables**. **\`LEFT JOIN\`** keeps **every row from the left table**; when there's no match on the right, those columns come back as \`NULL\`.

So "customers and their orders" with \`INNER JOIN\` silently **drops customers who never ordered**, while \`LEFT JOIN\` keeps them with \`NULL\` order columns. That difference matters in reports: counting orders per customer with an inner join makes zero-order customers disappear instead of showing \`0\`.

The \`NULL\` behaviour gives a common pattern, the **anti-join**: \`LEFT JOIN … WHERE right.id IS NULL\` finds rows **with no match**, like customers without orders. \`NOT EXISTS\` does the same and is often clearer.

A classic trap: putting a condition on the right table in the **\`WHERE\`** clause (\`WHERE o.status = 'paid'\`) **turns a LEFT JOIN back into an INNER JOIN**, because the \`NULL\` rows fail the condition. Put that condition in the **\`ON\`** clause instead if you want to keep unmatched rows.`,
      analogy: `A guest list and a seating chart: INNER JOIN lists only guests who have a seat, LEFT JOIN lists every guest and leaves the seat blank for those without one.`,
      quickRevision: [
        'INNER: matches only; LEFT: all left rows, NULLs for no match',
        'Counting with INNER drops zero rows',
        'Anti-join: `LEFT JOIN … WHERE r.id IS NULL` or `NOT EXISTS`',
        'Right-table condition in WHERE turns LEFT into INNER',
        'Put it in ON to keep unmatched rows',
      ],
      deepDive: `\`\`\`sql
-- Orders per customer, including customers with 0 orders
SELECT c.id, c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'  -- condition in ON
GROUP BY c.id, c.name;

-- Customers with no orders
SELECT c.* FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
\`\`\``,
      avoid: [
        'Using `COUNT(*)` with a LEFT JOIN: it counts the NULL row as 1; use `COUNT(o.id)`',
      ],
      followUps: [
        'How do you find customers with no orders?',
        'Why does a WHERE condition on the right table change the result?',
        'COUNT(*) vs COUNT(column)?',
      ],
    },
    {
      id: 'join-vs-subquery-which-should-you-use',
      question: 'What is a subquery, and when would you use a subquery instead of a JOIN?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `A subquery is a **query nested inside another query**. It can return a single value (\`WHERE salary > (SELECT AVG(salary) …)\`), a list (\`WHERE id IN (SELECT …)\`), or a table you select from (a derived table or **CTE** with \`WITH\`). A **correlated** subquery refers to the outer row and conceptually runs once per row.

How I choose:

- **JOIN** when I need **columns from both tables** in the result: orders with customer names.
- **\`EXISTS\` / \`NOT EXISTS\`** when I only need to **filter** by whether related rows exist. It can't duplicate rows the way a join to a one-to-many table can, and it stops at the first match.
- **A scalar subquery or CTE** when it makes the logic **readable**: comparing to an aggregate, or building a query in named steps.

On performance, modern planners (Postgres, MySQL 8) often rewrite \`IN\`/\`EXISTS\` subqueries into joins, so they end up equivalent. The real differences come from **indexes** and from correlated subqueries the planner can't flatten. As always, I check with \`EXPLAIN\` rather than assume.`,
      analogy: `A JOIN is merging two spreadsheets side by side; a subquery is asking a quick side question first ("what's the average salary?") and using the answer in the main question.`,
      quickRevision: [
        'Subquery: query inside a query (value, list, or table/CTE)',
        'Correlated subquery references the outer row',
        'JOIN when you need columns from both tables',
        '`EXISTS`/`NOT EXISTS` for "has related rows?" filters',
        'Planners often make them equivalent: check `EXPLAIN`',
      ],
      deepDive: `\`\`\`sql
-- Scalar subquery: employees paid above average
SELECT name, salary FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Correlated: above their own department's average
SELECT e.name FROM employees e
WHERE e.salary > (SELECT AVG(salary) FROM employees WHERE department_id = e.department_id);

-- CTE for readability
WITH recent AS (
  SELECT customer_id, SUM(total) AS spent
  FROM orders WHERE created_at > now() - interval '30 days'
  GROUP BY customer_id
)
SELECT c.name, r.spent FROM recent r JOIN customers c ON c.id = r.customer_id;
\`\`\``,
      followUps: [
        'What is a correlated subquery?',
        'IN vs EXISTS?',
        'What is a CTE?',
      ],
    },
    {
      id: 'write-a-query-to-get-job-titles-with-the-applicants-name',
      question: `Given \`users\`, \`jobs\` and an \`applications\` table linking them, write a query listing each applicant's name with the job title.`,
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['sql'],
      answer: `\`applications\` is a **junction (bridge) table** for the many-to-many relationship between users and jobs: each row is one user applying to one job, with \`user_id\` and \`job_id\` foreign keys. So I **start from the bridge table and join outward** to both sides:

\`\`\`sql
SELECT u.name, j.title, a.created_at AS applied_at
FROM applications a
JOIN users u ON u.id = a.user_id
JOIN jobs  j ON j.id = a.job_id
ORDER BY a.created_at DESC;
\`\`\`

I use \`INNER JOIN\` because an application without a valid user or job shouldn't appear (and foreign keys should prevent that anyway). I'd mention aliases for readability and selecting only the columns needed rather than \`*\`, since \`users\` and \`jobs\` both have an \`id\` and \`created_at\`.

For performance, \`applications(user_id)\` and \`applications(job_id)\` should be indexed. A **unique index on \`(user_id, job_id)\`** also stops someone applying to the same job twice and serves lookups by user.`,
      analogy: `A guest book that only records "guest #12 attended event #3": to print names and event titles, you look up both IDs in their own lists.`,
      quickRevision: [
        '`applications` = junction table for many-to-many',
        'Start from the junction table, join out to both sides',
        'INNER JOIN: applications must have a user and a job',
        'Aliases; select only the columns you need',
        'Unique `(user_id, job_id)` prevents duplicate applications',
      ],
      followUps: [
        'Get users who applied only to "Frontend Dev".',
        'Count applications per job, including jobs with none.',
        'How would you prevent duplicate applications?',
      ],
    },
    {
      id: 'get-users-who-applied-only-to-frontend-dev',
      question: 'Using the same tables, find users who applied **only** to "Frontend Dev" (and to no other job).',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `The word **"only"** is the catch. A plain join with \`WHERE j.title = 'Frontend Dev'\` returns everyone who applied to Frontend Dev, **including people who also applied elsewhere**.

To get "only", I need users who **have** a Frontend Dev application and **don't have** any other. Two clean ways:

**1. \`EXISTS\` + \`NOT EXISTS\`**, which reads exactly like the requirement:

\`\`\`sql
SELECT u.id, u.name
FROM users u
WHERE EXISTS (
  SELECT 1 FROM applications a JOIN jobs j ON j.id = a.job_id
  WHERE a.user_id = u.id AND j.title = 'Frontend Dev'
)
AND NOT EXISTS (
  SELECT 1 FROM applications a JOIN jobs j ON j.id = a.job_id
  WHERE a.user_id = u.id AND j.title <> 'Frontend Dev'
);
\`\`\`

**2. Group and check**, which is compact:

\`\`\`sql
SELECT u.id, u.name
FROM users u
JOIN applications a ON a.user_id = u.id
JOIN jobs j ON j.id = a.job_id
GROUP BY u.id, u.name
HAVING BOOL_AND(j.title = 'Frontend Dev');   -- MySQL: HAVING SUM(j.title <> 'Frontend Dev') = 0
\`\`\`

In an interview I'd clarify the requirement first ("only" vs "at least"), because that question is often the point of the exercise.`,
      analogy: `"Who ordered only coffee?" isn't "who ordered coffee": you also have to rule out everyone who ordered a croissant too.`,
      quickRevision: [
        '"Only" ≠ "at least": a plain WHERE returns too many',
        'EXISTS (Frontend Dev) AND NOT EXISTS (anything else)',
        'Or GROUP BY user + HAVING all titles = Frontend Dev',
        'Clarify "only" vs "at least" before writing',
      ],
      followUps: [
        'How would you find users who applied to at least two jobs?',
        'Which version performs better and why?',
        'How would you handle duplicate job titles?',
      ],
    },
  ],
});
