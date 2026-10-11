# Feature Specification: Library Format & Resource Repositories

**Feature Branch**: `002-library-format`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Define the shared structure of resource repositories (git) and `.rrq_lib`
files. One document, packed (single file) or exploded (repo with image files). `kind` personal vs
pack. Default pack license CC-BY-4.0. Repositories are pinned; updates come with a changelog the
user reads before choosing to move their pin."

> Builds on spec 001 (FR-080–FR-086). Item payloads (blocks, fabrics, colors, …) reuse the `.rrq`
> project schemas; this spec defines the envelope, organization, assets, repository conventions,
> pinning, and updates.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Back up and restore my own library (Priority: P1)

A quilter backs up their personal library to a file and restores it on another device.

**Why this priority**: Personal libraries live in browser storage, which can be cleared; backup is
the safety net.

**Independent Test**: Back up a library with blocks and a scanned fabric, clear app data, restore;
everything returns as the user's own work.

**Acceptance Scenarios**:

1. **Given** a personal library, **When** the user chooses "back up my library", **Then** one
   `.rrq_lib` file of kind `personal` is saved with all items and embedded images.
2. **Given** that file on another device, **When** imported, **Then** it appears under the user's
   own libraries, fully editable.
3. **Given** a personal library with the same id already exists, **When** importing, **Then** the user
   chooses merge or replace.

---

### User Story 2 - Share a pack and use someone else's pack (Priority: P1)

A quilter shares a set of blocks as a pack; a friend imports it and uses it, always seeing who made
it and under what license.

**Why this priority**: Sharing is the reason the format exists.

**Independent Test**: Export a pack, import it on another profile, place one block in a quilt, and
confirm author/license show and the item is read-only until copied.

**Acceptance Scenarios**:

1. **Given** a personal library, **When** the user chooses "share as pack", **Then** they confirm
   name, description, author, and license (default CC-BY-SA-4.0) and a `.rrq_lib` of kind `pack` is saved.
2. **Given** a pack file, **When** imported, **Then** it appears under packs, separate from the user's
   own libraries, with author and license visible.
3. **Given** a pack item, **When** the user wants to change it, **Then** they copy it into their own
   library; the copy keeps source and license on its notecard.

---

### User Story 3 - Connect a repository pinned to a revision (Priority: P2)

A quilter connects a git repository of resources by URL; its content stays fixed until they choose
otherwise.

**Why this priority**: Repositories let creators publish and update collections over time.

**Independent Test**: Connect a public GitHub repo, go offline, use its items; reconnect later and
confirm nothing changed without consent.

**Acceptance Scenarios**:

1. **Given** a repository URL (optionally with branch or tag), **When** the user connects, **Then**
   the app downloads it, shows name/author/license/revision, and pins the current revision.
2. **Given** a pinned repository, **When** offline, **Then** all its items remain usable.
3. **Given** a pinned repository, **When** its source changes, **Then** the user's content does not
   change until they accept an update.
4. **Given** a connected repository, **When** the user disconnects, **Then** its cached content is
   removed; projects that used its items are unaffected.

---

### User Story 4 - Review a changelog and move the pin (Priority: P2)

When a newer revision exists, the user reads what changed and decides whether to update.

**Why this priority**: Users must trust that libraries do not shift under their designs.

**Independent Test**: Pin revision 2, publish revision 4 with changelog entries for 3 and 4; the app
shows both entries plus added/changed/removed items; user accepts and pin becomes 4, or declines and
stays at 2.

**Acceptance Scenarios**:

1. **Given** a pinned repository following a branch, **When** the user checks for updates (or the
   app checks while online), **Then** a newer revision is reported with every changelog entry between
   the pinned and latest revision, plus a list of added, changed, and removed items.
2. **Given** an update shown, **When** the user accepts, **Then** the new revision is downloaded
   (only changed images) and the pin moves; **When** declined, **Then** nothing changes and that
   revision is not offered again until a newer one appears.
3. **Given** a repository pinned to a tag, **Then** no updates are offered (tags are fixed); the user
   can switch to another tag or a branch.

---

### User Story 5 - Export my work as a ready-to-publish repository (Priority: P2)

A creator exports one of their own libraries as a zip that, once unzipped into a new git repository
and pushed, is a working resource repository. Later exports of the same library publish the next
revision with a changelog entry.

**Why this priority**: Turning personal work into a shareable, updatable repository is the main
publishing path.

**Independent Test**: Export a library as a repository zip, unzip into a new GitHub repo, commit,
push, tag as instructed, and connect from another device; then add a block, export again with a
changelog note, commit, and see the update offered with that note.

**Acceptance Scenarios**:

1. **Given** a personal library, **When** the user chooses "export as repository", **Then** they
   confirm name, description, author, license (default CC-BY-SA-4.0), and a zip downloads containing
   `rrq_lib.json` (kind `pack`, images as separate files), `assets/`, `LICENSE`, and `README.md`.
2. **Given** that zip unzipped at a repository root and pushed, **When** anyone connects to it,
   **Then** it loads with no edits.
3. **Given** a library already exported before, **When** the user exports again, **Then** the same pack
   `id` is kept, `revision` increases by one, the user writes a changelog note for the new revision,
   and earlier changelog entries are preserved.
4. **Given** the export, **Then** `README.md` explains how to create the repository, commit, tag the
   revision (`rrq-rev-<revision>`), and how others connect to it.
5. **Given** an exported single-file pack, **When** committed as `rrq_lib.json` at a repository root,
   **Then** it is also a valid repository.

---

### Edge Cases

- Repository unreachable, renamed, or deleted → pinned cache keeps working; update checks report
  "unreachable" without error spam.
- Cache cleared and source has moved past the pinned revision → if the repository has a tag for the
  pinned revision, restore from it; otherwise tell the user the pinned revision is gone and offer the
  latest with its changelog.
- Newer revision has a lower or equal `revision` number than the pin → treated as no update; reported
  as an author error if content differs.
- Missing or malformed changelog on an update → update still offered, labelled "no changelog
  provided"; computed item changes still shown.
- Item removed upstream → projects keep their embedded copy; user's copies in personal libraries
  are unaffected.
- Image hash mismatch, disallowed type, or over size limit → that item skipped and reported.
- Unknown item `type` or newer item schema → item skipped and reported; rest loads.
- File declares `kind: personal` from a repository → rejected (repositories must be packs).
- Pack without author or license → rejected with an explanation.
- Two packs/repositories with the same `id` → second is refused with "already installed".
- Re-export after browser data loss (publishing history gone) → user can import the repository's
  current `rrq_lib.json` (or zip) to recover the pack `id`, `revision`, and changelog before exporting.
- User removes items before a re-export → they appear as "removed" in the computed changes others
  see; the export warns the publisher.

## Requirements *(mandatory)*

### Functional Requirements

**Document**

- **FR-001**: A library document MUST be UTF-8 JSON with top-level fields: `format` (`"rrq_lib"`),
  `version` (schema version, integer), `units` (`"in"` | `"cm"`, as in spec 003), `kind` (`"personal"` | `"pack"`), `id` (stable unique id),
  `revision` (integer, increases with each published change), `name`, `description`, `categories`,
  `items`; packs additionally require `author` (`name`, optional `url`) and `license`.
- **FR-002**: `license` MUST be an SPDX identifier; "share as pack" MUST default it to
  `CC-BY-SA-4.0` (share-alike by default, constitution Principle VI), changeable by the author
  unless an item's license requires share-alike.
- **FR-002a**: Exports MUST enforce item licenses: every item's attribution (author, library,
  license) is kept and listed in a generated credits section (`credits` in the document, and in
  `README.md` for repository zips); items derived from share-alike content force a compatible
  share-alike pack license; items whose license forbids redistribution or derivatives are excluded
  with an explanation.
  An item MAY carry its own `license`, which overrides the document's.
- **FR-003**: `categories` MUST be a list of `{ id, name, styles: [{ id, name }] }`; every item MUST
  reference an existing category and style.
- **FR-004**: Each item MUST have `id` (unique within the document), `type`, `category`, `style`,
  `notecard` (`name`, `notes`, `reference`, `tags`), optional `license`, optional `source`
  (`libraryId`, `itemId`, `revision` — for items copied from elsewhere), and `data`.
- **FR-005**: Item `type` MUST be one of: block, motif, stencil, frame, fabric, color, thread, layout,
  border, quilt, photo, embroidery. `data` MUST use the same schema the `.rrq` project file uses for
  that item type (spec 003), so items copy into projects unchanged apart from unit conversion.
- **FR-006**: Packs MUST include `changelog`: a list of `{ revision, date, notes }` (plain text),
  with an entry for every revision after the first.

**Assets**

- **FR-010**: Binary assets (images, embroidery files) MUST be referenced as either `{ data }`
  (embedded data URI — packed) or `{ path }` (relative file in the repository — exploded), each with
  `sha256`, `type`, and for images `width`/`height`; both forms are valid in either location, except
  `.rrq_lib` files imported from disk MUST be fully packed.
- **FR-011**: Allowed asset types: PNG, JPEG, WebP images and `.EXP` embroidery. No SVG, HTML, or
  scripts anywhere; all text fields are plain text.
- **FR-012**: Every asset MUST be verified against its `sha256` before use.
- **FR-013**: Size limits MUST apply to the document, each asset, and total cached repository content,
  with clear messages when exceeded. (Exact limits set in planning; working figures: document 20 MB,
  asset 10 MB.)

**Import / export**

- **FR-020**: "Back up my library" MUST export a packed `personal` document; "share as pack" MUST
  export a packed `pack` document after confirming name, description, author, license.
- **FR-021**: Importing `personal` MUST restore into the user's own libraries (merge/replace on `id`
  collision); importing `pack` MUST add it under packs, read-only.
- **FR-022**: Invalid documents MUST be rejected with a clear reason; invalid items MUST be skipped
  and reported while the rest loads.
- **FR-023**: Older schema `version`s MUST be migrated on load; newer ones refused with "update the
  app".

- **FR-024**: Users MUST be able to export any of their own libraries as a repository zip containing
  `rrq_lib.json` (kind `pack`, exploded: assets as files under `assets/`, referenced by `path`),
  `LICENSE` (full license text for the chosen license, or its SPDX id and canonical URL when the text
  is not bundled), and a generated `README.md` (name, description, author, license, item counts,
  setup/tag/connect instructions).
- **FR-025**: The app MUST remember each library's publishing history (pack `id`, last `revision`,
  changelog). Each repository export MUST keep the `id`, increment `revision`, require a changelog
  note, and append it to the changelog.
- **FR-026**: Users MUST be able to recover publishing history by importing the published
  `rrq_lib.json` or zip of their own pack.

**Repositories**

- **FR-030**: A repository MUST be a git repository with `rrq_lib.json` at its root, `kind: "pack"`;
  it SHOULD include `LICENSE` and `README.md`.
- **FR-031**: Users MUST be able to connect by repository web URL (GitHub URLs translated to raw file
  URLs) or by any HTTPS base URL serving `rrq_lib.json` with cross-origin access; optionally
  specifying a branch or tag (default: default branch).
- **FR-032**: On connect the app MUST download and cache the document and assets, then pin the current
  `revision`. Content used by the app MUST always be the pinned revision.
- **FR-033**: For branch-following repositories, the app MUST check for a newer `revision` on request
  and MAY check automatically when online; it MUST present all changelog entries between pinned and
  latest plus computed added/changed/removed items, and update only on user acceptance.
- **FR-034**: Accepting an update MUST download only changed assets (by `sha256`) and move the pin;
  declining MUST suppress that revision until a newer one exists.
- **FR-035**: Authors SHOULD tag each published revision `rrq-rev-<revision>`; when the cached pin is
  lost, the app MUST try that tag to restore the pinned revision before falling back to the latest.
- **FR-036**: Private repositories and authenticated access are out of scope.

**Provenance**

- **FR-040**: Projects and personal libraries MUST record `source` (`libraryId`, `itemId`, `revision`)
  for items taken from packs or repositories, and show source, author, and license on notecards.
- **FR-041**: The built-in starter library MUST itself be a `pack` in this format bundled with the app.
- **FR-042**: Library items are identified by `id@version` (spec 008): `id` = `<author>.<random>`,
  `version` = content hash, plus a display `revision`; matching across libraries and projects uses
  `id@version`.

### Key Entities

- **Library document**: Envelope + categories + items + changelog; packed or exploded.
- **Publishing history**: Per personal library: pack `id`, last published `revision`, changelog,
  author/license used.
- **Item**: Typed library entry with notecard, optional license/source, and project-schema `data`.
- **Asset**: Binary referenced by embedded data or relative path, hash-verified.
- **Changelog entry**: Revision, date, plain-text notes.
- **Repository connection**: URL, ref (branch or tag), pinned revision, cached document/assets,
  last check result, declined revision.

### Example

```json
{
  "format": "rrq_lib",
  "version": 1,
  "kind": "pack",
  "id": "5d2b9c1e-…",
  "revision": 3,
  "name": "Civil War Reproductions",
  "description": "Blocks and fabrics inspired by 1860s quilts.",
  "author": { "name": "Jane Quilter", "url": "https://example.org" },
  "license": "CC-BY-4.0",
  "changelog": [
    { "revision": 2, "date": "2026-11-02", "notes": "Added 12 star blocks." },
    { "revision": 3, "date": "2026-12-10", "notes": "Fixed Ohio Star proportions; new indigo fabric." }
  ],
  "categories": [
    { "id": "stars", "name": "Stars", "styles": [{ "id": "eight-point", "name": "Eight Point" }] }
  ],
  "items": [
    {
      "id": "ohio-star",
      "type": "block",
      "category": "stars",
      "style": "eight-point",
      "notecard": { "name": "Ohio Star", "notes": "", "reference": "", "tags": ["3x3"] },
      "data": { "…": "same schema as .rrq block" }
    },
    {
      "id": "indigo-dot",
      "type": "fabric",
      "category": "stars",
      "style": "eight-point",
      "notecard": { "name": "Indigo Dot", "notes": "", "reference": "", "tags": [] },
      "data": {
        "image": { "path": "assets/fabrics/indigo-dot.jpg", "type": "image/jpeg",
                   "sha256": "…", "width": 350, "height": 350 },
        "…": "same schema as .rrq fabric"
      }
    }
  ]
}
```

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A backup → clear data → restore round trip reproduces every item and image exactly
  (byte-identical assets).
- **SC-002**: An exported pack committed as `rrq_lib.json` connects successfully with zero changes.
- **SC-003**: A pinned repository's content never changes without explicit user acceptance (0
  silent changes across update checks).
- **SC-004**: An update between revisions shows 100% of intervening changelog entries and item
  changes before the user decides.
- **SC-005**: A repository update with one changed image downloads only that image.
- **SC-006**: A document with one corrupt item loads all other items and reports the bad one.

## Assumptions

- Repositories are public and served with cross-origin access (GitHub raw, GitLab, Codeberg, GitHub
  Pages, self-hosted); git itself is not run in the browser.
- No central registry of repositories in v1; users share URLs. A curated list could later be a static
  file in the RRQuilts repository.
- Item `data` schemas are defined with the `.rrq` project format; this spec does not redefine them.
- Items stay inline in `rrq_lib.json`; per-item files are unnecessary unless documents approach the
  size limit.
- `revision` is author-maintained; the app does not derive it from git history.
