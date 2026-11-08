/**
 * Technology tags inferred from question text, section heading and file name.
 * Add a line here to teach the site a new technology.
 */
const TAG_RULES: [tag: string, pattern: RegExp][] = [
  ['react', /\breact\b|\bjsx\b|\bhooks?\b|\breconciliation\b|virtual dom|\bredux\b|\bzustand\b|\buse(state|effect|layouteffect|memo|callback|ref|reducer|context|transition|fetch|debounce|previous|localstorage)\b/i],
  ['nextjs', /next\.?js|\bssr\b|\bssg\b|\bisr\b|app router|server components?|hydration/i],
  ['typescript', /typescript|\bgenerics?\b|\btype guard|\binterface vs type|\bzod\b/i],
  ['javascript', /javascript|\bclosures?\b|hoisting|prototype|\bthis\b|coercion|promise|async|await|event loop|debounc|throttl|\bes6\b|arrow function|polyfill|\bvar\b|\blet\b|deep (clone|equal)|flatten|memoi[sz]e|\bcurry|event emitter|promisify|\bsleep\b|backoff|\bget\(obj|output prediction|references?\b/i],
  ['nodejs', /\bnode(\.?js)?\b|libuv|nexttick|setimmediate|worker threads?|\bcluster\b|\bnpm\b/i],
  ['express', /\bexpress\b|middleware|\breq\b|\bres\b|res\.send/i],
  ['api-design', /\brest\b|graphql|\bapi\b|idempoten|pagination|rate limit|versioning/i],
  ['auth-security', /\bauth|\bjwt\b|oauth|\bsso\b|\bcsrf\b|\bxss\b|\bcors\b|password|security|token/i],
  ['sql', /\bsql\b|db migration|\bjoins?\b|subquer|normaliz|\bacid\b|transaction|\bindex(es|ing)?\b|deadlock|row.level|isolation level|postgres|mysql/i],
  ['mongodb', /mongo|mongoose|aggregation|pipeline aggregation/i],
  ['redis', /\bredis\b/i],
  ['caching', /\bcach(e|ing)\b|\bttl\b|invalidat/i],
  ['realtime', /websocket|socket\.io|\bsse\b|real.time|pub\/?sub|long polling/i],
  ['docker', /docker|\bcontainers?\b(?! with most water)/i],
  ['kubernetes', /kubernetes|\bk8s\b|\bpods?\b|configmap|helm/i],
  ['aws', /\baws\b|\bs3\b|\bec2\b|lambda|cloudwatch|\biam\b|\becs\b|\brds\b/i],
  ['ci-cd', /\bci\/?cd\b|github actions|\bci pipeline|deploy|\bgit\b|\bsecret was committed/i],
  ['infrastructure-as-code', /terraform|ansible|\biac\b|plan vs apply|\bdrift\b|\bmodules\?|staging vs production/i],
  ['linux-networking', /\blinux\b|disk is full|slow only sometimes|\bdns\b|\btcp\b|\bhttp(s|\/2)?\b|nginx|load balanc|reverse proxy|\btls\b/i],
  ['testing', /\btest(s|ing)?\b|jest|vitest|playwright|cypress|supertest|mocking|\bmsw\b|\bnock\b/i],
  ['performance', /performance|optimi[sz]|lazy load|code split|memo|core web vitals|\blcp\b|bundle/i],
  ['css-browser', /\bcss\b|flexbox|css grid|specificity|\bdom\b|localstorage|cookies?|browser|accessib|a11y/i],
  ['system-design', /design (a|an|the)\b|system design|scal(e|ing|ability)|sharding|replica|queue|kafka|url shortener|news feed|rate limiter/i],
  ['dsa', /\bdsa\b|algorithm|two sum|anagram|palindrome|kadane|subarray|parenthes|\bstack\b|islands|intervals|dynamic programming|climbing stairs|coin change|substring|compression|reverse words|unique character|contains duplicate|\bbst\b|two pointers|sliding window|binary search|linked list|\btree\b|\bgraph\b|big.?o|complexity|lru/i],
  ['behavioral', /tell me about|conflict|weakness|strength|why (do you|are you|this|did you)|where do you see/i],
];

export function inferTags(...texts: (string | undefined)[]): string[] {
  const haystack = texts.filter(Boolean).join(' \n ');
  const tags = new Set<string>();
  for (const [tag, re] of TAG_RULES) if (re.test(haystack)) tags.add(tag);
  return [...tags];
}

export const TAG_LABELS: Record<string, string> = {
  react: 'React',
  nextjs: 'Next.js',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  nodejs: 'Node.js',
  express: 'Express',
  'api-design': 'API design',
  'auth-security': 'Auth & security',
  sql: 'SQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  caching: 'Caching',
  realtime: 'Real-time',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  'ci-cd': 'CI/CD',
  'infrastructure-as-code': 'Terraform & IaC',
  'linux-networking': 'Linux & networking',
  testing: 'Testing',
  performance: 'Performance',
  'css-browser': 'CSS & browser',
  'system-design': 'System design',
  dsa: 'DSA',
  behavioral: 'Behavioral',
  debugging: 'Debugging',
};

export const tagLabel = (slug: string) =>
  TAG_LABELS[slug] ?? slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
