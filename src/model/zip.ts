// Minimal zip reading and writing for `.rrqlib` zips and fabric imports (spec 014). Reading handles
// stored and deflated entries (via the platform's DecompressionStream); writing stores entries
// uncompressed, which suits images that are already compressed. Input is untrusted: paths must stay
// inside the archive and sizes are capped.

export interface ZipLimits {
  maxEntries: number;
  maxEntryBytes: number;
  maxTotalBytes: number;
}
export const DEFAULT_LIMITS: ZipLimits = {
  maxEntries: 20_000,
  maxEntryBytes: 20 * 1024 * 1024,
  maxTotalBytes: 2 * 1024 * 1024 * 1024,
};

export interface ZipEntry {
  name: string;
  bytes: Uint8Array<ArrayBuffer>;
}

/** A path that stays inside the archive: relative, no `..`, no backslashes or drive letters. */
export const safeZipPath = (name: string) =>
  !!name &&
  !name.startsWith('/') &&
  !name.includes('\\') &&
  !/^[a-z]:/i.test(name) &&
  !name.split('/').some((part) => part === '..');

async function inflate(data: Uint8Array<ArrayBuffer>, size: number) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const out = new Uint8Array(await new Response(stream).arrayBuffer());
  if (out.length !== size) throw new Error('Zip entry is damaged (wrong size).');
  return out;
}

/** Read every file in a zip (folders skipped). Throws with a readable message on bad input. */
export async function readZip(
  data: Uint8Array<ArrayBuffer>,
  limits: ZipLimits = DEFAULT_LIMITS,
): Promise<ZipEntry[]> {
  const v = new DataView(data.buffer, data.byteOffset, data.byteLength);
  // End of central directory: the last 0x06054b50 within 64 KB + 22 bytes of the end.
  let eocd = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 65_557); i--)
    if (v.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  if (eocd < 0) throw new Error('Not a zip file.');
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  if (count === 0xffff || p === 0xffffffff) throw new Error('Zip64 archives aren’t supported.');
  if (count > limits.maxEntries) throw new Error('The zip has too many files.');
  const dec = new TextDecoder();
  const out: ZipEntry[] = [];
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (p + 46 > data.length || v.getUint32(p, true) !== 0x02014b50)
      throw new Error('Zip directory is damaged.');
    const method = v.getUint16(p + 10, true);
    const packed = v.getUint32(p + 20, true);
    const size = v.getUint32(p + 24, true);
    const nameLen = v.getUint16(p + 28, true);
    const extraLen = v.getUint16(p + 30, true);
    const commentLen = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const name = dec.decode(data.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith('/')) continue;
    if (!safeZipPath(name)) throw new Error(`Unsafe path in zip: ${name}`);
    if (size > limits.maxEntryBytes) throw new Error(`${name} is too large.`);
    total += size;
    if (total > limits.maxTotalBytes) throw new Error('The zip is too large.');
    if (local + 30 > data.length || v.getUint32(local, true) !== 0x04034b50)
      throw new Error(`Zip entry ${name} is damaged.`);
    const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
    const raw = data.slice(start, start + packed);
    if (raw.length !== packed) throw new Error(`Zip entry ${name} is cut short.`);
    if (method === 0) out.push({ name, bytes: raw });
    else if (method === 8) out.push({ name, bytes: await inflate(raw, size) });
    else throw new Error(`${name} uses an unsupported compression.`);
  }
  return out;
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(b: Uint8Array) {
  let c = 0xffffffff;
  for (const x of b) c = CRC[(c ^ x) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Write entries as an uncompressed zip. */
export function writeZip(entries: ZipEntry[]): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const e of entries) {
    if (!safeZipPath(e.name)) throw new Error(`Unsafe path: ${e.name}`);
    const name = enc.encode(e.name);
    const crc = crc32(e.bytes);
    const head = new DataView(new ArrayBuffer(30));
    head.setUint32(0, 0x04034b50, true);
    head.setUint16(4, 20, true);
    head.setUint16(6, 0x0800, true); // UTF-8 names
    head.setUint32(14, crc, true);
    head.setUint32(18, e.bytes.length, true);
    head.setUint32(22, e.bytes.length, true);
    head.setUint16(26, name.length, true);
    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 0x0800, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, e.bytes.length, true);
    dir.setUint32(24, e.bytes.length, true);
    dir.setUint16(28, name.length, true);
    dir.setUint32(42, offset, true);
    parts.push(new Uint8Array(head.buffer), name, e.bytes);
    central.push(new Uint8Array(dir.buffer), name);
    offset += 30 + name.length + e.bytes.length;
  }
  const dirSize = central.reduce((a, b) => a + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, dirSize, true);
  end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
  let at = 0;
  for (const b of all) {
    out.set(b, at);
    at += b.length;
  }
  return out;
}
