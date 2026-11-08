/**
 * Public-safe facts shown at the top of the Career page. Keep them in sync
 * with the CV you send. No contact details, client names or salary numbers.
 */
export const careerProfile = {
  facts: [
    { label: 'Experience', value: 'Nearly 4 years', detail: 'Production since Dec 2022' },
    { label: 'Now', value: 'Firmwide · PriceEstimator.ai', detail: 'Full-stack, contract, remote · since May 2026' },
    { label: 'Before', value: 'SmartCrowd (Dubai)', detail: 'Dec 2022 – Apr 2026 · promoted Mar 2025' },
    { label: 'Availability', value: 'Immediately', detail: 'Contract, short handover' },
    { label: 'Looking for', value: 'Long-term, full-time', detail: 'Full-stack · Frontend · DevOps' },
    { label: 'Education', value: 'B.Sc. ICT, MBSTU', detail: '2022 · CGPA 3.53' },
  ],
  proofPoints: [
    'Promoted junior → Software Engineer (Mar 2025)',
    'Led the Share Transfer Facility, zero major post-release issues',
    'Cut initial load time by 30–45%',
    '20+ reusable components, ~35% less duplicated UI',
    'Primary frontend engineer on a ~450-file TypeScript app',
    'CI/CD with GitHub Actions, Docker, Nginx; Terraform on AWS in projects',
  ],
  placeholders: [
    { token: 'XXXX', meaning: 'Lowest number you would genuinely accept' },
    { token: 'YYYY', meaning: 'Top of your range (ask for this)' },
    { token: 'ZZZZ', meaning: 'Current pay; share only if comfortable' },
  ],
};
