import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Kubernetes',
  description: 'Pods, deployments, services, scaling and how Kubernetes keeps apps running.',
  questions: [
    {
      id: 'pod-deployment-service',
      question: 'Explain Pods, Deployments and Services in Kubernetes.',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['kubernetes', 'ci-cd'],
      answer: `- **Pod**: the smallest unit. One or more containers that **share a network namespace and volumes**. Pods are **ephemeral** and get replaced, with new IPs.
- **Deployment**: declares the **desired state** ("3 replicas of image v2"). It manages ReplicaSets, does **rolling updates and rollbacks**, and replaces failed pods.
- **Service**: a **stable virtual IP and DNS name** in front of a changing set of pods (selected by labels), with load balancing between them. Types: **ClusterIP** (internal), **NodePort**, and **LoadBalancer** (a cloud LB).

My EKS project deployed a two-tier app with namespace, Deployment and Service manifests.`,
      variants: [
        { label: 'Short version', answer: `A Pod holds one or more containers. A Deployment manages ReplicaSets and rolling updates. A Service gives a stable network endpoint (ClusterIP, NodePort, LoadBalancer).` },
      ],
      analogy: `Pods are individual waiters (they come and go), the Deployment is the manager keeping exactly three waiters on shift, and the Service is the restaurant's phone number that always reaches whichever waiter is available.`,
      quickRevision: [
        'Pod: containers sharing network/volumes, ephemeral',
        'Deployment: replicas, rolling updates, self-healing',
        'Service: stable IP/DNS, label selector',
        'ClusterIP / NodePort / LoadBalancer',
      ],
      followUps: [
        'Why not create pods directly?',
        'How does a Service find its pods?',
      ],
    },
    {
      id: 'ingress',
      question: 'What is a Kubernetes Ingress?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['kubernetes'],
      answer: `An **Ingress** defines **HTTP(S) routing rules** from outside the cluster to Services: by **host** (\`api.example.com\`) and **path** (\`/api\` → api-service, \`/\` → web-service), with TLS. It needs an **ingress controller** to work, such as **NGINX Ingress** or the **AWS Load Balancer Controller**, which provisions an ALB.

It lets **one load balancer** front many services instead of one LoadBalancer Service per app. Newer clusters may use the **Gateway API**, the successor with richer routing.`,
      variants: [
        { label: 'Short version', answer: 'HTTP routing into the cluster through an ingress controller.' },
      ],
      analogy: `The building's front desk that reads the address on each visitor's note and directs them to the right company's floor, rather than every company having its own street entrance.`,
      quickRevision: [
        'HTTP routing by host/path + TLS',
        'Needs an ingress controller',
        'One LB for many services',
        'Gateway API is the successor',
      ],
      followUps: [
        'Ingress vs LoadBalancer Service?',
        'How does cert-manager issue TLS certificates?',
      ],
    },
    {
      id: 'configmap-vs-secret',
      question: 'What is the difference between a ConfigMap and a Secret?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['kubernetes'],
      answer: `Both inject configuration into pods as **environment variables or mounted files**:

- **ConfigMap**: **non-sensitive** config (feature flags, URLs, app settings).
- **Secret**: **sensitive** values (passwords, API keys, TLS certs). By default Secrets are only **base64-encoded, not encrypted**, so you should enable **encryption at rest** (KMS), restrict access with **RBAC**, and ideally pull from an external store (AWS Secrets Manager via the External Secrets Operator or the CSI driver).

Changes to env-var config usually need a **pod restart** to take effect.`,
      variants: [
        { label: 'Short version', answer: 'Config versus sensitive data (Secrets are base64, not encrypted by default).' },
      ],
      analogy: `A ConfigMap is a notice on the staff noticeboard; a Secret is an envelope marked "confidential", but by default the envelope is only folded (base64), not locked, so you need a proper safe (KMS, external secrets).`,
      quickRevision: [
        'ConfigMap: non-sensitive config',
        'Secret: sensitive, but base64 ≠ encryption',
        'Enable encryption at rest + RBAC',
        'External secrets for real secret stores',
      ],
      followUps: [
        'How do you rotate a secret without downtime?',
        'Env vars vs mounted files?',
      ],
    },
    {
      id: 'liveness-vs-readiness-probe',
      question: 'What is the difference between liveness and readiness probes?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['kubernetes'],
      answer: `- **Readiness probe**: "can this pod **accept traffic right now**?" If it fails, Kubernetes **removes the pod from the Service endpoints** but doesn't restart it. Use it during startup, warm-up, or when a dependency is temporarily unavailable. It's essential for **zero-downtime rolling updates**.
- **Liveness probe**: "is this pod **stuck or broken**?" If it fails, Kubernetes **restarts the container**. Use it for deadlocks or hung processes.
- **Startup probe**: protects slow-starting apps from being killed by liveness checks too early.

A common mistake is making **liveness depend on the database**: if the DB blips, every pod restarts in a loop. Keep liveness checks shallow.`,
      variants: [
        { label: 'Short version', answer: `Liveness failing means restart the container. Readiness failing means remove it from the Service until ready.` },
      ],
      analogy: `Readiness is a shop's "open/closed" sign: closed for a moment means customers go elsewhere. Liveness is checking whether the shopkeeper has fainted, in which case you send in someone new (restart).`,
      quickRevision: [
        'Readiness fail → no traffic (no restart)',
        'Liveness fail → restart container',
        'Startup probe for slow boots',
        'Don\'t make liveness depend on the DB',
      ],
      followUps: [
        'What should a health endpoint check?',
        'How do probes relate to ALB health checks on ECS?',
      ],
    },
    {
      id: 'how-do-you-scale',
      question: 'How do you scale an application in Kubernetes?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['kubernetes', 'system-design'],
      answer: `Two levels:

- **Pods**: the **Horizontal Pod Autoscaler (HPA)** adds or removes replicas based on CPU or memory, or on **custom metrics** (requests per second, queue length via KEDA). It needs **resource requests** set on containers. The **VPA** adjusts requests and limits.
- **Nodes**: the **Cluster Autoscaler** or **Karpenter** adds nodes when pods can't be scheduled and removes them when they're underused.

Plus **PodDisruptionBudgets** to keep enough replicas during node changes, and, as always, a stateless app and a database that can handle the extra load.`,
      variants: [
        { label: 'Short version', answer: 'HPA on CPU or custom metrics. Cluster autoscaler or Karpenter for nodes.' },
      ],
      analogy: `More cashiers (pods) when the queue grows, and opening another store floor (nodes) when there's no room for more cashiers.`,
      quickRevision: [
        'HPA: replicas on CPU/memory/custom metrics',
        'Requests must be set',
        'Cluster Autoscaler / Karpenter for nodes',
        'KEDA for queue-based scaling; PDBs',
      ],
      followUps: [
        'Why does HPA need resource requests?',
        'Karpenter vs Cluster Autoscaler?',
      ],
    },
  ],
});
