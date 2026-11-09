import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Docker',
  description: 'Images vs containers, Dockerfiles, layers, multi-stage builds and compose.',
  questions: [
    {
      id: 'container-vs-vm',
      question: 'What is the difference between a container and a virtual machine?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['docker'],
      answer: `A **VM** virtualises **hardware**: each VM runs a **full guest OS** with its own kernel on a hypervisor. It's strongly isolated, but heavy (GBs of disk, minutes to boot).

A **container** virtualises the **operating system**: containers **share the host kernel** and are isolated with **namespaces** (what a process can see: PIDs, network, filesystem) and **cgroups** (what it can use: CPU, memory). They're lightweight (MBs), **start in seconds** and pack densely, so they're ideal for shipping the same app everywhere.

The trade-off is weaker isolation than a VM. In the cloud the two are combined: containers running on VMs (EC2 or Fargate).`,
      variants: [
        { label: 'Short version', answer: `Containers share the host kernel and isolate processes (namespaces, cgroups). They're lightweight and start in seconds. VMs have a full guest OS.` },
      ],
      analogy: `VMs are separate houses, each with its own foundation and plumbing; containers are flats in one building sharing the foundation (kernel) but with their own locked doors (namespaces) and utility limits (cgroups).`,
      quickRevision: [
        'VM: full guest OS + hypervisor, strong isolation, heavy',
        'Container: shares host kernel, light, fast',
        'Namespaces = isolation, cgroups = limits',
        'Usually containers on top of VMs',
      ],
      followUps: [
        'What are namespaces and cgroups?',
        'Can a Linux container run on Windows?',
        'When would you still choose a VM?',
      ],
    },
    {
      id: 'docker-images-multistage',
      question: 'Docker: image vs container, and why use multi-stage builds?',
      perspective: 'practical',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['docker', 'ci-cd'],
      answer: `An **image** is a read-only, layered template: OS base, runtime, dependencies, your code and a start command. A **container** is a **running instance** of an image with its own writable layer, process, network and limits. One image can run as many containers.

**Multi-stage builds** use one stage with the full toolchain to **build** (install dev dependencies, compile TypeScript, build Next.js), then **copy only the output** into a small runtime stage (e.g. \`node:22-alpine\` or distroless) with production dependencies only. Benefits:

- **Much smaller images**: faster pulls and deploys, cheaper storage.
- **Smaller attack surface**: no compilers, source or dev tooling in production.
- **Better layer caching**: copy \`package*.json\` and run \`npm ci\` **before** copying source, so changing code doesn't reinstall dependencies.

Other good practices: \`.dockerignore\` (node_modules, .git, .env), run as a **non-root user**, a \`HEALTHCHECK\`, config through env vars, and tag images with the **git SHA** so you can roll back to an exact version.`,
      analogy: `An image is a recipe plus pre-measured ingredients; a container is the dish being cooked from it, and you can cook many at once. A multi-stage build is cooking in a full kitchen but delivering only the finished plate, not the pots, knives and peelings.`,
      quickRevision: [
        'Image = immutable template; container = running instance',
        'Multi-stage: build stage → copy artifacts → slim runtime stage',
        'Smaller, safer, faster to deploy',
        'Copy lockfile + `npm ci` before source for layer caching',
        'Non-root user, `.dockerignore`, healthcheck, SHA tags',
      ],
      followUps: [
        'A container keeps restarting. How do you debug it?',
        'Docker volumes vs bind mounts?',
        'What is in your docker-compose for local development?',
      ],
    },
    {
      id: 'reduce-image-size',
      question: 'How do you reduce the size of a Docker image?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['docker'],
      answer: `Smaller images pull and deploy faster, cost less to store and have **fewer vulnerabilities**. What I do:

- **Multi-stage builds**: compile in a builder stage, copy only \`dist\` and production \`node_modules\` into the final stage.
- A **slim base** (\`node:22-slim\`, alpine, or distroless).
- \`npm ci --omit=dev\` and a clean npm cache.
- A **\`.dockerignore\`** for \`node_modules\`, \`.git\`, tests and \`.env\`.
- **Fewer, combined layers** that clean up within the same \`RUN\`.

I check the result with \`docker images\` and \`dive\`, and scan it with **Trivy** in CI.`,
      variants: [
        { label: 'Short version', answer: 'Slim or alpine base, multi-stage, `.dockerignore`, `npm ci --omit=dev`, combine layers.' },
      ],
      analogy: `Packing hand luggage: take only the clothes you'll wear (runtime files), not the sewing machine you used to make them (build tools).`,
      quickRevision: [
        'Multi-stage, copy only artifacts',
        'Slim/alpine/distroless base',
        'npm ci --omit=dev, .dockerignore',
        'Combine RUN layers; scan with Trivy',
      ],
      followUps: [
        'Alpine pitfalls with native modules (musl)?',
        'What is a distroless image?',
      ],
    },
    {
      id: 'layer-caching',
      question: 'How does Docker layer caching work, and how do you make builds faster?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['caching', 'docker'],
      answer: `Each Dockerfile instruction creates a **layer**, and Docker reuses a cached layer **until an instruction or its inputs change**. Everything after the first changed layer is rebuilt.

So I order the Dockerfile **from least to most frequently changing**:

1. Base image and system packages.
2. \`COPY package.json package-lock.json ./\`
3. \`RUN npm ci\` (cached until dependencies change).
4. \`COPY . .\` (changes every commit).
5. Build.

That way a code change doesn't reinstall all dependencies. In CI I also enable **BuildKit cache** (\`cache-from\`/\`cache-to\`, GitHub Actions cache) so the cache survives between runs.`,
      variants: [
        { label: 'Short version', answer: `Copy \`package*.json\` and install **before** copying source, so dependencies are cached until they change.` },
      ],
      analogy: `Baking: if you only change the icing, you don't re-bake the cake. Put the things that rarely change (the cake) first, and the frequently changed bits (icing) last.`,
      quickRevision: [
        'Layers are cached until inputs change',
        'Copy lockfile → install → copy source',
        'Least-changing steps first',
        'BuildKit cache in CI',
      ],
      followUps: [
        'Why does `COPY . .` before `npm ci` slow builds?',
        'How do you cache layers in GitHub Actions?',
      ],
    },
    {
      id: 'cmd-vs-entrypoint',
      question: 'What is the difference between `CMD` and `ENTRYPOINT` in a Dockerfile?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['docker'],
      answer: `- **ENTRYPOINT** defines the **executable** that always runs (\`ENTRYPOINT ["node"]\`).
- **CMD** provides **default arguments**, or a default command if there's no entrypoint (\`CMD ["dist/server.js"]\`).

\`docker run image other.js\` **replaces CMD** but keeps the ENTRYPOINT. Common patterns: just \`CMD ["node", "dist/server.js"]\` for apps, or an ENTRYPOINT script that runs migrations or setup and then \`exec "$@"\`.

Use the **exec (JSON array) form** so the process runs as PID 1 and **receives signals** like SIGTERM. The shell form wraps it in \`/bin/sh\`, which swallows signals and breaks graceful shutdown.`,
      variants: [
        { label: 'Short version', answer: 'ENTRYPOINT is the fixed executable. CMD gives default args and can be overridden.' },
      ],
      analogy: `ENTRYPOINT is the machine (a coffee maker); CMD is the default button pressed on it (espresso), which you can change at run time (latte) without swapping the machine.`,
      quickRevision: [
        'ENTRYPOINT: fixed executable',
        'CMD: default args, overridable at run',
        'Use exec/JSON form for signals',
        'Entrypoint scripts end with exec "$@"',
      ],
      followUps: [
        'Why does shell form break graceful shutdown?',
        'What is tini / --init for?',
      ],
    },
    {
      id: 'copy-vs-add',
      question: 'What is the difference between `COPY` and `ADD` in a Dockerfile?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['docker'],
      answer: `Both copy files into the image, but **\`ADD\` also auto-extracts local tar archives and can download from URLs**. That "magic" makes builds less predictable and can pull unverified remote content.

Best practice is to **use \`COPY\`** for normal files and only use \`ADD\` when you specifically want tar extraction. For remote files, use \`curl\` or \`wget\` in a \`RUN\` step (so you can verify checksums), or a multi-stage download.`,
      variants: [
        { label: 'Short version', answer: 'Prefer COPY. ADD also extracts tar files and fetches URLs.' },
      ],
      analogy: `COPY is a mover who carries boxes as they are; ADD is a mover who also unpacks boxes and fetches things from other addresses without asking, which is handy occasionally but surprising by default.`,
      quickRevision: [
        'Prefer COPY',
        'ADD extracts tars + fetches URLs',
        'Remote files: curl + checksum in RUN',
      ],
      followUps: [
        'Why is ADD with URLs discouraged?',
        'How do you use `COPY --from` in multi-stage builds?',
      ],
    },
    {
      id: 'run-as-non-root',
      question: 'Why and how should a container run as a non-root user?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['docker'],
      answer: `By default, processes in a container run as **root**. If the app is compromised, the attacker has root inside the container, which makes **container escape** and damage to mounted volumes far easier.

So I set \`USER node\` (the official Node images include that user) after installing dependencies, make sure the app's files are owned by that user (\`COPY --chown=node:node\`), and listen on a **port above 1024**. In Kubernetes, \`runAsNonRoot: true\` and a read-only root filesystem enforce it. Image scanners like Trivy flag root containers.`,
      variants: [
        { label: 'Short version', answer: '`USER node`. It reduces the damage if the container is compromised.' },
      ],
      analogy: `Giving a temporary worker a visitor badge instead of the master key: if their badge is stolen, the thief can't open every door in the building.`,
      quickRevision: [
        'Default is root → bigger blast radius',
        'USER node; COPY --chown',
        'Ports > 1024',
        'K8s: runAsNonRoot, read-only FS',
      ],
      followUps: [
        'Why can\'t a non-root user bind port 80?',
        'What else hardens a container?',
      ],
    },
    {
      id: 'docker-compose',
      question: 'What is Docker Compose, and when do you use it?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['docker'],
      answer: `Docker Compose defines a **multi-container setup in one YAML file**: services (the app, Postgres or Mongo, Redis), **networks** (services reach each other by name, like \`postgres:5432\`), **volumes** for data, environment variables, ports, and **health-check-based \`depends_on\`**.

I use it for:

- **local development**: one command (\`docker compose up\`) starts the whole stack, with bind mounts for hot reload;
- **integration tests in CI**: a real database for tests. My Jenkins inventory project runs **PostgreSQL integration tests and a 100-request concurrency test** in Compose;
- simple **single-server deployments**.

For production at scale I'd use ECS or Kubernetes.`,
      variants: [
        { label: 'Short version', answer: 'Defines a multi-container local setup (app + DB + Redis) with networks and volumes.' },
      ],
      analogy: `A recipe card for the whole meal, not just one dish: it lists every pot (service), how they connect, and the order to start them.`,
      quickRevision: [
        'One YAML: services, networks, volumes, env',
        'Services reach each other by name',
        'Local dev + CI integration tests',
        'depends_on with healthchecks',
      ],
      followUps: [
        'Why does `depends_on` not wait for the DB to be ready by default?',
        'Compose vs Kubernetes?',
      ],
    },
    {
      id: 'volumes-vs-bind-mounts',
      question: 'What is the difference between Docker volumes and bind mounts?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['docker'],
      answer: `Container filesystems are **ephemeral**: data is lost when the container is removed. To keep data:

- **Named volumes**: **managed by Docker** (stored in Docker's area, portable, with good performance on Mac and Windows). Used for **persistent data** like database files.
- **Bind mounts**: map a **specific host path** into the container. Used in **development** so code edits on the host trigger hot reload, or to mount config files.

Production databases usually run as managed services (RDS, Atlas) rather than on volumes.`,
      variants: [
        { label: 'Short version', answer: `Volumes are managed by Docker and used for persistent data. Bind mounts map a host path and are used for dev hot reload.` },
      ],
      analogy: `A volume is a storage unit the building manages for you; a bind mount is running an extension cord directly from your own flat into the container.`,
      quickRevision: [
        'Container FS is ephemeral',
        'Volumes: Docker-managed, persistent data',
        'Bind mounts: host path, dev hot reload',
        'Prod DBs → managed services',
      ],
      followUps: [
        'How do you back up a Docker volume?',
        'What is a tmpfs mount?',
      ],
    },
  ],
});
