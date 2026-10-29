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
    id: 'TC-177',
    group: G.small,
    text: 'Quilt editor › Design › Flip on an On-Point quilt: left↔right mirrors each block across the quilt’s up-down line (as seen on screen), not along the block’s turned diagonal; tap the tool again for top↕bottom, across the quilt’s left-right line. A Straight Set quilt flips as before, also on blocks turned with Rotate. Shaped blocks in turned layouts mirror across the quilt where their shape allows it.',
    last: "\"the flip horizontal / vertical tool flips according to a block's native axis. but if you're in a layout like on point, the flip should actually be according to the quilt's native axis, not the block. so when the quilt and block share a native axis, even in those cases it should still be the quilt's native axis\"",
    to: '/',
  },
  {
    id: 'TC-179',
    group: G.small,
    text: 'Block editor › a data block › Day numerals, with “Next numeral after each tap” on: tap patches to place 1, 2, 3, then Undo. The 3 comes off and 3 is the picked numeral again; Undo again goes back to 2. Redo puts 2 back on with 3 picked, then 3 back on with 4 picked. Picking a numeral by hand, then undoing an earlier tap, also goes back to the numeral that tap had.',
    last: '"in a data block, the undo button doesn’t walk back the “next to be placed numeral” at the same time as walking back placing a numeral"',
    to: '/',
  },
  {
    id: 'TC-180',
    group: G.small,
    text: 'Block editor › a data block › Day numerals: “Clear all numerals” sits right below the numeral buttons, above the help text and the toggles.',
    last: '"the “clear all numerals” button should sit right below the numeral buttons"',
    to: '/',
  },
  {
    id: 'TC-181',
    group: G.small,
    text: 'Block editor › a data block: pick a color in the tray (e.g. a Basic color), then pick a day numeral. The color is no longer shown as picked; only the numeral is. Picking a color again unpicks the numeral. Open an ordinary block or the quilt editor after picking a numeral: the tray’s picked color shows again and taps paint it.',
    last: '"in a data block, when you select a numeral for painting, the currently selected color (such as a color in the built in basic colors) doesn’t get unselected"',
    to: '/',
  },
  {
    id: 'TC-184',
    group: G.data046,
    text: 'A Weeks data quilt › Design › Blocks › Data blocks: pick a week block, tap three spaces (Wk 1, Wk 2, Wk 3; the highlight moves on). Click Wk 2 in the list and tap another space: Wk 2 now lists two blocks. Tap a placed space with nothing changed: it comes off. With another numeral highlighted it takes that numeral; with another block picked it takes that block; with both, both. No drag and drop, no move arrows and no “Block N” in the list or on the quilt.',
    last: '"we should be able place multiple blocks to address the same numeral" / "if you change the block but have the same numeral selected as is already present, then you just change the block…"',
    to: '/',
  },
  {
    id: 'TC-190',
    group: G.data046,
    text: 'A data quilt with two values (High and Low, Data tab). Pick a single-value block: under Place numbers, Value shows qA qB qC qD as in the block editor (qC and qD grayed out; hovering names High and Low). Place one with qA and one with qB: the quilt shows Wk 1 over qA and Wk 2 over qB, and the qB block’s pieces follow the Low values. A block whose numerals use A and B has a row for each (Block A shows, Block B shows); mapped crosswise it reads qB, qA under its number. A block needing more values than the quilt has says so and isn’t placed.',
    last: '"not seeing the data series picker like we have in block design"',
    to: '/',
  },
  {
    id: 'TC-186',
    group: G.data046,
    text: 'Order line with repeated numbers. Quilt: put Wk 2 on two spaces: the line from Wk 1 branches to both, and both join Wk 3. Put Wk 1 on two spaces as well: each Wk 1 joins its nearest Wk 2. Block editor › a data block › Color: put numeral 3 on two patches: the line branches the same way.',
    last: '"(in both data block design and data quilt design) since we expect there may be several instances of a given numeral…"',
    to: '/',
  },
  {
    id: 'TC-188',
    group: G.data046,
    text: 'Leap day: a Weeks quilt from 1 January 2028. Details › Data quilt shows Leap day (hidden for 2027 and for Months). Extra single-day number: the list runs Jan 1, Wk 1 … Wk 52, Dec 31. Use a 2-day block variant: the last number is Dec 30–31 and a week block’s 2-day variant (Draw tab › Variant › 2 days) shows there. Average and Ignore: 53 numbers, and the Entries dialog marks Feb 29 “Averaged into Feb 28” or “Not shown in the quilt”. With a category value (Mood) and Average, Categories round (Down / Up) appears. A Days plan offers Average, Ignore and Extra; switching to Ignore with a block on Feb 29 asks first.',
    last: '"let’s have the leap year question be a setting in the details / data quilt section" / "for day mode, let’s give the user the option between “average feb 28 & feb 29”…" / "no let’s just have this as a setting for the whole quilt for any category series"',
    to: '/',
  },
  {
    id: 'TC-189',
    group: G.data046,
    text: 'Open the 0.7.0 demo (download below): its Data Quilt keeps its 12 months on the same spaces with the same blocks. A project saved by this build opens with its placements, series and Leap day setting as saved. A block file or library with a 2-day variant opens here (older apps say it’s from a newer RRQuilts).',
    to: '/',
    file: 'demo-v9.rrq',
  },
  {
    id: 'TC-191',
    group: G.data046,
    text: 'Data quilt › Design › Blocks: place three blocks (Next moves Wk 1 → Wk 4). Undo: the last block comes off and Next goes back to Wk 3; Undo again: Wk 2. Redo puts the block back and Next on Wk 3.',
    last: '"undo doens’t go back a step in the numerals while it undoes a block placement"',
    to: '/',
  },
  {
    id: 'TC-192',
    group: G.data046,
    text: 'A data quilt with two values: in Blocks, pick qB, then pick another data block (and another): Value stays on qB. A block with several values keeps each row’s choice when you switch between such blocks.',
    last: '"switching block selection shouldn’t switch series selection back to qA"',
    to: '/',
  },
  {
    id: 'TC-193',
    group: G.data046,
    text: 'Weeks quilt › Design › Blocks: under Day blocks, a week block with a 1-day variant is pictured as its 1-day variant, not the 7-day drawing (a Days plan’s week and month blocks too).',
    last: '"day blocks should show the one-day variant of the block, not the 7 day variant"',
    to: '/',
  },
  {
    id: 'TC-194',
    group: G.data046,
    text: 'A data quilt with two values: place Wk 1–3 with qA and Wk 1–3 again with qB. Two order lines in two colors, each joining only its value’s blocks (no line from a qA block to a qB one). A block showing both values sits on both lines.',
    last: '"tracings should only consider blocks or patches that are in the same series (only A or qA, B or qB, etc)"',
    to: '/',
  },
  {
    id: 'TC-195',
    group: G.data046,
    text: 'Quilt editor › Design, middle-click: on a placed data block, Blocks › Data blocks picks its block, its Value(s) and its number as Next; on an ordinary block, its block is picked (Set) and the clicked patch’s color; on a sash, border or plain patch, its color (Colors tab, Paint). A middle-button drag still pans, and picks nothing.',
    last: '"middle clicking a data block should select it’s series, block, and data slot. middle clicking a regular block should select its fabric/color and block. middle clicking a patch should select its color/fabric." / "(but make sure middle-click-drag keeps working)"',
    to: '/',
  },
  {
    id: 'TC-196',
    group: G.data046,
    text: 'A Weeks quilt over 2027 with blocks on Wk 1, Wk 2, Wk 3. Pick a day block (or a week block under Day blocks) and tap the Wk 1 space: it asks, then that space is Jan 1 and the old Wk 2 and Wk 3 blocks read Wk 1 and Wk 2. Tap Wk 52’s space with a 1-day block: it asks, and the blocks shift back (Jan 1 → Wk 1, Wk 1 → Wk 2), that space being Dec 31. With the single day at the end, a week-picked block (Week blocks) on the Dec 31 space asks to move the single day to the start and makes that space Wk 52 (it isn’t cleared). A week-picked block tapped on another single day says to pick it under Day blocks.',
    last: '"changing wk1 to jan 1 should bump each of the other blocks backwards 1 slot (so wk2 moves to wk1, wk3 moves to wk2). changing wk52 to dec31 should scoot the blocks back the other way." / "I picked the same block but the 7 day variant and clicked on the dec 31 block in the quilt and instead of asking if I wanted to move the single-day one to be the frist slot, it just cleared that block in the quilt"',
    to: '/',
  },
  {
    id: 'TC-198',
    group: G.data046,
    text: 'Put three or more blocks on one number: its row in the list grows to more rows of blocks, with no scrollbar and nothing clipped.',
    last: '"when the scrollbar gets added to a slot in the sidebar, it causes the blocks & slot labels to clip. we should instead just add a row for the extra blocks"',
    to: '/',
  },
  {
    id: 'TC-199',
    group: G.data046,
    text: 'A data quilt with two values, Wk 1–3 placed with qA and again with qB. With qB picked, click Wk 2 in the list: the Wk 2 qB block lights up once at full glow, the Wk 2 qA block with a slight glow. With Wk 2 highlighted, click qA: Wk 2 qA at full glow, Wk 1 and Wk 3 qA slightly. Each is one quick flash.',
    last: '"clicking on a data slot or series label should briefly flash all members of that slot or label" / "single quick flash, not multiple" / "the members of the series or numeral should flash with a slight glow but the blocks that match both the currently selected data slot _and_ series label should flash with a glow intensity that we’re currently using"',
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
