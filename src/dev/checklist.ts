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
    text: 'A block quilt’s Design tab: Save as new colorway, then Colors. Mode reads Palette · Auto mapping · Re-color. Choose Re-color: the palettes show under it, starting from the colors the colorway showed. Paint one patch with Apply to This, then All and Alternate, and try Spray, Swap and the eyedropper. Show the primary: it hasn’t changed. The Print tab and the quilt card show the re-color while it’s shown. Save and reopen: it’s kept.',
    last: '"let’s add a new colorway mode for quilts that’s an outright re-coloring and allows for setting the color of any patch in any block as you would in the primary colorway. we’ll call it “re-color” in the toggle that currently has “manual” (let’s rename to palette) and “auto map”"',
    to: '/',
  },
  {
    id: 'TC-353',
    group: G.recolor,
    text: 'In a re-color: set a different block in one space from the primary, and the re-color shows the primary’s colors there until painted. Redraw a placed block’s seams (block editor): the re-color keeps its colors. Switch Mode back to Palette: it asks, then the earlier mapping returns. New colorway from palette… offers Re-color too. Delete the primary while a re-color is next: the quilt takes the re-color’s colors. A data quilt or an EPP quilt offers only Palette and Auto mapping.',
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
