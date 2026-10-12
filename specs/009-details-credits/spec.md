# Feature Specification: Details, Credits, and Licenses

**Feature Branch**: `009-details-credits`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Making a copy should add my attribution to the attribution list — all
contributors credited, not only the original or the most recent. A Details tab for quilts (next to
Layout/Borders/Design/Print), blocks (next to Draw/Color/Print), and the project (next to
Quilts/Blocks/Fabrics & Colors/Photos/Threads) to edit title, notes, authorship (only your own
field when it's a copy of someone else's), and license (if not inherited)."

> Amends specs 007 (attribution) and 008 (copies, `.rrqbl`). Constitution Principle VI applies.

## Clarifications

### Session 2026-10-11

- Q: Which licenses can be picked? → A: Public Domain Mark, CC0, CC BY-SA (default), CC BY-NC-SA,
  All rights reserved. The picker shows two lines per option with the terms spelled out
  ("Attribution · Share-alike", "Non-commercial", …).
- Q: Do licenses earlier in the chain limit the choice? → A: Yes.
- Q: Does a quilt inherit share-alike from its blocks? → A: Yes, and it must credit its blocks.
- Q: What does the project license do? → A: It's the default license for new items in the project
  and covers the whole `.rrq` file.
- Q: What happens to "Notecard…"? → A: It opens the new Details tab.
- Q: License of the built-in blocks? → A: Public Domain Mark for the built-in blocks and colors
  (traditional designs).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every contributor is credited (Priority: P1)

Copying or changing someone else's block keeps everyone before you in its credits and makes you the
author.

**Independent Test**: Edit a copy of Ohio Star (by RRQuilts contributors) as Jane → Jane is the
author, credits list "Ohio Star by RRQuilts contributors". Export it; Sam imports it and edits a
seam → Sam is the author; credits list RRQuilts contributors, then Jane.

**Acceptance Scenarios**:

1. **Given** a block authored by someone else, **When** the user makes a copy or changes its
   drawing, **Then** the previous author (with the name and license at that point) is appended to
   the credits, and the user becomes the author.
2. **Given** the user's own block, **When** copied, **Then** credits are unchanged.
3. **Given** an imported `.rrqbl`, **Then** its author and credits come with it; the importer becomes
   the author only once they change it.

### User Story 2 - Details tabs (Priority: P1)

Quilts, blocks, and the project have a Details tab to edit title, notes, author, and license, and to
see credits.

**Independent Test**: Open a quilt → Details → rename it, add notes, pick CC0 → the sketchbook card
shows the new name; undo restores it.

**Acceptance Scenarios**:

1. **Given** the quilt editor, **Then** tabs are Layout, Borders, Design, Print, Details; the block
   editor: Draw, Color, Print, Details; the project page: Quilts, Blocks, Fabrics & Colors, Photos,
   Threads, Details.
2. **Given** Details, **Then** title, notes, and author are editable; earlier contributors are listed
   read-only under "Based on"; a quilt also lists "Blocks by" for blocks made by others, with their
   credits.
3. **Given** "Notecard…" in a sketchbook menu, **Then** it opens the item's Details tab.

### User Story 3 - Licenses (Priority: P1)

Items and projects carry a license; earlier work in the chain limits the choice.

**Acceptance Scenarios**:

1. **Given** the license picker, **Then** each option shows its name and, on a second line, its
   terms spelled out.
2. **Given** a new, copied, or imported item, **Then** it gets the project license at that moment
   and keeps it when the project license changes later (items from older files without one are
   pinned to the old project license first); a new project's license is CC BY-SA.
3. **Given** credits (or, for a quilt, others' blocks) under a restrictive license, **Then** the
   license is locked with the reason shown: All rights reserved → All rights reserved;
   non-commercial → CC BY-NC-SA; share-alike → CC BY-SA. Public domain, CC0, and CC BY sources leave
   the choice free.

### Edge Cases

- No name set → copies add the previous author to credits; the new author stays blank ("anonymous").
- Older files (credits only in `source`) → `source` is shown as the first credit.
- Share-alike and non-commercial share-alike both in the chain → CC BY-NC-SA (the stricter).
- Exported `.rrqbl` carries the block's effective license.

## Requirements *(mandatory)*

- **FR-001**: Blocks and quilts MAY carry `author`, `license`, and `credits` (ordered, origin first;
  each `{ author?, name?, license?, library? }`); projects MAY carry `author`, `notes`, `license`.
  None affect an item's version hash.
- **FR-002**: Copying, or changing the drawing of, a block whose author isn't the user MUST append
  the previous author to `credits` and set the user as author; the item's license resets to the
  project license (the lock may override it).
- **FR-003**: The effective license is: chain lock (FR-004) → the item's license (set on creation,
  copy, and import) → the project license (older items only) → CC BY-SA.
- **FR-004**: Lock = strictest of the credits' licenses (blocks), plus every used block's effective
  license (the user's own too) and its credits (quilts): All rights reserved > non-commercial > share-alike > free.
- **FR-005**: Details tabs per US2; edits are one undo step each (typing coalesced).
- **FR-006**: The picker offers Public Domain Mark, CC0 1.0, CC BY-SA 4.0, CC BY-NC-SA 4.0, All
  rights reserved, each with spelled-out terms; unknown licenses from libraries display as-is.

## Success Criteria *(mandatory)*

- **SC-001**: No contributor is ever dropped from a block's credits by copying, importing, or editing.
- **SC-002**: A license can never be set looser than its chain allows.
