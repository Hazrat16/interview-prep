import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'React Live Coding',
  description: 'Machine-coding tasks with working solutions: search, forms, infinite scroll and more.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'frontend/react-fundamentals/react-forms-controlled-validation',
  ],
  questions: [
    {
      id: 'fetch-a-list-debounced-search-loading-error-empty',
      question: 'Fetch a list + debounced search (loading / error / empty)',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `I talk through it in order:

1. **State**: \`query\`, a **debounced query** (\`useDebounce(query, 300)\`), \`data\`, \`loading\` and \`error\`.
2. **Effect** on the debounced query: create an **\`AbortController\`**, set loading, fetch with \`encodeURIComponent\`, check \`res.ok\`, set the data, and **abort in the cleanup**. That prevents the race where an older response overwrites a newer one.
3. **UI states**: a loading indicator, an error message with \`role="alert"\`, an **empty state** ("No results for …"), then the list with stable keys.
4. **Mention**: in production I'd use TanStack Query for caching and dedupe, and keep the input responsive by keeping its state local.`,
      analogy: `A good waiter waits until you've finished ordering (debounce), cancels the first order if you change your mind (abort), and always tells you whether food is coming, failed, or the dish isn't on the menu (loading / error / empty).`,
      quickRevision: [
        'Debounce the query',
        'AbortController + cleanup prevents races',
        'Check res.ok; handle loading/error/empty',
        'Stable keys; TanStack Query in production',
      ],
      deepDive: `\`\`\`tsx
import { useEffect, useState } from 'react';

type User = { id: number; name: string; email: string };

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t); // cancel if value changes before delay
  }, [value, delay]);
  return debounced;
}

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    const controller = new AbortController(); // cancel stale requests
    setLoading(true);
    setError(null);

    fetch(\`https://jsonplaceholder.typicode.com/users?q=\${encodeURIComponent(debouncedQuery)}\`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then((data: User[]) => setUsers(data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" />
      {loading && <p>Loading…</p>}
      {error && <p role="alert">Error: {error}</p>}
      {!loading && !error && users.length === 0 && <p>No users found</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} — {u.email}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

**Points to say:** debounce reduces API calls; AbortController prevents a race where an old response overwrites a new one; handle all 4 states; \`key\` uses a stable id. In a real app, TanStack Query handles caching, dedupe and races.`,
      followUps: [
        'Why abort instead of an ignore flag?',
        'How would you cache previous searches?',
        'Add pagination to this list.',
      ],
    },
    {
      id: 'todo-app-add-toggle-delete-filter-persist',
      question: 'Todo app (add, toggle, delete, filter, persist)',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['react'],
      answer: `1. **State**: \`todos\` (with **lazy initialisation** from \`localStorage\`: \`useState(() => JSON.parse(localStorage.getItem('todos') ?? '[]'))\`) and a \`filter\` ('all' | 'active' | 'done').
2. **Persist** in an effect whenever \`todos\` changes.
3. **Immutable updates**: add with \`[...todos, { id: crypto.randomUUID(), text, done: false }]\`, toggle with \`map\`, delete with \`filter\`.
4. **Derived data**: compute the visible list and the remaining count during render. Don't store them in state.
5. **UX and a11y**: trim empty input, submit on Enter with a real \`<form>\`, \`aria-label\` on icon buttons, stable IDs as keys (not the index).`,
      analogy: `A paper to-do list with a photocopier: every change makes a fresh copy (immutable update), and you file the latest copy in a drawer (localStorage) so it's still there tomorrow.`,
      quickRevision: [
        'Lazy init from localStorage; persist in effect',
        'Immutable add/toggle/delete',
        'Derive filtered list and counts',
        'Stable IDs as keys; form + aria-labels',
      ],
      deepDive: `\`\`\`tsx
import { useEffect, useState } from 'react';

type Todo = { id: string; text: string; done: boolean };
type Filter = 'all' | 'active' | 'done';

function loadTodos(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem('todos') ?? '[]');
  } catch {
    return [];
  }
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos); // lazy initializer: runs once
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text: trimmed, done: false }]);
    setText('');
  };

  const toggle = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const visible = todos.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );

  return (
    <div>
      <form onSubmit={addTodo}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New todo" />
        <button type="submit">Add</button>
      </form>

      {(['all', 'active', 'done'] as Filter[]).map((f) => (
        <button key={f} onClick={() => setFilter(f)} disabled={filter === f}>{f}</button>
      ))}

      <ul>
        {visible.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            </label>
            <button onClick={() => remove(t.id)} aria-label={\`Delete \${t.text}\`}>✕</button>
          </li>
        ))}
      </ul>
      <p>{todos.filter((t) => !t.done).length} items left</p>
    </div>
  );
}
\`\`\`

**Points to say:** immutable updates (\`map\` / \`filter\` / spread, never \`push\`); functional \`setState\` avoids stale state; derived state (\`visible\`, the count) is computed during render, not stored; lazy initial state.`,
      followUps: [
        'Why not use the index as key here?',
        'How would you add edit-in-place?',
        'Move this to useReducer.',
      ],
    },
    {
      id: 'custom-hooks-usefetch-useprevious-uselocalstorage',
      question: 'Custom hooks: `useFetch`, `usePrevious`, `useLocalStorage`',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react', 'css-browser'],
      answer: `- **useFetch(url)**: state for \`data\`, \`error\` and \`loading\`. An effect on \`url\` with an **AbortController** and cleanup. Return \`{ data, error, loading }\`. Mention it's a teaching version, and TanStack Query is the production answer.
- **usePrevious(value)**: a **ref** updated in an effect **after** render, returning \`ref.current\`, so during render you see the value from the previous render.
- **useLocalStorage(key, initial)**: \`useState\` with a **lazy initialiser** that reads and parses storage inside **try/catch** (private mode, bad JSON), plus an effect that writes on change. Optionally sync across tabs with the \`storage\` event.`,
      analogy: `Custom hooks are kitchen gadgets: once you've built a good garlic press (useFetch), every cook can use it without reinventing it, and each gets their own garlic (own state).`,
      quickRevision: [
        'useFetch: AbortController + cleanup, return {data,error,loading}',
        'usePrevious: ref updated after render',
        'useLocalStorage: lazy init + try/catch + write effect',
        'Each caller gets its own state',
      ],
      deepDive: `\`\`\`tsx
import { useEffect, useRef, useState } from 'react';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return r.json();
      })
      .then(setData)
      .catch((e) => e.name !== 'AbortError' && setError(e))
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value; // runs after render, so during render ref holds the previous value
  }, [value]);
  return ref.current;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}
\`\`\``,
      followUps: [
        'Why does usePrevious work with an effect?',
        'Make useLocalStorage SSR-safe.',
        'Sync useLocalStorage across tabs.',
      ],
    },
    {
      id: 'infinite-scroll-with-intersectionobserver',
      question: 'Infinite scroll with IntersectionObserver',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `1. **State**: \`items\`, \`page\`, \`loading\`, \`hasMore\`.
2. Put an empty **sentinel \`div\`** after the list, with a ref.
3. An **IntersectionObserver** on the sentinel (with \`rootMargin: '200px'\` to prefetch early). When it's visible and not loading and \`hasMore\` is true, load the next page.
4. **Append** results and set \`hasMore\` false when a page comes back empty or short.
5. **Disconnect** the observer in the cleanup.

I say why it beats scroll listeners: no work on every scroll event and no layout reads. Then the edge cases: guarding against **double loads**, errors with a retry button, and **virtualising** the list if it grows very long.`,
      analogy: `A tripwire placed just before the end of the corridor: when you step on it, the next section of corridor is built before you reach the wall.`,
      quickRevision: [
        'Sentinel element + IntersectionObserver',
        'rootMargin to prefetch early',
        'Guard: !loading && hasMore',
        'Disconnect on cleanup; virtualise long lists',
      ],
      deepDive: `\`\`\`tsx
import { useCallback, useEffect, useRef, useState } from 'react';

type Post = { id: number; title: string };

export default function InfinitePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(\`https://jsonplaceholder.typicode.com/posts?_page=\${page}&_limit=10\`)
      .then((r) => r.json())
      .then((data: Post[]) => {
        if (cancelled) return;
        setPosts((prev) => [...prev, ...data]);
        setHasMore(data.length === 10);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !loading && hasMore) setPage((p) => p + 1);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onIntersect, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <div>
      {posts.map((p) => <article key={p.id}>{p.title}</article>)}
      {loading && <p>Loading…</p>}
      {!hasMore && <p>No more posts</p>}
      <div ref={sentinelRef} />
    </div>
  );
}
\`\`\`

**Points to say:** IntersectionObserver is better than scroll listeners (no work on every scroll event); guard against double loads; for thousands of items, add virtualization; cursor pagination on the API.`,
      followUps: [
        'Why is IntersectionObserver better than onScroll?',
        'Cursor vs page-based pagination here?',
        'How do you restore scroll position on back navigation?',
      ],
    },
    {
      id: 'modal-outside-click-escape-focus',
      question: 'Modal (outside click + Escape + focus)',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `1. Render with a **portal** (\`createPortal\` to \`document.body\`) to escape \`overflow\` and \`z-index\` problems.
2. **Close on Escape**: a \`keydown\` listener added in an effect and **removed in the cleanup**.
3. **Close on outside click**: listen on the overlay and check that the click target is the overlay, not the dialog content.
4. **Accessibility**: \`role="dialog"\`, \`aria-modal="true"\`, \`aria-labelledby\` pointing to the title, **move focus into the dialog** on open, ideally **trap focus**, and **return focus** to the opener on close. Lock body scroll while open.

In production I'd use the native \`<dialog>\` element or Radix Dialog, which handle focus trapping.`,
      analogy: `A pop-up room in a house: it opens above everything (portal), you can leave by the door (Escape) or by stepping outside (overlay click), and the lights guide you in and back to where you were (focus management).`,
      quickRevision: [
        'Portal to body',
        'Escape + overlay click to close (clean up listeners)',
        'role=dialog, aria-modal, aria-labelledby',
        'Focus in, trap, return to opener; lock scroll',
      ],
      deepDive: `\`\`\`tsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Props = { open: boolean; onClose: () => void; title: string; children: React.ReactNode };

export function Modal({ open, onClose, title, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // lock background scroll
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="modal"
        onMouseDown={(e) => e.stopPropagation()} // clicks inside don't close it
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}
\`\`\`

**Points to say:** a portal avoids \`overflow\` / \`z-index\` problems; clean up listeners; accessibility (\`role="dialog"\`, focus, Escape). A full focus trap is a bonus. The native \`<dialog>\` element is also an option.`,
      followUps: [
        'How do you trap focus?',
        'Native `<dialog>` vs custom modal?',
      ],
    },
    {
      id: 'countdown-timer-like-the-60-second-hold-in-sneaker-drop',
      question: 'Countdown timer (like the 60-second hold in Sneaker Drop)',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['react'],
      answer: `1. **State**: \`secondsLeft\`, initialised from the prop.
2. An **effect** starts \`setInterval\` every second, using a **functional update** (\`setSecondsLeft(s => s - 1)\`) so it never reads a stale value. When it hits 0, **clear the interval** and call \`onExpire\`.
3. **Return \`clearInterval\` in the cleanup** so unmounting doesn't leak timers.
4. **Format** as mm:ss with \`padStart\`, wrapped in \`aria-live="polite"\` for screen readers.

Edge cases worth mentioning: intervals drift and are throttled in background tabs, so for real deadlines (like a 60-second reservation) I compute the remaining time from an **absolute expiry timestamp from the server**, not by counting ticks.`,
      analogy: `Counting down on your fingers drifts if you get distracted; checking the clock against the known end time never does.`,
      quickRevision: [
        'setInterval + functional update',
        'Clear on 0 and in cleanup',
        'mm:ss with padStart; aria-live',
        'Real deadlines: compute from expiry timestamp',
      ],
      deepDive: `\`\`\`tsx
import { useEffect, useState } from 'react';

export function Countdown({ expiresAt, onExpire }: { expiresAt: number; onExpire: () => void }) {
  const calc = () => Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
  const [secondsLeft, setSecondsLeft] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => {
      const left = calc();
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(id);
        onExpire();
      }
    }, 250);
    return () => clearInterval(id); // cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  return <span aria-live="polite">{mm}:{ss}</span>;
}
\`\`\`

**Points to say:** calculate from an **end timestamp**, not by subtracting 1 each tick, because intervals drift and are throttled in background tabs; always clear the interval; the server is the source of truth for expiry.`,
      followUps: [
        'Why does setInterval drift?',
        'How would you pause and resume?',
        'Why use a server timestamp for reservations?',
      ],
    },
    {
      id: 'accordion-and-tabs',
      question: 'Accordion and Tabs',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['react'],
      answer: `**Accordion**: state is the open item ID (or a Set for multiple open items). Each header is a **\`button\`** with \`aria-expanded\` and \`aria-controls\` pointing to its panel, and the panel has \`role="region"\`.

**Tabs**: state is the active tab ID. Use \`role="tablist"\`, then \`role="tab"\` buttons with \`aria-selected\`, and a \`role="tabpanel"\`. For full accessibility, add **arrow-key navigation** between tabs and roving \`tabIndex\`.

I'd mention making them **controlled or uncontrolled**, and that a **compound component** API (\`<Tabs><Tabs.List/><Tabs.Panel/></Tabs>\`) scales better than passing big config arrays.`,
      analogy: `An accordion is a set of drawers where you open the one you need; tabs are folder dividers, where one folder is always open and the others wait behind it.`,
      quickRevision: [
        'Accordion: button + aria-expanded/aria-controls',
        'Tabs: tablist/tab/tabpanel + aria-selected',
        'Arrow-key navigation, roving tabIndex',
        'Compound component API',
      ],
      deepDive: `\`\`\`tsx
import { useState } from 'react';

type Item = { id: string; title: string; content: React.ReactNode };

export function Accordion({ items, multiple = false }: { items: Item[]; multiple?: boolean }) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div key={item.id}>
            <button aria-expanded={isOpen} aria-controls={\`panel-\${item.id}\`} onClick={() => toggle(item.id)}>
              {item.title}
            </button>
            {isOpen && <div id={\`panel-\${item.id}\`} role="region">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

export function Tabs({ tabs }: { tabs: Item[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
\`\`\`

**Points to say:** a \`Set\` of open IDs supports single or multiple open panels; ARIA attributes; for a bonus, add arrow-key navigation between tabs.`,
      followUps: [
        'Implement arrow-key navigation for tabs.',
        'How would you make the accordion allow multiple open items?',
      ],
    },
  ],
});
