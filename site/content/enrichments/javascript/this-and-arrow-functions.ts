import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/this-and-arrow-functions.md', {
  'how-is-this-determined': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: '`this` is like the word "me" in a phone call: it means whoever is holding the phone **when the call happens**, not who bought it.',
    quickRevision: [
      'Priority: `new` > `call/apply/bind` > `obj.fn()` > default',
      'Default: `undefined` in strict mode, global otherwise',
      'Arrow functions take `this` from the outer scope',
      'Decided at call time, not definition time (except arrows)',
    ],
    followUps: ['What does `bind` return?', 'What is `this` inside a `setTimeout` callback?'],
  },
  'difference-between-arrow-and-regular-functions': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'An arrow function is a recorded voicemail: "me" always means the person who recorded it. A regular function is a live call: "me" is whoever picks up.',
    quickRevision: [
      'Arrow: lexical `this`, no own `arguments`, can\'t be `new`-ed',
      'Regular: dynamic `this`, has `arguments` and `prototype`',
      'Arrows are great for callbacks; avoid as object methods',
      'Implicit return with concise body',
    ],
    followUps: ['Can you rebind an arrow function with `call`?', 'Why use arrow class fields in React class components?'],
  },
  'why-does-this-get-lost-when-you-pass-a-method-as-a-callback': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Handing someone your phone number without your name: when they call later, there\'s no "obj." in front, so they don\'t know who they\'re talking to.',
    quickRevision: [
      'Passing `obj.method` passes only the function',
      'Called later as plain `fn()` → default binding',
      'Fix: `.bind(obj)`, wrapper arrow, or arrow class field',
    ],
    followUps: ['Show three ways to fix it.', 'Why did old React class components bind in the constructor?'],
  },
  'can-arrow-functions-be-used-as-object-methods': {
    difficulty: 'easy',
    analogy: 'You can, but it\'s like wearing someone else\'s name badge: the arrow\'s `this` belongs to the surrounding scope, not the object.',
    quickRevision: [
      'Allowed, but `this` won\'t be the object',
      'Use method shorthand `method() {}` instead',
      'Arrows inside methods are fine (they keep the method\'s `this`)',
    ],
    followUps: ['What does `obj.arrow()` return if it uses `this.name`?', 'When is an arrow inside a method useful?'],
  },
});
