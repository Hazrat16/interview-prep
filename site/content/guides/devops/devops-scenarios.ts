import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'DevOps Scenarios',
  description: 'Incidents and judgement calls: failed deploys, high CPU, rollbacks and on-call.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'devops/ci-cd/cicd-pipeline-zero-downtime',
  ],
  questions: [
    {
      id: 'a-deploy-broke-production-what-do-you-do',
      question: 'A deploy broke production. What do you do?',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['ci-cd'],
      answer: `1. **Mitigate first**: **roll back** to the previous image (or switch off the feature flag). Restoring service matters more than finding the cause right now.
2. **Communicate**: tell the team and stakeholders what's happening, the impact, and the next update time.
3. **Verify recovery**: health checks, error rate and latency back to normal.
4. **Investigate**: diff the release, logs, traces and Sentry errors, and reproduce it in staging.
5. **Fix forward** properly, with a test that would have caught it.
6. **Blameless postmortem**: timeline, root cause, why it wasn't caught (missing test, alert, or staging gap), and action items.`,
      variants: [
        { label: 'Short version', answer: `Roll back first, communicate, then investigate (logs, diff), write a postmortem and add a test or check.` },
      ],
      analogy: `If a new dish makes customers ill, you take it off the menu immediately (rollback), tell staff and customers, and only then investigate the recipe in the test kitchen.`,
      quickRevision: [
        'Roll back / flag off first',
        'Communicate impact + updates',
        'Verify recovery with metrics',
        'Investigate, fix forward with a test',
        'Blameless postmortem',
      ],
      followUps: [
        'When would you fix forward instead of rolling back?',
        'What if the deploy included a migration?',
      ],
    },
    {
      id: 'the-container-keeps-restarting',
      question: 'A container keeps restarting. How do you debug it?',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['docker'],
      answer: `Check **why it exits**:

1. **Logs**: \`docker logs <container>\` or the ECS task's CloudWatch logs. Is it a crash on startup (missing env var, bad config, can't reach the DB)?
2. **Exit code**: \`docker inspect\` or the ECS stopped reason. **137 = OOM-killed** (raise the memory limit or fix the leak), **1** = app error, **143** = SIGTERM.
3. **Health check**: the app may be fine but **failing the health check** (wrong path, wrong port, too short a grace period), so the orchestrator kills it.
4. **Dependencies**: DB or Redis not ready, wrong security group, secret not loaded.
5. **Resources**: CPU throttling causing slow startup, disk full.

Then run the image locally with the same env to reproduce.`,
      variants: [
        { label: 'Short version', answer: '`docker logs` / CloudWatch, exit code (137 = OOM), failing health check, missing env vars.' },
      ],
      analogy: `A car that stalls every time it starts: check the dashboard error (logs), whether it's running out of fuel (memory), or whether the mechanic keeps switching it off because a sensor reads wrong (health check).`,
      quickRevision: [
        'Read logs first',
        'Exit code: 137 OOM, 1 app error, 143 SIGTERM',
        'Failing health check (path/port/grace period)',
        'Missing env/secrets, unreachable dependencies',
      ],
      followUps: [
        'How do you set a health-check grace period on ECS?',
        'How do you debug OOM in Node?',
      ],
    },
    {
      id: 'a-secret-was-committed-to-git',
      question: 'A secret was committed to git. What do you do?',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['ci-cd'],
      answer: `Assume it's **compromised** the moment it was pushed. Bots scan public repos within minutes.

1. **Rotate or revoke it immediately**: generate a new key, update it in the secrets manager, redeploy, and disable the old one. This is the step that actually protects you.
2. **Check for misuse**: provider logs, CloudTrail, unexpected charges.
3. **Remove it from history** (\`git filter-repo\` or BFG), force-push, and ask collaborators to re-clone. Remember forks and caches may still have it, which is why rotation comes first.
4. **Prevent it happening again**: \`.gitignore\` for \`.env\`, **secret scanning and push protection** on GitHub, pre-commit hooks (gitleaks), and secrets only in a manager.`,
      variants: [
        { label: 'Short version', answer: 'Rotate it immediately, remove it from history, add secret scanning.' },
      ],
      analogy: `If you posted your house key on social media, deleting the post doesn't help: you change the locks first, then delete the post, then stop carrying keys that way.`,
      quickRevision: [
        'Rotate/revoke immediately (most important)',
        'Check logs for misuse',
        'Purge history, force-push',
        'Push protection, gitleaks, .gitignore',
      ],
      followUps: [
        'Why isn\'t deleting the commit enough?',
        'How does GitHub push protection work?',
      ],
    },
    {
      id: 'zero-downtime-db-migration',
      question: 'How do you run a database migration with zero downtime?',
      perspective: 'scenario',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['sql'],
      answer: `During a rolling deploy, **old and new code run at the same time**, so every schema change must work with **both versions**. The pattern is **expand → migrate → contract**. For renaming a column:

1. **Expand**: add the new column (nullable, no lock-heavy defaults).
2. Deploy code that **writes to both** the old and new columns.
3. **Backfill** existing rows in **batches**, to avoid long locks.
4. Deploy code that **reads from the new** column.
5. Stop writing to the old one.
6. **Contract**: drop the old column in a later release.

Also: add indexes **concurrently** (\`CREATE INDEX CONCURRENTLY\` in Postgres), avoid long transactions, test the migration on a production-sized copy, and keep each step reversible.`,
      variants: [
        { label: 'Short version', answer: `Expand → migrate data → switch code → contract (backward-compatible steps). Example of renaming a column: add the new column → write to both → backfill → read from the new one → stop writing the old one → drop it.` },
      ],
      analogy: `Moving a shop to a new address without closing: open the new location, send stock to both, redirect customers gradually, and only close the old shop once nobody goes there.`,
      quickRevision: [
        'Old + new code run together',
        'Expand → migrate → contract',
        'Dual-write, batch backfill, switch reads',
        'Drop old column in a later release',
        'CREATE INDEX CONCURRENTLY',
      ],
      followUps: [
        'How do you add a NOT NULL column to a large table safely?',
        'How do you roll back mid-migration?',
      ],
    },
    {
      id: 'the-disk-is-full-on-the-server',
      question: 'The disk is full on a production server. What do you do?',
      perspective: 'scenario',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['linux-networking'],
      answer: `1. **Confirm**: \`df -h\` (and \`df -i\` for inodes).
2. **Find the cause**: \`du -sh /* 2>/dev/null | sort -h\`, then drill down. It's usually **logs** (\`/var/log\`, Docker container logs) or **Docker images and volumes**.
3. **Free space safely**: \`docker system prune\` (check what it removes), clear old logs or \`journalctl --vacuum-size=500M\`, and remove old release folders.
4. Watch for **deleted files still held open** by a process (\`lsof +L1\`): the space isn't freed until that process restarts.
5. **Prevent it**: **log rotation** (logrotate, Docker \`max-size\`/\`max-file\`), image cleanup in deploys, and a **disk > 80% alert**.`,
      variants: [
        { label: 'Short version', answer: `\`df -h\` to confirm, \`du -sh /* | sort -h\` to find the cause (usually logs or Docker images). Clean with \`docker system prune\` and rotate logs (logrotate, Docker log \`max-size\`). Add a disk alert.` },
      ],
      analogy: `A cupboard that won't close: find what's taking the space (usually old receipts, meaning logs), throw them out, and set a rule to clear receipts every month.`,
      quickRevision: [
        'df -h (and df -i)',
        'du -sh … | sort -h to find it',
        'Usually logs or Docker images',
        'Deleted-but-open files: lsof +L1',
        'logrotate, Docker log limits, 80% alert',
      ],
      followUps: [
        'Why didn\'t deleting a big log file free space?',
        'How do you limit Docker log size?',
      ],
    },
    {
      id: 'the-site-is-slow-only-sometimes',
      question: 'The site is slow only sometimes. How do you investigate?',
      perspective: 'scenario',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['linux-networking'],
      answer: `Intermittent slowness needs **data over time**, not one-off testing:

1. Look at **p95/p99 latency** graphs and find **when** it happens. Is there a pattern: time of day, after deploys, specific endpoints, specific users or regions?
2. **Correlate** those times with: **traffic spikes**, **cron or batch jobs** and backups, **slow DB queries** (slow query log, lock waits), cache expirations (stampedes), **GC pauses** or event-loop lag, autoscaling events, a **noisy neighbour** or CPU credits running out (burstable instances), or a slow third-party API.
3. Use **traces** of slow requests to see which span is slow.
4. Fix the cause: move batch jobs off-peak, add indexes, warm caches, add capacity, or put timeouts on the dependency. Then confirm the p99 improved.`,
      variants: [
        { label: 'Short version', answer: `Check metrics at those times: traffic spikes, cron jobs, DB slow queries, GC pauses, a noisy neighbour. Correlate with logs and traces.` },
      ],
      analogy: `A commute that's only slow some days: you check a log of trip times and spot that it's always slow on bin-collection day (a cron job), not that the car is broken.`,
      quickRevision: [
        'Look at p95/p99 over time',
        'Find the pattern (time, endpoint, deploy)',
        'Correlate: traffic, cron, slow queries, GC, cache expiry, CPU credits',
        'Trace slow requests; fix + verify',
      ],
      followUps: [
        'What are T-instance CPU credits?',
        'How do you detect event-loop lag in Node?',
      ],
    },
  ],
});
