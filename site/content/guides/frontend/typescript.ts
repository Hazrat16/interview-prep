import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'TypeScript',
  description: 'type vs interface, generics, narrowing, utility types and typing React.',
  questions: [
    {
      id: 'ts-interface-vs-type',
      question: 'TypeScript: interface vs type alias — which do you use and when?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['typescript'],
      answer: `Both describe object shapes, and for most objects they're interchangeable. The differences:

- **\`type\` can describe anything**: unions (\`'idle' | 'loading'\`), tuples, primitives, mapped and conditional types. \`interface\` describes only object and function shapes.
- **\`interface\` can be re-opened** (declaration merging). Two declarations with the same name merge. That's useful for extending library types (\`Window\`, Express \`Request\`) but can surprise you in app code.
- **\`extends\` vs \`&\`**: interface \`extends\` reports conflicting properties as errors. Intersections can silently produce \`never\`.

My rule: \`interface\` for public object contracts (props, API DTOs) and anything meant to be extended; \`type\` for unions, utility compositions and everything else. Most important is **staying consistent** within a codebase.`,
      analogy: `An \`interface\` is a contract template others can add clauses to later. A \`type\` is a label you can stick on anything, including "one of these options". For a plain object shape, either piece of paper works.`,
      quickRevision: [
        'Unions, tuples, mapped/conditional types → `type` only',
        'Declaration merging → `interface` only',
        '`extends` errors on conflicts; `&` may become `never`',
        'Rule: interface for object contracts, type for compositions',
      ],
      followUps: [
        'How would you add a `user` property to Express `Request`?',
        'What is a discriminated union and why is it useful?',
        'Explain `Partial`, `Pick`, `Omit` and `Record`.',
      ],
    },
    {
      id: 'ts-unknown-any-never-narrowing',
      question: 'unknown vs any vs never — and how does type narrowing work?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['typescript'],
      answer: `- **\`any\`** turns the type checker off. You can do anything with it, and it spreads silently.
- **\`unknown\`** is the safe "could be anything". You **must narrow it** before using it. Use it for \`JSON.parse\` results, \`catch (e)\` and external input.
- **\`never\`** is a value that can't exist: a function that always throws, or the leftover case after every union member has been handled.

**Narrowing** is TypeScript refining a type inside a branch, using \`typeof\`, \`instanceof\`, \`in\`, equality checks, **discriminated unions** (\`switch (action.type)\`) and custom **type guards** (\`function isUser(x): x is User\`).

A pattern I use is **exhaustiveness checking**:

\`\`\`ts
switch (status.kind) {
  case 'draft': …; case 'sent': …; case 'paid': …;
  default: const _exhaustive: never = status; // error if a new kind is added
}
\`\`\``,
      analogy: `\`any\` is a sealed box that customs waves through. \`unknown\` is a sealed box customs insists on opening before it goes anywhere. \`never\` is the "nothing should ever arrive here" slot: if something lands in it, you've found a bug.`,
      quickRevision: [
        '`any` = no checks; `unknown` = must narrow first; `never` = impossible',
        'Use `unknown` for external data and `catch (e)`',
        'Narrow with `typeof`, `instanceof`, `in`, discriminants, type guards',
        '`const x: never = value` in `default` for exhaustive switches',
      ],
      followUps: [
        'Write a type guard for an API response.',
        'Why is validating at runtime (Zod) still needed with TypeScript?',
        'What does `as const` do?',
      ],
    },
    {
      id: 'ts-generics-real-example',
      question: 'Explain TypeScript generics with a real example from your work.',
      perspective: 'practical',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['typescript', 'react', 'api-design'],
      answer: `Generics let a function or type work with **many types while keeping the relationship between input and output**. Without them you'd choose between duplicating code or losing safety with \`any\`.

A real example is a typed API helper:

\`\`\`ts
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}

const invoices = await api<Invoice[]>('/api/invoices'); // invoices: Invoice[]
\`\`\`

Others I use often: a paginated response \`Paginated<T> = { items: T[]; total: number; page: number }\`, a reusable \`<Table<T>>\` component where column accessors are checked against \`keyof T\`, and **constraints** like \`<T extends { id: string }>\` so a helper can rely on \`id\` existing. With Zod, \`z.infer<typeof schema>\` derives the type from the validator, so runtime and compile-time agree.`,
      analogy: `A shipping box with a label slot. The box (function) is the same, but when you write "Books" on the label (\`T = Book\`), everyone who opens it knows exactly what's inside, without opening every box to check.`,
      quickRevision: [
        'Generics = type parameters; keep input/output types connected',
        'Prefer over `any`, which turns type checking off',
        'Constrain with `extends` (`<T extends { id: string }>`)',
        '`keyof T` and `T[K]` for typed property access',
        'Real uses: API client, `Paginated<T>`, generic table/select components',
      ],
      followUps: [
        'What is the difference between `unknown` and `any`?',
        'Write `function getProp<T, K extends keyof T>(obj: T, key: K): T[K]`.',
        'How do you type a generic React component?',
      ],
    },
    {
      id: 'utility-types',
      question: 'Which TypeScript utility types do you use most, and for what?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['typescript'],
      answer: `Built-in types that **transform other types**, so I don't duplicate definitions:

- \`Partial<T>\` / \`Required<T>\`: make all fields optional or required (e.g. a PATCH body).
- \`Pick<T, K>\` / \`Omit<T, K>\`: choose or remove fields (e.g. \`Omit<User, 'password'>\` for API responses).
- \`Record<K, V>\`: object maps (\`Record<Status, string>\`).
- \`ReturnType<F>\`, \`Parameters<F>\`, \`Awaited<T>\`: derive types from functions and promises.
- \`Readonly<T>\`, \`NonNullable<T>\`, \`Extract\`/\`Exclude\` for unions.`,
      variants: [
        { label: 'Short version', answer: '`Partial`, `Required`, `Pick`, `Omit`, `Record`, `ReturnType`, `Awaited`.' },
      ],
      analogy: `Photocopier settings for types: enlarge (Required), shrink (Partial), crop (Pick/Omit), without redrawing the original document.`,
      quickRevision: [
        'Partial / Required',
        'Pick / Omit',
        'Record for maps',
        'ReturnType, Parameters, Awaited',
        'Extract / Exclude for unions',
      ],
      followUps: [
        'Implement `Partial` yourself with a mapped type.',
        'Omit vs Exclude?',
      ],
    },
    {
      id: 'typing-props-and-events',
      question: 'How do you type React props and events in TypeScript?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['typescript'],
      answer: `- **Props**: a \`type Props = { title: string; onSave?: (id: string) => void; children?: React.ReactNode }\` and \`function Card({ title }: Props)\`. I avoid \`React.FC\` mainly for consistency.
- **Events**: \`React.ChangeEvent<HTMLInputElement>\`, \`React.FormEvent<HTMLFormElement>\`, \`React.MouseEvent<HTMLButtonElement>\`. Inline handlers infer these automatically.
- **Native element props**: extend \`React.ComponentProps<'button'>\` to accept everything a button accepts.
- **Refs**: \`useRef<HTMLInputElement>(null)\`.`,
      variants: [
        { label: 'Short version', answer: '`type Props = {...}`; `React.ChangeEvent<HTMLInputElement>`; `React.ReactNode` for children.' },
      ],
      analogy: `Labelling every socket and plug in a house so the wrong appliance can't be plugged into the wrong outlet.`,
      quickRevision: [
        'Props as a `type`; children: ReactNode',
        'ChangeEvent / FormEvent / MouseEvent<Element>',
        'Extend ComponentProps<"button">',
        'useRef<HTMLInputElement>(null)',
      ],
      followUps: [
        'How do you type a polymorphic `as` prop?',
        'How do you type a generic list component?',
      ],
    },
    {
      id: 'zod-with-typescript',
      question: 'Why use Zod alongside TypeScript?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['typescript'],
      answer: `TypeScript types **disappear at runtime**, so they can't protect me from bad API data or user input. **Zod** defines a schema that **validates at runtime**, and \`z.infer<typeof schema>\` gives me the **TypeScript type from the same schema**: one source of truth.

I use it on the frontend with React Hook Form (\`zodResolver\`) and on the backend to validate request bodies, params and env variables. At Firmwide the APIs are Zod-validated, and sharing schemas between front and back keeps the rules in sync.`,
      variants: [
        { label: 'Short version', answer: 'Runtime validation plus `z.infer<typeof schema>` to get a single source of truth for types.' },
      ],
      analogy: `TypeScript is the building plan; Zod is the inspector at the door checking that what actually arrives matches the plan.`,
      quickRevision: [
        'TS types vanish at runtime',
        'Zod validates at runtime',
        'z.infer → type from the schema',
        'Use with RHF + backend validation; share schemas',
      ],
      followUps: [
        'safeParse vs parse?',
        'How do you validate environment variables?',
        'Zod vs Yup vs Joi?',
      ],
    },
  ],
});
