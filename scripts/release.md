# Release a new version of RRQuilts

You are releasing a new version. Work through these steps in order, and stop to ask the user
where a step says so. Use the project's Makefile targets (see CLAUDE.md).

1. **Check the state.** `git status` must be clean and the branch `main`. If not, stop and tell the
   user what's uncommitted.
2. **Find what changed.** The last release is the newest tag matching `v*`
   (`git describe --tags --abbrev=0 --match 'v*'`; none means everything is new). Read
   `git log <tag>..HEAD` (or the whole log) and the current `CHANGELOG.md`.
3. **The version** was chosen by the user in the shell (major, minor or hotfix) and is given at the
   end of these instructions. Use it as given.
4. **Write the changelog entry** at the top of `CHANGELOG.md`, under the intro (replace the "No
   versions have been released yet." line if it's there):

   ```
   ## X.Y.Z (YYYY-MM-DD)

   ### Added
   - ...

   ### Changed
   - ...

   ### Fixed
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
   - Follow the Help writing style: no em or en dashes, no semicolons joining clauses, no
     "Concept: details" colons, no filler.

   The entry appears in the app at Help › About › Changelog.

5. **Show the user** the entry, and wait for their OK or edits.
6. **Set the version**: `package.json` `"version"` to `X.Y.Z` (nothing else in it).
7. **Commit**: `make commit MSG="Release X.Y.Z"` (it runs the checks, including the test that the
   changelog and package.json versions match, and rebuilds `docs/`).
8. **Push**: `make push`.
9. **Tag**: `git tag -a vX.Y.Z -m "RRQuilts X.Y.Z"` then `git push origin vX.Y.Z`.
10. Tell the user it's released, with the tag name.
