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
  ui0100: '0.10.0 other changes',
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
    id: 'TC-401',
    group: G.span057,
    text: 'Given a Shaped Blocks quilt of triangles, when you drag from a point-up triangle down across the rows, then the big triangle stays point-up the whole way.',
    steps: [
      'Make a Shaped Blocks quilt of triangles and pick a triangle block.',
      'Press on a point-up triangle and drag down onto the point-down triangle below it, then on to the next row.',
      'Do the same from a point-down triangle, dragging up.',
    ],
    expect:
      'Over the point-down triangle the lit block stays the one triangle you pressed. Once the pointer reaches the next row down, a point-up triangle of 4 lights, and it grows point-up from there. From a point-down triangle, every big triangle is point-down.',
    last: '"Ran into an issue on shaped blocks/triangles where dragging from a point-up triangle, past a point down triangle (row below) caused the orientation of the mulit-slot block to flip. the multi-slot block should stay the orientation of the block I started with as I expand. that means that there shouldn’t be a multi-slot block proposed until I’ve dragged down to the next row that has a point-up orientation"',
    to: '/',
  },
  {
    id: 'TC-402',
    group: G.ui0100,
    text: 'Given the block editor on a phone, when you pick Delete seams and tap a seam, then that seam is taken out.',
    steps: [
      'Open one of your own blocks (or make one) in the block editor, Draw tab.',
      'Pick Delete seams (the eraser in the tool rail) and tap a seam; then Undo.',
      'With a mouse, point at seams with Delete seams on.',
    ],
    expect:
      'The tapped seam is gone and the patches beside it join; Undo brings it back. With a mouse, the seam under the pointer lights up before you click. Library blocks can’t be changed this way, as with the other drawing tools.',
    last: '"we should add a delete tool to the block editor so that edges can be deleted from blocks while on mobile"',
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
