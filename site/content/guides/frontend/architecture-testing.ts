import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Architecture & Testing',
  description: 'Structuring large apps, reusable components and testing strategy.',
  questions: [
    {
      id: 'how-do-you-structure-a-large-react-app',
      question: 'How do you structure a large React app?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['react', 'testing'],
      answer: `I organise by **feature or domain**, not by file type. At Firmwide the frontend (~450 TypeScript files) is split into vertical slices like \`domains/proposals\`, \`domains/invoices\` and \`domains/auth\`. Each owns its **components, hooks, API calls, types and tests**.

- **Shared** code (UI primitives, utilities, the HTTP client) lives in \`shared/\`.
- **ESLint import boundaries** (\`no-restricted-imports\`) stop domains reaching into each other's internals. They go through a public \`index.ts\`.
- **Server state** goes through TanStack Query hooks per domain, and client state stays local or in a small store.
- **Routes** are lazy-loaded per domain.

The result: features are easy to find, changes stay local, and new developers can own a domain.`,
      variants: [
        { label: 'Short version', answer: `Feature-based / vertical slices (your Firmwide app): each domain owns its components, hooks, API calls and types, with ESLint import boundaries between them.` },
      ],
      analogy: `A department store organised by department (shoes, electronics), each with its own staff and stockroom, rather than one giant warehouse sorted by "all shelves", "all boxes", "all price tags".`,
      quickRevision: [
        'Feature/domain folders (vertical slices)',
        'Each domain owns UI, hooks, API, types',
        'Shared primitives in shared/',
        'ESLint import boundaries + public index',
        'Lazy-loaded routes per domain',
      ],
      followUps: [
        'How do domains share data?',
        'How did you migrate an existing app to this structure?',
        'Monorepo or single repo?',
      ],
    },
    {
      id: 'designing-a-reusable-component',
      question: 'How do you design a reusable component (for example, for a component library)?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['testing'],
      answer: `I design the **API first**:

- a **small, predictable props API** with good defaults;
- **composition over configuration** (\`children\`, slots, compound components like \`<Tabs><Tabs.List/></Tabs>\`) instead of 30 boolean props;
- **controlled and uncontrolled** modes (\`value\`/\`onChange\` or \`defaultValue\`);
- **accessible by default**: semantics, keyboard support, focus and ARIA (or build on Radix);
- pass-through of native props and \`ref\`, and **styling hooks** (\`className\`, variants);
- **documentation** with Storybook stories.

At SmartCrowd I built 20+ reusable components this way, which cut duplicated UI code by about 35%.`,
      variants: [
        { label: 'Short version', answer: `Small props API, composition over config, accessible by default, controlled and uncontrolled support, docs or Storybook.` },
      ],
      analogy: `Designing LEGO bricks instead of a glued model: a few well-shaped pieces that snap together in many ways beat one piece with a switch for every possible use.`,
      quickRevision: [
        'Small props API, good defaults',
        'Composition over config',
        'Controlled + uncontrolled',
        'Accessible, forwards ref + native props',
        'Documented (Storybook)',
      ],
      followUps: [
        'What is a compound component?',
        'How do you version a shared component library?',
      ],
    },
    {
      id: 'react-error-handling',
      question: 'How do you handle errors in a React application?',
      perspective: 'practical',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react', 'nextjs'],
      answer: `In layers:

- **Error boundaries** catch errors thrown **while rendering** a subtree and show a fallback instead of a blank screen. I put them around routes and risky widgets, not just one at the root, so a broken chart doesn't take down the whole page. (In Next.js App Router, \`error.tsx\` is a boundary per route segment.)
- Error boundaries **don't catch** errors in event handlers, async code or \`setTimeout\`. Those I handle with \`try/catch\`, or through the data layer: TanStack Query exposes \`error\` states and retries.
- **API errors** go through one HTTP client that maps status codes to user-friendly messages, refreshes tokens on 401 and shows toasts. Forms map 422 validation errors to fields.
- **User-facing states**: every data view has loading, error (with retry) and empty states.
- **Monitoring**: Sentry or LogRocket report errors with user context and the release version, so production issues show up before users report them.`,
      analogy: `Circuit breakers in a house. One faulty appliance trips the breaker for its room (error boundary), not the whole building. For things the breakers can't see, like a leaking tap (async errors), you need a separate check, and a smoke alarm that calls you (monitoring).`,
      quickRevision: [
        'Error boundaries catch render errors only',
        'Not caught: event handlers, async, timeouts → try/catch / query `error`',
        'Place boundaries per route/widget; Next.js `error.tsx`',
        'Central API client: map statuses, refresh on 401, field errors on 422',
        'Always: loading / error+retry / empty states; Sentry in production',
      ],
      followUps: [
        'Why must error boundaries be class components (or a library)?',
        'How do you handle an expired access token mid-session?',
      ],
    },
    {
      id: 'auth-in-a-spa-where-to-store-the-token',
      question: 'Auth in a SPA: where to store the token?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['auth-security', 'testing'],
      answer: `Anything in \`localStorage\` can be read by **any script on the page**, so one XSS bug can steal it. I prefer:

- **refresh token** in an **httpOnly, Secure, SameSite** cookie, which JavaScript can't read;
- **access token** kept **in memory** (short-lived), refreshed silently via the cookie on load and on 401.

Because cookies are sent automatically, I protect state-changing requests against **CSRF** (\`SameSite\`, CSRF tokens, or requiring a custom header). Route guards in the UI are only for UX; the **API enforces** every permission. At Firmwide I also made the refresh **single-flight**, so parallel 401s don't log users out.`,
      variants: [
        { label: 'Short version', answer: `Prefer an httpOnly, Secure, SameSite cookie (safer against XSS) over localStorage. Use route guards for UX, but the API enforces access.` },
      ],
      analogy: `Keep the master key (refresh token) in a safe that the house guests can't open (httpOnly cookie), and carry only a short-lived day pass (access token) in your pocket.`,
      quickRevision: [
        'localStorage is readable by XSS',
        'Refresh token: httpOnly + Secure + SameSite cookie',
        'Access token: in memory, short-lived',
        'Protect against CSRF',
        'UI guards = UX; API enforces',
      ],
      followUps: [
        'How does silent refresh work on page load?',
        'What is CSRF and how does SameSite help?',
      ],
    },
    {
      id: 'testing-pyramid-for-frontend',
      question: 'What does a testing pyramid look like for a frontend app?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['testing'],
      answer: `From many and cheap to few and expensive:

1. **Unit tests** (Vitest/Jest) for pure utilities, hooks and reducers.
2. **Component and integration tests** with **React Testing Library**: render a component with realistic data (MSW for API mocks) and test **what the user sees and does**, not implementation details. This is where most of my effort goes.
3. **End-to-end tests** with **Playwright** for critical journeys (login, checkout, invoice generation) in CI.

Plus **static checks** (TypeScript, ESLint) and **accessibility checks** (axe). My AI Mock Interview Coach project has 244 Vitest tests and 11 Playwright specs, including WCAG checks.`,
      variants: [
        { label: 'Short version', answer: `Unit (utilities, hooks), component (React Testing Library), E2E (Playwright: you have this in SmartJobHub).` },
      ],
      analogy: `Checking a car: test each part on the bench (unit), test the engine assembled (integration), then take a few real test drives (E2E). You can't afford a test drive for every bolt.`,
      quickRevision: [
        'Unit: utils, hooks, reducers',
        'Integration: RTL + MSW, test user behaviour',
        'E2E: Playwright for critical flows',
        'Plus TS, ESLint, axe accessibility checks',
      ],
      followUps: [
        'Why avoid testing implementation details?',
        'How do you keep E2E tests from being flaky?',
      ],
    },
    {
      id: 'accessibility-basics',
      question: 'What accessibility basics do you make sure every UI has?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['testing', 'css-browser'],
      answer: `Start with **semantic HTML**, because native elements give accessibility for free: \`button\` for actions, \`a\` for navigation, real \`label\`s for inputs, headings in order. Then:

- **keyboard support**: everything reachable and usable with Tab, Enter and Escape, with visible focus;
- **focus management** in modals (trap focus, return it on close);
- **ARIA only when needed** (\`aria-expanded\`, \`aria-live\`), never to replace semantics;
- sufficient **colour contrast**, and never colour alone to show meaning;
- **alt text** for meaningful images.

I check with axe and keyboard-only testing. My recent projects include automated WCAG 2.1 AA checks in Playwright.`,
      variants: [
        { label: 'Short version', answer: `Semantic HTML, labels, keyboard navigation, focus management, ARIA only when needed, colour contrast.` },
      ],
      analogy: `Building ramps, clear signs and lifts into a building from the start instead of adding them after someone gets stuck at the door.`,
      quickRevision: [
        'Semantic HTML first',
        'Keyboard + visible focus',
        'Focus management in dialogs',
        'ARIA only when needed',
        'Contrast, alt text; test with axe',
      ],
      followUps: [
        'How do you make a custom dropdown accessible?',
        'What is `aria-live` for?',
      ],
    },
  ],
});
