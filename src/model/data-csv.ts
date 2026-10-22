// Reading a CSV (or pasted columns) into data quilt values (spec 025 User Stories 4 and 5): rows and
// columns, a date column, a column per value slot. Files are the quilter's and untrusted: bad rows
// are counted and skipped, never thrown on.
import type { DayValues } from './schema/data-quilt';

const MAX_ROWS = 5000;

/** Rows of cells: comma, semicolon or tab separated (whichever the first line uses most), with
 *  double-quoted cells. */
export function parseCsv(text: string): string[][] {
  const first = text.split(/\r?\n/, 1)[0] ?? '';
  const sep = [',', ';', '\t'].reduce((a, b) =>
    first.split(b).length > first.split(a).length ? b : a,
  );
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length && rows.length < MAX_ROWS; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && !cell) quoted = true;
    else if (c === sep) {
      row.push(cell.trim());
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some((x) => x)) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((x) => x) && rows.length < MAX_ROWS) rows.push(row);
  return rows;
}

const pad = (n: number) => String(n).padStart(2, '0');
const valid = (y: number, m: number, d: number) => {
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

/** A date cell as `YYYY-MM-DD`: 2027-03-05, 2027/3/5, or 3/5/2027 (month first). */
export function parseDate(s: string): string | undefined {
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T ].*)?$/.exec(s);
  let y: number, mo: number, d: number;
  if (m) [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  else if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)))
    [y, mo, d] = [Number(m[3]), Number(m[1]), Number(m[2])];
  else return undefined;
  return valid(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : undefined;
}

/** A value cell: a number when it starts as one (72, -3.5, 3,5, 72°F), else its text. */
function cellValue(s: string): number | string | null {
  if (!s) return null;
  const num = s.replace(/[^\d.,+-]/g, '').replace(',', '.');
  return /^[+-]?\d/.test(s) && /^[+-]?\d+(\.\d+)?$/.test(num) ? Number(num) : s.slice(0, 40);
}

/** Whether the first row names the columns (its date cell isn't a date). */
export const hasHeader = (rows: string[][], dateCol: number) =>
  !!rows[0] && !parseDate(rows[0][dateCol] ?? '');

/** The column most of whose cells are dates (default 0). */
export function guessDateColumn(rows: string[][]): number {
  const n = Math.max(0, ...rows.map((r) => r.length));
  let best = 0;
  let most = -1;
  for (let c = 0; c < n; c++) {
    const k = rows.slice(0, 50).filter((r) => parseDate(r[c] ?? '')).length;
    if (k > most) [best, most] = [c, k];
  }
  return best;
}

/** Values by date from `rows`: `cols[i]` is the column feeding value slot i (null: none). */
export function csvValues(
  rows: string[][],
  dateCol: number,
  cols: readonly (number | null)[],
): { values: DayValues; read: number; skipped: number } {
  const values: DayValues = {};
  let read = 0;
  let skipped = 0;
  rows.slice(hasHeader(rows, dateCol) ? 1 : 0).forEach((r) => {
    const date = parseDate(r[dateCol] ?? '');
    if (!date) return void skipped++;
    values[date] = cols.map((c) => (c === null ? null : cellValue(r[c] ?? '')));
    read++;
  });
  return { values, read, skipped };
}
