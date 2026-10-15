---
title: Libraries
order: 70
summary: My library, installed packs, backup and restore, and sharing your own pack.
---

The **Libraries** screen (header, next to **Project**) holds reusable blocks and palettes. It has three kinds of library.

- **Built-in** blocks and palettes that come with the app.
- **My library** is your own work, kept in this browser.
- **Packs** are collections made by other people. They are read-only.

## Browse

1. Choose **Libraries** in the header.
2. In the **Libraries** list on the side (the menu button on phones), each library has a switch.
   Libraries that are off stay out of your projects' trays and pickers. Click a library's name to
   show only it, and **Show all libraries** to see them all again.
   If the open project uses colors or fabrics from a library you switch off, you can **Swap…** them
   for others (in the project's **Palettes** tab), **Copy to My library** to keep them, or
   **Cancel**.
3. Use **Type** to show **Blocks**, **Palettes** or **All**, the search box, and the **Category**,
   **Tags** and **Styles** filters. The filters offer only what the shown type uses.
4. In **Blocks**, use **Group blocks by** to arrange blocks by **Nothing**, **Category**, **Tags** or
   **Styles**.
5. Open an item's **Actions** menu for **Preview**, **Rename…**, **Category…**, **Tags & styles…**, **Copy to my library** or **Export (.rrqbl)**. Palettes use **Export (.rrqplt)** instead.

Pack items cannot be renamed or changed. Use **Copy to my library** and edit the copy. The copy keeps credit for the original author ([Credits and licenses](/help/guides/credits-and-licenses)).

## Put a project block or palette in My library

1. For a block, open its **Actions** menu in the project's **Blocks** tab and choose **Add to my library…**.
2. For colors, tick them in the **Palettes** tab and click **Save to my library…**.
3. If you later change the project's version, **Sync to my library** (in the same menu, or the button in the **Palettes** tab) updates the library copy.

## Use library blocks in a project

Tick **Use ... in this project** on a block in the project's **Blocks** tab. A project embeds the items it uses, so it opens fine without the library. **Settings › Libraries** can hide the library lists in the project.

## Back up and restore

1. On **Libraries**, click **Back up…**.
2. Choose **My library** and/or **Installed packs**, then click **Back up**. You get one `.rrqlib` file.
3. To restore, click **Import** and pick the file. If you already have items, choose **Merge into my library (keep what's here)** or **Replace my library with the backup's**. For packs already installed, choose **Keep** or **Replace**. Then click **Restore**.

Libraries live in browser storage. If the page warns that storage is blocked, back up before closing.

## Install a pack

Click **Import** and choose a `.rrqlib` pack (or a `.rrqplt` palette). To remove an installed pack, click **Remove pack** in its section.

## Share your own pack

1. Click **Share as pack…** (needs at least one item in My library).
2. Fill in **Name**, **Description**, **Author** and **License**. Items others have locked to a license can raise the minimum. Items marked all rights reserved by someone else are left out and listed.
3. Click **Download pack** and send the `.rrqlib` file.

Packs contain only what you chose. A pack never includes your projects.

## Fabric libraries

A fabric library is a set of **packs**, usually one palette of fabric images per collection.

1. In **Libraries**, click **Import** and pick the library's `.rrqlib` file. Its packs are added
   together.
2. Under **Libraries** in the side panel, open the library's name to see its packs. Each has a
   switch. Packs that are off stay out of your projects' trays.
3. Click a pack's name to see its palette.

### Add a library from the web

Libraries can also live in a git repository, such as one on GitHub.

1. In **Libraries**, click **Add from the web…**.
2. Paste the repository's address. Add a branch or tag if its author asked you to. Click
   **Connect**. Only the list of packs is downloaded.
3. Open the library's name in the side panel and switch on the packs you want. Each pack downloads
   when you first switch it on, with images at the size set in **Settings › Fabrics**.
4. Click **Check for updates** under the packs. Before anything changes you see which colors and
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

## Add your own fabrics to My library

1. In **Libraries**, click **Add fabrics…**.
2. Pick the images, then choose a **Palette** of yours, or **New palette…** and type its name.
3. Set the options as in [adding fabric images](/help/guides/colors-and-palettes) and click **Add**.

**Back up…** saves My library with its fabric images, as one `.rrqlib` file.
