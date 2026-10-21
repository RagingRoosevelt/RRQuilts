// Palette sort (spec 032): a way of looking at a palette's swatches. It never changes the palette,
// its file or its version; the quilter's choice is kept per palette id on the device (settings).

export type SortKey = 'saved' | 'hue' | 'value' | 'saturation' | 'name';
export interface SortPref {
  key: SortKey;
  reverse?: boolean;
}
export const SORT_KEYS: { value: SortKey; label: string }[] = [
  { value: 'saved', label: 'Saved order' },
  { value: 'hue', label: 'Hue' },
  { value: 'value', label: 'Value (light to dark)' },
  { value: 'saturation', label: 'Saturation (vivid to muted)' },
  { value: 'name', label: 'Name' },
];

type RGB = readonly [number, number, number];

/** CIE LCh (D65) of an sRGB color: lightness 0..100, chroma, hue in degrees. */
export function lch([r, g, b]: RGB): { l: number; c: number; h: number } {
  const lin = (v: number) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t) / 116 + 16 / 116);
  const fx = f((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047);
  const fy = f(0.2126 * R + 0.7152 * G + 0.0722 * B);
  const fz = f((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883);
  const [l, a, bb] = [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  return { l, c: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}

/** Below this chroma a color counts as a gray: its hue is noise, so a hue sort puts it last. */
const GRAY = 10;
/** Hue order starts at red (LCh puts red near 40°, pinks just under it). */
const RED = 15;

/**
 * The swatches in display order. `rgb` gives a swatch's color (a fabric's average), `name` its name.
 * Ties go by value (light first), then by saved order; Reverse flips the whole result.
 */
export function sortSwatches<T>(
  items: readonly T[],
  pref: SortPref | undefined,
  rgb: (x: T) => RGB,
  name: (x: T) => string,
): T[] {
  if (!pref || pref.key === 'saved') return pref?.reverse ? [...items].reverse() : [...items];
  const keyed = items.map((x, i) => ({ x, i, ...lch(rgb(x)), n: name(x) }));
  type K = (typeof keyed)[number];
  const byValue = (a: K, b: K) => b.l - a.l || a.i - b.i;
  const cmp: Record<Exclude<SortKey, 'saved'>, (a: K, b: K) => number> = {
    hue: (a, b) => {
      const ga = a.c < GRAY;
      const gb = b.c < GRAY;
      if (ga !== gb) return ga ? 1 : -1;
      if (ga) return byValue(a, b);
      const ha = (a.h - RED + 360) % 360;
      const hb = (b.h - RED + 360) % 360;
      return ha - hb || byValue(a, b);
    },
    value: byValue,
    saturation: (a, b) => b.c - a.c || byValue(a, b),
    name: (a, b) => a.n.localeCompare(b.n, undefined, { numeric: true }) || a.i - b.i,
  };
  const out = keyed.sort(cmp[pref.key]).map((k) => k.x);
  return pref.reverse ? out.reverse() : out;
}

/** A settings value as sort preferences by palette id (bad entries dropped). */
export function validSortPrefs(v: unknown): v is Record<string, SortPref> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  return Object.values(v).every(
    (p) =>
      typeof p === 'object' &&
      p !== null &&
      SORT_KEYS.some((k) => k.value === (p as SortPref).key) &&
      ((p as SortPref).reverse === undefined || typeof (p as SortPref).reverse === 'boolean'),
  );
}
