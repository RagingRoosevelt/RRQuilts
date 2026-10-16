// Target sizes (spec 006 FR-001a): a size to aim a quilt at, shown as an outline over it. The
// quilter's choices (`TargetInput`) resolve to a shape in project units; quilts store both, so the
// outline still draws if these lists change later.

import { bbox, garmentOutline, sizeRows, type Fit, type GarmentPiece } from './garments';
import type { Pt } from './geometry/path';
import type { Units } from './schema/project';

export type Region = 'us' | 'eu';
/** A named size: width × height in its region's units (inches for US, cm for European). Beds are
 *  mattress tops with a default drop; `tall` is the long (XL) length where there is one. */
export interface NamedTarget {
  name: string;
  size: [number, number];
  drop?: number;
  tall?: number;
}

export const TARGETS: Record<Region, NamedTarget[]> = {
  us: [
    { name: 'Placemat', size: [18, 13] },
    { name: 'Table runner', size: [72, 14] },
    { name: 'Wall hanging', size: [36, 36] },
    { name: 'Throw', size: [50, 65] },
    { name: 'Crib', size: [28, 52], drop: 0 },
    { name: 'Twin', size: [39, 75], drop: 12, tall: 80 },
    { name: 'Double (Full)', size: [54, 75], drop: 12, tall: 80 },
    { name: 'Queen', size: [60, 80], drop: 14 },
    { name: 'King', size: [76, 80], drop: 14 },
    { name: 'California King', size: [72, 84], drop: 14 },
  ],
  eu: [
    { name: 'Placemat', size: [46, 33] },
    { name: 'Table runner', size: [183, 36] },
    { name: 'Wall hanging', size: [91, 91] },
    { name: 'Throw', size: [127, 165] },
    { name: 'Crib', size: [71, 132], drop: 0 },
    { name: 'Single', size: [90, 200], drop: 30, tall: 210 },
    { name: 'Single (XL)', size: [100, 200], drop: 30, tall: 210 },
    { name: 'Small double', size: [120, 200], drop: 30, tall: 210 },
    { name: 'Standard double / Queen', size: [140, 200], drop: 30, tall: 210 },
    { name: 'Queen (Europe) / King', size: [160, 200], drop: 35, tall: 210 },
    { name: 'Super King (Europe)', size: [180, 200], drop: 35, tall: 210 },
    { name: 'Emperor / Grand King', size: [200, 200], drop: 35, tall: 210 },
  ],
};

/** What the quilter picked. Lengths are in project units. */
export interface TargetInput {
  /** null: none; 'custom'; 'top' or 'pants' (garments); else a named size from `region`'s list. */
  choice: string | null;
  region: Region;
  custom?: [number, number];
  /** Beds: drop over the sides and foot, pillow tuck at the head (0: none), long (XL) version. */
  drop?: number;
  tuck?: number;
  tall?: boolean;
  /** Garments: fit, size as labeled in the US list, piece, and the adjustable lengths. */
  fit?: Fit;
  size?: string;
  piece?: GarmentPiece;
  sleeveLength?: number;
  inseam?: number;
}

/** A resolved target: its outline with (0, 0) at the top-left of its box, an optional inner
 *  rectangle (a bed's mattress top), and a label. Project units. */
export interface TargetShape {
  outline: Pt[];
  core?: [number, number, number, number];
  label: string;
}

const isGarment = (c: string | null): c is 'top' | 'pants' => c === 'top' || c === 'pants';

/** A length from a region's units in project units (cm whole, inches to the half). */
export function fromRegion(v: number, region: Region, units: Units): number {
  if (region === 'us') return units === 'cm' ? Math.round(v * 2.54) : v;
  return units === 'cm' ? v : Math.round((v / 2.54) * 2) / 2;
}

export const named = (input: Pick<TargetInput, 'choice' | 'region'>) =>
  TARGETS[input.region].find((t) => t.name === input.choice);

/** Garment size rows for a garment target. */
export const garmentSizes = (input: TargetInput) =>
  sizeRows(input.choice === 'pants' ? 'pants' : 'top', input.fit ?? 'women');

/** The size row picked (by its US label), else a middle size. */
export function garmentRow(input: TargetInput) {
  const rows = garmentSizes(input);
  const middle = input.choice === 'pants' && (input.fit ?? 'women') === 'women' ? 4 : 2;
  return rows.find((r) => r.us === input.size) ?? rows[middle]!;
}

/**
 * The fields a new choice starts with (keeping the region): a bed's drop, a garment's middle size
 * and its sleeve length and inseam. `fit` picks women's or men's for garments.
 */
export function startChoice(choice: string | null, prev: TargetInput, units: Units): TargetInput {
  const k = units === 'cm' ? 2.54 : 1;
  const len = (v: number) => (units === 'cm' ? Math.round(v * k) : v);
  const base: TargetInput = { choice, region: prev.region };
  if (choice === 'custom')
    return { ...base, custom: prev.custom ?? (units === 'cm' ? [150, 200] : [60, 80]) };
  if (isGarment(choice)) {
    const fit = prev.fit ?? 'women';
    const g: TargetInput = {
      ...base,
      fit,
      piece: prev.piece === 'sleeve' && choice === 'pants' ? 'front' : (prev.piece ?? 'front'),
    };
    const row = garmentRow(g);
    return {
      ...g,
      size: row.us,
      sleeveLength: len(row.m.arm),
      inseam: len(fit === 'men' ? 32 : 30.5),
    };
  }
  const t = named(base);
  if (t?.drop !== undefined)
    return { ...base, drop: fromRegion(t.drop, base.region, units), tuck: 0, tall: false };
  return base;
}

/** The shape a target input describes in project units, or null for none (or an unknown name). */
export function resolveTarget(input: TargetInput, units: Units): TargetShape | null {
  const n = (v: number) => +v.toFixed(2);
  const rect = (w: number, h: number): Pt[] => [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  if (input.choice === 'custom') {
    const [w, h] = input.custom ?? [1, 1];
    return { outline: rect(Math.max(w, 0.1), Math.max(h, 0.1)), label: `Custom ${n(w)} × ${n(h)}` };
  }
  if (isGarment(input.choice)) {
    const k = units === 'cm' ? 2.54 : 1;
    const row = garmentRow(input);
    const piece =
      input.choice === 'pants' && input.piece === 'sleeve' ? 'front' : (input.piece ?? 'front');
    const pts = garmentOutline(
      input.choice,
      piece,
      { ...row.m, ...(input.inseam ? { inseam: input.inseam / k } : {}) },
      (input.sleeveLength ?? row.m.arm * k) / k,
    ).map(([x, y]): Pt => [x * k, y * k]);
    const [x0, y0] = bbox(pts);
    const size = input.region === 'eu' ? `${row.eu} (US ${row.us})` : row.us;
    return {
      outline: pts.map(([x, y]): Pt => [x - x0, y - y0]),
      label: `${input.choice === 'top' ? 'Top' : 'Pants'} ${piece}, ${input.fit ?? 'women'}'s ${size}`,
    };
  }
  const t = named(input);
  if (!t) return null;
  const w = fromRegion(t.size[0], input.region, units);
  const h = fromRegion(input.tall && t.tall ? t.tall : t.size[1], input.region, units);
  if (t.drop === undefined) return { outline: rect(w, h), label: t.name };
  const drop = Math.max(0, input.drop ?? 0);
  const tuck = Math.max(0, input.tuck ?? 0);
  const more = [drop && 'drop', tuck && 'pillow tuck'].filter(Boolean).join(' and ');
  return {
    outline: rect(w + 2 * drop, h + drop + tuck),
    ...(drop + tuck > 0 ? { core: [drop, tuck, w, h] as [number, number, number, number] } : {}),
    label: `${t.name}${input.tall && t.tall ? ' (XL)' : ''}${more ? ` with ${more}` : ''}`,
  };
}

/** Width and height of a shape's outline. */
export function shapeSize(s: TargetShape): [number, number] {
  const [x0, y0, x1, y1] = bbox(s.outline);
  return [x1 - x0, y1 - y0];
}

/** A shape centered on a quilt's bounds [x0, y0, x1, y1]: outline points, inner rectangle, box. */
export function placeTarget(s: TargetShape, quilt: [number, number, number, number]) {
  const [w, h] = shapeSize(s);
  const ox = (quilt[0] + quilt[2]) / 2 - w / 2;
  const oy = (quilt[1] + quilt[3]) / 2 - h / 2;
  return {
    outline: s.outline.map(([x, y]): Pt => [x + ox, y + oy]),
    core: s.core
      ? ([s.core[0] + ox, s.core[1] + oy, s.core[2], s.core[3]] as [number, number, number, number])
      : null,
    box: [ox, oy, ox + w, oy + h] as [number, number, number, number],
  };
}

/** The region a new target starts in: the remembered choice, else by the project's units. */
export const defaultRegion = (remembered: string | undefined, units: Units): Region =>
  remembered === 'us' || remembered === 'eu' ? remembered : units === 'cm' ? 'eu' : 'us';
