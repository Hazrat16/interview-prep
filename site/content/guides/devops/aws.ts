import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'AWS',
  description: 'EC2, S3, Lambda, IAM, VPC and choosing the right service.',
  questions: [
    {
      id: 'vpc-basics',
      question: 'VPC basics?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['aws'],
      answer: `A **VPC** is your private network in AWS (a CIDR block like \`10.0.0.0/16\`), split into **subnets across availability zones** for high availability:

- **Public subnets** have a route to an **Internet Gateway**. They hold the **load balancer** (and NAT gateways).
- **Private subnets** have no direct inbound internet. They hold **app containers and databases**, and reach out (for updates or APIs) through a **NAT Gateway**.
- **Route tables** decide where traffic goes, and **security groups** decide what's allowed.
- **VPC endpoints** let private resources reach S3 or ECR without going through NAT, which also saves cost.

My SmartJobHub Terraform builds exactly this: ALB in public subnets, ECS Fargate and ElastiCache in private subnets.`,
      variants: [
        { label: 'Short version', answer: `A private network with public subnets (route to an Internet Gateway) and private subnets (outbound via a NAT Gateway), spread across AZs.` },
      ],
      analogy: `A gated business park: the reception building faces the street (public subnet + load balancer), offices are inside the gates (private subnets), and staff go out through a single guarded exit (NAT gateway).`,
      quickRevision: [
        'VPC = private network (CIDR)',
        'Public subnets → Internet Gateway (ALB)',
        'Private subnets → NAT for outbound (apps, DBs)',
        'Multi-AZ; route tables; VPC endpoints',
      ],
      followUps: [
        'Why put the database in a private subnet?',
        'Why are NAT Gateways expensive and how do you reduce cost?',
      ],
    },
    {
      id: 'security-group-vs-nacl',
      question: 'Security group vs NACL?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['auth-security', 'aws'],
      answer: `- **Security groups** attach to **resources** (ENIs: EC2, ECS tasks, RDS). They're **stateful** (return traffic is automatically allowed) and have **allow rules only**. They can reference **other security groups**: "the DB accepts 5432 only from the app's security group". This is the main tool.
- **Network ACLs** apply at the **subnet** level. They're **stateless** (you must allow return traffic, including ephemeral ports), have **allow and deny** rules evaluated in number order, and act as a coarse extra layer, e.g. blocking an IP range.`,
      variants: [
        { label: 'Short version', answer: `SGs are stateful, attach to an instance or ENI, and only have allow rules. NACLs are stateless, apply at subnet level, and have allow and deny rules.` },
      ],
      analogy: `A security group is the bouncer at each room's door who remembers who went in; a NACL is the checkpoint at the building's entrance that checks everyone both ways and has a blacklist.`,
      quickRevision: [
        'SG: resource-level, stateful, allow-only',
        'SGs can reference other SGs',
        'NACL: subnet-level, stateless, allow + deny',
        'NACL needs ephemeral ports for return traffic',
      ],
      followUps: [
        'How would you lock down an RDS instance?',
        'When would you actually use a NACL?',
      ],
    },
    {
      id: 'ecs-vs-eks-vs-ec2-vs-lambda',
      question: 'ECS vs EKS vs EC2 vs Lambda?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['aws'],
      answer: `- **EC2**: virtual machines where **you manage everything** (OS, patching, scaling). Maximum control. I used it for a Jenkins pipeline and the Doctor Appointment app with Ansible.
- **ECS**: AWS's own **container orchestrator**. It's simpler than Kubernetes, and with **Fargate** there are no servers to manage. A great default for containerised web apps (SmartJobHub runs on ECS Fargate).
- **EKS**: **managed Kubernetes**. Use it when you need the Kubernetes ecosystem or portability, or already have k8s skills. More power, more complexity and cost.
- **Lambda**: **functions** triggered by events or HTTP, scaling to zero and **paid per request**, but with **time limits** (15 minutes) and cold starts. Great for glue code, webhooks and spiky workloads.`,
      variants: [
        { label: 'Short version', answer: `EC2: you manage servers. ECS: AWS-native containers (Fargate is serverless). EKS: managed Kubernetes. Lambda: functions with time limits, pay per request.` },
      ],
      analogy: `EC2 is renting an empty flat and furnishing it yourself; ECS/Fargate is a serviced apartment; EKS is a full apartment complex you manage with a powerful but complex system; Lambda is a hotel room by the hour.`,
      quickRevision: [
        'EC2: full control, full responsibility',
        'ECS (+Fargate): simple containers, no servers',
        'EKS: Kubernetes power + complexity',
        'Lambda: per-request, time limits, cold starts',
      ],
      followUps: [
        'When would you move from ECS to EKS?',
        'How do you deal with Lambda cold starts?',
      ],
    },
    {
      id: 'why-fargate',
      question: 'Why Fargate?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['aws'],
      answer: `With **Fargate**, I define CPU and memory **per task** and AWS runs the containers. **No EC2 instances to provision, patch or scale**, no cluster capacity planning, and each task is isolated. That's less operational work for a small team, which is why I used it for SmartJobHub.

Trade-offs: **higher cost per vCPU/GB** than well-utilised EC2, **less control** (no host access, no daemonsets, limited GPU support), and slightly slower task start-up. For large, steady workloads, EC2-backed ECS with reserved or spot capacity can be cheaper.`,
      variants: [
        { label: 'Short version', answer: 'No servers to manage, pay per task. It costs more per unit and gives less control than EC2.' },
      ],
      analogy: `Taking a taxi instead of owning a car: no maintenance or parking to worry about, but each kilometre costs more if you drive a lot every day.`,
      quickRevision: [
        'No servers to manage; pay per task',
        'Good for small teams / variable load',
        'More expensive per unit than EC2',
        'Less control (no host access)',
      ],
      followUps: [
        'How would you cut Fargate costs?',
        'Fargate Spot: when is it OK?',
      ],
    },
    {
      id: 'alb',
      question: 'ALB?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['aws'],
      answer: `The **Application Load Balancer** works at **Layer 7 (HTTP)**:

- **routing rules** by **path** (\`/api/*\` to the API service) and **host** (\`admin.example.com\`);
- **health checks**, sending traffic only to healthy targets (ECS tasks, EC2, IPs);
- **TLS termination** with ACM certificates;
- support for **WebSockets** and HTTP/2, and sticky sessions if needed;
- integration with **WAF**.

It spreads traffic across instances in multiple AZs. For raw TCP or UDP and very high performance you'd use an NLB instead.`,
      variants: [
        { label: 'Short version', answer: 'Layer 7 load balancer: path and host routing, health checks, TLS termination, WebSocket support.' },
      ],
      analogy: `A smart receptionist who reads each visitor's request ("I'm here for accounts") and sends them to the right, available office, skipping anyone who's out sick (health checks).`,
      quickRevision: [
        'Layer 7: path/host routing',
        'Health checks per target group',
        'TLS termination (ACM)',
        'WebSockets, sticky sessions; WAF',
        'NLB for TCP/UDP',
      ],
      followUps: [
        'ALB vs NLB?',
        'How do health checks interact with rolling deploys?',
      ],
    },
    {
      id: 'iam-best-practice',
      question: 'IAM best practice?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['aws'],
      answer: `- **Least privilege**: grant only the specific actions and resources needed (\`s3:PutObject\` on one bucket, not \`s3:*\`).
- **Roles over users**: services (ECS task roles, Lambda) and CI (**OIDC**) assume roles with **temporary credentials**. Avoid long-lived access keys.
- **Never use the root account** day to day. Lock it with **MFA**. Use MFA and SSO for humans.
- Separate **environments and accounts** (dev, staging, prod), and use **permission boundaries** or SCPs for guardrails.
- **Audit**: CloudTrail, IAM Access Analyzer, and removing unused permissions.`,
      variants: [
        { label: 'Short version', answer: 'Least privilege, roles instead of users, no root usage, MFA.' },
      ],
      analogy: `Hotel keycards: each guest's card opens only their room and the gym for the length of their stay (least privilege, temporary), and the master key is locked in the manager's safe (root).`,
      quickRevision: [
        'Least privilege',
        'Roles + temporary creds (task roles, OIDC)',
        'No root use; MFA everywhere',
        'Separate accounts/envs; audit with CloudTrail',
      ],
      followUps: [
        'ECS task role vs execution role?',
        'How do you find over-permissive policies?',
      ],
    },
    {
      id: 's3-cloudfront',
      question: 'S3 + CloudFront?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['aws'],
      answer: `For a static site or SPA: upload the build to a **private S3 bucket** and put **CloudFront** (the CDN) in front:

- CloudFront caches files at **edge locations** near users, so it's fast and cheap;
- **Origin Access Control (OAC)** lets only CloudFront read the bucket, which stays private;
- HTTPS with an ACM certificate and a custom domain;
- cache headers: **long cache for hashed assets**, short or no cache for \`index.html\`;
- for SPAs, map 403/404 to \`index.html\` so client-side routes work;
- **invalidate** \`index.html\` after deploys.`,
      variants: [
        { label: 'Short version', answer: `Static assets or SPA hosting on S3 with the CloudFront CDN in front. Use OAC to keep the bucket private.` },
      ],
      analogy: `Keeping your stock in a locked central warehouse (S3) and letting only your own delivery network (CloudFront) take items out to local shops near customers.`,
      quickRevision: [
        'Private S3 + CloudFront CDN',
        'OAC so only CloudFront reads the bucket',
        'Long cache for hashed assets; short for index.html',
        'SPA: rewrite 403/404 to index.html; invalidate on deploy',
      ],
      followUps: [
        'How do you avoid users getting stale JS after a deploy?',
        'OAC vs the old OAI?',
      ],
    },
    {
      id: 'scaling',
      question: 'Scaling?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['aws', 'system-design'],
      answer: `On ECS I use **service autoscaling**: **target tracking** on CPU, memory or **ALB requests per target**, with min and max task counts and cooldowns. The prerequisites:

- the app is **stateless**: sessions in Redis, files in S3, sockets via the Redis adapter;
- health checks and graceful shutdown are in place, so scaling in doesn't drop requests;
- the **database can keep up**: connection pooling, read replicas and caching, since scaling the app often just moves the bottleneck to the DB.

Also scale **workers** separately on **queue depth**.`,
      variants: [
        { label: 'Short version', answer: 'ECS service autoscaling on CPU, memory or request count. Stateless apps, sessions in Redis.' },
      ],
      analogy: `Opening more checkout lanes when the queue grows, which only works if any cashier can serve any customer (stateless) and the stockroom (database) can keep up.`,
      quickRevision: [
        'Target tracking: CPU / memory / requests per target',
        'Stateless app first',
        'Graceful shutdown for scale-in',
        'Watch the DB; scale workers on queue depth',
      ],
      followUps: [
        'Scaling on CPU vs request count: which is better?',
        'Why can autoscaling make a DB outage worse?',
      ],
    },
    {
      id: 'cost-control',
      question: 'Cost control?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['aws'],
      answer: `- **Visibility**: AWS **Budgets and alerts** (I set them up for SmartJobHub), Cost Explorer, and tagging resources by project and environment.
- **Right-size**: match CPU and memory to real usage, and scale to zero or **turn off dev and staging** out of hours.
- **Watch the hidden costs**: **NAT Gateway** processing, **data transfer**, idle load balancers, old snapshots, unattached volumes and log retention.
- **Pricing models**: Savings Plans or reserved capacity for steady load, **Spot** for fault-tolerant work.
- **Architecture**: CDN caching, VPC endpoints instead of NAT for S3 and ECR, and lifecycle rules for S3.`,
      variants: [
        { label: 'Short version', answer: `Budgets and alerts, right-sizing, turn off dev environments, watch NAT Gateway and data transfer costs.` },
      ],
      analogy: `Managing a household budget: track spending by category (tags), switch off lights in empty rooms (dev envs), and check the sneaky monthly subscriptions (NAT, data transfer).`,
      quickRevision: [
        'Budgets + alerts, tagging, Cost Explorer',
        'Right-size; turn off non-prod',
        'NAT, data transfer, idle resources, logs',
        'Savings Plans / Spot; VPC endpoints',
      ],
      followUps: [
        'Why is NAT Gateway often a surprise cost?',
        'How would you cut a bill by 30% quickly?',
      ],
    },
  ],
});
