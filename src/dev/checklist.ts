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
  make041: 'Data Quilts: data entry and next steps (spec 041)',
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
    id: 'TC-238',
    group: G.swirl025,
    text: 'Libraries › Data: Month Swirl, Week Swirl, Hexagon Month Swirl and Hexagon Week Swirl, each a spike per day spiraling out clockwise from the top, each tip at the outer corner of the next day’s spike. In the block editor, Variant › 30, 29 and 28 days shows that many spikes, none black. Make a Months data quilt with Month Swirl and a Weeks one with Week Swirl, enter some values: each day colors its own spike, day 1 at the top. A Shaped Blocks quilt with hexagons takes the hexagon swirls the same way.',
    last: '"can you implment this as a set of temperature blocks? do one as a hexagon and one as a square block. do a copy for 7day and one for 28/29/30/31 days." / "on the spirals, the tip of the triangle should align with the edge corner of the next patch as the patches spiral out"',
    to: '/libraries',
  },
  {
    id: 'TC-239',
    group: G.swirl025,
    text: 'Libraries › Data: Month Pinwheel, Week Pinwheel, Hexagon Month Pinwheel and Hexagon Week Pinwheel, like the swirls but every spike the same distance from the center, its tip touching the middle of the next spike’s side. On the hexagon ones each spike runs from a quarter to three quarters of the way out to a corner, and the square ones sit at the same distances from the center. Variant › 30, 29, 28 days keeps them level. In a data quilt each day colors its own spike, day 1 at the top.',
    last: '"let\'s do non-spiral ones. each data patch will be at the same radius out from the center as its neighbors" / "have the spike side of the triangle sit at the midpoint of it\'s neighbor\'s edge for the pinwheel data blocks" / "on the hex, we want the triangles on the corners to start at the r=1/3 and extend to r=2/3" / "hm, let\'s try at 1/4 and 3/4" / "yeah, we want to use the same r values (from the center) for the square blocks"',
    to: '/libraries',
  },
  {
    id: 'TC-240',
    group: G.swirl025,
    text: 'Libraries › Data: Quartered Month Pinwheel looks like the photo: four quarters, each a fan from a point on its inner edge, each turned a quarter turn from the last, the spikes all the same size in a ring about the center, tips out, a small white gap between each; the long seam past each tip runs straight on from the spike’s outer side, and that same seam carries on past the spike’s inner corner to touch the next spike’s side. The seams below the spikes carry on straight from each spike’s base, landing close together on the edge but not at one point. The pieces inside the ring are convex and four-sided, the last in each quarter too. Each quarter’s first spike lies against the quarter’s edge, its last spike’s tip clear of the edge. Day 1 at the left, going clockwise. Variant › 30, 29, 28 days takes a spike off the later quarters first. In a data quilt each day colors its own spike.',
    last: '"the source image is split into quadrants and is assembled differently than we\'ve designed... let\'s make an additional set of square blocks that match the origional image" / "nope, that doesn\'t look right. the triangles should be in a cirlce similar to the pinwheel we already implmented, but the four sub-blocks are constructed differently" / "the inner most patches aren\'t triangles. they are four-sided" / "the first trianlge (traveling clockwise) in each sub block has it\'s edge tight up against the sub-block edge. the tips of the trinagles don\'t touch the sub-block edge on the last triangles (traveling clockwise). the last/top inner piece is a single patch, not split between a quad and a triangle" / "that quad for the last triangle should still be convex like the rest of them are. you also aren\'t getting the triangles right overall. there\'s a bit of a gap between triangles. and the triangles you\'re drawing are different sizes. all triangles should be the same size" / "the patches for the outside of the triangles share an edge with the triangles, right now you\'re drawing them at an angle to that edge of the triangles" / "that edge should continue until it intersects the next triangle block rather than bending at the tip of the trinagle." / "in the source image, it\'s the edges from the outer patches that extend to touch the next triangle\'s flat edge, not the patches from the inside of the block" / "the edges extending down from the triangles don\'t all converge at the same point. those edges should also be aligned to the edge of the triangle they share that corner with"',
    to: '/libraries',
  },
  {
    id: 'TC-241',
    group: G.swirl025,
    text: 'Libraries › Data: Quartered Week Pinwheel, the quartered pinwheel with two larger spikes in each quarter, eight evenly round the ring. The bottom spike is plain; days 1 to 7 run clockwise from it, day 1 at the bottom left. In a Weeks data quilt each day colors its own spike.',
    last: '"can we attempt to make a week version?" / "one-week quater (left), but with the triangles a bit larger and more spaced out" / "try to space them relativly evenly around the circle. so at like 0 and 45 degrees, not 0 and 30." / "let\'s make the bottom patch be the non-data block"',
    to: '/libraries',
  },
  {
    id: 'TC-242',
    group: G.swirl025,
    text: 'Every swirl and pinwheel data block (square, hexagon, quartered, and the month variants) has values A, B and C: the block editor’s Value shows the spikes as A, the pieces on their inner side as B, those on their outer side as C, each with its spike’s day. In a data quilt with qA, qB and qC each colors by its own value; in one with only qA, Place numbers › Value sets B and C to qA, and painting over a B or C piece in the quilt gives it a fixed color.',
    last: '"let\'s update each of these spirial and pinwheel data blocks with a second and third series. we\'ll use C for the outer patches and B for the inner patches"',
    to: '/libraries',
  },
  {
    id: 'TC-243',
    group: G.swirl025,
    text: 'With Show traces on (Data filter), data block pictures (Libraries, the project’s Blocks tab, and always in the block pickers) draw the block’s traces, faint (about 40%): a colored line per value through its pieces in day order, a dot on day 1 and an arrowhead at the last day. Other blocks look as before. In the project’s Blocks tab, a data block’s ⋮ › Save image saves the picture without the traces.',
    last: '"let\'s set data blocks to show their traces in the block previews / thumbnailes but not when downloading" / "set the trace opacity to like 40% in thumbnail and preview views" / "and make sure you include the end arrow head"',
    to: '/libraries',
  },
  {
    id: 'TC-244',
    group: G.swirl025,
    text: 'Libraries (Blocks) and the project’s Blocks tab: the sidebar’s Data section starts with a Show traces toggle, above the Data block dropdown, off at first: data block pictures show no traces until you turn it on. The choice is shared by both pages and kept after a reload.',
    last: '"let\'s add a "show traces" toggle to the library and project view, at the very start of the data section in the sidebar, above the "data block" dropdown" / "default the toggle to off"',
    to: '/libraries',
  },
  {
    id: 'TC-245',
    group: G.make041,
    text: 'The nav has Data Quilts right after Project, also with no project open. After opening demo-v10.rrq, Data Quilts lists its two data quilts, each with its picture (only real entries colored), project name, “No entries yet” or “Last entry …”, and an Open badge.',
    to: '/data',
    file: 'demo-v10.rrq',
  },
  {
    id: 'TC-246',
    group: G.make041,
    text: 'Tap a data quilt: the dialog shows the quilt so far, a calendar of the whole period opening on today (or the first day before the period starts), and the day’s form. Enter a few days (Enter moves to the next day): each day gets a dot per value in its range’s color, the picture and “n of 365 days entered” update. The two-value Weeks quilt shows two dots per day.',
    to: '/data',
    file: 'demo-v10.rrq',
  },
  {
    id: 'TC-247',
    group: G.make041,
    text: 'In the day form, Cut and Assembled put a scissors and a double check on the day in the calendar; Block assembled (Jan) is saved for the block. Changing the value of a day marked Cut warns that a new value may take another fabric.',
    to: '/data',
    file: 'demo-v10.rrq',
  },
  {
    id: 'TC-248',
    group: G.make041,
    text: 'Next steps: with nothing picked it covers the days entered and not cut; Shift-click a second day to pick a run. The printout lists each day’s value, fabric and pieces (count × letter in fabric), “No entry yet” or “Not on the quilt” where so, then the block’s templates lettered as the table with a key. Tint by fabric splits templates per fabric; Quilt notes (only when the quilt has notes) prints them after the steps. Print gives the same pages.',
    to: '/data',
    file: 'demo-v10.rrq',
  },
  {
    id: 'TC-249',
    group: G.make041,
    text: 'Chrome or Edge: open a saved project with a data quilt, close it (Home › open another, or reload). Data Quilts still lists it; its picture loads at once or after Show (one browser prompt). Enter a day: the card says it waits for the project to open. Open the project: the entry is there and the project shows unsaved changes.',
    to: '/data',
  },
  {
    id: 'TC-250',
    group: G.make041,
    text: 'Unsaved project (never saved, or with unsaved changes) not open: entries made from Data Quilts go into its unsaved changes (Restore shows them). With the project open in another tab, the dialog says the data is kept on this device until the project next opens.',
    to: '/data',
  },
  {
    id: 'TC-251',
    group: G.make041,
    text: 'Home (Chrome or Edge, a recent project with a data quilt): a calendar icon on its row opens the data entry dialog; with several data quilts it asks which. Rows of projects without data quilts have no icon.',
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
