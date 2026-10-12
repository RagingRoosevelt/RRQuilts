import { expect } from 'vitest';

/**
 * Speed check that tolerates a busy machine: runs `fn` `runs` times and checks the fastest. On
 * failure the message names the check and lists every run's time.
 */
export function expectFast(name: string, fn: () => unknown, limitMs = 150, runs = 3) {
  const times = Array.from({ length: runs }, () => {
    const t = performance.now();
    fn();
    return performance.now() - t;
  });
  const best = Math.min(...times);
  expect(
    best,
    `${name}: fastest of ${runs} runs must be under ${limitMs} ms (runs: ${times.map((t) => t.toFixed(1)).join(', ')} ms)`,
  ).toBeLessThan(limitMs);
}
