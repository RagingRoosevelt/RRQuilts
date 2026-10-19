# /// script
# dependencies = ["playwright", "pillow"]
# ///
"""Compare the demo projects' stored pictures with what a build draws today, as one HTML page.

    uv run scripts/compare-images.py [build docs/ dir] [output.html]

Defaults: `docs` (run `make build` first) and `.cache/picture-check.html`. Every
test/fixtures/formats/demo-vN.rrq is opened in that build and its quilts and blocks saved
(scripts/format-images.py); each picture is shown beside its stored copy from demo-vN/ with a
difference image, changed pictures first. Claude publishes the page for the owner to check.
"""

import base64
import html
import io
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageChops

repo = Path(__file__).resolve().parent.parent
docs = Path(sys.argv[1] if len(sys.argv) > 1 else repo / "docs").resolve()
out = Path(sys.argv[2] if len(sys.argv) > 2 else repo / ".cache/picture-check.html").resolve()
formats = repo / "test/fixtures/formats"
SIDE = 480  # shown size; differences are measured at this size too
demos = sorted(formats.glob("demo-v*.rrq"), key=lambda p: int(p.stem.split("-v")[1]))

tmp = Path(tempfile.mkdtemp())
for d in demos:
    shutil.copy(d, tmp / d.name)
subprocess.run(
    ["uv", "run", str(repo / "scripts/format-images.py"), str(docs), *[str(tmp / d.name) for d in demos]],
    check=True,
)


def load(p: Path):
    if not p.exists():
        return None
    im = Image.open(p).convert("RGBA")
    im.thumbnail((SIDE, SIDE))
    flat = Image.new("RGB", im.size, (255, 255, 255))
    flat.paste(im, mask=im)
    return flat


def uri(im) -> str:
    b = io.BytesIO()
    im.save(b, "WEBP", quality=82)
    return "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()


def compare(a, b):
    """Share of pixels that changed visibly, and a picture of where (red over a faded copy)."""
    if a.size != b.size:
        return 1.0, None
    d = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 24 else 0)
    share = sum(d.histogram()[255:]) / (a.size[0] * a.size[1])
    faded = Image.blend(b.convert("L").convert("RGB"), Image.new("RGB", b.size, "white"), 0.7)
    faded.paste(Image.new("RGB", b.size, (214, 40, 40)), mask=d)
    return share, faded


sections, total, changed = [], 0, 0
for d in demos:
    stored_dir, now_dir = formats / d.stem, tmp / d.stem
    names = sorted({p.name for p in stored_dir.glob("*.png")} | {p.name for p in now_dir.glob("*.png")})
    v = d.stem.split("-v")[1]
    rows = []
    # Reference labels (v6.07) number pictures by name, so they stay put between runs.
    for k, n in enumerate(names, 1):
        ref = f"v{v}.{k:02d}"
        a, b = load(stored_dir / n), load(now_dir / n)
        if a and b:
            share, diff = compare(a, b)
            state = "same" if share < 0.001 else "changed"
        else:
            share, diff, state = 1.0, None, "missing" if a else "new"
        rows.append((state != "same", -share, ref, n, state, share, a, b, diff))
    rows.sort()
    total += len(rows)
    changed += sum(r[0] for r in rows)
    cards = []
    for _, _, ref, n, state, share, a, b, diff in rows:
        label = {
            "same": "Same",
            "changed": f"Changed {share:.1%}",
            "missing": "Not drawn now",
            "new": "New, nothing stored",
        }[state]
        cell = lambda im, cap: (
            f'<figure><img src="{uri(im)}" alt="{cap}: {html.escape(n[:-4])}"><figcaption>{cap}</figcaption></figure>'
            if im
            else f'<figure class="none"><div>None</div><figcaption>{cap}</figcaption></figure>'
        )
        cards.append(
            f'<article class="pic {state}" id="{ref}"><header><span class="ref">{ref}</span>'
            f"<h3>{html.escape(n[:-4])}</h3>"
            f'<span class="chip {state}">{label}</span></header><div class="trio">'
            f"{cell(a, 'Release')}{cell(b, 'Now')}{cell(diff, 'Difference') if diff else ''}"
            "</div></article>"
        )
    n_changed = sum(r[0] for r in rows)
    sections.append(
        f'<section><h2>Project format v{v} <small>{len(rows)} pictures, {n_changed} changed</small></h2>'
        + "".join(cards)
        + "</section>"
    )

page = (repo / "scripts/compare-images.html").read_text()
page = (
    page.replace("{{SUMMARY}}", f"{changed} of {total} pictures changed" if changed else f"All {total} pictures match")
    .replace("{{STATE}}", "changed" if changed else "same")
    .replace("{{BUILD}}", html.escape(str(docs.relative_to(repo) if docs.is_relative_to(repo) else docs)))
    .replace("{{SECTIONS}}", "".join(sections))
)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(page)
shutil.rmtree(tmp)
print(out, f"({changed} of {total} changed)")
