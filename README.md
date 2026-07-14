# OpenFit Tracker

A mobile-first personal fitness progress tracker built with React, TypeScript, Vite, Tailwind CSS, Sileo, Recharts, and Supabase.

## Current status

Supabase authentication protects the application. Daily fitness logs and profile targets are stored in user-owned Supabase tables through Row Level Security. Users without confirmed calorie and protein targets complete a short onboarding flow before entering the tracker.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Connect Supabase

1. Create a Supabase project.
2. Link the local project with `npx supabase link --project-ref your-project-ref`.
3. Review pending migrations with `npx supabase db push --dry-run`.
4. Apply them when ready with `npx supabase db push`.
5. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
6. Enable Email and Google providers in Supabase Authentication.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The frontend needs only the project URL and publishable key. Never add the Google client secret or a Supabase secret/service-role key to a Vite environment variable.

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

For the current Supabase project, configure the Google Cloud OAuth web client with:

- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI: `https://boacpndgejotvveoekto.supabase.co/auth/v1/callback`

Put the Google client ID and client secret only in the Supabase Google provider settings. After Google returns to Supabase, Supabase redirects the browser to `http://localhost:5173/auth/callback`.

If the Google OAuth consent screen has Publishing status set to **Testing**, add each person who needs to sign in under Google Cloud → OAuth consent screen → Test users. Unlisted accounts cannot complete Google sign-in while the app remains in Testing mode.

> `supabase/migrations/` is now the database source of truth. `supabase/schema.sql` is retained temporarily as a legacy reference snapshot and must not be applied in addition to the migration.

Daily log dates are calendar dates (`date`, without a time zone). Each profile stores a canonical IANA timezone, which controls the daily-log form’s definition of today, dashboard current-day selection, progress range boundaries, and database future-date validation. Calendar values remain exact `YYYY-MM-DD` strings and are never parsed as UTC timestamps. New profiles initialize a missing timezone from the browser during onboarding, with `UTC` as the documented fallback when the browser cannot provide a valid timezone. Existing valid profile timezones are preserved and can be reviewed in Settings.

Profile targets and theme preference are loaded from `public.profiles`. The remote theme is applied after profile loading; `next-themes` retains its local value only to avoid a flash before that remote preference is available.

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

- Add automated tests


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
