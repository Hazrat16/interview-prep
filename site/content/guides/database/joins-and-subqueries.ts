import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'JOINs & Subqueries',
  description: 'Join types, subqueries vs joins and writing queries interviewers ask for.',
  questions: [
    {
      id: 'what-is-a-join',
      question: 'What is a JOIN?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `> A JOIN combines rows from two or more related tables based on a condition, usually a foreign key relationship. It lets you fetch related data in one query instead of querying tables separately.`,
      analogy: `Matching guest list names to their table numbers on a seating plan: the shared column (name) connects the two lists.`,
      quickRevision: [
        'Combines rows from tables on a related column',
        'Usually foreign key → primary key',
        'INNER, LEFT, RIGHT, FULL, CROSS, self join',
        'Index the join columns',
      ],
      followUps: [
        'What is a self join? Give an example.',
        'What is a CROSS JOIN used for?',
      ],
    },
    {
      id: 'difference-between-inner-join-and-left-join',
      question: 'Difference between INNER JOIN and LEFT JOIN?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['sql'],
      answer: `> INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table; if there is no match, right-side columns are NULL.`,
      analogy: `INNER JOIN is a photo of couples only; LEFT JOIN is a photo of everyone from the left team, with an empty space next to anyone who came alone.`,
      quickRevision: [
        'INNER: only matching rows',
        'LEFT: all left rows + matches, NULLs if none',
        'LEFT + WHERE right.id IS NULL = "missing" rows',
        'Filtering the right table in WHERE can turn LEFT into INNER',
      ],
      followUps: [
        'Find users who never applied to any job.',
        'Why does a WHERE on the right table break a LEFT JOIN?',
      ],
    },
    {
      id: 'what-is-a-subquery',
      question: 'What is a subquery?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['sql'],
      answer: `> A subquery is a query nested inside another query. The inner query runs first and its result is used by the outer query for filtering or comparison.`,
      analogy: `Asking a question inside a question: "Who earns more than (the average salary)?" The bracket is answered first.`,
      quickRevision: [
        'Query nested inside another',
        'In WHERE (IN / EXISTS), FROM (derived table), SELECT',
        'Correlated subqueries run per row',
        'EXISTS stops at the first match',
      ],
      followUps: [
        'IN vs EXISTS?',
        'What is a correlated subquery and why can it be slow?',
      ],
    },
    {
      id: 'join-vs-subquery-which-should-you-use',
      question: 'JOIN vs subquery — which should you use?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `> Use JOIN when you need data from multiple tables in one result. Use a subquery when the main goal is filtering based on another query’s result. In production, JOINs with indexes are often preferred for flexibility and performance.`,
      analogy: `Two routes to the same address: modern GPS (the query planner) often finds they're equally fast, so pick the one that's easiest to read, and check traffic (EXPLAIN) if it matters.`,
      quickRevision: [
        'JOIN when you need columns from both tables',
        'Subquery/EXISTS for filtering or aggregates',
        'Planners often rewrite them similarly',
        'Readability first; verify with EXPLAIN',
      ],
      followUps: [
        'When is a correlated subquery a problem?',
        'What is a CTE and when would you use one?',
      ],
    },
    {
      id: 'write-a-query-to-get-job-titles-with-the-applicants-name',
      question: 'Write a query to get job titles with the applicant’s name.',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['sql'],
      answer: `\`\`\`sql
SELECT users.name, jobs.title
FROM applications
JOIN users ON users.id = applications.user_id
JOIN jobs ON jobs.id = applications.job_id;
\`\`\`

Start from the bridge table (\`applications\`), then join outward.`,
      analogy: `Using the applications table as the bridge between two islands (jobs and users): you can only cross from a job to a person via an application.`,
      quickRevision: [
        'Junction table links jobs and users',
        'JOIN applications → jobs and → users',
        'Select job.title, user.name',
        'LEFT JOIN to include jobs with no applicants',
      ],
      followUps: [
        'Include jobs with zero applicants.',
        'Count applicants per job.',
      ],
    },
    {
      id: 'get-users-who-applied-only-to-frontend-dev',
      question: 'Get users who applied only to “Frontend Dev”.',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['sql'],
      answer: `\`\`\`sql
SELECT users.name, jobs.title
FROM applications
JOIN users ON users.id = applications.user_id
JOIN jobs ON jobs.id = applications.job_id
WHERE jobs.title = 'Frontend Dev';
\`\`\``,
      analogy: `Finding guests who ate only cake at the party: first find who had cake, then remove anyone who also had something else.`,
      quickRevision: [
        '"Only" = has X and no other',
        'GROUP BY user HAVING all titles = target',
        'Or EXISTS(target) AND NOT EXISTS(other)',
        'Clarify the requirement first',
      ],
      followUps: [
        'Solve it with GROUP BY + HAVING.',
        'Solve it with NOT EXISTS.',
      ],
    },
  ],
});
