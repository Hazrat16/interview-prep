# Arrays, Objects & ES6 Essentials

## Concept

Modern JS interviews almost always test array methods, object handling, and ES6 syntax.

---

## map / filter / reduce

```js
const nums = [1, 2, 3, 4];

nums.map((n) => n * 2);        // [2, 4, 6, 8]
nums.filter((n) => n % 2 === 0); // [2, 4]
nums.reduce((sum, n) => sum + n, 0); // 10
```

| Method | Purpose | Returns |
|--------|---------|---------|
| `map` | Transform each item | New array (same length) |
| `filter` | Keep items matching condition | New array (maybe shorter) |
| `reduce` | Accumulate to one value | Any type |

These are **higher-order functions** (take functions as arguments). Prefer them for clarity; they don’t mutate the original array.

---

## Destructuring

```js
const user = { name: "Ali", age: 25 };
const { name, age } = user;

const arr = [10, 20, 30];
const [first, second] = arr;
```

---

## Spread vs rest

```js
// spread — expand
const a = [1, 2];
const b = [...a, 3];

const defaults = { theme: "dark" };
const settings = { ...defaults, theme: "light" };

// rest — collect
function sum(...nums) {
  return nums.reduce((s, n) => s + n, 0);
}

const { theme, ...rest } = settings;
```

---

## Optional chaining & nullish coalescing

```js
user?.address?.city;

const port = process.env.PORT ?? 3000;
// ?? only falls back for null/undefined
// || also falls back for 0, "", false
```

---

## Modules

```js
// named
export const add = (a, b) => a + b;
import { add } from "./math.js";

// default
export default function App() {}
import App from "./App.js";
```

---

## Useful interview snippets

### Remove duplicates

```js
[...new Set(arr)];
```

### Flatten one level / deep

```js
arr.flat();
arr.flat(Infinity);
```

### Frequency map with reduce

```js
arr.reduce((acc, item) => {
  acc[item] = (acc[item] || 0) + 1;
  return acc;
}, {});
```

---

## Interview Q&A

### Q1: Difference between map and forEach?

**Answer:**

> `map` returns a new transformed array. `forEach` runs a side-effect callback and returns `undefined`. Use `map` when you need the output array.

---

### Q2: What is a higher-order function?

**Answer:**

> A function that takes another function as an argument, returns a function, or both. Examples: `map`, `filter`, `reduce`, and custom wrappers like debounce.

---

### Q3: Spread vs rest?

**Answer:**

> Spread expands an iterable/object into individual elements or properties. Rest collects multiple elements/properties into one array or object. Same `...` syntax, opposite roles.

---

### Q4: `??` vs `||`?

**Answer:**

> `||` treats any falsy value as missing (`0`, `""`, `false`). `??` only treats `null` and `undefined` as missing, so it’s safer for defaulting values like `0`.

---

### Q5: Pure function?

**Answer:**

> A pure function always returns the same output for the same inputs and has no side effects — it doesn’t mutate external state or depend on hidden mutable data.

---

## Key takeaways

- map transform, filter select, reduce accumulate
- Prefer immutable array methods in interviews unless mutation is required
- `??` for nullish defaults; `||` for any falsy
