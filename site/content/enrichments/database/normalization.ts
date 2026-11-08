import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('database/normalization.md', {
  'what-is-normalization': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'Storing each contact\'s address once in your phonebook and referring to it, instead of writing it on every letter. Change it once and it\'s right everywhere.',
    quickRevision: ['Split data to remove duplication', 'Each fact stored once', 'Prevents update/insert/delete anomalies', '1NF → 2NF → 3NF; 3NF is the usual target'],
    followUps: ['Explain 1NF, 2NF and 3NF briefly.', 'What is an update anomaly?'],
  },
  'what-is-denormalization': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'Writing a friend\'s name on the party invitation as well as keeping it in the address book: faster to read, but if they change their name you must update both.',
    quickRevision: ['Deliberately duplicate data for read speed', 'Fewer JOINs on hot read paths', 'Cost: sync work, stale copies', 'Often a copy/view, not the source of truth'],
    followUps: ['How do you keep denormalised copies in sync?', 'Materialised views vs denormalised columns?'],
  },
  'for-a-linkedin-like-job-platform-normalize-denormalize-or-hybrid': {
    difficulty: 'medium',
    frequency: 'medium',
    analogy: 'A shop keeps one accurate stock ledger (normalised) but also prints a fast "today\'s best sellers" board (denormalised) for customers.',
    quickRevision: ['Hybrid', 'Normalised core: users, companies, jobs, applications', 'Denormalised read models: feeds, counts, search index', 'Sync via events/jobs'],
    followUps: ['Which data would you denormalise first?', 'How would you keep applicant counts accurate?'],
  },
  'if-we-denormalize-for-performance-why-do-we-still-need-joins': {
    difficulty: 'medium',
    analogy: 'A cheat sheet speeds up the exam questions you expected, but you still need the full textbook for everything else.',
    quickRevision: ['Source of truth stays normalised', 'Denormalised data is a copy for specific reads', 'Ad-hoc/admin/report queries still JOIN', 'Full denormalisation = update complexity + staleness'],
    followUps: ['How do you rebuild a denormalised copy if it drifts?', 'Where does CQRS fit here?'],
  },
  'how-do-normalization-indexing-and-caching-work-together': {
    difficulty: 'medium',
    analogy: 'A well-organised library (normalisation), a good catalogue (indexes), and a shelf of popular books by the entrance (cache): each solves a different part of finding books fast.',
    quickRevision: ['Normalisation: correctness, no duplication', 'Indexes: fast queries on that structure', 'Caching: skip the DB for hot reads', 'Denormalise selectively for hot paths'],
    followUps: ['In what order would you apply these to a slow app?', 'Which one introduces staleness?'],
  },
});
