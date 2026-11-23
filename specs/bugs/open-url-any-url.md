# Bug: `?open_url=` opens only the app's demos

**Reported**: 2026-11-23 (owner) · **Status**: Open · **Area**: open links (`src/storage/demo.ts`,
`src/pages/HomePage.vue`), constitution Principle II

Owner, 2026-11-23: "open_url seems to only know how to open demos. it should be able to open any
url. let's log this as a bug."

## What happens

`/?open_url=<link>` opens a project only when the link names a file in the app's own demo folder (a
bare name such as `3d-epp.rrq`, `demo/<name>`, or this site's link to one). Any other link, such as
`?open_url=https://example.com/quilt.rrq`, says "That link doesn't point at a demo project."

## Why it's that way

Built on purpose on 2026-11-23 (T114): constitution Principle II allows network use only for
resource repositories and Open from a gist, and only when the user asks. Fetching from any site is a
third exception.

## To decide when fixing

- The constitution: amend Principle II for a user-followed `open_url` link, as gists got theirs.
- Ask before opening, as a gist link does (show the site and the file name), at least for other
  sites; the app's own demos can keep opening at once.
- Sites that don't let another site read their files (no CORS: many file hosts, Google Drive): say
  so and suggest downloading the file and opening it. GitHub raw links work; Dropbox needs `dl=1`.
- `http:` links from the `https:` site are blocked by the browser: say why.
- Size limit (50 MB, as gists), and the file is untrusted (`parseProject` validates it).
- Offline: other sites need a connection; the demos keep working offline.
- Tests: the link rules (`demoName` today) and a manual check on the Tests checklist.

## Expected

`?open_url=<https link to a .rrq file>` opens that project (after asking, for another site), and any
link that can't open says why.
