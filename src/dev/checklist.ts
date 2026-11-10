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
    text: 'Rosette editor: Project › EPP › New rosette. Free: pick Hexagon, a ghost follows the mouse and snaps; tap to place seven into a flower, each flush. Drag a piece (Place tool, the hand): within about half an edge it jumps flush to a neighbor, the meeting edges green; it turns at most 30° to fit; it may snap overlapping another piece. Tap the picked card again to stop placing. Grow: hover a free edge (green), picker cards show which shapes fit, tap the edge to attach the picked shape. Placement switch (Free / Grow / Grid) at the top of the sidebar. Grid (the only mode that shows a grid): shapes sit on the grid, but a neighbor’s edge in reach still snaps first; Drag grid moves it until it lines up with a placed corner; Sync grid to selected size follows the Scale slider. Scale 2 pieces snap along 1U ones. Turn a snapped piece (a Honeycomb’s flat top under a Square): each tap turns it the least that keeps an edge flush with the square, so it stays attached. Mirror, Delete. Leave a gap and use Close space: a new shape fills it (an existing shape when it is one); its edges that aren’t whole units come marked. Colorings: paint pieces, New coloring, Copy, remove. Place the Hexagon Flower rosette into another rosette: its pieces are copied in.',
    to: '/project',
  },
  {
    id: 'TC-282',
    group: G.epp027,
    text: 'EPP section: Project › EPP lists your shapes and rosettes, the libraries’ ones below (built-in: Hexagon, Half Hexagon, Honeycomb, Elongated Hexagon, Triangle, Half Square, Square, 60° and 45° Diamond, Kite, Jewel, Pentagon, Octagon; rosettes Hexagon Flower, Double Flower, Six-Diamond Star, Tumbling Block, Octagon and Square). Card menu: Duplicate, Edit a copy (library items), Export (.rrqepp) then Import it into another project, Add to My library, Delete (refused while used). Libraries page: Type › EPP shows them; Copy to My library and Delete from My library. Save and reopen the project: everything comes back.',
    to: '/libraries',
  },
  {
    id: 'TC-283',
    group: G.epp027,
    text: 'Rosette print: a rosette’s Print tab (or Print on its card). 1U length and How many rosettes change the counts (Hexagon Flower × 4 = 28 hexagons). Rosette sheet, Paper templates (finished size) and Fabric templates (with seam allowance) each on or off. Print at 100 % and measure: a 1 in hexagon’s edge is 1 in; a fabric template is one seam allowance larger all round.',
    to: '/project',
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
