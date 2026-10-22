// Manual testing checklist (Tests tab, dev server only). Each check shows as <build>-TC-###: the
// build is the release plus the commit after it (0.4.0+7ed7f8d; plain 0.4.0 on the release itself).
// Progress is kept per release line, so it survives new commits, and each result remembers the build
// it was tested on. Ids (TC-###) are stable: reword an item freely, but give a changed check a new id.
// After a test round, checks that worked are removed (the Tests pages stay), with their notes; never reuse an id. A
// check for a fix, or one reworked after a note, quotes that note in `last`.
/** The release line progress is kept under. */
export const VERSION = import.meta.env.APP_VERSION;
/** The exact build being tested, from the dev server (the version alone if it can't say). */
export async function fetchBuild(): Promise<string> {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}__dev/build`);
    const j = (await r.json()) as { build?: unknown };
    return typeof j.build === 'string' && j.build ? j.build : VERSION;
  } catch {
    return VERSION;
  }
}
/** Where a check's progress is kept: per release line. */
export const stateKey = (c: Check) => `${VERSION}:${c.id}`;

export interface Check {
  /** TC-###. */
  id: string;
  group: string;
  text: string;
  /** Where to test it (an app route). */
  to?: string;
  /** The owner's note from the last round this check (or the fix it checks) answers. */
  last?: string;
  /** A sample file to try it with (test/fixtures/formats/<file>), offered for download. */
  file?: string;
}

const samples = import.meta.glob<string>(
  '/test/fixtures/formats/*.{rrq,rrqlib,rrqbl,rrqplt,rrqconf}',
  {
    query: '?url',
    import: 'default',
    eager: true,
  },
);
/** A sample's download address (undefined if there's no such file). */
export const sampleUrl = (file: string) => samples[`/test/fixtures/formats/${file}`];

const G = {
  files: 'Every release',
  shaped: 'Shaped blocks',
  tests: 'Tests pages',
  filters: 'Filters and sidebars',
  tags: 'Tags, technique, Favorite (spec 029)',
  small: 'Smaller changes',
};

export const CHECKS: Check[] = [
  {
    id: 'TC-003',
    group: G.files,
    text: 'Picture check: every picture matches (look at any flagged in red).',
    to: '/dev/pictures',
  },
  {
    id: 'TC-011',
    group: G.tests,
    text: 'Layout gallery: each picture matches its Expect line.',
    to: '/dev/gallery',
  },
  {
    id: 'TC-012',
    group: G.tests,
    text: 'Borders: corners meet cleanly, repeats even.',
    to: '/dev/borders',
  },
  {
    id: 'TC-013',
    group: G.tests,
    text: 'Sweeps: each row steps as its Expect says.',
    to: '/dev/sweeps',
  },
  {
    id: 'TC-014',
    group: G.tests,
    text: 'Extremes: pictures right, build and draw times acceptable.',
    to: '/dev/extremes',
  },
  { id: 'TC-015', group: G.tests, text: 'Blocks: scroll all built-in blocks.', to: '/dev/blocks' },
  {
    id: 'TC-016',
    group: G.tests,
    text: 'Print P1 to P4: sheets as their checks say; cut sizes match the Help calculators.',
    to: '/dev/print',
  },
  {
    id: 'TC-088',
    last: "The supposedly read only library blocks have checkable check boxes for techniques and stuff in the block detail tab. / Color variant details are also editable (techniques, efficiency shouldn't be). / Let's drop the design tab for library blocks like we do for color variation blocks. / Let's also hide the color tab when looking at a library block.",
    group: G.small,
    text: 'Open a library block in the block editor: a banner says it’s read-only and offers Create a coloration variant and Edit (make a copy). Its tabs are Details and Print only (no Draw or Color); it opens on Details. Details: title, author, license and notes fixed (tags still editable); Techniques and Efficiency show as text (or None marked) with a lock line saying why, no checkboxes. A color variant’s Details shows its techniques the same way.',
    to: '/',
  },
  {
    id: 'TC-087',
    group: G.small,
    last: "It opens up the coloration variant editor but didn't create a new variation, just opened to the existing one.",
    text: 'Create a coloration variant of a library block, then ask for one again (sketchbook menu or the editor banner): the same variant opens with a new coloring added (a copy of the library block’s first coloring) and selected, ready to recolor. No second variant block appears in Blocks.',
    to: '/',
  },
  {
    id: 'TC-089',
    group: G.small,
    last: 'When in read only mode and clicking on the "create a coloration variant", that should land you on the color tab of the coloration variant.',
    text: 'A library block open read-only: the banner’s Create a coloration variant lands on the variant’s Color tab (new or existing variant); Edit (make a copy) lands on the copy’s Draw tab.',
    to: '/',
  },
  {
    id: 'TC-090',
    group: G.small,
    text: 'Settings › You › socials: add Threadloop by pasting https://threadloop.app/members/<name>: it becomes the handle, and its icon links back to that page (threadloop.app/members/…). Printables (printables.com/@name) and Ravelry (ravelry.com/people/name) links reduce to handles too.',
    to: '/',
  },
  {
    id: 'TC-091',
    group: G.small,
    text: 'Libraries › Palettes: a palette’s ⋮ › Sort by › Hue: its swatches run red to purple with grays last; Value: light to dark; Saturation: vivid to muted; Name: A to Z; Reverse flips any of them. Other palettes stay as they were. Library and pack palettes sort too.',
    to: '/libraries',
  },
  {
    id: 'TC-092',
    group: G.small,
    text: 'The same sort shows everywhere that palette appears: its card, its preview (click a swatch; Previous/Next follow the sorted order), the project’s Palettes tab (project palettes’ ⋮, the sort button on Library palettes rows) and the quilt editor’s color tray. Reload: still sorted. Export the palette: the file keeps its saved order.',
    to: '/',
  },
  {
    id: 'TC-093',
    group: G.small,
    text: 'Settings › Quilt and block design › Sorted palettes lists each sorted palette (name, where it is, its sort) with Clear. Delete a sorted project palette, remove a pack with a sorted palette, or delete a sorted My library palette: it leaves the list.',
    to: '/',
  },
  {
    id: 'TC-094',
    group: G.filters,
    text: 'Libraries › Palettes (or All): the sidebar’s Color card. Hue on: slide to blue, ± 25°: only palettes with a blue swatch stay, their other swatches dimmed; Only matching swatches hides them instead. Hue near 0° (red) also finds pinks past 360°. Value 70 to 100 finds palettes with light swatches; Saturation 0 to 25 finds muted ones; grays never match a hue. Switch to Blocks: the card goes and blocks aren’t filtered.',
    to: '/libraries',
  },
  {
    id: 'TC-095',
    group: G.filters,
    text: 'Project › Palettes tab: the same Color card in its filter sidebar narrows your project palettes and the library palettes, dimming (or hiding) the swatches that don’t match. Reload: filters start clear.',
    to: '/',
  },
  {
    id: 'TC-096',
    group: G.small,
    text: 'Quilt editor › Design › Colorways: New colorway from palette… (also the quilt card’s menu) has Manual · Auto mapping. Auto mapping, pick a palette, Add colorway: the new colorway shows each color as its nearest in that palette; its Colors tab says Auto mapping, Follows (the colorway it came from) and Palette, each row Automatic.',
    to: '/',
  },
  {
    id: 'TC-097',
    group: G.small,
    text: 'Auto mapping stays live: show the primary and repaint a piece a new color; back in the auto colorway, that piece shows the new color’s nearest in the palette. Pick a row by hand: it says Picked by hand, and Automatic puts it back. Change Follows or Palette: the matches change. Undo undoes each.',
    to: '/',
  },
  {
    id: 'TC-098',
    group: G.small,
    text: 'Auto mapping ends safely: switch it to Manual (colors stay, rows editable as before; Pick from limits choices to one palette); delete the colorway it follows, or delete its project palette: it becomes Manual with the same picture. Save, reopen: same pictures. A project saved by 0.6.1 still opens.',
    to: '/',
  },
  {
    id: 'TC-103',
    group: G.small,
    text: 'Design › Data › Sample data › CSV…: open a CSV file (or paste rows: date, then values); the date column is found and each value is matched by its label; rows without a date are counted as skipped. Use as sample data: the quilt shows it (a 2019 sample matches a 2027 quilt by day of the year). Switch back to the built-in sample year and to the CSV again.',
    to: '/',
  },
  {
    id: 'TC-105',
    group: G.small,
    text: 'Print a data quilt: the quilt picture has a legend under it (each value with its colors: under 10 °F, 10 to 20 °F… 100 °F and up). Yardage says it is a worst case and counts each range’s most days expected: Design › Data › Yardage lists each range with its days in the sample as the placeholder; typing a number changes the printed yardage. Spaces with no number yet don’t show in yardage.',
    to: '/',
  },
  {
    id: 'TC-109',
    group: G.small,
    text: 'Design › Blocks in a data quilt: Place numbers is on and the list shows 001 to 012 (Months) with 001 highlighted. Tap block spaces: each gets the highlighted number (001, 002… on the quilt, joined by a line) and the highlight moves on. Tap 005 in the list, tap a space: it gets 005 and the highlight skips past placed numbers. Tap a placed space: its number comes back and is highlighted. Fill empty numbers Rows / Columns / Snake fills only the empty ones; Clear empties all. Drag a placed number onto another row (or hover it and use its arrows): it takes that label and the rows between shift. Undo undoes each.',
    last: '"we\'ll have a single paintbrush at the top of that list and as we place blocks, the label of the number we\'re placing gets highlighted. we can click on a number label in that list to change where in the number list we start placing from and then continue advancing numbers from there, skipping any numbers that were already placed"',
    to: '/',
  },
  {
    id: 'TC-111',
    group: G.small,
    text: 'Design › Data (right of Colors): period, sample or real data, Values (Kind, ranges or categories and their colors: the quilt recolors at once), Yardage, places without data. Save as new colorway and show it: Values lists each range or category with its primary color and a picker for what it becomes; picking one recolors only that colorway. Show the primary again: the ranges are editable again.',
    last: '"let\'s add a data tab to the right of the color tab that will hold the value mapping" / "for non-primary color ways, the picked color ranges and primary color for that range are shown, as well as a dropdown for the mapped color."',
    to: '/',
  },
  {
    id: 'TC-112',
    group: G.small,
    text: 'Real data (Design › Data, Real data): Import fills those days; Table lists every day with a field per value; typing a value recolors its piece; Missing lists days without an entry up to today; Today’s entry opens today. With the Data tray tab open, tapping a day’s piece opens the table on that day. Days without an entry show as designed, the sample, or the filler, as chosen.',
    last: 'Moved with the rest of the data settings into the Design tab ("so now we\'ll handle all the data settings still in the design workbench").',
    to: '/',
  },
  {
    id: 'TC-115',
    group: G.small,
    text: 'Quilt editor › Layout › Style: each style in the list shows the same picture as its card in the new-quilt wizard (Horizontal and Vertical Strip each their own), and the chosen style’s picture shows in the field. Check it in dark mode too.',
    last: '"the layout dropdown should show the same icons as we use in the wizard" / "the layout dropdown in the layout workbench of quilt design"',
    to: '/',
  },
  {
    id: 'TC-116',
    group: G.small,
    text: 'Design › Data › Values ranges: the first range reads "under" with only its end, the last only its start with "and up", the ones between from and to. Changing a range’s end moves the next one’s start (and a start moves the one before’s end). Values far past either end take the end range’s color. A single range reads "all". Labels in the color pickers, the print legend and Yardage match.',
    last: '"the values map shouldn\'t have a max value for the last entry or a min value for the first entry"',
    to: '/',
  },
  {
    id: 'TC-117',
    group: G.small,
    text: 'Design › Data › Values: right under the heading, a small bar chart per value shows the sample’s days in each range or category, in its color (hover a bar: its range and days). Changing a range, Kind or the sample (built-in series, CSV) redraws it. Empty bins keep a sliver.',
    last: '"we should show a small histogram of values, with bins matching the current value bins" / "let\'s put that right below the "values" section label"',
    to: '/',
  },
  {
    id: 'TC-119',
    group: G.small,
    text: 'Month labels: in a Months plan the list and the quilt label each number by its month (Jan, Feb… from the period start; a September start begins with Sep); warnings name months too. Weeks and Days still read 001, 002…, with the week’s first day or the date beside them in the list.',
    last: '"let\'s use the month names as labels instead of 001, 002, 003, etc"',
    to: '/',
  },
  {
    id: 'TC-120',
    group: G.small,
    text: 'Design › Blocks: start dragging a placed number in the list: its block space is highlighted on the quilt until you drop it (or let go outside the list).',
    last: '"when you\'re dragging a block slot in the blocks interface, it should highlight the block on the quilt that you\'ve selected"',
    to: '/',
  },
  {
    id: 'TC-122',
    group: G.small,
    text: 'Quilt labels in a data quilt’s Design tab: every block space shows Block 1, Block 2… (left to right, top to bottom, same as the cards), and each placed space its month (or 001…) under it on the order line. Drag a card: the month label moves to the other space, the block numbers stay.',
    last: '"let\'s use a consisten block numbering (ordered left-to-right, top-to-bottom) for the labels on the blocks that we\'re dragging" / "let\'s have both the block label and the month label show up on the quilt. the month label moves between blocks as they are dragged"',
    to: '/',
  },
  {
    id: 'TC-123',
    group: G.small,
    text: 'Design › Blocks list: hovering a placed card outlines its block space on the quilt (gone when the pointer leaves); clicking a card keeps its space outlined until another card is clicked, while moving over the quilt still shows the space under the pointer.',
    last: '"hovering or clicking one of the draggable items should highlight that block in the canvas"',
    to: '/',
  },
  {
    id: 'TC-124',
    group: G.small,
    text: 'Highlight over the reference overlay: turn on a target size (Layout › Reference overlay) so it covers some blocks. Hovering a space on the quilt, a Blocks list card, or Find’s matches draws a glowing outline on top of the overlay, in the opposite hue of the overlay’s tint (orange for the default blue; change the tint and the glow follows). Also check dark mode.',
    last: '"the highlight doesn\'t have enough contrast when the reference overlay is turned on. it needs to be a contrasting color to the reference overlay and it should be a glow outline around the block"',
    to: '/',
  },
  {
    id: 'TC-125',
    group: G.small,
    text: 'Design › Blocks list, dragging a card: the edges either side of where it will land glow (the bottom of the card above, the top of the card below). Dragging Feb down onto Apr glows Apr’s bottom and May’s top; dragging it up onto Jan glows only Jan’s top. Letting go outside the list clears the glow.',
    last: '"when dragging, the drop zone should be visulized by a glow from the bottom border of the block above and the top border of the block below where the block being dragged will land"',
    to: '/',
  },
  {
    id: 'TC-127',
    group: G.small,
    text: 'Data quilt with sashing and a border: in Design › Blocks (Place numbers) and Design › Data, moving the pointer over sashing, cornerstones or the border outlines nothing; over a block space it glows. In Design › Colors, sashing and borders still glow as you paint them.',
    last: '"we don\'t need non-data blocks to be highlighted"',
    to: '/',
  },
  {
    id: 'TC-128',
    group: G.small,
    text: 'Day arrows: in a data quilt’s Design tab, each placed block has a light arrow a few pixels wider than the month trace through its day places from day 1 to its last day, the head on the last day (February’s Month Strip 28 stops before its black bars). It sits under the stronger month trace and follows a block’s turn and flip. Try a block whose days don’t run along its middle (number one in the block editor in snake order) to see it apart from the trace. Dark mode too.',
    last: '"let\'s draw an arrow on each data block connecting each data block in their order. it should be light compared to the trace we\'re drawing for the months" (answered: days inside each block)',
    to: '/',
  },
  {
    id: 'TC-129',
    group: G.small,
    text: 'Data block switch: Project › Blocks › New block has a Data block switch and Data block type (Day, Week, Month); a block made with it opens with Details › Data block on. In any own block’s Details, turning Data block on shows the type; switching Month to Week drops its variants; turning it off puts each numbered patch’s color back. Library blocks show it read-only.',
    last: '"in the details tab of the block workbench (and block wizard), we\'d have a switch for being a data block. then in the details tab we\'d also have a setting for what data block type it is (day, week, month)."',
    to: '/',
  },
  {
    id: 'TC-130',
    group: G.small,
    text: 'Day numerals (block editor › Color, data blocks only): a Value toggle (A to D) and numerals 1 to 31 (week 1 to 7, day 1). Drag a numeral onto a patch: it shows the numeral over its color. Pick a numeral and tap patches: each gets it and, with Next numeral after each tap, the next is picked. A numeral can go on several patches (×2 on its button); tapping a patch with the picked numeral takes it off. Unused numerals are faded. Eyedropper on a numbered patch picks its numeral and value. Undo undoes each.',
    last: '"picking a data block type would then change the color tab to have a numeral palette with dragable patches (like we did with the quilt designer) with the number of numerals in the list corresponding to the data block type. numerals would be assignable to more than one patch."',
    to: '/',
  },
  {
    id: 'TC-131',
    group: G.small,
    text: 'Month variants (block editor, month data block): Variant at the top of Draw and Color shows 31 days; + adds 30, 29 or 28 days as a copy of the 31. Pick a variant: Draw shows and edits its own drawing (the 31 stays as it was), Color numbers it (1 to its days). The bin removes the picked variant. Resizing the block resizes every variant.',
    last: '"in the draw tab of block design workbench we\'d add a variant picker at the top so that each variant could be selected and edited"',
    to: '/',
  },
  {
    id: 'TC-132',
    group: G.small,
    text: 'Quilt Details tab: a Data quilt section (labelled line) with the Data quilt switch and, when on, Plan (Months, Weeks, Days) with a line on what each number stands for. The Layout tab no longer has them. Switching Plan to Weeks makes Design › Blocks list 001 to 053; back to Months keeps the first 12 placed and the period starts on the 1st.',
    last: '"let\'s also move the data switch and type selector for quilts into the quilt details tab from the layout tab, so that it is consistent with where the settings are for blocks"',
    to: '/',
  },
  {
    id: 'TC-133',
    group: G.small,
    text: 'Design › Blocks in a data quilt: Block types at the top lists the data blocks of the plan’s kind (Months: Month Strip and your own month blocks; Weeks: week blocks and day blocks for the days left over; Days: day blocks); one is picked (outlined). Place numbers and Fill empty numbers place the picked type. With Month Strip, February shows its 28-day variant (29 in a leap year), April its 30, January the 31. Pick another type and tap a placed space: it changes type and keeps its month. Drag a card to another month: its variant follows.',
    last: '"so right now we have these month strip <28/29/30/31> blocks. when I\'m placing blocks on the quilt, I\'d like all of those to be one type ... then, the variant of that block type would be selected based on which month got assigned."',
    to: '/',
  },
  {
    id: 'TC-134',
    group: G.small,
    text: 'Design › Blocks list cards: each placed card shows an uncolored picture of the variant its space shows, and a not placed one a faded picture of the picked type, with Not placed. After dragging Feb onto Jan, the moved card’s picture changes from the 28-day to the 31-day variant.',
    last: '"let\'s have the draggable element be a card with a uncolored representative of one of the blocks that is in the pool for it\'s source (before drag), updating thumbnail after being droped"',
    to: '/',
  },
  {
    id: 'TC-135',
    group: G.small,
    text: 'Taking numbers back empties their spaces: with every month placed, Clear removes all the month blocks from the quilt (spaces empty again, labels gone); tapping one placed space with the same type picked empties just that space; switching Plan from Weeks to Months empties the spaces past Dec. Undo brings them back.',
    last: '"pressing clear clears the mapping to months, but doesn\'t seem to clear the blocks from the quilt layout"',
    to: '/',
  },
  {
    id: 'TC-136',
    group: G.small,
    text: 'Data filters: Project › Blocks has a Data card with a Data block filter (Not a data block, Day, Week, Month); Libraries › Blocks the same. Project › Quilts has Show: All quilts, Data quilts, Other quilts.',
    last: '"let\'s add a filter in both the quilt and block interfaces in project and library for data quilts/blocks"',
    to: '/',
  },
  {
    id: 'TC-137',
    group: G.small,
    text: 'Data blocks in files: save the project with a month data block that has variants and reopen it; export the block (.rrqbl) and import it into another project; add it to My library, back the library up and restore it: the kind, the variants and their numerals come back each time. An older app version refuses the new library file instead of losing the variants.',
    last: 'Library and block file formats go up for data blocks ("Yes, bump library formats").',
    to: '/',
  },
  {
    id: 'TC-138',
    group: G.small,
    text: 'Section dividers: Design › Data has Period, Data, Values, Yardage (Most days expected), Places without data; Design › Blocks has Block types and Numbers, all with the labelled line the Layout tab uses.',
    last: '"let\'s use the same hr-labeled seperator that we use for other sections for the data tab of the design workbench"',
    to: '/',
  },
  {
    id: 'TC-139',
    group: G.small,
    text: 'Room for data blocks: in the new-quilt wizard with Data quilt on, the size step says how many whole block spaces there are and how many the plan needs (a 5 × 5 Straight Set: 25, 12 needed for the months, 13 left over; short shows a warning). The quilt’s Layout tab says the same and updates as columns and rows change. A layout with blocks cut down at the edge (Shaped Blocks, Half Drop strips) leaves those out of the count, out of Block N on the quilt, and they can’t take a number.',
    last: "\"when i've picked data quilt mode, the quilt design wizard's size tab and the quilt workbench's layout tab should show the number of blocks that are available to place data blocks. the cut-down edge blocks don't count towards the data block count\"",
    to: '/',
  },
  {
    id: 'TC-141',
    group: G.small,
    text: 'Undo while placing data blocks: place Jan, Feb, Mar (Next: Apr). Undo: Mar’s block goes and Next is Mar again; undo again: Next Feb; redo: Feb back, Next Mar. Clear then undo: every block back, Next past the last placed.',
    last: '"when placing data blocks in the quilt design interface, undo should undo both the block placement as well as the month advancement"',
    to: '/',
  },
  {
    id: 'TC-142',
    group: G.small,
    text: 'Layout changes on a data quilt: open Test Layouts › Quilt 22 (On-Point 6 × 6, weeks), Layout › Blocks down 5: the quilt gets shorter (Finished 88.853 × 74.711 in) and the weeks on the removed row become empty numbers in Design › Blocks. Try Blocks across, block size and another style on a data quilt too. Undo puts it back.',
    last: '"take a look at Quilt 22. go to layout and change the number of blocks down to 5 instead of 6. quilt size doesn\'t change"',
    to: '/',
  },
  {
    id: 'TC-143',
    group: G.small,
    text: 'Project › Quilts: a quilt’s ⋮ menu has no Move earlier or Move later. Drag a quilt card over another: the right edge of the card to the left of where it will land and the left edge of the card to its right glow (Quilt 1 over Quilt 2: Quilt 2’s right, Quilt 3’s left). Drop: it lands there. Dragging left lands before the card it’s over. Letting go elsewhere clears the glow. Undo undoes the move.',
    last: '"let\'s drop the "move earlier" and "move later" for quilts. we should be able to drag/drop them to rearrange. use the highlighting on the right side of the quilt card to the left and the left side of the quilt card to the right to show where the quilt will land"',
    to: '/',
  },
  {
    id: 'TC-144',
    group: G.small,
    text: 'Half rows: an On-Point quilt’s Layout tab › Blocks across and Blocks down step by ½. 5 × 5½ ends at the bottom on a short row (4 blocks) with setting triangles below; 6 adds the next long row. 5½ across adds a short column at the right. Same in the new-quilt wizard, and for Diamond Point and Variable Point. With Whole blocks to the edge (no setting pieces), the zigzag edge ends on the short row. Switching a 5½ On-Point to Straight Set gives 6. Tests › Layout gallery G025 to G031 and Sweeps S09, S10 show halves across and down, with sashing, floating and seamed corners; no gaps at any corner.',
    last: '"can we add support for on-point and diamond-point quilts to be able to add half-row increments?" / "a half increment would add just the short row. and then another half increment would add the next corresponding long row. same idea for diamond point"',
    to: '/',
  },
  {
    id: 'TC-145',
    group: G.small,
    text: '1-day variants: a week data block’s Draw tab › Variant offers + 1 day (a copy of the 7); a month block’s offers 30, 29, 28 and 1 day. The 1-day variant’s Color tab has numeral 1 only. In a Weeks quilt, Design › Blocks › Day blocks lists that week block next to Day Square; placing 053 (Dec 31) with the week block in use shows its 1-day variant there. Pick Day Square for days and 053 shows Day Square instead. Switching the block to Day in Details drops its variants.',
    last: '"the week and month block types should have a 1 day variant"',
    to: '/',
  },
  {
    id: 'TC-146',
    group: G.small,
    text: 'Block Details: a Metadata line (same labelled divider) sits between the Data block section and Tags, Category and Techniques.',
    last: '"we should add a seperator in block details between the data block info and the metadata section"',
    to: '/',
  },
  {
    id: 'TC-147',
    group: G.small,
    text: 'Block editor › Color › Day numerals › Clear all numerals: takes every numeral, of every value (A to D), off the shown drawing in this coloring; the patches show their colors again. With a variant picked, only that variant is cleared. Greyed out when the drawing has no numerals. Undo brings them back. Add a variant to a numbered block: the new variant has its colors but no numerals, and the block’s own drawing keeps its numerals.',
    last: '"I had a block that already had a 7 day variant. when I created the 1 day variant, it still had all 7 labels. creating a variant should remove all the day labels" / "we need a "clear labels" type button for clearing all the day labels"',
    to: '/',
  },
  {
    id: 'TC-148',
    group: G.small,
    text: 'Design › Data › Values ranges line up: "under" sits in the from column with the first row’s value under the other rows’ to values; the last row’s value sits under the other from values with "and up" in the to column; every color picker starts at the same place.',
    last: '"in the values color mapping, for the first and last rows, sicne they only have one temp input value their input cells don\'t align with the other cells of that type"',
    to: '/',
  },
  {
    id: 'TC-149',
    group: G.small,
    text: 'Project › Quilts › a quilt’s ⋮ › Export quilt…: saves (or downloads) “<quilt name>.rrq” holding only that quilt, with the blocks, colors, fabrics (images too) and data plan it uses, and palettes cut to those. Open it: one quilt, looks the same. In another project, Import quilts from it brings that quilt in.',
    last: '"do we have a method for exporting a single quilt?" / "yeah, let\'s do that in 0.7.0"',
    to: '/',
  },
];

/** `build`: the exact build it was tested on. `iterate`: works, but needs another round (see note). */
export type CheckState = {
  status: 'ok' | 'iterate' | 'problem';
  note?: string;
  at: string;
  build: string;
};

/** Kept apart from the app's own data (settings are `rrq.settings`). */
const KEY = 'rrq.dev.checklist';

export function loadChecks(): Record<string, CheckState> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as unknown;
    return raw && typeof raw === 'object' && !Array.isArray(raw)
      ? carryForward(raw as Record<string, CheckState>)
      : {};
  } catch {
    return {};
  }
}

/** Marks a release line that has taken over the previous line's results (once). */
const CARRIED = '@carried';
const newer = (a: string, b: string) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  for (let i = 0; i < 3; i++) if (x![i] !== y![i]) return (x![i] ?? 0) > (y![i] ?? 0);
  return false;
};
/**
 * A new release line starts from the newest earlier line's results, each still showing the build it
 * was tested on, so testing carries on where it was. Once only: Start over then really starts over.
 */
export function carryForward(state: Record<string, CheckState>, version = VERSION) {
  if (`${version}:${CARRIED}` in state) return state;
  const lines = [...new Set(Object.keys(state).map((k) => k.split(':')[0]!))];
  const prev = lines.filter((v) => newer(version, v)).sort((a, b) => (newer(a, b) ? -1 : 1))[0];
  const carried = Object.fromEntries(
    Object.entries(state)
      .filter(([k]) => prev && k.startsWith(`${prev}:`) && !k.endsWith(CARRIED))
      .map(([k, v]) => [`${version}:${k.slice(prev!.length + 1)}`, v]),
  );
  const marker = { status: 'ok', at: '', build: version } as CheckState;
  return { ...carried, ...state, [`${version}:${CARRIED}`]: marker };
}
export function saveChecks(state: Record<string, CheckState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: progress lasts until the page closes.
  }
}

/** Free text the tester puts between checks: before check `before` (TC-###), or at the end of a
 *  group (`after:TC-###`, its last check). */
export interface ChecklistNote {
  id: string;
  before: string;
  text: string;
}
const NOTES_KEY = 'rrq.dev.checklist.notes';
export function loadNotes(): ChecklistNote[] {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) ?? '[]') as unknown;
    return Array.isArray(raw)
      ? raw
          .filter(
            (n): n is ChecklistNote =>
              !!n &&
              typeof n === 'object' &&
              typeof (n as ChecklistNote).id === 'string' &&
              typeof (n as ChecklistNote).before === 'string' &&
              typeof (n as ChecklistNote).text === 'string',
          )
          // '' was the end of the list before each group had its own end.
          .map((n) => (n.before ? n : { ...n, before: `after:${CHECKS.at(-1)!.id}` }))
          // A check is removed once its round is addressed: its notes go with it.
          .filter((n) => CHECKS.some((c) => `after:${c.id}` === n.before || c.id === n.before))
      : [];
  } catch {
    return [];
  }
}
export function saveNotes(notes: ChecklistNote[]) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // Storage blocked: notes last until the page closes.
  }
}
