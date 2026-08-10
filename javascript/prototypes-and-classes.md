# Prototypes & Classes

## Concept

JavaScript uses **prototypal inheritance**.

Every object has an internal link to a prototype object. Property lookup walks the **prototype chain** until it finds the property or reaches `null`.

```js
const animal = {
  eat() {
    return "eating";
  },
};

const dog = Object.create(animal);
dog.bark = () => "woof";

dog.bark(); // own property
dog.eat();  // inherited from animal
```

`Object.getPrototypeOf(dog) === animal`

---

## Constructor functions & `.prototype`

```js
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hi, ${this.name}`;
};

const p = new Person("Ali");
p.greet();
```

`new`:

1. creates a new object
2. sets prototype link to `Constructor.prototype`
3. binds `this` to the new object
4. returns the object (unless constructor returns another object)

---

## ES6 classes

Classes are mostly **syntax sugar** over prototypes.

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hi, ${this.name}`;
  }
}

class Employee extends Person {
  constructor(name, role) {
    super(name);
    this.role = role;
  }
}
```

Methods on the class go on `.prototype`, not as own properties of each instance (unless defined as class fields/arrow properties).

---

## Interview Q&A

### Q1: What is prototypal inheritance?

**Answer:**

> Objects inherit properties and methods by linking to a prototype. When you access a property, JavaScript looks on the object first, then walks up the prototype chain until it finds it or ends at null.

---

### Q2: Are classes different from prototypes?

**Answer:**

> Classes provide cleaner syntax for creating constructor functions and prototype methods. Under the hood, inheritance still uses the prototype chain. So classes don’t replace prototypes — they sit on top of them.

---

### Q3: Difference between `__proto__` and `prototype`?

**Answer:**

> `prototype` is a property on functions used when they are called with `new`. `__proto__` (or better, `Object.getPrototypeOf`) is the actual prototype link on an instance. Instances don’t have a `.prototype` property the way constructor functions do.

---

### Q4: Own property vs inherited property?

**Answer:**

> An own property exists directly on the object (`hasOwnProperty` / `Object.hasOwn`). An inherited property comes from somewhere on the prototype chain.

---

## Key takeaways

- Inheritance in JS = prototype chain
- `class` ≈ nicer prototype syntax
- Prefer `Object.getPrototypeOf` over `__proto__` in explanations
