# Implementation Plan: Details, Credits, and Licenses

**Branch**: `009-details-credits` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

## Design

- **Schema**: `itemBase` gains optional `author`, `license`, `credits: Credit[]`; `Project` gains
  optional `author`, `notes`, `license`. Excluded from `canonicalContent`. Regenerate JSON Schema.
  Optional fields → no format version bump.
- **`src/model/credits.ts`** (framework-free): `LICENSES` (id, name, terms), `licenseName`,
  `authorOf`/`priorCredits` (fall back to legacy `source`), `creditCopy(draft, me)`,
  `requiredLicense(sources)`, `blockLock`, `quiltLock(doc, quilt, me)`, `effectiveLicense`,
  `blockCredits(doc, quilt, me)`.
- **Wiring**: `copyBlock` and drawing edits (`markDerived(block, me)`) call `creditCopy`;
  `newBlock`/`createQuilt`/new project set `author`; `importBlock` keeps the file's author (legacy:
  `file.author`) instead of a synthetic `source`; `.rrqb` export stamps the effective license.
- **UI**: `DetailsPanel.vue` (title, notes, author, license select with two-line options or locked
  chip + reason, Based on, Blocks by) used in the quilt editor (`mode: 'details'`), block editor
  (`blockMode: 'details'`), and sketchbook (`tab: 'details'`). `NotecardDialog` removed; Notecard
  menu items open Details.
