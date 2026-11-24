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
  data046: 'Data quilts: placing by number and series (spec 046)',
  update054: 'Update dialog (spec 054)',
  gray047: 'View grayscale in block previews (spec 047)',
  drag037: 'Dragging quilts and blocks into order (spec 037)',
  shadow048: 'Card shadows (spec 048)',
  shape049: 'Library blocks by shape (spec 049)',
  snap031: 'Snapping gravity and Line up (spec 031)',
  swirl025: 'Swirl and Pinwheel data blocks, traces in block pictures (spec 025)',
  make041: 'Data Quilts: data entry and printed instructions (spec 041)',
  epp027: 'English paper piecing: shapes, rosettes, EPP section (specs 027, 050)',
  epp3d: '3D EPP (spec 027 User Story 7)',
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
    id: 'TC-188',
    group: G.data046,
    text: 'Leap day: a Weeks quilt from 1 January 2028. Details › Data quilt shows Leap day (hidden for 2027 and for Months). Extra single-day number: the list runs Jan 1, Wk 1 … Wk 52, Dec 31. Use a 2-day block variant: the last number is Dec 30–31 and a week block’s 2-day variant (Draw tab › Variant › 2 days) shows there. Average and Ignore: 53 numbers, and the Entries dialog marks Feb 29 “Averaged into Feb 28” or “Not shown in the quilt”. With a category value (Mood) and Average, Categories round (Down / Up) appears. A Days plan offers Average, Ignore and Extra; switching to Ignore with a block on Feb 29 asks first.',
    last: '"let’s have the leap year question be a setting in the details / data quilt section" / "for day mode, let’s give the user the option between “average feb 28 & feb 29”…" / "no let’s just have this as a setting for the whole quilt for any category series"',
    to: '/',
  },
  {
    id: 'TC-280',
    group: G.epp027,
    text: 'Shape editor: Project › EPP › New shape. Drag corners on the grid (Vertex grid snapping Free / Square / Triangle, the grid drawn follows); each edge shows its length (2, 1/2, 1.41). Vertex tool: tap an edge to add a corner. Delete tool: tap a corner to remove it, tap an edge to join its two corners (never fewer than three corners; a locked corner stays put). Edge tool: drag an edge; tap one to mark it as not a whole unit (orange, dashed). A new shape opens on about 8U × 8U. Angle tool: each corner shows its angle on a label; drag the label right to widen the angle, left to narrow it, by the Angle step. Lock vertex: a locked corner doesn’t move. The checks follow every change: Closes, Doesn’t cross itself and Convex block (red, the banner says which); edges that aren’t whole units only warn (orange) until marked with the Edge tool. Multi-shape: the Line tool draws lines across the outline (they snap onto edges, at whole units from a corner when close); each closed area gets its own checks. Vertex drags corners and line ends (lines follow a moved corner); Delete removes a line. Until there are two shapes, a note above Save as rosette says why it’s off. Save as rosette opens a rosette of those shapes; pieces that are existing shapes (a hexagon cut by its three diagonals: six Triangles) use the library shape, not a copy. Print tab: paper and fabric templates of the shape.',
    to: '/project',
  },
  {
    id: 'TC-281',
    group: G.epp027,
    text: 'Rosette editor: Project › EPP › New rosette. Free: pick Hexagon, a ghost follows the mouse (on a phone: drag a finger from empty space) and snaps; letting go of a drag places it; tap to place seven into a flower, each flush. Drag a piece (Place tool, the hand): within about half an edge it jumps flush to a neighbor, the meeting edges green; it turns at most 30° to fit; it may snap overlapping another piece. Tap the picked card again to stop placing. Grow: hover a free edge (green), picker cards show which shapes fit, tap the edge to attach the picked shape. Placement switch (Free / Grow / Grid) at the top of the sidebar. Grid (the only mode that shows a grid): shapes sit on the grid, but a neighbor’s edge in reach still snaps first; Drag grid moves it until it lines up with a placed corner; Sync grid to selected size follows the Scale slider. Scale 2 pieces snap along 1U ones. Turn a snapped piece (a Honeycomb’s flat top under a Square): each tap turns it the least that keeps an edge flush with the square, so it stays attached. Mirror, Delete. Leave a gap and use Close space: a new shape fills it (an existing shape when it is one); its edges that aren’t whole units come marked. Sidebar tabs Shapes / Colors (as the quilt editor’s Blocks / Colors): Colors switches to Paint and shows Colorings and the colors; pick a color, tap pieces. New coloring, Copy, remove. Shapes switches back to Place. Place the Hexagon Flower rosette into another rosette: its pieces are copied in, and while placing it snaps only where it sits outside the pieces already there.',
    to: '/project',
  },
  {
    id: 'TC-282',
    group: G.epp027,
    text: 'EPP section: Project › EPP lists your shapes and rosettes, the libraries’ ones below (built-in: Hexagon, Half Hexagon, Honeycomb, Elongated Hexagon, Triangle, Half Square, Square, 60° and 45° Diamond, Hexi Kite, Jewel, Pentagon, Octagon; rosettes Hexagon Flower, Double Flower, Six-Diamond Star, Tumbling Block, Octagon and Square). Card menu: Duplicate, Edit a copy (library items), Export (.rrqepp) then Import it into another project, Add to My library, Delete (refused while used). Libraries page: Type › EPP shows them; Copy to My library and Delete from My library. Save and reopen the project: everything comes back.',
    to: '/libraries',
  },
  {
    id: 'TC-283',
    group: G.epp027,
    text: 'Rosette print: a rosette’s Print tab (or Print on its card). 1U length and How many rosettes change the counts (Hexagon Flower × 4 = 28 hexagons). Rosette sheet, Paper templates (finished size) and Fabric templates (with seam allowance) each on or off. Print at 100 % and measure: a 1 in hexagon’s edge is 1 in; a fabric template is one seam allowance larger all round.',
    to: '/project',
  },
  {
    id: 'TC-284',
    group: G.epp027,
    text: 'EPP quilt: Project › Quilts › New quilt › EPP: 1U length (starts 2 in, 5 cm in cm projects) and seam allowance (3/8 in, 1 cm), Create quilt. Design: the rosette editor’s tools on the quilt (Place, Turn, Mirror, Break into patches, Delete, Close space, Paint) with Apply to This / All / Same shape / Same fill; place a rosette (linked, one piece; a rosette card with several colorings has a count badge: pick a coloring there, the card shows it and it’s placed in it) and with Place rosettes ungrouped on (loose pieces); drag one Double Flower round another: it only snaps flush outside it, never into it; Free / Grow / Grid. Colorways show. Layout: change 1U, the quilt grows, pieces stay joined; Edge: No trimming, Cut to size (starts as the largest rectangle the pieces fill; type a width and height; dashed red cut line in Design), Auto-close (closing pieces fill the notches; Use the picked color or fabric for them). Borders: with No trimming it asks for an edge first; with an edge, borders go round it. The quilt card and Details picture show the pieces.',
    to: '/project',
  },
  {
    id: 'TC-285',
    group: G.epp027,
    text: 'EPP quilt print: Quilt picture, Yardage estimate, Paper templates (finished size) and Fabric templates (the quilt’s own seam allowance, not the print setting). At 1U = 2 in a hexagon’s paper template edge measures 2 in at 100 %; the fabric one is 3/8 in bigger all round. Closing pieces print too; with Cut to size, pieces wholly outside the cut are left out (the page says how many).',
    to: '/project',
  },
  {
    id: 'TC-287',
    group: G.epp027,
    text: 'Close space lines (rosette editor and EPP quilt Design): with Close space, a corner under the mouse shows a green dot. Drag from one piece corner to another: the line is dashed until it reaches a corner, then solid. Across a gap (a ring of six hexagons, opposite corners of the hole): both sides fill, here two library Half Hexagons. Two Six-Diamond Stars side by side, a line across the space between them: a Triangle fills each side. Across a piece (a hexagon, left to right corner): it splits in two Half Hexagons in its color. A split square gives two Half Squares. An area no shape matches becomes a new shape (orange or red outline when it needs it). In a quilt, a line across a placed rosette asks to break it into patches first. Along an edge or nowhere useful: a note says the line does nothing. Tapping a gap still fills it all.',
    last: 'it only filled in one of the spaces produced by the gap fill I made',
    to: '/project',
  },
  {
    id: 'TC-288',
    group: G.epp027,
    text: 'Cut to size fits the pieces: two Six-Diamond Stars side by side with a 60° Diamond between them, Layout › Edge › Cut to size (or Largest rectangle the pieces fill on a quilt already cut). The dashed cut line runs along the flat top and bottom of the pieces and through the side notch tips: no bumps of empty space inside it, no strip of pieces left outside it at the bottom.',
    last: 'cut-to-size is leaving weird bumps on the top of the quilt / it looks like the size it used is right but it is shifted towards the top too much',
    to: '/project',
  },
  {
    id: 'TC-289',
    group: G.epp027,
    text: 'Largest rectangle the pieces fill snaps to piece corners: after it finds the rectangle, each corner of the cut looks for piece corners within 1/4 U (in or out) and the cut lands as many of its four corners on piece corners as it can (the smallest move wins a tie). Try a few layouts (hexagons in rows, stars, diamonds): the dashed cut corners sit on piece corners where one is close.',
    last: 'largest rectangle fill should snap to close vertices after finding the largest rectangle / shouldn’t necessarily be inward. just look for vertices in a 0.25u radius of the rectangle vertex and maximize the number of rectangle vertices that end up sharing a vertex with a shape vertex',
    to: '/project',
  },
  {
    id: 'TC-292',
    group: G.epp027,
    text: 'Multi-select, reworked, in an EPP quilt’s Design tab and in the rosette editor. No toolbar over the canvas. Select tool (top of the rail): tap pieces to pick them, tap a picked one to unpick it, tap empty space to unpick all; drag from empty space to box pieces in (Alt: every piece the box touches); the readout counts what is picked. Drag from a piece: everything picked moves and snaps by its outside edges. With pieces picked, the rail’s Turn, Mirror left to right, Mirror up and down and Delete (and Break into patches in a quilt) act on them at once: Turn turns them as one, in steps from the least common multiple of their shapes (hexagons alone 60°, a hexagon and a square 30°, a hexagon and an octagon 15°), and a full round comes back exactly; each Mirror flips every picked piece where it is, not the group; the sidebar’s Scale shows and sets their size; Paint on a picked piece paints them all. Duplicate (rail, Ctrl+D) puts them at the top of the picker as a temporary rosette, ready to place as often as you like (try turning and mirroring placements, and placing a quilt duplicate inside a rosette) until the next Duplicate. Ctrl+A picks all, Esc unpicks, arrows nudge, each action is one undo step and undo brings the picks back. The two Mirror buttons also flip single pieces with a tap.',
    last: 'the flip tools should flip the pieces individually, not as a group. rotate should still function for the group, though. and rotate should be based on the least common multiple among the rosettes / shapes in the group (if you have a hex and an octogon selected then there should be 3*2*2 = 12 rotation points)',
    to: '/project',
  },
  {
    id: 'TC-293',
    group: G.epp027,
    text: 'Rosettes in block quilts. New quilt › Shaped Blocks (hexagons). Design › Blocks shows a Blocks / Rosettes switch; Rosettes lists only rosettes whose outline is exactly a hexagon (the built-in Tumbling Block, badged EPP), not the Hexagon Flower or the Six-Diamond Star. Pick it and tap spaces: it fills them exactly, turns and colors like a block, and a rosette with several colorings offers them on its tile. Make your own rosette (EPP section › New rosette): six triangles round a point make a hexagon, two make a 60° diamond (for Diamond Point or Shaped Blocks diamonds), four squares make a square (Straight Set with square blocks; not offered for rectangular blocks); one with a gap or a jagged edge is not offered. Edit a placed rosette in the rosette editor: the quilt follows. Print: the rosette is not in the rotary cutting chart or the block pages; Templates end with Paper templates: rosettes and Fabric templates: rosettes, one per patch shape and fill.',
    last: 'we want to require that the edges are actually the required shape, not the required shape only after cutting. so for example if it counts as a hexagon, it needs a perimeter with 6 fully straight edges.',
    to: '/project',
  },
  {
    id: 'TC-294',
    group: G.epp027,
    text: '3D-printed templates (STL), from the prototype into the app. Libraries › an EPP shape or rosette: click it, the preview has Preview and 3D print tabs; a rosette has a tab per shape. Block, rosette and quilt editors: a 3D Print tab right of Print, the template in the middle (drag to turn, scroll to zoom), the sidebar with Shape (which piece; a shape’s Size in U and 1U length; a block’s size; an EPP quilt’s 1U and seam allowance shown, not set), Template (Paper / Fabric, seam allowance, Trim points on by default, a note when a shape has nothing to trim) and Advanced (collapsed: height, floor, wall, radii, chamfers, text depth, Back to defaults). Text: Edge: and SA: for EPP shapes, Size: w × h and SA: for block and quilt pieces, SA: 0 on paper templates; 6 mm per inch of edge, then the biggest hole that fits (3/4 or 3/8 inch) above the text. Concave pieces (a Drunkard’s Path) say they can’t be made yet. Download STL and open it in your slicer: one closed solid.',
    last: 'this implmentation looks good. let’s add it to the actual app with the following interfaces that use it: as the preview dialog when clicking on a shape or rosette (rosette should have a set of tabs to click through each of the shapes that make up the rosette); as a new 3D Print tab to the right of Print in the block, rosette, and quilt workbenches',
    to: '/libraries',
  },
  {
    id: 'TC-295',
    group: G.epp027,
    text: '3D Print hanging hole toward a corner, default 1U 2 in. Libraries › Hexagon › 3D print: the hole sits on a line from the middle of the floor out to a corner (the top-left one for a hexagon or square), not in the middle of an edge; the text is still as big as before and clear of the hole. Try a 60° Diamond: the hole goes toward a sharp corner. Change Size to 1U and 3U and switch Paper / Fabric: the hole stays on a corner line. 1U length starts at 2 in in an inch project (50 mm in a cm project; reset print settings or use a fresh browser profile to see the default), in the 3D print tab and in a rosette’s Print tab. New quilt › EPP in a cm project: 1U 5 cm, seam allowance 1 cm (was 2 cm and 0.375 cm).',
    last: 'let’s update the algo for placing the hole in the 3d print template to try to place the hole on a line going form the midpoint out to a vertex / let’s also set the default 1U length to 2" for imperial or 50mm for metric',
    to: '/libraries',
  },
  {
    id: 'TC-296',
    group: G.epp027,
    text: '3D Print text shrinks a little for a hanging hole. Libraries › Half Hexagon › 3D print, Paper, Size 1U, 1U length 2 in: a 3/8 in hanging hole and text about 10.8 mm (it was 12 mm with no hole). Size 1U at 1 1/2 in: no hole still (the text would have to shrink more than a quarter). Hexagon at 2 in: full 12 mm text and the 3/4 in hole, as before.',
    last: 'why does 1u, 2in/u half hexagon paper not get a hanging hole? is the font maxed out? can it be shrunk a bit to fit a hole?',
    to: '/libraries',
  },
  {
    id: 'TC-297',
    group: G.epp027,
    text: '3D Print inner corner radius 2 mm. Libraries › Hexagon › 3D print › Advanced: Inner corner radius shows 2, as Outer corner radius (if it shows 6 or 4, an earlier Advanced change saved the old build: set it to 2 or reset print settings). The pocket’s corners are visibly tighter than before; the downloaded STL opens in the slicer as one solid.',
    last: 'lets drop the inner corner radius to 4mm / drop those radius to 2mm?',
    to: '/libraries',
  },
  {
    id: 'TC-298',
    group: G.epp027,
    text: 'Seam allowances are project settings: standard piecing 1/4 in (6 mm), EPP 3/8 in (10 mm), fields step 1/8 in (1 mm). New inch project › a block’s Print tab › Cutting: Seam allowance (project) 1/4 in; set 3/8 in, open the block’s 3D Print › Fabric: 3/8 in too; Help › Quilt math › Half-square triangles shows 3/8 in. Undo puts it back. Save, reopen: kept. Another project still has 1/4 in. A rosette’s Print tab and its 3D Print: EPP seam allowance (project) 3/8 in, fabric templates labeled SA = 3/8″; Libraries › Hexagon › 3D print with that project open shows the same. EPP quilt: Layout tab Seam allowance edits the project’s (caption says so); New quilt › EPP shows it too. A block quilt with a rosette: the rosette’s fabric templates 3/8 in, the rotary chart 1/4 in. Details › Units to cm: 6 mm and 10 mm (a changed value scales). Cm project from new: 0.6 cm and 1 cm, steps 0.1 cm. No project open (Libraries): the fields show the defaults, read-only.',
    last: 'for the various settings dialogs for 3d prints, the default seam allowance should be 3/8" or 10mm (and increment should be 1/8" or 1mm) / scratch that. 9.5mm with 0.5mm increment / nope, going back to 10mm and 1mm / more specifically, the 3/8" and 10mm seam allowance default is an EPP setting, not a 3d print setting / seam allowance for epp and for standard piecing should be a project level setting. we already decided on 3/8 & 10mm for epp. lets use 1/4 & 6mm for standard piecing.',
    to: '/project',
  },
  {
    id: 'TC-299',
    group: G.epp027,
    text: 'Rosettes in a block quilt, 3D Print and printout. New quilt › Shaped Blocks (hexagons) › Design › Rosettes › Tumbling Block, All, tap the quilt. 3D Print: the shape is 60° Diamond, the floor says Edge: 4" (a diamond’s side where it sits), Fabric shows EPP seam allowance (project) 3/8 in and SA: 3/8". Print: the Cutting field says Seam allowance (project) 1/4 in; the Fabric templates: rosettes page has a note under the key: rosettes cut with 3/8″, the quilt 1/4″, trim the outer edge to 1/4″ or sew those seams at 3/8″. Set the EPP seam allowance to 1/4 in: the note goes. Also: Start a quilt › EPP from the home page: the EPP seam allowance can be changed (it was read-only) and the new project has it.',
    last: 'when I use the tumbling block rosette in a block quilt, why does the 3d print for the epp shape say "size: .... x ...." instead of giving the edge dimension? / epp rosettes in a block quilt should still use the epp seam allowance but a note should be added to a paper printout that their outer seam edge will need to be reconciled with the rest of the quilt’s SA',
    to: '/project',
  },
  {
    id: 'TC-300',
    group: G.epp027,
    text: 'Shape editor 3D Print tab. Open an EPP shape in the shape editor (your own or a library one): tabs Details, Draw, Print, 3D Print. 3D Print shows the shape’s template in the middle (drag to turn, scroll to zoom) and the sidebar as in Libraries › the shape › 3D print: Size in U, 1U length, Paper / Fabric with the project’s EPP seam allowance, Trim points, Advanced. Change the outline in Draw, go back to 3D Print: the template follows. A concave shape says it can’t be made yet. Download STL: one solid in the slicer.',
    last: 'we added a 3d print tab to the epp rosette editor but we didn’t add the tab to the epp shape editor',
    to: '/libraries',
  },
  {
    id: 'TC-301',
    group: G.epp027,
    text: 'Even edge length, under the block size in the Layout tab (collapsed at first). Straight Set quilt with an Ohio Star: open it, the Block list shows Ohio Star; click the corner square, then its right edge (orange): This edge 3.333″ (~ 3 5/16″) in a 10″ block, buttons every 1/8″ from 3″ to 4″ (3″, 3⅛″, 3¼″ … 4″) with the block size each gives (9″ … 12″). Click 4″: Width and Height become 12, the edge reads 4″; Undo puts 10 back. Width 10, Height 8 (not equal): a choice scales both, patches keep their shape. Also: On-Point (Finished block size), Diamond Point (Leg), Shaped Blocks (Side), Baby Blocks (Diamond side), a strip quilt (Strip length; a block in two strips of different counts is listed twice with its sizes). A rosette (Tumbling Block) in a Shaped Blocks hexagon quilt: its three diamonds to pick from. An edge already a whole inch (2″) offers 1″ to 3″ by eighths, 2″ greyed out. A cm project: every 1 mm between whole cm. An EPP quilt’s Layout tab has no Even edge length (1U does it). Curved edges can’t be picked.',
    last: 'let’s add a utility to the quilt layout interface that will adjust the block size so that a user-selected patch from a user chosen block (that’s currently in use in the quilt) has an edge length that’s nicely rounded … this feature should work on both block and epp quilts, and if chosing an epp "block" in a block quilt, should also function. / change the accodian summary to "even edge length" / actually, let’s skip this feature on EPP quilts since it’s already addressed by the U system. it’s only necessary on block quilts (including ones that use EPP blocks / the increments shown in the interface should be in 1/8" incrments or 1mm increments and should, between the min and max value shown, show all increments of that amount',
    to: '/project',
  },
  {
    id: 'TC-302',
    group: G.epp027,
    text: 'New projects start with every built-in block picked. Home › New project › Blocks tab: Library blocks says 439 of 439 selected, Built-In and every category ticked. New quilt › Design: the tray has the built-in blocks without picking any. Untick a category: its blocks leave the tray; save, reopen: kept. Settings › Hide library blocks from projects on, then a new project: no library blocks in the tray (they couldn’t be unpicked there). Projects opened from a file keep their own picks.',
    last: 'let’s change the default behavior for new projects to be having all built in block categories enabled',
    to: '/',
  },
  {
    id: 'TC-303',
    group: G.epp027,
    text: 'EPP shapes and rosettes grouped as library blocks. A project’s EPP tab: Mine (New shape, New rosette, Import, your own), then Libraries: Built-In · 18 with EPP · 18 and Hexagons, Triangles, Squares, Diamonds, Polygons, Rosettes, each collapsible with Expand all / Collapse all, as the Blocks tab’s library blocks (collapsing here doesn’t collapse the Blocks tab). Use a library shape in a rosette: it stays in its library’s section with a check mark (Used in this project). Shapes / Rosettes switch filters the sections. Cards are as tall as their content (no empty space under a row). Libraries › EPP: under each library, EPP shapes and rosettes in the same category sections. A My library shape without a category: Uncategorized.',
    last: 'let’s update the EPP project & library tabs to do grouping for shapes / rosettes by library source. let’s use the same UI components for that grouping as we use in the block interface.',
    to: '/project',
  },
  {
    id: 'TC-304',
    group: G.epp027,
    text: 'EPP editors don’t move the view on their own. A new rosette: place two hexagons apart, drag one far away (and off toward an edge): the other stays put on screen, nothing zooms. Same in the shape editor (drag a corner far out) and an EPP quilt’s Design tab. The view changes only with the wheel, a pinch, panning (Pan tool, right or middle drag), the + / − buttons and Fit. Reopen the rosette: it opens where you left it.',
    last: 'let’s update the epp shape/rosette editor so that dragging around doesn’t cause the viewport to change zoom/pan. the user should have to click/scroll/pinch to change the viewport for the designer interface',
    to: '/project',
  },
  {
    id: 'TC-305',
    group: G.epp027,
    text: 'Shape editor › Multi-shape: Save as shapes, below Save as rosette (disabled until lines make two or more pieces). New shape (a square), draw one diagonal: Save as shapes says every piece is a shape you already have (Half Square). Clear lines, draw both diagonals: Saved 1 shape (four identical triangles make one), the project’s EPP tab opens with it under Mine, named after the shape (New shape 1). Open it: centered, its new edges marked orange if not whole units. A line making two different pieces: two shapes. Save as rosette still works as before.',
    last: 'let’s add a "save as shapes" button below "save as rosette" in the epp shape editor',
    to: '/project',
  },
  {
    id: 'TC-307',
    group: G.epp3d,
    text: 'Open each demo design’s 3D assembly tab: d4, d6, d8, d10, d12, d20, hexagonal prism, truncated tetrahedron and soccer ball fold shut in a few seconds ("Folded: every seam closes. A closed shape, right side out."), then turn to face you with the design’s up up. Drag turns the view, wheel or pinch zooms. A click explodes the object with glowing stitches across every seam, another click closes it; a drag leaves it as it was. Double-click a piece: it turns to the front (the Design tab rings it), Default front undoes that. Lighting: a fixed light above and in front, each piece shaded only by itself.',
    last: 'fixed light & shadows works well; stitches for the explode mode',
    to: '/project',
  },
  {
    id: 'TC-310',
    group: G.epp3d,
    text: 'Seams follow their pieces: in a 3D design, sew an edge of a placed rosette’s piece to another piece, then Break into patches: the seam stays on the same edge. Turn or mirror a sewn piece: the seam stays on its edge (it may then not close). Delete a sewn piece: its seams go. Undo brings them back.',
    to: '/project',
  },
  {
    id: 'TC-311',
    group: G.epp3d,
    text: 'Print a demo design (d12): the quilt picture shows each seam’s two edges in the seam’s color with its number (one number between two edges that meet at a corner), with no edge line round the picture; paper and fabric templates as for any EPP quilt.',
    to: '/project',
  },
  {
    id: 'TC-312',
    group: G.epp027,
    text: 'Start a quilt › EPP: the steps are Layout and Borders only (no Size, no Sashing); Next goes to Borders, which says borders show once the quilt has a finished edge, with 0 borders to start. Set 2: the summary says 2 borders. Create: the quilt keeps them (Layout › Cut to size or Auto-close shows them). Back to Blocks or Patches: all four steps, 1 border again.',
    last: 'in the new quilt wizard, even in epp mode, currently size has columns/rows and block size which don’t apply to epp. I believe sashing should also be cut. we should leave borders, though',
    to: '/',
  },
  {
    id: 'TC-314',
    group: G.epp3d,
    text: 'Demo › Star pillow › 3D assembly: the flat design on top, the 3D view below, a line between. Its seams show red and dashed (the fold can’t close them), the front piece ringed. Tap a numbered edge in the flat design: the seam goes and the object folds again; Undo brings it back; tap two equal free edges: a new seam. Settings › Interface › 3D EPP › Horizontal split: the flat design left, 3D right, both stars in view; back to Vertical. The 3D view keeps turning, exploding and stuffing as before in both.',
    last: 'the 3d assembly section should have a vertical viewport split for the 2d seam assembly on top and the 3d preview on the bottom. there should be an option in app user preferences/interface/3d epp for switching between vertical split and horizontal split',
    to: '/project',
  },
  {
    id: 'TC-317',
    group: G.epp3d,
    text: 'Stuffing as a design setting. Demo › Star pillow › 3D assembly: Stuffed design on, Enable simulation view on; it folds, turns to its front, then stuffs. The side panel says "Stuffed design: the fabric closes the seams the flat pieces can’t." with no red Not closing line and no red seams in the flat design, and stays so with Enable simulation view off (the flat pieces show; Stuffed design stays on, Layout too). Leave the tab and come back, or open another stuffed design: Enable simulation view is on again. Stuffed design off: the red Not closing line, red seams and the note that stuffing might close them. d6 (cube): Enable simulation view greyed until Stuffed design is on, then the cube stuffs (about 1.28 U³); Layout › Stuffed design off shows it flat. A design with a free edge and Stuffed design on: "Can’t be stuffed" and why. A 2D EPP quilt’s Layout tab has no Stuffed design.',
    last: 'the not closing warning should only show based on the stuffed design toggle, not based on the stuffed design view toggle. the show stuffing should be renamed to "enable simulation view" and should be on any time that 3d assembly view is loaded if the quilt is a stuffed design',
    to: '/project',
  },
  {
    id: 'TC-318',
    group: G.epp3d,
    text: 'Demo › d10 (kites): the kites are a real d10’s (two right angles at the sides, a narrow 52° tip, a wide 128° bottom corner; long edges about twice the short, marked orange in the project’s d10 Kite shape). 3D assembly: it folds shut and looks like a d10. Enable simulation view shows off (greyed) while Stuffed design is off.',
    last: 'the d10 kites demo should use the standard kite shape that would be found in a typical d10',
    to: '/?open_demo=3d-epp.rrq',
  },
  {
    id: 'TC-319',
    group: G.epp027,
    text: 'Project › Quilts › Show. Open the v11 demo (16 quilts): All quilts, Data quilts (2), Block quilts (10, Nine Blocks to Diamond Point Half Rows with block spaces), Patch quilts (4: Variable Point, One Patch, Baby Blocks, Variable Blocks); no EPP quilts option. Add an EPP quilt: EPP quilts appears and lists it. Delete it: the option goes and the list goes back to All. The 3D EPP demo (EPP quilts only): no Show picker.',
    last: 'in the toggles for quilt types in the project view, we should add a toggle for epp; let’s also seperate other into "block" and "patch"; and then only show the toggle options for quilt types that exist in the project',
    file: 'demo-v11.rrq',
    to: '/project',
  },
  {
    id: 'TC-321',
    group: G.epp3d,
    text: 'Stuffed pieces are smooth through the middle: demo Soccer ball, Star pillow, and d6 (cube) with Stuffed design on: zoom in on a stuffed face. No star of creases from the middle out to the corners (the middle no longer looks pinched); faces dome evenly, wrinkles only near the seams and corners. Stuffing settles in a few seconds as before.',
    last: 'in the stuffing simulation, why does it look like the centroid is pinched? is there some sort of a boundary condidtion thing there?',
    to: '/?open_demo=3d-epp.rrq',
  },
  {
    id: 'TC-323',
    group: G.epp3d,
    text: 'Print a demo design (Soccer ball, d12): the quilt picture page shows the flat design with its numbered seams on top and the folded object below it (stuffed for the soccer ball), then the title and caption, all on one page; for a moment it may say "Drawing the 3D view…". Print to PDF: both views come out.',
    last: 'the print out should show both 2d and 3d view',
    to: '/?open_demo=3d-epp.rrq',
  },
  {
    id: 'TC-324',
    group: G.epp3d,
    text: 'Print a demo design (d6): under the 3D view, "Click to turn it". Click: a live view; drag turns the object. Move the pointer off it: the picture comes back from the new side (a moment later, redrawn sharp). Print again or reopen the file after saving: the same side. Click, then leave the pointer on it untouched for 15 seconds: the picture comes back, unchanged. Undo after turning: the earlier side. On a phone: tap, drag with a finger, then wait 15 seconds. The printed copy never shows the hint.',
    last: 'let’s allow click-to-orbit on the 3d preview in the printout. we’ll record the orientation. clicking switches from showing an image to the orbitable view and mouse exit or 15seconds uninteracted will revert back to image view',
    to: '/?open_demo=3d-epp.rrq',
  },
  {
    id: 'TC-326',
    group: G.epp3d,
    text: 'Open the 3D EPP demo (this check’s link opens it). Project › Quilts (11): the eleven 3D designs with a 3D badge (top right), each card turning from the flat net into the folded object within a couple of seconds (star pillow, twisted pincushion and soccer ball stuffed), on a light and a dark theme; they open, copy and delete as other quilts; change a design (a color, a seam, Stuffed design) and its card updates. EPP (6): shapes and rosettes only (the d10 Kite under Mine), with All / Shapes / Rosettes, no 3D designs and no New 3D design.',
    last: '3d epp quilts should show up in the projects quilt tab just like 2d epp quilts do; the epp 3d quilts are showing up in the epp shapes/rosette tab; can we change the thumbnails for 3d epp quilts to use a 3d render of the quilt?',
    to: '/?open_demo=3d-epp.rrq',
  },
  {
    id: 'TC-327',
    group: G.epp3d,
    text: 'Start a quilt › EPP › 3D EPP on: only the Layout step, the summary starts with 3D; Create: a 3D design (tabs Details, Layout, Design, 3D assembly, Print, 3D Print; no Borders), listed under Quilts with a 3D badge. Layout shows 1U and the seam allowance, no Edge. Place five 60° diamonds in a fan in the Design tab, choose the Seam tool, tap the fifth diamond’s free outer edge then the first’s: both turn the same color with a 1 outside them, the readout counts 1 seam. 3D assembly: a shallow five-point star (every hinge about 42°), and with Stuffed design on, "Can’t be stuffed" (edges free). Tap a numbered edge with the Seam tool: the seam goes. Tapping an edge that touches its neighbor, two edges of one piece, or edges of different lengths says why nothing was sewn. An EPP quilt with a border: Layout › 3D EPP on: Borders tab goes, 3D assembly appears, the border is gone (Undo brings it back); off again: Borders tab back, any seams kept for next time.',
    last: 'the epp 3d quilts are showing up in the epp shapes/rosette tab; the interface when the epp option has been picked should have a toggle for 3d epp mode; we don’t appear to have the toggle for epp in layout of the quilt design, either',
    to: '/',
  },
  {
    id: 'TC-329',
    group: G.files,
    text: 'Demo links, now ?open_demo=. Open localhost:9000/RRQuilts/?open_demo=3d-epp.rrq: the 3D EPP demo opens at once (11 quilts), with Save asking where. Help › 3D EPP › "3D EPP demo" and Help › Data quilts › "temperature quilts demo" links: the same for their demos. ?open_demo=nope.rrq: "There’s no demo project called…". ?open_demo=https://example.com/x.rrq: "That link doesn’t point at a demo project." With unsaved work open, a demo link keeps it in a draft as opening any file does. After a release (make serve, or the live site): the links work offline once the app has been loaded. (?open_url= for any link is still to come.)',
    last: 'let’s add a demo folder that’s included in the deployed app and a similar route to open_gist called ?open_url= that can load rrq files from the demo folder that are passed in; the current method should be renamed to open_demo',
    to: '/?open_demo=3d-epp.rrq',
  },
  {
    id: 'TC-331',
    group: G.files,
    text: 'Block and patch quilts demo (first in Home › Open a demo and the welcome’s Demos step; Help › Designing a quilt links it). Quilts (4), Show: All, Block quilts, Patch quilts. Medallions on point: three medallion blocks on point with cream sashing and red cornerstones, dark setting triangles, about 97 in square, the Queen with drop outline over it. Diamonds with sashing: Diamond Point, two log cabin diamond blocks, gold sashing, teal setting pieces, a dark 3 in border. Pieced strips: seven pattern strips edge to edge (points, checkerboards, diamonds, spaced squares, double diamonds), 28 × 29 in, the men’s XL top back outline over it. Tumbling cubes: Variable Patch, butter tops, teal and dark sides, 42 × 38½ in. Both overlays have Invert on (the quilt outside the shape shaded, inside it as is): Pieced strips black at full strength (Layout › Reference overlay: black swatch, Fill 100%), Medallions on point a light gray wash (#757575, Fill 15%).',
    last: 'let’s add a demo project with a handful of basic block and patch quilts. let’s do an on-point quilt with some medalians with sashing between them, a shaped blocks with sashing and a border, a strips (patches) without sashing, and a variable patch without sashing. let’s have a men’s XL shirt back over the strips one and a queen XL over the on point quilt; for both overlays, do tint of #000000, max opacity, invert; actually, for the medalians on point, do #757575 at 15%, inverted',
    to: '/?open_demo=block-quilts.rrq',
  },
  {
    id: 'TC-332',
    group: G.files,
    text: 'Demos. Settings › You › Show the welcome again (or a fresh browser): the steps end with Demos after Help, listing Block and patch quilts, Temperature quilts and 3D English paper piecing; the last button says Start quilting; clicking a demo closes the welcome and opens it. Home: Open a demo, right of Open from a gist, opens the same list (with unsaved work open, it asks first). Each demo’s Details tab: author RRQuilts contributors. Temperature quilts demo: Quilts (4): 365 days of highs, A month per row, Highs and lows week by week (each colored by a year of entered temperatures, Data tab: Real data, the first weeks marked cut and sewn, January and February sewn as months; filler, borders and sashing colored), and Month pinwheels on point (a Quartered Month Pinwheel per month on simulated data, Cobweb blocks between and in the setting triangles). Help › Data quilts links it.',
    last: 'let’s add a "demos" step to the welcome wizard after help; and let’s also have a demo of temperature quilts; let’s add a button to the right of "open rpoject file" and "open github gist" for "open a demo"; yeah, I meant to use that new temp demo. and we should update the author of the other demos to match',
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
