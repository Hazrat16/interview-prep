import { defineTopics } from '../lib/content/schema';

/**
 * Topics in sidebar order. Each topic is a folder in content/guides/ and
 * `guides` lists its guide files (without .ts) in reading order.
 */
export default defineTopics([
  {
    slug: 'javascript',
    label: 'JavaScript',
    description: 'Core language: scope, closures, this, prototypes, async and coding-round utilities.',
    icon: 'code',
    guides: ['variables-scope-hoisting', 'types-and-coercion', 'closures', 'this-and-arrow-functions', 'prototypes-and-classes', 'arrays-objects-es6', 'event-loop', 'promises-async-await', 'debounce-throttle', 'implement-it-yourself', 'output-prediction'],
  },
  {
    slug: 'frontend',
    label: 'Frontend',
    description: 'React, Next.js, TypeScript, browser fundamentals and live coding.',
    icon: 'layers',
    guides: ['react-fundamentals', 'react-hooks', 'react-state-data-fetching', 'react-performance', 'nextjs', 'typescript', 'architecture-testing', 'browser-css', 'react-live-coding'],
  },
  {
    slug: 'backend',
    label: 'Backend',
    description: 'Node.js, Express, API design, auth, queues and production scenarios.',
    icon: 'server',
    guides: ['nodejs', 'expressjs', 'rest-api-design', 'auth-security', 'redis-queues-realtime', 'testing-observability', 'backend-scenarios'],
  },
  {
    slug: 'database',
    label: 'Database',
    description: 'Transactions, locking, indexing, SQL, caching and MongoDB.',
    icon: 'database',
    guides: ['transactions-and-acid', 'row-level-locking', 'deadlocks', 'indexing', 'joins-and-subqueries', 'normalization', 'caching', 'mongodb'],
  },
  {
    slug: 'system-design',
    label: 'System Design',
    description: 'The framework, fundamentals and full design walkthroughs.',
    icon: 'grid',
    guides: ['fundamentals', 'design-problems', 'frontend-system-design'],
  },
  {
    slug: 'devops',
    label: 'DevOps & Cloud',
    description: 'Docker, CI/CD, AWS, Kubernetes, IaC and Linux.',
    icon: 'cloud',
    guides: ['docker', 'ci-cd', 'aws', 'terraform-ansible', 'kubernetes', 'linux-networking', 'devops-scenarios'],
  },
  {
    slug: 'dsa',
    label: 'DSA',
    description: 'Patterns and classic problems, solved in JavaScript.',
    icon: 'target',
    guides: ['foundations', 'arrays-hashing', 'linked-lists-stacks', 'trees-graphs', 'searching-recursion', 'classic-problems'],
  },
  {
    slug: 'companies',
    label: 'Company Rounds',
    description: 'Questions from real interviews at specific companies.',
    icon: 'building',
    guides: ['techzu'],
  },
  {
    slug: 'career',
    label: 'Career & HR',
    description: 'Recruiter screens and HR rounds: your story, motivation and logistics.',
    icon: 'briefcase',
    guides: ['introduce-yourself', 'career-moves', 'logistics'],
  },
]);
