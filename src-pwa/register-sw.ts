import { Notify } from 'quasar';
import { register } from 'register-service-worker';

// New versions wait until the user accepts; the app never reloads on its own.
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
  updated(registration) {
    Notify.create({
      message: 'Update available',
      timeout: 0,
      actions: [
        {
          label: 'Reload',
          color: 'yellow',
          handler: () => {
            navigator.serviceWorker.addEventListener(
              'controllerchange',
              () => window.location.reload(),
              {
                once: true,
              },
            );
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          },
        },
      ],
    });
  },
});
