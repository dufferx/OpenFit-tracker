You are working inside the OpenFit Tracker repository on the branch `feat/dashboard-and-progress`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `feat/dashboard-and-progress`.
3. Inspect:

   * `src/pages/Dashboard.tsx`
   * `src/pages/Progress.tsx`
   * daily-log query hooks
   * profile query hooks
   * calculation helpers
   * calendar-date helpers
   * timezone helpers
   * chart components and Recharts usage
   * Supabase daily-log data access
   * existing shadcn/ui components
   * the previous audit findings
4. Confirm that the timezone-boundary fix is present and integrated.
5. Run `git status`.
6. Provide a concise implementation plan before editing.
7. Do not commit or push.

## Goal

Complete and correct the dashboard and progress experience using real Supabase data, shared date-range logic, accurate summaries, mobile-accessible filters, and correctly formatted charts.

This feature must preserve the existing architecture, design system, authentication, profile persistence, daily-log persistence, timezone behavior, and PWA support.

## Scope

Implement:

* Shared inclusive calendar ranges.
* Correct seven-calendar-day dashboard summary.
* Logged-day coverage.
* Today’s burned-calorie dashboard metric.
* Mobile-accessible progress filters.
* All-time progress range.
* Correct chart tooltips and units.
* Protein target reference line.
* Shared chart and range transformations.
* Responsive and theme-safe chart behavior.

Do not implement broad UI redesign, unrelated bug fixes, bundle optimization, automated test infrastructure, or deployment work.

## Current stack

* React 19
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui source components
* shadcn preset `b2oWFNd6u`
* Sileo
* Recharts
* TanStack Query
* Supabase Auth and PostgreSQL
* Profile-timezone-based calendar dates
* English code and UI
* npm with `package-lock.json`

## 1. Shared date-range definitions

Create or improve shared calendar-range helpers.

Supported ranges:

* Last 7 days
* Last 30 days
* Last 90 days
* All time

Requirements:

* Use inclusive calendar dates.
* Use the authenticated user’s profile timezone.
* Last 7 days means today plus the previous 6 calendar dates.
* Last 30 days means today plus the previous 29 calendar dates.
* Last 90 days means today plus the previous 89 calendar dates.
* Avoid imprecise millisecond subtraction.
* Avoid `new Date("YYYY-MM-DD")`.
* Return stable `YYYY-MM-DD` boundaries.
* Reuse the existing timezone/calendar helpers from the previous fix.
* Do not duplicate range math inside page components.

Create a typed range identifier, for example:

```ts
type ProgressRange = "7d" | "30d" | "90d" | "all"
```

Use the existing naming convention if one already exists.

## 2. Daily-log query behavior

Inspect the current daily-log hooks.

Requirements:

* Use range queries for 7/30/90-day progress views.
* Add or reuse a correct all-time query.
* Preserve authenticated user-scoped query keys.
* Preserve mutation invalidation behavior.
* Avoid fetching duplicate data unnecessarily.
* Do not break dashboard, history, or daily-log editing.
* Explicitly document any current 1,000-row Supabase result limitation.
* Do not add pagination unless necessary for the current implementation.
* Do not add database aggregation functions for this MVP.

Suggested query behavior:

```ts
["daily-logs", userId, "range", from, to]
["daily-logs", userId, "all"]
```

Use the project’s established query-key factory if present.

## 3. Dashboard weekly summary

Correct the current weekly summary.

Current incorrect behavior:

* It uses the latest seven log rows, which may span more than seven calendar days.

Required behavior:

* Use only today and the preceding six calendar dates in the profile timezone.
* Exclude missing days from averages.
* Do not treat missing days as zero.
* Report coverage explicitly.

Example copy:

```text
Average across 4 of 7 days
```

Summary metrics should include:

* Average calories consumed.
* Average protein.
* Average total calories burned.
* Average estimated energy balance.
* Logged days out of 7.

Requirements:

* A valid zero value is data and must not be treated as missing.
* No logs should show an honest empty state.
* One or more logs should calculate only from available logged days.
* Keep energy balance as:
  `caloriesConsumed - totalCaloriesBurned`
* Preserve wording that energy balance is estimated.
* Put calculations in pure helpers rather than inline JSX.

## 4. Today dashboard metrics

Add today’s user-entered total calories burned as a visible dashboard metric.

Requirements:

* Use today in the profile timezone.
* Source the value from today’s real Supabase daily log.
* Show `—` when no log exists.
* Show `0 kcal` when the user explicitly logged zero.
* Keep consumed calories, protein, burned calories, and estimated balance visually distinct.
* Preserve existing target behavior.
* Do not fabricate data.

Review the dashboard card layout so the additional metric remains responsive without broad redesign.

## 5. Dashboard measurements

Preserve and verify:

* Latest non-null weight.
* Latest non-null body-fat percentage.
* Profile target weight.
* Profile target body-fat percentage.
* Existing no-data states.
* Existing chart behavior.

Do not add change-from-start calculations in this task.

## 6. Progress filters

Add four filters:

* 7 days
* 30 days
* 90 days
* All time

Requirements:

* Filters must be accessible and visible on mobile.
* Do not hide them below the `sm` breakpoint.
* Use existing shadcn components where appropriate.
* A compact `Tabs`, segmented control, or horizontal-scroll control is acceptable.
* The selected state must be clear.
* Touch targets must remain mobile-friendly.
* Filters must work at approximately 320 px width.
* Avoid chart overflow.
* Changing filters must update the underlying query or transformation correctly.
* Preserve loading, error, and empty states.

## 7. All-time behavior

Implement an All time view.

Requirements:

* Fetch all available current-user logs using the existing Supabase data layer.
* Sort chronologically ascending for charts.
* Clearly document the existing row-limit behavior if the query currently caps at 1,000 rows.
* Do not silently label a truncated result as complete all-time data.
* For the current MVP, it is acceptable to use the current safe query limit and document the limitation.
* Do not add database pagination unless the existing implementation requires it to function correctly.

## 8. Shared chart transformations

Extract pure reusable helpers for:

* Sorting logs chronologically.
* Creating calories chart data.
* Creating protein chart data.
* Creating weight chart data.
* Creating body-fat chart data.
* Excluding null measurements.
* Preserving legitimate zero values.
* Producing local-calendar display labels.
* Weekly summary calculations.
* Logged-day coverage.

Requirements:

* Keep domain logic out of JSX where practical.
* Use strict TypeScript.
* Avoid `any`.
* Do not duplicate transformations between Dashboard and Progress.
* Do not introduce a new date library.

## 9. Chart tooltip formatting

Replace unconfigured default Recharts tooltips with reusable formatting.

Tooltips must display:

* Localized calendar date.
* Calories consumed: `kcal`
* Calories burned: `kcal`
* Protein: `g`
* Weight: `kg`
* Body fat: `%`

Requirements:

* Use readable labels, not raw property keys.
* Use the user’s local display locale where appropriate.
* Keep stored dates as `YYYY-MM-DD`.
* Do not cause timezone shifts while formatting.
* Work in light and dark themes.
* Preserve shadcn chart variables.
* Do not hardcode unrelated colors.
* Reuse a shared tooltip component or formatter where practical.

## 10. Protein target reference line

Add a profile-backed target reference line to the protein chart.

Requirements:

* Use the current profile’s `proteinTarget`.
* Update when the profile target changes without a full reload.
* Do not render the line when no valid target exists.
* Label it clearly, for example:
  `Target: 155 g`
* Use a chart semantic variable or an existing theme-compatible color.
* Keep the chart legible in dark mode.
* Do not add target lines to unrelated charts.

## 11. Measurement chart behavior

Verify:

* Weight chart includes only non-null weight values.
* Body-fat chart includes only non-null body-fat values.
* Missing values are never converted to zero.
* One measurement shows a no-trend state rather than a misleading line.
* Two or more measurements render the trend.
* Data is sorted ascending.
* Tooltips show correct units and dates.
* Charts remain responsive.

Do not add a seven-day moving average in this task.

## 12. Loading, empty, and error states

Preserve distinct states for:

* Profile loading.
* Daily-log loading.
* Query error.
* No logs.
* No measurements.
* One measurement.
* Populated charts.

Requirements:

* Do not show temporary zero values while loading.
* Provide retry where useful.
* Do not redirect to onboarding on a network error.
* Avoid layout jumps where a skeleton is already appropriate.

## 13. Responsive behavior

Manually inspect and improve only what is necessary for this feature.

Requirements:

* Filters usable at 320 px width.
* Charts do not overflow cards.
* Dashboard stat cards wrap cleanly.
* Tooltips remain usable on mobile.
* Chart labels do not become unreadable.
* No broad redesign.
* Preserve the selected shadcn preset.

Pure spacing, typography, greeting copy, animations, and unrelated visual issues belong to the later `feat/ui-polish-and-bug-fixes` branch.

## 14. Scope protection

Do not implement:

* Time-based greeting fix.
* Broad layout redesign.
* New social features.
* Meal-level logging.
* Training tracking.
* Bundle splitting.
* Dependency cleanup.
* Error boundaries.
* Monitoring.
* Automated test infrastructure unless already available.
* Production deployment.
* New database migrations unless an actual blocker is discovered.
* Pagination beyond what is required for current All time behavior.

Do not modify:

* Auth flows.
* Google OAuth.
* Password reset.
* Supabase RLS.
* Profile onboarding logic.
* Daily-log form behavior except where shared helpers require a safe non-visual adjustment.
* PWA setup.
* Sileo.
* shadcn preset.

## 15. Validation

Run:

```bash
npm run lint
npm run build
```

Run existing tests if present.

Manually test:

1. User with no logs.
2. User with one log today.
3. User with legitimate zero values.
4. Two logs in the last seven days.
5. Seven logs spread over more than seven days.
6. Logs on exactly the last seven calendar dates.
7. Missing weight values.
8. Missing body-fat values.
9. Exactly one weight measurement.
10. Exactly one body-fat measurement.
11. 7-day filter.
12. 30-day filter.
13. 90-day filter.
14. All-time filter.
15. Filters at 320 px width.
16. Light theme.
17. Dark theme.
18. System theme.
19. Protein target changed while progress is already cached.
20. Daily log created, edited, and deleted.
21. Dashboard and progress update after mutations.
22. Browser console has no Recharts warnings.
23. No date shifts around profile-local midnight.

## 16. Review requirements

Before finishing:

* Run `git status`.
* Run `git diff --stat`.
* Review the full diff.
* Search for:

  * `slice(0, 7)`
  * hardcoded target values
  * raw Recharts `<Tooltip />`
  * hidden mobile range controls
  * duplicate range calculations
  * `new Date("YYYY-MM-DD")`
  * demo data
  * localStorage profile or daily-log values
* Confirm no secrets were added.
* Confirm `.env.local` remains ignored.

## Final report

Provide:

1. Concise summary.
2. Files created.
3. Files modified.
4. Shared range architecture.
5. Weekly-summary calculation behavior.
6. Dashboard burned-calorie implementation.
7. Progress filter behavior.
8. All-time behavior and limitations.
9. Chart transformation architecture.
10. Tooltip formatting.
11. Protein target reference-line behavior.
12. Responsive validation.
13. Dependencies added or removed.
14. Database changes, if any.
15. Manual test checklist.
16. Lint result.
17. Build result.
18. Remaining limitations.
19. Items intentionally deferred to `feat/ui-polish-and-bug-fixes`.
20. Human-review decisions required.

Do not commit.
Do not push.
