import { describe, expect, it } from 'vitest';
import { complement } from '@/render/draw';

describe('highlight color', () => {
  it('is the overlay tint’s opposite hue', () => {
    expect(complement('#1976d2')).toBe('hsl(30 100% 50%)'); // the default blue: orange
    expect(complement('#ff0000')).toBe('hsl(180 100% 50%)');
    expect(complement('#00ff00')).toBe('hsl(300 100% 50%)');
    expect(complement('#ff0000', 120)).toBe('hsl(120 100% 50%)');
  });
});
