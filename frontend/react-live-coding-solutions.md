# React Live-Coding Solutions

Solutions for the common React live-coding tasks. In the interview, **talk while you code**: first the state you need, then the UI, then edge cases (loading, error, empty, cleanup).

---

## 1. Fetch a list + debounced search (loading / error / empty)

```tsx
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

    fetch(`https://jsonplaceholder.typicode.com/users?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
```

**Points to say:** debounce reduces API calls; AbortController prevents a race where an old response overwrites a new one; handle all 4 states; `key` uses a stable id. In a real app, TanStack Query handles caching, dedupe and races.

---

## 2. Todo app (add, toggle, delete, filter, persist)

```tsx
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
            <button onClick={() => remove(t.id)} aria-label={`Delete ${t.text}`}>✕</button>
          </li>
        ))}
      </ul>
      <p>{todos.filter((t) => !t.done).length} items left</p>
    </div>
  );
}
```

**Points to say:** immutable updates (`map` / `filter` / spread, never `push`); functional `setState` avoids stale state; derived state (`visible`, the count) is computed during render, not stored; lazy initial state.

---

## 3. Custom hooks: `useFetch`, `usePrevious`, `useLocalStorage`

```tsx
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
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
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
```

---

## 4. Infinite scroll with IntersectionObserver

```tsx
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
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`)
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
```

**Points to say:** IntersectionObserver is better than scroll listeners (no work on every scroll event); guard against double loads; for thousands of items, add virtualization; cursor pagination on the API.

---

## 5. Modal (outside click + Escape + focus)

```tsx
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
```

**Points to say:** a portal avoids `overflow` / `z-index` problems; clean up listeners; accessibility (`role="dialog"`, focus, Escape). A full focus trap is a bonus. The native `<dialog>` element is also an option.

---

## 6. Form with React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" {...register('email')} aria-invalid={!!errors.email} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="password">Password</label>
      <input id="password" type="password" {...register('password')} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <label htmlFor="confirm">Confirm password</label>
      <input id="confirm" type="password" {...register('confirm')} />
      {errors.confirm && <p role="alert">{errors.confirm.message}</p>}

      <button disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Sign up'}</button>
    </form>
  );
}
```

**Points to say:** RHF uses uncontrolled inputs, so there are fewer re-renders; one Zod schema gives both validation and the TypeScript type; disabling the button prevents double submits; the server validates again.

---

## 7. Countdown timer (like the 60-second hold in Sneaker Drop)

```tsx
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
```

**Points to say:** calculate from an **end timestamp**, not by subtracting 1 each tick, because intervals drift and are throttled in background tabs; always clear the interval; the server is the source of truth for expiry.

---

## 8. Accordion and Tabs

```tsx
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
            <button aria-expanded={isOpen} aria-controls={`panel-${item.id}`} onClick={() => toggle(item.id)}>
              {item.title}
            </button>
            {isOpen && <div id={`panel-${item.id}`} role="region">{item.content}</div>}
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
```

**Points to say:** a `Set` of open IDs supports single or multiple open panels; ARIA attributes; for a bonus, add arrow-key navigation between tabs.
