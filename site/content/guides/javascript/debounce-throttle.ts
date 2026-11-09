import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Debounce & Throttle',
  description: 'When to use each, how to implement them and where they show up in real UIs.',
  questions: [
    {
      id: 'debounce-vs-throttle',
      question: 'What is the difference between debounce and throttle, and when would you use each?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['javascript', 'performance'],
      answer: `Both limit how often a function runs during a burst of events, but they decide differently:

- **Debounce** waits until the events **stop**. Every new call resets the timer, and the function runs once, **\`wait\` ms after the last call**. If the user keeps typing, it never fires until they pause.
- **Throttle** runs the function **at most once every \`interval\` ms** while events keep coming. You get regular updates during the burst, not just one at the end.

So the choice is about whether you need the **final value** or **ongoing updates**:

- **Debounce**: search-as-you-type, form auto-save, validating a field, recalculating layout when resizing ends.
- **Throttle**: scroll position and sticky headers, infinite-scroll checks, drag and \`mousemove\` handlers, analytics pings, rate-limiting a button.

Both have **leading/trailing** options: leading fires on the first call immediately, trailing fires at the end. Lodash's versions support both, and a throttle is really a debounce with a \`maxWait\`.`,
      analogy: `Debounce is a lift door that waits until people stop walking in; throttle is a bus that leaves every 10 minutes no matter how many people keep arriving.`,
      quickRevision: [
        'Debounce: run **after** calls stop for X ms',
        'Throttle: run **at most once** every X ms',
        'Debounce → search input, auto-save, resize end',
        'Throttle → scroll, mousemove, drag, infinite scroll',
        'Leading = fire on first call; trailing = fire at the end',
      ],
      followUps: [
        'Implement both.',
        'What do leading and trailing edge mean?',
        'Which would you use for infinite scroll, and why?',
      ],
    },
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
      deepDive: `\`\`\`js
// With a leading option and flush()
function debounce(fn, wait = 300, { leading = false } = {}) {
  let timer, lastArgs, lastThis;
  function invoke() {
    fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = undefined;
  }
  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const callNow = leading && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      if (!leading && lastArgs) invoke();
    }, wait);
    if (callNow) invoke();
  }
  debounced.cancel = () => { clearTimeout(timer); timer = lastArgs = undefined; };
  debounced.flush = () => { if (timer && lastArgs) { clearTimeout(timer); timer = undefined; invoke(); } };
  return debounced;
}
\`\`\``,
      followUps: [
        'Now implement throttle.',
        'Write a `useDebounce(value, delay)` hook.',
        'How would you add a `flush()` method?',
      ],
    },
    {
      id: 'implement-throttle',
      question: 'Implement throttle.',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['javascript'],
      answer: `Throttle runs the function **at most once per \`interval\`**. The simplest version records **when it last ran** and ignores calls until the interval has passed:

\`\`\`js
function throttle(fn, interval = 200) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}
\`\`\`

That's a **leading-edge** throttle: it fires on the first call, then drops calls during the interval. The weakness is that the **last call in a burst can be lost**. For scroll handlers that means the final scroll position is never processed.

So in an interview I'd then add a **trailing call**: if a call arrives during the cooldown, remember its arguments and schedule one run at the end of the interval (see "Go deeper"). And as with debounce, I'd preserve \`this\`/arguments, add \`cancel()\`, and create it once in React.

For pure visual work tied to scrolling, \`requestAnimationFrame\` is often a better throttle, since it runs once per frame.`,
      analogy: `A bus that leaves every 10 minutes: people arriving in between don't make it leave sooner, and with a trailing call, the last person who arrives still gets the next bus.`,
      quickRevision: [
        'Track the last run time; skip calls inside the interval',
        'Leading-only throttle can drop the final call',
        'Add a trailing call with a timer for the last arguments',
        'Preserve `this`/args; add `cancel()`',
        'Scroll visuals: `requestAnimationFrame` as a throttle',
      ],
      deepDive: `\`\`\`js
function throttle(fn, interval = 200) {
  let last = 0;
  let timer = null;
  let pendingArgs, pendingThis;

  function run() {
    last = Date.now();
    timer = null;
    fn.apply(pendingThis, pendingArgs);
  }

  function throttled(...args) {
    pendingArgs = args;
    pendingThis = this;
    const remaining = interval - (Date.now() - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      run();                                   // leading edge
    } else if (!timer) {
      timer = setTimeout(run, remaining);      // trailing edge with the latest args
    }
  }
  throttled.cancel = () => { clearTimeout(timer); timer = null; };
  return throttled;
}

window.addEventListener('scroll', throttle(() => updateHeader(window.scrollY), 100));
\`\`\``,
      followUps: [
        'What is the difference between leading and trailing edge?',
        'How is throttling with `requestAnimationFrame` different?',
        'Write throttle on top of debounce with `maxWait`.',
      ],
    },
    {
      id: 'where-would-you-use-each-in-a-react-app',
      question: 'How do you use debounce or throttle correctly in a React component?',
      perspective: 'practical',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react', 'javascript'],
      answer: `The common bug is calling \`debounce(fn)\` **directly in the component body**. Every render creates a **new** debounced function with its own timer, so the delay never accumulates and the function fires on every keystroke anyway.

Two patterns that work:

1. **Debounce the value, not the function.** A \`useDebounce(value, delay)\` hook keeps a debounced copy of the state, and an effect or a query uses that. This is my default for search-as-you-type: the input stays instant, the API call waits.
2. **Create the debounced function once** with \`useMemo\` or \`useRef\`, and **cancel it on unmount** so it can't call \`setState\` on an unmounted component. If the callback needs fresh props, read them through a ref to avoid a stale closure.

For a search box I'd also **cancel in-flight requests** (an \`AbortController\` or a query library like TanStack Query, which keys requests by the debounced term) so an old slow response can't overwrite a newer one. For scroll or resize I throttle, often with \`requestAnimationFrame\`, or skip JS entirely with \`IntersectionObserver\` for infinite scroll.`,
      analogy: `Debounce is waiting for someone to finish their sentence before replying; throttle is nodding along at a steady pace while they keep talking.`,
      quickRevision: [
        '`debounce(fn)` in the render body = new timer every render (bug)',
        'Prefer `useDebounce(value)` for search inputs',
        'Or create once with `useMemo`/`useRef` and cancel on unmount',
        'Abort stale requests so old responses don\'t win',
        'Infinite scroll: `IntersectionObserver` instead of scroll events',
      ],
      deepDive: `\`\`\`jsx
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);   // reset on every change + unmount
  }, [value, delay]);
  return debounced;
}

function Search() {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebounce(term, 300);
  const { data } = useQuery({
    queryKey: ['search', debouncedTerm],
    queryFn: ({ signal }) => fetch(\`/api/search?q=\${debouncedTerm}\`, { signal }).then((r) => r.json()),
    enabled: debouncedTerm.length > 1,
  });
  return <input value={term} onChange={(e) => setTerm(e.target.value)} />;
}
\`\`\``,
      followUps: [
        'Write a `useDebounce` hook.',
        'Why does `debounce(fn)` inside the component body not work?',
        'How do you prevent an old search response from overwriting a newer one?',
      ],
    },
  ],
});
