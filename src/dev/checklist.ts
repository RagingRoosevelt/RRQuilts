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
    id: 'TC-099',
    group: G.small,
    text: 'Data places (spec 025), block editor › Color › Data places: turn on Number pieces, Days 1–31. Paint numbers pieces 1, 2, 3… in the order tapped (gray, with numbers and an order line); tap a numbered piece to take its number back (its color returns, Next shows it). Spray with Rows, Columns or Snake numbers every piece of the tapped piece’s color in that order. Value B numbers a second set (its own line). Eyedropper on a numbered piece picks its set and value. Picking a color turns numbering off. Undo undoes each.',
    to: '/',
  },
  {
    id: 'TC-100',
    group: G.small,
    text: 'Data quilts (spec 025): Start a quilt with Data quilt on (12 months): it opens on a Data tab (Months, period from next 1 January, Sample data). An existing quilt: Layout › Data quilt switch adds the Data tab; switching it off hides the tab and the pieces show their designed colors; on again keeps the settings.',
    to: '/',
  },
  {
    id: 'TC-101',
    group: G.small,
    text: 'Data tab › Where the days go: Months, then Rows / Columns / Snake numbers the block spaces Jan to Dec with an order line (tap one to take its number back). Pick a block with day places (numbered in the block editor) for each month length: every numbered space shows it in the sample year’s colors; days a month doesn’t reach show the filler (or as designed). With two blocks for a length, Shuffle changes which space gets which.',
    to: '/',
  },
  {
    id: 'TC-102',
    group: G.small,
    text: 'Data tab › Values: change Kind (Temperature, Mood, Hours of daylight, Rainfall, Custom) and the ranges or categories and their colors: the quilt recolors at once. Add a value (a second temperature becomes Low with the daily low sample). Year days: tap pieces or sashes to give them day 1, 2, 3… of the period (labels Y1, Y2 and a line); tap again to take back. Warnings list months on two spaces, missing months and days without a place.',
    to: '/',
  },
  {
    id: 'TC-103',
    group: G.small,
    text: 'Data tab › Sample data › CSV…: open a CSV file (or paste rows: date, then values); the date column is found and each value is matched by its label; rows without a date are counted as skipped. Use as sample data: the quilt shows it (a 2019 sample matches a 2027 quilt by day of the year). Switch back to the built-in sample year and to the CSV again.',
    to: '/',
  },
  {
    id: 'TC-104',
    group: G.small,
    text: 'Real data: Import (CSV or pasted rows) fills those days; Table lists every day with a field per value (numbers, or a list for Mood); typing a value recolors its piece; Missing lists days without an entry up to today; Today’s entry opens today (or says today isn’t in the period). With Where the days go on Off, tapping a day’s piece opens the table on that day. Days without an entry show as designed, the sample, or the filler, as chosen.',
    to: '/',
  },
  {
    id: 'TC-105',
    group: G.small,
    text: 'Print a data quilt: the quilt picture has a legend under it (each value with its colors: under 10 °F, 10 to 20 °F… 100 °F and up). Yardage says it is a worst case and counts each range’s most days expected: Data tab › Yardage lists each range with its days in the sample as the placeholder; typing a number changes the printed yardage. Places with no month number yet don’t show in yardage.',
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
