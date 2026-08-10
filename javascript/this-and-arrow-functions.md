# `this` & Arrow Functions

## Concept

`this` is determined by **how a function is called**, not where it was written (for normal functions).

### Common `this` rules (non-arrow)

| Call style | `this` |
|------------|--------|
| `obj.method()` | `obj` |
| `fn()` (alone, non-strict) | `global` / `window` |
| `fn()` (alone, strict) | `undefined` |
| `new Fn()` | new instance |
| `fn.call/apply/bind` | explicit value |

```js
const user = {
  name: "Ali",
  greet() {
    console.log(this.name);
  },
};

user.greet(); // "Ali"
const g = user.greet;
g(); // undefined / global (lost context)
```

Fix with:

```js
const g = user.greet.bind(user);
```

---

## Arrow functions

Arrow functions do **not** have their own `this`. They inherit `this` from the enclosing lexical scope.

```js
const user = {
  name: "Ali",
  hobbies: ["chess"],
  show() {
    this.hobbies.forEach((h) => {
      console.log(this.name, h); // this = user
    });
  },
};
```

Also:

- No own `arguments` object
- Can’t be used as constructors (`new` fails)
- No `prototype` property

---

## Arrow vs regular — when to use

| Prefer regular | Prefer arrow |
|----------------|--------------|
| Object methods needing dynamic `this` | Callbacks that should keep outer `this` |
| Prototype methods | Short inline functions |
| Constructors | Functional array methods |

---

## Interview Q&A

### Q1: How is `this` determined?

**Answer:**

> For regular functions, `this` depends on the call site — whether it was called as a method, a plain function, with `new`, or with `call`/`apply`/`bind`. Arrow functions don’t bind their own `this`; they use the surrounding lexical `this`.

---

### Q2: Difference between arrow and regular functions?

**Answer:**

> Arrow functions are shorter, have lexical `this`, no own `arguments`, and cannot be used with `new`. Regular functions have dynamic `this`, their own `arguments`, and can be constructors.

---

### Q3: Why does `this` get lost when you pass a method as a callback?

**Answer:**

> Because the method is detached from its object. Calling `const fn = obj.method; fn()` is a plain function call, so `this` is no longer `obj`. Fix with `bind`, an arrow wrapper, or calling it as `obj.method()`.

---

### Q4: Can arrow functions be used as object methods?

**Answer:**

> Usually avoid defining object methods as arrows if you need `this` to refer to the object. An arrow method would capture the outer `this` (often `window`/undefined), not the object.

---

## Key takeaways

- Regular `this` = call site
- Arrow `this` = lexical / outer scope
- Losing method context is a top interview gotcha
