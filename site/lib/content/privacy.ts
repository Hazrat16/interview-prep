import type { PrivacyFlag } from './types';

/** Generic patterns that may indicate personal or confidential data. */
const GENERIC_RULES: [rule: string, re: RegExp][] = [
  ['email', /[\w.+-]+@[\w-]+\.[\w.-]+/g],
  ['phone', /(?:\+?\d[\d\s-]{8,}\d)/g],
  ['money', /(?:\b(?:BDT|USD|Tk|৳)\s?\d[\d,.]*k?|\$\s?\d[\d,.]*k?\b|\b\d[\d,.]*\s?(?:lakh|LPA|k\/month|per month)\b)/gi],
  ['commit-hash', /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/g],
  ['ip-address', /\b\d{1,3}(?:\.\d{1,3}){3}\b/g],
  ['secret-like', /\b(?:sk|pk|ghp|gho|AKIA)[A-Za-z0-9_-]{12,}\b/g],
  ['confidential', /\b(?:confidential|internal only|NDA|do not share|proprietary)\b/gi],
];

export function scanPrivacy(markdown: string, flagTerms: string[]): PrivacyFlag[] {
  const flags: PrivacyFlag[] = [];
  const termRules: [string, RegExp][] = flagTerms.map((t) => [
    `term:${t}`,
    new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
  ]);
  const lines = markdown.split('\n');
  let inFence = false;
  lines.forEach((text, i) => {
    if (/^\s*(```|~~~)/.test(text)) inFence = !inFence;
    // Inline code (`1 4 6 3 5 2`) is sample output, not personal data.
    const prose = text.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
    for (const [rule, re] of [...GENERIC_RULES, ...termRules]) {
      const subject = rule.startsWith('term:') ? text : prose;
      // Code samples legitimately contain hashes/IPs/phone-like numbers.
      if (inFence && !rule.startsWith('term:') && rule !== 'secret-like' && rule !== 'email') continue;
      re.lastIndex = 0;
      for (const m of subject.matchAll(re)) {
        flags.push({
          line: i + 1,
          rule,
          match: m[0],
          excerpt: text.trim().slice(0, 160),
        });
      }
    }
  });
  return flags;
}
