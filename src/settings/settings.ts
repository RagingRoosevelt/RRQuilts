// App settings: on-device persistence and .rrqconf export/import.
// Storage is untrusted and may be missing or throw (private mode, blocked site data).

export type Theme = 'auto' | 'light' | 'dark';
export type Units = 'in' | 'cm';

import type { OverlayDefaults } from '@/model/targets';
import type { Social } from './socials';
import { validSortPrefs, type SortPref } from '@/model/palette-sort';
import type { Gravity, SnapTarget } from '@/editor/snap';

export interface Settings {
  theme: Theme;
  units: Units;
  hintsDismissed: string[];
  /** Name the user is known by; its slug prefixes ids of items they create (spec 008). */
  author: string;
  /** The author name has been asked for once. */
  authorAsked: boolean;
  /** The welcome wizard has been finished or skipped. */
  welcomeDone: boolean;
  /** Use the OS accent color for the app's primary color (where the browser exposes it). */
  osAccent: boolean;
  /** Editors: toolbar on the right and sidebar on the left (default: the reverse). */
  sidesSwapped: boolean;
  /** Quilt editor Design sidebar: last tab. */
  trayTab: 'blocks' | 'colors';
  /** Libraries page: blocks in sections by category, tag, or style. */
  libraryGroupBy: 'none' | 'category' | 'tags' | 'techniques' | 'shape';
  /** Quilt editor block sidebar: only blocks the quilt's layout takes. */
  compatibleBlocks: boolean;
  /** Project (sketchbook) page: last tab. */
  projectTab: 'quilts' | 'blocks' | 'colors' | 'photos' | 'threads' | 'details';
  /** Id of the project opened last: reopening it keeps `projectTab`, another starts fresh. */
  lastProject: string;
  /** Your socials (GitHub, a pattern shop, …): a known or free-text type and a handle (or link). */
  socials: Social[];
  /** Project Blocks / Palettes tabs leave out the library lists (Settings › Project). */
  hideLibraryBlocks: boolean;
  hideLibraryPalettes: boolean;
  /** Project Blocks tab: a My-library block shows once, as its synced project copy. */
  hideSyncedMine: boolean;
  /** Libraries page: Type picker — blocks, palettes ('colors'), or all (''). */
  libraryType: 'block' | 'colors' | '';
  /** Labels of inspector sections the user collapsed. */
  collapsedSections: string[];
  /** How each palette's swatches show (spec 032), by palette id; none = saved order. */
  paletteSorts: Record<string, SortPref>;
  /** Print preferences (spec 010), merged with defaults where used (`printPrefs`). */
  print: Record<string, unknown>;
  /** Fabric images (spec 014): show with average-color stand-ins while loading, blank while
   *  loading, or average colors only (never load images). */
  fabricImages: 'standins' | 'blank' | 'colors';
  /** The "?" buttons that open Help about a screen or section. */
  showHelp: boolean;
  /** Design tab color tray: recently used colors first in each palette (off: palette order). */
  recentColorsFirst: boolean;
  /** Fabric image size on screen: Light (256) or Standard (512). */
  imageSize: 256 | 512;
  /** Size your own fabric images are saved at in projects and backups. */
  saveSize: 256 | 512;
  /** Installed packs switched off (spec 014): hidden from trays and pickers. */
  packsOff: string[];
  /** Bundled libraries (bundled_libraries.json) disconnected on this device: their addresses. */
  bundledHidden: string[];
  /** New quilt wizard target sizes: US or European beds ('auto' follows `units`). */
  bedSizes: 'auto' | 'us' | 'eu';
  /** Reference overlay starting points (lengths in inches); each unset until given in Settings or
   *  first used in the new quilt wizard. */
  overlayDefaults: OverlayDefaults;
  /** Block editor snapping (spec 031): how hard each target pulls when on. */
  snapGravity: Record<SnapTarget, Gravity>;
  /** Snap targets switched off (their step in `snapGravity` comes back when switched on). */
  snapOff: SnapTarget[];
  /** A finger's pull is this many times the mouse's. */
  snapTouch: 1 | 2 | 3;
  // Keys added by later app versions are kept as-is.
  [key: string]: unknown;
}

export interface ConfDoc {
  format: 'rrqconf';
  version: number;
  app: string;
  settings: Settings;
}

export type ParseResult =
  { ok: true; settings: Settings; invalid: string[] } | { ok: false; error: string };

export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

export const STORAGE_KEY = 'rrq.settings';
export const FORMAT = 'rrqconf';
// ponytail: single version so far; add a migrations table keyed by version when v2 exists.
export const VERSION = 1;

export const defaults = (): Settings => ({
  theme: 'auto',
  units: 'in',
  hintsDismissed: [],
  author: '',
  authorAsked: false,
  welcomeDone: false,
  collapsedSections: [],
  paletteSorts: {},
  sidesSwapped: false,
  osAccent: true,
  trayTab: 'blocks',
  libraryGroupBy: 'none',
  libraryType: 'block',
  socials: [],
  hideLibraryBlocks: false,
  hideLibraryPalettes: false,
  hideSyncedMine: true,
  compatibleBlocks: true,
  projectTab: 'quilts',
  lastProject: '',
  print: {},
  fabricImages: 'standins',
  showHelp: true,
  recentColorsFirst: false,
  imageSize: 512,
  saveSize: 512,
  packsOff: [],
  bundledHidden: [],
  bedSizes: 'auto',
  overlayDefaults: {},
  snapGravity: { nodes: 'normal', seams: 'normal', align: 'normal', grid: 'normal' },
  snapOff: ['align'],
  snapTouch: 2,
});

const SNAP_TARGETS = ['nodes', 'seams', 'align', 'grid'];

const validators: Partial<Record<string, (v: unknown) => boolean>> = {
  theme: (v) => v === 'auto' || v === 'light' || v === 'dark',
  units: (v) => v === 'in' || v === 'cm',
  bedSizes: (v) => v === 'auto' || v === 'us' || v === 'eu',
  overlayDefaults: (v) => {
    if (!isObject(v)) return false;
    const num = (x: unknown) => x === undefined || (typeof x === 'number' && x >= 0 && x < 1000);
    const fit = (x: unknown) => x === 'women' || x === 'men';
    const str = (x: unknown) => typeof x === 'string' && x.length <= 100;
    const { top, pants, bed } = v;
    return (
      (top === undefined ||
        (isObject(top) && fit(top.fit) && str(top.size) && num(top.sleeveLength))) &&
      (pants === undefined ||
        (isObject(pants) && fit(pants.fit) && str(pants.size) && num(pants.inseam))) &&
      (bed === undefined ||
        (isObject(bed) &&
          (bed.region === 'us' || bed.region === 'eu') &&
          str(bed.name) &&
          num(bed.drop) &&
          num(bed.tuck) &&
          (bed.tall === undefined || typeof bed.tall === 'boolean')))
    );
  },
  hintsDismissed: (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
  author: (v) => typeof v === 'string' && v.length <= 100,
  authorAsked: (v) => typeof v === 'boolean',
  welcomeDone: (v) => typeof v === 'boolean',
  sidesSwapped: (v) => typeof v === 'boolean',
  osAccent: (v) => typeof v === 'boolean',
  trayTab: (v) => v === 'blocks' || v === 'colors',
  // 'styles' (before spec 029) falls back to the default.
  libraryGroupBy: (v) =>
    v === 'none' || v === 'category' || v === 'tags' || v === 'techniques' || v === 'shape',
  libraryType: (v) => v === 'block' || v === 'colors' || v === '',
  socials: (v) =>
    Array.isArray(v) &&
    v.length <= 50 &&
    v.every(
      (x) =>
        isObject(x) &&
        typeof x.type === 'string' &&
        x.type.length <= 60 &&
        typeof x.handle === 'string' &&
        x.handle.length <= 500 &&
        (x.credit === undefined || typeof x.credit === 'boolean'),
    ),
  hideLibraryBlocks: (v) => typeof v === 'boolean',
  hideLibraryPalettes: (v) => typeof v === 'boolean',
  hideSyncedMine: (v) => typeof v === 'boolean',
  projectTab: (v) =>
    typeof v === 'string' &&
    ['quilts', 'blocks', 'colors', 'photos', 'threads', 'details'].includes(v),
  compatibleBlocks: (v) => typeof v === 'boolean',
  lastProject: (v) => typeof v === 'string' && v.length <= 200,
  print: (v) => isObject(v),
  fabricImages: (v) => v === 'standins' || v === 'blank' || v === 'colors',
  showHelp: (v) => typeof v === 'boolean',
  recentColorsFirst: (v) => typeof v === 'boolean',
  imageSize: (v) => v === 256 || v === 512,
  saveSize: (v) => v === 256 || v === 512,
  packsOff: (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
  bundledHidden: (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
  collapsedSections: (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
  paletteSorts: validSortPrefs,
  snapGravity: (v) =>
    isObject(v) &&
    SNAP_TARGETS.every((k) => v[k] === 'gentle' || v[k] === 'normal' || v[k] === 'strong'),
  snapOff: (v) =>
    Array.isArray(v) && v.every((x) => typeof x === 'string' && SNAP_TARGETS.includes(x)),
  snapTouch: (v) => v === 1 || v === 2 || v === 3,
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Merge raw values over defaults; invalid known keys fall back to defaults and are reported. */
function normalize(raw: Record<string, unknown>): { settings: Settings; invalid: string[] } {
  const settings: Settings = { ...defaults() };
  const invalid: string[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const valid = Object.hasOwn(validators, key) ? validators[key] : undefined;
    if (!valid) settings[key] = value;
    else if (valid(value)) settings[key] = value;
    else invalid.push(key);
  }
  return { settings, invalid };
}

export function browserStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSettings(store: KeyValueStore | null = browserStore()): Settings {
  try {
    const text = store?.getItem(STORAGE_KEY);
    const raw: unknown = text ? JSON.parse(text) : null;
    return isObject(raw) ? normalize(raw).settings : defaults();
  } catch {
    return defaults();
  }
}

/** Returns false when the settings could not be persisted (the app keeps working in memory). */
export function saveSettings(
  settings: Settings,
  store: KeyValueStore | null = browserStore(),
): boolean {
  try {
    if (!store) return false;
    store.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/** Opening project `id`: the same one again keeps the tab it was left on; another starts on its
 *  quilts, or its blocks if it has none. */
export function openedProject(s: Settings, id: string, hasQuilts: boolean) {
  if (s.lastProject === id) return;
  s.lastProject = id;
  s.projectTab = hasQuilts ? 'quilts' : 'blocks';
}

export const toConf = (settings: Settings, app: string): ConfDoc => ({
  format: FORMAT,
  version: VERSION,
  app,
  settings,
});

export function parseConf(text: string): ParseResult {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not a valid settings file (not JSON).' };
  }
  if (!isObject(doc) || doc.format !== FORMAT) {
    return { ok: false, error: 'Not an RRQuilts settings file.' };
  }
  if (typeof doc.version !== 'number' || !Number.isInteger(doc.version) || doc.version < 1) {
    return { ok: false, error: 'Settings file has an invalid version.' };
  }
  if (doc.version > VERSION) {
    return {
      ok: false,
      error: 'This settings file is from a newer RRQuilts. Update the app first.',
    };
  }
  if (!isObject(doc.settings)) {
    return { ok: false, error: 'Settings file has no settings.' };
  }
  return { ok: true, ...normalize(doc.settings) };
}
