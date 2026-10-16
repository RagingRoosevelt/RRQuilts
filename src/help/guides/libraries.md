---
title: Libraries
order: 70
summary: My library, installed packs, backup and restore, and sharing your own pack.
---

The **Libraries** screen (header, next to **Project**) holds reusable blocks and palettes. It has three kinds of library.

- **Built-In** blocks and palettes that come with the app.
- **My library** is your own work, kept in this browser.
- **Packs** are collections made by other people. They are read-only.

## Browse

1. Choose **Libraries** in the header.
2. In the **Libraries** list on the side (the menu button on phones), each library has a switch.
   Libraries and packs that are off stay out of this page and your projects' trays and pickers
   (click an off pack's name to look at it). Click a library's name to
   show only it, and **Show all libraries** to see them all again. **Find a pack** at the top
   searches every library's packs. A library of packs has **All off** under its name, and
   **Check for updates** and **Disconnect** when it's from the web (**Remove** when imported). Its arrow folds the list of packs away.
   If the open project uses colors or fabrics from a library you switch off, you can **Swap…** them
   for others (in the project's **Palettes** tab), **Copy to My library** to keep them, or
   **Cancel**.
3. Use **Type** to show **Blocks**, **Palettes** or **All**, the search box, and the **Category**,
   **Tags** and **Styles** filters. The filters offer only what the shown type uses.
4. In **Blocks**, use **Group blocks by** to arrange blocks by **Nothing**, **Category**, **Tags** or
   **Styles**.
5. Open an item's **Actions** menu for **Preview**, **Rename…**, **Category…**, **Tags & styles…**, **Copy to my library** or **Export (.rrqbl)**. Palettes use **Export (.rrqplt)** instead, and their files carry their fabric images.
6. Click a palette, or one of its swatches, to see its colors and fabrics large. In your own
   palettes, **+** adds a color, the picture button adds fabric images, and you can drop image files
   on a palette or on this view. Click a name to rename it, then the check mark to save. **Change
   color** and the bin are under the name.

Pack items cannot be renamed or changed. Use **Copy to my library** and edit the copy. The copy keeps credit for the original author ([Credits and licenses](/help/guides/credits-and-licenses)).

## Put a project block or palette in My library

1. For a block, open its **Actions** menu in the project's **Blocks** tab and choose **Add to my library…**.
2. For a palette, open its **⋮** menu in the project's **Palettes** tab and choose **Save to my
   library…**. Its colors and fabric images go there, and the two stay synced
   ([The project sketchbook](/help/guides/sketchbook)).
3. If you later change the project's block, **Sync to my library** in its menu updates the library
   copy.

## Use library blocks in a project

Tick **Use ... in this project** on a block in the project's **Blocks** tab. A project embeds the items it uses, so it opens fine without the library. **Settings › Project** can hide the library lists in the project.

## Back up and restore

1. Under the **Libraries** list in the side panel, click **Back up…**.
2. Choose **My library** and/or **Installed packs**, then click **Back up**. You get one `.rrqlib` file.
   Packs that can still be downloaded from their library on the web are saved as the library's
   address, so the file stays small. Restoring connects to them again and downloads the packs.
   Packs that can't be downloaded (the library is private, gone, or you're offline) are copied in
   with their images. Which packs were switched off is kept too.
3. To restore, click **Import resource…** and pick the file. If you already have items, choose **Merge into my library (keep what's here)** or **Replace my library with the backup's**. For packs already installed, choose **Keep** or **Replace**. Then click **Restore**.

Libraries live in browser storage. If the page warns that storage is blocked, back up before closing.

## Install a pack

Under the **Libraries** list, click **Import resource…** and choose a `.rrqlib` pack (or a
`.rrqplt` palette). A file with several packs
lists them first: tick the ones to add. If the file says where the library lives on the web, the
library is added as if from the web, and its other packs can be switched on later. Otherwise,
import the file again to add more. Packs you already have show as installed, or say how many of
their images are missing (ticked, to fill them in). A file with larger images than yours offers to
add them, and one with smaller images offers to switch to them, which frees space. To remove an installed pack, choose **Remove pack** in one of
its palettes' **⋮** menus. **Remove** under an imported library's name removes all of it.

## Share your own pack

1. Under the **Libraries** list, click **Make pack…** (needs at least one item in My library).
2. Fill in **Name**, **Description**, **Author** and **License**. Items others have locked to a license can raise the minimum. Items marked all rights reserved by someone else are left out and listed.
3. Add its web pages if it has any: a **Home page**, a **Gallery**, and **Another link** for each
   of the rest.
4. Under **What to include**, tick the palettes and blocks to put in it.
5. Click **Download pack** and send the `.rrqlib` file.

Packs contain only what you chose. A pack never includes your projects.

## Fabric libraries

A fabric library is a set of **packs**, usually one palette of fabric images per collection.

1. In **Libraries**, click **Import resource…** and pick the library's `.rrqlib` file, then tick
   the packs you want.
2. Under **Libraries** in the side panel, open the library's name to see its packs. Each has a
   switch. Packs that are off stay out of your projects' trays.
3. Click a pack's name to see its palette.

### Add a library from the web

Some libraries come listed with RRQuilts and show in the side panel as **Not downloaded yet**. Click
**Show packs** to see their packs, then switch on the ones you want. Nothing downloads before that.
**Disconnect** removes one from this device's list.

Libraries can also live in a git repository, such as one on GitHub.

1. In **Libraries**, click **Add from the web…** at the bottom of the **Libraries** list on the
   side.
2. Paste the repository's address. Add a branch or tag if its author asked you to. Click
   **Connect**. Only the list of packs is downloaded.
   A library's own page may have a link that adds it. The link opens this step with the address
   filled in, and asks before connecting.
3. Open the library's name in the side panel and switch on the packs you want. Each pack downloads
   when you first switch it on, with images at the size set in **Settings › Fabrics**.
4. Click **Check for updates** under the library's name. Before anything changes you see which colors and
   fabrics in your packs are new, removed or changed, and any packs the library no longer has.
   **Update** downloads the new versions and removes what the library dropped (projects keep what
   they use). **Skip this update** waits for the next one. **Cancel** decides later.
5. **Disconnect** removes the library and its packs from this device.

When you print, larger images of these fabrics are downloaded if you're online and the library has
them, so printed fabrics look sharp.

Projects don't carry library fabrics' images, only which fabric they are, so files stay small. A
project opened on a device without the library shows those fabrics as their average colors and
names the library in its **Details** tab. If the library came from the web, click **Connect**
there to add it. To share such a project, tick **Include library fabric
images when saving** in the project's **Details** tab first (packs for personal use are left out).
The project still names its libraries, so whoever opens it can add them too.

## Make your own palettes

1. In **Libraries**, click **New palette** in **My library** and type its name.
2. Click the palette to open it. **+** adds a color, and the picture button adds fabric images. You
   can also drop image files on the palette.
3. Set the image options as in [adding fabric images](/help/guides/colors-and-palettes) and click
   **Add**.

**Back up…** saves My library with its fabric images, as one `.rrqlib` file.
