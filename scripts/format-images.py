# /// script
# dependencies = ["playwright"]
# ///
"""Pictures of every quilt and block in project samples, drawn by a release's own build.

    uv run scripts/format-images.py <release docs/ dir> test/fixtures/formats/project-v6.rrq ...

Each project gets a folder next to it (project-v6/) with one PNG per quilt and block, saved with
the app's Save image. Get a release's build with `git worktree add <dir> vX.Y.Z` (its docs/).
First run: `uv run --with playwright playwright install firefox`.
"""

import functools
import http.server
import re
import sys
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

docs, projects = Path(sys.argv[1]).resolve(), [Path(p).resolve() for p in sys.argv[2:]]
root = Path(tempfile.mkdtemp())
(root / "RRQuilts").symlink_to(docs)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


handler = functools.partial(Quiet, directory=str(root))
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/RRQuilts/"


def save_all(page, out: Path, n: int):
    """Save image from the first n cards' Actions menus on the current tab."""
    for i in range(n):
        page.get_by_role("button", name="Actions").nth(i).click()
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
        count = lambda tab: int(re.search(r"\((\d+)\)", page.get_by_role("tab", name=tab).inner_text())[1])
        save_all(page, out, count("Quilts"))
        blocks = count("Blocks")  # the project's own; the library's follow them
        page.get_by_role("tab", name="Blocks").click()
        page.wait_for_timeout(1000)
        save_all(page, out, blocks)
        page.close()
    browser.close()
server.shutdown()
