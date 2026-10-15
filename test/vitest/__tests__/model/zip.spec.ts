import { describe, expect, it } from 'vitest';
import { crc32, readZip, safeZipPath, writeZip } from '@/model/zip';

const bytes = (s: string) => new TextEncoder().encode(s);
// Made by Python's zipfile with deflate: library.json and packs/p/256/x.webp.
const DEFLATED =
  'UEsDBBQAAAAIAE+NTl0OMvW8CwAAAM4AAAAMAAAAbGlicmFyeS5qc29uq1ZKVLIyHCagFgBQSwMEFAAAAAgAT41OXSZMC7cYAQAAAAQAABIAAABwYWNrcy9wLzI1Ni94LndlYnBjYGRiZmFlY+fg5OLm4eXjFxAUEhYRFROXkJSSlpGVk1dQVFJWUVVT19DU0tbR1dM3MDQyNjE1M7ewtLK2sbWzd3B0cnZxdXP38PTy9vH18w8IDAoOCQ0Lj4iMio6JjYtPSExKTklNS8/IzMrOyc3LLygsKi4pLSuvqKyqrqmtq29obGpuaW1r7+js6u7p7eufMHHS5ClTp02fMXPW7Dlz581fsHDR4iVLly1fsXLV6jVr163fsHHT5i1bt23fsXPX7j179+0/cPDQ4SNHjx0/cfLU6TNnz52/cPHS5StXr12/cfPW7Tt3791/8PDR4ydPnz1/8fLV6zdv373/8PHT5y9fv33/8fPX7z9///1nGPX/qP9HsP8BUEsBAhQDFAAAAAgAT41OXQ4y9bwLAAAAzgAAAAwAAAAAAAAAAAAAAIABAAAAAGxpYnJhcnkuanNvblBLAQIUAxQAAAAIAE+NTl0mTAu3GAEAAAAEAAASAAAAAAAAAAAAAACAATUAAABwYWNrcy9wLzI1Ni94LndlYnBQSwUGAAAAAAIAAgB6AAAAfQEAAAAA';
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

describe('zip', () => {
  it('round-trips stored entries', async () => {
    const entries = [
      { name: 'library.json', bytes: bytes('{"a":1}') },
      { name: 'packs/p/512/ü.webp', bytes: new Uint8Array([0, 1, 2, 255]) },
    ];
    expect(await readZip(writeZip(entries))).toEqual(entries);
  });

  it('reads deflated entries', async () => {
    const out = await readZip(b64(DEFLATED));
    expect(out.map((e) => e.name)).toEqual(['library.json', 'packs/p/256/x.webp']);
    expect(new TextDecoder().decode(out[0]!.bytes)).toBe('{"a":' + '1'.repeat(200) + '}');
    expect(out[1]!.bytes.length).toBe(1024);
  });

  it('refuses unsafe paths and oversized content', async () => {
    for (const p of ['../x', '/etc/x', 'a/../../x', 'c:x', 'a\\b'])
      expect(safeZipPath(p)).toBe(false);
    expect(() => writeZip([{ name: '../x', bytes: bytes('') }])).toThrow(/Unsafe/);
    const z = writeZip([{ name: 'big', bytes: new Uint8Array(100) }]);
    await expect(
      readZip(z, { maxEntries: 9, maxEntryBytes: 10, maxTotalBytes: 99 }),
    ).rejects.toThrow(/too large/);
    await expect(readZip(bytes('not a zip at all, honestly'))).rejects.toThrow(/Not a zip/);
  });

  it('computes the standard CRC-32', () => {
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
  });
});
