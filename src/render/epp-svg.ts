// EPP polygons (a rosette in one coloring) as an SVG picture's address, for <img> (the palette swap
// dialog's before and after), drawn as EppThumb draws them.
import { bbox, type Poly } from '@/model/epp/geometry';

export function eppSvg(polys: readonly { poly: Poly; fill?: string | undefined }[]): string {
  if (!polys.length) return '';
  const [x0, y0, x1, y1] = bbox(polys.map((p) => p.poly));
  const [w, h] = [Math.max(x1 - x0, 1e-3), Math.max(y1 - y0, 1e-3)];
  const pad = Math.max(w, h) * 0.04;
  const stroke = Math.max(w, h) / 200;
  const paths = polys
    .map(
      (p) =>
        `<path d="M${p.poly.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join('L')}Z" fill="${
          p.fill ?? 'rgba(128,128,128,0.15)'
        }"/>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - pad} ${y0 - pad} ${w + 2 * pad} ${h + 2 * pad}" width="500" height="${Math.round((500 * (h + 2 * pad)) / (w + 2 * pad))}"><g stroke="#555" stroke-width="${stroke}">${paths}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
