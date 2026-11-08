import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/variables-scope-hoisting.md', {
  'difference-between-var-let-and-const': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: '`var` is a notice pinned to the whole building (function scope); `let` and `const` are notes on one room\'s door (block scope), and `const` is written in pen.',
    quickRevision: [
      '`var`: function-scoped, hoisted as `undefined`, redeclarable',
      '`let`: block-scoped, reassignable, TDZ',
      '`const`: block-scoped, no reassignment, TDZ',
      'Default to `const`, use `let` when reassigning, avoid `var`',
    ],
    followUps: ['Can you mutate a `const` object?', 'What is the TDZ?', 'Why does `var` in a loop cause bugs?'],
  },
  'what-is-hoisting': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'Before a meeting starts, the organiser writes every attendee\'s name on the list (declarations); some have arrived (functions), some are "not here yet" (`var` = undefined), and some can\'t be spoken to until they walk in (`let`/`const`).',
    quickRevision: [
      'Declarations are processed before code runs',
      'Function declarations: fully hoisted',
      '`var`: hoisted and initialised to `undefined`',
      '`let`/`const`/`class`: hoisted but in the TDZ',
    ],
    followUps: ['Are function expressions hoisted?', 'What is the output of a `var` used before its declaration?'],
  },
  'what-is-the-temporal-dead-zone': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'A reserved seat with a "do not sit" sign: the seat exists from the start of the block, but you can\'t use it until the declaration line removes the sign.',
    quickRevision: [
      'Time between block start and the `let`/`const` declaration',
      'Accessing it throws `ReferenceError`',
      'Prevents using variables before they are initialised',
      '`typeof` also throws inside the TDZ',
    ],
    followUps: ['Does `class` have a TDZ?', 'Why was the TDZ added?'],
  },
  'can-you-mutate-a-const-object': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: '`const` glues the label to the box, not the lid shut: you can change what\'s inside, but not put the label on a different box.',
    quickRevision: [
      'Yes: `const` stops reassignment, not mutation',
      'Freeze with `Object.freeze` (shallow)',
      'TypeScript `readonly` / `as const` for compile-time safety',
    ],
    followUps: ['Is `Object.freeze` deep?', 'How do you make a deeply immutable object?'],
  },
});
