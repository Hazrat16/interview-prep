import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('backend/devops-questions.md', {
  // ---------------------------------------------------------------- 1. Docker
  'container-vs-vm': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `A **VM** virtualises **hardware**: each VM runs a **full guest OS** with its own kernel on a hypervisor. It's strongly isolated, but heavy (GBs of disk, minutes to boot).

A **container** virtualises the **operating system**: containers **share the host kernel** and are isolated with **namespaces** (what a process can see: PIDs, network, filesystem) and **cgroups** (what it can use: CPU, memory). They're lightweight (MBs), **start in seconds** and pack densely, so they're ideal for shipping the same app everywhere.

The trade-off is weaker isolation than a VM. In the cloud the two are combined: containers running on VMs (EC2 or Fargate).`,
    analogy: 'VMs are separate houses, each with its own foundation and plumbing; containers are flats in one building sharing the foundation (kernel) but with their own locked doors (namespaces) and utility limits (cgroups).',
    quickRevision: ['VM: full guest OS + hypervisor, strong isolation, heavy', 'Container: shares host kernel, light, fast', 'Namespaces = isolation, cgroups = limits', 'Usually containers on top of VMs'],
    followUps: ['What are namespaces and cgroups?', 'Can a Linux container run on Windows?', 'When would you still choose a VM?'],
  },
  'image-vs-container': { sameAs: 'faq/docker-images-multistage' },
  'multi-stage-build-why': { sameAs: 'faq/docker-images-multistage' },
  'reduce-image-size': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Smaller images pull and deploy faster, cost less to store and have **fewer vulnerabilities**. What I do:

- **Multi-stage builds**: compile in a builder stage, copy only \`dist\` and production \`node_modules\` into the final stage.
- A **slim base** (\`node:22-slim\`, alpine, or distroless).
- \`npm ci --omit=dev\` and a clean npm cache.
- A **\`.dockerignore\`** for \`node_modules\`, \`.git\`, tests and \`.env\`.
- **Fewer, combined layers** that clean up within the same \`RUN\`.

I check the result with \`docker images\` and \`dive\`, and scan it with **Trivy** in CI.`,
    analogy: 'Packing hand luggage: take only the clothes you\'ll wear (runtime files), not the sewing machine you used to make them (build tools).',
    quickRevision: ['Multi-stage, copy only artifacts', 'Slim/alpine/distroless base', 'npm ci --omit=dev, .dockerignore', 'Combine RUN layers; scan with Trivy'],
    followUps: ['Alpine pitfalls with native modules (musl)?', 'What is a distroless image?'],
  },
  'layer-caching': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Each Dockerfile instruction creates a **layer**, and Docker reuses a cached layer **until an instruction or its inputs change**. Everything after the first changed layer is rebuilt.

So I order the Dockerfile **from least to most frequently changing**:

1. Base image and system packages.
2. \`COPY package.json package-lock.json ./\`
3. \`RUN npm ci\` (cached until dependencies change).
4. \`COPY . .\` (changes every commit).
5. Build.

That way a code change doesn't reinstall all dependencies. In CI I also enable **BuildKit cache** (\`cache-from\`/\`cache-to\`, GitHub Actions cache) so the cache survives between runs.`,
    analogy: 'Baking: if you only change the icing, you don\'t re-bake the cake. Put the things that rarely change (the cake) first, and the frequently changed bits (icing) last.',
    quickRevision: ['Layers are cached until inputs change', 'Copy lockfile → install → copy source', 'Least-changing steps first', 'BuildKit cache in CI'],
    followUps: ['Why does `COPY . .` before `npm ci` slow builds?', 'How do you cache layers in GitHub Actions?'],
  },
  'cmd-vs-entrypoint': {
    difficulty: 'medium',
    answer: `- **ENTRYPOINT** defines the **executable** that always runs (\`ENTRYPOINT ["node"]\`).
- **CMD** provides **default arguments**, or a default command if there's no entrypoint (\`CMD ["dist/server.js"]\`).

\`docker run image other.js\` **replaces CMD** but keeps the ENTRYPOINT. Common patterns: just \`CMD ["node", "dist/server.js"]\` for apps, or an ENTRYPOINT script that runs migrations or setup and then \`exec "$@"\`.

Use the **exec (JSON array) form** so the process runs as PID 1 and **receives signals** like SIGTERM. The shell form wraps it in \`/bin/sh\`, which swallows signals and breaks graceful shutdown.`,
    analogy: 'ENTRYPOINT is the machine (a coffee maker); CMD is the default button pressed on it (espresso), which you can change at run time (latte) without swapping the machine.',
    quickRevision: ['ENTRYPOINT: fixed executable', 'CMD: default args, overridable at run', 'Use exec/JSON form for signals', 'Entrypoint scripts end with exec "$@"'],
    followUps: ['Why does shell form break graceful shutdown?', 'What is tini / --init for?'],
  },
  'copy-vs-add': {
    difficulty: 'easy',
    answer: `Both copy files into the image, but **\`ADD\` also auto-extracts local tar archives and can download from URLs**. That "magic" makes builds less predictable and can pull unverified remote content.

Best practice is to **use \`COPY\`** for normal files and only use \`ADD\` when you specifically want tar extraction. For remote files, use \`curl\` or \`wget\` in a \`RUN\` step (so you can verify checksums), or a multi-stage download.`,
    analogy: 'COPY is a mover who carries boxes as they are; ADD is a mover who also unpacks boxes and fetches things from other addresses without asking, which is handy occasionally but surprising by default.',
    quickRevision: ['Prefer COPY', 'ADD extracts tars + fetches URLs', 'Remote files: curl + checksum in RUN'],
    followUps: ['Why is ADD with URLs discouraged?', 'How do you use `COPY --from` in multi-stage builds?'],
  },
  'run-as-non-root': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `By default, processes in a container run as **root**. If the app is compromised, the attacker has root inside the container, which makes **container escape** and damage to mounted volumes far easier.

So I set \`USER node\` (the official Node images include that user) after installing dependencies, make sure the app's files are owned by that user (\`COPY --chown=node:node\`), and listen on a **port above 1024**. In Kubernetes, \`runAsNonRoot: true\` and a read-only root filesystem enforce it. Image scanners like Trivy flag root containers.`,
    analogy: 'Giving a temporary worker a visitor badge instead of the master key: if their badge is stolen, the thief can\'t open every door in the building.',
    quickRevision: ['Default is root → bigger blast radius', 'USER node; COPY --chown', 'Ports > 1024', 'K8s: runAsNonRoot, read-only FS'],
    followUps: ['Why can\'t a non-root user bind port 80?', 'What else hardens a container?'],
  },
  'docker-compose': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Docker Compose defines a **multi-container setup in one YAML file**: services (the app, Postgres or Mongo, Redis), **networks** (services reach each other by name, like \`postgres:5432\`), **volumes** for data, environment variables, ports, and **health-check-based \`depends_on\`**.

I use it for:

- **local development**: one command (\`docker compose up\`) starts the whole stack, with bind mounts for hot reload;
- **integration tests in CI**: a real database for tests. My Jenkins inventory project runs **PostgreSQL integration tests and a 100-request concurrency test** in Compose;
- simple **single-server deployments**.

For production at scale I'd use ECS or Kubernetes.`,
    analogy: 'A recipe card for the whole meal, not just one dish: it lists every pot (service), how they connect, and the order to start them.',
    quickRevision: ['One YAML: services, networks, volumes, env', 'Services reach each other by name', 'Local dev + CI integration tests', 'depends_on with healthchecks'],
    followUps: ['Why does `depends_on` not wait for the DB to be ready by default?', 'Compose vs Kubernetes?'],
  },
  'volumes-vs-bind-mounts': {
    difficulty: 'easy',
    answer: `Container filesystems are **ephemeral**: data is lost when the container is removed. To keep data:

- **Named volumes**: **managed by Docker** (stored in Docker's area, portable, with good performance on Mac and Windows). Used for **persistent data** like database files.
- **Bind mounts**: map a **specific host path** into the container. Used in **development** so code edits on the host trigger hot reload, or to mount config files.

Production databases usually run as managed services (RDS, Atlas) rather than on volumes.`,
    analogy: 'A volume is a storage unit the building manages for you; a bind mount is running an extension cord directly from your own flat into the container.',
    quickRevision: ['Container FS is ephemeral', 'Volumes: Docker-managed, persistent data', 'Bind mounts: host path, dev hot reload', 'Prod DBs → managed services'],
    followUps: ['How do you back up a Docker volume?', 'What is a tmpfs mount?'],
  },
  // ---------------------------------------------------------------- 2. CI/CD
  'ci-vs-cd-delivery-vs-deployment': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `- **Continuous Integration**: every change is merged often and automatically **built and tested** (lint, type-check, tests), so problems surface early.
- **Continuous Delivery**: every change that passes is **always deployable**, and releasing to production is a **manual decision** (a button or an approval).
- **Continuous Deployment**: every passing change **goes to production automatically**, with no human gate.

My SmartJobHub pipeline is continuous **delivery**: it deploys to staging automatically, then the **same image** goes to production after manual approval.`,
    analogy: 'CI is checking every ingredient as it arrives; continuous delivery is always having the dish ready to serve when the customer asks; continuous deployment is serving each dish the moment it\'s ready.',
    quickRevision: ['CI: build + test every change', 'Delivery: always deployable, manual release', 'Deployment: automatic to production', 'Mine: auto to staging, approval to prod'],
    followUps: ['What do you need before you can do continuous deployment?', 'What are feature flags for?'],
  },
  'walk-through-your-pipeline': { sameAs: 'faq/cicd-pipeline-zero-downtime' },
  'secrets-in-ci': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- Store secrets in **GitHub encrypted secrets**, scoped to **environments** (staging, production) with protection rules, so production secrets are only available to approved deployments.
- For cloud access, use **OIDC**: the workflow gets a short-lived token and **assumes an AWS IAM role** restricted to that repo and branch. **No long-lived access keys** are stored anywhere. That's how SmartJobHub deploys.
- Pass secrets to apps at **runtime** from a secrets manager (AWS Secrets Manager referenced by the ECS task), not baked into images.
- Never \`echo\` secrets (GitHub masks them, but don't rely on that). Be careful with \`pull_request_target\` and forks, and pin third-party actions to a SHA.`,
    analogy: 'Instead of giving the delivery driver a permanent copy of your house key, you issue a one-time code that only works today, only for the front door, and only for that driver (OIDC).',
    quickRevision: ['GitHub secrets scoped to environments', 'OIDC → assume IAM role, no static keys', 'Runtime secrets from Secrets Manager, not in images', 'Pin actions; careful with forks'],
    followUps: ['How does OIDC trust work between GitHub and AWS?', 'How do you rotate CI secrets?'],
  },
  'staging-to-production-promotion': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `I **build the image once**, tag it with the **commit SHA**, and **promote that exact image** from staging to production. I don't rebuild for production, because a rebuild could pick up different dependencies or base images, so what you tested wouldn't be what you ship.

Flow: merge → build and push \`app:<sha>\` → deploy to **staging** → migrations + smoke tests → **manual approval** (a GitHub environment with required reviewers) → deploy the **same tag** to production → smoke tests and health checks. Configuration differs only through **environment variables and secrets**, not the image.`,
    analogy: 'A car tested on the track is the exact car delivered to the customer, not a new one built from the same blueprint afterwards.',
    quickRevision: ['Build once, tag by SHA', 'Promote the same image', 'Staging → smoke tests → approval → prod', 'Env differences via config only'],
    followUps: ['Why not use `latest` tags?', 'How do you handle DB migrations during promotion?'],
  },
  rollback: {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Rollback should be **fast and boring**:

- **Redeploy the previous image tag** (by SHA). It already exists in the registry, so it takes a minute.
- **Automatic rollback**: the **ECS deployment circuit breaker** (or Kubernetes rollout checks) rolls back if new tasks fail health checks. I use it in SmartJobHub.
- **Database migrations** must be **backward compatible** (expand → migrate → contract), so the old code still works with the new schema and rolling back code doesn't need a DB rollback.
- **Feature flags** let you switch off a broken feature without redeploying.

After rolling back, investigate and write a short postmortem.`,
    analogy: 'Keeping yesterday\'s printed menu in the drawer: if today\'s dish goes wrong, you put the old menu back in seconds instead of rewriting it from memory.',
    quickRevision: ['Redeploy previous SHA tag', 'ECS circuit breaker auto-rollback', 'Backward-compatible migrations', 'Feature flags as a kill switch'],
    followUps: ['What if the migration already dropped a column?', 'How do you decide to roll back vs fix forward?'],
  },
  'deployment-strategies': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Recreate**: stop the old version, start the new one. Simple, but has **downtime**.
- **Rolling**: replace instances **gradually**, with health checks. No downtime, and it's the ECS and Kubernetes default. Old and new versions run side by side for a while, so changes must be compatible.
- **Blue/green**: run a full **new environment (green)** next to the old one (blue), test it, then **switch traffic** at the load balancer. Rollback is instant (switch back), but it needs double the resources during the switch.
- **Canary**: send a **small percentage** of traffic (say 5%) to the new version, watch metrics, then increase. Lowest risk, but needs good monitoring and traffic splitting.`,
    analogy: 'Changing a restaurant\'s menu: close and reopen (recreate), change one table at a time (rolling), open an identical restaurant next door and move everyone over (blue/green), or let a few tables taste first (canary).',
    quickRevision: ['Recreate: downtime', 'Rolling: gradual, needs compatibility', 'Blue/green: instant switch + rollback, 2× resources', 'Canary: small % first + metrics'],
    followUps: ['Which would you use for a risky payment change?', 'How do DB migrations work with blue/green?'],
  },
  'speed-up-slow-pipelines': {
    difficulty: 'medium',
    answer: `First I **measure** which steps are slow. Then:

- **cache dependencies** (\`actions/setup-node\` with npm cache) and **Docker layers** (BuildKit with the GitHub Actions cache);
- **run jobs in parallel** (lint, type-check, unit tests and build at the same time) and **shard** long test suites;
- **run only what changed**: path filters, affected projects in monorepos (Turborepo or Nx caching);
- use \`concurrency\` to **cancel outdated runs** on the same branch;
- keep the slow E2E and security scans for main or nightly runs, with fast checks on every PR;
- bigger runners if needed.`,
    analogy: 'Speeding up a car wash: don\'t rewash clean parts (caching), use several bays at once (parallel jobs), and skip the waxing for cars that only need a rinse (affected-only).',
    quickRevision: ['Measure first', 'Cache deps + Docker layers', 'Parallelise and shard tests', 'Path filters / affected-only', 'Cancel superseded runs'],
    followUps: ['How does Turborepo remote caching work?', 'What would you run on PRs vs nightly?'],
  },
  // ---------------------------------------------------------------- 3. AWS
  'vpc-basics': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `A **VPC** is your private network in AWS (a CIDR block like \`10.0.0.0/16\`), split into **subnets across availability zones** for high availability:

- **Public subnets** have a route to an **Internet Gateway**. They hold the **load balancer** (and NAT gateways).
- **Private subnets** have no direct inbound internet. They hold **app containers and databases**, and reach out (for updates or APIs) through a **NAT Gateway**.
- **Route tables** decide where traffic goes, and **security groups** decide what's allowed.
- **VPC endpoints** let private resources reach S3 or ECR without going through NAT, which also saves cost.

My SmartJobHub Terraform builds exactly this: ALB in public subnets, ECS Fargate and ElastiCache in private subnets.`,
    analogy: 'A gated business park: the reception building faces the street (public subnet + load balancer), offices are inside the gates (private subnets), and staff go out through a single guarded exit (NAT gateway).',
    quickRevision: ['VPC = private network (CIDR)', 'Public subnets → Internet Gateway (ALB)', 'Private subnets → NAT for outbound (apps, DBs)', 'Multi-AZ; route tables; VPC endpoints'],
    followUps: ['Why put the database in a private subnet?', 'Why are NAT Gateways expensive and how do you reduce cost?'],
  },
  'security-group-vs-nacl': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Security groups** attach to **resources** (ENIs: EC2, ECS tasks, RDS). They're **stateful** (return traffic is automatically allowed) and have **allow rules only**. They can reference **other security groups**: "the DB accepts 5432 only from the app's security group". This is the main tool.
- **Network ACLs** apply at the **subnet** level. They're **stateless** (you must allow return traffic, including ephemeral ports), have **allow and deny** rules evaluated in number order, and act as a coarse extra layer, e.g. blocking an IP range.`,
    analogy: 'A security group is the bouncer at each room\'s door who remembers who went in; a NACL is the checkpoint at the building\'s entrance that checks everyone both ways and has a blacklist.',
    quickRevision: ['SG: resource-level, stateful, allow-only', 'SGs can reference other SGs', 'NACL: subnet-level, stateless, allow + deny', 'NACL needs ephemeral ports for return traffic'],
    followUps: ['How would you lock down an RDS instance?', 'When would you actually use a NACL?'],
  },
  'ecs-vs-eks-vs-ec2-vs-lambda': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **EC2**: virtual machines where **you manage everything** (OS, patching, scaling). Maximum control. I used it for a Jenkins pipeline and the Doctor Appointment app with Ansible.
- **ECS**: AWS's own **container orchestrator**. It's simpler than Kubernetes, and with **Fargate** there are no servers to manage. A great default for containerised web apps (SmartJobHub runs on ECS Fargate).
- **EKS**: **managed Kubernetes**. Use it when you need the Kubernetes ecosystem or portability, or already have k8s skills. More power, more complexity and cost.
- **Lambda**: **functions** triggered by events or HTTP, scaling to zero and **paid per request**, but with **time limits** (15 minutes) and cold starts. Great for glue code, webhooks and spiky workloads.`,
    analogy: 'EC2 is renting an empty flat and furnishing it yourself; ECS/Fargate is a serviced apartment; EKS is a full apartment complex you manage with a powerful but complex system; Lambda is a hotel room by the hour.',
    quickRevision: ['EC2: full control, full responsibility', 'ECS (+Fargate): simple containers, no servers', 'EKS: Kubernetes power + complexity', 'Lambda: per-request, time limits, cold starts'],
    followUps: ['When would you move from ECS to EKS?', 'How do you deal with Lambda cold starts?'],
  },
  'why-fargate': {
    difficulty: 'easy',
    answer: `With **Fargate**, I define CPU and memory **per task** and AWS runs the containers. **No EC2 instances to provision, patch or scale**, no cluster capacity planning, and each task is isolated. That's less operational work for a small team, which is why I used it for SmartJobHub.

Trade-offs: **higher cost per vCPU/GB** than well-utilised EC2, **less control** (no host access, no daemonsets, limited GPU support), and slightly slower task start-up. For large, steady workloads, EC2-backed ECS with reserved or spot capacity can be cheaper.`,
    analogy: 'Taking a taxi instead of owning a car: no maintenance or parking to worry about, but each kilometre costs more if you drive a lot every day.',
    quickRevision: ['No servers to manage; pay per task', 'Good for small teams / variable load', 'More expensive per unit than EC2', 'Less control (no host access)'],
    followUps: ['How would you cut Fargate costs?', 'Fargate Spot: when is it OK?'],
  },
  alb: {
    difficulty: 'easy',
    answer: `The **Application Load Balancer** works at **Layer 7 (HTTP)**:

- **routing rules** by **path** (\`/api/*\` to the API service) and **host** (\`admin.example.com\`);
- **health checks**, sending traffic only to healthy targets (ECS tasks, EC2, IPs);
- **TLS termination** with ACM certificates;
- support for **WebSockets** and HTTP/2, and sticky sessions if needed;
- integration with **WAF**.

It spreads traffic across instances in multiple AZs. For raw TCP or UDP and very high performance you'd use an NLB instead.`,
    analogy: 'A smart receptionist who reads each visitor\'s request ("I\'m here for accounts") and sends them to the right, available office, skipping anyone who\'s out sick (health checks).',
    quickRevision: ['Layer 7: path/host routing', 'Health checks per target group', 'TLS termination (ACM)', 'WebSockets, sticky sessions; WAF', 'NLB for TCP/UDP'],
    followUps: ['ALB vs NLB?', 'How do health checks interact with rolling deploys?'],
  },
  'iam-best-practice': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Least privilege**: grant only the specific actions and resources needed (\`s3:PutObject\` on one bucket, not \`s3:*\`).
- **Roles over users**: services (ECS task roles, Lambda) and CI (**OIDC**) assume roles with **temporary credentials**. Avoid long-lived access keys.
- **Never use the root account** day to day. Lock it with **MFA**. Use MFA and SSO for humans.
- Separate **environments and accounts** (dev, staging, prod), and use **permission boundaries** or SCPs for guardrails.
- **Audit**: CloudTrail, IAM Access Analyzer, and removing unused permissions.`,
    analogy: 'Hotel keycards: each guest\'s card opens only their room and the gym for the length of their stay (least privilege, temporary), and the master key is locked in the manager\'s safe (root).',
    quickRevision: ['Least privilege', 'Roles + temporary creds (task roles, OIDC)', 'No root use; MFA everywhere', 'Separate accounts/envs; audit with CloudTrail'],
    followUps: ['ECS task role vs execution role?', 'How do you find over-permissive policies?'],
  },
  's3--cloudfront': {
    difficulty: 'easy',
    answer: `For a static site or SPA: upload the build to a **private S3 bucket** and put **CloudFront** (the CDN) in front:

- CloudFront caches files at **edge locations** near users, so it's fast and cheap;
- **Origin Access Control (OAC)** lets only CloudFront read the bucket, which stays private;
- HTTPS with an ACM certificate and a custom domain;
- cache headers: **long cache for hashed assets**, short or no cache for \`index.html\`;
- for SPAs, map 403/404 to \`index.html\` so client-side routes work;
- **invalidate** \`index.html\` after deploys.`,
    analogy: 'Keeping your stock in a locked central warehouse (S3) and letting only your own delivery network (CloudFront) take items out to local shops near customers.',
    quickRevision: ['Private S3 + CloudFront CDN', 'OAC so only CloudFront reads the bucket', 'Long cache for hashed assets; short for index.html', 'SPA: rewrite 403/404 to index.html; invalidate on deploy'],
    followUps: ['How do you avoid users getting stale JS after a deploy?', 'OAC vs the old OAI?'],
  },
  scaling: {
    difficulty: 'medium',
    frequency: 'high',
    answer: `On ECS I use **service autoscaling**: **target tracking** on CPU, memory or **ALB requests per target**, with min and max task counts and cooldowns. The prerequisites:

- the app is **stateless**: sessions in Redis, files in S3, sockets via the Redis adapter;
- health checks and graceful shutdown are in place, so scaling in doesn't drop requests;
- the **database can keep up**: connection pooling, read replicas and caching, since scaling the app often just moves the bottleneck to the DB.

Also scale **workers** separately on **queue depth**.`,
    analogy: 'Opening more checkout lanes when the queue grows, which only works if any cashier can serve any customer (stateless) and the stockroom (database) can keep up.',
    quickRevision: ['Target tracking: CPU / memory / requests per target', 'Stateless app first', 'Graceful shutdown for scale-in', 'Watch the DB; scale workers on queue depth'],
    followUps: ['Scaling on CPU vs request count: which is better?', 'Why can autoscaling make a DB outage worse?'],
  },
  'cost-control': {
    difficulty: 'medium',
    answer: `- **Visibility**: AWS **Budgets and alerts** (I set them up for SmartJobHub), Cost Explorer, and tagging resources by project and environment.
- **Right-size**: match CPU and memory to real usage, and scale to zero or **turn off dev and staging** out of hours.
- **Watch the hidden costs**: **NAT Gateway** processing, **data transfer**, idle load balancers, old snapshots, unattached volumes and log retention.
- **Pricing models**: Savings Plans or reserved capacity for steady load, **Spot** for fault-tolerant work.
- **Architecture**: CDN caching, VPC endpoints instead of NAT for S3 and ECR, and lifecycle rules for S3.`,
    analogy: 'Managing a household budget: track spending by category (tags), switch off lights in empty rooms (dev envs), and check the sneaky monthly subscriptions (NAT, data transfer).',
    quickRevision: ['Budgets + alerts, tagging, Cost Explorer', 'Right-size; turn off non-prod', 'NAT, data transfer, idle resources, logs', 'Savings Plans / Spot; VPC endpoints'],
    followUps: ['Why is NAT Gateway often a surprise cost?', 'How would you cut a bill by 30% quickly?'],
  },
  // ---------------------------------------------------------------- 4. Terraform & Ansible
  'what-is-iac-and-why': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `**Infrastructure as Code** means defining servers, networks, databases and permissions in **code files** (Terraform, CloudFormation) instead of clicking in the console. Benefits:

- **repeatable**: create identical staging and production environments;
- **reviewable**: infrastructure changes go through PRs, and \`plan\` shows exactly what will change;
- **versioned**: history, blame and rollback;
- **no manual drift** and documented infrastructure;
- **faster recovery**: rebuild an environment from code.

In SmartJobHub the whole AWS platform (VPC, ALB, ECS, ElastiCache, Secrets Manager, CloudFront) is Terraform modules, with matching staging and production environments.`,
    analogy: 'A recipe instead of cooking from memory: anyone can reproduce the exact same dish, changes are written down and reviewed, and you can always go back to last week\'s version.',
    quickRevision: ['Infra defined in code', 'Repeatable, reviewable, versioned', 'Plan shows changes before apply', 'No click-ops drift; fast rebuilds'],
    followUps: ['Terraform vs CloudFormation vs CDK?', 'How do you test infrastructure code?'],
  },
  'terraform-state': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Terraform's **state** file maps the resources in my code to the **real resources** in AWS (IDs, attributes). Terraform compares config, state and reality to work out what to change.

Best practices:

- store it **remotely** (an S3 bucket with versioning and encryption) so the team and CI share it;
- use **state locking** (DynamoDB, or S3's native lock file) so two applies can't run at once;
- keep **separate state per environment**;
- **never edit it by hand**: use \`terraform state mv\`/\`rm\` or \`import\` blocks;
- treat it as **sensitive**, since it can contain secrets.`,
    analogy: 'An inventory ledger for a warehouse: it records which shelf holds which item. If two people edit it at once or someone scribbles in it by hand, the warehouse and the ledger stop matching.',
    quickRevision: ['Maps code → real resources', 'Remote S3 backend + versioning + encryption', 'Locking prevents concurrent applies', 'Separate per env; never hand-edit; sensitive'],
    followUps: ['What happens if two people apply at the same time without locking?', 'How do you import an existing resource?'],
  },
  'plan-vs-apply': {
    difficulty: 'easy',
    answer: `- **\`terraform plan\`** compares code, state and reality, and **shows what would change**: create (+), update (~), **destroy (-)** or replace. It changes nothing.
- **\`terraform apply\`** **executes** the changes (optionally applying a saved plan file, so exactly what was reviewed gets applied).

In a team workflow, CI runs **plan on the PR** and posts the output for review. After approval and merge, **apply** runs from CI. I always check for **unexpected destroys or replacements** (for example a database being replaced) before approving.`,
    analogy: 'plan is the builder\'s quote listing every change to your house; apply is actually doing the work. You read the quote before saying yes, especially any line that says "demolish".',
    quickRevision: ['plan: preview, no changes', 'apply: execute (ideally a saved plan)', 'Plan in PR, apply after merge from CI', 'Watch for destroy/replace'],
    followUps: ['How do you protect a database from accidental destroy?', 'What does `-replace` do?'],
  },
  modules: {
    difficulty: 'medium',
    answer: `Terraform **modules** are reusable building blocks: a folder of resources with **input variables** and **outputs**, e.g. a \`vpc\` module (subnets, NAT, routes) or an \`ecs-service\` module (task definition, service, autoscaling, ALB target group).

Each environment calls the same modules with **different inputs** (instance sizes, counts, domain names), so staging and production stay **consistent** while differing only where intended. Good modules have a small, clear interface, sensible defaults, pinned provider and module versions, and documentation. I also use well-maintained community modules (\`terraform-aws-modules\`) where they fit.`,
    analogy: 'Prefabricated room kits: the same bathroom kit is installed in every flat, with options for tiles and size, instead of hand-building each bathroom differently.',
    quickRevision: ['Reusable resource groups with inputs/outputs', 'Same modules per env, different variables', 'Small interface, sensible defaults', 'Pin versions'],
    followUps: ['How do you version internal modules?', 'Module outputs: how do other modules use them?'],
  },
  'managing-staging-vs-production': {
    difficulty: 'medium',
    answer: `I keep **separate state per environment**, usually as **separate directories** (\`envs/staging\`, \`envs/prod\`) that call the **same modules** with different \`.tfvars\`. Workspaces are an alternative, but directories make differences explicit and reduce the risk of applying to the wrong environment.

Additionally:

- different **AWS accounts** or at least different roles per environment;
- **production applies need approval** in CI;
- **promote changes** through staging first;
- keep environments as similar as possible, differing mainly in size and scale.`,
    analogy: 'Two identical restaurant kitchens built from the same plans: you trial a new layout in the test kitchen first, and the main kitchen only changes after sign-off.',
    quickRevision: ['Separate state per env', 'Directories + tfvars (or workspaces)', 'Separate accounts/roles; approvals for prod', 'Promote via staging; keep envs similar'],
    followUps: ['Workspaces vs directories: trade-offs?', 'How do you share outputs between environments?'],
  },
  drift: {
    difficulty: 'easy',
    answer: `**Drift** is when real infrastructure **no longer matches the code**, usually because someone changed something manually in the console, or another tool or process did. \`terraform plan\` (or a scheduled \`plan -detailed-exitcode\` in CI) **detects** it as unexpected changes.

To fix it, either **update the code** to match (if the change was right) or **apply** to revert it. To prevent it: lock down console write access, make all changes through PRs, and run drift detection regularly.`,
    analogy: 'Someone moved the furniture in your house without updating the floor plan; the next walkthrough (plan) shows the mismatch, and you either update the plan or move the furniture back.',
    quickRevision: ['Reality ≠ code (manual changes)', 'plan detects it; schedule drift checks', 'Fix: update code or re-apply', 'Prevent: restrict console writes'],
    followUps: ['How would you automate drift detection?', 'What if drift is in an attribute Terraform ignores?'],
  },
  'terraform-vs-ansible': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `They solve different problems and work well together:

- **Terraform** **provisions infrastructure**: VPCs, servers, load balancers, databases, DNS. It's **declarative and stateful**, it knows what exists and plans changes, and it works across cloud APIs.
- **Ansible** **configures servers**: installs packages, writes config files, manages services and users. It's **procedural-ish, agentless (SSH)** and idempotent through its modules, with no state file.

In my Doctor Appointment project, **Terraform** created the VPC, security groups and EC2 instances, and **Ansible roles** set up Docker, Nginx as a reverse proxy, and TLS. With containers on managed platforms, Ansible matters less, because the image is the configuration.`,
    analogy: 'Terraform builds the house (walls, plumbing, wiring); Ansible furnishes and maintains it (installs appliances, sets the thermostat).',
    quickRevision: ['Terraform: provision infra, declarative, state', 'Ansible: configure servers, SSH, agentless', 'Used both in Doctor Appointment project', 'Containers reduce the need for config management'],
    followUps: ['What makes an Ansible task idempotent?', 'Could Terraform do configuration management?'],
  },
  // ---------------------------------------------------------------- 5. Kubernetes
  'pod--deployment--service': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Pod**: the smallest unit. One or more containers that **share a network namespace and volumes**. Pods are **ephemeral** and get replaced, with new IPs.
- **Deployment**: declares the **desired state** ("3 replicas of image v2"). It manages ReplicaSets, does **rolling updates and rollbacks**, and replaces failed pods.
- **Service**: a **stable virtual IP and DNS name** in front of a changing set of pods (selected by labels), with load balancing between them. Types: **ClusterIP** (internal), **NodePort**, and **LoadBalancer** (a cloud LB).

My EKS project deployed a two-tier app with namespace, Deployment and Service manifests.`,
    analogy: 'Pods are individual waiters (they come and go), the Deployment is the manager keeping exactly three waiters on shift, and the Service is the restaurant\'s phone number that always reaches whichever waiter is available.',
    quickRevision: ['Pod: containers sharing network/volumes, ephemeral', 'Deployment: replicas, rolling updates, self-healing', 'Service: stable IP/DNS, label selector', 'ClusterIP / NodePort / LoadBalancer'],
    followUps: ['Why not create pods directly?', 'How does a Service find its pods?'],
  },
  ingress: {
    difficulty: 'medium',
    answer: `An **Ingress** defines **HTTP(S) routing rules** from outside the cluster to Services: by **host** (\`api.example.com\`) and **path** (\`/api\` → api-service, \`/\` → web-service), with TLS. It needs an **ingress controller** to work, such as **NGINX Ingress** or the **AWS Load Balancer Controller**, which provisions an ALB.

It lets **one load balancer** front many services instead of one LoadBalancer Service per app. Newer clusters may use the **Gateway API**, the successor with richer routing.`,
    analogy: 'The building\'s front desk that reads the address on each visitor\'s note and directs them to the right company\'s floor, rather than every company having its own street entrance.',
    quickRevision: ['HTTP routing by host/path + TLS', 'Needs an ingress controller', 'One LB for many services', 'Gateway API is the successor'],
    followUps: ['Ingress vs LoadBalancer Service?', 'How does cert-manager issue TLS certificates?'],
  },
  'configmap-vs-secret': {
    difficulty: 'easy',
    answer: `Both inject configuration into pods as **environment variables or mounted files**:

- **ConfigMap**: **non-sensitive** config (feature flags, URLs, app settings).
- **Secret**: **sensitive** values (passwords, API keys, TLS certs). By default Secrets are only **base64-encoded, not encrypted**, so you should enable **encryption at rest** (KMS), restrict access with **RBAC**, and ideally pull from an external store (AWS Secrets Manager via the External Secrets Operator or the CSI driver).

Changes to env-var config usually need a **pod restart** to take effect.`,
    analogy: 'A ConfigMap is a notice on the staff noticeboard; a Secret is an envelope marked "confidential", but by default the envelope is only folded (base64), not locked, so you need a proper safe (KMS, external secrets).',
    quickRevision: ['ConfigMap: non-sensitive config', 'Secret: sensitive, but base64 ≠ encryption', 'Enable encryption at rest + RBAC', 'External secrets for real secret stores'],
    followUps: ['How do you rotate a secret without downtime?', 'Env vars vs mounted files?'],
  },
  'liveness-vs-readiness-probe': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **Readiness probe**: "can this pod **accept traffic right now**?" If it fails, Kubernetes **removes the pod from the Service endpoints** but doesn't restart it. Use it during startup, warm-up, or when a dependency is temporarily unavailable. It's essential for **zero-downtime rolling updates**.
- **Liveness probe**: "is this pod **stuck or broken**?" If it fails, Kubernetes **restarts the container**. Use it for deadlocks or hung processes.
- **Startup probe**: protects slow-starting apps from being killed by liveness checks too early.

A common mistake is making **liveness depend on the database**: if the DB blips, every pod restarts in a loop. Keep liveness checks shallow.`,
    analogy: 'Readiness is a shop\'s "open/closed" sign: closed for a moment means customers go elsewhere. Liveness is checking whether the shopkeeper has fainted, in which case you send in someone new (restart).',
    quickRevision: ['Readiness fail → no traffic (no restart)', 'Liveness fail → restart container', 'Startup probe for slow boots', "Don't make liveness depend on the DB"],
    followUps: ['What should a health endpoint check?', 'How do probes relate to ALB health checks on ECS?'],
  },
  'how-do-you-scale': {
    difficulty: 'medium',
    answer: `Two levels:

- **Pods**: the **Horizontal Pod Autoscaler (HPA)** adds or removes replicas based on CPU or memory, or on **custom metrics** (requests per second, queue length via KEDA). It needs **resource requests** set on containers. The **VPA** adjusts requests and limits.
- **Nodes**: the **Cluster Autoscaler** or **Karpenter** adds nodes when pods can't be scheduled and removes them when they're underused.

Plus **PodDisruptionBudgets** to keep enough replicas during node changes, and, as always, a stateless app and a database that can handle the extra load.`,
    analogy: 'More cashiers (pods) when the queue grows, and opening another store floor (nodes) when there\'s no room for more cashiers.',
    quickRevision: ['HPA: replicas on CPU/memory/custom metrics', 'Requests must be set', 'Cluster Autoscaler / Karpenter for nodes', 'KEDA for queue-based scaling; PDBs'],
    followUps: ['Why does HPA need resource requests?', 'Karpenter vs Cluster Autoscaler?'],
  },
  // ---------------------------------------------------------------- 6. Linux, networking & observability
  'what-happens-when-you-type-a-url': { sameAs: 'frontend/react-interview-questions/what-happens-when-you-type-a-url' },
  'http-vs-https': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `**HTTPS** is HTTP sent over **TLS**. It gives three guarantees:

1. **Encryption**: nobody on the network (public Wi-Fi, ISPs) can read the traffic.
2. **Integrity**: data can't be modified in transit without detection.
3. **Authentication**: the **certificate** proves you're talking to the real domain, not an impostor.

It's required for cookies with \`Secure\`, HTTP/2 in browsers, service workers and many browser APIs. I add **HSTS** to force HTTPS and redirect HTTP → HTTPS at the load balancer or Nginx.`,
    analogy: 'HTTP is a postcard anyone handling it can read or alter; HTTPS is a sealed, tamper-evident envelope with the sender\'s verified ID.',
    quickRevision: ['HTTPS = HTTP over TLS', 'Encryption, integrity, authentication', 'Needed for Secure cookies, HTTP/2, SW', 'HSTS + redirect HTTP→HTTPS'],
    followUps: ['What does HSTS protect against?', 'Where would you terminate TLS?'],
  },
  'how-does-a-tls-certificate-work': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `The server presents a **certificate** containing its **public key** and **domain name**, **signed by a Certificate Authority**. The browser:

1. checks the **signature chain** up to a **trusted root CA** in its trust store;
2. checks the **domain matches**, the certificate **hasn't expired**, and it isn't revoked;
3. completes the **TLS handshake**: the two sides agree on a shared **session key** using key exchange (ECDHE), then use fast symmetric encryption.

**Let's Encrypt** gives free certificates with **automatic renewal** (certbot, or ACM on AWS). I set these up with certbot and Nginx in my EC2 projects, plus an alert before expiry.`,
    analogy: 'A passport: issued by a trusted government (CA), with your photo and name (domain + public key); the border officer (browser) checks the stamp is genuine and not expired before letting you in.',
    quickRevision: ['Cert = public key + domain, signed by a CA', 'Browser verifies chain, domain, expiry', 'Handshake agrees a session key (ECDHE)', "Let's Encrypt/ACM auto-renew; alert on expiry"],
    followUps: ['Symmetric vs asymmetric encryption in TLS?', 'What happens if a certificate expires?'],
  },
  'http11-vs-http2': {
    difficulty: 'medium',
    answer: `- **HTTP/1.1**: one request at a time per connection (head-of-line blocking), so browsers open about 6 connections per domain, and we used tricks like bundling and sprite sheets. Headers are sent as plain text every time.
- **HTTP/2**: **multiplexes** many requests over **one TCP connection**, adds **header compression** (HPACK) and stream prioritisation, and uses a binary framing layer. It's much faster for pages with many assets.
- **HTTP/3** runs over **QUIC (UDP)**, which removes TCP-level head-of-line blocking and makes connection setup faster, which especially helps on mobile networks.`,
    analogy: 'HTTP/1.1 is a single-lane road where cars wait behind each other; HTTP/2 is many lanes on the same road; HTTP/3 rebuilds the road so a breakdown in one lane doesn\'t block the others.',
    quickRevision: ['1.1: one request per connection at a time', '2: multiplexing + header compression', '3: QUIC over UDP, no TCP HOL blocking', 'Bundling tricks matter less on h2'],
    followUps: ['Does HTTP/2 make bundling unnecessary?', 'What is head-of-line blocking?'],
  },
  'tcp-vs-udp': {
    difficulty: 'easy',
    answer: `- **TCP**: **connection-oriented** (a three-way handshake), **reliable** (retransmits lost packets), **ordered**, with flow and congestion control. Used by HTTP/1–2, databases, SSH and email, anything that needs every byte correct.
- **UDP**: **connectionless**, **no delivery or order guarantees**, minimal overhead and **low latency**. Used for DNS lookups, video calls, live streaming, games, and as the base for **QUIC/HTTP/3**, which adds reliability on top.`,
    analogy: 'TCP is registered post with tracking and signatures; UDP is shouting across a room: much faster, and if a word is missed you just carry on.',
    quickRevision: ['TCP: handshake, reliable, ordered', 'UDP: no guarantees, low latency', 'TCP for HTTP/DB/SSH', 'UDP for DNS, video, games, QUIC'],
    followUps: ['What is the TCP three-way handshake?', 'Why does DNS mostly use UDP?'],
  },
  'nginx-as-a-reverse-proxy': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Clients connect to **Nginx**, which **forwards requests** to the Node app (\`proxy_pass http://app:3000\`). Why put it in front:

- **TLS termination** (certificates live in one place);
- **serving static files** and caching efficiently;
- **gzip/brotli compression**, request size limits and timeouts;
- **load balancing** across several app instances;
- **rate limiting** and blocking bad traffic;
- **hiding the app servers** (they aren't exposed directly).

I configured environment-specific Nginx for **staging and production at Firmwide**. One lesson from there: AI **streaming responses** broke in production until I **disabled proxy buffering** for that route.`,
    analogy: 'A receptionist in front of the offices: handles security checks, hands out brochures (static files), and forwards visitors to whichever staff member is free.',
    quickRevision: ['proxy_pass to the app', 'TLS termination, static files, compression', 'Load balancing, rate limiting, timeouts', 'Disable buffering for streaming/SSE'],
    followUps: ['Why did streaming break behind Nginx?', 'What headers should you forward (X-Forwarded-For)?'],
  },
  'nginx-config-for-websockets': {
    difficulty: 'medium',
    answer: `WebSockets start as an HTTP request with an \`Upgrade\` header, and Nginx doesn't pass hop-by-hop headers by default. So the location needs:

\`\`\`nginx
location /socket.io/ {
  proxy_pass http://app;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_read_timeout 3600s;   # don't kill idle sockets after 60s
}
\`\`\`

With several app instances, add **sticky sessions** (\`ip_hash\`) if long-polling is enabled, and use the **Socket.IO Redis adapter**.`,
    analogy: 'Telling the receptionist that when a visitor asks to "upgrade to a private line", they must actually connect the call and keep it open, not hang up after a minute.',
    quickRevision: ['proxy_http_version 1.1', 'Forward Upgrade + Connection "upgrade"', 'Longer proxy_read_timeout', 'Sticky sessions for long-polling; Redis adapter'],
    followUps: ['Why do idle WebSockets get disconnected after 60 seconds?', 'Same issue on an AWS ALB?'],
  },
  'check-running-processes--resources': {
    difficulty: 'easy',
    answer: `My quick health check on a Linux server:

- \`top\` / \`htop\`: CPU, memory and the top processes live;
- \`ps aux --sort=-%mem | head\`: biggest processes;
- \`free -m\`: memory and swap;
- \`df -h\`: **disk usage per filesystem** (a full disk breaks everything);
- \`du -sh /var/* | sort -h\`: what's using the space;
- \`uptime\`: **load average**;
- \`docker stats\` for containers;
- \`iostat\`, \`vmstat\` for disk and IO pressure.`,
    analogy: 'A quick check-up at the doctor: pulse (CPU), blood pressure (memory), weight (disk), and stress level (load average) before deeper tests.',
    quickRevision: ['top/htop, ps aux', 'free -m (memory)', 'df -h / du -sh (disk)', 'uptime (load), docker stats'],
    followUps: ['What does a high load average with low CPU usually mean?', 'How do you spot a memory leak on a server?'],
  },
  'which-process-is-using-a-port': {
    difficulty: 'easy',
    answer: `\`ss -tulpn | grep :3000\` (or the older \`netstat -tulpn\`) lists listening TCP and UDP sockets with the **PID and program name**. \`lsof -i :3000\` gives the same information. Then \`ps -fp <PID>\` shows the full command, and \`kill <PID>\` (or \`systemctl stop\`) frees it. With Docker, check \`docker ps\` for a container publishing the port. Typical cause: an old dev server or container still running, giving **EADDRINUSE**.`,
    analogy: 'Checking which car is parked in your reserved space by reading its number plate (PID), then asking the owner to move it.',
    quickRevision: ['ss -tulpn | grep :PORT', 'lsof -i :PORT', 'ps -fp PID for details', 'docker ps for published ports'],
    followUps: ['What does EADDRINUSE mean?', 'Why might you need sudo to see the PID?'],
  },
  'view-logs': {
    difficulty: 'easy',
    answer: `- **systemd services**: \`journalctl -u nginx -f\` (follow), \`--since "10 min ago"\`, \`-p err\`;
- **log files**: \`tail -f /var/log/nginx/error.log\`, \`less +F\`, and \`grep\` for errors;
- **containers**: \`docker logs -f --tail 200 <container>\` (or \`docker compose logs -f api\`);
- **AWS**: **CloudWatch Logs** (Logs Insights queries), or Loki and Grafana in my SmartJobHub setup.

I filter by **request ID** or a timestamp around the incident.`,
    analogy: 'Different diaries for different staff: you open the right one (service, container, cloud) and flip to the time of the incident.',
    quickRevision: ['journalctl -u svc -f', 'tail -f / grep log files', 'docker logs -f --tail', 'CloudWatch / Loki; filter by request ID'],
    followUps: ['How do you stop logs filling the disk?', 'How would you search logs across many instances?'],
  },
  'manage-services': {
    difficulty: 'easy',
    answer: `With **systemd**: \`systemctl status nginx\` (is it running, recent logs), \`start\`/\`stop\`/\`restart\`, \`reload\` (re-read config without dropping connections, after \`nginx -t\`), \`enable\` (start on boot), and \`daemon-reload\` after editing unit files.

A custom unit file for a Node app defines \`ExecStart\`, \`User\`, \`Restart=always\` and the environment. In containerised setups, Docker or the orchestrator does this job instead.`,
    analogy: 'systemctl is the building manager\'s control panel: check whether a machine is on, restart it, and set it to switch on automatically every morning.',
    quickRevision: ['systemctl status/start/stop/restart', 'reload after config test (nginx -t)', 'enable = start on boot', 'Unit file: ExecStart, User, Restart=always'],
    followUps: ['reload vs restart?', 'Write a systemd unit for a Node app.'],
  },
  'file-permissions': {
    difficulty: 'easy',
    answer: `Each file has permissions for **owner, group and others**, each with **r (4), w (2), x (1)**.

- \`chmod 644 file\` means owner read/write, others read-only (typical for files).
- \`chmod 755 dir\` means owner full, others read and execute (typical for directories and scripts).
- \`chmod 600 key.pem\` means only the owner can read it, which SSH requires for private keys.
- \`chown user:group file\` changes ownership. \`ls -l\` shows the current permissions.

In containers I make sure app files are owned by the non-root \`node\` user.`,
    analogy: 'House rules for three groups of people: the owner, the family, and visitors, each allowed to look (r), rearrange (w), or use the appliances (x).',
    quickRevision: ['owner / group / others', 'r=4, w=2, x=1', '644 files, 755 dirs/scripts, 600 private keys', 'chown user:group; ls -l to inspect'],
    followUps: ['Why does SSH reject a private key with 644?', 'What is the sticky bit?'],
  },
  'find-text-in-files': {
    difficulty: 'easy',
    answer: `\`grep -rn "ERROR" /var/log/app/\`: recursive, with line numbers. Useful flags: \`-i\` (ignore case), \`-l\` (only filenames), \`-C 3\` (context lines), \`-E\` (regex), \`--include="*.log"\`. Combine with pipes: \`grep -c\` to count, or \`… | sort | uniq -c | sort -rn | head\` to find the most frequent errors. \`ripgrep\` (\`rg\`) is faster on big codebases. For compressed logs, use \`zgrep\`.`,
    analogy: 'Ctrl+F for the whole filing cabinet at once, with notes on which page and line each match is on.',
    quickRevision: ['grep -rn pattern path', '-i, -l, -C, -E, --include', 'Pipe to sort | uniq -c for top errors', 'rg for speed; zgrep for .gz'],
    followUps: ['Count the top 5 IPs in an Nginx access log.', 'How do you search logs from the last hour only?'],
  },
  'debug-the-server-is-down': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `I go from the outside in, and **mitigate first** if users are affected:

1. **Confirm**: \`curl\` the health endpoint from outside, check DNS, and check whether it's everyone or one region.
2. **Recent change?** If something was just deployed, **roll back** first and investigate after.
3. **Is it running?** \`systemctl status\`, \`docker ps\` (restarting?), ECS task events.
4. **Logs**: app, Nginx and system logs, plus exit codes (137 = OOM-killed).
5. **Resources**: **disk full** (\`df -h\`), memory/OOM, CPU, file descriptors.
6. **Dependencies**: database, Redis, third-party APIs (timeouts?).
7. **Network**: security groups, ports, TLS certificate expiry, load balancer target health.

Then fix it, verify, communicate, and write a short postmortem with an alert or test to prevent it happening again.`,
    analogy: 'A power cut at home: first check whether it\'s just your house or the whole street (scope), whether you just plugged in something new (recent deploy), then the fuse box (process), then the wiring (dependencies).',
    quickRevision: ['Confirm scope (curl, DNS, region)', 'Recent deploy → roll back first', 'Process status, logs, exit codes', 'Disk/memory/CPU, dependencies, network/TLS', 'Postmortem + new alert'],
    followUps: ['Exit code 137 means what?', 'How do you communicate during an incident?'],
  },
  'metrics-vs-logs-vs-traces': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `The three pillars of observability:

- **Metrics**: **numbers over time** (request rate, error rate, p95 latency, CPU). They're cheap to store and great for **dashboards and alerts**, telling you **that** something is wrong.
- **Logs**: **detailed events** with context (structured JSON with a request ID). They're great for **debugging why** a specific thing happened.
- **Traces**: follow **one request across services**, showing each span's timing, so you see **where** the time went (which DB query or external call).

In SmartJobHub I used **Prometheus and Grafana** for metrics, **Loki** for logs, **CloudWatch alarms** and **Sentry** for errors.`,
    analogy: 'Metrics are the car\'s dashboard warning lights, logs are the mechanic\'s detailed service notes, and traces are a GPS recording of one journey showing exactly where you got stuck in traffic.',
    quickRevision: ['Metrics: numbers over time → alerts', 'Logs: detailed events → why', 'Traces: one request across services → where', 'Prometheus/Grafana, Loki, Sentry'],
    followUps: ['How do you correlate a trace with logs?', 'What is OpenTelemetry?'],
  },
  'the-4-golden-signals': {
    difficulty: 'medium',
    answer: `From Google's SRE book, the four signals to monitor for any user-facing service:

1. **Latency**: how long requests take, as **p95/p99**, separately for successful and failed requests.
2. **Traffic**: demand (requests per second, active sockets).
3. **Errors**: the rate of failed requests (5xx, timeouts, wrong results).
4. **Saturation**: how **full** the system is (CPU, memory, DB connections, queue depth), the early warning before latency rises.

I build dashboards and alerts around these rather than around every possible metric.`,
    analogy: 'Checking a motorway: how long journeys take (latency), how many cars (traffic), how many breakdowns (errors), and how close to gridlock the lanes are (saturation).',
    quickRevision: ['Latency (p95/p99)', 'Traffic (RPS)', 'Errors (rate)', 'Saturation (how full resources are)'],
    followUps: ['Why percentiles instead of averages?', 'RED vs USE methods?'],
  },
  'what-alerts-would-you-set-up': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `I alert on **symptoms users feel**, with thresholds that matter and a clear owner:

- **Error rate** above a threshold (e.g. 5xx > 2% for 5 minutes);
- **p95 latency** above the target;
- **health checks** failing or tasks restarting repeatedly;
- **resource saturation**: CPU or memory high for a sustained period, **disk > 80%**, DB connections near the limit;
- **queue backlog** growing, or failed jobs;
- **SSL certificate expiry** (14 days ahead);
- **AWS budget** thresholds.

Alerts go to Slack or email (SNS) with a link to a runbook. In SmartJobHub CloudWatch alarms go to SNS, alongside budget alerts. I avoid noisy alerts, because alert fatigue means real alerts get ignored.`,
    analogy: 'Smoke detectors in the rooms that matter, set to go off for real fires rather than toast, each with a note on the wall saying what to do.',
    quickRevision: ['Error rate, p95 latency, health checks', 'CPU/memory, disk > 80%, DB connections', 'Queue backlog / failed jobs', 'Cert expiry, budget', 'Runbook links; avoid noise'],
    followUps: ['How do you avoid alert fatigue?', 'What belongs in a runbook?'],
  },
  'what-is-load-average': {
    difficulty: 'medium',
    answer: `Load average (from \`uptime\` or \`top\`) is the average number of processes **running or waiting** for CPU (and, on Linux, waiting for uninterruptible IO) over the last **1, 5 and 15 minutes**.

Compare it with the **number of CPU cores**: a load of 4 on a 4-core machine means fully busy. A load of 8 means work is queuing. High load with **low CPU usage** often points to **IO wait** (slow disk or network storage), which you check with \`iostat\` or \`top\`'s \`wa\` column. Reading the trend across the three numbers shows whether it's rising or falling.`,
    analogy: 'The queue at a bank with four cashiers: four people being served is full capacity, eight means four are waiting, and the three numbers show whether the queue is growing or shrinking.',
    quickRevision: ['Avg runnable/waiting processes (1, 5, 15 min)', 'Compare to core count', 'High load + low CPU → IO wait', 'Trend across the three numbers'],
    followUps: ['How do you find the core count?', 'What is iowait?'],
  },
  'what-is-dns-ttl': {
    difficulty: 'easy',
    answer: `**TTL (time to live)** on a DNS record tells resolvers **how long to cache** the answer (in seconds). A high TTL (hours) means fewer lookups and faster responses, but **changes spread slowly**. A low TTL (60s) means changes take effect quickly, with more queries.

Before a **migration** (moving to a new load balancer or IP), I **lower the TTL a day in advance**, do the switch, verify, then raise it again. On AWS, **alias records** to ALBs and CloudFront avoid IP changes entirely.`,
    analogy: 'How long people keep using a saved phone number before checking the directory again: if you\'re about to change numbers, tell everyone to check more often first.',
    quickRevision: ['How long resolvers cache a record', 'High TTL: fast, slow to change', 'Lower TTL before migrations, raise after', 'Route 53 alias records for AWS endpoints'],
    followUps: ['Why do some users still hit the old server after a DNS change?', 'A vs CNAME vs alias records?'],
  },
  // ---------------------------------------------------------------- 7. Scenarios
  'a-deploy-broke-production-what-do-you-do': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `1. **Mitigate first**: **roll back** to the previous image (or switch off the feature flag). Restoring service matters more than finding the cause right now.
2. **Communicate**: tell the team and stakeholders what's happening, the impact, and the next update time.
3. **Verify recovery**: health checks, error rate and latency back to normal.
4. **Investigate**: diff the release, logs, traces and Sentry errors, and reproduce it in staging.
5. **Fix forward** properly, with a test that would have caught it.
6. **Blameless postmortem**: timeline, root cause, why it wasn't caught (missing test, alert, or staging gap), and action items.`,
    analogy: 'If a new dish makes customers ill, you take it off the menu immediately (rollback), tell staff and customers, and only then investigate the recipe in the test kitchen.',
    quickRevision: ['Roll back / flag off first', 'Communicate impact + updates', 'Verify recovery with metrics', 'Investigate, fix forward with a test', 'Blameless postmortem'],
    followUps: ['When would you fix forward instead of rolling back?', 'What if the deploy included a migration?'],
  },
  'the-container-keeps-restarting': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Check **why it exits**:

1. **Logs**: \`docker logs <container>\` or the ECS task's CloudWatch logs. Is it a crash on startup (missing env var, bad config, can't reach the DB)?
2. **Exit code**: \`docker inspect\` or the ECS stopped reason. **137 = OOM-killed** (raise the memory limit or fix the leak), **1** = app error, **143** = SIGTERM.
3. **Health check**: the app may be fine but **failing the health check** (wrong path, wrong port, too short a grace period), so the orchestrator kills it.
4. **Dependencies**: DB or Redis not ready, wrong security group, secret not loaded.
5. **Resources**: CPU throttling causing slow startup, disk full.

Then run the image locally with the same env to reproduce.`,
    analogy: 'A car that stalls every time it starts: check the dashboard error (logs), whether it\'s running out of fuel (memory), or whether the mechanic keeps switching it off because a sensor reads wrong (health check).',
    quickRevision: ['Read logs first', 'Exit code: 137 OOM, 1 app error, 143 SIGTERM', 'Failing health check (path/port/grace period)', 'Missing env/secrets, unreachable dependencies'],
    followUps: ['How do you set a health-check grace period on ECS?', 'How do you debug OOM in Node?'],
  },
  'a-secret-was-committed-to-git': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Assume it's **compromised** the moment it was pushed. Bots scan public repos within minutes.

1. **Rotate or revoke it immediately**: generate a new key, update it in the secrets manager, redeploy, and disable the old one. This is the step that actually protects you.
2. **Check for misuse**: provider logs, CloudTrail, unexpected charges.
3. **Remove it from history** (\`git filter-repo\` or BFG), force-push, and ask collaborators to re-clone. Remember forks and caches may still have it, which is why rotation comes first.
4. **Prevent it happening again**: \`.gitignore\` for \`.env\`, **secret scanning and push protection** on GitHub, pre-commit hooks (gitleaks), and secrets only in a manager.`,
    analogy: 'If you posted your house key on social media, deleting the post doesn\'t help: you change the locks first, then delete the post, then stop carrying keys that way.',
    quickRevision: ['Rotate/revoke immediately (most important)', 'Check logs for misuse', 'Purge history, force-push', 'Push protection, gitleaks, .gitignore'],
    followUps: ['Why isn\'t deleting the commit enough?', 'How does GitHub push protection work?'],
  },
  'zero-downtime-db-migration': {
    difficulty: 'hard',
    frequency: 'high',
    answer: `During a rolling deploy, **old and new code run at the same time**, so every schema change must work with **both versions**. The pattern is **expand → migrate → contract**. For renaming a column:

1. **Expand**: add the new column (nullable, no lock-heavy defaults).
2. Deploy code that **writes to both** the old and new columns.
3. **Backfill** existing rows in **batches**, to avoid long locks.
4. Deploy code that **reads from the new** column.
5. Stop writing to the old one.
6. **Contract**: drop the old column in a later release.

Also: add indexes **concurrently** (\`CREATE INDEX CONCURRENTLY\` in Postgres), avoid long transactions, test the migration on a production-sized copy, and keep each step reversible.`,
    analogy: 'Moving a shop to a new address without closing: open the new location, send stock to both, redirect customers gradually, and only close the old shop once nobody goes there.',
    quickRevision: ['Old + new code run together', 'Expand → migrate → contract', 'Dual-write, batch backfill, switch reads', 'Drop old column in a later release', 'CREATE INDEX CONCURRENTLY'],
    followUps: ['How do you add a NOT NULL column to a large table safely?', 'How do you roll back mid-migration?'],
  },
  'the-disk-is-full-on-the-server': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `1. **Confirm**: \`df -h\` (and \`df -i\` for inodes).
2. **Find the cause**: \`du -sh /* 2>/dev/null | sort -h\`, then drill down. It's usually **logs** (\`/var/log\`, Docker container logs) or **Docker images and volumes**.
3. **Free space safely**: \`docker system prune\` (check what it removes), clear old logs or \`journalctl --vacuum-size=500M\`, and remove old release folders.
4. Watch for **deleted files still held open** by a process (\`lsof +L1\`): the space isn't freed until that process restarts.
5. **Prevent it**: **log rotation** (logrotate, Docker \`max-size\`/\`max-file\`), image cleanup in deploys, and a **disk > 80% alert**.`,
    analogy: 'A cupboard that won\'t close: find what\'s taking the space (usually old receipts, meaning logs), throw them out, and set a rule to clear receipts every month.',
    quickRevision: ['df -h (and df -i)', 'du -sh … | sort -h to find it', 'Usually logs or Docker images', 'Deleted-but-open files: lsof +L1', 'logrotate, Docker log limits, 80% alert'],
    followUps: ['Why didn\'t deleting a big log file free space?', 'How do you limit Docker log size?'],
  },
  'the-site-is-slow-only-sometimes': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Intermittent slowness needs **data over time**, not one-off testing:

1. Look at **p95/p99 latency** graphs and find **when** it happens. Is there a pattern: time of day, after deploys, specific endpoints, specific users or regions?
2. **Correlate** those times with: **traffic spikes**, **cron or batch jobs** and backups, **slow DB queries** (slow query log, lock waits), cache expirations (stampedes), **GC pauses** or event-loop lag, autoscaling events, a **noisy neighbour** or CPU credits running out (burstable instances), or a slow third-party API.
3. Use **traces** of slow requests to see which span is slow.
4. Fix the cause: move batch jobs off-peak, add indexes, warm caches, add capacity, or put timeouts on the dependency. Then confirm the p99 improved.`,
    analogy: 'A commute that\'s only slow some days: you check a log of trip times and spot that it\'s always slow on bin-collection day (a cron job), not that the car is broken.',
    quickRevision: ['Look at p95/p99 over time', 'Find the pattern (time, endpoint, deploy)', 'Correlate: traffic, cron, slow queries, GC, cache expiry, CPU credits', 'Trace slow requests; fix + verify'],
    followUps: ['What are T-instance CPU credits?', 'How do you detect event-loop lag in Node?'],
  },
  'how-would-you-set-up-cicd-for-a-new-project': { sameAs: 'faq/cicd-pipeline-zero-downtime' },
});
