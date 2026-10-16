# Feature Specification: Quilt Design Capabilities Baseline

**Feature Branch**: `001-quilt-design-capabilities`

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: "Match the capabilities of the reference quilt software, using its
user manuals as a starting point, but with our own flow. RRQuilts is its own product, not a clone."

> **Scope note**: This is the product-wide capability baseline. Capabilities are taken from the
> reference quilt software's manuals; its screen structure (worktables, ribbons, palettes,
> "add to sketchbook" save model) is
> **not** a requirement. Each user story below is sized to become its own feature spec/plan when
> implemented. Where the reference software's behavior is a desktop-era limitation, the requirement states the outcome
> and the improved behavior instead.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start, save, and reopen a quilt project (Priority: P1)

A quilter starts a new project, works on one or more quilt designs and blocks, saves the project
as a single `.rrq` file on their device, and later reopens it exactly as they left it. A project
holds many design variations (quilts, blocks, fabrics, colors, threads, photos) so they can explore
alternatives side by side.

**Why this priority**: Nothing else has value if work cannot be kept. This is the container every
other story writes into.

**Independent Test**: Create a project, add two quilt variations and a block, save, close the app,
reopen the file; everything is restored, including names and notes.

**Acceptance Scenarios**:

1. **Given** the app is open with no project, **When** the user starts a new project, **Then** an
   untitled project opens pre-filled with the user's default starter content (blocks, colors,
   fabrics, threads).
2. **Given** an unsaved project with changes, **When** the user saves, **Then** they choose a name
   and location and a `.rrq` file is written; later saves update that file.
3. **Given** a saved `.rrq` file, **When** the user opens it (file picker or drag-and-drop),
   **Then** every quilt, block, coloring, fabric, color, thread, photo, and notecard is restored.
4. **Given** unsaved changes, **When** the user closes the tab or opens another project, **Then**
   they are warned and can save, discard, or cancel.
5. **Given** a quilt in the project, **When** the user duplicates it and edits the copy, **Then**
   both variations remain in the project.
6. **Given** a project with items not used by any quilt, **When** the user runs "clean up unused
   items" and confirms, **Then** unused blocks/fabrics/colors/threads/photos are removed and the
   user is told what was removed.

---

### User Story 2 - Lay out a quilt (Priority: P1)

The quilter picks a layout style, sets block counts and finished sizes, adds sashing, and always
sees the quilt's finished size.

**Why this priority**: The layout is the skeleton of every quilt design.

**Independent Test**: Create each layout style, change counts and sizes, and confirm the displayed
finished quilt size matches hand calculation.

**Acceptance Scenarios**:

1. **Given** a new quilt, **When** the user chooses Horizontal with 5×6 blocks at 8"×8" and 1" sashing
   with sash border, **Then** the layout shows 30 block spaces, sashing and cornerstones, and the
   correct finished size.
2. **Given** any layout, **When** the user changes a size, **Then** the finished quilt size updates
   immediately and sizes entered are always finished (no seam allowance).
3. **Given** a Strip layout, **When** the user selects a strip and changes its style, width, or block
   count, or adds/inserts/clones/deletes strips, **Then** only that strip changes.
4. **Given** a Custom Set layout, **When** the user resizes the center, **Then** existing blocks
   either keep their size or scale proportionally, per the user's choice.

---

### User Story 3 - Set and arrange blocks in a quilt (Priority: P1)

The quilter places blocks into layout spaces (one, all, or alternating), rotates/flips them, tries
symmetry variations, and freely positions blocks in custom layouts.

**Why this priority**: Setting blocks is the core design act.

**Independent Test**: Fill a layout with two blocks in alternating spaces, rotate one, apply a
symmetry variation, and save.

**Acceptance Scenarios**:

1. **Given** a layout and a selected block, **When** the user places it with "fill all" or
   "fill alternate", **Then** every (or every other) matching space receives the block.
2. **Given** a placed asymmetric block, **When** the user rotates or flips it, **Then** it turns
   90° clockwise per action or mirrors left-to-right; "all"/"alternate" variants apply quilt-wide.
3. **Given** a quilt filled with an asymmetric block, **When** the user steps through symmetry
   variations, **Then** 16 distinct flip/rotate arrangements are offered, then it returns to the
   original.
4. **Given** a Custom Set layout or layer 2/3, **When** the user drags a block in, **Then** they can
   move, resize, rotate, skew it by handles or exact numeric values, with grid snapping optional.
5. **Given** multiple free-placed items, **When** the user aligns or same-sizes them to an anchor,
   or changes stacking order, centers, or clips them at the quilt edge/border, **Then** all selected
   items update accordingly.

---

### User Story 4 - Color with fabrics, solid colors, and thread (Priority: P1)

The quilter colors patches one at a time or in bulk, auditions fabrics, fussy-cuts and rotates
fabric within patches, and colors outlines/stitching with thread.

**Why this priority**: Color and fabric choice is where quilters spend most design time.

**Independent Test**: Color a quilt using single-patch, all-matching-in-block, all-matching-in-quilt,
and "same patch in all identical blocks" actions; save and reopen with colors intact.

**Acceptance Scenarios**:

1. **Given** a quilt, **When** the user paints a patch, **Then** only that patch changes; the
   "all identical blocks" and "alternate identical blocks" variants change that patch everywhere.
2. **Given** a quilt, **When** the user uses spray (same color within block, layer, or alternate
   blocks) or swap (same color across the whole quilt), **Then** all matching patches change.
3. **Given** matching patches selected, **When** the user previews different fabrics, **Then** the
   selection updates live until a choice is made (audition mode, keyboard-steppable).
4. **Given** a fabric-filled patch, **When** the user fussy-cuts or rotates the fabric (quarter turn,
   custom angle steps, or align-to-edge), **Then** only the fabric placement inside the patch changes.
5. **Given** any patch, **When** the user samples it, **Then** the matching fabric/color is selected;
   sampling a photo or fabric can also find the nearest solid color or nearest fabric.
6. **Given** a stencil, embroidery, or patch outline, **When** the user applies thread color, line
   style (solid/dashed), and weight, **Then** the stitching updates at patch, block, or quilt scope.

---

### User Story 5 - Borders (Priority: P2)

The quilter adds, inserts, deletes, clones, and sizes borders in many styles, including pieced
border styles and ready-made border designs.

**Why this priority**: Nearly every quilt has borders; they drive final size.

**Independent Test**: Add three borders of different styles and sizes, set blocks into a pieced
border, and confirm the finished size.

**Acceptance Scenarios**:

1. **Given** a quilt, **When** the user adds a border, **Then** a 1" plain border appears outside;
   insert places it inside the selected border; clone copies style/size/count (not content).
2. **Given** a border, **When** the user sizes it with all sides locked, left+right locked,
   top+bottom locked, or independent, **Then** sides change accordingly in 0.25" (or metric) steps
   or exact entry.
3. **Given** a border style with block spaces, **When** the user sets the block counts, **Then** the
   spaces update and accept blocks (which stretch to fit).
4. **Given** a quilt, **When** the user changes layout style with "keep borders" on, **Then** border
   structure is kept and content cleared.
5. **Given** a quilt, **When** the user wants a different style on each side, **Then** the app
   supports it directly (the reference software required a four-border workaround).

---

### User Story 6 - Draw pieced blocks (Priority: P2)

The quilter draws their own pieced blocks either by drawing seam lines (the app derives patches)
or by drawing closed patches on special grids, then colors them.

**Why this priority**: Original blocks are a primary reason to use design software.

**Independent Test**: Draw an Ohio Star with seam lines on a 3×3 snap grid and a compass on a circle
grid; both color as expected and print correct templates.

**Acceptance Scenarios**:

1. **Given** a new seam-line block of set finished size and snap grid, **When** the user draws
   lines, arcs, and grids, **Then** patches are derived from all connected segments; disconnected
   segments are flagged (not silently dropped) before saving.
2. **Given** a seam-line block, **When** the user edits, **Then** they can move/delete/clone/rotate/
   resize/flip (horizontal, vertical, both diagonals) segments, add nodes (at a point, at
   intersections, halves, thirds, N equal partitions, staggered partitions), and reshape arcs.
3. **Given** a patch-drawing block, **When** the user picks a grid (rectangle, circle, arc,
   eight-point star, kaleidoscope, octagon) with its parameters, **Then** straight and curved patches
   snap to that grid; patches can be cloned/rotated/flipped; grids can be switched mid-drawing.
4. **Given** either drawing style, **When** the user converts segments to guides, toggles graph
   paper, or changes snap options, **Then** guides/graph paper never print.

---

### User Story 7 - Print patterns and yardage (Priority: P2)

The quilter prints (or saves as PDF) cutting templates, foundation-piecing patterns, rotary cutting
charts, block and quilt pictures, and fabric yardage estimates, at the exact size used in the quilt.

**Why this priority**: A design becomes a sewable quilt only through accurate patterns.

**Independent Test**: For an 8" Ohio Star in a quilt, print templates with ¼" seam allowance and a
rotary chart rounded to 1/16"; measured printout dimensions match.

**Acceptance Scenarios**:

1. **Given** a block selected in a quilt, **When** the user prints with "size from quilt", **Then**
   output matches the quilt's finished block size, including skewed blocks in variable layouts.
2. **Given** templates, **When** printed, **Then** each patch prints separately with optional seam
   allowance, key block (none/small/large) with patch letters, mirror, and line weight; in preview the
   user can delete, move, and rotate pieces (30° steps) to save paper.
3. **Given** a foundation pattern, **When** printed, **Then** sections and sewing numbers are
   generated automatically and can be regrouped/renumbered by hand; styles: line, grayscale, color.
4. **Given** a rotary chart, **When** printed, **Then** strip and cut sizes with counts per fabric are
   given for rotary-cuttable patches, rounded to 1/8", 1/16", none (metric: mm); non-rotary patches
   are listed as needing templates.
5. **Given** a quilt, **When** yardage is requested for a chosen fabric width (or fat quarters only)
   and seam allowance, **Then** an estimate per fabric (with name/SKU) is produced that never
   under-estimates.
6. **Given** any printout, **When** printed, **Then** it includes name, sizes, project name, and a
   scale-check square.

---

### User Story 8 - Draw appliqué blocks, motifs, and quilting stencils (Priority: P3)

The quilter draws layered appliqué (with or without a background patch), uses shape generators, and
creates quilting stencils.

**Why this priority**: Appliqué and quilting design complete the drawing toolset.

**Independent Test**: Draw a flower motif with the shape and wreath generators, place it on
layer 2, and print it as an appliqué pattern.

**Acceptance Scenarios**:

1. **Given** an appliqué block or motif, **When** the user draws with line, Bézier curve, freehand
   (adjustable smoothing), brush stroke, or swath tools, **Then** closed shapes become patches and
   open shapes become stitching lines.
2. **Given** shape tools, **When** the user places ellipses/pies/arcs (with sections), rectangles/
   rounded rectangles, preset shapes (hearts, leaves, polygons, …), or generated stars, posies, or
   stencils, **Then** they appear editable until converted to patches.
3. **Given** selected patches, **When** the user uses pick/edit tools, **Then** they can move,
   resize, rotate, flip, clone, center, reorder, make a wreath (3–20 clusters, spacing, scale), and
   edit nodes (add, delete, break, join, line↔curve, corner/cusp/smooth/symmetric handles).
4. **Given** a pieced block and an appliqué block, **When** the user combines them, **Then** a
   combination block results with a pieced base and appliqué layer.
5. **Given** an appliqué block, **When** the user converts it to a motif, **Then** the background
   patch is removed.

---

### User Story 9 - Layers: appliqué motifs, text, quilting (Priority: P3)

The quilt has a pieced layer, an appliqué layer (motifs, text, photos floated on top), and a
quilting layer (stencils, embroidery), each hideable.

**Why this priority**: Visualizing appliqué and quilting over the top is key to finished-quilt
previews and labels.

**Independent Test**: Add a motif and text label on layer 2 and a stencil on layer 3, hide each
layer in turn, save, reopen.

**Acceptance Scenarios**:

1. **Given** layer 2, **When** the user creates a text box with chosen typeface, size, bold/italic,
   and alignment, **Then** the text is placeable, rotatable, colorable, and printable as appliqué
   templates.
2. **Given** layers 2/3, **When** the user drops motifs/stencils, **Then** they are adjustable like
   free-placed blocks and blocks dropped on layer 3 become stencils.
3. **Given** any layer, **When** the user hides it or hides all patch outlines, **Then** content is
   hidden from view but not deleted.

---

### User Story 10 - Libraries: find and reuse blocks, fabrics, layouts, threads (Priority: P3)

The quilter browses built-in libraries by category, searches by name/notes, by block category, or by
color, keeps personal favorite libraries across projects, and imports items from other projects.

**Why this priority**: Reuse speeds design; personal libraries make the tool "theirs".

**Independent Test**: Search blocks by category "Stars", add three to a project; save a scanned
fabric to a personal library; open a new project and use it.

**Acceptance Scenarios**:

1. **Given** the block library, **When** the user searches by up to 20 combined categories
   (difficulty/piecing, holiday, event, pieced, appliqué), **Then** only blocks matching all are shown.
2. **Given** any library, **When** the user searches by notecard text or by color (nearest average
   color), **Then** results can be multi-selected and added to the project.
3. **Given** a personal library, **When** the user creates categories/styles, adds, sorts, renames,
   and deletes items, **Then** they are available in every project on this device and can be
   exported/imported as a file.
4. **Given** another `.rrq` file, **When** the user imports from it, **Then** selected items from
   that project are copied into the current one.
5. **Given** a block with a library pattern, **When** the user turns a straight-line block into a
   Custom Set quilt layout, **Then** each block area becomes a free-placed block space.

---

### User Story 11 - Use real fabric images (Priority: P3)

The quilter imports photos/scans of their own fabric, straightens, crops to the repeat, sets true
scale, and colors with them.

**Why this priority**: Seeing the user's actual stash in a design is a top request for quilt software.

**Independent Test**: Import a phone photo of fabric, straighten, crop, set 3 dots = 4", add as a
fabric, and verify dot spacing on a quilt matches.

**Acceptance Scenarios**:

1. **Given** an image file, **When** imported as a fabric, **Then** the user can straighten (draw a
   line that should be horizontal/vertical), rotate, shear, crop (by handles, numbers, or presets),
   and set real-world scale before saving it to the project or a personal library.
2. **Given** a fabric, **When** used in a quilt, **Then** it tiles seamlessly at true scale.
3. **Given** many image files, **When** batch-imported, **Then** each becomes a library item.

---

### User Story 12 - Generate new blocks without drawing (Priority: P4)

The quilter makes new blocks from existing ones: frame, tilt, merge, clip & flip, shrink & flip,
kaleidoscope, and fancy star.

**Why this priority**: Fast creative exploration; depends on stories 6/10.

**Independent Test**: Make a 30° tilted, framed, and kaleidoscope version of one block; each is
printable as templates.

**Acceptance Scenarios**:

1. **Given** a block, **When** the user applies frame (from a frame set), tilt (0–90°), merge (inner
   block into a 4-sided area of a background block), clip & flip, shrink & flip (preset or random),
   kaleidoscope (one of 8 triangular sources), or fancy star (5–10 points, block or motif), **Then**
   a new block is added with live preview before committing.

---

### User Story 13 - Photos in quilts, photo patchwork, and tracing (Priority: P4)

The quilter places photos in quilts (memory/T-shirt/panel quilts), converts a photo into a one-patch
color quilt, and traces images to create blocks.

**Why this priority**: Popular project types; builds on image import.

**Independent Test**: Make a photo patchwork quilt from a photo, map it to project fabrics, and trace
a photo into an appliqué block.

**Acceptance Scenarios**:

1. **Given** a horizontal or custom layout, **When** the user sets a photo, **Then** it fills a
   rectangular space (layer 1) or is free-placed (layer 2+).
2. **Given** a photo patchwork quilt, **When** the user fits the photo (inside, outside, distort, or
   manual with aspect lock), masks it, and converts, **Then** each patch takes the average color, and
   can then be mapped to project colors or fabrics within a tolerance.
3. **Given** any block style, **When** the user adds a tracing image (fit inside/outside/distort/
   center/top-left, crop, lightness), **Then** they can trace over it; the image never prints.

---

### User Story 14 - Color exploration tools (Priority: P4)

The quilter generates color families and explores recolorings of a whole quilt.

**Why this priority**: Accelerates color design beyond patch-by-patch work.

**Independent Test**: Generate tints/shades of a color, then shift a quilt's hue three times and map
the result back to project fabrics.

**Acceptance Scenarios**:

1. **Given** a color, **When** the user generates shades & tints, tones, or a grade to another color
   (4–16 steps, insert/remove steps), **Then** the range is added to the project colors.
2. **Given** a colored quilt, **When** the user shifts hue (−40…+40), saturation (−20…+20), brightness
   (−20…+20) per click, or randomizes from project colors, **Then** the quilt recolors; the result can
   be mapped to nearest project colors or fabrics with optional tolerance (0–500).
3. **Given** custom colors, **When** the user enters RGB or HSL values or picks visually, **Then** the
   colors are added; colors and fabrics can be sorted manually or automatically.

---

### User Story 15 - Export and share designs (Priority: P4)

The quilter exports images of quilts, blocks, or a selected area at a chosen size and resolution,
and shares them.

**Why this priority**: Sharing with guilds, shops, and social media.

**Independent Test**: Export a quilt as a 300 dpi 8"×10" PNG without outlines; copy a selected area
to the clipboard.

**Acceptance Scenarios**:

1. **Given** a quilt or block, **When** exported with dimensions, resolution (72–600 dpi), format,
   and outline options, **Then** an image file of exactly that pixel size is produced.
2. **Given** a selection rectangle, **When** exported, **Then** the user can save, copy, or print it.
3. **Given** a block, **When** exported as vector, **Then** a scalable drawing (replacing the reference software's
   Windows-only metafile) is produced.
4. **Given** a supported device, **When** the user shares, **Then** the system share sheet is used
   (replacing the reference software's built-in Facebook login).

---

### User Story 16 - Photo and fabric image editing (Priority: P5)

The quilter adjusts and transforms photos and fabric images before using or printing them.

**Why this priority**: Valuable for photo quilts but not core design.

**Independent Test**: Apply a hue map, a square symmetry, and an effect to a photo, keeping each
version.

**Acceptance Scenarios**:

1. **Given** an image, **When** the user applies color balance, RGB, hue/saturation/lightness,
   colorize, color accent, hue map (12 hue wedges), channel mixer, colorway generation, histogram
   equalize/adjust, brightness/contrast (−100…+100), effects, filters, circular/square symmetry, or
   color-depth reduction, **Then** a before/after preview is shown and each kept result is a new image.
2. **Given** an image, **When** resized, **Then** units (px/in/cm), resolution, aspect lock, and
   resampling quality are controllable.
3. **Given** photos, **When** laid out for printing onto fabric sheets, **Then** the user can place,
   resize, rotate, flip, align, snap to a grid, tile, and print at true size.

---

### User Story 17 - Embroidery (Priority: P5)

The quilter places embroidery designs on the quilting layer to visualize them, colors them with
thread, and prints a picture.

**Why this priority**: Niche; visualization only.

**Independent Test**: Import an embroidery file, place, rotate, recolor, and print it.

**Acceptance Scenarios**:

1. **Given** an embroidery design file, **When** imported and placed on the quilting layer, **Then**
   it can be moved, sized, rotated, flipped, recolored, drawn in draft or 3-D style, and printed.

---

### User Story 18 - Sync with Dropbox (Priority: P5)

The quilter connects Dropbox so their projects follow them between devices, with the app limited to
its own folder.

**Why this priority**: Future. Files already reach Dropbox by hand (desktop sync folder, the phone's
Files app); in-app sync is convenience, and it adds a second opt-in network use beside resource
repositories (amend the constitution first). Least setup of the cloud services (App Console registration; production review past the
development-mode user cap).

**Independent Test**: Connect Dropbox on two devices; save on one, open on the other; edit both
offline, reconnect, and find both versions kept.

**Acceptance Scenarios**:

1. **Given** the user connects Dropbox in Settings, **When** they sign in on Dropbox's own page,
   **Then** the app gets access to its own folder only (`Apps/RRQuilts/`, app-folder access), never the rest of their files,
   and no secret or server of ours is involved (public client id, PKCE, long-lived refresh token).
2. **Given** a connected account, **When** the user saves, **Then** the project is written to that
   folder too; on another device with the same account, it appears in Open and opens.
3. **Given** the same project changed on two devices, **When** both sync, **Then** nothing is
   overwritten: a write only succeeds if the file is unchanged since it was read (Dropbox `rev`); otherwise
   both copies are kept ("Project (conflict from …)").
4. **Given** no network, **When** the user edits and saves, **Then** work stays local and syncs when
   the network returns; the save status shows what hasn't synced.
5. **Given** a connected account, **When** the user disconnects, **Then** the stored sign-in is
   removed from the device and local projects are untouched.
6. **Given** a sign-in older than a session, **When** the app syncs in the background, **Then** it
   keeps working without asking again (refresh token).

---

### User Story 19 - Sync with OneDrive (Priority: P5)

The quilter connects OneDrive so their projects follow them between devices, with the app limited to
its own folder.

**Why this priority**: Future. Files already reach OneDrive by hand (desktop sync folder, the phone's
Files app); in-app sync is convenience, and it adds a second opt-in network use beside resource
repositories (amend the constitution first). Many users already have OneDrive (Windows, Microsoft 365); Entra app registration, publisher
verification recommended.

**Independent Test**: Connect OneDrive on two devices; save on one, open on the other; edit both
offline, reconnect, and find both versions kept.

**Acceptance Scenarios**:

1. **Given** the user connects OneDrive in Settings, **When** they sign in on Microsoft's own page,
   **Then** the app gets access to its own folder only (`Apps/RRQuilts/`, `Files.ReadWrite.AppFolder`), never the rest of their files,
   and no secret or server of ours is involved (public client id, PKCE, single-page-app registration).
2. **Given** a connected account, **When** the user saves, **Then** the project is written to that
   folder too; on another device with the same account, it appears in Open and opens.
3. **Given** the same project changed on two devices, **When** both sync, **Then** nothing is
   overwritten: a write only succeeds if the file is unchanged since it was read (Graph `eTag`); otherwise
   both copies are kept ("Project (conflict from …)").
4. **Given** no network, **When** the user edits and saves, **Then** work stays local and syncs when
   the network returns; the save status shows what hasn't synced.
5. **Given** a connected account, **When** the user disconnects, **Then** the stored sign-in is
   removed from the device and local projects are untouched.
6. **Given** a sign-in older than 24 hours, **When** the app syncs, **Then** it renews silently while
   the Microsoft session lasts, else asks once (single-page-app refresh tokens don't extend).
7. **Given** a work or school account whose organization requires admin approval, **When** the user
   connects, **Then** the app explains that and personal projects keep working locally.

---

### User Story 20 - Sync with Google Drive (Priority: P5)

The quilter connects Google Drive so their projects follow them between devices, with the app limited to
its own folder.

**Why this priority**: Future. Files already reach Google Drive by hand (desktop sync folder, the phone's
Files app); in-app sync is convenience, and it adds a second opt-in network use beside resource
repositories (amend the constitution first). Most paperwork: OAuth consent screen verification, a privacy policy page, and domain ownership.
Only non-sensitive scopes (never full Drive access, which needs a paid security assessment).

**Independent Test**: Connect Google Drive on two devices; save on one, open on the other; edit both
offline, reconnect, and find both versions kept.

**Acceptance Scenarios**:

1. **Given** the user connects Google Drive in Settings, **When** they sign in on Google's own page,
   **Then** the app gets access to its own folder only (hidden app data folder, `drive.appdata`, or app-created files, `drive.file`), never the rest of their files,
   and no secret or server of ours is involved (public client id, PKCE; token flow).
2. **Given** a connected account, **When** the user saves, **Then** the project is written to that
   folder too; on another device with the same account, it appears in Open and opens.
3. **Given** the same project changed on two devices, **When** both sync, **Then** nothing is
   overwritten: a write only succeeds if the file is unchanged since it was read (Drive file version / etag); otherwise
   both copies are kept ("Project (conflict from …)").
4. **Given** no network, **When** the user edits and saves, **Then** work stays local and syncs when
   the network returns; the save status shows what hasn't synced.
5. **Given** a connected account, **When** the user disconnects, **Then** the stored sign-in is
   removed from the device and local projects are untouched.
6. **Given** an access token that lasts about an hour, **When** it expires mid-session, **Then** the
   app renews it (silently while the Google session lasts) and never loses unsynced work.

---

### User Story 21 - Sync with Proton Drive (Priority: P5, may not be feasible)

The quilter connects Proton Drive so their projects follow them between devices, keeping Proton's
end-to-end encryption.

**Why this priority**: Future, and blocked today: Proton Drive offers no public sign-in for other
apps, and its files are end-to-end encrypted with keys unlocked by the user's Proton password, so an
access token alone can't read or write them. Revisit if Proton publishes a stable third-party API or
SDK (an early SDK preview may exist for partners). Until then, the Proton Drive sync folder (desktop)
and its Files-app integration (phones) work by hand.

**Independent Test**: Same as US18, with Proton Drive.

**Acceptance Scenarios**:

1. **Given** Proton offers third-party access, **When** the user connects Proton Drive, **Then** they
   sign in on Proton's own page and the app never sees their Proton password.
2. **Given** a connected account, **When** projects sync, **Then** they stay end-to-end encrypted:
   encryption happens on the device, and nothing readable leaves it.
3. **Given** Proton's access rules allow it, **When** the app stores files, **Then** it is limited to
   its own folder, as in US18–20.
4. Saving, opening on another device, conflicts, offline work, and disconnecting behave as in
   US18 scenarios 2–5.

### Edge Cases

- Seam-line block with floating/unconnected segments → show which segments are unconnected; never
  silently delete the user's lines.
- Appliqué shape not closed or self-intersecting → shown as stitching line; template print explains
  why it cannot print.
- Deleting a block used in a quilt → blocked with explanation; deleting a used fabric → user is
  warned, patches fall back to the fabric's average solid color.
- Malformed, truncated, or newer-version `.rrq` → clear message, nothing partially loaded; newer
  version files are refused with "update the app" guidance.
- Very large projects (hundreds of fabrics or large photos) → app stays responsive; user is warned
  when a file grows large and offered clean-up.
- Block size not a multiple of its grid (e.g., 7×5 grid at 10") → rotary chart warns that rounding
  will distort and recommends templates.
- Printer/browser scaling not at 100% → scale-check square on every printout makes it detectable.
- Browser storage unavailable or cleared → app still works with defaults; personal libraries
  recoverable from exported files.
- Touch-only device (iPad) → every action reachable without hover, right-click, or modifier keys.
- Units switched mid-project → all sizes convert and display in the new unit without drift.
- Fonts used in a text label must be available offline on every device that opens the file.
- Resource repository unreachable, offline, renamed, or deleted → last downloaded copy keeps working;
  projects using its items are unaffected (FR-086).
- `.rrqlib` file or repository contains malformed, oversized, or unsupported items → those items are skipped and
  reported; the rest load.
- Device storage full or cleared by the browser → user is warned; personal libraries restorable
  from `.rrqlib` exports and repositories re-downloadable.

## Requirements *(mandatory)*

### Functional Requirements

**Projects & variations (US1)**

- **FR-001**: Users MUST be able to create, open, save, save-as-copy, and close projects; a project is
  one `.rrq` file containing all of its quilts, blocks (blocks, motifs, stencils), colorings,
  fabrics, colors, threads, photos, and embroidery.
- **FR-002**: Every project item MUST have a notecard (name, notes, reference) that is editable and
  searchable; names appear on printouts.
- **FR-003**: Users MUST be able to keep multiple variations of quilts and multiple colorings per
  block, browse them, duplicate, reorder (manual and drag), and delete them.
- **FR-004**: The app MUST prevent deleting blocks used in a quilt and MUST warn before deleting used
  fabrics, then substitute the fabric's average color.
- **FR-005**: Users MUST be able to remove unused items (all types, or fabrics only) with a preview of
  what will be removed.
- **FR-006**: The app MUST provide starter sample projects to open as templates (opened untitled).
- **FR-007**: Users MUST be able to define their own default starter content for new projects and
  restore the built-in defaults.
- **FR-008**: The app MUST warn before discarding unsaved changes and SHOULD offer recently opened
  projects where the platform allows reopening without picking the file again.
- **FR-009**: Users MUST have undo/redo for design actions within a session.

**Workspace (all stories)**

- **FR-010**: Users MUST be able to zoom (box, step, wheel/pinch), pan, fit to view, show rulers,
  and measure any distance on a quilt or block.
- **FR-011**: The finished quilt size (with borders) and center size MUST always be visible.
- **FR-012**: All features MUST be usable by mouse, keyboard, and touch/stylus; shortcuts that rely
  on modifier keys MUST have an on-screen equivalent (e.g., "apply to all / alternate").
- **FR-013**: Users MUST be able to work in inches or centimeters.

**Quilt layouts (US2)**

- **FR-020**: The app MUST support layout styles: Horizontal, On-Point, Variable Point, Baby Blocks,
  Variable Blocks, Horizontal Strip, Vertical Strip, One Patch, Photo Patchwork, and Custom Set.
- **FR-021**: Horizontal layouts MUST support block count, finished width/height (lockable square),
  sashing width/height (lockable), and optional sash border.
- **FR-022**: On-Point and Variable Point layouts MUST support corner-triangle or seam style, counts,
  sizes (measured per the layout's definition), and sashing.
- **FR-023**: Baby Blocks and Variable Blocks layouts MUST support counts and their top/side
  dimensions.
- **FR-024**: Strip layouts MUST support per-strip style (Plain, Pieced Blocks, Half Drop Blocks,
  Spaced Squares, Points A, Points B, Diamonds, Half Drop Diamonds, Double Diamonds, Half Drop Double
  Diamonds, Checker Board), per-strip width, shared length, block counts, and add/insert/clone/delete.
- **FR-025**: One Patch layouts MUST offer tessellating patch shapes plus a custom shape adjustable by
  dragging guide points.
- **FR-026**: Custom Set layouts MUST provide a resizable blank center with free placement and an
  option to preserve or scale existing block sizes on resize.
- **FR-027**: The app MUST provide a library of ready-made layouts by size and by style.
- **FR-028**: The app MUST turn a block made only of horizontal/vertical lines into a Custom Set
  layout.
- **FR-029**: Maximum blocks per row/column MUST be configurable (default 24, up to 100).
- **FR-029a**: The app MUST support shaped-block layouts, where every space holds a block of that
  shape: Triangle (equilateral, rows alternating point up and point down), Hexagon, Diamond (60°),
  Clamshell, and Spool (spools alternate quarter turns). Each takes counts and a finished size, and
  the quilt's edge either trims the outer spaces straight (partial spaces hold a trimmed block or a
  plain fill) or leaves whole spaces (a shaped edge). *Added 2026-10-15.*
- **FR-029b**: Layout spaces MAY have curved edges (clamshell, spool); drawing, coloring, placing,
  and printing (templates with seam allowance) MUST handle them like straight-edged spaces.
  *Added 2026-10-15.*
- **FR-029c** *(design constraint)*: Layouts MUST come from one shared engine: a repeating cell of
  block spaces and sashing (each space with its own shape and turn), repeated along two directions,
  turned or sheared as a whole, and trimmed to the quilt. Each layout style (FR-020–FR-025,
  FR-029a, FR-029d) is a preset of that engine's parameters, not separate geometry; space ids stay derived
  from position (contracts/slot-ids.md). *Added 2026-10-15.*
- **FR-029d**: Triangles, 60° diamonds, and hexagons of the same side length MUST be able to share one
  layout, since all three are made of the same equilateral triangles (a diamond is two, a hexagon
  six). Presets include Baby Blocks (three diamonds per hexagon), Star (a hexagon ringed by six
  triangles), and Hexagons and Triangles (alternating). The user MAY also merge neighboring spaces
  into a larger shape (two triangles into a diamond, six into a hexagon) or split one back.
  *Added 2026-10-15.*

**Borders (US5)**

- **FR-030**: Borders MUST support add (outside), insert (inside selected), delete, clone, and
  reorder.
- **FR-031**: Border styles MUST include Mitered, Corner Blocks, Long Vertical, Long Horizontal,
  Blocks, Half Drop Blocks, Spaced Squares, Diamonds, Half Drop Diamonds, Double Diamonds, Half Drop
  Double Diamonds, Big & Little Diamonds, Half Drop Big & Little Diamonds, Points Out, Points In,
  Big & Little Points Out, Big & Little Points In, Tile On Point, Tile On Point Corners, Tile Squares,
  Blocks Aligned Inside, and Half Drop Aligned.
- **FR-032**: Border sides MUST be sizable together, in L+R / T+B pairs, or independently, and each
  side MAY use a different style.
- **FR-033**: Block-space borders MUST allow setting block counts and blocks; ready-made border
  designs MUST be applicable with one action.
- **FR-034**: Users MUST be able to keep borders when switching layout style.

**Setting & arranging (US3, US9)**

- **FR-040**: Users MUST be able to set blocks into layout spaces, sashes, cornerstones, and border
  spaces, singly, in all spaces, or in alternate spaces; setting a block over another replaces it.
- **FR-041**: Users MUST be able to rotate (90° steps), flip, and erase placed blocks individually,
  in all, or alternate spaces, and erase the whole quilt.
- **FR-042**: The app MUST offer 16 whole-quilt symmetry variations of flip/rotate.
- **FR-043**: Free-placed items (Custom Set layer 1, layers 2–3) MUST support move, resize, rotate,
  skew (by handles and exact values), copy/paste, delete, stacking order, centering, clipping (to
  center, to outer border, none), align (left/right/top/bottom to anchor), and same size.
- **FR-044**: Free placement MUST support grid display and snapping of position and size at a
  configurable increment; dropped items use designed size or a configurable default size.
- **FR-045**: Users MUST be able to find which library item a placed block/motif/stencil is.
- **FR-046**: Each quilt MUST have three layers: pieced (layer 1), appliqué/text/photo (layer 2), and
  quilting stencils/embroidery (layer 3), each independently hideable; patch outlines toggleable.
- **FR-047**: Users MUST be able to add text boxes on layer 2 with typeface, approximate size,
  bold/italic, alignment, and multi-line text; text is colorable and printable as templates.
- **FR-048**: Users MUST be able to add plain (fabric-only) blocks.

**Coloring (US4)**

- **FR-050**: Coloring tools MUST include: paint one patch (with all/alternate identical blocks),
  paint by freehand line/straight line/rectangle/oval stroke, spray matching color (block, layer,
  alternate), swap matching color quilt-wide, and select-then-audition variants of spray and swap.
- **FR-051**: Users MUST be able to fussy-cut fabric within a patch (drag and nudge) and rotate fabric
  (quarter turn; custom start angle 0–359° with 1–16 steps; align to a chosen patch edge).
- **FR-052**: Sampling tools MUST find the exact fabric/color in a patch, or the nearest fabric or
  nearest solid color from any patch or photo.
- **FR-053**: Thread tools MUST set color, line style, and weight at patch, block, or quilt scope.
- **FR-054**: The app MUST show the current selection and a most-recently-used list.
- **FR-055**: Users MUST be able to add colors by visual picker, RGB, or HSL; generate shades & tints,
  tones, and grades (4–16 steps); and sort colors manually, automatically, or reset order.
- **FR-056**: The app MUST provide whole-quilt hue/saturation/brightness shift, randomize from
  project colors, and map to nearest colors or fabrics with optional tolerance.

**Block drawing (US6, US8, US12)**

- **FR-060**: Block styles MUST include seam-line pieced, patch-grid pieced, appliqué block, appliqué
  motif, seam-line + appliqué, and patch-grid + appliqué; each has a finished width/height.
- **FR-060a**: Blocks MUST have a shape: square or rectangle (the default), equilateral triangle,
  hexagon, 60° diamond, clamshell, or spool. The block editor draws within the shape's outline and
  offers a snap grid that suits it (triangular for triangles, hexagons, and diamonds); patches are
  found within the outline. A block goes only into layout spaces of its shape, and its turns and
  flips follow the shape's symmetry (60° steps for hexagons, 120° for triangles). *Added
  2026-10-15.*
- **FR-061**: Drawing aids MUST include snap grid (horizontal/vertical counts), snap to grid/nodes/
  lines/whole patch/aligned segments, auto-join, graph paper overlay, guides (convert/clear), and
  fill-closed-patches preview.
- **FR-062**: Seam-line tools MUST include line, arc (direction flip), grid (columns × rows, nestable),
  pick (move/delete/clone/rotate by angle/resize by %/flip four ways), and node editing (at point, at
  intersections, half, thirds, N partitions, staggered partitions, arc reshape).
- **FR-063**: Patch-grid tools MUST include rectangle, circle (rings/spokes), arc (rings/spokes),
  eight-point star, kaleidoscope, and octagon grids; straight and curved patch drawing; and patch
  pick/edit (move, flip, clone, rotate by grid angle, add/move/delete nodes).
- **FR-064**: Appliqué tools MUST include line, Bézier, freehand (adjustable fit), brush stroke and
  swath (contour, end caps/style, minimum width, boldness, editable spine), ellipse/pie/arc
  (sections, partition/stagger), rectangle/rounded rectangle, preset shapes, star generator, flower generator,
  stencil generator (motifs only), and wreath generator.
- **FR-065**: Appliqué pick/edit MUST support move, numeric position/size, resize %, rotate,
  flip four ways, center, clone, delete, front/back order, and node editing (add, delete, break, join,
  to line, to curve, corner/cusp/smooth/symmetric).
- **FR-066**: Users MUST be able to copy/paste geometry between blocks (e.g., pieced into combination,
  appliqué into motif).
- **FR-067**: Block generators MUST include frame (from a frame set), tilt (0–90°), merge, clip & flip,
  shrink & flip, kaleidoscope, and fancy star (5–10 points, block or motif).
- **FR-068**: Users MUST be able to trace over an imported image in any block style, with fit options,
  crop, and adjustable lightness; tracing images and in-progress tracings are saved with the project.

**Images & fabrics (US11, US13, US16)**

- **FR-070**: Users MUST be able to import common image formats (at least JPEG and PNG) as photos or
  fabrics, singly or in batches.
- **FR-071**: Image tools MUST include crop (handles, numbers, presets), resize (units, resolution,
  aspect, resampling), rotate (90° and arbitrary with background color and optional crop), flip,
  shear (−45…+45), straighten by drawn line, and true-scale fabric calibration.
- **FR-072**: Fabrics MUST tile seamlessly at true scale and carry name, manufacturer, and SKU.
- **FR-073**: Users MUST be able to set photos in layouts and free-place them; photo patchwork MUST
  support fit modes, manual resize, masking, average-color conversion, and mapping to project
  colors/fabrics.
- **FR-074**: Image adjustments MUST include color balance, RGB, hue/sat/light, colorize, color accent,
  hue map, channel mixer, colorway generation, histogram view/equalize/adjust, brightness/contrast,
  artistic effects, filters, circular and square symmetry, and color-depth change, each with preview
  and kept as a new image.

**Libraries (US10)**

- **FR-080**: The app MUST provide built-in libraries for blocks (incl. motifs, stencils, frames),
  fabrics, colors, threads, layouts, borders, and sample photos, organized by category and style.
  The launch set is an original starter library: roughly 100–200 traditional blocks redrawn from
  scratch, plus solid colors, threads, layouts, border designs, frames, and a few sample quilts. No
  built-in fabric photos; users import their own or get them from resource repositories (FR-084).
- **FR-081**: Search MUST support notecard text, block categories (up to 20 combined), fabric/thread
  by nearest color, and thread by name/number.
- **FR-082**: Users MUST have personal libraries (categories with styles; add, copy/paste, sort,
  rename, delete) available across projects on the same device. They are stored on the device by the
  app (not in settings) and MUST be exportable/importable as `.rrqlib` files for backup and moving
  between devices.
- **FR-083**: Users MUST be able to import items from another project file and add custom threads
  (name, number, manufacturer, RGB).
- **FR-084**: Users MUST be able to connect to resource repositories (git repositories of extra
  blocks, fabrics, layouts, threads, etc.) by URL, browse and search them like built-in libraries,
  and disconnect them. Repositories are pinned: content changes only when the user reviews the
  changelog of an available update and chooses to move the pin (see spec 002).
- **FR-084a**: Users MUST be able to add resources from a `.rrqlib` file (the same format used for
  personal-library export, FR-082), fully offline, and remove them later. Repository content and
  `.rrqlib` files share one structure, defined in its own spec.
- **FR-084b**: Every `.rrqlib` file MUST declare its kind: **personal** (the user's own work — a
  backup) or **pack** (resources from someone else, with author and license). Exporting offers
  "back up my library" (personal) or "share as pack" (pack, author/license filled in; license defaults to CC-BY-4.0), or export as a
  repository zip ready to commit to git (spec 002).
- **FR-084c**: The interface MUST keep the user's own libraries visibly separate from imported packs
  and connected repositories, so users can always tell their own work from others'. Importing a
  personal file restores it as the user's own library; importing a pack adds it under packs.
- **FR-084d**: Pack and repository items MUST NOT be edited in place; users MAY copy an item into
  their own library, where it becomes editable and keeps its original source and license on the
  notecard.
- **FR-085**: Downloaded repository content MUST stay usable offline, MUST be validated as untrusted
  input, and MUST show its source and license on the item's notecard.
- **FR-086**: Any library or repository item used in a project MUST be copied into the project file,
  so the project opens identically without that library or repository.

**Printing (US7)**

- **FR-090**: Print outputs MUST include: quilt picture (outline or fabrics; name, size, block and
  patch outlines), block/motif/stencil picture (outline, stencil, appliqué pattern, or fabrics; as
  many as fit; mirror; line weight), templates, foundation patterns, rotary cutting charts, yardage
  estimates, photo, and embroidery.
- **FR-091**: Pattern sizes MUST default to the size used in the quilt (or block design) and allow a
  custom size; seam allowance width MUST be configurable.
- **FR-092**: Templates MUST support key block (none/small/large), mirror, line weight, and preview
  editing (delete, move, rotate in 30° steps).
- **FR-093**: Foundation patterns MUST support automatic and manual sectioning and numbering, saved
  with the block; line/grayscale/color fill; numbering on/off; separated units; mirror.
- **FR-094**: Rotary charts MUST give strip widths, cut shapes (squares, half- and quarter-square
  triangles, rectangles, etc.), counts by fabric, rounding (1/8", 1/16", none; mm in metric), and warn
  when grid/size mismatch causes rounding error.
- **FR-095**: Yardage MUST be estimated per fabric for selectable fabric widths or fat quarters, with
  seam allowance, borders assumed pieced from strips, and backing/binding excluded (stated on output).
- **FR-096**: Every printout MUST print at true scale, include header/footer (name, size, project)
  and a scale-check square, and be savable as PDF; printout fonts MUST be adjustable.
- **FR-097**: Users MUST be able to arrange multiple photos on a page for fabric-sheet printing (place,
  resize, rotate, flip, align, grid snap, tile, copy/paste).

**Export & sharing (US15)**

- **FR-100**: Users MUST be able to export quilt, block, and image views as raster images with chosen
  dimensions, resolution, format (at least PNG and JPEG with quality), and outline options.
- **FR-101**: Users MUST be able to export a selected rectangle (save, copy to clipboard, print).
- **FR-102**: Users MUST be able to export blocks as scalable vector drawings.
- **FR-103**: Where the device supports it, users MUST be able to share exported images via the
  system share sheet.

**Embroidery (US17)**

- **FR-110**: Users MUST be able to import embroidery design files (at least `.EXP`), place them on
  layer 3, adjust, recolor with thread, toggle draft/3-D rendering, and print a picture. Designs are
  for visualization only.

**Settings (all)**

- **FR-120**: Settings MUST include units, default border style, max blocks per row/column, drop size
  behavior, keep rotation when replacing blocks, snap defaults, freehand smoothing, ruler origin,
  print line minimum, and display preferences.
- **FR-121**: Settings MUST be exportable/importable as `.rrqconf` and restorable to defaults.

### Key Entities

- **Project**: The `.rrq` file; owns all items below plus project name.
- **Quilt**: A layout (style + parameters), ordered borders, three layers of placed content, and its
  coloring; a project holds many quilt variations.
- **Border**: Style, per-side sizes, block counts, contents.
- **Block design**: Style (seam-line, patch-grid, appliqué block/motif, stencil, combination),
  finished size, geometry (segments/patches/nodes), foundation sections/numbering; has many colorings.
- **Coloring**: Fabric/color/thread assignment per patch, plus fabric offset/rotation per patch.
- **Placed item**: A block/motif/stencil/photo/text/embroidery instance on a quilt layer with
  position, size, rotation, skew, flip, stacking, clipping.
- **Fabric**: Image, real-world scale, average color, notecard (name, manufacturer, SKU).
- **Color**: RGB value, notecard.
- **Thread**: Name, number, manufacturer, RGB, line style, weight.
- **Photo / Image**: Pixel image with resolution; may be a tracing image.
- **Text box**: Text, typeface, size, formatting, color.
- **Embroidery design**: Imported stitch data, thread colors.
- **Notecard**: Name, reference, notes, categories (blocks).
- **Library**: Built-in, personal, or repository-backed; categories → styles → items.
- **Resource repository**: A connected git repository of shareable library content; URL, name,
  license, last-updated version, cached items.
- **Library file**: A `.rrqlib` file carrying the same content as a repository, with a declared
  kind: personal (backup of the user's own work) or pack (shared resources with author/license);
  imported from disk instead of fetched.
- **Settings**: User preferences and default starter content (exportable as `.rrqconf`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can create a 5×5 quilt with a border, fill it with two library blocks
  in alternating spaces, color it, and save it in under 10 minutes without help.
- **SC-002**: Printed templates and foundation patterns measure within ±1/32" (±1 mm) of the intended
  size when printed at 100%.
- **SC-003**: Rotary cutting sizes for standard patches match conventional quilting values (e.g.,
  half-square triangle +7/8", quarter-square triangle +1¼" at ¼" seam allowance).
- **SC-004**: Yardage estimates are never lower than the fabric actually required by the printed
  templates for the same quilt.
- **SC-005**: With the network disconnected after first load, 100% of capabilities in this spec work.
- **SC-006**: A project file saved by any released version opens without loss in every later version.
- **SC-007**: Coloring or setting a block on a 400-block quilt shows the result in under 100 ms on a
  mid-range laptop or tablet.
- **SC-008**: Every capability in this spec is operable on a touch-only tablet.
- **SC-009**: Each reference-software capability listed in its manuals is either covered by a requirement here or
  explicitly excluded in Assumptions.

## Assumptions

- **Source**: Capabilities come from the reference quilt software's user manuals (kept locally in
  `reference/`, not in the repository). RRQuilts defines its own screens, navigation, and save flow;
  the reference software's worktable/ribbon/palette layout and "add to sketchbook" save model are not
  requirements.
- **No reference-software content**: its license forbids using its library blocks, fabrics, layouts,
  or other designs in any software. All built-in content will be original (traditional public-domain
  block patterns redrawn from scratch, original solid palettes, etc.). No artwork, text, or coined
  feature names from the reference software are used; generic terms (e.g., sketchbook, worktable)
  are fine.
- **Excluded reference-software features**: licensing/activation/validation; opening its project or
  library files; built-in Facebook login (replaced by system share, FR-103);
  Windows-only metafile and clipboard (replaced by vector export, FR-102, and standard clipboard);
  in-app printer selection and page setup (the browser's print dialog handles these); help/support
  links to the reference software's vendor; manufacturer fabric/thread/embroidery libraries.
- **Improvements over the reference software** taken as defaults: different style per border side directly (FR-032);
  unconnected seam lines are flagged, not deleted; touch-first interaction (FR-012); PDF output and a
  scale-check square on printouts (FR-096); undo/redo for all design actions.
- **Typefaces**: The app ships a curated set of open-license fonts so text works offline and opens
  identically on any device (system fonts are not enumerated).
- **Images**: JPEG and PNG are required; TIFF/BMP/GIF import is nice-to-have where the browser decodes
  them.
- **Embroidery**: visualization only; designs are not stitch-editable or exportable to machines.
- **Resource repositories**: connecting/refreshing needs the network; everything else works offline.
- **Cloud sync (US18–21)**: one sync engine (sign in, list, read, conditional write, conflict copies)
  with a small adapter per service. Proton Drive (US21) waits on a public third-party API: its files
  are end-to-end encrypted and it has no third-party sign-in; its sync folder and Files-app
  integration work by hand.
  Repository and `.rrqlib` structure, manifest, and versioning are specified separately
  (follow-up spec).
- **File formats**: RRQuilts uses only its own JSON formats (`.rrq`, `.rrqconf`, `.rrqlib`). Other quilt software's file formats are deliberately unsupported.
- **Access**: free service, no sign-up or accounts, open source under MIT. Built-in library content
  is original and MIT-licensed; repository/resource-pack content carries its own stated license.
- **Users**: hobby and professional quilters, beginner to advanced, on desktop browsers and tablets.
