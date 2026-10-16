// Garment outlines for the new-quilt wizard's target sizes (spec 006 FR-001a): simple slopers
// drafted from standard body measurements, so a quilter can see how much quilt a garment piece
// takes. Finished outlines with wearing ease, no seam allowance; inches, y down.
// ponytail: simplified drafts (straight darts left out, curves sampled); enough for a size guide,
// not a sewing pattern.

import type { Pt } from './geometry/path';

export type Fit = 'women' | 'men';
export type GarmentSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type GarmentPiece = 'front' | 'back' | 'sleeve';

export const SIZES: GarmentSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
/** European size numbers for the same sizes. */
export const EU_SIZES: Record<Fit, number[]> = {
  women: [34, 36, 38, 40, 42, 44],
  men: [44, 46, 48, 50, 52, 54],
};

/** Body measurements in inches (a common ready-to-wear chart). */
export interface Measurements {
  /** Bust (women) or chest (men), waist, hip: around the body. */
  bust: number;
  waist: number;
  hip: number;
  /** Nape of the neck to the waist, down the back. */
  backLength: number;
  /** Across the back, shoulder point to shoulder point. */
  shoulder: number;
  /** Shoulder point to wrist. */
  arm: number;
  upperArm: number;
  /** Waist to the seat, sitting (crotch depth); inside leg; waist to ankle at the side. */
  rise: number;
  inseam: number;
}

const rows = (cols: number[][]): Measurements[] =>
  cols[0]!.map((_, i) => {
    const [bust, waist, hip, backLength, shoulder, arm, upperArm, rise, inseam] = cols.map(
      (c) => c[i]!,
    ) as [number, number, number, number, number, number, number, number, number];
    return { bust, waist, hip, backLength, shoulder, arm, upperArm, rise, inseam };
  });

/** Measurements by fit, XS to XXL. */
export const CHART: Record<Fit, Measurements[]> = {
  women: rows([
    [32, 34, 36, 39, 42, 45],
    [25, 27, 29, 32, 35, 38],
    [35, 37, 39, 42, 45, 48],
    [16, 16.25, 16.5, 16.75, 17, 17.25],
    [14, 14.5, 15, 15.5, 16, 16.5],
    [22.5, 22.75, 23, 23.25, 23.5, 23.75],
    [10.5, 11, 11.5, 12.5, 13.5, 14.5],
    [10, 10.25, 10.5, 10.75, 11, 11.25],
    [30, 30, 30.5, 30.5, 30.5, 30.5],
  ]),
  men: rows([
    [34, 37, 40, 43, 46, 49],
    [28, 31, 34, 37, 40, 43],
    [34, 37, 40, 43, 46, 49],
    [17, 17.25, 17.5, 17.75, 18, 18.25],
    [16, 16.75, 17.5, 18.25, 19, 19.75],
    [24, 24.5, 25, 25.25, 25.5, 25.75],
    [11, 12, 13, 14, 15, 16],
    [10.5, 10.75, 11, 11.25, 11.5, 11.75],
    [30, 31, 32, 32, 32, 32],
  ]),
};

export const measurements = (fit: Fit, size: GarmentSize): Measurements =>
  CHART[fit][SIZES.indexOf(size)]!;

/** A size as sold: its US label, European number, and body measurements. */
export interface SizeRow {
  us: string;
  eu: number;
  m: Measurements;
}

/** Women's misses sizes (US 0 to 18): bust, waist, hip. European numbers are US + 32. */
const MISSES: [number, number, number, number][] = [
  [0, 32, 24, 34.5],
  [2, 33, 25, 35.5],
  [4, 34, 26, 36.5],
  [6, 35, 27, 37.5],
  [8, 36, 28, 38.5],
  [10, 37, 29, 39.5],
  [12, 38.5, 30.5, 41],
  [14, 40, 32, 42.5],
  [16, 41.5, 33.5, 44],
  [18, 43.5, 35.5, 46],
];

/**
 * Sizes to pick from. Tops: XS to XXL. Pants: women's misses numbers, men's waist in inches (28 to
 * 42; European numbers about the waist + 16). Pants rows fill the measurements a trouser doesn't
 * use from the letter size closest in hip.
 */
const quarter = (v: number) => Math.round(v * 4) / 4;

export function sizeRows(garment: 'top' | 'pants', fit: Fit): SizeRow[] {
  if (garment === 'top')
    return SIZES.map((sz, i) => ({ us: sz, eu: EU_SIZES[fit][i]!, m: CHART[fit][i]! }));
  const near = (hip: number) =>
    CHART[fit].reduce((a, b) => (Math.abs(b.hip - hip) < Math.abs(a.hip - hip) ? b : a));
  if (fit === 'women')
    return MISSES.map(([us, bust, waist, hip]) => ({
      us: `${us}`,
      eu: us + 32,
      m: { ...near(hip), bust, waist, hip, rise: quarter(10 + (hip - 35) * 0.1) },
    }));
  return [28, 30, 32, 34, 36, 38, 40, 42].map((waist) => {
    const hip = waist + 6;
    return {
      us: `${waist}`,
      eu: waist + 16,
      m: { ...near(hip), bust: hip, waist, hip, rise: quarter(10.5 + (hip - 34) * 0.085) },
    };
  });
}

/** A quadratic Bézier from `a` to `b` bending toward `c`, sampled (without `a`). */
function curve(a: Pt, c: Pt, b: Pt, n = 8): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / n;
    const u = 1 - t;
    return [
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
    ];
  });
}

/** Mirror a half outline (center at x = 0, running from the top of the center line around to the
 *  bottom of it) into the whole piece. */
const whole = (half: Pt[]): Pt[] => [
  ...half,
  ...half
    .slice(1, -1)
    .reverse()
    .map(([x, y]): Pt => [-x, y]),
];

/** A hip-length top's back, whole (cut on the fold), or one side of its buttoned front: center
 *  front at x = 0, with a button stand lapping past it on the left. */
function bodice(m: Measurements, back: boolean): Pt[] {
  const ease = 4;
  const half = (m.bust + ease) / 4; // center to side seam at the underarm
  const hipHalf = Math.max(half, (m.hip + ease) / 4);
  const neck = m.bust / 16 + 0.75; // neck width from the center
  const neckDepth = back ? 0.75 : 3;
  const slope = 1.75;
  const sh: Pt = [m.shoulder / 2, slope];
  const armDepth = m.backLength / 2 + 0.75;
  const length = m.backLength + 7; // to the hip
  const neckPt: Pt = [neck, 0];
  const stand = 1; // buttons sit on center front; the stand laps this far past it
  const half_: Pt[] = [
    ...(back ? [] : ([[-stand, neckDepth]] as Pt[])),
    [0, neckDepth],
    ...curve([0, neckDepth], [neck, neckDepth], neckPt, 6),
    sh,
    // Armhole: down from the shoulder, scooping in, out to the underarm.
    ...curve(sh, [sh[0] - (back ? 0.25 : 0.75), armDepth], [half, armDepth]),
    [hipHalf, length],
    [0, length],
    ...(back ? [] : ([[-stand, length]] as Pt[])),
  ];
  return back ? whole(half_) : half_;
}

/** A set-in sleeve, whole: cap on top, `length` from the top of the cap (the shoulder) to the hem,
 *  narrowing from the upper arm toward the wrist (the full arm length). */
function sleeve(m: Measurements, length: number): Pt[] {
  const bicep = m.upperArm + 2;
  const cap = (m.backLength / 2 + 0.75) * 0.6;
  const wrist = Math.max(9, bicep * 0.62);
  const t = Math.min(1, Math.max(0, length - cap) / (m.arm - cap));
  const hem = bicep + (wrist - bicep) * t;
  length = Math.max(length, cap + 0.5);
  const n = 16;
  const capPts = Array.from({ length: n + 1 }, (_, i): Pt => {
    const t = i / n;
    return [-bicep / 2 + t * bicep, (cap * (1 + Math.cos(2 * Math.PI * t))) / 2];
  });
  return [...capPts, [hem / 2, length], [-hem / 2, length]];
}

/**
 * One trouser leg, laid out as patterns show it: the front with center front on the left (with a
 * slanted pocket opening and a cut-on fly extension), the back with center back on the right. A
 * straight, fairly wide leg with nearly straight side seams; the back is wider, with a waist dart,
 * its center seam slanting in and up toward the waist and running into the deeper J-shaped crotch.
 */
function pants(m: Measurements, back: boolean): Pt[] {
  const w = (m.hip + 2) / 4 + (back ? 0.75 : -0.25); // side to center at the hip
  const ext = back ? m.hip / 8 : m.hip / 16 + 0.5; // crotch extension past the center seam
  const rise = m.rise;
  const hipDepth = rise - 2.5; // waist to the full hip
  const length = m.rise + m.inseam;
  const kneeY = rise + m.inseam * 0.45;
  const knee = (w + ext) * (back ? 0.76 : 0.88);
  const hem = knee * 0.97;
  const sideTop: Pt = [0.5, 0]; // the side seam leans in a little to the waist
  const hip: Pt = [0, hipDepth];
  // The side seam runs nearly straight to the hem; the inseam takes the leg's taper.
  const sideHem: Pt = [back ? 1.25 : 0.75, length];
  const innerKnee: Pt = [(back ? 0.75 : 0.5) + knee, kneeY];
  const point: Pt = [w + ext, rise + (back ? 0.5 : 0)];
  // Inseam: one gently hollow curve from the crotch point to the hem.
  const innerHem: Pt = [sideHem[0] + hem, length];
  const leg: Pt[] = [...curve(point, [innerKnee[0] - 0.5, kneeY], innerHem, 10), sideHem, hip];
  if (back) {
    // Center back: in 1.25″ and up 1″ at the waist, straight on that slant to the hip, then the J
    // curve carries the slant on round to the crotch point.
    const cTop: Pt = [w - 1.25, -1];
    const slope = (w - cTop[0]) / (hipDepth - cTop[1]);
    const corner: Pt = [w + slope * (point[1] - hipDepth), point[1]];
    // Waist: from the side up to center back, with a 1″ dart 3½″ deep midway.
    const mx = (sideTop[0] + cTop[0]) / 2;
    const my = (sideTop[1] + cTop[1]) / 2;
    const dy = (0.5 * (cTop[1] - sideTop[1])) / (cTop[0] - sideTop[0]);
    return [
      sideTop,
      [mx - 0.5, my - dy],
      [mx, my + 3.5],
      [mx + 0.5, my + dy],
      cTop,
      [w, hipDepth],
      ...curve([w, hipDepth], corner, point, 10),
      ...leg,
    ];
  }
  // Front: slanted pocket opening from the waist down to the side seam; center front straight
  // down (a fly extension cut on beside it) to a short crotch curve.
  const pocketTop: Pt = [sideTop[0] + 4, 0];
  const pocketSide: Pt = [0.3, 6.5];
  const curveTop: Pt = [w, rise - 3];
  const fly = 1.5;
  const flyEnd = curveTop[1] - 0.25;
  const pts: Pt[] = [
    pocketTop,
    [w + fly, 0],
    [w + fly, flyEnd - 0.75],
    ...curve([w + fly, flyEnd - 0.75], [w + fly, flyEnd], [w + fly - 0.75, flyEnd], 4),
    [w, flyEnd],
    curveTop,
    ...curve(curveTop, [w, rise], point, 8),
    ...leg,
    pocketSide,
    ...curve(pocketSide, [pocketTop[0] - 0.5, 5.5], pocketTop, 8).slice(0, -1),
  ];
  // Patterns lay the front with its center on the left.
  return pts.map(([x, y]): Pt => [-x, y]);
}

/** The outline of a garment piece in inches; a sleeve `sleeveLength` long (default: to the
 *  wrist), pants pieces are a
 *  front or a back (no sleeve). */
export function garmentOutline(
  garment: 'top' | 'pants',
  piece: GarmentPiece,
  m: Measurements,
  sleeveLength = m.arm,
): Pt[] {
  if (garment === 'pants') return pants(m, piece === 'back');
  return piece === 'sleeve' ? sleeve(m, sleeveLength) : bodice(m, piece === 'back');
}

/** Bounding box [x0, y0, x1, y1] of points. */
export function bbox(pts: Pt[]): [number, number, number, number] {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
