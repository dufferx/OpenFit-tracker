You are working inside the OpenFit Tracker repository on the branch `feat/mvp-hardening`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `feat/mvp-hardening`.
3. Read the current `README.md`, `backlog.md`, and relevant internal project documentation.
4. Inspect:

   * `package.json`
   * `package-lock.json`
   * Vite configuration
   * React Router configuration
   * application providers
   * authentication and protected-route architecture
   * TanStack Query configuration
   * Supabase data-access modules
   * date and timezone helpers
   * dashboard/progress calculation helpers
   * PWA/service-worker configuration
   * Vercel configuration
   * current loading, error, and retry behavior
   * existing test infrastructure, if any
5. Run:

   * `git status`
   * `git log --oneline --decorate -10`
   * `npm run lint`
   * `npm run build`
6. Record the current production bundle sizes before editing.
7. Provide a concise, prioritized implementation plan before changing files.
8. Do not commit or push.
9. Do not deploy.
10. Do not request or expose real credentials.

## Goal

Harden the existing OpenFit Tracker MVP for reliable continued personal use and future feature development.

Improve:

* runtime resilience
* initial-load performance
* test coverage for critical deterministic behavior
* dependency hygiene
* production security posture
* PWA reliability
* developer confidence

Preserve all existing product behavior and visual design.

This is not a product-feature branch.

## Current product behavior that must remain intact

Preserve:

* email/password authentication
* Google OAuth
* password reset
* protected routes
* onboarding
* profile settings
* profile timezone behavior
* daily-log create, read, update, and delete
* nullable weight and body-fat values
* prevention of future dates
* redirect to Home after saving
* dashboard calculations
* seven-calendar-day weekly summary
* progress filters
* all-time progress behavior
* chart tooltips
* PWA installation
* Sileo notifications
* light, dark, and system themes
* responsive dashboard
* History Alert Dialog
* Supabase RLS assumptions
* current Git/environment-variable conventions

## 1. Bundle and loading-performance audit

The previous production build reported a large main JavaScript chunk.

Audit the current bundle and identify the major contributors.

Implement safe improvements such as:

* route-level lazy loading with `React.lazy`
* `Suspense` boundaries appropriate to the existing router
* loading chart-heavy pages only when visited
* keeping Progress and other non-initial pages out of the initial bundle
* isolating heavy visualization code where practical
* checking import patterns for Recharts and other large dependencies
* avoiding duplicate imports or bundled development-only code

Requirements:

* Preserve protected-route behavior.
* Preserve auth callback behavior.
* Preserve intended-route restoration.
* Avoid loading flashes or redirect loops.
* Use the existing shared loading components where appropriate.
* Do not rewrite the routing architecture unnecessarily.
* Do not replace Recharts.
* Do not remove functionality merely to reduce bundle size.
* Record bundle sizes before and after.
* Explain which chunks contain which page groups.

Do not optimize purely for an arbitrary size if it harms maintainability or UX.

## 2. Error boundaries

Add production-appropriate React error boundaries.

At minimum evaluate:

* a global application error boundary
* a route/content error boundary
* isolation for chart-heavy pages if useful

Requirements:

* Unexpected render errors must not leave a blank screen.
* Provide a calm, useful fallback.
* Include:

  * a concise error title
  * a non-sensitive explanation
  * retry or reload action
  * navigation back to Home where appropriate
* Do not expose stack traces or secrets to end users.
* Development mode may log useful diagnostics.
* Preserve query error handling for expected network/server failures.
* Error boundaries are for unexpected render/runtime errors, not replacements for normal Supabase errors.
* Use existing semantic tokens and shadcn components.
* Ensure fallback UI works in light and dark themes.

## 3. Critical automated tests

Add a focused test foundation using the smallest appropriate stack.

Prefer:

* Vitest
* React Testing Library
* `@testing-library/jest-dom`

Do not add a large testing ecosystem without need.

Prioritize deterministic, high-value tests.

Required test areas:

### Calendar and timezone helpers

Test:

* profile-timezone “today”
* adding/subtracting calendar days
* inclusive 7-, 30-, and 90-day ranges
* dates around UTC/profile-local midnight
* parsing `YYYY-MM-DD` without date shifting
* future-date validation

Use controlled timestamps where needed so tests are deterministic.

### Dashboard and summary calculations

Test:

* current seven-calendar-day filtering
* sparse weekly coverage
* averages exclude missing days
* legitimate zero values remain data
* estimated balance calculation
* latest non-null weight
* latest non-null body fat
* chronological ordering

### Form normalization

Test:

* optional empty weight becomes `null`
* optional empty body fat becomes `null`
* legitimate zero remains zero where allowed
* required numeric empty values are rejected
* no `NaN` reaches the data layer

### Profile completeness

Test:

* missing calorie target
* missing protein target
* completed profile
* zero or invalid target behavior according to current validation

### Data transformations

Test:

* weight chart excludes null values
* body-fat chart excludes null values
* protein and calorie chart data remains chronological
* one measurement does not become a misleading trend where that logic is testable

Requirements:

* Tests must use existing production helpers where possible.
* Do not duplicate the production calculations inside tests.
* Extract pure helpers only when doing so improves actual architecture.
* Avoid tests that rely on the real Supabase project.
* Avoid putting real credentials in test files.
* Do not build a complex Supabase mock system unless necessary.

Add scripts such as:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Use the repository’s actual conventions where appropriate.

## 4. Minimal integration/component tests

Add a small number of focused component tests where practical.

Good candidates:

* Error-boundary fallback behavior.
* Weekly-summary component with sparse data.
* A numeric field’s nullable normalization.
* Profile-completeness route logic.

Do not try to fully automate Google OAuth or the complete Supabase backend in this branch.

Do not add Playwright unless a clearly justified, minimal E2E setup fits safely within scope. If Playwright would materially enlarge this branch, defer it and document the recommended E2E scenarios.

## 5. TanStack Query and runtime behavior audit

Review QueryClient defaults and error behavior.

Verify:

* queries do not refetch excessively
* retries are reasonable
* authentication errors are not retried indefinitely
* mutations do not duplicate
* signed-out transitions clear or isolate user-scoped cached data correctly
* query keys remain user-scoped
* stale data from one user cannot appear for another
* daily-log/profile invalidation still works

Make changes only where a concrete problem exists.

Do not redesign the query architecture speculatively.

## 6. Dependency audit

Audit installed dependencies against source usage.

Identify:

* unused production dependencies
* unused development dependencies
* duplicate functionality
* obsolete packages
* packages present only because of earlier experiments
* packages whose removal would reduce bundle or install complexity

Requirements:

* Confirm usage through repository search before removal.
* Remove only packages that are demonstrably unused.
* Preserve packages required indirectly by shadcn/Base UI source components.
* Do not remove a dependency merely because no obvious top-level import exists if generated/source components depend on it.
* Run a clean install after dependency changes.
* Keep `package-lock.json` updated.
* Do not replace npm.
* Ensure lockfile URLs use the public npm registry.

Document removed and retained dependencies with reasoning.

## 7. Security hardening audit

Review production-facing configuration and frontend behavior.

Verify:

* no secret/service-role keys exist in source
* only Supabase URL and publishable key are used by the frontend
* `.env.local` remains ignored
* error messages do not expose credentials or internal details
* auth redirect URLs continue deriving from the current origin
* no open redirect is introduced
* no user-supplied HTML is rendered unsafely
* notes are rendered as text, not HTML
* user-owned operations rely on authenticated RLS
* caches are user-scoped
* PWA caches do not contain Supabase API responses

Review `vercel.json` headers.

Evaluate safe headers such as:

* `X-Content-Type-Options`
* `Referrer-Policy`
* frame protection
* a conservative Permissions Policy

Evaluate Content Security Policy separately.

Only implement CSP if it can be validated without breaking:

* Supabase API calls
* Google OAuth
* Vite production assets
* Sileo styles
* inline/generated styles required by the application
* PWA behavior

If a safe CSP requires broader analysis, defer it with a precise recommendation instead of adding an unverified policy.

Do not modify database RLS or migrations unless an actual security defect is found. If one is found, report it before changing applied database behavior.

## 8. PWA hardening

Audit:

* manifest validity
* service-worker registration
* cache contents
* update strategy
* installed-app reload/update behavior
* icon references
* offline shell behavior
* online-only mutation behavior

Requirements:

* Do not cache Supabase requests or authenticated JSON responses.
* Do not claim offline saves.
* Do not implement offline synchronization.
* Ensure an installed PWA can receive a new deployment without remaining indefinitely stale.
* Add a simple update-available UI only if the current service-worker strategy requires it and the implementation is reliable.
* Avoid reload loops.
* Preserve standalone behavior.
* Preserve iPhone and Android installation metadata.

## 9. Accessibility and console audit

Without performing broad visual redesign, inspect:

* console errors and warnings
* React key warnings
* Recharts warnings
* missing accessible names
* loading regions
* error fallbacks
* focus behavior after unexpected errors
* lazy-loading fallback semantics

Fix concrete regressions or accessibility issues encountered during the hardening work.

Do not reopen completed design work without evidence of a bug.

## 10. Logging and observability decision

Evaluate production error monitoring.

Do not automatically add Sentry or another external service without credentials and explicit approval.

Instead:

* document whether an error-monitoring service would add meaningful value
* define what should and should not be sent
* ensure fitness values, notes, emails, auth tokens, and API keys would not be captured as breadcrumbs/context by default
* recommend a later integration only if appropriate

Do not add analytics in this task.

## 11. Documentation

Update internal development documentation and `README.md` where appropriate.

Document:

* test commands
* test architecture
* bundle-analysis result
* lazy-route structure
* error-boundary behavior
* dependency removals
* PWA update behavior
* hardening limitations
* deferred E2E scenarios
* deferred CSP or monitoring work

Remember that the production `main` release process keeps only `README.md`; internal Markdown may remain on `development`.

Do not change the established release-cleanup workflow.

## 12. Scope protection

Do not implement:

* data export
* PDF/CSV/JSON reports
* gym challenges
* groups or invitations
* location verification
* exercise/workout tracking
* chatbot or AI
* meal-level logging
* training recommendations
* redesigns
* new profile fields
* new product tables
* production analytics
* offline data sync
* native wrappers
* App Store packaging

Do not modify:

* applied migrations
* Supabase RLS
* auth provider configuration
* product calculations unless correcting a verified defect
* selected shadcn preset
* Sileo
* current dashboard design
* current form architecture
* production URLs or credentials

## 13. Validation

Run:

```bash
npm run lint
npm run test
npm run build
git diff --check
```

If a bundle-analysis script is added, run it and include the result.

Also run the production preview:

```bash
npm run preview
```

Manually verify:

1. `/`
2. `/login`
3. `/register`
4. `/forgot-password`
5. `/update-password`
6. `/auth/callback`
7. `/onboarding`
8. `/log`
9. `/history`
10. `/progress`
11. `/settings`
12. Direct-route refreshes.
13. Google OAuth.
14. Email/password login.
15. Daily-log create/update/delete.
16. Profile update.
17. Theme switching.
18. Dashboard and Progress lazy loading.
19. Error-boundary fallback.
20. PWA manifest.
21. Service-worker registration.
22. No Supabase API responses in static cache.
23. Browser console without new warnings.

Review performance using the production build rather than only the development server.

## 14. Review before completion

Before finishing:

1. Run `git status`.
2. Run `git diff --stat`.
3. Review the complete diff.
4. Search for:

   * real keys
   * service-role keys
   * `dangerouslySetInnerHTML`
   * stale hardcoded origins
   * accidental Supabase caching
   * duplicate test logic
   * skipped tests
   * `any`
   * new console warnings
5. Confirm `.env.local` remains ignored.
6. Confirm no migration was edited.
7. Confirm no deployment occurred.
8. Confirm all new tests pass.
9. Compare bundle sizes before and after.
10. Confirm existing product behavior remains unchanged.

## Final report

Provide:

1. Executive summary.
2. Baseline findings.
3. Files created.
4. Files modified.
5. Route lazy-loading architecture.
6. Bundle size before and after.
7. Error-boundary architecture.
8. Test stack added.
9. Tests added and covered behavior.
10. Query/runtime findings.
11. Dependencies removed or retained.
12. Security findings and changes.
13. CSP decision.
14. PWA hardening changes.
15. Accessibility and console fixes.
16. Monitoring recommendation.
17. README/internal documentation changes.
18. Production-preview results.
19. Lint result.
20. Test result.
21. Build result.
22. Remaining limitations.
23. Deferred work.
24. Human-review decisions required.

Do not commit.
Do not push.
