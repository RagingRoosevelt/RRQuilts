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
  recolor: 'Re-color colorways (spec 019 FR-007)',
  follow: 'Colorways follow a colorway (spec 019 FR-009)',
  road093: '0.9.3 roadmap',
};

export const CHECKS: Check[] = [
  {
    id: 'TC-188',
    group: G.data046,
    text: 'Leap day: a Weeks quilt from 1 January 2028. Details › Data quilt shows Leap day (hidden for 2027 and for Months). Extra single-day number: the list runs Jan 1, Wk 1 … Wk 52, Dec 31. Use a 2-day block variant: the last number is Dec 30–31 and a week block’s 2-day variant (Draw tab › Variant › 2 days) shows there. Average and Ignore: 53 numbers, and the Entries dialog marks Feb 29 “Averaged into Feb 28” or “Not shown in the quilt”. With a category value (Mood) and Average, Categories round (Down / Up) appears. A Days plan offers Average, Ignore and Extra; switching to Ignore with a block on Feb 29 asks first.',
    last: '"let’s have the leap year question be a setting in the details / data quilt section" / "for day mode, let’s give the user the option between “average feb 28 & feb 29”…" / "no let’s just have this as a setting for the whole quilt for any category series"',
    to: '/',
  },
  {
    id: 'TC-349',
    group: G.small,
    text: "Libraries: search Bull's Eye. The block is the same top to bottom and left to right: half-square triangles on the left edge of the lower half, and the dark triangles at the top and bottom middle are the same dark blue as the squares beside them. Check its themed colorings too.",
    last: '"the bull\'s eye block is missing the two half-square triangles that are needed along the left edge on the lower side. also, there are two half-square triangles that use the wrong dark blue color that should match the dark blue of their immediate neighbors"',
    to: '/libraries',
  },
  {
    id: 'TC-350',
    group: G.small,
    text: 'Header: a bug button sits just left of the settings gear on every page (phone width too). It opens Help › About › Got an idea?.',
    last: '"let\'s also add a "bug" button immediatly to the left of the user settings icon that takes the user to the "help / about / Got an Idea?" page"',
    to: '/',
  },
  {
    id: 'TC-351',
    group: G.small,
    text: 'Home › New project (and Start a quilt with no project open): the Sketchbook’s Fabrics & Colors tab has every built-in palette picked (Basic colors, Pastels, Darks, Gems, Neon, Traditional), and the Design tab’s Colors tray shows them all.',
    last: '"let’s default the palette selection for new projects to have all built-in palettes selected"',
    to: '/',
  },
  {
    id: 'TC-352',
    group: G.recolor,
    text: 'A block quilt’s Design tab: Save as new colorway, then Colors. Mode reads Palette · Auto map · Re-color. Choose Re-color: the palettes show under it, starting from the colors the colorway showed. Paint one patch with Apply to This, then All and Alternate, and try Spray, Swap and the eyedropper. Show the primary: it hasn’t changed. The Print tab and the quilt card show the re-color while it’s shown. Save and reopen: it’s kept.',
    last: '"let’s add a new colorway mode for quilts that’s an outright re-coloring and allows for setting the color of any patch in any block as you would in the primary colorway. we’ll call it “re-color” in the toggle that currently has “manual” (let’s rename to palette) and “auto map”"',
    to: '/',
  },
  {
    id: 'TC-353',
    group: G.recolor,
    text: 'In a re-color: set a different block in one space from the primary, and the re-color shows the primary’s colors there until painted. Redraw a placed block’s seams (block editor): the re-color keeps its colors. Switch Mode back to Palette: it asks, then the earlier mapping returns. New colorway from palette… offers Re-color too. Delete the primary while a re-color is next: the quilt takes the re-color’s colors. A data quilt or an EPP quilt offers only Palette and Auto map.',
    last: '"let’s add a new colorway mode for quilts that’s an outright re-coloring…"',
    to: '/',
  },
  {
    id: 'TC-354',
    group: G.recolor,
    text: 'Paint a re-color with a color used nowhere else, then the quilt card’s Export: the exported file opens with the re-color and that color. Import quilts from a project with it: the re-color and its colors come in.',
    last: '"make sure that export / import work for the change, too"',
    to: '/',
  },
  {
    id: 'TC-355',
    group: G.recolor,
    text: 'A Palette colorway, then an Auto map one: in the Colors tab, point at a row and the quilt lights that color’s pieces (sashing and borders too), with the rest paled. Pieces of the color that touch, in one block or across blocks and sashing, share one outline round their outside, with no line along the seams between them. Tap the row’s color: it stays lit with the swatch outlined after the pointer leaves, and a second tap stops it. On a phone, a tap lights it. Showing the primary clears it.',
    last: '"in the palette and auto map modes, hovering over the row or tapping/clicking the source color in the map interface should highlight patches in the quilt that use that color"',
    to: '/',
  },
  {
    id: 'TC-356',
    group: G.recolor,
    text: 'Design tab, primary colorway: point at a swatch in the Colors tray and the quilt lights that color’s pieces (same glow as a hovered patch in the block editor), the rest paled; moving off clears it. On a phone, press and hold a swatch: it lights while held, and stays lit while the swatch’s menu is open; a plain tap only picks the color. In a re-color, the swatches light the re-color’s own colors (a piece painted only there lights too).',
    last: '"let’s also update the color picker that’s in the primary colorway and in the recolor interface so that hovering or long-pressing a color highlights the patches using it"',
    to: '/',
  },
  {
    id: 'TC-357',
    group: G.recolor,
    text: 'Block editor, Color tab: point at a swatch (or press and hold on a phone) and the coloring shown lights that color’s patches, touching ones sharing one outline (all round the block’s edge too), the rest paled. Switch colorings: it follows the one shown.',
    last: '"let’s do that in the block color picker, too"',
    to: '/',
  },
  {
    id: 'TC-358',
    group: G.small,
    text: 'Project page: a long project name shows in full across the page and is cut off with … only at the page’s edge (wide window and phone width), with no sideways scrolling. Click it and edit as before.',
    last: '"the project title should be allowed to flow further and only truncate when it hits the edge of the page"',
    to: '/',
  },
  {
    id: 'TC-359',
    group: G.small,
    text: 'A block or patch quilt’s Layout tab: the heading reads “Layout - <width> × <height> <units>”, the same as Finished under the quilt, and updates as you change blocks, sashing or borders.',
    last: '"the layout tab of the quilt designer should show the overall dimensions. let’s add it to the layout section label “Layout - <x> × <y>”"',
    to: '/',
  },
  {
    id: 'TC-360',
    group: G.follow,
    text: 'A block quilt: New colorway from palette… with Neon, Palette, Add colorway. With that Neon colorway shown, New colorway from palette… again: the list and the Before picture are the Neon colorway’s colors, and pick Basic colors: each becomes its nearest there (Neon Yellow → Yellow). Add it: its Colors tab says Follows the Neon colorway, with Neon colors on the left. Set Follows to Colorway 1: the left side shows the primary’s colors, the quilt doesn’t change. Back to the Neon colorway: rows with the same colors on both sides merge into one, a pick on a merged row changes every piece behind it, and pointing at it lights them all.',
    last: '"when I’m in auto-mapping mode or palette mode … the colors shown for “from” should be based on the colorway we’re starting from, not from the primary colorway. we shuould also allow the manual colormapping (aka Palette mode), to select the colorway the mapping follows from" / "when you click on “new colorway from palette”, it should pick the currently selected colorway as the follow source"',
    to: '/',
  },
  {
    id: 'TC-361',
    group: G.follow,
    text: 'A Palette colorway following the Neon colorway: switch to Auto map with Basic colors. Each Neon color becomes its nearest basic color, not the primary’s nearest. Pick one row by hand, then switch back to Palette: the picks, Follows and the palette (now Pick from) stay. Follows never offers the colorway itself or one that follows it.',
    last: '"switching from auto-mapping to manual mapping should preserve the selections" / "the auto mapping should map from the closest match of colors in the from colorpalette, though, not the primary color palette"',
    to: '/',
  },
  {
    id: 'TC-362',
    group: G.follow,
    text: 'Make a colorway a Re-color and paint a few patches. Another colorway following it lists the re-color’s colors and shows its painting with that colorway’s picks. Delete the re-color: the one that followed it looks the same and is now a Re-color. Delete a colorway another follows: that one follows what it followed and looks the same (an auto-mapped one becomes Palette). Delete the primary: every other colorway looks the same.',
    last: '"switching which palette we’re following shouldn’t change the mapping, just the visual of which colors we’re going from and to. the exception is if we’re following a recolor."',
    to: '/',
  },
  {
    id: 'TC-363',
    group: G.follow,
    text: 'New colorway from palette…: pick Auto map and add one. Open it again (also from a quilt card’s menu on the Quilts tab): it starts in Auto map. Same for Re-color and Palette. On a data quilt or an EPP quilt after picking Re-color, it starts in Palette. A block’s New coloring from palette has no modes and adds as before.',
    last: '"and when you pick a colorway mode in that dialog, it should preserve the mode (automapping, palette, recolor)"',
    to: '/',
  },
  {
    id: 'TC-364',
    group: G.follow,
    text: 'A quilt with colorways: show one, then Details › Download image and the Quilts tab card’s Save image. The file is named “<quilt name> - <colorway name>.png” (the primary too, by its name). A quilt with no colorways saves as “<quilt name>.png”. Rename the quilt or colorway with / : * ? " < > | in it: those are left out of the file name (also when saving the project), with no doubled spaces.',
    last: '"when saving an image for a quilt with multiple colorways, include the name of the colorway in the filename: `<quilt name> - <colorway name>.<ext>`"',
    to: '/',
  },
  {
    id: 'TC-365',
    group: G.small,
    text: 'Libraries: tag a block from a pack, then remove that pack. The notice at the top is an info alert (info icon, light blue with a blue edge; dark theme too) listing the tags in bold, with Remove these tags right under the text, wide window and phone width. The button clears them and the notice goes.',
    last: '"the “remove them” button is way off to the side and doesn’t clearly associate with that warning. also, that warning should be more clearly styled as an info alert"',
    to: '/libraries',
  },
  {
    id: 'TC-366',
    group: G.road093,
    text: 'A quilt’s Design tab › Blocks: type part of a block’s name in Search block names. Only blocks whose names hold every word typed show, in Mine and each library, with Compatible with this layout or Shape still applied. Nothing matching says so. In a quilt that takes rosettes, the Rosettes list is searched too. The x clears it.',
    last: '"Search blocks by name in a quilt’s Design tab" (0.9.3 roadmap)',
    to: '/',
  },
  {
    id: 'TC-367',
    group: G.road093,
    text: 'An EPP quilt’s Design tab: pick the Find tool (magnifier) and tap a placed rosette. Its card is picked in the sidebar (scrolled to, shown even with the Shapes filter on), in the coloring that placement shows and at its scale, and every placement of it glows. Tap a loose shape: same for the shape. Change the card’s coloring and place it over a placement to replace it. Find also works on a read-only tab.',
    last: '"what we should implement instead is a “find” tool (in the toolbar) that works like it does in a normal quilt (selects the clicked-on block/rosette/shape)"',
    to: '/',
  },
  {
    id: 'TC-368',
    group: G.road093,
    text: 'An EPP quilt’s Layout tab › Edge › Cut to size: Largest rectangle is the largest rectangle the pieces fill; move or add pieces in Design and it follows them (fast, also on the Traditional EPP demo’s 888-piece garden). Manual: the cut shows on the picture with square handles on its corners and sides and a round one with four arrows in the middle, the pieces outside faded (under any borders). Drag a side, a corner, the middle: the cursor shows which, and sides stop at piece corners (Snap to vertex) and along upright or level piece edges (Snap to edge); switch both off and they move freely. Aspect ratio Square (1:1), then Wide and Tall ones: the cut takes that shape inside itself, and drags keep it; Freeform lets go. Typing Width or Height switches to Manual (with a ratio, the other follows). Undo steps back one drag at a time. The demo’s cuts open as Manual, unchanged.',
    last: '"the “largest rectangle the pices fill” should turn into a toggle with the other option being “manual” … should show several toggles for snapping the crop rectange with “snap to vertex” and “snap to edge” options" · "there should also be an “aspect ratio” dropdown that has several common aspect ratios as well as “freeform”"',
    to: '/?open_demo=traditional-epp.rrq',
  },
  {
    id: 'TC-369',
    group: G.road093,
    text: 'A rosette of your own › Design › Colors: New coloring from palette… opens the quilt colorways’ dialog with Palette, Auto map and Re-color, before and after pictures of the rosette. Add one in each mode. Palette and Auto map show a Mode, Follows, palette and a row per color in place of the palettes (with a sparkle or arrows icon on their pictures); Paint says their colors are set there. Repaint the coloring they follow: they follow (Auto map picks the nearest again; picks by hand stay, with Automatic to undo one). Change Follows: the picks stay. Switch to Re-color: the colors stay and you can paint; switch a painted one to Palette: it asks first. Delete a coloring others follow: they look the same. Place the rosette in an EPP quilt in a followed coloring, print it, export it (.rrqepp) and add it to My library: the colors are as shown. Undo steps back each change.',
    last: '"Palette swaps for rosette colorings (this should use the same mechanism as we use for quilts, with options for palette, auto palette, and recolor)"',
    to: '/?open_demo=traditional-epp.rrq',
  },
  {
    id: 'TC-370',
    group: G.road093,
    text: 'Import a fabric photo and paint a rosette of your own with it and with a color of your own (not a built-in one). EPP tab: export it (.rrqepp) and Add to My library. In a private window (or another browser profile), import the .rrqepp into a new project: the fabric shows its picture. In the first browser, a new project: place that rosette from My library in an EPP quilt, every piece shows its fabric and color. Back up My library and restore it in the private window: same.',
    last: '"can you add a test for exporting and importing the various files from the app (rqq, individual quilts of various types, blocks, epp, etc) to make sure that the various asepcts of content survive export and import?" (the test found these two)',
    to: '/',
  },
  {
    id: 'TC-371',
    group: G.road093,
    text: 'An EPP quilt’s Layout tab › Edge › Cut to size › Manual: the handle in the middle of the cut is a white circle with the four-arrow pan icon (as Drag grid), dark red; pressing it to drag turns it red with white arrows, and it moves the cut. Dark theme too.',
    last: '"use the pan arrow cross icon for the drag anchor for moving the cut region in epp quilt layout"',
    to: '/?open_demo=traditional-epp.rrq',
  },
  {
    id: 'TC-374',
    group: G.road093,
    text: 'Add a palette with 30 or more colors, a few with very long names. A quilt colorway in Auto map: pick that palette. Its swatches under the field show three rows, the “+N more” button in the last three places of the third row (never on a row of its own, at any sidebar width); it shows the rest, and Show fewer folds them again; picking another palette starts folded. Same under Pick from in Palette mode, and in a rosette’s Auto map and Palette colorings. Pick a long-named color in a row: its name wraps to two lines and ends in …, and the sidebar never scrolls sideways (phone width too).',
    last: '"when a palette has a ton of members, the list is really long … into an acrodian" / "I was in automap where we show a display of the selected palette’s contents" / "let’s allow palette member names in the dropdown to span two lines and then truncate with an elipis"',
    to: '/',
  },
  {
    id: 'TC-375',
    group: G.road093,
    text: 'A rosette’s Design › Colors: Colorings shows each coloring as a picture of the rosette in its colors with its name, as a quilt’s Colorways do; the one shown is outlined. Palette and Auto map ones show arrows or a sparkle on the corner (pointing at it says which). Paint a piece: its picture follows, and so do the pictures of colorings that follow it. The pencil renames, the bin asks, then deletes (greyed with one coloring left); read-only shows neither. A quilt’s Colorways look as before.',
    last: '"the list of colorings in the rosette editor should show previews of the colorings the same way we do for quilts"',
    to: '/?open_demo=traditional-epp.rrq',
  },
  {
    id: 'TC-376',
    group: G.road093,
    text: 'A rosette with several colorings: select the first, New coloring from palette… (Palette), then select it and add an Auto map one from it. In Colorings each sits right after the one it follows (the first, then the Palette one, then the Auto map one, then the rest). Change a coloring’s Follows: it moves after its new one. The same order in Follows and in an EPP quilt’s coloring choices for that rosette. Placements that show the first coloring still show it.',
    last: '"let’s make sure that rosette colorings that are auto or manual mappings are sorted immediatly after the coloring they are based on"',
    to: '/?open_demo=traditional-epp.rrq',
  },
  {
    id: 'TC-377',
    group: G.road093,
    text: 'A quilt with a Palette colorway, an Auto map one and a Re-color: in the Design sidebar’s Colorways and in the quilt card’s colorway menu (the count on its picture), the Palette one shows arrows on its picture’s corner and the Auto map one a sparkle, as rosette colorings; pointing at the sidebar’s names the mode. The Re-color has none; the primary still says Primary. Switch a colorway’s mode: its badge follows.',
    last: '"let’s use the same badges we’re using for rosette colorations for the colorations for quilts"',
    to: '/',
  },
  {
    id: 'TC-379',
    group: G.road093,
    text: 'A quilt with a Re-color colorway: New colorway from palette… on the primary, Auto map, add it. In the Design sidebar’s Colorways, the card’s colorway menu and Follows, it sits right after the primary, before the Re-color. A Palette colorway set to follow another sits right after that one, and one following it after that. Re-colors come after everything that follows the primary, each with what follows it.',
    last: '"let’s apply the same sorting rules for colorations on quilts" / "I just created a colorway that’s an auto map of the primary and it’s showing up after a recolor"',
    to: '/',
  },
  {
    id: 'TC-380',
    group: G.road093,
    text: 'Traditional EPP demo, Grandmother’s Flower Garden › Design: New colorway from palette… lists the quilt’s colors; pick Neon and Auto map, add it. The quilt shows Neon colors (borders too), and the Colors tab shows Mode, Follows, Palette and a row per color, as in a block quilt; change the palette or pick a row by hand: the quilt follows. Tapping a piece with Paint says to show the primary. Palette mode works the same way. Print shows the colorway’s colors.',
    last: '"epp quilts don’t seem to handle auto map colorations right"',
    to: '/?open_demo=traditional-epp.rrq',
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
