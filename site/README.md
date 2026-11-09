# Interview Prep site

A static Next.js site for full-stack interview prep. It has topic guides with interview-ready answers, plus practice modes: Quiz, Interview Simulator, Last-Minute Cards and spaced-repetition Review. It also has bookmarks and cheat sheets. Progress is stored in the browser's localStorage, with no accounts and no backend.

It's deployed to GitHub Pages by `.github/workflows/deploy-site.yml` on every push to `main`.

## Content model

```text
content/
├── topics.ts                 # topics in sidebar order + the guide order inside each
├── guides/<topic>/<guide>.ts # one guide = a list of questions
├── cheatsheets/<slug>.md     # one-page references (frontmatter: title, description, icon, order)
└── career-profile.ts         # facts shown at the top of the Career & HR topic
```

Every question has the same sections. The schema is in `lib/content/schema.ts`.

| Field | Shown as |
|---|---|
| `question` (+ optional `snippet`) | The question. Put code to predict in `snippet` so it shows on flashcards |
| `answer` | **Interview answer**, about 30–90 seconds spoken |
| `variants` | **Other versions** tabs (e.g. "Short version", "Frontend role") |
| `analogy` | **Analogy** ("How to frame it" in Career) |
| `quickRevision` | **Quick revision** hooks. Also the back of Last-Minute cards |
| `deepDive` | **Go deeper**: code and extra detail |
| `avoid` | **Don't say** |
| `followUps` | **Likely follow-ups** |
| `difficulty`, `frequency`, `perspective`, `tags`, `section` | Badges, filters and grouping. `frequency: 'very-high'` puts a question in the Last-Minute core set |

A guide can also list `alsoAsked: ['topic/guide/question-id']` to link questions that live in another guide. The company guides use this.

## Common tasks

| I want to… | Do this |
|---|---|
| Add a question | Add an object to `questions` in the right `content/guides/<topic>/<guide>.ts`. The `id` must be kebab-case and unique within that guide |
| Add a guide | Create `content/guides/<topic>/<slug>.ts` with `export default defineGuide({ title, description, questions: [...] })`, then add `<slug>` to that topic's `guides` in `content/topics.ts` |
| Add a topic | Add an entry to `content/topics.ts` (slug, label, description, icon from `components/Icons.tsx`) and create `content/guides/<slug>/` |
| Add a cheat sheet | Add `content/cheatsheets/<slug>.md` with `title`, `description`, `icon` and `order` frontmatter |

The build fails with a clear message when a field is missing or too short, a guide file isn't listed in `topics.ts` (or the reverse), an id is duplicated, or an `alsoAsked` link points at nothing.

Question keys (`topic/guide/id`) are what bookmarks, progress and the review schedule are stored under. If you rename one, that question's saved progress resets.

## Local development

```bash
cd site
npm install
npm run dev        # http://localhost:3000
npm run build      # static export in out/
npm run content    # only regenerate .generated/site.json + public/data/*.json
```

## How it works

- `scripts/build-content.ts` validates everything with zod and renders Markdown to HTML at build time. Code is highlighted with Shiki, light and dark. It writes:
  - `.generated/site.json`: everything the statically rendered pages need.
  - `public/data/cards.json`: compact question cards for the practice modes, loaded on demand.
  - `public/data/search-index.json`: a MiniSearch index for the search dialog (Ctrl K or `/`).
- Spaced repetition uses SM-2 (`lib/client/srs.ts`). Grading **Again** brings a card back tomorrow, and Good or Easy push it further out each time. Good or Easy also mark the question as known, which drives the progress bars.
- "Continue where you left off" saves the question you were reading in each guide.
