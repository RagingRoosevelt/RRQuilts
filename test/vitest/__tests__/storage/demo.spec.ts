import { describe, expect, it } from 'vitest';
import { demoName } from '@/storage/demo';

describe('demo links (/?open_demo=)', () => {
  const at = (v: string) => demoName(v, 'https://ragingroosevelt.github.io', '/RRQuilts/');
  it('take a file in the app’s demo folder', () => {
    expect(at('3d-epp.rrq')).toBe('3d-epp.rrq');
    expect(at('demo/3d-epp.rrq')).toBe('3d-epp.rrq');
    expect(at('https://ragingroosevelt.github.io/RRQuilts/demo/3d-epp.rrq')).toBe('3d-epp.rrq');
  });
  it('refuse anything else: other sites, other folders, other files, climbing out', () => {
    expect(at('https://example.com/RRQuilts/demo/3d-epp.rrq')).toBeNull();
    expect(at('https://ragingroosevelt.github.io/RRQuilts/schemas/x.rrq')).toBeNull();
    expect(at('https://ragingroosevelt.github.io/RRQuilts/demo/sub/x.rrq')).toBeNull();
    expect(at('../secret.rrq')).toBeNull();
    expect(at('demo/../x.rrq')).toBeNull();
    expect(at('3d-epp.json')).toBeNull();
    expect(at('javascript:alert(1)')).toBeNull();
    expect(at('')).toBeNull();
  });
});
