import{t as e}from"./settings-cLrrNpzD.js";import{Dt as t,J as n,R as r,T as i,U as a,V as o,X as s,at as c,b as l,f as u,ft as d,g as f,h as p,jt as m,m as h,ot as g,p as _,s as v,t as y,x as b,y as ee}from"./create-CXFiK9Ge.js";import{t as te,v as ne}from"./QBtn-D67DqTct.js";import{H as x,V as S,n as C,r as re,t as w}from"./QCard-BviQ4XyX.js";import{a as ie,r as ae}from"./render-CRP6lwgu.js";import{N as T,P as oe,R as se,V as ce,z as le}from"./index-BK5-LcH5.js";import{n as ue,t as de}from"./QTabs-flRVKxmY.js";import{t as fe}from"./QPage-D5_MJ09N.js";import{t as pe}from"./LengthInput-nbYx0JpU.js";import{S as me,_ as he,a as E,b as ge,i as _e,n as ve,o as ye,r as be,t as xe,x as Se,y as Ce}from"./yardage-D5dwrINA.js";var we=[`horizontal`,`vertical`,`cell`,`none`],Te=y({name:`QMarkupTable`,props:{...x,dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,wrapCells:Boolean,separator:{type:String,default:`horizontal`,validator:e=>we.includes(e)}},setup(e,{slots:t}){let n=ie(),r=S(e,n),a=u(()=>`q-markup-table q-table__container q-table__card q-table--${e.separator}-separator`+(r()?` q-table--dark q-table__card--dark q-dark`:``)+(e.dense?` q-table--dense`:``)+(e.flat?` q-table--flat`:``)+(e.bordered?` q-table--bordered`:``)+(e.square?` q-table--square`:``)+(e.wrapCells?``:` q-table--no-wrap`));return()=>i(`div`,{class:a.value,tabindex:0},[i(`table`,{class:`q-table`},ae(t.default))])}}),Ee=(e,t)=>({units:e,seam:t.seam[e],step:t.rounding[e],slack:t.miterSlack[e],usable:he[e][0].usable,fabricStep:t.fabricStep[e],overhang:t.overhang[e],bindingWidth:t.bindingWidth[e]}),D=e=>({poly:e,curved:!1,fill:`x`,marks:[]}),O=(e,t)=>D([[0,0],[e,0],[e,t],[0,t]]),k=e=>D([[0,0],[e,0],[0,e]]),De=e=>D([[0,0],[e,0],[e/2,e/2]]),Oe=(e,t)=>D([[0,0],[e,0],[e-t,t],[t,t]]),A=(e,t)=>Se(e,t.units),j=(e,t)=>e.cut[0]===e.cut[1]?`${A(e.cut[0],t)} square`:`${A(e.cut[0],t)} × ${A(e.cut[1],t)}`,M=(e,t)=>({in:e,cm:t}),ke={square:{title:`Square`,inputs:[{key:`f`,label:`Finished size`,start:M(3,8)}],rows:({f:e},t)=>[{label:`Cut`,value:j(E(O(e,e),t.seam,t.step),t)}]},rect:{title:`Rectangle`,inputs:[{key:`w`,label:`Finished length`,start:M(6,15)},{key:`h`,label:`Finished width`,start:M(3,8)}],rows:({w:e,h:t},n)=>[{label:`Cut`,value:j(E(O(e,t),n.seam,n.step),n)}]},hst:{title:`Half-square triangles`,inputs:[{key:`f`,label:`Finished size (leg)`,start:M(3,8)}],rows:({f:e},t)=>{let n=E(k(e),t.seam,t.step),r=me((e+(2+Math.SQRT2)*t.seam)*Math.SQRT2,t.step);return[{label:`Two at a time`,value:`${j(n,t)}, one per pair · cut once diagonally`},{label:`Four at a time`,value:`${A(r,t)} square, one per pair · sew all around, cut both diagonals`},{label:`Eight at a time`,value:`${A(2*n.cut[0],t)} square, one per pair · sew both diagonals, cut into 8`}]}},qst:{title:`Quarter-square triangles`,inputs:[{key:`f`,label:`Finished long side`,start:M(4,10)}],rows:({f:e},t)=>[{label:`Cut`,value:`${j(E(De(e),t.seam,t.step),t)} · cut both diagonals: 4 triangles`}]},geese:{title:`Flying geese`,inputs:[{key:`w`,label:`Finished width`,start:M(4,10)},{key:`h`,label:`Finished height`,start:M(2,5)}],rows:({w:e,h:t},n)=>{let r=E(De(e),n.seam,n.step),i=E(k(t),n.seam,n.step);return[{label:`Stitch and flip (1)`,value:`${j(E(O(e,t),n.seam,n.step),n)} rectangle + 2 × ${j(E(O(t,t),n.seam,n.step),n)}`},{label:`Four at a time (4)`,value:`1 × ${j(r,n)} + 4 × ${j(i,n)}`},{label:`Pieced (1)`,value:`goose: ¼ of a ${j(r,n)}; sky: 2 halves of a ${j(i,n)}`}]}},sqinsq:{title:`Square in a square`,inputs:[{key:`f`,label:`Finished unit`,start:M(4,10)}],rows:({f:e},t)=>{let n=e/Math.SQRT2;return[{label:`Center`,value:j(E(O(n,n),t.seam,t.step),t)},{label:`Corners`,value:`2 × ${j(E(k(e/2),t.seam,t.step),t)}, cut once diagonally`}]}},onpoint:{title:`On-point setting`,inputs:[{key:`f`,label:`Finished block`,start:M(10,25)}],rows:({f:e},t)=>[{label:`Block diagonal`,value:A(e*Math.SQRT2,t)},{label:`Side setting triangles`,value:`${j(E(De(e*Math.SQRT2),t.seam,t.step),t)}, cut both diagonals (4)`},{label:`Corner setting triangles`,value:`${j(E(k(e/Math.SQRT2),t.seam,t.step),t)}, cut once (2)`}]},border:{title:`Borders`,inputs:[{key:`w`,label:`Quilt width (before the border)`,start:M(48,120)},{key:`h`,label:`Quilt height (before the border)`,start:M(60,150)},{key:`b`,label:`Border width`,start:M(4,10)}],rows:({w:e,h:t,b:n},r)=>[{label:`Straight: sides`,value:`2 × ${j(E(O(t,n),r.seam,r.step),r)}`},{label:`Straight: top and bottom`,value:`2 × ${j(E(O(e+2*n,n),r.seam,r.step),r)}`},{label:`Mitered: sides`,value:`2 × ${j(E(Oe(t+2*n,n),r.seam,r.step,r.slack),r)}`},{label:`Mitered: top and bottom`,value:`2 × ${j(E(Oe(e+2*n,n),r.seam,r.step,r.slack),r)}`}]},binding:{title:`Binding`,inputs:[{key:`w`,label:`Quilt width`,start:M(48,120)},{key:`h`,label:`Quilt height`,start:M(48,120)}],rows:({w:e,h:t},n)=>{let r=be(e,t,n.bindingWidth,xe[n.units],n.usable,n.fabricStep);return[{label:`Strips`,value:`${r.strips} × ${A(n.bindingWidth,n)} wide`},{label:`Total length`,value:A(2*(e+t)+xe[n.units],n)},{label:`Fabric`,value:ge(r.length,n.units)}]}},backing:{title:`Backing`,inputs:[{key:`w`,label:`Quilt width`,start:M(60,150)},{key:`h`,label:`Quilt height`,start:M(72,180)}],rows:({w:e,h:t},n)=>[{label:`Fabric`,value:ge(ve(e,t,n.overhang,n.usable,n.fabricStep),n.units)},{label:`Overhang`,value:`${A(n.overhang,n)} each side`}]},yardage:{title:`Yardage for squares`,inputs:[{key:`n`,label:`How many`,start:M(40,40),count:!0},{key:`f`,label:`Finished size`,start:M(3,8)}],rows:({n:e,f:t},n)=>{let r=Array.from({length:Math.max(1,Math.round(e))},()=>O(t,t)),i=ye(r,n.seam,n.step,n.usable),a=_e(i,{usable:n.usable},n.fabricStep)[0],o=he[n.units].find(e=>e.fatQuarter),s=ye(r,n.seam,n.step,o.usable),c=_e(s,o,n.fabricStep)[0];return[{label:`Strips`,value:`${i[0].strips} × ${A(i[0].stripWidth,n)} (${i[0].perStrip} per strip)`},{label:`Fabric (${A(n.usable,n)} usable)`,value:ge(a.length,n.units)},{label:`Or fat quarters`,value:String(c.fatQuarters)}]}},rounding:{title:`Rounding to the ruler`,inputs:[{key:`x`,label:`Exact length`,start:M(3.854,9.31),raw:!0}],rows:({x:e},t)=>[{label:`Exact`,value:A(e,t)},{label:`Cut (rounded up)`,value:A(me(e,t.step),t)}]}},Ae={class:`text-subtitle2`},je={class:`text-caption text-grey-7`},Me={class:`text-grey-8`},Ne={class:`text-weight-medium`},Pe=T(b({__name:`HelpCalc`,props:{name:{}},setup(t){let n=t,i=oe(),a=e(),p=u(()=>ke[n.name]),g=u(()=>i.doc?.units??a.settings.units),y=u(()=>Ee(g.value,Ce(a.settings.print))),b=c(Object.fromEntries((p.value?.inputs??[]).map(e=>[e.key,e.start[g.value]]))),te=u(()=>{let e=p.value;return!e||e.inputs.some(e=>!(b[e.key]>0))?[]:e.rows(b,y.value)});return(e,n)=>p.value?(r(),h(w,{key:0,flat:``,bordered:``,class:`help-calc q-my-md`},{default:s(()=>[l(C,{class:`q-pb-sm`},{default:s(()=>[_(`div`,Ae,[l(ne,{name:`calculate`,class:`q-mr-xs`}),ee(m(p.value.title)+` calculator `,1)]),_(`div`,je,` Seam allowance `+m(d(Se)(y.value.seam,g.value))+` · cut sizes rounded up to `+m(y.value.step?d(Se)(y.value.step,g.value):`exact sizes`)+` (change in Print settings) `,1)]),_:1}),l(C,{class:`row q-pt-none`,style:{gap:`12px`}},{default:s(()=>[(r(!0),f(v,null,o(p.value.inputs,e=>(r(),f(v,{key:e.key},[e.count||e.raw?(r(),h(re,{key:0,modelValue:b[e.key],"onUpdate:modelValue":t=>b[e.key]=t,modelModifiers:{number:!0},type:`number`,step:e.count?1:`any`,min:+!!e.count,outlined:``,dense:``,label:e.label,style:{width:`140px`}},null,8,[`modelValue`,`onUpdate:modelValue`,`step`,`min`,`label`])):(r(),h(pe,{key:1,modelValue:b[e.key],"onUpdate:modelValue":t=>b[e.key]=t,units:g.value,min:.25,label:e.label,style:{width:`200px`}},null,8,[`modelValue`,`onUpdate:modelValue`,`units`,`label`]))],64))),128))]),_:1}),l(Te,{flat:``,dense:``,separator:`horizontal`,class:`q-mx-md q-mb-md`},{default:s(()=>[_(`tbody`,null,[(r(!0),f(v,null,o(te.value,e=>(r(),f(`tr`,{key:e.label},[_(`td`,Me,m(e.label),1),_(`td`,Ne,m(e.value),1)]))),128))])]),_:1})]),_:1})):(r(),h(ce,{key:1,dense:``,class:`bg-warning text-dark q-my-md`},{default:s(()=>[ee(`Unknown calculator “`+m(t.name)+`”.`,1)]),_:1}))}}),[[`__scopeId`,`data-v-d2cee685`]]),Fe=`---
title: Block colorings
order: 50
summary: Color a block's patches and keep several colorings of the same drawing.
---

A **coloring** is one way of filling a block's patches. A block can keep several, and quilts choose
which one each placed block starts from.

## Color a block

1. Open the block in the block editor and choose the **Color** tab.
2. In the sidebar, open **Colors** and click a swatch. (Use **+** to add one.)
3. Pick **Paint** on the left rail and tap a patch. **Spray (same color)** recolors every patch
   with the same color, **Eyedropper** picks up a patch's color, and **Pan** moves the view.
4. Undo with Ctrl+Z.

## Several colorings

Under **Colorings** in the sidebar, each coloring is a thumbnail. Click one to work on it.

- **Save as new coloring** copies the current one so you can change it freely.
- **Rename** names it.
- **Delete** removes it (a block always keeps at least one). Quilts that used it keep their colors.

If a coloring uses colors from a palette the project has not turned on, the app offers **Turn on**
for that palette so its colors appear in the trays.

## Use them in a quilt

In the quilt editor's **Design** tab, a block tile with several colorings shows a small number.
Click it to choose which coloring the **Set block** tool places. Recoloring in the quilt does not
change the block ([Designing a quilt](/help/guides/designing-a-quilt)).

## Color variants of library blocks

Library blocks can't be edited, but **Create a coloration variant** in the sketchbook makes your own
version with the same drawing. Variants open straight into the **Color** tab (they have no **Draw**
tab) and are marked **Color variant**.
`,Ie=`---
title: Colors and palettes
order: 60
summary: Make project colors, group them into palettes, and paint with them.
---

A **color** is one swatch. A **palette** is a named group of colors. A project always has its own
colors (listed first in the project's **Palettes** tab). You can also tick palettes from your
libraries to use in the project's quilts.

## Add a project color

1. Open your project and choose the **Palettes** tab.
2. Click the empty swatch at the start of the project's colors (or **Add color**, the **+** button, in the quilt editor's **Colors** tray).
3. In the dialog, type a **Name**, then pick the color with the **Picker** tab, the **RGB** tab, or by typing a **Hex** value.
4. Click **Add**.

To change a project color later, right-click (or long-press) it in the tray and choose **Edit…**, or use the edit button on its swatch in the **Palettes** tab. Choose **Delete** to remove it.

## Use library palettes

1. In the project's **Palettes** tab, scroll to **Library palettes**.
2. Tick the checkbox beside each palette you want. Its colors then appear in the quilt editor's **Colors** tray, under the library's name.

Library colors are read-only. Right-click one in the tray and choose **Edit a copy…** to make your own version. If the list is empty, check **Settings › Libraries**, where **Hide library palettes from projects** hides it.

## Paint a quilt

1. Open a quilt and choose its **Design** tab.
2. In the tray, open the **Colors** tab and click a color.
3. Pick the **Paint** tool and tap a patch. **Spray (same color)**, **Swap color everywhere** and **Eyedropper** are in the same toolbar.
4. Set the scope first. **This** paints one block, **All** paints every identical block, and **Alternate** paints every other one.

## Save colors as a palette

1. In the **Palettes** tab, tick the checkbox on each project color you want to keep.
2. Click **Save to my library…**, pick **New palette** (or an existing palette) in the **Palette** field, type a **Name**, and click **Save**.

After you change a saved color, a **Sync to my library** button appears. It updates the library copy. See [Libraries](/help/guides/libraries).

## Share a palette

A single palette travels as a \`.rrqplt\` file. Use **Import palette (.rrqplt)** in the **Palettes** tab to bring one in, or **Export (.rrqplt)** from a palette's **Actions** menu on the Libraries page.
`,Le=`---
title: Credits and licenses
order: 80
summary: Author, license, and the chain of credit for projects, quilts, and blocks.
---

Every project, quilt and block has an author and a license, and copies remember who came before. This keeps quilting designs shareable and credited.

## Edit the details

1. Open the **Details** tab of the project, of a quilt, or of a block in the block editor.
2. Edit **Title**, **Author** and **Notes**. Leave **Author** empty to show "anonymous". Your default name comes from **Settings › You**.
3. Choose a **License**. Each option explains its terms underneath.

A new project starts as **CC BY-SA 4.0**. New items copy the project's license at that moment and keep it if the project license changes later.

## The licenses

| License             | Meaning                                                  |
| ------------------- | -------------------------------------------------------- |
| Public domain       | Traditional or out-of-copyright design, free for any use |
| CC0 1.0             | No rights reserved, no credit needed                     |
| CC BY-SA 4.0        | Credit required, changes keep this license               |
| CC BY-NC-SA 4.0     | Credit required, no selling, changes keep this license   |
| All rights reserved | Only the author may copy, change or share it             |

## How credit builds up

When you copy or change someone else's block, they are added to its **Based on** list and you become the author. Your own work copied again adds nothing. The list shows the earliest contributor first, with each name and license.

A quilt also lists **Blocks by others**, with their credits.

## Licenses lock

Earlier work limits your choice. Share-alike and non-commercial licenses carry forward, and all rights reserved is the strictest. When the choice is limited the **License** field is locked (padlock) and says what requires it. A quilt using a locked block inherits that lock.

## In print

Printouts show the author and credits, and each author's social set in **Settings › You**. See [Printing](/help/guides/printing).
`,Re=`---
title: Designing a quilt
order: 30
summary: Set the layout and borders, place blocks, color patches, and use Apply to for repeats.
---

Open a quilt from the sketchbook's **Quilts** tab (or create one from **Start a quilt**). The quilt
editor has five tabs along the top named **Details**, **Layout**, **Borders**, **Design**, and **Print**.
The **menu** button at the right hides or shows the sidebar. Two toggles on the left rail show or
hide the seam lines and the block names, and the bar under the quilt reports its finished size.

## Layout

1. Open the **Layout** tab. **Style** is **Horizontal** (blocks in rows). Other styles are listed as
   coming soon.
2. Set **Columns** and **Rows** (1 to 100).
3. Set the **Finished block size** (**Width** and **Height**). Switch on **Keep width and height
   equal** to keep blocks square.
4. Set the **Sashing** (the strips between blocks) the same way. 0 means none. **Sashing around the
   outside** adds strips around the edge too. Where sashes cross are cornerstones.

## Borders

1. Open the **Borders** tab. Borders are numbered from the inside out (1 is innermost).
2. **Add outside** adds a border, **Insert inside** adds one just inside the selected border,
   **Clone** copies it. The arrow buttons **Move inward / outward**, and the trash button deletes.
3. Choose a **Style** of **Long horizontal** or **Long vertical** (the long strips run the full length
   on that side) or **Mitered** (diagonal corners). Pieced borders are coming soon.
4. Set the width of each side with **Left**, **Top**, **Right**, **Bottom**. **All sides**,
   **L+R / T+B**, and **Each** choose how many sides move together.

For cutting lengths, see [Borders](/help/math/borders).

## Place blocks

1. Open the **Design** tab. The sidebar shows the tray with **Blocks** and **Colors** tabs.
   Library blocks appear only if ticked in the sketchbook's **Blocks** tab.
2. Click a block in the **Blocks** tab. If it has several colorings, a small number on its tile lets
   you choose which coloring to place.
3. Pick the **Set block** tool (the first tool on the left rail) and tap a space in the quilt.

## Tools

The left rail holds the tools. Tooltips and a hint line above the tray say what each does.

| Tool                      | What a tap does                                                            |
| ------------------------- | -------------------------------------------------------------------------- |
| **Set block**             | Places the selected block                                                  |
| **Rotate**                | Turns a block 90°                                                          |
| **Flip**                  | Mirrors a block, tap the tool again to switch left↔right and top↕bottom    |
| **Erase block**           | Removes a block                                                            |
| **Find block**            | Selects that block in the tray and outlines every place it's used          |
| **Paint**                 | Colors one patch                                                           |
| **Spray (same color)**    | Recolors every patch of the same color                                     |
| **Swap color everywhere** | Replaces that color throughout the quilt                                   |
| **Eyedropper**            | Picks up a patch's color                                                   |
| **Pan**                   | Drag to move around (you can also drag or pinch the canvas in other tools) |

## Color

1. Click the **Colors** tab in the tray and click a swatch. **+** adds a new color.
2. Choose **Paint** and tap a patch. Sashes, cornerstones, and borders can be painted too.
3. A placed block follows its block's coloring until you recolor a patch in the quilt. The change
   then applies only to the quilt.

## Apply to

Above the tray, **Apply to** controls how many spaces a tap affects.

- **This** colors only the space you tap.
- **All** covers every space of the same kind (all blocks of that block, all sashes, one border…).
- **Alternate** takes every other one of those spaces, in a checkerboard.

## Details and Print

The **Details** tab holds the quilt's title, author, license, and notes. The **Print** tab makes
templates, cutting charts, and yardage ([Printing](/help/guides/printing)). Undo and redo are on the
rail (Ctrl+Z, Ctrl+Shift+Z).
`,ze=`---
title: Drawing blocks
order: 40
summary: Draw a block from seams (lines and arcs) and let the app find the patches.
---

A block is a square or rectangle drawn with **seams**. Wherever seams close a shape, the app
finds a **patch** that you can color. Start from **New block** in the sketchbook's **Blocks** tab,
or **Edit** one of your blocks. The block editor has four tabs named **Details**, **Draw**, **Color**, and
**Print**. Library blocks are read-only. Use **Edit (make a copy)** in the sketchbook.

## Set the size

In the **Draw** sidebar, **Block name**, **Width**, and **Height** set the finished size, in the
project's units. If you change the proportions of a block with curved seams, the curves change
shape too.

## Draw seams

Pick a tool on the left rail and drag on the block:

1. **Line** draws a straight seam. Drag from one point to another.
2. **Arc** works the same way, but the seam curves. **Flip arc direction** (or Space while drawing) bends
   it the other way. After drawing, select the arc and drag its handle to change the curve.
3. **Grid** divides a rectangle you drag into **Columns** × **Rows** cells in one move.
4. Seams that don't join at both ends are shown in red. Join them so the shapes close.

Points snap to guides so seams stay tidy. Open **Snapping & graph paper** in the sidebar to choose
**Step** (**Snap every**) or **Divisions** (**Across** / **Down**). Turn **Snap to grid points**, **Snap to nodes**, and
**Snap to seams** on or off, and show **Graph paper**.

## Select and edit

1. Choose **Select seams**. Tap a seam (Shift adds), drag a box, or press Ctrl+A for all.
2. **Edit nodes** moves an end point (connected seams follow). Double-tap a seam to add a node.
3. With seams selected, the sidebar offers **Delete**, **Clone**, **To guides** (turn them into
   dashed guides that snap), **Rotate**, **Flip**, **Scale**, and **Add nodes** (**Midpoint**,
   **Thirds**, **Equal parts**, **At crossings**). Rotate, flip, and scale work around the **Block center** or **Selection center**.
4. The Delete key removes selected seams. Escape clears the selection. Undo with Ctrl+Z.

## Then color it

Switch to the **Color** tab ([Block colorings](/help/guides/block-colorings)). For the piecing math of
the shapes you draw, see [Half-square triangles](/help/math/half-square-triangles).

## Details and Print

**Details** holds the title, author, license, and notes. **Print** makes templates for the block
([Printing](/help/guides/printing)). Edits and copies of someone else's block credit them
automatically ([Credits and licenses](/help/guides/credits-and-licenses)).
`,Be=`---
title: Getting started
order: 10
summary: Start a quilt, save it to a file, open it again, recover unsaved work, and use the app offline.
---

RRQuilts runs entirely in your browser. There is no account, and nothing is sent to a server. Your
work lives in a **project**, one file (ending in \`.rrq\`) that holds your quilts, blocks, and colors.

## Start a quilt

1. On the home page (the **RRQuilts** button in the header), choose **Start a quilt**.
2. The wizard has three steps. Use **Next** to move on, or click a step's title.
   - **Blocks** sets **Columns**, **Rows**, and **Finished block size**.
   - **Sashing** has **Sashing width (0 for none)** and **Sashing around the outside**.
   - **Borders** takes the **Number of borders** and the **Width of each**.
3. Choose **Create quilt**. The quilt opens in the Design tab, ready for you to place blocks. See
   [Designing a quilt](/help/guides/designing-a-quilt).

For an empty project, choose **New project** instead. It opens the project's sketchbook (see
[The project sketchbook](/help/guides/sketchbook)).

## Save your project

The round save button in the header has a small colored dot:

| Dot    | Meaning                          |
| ------ | -------------------------------- |
| Grey   | **Not saved yet**                |
| Green  | **Saved to file**                |
| Orange | **Unsaved changes (draft kept)** |
| Red    | **Draft not kept: save to file** |

1. Press the save button, or **Ctrl+S**. Use **Ctrl+Shift+S** for Save as, to choose a new file.
2. In Chrome and Edge, the app writes straight to the file you choose, and later saves update it.
3. Other browsers can't write to files from a web page, so each save **downloads** a new copy of
   your \`.rrq\` file (the app tells you the first time). Keep the newest one.

## Open a project

- On the home page choose **Open a project file** and pick a \`.rrq\` file, or drag a \`.rrq\` file
  onto the window.
- In browsers that can reopen files, **Recent projects** lists your latest ones. Click one to open it.

If you start or open something else while the current project has unsaved changes, the app asks
first. Closing the tab with unsaved changes also asks you to confirm.

## Recover unsaved work

While you edit, the app keeps a **draft** of your project in the browser (within about 15 seconds of each change). A draft
is crash insurance and not a save, because clearing site data can erase it.

1. If the browser closed or crashed, the app offers **Restore unsaved work?** the next time it opens.
2. Choose **Restore** on the project you want, or **Discard** to delete its draft. **Decide later**
   closes the list.
3. You can reopen the list any time with **Restore unsaved project** on the home page.
4. Once restored, press save to put the work in a file.

## Offline use

After the first visit, the whole app is stored in your browser, so it works without a connection.
You can also install it as an app from the browser's menu. When a new version is ready, the app
shows **Update available** with a **Reload** button. It never reloads on its own, so you won't lose
work.

## One tab at a time

A project can be edited in only one browser tab. A second tab shows a read-only banner with
**Continue here anyway** to take over editing.

## See also

[The project sketchbook](/help/guides/sketchbook) · [Designing a quilt](/help/guides/designing-a-quilt)
· [Settings](/help/guides/settings)
`,Ve=`---
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
2. Tick the libraries to show in the **Libraries** list on the side. Use **Type** to show **Blocks**, **Palettes** or **All**, the search box, and the **Category**, **Tags** and **Styles** filters.
3. Use **Group blocks by** to arrange blocks by **Nothing**, **Category**, **Tags** or **Styles**.
4. Open an item's **Actions** menu for **Preview**, **Rename…**, **Category…**, **Tags & styles…**, **Copy to my library** or **Export (.rrqbl)**. Palettes use **Export (.rrqplt)** instead.

Pack items cannot be renamed or changed. Use **Copy to my library** and edit the copy. The copy keeps credit for the original author ([Credits and licenses](/help/guides/credits-and-licenses)).

## Put a project block or palette in My library

1. For a block, open its **Actions** menu in the project's **Blocks** tab and choose **Add to my library…**.
2. For colors, tick them in the **Palettes** tab and click **Save to my library…**.
3. If you later change the project's version, **Sync to my library** (in the same menu, or the button in the **Palettes** tab) updates the library copy.

## Use library blocks in a project

Tick **Use ... in this project** on a block in the project's **Blocks** tab. A project embeds the items it uses, so it opens fine without the library. **Settings › Libraries** can hide the library lists in the project.

## Back up and restore

1. On **Libraries**, click **Back up…**.
2. Choose **My library** and/or **Installed packs**, then click **Back up**. You get one \`.rrqlib\` file.
3. To restore, click **Import** and pick the file. If you already have items, choose **Merge into my library (keep what's here)** or **Replace my library with the backup's**. For packs already installed, choose **Keep** or **Replace**. Then click **Restore**.

Libraries live in browser storage. If the page warns that storage is blocked, back up before closing.

## Install a pack

Click **Import** and choose a \`.rrqlib\` pack (or a \`.rrqplt\` palette). To remove an installed pack, click **Remove pack** in its section.

## Share your own pack

1. Click **Share as pack…** (needs at least one item in My library).
2. Fill in **Name**, **Description**, **Author** and **License**. Items others have locked to a license can raise the minimum. Items marked all rights reserved by someone else are left out and listed.
3. Click **Download pack** and send the \`.rrqlib\` file.

Packs contain only what you chose. A pack never includes your projects.
`,He=`---
title: Printing
order: 90
summary: Block templates, the rotary cutting chart, yardage, and mitered corner guides.
---

Both editors have a **Print** tab. It replaces the canvas with a preview of the pages at true size, and puts the print options in the side panel.

## Print a block

1. Open a block in the block editor and choose its **Print** tab.
2. Under **Print**, tick what you want, from **Block page (picture, fabric, credits)**, **Rotary cutting chart**, and **Templates**.
3. Choose a **Size**, either the finished size or **Custom size** with **Width** and **Height**.
4. Check the page count above the preview, then click **Print**.

## Print a quilt

1. Open a quilt and choose its **Print** tab.
2. Tick **Quilt picture**, **Block pages (picture, fabric, credits)**, **Yardage estimate**, **Rotary cutting chart** and/or **Templates (each block)**.
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
- The **Yardage estimate** lists fabric per color, plus backing and binding. See [yardage and fat quarters](/help/math/yardage-and-fat-quarters), [backing](/help/math/backing) and [binding](/help/math/binding).
- The **Mitered corner guide** appears if the quilt has mitered borders. This true-size guide shows each strip's 45 degree ends and where stitching stops. See [borders](/help/math/borders).
- **Credits** list the author, license and earlier contributors ([Credits and licenses](/help/guides/credits-and-licenses)).
`,Ue=`---
title: Settings
order: 100
summary: Your name and socials, appearance, units, library options, and moving settings between devices.
---

Click the gear in the header to open **Settings** as a panel over the current screen. Changes apply at once and are stored in this browser. If the panel warns that your browser isn't keeping settings (private mode or blocked storage), use **Export** to keep a copy.

## You

- **Your name** goes into projects, blocks and packs you make. The ids of new items start with a short form of it.
- **Socials** are added with **Add a social**. Pick a **Type** (Website, a site, or one you type) and a **Handle or link**. Drag the handle at the left to reorder. The selected radio button is the one shown in printed credits.

## Interface

- **Theme** can be **Auto**, **Light** or **Dark**.
- **Use the system accent color** applies where the browser shares it, and the app is blue otherwise.
- **Units for new projects** can be **Inches** or **Centimeters**. An open project's units are in its **Details** tab.
- **Editor layout** puts the panels either as **Toolbar left, sidebar right** or as **Sidebar left, toolbar right**.

## Libraries and Project

- **Hide library blocks from projects** and **Hide library palettes from projects** leave the libraries' lists out of the project's **Blocks** and **Palettes** tabs. Blocks and palettes already in use stay available.
- **Hide "My Library" blocks when they are synced with project blocks** tidies the project's **Blocks** tab ([Libraries](/help/guides/libraries)).

## Move settings to another device

1. In Settings, under **Settings file (.rrqconf)**, click **Export**.
2. On the other device, open Settings and click **Import**, then pick the file.

Anything in the file that isn't valid is reset to its default, and the message says which. Print options live in the Print tab ([Printing](/help/guides/printing)) but travel in the same file.
`,We=`---
title: The project sketchbook
order: 20
summary: Your project's home screen, with its quilts, blocks, palettes, and details.
---

Choose **Project** in the header (it appears once a project is open) to see the sketchbook. Rename
the project by editing its name at the top. The tabs are **Quilts**, **Blocks**, **Palettes**,
**Photos**, **Threads**, and **Details**. The number in brackets counts what's there. **Photos** and
**Threads** are not available yet. The undo and redo buttons at the right of the tabs (Ctrl+Z, Ctrl+Shift+Z) work
across the whole project.

## Quilts

1. Choose **New quilt** to open the wizard (see [Getting started](/help/guides/getting-started)), or
   click a quilt's picture to open it.
2. Use the three-dot **Actions** menu on a card for **Open**, **Duplicate as variation** (a copy to
   try other colors on), **Details**, **Move earlier**, **Move later**, and **Delete** (you can undo).
3. Drag cards to reorder them.

## Blocks

**My blocks** are the blocks stored in this project.

1. **New block** asks for a name and opens the block editor ([Drawing blocks](/help/guides/drawing-blocks)).
2. **Import blocks** reads blocks from a \`.rrqbl\` file or from another project. Tick the ones to add.
3. A block's **Actions** menu offers **Edit**, **Edit a copy**, **Preview**, **Details**,
   **Export (.rrqbl)**, **Move earlier / later**, **Delete**, plus **Add to my library…** or **Sync to my library** for the My library
   links. Small icons on a card show that the block is
   placed in a quilt, is in My library, or has changed since it was saved there.
4. **Library blocks** lists blocks from the built-in set and your libraries, grouped by library and
   category. Tick the ones to use in this project's quilts. You can't edit them directly. **Edit
   (make a copy)** makes your own copy, and **Create a coloration variant** keeps the drawing but
   lets you recolor it ([Block colorings](/help/guides/block-colorings)).

Deleting a block that is placed in a quilt asks first. It can also remove it from those quilts.
Libraries themselves are covered in [Libraries](/help/guides/libraries).

## Palettes

Your **project colors** are listed here. Add one with the **+** button, or edit a color from the
palette tray in the quilt editor ([Colors and palettes](/help/guides/colors-and-palettes)).

- Tick project colors, then **Save to my library…** to keep them as a palette.
- **Import palette (.rrqplt)** adds a palette file.
- **Library palettes** lists palettes you can turn on. Ticked ones appear in the color trays.

## Details

The **Details** tab holds the project's title, author, license, units (**Inches** or
**Centimeters**), and notes. See [Credits and licenses](/help/guides/credits-and-licenses).
`,Ge=`---
title: Backing
order: 100
summary: Fabric for the back, with an overhang, pieced the cheaper way.
---

The backing is cut bigger than the quilt top. Quilting draws the layers in a little and they can
shift, so the extra keeps the back from coming up short. For hand or home-machine quilting, 2″ to 4″
(5 to 10 cm) on each side is common. A longarm needs more, because the backing is clamped to the
frame. Ask your longarm quilter, who often wants 4″ to 6″ (10 to 15 cm). The backing size is the
quilt plus this **overhang** on each side (default 4″ / 10 cm, set as **Backing extra per side** in
the Print tab's **Fabric** options).

## The formula

> **backing size = (quilt width + 2 × overhang) × (quilt height + 2 × overhang)**

If that is wider than the fabric's usable width, panels are sewn together. The calculator tries both
directions and picks the one that needs less fabric:

- panels running top to bottom: **⌈backing width ÷ usable width⌉ × backing height**
- panels running side to side: **⌈backing height ÷ usable width⌉ × backing width**

The result is rounded up to your fabric step (⅛ yd or 10 cm by default).

<svg viewBox="0 0 230 120" width="345" role="img" aria-label="A quilt top of Mexican Cross II blocks centered on a larger gold backing, with overhang on every side">
  <defs><pattern id="mx-backing" patternUnits="userSpaceOnUse" x="25" y="25" width="30" height="30"><polygon points="8.64,15.0 10.76,17.12 12.88,15.0 10.76,12.88" fill="#c4282c"/><polygon points="10.76,12.88 12.88,15.0 15.0,12.88 12.88,10.76" fill="#5a78a0"/><polygon points="12.88,10.76 15.0,12.88 17.12,10.76 15.0,8.64" fill="#c4282c"/><polygon points="10.76,17.12 12.88,19.24 15.0,17.12 12.88,15.0" fill="#5a78a0"/><polygon points="12.88,15.0 15.0,17.12 17.12,15.0 15.0,12.88" fill="#c4282c"/><polygon points="15.0,12.88 17.12,15.0 19.24,12.88 17.12,10.76" fill="#5a78a0"/><polygon points="12.88,19.24 15.0,21.36 17.12,19.24 15.0,17.12" fill="#c4282c"/><polygon points="15.0,17.12 17.12,19.24 19.24,17.12 17.12,15.0" fill="#5a78a0"/><polygon points="17.12,15.0 19.24,17.12 21.36,15.0 19.24,12.88" fill="#c4282c"/><polygon points="19.24,17.12 30.0,27.88 30.0,30.0 27.88,30.0 17.12,19.24" fill="#f4ecd8"/><polygon points="12.88,19.24 2.12,30.0 0.0,30.0 0.0,27.88 10.76,17.12" fill="#f4ecd8"/><polygon points="10.76,12.88 0.0,2.12 0.0,0.0 2.12,0.0 12.88,10.76" fill="#f4ecd8"/><polygon points="17.12,10.76 27.88,0.0 30.0,0.0 30.0,2.12 19.24,12.88" fill="#f4ecd8"/><polygon points="23.64,30.0 15.0,21.36 17.12,19.24 23.64,25.76" fill="#5a78a0"/><polygon points="0.0,23.64 8.64,15.0 10.76,17.12 4.24,23.64" fill="#5a78a0"/><polygon points="6.36,0.0 15.0,8.64 12.88,10.76 6.36,4.24" fill="#5a78a0"/><polygon points="30.0,6.36 21.36,15.0 19.24,12.88 25.76,6.36" fill="#5a78a0"/><polygon points="21.36,15.0 30.0,23.64 25.76,23.64 19.24,17.12" fill="#5a78a0"/><polygon points="15.0,21.36 6.36,30.0 6.36,25.76 12.88,19.24" fill="#5a78a0"/><polygon points="8.64,15.0 0.0,6.36 4.24,6.36 10.76,12.88" fill="#5a78a0"/><polygon points="15.0,8.64 23.64,0.0 23.64,4.24 17.12,10.76" fill="#5a78a0"/><polygon points="27.88,30.0 23.64,30.0 23.64,25.76" fill="#c4282c"/><polygon points="0.0,27.88 0.0,23.64 4.24,23.64" fill="#c4282c"/><polygon points="2.12,0.0 6.36,0.0 6.36,4.24" fill="#c4282c"/><polygon points="30.0,2.12 30.0,6.36 25.76,6.36" fill="#c4282c"/><polygon points="30.0,23.64 30.0,27.88 25.76,23.64" fill="#c4282c"/><polygon points="6.36,30.0 2.12,30.0 6.36,25.76" fill="#c4282c"/><polygon points="0.0,6.36 0.0,2.12 4.24,6.36" fill="#c4282c"/><polygon points="23.64,0.0 27.88,0.0 23.64,4.24" fill="#c4282c"/><polygon points="23.64,30.0 6.36,30.0 15.0,21.36" fill="#96c4e8"/><polygon points="0.0,23.64 0.0,6.36 8.64,15.0" fill="#96c4e8"/><polygon points="6.36,0.0 23.64,0.0 15.0,8.64" fill="#96c4e8"/><polygon points="30.0,6.36 30.0,23.64 21.36,15.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="120" height="90" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="90" height="60" fill="url(#mx-backing)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="142" y="41" width="12" height="12" fill="#c4282c" stroke="currentColor"/>
  <text x="160" y="51" font-size="11" fill="currentColor">quilt top</text>
  <rect x="142" y="61" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="160" y="71" font-size="11" fill="currentColor">backing</text>
</svg>

## Worked examples

| Quilt        | Backing      | Panels (40″ / 105 cm usable)              | Fabric        |
| ------------ | ------------ | ----------------------------------------- | ------------- |
| 60″ × 72″    | 68″ × 80″    | 2 side to side, 2 × 68 = 136″ (vs 160″)   | 139½″ = 3⅞ yd |
| 150 × 180 cm | 170 × 200 cm | 2 side to side, 2 × 170 = 340 cm (vs 400) | 340 cm        |

::calc backing
`,Ke=`---
title: Binding
order: 90
summary: How many strips to cut to go around the quilt.
---

Binding is a strip folded over the quilt's raw edge. You need enough length to go around the quilt,
plus extra for the joins, the mitered corners, and the final overlap.

## The formula

> **length = 2 × (width + height) + 10″ (25 cm)**
> **strips = length ÷ usable fabric width, rounded up**
> **fabric = strips × binding strip width, rounded up to your fabric step**

The 10″ / 25 cm allowance covers the corners (the miters use up a little each), the diagonal joins
between strips, and an overlap where the ends meet. The strip width is the **Binding width** setting
(default 2½″ / 6 cm), and the usable fabric width follows the fabric width option in the Print tab.

<svg viewBox="0 0 260 110" width="390" role="img" aria-label="A quilt top of Mexican Cross II blocks with the binding running around the edge">
  <defs><pattern id="mx-binding" patternUnits="userSpaceOnUse" x="10" y="10" width="30" height="30"><polygon points="8.64,15.0 10.76,17.12 12.88,15.0 10.76,12.88" fill="#c4282c"/><polygon points="10.76,12.88 12.88,15.0 15.0,12.88 12.88,10.76" fill="#5a78a0"/><polygon points="12.88,10.76 15.0,12.88 17.12,10.76 15.0,8.64" fill="#c4282c"/><polygon points="10.76,17.12 12.88,19.24 15.0,17.12 12.88,15.0" fill="#5a78a0"/><polygon points="12.88,15.0 15.0,17.12 17.12,15.0 15.0,12.88" fill="#c4282c"/><polygon points="15.0,12.88 17.12,15.0 19.24,12.88 17.12,10.76" fill="#5a78a0"/><polygon points="12.88,19.24 15.0,21.36 17.12,19.24 15.0,17.12" fill="#c4282c"/><polygon points="15.0,17.12 17.12,19.24 19.24,17.12 17.12,15.0" fill="#5a78a0"/><polygon points="17.12,15.0 19.24,17.12 21.36,15.0 19.24,12.88" fill="#c4282c"/><polygon points="19.24,17.12 30.0,27.88 30.0,30.0 27.88,30.0 17.12,19.24" fill="#f4ecd8"/><polygon points="12.88,19.24 2.12,30.0 0.0,30.0 0.0,27.88 10.76,17.12" fill="#f4ecd8"/><polygon points="10.76,12.88 0.0,2.12 0.0,0.0 2.12,0.0 12.88,10.76" fill="#f4ecd8"/><polygon points="17.12,10.76 27.88,0.0 30.0,0.0 30.0,2.12 19.24,12.88" fill="#f4ecd8"/><polygon points="23.64,30.0 15.0,21.36 17.12,19.24 23.64,25.76" fill="#5a78a0"/><polygon points="0.0,23.64 8.64,15.0 10.76,17.12 4.24,23.64" fill="#5a78a0"/><polygon points="6.36,0.0 15.0,8.64 12.88,10.76 6.36,4.24" fill="#5a78a0"/><polygon points="30.0,6.36 21.36,15.0 19.24,12.88 25.76,6.36" fill="#5a78a0"/><polygon points="21.36,15.0 30.0,23.64 25.76,23.64 19.24,17.12" fill="#5a78a0"/><polygon points="15.0,21.36 6.36,30.0 6.36,25.76 12.88,19.24" fill="#5a78a0"/><polygon points="8.64,15.0 0.0,6.36 4.24,6.36 10.76,12.88" fill="#5a78a0"/><polygon points="15.0,8.64 23.64,0.0 23.64,4.24 17.12,10.76" fill="#5a78a0"/><polygon points="27.88,30.0 23.64,30.0 23.64,25.76" fill="#c4282c"/><polygon points="0.0,27.88 0.0,23.64 4.24,23.64" fill="#c4282c"/><polygon points="2.12,0.0 6.36,0.0 6.36,4.24" fill="#c4282c"/><polygon points="30.0,2.12 30.0,6.36 25.76,6.36" fill="#c4282c"/><polygon points="30.0,23.64 30.0,27.88 25.76,23.64" fill="#c4282c"/><polygon points="6.36,30.0 2.12,30.0 6.36,25.76" fill="#c4282c"/><polygon points="0.0,6.36 0.0,2.12 4.24,6.36" fill="#c4282c"/><polygon points="23.64,0.0 27.88,0.0 23.64,4.24" fill="#c4282c"/><polygon points="23.64,30.0 6.36,30.0 15.0,21.36" fill="#96c4e8"/><polygon points="0.0,23.64 0.0,6.36 8.64,15.0" fill="#96c4e8"/><polygon points="6.36,0.0 23.64,0.0 15.0,8.64" fill="#96c4e8"/><polygon points="30.0,6.36 30.0,23.64 21.36,15.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="120" height="90" fill="url(#mx-binding)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="16" y="16" width="108" height="78" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="142" y="45" font-size="11" fill="currentColor">length = perimeter</text>
  <text x="142" y="62" font-size="11" fill="currentColor">+ 10″ (25 cm)</text>
</svg>

## Worked examples

| Quilt        | Total length          | Strips (40″ / 105 cm usable) | Fabric                  |
| ------------ | --------------------- | ---------------------------- | ----------------------- |
| 48″ × 48″    | 2 × 96 + 10 = 202″    | 6 × 2½″                      | 15″, rounded up to ½ yd |
| 120 × 120 cm | 2 × 240 + 25 = 505 cm | 5 × 6 cm                     | 30 cm                   |

For sewing instructions, see [Continuous binding](/help/techniques/continuous-binding).

::calc binding
`,qe=`---
title: Borders
order: 80
summary: Straight and mitered border strips, and why a mitered strip is longer.
---

Borders frame the quilt. The calculator gives both kinds for a quilt of a given size (before the
border) and border width.

## Straight borders

Sew the **sides** first, each as long as the quilt is tall. Then sew the **top and bottom**, which
are as long as the quilt is wide _plus both side borders_.

> **sides = quilt height × border width**
> **top and bottom = (quilt width + 2 × border width) × border width**

Each is then cut with a seam allowance added on every edge, so finished + 2s, like any
[rectangle](/help/math/squares-and-rectangles).

## Mitered borders

The corners join at 45°. Each strip's finished **long edge** (the outer edge) reaches the quilt's
outer corner:

> **long edge = quilt side + 2 × border width**

The cut length then adds **s × (1 + √2) at each end**, a total of **2(1 + √2)s**:

- **s × √2** for the seam allowance on the 45° seam. The seam allowance is measured at right angles
  to the diagonal, but the strip's edge meets it at 45°, so it stretches by 1 ÷ sin 45° = √2.
- **s** for the seam allowance on the border's outer edge, which pushes the strip's edge out, and so the
  diagonal's end point along the edge, by one more s.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="A mitered border strip shaped like a trapezoid with 45 degree ends, its seam allowance beyond the finished corner">
  <polygon points="10,10 150,10 130,40 30,40" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="20,10 140,10 124,34 36,34" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="160" y="25" font-size="11" fill="currentColor">finished (dashed)</text>
  <text x="160" y="42" font-size="11" fill="currentColor">cut, longer (solid)</text>
</svg>

The **Extra length on mitered strips** setting (default 2″ / 5 cm) adds more, so you can trim after
sewing the miter. Set it to 0 to cut exact.

## Worked examples (quilt 48″ × 60″, 4″ border, 120 × 150 cm, 10 cm border)

| Strip               | Inches (s = ¼″, extra 2″)                 | Centimeters (s = 7.5 mm, extra 5 cm)        |
| ------------------- | ----------------------------------------- | ------------------------------------------- |
| Straight sides      | 2 × 60½″ × 4½″                            | 2 × 151.5 × 11.5 cm                         |
| Straight top/bottom | 2 × 56½″ × 4½″                            | 2 × 141.5 × 11.5 cm                         |
| Mitered sides       | 2 × 71¼″ × 4½″ (68 + 1.207 + 2 = 71.207″) | 2 × 179 × 11.5 cm (170 + 3.62 + 5 = 178.62) |
| Mitered top/bottom  | 2 × 59¼″ × 4½″ (56 + 1.207 + 2 = 59.207″) | 2 × 149 × 11.5 cm (140 + 3.62 + 5 = 148.62) |

::calc border
`,Je=`---
title: Flying geese
order: 50
summary: A tall triangle with a smaller triangle on each side, built three ways.
---

A flying-geese unit is a rectangle twice as wide as it is tall, with one large triangle (the goose) and a
smaller triangle (the sky) at each side. There are three common ways to make one, each with its own cut sizes.

## Stitch and flip (1 unit)

Cut one **rectangle** (finished width × height) and **two squares** (finished height). Place a square
on each end of the rectangle, sew diagonally, and flip. The cut sizes are the usual
[rectangle and square](/help/math/squares-and-rectangles) sizes, finished + 2s.

## Four at a time (4 units)

Cut one large square for the geese and four small squares for the sky. The large square is the
[quarter-square](/help/math/quarter-square-triangles) size for the finished width. The small ones
are the [half-square](/help/math/half-square-triangles) size for the finished height. See
[Flying-geese units](/help/techniques/flying-geese-units) for the steps.

## Pieced (1 unit)

Cut the goose from a quarter of the large square, and each sky from half of a small one. The cut sizes
are the same as for four at a time, but nothing is sewn before cutting.

<svg viewBox="0 0 220 90" width="330" role="img" aria-label="A flying-geese unit with a large triangle and a smaller triangle on each side">
  <rect x="10" y="10" width="140" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="10,80 80,10 150,80" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <text x="160" y="40" font-size="11" fill="currentColor">goose from the large square</text>
  <text x="160" y="56" font-size="11" fill="currentColor">sky from two small ones</text>
</svg>

## Worked examples

A 4″ × 2″ finished unit made by stitch and flip needs a 4½″ × 2½″ rectangle and two 2½″ squares. Four at
a time uses one 5¼″ square for the geese and four 2⅞″ squares for the sky. For 10 × 5 cm, stitch and flip
needs an 11.5 × 6.5 cm rectangle with two 6.5 cm squares, and four at a time needs one 14 cm square and four 8 cm squares.

::calc geese
`,Ye=`---
title: Half-square triangles
order: 30
summary: Cut a square once diagonally for two triangles with their legs on the straight grain.
---

A half-square triangle (HST) is half of a square cut corner to corner. Its two short sides (the
legs) run along the straight grain, so the unit's outside edges don't stretch. Two HSTs sewn along
the long side make an HST unit.

## The formula

Cut a square of

> **cut = finished leg + (2 + √2) × seam allowance**

and cut it once diagonally. With a ¼″ seam allowance, (2 + √2) × ¼″ ≈ 0.854″, which quilters round up
to **⅞″**, the familiar "add ⅞″" rule. With 7.5 mm, it is ≈ 2.56 cm.

Adding 2 × the seam allowance isn't enough, because the seam along the diagonal eats into the corner. The point
of the triangle has to extend √2 × the seam allowance past the finished corner for the seams to meet.

<svg viewBox="0 0 220 120" width="330" role="img" aria-label="A cut square with its finished HST inside, the seam allowance shaded">
  <rect x="10" y="10" width="100" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="110" x2="110" y2="10" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="20,100 20,32 88,100" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="125" y="40" font-size="11" fill="currentColor">cut square</text>
  <text x="125" y="58" font-size="11" fill="currentColor">finished (dashed)</text>
  <text x="125" y="76" font-size="11" fill="currentColor">triangle</text>
</svg>

## Worked examples

| Finished leg | Exact cut | Cut (rounded up)             | Makes       |
| ------------ | --------- | ---------------------------- | ----------- |
| 3″           | 3.854″    | 3⅞″ square                   | 2 triangles |
| 8 cm         | 10.56 cm  | 11 cm square (5 mm rounding) | 2 triangles |

The rotary cutting chart on your printouts uses this same formula, seam allowance, and rounding
(set them in the Print tab's options).

::calc hst

## Making several at once

The calculator also gives the squares for the [two, four, and eight at a time](/help/techniques/hst-units)
methods, which sew before cutting and trim the units to size afterward.
`,Xe=`---
title: On-point settings
order: 70
summary: Setting triangles for blocks turned 45°.
---

Blocks set "on point" are turned 45° so they sit like diamonds. The straight edges of the quilt are
then filled with triangles.

## The formulas

For a finished block of side f, the block's diagonal (corner to corner) is **f × √2**.

- **Side setting triangles** have their long side along the quilt's edge, so they are
  [quarter-square triangles](/help/math/quarter-square-triangles) with a long side of f × √2. Cut a
  square of f × √2 + 2(1 + √2)s and cut both diagonals. Keeping the long side on the straight grain
  stops the quilt's edge from stretching.
- **Corner setting triangles** are [half-square triangles](/help/math/half-square-triangles) whose
  legs are f ÷ √2. Cut a square of f ÷ √2 + (2 + √2)s once diagonally. You need 2 squares (4
  corners).

<svg viewBox="0 0 220 130" width="330" role="img" aria-label="Four blocks turned on point, with triangles filling the edges and corners">
  <rect x="10" y="10" width="140" height="110" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <polygon points="80,20 120,60 80,100 40,60" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <text x="160" y="50" font-size="11" fill="currentColor">block on point,</text>
  <text x="160" y="67" font-size="11" fill="currentColor">triangles fill</text>
  <text x="160" y="84" font-size="11" fill="currentColor">edges and corners</text>
</svg>

## Worked examples

| Finished block | Block diagonal | Side triangles (cut both diagonals) | Corner triangles (cut once) |
| -------------- | -------------- | ----------------------------------- | --------------------------- |
| 10″            | 14.142″        | 15⅜″ square (15.349″)               | 8″ square (7.925″)          |
| 25 cm          | 35.36 cm       | 39 cm square (38.98 cm)             | 20.5 cm square (20.24 cm)   |

The calculator gives sizes for one side triangle square (it makes 4 triangles) and one corner square
(2 triangles). The number you need depends on the layout.

::calc onpoint
`,Ze=`---
title: Quarter-square triangles
order: 40
summary: Cut a square, cut both diagonals for four triangles, long side on the straight grain.
---

A quarter-square triangle (QST) is a square cut into quarters with both diagonals. Its **long side**
runs along the straight grain, which keeps the outside edge of a unit from stretching. They are used
for the hourglass shape, flying-geese centers, and the side triangles of an
[on-point setting](/help/math/on-point-settings).

## The formula

Let the finished long side be f. Cut a square of

> **cut = f + 2 × (1 + √2) × seam allowance**

then cut both diagonals to make **4 triangles**. With a ¼″ seam allowance, 2(1 + √2) × ¼″ ≈ 1.207″,
and with 7.5 mm it is ≈ 3.62 cm.

This is more than a half-square triangle needs. The long side is the diagonal of the cut square, but the
triangle needs a seam allowance along that side _and_ a seam allowance on the two short sides, which
sit at 45° to the long side. Each short seam moves the points out by (1 + √2)s along the long side.

<svg viewBox="0 0 220 120" width="330" role="img" aria-label="A square cut along both diagonals into four triangles">
  <rect x="10" y="10" width="100" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="10" x2="110" y2="110" stroke="currentColor" stroke-width="1.5"/>
  <line x1="110" y1="10" x2="10" y2="110" stroke="currentColor" stroke-width="1.5"/>
  <text x="125" y="50" font-size="11" fill="currentColor">cut square,</text>
  <text x="125" y="68" font-size="11" fill="currentColor">both diagonals:</text>
  <text x="125" y="86" font-size="11" fill="currentColor">4 triangles</text>
</svg>

## Worked examples

| Finished long side | Exact cut | Cut (rounded up)             | Makes       |
| ------------------ | --------- | ---------------------------- | ----------- |
| 4″                 | 5.207″    | 5¼″ square                   | 4 triangles |
| 10 cm              | 13.62 cm  | 14 cm square (5 mm rounding) | 4 triangles |

::calc qst
`,Qe=`---
title: Rounding
order: 120
summary: Why cut sizes round up to a ruler mark, and what that does to your piece.
---

Exact cut sizes often don't fall on a ruler mark. The triangle formulas are the clearest case, since a ¼″ seam
allowance gives 3.854″, which sits between 3¾″ and 3⅞″. The app rounds **up** to the next mark so the
piece is never too small, then you can trim it down after sewing.

## The rule

> **cut = ⌈exact ÷ step⌉ × step**

The step is the **Rounding** setting in the Print tab. It offers ⅛″ or 1/16″ (inches), 5 mm or 1 mm (metric), or
none for exact numbers. Fabric amounts use their own step (⅛ yd, ¼ yd, ½ yd, or 10, 20, 45 cm).

## Worked examples

| Exact   | Step  | Cut      |
| ------- | ----- | -------- |
| 3.854″  | ⅛″    | 3⅞″      |
| 3.8″    | 1/16″ | 3 13/16″ |
| 9.31 cm | 5 mm  | 9.5 cm   |
| 9.31 cm | 1 mm  | 9.4 cm   |

## When rounding distorts

If the _finished_ size itself is not on the step, rounding changes the unit's size by a bit, and the
printout flags it. A coarse step is faster to cut, but a finer step is closer to exact. Rounding up
means the cut is never smaller than needed.

::calc rounding
`,$e=`---
title: Seam allowance
order: 10
summary: The strip of fabric inside every seam, and why every cut size adds it.
---

The seam allowance (s) is the strip of fabric between the cut edge and the stitching line. Quilt
patterns list **finished** sizes (what a piece measures once sewn into the quilt). To cut a piece you
add a seam allowance on every edge that will be sewn.

## The standard

Quilters use **¼″** in inches, and **7.5 mm** (a little more than ¼″) in metric. The app uses these
by default. Change the seam allowance in the Print tab's options. Every cut size, template, and
calculator in Help follows it.

## Why it matters

A seam allowance that is a hair too wide or narrow adds up over a block. Sew a test and
measure. Three strips cut 2″ wide (5 cm) and sewn together should measure exactly 5″ across (with 5 cm strips and 7.5 mm seams, 12 cm). If not, adjust your
needle position or presser foot until they do. Accuracy matters more than the exact value, so use the
same allowance throughout a project.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="A cut square with a dashed stitching line inside it. The gap is the seam allowance">
  <rect x="10" y="10" width="100" height="90" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="70" height="60" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="125" y="40" font-size="11" fill="currentColor">cut edge (solid)</text>
  <text x="125" y="58" font-size="11" fill="currentColor">sewing line (dashed)</text>
  <text x="125" y="76" font-size="11" fill="currentColor">seam allowance (shaded)</text>
</svg>

## Where it shows up

- A square or rectangle adds **2 × s** to each dimension (one seam on each side). See
  [Squares and rectangles](/help/math/squares-and-rectangles).
- Triangles add more than 2 × s, because their points and angled seams need extra. See
  [Half-square triangles](/help/math/half-square-triangles) and
  [Quarter-square triangles](/help/math/quarter-square-triangles).
- The final size is rounded up to a mark on the ruler. See [Rounding](/help/math/rounding).
`,et=`---
title: Square in a square
order: 60
summary: A square set on point inside four corner triangles.
---

A square-in-a-square unit is a center square turned 45° with a triangle on each side. Its corners
touch the middle of the unit's sides.

## The formulas

For a finished unit of side f:

> **center square (finished) = f ÷ √2**
> **center cut = f ÷ √2 + 2 × seam allowance**
> **corner triangles = two squares of the half-square size for f ÷ 2, each cut once diagonally**

The center's diagonal is the unit's side, so its side is f ÷ √2 (about 0.707 × f). The corners are
half-square triangles whose legs are f ÷ 2, so the cut is f ÷ 2 + (2 + √2) × s, and each square is
cut once diagonally to make 2 triangles.

<svg viewBox="0 0 220 120" width="330" role="img" aria-label="A square with a tilted square inside it, touching the middle of each side">
  <rect x="10" y="10" width="100" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="60,10 110,60 60,110 10,60" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <text x="125" y="55" font-size="11" fill="currentColor">tilted center</text>
  <text x="125" y="72" font-size="11" fill="currentColor">4 corner triangles</text>
</svg>

## Worked examples

| Finished unit | Center cut            | Corner squares (cut once) |
| ------------- | --------------------- | ------------------------- |
| 4″            | 3.328″ → 3⅜″ square   | 2 × 2⅞″ square            |
| 10 cm         | 8.57 cm → 9 cm square | 2 × 8 cm square           |

The calculator rounds up to your ruler. See [Rounding](/help/math/rounding). For several units at
once, see [Square-in-a-square units](/help/techniques/square-in-a-square-units).

::calc sqinsq
`,tt=`---
title: Squares and rectangles
order: 20
summary: Cut size is the finished size plus a seam allowance on each side.
---

Squares and rectangles are the simplest pieces. Each edge gets a seam allowance, so each dimension
grows by two of them.

## The formula

> **cut = finished size + 2 × seam allowance**

Do it once for each side of a rectangle. With a ¼″ seam allowance that is the familiar "add ½″". With
7.5 mm it is "add 1.5 cm".

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="A rectangle with the finished area dashed inside it, a seam allowance on every side">
  <rect x="10" y="10" width="120" height="80" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="90" height="50" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="142" y="45" font-size="11" fill="currentColor">cut = finished</text>
  <text x="142" y="62" font-size="11" fill="currentColor">+ s on each side</text>
</svg>

## Worked examples

| Finished     | Exact cut     | Cut (rounded up) |
| ------------ | ------------- | ---------------- |
| 3″ square    | 3½″           | 3½″ square       |
| 6″ × 3″      | 6½″ × 3½″     | 6½″ × 3½″        |
| 8 cm square  | 9.5 cm        | 9.5 cm square    |
| 15 cm × 8 cm | 16.5 × 9.5 cm | 16.5 × 9.5 cm    |

These already land on a ruler mark. When they don't, the cut is rounded up. See
[Rounding](/help/math/rounding).

## Calculators

::calc square

::calc rect

To work out how much fabric a pile of squares needs, see
[Yardage and fat quarters](/help/math/yardage-and-fat-quarters).
`,nt=`---
title: Yardage and fat quarters
order: 110
summary: How much fabric a set of squares needs, from the bolt or in fat quarters.
---

Yardage depends on how pieces are cut from strips. The app plans whole strips across the usable
width of the fabric.

## The method

1. Work out the cut size of one piece (see [Squares and rectangles](/help/math/squares-and-rectangles)).
2. The strip is as wide as the cut size. **Pieces per strip = ⌊usable width ÷ cut size⌋.**
3. **Strips = ⌈pieces ÷ pieces per strip⌉.**
4. **Fabric = strips × strip width**, rounded up to your fabric step (⅛ yd or 10 cm by default).

Usable width is a little less than the printed width, since selvages are trimmed (a 42″ bolt gives
40″, 110 cm gives 105 cm).

## Fat quarters

A fat quarter is 18″ × 21″ (50 × 55 cm), with 20″ (53 cm) usable. Strips are packed into the 18″ (50
cm) depth. The calculator counts how many fat quarters the strips fit into.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="A fat quarter with strips laid across its width">
  <rect x="10" y="10" width="140" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="10" y="10" width="140" height="18" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <rect x="10" y="28" width="140" height="18" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <rect x="10" y="46" width="140" height="18" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <text x="160" y="40" font-size="11" fill="currentColor">strips across</text>
  <text x="160" y="56" font-size="11" fill="currentColor">the 21″ width</text>
</svg>

## Worked examples (40 squares)

| Finished | Cut    | Per strip | Strips | Fabric (bolt)              | Fat quarters |
| -------- | ------ | --------- | ------ | -------------------------- | ------------ |
| 3″       | 3½″    | 11        | 4      | 14″, rounded up to ½ yd    | 2            |
| 8 cm     | 9.5 cm | 11        | 4      | 38 cm, rounded up to 40 cm | 2            |

::calc yardage
`,rt=`---
title: Useful resources
order: 10
summary: Calculators, the RRQuilts project, Creative Commons licenses, and places to learn quilting.
---

## Calculators

Each of these Quilt math topics has a calculator that uses your seam allowance and rounding from the
Print settings. They work offline.

- [Squares and rectangles](/help/math/squares-and-rectangles)
- [Half-square triangles](/help/math/half-square-triangles)
- [Quarter-square triangles](/help/math/quarter-square-triangles)
- [Flying geese](/help/math/flying-geese)
- [Square in a square](/help/math/square-in-a-square)
- [On-point settings](/help/math/on-point-settings)
- [Borders](/help/math/borders)
- [Binding](/help/math/binding)
- [Backing](/help/math/backing)
- [Yardage and fat quarters](/help/math/yardage-and-fat-quarters)
- [Rounding](/help/math/rounding)

The rest of the links on this page lead off the app and need an internet connection. Each opens in a
new tab. Nothing is fetched until you follow it.

## RRQuilts

- The source code (MIT licensed) is on [RRQuilts on GitHub](https://github.com/RagingRoosevelt/RRQuilts).
- To [report a problem or suggest an idea](https://github.com/RagingRoosevelt/RRQuilts/issues), open a GitHub
  issue.
- Anyone writing tools that read \`.rrq\` files can use the JSON Schema for
  [the project file format](https://ragingroosevelt.github.io/RRQuilts/schemas/rrq.v1.json).

## Licenses

Blocks, palettes, and packs carry a license that says what others may do with them (see
[Credits and licenses](/help/guides/credits-and-licenses)).

- [About the Creative Commons licenses](https://creativecommons.org/share-your-work/cclicenses/)
  explains what BY, SA, NC, and ND mean.
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) lets others share and adapt, with credit.
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) is the same, and adaptations keep
  the license.
- [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) works like BY-SA but allows
  non-commercial use only.
- [CC0 / Public Domain](https://creativecommons.org/public-domain/cc0/) places no conditions on use.

## Learning to quilt

- [Quilting on Wikipedia](https://en.wikipedia.org/wiki/Quilting) covers history, terms, and techniques.
- [The International Quilt Museum](https://www.internationalquiltmuseum.org/) shows collections and
  exhibitions of historic and contemporary quilts.
- [The Quilt Alliance](https://quiltalliance.org/) documents and shares quilts and their makers'
  stories.
- [Quilt Index](https://quiltindex.org/) is a searchable database of documented quilts and patterns.
- Your local quilt guild or [quilt shop](https://www.prunusdomestic.com/pdx_local_retail.html?category=sewing) is the best place to learn hands-on.
`,it=`---
title: Continuous mitered binding
order: 10
summary: Join binding strips into one long strip, sew it on with mitered corners, and turn it to the back.
---

Continuous binding is one long folded strip sewn around the whole quilt, with a 45° miter at
each corner. The calculator gives the number of strips to cut. The binding width and the fabric
rounding come from your print settings.

## What to cut

Cut the strips across the fabric (selvage to selvage). The total length is the quilt's perimeter,
2 × (width + height), plus 10″ (25 cm) for the joins and the four corners.

| Quilt           | Total length | Strips (width 2½″ / 6 cm) | Fabric     |
| --------------- | ------------ | ------------------------- | ---------- |
| 48″ × 48″       | 202″         | 6 strips, 2½″ wide        | ½ yd (18″) |
| 120 cm × 120 cm | 505 cm       | 5 strips, 6 cm wide       | 30 cm      |

Strips are counted using 40″ (105 cm) of usable fabric width.

::calc binding

## Steps

1. **Join the strips end to end.** Lay two strips right sides together at right angles, so the ends
   form a square corner. Sew diagonally across the corner, trim the extra fabric to ¼″ (7.5 mm)
   beyond the seam, and press the seam open. Repeat until you have one long strip.

<svg viewBox="0 0 300 110" width="450" role="img" aria-label="Two strips crossing at right angles with a diagonal sewing line across the overlap">
  <rect x="20" y="50" width="130" height="30" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.5"/>
  <rect x="120" y="10" width="30" height="100" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="1.5"/>
  <line x1="120" y1="50" x2="150" y2="80" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="160" y="46" font-size="11" fill="currentColor">sew on the diagonal</text>
  <text x="160" y="62" font-size="11" fill="currentColor">trim to ¼″</text>
</svg>

2. **Press the strip in half.** Fold it lengthwise, wrong sides together, and press.
3. **Start sewing.** Leave a tail of about 10″ (25 cm) loose. Line the raw edges up with the quilt
   top's edge, starting partway along a side (not at a corner), and sew with a ¼″ (7.5 mm) seam.
4. **Stop at the first corner.** Stop sewing exactly one seam allowance from the corner and
   backstitch. Cut the threads and remove the quilt.

<svg viewBox="0 0 300 120" width="450" role="img" aria-label="Binding sewn along the bottom edge, stopping a seam allowance short of the corner">
  <defs><pattern id="mx-cb1" patternUnits="userSpaceOnUse" x="20" y="10" width="30" height="30"><polygon points="8.64,15.0 10.76,17.12 12.88,15.0 10.76,12.88" fill="#c4282c"/><polygon points="10.76,12.88 12.88,15.0 15.0,12.88 12.88,10.76" fill="#5a78a0"/><polygon points="12.88,10.76 15.0,12.88 17.12,10.76 15.0,8.64" fill="#c4282c"/><polygon points="10.76,17.12 12.88,19.24 15.0,17.12 12.88,15.0" fill="#5a78a0"/><polygon points="12.88,15.0 15.0,17.12 17.12,15.0 15.0,12.88" fill="#c4282c"/><polygon points="15.0,12.88 17.12,15.0 19.24,12.88 17.12,10.76" fill="#5a78a0"/><polygon points="12.88,19.24 15.0,21.36 17.12,19.24 15.0,17.12" fill="#c4282c"/><polygon points="15.0,17.12 17.12,19.24 19.24,17.12 17.12,15.0" fill="#5a78a0"/><polygon points="17.12,15.0 19.24,17.12 21.36,15.0 19.24,12.88" fill="#c4282c"/><polygon points="19.24,17.12 30.0,27.88 30.0,30.0 27.88,30.0 17.12,19.24" fill="#f4ecd8"/><polygon points="12.88,19.24 2.12,30.0 0.0,30.0 0.0,27.88 10.76,17.12" fill="#f4ecd8"/><polygon points="10.76,12.88 0.0,2.12 0.0,0.0 2.12,0.0 12.88,10.76" fill="#f4ecd8"/><polygon points="17.12,10.76 27.88,0.0 30.0,0.0 30.0,2.12 19.24,12.88" fill="#f4ecd8"/><polygon points="23.64,30.0 15.0,21.36 17.12,19.24 23.64,25.76" fill="#5a78a0"/><polygon points="0.0,23.64 8.64,15.0 10.76,17.12 4.24,23.64" fill="#5a78a0"/><polygon points="6.36,0.0 15.0,8.64 12.88,10.76 6.36,4.24" fill="#5a78a0"/><polygon points="30.0,6.36 21.36,15.0 19.24,12.88 25.76,6.36" fill="#5a78a0"/><polygon points="21.36,15.0 30.0,23.64 25.76,23.64 19.24,17.12" fill="#5a78a0"/><polygon points="15.0,21.36 6.36,30.0 6.36,25.76 12.88,19.24" fill="#5a78a0"/><polygon points="8.64,15.0 0.0,6.36 4.24,6.36 10.76,12.88" fill="#5a78a0"/><polygon points="15.0,8.64 23.64,0.0 23.64,4.24 17.12,10.76" fill="#5a78a0"/><polygon points="27.88,30.0 23.64,30.0 23.64,25.76" fill="#c4282c"/><polygon points="0.0,27.88 0.0,23.64 4.24,23.64" fill="#c4282c"/><polygon points="2.12,0.0 6.36,0.0 6.36,4.24" fill="#c4282c"/><polygon points="30.0,2.12 30.0,6.36 25.76,6.36" fill="#c4282c"/><polygon points="30.0,23.64 30.0,27.88 25.76,23.64" fill="#c4282c"/><polygon points="6.36,30.0 2.12,30.0 6.36,25.76" fill="#c4282c"/><polygon points="0.0,6.36 0.0,2.12 4.24,6.36" fill="#c4282c"/><polygon points="23.64,0.0 27.88,0.0 23.64,4.24" fill="#c4282c"/><polygon points="23.64,30.0 6.36,30.0 15.0,21.36" fill="#96c4e8"/><polygon points="0.0,23.64 0.0,6.36 8.64,15.0" fill="#96c4e8"/><polygon points="6.36,0.0 23.64,0.0 15.0,8.64" fill="#96c4e8"/><polygon points="30.0,6.36 30.0,23.64 21.36,15.0" fill="#96c4e8"/></pattern></defs>
  <rect x="20" y="10" width="150" height="90" fill="url(#mx-cb1)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="20" y="100" width="136" height="10" fill="currentColor" fill-opacity="0.3" stroke="currentColor"/>
  <line x1="20" y1="95" x2="156" y2="95" stroke="currentColor" stroke-dasharray="4 3"/>
  <circle cx="156" cy="95" r="3" fill="currentColor"/>
  <text x="190" y="99" font-size="11" fill="currentColor">stop here</text>
</svg>

5. **Fold up at 45°.** Fold the binding straight up, away from the quilt, so its fold lines up with
   a 45° angle from the corner. The raw edge of the binding now runs along the next side.

<svg viewBox="0 0 300 120" width="450" role="img" aria-label="The binding folded up at 45 degrees at the corner">
  <defs><pattern id="mx-cb2" patternUnits="userSpaceOnUse" x="20" y="10" width="30" height="30"><polygon points="8.64,15.0 10.76,17.12 12.88,15.0 10.76,12.88" fill="#c4282c"/><polygon points="10.76,12.88 12.88,15.0 15.0,12.88 12.88,10.76" fill="#5a78a0"/><polygon points="12.88,10.76 15.0,12.88 17.12,10.76 15.0,8.64" fill="#c4282c"/><polygon points="10.76,17.12 12.88,19.24 15.0,17.12 12.88,15.0" fill="#5a78a0"/><polygon points="12.88,15.0 15.0,17.12 17.12,15.0 15.0,12.88" fill="#c4282c"/><polygon points="15.0,12.88 17.12,15.0 19.24,12.88 17.12,10.76" fill="#5a78a0"/><polygon points="12.88,19.24 15.0,21.36 17.12,19.24 15.0,17.12" fill="#c4282c"/><polygon points="15.0,17.12 17.12,19.24 19.24,17.12 17.12,15.0" fill="#5a78a0"/><polygon points="17.12,15.0 19.24,17.12 21.36,15.0 19.24,12.88" fill="#c4282c"/><polygon points="19.24,17.12 30.0,27.88 30.0,30.0 27.88,30.0 17.12,19.24" fill="#f4ecd8"/><polygon points="12.88,19.24 2.12,30.0 0.0,30.0 0.0,27.88 10.76,17.12" fill="#f4ecd8"/><polygon points="10.76,12.88 0.0,2.12 0.0,0.0 2.12,0.0 12.88,10.76" fill="#f4ecd8"/><polygon points="17.12,10.76 27.88,0.0 30.0,0.0 30.0,2.12 19.24,12.88" fill="#f4ecd8"/><polygon points="23.64,30.0 15.0,21.36 17.12,19.24 23.64,25.76" fill="#5a78a0"/><polygon points="0.0,23.64 8.64,15.0 10.76,17.12 4.24,23.64" fill="#5a78a0"/><polygon points="6.36,0.0 15.0,8.64 12.88,10.76 6.36,4.24" fill="#5a78a0"/><polygon points="30.0,6.36 21.36,15.0 19.24,12.88 25.76,6.36" fill="#5a78a0"/><polygon points="21.36,15.0 30.0,23.64 25.76,23.64 19.24,17.12" fill="#5a78a0"/><polygon points="15.0,21.36 6.36,30.0 6.36,25.76 12.88,19.24" fill="#5a78a0"/><polygon points="8.64,15.0 0.0,6.36 4.24,6.36 10.76,12.88" fill="#5a78a0"/><polygon points="15.0,8.64 23.64,0.0 23.64,4.24 17.12,10.76" fill="#5a78a0"/><polygon points="27.88,30.0 23.64,30.0 23.64,25.76" fill="#c4282c"/><polygon points="0.0,27.88 0.0,23.64 4.24,23.64" fill="#c4282c"/><polygon points="2.12,0.0 6.36,0.0 6.36,4.24" fill="#c4282c"/><polygon points="30.0,2.12 30.0,6.36 25.76,6.36" fill="#c4282c"/><polygon points="30.0,23.64 30.0,27.88 25.76,23.64" fill="#c4282c"/><polygon points="6.36,30.0 2.12,30.0 6.36,25.76" fill="#c4282c"/><polygon points="0.0,6.36 0.0,2.12 4.24,6.36" fill="#c4282c"/><polygon points="23.64,0.0 27.88,0.0 23.64,4.24" fill="#c4282c"/><polygon points="23.64,30.0 6.36,30.0 15.0,21.36" fill="#96c4e8"/><polygon points="0.0,23.64 0.0,6.36 8.64,15.0" fill="#96c4e8"/><polygon points="6.36,0.0 23.64,0.0 15.0,8.64" fill="#96c4e8"/><polygon points="30.0,6.36 30.0,23.64 21.36,15.0" fill="#96c4e8"/></pattern></defs>
  <rect x="20" y="10" width="150" height="90" fill="url(#mx-cb2)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="156,100 156,110 20,110 20,100" fill="currentColor" fill-opacity="0.3" stroke="currentColor"/>
  <polygon points="170,100 156,100 170,86" fill="currentColor" fill-opacity="0.4" stroke="currentColor"/>
  <text x="190" y="95" font-size="11" fill="currentColor">fold up at 45°</text>
</svg>

6. **Fold back down.** Fold the binding down along the next side, keeping the fold level with the
   top edge of the quilt. The raw edges now line up with the next side, and the fold hides the
   miter.

<svg viewBox="0 0 300 120" width="450" role="img" aria-label="The binding folded back down along the next side of the quilt">
  <defs><pattern id="mx-cb3" patternUnits="userSpaceOnUse" x="20" y="10" width="30" height="30"><polygon points="8.64,15.0 10.76,17.12 12.88,15.0 10.76,12.88" fill="#c4282c"/><polygon points="10.76,12.88 12.88,15.0 15.0,12.88 12.88,10.76" fill="#5a78a0"/><polygon points="12.88,10.76 15.0,12.88 17.12,10.76 15.0,8.64" fill="#c4282c"/><polygon points="10.76,17.12 12.88,19.24 15.0,17.12 12.88,15.0" fill="#5a78a0"/><polygon points="12.88,15.0 15.0,17.12 17.12,15.0 15.0,12.88" fill="#c4282c"/><polygon points="15.0,12.88 17.12,15.0 19.24,12.88 17.12,10.76" fill="#5a78a0"/><polygon points="12.88,19.24 15.0,21.36 17.12,19.24 15.0,17.12" fill="#c4282c"/><polygon points="15.0,17.12 17.12,19.24 19.24,17.12 17.12,15.0" fill="#5a78a0"/><polygon points="17.12,15.0 19.24,17.12 21.36,15.0 19.24,12.88" fill="#c4282c"/><polygon points="19.24,17.12 30.0,27.88 30.0,30.0 27.88,30.0 17.12,19.24" fill="#f4ecd8"/><polygon points="12.88,19.24 2.12,30.0 0.0,30.0 0.0,27.88 10.76,17.12" fill="#f4ecd8"/><polygon points="10.76,12.88 0.0,2.12 0.0,0.0 2.12,0.0 12.88,10.76" fill="#f4ecd8"/><polygon points="17.12,10.76 27.88,0.0 30.0,0.0 30.0,2.12 19.24,12.88" fill="#f4ecd8"/><polygon points="23.64,30.0 15.0,21.36 17.12,19.24 23.64,25.76" fill="#5a78a0"/><polygon points="0.0,23.64 8.64,15.0 10.76,17.12 4.24,23.64" fill="#5a78a0"/><polygon points="6.36,0.0 15.0,8.64 12.88,10.76 6.36,4.24" fill="#5a78a0"/><polygon points="30.0,6.36 21.36,15.0 19.24,12.88 25.76,6.36" fill="#5a78a0"/><polygon points="21.36,15.0 30.0,23.64 25.76,23.64 19.24,17.12" fill="#5a78a0"/><polygon points="15.0,21.36 6.36,30.0 6.36,25.76 12.88,19.24" fill="#5a78a0"/><polygon points="8.64,15.0 0.0,6.36 4.24,6.36 10.76,12.88" fill="#5a78a0"/><polygon points="15.0,8.64 23.64,0.0 23.64,4.24 17.12,10.76" fill="#5a78a0"/><polygon points="27.88,30.0 23.64,30.0 23.64,25.76" fill="#c4282c"/><polygon points="0.0,27.88 0.0,23.64 4.24,23.64" fill="#c4282c"/><polygon points="2.12,0.0 6.36,0.0 6.36,4.24" fill="#c4282c"/><polygon points="30.0,2.12 30.0,6.36 25.76,6.36" fill="#c4282c"/><polygon points="30.0,23.64 30.0,27.88 25.76,23.64" fill="#c4282c"/><polygon points="6.36,30.0 2.12,30.0 6.36,25.76" fill="#c4282c"/><polygon points="0.0,6.36 0.0,2.12 4.24,6.36" fill="#c4282c"/><polygon points="23.64,0.0 27.88,0.0 23.64,4.24" fill="#c4282c"/><polygon points="23.64,30.0 6.36,30.0 15.0,21.36" fill="#96c4e8"/><polygon points="0.0,23.64 0.0,6.36 8.64,15.0" fill="#96c4e8"/><polygon points="6.36,0.0 23.64,0.0 15.0,8.64" fill="#96c4e8"/><polygon points="30.0,6.36 30.0,23.64 21.36,15.0" fill="#96c4e8"/></pattern></defs>
  <rect x="20" y="10" width="150" height="90" fill="url(#mx-cb3)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="20" y="100" width="150" height="10" fill="currentColor" fill-opacity="0.3" stroke="currentColor"/>
  <rect x="170" y="10" width="10" height="90" fill="currentColor" fill-opacity="0.4" stroke="currentColor"/>
  <text x="190" y="50" font-size="11" fill="currentColor">fold down,</text>
  <text x="190" y="66" font-size="11" fill="currentColor">even with the edge</text>
</svg>

7. **Keep sewing.** Start at the very edge of the fold with a backstitch and sew down the next
   side, stopping a seam allowance from the next corner. Repeat the fold up and fold down at each
   corner.
8. **Join the two ends.** Stop about 12″ (30 cm) before where you started. Lay both tails flat along
   the quilt edge and trim them so they overlap by the width of the cut strip (2½″ / 6 cm).
   Open the tails, join them right sides together with a diagonal seam as in step 1, check that
   the strip fits, trim the seam to ¼″, press it open, and sew the remaining binding down.

<svg viewBox="0 0 300 90" width="450" role="img" aria-label="The two binding tails overlapping by one strip width before being joined">
  <rect x="10" y="30" width="110" height="20" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <rect x="90" y="52" width="120" height="20" fill="currentColor" fill-opacity="0.35" stroke="currentColor"/>
  <line x1="90" y1="20" x2="90" y2="80" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="120" y1="20" x2="120" y2="80" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="105" y="14" font-size="11" fill="currentColor" text-anchor="middle">overlap = strip width</text>
</svg>

9. **Turn to the back.** Fold the binding over the raw edge to the back, so the fold just covers the
   stitching line. At each corner, fold one side first and then the other to form a miter on the
   front and the back. Hand-stitch the fold down, or machine-stitch from the front.

<svg viewBox="0 0 300 110" width="450" role="img" aria-label="Cross section of the binding folded over the quilt edge">
  <rect x="20" y="40" width="120" height="14" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/>
  <path d="M110 30 H150 V64 H110" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="160" y="50" font-size="11" fill="currentColor">folded over the edge</text>
  <text x="20" y="80" font-size="11" fill="currentColor">quilt (front up)</text>
</svg>

See [binding math](/help/math/binding) for the formula behind the strip count.
`,at=`---
title: Flying geese units
order: 20
summary: Make flying geese with stitch and flip, or four at a time from one large and four small squares.
---

A flying geese unit is a rectangle twice as wide as it is tall, with a large triangle (the goose) and a
small triangle (sky) on each side. The formulas are in [flying geese](/help/math/flying-geese).
The calculator gives the cut sizes for each method.

## What to cut

For a 4″ × 2″ (10 × 5 cm) finished unit, with ¼″ (7.5 mm) seams and rounding to ⅛″ (5 mm):

| Method          | Cut                                                           | Makes   |
| --------------- | ------------------------------------------------------------- | ------- |
| Stitch and flip | 1 rectangle 4½″ × 2½″ (11.5 × 6.5 cm), 2 squares 2½″ (6.5 cm) | 1 unit  |
| Four at a time  | 1 square 5¼″ (14 cm), 4 squares 2⅞″ (8 cm)                    | 4 units |

::calc geese

## Stitch and flip

1. Draw a diagonal line on the back of each small square.
2. Put a small square on one end of the rectangle, right sides together, so the line runs from the
   corner on the rectangle's long edge toward the middle of the other end.

<svg viewBox="0 0 220 90" width="330" role="img" aria-label="A small square placed on the left end of a rectangle with a diagonal line">
  <rect x="20" y="20" width="160" height="60" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="20" y1="80" x2="80" y2="20" stroke="currentColor" stroke-width="1.5"/>
</svg>

3. Sew on the line. Trim the corner beyond the seam to ¼″ (7.5 mm), and press the triangle
   open toward the corner.
4. Repeat on the other end with the second square, so the two lines make a point at the center.

<svg viewBox="0 0 220 90" width="330" role="img" aria-label="Both small squares sewn on. The two diagonals meet to form the point of the goose">
  <rect x="20" y="20" width="160" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="20,80 80,20 20,20" fill="currentColor" fill-opacity="0.3" stroke="currentColor"/>
  <polygon points="180,80 120,20 180,20" fill="currentColor" fill-opacity="0.3" stroke="currentColor"/>
</svg>

## Four at a time

1. Draw a diagonal line on the back of each small square.
2. Put two small squares on opposite corners of the large square, right sides together. The
   squares overlap a little in the middle, with the lines running corner to corner.
3. Sew ¼″ (7.5 mm) on both sides of the line, then cut on the line. Press the small triangles out.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="Two small squares on opposite corners of a large square, with a stitching line on each side of the diagonal">
  <rect x="30" y="10" width="90" height="90" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.5"/>
  <rect x="30" y="10" width="50" height="50" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <rect x="70" y="50" width="50" height="50" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="30" y1="100" x2="120" y2="10" stroke="currentColor"/>
  <text x="130" y="60" font-size="11" fill="currentColor">sew both sides,</text>
  <text x="130" y="74" font-size="11" fill="currentColor">then cut</text>
</svg>

4. Put a small square on the corner of each of the two pieces, right sides together, with the line
   crossing the open corner toward the unit's center.
5. Sew ¼″ (7.5 mm) on both sides of the line again and cut on the line. Press open. You have four
   units.

<svg viewBox="0 0 220 90" width="330" role="img" aria-label="A unit with a small square on its open corner and the stitching and cutting lines">
  <polygon points="20,80 110,10 200,80" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
  <rect x="100" y="30" width="50" height="50" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="100" y1="80" x2="150" y2="30" stroke="currentColor"/>
</svg>

6. Trim each unit to 4½″ × 2½″ (11.5 × 6.5 cm), which is the finished size plus a seam allowance on every
   side, leaving ¼″ beyond the point.
`,ot=`---
title: Half-square triangle units
order: 30
summary: Make two, four, or eight half-square triangle units at a time, then trim them to size.
---

A half-square triangle unit is a square made of two triangles of different fabrics. Making several at
once is faster and more accurate than cutting and sewing single triangles. The math is in
[half-square triangles](/help/math/half-square-triangles). The calculator gives the squares to
cut for each method.

## What to cut

For a finished unit with a 3″ (8 cm) leg, ¼″ (7.5 mm) seams, and rounding to ⅛″ (5 mm):

| Method          | Cut, from each of the two fabrics | Makes   |
| --------------- | --------------------------------- | ------- |
| Two at a time   | 3⅞″ (11 cm) square, one of each   | 2 units |
| Four at a time  | 5½″ (15 cm) square, one of each   | 4 units |
| Eight at a time | 7¾″ (22 cm) square, one of each   | 8 units |

::calc hst

The units come out slightly oversize. Trim them to the finished size plus two seam allowances,
which is 3½″ (9.5 cm) in this example.

## Two at a time

1. Draw a diagonal line on the back of the lighter square.
2. Put the two squares right sides together and sew ¼″ (7.5 mm) on both sides of the line.

<svg viewBox="0 0 160 110" width="240" role="img" aria-label="A square with a diagonal line and a stitching line on each side">
  <rect x="20" y="10" width="90" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="currentColor"/>
  <line x1="20" y1="90" x2="100" y2="10" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="30" y1="100" x2="110" y2="20" stroke="currentColor" stroke-dasharray="4 3"/>
</svg>

3. Cut on the drawn line and press each unit open toward the darker fabric.

## Four at a time

1. Draw both diagonals on the back of the lighter square.
2. Put the squares right sides together and sew ¼″ (7.5 mm) inside the edge, all the way around.

<svg viewBox="0 0 160 110" width="240" role="img" aria-label="A square with both diagonals drawn and a stitching line all around the edge">
  <rect x="20" y="10" width="90" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="28" y="18" width="74" height="74" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="20" y1="10" x2="110" y2="100" stroke="currentColor"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="currentColor"/>
</svg>

3. Cut along both diagonals to get four units, and press each open toward the darker fabric.

## Eight at a time

1. Draw both diagonals on the back of the lighter square.
2. Put the squares right sides together and sew ¼″ (7.5 mm) on both sides of each diagonal.

<svg viewBox="0 0 160 110" width="240" role="img" aria-label="A square with both diagonals drawn and a stitching line on each side of each diagonal">
  <rect x="20" y="10" width="90" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="10" x2="110" y2="100" stroke="currentColor"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="currentColor"/>
  <line x1="20" y1="22" x2="98" y2="100" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="32" y1="10" x2="110" y2="88" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="20" y1="88" x2="98" y2="10" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="32" y1="100" x2="110" y2="22" stroke="currentColor" stroke-dasharray="4 3"/>
</svg>

3. Cut the square in half both ways (through the middle, parallel to the sides), then cut along
   both diagonals. That makes eight units.

<svg viewBox="0 0 160 110" width="240" role="img" aria-label="The cutting lines: through the middle both ways and along both diagonals">
  <rect x="20" y="10" width="90" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="65" y1="10" x2="65" y2="100" stroke="currentColor"/>
  <line x1="20" y1="55" x2="110" y2="55" stroke="currentColor"/>
  <line x1="20" y1="10" x2="110" y2="100" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="currentColor" stroke-dasharray="4 3"/>
</svg>

4. Press each unit open toward the darker fabric, then trim to size.
`,st=`---
title: Square in a square units
order: 40
summary: A center square with a triangle sewn to each side, turning it on point.
---

A square in a square is a square set on point inside a bigger square. The center is a square, and
four half-square triangles frame it. The formulas are in
[square in a square](/help/math/square-in-a-square).

## What to cut

For a 4″ (10 cm) finished unit, with ¼″ (7.5 mm) seams and rounding to ⅛″ (5 mm):

| Piece   | Cut                                        |
| ------- | ------------------------------------------ |
| Center  | 1 square, 3⅜″ (9 cm)                       |
| Corners | 2 squares, 2⅞″ (8 cm), cut once diagonally |

::calc sqinsq

Cutting each corner square once on the diagonal gives two triangles, so two squares make the four
corners.

## Steps

1. Cut the center square and the two corner squares, and cut the corner squares in half on one
   diagonal.
2. Fold the center square in half both ways, with the creases marking the middle of each side.
   Fold each triangle in half the same way to mark the middle of its long side.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="A center square and a triangle with the middle of the sides marked">
  <rect x="10" y="20" width="70" height="70" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="45" cy="20" r="3" fill="currentColor"/>
  <polygon points="110,90 190,90 150,50" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="150" cy="90" r="3" fill="currentColor"/>
  <text x="100" y="105" font-size="11" fill="currentColor" text-anchor="middle">match the marks</text>
</svg>

3. Sew a triangle to two opposite sides of the center, matching the marks. Press the seams toward
   the triangles.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="The center square with a triangle sewn to the left and right sides">
  <rect x="75" y="25" width="60" height="60" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="75,25 75,85 15,55" fill="currentColor" fill-opacity="0.35" stroke="currentColor"/>
  <polygon points="135,25 135,85 195,55" fill="currentColor" fill-opacity="0.35" stroke="currentColor"/>
</svg>

4. Sew the other two triangles to the remaining sides in the same way, and press toward them.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="The finished unit with triangles on all four sides">
  <rect x="55" y="10" width="90" height="90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="100,10 145,55 100,100 55,55" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
</svg>

5. Trim the unit to the finished size plus a seam allowance on each side. In
   this example that is a 4½″ (11.5 cm) square. The points of the center square sit ¼″ (7.5 mm) in from each edge.
`;function ct(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var N=ct();function lt(e){N=e}var P={exec:()=>null};function F(e){let t=[];return n=>{let r=Math.max(0,Math.min(3,n-1)),i=t[r];return i||(i=e(r),t[r]=i),i}}function I(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(L.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var ut=((e=``)=>{try{return!!RegExp(`(?<=1)(?<!1)`+e)}catch{return!1}})(),L={codeRemoveIndent:/^(?: {0,3}\t| {1,4})/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,endingSpaceTabChar:/[ \t]$/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,leadingSpaceTab:/^[ \t]+/,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,numericCharacterReference:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,numericCharacterReferenceOrAmpersand:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:F(e=>RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:F(e=>RegExp(`^ {0,${e}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),fencesBeginRegex:F(e=>RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),headingBeginRegex:F(e=>RegExp(`^ {0,${e}}#`)),htmlBeginRegex:F(e=>RegExp(`^ {0,${e}}(?:</?(?:${z})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`,`i`)),blockquoteBeginRegex:F(e=>RegExp(`^ {0,${e}}>`))},dt=/^(?:[ \t]*(?:\n|$))+/,ft=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,pt=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,R=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,mt=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,ht=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,gt=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,_t=I(gt).replace(/bull/g,ht).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),vt=I(gt).replace(/bull/g,ht).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),yt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,bt=/^[^\n]+/,xt=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,St=I(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,xt).replace(`title`,/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Ct=I(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,ht).getRegex(),z=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,wt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Tt=I(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,wt).replace(`tag`,z).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Et=e=>I(yt).replace(`hr`,R).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,e).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,z).getRegex(),Dt=Et(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),Ot=Et(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),kt={blockquote:I(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace(`paragraph`,Ot).getRegex(),code:ft,def:St,fences:pt,heading:mt,hr:R,html:Tt,lheading:_t,list:Ct,newline:dt,paragraph:Dt,table:P,text:bt},At=I(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,R).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,z).getRegex(),jt={...kt,lheading:vt,table:At,paragraph:I(yt).replace(`hr`,R).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,At).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,z).getRegex()},Mt={...kt,html:I(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace(`comment`,wt).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:P,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:I(yt).replace(`hr`,R).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,_t).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},Nt=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Pt=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Ft=/^( {2,}|\\)\n(?!\s*$)[ \t]*/,It=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,B=/[\p{P}\p{S}]/u,V=/[\s\p{P}\p{S}]/u,H=/[^\s\p{P}\p{S}]/u,Lt=I(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,V).getRegex(),Rt=/[\p{Pi}\p{Ps}"']/u,zt=/(?!~)[\p{P}\p{S}]/u,Bt=/(?!~)[\s\p{P}\p{S}]/u,Vt=/(?:[^\s\p{P}\p{S}]|~)/u,Ht=I(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,ut?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),Ut=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,Wt=I(Ut,`u`).replace(/punct/g,B).getRegex(),Gt=I(Ut,`u`).replace(/punct/g,zt).getRegex(),Kt=I(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,`u`).replace(/openQuote/g,Rt).replace(/punct/g,B).getRegex(),qt=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,Jt=I(qt,`gu`).replace(/notPunctSpace/g,H).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),Yt=I(qt,`gu`).replace(/notPunctSpace/g,Vt).replace(/punctSpace/g,Bt).replace(/punct/g,zt).getRegex(),Xt=I(`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,H).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),Zt=I(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,H).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),Qt=I(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,H).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),$t=I(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,B).getRegex(),en=I(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,H).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),tn=I(/\\(punct)/,`gu`).replace(/punct/g,B).getRegex(),nn=I(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/,`gu`).replace(/punct/g,B).getRegex(),rn=I(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),an=I(wt).replace(`(?:-->|$)`,`-->`).getRegex(),on=I(`^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,an).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),sn=/\[(?:\\[\s\S]|[^\[\]\\])*\]/,U=I(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace(`brackets`,sn).getRegex(),cn=I(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace(`label`,U).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace(`title`,/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ln=I(/^!?\[(label)\]\[(ref)\]/).replace(`label`,U).replace(`ref`,xt).getRegex(),un=I(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,xt).getRegex(),dn=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,fn=I(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace(`brackets`,sn).getRegex(),pn=I(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,I(/^!?\[(label)\]\[(ref)\]/).replace(`label`,fn).replace(`ref`,dn).getRegex()).replace(`nolink`,I(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,dn).getRegex()).getRegex(),mn=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,hn=I(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g,/[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),gn={_backpedal:P,anyPunctuation:tn,anyPunctuationOutsideCode:nn,autolink:rn,blockSkip:Ht,br:Ft,code:Pt,del:P,delLDelim:P,delRDelim:P,emStrongLDelim:Wt,emStrongRDelimAst:Jt,emStrongRDelimUnd:Zt,escape:Nt,link:cn,nolink:un,punctuation:Lt,reflink:ln,reflinkSearch:pn,tag:on,text:It,url:P},_n={...gn,emStrongLDelim:Kt,emStrongRDelimAst:Xt,emStrongRDelimUnd:Qt,link:I(/^!?\[(label)\]\((.*?)\)/).replace(`label`,U).getRegex(),reflink:I(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,U).getRegex()},vn={...gn,emStrongRDelimAst:Yt,emStrongLDelim:Gt,delLDelim:$t,delRDelim:en,url:I(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`emailProtocol`,hn).replace(`protocol`,mn).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:I(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace(`protocol`,mn).replace(/emailProtocol/g,/(?:mailto|xmpp):/).getRegex()},yn={...vn,br:I(Ft).replace(`{2,}`,`*`).getRegex(),text:I(vn.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},W={normal:kt,gfm:jt,pedantic:Mt},G={normal:gn,gfm:vn,breaks:yn,pedantic:_n},bn={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},xn=e=>bn[e];function K(e,t){if(t){if(L.escapeTest.test(e))return e.replace(L.escapeReplace,xn)}else if(L.escapeTestNoEncode.test(e))return e.replace(L.escapeReplaceNoEncode,xn);return e}function Sn(e){return L.numericCharacterReference.test(e)?e.replace(L.numericCharacterReferenceOrAmpersand,(e,t,n)=>{if(t===void 0&&n===void 0)return`&amp;`;let r=t===void 0?Number.parseInt(n,16):Number.parseInt(t,10);return r===0||r>1114111||r>=55296&&r<=57343?`�`:r===38?`&amp;`:String.fromCodePoint(r)}):e}function Cn(e){try{e=encodeURI(e).replace(L.percentDecode,`%`)}catch{return null}return e}function wn(e,t){let n=e.replace(L.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(L.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t){if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``)}for(;r<n.length;r++)n[r]=n[r].trim().replace(L.slashPipe,`|`);return n}function q(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function Tn(e){let t=e.split(`
`),n=t.length-1;for(;n>=0&&L.blankLine.test(t[n]);)n--;return t.length-n<=2?e:t.slice(0,n+1).join(`
`)}function En(e){return e.trim().toLowerCase().toUpperCase().toLowerCase()}function Dn(e,t){if(e.indexOf(t[0])===-1&&e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}function On(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function kn(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`),c=e[0].charAt(0)===`!`,l=r.state.inLink,u=r.state.linkEmitted,d=r.state.inRawBlock;r.state.inLink=!0,r.state.linkEmitted=!1;let f=r.inlineTokens(s),p=r.state.linkEmitted;if(r.state.linkEmitted=u,r.state.inLink=l,!c){if(p){r.state.inRawBlock=d;return}r.state.linkEmitted=!0}return{type:c?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:f}}function An(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return e.slice(Math.min(r.length,i.length))}).join(`
`)}function jn(e,t,n,r){if(!t.includes(`<`))return!1;for(let i=0;i<t.length;i++){if(t[i]===`\\`){i++;continue}if(t[i]==="`"){let e=r.inline.code.exec(t.slice(i));if(e){i+=e[0].length-1;continue}}if(t[i]!==`<`)continue;let a=e.slice(n+i),o=r.inline.tag.exec(a)||r.inline.autolink.exec(a);if(o){if(o[0].length>t.length-i)return!0;i+=o[0].length-1}}return!1}var Mn=class{options;rules;lexer;constructor(e){this.options=e||N}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=this.options.pedantic?t[0]:Tn(t[0]);return{type:`code`,raw:e,codeBlockStyle:`indented`,text:e.replace(this.rules.other.codeRemoveIndent,``)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=An(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=q(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceTabChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:q(t[0],`
`),depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:q(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=q(t[0],`
`).split(`
`),n=``,r=``,i=[];for(;e.length>0;){let t=!1,a=[],o=0;for(;o<e.length;o++)if(this.rules.other.blockquoteStart.test(e[o]))a.push(e[o]),t=!0;else if(!t)a.push(e[o]);else break;e=e.slice(o);let s=a.join(`
`),c=s.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,``);n=n?`${n}
${s}`:s,r=r?`${r}
${c}`:c;let l=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,i,!0),this.lexer.state.top=l,e.length===0)break;let u=i.at(-1);if(u?.type===`code`||u?.type===`heading`||u?.type===`hr`||u?.type===`html`)break;if(u?.type===`blockquote`){let t=u,a=e.join(`
`),o=t.raw+`
`+a.replace(this.rules.other.blockquoteSetextReplace2,``),s=this.blockquote(o);i[i.length-1]=s;let c=o.substring(s.raw.length).replace(/^\n/,``),l=c?c.split(`
`).length:0,d=l?e.slice(0,-l):e;d.length>0&&(n=`${n}
${d.join(`
`)}`),r=r.substring(0,r.length-t.text.length)+s.text;break}if(u?.type===`list`){let t=u,a=t.raw+`
`+e.join(`
`),o=this.list(a);i[i.length-1]=o,n=n.substring(0,n.length-u.raw.length)+o.raw,r=r.substring(0,r.length-t.raw.length)+o.raw,e=a.substring(i.at(-1).raw.length).split(`
`)}}return{type:`blockquote`,raw:n,tokens:i,text:r}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=e,r=()=>n.length-e.length,i=t[1].trim(),a=i.length>1,o={type:`list`,raw:``,ordered:a,start:a?+i.slice(0,-1):``,loose:!1,items:[]};i=a?`\\d{1,9}\\${i.slice(-1)}`:`\\${i}`,this.options.pedantic&&(i=a?i:`[*+-]`);let s=this.rules.other.listItemRegex(i),c=!1;for(;e;){let i=!1,a=``;if(!(t=s.exec(e))||this.rules.block.hr.test(e))break;let l=r();e=e.substring(t[0].length);let u=t[2].split(`
`,1)[0],d=t[1].length,f=this.options.pedantic?On(u,d):u.replace(this.rules.other.leadingSpaceTab,e=>On(e,d)),p=e.split(`
`,1)[0],m=!f.trim(),h=0;if(this.options.pedantic?(h=2,a=f.trimStart()):m?h=d+1:(h=f.search(this.rules.other.nonSpaceChar),h=h>4?1:h,a=f.slice(h),h+=d),m&&this.rules.other.blankLine.test(p)&&(e=e.substring(p.length+1),i=!0),!i){let t=this.rules.other.nextBulletRegex(h),n=this.rules.other.hrRegex(h),r=this.rules.other.fencesBeginRegex(h),i=this.rules.other.headingBeginRegex(h),o=this.rules.other.htmlBeginRegex(h),s=this.rules.other.blockquoteBeginRegex(h);for(;e;){let c=e.split(`
`,1)[0],l;if(p=c,this.options.pedantic?(p=p.replace(this.rules.other.listReplaceNesting,`  `),l=p):l=p.replace(this.rules.other.leadingSpaceTab,e=>On(e)),r.test(p)||i.test(p)||o.test(p)||s.test(p)||t.test(p)||n.test(p))break;if(l.search(this.rules.other.nonSpaceChar)>=h||!p.trim())a+=`
`+l.slice(h);else{if(m||f.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||r.test(f)||i.test(f)||n.test(f))break;a+=`
`+p}m=!p.trim(),e=e.substring(c.length+1),f=l.slice(h)}}let g=n.slice(l,r());o.loose||(c?o.loose=!0:this.rules.other.doubleBlankLine.test(g)&&(c=!0)),o.items.push({type:`list_item`,raw:g,task:!!this.options.gfm&&this.rules.other.listIsTask.test(a),loose:!1,text:a,tokens:[]})}let l=o.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;o.raw=n.slice(0,r()).trimEnd();for(let e of o.items)if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),!o.loose){let t=e.tokens.filter(e=>e.type===`space`);o.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}for(let e of o.items){let t=e.tokens[0];if(e.task&&(t?.type===`text`||t?.type===`paragraph`)){e.text=e.text.replace(this.rules.other.listReplaceTask,``),t.raw=t.raw.replace(this.rules.other.listReplaceTask,``),t.text=t.text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}let n=this.rules.other.listTaskCheckbox.exec(e.raw);if(n){let t={type:`checkbox`,raw:n[0]+` `,checked:n[0]!==`[ ]`};e.checked=t.checked,o.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=t.raw+e.tokens[0].raw,e.tokens[0].text=t.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(t)):e.tokens.unshift({type:`paragraph`,raw:t.raw,text:t.raw,tokens:[t]}):e.tokens.unshift(t)}}else e.task&&=!1}if(o.loose)for(let e of o.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return o}}html(e){let t=this.rules.block.html.exec(e);if(t){let e=Tn(t[0]);return{type:`html`,block:!0,raw:e,pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:e}}}def(e){let t=this.rules.block.def.exec(e);if(t){if(!this.rules.other.startAngleBracket.test(t[2])&&Dn(t[2],`()`)!==-1)return;let e=En(t[1]).replace(this.rules.other.multipleSpaceGlobal,` `),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:q(t[0],`
`),href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=wn(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:q(t[0],`
`),header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(wn(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:q(t[0],`
`),depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){if(this.lexer.state.linkParenPossible===!1)return;let t=this.rules.inline.link.exec(e);if(t){let n=t[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&jn(e,t[1],n,this.rules))return;let r=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let e=q(r.slice(0,-1),`\\`);if((r.length-e.length)%2==0)return}else{let e=Dn(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let i=t[2],a=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(i);e&&(i=e[1],a=e[3])}else a=t[3]?t[3].slice(1,-1):``;return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(i=this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?i.slice(1):i.slice(1,-1)),kn(t,{href:i&&i.replace(this.rules.inline.anyPunctuation,`$1`),title:a&&a.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=n[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&jn(e,n[1],r,this.rules))return;let i=t[En((n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal,` `))];if(!i){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return kn(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[3])||!n||this.rules.inline.punctuation.exec(n))){let i=[...r[0]].length-1,a,o,s=i,c=0,l=r[0][0],u=n===l,d=l===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(d.lastIndex=0,t=t.slice(-1*e.length+i);(r=d.exec(t))!==null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a)continue;if(o=[...a].length,r[3]||r[4]){s+=o;continue}if(r[5]||r[6]){if(i%3&&!((i+o)%3)){c+=o;continue}if(u)break}if(s-=o,s>0)continue;o=Math.min(o,o+s+c);let t=[...r[0]][0].length,n=e.slice(0,i+r.index+t+o);if(Math.min(i,o)%2){let e=n.slice(1,-1);return{type:`em`,raw:n,text:e,tokens:this.lexer.inlineTokens(e)}}let l=n.slice(2,-2);return{type:`strong`,raw:n,text:l,tokens:this.lexer.inlineTokens(l)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim;for(s.lastIndex=0,t=t.slice(-1*e.length+n);(r=s.exec(t))!==null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:e?t[0]:Sn(t[0]),escaped:e}}}},J=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||N,this.options.tokenizer=this.options.tokenizer||new Mn,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,linkParenPossible:!0,top:!0};let t={other:L,block:W.normal,inline:G.normal};this.options.pedantic?(t.block=W.pedantic,t.inline=G.pedantic):this.options.gfm&&(t.block=W.gfm,t.inline=this.options.breaks?G.breaks:G.gfm),this.tokenizer.rules=t}static get rules(){return{block:W,inline:G}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(L.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(L.tabCharGlobal,`    `).replace(L.spaceLine,``));let r=1/0;for(;e;){if(e.length<r)r=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let i;if(this.options.extensions?.block?.some(n=>(i=n.call({lexer:this},e,t))?(e=e.substring(i.raw.length),t.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let n=t.at(-1);i.raw.length===1&&n!==void 0?n.raw+=`
`:t.push(i);continue}if(i=this.tokenizer.code(e)){e=e.substring(i.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+i.raw,n.text+=`
`+i.text,this.inlineQueue.at(-1).src=n.text):t.push(i);continue}if((i=this.tokenizer.fences(e))||(i=this.tokenizer.heading(e))||(i=this.tokenizer.hr(e))||(i=this.tokenizer.blockquote(e))||(i=this.tokenizer.list(e))||(i=this.tokenizer.html(e))){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.def(e)){e=e.substring(i.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+i.raw,n.text+=`
`+i.raw,this.inlineQueue.at(-1).src=n.text):this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title},t.push(i));continue}if((i=this.tokenizer.table(e))||(i=this.tokenizer.lheading(e))){e=e.substring(i.raw.length),t.push(i);continue}let a=e;if(this.options.extensions?.startBlock){let t=1/0,n=e.slice(1),r;this.options.extensions.startBlock.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(a=e.substring(0,t+1))}if(this.state.top&&(i=this.tokenizer.paragraph(a))){let r=t.at(-1);n&&r?.type===`paragraph`?(r.raw+=(r.raw.endsWith(`
`)?``:`
`)+i.raw,r.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=r.text):t.push(i),n=a.length!==e.length,e=e.substring(i.raw.length)}else if(i=this.tokenizer.text(e)){e=e.substring(i.raw.length);let n=t.at(-1);n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+i.raw,n.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(i)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes(`[`))return!1;let t=this.tokenizer.rules.inline.link;for(let n of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(n[0])&&e.charAt(n.index-1)!==`!`)return!0;for(let t of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let e=t[0],n=e.lastIndexOf(`[`);if(e.charAt(0)!==`!`&&Object.hasOwn(this.tokens.links,En(e.slice(n+1,-1)))&&!(n>1&&this.linkInText(e.slice(1,n-1))))return!0}return!1}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=this.state.linkParenPossible;this.state.linkParenPossible=n&&e.includes(`)`);try{return this.#e(e,t)}finally{this.state.linkParenPossible=n}}#e(e,t){let n=e;if(this.tokens.links&&e.includes(`[`)){let e=this.tokenizer.rules.inline.reflinkSearch,t=n=>{let r=n.lastIndexOf(`[`);if(!Object.hasOwn(this.tokens.links,En(n.slice(r+1,-1))))return n;if(r>1&&n.charAt(0)!==`!`){let i=n.slice(1,r-1);if(this.linkInText(i))return`[`+i.replace(e,t)+`][`+`a`.repeat(n.length-r-2)+`]`}return`[`+`a`.repeat(n.length-2)+`]`};n=n.replace(e,t)}n=n.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode,(e,t,n)=>n?`+`.repeat(e.length):t?t+e.slice(t.length,-t.length).replace(/`/g,`+`)+t:e),n=n.replace(this.tokenizer.rules.inline.blockSkip,(e,t,n)=>{let r=n?n.length:0;return e.slice(0,r)+`[`+`a`.repeat(e.length-r-2)+`]`}),n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let r=!1,i=``,a=1/0;for(;e;){if(e.length<a)a=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}r||(i=``),r=!1;let o;if(this.options.extensions?.inline?.some(n=>(o=n.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if((o=this.tokenizer.escape(e))||(o=this.tokenizer.tag(e))||(o=this.tokenizer.link(e))){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let n=t.at(-1);o.type===`text`&&n?.type===`text`?(n.raw+=o.raw,n.text+=o.text):t.push(o);continue}if((o=this.tokenizer.emStrong(e,n,i))||(o=this.tokenizer.codespan(e))||(o=this.tokenizer.br(e))||(o=this.tokenizer.del(e,n,i))||(o=this.tokenizer.autolink(e))||!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),t.push(o);continue}let s=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(o=this.tokenizer.inlineText(s)){e=e.substring(o.raw.length),o.raw.slice(-1)!==`_`&&(i=o.raw.slice(-1)),r=!0;let n=t.at(-1);n?.type===`text`?(n.raw+=o.raw,n.text+=o.text):t.push(o)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return t}infiniteLoopError(e){let t=`Infinite loop on byte: `+e;if(this.options.silent)console.error(t);else throw Error(t)}},Nn=class{options;parser;constructor(e){this.options=e||N}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(L.notSpaceStart)?.[0],i=e?e.replace(L.endingNewline,``)+`
`:``;return r?`<pre><code class="language-`+K(r)+`">`+(n?i:K(i,!0))+`</code></pre>
`:`<pre><code>`+(n?i:K(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return``}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,r=``;for(let t=0;t<e.items.length;t++){let n=e.items[t];r+=this.listitem(n)}let i=t?`ol`:`ul`,a=t&&n!==1?` start="`+n+`"`:``;return`<`+i+a+`>
`+r+`</`+i+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return`<input `+(e?`checked="" `:``)+`disabled="" type="checkbox"> `}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t=``,n=``;for(let t=0;t<e.header.length;t++)n+=this.tablecell(e.header[t]);t+=this.tablerow({text:n});let r=``;for(let t=0;t<e.rows.length;t++){let i=e.rows[t];n=``;for(let e=0;e<i.length;e++)n+=this.tablecell(i[e]);r+=this.tablerow({text:n})}return r&&=`<tbody>${r}</tbody>`,`<table>
<thead>
`+t+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?`th`:`td`;return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${K(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,text:n,tokens:r,autolink:i}){let a=i?K(n,!0):this.parser.parseInline(r),o=Cn(e);if(o===null)return a;e=K(o,i);let s=`<a href="`+e+`"`;return t&&(s+=` title="`+K(t)+`"`),s+=`>`+a+`</a>`,s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=Cn(e);if(i===null)return K(n);e=i;let a=`<img src="${K(e)}" alt="${K(n)}"`;return t&&(a+=` title="${K(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:K(e.text)}},Pn=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return``+e}image({text:e}){return``+e}br(){return``}checkbox({raw:e}){return e}},Y=class e{options;renderer;textRenderer;constructor(e){this.options=e||N,this.options.renderer=this.options.renderer||new Nn,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Pn}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`checkbox`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n||``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`checkbox`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e||``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},X=class{options;block;constructor(e){this.options=e||N}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(e=this.block){return e?J.lex:J.lexInline}provideParser(e=this.block){return e?Y.parse:Y.parseInline}};function Z(e,t){if(Array.isArray(t))for(let n=0;n<t.length;n++)e.push(t[n]);else e.push(t)}var Q=new class{defaults=ct();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Y;Renderer=Nn;TextRenderer=Pn;Lexer=J;Tokenizer=Mn;Hooks=X;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(Z(n,t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)Z(n,this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)Z(n,this.walkTokens(e.tokens,t));break}case`list`:{let e=r;Z(n,this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);Z(n,this.walkTokens(i,t))}):e.tokens&&Z(n,this.walkTokens(e.tokens,t))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new Nn(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n||``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new Mn(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new X;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];t[r]=X.passThroughHooks.has(n)?e=>{if(this.defaults.async&&X.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:(...e)=>{if(this.defaults.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&Z(n,t.call(this,e)),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return J.lex(e,t??this.defaults)}parser(e,t){return Y.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer(e):e?J.lex:J.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser(e):e?Y.parse:Y.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer(e):e?J.lex:J.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser(e):e?Y.parse:Y.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+K(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function $(e,t){return Q.parse(e,t)}$.options=$.setOptions=function(e){return Q.setOptions(e),$.defaults=Q.defaults,lt($.defaults),$},$.getDefaults=ct,$.defaults=N;function Fn(...e){return Q.use(...e),$.defaults=Q.defaults,lt($.defaults),$}$.use=Fn,$.walkTokens=function(e,t){return Q.walkTokens(e,t)},$.parseInline=Q.parseInline,$.Parser=Y,$.parser=Y.parse,$.Renderer=Nn,$.TextRenderer=Pn,$.Lexer=J,$.lexer=J.lex,$.Tokenizer=Mn,$.Hooks=X,$.parse=$,$.options,$.setOptions,$.walkTokens,$.parseInline,Y.parse,J.lex;var In=[{id:`guides`,label:`Guides`,icon:`menu_book`},{id:`math`,label:`Quilt math`,icon:`calculate`},{id:`techniques`,label:`Techniques`,icon:`content_cut`},{id:`resources`,label:`Resources`,icon:`link`}];function Ln(e){let t=/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(e),n={};for(let e of(t?.[1]??``).split(/\r?\n/)){let t=e.indexOf(`:`);t>0&&(n[e.slice(0,t).trim()]=e.slice(t+1).trim())}return{meta:n,body:t?e.slice(t[0].length):e}}function Rn(e){let t=[],n=[],r=()=>{let e=n.join(`
`).trim();if(!e)return;let r=$.parse(e,{async:!1,gfm:!0});t.push({kind:`html`,html:r.replace(/<a href="(https?:[^"]*)"/g,`<a href="$1" target="_blank" rel="noopener noreferrer"`)}),n=[]};for(let i of e.split(/\r?\n/)){let e=/^::calc\s+(\S+)\s*$/.exec(i);e?(r(),t.push({kind:`calc`,name:e[1]})):n.push(i)}return r(),t}var zn=Object.entries(Object.assign({"./guides/block-colorings.md":Fe,"./guides/colors-and-palettes.md":Ie,"./guides/credits-and-licenses.md":Le,"./guides/designing-a-quilt.md":Re,"./guides/drawing-blocks.md":ze,"./guides/getting-started.md":Be,"./guides/libraries.md":Ve,"./guides/printing.md":He,"./guides/settings.md":Ue,"./guides/sketchbook.md":We,"./math/backing.md":Ge,"./math/binding.md":Ke,"./math/borders.md":qe,"./math/flying-geese.md":Je,"./math/half-square-triangles.md":Ye,"./math/on-point-settings.md":Xe,"./math/quarter-square-triangles.md":Ze,"./math/rounding.md":Qe,"./math/seam-allowance.md":$e,"./math/square-in-a-square.md":et,"./math/squares-and-rectangles.md":tt,"./math/yardage-and-fat-quarters.md":nt,"./resources/links.md":rt,"./techniques/continuous-binding.md":it,"./techniques/flying-geese-units.md":at,"./techniques/hst-units.md":ot,"./techniques/square-in-a-square-units.md":st})).map(([e,t])=>{let[,n,r]=/^\.\/([^/]+)\/([^/]+)\.md$/.exec(e),{meta:i,body:a}=Ln(t);return{section:n,id:r,title:i.title??r,order:Number(i.order??100),summary:i.summary??``,text:`${i.title??``} ${i.summary??``} ${a}`.toLowerCase(),segments:Rn(a)}}).sort((e,t)=>e.order-t.order||e.title.localeCompare(t.title)),Bn=e=>zn.filter(t=>t.section===e),Vn=(e,t)=>zn.find(n=>n.section===e&&n.id===t);function Hn(e,t){let n=t.toLowerCase().split(/\s+/).filter(Boolean);return e.filter(e=>n.every(t=>e.text.includes(t)))}var Un={class:`row no-wrap`,style:{gap:`24px`}},Wn={key:0,class:`topics column`,"aria-label":`Topics`},Gn={key:0,class:`text-caption text-grey-7`},Kn={key:0,class:`text-grey-7 q-pa-sm`},qn={class:`topic-title`},Jn=[`innerHTML`],Yn={key:2,class:`col text-grey-7 q-pt-sm`},Xn=T(b({__name:`HelpPage`,setup(e){let i=ie(),c=se(),y=le(),b=u(()=>c.params.section),x=u(()=>In.find(e=>e.id===b.value)?.label??``),S=u(()=>c.params.topic??``),C=u(()=>Bn(b.value)),w=u(()=>S.value?Vn(b.value,S.value):i.screen.gt.sm?C.value[0]:void 0),ae=u(()=>S.value&&!w.value?S.value:``),T=g(``);n(b,()=>T.value=``);let oe=u(()=>Hn(C.value,T.value??``));function pe(e){let t=e.target.closest(`a`),n=t?.getAttribute(`href`);n?.startsWith(`/`)&&!t?.target&&(e.preventDefault(),y.push(n))}return(e,n)=>{let c=a(`router-link`);return r(),h(fe,{padding:``,class:`help`},{default:s(()=>[n[3]||=_(`h1`,{class:`page-title q-mb-sm`},`Help`,-1),l(de,{"model-value":b.value,dense:``,"no-caps":``,align:`left`,class:`q-mb-md`,"onUpdate:modelValue":n[0]||=e=>d(y).push(`/help/${e}`)},{default:s(()=>[(r(!0),f(v,null,o(d(In),e=>(r(),h(ue,{key:e.id,name:e.id,icon:e.icon,label:e.label},null,8,[`name`,`icon`,`label`]))),128))]),_:1},8,[`model-value`]),_(`div`,Un,[!w.value||d(i).screen.gt.sm?(r(),f(`nav`,Wn,[l(re,{modelValue:T.value,"onUpdate:modelValue":n[1]||=e=>T.value=e,dense:``,outlined:``,clearable:``,placeholder:`Search ${x.value}`,class:`q-mb-sm`},{prepend:s(()=>[l(ne,{name:`search`})]),_:1},8,[`modelValue`,`placeholder`]),(r(!0),f(v,null,o(oe.value,e=>(r(),h(c,{key:e.id,to:`/help/${b.value}/${e.id}`,class:t([`topic-link`,{active:e.id===w.value?.id}])},{default:s(()=>[_(`div`,null,m(e.title),1),e.summary?(r(),f(`div`,Gn,m(e.summary),1)):p(``,!0)]),_:2},1032,[`to`,`class`]))),128)),oe.value.length?p(``,!0):(r(),f(`div`,Kn,`No topics match “`+m(T.value)+`”.`,1))])):p(``,!0),w.value?(r(),f(`article`,{key:1,class:`col content`,onClick:pe},[d(i).screen.gt.sm?p(``,!0):(r(),h(te,{key:0,flat:``,dense:``,"no-caps":``,icon:`arrow_back`,label:x.value,class:`q-mb-sm`,to:`/help/${b.value}`},null,8,[`label`,`to`])),_(`h2`,qn,m(w.value.title),1),(r(!0),f(v,null,o(w.value.segments,(e,t)=>(r(),f(v,{key:t},[e.kind===`html`?(r(),f(`div`,{key:0,class:`md`,innerHTML:e.html},null,8,Jn)):(r(),h(Pe,{key:1,name:e.name},null,8,[`name`]))],64))),128))])):d(i).screen.gt.sm?(r(),f(`div`,Yn,[ae.value?(r(),h(ce,{key:0,dense:``,class:`bg-warning text-dark q-mb-md`},{default:s(()=>[ee(` There's no topic “`+m(ae.value)+`” in `+m(x.value)+`. `,1)]),_:1})):p(``,!0),n[2]||=ee(` Pick a topic. `,-1)])):p(``,!0)])]),_:1})}}}),[[`__scopeId`,`data-v-b0779792`]]);export{Xn as default};