import { defineEnrichments } from '../../../lib/content/enrich-schema';

/**
 * The note has one-line table answers; `answer` expands each into something
 * you can say in 30–60 seconds. Questions that also exist as curated FAQ reuse
 * them with `sameAs: 'faq/…'`.
 */
export default defineEnrichments('frontend/react-interview-questions.md', {
  // ---------------------------------------------------------------- 1. React fundamentals
  'what-is-the-virtual-dom': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `The virtual DOM is a lightweight **JavaScript object tree** that describes what the UI should look like. When state changes, React calls my components again to build a **new tree**, **diffs** it against the previous one (reconciliation), and then applies only the **minimal set of real DOM changes**.

The point isn't that the virtual DOM is "faster than the DOM". It lets me write UI **declaratively** (describe the result for any state) while React works out efficient updates. Keys and element types guide the diff.`,
    analogy: 'An architect redraws the blueprint on paper whenever something changes, compares it with the last version, and only sends builders to the walls that actually differ. Paper is cheap; moving walls is expensive.',
    quickRevision: ['JS object tree describing the UI', 'New tree each render → diff → minimal DOM patch', 'Benefit: declarative code, efficient updates', 'Keys and element types guide the diff'],
    followUps: ['What is reconciliation?', 'Is the virtual DOM always faster?', 'What does React Fiber change?'],
  },
  'why-do-lists-need-key': { sameAs: 'faq/react-list-keys' },
  'state-versus-props': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `**Props** are inputs passed **down from the parent**. They're read-only for the child, which shouldn't modify them. **State** is data a component **owns** and changes over time with \`useState\` or \`useReducer\`, and changing it triggers a re-render.

A good rule: if a value can be **computed** from props or other state, it shouldn't be state at all. If two components need the same state, lift it to their closest common parent and pass it down as props.`,
    analogy: 'Props are the instructions a manager hands you; state is your own notebook. You follow the instructions but don\'t rewrite them, and you update your notebook as work progresses.',
    quickRevision: ['Props: from parent, read-only', 'State: owned, changes trigger re-render', "Derived values shouldn't be state", 'Shared state → lift to common parent'],
    followUps: ['Can a child change its parent\'s state?', 'What is derived state and why avoid it?'],
  },
  'what-triggers-a-re-render': { sameAs: 'faq/react-rendering-reconciliation' },
  'controlled-versus-uncontrolled-inputs': { sameAs: 'faq/react-forms-controlled-validation' },
  'lifting-state-up': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `When two sibling components need the **same data**, I move that state to their **closest common parent** and pass the value and a setter (or callback) down as props. Now there's a **single source of truth**, and both siblings stay in sync.

The trade-off: lifting too high causes **unnecessary re-renders** and prop drilling. So I lift only as far as needed, and if many distant components need the data, I consider Context or a store.`,
    analogy: 'Two roommates keeping separate shopping lists keep buying the same milk; putting one list on the shared fridge (the parent) keeps everyone in sync.',
    quickRevision: ['Move shared state to the closest common parent', 'Pass value + callback down', 'Single source of truth', "Don't lift higher than needed"],
    followUps: ['When does lifting state become a problem?', 'How does this relate to prop drilling?'],
  },
  'prop-drilling-and-how-to-avoid-it': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Prop drilling is passing props through **several layers of components that don't use them**, just to reach a deep child. It makes components noisy and refactoring painful.

Fixes, in the order I try them:

1. **Composition**: pass components as \`children\` or slots, so the intermediate layers don't need the data.
2. **Context**: for low-frequency global values (theme, current user, locale).
3. **A state library** (Zustand, Redux) for frequently changing shared state, with selectors.

A little drilling (two or three levels) is fine and explicit.`,
    analogy: 'Passing a parcel hand-to-hand through five people who don\'t care about it; composition is handing it directly, and Context is a building-wide mailbox.',
    quickRevision: ['Passing props through layers that don\'t use them', 'First fix: composition (`children`)', 'Context for rarely changing global values', 'Store with selectors for busy shared state'],
    followUps: ['Show composition solving drilling.', 'Why is Context bad for frequently changing values?'],
  },
  fragments: {
    difficulty: 'easy',
    answer: `A component must return **one root element**. Fragments (\`<>…</>\` or \`<React.Fragment>\`) let me group children **without adding an extra DOM node**. That keeps the DOM clean and avoids breaking layouts like CSS grid and flex, or table structure (\`<tr>\` children). Use the long form \`<Fragment key={…}>\` when rendering fragments in a list.`,
    analogy: 'A paperclip instead of a folder: it holds the pages together without adding another layer to your filing cabinet.',
    quickRevision: ['Group children without an extra DOM node', '`<>…</>` short form', 'Use `<Fragment key>` in lists', 'Keeps grid/flex/table markup valid'],
    followUps: ['Why does a component need a single root?', 'When must you use the long Fragment syntax?'],
  },
  'what-is-jsx-compiled-to': {
    difficulty: 'easy',
    answer: `JSX is syntax sugar. A compiler (Babel, SWC, esbuild) turns \`<Button color="red">Hi</Button>\` into a function call: \`jsx(Button, { color: 'red', children: 'Hi' })\` with the modern automatic runtime, or \`React.createElement(...)\` with the classic one. The result is a **plain object** describing the element, which React uses to build the tree. That's why JSX expressions can be stored in variables, returned and passed around.`,
    analogy: 'JSX is shorthand on an order form; the compiler rewrites it into the full formal order (a function call) the kitchen actually reads.',
    quickRevision: ['JSX → `jsx()` / `React.createElement()`', 'Returns plain objects (elements)', 'Compiled by Babel/SWC/esbuild', 'Lowercase = DOM tag, Capitalised = component'],
    followUps: ['Why must components start with a capital letter?', 'What is the new JSX transform?'],
  },
  'react-1819-features': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `**React 18** introduced **concurrent rendering**: React can prepare updates in the background and interrupt them. On top of that:

- **automatic batching** everywhere (promises, timeouts);
- \`useTransition\` and \`useDeferredValue\` to mark updates as non-urgent;
- **Suspense** for data and streaming SSR;
- \`useId\`.

**React 19** adds:

- **Actions** (async functions in transitions, with \`useActionState\` and \`useFormStatus\` for forms);
- \`useOptimistic\`;
- the \`use()\` hook for reading promises and context;
- \`ref\` as a normal prop, so no \`forwardRef\`;
- better hydration error messages;
- the **React Compiler**, which auto-memoises components.

In practice I use transitions for heavy filtering and TanStack Query for most data.`,
    analogy: 'React 18 gave the kitchen the ability to pause a slow dish to serve a quick one first (concurrency); React 19 added ready-made recipes for common jobs like forms and optimistic orders.',
    quickRevision: ['18: concurrent rendering, auto batching, transitions, Suspense streaming', '19: Actions, useActionState, useOptimistic, use()', '19: ref as prop, React Compiler', 'Use transitions for non-urgent updates'],
    followUps: ['How does `useTransition` keep typing responsive?', 'What does the React Compiler change about `useMemo`?'],
  },
  'strictmode-double-invoke': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `In **development only**, StrictMode intentionally **renders components twice** and runs effects **mount → unmount → mount**. The goal is to surface bugs early: impure renders (side effects during render) and effects with **missing cleanup** (duplicate subscriptions, intervals or fetches).

It doesn't happen in production. If something breaks under StrictMode, the fix is usually to make the render pure or add a proper cleanup, not to remove StrictMode.`,
    analogy: 'A fire drill: the building practises evacuating and coming back in, so you find blocked exits (missing cleanups) before a real fire.',
    quickRevision: ['Dev only: double render + mount/unmount/mount', 'Finds impure renders and missing cleanups', 'Not in production', 'Fix the cleanup, don\'t remove StrictMode'],
    followUps: ['Why did my fetch run twice in development?', 'How do you write an effect that survives double mounting?'],
  },
  // ---------------------------------------------------------------- 2. Hooks
  'rules-of-hooks': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `Two rules:

1. Call hooks **only at the top level**: not inside loops, conditions or nested functions.
2. Call them **only from React function components or custom hooks**.

The reason is that React identifies each hook by its **call order** during a render. If a condition skips a hook on one render, every hook after it gets the wrong state. The ESLint plugin \`react-hooks\` enforces both rules. If I need conditional behaviour, I put the condition **inside** the hook (\`useEffect(() => { if (!x) return; … })\`).`,
    analogy: 'Hooks are numbered lockers assigned by arrival order; if someone skips the queue one day, everyone after them opens the wrong locker.',
    quickRevision: ['Top level only, never conditional', 'Only in components/custom hooks', 'React tracks hooks by call order', 'Put the condition inside the hook'],
    followUps: ['Why does call order matter?', 'Does `use()` in React 19 follow the same rules?'],
  },
  'useeffect-dependency-array': { sameAs: 'faq/react-useeffect-pitfalls' },
  'useeffect-vs-uselayouteffect': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Both run after React updates the DOM. The difference is **timing**:

- \`useEffect\` runs **after the browser paints**, so it doesn't block the screen. Use it for almost everything: data, subscriptions, logging.
- \`useLayoutEffect\` runs **synchronously before paint**. Use it when you must **measure the DOM and adjust layout** before the user sees it (tooltip positioning, scroll restoration, avoiding a visible flicker).

Because \`useLayoutEffect\` blocks painting, overusing it hurts performance. It also warns during SSR, since there's no layout on the server.`,
    analogy: 'useEffect is tidying up after the guests have seen the room; useLayoutEffect is straightening the picture frame before you open the door.',
    quickRevision: ['useEffect: after paint, non-blocking (default)', 'useLayoutEffect: before paint, blocking', 'Layout effect for measure → adjust without flicker', 'Avoid it on the server'],
    followUps: ['Give a case where useEffect causes a flicker.', 'What is `useInsertionEffect` for?'],
  },
  'usememo-vs-usecallback': { sameAs: 'faq/react-memo-usememo-usecallback' },
  reactmemo: { sameAs: 'faq/react-memo-usememo-usecallback' },
  'useref-uses': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `\`useRef\` returns a mutable object \`{ current }\` that **persists across renders** without causing a re-render when it changes. Two main uses:

1. **DOM access**: \`ref={inputRef}\` and then \`inputRef.current.focus()\`, measuring sizes, or integrating non-React libraries.
2. **Mutable instance values** that shouldn't trigger renders: timer IDs, the previous value (\`usePrevious\`), "is mounted" flags, or the latest callback to avoid stale closures.

Don't read or write \`ref.current\` during render for things that affect output. That's what state is for.`,
    analogy: 'A sticky note on the back of your desk: you can change it anytime and it stays there between meetings, but nobody re-holds the meeting because you updated it.',
    quickRevision: ['Persists across renders, no re-render on change', 'DOM access (focus, measure)', 'Timers, previous values, latest callback', 'Not for values that affect rendering'],
    followUps: ['Implement `usePrevious`.', 'useRef vs useState: when to choose which?', 'What is a callback ref?'],
  },
  'usereducer-vs-usestate': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `\`useState\` is perfect for **independent, simple values**. I switch to \`useReducer\` when:

- several values **change together** (a form with status, data and error);
- the next state depends on the previous one in **complex ways**;
- I want all transitions **in one place** as named actions, which makes them testable as a pure function.

A reducer also helps avoid impossible states, like \`loading: true\` together with \`error\` set, by modelling explicit statuses.`,
    analogy: 'useState is a light switch; useReducer is a control panel with labelled buttons ("submit", "success", "fail") that always moves the system to a valid state.',
    quickRevision: ['useState: simple, independent values', 'useReducer: related values, complex transitions', 'Reducer is pure → easy to test', 'Model statuses to avoid impossible states'],
    followUps: ['Write a reducer for a fetch status.', 'useReducer + Context vs Redux?'],
  },
  'stale-closure-in-hooks': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `Each render creates **new functions** that close over **that render's** props and state. A **stale closure** happens when a long-lived callback, like an interval, a subscription or an effect with missing dependencies, keeps using values from an **old render**. Classic case: \`setInterval(() => setCount(count + 1), 1000)\` in an effect with \`[]\` keeps setting it to 1.

Fixes:

- **functional updates**: \`setCount(c => c + 1)\`;
- **correct dependencies**, so the effect re-subscribes;
- a **ref** holding the latest value or callback (\`useLatest\`, or \`useEffectEvent\` in newer React).`,
    analogy: 'Using last week\'s printed timetable: the bus times have changed, but you\'re still reading the old copy you grabbed when you left home.',
    quickRevision: ['Callbacks capture the render they were created in', 'Long-lived callbacks see old values', 'Fix: functional update `set(x => …)`', 'Fix: correct deps or a ref with the latest value'],
    followUps: ['Fix a counter interval that always shows 1.', 'What is `useEffectEvent`?'],
  },
  'custom-hook-example': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `A custom hook is a function starting with \`use\` that **reuses stateful logic**, not UI, between components. Each component that calls it gets its **own state**.

Examples I've written: \`useDebounce(value, delay)\` for search inputs, \`useLocalStorage(key, initial)\`, \`useFetch\` with an \`AbortController\`, and \`usePrevious\`. I've also published two hooks on npm: **block-browser-back** and **checkout-risk-sdk**. Good custom hooks have a small API, clean up after themselves, and are easy to test.`,
    analogy: 'A recipe card: every cook (component) who follows it makes their own dish (own state) from the same proven steps.',
    quickRevision: ['Starts with `use`; reuses logic, not UI', 'Each caller gets its own state', 'Examples: useDebounce, useLocalStorage, useFetch', 'Published hooks: block-browser-back, checkout-risk-sdk'],
    followUps: ['Write `useDebounce`.', 'How do you test a custom hook?', 'Custom hook vs utility function?'],
  },
  'why-fetch-in-useeffect-is-discouraged-now': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Fetching in \`useEffect\` works, but done by hand you rebuild a lot badly:

- **race conditions**, where an old response overwrites a newer one;
- **no caching or deduplication**, so the same data is fetched on every mount;
- **waterfalls**, where a child only starts fetching after its parent rendered;
- loading and error boilerplate;
- double fetches in StrictMode.

Better options: **TanStack Query** (caching, refetching, dedupe, retries) on the client, or fetching in **Server Components** or route loaders. If I must use an effect, I add an \`AbortController\` in the cleanup and handle loading and error states.`,
    analogy: 'Cooking every meal from scratch versus using a well-run pantry: TanStack Query remembers what you already have, restocks when it\'s stale and avoids buying the same thing twice.',
    quickRevision: ['Problems: races, no cache/dedupe, waterfalls, boilerplate', 'Use TanStack Query or server-side fetching', 'If using an effect: AbortController + cleanup', 'Handle loading / error / empty states'],
    followUps: ['How does TanStack Query avoid duplicate requests?', 'Show a race-safe fetch effect.'],
  },
  'usecontext-performance-issue': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `When a Context **value changes**, **every component that consumes it re-renders**, even if it only uses one field. And if the provider passes a new object every render (\`value={{ user, setUser }}\`), consumers re-render every time the provider renders.

Fixes:

- **memoise the value** with \`useMemo\`;
- **split contexts** (state separate from setters, or by domain);
- keep frequently changing data **out of Context**: use Zustand or Redux with **selectors**, or \`useSyncExternalStore\`.`,
    analogy: 'A building-wide announcement system: every announcement wakes up every room, even if it only concerns one office. Split the speakers by floor, or use direct messages (selectors).',
    quickRevision: ['All consumers re-render on value change', 'New object each render → constant re-renders', 'Fix: useMemo value, split contexts', 'Busy state → store with selectors'],
    followUps: ['Why does splitting state and dispatch contexts help?', 'How do selectors avoid re-renders?'],
  },
  // ---------------------------------------------------------------- 3. State management
  'server-state-versus-client-state': { sameAs: 'faq/react-state-management-choice' },
  'why-redux-toolkit': {
    difficulty: 'medium',
    answer: `Redux Toolkit is the **official, modern way** to write Redux. It removes most of the boilerplate:

- \`createSlice\` generates actions and reducers together;
- **Immer** lets me write "mutating" updates that are actually immutable;
- \`configureStore\` sets up DevTools and sensible middleware;
- \`createAsyncThunk\` handles async logic;
- **RTK Query** handles server data with caching.

I used Redux at SmartCrowd for complex shared client state across investment and portfolio flows. Today I'd use TanStack Query for server data and keep Redux or Zustand for genuinely shared client state.`,
    analogy: 'Classic Redux is building furniture from raw wood; Redux Toolkit is the flat-pack version with pre-drilled holes: same furniture, far less effort and fewer mistakes.',
    quickRevision: ['createSlice = actions + reducer', 'Immer for immutable updates', 'configureStore: DevTools + middleware', 'RTK Query for server state'],
    followUps: ['How does Immer work?', 'RTK Query vs TanStack Query?', 'When would you pick Zustand instead?'],
  },
  'redux-data-flow': {
    difficulty: 'easy',
    answer: `Redux is **one-way data flow**:

1. The UI **dispatches** an action (\`{ type: 'cart/added', payload }\`).
2. **Middleware** (thunks, logging) can intercept it.
3. The **reducer** computes the **new state** from the old state and the action, as a pure function.
4. The store notifies subscribers, and components using \`useSelector\` **re-render only if their selected slice changed**.

This predictability makes state changes easy to trace in DevTools (time-travel debugging).`,
    analogy: 'A bank: you can\'t change your balance directly; you submit a transaction slip (action), the teller applies the rules (reducer), and your statement updates (re-render).',
    quickRevision: ['dispatch(action) → middleware → reducer → new state', 'Reducers are pure', 'useSelector re-renders on selected changes', 'Predictable + DevTools time travel'],
    followUps: ['Where do side effects go in Redux?', 'Why must reducers not mutate state?'],
  },
  'tanstack-query-staletime-vs-gctime': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `- **\`staleTime\`**: how long fetched data is considered **fresh**. While fresh, TanStack Query **won't refetch** on mount or window focus. The default is 0, so data is stale immediately.
- **\`gcTime\`** (formerly \`cacheTime\`): how long **unused** data (no component subscribed) stays **in the cache** before it's garbage-collected. The default is 5 minutes.

So a list might have \`staleTime: 30_000\` to avoid refetching on every navigation, while \`gcTime\` lets me go back to a page and see cached data instantly while it revalidates in the background.`,
    analogy: 'staleTime is the "best before" date: until then you don\'t restock. gcTime is how long leftovers stay in the fridge after nobody\'s eating them before they get thrown out.',
    quickRevision: ['staleTime: fresh window, no refetch', 'gcTime: how long unused cache is kept', 'Defaults: staleTime 0, gcTime 5 min', 'Stale data still shows instantly while refetching'],
    followUps: ['What triggers a refetch?', 'How do you invalidate a query after a mutation?'],
  },
  'optimistic-updates': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `An optimistic update shows the result **before the server confirms it**, so the UI feels instant (likes, toggles, reordering). With TanStack Query:

1. In \`onMutate\`, **cancel** outgoing refetches, **snapshot** the current cache, and **write the expected result** to the cache.
2. In \`onError\`, **roll back** to the snapshot and show an error.
3. In \`onSettled\`, **invalidate** the query to sync with the server's truth.

I avoid it for actions where showing a wrong result is costly, like payments. There I show a pending state instead.`,
    analogy: 'Ticking an item off your to-do list as you hand it to a colleague: if they come back saying it failed, you un-tick it.',
    quickRevision: ['onMutate: cancel, snapshot, update cache', 'onError: roll back', 'onSettled: invalidate to resync', 'Avoid for payments / irreversible actions'],
    followUps: ['What is React 19\'s `useOptimistic`?', 'How do you handle two quick optimistic updates?'],
  },
  'context-versus-redux': { sameAs: 'faq/react-state-management-choice' },
  // ---------------------------------------------------------------- 4. Performance
  'how-did-you-cut-load-time-by-3045': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `At SmartCrowd the initial load was slow because the whole app shipped as a large bundle. I **measured first** with Lighthouse, Web Vitals and a **bundle analyzer** to see what was heavy. Then:

1. **Route-based code splitting** with \`React.lazy\` + \`Suspense\`, so each page loads its own code.
2. **Lazy-loading heavy libraries** (charts, editors) only where they're used.
3. **Reworking legacy components** that were heavy or re-rendered too much, and removing unused dependencies.

I re-measured with the same tools: initial load improved by **30–45%**, depending on the page. I always mention the measuring part. It shows the improvement was real, not a guess.`,
    analogy: 'Packing for a trip by bringing only today\'s outfit instead of the whole wardrobe; the rest is sent on when you actually need it.',
    quickRevision: ['Measure: Lighthouse, Web Vitals, bundle analyzer', 'Route-based splitting with React.lazy + Suspense', 'Lazy-load heavy libraries', 'Fix legacy components; re-measure → 30–45%'],
    followUps: ['What was the biggest chunk you removed?', 'How do you prevent regressions?', 'What are LCP and INP?'],
  },
  'how-do-you-find-performance-problems': { sameAs: 'faq/react-slow-page-debugging' },
  'long-list-with-10k-rows': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Rendering 10,000 DOM rows is slow to mount and to update. Options:

1. **Virtualisation** (TanStack Virtual, \`react-window\`): only render the rows **visible in the viewport** plus a small buffer, so the DOM stays at about 30 rows however long the list is.
2. **Pagination or infinite loading** from the server, so you never fetch 10k rows at once.
3. **Memoised rows** (\`React.memo\` with stable props and keys) so updating one row doesn't re-render all of them.

For tables I'd also do sorting and filtering on the server, and debounce the filter input.`,
    analogy: 'A train window: you only see a few carriages of scenery at a time, and new scenery appears as you move. There\'s no need to paint the whole country at once.',
    quickRevision: ['Virtualise: render only visible rows', 'Paginate / infinite load from server', 'Memoise rows, stable keys', 'Server-side sort and filter'],
    followUps: ['How does virtualisation handle variable row heights?', 'Accessibility issues with virtualised lists?'],
  },
  'core-web-vitals': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Google's three user-centred metrics:

- **LCP** (Largest Contentful Paint), loading: when the main content appears. Good is **under 2.5s**. Improve with fast server responses, optimised hero images, preloading and less render-blocking CSS and JS.
- **INP** (Interaction to Next Paint), responsiveness: how quickly the page reacts to clicks and typing. Good is **under 200ms**. Improve by breaking up long tasks, using less JS, and transitions or debouncing.
- **CLS** (Cumulative Layout Shift), visual stability. Good is **under 0.1**. Improve by reserving space for images and ads (width and height) and avoiding inserting content above existing content.

Measure with Lighthouse in the lab and real-user monitoring in the field.`,
    analogy: 'A restaurant review: how fast your main dish arrives (LCP), how quickly the waiter responds when you wave (INP), and whether your plate gets moved while you\'re eating (CLS).',
    quickRevision: ['LCP < 2.5s (loading)', 'INP < 200ms (responsiveness)', 'CLS < 0.1 (stability)', 'Lab (Lighthouse) vs field (RUM) data'],
    followUps: ['What replaced FID and why?', 'How would you fix a high CLS?'],
  },
  'fix-a-typing-lag-in-a-search-input': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `Typing lag means each keystroke triggers **expensive work** synchronously. Fixes:

1. Keep the input state **local** to a small component, so typing doesn't re-render the whole page.
2. **Debounce** the API call so it fires after the user pauses.
3. For heavy client-side filtering, use \`useDeferredValue\` (or \`useTransition\`) so the input updates immediately and the list updates when React has time.
4. **Memoise or virtualise** the results list.

Then confirm with the Profiler that keystrokes are cheap.`,
    analogy: 'Let the customer finish their sentence before running to the stockroom, and don\'t make everyone in the shop stop and listen to every word they say.',
    quickRevision: ['Keep input state local', 'Debounce API calls', 'useDeferredValue / useTransition for heavy filtering', 'Memoise or virtualise the list'],
    followUps: ['useDeferredValue vs debounce: what\'s the difference?', 'How do you cancel outdated search requests?'],
  },
  'image-optimization': {
    difficulty: 'easy',
    frequency: 'medium',
    answer: `Images are often the biggest part of a page and drive LCP. I:

- serve the **right size** for each device (\`srcset\`/\`sizes\`);
- use **modern formats** (WebP, AVIF);
- **lazy-load** below-the-fold images (\`loading="lazy"\`) but **preload or prioritise the hero image**;
- set **width and height** (or an aspect ratio) to avoid layout shift;
- serve from a **CDN** with caching.

In Next.js, \`next/image\` handles most of this automatically.`,
    analogy: 'Sending a postcard instead of a poster when the recipient only has a small frame, and only posting it when they actually reach that page of the album.',
    quickRevision: ['Right size: srcset/sizes', 'WebP/AVIF', 'Lazy below the fold, prioritise the hero', 'Set dimensions to avoid CLS; CDN'],
    followUps: ['How does `next/image` optimise images?', 'Why shouldn\'t the LCP image be lazy-loaded?'],
  },
  'tree-shaking': {
    difficulty: 'medium',
    answer: `Tree shaking is the bundler **removing unused exports** at build time. It relies on **ES modules**: \`import\`/\`export\` are static, so the bundler can see what's never used. CommonJS \`require\` is dynamic, so it can't be safely shaken.

To benefit from it: import named functions from ESM builds (\`import debounce from 'lodash-es/debounce'\`), mark packages \`"sideEffects": false\` when true, and avoid barrel files that pull in everything. Check the result with a bundle analyzer.`,
    analogy: 'Shaking a tree so dead leaves (unused code) fall off before you ship it; it only works if the branches are clearly connected (static imports).',
    quickRevision: ['Removes unused exports at build', 'Needs static ES module imports', '`sideEffects: false` helps', 'Verify with a bundle analyzer'],
    followUps: ['Why do barrel files hurt tree shaking?', 'What are side effects in this context?'],
  },
  // ---------------------------------------------------------------- 5. Next.js
  'ssr-vs-ssg-vs-isr-vs-csr': { sameAs: 'faq/nextjs-rendering-strategies' },
  'server-components-versus-client-components': { sameAs: 'faq/nextjs-server-vs-client-components' },
  'hydration-and-hydration-errors': { sameAs: 'faq/nextjs-hydration-errors' },
  'app-router-data-fetching': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `In the App Router I fetch data **in Server Components**: they're \`async\`, so I can \`await\` the database or \`fetch()\` directly with no client waterfall and no API keys in the browser.

- **Caching**: choose per request, e.g. \`fetch(url, { next: { revalidate: 60 } })\` for ISR-style data, or \`cache: 'no-store'\` for always-fresh data.
- **Parallel fetches**: start them together with \`Promise.all\` to avoid waterfalls. Use **Suspense** and \`loading.tsx\` to stream slow parts.
- **Mutations**: **Server Actions**, then \`revalidatePath\` or \`revalidateTag\` to refresh cached data.
- Client-side, interactive data (polling, infinite scroll) still uses TanStack Query.`,
    analogy: 'The kitchen (server) prepares the dish with direct access to the pantry, instead of sending the guest (browser) a list of ingredients to go and fetch themselves.',
    quickRevision: ['async Server Components fetch directly', 'Cache: revalidate vs no-store', 'Parallel fetches + Suspense streaming', 'Server Actions + revalidatePath/Tag for mutations'],
    followUps: ['How do you avoid request waterfalls?', 'What is `revalidateTag` used for?'],
  },
  'middleware-in-nextjs': {
    difficulty: 'medium',
    answer: `Next.js middleware runs **before a request reaches a route**, by default on the Edge runtime. It can **rewrite, redirect or modify headers** based on the request. Typical uses: **auth gating** (redirect to /login if there's no session cookie), **i18n** locale detection, A/B testing and bot protection.

Keep it **fast and light**: no heavy database calls. Limit it with \`matcher\` so it doesn't run on static assets. Real authorisation must still happen in the server or API, because middleware is a first gate, not the only one.`,
    analogy: 'The receptionist at the building entrance: checks your badge and points you to the right floor, but each office still checks you\'re allowed in.',
    quickRevision: ['Runs before routes (Edge by default)', 'Redirect / rewrite / headers', 'Auth gates, i18n, A/B tests', 'Keep it light; use matcher; still authorise on the server'],
    followUps: ['Why not do database lookups in middleware?', 'Middleware vs a route handler?'],
  },
  // ---------------------------------------------------------------- 6. TypeScript
  'type-vs-interface': { sameAs: 'faq/ts-interface-vs-type' },
  'any-vs-unknown': { sameAs: 'faq/ts-unknown-any-never-narrowing' },
  'generics-example': { sameAs: 'faq/ts-generics-real-example' },
  'utility-types': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Built-in types that **transform other types**, so I don't duplicate definitions:

- \`Partial<T>\` / \`Required<T>\`: make all fields optional or required (e.g. a PATCH body).
- \`Pick<T, K>\` / \`Omit<T, K>\`: choose or remove fields (e.g. \`Omit<User, 'password'>\` for API responses).
- \`Record<K, V>\`: object maps (\`Record<Status, string>\`).
- \`ReturnType<F>\`, \`Parameters<F>\`, \`Awaited<T>\`: derive types from functions and promises.
- \`Readonly<T>\`, \`NonNullable<T>\`, \`Extract\`/\`Exclude\` for unions.`,
    analogy: 'Photocopier settings for types: enlarge (Required), shrink (Partial), crop (Pick/Omit), without redrawing the original document.',
    quickRevision: ['Partial / Required', 'Pick / Omit', 'Record for maps', 'ReturnType, Parameters, Awaited', 'Extract / Exclude for unions'],
    followUps: ['Implement `Partial` yourself with a mapped type.', 'Omit vs Exclude?'],
  },
  narrowing: { sameAs: 'faq/ts-unknown-any-never-narrowing' },
  'typing-props-and-events': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `- **Props**: a \`type Props = { title: string; onSave?: (id: string) => void; children?: React.ReactNode }\` and \`function Card({ title }: Props)\`. I avoid \`React.FC\` mainly for consistency.
- **Events**: \`React.ChangeEvent<HTMLInputElement>\`, \`React.FormEvent<HTMLFormElement>\`, \`React.MouseEvent<HTMLButtonElement>\`. Inline handlers infer these automatically.
- **Native element props**: extend \`React.ComponentProps<'button'>\` to accept everything a button accepts.
- **Refs**: \`useRef<HTMLInputElement>(null)\`.`,
    analogy: 'Labelling every socket and plug in a house so the wrong appliance can\'t be plugged into the wrong outlet.',
    quickRevision: ['Props as a `type`; children: ReactNode', 'ChangeEvent / FormEvent / MouseEvent<Element>', 'Extend ComponentProps<"button">', 'useRef<HTMLInputElement>(null)'],
    followUps: ['How do you type a polymorphic `as` prop?', 'How do you type a generic list component?'],
  },
  'zod-with-typescript': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `TypeScript types **disappear at runtime**, so they can't protect me from bad API data or user input. **Zod** defines a schema that **validates at runtime**, and \`z.infer<typeof schema>\` gives me the **TypeScript type from the same schema**: one source of truth.

I use it on the frontend with React Hook Form (\`zodResolver\`) and on the backend to validate request bodies, params and env variables. At Firmwide the APIs are Zod-validated, and sharing schemas between front and back keeps the rules in sync.`,
    analogy: 'TypeScript is the building plan; Zod is the inspector at the door checking that what actually arrives matches the plan.',
    quickRevision: ['TS types vanish at runtime', 'Zod validates at runtime', 'z.infer → type from the schema', 'Use with RHF + backend validation; share schemas'],
    followUps: ['safeParse vs parse?', 'How do you validate environment variables?', 'Zod vs Yup vs Joi?'],
  },
  // ---------------------------------------------------------------- 7. Architecture & testing
  'how-do-you-structure-a-large-react-app': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `I organise by **feature or domain**, not by file type. At Firmwide the frontend (~450 TypeScript files) is split into vertical slices like \`domains/proposals\`, \`domains/invoices\` and \`domains/auth\`. Each owns its **components, hooks, API calls, types and tests**.

- **Shared** code (UI primitives, utilities, the HTTP client) lives in \`shared/\`.
- **ESLint import boundaries** (\`no-restricted-imports\`) stop domains reaching into each other's internals. They go through a public \`index.ts\`.
- **Server state** goes through TanStack Query hooks per domain, and client state stays local or in a small store.
- **Routes** are lazy-loaded per domain.

The result: features are easy to find, changes stay local, and new developers can own a domain.`,
    analogy: 'A department store organised by department (shoes, electronics), each with its own staff and stockroom, rather than one giant warehouse sorted by "all shelves", "all boxes", "all price tags".',
    quickRevision: ['Feature/domain folders (vertical slices)', 'Each domain owns UI, hooks, API, types', 'Shared primitives in shared/', 'ESLint import boundaries + public index', 'Lazy-loaded routes per domain'],
    followUps: ['How do domains share data?', 'How did you migrate an existing app to this structure?', 'Monorepo or single repo?'],
  },
  'designing-a-reusable-component': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `I design the **API first**:

- a **small, predictable props API** with good defaults;
- **composition over configuration** (\`children\`, slots, compound components like \`<Tabs><Tabs.List/></Tabs>\`) instead of 30 boolean props;
- **controlled and uncontrolled** modes (\`value\`/\`onChange\` or \`defaultValue\`);
- **accessible by default**: semantics, keyboard support, focus and ARIA (or build on Radix);
- pass-through of native props and \`ref\`, and **styling hooks** (\`className\`, variants);
- **documentation** with Storybook stories.

At SmartCrowd I built 20+ reusable components this way, which cut duplicated UI code by about 35%.`,
    analogy: 'Designing LEGO bricks instead of a glued model: a few well-shaped pieces that snap together in many ways beat one piece with a switch for every possible use.',
    quickRevision: ['Small props API, good defaults', 'Composition over config', 'Controlled + uncontrolled', 'Accessible, forwards ref + native props', 'Documented (Storybook)'],
    followUps: ['What is a compound component?', 'How do you version a shared component library?'],
  },
  'error-boundaries': { sameAs: 'faq/react-error-handling' },
  'auth-in-a-spa-where-to-store-the-token': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `Anything in \`localStorage\` can be read by **any script on the page**, so one XSS bug can steal it. I prefer:

- **refresh token** in an **httpOnly, Secure, SameSite** cookie, which JavaScript can't read;
- **access token** kept **in memory** (short-lived), refreshed silently via the cookie on load and on 401.

Because cookies are sent automatically, I protect state-changing requests against **CSRF** (\`SameSite\`, CSRF tokens, or requiring a custom header). Route guards in the UI are only for UX; the **API enforces** every permission. At Firmwide I also made the refresh **single-flight**, so parallel 401s don't log users out.`,
    analogy: 'Keep the master key (refresh token) in a safe that the house guests can\'t open (httpOnly cookie), and carry only a short-lived day pass (access token) in your pocket.',
    quickRevision: ['localStorage is readable by XSS', 'Refresh token: httpOnly + Secure + SameSite cookie', 'Access token: in memory, short-lived', 'Protect against CSRF', 'UI guards = UX; API enforces'],
    followUps: ['How does silent refresh work on page load?', 'What is CSRF and how does SameSite help?'],
  },
  'testing-pyramid-for-frontend': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `From many and cheap to few and expensive:

1. **Unit tests** (Vitest/Jest) for pure utilities, hooks and reducers.
2. **Component and integration tests** with **React Testing Library**: render a component with realistic data (MSW for API mocks) and test **what the user sees and does**, not implementation details. This is where most of my effort goes.
3. **End-to-end tests** with **Playwright** for critical journeys (login, checkout, invoice generation) in CI.

Plus **static checks** (TypeScript, ESLint) and **accessibility checks** (axe). My AI Mock Interview Coach project has 244 Vitest tests and 11 Playwright specs, including WCAG checks.`,
    analogy: 'Checking a car: test each part on the bench (unit), test the engine assembled (integration), then take a few real test drives (E2E). You can\'t afford a test drive for every bolt.',
    quickRevision: ['Unit: utils, hooks, reducers', 'Integration: RTL + MSW, test user behaviour', 'E2E: Playwright for critical flows', 'Plus TS, ESLint, axe accessibility checks'],
    followUps: ['Why avoid testing implementation details?', 'How do you keep E2E tests from being flaky?'],
  },
  'accessibility-basics': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Start with **semantic HTML**, because native elements give accessibility for free: \`button\` for actions, \`a\` for navigation, real \`label\`s for inputs, headings in order. Then:

- **keyboard support**: everything reachable and usable with Tab, Enter and Escape, with visible focus;
- **focus management** in modals (trap focus, return it on close);
- **ARIA only when needed** (\`aria-expanded\`, \`aria-live\`), never to replace semantics;
- sufficient **colour contrast**, and never colour alone to show meaning;
- **alt text** for meaningful images.

I check with axe and keyboard-only testing. My recent projects include automated WCAG 2.1 AA checks in Playwright.`,
    analogy: 'Building ramps, clear signs and lifts into a building from the start instead of adding them after someone gets stuck at the door.',
    quickRevision: ['Semantic HTML first', 'Keyboard + visible focus', 'Focus management in dialogs', 'ARIA only when needed', 'Contrast, alt text; test with axe'],
    followUps: ['How do you make a custom dropdown accessible?', 'What is `aria-live` for?'],
  },
  // ---------------------------------------------------------------- 8. Browser & CSS
  'event-bubbling-vs-capturing': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `A DOM event travels in three phases: **capturing**, from \`window\` down to the target; the **target** phase; then **bubbling**, from the target back up to \`window\`. Listeners run in the bubbling phase by default (\`{ capture: true }\` for the capturing phase).

- \`stopPropagation()\` stops the event travelling further, so parents don't receive it.
- \`preventDefault()\` cancels the browser's **default action** (following a link, submitting a form). It doesn't stop propagation.

Bubbling is what makes **event delegation** possible.`,
    analogy: 'A letter delivered to an apartment: it goes down through the building, floor, flat (capturing), reaches the person, and then news of it travels back up to the building manager (bubbling).',
    quickRevision: ['Capture (down) → target → bubble (up)', 'Default listeners run on bubble', 'stopPropagation: stop travelling', 'preventDefault: cancel browser action'],
    followUps: ['When would you use the capture phase?', 'Do all events bubble? (focus, scroll)'],
  },
  'event-delegation': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Instead of attaching a listener to every child, I attach **one listener to a common parent** and use \`event.target\` (often \`target.closest('li')\`) to find which child was clicked. It works because events **bubble**.

Benefits: **fewer listeners** (less memory), and it automatically works for **elements added later**. React itself uses delegation: it attaches listeners at the root container rather than on every element.`,
    analogy: 'One receptionist answering calls for every room in the hotel instead of putting a separate receptionist in each room, including rooms built next year.',
    quickRevision: ['One listener on the parent', 'Find the child via event.target / closest', 'Works for dynamically added elements', 'React delegates at the root'],
    followUps: ['Implement delegation for a list of buttons.', 'Which events don\'t bubble?'],
  },
  'localstorage-vs-sessionstorage-vs-cookies': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `- **localStorage**: about 5MB per origin, **persists** until cleared, readable by JavaScript, never sent to the server. Good for preferences and drafts.
- **sessionStorage**: same API, but **scoped to the tab** and cleared when it closes. Good for per-tab temporary state.
- **Cookies**: small (about 4KB), **sent with every request** to their domain, with an expiry. They can be **httpOnly** (hidden from JS), **Secure** and **SameSite**, which makes them the right place for **session or refresh tokens**.

Never put secrets in local or session storage, because any XSS can read them.`,
    analogy: 'localStorage is a locker that stays yours; sessionStorage is a locker emptied when you leave the gym; cookies are a membership card shown at the door on every visit.',
    quickRevision: ['localStorage: persists, ~5MB, JS-readable', 'sessionStorage: per tab, cleared on close', 'Cookies: ~4KB, sent with requests, httpOnly/Secure/SameSite', 'Auth tokens → httpOnly cookie, not storage'],
    followUps: ['Can localStorage be shared across tabs?', 'What does SameSite=Lax do?'],
  },
  'what-is-cors': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `CORS (Cross-Origin Resource Sharing) is a **browser** rule. JavaScript on origin A **can't read responses** from origin B unless B allows it with headers like \`Access-Control-Allow-Origin\`. For "non-simple" requests (JSON bodies, custom headers like \`Authorization\`, PUT or DELETE), the browser first sends a **preflight \`OPTIONS\`** request.

Key points:

- It's enforced **by the browser**, not the server. Postman or curl ignore it.
- It **doesn't protect the server**: it protects users' data from being read by other sites.
- With cookies you need \`Access-Control-Allow-Credentials: true\` and an **explicit origin**, not \`*\`.
- Fix it on the server with an **allow-list**, or avoid it with a same-origin proxy.`,
    analogy: 'A building\'s visitor policy enforced by the visitor\'s own security guard (the browser): the guard won\'t let you carry documents out of another company\'s office unless that company has put your name on its guest list.',
    quickRevision: ['Browser blocks reading cross-origin responses', 'Server opts in with Access-Control-* headers', 'Preflight OPTIONS for non-simple requests', 'Credentials → explicit origin, not *', "Doesn't protect the server"],
    followUps: ['Why does Postman work but the browser fails?', 'CORS vs CSRF?'],
  },
  'critical-rendering-path': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `The steps from bytes to pixels:

1. Parse **HTML → DOM**.
2. Parse **CSS → CSSOM**.
3. Combine them into the **render tree** (visible nodes with styles).
4. **Layout**: compute sizes and positions.
5. **Paint**: draw the pixels.
6. **Composite** the layers.

**CSS is render-blocking**, and **synchronous scripts block HTML parsing**. To speed up the first render: inline or minimise critical CSS, use \`defer\` for scripts, preload key resources and reduce the critical bytes.`,
    analogy: 'Printing a newspaper: write the articles (DOM), decide the styles (CSSOM), lay out the page, print, then stack the pages. A late style decision holds up the whole print run.',
    quickRevision: ['HTML→DOM, CSS→CSSOM → render tree', 'Layout → paint → composite', 'CSS blocks render; sync JS blocks parsing', 'defer scripts, critical CSS, preload'],
    followUps: ['Why is CSS render-blocking?', 'What does `preload` do?'],
  },
  'reflow-vs-repaint': {
    difficulty: 'medium',
    frequency: 'medium',
    answer: `- **Reflow (layout)**: the browser recalculates **positions and sizes**, triggered by changing width, height, fonts or content, or by adding and removing elements. It's expensive and can cascade through the page.
- **Repaint**: redrawing pixels without layout changes (colour, background). It's cheaper.
- **Composite-only** changes (\`transform\`, \`opacity\`) skip both, running on the GPU, which is why animations should use them.

Also avoid **layout thrashing**: reading layout values (\`offsetHeight\`) between writes in a loop forces repeated reflows. Batch reads, then writes, or use \`requestAnimationFrame\`.`,
    analogy: 'Rearranging furniture (reflow) vs repainting a wall (repaint) vs sliding a picture along its hook (transform): only the first forces you to move everything else.',
    quickRevision: ['Reflow = layout recalculation (expensive)', 'Repaint = redraw pixels', 'Animate transform/opacity (compositor)', 'Avoid read/write interleaving (thrashing)'],
    followUps: ['What is layout thrashing?', 'What does `will-change` do?'],
  },
  'defer-vs-async-scripts': {
    difficulty: 'easy',
    frequency: 'medium',
    answer: `Both download the script **in parallel** without blocking HTML parsing. The difference is **when they run**:

- \`async\`: runs **as soon as it downloads**, pausing parsing, **in any order**. Good for independent scripts like analytics.
- \`defer\`: runs **after HTML parsing finishes**, **in document order**, before \`DOMContentLoaded\`. Good for app scripts that depend on the DOM or on each other.

A plain \`<script>\` blocks parsing while it downloads and runs. ES module scripts are deferred by default.`,
    analogy: 'async is a courier who barges in the moment they arrive; defer is a courier who waits politely until the meeting ends and then delivers parcels in order.',
    quickRevision: ['Both download in parallel', 'async: run ASAP, any order', 'defer: after parsing, in order', 'type="module" defers by default'],
    followUps: ['Where should analytics scripts go?', 'What happens with inline scripts?'],
  },
  'flexbox-vs-grid': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `- **Flexbox** is **one-dimensional**: it lays items out in a **row or a column**, letting content size drive the layout. Great for components: navbars, toolbars, aligning a button group, centring.
- **Grid** is **two-dimensional**: **rows and columns at once**, with the layout defined by the container. Great for page layouts, card galleries and dashboards.

They work well together: Grid for the page skeleton, Flexbox inside each cell.`,
    analogy: 'Flexbox is arranging books on a single shelf; Grid is designing the whole bookcase with shelves and columns.',
    quickRevision: ['Flex: 1D, content-driven', 'Grid: 2D, layout-driven', 'Flex for components, Grid for layouts', 'Combine them'],
    followUps: ['How would you build a responsive card grid without media queries?', 'What does `fr` mean?'],
  },
  'box-model': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `Every element is a box made of **content → padding → border → margin**. By default (\`content-box\`), \`width\` covers only the **content**, so padding and border are added on top, which makes sizes hard to reason about.

With \`box-sizing: border-box\`, \`width\` **includes padding and border**, so a 200px box stays 200px. That's why most resets apply \`*, *::before, *::after { box-sizing: border-box; }\`. Also remember **vertical margins collapse** between blocks.`,
    analogy: 'A framed picture: the photo (content), the matting (padding), the frame (border), and the gap between it and the next picture on the wall (margin).',
    quickRevision: ['content + padding + border + margin', 'content-box: width excludes padding/border', 'border-box: width includes them', 'Vertical margins collapse'],
    followUps: ['What is margin collapsing?', 'Why is border-box the common default?'],
  },
  'position-values': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `- \`static\`: the default, normal flow.
- \`relative\`: stays in flow but can be offset from **its own** position. It also becomes the **anchor** for absolutely positioned children.
- \`absolute\`: removed from flow, positioned relative to the **nearest positioned ancestor**.
- \`fixed\`: positioned relative to the **viewport** (it stays on screen while scrolling). Careful: a \`transform\` on an ancestor changes this.
- \`sticky\`: behaves like relative until a scroll threshold (\`top: 0\`), then sticks within its parent.`,
    analogy: 'Seating at a theatre: static is your assigned seat; relative is leaning a bit from it; absolute is standing at a spot relative to your row; fixed is the exit sign on the wall; sticky is the usher who walks with you until the aisle ends.',
    quickRevision: ['static: normal flow', 'relative: offset self, anchor for children', 'absolute: nearest positioned ancestor', 'fixed: viewport', 'sticky: relative until threshold'],
    followUps: ['Why isn\'t my sticky header sticking?', 'How does z-index stacking context work?'],
  },
  'css-specificity': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `When rules conflict, the browser picks the **most specific selector**: **inline styles > IDs > classes, attributes and pseudo-classes > elements and pseudo-elements**. You can think of it as a score like (1,0,0) vs (0,2,1). With **equal specificity, the later rule wins**. \`!important\` overrides normal rules, so avoid it except for utilities.

To keep CSS manageable: use low, flat specificity (single classes, BEM or utility CSS like Tailwind), avoid IDs for styling, and use cascade layers (\`@layer\`) to order libraries and app styles.`,
    analogy: 'A chain of command: a direct order from the CEO (inline) beats a department rule (ID), which beats a team rule (class), which beats general office etiquette (element).',
    quickRevision: ['inline > id > class/attr/pseudo-class > element', 'Equal specificity → later wins', 'Avoid !important and ID selectors', 'Keep specificity flat; @layer helps'],
    followUps: ['What is the specificity of `.nav li a:hover`?', 'What does `:where()` do to specificity?'],
  },
  'how-do-you-centre-a-div': {
    difficulty: 'easy',
    frequency: 'medium',
    answer: `The modern answers:

- \`display: grid; place-items: center;\` on the parent (shortest);
- \`display: flex; justify-content: center; align-items: center;\` on the parent;
- for horizontal centring of a block with a width: \`margin-inline: auto\`;
- for an overlay: \`position: absolute; inset: 0; margin: auto;\` with a set size, or \`top: 50%; left: 50%; transform: translate(-50%, -50%)\`.

The parent needs a height for vertical centring to be visible.`,
    analogy: 'Hanging a picture in the middle of a wall: tell the wall (parent) to centre whatever is hung on it, rather than measuring each picture by hand.',
    quickRevision: ['Grid: place-items: center', 'Flex: justify-content + align-items', 'margin-inline: auto for horizontal', 'Parent needs a height'],
    followUps: ['Centre text vs centre a box?', 'Why does `align-items` do nothing sometimes?'],
  },
  'display-none-vs-visibility-hidden-vs-opacity-0': {
    difficulty: 'easy',
    answer: `- \`display: none\`: the element is **removed from layout**. It takes no space, isn't clickable, and is hidden from screen readers.
- \`visibility: hidden\`: **keeps its space** but is invisible, not clickable, and hidden from screen readers.
- \`opacity: 0\`: **keeps its space and is still interactive** (clickable, focusable, read by screen readers). It's useful for fade animations, but dangerous for hiding things.

For content that should be hidden visually but **available to screen readers**, use a \`.sr-only\` class.`,
    analogy: 'display:none is removing the chair from the room; visibility:hidden is covering it with an invisibility cloak (still taking space); opacity:0 is a glass chair you can still trip over.',
    quickRevision: ['none: no space, not interactive', 'visibility hidden: keeps space, not interactive', 'opacity 0: keeps space, still interactive', '.sr-only for screen-reader-only text'],
    followUps: ['Which can be animated?', 'How do you hide something only visually?'],
  },
  'responsive-design': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `I build **mobile-first**: base styles for small screens, then \`min-width\` media queries (or Tailwind breakpoints) to enhance for larger ones. Plus:

- **fluid layouts** with flex and grid, \`%\`, \`fr\`, \`minmax()\` and \`clamp()\` for type;
- **relative units** (\`rem\`) so user font settings are respected;
- **responsive images** (\`srcset\`, \`next/image\`);
- **container queries** when a component should adapt to its container, not the viewport;
- **touch-friendly** targets (about 44px).

And I test on real devices, not just DevTools. At SmartCrowd I improved responsive layouts across desktop, tablet and mobile.`,
    analogy: 'Water taking the shape of whatever glass it\'s poured into, instead of designing a separate drink for every glass size.',
    quickRevision: ['Mobile-first + min-width queries', 'Flex/grid, fr, minmax, clamp', 'rem units; responsive images', 'Container queries; 44px touch targets', 'Test on real devices'],
    followUps: ['Media queries vs container queries?', 'How do you handle tables on mobile?'],
  },
  'rem-vs-em-vs-px': {
    difficulty: 'easy',
    answer: `- \`px\`: a fixed size. It doesn't scale with the user's font settings.
- \`em\`: relative to the **parent's font size**, so it **compounds** when nested (1.2em inside 1.2em = 1.44×). Useful for padding that should scale with a component's own text.
- \`rem\`: relative to the **root (html) font size**, so it's predictable and **respects the user's browser font setting**. Accessibility-friendly.

My default: \`rem\` for font sizes and spacing, \`em\` for component-internal spacing, \`px\` for borders and hairlines.`,
    analogy: 'px is a fixed ruler; em is "a bit bigger than whatever my parent is" (so it snowballs); rem is "a bit bigger than the house standard", always the same reference.',
    quickRevision: ['px: fixed', 'em: parent-relative, compounds', 'rem: root-relative, respects user settings', 'rem for type/spacing, px for borders'],
    followUps: ['Why does em compound?', 'What are viewport units (vw, dvh)?'],
  },
  'xss-and-how-react-protects-against-it': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `**XSS (cross-site scripting)** is an attacker getting **their script to run in my page**, for example through a comment containing \`<script>\`, so it can steal data or act as the user.

React **escapes values in JSX by default**: \`{userInput}\` is rendered as text, not HTML. The risky spots are:

- \`dangerouslySetInnerHTML\`: **sanitise with DOMPurify** first;
- \`href\`/\`src\` built from user input (\`javascript:\` URLs), so validate protocols;
- third-party scripts and direct DOM manipulation.

Defence in depth: a **Content Security Policy** header, **httpOnly cookies** so tokens can't be stolen by scripts, and server-side output encoding.`,
    analogy: 'React reads every guest message aloud as plain text instead of following any instructions written in it; `dangerouslySetInnerHTML` is choosing to follow the instructions, so check them first.',
    quickRevision: ['XSS = attacker script running in your page', 'React escapes JSX text by default', 'Risks: dangerouslySetInnerHTML, javascript: URLs, 3rd-party scripts', 'Sanitise (DOMPurify), CSP, httpOnly cookies'],
    followUps: ['Stored vs reflected vs DOM XSS?', 'How does a CSP help?'],
  },
  csrf: {
    difficulty: 'medium',
    frequency: 'high',
    answer: `**CSRF (cross-site request forgery)**: a malicious site makes the user's browser send a request to **my** site, and the browser **automatically attaches the user's cookies**, so the request looks legitimate (for example "transfer money").

Protections:

- **SameSite cookies** (\`Lax\` or \`Strict\`), so cookies aren't sent on cross-site requests. This is the main modern defence.
- **CSRF tokens**: a secret value the server checks on state-changing requests.
- Sending auth in a **custom header** (\`Authorization: Bearer\`) instead of relying on cookies alone.
- Never change state on **GET**.

CORS doesn't stop CSRF: the request is still sent, the attacker just can't read the response.`,
    analogy: 'Someone tricks you into signing a cheque by sliding it into a stack of papers; your signature (cookie) is genuine, but you never meant to sign that one.',
    quickRevision: ['Browser auto-sends cookies on forged requests', 'SameSite=Lax/Strict is the main defence', 'CSRF tokens; custom auth header', 'No state changes on GET', 'CORS ≠ CSRF protection'],
    followUps: ['Why doesn\'t CORS prevent CSRF?', 'Lax vs Strict vs None?'],
  },
  'what-happens-when-you-type-a-url': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `1. **URL parsing**, and checking the browser cache or HSTS.
2. **DNS lookup**: browser, OS, then resolver caches, then recursive DNS → IP address.
3. **TCP connection** (or QUIC for HTTP/3), then the **TLS handshake** for HTTPS (certificate check, keys agreed).
4. **HTTP request** with headers and cookies → through CDN, load balancer and reverse proxy (Nginx) → **application server** → database or cache → **response** (status, headers, HTML).
5. The browser **parses HTML** into the DOM, fetches CSS, JS and images (often in parallel over HTTP/2), builds the **CSSOM and render tree**, then runs **layout → paint → composite**, and executes JS, which may fetch more data.

I adjust the depth to the interviewer: network-heavy for backend roles, rendering-heavy for frontend.`,
    analogy: 'Visiting a friend: look up their address (DNS), drive there and show ID at the gate (TCP + TLS), ask for the parcel (HTTP), then unpack and arrange the furniture (parsing and rendering).',
    quickRevision: ['Cache/HSTS → DNS → TCP → TLS', 'HTTP request → CDN/LB/proxy → app → DB', 'Response → HTML parse → DOM/CSSOM', 'Layout → paint → composite → JS'],
    followUps: ['What happens in a TLS handshake?', 'How does a CDN speed this up?', 'HTTP/2 vs HTTP/3?'],
  },
  'service-workers--pwa': {
    difficulty: 'medium',
    answer: `A **service worker** is a script that runs **between the page and the network**, in the background and separate from the page. It can **intercept requests** and answer from a cache, which enables **offline support**, faster repeat visits, **background sync** and **push notifications**. It only works over HTTPS.

A **PWA** is a web app that uses a service worker plus a **web app manifest** (name, icons, theme) to be **installable** and app-like. The tricky part is **cache invalidation**: users can get stuck on old versions, so you need a clear update strategy (versioned caches, prompting to reload).`,
    analogy: 'A personal assistant at your door who keeps copies of your usual deliveries: if the courier (network) is late or missing, they hand you the copy, and they can receive parcels while you\'re out.',
    quickRevision: ['Proxy between page and network', 'Offline cache, background sync, push', 'HTTPS only; separate from the page', 'PWA = service worker + manifest (installable)', 'Watch out for stale cache versions'],
    followUps: ['Cache-first vs network-first strategies?', 'How do you ship an update to a PWA safely?'],
  },
});
