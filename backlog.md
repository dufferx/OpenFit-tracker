# shadcn/ui Adoption Backlog

Last audited: 2026-07-14  
Branch audited: `fix/daily-log-timezone-boundary`  
Status: planning only; no replacements in this audit

## Goal

Track places where an official shadcn/ui source component can replace repeated or lower-level UI code with clearer accessibility, behavior, and design-system consistency. This backlog does not require replacing product-specific composition simply because it is custom.

The repository must keep the selected `b2oWFNd6u` preset, semantic theme tokens, Lucide icons, and Sileo notifications. Add components as source under `src/components/ui/`; do not introduce a competing UI library or Sonner.

## Priority and status

- `P0`: correctness, destructive-action safety, or significant accessibility issue.
- `P1`: high-value consistency or accessibility improvement.
- `P2`: useful consolidation suitable for an adjacent feature.
- `P3`: optional evaluation; implement only when the affected area is already changing.
- Status values: `backlog`, `in-progress`, `done`, `declined`.

## Replacement backlog

### SHADCN-001 — Replace browser delete confirmation with Alert Dialog

- Priority: `P0`
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
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
- Status: `backlog`
- Suggested branch: address only while revising History
- Current evidence: each entry in `src/pages/History.tsx` manually composes a Card with date, metrics, and edit/delete actions.
- shadcn target: [Item](https://ui.shadcn.com/docs/components/base/item)
- Why: Item/ItemGroup maps well to content plus actions and could reduce layout markup, but the current Card composition is already functional.
- Decision gate: implement only if Item preserves the dense mobile metric grid and improves maintainability without flattening the information hierarchy.

### SHADCN-012 — Evaluate Sidebar for desktop application navigation

- Priority: `P3`
- Status: `backlog`
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
- Native `type="date"` input: retain for mobile date entry unless product requirements justify Calendar/Popover; stored values must remain exact `YYYY-MM-DD` dates.
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
