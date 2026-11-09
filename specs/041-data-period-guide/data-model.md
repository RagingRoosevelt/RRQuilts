# Data Model: Making a Data Quilt (spec 041)

## Project file: rrq v11

`DataPlan` (`src/model/schema/data-quilt.ts`) gains two optional fields. Nothing else changes.

| Field | Type | Meaning |
| --- | --- | --- |
| `made` | `Record<DateKey, DayMade>` | Per period day: when it was cut and assembled. A key with neither is deleted. |
| `blocksMade` | `Record<string, DateKey>` | Per plan number (index into `dataNumbers(plan)`, as a string): when the block was assembled. |

`DayMade = { cut?: DateKey; assembled?: DateKey }` (each the date the mark was set).

Validation (untrusted input): keys are valid `DateKey`s inside the period (others dropped on load,
reported as repaired), `blocksMade` keys are integers `0 ≤ k < numberCount(plan)`.

Migration 10 → 11: none (fields optional); `VERSION = 11`; `public/schemas/rrq.v11.json`;
`formats.json` `rrq: 11`; fixtures `project-v11.rrq` and `demo-v11.rrq` (+ `demo-v11/` PNGs) at
release (constitution, File Formats).

Rules:
- `replan`/`relabel`/`setLead` drop `blocksMade` entries whose index is gone.
- Clearing a day's entry keeps its marks (the quilter may have cut it already).
- Assembled implies nothing about cut, and the reverse (two independent marks).

## Device stores (IndexedDB `rrquilts`, VERSION 3 → 4)

### `known` (new)

```ts
interface KnownProject {
  id: string;                    // project id
  name: string;
  handle?: FileSystemFileHandle; // where the browser has them
  quilts: { id: string; name: string }[]; // its data quilts (on)
  seenAt: number;                // last open or save
}
```

Written on open and save of a project with data quilts; deleted when it has none or the file is
gone (read fails with NotFoundError).

### `pending` (new)

```ts
interface PendingData {
  id: string;                    // project id
  quilts: Record<string, {       // quilt id
    entries?: Record<DateKey, (number | string | null)[]>; // only changed days, full row
    made?: Record<DateKey, DayMade | null>;                 // null = cleared
    blocksMade?: Record<string, DateKey | null>;
  }>;
  updatedAt: number;
}
```

Applied by `applyPending(doc, pending)` (pure, `src/model/data-pending.ts`) when the project is
loaded; a quilt or day that no longer exists is skipped. Deleted after it's applied.

### `drafts` (unchanged)

Updated in place for a dirty draft not open in a tab (stays dirty).

## In memory

- `stores/data-quilts.ts`: the list (known + drafts + the open project), docs read this session
  (by project id), and the steps page's input `{ doc, quiltId, days | numbers }`.
- A **data source** per dialog: `{ kind: 'open' | 'draft' | 'file', projectId, doc }` with
  `write(change)` routing to `project.change`, `putDraft`, or `pending` (research R3).

## Derived (model, framework-free)

- `dayColor(quilt, slot, date): Fill | undefined` (`model/data-quilt.ts`).
- `lastEntry(plan): DateKey | undefined` (latest date with any value).
- `daySteps(doc, quilt, days)` / `blockSteps(doc, quilt, k)` (`model/print/data-steps.ts`):

```ts
interface DayStep {
  date: DateKey;
  number?: number;           // plan number index; undefined when not placed
  reason?: 'no-entry' | 'not-placed' | 'past';
  values: { slot: number; value: number | string; fill: Fill; label: string }[];
  pieces: { space: string; slot: number; letter: string; fill: Fill; count: number }[];
  made?: DayMade;
}
```

- `nextDays(plan, today)`: entered and not cut, oldest first (the default pick for Next steps).
