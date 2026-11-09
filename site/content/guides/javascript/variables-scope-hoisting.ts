import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Variables, Scope & Hoisting',
  description: 'var vs let vs const, the temporal dead zone, scope chains and what hoisting really moves.',
  questions: [
    {
      id: 'difference-between-var-let-and-const',
      question: 'What is the difference between `var`, `let` and `const`?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `They differ in **scope**, **hoisting** and **reassignment**.

- **\`var\`** is **function-scoped**. It's hoisted and initialised to \`undefined\`, so you can read it before its line without an error. You can also redeclare it in the same scope.
- **\`let\`** is **block-scoped** (anything inside \`{}\`: \`if\`, \`for\`, a plain block). It's hoisted too, but stays in the **temporal dead zone** until its declaration runs, so early access throws a \`ReferenceError\`. You can reassign it but not redeclare it.
- **\`const\`** is block-scoped with the same TDZ rule, and the **binding can't be reassigned**. The value itself can still change if it's an object or array.

In practice I default to \`const\`, use \`let\` only when the value really changes (counters, accumulators), and don't write \`var\` at all. Block scoping also fixes the classic \`for (var i…)\` + \`setTimeout\` bug, because \`let\` gives each iteration its own \`i\`.`,
      analogy: `\`var\` is a notice pinned to the whole building (function scope); \`let\` and \`const\` are notes on one room's door (block scope), and \`const\` is written in pen.`,
      quickRevision: [
        '`var`: function-scoped, hoisted as `undefined`, redeclarable',
        '`let`: block-scoped, reassignable, TDZ until declared',
        '`const`: block-scoped, no reassignment, TDZ; contents can still mutate',
        'Default to `const`, use `let` when reassigning, avoid `var`',
      ],
      deepDive: `\`\`\`js
function demo() {
  if (true) {
    var a = 1;   // function-scoped
    let b = 2;   // block-scoped
    const c = 3; // block-scoped
  }
  console.log(a); // 1
  console.log(b); // ReferenceError: b is not defined
}

var x = 1;
var x = 2;   // fine
let y = 1;
let y = 2;   // SyntaxError: Identifier 'y' has already been declared
\`\`\``,
      avoid: [
        '"`const` makes a value immutable": it only stops reassignment of the variable',
        '"`let` and `const` aren\'t hoisted": they are, they just sit in the TDZ',
      ],
      followUps: [
        'Can you mutate a `const` object?',
        'What is the temporal dead zone?',
        'Why does `var` in a loop with `setTimeout` print the same number?',
      ],
    },
    {
      id: 'what-is-hoisting',
      question: 'What is hoisting in JavaScript, and what actually gets hoisted?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `Before running a scope, the engine does a **creation phase**: it registers every declaration in that scope. That's what we call hoisting. Nothing physically moves; the names just exist from the start of the scope. What differs is **how they're initialised**:

- **Function declarations** are fully hoisted with their body, so you can call them before the line they're written on.
- **\`var\`** is hoisted and set to **\`undefined\`**, so reading it early gives \`undefined\`, not an error.
- **\`let\`, \`const\` and \`class\`** are hoisted but **not initialised**. They're in the temporal dead zone, and touching them early throws a \`ReferenceError\`.
- **Function expressions and arrow functions** follow the rule of the variable that holds them. \`var fn = () => {}\` called early is \`undefined()\`, which throws a \`TypeError\`.

So the useful way to say it in an interview: declarations are known up front, but only function declarations and \`var\` are usable before their line, and \`var\` only as \`undefined\`.`,
      analogy: `Before a meeting starts, the organiser writes every attendee's name on the list (declarations); some have arrived (functions), some are "not here yet" (\`var\` = undefined), and some can't be spoken to until they walk in (\`let\`/\`const\`).`,
      quickRevision: [
        'Declarations are registered before the scope runs; nothing moves',
        'Function declarations: fully hoisted, callable early',
        '`var`: hoisted and initialised to `undefined`',
        '`let`/`const`/`class`: hoisted but in the TDZ → `ReferenceError`',
        'Function expressions follow their variable: `var fn` early → `TypeError`',
      ],
      deepDive: `\`\`\`js
sayHi();            // "hi": function declaration is fully hoisted
function sayHi() { console.log('hi'); }

console.log(a);     // undefined
var a = 1;

console.log(b);     // ReferenceError (TDZ)
let b = 2;

greet();            // TypeError: greet is not a function
var greet = () => console.log('hello');
\`\`\``,
      avoid: ['"Hoisting moves code to the top of the file": the engine registers names per scope, it doesn\'t rewrite your code'],
      followUps: [
        'Are function expressions hoisted?',
        'Are classes hoisted?',
        'What does `typeof` return for a variable in the TDZ?',
      ],
    },
    {
      id: 'what-is-the-temporal-dead-zone',
      question: 'What is the temporal dead zone (TDZ), and why does it exist?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `The TDZ is the stretch of code **from the start of a block until a \`let\`, \`const\` or \`class\` declaration is evaluated**. The variable already exists in that block (it's hoisted), but it isn't initialised, so **any access throws a \`ReferenceError\`**. That includes \`typeof\`, which is normally safe for undeclared variables.

It exists to catch bugs. With \`var\`, reading a variable before it's set silently gives \`undefined\` and the bug shows up much later. The TDZ makes the mistake fail loudly at the exact line. It also makes \`const\` meaningful: a \`const\` can never be observed in an "unset" state.

A subtle case is shadowing: inside a block, \`let x = x + 1\` throws, because the inner \`x\` is in its TDZ when the right-hand side reads it. The outer \`x\` is hidden as soon as the block starts.`,
      analogy: `A reserved seat with a "do not sit" sign: the seat exists from the start of the block, but you can't use it until the declaration line removes the sign.`,
      quickRevision: [
        'From block start until the `let`/`const`/`class` line runs',
        'Access throws `ReferenceError`, even `typeof`',
        'Exists to fail loudly instead of giving a silent `undefined`',
        'Shadowing trap: `let x = x + 1` inside a block throws',
      ],
      deepDive: `\`\`\`js
let x = 10;
{
  console.log(typeof x); // ReferenceError: the inner x is in its TDZ
  let x = 20;
}

function f() {
  return value;          // called before the line below runs → ReferenceError
}
// f();                  // would throw here
const value = 42;
f();                     // 42: by now the TDZ is over
\`\`\`

The TDZ is about **time** (when the line runs), not position: a function that reads the variable is fine as long as it's called after the declaration has executed.`,
      followUps: [
        'Does `class` have a TDZ?',
        'Why is `typeof undeclaredVar` safe but `typeof` in the TDZ not?',
        'Can default parameters hit the TDZ?',
      ],
    },
    {
      id: 'can-you-mutate-a-const-object',
      question: 'If an object is declared with `const`, can you still change it? How do you make it truly immutable?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Yes. **\`const\` protects the binding, not the value.** You can't point the variable at a different object, but you can add, change or delete properties of the object it points to, and push to a \`const\` array.

To make the object itself immutable:

- **\`Object.freeze(obj)\`** stops adding, removing or changing properties. In strict mode a write throws; otherwise it's silently ignored. It's **shallow**: nested objects are still mutable unless you freeze them recursively.
- In TypeScript, **\`readonly\`**, \`Readonly<T>\` and **\`as const\`** give compile-time immutability with no runtime cost.
- In app code, the more practical answer is **not mutating**: create new objects with spread or \`structuredClone\`, which is also what React state and Redux expect.`,
      analogy: `\`const\` glues the label to the box, not the lid shut: you can change what's inside, but not put the label on a different box.`,
      quickRevision: [
        '`const` stops reassignment, not mutation',
        '`Object.freeze` blocks changes, but only one level deep',
        'Deep freeze = freeze recursively',
        'TypeScript: `readonly`, `Readonly<T>`, `as const` (compile time only)',
        'In React/Redux: never mutate, return new objects',
      ],
      deepDive: `\`\`\`js
const user = { name: 'Ana', address: { city: 'Dhaka' } };
user.name = 'Bo';          // allowed
user = {};                 // TypeError: Assignment to constant variable

Object.freeze(user);
user.name = 'Cy';          // ignored (throws in strict mode)
user.address.city = 'Paris'; // still works: freeze is shallow

function deepFreeze(obj) {
  Object.values(obj).forEach((v) => typeof v === 'object' && v !== null && deepFreeze(v));
  return Object.freeze(obj);
}
\`\`\``,
      avoid: ['"`const` means constant value": interviewers will immediately ask you to push to a `const` array'],
      followUps: [
        'Is `Object.freeze` deep?',
        'What is the difference between `Object.freeze`, `Object.seal` and `Object.preventExtensions`?',
        'Why does React need a new object reference to re-render?',
      ],
    },
    {
      id: 'scope-chain-and-lexical-scope',
      question: 'What is lexical scope and the scope chain?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `**Lexical scope** means a function's access to variables is decided by **where it's written in the code**, not where it's called from. Each function and block creates a scope, and scopes nest inside each other like the code does.

When you use a variable, the engine looks it up in the current scope first. If it's not there, it walks **outward through the enclosing scopes**, one by one, up to the global scope. That chain of parent scopes is the **scope chain**. If the name isn't found anywhere, you get a \`ReferenceError\` (or, in sloppy mode, an accidental global on assignment).

Two consequences come up a lot. **Shadowing**: an inner variable with the same name hides the outer one. And **closures**: because the chain is fixed when the function is created, an inner function keeps access to its outer variables even after the outer function has returned.`,
      analogy: `Looking for your keys: first your pocket (local scope), then your room, then the house (outer scopes), then the building (global). You never search the neighbour's house, no matter who sent you looking.`,
      quickRevision: [
        'Lexical = scope decided by where code is written',
        'Lookup goes current scope → outer scopes → global',
        'Not found anywhere → `ReferenceError`',
        'Inner variables shadow outer ones with the same name',
        'The fixed scope chain is what makes closures work',
      ],
      deepDive: `\`\`\`js
const name = 'global';

function outer() {
  const name = 'outer';
  function inner() {
    console.log(name); // "outer": found one level up
  }
  return inner;
}

function caller() {
  const name = 'caller';
  outer()();           // still "outer": lexical, not where it's called
}
caller();
\`\`\``,
      followUps: [
        'What is the difference between lexical and dynamic scope?',
        'How does the scope chain relate to closures?',
        'What happens if you assign to an undeclared variable in sloppy mode?',
      ],
    },
  ],
});
