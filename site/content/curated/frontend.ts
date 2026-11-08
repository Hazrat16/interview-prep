import { defineQuestions } from '../../lib/content/curated-schema';

export default defineQuestions([
  {
    id: 'react-rendering-reconciliation',
    question: 'How does React rendering work, and what actually triggers a re-render?',
    category: 'frontend',
    perspective: 'concept',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['react', 'performance'],
    answer: `Rendering means React **calls your component function** to get a new element tree. It then **reconciles**, diffing the new tree against the previous one, and **commits** only the real DOM changes. Rendering is cheap; DOM updates are the expensive part.

A component re-renders when:

1. **Its state changes** (\`setState\` with a new value; the same value with \`Object.is\` is skipped).
2. **Its parent re-renders**, which by default re-renders all children, even if their props didn't change.
3. **A context it consumes** gets a new value.

Props changing isn't a separate trigger; props only change because the parent rendered. During diffing, a different element **type** at the same position remounts the subtree, and in lists **keys** decide which item is which. React 18+ also **batches** multiple state updates into one render, even inside promises and timeouts.`,
    analogy: `An architect redraws the whole blueprint (render) whenever anything changes, then compares it with the old one and sends builders only to the walls that differ (commit). Redrawing paper is cheap; moving walls is not.`,
    quickRevision: [
      'Render = call component → new tree; commit = apply DOM diff',
      'Triggers: own state, parent render, context change',
      'Same state value (`Object.is`) bails out',
      'Different element type at the same spot = unmount + remount',
      'React 18+: automatic batching everywhere',
    ],
    followUps: [
      'How does `React.memo` change rule 2?',
      'Why does creating a new object in props break memoization?',
      'What is the difference between the render phase and the commit phase?',
      'How would you find which components re-render too often?',
    ],
  },
  {
    id: 'react-useeffect-pitfalls',
    question: 'Explain useEffect dependencies and cleanup. What bugs have you seen with it?',
    category: 'frontend',
    perspective: 'debugging',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['react'],
    answer: `\`useEffect\` runs **after paint**, to **synchronise with something outside React**: subscriptions, timers, the DOM, non-React widgets. The dependency array says when to re-run it: no array means after every render, \`[]\` means once after mount, and \`[a, b]\` means when \`a\` or \`b\` changes. The function you return is the **cleanup**, which runs before the next effect and on unmount.

Bugs I've seen and fixed:

- **Infinite loop**: the effect sets state that's also a dependency, or depends on an object or function recreated every render.
- **Stale closure**: an interval reads \`count\` from the first render. Fix with correct deps, \`setCount(c => c + 1)\`, or a ref.
- **Race condition in fetches**: typing "ab" fast and the response for "a" arrives last. Fix with \`AbortController\` in the cleanup, or an \`ignore\` flag.
- **Missing cleanup**: socket listeners piling up on every re-mount (StrictMode exposes this in development).

I also avoid effects that only derive state from props. That's just a calculation during render (or \`useMemo\`). For server data I prefer TanStack Query over hand-written fetch effects.`,
    analogy: `An effect is like setting up a subscription when you move into a flat. The dependency array says when you move to a new flat; the cleanup is cancelling the old subscription before you leave. Forget to cancel and you keep paying for (and receiving) mail at every flat you've ever lived in.`,
    quickRevision: [
      'Effects sync React with external systems and run after paint',
      'Deps: none = every render, `[]` = mount, `[x]` = when x changes',
      'Cleanup runs before re-run and on unmount',
      'Fetch races → `AbortController` / ignore flag',
      "Don't use effects for derived state; compute during render",
    ],
    followUps: [
      'Why does React 18 StrictMode run effects twice in development?',
      '`useEffect` vs `useLayoutEffect`: when do you need the second?',
      'How does TanStack Query remove most data-fetching effects?',
    ],
    relatedCollected: ['frontend/react-interview-questions/useeffect-dependency-array'],
  },
  {
    id: 'react-memo-usememo-usecallback',
    question: 'When should you use useMemo, useCallback and React.memo — and when should you not?',
    category: 'frontend',
    perspective: 'trade-off',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['react', 'performance'],
    answer: `- **\`React.memo(Component)\`** skips re-rendering a child when its props are **shallowly equal**.
- **\`useMemo\`** caches a **computed value** between renders.
- **\`useCallback\`** caches a **function reference** (\`useCallback(fn, deps)\` is \`useMemo(() => fn, deps)\`).

They're useful together: \`useCallback\` alone does nothing unless the function goes to a **memoized child** or into a **dependency array**. Use them when:

1. An expensive calculation runs on every render (filtering or sorting thousands of rows).
2. You pass objects or functions to a \`React.memo\` child or a context provider value.
3. A value is an effect dependency and must stay stable.

Don't add them everywhere. They have a cost (memory, comparisons, harder-to-read code), and most re-renders are cheap. **Measure with React DevTools Profiler first.** Often the better fix is structural: move state down, or pass components as \`children\` so they don't re-render. The React Compiler (React 19) can apply much of this automatically.`,
    analogy: `Memoisation is writing the answer to a long sum on a sticky note: you only recalculate if the numbers change. Worth it for long division, not for 2 + 2. Sticky notes cost space too, and a wall full of them is harder to read.`,
    quickRevision: [
      '`memo` = skip child render on equal props; `useMemo` = cache value; `useCallback` = cache function',
      '`useCallback` only matters with a memoised child or a dependency array',
      'Use for expensive work, stable props to memoised children, stable effect deps',
      'Profile first; prefer moving state down / `children` composition',
      'Inline `{}` or `() => {}` props break `memo`',
    ],
    followUps: [
      'Show how passing `style={{}}` breaks `React.memo`.',
      'How do you memoise a context value?',
      'What does the React Compiler change?',
    ],
  },
  {
    id: 'react-state-management-choice',
    question: 'How do you decide between local state, Context, Redux/Zustand and TanStack Query?',
    category: 'frontend',
    perspective: 'design',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['react', 'performance'],
    answer: `I first split **server state** from **client state**. They're different problems.

- **Server state** (data from the API) needs caching, refetching, deduplication, invalidation and loading/error states. I use **TanStack Query** (or RTK Query). Putting API data in Redux by hand means rebuilding a cache badly.
- **Client state**, chosen by scope:
  - **Local \`useState\` / \`useReducer\`** for anything one component or subtree owns (form inputs, open/closed). This is the default.
  - **Context** for low-frequency global values: theme, current user, locale. Context isn't a state manager; every consumer re-renders when the value changes.
  - **Zustand / Redux Toolkit** for frequently updated, shared client state that many distant components read (a complex editor, cart, filters), where you want selectors so only interested components re-render, plus devtools.
  - **URL state** (search params) for filters, tabs and pagination, so it's shareable and survives a refresh.

The rule: keep state **as close as possible to where it's used**, and only lift it when you need to.`,
    analogy: `Where you keep things at home: your phone in your pocket (local state), the Wi-Fi password on the fridge for everyone (Context, rarely changes), a shared family calendar with notifications (Redux/Zustand), and the supermarket's stock list you check and refresh (server state with TanStack Query).`,
    quickRevision: [
      'Separate server state (TanStack Query) from client state',
      'Default: local state; lift only when needed',
      'Context = dependency injection for rarely changing values',
      'Zustand/Redux for shared, frequently changing client state with selectors',
      'Filters, tabs, pagination → URL',
    ],
    followUps: [
      'Why is Context bad for frequently changing values?',
      'How does TanStack Query know when to refetch?',
      'How would you handle optimistic updates?',
    ],
  },
  {
    id: 'react-list-keys',
    question: 'Why do lists need keys, and why is using the index as a key a problem?',
    category: 'frontend',
    perspective: 'concept',
    difficulty: 'easy',
    frequency: 'very-high',
    tags: ['react'],
    answer: `Keys tell React **which item is which** between renders, so reconciliation can match old and new list items. With the right key, React moves, adds or removes only what changed, and each item **keeps its own state** (input text, focus, animation).

Using the **index** as a key breaks when the list is **reordered, filtered, or has items inserted or removed anywhere but the end**. Item #0 is now a different record, but React thinks it's the same component. So state attaches to the wrong row (a typed-in input moves to another item, a checkbox stays checked on the wrong row) and React does extra DOM work.

Use a **stable unique ID** from the data (\`todo.id\`). The index is acceptable only for static lists that never reorder and have no per-item state. Don't use \`Math.random()\`: it changes every render and remounts everything.`,
    analogy: `Name badges at a conference. If badges are just seat numbers (index) and people swap seats, you end up greeting the wrong person by name. Real names (stable IDs) follow the person wherever they sit.`,
    quickRevision: [
      'Keys let reconciliation match items across renders',
      'Index keys break on reorder/insert/delete → state on the wrong row',
      'Use a stable ID from the data',
      'Random keys remount every render',
      'Changing a key on purpose resets a component',
    ],
    followUps: [
      'How can you use `key` to reset a form component?',
      'Do keys need to be globally unique?',
    ],
  },
  {
    id: 'react-slow-page-debugging',
    question: 'A React page feels slow. How do you find and fix the problem?',
    category: 'frontend',
    perspective: 'debugging',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['react', 'performance', 'nextjs'],
    answer: `I **measure before changing anything**, then fix the biggest cause.

1. **Identify the kind of slow.** Slow first load (bundle, network, LCP)? Slow interactions (typing lag, INP)? Or slow data (API waterfall)?
2. **Load:** Lighthouse and the Network tab. Fixes: route-based **code splitting** / \`lazy()\`, removing heavy libraries (bundle analyzer), optimising images, caching, fixing **request waterfalls** by fetching in parallel or on the server.
3. **Interaction:** the React DevTools **Profiler** ("why did this render?") and the Performance tab for long tasks. Typical fixes:
   - move state down so typing in one input doesn't re-render the page;
   - \`React.memo\` with stable props for heavy children;
   - **virtualise** long lists (TanStack Virtual);
   - debounce expensive filtering, or use \`useDeferredValue\` / \`useTransition\`;
   - move heavy computation to \`useMemo\` or a web worker.
4. **Verify** with the same measurement and keep a budget (Core Web Vitals in monitoring).

A real-world version: "Initial load improved 30–45% after code splitting by route, lazy-loading a charting library and removing a duplicate date library."`,
    analogy: `Like a mechanic with a slow car: plug in the diagnostic tool before replacing parts. It might be the tyres (network), the engine (render work) or a trailer you forgot you were towing (bundle size).`,
    quickRevision: [
      'Measure first: Lighthouse, Network, React Profiler, Performance tab',
      'Load: code split, lazy load, bundle analyse, images, parallel fetches',
      'Interaction: move state down, memo, virtualise, debounce, transitions',
      'Track Core Web Vitals: LCP, INP, CLS',
      'Re-measure to prove the fix',
    ],
    followUps: [
      'What are LCP, INP and CLS?',
      'How does `useTransition` keep typing responsive?',
      'How would you render a table with 10,000 rows?',
    ],
  },
  {
    id: 'react-error-handling',
    question: 'How do you handle errors in a React application?',
    category: 'frontend',
    perspective: 'practical',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['react', 'nextjs'],
    answer: `In layers:

- **Error boundaries** catch errors thrown **while rendering** a subtree and show a fallback instead of a blank screen. I put them around routes and risky widgets, not just one at the root, so a broken chart doesn't take down the whole page. (In Next.js App Router, \`error.tsx\` is a boundary per route segment.)
- Error boundaries **don't catch** errors in event handlers, async code or \`setTimeout\`. Those I handle with \`try/catch\`, or through the data layer: TanStack Query exposes \`error\` states and retries.
- **API errors** go through one HTTP client that maps status codes to user-friendly messages, refreshes tokens on 401 and shows toasts. Forms map 422 validation errors to fields.
- **User-facing states**: every data view has loading, error (with retry) and empty states.
- **Monitoring**: Sentry or LogRocket report errors with user context and the release version, so production issues show up before users report them.`,
    analogy: `Circuit breakers in a house. One faulty appliance trips the breaker for its room (error boundary), not the whole building. For things the breakers can't see, like a leaking tap (async errors), you need a separate check, and a smoke alarm that calls you (monitoring).`,
    quickRevision: [
      'Error boundaries catch render errors only',
      'Not caught: event handlers, async, timeouts → try/catch / query `error`',
      'Place boundaries per route/widget; Next.js `error.tsx`',
      'Central API client: map statuses, refresh on 401, field errors on 422',
      'Always: loading / error+retry / empty states; Sentry in production',
    ],
    followUps: [
      'Why must error boundaries be class components (or a library)?',
      'How do you handle an expired access token mid-session?',
    ],
  },
  {
    id: 'react-forms-controlled-validation',
    question: 'Controlled vs uncontrolled inputs — how do you build forms with validation?',
    category: 'frontend',
    perspective: 'practical',
    difficulty: 'easy',
    frequency: 'high',
    tags: ['react', 'typescript'],
    answer: `A **controlled** input gets its value from React state (\`value\` + \`onChange\`), so React is the source of truth. That's easy to validate on every keystroke, but every keystroke re-renders. An **uncontrolled** input keeps its value in the DOM and you read it via a ref or on submit. It's faster but less reactive.

For real forms I use **React Hook Form + Zod**. RHF registers mostly uncontrolled inputs, so typing doesn't re-render the whole form. Zod defines the schema **once** and gives both runtime validation and the TypeScript type (\`z.infer\`). The **same schema can validate on the backend**, so the rules never drift.

Good-form checklist: show errors after blur or submit (not while the user is still typing), disable submit while pending to prevent double submits, map server 422 errors back to fields, keep it accessible (\`label\`, \`aria-invalid\`, focus the first error), and always validate on the server as well. Client validation is for UX, not security.`,
    analogy: `Controlled is a teacher checking every word as you write. Uncontrolled is handing in the paper and getting it marked at the end. React Hook Form is a teacher who only steps in when you pause or submit, and Zod is the shared marking scheme used in class and in the exam.`,
    quickRevision: [
      'Controlled = React state is the source of truth; uncontrolled = the DOM is',
      'RHF: uncontrolled under the hood → fewer re-renders',
      'Zod: one schema → runtime validation + TS type, shareable with the backend',
      'Prevent double submit; map server errors to fields',
      'Client validation = UX; server validation = security',
    ],
    followUps: [
      'How would you build a multi-step form that keeps data between steps?',
      'How do you handle dependent fields (country → city)?',
    ],
  },
  {
    id: 'nextjs-rendering-strategies',
    question: 'SSR vs SSG vs ISR vs CSR — which would you use for which pages?',
    category: 'frontend',
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
    relatedCollected: ['companies/techzu/isr-ssr-ssg-nextjs'],
  },
  {
    id: 'nextjs-server-vs-client-components',
    question: 'Server Components vs Client Components in the Next.js App Router?',
    category: 'frontend',
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
      "`'use client'` for state, effects, events, browser APIs",
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
    category: 'frontend',
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
]);
