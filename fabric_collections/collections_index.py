"""collections.json beside each manufacturer's downloads: one entry per collection, kept across runs.

Entries are keyed by `url`; a run updates the ones it saw (and stamps last_seen) and adds new ones.
Collections no longer listed keep their entry, with the last date they were seen.
"""
import datetime, json
from pathlib import Path


def update(path: Path, rows: list[dict]):
    old = {}
    if path.exists():
        old = {r['url']: r for r in json.loads(path.read_text(encoding='utf-8'))}
    today = datetime.date.today().isoformat()
    for r in rows:
        old[r['url']] = {**old.get(r['url'], {}), **r, 'last_seen': today}
    path.write_text(json.dumps(list(old.values()), indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
