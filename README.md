# OpenFit Tracker

A mobile-first personal fitness progress tracker built with React, TypeScript, Vite, Tailwind CSS, Sileo, Recharts, and Supabase.

## Current status

This first build is fully usable in **demo mode**. It stores data in the browser's `localStorage`, so no credentials are required. The Supabase database schema and client placeholder are included for the next integration step.

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
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Add the project URL and publishable key.
5. Enable Email and Google providers in Supabase Auth.
6. Add local and production redirect URLs in the Supabase dashboard.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

> The current UI still uses the local adapter. Replace the functions in `src/lib/storage.ts` with Supabase queries after authentication is enabled.

## Included

- Responsive dashboard
- Daily calorie, protein, burned-calorie, weight, and body-fat logging
- Edit and delete history
- Weight, body-fat, calorie, and protein charts
- Personal targets and preferences
- Sileo toast notifications
- PWA manifest and service worker
- Supabase SQL schema with Row Level Security
- Demo seed data

## Next development milestone

- Complete Supabase email/password and Google authentication
- Replace local persistence with TanStack Query + Supabase
- Add onboarding and protected routes
- Add proper dark-mode persistence
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
