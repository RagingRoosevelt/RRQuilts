# Bug: exported blocks and packs drop fabric colorings

**Reported**: 2026-10-20 (owner, TC-029) · **Status**: Open (documented only, not fixed) · **Area**:
block files (`.rrqbl`, spec 011), packs (`.rrqlib`, spec 014)

## What happens

A block whose coloring uses fabrics (here, fabric images from a library palette) is exported with
Export block (`.rrqbl`) or put in a pack (Make pack). Opened again, the colorings that used fabrics
come back without them; colorings with plain colors (built-in palette colors) survive.

## Expected

The block's colorings arrive as they were: its fabrics travel with it, as its colors do (own
fabrics with their images at the save size; library fabrics by reference, with the 256 px image
when the library may be missing, as projects do: spec 014 `includeLibraryImages`).

## Steps to make it happen again

1. Make a block, add a coloring, paint some patches with fabrics from a library palette.
2. Export the block (`.rrqbl`), or Make pack with it.
3. Import the file in another project (or another device): the fabric patches are empty.

## Likely cause

`src/model/block-file.ts`: `BlockFile` has `colors` only, filled from the colors the colorings use
(`colorIdsOf` looks at `color` fills only). Pack block items (`schema/library.ts`, `LibraryItem`
block) likewise carry `colors` but no `fabrics`. Fabric fills (`fabric:<id>`) are left pointing at
fabrics the file doesn't contain.

## Fix needs

A format version bump for both files (`.rrqbl` v3: `fabrics`; `.rrqlib` items: `fabrics`), with
migrations (none needed for the data: the field is new) and format samples at the next release;
images embedded like project files (zip for packs, data URLs or `images` for `.rrqbl`).
