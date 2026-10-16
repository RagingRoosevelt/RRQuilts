# Implementation Plan: Shared Layout Engine

**Branch**: `016-layout-engine` | **Date**: 2026-10-15 | **Spec**: `spec.md`

**Input**: Feature specification from `specs/016-layout-engine/spec.md`

## Summary

Replace the per-style slot generators with one lattice engine (`src/model/layout/engine.ts`): bands of
repeating cells, one turn/shear map, clipping to the quilt, edge finishing. Horizontal becomes a
preset proven identical by an oracle sweep against today's generator; On-Point is the first new
preset, with setting pieces and four edge finishes. Slots gain shape, kind, turns, alternate class,
size, and an optional cut shape, so drawing, hit testing, scope, and printing stop inferring these
from ids and axis-aligned transforms. Test-only presets prove every planned lattice layout
(FR-002a). Project format goes to v5 for On-Point's parameters.

## Technical Context

**Language/Version**: TypeScript strict, Vue 3 + Quasar (app-vite), Pinia, Immer

**Primary Dependencies**: none new (TypeBox schemas, existing geometry: `arrange`, `pathToSegs`,
`flattenLoop`, `pointInPolygon`)

**Storage**: `.rrq` project format v4 → v5 (On-Point parameters); generated slots never stored

**Testing**: Vitest (`make test`); Playwright Firefox for manual flows

**Target Platform**: offline PWA, desktop and phone browsers

**Project Type**: static web app (framework-free model in `src/model/`)

**Performance Goals**: 100 × 100 On-Point (~20 000 spaces) regenerates and redraws without a visible
pause on a mid-range phone (SC-005)

**Constraints**: Horizontal ids, outlines, transforms, order unchanged (SC-001); model code imports no
Vue/Quasar/stores

**Scale/Scope**: engine + 2 user presets + ~10 test-only presets; Layout inspector style picker;
print and binding adjustments

## Constitution Check

| Principle | Status |
|---|---|
| I Static & Serverless | Pass: pure client code |
| II Offline-First | Pass: no network |
| III Open File Formats | Pass: v5 with migration 4→5, schema `rrq.v5.json` published, `formats.json` updated |
| IV User Owns Their Data | Pass: borders set aside under No fill stay in the file, nothing silently dropped; removal warning before losing placements on style switch |
| V Simplicity | Justified exception: engine generality beyond the two shipped presets (see Complexity Tracking); no new dependency |
| VI Licenses | Not affected |

Re-check after design: unchanged. The test-only presets are the "real uses" that the engine's
generality is checked against.

## Project Structure

### Documentation (this feature)

```text
specs/016-layout-engine/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/slot-ids.md      # On-Point id grammar (copied into spec 003's contract on implement)
└── tasks.md                   # /speckit-tasks
```

### Source Code

```text
src/model/layout/
├── engine.ts        # NEW: Tiling → Slot[] (bands, map, clip, edge finish, merges)
├── clip.ts          # NEW: convex clip (straight) + arrange()-based clip (curved)
├── presets.ts       # NEW: horizontal(), onPoint() → Tiling
├── slots.ts         # Slot/Generated extended; generateSlots dispatches to presets
├── horizontal.ts    # kept as test oracle until SC-001 passes, then removed
└── borders.ts       # unchanged; skipped for edge 'none'
src/model/schema/quilt.ts, project.ts   # OnPointLayout, VERSION 5
src/model/io.ts (migrations[4]), units.ts (scale On-Point lengths)
src/model/plain.ts   # slotGroup/describeSlot learn set:, b:m:
src/editor/scope.ts  # alt class from Slot instead of digit-sum parity
src/render/hit.ts    # flattened outline (arcs)
src/model/print/pieces.ts, yardage.ts (perimeter), components/PrintPreview.vue, PrintOptions.vue
                     # Slot.size, Slot.cut, Generated.edge, trim note
src/components/LayoutInspector.vue (+ OnPointInspector section), pages/QuiltEditorPage.vue
src/help/guides/…    # On-Point and edge finishes (help docs style)
public/schemas/rrq.v5.json, formats.json
test/vitest/__tests__/model/layout-*.spec.ts, test/fixtures/presets/ (engine preset checks)
```

**Structure Decision**: everything geometric stays in framework-free `src/model/layout/`; UI changes
are limited to the Layout inspector and print views.

## Phases (outline for tasks)

1. **Slot model**: extend `Slot`/`Generated` (kind, shape, turns, alt, size, cut, edge, trim); update
   draw/hit/scope/print to use them; Horizontal still on the old generator. All tests green.
2. **Engine + Horizontal preset**: `engine.ts`, `clip.ts`, `presets.horizontal`; oracle sweep
   (SC-001); switch `generateSlots`; delete `horizontal.ts`.
3. **On-Point**: schema v5 + migration + units; `presets.onPoint` with sashing, corner styles, four
   edge finishes; ids per contract; borders skipped for None.
4. **UI**: style picker enables On-Point; inspector fields (across, down, block side + width on point,
   sash, corner, edge finish + float); quilt size; style switch carries counts/size/sash and warns.
5. **Print**: setting piece cut shapes, trim note and edge on the diagram, binding by perimeter.
6. **Engine proof** (SC-004): test-only presets for every FR-002a layout incl. merges, with the
   coverage/ids/hit/draw checks.
7. **Docs**: help guide, spec 003 contract, spec 001 tracker items, CLAUDE.md layout section.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Engine supports layouts no user can pick yet (FR-002a) | Owner requirement (spec 001 FR-029c, 2026-10-15): later styles must be presets, not engine changes | Per-style generators: each new style would touch drawing, hit testing, ids, and printing again |
| `Slot.cut`, `turns`, `shape` before block shapes exist | Floating setting pieces need `cut` now; `shape`/`turns` keep FR-060a from reworking placement | Inferring from ids/transforms already broke for turned spaces |
