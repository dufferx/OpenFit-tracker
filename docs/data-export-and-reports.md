# Data export and reports

Implemented: 2026-07-15  
Branch: `feat/data-export-and-reports`

## Architecture

Progress owns an authenticated shadcn Drawer trigger in its page header; the main navigation and Settings remain unchanged. Opening the Drawer copies the active Progress range (7, 30, or 90 days, or all time) into the export selection without changing the charts when export choices are edited. The export query runs only while the Drawer is open. The PDF module and `jspdf` dependency are loaded only after the user requests PDF generation.

The checked-in `src/components/ui/drawer.tsx` is the official Vega/Base UI shadcn source. The Drawer uses a scrollable body, persistent action footer, swipe handle, focus management, and a controlled open state that rejects dismissal while generation is running. The documented positioned-body rule is applied for iOS Safari overlay coverage.

The export domain is separate from page JSX:

- `src/lib/export-data.ts` resolves profile-timezone ranges, validates custom dates, calculates deterministic summaries, orders records, serializes CSV/JSON, sanitizes filenames, and performs temporary Blob URL downloads.
- `src/lib/export-query.ts` obtains the authenticated session user, keeps the explicit owner filter in addition to RLS, and accumulates ordered 500-row Supabase pages. This avoids the 1,000-row `max_rows` truncation that remains documented for the normal Progress all-time view.
- `src/lib/pdf-report.ts` creates selectable text, vector charts, multi-page records, and page footers without DOM screenshots or external report services.

No arbitrary user ID is accepted, no auth/session fields are exported, no export content is logged, and no file is uploaded or retained in global state.

## Format contracts

CSV uses UTF-8 without a BOM because modern supported spreadsheet/data tools detect UTF-8 and omitting it keeps the first machine field free of an invisible character. Rows use CRLF. Optional null values are empty, zero stays `0`, numeric fields remain unlocalized, notes follow RFC-style double-quote escaping, and notes beginning with `=`, `+`, `-`, or `@` receive a leading apostrophe to prevent spreadsheet formula execution.

JSON schema version 1 contains:

- application name and ISO export timestamp;
- inclusive range and IANA timezone;
- display name and profile targets;
- calculated summary;
- chronologically ascending selected-range daily logs.

Daily-log database IDs and user IDs are excluded because they are internal and are not necessary for a portable future restore. `createdAt` and `updatedAt` are retained because a future import flow may need provenance and conflict-resolution decisions. Nulls and numeric zeroes remain distinct. Notes remain exact user text. Import/restore is deliberately out of scope.

PDF includes targets, coverage and averages, explicitly estimated energy balance, latest measurements, available measurement trends, calorie and protein visuals, and daily records. Weight/body-fat trend charts require two measurements. For readability, charts use no more than 30 evenly spaced selected records; tables include all records for ranges up to 60 records and the 30 most recent records for larger ranges. CSV and JSON are the complete-data formats.

## Privacy and limitations

Files are generated in the browser and downloaded through a temporary anchor and Blob URL, which is revoked immediately after use. Automatic download behavior depends on the browser/PWA environment. There are no public links, Supabase Storage objects, external PDF services, analytics, scheduled reports, sharing requirement, or import behavior.

The UI requires at least one daily record for every format; profile-only JSON backup is not supported in schema version 1. Notes are present in CSV and JSON but omitted from the share-oriented PDF table, preventing long free text from disrupting report layout.

## Bundle impact

The verified production build has no standalone Export route chunk. Progress, including the Drawer UI, is 98.61 kB (32.09 kB gzip), and the normal application entry is 690.68 kB (208.19 kB gzip), compared with the pre-feature 689.04 kB (207.86 kB gzip). The global stylesheet is 82.19 kB (14.49 kB gzip), including the official Drawer state/direction utilities. PDF code remains outside the entry and Progress chunks: `pdf-report` is 392.46 kB (128.99 kB gzip), and jsPDF's optional HTML support is emitted as separate `html2canvas`/DOM-purification chunks. None of the PDF chunks is imported or executed when Progress or the Drawer opens; `pdf-report` loads only after PDF generation is requested. As with the existing PWA configuration, Workbox precaches generated static chunks during service-worker installation for shell availability.

Focused Vitest coverage verifies range resolution, current-month/custom boundaries, summaries, zero/null behavior, estimated balance, ordering, CSV escaping/formula protection, JSON schema shape, filename sanitization, page accumulation, and practical loading/empty UI states without a real Supabase project.
