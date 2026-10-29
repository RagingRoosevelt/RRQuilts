# Feature Specification: Moving RRQuilts to the PrunusDomestic Organization and Domain

**Feature Branch**: `TBD` (not on the roadmap yet)

**Created**: 2026-10-29

**Status**: Draft (spec only). Mostly hosting and repository work, with a few app changes. Open
decision: the address (see Decision).

**Input**: Owner, 2026-10-29: "if I move RRQuilts to a org repo, can I keep the deployment attached
to my github pages custom domain?" Then: "can we put this domain/repo ownership switch into a spec?
the new custom domain would probably be prunusdomestic.com. and I would probably host this at
prunusdomestic.com/RRQuilts or rrquilts.prunusdomesic.com [read: prunusdomestic.com]. right now my
org is RRQuilts but I would probably rename the org to PrunusDomestic."

## Today

- App repo: `RagingRoosevelt/RRQuilts` (personal account). Pages from `main` › `/docs`, base path
  `/RRQuilts/`.
- It has no custom domain of its own: the personal site `ragingroosevelt.github.io` has the custom
  domain `theodorelindsey.io`, and GitHub serves every project site of that account under it. So
  the app is at `https://theodorelindsey.io/RRQuilts/` (`ragingroosevelt.github.io/RRQuilts/`
  redirects there). No `docs/CNAME`.
- Organization `RRQuilts`: the library template (`RRQuilts/rrquilts-library-template`) and the
  four fabric brand repos (`RRQuilts/rrqlib-*`, private). RagingRoosevelt's Novelty is
  `RagingRoosevelt/rrquilts-novelty-blocks` (public, offered in `bundled_libraries.json`).
- Browsers keep each site's data per origin (scheme + host + port). Today's origin is
  `https://theodorelindsey.io`, shared with the personal site.

## What changes in a move

- A project site follows its owner. Once the repo belongs to the organization it's served at
  `<org>.github.io/RRQuilts/`, no longer under `theodorelindsey.io`.
- GitHub redirects repository and git URLs after a transfer or an organization rename, but **not
  Pages sites**. `theodorelindsey.io/RRQuilts/` would 404.
- A new origin starts with **empty app data**: drafts, recent files, My library and installed
  packs, fabric photos (IndexedDB), settings (`localStorage`). Installed PWAs stay tied to the old
  origin. Files people saved (`.rrq`, `.rrqlib`, `.rrqconf`) are unaffected.
- After an organization rename, the old name (`RRQuilts`) is free for anyone to take, and with it
  the old repository URLs. Apps that remember `github.com/RRQuilts/...` would then fetch from
  whoever took the name (validated as untrusted, but still not ours).

## Decision (open)

| | A: `prunusdomestic.com/RRQuilts/` | B: `rrquilts.prunusdomestic.com` |
|---|---|---|
| Set up | Org site repo `PrunusDomestic/PrunusDomestic.github.io` with custom domain `prunusdomestic.com`; app repo `PrunusDomestic/RRQuilts` is served under it | App repo's own Pages custom domain `rrquilts.prunusdomestic.com` (DNS CNAME → `prunusdomestic.github.io`) |
| Base path | `/RRQuilts/` (unchanged) | `/` (`RRQ_BASE=/`) |
| Origin | shared with everything else on `prunusdomestic.com` (its storage, its service workers) | the app's own, isolated |
| Needs | something at the domain root (the org site) | nothing else |

Recommendation: **B**. The app's data and service worker don't share an origin with any other page
on the domain, which is the better fit for a PWA that keeps all its data in the browser. A keeps
every path the same, but data still has to move (new origin either way).

## User Scenarios & Testing

### User Story 1 - The app at its new address (Priority: P1)

1. **Given** the move, **Then** the app is served at the chosen address over HTTPS (Pages' "Enforce
   HTTPS"), works offline after first load, installs as a PWA, and deep links work (404 fallback,
   spec 001).
2. **Given** `prunusdomestic.com`, **Then** it's a verified domain for the organization (org
   settings › Pages › Verified domains), so no one else can attach it.

### User Story 2 - Old links keep working (Priority: P1)

1. **Given** a link to `theodorelindsey.io/RRQuilts/<path>?<query>#<hash>` (bookmarks, shared
   links, `?open_gist=` links, help links in old files), **Then** it lands on the same path, query
   and hash at the new address.
2. This needs a stub repo `RagingRoosevelt/RRQuilts` (the name freed by the transfer) whose Pages
   site is only a redirect page: `index.html` and `404.html` that rebuild the URL on the new origin
   and `location.replace` there, plus a plain link for no-script.
3. **Given** the stub, **Then** `/schemas/*.json` keep serving there (copies), since saved files'
   `$schema` links and older library tools fetch them (`FORMATS_URL`); `formats.json` there is
   kept current by the release process until the old tools are gone.

### User Story 3 - Bring your data across (Priority: P1)

A quilter who used the old address opens the new one and gets their library, packs, fabric photos
and settings back.

1. **Given** a release before the move (on the old origin), **Then** it shows a notice: the app is
   moving; **Export everything** saves a My library backup (`.rrqlib` with images and packs) and the
   settings (`.rrqconf`), with the new address.
2. **Given** the new address, first open, **Then** a welcome step offers **Import from the old
   address**: pick those two files; the app restores them (existing restore paths, spec 011 and
   settings import).
3. **Given** drafts (crash recovery), **Then** the notice asks to save open drafts as `.rrq` first;
   drafts aren't carried otherwise.
4. Optional, if it proves reliable: the old origin's page opens the new one with a one-time
   `postMessage` hand-off (both are ours), moving data without files. Files are the baseline.
5. **Given** the old origin's installed app, **Then** after the move its update prompt (the last
   build served there) says where the app went, and the redirect stub takes over afterwards.

### User Story 4 - Organization rename and repositories (Priority: P1)

1. **Given** the rename `RRQuilts` → `PrunusDomestic`, **Then** right after it a placeholder
   organization named `RRQuilts` is created and kept (empty), so the old URLs can't be taken.
2. **Given** library repository URLs stored in people's apps (`github.com/RRQuilts/...`), **Then**
   they keep working: GitHub's redirects are checked for `raw.githubusercontent.com` (what the app
   fetches, `storage/repositories.ts`); if raw URLs don't redirect, the app maps the old owner to
   the new one when fetching and rewrites the stored URL.
3. **Given** Novelty (`RagingRoosevelt/rrquilts-novelty-blocks`), **Then** it moves to the
   organization too, or stays; either way `bundled_libraries.json` names its current home.

### User Story 5 - Every reference updated (Priority: P1)

Found on 2026-10-29 (excluding `docs/`, `specs/`):

- App: `README.md`, `CLAUDE.md`, `.specify/memory/constitution.md` (repo and site URLs, base path
  rule if B), `.github/ISSUE_TEMPLATE/config.yml`, `scripts/release.md` (step 10 live check),
  `bundled_libraries.json` and `.draft`, `src/help/about/got-an-idea.md` (issue links),
  `src/help/about/rrquilts-project.md`, `src/help/guides/getting-started.md` (`?open_gist=`
  example), `src/model/schema/bundled.ts` and `project.ts` (`$id`), `public/schemas/*.json` (`$id`,
  regenerated; older versions' `$id` left as published), tests naming `github.com/RRQuilts/...`.
- `quasar.config.ts` / Makefile: `RRQ_BASE` if B; `docs/CNAME` if B (Pages writes it for
  workflow-less Pages from a branch; the build must emit it so `make build` stays reproducible).
- Library template: `tools/common.py` (`FORMATS_URL`, `TEMPLATE_RAW`), `tools/site.py` (`APP`),
  `README.md` (app links, `?add=` link). Then each library repo pulls the tools (`upgrade.py`) and
  its README links are updated.
- Local clones: `git remote set-url` for each repo (GitHub redirects, but explicit is better).

## Order of work

1. Buy and set up DNS for `prunusdomestic.com`; verify it for the organization.
2. Ship a release on the old address with the moving notice and Export everything (User Story 3),
   and the old-owner mapping for library URLs if needed (User Story 4).
3. Rename the organization; create the placeholder `RRQuilts` organization.
4. Transfer `RagingRoosevelt/RRQuilts` to the organization (and Novelty if moving); set Pages and
   the custom domain; update every reference (User Story 5) and release from the new home.
5. Create the redirect stub `RagingRoosevelt/RRQuilts` with schemas; check old links, gist links,
   deep links.
6. Update the template and library repos' tools and links.
7. Keep the stub and placeholder organization indefinitely.

## Requirements

- **FR-001**: The app MUST be served at the chosen address over HTTPS with the domain verified for
  the organization.
- **FR-002**: Old `theodorelindsey.io/RRQuilts/` URLs MUST redirect to the same path, query and hash
  at the new address, and old schema URLs MUST keep resolving.
- **FR-003**: Before the move, a release MUST let quilters export all their data, and the new
  address MUST offer to import it on first open.
- **FR-004**: The old organization name MUST be held after the rename; stored library URLs MUST keep
  fetching from the right repositories.
- **FR-005**: Every reference listed in User Story 5 MUST be updated, and `make build` MUST stay
  reproducible (CNAME emitted by the build if B).

## Success Criteria

- **SC-001**: A gist link and a deep link made before the move open the right thing after it.
- **SC-002**: A quilter with a My library, packs and fabric photos at the old address has all of
  them at the new one after Export and Import, in under 2 minutes.
- **SC-003**: Library repos' weekly format checks pass after the move without anyone editing them
  by hand beyond `upgrade.py`.

## Assumptions

- "prunusdomesic.com" in the note is `prunusdomestic.com`.
- The personal site and `theodorelindsey.io` stay as they are.
- No server: the redirect is a static page (GitHub Pages can't send HTTP redirects).
