You are working inside the OpenFit Tracker repository on the branch `feat/ui-polish-and-bug-fixes`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `feat/ui-polish-and-bug-fixes`.
3. Read the complete root-level `backlog.md`.
4. Inspect every source file, reference artifact, image, or component mentioned by the backlog.
5. Confirm which backlog items are already complete on the current branch history and which remain applicable.
6. Run:

   * `git status`
   * `git log --oneline --decorate -10`
7. Provide a concise, prioritized implementation plan before editing.
8. Do not commit or push.

## Goal

Implement a coherent UI-polish and bug-fix pass based on `backlog.md`.

Treat `backlog.md` as the source of truth for:

* priorities
* evidence
* expected behavior
* design references
* acceptance criteria
* shadcn/ui adoption boundaries
* components that must be retained
* explicitly deferred or decision-gated work

Do not blindly implement every backlog entry.

Analyze the backlog and select the work that belongs coherently in `feat/ui-polish-and-bug-fixes`.

## Scope-selection rules

1. Prioritize correctness and accessibility first.
2. Prioritize `P0` and `P1` items that are:

   * explicitly assigned to this branch
   * closely coupled to files already being modified
   * appropriate for one reviewable UI-polish feature
3. Include smaller bugs or enhancements from the backlog when they are low-risk and naturally fit this branch.
4. Items marked `done` must not be reimplemented unless inspection finds a real regression.
5. Items explicitly recommended for another dedicated branch should not automatically be pulled into this feature.
6. Decision-gated `P3` items should only be implemented if the backlog’s stated conditions are clearly met.
7. Do not perform speculative refactors simply to increase shadcn/ui usage.
8. Preserve product-specific components that the backlog explicitly says to retain.
9. If the complete eligible scope is too large for one safe branch, implement the highest-value coherent subset and clearly recommend follow-up branches for the remainder.
10. Update backlog statuses accurately after implementation:

    * `done`
    * `in-progress`
    * `backlog`
    * `declined`
11. Do not mark anything `done` unless its acceptance criteria were actually validated.

## Design-reference handling

When a backlog item references a supplied HTML design artifact or rendered screenshot:

* Inspect the actual referenced files.
* Treat them strictly as visual references.
* Do not copy bundled production code, inline CSS, demo values, static SVG chart data, or unsupported product claims.
* Translate the visual hierarchy using the repository’s existing React, Tailwind, shadcn/ui, semantic-token, Recharts, Supabase, and responsive architecture.
* Preserve real data, accessibility, timezone correctness, loading states, and product semantics over literal pixel copying.
* Compare the implementation at equivalent desktop and mobile widths.

If a referenced file is missing, report that explicitly and continue with backlog work that can be completed safely.

## Architectural constraints

Preserve:

* React 19
* strict TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui source components
* preset `b2oWFNd6u`
* Inter
* Lucide icons
* Sileo
* Recharts and current shadcn chart integration
* TanStack Query
* Supabase Auth and persistence
* Row Level Security assumptions
* profile-timezone calendar behavior
* daily-log validation and nullable numeric normalization
* current query keys and mutation invalidation
* PWA behavior
* light, dark, and system themes

Do not:

* replace Sileo
* introduce Sonner
* introduce another component system
* introduce Redux
* expose secrets
* change database migrations unless a real correctness blocker is discovered
* change Auth or RLS behavior for visual convenience
* add meal-level or workout tracking
* fabricate health interpretations, target progress, or baseline calculations
* implement unrelated bundle optimization or deployment work
* rewrite functional product-specific components solely for upstream parity

## Implementation expectations

For every selected backlog item:

1. Verify the current evidence against the actual code.
2. Identify the smallest correct implementation.
3. Preserve existing behavior not explicitly changed by the backlog.
4. Use official shadcn/ui source components where the backlog calls for them and where compatible with the selected preset.
5. Add new source components under `src/components/ui/`.
6. Keep shared behavior centralized rather than duplicating page-specific fixes.
7. Preserve accessible labels, focus handling, keyboard behavior, status announcements, and touch targets.
8. Preserve legitimate zero values and distinguish them from missing data.
9. Keep loading, empty, error, and pending states semantically distinct.
10. Ensure user actions cannot submit or execute twice while pending.
11. Keep recoverable page errors visible and actionable.
12. Keep Sileo for action feedback rather than replacing persistent page-level error states with toasts.
13. Avoid broad formatting or unrelated file rewrites.

## Backlog maintenance

Update `backlog.md` as part of this feature.

Requirements:

* Preserve original item IDs.
* Update the audit branch/date only when accurate.
* Mark completed items `done`.
* Add a short completion note when helpful.
* Leave deferred items as `backlog`.
* If an item is declined, add a concise technical reason.
* If a new issue is discovered, add it with:

  * unique ID
  * type
  * priority
  * status
  * evidence
  * scope
  * acceptance criteria
* Do not erase the historical rationale of completed items.
* Ensure `backlog.md` is included in version control.

## Validation

At minimum run:

```bash
npm run lint
npm run build
```

Run existing tests if present.

Also run:

```bash
git diff --check
```

Manually validate all selected items against their own acceptance criteria.

Perform a cross-cutting review at:

* approximately 320 px mobile width
* approximately 375–400 px mobile width
* normal desktop width
* 200% browser zoom
* light theme
* dark theme
* system theme
* loading states
* empty states
* error states
* mutation-pending states

Review:

* keyboard navigation
* focus restoration
* screen-reader labels/statuses
* contrast
* horizontal overflow
* duplicate submissions
* query refresh after mutations
* browser Back behavior where navigation changes
* browser console warnings
* Sileo visibility after route navigation

If visual-reference work is selected, compare screenshots with the supplied desktop and mobile references.

## Regression checks

Verify that these continue to work:

* Google OAuth
* email/password authentication
* password reset
* onboarding
* profile settings
* theme updates
* daily-log create
* daily-log edit
* daily-log delete
* dashboard data
* weekly summary
* progress ranges
* chart tooltips
* profile target refresh
* sign-out and sign-in persistence
* PWA build generation

## Review before completion

Before finishing:

1. Run `git status`.
2. Run `git diff --stat`.
3. Review the complete diff.
4. Search for:

   * `window.confirm`
   * duplicated custom error callouts
   * duplicated custom empty states
   * pending buttons without loading indicators
   * custom numeric suffix overlays
   * hardcoded light-only colors
   * Sonner or competing toast libraries
   * demo values
   * unsupported health claims
   * real secrets
5. Confirm `.env.local` remains ignored.
6. Confirm no applied migration was edited.
7. Confirm no backlog item is marked complete without evidence.

## Final report

Provide:

1. Executive summary.
2. Backlog items selected.
3. Why those items form a coherent feature scope.
4. Backlog items completed.
5. Backlog items deferred.
6. Recommended follow-up branch names.
7. Files created.
8. Files modified.
9. shadcn/ui components added or normalized.
10. Behavior changes.
11. Accessibility improvements.
12. Visual-reference comparison results, if applicable.
13. Mobile and theme validation.
14. Regression test results.
15. Dependencies added or removed.
16. Database changes, if any.
17. `backlog.md` status updates.
18. Lint result.
19. Build result.
20. Remaining limitations.
21. Human-review decisions required.

Do not commit.
Do not push.
