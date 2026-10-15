import { describe, expect, it } from 'vitest';
import {
  averageOf,
  defaultSize,
  nameFromFile,
  squareCrop,
  targetSizes,
} from '@/editor/fabric-import';

describe('fabric import', () => {
  it('makes 256 and 512, never enlarging', () => {
    expect(targetSizes(2000, 1000)).toEqual([
      { px: 256, width: 256, height: 128 },
      { px: 512, width: 512, height: 256 },
    ]);
    expect(targetSizes(500, 500)).toEqual([
      { px: 256, width: 256, height: 256 },
      { px: 500, width: 500, height: 500 },
    ]);
    expect(targetSizes(200, 100)).toEqual([{ px: 200, width: 200, height: 100 }]);
  });

  it('crops the centred square', () => {
    expect(squareCrop(400, 300)).toEqual({ sx: 50, sy: 0, s: 300 });
  });

  it('averages pixels, ignoring transparent ones', () => {
    expect(averageOf([255, 0, 0, 255, 0, 0, 255, 255, 9, 9, 9, 0])).toEqual([128, 0, 128]);
  });

  it('defaults to 8 in on the long side', () => {
    expect(defaultSize(1000, 500, 'in')).toEqual([8, 4]);
    expect(defaultSize(500, 500, 'cm')).toEqual([20.32, 20.32]);
  });

  it('names fabrics from file names', () => {
    expect(nameFromFile('SGF-40300-Gilded-Ginko-Ice_500px.jpg')).toEqual({
      name: 'Gilded Ginko Ice',
      sku: 'SGF-40300',
    });
    expect(nameFromFile('folder/AQSD-24410-63 Sky.jpg')).toEqual({
      name: 'Sky',
      sku: 'AQSD-24410-63',
    });
    expect(nameFromFile('my_blue_dots.png')).toEqual({ name: 'my blue dots' });
  });
});
