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

/** A set-in sleeve, whole: cap on top, short (to above the elbow) or long (to the wrist). */
function sleeve(m: Measurements, long: boolean): Pt[] {
  const bicep = m.upperArm + 2;
  const cap = (m.backLength / 2 + 0.75) * 0.6;
  const length = long ? m.arm : 9;
  const hem = long ? Math.max(9, bicep * 0.62) : bicep - 1;
  const n = 16;
  const capPts = Array.from({ length: n + 1 }, (_, i): Pt => {
    const t = i / n;
    return [-bicep / 2 + t * bicep, (cap * (1 + Math.cos(2 * Math.PI * t))) / 2];
  });
  return [...capPts, [hem / 2, cap + length], [-hem / 2, cap + length]];
}

/** One trouser leg's front or back, side seam on the left. */
function pants(m: Measurements, back: boolean): Pt[] {
  const ease = 2;
  const w = (m.hip + ease) / 4 + (back ? 0.75 : -0.25); // side to center at the hip
  const ext = back ? m.hip / 10 : m.hip / 16; // crotch extension past the center seam
  const rise = m.rise;
  const length = m.rise + m.inseam;
  const lift = back ? 1 : 0; // the back rises higher at the center
  const legCenter = (w + ext) / 2;
  const hem = (back ? 9 : 8) + (m.hip - 36) / 8;
  const center: Pt = [w, rise - 2];
  return [
    [0, 0],
    [w + (back ? 0.75 : 0), -lift],
    center,
    ...curve(center, [w, rise], [w + ext, rise], 6),
    [legCenter + hem / 2, length],
    [legCenter - hem / 2, length],
    [0, rise],
  ];
}

/** The outline of a garment piece in inches; `long` sleeves for the sleeve, pants pieces are a
 *  front or a back (no sleeve). */
export function garmentOutline(
  garment: 'top' | 'pants',
  piece: GarmentPiece,
  m: Measurements,
  long = true,
): Pt[] {
  if (garment === 'pants') return pants(m, piece === 'back');
  return piece === 'sleeve' ? sleeve(m, long) : bodice(m, piece === 'back');
}

/** Bounding box [x0, y0, x1, y1] of points. */
export function bbox(pts: Pt[]): [number, number, number, number] {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
