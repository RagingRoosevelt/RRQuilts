import { register } from 'register-service-worker';
import { found, ready } from '../src/session/update';

// New versions wait until the user accepts; the app never reloads on its own. The update dialog
// (spec 054) opens when a new version is found, while it downloads.
const HOUR = 60 * 60 * 1000;

register(import.meta.env.QUASAR_SERVICE_WORKER_FILE, {
  // Browsers only look for a new worker on page load (or ~daily); an installed app can stay open
  // for hours, so also check when it regains focus and hourly. Offline checks fail quietly.
  registered(registration) {
    const check = () => void registration.update().catch(() => {});
    setInterval(check, HOUR);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  },
  updatefound: found,
  updated: ready,
});
