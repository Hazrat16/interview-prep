# Types & Coercion

## Concept

JavaScript has:

**Primitives:** `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`

**Reference types:** objects (including arrays, functions, dates, etc.)

Primitives are copied by **value**. Objects are copied by **reference** (the reference is copied).

```js
let a = 10;
let b = a;
b = 20; // a still 10

let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 2; // obj1.x is also 2
```

---

## `typeof` quirks

```js
typeof null;        // "object"  (historic bug)
typeof [];          // "object"
typeof function(){}; // "function"
typeof undefined;   // "undefined"
```

Check arrays with `Array.isArray(arr)`.

---

## `==` vs `===`

- `===` → strict equality (no type conversion)
- `==` → loose equality (allows coercion)

```js
0 == false;   // true
0 === false;  // false
"" == false;  // true
null == undefined;  // true
null === undefined; // false
```

Interview default: prefer `===`.

---

## Truthy / falsy

Falsy values:

```text
false, 0, -0, 0n, "", null, undefined, NaN
```

Everything else is truthy (including `[]`, `{}`, `"0"`).

---

## Shallow vs deep copy

**Shallow copy** copies top level only; nested objects still share references.

```js
const copy = { ...original };
const copy2 = Object.assign({}, original);
const arrCopy = [...arr];
```

**Deep copy** clones nested structures too.

```js
const deep = structuredClone(original);
// or JSON.parse(JSON.stringify(original)) // loses functions, dates, undefined, etc.
```

---

## Interview Q&A

### Q1: Primitive vs reference types?

**Answer:**

> Primitives store the actual value and are copied by value. Objects store a reference to memory; assigning an object copies the reference, so changes through one variable can affect the other.

---

### Q2: Difference between `==` and `===`?

**Answer:**

> `===` compares value and type with no coercion. `==` may convert types before comparing. In production code we usually use `===` to avoid unexpected coercion bugs.

---

### Q3: Why is `typeof null` `"object"`?

**Answer:**

> It’s a long-standing JavaScript quirk from early implementations. `null` is a primitive, but `typeof null` incorrectly returns `"object"`.

---

### Q4: Shallow copy vs deep copy?

**Answer:**

> A shallow copy duplicates only the top level. Nested objects still point to the same memory. A deep copy recursively clones nested data so the original and copy are fully independent.

---

### Q5: Pass by value vs pass by reference in JS?

**Answer:**

> JavaScript always passes arguments by value. For objects, that value is a reference. So the function receives a copy of the reference and can mutate the same object, but reassigning the parameter doesn’t rebind the caller’s variable.

---

## Key takeaways

- Prefer `===`
- Remember falsy list
- `typeof null === "object"` is a classic trap
- Spread = shallow; nested needs deep clone
