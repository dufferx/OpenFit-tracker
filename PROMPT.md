You are working inside the OpenFit Tracker repository on the branch `feat/daily-logs-database`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `feat/daily-logs-database`.
3. Inspect:

   * `package.json`
   * `src/`
   * the router and layout structure
   * the existing authentication implementation
   * the current local/demo daily-log data layer
   * `src/lib/supabase.ts`
   * `supabase/migrations/`
   * `supabase/schema.sql`, if still present
   * `.env.example`
4. Review the current database schema for `daily_logs`.
5. Provide a concise implementation plan before editing.
6. Do not commit or push.

## Goal

Replace the current local or demo daily-log persistence with real Supabase-backed persistence while preserving the existing UI and user experience.

This feature must cover only daily logs and the data plumbing needed by the existing dashboard, history, and progress views.

Do not implement profile-settings persistence in this task unless a minimal read-only fallback is strictly required for existing calculations.

## Current stack

* React 19
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui source components
* shadcn preset `b2oWFNd6u`
* Sileo for notifications
* Recharts
* Supabase Auth and PostgreSQL
* English code and UI
* npm with `package-lock.json`

## Database model

The remote database already has a `public.daily_logs` table created by migration.

Expected columns should be verified against the actual migration, but conceptually include:

* `id`
* `user_id`
* `log_date`
* `calories_consumed`
* `protein_grams`
* `total_calories_burned`
* `weight_kg`
* `body_fat_percentage`
* `notes`
* `created_at`
* `updated_at`

There must be one row per user per date.

Do not invent schema changes unless the current migration is missing something required for this feature.

## Required implementation

### 1. Install and configure TanStack Query

Use `@tanstack/react-query` for remote daily-log state.

Requirements:

* Add a single `QueryClient`.
* Add `QueryClientProvider` at the appropriate application root.
* Configure sensible defaults for this small personal app.
* Avoid excessive refetching.
* Do not add Redux or another global state library.
* Do not add React Query Devtools unless explicitly justified and development-only.

### 2. Create a typed daily-log data layer

Implement a focused data-access module for Supabase daily logs.

It should support:

* Fetch all logs for the authenticated user, ordered by `log_date` descending.
* Fetch logs within a date range.
* Fetch one log by date.
* Create a log.
* Update a log.
* Upsert a log by user and date where appropriate.
* Delete a log.
* Never accept or trust a caller-provided `user_id` when it can be derived from the authenticated session.
* Use explicit selected columns instead of `select("*")` where practical.
* Throw clear errors instead of swallowing them.
* Keep database row types separate from UI/domain types if naming conversion is needed.

### 3. Create query hooks

Add focused hooks such as:

* `useDailyLogs`
* `useDailyLogsByRange`
* `useDailyLogByDate`
* `useUpsertDailyLog`
* `useDeleteDailyLog`

Naming can differ if the existing project conventions suggest something better.

Requirements:

* Include the authenticated user ID in query keys.
* Disable user-scoped queries when there is no authenticated user.
* Invalidate all relevant daily-log queries after mutations.
* Ensure dashboard, history, and progress views refresh after create, update, or delete.
* Avoid duplicate network requests.
* Do not use optimistic updates unless implemented safely and clearly.

### 4. Replace local persistence

Replace `localStorage` or in-memory demo daily-log persistence as the source of truth for authenticated users.

Requirements:

* Supabase becomes the canonical data source.
* Do not silently merge demo records into a real user account.
* Existing demo seed data should not automatically appear for authenticated users.
* New users must see honest empty states.
* Remove or isolate obsolete daily-log local-storage code.
* Keep unrelated local preferences, such as theme, if they are intentionally local.
* Do not remove demo-only utilities that are still needed elsewhere without checking usages.

### 5. Daily-log form

Connect the existing daily-log form to Supabase.

Requirements:

* Preserve the current visual design.
* Load an existing log when the selected date already has one.
* Saving an existing date updates or upserts the row.
* Saving a new date creates the row.
* Prevent future dates.
* Required:

  * calories consumed
  * protein grams
  * total calories burned
* Optional:

  * weight
  * body-fat percentage
  * notes
* Empty optional numeric inputs must be sent as `null`, not `0`, empty string, or `NaN`.
* Numeric inputs must remain mobile-friendly.
* Disable save while loading.
* Prevent duplicate submissions.
* Show Sileo success only after Supabase confirms the mutation.
* Show meaningful Sileo errors.
* Keep the user on the form after save unless the current UX clearly expects navigation.
* Ensure the form resets or refreshes correctly when the selected date changes.

### 6. History page

Connect history to Supabase.

Requirements:

* Show authenticated user logs ordered newest first.
* Add a proper loading skeleton or loading state.
* Add an empty state for users with no records.
* Preserve edit behavior.
* Preserve delete behavior.
* Deletion must require confirmation using the existing shadcn `AlertDialog` if available.
* After deletion, refresh all affected views.
* Show Sileo success and error messages.
* Do not display another user’s data.

### 7. Dashboard integration

Replace dashboard demo calculations with real daily-log data.

Requirements:

* Today summary from today’s real log.
* Recent records from Supabase.
* Weekly averages based on actual available logs.
* Latest non-null weight.
* Latest non-null body-fat percentage.
* Estimated calorie balance:
  `calories_consumed - total_calories_burned`
* Honest empty states when data does not exist.
* Do not fabricate zero values where “no data” is more accurate.
* Keep calculations in testable utility functions rather than embedding all logic in JSX.
* Be explicit about local date handling.

Do not connect profile targets to Supabase in this task if they are still local. Preserve the existing target source temporarily and document it as a limitation.

### 8. Progress charts

Connect the existing charts to real logs.

Requirements:

* Weight chart only uses rows with non-null weight.
* Body-fat chart only uses rows with non-null body-fat percentage.
* Calories chart uses consumed and burned totals.
* Protein chart uses protein values.
* Preserve the existing Recharts implementation and chart theme variables.
* Sort chart data chronologically ascending.
* Keep filters already present.
* Add no-data states when a chart lacks enough values.
* Do not render misleading lines across absent measurements.
* Keep date parsing predictable and avoid UTC date-shift bugs.

### 9. Date and timezone handling

This is important.

Requirements:

* Treat `log_date` as a calendar date, not a UTC timestamp.
* Avoid `new Date("YYYY-MM-DD")` where it can shift the date by timezone.
* Add date parsing and formatting helpers if needed.
* Use the browser’s local date for “today” unless the existing profile timezone system is already working.
* Ensure the same selected date is sent to and read from Supabase as `YYYY-MM-DD`.
* Document any remaining timezone limitation.

### 10. Authentication and RLS assumptions

* Reuse the existing authenticated session.
* Do not bypass RLS.
* Do not use a service-role or secret key.
* Do not manually filter another user’s rows only in the frontend as a substitute for RLS.
* Ensure queries behave correctly when the auth session is still loading.
* Handle signed-out states gracefully.

### 11. Error and loading behavior

Implement clear states for:

* Initial load.
* Empty data.
* Network failure.
* Mutation failure.
* Auth session unavailable.
* Retry where useful.

Do not blanket-catch errors and replace them with generic success behavior.

### 12. Cleanup

* Remove dead daily-log demo code after confirming it is unused.
* Remove unused imports.
* Do not rewrite unrelated authentication, theming, or PWA code.
* Do not replace Sileo.
* Do not alter the shadcn preset.
* Do not modify the database migration unless a real blocker is found.
* If a migration change is necessary, create a new timestamped migration. Never edit an already-applied migration silently.

## Suggested query-key structure

Use a predictable structure similar to:

```ts
["daily-logs", userId]
["daily-logs", userId, "range", from, to]
["daily-logs", userId, "date", logDate]
```

You may improve this if the project has a better established convention.

## Suggested domain type

Use the existing type if one already exists. Otherwise use a typed model similar to:

```ts
type DailyLog = {
  id: string
  userId: string
  logDate: string
  caloriesConsumed: number
  proteinGrams: number
  totalCaloriesBurned: number
  weightKg: number | null
  bodyFatPercentage: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}
```

Do not duplicate types unnecessarily.

## Validation

At minimum, run:

```bash
npm run lint
npm run build
```

Also run any existing tests if the repository already has them.

Manually review:

* New user with no logs.
* Create today’s log.
* Refresh browser and confirm persistence.
* Edit today’s log.
* Create a past-date log.
* Delete a log.
* Dashboard refreshes.
* History refreshes.
* Progress charts refresh.
* Sign out and sign in again.
* Confirm records remain.
* Confirm no demo records appear.
* Confirm future dates are blocked.

## Security review

Before finishing:

* Search for real keys or secrets.
* Confirm no service-role usage.
* Confirm `.env.local` remains ignored.
* Confirm all daily-log operations use the browser Supabase client and rely on authenticated RLS.
* Confirm no query accepts arbitrary `user_id` from form input.

## Final report

At the end provide:

1. Concise summary.
2. Files created.
3. Files modified.
4. Dependencies added.
5. Daily-log query architecture.
6. How create/update/delete works.
7. How dashboard/history/progress were connected.
8. Demo/local-storage code removed or retained.
9. Manual test checklist.
10. Lint result.
11. Build result.
12. Remaining limitations.
13. Any database or human-review decision needed.

Do not commit or push.

