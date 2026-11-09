import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'React Hooks',
  description: 'useState, useEffect, useRef, useMemo, custom hooks and the rules that keep them working.',
  questions: [
    {
      id: 'rules-of-hooks',
      question: 'Rules of hooks?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['react'],
      answer: `Two rules:

1. Call hooks **only at the top level**: not inside loops, conditions or nested functions.
2. Call them **only from React function components or custom hooks**.

The reason is that React identifies each hook by its **call order** during a render. If a condition skips a hook on one render, every hook after it gets the wrong state. The ESLint plugin \`react-hooks\` enforces both rules. If I need conditional behaviour, I put the condition **inside** the hook (\`useEffect(() => { if (!x) return; … })\`).`,
      variants: [
        { label: 'Short version', answer: `Call them only at the top level (not in loops or conditions) and only from components or custom hooks, because React tracks hooks by call order.` },
      ],
      analogy: `Hooks are numbered lockers assigned by arrival order; if someone skips the queue one day, everyone after them opens the wrong locker.`,
      quickRevision: [
        'Top level only, never conditional',
        'Only in components/custom hooks',
        'React tracks hooks by call order',
        'Put the condition inside the hook',
      ],
      followUps: [
        'Why does call order matter?',
        'Does `use()` in React 19 follow the same rules?',
      ],
    },
    {
      id: 'react-useeffect-pitfalls',
      question: 'Explain useEffect dependencies and cleanup. What bugs have you seen with it?',
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
        'Don\'t use effects for derived state; compute during render',
      ],
      followUps: [
        'Why does React 18 StrictMode run effects twice in development?',
        '`useEffect` vs `useLayoutEffect`: when do you need the second?',
        'How does TanStack Query remove most data-fetching effects?',
      ],
    },
    {
      id: 'useeffect-vs-uselayouteffect',
      question: '`useEffect` vs `useLayoutEffect`?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `Both run after React updates the DOM. The difference is **timing**:

- \`useEffect\` runs **after the browser paints**, so it doesn't block the screen. Use it for almost everything: data, subscriptions, logging.
- \`useLayoutEffect\` runs **synchronously before paint**. Use it when you must **measure the DOM and adjust layout** before the user sees it (tooltip positioning, scroll restoration, avoiding a visible flicker).

Because \`useLayoutEffect\` blocks painting, overusing it hurts performance. It also warns during SSR, since there's no layout on the server.`,
      variants: [
        { label: 'Short version', answer: 'See Techzu notes. Layout effect runs synchronously before paint; use it for DOM measurements.' },
      ],
      analogy: `useEffect is tidying up after the guests have seen the room; useLayoutEffect is straightening the picture frame before you open the door.`,
      quickRevision: [
        'useEffect: after paint, non-blocking (default)',
        'useLayoutEffect: before paint, blocking',
        'Layout effect for measure → adjust without flicker',
        'Avoid it on the server',
      ],
      followUps: [
        'Give a case where useEffect causes a flicker.',
        'What is `useInsertionEffect` for?',
      ],
    },
    {
      id: 'react-memo-usememo-usecallback',
      question: 'When should you use useMemo, useCallback and React.memo — and when should you not?',
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
      id: 'useref-uses',
      question: '`useRef` uses?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['react'],
      answer: `\`useRef\` returns a mutable object \`{ current }\` that **persists across renders** without causing a re-render when it changes. Two main uses:

1. **DOM access**: \`ref={inputRef}\` and then \`inputRef.current.focus()\`, measuring sizes, or integrating non-React libraries.
2. **Mutable instance values** that shouldn't trigger renders: timer IDs, the previous value (\`usePrevious\`), "is mounted" flags, or the latest callback to avoid stale closures.

Don't read or write \`ref.current\` during render for things that affect output. That's what state is for.`,
      variants: [
        { label: 'Short version', answer: 'DOM access, and mutable values that persist without causing re-renders (timers, previous value).' },
      ],
      analogy: `A sticky note on the back of your desk: you can change it anytime and it stays there between meetings, but nobody re-holds the meeting because you updated it.`,
      quickRevision: [
        'Persists across renders, no re-render on change',
        'DOM access (focus, measure)',
        'Timers, previous values, latest callback',
        'Not for values that affect rendering',
      ],
      followUps: [
        'Implement `usePrevious`.',
        'useRef vs useState: when to choose which?',
        'What is a callback ref?',
      ],
    },
    {
      id: 'usereducer-vs-usestate',
      question: '`useReducer` vs `useState`?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `\`useState\` is perfect for **independent, simple values**. I switch to \`useReducer\` when:

- several values **change together** (a form with status, data and error);
- the next state depends on the previous one in **complex ways**;
- I want all transitions **in one place** as named actions, which makes them testable as a pure function.

A reducer also helps avoid impossible states, like \`loading: true\` together with \`error\` set, by modelling explicit statuses.`,
      variants: [
        { label: 'Short version', answer: 'Use `useReducer` for complex state transitions or when the next state depends on several fields.' },
      ],
      analogy: `useState is a light switch; useReducer is a control panel with labelled buttons ("submit", "success", "fail") that always moves the system to a valid state.`,
      quickRevision: [
        'useState: simple, independent values',
        'useReducer: related values, complex transitions',
        'Reducer is pure → easy to test',
        'Model statuses to avoid impossible states',
      ],
      followUps: [
        'Write a reducer for a fetch status.',
        'useReducer + Context vs Redux?',
      ],
    },
    {
      id: 'stale-closure-in-hooks',
      question: 'Stale closure in hooks?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['react', 'javascript'],
      answer: `Each render creates **new functions** that close over **that render's** props and state. A **stale closure** happens when a long-lived callback, like an interval, a subscription or an effect with missing dependencies, keeps using values from an **old render**. Classic case: \`setInterval(() => setCount(count + 1), 1000)\` in an effect with \`[]\` keeps setting it to 1.

Fixes:

- **functional updates**: \`setCount(c => c + 1)\`;
- **correct dependencies**, so the effect re-subscribes;
- a **ref** holding the latest value or callback (\`useLatest\`, or \`useEffectEvent\` in newer React).`,
      variants: [
        { label: 'Short version', answer: `An effect or callback captured old state. Fix it with correct dependencies, a functional update \`setX(x => x + 1)\` or a ref.` },
      ],
      analogy: `Using last week's printed timetable: the bus times have changed, but you're still reading the old copy you grabbed when you left home.`,
      quickRevision: [
        'Callbacks capture the render they were created in',
        'Long-lived callbacks see old values',
        'Fix: functional update `set(x => …)`',
        'Fix: correct deps or a ref with the latest value',
      ],
      followUps: [
        'Fix a counter interval that always shows 1.',
        'What is `useEffectEvent`?',
      ],
    },
    {
      id: 'custom-hook-example',
      question: 'Custom hook example?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['react'],
      answer: `A custom hook is a function starting with \`use\` that **reuses stateful logic**, not UI, between components. Each component that calls it gets its **own state**.

Examples I've written: \`useDebounce(value, delay)\` for search inputs, \`useLocalStorage(key, initial)\`, \`useFetch\` with an \`AbortController\`, and \`usePrevious\`. I've also published two hooks on npm: **block-browser-back** and **checkout-risk-sdk**. Good custom hooks have a small API, clean up after themselves, and are easy to test.`,
      variants: [
        { label: 'Short version', answer: '`useDebounce`, `useFetch`, `useLocalStorage`. Your npm hook `block-browser-back` is a real example.' },
      ],
      analogy: `A recipe card: every cook (component) who follows it makes their own dish (own state) from the same proven steps.`,
      quickRevision: [
        'Starts with `use`; reuses logic, not UI',
        'Each caller gets its own state',
        'Examples: useDebounce, useLocalStorage, useFetch',
        'Published hooks: block-browser-back, checkout-risk-sdk',
      ],
      followUps: [
        'Write `useDebounce`.',
        'How do you test a custom hook?',
        'Custom hook vs utility function?',
      ],
    },
    {
      id: 'why-fetch-in-useeffect-is-discouraged-now',
      question: 'Why fetch in `useEffect` is discouraged now?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `Fetching in \`useEffect\` works, but done by hand you rebuild a lot badly:

- **race conditions**, where an old response overwrites a newer one;
- **no caching or deduplication**, so the same data is fetched on every mount;
- **waterfalls**, where a child only starts fetching after its parent rendered;
- loading and error boilerplate;
- double fetches in StrictMode.

Better options: **TanStack Query** (caching, refetching, dedupe, retries) on the client, or fetching in **Server Components** or route loaders. If I must use an effect, I add an \`AbortController\` in the cleanup and handle loading and error states.`,
      variants: [
        { label: 'Short version', answer: `Race conditions, no caching or dedupe, waterfalls. Prefer TanStack Query or framework loaders. If you must use it, use an \`AbortController\` plus cleanup.` },
      ],
      analogy: `Cooking every meal from scratch versus using a well-run pantry: TanStack Query remembers what you already have, restocks when it's stale and avoids buying the same thing twice.`,
      quickRevision: [
        'Problems: races, no cache/dedupe, waterfalls, boilerplate',
        'Use TanStack Query or server-side fetching',
        'If using an effect: AbortController + cleanup',
        'Handle loading / error / empty states',
      ],
      followUps: [
        'How does TanStack Query avoid duplicate requests?',
        'Show a race-safe fetch effect.',
      ],
    },
    {
      id: 'usecontext-performance-issue',
      question: '`useContext` performance issue?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react', 'performance'],
      answer: `When a Context **value changes**, **every component that consumes it re-renders**, even if it only uses one field. And if the provider passes a new object every render (\`value={{ user, setUser }}\`), consumers re-render every time the provider renders.

Fixes:

- **memoise the value** with \`useMemo\`;
- **split contexts** (state separate from setters, or by domain);
- keep frequently changing data **out of Context**: use Zustand or Redux with **selectors**, or \`useSyncExternalStore\`.`,
      variants: [
        { label: 'Short version', answer: `Every consumer re-renders when the value changes. Split contexts, memoize the value, or use a selector-based store.` },
      ],
      analogy: `A building-wide announcement system: every announcement wakes up every room, even if it only concerns one office. Split the speakers by floor, or use direct messages (selectors).`,
      quickRevision: [
        'All consumers re-render on value change',
        'New object each render → constant re-renders',
        'Fix: useMemo value, split contexts',
        'Busy state → store with selectors',
      ],
      followUps: [
        'Why does splitting state and dispatch contexts help?',
        'How do selectors avoid re-renders?',
      ],
    },
  ],
});
