import { Notify } from 'quasar';
import { register } from 'register-service-worker';

// New versions wait until the user accepts; the app never reloads on its own.
register(import.meta.env.QUASAR_SERVICE_WORKER_FILE, {
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
