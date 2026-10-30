# Changelog

What changed in each version of RRQuilts, newest first.

## 0.7.4 (2026-10-30)

### New features

- Drag quilts and blocks into order, with a mouse or a finger.
- [major] When drawing a block, control how strongly it snaps, and new ways to snap, such as lining
  up with a nearby node.
- [major] View grayscale in the block previews of the project's Blocks tab and of Libraries.
- Block and quilt cards show each picture in its own shape with a soft shadow, instead of on a gray
  square. In dark mode the shadow glows in the accent color.
- Library blocks are listed by shape, then by name, and Group blocks by has a Shape choice.
- Saved projects, libraries, blocks and palettes are laid out to read easily in a text editor.

### Fixes

- Letting go of a quilt past the end of the list drops it where the glow shows.

## 0.7.3 (2026-10-29)

### New features

- [major] From the next update on, a dialog tells you as soon as a new version is ready, names the
  version you have and the new one, and lists what's new in this update. Unsaved work is saved or
  kept as a draft first.
- Updates are delivered as smaller bundles, so a new version is ready sooner.
- The changelog in Help lists each version's major changes first.

## 0.7.2 (2026-10-29)

### New features

- [major] A data quilt can place several blocks on the same month, week or day, each showing the value you
  pick, such as High on one and Low on another. Blocks go on with the number brush, the way
  numerals go on a data block, and the order line branches to every block of a number.
- [major] A block with several values picks which of the quilt's values each one shows, even when the quilt
  has fewer values than the block.
- A Weeks quilt can start the year with Jan 1 as a single day, so its last week ends on Dec 31.
- In a leap year, week and day quilts can average Feb 28 and Feb 29, leave Feb 29 out, give it a
  place of its own, or show a week block's new 2-day variant.
- [major] View grayscale shows a quilt or a block in grays of the same lightness, to check its values.
- [major] A middle click picks up the block, color, or data block under the pointer. It and Find scroll the
  tray to what they pick.
- Clicking a number or a value in a data quilt's list lights up its blocks on the quilt.
- Erase and Find work in data quilts.
- [major] Older projects, block files, and libraries open and are upgraded. Files saved with this version
  need it or a newer one.

### Fixes

- A block used in a data quilt only as its 1-day variant shows as in use.

## 0.7.1 (2026-10-23)

### Fixes

- [major] On iPhones, dialog buttons no longer hide under Safari's address bar.
- In a data block, Undo also takes back the picked day numeral, so the next tap places it again.
- Picking a day numeral unselects the picked color, so it's clear which one a tap paints.

## 0.7.0 (2026-10-22)

### New features

- [major] Data quilts: color a quilt from a year of temperatures, moods, hours of daylight, rainfall or your own numbers. Turn on Data quilt in a quilt's Details tab or in the new quilt window, and pick months, weeks or days.
- [major] Data blocks: make any block a month, week or day block and number its patches with day numerals. Month blocks can have 30, 29, 28 and 1-day variants, and week blocks a 1-day one. The built-in library has a Month Strip, a Week Strip and a Day Square, and month and week strips that turn a corner in curves, right angles or a fan.
- Place a data quilt's blocks month by month (or week by week, or day by day), drag them to other months, and see each block's month and its days in order on the quilt. Ordinary blocks can fill the other spaces.
- Preview a data quilt with a made-up sample year (temperatures for Alaska or Hawaii, rain for Hawaii or Arizona, daylight for Alaska or Texas, and moods) or your own CSV file, then enter real days in a table, by pasting or importing, or with Today's entry.
- Printouts of data quilts show a legend of each value's colors and count yardage for the worst case.
- Sort a palette's swatches by hue, value, saturation or name.
- Filter palettes by hue, value and saturation.
- [major] Make a new colorway from a palette: each color of the quilt is matched to the closest color or fabric in it, and you can change any match.
- On-Point, Variable Point and Diamond Point quilts can be half a row or column longer, ending on a short row.
- [major] Export a single quilt as a project file of its own.
- Drag quilt cards to rearrange them. A glow shows where the quilt will land.
- Filter blocks and quilts in the project and the libraries to find data blocks and data quilts.
- Hovering a quilt outlines the piece under the pointer in a color that tells data blocks, other blocks and sashing or borders apart. The block editor outlines the patch under the pointer.

### Fixes

- The outline on a hovered block stands out over the reference overlay.
- A color variant of a library block follows the block when the library redraws it.
- Flip on On-Point quilts mirrors across the quilt, as it looks on screen.
- Color menus in palette swaps and colorway mappings are wide enough to read.
- Projects from older versions open and are upgraded. Library and block files saved with 0.7.0 need 0.7.0 or later to open.

## 0.6.1 (2026-10-20)

### New features

- [major] Open any block in the block editor from its menu or its preview, right after Preview.
- Print a block or a quilt straight from its menu.

### Fixes

- Library blocks open in the block editor read-only, with buttons to make your own copy or a coloration variant.
- A project keeps one coloration variant per library block. Making another adds a new coloring to the one you have.
- Threadloop profile links (threadloop.app/members/…) are recognized in your socials.

## 0.6.0 (2026-10-20)

### New features

- [major] 21 new 60° triangle blocks in the built-in library, for Shaped Blocks quilts.
- A new library, RagingRoosevelt's Novelty, is listed on the Libraries page. Its Fractals and Memes packs download when you switch them on.
- [major] Tag your project's palettes and star your favorite palettes, including library palettes. The project's Palettes tab has the same filters as the Libraries page.
- [major] Edit a block's tags and category in its Details tab.
- The quilt editor's block list shows only blocks that fit the quilt's layout. Switch off "Compatible with this layout" to see them all.
- When imported quilts or fabric images are already in the project, you see both side by side and choose which to keep, or keep both.
- Removing a pack, a library, or a tagged item asks whether to keep your tags in case it comes back.
- Select every block of a library at once in the project's Blocks tab, with a count of how many are selected.
- Categories with the same name in different libraries show once in the filter, and ticking a category ticks all of its subcategories.
- New On-Point, Variable Point and Diamond Point quilts start with an Exact edge, so the edge stays at the block points.
- Every dialog has a close button, and a project reopens on the tab you left it on.
- [major] Plain Block is gone from the built-in library. Paint an empty block space instead.

### Fixes

- Exported blocks, packs and backups keep colorings made with fabric images.
- The reference overlay stays in place when you set a block into an On-Point setting triangle.
- [major] Several built-in blocks are redrawn to match how they are sewn, and the Seams filter is more accurate. Lettered variants now use numbers (King's Crown II). Projects that use them still open.
- Projects, libraries, and block files from older versions open and are upgraded.

## 0.5.0 (2026-10-19)

### New features

- [major] Shaped blocks. Draw triangle, 60° diamond, and hexagon blocks, and set them in the Shaped Blocks, Baby Blocks, and Diamond Point layouts. A flow angle turns the whole layout. Starter shaped blocks are in the built-in library.
- Find blocks with a filter sidebar on the Libraries page and the project's Blocks tab. Search, then narrow by shape, by the layouts a block fits, by seams (straight, curved, set-in), or by difficulty.
- In a block's Details tab, mark what it needs (foundation paper piecing, appliqué, hand sewing) and the faster methods it suits (strip piecing, quick units, stitch and flip). Filter and group blocks by technique.
- [major] Tag any block with your own words, built-in and pack blocks too, and star your favorites. Tags stay in your own library and are never shared in packs or block files. Styles from older files become tags.
- [major] Import quilts from another project, with the blocks, colors, and fabrics they use.
- [major] Open a project shared as a GitHub gist, from the home page or a link ending in `?open_gist=` and the gist's address. The app shows who shared it before it opens.
- A quilt picture downloaded from its Details tab includes seam lines when they are shown.

### Fixes

- Dragging one finger over a quilt or block only pans with the Pan tool, so painting and drawing by touch no longer move the view.
- Projects, libraries, and block files from older versions open and are upgraded.

## 0.4.0 (2026-10-16)

### New features

- [major] Four new layouts. Variable Point lays out diamonds of any width, height, or point angle. One Patch tiles a single shape such as hexagons. Baby Blocks tiles tumbling-block cubes, and Variable Blocks lets you squash or stretch them.
- [major] Pieced borders in 19 styles, including points, diamonds, spaced squares, and checkerboard.
- [major] Quilt colorways. Try a quilt in other colors and switch between them. A new colorway can start from a palette swap, and its colors are changed by picking a replacement for each color of the original.
- [major] Pick a target size when you start a quilt, from a placemat to a king bed, US or European, or a top or pants in your size. It is drawn as an outline over the quilt and can be changed later in the Layout tab.
- [major] The reference overlay shows that outline with your choice of tint, opacity, and fill, on screen and in print.
- A welcome on your first visit asks for your name for credits, your units, and your bed and clothing sizes.
- The printed quilt picture can show its title, author, and project name, with a slider for the picture's size.
- Templates for quilt pieces that need them, such as one-patch shapes, setting triangles, and pieced border pieces.
- The yardage list shows a large swatch of each color and fabric photo.
- Download a quilt's picture from its Details tab.

### Fixes

- Unsaved work from an older version of the app opens and is upgraded. If it can't be read, you can download it to keep it.
- The Libraries page and the project's block list open faster.

### Known issues

- An empty palette in Libraries has no place to drop fabric images. Use Add fabric images instead.

## 0.3.0 (2026-10-16)

### New features

- [major] Make On-Point quilts, with blocks turned on point, blocks between them, sashing, and a choice of edge. Setting triangles can be cut to size or oversized so the blocks float, the edge can be partial blocks, or the zigzag edge can be bound as it is.
- [major] Build a quilt from strips, each with its own style (plain, blocks, half-drop blocks, points, diamonds, double diamonds, spaced squares, or checkerboard) and width. Drag strips to reorder them, or swap and restyle them from the toolbar.
- Start a quilt shows a live preview and a picture card for each layout style, with its own step for setting up strips.
- A Plain Block in the built-in library, for plain alternate squares.
- Clearer templates. Long thin pieces get their labels in a row, labels on small pieces can use the seam allowance, and sizes that are off the ruler grid show their fractions on a line below.
- The Horizontal layout is now called Straight Set. Older projects open and are upgraded.
- [major] A setting to show recently used colors first in each palette.

### Fixes

- Blocks no longer get stretched into sashing and borders. These take colors and fabrics, and square cornerstones can hold a block.
- Picking a color in the Design tab no longer moves it within its palette.

## 0.2.0 (2026-10-15)

### New features

- [major] Add a library from the web by pasting its link, or import a library file and pick which of its packs to install.
- [major] Back up a library with its packs and images, and restore it later, even when its web source can no longer be reached.
- [major] Make your own pack from chosen items, and link a library's home page, gallery, and repository.
- The import picker checks packs you already have, and offers larger or smaller fabric images when a file has them.
- [major] Save a quilt or block as a PNG image.
- Help buttons beside Start a quilt, New project, and New palette, with a setting to hide them.

### Fixes

- A switched-off pack frees its images only when its library still answers on the web.
- Removing a library clears the name filter.

## 0.1.0 (2026-10-15)

### New features

- [major] Draw your own blocks with seam lines, then set them in a quilt with sashes, cornerstones, and borders.
- Undo and redo any change.
- [major] Keep a personal library of blocks, colors, and fabrics, and reuse them in any project.
- [major] Import photos of fabrics and see them at true scale in your quilt.
- [major] Save projects as .rrq files. If the browser crashes, your work comes back from an automatic draft.
- [major] Print templates for every block, rotary cutting sizes, a yardage estimate, and a print preview.
- [major] Share blocks as .rrqbl files, palettes as .rrqplt files, and whole libraries as .rrqlib files.
- Record the author, license, and credits of your work, with a Details tab that shows the full chain of authors.
- Read built-in help guides and use calculators for quilt math.
- Works offline after the first load and installs like an app.
