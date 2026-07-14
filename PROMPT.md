You are working inside the OpenFit Tracker repository on the branch `fix/daily-log-timezone-boundary`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `fix/daily-log-timezone-boundary`.
3. Inspect:

   * all Supabase migrations
   * the `profiles` schema
   * the daily-log future-date trigger
   * profile onboarding and settings
   * `src/lib/calendar-date.ts`
   * daily-log form date validation
   * dashboard “today” calculations
   * progress date-range calculations
   * history date formatting
   * profile query and mutation code
4. Confirm whether `profiles.timezone` exists in the current migration history.
5. Provide a concise implementation plan before editing.
6. Do not commit or push.

## Goal

Make calendar-date ownership consistent across:

* the user profile
* the browser application
* daily-log form validation
* dashboard “today”
* date-range calculations
* Supabase future-date validation

The canonical timezone for authenticated user calendar dates must be `profiles.timezone`.

Do not implement dashboard-summary or progress-chart enhancements in this task.

## Current problem

The client currently constructs calendar dates using browser-local time, while the database future-date guard compares `log_date` against a UTC-derived current date.

This can reject a valid user-local “today” near midnight and can make dashboard/range calculations disagree with database validation.

## Required behavior

### 1. Canonical timezone

Use `profiles.timezone` as the authenticated user’s canonical calendar timezone.

Requirements:

* Use valid IANA timezone strings, for example:

  * `America/El_Salvador`
  * `America/New_York`
  * `Asia/Manila`
* Do not use raw UTC offsets as persistent timezone identifiers.
* Do not silently overwrite an existing valid profile timezone.
* If a profile timezone is missing, initialize it from:

```ts
Intl.DateTimeFormat().resolvedOptions().timeZone
```

* If the browser does not provide a valid timezone, use a documented safe fallback.
* Keep the MVP interface in English.

### 2. Shared calendar-date helpers

Create or improve focused date helpers that can:

* Return today as `YYYY-MM-DD` in a supplied IANA timezone.
* Validate whether a calendar date is in the future relative to a supplied timezone.
* Add or subtract calendar days without UTC date-shift bugs.
* Produce inclusive date-range boundaries.
* Parse and format `YYYY-MM-DD` without using `new Date("YYYY-MM-DD")`.
* Preserve calendar dates exactly when sent to Supabase.

Use native `Intl` APIs unless an already installed dependency clearly provides a safer implementation.

Do not add a new date library without strong justification.

### 3. Profile initialization

Ensure new or incomplete profiles receive a timezone safely.

Inspect the current onboarding and profile-update behavior.

Implement one of these approaches, preferring the least invasive:

* Set the browser-detected timezone during onboarding/profile completion.
* Upsert it when an authenticated profile is missing timezone.
* Add a safe database default only if that default is semantically appropriate.

Do not fabricate `America/El_Salvador` for every user.

If a database migration is needed, create a new timestamped migration. Do not edit an already-applied migration.

### 4. Daily-log form

Update daily-log validation so:

* “Today” is calculated using the profile timezone.
* Future dates are rejected relative to the profile timezone.
* The selected date remains a plain `YYYY-MM-DD` calendar date.
* Loading the profile does not briefly permit or reject the wrong dates.
* A missing or failed profile query is handled explicitly.
* Existing create and update behavior remains unchanged.
* Optional numeric values remain `null` when empty.

### 5. Dashboard

Update only the date ownership required for correctness:

* Today’s log must be selected using today in the profile timezone.
* Do not yet change weekly-summary logic.
* Do not add new dashboard cards in this task.
* Do not perform visual redesigns.

### 6. Progress ranges

Update only the date ownership required for correctness:

* 7-, 30-, and 90-day boundaries must use the profile timezone.
* Keep existing filters and charts otherwise unchanged.
* Do not add “All time” in this task.
* Do not change tooltip formatting in this task.

### 7. Database future-date validation

Inspect the existing future-date trigger or constraint.

The database must validate a daily log against the owning user’s profile timezone.

Requirements:

* Derive the owner from `NEW.user_id`.
* Read the owner’s timezone from `public.profiles`.
* Convert the current timestamp into that timezone before deriving the current calendar date.
* Reject `NEW.log_date` only when it is after the owner’s current calendar date.
* Define safe behavior when the profile or timezone is missing.
* Use an explicit safe `search_path`.
* Preserve RLS and ownership guarantees.
* Do not use frontend-provided timezone values for database enforcement.
* Do not use service-role access from the frontend.
* Create a new timestamped migration rather than modifying the applied initial migration.
* Do not apply the migration remotely automatically.

Review PostgreSQL timezone semantics carefully. Avoid comparing against UTC when the application uses user calendar dates.

### 8. Existing records

Do not rewrite existing daily logs.

This fix concerns:

* validation
* date ownership
* range boundaries
* current-day selection

Existing `log_date` values must remain unchanged.

### 9. Error behavior

Handle:

* Profile loading.
* Missing timezone.
* Invalid stored timezone.
* Failed profile query.
* Database rejection.
* Browser timezone unavailable.

Do not silently switch between browser time and UTC in different parts of the application.

### 10. Scope protection

Do not implement:

* Weekly-summary corrections.
* Burned-calorie dashboard card.
* All-time range.
* Mobile progress-filter redesign.
* Tooltip formatting.
* Protein target reference line.
* Broad UI polish.
* Bundle optimization.
* Automated test infrastructure unless tests already exist.

Those belong to later features.

## Validation

Run:

```bash
npm run lint
npm run build
```

If an existing test runner is available, add focused tests for pure date helpers and run them.

Manually reason through or test these cases:

1. User timezone `America/El_Salvador`.
2. User timezone `Asia/Manila`.
3. Browser timezone differs from profile timezone.
4. UTC date differs from profile-local date.
5. Local time immediately before midnight.
6. Local time immediately after midnight.
7. Today’s log is accepted.
8. Tomorrow’s local calendar date is rejected.
9. Existing past logs remain editable.
10. Dashboard selects the profile-local current date.
11. Progress ranges remain inclusive.
12. Invalid stored timezone produces explicit safe behavior.

## Database review

At the end provide:

1. The new migration filename.
2. Exact description of the trigger behavior.
3. Whether the existing `profiles.timezone` migration must be applied first.
4. The command the user should run after reviewing the migration:

```bash
npx supabase db push
```

Do not run that command yourself.

## Final report

Provide:

1. Concise summary.
2. Files created.
3. Files modified.
4. Date-helper architecture.
5. Profile-timezone initialization behavior.
6. Client-side validation behavior.
7. Database validation behavior.
8. Migration created.
9. Manual test checklist.
10. Lint result.
11. Build result.
12. Remaining limitations.
13. Human-review decisions required.

Do not commit.
Do not push.
