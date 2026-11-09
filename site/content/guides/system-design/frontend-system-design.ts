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
      question: 'Autocomplete / typeahead',
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
      question: 'Real-time notifications UI',
      perspective: 'design',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['realtime', 'system-design'],
      answer: `- One socket connection per app (in a context provider), authenticated in the handshake.
- Reconnection with backoff. On reconnect, refetch missed notifications since the last ID.
- Update the TanStack Query cache from socket events, so the unread count stays consistent.
- Optimistic "mark as read", rolled back on error.`,
      analogy: `One radio per household tuned to your personal channel: it reconnects if the signal drops, and when it comes back it asks "what did I miss since message #42?".`,
      quickRevision: [
        'One socket per app (context provider), auth in handshake',
        'Reconnect with backoff; refetch since last ID',
        'Socket events update the TanStack Query cache',
        'Optimistic mark-as-read with rollback',
      ],
      followUps: [
        'How do you keep the unread badge consistent across tabs?',
        'What happens to notifications sent while offline?',
      ],
    },
  ],
});
