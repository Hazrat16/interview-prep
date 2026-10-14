# DevOps & Cloud Interview Questions

Asked in full-stack interviews when your CV mentions Docker, CI/CD and AWS, and in depth for the DevOps CV.

---

## 1. Docker

| Question | Short answer |
|----------|--------------|
| Container vs VM? | Containers share the host kernel and isolate processes (namespaces, cgroups). They're lightweight and start in seconds. VMs have a full guest OS. |
| Image vs container? | An image is a read-only layered template. A container is a running instance of it with a writable layer. |
| Multi-stage build: why? | Build in one stage (dev deps, compiler) and copy only the output into a small runtime image. Smaller and more secure. |
| Reduce image size? | Slim or alpine base, multi-stage, `.dockerignore`, `npm ci --omit=dev`, combine layers. |
| Layer caching? | Copy `package*.json` and install **before** copying source, so dependencies are cached until they change. |
| `CMD` vs `ENTRYPOINT`? | ENTRYPOINT is the fixed executable. CMD gives default args and can be overridden. |
| `COPY` vs `ADD`? | Prefer COPY. ADD also extracts tar files and fetches URLs. |
| Run as non-root? | `USER node`. It reduces the damage if the container is compromised. |
| Docker Compose? | Defines a multi-container local setup (app + DB + Redis) with networks and volumes. |
| Volumes vs bind mounts? | Volumes are managed by Docker and used for persistent data. Bind mounts map a host path and are used for dev hot reload. |

## 2. CI/CD (GitHub Actions)

| Question | Short answer |
|----------|--------------|
| CI vs CD (delivery vs deployment)? | CI: build and test every change. Continuous delivery: always deployable, release is manual. Continuous deployment: every passing change goes to production automatically. |
| Walk through your pipeline | PR: lint → type-check → test → build → security scan (CodeQL, Trivy). Merge or tag: build image → push (ECR/GHCR) → deploy staging → approval → production → smoke test. |
| Secrets in CI? | GitHub encrypted secrets / environments. Use **OIDC** to assume an AWS role, with no long-lived keys. |
| Staging-to-production promotion? | Promote the **same image** (tagged by commit SHA), don't rebuild. Use a manual approval environment. |
| Rollback? | Redeploy the previous image tag. ECS deployment circuit breaker auto-rollback. Keep migrations backward compatible. |
| Deployment strategies? | Rolling, blue/green (switch traffic between two environments), canary (a small percentage first), recreate. |
| Speed up slow pipelines? | Dependency caching, parallel jobs, Docker layer cache, run only affected tests. |

## 3. AWS

| Question | Short answer |
|----------|--------------|
| VPC basics? | A private network with public subnets (route to an Internet Gateway) and private subnets (outbound via a NAT Gateway), spread across AZs. |
| Security group vs NACL? | SGs are stateful, attach to an instance or ENI, and only have allow rules. NACLs are stateless, apply at subnet level, and have allow and deny rules. |
| ECS vs EKS vs EC2 vs Lambda? | EC2: you manage servers. ECS: AWS-native containers (Fargate is serverless). EKS: managed Kubernetes. Lambda: functions with time limits, pay per request. |
| Why Fargate? | No servers to manage, pay per task. It costs more per unit and gives less control than EC2. |
| ALB? | Layer 7 load balancer: path and host routing, health checks, TLS termination, WebSocket support. |
| IAM best practice? | Least privilege, roles instead of users, no root usage, MFA. |
| S3 + CloudFront? | Static assets or SPA hosting on S3 with the CloudFront CDN in front. Use OAC to keep the bucket private. |
| Scaling? | ECS service autoscaling on CPU, memory or request count. Stateless apps, sessions in Redis. |
| Cost control? | Budgets and alerts, right-sizing, turn off dev environments, watch NAT Gateway and data transfer costs. |

## 4. Terraform & Ansible

| Question | Short answer |
|----------|--------------|
| What is IaC and why? | Infrastructure defined in code: repeatable, reviewable, versioned, no manual drift. |
| Terraform state? | It maps config to real resources. Store it remotely (S3) with locking (DynamoDB or S3 native locking). Never edit it by hand. |
| `plan` vs `apply`? | Plan previews the changes. Apply executes them. Review the plan in the PR. |
| Modules? | Reusable components (VPC, ECS service) with inputs and outputs, called per environment. |
| Managing staging vs production? | Separate state per environment (directories or workspaces) and env-specific variable files. |
| Drift? | Real infrastructure changed outside Terraform. `plan` detects it. |
| Terraform vs Ansible? | Terraform provisions infrastructure (declarative, stateful). Ansible configures servers (packages, files, services). You used both. |

## 5. Kubernetes basics

| Question | Short answer |
|----------|--------------|
| Pod / Deployment / Service? | A Pod holds one or more containers. A Deployment manages ReplicaSets and rolling updates. A Service gives a stable network endpoint (ClusterIP, NodePort, LoadBalancer). |
| Ingress? | HTTP routing into the cluster through an ingress controller. |
| ConfigMap vs Secret? | Config versus sensitive data (Secrets are base64, not encrypted by default). |
| Liveness vs readiness probe? | Liveness failing means restart the container. Readiness failing means remove it from the Service until ready. |
| How do you scale? | HPA on CPU or custom metrics. Cluster autoscaler or Karpenter for nodes. |

## 6. Linux, networking & observability

| Question | Short answer |
|----------|--------------|
| What happens when you type a URL? | **DNS** resolves the domain to an IP (browser cache → OS → resolver → root/TLD/authoritative) → **TCP** handshake → **TLS** handshake (certificate check, key exchange) → **HTTP** request → load balancer → server → response → the browser parses HTML, loads CSS and JS, and renders. |
| HTTP vs HTTPS? | HTTPS is HTTP over TLS: encrypted, server identity verified by a certificate, and tamper-proof. |
| How does a TLS certificate work? | The server presents a certificate signed by a trusted CA. The browser verifies the chain and domain, then they agree on a session key. Let's Encrypt provides free certificates with automatic renewal (certbot). |
| HTTP/1.1 vs HTTP/2? | HTTP/2 multiplexes many requests over one connection and compresses headers, so it's faster with many assets. |
| TCP vs UDP? | TCP is reliable and ordered, with a handshake (HTTP, DB connections). UDP is fast with no delivery guarantee (video, DNS, games). |
| Nginx as a reverse proxy? | Clients talk to Nginx, which forwards to Node (`proxy_pass`). It terminates TLS, serves static files, compresses with gzip, load-balances, rate-limits and hides the app servers. |
| Nginx config for WebSockets? | `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";` |
| Check running processes / resources? | `ps aux`, `top`/`htop`, `free -m` (memory), `df -h` (disk), `du -sh *` (folder sizes), `uptime` (load). |
| Which process is using a port? | `ss -tulpn \| grep 3000` or `lsof -i :3000`. |
| View logs? | `journalctl -u nginx -f`, `tail -f /var/log/nginx/error.log`, `docker logs -f <container>`. |
| Manage services? | `systemctl status / start / restart / enable nginx`. |
| File permissions? | `chmod 644 file` (owner rw, others r), `chmod +x script.sh`, `chown user:group file`. Numbers: r=4, w=2, x=1. |
| Find text in files? | `grep -rn "ERROR" /var/log/app/`. |
| Debug "the server is down" | 1) Is it really down: `curl` the health endpoint, check DNS. 2) Is the process running (`systemctl`, `docker ps`)? 3) Logs. 4) Resources: disk full (`df -h`), memory/OOM, CPU. 5) Was there a recent deploy? Roll back. 6) Dependencies: DB, Redis, third-party APIs. 7) Network: security group, ports. |
| Metrics vs logs vs traces? | Metrics are numbers over time (CPU, request rate) and good for alerts. Logs are detailed events and good for debugging. Traces follow one request across services and show where the time went. |
| The 4 golden signals? | **Latency**, **traffic**, **errors** and **saturation** (how full resources are). |
| What alerts would you set up? | Error rate above a threshold, p95 latency, health check failing, CPU/memory high, disk > 80%, queue backlog / failed jobs, SSL certificate expiry, AWS budget. |
| What is load average? | The average number of processes running or waiting. Compare it with the number of CPU cores: above the core count means overloaded. |
| What is DNS TTL? | How long resolvers cache a record. Lower it before a migration so changes spread quickly. |

## 7. Scenario questions

1. **A deploy broke production. What do you do?** Roll back first, communicate, then investigate (logs, diff), write a postmortem and add a test or check.
2. **The container keeps restarting.** `docker logs` / CloudWatch, exit code (137 = OOM), failing health check, missing env vars.
3. **A secret was committed to git.** Rotate it immediately, remove it from history, add secret scanning.
4. **Zero-downtime DB migration?** Expand → migrate data → switch code → contract (backward-compatible steps). Example of renaming a column: add the new column → write to both → backfill → read from the new one → stop writing the old one → drop it.
5. **The disk is full on the server.** `df -h` to confirm, `du -sh /* | sort -h` to find the cause (usually logs or Docker images). Clean with `docker system prune` and rotate logs (logrotate, Docker log `max-size`). Add a disk alert.
6. **The site is slow only sometimes.** Check metrics at those times: traffic spikes, cron jobs, DB slow queries, GC pauses, a noisy neighbour. Correlate with logs and traces.
7. **How would you set up CI/CD for a new project?** PR checks (lint, type-check, test, build, scan) → main branch builds an image tagged with the SHA → push to the registry → deploy to staging automatically → smoke test → manual approval → production → health checks and rollback. Secrets via OIDC and a secrets manager.
