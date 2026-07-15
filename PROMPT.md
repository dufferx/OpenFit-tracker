You are working inside the OpenFit Tracker repository on the branch `feat/data-export-and-reports`.

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Confirm the current branch is exactly `feat/data-export-and-reports`.
3. Read:

   * `README.md`
   * `backlog.md`
   * `docs/mvp-hardening.md`
4. Inspect:

   * current Settings page
   * profile query and domain types
   * daily-log queries and domain types
   * calendar and timezone helpers
   * dashboard weekly-summary calculations
   * progress range definitions
   * chart-data transformation helpers
   * current shadcn components
   * route architecture and lazy-loading conventions
   * test infrastructure
5. Run:

   * `git status`
   * `npm run lint`
   * `npm run test`
   * `npm run build`
6. Provide a concise implementation plan before editing.
7. Do not commit, push, deploy, or request real credentials.

## Goal

Add a private, user-controlled export and reporting module for OpenFit Tracker.

Users must be able to export their own profile, daily logs, calculated summaries, and progress information in formats suitable for:

* external analysis
* personal backup
* sharing a clean progress report

Supported formats:

* CSV
* JSON
* PDF

The feature must remain simple, private, responsive, and client-driven for the current MVP scale.

## Product principles

* The authenticated user may export only their own data.
* Exported values must come from real Supabase profile and daily-log data.
* Missing values must remain empty or null, not silently converted to zero.
* Legitimate zero values must remain zero.
* Estimated energy balance must remain explicitly estimated.
* Export must not include authentication tokens, internal IDs unless needed for backup, API keys, or implementation metadata.
* Do not add public sharing links.
* Do not upload generated reports to Supabase Storage.
* Do not send export data to any external report-generation service.
* Do not add import functionality in this feature.
* Design the JSON format so a future import feature remains possible.

## 1. Export page and navigation

Add a dedicated authenticated route, preferably:

```text
/export
```

Expose it through Settings with a clear action such as:

```text
Export data and reports
```

A direct Settings section is acceptable if it remains clean, but prefer a dedicated page if the export controls and preview require meaningful space.

Requirements:

* Preserve the current application shell.
* Use route-level lazy loading.
* Protect the route with the existing authentication/profile guards.
* Use existing shadcn components and semantic tokens.
* Maintain light, dark, and system themes.
* Support approximately 320 px width.
* Do not add another navigation-tab item unless clearly justified; Settings entry is sufficient.

## 2. Date-range selection

Support:

* Last 7 days
* Last 30 days
* Last 90 days
* Current month
* All time
* Custom range

Requirements:

* Use the authenticated profile timezone.
* Use inclusive calendar-date boundaries.
* Reuse current shared calendar/range helpers.
* Avoid `new Date("YYYY-MM-DD")`.
* Custom range requires valid start and end dates.
* End date cannot precede start date.
* Future dates should not be included.
* All time should use all available user records.
* Clearly document the existing Supabase row-limit behavior if applicable.
* Do not add database pagination unless required to export the user’s complete current dataset.
* If the current all-time query can truncate at 1,000 rows, implement safe pagination for export rather than silently producing an incomplete backup.

## 3. Export data model

Create a clear export-domain layer separate from page JSX.

Conceptually support:

```ts
type ExportRange = {
  id: "7d" | "30d" | "90d" | "current-month" | "all" | "custom"
  from: string | null
  to: string
}

type ExportSummary = {
  loggedDays: number
  totalCalendarDays: number
  averageCaloriesConsumed: number | null
  averageProteinGrams: number | null
  averageCaloriesBurned: number | null
  averageEstimatedBalance: number | null
  latestWeightKg: number | null
  latestBodyFatPercentage: number | null
  minimumWeightKg: number | null
  maximumWeightKg: number | null
}
```

Use actual project types and naming conventions where appropriate.

Requirements:

* Reuse existing calculation helpers when semantics match.
* Add export-specific pure helpers where needed.
* Keep calculations deterministic and testable.
* Sort logs chronologically ascending for exported records.
* Use a single consistent estimated-balance formula.
* Preserve notes exactly as user text.
* Do not include user email unless explicitly selected and justified.
* Display name and profile targets may be included.

## 4. CSV export

Generate a clean UTF-8 CSV file suitable for Excel, Google Sheets, Python, and similar tools.

Recommended filename:

```text
openfit-daily-logs-YYYY-MM-DD.csv
```

Required columns:

```text
date
calories_consumed
protein_grams
total_calories_burned
estimated_balance
weight_kg
body_fat_percentage
notes
```

Requirements:

* Include a header row.
* Use stable English machine-friendly column names.
* Preserve calendar dates as `YYYY-MM-DD`.
* Escape commas, quotes, and line breaks correctly.
* Prevent CSV formula injection:

  * values beginning with `=`, `+`, `-`, or `@` in free-text fields must be safely escaped
  * do not corrupt normal numeric columns
* Empty optional values should export as empty cells.
* Numeric values must remain machine-readable without localized thousands separators.
* Use a standards-compatible line ending.
* Add a UTF-8 BOM only if justified for Excel compatibility and document the choice.
* Do not use an external CSV service.
* A small dependency may be used only if it materially improves correctness; otherwise implement a focused tested serializer.

Add tests for:

* commas
* quotes
* multiline notes
* formula-like notes
* empty optional values
* legitimate zero values

## 5. JSON backup export

Generate a versioned JSON backup.

Recommended filename:

```text
openfit-backup-YYYY-MM-DD.json
```

Suggested structure:

```json
{
  "schemaVersion": 1,
  "exportedAt": "ISO timestamp",
  "application": "OpenFit Tracker",
  "range": {
    "from": "YYYY-MM-DD or null",
    "to": "YYYY-MM-DD",
    "timezone": "IANA timezone"
  },
  "profile": {
    "displayName": null,
    "calorieTarget": null,
    "proteinTarget": null,
    "targetWeightKg": null,
    "targetBodyFatPercentage": null,
    "timezone": "..."
  },
  "summary": {},
  "dailyLogs": []
}
```

Requirements:

* Use camelCase application-domain field names.
* Include a schema version.
* Include export timestamp.
* Include timezone.
* Include profile targets.
* Include selected-range logs only.
* Clearly distinguish `null` from zero.
* Do not include:

  * auth tokens
  * provider identities
  * access tokens
  * refresh tokens
  * Supabase keys
  * database internals
* Decide whether record IDs and created/updated timestamps are useful for a future restore.
* If included, document why.
* Format JSON with readable indentation.
* Keep the structure stable and tested.
* Do not implement restore/import yet.

## 6. PDF progress report

Generate a clean, readable PDF suitable for personal archiving or sharing with a coach.

Recommended filename:

```text
openfit-progress-report-YYYY-MM-DD.pdf
```

The PDF should include:

### Header

* OpenFit Tracker
* User display name if available
* Selected period
* Profile timezone
* Generated date

### Current targets

* Calorie target
* Protein target
* Target weight
* Target body-fat percentage

### Period summary

* Logged days
* Calendar-day coverage
* Average calories consumed
* Average protein
* Average calories burned
* Average estimated balance
* Latest weight
* Latest body-fat percentage

### Progress visuals

At minimum:

* Weight trend when enough measurements exist
* Body-fat trend when enough measurements exist
* Calories consumed vs burned
* Protein values and target

### Records

Include either:

* a compact daily-record table for reasonably small ranges, or
* a summarized recent-record section when the range is large

Requirements:

* Use real data and existing transformations.
* Do not screenshot the DOM as the primary implementation if that produces poor text quality or inaccessible output.
* Prefer a proper PDF-generation approach capable of selectable text and vector/clear chart output.
* Keep the dependency footprint reasonable.
* Review client-side libraries such as `pdf-lib`, `jspdf`, or `@react-pdf/renderer` and choose the smallest appropriate tool.
* Explain the choice before installing.
* Lazy-load the PDF-generation dependency so it does not increase the initial application bundle.
* The export page should not load the PDF library until needed.
* Do not include unsupported health conclusions.
* Label energy balance as estimated.
* Handle missing profile targets and measurements honestly.
* Ensure long notes do not break the layout.
* Support multi-page output.
* Avoid exposing internal IDs.
* Use neutral OpenFit branding and semantic visual styling translated appropriately for PDF.

If charts are difficult to reproduce reliably in the first implementation, implement high-quality summary and tables first, but do not claim full visual-report completion. Clearly report any deferred chart output.

## 7. Export preview and options

Provide a clean export form.

Controls should include:

* date range
* custom from/to fields when selected
* format
* optional content controls where useful

Suggested include controls:

* profile and targets
* calculated summary
* daily records
* charts, only for PDF

Do not offer options that generate invalid or empty documents.

Requirements:

* Show a concise preview summary before download:

  * selected date range
  * number of records
  * available weight measurements
  * available body-fat measurements
* Disable export while data is loading or generation is running.
* Prevent duplicate generation.
* Use Spinner for generation.
* Use Sileo after successful generation or on generation failure.
* Never show success before the file is generated.
* Preserve selection after failure.
* Add an honest empty state when no records exist.
* Allow JSON profile-only backup only if deliberately designed; otherwise require at least one record and explain it.

## 8. Download implementation

Use safe browser downloads.

Requirements:

* Generate Blob URLs.
* Trigger download with a temporary anchor.
* Revoke object URLs after use.
* Use sanitized filenames.
* Do not open unnecessary popups.
* Do not upload the generated file.
* Avoid retaining complete export data globally after generation.
* Handle browsers that block automatic downloads gracefully.
* Preserve installed-PWA compatibility where supported.

Where the Web Share API supports file sharing, it may be evaluated as an optional enhancement, but downloading must remain the baseline and must not depend on Web Share.

## 9. Privacy and security

Review the export feature carefully.

Requirements:

* Export data must be fetched only for the authenticated user.
* Continue relying on RLS.
* Do not accept arbitrary user IDs.
* Avoid logging exported records or notes to the browser console.
* Do not include auth/session information.
* Do not send export content to monitoring or analytics.
* Render notes as text.
* Protect CSV against formula injection.
* Document that downloaded files contain sensitive personal fitness information.
* Add a short warning near the export action:
  `Downloaded files may contain private fitness information. Store and share them carefully.`

Do not add server-side storage or public report URLs.

## 10. Query and pagination architecture

The export must not silently truncate the dataset.

Inspect the existing all-time daily-log API.

If it has a fixed row limit:

* Add a dedicated export fetch function that retrieves all matching records through safe Supabase pagination.
* Use a reasonable page size.
* Keep the query authenticated and user-scoped.
* Preserve chronological ordering.
* Avoid loading all users or bypassing RLS.
* Do not replace normal dashboard/progress queries with the export pagination path unless appropriate.

Add tests for pagination logic without calling the real Supabase project.

## 11. Tests

Use the existing Vitest setup.

Add focused tests for:

* range resolution
* current-month boundaries
* custom range validation
* summary calculations
* empty range
* legitimate zeros
* CSV escaping
* CSV formula injection
* JSON schema/version structure
* filename sanitization
* chronological export ordering
* pagination accumulation
* null preservation
* estimated-balance calculation

Add component tests where practical for:

* disabled export during generation
* empty-state behavior
* custom-range validation

Do not test real file downloads through fragile browser automation unless the existing test setup supports it cleanly.

## 12. Performance

Requirements:

* Keep CSV/JSON code lightweight.
* Lazy-load heavy PDF code.
* Do not include report-generation libraries in the initial application entry.
* Record bundle impact.
* Preserve current route-level code splitting.
* Prefer an export-specific chunk.
* Do not load full all-time data until the user opens or requests export.

## 13. Documentation

Update:

* `README.md`
* appropriate internal documentation
* `backlog.md` if an export roadmap item is added

Document:

* supported formats
* purpose of each format
* date ranges
* privacy warning
* JSON schema version
* CSV columns
* PDF content
* browser download behavior
* current limitations
* future import compatibility
* all-time pagination behavior

Remember that internal Markdown remains on `development`; the release process keeps only `README.md` on `main`.

## 14. Scope protection

Do not implement:

* import or restore
* scheduled emailed reports
* public share links
* Supabase Storage uploads
* trainer accounts
* admin access to exports
* gym challenges
* workout tracking
* AI chatbot
* meal-level logging
* automatic health recommendations
* native mobile sharing requirements
* database migrations unless a real blocker exists
* analytics
* monitoring
* broad design changes

Do not modify:

* authentication
* OAuth
* profile persistence
* daily-log mutations
* dashboard calculations
* progress calculations
* RLS
* applied migrations
* shadcn preset
* PWA service-worker caching behavior

## 15. Validation

Run:

```bash
npm run lint
npm run test
npm run build
git diff --check
```

Run production preview:

```bash
npm run preview
```

Manually validate:

1. Last 7 days CSV.
2. Last 30 days CSV.
3. Current-month CSV.
4. Custom-range CSV.
5. All-time CSV.
6. Notes containing commas.
7. Notes containing quotes.
8. Notes beginning with spreadsheet formula characters.
9. Empty optional measurements.
10. Legitimate zero values.
11. JSON backup structure.
12. JSON null preservation.
13. PDF with complete profile.
14. PDF with missing optional targets.
15. PDF with no weight measurements.
16. PDF with one weight measurement.
17. PDF with many records and multiple pages.
18. Light theme.
19. Dark theme.
20. 320 px width.
21. Installed PWA download where supported.
22. Failed generation.
23. Duplicate-click protection.
24. No secrets in generated files.
25. No user ID selection or cross-user export.
26. Bundle analysis confirms PDF code is lazy-loaded.
27. Existing authentication, dashboard, progress, daily logs, and PWA continue working.

## 16. Review before completion

Before finishing:

1. Run `git status`.
2. Run `git diff --stat`.
3. Review the complete diff.
4. Inspect generated example files manually, but do not commit user-data exports.
5. Search for:

   * real user data
   * real keys
   * auth tokens
   * formula-injection risks
   * hardcoded user IDs
   * unrevoked object URLs
   * non-lazy PDF imports
   * unsanitized filenames
   * console logging of export data
   * `any`
6. Confirm `.env.local` remains ignored.
7. Confirm no migration was edited.
8. Confirm no generated private report is staged.
9. Confirm all tests pass.
10. Record bundle sizes.

## Final report

Provide:

1. Executive summary.
2. Export route and navigation.
3. Files created.
4. Files modified.
5. Dependencies added.
6. Range architecture.
7. Export query/pagination architecture.
8. CSV format and protections.
9. JSON schema and restore-readiness.
10. PDF architecture and content.
11. Preview/options behavior.
12. Download implementation.
13. Privacy/security safeguards.
14. Tests added.
15. Bundle impact.
16. Production-preview results.
17. Lint result.
18. Test result.
19. Build result.
20. Remaining limitations.
21. Deferred import functionality.
22. Human-review decisions required.

Do not commit.
Do not push.
