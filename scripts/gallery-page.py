# /// script
# dependencies = ["playwright", "pillow"]
# ///
"""Layout gallery page: every variation in test/gallery/variations.ts drawn by a build, with what it
should show and its key settings, newest first. Run by `make gallery` after the gallery project is
built (.cache/gallery/gallery.rrq + gallery.json). Writes .cache/gallery.html; the page stays local.

    uv run scripts/gallery-page.py [build docs/ dir]
"""

import base64
import html
import io
import json
import shutil
import subprocess
import sys
from itertools import groupby
from pathlib import Path

from PIL import Image

repo = Path(__file__).resolve().parent.parent
docs = Path(sys.argv[1] if len(sys.argv) > 1 else repo / "docs").resolve()
work = repo / ".cache/gallery"
shutil.rmtree(work / "gallery", ignore_errors=True)
subprocess.run(
    ["uv", "run", str(repo / "scripts/format-images.py"), "--quilts-only", "--seams", str(docs), str(work / "gallery.rrq")],
    check=True,
)
pictures = list((work / "gallery").glob("*.png"))
variations = json.loads((work / "gallery.json").read_text())


def picture(v) -> str:
    p = next((p for p in pictures if p.name.startswith(v["id"] + " ")), None)
    if not p:
        return '<figure class="none"><div>Not drawn</div></figure>'
    im = Image.open(p).convert("RGBA")
    im.thumbnail((1080, 1080))
    flat = Image.new("RGB", im.size, (255, 255, 255))
    flat.paste(im, mask=im)
    b = io.BytesIO()
    flat.save(b, "WEBP", quality=85)
    src = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
    return f'<figure><img src="{src}" alt="{html.escape(v["title"])}"></figure>'


def card(v) -> str:
    e = html.escape
    error = f'<p class="error">Failed to build: {e(v["error"])}</p>' if v.get("error") else ""
    items = "".join(f"<li>{e(s)}</li>" for s in v["settings"])
    return (
        f'<article class="pic var" id="{v["id"]}">{picture(v)}<div class="about">'
        f'<header><span class="ref">{v["id"]}</span><h3>{e(v["title"])}</h3></header>'
        f'<p class="expect"><strong>Expect:</strong> {e(v["expect"])}</p>{error}'
        f"<ul>{items}</ul></div></article>"
    )


# Sections follow the catalog order (newest first), one per feature that added variations.
sections = "".join(
    f'<section><h2 data-short="{html.escape(added)}">{html.escape(added)}</h2>{"".join(card(v) for v in vs)}</section>'
    for added, vs in ((a, list(g)) for a, g in groupby(variations, key=lambda v: v["added"]))
)
failed = sum(1 for v in variations if v.get("error"))
summary = f"{len(variations)} variations" + (f", {failed} failed to build" if failed else "")
page = (
    (repo / "scripts/check-page.html")
    .read_text()
    .replace("{{TITLE}}", "Layout Gallery")
    .replace(
        "{{LEDE}}",
        "Quilts built with each layout and its settings, with blocks, solids and mixes, drawn by "
        "today's build. Newest variations first. Check each picture against what it should show, "
        'and tell Claude the reference (like <span class="ref">G012</span>) of anything wrong.',
    )
    .replace("{{BAR}}", f'<span class="chip {"changed" if failed else "same"}">{summary}</span>')
    .replace("{{SECTIONS}}", sections)
)
out = repo / ".cache/gallery.html"
out.write_text(page)
print(out, f"({summary})")
