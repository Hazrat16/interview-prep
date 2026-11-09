---
title: JavaScript ES6+
description: Modern syntax, array methods, async patterns and the tricky parts.
icon: code
order: 6
---

## Variables

| | Scope | Re-assign | Hoisted |
|---|---|---|---|
| `var` | Function | Yes | Yes, as `undefined` |
| `let` | Block | Yes | Yes, but in the TDZ until declared |
| `const` | Block | No (contents can still mutate) | Same as `let` |

## Destructuring, spread, rest

```js
const { name, age = 18, address: { city } = {} } = user;
const [first, , third, ...others] = list;
const merged = { ...defaults, ...options };   // shallow copy, later wins
const copy = [...arr];
function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }
```

## Array methods

| Method | Returns | Mutates? |
|---|---|---|
| `map`, `filter`, `slice`, `concat`, `flat`, `flatMap` | New array | No |
| `toSorted`, `toReversed`, `toSpliced`, `with` | New array (ES2023) | No |
| `reduce` | Any value | No |
| `find` / `findIndex` / `findLast` | Element / index | No |
| `some` / `every` / `includes` | Boolean | No |
| `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse` | Varies | **Yes** |
| `forEach` | `undefined` | No (can't `break`) |

## Objects

```js
Object.keys(o); Object.values(o); Object.entries(o);
Object.fromEntries(entries);
structuredClone(o);          // deep copy (no functions)
o?.deeply?.nested ?? 'default';
```

`??` only falls back on `null` / `undefined`; `||` also on `0`, `''`, `false`.

## Functions & `this`

| Call | `this` is |
|---|---|
| `obj.method()` | `obj` |
| `fn()` | `undefined` (strict) / `globalThis` |
| `fn.call(x)` / `apply` / `bind` | `x` |
| `new Fn()` | The new object |
| Arrow function | `this` of the surrounding scope (can't be changed) |

## Async

```js
const [user, posts] = await Promise.all([getUser(), getPosts()]); // parallel, fails fast
const results = await Promise.allSettled(tasks);                  // never rejects
const fastest = await Promise.race([fetchData(), timeout(5000)]);
const firstOk = await Promise.any(mirrors);                       // first fulfilled
```

Event-loop order: sync code → **all** microtasks (promises, `queueMicrotask`) → one macrotask (`setTimeout`, I/O) → repeat.

## Equality & coercion

- Use `===`. `==` coerces: `0 == ''` is `true`, `null == undefined` is `true`.
- Falsy: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy (including `[]` and `{}`).
- `NaN !== NaN`; use `Number.isNaN` or `Object.is`.
- `typeof null === 'object'`, `typeof [] === 'object'` → use `Array.isArray`.

## Modules

```js
export const a = 1;           import { a } from './m.js';
export default fn;            import fn from './m.js';
const mod = await import('./heavy.js');   // dynamic, code splitting
```
