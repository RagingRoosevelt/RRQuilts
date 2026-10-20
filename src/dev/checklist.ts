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
    id: 'TC-059',
    last: 'Functionally it works and everything swaps when pressing the switch. Problem is that shaped blocks and baby blocks both change height when their labels change when switching between blocks and patches.',
    group: G.shaped,
    text: 'Wizard: Blocks / Patches switch; Shaped Blocks, Diamond Point and Baby Blocks cards (every card keeps its height when the switch changes its label).',
  },
  {
    id: 'TC-060',
    last: 'It refuses to place the wrong size block, but it feels like bad UX to show incompatible blocks. Maybe we should have a switch (default on) that toggles between filtering to only compatible shapes or not.',
    group: G.shaped,
    text: 'Quilt editor: Set refuses a block of the wrong shape (switch off Compatible with this layout in the Blocks sidebar to see those blocks); Rotate turns in steps that fit.',
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
    id: 'TC-061',
    last: 'In the quilt sidebar, we shouldn\'t include the "fits layout" filter. We already know what layout we\'re working with. Just use a switch (default on) for "compatible with layout".',
    group: G.filters,
    text: 'Quilt sidebar: the Shape filter with pictures, and the Compatible with this layout switch in place of Fits layout (see TC-053).',
  },
  {
    id: 'TC-062',
    last: "I did make a color variation and those needs and efficiency labels are still check boxes which doesn't seem right. We should probably add tag editing and category editing in the details tab of a block.",
    group: G.tags,
    text: 'Details tab of a block you designed: Techniques and Efficiency checklists save; a library block, or a copy or color variation of someone else’s, lists them without checkboxes (see TC-054).',
  },
  {
    id: 'TC-063',
    last: 'Feels like this might have changed since the test was written?',
    group: G.tags,
    text: 'Technique filter shows Techniques and Efficiency sections; Group by Technique works.',
  },
  {
    id: 'TC-064',
    last: 'I had tags applied to a my-library palette and was not asked what I wanted to do with the tags. On a library pack it worked fine but the verbiage needs to improve: "Remove pack "<pack name>"?", explain "this pack has tags attached. Should the tag associations be preserved in case you add the pack back?", checkbox "save tag associations after removing pack".',
    group: G.tags,
    text: 'Remove a pack with tagged items: “Remove pack “name”?” explains the tag associations and offers “Save tag associations after removing pack”; kept ones show in a leftover row that offers Remove them. (Tags on your own My library palettes live in the palette: removing a pack doesn’t touch them.)',
  },
  {
    id: 'TC-065',
    last: "The colors chosen in its color variations weren't saved (I used a library palette's fabric images). A color variant with plain colors saved fine; one with fabric didn't restore properly.",
    group: G.tags,
    text: 'Make a pack and export a block (.rrqbl): neither carries tags; techniques travel, and so do fabric colorings (see TC-050).',
  },
  {
    id: 'TC-066',
    last: "Import works as expected. I'm not satisfied with just making duplicates if a quilt already exists: show a preview and ask which copy to keep or both (quilt on one side, three-way switch in the middle, other quilt on the other side).",
    group: G.small,
    text: 'Quilts tab › Import quilts: pick quilts from this demo; they come in with their blocks and colors, and look the same. Undo removes them. Importing a project into itself asks, for each quilt already here, which to keep (see TC-056).',
    file: 'demo-v6.rrq',
  },
  {
    id: 'TC-067',
    last: 'Shows public domain, not CC BY-SA.',
    group: G.shaped,
    text: 'Fractals are no longer built in (Libraries › Category has no Fractals). Libraries lists RagingRoosevelt’s Novelty (offered with the app, not downloaded yet). Show packs: Fractals is off; switch it on and it downloads. The Fractals pack has with category Fractals: Sierpinski Carpet, Vicsek Cross, Cantor Bars, Hilbert Curve, Sierpinski Triangle (its light gaps are single pieces), Sierpinski Diamond, Koch Snowflake. Each shows RagingRoosevelt as author and CC BY-SA 4.0 in Details. None shows as set-in in the Seams filter (Koch Snowflake: a big center triangle and three wings, each spike sewn log cabin style).',
    to: '/libraries',
  },
  {
    id: 'TC-047',
    last: 'We should maybe rename "needs" to "techniques".',
    group: G.tags,
    text: 'Technique’s first section is now called Techniques (was Needs): in a block’s Details, the Technique filter’s section line, and Help (Libraries, Drawing blocks).',
    to: '/libraries',
  },
  {
    id: 'TC-048',
    last: 'Now that we can paint block spaces, we no longer need the plain block in the built in library.',
    group: G.small,
    text: 'The built-in library no longer has Plain Block (Basics): paint an empty block space instead. A project that used it still opens with its copy.',
    to: '/libraries',
  },
  {
    id: 'TC-049',
    last: "I don't seem to be able to set tags on a project palette. Saving the project palette to my library lets me apply a tag there, but still nothing in project.",
    group: G.tags,
    text: 'Project palettes take tags (project format 8): in a project’s Palettes tab, a project palette’s menu › Tags… › ⭐ Favorite shows ⭐ before its name, and in the quilt editor’s color tray. Save the project and reopen it: the tag is still there. Save to my library carries the tags to the new My library palette. A file saved by 0.5.0 still opens.',
    to: '/',
  },
  {
    id: 'TC-050',
    last: "The colors chosen in its color variations weren't saved (I used a library palette's fabric images).",
    group: G.tags,
    text: 'Fabrics travel with blocks (block files 3, library files 5): paint a block’s coloring with fabrics (your own and a library palette’s). Export the block (.rrqbl) and import it into another project: the fabric patches come back. Add the block to My library, then Make pack with it and add the pack elsewhere (or restore a backup): the fabrics are there too. Import blocks from another project file: same.',
    to: '/',
  },
  {
    id: 'TC-051',
    last: 'Can we give a badge or some other indicator that shaped blocks supports more than just hex? Maybe badges for each of the shapes it supports? Or a count badge?',
    group: G.shaped,
    text: 'New quilt wizard: the Shaped Blocks card shows small triangle, diamond and hexagon badges in its top right corner (hover: Triangles, diamonds or hexagons); the cards keep one height.',
    to: '/',
  },
  {
    id: 'TC-052',
    last: "Let's have the test page render any project or my library blocks, too.",
    group: G.tests,
    text: 'Tests › Blocks: with a project open, its own blocks come first (“This project (name)”), then My library’s blocks, then the built-in library by category; each drawn with its colors.',
    to: '/dev/blocks',
  },
  {
    id: 'TC-053',
    last: 'It feels like bad UX to show incompatible blocks; a switch (default on) for "compatible with layout" instead of the "fits layout" filter.',
    group: G.filters,
    text: 'Quilt editor › Design › Blocks sidebar: Fits layout is gone; a “Compatible with this layout” switch (on by default) shows only blocks this quilt’s spaces take (square blocks in a Straight Set, the right shapes in a Shaped Blocks quilt). Switched off, every block shows, and tapping an incompatible one with Set says why. The switch is remembered. The Shape filter is still there.',
    to: '/',
  },
  {
    id: 'TC-054',
    last: 'Not sure how to get to the details of a library block itself. We should probably add tag editing and category editing in the details tab of a block.',
    group: G.tags,
    text: 'Block editor › Details: a Tags field (add ⭐ Favorite or your own words; a library block’s tags are kept in My library) and Category (a My library block or its linked copy: Change… files it; a library block shows its library’s category; a project-only block says to add it to My library). Technique checkboxes only on blocks you designed; a library block, or a copy or color variation of someone else’s, shows them as a list.',
    to: '/',
  },
  {
    id: 'TC-055',
    last: "We need to add the same palette filtering that's currently in library to the project palette view.",
    group: G.filters,
    text: 'Project › Palettes tab: a filter sidebar (on phones behind Filters) with a search box, Tags (⭐ Favorite first) and Category (when palettes are filed in categories). They narrow both the project’s palettes and the library palettes listed; project palettes count as uncategorized.',
    to: '/',
  },
  {
    id: 'TC-056',
    last: 'Why are we not detecting the quilt ID collision and asking the user what they want to do? Show a preview and ask which copy to keep or both.',
    group: G.small,
    text: 'Quilts tab › Import quilts from a project that has a quilt already here (e.g. import this demo into itself): a dialog shows this project’s quilt and the file’s side by side with Keep this one · Keep both · Use the file’s, one clash at a time (Do the same for the rest answers the others). Keep both adds a copy named “(2)”; Use the file’s replaces it in place; Keep this one skips it. One undo removes the import.',
    to: '/',
    file: 'demo-v6.rrq',
  },
  {
    id: 'TC-057',
    last: "The palette editing dialog, when uploading a file with a name that's already in use, just creates a second copy. Let the user pick between keeping original, new, or both.",
    group: G.small,
    text: 'Adding fabric images to a palette (project palette menu › Add fabric images, the quilt editor’s tray, or a My library palette) where one’s name is already in that palette: a dialog shows the one in the palette and the new image side by side, Keep the original · Keep both · Use the new one. Use the new one swaps the image in place (quilts using that fabric change picture); Keep the original leaves the new one out.',
    to: '/',
  },
  {
    id: 'TC-058',
    last: 'In the jacket back quilt when I add or remove that left-most block the position of the reference overlay changes.',
    group: G.small,
    text: "An On-Point quilt with Floating edge and a target overlay (Layout › Target size, e.g. a jacket back): set a block in a left (or top) setting triangle, then remove it. The quilt's edge on that side moves in and out (the float is taken away while a block is there), but the overlay stays in the same place over the blocks.",
    to: '/',
  },
  {
    id: 'TC-068',
    group: G.tags,
    last: "Can we darken the fav star badge's drop shadow?",
    text: 'The ⭐ favorite badge on block and palette cards has a darker shadow, easy to see on light blocks.',
    to: '/libraries',
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
