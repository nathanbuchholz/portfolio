# Nathan Buchholz - Portfolio

Personal portfolio site.

**Live:** [nathanbuchholz.dev](https://nathanbuchholz.dev)

## Tech Stack

- React 19 + TypeScript (Vite)
- Tailwind CSS v4
- React Router v7
- Vitest + Cypress
- Netlify

## Getting Started

Requires Node.js 22+.

```bash
pnpm install
pnpm dev              # Start dev server
```

## Commands

```bash
pnpm build            # Type check + production build
pnpm preview          # Preview production build
pnpm lint             # ESLint
pnpm format           # Prettier (write)
pnpm format:check     # Prettier (check only)
pnpm test             # Vitest in watch mode
pnpm test:run         # Vitest single run
pnpm test:coverage    # Vitest with coverage
pnpm cy:open          # Cypress interactive
pnpm cy:run           # Cypress headless
pnpm test:e2e         # Build + preview + Cypress headless
```

## Project Structure

```
src/
  components/         # Layout, Navigation, Card, ContactModal, Lightbox, ErrorBoundary
  pages/              # HomePage, ExperiencePage, ProjectsPage, SkillsPage, EducationPage, CatsPage, NotFoundPage
  data/               # Static TypeScript data files
  hooks/              # Custom hooks (theme, document title)
  types/              # TypeScript interfaces
tests/                # Vitest unit tests
cypress/e2e/          # Cypress e2e + accessibility tests
public/               # Static assets
```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `VITE_RESUME_DRIVE_ID` | Google Drive file ID for the embedded resume PDF |

For local development, create a `.env` file:

```
VITE_RESUME_DRIVE_ID=your_drive_file_id
```

For CI/deployment, set this as a secret/environment variable in GitHub Actions and Netlify.

## Deployment

Netlify auto-deploys from `main`. Build command: `pnpm build`, publish dir: `dist`.

SPA routing is handled via `netlify.toml`.

## License

[MIT](LICENSE)
