// App settings: on-device persistence and .rrqconf export/import.
// Storage is untrusted and may be missing or throw (private mode, blocked site data).

export type Theme = 'auto' | 'light' | 'dark';
export type Units = 'in' | 'cm';

export interface Settings {
  theme: Theme;
  units: Units;
  hintsDismissed: string[];
  /** Name the user is known by; its slug prefixes ids of items they create (spec 008). */
  author: string;
  /** The author name has been asked for once. */
  authorAsked: boolean;
  /** Editors: toolbar on the right and sidebar on the left (default: the reverse). */
  sidesSwapped: boolean;
  /** Quilt editor Design sidebar: last tab. */
  trayTab: 'blocks' | 'colors';
  /** Libraries page: blocks in sections by category, tag, or style. */
  libraryGroupBy: 'none' | 'category' | 'tags' | 'styles';
  /** Project (sketchbook) page: last tab. */
  projectTab: 'quilts' | 'blocks' | 'colors' | 'photos' | 'threads' | 'details';
  /** Project Blocks / Palettes tabs leave out the library lists (Settings › Libraries). */
  hideLibraryBlocks: boolean;
  hideLibraryPalettes: boolean;
  /** Project Blocks tab: a My-library block shows once, as its synced project copy. */
  hideSyncedMine: boolean;
  /** Libraries page: Type picker — blocks, palettes ('colors'), or all (''). */
  libraryType: 'block' | 'colors' | '';
  /** Labels of inspector sections the user collapsed. */
  collapsedSections: string[];
  /** Print preferences (spec 010), merged with defaults where used (`printPrefs`). */
  print: Record<string, unknown>;
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
  collapsedSections: [],
  sidesSwapped: false,
  trayTab: 'blocks',
  libraryGroupBy: 'none',
  libraryType: 'block',
  hideLibraryBlocks: true,
  hideLibraryPalettes: true,
  hideSyncedMine: true,
  projectTab: 'quilts',
  print: {},
});

const validators: Partial<Record<string, (v: unknown) => boolean>> = {
  theme: (v) => v === 'auto' || v === 'light' || v === 'dark',
  units: (v) => v === 'in' || v === 'cm',
  hintsDismissed: (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
  author: (v) => typeof v === 'string' && v.length <= 100,
  authorAsked: (v) => typeof v === 'boolean',
  sidesSwapped: (v) => typeof v === 'boolean',
  trayTab: (v) => v === 'blocks' || v === 'colors',
  libraryGroupBy: (v) => v === 'none' || v === 'category' || v === 'tags' || v === 'styles',
  libraryType: (v) => v === 'block' || v === 'colors' || v === '',
  hideLibraryBlocks: (v) => typeof v === 'boolean',
  hideLibraryPalettes: (v) => typeof v === 'boolean',
  hideSyncedMine: (v) => typeof v === 'boolean',
  projectTab: (v) =>
    typeof v === 'string' &&
    ['quilts', 'blocks', 'colors', 'photos', 'threads', 'details'].includes(v),
  print: (v) => isObject(v),
  collapsedSections: (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
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
