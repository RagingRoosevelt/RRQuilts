# Feature Specification: Periodic Update Checks for Web Libraries

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented). Needs a constitution amendment (Principle II).

**Input**: Owner, 2026-10-20: "a user setting for periodic checks of web repos. User can set update
check frequency between a few period options, and the user picking one signifies that there is a
need for a network connection."

## Today

The app only contacts a library repository when the quilter acts: adding a library, **Get
updates**, switching a pack on, backing up, freeing image space. A connected library never learns
of a new revision until the quilter clicks Get updates (constitution Principle II: network use only
on request).

## Concepts

- **Update check**: fetching a connected web library's `library.json` (its index) and comparing its
  revision with the one on the device. Nothing else is downloaded, and nothing is installed.
- **Check frequency**: a setting, **Never** (default) or a period. Choosing a period is the
  quilter's standing request for those checks, which is what makes them allowed (the network
  exception in Principle II becomes "user-initiated or user-scheduled").

## User Scenarios & Testing

### User Story 1 - Choose how often to check (Priority: P1)

**Acceptance Scenarios**:

1. **Given** Settings › Libraries (new section, or under Fabrics if it stays small), **Then** a
   **Check web libraries for updates** choice offers **Never** (default), **Each time the app
   opens**, **Daily**, **Weekly**, **Monthly**.
2. **Given** the choice is changed from Never to a period, **Then** a short note under it says the
   app will contact each connected library's web address on that schedule, and that nothing is
   downloaded or changed without the quilter's OK.
3. **Given** settings are exported (`.rrqconf`) and imported on another device, **Then** the choice
   travels with them.

### User Story 2 - Hear about updates (Priority: P1)

1. **Given** a period is chosen and a check is due (the last check for that library is older than
   the period, or "each time the app opens" and the app just opened), **When** the app is open and
   the device is online, **Then** it fetches each connected library's index, one request per
   library, in the background without blocking anything.
2. **Given** a library's index has a newer revision, **Then** the Libraries nav item gets a small
   dot, the library's row in the Libraries sidebar says **Update available** with its **Get
   updates** button highlighted, and a one-time notice says "Updates for N libraries" with a View
   button to the Libraries page. Get updates then works as today: changelog first, nothing changes
   unless the quilter accepts.
3. **Given** the quilter dismisses or declines an update, **Then** the same revision isn't announced
   again (today's declined-revision rule).
4. **Given** no newer revision, **Then** nothing is shown.

### User Story 3 - Offline and failures stay quiet (Priority: P1)

1. **Given** the device is offline or a library can't be reached, **Then** the check is skipped
   silently and tried again at the next opening (no retries loop, no error messages).
2. **Given** GitHub rate-limits the request, **Then** the check stops for this session.
3. **Given** the setting is Never, **Then** the app makes no request at all, exactly as today.

### Edge Cases

- Libraries offered with the app but never connected (Show packs not clicked) aren't checked.
- Imported (file) libraries have no address and aren't checked.
- Several tabs open: only the one holding the editing lock (or the first to start) checks, so a
  check isn't repeated per tab.
- The app is closed: no checks happen (no background sync or push; the service worker never
  fetches on its own).

## Requirements

- **FR-001**: The setting MUST default to Never; no update check may happen without the quilter
  choosing a period.
- **FR-002**: A check MUST fetch only each connected library's index (no packs, no images) and send
  nothing beyond the request itself (no identifiers, no app data).
- **FR-003**: Checks MUST run only while the app is open and online, at most once per library per
  period (last-check time stored per connection on the device).
- **FR-004**: An update MUST be announced, never applied; applying stays Get updates with its
  changelog and accept step.
- **FR-005**: Failures MUST be silent and MUST NOT retry within the session beyond the next
  scheduled check.
- **FR-006**: The constitution's Principle II MUST be amended to allow update checks the quilter
  scheduled, with the same "no core capability depends on it" rule.
- **FR-007**: Help (Settings guide, Libraries guide) MUST explain the setting and that it uses the
  network.

## Success Criteria

- **SC-001**: With the default setting, network logs show no requests to library hosts during normal
  use.
- **SC-002**: With Daily chosen, a library revision published today is announced at the first app
  opening tomorrow.

## Assumptions

- Period options: Never, each opening, daily, weekly, monthly. No custom interval.
- One setting for all libraries (a per-library override can come later if asked for).
- The index's `revision` is the signal; libraries must bump it when they change (the template's
  build.py does).

## Checklist

- Add a Tests checklist check (TC-###) when implemented.
