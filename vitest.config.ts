import { defineConfig, mergeConfig } from 'vitest/config';
import { quasarViteTestingConfig } from '@quasar/quasar-app-extension-testing-unit-vitest/config';

// https://vitest.dev/config/
export default defineConfig(async () =>
  mergeConfig(await quasarViteTestingConfig(), {
    test: {
      environment: 'happy-dom',
      setupFiles: 'test/vitest/setup-file.ts',
      // The first test in a file to use the built-in content builds the whole built-in library
      // (blocks, EPP shapes and rosettes); with every core running a file at once that can take
      // well over vitest's default 5 s. Time-sensitive tests assert their own limits.
      testTimeout: 30_000,
      hookTimeout: 30_000,
      // Half the cores: with one file per core, timed tests (perf.spec: open a big project in
      // under 3 s) lose to the others for CPU and fail on a busy machine.
      maxWorkers: '50%',
      include: [
        // Matches vitest tests in any subfolder of 'src' or into 'test/vitest/__tests__'
        // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
        'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
  }),
);
