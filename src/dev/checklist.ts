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
    id: 'TC-229',
    group: G.shape049,
    text: 'Libraries, grouped by Category: in a category with shaped blocks (e.g. Stars), square blocks come first A to Z, then triangles, 60° diamonds, hexagons, each A to Z. Group blocks by › Shape: sections Square and rectangle, Triangle, 60° diamond, Hexagon with counts, also in the contents list; reload: still Shape. Project Blocks tab: the same order and the Shape choice; the quilt editor’s block tray in the same order. My blocks keep your own order.',
    to: '/libraries',
  },
  {
    id: 'TC-228',
    group: G.shadow048,
    text: 'Quilts tab, Blocks tab and Libraries: no gray squares behind card pictures. Each quilt and block casts a soft shadow in its own shape (triangle, hexagon and diamond blocks too, wide quilts centered). Dark mode: the shadow is an accent-colored glow (switch on Settings › Use the system accent color to see it follow). Dragging a card: the moving copy casts a deeper shadow in its shape. Drag glow, hover and focus marks unchanged.',
    to: '/project',
  },
  {
    id: 'TC-220',
    group: G.drag037,
    text: 'Quilts tab, a project with several quilts: drag a quilt card with the mouse. The card stays in place faded; a solid copy of its picture, a little larger with a deep shadow, follows the pointer and tilts toward the way you move, then settles straight when you stop. The facing edges of the cards either side of the landing place glow. Let go: the copy slides into place and the quilt is there. One Undo puts it back. Dropping does not open the quilt.',
    to: '/project',
  },
  {
    id: 'TC-221',
    group: G.drag037,
    text: 'Drop past the end (bug fix): drag a quilt beyond the last card, in the empty space to its right and below the list. The glow shows the end; let go there and it lands last. Before the first card it lands first. Over its own place there’s no glow and nothing moves. Esc during a drag slides the copy back and nothing moves.',
    to: '/project',
  },
  {
    id: 'TC-227',
    group: G.drag037,
    text: 'Phone or tablet (the dev server over your network works for this), or a touch laptop: a swipe on the cards scrolls the page and a tap opens the quilt. Press and hold a card: it lifts (a small buzz on Android) and follows your finger, the page doesn’t scroll or pull to refresh under it, even dragging down from the top. Drag by the handle left of a name: it lifts at once, no long press. Hold a card near the top or bottom of the screen: the page scrolls. Let go: it lands where the glow shows.',
    to: '/project',
    last: '"in firefox on my mobile device, long pressing a quilt then dragging it to the row below causes the browser to want to refresh the page" / "on mobile, dragging from the drag handle shouldn’t require a long press"',
  },
  {
    id: 'TC-224',
    group: G.drag037,
    text: 'Blocks tab › My blocks: blocks drag exactly like quilts (faded card, solid copy, glow, past-the-end drop, touch, keyboard handle). The ⋮ menu has no Move earlier / Move later. With a search or filter on, blocks don’t drag and show no handle.',
    to: '/project',
  },
  {
    id: 'TC-225',
    group: G.drag037,
    text: 'Reduced motion (system setting): the copy still follows, larger with the shadow, but without tilting or sliding into place.',
    to: '/project',
  },
  {
    id: 'TC-217',
    group: G.gray047,
    text: 'Libraries › open a built-in block’s preview with several colorings. A View grayscale switch sits under the big picture, off. On: the big picture and the coloring thumbnails turn to grays, nothing else changes. Pick another coloring: still gray. Close and reopen it, and open another block: each starts in color.',
    to: '/libraries',
    last: '"view greyscale shouldn’t be a remembered setting. closing and opening a (new or previous) preview should start off not greyscale. returning to a quilt or block editor should return to a non-greyscale experience."',
  },
  {
    id: 'TC-218',
    group: G.gray047,
    text: 'Project › Blocks tab › a block’s Preview: the same switch, off when it opens, back off after closing and reopening.',
    to: '/project',
    last: '"view greyscale shouldn’t be a remembered setting. closing and opening a (new or previous) preview should start off not greyscale. returning to a quilt or block editor should return to a non-greyscale experience."',
  },
  {
    id: 'TC-219',
    group: G.gray047,
    text: 'Quilt editor: switch View grayscale on, go back to the project, open the quilt again: in color. Same for the block editor, and going from a gray quilt editor to a block editor starts in color.',
    to: '/project',
    last: '"view greyscale shouldn’t be a remembered setting. closing and opening a (new or previous) preview should start off not greyscale. returning to a quilt or block editor should return to a non-greyscale experience."',
  },
  {
    id: 'TC-208',
    group: G.update054,
    text: 'The dialog as an update from 0.6.1 (this link fakes one: the dev server has no service worker). Title "Update from 0.6.1 to <this version>". Two whole quilts tilted toward each other, moving gently. Each newer version lists only its major changes, then "And N smaller changes". "The full changelog" opens Help › About › Changelog. Later closes it, and an Update button in the header opens it again.',
    to: '/?update_demo=0.6.1',
  },
  {
    id: 'TC-209',
    group: G.update054,
    text: 'Other states, by changing the link’s phase: &phase=ready says "The update is ready"; &phase=failed says it couldn’t be downloaded, with Close; &phase=elsewhere says it was updated in another tab, with only Reload. In the demo the download takes 2 seconds: Reload before that shows a "Reloading…" spinner, then the page reloads without the demo flag (as a real update reloads into the new version).',
    to: '/?update_demo=0.7.1&phase=ready',
  },
  {
    id: 'TC-210',
    group: G.update054,
    text: 'Help › About › Changelog: no "[major]" text anywhere, and in each section the major changes come first (0.7.2 New features starts with "A data quilt can place several blocks").',
    to: '/help/about/changelog',
  },
  {
    id: 'TC-211',
    group: G.update054,
    text: 'A real update: make build, make serve, open localhost:8080/RRQuilts/ and let it load. Change anything, make build again, reload the page: the dialog shows right away with "Downloading the update…", then "The update is ready". Throttle the network (Slow 3G) and press Reload early: "Reloading…", then the page reloads by itself. With a second tab open, it then asks to reload too.',
  },
  {
    id: 'TC-212',
    group: G.update054,
    text: 'A link while an update waits (as in TC-211, before reloading): open localhost:8080/RRQuilts/?open_gist=<a gist> and …/libraries?add=<a library address>. The update dialog shows first. Later: the gist or library is offered by the running version. Reload: the new version offers it.',
  },
  {
    id: 'TC-213',
    group: G.update054,
    text: 'Unsaved work: with a project changed and not saved, Reload in the update dialog asks Cancel / Keep as draft / Save, with no browser "Leave page?" prompt after. Keep as draft: after the reload, Restore unsaved project offers it.',
  },
  {
    id: 'TC-214',
    group: G.update054,
    text: 'Smaller download: on localhost:8080, dev tools › Application › Cache storage has no schemas/ files and no version.json. localhost:8080/RRQuilts/schemas/formats.json still opens.',
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
