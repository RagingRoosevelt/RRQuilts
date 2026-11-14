---
title: Printing
order: 90
summary: Block templates, the rotary cutting chart, yardage, mitered corner guides, and 3D-printed templates.
---

Both editors have a **Print** tab. It replaces the canvas with a preview of the pages at true size, and puts the print options in the side panel.

## Print a block

1. Open a block in the block editor and choose its **Print** tab.
2. Under **Print**, tick what you want, from **Block page (picture, fabric, credits)**, **Rotary cutting chart**, and **Templates**.
3. Choose a **Size**, either the finished size or **Custom size** with **Width** and **Height**.
4. Check the page count above the preview, then click **Print**.

## Print a quilt

1. Open a quilt and choose its **Print** tab.
2. Tick **Quilt picture**, **Block pages (picture, fabric, credits)**, **Yardage estimate**, **Rotary cutting chart** and/or **Templates (blocks and quilt pieces)**. Quilt pieces that need a template (one-patch shapes, setting pieces,
   pieced border and strip shapes) come after the blocks' templates, lettered QA, QB, and so on, after a key showing where each one goes.
3. Click **Print**.

The browser print dialog opens. Print at 100% scale, not "fit to page", and check the scale square with a ruler. To make a PDF, pick **Save as PDF** as the printer.

## Set the options

- **Paper** covers the paper size, **Portrait** or **Landscape**, and **Margins**.
- **Cutting** has **Seam allowance**, **Cut size rounding** (up to the next 1/8 in or 5 mm, or none), and for quilts **Extra length on mitered strips** (trimmed after sewing, 0 to cut exact).
- **Fabric** (quilts) has **Fabric rounding**, **Backing extra per side**, and **Binding strip width**.
- **Templates** offers **Include seam allowance**, **Trimmed points**, **Shaded seam allowance**, **Cutting line**, **Sewing line**, **Grain lines**, **Mirror templates**, **Curve alignment marks**, **Tint by fabric**, **One template per page**, which labels to print on each template, and a **Scale square on each template**.
- **Look** holds **Line weight** and **Pictures as outlines only**.

Options are remembered in your settings. The numbers use the same formulas as the [rounding](/help/math/rounding) and [seam allowance](/help/math/seam-allowance) topics.

## What the pages contain

- The **Rotary cutting chart** gives each patch's cut size and how many to cut. Triangle sizes follow [half-square triangles](/help/math/half-square-triangles) and [quarter-square triangles](/help/math/quarter-square-triangles).
- **Templates** are lettered, true-size pieces to cut around. Pieces bigger than a sheet are split into numbered parts with shaded overlaps.
- The **Yardage estimate** lists fabric per color, plus backing and binding. See [patches from yardage and fat quarters](/help/math/patches-from-yardage), [backing](/help/math/backing) and [binding](/help/math/binding).
- The **Mitered corner guide** appears if the quilt has mitered borders. This true-size guide shows each strip's 45 degree ends and where stitching stops. See [borders](/help/math/borders).
- **Credits** list the author, license and earlier contributors ([Credits and licenses](/help/guides/credits-and-licenses)).

Fabrics print as their images, tiled at their real size, using the largest image on this device.
Fabrics marked "≈" print at the default 8 in until you set their real size.

## 3D-printed templates

The block, rosette and quilt editors also have a **3D Print** tab. It makes a template you can print on a 3D printer and cut around: a tray with a raised rim, 4 mm high, with its size, its seam allowance and a hanging hole in the floor. In **Libraries**, click an EPP shape or rosette and choose **3D print**.

1. Under **Shape**, pick the piece. A rosette has one template per shape, a block or quilt one per distinct piece. For an EPP shape, choose its **Size** in U and the **1U length**. A quilt's 1U and seam allowance come from the quilt.
2. Under **Template**, choose **Paper (finished size)** to cut papers, or **Fabric (with seam allowance)** to cut fabric. Fabric templates trim points sharper than 90 degrees unless you untick **Trim points sharper than 90°**.
3. Click **Download STL** and open the file in your 3D printer's slicer.

The floor says `Edge:` and the edge length for EPP shapes, or `Size:` and the finished width and height for other pieces, then `SA:` and the seam allowance. Paper templates say `SA: 0`. The text is 6 mm for each inch of edge, smaller when it doesn't fit. The hanging hole is 3/4 in when it fits beside the text, else 3/8 in.

**Advanced** holds the build: height, floor, outer wall, corner radii, edge chamfers and text depth, in millimeters. Pieces with an inward corner (an L shape, the inner curve of a Drunkard's Path) can't be made yet.
