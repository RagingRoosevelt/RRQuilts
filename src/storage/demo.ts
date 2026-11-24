// Demo projects shipped with the app (public/demo, precached for offline use), opened by a link:
// /?open_demo=<name>.rrq (owner, 2026-11-23). Only files in the app's own demo folder: a bare name,
// demo/<name>, or this site's link to one. Never another site (constitution Principle II).

/** The demo projects in public/demo, for the welcome wizard and the home page's Open a demo. */
export const DEMOS = [
  {
    file: 'block-quilts.rrq',
    title: 'Block and patch quilts',
    about:
      'Medallions on point, diamond blocks with sashing, pieced strips for a shirt back and tumbling cubes.',
    icon: 'grid_view',
  },
  {
    file: 'traditional-epp.rrq',
    title: 'Traditional English paper piecing',
    about:
      'Grandmother’s Flower Garden with leaves and a green border, a Lone Star, and cube corners in half hexagons.',
    icon: 'hexagon',
  },
  {
    file: 'temperature.rrq',
    title: 'Temperature quilts',
    about:
      'A year of daily highs as 365 squares, a month per row, highs and lows week by week, and month pinwheels.',
    icon: 'thermostat',
  },
  {
    file: '3d-epp.rrq',
    title: '3D English paper piecing',
    about:
      'A star pillow, a pincushion, dice from d4 to d20, a soccer ball and a Moravian star, folded and stuffed.',
    icon: '3d_rotation',
  },
] as const;

const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.rrq$/i;
const MAX = 50 * 1024 * 1024;

/** The demo file `v` names, or null when it isn't one of this app's demo projects. */
export function demoName(
  v: string,
  origin = location.origin,
  base: string = import.meta.env.BASE_URL,
): string | null {
  const s = v.trim();
  if (NAME.test(s)) return s;
  if (s.startsWith('demo/') && NAME.test(s.slice(5))) return s.slice(5);
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const dir = `${base.endsWith('/') ? base : `${base}/`}demo/`;
  if (u.origin !== origin || !u.pathname.startsWith(dir)) return null;
  const name = decodeURIComponent(u.pathname.slice(dir.length));
  return NAME.test(name) ? name : null;
}

/** A demo project's text. */
export async function demoText(name: string): Promise<string> {
  const r = await fetch(`${import.meta.env.BASE_URL}demo/${encodeURIComponent(name)}`);
  const text = r.ok ? await r.text() : '';
  // A missing file can come back as the app's page (an SPA fallback), not an error.
  if (!text.trimStart().startsWith('{'))
    throw new Error(`There's no demo project called "${name}".`);
  if (text.length > MAX) throw new Error(`"${name}" is too big to open (over 50 MB).`);
  return text;
}
