import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Terraform & Ansible',
  description: 'Infrastructure as code, state, modules and configuration management.',
  questions: [
    {
      id: 'what-is-iac-and-why',
      question: 'What is Infrastructure as Code, and why use it?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['infrastructure-as-code'],
      answer: `**Infrastructure as Code** means defining servers, networks, databases and permissions in **code files** (Terraform, CloudFormation) instead of clicking in the console. Benefits:

- **repeatable**: create identical staging and production environments;
- **reviewable**: infrastructure changes go through PRs, and \`plan\` shows exactly what will change;
- **versioned**: history, blame and rollback;
- **no manual drift** and documented infrastructure;
- **faster recovery**: rebuild an environment from code.

In SmartJobHub the whole AWS platform (VPC, ALB, ECS, ElastiCache, Secrets Manager, CloudFront) is Terraform modules, with matching staging and production environments.`,
      variants: [
        { label: 'Short version', answer: 'Infrastructure defined in code: repeatable, reviewable, versioned, no manual drift.' },
      ],
      analogy: `A recipe instead of cooking from memory: anyone can reproduce the exact same dish, changes are written down and reviewed, and you can always go back to last week's version.`,
      quickRevision: [
        'Infra defined in code',
        'Repeatable, reviewable, versioned',
        'Plan shows changes before apply',
        'No click-ops drift; fast rebuilds',
      ],
      followUps: [
        'Terraform vs CloudFormation vs CDK?',
        'How do you test infrastructure code?',
      ],
    },
    {
      id: 'terraform-state',
      question: 'What is Terraform state, and how do you manage it in a team?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['infrastructure-as-code'],
      answer: `Terraform's **state** file maps the resources in my code to the **real resources** in AWS (IDs, attributes). Terraform compares config, state and reality to work out what to change.

Best practices:

- store it **remotely** (an S3 bucket with versioning and encryption) so the team and CI share it;
- use **state locking** (DynamoDB, or S3's native lock file) so two applies can't run at once;
- keep **separate state per environment**;
- **never edit it by hand**: use \`terraform state mv\`/\`rm\` or \`import\` blocks;
- treat it as **sensitive**, since it can contain secrets.`,
      variants: [
        { label: 'Short version', answer: `It maps config to real resources. Store it remotely (S3) with locking (DynamoDB or S3 native locking). Never edit it by hand.` },
      ],
      analogy: `An inventory ledger for a warehouse: it records which shelf holds which item. If two people edit it at once or someone scribbles in it by hand, the warehouse and the ledger stop matching.`,
      quickRevision: [
        'Maps code → real resources',
        'Remote S3 backend + versioning + encryption',
        'Locking prevents concurrent applies',
        'Separate per env; never hand-edit; sensitive',
      ],
      followUps: [
        'What happens if two people apply at the same time without locking?',
        'How do you import an existing resource?',
      ],
    },
    {
      id: 'plan-vs-apply',
      question: 'What is the difference between `terraform plan` and `terraform apply`?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['infrastructure-as-code'],
      answer: `- **\`terraform plan\`** compares code, state and reality, and **shows what would change**: create (+), update (~), **destroy (-)** or replace. It changes nothing.
- **\`terraform apply\`** **executes** the changes (optionally applying a saved plan file, so exactly what was reviewed gets applied).

In a team workflow, CI runs **plan on the PR** and posts the output for review. After approval and merge, **apply** runs from CI. I always check for **unexpected destroys or replacements** (for example a database being replaced) before approving.`,
      variants: [
        { label: 'Short version', answer: 'Plan previews the changes. Apply executes them. Review the plan in the PR.' },
      ],
      analogy: `plan is the builder's quote listing every change to your house; apply is actually doing the work. You read the quote before saying yes, especially any line that says "demolish".`,
      quickRevision: [
        'plan: preview, no changes',
        'apply: execute (ideally a saved plan)',
        'Plan in PR, apply after merge from CI',
        'Watch for destroy/replace',
      ],
      followUps: [
        'How do you protect a database from accidental destroy?',
        'What does `-replace` do?',
      ],
    },
    {
      id: 'modules',
      question: 'What are Terraform modules, and why use them?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['infrastructure-as-code'],
      answer: `Terraform **modules** are reusable building blocks: a folder of resources with **input variables** and **outputs**, e.g. a \`vpc\` module (subnets, NAT, routes) or an \`ecs-service\` module (task definition, service, autoscaling, ALB target group).

Each environment calls the same modules with **different inputs** (instance sizes, counts, domain names), so staging and production stay **consistent** while differing only where intended. Good modules have a small, clear interface, sensible defaults, pinned provider and module versions, and documentation. I also use well-maintained community modules (\`terraform-aws-modules\`) where they fit.`,
      variants: [
        { label: 'Short version', answer: 'Reusable components (VPC, ECS service) with inputs and outputs, called per environment.' },
      ],
      analogy: `Prefabricated room kits: the same bathroom kit is installed in every flat, with options for tiles and size, instead of hand-building each bathroom differently.`,
      quickRevision: [
        'Reusable resource groups with inputs/outputs',
        'Same modules per env, different variables',
        'Small interface, sensible defaults',
        'Pin versions',
      ],
      followUps: [
        'How do you version internal modules?',
        'Module outputs: how do other modules use them?',
      ],
    },
    {
      id: 'managing-staging-vs-production',
      question: 'How do you manage staging and production environments with Terraform?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['infrastructure-as-code'],
      answer: `I keep **separate state per environment**, usually as **separate directories** (\`envs/staging\`, \`envs/prod\`) that call the **same modules** with different \`.tfvars\`. Workspaces are an alternative, but directories make differences explicit and reduce the risk of applying to the wrong environment.

Additionally:

- different **AWS accounts** or at least different roles per environment;
- **production applies need approval** in CI;
- **promote changes** through staging first;
- keep environments as similar as possible, differing mainly in size and scale.`,
      variants: [
        { label: 'Short version', answer: 'Separate state per environment (directories or workspaces) and env-specific variable files.' },
      ],
      analogy: `Two identical restaurant kitchens built from the same plans: you trial a new layout in the test kitchen first, and the main kitchen only changes after sign-off.`,
      quickRevision: [
        'Separate state per env',
        'Directories + tfvars (or workspaces)',
        'Separate accounts/roles; approvals for prod',
        'Promote via staging; keep envs similar',
      ],
      followUps: [
        'Workspaces vs directories: trade-offs?',
        'How do you share outputs between environments?',
      ],
    },
    {
      id: 'drift',
      question: 'What is infrastructure drift, and how do you detect and fix it?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['infrastructure-as-code'],
      answer: `**Drift** is when real infrastructure **no longer matches the code**, usually because someone changed something manually in the console, or another tool or process did. \`terraform plan\` (or a scheduled \`plan -detailed-exitcode\` in CI) **detects** it as unexpected changes.

To fix it, either **update the code** to match (if the change was right) or **apply** to revert it. To prevent it: lock down console write access, make all changes through PRs, and run drift detection regularly.`,
      variants: [
        { label: 'Short version', answer: 'Real infrastructure changed outside Terraform. `plan` detects it.' },
      ],
      analogy: `Someone moved the furniture in your house without updating the floor plan; the next walkthrough (plan) shows the mismatch, and you either update the plan or move the furniture back.`,
      quickRevision: [
        'Reality ≠ code (manual changes)',
        'plan detects it; schedule drift checks',
        'Fix: update code or re-apply',
        'Prevent: restrict console writes',
      ],
      followUps: [
        'How would you automate drift detection?',
        'What if drift is in an attribute Terraform ignores?',
      ],
    },
    {
      id: 'terraform-vs-ansible',
      question: 'Terraform vs Ansible: what is each for?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['infrastructure-as-code'],
      answer: `They solve different problems and work well together:

- **Terraform** **provisions infrastructure**: VPCs, servers, load balancers, databases, DNS. It's **declarative and stateful**, it knows what exists and plans changes, and it works across cloud APIs.
- **Ansible** **configures servers**: installs packages, writes config files, manages services and users. It's **procedural-ish, agentless (SSH)** and idempotent through its modules, with no state file.

In my Doctor Appointment project, **Terraform** created the VPC, security groups and EC2 instances, and **Ansible roles** set up Docker, Nginx as a reverse proxy, and TLS. With containers on managed platforms, Ansible matters less, because the image is the configuration.`,
      variants: [
        { label: 'Short version', answer: `Terraform provisions infrastructure (declarative, stateful). Ansible configures servers (packages, files, services). You used both.` },
      ],
      analogy: `Terraform builds the house (walls, plumbing, wiring); Ansible furnishes and maintains it (installs appliances, sets the thermostat).`,
      quickRevision: [
        'Terraform: provision infra, declarative, state',
        'Ansible: configure servers, SSH, agentless',
        'Used both in Doctor Appointment project',
        'Containers reduce the need for config management',
      ],
      followUps: [
        'What makes an Ansible task idempotent?',
        'Could Terraform do configuration management?',
      ],
    },
  ],
});
