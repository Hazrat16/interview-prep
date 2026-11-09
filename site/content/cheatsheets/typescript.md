---
title: TypeScript
description: Types vs interfaces, generics, narrowing and the utility types.
icon: code
order: 7
---

## Basics

```ts
let id: number | string;              // union
type Point = { x: number; y: number };
interface User { id: string; name?: string; readonly createdAt: Date }
type Status = 'idle' | 'loading' | 'error';   // literal union instead of enum
function greet(name: string, greeting = 'Hi'): string { return `${greeting} ${name}`; }
```

## type vs interface

| | `interface` | `type` |
|---|---|---|
| Object shapes | Yes | Yes |
| Unions, tuples, primitives, mapped types | No | Yes |
| Extending | `extends`, declaration merging | `&` intersection |
| Typical use | Public object/class contracts | Everything else |

## any vs unknown vs never

- `any` turns type checking off. Avoid it.
- `unknown` accepts anything, but you must **narrow** before using it. Use it for external data.
- `never` is a value that can't exist: exhaustive checks, functions that always throw.

## Narrowing

```ts
if (typeof x === 'string') {}            // typeof
if (Array.isArray(x)) {}                 // built-in guards
if ('email' in user) {}                  // in
if (err instanceof HttpError) {}         // instanceof
function isUser(v: unknown): v is User { return typeof v === 'object' && v !== null && 'id' in v; }

type Shape = { kind: 'circle'; r: number } | { kind: 'square'; size: number };
function area(s: Shape) {
  switch (s.kind) {                      // discriminated union
    case 'circle': return Math.PI * s.r ** 2;
    case 'square': return s.size ** 2;
    default: const _never: never = s; return _never;   // exhaustive
  }
}
```

## Generics

```ts
function first<T>(items: T[]): T | undefined { return items[0]; }
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
type ApiResponse<T> = { data: T; error?: string };
```

## Utility types

| Type | Result |
|---|---|
| `Partial<T>` / `Required<T>` | All props optional / required |
| `Readonly<T>` | All props readonly |
| `Pick<T, 'a' \| 'b'>` / `Omit<T, 'a'>` | Keep / drop props |
| `Record<K, V>` | Object with keys `K` and values `V` |
| `ReturnType<typeof fn>` / `Parameters<typeof fn>` | Infer from a function |
| `Awaited<T>` | Unwrap a promise |
| `NonNullable<T>` | Remove `null` / `undefined` |
| `Exclude<U, X>` / `Extract<U, X>` | Filter a union |

## React + TS

```tsx
type ButtonProps = React.ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };
const [user, setUser] = useState<User | null>(null);
const inputRef = useRef<HTMLInputElement>(null);
function onChange(e: React.ChangeEvent<HTMLInputElement>) {}
```

## Handy operators

`as const` (literal, readonly) · `satisfies` (check a type without widening) · `keyof` · `typeof` · `T[number]` (element type of an array).
