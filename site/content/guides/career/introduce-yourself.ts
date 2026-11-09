import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Introduce Yourself',
  description: 'Tell me about yourself, walking through your CV, strengths and weaknesses.',
  questions: [
    {
      id: 'career-tell-me-about-yourself',
      question: 'Tell me about yourself.',
      section: 'Introduction',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `> I'm Hazrat, a full-stack engineer from Bangladesh with **nearly four years of production experience**, mainly React, TypeScript, Node.js, MongoDB and PostgreSQL.
>
> I started at **SmartCrowd**, a regulated real-estate investment platform in Dubai, working remotely. I joined as a junior engineer and was **promoted to Software Engineer in March 2025**. I led delivery of the **Share Transfer Facility** with no major post-release issues, cut the app's initial load time by **30–45%**, and integrated 5+ financial APIs for a platform with 10K+ active users.
>
> Since **May 2026** I've been on a remote contract with **Firmwide**, building **PriceEstimator.ai**, a fee-estimation and billing platform for an architecture and design firm. I'm the primary frontend engineer and I own key backend modules: authentication and roles, Microsoft SSO, real-time notifications and most of the proposal-to-invoice billing workflow, plus the CI/CD pipeline.
>
> Outside work I build projects with a deployment focus, like a job portal running on AWS with Terraform, and I use AI coding tools like Claude Code and Cursor daily, with careful review.
>
> Now I'm looking for a **long-term, full-time role** where I can own features end to end and grow toward senior. And I can **join immediately**.

Aim for **90 seconds**. Remember the flow, not the words: *who I am → SmartCrowd (promotion + impact) → Firmwide (ownership) → projects → what I want now*.`,
      variants: [
        { label: 'Frontend role', answer: `I'm a frontend engineer with nearly four years of production experience in React and TypeScript, in fintech and billing products. At SmartCrowd I was promoted to Software Engineer, cut initial load time by 30–45% with code splitting and lazy loading, built 20+ reusable components, added Arabic RTL support, and led the Share Transfer Facility. At Firmwide I'm the primary frontend engineer on PriceEstimator.ai: I architected a domain-driven frontend of about 450 TypeScript files and built the whole proposal-to-invoice UI with PDF export. I'm comfortable across the stack when needed, and I'm looking for a long-term frontend role where I can own the user experience and its quality. I can join immediately.` },
        { label: 'DevOps role', answer: `I'm a full-stack engineer with nearly four years of production experience, moving into DevOps and cloud. In my current role at Firmwide I set up the GitHub Actions pipelines, multi-stage Docker builds and Nginx configs for staging and production. In my own projects I've gone further: Terraform modules for VPC, ALB, ECS Fargate and ElastiCache, OIDC instead of static AWS keys, approval-based promotion of the same image to production, ECS circuit-breaker rollback, and Prometheus, Grafana and Loki for monitoring, plus runbooks and a backup restore drill. Because I've built and debugged the applications myself, I understand what developers need from a pipeline. I'm looking for a DevOps or platform role where I can grow on production infrastructure.` },
        { label: '45-second version', answer: `I'm a full-stack engineer with nearly four years of experience in React, TypeScript and Node.js. At SmartCrowd, a Dubai fintech, I was promoted to Software Engineer and led the Share Transfer Facility. Now I'm on a contract with Firmwide as the primary frontend engineer on a billing platform, also owning auth, notifications and CI/CD. I'm looking for a long-term full-time role with real ownership, and I can join immediately.` },
      ],
      analogy: `It's the trailer for a movie, not the whole movie. Show the best scenes (promotion, STF, 30–45% faster, primary engineer) and end on a hook ("I'm looking for… and I can join immediately") so they want to ask about the details.`,
      quickRevision: [
        'Who: full-stack, nearly 4 years, React/TS/Node/Mongo/Postgres',
        'SmartCrowd: junior → Software Engineer (Mar 2025), STF, 30–45% faster load',
        'Firmwide: PriceEstimator.ai, primary frontend + auth/billing/notifications + CI/CD',
        'Projects: AWS + Terraform job portal; AI tools with review',
        'Close: long-term full-time role, ownership, available immediately',
      ],
      avoid: [
        'Listing every technology you know',
        'Starting with your university or childhood',
        'Ending with "I want to learn new things"; end with what you bring and what you want',
        'Saying a number of years that differs from the CV you sent',
      ],
      followUps: [
        'Tell me more about the Share Transfer Facility.',
        'Why did you move from SmartCrowd to a contract role?',
        'What exactly did you build at Firmwide?',
        'How do you use AI tools in your work?',
      ],
    },
    {
      id: 'career-walk-through-cv',
      question: 'Walk me through your CV.',
      section: 'Introduction',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['behavioral'],
      answer: `Go **in order**, one or two sentences per step, and say *why* each move happened:

> I graduated in ICT from **Mawlana Bhashani Science and Technology University** in 2022 with a CGPA of 3.53, and that December I joined **SmartCrowd** as a Junior Software Engineer, working remotely for their Dubai team.
>
> For the first two years I mostly built React and Redux features: investment, portfolio and transaction flows, and reusable components. As I took on more ownership, I also built Node.js APIs and handled performance work, and in **March 2025** I was promoted. After that I led the **Share Transfer Facility**.
>
> In **April 2026** I wanted broader ownership across the whole stack, so in **May** I joined **Firmwide** on a contract as the primary frontend engineer on PriceEstimator.ai. I also own the auth, notifications and billing modules on the backend and the deployment pipeline.
>
> Alongside work I've been building projects that go deeper into DevOps and AWS.`,
      analogy: `Like a short guided tour of a house: walk room by room in order (university → SmartCrowd → promotion → Firmwide), point out one highlight in each room, and explain why you moved to the next one. Don't stop to describe every piece of furniture.`,
      quickRevision: [
        'B.Sc. ICT, MBSTU, 2022, CGPA 3.53',
        'SmartCrowd Dec 2022 – Apr 2026; promoted Mar 2025; led STF',
        'Firmwide (PriceEstimator.ai) May 2026 – now, contract, remote',
        'Explain the reason for each move in one line',
      ],
      avoid: [
        'Reading the CV line by line',
        'Contradicting the dates on the CV you sent',
      ],
      followUps: [
        'Why were you promoted?',
        'Is there a gap between April and May 2026?',
        'Which project are you proudest of?',
      ],
    },
    {
      id: 'career-current-role',
      question: 'What do you do in your current role?',
      section: 'Introduction',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['behavioral', 'react', 'nodejs'],
      answer: `> At **Firmwide** I work on **PriceEstimator.ai**, a platform for an architecture and design firm. It reads client enquiry emails from Microsoft 365, uses AI to extract project details and estimate fees, and then manages proposals through to billing.
>
> I'm the **primary frontend engineer**. I moved the app to TypeScript and a **domain-driven structure** of about 450 files with enforced import boundaries, and I built most of the UI, including the **proposal-to-invoice workflow** with multi-currency invoices and PDF export.
>
> On the backend I **own several modules** in Express, MongoDB and Redis: JWT auth with roles, **Microsoft SSO** and Graph integration, OTP-based invitations, **Socket.IO notifications** and most of the billing workflow. I also set up the **GitHub Actions CI/CD**, with multi-stage Docker builds and Nginx for staging and production.
>
> Day to day I plan features, build them across the stack, review my own and AI-generated code carefully, and deploy.`,
      analogy: `Describe your job like a chef describing their kitchen: what the restaurant serves (the product), which stations you run yourself (frontend, billing, auth), and which ones you help at (other backend modules). Being precise about your station makes you more believable, not less.`,
      quickRevision: [
        'Product: enquiry emails → AI fee estimate → proposals → invoices',
        'Primary frontend: TypeScript, ~450-file domain architecture, invoice + PDF UI',
        'Backend modules I own: auth/roles, Microsoft SSO, invitations, notifications, billing',
        'CI/CD: GitHub Actions, multi-stage Docker, Nginx',
        'Keep the client anonymous: "an architecture and design firm"',
      ],
      avoid: [
        'Naming the client firm',
        'Claiming you wrote the entire backend; say which modules you own',
      ],
      followUps: [
        'How does the proposal-to-invoice workflow work?',
        'How do you prevent duplicate invoices?',
        'Why generate PDFs on the client?',
        'What was the hardest bug there?',
      ],
    },
    {
      id: 'career-smartcrowd-achievement',
      question: 'What was your biggest achievement at SmartCrowd?',
      section: 'Introduction',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['behavioral', 'react'],
      answer: `Tell the **Share Transfer Facility** (STF) as a short STAR story:

> **Situation.** SmartCrowd lets investors own fractional shares of properties. Their main problem was liquidity: once they invested, they couldn't easily exit.
>
> **Task.** The STF let investors list their shares and other investors buy them. It moved real money and share ownership on a **regulated** platform, so mistakes could mean wrong ownership records or balances. I led the delivery.
>
> **Action.** I worked with the backend and design teams to define the flow and, importantly, the **edge cases before coding**: two buyers for the same listing, a payment failing halfway, cancelled listings, and what each user sees in each state. We treated the transfer as a strict state flow validated on the server, tested every edge case on staging with QA, and I monitored Sentry and LogRocket closely after release.
>
> **Result.** It launched with **zero major post-release production issues** and became an important exit option for investors.

Backup achievement: cutting initial load time by **30–45%** with code splitting, lazy loading and optimising legacy components.`,
      analogy: `A good achievement story is like a bridge: show the river (the problem: investors couldn't exit), why the bridge had to be safe (real money), how you built it (edge cases first), and that people now cross it every day (launched with no major issues).`,
      quickRevision: [
        'STF = investors sell shares to other investors (liquidity)',
        'Stakes: real money + ownership on a regulated platform',
        'Edge cases agreed before coding; strict server-validated states',
        'Staging QA + Sentry/LogRocket monitoring after release',
        'Result: zero major post-release issues',
      ],
      avoid: [
        'Saying "we" for everything; be clear about what you led',
      ],
      followUps: [
        'How did you prevent two buyers from buying the same listing?',
        'What exactly did you build yourself?',
        'How big was the team and how long did it take?',
      ],
    },
    {
      id: 'career-strengths',
      question: 'What are your strengths?',
      section: 'About you',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `Pick **three**, each with a one-line proof:

> First, **ownership**: I don't stop at "my part works". With the Share Transfer Facility I followed it from design to production with no major issues.
>
> Second, **performance thinking**: I reduced initial load time by 30–45% at SmartCrowd.
>
> Third, **working across the stack**: I can build the UI, the API and the pipeline, which makes me faster at delivering complete features.`,
      analogy: `Like a product page: every feature claim ("long battery life") needs a spec next to it ("20 hours"). A strength without proof is just an adjective.`,
      quickRevision: [
        'Ownership → STF',
        'Performance → 30–45%',
        'Full stack → UI + API + pipeline',
        'Three is enough',
      ],
      followUps: [
        'Which strength would your manager mention first?',
        'Give another example of ownership.',
      ],
    },
    {
      id: 'career-weakness',
      question: 'What is your biggest weakness?',
      section: 'About you',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `A **real** weakness, plus what you're **doing** about it:

> I used to start implementing too quickly instead of discussing the approach first, which sometimes meant rework. Now, for anything non-trivial, I write a short plan or discuss it with my lead or the PM before coding. It has reduced misunderstandings a lot, and it fits well with how I work with AI tools, where a clear spec matters even more.`,
      variants: [
        { label: 'Technical alternative', answer: `I'm less experienced with running Kubernetes at production scale. I've deployed on EKS in my projects, but not at real scale, so I'm closing that gap by building and breaking things in my own cluster and reading postmortems from teams that run it.` },
      ],
      analogy: `Like admitting you used to drive without checking the map: an honest habit you've noticed, and the specific fix (plan before you drive) that shows you've grown.`,
      quickRevision: [
        'Real weakness: jumping into code too fast',
        'Fix: short plan / discussion first',
        'Result: less rework',
        'Avoid fake weaknesses',
      ],
      avoid: [
        '"I\'m a perfectionist" / "I work too hard"',
        'A weakness that is core to the job (e.g. "I find debugging hard")',
      ],
      followUps: [
        'Give an example where that caused a problem.',
        'What else are you working on improving?',
      ],
    },
    {
      id: 'behavioral-hardest-bug',
      question: 'Tell me about the most difficult bug you have fixed.',
      section: 'About you',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['behavioral', 'auth-security', 'react'],
      answer: `Use **STAR**, and spend most of the time on the **Action**. A strong real example from Firmwide:

> **Situation.** Users were randomly logged out with 401 errors in production, not on every request and not reproducible locally.
>
> **Action.** I reproduced it by opening a page that fires several API calls at once with an expired access token. In the Network tab I saw **several refresh requests in parallel**. Because refresh tokens **rotate**, the first refresh succeeded and invalidated the token the others were using, so they failed and logged the user out.
>
> **Fix.** I made the refresh **single-flight**: the first 401 starts the refresh and stores the promise, every other request waits for that same promise, and requests that failed meanwhile are queued in the Axios interceptor and retried with the new token.
>
> I also fixed the first page load: protected queries were mounting before the app had a fresh token. I added an **auth bootstrap** that refreshes once before rendering, plus a **proactive refresh every 12 minutes** for a 15-minute token.
>
> **Result.** The random logouts and the 401s on first load stopped.

Other strong stories to prepare: AI chatbot streaming that worked locally but not in production (**Nginx buffering**), and users stuck on an old version after deployments (**stale chunks**).`,
      analogy: `Tell it like a detective story: the crime (random logouts), the clues (parallel refresh calls in the Network tab), the culprit (rotating refresh tokens racing each other), and how you changed the locks (one shared refresh, refreshed before it expires).`,
      quickRevision: [
        'Symptom: random 401 logouts, prod only',
        'Clue: parallel refresh calls',
        'Root cause: rotating refresh tokens race',
        'Fix: single-flight refresh + queued retries',
        'Also: auth bootstrap + refresh every 12 min (15-min token)',
      ],
      avoid: [
        'A bug fixed by "restarting the server"',
        'Skipping how you found the root cause',
      ],
      followUps: [
        'How did you know it was really fixed?',
        'Why do refresh tokens rotate?',
        'Tell me about another production bug.',
      ],
    },
  ],
});
