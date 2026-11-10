# Spec 041: decisions made while the owner was away (for review)

Bookmark before this batch: branch `bookmark/041-before-block-by-block` (39090e90). To go back:
`git reset --hard bookmark/041-before-block-by-block` on `041-data-making`.

Each entry: what I had to decide, what I chose, and why. Change any of them freely.

1. **Assembled blocks in the calendar.** The calendar has no block labels to put a mark on, so an
   assembled block's days turn light green (instead of the gray every-other-block shading).
2. **Block by block printout.** Each block's map numbers every day of the block on its patches;
   only days with pieces to cut get the thick outline. The block's own pieces (not days: fixed
   colors, places past a short month) are listed once in a "Once" row and get templates too.
   Days without an entry say "No entry yet".
3. **One printout layout for both.** Picked days and Block by block both print a section per block
   (title, map, table of its days), then templates per block. The table lost its Block column
   (the section title says it). Days not on the quilt come last under "Not on the quilt".
4. **Done column** shows dates: "Cut Nov 9 · Assembled Nov 9".
5. **Template day labels** only with Tint by fabric on (one fabric per template, so its days are
   known): "Cut 1 · Jan 10". Untinted templates are counted per shape as before.
6. **Instructions page.** Days / Block by block switch. Days: From and To dates make a continuous
   range (this replaces a scattered pick such as Not cut yet); **Not cut yet** picks the days entered
   and not cut. Block by block: From and To blocks, **Previous** and **Next** move by the range's
   length. Switching to Block by block keeps the blocks of the picked days; switching to Days picks
   the days not cut yet (or the first day).
7. **Where Block by block starts.** The dialog's Block by block button opens the open day's block.
   The Data Quilts card menu opens the block of the first day not cut yet (else the first block).
8. **No "Not cut yet" chip in the dialog's calendar** (task T024). The "pick all uncut days?"
   question already covers it, and the instructions page has the button.
9. **Demo for v11** (written at release): Jan 1 to 14 entered on both data quilts, Jan 1 to 10 cut,
   Jan 1 to 7 assembled, the Weeks quilt's lead day and first week assembled. Shown values stay the
   sample, so the demo pictures don't change.
10. **Help** section title: "Make it day by day" (Guides › Data quilts), with "Print instructions" as
    a subsection.
11. **Finished month** (folds on phones): every day of the period in that month is marked Assembled,
    or its block is. Only the starting state follows that; a month folded or unfolded by hand stays
    so while the dialog is open.
