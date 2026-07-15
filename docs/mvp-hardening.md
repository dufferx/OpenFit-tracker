# MVP hardening notes

Audited: 2026-07-15  
Branch: `feat/mvp-hardening`

## Bundle and route loading

The baseline production build emitted one `1,522.99 kB` JavaScript entry (`459.08 kB` gzip). Every page and both Recharts views were statically imported by `src/App.tsx`.

All page modules are now loaded with `React.lazy` at the existing route boundary. Authentication, profile guards, intended-route restoration, the authenticated layout, and query providers remain eager. Each page has a shared, accessible `Suspense` loading screen. The resulting entry is `689.04 kB` (`207.86 kB` gzip), a 54.8% raw and 54.7% gzip reduction.

The emitted production groups are:

- Entry (`689.04 kB`, `207.86 kB` gzip): React/router, Supabase auth/data client, TanStack Query, theme/toast providers, route guards, shared authenticated layout, and shared primitives.
- Recharts/shared progress data (`369.94 kB`, `108.83 kB` gzip): visualization runtime shared by Dashboard and Progress.
- Progress (`43.03 kB`, `13.91 kB` gzip): four progress chart compositions and range controls.
- Dashboard (`13.35 kB`, `4.74 kB` gzip): dashboard composition; it requests the shared Recharts chunk because the dashboard contains the weight trend.
- Log (`103.28 kB`, `31.98 kB` gzip): daily-log form, calendar, React Hook Form, and Zod-related route code.
- Profile form (`83.45 kB`, `27.98 kB` gzip): shared Onboarding/Settings form controls.
- History (`14.97 kB`, `5.32 kB` gzip), auth pages (`0.61–3.27 kB` each), Settings (`1.55 kB`), and Onboarding (`2.13 kB`) remain separate route/shared chunks.

The main entry remains above Vite's generic 500 kB warning because it contains the application runtime, Supabase, Query, router, and shared UI. Manual vendor chunking was not added because it would rearrange caching rather than reduce initial code. The PWA precaches static JavaScript/CSS for offline shell reliability; lazy chunks are fetched by the service worker during installation but are not parsed or executed until their route is opened.

## Runtime resilience

- A global error boundary surrounds themes, Query, auth, and routing. It prevents provider/router render failures from producing a blank screen.
- A content boundary surrounds the authenticated `Outlet` and resets when navigation changes.
- Both fallbacks focus a concise title, avoid error details and stack traces, and offer retry plus a Home reload.
- Expected Supabase/query errors remain in the existing recoverable alerts and are not routed through error boundaries.
- Development builds log unexpected boundary diagnostics; production fallbacks contain no sensitive error object.
- When the authenticated user identity changes, cached profile and daily-log data for the previous user is removed. Query keys remain user-scoped, query retries remain one attempt, window-focus refetch remains disabled, and mutations remain non-retrying.

## Tests

Vitest uses jsdom and `@testing-library/jest-dom`; React Testing Library is used for the error-boundary behavior test. Tests live in `test/`, fixtures are synthetic, and no Supabase client or credential is required.

Coverage includes profile-local today around midnight, calendar arithmetic, inclusive 7/30/90-day ranges, strict date parsing, future-date validation, weekly filtering and sparse averages, zero handling, balance and latest measurements, chronological sorting, nullable form normalization and `NaN` rejection, profile completeness, chart null filtering/order, one-measurement behavior, and error fallback/retry/focus.

Recommended later E2E coverage, without adding Playwright to this branch: protected-route restoration; email/password and Google sign-in against a dedicated test project; onboarding; create/edit/delete/reload; profile changes; direct route refreshes; theme modes; lazy route loading; service-worker update; and authenticated API cache inspection.

## Dependency audit

- Removed `date-fns`: no source, configuration, script, or generated shadcn component imported it.
- Retained `@base-ui/react`, `class-variance-authority`, React DayPicker, React Hook Form, Zod, and related packages because checked-in UI/form source imports them.
- Retained the Supabase CLI development package for the documented local migration workflow.
- Added only Vitest, React Testing Library, jest-dom, and jsdom as development dependencies. The lockfile resolves from the public npm registry and `npm ci` is the clean-install check.

## Security and PWA audit

The frontend reads only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; `.env.local` remains ignored. Auth callbacks derive from `window.location.origin`, and stored post-auth destinations accept only same-origin path values. Notes render as React text. No user HTML API is used. User-owned operations obtain the authenticated user and include the owner filter, with database RLS remaining the enforcement layer.

Vercel already sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a Permissions Policy disabling camera, microphone, and geolocation. CSP is deferred: a useful policy must be validated with the exact Supabase HTTPS/WSS project origin, Google OAuth navigation, generated Vite assets, Base UI/Sileo generated styles, and PWA worker behavior. Add it first in report-only mode on a real preview environment; do not use a broad untested policy.

The Workbox configuration precaches only generated static JS/CSS/HTML. It defines no runtime caching, so Supabase requests and authenticated JSON are not stored by the service worker. Registration remains immediate with `autoUpdate`; no update prompt was added because the generated worker already activates updates automatically without an application-managed reload loop. The shell can open offline, but all auth, reads, and writes remain online-only.

## Monitoring decision and limitations

External monitoring was not added because it requires explicit service approval and configuration. A later integration would add value for uncaught boundary errors and failed route chunk loads, but it should disable default user/URL/body breadcrumbs and must never send fitness values, notes, email addresses, auth tokens, session/storage contents, Supabase keys, or request/response bodies.

This pass does not automate a real Supabase project, Google OAuth, installed-PWA upgrades, or mobile browser behavior. Those require a dedicated test account/environment and human validation. No analytics, offline synchronization, CSP, migration, RLS, deployment, or product behavior was added or changed.
