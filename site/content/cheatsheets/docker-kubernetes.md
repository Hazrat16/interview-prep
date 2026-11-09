---
title: Docker & Kubernetes
description: Images, Dockerfiles, compose and the core Kubernetes objects and commands.
icon: cloud
order: 8
---

## Docker concepts

- **Image**: read-only template built in layers. **Container**: a running instance of an image.
- Containers share the host kernel (namespaces + cgroups), so they start in seconds, unlike VMs.
- **Volume**: data that outlives the container. **Network**: containers on the same network reach each other by name.

## Dockerfile (Node, multi-stage)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                      # cached unless package files change
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Tips: copy dependency files before source for layer caching · `.dockerignore` `node_modules` · run as non-root · pin versions.

## Docker commands

| Command | What it does |
|---|---|
| `docker build -t app:1.0 .` | Build an image |
| `docker run -d -p 3000:3000 --name app app:1.0` | Run detached, map a port |
| `docker ps` / `docker ps -a` | Running / all containers |
| `docker logs -f app` | Follow logs |
| `docker exec -it app sh` | Shell into a container |
| `docker stop app && docker rm app` | Stop and remove |
| `docker images` / `docker rmi` | List / remove images |
| `docker system prune` | Clean up unused data |
| `docker compose up -d` / `down` | Start / stop a compose stack |

## Kubernetes objects

| Object | Purpose |
|---|---|
| **Pod** | Smallest unit: one or more containers sharing network/storage |
| **Deployment** | Keeps N replicas of a pod running; rolling updates and rollbacks |
| **Service** | Stable IP/DNS in front of pods (`ClusterIP`, `NodePort`, `LoadBalancer`) |
| **Ingress** | HTTP routing (host/path) from outside to services |
| **ConfigMap / Secret** | Configuration and sensitive values as env vars or files |
| **HPA** | Scale replicas on CPU/memory/custom metrics |
| **Namespace** | Isolate resources per team/environment |
| **StatefulSet** | Pods with stable identity and storage (databases) |

Probes: **liveness** (restart if failing) · **readiness** (remove from Service until ready) · **startup** (slow boot).

## kubectl commands

| Command | What it does |
|---|---|
| `kubectl get pods -n <ns>` | List pods |
| `kubectl describe pod <pod>` | Events, why it's not starting |
| `kubectl logs -f <pod> [-c container]` | Logs |
| `kubectl exec -it <pod> -- sh` | Shell into a pod |
| `kubectl apply -f deploy.yaml` | Create/update from a file |
| `kubectl rollout status deploy/app` | Watch a rollout |
| `kubectl rollout undo deploy/app` | Roll back |
| `kubectl scale deploy/app --replicas=5` | Scale manually |
| `kubectl port-forward svc/app 8080:80` | Reach a service locally |

## Debugging a pod

`CrashLoopBackOff` → check `logs --previous` · `ImagePullBackOff` → image name/tag or registry credentials · `Pending` → not enough resources or node selector mismatch · `OOMKilled` → raise memory limit or fix the leak.
