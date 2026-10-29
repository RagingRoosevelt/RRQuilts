# Bug: a secret gist link may not open

**Reported**: 2026-10-29 (owner) · **Status**: Open, to be defined (target 0.7.3) · **Area**: Open
from a gist (`src/storage/gist.ts`, constitution Principle II's second network exception)

Owner, 2026-10-29: "we don't have a check for opening a link to a private gist. add that to 0.7.3
as a fix" / "i thought i tried to open a secret gist and it jsut didn't open. ok, let's work on
more definition for this as we start implementing it later".

## What happens (as reported)

Opening a link to a secret gist "just didn't open". Not reproduced yet: the steps, the link's form
and what the app showed (an error, nothing, a list with no projects) are to be found out when work
starts.

## What the app does today

- `gistId` takes the id from a gist link (`gist.github.com/<user>/<id>`, a raw
  `gist.githubusercontent.com` link) or a bare id of 20 to 40 hex characters.
- `gistProjects` reads `https://api.github.com/gists/<id>` with no sign-in. GitHub serves a secret
  gist to anyone who has its id, so this should work. A 404 says "No gist found at that link (a
  secret gist needs its full link)".
- Only `.rrq` files whose raw address is on `gist.githubusercontent.com` are offered.

## Things to check when defining it

- The link forms people copy for a secret gist (the page, Raw, Embed, a revision link
  `/<user>/<id>/<sha>`, a link with a file anchor), and whether `gistId` reads each.
- What a gist with no `.rrq` file shows (a project saved under another name or extension).
- Files GitHub cuts short in the listing (`truncated`), and big files.
- Rate limits and errors, and that every failure says something instead of nothing.
- A manual check on the Tests checklist for opening a secret gist, and unit tests for `gistId`.

## Expected

A secret gist's link opens its project, as a public gist's does. Anything that can't open says why.
