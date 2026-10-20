# /// script
# dependencies = ["playwright"]
# ///
"""Pictures of every quilt and block in project samples, drawn by a release's own build.

    uv run scripts/format-images.py <release docs/ dir> test/fixtures/formats/project-v6.rrq ...

Each project gets a folder next to it (project-v6/) with one PNG per quilt and block, saved with
the app's Save image (`--quilts-only`: quilts only). Get a release's build with `git worktree add <dir> vX.Y.Z` (its docs/).
First run: `uv run --with playwright playwright install firefox`.
"""

import functools
import http.server
import json
import sys
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if a != "--quilts-only"]
quilts_only = "--quilts-only" in sys.argv
docs, projects = Path(args[0]).resolve(), [Path(p).resolve() for p in args[1:]]
root = Path(tempfile.mkdtemp())
(root / "RRQuilts").symlink_to(docs)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


handler = functools.partial(Quiet, directory=str(root))
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/RRQuilts/"


def save_all(page, out: Path, names: set[str]):
    """Save image from the Actions menu of each card named in `names` (once each)."""
    buttons = page.get_by_role("button", name="Actions")
    for i in range(buttons.count()):
        card = buttons.nth(i).locator("xpath=ancestor::*[.//img][1]")
        lines = {x.strip() for x in card.inner_text().splitlines()}
        name = next((n for n in names if n in lines), None)
        if not name:
            continue
        names.discard(name)
        buttons.nth(i).click()
        item = page.locator(".q-menu .q-item").filter(has_text="Save image")
        if not item.count():
            page.keyboard.press("Escape")
            continue
        with page.expect_download() as d:
            item.first.click()
        dl = d.value
        dl.save_as(out / dl.suggested_filename)
        print("  ", dl.suggested_filename)
        page.wait_for_timeout(200)


with sync_playwright() as p:
    browser = p.firefox.launch()
    for rrq in projects:
        out = rrq.with_suffix("")
        out.mkdir(exist_ok=True)
        print(rrq.name)
        page = browser.new_page(viewport={"width": 1400, "height": 1000}, accept_downloads=True)
        page.goto(base)
        page.evaluate(
            "localStorage.setItem('rrq.settings', JSON.stringify({welcomeDone: true, authorAsked: true}))"
        )
        page.reload()
        page.wait_for_timeout(2000)
        with page.expect_file_chooser() as fc:
            page.get_by_role("button", name="Open a project file").click()
        fc.value.set_files(str(rrq))
        page.wait_for_url("**/project**")
        page.wait_for_timeout(2000)
        # A notice on open (e.g. library updates for blocks redrawn since): close it unanswered.
        close = page.locator(".q-dialog button[aria-label=Close]")
        if close.count():
            close.first.click()
            page.wait_for_timeout(500)
        project = json.loads(rrq.read_text())["project"]
        save_all(page, out, {q["notecard"]["name"] for q in project["quilts"]})
        if quilts_only:
            page.close()
            continue
        page.get_by_role("tab", name="Blocks").click()
        page.wait_for_timeout(1000)
        # Library sections draw their cards as they scroll into view.
        for _ in range(60):
            page.mouse.wheel(0, 800)
            page.wait_for_timeout(100)
        # Blocks in the project (own and from libraries), not the hidden plain block.
        save_all(page, out, {b["notecard"]["name"] for b in project["blocks"] if b["id"] != "plain"})
        page.close()
    browser.close()
server.shutdown()
