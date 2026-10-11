# Quickstart & Validation: saving slice

Automated: `make test` (draft store, recent list, autosave timing, file fallbacks).

Manual (`make dev`, Chrome unless noted):

1. **New + save**: Home → New project → sketchbook shows "Untitled", status "Not saved yet".
   Rename → Ctrl+S → pick a file → status "Saved to file". Rename again → "Unsaved changes (draft
   kept)" → Ctrl+S saves silently to the same file.
2. **Open**: Home → Open → pick the file (or drop it on the window) → it opens; it's listed under
   Recent; close the tab, reopen, click the recent entry → permission prompt → opens.
3. **Crash recovery**: rename, wait 15 s, kill the tab (Task Manager) → reopen app → "Restore
   unsaved work from <time>" → Restore → rename is there. Discard removes the draft.
4. **Hidden flush**: rename, immediately switch tabs, kill the original tab → restore offers it.
5. **Two tabs**: open the same project in a second tab → read-only banner. "Continue here anyway"
   → first tab shows "Editing moved to another tab" and turns read-only; second tab shows the
   first tab's latest edits and is editable.
6. **Firefox fallback**: New → Ctrl+S → downloads `Untitled.rrq` with a one-time note explaining
   why it downloads; Open via picker works.
7. **No storage**: private window with storage blocked → editing works; status shows "Draft not
   kept — save to file".
8. **Unsaved warning**: with unsaved changes, close the tab → browser asks to confirm.
