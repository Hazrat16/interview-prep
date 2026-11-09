import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Auth & Security',
  description: 'Sessions vs JWT, OAuth, password storage, CSRF, XSS and API hardening.',
  /** Asked here too; answered in another guide. */
  alsoAsked: [
    'frontend/browser-css/what-is-cors',
  ],
  questions: [
    {
      id: 'session-vs-jwt',
      question: 'Session cookies vs JWTs: how do they differ, and which would you use?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['auth-security'],
      answer: `- **Server sessions**: the server stores the session (in Redis or the DB) and the client holds an opaque **session ID cookie**. **Easy to revoke** (delete the session) and nothing sensitive is on the client, but every request needs a session lookup and shared storage across instances.
- **JWT**: a **signed, self-contained token** with claims. It's verified **without a lookup** (stateless), which suits multiple services and mobile clients. But it's **hard to revoke** before expiry and is bigger to send.

So with JWTs I keep **access tokens short-lived** and add **refresh tokens** stored server-side (hashed), which can be revoked. For a single web app, sessions are often the simpler and safer choice.`,
      variants: [
        { label: 'Short version', answer: `Session: state on the server, easy to revoke. JWT: stateless and signed, hard to revoke, so use short expiry plus refresh tokens.` },
      ],
      analogy: `A session is a cloakroom ticket: the cloakroom keeps your coat and can cancel the ticket anytime. A JWT is a signed wristband: anyone can check it instantly, but it's valid until it expires even if you'd like to cancel it.`,
      quickRevision: [
        'Session: server state, easy revoke, needs lookup',
        'JWT: stateless, signed, hard to revoke',
        'JWT → short access + revocable refresh',
        'Single web app: sessions are simpler',
      ],
      followUps: [
        'How do you log out a user everywhere with JWTs?',
        'Where should the token live in the browser?',
      ],
    },
    {
      id: 'auth-jwt-access-refresh',
      question: 'How do you implement JWT authentication with access and refresh tokens securely?',
      perspective: 'design',
      difficulty: 'hard',
      frequency: 'very-high',
      tags: ['auth-security', 'api-design', 'react'],
      answer: `A **JWT** is a signed token (header.payload.signature). The server can verify it **without a database lookup**, which is the benefit. The downside is that it's hard to **revoke** before it expires.

So I use two tokens:

- **Access token**: short-lived (5–15 min), sent on each request, verified statelessly. Keep claims minimal (user ID, role), never secrets.
- **Refresh token**: long-lived, stored in an **httpOnly, Secure, SameSite cookie** so JavaScript (and XSS) can't read it. It's used only on \`/auth/refresh\`. It's **stored hashed in the DB**, so I can revoke it (logout, password change), and **rotated** on every use. If an old refresh token is reused, that signals theft, so I revoke the whole family.

Frontend: keep the access token in memory. On a 401, call refresh **once** and queue the other failing requests behind that single refresh (otherwise parallel requests race and log the user out), then retry them.

Plus: hash passwords with bcrypt or argon2, rate-limit login, use CSRF protection if auth relies on cookies, and check **authorisation per resource**, not just authentication.`,
      analogy: `A festival. The refresh token is your ID card kept in a locked wallet (httpOnly cookie). The access token is a day wristband: anyone at a gate can check it quickly without phoning the office (stateless), and if it's stolen it's only useful until tonight. Each morning you show your ID to get a new wristband, and the office can cancel your ID at any time.`,
      quickRevision: [
        'Access: short-lived, stateless, minimal claims',
        'Refresh: httpOnly+Secure+SameSite cookie, hashed in DB, rotated, revocable',
        'Reuse of an old refresh token → revoke the family',
        'Client: single in-flight refresh, queue + retry other 401s',
        'AuthN ≠ AuthZ: check ownership/role per resource',
      ],
      followUps: [
        'Where would you store tokens in a SPA, and why not localStorage?',
        'How do you log a user out everywhere?',
        'JWT vs server-side sessions: when would you choose sessions?',
        'How does OAuth2/OIDC SSO (e.g. Microsoft MSAL) fit in?',
      ],
    },
    {
      id: 'where-do-you-store-passwords',
      question: 'How do you store user passwords securely?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['auth-security'],
      answer: `I never store passwords, only **slow, salted hashes**: **bcrypt** (with a cost factor around 10–12) or **argon2id**. A **unique salt** per password defeats rainbow tables, and the **slowness** makes brute force expensive. A **pepper** (a server-side secret added before hashing, stored outside the DB) adds protection if the database leaks. At Firmwide we hash with a pepper.

Never use encryption (it's reversible) or fast hashes like MD5 or SHA-256 for passwords. Around it: rate-limit login, lock out or back off on repeated failures, and use secure password reset with short-lived single-use tokens.`,
      variants: [
        { label: 'Short version', answer: 'bcrypt or argon2 hashes with a salt. Never encrypt or store plain text.' },
      ],
      analogy: `Instead of keeping everyone's house key, you keep a unique fingerprint of each key that takes ages to fake; even if the fingerprints are stolen, copying the keys is impractically slow.`,
      quickRevision: [
        'bcrypt / argon2id, never plain or encrypted',
        'Unique salt per password',
        'Slow on purpose (cost factor)',
        'Pepper stored outside the DB',
        'Rate-limit login; safe reset tokens',
      ],
      followUps: [
        'Why not SHA-256?',
        'Salt vs pepper?',
        'How do you upgrade old hashes?',
      ],
    },
    {
      id: 'oauth-20-vs-oidc',
      question: 'What is the difference between OAuth 2.0 and OpenID Connect?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['auth-security'],
      answer: `- **OAuth 2.0** is about **authorisation**: an app gets an **access token** to call an API **on behalf of a user** ("let this app read my calendar").
- **OpenID Connect (OIDC)** is a layer on top that adds **authentication**: an **ID token** (a JWT) that says **who the user is** (\`sub\`, email, name), plus standard discovery and user-info endpoints.

For "Sign in with Microsoft" at Firmwide we use **MSAL** with the **Authorization Code flow + PKCE**:

1. The user signs in with Microsoft.
2. The app receives an authorization code and exchanges it for tokens.
3. The **ID token** identifies the user. Our backend checks that this Microsoft user is allowed in, then issues **our own** session or JWT with roles.
4. **Access tokens** call Microsoft Graph.`,
      variants: [
        { label: 'Short version', answer: `OAuth is authorization (access tokens). OIDC adds authentication (ID token). Microsoft SSO with MSAL uses Authorization Code + PKCE.` },
      ],
      analogy: `OAuth is a valet key: it lets someone drive your car without knowing who you are. OIDC adds an ID card, so the hotel also knows exactly who handed over the key.`,
      quickRevision: [
        'OAuth 2.0 = authorisation (access token)',
        'OIDC = authentication (ID token)',
        'Auth Code + PKCE for SPAs/mobile',
        'Backend maps the identity → own session/roles',
      ],
      followUps: [
        'Why PKCE?',
        'Access token vs ID token: which do you send to your API?',
        'How do you validate an ID token?',
      ],
    },
    {
      id: 'rbac-implementation',
      question: 'How would you implement role-based access control (RBAC)?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['auth-security'],
      answer: `**Role-based access control**: users have **roles**, and roles grant **permissions** (\`invoice:create\`, \`user:approve\`). Code checks **permissions, not role names**, so adding a role doesn't mean changing code.

Implementation:

- authenticate, then load the user's roles and permissions (cached, or in the token claims);
- middleware like \`authorize('invoice:create')\` returns **403** if the permission is missing;
- **resource-level checks** in the service as well, since roles aren't enough: can this user access *this* invoice (ownership or tenant)?
- the UI hides actions for UX, but **the API enforces**.

At Firmwide the roles are super_admin, admin, director and user, with middleware such as **requiring admin for writes** on sensitive modules.`,
      variants: [
        { label: 'Short version', answer: `User → roles → permissions. Middleware like \`authorize('invoice:create')\` checks permissions on every request.` },
      ],
      analogy: `Keycards in an office: your card (role) opens certain doors (permissions), and some rooms also check that the specific file cabinet is yours (resource-level checks).`,
      quickRevision: [
        'Users → roles → permissions',
        'Check permissions, not role names',
        'Middleware + resource-level (ownership) checks',
        'UI hides, API enforces',
      ],
      followUps: [
        'RBAC vs ABAC?',
        'How do you handle permission changes for logged-in users?',
      ],
    },
    {
      id: 'api-security-basics',
      question: 'How do you secure a Node.js API? Walk through the main risks.',
      perspective: 'practical',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['auth-security', 'express', 'api-design'],
      answer: `I go through the common OWASP risks and the control for each:

- **Broken access control** (the #1 risk): check on every request that **this user may access this record**, e.g. \`WHERE id = $1 AND org_id = $user.orgId\`, not just "is logged in". Guessable IDs plus missing checks is how IDOR happens.
- **Injection**: parameterised queries or an ORM. For Mongo, validate input types so \`{ "$gt": "" }\` can't sneak into a query. Never build shell commands from input.
- **Input validation**: a Zod/Joi schema for body, params and query; reject unknown fields to avoid mass assignment (\`role: "admin"\`).
- **Authentication**: bcrypt/argon2, rate-limit login and OTP endpoints, account lockout or backoff, short-lived tokens.
- **XSS and CSRF**: escape output (React does this by default; be careful with \`dangerouslySetInnerHTML\`), a CSP header, and \`SameSite\` cookies or CSRF tokens.
- **Transport and headers**: HTTPS only, \`helmet\`, a strict **CORS allow-list** (not \`*\` with credentials).
- **Secrets and dependencies**: secrets in a manager or env, never in git. \`npm audit\` / Dependabot, and pinned lockfiles.
- **Abuse and visibility**: rate limiting, request size limits, timeouts, and logs without passwords, tokens or PII.`,
      analogy: `Securing a building: locks on every door, not just the entrance (per-resource authorisation); checking parcels before they come in (validation and injection); a guest list at reception (CORS); a limit on how often someone can try the code pad (rate limiting); and CCTV that doesn't record PIN numbers (safe logging).`,
      quickRevision: [
        'Authorise every resource access (IDOR), not just authentication',
        'Parameterised queries; validate types (NoSQL injection)',
        'Schema validation; reject unknown fields (mass assignment)',
        'helmet, HTTPS, CORS allow-list, CSP, SameSite cookies',
        'Rate limit, size limits, secret management, dependency scanning',
      ],
      followUps: [
        'What is CORS actually protecting, and what does it not protect?',
        'How does NoSQL injection work in MongoDB?',
        'How would you store API keys for third-party services?',
      ],
    },
    {
      id: 'secrets',
      question: 'How do you manage secrets like API keys and database passwords?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['auth-security'],
      answer: `- **Never commit secrets** to git. Keep a \`.env.example\`, add \`.env\` to \`.gitignore\`, and run **secret scanning** (GitHub, gitleaks) so mistakes are caught.
- At runtime, load them from **environment variables** injected by the platform, or better, a **secrets manager** (AWS Secrets Manager, SSM Parameter Store), with access limited by IAM.
- In **CI/CD**, use **OIDC** to assume a cloud role instead of storing long-lived access keys. That's how my SmartJobHub pipeline deploys to AWS.
- **Rotate** secrets, give each service only what it needs, and keep secrets out of logs, error messages and AI prompts.
- If a secret leaks: **rotate immediately** first, then clean the history.`,
      variants: [
        { label: 'Short version', answer: `Env vars or a secrets manager (AWS Secrets Manager), never committed to git. Use OIDC in CI instead of static keys.` },
      ],
      analogy: `House keys: you don't tape them to the front door (git), you keep them in a lockbox only the right people can open (secrets manager), and if one goes missing you change the locks first.`,
      quickRevision: [
        'Never in git; secret scanning',
        'Env vars / secrets manager with IAM',
        'OIDC in CI instead of static keys',
        'Rotate; least privilege; no secrets in logs',
        'Leaked → rotate first',
      ],
      followUps: [
        'A secret was pushed to a public repo. What do you do?',
        'Secrets Manager vs Parameter Store?',
      ],
    },
    {
      id: 'security-headers',
      question: 'Which HTTP security headers would you set, and why?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['auth-security'],
      answer: `I add them with **\`helmet\`** in Express, or at the Nginx or CDN layer:

- **Content-Security-Policy**: which scripts, styles and images may load. The strongest XSS mitigation.
- **Strict-Transport-Security** (HSTS): force HTTPS.
- **X-Frame-Options / \`frame-ancestors\`**: stop clickjacking.
- **X-Content-Type-Options: nosniff**: stop MIME sniffing.
- **Referrer-Policy**, **Permissions-Policy**.

Also remove \`X-Powered-By\`, and set cookies with \`HttpOnly\`, \`Secure\` and \`SameSite\`.`,
      variants: [
        { label: 'Short version', answer: '`helmet`: CSP, HSTS, X-Frame-Options, etc.' },
      ],
      analogy: `Security headers are the house rules taped to the front door that the browser (the guest) promises to follow: only these visitors allowed, no peeking through windows, always use the secure entrance.`,
      quickRevision: [
        'helmet (or Nginx/CDN)',
        'CSP vs XSS; HSTS for HTTPS',
        'frame-ancestors vs clickjacking; nosniff',
        'Secure cookie flags; hide X-Powered-By',
      ],
      followUps: [
        'How do you roll out a strict CSP without breaking the site?',
        'What is clickjacking?',
      ],
    },
  ],
});
