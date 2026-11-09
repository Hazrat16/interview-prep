import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'React Fundamentals',
  description: 'Virtual DOM, reconciliation, keys, props vs state and how rendering works.',
  questions: [
    {
      id: 'what-is-the-virtual-dom',
      question: 'What is the virtual DOM?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['react', 'css-browser'],
      answer: `The virtual DOM is a lightweight **JavaScript object tree** that describes what the UI should look like. When state changes, React calls my components again to build a **new tree**, **diffs** it against the previous one (reconciliation), and then applies only the **minimal set of real DOM changes**.

The point isn't that the virtual DOM is "faster than the DOM". It lets me write UI **declaratively** (describe the result for any state) while React works out efficient updates. Keys and element types guide the diff.`,
      variants: [
        { label: 'Short version', answer: `An in-memory tree of UI. On each render React builds a new tree, **diffs** it against the previous one (reconciliation) and applies only the changes to the real DOM.` },
      ],
      analogy: `An architect redraws the blueprint on paper whenever something changes, compares it with the last version, and only sends builders to the walls that actually differ. Paper is cheap; moving walls is expensive.`,
      quickRevision: [
        'JS object tree describing the UI',
        'New tree each render → diff → minimal DOM patch',
        'Benefit: declarative code, efficient updates',
        'Keys and element types guide the diff',
      ],
      followUps: [
        'What is reconciliation?',
        'Is the virtual DOM always faster?',
        'What does React Fiber change?',
      ],
    },
    {
      id: 'react-list-keys',
      question: 'Why do lists need keys, and why is using the index as a key a problem?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['react'],
      answer: `Keys tell React **which item is which** between renders, so reconciliation can match old and new list items. With the right key, React moves, adds or removes only what changed, and each item **keeps its own state** (input text, focus, animation).

Using the **index** as a key breaks when the list is **reordered, filtered, or has items inserted or removed anywhere but the end**. Item #0 is now a different record, but React thinks it's the same component. So state attaches to the wrong row (a typed-in input moves to another item, a checkbox stays checked on the wrong row) and React does extra DOM work.

Use a **stable unique ID** from the data (\`todo.id\`). The index is acceptable only for static lists that never reorder and have no per-item state. Don't use \`Math.random()\`: it changes every render and remounts everything.`,
      analogy: `Name badges at a conference. If badges are just seat numbers (index) and people swap seats, you end up greeting the wrong person by name. Real names (stable IDs) follow the person wherever they sit.`,
      quickRevision: [
        'Keys let reconciliation match items across renders',
        'Index keys break on reorder/insert/delete → state on the wrong row',
        'Use a stable ID from the data',
        'Random keys remount every render',
        'Changing a key on purpose resets a component',
      ],
      followUps: [
        'How can you use `key` to reset a form component?',
        'Do keys need to be globally unique?',
      ],
    },
    {
      id: 'state-versus-props',
      question: 'What is the difference between state and props in React?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['react'],
      answer: `**Props** are inputs passed **down from the parent**. They're read-only for the child, which shouldn't modify them. **State** is data a component **owns** and changes over time with \`useState\` or \`useReducer\`, and changing it triggers a re-render.

A good rule: if a value can be **computed** from props or other state, it shouldn't be state at all. If two components need the same state, lift it to their closest common parent and pass it down as props.`,
      variants: [
        { label: 'Short version', answer: `Props are passed in by the parent and read-only. State is owned by the component, and changing it triggers a re-render.` },
      ],
      analogy: `Props are the instructions a manager hands you; state is your own notebook. You follow the instructions but don't rewrite them, and you update your notebook as work progresses.`,
      quickRevision: [
        'Props: from parent, read-only',
        'State: owned, changes trigger re-render',
        'Derived values shouldn\'t be state',
        'Shared state → lift to common parent',
      ],
      followUps: [
        'Can a child change its parent\'s state?',
        'What is derived state and why avoid it?',
      ],
    },
    {
      id: 'react-rendering-reconciliation',
      question: 'How does React rendering work, and what actually triggers a re-render?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['react', 'performance'],
      answer: `Rendering means React **calls your component function** to get a new element tree. It then **reconciles**, diffing the new tree against the previous one, and **commits** only the real DOM changes. Rendering is cheap; DOM updates are the expensive part.

A component re-renders when:

1. **Its state changes** (\`setState\` with a new value; the same value with \`Object.is\` is skipped).
2. **Its parent re-renders**, which by default re-renders all children, even if their props didn't change.
3. **A context it consumes** gets a new value.

Props changing isn't a separate trigger; props only change because the parent rendered. During diffing, a different element **type** at the same position remounts the subtree, and in lists **keys** decide which item is which. React 18+ also **batches** multiple state updates into one render, even inside promises and timeouts.`,
      analogy: `An architect redraws the whole blueprint (render) whenever anything changes, then compares it with the old one and sends builders only to the walls that differ (commit). Redrawing paper is cheap; moving walls is not.`,
      quickRevision: [
        'Render = call component → new tree; commit = apply DOM diff',
        'Triggers: own state, parent render, context change',
        'Same state value (`Object.is`) bails out',
        'Different element type at the same spot = unmount + remount',
        'React 18+: automatic batching everywhere',
      ],
      followUps: [
        'How does `React.memo` change rule 2?',
        'Why does creating a new object in props break memoization?',
        'What is the difference between the render phase and the commit phase?',
        'How would you find which components re-render too often?',
      ],
    },
    {
      id: 'react-forms-controlled-validation',
      question: 'Controlled vs uncontrolled inputs — how do you build forms with validation?',
      perspective: 'practical',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['react', 'typescript'],
      answer: `A **controlled** input gets its value from React state (\`value\` + \`onChange\`), so React is the source of truth. That's easy to validate on every keystroke, but every keystroke re-renders. An **uncontrolled** input keeps its value in the DOM and you read it via a ref or on submit. It's faster but less reactive.

For real forms I use **React Hook Form + Zod**. RHF registers mostly uncontrolled inputs, so typing doesn't re-render the whole form. Zod defines the schema **once** and gives both runtime validation and the TypeScript type (\`z.infer\`). The **same schema can validate on the backend**, so the rules never drift.

Good-form checklist: show errors after blur or submit (not while the user is still typing), disable submit while pending to prevent double submits, map server 422 errors back to fields, keep it accessible (\`label\`, \`aria-invalid\`, focus the first error), and always validate on the server as well. Client validation is for UX, not security.`,
      analogy: `Controlled is a teacher checking every word as you write. Uncontrolled is handing in the paper and getting it marked at the end. React Hook Form is a teacher who only steps in when you pause or submit, and Zod is the shared marking scheme used in class and in the exam.`,
      quickRevision: [
        'Controlled = React state is the source of truth; uncontrolled = the DOM is',
        'RHF: uncontrolled under the hood → fewer re-renders',
        'Zod: one schema → runtime validation + TS type, shareable with the backend',
        'Prevent double submit; map server errors to fields',
        'Client validation = UX; server validation = security',
      ],
      followUps: [
        'How would you build a multi-step form that keeps data between steps?',
        'How do you handle dependent fields (country → city)?',
      ],
    },
    {
      id: 'lifting-state-up',
      question: 'What does "lifting state up" mean, and when do you do it?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['react'],
      answer: `When two sibling components need the **same data**, I move that state to their **closest common parent** and pass the value and a setter (or callback) down as props. Now there's a **single source of truth**, and both siblings stay in sync.

The trade-off: lifting too high causes **unnecessary re-renders** and prop drilling. So I lift only as far as needed, and if many distant components need the data, I consider Context or a store.`,
      variants: [
        { label: 'Short version', answer: 'Move shared state to the closest common parent and pass it down.' },
      ],
      analogy: `Two roommates keeping separate shopping lists keep buying the same milk; putting one list on the shared fridge (the parent) keeps everyone in sync.`,
      quickRevision: [
        'Move shared state to the closest common parent',
        'Pass value + callback down',
        'Single source of truth',
        'Don\'t lift higher than needed',
      ],
      followUps: [
        'When does lifting state become a problem?',
        'How does this relate to prop drilling?',
      ],
    },
    {
      id: 'prop-drilling-and-how-to-avoid-it',
      question: 'What is prop drilling, and how do you avoid it?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['react'],
      answer: `Prop drilling is passing props through **several layers of components that don't use them**, just to reach a deep child. It makes components noisy and refactoring painful.

Fixes, in the order I try them:

1. **Composition**: pass components as \`children\` or slots, so the intermediate layers don't need the data.
2. **Context**: for low-frequency global values (theme, current user, locale).
3. **A state library** (Zustand, Redux) for frequently changing shared state, with selectors.

A little drilling (two or three levels) is fine and explicit.`,
      variants: [
        { label: 'Short version', answer: 'Passing props through many layers. Fixes: composition (`children`), Context, or a state library.' },
      ],
      analogy: `Passing a parcel hand-to-hand through five people who don't care about it; composition is handing it directly, and Context is a building-wide mailbox.`,
      quickRevision: [
        'Passing props through layers that don\'t use them',
        'First fix: composition (`children`)',
        'Context for rarely changing global values',
        'Store with selectors for busy shared state',
      ],
      followUps: [
        'Show composition solving drilling.',
        'Why is Context bad for frequently changing values?',
      ],
    },
    {
      id: 'fragments',
      question: 'What are React Fragments, and why use them?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['react'],
      answer: `A component must return **one root element**. Fragments (\`<>…</>\` or \`<React.Fragment>\`) let me group children **without adding an extra DOM node**. That keeps the DOM clean and avoids breaking layouts like CSS grid and flex, or table structure (\`<tr>\` children). Use the long form \`<Fragment key={…}>\` when rendering fragments in a list.`,
      variants: [
        { label: 'Short version', answer: '`<>...</>` groups elements without adding a DOM node.' },
      ],
      analogy: `A paperclip instead of a folder: it holds the pages together without adding another layer to your filing cabinet.`,
      quickRevision: [
        'Group children without an extra DOM node',
        '`<>…</>` short form',
        'Use `<Fragment key>` in lists',
        'Keeps grid/flex/table markup valid',
      ],
      followUps: [
        'Why does a component need a single root?',
        'When must you use the long Fragment syntax?',
      ],
    },
    {
      id: 'what-is-jsx-compiled-to',
      question: 'What is JSX compiled to?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['react'],
      answer: `JSX is syntax sugar. A compiler (Babel, SWC, esbuild) turns \`<Button color="red">Hi</Button>\` into a function call: \`jsx(Button, { color: 'red', children: 'Hi' })\` with the modern automatic runtime, or \`React.createElement(...)\` with the classic one. The result is a **plain object** describing the element, which React uses to build the tree. That's why JSX expressions can be stored in variables, returned and passed around.`,
      variants: [
        { label: 'Short version', answer: '`jsx()` / `React.createElement()` calls that return plain objects.' },
      ],
      analogy: `JSX is shorthand on an order form; the compiler rewrites it into the full formal order (a function call) the kitchen actually reads.`,
      quickRevision: [
        'JSX → `jsx()` / `React.createElement()`',
        'Returns plain objects (elements)',
        'Compiled by Babel/SWC/esbuild',
        'Lowercase = DOM tag, Capitalised = component',
      ],
      followUps: [
        'Why must components start with a capital letter?',
        'What is the new JSX transform?',
      ],
    },
    {
      id: 'react-1819-features',
      question: 'What are the most important features in React 18 and 19?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `**React 18** introduced **concurrent rendering**: React can prepare updates in the background and interrupt them. On top of that:

- **automatic batching** everywhere (promises, timeouts);
- \`useTransition\` and \`useDeferredValue\` to mark updates as non-urgent;
- **Suspense** for data and streaming SSR;
- \`useId\`.

**React 19** adds:

- **Actions** (async functions in transitions, with \`useActionState\` and \`useFormStatus\` for forms);
- \`useOptimistic\`;
- the \`use()\` hook for reading promises and context;
- \`ref\` as a normal prop, so no \`forwardRef\`;
- better hydration error messages;
- the **React Compiler**, which auto-memoises components.

In practice I use transitions for heavy filtering and TanStack Query for most data.`,
      variants: [
        { label: 'Short version', answer: `Automatic batching, \`useTransition\`, \`useDeferredValue\`, Suspense for data, concurrent rendering. React 19 adds Actions, \`use()\`, \`useOptimistic\`, \`useActionState\`, \`ref\` as a prop and the React Compiler.` },
      ],
      analogy: `React 18 gave the kitchen the ability to pause a slow dish to serve a quick one first (concurrency); React 19 added ready-made recipes for common jobs like forms and optimistic orders.`,
      quickRevision: [
        '18: concurrent rendering, auto batching, transitions, Suspense streaming',
        '19: Actions, useActionState, useOptimistic, use()',
        '19: ref as prop, React Compiler',
        'Use transitions for non-urgent updates',
      ],
      followUps: [
        'How does `useTransition` keep typing responsive?',
        'What does the React Compiler change about `useMemo`?',
      ],
    },
    {
      id: 'strictmode-double-invoke',
      question: 'Why does React StrictMode render components and run effects twice in development?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `In **development only**, StrictMode intentionally **renders components twice** and runs effects **mount → unmount → mount**. The goal is to surface bugs early: impure renders (side effects during render) and effects with **missing cleanup** (duplicate subscriptions, intervals or fetches).

It doesn't happen in production. If something breaks under StrictMode, the fix is usually to make the render pure or add a proper cleanup, not to remove StrictMode.`,
      variants: [
        { label: 'Short version', answer: `In development, React renders twice and runs effects mount → unmount → mount to surface impure renders and missing cleanups.` },
      ],
      analogy: `A fire drill: the building practises evacuating and coming back in, so you find blocked exits (missing cleanups) before a real fire.`,
      quickRevision: [
        'Dev only: double render + mount/unmount/mount',
        'Finds impure renders and missing cleanups',
        'Not in production',
        'Fix the cleanup, don\'t remove StrictMode',
      ],
      followUps: [
        'Why did my fetch run twice in development?',
        'How do you write an effect that survives double mounting?',
      ],
    },
  ],
});
