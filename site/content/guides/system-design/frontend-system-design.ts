import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Frontend System Design',
  description: 'Designing large SPAs, component libraries, feeds and real-time UIs.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'frontend/react-live-coding/infinite-scroll-with-intersectionobserver',
    'frontend/architecture-testing/designing-a-reusable-component',
    'frontend/architecture-testing/how-do-you-structure-a-large-react-app',
  ],
  questions: [
    {
      id: 'autocomplete-typeahead',
      question: 'Design an autocomplete / typeahead search box.',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['system-design'],
      answer: `- Debounce input (~300ms) and set a minimum number of characters.
- Cancel stale requests with AbortController, or ignore results that don't match the latest query.
- Cache results per query in a \`Map\` or TanStack Query.
- Keyboard: up/down to move, Enter to select, Escape to close. ARIA \`combobox\` / \`listbox\` / \`aria-activedescendant\`.
- Highlight the matching text, show loading and empty states, and virtualize long lists.`,
      analogy: `A helpful shop assistant who waits until you've said a few letters, remembers answers to questions already asked, and ignores an old answer if you've since changed your question.`,
      quickRevision: [
        'Debounce ~300ms + min characters',
        'Abort/ignore stale requests',
        'Cache results per query',
        'Keyboard + ARIA combobox/listbox/aria-activedescendant',
        'Highlight matches; loading/empty states; virtualise',
      ],
      followUps: [
        'How would the backend serve suggestions fast (trie, prefix index)?',
        'How do you make it fully keyboard accessible?',
      ],
    },
    {
      id: 'real-time-notifications-ui',
      question: 'Design the frontend for real-time notifications (bell icon, unread count, live updates).',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['realtime', 'system-design'],
      answer: `I'd split it into **transport**, **state** and **UI**.

**Transport.** One **WebSocket** (or SSE, since updates are mostly server → client) per browser tab, opened once in a top-level provider and **authenticated in the handshake**. It reconnects with **exponential backoff and jitter**, and on reconnect fetches anything missed with \`GET /notifications?after=<lastId>\`, so a dropped connection never loses notifications. Optionally, one tab owns the socket and shares events with the others through a \`BroadcastChannel\`.

**State.** The REST endpoint is the source of truth, cached with **TanStack Query** (paginated list + unread count). Socket events **update that cache** (\`setQueryData\`) rather than a separate store, so the badge, dropdown and full page always agree. **Mark as read** is optimistic with rollback on error, and "mark all read" sends the last seen id.

**UI.** A bell with an unread badge (capped at "99+"), a dropdown with the latest items and a link to a full **virtualised, infinite-scroll** list. Toasts for high-priority types only, an \`aria-live="polite"\` region for screen readers, and **dedupe by notification id** since an event can arrive via both the socket and a refetch.`,
      analogy: `One radio per household tuned to your personal channel: it reconnects if the signal drops, and when it comes back it asks "what did I miss since message #42?".`,
      quickRevision: [
        'One socket/SSE per app, auth in handshake',
        'Reconnect with backoff + refetch since last id',
        'TanStack Query cache is the single state; socket updates it',
        'Optimistic mark-as-read with rollback',
        'Dedupe by id; virtualised list; aria-live',
      ],
      followUps: [
        'How do you keep the unread badge consistent across tabs?',
        'What happens to notifications sent while offline?',
        'WebSocket vs SSE vs polling here?',
      ],
    },
  ],
});
