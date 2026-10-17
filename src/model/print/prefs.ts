// Print preferences (app settings, spec 010). Values that differ by unit system are kept per system
// and in that system's units: inches for `in`, centimeters for `cm`.
import type { Units } from '../schema/project';

export type BlockSection = 'templates' | 'rotary' | 'picture';
export type QuiltSection = 'picture' | 'blocks' | 'yardage' | 'rotary' | 'templates';

const perUnits = <T>(inches: T, cm: T) => ({ in: inches, cm });

/** What to print: for blocks, counts from a quilt (at its size), or a size and coloring. */
export interface PrintTarget {
  quilt?: string | undefined;
  size?: [number, number] | undefined;
  coloring?: string | undefined;
}

export const PRINT_DEFAULTS = {
  /** Any paper in any project; the default follows the units (Letter for inches, A4 for cm). */
  paper: perUnits<PaperId>('letter', 'a4'),
  landscape: false,
  /** Page margins on every side (most printers can't print the outer ¼″). */
  margin: perUnits(0.5, 1.25),
  seam: perUnits(0.25, 0.75),
  /** Rounding step for cut sizes; 0 = exact. */
  rounding: perUnits(0.125, 0.5),
  /** Extra length on mitered border strips, trimmed after sewing (0 = cut exact). */
  miterSlack: perUnits(2, 5),
  /** Fabric rounding step: ⅛ yd = 4.5″; 10 cm. */
  fabricStep: perUnits(4.5, 10),
  overhang: perUnits(4, 10),
  bindingWidth: perUnits(2.5, 6),
  cutLine: 'solid' as 'solid' | 'dashed',
  sewLine: 'dashed' as 'dashed' | 'dotted' | 'solid' | 'none',
  grain: true,
  /** Templates: cutting line around the finished shape (off: finished size, for paper piecing). */
  seamAllowance: true,
  trimPoints: false,
  shadeSeam: false,
  curveMarks: true,
  /**
   * Checked: printed on the template; unchecked: under it. `color`: fabric numbers in template codes
   * (A-2), one template per fabric, with a legend.
   */
  labels: { letter: true, counts: true, size: false, color: false },
  tint: false,
  onePerPage: false,
  /** A scale square on each template (the quilt picture page always has one). */
  squareOnTemplate: true,
  /** "SA = ¼″" in each template's seam allowance. */
  seamLabel: true,
  /** Label the block page's picture with template codes (then template pages skip their key). */
  keyOnBlockPage: true,
  lineWeight: 'thin' as 'thin' | 'medium' | 'thick',
  mirror: false,
  outline: false,
  /** The quilt picture shows the quilt's reference overlay (when it's enabled in Layout), in the
   *  quilt's tint with this fill strength (the outline always prints fully). */
  showOverlay: false,
  overlayOpacity: 0.3,
  /** The quilt picture's size against its usual fit (0.75…1.5); never past true size, the page's
   *  width, or its height less a caption. */
  pictureSize: 1,
  /** What the quilt picture page shows. */
  picture: {
    header: false,
    title: true,
    author: true,
    projectName: true,
    footer: false,
    scaleSquare: true,
    scale: true,
    finished: true,
    trimNote: true,
    notes: true,
  },
  blockSections: ['templates', 'rotary'] as BlockSection[],
  quiltSections: ['picture', 'blocks', 'yardage', 'rotary', 'templates'] as QuiltSection[],
};
export type PrintPrefs = typeof PRINT_DEFAULTS;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** `raw` over `def`, keeping only values of the same type (settings are untrusted). */
function mergeLike<T>(def: T, raw: unknown): T {
  if (isObj(def)) {
    if (!isObj(raw)) return def;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(def)) out[k] = mergeLike(def[k], raw[k]);
    return out as T;
  }
  if (Array.isArray(def))
    return (Array.isArray(raw) && raw.every((x) => typeof x === 'string') ? raw : def) as T;
  return (typeof raw === typeof def ? raw : def) as T;
}

export const printPrefs = (raw: unknown): PrintPrefs => mergeLike(PRINT_DEFAULTS, raw);

export const PAPERS = [
  { id: 'letter', label: 'Letter (8½ × 11 in)', mm: [215.9, 279.4] },
  { id: 'legal', label: 'Legal (8½ × 14 in)', mm: [215.9, 355.6] },
  { id: 'a4', label: 'A4 (21 × 29.7 cm)', mm: [210, 297] },
] as const;
export type PaperId = (typeof PAPERS)[number]['id'];

export interface WidthOption {
  id: string;
  label: string;
  /** Usable width across the fabric (project units). */
  usable: number;
  fatQuarter?: { depth: number };
}
export const WIDTHS: Record<Units, WidthOption[]> = {
  in: [
    { id: '42', label: '42″ (40″ usable)', usable: 40 },
    { id: '44', label: '44″ (42″ usable)', usable: 42 },
    { id: '60', label: '60″ (58″ usable)', usable: 58 },
    { id: 'fq', label: 'Fat quarters (18″ × 21″)', usable: 20, fatQuarter: { depth: 18 } },
  ],
  cm: [
    { id: '110', label: '110 cm (105 cm usable)', usable: 105 },
    { id: '150', label: '150 cm (145 cm usable)', usable: 145 },
    { id: 'fq', label: 'Fat quarters (50 × 55 cm)', usable: 53, fatQuarter: { depth: 50 } },
  ],
};

export const ROUNDINGS: Record<Units, { value: number; label: string }[]> = {
  in: [
    { value: 0.125, label: '⅛″' },
    { value: 0.0625, label: '1/16″' },
    { value: 0, label: 'None' },
  ],
  cm: [
    { value: 0.5, label: '5 mm' },
    { value: 0.1, label: '1 mm' },
    { value: 0, label: 'None' },
  ],
};

export const FABRIC_STEPS: Record<Units, { value: number; label: string }[]> = {
  in: [
    { value: 4.5, label: '⅛ yd' },
    { value: 9, label: '¼ yd' },
    { value: 18, label: '½ yd' },
  ],
  cm: [
    { value: 10, label: '10 cm' },
    { value: 20, label: '20 cm' },
    { value: 45, label: '45 cm' },
  ],
};

/** The chosen option, falling back to the first when the stored id isn't offered. */
export const pick = <T extends { id: string }>(list: readonly T[], id: string) =>
  list.find((x) => x.id === id) ?? list[0]!;
