# Feature Specification: Changing Your Name

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-22

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-22: "if I change my name in the app, the app should offer to rename all of
the things I've built with the new ID. it should warn that would break detecting that it's looking
at the same thing and also offer an alternative to only change the display name, not the ID used."

## Today

- Settings › You › name (`settings.author`) is the quilter's name. New blocks, colors, fabrics,
  palettes and quilts get ids `<author-slug>.<random>` (`model/identity.ts`, `itemId`), and carry
  `author` (the name) for credits.
- Changing the name changes only what new items get. Items already made keep the old name as their
  `author` and the old slug in their id, so the quilter's own work shows under two names.
- Ids are how the app knows two copies are the same item: linked copies in projects
  (`source.itemId`, `source.derived`), My library sync and its conflicts, color variants
  (`source.itemId`), library updates, packs and resource repositories, `.rrqbl` / `.rrqplt` exports
  that others have imported, tags kept by item id (My library `annotations`).

## Concepts

- **Display name**: the `author` shown and credited on an item. Changing it changes nothing about
  identity.
- **Id prefix**: the author slug at the front of an item's id. Changing it makes a new identity.
- **Your items**: items whose `author` is the old name (or whose id starts with the old slug) and
  that aren't others' work: own project items, My library items, own packs. Items with credits from
  others keep those credits (only the newest author entry, the quilter's, changes).

## User Scenarios & Testing

### User Story 1 - Choose what a name change does (Priority: P1)

1. **Given** the quilter changes their name in Settings › You (or the welcome wizard, or the author
   prompt) and has items under the old name, **When** they leave the field (or press Save), **Then**
   a dialog asks "You changed your name from <old> to <new>. What about the N things you've made?"
   with three choices:
   - **Change the name on them** (default, recommended): each item's display name (author, and its
     own credit line) becomes the new name. Ids stay, so everything still matches its copies.
   - **Change the name and their ids**: also gives each a new id with the new name's prefix. A
     warning under it says what breaks: copies elsewhere (other projects, My library on other
     devices, shared files, packs others have) are no longer recognized as the same item; links,
     library updates and sync stop matching, and they'll show as separate items. Tags and colorway
     links inside this device are carried over.
   - **Leave them as they are**: only new items get the new name.
2. **Given** the name is changed to the same slug (capitalization, accents), **Then** "Change the
   name and their ids" is hidden (the ids wouldn't change).
3. **Given** no items carry the old name, **Then** no dialog.

### User Story 2 - What "Change the name on them" covers (Priority: P1)

1. **Then** My library items, the open project's own items, and recent projects' drafts held on
   this device are updated; project files on disk are updated the next time they're opened, by a
   notice offering the same choice ("This project has 12 things made under <old>").
2. **Then** versions (content hashes) don't change, since names aren't content
   (`contentVersion` ignores names).

### User Story 3 - What "Change the name and their ids" covers (Priority: P2)

1. **Then** every reference to an old id on this device is rewritten to the new one in the same
   step: quilts' placed blocks and colorings, palettes' colors and fabrics, project palettes linked
   to My library palettes (`source`), color variants, data quilt types, tags (`annotations`),
   sorted-palette settings, collapsed sections, recent files' drafts.
2. **Then** the open project counts as changed; other projects are offered the same rewrite when
   opened (a notice), with the old → new id map kept on the device until then.
3. **Then** the change is one undo step in the open project; in My library it can be undone from
   the notice that confirms it ("Ids changed for N items. Undo").

### Edge Cases

- Others' items (library packs, items with a different author) are never touched.
- An item whose author was edited by hand to someone else: not the quilter's, left alone.
- Gist and shared files already sent: can't be changed; the warning says so.
- Settings import (`.rrqconf`) bringing a different name: the same dialog after import.
- Empty name ("anonymous" slug): items made anonymously count as the quilter's only if they were
  made on this device (My library, own project items).

## Requirements

- **FR-001**: A name change with existing own items MUST ask which of the three choices to apply,
  with the id warning shown beside the id choice.
- **FR-002**: Changing the display name MUST NOT change ids or versions.
- **FR-003**: Changing ids MUST rewrite every reference on the device consistently in one step, and
  offer the same to projects opened later.
- **FR-004**: Others' work MUST NOT be changed.
- **FR-005**: Help (Settings, Credits and licenses) MUST explain the choice and what an id change
  breaks.
- **FR-006**: No file format change (ids and authors are existing fields).

## Success Criteria

- **SC-001**: After "Change the name on them", every own item shows the new name, and every linked
  copy, sync and library update still works as before.
- **SC-002**: After "Change the name and their ids", no reference on the device points at an old id.

## Assumptions

- "Things I've built": blocks, colors, fabrics, palettes, quilts and projects made by the quilter.
- The default is the display-name change, since it keeps everything matching.
