# OpenFit Tracker

A mobile-first personal fitness progress tracker built with React, TypeScript, Vite, Tailwind CSS, Sileo, Recharts, and Supabase.

## Current status

Supabase authentication protects the application. Daily fitness logs and profile targets are stored in user-owned Supabase tables through Row Level Security. Users without confirmed calorie and protein targets complete a short onboarding flow before entering the tracker.

## Run locally

Use Node `^20.19.0` or `>=22.12.0`, matching Vite's current runtime requirement.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Only the Supabase project URL and publishable key belong in frontend environment variables. Never add a Supabase secret/service-role key, database password, JWT secret, Google client secret, or other private credential to a `VITE_` variable.

## Production build

```bash
npm run build
npm run preview
```

The Vite production build writes to `dist/`. Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` is handled by a clear in-app configuration error; no real environment values are committed or emitted by the build.

## Tests

```bash
npm run test
npm run test:watch
```

The focused Vitest suite covers profile-timezone calendar behavior, dashboard/progress calculations, daily-log form normalization, profile completeness, chart transformations, and unexpected-render error fallback behavior. Tests use synthetic data and jsdom; they never connect to Supabase or require credentials.

Route pages are loaded on demand with `React.lazy`. Authentication/profile guards and the authenticated application shell stay eager so protected-route redirects remain stable. A global error boundary and an authenticated content boundary provide non-sensitive retry/recovery UI for unexpected render failures; normal Supabase failures continue through the existing query and form error handling.

## Connect Supabase

1. Create a Supabase project.
2. Link the local project with `npx supabase link --project-ref your-project-ref`.
3. Review pending migrations with `npx supabase db push --dry-run`.
4. Apply them when ready with `npx supabase db push`.
5. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
6. Enable Email and Google providers in Supabase Authentication.

### Local authentication URLs

Configure Supabase Authentication → URL Configuration with:

- Site URL: `http://localhost:5173`
- Redirect allow list:
  - `http://localhost:5173`
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/update-password`
  - `http://localhost:5173/**`

Add the equivalent HTTPS callback and password-update URLs for the deployed application before production use.

### Google OAuth

For local development, configure the Google Cloud OAuth web client with:

- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI: `https://SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`

Put the Google client ID and client secret only in the Supabase Google provider settings. After Google returns to Supabase, Supabase redirects the browser to `http://localhost:5173/auth/callback`.

If the Google OAuth consent screen has Publishing status set to **Testing**, add each person who needs to sign in under Google Cloud → OAuth consent screen → Test users. Unlisted accounts cannot complete Google sign-in while the app remains in Testing mode.

## Deployment

Vercel is the recommended first static host. The repository includes `vercel.json` with:

- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback rewrite to `index.html` for React Router routes
- Conservative static headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and a basic `Permissions-Policy`

The rewrite is host-specific but isolated to `vercel.json`. Other static hosts need the same behavior: serve existing files normally, then fall back unmatched navigation requests to `index.html`.

Recommended branch strategy:

- `main`: production deployment
- `development`: preview or integration deployment
- feature branches: pull-request previews when useful

Do not make `development` the public production deployment. If Vercel autodetection fails, choose Vite, keep the build/output settings above, and add production values for `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel project environment settings. Do not put secrets or real environment values in `vercel.json`.

### Production Supabase Auth

After the production URL exists, configure Supabase Authentication → URL Configuration:

- Site URL: `https://FINAL_DOMAIN`
- Redirect allow list:
  - `https://FINAL_DOMAIN/auth/callback`
  - `https://FINAL_DOMAIN/update-password`

Keep the localhost entries for local development. Add wildcard preview URLs only when you accept that any matching preview deployment can receive auth redirects.

### Production Google OAuth

In Google Cloud, add:

- Authorized JavaScript origin: `https://FINAL_DOMAIN`
- Authorized redirect URI: `https://SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`

Google redirects to Supabase, and Supabase redirects back to this app's `/auth/callback`. The frontend does not need Google credentials. The Google client ID and client secret stay only in Supabase's Google provider settings. Testing-mode test-user restrictions still apply until the OAuth consent screen is published.

### PWA Installation

OpenFit Tracker is configured as an installable PWA with `display: standalone`, root `start_url` and `scope`, 192 px and 512 px install icons, a maskable icon, favicon, and Apple touch icon. The current icon is a simple repo-owned temporary OpenFit mark and can be replaced later with final brand artwork.

- Chrome/Android: use the browser install prompt or Add to Home screen.
- Safari/iPhone: use Share → Add to Home Screen.
- Desktop browsers: use the install action when the browser supports PWAs.

The service worker is generated by `vite-plugin-pwa` and registered with automatic updates. It precaches the application shell and static build assets only. Supabase API responses and authenticated data are not configured for runtime caching. A new deployed version activates automatically when safe; if an installed app appears stale, close all OpenFit Tracker tabs/windows and reopen it.

### Offline Limits

The installed shell may open while offline, but authentication, Supabase queries, and mutations require connectivity. The app does not implement offline daily-log writes or local sync. Failed network saves keep the current error behavior and should not be treated as saved data.

### Troubleshooting

- Blank page on direct route: confirm the host falls back navigation requests to `index.html` while still serving static assets normally.
- OAuth redirect mismatch: verify Supabase redirect allow list includes `https://FINAL_DOMAIN/auth/callback`.
- Password reset rejected: verify Supabase redirect allow list includes `https://FINAL_DOMAIN/update-password`.
- Google sign-in fails: verify the Google authorized origin is `https://FINAL_DOMAIN` and the authorized redirect URI is the Supabase callback URL.
- Stale installed PWA: close all app windows and reopen; then clear the site's service worker/cache only if it remains stuck.
- Missing environment variables: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting provider, then redeploy.

> `supabase/migrations/` is now the database source of truth. `supabase/schema.sql` is retained temporarily as a legacy reference snapshot and must not be applied in addition to the migration.

Daily log dates are calendar dates (`date`, without a time zone). Each profile stores a canonical IANA timezone, which controls the daily-log form’s definition of today, dashboard current-day selection, progress range boundaries, and database future-date validation. Calendar values remain exact `YYYY-MM-DD` strings and are never parsed as UTC timestamps. New profiles initialize a missing timezone from the browser during onboarding, with `UTC` as the documented fallback when the browser cannot provide a valid timezone. Existing valid profile timezones are preserved and can be reviewed in Settings.

Profile targets and theme preference are loaded from `public.profiles`. The remote theme is applied after profile loading; `next-themes` retains its local value only to avoid a flash before that remote preference is available.

Progress uses profile-timezone calendar ranges for the last 7, 30, and 90 days. The All time view reuses the current-user daily-log query and displays the 1,000 most recent records at most, matching the Supabase Data API `max_rows` limit in `supabase/config.toml`. Pagination is intentionally deferred for the MVP, so an account with more than 1,000 logs should not treat this view as a complete lifetime history.

## Included

- Responsive dashboard
- Daily calorie, protein, burned-calorie, weight, and body-fat logging
- Edit and delete history
- Weight, body-fat, calorie, and protein charts
- Personal targets and preferences
- Sileo toast notifications
- PWA manifest and service worker
- Supabase SQL schema with Row Level Security
- Supabase-backed daily-log persistence

## Next development milestone

- Add focused end-to-end coverage against a dedicated non-production Supabase test project.
- Evaluate privacy-safe production error monitoring without capturing fitness data, notes, emails, tokens, keys, or request bodies.


## UI system

The interface uses the shadcn/ui source-code component model with the selected preset:

- Preset ID: `b2oWFNd6u`
- Style: Vega
- Base/theme: Neutral
- Chart palette: Green
- Icons: Lucide
- Font: Inter
- Menu accent: Subtle

Components live in `src/components/ui`, design tokens live in `src/index.css`, and Sileo remains the toast system.
