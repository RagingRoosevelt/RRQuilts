// How far apart two colors look ("redmean": weighted RGB, cheap and close to perception), and the
// nearest of a set. The palette swap and auto mapping (spec 024) both pick by it.
export type RGB = readonly [number, number, number];

export function colorDistance([r1, g1, b1]: RGB, [r2, g2, b2]: RGB) {
  const rm = (r1 + r2) / 2;
  const [dr, dg, db] = [r1 - r2, g1 - g2, b1 - b2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/** The candidate closest to `rgb` (undefined when there are none; ties: the earlier one). */
export const nearestColor = <T extends { rgb: readonly number[] }>(
  rgb: RGB,
  candidates: readonly T[],
) =>
  candidates.reduce<T | undefined>(
    (best, c) =>
      !best || colorDistance(rgb, c.rgb as RGB) < colorDistance(rgb, best.rgb as RGB) ? c : best,
    undefined,
  );
