# Data Model: Project Setup

Only one persisted entity in this feature.

## Settings (on-device; exported as `.rrqconf`)

Stored in `localStorage` under key `rrq.settings` as the full document below.

| Field | Type | Rules |
|---|---|---|
| `format` | `"rrqconf"` | required, exact |
| `version` | integer | required; `1` for this feature; newer → reject "update the app" |
| `app` | string | app version that wrote it; informational |
| `settings.theme` | `"auto"` \| `"light"` \| `"dark"` | default `"auto"` |
| `settings.units` | `"in"` \| `"cm"` | default `"in"` (used by later features) |
| `settings.hintsDismissed` | string[] | ids of dismissed first-use hints; default `[]` |

- Unknown keys under `settings` are preserved on load/save/export (later features add keys).
- Invalid value for a known key → that key falls back to its default; import reports which keys.
- Storage unavailable/throwing/corrupt → in-memory defaults; app keeps working.

### Lifecycle

`load()` → (missing|corrupt → defaults) → reactive store → every change `save()` →
`export()` produces the document as a `.rrqconf` download → `import(file)` validates →
merges into current settings → `save()`.

## Project store (stub)

In-memory only for this feature: `{ isOpen: boolean }`. Used by the route guard. Replaced by the real
project model (spec 003) later.
