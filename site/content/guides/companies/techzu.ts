import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Techzu',
  description: 'Questions asked in a real Techzu technical interview.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'backend/expressjs/express-middleware-error-handling',
    'database/mongodb/db-indexes-composite',
    'javascript/output-prediction/event-loop-order',
    'javascript/debounce-throttle/debounce-vs-throttle',
    'frontend/react-hooks/useeffect-vs-uselayouteffect',
    'frontend/nextjs/nextjs-rendering-strategies',
    'frontend/react-hooks/react-memo-usememo-usecallback',
    'database/mongodb/aggregation-pipeline',
    'backend/expressjs/ressend-vs-resjson-vs-resend',
  ],
  questions: [
    {
      id: 'react-lifecycle',
      question: 'React lifecycle',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['react'],
      answer: `Class components had explicit lifecycle methods for three phases:

- **mounting**: \`constructor\`, \`render\`, \`componentDidMount\`;
- **updating**: \`render\`, then \`componentDidUpdate(prevProps, prevState)\`;
- **unmounting**: \`componentWillUnmount\`.

With hooks, I think in terms of **synchronising effects** rather than lifecycle events:

- \`useEffect(fn, [])\` behaves like **mount**, and its **cleanup** like **unmount**;
- \`useEffect(fn, [dep])\` runs after renders where \`dep\` changed, like a targeted \`componentDidUpdate\`;
- \`useLayoutEffect\` runs before paint, for DOM measurements.

Error boundaries are still class-only (\`componentDidCatch\`), so I use a small library or write one class for them.`,
      variants: [
        { label: 'Short version', answer: `**Class components** had explicit phases: mounting → updating → unmounting (\`componentDidMount\`, \`componentDidUpdate\`, \`componentWillUnmount\`).

**Hooks map** (what interviewers usually want now):

| Class lifecycle | Hooks equivalent |
|-----------------|------------------|
| \`componentDidMount\` | \`useEffect(() => { ... }, [])\` |
| \`componentDidUpdate\` | \`useEffect(() => { ... }, [deps])\` |
| \`componentWillUnmount\` | cleanup: \`return () => { ... }\` inside \`useEffect\` |

Spoken answer:

> In modern React we think in terms of render + effects. Mount runs an effect with an empty dependency array, updates re-run when deps change, and cleanup runs on unmount or before the next effect.` },
      ],
      analogy: `A shop's day: opening up (mount), serving customers as things change (update), and closing and locking up (unmount). Hooks let you attach a routine to each change instead of to the time of day.`,
      quickRevision: [
        'Mount: componentDidMount ≈ useEffect(…, [])',
        'Update: componentDidUpdate ≈ useEffect with deps',
        'Unmount: componentWillUnmount ≈ effect cleanup',
        'Error boundaries still need a class',
      ],
      followUps: [
        'Why does useEffect run twice in StrictMode?',
        'How do you run code only on updates, not on mount?',
      ],
    },
  ],
});
