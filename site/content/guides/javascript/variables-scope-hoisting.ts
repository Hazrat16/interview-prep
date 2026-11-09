import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Variables, Scope & Hoisting',
  description: 'var vs let vs const, the temporal dead zone, scope chains and what hoisting really moves.',
  questions: [
    {
      id: 'difference-between-var-let-and-const',
      question: 'Difference between var, let, and const?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> \`var\` is function-scoped and can be redeclared. \`let\` and \`const\` are block-scoped. \`let\` allows reassignment; \`const\` does not. \`var\` is hoisted and initialized as undefined, while \`let\` and \`const\` are hoisted but stay in the temporal dead zone until their declaration is evaluated.`,
      analogy: `\`var\` is a notice pinned to the whole building (function scope); \`let\` and \`const\` are notes on one room's door (block scope), and \`const\` is written in pen.`,
      quickRevision: [
        '`var`: function-scoped, hoisted as `undefined`, redeclarable',
        '`let`: block-scoped, reassignable, TDZ',
        '`const`: block-scoped, no reassignment, TDZ',
        'Default to `const`, use `let` when reassigning, avoid `var`',
      ],
      followUps: [
        'Can you mutate a `const` object?',
        'What is the TDZ?',
        'Why does `var` in a loop cause bugs?',
      ],
    },
    {
      id: 'what-is-hoisting',
      question: 'What is hoisting?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> Hoisting is JavaScript’s behavior of processing declarations before execution. Variable and function declarations are available in their scope before the line where they appear, but initialization rules differ — especially for \`let\` and \`const\` due to the TDZ.`,
      analogy: `Before a meeting starts, the organiser writes every attendee's name on the list (declarations); some have arrived (functions), some are "not here yet" (\`var\` = undefined), and some can't be spoken to until they walk in (\`let\`/\`const\`).`,
      quickRevision: [
        'Declarations are processed before code runs',
        'Function declarations: fully hoisted',
        '`var`: hoisted and initialised to `undefined`',
        '`let`/`const`/`class`: hoisted but in the TDZ',
      ],
      followUps: [
        'Are function expressions hoisted?',
        'What is the output of a `var` used before its declaration?',
      ],
    },
    {
      id: 'what-is-the-temporal-dead-zone',
      question: 'What is the Temporal Dead Zone?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> The TDZ is the period from the start of a block until a \`let\` or \`const\` declaration is initialized. Accessing the variable in that period throws a ReferenceError.`,
      analogy: `A reserved seat with a "do not sit" sign: the seat exists from the start of the block, but you can't use it until the declaration line removes the sign.`,
      quickRevision: [
        'Time between block start and the `let`/`const` declaration',
        'Accessing it throws `ReferenceError`',
        'Prevents using variables before they are initialised',
        '`typeof` also throws inside the TDZ',
      ],
      followUps: [
        'Does `class` have a TDZ?',
        'Why was the TDZ added?',
      ],
    },
    {
      id: 'can-you-mutate-a-const-object',
      question: 'Can you mutate a const object?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['javascript'],
      answer: `> Yes. \`const\` prevents reassigning the variable binding, not mutating the object’s properties. To make an object immutable, you’d need something like \`Object.freeze\`.`,
      analogy: `\`const\` glues the label to the box, not the lid shut: you can change what's inside, but not put the label on a different box.`,
      quickRevision: [
        'Yes: `const` stops reassignment, not mutation',
        'Freeze with `Object.freeze` (shallow)',
        'TypeScript `readonly` / `as const` for compile-time safety',
      ],
      followUps: [
        'Is `Object.freeze` deep?',
        'How do you make a deeply immutable object?',
      ],
    },
  ],
});
