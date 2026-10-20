# Feature Specification: Block Techniques, the Quilter's Tags, and Construction Filters

**Feature Branch**: `feat/shaped-blocks` (format changes ride the unreleased project v7, library v4
and block v2)

**Created**: 2026-10-19

**Status**: Implemented

**Input**: Owner, 2026-10-19. Later the same day: techniques only where they tell blocks apart (any block can be EPP'd or machine pieced), so Needs (FPP, appliqué, hand sewing) and Efficiency checklists in the block's Details, in the data only, never applied by the app; built-in blocks pre-apply no tags; a built-in ⭐ Favorite tag, first in tag lists, with a badge on cards. Originally: we're not making good use of styles and tags for blocks. Tags are owned
by the user. Styles should be set by the block author, and be a technique instead: machine sewn,
hand sewn, FPP, EPP, and so on. Tags live in the user's library, not in projects; the trouble is
tags on things the user no longer has, which must not pile up forever unmanaged. Include
implementation.

## Concepts

| Field | Owner | Values | Travels with the block |
|---|---|---|---|
| Category | Library author | the library's tree (Stars, Log Cabin) | yes |
| Technique | Block author | fixed list, several allowed | yes; read-only on library blocks |
| Tags | The quilter | free words | no; kept in the quilter's own data |

- **Technique**: what the block's designer marks it with, in two checklists. **Techniques** (named
  Needs until 2026-10-20; beyond
  ordinary machine piecing): Foundation paper piecing, Appliqué, Hand sewing. **Efficiency** (faster
  methods it suits): Strip piecing, Quick units (half-square triangles, quarter-square triangles or
  flying geese several at a time), Stitch and flip. No technique means ordinary machine piecing.
  Only what the data says: the app never applies one. Replaces the free-text "styles".
- **Favorite**: one tag the app offers before it's used (never applied for you), listed first
  wherever tags are picked or filtered, shown as ⭐ Favorite; blocks with it show a ⭐ badge in the
  top right of their picture. (2026-10-20) Library palettes get the same: Tags… on their menu (and a
  tag button on the sketchbook's library palette rows), kept as for blocks (on My library's own
  palettes, in My library for others'), and a ⭐ before the palette's name on its card, in the
  sketchbook and in the quilt editor's color tray. A project's own palettes have no tags yet (their
  notecard holds only a name: adding tags is a project format change).
- **Tags**: the quilter's own filing words. On blocks the quilter owns (My library, a project's own
  blocks) they are part of the block. On blocks the quilter can't edit (built-in, packs, web
  libraries) they are kept in My library, linked by the block's id (the same across versions).
- **Tag list**: every tag in use, worked out when needed and never stored, so a tag no longer used
  anywhere disappears by itself.
- **Construction**: what the app reads from a block's drawing, for filtering, never stored or edited:
  curved seams, set-in seams (no order of sewing a unit to the rest along one straight seam, again and again, puts it together; 2026-10-20: was "straight lines right across", which missed strips sewn on last and star wedges), piece count,
  smallest piece, and a difficulty from those.
- **Internal tags** (`system` on the hidden plain block) are the app's, never shown or offered.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Technique on blocks (Priority: P1)

A block's author marks how it is meant to be made; quilters filter by it.

**Acceptance Scenarios**:

1. **Given** the quilter's own block, **When** they open its **Details** tab, **Then** they tick
   techniques in the **Techniques** and **Efficiency** checklists: ticked is in the block's data,
   unticked is not. Saved with the block, in backups, packs and block files.
2. **Given** a built-in or pack block, **Then** its Details tab lists its techniques without
   checkboxes.
3. **Given** the Libraries page, the project's Blocks tab, **Then** a **Technique** filter lists the
   techniques the shown blocks use, under **Techniques** and **Efficiency** section labels, and Group by
   offers Technique.
4. **Given** built-in blocks, **Then** they carry no techniques and no tags until their data says
   so (a test checks they come with no tags).

### User Story 2 - Old styles become tags (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a project, library or block file with `styles` (written before this change), **When**
   opened, **Then** each style becomes a tag on the same item (they were the quilter's own words),
   and no style is lost.
2. **Given** settings grouping blocks by styles, **Then** they group by category instead.

### User Story 3 - Tag any block (Priority: P1)

**Acceptance Scenarios**:

1. **Given** any block on the Libraries page (built-in, pack, or mine), **When** the quilter picks
   **Tags…** (tags only; technique is in Details), **Then** they add or remove tags, ⭐ Favorite
   offered first; for their own blocks the tags are saved in the block,
   for others' in My library.
2. **Given** the project's Blocks tab, **When** the quilter tags a block there, **Then** a library
   block's tags go to My library, and the project's own block's tags to the block.
3. **Given** typing a tag, **Then** existing tags are suggested (case-insensitive), and a new one is
   added with Enter; spaces at the ends are dropped, and a tag differing only in case from an
   existing one takes that one's spelling.
4. **Given** tags on a library block, **When** that block shows in a project, **Then** its tags show
   and filter there too (looked up by its library id).
5. **Given** a backup of My library, **Then** the tags on others' blocks are in it and come back on
   restore.

### User Story 4 - Tags on blocks you no longer have (Priority: P2)

**Acceptance Scenarios**:

1. **Given** tags kept for blocks that no installed library has (a pack removed), **Then** the
   Libraries page shows "Tags on N blocks you no longer have" with **Remove**, listing the tags.
2. **Given** removing a pack whose blocks have tags, **When** the quilter confirms, **Then** they are
   asked whether to keep those tags in case the pack comes back.
3. **Given** a pack that comes back (same block ids), **Then** its kept tags show again.

### User Story 5 - Construction filters (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the Libraries page and the project's Blocks tab, **Then** a **Seams** filter offers
   Straight only, Curved, and Set-in, and a **Difficulty** filter offers Beginner, Intermediate and
   Advanced; both read from the drawing.
2. **Given** the dev-only Tests › Blocks view, **Then** each block shows its technique and what the
   app reads from it (seams, pieces, difficulty), for checking by eye.

### Edge Cases

- A block owned by the quilter that also has kept tags under the same id (a linked copy of a library
  block): its own tags are used; the kept ones belong to the library block.
- Packs made from My library leave tags out (they are the maker's private filing), keeping technique.
- Block files (`.rrqbl`) shared from a project keep technique and leave tags out.
- A pack installed before this change with tags on its blocks: those still show and filter, but can
  only be added to, not removed (they are the pack's).
- Curved blocks: set-in seams are not checked (curved piecing is reported instead).
- Difficulty: Beginner = straight seams only, no set-in seams, at most 16 pieces, smallest piece at
  least 1½ in; Advanced = curved or set-in seams, more than 49 pieces, or a piece under ¾ in across;
  otherwise Intermediate. Measured at the block's own size.

## Requirements *(mandatory)*

- **FR-001**: Notecards MUST carry `techniques` (a list from a fixed set) in place of `styles`,
  in projects (v7), libraries (v4) and block files (v2), with no further version bump.
- **FR-002**: Opening older files MUST turn `styles` into tags on the same item.
- **FR-003**: Personal libraries MUST keep the quilter's tags on blocks they don't own, by id
  (`annotations`), included in backups; packs MUST NOT carry them.
- **FR-004**: The tag list MUST be computed from tags in use; internal tags are never shown.
- **FR-005**: Filters on the Libraries page and the project's Blocks tab MUST offer Technique, Tags
  (the quilter's), Seams and Difficulty; Group by MUST offer Technique instead of Styles.
- **FR-006**: Kept tags for blocks no installed library has MUST be listed and removable; removing a
  pack MUST ask whether to keep its tags.
- **FR-007**: Construction MUST be read from the drawing and cached per block version.
- **FR-008**: Built-in blocks MUST carry techniques from their drawings and no `starter` tag.

## Out of Scope (later)

- Printing by technique (foundation patterns for FPP, papers for EPP).
- Appliqué drawing (Appliqué is a technique value now so authors can mark it).
- Symmetry and color-count filters.
