// Manual testing checklist (Tests tab, dev server only). Each check shows as <build>-TC-###: the
// build is the release plus the commit after it (0.4.0+7ed7f8d; plain 0.4.0 on the release itself).
// Progress is kept per release line, so it survives new commits, and each result remembers the build
// it was tested on. Ids (TC-###) are stable: reword an item freely, but give a changed check a new id.
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
  files: 'Old files (format v7)',
  shaped: 'Shaped blocks',
  tests: 'Tests pages',
  filters: 'Filters and sidebars',
  tags: 'Tags, technique, Favorite (spec 029)',
  small: 'Smaller changes',
};

export const CHECKS: Check[] = [
  {
    id: 'TC-001',
    group: G.files,
    text: 'Open a project saved by 0.4.0 (yours, or this demo written by 0.4.0): it looks the same; save it and reopen it.',
    file: 'demo-v6.rrq',
  },
  {
    id: 'TC-002',
    group: G.files,
    text: 'In the same 0.4.0 demo, the quilt named “Baby Blocks” (patches) opens with the layout Variable Patch, looking as before.',
    file: 'demo-v6.rrq',
  },
  {
    id: 'TC-003',
    group: G.files,
    text: 'Picture check: every picture matches (look at any flagged in red).',
    to: '/dev/pictures',
  },
  {
    id: 'TC-004',
    group: G.shaped,
    text: 'Block editor: new triangle, 60° diamond and hexagon blocks, sized by leg, width and height.',
  },
  {
    id: 'TC-005',
    group: G.shaped,
    text: 'Drawing snaps to the triangle grid and to the shape’s corners and edges.',
  },
  { id: 'TC-006', group: G.shaped, text: 'Edit a copy of a shaped block.' },
  {
    id: 'TC-007',
    group: G.shaped,
    text: 'Wizard: Blocks / Patches switch; Shaped Blocks, Diamond Point and Baby Blocks cards.',
  },
  {
    id: 'TC-008',
    group: G.shaped,
    text: 'Flow angle slider (wizard and Layout tab): 1° steps, sticks every 15°.',
  },
  {
    id: 'TC-009',
    group: G.shaped,
    text: 'Quilt editor: Set refuses a block of the wrong shape; Rotate turns in steps that fit.',
  },
  { id: 'TC-010', group: G.shaped, text: 'Quilt editor: Paint works on an empty block space.' },
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
    id: 'TC-017',
    group: G.filters,
    text: 'Libraries sidebar: search, Metadata, Shape, Construction, Group by, contents below.',
    to: '/libraries',
  },
  {
    id: 'TC-018',
    group: G.filters,
    text: 'Project Blocks tab: the same sidebar; dragging and Move earlier/later off while filtering.',
    to: '/project',
  },
  {
    id: 'TC-019',
    group: G.filters,
    text: 'Phone width: Filters button opens the sidebar over the page; tapping outside closes it.',
  },
  {
    id: 'TC-020',
    group: G.filters,
    text: 'Quilt sidebar: Fits layout and Shape filters with pictures.',
  },
  {
    id: 'TC-021',
    group: G.tags,
    text: 'Tag a built-in block on the Libraries page; the tag shows and filters in a project too.',
    to: '/libraries',
  },
  { id: 'TC-022', group: G.tags, text: 'Tag one of the project’s own blocks (Blocks tab, Tags…).' },
  {
    id: 'TC-023',
    group: G.tags,
    text: '⭐ Favorite is first when tagging and filtering; favorite blocks show the star badge (Libraries, Blocks tab, quilt sidebar).',
  },
  {
    id: 'TC-024',
    group: G.tags,
    text: 'Details tab of your own block: Techniques and Efficiency checklists save; a library block lists them without checkboxes.',
  },
  {
    id: 'TC-025',
    group: G.tags,
    text: 'Technique filter shows Techniques and Efficiency sections; Group by Technique works.',
  },
  {
    id: 'TC-026',
    group: G.tags,
    text: 'Construction filters (Seams, Difficulty) narrow the blocks.',
  },
  {
    id: 'TC-027',
    group: G.tags,
    text: 'Remove a pack with tagged items: asked whether to keep tags; the leftover row offers Remove them.',
  },
  {
    id: 'TC-028',
    group: G.tags,
    text: 'Back up My library and restore it: tags on others’ items come back.',
  },
  {
    id: 'TC-029',
    group: G.tags,
    text: 'Make a pack and export a block (.rrqbl): neither carries tags; techniques travel.',
  },
  {
    id: 'TC-030',
    group: G.small,
    text: 'Touch: one-finger drag pans only with the Pan tool; painting and drawing still work.',
  },
  { id: 'TC-031', group: G.small, text: 'Block thumbnails are centered.' },
  { id: 'TC-032', group: G.small, text: 'Sketchbook Create copy makes “Name (2)” and opens it.' },
  {
    id: 'TC-033',
    group: G.small,
    text: 'Details › Download image includes seam lines when Show seam lines is on; Sketchbook Save image has none.',
  },
  {
    id: 'TC-034',
    group: G.small,
    text: 'Quilts tab › Import quilts: pick quilts from this demo; they come in with their blocks and colors, and look the same. Undo removes them. Importing a project into itself adds copies named “(2)”.',
    file: 'demo-v6.rrq',
  },
  {
    id: 'TC-035',
    group: G.small,
    text: 'Home › Open from a gist: paste a gist link with one .rrq (opens), with several (asks which), with none or a wrong link (says so), offline (says so). Save then asks where. Restore unsaved project now sits below Recent projects. Before opening, the dialog names the gist and its GitHub owner. The link /?open_gist=<gist link> does the same.',
    to: '/',
  },
  {
    id: 'TC-036',
    group: G.small,
    text: 'Every dialog and wizard has an X in its top right corner that closes it: try the welcome wizard (closes it like Skip), New quilt, New block, a color, Open from a gist, a delete confirmation, and the Libraries dialogs. A title never runs under the X.',
  },
  {
    id: 'TC-037',
    group: G.shaped,
    text: 'Libraries › built-in: 21 new 60° triangle blocks (Four Triangles, Triangle Nine-Patch, Trip Around the Triangle, Thousand Pyramids, Sierpinski Triangle, Hexagon Triangle, Triangle Star, Rail Triangle, Flying Geese Triangle, Arrowhead Strips, Twisted Triangle, Christmas Tree, Three Kites, Triangle Pinwheel, and off the lattice: Sunburst Triangle, Peacock Fan, Framed Triangle, Slanted Rails, Sailboat, Rising Sun Triangle (curved), Spike Star) in Basics, Nine-patch, Mosaics, Stars, Strips, Medallions, Images, Animals, Plants and Curves. Put a few in a Shaped Blocks quilt (triangles). Seams filter: only Three Kites, Triangle Pinwheel and Spike Star show as set-in; Rising Sun as curved.',
    to: '/libraries',
  },
  {
    id: 'TC-038',
    group: G.tags,
    text: 'Favorite palettes: on Libraries › Palettes, a palette’s menu › Tags… › ⭐ Favorite shows ⭐ before its name; in a project’s Palettes tab the tag button on a library palette row does the same; a picked favorite palette shows ⭐ in the quilt editor’s color tray. The Tags filter finds it. Works for a My library palette (its own tag) and a built-in one.',
    to: '/libraries',
  },
  {
    id: 'TC-039',
    group: G.small,
    text: 'Which tab a project opens on: reopen the project you had open last (from Recent, a file, a gist or Restore): it opens on the tab you left it on. Open a different project: it opens on Quilts, or on Blocks if it has no quilts yet. A new empty project opens on Blocks.',
    to: '/',
  },
  {
    id: 'TC-040',
    group: G.tests,
    text: 'Text between checks (this page): hover the line between two checks (always shown on touch), click + and type; it stays after a reload. Every section has a + after its last check too. Copy results lists the text under “Text between checks”, in page order, each labeled with its section and the check just before it (“Shaped blocks, after 0.5.0-TC-005: …”, or “at the start”); Start over clears it.',
    to: '/dev/checklist',
  },
  {
    id: 'TC-041',
    group: G.filters,
    text: 'Sketchbook › Blocks › Library blocks: the library heading (e.g. Built-In) has a checkbox like each category: it ticks or clears every block of that library.',
    to: '/',
  },
  {
    id: 'TC-042',
    group: G.filters,
    text: 'Category filter (Libraries and the sketchbook’s Blocks sidebar): categories with the same name in My library and the built-in library show once. A category with subcategories is a labeled line with a checkbox before its name, its subcategories listed under it (not indented). Ticking that checkbox ticks the whole group; unticking one subcategory unticks it; ticking the last one ticks it again. Chips show only while the list is closed. Technique’s Techniques/Efficiency are labeled lines too. The Libraries page opens without errors and switching Blocks/Palettes/All drops picks the filter no longer offers.',
    to: '/libraries',
  },
  {
    id: 'TC-043',
    group: G.shaped,
    text: 'Seams filter › Set-in seams: the Round and Round blocks, Opposite Hexagon and Basic Log Cabin are no longer listed (their strips run the full side, sewn in order); Double Strips, Bright Hopes, Tea Box and Mitered Frame Medallion still are. Redrawn to match the book: Basic Log Cabin, Opposite Hexagon (strips in opposite pairs), Grape Vine, Mare’s Nest, Wedding Rings.',
    to: '/libraries',
  },
  {
    id: 'TC-044',
    group: G.shaped,
    text: 'Renamed built-in blocks: lettered variants now use the book’s numbers (King’s Crown II, Hourglass II and III, Nine-Patch Variation I and II, Grandmother’s Own III and IV, Red Cross I, …). A project saved before with one of them (e.g. demo-v6.rrq if it uses one, or your own) still opens and the block stays a library block (it may offer the renamed version as an update).',
    to: '/libraries',
  },
  {
    id: 'TC-045',
    group: G.small,
    text: 'Libraries: the Blocks / Palettes / All switch sits in the page header right after the title’s help icon (on a phone, on its own line under the title). Palette cards’ ⋮ button sits at the top of the card even when the swatches wrap onto several rows (Libraries and the sketchbook’s Palettes tab).',
    to: '/libraries',
  },
  {
    id: 'TC-046',
    group: G.shaped,
    text: 'Libraries › Category › Fractals: Sierpinski Carpet, Vicsek Cross, Cantor Bars, Hilbert Curve, Sierpinski Triangle (moved here from Mosaics; its light gaps are single pieces), Sierpinski Diamond, Koch Snowflake. Each shows RagingRoosevelt as author and CC BY-SA 4.0 in Details. None shows as set-in in the Seams filter (Koch Snowflake: a big center triangle and three wings, each spike sewn log cabin style).',
    to: '/libraries',
  },
  {
    id: 'TC-047',
    group: G.tags,
    text: 'Technique’s first section is now called Techniques (was Needs): in a block’s Details, the Technique filter’s section line, and Help (Libraries, Drawing blocks).',
    to: '/libraries',
  },
  {
    id: 'TC-048',
    group: G.small,
    text: 'The built-in library no longer has Plain Block (Basics): paint an empty block space instead. A project that used it still opens with its copy.',
    to: '/libraries',
  },
  {
    id: 'TC-049',
    group: G.tags,
    text: 'Project palettes take tags (project format 8): in a project’s Palettes tab, a project palette’s menu › Tags… › ⭐ Favorite shows ⭐ before its name, and in the quilt editor’s color tray. Save the project and reopen it: the tag is still there. Save to my library carries the tags to the new My library palette. A file saved by 0.5.0 still opens.',
    to: '/',
  },
  {
    id: 'TC-050',
    group: G.tags,
    text: 'Fabrics travel with blocks (block files 3, library files 5): paint a block’s coloring with fabrics (your own and a library palette’s). Export the block (.rrqbl) and import it into another project: the fabric patches come back. Add the block to My library, then Make pack with it and add the pack elsewhere (or restore a backup): the fabrics are there too. Import blocks from another project file: same.',
    to: '/',
  },
  {
    id: 'TC-051',
    group: G.shaped,
    text: 'New quilt wizard: the Shaped Blocks card shows small triangle, diamond and hexagon badges in its top right corner (hover: Triangles, diamonds or hexagons); the cards keep one height.',
    to: '/',
  },
  {
    id: 'TC-052',
    group: G.tests,
    text: 'Tests › Blocks: with a project open, its own blocks come first (“This project (name)”), then My library’s blocks, then the built-in library by category; each drawn with its colors.',
    to: '/dev/blocks',
  },
  {
    id: 'TC-053',
    group: G.filters,
    text: 'Quilt editor › Design › Blocks sidebar: Fits layout is gone; a “Compatible with this layout” switch (on by default) shows only blocks this quilt’s spaces take (square blocks in a Straight Set, the right shapes in a Shaped Blocks quilt). Switched off, every block shows, and tapping an incompatible one with Set says why. The switch is remembered. The Shape filter is still there.',
    to: '/',
  },
  {
    id: 'TC-054',
    group: G.tags,
    text: 'Block editor › Details: a Tags field (add ⭐ Favorite or your own words; a library block’s tags are kept in My library) and Category (a My library block or its linked copy: Change… files it; a library block shows its library’s category; a project-only block says to add it to My library). Technique checkboxes only on blocks you designed; a library block, or a copy or color variation of someone else’s, shows them as a list.',
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
