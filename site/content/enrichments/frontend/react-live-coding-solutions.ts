import { defineEnrichments } from '../../../lib/content/enrich-schema';

/** Live coding: `answer` = what to SAY while coding (state → UI → edge cases). */
export default defineEnrichments('frontend/react-live-coding-solutions.md', {
  'fetch-a-list--debounced-search-loading--error--empty': {
    difficulty: 'medium',
    frequency: 'very-high',
    answer: `I talk through it in order:

1. **State**: \`query\`, a **debounced query** (\`useDebounce(query, 300)\`), \`data\`, \`loading\` and \`error\`.
2. **Effect** on the debounced query: create an **\`AbortController\`**, set loading, fetch with \`encodeURIComponent\`, check \`res.ok\`, set the data, and **abort in the cleanup**. That prevents the race where an older response overwrites a newer one.
3. **UI states**: a loading indicator, an error message with \`role="alert"\`, an **empty state** ("No results for …"), then the list with stable keys.
4. **Mention**: in production I'd use TanStack Query for caching and dedupe, and keep the input responsive by keeping its state local.`,
    analogy: 'A good waiter waits until you\'ve finished ordering (debounce), cancels the first order if you change your mind (abort), and always tells you whether food is coming, failed, or the dish isn\'t on the menu (loading / error / empty).',
    quickRevision: ['Debounce the query', 'AbortController + cleanup prevents races', 'Check res.ok; handle loading/error/empty', 'Stable keys; TanStack Query in production'],
    followUps: ['Why abort instead of an ignore flag?', 'How would you cache previous searches?', 'Add pagination to this list.'],
  },
  'todo-app-add-toggle-delete-filter-persist': {
    difficulty: 'easy',
    frequency: 'very-high',
    answer: `1. **State**: \`todos\` (with **lazy initialisation** from \`localStorage\`: \`useState(() => JSON.parse(localStorage.getItem('todos') ?? '[]'))\`) and a \`filter\` ('all' | 'active' | 'done').
2. **Persist** in an effect whenever \`todos\` changes.
3. **Immutable updates**: add with \`[...todos, { id: crypto.randomUUID(), text, done: false }]\`, toggle with \`map\`, delete with \`filter\`.
4. **Derived data**: compute the visible list and the remaining count during render. Don't store them in state.
5. **UX and a11y**: trim empty input, submit on Enter with a real \`<form>\`, \`aria-label\` on icon buttons, stable IDs as keys (not the index).`,
    analogy: 'A paper to-do list with a photocopier: every change makes a fresh copy (immutable update), and you file the latest copy in a drawer (localStorage) so it\'s still there tomorrow.',
    quickRevision: ['Lazy init from localStorage; persist in effect', 'Immutable add/toggle/delete', 'Derive filtered list and counts', 'Stable IDs as keys; form + aria-labels'],
    followUps: ['Why not use the index as key here?', 'How would you add edit-in-place?', 'Move this to useReducer.'],
  },
  'custom-hooks-usefetch-useprevious-uselocalstorage': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `- **useFetch(url)**: state for \`data\`, \`error\` and \`loading\`. An effect on \`url\` with an **AbortController** and cleanup. Return \`{ data, error, loading }\`. Mention it's a teaching version, and TanStack Query is the production answer.
- **usePrevious(value)**: a **ref** updated in an effect **after** render, returning \`ref.current\`, so during render you see the value from the previous render.
- **useLocalStorage(key, initial)**: \`useState\` with a **lazy initialiser** that reads and parses storage inside **try/catch** (private mode, bad JSON), plus an effect that writes on change. Optionally sync across tabs with the \`storage\` event.`,
    analogy: 'Custom hooks are kitchen gadgets: once you\'ve built a good garlic press (useFetch), every cook can use it without reinventing it, and each gets their own garlic (own state).',
    quickRevision: ['useFetch: AbortController + cleanup, return {data,error,loading}', 'usePrevious: ref updated after render', 'useLocalStorage: lazy init + try/catch + write effect', 'Each caller gets its own state'],
    followUps: ['Why does usePrevious work with an effect?', 'Make useLocalStorage SSR-safe.', 'Sync useLocalStorage across tabs.'],
  },
  'infinite-scroll-with-intersectionobserver': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `1. **State**: \`items\`, \`page\`, \`loading\`, \`hasMore\`.
2. Put an empty **sentinel \`div\`** after the list, with a ref.
3. An **IntersectionObserver** on the sentinel (with \`rootMargin: '200px'\` to prefetch early). When it's visible and not loading and \`hasMore\` is true, load the next page.
4. **Append** results and set \`hasMore\` false when a page comes back empty or short.
5. **Disconnect** the observer in the cleanup.

I say why it beats scroll listeners: no work on every scroll event and no layout reads. Then the edge cases: guarding against **double loads**, errors with a retry button, and **virtualising** the list if it grows very long.`,
    analogy: 'A tripwire placed just before the end of the corridor: when you step on it, the next section of corridor is built before you reach the wall.',
    quickRevision: ['Sentinel element + IntersectionObserver', 'rootMargin to prefetch early', 'Guard: !loading && hasMore', 'Disconnect on cleanup; virtualise long lists'],
    followUps: ['Why is IntersectionObserver better than onScroll?', 'Cursor vs page-based pagination here?', 'How do you restore scroll position on back navigation?'],
  },
  'modal-outside-click--escape--focus': {
    difficulty: 'medium',
    frequency: 'high',
    answer: `1. Render with a **portal** (\`createPortal\` to \`document.body\`) to escape \`overflow\` and \`z-index\` problems.
2. **Close on Escape**: a \`keydown\` listener added in an effect and **removed in the cleanup**.
3. **Close on outside click**: listen on the overlay and check that the click target is the overlay, not the dialog content.
4. **Accessibility**: \`role="dialog"\`, \`aria-modal="true"\`, \`aria-labelledby\` pointing to the title, **move focus into the dialog** on open, ideally **trap focus**, and **return focus** to the opener on close. Lock body scroll while open.

In production I'd use the native \`<dialog>\` element or Radix Dialog, which handle focus trapping.`,
    analogy: 'A pop-up room in a house: it opens above everything (portal), you can leave by the door (Escape) or by stepping outside (overlay click), and the lights guide you in and back to where you were (focus management).',
    quickRevision: ['Portal to body', 'Escape + overlay click to close (clean up listeners)', 'role=dialog, aria-modal, aria-labelledby', 'Focus in, trap, return to opener; lock scroll'],
    followUps: ['How do you trap focus?', 'Native `<dialog>` vs custom modal?'],
  },
  'form-with-react-hook-form--zod': {
    sameAs: 'faq/react-forms-controlled-validation',
  },
  'countdown-timer-like-the-60-second-hold-in-sneaker-drop': {
    difficulty: 'easy',
    frequency: 'medium',
    answer: `1. **State**: \`secondsLeft\`, initialised from the prop.
2. An **effect** starts \`setInterval\` every second, using a **functional update** (\`setSecondsLeft(s => s - 1)\`) so it never reads a stale value. When it hits 0, **clear the interval** and call \`onExpire\`.
3. **Return \`clearInterval\` in the cleanup** so unmounting doesn't leak timers.
4. **Format** as mm:ss with \`padStart\`, wrapped in \`aria-live="polite"\` for screen readers.

Edge cases worth mentioning: intervals drift and are throttled in background tabs, so for real deadlines (like a 60-second reservation) I compute the remaining time from an **absolute expiry timestamp from the server**, not by counting ticks.`,
    analogy: 'Counting down on your fingers drifts if you get distracted; checking the clock against the known end time never does.',
    quickRevision: ['setInterval + functional update', 'Clear on 0 and in cleanup', 'mm:ss with padStart; aria-live', 'Real deadlines: compute from expiry timestamp'],
    followUps: ['Why does setInterval drift?', 'How would you pause and resume?', 'Why use a server timestamp for reservations?'],
  },
  'accordion-and-tabs': {
    difficulty: 'easy',
    frequency: 'high',
    answer: `**Accordion**: state is the open item ID (or a Set for multiple open items). Each header is a **\`button\`** with \`aria-expanded\` and \`aria-controls\` pointing to its panel, and the panel has \`role="region"\`.

**Tabs**: state is the active tab ID. Use \`role="tablist"\`, then \`role="tab"\` buttons with \`aria-selected\`, and a \`role="tabpanel"\`. For full accessibility, add **arrow-key navigation** between tabs and roving \`tabIndex\`.

I'd mention making them **controlled or uncontrolled**, and that a **compound component** API (\`<Tabs><Tabs.List/><Tabs.Panel/></Tabs>\`) scales better than passing big config arrays.`,
    analogy: 'An accordion is a set of drawers where you open the one you need; tabs are folder dividers, where one folder is always open and the others wait behind it.',
    quickRevision: ['Accordion: button + aria-expanded/aria-controls', 'Tabs: tablist/tab/tabpanel + aria-selected', 'Arrow-key navigation, roving tabIndex', 'Compound component API'],
    followUps: ['Implement arrow-key navigation for tabs.', 'How would you make the accordion allow multiple open items?'],
  },
});
