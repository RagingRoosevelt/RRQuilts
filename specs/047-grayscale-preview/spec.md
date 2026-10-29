# Feature Specification: View Grayscale in Block Previews

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented). Follows the View grayscale switch of 0.7.2.

**Input**: Owner, 2026-10-29: "let's add a spec that the greyscale toggle should also be available
in the block preview too".

## Today (0.7.2)

- **View grayscale** sits above Colorways in the quilt editor (Design) and above Colorings in the
  block editor (Color). On, the canvas shows each color as the gray of the same luminance (Rec. 709
  weights in linear light, the SVG filter `#rrq-gray` in `App.vue`), so equal grays mean equal
  values. It's session only and shared by both editors (`editor.gray`).
- The block previews don't have it: the dialog a block opens in the project's **Blocks** tab
  (`SketchbookPage.vue`, a block that opens as a preview) and in **Libraries**
  (`LibrariesPage.vue`), each a large picture of the block with its colorings to pick from.

## User Scenarios & Testing

### User Story 1 - Check a block's values before using it (Priority: P2)

**Independent Test**: Libraries › a built-in block › preview. Switch on View grayscale: the
picture turns to grays; the coloring thumbnails under it too. Close it and open the quilt editor:
its View grayscale is on as well.

1. **Given** a block preview (project Blocks tab or Libraries), **Then** a **View grayscale** switch
   sits in it, by the picture.
2. **When** it is on, **Then** the preview's picture and its coloring thumbnails show in the same
   grays as the editors (the same filter), and nothing else changes.
3. **Then** it is the same switch as the editors' (`editor.gray`): on in one place, on in all, for
   the session.

## Requirements

- **FR-001**: Both block preview dialogs MUST offer **View grayscale**, sharing the editors' state.
- **FR-002**: On, the preview's block picture and coloring thumbnails MUST use the editors' gray
  (same luminance, `#rrq-gray`), not CSS `grayscale()`.
- **FR-003**: View only: no change to the block, its colorings or the project.

## Out of scope

- Grays in other lists (block cards, the tray, print previews).
