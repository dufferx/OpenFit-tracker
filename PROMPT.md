You are working inside the OpenFit Tracker repository on the branch `feat/dashboard-reference-redesign`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `feat/dashboard-reference-redesign`.
3. Read the complete root-level `backlog.md`.
4. Locate and inspect:

   * `OpenFit Dashboard.html`
   * `docs/design-references/openfit-dashboard-reference.png`
   * `src/pages/Dashboard.tsx`
   * existing dashboard components
   * shared chart components
   * profile and daily-log query hooks
   * timezone and calendar-range helpers
   * shadcn/ui source components
   * layout/sidebar/mobile navigation
5. Render or otherwise inspect the supplied HTML reference if necessary to understand variants:

   * desktop `2a`, “Refined grid — desktop”
   * mobile `1c`, “Refined grid”
6. Run:

   * `git status`
   * `git log --oneline --decorate -10`
7. Provide a concise implementation plan before editing.
8. Do not commit or push.

## Goal

Implement `DASHBOARD-001` from `backlog.md`.

Redesign the authenticated OpenFit Tracker Dashboard so it closely matches the supplied desktop and mobile design references while preserving the existing production architecture, real data, calculations, accessibility, themes, and product meaning.

Treat `backlog.md` as the primary source of truth for the exact requirements and acceptance criteria.

Do not implement unrelated pending backlog items in this task.

## Design-reference rules

The supplied HTML and PNG are visual references only.

Do not copy:

* bundled application code
* inline CSS wholesale
* demo values
* static SVG chart points
* hardcoded colors
* unsupported health interpretations
* the reference application shell
* reference fonts that are not part of OpenFit Tracker

Translate the reference using:

* React
* TypeScript
* Tailwind CSS
* existing shadcn/ui source components
* semantic theme tokens
* Recharts through the existing shadcn Chart integration
* real Supabase data
* current profile-timezone and calendar-range helpers

Visual fidelity is important, but data correctness, accessibility, product semantics, and repository constraints take priority over pixel-perfect copying.

## Required dashboard structure

Implement the layout described in `DASHBOARD-001`.

### Header

* Show the profile-local formatted date above the greeting.
* Keep the greeting and display name.
* Use a time-appropriate greeting rather than a fixed greeting if the existing helper architecture allows it cleanly.
* Add a primary `Add daily log` action linked to `/log` on desktop.
* Do not use meal-level wording such as `Log food`.
* Ensure the action remains keyboard accessible.
* Determine a sensible mobile treatment without duplicating the existing bottom-navigation Log action unnecessarily.

### KPI grid

Use exactly four primary KPI cards:

1. Calories consumed
2. Protein
3. Calories burned
4. Estimated balance

Requirements:

* Four cards in one row on sufficiently wide desktop.
* Two-by-two grid on approximately 320–400 px mobile.
* Preserve accessible Progress bars for calorie and protein targets.
* Display current value and target clearly.
* Missing values display `—`.
* Legitimate zero values display `0` with the correct unit.
* Burned calories must be described as user-entered total calories burned.
* Estimated balance must remain factual and neutral.
* Do not classify a balance as mild, ideal, healthy, or suitable for recomposition.
* Use Lucide icons and existing semantic tokens.
* Preserve responsive density similar to the reference.

### Main dashboard area

Desktop:

* Use an approximate `1.65fr 1fr` split.
* Weight trend is the dominant left card.
* Weekly summary is the right card.

Mobile:

* Weight trend stacks first.
* Weekly summary stacks below.
* Both are full width.
* No horizontal overflow at 320 px.

### Weight card

Preserve:

* real Supabase measurements
* chronological order
* profile-timezone date handling
* shadcn Chart/Recharts implementation
* localized tooltips
* correct `kg` units
* no-measurement state
* one-measurement state
* populated trend state
* theme-safe colors

Display within the weight composition:

* latest non-null weight
* target weight when available
* latest non-null body-fat percentage
* target body-fat percentage when available

Do not:

* add weekly-weight-change calculations
* add start-to-goal percentages
* fabricate a starting baseline
* convert missing values to zero

Body-fat details should fit naturally into the dominant measurement composition without adding two additional primary KPI cards.

### Weekly summary

Preserve the existing correct behavior:

* today plus the preceding six profile-local calendar dates
* `Average across X of 7 days`
* average calories consumed
* average protein
* average calories burned
* average estimated balance
* missing days excluded
* legitimate zero values retained

Match the reference’s density, hierarchy, spacing, and right-column visual weight without changing calculations.

## Visual-system requirements

Preserve:

* shadcn preset `b2oWFNd6u`
* Inter
* Lucide icons
* semantic theme tokens
* green chart variables
* light, dark, and system themes
* current desktop sidebar
* current mobile bottom navigation
* current PageHeader or product-specific compositions where appropriate

Use tokens such as:

* `bg-background`
* `bg-card`
* `bg-muted`
* `bg-primary`
* `bg-accent`
* `text-foreground`
* `text-muted-foreground`
* `border-border`
* `var(--chart-*)`

Do not add:

* Plus Jakarta Sans
* Space Grotesk
* another component library
* Sonner
* hardcoded light-only colors
* reference-specific CSS reset or application shell

## Component strategy

Reuse existing shadcn source components where appropriate:

* Card
* Button
* Progress
* Badge
* Chart
* Skeleton
* Empty
* Alert
* Spinner

Create focused dashboard composition components if that improves readability, for example:

* dashboard header
* KPI card
* weight summary/chart card
* weekly summary card

Do not over-abstract small one-off markup.

Keep product-specific compositions inside an appropriate dashboard folder rather than forcing them into generic `ui` primitives.

## Data and architecture constraints

Continue using:

* current authenticated user
* `useProfile`
* daily-log queries
* current TanStack Query keys
* existing mutation invalidation
* real profile targets
* real daily logs
* timezone-aware today
* shared seven-day summary calculations
* shared chart transformations

Do not modify:

* Supabase schema
* migrations
* RLS
* authentication
* OAuth
* password reset
* onboarding
* profile persistence
* daily-log persistence
* progress-page behavior
* PWA configuration

No database migration should be necessary.

## State requirements

Preserve distinct:

* loading state
* profile error
* daily-log error
* no logs
* no today log
* no measurements
* one measurement
* populated dashboard
* mutation-refreshed dashboard

Do not show temporary zeros while loading.

Use the standardized Empty, Alert, Skeleton, and Spinner components introduced in the previous feature.

## Accessibility requirements

Maintain or improve:

* semantic headings
* keyboard-accessible primary action
* visible focus states
* accessible Progress semantics
* chart labels and tooltips
* text contrast
* touch targets
* responsive reading order
* screen-reader distinction between missing and zero data
* no information conveyed only through color

## Responsive validation

Validate at minimum:

* 320 px
* 375 px
* 400 px
* tablet width
* normal desktop width
* wide desktop
* 200% browser zoom

Requirements:

* no horizontal page overflow
* KPI cards remain readable
* chart remains usable
* weekly summary does not become excessively tall or cramped
* header action does not collide with greeting/date
* sidebar and mobile bottom navigation remain unchanged
* content is not obscured by mobile navigation or safe-area spacing

## Backlog update

Update `DASHBOARD-001` in `backlog.md` only after all acceptance criteria are validated.

When complete:

* Change status to `done`.
* Add a concise completion note.
* Preserve the original rationale and acceptance criteria.
* Keep the human-review decision about weight-change and starting-baseline features unresolved.
* Do not change unrelated backlog statuses.

## Validation

Run:

```bash
npm run lint
npm run build
git diff --check
```

Run existing tests if present.

Manually validate:

1. No authenticated data.
2. No today log.
3. Today log with normal values.
4. Today log with legitimate zero values.
5. Missing calorie or protein targets during transient loading.
6. No weight measurements.
7. Exactly one weight measurement.
8. Multiple weight measurements.
9. Missing body-fat measurements.
10. Complete weekly coverage.
11. Sparse weekly coverage.
12. Light theme.
13. Dark theme.
14. System theme.
15. 320 px mobile.
16. 375–400 px mobile.
17. Desktop reference width.
18. 200% zoom.
19. Add daily log navigation.
20. Daily-log create/update refresh.
21. Browser console without Recharts warnings.

If possible, capture or generate screenshots at desktop and mobile reference widths and compare them directly with the supplied reference.

## Scope protection

Do not implement:

* Field component form refactor
* Input Group refactor
* official Select refactor
* History Item refactor
* application Sidebar refactor
* deployment
* bundle splitting
* dependency cleanup
* test-infrastructure setup
* meal logging
* workout logging
* weekly weight-change badge
* start-to-goal percentage
* health recommendations or interpretations

## Review before completion

Before finishing:

1. Run `git status`.
2. Run `git diff --stat`.
3. Review the complete diff.
4. Search for:

   * hardcoded demo values
   * unsupported health claims
   * copied reference CSS
   * static chart data
   * hardcoded light-only colors
   * new date calculations
   * changes to Supabase or Auth
   * horizontal overflow risks
5. Confirm no secrets were added.
6. Confirm `.env.local` remains ignored.
7. Confirm no migration was modified.
8. Confirm only `DASHBOARD-001` was changed to `done`.

## Final report

Provide:

1. Executive summary.
2. Reference files inspected.
3. Visual mapping decisions.
4. Files created.
5. Files modified.
6. Dashboard component architecture.
7. Header implementation.
8. KPI grid implementation.
9. Weight-card implementation.
10. Weekly-summary implementation.
11. Measurement placement.
12. Empty/loading/error-state behavior.
13. Accessibility improvements.
14. Mobile comparison result.
15. Desktop comparison result.
16. Theme validation.
17. Dependencies added or removed.
18. Database changes.
19. `backlog.md` update.
20. Lint result.
21. Build result.
22. Remaining visual differences.
23. Human-review decisions still pending.

Do not commit.
Do not push.
