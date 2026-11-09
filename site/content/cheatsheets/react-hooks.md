---
title: React Hooks
description: Every built-in hook, when to use it, and the rules and pitfalls.
icon: layers
order: 5
---

## State

| Hook | Use it for |
|---|---|
| `useState(init)` | Local component state. Use `setX(prev => …)` when the next value depends on the previous one |
| `useReducer(reducer, init)` | Several related values or complex transitions |
| `useContext(Ctx)` | Read a value without prop drilling. Every consumer re-renders when the value changes |
| `useSyncExternalStore` | Subscribe to an external store (Redux, localStorage, browser APIs) |

## Effects

| Hook | Runs |
|---|---|
| `useEffect(fn, deps)` | After paint. Data sync, subscriptions, timers |
| `useLayoutEffect(fn, deps)` | Before paint. Measure the DOM / prevent flicker |
| `useInsertionEffect` | Before layout effects; for CSS-in-JS libraries |

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${id}`, { signal: controller.signal }).then(/* … */);
  return () => controller.abort(); // cleanup on unmount or before re-run
}, [id]);
```

Deps: `[]` = once after mount · `[a, b]` = when `a` or `b` change · omitted = after every render.

## Refs

| Hook | Use it for |
|---|---|
| `useRef(init)` | A mutable box that survives renders without causing one: DOM nodes, timer IDs, previous values |
| `useImperativeHandle` | Expose a custom API from a child via `ref` |

## Performance

| Hook | Use it for |
|---|---|
| `useMemo(() => value, deps)` | Cache an expensive calculation or keep an object reference stable |
| `useCallback(fn, deps)` | Keep a function reference stable (for `React.memo` children or effect deps) |
| `useTransition()` | Mark an update as non-urgent so typing stays responsive |
| `useDeferredValue(value)` | Render a lagging copy of a value (slow lists while filtering) |

Only memoise when you measured a problem or a child is wrapped in `React.memo`.

## React 19

| Hook | Use it for |
|---|---|
| `use(promise / context)` | Read a promise (with Suspense) or context, even conditionally |
| `useActionState(action, init)` | Form action state: pending, result, errors |
| `useFormStatus()` | Pending state of the parent `<form>` |
| `useOptimistic(state, update)` | Show the expected result before the server confirms |
| `useId()` | Stable unique IDs for accessibility attributes (SSR-safe) |

## Rules of hooks

1. Call hooks only at the **top level** — not inside conditions, loops or nested functions.
2. Call them only from **components or custom hooks** (`useSomething`).
3. React tracks hooks by **call order**; breaking the rules mixes up state between hooks.

## Common pitfalls

- **Stale closure**: an interval or effect keeps the old state. Fix deps, use the functional update, or a ref.
- **Infinite loop**: an effect sets state that is also in its deps, or deps contain a new object every render.
- **Derived state in `useState`**: compute it during render instead of syncing with an effect.
- **Missing cleanup**: subscriptions, listeners and timers leak and fire after unmount.
- **Strict Mode** runs effects twice in development to surface missing cleanups.
