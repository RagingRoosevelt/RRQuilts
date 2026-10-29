# Feature Specification: Moving RRQuilts to the PrunusDomestic Organization and Domain

**Feature Branch**: `TBD` (not on the roadmap yet)

**Created**: 2026-10-29

**Status**: Draft (spec only). Mostly hosting and repository work, with a few app changes. Open
decision: the address (see Decision).

**Input**: Owner, 2026-10-29: "if I move RRQuilts to a org repo, can I keep the deployment attached
to my github pages custom domain?" Then: "can we put this domain/repo ownership switch into a spec?
the new custom domain would probably be prunusdomestic.com. and I would probably host this at
prunusdomestic.com/RRQuilts or rrquilts.prunusdomesic.com [read: prunusdomestic.com]. right now my
org is RRQuilts but I would probably rename the org to PrunusDomestic." Then, on the old address:
"this would be a new version of the site in the old url location that would still have access to
the local storage and would provide users a mechanism to export their data before being redirected
to the new location" (User Stories 2 and 3). The address is decided at implementation.

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

### User Story 2 - The old address becomes a moving page (Priority: P1)

The old address keeps a final build of the app, the **moving build**, served from a repo left under
the personal account (`RagingRoosevelt/RRQuilts`, the name freed by the transfer). Because it's on
the old origin (`theodorelindsey.io`), it still reads the quilter's saved data there, lets them take
it along, and then sends them to the new address.

**Independent Test**: at the old address, with a My library, a pack, fabric photos and an unsaved
draft from before. Open `theodorelindsey.io/RRQuilts/project?open_gist=...`: the moving page lists
what's stored, **Move my data** carries it to the new address, and the gist link then opens there.
Open the old address again in a browser with no RRQuilts data: it goes straight to the new address.

**Acceptance Scenarios**:

1. **Given** any URL at the old address, **When** this browser has no RRQuilts data there, **Then**
   it goes straight to the same path, query and hash at the new address (`location.replace`).
2. **Given** data at the old address, **Then** the moving page shows instead: RRQuilts has moved to
   the new address; what's stored here (counts of drafts, recent files, My library items, packs,
   fabric photos; whether settings were changed); and the actions below.
3. **Move my data** (preferred): the moving page opens the new address with a hand-off (User Story
   3) and the new address imports everything; on success the moving page says so and continues to
   the link the quilter came with.
4. **Download my data** (always offered, the fallback): saves a My library backup (`.rrqlib` with
   packs and images, the existing backup) and the settings (`.rrqconf`), and each draft as a
   `.rrq`, for importing at the new address by hand.
5. **Continue without moving**: goes to the new address; the moving page asks once more if data
   would be left behind.
6. **Given** the data has moved, **Then** the moving page offers **Clear the data here** (so the
   next visit redirects straight away); not automatic, and never before a hand-off or download
   succeeded.
7. **Given** an installed app or a cached old build (the service worker at the old address), **Then**
   the moving build ships a service worker at the same URL, so the old one updates to it (the
   app's update prompt appears; it can't be skipped forever); the moving build's service worker
   caches only the moving page, so it works offline too and keeps showing the data until it's
   moved.
8. **Given** the moving build, **Then** it's the app itself in a moving mode (same code for reading
   drafts, libraries, images and settings, and for the backup files), built once with the new
   address and frozen; the editors aren't reachable from it.
9. **Given** schema URLs at the old address (`/schemas/*.json`, saved files' `$schema`, older library
   tools' `FORMATS_URL`), **Then** they keep resolving there (copies; `formats.json` kept current
   by the release process until old tools are gone).
10. The moving build stays up indefinitely: a quilter who comes back a year later can still move
    their data.

---

### User Story 3 - Arrive at the new address with your data (Priority: P1)

1. **Given** a hand-off from the moving page, **Then** the new address receives the data (a
   `postMessage` exchange between the two windows, each checking the other's exact origin; data in
   chunks for large image stores) and imports it: My library (merged, as a restore merges), packs,
   fabric images, settings (only if the new address has none changed), drafts and recent files.
2. **Given** the import, **Then** a summary shows what arrived, and the moving page is told it
   succeeded only after everything is stored.
3. **Given** downloaded files instead, **Then** the new address's first-open welcome offers **Bring
   data from the old address**, taking the `.rrqlib`, `.rrqconf` and `.rrq` files (existing import
   paths).
4. **Given** data already at the new address, **Then** importing merges and never deletes; conflicts
   follow the existing library rules (spec 011).
5. **Given** recent files from the old address (file handles from the File System Access API), **Then**
   they can't carry across (handles are tied to the origin): the list arrives as names only, and
   opening one asks to pick the file again.

---

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

## GitHub Pages gotchas

- **CNAME wiped by the build**: Pages from a branch keeps the custom domain in a `CNAME` file in the
  published folder (`docs/`). Setting the domain in Settings commits that file, and the next
  `make build` (which empties `docs/`) deletes it, dropping the domain. The build MUST write
  `docs/CNAME` (next to `.nojekyll`, `quasar.config.ts`) whenever a custom domain is set.
- **DNS**: a subdomain is a CNAME to `prunusdomestic.github.io` (the organization's host, not the
  repo). An apex domain needs Pages' four A (and AAAA) records, plus `www` as a CNAME. No wildcard
  records (they let others claim subdomains).
- **HTTPS**: the certificate takes from minutes to about an hour after DNS resolves; **Enforce HTTPS**
  is only offered after that. Set it then.
- **Domain verification**: verify `prunusdomestic.com` for the organization before adding it to any
  repo, so no other account can attach it or its subdomains.
- **Option A side effect**: with the custom domain on the organization site, every Pages site in the
  organization shows under it (`prunusdomestic.com/<repo>/`), the library repos' galleries too if
  they're turned on.
- **Names are lowercase in hosts, not paths**: `prunusdomestic.github.io`, but `/RRQuilts/` stays
  case-sensitive (a repo rename changes the path).
- **No server settings**: no HTTP redirects, no custom headers (no `Cache-Control`, CSP or
  `Service-Worker-Allowed`); everything is cached about 10 minutes, so a new build can take that
  long to show. The redirect stub and the SPA 404 fallback (which answers with status 404) are
  static pages for this reason.
- **After the transfer**: check Settings › Pages on the moved repo (source `main` › `/docs`, the
  domain); re-enter them if missing. The organization's member privileges must allow Pages for
  public repositories.
- **Limits**: published site 1 GB, soft 100 GB a month of traffic, 10 builds an hour. Today `docs/`
  is 5 MB; fine.
- **Private repos**: Pages needs a paid plan (Team for organizations), and the site is public even
  then.

## Order of work

1. Buy and set up DNS for `prunusdomestic.com`; verify it for the organization.
2. Ship a release (still at the old address) that can receive a hand-off (User Story 3), so the
   new address has the import code from its first day, and the old-owner mapping for library URLs
   if needed (User Story 4).
3. Rename the organization; create the placeholder `RRQuilts` organization.
4. Transfer `RagingRoosevelt/RRQuilts` to the organization (and Novelty if moving); set Pages and
   the custom domain; update every reference (User Story 5) and release from the new home.
5. Create `RagingRoosevelt/RRQuilts` with the moving build (User Story 2) and the schemas; check
   old links, gist links, deep links, an installed app, a move with fabric photos.
6. Update the template and library repos' tools and links.
7. Keep the moving build and the placeholder organization indefinitely.

## Requirements

- **FR-001**: The app MUST be served at the chosen address over HTTPS with the domain verified for
  the organization.
- **FR-002**: The old address MUST serve a moving build of the app: with no data stored there it
  redirects to the same path, query and hash at the new address; with data it offers to move it
  (hand-off) or download it, then continues to the new address. Old schema URLs MUST keep
  resolving.
- **FR-003**: The new address MUST import a hand-off from the moving build and the downloaded files,
  merging and never deleting; the moving build MUST NOT clear data unless asked, after a confirmed
  move or download.
- **FR-006**: The moving build MUST replace the old service worker, so installed apps and cached
  builds at the old address reach the moving page.
- **FR-004**: The old organization name MUST be held after the rename; stored library URLs MUST keep
  fetching from the right repositories.
- **FR-005**: Every reference listed in User Story 5 MUST be updated, and `make build` MUST stay
  reproducible and MUST emit `docs/CNAME` for the custom domain (either option).

## Success Criteria

- **SC-001**: A gist link and a deep link made before the move open the right thing after it.
- **SC-002**: A quilter with a My library, packs and fabric photos at the old address has all of
  them at the new one after Export and Import, in under 2 minutes.
- **SC-003**: Library repos' weekly format checks pass after the move without anyone editing them
  by hand beyond `upgrade.py`.

## Assumptions

- "prunusdomesic.com" in the note is `prunusdomestic.com`.
- The personal site and `theodorelindsey.io` stay as they are.
- No server: the moving build is a static site (GitHub Pages can't send HTTP redirects).
