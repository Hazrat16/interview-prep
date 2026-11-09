import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Debounce & Throttle',
  description: 'When to use each, how to implement them and where they show up in real UIs.',
  questions: [
    {
      id: 'js-implement-debounce',
      question: 'Implement debounce. What edge cases would you handle?',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript', 'react'],
      answer: `Debounce delays calling a function until calls have **stopped for \`wait\` ms**. Each new call resets the timer. It's used for search-as-you-type, resize handlers and auto-save.

\`\`\`js
function debounce(fn, wait = 300) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
\`\`\`

Edge cases I'd talk through: keeping \`this\` and the **latest** arguments; a \`cancel()\` (and maybe \`flush()\`) so a React component can clean up on unmount; a **leading** option to fire immediately on the first call; and in React, creating it **once** with \`useMemo\` or \`useRef\`, otherwise every render makes a new debounced function and it never fires as expected.`,
      analogy: `A lift door. Every time someone walks in, the door timer resets. The lift leaves only after nobody has entered for a few seconds. Throttle is a bus that leaves every 10 minutes no matter how many people keep arriving.`,
      quickRevision: [
        'Debounce = run after calls stop; throttle = run at most once per interval',
        '`clearTimeout` then `setTimeout` on every call',
        'Preserve `this` + args with `fn.apply(this, args)`',
        'Expose `cancel()` for unmount cleanup',
        'In React: create once (`useMemo`/`useRef`) or use a `useDebounce(value)` hook',
      ],
      followUps: [
        'Now implement throttle.',
        'Write a `useDebounce(value, delay)` hook.',
        'Debounce vs throttle for a scroll-based infinite list: which and why?',
      ],
    },
    {
      id: 'debounce-vs-throttle',
      question: 'Debounce vs throttle?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> Debounce delays execution until events stop for a given time — useful for search boxes. Throttle ensures a function runs at regular intervals during continuous events — useful for scroll or resize handlers.`,
      analogy: `Debounce is a lift door that waits until people stop walking in; throttle is a bus that leaves every 10 minutes no matter how many people keep arriving.`,
      quickRevision: [
        'Debounce: run **after** calls stop for X ms',
        'Throttle: run **at most once** every X ms',
        'Debounce → search input, auto-save, resize end',
        'Throttle → scroll, mousemove, drag, analytics pings',
      ],
      followUps: [
        'Implement both.',
        'Leading vs trailing edge?',
        'Which would you use for infinite scroll?',
      ],
    },
    {
      id: 'where-would-you-use-each-in-a-react-app',
      question: 'Where would you use each in a React app?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react'],
      answer: `> Debounce an API search-as-you-type input so we don’t hit the backend on every keystroke. Throttle a scroll listener that updates a sticky header or infinite-scroll check.`,
      analogy: `Debounce is waiting for someone to finish their sentence before replying; throttle is nodding along at a steady pace while they keep talking.`,
      quickRevision: [
        'Debounce: search-as-you-type, form auto-save, window resize',
        'Throttle: scroll position, infinite scroll checks, drag handlers',
        'Create it once (`useMemo`/`useRef`) or use `useDebounce(value)`',
        'Cancel on unmount to avoid setState after unmount',
      ],
      followUps: [
        'Write a `useDebounce` hook.',
        'Why does `debounce(fn)` inside the component body not work?',
      ],
    },
    {
      id: 'implement-debounce-talk-through-it',
      question: 'Implement debounce (talk through it).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['javascript'],
      answer: `> Keep a timer variable in a closure. On each call, clear the previous timer and start a new one. When the delay elapses without new calls, invoke the original function with the latest arguments and correct \`this\`.`,
      analogy: `Every new keystroke tears up the previous "send" note and writes a fresh one with a new timer; only the last note survives long enough to be sent.`,
      quickRevision: [
        'Keep `timer` in a closure',
        'Each call: `clearTimeout(timer)` then `setTimeout(...)`',
        'Preserve `this` and the latest args: `fn.apply(this, args)`',
        'Add `cancel()` for cleanup; optional `leading` flag',
      ],
      followUps: [
        'Now implement throttle.',
        'How would you add a `flush()` method?',
        'How do you use it safely in React?',
      ],
    },
  ],
});
