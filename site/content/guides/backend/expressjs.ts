import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Express.js',
  description: 'Middleware, routing, error handling and request/response basics.',
  questions: [
    {
      id: 'express-middleware-error-handling',
      question: 'How does Express middleware work, including error-handling middleware?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['express', 'nodejs', 'api-design'],
      answer: `Middleware is a function \`(req, res, next)\` in a **pipeline**. Express runs middleware **in the order it's registered**. Each one can read or modify \`req\`/\`res\`, **end the response**, or call \`next()\` to pass control on. Typical order: request ID and logging → security headers (helmet), CORS → body parsing → rate limiting → auth → validation → route handler.

**Error-handling middleware** has **four arguments** \`(err, req, res, next)\` and is registered **last**. Calling \`next(err)\` (or throwing in a sync handler) skips the normal middleware and jumps to it. That gives one place to map errors to status codes and a consistent JSON shape, and to log with the request ID, without leaking stack traces in production.

One gotcha: in Express 4, a **rejected promise in an async handler isn't caught automatically**. You need a wrapper (\`asyncHandler\`) or \`express-async-errors\`. Express 5 handles rejected promises natively.`,
      analogy: `Airport security. Each checkpoint (middleware) inspects you in order: ID check, bag scan, boarding pass. Any checkpoint can send you back (end the response) or wave you through (\`next()\`). If something goes wrong anywhere, you're escorted straight to one central office (error middleware) instead of each checkpoint handling it differently.`,
      quickRevision: [
        '`(req, res, next)`: modify, respond, or `next()`',
        'Order of registration = order of execution',
        'Error middleware: 4 args, registered last, reached via `next(err)`',
        'Express 4: wrap async handlers; Express 5 catches rejections',
        'Central error handler → consistent JSON, no stack traces in prod',
      ],
      followUps: [
        'Write a middleware that checks a role: `requireRole("admin")`.',
        'What happens if middleware neither responds nor calls `next()`?',
        'Difference between `app.use` and `router.use`?',
      ],
    },
    {
      id: 'ressend-vs-resjson-vs-resend',
      question: 'What is the difference between `res.send`, `res.json` and `res.end` in Express?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['express'],
      answer: `- **\`res.json(obj)\`**: serialises to JSON, sets \`Content-Type: application/json\` and ends the response. It's what I use for APIs.
- **\`res.send(body)\`**: sends a string, Buffer or object. It **infers the content type** (objects become JSON, strings become HTML) and ends the response.
- **\`res.end()\`**: low-level (from Node's \`http\`). It ends the response **without setting a body type**, which is useful for an empty 204 or after streaming.

Also: **\`req\`** is the incoming request (params, query, body, headers, user). Sending **twice** throws "headers already sent", so always \`return\` after responding.`,
      variants: [
        { label: 'Short version', answer: 'See Techzu notes.' },
      ],
      analogy: `res.json is a labelled, sealed parcel; res.send is a parcel where the courier guesses the label; res.end just closes the door.`,
      quickRevision: [
        'res.json: JSON + content type',
        'res.send: infers type',
        'res.end: ends without body handling (204, streams)',
        'Return after responding (no double send)',
      ],
      followUps: [
        'What causes "Cannot set headers after they are sent"?',
        'How do you stream a file response?',
      ],
    },
    {
      id: 'how-do-you-structure-an-express-app',
      question: 'How do you structure an Express app?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['express'],
      answer: `In layers, so each has one job:

- **routes**: URL + method → middleware chain (auth, validation) → controller;
- **controllers**: HTTP only. Read the request, call a service, shape the response;
- **services**: **business logic** (create an invoice, check status transitions), framework-agnostic and easy to unit test;
- **repositories / models**: database access (Mongoose, Prisma).

Plus cross-cutting pieces:

- **validation** with Zod schemas;
- a **central error handler** with typed errors (\`NotFoundError\` → 404);
- **config** from validated env variables;
- **structured logging** with a request ID.

At Firmwide I group these **by domain** (enquiries, proposals, invoices), each with its own routes, controllers, services and schemas.`,
      variants: [
        { label: 'Short version', answer: `routes → controllers (HTTP) → services (business logic) → models/repositories. Centralized errors, config from env.` },
      ],
      analogy: `A restaurant: the host (routes) seats you, the waiter (controller) takes the order, the kitchen (service) cooks by the recipe, and the pantry (repository) stores ingredients. Nobody does someone else's job.`,
      quickRevision: [
        'routes → controllers → services → repositories',
        'Controllers: HTTP only; services: business logic',
        'Zod validation, central error handler, env config',
        'Group by domain/module',
      ],
      followUps: [
        'Where does authorisation logic live?',
        'How do you test services without Express?',
        'How would you add a new module?',
      ],
    },
    {
      id: 'validation',
      question: 'How do you validate request input in an Express API?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['express'],
      answer: `**Never trust the client**, even my own frontend. I validate **body, params and query** at the edge with a **Zod** (or Joi) schema in a middleware: \`validate({ body: createInvoiceSchema })\`.

- On failure, return **400 or 422** with field-level errors the UI can show.
- Use \`.strict()\` or strip unknown fields to prevent **mass assignment** (\`role: "admin"\`).
- **Coerce** types for query strings, and set limits (string length, max page size, enum values).
- Reuse the inferred type (\`z.infer\`) in controllers and services, and share schemas with the frontend.

Business rules that need the database (unique email, valid state transition) belong in the **service**, not the schema.`,
      variants: [
        { label: 'Short version', answer: 'Zod or Joi schemas in middleware, validating body, params and query. Never trust the client.' },
      ],
      analogy: `Airport security scanning every bag at the entrance: it's much safer than hoping each gate checks properly later.`,
      quickRevision: [
        'Validate body, params, query at the edge',
        'Zod/Joi middleware; 400/422 with field errors',
        'Strip unknown fields (mass assignment)',
        'DB-dependent rules live in services',
      ],
      followUps: [
        '400 vs 422?',
        'How do you validate env variables at startup?',
      ],
    },
    {
      id: 'express-4-vs-5',
      question: 'What changed between Express 4 and Express 5?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['express'],
      answer: `The big practical change in **Express 5** is **async error handling**: a rejected promise or a \`throw\` in an \`async\` handler is **forwarded to error middleware automatically**. In Express 4 you needed \`express-async-errors\` or a wrapper.

Other changes: removal of deprecated APIs (\`res.send(status, body)\`, \`req.param()\`), **new path-matching syntax** (path-to-regexp v8, so wildcards and optional params are written differently), \`req.query\` being read-only, and requiring Node 18+. We use **Express 5** at Firmwide, so handlers are plain async functions that throw typed errors.`,
      variants: [
        { label: 'Short version', answer: 'Express 5 has native async error handling, removes deprecated APIs and changes path matching syntax.' },
      ],
      analogy: `Express 5 added a safety net under async handlers: falling (throwing) now lands you in the error handler instead of on the floor (an unhandled rejection).`,
      quickRevision: [
        'Express 5: async errors go to error middleware automatically',
        'Deprecated APIs removed',
        'New path syntax (path-to-regexp v8)',
        'Node 18+',
      ],
      followUps: [
        'What breaks when upgrading routes from 4 to 5?',
        'How did you handle async errors in Express 4?',
      ],
    },
    {
      id: 'why-fastify',
      question: 'Why would you choose Fastify over Express?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['express'],
      answer: `Fastify is a Node framework focused on **performance and structure**:

- **JSON Schema-based validation and serialisation**: validation is compiled, and responses serialise faster, while the schema also documents the API;
- a **plugin system** with encapsulation;
- **hooks** for the request lifecycle;
- good TypeScript support and built-in logging (pino).

I used it in my **AI SQL Assistant** project. Express is still fine and has the biggest ecosystem. I'd pick Fastify for new, high-throughput APIs, and NestJS when a team wants an opinionated structure.`,
      variants: [
        { label: 'Short version', answer: `Faster, schema-based validation and serialization, a plugin system. You used it in the AI SQL Assistant.` },
      ],
      analogy: `Express is a flexible workshop where you bring your own tools; Fastify is a workshop with fitted, labelled tools that make common jobs faster and more consistent.`,
      quickRevision: [
        'Schema-based validation + fast serialisation',
        'Encapsulated plugins, lifecycle hooks',
        'pino logging built in',
        'Used in AI SQL Assistant; Express still fine',
      ],
      followUps: [
        'Express vs Fastify vs NestJS?',
        'How do Fastify plugins share state?',
      ],
    },
  ],
});
