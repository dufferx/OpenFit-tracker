You are working inside the OpenFit Tracker repository on the branch `refactor/shadcn-forms-and-controls`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `refactor/shadcn-forms-and-controls`.
3. Read the complete root-level `backlog.md`.
4. Inspect:

   * all authentication forms
   * the profile/settings form
   * the onboarding form
   * the daily-log form
   * current React Hook Form and Zod usage
   * custom numeric input/unit implementations
   * the custom theme select
   * History record composition
   * desktop application shell/sidebar
   * existing shadcn/ui source components
   * current Base UI-backed component conventions
5. Confirm which relevant backlog items remain `backlog`.
6. Run:

   * `git status`
   * `git log --oneline --decorate -10`
7. Provide a concise implementation plan before editing.
8. Do not commit or push.

## Goal

Complete the remaining high-value shadcn forms and controls adoption in one coherent refactor while preserving all existing business behavior, validation, Supabase integration, accessibility, mobile behavior, and visual design.

Treat `backlog.md` as the source of truth for requirements and acceptance criteria.

The primary required items are:

* `SHADCN-002`
* `SHADCN-003`
* `SHADCN-008`

Evaluate, but do not automatically implement:

* `SHADCN-011`
* `SHADCN-012`

## Required scope

### 1. Standardize forms with shadcn Field components

Implement the official shadcn/Base UI-backed Field source components appropriate for the selected preset.

Add reusable source components under:

```text
src/components/ui/
```

Expected concepts may include:

* Field
* FieldLabel
* FieldDescription
* FieldError
* FieldGroup
* FieldSet
* FieldLegend
* FieldSeparator

Use the naming and anatomy supported by the current shadcn/Base UI implementation.

Migrate these areas:

* Login
* Register
* Forgot password
* Update password
* Profile/settings form
* Onboarding form
* Daily-log form

Requirements:

* Preserve React Hook Form and Zod where already used.
* If the daily-log form does not yet use React Hook Form and Zod, migrate it only if doing so is necessary for a clean and consistent Field implementation.
* Do not alter nullable numeric normalization.
* Do not alter Supabase payload shapes.
* Do not change auth behavior.
* Do not change onboarding completeness rules.
* Do not change daily-log date validation.
* Preserve `aria-describedby`, invalid-state semantics, and announced errors.
* Preserve disabled and pending behavior.
* Prevent duplicate submissions.
* Use FieldSeparator where it improves the auth “or use email” composition.
* Do not introduce unnecessary generic form abstractions.

### 2. Replace numeric suffix overlays with Input Group

Implement the official shadcn/Base UI-backed Input Group source component appropriate for the selected preset.

Migrate numeric controls that currently use absolutely positioned unit suffixes.

Expected units include:

* kcal
* g
* kg
* %

Requirements:

* Units must remain visually associated with the input.
* Units must not become part of submitted values.
* Focus styling must apply consistently to the complete grouped control.
* Invalid and disabled styling must remain clear.
* Inputs must remain usable at:

  * 320 px width
  * 200% zoom
* Preserve mobile numeric keyboards through suitable `type` and `inputMode`.
* Preserve numeric minimums, maximums, and step values.
* Empty optional numeric fields must still map to `null`.
* Required numeric fields must not silently convert empty values to zero or `NaN`.
* Do not change database constraints.

### 3. Replace the theme select with official shadcn Select

Replace the hand-styled native select used for theme selection with the official shadcn/Base UI-backed Select, unless inspection proves that the official Native Select is clearly more appropriate.

Supported values remain exactly:

* light
* dark
* system

Requirements:

* Keep controlled React Hook Form integration.
* Keep strict TypeScript.
* Preserve keyboard navigation.
* Preserve visible focus and invalid states.
* Keep labels and descriptions associated with the control.
* Theme changes must still apply only according to the current confirmed profile-save behavior.
* Do not change the profile mutation flow.
* Do not change remote/local theme synchronization rules.
* Do not introduce additional theme options.

Document the decision between Select and Native Select in the final report.

### 4. Daily-log form conversion

Inspect the current daily-log form carefully.

If it does not already use React Hook Form and Zod, convert it as part of this feature only if that reduces duplicated form behavior and allows the required Field/Input Group adoption safely.

Requirements:

* Preserve create and update behavior.
* Preserve loading an existing log by date.
* Preserve redirect to Home after confirmed save.
* Preserve Sileo success and error behavior.
* Preserve query invalidation.
* Preserve profile-timezone future-date validation.
* Preserve form values on failed save.
* Preserve pending-state duplicate-submit protection.
* Preserve:

  * required calories consumed
  * required protein
  * required total calories burned
  * optional weight
  * optional body fat
  * optional notes
* Preserve exact calendar-date strings.
* Empty optional numeric values must remain `null`.
* Do not allow tomorrow or later in the profile timezone.
* Do not silently reinterpret legitimate zero values as empty.

### 5. Authentication forms

Migrate the authentication forms without altering their flows.

Preserve:

* email/password sign-in
* email/password registration
* Google OAuth
* forgot-password email
* update-password flow
* pending states
* Sileo feedback
* redirects
* callback behavior
* intended-route restoration

Requirements:

* Every field keeps a programmatic label.
* Errors remain associated with the correct controls.
* Password fields retain their existing autocomplete attributes.
* Email fields retain correct input types and autocomplete behavior.
* Google OAuth UI remains product-specific and unchanged unless FieldSeparator is used around the divider.
* Do not modify Supabase Auth logic.

### 6. Profile and onboarding forms

Migrate profile and onboarding forms while preserving:

* calorie target
* protein target
* optional target weight
* optional target body fat
* display name
* timezone behavior
* theme preference
* profile completeness logic
* Supabase upsert/update behavior
* theme application timing
* onboarding redirect behavior

Requirements:

* Optional numeric values remain nullable.
* Errors remain visible and announced.
* Saving remains disabled while pending.
* No duplicated submissions.
* No default targets are fabricated.
* No profile field is silently cleared during partial updates.

### 7. Shared form architecture

Create only the shared abstractions justified by repeated behavior.

Good candidates:

* official Field primitives
* official Input Group primitives
* focused numeric field composition if profile and daily-log forms use the exact same semantics
* shared form error rendering where it genuinely reduces duplication

Avoid:

* a universal form-builder abstraction
* schema-driven UI generation
* deeply generic wrappers
* unnecessary context layers
* replacing React Hook Form
* adding another validation library

### 8. Evaluate History Item adoption

Evaluate `SHADCN-011`.

Implement it only if all of the following are true:

* It clearly reduces markup.
* It preserves the dense mobile metric layout.
* It preserves edit/delete actions.
* It preserves the Alert Dialog behavior.
* It improves readability and maintainability.
* It does not flatten the visual hierarchy.
* It does not require broad History redesign.

If implemented:

* Use the official shadcn Item/ItemGroup source.
* Preserve date, metrics, edit, delete, pending state, and responsive layout.
* Update `SHADCN-011` to `done`.

If not implemented:

* Leave it as `backlog` or mark it `declined`.
* Add a concise technical reason.
* Do not change History simply to satisfy adoption metrics.

### 9. Evaluate Sidebar adoption

Evaluate `SHADCN-012`.

Do not implement it unless inspection finds a clear, low-risk improvement that is justified by current product requirements.

The existing product currently has:

* a small desktop navigation
* a product-specific mobile bottom navigation
* no explicit requirement for collapsibility
* no explicit requirement for multiple navigation groups
* no explicit requirement for an off-canvas mobile sidebar

Prefer retaining the current shell unless the official Sidebar produces a clear benefit without:

* replacing mobile bottom navigation
* increasing complexity materially
* changing navigation behavior
* adding unnecessary bundle weight
* requiring a large application-shell rewrite

If not implemented:

* Mark `SHADCN-012` as `declined` or leave it as `backlog`.
* Add a concise decision note explaining that current product requirements do not justify the abstraction.

Do not modify the application shell merely because Sidebar exists.

## Visual and component constraints

Preserve:

* shadcn preset `b2oWFNd6u`
* Inter
* Lucide icons
* semantic tokens
* Sileo
* current dashboard redesign
* current sidebar and bottom navigation unless Sidebar passes its decision gate
* light, dark, and system themes
* mobile-first behavior
* current product-specific compositions

Do not:

* install Sonner
* install a competing UI system
* introduce Redux
* replace Sileo
* change dashboard layout
* change Progress behavior
* change chart components
* modify database migrations
* change RLS
* change Auth architecture
* add meal or training tracking
* perform unrelated cleanup
* perform deployment work
* perform bundle optimization

## Accessibility requirements

Verify:

* every input has a programmatic label
* descriptions and errors are associated with controls
* invalid controls expose appropriate semantics
* errors are announced
* FieldSet and legends are used where grouping improves understanding
* keyboard navigation works
* Select keyboard behavior works
* focus is visible
* Input Group focus styling covers the complete control
* units are not read as part of the editable value
* pending buttons include visible text
* disabled controls remain understandable
* touch targets remain usable
* 200% zoom does not obscure labels, errors, units, or actions

## Backlog maintenance

Update `backlog.md`.

For completed items:

* Set status to `done`.
* Add a concise completion note.
* Preserve original rationale and acceptance criteria.

For evaluated but unimplemented items:

* Keep `backlog` or set `declined`.
* Add a concise technical decision note.
* Do not mark them complete.

Expected primary updates:

* `SHADCN-002`
* `SHADCN-003`
* `SHADCN-008`
* `SHADCN-011`
* `SHADCN-012`

Do not change unrelated backlog statuses.

## Validation

Run:

```bash
npm run lint
npm run build
git diff --check
```

Run existing tests if present.

Manually validate:

### Authentication

1. Login success.
2. Login validation failure.
3. Registration success.
4. Registration validation failure.
5. Google OAuth.
6. Forgot-password request.
7. Update-password flow.
8. Pending button behavior.
9. Keyboard-only interaction.

### Profile/onboarding

10. Complete onboarding.
11. Edit all profile fields.
12. Save optional numeric values.
13. Clear optional numeric values.
14. Change theme.
15. Failed save.
16. Reload and verify persistence.

### Daily log

17. Create today’s log.
18. Update an existing log.
19. Create a past-date log.
20. Reject a future date.
21. Clear optional weight.
22. Clear optional body fat.
23. Save legitimate zero values.
24. Failed save preserves form values.
25. Confirm Home redirect after success.
26. Confirm Back does not return to completed form.

### Responsive/accessibility

27. 320 px width.
28. 375–400 px width.
29. Desktop width.
30. 200% browser zoom.
31. Light theme.
32. Dark theme.
33. System theme.
34. Screen-reader labels and errors.
35. Focus order and visible focus.
36. Mobile numeric keyboard behavior.

### Regression

37. Dashboard remains unchanged.
38. Progress remains unchanged.
39. History delete Alert Dialog remains functional.
40. Sileo remains readable.
41. Query invalidation still refreshes data.
42. No console errors.

## Review before completion

Before finishing:

1. Run `git status`.
2. Run `git diff --stat`.
3. Review the full diff.
4. Search for:

   * repeated manual error-message markup
   * repeated label/description wiring
   * absolute-positioned unit suffixes
   * the old custom theme select
   * `any`
   * Sonner
   * competing UI libraries
   * demo values
   * secrets
5. Confirm `.env.local` remains ignored.
6. Confirm no migrations were modified.
7. Confirm dashboard/progress files changed only if a shared form dependency genuinely required it.
8. Confirm backlog statuses match actual validation.

## Final report

Provide:

1. Executive summary.
2. Backlog items completed.
3. Backlog items evaluated.
4. Files created.
5. Files modified.
6. Field component architecture.
7. Input Group architecture.
8. Theme Select decision.
9. Daily-log form migration details.
10. Auth form migration details.
11. Profile/onboarding migration details.
12. History Item decision.
13. Sidebar decision.
14. Accessibility improvements.
15. Mobile and zoom validation.
16. Regression results.
17. Dependencies added or removed.
18. Database changes.
19. `backlog.md` updates.
20. Lint result.
21. Build result.
22. Remaining limitations.
23. Human-review decisions required.

Do not commit.
Do not push.
