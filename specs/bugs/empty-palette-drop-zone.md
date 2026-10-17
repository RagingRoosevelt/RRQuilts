# Bug: empty library palette has no drop zone for fabric images

**Reported**: 2026-10-16 (owner) · **Status**: Open (documented only, not fixed) · **Area**: Libraries,
palette dialog (spec 014 FR-020)

## What happens

Open a My library palette that has no colors or fabrics yet (Libraries › a palette of your own). The
dialog shows only the title and the two small add buttons (Add a color, Add fabric images). There is
no visible area to drop image files on, so dragging photos onto the dialog looks like it can't work.

## Expected

An empty editable palette shows a drop zone in place of the large swatch view, the same height
(about min(80vw, 512px)), with a hint such as "Drop fabric images here, or use Add fabric images".
Dropping images there opens the fabric import dialog for this palette, as dropping on a palette
with items does. Read-only (library and pack) palettes show no drop zone.

## Steps to make it happen again

1. Libraries › My library › new palette (leave it empty).
2. Open the palette.
3. Drag image files from the file manager over the dialog.

## Likely cause

`src/components/PalettePreview.vue`: the drop handlers are on the component's root, but with no
swatches the `v-if="swatches.length"` block (carousel + details) isn't rendered, so the root is just
the swatch strip, one row of 40px buttons. That strip is the only drop target, and it has no hint.
Probably affects the project's Palettes tab too (same component, `images` + `editable`).

## Fix idea

A `v-else` branch for editable, image-capable, empty palettes: a dashed box at the carousel's
height with the hint and an Add fabric images button, inside the existing drop handlers (so the
`drop-target` highlight already applies). Check: empty palette → drop 2 images → import dialog
opens with both.
