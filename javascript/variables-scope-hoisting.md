# Variables, Scope & Hoisting

## Concept

JavaScript has three ways to declare variables: `var`, `let`, and `const`.

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block `{}` | Block `{}` |
| Hoisted | Yes (initialized as `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Reassign | Yes | Yes | No |
| Redeclare in same scope | Yes | No | No |

`const` means the **binding** can’t be reassigned. Object/array contents can still change.

```js
const user = { name: "Ali" };
user.name = "Sara"; // OK
user = {};         // Error
```

---

## Scope

- **Global scope** — accessible everywhere
- **Function scope** — `var` and function declarations
- **Block scope** — `let` / `const` inside `{}` (if, for, while, etc.)

```js
function test() {
  if (true) {
    var a = 1;
    let b = 2;
    const c = 3;
  }
  console.log(a); // 1
  console.log(b); // ReferenceError
}
```

---

## Hoisting

Hoisting means declarations are processed before code runs.

### `var`

```js
console.log(x); // undefined
var x = 5;
```

Behaves like:

```js
var x;
console.log(x);
x = 5;
```

### `let` / `const` — Temporal Dead Zone (TDZ)

```js
console.log(y); // ReferenceError
let y = 10;
```

They are hoisted, but cannot be accessed before the declaration line.

### Function declarations

Fully hoisted (can call before definition):

```js
sayHi(); // works
function sayHi() {
  console.log("hi");
}
```

Function expressions / arrow functions assigned to `let`/`const` are not callable before initialization.

---

## Interview Q&A

### Q1: Difference between var, let, and const?

**Answer:**

> `var` is function-scoped and can be redeclared. `let` and `const` are block-scoped. `let` allows reassignment; `const` does not. `var` is hoisted and initialized as undefined, while `let` and `const` are hoisted but stay in the temporal dead zone until their declaration is evaluated.

---

### Q2: What is hoisting?

**Answer:**

> Hoisting is JavaScript’s behavior of processing declarations before execution. Variable and function declarations are available in their scope before the line where they appear, but initialization rules differ — especially for `let` and `const` due to the TDZ.

---

### Q3: What is the Temporal Dead Zone?

**Answer:**

> The TDZ is the period from the start of a block until a `let` or `const` declaration is initialized. Accessing the variable in that period throws a ReferenceError.

---

### Q4: Can you mutate a const object?

**Answer:**

> Yes. `const` prevents reassigning the variable binding, not mutating the object’s properties. To make an object immutable, you’d need something like `Object.freeze`.

---

## Key takeaways

- Prefer `const` by default, `let` when reassignment is needed, avoid `var`
- Block scope matters inside loops and conditionals
- TDZ explains many “why did this throw?” interview snippets
