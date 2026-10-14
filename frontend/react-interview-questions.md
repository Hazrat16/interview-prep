# React, Next.js & TypeScript Interview Questions

The most frequently asked frontend questions for mid-level roles, each with a short answer to say out loud. JavaScript fundamentals are in [../javascript/](../javascript/).

---

## 1. React fundamentals

| Question | Short answer |
|----------|--------------|
| What is the virtual DOM? | An in-memory tree of UI. On each render React builds a new tree, **diffs** it against the previous one (reconciliation) and applies only the changes to the real DOM. |
| Why do lists need `key`? | So reconciliation can match items between renders. Using the index as a key breaks state and animations when items are reordered, inserted or deleted. |
| State versus props? | Props are passed in by the parent and read-only. State is owned by the component, and changing it triggers a re-render. |
| What triggers a re-render? | A state change, the parent re-rendering, or a context value change. Props changing alone doesn't, since props only change because the parent re-rendered. |
| Controlled versus uncontrolled inputs? | Controlled: React state is the source of truth (`value` + `onChange`). Uncontrolled: the DOM holds the value (`ref`, `defaultValue`). React Hook Form mostly uses uncontrolled inputs for performance. |
| Lifting state up? | Move shared state to the closest common parent and pass it down. |
| Prop drilling, and how to avoid it? | Passing props through many layers. Fixes: composition (`children`), Context, or a state library. |
| Fragments? | `<>...</>` groups elements without adding a DOM node. |
| What is JSX compiled to? | `jsx()` / `React.createElement()` calls that return plain objects. |
| React 18/19 features? | Automatic batching, `useTransition`, `useDeferredValue`, Suspense for data, concurrent rendering. React 19 adds Actions, `use()`, `useOptimistic`, `useActionState`, `ref` as a prop and the React Compiler. |
| StrictMode double invoke? | In development, React renders twice and runs effects mount → unmount → mount to surface impure renders and missing cleanups. |

## 2. Hooks

| Question | Short answer |
|----------|--------------|
| Rules of hooks? | Call them only at the top level (not in loops or conditions) and only from components or custom hooks, because React tracks hooks by call order. |
| `useEffect` dependency array? | None: runs after every render. `[]`: once after mount. `[a, b]`: when a or b changes. The return value is the cleanup. |
| `useEffect` vs `useLayoutEffect`? | See [Techzu notes](../companies/techzu.md). Layout effect runs synchronously before paint; use it for DOM measurements. |
| `useMemo` vs `useCallback`? | `useMemo` caches a value, `useCallback` caches a function. Only useful with `React.memo` children, expensive calculations or stable dependencies. |
| `React.memo`? | Skips a re-render if props are shallowly equal. Breaks if you pass a new object or function every render. |
| `useRef` uses? | DOM access, and mutable values that persist without causing re-renders (timers, previous value). |
| `useReducer` vs `useState`? | Use `useReducer` for complex state transitions or when the next state depends on several fields. |
| Stale closure in hooks? | An effect or callback captured old state. Fix it with correct dependencies, a functional update `setX(x => x + 1)` or a ref. |
| Custom hook example? | `useDebounce`, `useFetch`, `useLocalStorage`. Your npm hook `block-browser-back` is a real example. |
| Why fetch in `useEffect` is discouraged now? | Race conditions, no caching or dedupe, waterfalls. Prefer TanStack Query or framework loaders. If you must use it, use an `AbortController` plus cleanup. |
| `useContext` performance issue? | Every consumer re-renders when the value changes. Split contexts, memoize the value, or use a selector-based store. |

## 3. State management & data fetching

| Question | Short answer |
|----------|--------------|
| Server state versus client state? | Server state is remote data that needs caching, refetching and invalidation, so use TanStack Query. Client state is UI-only (modals, form steps), so use `useState`, Context, Redux or Zustand. |
| Why Redux Toolkit? | Less boilerplate (`createSlice`), Immer for "mutating" updates, built-in thunks and RTK Query, good DevTools. |
| Redux data flow? | dispatch(action) → reducer(state, action) → new state → subscribed components re-render. |
| TanStack Query `staleTime` vs `gcTime`? | `staleTime` is how long data counts as fresh (no refetch). `gcTime` is how long unused cache is kept. |
| Optimistic updates? | Update the cache immediately, roll back `onError`, invalidate `onSettled`. |
| Context versus Redux? | Context is dependency injection, not a state manager. It's fine for theme or auth, not for frequently changing global state. |

## 4. Performance (your strong area: prepare deeply)

| Question | Short answer |
|----------|--------------|
| How did you cut load time by 30–45%? | Route-based code splitting with `React.lazy` + `Suspense`, lazy-loading heavy libraries, and reworking legacy components. Measured with Lighthouse, Web Vitals and a bundle analyzer. |
| How do you find performance problems? | React DevTools Profiler, the Chrome Performance tab, Lighthouse, a bundle analyzer, and why-did-you-render. |
| Long list with 10k rows? | Virtualization (`react-window`, TanStack Virtual), pagination, and memoized rows. |
| Core Web Vitals? | **LCP** (loading, < 2.5s), **INP** (responsiveness, < 200ms), **CLS** (layout shift, < 0.1). |
| Fix a typing lag in a search input? | Debounce the API call, `useDeferredValue` / `useTransition` for heavy filtering, and keep input state local. |
| Image optimization? | Correct sizes, `srcset`, modern formats (WebP/AVIF), `loading="lazy"`, `next/image`. |
| Tree shaking? | Unused exports are removed at build time. It needs ES modules, so import specific modules (`lodash-es`). |

## 5. Next.js

| Question | Short answer |
|----------|--------------|
| SSR vs SSG vs ISR vs CSR? | See [Techzu notes](../companies/techzu.md). Rendered per request / at build time / statically and revalidated / in the browser. |
| Server Components versus Client Components? | Server Components (the default in the App Router) run only on the server and send no JS. Use `'use client'` for state, effects and browser APIs. |
| Hydration and hydration errors? | Hydration is React attaching events to server-rendered HTML. Errors happen when server and client output differ (e.g. `Date.now()`, `window`). |
| App Router data fetching? | `async` Server Components with `fetch` and caching options, Server Actions for mutations, `revalidatePath` / `revalidateTag`. |
| Middleware in Next.js? | Runs before a route resolves (Edge). Used for auth redirects and i18n. |

## 6. TypeScript

| Question | Short answer |
|----------|--------------|
| `type` vs `interface`? | Both describe shapes. Interfaces can be merged and extended. Types can express unions, tuples and mapped types. Pick one convention. |
| `any` vs `unknown`? | `unknown` forces you to narrow before using it, so it's safe. `any` turns type checking off. |
| Generics example? | `function first<T>(arr: T[]): T \| undefined`. Reusable code that keeps the type. |
| Utility types? | `Partial`, `Required`, `Pick`, `Omit`, `Record`, `ReturnType`, `Awaited`. |
| Narrowing? | `typeof`, `instanceof`, `in`, discriminated unions (`type: 'success' \| 'error'`). |
| Typing props and events? | `type Props = {...}`; `React.ChangeEvent<HTMLInputElement>`; `React.ReactNode` for children. |
| Zod with TypeScript? | Runtime validation plus `z.infer<typeof schema>` to get a single source of truth for types. |

## 7. Architecture & testing

| Question | Short answer |
|----------|--------------|
| How do you structure a large React app? | Feature-based / vertical slices (your Firmwide app): each domain owns its components, hooks, API calls and types, with ESLint import boundaries between them. |
| Designing a reusable component? | Small props API, composition over config, accessible by default, controlled and uncontrolled support, docs or Storybook. |
| Error boundaries? | Class components catch render errors in their subtree and show a fallback. They don't catch errors in event handlers or async code. |
| Auth in a SPA: where to store the token? | Prefer an httpOnly, Secure, SameSite cookie (safer against XSS) over localStorage. Use route guards for UX, but the API enforces access. |
| Testing pyramid for frontend? | Unit (utilities, hooks), component (React Testing Library), E2E (Playwright: you have this in SmartJobHub). |
| Accessibility basics? | Semantic HTML, labels, keyboard navigation, focus management, ARIA only when needed, colour contrast. |

## 8. Browser & CSS

| Question | Short answer |
|----------|--------------|
| Event bubbling vs capturing? | Events go down from `window` to the target (capturing), then back up (bubbling). Handlers run in the bubbling phase by default. `stopPropagation()` stops it moving further. `preventDefault()` cancels the browser action (e.g. form submit). |
| Event delegation? | Put one listener on a parent and use `event.target` to see which child was clicked. Fewer listeners, and it works for elements added later. React itself delegates to the root. |
| `localStorage` vs `sessionStorage` vs cookies? | localStorage: ~5MB, persists, JS-readable. sessionStorage: same but cleared when the tab closes. Cookies: small (~4KB), sent with every request, can be `httpOnly` (JS can't read it, safer for auth tokens), `Secure` and `SameSite`. |
| What is CORS? | The browser blocks JS from reading responses from another origin unless the server allows it with `Access-Control-Allow-Origin`. For non-simple requests (custom headers, PUT/DELETE, JSON), the browser first sends a **preflight** `OPTIONS` request. CORS is enforced by the browser, not the server. |
| Critical rendering path? | HTML → DOM, CSS → CSSOM, combined into the render tree → layout (sizes and positions) → paint → composite. CSS blocks rendering and sync JS blocks parsing, so use `defer` / `async` for scripts. |
| Reflow vs repaint? | Reflow (layout) recalculates positions and is expensive, triggered by changing size or position. Repaint redraws pixels (e.g. colour). Animating `transform` and `opacity` skips both on the GPU compositor, so it's smooth. |
| `defer` vs `async` scripts? | Both download in parallel. `async` runs as soon as it's downloaded, in any order. `defer` runs after HTML parsing, in order. |
| Flexbox vs Grid? | Flexbox is one-dimensional (a row **or** a column) and good for components like navbars. Grid is two-dimensional (rows **and** columns) and good for page layouts. |
| Box model? | content + padding + border + margin. `box-sizing: border-box` makes `width` include padding and border, so it's easier to reason about. |
| `position` values? | `static` (default), `relative` (offset from itself, becomes the anchor for absolute children), `absolute` (relative to the nearest positioned ancestor), `fixed` (relative to the viewport), `sticky` (normal until a scroll threshold, then sticks). |
| CSS specificity? | inline > id > class / attribute / pseudo-class > element. `!important` overrides everything (avoid it). With equal specificity, the later rule wins. |
| How do you centre a div? | `display: flex; justify-content: center; align-items: center;` or `display: grid; place-items: center;`. |
| `display: none` vs `visibility: hidden` vs `opacity: 0`? | none: removed from layout. hidden: keeps its space, invisible, not clickable. opacity 0: keeps its space, still clickable. |
| Responsive design? | Mobile-first CSS, media queries, flexible units (`%`, `rem`, `fr`), responsive images, and testing on real devices. |
| `rem` vs `em` vs `px`? | `px` is fixed. `em` is relative to the parent font size (it compounds). `rem` is relative to the root font size, so it's predictable and respects user settings. |
| XSS and how React protects against it | XSS is injected script running in your page. React escapes values in JSX automatically. The danger is `dangerouslySetInnerHTML` (sanitize with DOMPurify), `href="javascript:..."` and third-party scripts. A CSP header adds protection. |
| CSRF? | Another site makes the user's browser send a request with their cookies. Protect with `SameSite` cookies, CSRF tokens, or tokens sent in headers instead of cookies. |
| What happens when you type a URL? | DNS lookup → TCP connection → TLS handshake → HTTP request → server response → browser parses HTML, fetches CSS and JS → render. |
| Service workers / PWA? | A script that runs between the page and the network. Enables offline caching, background sync and push notifications. |

## 9. Common live-coding tasks

Full solutions are in [react-live-coding-solutions.md](react-live-coding-solutions.md):

1. Fetch and display a list with loading, error and empty states, plus search with debounce
2. Todo app: add, toggle, delete, filter, persist to localStorage
3. Build `useDebounce` / `useFetch` / `usePrevious`
4. Infinite scroll (IntersectionObserver)
5. Modal with outside click and Escape to close
6. Form with validation (React Hook Form + Zod)
7. Countdown timer (clean up the interval)
8. Accordion / tabs component
