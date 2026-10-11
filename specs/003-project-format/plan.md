# Implementation Plan: Project File Format & Data Model (`.rrq`)

**Branch**: `003-project-format` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-project-format/spec.md`

## Summary

A UI-free TypeScript model module (`src/model/`) that defines `.rrq` v1 with TypeBox schemas (types,
validation, published JSON Schema), parses/migrates/serializes files, converts units, derives
seam-line patches via a planar arrangement that keeps circular arcs and Béziers exact, keeps patch
ids and fills stable across edits, implements copy-on-write quilt colorings, and generates slots
(Horizontal layout + plain strip borders first) with reconciliation on layout change. See
[research.md](./research.md), [data-model.md](./data-model.md).

## Technical Context

**Language/Version**: TypeScript (project version), Node 24 (tests)

**Primary Dependencies**: TypeBox 1.3 (new); everything else stdlib / Web Crypto

**Storage**: N/A (pure functions over in-memory documents; file I/O is spec 004)

**Testing**: Vitest unit tests + fixture files

**Target Platform**: Browser (same bundle as the app); also runs in Node for tests

**Project Type**: Library module inside the single Quasar app

**Performance Goals**: SC-005 parse < 3 s for 10 quilts / 100 blocks / 50 images; patch derivation
< 50 ms for a 100-segment block

**Constraints**: Exact segment kinds preserved; deterministic outputs (slot ids, derivation);
unknown keys preserved; no Vue/Quasar imports in `src/model/`

**Scale/Scope**: ~12 entity schemas, 1 layout generator + strip borders, 1 derivation algorithm

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|---|---|---|
| I. Static & Serverless | ✅ | Pure client-side module |
| II. Offline-First | ✅ | No network |
| III. Open File Formats | ✅ | `format`/`version`, validation of untrusted input, migrations, unknown keys preserved, published JSON Schema |
| IV. User Owns Their Data | ✅ | Self-contained projects (embedded assets) |
| V. Simplicity | ⚠️ justified | New dependency TypeBox — see Complexity Tracking. No polygon-clipping dependency (grid sampling instead) |
| Required tests (format parse/validate/migrate; geometry) | ✅ | quickstart scenarios 1–10 |

Post-design re-check: ✅ (one justified dependency).

## Project Structure

### Documentation (this feature)

```text
specs/003-project-format/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── slot-ids.md
│   └── rrq.schema.json      # generated (npm run schema)
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
src/model/
├── schema/              # TypeBox schemas: envelope, shared, palette, block, coloring, quilt
├── io.ts                # parseProject / serializeProject / migrations / integrity report
├── ids.ts               # newId(), duplicate detection
├── units.ts             # convertUnits, length-field table
├── geometry/
│   ├── path.ts          # path commands, arc center/radius, flatten, point-in-polygon, area
│   ├── intersect.ts     # line/arc analytic, Bézier subdivision, overlap merging
│   └── arrangement.ts   # split, prune (unconnected), half-edge faces → patch paths
├── blocks/edit.ts       # applySeamEdit: derive + remap across block and quilt colorings
├── blocks/
│   ├── derive.ts        # deriveSeamPatches(block)
│   └── remap.ts         # stable ids + fill inheritance + foundation flags (grid sampling)
├── coloring.ts          # paint with scopes, copy-on-write, garbage collection
└── layout/
    ├── slots.ts         # Slot type, generateSlots dispatcher, reconcile
    ├── horizontal.ts    # Horizontal layout generator
    └── borders.ts       # plain strip borders
public/schemas/rrq.v1.json
test/vitest/__tests__/model/   # one spec per quickstart scenario
test/fixtures/everything.rrq
```

**Structure Decision**: Model lives inside the app (`src/model/`), framework-free so it can later
run in a worker or CLI. Tests mirror modules.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| New runtime dependency: TypeBox | One source for types, validation of untrusted files, and the published JSON Schema (schemas are JSON Schema) | Hand validation for ~12 nested entities would be large and drift from types; Ajv needs a second source of truth for TS types |
