/**
 * Career & introductory-round answers, written for MY situation (from my CVs
 * and career notes). Salary figures are placeholders on purpose:
 *   XXXX = lowest number I'd accept · YYYY = top of my range · ZZZZ = current pay
 * Replace them in my head (or locally), never in this public file.
 */
import { defineQuestions } from '../../lib/content/curated-schema';

const common = { category: 'career', perspective: 'behavioral' as const, tags: ['behavioral'] };

export default defineQuestions([
  // ---------------------------------------------------------------- Introduction
  {
    ...common,
    id: 'career-tell-me-about-yourself',
    section: 'Introduction',
    question: 'Tell me about yourself.',
    difficulty: 'easy',
    frequency: 'very-high',
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
    analogy: `It's the trailer for a movie, not the whole movie. Show the best scenes (promotion, STF, 30–45% faster, primary engineer) and end on a hook ("I'm looking for… and I can join immediately") so they want to ask about the details.`,
    quickRevision: [
      'Who: full-stack, nearly 4 years, React/TS/Node/Mongo/Postgres',
      'SmartCrowd: junior → Software Engineer (Mar 2025), STF, 30–45% faster load',
      'Firmwide: PriceEstimator.ai, primary frontend + auth/billing/notifications + CI/CD',
      'Projects: AWS + Terraform job portal; AI tools with review',
      'Close: long-term full-time role, ownership, available immediately',
    ],
    followUps: [
      'Tell me more about the Share Transfer Facility.',
      'Why did you move from SmartCrowd to a contract role?',
      'What exactly did you build at Firmwide?',
      'How do you use AI tools in your work?',
    ],
    variants: [
      {
        label: 'Frontend role',
        answer: `I'm a frontend engineer with nearly four years of production experience in React and TypeScript, in fintech and billing products. At SmartCrowd I was promoted to Software Engineer, cut initial load time by 30–45% with code splitting and lazy loading, built 20+ reusable components, added Arabic RTL support, and led the Share Transfer Facility. At Firmwide I'm the primary frontend engineer on PriceEstimator.ai: I architected a domain-driven frontend of about 450 TypeScript files and built the whole proposal-to-invoice UI with PDF export. I'm comfortable across the stack when needed, and I'm looking for a long-term frontend role where I can own the user experience and its quality. I can join immediately.`,
      },
      {
        label: 'DevOps role',
        answer: `I'm a full-stack engineer with nearly four years of production experience, moving into DevOps and cloud. In my current role at Firmwide I set up the GitHub Actions pipelines, multi-stage Docker builds and Nginx configs for staging and production. In my own projects I've gone further: Terraform modules for VPC, ALB, ECS Fargate and ElastiCache, OIDC instead of static AWS keys, approval-based promotion of the same image to production, ECS circuit-breaker rollback, and Prometheus, Grafana and Loki for monitoring, plus runbooks and a backup restore drill. Because I've built and debugged the applications myself, I understand what developers need from a pipeline. I'm looking for a DevOps or platform role where I can grow on production infrastructure.`,
      },
      {
        label: '45-second version',
        answer: `I'm a full-stack engineer with nearly four years of experience in React, TypeScript and Node.js. At SmartCrowd, a Dubai fintech, I was promoted to Software Engineer and led the Share Transfer Facility. Now I'm on a contract with Firmwide as the primary frontend engineer on a billing platform, also owning auth, notifications and CI/CD. I'm looking for a long-term full-time role with real ownership, and I can join immediately.`,
      },
    ],
    avoid: [
      'Listing every technology you know',
      'Starting with your university or childhood',
      'Ending with "I want to learn new things"; end with what you bring and what you want',
      'Saying a number of years that differs from the CV you sent',
    ],
  },
  {
    ...common,
    id: 'career-walk-through-cv',
    section: 'Introduction',
    question: 'Walk me through your CV.',
    difficulty: 'easy',
    frequency: 'high',
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
    followUps: ['Why were you promoted?', 'Is there a gap between April and May 2026?', 'Which project are you proudest of?'],
    avoid: ['Reading the CV line by line', 'Contradicting the dates on the CV you sent'],
  },
  {
    ...common,
    id: 'career-current-role',
    section: 'Introduction',
    question: 'What do you do in your current role?',
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
    followUps: [
      'How does the proposal-to-invoice workflow work?',
      'How do you prevent duplicate invoices?',
      'Why generate PDFs on the client?',
      'What was the hardest bug there?',
    ],
    avoid: ['Naming the client firm', 'Claiming you wrote the entire backend; say which modules you own'],
  },
  {
    ...common,
    id: 'career-smartcrowd-achievement',
    section: 'Introduction',
    question: 'What was your biggest achievement at SmartCrowd?',
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
    followUps: [
      'How did you prevent two buyers from buying the same listing?',
      'What exactly did you build yourself?',
      'How big was the team and how long did it take?',
    ],
    avoid: ['Saying "we" for everything; be clear about what you led'],
  },

  // ---------------------------------------------------------------- Career moves
  {
    ...common,
    id: 'career-why-left-smartcrowd',
    section: 'Career moves',
    question: 'Why did you leave SmartCrowd?',
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `> I spent about three and a half years at SmartCrowd and grew a lot. I was promoted and led important features like the Share Transfer Facility. By early 2026 I wanted **broader ownership across the whole stack**: the backend, architecture and deployment, not only frontend features. The Firmwide role gave me exactly that, as the primary engineer on a product.

Keep it **positive and forward-looking**: you moved *toward* something (ownership), not *away* from something.`,
    analogy: `Like moving from a great school to university: you didn't leave because the school was bad, you left because you'd outgrown what it could offer and wanted a bigger challenge.`,
    quickRevision: [
      '~3.5 years, promoted, led STF: grateful',
      'Wanted broader full-stack ownership (backend, architecture, deployment)',
      'Firmwide offered that as primary engineer',
      'Never criticise the previous employer',
    ],
    followUps: ['Would you go back?', 'What did you learn there that you still use?'],
    avoid: ['Complaining about salary, management or workload', 'Sounding like you left in a hurry'],
  },
  {
    ...common,
    id: 'career-why-leaving-contract',
    section: 'Career moves',
    question: 'You joined Firmwide recently. Why are you looking to move so soon?',
    difficulty: 'hard',
    frequency: 'very-high',
    answer: `This is the question to practise most, because a short stint can look like a red flag. The honest answer is that **it's a contract**:

> It's a **contract role**, and I took it on purpose: I wanted to own a product end to end as the primary engineer, which I've done. I built the frontend architecture, the billing workflow, auth and the deployment pipeline.
>
> Now I'm looking for a **long-term, full-time role** with a larger engineering team, where I can grow over several years and learn from senior engineers through code reviews and design discussions. And because it's a contract, I can **join immediately**.

If they ask *"Why a contract in the first place?"*:

> I wanted to try being the primary engineer on a product, owning everything from the APIs to deployment. A contract was a good way to do that. Now I want stability and a team to grow with.`,
    analogy: `Like a doctor doing a short rotation in a specialist ward: it was planned to be time-limited, you got the experience you went for, and now you're choosing where to settle down long term.`,
    quickRevision: [
      "Lead with: it's a contract (planned, not job-hopping)",
      'I took it to own a product end to end, and did',
      'Now: long-term full-time, bigger team, senior engineers to learn from',
      'Bonus: available immediately',
    ],
    followUps: [
      'How do we know you will stay with us long term?',
      'What happens to the Firmwide project when you leave?',
      'Would you consider another contract?',
    ],
    variants: [
      {
        label: 'If they push: "How do we know you\'ll stay?"',
        answer: `Fair question. My only move before this was after three and a half years at SmartCrowd, where I grew from junior to Software Engineer. The contract was a deliberate step to get end-to-end ownership. What I'm looking for now is exactly what this role offers, a long-term team and product, so I'm planning to grow here for several years.`,
      },
    ],
    avoid: ['Criticising Firmwide or the client', 'Sounding unsure; this answer should be calm and rehearsed'],
  },
  {
    ...common,
    id: 'career-why-this-company',
    section: 'Career moves',
    question: 'Why do you want to join our company?',
    difficulty: 'medium',
    frequency: 'very-high',
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
    followUps: ['What do you know about our product?', 'Which of our competitors do you know?'],
    avoid: ['Generic praise ("you\'re a great company")', 'Mentioning salary or remote work as the main reason'],
  },
  {
    ...common,
    id: 'career-what-looking-for',
    section: 'Career moves',
    question: 'What are you looking for in your next role?',
    difficulty: 'easy',
    frequency: 'high',
    answer: `> Three things. First, **real ownership**: features I can take from design to production, including how they run. Second, **a team I can learn from**, with strong engineers, real code reviews and design discussions. Third, **a product with real users**, where I can see the impact of my work, like I did with the load-time improvements and the STF at SmartCrowd.
>
> I'd also like to keep using my DevOps skills, because I like being responsible for how my code behaves in production. And I'm looking for a **long-term, full-time** position.`,
    analogy: `Like describing your ideal football team: the position you want to play (ownership), teammates who make you better (strong engineers) and a league that matters (real users). You're choosing them as much as they're choosing you.`,
    quickRevision: ['Ownership end to end', 'Strong team, code reviews, mentors', 'Real users, measurable impact', 'Long-term, full-time'],
    followUps: ['What would make you leave a job?', 'What kind of manager do you work best with?'],
  },
  {
    ...common,
    id: 'career-five-years',
    section: 'Career moves',
    question: 'Where do you see yourself in 3–5 years?',
    difficulty: 'easy',
    frequency: 'high',
    answer: `> In three to five years I want to be a **senior engineer** who can own a system from design to production: architecture, code quality, deployment and monitoring. I'd also like to **mentor other engineers**, as I did through code reviews at SmartCrowd. Longer term a tech lead role interests me, but I want to stay close to the code.
>
> I'd like to do that growth **in one place**, which is why I'm looking for a long-term role.`,
    analogy: `A pilot's flight plan: a clear destination (senior engineer who owns systems), a route (ownership, mentoring), and no plans to change planes halfway.`,
    quickRevision: ['Senior engineer owning systems end to end', 'Mentoring others', 'Tech lead later, still hands-on', 'Growth in one company'],
    followUps: ['What skills do you need to get there?', 'Are you planning to go abroad or do a master\'s?'],
    avoid: ['"In your seat"', 'Plans that suggest you will leave soon (moving abroad, starting a business)'],
  },

  // ---------------------------------------------------------------- Role fit
  {
    ...common,
    id: 'career-why-hire-you',
    section: 'Role fit',
    question: 'Why should we hire you?',
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `Give **three proofs**, then the practical bonus:

> First, **production experience in demanding domains**: nearly four years on regulated fintech and a billing platform, including a promotion and leading the Share Transfer Facility with no major post-release issues.
>
> Second, I **deliver across the stack**: React and TypeScript on the frontend, Node, Express, MongoDB and PostgreSQL on the backend, and CI/CD, Docker and AWS for deployment. So I can take a feature from idea to production without hand-offs.
>
> Third, **I care about measurable quality**: I cut load time by 30–45%, built reusable components that removed about 35% of duplicated UI code, and I review AI-assisted code carefully before it ships.
>
> And practically, I can **join immediately**.`,
    analogy: `Like a closing argument in court: three pieces of evidence, each with a number or a fact, then the verdict you want. Opinions ("I'm hardworking") don't convince a jury; evidence does.`,
    quickRevision: ['Proof 1: fintech + billing, promotion, STF', 'Proof 2: full stack + deployment', 'Proof 3: numbers (30–45%, ~35%)', 'Bonus: join immediately'],
    followUps: ['What would you do in your first 90 days?', 'What makes you different from other candidates?'],
    avoid: ['Generic traits without proof ("hardworking, passionate")'],
  },
  {
    ...common,
    id: 'career-frontend-backend-devops',
    section: 'Role fit',
    question: 'Frontend, backend or DevOps — which do you prefer?',
    difficulty: 'easy',
    frequency: 'high',
    tags: ['behavioral', 'react', 'nodejs', 'ci-cd'],
    answer: `Tailor this to the role, but keep it **true**:

> My strongest area is the **frontend with React and TypeScript**, but I enjoy working across the stack. I build APIs regularly, and I set up CI/CD and Docker so I can deliver a feature end to end. I'd describe myself as a **full-stack engineer with a frontend strength**.`,
    analogy: `Like a footballer who's best as a midfielder but can defend and score when the team needs it. You name your best position, but show you won't stand still when the ball is elsewhere.`,
    quickRevision: ['Default: full-stack with frontend strength', 'Frontend role → lead with React/performance', 'DevOps role → lead with pipelines/Terraform', 'Never say you dislike a part of the stack'],
    followUps: ['What backend work have you done recently?', 'What would you like to learn next?'],
    variants: [
      { label: 'Frontend role', answer: `Frontend is where I'm strongest and what I enjoy most: architecture, performance and accessibility. Knowing the backend and deployment side helps me build better UIs, because I understand the APIs and how the app is served.` },
      { label: 'DevOps role', answer: `I've enjoyed the delivery side most recently: pipelines, infrastructure as code and monitoring. My development background is an advantage there, because I know what developers need from a platform and how applications fail in production.` },
    ],
  },
  {
    ...common,
    id: 'career-why-devops',
    section: 'Role fit',
    question: 'Why are you moving into DevOps?',
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
    quickRevision: ['Motivation: understand the full lifecycle', 'Real work: Firmwide CI/CD, Docker, Nginx', 'Projects: Terraform, OIDC, ECS rollback, Prometheus/Grafana/Loki', 'Honest gap: large-scale Kubernetes'],
    followUps: ['Walk me through your SmartJobHub pipeline.', 'How do you handle secrets in CI?', 'What would you monitor for a new service?'],
    avoid: ['"I\'m learning DevOps" with no proof', 'Overclaiming production Kubernetes experience'],
  },
  {
    ...common,
    id: 'career-ai-tools',
    section: 'Role fit',
    question: 'How do you use AI coding tools like Claude Code or Cursor in your work?',
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
    quickRevision: ['Scoped specs + repo rule files', 'Parallel agents in isolated branches', 'Line-by-line review + tests; reject what fails conventions', 'Auth/billing/payment code reviewed personally', 'No secrets or client data in prompts'],
    followUps: ['Give an example of AI output you rejected.', 'How do you make sure you still understand the code?', 'Does AI make developers less necessary?'],
    avoid: ['Sounding like the AI does the work and you just accept it', 'Being dismissive of AI tools if the company uses them'],
  },

  // ---------------------------------------------------------------- About you
  {
    ...common,
    id: 'career-strengths',
    section: 'About you',
    question: 'What are your strengths?',
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `Pick **three**, each with a one-line proof:

> First, **ownership**: I don't stop at "my part works". With the Share Transfer Facility I followed it from design to production with no major issues.
>
> Second, **performance thinking**: I reduced initial load time by 30–45% at SmartCrowd.
>
> Third, **working across the stack**: I can build the UI, the API and the pipeline, which makes me faster at delivering complete features.`,
    analogy: `Like a product page: every feature claim ("long battery life") needs a spec next to it ("20 hours"). A strength without proof is just an adjective.`,
    quickRevision: ['Ownership → STF', 'Performance → 30–45%', 'Full stack → UI + API + pipeline', 'Three is enough'],
    followUps: ['Which strength would your manager mention first?', 'Give another example of ownership.'],
  },
  {
    ...common,
    id: 'career-weakness',
    section: 'About you',
    question: 'What is your biggest weakness?',
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `A **real** weakness, plus what you're **doing** about it:

> I used to start implementing too quickly instead of discussing the approach first, which sometimes meant rework. Now, for anything non-trivial, I write a short plan or discuss it with my lead or the PM before coding. It has reduced misunderstandings a lot, and it fits well with how I work with AI tools, where a clear spec matters even more.`,
    analogy: `Like admitting you used to drive without checking the map: an honest habit you've noticed, and the specific fix (plan before you drive) that shows you've grown.`,
    quickRevision: ['Real weakness: jumping into code too fast', 'Fix: short plan / discussion first', 'Result: less rework', 'Avoid fake weaknesses'],
    followUps: ['Give an example where that caused a problem.', 'What else are you working on improving?'],
    variants: [
      { label: 'Technical alternative', answer: `I'm less experienced with running Kubernetes at production scale. I've deployed on EKS in my projects, but not at real scale, so I'm closing that gap by building and breaking things in my own cluster and reading postmortems from teams that run it.` },
    ],
    avoid: ['"I\'m a perfectionist" / "I work too hard"', 'A weakness that is core to the job (e.g. "I find debugging hard")'],
  },
  {
    ...common,
    id: 'behavioral-hardest-bug',
    section: 'About you',
    question: 'Tell me about the most difficult bug you have fixed.',
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
    quickRevision: ['Symptom: random 401 logouts, prod only', 'Clue: parallel refresh calls', 'Root cause: rotating refresh tokens race', 'Fix: single-flight refresh + queued retries', 'Also: auth bootstrap + refresh every 12 min (15-min token)'],
    followUps: ['How did you know it was really fixed?', 'Why do refresh tokens rotate?', 'Tell me about another production bug.'],
    avoid: ['A bug fixed by "restarting the server"', 'Skipping how you found the root cause'],
  },

  // ---------------------------------------------------------------- Logistics & salary
  {
    ...common,
    id: 'career-salary-expectation',
    section: 'Logistics & salary',
    question: 'What is your salary expectation?',
    difficulty: 'hard',
    frequency: 'very-high',
    answer: `Research the market range for the role and level **before** the call, then give a **range** whose bottom is a number you'd genuinely accept:

> Based on my experience and the scope of this role, I'm looking for something in the range of **XXXX to YYYY** per month. I'm open to discussing it based on the overall package and growth opportunities.

If they ask **first** and you haven't heard their budget:

> I'd like to understand the role and responsibilities a bit more first. Could you share the budgeted range for this position? I'm sure we can find something that works.

If they say your range is too high:

> I understand. I'm flexible for the right role, especially with a clear growth path and a review after six months. What range did you have in mind?`,
    analogy: `Like naming a price when selling something you value: know the market price beforehand, name a range with your real minimum at the bottom, and leave room to talk. Saying "anything is fine" tells them you'll accept the lowest offer.`,
    quickRevision: [
      'XXXX = lowest you\'d accept · YYYY = top of range',
      'Research the market range before every call',
      'Give a range, not one number',
      'Mention flexibility: package, growth, review',
    ],
    followUps: ['Is that negotiable?', 'Is that gross or net?', 'What currency are you expecting?'],
    variants: [
      { label: 'Remote / international (USD)', answer: `For a remote role with an international team, I'm looking for **USD XXXX–YYYY per month**, depending on the scope and whether it's full-time employment or a contract.` },
      { label: '"Is it negotiable?"', answer: `Yes, I'm flexible depending on the role scope, growth opportunity and total package.` },
    ],
    avoid: ['Saying "anything is fine"', 'Giving a range whose bottom you wouldn\'t actually accept', 'Raising salary before they do in the first minutes'],
  },
  {
    ...common,
    id: 'career-current-salary',
    section: 'Logistics & salary',
    question: 'What is your current salary?',
    difficulty: 'medium',
    frequency: 'high',
    answer: `You can share it or redirect. Redirecting politely is common and acceptable:

> I'd prefer to focus on the value I can bring to this role and the market range for it. My expectation is **XXXX–YYYY**.

If you're comfortable sharing, or they insist:

> I'm currently on a contract at **ZZZZ** per month. For a full-time role with this scope, I'm looking for **XXXX–YYYY**.`,
    analogy: `When a buyer asks what you paid for your car, the answer that matters is what the car is worth today. Your current pay is history; your expectation is about this role.`,
    quickRevision: ['ZZZZ = current pay (share only if comfortable)', 'Default: redirect to expectation XXXX–YYYY', 'Contract vs full-time packages differ; say so'],
    followUps: ['Why do you expect more than you earn now?', 'Do you have other offers?'],
    avoid: ['Inventing a number', 'Getting defensive'],
  },
  {
    ...common,
    id: 'career-notice-period',
    section: 'Logistics & salary',
    question: 'What is your notice period? When can you join?',
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `> I'm on a contract, so I can **join immediately**. I'd just like to give my current client a short, professional handover, which I can do in parallel or within the first few days if needed.

Mention it confidently: being available now is a real advantage.`,
    analogy: `Like a taxi that's already free: you don't need to wait for it to drop someone off first. Just say it plainly.`,
    quickRevision: ['Available immediately (contract)', 'Offer a short, professional handover', 'State it as an advantage'],
    followUps: ['Can you start next Monday?', 'Do you have any planned leave?'],
  },
  {
    ...common,
    id: 'career-remote-onsite',
    section: 'Logistics & salary',
    question: 'Are you comfortable working remotely, hybrid or onsite? What about time zones?',
    difficulty: 'easy',
    frequency: 'high',
    answer: `> I've worked **remotely for nearly four years**: with a Dubai-based team at SmartCrowd and now on a remote contract with Firmwide. I'm comfortable with async communication: I write clear updates, raise blockers early, document decisions in tickets or PRs, and share short videos when something is easier to show than explain.
>
> I'm also happy to work **[onsite / hybrid]**, and I can adjust my hours for good overlap with the team's time zone.`,
    analogy: `Like a musician who has played in a band over video calls for years: you know how to keep time without being in the same room, and you'd also enjoy playing on stage together.`,
    quickRevision: ['Nearly 4 years remote (Dubai team, Firmwide)', 'Async habits: updates, early blockers, written decisions', 'Open to onsite/hybrid; flexible hours for overlap'],
    followUps: ['How many hours of overlap can you offer?', 'How do you stay productive at home?'],
  },

  // ---------------------------------------------------------------- Your questions
  {
    ...common,
    id: 'career-questions-for-them',
    section: 'Your questions',
    question: 'Do you have any questions for us?',
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `**Always say yes.** Ask two or three; pick based on who's interviewing you.

**For an engineer or manager:**
- What would success look like for this role in the first three to six months?
- How does a feature go from idea to production here: reviews, testing, deployment?
- What's the biggest technical challenge the team is facing right now?
- How do engineers grow here: mentoring, code reviews, a path to senior?

**For a recruiter or talent platform:**
- What kinds of clients or teams would my profile fit best?
- What does the process look like after this conversation?
- Is there anything in my CV I should strengthen for your clients?
- Is it full-time or contract, and what time-zone overlap do clients usually expect?`,
    analogy: `The interview is a two-way date. Asking good questions shows you're choosing them as carefully as they're choosing you, and it tells you whether you'd actually be happy there.`,
    quickRevision: ['Always ask 2–3', 'Engineer: success in 90 days, delivery process, challenges, growth', 'Recruiter: best-fit clients, next steps, CV gaps', 'Salary questions only after they raise it'],
    followUps: ['(They may ask what you think of their answers; be genuine.)', 'Is there anything that concerns you about the role?'],
    avoid: ['"No, I think you covered everything"', 'Questions answered on their homepage', 'Only asking about salary and leave'],
  },
]);
