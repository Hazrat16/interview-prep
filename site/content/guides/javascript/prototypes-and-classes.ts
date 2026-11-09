import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Prototypes & Classes',
  description: 'The prototype chain, how class syntax maps onto it, and inheritance trade-offs.',
  questions: [
    {
      id: 'what-is-prototypal-inheritance',
      question: 'What is prototypal inheritance, and how does the prototype chain work?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Every object has a hidden link, \`[[Prototype]]\`, to another object. When you read a property, JavaScript **looks on the object itself first**; if it isn't there, it follows the link to the prototype, then that object's prototype, and so on. That's the **prototype chain**. It ends at \`Object.prototype\`, whose prototype is \`null\`; if the property isn't found by then, you get \`undefined\`.

That's how inheritance works in JS: objects **delegate** to other objects instead of copying from a class. Methods like \`arr.map\` live once on \`Array.prototype\` and every array finds them through the chain, which saves memory.

Writes are different from reads: **assigning a property always creates it on the object itself** (shadowing the prototype's one), it never changes the prototype. You can set the link directly with \`Object.create(proto)\`, read it with \`Object.getPrototypeOf\`, and \`class\`/\`extends\` set it up for you.`,
      analogy: `Asking a family tree: if you don't know a recipe, you ask your parent, then grandparent, until someone knows it or the tree ends (\`null\`).`,
      quickRevision: [
        'Objects link to another object via `[[Prototype]]`',
        'Reads walk the chain until found or `null`',
        'Writes create an own property (shadowing), never change the prototype',
        'Methods are shared via the prototype, not copied',
        '`Object.create(proto)` sets the link directly',
      ],
      deepDive: `\`\`\`js
const animal = { speak() { return \`\${this.name} makes a sound\`; } };
const dog = Object.create(animal);
dog.name = 'Rex';

dog.speak();                              // found on animal via the chain
Object.getPrototypeOf(dog) === animal;    // true
Object.getPrototypeOf(animal) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype);  // null

dog.speak = () => 'Woof';                 // own property shadows animal.speak
animal.speak.call(dog);                   // original still there
\`\`\``,
      followUps: [
        'How do `class` and `extends` map to prototypes?',
        'What does `Object.create(null)` give you, and why use it?',
        'What does `new` do step by step?',
      ],
    },
    {
      id: 'are-classes-different-from-prototypes',
      question: 'Are ES6 classes different from prototypes, or just syntax on top of them?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `Mostly **syntax on top of prototypes**. A \`class\` creates a constructor function, its methods go on \`ClassName.prototype\`, and \`extends\` links the prototypes, exactly like the old constructor-function pattern. \`typeof MyClass\` is \`'function'\`.

But it's not *only* sugar. Classes add real behaviour:

- They **must be called with \`new\`**; calling one as a plain function throws.
- The body always runs in **strict mode**, and methods are **non-enumerable**.
- Classes are hoisted into the **TDZ**, so you can't use one before its declaration.
- They add features that were awkward before: **\`super\`** calls, **private \`#fields\`** that are truly inaccessible from outside, **static** members and static initialisation blocks.

So my answer is: same inheritance model, safer and more expressive syntax.`,
      analogy: `Classes are a nicer front door on the same house: the rooms behind it are still prototypes.`,
      quickRevision: [
        '`class` = constructor function + methods on `.prototype`',
        'Must use `new`, strict mode, non-enumerable methods, TDZ',
        'Adds `super`, private `#fields`, static members and blocks',
        'Inheritance is still the prototype chain',
      ],
      deepDive: `\`\`\`js
class Account {
  #balance = 0;                    // truly private
  static count = 0;
  constructor(owner) { this.owner = owner; Account.count++; }
  deposit(n) { this.#balance += n; return this; }
  get balance() { return this.#balance; }
}
class Savings extends Account {
  deposit(n) { return super.deposit(n * 1.01); }
}

typeof Account;                                         // 'function'
Object.getPrototypeOf(Savings.prototype) === Account.prototype; // true
new Savings('Ana').deposit(100).balance;                // 101
// new Savings('Ana').#balance → SyntaxError
\`\`\``,
      followUps: [
        'What are private class fields, and how are they different from `_name` conventions?',
        'What are the pros and cons of arrow functions as class fields?',
        'Composition vs inheritance: which do you prefer?',
      ],
    },
    {
      id: 'difference-between-proto-and-prototype',
      question: 'What is the difference between `__proto__` and `prototype`?',
      perspective: 'trade-off',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `They're easy to mix up because they're two ends of the same link:

- **\`prototype\`** is a property that exists on **functions** (and classes). It's the object that **will become the prototype** of instances created with \`new\`. Arrow functions and methods don't have one.
- **\`__proto__\`** is an accessor on **every object** that exposes its **actual prototype link**, the \`[[Prototype]]\` that property lookups follow.

The connection: **\`new Fn().__proto__ === Fn.prototype\`**. The constructor's \`prototype\` becomes the instance's \`__proto__\`.

\`__proto__\` is a legacy feature kept for compatibility. In real code I use **\`Object.getPrototypeOf(obj)\`** and **\`Object.setPrototypeOf\`**, or \`Object.create\` when creating the object. Changing an existing object's prototype is also slow in engines, so it's best avoided.`,
      analogy: `\`prototype\` is the template a factory hands to everything it builds; \`__proto__\` is the label on each built item saying which template it came from.`,
      quickRevision: [
        '`Fn.prototype`: what instances made by `new Fn()` will inherit from',
        '`obj.__proto__`: the object\'s actual prototype link',
        '`new Fn().__proto__ === Fn.prototype`',
        'Prefer `Object.getPrototypeOf` / `Object.create` over `__proto__`',
      ],
      deepDive: `\`\`\`js
function Person(name) { this.name = name; }
Person.prototype.hi = function () { return \`hi \${this.name}\`; };

const p = new Person('Ana');
Object.getPrototypeOf(p) === Person.prototype; // true
p.prototype;                                   // undefined: instances don't have it
Person.__proto__ === Function.prototype;       // true: functions are objects too

// What \`new Person('Ana')\` does:
// 1. const obj = Object.create(Person.prototype)
// 2. const result = Person.call(obj, 'Ana')
// 3. return result is an object ? result : obj
\`\`\``,
      followUps: [
        'What does `new` do step by step?',
        'Do arrow functions have a `prototype`?',
        'Implement your own `new`.',
      ],
    },
    {
      id: 'own-property-vs-inherited-property',
      question: 'What is the difference between an own property and an inherited property, and how do you check?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `An **own property** is stored directly on the object. An **inherited property** is found somewhere up the prototype chain. Both can be read the same way (\`obj.key\`), which is why the difference matters when you iterate or check for existence:

- **\`Object.hasOwn(obj, key)\`** is true only for own properties. It's the modern replacement for \`obj.hasOwnProperty(key)\`, which breaks on objects made with \`Object.create(null)\` or that override \`hasOwnProperty\`.
- The **\`in\` operator** is true for own **and** inherited properties: \`'toString' in {}\` is \`true\`.
- **\`for…in\`** loops over own *and inherited* enumerable keys, while **\`Object.keys\`, \`values\` and \`entries\`** return only own enumerable ones.

That's why I iterate with \`Object.keys\`/\`entries\` rather than \`for…in\`, and use \`Object.hasOwn\` when checking user-supplied keys, so a key like \`__proto__\` or \`constructor\` doesn't slip through.`,
      analogy: `Things in your own pocket vs things you can borrow from your parents: both are usable, but only one is yours.`,
      quickRevision: [
        'Own: on the object itself; inherited: via the prototype chain',
        '`Object.hasOwn(obj, key)`: own only (preferred)',
        '`in`: own or inherited',
        '`for…in` includes inherited enumerable keys; `Object.keys` doesn\'t',
      ],
      followUps: [
        '`in` vs `Object.hasOwn`: when would you use each?',
        'Why is `Object.hasOwn` preferred over `obj.hasOwnProperty`?',
        'What is prototype pollution?',
      ],
    },
  ],
});
