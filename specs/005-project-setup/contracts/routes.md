# Contract: Routes (history mode, under base path)

| Path | Page | Requires open project |
|---|---|---|
| `/` | Home | no |
| `/project` | Project sketchbook (placeholder) | yes |
| `/project/quilt/:id` | Quilt editor (placeholder) | yes |
| `/project/block/:id` | Block editor (placeholder) | yes |
| `/project/image/:id` | Image editor (placeholder) | yes |
| `/libraries` | Library manager (placeholder) | no |
| `/settings` | Settings (theme, export/import `.rrq_conf`) | no |
| anything else | Not found, link to Home | no |

Guard: navigating to a "yes" route without an open project redirects to `/` and shows "Open a
project first".

Fallbacks that make deep links work: Pages `404.html`, nginx `try_files … /index.html`, Workbox
`navigateFallback`.
