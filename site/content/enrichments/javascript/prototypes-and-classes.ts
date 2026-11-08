import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/prototypes-and-classes.md', {
  'what-is-prototypal-inheritance': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Asking a family tree: if you don\'t know a recipe, you ask your parent, then grandparent, until someone knows it or the tree ends (`null`).',
    quickRevision: [
      'Objects link to another object via `[[Prototype]]`',
      'Property lookup walks the chain until found or `null`',
      'Methods are shared via the prototype, not copied',
      '`Object.create(proto)` sets it directly',
    ],
    followUps: ['How do `class` and `extends` map to prototypes?', 'What does `Object.create(null)` give you?'],
  },
  'are-classes-different-from-prototypes': {
    difficulty: 'medium',
    analogy: 'Classes are a nicer front door on the same house: the rooms behind it are still prototypes.',
    quickRevision: [
      '`class` is mostly syntax over prototypes',
      'Differences: must use `new`, strict mode, non-enumerable methods',
      'Adds private `#fields`, static blocks, `super`',
      'Methods still live on `Class.prototype`',
    ],
    followUps: ['What are private class fields?', 'Arrow functions as class fields: pros and cons?'],
  },
  'difference-between-proto-and-prototype': {
    difficulty: 'hard',
    frequency: 'medium',
    analogy: '`prototype` is the template a factory hands to everything it builds; `__proto__` is the label on each built item saying which template it came from.',
    quickRevision: [
      '`Fn.prototype`: object used as the prototype of instances made by `new Fn()`',
      '`obj.__proto__`: the actual prototype link of an object',
      '`new Fn().__proto__ === Fn.prototype`',
      'Prefer `Object.getPrototypeOf` over `__proto__`',
    ],
    followUps: ['What does `new` do step by step?', 'Do arrow functions have a `prototype`?'],
  },
  'own-property-vs-inherited-property': {
    difficulty: 'easy',
    analogy: 'Things in your own pocket vs things you can borrow from your parents: both are usable, but only one is yours.',
    quickRevision: [
      'Own: defined directly on the object',
      'Inherited: found through the prototype chain',
      'Check with `Object.hasOwn(obj, key)`',
      '`for…in` includes inherited enumerable keys; `Object.keys` doesn\'t',
    ],
    followUps: ['`in` vs `hasOwn`?', 'Why is `Object.hasOwn` preferred over `obj.hasOwnProperty`?'],
  },
});
