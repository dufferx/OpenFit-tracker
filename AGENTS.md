# Repository Guidelines

## Product and Technical Direction

OpenFit Tracker is a private, mobile-first fitness progress tracker for about 10 MVP users. It records daily totals for calories consumed, protein consumed, calories burned, weight, and body-fat percentage. The UI, code, comments, commits, documentation, database objects, and identifiers must be English.

Keep the product simple, responsive, and minimal. A user has at most one daily log per date. Store weight only in kilograms. Daily logs contain totals only; do not add meals or training tracking unless explicitly requested. Make date and timezone behavior explicit, reject future log dates, and never overwrite another user's data.

## Repository Map

- `src/pages/`: route-level screens; routing starts in `src/App.tsx`.
- `src/components/ui/`: shadcn/ui source primitives; `src/components/common/` and `Layout.tsx` contain shared composition.
- `src/components/theme/`: light, dark, and system theme behavior.
- `src/lib/`: Supabase client, local storage adapter, and utilities.
- `src/types/`: shared domain models.
- `src/assets/` and `public/`: imported and directly served assets, including PWA icons.
- `src/index.css`: Tailwind styles, semantic tokens, and chart variables.
- `supabase/migrations/`: source of truth for timestamped database changes.
- `supabase/schema.sql`: legacy/reference snapshot; keep its status documented if retained.
- `.env.example`: placeholder-only public environment template.

## Stack and UI Rules

Use React 19, strict TypeScript, Vite, React Router, Tailwind CSS, Recharts, Supabase, and Vite PWA. The shadcn preset is `b2oWFNd6u`: Vega, Neutral, Green charts, Lucide icons, Inter, and subtle menu accents. Preserve this visual language and existing semantic tokens.

Reuse primitives from `src/components/ui/`. Prefer tokens such as `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `text-primary-foreground`; avoid hardcoded theme colors except for necessary data visualization. Use configured chart CSS variables with Recharts. Preserve accessible labels, focus states, keyboard navigation, mobile touch targets, and all theme modes.

Use Sileo for meaningful action feedback; do not replace it with Sonner or notify on every minor interaction. Do not introduce Redux. Prefer small, focused components and hooks over speculative abstractions. Avoid `any`.

## Forms and Data Integrity

Prefer React Hook Form and Zod for non-trivial forms. Validate on the client and through database constraints where applicable. Normalize optional numeric inputs deliberately so empty values become neither zero nor `NaN`. Keep queries, indexes, uniqueness constraints, and the one-log-per-user-per-date rule aligned.

## Supabase and Secrets

All user-owned tables require Row Level Security. Policies must use `auth.uid()` and restrict rows to their owner. Security-definer functions require an explicit safe `search_path`. Frontend code may use only the Supabase publishable key.

Put local values in `.env.local` and placeholders in `.env.example`. Never expose or commit service-role/secret keys, database passwords, or JWT secrets. Do not commit `.env`, `.env.local`, `node_modules`, `dist`, or `supabase/.temp`.

Add schema changes as timestamped files under `supabase/migrations/`. Do not automatically apply remote migrations, run destructive commands against remote projects, or use `db reset` against production or a linked remote database. Document required Auth provider and redirect URL configuration.

## Development Workflow

Before editing, inspect existing patterns and run `git branch --show-current`. `main` must remain stable and deployable; `development` is the integration branch. Work only in feature branches created from `development`, for example `feat/supabase-auth`, `feat/daily-logs-database`, `fix/auth-redirect`, or `chore/update-dependencies`. Never work directly on `main` or `development`.

For non-trivial tasks, state a concise plan. Preserve existing behavior unless the task changes it, make incremental edits, avoid unrelated files, and review `git diff` before finishing. Do not commit or push unless explicitly asked.

Use npm and keep `package-lock.json` committed. Reuse installed dependencies; explain any new package and obtain explicit approval before replacing a core library. Lockfile package URLs must use the public npm registry, never internal OpenAI registries.

## Commands and Validation

- `npm ci`: install exactly from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm run lint`: run ESLint 9.
- `npm run build`: run TypeScript checks and create `dist/`.
- `npm run preview`: serve the production build locally.
- `npx supabase start`: start the local Supabase stack.

Automated tests are not configured. Perform focused manual checks, especially on mobile layouts and create/edit/delete/reload flows. At minimum, run `npm run lint` and `npm run build`; fix task-introduced errors and do not claim success unless validation passed. Report modified/created files plus remaining limitations and assumptions.

## Documentation and Review

Use concise Conventional Commits such as `feat: add daily log validation`, but only when asked to commit. Pull requests should describe behavior, linked issues, schema/configuration effects, validation, and UI screenshots when relevant. Keep `README.md`, `.env.example`, and this guide accurate when behavior, environment variables, or conventions change.
