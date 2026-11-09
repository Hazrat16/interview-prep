import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'React Performance',
  description: 'Finding slow renders, memoisation, code splitting, lists and memory leaks.',
  questions: [
    {
      id: 'js-memory-leaks-frontend',
      question: 'What causes memory leaks in a frontend app, and how would you find one?',
      perspective: 'debugging',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript', 'react', 'performance'],
      answer: `A leak happens when something you no longer need is **still reachable**, so the garbage collector can't free it. Common causes in SPAs:

- **Listeners and timers not cleaned up**: \`addEventListener\`, \`setInterval\`, socket subscriptions created in \`useEffect\` without a cleanup function.
- **Detached DOM nodes**: removed from the page but still referenced from JS (a cache, a closure).
- **Growing module-level caches or arrays**: a \`Map\` used as a cache with no limit or eviction.
- **Closures holding large objects**: a long-lived callback that captured a big response.
- **Unfinished async work** that writes to state after unmount.

How I'd find it: reproduce the action (open and close a modal 20 times), take **heap snapshots** in Chrome DevTools before and after, compare them, and look at what grew and its **retainers** path. The Performance monitor's JS heap and DOM node counts help confirm it. Then fix the cleanup and verify the heap comes back down.`,
      analogy: `A hotel that never checks guests out. The rooms (memory) aren't in use, but the front desk still has their names in the book (references), so housekeeping (the GC) isn't allowed to clean them. Eventually the hotel is "full".`,
      quickRevision: [
        'Leak = unneeded object still reachable',
        'Top causes: missing effect cleanup, timers, listeners, sockets, unbounded caches',
        'Always return a cleanup from `useEffect` that subscribes',
        'DevTools: heap snapshots → comparison → retainers',
        'Use `WeakMap` / LRU for caches keyed by objects',
      ],
      followUps: [
        'What does `WeakMap` solve that `Map` doesn\'t?',
        'How does `AbortController` help with fetch in `useEffect`?',
        'How would you detect a memory leak in a Node.js server?',
      ],
    },
    {
      id: 'how-did-you-cut-load-time-by-3045',
      question: 'How did you cut load time by 30–45%?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['performance'],
      answer: `At SmartCrowd the initial load was slow because the whole app shipped as a large bundle. I **measured first** with Lighthouse, Web Vitals and a **bundle analyzer** to see what was heavy. Then:

1. **Route-based code splitting** with \`React.lazy\` + \`Suspense\`, so each page loads its own code.
2. **Lazy-loading heavy libraries** (charts, editors) only where they're used.
3. **Reworking legacy components** that were heavy or re-rendered too much, and removing unused dependencies.

I re-measured with the same tools: initial load improved by **30–45%**, depending on the page. I always mention the measuring part. It shows the improvement was real, not a guess.`,
      variants: [
        { label: 'Short version', answer: `Route-based code splitting with \`React.lazy\` + \`Suspense\`, lazy-loading heavy libraries, and reworking legacy components. Measured with Lighthouse, Web Vitals and a bundle analyzer.` },
      ],
      analogy: `Packing for a trip by bringing only today's outfit instead of the whole wardrobe; the rest is sent on when you actually need it.`,
      quickRevision: [
        'Measure: Lighthouse, Web Vitals, bundle analyzer',
        'Route-based splitting with React.lazy + Suspense',
        'Lazy-load heavy libraries',
        'Fix legacy components; re-measure → 30–45%',
      ],
      followUps: [
        'What was the biggest chunk you removed?',
        'How do you prevent regressions?',
        'What are LCP and INP?',
      ],
    },
    {
      id: 'react-slow-page-debugging',
      question: 'A React page feels slow. How do you find and fix the problem?',
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
      id: 'long-list-with-10k-rows',
      question: 'How would you render a list with 10,000 rows without the page lagging?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['performance'],
      answer: `Rendering 10,000 DOM rows is slow to mount and to update. Options:

1. **Virtualisation** (TanStack Virtual, \`react-window\`): only render the rows **visible in the viewport** plus a small buffer, so the DOM stays at about 30 rows however long the list is.
2. **Pagination or infinite loading** from the server, so you never fetch 10k rows at once.
3. **Memoised rows** (\`React.memo\` with stable props and keys) so updating one row doesn't re-render all of them.

For tables I'd also do sorting and filtering on the server, and debounce the filter input.`,
      variants: [
        { label: 'Short version', answer: 'Virtualization (`react-window`, TanStack Virtual), pagination, and memoized rows.' },
      ],
      analogy: `A train window: you only see a few carriages of scenery at a time, and new scenery appears as you move. There's no need to paint the whole country at once.`,
      quickRevision: [
        'Virtualise: render only visible rows',
        'Paginate / infinite load from server',
        'Memoise rows, stable keys',
        'Server-side sort and filter',
      ],
      followUps: [
        'How does virtualisation handle variable row heights?',
        'Accessibility issues with virtualised lists?',
      ],
    },
    {
      id: 'core-web-vitals',
      question: 'What are Core Web Vitals (LCP, INP, CLS), and how do you improve them?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['performance'],
      answer: `Google's three user-centred metrics:

- **LCP** (Largest Contentful Paint), loading: when the main content appears. Good is **under 2.5s**. Improve with fast server responses, optimised hero images, preloading and less render-blocking CSS and JS.
- **INP** (Interaction to Next Paint), responsiveness: how quickly the page reacts to clicks and typing. Good is **under 200ms**. Improve by breaking up long tasks, using less JS, and transitions or debouncing.
- **CLS** (Cumulative Layout Shift), visual stability. Good is **under 0.1**. Improve by reserving space for images and ads (width and height) and avoiding inserting content above existing content.

Measure with Lighthouse in the lab and real-user monitoring in the field.`,
      variants: [
        { label: 'Short version', answer: '**LCP** (loading, < 2.5s), **INP** (responsiveness, < 200ms), **CLS** (layout shift, < 0.1).' },
      ],
      analogy: `A restaurant review: how fast your main dish arrives (LCP), how quickly the waiter responds when you wave (INP), and whether your plate gets moved while you're eating (CLS).`,
      quickRevision: [
        'LCP < 2.5s (loading)',
        'INP < 200ms (responsiveness)',
        'CLS < 0.1 (stability)',
        'Lab (Lighthouse) vs field (RUM) data',
      ],
      followUps: [
        'What replaced FID and why?',
        'How would you fix a high CLS?',
      ],
    },
    {
      id: 'fix-a-typing-lag-in-a-search-input',
      question: 'Typing in a search input feels laggy. How do you fix it?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['performance'],
      answer: `Typing lag means each keystroke triggers **expensive work** synchronously. Fixes:

1. Keep the input state **local** to a small component, so typing doesn't re-render the whole page.
2. **Debounce** the API call so it fires after the user pauses.
3. For heavy client-side filtering, use \`useDeferredValue\` (or \`useTransition\`) so the input updates immediately and the list updates when React has time.
4. **Memoise or virtualise** the results list.

Then confirm with the Profiler that keystrokes are cheap.`,
      variants: [
        { label: 'Short version', answer: `Debounce the API call, \`useDeferredValue\` / \`useTransition\` for heavy filtering, and keep input state local.` },
      ],
      analogy: `Let the customer finish their sentence before running to the stockroom, and don't make everyone in the shop stop and listen to every word they say.`,
      quickRevision: [
        'Keep input state local',
        'Debounce API calls',
        'useDeferredValue / useTransition for heavy filtering',
        'Memoise or virtualise the list',
      ],
      followUps: [
        'useDeferredValue vs debounce: what\'s the difference?',
        'How do you cancel outdated search requests?',
      ],
    },
    {
      id: 'image-optimization',
      question: 'How do you optimise images on a website?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['performance'],
      answer: `Images are often the biggest part of a page and drive LCP. I:

- serve the **right size** for each device (\`srcset\`/\`sizes\`);
- use **modern formats** (WebP, AVIF);
- **lazy-load** below-the-fold images (\`loading="lazy"\`) but **preload or prioritise the hero image**;
- set **width and height** (or an aspect ratio) to avoid layout shift;
- serve from a **CDN** with caching.

In Next.js, \`next/image\` handles most of this automatically.`,
      variants: [
        { label: 'Short version', answer: 'Correct sizes, `srcset`, modern formats (WebP/AVIF), `loading="lazy"`, `next/image`.' },
      ],
      analogy: `Sending a postcard instead of a poster when the recipient only has a small frame, and only posting it when they actually reach that page of the album.`,
      quickRevision: [
        'Right size: srcset/sizes',
        'WebP/AVIF',
        'Lazy below the fold, prioritise the hero',
        'Set dimensions to avoid CLS; CDN',
      ],
      followUps: [
        'How does `next/image` optimise images?',
        'Why shouldn\'t the LCP image be lazy-loaded?',
      ],
    },
    {
      id: 'tree-shaking',
      question: 'What is tree shaking, and what can stop it from working?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['performance', 'dsa'],
      answer: `Tree shaking is the bundler **removing unused exports** at build time. It relies on **ES modules**: \`import\`/\`export\` are static, so the bundler can see what's never used. CommonJS \`require\` is dynamic, so it can't be safely shaken.

To benefit from it: import named functions from ESM builds (\`import debounce from 'lodash-es/debounce'\`), mark packages \`"sideEffects": false\` when true, and avoid barrel files that pull in everything. Check the result with a bundle analyzer.`,
      variants: [
        { label: 'Short version', answer: `Unused exports are removed at build time. It needs ES modules, so import specific modules (\`lodash-es\`).` },
      ],
      analogy: `Shaking a tree so dead leaves (unused code) fall off before you ship it; it only works if the branches are clearly connected (static imports).`,
      quickRevision: [
        'Removes unused exports at build',
        'Needs static ES module imports',
        '`sideEffects: false` helps',
        'Verify with a bundle analyzer',
      ],
      followUps: [
        'Why do barrel files hurt tree shaking?',
        'What are side effects in this context?',
      ],
    },
  ],
});
