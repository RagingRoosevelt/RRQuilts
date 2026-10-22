// Palette color filter (spec 033): palettes with a swatch in a hue, value and saturation range.
// Same perceptual space as the palette sort (spec 032), so the two agree.
import { lch } from './palette-sort';

type RGB = readonly [number, number, number];

export interface ColorFilter {
  hue: { on: boolean; center: number; range: number };
  value: { on: boolean; min: number; max: number };
  sat: { on: boolean; min: number; max: number };
  /** Hide the swatches that don't match (else they're dimmed). */
  onlyMatching: boolean;
}
export const colorFilter = (): ColorFilter => ({
  hue: { on: false, center: 220, range: 25 },
  value: { on: false, min: 0, max: 100 },
  sat: { on: false, min: 0, max: 100 },
  onlyMatching: false,
});
export const colorFilterOn = (f: ColorFilter) => f.hue.on || f.value.on || f.sat.on;

/** Below this saturation a swatch has no hue (grays): it never matches a hue range. */
const NO_HUE = 8;
/** Chroma scaled to 0..100 (sRGB's most vivid colors reach about 130). */
const satOf = (c: number) => Math.min(100, (c / 130) * 100);

export function swatchMatches(rgb: RGB, f: ColorFilter): boolean {
  const { l, c, h } = lch(rgb);
  const s = satOf(c);
  if (f.value.on && (l < f.value.min || l > f.value.max)) return false;
  if (f.sat.on && (s < f.sat.min || s > f.sat.max)) return false;
  if (f.hue.on) {
    if (s < NO_HUE) return false;
    const d = Math.abs(((h - f.hue.center + 540) % 360) - 180);
    if (d > f.hue.range) return false;
  }
  return true;
}

/** A palette matches when one of its swatches is in every set range (none set: all match). */
export const paletteMatches = (rgbs: readonly RGB[], f: ColorFilter) =>
  !colorFilterOn(f) || rgbs.some((x) => swatchMatches(x, f));

/** An sRGB color for a hue (LCh, middle lightness), to paint the hue picker with. */
export function hueColor(h: number, l = 65, c = 55): string {
  const r = (h * Math.PI) / 180;
  const [a, b] = [c * Math.cos(r), c * Math.sin(r)];
  const fy = (l + 16) / 116;
  const [fx, fz] = [fy + a / 500, fy - b / 200];
  const inv = (t: number) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
  const [X, Y, Z] = [inv(fx) * 0.95047, inv(fy), inv(fz) * 1.08883];
  const lin = [
    3.2406 * X - 1.5372 * Y - 0.4986 * Z,
    -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
    0.0557 * X - 0.204 * Y + 1.057 * Z,
  ];
  const g = (v: number) =>
    Math.round(
      255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)),
    );
  return `rgb(${lin.map(g).join(',')})`;
}
