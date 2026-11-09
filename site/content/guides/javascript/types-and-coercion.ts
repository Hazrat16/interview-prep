import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Types & Coercion',
  description: 'Primitive vs reference types, == vs ===, truthiness and the coercion rules interviewers love to test.',
  questions: [
    {
      id: 'primitive-vs-reference-types',
      question: 'What is the difference between primitive and reference types in JavaScript?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `JavaScript has **seven primitives**: \`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`null\` and \`symbol\`. Everything else (objects, arrays, functions, dates, maps) is a **reference type**.

- **Primitives are immutable and copied by value.** \`let b = a\` gives \`b\` its own copy; changing \`b\` never affects \`a\`. String methods like \`toUpperCase\` return a new string.
- **Objects are shared by reference.** The variable holds a pointer to the object, so \`const b = a\` makes both variables point at the **same** object, and a change through one is visible through the other.

This is why \`{} === {}\` is \`false\` (two different objects) and why comparing objects by content needs a deep-equal function. It's also the root of React's immutability rule: React compares state by reference, so mutating an object in place doesn't trigger a re-render.`,
      analogy: `Primitives are like writing a number on a sticky note and handing over a copy; objects are like sharing a Google Doc link, so everyone with the link edits the same document.`,
      quickRevision: [
        'Primitives: string, number, bigint, boolean, undefined, null, symbol',
        'Primitives are immutable and copied by value',
        'Objects, arrays and functions are shared by reference',
        'Comparison checks the reference: `{} === {}` is `false`',
        'React re-renders on a new reference, not on mutation',
      ],
      deepDive: `\`\`\`js
let a = 1;
let b = a;
b++;
console.log(a, b);      // 1 2

const x = { n: 1 };
const y = x;
y.n++;
console.log(x.n);       // 2: same object

console.log({ n: 1 } === { n: 1 }); // false
\`\`\``,
      followUps: [
        'Why is `{} === {}` false?',
        'How do you compare two objects by value?',
        'Is JavaScript pass-by-value or pass-by-reference?',
      ],
    },
    {
      id: 'difference-between-and',
      question: 'What is the difference between `==` and `===`, and when (if ever) would you use `==`?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `**\`===\` (strict equality)** compares type and value with **no conversion**: different types are never equal. **\`==\` (loose equality)** first **coerces** both sides to a common type, following rules that produce surprises: \`0 == ''\` is \`true\`, \`'1' == 1\` is \`true\`, \`[1] == '1'\` is \`true\`, \`[] == ![]\` is \`true\`.

I use \`===\` everywhere, and most lint configs enforce it. The one common exception is **\`value == null\`**, which is \`true\` for both \`null\` and \`undefined\` and nothing else, so it's a compact "is it missing?" check.

Two edge cases \`===\` doesn't handle the way you might expect: \`NaN === NaN\` is \`false\`, and \`+0 === -0\` is \`true\`. \`Object.is\` fixes both, and it's what React uses to compare state.`,
      analogy: `\`===\` checks the item and its label; \`==\` first tries to translate both into the same language, sometimes with surprising translations.`,
      quickRevision: [
        '`===`: no type conversion; `==`: converts first',
        '`null == undefined` is true, and nothing else equals them loosely',
        '`0 == ""` and `[1] == "1"` are true',
        'Always `===`, except `x == null` as a shortcut',
        '`Object.is`: `NaN` equals `NaN`, `+0` ≠ `-0`',
      ],
      deepDive: `\`\`\`js
0 == '';            // true  ('' → 0)
'1' == 1;           // true
null == undefined;  // true
null == 0;          // false (null only loosely equals undefined)
[] == ![];          // true  (![] → false → 0, [] → '' → 0)

NaN === NaN;        // false
Object.is(NaN, NaN);// true
Object.is(0, -0);   // false
\`\`\``,
      followUps: [
        'What is `NaN === NaN`, and how do you check for `NaN`?',
        'What does `Object.is` do differently from `===`?',
        'Walk me through why `[] == ![]` is `true`.',
      ],
    },
    {
      id: 'type-coercion-rules',
      question: 'How does implicit type coercion work in JavaScript? Which values are falsy?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Coercion is JavaScript converting a value to another type automatically. There are three conversions to know:

- **To string**: the **\`+\` operator with a string on either side concatenates**, so \`'5' + 2\` is \`'52'\`.
- **To number**: the other maths operators (\`- * / %\`), comparisons like \`<\`, and unary \`+\` convert to numbers, so \`'5' - 2\` is \`3\` and \`+'42'\` is \`42\`. Non-numeric strings become \`NaN\`.
- **To boolean**: \`if\`, \`!\`, \`&&\`, \`||\` and ternaries test truthiness.

The **falsy** values are exactly: \`false\`, \`0\`, \`-0\`, \`0n\`, \`''\`, \`null\`, \`undefined\` and \`NaN\`. **Everything else is truthy**, including \`'0'\`, \`'false'\`, \`[]\` and \`{}\`.

Objects are converted to primitives through \`valueOf\`/\`toString\`, which is why \`[] + {}\` is \`'[object Object]'\`. In real code I convert explicitly with \`Number()\`, \`String()\` and \`Boolean()\`, and use \`??\` instead of \`||\` when \`0\` or \`''\` are valid values.`,
      analogy: `Mixing currencies at a shop: \`+\` with a string staples the notes together instead of adding them; \`-\` converts everything to the same currency first.`,
      quickRevision: [
        '`+` with a string → concatenation',
        '`- * / <` and unary `+` → numbers',
        'Falsy: `false 0 -0 0n "" null undefined NaN`',
        '`[]`, `{}`, `"0"` are truthy',
        'Convert explicitly; use `??` when `0` or `""` are valid',
      ],
      deepDive: `\`\`\`js
'5' + 2;        // '52'
'5' - 2;        // 3
+'';            // 0
+'abc';         // NaN
[] + [];        // ''
[] + {};        // '[object Object]'
true + 1;       // 2
Boolean([]);    // true

const count = 0;
count || 10;    // 10  (0 is falsy)
count ?? 10;    // 0   (only null/undefined fall back)
\`\`\``,
      avoid: ['"Empty arrays are falsy": `[]` is truthy; check `arr.length`'],
      followUps: [
        'What is the difference between `||` and `??`?',
        'Why is `0.1 + 0.2 !== 0.3`?',
        'How do you safely parse a number from user input?',
      ],
    },
    {
      id: 'why-is-typeof-null-object',
      question: 'Why does `typeof null` return `"object"`, and how do you reliably check types?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `It's a **bug from the very first JavaScript implementation**. Values were stored with a type tag, and objects used tag \`0\`. \`null\` was the null pointer, which was all zeros, so \`typeof\` read it as an object. Fixing it now would break existing websites, so it stays. \`null\` is still a primitive.

For reliable checks I use the right tool per type:

- **null**: \`value === null\`.
- **null or undefined**: \`value == null\`.
- **arrays**: \`Array.isArray(value)\`, because \`typeof []\` is also \`'object'\`.
- **NaN**: \`Number.isNaN(value)\`, because \`typeof NaN\` is \`'number'\`.
- **class instances**: \`instanceof\`.
- For a precise tag on anything, \`Object.prototype.toString.call(value)\` gives \`'[object Date]'\`, \`'[object Null]'\` and so on.`,
      analogy: `A mislabelled box from the very first shipment that can't be relabelled now without breaking every warehouse that relies on it.`,
      quickRevision: [
        'Bug from JS v1: null\'s type tag looked like an object\'s',
        'Kept for backward compatibility',
        'Check null with `=== null`',
        'Arrays: `Array.isArray`; NaN: `Number.isNaN`',
        '`typeof function` is `"function"`',
      ],
      followUps: [
        'What is `typeof NaN`?',
        'How do you reliably check for an array?',
        'What is the difference between `isNaN` and `Number.isNaN`?',
      ],
    },
    {
      id: 'shallow-copy-vs-deep-copy',
      question: 'What is the difference between a shallow copy and a deep copy, and how do you make each?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `A **shallow copy** creates a new top-level object, but **nested objects are still shared** with the original. Spread (\`{ ...obj }\`, \`[...arr]\`), \`Object.assign\`, \`Array.from\` and \`slice\` are all shallow. Change \`copy.address.city\` and the original changes too.

A **deep copy** recursively copies every level, so the two are fully independent. Today the standard way is **\`structuredClone(obj)\`**. It handles nested objects, arrays, \`Date\`, \`Map\`, \`Set\` and even circular references. It can't clone functions, DOM nodes or class prototypes.

The old trick **\`JSON.parse(JSON.stringify(obj))\`** works for plain data but **drops \`undefined\` and functions, turns \`Date\` into strings, and throws on cycles**, so I avoid it.

In React and Redux you usually don't deep copy at all. You **copy only the path you change**: \`{ ...state, user: { ...state.user, name } }\`. Untouched branches keep their references, which keeps memoisation working.`,
      analogy: `A shallow copy photocopies the folder's cover page but the inner documents are still the originals; a deep copy photocopies every page inside too.`,
      quickRevision: [
        'Shallow: `{...obj}`, `[...arr]`, `Object.assign`: nested objects shared',
        'Deep: `structuredClone(obj)`: Dates, Maps, Sets, cycles',
        '`JSON` round-trip loses `undefined`, functions, Dates; throws on cycles',
        'React: copy only the changed path',
      ],
      deepDive: `\`\`\`js
const original = { name: 'Ana', address: { city: 'Dhaka' }, born: new Date(2000, 0, 1) };

const shallow = { ...original };
shallow.address.city = 'Paris';
console.log(original.address.city); // 'Paris': shared

const deep = structuredClone(original);
deep.address.city = 'Rome';
console.log(original.address.city); // 'Paris': independent
console.log(deep.born instanceof Date); // true

JSON.parse(JSON.stringify(original)).born; // a string, not a Date
\`\`\``,
      followUps: [
        'Implement a deep clone that handles cycles.',
        'Why does React state need new references?',
        'What can `structuredClone` not copy?',
      ],
    },
    {
      id: 'pass-by-value-vs-pass-by-reference-in-js',
      question: 'Is JavaScript pass-by-value or pass-by-reference?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `JavaScript is **always pass-by-value**. The catch is that **for objects, the value being copied is a reference**. People sometimes call this "pass by sharing".

So inside a function:

- **Mutating** the object you received (\`user.name = 'Bo'\`) changes the caller's object, because both references point to the same thing.
- **Reassigning** the parameter (\`user = { name: 'Cy' }\`) only changes the local copy of the reference. The caller's variable still points to the original object.

True pass-by-reference (like \`&\` in C++) would let a function reassign the caller's variable, and JavaScript can't do that. To avoid accidental mutation, I treat parameters as read-only and return new objects, which also makes functions easier to test.`,
      analogy: `JS hands you a copy of the address card, not the house: you can repaint the house (mutate), but writing a new address on your card doesn't move the caller's house.`,
      quickRevision: [
        'Always pass-by-value',
        'For objects, the value copied is a reference',
        'Mutating the object → caller sees it',
        'Reassigning the parameter → caller doesn\'t',
        'Treat parameters as read-only; return new objects',
      ],
      deepDive: `\`\`\`js
function update(user) {
  user.name = 'Bo';        // mutates the shared object
  user = { name: 'Cy' };   // rebinds the local parameter only
  user.name = 'Dee';
}

const u = { name: 'Ana' };
update(u);
console.log(u.name); // 'Bo'
\`\`\``,
      avoid: ['"Objects are passed by reference": say "by value, where the value is a reference", then show the reassignment example'],
      followUps: [
        'Predict the output of a function that mutates then reassigns its argument.',
        'How do you avoid accidental mutation of function arguments?',
      ],
    },
  ],
});
