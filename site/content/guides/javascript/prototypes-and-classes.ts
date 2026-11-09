import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Prototypes & Classes',
  description: 'The prototype chain, how class syntax maps onto it, and inheritance trade-offs.',
  questions: [
    {
      id: 'what-is-prototypal-inheritance',
      question: 'What is prototypal inheritance?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> Objects inherit properties and methods by linking to a prototype. When you access a property, JavaScript looks on the object first, then walks up the prototype chain until it finds it or ends at null.`,
      analogy: `Asking a family tree: if you don't know a recipe, you ask your parent, then grandparent, until someone knows it or the tree ends (\`null\`).`,
      quickRevision: [
        'Objects link to another object via `[[Prototype]]`',
        'Property lookup walks the chain until found or `null`',
        'Methods are shared via the prototype, not copied',
        '`Object.create(proto)` sets it directly',
      ],
      followUps: [
        'How do `class` and `extends` map to prototypes?',
        'What does `Object.create(null)` give you?',
      ],
    },
    {
      id: 'are-classes-different-from-prototypes',
      question: 'Are classes different from prototypes?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `> Classes provide cleaner syntax for creating constructor functions and prototype methods. Under the hood, inheritance still uses the prototype chain. So classes don’t replace prototypes — they sit on top of them.`,
      analogy: 'Classes are a nicer front door on the same house: the rooms behind it are still prototypes.',
      quickRevision: [
        '`class` is mostly syntax over prototypes',
        'Differences: must use `new`, strict mode, non-enumerable methods',
        'Adds private `#fields`, static blocks, `super`',
        'Methods still live on `Class.prototype`',
      ],
      followUps: [
        'What are private class fields?',
        'Arrow functions as class fields: pros and cons?',
      ],
    },
    {
      id: 'difference-between-proto-and-prototype',
      question: 'Difference between `__proto__` and `prototype`?',
      perspective: 'trade-off',
      difficulty: 'hard',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `> \`prototype\` is a property on functions used when they are called with \`new\`. \`__proto__\` (or better, \`Object.getPrototypeOf\`) is the actual prototype link on an instance. Instances don’t have a \`.prototype\` property the way constructor functions do.`,
      analogy: `\`prototype\` is the template a factory hands to everything it builds; \`__proto__\` is the label on each built item saying which template it came from.`,
      quickRevision: [
        '`Fn.prototype`: object used as the prototype of instances made by `new Fn()`',
        '`obj.__proto__`: the actual prototype link of an object',
        '`new Fn().__proto__ === Fn.prototype`',
        'Prefer `Object.getPrototypeOf` over `__proto__`',
      ],
      followUps: [
        'What does `new` do step by step?',
        'Do arrow functions have a `prototype`?',
      ],
    },
    {
      id: 'own-property-vs-inherited-property',
      question: 'Own property vs inherited property?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `> An own property exists directly on the object (\`hasOwnProperty\` / \`Object.hasOwn\`). An inherited property comes from somewhere on the prototype chain.`,
      analogy: `Things in your own pocket vs things you can borrow from your parents: both are usable, but only one is yours.`,
      quickRevision: [
        'Own: defined directly on the object',
        'Inherited: found through the prototype chain',
        'Check with `Object.hasOwn(obj, key)`',
        '`for…in` includes inherited enumerable keys; `Object.keys` doesn\'t',
      ],
      followUps: [
        '`in` vs `hasOwn`?',
        'Why is `Object.hasOwn` preferred over `obj.hasOwnProperty`?',
      ],
    },
  ],
});
