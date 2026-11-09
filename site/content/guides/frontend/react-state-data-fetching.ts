import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'State & Data Fetching',
  description: 'Local vs global vs server state, Context, Redux, React Query and caching.',
  questions: [
    {
      id: 'react-state-management-choice',
      question: 'How do you decide between local state, Context, Redux/Zustand and TanStack Query?',
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
      id: 'why-redux-toolkit',
      question: 'Why use Redux Toolkit instead of plain Redux?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['react'],
      answer: `Redux Toolkit is the **official, modern way** to write Redux. It removes most of the boilerplate:

- \`createSlice\` generates actions and reducers together;
- **Immer** lets me write "mutating" updates that are actually immutable;
- \`configureStore\` sets up DevTools and sensible middleware;
- \`createAsyncThunk\` handles async logic;
- **RTK Query** handles server data with caching.

I used Redux at SmartCrowd for complex shared client state across investment and portfolio flows. Today I'd use TanStack Query for server data and keep Redux or Zustand for genuinely shared client state.`,
      variants: [
        { label: 'Short version', answer: `Less boilerplate (\`createSlice\`), Immer for "mutating" updates, built-in thunks and RTK Query, good DevTools.` },
      ],
      analogy: `Classic Redux is building furniture from raw wood; Redux Toolkit is the flat-pack version with pre-drilled holes: same furniture, far less effort and fewer mistakes.`,
      quickRevision: [
        'createSlice = actions + reducer',
        'Immer for immutable updates',
        'configureStore: DevTools + middleware',
        'RTK Query for server state',
      ],
      followUps: [
        'How does Immer work?',
        'RTK Query vs TanStack Query?',
        'When would you pick Zustand instead?',
      ],
    },
    {
      id: 'redux-data-flow',
      question: 'Explain the Redux data flow.',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['react'],
      answer: `Redux is **one-way data flow**:

1. The UI **dispatches** an action (\`{ type: 'cart/added', payload }\`).
2. **Middleware** (thunks, logging) can intercept it.
3. The **reducer** computes the **new state** from the old state and the action, as a pure function.
4. The store notifies subscribers, and components using \`useSelector\` **re-render only if their selected slice changed**.

This predictability makes state changes easy to trace in DevTools (time-travel debugging).`,
      variants: [
        { label: 'Short version', answer: 'dispatch(action) → reducer(state, action) → new state → subscribed components re-render.' },
      ],
      analogy: `A bank: you can't change your balance directly; you submit a transaction slip (action), the teller applies the rules (reducer), and your statement updates (re-render).`,
      quickRevision: [
        'dispatch(action) → middleware → reducer → new state',
        'Reducers are pure',
        'useSelector re-renders on selected changes',
        'Predictable + DevTools time travel',
      ],
      followUps: [
        'Where do side effects go in Redux?',
        'Why must reducers not mutate state?',
      ],
    },
    {
      id: 'tanstack-query-staletime-vs-gctime',
      question: 'In TanStack Query, what is the difference between `staleTime` and `gcTime`?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['react', 'nextjs', 'typescript'],
      answer: `- **\`staleTime\`**: how long fetched data is considered **fresh**. While fresh, TanStack Query **won't refetch** on mount or window focus. The default is 0, so data is stale immediately.
- **\`gcTime\`** (formerly \`cacheTime\`): how long **unused** data (no component subscribed) stays **in the cache** before it's garbage-collected. The default is 5 minutes.

So a list might have \`staleTime: 30_000\` to avoid refetching on every navigation, while \`gcTime\` lets me go back to a page and see cached data instantly while it revalidates in the background.`,
      variants: [
        { label: 'Short version', answer: `\`staleTime\` is how long data counts as fresh (no refetch). \`gcTime\` is how long unused cache is kept.` },
      ],
      analogy: `staleTime is the "best before" date: until then you don't restock. gcTime is how long leftovers stay in the fridge after nobody's eating them before they get thrown out.`,
      quickRevision: [
        'staleTime: fresh window, no refetch',
        'gcTime: how long unused cache is kept',
        'Defaults: staleTime 0, gcTime 5 min',
        'Stale data still shows instantly while refetching',
      ],
      followUps: [
        'What triggers a refetch?',
        'How do you invalidate a query after a mutation?',
      ],
    },
    {
      id: 'optimistic-updates',
      question: 'What are optimistic updates, and how do you implement them safely?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['performance'],
      answer: `An optimistic update shows the result **before the server confirms it**, so the UI feels instant (likes, toggles, reordering). With TanStack Query:

1. In \`onMutate\`, **cancel** outgoing refetches, **snapshot** the current cache, and **write the expected result** to the cache.
2. In \`onError\`, **roll back** to the snapshot and show an error.
3. In \`onSettled\`, **invalidate** the query to sync with the server's truth.

I avoid it for actions where showing a wrong result is costly, like payments. There I show a pending state instead.`,
      variants: [
        { label: 'Short version', answer: 'Update the cache immediately, roll back `onError`, invalidate `onSettled`.' },
      ],
      analogy: `Ticking an item off your to-do list as you hand it to a colleague: if they come back saying it failed, you un-tick it.`,
      quickRevision: [
        'onMutate: cancel, snapshot, update cache',
        'onError: roll back',
        'onSettled: invalidate to resync',
        'Avoid for payments / irreversible actions',
      ],
      followUps: [
        'What is React 19\'s `useOptimistic`?',
        'How do you handle two quick optimistic updates?',
      ],
    },
  ],
});
