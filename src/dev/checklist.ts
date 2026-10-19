// Manual testing checklist (Tests tab, dev server only). Each check shows as <build>-TC-### (the
// build under test: the app version) and its progress is kept under that id, so every build is
// tested afresh. Ids (TC-###) are stable: reword an item freely, but give a changed check a new id.
/** The build under test. */
export const BUILD = import.meta.env.APP_VERSION;
/** A check's full id, as shown and as its progress is kept: 0.4.0-TC-001. */
export const checkId = (c: Check) => `${BUILD}-${c.id}`;

export interface Check {
  /** TC-###. */
  id: string;
  group: string;
  text: string;
  /** Where to test it (an app route). */
  to?: string;
}

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
    text: 'Open a real project saved by 0.4.0: it looks the same; save it and reopen it.',
  },
  {
    id: 'TC-002',
    group: G.files,
    text: 'A 0.4.0 project with the old Baby Blocks opens as Variable Patch.',
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
    text: 'Details tab of your own block: Needs and Efficiency checklists save; a library block lists them without checkboxes.',
  },
  {
    id: 'TC-025',
    group: G.tags,
    text: 'Technique filter shows Needs and Efficiency sections; Group by Technique works.',
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
];

export type CheckState = { status: 'ok' | 'problem'; note?: string; at: string };

/** Kept apart from the app's own data (settings are `rrq.settings`). */
const KEY = 'rrq.dev.checklist';

export function loadChecks(): Record<string, CheckState> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as unknown;
    return raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, CheckState>)
      : {};
  } catch {
    return {};
  }
}
export function saveChecks(state: Record<string, CheckState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: progress lasts until the page closes.
  }
}
