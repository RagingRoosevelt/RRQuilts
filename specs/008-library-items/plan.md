# Implementation Plan: Library Items in Projects

**Branch**: `008-library-items` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

## Summary

Move the starter content into an app-level built-in library with deterministic, namespaced ids
(`rrquilts.<name>`) and content-hash versions; give user items `<author>.<random>` ids, versions
stamped on save, and display revisions; embed library items in projects only while used (auto-prune
in the same undo step); show My vs Library sections; resolve version mismatches on open with a
visual dialog; make library items read-only with "edit makes my copy".

## Technical Context

TypeScript / Vue / Quasar; no new dependencies. SHA-256 via Web Crypto (async) — versions are
stamped on save and computed once for the built-in library at startup; matching compares stored
versions (no hashing at open).

## Design

- **Ids**: `ItemId` schema pattern `^[a-z0-9][a-z0-9-]{0,63}(\.[a-z0-9-]{1,64})?$` for blocks/colors
  and their references; inner ids unchanged. `itemId(author)` = `<slug>.<10-char random>`.
- **Version**: `canonicalContent(item)` (stable key order; blocks: kind, size, geometry, patches,
  colorings' fills/threads; colors: rgb) → SHA-256 → 12 hex. `stampVersions(doc)` on save: own
  items whose hash changed get `version` + `revision++`. Library items keep theirs.
- **Built-in library**: `src/library/builtin.ts` builds the 13 blocks + 36 colors with deterministic
  node/segment/patch ids (n1…, s1…, p1… in derivation order) so versions are stable across loads;
  `useLibraryStore` holds library blocks/colors (built-in now; packs later).
- **Embedding**: `applyTool` gets a library lookup; setting a library block or painting with a
  library color embeds it (and the colors its default coloring uses).
- **Pruning**: `pruneLibraryItems(doc)` removes embedded library items (source present, not
  derived) unreferenced by quilts/blocks; `project.change` runs it in the same undo step.
- **Rendering**: color lookups combine project palette + library colors (thumbnails of library
  blocks render without embedding).
- **Open-time matching**: compare embedded `id@version` with the library; mismatches → dialog with
  both thumbnails; "Use library version" swaps the block and remaps quilt fills by patch overlap
  (`assignIds(...).from`).
- **Edit library block**: `copyBlock` → new author id, revision 1, source derived; optional swap in
  quilts (same patch ids, colorings untouched); the library item is then pruned if unused.
- **Author**: settings `author` (+ `authorAsked`); prompt once on first creation; `anonymous`.

## Constitution Check

I–VI ✅ (VI: attribution kept on embedded and derived items). No new dependencies.

## Project Structure

```text
src/model/schema/{shared,block,palette,quilt,coloring}.ts  # ItemId, version, revision
src/model/identity.ts        # itemId, slug, canonicalContent, contentVersion, stampVersions
src/model/library-items.ts   # isLibraryItem, embed, pruneLibraryItems, swapToLibraryVersion
src/library/builtin.ts       # built-in starter library (deterministic)
src/stores/library.ts        # app-level libraries
src/stores/settings.ts / settings/settings.ts  # author, authorAsked
src/components/VersionDialog.vue, AuthorPrompt (composable)
PaletteTray / SketchbookPage / BlockEditorPage / actions.ts updates
```
