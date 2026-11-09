import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Career Moves & Role Fit',
  description: 'Why you are leaving, why this company and why they should hire you.',
  questions: [
    {
      id: 'career-why-left-smartcrowd',
      question: 'Why did you leave SmartCrowd?',
      section: 'Career moves',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `> I spent about three and a half years at SmartCrowd and grew a lot. I was promoted and led important features like the Share Transfer Facility. By early 2026 I wanted **broader ownership across the whole stack**: the backend, architecture and deployment, not only frontend features. The Firmwide role gave me exactly that, as the primary engineer on a product.

Keep it **positive and forward-looking**: you moved *toward* something (ownership), not *away* from something.`,
      analogy: `Like moving from a great school to university: you didn't leave because the school was bad, you left because you'd outgrown what it could offer and wanted a bigger challenge.`,
      quickRevision: [
        '~3.5 years, promoted, led STF: grateful',
        'Wanted broader full-stack ownership (backend, architecture, deployment)',
        'Firmwide offered that as primary engineer',
        'Never criticise the previous employer',
      ],
      avoid: [
        'Complaining about salary, management or workload',
        'Sounding like you left in a hurry',
      ],
      followUps: [
        'Would you go back?',
        'What did you learn there that you still use?',
      ],
    },
    {
      id: 'career-why-leaving-contract',
      question: 'You joined Firmwide recently. Why are you looking to move so soon?',
      section: 'Career moves',
      perspective: 'behavioral',
      difficulty: 'hard',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `This is the question to practise most, because a short stint can look like a red flag. The honest answer is that **it's a contract**:

> It's a **contract role**, and I took it on purpose: I wanted to own a product end to end as the primary engineer, which I've done. I built the frontend architecture, the billing workflow, auth and the deployment pipeline.
>
> Now I'm looking for a **long-term, full-time role** with a larger engineering team, where I can grow over several years and learn from senior engineers through code reviews and design discussions. And because it's a contract, I can **join immediately**.

If they ask *"Why a contract in the first place?"*:

> I wanted to try being the primary engineer on a product, owning everything from the APIs to deployment. A contract was a good way to do that. Now I want stability and a team to grow with.`,
      variants: [
        { label: 'If they push: "How do we know you\'ll stay?"', answer: `Fair question. My only move before this was after three and a half years at SmartCrowd, where I grew from junior to Software Engineer. The contract was a deliberate step to get end-to-end ownership. What I'm looking for now is exactly what this role offers, a long-term team and product, so I'm planning to grow here for several years.` },
      ],
      analogy: `Like a doctor doing a short rotation in a specialist ward: it was planned to be time-limited, you got the experience you went for, and now you're choosing where to settle down long term.`,
      quickRevision: [
        'Lead with: it\'s a contract (planned, not job-hopping)',
        'I took it to own a product end to end, and did',
        'Now: long-term full-time, bigger team, senior engineers to learn from',
        'Bonus: available immediately',
      ],
      avoid: [
        'Criticising Firmwide or the client',
        'Sounding unsure; this answer should be calm and rehearsed',
      ],
      followUps: [
        'How do we know you will stay with us long term?',
        'What happens to the Firmwide project when you leave?',
        'Would you consider another contract?',
      ],
    },
    {
      id: 'career-why-this-company',
      question: 'Why do you want to join our company?',
      section: 'Career moves',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `Use this template after **20 minutes of research** (website, product, LinkedIn, engineering blog, recent news):

> I looked into **[company]** and three things stood out. You work on **[product / clients / domain]**, which is close to my experience in **[fintech / billing / SaaS]**. You use **[stack]**, which matches what I've been building with for nearly four years. And **[culture point: code reviews, long-term product work, engineering blog, growth path]**.
>
> I'm looking for a place where I can grow for several years and own meaningful features, and this role fits that.

Always connect **their** need to **your** evidence (for example: "you're scaling a React + Node product, and I've led performance work that cut load time by 30–45%").`,
      analogy: `Like a cover letter in one minute: not "I need a job", but "here's what I noticed about you, and here's why I fit". The more specific the first part, the more believable the second.`,
      quickRevision: [
        'Research for 20 minutes before every interview',
        'Three reasons: product/domain, stack, culture or growth',
        'Link their need to one of your proof points',
        'End with: I want to grow here long term',
      ],
      avoid: [
        'Generic praise ("you\'re a great company")',
        'Mentioning salary or remote work as the main reason',
      ],
      followUps: [
        'What do you know about our product?',
        'Which of our competitors do you know?',
      ],
    },
    {
      id: 'career-what-looking-for',
      question: 'What are you looking for in your next role?',
      section: 'Career moves',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['behavioral'],
      answer: `> Three things. First, **real ownership**: features I can take from design to production, including how they run. Second, **a team I can learn from**, with strong engineers, real code reviews and design discussions. Third, **a product with real users**, where I can see the impact of my work, like I did with the load-time improvements and the STF at SmartCrowd.
>
> I'd also like to keep using my DevOps skills, because I like being responsible for how my code behaves in production. And I'm looking for a **long-term, full-time** position.`,
      analogy: `Like describing your ideal football team: the position you want to play (ownership), teammates who make you better (strong engineers) and a league that matters (real users). You're choosing them as much as they're choosing you.`,
      quickRevision: [
        'Ownership end to end',
        'Strong team, code reviews, mentors',
        'Real users, measurable impact',
        'Long-term, full-time',
      ],
      followUps: [
        'What would make you leave a job?',
        'What kind of manager do you work best with?',
      ],
    },
    {
      id: 'career-five-years',
      question: 'Where do you see yourself in 3–5 years?',
      section: 'Career moves',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['behavioral'],
      answer: `> In three to five years I want to be a **senior engineer** who can own a system from design to production: architecture, code quality, deployment and monitoring. I'd also like to **mentor other engineers**, as I did through code reviews at SmartCrowd. Longer term a tech lead role interests me, but I want to stay close to the code.
>
> I'd like to do that growth **in one place**, which is why I'm looking for a long-term role.`,
      analogy: `A pilot's flight plan: a clear destination (senior engineer who owns systems), a route (ownership, mentoring), and no plans to change planes halfway.`,
      quickRevision: [
        'Senior engineer owning systems end to end',
        'Mentoring others',
        'Tech lead later, still hands-on',
        'Growth in one company',
      ],
      avoid: [
        '"In your seat"',
        'Plans that suggest you will leave soon (moving abroad, starting a business)',
      ],
      followUps: [
        'What skills do you need to get there?',
        'Are you planning to go abroad or do a master\'s?',
      ],
    },
    {
      id: 'career-why-hire-you',
      question: 'Why should we hire you?',
      section: 'Role fit',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `Give **three proofs**, then the practical bonus:

> First, **production experience in demanding domains**: nearly four years on regulated fintech and a billing platform, including a promotion and leading the Share Transfer Facility with no major post-release issues.
>
> Second, I **deliver across the stack**: React and TypeScript on the frontend, Node, Express, MongoDB and PostgreSQL on the backend, and CI/CD, Docker and AWS for deployment. So I can take a feature from idea to production without hand-offs.
>
> Third, **I care about measurable quality**: I cut load time by 30–45%, built reusable components that removed about 35% of duplicated UI code, and I review AI-assisted code carefully before it ships.
>
> And practically, I can **join immediately**.`,
      analogy: `Like a closing argument in court: three pieces of evidence, each with a number or a fact, then the verdict you want. Opinions ("I'm hardworking") don't convince a jury; evidence does.`,
      quickRevision: [
        'Proof 1: fintech + billing, promotion, STF',
        'Proof 2: full stack + deployment',
        'Proof 3: numbers (30–45%, ~35%)',
        'Bonus: join immediately',
      ],
      avoid: [
        'Generic traits without proof ("hardworking, passionate")',
      ],
      followUps: [
        'What would you do in your first 90 days?',
        'What makes you different from other candidates?',
      ],
    },
    {
      id: 'career-frontend-backend-devops',
      question: 'Frontend, backend or DevOps — which do you prefer?',
      section: 'Role fit',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['behavioral', 'react', 'nodejs', 'ci-cd'],
      answer: `Tailor this to the role, but keep it **true**:

> My strongest area is the **frontend with React and TypeScript**, but I enjoy working across the stack. I build APIs regularly, and I set up CI/CD and Docker so I can deliver a feature end to end. I'd describe myself as a **full-stack engineer with a frontend strength**.`,
      variants: [
        { label: 'Frontend role', answer: `Frontend is where I'm strongest and what I enjoy most: architecture, performance and accessibility. Knowing the backend and deployment side helps me build better UIs, because I understand the APIs and how the app is served.` },
        { label: 'DevOps role', answer: `I've enjoyed the delivery side most recently: pipelines, infrastructure as code and monitoring. My development background is an advantage there, because I know what developers need from a platform and how applications fail in production.` },
      ],
      analogy: `Like a footballer who's best as a midfielder but can defend and score when the team needs it. You name your best position, but show you won't stand still when the ball is elsewhere.`,
      quickRevision: [
        'Default: full-stack with frontend strength',
        'Frontend role → lead with React/performance',
        'DevOps role → lead with pipelines/Terraform',
        'Never say you dislike a part of the stack',
      ],
      followUps: [
        'What backend work have you done recently?',
        'What would you like to learn next?',
      ],
    },
    {
      id: 'career-why-devops',
      question: 'Why are you moving into DevOps?',
      section: 'Role fit',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['behavioral', 'ci-cd', 'aws', 'docker'],
      answer: `Show it's a **natural extension** of your work, with proof, not a sudden switch:

> Working on both frontend and backend showed me that building the application is only part of the job. I wanted to understand how software is built, tested, deployed and monitored in production.
>
> At Firmwide I set up the GitHub Actions pipelines, Docker builds and Nginx configs myself. In my own projects I went further: **Terraform** for VPC, ALB, ECS Fargate and ElastiCache, **OIDC** instead of static AWS keys, promoting the **same image** from staging to production after approval, **ECS circuit-breaker rollback**, and **Prometheus, Grafana and Loki** monitoring, with runbooks and a backup restore drill.
>
> I'm honest about the gap: I haven't run Kubernetes at large production scale yet. But I've deployed on EKS and I learn fastest by building and breaking things.`,
      analogy: `Like a chef who started learning how the kitchen itself is designed: where the gas lines run, how food gets from fridge to table safely. It makes you a better chef, and eventually you can design kitchens.`,
      quickRevision: [
        'Motivation: understand the full lifecycle',
        'Real work: Firmwide CI/CD, Docker, Nginx',
        'Projects: Terraform, OIDC, ECS rollback, Prometheus/Grafana/Loki',
        'Honest gap: large-scale Kubernetes',
      ],
      avoid: [
        '"I\'m learning DevOps" with no proof',
        'Overclaiming production Kubernetes experience',
      ],
      followUps: [
        'Walk me through your SmartJobHub pipeline.',
        'How do you handle secrets in CI?',
        'What would you monitor for a new service?',
      ],
    },
    {
      id: 'career-ai-tools',
      question: 'How do you use AI coding tools like Claude Code or Cursor in your work?',
      section: 'Role fit',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['behavioral', 'testing'],
      answer: `This is on your full-stack CV, so expect it. Show **speed with control**:

> They're my main development environment, at Firmwide and in my own projects. I break a feature into **scoped specs**, and sometimes run parallel agents on separate parts like API, UI and tests in isolated branches, guided by rule files that describe the repo's conventions.
>
> The important part is verification: I **review the output line by line**, run the tests, and rewrite or reject anything that doesn't meet our conventions or security rules. I **personally review all auth, billing and payment code**, and I keep secrets and client data out of prompts.
>
> The result is that I ship faster, but the responsibility for the code is still mine.`,
      analogy: `Like working with a very fast junior developer: you give clear tasks, they produce a lot quickly, and you review everything before it merges. You'd never let them push straight to production on the payments code.`,
      quickRevision: [
        'Scoped specs + repo rule files',
        'Parallel agents in isolated branches',
        'Line-by-line review + tests; reject what fails conventions',
        'Auth/billing/payment code reviewed personally',
        'No secrets or client data in prompts',
      ],
      avoid: [
        'Sounding like the AI does the work and you just accept it',
        'Being dismissive of AI tools if the company uses them',
      ],
      followUps: [
        'Give an example of AI output you rejected.',
        'How do you make sure you still understand the code?',
        'Does AI make developers less necessary?',
      ],
    },
  ],
});
