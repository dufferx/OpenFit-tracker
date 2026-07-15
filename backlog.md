# Bugs and enhancements

## BUG-001 — Make Sileo toast descriptions readable in dark mode

- Type: `bug`
- Priority: `P1`
- Status: `done`
- Completed: Sileo now follows the resolved application theme, uses the semantic popover surface, and renders descriptions with `popover-foreground` contrast from one central override.
- Suggested branch: `fix/sileo-dark-mode-contrast`
- Current evidence:
  - `src/main.tsx` imports the default `sileo/styles.css`.
  - `src/App.tsx` renders the shared Sileo `Toaster`.
  - Actions such as daily-log save errors and successes include a `description`, but the description text does not have sufficient contrast in dark mode.
- Scope:
  - Inspect Sileo's rendered elements and supported styling API before adding the smallest theme-aware override.
  - Use existing semantic tokens such as `text-foreground`, `text-muted-foreground`, `bg-popover`, and `border-border` where Sileo permits them.
  - Preserve Sileo; do not install or substitute Sonner or another toast system.
  - Apply the fix centrally so success and error descriptions across Auth, Layout, Log, History, Settings, and profile flows remain consistent.
- Acceptance criteria:
  - Toast titles and descriptions are clearly readable in light, dark, and system themes.
  - Description text meets WCAG AA contrast for normal text against the actual toast background.
  - Success, error, and neutral toast styling remains visually distinguishable without hardcoded light-only colors.
  - Toast announcements, timing, actions, and placement continue to work.
  - Verify at mobile and desktop widths and run `npm run lint` and `npm run build`.

## ENH-001 — Redirect to Home after saving a daily log

- Type: `enhancement`
- Priority: `P1`
- Status: `done`
- Completed: confirmed creates and updates keep the existing success toast and invalidation, then replace `/log` with `/` in browser history.
- Suggested branch: `feat/log-save-home-redirect`
- Current evidence: `src/pages/LogPage.tsx` waits for `saveLog.mutateAsync(input)` and shows a confirmed Sileo success toast, but remains on `/log` after both create and update operations.
- Required behavior:
  - After Supabase confirms a successful create or update, show the existing meaningful success toast and redirect to the Home/Dashboard route `/`.
  - Use React Router navigation and replace the completed form entry in browser history so Back does not immediately reopen the just-submitted form.
  - Preserve daily-log query invalidation so Home renders the newly created or updated values without a manual refresh.
  - Do not navigate before the mutation resolves.
  - On validation or Supabase failure, remain on the form, preserve the entered values, and show the existing Sileo error feedback.
  - Keep the submit button disabled while pending and prevent duplicate submissions.
- Acceptance criteria:
  - Creating today's log redirects to `/` only after a confirmed save.
  - Updating an existing log redirects to `/` only after a confirmed update.
  - Dashboard cards, weekly summary, and charts reflect the mutation through the existing cache invalidation.
  - A failed save does not redirect or clear the form.
  - The success toast remains visible and readable after navigation in all theme modes.
  - Browser Back does not return directly to the completed `/log` submission.
  - Run `npm run lint` and `npm run build` and manually test create, edit, failure, and duplicate-submit cases.

# shadcn/ui Adoption

Last audited: 2026-07-14
Branch audited: `feat/ui-polish-and-bug-fixes`
Status: active backlog; dashboard/progress replacements completed on `feat/dashboard-and-progress`

## Goal

Track places where an official shadcn/ui source component can replace repeated or lower-level UI code with clearer accessibility, behavior, and design-system consistency. This backlog does not require replacing product-specific composition simply because it is custom.

The repository must keep the selected `b2oWFNd6u` preset, semantic theme tokens, Lucide icons, and Sileo notifications. Add components as source under `src/components/ui/`; do not introduce a competing UI library or Sonner.

## Priority and status

- `P0`: correctness, destructive-action safety, or significant accessibility issue.
- `P1`: high-value consistency or accessibility improvement.
- `P2`: useful consolidation suitable for an adjacent feature.
- `P3`: optional evaluation; implement only when the affected area is already changing.
- Status values: `backlog`, `in-progress`, `done`, `declined`.

## Feature design backlog

### DASHBOARD-001 — Match the supplied OpenFit dashboard reference

- Priority: `P1`
- Status: `done`
- Completed: Dashboard now matches the supplied responsive hierarchy with a profile-local header, four compact daily KPI cards, a dominant measurement trend, and a seven-day summary while preserving real data, timezone calculations, accessibility, themes, and distinct empty states.
- Suggested branch: `feat/dashboard-reference-redesign`
- Reference source: [`OpenFit Dashboard.html`](./OpenFit%20Dashboard.html)
- Rendered reference: [`docs/design-references/openfit-dashboard-reference.png`](./docs/design-references/openfit-dashboard-reference.png)
- Reference variants:
  - Desktop `2a`, labeled “Refined grid — desktop”.
  - Mobile `1c`, labeled “Refined grid”.
- Context: the HTML is a bundled visual design artifact with inline demo values, fonts, colors, and SVG charts. It is a design reference, not production code and must not be copied into the React application.

#### Goal

Redesign the authenticated home/Dashboard view so it is visually the same as the supplied reference at equivalent desktop and mobile widths: match its information hierarchy, card proportions, grid, spacing rhythm, compact KPI presentation, weight-chart emphasis, and weekly-summary placement. “The same” means strong visual fidelity after translating the artifact into the existing React, shadcn/ui, Tailwind, Recharts, semantic-token, and responsive architecture. Data correctness, accessibility, and repository constraints take precedence over literal inline-style parity.

#### Required layout mapping

- Header:
  - Show the profile-local formatted calendar date above the greeting.
  - Keep the greeting and display name.
  - Add a primary `Add daily log` action linked to `/log` on desktop; do not use the reference’s `Log food` wording because OpenFit records daily totals rather than meals.
- Today KPI grid:
  - Use four cards in one row on wide desktop and a two-by-two grid on mobile.
  - Cards are Calories consumed, Protein, Calories burned, and Estimated balance.
  - Show calorie and protein targets inline with their current values and retain accessible shadcn Progress bars.
  - Missing today log values display `—`; legitimate logged zeroes display `0` with the correct unit.
- Main content:
  - Desktop uses approximately the reference’s `1.65fr 1fr` split: Weight trend on the left and Weekly summary on the right.
  - Mobile stacks the Weight card above Weekly summary at full width.
  - Keep the weight chart responsive, theme-safe, chronologically sorted, and backed by the existing shadcn Chart/Recharts integration.
- Measurements:
  - Preserve latest non-null weight, latest non-null body fat, target weight, and target body fat even though the reference emphasizes weight more strongly.
  - Fit body-fat information into the summary or measurement composition without reintroducing two extra top-level KPI cards that break the reference’s four-card hierarchy.
- Weekly summary:
  - Preserve the current profile-timezone definition: today plus the preceding six calendar dates.
  - Preserve “Average across X of 7 days” coverage.
  - Preserve average calories, protein, burned calories, and estimated energy balance.
  - Missing days are excluded rather than converted to zero; legitimate zero values remain data.

#### Visual and component boundaries

- Reuse existing shadcn Card, Button, Progress, Badge, Chart, Skeleton, and other applicable source components.
- Preserve preset `b2oWFNd6u`, Inter, Lucide icons, green chart variables, semantic theme tokens, and light/dark/system themes.
- Translate the reference’s hardcoded colors into tokens such as `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-accent`, and `var(--chart-*)`.
- Do not add Plus Jakarta Sans or Space Grotesk from the reference.
- Do not copy inline CSS, hardcoded demo values, static SVG chart points, or the reference’s custom application shell.
- Preserve the existing desktop sidebar and mobile bottom navigation unless a separate application-shell feature explicitly changes them.
- Keep usable touch targets, keyboard navigation, focus states, accessible chart text/tooltips, and a minimum supported width of 320 px.
- Preserve distinct loading, error, no-log, no-measurement, one-measurement, and populated states.

#### Product and data boundaries

- Continue using real Supabase profile and daily-log data plus the shared timezone/range/chart helpers.
- Do not change Auth, profile persistence, daily-log persistence, RLS, migrations, PWA behavior, Sileo, query keys, or mutation invalidation for this visual feature.
- Do not introduce meal or exercise tracking. Label burned calories as a user-entered total, not automatically as “Exercise today”.
- Do not classify balances as “mild deficit” or similar without an explicitly approved domain rule.
- Do not show the reference’s “ideal for recomposition” claim; use neutral, factual copy derived directly from recorded values.
- Do not add start-to-goal weight percentages or weekly weight-change badges until the product owner defines which measurement is the starting baseline and approves those calculations. The layout should remain visually faithful without fabricated values when that decision is absent.

#### Acceptance criteria

- At desktop width, the result closely matches reference `2a`: date/greeting/action header, four compact KPI cards, dominant weight card, and right-side weekly summary with comparable proportions and density.
- At approximately 320–400 px, the result closely matches reference `1c`: two-by-two KPI grid followed by full-width Weight and Weekly summary cards with no horizontal overflow.
- The design works in light, dark, and system themes without hardcoded reference colors leaking into production.
- Existing timezone-correct calculations and Supabase values remain the only data source.
- Values, units, target progress, empty states, zero handling, chart tooltips, and weekly coverage remain accurate.
- No meal-level wording, unsupported health interpretation, demo data, or static chart data is introduced.
- Run `npm run lint` and `npm run build`, review the complete diff, and manually compare desktop and mobile screenshots against the supplied reference before completion.

#### Human-review decision

Decide whether a later iteration should add the reference’s weekly weight-change badge and start-to-goal progress bar. That requires an explicit product definition for the starting weight baseline and is not authorized by this backlog item.

## Replacement backlog

### SHADCN-001 — Replace browser delete confirmation with Alert Dialog

- Priority: `P0`
- Status: `done`
- Completed: History deletion now uses a controlled Base UI-backed Alert Dialog with date-specific copy, focus management, and disabled pending actions.
- Suggested branch: `fix/history-delete-confirmation`
- Current evidence: `src/pages/History.tsx` calls `window.confirm()` before deleting a daily log.
- shadcn target: [Alert Dialog](https://ui.shadcn.com/docs/components/base/alert-dialog)
- Why: the destructive action should have a consistently styled, keyboard-accessible modal with an explicit title, consequence description, Cancel action, and destructive confirmation action.
- Scope:
  - Add `src/components/ui/alert-dialog.tsx` using the selected preset.
  - Keep the existing mutation, pending state, Sileo success/error notifications, and user-owned delete behavior.
  - Prevent closing or submitting twice while deletion is pending.
- Acceptance criteria:
  - Delete opens a modal instead of a browser dialog.
  - Focus enters the dialog and returns to the triggering delete button.
  - Escape and Cancel do not delete.
  - Confirm deletes exactly once and is disabled while pending.
  - The log date is included in the confirmation copy.

### SHADCN-002 — Standardize forms with Field components

- Priority: `P1`
- Status: `done`
- Completed: Auth, profile/onboarding, settings, and daily-log forms now use the official Base UI-backed Field anatomy with React Hook Form error association, invalid states, semantic fieldsets, and the auth email separator.
- Suggested branch: `refactor/shadcn-form-fields`
- Current evidence:
  - `src/pages/Login.tsx`
  - `src/pages/Register.tsx`
  - `src/pages/ForgotPassword.tsx`
  - `src/pages/UpdatePassword.tsx`
  - `src/components/profile/profile-form.tsx`
  - `src/pages/LogPage.tsx`
  - Each repeats custom label, description, `aria-describedby`, and error-message markup.
- shadcn target: [Field](https://ui.shadcn.com/docs/components/base/field) and the official [React Hook Form composition](https://ui.shadcn.com/docs/forms/react-hook-form)
- Why: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, and `FieldSet` centralize invalid-state styling and accessible relationships while removing repeated markup.
- Scope:
  - Add the official Field source component.
  - Migrate auth and profile forms first because they already use React Hook Form and Zod.
  - Migrate the daily-log form only after or alongside its planned React Hook Form/Zod conversion; do not change its nullable-number normalization.
  - Use `FieldSeparator` for the “or use email” divider where appropriate.
- Acceptance criteria:
  - Every control retains a programmatic label.
  - Errors remain announced and associated with their controls.
  - Pending submissions remain disabled and cannot duplicate.
  - Form validation and Supabase behavior do not change.

### SHADCN-003 — Replace custom numeric suffix overlays with Input Group

- Priority: `P1`
- Status: `done`
- Completed: Profile targets and daily-log numeric controls now use the official Input Group composition with non-editable unit addons and group-level focus, invalid, and disabled styling while preserving numeric constraints and nullable values.
- Suggested branch: combine with `refactor/shadcn-form-fields`
- Current evidence:
  - `NumberField` in `src/components/profile/profile-form.tsx` absolutely positions units over inputs.
  - `src/pages/LogPage.tsx` repeats the same custom overlay for `kcal`, `g`, `kg`, and `%`.
- shadcn target: [Input Group](https://ui.shadcn.com/docs/components/base/input-group)
- Why: Input Group provides supported inline addons, unified focus styling, and consistent disabled/invalid behavior without per-page positioning code.
- Acceptance criteria:
  - Units remain visually attached but are not included in submitted values.
  - Focus rings wrap the complete control.
  - Units remain readable at 320 px width and 200% zoom.
  - Numeric constraints and empty-to-`null` behavior remain unchanged.

### SHADCN-004 — Adopt shadcn Chart wrappers for Recharts

- Priority: `P1`
- Status: `done`
- Completed: shared chart container, semantic configuration, localized tooltip, and legend source added under `src/components/ui/`.
- Suggested branch: `feat/dashboard-and-progress`
- Current evidence:
  - `src/pages/Dashboard.tsx` directly uses `ResponsiveContainer`, `Tooltip`, and `AreaChart`.
  - `src/pages/Progress.tsx` directly uses Recharts containers, tooltips, legends, axes, areas, and bars.
- shadcn target: [Chart](https://ui.shadcn.com/docs/components/radix/chart)
- Why: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, and chart configuration centralize series labels, units, colors, and theme behavior while retaining Recharts.
- Scope:
  - Add the shadcn Chart source component without replacing Recharts.
  - Define typed chart configuration for weight, body fat, calories, burned calories, and protein.
  - Coordinate with the existing dashboard/progress correctness backlog rather than creating a purely visual rewrite.
- Acceptance criteria:
  - Existing null filtering, chronological order, ranges, and no-data behavior remain correct.
  - Tooltips show localized dates and correct units.
  - Series continue using configured chart CSS variables in light and dark themes.
  - Charts remain responsive without console warnings.

### SHADCN-005 — Standardize empty states

- Priority: `P1`
- Status: `done`
- Completed: dashboard, progress, compact chart, and history empty states now share the shadcn Empty anatomy while retaining distinct messages and actions.
- Suggested branch: `feat/ui-polish-and-bug-fixes`
- Current evidence:
  - `EmptyDashboard` and `ChartEmpty` in `src/pages/Dashboard.tsx` use custom card/dashed-border markup.
  - `src/pages/Progress.tsx` has page-level and per-chart custom empty states.
  - `src/pages/History.tsx` has a custom no-records card.
- shadcn target: [Empty](https://ui.shadcn.com/docs/components/base/empty)
- Why: consistent empty-state title, description, optional icon, and action composition reduces duplicated markup and makes the next action clearer.
- Acceptance criteria:
  - Dashboard, progress, chart, and history empty states remain semantically distinct.
  - Empty states do not imply zero values.
  - Page-level empty states can link to `/log` where useful.
  - Compact chart empty states do not increase card overflow on mobile.

### SHADCN-006 — Standardize recoverable error callouts

- Priority: `P1`
- Status: `done`
- Completed: query, route, Auth callback, and configuration failures now use shared shadcn Alert composition with retry actions where recovery is available.
- Suggested branch: `feat/ui-polish-and-bug-fixes`
- Current evidence:
  - Query errors are repeated as destructive paragraphs inside cards across Dashboard, Progress, History, Settings, LogPage, and Onboarding.
  - Login auth callback errors use a custom bordered `div`.
  - Configuration and profile-route failures use custom bordered panels.
- shadcn target: [Alert](https://ui.shadcn.com/docs/components/base/alert)
- Why: Alert provides consistent title, description, destructive styling, and optional retry action while preserving `role="alert"` behavior.
- Acceptance criteria:
  - Error details remain visible and announced.
  - Recoverable errors retain a retry action.
  - Configuration errors remain useful in development without exposing secrets.
  - Sileo remains reserved for action feedback; it is not replaced by Alert.

### SHADCN-007 — Replace the simplified progress primitive with official Progress

- Priority: `P1`
- Status: `done`
- Completed: the dashboard now uses the Base UI-backed shadcn Progress anatomy and accessible value semantics.
- Suggested branch: combine with `feat/dashboard-and-progress`
- Current evidence: `src/components/ui/progress.tsx` renders two plain `div` elements and does not expose the official shadcn/Base UI progress anatomy or progressbar semantics.
- shadcn target: [Progress](https://ui.shadcn.com/docs/components/base/progress)
- Why: the official primitive provides accessible value semantics and optional label/value composition while preserving the same visual role.
- Acceptance criteria:
  - Dashboard target bars expose current, minimum, and maximum values to assistive technology.
  - Values remain visually clamped between 0% and 100%.
  - Values over target remain accurately described in nearby text.

### SHADCN-008 — Replace the custom theme select wrapper

- Priority: `P2`
- Status: `done`
- Completed: Theme preference now uses the official Base UI-backed Select with controlled React Hook Form integration; light, dark, and system remain the only values and the theme is still applied only after a confirmed profile save.
- Suggested branch: combine with `refactor/shadcn-form-fields`
- Current evidence: `src/components/ui/select.tsx` is a hand-styled native `<select>` used by the profile theme preference.
- shadcn target: [Select](https://ui.shadcn.com/docs/components/base/select) or [Native Select](https://ui.shadcn.com/docs/components/base/native-select)
- Recommendation: prefer official `Select` for design consistency; retain Native Select only if mobile platform behavior is explicitly preferred.
- Acceptance criteria:
  - Light, dark, and system remain the only options.
  - React Hook Form integration remains controlled and type-safe.
  - Keyboard navigation, focus, and invalid states work.
  - Theme changes still apply only after Supabase confirms the profile update.

### SHADCN-009 — Use Toggle Group for progress range selection

- Priority: `P2`
- Status: `done`
- Completed: the four progress ranges now use a Base UI-backed shadcn Toggle Group that remains visible on mobile.
- Suggested branch: `feat/dashboard-and-progress`
- Current evidence: `src/pages/Progress.tsx` maps independent Buttons for the 7-, 30-, and 90-day single-selection state.
- shadcn target: [Toggle Group](https://ui.shadcn.com/docs/components/base/toggle-group)
- Why: the control is semantically a single-choice group, not three unrelated actions.
- Acceptance criteria:
  - Exactly one range remains selected.
  - Keyboard navigation and selected state are exposed accessibly.
  - Existing inclusive range queries and pending-state protections remain unchanged.
  - Mobile visibility is addressed by the progress feature, not hidden by the component migration.

### SHADCN-010 — Use Spinner for indeterminate loading actions

- Priority: `P2`
- Status: `done`
- Completed: full-screen and onboarding loading plus mutation buttons now use the shared Spinner while preserving visible pending labels and Skeleton placeholders.
- Suggested branch: `feat/ui-polish-and-bug-fixes`
- Current evidence:
  - Submit buttons communicate pending state only by replacing text.
  - `LoadingScreen` uses a pulsing Activity icon.
  - Onboarding uses loading text without a shared indicator.
- shadcn target: [Spinner](https://ui.shadcn.com/docs/changelog/2025-10-new-components)
- Why: a shared spinner distinguishes indeterminate work from Skeleton placeholders and provides consistent inline button loading treatment.
- Acceptance criteria:
  - Pending labels remain visible.
  - Buttons remain disabled during their mutations.
  - Loading regions keep `role="status"` and useful accessible text.
  - Skeleton remains used for content-shape placeholders.

### SHADCN-011 — Evaluate Item for history records

- Priority: `P3`
- Status: `declined`
- Decision: The current Card composition already preserves a dense responsive metric grid and clear edit/delete hierarchy; Item would exchange markup without a clear readability or maintenance improvement and would broaden the History change unnecessarily.
- Suggested branch: address only while revising History
- Current evidence: each entry in `src/pages/History.tsx` manually composes a Card with date, metrics, and edit/delete actions.
- shadcn target: [Item](https://ui.shadcn.com/docs/components/base/item)
- Why: Item/ItemGroup maps well to content plus actions and could reduce layout markup, but the current Card composition is already functional.
- Decision gate: implement only if Item preserves the dense mobile metric grid and improves maintainability without flattening the information hierarchy.

### SHADCN-012 — Evaluate Sidebar for desktop application navigation

- Priority: `P3`
- Status: `declined`
- Decision: The current shell has five stable routes and a product-specific mobile bottom navigation, with no requirement for collapsibility, off-canvas behavior, or navigation groups; Sidebar would add material abstraction and application-shell churn without a current product benefit.
- Suggested branch: `refactor/application-shell`
- Current evidence: `src/components/Layout.tsx` manually implements a fixed desktop aside, nav items, footer account state, and sign-out action.
- shadcn target: [Sidebar](https://ui.shadcn.com/docs/components/radix/sidebar)
- Why: Sidebar can provide structured header/content/footer/menu behavior and future collapsibility, but it is a large abstraction for the current small navigation.
- Decision gate:
  - Do not replace the product-specific mobile bottom navigation automatically.
  - Proceed only if collapsibility, off-canvas mobile navigation, or more navigation groups become product requirements.
  - Measure bundle and complexity impact before adoption.

## Components to retain

These are deliberate compositions or already align with the shadcn source-component model:

- `PageHeader`: product-specific page composition; shadcn has no direct equivalent.
- `AuthShell`: already composes shadcn Card primitives around product branding.
- Mobile bottom navigation in `Layout`: product-specific mobile interaction; Sidebar is not automatically a better replacement.
- `GoogleIcon`: a small brand SVG; Lucide does not provide brand icons, and adding a package for one icon is unnecessary.
- `LoadingScreen`: retain the composition, but it may consume Spinner internally.
- Sileo `Toaster` and action notifications: required project stack. Do not replace with Sonner or shadcn Toast.
- Daily-log date picker: the product requirement now calls for the official shadcn Calendar/Popover composition; keep its conversion boundary calendar-date based so stored values remain exact `YYYY-MM-DD` dates.
- Existing Badge, Button, Card, Combobox, Input, Label, Separator, Skeleton, and Textarea source primitives: normalize against upstream when their files are already touched, but do not rewrite them solely for parity.

## Recommended implementation order

1. `SHADCN-001` — destructive confirmation correctness.
2. `SHADCN-002`, `SHADCN-003`, and `SHADCN-008` — one form-foundation refactor.
3. `SHADCN-004`, `SHADCN-007`, and `SHADCN-009` — alongside `feat/dashboard-and-progress`.
4. `SHADCN-005`, `SHADCN-006`, and `SHADCN-010` — feedback-state polish.
5. Evaluate `SHADCN-011` and `SHADCN-012` only when their parent areas change.

## Cross-cutting definition of done

- Preserve the selected shadcn preset and semantic tokens.
- Use Base UI-backed shadcn source where the preset supports it.
- Do not add a competing component system.
- Preserve strict TypeScript and avoid `any`.
- Preserve keyboard behavior, labels, focus restoration, screen-reader states, and mobile touch targets.
- Preserve Sileo, Supabase behavior, query invalidation, and existing data validation.
- Run `npm run lint` and `npm run build` for every implementation branch.
- Review light, dark, system, 320 px mobile, desktop, 200% zoom, loading, empty, error, and pending states.
- Keep each migration behaviorally scoped; do not combine unrelated visual cleanup with data changes.
