# Interview Prep site

A static Next.js site built from the Markdown notes in this repository. It's deployed to GitHub Pages by `.github/workflows/deploy-site.yml` on every push to `main`.

**The Markdown files are never modified.** At build time the site reads them, extracts questions and renders every file as it is.

## Common tasks

| I want to… | Do this |
|---|---|
| Add notes | Add or edit any `.md` file in the repo (any folder). It appears after the next deploy. A new top-level folder becomes a new category. |
| Hide a file | Add its path or a glob to `exclude` in `content.config.ts`, or put `publish: false` in the file's frontmatter. |
| Publish `career/` | Remove `'career/**'` from `exclude` in `content.config.ts`. Story files listed in `notesOnly` show as notes only. |
| Add curated questions | Add entries to any file in `content/curated/`, or create a new `content/curated/<topic>.ts` that default-exports `defineQuestions([...])`. New files are picked up automatically, and the build fails with a clear message if a field is missing. |
| Override how a file is read | Optional frontmatter: `title`, `category`, `tags: [react]`, `difficulty: medium`, `type: note`. |
| See how files were parsed | `npm run content`, then open `.generated/parse-report.md`. It shows every extracted question, duplicates and privacy flags. In CI, the summary appears on the workflow run page. |

## Local development

```bash
cd site
npm install
npm run dev        # http://localhost:3000
npm run build      # static export in out/
```

## How Markdown is turned into questions

The notes use several formats, and each file is read by whichever rules match:

- `### Q1: …` headings with answers below them (topic notes). `### Easy` / `### Medium` parents set the difficulty.
- Tables whose first column is `Question` / `Task` / `Prompt`: one question per row.
- `1. **Question?** answer` list items under "questions" / "scenario" headings.
- Headings ending in `?`, and leaf headings in `*questions*.md`, `*solutions*.md` and `companies/` files.
- `## Key takeaways` lists become Quick Revision cards.
- Files where nothing matches (or listed in `notesOnly`) become whole-document notes.

Duplicates are never dropped. Identical questions are grouped, and every answer is shown on the question page. Similar ones are linked as related.
