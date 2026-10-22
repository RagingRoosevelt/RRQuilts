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
    id: 'TC-093',
    group: G.small,
    text: 'Settings › Quilt and block design › Sorted palettes lists each sorted palette (name, where it is, its sort) with Clear. Delete a sorted project palette, remove a pack with a sorted palette, or delete a sorted My library palette: it leaves the list.',
    to: '/',
  },
  {
    id: 'TC-103',
    group: G.small,
    text: 'Design › Data › Sample data › CSV…: open a CSV file (or paste rows: date, then values); the date column is found and each value is matched by its label; rows without a date are counted as skipped. Use as sample data: the quilt shows it (a 2019 sample matches a 2027 quilt by day of the year). Switch back to the built-in sample year and to the CSV again.',
    to: '/',
  },
  {
    id: 'TC-161',
    group: G.small,
    text: 'Data quilt Design › Blocks: Data blocks · Other blocks at the top. Other blocks shows your usual blocks (no data blocks) with This/All/Alternate; tap a space without a number: the block goes there and stays. Tap a numbered space: the block goes there and that number comes back to the list (Next moves to it). Data blocks goes back to Place numbers.',
    last: '"I should be able to place non-data blocks in a data quilt"',
    to: '/',
  },
  {
    id: 'TC-162',
    group: G.small,
    text: 'Print a Weeks data quilt that uses a week block with a 1-day variant (or a Months quilt with the Month Strip): the block pages print every variant shown, Week Row and Week Row (1 day), Month Strip and Month Strip (30 days), (28 days).',
    last: '"there is only one of the variants of the week block I used visible in the printout"',
    to: '/',
  },
  {
    id: 'TC-163',
    group: G.small,
    text: 'Quilt Details › Data quilt section, with the switch off and on: room above the labelled line and below the description, so it doesn’t crowd the fields above or Download image below. Block Details’ Data block section the same.',
    last: '"the label for data quilt switch needs more margin above and below it. when off, it feels squished against the things above and below it"',
    to: '/',
  },
  {
    id: 'TC-165',
    group: G.small,
    text: 'Libraries › Palettes › Color card: the Hue, Value, Saturation and Hide non-matching swatches switches line up with the sliders (same left edge) and aren’t cut off by the sidebar edge, on or off; the ± and the fabrics note line up too.',
    last: '"the switches also look like they need padding (should be left-aligned with the ranges) since they get cut off by the edge of the sidebar when turned off"',
    to: '/',
  },
  {
    id: 'TC-166',
    group: G.small,
    text: 'Block editor › Color tab of a month data block: Day numerals sit in tight rows (about 32 px each, 5 rows for 31 numerals at a normal width) with Clear all numerals and the switches right under them, no empty space below the numerals. Same for week and day blocks and with a variant picked.',
    last: '"the div that the buttons sit in is showing up as 248px tall even though the buttons inside it are only 28px tall. that means when several of that container are used (as rows) to show a bunch of those numeral buttons, then there\'s a lot of dead whitespace"',
    to: '/',
  },
  {
    id: 'TC-168',
    group: G.small,
    text: 'Weeks plan, Design › Blocks list: each row reads just Wk 1, Wk 2… (no "Week of Jan 1" beside it); left-over days read their date.',
    last: '"let\'s cut the "Week of <MTH> #""',
    to: '/',
  },
  {
    id: 'TC-169',
    group: G.small,
    text: 'Quilt Details › Plan with weeks placed (Weeks, Fill empty numbers Rows), switch to Months: a dialog says how many placed blocks can’t stay and will be taken off; Switch does it (week blocks leave, spaces empty; Undo brings them back), Cancel keeps Weeks. With nothing that has to go (nothing placed), it switches without asking. It never stays stuck on Weeks.',
    last: '"If the app is going to block me switching to month mode from week mode (I assume becaues it is going to remove blocks), then it either needs to show me a tooltip or show a dialog mentioning that blocks will be removed and am I ok with it."',
    to: '/',
  },
  {
    id: 'TC-170',
    group: G.small,
    text: 'Design › Data › Values › Sample, by Kind: Temperature offers Daily high and low for the temperate place, Fairbanks, Alaska (cold winters, below 0 °F) and Honolulu, Hawaii (80s all year); Mood: Mood (1 to 5), mostly low with good days, an optimist with bad days; Rainfall: temperate, Hilo, Hawaii (rain most days), Phoenix, Arizona (dry, a few summer storms); Hours of daylight: temperate, Fairbanks (about 4 to 22 h), Austin, Texas. The histogram and quilt change with each.',
    last: "\"let's add a few more samples of each type. let's do a high / low for alaska and hawaii. let's do mood for a depressed person who sometimes has good days and for an optimist who sometimes has bad days. let's do rain for hawaii and arizona. and let's do hours of sunlight for alaska and texas\"",
    to: '/',
  },
  {
    id: 'TC-171',
    group: G.small,
    text: 'Block editor › Color tab: moving the mouse over a patch outlines it with a glow (magenta with the default tint; a patch holding a day numeral orange), gone when the mouse leaves the block. Draw tab: no patch glow.',
    last: '"let\'s turn glow on for patches in the block editor, too"',
    to: '/',
  },
  {
    id: 'TC-172',
    group: G.small,
    text: 'Glow in every quilt (data or not), Design and Layout: hovering any part outlines it, in one of three colors spread round from the reference overlay’s tint: data blocks one (orange with the default blue tint); spaces that take blocks another (magenta), including On-Point setting triangles, cut-down edge spaces and square cornerstones; and patch-only parts (sashing, borders, strips, One Patch pieces) the third (green). Change the overlay tint: all three move with it and none is close to it.',
    last: '"you\'re coloring the split blocks that fill in to make a straight edge as patches in terms of the glow color they get assigned. the patch glow should apply for spaces that only patches are allowed in"',
    to: '/',
  },
  {
    id: 'TC-173',
    group: G.small,
    text: 'Palette swatches, 22 × 22 px, under each palette in the list and under the field once one is picked: New colorway from palette… (dialog), and in the Design sidebar’s Colors tab of a non-primary colorway: Palette (Auto mapping) and Pick from (Manual).',
    last: '"we should make the swatch preview images larger in both the dropdown and when the dropdown selection is shown. I think 22x22 would match what we\'re doing in the mapping dropdowns right below?" / "we need to mak that update in the sidebar version of this dropdown too"',
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
