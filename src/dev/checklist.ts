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
    id: 'TC-151',
    group: G.small,
    text: 'Design › Data › Values ranges: type a number and press Enter (or leave the field): nothing moves while typing. Set a range’s start past its own end (High: change 70 to 85 when it ends at 80): its end becomes 86 and every range after it moves up as needed, each at least 1 wide; a small number pushes the ranges before it down the same way. Undo puts them back.',
    last: '"if you put a value high enough or low enough, you might actually impact several values, not just the immediate one before or after. if I change a low from 70 to 85 but high was 80, then not only should the high below me change, but my own high should change. values should be adjusted so that there\'s at least a gap 1 between low and high of a value map entry."',
    to: '/',
  },
  {
    id: 'TC-152',
    group: G.small,
    text: 'Data quilt with sashing, cornerstones and a border: in Design › Blocks (Data blocks or Other blocks, any tool) the pointer over sashing, cornerstones or the border outlines nothing, over a block space it glows. In Design › Data only spaces holding a number glow (not a space painted as a patch). In Design › Colors everything still glows as you paint it.',
    last: '"the glow shows up when hovering over sashing or the border, probably also cornerstones. sometimes the glow appears over a block painted as a patch"',
    to: '/',
  },
  {
    id: 'TC-153',
    group: G.small,
    text: 'Project › Blocks › a library block’s ⋮ › Create a coloration variant, the first time and again later: it opens the variant’s Color tab on a new coloring (named like a new one, a copy of the library block’s first coloring), not on the library’s coloring. The banner’s Create a coloration variant does the same.',
    last: "\"in the project block view when you select create a color variant from the block's context menu, although it lands you in that block's color tab, it doesn't have a new variant created for you to edit, it has the library variant selected and you have to click on save as new variant.\"",
    to: '/',
  },
  {
    id: 'TC-154',
    group: G.small,
    text: 'Libraries › Palettes › Color card: the hue strip and every slider have room at both ends (about 1 rem), so the end thumbs and their labels aren’t cut off; there is space between the ± slider and the Value switch, and between the Value slider and the Saturation switch. The last switch reads Hide non-matching swatches.',
    last: '"the sliders need padding of at least ~1rem to the left and right. give some spacing between the hue width slider and the value switch and between the value slider and the saturation switch. "Only matching swatches" should say "hide non-matching swatches""',
    to: '/',
  },
  {
    id: 'TC-155',
    group: G.small,
    text: 'New colorway from palette… (Design › Colorways or the quilt card’s menu) with a non-primary colorway shown: the rows and the Before picture are the primary colorway’s colors, and the new colorway (Manual or Auto mapping) maps from the primary; an auto one Follows the primary. The Palette list shows each palette’s swatches under its name, and the picked palette’s swatches show under the field.',
    last: '"we need some way to see the palette preview. maybe show icons for each of the colors under the palette name? when making a colorway mapping, all mappings, regardless of which is selected at the time the "new colorway from palette" button is clicked, should be mapped from the primary colorway"',
    to: '/',
  },
  {
    id: 'TC-156',
    group: G.small,
    text: 'Quilt editor › Layout › Style: Shaped Blocks shows its triangle, diamond and hexagon badges in the list and, when chosen, in the field (as on its wizard card, which looks as before).',
    last: '"we didn\'t show the shape badges for the quilt layouts that can take several shapes"',
    to: '/',
  },
  {
    id: 'TC-157',
    group: G.small,
    text: 'Number labels: a Weeks plan’s list and quilt read Wk 1, Wk 2… (with Week of Jan 1… beside them in the list), its left-over days their date (Dec 31); a Days plan reads Jan 1, Jan 2… Months still read Jan, Feb… Warnings use the same labels.',
    last: '"like we use the month shortnames for month data quilts, we should use "Wk#" as the label for the times slots in a week quilt. on a day quilt, we should only show the month short name and day (eg Jan 2, Oct 18, etc)"',
    to: '/',
  },
  {
    id: 'TC-158',
    group: G.small,
    text: 'The built-in Month Strip is square (31 upright bars), so its card in Design › Blocks › Block types and its Libraries picture read as a square. Its 30, 29 and 28-day versions are variants of it (Draw tab › Variant), not blocks of their own.',
    last: '"the thumbnail for the month strips should be more square. maybe make the blocks square instead of rectangular? and those blocks should be implemented as variants now that we have the variant concept." / "I would think the block should just be square with strips instead of that wide rectangle"',
    to: '/',
  },
  {
    id: 'TC-159',
    group: G.small,
    text: 'Design › Blocks numbers list: rows are close together (about 44 px each, small thumbnails), and the list has no scroll box of its own: it scrolls with the sidebar, Days (365 rows) too. Block types, Numbers (Blocks tab) and Period, Data, Values, Yardage, Places without data (Data tab) fold away by their labelled line, and stay folded when you come back; the Colors tab’s sections fold as before.',
    last: '"the value labels are weird. there\'s a ton of vertical space between the labels when in month mode" / "in a data quilt, the design/blocks shouldn\'t use a scroll for the number pickers. have all sections in blocks, colors, and data be collapsible"',
    to: '/',
  },
  {
    id: 'TC-160',
    group: G.small,
    text: 'Design › Data › Values: each value’s Sample only offers series of its Kind (Temperature: Daily high, Daily low; Mood; Hours of daylight; Rainfall; Custom any). Each value’s days-in-the-sample chart sits right above its own ranges or categories.',
    last: '"Why can I pick a "rainfall" sample while the "temperature" kind is selected?" / "The frequency histograms should sit right above the value they correspond to. right now both histograms sit right under the values label"',
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
