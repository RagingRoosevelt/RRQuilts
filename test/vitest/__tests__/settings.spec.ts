import { describe, expect, it } from 'vitest';
import {
  defaults,
  openedProject,
  loadSettings,
  parseConf,
  saveSettings,
  STORAGE_KEY,
  toConf,
  type KeyValueStore,
} from '@/settings/settings';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = { ...initial };
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('denied');
  },
};

describe('settings storage', () => {
  it('returns defaults when storage is empty, corrupt, or unavailable', () => {
    expect(loadSettings(memoryStore())).toEqual(defaults());
    expect(loadSettings(memoryStore({ [STORAGE_KEY]: '{not json' }))).toEqual(defaults());
    expect(loadSettings(throwingStore)).toEqual(defaults());
    expect(loadSettings(null)).toEqual(defaults());
  });

  it('round-trips through storage and preserves unknown keys', () => {
    const store = memoryStore();
    const s = { ...defaults(), theme: 'dark' as const, futureKey: { a: 1 } };
    expect(saveSettings(s, store)).toBe(true);
    expect(loadSettings(store)).toEqual(s);
  });

  it('reports failure instead of throwing when saving is impossible', () => {
    expect(saveSettings(defaults(), throwingStore)).toBe(false);
  });
});

describe('.rrqconf export/import', () => {
  it('exports the documented envelope', () => {
    const doc = toConf(defaults(), '1.2.3');
    expect(doc).toEqual({ format: 'rrqconf', version: 1, app: '1.2.3', settings: defaults() });
  });

  it('imports its own export', () => {
    const s = { ...defaults(), units: 'cm' as const };
    const r = parseConf(JSON.stringify(toConf(s, 'x')));
    expect(r).toEqual({ ok: true, settings: s, invalid: [] });
  });

  it('rejects non-JSON, wrong format, and newer versions', () => {
    expect(parseConf('nope').ok).toBe(false);
    expect(parseConf(JSON.stringify({ format: 'nope', version: 1, settings: {} })).ok).toBe(false);
    const newer = parseConf(JSON.stringify({ format: 'rrqconf', version: 2, settings: {} }));
    expect(newer).toMatchObject({ ok: false, error: expect.stringMatching(/update/i) });
  });

  it('falls back to defaults for invalid known values and reports them', () => {
    const r = parseConf(
      JSON.stringify({ format: 'rrqconf', version: 1, settings: { theme: 'neon', units: 'cm' } }),
    );
    expect(r).toEqual({
      ok: true,
      settings: { ...defaults(), units: 'cm' },
      invalid: ['theme'],
    });
  });
});

describe('tab on opening a project', () => {
  it('keeps the tab for the same project; another starts on quilts, or blocks if none', () => {
    const s = defaults();
    openedProject(s, 'a', false);
    expect(s.projectTab).toBe('blocks');
    s.projectTab = 'colors';
    openedProject(s, 'a', true);
    expect(s.projectTab).toBe('colors');
    openedProject(s, 'b', true);
    expect([s.lastProject, s.projectTab]).toEqual(['b', 'quilts']);
  });
});

describe('snapping gravity (spec 031)', () => {
  it('older settings snap as before: Normal, line up Off, double for touch', () => {
    const s = loadSettings(memoryStore({ [STORAGE_KEY]: JSON.stringify({ units: 'cm' }) }));
    expect(s.snapGravity).toEqual({
      nodes: 'normal',
      seams: 'normal',
      align: 'normal',
      grid: 'normal',
    });
    expect(s.snapOff).toEqual(['align']);
    expect(s.snapTouch).toBe(2);
  });

  it('goes with a settings file; bad values fall back', () => {
    const s = {
      ...defaults(),
      snapGravity: { nodes: 'strong', seams: 'gentle', align: 'normal', grid: 'normal' },
      snapOff: ['seams'],
      snapTouch: 3,
    } as ReturnType<typeof defaults>;
    expect(parseConf(JSON.stringify(toConf(s, 'x')))).toEqual({
      ok: true,
      settings: s,
      invalid: [],
    });
    const bad = parseConf(
      JSON.stringify({
        format: 'rrqconf',
        version: 1,
        settings: { snapGravity: { nodes: 'huge' }, snapOff: ['walls'], snapTouch: 9 },
      }),
    );
    expect(bad).toMatchObject({ invalid: ['snapGravity', 'snapOff', 'snapTouch'] });
  });
});
