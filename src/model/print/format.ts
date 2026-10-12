// Lengths as quilters write them: 3½″, 3 5/16″, 9.5 cm.
import type { Units } from '../schema/project';

const EIGHTHS = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];

/** Sixteenths as a ruler reads them: 3½, 3 5/16, ¼, 0. */
function ruler(sixteenths: number) {
  const whole = Math.floor(sixteenths / 16);
  const rest = sixteenths % 16;
  const frac = rest % 2 === 0 ? EIGHTHS[rest / 2]! : ` ${rest}/16`;
  return `${whole || !frac ? whole : ''}${frac}`.trim();
}

/**
 * Inches as a fraction when on a 1/16 mark; otherwise decimals with the nearest ruler mark
 * (3.333″ (~ 3 5/16″)).
 */
export function fmtLen(x: number, units: Units): string {
  if (units === 'cm') return `${Number(x.toFixed(2))} cm`;
  const sixteenths = Math.round(x * 16);
  if (Math.abs(sixteenths / 16 - x) <= 1e-4) return `${ruler(sixteenths)}″`;
  return `${Number(x.toFixed(3))}″ (~ ${ruler(sixteenths)}″)`;
}

/** Yards (inches projects) or centimeters of fabric. */
export const fmtFabric = (inUnits: number, units: Units) =>
  units === 'cm'
    ? `${Math.round(inUnits)} cm`
    : `${fmtLen(inUnits / 36, 'in').replace('″', '')} yd`;

/** Round up to a multiple of `step` (0 = no rounding). */
export const roundUp = (x: number, step: number) => (step ? Math.ceil(x / step - 1e-9) * step : x);
