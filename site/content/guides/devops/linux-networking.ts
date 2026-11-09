import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Linux, Networking & Observability',
  description: 'Shell essentials, DNS, TCP/HTTP, load balancers, logs and monitoring.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'frontend/browser-css/what-happens-when-you-type-a-url',
  ],
  questions: [
    {
      id: 'http-vs-https',
      question: 'HTTP vs HTTPS?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['linux-networking'],
      answer: `**HTTPS** is HTTP sent over **TLS**. It gives three guarantees:

1. **Encryption**: nobody on the network (public Wi-Fi, ISPs) can read the traffic.
2. **Integrity**: data can't be modified in transit without detection.
3. **Authentication**: the **certificate** proves you're talking to the real domain, not an impostor.

It's required for cookies with \`Secure\`, HTTP/2 in browsers, service workers and many browser APIs. I add **HSTS** to force HTTPS and redirect HTTP → HTTPS at the load balancer or Nginx.`,
      variants: [
        { label: 'Short version', answer: 'HTTPS is HTTP over TLS: encrypted, server identity verified by a certificate, and tamper-proof.' },
      ],
      analogy: `HTTP is a postcard anyone handling it can read or alter; HTTPS is a sealed, tamper-evident envelope with the sender's verified ID.`,
      quickRevision: [
        'HTTPS = HTTP over TLS',
        'Encryption, integrity, authentication',
        'Needed for Secure cookies, HTTP/2, SW',
        'HSTS + redirect HTTP→HTTPS',
      ],
      followUps: [
        'What does HSTS protect against?',
        'Where would you terminate TLS?',
      ],
    },
    {
      id: 'how-does-a-tls-certificate-work',
      question: 'How does a TLS certificate work?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `The server presents a **certificate** containing its **public key** and **domain name**, **signed by a Certificate Authority**. The browser:

1. checks the **signature chain** up to a **trusted root CA** in its trust store;
2. checks the **domain matches**, the certificate **hasn't expired**, and it isn't revoked;
3. completes the **TLS handshake**: the two sides agree on a shared **session key** using key exchange (ECDHE), then use fast symmetric encryption.

**Let's Encrypt** gives free certificates with **automatic renewal** (certbot, or ACM on AWS). I set these up with certbot and Nginx in my EC2 projects, plus an alert before expiry.`,
      variants: [
        { label: 'Short version', answer: `The server presents a certificate signed by a trusted CA. The browser verifies the chain and domain, then they agree on a session key. Let's Encrypt provides free certificates with automatic renewal (certbot).` },
      ],
      analogy: `A passport: issued by a trusted government (CA), with your photo and name (domain + public key); the border officer (browser) checks the stamp is genuine and not expired before letting you in.`,
      quickRevision: [
        'Cert = public key + domain, signed by a CA',
        'Browser verifies chain, domain, expiry',
        'Handshake agrees a session key (ECDHE)',
        'Let\'s Encrypt/ACM auto-renew; alert on expiry',
      ],
      followUps: [
        'Symmetric vs asymmetric encryption in TLS?',
        'What happens if a certificate expires?',
      ],
    },
    {
      id: 'http11-vs-http2',
      question: 'HTTP/1.1 vs HTTP/2?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `- **HTTP/1.1**: one request at a time per connection (head-of-line blocking), so browsers open about 6 connections per domain, and we used tricks like bundling and sprite sheets. Headers are sent as plain text every time.
- **HTTP/2**: **multiplexes** many requests over **one TCP connection**, adds **header compression** (HPACK) and stream prioritisation, and uses a binary framing layer. It's much faster for pages with many assets.
- **HTTP/3** runs over **QUIC (UDP)**, which removes TCP-level head-of-line blocking and makes connection setup faster, which especially helps on mobile networks.`,
      variants: [
        { label: 'Short version', answer: `HTTP/2 multiplexes many requests over one connection and compresses headers, so it's faster with many assets.` },
      ],
      analogy: `HTTP/1.1 is a single-lane road where cars wait behind each other; HTTP/2 is many lanes on the same road; HTTP/3 rebuilds the road so a breakdown in one lane doesn't block the others.`,
      quickRevision: [
        '1.1: one request per connection at a time',
        '2: multiplexing + header compression',
        '3: QUIC over UDP, no TCP HOL blocking',
        'Bundling tricks matter less on h2',
      ],
      followUps: [
        'Does HTTP/2 make bundling unnecessary?',
        'What is head-of-line blocking?',
      ],
    },
    {
      id: 'tcp-vs-udp',
      question: 'TCP vs UDP?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `- **TCP**: **connection-oriented** (a three-way handshake), **reliable** (retransmits lost packets), **ordered**, with flow and congestion control. Used by HTTP/1–2, databases, SSH and email, anything that needs every byte correct.
- **UDP**: **connectionless**, **no delivery or order guarantees**, minimal overhead and **low latency**. Used for DNS lookups, video calls, live streaming, games, and as the base for **QUIC/HTTP/3**, which adds reliability on top.`,
      variants: [
        { label: 'Short version', answer: `TCP is reliable and ordered, with a handshake (HTTP, DB connections). UDP is fast with no delivery guarantee (video, DNS, games).` },
      ],
      analogy: `TCP is registered post with tracking and signatures; UDP is shouting across a room: much faster, and if a word is missed you just carry on.`,
      quickRevision: [
        'TCP: handshake, reliable, ordered',
        'UDP: no guarantees, low latency',
        'TCP for HTTP/DB/SSH',
        'UDP for DNS, video, games, QUIC',
      ],
      followUps: [
        'What is the TCP three-way handshake?',
        'Why does DNS mostly use UDP?',
      ],
    },
    {
      id: 'nginx-as-a-reverse-proxy',
      question: 'Nginx as a reverse proxy?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['linux-networking'],
      answer: `Clients connect to **Nginx**, which **forwards requests** to the Node app (\`proxy_pass http://app:3000\`). Why put it in front:

- **TLS termination** (certificates live in one place);
- **serving static files** and caching efficiently;
- **gzip/brotli compression**, request size limits and timeouts;
- **load balancing** across several app instances;
- **rate limiting** and blocking bad traffic;
- **hiding the app servers** (they aren't exposed directly).

I configured environment-specific Nginx for **staging and production at Firmwide**. One lesson from there: AI **streaming responses** broke in production until I **disabled proxy buffering** for that route.`,
      variants: [
        { label: 'Short version', answer: `Clients talk to Nginx, which forwards to Node (\`proxy_pass\`). It terminates TLS, serves static files, compresses with gzip, load-balances, rate-limits and hides the app servers.` },
      ],
      analogy: `A receptionist in front of the offices: handles security checks, hands out brochures (static files), and forwards visitors to whichever staff member is free.`,
      quickRevision: [
        'proxy_pass to the app',
        'TLS termination, static files, compression',
        'Load balancing, rate limiting, timeouts',
        'Disable buffering for streaming/SSE',
      ],
      followUps: [
        'Why did streaming break behind Nginx?',
        'What headers should you forward (X-Forwarded-For)?',
      ],
    },
    {
      id: 'nginx-config-for-websockets',
      question: 'Nginx config for WebSockets?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['realtime', 'linux-networking'],
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
      variants: [
        { label: 'Short version', answer: `\`proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";\`` },
      ],
      analogy: `Telling the receptionist that when a visitor asks to "upgrade to a private line", they must actually connect the call and keep it open, not hang up after a minute.`,
      quickRevision: [
        'proxy_http_version 1.1',
        'Forward Upgrade + Connection "upgrade"',
        'Longer proxy_read_timeout',
        'Sticky sessions for long-polling; Redis adapter',
      ],
      followUps: [
        'Why do idle WebSockets get disconnected after 60 seconds?',
        'Same issue on an AWS ALB?',
      ],
    },
    {
      id: 'check-running-processes-resources',
      question: 'Check running processes / resources?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `My quick health check on a Linux server:

- \`top\` / \`htop\`: CPU, memory and the top processes live;
- \`ps aux --sort=-%mem | head\`: biggest processes;
- \`free -m\`: memory and swap;
- \`df -h\`: **disk usage per filesystem** (a full disk breaks everything);
- \`du -sh /var/* | sort -h\`: what's using the space;
- \`uptime\`: **load average**;
- \`docker stats\` for containers;
- \`iostat\`, \`vmstat\` for disk and IO pressure.`,
      variants: [
        { label: 'Short version', answer: `\`ps aux\`, \`top\`/\`htop\`, \`free -m\` (memory), \`df -h\` (disk), \`du -sh *\` (folder sizes), \`uptime\` (load).` },
      ],
      analogy: `A quick check-up at the doctor: pulse (CPU), blood pressure (memory), weight (disk), and stress level (load average) before deeper tests.`,
      quickRevision: [
        'top/htop, ps aux',
        'free -m (memory)',
        'df -h / du -sh (disk)',
        'uptime (load), docker stats',
      ],
      followUps: [
        'What does a high load average with low CPU usually mean?',
        'How do you spot a memory leak on a server?',
      ],
    },
    {
      id: 'which-process-is-using-a-port',
      question: 'Which process is using a port?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `\`ss -tulpn | grep :3000\` (or the older \`netstat -tulpn\`) lists listening TCP and UDP sockets with the **PID and program name**. \`lsof -i :3000\` gives the same information. Then \`ps -fp <PID>\` shows the full command, and \`kill <PID>\` (or \`systemctl stop\`) frees it. With Docker, check \`docker ps\` for a container publishing the port. Typical cause: an old dev server or container still running, giving **EADDRINUSE**.`,
      variants: [
        { label: 'Short version', answer: '`ss -tulpn \\| grep 3000` or `lsof -i :3000`.' },
      ],
      analogy: `Checking which car is parked in your reserved space by reading its number plate (PID), then asking the owner to move it.`,
      quickRevision: [
        'ss -tulpn | grep :PORT',
        'lsof -i :PORT',
        'ps -fp PID for details',
        'docker ps for published ports',
      ],
      followUps: [
        'What does EADDRINUSE mean?',
        'Why might you need sudo to see the PID?',
      ],
    },
    {
      id: 'view-logs',
      question: 'View logs?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `- **systemd services**: \`journalctl -u nginx -f\` (follow), \`--since "10 min ago"\`, \`-p err\`;
- **log files**: \`tail -f /var/log/nginx/error.log\`, \`less +F\`, and \`grep\` for errors;
- **containers**: \`docker logs -f --tail 200 <container>\` (or \`docker compose logs -f api\`);
- **AWS**: **CloudWatch Logs** (Logs Insights queries), or Loki and Grafana in my SmartJobHub setup.

I filter by **request ID** or a timestamp around the incident.`,
      variants: [
        { label: 'Short version', answer: '`journalctl -u nginx -f`, `tail -f /var/log/nginx/error.log`, `docker logs -f <container>`.' },
      ],
      analogy: `Different diaries for different staff: you open the right one (service, container, cloud) and flip to the time of the incident.`,
      quickRevision: [
        'journalctl -u svc -f',
        'tail -f / grep log files',
        'docker logs -f --tail',
        'CloudWatch / Loki; filter by request ID',
      ],
      followUps: [
        'How do you stop logs filling the disk?',
        'How would you search logs across many instances?',
      ],
    },
    {
      id: 'manage-services',
      question: 'Manage services?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `With **systemd**: \`systemctl status nginx\` (is it running, recent logs), \`start\`/\`stop\`/\`restart\`, \`reload\` (re-read config without dropping connections, after \`nginx -t\`), \`enable\` (start on boot), and \`daemon-reload\` after editing unit files.

A custom unit file for a Node app defines \`ExecStart\`, \`User\`, \`Restart=always\` and the environment. In containerised setups, Docker or the orchestrator does this job instead.`,
      variants: [
        { label: 'Short version', answer: '`systemctl status / start / restart / enable nginx`.' },
      ],
      analogy: `systemctl is the building manager's control panel: check whether a machine is on, restart it, and set it to switch on automatically every morning.`,
      quickRevision: [
        'systemctl status/start/stop/restart',
        'reload after config test (nginx -t)',
        'enable = start on boot',
        'Unit file: ExecStart, User, Restart=always',
      ],
      followUps: [
        'reload vs restart?',
        'Write a systemd unit for a Node app.',
      ],
    },
    {
      id: 'file-permissions',
      question: 'File permissions?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `Each file has permissions for **owner, group and others**, each with **r (4), w (2), x (1)**.

- \`chmod 644 file\` means owner read/write, others read-only (typical for files).
- \`chmod 755 dir\` means owner full, others read and execute (typical for directories and scripts).
- \`chmod 600 key.pem\` means only the owner can read it, which SSH requires for private keys.
- \`chown user:group file\` changes ownership. \`ls -l\` shows the current permissions.

In containers I make sure app files are owned by the non-root \`node\` user.`,
      variants: [
        { label: 'Short version', answer: `\`chmod 644 file\` (owner rw, others r), \`chmod +x script.sh\`, \`chown user:group file\`. Numbers: r=4, w=2, x=1.` },
      ],
      analogy: `House rules for three groups of people: the owner, the family, and visitors, each allowed to look (r), rearrange (w), or use the appliances (x).`,
      quickRevision: [
        'owner / group / others',
        'r=4, w=2, x=1',
        '644 files, 755 dirs/scripts, 600 private keys',
        'chown user:group; ls -l to inspect',
      ],
      followUps: [
        'Why does SSH reject a private key with 644?',
        'What is the sticky bit?',
      ],
    },
    {
      id: 'find-text-in-files',
      question: 'Find text in files?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `\`grep -rn "ERROR" /var/log/app/\`: recursive, with line numbers. Useful flags: \`-i\` (ignore case), \`-l\` (only filenames), \`-C 3\` (context lines), \`-E\` (regex), \`--include="*.log"\`. Combine with pipes: \`grep -c\` to count, or \`… | sort | uniq -c | sort -rn | head\` to find the most frequent errors. \`ripgrep\` (\`rg\`) is faster on big codebases. For compressed logs, use \`zgrep\`.`,
      variants: [
        { label: 'Short version', answer: '`grep -rn "ERROR" /var/log/app/`.' },
      ],
      analogy: 'Ctrl+F for the whole filing cabinet at once, with notes on which page and line each match is on.',
      quickRevision: [
        'grep -rn pattern path',
        '-i, -l, -C, -E, --include',
        'Pipe to sort | uniq -c for top errors',
        'rg for speed; zgrep for .gz',
      ],
      followUps: [
        'Count the top 5 IPs in an Nginx access log.',
        'How do you search logs from the last hour only?',
      ],
    },
    {
      id: 'debug-the-server-is-down',
      question: 'Debug "the server is down"',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['linux-networking'],
      answer: `I go from the outside in, and **mitigate first** if users are affected:

1. **Confirm**: \`curl\` the health endpoint from outside, check DNS, and check whether it's everyone or one region.
2. **Recent change?** If something was just deployed, **roll back** first and investigate after.
3. **Is it running?** \`systemctl status\`, \`docker ps\` (restarting?), ECS task events.
4. **Logs**: app, Nginx and system logs, plus exit codes (137 = OOM-killed).
5. **Resources**: **disk full** (\`df -h\`), memory/OOM, CPU, file descriptors.
6. **Dependencies**: database, Redis, third-party APIs (timeouts?).
7. **Network**: security groups, ports, TLS certificate expiry, load balancer target health.

Then fix it, verify, communicate, and write a short postmortem with an alert or test to prevent it happening again.`,
      variants: [
        { label: 'Short version', answer: `1) Is it really down: \`curl\` the health endpoint, check DNS. 2) Is the process running (\`systemctl\`, \`docker ps\`)? 3) Logs. 4) Resources: disk full (\`df -h\`), memory/OOM, CPU. 5) Was there a recent deploy? Roll back. 6) Dependencies: DB, Redis, third-party APIs. 7) Network: security group, ports.` },
      ],
      analogy: `A power cut at home: first check whether it's just your house or the whole street (scope), whether you just plugged in something new (recent deploy), then the fuse box (process), then the wiring (dependencies).`,
      quickRevision: [
        'Confirm scope (curl, DNS, region)',
        'Recent deploy → roll back first',
        'Process status, logs, exit codes',
        'Disk/memory/CPU, dependencies, network/TLS',
        'Postmortem + new alert',
      ],
      followUps: [
        'Exit code 137 means what?',
        'How do you communicate during an incident?',
      ],
    },
    {
      id: 'metrics-vs-logs-vs-traces',
      question: 'Metrics vs logs vs traces?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['linux-networking'],
      answer: `The three pillars of observability:

- **Metrics**: **numbers over time** (request rate, error rate, p95 latency, CPU). They're cheap to store and great for **dashboards and alerts**, telling you **that** something is wrong.
- **Logs**: **detailed events** with context (structured JSON with a request ID). They're great for **debugging why** a specific thing happened.
- **Traces**: follow **one request across services**, showing each span's timing, so you see **where** the time went (which DB query or external call).

In SmartJobHub I used **Prometheus and Grafana** for metrics, **Loki** for logs, **CloudWatch alarms** and **Sentry** for errors.`,
      variants: [
        { label: 'Short version', answer: `Metrics are numbers over time (CPU, request rate) and good for alerts. Logs are detailed events and good for debugging. Traces follow one request across services and show where the time went.` },
      ],
      analogy: `Metrics are the car's dashboard warning lights, logs are the mechanic's detailed service notes, and traces are a GPS recording of one journey showing exactly where you got stuck in traffic.`,
      quickRevision: [
        'Metrics: numbers over time → alerts',
        'Logs: detailed events → why',
        'Traces: one request across services → where',
        'Prometheus/Grafana, Loki, Sentry',
      ],
      followUps: [
        'How do you correlate a trace with logs?',
        'What is OpenTelemetry?',
      ],
    },
    {
      id: 'the-4-golden-signals',
      question: 'The 4 golden signals?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `From Google's SRE book, the four signals to monitor for any user-facing service:

1. **Latency**: how long requests take, as **p95/p99**, separately for successful and failed requests.
2. **Traffic**: demand (requests per second, active sockets).
3. **Errors**: the rate of failed requests (5xx, timeouts, wrong results).
4. **Saturation**: how **full** the system is (CPU, memory, DB connections, queue depth), the early warning before latency rises.

I build dashboards and alerts around these rather than around every possible metric.`,
      variants: [
        { label: 'Short version', answer: '**Latency**, **traffic**, **errors** and **saturation** (how full resources are).' },
      ],
      analogy: `Checking a motorway: how long journeys take (latency), how many cars (traffic), how many breakdowns (errors), and how close to gridlock the lanes are (saturation).`,
      quickRevision: [
        'Latency (p95/p99)',
        'Traffic (RPS)',
        'Errors (rate)',
        'Saturation (how full resources are)',
      ],
      followUps: [
        'Why percentiles instead of averages?',
        'RED vs USE methods?',
      ],
    },
    {
      id: 'what-alerts-would-you-set-up',
      question: 'What alerts would you set up?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['linux-networking'],
      answer: `I alert on **symptoms users feel**, with thresholds that matter and a clear owner:

- **Error rate** above a threshold (e.g. 5xx > 2% for 5 minutes);
- **p95 latency** above the target;
- **health checks** failing or tasks restarting repeatedly;
- **resource saturation**: CPU or memory high for a sustained period, **disk > 80%**, DB connections near the limit;
- **queue backlog** growing, or failed jobs;
- **SSL certificate expiry** (14 days ahead);
- **AWS budget** thresholds.

Alerts go to Slack or email (SNS) with a link to a runbook. In SmartJobHub CloudWatch alarms go to SNS, alongside budget alerts. I avoid noisy alerts, because alert fatigue means real alerts get ignored.`,
      variants: [
        { label: 'Short version', answer: `Error rate above a threshold, p95 latency, health check failing, CPU/memory high, disk > 80%, queue backlog / failed jobs, SSL certificate expiry, AWS budget.` },
      ],
      analogy: `Smoke detectors in the rooms that matter, set to go off for real fires rather than toast, each with a note on the wall saying what to do.`,
      quickRevision: [
        'Error rate, p95 latency, health checks',
        'CPU/memory, disk > 80%, DB connections',
        'Queue backlog / failed jobs',
        'Cert expiry, budget',
        'Runbook links; avoid noise',
      ],
      followUps: [
        'How do you avoid alert fatigue?',
        'What belongs in a runbook?',
      ],
    },
    {
      id: 'what-is-load-average',
      question: 'What is load average?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['linux-networking'],
      answer: `Load average (from \`uptime\` or \`top\`) is the average number of processes **running or waiting** for CPU (and, on Linux, waiting for uninterruptible IO) over the last **1, 5 and 15 minutes**.

Compare it with the **number of CPU cores**: a load of 4 on a 4-core machine means fully busy. A load of 8 means work is queuing. High load with **low CPU usage** often points to **IO wait** (slow disk or network storage), which you check with \`iostat\` or \`top\`'s \`wa\` column. Reading the trend across the three numbers shows whether it's rising or falling.`,
      variants: [
        { label: 'Short version', answer: `The average number of processes running or waiting. Compare it with the number of CPU cores: above the core count means overloaded.` },
      ],
      analogy: `The queue at a bank with four cashiers: four people being served is full capacity, eight means four are waiting, and the three numbers show whether the queue is growing or shrinking.`,
      quickRevision: [
        'Avg runnable/waiting processes (1, 5, 15 min)',
        'Compare to core count',
        'High load + low CPU → IO wait',
        'Trend across the three numbers',
      ],
      followUps: [
        'How do you find the core count?',
        'What is iowait?',
      ],
    },
    {
      id: 'what-is-dns-ttl',
      question: 'What is DNS TTL?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['caching', 'linux-networking'],
      answer: `**TTL (time to live)** on a DNS record tells resolvers **how long to cache** the answer (in seconds). A high TTL (hours) means fewer lookups and faster responses, but **changes spread slowly**. A low TTL (60s) means changes take effect quickly, with more queries.

Before a **migration** (moving to a new load balancer or IP), I **lower the TTL a day in advance**, do the switch, verify, then raise it again. On AWS, **alias records** to ALBs and CloudFront avoid IP changes entirely.`,
      variants: [
        { label: 'Short version', answer: 'How long resolvers cache a record. Lower it before a migration so changes spread quickly.' },
      ],
      analogy: `How long people keep using a saved phone number before checking the directory again: if you're about to change numbers, tell everyone to check more often first.`,
      quickRevision: [
        'How long resolvers cache a record',
        'High TTL: fast, slow to change',
        'Lower TTL before migrations, raise after',
        'Route 53 alias records for AWS endpoints',
      ],
      followUps: [
        'Why do some users still hit the old server after a DNS change?',
        'A vs CNAME vs alias records?',
      ],
    },
  ],
});
