// Saved files as readable JSON: indented 2 spaces, with anything short (a point, a node, a fill)
// kept on one line, so a file reads well in a text editor or a gist without tripling in size.

const WIDTH = 80;

/** `v` on one line ("[1, 2]", '{"a": 1}'), or null once it passes `budget` characters. */
function inline(v: unknown, budget: number): string | null {
  if (v === null || typeof v !== 'object') {
    if (typeof v === 'string' && v.length > budget) return null; // big embedded images: no encoding
    const s = JSON.stringify(v) ?? 'null';
    return s.length <= budget ? s : null;
  }
  const arr = Array.isArray(v);
  const parts: string[] = [];
  let used = 2;
  for (const [k, x] of arr ? v.entries() : Object.entries(v)) {
    if (!arr && (x === undefined || typeof x === 'function')) continue;
    const key = arr ? '' : `${JSON.stringify(k)}: `;
    const s = inline(arr && x === undefined ? null : x, budget - used - key.length);
    if (s === null) return null;
    parts.push(key + s);
    used += key.length + s.length + 2;
    if (used > budget) return null;
  }
  return arr ? `[${parts.join(', ')}]` : `{${parts.join(', ')}}`;
}

function format(v: unknown, indent: string): string {
  const one = inline(v, WIDTH - indent.length);
  if (one !== null || v === null || typeof v !== 'object') return one ?? JSON.stringify(v);
  const pad = indent + '  ';
  if (Array.isArray(v))
    return `[\n${v.map((x) => pad + format(x === undefined ? null : x, pad)).join(',\n')}\n${indent}]`;
  const rows = Object.entries(v)
    .filter(([, x]) => x !== undefined && typeof x !== 'function')
    .map(([k, x]) => `${pad}${JSON.stringify(k)}: ${format(x, pad)}`);
  return rows.length ? `{\n${rows.join(',\n')}\n${indent}}` : '{}';
}

/** JSON for a saved file: the same data as `JSON.stringify(v)`, laid out to read. */
export const prettyJson = (v: unknown): string => format(v, '');
