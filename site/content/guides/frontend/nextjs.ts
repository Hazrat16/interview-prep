import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Next.js',
  description: 'SSR, SSG, ISR, Server Components, hydration and the App Router.',
  questions: [
    {
      id: 'nextjs-rendering-strategies',
      question: 'SSR vs SSG vs ISR vs CSR — which would you use for which pages?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['nextjs', 'react', 'performance'],
      answer: `They differ in **when the HTML is produced**:

- **SSG (static)**: HTML built **at build time** and served from a CDN. Fastest and cheapest. Good for marketing pages, docs, blogs (this site is fully static).
- **ISR**: static, but **regenerated in the background** after a revalidate interval or on demand (\`revalidatePath\` / \`revalidateTag\`). Good for product pages or listings that change occasionally.
- **SSR (dynamic)**: HTML rendered **per request** on the server. Fresh and personalised, with good SEO, at a server cost per request. Good for dashboards with user-specific data that needs SEO or a fast first paint, and pages that depend on cookies or headers.
- **CSR**: the server sends a shell and the browser fetches and renders. Fine behind a login where SEO doesn't matter (admin panels), but slower first content.

In the Next.js App Router this is chosen **per route and per fetch**: static by default, dynamic when you use \`cookies()\`, \`headers()\` or uncached fetches, ISR with \`revalidate\`. I pick per page based on **how fresh** the data must be, **who** it's for (public or personalised) and whether **SEO** matters.`,
      analogy: `A bakery. SSG: bread baked before opening, so it's instant but the same for everyone. ISR: shelves restocked with fresh loaves every hour. SSR: a custom cake made when you order. CSR: you get a kit and bake it at home.`,
      quickRevision: [
        'SSG = build time; ISR = static + background regeneration',
        'SSR = per request (fresh, personalised, server cost)',
        'CSR = browser renders (fine behind auth, weak SEO/first paint)',
        'App Router: static by default; dynamic via cookies/headers/no-store',
        'Decide by freshness, personalisation, SEO',
      ],
      followUps: [
        'How do `revalidateTag` and on-demand revalidation work?',
        'What is streaming SSR with Suspense?',
        'Why can\'t a static export (GitHub Pages) use ISR?',
      ],
    },
    {
      id: 'nextjs-server-vs-client-components',
      question: 'Server Components vs Client Components in the Next.js App Router?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['nextjs', 'react'],
      answer: `In the App Router, components are **Server Components by default**. They run only on the server (or at build time), can be \`async\` and read the database or secrets directly, and **send no JavaScript** to the browser, only their rendered output.

You add \`'use client'\` at the top of a file when a component needs **interactivity or browser features**: state, effects, event handlers, \`window\`, \`localStorage\`, or browser-only libraries. That file and everything it imports become part of the client bundle.

Patterns I follow:

- Keep \`'use client'\` at the **leaves** (a button, a form, a chart), not on whole pages.
- Server Components can render Client Components and pass them **serialisable props**, or pass server-rendered content as \`children\`.
- A Client Component can't import a Server Component directly, but it can receive one as \`children\`.
- Don't pass secrets or huge objects as props to client components; they're serialised into the page.

The benefit is smaller bundles and data fetching close to the source, without client-side waterfalls.`,
      analogy: `A restaurant. Server Components are the kitchen: they use the private pantry (database, secrets) and send out finished plates. Client Components are the tableside staff who can react to the guest (clicks, typing). You don't put the whole kitchen at the table, only the people who need to interact.`,
      quickRevision: [
        'Default = Server Component: async, no client JS, can access DB/secrets',
        '`\'use client\'` for state, effects, events, browser APIs',
        'Push client boundaries to the leaves',
        'Props server → client must be serialisable',
        'Client can render server content via `children`',
      ],
      followUps: [
        'What are Server Actions?',
        'Can you use Context in Server Components?',
        'What causes a hydration mismatch?',
      ],
    },
    {
      id: 'nextjs-hydration-errors',
      question: 'What is hydration, and how do you fix a hydration mismatch error?',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['nextjs', 'react'],
      answer: `**Hydration** is React taking server-rendered HTML and **attaching event handlers and state** in the browser, so the static page becomes interactive. React expects the first client render to produce **exactly the same output** as the server. If it doesn't, you get a **hydration mismatch**.

Common causes and fixes:

- **Time and randomness**: \`Date.now()\`, \`new Date().toLocaleString()\`, \`Math.random()\`. Render a stable value on the server and update after mount, or pass the value from the server.
- **Browser-only data during render**: \`window\`, \`localStorage\`, screen width, user theme. Read them in \`useEffect\` and render a placeholder first, or load that component with \`dynamic(() => import(...), { ssr: false })\`.
- **Locale and timezone differences** between server and browser when formatting dates and numbers. Fix the locale and timezone explicitly.
- **Invalid HTML nesting** (\`<div>\` inside \`<p>\`, \`<a>\` inside \`<a>\`). The browser "fixes" the DOM, so it no longer matches.
- **Browser extensions** changing the DOM. \`suppressHydrationWarning\` is acceptable only for small known cases like a timestamp.`,
      analogy: `The server sends flat-pack furniture with a photo of the finished result. Hydration is the browser assembling it while checking against the photo. If the photo shows the clock reading 10:00 but the clock now reads 10:01, the assembler complains: same furniture, different picture.`,
      quickRevision: [
        'Hydration = attach interactivity to server HTML',
        'First client render must equal server HTML',
        'Causes: time/random, `window`/`localStorage` in render, locale, invalid nesting',
        'Fix: move browser-only reads to `useEffect`, or `ssr: false`',
        '`suppressHydrationWarning` only for tiny known cases',
      ],
      followUps: [
        'How would you render a "x minutes ago" timestamp without a mismatch?',
        'What is selective or progressive hydration?',
      ],
    },
    {
      id: 'app-router-data-fetching',
      question: 'App Router data fetching?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['nextjs'],
      answer: `In the App Router I fetch data **in Server Components**: they're \`async\`, so I can \`await\` the database or \`fetch()\` directly with no client waterfall and no API keys in the browser.

- **Caching**: choose per request, e.g. \`fetch(url, { next: { revalidate: 60 } })\` for ISR-style data, or \`cache: 'no-store'\` for always-fresh data.
- **Parallel fetches**: start them together with \`Promise.all\` to avoid waterfalls. Use **Suspense** and \`loading.tsx\` to stream slow parts.
- **Mutations**: **Server Actions**, then \`revalidatePath\` or \`revalidateTag\` to refresh cached data.
- Client-side, interactive data (polling, infinite scroll) still uses TanStack Query.`,
      variants: [
        { label: 'Short version', answer: `\`async\` Server Components with \`fetch\` and caching options, Server Actions for mutations, \`revalidatePath\` / \`revalidateTag\`.` },
      ],
      analogy: `The kitchen (server) prepares the dish with direct access to the pantry, instead of sending the guest (browser) a list of ingredients to go and fetch themselves.`,
      quickRevision: [
        'async Server Components fetch directly',
        'Cache: revalidate vs no-store',
        'Parallel fetches + Suspense streaming',
        'Server Actions + revalidatePath/Tag for mutations',
      ],
      followUps: [
        'How do you avoid request waterfalls?',
        'What is `revalidateTag` used for?',
      ],
    },
    {
      id: 'middleware-in-nextjs',
      question: 'Middleware in Next.js?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['nextjs', 'express'],
      answer: `Next.js middleware runs **before a request reaches a route**, by default on the Edge runtime. It can **rewrite, redirect or modify headers** based on the request. Typical uses: **auth gating** (redirect to /login if there's no session cookie), **i18n** locale detection, A/B testing and bot protection.

Keep it **fast and light**: no heavy database calls. Limit it with \`matcher\` so it doesn't run on static assets. Real authorisation must still happen in the server or API, because middleware is a first gate, not the only one.`,
      variants: [
        { label: 'Short version', answer: 'Runs before a route resolves (Edge). Used for auth redirects and i18n.' },
      ],
      analogy: `The receptionist at the building entrance: checks your badge and points you to the right floor, but each office still checks you're allowed in.`,
      quickRevision: [
        'Runs before routes (Edge by default)',
        'Redirect / rewrite / headers',
        'Auth gates, i18n, A/B tests',
        'Keep it light; use matcher; still authorise on the server',
      ],
      followUps: [
        'Why not do database lookups in middleware?',
        'Middleware vs a route handler?',
      ],
    },
  ],
});
