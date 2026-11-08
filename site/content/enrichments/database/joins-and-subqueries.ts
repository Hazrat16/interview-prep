import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('database/joins-and-subqueries.md', {
  'what-is-a-join': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'Matching guest list names to their table numbers on a seating plan: the shared column (name) connects the two lists.',
    quickRevision: ['Combines rows from tables on a related column', 'Usually foreign key → primary key', 'INNER, LEFT, RIGHT, FULL, CROSS, self join', 'Index the join columns'],
    followUps: ['What is a self join? Give an example.', 'What is a CROSS JOIN used for?'],
  },
  'difference-between-inner-join-and-left-join': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'INNER JOIN is a photo of couples only; LEFT JOIN is a photo of everyone from the left team, with an empty space next to anyone who came alone.',
    quickRevision: ['INNER: only matching rows', 'LEFT: all left rows + matches, NULLs if none', 'LEFT + WHERE right.id IS NULL = "missing" rows', 'Filtering the right table in WHERE can turn LEFT into INNER'],
    followUps: ['Find users who never applied to any job.', 'Why does a WHERE on the right table break a LEFT JOIN?'],
  },
  'what-is-a-subquery': {
    difficulty: 'easy',
    analogy: 'Asking a question inside a question: "Who earns more than (the average salary)?" The bracket is answered first.',
    quickRevision: ['Query nested inside another', 'In WHERE (IN / EXISTS), FROM (derived table), SELECT', 'Correlated subqueries run per row', 'EXISTS stops at the first match'],
    followUps: ['IN vs EXISTS?', 'What is a correlated subquery and why can it be slow?'],
  },
  'join-vs-subquery--which-should-you-use': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Two routes to the same address: modern GPS (the query planner) often finds they\'re equally fast, so pick the one that\'s easiest to read, and check traffic (EXPLAIN) if it matters.',
    quickRevision: ['JOIN when you need columns from both tables', 'Subquery/EXISTS for filtering or aggregates', 'Planners often rewrite them similarly', 'Readability first; verify with EXPLAIN'],
    followUps: ['When is a correlated subquery a problem?', 'What is a CTE and when would you use one?'],
  },
  'write-a-query-to-get-job-titles-with-the-applicants-name': {
    difficulty: 'easy',
    analogy: 'Using the applications table as the bridge between two islands (jobs and users): you can only cross from a job to a person via an application.',
    quickRevision: ['Junction table links jobs and users', 'JOIN applications → jobs and → users', 'Select job.title, user.name', 'LEFT JOIN to include jobs with no applicants'],
    followUps: ['Include jobs with zero applicants.', 'Count applicants per job.'],
  },
  'get-users-who-applied-only-to-frontend-dev': {
    difficulty: 'medium',
    analogy: 'Finding guests who ate only cake at the party: first find who had cake, then remove anyone who also had something else.',
    quickRevision: ['"Only" = has X and no other', 'GROUP BY user HAVING all titles = target', 'Or EXISTS(target) AND NOT EXISTS(other)', 'Clarify the requirement first'],
    followUps: ['Solve it with GROUP BY + HAVING.', 'Solve it with NOT EXISTS.'],
  },
});
