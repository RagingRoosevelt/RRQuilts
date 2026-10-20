// Manual testing checklist (Tests tab, dev server only). Each check shows as <build>-TC-###: the
// build is the release plus the commit after it (0.4.0+7ed7f8d; plain 0.4.0 on the release itself).
// Progress is kept per release line, so it survives new commits, and each result remembers the build
// it was tested on. Ids (TC-###) are stable: reword an item freely, but give a changed check a new id.
// After a test round, checks that worked are removed (the Tests pages stay); never reuse an id. A
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
    id: 'TC-069',
    group: G.tags,
    last: "I'm not seeing checkboxes anymore for blocks I designed myself. / When editing a \"make a copy of a library block\" block, the techniques, etc aren't editable. / Hovering over the label for techniques and efficiency checkboxes when it is not possible to change should produce a tooltip indicating why they aren't editable.",
    text: 'Block editor › Details › Techniques and Efficiency: on a block you drew, and on a copy you made of a library block (Edit a copy, Create copy), the checkboxes work and save. On a library block or a color variation they show greyed out, and hovering one says why (a library block keeps its designer’s techniques; a color variation has its block’s).',
    to: '/',
  },
  {
    id: 'TC-070',
    group: G.tags,
    last: "This isn't catching palette removal such as in my library. Maybe we should be thinking about this as a palette or block feature, not a pack feature? Or if it stays a pack feature, we should also apply it when we turn off packs in the library management module.",
    text: 'Removing things that carry your tags asks “Should the tag associations be kept in case you add it back?” with “Save tag associations after removing” (ticked): Remove pack, Disconnect (or Remove) a whole library, and Delete from my library on a palette or block you tagged. Kept ones show in the leftover row (Remove them). Switching a pack off doesn’t ask: nothing is removed, its tags stay.',
    to: '/libraries',
  },
  {
    id: 'TC-071',
    group: G.filters,
    last: 'Let\'s give some breathing room around that switch. I think if we have that toggled on, we should hide the "shape" filter right below it. / The switch works but it needs some vertical margin on both top and bottom.',
    text: 'Quilt editor › Design › Blocks sidebar: the Compatible with this layout switch has space above and below it. While it’s on the Shape filter is hidden; switch it off and the Shape filter comes back.',
    to: '/',
  },
  {
    id: 'TC-072',
    group: G.small,
    last: 'We had a regression on the colorway palette mapping dropdowns running over and causing a horizontal scrollbar for the sidebar.',
    text: 'A quilt with a second colorway, shown: Design › Colors lists each color and its replacement menu. With long color or fabric names (a fabric palette), the names cut off with … and the sidebar never scrolls sideways.',
    to: '/',
  },
  {
    id: 'TC-073',
    group: G.filters,
    last: 'We should have a count above the library accordions for blocks listing count of selected vs total blocks.',
    text: 'Project › Blocks tab › Library blocks: under the heading, “N of M selected” counts the library blocks picked for this project out of those shown (filters narrow both); it changes as you tick blocks or a whole category.',
    to: '/',
  },
  {
    id: 'TC-074',
    group: G.tags,
    last: "We need to apply those tags to our existing built-in blocks. / We don't have a techniques filter in the library sidebar.",
    text: 'Built-in blocks now come with techniques: Libraries › Technique filter lists Foundation paper piecing (e.g. 54-40 or Fight, Cobweb), Strip piecing (e.g. Rail Fence, Nine Patch, Jacob’s Ladder), Quick units (e.g. Sawtooth, Shoofly), Stitch and flip (e.g. Arkansas). Group by Technique works. Letters and numbers have none. A block’s Details lists them (greyed). Tell me any that look wrong.',
    to: '/libraries',
  },
  {
    id: 'TC-075',
    group: G.small,
    last: 'We need a little bit of margin between the libraries in the library manager. Change the "check for updates" text to "get updates", then move disconnect up to the same line.',
    text: 'Libraries sidebar: a little space between libraries; a web library’s buttons read All off · Get updates · Disconnect, all on one line.',
    to: '/libraries',
  },
  {
    id: 'TC-076',
    group: G.small,
    last: 'The text for the three-way-switch overruns its slot. Maybe there should be a label over the switch that says "keep which?" and then the switch positions say "project", "both", "import"? And if both are selected, then the file one shows the new name it\'ll come in as. We also should have a scrollable list of all the quilts rather than having to page through each one at a time. Default to keeping project copy.',
    text: 'Quilts tab › Import quilts from a project with quilts already here (import this demo into itself): one scrolling list of every clash, this project’s quilt and the file’s side by side, a “Keep which?” switch between them reading Project · Both · Import, starting on Project. Both shows the name the file’s quilt comes in as. “All N” at the top sets every row. Done imports.',
    to: '/',
  },
  {
    id: 'TC-077',
    group: G.small,
    last: 'The text for the three-way-switch overruns its slot. Maybe a label over the switch that says "keep which?" and the positions say "existing", "both", "new"? And if both are selected, the file one shows the new name it\'ll come in as. We also should have a scrollable list of all the images coming in. Default to keeping existing copy and discard the incoming one.',
    text: 'Adding fabric images whose names are already in the palette: one scrolling list, the palette’s fabric and the new image side by side, “Keep which?” reading Existing · Both · New, starting on Existing (the new one is left out). Both shows the name the new one gets (“Name (2)”) and it comes in under that name.',
    to: '/',
  },
  {
    id: 'TC-078',
    group: G.small,
    last: 'Still trimming down to where the tip of the block is vs having the straight edge going out for the extended mode that would be trimmed. / At the block points. If we cut 1" beyond, then there\'s nothing to fill in the gap.',
    text: "New On-Point (and Variable Point, Diamond Point) quilts start with Edge: Exact. Set a block into a left setting triangle, then remove it: the quilt's edge stays at the block points both times, and a target overlay doesn't move. Switching to Floating offers a 1″ float. Older quilts keep their finish.",
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
