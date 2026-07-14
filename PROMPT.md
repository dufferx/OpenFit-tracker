You are working inside the OpenFit Tracker repository on the branch `feat/profile-settings`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `feat/profile-settings`.
3. Inspect:

   * `package.json`
   * the current authentication implementation
   * the Supabase client
   * `supabase/migrations/`
   * the existing `profiles` schema
   * the current settings page
   * any local-storage profile or target implementation
   * dashboard calculations that currently depend on calorie or protein targets
   * theme-provider implementation
4. Provide a concise implementation plan before editing.
5. Do not commit or push.

## Goal

Connect user profile settings to the existing Supabase `public.profiles` table and add a clean onboarding flow for users who have not completed their essential targets.

Supabase must become the canonical source for user profile and fitness-target data.

Do not redesign the entire application in this task.

## Current stack

* React 19
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui source components
* shadcn preset `b2oWFNd6u`
* Sileo for notifications
* TanStack Query
* Supabase Auth and PostgreSQL
* Recharts
* PWA support
* English code and UI
* npm with `package-lock.json`

## Expected profile model

Verify the actual migration before implementing.

The `profiles` table conceptually includes:

* `id`
* `display_name`
* `calorie_target`
* `protein_target`
* `target_weight`
* `target_body_fat`
* `timezone`
* `theme`
* `created_at`
* `updated_at`

Do not assume every column exists without inspecting the applied migration.

If a required column is missing, create a new timestamped migration. Do not edit an already-applied migration silently.

## Required implementation

### 1. Typed profile data layer

Create a focused Supabase profile data-access module.

It must support:

* Fetch the authenticated user’s profile.
* Update the authenticated user’s profile.
* Upsert the profile safely if the trigger-created row is missing.
* Never accept an arbitrary profile owner ID from user input.
* Derive ownership from the authenticated user/session.
* Use explicit selected columns where practical.
* Throw clear errors instead of swallowing them.
* Keep database row types separate from form values when useful.

### 2. TanStack Query hooks

Add focused hooks such as:

* `useProfile`
* `useUpdateProfile`

Naming may differ if existing conventions suggest something better.

Requirements:

* Include the authenticated user ID in query keys.
* Disable the query when no authenticated user exists.
* Invalidate or update profile cache after mutations.
* Avoid duplicate requests.
* Reuse the existing QueryClient.
* Do not add another global state system.

Suggested query key:

```ts
["profile", userId]
```

### 3. Settings page

Connect the existing settings page to Supabase.

Editable fields:

* Display name
* Daily calorie target
* Daily protein target
* Target weight, optional
* Target body-fat percentage, optional
* Theme preference, if the existing schema and theme provider support it cleanly

MVP rules:

* Weight unit remains kilograms only.
* Interface remains English only.
* No social/privacy-sharing settings.
* No workout settings.
* No meal-level settings.

Validation:

* Display name may be optional unless current UX requires it.
* Calorie target must be a reasonable positive integer.
* Protein target must be a reasonable positive number.
* Target weight must be nullable.
* Target body fat must be nullable.
* Empty optional numeric inputs must be stored as `null`.
* Never store empty strings or `NaN` in numeric columns.
* Prevent duplicate submissions.
* Disable submit while saving.
* Use existing shadcn form components.
* Prefer React Hook Form and Zod if already installed or justified.
* Use Sileo only after Supabase confirms success or failure.

### 4. Onboarding flow

Implement a minimal onboarding experience for authenticated users whose essential profile settings are missing.

Essential fields:

* Daily calorie target
* Daily protein target

Recommended onboarding fields:

* Display name
* Daily calorie target
* Daily protein target
* Target weight, optional
* Target body-fat percentage, optional

Requirements:

* New authenticated users with incomplete essential targets should be redirected to onboarding.
* Completed users should not repeatedly see onboarding.
* Users must still be able to edit these values later in Settings.
* Avoid redirect loops while auth and profile queries are loading.
* Do not block password recovery or auth callback routes.
* Show a clear loading state while checking profile completeness.
* Do not fabricate default targets without user confirmation.
* If the profile row is unexpectedly missing, recover using a safe upsert.
* Add a route such as `/onboarding`.
* Protect onboarding appropriately for authenticated users only.

Profile completeness should be determined from required target values, not merely from whether a row exists.

### 5. Dashboard integration

Replace remaining local calorie and protein target sources with Supabase profile data.

Requirements:

* Calorie target comes from the authenticated user’s profile.
* Protein target comes from the authenticated user’s profile.
* Target weight and target body-fat values may be displayed where already supported.
* Show honest loading or unavailable states while the profile is loading.
* Do not fall back silently to demo values.
* Keep daily-log values sourced from Supabase.
* Keep calculations in focused utility functions where appropriate.

### 6. Progress and other consumers

Inspect all consumers of profile targets.

Update them so that:

* Protein-target comparisons use the Supabase profile.
* Calorie progress uses the Supabase profile.
* Settings and dashboard show consistent values.
* No stale local-storage target implementation remains active for authenticated users.
* Theme handling remains stable.

### 7. Theme preference

Only synchronize theme preference if it can be done without destabilizing the current theme provider.

If implemented:

* Supported values must remain:

  * `light`
  * `dark`
  * `system`
* Update the visual theme immediately after save.
* Avoid a flash or redirect loop.
* Keep a local fallback for initial rendering if needed.
* Document how remote and local preferences interact.

If this introduces unnecessary complexity, leave theme persistence local for now and document that limitation.

Do not compromise the existing light/dark/system behavior just to persist it remotely.

### 8. Database and RLS

Verify:

* `profiles.id` references `auth.users.id`.
* RLS is enabled.
* Users can select and update only their own profile.
* Insert/upsert behavior is safely supported for the authenticated owner.
* The profile trigger still works.

Do not use:

* service-role key
* secret key
* database password
* admin API
* frontend-supplied arbitrary `user_id`

If a schema or policy correction is required:

1. Create a new timestamped migration.
2. Clearly explain why.
3. Do not apply it remotely automatically.
4. Report the command the user should run after review.

### 9. Loading, empty, and error states

Handle:

* Auth session loading.
* Profile loading.
* Missing profile row.
* Incomplete profile.
* Failed profile fetch.
* Failed update.
* Retry where useful.
* Signed-out state.

Do not treat a network failure as an incomplete profile and redirect blindly to onboarding.

### 10. Cleanup

Remove or isolate obsolete authenticated-user profile storage, including:

* localStorage target values
* demo profile defaults
* duplicated target constants
* unused profile state

Do not remove unrelated local preferences without checking usage.

Do not alter:

* Sileo
* shadcn preset
* daily-log persistence
* Google OAuth
* password-reset flow
* Recharts implementation
* PWA configuration

### 11. UX requirements

Preserve the current design system.

Use semantic tokens such as:

* `bg-background`
* `bg-card`
* `text-foreground`
* `text-muted-foreground`
* `border-border`
* `bg-primary`

Maintain:

* Mobile-friendly numeric inputs
* Accessible labels
* Visible validation messages
* Keyboard navigation
* Touch-friendly controls
* Dark-mode compatibility

Do not perform broad visual redesigns in this task. UI polish and known design bugs will be handled later in `feat/ui-polish-and-bug-fixes`.

## Suggested domain type

Reuse existing generated or project types where available. Otherwise use a model similar to:

```ts
type Profile = {
  id: string
  displayName: string | null
  calorieTarget: number | null
  proteinTarget: number | null
  targetWeightKg: number | null
  targetBodyFatPercentage: number | null
  timezone: string
  theme: "light" | "dark" | "system"
  createdAt: string
  updatedAt: string
}
```

Do not duplicate types unnecessarily.

## Manual validation checklist

Test:

1. Existing authenticated user with complete profile.
2. Existing user edits calorie target.
3. Existing user edits protein target.
4. Optional target weight can be saved and cleared.
5. Optional body-fat target can be saved and cleared.
6. Refresh browser and confirm persistence.
7. Sign out and sign back in.
8. Dashboard shows persisted targets.
9. New user with incomplete profile is sent to onboarding.
10. Completing onboarding redirects to dashboard.
11. Completed user does not return to onboarding.
12. Profile query failure does not incorrectly trigger onboarding.
13. Dark/light/system theme still works.
14. Daily logs continue working.
15. Google login continues working.

## Validation

Run:

```bash
npm run lint
npm run build
```

Also run existing tests if present.

Review:

```bash
git status
git diff --stat
git diff
```

Search for secrets and obsolete local target storage.

## Final report

At the end provide:

1. Concise summary.
2. Files created.
3. Files modified.
4. Dependencies added, if any.
5. Profile-query architecture.
6. Onboarding behavior.
7. Settings persistence behavior.
8. Dashboard integration.
9. Theme persistence decision.
10. Local-storage code removed or retained.
11. Database migration or policy changes, if any.
12. Manual test checklist.
13. Lint result.
14. Build result.
15. Remaining limitations.
16. Human-review decisions required.

Do not commit or push.
