import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/debounce-throttle.md', {
  'debounce-vs-throttle': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: 'Debounce is a lift door that waits until people stop walking in; throttle is a bus that leaves every 10 minutes no matter how many people keep arriving.',
    quickRevision: [
      'Debounce: run **after** calls stop for X ms',
      'Throttle: run **at most once** every X ms',
      'Debounce → search input, auto-save, resize end',
      'Throttle → scroll, mousemove, drag, analytics pings',
    ],
    followUps: ['Implement both.', 'Leading vs trailing edge?', 'Which would you use for infinite scroll?'],
  },
  'where-would-you-use-each-in-a-react-app': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'Debounce is waiting for someone to finish their sentence before replying; throttle is nodding along at a steady pace while they keep talking.',
    quickRevision: [
      'Debounce: search-as-you-type, form auto-save, window resize',
      'Throttle: scroll position, infinite scroll checks, drag handlers',
      'Create it once (`useMemo`/`useRef`) or use `useDebounce(value)`',
      'Cancel on unmount to avoid setState after unmount',
    ],
    followUps: ['Write a `useDebounce` hook.', 'Why does `debounce(fn)` inside the component body not work?'],
  },
  'implement-debounce-talk-through-it': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: 'Every new keystroke tears up the previous "send" note and writes a fresh one with a new timer; only the last note survives long enough to be sent.',
    quickRevision: [
      'Keep `timer` in a closure',
      'Each call: `clearTimeout(timer)` then `setTimeout(...)`',
      'Preserve `this` and the latest args: `fn.apply(this, args)`',
      'Add `cancel()` for cleanup; optional `leading` flag',
    ],
    followUps: ['Now implement throttle.', 'How would you add a `flush()` method?', 'How do you use it safely in React?'],
  },
});
