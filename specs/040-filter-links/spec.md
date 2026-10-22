# Feature Specification: Links to Filtered Views

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-22

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-22: "let's add a spec to add support for
/RRQuilts/project?show=blocks&filter=... or /RRQuilts/project?show=palettes&filter=... or
/RRQuilts/libraries?show=blocks&filter=..., etc" and "help articles mentioning certain types of
blocks (eg data blocks) would link to the library (or project if one is open), filtered to that
type of block".

## Today

- `/project` opens the project sketchbook on its last tab. The tab (Quilts, Blocks, Palettes,
  Photos, Threads, Details) lives only in the page.
- `/libraries` opens on the type kept in settings (`libraryType`: blocks, palettes, or all).
- Filters (Metadata: Category, Tags, Technique; Shape; Construction; Data; Color; the Quilts tab's
  Show) are page state. They start clear and can't be linked, bookmarked, or shared.
- Help can link to a topic or a page, but not to "the data blocks".

## Concepts

- **View link**: a URL whose query names a tab (`show`) and filters. Opening it shows that tab with
  those filters set. Nothing else changes: no project is opened, nothing is saved.
- **Filter value**: the same choices the filter sidebar offers, written as short stable words
  (`data=month`, `shape=triangle`), never display labels, so links survive relabelling.
- **Help type link**: a link in a help article on a kind of block (data blocks, shaped blocks,
  curved seams...) that opens the project's Blocks tab when a project is open, otherwise
  Libraries › Blocks, filtered to that kind.

## User Scenarios & Testing

### User Story 1 - Open a tab by link (Priority: P1)

1. **Given** a project is open, **When** `/project?show=blocks` is opened, **Then** the sketchbook
   shows its Blocks tab. `show` takes `quilts`, `blocks`, `palettes`, `photos`, `threads`,
   `details`.
2. **Given** `/libraries?show=blocks` (or `palettes`, `all`), **Then** Libraries shows that type.
   The setting `libraryType` changes as if the quilter had picked it.
3. **Given** the quilter changes the tab, **Then** the URL's `show` follows (`router.replace`, no
   new history entry per click), so the address can be copied as a link to what is on screen.
4. **Given** no project is open and `/project?...` is opened, **Then** the existing open-project
   guard applies (home with its notice), and the query is kept so the view applies once a project
   opens (from the notice's Open or recent list) in the same visit.

### User Story 2 - Filters in the link (Priority: P1)

1. **Given** `/libraries?show=blocks&data=month`, **Then** the Data filter is set to Month and only
   month data blocks show; the sidebar shows the filter set, and it clears as usual.
2. Filters and their query words:

   | Filter (sidebar)     | Query            | Values                                                      |
   | -------------------- | ---------------- | ----------------------------------------------------------- |
   | Metadata › Category  | `cat`            | category names, repeatable                                  |
   | Metadata › Tags      | `tag`            | tag names, repeatable (`tag=favorite` for ⭐)               |
   | Metadata › Technique | `technique`      | technique ids from the fixed list, repeatable               |
   | Shape                | `shape`          | block shape ids (`square`, `triangle`, `diamond60`, ...)    |
   | Construction         | `construction`   | the Construction choices' ids (`curved`, `set-in`, ...)     |
   | Data                 | `data`           | `none`, `day`, `week`, `month`                              |
   | Color (palettes)     | `hue`, `range`   | degrees 0 to 359, ± degrees; `only=1` for matching swatches |
   | Quilts › Show        | `quilts`         | `all`, `data`, `other`                                      |
   | Libraries sidebar    | `library`        | a library or pack id: show only it (as clicking its name)   |
   | Search box (if any)  | `q`              | text                                                        |

   A repeated key (`tag=a&tag=b`) means any of them, as picking several in the sidebar does.
3. **Given** the quilter changes a filter, **Then** the URL follows (replace, not push).
4. **Given** a filter value that doesn't exist here (a tag nobody uses, a pack that isn't
   installed), **Then** it's ignored, the rest apply, and a short note says what was skipped.
   Links are untrusted input: unknown keys are ignored, values are length-limited, never run.
5. **Given** a filter that doesn't belong to the shown tab (`data=` with `show=palettes`), **Then**
   it is ignored.

### User Story 3 - Help links to a kind of block (Priority: P2)

1. **Given** the Data quilts guide, **When** "data blocks" (a marked link) is clicked with a project
   open, **Then** the project's Blocks tab opens filtered to data blocks (`data=day,week,month`, any
   data block). With no project open, Libraries › Blocks opens with the same filter.
2. Help Markdown gets one form for this, e.g. `[data blocks](view:blocks?data=any)`, which
   `HelpPage` turns into the project or libraries link at click time (a project may open or close
   while help is shown). A test checks every `view:` link parses to known keys and values.
3. First uses: Data quilts (data blocks; month blocks), Designing a quilt (shaped blocks by shape),
   Drawing blocks (curved seams, set-in seams via Construction), Libraries (favorites), Colors and
   palettes (palettes by color).
4. A Libraries link to built-in items only (`library=rrquilts`) is allowed where help means "the
   built-in Month Strip".

### Edge Cases

- `/project?show=blocks` while the editing lock is held by another tab: the usual takeover notice;
  the view applies after takeover.
- Phones: the filter sidebar stays closed, but the "Filters" button shows a count of filters set,
  so a filtered view isn't mistaken for everything.
- Back button: filter changes don't add history entries; opening a view link does (one entry).
- Deep links already rely on SPA fallbacks (404.html, nginx `try_files`, SW `navigateFallback`);
  query strings pass through all three unchanged.
- Settings: the link sets `libraryType` (as today when picked). Filters stay page state and aren't
  saved.
- The block editor and quilt editor routes (`/project/block/:id`) are out of scope.

## Requirements

- **FR-001**: `/project` and `/libraries` read `show` and the filter keys above from the query on
  open and on query change, and apply them.
- **FR-002**: Changing the tab or a filter updates the query with `router.replace`; clearing a
  filter removes its key. The query is ordered stably so equal views give equal URLs.
- **FR-003**: Unknown keys and values are ignored; skipped known values are reported once in a
  short note. Parsing never throws.
- **FR-004**: Filter query words are stable ids, documented in this spec's table and in a
  `contracts/view-links.md` when planned.
- **FR-005**: Help supports `view:` links resolved at click time to `/project?...` (project open)
  or `/libraries?...` (none), with a test validating every `view:` link in `src/help`.
- **FR-006**: The guides listed in User Story 3 link their kinds of block.
- **FR-007**: No network use; links work offline like every route.

## Success Criteria

- **SC-001**: Each filter in the sidebar can be expressed as a link, and opening that link gives
  the same list as setting the filter by hand.
- **SC-002**: Copying the address after setting filters and opening it in a new tab shows the same
  view.
- **SC-003**: A help link to data blocks lands on a list containing only data blocks, in the open
  project or the libraries.
- **SC-004**: Malformed or hostile query strings (unknown keys, long values, bad ids) never break the
  page.

## Assumptions

- Filter ids come from the existing code (`BlockFilter` shapes, Construction choices, data kinds,
  `TECHNIQUE_GROUPS` ids). Where a choice has no stable id today, one is added.
- Data quilts' "any data block" value (`data=any`) is new; the sidebar may gain it as an option too.
- No format version change: nothing is saved.
