# Tasks: More Layouts and Pieced Borders

**Model**: `(opus)` by Opus (geometry, ids, format, tests); `(sonnet)` may go to Sonnet agents;
Opus reviews every diff. Nothing is merged or pushed (owner reviews `feat/more-layouts`).

## Phase 1: Model

- [X] T001 (opus) Schema v6: VariablePoint, OnePatch, Tumbling layouts; migration 5; units scaling;
  `patch` kind and `p:` slot group
- [X] T002 (opus) Variable Point preset (On-Point scaled, patches) + tests
- [X] T003 (opus) One Patch preset, ten shapes, Trimmed / No fill + tests
- [X] T004 (opus) Tumbling preset (Baby Blocks, Variable Blocks) + tests
- [ ] T005 (opus) Strip pattern cells factored out; pieced border styles on all sides with corners;
  aligned counts + tests (coverage, ids, colors carry over between pattern styles)
- [X] T006 (opus) Published schema v6, formats.json, fixture, version tests

## Phase 2: UI

- [ ] T007 (sonnet) Layout inspector sections for the four styles (style select, counts, sizes,
  shape, edge), convertLayout for them
- [ ] T008 (sonnet) Wizard cards for the four styles; One Patch shape step; preview
- [ ] T009 (sonnet) Borders inspector: counts for pieced styles (aligned styles say they follow the
  layout); hover label "Patch"; Set message for patches
- [ ] T010 (sonnet) Browser check of every story, screenshots

## Phase 3: Polish

- [ ] T011 (sonnet) Help (designing-a-quilt layouts and borders), slot-id contract, CLAUDE.md,
  tracker, spec 001 notes
- [ ] T012 (opus) Review, drawings of every style, final checks, report
