import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'CI/CD',
  description: 'Pipelines with GitHub Actions, environments, secrets and deployment strategies.',
  questions: [
    {
      id: 'ci-vs-cd-delivery-vs-deployment',
      question: 'CI vs CD (delivery vs deployment)?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['ci-cd'],
      answer: `- **Continuous Integration**: every change is merged often and automatically **built and tested** (lint, type-check, tests), so problems surface early.
- **Continuous Delivery**: every change that passes is **always deployable**, and releasing to production is a **manual decision** (a button or an approval).
- **Continuous Deployment**: every passing change **goes to production automatically**, with no human gate.

My SmartJobHub pipeline is continuous **delivery**: it deploys to staging automatically, then the **same image** goes to production after manual approval.`,
      variants: [
        { label: 'Short version', answer: `CI: build and test every change. Continuous delivery: always deployable, release is manual. Continuous deployment: every passing change goes to production automatically.` },
      ],
      analogy: `CI is checking every ingredient as it arrives; continuous delivery is always having the dish ready to serve when the customer asks; continuous deployment is serving each dish the moment it's ready.`,
      quickRevision: [
        'CI: build + test every change',
        'Delivery: always deployable, manual release',
        'Deployment: automatic to production',
        'Mine: auto to staging, approval to prod',
      ],
      followUps: [
        'What do you need before you can do continuous deployment?',
        'What are feature flags for?',
      ],
    },
    {
      id: 'cicd-pipeline-zero-downtime',
      question: 'Describe a CI/CD pipeline you would set up, including zero-downtime deploys and rollback.',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['ci-cd', 'docker', 'aws'],
      answer: `**CI on every pull request** (GitHub Actions): install with a cached lockfile → lint → type-check → unit and integration tests (with a Postgres/Mongo service container) → build → dependency and secret scanning. Branch protection requires it to pass plus a review.

**CD on merge to main:**

1. Build the Docker image **once**, tag it with the **commit SHA**, push it to a registry (ECR/GHCR).
2. Deploy that **same image** to **staging** automatically → run migrations → smoke tests.
3. **Promote the same image** to production after manual approval (a GitHub environment). Never rebuild for production.

**Zero downtime:** rolling or blue-green deploys behind the load balancer, with **health checks**, so old containers are only removed once new ones are healthy. Graceful shutdown (stop accepting, finish in-flight requests). **Backward-compatible database migrations** (expand → migrate → contract) so old and new code can run at the same time.

**Rollback:** redeploy the previous SHA tag, which takes seconds because the image already exists. Migrations stay backward compatible, so rolling back code doesn't need a database rollback. Secrets come from OIDC-assumed roles or a secrets manager, never stored in the repo.`,
      analogy: `A restaurant changing its menu during service. You test new dishes in the kitchen (CI), serve them to a tasting table first (staging), then swap tables over one at a time while old dishes are still being served (rolling deploy). If guests complain, you bring back yesterday's menu, which is already printed (previous image tag).`,
      quickRevision: [
        'PR: lint → typecheck → test → build → scan',
        'Build once, tag by SHA, promote the same image',
        'Staging auto + smoke tests; prod with approval',
        'Rolling/blue-green + health checks + graceful shutdown',
        'Expand/contract migrations; rollback = redeploy previous SHA',
      ],
      followUps: [
        'How would you rename a database column without downtime?',
        'How do you handle secrets in GitHub Actions?',
        'What is the difference between continuous delivery and continuous deployment?',
      ],
    },
    {
      id: 'secrets-in-ci',
      question: 'Secrets in CI?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['ci-cd'],
      answer: `- Store secrets in **GitHub encrypted secrets**, scoped to **environments** (staging, production) with protection rules, so production secrets are only available to approved deployments.
- For cloud access, use **OIDC**: the workflow gets a short-lived token and **assumes an AWS IAM role** restricted to that repo and branch. **No long-lived access keys** are stored anywhere. That's how SmartJobHub deploys.
- Pass secrets to apps at **runtime** from a secrets manager (AWS Secrets Manager referenced by the ECS task), not baked into images.
- Never \`echo\` secrets (GitHub masks them, but don't rely on that). Be careful with \`pull_request_target\` and forks, and pin third-party actions to a SHA.`,
      variants: [
        { label: 'Short version', answer: `GitHub encrypted secrets / environments. Use **OIDC** to assume an AWS role, with no long-lived keys.` },
      ],
      analogy: `Instead of giving the delivery driver a permanent copy of your house key, you issue a one-time code that only works today, only for the front door, and only for that driver (OIDC).`,
      quickRevision: [
        'GitHub secrets scoped to environments',
        'OIDC → assume IAM role, no static keys',
        'Runtime secrets from Secrets Manager, not in images',
        'Pin actions; careful with forks',
      ],
      followUps: [
        'How does OIDC trust work between GitHub and AWS?',
        'How do you rotate CI secrets?',
      ],
    },
    {
      id: 'staging-to-production-promotion',
      question: 'Staging-to-production promotion?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['ci-cd'],
      answer: `I **build the image once**, tag it with the **commit SHA**, and **promote that exact image** from staging to production. I don't rebuild for production, because a rebuild could pick up different dependencies or base images, so what you tested wouldn't be what you ship.

Flow: merge → build and push \`app:<sha>\` → deploy to **staging** → migrations + smoke tests → **manual approval** (a GitHub environment with required reviewers) → deploy the **same tag** to production → smoke tests and health checks. Configuration differs only through **environment variables and secrets**, not the image.`,
      variants: [
        { label: 'Short version', answer: 'Promote the **same image** (tagged by commit SHA), don\'t rebuild. Use a manual approval environment.' },
      ],
      analogy: `A car tested on the track is the exact car delivered to the customer, not a new one built from the same blueprint afterwards.`,
      quickRevision: [
        'Build once, tag by SHA',
        'Promote the same image',
        'Staging → smoke tests → approval → prod',
        'Env differences via config only',
      ],
      followUps: [
        'Why not use `latest` tags?',
        'How do you handle DB migrations during promotion?',
      ],
    },
    {
      id: 'rollback',
      question: 'Rollback?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['ci-cd'],
      answer: `Rollback should be **fast and boring**:

- **Redeploy the previous image tag** (by SHA). It already exists in the registry, so it takes a minute.
- **Automatic rollback**: the **ECS deployment circuit breaker** (or Kubernetes rollout checks) rolls back if new tasks fail health checks. I use it in SmartJobHub.
- **Database migrations** must be **backward compatible** (expand → migrate → contract), so the old code still works with the new schema and rolling back code doesn't need a DB rollback.
- **Feature flags** let you switch off a broken feature without redeploying.

After rolling back, investigate and write a short postmortem.`,
      variants: [
        { label: 'Short version', answer: `Redeploy the previous image tag. ECS deployment circuit breaker auto-rollback. Keep migrations backward compatible.` },
      ],
      analogy: `Keeping yesterday's printed menu in the drawer: if today's dish goes wrong, you put the old menu back in seconds instead of rewriting it from memory.`,
      quickRevision: [
        'Redeploy previous SHA tag',
        'ECS circuit breaker auto-rollback',
        'Backward-compatible migrations',
        'Feature flags as a kill switch',
      ],
      followUps: [
        'What if the migration already dropped a column?',
        'How do you decide to roll back vs fix forward?',
      ],
    },
    {
      id: 'deployment-strategies',
      question: 'Deployment strategies?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['ci-cd'],
      answer: `- **Recreate**: stop the old version, start the new one. Simple, but has **downtime**.
- **Rolling**: replace instances **gradually**, with health checks. No downtime, and it's the ECS and Kubernetes default. Old and new versions run side by side for a while, so changes must be compatible.
- **Blue/green**: run a full **new environment (green)** next to the old one (blue), test it, then **switch traffic** at the load balancer. Rollback is instant (switch back), but it needs double the resources during the switch.
- **Canary**: send a **small percentage** of traffic (say 5%) to the new version, watch metrics, then increase. Lowest risk, but needs good monitoring and traffic splitting.`,
      variants: [
        { label: 'Short version', answer: `Rolling, blue/green (switch traffic between two environments), canary (a small percentage first), recreate.` },
      ],
      analogy: `Changing a restaurant's menu: close and reopen (recreate), change one table at a time (rolling), open an identical restaurant next door and move everyone over (blue/green), or let a few tables taste first (canary).`,
      quickRevision: [
        'Recreate: downtime',
        'Rolling: gradual, needs compatibility',
        'Blue/green: instant switch + rollback, 2× resources',
        'Canary: small % first + metrics',
      ],
      followUps: [
        'Which would you use for a risky payment change?',
        'How do DB migrations work with blue/green?',
      ],
    },
    {
      id: 'speed-up-slow-pipelines',
      question: 'Speed up slow pipelines?',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['ci-cd'],
      answer: `First I **measure** which steps are slow. Then:

- **cache dependencies** (\`actions/setup-node\` with npm cache) and **Docker layers** (BuildKit with the GitHub Actions cache);
- **run jobs in parallel** (lint, type-check, unit tests and build at the same time) and **shard** long test suites;
- **run only what changed**: path filters, affected projects in monorepos (Turborepo or Nx caching);
- use \`concurrency\` to **cancel outdated runs** on the same branch;
- keep the slow E2E and security scans for main or nightly runs, with fast checks on every PR;
- bigger runners if needed.`,
      variants: [
        { label: 'Short version', answer: 'Dependency caching, parallel jobs, Docker layer cache, run only affected tests.' },
      ],
      analogy: `Speeding up a car wash: don't rewash clean parts (caching), use several bays at once (parallel jobs), and skip the waxing for cars that only need a rinse (affected-only).`,
      quickRevision: [
        'Measure first',
        'Cache deps + Docker layers',
        'Parallelise and shard tests',
        'Path filters / affected-only',
        'Cancel superseded runs',
      ],
      followUps: [
        'How does Turborepo remote caching work?',
        'What would you run on PRs vs nightly?',
      ],
    },
  ],
});
