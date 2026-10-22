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
    id: 'TC-103',
    group: G.small,
    text: 'Design › Data › Sample data › CSV…: open a CSV file (or paste rows: date, then values); the date column is found and each value is matched by its label; rows without a date are counted as skipped. Use as sample data: the quilt shows it (a 2019 sample matches a 2027 quilt by day of the year). Switch back to the built-in sample year and to the CSV again.',
    to: '/',
  },
  {
    id: 'TC-105',
    group: G.small,
    text: 'Print a data quilt: the quilt picture has a legend under it (each value with its colors: under 10 °F, 10 to 20 °F… 100 °F and up). Yardage says it is a worst case and counts each range’s most days expected: Design › Data › Yardage lists each range with its days in the sample as the placeholder; typing a number changes the printed yardage. Spaces with no number yet don’t show in yardage.',
    to: '/',
  },
  {
    id: 'TC-107',
    group: G.small,
    text: 'Block editor › Color › Data places: Numbers offers 1 to 31 and 1 to 7 only (Year is gone). Paint numbers pieces 1, 2, 3… in the order tapped; tap a numbered piece to take its number back. Spray with Rows, Columns or Snake numbers every piece of a color. Value B numbers a second set (label 1B, own line). Eyedropper on a numbered piece picks its set and value.',
    last: 'Year days on pieces are gone: in Weeks the leftover days get numbers of their own, drawn from the Days pool ("that sounds right. let\'s proceed").',
    to: '/',
  },
  {
    id: 'TC-108',
    group: G.small,
    text: 'Data quilt switch: Layout › Data quilt (or the wizard’s Data quilt option) opens Design with the tray tabs Blocks, Colors, Data; there is no separate Data tab at the top. The rail has no Set, Erase or Find, and Apply to is hidden on Blocks and Data. Switching it off brings back the usual Blocks tab and tools; on again keeps the numbers and settings. The ? opens Help › Data quilts.',
    last: '"we\'ll replace the current block tab in the design workbench with the block picker that we previously discussed that lived in the data workbench, so now we\'ll handle all the data settings still in the design workbench"',
    to: '/',
  },
  {
    id: 'TC-109',
    group: G.small,
    text: 'Design › Blocks in a data quilt: Place numbers is on and the list shows 001 to 012 (Months) with 001 highlighted. Tap block spaces: each gets the highlighted number (001, 002… on the quilt, joined by a line) and the highlight moves on. Tap 005 in the list, tap a space: it gets 005 and the highlight skips past placed numbers. Tap a placed space: its number comes back and is highlighted. Fill empty numbers Rows / Columns / Snake fills only the empty ones; Clear empties all. Drag a placed number onto another row (or hover it and use its arrows): it takes that label and the rows between shift. Undo undoes each.',
    last: '"we\'ll have a single paintbrush at the top of that list and as we place blocks, the label of the number we\'re placing gets highlighted. we can click on a number label in that list to change where in the number list we start placing from and then continue advancing numbers from there, skipping any numbers that were already placed"',
    to: '/',
  },
  {
    id: 'TC-110',
    group: G.small,
    text: 'Block pools (Design › Blocks): Months shows 31, 30, 29 and 28-day pools; each lists only blocks with at least that many day places (Month Strip 31 in all four, Month Strip 28 only in the 28 pool). January takes a block from the 31 pool only; a placed number whose pool is empty keeps its space as it was and a warning names the pool. Shuffle changes which block each space gets. Layout › Plan › Weeks: the list runs 001 to 052 then 053 (Dec 31, from the Days pool; 054 too in a period holding 29 February). Days: 365 numbers, all from the Days pool (Day Square fits).',
    last: "\"we only allow inclusion in a pool if the block has at least as many slots as the pool is for. then when we pick which block to use in each slot, we're drawing from a pool that corresponds to the number of day slots we need to cover. if we're placing a block january, then we'd only pick from the 31 day pool\"",
    to: '/',
  },
  {
    id: 'TC-111',
    group: G.small,
    text: 'Design › Data (right of Colors): period, sample or real data, Values (Kind, ranges or categories and their colors: the quilt recolors at once), Yardage, places without data. Save as new colorway and show it: Values lists each range or category with its primary color and a picker for what it becomes; picking one recolors only that colorway. Show the primary again: the ranges are editable again.',
    last: '"let\'s add a data tab to the right of the color tab that will hold the value mapping" / "for non-primary color ways, the picked color ranges and primary color for that range are shown, as well as a dropdown for the mapped color."',
    to: '/',
  },
  {
    id: 'TC-112',
    group: G.small,
    text: 'Real data (Design › Data, Real data): Import fills those days; Table lists every day with a field per value; typing a value recolors its piece; Missing lists days without an entry up to today; Today’s entry opens today. With the Data tray tab open, tapping a day’s piece opens the table on that day. Days without an entry show as designed, the sample, or the filler, as chosen.',
    last: 'Moved with the rest of the data settings into the Design tab ("so now we\'ll handle all the data settings still in the design workbench").',
    to: '/',
  },
  {
    id: 'TC-113',
    group: G.small,
    text: 'Built-in data blocks: the Data category has Month Strip 28, 29, 30, 31, Week Row and Day Square (one place). In a Months quilt pick Month Strip 31 for the 31 pool and Month Strip 28 for the 28 pool: February shows Month Strip 28. Help › Guides › Data quilts describes the number list, pools and the Data tab, with no year days.',
    last: 'Day Square added for the Days pool ("Days mode works the same way as Months and Weeks", agreed: "that sounds right. let\'s proceed").',
    to: '/',
  },
  {
    id: 'TC-114',
    group: G.small,
    text: 'Layout tab of a data quilt: Plan (Months, Weeks, Days) sits under the Data quilt switch, with a line saying what each number stands for; it is hidden while the switch is off. Switching to Weeks makes Design › Blocks list 001 to 053; back to Months keeps the first 12 placed and the period starts on the 1st. Design › Data no longer shows Plan. Undo undoes the switch.',
    last: '"the selection for months/weeks/days should live under the data switch in layouts"',
    to: '/',
  },
  {
    id: 'TC-115',
    group: G.small,
    text: 'Quilt editor › Layout › Style: each style in the list shows the same picture as its card in the new-quilt wizard (Horizontal and Vertical Strip each their own), and the chosen style’s picture shows in the field. Check it in dark mode too.',
    last: '"the layout dropdown should show the same icons as we use in the wizard" / "the layout dropdown in the layout workbench of quilt design"',
    to: '/',
  },
  {
    id: 'TC-116',
    group: G.small,
    text: 'Design › Data › Values ranges: the first range reads "under" with only its end, the last only its start with "and up", the ones between from and to. Changing a range’s end moves the next one’s start (and a start moves the one before’s end). Values far past either end take the end range’s color. A single range reads "all". Labels in the color pickers, the print legend and Yardage match.',
    last: '"the values map shouldn\'t have a max value for the last entry or a min value for the first entry"',
    to: '/',
  },
  {
    id: 'TC-117',
    group: G.small,
    text: 'Design › Data › Values: right under the heading, a small bar chart per value shows the sample’s days in each range or category, in its color (hover a bar: its range and days). Changing a range, Kind or the sample (built-in series, CSV) redraws it. Empty bins keep a sliver.',
    last: '"we should show a small histogram of values, with bins matching the current value bins" / "let\'s put that right below the "values" section label"',
    to: '/',
  },
  {
    id: 'TC-118',
    group: G.small,
    text: 'Section dividers: Layout tab’s Data quilt switch and Plan sit in a "Data quilt" section with the same labelled line as Layout. Design › Data has Period, Data, Values, Yardage (Most days expected), Places without data; Design › Blocks has Numbers and Block pools (Shuffle on its line), all with that labelled line.',
    last: '"the data quilt switch and format picker should be in a section with a hr-based label" / "let\'s use the same hr-labeled seperator that we use for other sections for the data tab of the design workbench"',
    to: '/',
  },
  {
    id: 'TC-119',
    group: G.small,
    text: 'Month labels: in a Months plan the list and the quilt label each number by its month (Jan, Feb… from the period start; a September start begins with Sep); warnings name months too. Weeks and Days still read 001, 002…, with the week’s first day or the date beside them in the list.',
    last: '"let\'s use the month names as labels instead of 001, 002, 003, etc"',
    to: '/',
  },
  {
    id: 'TC-120',
    group: G.small,
    text: 'Design › Blocks: start dragging a placed number in the list: its block space is highlighted on the quilt until you drop it (or let go outside the list).',
    last: '"when you\'re dragging a block slot in the blocks interface, it should highlight the block on the quilt that you\'ve selected"',
    to: '/',
  },
  {
    id: 'TC-121',
    group: G.small,
    text: 'Design › Blocks list: each row is a fixed label (Jan… or 001…, a week’s first day or the date beside it) and a card: an uncolored picture of the block its space shows (a faded one from its pool when not placed, with Not placed) and Block N. No checkmarks. Drag a card onto another label: only the card moves, the labels stay; the moved block’s picture changes to one from its new label’s pool (Feb to Jan: Month Strip 28 becomes 31). Hover a card for its arrows.',
    last: '"let\'s have the draggable element be a card with a uncolored representative of one of the blocks that is in the pool for it\'s source (before drag), updating thumbnail after being droped" / "the month labels shouldn\'t move as part of the draggable objects. they should be statically located labels that don\'t move"',
    to: '/',
  },
  {
    id: 'TC-122',
    group: G.small,
    text: 'Quilt labels in a data quilt’s Design tab: every block space shows Block 1, Block 2… (left to right, top to bottom, same as the cards), and each placed space its month (or 001…) under it on the order line. Drag a card: the month label moves to the other space, the block numbers stay.',
    last: '"let\'s use a consisten block numbering (ordered left-to-right, top-to-bottom) for the labels on the blocks that we\'re dragging" / "let\'s have both the block label and the month label show up on the quilt. the month label moves between blocks as they are dragged"',
    to: '/',
  },
  {
    id: 'TC-123',
    group: G.small,
    text: 'Design › Blocks list: hovering a placed card outlines its block space on the quilt (gone when the pointer leaves); clicking a card keeps its space outlined until another card is clicked, while moving over the quilt still shows the space under the pointer.',
    last: '"hovering or clicking one of the draggable items should highlight that block in the canvas"',
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
