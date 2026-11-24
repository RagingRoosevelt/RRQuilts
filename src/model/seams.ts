// Seam allowances (owner, 2026-11-14): project settings, one for standard piecing (cut sizes, the
// rotary chart, block and quilt templates) and one for EPP (fabric templates of shapes, rosettes and
// EPP quilts, rosettes in block quilts). Project units; unset = the default for the units.
import type { RrqDoc, Units } from './schema/project';

export type SeamKind = 'piecing' | 'epp';
export type Seams = Record<SeamKind, number>;

export const SEAM_DEFAULTS: Record<Units, Seams> = {
  in: { piecing: 0.25, epp: 0.375 },
  cm: { piecing: 0.6, epp: 1 },
};

/** A project's seam allowances, defaults filled in (no project: the defaults for `units`). */
export function projectSeams(
  doc: Pick<RrqDoc, 'units' | 'project'> | null | undefined,
  units?: Units,
): Seams {
  const u = doc?.units ?? units ?? 'in';
  return { ...SEAM_DEFAULTS[u], ...doc?.project.seams };
}

/** The −/+ step of a seam allowance field: 1/8 in or 1 mm. */
export const seamStep = (units: string) => (units === 'cm' ? 0.1 : 0.125);

/** Sets one of a project's seam allowances in place (an Immer draft); a default is stored unset. */
export function setSeam(doc: Pick<RrqDoc, 'units' | 'project'>, kind: SeamKind, v: number): void {
  const p = doc.project;
  const seams = { ...p.seams };
  if (Math.abs(v - SEAM_DEFAULTS[doc.units][kind]) < 1e-9) delete seams[kind];
  else seams[kind] = v;
  if (Object.keys(seams).length) p.seams = seams;
  else delete p.seams;
}
