# Research: First Quilt

## R1. Rendering: Canvas 2D

- **Decision**: Draw the quilt on a `<canvas>` with Canvas 2D. Each block's patches are built once
  as `Path2D` objects in the block's design space (true circular arcs via `arc`, Béziers via
  `bezierCurveTo`) and cached per block; each slot draws them through its affine transform
  (stretching turns arcs into the right ellipses for free). Redraw is scheduled with
  `requestAnimationFrame` after any change, zoom, or pan.
- **Hit-testing**: invert view + slot transforms to find the slot (bounding-box scan; 900 slots is
  trivial), then `isPointInPath` on the cached `Path2D`s in design space → exact patch.
- **Thumbnails**: same renderer into a small offscreen canvas → cached by project revision.
- **Rationale**: 900 blocks × ~20 patches = ~18k paths. SVG would put 18k reactive DOM nodes on the
  page and miss the 100 ms target on tablets; Canvas redraws this in a few ms.
- **Alternatives**: SVG (simplest hit-testing, too slow at scale); WebGL (unneeded complexity).

## R2. Undo and immutable updates: Immer

- **Decision**: Immer (`immer@11`). `project.change(recipe)` runs `produceWithPatches`; the inverse
  patches are the undo step, the patches the redo step. Unchanged parts of the document (embedded
  images, other quilts) are shared, never copied. Model functions (`paint`, `applyLayout`,
  `applySeamEdit`, `convertUnits`) switch from `structuredClone` to `produce`, so they compose
  inside a recipe.
- **Coalescing**: changes with the same `coalesce` key within 1 s merge into one undo step (slider
  drags, typing).
- **Rationale**: Snapshot undo would copy a 20 MB project 200 times; patches are tiny. Immer is the
  standard, small, well-maintained tool for exactly this. Justified dependency (Complexity
  Tracking).
- **Alternatives**: Mutative (faster, smaller ecosystem); hand-written structural sharing (every
  edit would need careful spread copies); JSON diffing snapshots (slow on large docs).

## R3. Plain pieces (sashes, cornerstones, borders)

- **Decision**: A built-in project block `plain` (grid kind, one patch `p`, tag `system`, hidden
  from the sketchbook) is created on first use. Painting an empty sash/cornerstone/border slot first
  places `plain` there. Scope for plain pieces is by slot group, not by block: All = every sash
  (`sash:*`), every cornerstone (`cs:*`), or every side of that border (`border:<n>:*`).
- **Model change**: `paint` takes an explicit list of slot ids (scope resolution moves to a helper
  that knows blocks vs. slot groups); add `spray` (same fill within the targeted placements) and
  `swap` (same fill in every coloring of the quilt).

## R4. Starter content

- **Decision**: `src/content/starter.ts` defines the 12 blocks as seam drawings in normalized
  coordinates plus default colorings given as sample points (`[x, y, colorIndex]` → the patch
  containing the point gets that color), and the 36 colors. `createProject` derives patches with
  the 003 model and assigns ids. The bundled `.rrq_lib` pack form arrives with the libraries
  feature (spec 002), generated from this same data.
- **Rationale**: Patch ids are random, so colorings by sample point are robust to derivation order.

## R5. Editor state

- **Decision**: A Pinia `editor` store (session only): current mode, tool, scope, selected block,
  selected color, recent colors, zoom/pan per quilt. Tool state survives switching quilts.
- Keyboard: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z / Ctrl+Y, `F` fit, `+`/`-` zoom, Space-drag pan.

## R6. Color input

- **Decision**: Quasar `QColor` (visual picker + hex/RGB) plus an HSL tab with three sliders; no
  extra dependency.
