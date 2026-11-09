import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Salary & Logistics',
  description: 'Salary expectations, notice period, remote work and questions to ask them.',
  questions: [
    {
      id: 'career-salary-expectation',
      question: 'What is your salary expectation?',
      section: 'Logistics & salary',
      perspective: 'behavioral',
      difficulty: 'hard',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `Research the market range for the role and level **before** the call, then give a **range** whose bottom is a number you'd genuinely accept:

> Based on my experience and the scope of this role, I'm looking for something in the range of **XXXX to YYYY** per month. I'm open to discussing it based on the overall package and growth opportunities.

If they ask **first** and you haven't heard their budget:

> I'd like to understand the role and responsibilities a bit more first. Could you share the budgeted range for this position? I'm sure we can find something that works.

If they say your range is too high:

> I understand. I'm flexible for the right role, especially with a clear growth path and a review after six months. What range did you have in mind?`,
      variants: [
        { label: 'Remote / international (USD)', answer: `For a remote role with an international team, I'm looking for **USD XXXX–YYYY per month**, depending on the scope and whether it's full-time employment or a contract.` },
        { label: '"Is it negotiable?"', answer: 'Yes, I\'m flexible depending on the role scope, growth opportunity and total package.' },
      ],
      analogy: `Like naming a price when selling something you value: know the market price beforehand, name a range with your real minimum at the bottom, and leave room to talk. Saying "anything is fine" tells them you'll accept the lowest offer.`,
      quickRevision: [
        'XXXX = lowest you\'d accept · YYYY = top of range',
        'Research the market range before every call',
        'Give a range, not one number',
        'Mention flexibility: package, growth, review',
      ],
      avoid: [
        'Saying "anything is fine"',
        'Giving a range whose bottom you wouldn\'t actually accept',
        'Raising salary before they do in the first minutes',
      ],
      followUps: [
        'Is that negotiable?',
        'Is that gross or net?',
        'What currency are you expecting?',
      ],
    },
    {
      id: 'career-current-salary',
      question: 'What is your current salary?',
      section: 'Logistics & salary',
      perspective: 'behavioral',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['behavioral'],
      answer: `You can share it or redirect. Redirecting politely is common and acceptable:

> I'd prefer to focus on the value I can bring to this role and the market range for it. My expectation is **XXXX–YYYY**.

If you're comfortable sharing, or they insist:

> I'm currently on a contract at **ZZZZ** per month. For a full-time role with this scope, I'm looking for **XXXX–YYYY**.`,
      analogy: `When a buyer asks what you paid for your car, the answer that matters is what the car is worth today. Your current pay is history; your expectation is about this role.`,
      quickRevision: [
        'ZZZZ = current pay (share only if comfortable)',
        'Default: redirect to expectation XXXX–YYYY',
        'Contract vs full-time packages differ; say so',
      ],
      avoid: [
        'Inventing a number',
        'Getting defensive',
      ],
      followUps: [
        'Why do you expect more than you earn now?',
        'Do you have other offers?',
      ],
    },
    {
      id: 'career-notice-period',
      question: 'What is your notice period? When can you join?',
      section: 'Logistics & salary',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `> I'm on a contract, so I can **join immediately**. I'd just like to give my current client a short, professional handover, which I can do in parallel or within the first few days if needed.

Mention it confidently: being available now is a real advantage.`,
      analogy: `Like a taxi that's already free: you don't need to wait for it to drop someone off first. Just say it plainly.`,
      quickRevision: [
        'Available immediately (contract)',
        'Offer a short, professional handover',
        'State it as an advantage',
      ],
      followUps: [
        'Can you start next Monday?',
        'Do you have any planned leave?',
      ],
    },
    {
      id: 'career-remote-onsite',
      question: 'Are you comfortable working remotely, hybrid or onsite? What about time zones?',
      section: 'Logistics & salary',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['behavioral'],
      answer: `> I've worked **remotely for nearly four years**: with a Dubai-based team at SmartCrowd and now on a remote contract with Firmwide. I'm comfortable with async communication: I write clear updates, raise blockers early, document decisions in tickets or PRs, and share short videos when something is easier to show than explain.
>
> I'm also happy to work **[onsite / hybrid]**, and I can adjust my hours for good overlap with the team's time zone.`,
      analogy: `Like a musician who has played in a band over video calls for years: you know how to keep time without being in the same room, and you'd also enjoy playing on stage together.`,
      quickRevision: [
        'Nearly 4 years remote (Dubai team, Firmwide)',
        'Async habits: updates, early blockers, written decisions',
        'Open to onsite/hybrid; flexible hours for overlap',
      ],
      followUps: [
        'How many hours of overlap can you offer?',
        'How do you stay productive at home?',
      ],
    },
    {
      id: 'career-questions-for-them',
      question: 'Do you have any questions for us?',
      section: 'Your questions',
      perspective: 'behavioral',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['behavioral'],
      answer: `**Always say yes.** Ask two or three; pick based on who's interviewing you.

**For an engineer or manager:**
- What would success look like for this role in the first three to six months?
- How does a feature go from idea to production here: reviews, testing, deployment?
- What's the biggest technical challenge the team is facing right now?
- How do engineers grow here: mentoring, code reviews, a path to senior?

**For a recruiter or talent platform:**
- What kinds of clients or teams would my profile fit best?
- What does the process look like after this conversation?
- Is there anything in my CV I should strengthen for your clients?
- Is it full-time or contract, and what time-zone overlap do clients usually expect?`,
      analogy: `The interview is a two-way date. Asking good questions shows you're choosing them as carefully as they're choosing you, and it tells you whether you'd actually be happy there.`,
      quickRevision: [
        'Always ask 2–3',
        'Engineer: success in 90 days, delivery process, challenges, growth',
        'Recruiter: best-fit clients, next steps, CV gaps',
        'Salary questions only after they raise it',
      ],
      avoid: [
        '"No, I think you covered everything"',
        'Questions answered on their homepage',
        'Only asking about salary and leave',
      ],
      followUps: [
        '(They may ask what you think of their answers; be genuine.)',
        'Is there anything that concerns you about the role?',
      ],
    },
  ],
});
