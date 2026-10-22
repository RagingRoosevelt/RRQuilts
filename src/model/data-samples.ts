// Built-in sample data for data quilts (spec 025): made-up years, a value per calendar day
// (1 January = index 0, 365 days; 29 February reads 28 February's): a temperate place, and places
// and moods with a character of their own (shaped on real climate averages, not real records).
// Generated from fixed seeds, so they're the same everywhere and need no download.

export interface SampleSeries {
  id: string;
  label: string;
  /** The value kind it suits (a value's Kind offers only these). */
  kind: 'temperature' | 'mood' | 'daylight' | 'rainfall';
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
    { id: 'high', kind: 'temperature', label: 'Daily high', values: high, unit: '°F' },
    { id: 'low', kind: 'temperature', label: 'Daily low', values: low, unit: '°F' },
    ...temps('ak', 'Fairbanks, Alaska', 37, 36, 18, 11),
    ...temps('hi', 'Honolulu, Hawaii', 84.5, 4.5, 12, 1.5),
    { id: 'mood', kind: 'mood', label: 'Mood (1 to 5)', values: mood },
    moods('mood-low', 'Mood, mostly low with good days', 2, 0.12, 5),
    moods('mood-high', 'Mood, an optimist with bad days', 4, 0.12, 1),
    { id: 'daylight', kind: 'daylight', label: 'Hours of daylight', values: daylight, unit: 'h' },
    light('daylight-ak', 'Hours of daylight, Fairbanks, Alaska', 12.75, 9.05),
    light('daylight-tx', 'Hours of daylight, Austin, Texas', 12.15, 1.95),
    { id: 'rainfall', kind: 'rainfall', label: 'Rainfall', values: rain, unit: 'in' },
    // Hilo: rain most days, wetter in winter; Phoenix: rare, in the summer monsoon and winter.
    rains('rain-hi', 'Rainfall, Hilo, Hawaii', (d) => 0.7 + 0.12 * season(d, 0), 0.45),
    rains(
      'rain-az',
      'Rainfall, Phoenix, Arizona',
      (d) => 0.03 + 0.1 * Math.max(0, season(d, 215)) ** 4 + 0.05 * Math.max(0, season(d, 15)) ** 2,
      0.25,
    ),
  ];
}

const season = (d: number, peak: number) => Math.cos((2 * Math.PI * (d - peak)) / 365);
let seed = 100;
/** Daily highs and lows: `mean` ± `swing` over the year (warmest late July), lows `gap` below. */
function temps(
  id: string,
  place: string,
  mean: number,
  swing: number,
  gap: number,
  noise: number,
): SampleSeries[] {
  const r = rng(++seed);
  const high: number[] = [];
  const low: number[] = [];
  let drift = 0;
  for (let d = 0; d < 365; d++) {
    drift = drift * 0.7 + (r() - 0.5) * noise;
    const h = mean + swing * season(d, 200) + drift;
    high.push(Math.round(h));
    low.push(Math.round(h - gap - r() * gap * 0.4));
  }
  return [
    {
      id: `high-${id}`,
      kind: 'temperature',
      label: `Daily high, ${place}`,
      values: high,
      unit: '°F',
    },
    { id: `low-${id}`, kind: 'temperature', label: `Daily low, ${place}`, values: low, unit: '°F' },
  ];
}
/** A mood from 1 to 5 that sits near `usual`, with a day at `other` now and then (`chance`). */
function moods(
  id: string,
  label: string,
  usual: number,
  chance: number,
  other: number,
): SampleSeries {
  const r = rng(++seed);
  const values = Array.from({ length: 365 }, () => {
    if (r() < chance)
      return Math.max(1, Math.min(5, other + (r() < 0.5 ? 0 : other > usual ? -1 : 1)));
    return Math.max(1, Math.min(5, usual + (r() < 0.25 ? (r() < 0.5 ? -1 : 1) : 0)));
  });
  return { id, kind: 'mood', label, values };
}
/** Hours of daylight: `mean` ± `swing`, longest at the June solstice. */
function light(id: string, label: string, mean: number, swing: number): SampleSeries {
  const values = Array.from(
    { length: 365 },
    (_, d) => Math.round((mean + swing * season(d, 172)) * 10) / 10,
  );
  return { id, kind: 'daylight', label, values, unit: 'h' };
}
/** Rain on a day with chance `wet(d)`, amounts around `size` inches. */
function rains(id: string, label: string, wet: (d: number) => number, size: number): SampleSeries {
  const r = rng(++seed);
  const values = Array.from({ length: 365 }, (_, d) =>
    r() < wet(d) ? Math.round(-Math.log(1 - r()) * size * 100) / 100 : 0,
  );
  return { id, kind: 'rainfall', label, values, unit: 'in' };
}

let cached: SampleSeries[] | undefined;
/** The built-in set `sample`: every series. */
export const sampleSeries = (): SampleSeries[] => (cached ??= build());
export const SAMPLE_SET = 'sample';
