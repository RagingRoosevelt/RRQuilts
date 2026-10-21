// Built-in sample data for data quilts (spec 025): one made-up year of a temperate place, a value
// per calendar day (1 January = index 0, 365 days; 29 February reads 28 February's). Generated
// from a fixed seed, so it's the same everywhere and needs no download.

export interface SampleSeries {
  id: string;
  label: string;
  /** Numbers by day of the year (0–364). */
  values: readonly number[];
  unit?: string;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function build(): SampleSeries[] {
  const r = rng(2027);
  const season = (d: number, peak: number) => Math.cos((2 * Math.PI * (d - peak)) / 365);
  const high: number[] = [];
  const low: number[] = [];
  const mood: number[] = [];
  const daylight: number[] = [];
  const rain: number[] = [];
  let m = 3;
  let drift = 0;
  for (let d = 0; d < 365; d++) {
    drift = drift * 0.7 + (r() - 0.5) * 8;
    const h = 58 + 24 * season(d, 200) + drift;
    high.push(Math.round(h));
    low.push(Math.round(h - 14 - r() * 8));
    if (r() < 0.3) m = Math.min(5, Math.max(1, m + (r() < 0.5 ? -1 : 1)));
    mood.push(m);
    daylight.push(Math.round((12.2 + 3.1 * season(d, 172)) * 10) / 10);
    rain.push(r() < 0.7 ? 0 : Math.round(-Math.log(1 - r()) * 0.35 * 100) / 100);
  }
  return [
    { id: 'high', label: 'Daily high', values: high, unit: '°F' },
    { id: 'low', label: 'Daily low', values: low, unit: '°F' },
    { id: 'mood', label: 'Mood (1 to 5)', values: mood },
    { id: 'daylight', label: 'Hours of daylight', values: daylight, unit: 'h' },
    { id: 'rainfall', label: 'Rainfall', values: rain, unit: 'in' },
  ];
}

let cached: SampleSeries[] | undefined;
/** The built-in set `sample` (the only one for now). */
export const sampleSeries = (): SampleSeries[] => (cached ??= build());
export const SAMPLE_SET = 'sample';
