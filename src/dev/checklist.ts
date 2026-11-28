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

/** A sub-case of a check: its name and its own steps. */
export interface StepCase {
  case: string;
  steps: string[];
}

/**
 * A manual check. Written as (owner, 2026-11-26): `text`, a short given-when-then; `steps`, the
 * high-level steps to run it (one list, or several sub-cases each with its own); `expect`, the
 * expected outcome; `last`, the owner's note that asked for it. Older checks have `text` only.
 */
export interface Check {
  /** TC-###. */
  id: string;
  group: string;
  /** Given-when-then, short (older checks: the whole check). */
  text: string;
  steps?: string[] | StepCase[];
  /** What should happen. */
  expect?: string;
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
  span057: 'Blocks over several spaces (spec 057)',
};

export const CHECKS: Check[] = [
  {
    id: 'TC-188',
    group: G.data046,
    text: 'Given a Weeks data quilt that covers a leap day, when you choose how Feb 29 is handled in Details › Data quilt, then the numbers and the Entries dialog follow that choice.',
    steps: [
      {
        case: 'Weeks in 2028',
        steps: [
          'Start a data quilt by weeks from 1 January 2028.',
          'Open Details › Data quilt and find Leap day.',
          'Choose Extra single-day number and look at the list of numbers.',
          'Give the week block a 2-day variant (Draw tab › Variant › 2 days).',
          'Choose Average, then Ignore, and each time open the Entries dialog on Feb 29.',
        ],
      },
      {
        case: 'Category values',
        steps: ['Add a category value such as Mood, with Leap day on Average.'],
      },
      {
        case: 'Other years and plans',
        steps: [
          'Change the start to 2027, then the plan to Months.',
          'Change the plan to Days, place a block on Feb 29, then choose Ignore.',
        ],
      },
    ],
    expect:
      'Leap day shows only when the quilt covers Feb 29 (not for 2027 or Months). Extra: the numbers run Jan 1, Wk 1 … Wk 52, Dec 31; with the 2-day variant the last number is Dec 30–31 and shows that variant. Average and Ignore: 53 numbers, and Entries marks Feb 29 “Averaged into Feb 28” or “Not shown in the quilt”. With a category value and Average, Categories round (Down / Up) appears. A Days plan offers Average, Ignore and Extra, and switching to Ignore with a block on Feb 29 asks first.',
    last: '"let’s have the leap year question be a setting in the details / data quilt section" / "for day mode, let’s give the user the option between “average feb 28 & feb 29”…" / "no let’s just have this as a setting for the whole quilt for any category series"',
    to: '/',
  },
  {
    id: 'TC-387',
    group: G.span057,
    text: 'Given a block quilt and Set block, when you choose a Block size and point at the quilt, then the spaces a block that size would cover light up, and a tap places it there.',
    steps: [
      {
        case: 'Straight Set',
        steps: [
          'Make a 6 × 6 Straight Set quilt with sashing and pick a block in the tray.',
          'Under Apply to, set Block size to 2U, then 3U (slider, or − and +).',
          'Point at different spaces, then tap.',
        ],
      },
      {
        case: 'Other layouts',
        steps: [
          'Try the same in an On-Point quilt, a Shaped Blocks quilt of triangles, and one of diamonds.',
          'Try a Shaped Blocks quilt of hexagons.',
        ],
      },
    ],
    expect:
      'The quilt is drawn with the block over the lit spaces, outlined, and the line under the quilt says “2U · 4 spaces” (and “replaces N blocks” over placed ones). A tap places it: one block at twice (three times) the size, covering the sashing and cornerstone inside, with the sashing around it in line. Triangles make triangles of 4 or 9, diamonds diamonds of 4 or 9. Hexagons show no Block size and no Split tool. Near the edge, the block lights where it fits.',
    last: '"ok, I like the way that feels.  let’s migrate that learning into the app" (prototype D: "As you drag to increase the size the slider will match the current size" / "after placing, the size slider should return to whatever size it was before your placement")',
    to: '/',
  },
  {
    id: 'TC-388',
    group: G.span057,
    text: 'Given Set block, when you drag across the quilt, then the block grows from the space you pressed, Block size follows, and it goes back once the block is placed.',
    steps: [
      'With Block size at 1U, press on a space and drag two spaces right and down; let go.',
      'Set Block size to 2U, then drag from a space up and to the left.',
      'On a phone or tablet, drag with one finger, and tap without dragging.',
    ],
    expect:
      'While dragging, the lit block grows from the pressed space (it stays a corner) and the slider shows its size (3U for two spaces across). After letting go the block is placed and the slider is back where it was (1U, then 2U). A drag can make a block smaller than the slider. On touch, a drag grows the block and a tap places one at the slider’s size.',
    last: '"ok, I like the way that feels.  let’s migrate that learning into the app" (prototype D: "As you drag to increase the size the slider will match the current size" / "after placing, the size slider should return to whatever size it was before your placement")',
    to: '/',
  },
  {
    id: 'TC-389',
    group: G.span057,
    text: 'Given blocks that fill several spaces, when you replace, split, erase, rotate, use Apply to All, undo, and change the layout, then each keeps to its rules.',
    steps: [
      'Set a 2U block over four placed blocks, then a 1U block on one of its spaces.',
      'Set a 2U block again, then use Rotate, Flip and Paint on it.',
      'Pick Split spanning block and tap it; then Undo.',
      'With Block size at 1U and Apply to All, set another block.',
      'In Layout, make the quilt smaller so a big block no longer fits; then save and reopen the project.',
    ],
    expect:
      'The 1U block takes the whole big block out (the others it covered stay empty). Rotate, Flip and Paint work on the big block as on any block. Split leaves the block in its first space only, the sashing inside comes back with its fabric, and Undo makes it big again. Apply to All changes every block but big ones stay big. A big block with no room left goes back to its first space. Reopened, everything is as it was.',
    last: '"ok, I like the way that feels.  let’s migrate that learning into the app" (prototype D: "As you drag to increase the size the slider will match the current size" / "after placing, the size slider should return to whatever size it was before your placement")',
    to: '/',
  },
  {
    id: 'TC-391',
    group: G.span057,
    text: 'Given the app just opened, when you drag a block bigger with Set and let go, then Block size goes back to a number, never “NaNU”.',
    steps: [
      'Reload the page, open a block quilt, pick a block and drag across two spaces.',
      'Let go and look at the Block size label.',
    ],
    expect: 'The label shows 1U again (or the size the slider had before the drag).',
    last: '"the first time you load up there’s a nanU block size that shows up after placed a dragged block"',
    to: '/',
  },
  {
    id: 'TC-392',
    group: G.span057,
    text: 'Given a quilt with the same block at 1U and at 2U, when you print it, then each size has its own block page and templates, and cutting and yardage count the 2U at its big size.',
    steps: [
      'In a quilt, set a block at 2U and the same block at 1U somewhere else.',
      'Open the Print tab with Block pages, Templates, Rotary cutting and Yardage.',
      'Look at the Layout gallery’s Spanning blocks section (Tests tab, G034 to G037).',
    ],
    expect:
      'Two block pages for that block: one at the 1U finished size counting the 1U blocks, one at the 2U size (twice the block plus the sashing inside) counting the 2U ones, each with its own templates and key letters. The rotary chart and yardage include the 2U pieces at their size. The gallery quilts look as each card says.',
    last: '"please check that" (printing)',
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
