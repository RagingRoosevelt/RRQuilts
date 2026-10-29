# Feature Specification: Update Dialog

**Feature Branch**: `TBD` (target 0.7.3)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-29, after people waited hours or days after a release for the update
toast: "i don't see any sense in including the schemas/*.json in the app's bundle then. that sounds
like an obvious and easy win. lets also change to showing the toast as soon as we know there's an
update. we'll continue fetching the update behind the scenes starting with page load, but let's
inform the user right away. let's also convert from using a toast to using a dialog to inform the
user about the update. let's have a nice graphic like the new user wizard does (let's show full
quilts in this one, and just two of them, sort of facing eachother on an angle like the new user
dialog does). let's have the title inform the user what version they're coming from and what
version they're going to. and then we can show a changelog of the major changes since the version
they were already on. if the user arrives to the page from a link in (add library, open gist), the
reload for update offer shows before they redirect to the destination of their path in". Then: "if the user clicks on reload before we're done downloading the update we can show a
spinner saying "reloading"" (User Story 2, scenario 2).

## Today (0.7.2)

- `src-pwa/register-sw.ts` (`register-service-worker`): the browser finds a new `sw.js` (on page
  load, when the tab becomes visible, hourly), the new worker installs, which downloads every changed
  precached file, and only then `updated` fires and the toast **Update available · Reload** shows.
  The worker never activates on its own (`skipWaiting` off).
- Precache: 88 files, about 5 MB. Most code files are renamed by every release (their names hash
  what they import), so an update downloads about 2.5 MB of JS and CSS before the toast. On a slow
  connection that's tens of seconds of the old version with no word of the new one.
- `schemas/*.json` (2.5 MB: every `rrq.vN.json`, `formats.json`, …) are precached, but the app never
  reads them: migrations are code (`model/io.ts`) and validation uses the schemas built into the
  code (`model/schema/`). They're published for outside tools and library repos only.
- The changelog is `CHANGELOG.md`, bundled into the app's help (Help › About › Changelog). The
  running (old) app has only the old changelog.

## User Scenarios & Testing

### User Story 1 - Smaller download (Priority: P1)

1. **Given** a build, **Then** `schemas/*.json` are left out of the precache (still published at
   their URLs, still in `docs/`). First install and format releases download 2.5 MB less.
2. **Given** offline use, **Then** nothing changes: no app feature reads them.

### User Story 2 - Know right away (Priority: P1)

**Independent Test**: on 0.7.2 with a slow connection (dev tools throttling), deploy 0.7.3 and
reload: the update dialog shows within a second or two of the page, with "0.7.2 → 0.7.3", while the
download runs; **Reload** turns on when it's done.

**Acceptance Scenarios**:

1. **Given** the browser finds a new version (the new worker starts installing: `updatefound`),
   **Then** the update dialog opens at once, before the download finishes.
2. **Given** the download is running, **Then** the dialog shows **Downloading the update…** (with
   progress: files done of files changed, where available) and **Reload** is available. Pressing it
   before the download finishes turns the dialog's buttons into a spinner with **Reloading…**; the
   page reloads by itself when the download finishes (a failed download ends the spinner with
   scenario 5's message).
3. **Given** the download finished, **Then** the dialog shows **Ready** and **Reload** reloads now.
4. **Given** **Later**, **Then** the dialog closes; a small **Update ready** button stays in the
   app's header (or on Home) to reopen it; the next page load shows the dialog again.
5. **Given** the download fails (offline, a file missing), **Then** the dialog says the update will be
   tried again and offers **Close**; the old version keeps working.
6. **Given** a quilt or block with unsaved changes, **When** Reload, **Then** the app first asks
   (Save / Keep as draft / Cancel), as it does before discarding work; after reload the draft is
   offered as usual.
7. **Given** several tabs of the app, **Then** each shows the dialog; Reload in one reloads that one,
   and the others show **Reload to finish updating** (the new version is now in charge, and an old
   tab can no longer load parts of the old version).

---

### User Story 3 - A dialog worth reading (Priority: P1)

**Independent Test**: update from 0.7.1 to 0.7.3: the dialog shows two quilts angled toward each
other, the title "Update from 0.7.1 to 0.7.3", and the new features of 0.7.2 and 0.7.3, newest
first, with each version's fixes folded away.

**Acceptance Scenarios**:

1. **Given** the dialog, **Then** a picture at the top shows **two whole quilts**, tilted toward
   each other like the welcome wizard's block cards (`WelcomeWizard.vue` `.hero`), drawn by the app
   (gallery or built-in sample quilts, a different pair each time is fine), with the same gentle
   motion as the wizard, off with reduced motion.
2. **Given** the versions, **Then** the title reads **Update from <running version> to <new
   version>** (for example "Update from 0.7.1 to 0.7.3"); a rebuild of the same version reads
   **A new build of 0.7.2**.
3. **Given** the new version's changelog, **Then** the dialog lists every version newer than the
   running one, newest first, each with its **New features** in full and its **Fixes** (and any other
   sections) folded under a "Fixes" line to open. Long lists scroll inside the dialog. A link opens
   the full changelog in Help (after reload, the new one).
4. **Given** the running app is old, **Then** the new version number and changelog come from the
   new build, not the running one: each build publishes `version.json` (version, build date, and the
   changelog entries as structured data, made from `CHANGELOG.md` at build time); the dialog fetches
   it (network only, never cached) when the update is found.
5. **Given** `version.json` can't be fetched, **Then** the dialog still opens, titled **Update
   available**, without the list.

---

### User Story 4 - Action links wait for the update offer (Priority: P1)

**Independent Test**: on 0.7.2 with 0.7.3 deployed, open `/?open_gist=<id>`: the update dialog shows
first. Reload: 0.7.3 loads and then opens the gist. Repeat with Later: the gist opens in 0.7.2.

**Acceptance Scenarios**:

1. **Given** the app opened from an action link (`/?open_gist=…`, `/libraries?add=…&ref=…`), **Then**
   before acting on it the app checks for an update (`registration.update()`, one small request),
   waiting at most 3 seconds (offline or slow: it goes on).
2. **Given** an update was found, **Then** the update dialog shows first; the link isn't acted on.
3. **Given** **Reload** (at once, or after the "Reloading…" spinner), **Then** the page reloads with the same URL, so the new
   version acts on the link.
4. **Given** **Later**, **Then** the running version acts on the link at once.
5. **Given** no update, **Then** the link is acted on as today, after the check.

### Edge Cases

- **Downgrade or same version** (a rollback): the title reads "Update from 0.7.3 to 0.7.2"; the
  list is empty.
- **Very old version** (many versions behind): the list shows every newer version; long lists fold
  older versions' features too, past the first three.
- **First visit** (no worker yet): no dialog (nothing to update).
- **Dev server**: no service worker, no dialog (as now).
- **Dialog during the welcome wizard**: the wizard shows first; the update dialog waits until it
  closes.
- **Changelog wording**: written for quilters already (scripts/release.md), so it shows as is.

## Requirements

- **FR-001**: The build MUST leave `schemas/*.json` out of the precache, still publishing them.
- **FR-002**: The update dialog MUST open when a new worker starts installing, not when it's done,
  with Reload available during the download (pressed early: a "Reloading…" spinner until it's ready).
- **FR-003**: The dialog MUST replace the toast; Later MUST leave a way back to it.
- **FR-004**: The title MUST name the running and new versions; the body MUST list the changelog's
  new features for every newer version, fixes folded, from the new build's `version.json`.
- **FR-005**: The dialog MUST show two whole quilts angled toward each other, as the welcome wizard's
  picture does.
- **FR-006**: Action links MUST wait (up to 3 s) for the update check, show the dialog first when
  there's an update, and survive the reload; Later acts on them in the running version.
- **FR-007**: Reloading MUST NOT lose unsaved work (ask first, drafts as today).
- **FR-008**: Each build MUST publish `version.json` (version, date, changelog entries), not
  precached and fetched with no caching.

## Success Criteria

- **SC-001**: On a throttled connection (Fast 3G), the dialog shows within 2 seconds of the page
  appearing after a release.
- **SC-002**: A quilter can read what's new before choosing to reload.

## Assumptions

- `version.json` is generated by the build (like `.nojekyll`) from `package.json` and
  `CHANGELOG.md`, so it can't drift from the release.
- The help's Changelog page stays as it is.

## Checklist

- Add Tests checklist checks (TC-###) when implemented: dialog on update (throttled), title and
  list, Later and the header button, action link with Reload and with Later, unsaved work, schemas
  not precached (Application › Cache Storage).
