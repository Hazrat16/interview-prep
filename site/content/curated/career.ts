import { defineQuestions } from '../../lib/content/curated-schema';

export default defineQuestions([
  {
    id: 'behavioral-hardest-bug',
    question: 'Tell me about the most difficult bug you have fixed.',
    category: 'career',
    perspective: 'behavioral',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['behavioral', 'debugging'],
    answer: `They're checking **how you think**: do you find the root cause or just patch symptoms, do you understand the system, and do you stop it from happening again? Use **STAR**, and spend most of your time on the **Action**:

1. **Situation** (1–2 sentences): the system and the impact. *"Users were randomly logged out with 401 errors, only in production."*
2. **Task**: your responsibility. *"I owned the frontend auth flow."*
3. **Action**, step by step:
   - how you **reproduced** it;
   - what you **measured** (logs, network tab, Sentry);
   - the **hypotheses you ruled out**;
   - the **root cause**: *"several requests got 401 at the same moment and each triggered its own token refresh. The refresh tokens rotated, so all but one failed and logged the user out."*
4. **Result**: the fix (*a single shared refresh promise and a request queue*), a number if you have one, and **prevention**: a test, monitoring, documentation.

Close with **what you learned**. Prepare 2–3 real bugs: one frontend, one backend or data, one production incident.`,
    analogy: `Tell it like a detective story: the crime (symptom), the clues you gathered, the suspects you cleared, the culprit (root cause), and how you changed the locks so it can't happen again.`,
    quickRevision: [
      'STAR; most time on Action',
      'Show: reproduce → measure → hypotheses → root cause',
      'Root cause, not symptom patch',
      'Result with a number + prevention (test, alert, docs)',
      'Keep it to about 2 minutes; prepare 2–3 stories',
    ],
    followUps: [
      'How did you know it was really fixed?',
      'What would you do differently next time?',
      'How did you communicate it to the team or users?',
    ],
  },
]);
