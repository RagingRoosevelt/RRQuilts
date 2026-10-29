# Release a new version of RRQuilts

You are releasing a new version. Work through these steps in order, and stop to ask the user
where a step says so. Use the project's Makefile targets (see CLAUDE.md).

1. **Check the state.** `git status` must be clean. Changes never go straight onto `main`: they reach
   it from a feature branch. If the work to release is still on a feature branch, merge it into
   `main` with `git checkout main && git merge --no-ff <branch>` (ask the user which branch if it's
   unclear).
   **Then bring in the specs backlog**, so every release carries the drafted specs: in the
   `../Kits Quilts specs` worktree, `git merge main` (a spec on both, drafted on the backlog and then
   built and marked done in this release, keeps `main`'s version) and `git push origin specs/backlog`;
   back here, `git merge --no-ff specs/backlog -m "Merge specs/backlog"`. Check:
   `git rev-list --count main..specs/backlog` prints 0.
   Then make the release branch: `git checkout -b release/X.Y.Z`.
2. **Find what changed.** The last release is the newest tag matching `v*`
   (`git describe --tags --abbrev=0 --match 'v*'`; none means everything is new). Read
   `git log <tag>..HEAD` (or the whole log) and the current `CHANGELOG.md`.
3. **The version** was chosen by the user in the shell (major, minor or hotfix) and is given at the
   end of these instructions. Use it as given.
4. **Write the changelog entry** at the top of `CHANGELOG.md`, under the intro (replace the "No
   versions have been released yet." line if it's there):

   ```
   ## X.Y.Z (YYYY-MM-DD)

   ### New features
   - ...

   ### Fixes
   - ...

   ### Known issues
   - ...
   ```

   Leave out empty sections. This is for quilters using the app, so it lists **features**, not
   commits:
   - Name what a quilter can now do, or a problem that's gone, in plain words. One line each, most
     important first.
   - Fold all the commits behind one feature into its one line. A release usually has a handful of
     lines, not dozens.
   - Leave out small tweaks and polish (spacing, wording, button styles, icon colors, reordered
     menus), internal changes (refactors, tests, tooling, CI, docs builds), and fixes to things
     that were never released.
   - Mention a file format change only as what it means for users (e.g. "older projects open and
     are upgraded").
   - **Known issues** are problems users may still run into in this version. Commits don't say
     what's still broken, so ask the user for them. If `gh` works, suggest the open issues labeled
     `bug` (`gh issue list --label bug --state open`) as candidates. Leave the section out if there
     are none.
   - Follow the Help writing style: no em or en dashes, no semicolons joining clauses, no
     "Concept: details" colons, no filler.

   - **Major changes**: a line starting `- [major] ` is a major change. The update dialog shows only
     those for each newer version (spec 054), and Help lists them first in each section (the
     marker itself never shows). Mark nothing yourself: the user picks.

   The entry appears in the app at Help › About › Changelog.

5. **Show the user** the entry, and wait for their OK or edits. Then **ask which changes are
   major**: list every line of the entry (each section) in multi-select questions (AskUserQuestion,
   up to four lines a question, four questions a call), and mark the picked ones `[major]`. A
   version may have none.
   Then update Help › About › Roadmap (`src/help/about/roadmap.md`): drop what this release
   delivered, and ask the user whether the next versions' plans changed.
6. **Set the version**: `package.json` `"version"` to `X.Y.Z` (nothing else in it).
   **Format samples**: if any file format's version is newer than its newest sample in
   `test/fixtures/formats/`, write samples with this release's code (see that folder's README) and
   add only the new versions. For a new project version, also add the version's new layouts to
   `ADDED` in `write-demo.spec.ts`, write `demo-vN.rrq`, and save its pictures with this release's
   build (all in that README). Then have the user open the dev server's Tests ›
   Picture check (`make dev`, `/dev/pictures`) and wait for their OK on it (they name problems by
   the reference labels).
7. **Commit** on the release branch: `make commit MSG="Release X.Y.Z"` (it runs the checks,
   including the test that the changelog and package.json versions match, and rebuilds `docs/`).
8. **Bring `main` up to it and push**: `git checkout main && git merge --ff-only release/X.Y.Z`,
   then `make push` (publishes the site).
9. **Tag the release. Every release needs its tag**: the next release finds what changed since the
   newest `v*` tag (step 2), so a missing tag makes it repeat everything. Tag the release commit on
   `main` and push the tag:
   `git tag -a vX.Y.Z -m "RRQuilts X.Y.Z"` then `git push origin vX.Y.Z`.
   Check it reached GitHub: `git ls-remote --tags origin vX.Y.Z` must print it.
10. **Check it's live**: `https://theodorelindsey.io/RRQuilts/` serves the new build within a minute
    or two (Help › About shows the version).
11. Tell the user it's released, with the tag name.
