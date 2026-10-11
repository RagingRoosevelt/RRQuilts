import { defineRouter } from '#q-app';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import routes, { projectGuard } from './routes';
import { useProjectStore } from '@/stores/project';

export default defineRouter(() => {
  // Mode and base come from quasar.config.ts (build.vueRouterMode / build.publicPath).
  const createHistory =
    import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory;

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  router.beforeEach((to) => projectGuard(to, useProjectStore().isOpen));

  return router;
});
