import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'this & Arrow Functions',
  description: 'The four binding rules, call/apply/bind, and why arrow functions behave differently.',
  questions: [
    {
      id: 'js-this-binding',
      question: 'How is `this` determined in JavaScript, and why does it get lost in callbacks?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `For normal functions, \`this\` depends on **how the function is called**, not where it is defined. The rules, by priority:

1. \`new Fn()\`: \`this\` is the new object.
2. \`fn.call(obj)\` / \`apply\` / \`bind\`: \`this\` is \`obj\`.
3. \`obj.fn()\`: \`this\` is \`obj\` (whatever is left of the dot).
4. Plain \`fn()\`: \`undefined\` in strict mode or modules, otherwise the global object.

**Arrow functions have no own \`this\`.** They use the \`this\` of the scope around them.

It gets lost in callbacks because \`setTimeout(obj.method)\` or \`onClick={this.handle}\` passes only the function. When it's called later there is no \`obj.\` on the left, so rule 4 applies. Fixes: \`.bind(obj)\`, wrap it in an arrow (\`() => obj.method()\`), or define the method as an arrow class field.`,
      analogy: `\`this\` is like the word "me" in a phone call. It means whoever is holding the phone **when the call happens**. Pass the phone (the function) to someone else and "me" now means them. An arrow function is a recorded voicemail: "me" stays the person who recorded it.`,
      quickRevision: [
        'Priority: `new` > explicit (`call/apply/bind`) > implicit (`obj.fn()`) > default',
        'Arrow functions take `this` from the enclosing scope and cannot be rebound',
        'Passing `obj.method` as a callback loses `obj`',
        'Fix with `bind`, a wrapper arrow, or an arrow class field',
        'Don\'t use arrows as object methods that need `this`',
      ],
      deepDive: `\`\`\`js
'use strict';
const user = {
  name: 'Ana',
  greet() { return \`hi \${this?.name}\`; },
};

user.greet();                 // 'hi Ana'   (implicit)
const fn = user.greet;
fn();                         // 'hi undefined' (default: this is undefined)
fn.call({ name: 'Bo' });      // 'hi Bo'    (explicit)
const bound = fn.bind(user);
bound.call({ name: 'Cy' });   // 'hi Ana'   (bind wins over call)
setTimeout(user.greet, 0);    // loses user
setTimeout(() => user.greet(), 0); // keeps user
\`\`\``,
      followUps: [
        'What does `bind` return, and can you re-bind a bound function?',
        'What is `this` inside a `setTimeout` callback?',
        'Implement `Function.prototype.bind` yourself.',
      ],
    },
    {
      id: 'difference-between-arrow-and-regular-functions',
      question: 'What are the differences between arrow functions and regular functions?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `Beyond the shorter syntax, the differences that matter:

- **\`this\`**: an arrow function has **no own \`this\`**; it uses the \`this\` of the surrounding scope, and \`call\`, \`apply\` and \`bind\` can't change it. A regular function's \`this\` depends on how it's called.
- **\`arguments\`**: arrows don't have their own \`arguments\` object. Use rest parameters (\`...args\`) instead.
- **Constructors**: arrows have **no \`prototype\`** and **can't be called with \`new\`**.
- **Implicit return**: \`x => x * 2\` returns without \`return\`. To return an object literal, wrap it: \`() => ({ id: 1 })\`.
- Arrows can't be generators and have no \`super\` or \`new.target\` of their own.

So I use arrows for **callbacks** (\`map\`, promises, event handlers inside methods) where inheriting \`this\` is exactly what I want, and regular functions or method shorthand for **object methods, constructors and prototype methods** that need their own \`this\`.`,
      analogy: `An arrow function is a recorded voicemail: "me" always means the person who recorded it. A regular function is a live call: "me" is whoever picks up.`,
      quickRevision: [
        'Arrow: lexical `this`, can\'t be rebound',
        'Arrow: no `arguments`, no `prototype`, can\'t be `new`-ed',
        'Implicit return; wrap object literals in `()`',
        'Arrows for callbacks; method shorthand for methods that need `this`',
      ],
      deepDive: `\`\`\`js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => this.seconds++, 1000);          // arrow keeps timer's this
    // setInterval(function () { this.seconds++ }, 1000); // this would be undefined/global
  },
};

const Foo = () => {};
new Foo();            // TypeError: Foo is not a constructor

const makeUser = () => ({ id: 1 }); // parentheses for an object literal
\`\`\``,
      followUps: [
        'Can you rebind an arrow function with `call`?',
        'Why did React class components use arrow class fields?',
        'Can arrow functions be used as object methods?',
      ],
    },
    {
      id: 'can-arrow-functions-be-used-as-object-methods',
      question: 'Should you use an arrow function as an object method? What goes wrong?',
      perspective: 'debugging',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `You *can*, but usually shouldn't if the method needs \`this\`. An arrow takes \`this\` from the scope where the **object literal is written**, not from the object. At the top of a module that's \`undefined\` (or \`window\` in an old script), so \`this.name\` inside the method isn't the object's name.

An object literal doesn't create a scope for \`this\`, which is the part people miss. The fix is method shorthand, \`greet() { … }\`, which gets the object as \`this\` when called as \`obj.greet()\`.

Arrows **inside** a method are great, though: a \`map\` callback or \`setTimeout\` inside \`greet()\` keeps the method's \`this\`. And in classes, an arrow **class field** (\`handle = () => {}\`) is fine: it captures the instance, which is why React class components used them for event handlers.`,
      analogy: `You can, but it's like wearing someone else's name badge: the arrow's \`this\` belongs to the surrounding scope, not the object.`,
      quickRevision: [
        'Arrow method → `this` is the outer scope, not the object',
        'Object literals don\'t create a `this` scope',
        'Use method shorthand `method() {}`',
        'Arrows inside methods are fine; arrow class fields bind to the instance',
      ],
      deepDive: `\`\`\`js
const user = {
  name: 'Ana',
  arrow: () => this?.name,          // undefined: outer this
  method() { return this.name; },   // 'Ana'
  later() {
    setTimeout(() => console.log(this.name), 0); // 'Ana': arrow inside a method
  },
};
\`\`\``,
      followUps: [
        'What does `obj.arrow()` return if it uses `this.name`?',
        'When is an arrow inside a method useful?',
        'Why do arrow class fields work for event handlers?',
      ],
    },
    {
      id: 'call-apply-bind',
      question: 'What is the difference between `call`, `apply` and `bind`?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `All three let you **set \`this\` explicitly** for a regular function. The difference is **when the function runs** and **how arguments are passed**:

- **\`call(thisArg, a, b)\`** runs the function **immediately**, arguments listed one by one.
- **\`apply(thisArg, [a, b])\`** runs it **immediately**, arguments as an **array**. It used to be the way to spread an array into a call; today \`fn(...args)\` does that.
- **\`bind(thisArg, a)\`** **doesn't run it**. It returns a **new function** with \`this\` permanently set, and optionally some arguments pre-filled (partial application).

A bound function **can't be re-bound**: calling \`bind\` or \`call\` on it again doesn't change \`this\`. The only thing that overrides it is \`new\`. None of the three affect arrow functions, which ignore the \`this\` you pass.`,
      analogy: `\`call\` and \`apply\` are phoning someone now and saying who you are (one reads your details aloud, one hands over a list); \`bind\` is saving a contact with your name on it to call later.`,
      quickRevision: [
        '`call`: run now, args listed',
        '`apply`: run now, args as an array',
        '`bind`: return a new function with fixed `this` (+ preset args)',
        'Bound functions can\'t be re-bound; only `new` overrides',
        'No effect on arrow functions',
      ],
      deepDive: `\`\`\`js
function intro(greeting, punct) {
  return \`\${greeting}, I'm \${this.name}\${punct}\`;
}
const ana = { name: 'Ana' };

intro.call(ana, 'Hi', '!');       // "Hi, I'm Ana!"
intro.apply(ana, ['Hey', '.']);   // "Hey, I'm Ana."
const hiAna = intro.bind(ana, 'Hi');
hiAna('?');                       // "Hi, I'm Ana?"
hiAna.call({ name: 'Bo' }, '?');  // still Ana
\`\`\``,
      followUps: [
        'Implement `bind` yourself.',
        'What is partial application?',
        'Why does `new` override a bound `this`?',
      ],
    },
  ],
});
