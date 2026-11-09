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
      frequency: 'high',
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
      followUps: [
        'What does `bind` return, and can you re-bind a bound function?',
        'Why can\'t arrow functions be used as constructors?',
        'Implement `Function.prototype.bind` yourself.',
      ],
    },
    {
      id: 'how-is-this-determined',
      question: 'How is `this` determined?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> For regular functions, \`this\` depends on the call site — whether it was called as a method, a plain function, with \`new\`, or with \`call\`/\`apply\`/\`bind\`. Arrow functions don’t bind their own \`this\`; they use the surrounding lexical \`this\`.`,
      analogy: `\`this\` is like the word "me" in a phone call: it means whoever is holding the phone **when the call happens**, not who bought it.`,
      quickRevision: [
        'Priority: `new` > `call/apply/bind` > `obj.fn()` > default',
        'Default: `undefined` in strict mode, global otherwise',
        'Arrow functions take `this` from the outer scope',
        'Decided at call time, not definition time (except arrows)',
      ],
      followUps: [
        'What does `bind` return?',
        'What is `this` inside a `setTimeout` callback?',
      ],
    },
    {
      id: 'difference-between-arrow-and-regular-functions',
      question: 'Difference between arrow and regular functions?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> Arrow functions are shorter, have lexical \`this\`, no own \`arguments\`, and cannot be used with \`new\`. Regular functions have dynamic \`this\`, their own \`arguments\`, and can be constructors.`,
      analogy: `An arrow function is a recorded voicemail: "me" always means the person who recorded it. A regular function is a live call: "me" is whoever picks up.`,
      quickRevision: [
        'Arrow: lexical `this`, no own `arguments`, can\'t be `new`-ed',
        'Regular: dynamic `this`, has `arguments` and `prototype`',
        'Arrows are great for callbacks; avoid as object methods',
        'Implicit return with concise body',
      ],
      followUps: [
        'Can you rebind an arrow function with `call`?',
        'Why use arrow class fields in React class components?',
      ],
    },
    {
      id: 'why-does-this-get-lost-when-you-pass-a-method-as-a-callback',
      question: 'Why does `this` get lost when you pass a method as a callback?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> Because the method is detached from its object. Calling \`const fn = obj.method; fn()\` is a plain function call, so \`this\` is no longer \`obj\`. Fix with \`bind\`, an arrow wrapper, or calling it as \`obj.method()\`.`,
      analogy: `Handing someone your phone number without your name: when they call later, there's no "obj." in front, so they don't know who they're talking to.`,
      quickRevision: [
        'Passing `obj.method` passes only the function',
        'Called later as plain `fn()` → default binding',
        'Fix: `.bind(obj)`, wrapper arrow, or arrow class field',
      ],
      followUps: [
        'Show three ways to fix it.',
        'Why did old React class components bind in the constructor?',
      ],
    },
    {
      id: 'can-arrow-functions-be-used-as-object-methods',
      question: 'Can arrow functions be used as object methods?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript'],
      answer: `> Usually avoid defining object methods as arrows if you need \`this\` to refer to the object. An arrow method would capture the outer \`this\` (often \`window\`/undefined), not the object.`,
      analogy: `You can, but it's like wearing someone else's name badge: the arrow's \`this\` belongs to the surrounding scope, not the object.`,
      quickRevision: [
        'Allowed, but `this` won\'t be the object',
        'Use method shorthand `method() {}` instead',
        'Arrows inside methods are fine (they keep the method\'s `this`)',
      ],
      followUps: [
        'What does `obj.arrow()` return if it uses `this.name`?',
        'When is an arrow inside a method useful?',
      ],
    },
  ],
});
