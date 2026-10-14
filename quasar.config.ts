// Quasar config: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file
import { defineConfig } from '#q-app';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Base path the site is served under (GitHub Pages project site by default).
const base = process.env.RRQ_BASE || '/RRQuilts/';
const poll = process.env.RRQ_POLL === '1';
const distDir = 'docs';
// Written into saved files as the app version (import.meta.env.APP_VERSION).
const appVersion = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string })
  .version;

export default defineConfig(() => ({
  boot: ['settings'],
  css: ['app.css'],
  // Fonts/icons are bundled locally, so they work offline.
  extras: ['roboto-font', 'material-icons'],

  build: {
    target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari16'], node: 'node24' },
    typescript: { strict: true, vueShim: true },
    vueRouterMode: 'history',
    publicPath: base,
    distDir,
    sourcemap: false,
    defineEnv: { APP_VERSION: appVersion },
    vitePlugins: [
      [
        'vite-plugin-checker',
        {
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
            useFlatConfig: true,
          },
        },
        { server: false },
      ],
    ],
    extendViteConf(viteConf) {
      viteConf.server = {
        ...viteConf.server,
        watch: {
          // Large non-source folders would exhaust file watchers.
          ignored: [
            '**/.cache/**',
            '**/docs/**',
            '**/reference/**',
            '**/fabric_collections/**',
            '**/specs/**',
            '**/.specify/**',
          ],
          // Container bind mounts on some hosts miss file events; RRQ_POLL=1 forces polling.
          ...(poll ? { usePolling: true, interval: 300 } : {}),
        },
      };
    },
    // GitHub Pages: serve the app for unknown paths, and don't run Jekyll.
    afterBuild() {
      copyFileSync(join(distDir, 'index.html'), join(distDir, '404.html'));
      writeFileSync(join(distDir, '.nojekyll'), '');
    },
  },

  devServer: { open: false },

  framework: {
    config: { dark: 'auto' },
    plugins: ['Notify', 'Dark', 'Dialog'],
  },

  animations: [],

  pwa: {
    workboxMode: 'GenerateSW',
    // Never activate a new version until the user accepts the update prompt.
    extendPWAGenerateSWOptions(opts) {
      opts.skipWaiting = false;
    },
    extendPWAManifestJson(json) {
      json.id = base;
      json.short_name = 'RRQuilts';
      json.start_url = base;
      json.scope = base;
    },
  },
}));
