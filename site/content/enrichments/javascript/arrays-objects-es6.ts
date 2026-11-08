import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/arrays-objects-es6.md', {
  'difference-between-map-and-foreach': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: '`map` is a photocopier that hands you a new stack of transformed pages; `forEach` is someone reading each page aloud: things happen, but you get nothing back.',
    quickRevision: [
      '`map` returns a **new array** of the same length',
      '`forEach` returns `undefined`; use it for side effects',
      'Neither mutates the original (unless your callback does)',
      "Can't `break` out of either; use `for…of` or `some`/`every`",
    ],
    followUps: ['When would you use `reduce` instead of `map`?', 'How do you stop a `forEach` early?', 'Is `map` faster than a `for` loop?'],
  },
  'what-is-a-higher-order-function': {
    difficulty: 'easy',
    analogy: 'A coffee machine that accepts pods: the machine (higher-order function) stays the same, and the pod you plug in (callback) decides the drink.',
    quickRevision: [
      'Takes a function as an argument **or** returns a function',
      'Examples: `map`, `filter`, `setTimeout`, `debounce`, middleware factories',
      'Possible because functions are first-class values',
    ],
    followUps: ['Write a function that returns a function.', 'How do closures relate to higher-order functions?'],
  },
  'spread-vs-rest': {
    difficulty: 'easy',
    analogy: 'Same `...` symbol, opposite jobs: **spread** unpacks a suitcase onto the bed; **rest** packs the leftover clothes into one bag.',
    quickRevision: [
      'Spread expands: `[...arr]`, `{...obj}`, `fn(...args)`',
      'Rest collects: `function f(a, ...others)`, `const { id, ...rest } = obj`',
      'Spread copies are **shallow**',
      'Rest must be the last parameter',
    ],
    followUps: ['Does object spread deep-copy nested objects?', 'How would you remove a key from an object immutably?'],
  },
  '-vs-': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: '`||` replaces anything that *looks* empty (0, "", false); `??` only replaces things that are *truly missing* (null, undefined), like a form that keeps "0 items" instead of overwriting it with the default.',
    quickRevision: [
      '`a || b` → b when a is **falsy** (0, "", false, NaN, null, undefined)',
      '`a ?? b` → b only when a is **null or undefined**',
      'Use `??` for defaults where 0 or "" are valid values',
      '`??=` and `||=` are the assignment versions',
    ],
    followUps: ['What does `0 || 10` vs `0 ?? 10` return?', 'How does optional chaining `?.` combine with `??`?'],
  },
  'pure-function': {
    difficulty: 'easy',
    analogy: 'A calculator: the same buttons always give the same result, and pressing them doesn\'t change anything else in the room.',
    quickRevision: [
      'Same input → same output',
      'No side effects (no mutation, I/O, globals, randomness)',
      'Easy to test, cache (memoize) and reason about',
      'React expects components and reducers to be pure during render',
    ],
    followUps: ['Why must Redux reducers be pure?', 'Is `Array.prototype.sort` pure?', 'How do you handle side effects in an otherwise pure codebase?'],
  },
});
