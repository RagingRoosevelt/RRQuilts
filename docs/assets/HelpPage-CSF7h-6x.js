import{t as e}from"./settings-cLrrNpzD.js";import{At as t,Dt as n,J as r,R as i,T as a,U as o,V as s,X as c,Z as l,at as u,b as d,f,ft as p,g as m,h,jt as g,m as _,ot as ee,p as v,s as y,t as b,x,y as S}from"./create-CXFiK9Ge.js";import{V as C,t as w,v as te}from"./QBtn-D67DqTct.js";import{St as ne,a as re,bt as ie,i as ae,n as T,t as oe,vt as se,w as ce,xt as E,yt as le}from"./QCard-JZetY5gw.js";import{a as ue,r as de}from"./render-CRP6lwgu.js";import{a as fe,r as pe,t as D}from"./QSelect-BJLpY-rB.js";import{B as me,F as he,P as O,V as ge,z as _e}from"./index-7x16P2ra.js";import{n as ve,t as ye}from"./QTabs-DMXl-3vM.js";import{t as be}from"./QPage-D5_MJ09N.js";import{t as xe}from"./LengthInput-DebYgJkD.js";import{S as Se,_ as Ce,a as k,b as we,i as Te,n as Ee,o as De,r as Oe,t as ke,x as Ae,y as je}from"./yardage-D5dwrINA.js";var Me=[`horizontal`,`vertical`,`cell`,`none`],Ne=b({name:`QMarkupTable`,props:{...E,dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,wrapCells:Boolean,separator:{type:String,default:`horizontal`,validator:e=>Me.includes(e)}},setup(e,{slots:t}){let n=ue(),r=ie(e,n),i=f(()=>`q-markup-table q-table__container q-table__card q-table--${e.separator}-separator`+(r()?` q-table--dark q-table__card--dark q-dark`:``)+(e.dense?` q-table--dense`:``)+(e.flat?` q-table--flat`:``)+(e.bordered?` q-table--bordered`:``)+(e.square?` q-table--square`:``)+(e.wrapCells?``:` q-table--no-wrap`));return()=>a(`div`,{class:i.value,tabindex:0},[a(`table`,{class:`q-table`},de(t.default))])}}),A=e=>Ce[e].filter(e=>!e.fatQuarter),Pe=(e,t,n)=>({units:e,seam:t.seam[e],step:t.rounding[e],slack:t.miterSlack[e],usable:(A(e).find(e=>e.id===n)??A(e)[0]).usable,fabricStep:t.fabricStep[e],overhang:t.overhang[e],bindingWidth:t.bindingWidth[e]}),Fe=e=>({poly:e,curved:!1,fill:`x`,marks:[]}),j=(e,t)=>Fe([[0,0],[e,0],[e,t],[0,t]]),Ie=e=>Fe([[0,0],[e,0],[0,e]]),Le=e=>Fe([[0,0],[e,0],[e/2,e/2]]),Re=(e,t)=>Fe([[0,0],[e,0],[e-t,t],[t,t]]),M=(e,t)=>Ae(e,t.units),N=(e,t)=>e.cut[0]===e.cut[1]?`${M(e.cut[0],t)} square`:`${M(e.cut[0],t)} × ${M(e.cut[1],t)}`,P=(e,t)=>({in:e,cm:t}),ze={square:{title:`Square`,inputs:[{key:`f`,label:`Finished size`,start:P(3,8)}],rows:({f:e},t)=>[{label:`Cut`,value:N(k(j(e,e),t.seam,t.step),t)}]},rect:{title:`Rectangle`,inputs:[{key:`w`,label:`Finished length`,start:P(6,15)},{key:`h`,label:`Finished width`,start:P(3,8)}],rows:({w:e,h:t},n)=>[{label:`Cut`,value:N(k(j(e,t),n.seam,n.step),n)}]},hst:{title:`Half-square triangles`,inputs:[{key:`f`,label:`Finished size (leg)`,start:P(3,8)}],rows:({f:e},t)=>{let n=k(Ie(e),t.seam,t.step),r=Se((e+(2+Math.SQRT2)*t.seam)*Math.SQRT2,t.step);return[{label:`Two at a time`,value:`${N(n,t)}, one per pair · cut once diagonally`},{label:`Four at a time`,value:`${M(r,t)} square, one per pair · sew all around, cut both diagonals`},{label:`Eight at a time`,value:`${M(2*n.cut[0],t)} square, one per pair · sew both diagonals, cut into 8`}]}},qst:{title:`Quarter-square triangles`,inputs:[{key:`f`,label:`Finished long side`,start:P(4,10)}],rows:({f:e},t)=>[{label:`Cut`,value:`${N(k(Le(e),t.seam,t.step),t)} · cut both diagonals: 4 triangles`}]},geese:{title:`Flying geese`,inputs:[{key:`w`,label:`Finished width`,start:P(4,10),link:{key:`h`,factor:.5}},{key:`h`,label:`Finished height`,start:P(2,5),link:{key:`w`,factor:2}}],rows:({w:e},t)=>{let n=e/2,r=k(Le(e),t.seam,t.step),i=k(Ie(n),t.seam,t.step);return[{label:`Stitch and flip (1)`,value:`${N(k(j(e,n),t.seam,t.step),t)} rectangle + 2 × ${N(k(j(n,n),t.seam,t.step),t)}`},{label:`Four at a time (4)`,value:`1 × ${N(r,t)} + 4 × ${N(i,t)}`},{label:`Pieced (1)`,value:`goose: ¼ of a ${N(r,t)}; sky: 2 halves of a ${N(i,t)}`}]}},sqinsq:{title:`Square in a square`,inputs:[{key:`f`,label:`Finished unit`,start:P(4,10)}],rows:({f:e},t)=>{let n=e/Math.SQRT2;return[{label:`Center`,value:N(k(j(n,n),t.seam,t.step),t)},{label:`Corners`,value:`2 × ${N(k(Ie(e/2),t.seam,t.step),t)}, cut once diagonally`}]}},onpoint:{title:`On-point setting`,inputs:[{key:`f`,label:`Finished block`,start:P(10,25)}],rows:({f:e},t)=>[{label:`Block diagonal`,value:M(e*Math.SQRT2,t)},{label:`Side setting triangles`,value:`${N(k(Le(e*Math.SQRT2),t.seam,t.step),t)}, cut both diagonals (4)`},{label:`Corner setting triangles`,value:`${N(k(Ie(e/Math.SQRT2),t.seam,t.step),t)}, cut once (2)`}]},border:{title:`Borders`,inputs:[{key:`w`,label:`Quilt width (before the border)`,start:P(48,120)},{key:`h`,label:`Quilt height (before the border)`,start:P(60,150)},{key:`b`,label:`Border width`,start:P(4,10)}],rows:({w:e,h:t,b:n},r)=>[{label:`Straight: sides`,value:`2 × ${N(k(j(t,n),r.seam,r.step),r)}`},{label:`Straight: top and bottom`,value:`2 × ${N(k(j(e+2*n,n),r.seam,r.step),r)}`},{label:`Mitered: sides`,value:`2 × ${N(k(Re(t+2*n,n),r.seam,r.step,r.slack),r)}`},{label:`Mitered: top and bottom`,value:`2 × ${N(k(Re(e+2*n,n),r.seam,r.step,r.slack),r)}`}]},binding:{title:`Binding`,widths:!0,inputs:[{key:`w`,label:`Quilt width`,start:P(48,120)},{key:`h`,label:`Quilt height`,start:P(48,120)}],rows:({w:e,h:t},n)=>{let r=Oe(e,t,n.bindingWidth,ke[n.units],n.usable,n.fabricStep);return[{label:`Strips`,value:`${r.strips} × ${M(n.bindingWidth,n)} wide`},{label:`Total length`,value:M(2*(e+t)+ke[n.units],n)},{label:`Fabric`,value:we(r.length,n.units)}]}},backing:{title:`Backing`,widths:!0,inputs:[{key:`w`,label:`Quilt width`,start:P(60,150)},{key:`h`,label:`Quilt height`,start:P(72,180)}],rows:({w:e,h:t},n)=>[{label:`Fabric`,value:we(Ee(e,t,n.overhang,n.usable,n.fabricStep),n.units)},{label:`Overhang`,value:`${M(n.overhang,n)} each side`}]},yardage:{title:`Yardage for squares`,widths:!0,inputs:[{key:`n`,label:`How many`,start:P(40,40),count:!0},{key:`f`,label:`Finished size`,start:P(3,8)}],rows:({n:e,f:t},n)=>{let r=Array.from({length:Math.max(1,Math.round(e))},()=>j(t,t)),i=De(r,n.seam,n.step,n.usable),a=Te(i,{usable:n.usable},n.fabricStep)[0],o=Ce[n.units].find(e=>e.fatQuarter),s=De(r,n.seam,n.step,o.usable),c=Te(s,o,n.fabricStep)[0];return[{label:`Strips`,value:`${i[0].strips} × ${M(i[0].stripWidth,n)} (${i[0].perStrip} per strip)`},{label:`Fabric (${M(n.usable,n)} usable)`,value:we(a.length,n.units)},{label:`Or fat quarters`,value:String(c.fatQuarters)}]}},rounding:{title:`Rounding to the ruler`,inputs:[{key:`x`,label:`Exact length`,start:P(3.854,9.31),raw:!0}],rows:({x:e},t)=>[{label:`Exact`,value:M(e,t)},{label:`Cut (rounded up)`,value:M(Se(e,t.step),t)}]}},Be={class:`text-subtitle2`},Ve={class:`text-caption text-grey-7`},He={class:`text-grey-8`},Ue={class:`text-weight-medium`},We=O(x({__name:`HelpCalc`,props:{name:{}},setup(t){let n=t,a=he(),o=e(),l=f(()=>ze[n.name]),b=f(()=>a.doc?.units??o.settings.units),x=ee(A(b.value)[0].id);r(b,e=>x.value=A(e)[0].id);let C=f(()=>Pe(b.value,je(o.settings.print),x.value)),w=u(Object.fromEntries((l.value?.inputs??[]).map(e=>[e.key,e.start[b.value]])));function ne(e,t){w[e.key]=t,e.link&&(w[e.link.key]=t*e.link.factor)}let ie=f(()=>{let e=l.value;return!e||e.inputs.some(e=>!(w[e.key]>0))?[]:e.rows(w,C.value)});return(e,n)=>l.value?(i(),_(oe,{key:0,flat:``,bordered:``,class:`help-calc q-my-md`},{default:c(()=>[d(T,{class:`q-pb-sm`},{default:c(()=>[v(`div`,Be,[d(te,{name:`calculate`,class:`q-mr-xs`}),S(g(l.value.title)+` calculator `,1)]),v(`div`,Ve,` Seam allowance `+g(p(Ae)(C.value.seam,b.value))+` · cut sizes rounded up to `+g(C.value.step?p(Ae)(C.value.step,b.value):`exact sizes`)+` (change in Print settings) `,1)]),_:1}),d(T,{class:`row q-pt-none`,style:{gap:`12px`}},{default:c(()=>[l.value.widths?(i(),_(D,{key:0,modelValue:x.value,"onUpdate:modelValue":n[0]||=e=>x.value=e,options:p(A)(b.value).map(e=>({label:e.label,value:e.id})),"emit-value":``,"map-options":``,outlined:``,dense:``,label:`Fabric width`,style:{width:`200px`}},null,8,[`modelValue`,`options`])):h(``,!0),(i(!0),m(y,null,s(l.value.inputs,e=>(i(),m(y,{key:e.key},[e.count||e.raw?(i(),_(re,{key:0,modelValue:w[e.key],"onUpdate:modelValue":t=>w[e.key]=t,modelModifiers:{number:!0},type:`number`,step:e.count?1:`any`,min:+!!e.count,outlined:``,dense:``,label:e.label,style:{width:`140px`}},null,8,[`modelValue`,`onUpdate:modelValue`,`step`,`min`,`label`])):(i(),_(xe,{key:1,"model-value":w[e.key],"onUpdate:modelValue":t=>ne(e,t),units:b.value,min:.25,label:e.label,style:{width:`200px`}},null,8,[`model-value`,`onUpdate:modelValue`,`units`,`label`]))],64))),128))]),_:1}),d(Ne,{flat:``,dense:``,separator:`horizontal`,class:`q-mx-md q-mb-md`},{default:c(()=>[v(`tbody`,null,[(i(!0),m(y,null,s(ie.value,e=>(i(),m(`tr`,{key:e.label},[v(`td`,He,g(e.label),1),v(`td`,Ue,g(e.value),1)]))),128))])]),_:1})]),_:1})):(i(),_(ge,{key:1,dense:``,class:`bg-warning text-dark q-my-md`},{default:c(()=>[S(`Unknown calculator “`+g(t.name)+`”.`,1)]),_:1}))}}),[[`__scopeId`,`data-v-f18784c3`]]),Ge=`---
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
`,Ke=`---
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
`,qe=`---
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
`,Je=`---
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
`,Ye=`---
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
`,Xe=`---
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
- **Recent projects** lists your latest ones. Click one to open it. This needs a browser that can reopen
  files, such as Chrome, Edge, or another Chromium-based browser on a computer ({{yours:file-access}}).

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
`,Ze=`---
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
`,Qe=`---
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
`,$e=`---
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
`,et=`---
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
`,tt=`---
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

<svg viewBox="0 0 230 90" width="345" role="img" aria-label="A quilt top of two Mexican Cross II blocks centered on a larger gold backing, with overhang on every side">
  <defs><pattern id="mx-backing" patternUnits="userSpaceOnUse" x="25" y="25" width="40" height="40"><polygon points="11.51,20.0 14.34,22.83 17.17,20.0 14.34,17.17" fill="#c4282c"/><polygon points="14.34,17.17 17.17,20.0 20.0,17.17 17.17,14.34" fill="#5a78a0"/><polygon points="17.17,14.34 20.0,17.17 22.83,14.34 20.0,11.51" fill="#c4282c"/><polygon points="14.34,22.83 17.17,25.66 20.0,22.83 17.17,20.0" fill="#5a78a0"/><polygon points="17.17,20.0 20.0,22.83 22.83,20.0 20.0,17.17" fill="#c4282c"/><polygon points="20.0,17.17 22.83,20.0 25.66,17.17 22.83,14.34" fill="#5a78a0"/><polygon points="17.17,25.66 20.0,28.49 22.83,25.66 20.0,22.83" fill="#c4282c"/><polygon points="20.0,22.83 22.83,25.66 25.66,22.83 22.83,20.0" fill="#5a78a0"/><polygon points="22.83,20.0 25.66,22.83 28.49,20.0 25.66,17.17" fill="#c4282c"/><polygon points="25.66,22.83 40.0,37.17 40.0,40.0 37.17,40.0 22.83,25.66" fill="#f4ecd8"/><polygon points="17.17,25.66 2.83,40.0 0.0,40.0 0.0,37.17 14.34,22.83" fill="#f4ecd8"/><polygon points="14.34,17.17 0.0,2.83 0.0,0.0 2.83,0.0 17.17,14.34" fill="#f4ecd8"/><polygon points="22.83,14.34 37.17,0.0 40.0,0.0 40.0,2.83 25.66,17.17" fill="#f4ecd8"/><polygon points="31.51,40.0 20.0,28.49 22.83,25.66 31.51,34.34" fill="#5a78a0"/><polygon points="0.0,31.51 11.51,20.0 14.34,22.83 5.66,31.51" fill="#5a78a0"/><polygon points="8.49,0.0 20.0,11.51 17.17,14.34 8.49,5.66" fill="#5a78a0"/><polygon points="40.0,8.49 28.49,20.0 25.66,17.17 34.34,8.49" fill="#5a78a0"/><polygon points="28.49,20.0 40.0,31.51 34.34,31.51 25.66,22.83" fill="#5a78a0"/><polygon points="20.0,28.49 8.49,40.0 8.49,34.34 17.17,25.66" fill="#5a78a0"/><polygon points="11.51,20.0 0.0,8.49 5.66,8.49 14.34,17.17" fill="#5a78a0"/><polygon points="20.0,11.51 31.51,0.0 31.51,5.66 22.83,14.34" fill="#5a78a0"/><polygon points="37.17,40.0 31.51,40.0 31.51,34.34" fill="#c4282c"/><polygon points="0.0,37.17 0.0,31.51 5.66,31.51" fill="#c4282c"/><polygon points="2.83,0.0 8.49,0.0 8.49,5.66" fill="#c4282c"/><polygon points="40.0,2.83 40.0,8.49 34.34,8.49" fill="#c4282c"/><polygon points="40.0,31.51 40.0,37.17 34.34,31.51" fill="#c4282c"/><polygon points="8.49,40.0 2.83,40.0 8.49,34.34" fill="#c4282c"/><polygon points="0.0,8.49 0.0,2.83 5.66,8.49" fill="#c4282c"/><polygon points="31.51,0.0 37.17,0.0 31.51,5.66" fill="#c4282c"/><polygon points="31.51,40.0 8.49,40.0 20.0,28.49" fill="#96c4e8"/><polygon points="0.0,31.51 0.0,8.49 11.51,20.0" fill="#96c4e8"/><polygon points="8.49,0.0 31.51,0.0 20.0,11.51" fill="#96c4e8"/><polygon points="40.0,8.49 40.0,31.51 28.49,20.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="110" height="70" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="80" height="40" fill="url(#mx-backing)" stroke="currentColor" stroke-width="1.5"/>
  <defs><pattern id="mx-backing-key" patternUnits="userSpaceOnUse" x="132" y="27" width="12" height="12"><polygon points="3.45,6.0 4.3,6.85 5.15,6.0 4.3,5.15" fill="#c4282c"/><polygon points="4.3,5.15 5.15,6.0 6.0,5.15 5.15,4.3" fill="#5a78a0"/><polygon points="5.15,4.3 6.0,5.15 6.85,4.3 6.0,3.45" fill="#c4282c"/><polygon points="4.3,6.85 5.15,7.7 6.0,6.85 5.15,6.0" fill="#5a78a0"/><polygon points="5.15,6.0 6.0,6.85 6.85,6.0 6.0,5.15" fill="#c4282c"/><polygon points="6.0,5.15 6.85,6.0 7.7,5.15 6.85,4.3" fill="#5a78a0"/><polygon points="5.15,7.7 6.0,8.55 6.85,7.7 6.0,6.85" fill="#c4282c"/><polygon points="6.0,6.85 6.85,7.7 7.7,6.85 6.85,6.0" fill="#5a78a0"/><polygon points="6.85,6.0 7.7,6.85 8.55,6.0 7.7,5.15" fill="#c4282c"/><polygon points="7.7,6.85 12.0,11.15 12.0,12.0 11.15,12.0 6.85,7.7" fill="#f4ecd8"/><polygon points="5.15,7.7 0.85,12.0 0.0,12.0 0.0,11.15 4.3,6.85" fill="#f4ecd8"/><polygon points="4.3,5.15 0.0,0.85 0.0,0.0 0.85,0.0 5.15,4.3" fill="#f4ecd8"/><polygon points="6.85,4.3 11.15,0.0 12.0,0.0 12.0,0.85 7.7,5.15" fill="#f4ecd8"/><polygon points="9.45,12.0 6.0,8.55 6.85,7.7 9.45,10.3" fill="#5a78a0"/><polygon points="0.0,9.45 3.45,6.0 4.3,6.85 1.7,9.45" fill="#5a78a0"/><polygon points="2.55,0.0 6.0,3.45 5.15,4.3 2.55,1.7" fill="#5a78a0"/><polygon points="12.0,2.55 8.55,6.0 7.7,5.15 10.3,2.55" fill="#5a78a0"/><polygon points="8.55,6.0 12.0,9.45 10.3,9.45 7.7,6.85" fill="#5a78a0"/><polygon points="6.0,8.55 2.55,12.0 2.55,10.3 5.15,7.7" fill="#5a78a0"/><polygon points="3.45,6.0 0.0,2.55 1.7,2.55 4.3,5.15" fill="#5a78a0"/><polygon points="6.0,3.45 9.45,0.0 9.45,1.7 6.85,4.3" fill="#5a78a0"/><polygon points="11.15,12.0 9.45,12.0 9.45,10.3" fill="#c4282c"/><polygon points="0.0,11.15 0.0,9.45 1.7,9.45" fill="#c4282c"/><polygon points="0.85,0.0 2.55,0.0 2.55,1.7" fill="#c4282c"/><polygon points="12.0,0.85 12.0,2.55 10.3,2.55" fill="#c4282c"/><polygon points="12.0,9.45 12.0,11.15 10.3,9.45" fill="#c4282c"/><polygon points="2.55,12.0 0.85,12.0 2.55,10.3" fill="#c4282c"/><polygon points="0.0,2.55 0.0,0.85 1.7,2.55" fill="#c4282c"/><polygon points="9.45,0.0 11.15,0.0 9.45,1.7" fill="#c4282c"/><polygon points="9.45,12.0 2.55,12.0 6.0,8.55" fill="#96c4e8"/><polygon points="0.0,9.45 0.0,2.55 3.45,6.0" fill="#96c4e8"/><polygon points="2.55,0.0 9.45,0.0 6.0,3.45" fill="#96c4e8"/><polygon points="12.0,2.55 12.0,9.45 8.55,6.0" fill="#96c4e8"/></pattern></defs>
  <rect x="132" y="27" width="12" height="12" fill="url(#mx-backing-key)" stroke="currentColor"/>
  <text x="150" y="37" font-size="11" fill="currentColor">quilt top</text>
  <rect x="132" y="47" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="150" y="57" font-size="11" fill="currentColor">backing</text>
</svg>

## Worked examples

| Quilt        | Backing      | Panels (40″ / 105 cm usable)              | Fabric        |
| ------------ | ------------ | ----------------------------------------- | ------------- |
| 60″ × 72″    | 68″ × 80″    | 2 side to side, 2 × 68 = 136″ (vs 160″)   | 139½″ = 3⅞ yd |
| 150 × 180 cm | 170 × 200 cm | 2 side to side, 2 × 170 = 340 cm (vs 400) | 340 cm        |

::calc backing
`,nt=`---
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
between strips, and an overlap where the ends meet. The strip width is the **Binding strip width** setting
(default 2½″ / 6 cm). Pick the fabric width in the calculator. The printed yardage page shows
every width side by side.

<svg viewBox="0 0 260 80" width="390" role="img" aria-label="A quilt top of two Mexican Cross II blocks with the binding running around the edge">
  <defs><pattern id="mx-binding" patternUnits="userSpaceOnUse" x="10" y="10" width="60" height="60"><polygon points="17.27,30.0 21.51,34.24 25.76,30.0 21.51,25.76" fill="#c4282c"/><polygon points="21.51,25.76 25.76,30.0 30.0,25.76 25.76,21.51" fill="#5a78a0"/><polygon points="25.76,21.51 30.0,25.76 34.24,21.51 30.0,17.27" fill="#c4282c"/><polygon points="21.51,34.24 25.76,38.49 30.0,34.24 25.76,30.0" fill="#5a78a0"/><polygon points="25.76,30.0 30.0,34.24 34.24,30.0 30.0,25.76" fill="#c4282c"/><polygon points="30.0,25.76 34.24,30.0 38.49,25.76 34.24,21.51" fill="#5a78a0"/><polygon points="25.76,38.49 30.0,42.73 34.24,38.49 30.0,34.24" fill="#c4282c"/><polygon points="30.0,34.24 34.24,38.49 38.49,34.24 34.24,30.0" fill="#5a78a0"/><polygon points="34.24,30.0 38.49,34.24 42.73,30.0 38.49,25.76" fill="#c4282c"/><polygon points="38.49,34.24 60.0,55.76 60.0,60.0 55.76,60.0 34.24,38.49" fill="#f4ecd8"/><polygon points="25.76,38.49 4.24,60.0 0.0,60.0 0.0,55.76 21.51,34.24" fill="#f4ecd8"/><polygon points="21.51,25.76 0.0,4.24 0.0,0.0 4.24,0.0 25.76,21.51" fill="#f4ecd8"/><polygon points="34.24,21.51 55.76,0.0 60.0,0.0 60.0,4.24 38.49,25.76" fill="#f4ecd8"/><polygon points="47.27,60.0 30.0,42.73 34.24,38.49 47.27,51.51" fill="#5a78a0"/><polygon points="0.0,47.27 17.27,30.0 21.51,34.24 8.49,47.27" fill="#5a78a0"/><polygon points="12.73,0.0 30.0,17.27 25.76,21.51 12.73,8.49" fill="#5a78a0"/><polygon points="60.0,12.73 42.73,30.0 38.49,25.76 51.51,12.73" fill="#5a78a0"/><polygon points="42.73,30.0 60.0,47.27 51.51,47.27 38.49,34.24" fill="#5a78a0"/><polygon points="30.0,42.73 12.73,60.0 12.73,51.51 25.76,38.49" fill="#5a78a0"/><polygon points="17.27,30.0 0.0,12.73 8.49,12.73 21.51,25.76" fill="#5a78a0"/><polygon points="30.0,17.27 47.27,0.0 47.27,8.49 34.24,21.51" fill="#5a78a0"/><polygon points="55.76,60.0 47.27,60.0 47.27,51.51" fill="#c4282c"/><polygon points="0.0,55.76 0.0,47.27 8.49,47.27" fill="#c4282c"/><polygon points="4.24,0.0 12.73,0.0 12.73,8.49" fill="#c4282c"/><polygon points="60.0,4.24 60.0,12.73 51.51,12.73" fill="#c4282c"/><polygon points="60.0,47.27 60.0,55.76 51.51,47.27" fill="#c4282c"/><polygon points="12.73,60.0 4.24,60.0 12.73,51.51" fill="#c4282c"/><polygon points="0.0,12.73 0.0,4.24 8.49,12.73" fill="#c4282c"/><polygon points="47.27,0.0 55.76,0.0 47.27,8.49" fill="#c4282c"/><polygon points="47.27,60.0 12.73,60.0 30.0,42.73" fill="#96c4e8"/><polygon points="0.0,47.27 0.0,12.73 17.27,30.0" fill="#96c4e8"/><polygon points="12.73,0.0 47.27,0.0 30.0,17.27" fill="#96c4e8"/><polygon points="60.0,12.73 60.0,47.27 42.73,30.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="120" height="60" fill="url(#mx-binding)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="15" y="15" width="110" height="50" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="142" y="36" font-size="11" fill="currentColor">length = perimeter</text>
  <text x="142" y="53" font-size="11" fill="currentColor">+ 10″ (25 cm)</text>
</svg>

## Worked examples

| Quilt        | Total length          | Strips (40″ / 105 cm usable) | Fabric                  |
| ------------ | --------------------- | ---------------------------- | ----------------------- |
| 48″ × 48″    | 2 × 96 + 10 = 202″    | 6 × 2½″                      | 15″, rounded up to ½ yd |
| 120 × 120 cm | 2 × 240 + 25 = 505 cm | 5 × 6 cm                     | 30 cm                   |

For sewing instructions, see [Continuous binding](/help/techniques/continuous-binding).

::calc binding
`,rt=`---
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

Each is then cut with a seam allowance added on every edge, so finished + 2 × SA, like any
[rectangle](/help/math/squares-and-rectangles). SA is the [seam allowance](/help/math/seam-allowance).

## Mitered borders

The corners join at 45°. Each strip's finished **long edge** (the outer edge) reaches the quilt's
outer corner:

> **long edge = quilt side + 2 × border width**

The cut length then adds **SA × (1 + √2) at each end**, a total of **2(1 + √2) × SA**:

- **SA × √2** for the seam allowance on the 45° seam. The seam allowance is measured at right angles
  to the diagonal, but the strip's edge meets it at 45°, so it stretches by 1 ÷ sin 45° = √2.
- **s** for the seam allowance on the border's outer edge, which pushes the strip's edge out, and so the
  diagonal's end point along the edge, by one more SA.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="A mitered border strip shaped like a trapezoid with 45 degree ends, its seam allowance beyond the finished corner">
  <polygon points="10,10 150,10 130,40 30,40" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="20,10 140,10 124,34 36,34" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="160" y="25" font-size="11" fill="currentColor">finished (dashed)</text>
  <text x="160" y="42" font-size="11" fill="currentColor">cut, longer (solid)</text>
</svg>

The **Extra length on mitered strips** setting (default 2″ / 5 cm) adds more, so you can trim after
sewing the miter. Set it to 0 to cut exact.

## Worked examples (quilt 48″ × 60″, 4″ border, 120 × 150 cm, 10 cm border)

| Strip               | Inches (SA = ¼″, extra 2″)                | Centimeters (SA = 7.5 mm, extra 5 cm)       |
| ------------------- | ----------------------------------------- | ------------------------------------------- |
| Straight sides      | 2 × 60½″ × 4½″                            | 2 × 151.5 × 11.5 cm                         |
| Straight top/bottom | 2 × 56½″ × 4½″                            | 2 × 141.5 × 11.5 cm                         |
| Mitered sides       | 2 × 71¼″ × 4½″ (68 + 1.207 + 2 = 71.207″) | 2 × 179 × 11.5 cm (170 + 3.62 + 5 = 178.62) |
| Mitered top/bottom  | 2 × 59¼″ × 4½″ (56 + 1.207 + 2 = 59.207″) | 2 × 149 × 11.5 cm (140 + 3.62 + 5 = 148.62) |

::calc border
`,it=`---
title: Flying geese
order: 50
summary: A tall triangle with a smaller triangle on each side, built three ways.
---

A flying-geese unit is a rectangle twice as wide as it is tall, with one large triangle (the goose) and a
smaller triangle (the sky) at each side. There are three common ways to make one, each with its own cut sizes.

## Stitch and flip (1 unit)

Cut one **rectangle** (finished width × height) and **two squares** (finished height). Place a square
on each end of the rectangle, sew diagonally, and flip. The cut sizes are the usual
[rectangle and square](/help/math/squares-and-rectangles) sizes, finished + 2 × SA (SA is the
[seam allowance](/help/math/seam-allowance)).

## Four at a time (4 units)

Cut one large square for the geese and four small squares for the sky. The large square is the
[quarter-square](/help/math/quarter-square-triangles) size for the finished width. The small ones
are the [half-square](/help/math/half-square-triangles) size for the finished height. See
[Flying-geese units](/help/techniques/flying-geese-units) for the steps.

## Pieced (1 unit)

Cut the goose from a quarter of the large square, and each sky from half of a small one. The cut sizes
are the same as for four at a time, but nothing is sewn before cutting.

<svg viewBox="0 0 330 100" width="495" role="img" aria-label="A flying-geese unit: the goose triangle pointing up, a sky triangle in each top corner">
  <rect x="10" y="10" width="160" height="80" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="10,10 90,10 10,90" fill="#daa828" stroke="currentColor"/>
  <polygon points="170,10 90,10 170,90" fill="#daa828" stroke="currentColor"/>
  <rect x="190" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="208" y="40" font-size="11" fill="currentColor">goose (large square)</text>
  <rect x="190" y="46" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="208" y="56" font-size="11" fill="currentColor">sky (small squares)</text>
</svg>

## Worked examples

A 4″ × 2″ finished unit made by stitch and flip needs a 4½″ × 2½″ rectangle and two 2½″ squares. Four at
a time uses one 5¼″ square for the geese and four 2⅞″ squares for the sky. For 10 × 5 cm, stitch and flip
needs an 11.5 × 6.5 cm rectangle with two 6.5 cm squares, and four at a time needs one 14 cm square and four 8 cm squares.

::calc geese
`,at=`---
title: Half-square triangles
order: 30
summary: Cut a square once diagonally for two triangles with their legs on the straight grain.
---

A half-square triangle (HST) is half of a square cut corner to corner. Its two short sides (the
legs) run along the straight grain, so the unit's outside edges don't stretch. Two HSTs sewn along
the long side make an HST unit.

## The formula

Cut a square of

> **cut = finished leg + (2 + √2) × SA**

SA is the [seam allowance](/help/math/seam-allowance).

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
`,ot=`---
title: On-point settings
order: 70
summary: Setting triangles for blocks turned 45°.
---

Blocks set "on point" are turned 45° so they sit like diamonds. The straight edges of the quilt are
then filled with triangles.

## The formulas

For a finished block of side f, the block's diagonal (corner to corner) is **f × √2**. SA is the
[seam allowance](/help/math/seam-allowance).

- **Side setting triangles** have their long side along the quilt's edge, so they are
  [quarter-square triangles](/help/math/quarter-square-triangles) with a long side of f × √2. Cut a
  square of f × √2 + 2(1 + √2) × SA and cut both diagonals. Keeping the long side on the straight grain
  stops the quilt's edge from stretching.
- **Corner setting triangles** are [half-square triangles](/help/math/half-square-triangles) whose
  legs are f ÷ √2. Cut a square of f ÷ √2 + (2 + √2) × SA once diagonally. You need 2 squares (4
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
`,st=`---
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

> **cut = f + 2 × (1 + √2) × SA**

SA is the [seam allowance](/help/math/seam-allowance).

then cut both diagonals to make **4 triangles**. With a ¼″ seam allowance, 2(1 + √2) × ¼″ ≈ 1.207″,
and with 7.5 mm it is ≈ 3.62 cm.

This is more than a half-square triangle needs. The long side is the diagonal of the cut square, but the
triangle needs a seam allowance along that side _and_ a seam allowance on the two short sides, which
sit at 45° to the long side. Each short seam moves the points out by (1 + √2) × SA along the long side.

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
`,ct=`---
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
`,lt=`---
title: Seam allowance
order: 10
summary: The strip of fabric inside every seam, and why every cut size adds it.
---

The seam allowance (SA) is the strip of fabric between the cut edge and the stitching line. Quilt
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

- A square or rectangle adds **2 × SA** to each dimension (one seam on each side). See
  [Squares and rectangles](/help/math/squares-and-rectangles).
- Triangles add more than 2 × SA, because their points and angled seams need extra. See
  [Half-square triangles](/help/math/half-square-triangles) and
  [Quarter-square triangles](/help/math/quarter-square-triangles).
- The final size is rounded up to a mark on the ruler. See [Rounding](/help/math/rounding).
`,ut=`---
title: Square in a square
order: 60
summary: A square set on point inside four corner triangles.
---

A square-in-a-square unit is a center square turned 45° with a triangle on each side. Its corners
touch the middle of the unit's sides.

## The formulas

For a finished unit of side f:

> **center square (finished) = f ÷ √2**
> **center cut = f ÷ √2 + 2 × SA**

SA is the [seam allowance](/help/math/seam-allowance).

> **corner triangles = two squares of the half-square size for f ÷ 2, each cut once diagonally**

The center's diagonal is the unit's side, so its side is f ÷ √2 (about 0.707 × f). The corners are
half-square triangles whose legs are f ÷ 2, so the cut is f ÷ 2 + (2 + √2) × SA, and each square is
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
`,dt=`---
title: Squares and rectangles
order: 20
summary: Cut size is the finished size plus a seam allowance on each side.
---

Squares and rectangles are the simplest pieces. Each edge gets a seam allowance, so each dimension
grows by two of them.

## The formula

> **cut = finished size + 2 × SA**

SA is the [seam allowance](/help/math/seam-allowance).

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
`,ft=`---
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
`,pt=`---
title: Calculators
order: 10
summary: Every Quilt Math calculator on one page, for cut sizes, borders, binding, backing, and yardage.
---

Each calculator uses your seam allowance and rounding from the Print settings, and works offline.
The linked Quilt Math topic explains the formula behind it.

## Squares and rectangles

::diagram math/squares-and-rectangles

The formula is in [squares and rectangles](/help/math/squares-and-rectangles).

::calc square

::calc rect

## Half-square triangles

::diagram math/half-square-triangles

The formula is in [half-square triangles](/help/math/half-square-triangles). It's used in [half-square triangle units](/help/techniques/hst-units).

::calc hst

## Quarter-square triangles

::diagram math/quarter-square-triangles

The formula is in [quarter-square triangles](/help/math/quarter-square-triangles).

::calc qst

## Flying geese

::diagram math/flying-geese

The formula is in [flying geese](/help/math/flying-geese). It's used in [flying geese units](/help/techniques/flying-geese-units).

::calc geese

## Square in a square

::diagram math/square-in-a-square

The formula is in [square in a square](/help/math/square-in-a-square). It's used in [square in a square units](/help/techniques/square-in-a-square-units).

::calc sqinsq

## On-point settings

::diagram math/on-point-settings

The formula is in [on-point settings](/help/math/on-point-settings).

::calc onpoint

## Borders

::diagram math/borders

The formula is in [borders](/help/math/borders).

::calc border

## Binding

::diagram math/binding

The formula is in [binding](/help/math/binding). It's used in [continuous binding](/help/techniques/continuous-binding).

::calc binding

## Backing

::diagram math/backing

The formula is in [backing](/help/math/backing).

::calc backing

## Yardage and fat quarters

::diagram math/yardage-and-fat-quarters

The formula is in [yardage and fat quarters](/help/math/yardage-and-fat-quarters).

::calc yardage

## Rounding

The formula is in [rounding](/help/math/rounding).

::calc rounding
`,mt=`---
title: Block and quilt directories
order: 10
summary: Reference books of quilt blocks, patterns, and techniques.
---

- _1000 Great Quilt Blocks_ by Maggi McCormick Gordon ([Google Books](https://books.google.com/books/about/1000_Great_Quilt_Blocks/AaDUPAAACAAJ), [Internet Archive](https://archive.org/details/1000greatquiltbl0000gord/))
- _Creative Log Cabin Quilting_, edited by Jeanne Stauffer and Sandra L. Hatch ([Google Books](https://books.google.com/books/about/Creative_Log_Cabin_Quilting/pv1YJDz-QnYC), [Internet Archive](https://archive.org/details/creativelogcabin0000unse/))
- _Make a Quilt in a Day: Log Cabin Pattern_ by Eleanor Burns ([Google Books](https://books.google.com/books/about/Make_a_Quilt_in_a_Day/TIcxcAAACAAJ), [Internet Archive](https://archive.org/details/makequiltindaylo0000burn))
- _The Quilting Bible: The Complete Photo Guide to Machine Quilting_, 3rd edition, by Creative Publishing International ([Google Books](https://www.google.com/books/about/The_Quilting_Bible_3rd_Edition/N2PKGQYAZmYC), [Internet Archive](https://archive.org/details/quiltingbiblecom00crea))
- _Ultimate Quilting Bible: A Complete Reference with Step-by-Step Techniques_ by Marie Clayton ([Google Books](https://www.google.com/books/about/Ultimate_Quilting_Bible/SlAmEAAAQBAJ), [Internet Archive](https://archive.org/details/ultimatequilting0000clay))
`,ht=`---
title: Learning to quilt
order: 10
summary: Places to learn quilting, video tutorials, and efficiency techniques.
---

- [Quilting on Wikipedia](https://en.wikipedia.org/wiki/Quilting) covers history, terms, and techniques.
- [The Quilt Alliance](https://quiltalliance.org/) documents and shares quilts and their makers'
  stories.
- [Quilt Index](https://quiltindex.org/) is a searchable database of documented quilts and patterns.
- Your local quilt guild or [quilt shop](https://www.prunusdomestic.com/pdx_local_retail.html?category=sewing) is the best place to learn hands-on.

## Video tutorials

- [The Ultimate Quilt Binding Tutorial](https://www.youtube.com/watch?v=0vCWpxBRs20) with Jenny Doan
  of Missouri Star Quilt Company
- [Quilting Tutorial: The Dreaded Y Seam!](https://www.youtube.com/watch?v=IPh-XRV8Skk)
- [How to design a Foundation Paper Pieced Block](https://www.youtube.com/watch?v=lpOxieaQMEo&list=PL8alu4Fdt2WvZ3t3khzP2W5tOGwjPMEtW)
  (a playlist)

## Efficiency techniques

### Binding

- [Continuous mitered binding](https://arbeedesigns.com/pages/continuous-mitered-binding) by Arbee
  Designs walks through sewing the binding on with mitered corners and joining the ends.
- [Continuous binding](https://www.eobquiltdesign.com/continuous-binding) by EOB Quilt Design shows
  the diagonal join for adding length to the binding strip, with photos of each step.

### Flying geese

- [Four-at-a-time flying geese](https://quiltingjetgirl.com/2022/09/30/updated-four-at-a-time-flying-geese-tutorial-and-sizing-tables/)
  by Quilting Jetgirl has sizing tables and tips for accurate, no-waste geese.
- [Reducing bulk in four-at-a-time flying geese](https://thecraftyquilter.com/2022/05/how-to-reduce-bulk-in-4-at-a-time-flying-geese/) by The Crafty Quilter
  trims the overlap of the small squares before sewing, so the goose points lie flat.
`,gt=`---
title: Licenses
order: 10
summary: What the Creative Commons licenses on blocks, palettes, and packs allow.
---

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
`,_t=`---
title: RRQuilts project
order: 10
summary: The source code, issue tracker, and file format schema.
---

- The source code (MIT licensed) is on [RRQuilts on GitHub](https://github.com/RagingRoosevelt/RRQuilts).
- To [report a problem or suggest an idea](https://github.com/RagingRoosevelt/RRQuilts/issues), open a GitHub
  issue.
- Anyone writing tools that read \`.rrq\` files can use the JSON Schema for
  [the project file format](https://ragingroosevelt.github.io/RRQuilts/schemas/rrq.v1.json).
`,vt=`---
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

The table counts strips from 40″ (105 cm) of usable fabric width. Pick another fabric width in the
calculator below.

::calc binding

## Steps

1. **Join the strips end to end.** A diagonal (scarf) join spreads the seam's bulk along the strip,
   so the binding stays flat where strips meet.
   - Lay two strips right sides together at a right angle, in an L shape, with the end of one over
     the end of the other so they overlap in a square. Pin.
   - With a ruler, draw a 45° line across the overlap, from the corner where the strips' outer edges
     meet to the opposite corner.
   - Sew on the line. Before trimming, open the strips out to check that they make one straight
     strip without a twist.
   - Trim the corner to ¼″ (7.5 mm) beyond the seam and press the seam open.
   - Repeat until you have one strip long enough for the whole quilt.

<svg viewBox="0 0 320 160" width="480" role="img" aria-label="Two strips at right angles, right sides together, each hanging slightly past the other, with the diagonal sewing line across the overlap">
  <polygon points="20,60 170,60 170,90 20,90 20.0,90.0 25.0,85.0 20.0,80.0 25.0,75.0 20.0,70.0 25.0,65.0 20.0,60.0" style="fill: var(--q-primary)" stroke="none"/>
  <polyline points="20,60 170,60 170,90 20,90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polyline points="20.0,90.0 25.0,85.0 20.0,80.0 25.0,75.0 20.0,70.0 25.0,65.0 20.0,60.0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <polygon points="160,150 160,50 130,50 130,150 130.0,150.0 135.0,155.0 140.0,150.0 145.0,155.0 150.0,150.0 155.0,155.0 160.0,150.0" style="fill: color-mix(in srgb, var(--q-primary) 22%, white)" stroke="none"/>
  <polyline points="160,150 160,50 130,50 130,150" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polyline points="130.0,150.0 135.0,155.0 140.0,150.0 145.0,155.0 150.0,150.0 155.0,155.0 160.0,150.0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <line x1="130" y1="60" x2="160" y2="90" stroke="#333" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="185" y="30" font-size="11" fill="currentColor">sew on the diagonal,</text>
  <text x="185" y="46" font-size="11" fill="currentColor">then trim to ¼″</text>
  <rect x="185" y="66" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="203" y="76" font-size="11" fill="currentColor">right side</text>
  <rect x="185" y="86" width="12" height="12" style="fill: color-mix(in srgb, var(--q-primary) 22%, white)" stroke="currentColor"/>
  <text x="203" y="96" font-size="11" fill="currentColor">wrong side</text>
</svg>

2. **Press the strip in half.** Fold it lengthwise, wrong sides together, and press.
3. **Start sewing.** Start partway along one side, not near a corner. Lay the folded strip on the
   front of the quilt with its raw edges even with the quilt's edge. Leave a tail of about 10″
   (25 cm) loose, then sew away from it with a ¼″ (7.5 mm) seam.

<svg viewBox="0 0 320 150" width="480" role="img" aria-label="The whole quilt: the binding starts partway along the bottom edge and is sewn toward the left, leaving a loose, unsewn tail along the edge to the right of the start">
  <defs><pattern id="cb-start" patternUnits="userSpaceOnUse" x="10" y="10" width="80" height="80"><polygon points="23.03,40.0 28.69,45.66 34.34,40.0 28.69,34.34" fill="#c4282c"/><polygon points="28.69,34.34 34.34,40.0 40.0,34.34 34.34,28.69" fill="#5a78a0"/><polygon points="34.34,28.69 40.0,34.34 45.66,28.69 40.0,23.03" fill="#c4282c"/><polygon points="28.69,45.66 34.34,51.31 40.0,45.66 34.34,40.0" fill="#5a78a0"/><polygon points="34.34,40.0 40.0,45.66 45.66,40.0 40.0,34.34" fill="#c4282c"/><polygon points="40.0,34.34 45.66,40.0 51.31,34.34 45.66,28.69" fill="#5a78a0"/><polygon points="34.34,51.31 40.0,56.97 45.66,51.31 40.0,45.66" fill="#c4282c"/><polygon points="40.0,45.66 45.66,51.31 51.31,45.66 45.66,40.0" fill="#5a78a0"/><polygon points="45.66,40.0 51.31,45.66 56.97,40.0 51.31,34.34" fill="#c4282c"/><polygon points="51.31,45.66 80.0,74.34 80.0,80.0 74.34,80.0 45.66,51.31" fill="#f4ecd8"/><polygon points="34.34,51.31 5.66,80.0 0.0,80.0 0.0,74.34 28.69,45.66" fill="#f4ecd8"/><polygon points="28.69,34.34 0.0,5.66 0.0,0.0 5.66,0.0 34.34,28.69" fill="#f4ecd8"/><polygon points="45.66,28.69 74.34,0.0 80.0,0.0 80.0,5.66 51.31,34.34" fill="#f4ecd8"/><polygon points="63.03,80.0 40.0,56.97 45.66,51.31 63.03,68.69" fill="#5a78a0"/><polygon points="0.0,63.03 23.03,40.0 28.69,45.66 11.31,63.03" fill="#5a78a0"/><polygon points="16.97,0.0 40.0,23.03 34.34,28.69 16.97,11.31" fill="#5a78a0"/><polygon points="80.0,16.97 56.97,40.0 51.31,34.34 68.69,16.97" fill="#5a78a0"/><polygon points="56.97,40.0 80.0,63.03 68.69,63.03 51.31,45.66" fill="#5a78a0"/><polygon points="40.0,56.97 16.97,80.0 16.97,68.69 34.34,51.31" fill="#5a78a0"/><polygon points="23.03,40.0 0.0,16.97 11.31,16.97 28.69,34.34" fill="#5a78a0"/><polygon points="40.0,23.03 63.03,0.0 63.03,11.31 45.66,28.69" fill="#5a78a0"/><polygon points="74.34,80.0 63.03,80.0 63.03,68.69" fill="#c4282c"/><polygon points="0.0,74.34 0.0,63.03 11.31,63.03" fill="#c4282c"/><polygon points="5.66,0.0 16.97,0.0 16.97,11.31" fill="#c4282c"/><polygon points="80.0,5.66 80.0,16.97 68.69,16.97" fill="#c4282c"/><polygon points="80.0,63.03 80.0,74.34 68.69,63.03" fill="#c4282c"/><polygon points="16.97,80.0 5.66,80.0 16.97,68.69" fill="#c4282c"/><polygon points="0.0,16.97 0.0,5.66 11.31,16.97" fill="#c4282c"/><polygon points="63.03,0.0 74.34,0.0 63.03,11.31" fill="#c4282c"/><polygon points="63.03,80.0 16.97,80.0 40.0,56.97" fill="#96c4e8"/><polygon points="0.0,63.03 0.0,16.97 23.03,40.0" fill="#96c4e8"/><polygon points="16.97,0.0 63.03,0.0 40.0,23.03" fill="#96c4e8"/><polygon points="80.0,16.97 80.0,63.03 56.97,40.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="160" height="80" fill="url(#cb-start)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="76" width="80" height="14" style="fill: var(--q-primary)" stroke="currentColor"/>
  <path d="M120 83 H144 Q156 83 157 70 L158 52" fill="none" stroke="currentColor" stroke-width="16"/>
  <path d="M120 83 H144 Q156 83 157 70 L158 52" fill="none" style="stroke: var(--q-primary)" stroke-width="13"/>
  <line x1="44" y1="82" x2="120" y2="82" stroke="#fff" stroke-dasharray="4 3"/>
  <circle cx="120" cy="82" r="3" fill="#fff" stroke="currentColor"/>
  <path d="M74 104 H40 M48 99 L40 104 L48 109" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="60" y="124" font-size="11" fill="currentColor" text-anchor="middle">sew this way</text>
  <text x="205" y="40" font-size="11" fill="currentColor">start partway along</text>
  <text x="205" y="56" font-size="11" fill="currentColor">a side (the dot)</text>
  <text x="205" y="108" font-size="11" fill="currentColor">leave about 10″</text>
  <text x="205" y="124" font-size="11" fill="currentColor">(25 cm) loose</text>
</svg>

4. **Stop at the first corner.** Stop sewing one seam allowance (SA) from the next edge. Turn the
   quilt and sew diagonally from there out to the corner. Take the quilt out from under the needle.

<svg viewBox="0 0 280 150" width="420" role="img" aria-label="A quilt corner from the front: the binding lies along the top edge, sewn to one seam allowance from the next edge, then diagonally out to the corner">
  <defs><pattern id="cb-a" patternUnits="userSpaceOnUse" x="10" y="40" width="130" height="130"><polygon points="37.42,65.0 46.62,74.19 55.81,65.0 46.62,55.81" fill="#c4282c"/><polygon points="46.62,55.81 55.81,65.0 65.0,55.81 55.81,46.62" fill="#5a78a0"/><polygon points="55.81,46.62 65.0,55.81 74.19,46.62 65.0,37.42" fill="#c4282c"/><polygon points="46.62,74.19 55.81,83.38 65.0,74.19 55.81,65.0" fill="#5a78a0"/><polygon points="55.81,65.0 65.0,74.19 74.19,65.0 65.0,55.81" fill="#c4282c"/><polygon points="65.0,55.81 74.19,65.0 83.38,55.81 74.19,46.62" fill="#5a78a0"/><polygon points="55.81,83.38 65.0,92.58 74.19,83.38 65.0,74.19" fill="#c4282c"/><polygon points="65.0,74.19 74.19,83.38 83.38,74.19 74.19,65.0" fill="#5a78a0"/><polygon points="74.19,65.0 83.38,74.19 92.58,65.0 83.38,55.81" fill="#c4282c"/><polygon points="83.38,74.19 130.0,120.81 130.0,130.0 120.81,130.0 74.19,83.38" fill="#f4ecd8"/><polygon points="55.81,83.38 9.19,130.0 0.0,130.0 0.0,120.81 46.62,74.19" fill="#f4ecd8"/><polygon points="46.62,55.81 0.0,9.19 0.0,0.0 9.19,0.0 55.81,46.62" fill="#f4ecd8"/><polygon points="74.19,46.62 120.81,0.0 130.0,0.0 130.0,9.19 83.38,55.81" fill="#f4ecd8"/><polygon points="102.42,130.0 65.0,92.58 74.19,83.38 102.42,111.62" fill="#5a78a0"/><polygon points="0.0,102.42 37.42,65.0 46.62,74.19 18.38,102.42" fill="#5a78a0"/><polygon points="27.58,0.0 65.0,37.42 55.81,46.62 27.58,18.38" fill="#5a78a0"/><polygon points="130.0,27.58 92.58,65.0 83.38,55.81 111.62,27.58" fill="#5a78a0"/><polygon points="92.58,65.0 130.0,102.42 111.62,102.42 83.38,74.19" fill="#5a78a0"/><polygon points="65.0,92.58 27.58,130.0 27.58,111.62 55.81,83.38" fill="#5a78a0"/><polygon points="37.42,65.0 0.0,27.58 18.38,27.58 46.62,55.81" fill="#5a78a0"/><polygon points="65.0,37.42 102.42,0.0 102.42,18.38 74.19,46.62" fill="#5a78a0"/><polygon points="120.81,130.0 102.42,130.0 102.42,111.62" fill="#c4282c"/><polygon points="0.0,120.81 0.0,102.42 18.38,102.42" fill="#c4282c"/><polygon points="9.19,0.0 27.58,0.0 27.58,18.38" fill="#c4282c"/><polygon points="130.0,9.19 130.0,27.58 111.62,27.58" fill="#c4282c"/><polygon points="130.0,102.42 130.0,120.81 111.62,102.42" fill="#c4282c"/><polygon points="27.58,130.0 9.19,130.0 27.58,111.62" fill="#c4282c"/><polygon points="0.0,27.58 0.0,9.19 18.38,27.58" fill="#c4282c"/><polygon points="102.42,0.0 120.81,0.0 102.42,18.38" fill="#c4282c"/><polygon points="102.42,130.0 27.58,130.0 65.0,92.58" fill="#96c4e8"/><polygon points="0.0,102.42 0.0,27.58 37.42,65.0" fill="#96c4e8"/><polygon points="27.58,0.0 102.42,0.0 65.0,37.42" fill="#96c4e8"/><polygon points="130.0,27.58 130.0,102.42 92.58,65.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="40" width="130" height="100" fill="url(#cb-a)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="10" y="40" width="142" height="16" style="fill: var(--q-primary)" stroke="currentColor"/>
  <line x1="10" y1="46" x2="134" y2="46" stroke="#fff" stroke-dasharray="4 3"/>
  <line x1="134" y1="46" x2="140" y2="40" stroke="#fff" stroke-dasharray="3 2"/>
  <circle cx="134" cy="46" r="3" fill="#fff" stroke="currentColor"/>
  <text x="165" y="62" font-size="11" fill="currentColor">stop one SA from</text>
  <text x="165" y="78" font-size="11" fill="currentColor">the edge, then sew</text>
  <text x="165" y="94" font-size="11" fill="currentColor">to the corner</text>
</svg>

5. **Fold up at 45°.** Turn the quilt so the next side runs away from you. Fold the loose binding
   straight up and away from the quilt. The fold makes a 45° crease at the corner that lines up with
   the diagonal stitch you sewed to the corner, and the binding's raw edge now runs in line with the
   next side.

<svg viewBox="0 0 280 150" width="420" role="img" aria-label="The loose binding folded up and away from the quilt along a 45 degree crease, its raw edge in line with the next side">
  <defs><pattern id="cb-b" patternUnits="userSpaceOnUse" x="10" y="40" width="130" height="130"><polygon points="37.42,65.0 46.62,74.19 55.81,65.0 46.62,55.81" fill="#c4282c"/><polygon points="46.62,55.81 55.81,65.0 65.0,55.81 55.81,46.62" fill="#5a78a0"/><polygon points="55.81,46.62 65.0,55.81 74.19,46.62 65.0,37.42" fill="#c4282c"/><polygon points="46.62,74.19 55.81,83.38 65.0,74.19 55.81,65.0" fill="#5a78a0"/><polygon points="55.81,65.0 65.0,74.19 74.19,65.0 65.0,55.81" fill="#c4282c"/><polygon points="65.0,55.81 74.19,65.0 83.38,55.81 74.19,46.62" fill="#5a78a0"/><polygon points="55.81,83.38 65.0,92.58 74.19,83.38 65.0,74.19" fill="#c4282c"/><polygon points="65.0,74.19 74.19,83.38 83.38,74.19 74.19,65.0" fill="#5a78a0"/><polygon points="74.19,65.0 83.38,74.19 92.58,65.0 83.38,55.81" fill="#c4282c"/><polygon points="83.38,74.19 130.0,120.81 130.0,130.0 120.81,130.0 74.19,83.38" fill="#f4ecd8"/><polygon points="55.81,83.38 9.19,130.0 0.0,130.0 0.0,120.81 46.62,74.19" fill="#f4ecd8"/><polygon points="46.62,55.81 0.0,9.19 0.0,0.0 9.19,0.0 55.81,46.62" fill="#f4ecd8"/><polygon points="74.19,46.62 120.81,0.0 130.0,0.0 130.0,9.19 83.38,55.81" fill="#f4ecd8"/><polygon points="102.42,130.0 65.0,92.58 74.19,83.38 102.42,111.62" fill="#5a78a0"/><polygon points="0.0,102.42 37.42,65.0 46.62,74.19 18.38,102.42" fill="#5a78a0"/><polygon points="27.58,0.0 65.0,37.42 55.81,46.62 27.58,18.38" fill="#5a78a0"/><polygon points="130.0,27.58 92.58,65.0 83.38,55.81 111.62,27.58" fill="#5a78a0"/><polygon points="92.58,65.0 130.0,102.42 111.62,102.42 83.38,74.19" fill="#5a78a0"/><polygon points="65.0,92.58 27.58,130.0 27.58,111.62 55.81,83.38" fill="#5a78a0"/><polygon points="37.42,65.0 0.0,27.58 18.38,27.58 46.62,55.81" fill="#5a78a0"/><polygon points="65.0,37.42 102.42,0.0 102.42,18.38 74.19,46.62" fill="#5a78a0"/><polygon points="120.81,130.0 102.42,130.0 102.42,111.62" fill="#c4282c"/><polygon points="0.0,120.81 0.0,102.42 18.38,102.42" fill="#c4282c"/><polygon points="9.19,0.0 27.58,0.0 27.58,18.38" fill="#c4282c"/><polygon points="130.0,9.19 130.0,27.58 111.62,27.58" fill="#c4282c"/><polygon points="130.0,102.42 130.0,120.81 111.62,102.42" fill="#c4282c"/><polygon points="27.58,130.0 9.19,130.0 27.58,111.62" fill="#c4282c"/><polygon points="0.0,27.58 0.0,9.19 18.38,27.58" fill="#c4282c"/><polygon points="102.42,0.0 120.81,0.0 102.42,18.38" fill="#c4282c"/><polygon points="102.42,130.0 27.58,130.0 65.0,92.58" fill="#96c4e8"/><polygon points="0.0,102.42 0.0,27.58 37.42,65.0" fill="#96c4e8"/><polygon points="27.58,0.0 102.42,0.0 65.0,37.42" fill="#96c4e8"/><polygon points="130.0,27.58 130.0,102.42 92.58,65.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="40" width="130" height="100" fill="url(#cb-b)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="10,40 140,40 124,56 10,56" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="124,56 140,40 140,4 124,4" style="fill: var(--q-primary); filter: brightness(0.75)" stroke="currentColor"/>
  <line x1="124" y1="56" x2="140" y2="40" stroke="#fff" stroke-width="1.5"/>
  <line x1="10" y1="46" x2="134" y2="46" stroke="#fff" stroke-dasharray="4 3"/>
  <line x1="134" y1="46" x2="140" y2="40" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
  <text x="165" y="22" font-size="11" fill="currentColor">fold up along a</text>
  <text x="165" y="38" font-size="11" fill="currentColor">45° crease on the stitch</text>
  <text x="165" y="54" font-size="11" fill="currentColor">to the corner, raw edge</text>
  <text x="165" y="70" font-size="11" fill="currentColor">in line with the side</text>
</svg>

6. **Fold back down.** Fold the binding down over itself along the next side, with the new fold flush
   with the edge you just sewed. The raw edges now line up with the next side. The layers under the
   fold leave a small pleat at the corner, which becomes the miter.

<svg viewBox="0 0 280 150" width="420" role="img" aria-label="The binding folded back down along the next side, the fold flush with the top edge, ready to sew from the edge">
  <defs><pattern id="cb-c" patternUnits="userSpaceOnUse" x="10" y="40" width="130" height="130"><polygon points="37.42,65.0 46.62,74.19 55.81,65.0 46.62,55.81" fill="#c4282c"/><polygon points="46.62,55.81 55.81,65.0 65.0,55.81 55.81,46.62" fill="#5a78a0"/><polygon points="55.81,46.62 65.0,55.81 74.19,46.62 65.0,37.42" fill="#c4282c"/><polygon points="46.62,74.19 55.81,83.38 65.0,74.19 55.81,65.0" fill="#5a78a0"/><polygon points="55.81,65.0 65.0,74.19 74.19,65.0 65.0,55.81" fill="#c4282c"/><polygon points="65.0,55.81 74.19,65.0 83.38,55.81 74.19,46.62" fill="#5a78a0"/><polygon points="55.81,83.38 65.0,92.58 74.19,83.38 65.0,74.19" fill="#c4282c"/><polygon points="65.0,74.19 74.19,83.38 83.38,74.19 74.19,65.0" fill="#5a78a0"/><polygon points="74.19,65.0 83.38,74.19 92.58,65.0 83.38,55.81" fill="#c4282c"/><polygon points="83.38,74.19 130.0,120.81 130.0,130.0 120.81,130.0 74.19,83.38" fill="#f4ecd8"/><polygon points="55.81,83.38 9.19,130.0 0.0,130.0 0.0,120.81 46.62,74.19" fill="#f4ecd8"/><polygon points="46.62,55.81 0.0,9.19 0.0,0.0 9.19,0.0 55.81,46.62" fill="#f4ecd8"/><polygon points="74.19,46.62 120.81,0.0 130.0,0.0 130.0,9.19 83.38,55.81" fill="#f4ecd8"/><polygon points="102.42,130.0 65.0,92.58 74.19,83.38 102.42,111.62" fill="#5a78a0"/><polygon points="0.0,102.42 37.42,65.0 46.62,74.19 18.38,102.42" fill="#5a78a0"/><polygon points="27.58,0.0 65.0,37.42 55.81,46.62 27.58,18.38" fill="#5a78a0"/><polygon points="130.0,27.58 92.58,65.0 83.38,55.81 111.62,27.58" fill="#5a78a0"/><polygon points="92.58,65.0 130.0,102.42 111.62,102.42 83.38,74.19" fill="#5a78a0"/><polygon points="65.0,92.58 27.58,130.0 27.58,111.62 55.81,83.38" fill="#5a78a0"/><polygon points="37.42,65.0 0.0,27.58 18.38,27.58 46.62,55.81" fill="#5a78a0"/><polygon points="65.0,37.42 102.42,0.0 102.42,18.38 74.19,46.62" fill="#5a78a0"/><polygon points="120.81,130.0 102.42,130.0 102.42,111.62" fill="#c4282c"/><polygon points="0.0,120.81 0.0,102.42 18.38,102.42" fill="#c4282c"/><polygon points="9.19,0.0 27.58,0.0 27.58,18.38" fill="#c4282c"/><polygon points="130.0,9.19 130.0,27.58 111.62,27.58" fill="#c4282c"/><polygon points="130.0,102.42 130.0,120.81 111.62,102.42" fill="#c4282c"/><polygon points="27.58,130.0 9.19,130.0 27.58,111.62" fill="#c4282c"/><polygon points="0.0,27.58 0.0,9.19 18.38,27.58" fill="#c4282c"/><polygon points="102.42,0.0 120.81,0.0 102.42,18.38" fill="#c4282c"/><polygon points="102.42,130.0 27.58,130.0 65.0,92.58" fill="#96c4e8"/><polygon points="0.0,102.42 0.0,27.58 37.42,65.0" fill="#96c4e8"/><polygon points="27.58,0.0 102.42,0.0 65.0,37.42" fill="#96c4e8"/><polygon points="130.0,27.58 130.0,102.42 92.58,65.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="40" width="130" height="100" fill="url(#cb-c)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="10" y="40" width="114" height="16" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="124" y="40" width="16" height="100" style="fill: var(--q-primary)" stroke="currentColor"/>
  <line x1="124" y1="40" x2="140" y2="40" stroke="currentColor" stroke-width="3"/>
  <line x1="10" y1="46" x2="124" y2="46" stroke="#fff" stroke-dasharray="4 3"/>
  <line x1="134" y1="40" x2="134" y2="140" stroke="#fff" stroke-dasharray="4 3"/>
  <circle cx="134" cy="41" r="3" fill="#fff" stroke="currentColor"/>
  <text x="165" y="62" font-size="11" fill="currentColor">fold down, flush</text>
  <text x="165" y="78" font-size="11" fill="currentColor">with the top edge,</text>
  <text x="165" y="94" font-size="11" fill="currentColor">then sew from</text>
  <text x="165" y="110" font-size="11" fill="currentColor">the edge</text>
</svg>

7. **Keep sewing.** Start right at the fold with a backstitch and sew down the next side. Stop one SA
   from the next edge, sew out to the corner, and fold up and down the same way at every corner.
8. **Join the two ends.** Stop sewing about 12″ (30 cm) before where you started, so a gap is left
   with both tails loose. Lay both tails along the quilt edge and trim them so they overlap by the
   width of the cut strip (2½″ / 6 cm).

<svg viewBox="0 0 300 130" width="450" role="img" aria-label="The quilt edge nearest you: the start of the strip sewn on the left, the end sewn on the right, and between them an unsewn gap where the two loose tails overlap by one strip width">
  <defs><pattern id="cb-d" patternUnits="userSpaceOnUse" x="10" y="-56" width="140" height="140"><polygon points="40.3,70.0 50.2,79.9 60.1,70.0 50.2,60.1" fill="#c4282c"/><polygon points="50.2,60.1 60.1,70.0 70.0,60.1 60.1,50.2" fill="#5a78a0"/><polygon points="60.1,50.2 70.0,60.1 79.9,50.2 70.0,40.3" fill="#c4282c"/><polygon points="50.2,79.9 60.1,89.8 70.0,79.9 60.1,70.0" fill="#5a78a0"/><polygon points="60.1,70.0 70.0,79.9 79.9,70.0 70.0,60.1" fill="#c4282c"/><polygon points="70.0,60.1 79.9,70.0 89.8,60.1 79.9,50.2" fill="#5a78a0"/><polygon points="60.1,89.8 70.0,99.7 79.9,89.8 70.0,79.9" fill="#c4282c"/><polygon points="70.0,79.9 79.9,89.8 89.8,79.9 79.9,70.0" fill="#5a78a0"/><polygon points="79.9,70.0 89.8,79.9 99.7,70.0 89.8,60.1" fill="#c4282c"/><polygon points="89.8,79.9 140.0,130.1 140.0,140.0 130.1,140.0 79.9,89.8" fill="#f4ecd8"/><polygon points="60.1,89.8 9.9,140.0 0.0,140.0 0.0,130.1 50.2,79.9" fill="#f4ecd8"/><polygon points="50.2,60.1 0.0,9.9 0.0,0.0 9.9,0.0 60.1,50.2" fill="#f4ecd8"/><polygon points="79.9,50.2 130.1,0.0 140.0,0.0 140.0,9.9 89.8,60.1" fill="#f4ecd8"/><polygon points="110.3,140.0 70.0,99.7 79.9,89.8 110.3,120.2" fill="#5a78a0"/><polygon points="0.0,110.3 40.3,70.0 50.2,79.9 19.8,110.3" fill="#5a78a0"/><polygon points="29.7,0.0 70.0,40.3 60.1,50.2 29.7,19.8" fill="#5a78a0"/><polygon points="140.0,29.7 99.7,70.0 89.8,60.1 120.2,29.7" fill="#5a78a0"/><polygon points="99.7,70.0 140.0,110.3 120.2,110.3 89.8,79.9" fill="#5a78a0"/><polygon points="70.0,99.7 29.7,140.0 29.7,120.2 60.1,89.8" fill="#5a78a0"/><polygon points="40.3,70.0 0.0,29.7 19.8,29.7 50.2,60.1" fill="#5a78a0"/><polygon points="70.0,40.3 110.3,0.0 110.3,19.8 79.9,50.2" fill="#5a78a0"/><polygon points="130.1,140.0 110.3,140.0 110.3,120.2" fill="#c4282c"/><polygon points="0.0,130.1 0.0,110.3 19.8,110.3" fill="#c4282c"/><polygon points="9.9,0.0 29.7,0.0 29.7,19.8" fill="#c4282c"/><polygon points="140.0,9.9 140.0,29.7 120.2,29.7" fill="#c4282c"/><polygon points="140.0,110.3 140.0,130.1 120.2,110.3" fill="#c4282c"/><polygon points="29.7,140.0 9.9,140.0 29.7,120.2" fill="#c4282c"/><polygon points="0.0,29.7 0.0,9.9 19.8,29.7" fill="#c4282c"/><polygon points="110.3,0.0 130.1,0.0 110.3,19.8" fill="#c4282c"/><polygon points="110.3,140.0 29.7,140.0 70.0,99.7" fill="#96c4e8"/><polygon points="0.0,110.3 0.0,29.7 40.3,70.0" fill="#96c4e8"/><polygon points="29.7,0.0 110.3,0.0 70.0,40.3" fill="#96c4e8"/><polygon points="140.0,29.7 140.0,110.3 99.7,70.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="24" width="280" height="60" fill="url(#cb-d)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="10" y="68" width="155" height="16" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="135" y="68" width="155" height="16" style="fill: var(--q-primary); filter: brightness(0.75)" stroke="currentColor"/>
  <line x1="10" y1="78" x2="100" y2="78" stroke="#fff" stroke-dasharray="4 3"/>
  <line x1="200" y1="78" x2="290" y2="78" stroke="#fff" stroke-dasharray="4 3"/>
  <circle cx="100" cy="78" r="3" fill="#fff" stroke="currentColor"/>
  <circle cx="200" cy="78" r="3" fill="#fff" stroke="currentColor"/>
  <line x1="135" y1="18" x2="135" y2="90" stroke="currentColor" stroke-dasharray="4 3"/>
  <line x1="165" y1="18" x2="165" y2="90" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="150" y="13" font-size="11" fill="currentColor" text-anchor="middle">overlap = strip width</text>
  <text x="55" y="100" font-size="11" fill="currentColor" text-anchor="middle">start of the strip</text>
  <text x="245" y="100" font-size="11" fill="currentColor" text-anchor="middle">end of the strip</text>
  <path d="M100 104 V110 H200 V104" fill="none" stroke="currentColor"/>
  <text x="150" y="124" font-size="11" fill="currentColor" text-anchor="middle">gap, not sewn yet</text>
</svg>

Unfold both tails completely along the loose stretch, so each is a single layer at its full cut
width. Lay them right sides together at right angles, as in step 1, and sew on the diagonal.

<svg viewBox="-110 30 460 220" width="575" role="img" aria-label="The two tails opened and laid right sides together at right angles, sewn on the diagonal; each tail leads to the rest of the strip">
  <polygon points="-100,60 160,60 160,90 -100,90 -100.0,90.0 -95.0,85.0 -100.0,80.0 -95.0,75.0 -100.0,70.0 -95.0,65.0 -100.0,60.0" style="fill: var(--q-primary)" stroke="none"/>
  <polyline points="-100,60 160,60 160,90 -100,90" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polyline points="-100.0,90.0 -95.0,85.0 -100.0,80.0 -95.0,75.0 -100.0,70.0 -95.0,65.0 -100.0,60.0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <polygon points="150,240 150,50 120,50 120,240 120.0,240.0 125.0,245.0 130.0,240.0 135.0,245.0 140.0,240.0 145.0,245.0 150.0,240.0" style="fill: color-mix(in srgb, var(--q-primary) 22%, white)" stroke="none"/>
  <polyline points="150,240 150,50 120,50 120,240" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polyline points="120.0,240.0 125.0,245.0 130.0,240.0 135.0,245.0 140.0,240.0 145.0,245.0 150.0,240.0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
  <line x1="120" y1="60" x2="150" y2="90" stroke="#333" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="-92" y="72" font-size="10" fill="#fff">← to the rest</text>
  <text x="-80" y="84" font-size="10" fill="#fff">of the strip</text>
  <g transform="translate(143 100) rotate(90)">
    <text x="0" y="0" font-size="9" fill="#333">to the rest →</text>
    <text x="0" y="11" font-size="9" fill="#333">of the strip</text>
  </g>
  <text x="195" y="50" font-size="11" fill="currentColor">sew on the diagonal,</text>
  <text x="195" y="66" font-size="11" fill="currentColor">with both tails</text>
  <text x="195" y="82" font-size="11" fill="currentColor">unfolded</text>
  <rect x="195" y="96" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="213" y="106" font-size="11" fill="currentColor">right side</text>
  <rect x="195" y="114" width="12" height="12" style="fill: color-mix(in srgb, var(--q-primary) 22%, white)" stroke="currentColor"/>
  <text x="213" y="124" font-size="11" fill="currentColor">wrong side</text>
  <defs><marker id="join-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="190" y1="46" x2="146" y2="70" stroke="currentColor" marker-end="url(#join-arrow)"/>
</svg>

Turn the top tail down. If the binding now lies flat along the quilt without slack or pull, trim
the seam to ¼″ and press it open. Fold the strip in half again and sew the gap closed.

<svg viewBox="0 0 300 140" width="450" role="img" aria-label="On the quilt edge nearest you: the sewn start and end of the binding, their stitching stopping short of the gap, and in the gap the joined strip turned down and refolded, one continuous binding with a diagonal seam">
  <defs><pattern id="cb-e2" patternUnits="userSpaceOnUse" x="10" y="-56" width="140" height="140"><polygon points="40.3,70.0 50.2,79.9 60.1,70.0 50.2,60.1" fill="#c4282c"/><polygon points="50.2,60.1 60.1,70.0 70.0,60.1 60.1,50.2" fill="#5a78a0"/><polygon points="60.1,50.2 70.0,60.1 79.9,50.2 70.0,40.3" fill="#c4282c"/><polygon points="50.2,79.9 60.1,89.8 70.0,79.9 60.1,70.0" fill="#5a78a0"/><polygon points="60.1,70.0 70.0,79.9 79.9,70.0 70.0,60.1" fill="#c4282c"/><polygon points="70.0,60.1 79.9,70.0 89.8,60.1 79.9,50.2" fill="#5a78a0"/><polygon points="60.1,89.8 70.0,99.7 79.9,89.8 70.0,79.9" fill="#c4282c"/><polygon points="70.0,79.9 79.9,89.8 89.8,79.9 79.9,70.0" fill="#5a78a0"/><polygon points="79.9,70.0 89.8,79.9 99.7,70.0 89.8,60.1" fill="#c4282c"/><polygon points="89.8,79.9 140.0,130.1 140.0,140.0 130.1,140.0 79.9,89.8" fill="#f4ecd8"/><polygon points="60.1,89.8 9.9,140.0 0.0,140.0 0.0,130.1 50.2,79.9" fill="#f4ecd8"/><polygon points="50.2,60.1 0.0,9.9 0.0,0.0 9.9,0.0 60.1,50.2" fill="#f4ecd8"/><polygon points="79.9,50.2 130.1,0.0 140.0,0.0 140.0,9.9 89.8,60.1" fill="#f4ecd8"/><polygon points="110.3,140.0 70.0,99.7 79.9,89.8 110.3,120.2" fill="#5a78a0"/><polygon points="0.0,110.3 40.3,70.0 50.2,79.9 19.8,110.3" fill="#5a78a0"/><polygon points="29.7,0.0 70.0,40.3 60.1,50.2 29.7,19.8" fill="#5a78a0"/><polygon points="140.0,29.7 99.7,70.0 89.8,60.1 120.2,29.7" fill="#5a78a0"/><polygon points="99.7,70.0 140.0,110.3 120.2,110.3 89.8,79.9" fill="#5a78a0"/><polygon points="70.0,99.7 29.7,140.0 29.7,120.2 60.1,89.8" fill="#5a78a0"/><polygon points="40.3,70.0 0.0,29.7 19.8,29.7 50.2,60.1" fill="#5a78a0"/><polygon points="70.0,40.3 110.3,0.0 110.3,19.8 79.9,50.2" fill="#5a78a0"/><polygon points="130.1,140.0 110.3,140.0 110.3,120.2" fill="#c4282c"/><polygon points="0.0,130.1 0.0,110.3 19.8,110.3" fill="#c4282c"/><polygon points="9.9,0.0 29.7,0.0 29.7,19.8" fill="#c4282c"/><polygon points="140.0,9.9 140.0,29.7 120.2,29.7" fill="#c4282c"/><polygon points="140.0,110.3 140.0,130.1 120.2,110.3" fill="#c4282c"/><polygon points="29.7,140.0 9.9,140.0 29.7,120.2" fill="#c4282c"/><polygon points="0.0,29.7 0.0,9.9 19.8,29.7" fill="#c4282c"/><polygon points="110.3,0.0 130.1,0.0 110.3,19.8" fill="#c4282c"/><polygon points="110.3,140.0 29.7,140.0 70.0,99.7" fill="#96c4e8"/><polygon points="0.0,110.3 0.0,29.7 40.3,70.0" fill="#96c4e8"/><polygon points="29.7,0.0 110.3,0.0 70.0,40.3" fill="#96c4e8"/><polygon points="140.0,29.7 140.0,110.3 99.7,70.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="24" width="280" height="60" fill="url(#cb-e2)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="10,68 142,68 158,84 10,84" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="142,68 290,68 290,84 158,84" style="fill: var(--q-primary); filter: brightness(0.75)" stroke="currentColor"/>
  <line x1="142" y1="68" x2="158" y2="84" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 2"/>
  <line x1="10" y1="78" x2="100" y2="78" stroke="#fff" stroke-dasharray="4 3"/>
  <line x1="200" y1="78" x2="290" y2="78" stroke="#fff" stroke-dasharray="4 3"/>
  <circle cx="100" cy="78" r="3" fill="#fff" stroke="currentColor"/>
  <circle cx="200" cy="78" r="3" fill="#fff" stroke="currentColor"/>
  <defs><marker id="turn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="150" y1="112" x2="152" y2="90" stroke="currentColor" marker-end="url(#turn-arrow)"/>
  <text x="150" y="126" font-size="11" fill="currentColor" text-anchor="middle">joined on the diagonal and refolded:</text>
  <text x="150" y="139" font-size="11" fill="currentColor" text-anchor="middle">one continuous strip, ready to sew the gap</text>
</svg>

Another way to join the ends is the tucked end. Before you start, cut the starting end at 45° and
press ¼″ (7.5 mm) under along the cut. At the end, lay the tail inside the folded start, trim it
so it overlaps by about ½″ (1.5 cm), and sew across the join. It is quicker, with a slightly
bulkier join.

9. **Press.** Press the binding away from the quilt, out over the seam allowance.
10. **Turn to the back.** Fold the binding over the raw edges to the back, so its fold just covers
    the stitching line. At each corner, fold one side over first and then the other, which forms a
    miter on the front and on the back. Slip stitch the fold down by hand, or stitch in the ditch
    from the front by machine.

<svg viewBox="60 12 210 90" width="500" role="img" aria-label="Close-up cross section of the quilt edge: the folded binding's raw edges line up with the quilt's raw edge on top, the binding runs in to the stitching, folds back over itself (four layers on top), wraps around the outside of the edge, and its fold covers the stitching on the back, where a stitch in the ditch from the front catches it">
  <rect x="20" y="40" width="140" height="7" fill="#96c4e8"/>
  <rect x="20" y="47" width="140" height="16" fill="#f4ecd8" stroke="currentColor" stroke-width="0.5"/>
  <rect x="20" y="63" width="140" height="7" fill="#daa828"/>
  <path d="M160 38 H130 A5.25 5.25 0 0 1 130 27.5 H160 Q167 27.5 167 34.5 V69.5 Q167 76.5 160 76.5 H122" fill="none" style="stroke: var(--q-primary)" stroke-width="3"/>
  <path d="M160 34.5 H130 A1.75 1.75 0 0 1 130 31 H160 Q163.5 31 163.5 34.5 V69.5 Q163.5 73 160 73 H122" fill="none" style="stroke: var(--q-primary)" stroke-width="3"/>
  <path d="M122 76.5 A1.75 1.75 0 0 1 122 73" fill="none" style="stroke: var(--q-primary)" stroke-width="3"/>
  <line x1="133" y1="33" x2="133" y2="70" stroke="currentColor" stroke-width="1" stroke-dasharray="2 1.5"/>
  <line x1="121.5" y1="39" x2="121.5" y2="78" stroke="currentColor" stroke-width="1" stroke-dasharray="1 1.2"/>
  <text x="66" y="87" font-size="6" fill="currentColor">stitch in the ditch from</text>
  <text x="66" y="93" font-size="6" fill="currentColor">the front, catching the</text>
  <text x="66" y="99" font-size="6" fill="currentColor">binding on the back</text>
  <defs><marker id="xs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="112" y1="84" x2="119" y2="80" stroke="currentColor" stroke-width="0.6" marker-end="url(#xs-arrow)"/>
  <text x="112" y="19" font-size="6" fill="currentColor" text-anchor="middle">stitching, hidden</text>
  <text x="112" y="25" font-size="6" fill="currentColor" text-anchor="middle">under the fold</text>
  <line x1="120" y1="26" x2="130.5" y2="32.5" stroke="currentColor" stroke-width="0.6" marker-end="url(#xs-arrow)"/>
  <text x="178" y="32" font-size="6" fill="currentColor">four layers on top: raw edges</text>
  <text x="178" y="40" font-size="6" fill="currentColor">at the quilt's edge, then the</text>
  <text x="178" y="48" font-size="6" fill="currentColor">strip folded back over them</text>
  <text x="178" y="64" font-size="6" fill="currentColor">wraps the outside edge</text>
  <text x="178" y="80" font-size="6" fill="currentColor">the fold covers the</text>
  <text x="178" y="88" font-size="6" fill="currentColor">stitching on the back</text>
  <text x="66" y="45.6" font-size="5" fill="#333">quilt top</text>
  <text x="66" y="57" font-size="5" fill="#333">batting</text>
  <text x="66" y="68.6" font-size="5" fill="#333">backing</text>
</svg>

<svg viewBox="0 0 320 150" width="480" role="img" aria-label="A corner from the back: the binding folded over with a diagonal miter at the corner, held by the stitch in the ditch sewn from the front">
  <rect x="10" y="10" width="130" height="130" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="10,10 140,10 124,26 10,26" style="fill: var(--q-primary); filter: brightness(0.75)" stroke="currentColor"/>
  <polygon points="140,10 140,140 124,140 124,26" style="fill: var(--q-primary)" stroke="currentColor"/>
  <line x1="124" y1="26" x2="140" y2="10" stroke="#fff" stroke-width="1.5"/>
  <path d="M10 23 H127 V140" fill="none" stroke="#111" stroke-width="1.6" stroke-dasharray="1.5 1.5"/>
  <text x="155" y="118" font-size="11" fill="currentColor">the stitch in the ditch</text>
  <text x="155" y="134" font-size="11" fill="currentColor">from the front shows here</text>
  <defs><marker id="back-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="152" y1="122" x2="131" y2="122" stroke="currentColor" marker-end="url(#back-arrow)"/>
  <text x="155" y="60" font-size="11" fill="currentColor">the back: one side</text>
  <text x="155" y="76" font-size="11" fill="currentColor">folded first, then</text>
  <text x="155" y="92" font-size="11" fill="currentColor">the other, for a miter</text>
</svg>

The cut strip is usually 2 × the finished binding width plus about ¾″ (2 cm) for the seam and the
fold. A 2½″ (6 cm) strip gives a binding about ⅜″ (1 cm) wide on the front.

See [binding math](/help/math/binding) for the formula behind the strip count.

Sources: [Continuous mitered binding](https://arbeedesigns.com/pages/continuous-mitered-binding) by Arbee
Designs, and [Continuous binding](https://www.eobquiltdesign.com/continuous-binding) by EOB Quilt
Design (joining the strips). Both are also listed in [Learning to quilt](/help/resources/learning-to-quilt).
`,yt=`---
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

<svg viewBox="0 0 330 120" width="495" role="img" aria-label="A sky square, wrong side up, on the left end of the goose rectangle, right sides together, with the sewing line drawn corner to corner">
  <rect x="20" y="20" width="148" height="80" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="20" y="20" width="80" height="80" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="100" x2="100" y2="20" stroke="#333" stroke-width="1.5" stroke-dasharray="4 3"/>
  <rect x="200" y="24" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="34" font-size="11" fill="currentColor">goose, right side</text>
  <rect x="200" y="40" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="218" y="50" font-size="11" fill="currentColor">sky, wrong side</text>
  <text x="200" y="80" font-size="11" fill="currentColor">sew on the line</text>
</svg>

3. Sew on the line. Trim the corner beyond the seam to ¼″ (7.5 mm), and press the triangle
   open toward the corner.

<svg viewBox="0 0 330 120" width="495" role="img" aria-label="The same corner after sewing and trimming: both layers cut away ¼ inch beyond the seam, the sky square still wrong side up">
  <polygon points="91.5,20 168,20 168,100 20,100 20,91.5" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="20,91.5 91.5,20 100,20 100,100 20,100" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="100" x2="100" y2="20" stroke="#333" stroke-width="1.5" stroke-dasharray="4 3"/>
  <rect x="200" y="24" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="34" font-size="11" fill="currentColor">goose, right side</text>
  <rect x="200" y="40" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="218" y="50" font-size="11" fill="currentColor">sky, wrong side</text>
  <text x="200" y="76" font-size="11" fill="currentColor">sewn, then trimmed ¼″</text>
  <text x="200" y="92" font-size="11" fill="currentColor">beyond the seam</text>
</svg>

4. Repeat on the other end with the second square, so the two lines make a point at the center.

<svg viewBox="0 -24 330 128" width="495" role="img" aria-label="Both sky squares sewn, trimmed, and pressed open: sky triangles in the top corners overlap above the goose tip, where the seams cross a seam allowance below the top edge">
  <rect x="20" y="20" width="148" height="80" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="20,20 100,20 20,100" fill="#daa828" stroke="currentColor"/>
  <polygon points="168,20 88,20 168,100" fill="#daa828" stroke="currentColor"/>
  <line x1="20" y1="100" x2="100" y2="20" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="168" y1="100" x2="88" y2="20" stroke="#333" stroke-dasharray="4 3"/>
  <rect x="200" y="24" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="34" font-size="11" fill="currentColor">goose, right side</text>
  <rect x="200" y="40" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="218" y="50" font-size="11" fill="currentColor">sky, right side</text>
  <defs><marker id="geese-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="94" y1="8" x2="94" y2="21" stroke="currentColor" marker-end="url(#geese-arrow)"/>
  <text x="94" y="-12" font-size="11" fill="currentColor" text-anchor="middle">the seams cross ¼″ below the top,</text>
  <text x="94" y="3" font-size="11" fill="currentColor" text-anchor="middle">leaving room for the seam</text>
</svg>

## Four at a time

1. Draw a diagonal line on the back of each small square.
2. Put two small squares on opposite corners of the large square, right sides together, flush with
   its edges. For a more exact fit, nudge them in by 3 or 4 threads. The squares overlap a little in
   the middle, and their lines join into one line from corner to corner.
3. Sew a scant ¼″ (7.5 mm) on both sides of the line. Cut on the line and press the seams open.
   You have two pieces.

<svg viewBox="0 0 330 140" width="495" role="img" aria-label="Two sky squares, wrong side up, on opposite corners of the large goose square, overlapping in the middle, with a sewing line on each side of the diagonal and the cutting line on it">
  <rect x="20" y="10" width="120" height="120" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="20" y="10" width="66" height="66" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <rect x="74" y="64" width="66" height="66" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="10" x2="140" y2="130" stroke="#333" stroke-width="1.5"/>
  <line x1="26" y1="4" x2="146" y2="124" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="14" y1="16" x2="134" y2="136" stroke="#333" stroke-dasharray="4 3"/>
  <rect x="160" y="20" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="178" y="30" font-size="11" fill="currentColor">goose, right side</text>
  <rect x="160" y="36" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="178" y="46" font-size="11" fill="currentColor">sky, wrong side</text>
  <text x="160" y="80" font-size="11" fill="currentColor">sew both dashed lines,</text>
  <text x="160" y="96" font-size="11" fill="currentColor">cut on the solid line</text>
</svg>

4. Put a small square on the open corner of each piece (the corner of the large square),
   right sides together, with its line running from that corner to the point between the two small
   triangles.
5. Sew a scant ¼″ on both sides of the line again, cut on the line, and press the seams open. You
   have four units.

<svg viewBox="0 0 370 160" width="555" role="img" aria-label="One of the two pieces after pressing: the goose triangle with a sky triangle pressed out from each end of its long side, overlapping a little in the middle, and a third sky square, wrong side up, on the open corner, with its line running toward the point between the sky triangles">
  <g transform="translate(20 -8) rotate(-45 80 70)">
    <polygon points="20,10 20,130 140,130" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
    <polygon points="20,10 86,10 86,76" fill="#daa828" stroke="currentColor"/>
    <polygon points="74,64 140,64 140,130" fill="#daa828" stroke="currentColor"/>
    <rect x="20" y="64" width="66" height="66" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
    <line x1="20" y1="130" x2="86" y2="64" stroke="#333" stroke-width="1.5"/>
    <line x1="24.2" y1="134.2" x2="90.2" y2="68.2" stroke="#333" stroke-dasharray="4 3"/>
    <line x1="15.8" y1="125.8" x2="81.8" y2="59.8" stroke="#333" stroke-dasharray="4 3"/>
  </g>
  <rect x="205" y="20" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="223" y="30" font-size="11" fill="currentColor">goose, right side</text>
  <rect x="205" y="36" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="223" y="46" font-size="11" fill="currentColor">sky, right side</text>
  <rect x="205" y="52" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="223" y="62" font-size="11" fill="currentColor">sky, wrong side</text>
  <text x="205" y="96" font-size="11" fill="currentColor">sew both dashed lines,</text>
  <text x="205" y="112" font-size="11" fill="currentColor">cut on the solid line</text>
</svg>

<svg viewBox="0 0 400 165" width="600" role="img" aria-label="The heart cut apart into two flying geese: on the left one not yet pressed, its sky piece still wrong side up; on the right one pressed open, its sky triangle flipped over to the right side">
  <g>
    <polygon points="15.1,62.0 100.0,146.9 100.0,62.0" style="fill: var(--q-primary)" stroke="currentColor"/>
    <polygon points="15.1,62.0 61.8,15.3 100.0,53.5 100.0,62.0" fill="#daa828" stroke="currentColor"/>
    <polygon points="91.5,62.0 100.0,53.5 100.0,62.0" fill="#daa828" stroke="currentColor"/>
    <polygon points="53.3,100.2 100.0,53.5 100.0,146.9" fill="#f6e7bd" stroke="currentColor"/>
    <line x1="94.0" y1="59.5" x2="94.0" y2="140.9" stroke="#333" stroke-dasharray="4 3"/>
  </g>
  <g transform="translate(60 0)">
    <polygon points="100.0,146.9 184.9,62.0 100.0,62.0" style="fill: var(--q-primary)" stroke="currentColor"/>
    <polygon points="100.0,53.5 108.5,62.0 100.0,62.0" fill="#daa828" stroke="currentColor"/>
    <polygon points="100.0,53.5 138.2,15.3 184.9,62.0 100.0,62.0" fill="#daa828" stroke="currentColor"/>
    <polygon points="100.0,53.5 53.3,100.2 100.0,146.9" fill="#daa828" stroke="currentColor"/>
  </g>
  <text x="60.0" y="160" font-size="11" fill="currentColor" text-anchor="middle">not pressed yet</text>
  <text x="210.0" y="160" font-size="11" fill="currentColor" text-anchor="middle">pressed open</text>
  <rect x="290" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="308" y="40" font-size="11" fill="currentColor">goose</text>
  <rect x="290" y="46" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="308" y="56" font-size="11" fill="currentColor">sky, right side</text>
  <rect x="290" y="62" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="308" y="72" font-size="11" fill="currentColor">sky, wrong side</text>
</svg>

6. Trim each unit to 4½″ × 2½″ (11.5 × 6.5 cm), the finished size plus a seam allowance on every
   side. Line up the 45° line of your ruler with the goose's point and keep ¼″ (7.5 mm) above the
   point.

To reduce bulk at the goose points, trim off the overlap where the two small squares cross in
step 2, so they meet edge to edge, before sewing.

Sources: [the four-at-a-time flying geese tutorial and sizing tables](https://quiltingjetgirl.com/2022/09/30/updated-four-at-a-time-flying-geese-tutorial-and-sizing-tables/)
by Quilting Jetgirl and [how to reduce bulk in four-at-a-time flying geese](https://thecraftyquilter.com/2022/05/how-to-reduce-bulk-in-4-at-a-time-flying-geese/) by The Crafty
Quilter, also listed in [Learning to quilt](/help/resources/learning-to-quilt).
`,bt=`---
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

<svg viewBox="0 0 300 110" width="450" role="img" aria-label="The light square, wrong side up, on the dark square, right sides together, with a diagonal line and a stitching line on each side">
  <rect x="22" y="12" width="90" height="90" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="20" y="10" width="90" height="90" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="#333"/>
  <line x1="20" y1="90" x2="100" y2="10" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="30" y1="100" x2="110" y2="20" stroke="#333" stroke-dasharray="4 3"/>
  <rect x="130" y="14" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="148" y="24" font-size="11" fill="currentColor">light fabric, wrong side</text>
  <rect x="130" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="148" y="40" font-size="11" fill="currentColor">dark fabric, right side</text>
  <text x="130" y="70" font-size="11" fill="currentColor">sew both dashed lines,</text>
  <text x="130" y="86" font-size="11" fill="currentColor">cut on the solid line</text>
</svg>

3. Cut on the drawn line and press each unit open toward the darker fabric.

<svg viewBox="0 0 300 46" width="450" role="img" aria-label="Two half-square triangle units pressed open, right sides up">
  <polygon points="20,10 46,10 20,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="46,10 46,36 20,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="54,10 80,10 54,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="80,10 80,36 54,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="170" y="10" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="188" y="20" font-size="11" fill="currentColor">light fabric, right side</text>
  <rect x="170" y="26" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="188" y="36" font-size="11" fill="currentColor">dark fabric, right side</text>
</svg>

## Four at a time

1. Draw both diagonals on the back of the lighter square.
2. Put the squares right sides together and sew ¼″ (7.5 mm) inside the edge, all the way around.

<svg viewBox="0 0 300 110" width="450" role="img" aria-label="The light square, wrong side up, on the dark square, with both diagonals drawn and a stitching line all around the edge">
  <rect x="22" y="12" width="90" height="90" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="20" y="10" width="90" height="90" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <rect x="28" y="18" width="74" height="74" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="20" y1="10" x2="110" y2="100" stroke="#333"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="#333"/>
  <rect x="130" y="14" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="148" y="24" font-size="11" fill="currentColor">light fabric, wrong side</text>
  <rect x="130" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="148" y="40" font-size="11" fill="currentColor">dark fabric, right side</text>
  <text x="130" y="70" font-size="11" fill="currentColor">sew the dashed line,</text>
  <text x="130" y="86" font-size="11" fill="currentColor">cut on the solid lines</text>
</svg>

3. Cut along both diagonals to get four units, and press each open toward the darker fabric.

<svg viewBox="0 0 300 46" width="450" role="img" aria-label="Four half-square triangle units pressed open, right sides up">
  <polygon points="20,10 46,10 20,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="46,10 46,36 20,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="54,10 80,10 54,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="80,10 80,36 54,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="88,10 114,10 88,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="114,10 114,36 88,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="122,10 148,10 122,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="148,10 148,36 122,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="170" y="10" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="188" y="20" font-size="11" fill="currentColor">light fabric, right side</text>
  <rect x="170" y="26" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="188" y="36" font-size="11" fill="currentColor">dark fabric, right side</text>
</svg>

## Eight at a time

1. Draw both diagonals on the back of the lighter square.
2. Put the squares right sides together and sew ¼″ (7.5 mm) on both sides of each diagonal.

<svg viewBox="0 0 300 110" width="450" role="img" aria-label="The light square, wrong side up, on the dark square, with both diagonals drawn and a stitching line on each side of each diagonal">
  <rect x="22" y="12" width="90" height="90" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="20" y="10" width="90" height="90" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="20" y1="10" x2="110" y2="100" stroke="#333"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="#333"/>
  <line x1="20" y1="22" x2="98" y2="100" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="32" y1="10" x2="110" y2="88" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="20" y1="88" x2="98" y2="10" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="32" y1="100" x2="110" y2="22" stroke="#333" stroke-dasharray="4 3"/>
  <rect x="130" y="14" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="148" y="24" font-size="11" fill="currentColor">light fabric, wrong side</text>
  <rect x="130" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="148" y="40" font-size="11" fill="currentColor">dark fabric, right side</text>
  <text x="130" y="70" font-size="11" fill="currentColor">sew the dashed lines</text>
</svg>

3. Cut the square in half both ways (through the middle, parallel to the sides), then cut along
   both diagonals. That makes eight units.

<svg viewBox="0 0 300 110" width="450" role="img" aria-label="The cutting lines on the sewn squares: through the middle both ways and along both diagonals">
  <rect x="22" y="12" width="90" height="90" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="20" y="10" width="90" height="90" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="65" y1="10" x2="65" y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="20" y1="55" x2="110" y2="55" stroke="#333" stroke-width="1.5"/>
  <line x1="20" y1="10" x2="110" y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="20" y1="100" x2="110" y2="10" stroke="#333" stroke-width="1.5"/>
  <rect x="130" y="14" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="148" y="24" font-size="11" fill="currentColor">light fabric, wrong side</text>
  <rect x="130" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="148" y="40" font-size="11" fill="currentColor">dark fabric, right side</text>
  <text x="130" y="70" font-size="11" fill="currentColor">cut on all four lines</text>
</svg>

<svg viewBox="0 0 300 78" width="450" role="img" aria-label="Eight half-square triangle units pressed open, right sides up">
  <polygon points="20,10 46,10 20,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="46,10 46,36 20,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="54,10 80,10 54,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="80,10 80,36 54,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="88,10 114,10 88,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="114,10 114,36 88,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="122,10 148,10 122,36" fill="#daa828" stroke="currentColor"/>
  <polygon points="148,10 148,36 122,36" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="20,44 46,44 20,70" fill="#daa828" stroke="currentColor"/>
  <polygon points="46,44 46,70 20,70" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="54,44 80,44 54,70" fill="#daa828" stroke="currentColor"/>
  <polygon points="80,44 80,70 54,70" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="88,44 114,44 88,70" fill="#daa828" stroke="currentColor"/>
  <polygon points="114,44 114,70 88,70" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="122,44 148,44 122,70" fill="#daa828" stroke="currentColor"/>
  <polygon points="148,44 148,70 122,70" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="170" y="10" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="188" y="20" font-size="11" fill="currentColor">light fabric, right side</text>
  <rect x="170" y="26" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="188" y="36" font-size="11" fill="currentColor">dark fabric, right side</text>
</svg>

4. Press each unit open toward the darker fabric, then trim to size.

<svg viewBox="0 0 330 100" width="495" role="img" aria-label="One unit as cut, light fabric wrong side up with the seam along the long side, and the same unit pressed open: a square with dog ears at two corners and the trim line dashed">
  <polygon points="20,14 20,84 90,84" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="28" y1="34" x2="70" y2="76" stroke="#333" stroke-dasharray="4 3"/>
  <text x="55" y="98" font-size="11" fill="currentColor" text-anchor="middle">as cut</text>
  <polygon points="130,18 130,80 192,80" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="130,18 192,18 192,80" fill="#daa828" stroke="currentColor"/>
  <polygon points="130,18 124,12 136,12" fill="#daa828" stroke="currentColor"/>
  <polygon points="192,80 198,86 198,74" fill="#daa828" stroke="currentColor"/>
  <rect x="133" y="21" width="56" height="56" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <text x="161" y="98" font-size="11" fill="currentColor" text-anchor="middle">pressed, trim to the dashes</text>
  <rect x="225" y="14" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="243" y="24" font-size="11" fill="currentColor">light fabric, wrong side</text>
  <rect x="225" y="30" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="243" y="40" font-size="11" fill="currentColor">light fabric, right side</text>
  <rect x="225" y="46" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="243" y="56" font-size="11" fill="currentColor">dark fabric, right side</text>
</svg>
`,xt=`---
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

<svg viewBox="0 0 330 110" width="495" role="img" aria-label="The center square and a corner triangle, right sides up, with the middle of their sides marked">
  <rect x="10" y="20" width="70" height="70" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="45" cy="20" r="3" fill="#333" stroke="#fff"/>
  <polygon points="100,90 180,90 140,50" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="140" cy="90" r="3" fill="#333" stroke="#fff"/>
  <text x="95" y="106" font-size="11" fill="currentColor" text-anchor="middle">match the marks</text>
  <rect x="200" y="20" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="30" font-size="11" fill="currentColor">center, right side</text>
  <rect x="200" y="36" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="218" y="46" font-size="11" fill="currentColor">corners, right side</text>
</svg>

3. Sew a triangle to two opposite sides of the center, matching the marks. Press the seams toward
   the triangles.

<svg viewBox="0 0 330 110" width="495" role="img" aria-label="Before pressing: a corner triangle, wrong side up, on the left and right sides of the center square, right sides together, long sides along the edges and centered, with the seam a quarter inch in from each edge">
  <rect x="71.2" y="21.2" width="67.5" height="67.5" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="71.2,14.3 71.2,95.7 111.9,55" fill="#f6e7bd" stroke="currentColor"/>
  <polygon points="138.8,14.3 138.8,95.7 98.1,55" fill="#f6e7bd" stroke="currentColor"/>
  <line x1="76.2" y1="19.3" x2="76.2" y2="90.7" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="133.8" y1="19.3" x2="133.8" y2="90.7" stroke="#333" stroke-dasharray="4 3"/>
  <rect x="200" y="20" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="30" font-size="11" fill="currentColor">center, right side</text>
  <rect x="200" y="36" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="218" y="46" font-size="11" fill="currentColor">corners, wrong side</text>
  <text x="200" y="76" font-size="11" fill="currentColor">sew the dashed lines</text>
</svg>

<svg viewBox="0 0 330 110" width="495" role="img" aria-label="The center square with a corner triangle sewn to the left and right sides and pressed out. The triangles run a little past the center's corners">
  <polygon points="76.2,19.3 71.2,14.3 71.2,95.7 76.2,90.7" fill="#f6e7bd" stroke="currentColor"/>
  <polygon points="133.8,19.3 138.8,14.3 138.8,95.7 133.8,90.7" fill="#f6e7bd" stroke="currentColor"/>
  <rect x="76.2" y="21.2" width="57.5" height="67.5" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="76.2,19.3 76.2,90.7 40.6,55" fill="#daa828" stroke="currentColor"/>
  <polygon points="133.8,19.3 133.8,90.7 169.4,55" fill="#daa828" stroke="currentColor"/>
  <rect x="200" y="20" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="30" font-size="11" fill="currentColor">center, right side</text>
  <rect x="200" y="36" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="218" y="46" font-size="11" fill="currentColor">corners, right side</text>
  <rect x="200" y="52" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="218" y="62" font-size="11" fill="currentColor">corners, wrong side (seam allowance)</text>
</svg>

4. Sew the other two triangles to the remaining sides in the same way, and press toward them.

<svg viewBox="0 0 330 110" width="495" role="img" aria-label="The unit with triangles on all four sides: the center's points sit a seam allowance in from each edge, on the dashed finished size">
  <rect x="60.0" y="10.0" width="90.0" height="90.0" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="105,15.0 145.0,55 105,95.0 65.0,55" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="65.0" y="15.0" width="80.0" height="80.0" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <rect x="200" y="20" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="30" font-size="11" fill="currentColor">center, right side</text>
  <rect x="200" y="36" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="218" y="46" font-size="11" fill="currentColor">corners, right side</text>
  <text x="200" y="76" font-size="11" fill="currentColor">the points sit ¼″ inside the edge,</text>
  <text x="200" y="92" font-size="11" fill="currentColor">on the finished size (dashed)</text>
</svg>

5. Trim the unit to the finished size plus a seam allowance on each side. In
   this example that is a 4½″ (11.5 cm) square. The points of the center square sit ¼″ (7.5 mm) in from each edge.
`;function St(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var F=St();function Ct(e){F=e}var I={exec:()=>null};function L(e){let t=[];return n=>{let r=Math.max(0,Math.min(3,n-1)),i=t[r];return i||(i=e(r),t[r]=i),i}}function R(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(z.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var wt=((e=``)=>{try{return!!RegExp(`(?<=1)(?<!1)`+e)}catch{return!1}})(),z={codeRemoveIndent:/^(?: {0,3}\t| {1,4})/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,endingSpaceTabChar:/[ \t]$/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,leadingSpaceTab:/^[ \t]+/,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,numericCharacterReference:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,numericCharacterReferenceOrAmpersand:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:L(e=>RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:L(e=>RegExp(`^ {0,${e}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),fencesBeginRegex:L(e=>RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),headingBeginRegex:L(e=>RegExp(`^ {0,${e}}#`)),htmlBeginRegex:L(e=>RegExp(`^ {0,${e}}(?:</?(?:${V})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`,`i`)),blockquoteBeginRegex:L(e=>RegExp(`^ {0,${e}}>`))},Tt=/^(?:[ \t]*(?:\n|$))+/,Et=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Dt=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,B=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Ot=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,kt=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,At=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,jt=R(At).replace(/bull/g,kt).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),Mt=R(At).replace(/bull/g,kt).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Nt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,Pt=/^[^\n]+/,Ft=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,It=R(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,Ft).replace(`title`,/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Lt=R(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,kt).getRegex(),V=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,Rt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,zt=R(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,Rt).replace(`tag`,V).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Bt=e=>R(Nt).replace(`hr`,B).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,e).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,V).getRegex(),Vt=Bt(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),Ht=Bt(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),Ut={blockquote:R(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace(`paragraph`,Ht).getRegex(),code:Et,def:It,fences:Dt,heading:Ot,hr:B,html:zt,lheading:jt,list:Lt,newline:Tt,paragraph:Vt,table:I,text:Pt},Wt=R(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,B).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,V).getRegex(),Gt={...Ut,lheading:Mt,table:Wt,paragraph:R(Nt).replace(`hr`,B).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,Wt).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,V).getRegex()},Kt={...Ut,html:R(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace(`comment`,Rt).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:I,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:R(Nt).replace(`hr`,B).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,jt).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},qt=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Jt=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Yt=/^( {2,}|\\)\n(?!\s*$)[ \t]*/,Xt=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,H=/[\p{P}\p{S}]/u,U=/[\s\p{P}\p{S}]/u,W=/[^\s\p{P}\p{S}]/u,Zt=R(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,U).getRegex(),Qt=/[\p{Pi}\p{Ps}"']/u,$t=/(?!~)[\p{P}\p{S}]/u,en=/(?!~)[\s\p{P}\p{S}]/u,tn=/(?:[^\s\p{P}\p{S}]|~)/u,nn=R(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,wt?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),rn=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,an=R(rn,`u`).replace(/punct/g,H).getRegex(),on=R(rn,`u`).replace(/punct/g,$t).getRegex(),sn=R(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,`u`).replace(/openQuote/g,Qt).replace(/punct/g,H).getRegex(),cn=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,ln=R(cn,`gu`).replace(/notPunctSpace/g,W).replace(/punctSpace/g,U).replace(/punct/g,H).getRegex(),un=R(cn,`gu`).replace(/notPunctSpace/g,tn).replace(/punctSpace/g,en).replace(/punct/g,$t).getRegex(),dn=R(`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,W).replace(/punctSpace/g,U).replace(/punct/g,H).getRegex(),fn=R(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,W).replace(/punctSpace/g,U).replace(/punct/g,H).getRegex(),pn=R(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,W).replace(/punctSpace/g,U).replace(/punct/g,H).getRegex(),mn=R(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,H).getRegex(),hn=R(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,W).replace(/punctSpace/g,U).replace(/punct/g,H).getRegex(),gn=R(/\\(punct)/,`gu`).replace(/punct/g,H).getRegex(),_n=R(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/,`gu`).replace(/punct/g,H).getRegex(),vn=R(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),yn=R(Rt).replace(`(?:-->|$)`,`-->`).getRegex(),bn=R(`^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,yn).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),xn=/\[(?:\\[\s\S]|[^\[\]\\])*\]/,Sn=R(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace(`brackets`,xn).getRegex(),Cn=R(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace(`label`,Sn).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace(`title`,/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),wn=R(/^!?\[(label)\]\[(ref)\]/).replace(`label`,Sn).replace(`ref`,Ft).getRegex(),Tn=R(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,Ft).getRegex(),En=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,Dn=R(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace(`brackets`,xn).getRegex(),On=R(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,R(/^!?\[(label)\]\[(ref)\]/).replace(`label`,Dn).replace(`ref`,En).getRegex()).replace(`nolink`,R(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,En).getRegex()).getRegex(),kn=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,An=R(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g,/[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),jn={_backpedal:I,anyPunctuation:gn,anyPunctuationOutsideCode:_n,autolink:vn,blockSkip:nn,br:Yt,code:Jt,del:I,delLDelim:I,delRDelim:I,emStrongLDelim:an,emStrongRDelimAst:ln,emStrongRDelimUnd:fn,escape:qt,link:Cn,nolink:Tn,punctuation:Zt,reflink:wn,reflinkSearch:On,tag:bn,text:Xt,url:I},Mn={...jn,emStrongLDelim:sn,emStrongRDelimAst:dn,emStrongRDelimUnd:pn,link:R(/^!?\[(label)\]\((.*?)\)/).replace(`label`,Sn).getRegex(),reflink:R(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,Sn).getRegex()},Nn={...jn,emStrongRDelimAst:un,emStrongLDelim:on,delLDelim:mn,delRDelim:hn,url:R(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`emailProtocol`,An).replace(`protocol`,kn).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:R(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace(`protocol`,kn).replace(/emailProtocol/g,/(?:mailto|xmpp):/).getRegex()},Pn={...Nn,br:R(Yt).replace(`{2,}`,`*`).getRegex(),text:R(Nn.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},Fn={normal:Ut,gfm:Gt,pedantic:Kt},G={normal:jn,gfm:Nn,breaks:Pn,pedantic:Mn},In={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},Ln=e=>In[e];function K(e,t){if(t){if(z.escapeTest.test(e))return e.replace(z.escapeReplace,Ln)}else if(z.escapeTestNoEncode.test(e))return e.replace(z.escapeReplaceNoEncode,Ln);return e}function Rn(e){return z.numericCharacterReference.test(e)?e.replace(z.numericCharacterReferenceOrAmpersand,(e,t,n)=>{if(t===void 0&&n===void 0)return`&amp;`;let r=t===void 0?Number.parseInt(n,16):Number.parseInt(t,10);return r===0||r>1114111||r>=55296&&r<=57343?`�`:r===38?`&amp;`:String.fromCodePoint(r)}):e}function zn(e){try{e=encodeURI(e).replace(z.percentDecode,`%`)}catch{return null}return e}function Bn(e,t){let n=e.replace(z.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(z.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t){if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``)}for(;r<n.length;r++)n[r]=n[r].trim().replace(z.slashPipe,`|`);return n}function q(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function Vn(e){let t=e.split(`
`),n=t.length-1;for(;n>=0&&z.blankLine.test(t[n]);)n--;return t.length-n<=2?e:t.slice(0,n+1).join(`
`)}function Hn(e){return e.trim().toLowerCase().toUpperCase().toLowerCase()}function Un(e,t){if(e.indexOf(t[0])===-1&&e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}function Wn(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function Gn(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`),c=e[0].charAt(0)===`!`,l=r.state.inLink,u=r.state.linkEmitted,d=r.state.inRawBlock;r.state.inLink=!0,r.state.linkEmitted=!1;let f=r.inlineTokens(s),p=r.state.linkEmitted;if(r.state.linkEmitted=u,r.state.inLink=l,!c){if(p){r.state.inRawBlock=d;return}r.state.linkEmitted=!0}return{type:c?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:f}}function Kn(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return e.slice(Math.min(r.length,i.length))}).join(`
`)}function qn(e,t,n,r){if(!t.includes(`<`))return!1;for(let i=0;i<t.length;i++){if(t[i]===`\\`){i++;continue}if(t[i]==="`"){let e=r.inline.code.exec(t.slice(i));if(e){i+=e[0].length-1;continue}}if(t[i]!==`<`)continue;let a=e.slice(n+i),o=r.inline.tag.exec(a)||r.inline.autolink.exec(a);if(o){if(o[0].length>t.length-i)return!0;i+=o[0].length-1}}return!1}var Jn=class{options;rules;lexer;constructor(e){this.options=e||F}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=this.options.pedantic?t[0]:Vn(t[0]);return{type:`code`,raw:e,codeBlockStyle:`indented`,text:e.replace(this.rules.other.codeRemoveIndent,``)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=Kn(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=q(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceTabChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:q(t[0],`
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
`,1)[0],d=t[1].length,f=this.options.pedantic?Wn(u,d):u.replace(this.rules.other.leadingSpaceTab,e=>Wn(e,d)),p=e.split(`
`,1)[0],m=!f.trim(),h=0;if(this.options.pedantic?(h=2,a=f.trimStart()):m?h=d+1:(h=f.search(this.rules.other.nonSpaceChar),h=h>4?1:h,a=f.slice(h),h+=d),m&&this.rules.other.blankLine.test(p)&&(e=e.substring(p.length+1),i=!0),!i){let t=this.rules.other.nextBulletRegex(h),n=this.rules.other.hrRegex(h),r=this.rules.other.fencesBeginRegex(h),i=this.rules.other.headingBeginRegex(h),o=this.rules.other.htmlBeginRegex(h),s=this.rules.other.blockquoteBeginRegex(h);for(;e;){let c=e.split(`
`,1)[0],l;if(p=c,this.options.pedantic?(p=p.replace(this.rules.other.listReplaceNesting,`  `),l=p):l=p.replace(this.rules.other.leadingSpaceTab,e=>Wn(e)),r.test(p)||i.test(p)||o.test(p)||s.test(p)||t.test(p)||n.test(p))break;if(l.search(this.rules.other.nonSpaceChar)>=h||!p.trim())a+=`
`+l.slice(h);else{if(m||f.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||r.test(f)||i.test(f)||n.test(f))break;a+=`
`+p}m=!p.trim(),e=e.substring(c.length+1),f=l.slice(h)}}let g=n.slice(l,r());o.loose||(c?o.loose=!0:this.rules.other.doubleBlankLine.test(g)&&(c=!0)),o.items.push({type:`list_item`,raw:g,task:!!this.options.gfm&&this.rules.other.listIsTask.test(a),loose:!1,text:a,tokens:[]})}let l=o.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;o.raw=n.slice(0,r()).trimEnd();for(let e of o.items)if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),!o.loose){let t=e.tokens.filter(e=>e.type===`space`);o.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}for(let e of o.items){let t=e.tokens[0];if(e.task&&(t?.type===`text`||t?.type===`paragraph`)){e.text=e.text.replace(this.rules.other.listReplaceTask,``),t.raw=t.raw.replace(this.rules.other.listReplaceTask,``),t.text=t.text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}let n=this.rules.other.listTaskCheckbox.exec(e.raw);if(n){let t={type:`checkbox`,raw:n[0]+` `,checked:n[0]!==`[ ]`};e.checked=t.checked,o.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=t.raw+e.tokens[0].raw,e.tokens[0].text=t.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(t)):e.tokens.unshift({type:`paragraph`,raw:t.raw,text:t.raw,tokens:[t]}):e.tokens.unshift(t)}}else e.task&&=!1}if(o.loose)for(let e of o.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return o}}html(e){let t=this.rules.block.html.exec(e);if(t){let e=Vn(t[0]);return{type:`html`,block:!0,raw:e,pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:e}}}def(e){let t=this.rules.block.def.exec(e);if(t){if(!this.rules.other.startAngleBracket.test(t[2])&&Un(t[2],`()`)!==-1)return;let e=Hn(t[1]).replace(this.rules.other.multipleSpaceGlobal,` `),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:q(t[0],`
`),href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=Bn(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:q(t[0],`
`),header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(Bn(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:q(t[0],`
`),depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){if(this.lexer.state.linkParenPossible===!1)return;let t=this.rules.inline.link.exec(e);if(t){let n=t[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&qn(e,t[1],n,this.rules))return;let r=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let e=q(r.slice(0,-1),`\\`);if((r.length-e.length)%2==0)return}else{let e=Un(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let i=t[2],a=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(i);e&&(i=e[1],a=e[3])}else a=t[3]?t[3].slice(1,-1):``;return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(i=this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?i.slice(1):i.slice(1,-1)),Gn(t,{href:i&&i.replace(this.rules.inline.anyPunctuation,`$1`),title:a&&a.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=n[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&qn(e,n[1],r,this.rules))return;let i=t[Hn((n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal,` `))];if(!i){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return Gn(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[3])||!n||this.rules.inline.punctuation.exec(n))){let i=[...r[0]].length-1,a,o,s=i,c=0,l=r[0][0],u=n===l,d=l===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(d.lastIndex=0,t=t.slice(-1*e.length+i);(r=d.exec(t))!==null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a)continue;if(o=[...a].length,r[3]||r[4]){s+=o;continue}if(r[5]||r[6]){if(i%3&&!((i+o)%3)){c+=o;continue}if(u)break}if(s-=o,s>0)continue;o=Math.min(o,o+s+c);let t=[...r[0]][0].length,n=e.slice(0,i+r.index+t+o);if(Math.min(i,o)%2){let e=n.slice(1,-1);return{type:`em`,raw:n,text:e,tokens:this.lexer.inlineTokens(e)}}let l=n.slice(2,-2);return{type:`strong`,raw:n,text:l,tokens:this.lexer.inlineTokens(l)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim;for(s.lastIndex=0,t=t.slice(-1*e.length+n);(r=s.exec(t))!==null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:e?t[0]:Rn(t[0]),escaped:e}}}},J=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||F,this.options.tokenizer=this.options.tokenizer||new Jn,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,linkParenPossible:!0,top:!0};let t={other:z,block:Fn.normal,inline:G.normal};this.options.pedantic?(t.block=Fn.pedantic,t.inline=G.pedantic):this.options.gfm&&(t.block=Fn.gfm,t.inline=this.options.breaks?G.breaks:G.gfm),this.tokenizer.rules=t}static get rules(){return{block:Fn,inline:G}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(z.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(z.tabCharGlobal,`    `).replace(z.spaceLine,``));let r=1/0;for(;e;){if(e.length<r)r=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let i;if(this.options.extensions?.block?.some(n=>(i=n.call({lexer:this},e,t))?(e=e.substring(i.raw.length),t.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let n=t.at(-1);i.raw.length===1&&n!==void 0?n.raw+=`
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
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(i)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes(`[`))return!1;let t=this.tokenizer.rules.inline.link;for(let n of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(n[0])&&e.charAt(n.index-1)!==`!`)return!0;for(let t of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let e=t[0],n=e.lastIndexOf(`[`);if(e.charAt(0)!==`!`&&Object.hasOwn(this.tokens.links,Hn(e.slice(n+1,-1)))&&!(n>1&&this.linkInText(e.slice(1,n-1))))return!0}return!1}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=this.state.linkParenPossible;this.state.linkParenPossible=n&&e.includes(`)`);try{return this.#e(e,t)}finally{this.state.linkParenPossible=n}}#e(e,t){let n=e;if(this.tokens.links&&e.includes(`[`)){let e=this.tokenizer.rules.inline.reflinkSearch,t=n=>{let r=n.lastIndexOf(`[`);if(!Object.hasOwn(this.tokens.links,Hn(n.slice(r+1,-1))))return n;if(r>1&&n.charAt(0)!==`!`){let i=n.slice(1,r-1);if(this.linkInText(i))return`[`+i.replace(e,t)+`][`+`a`.repeat(n.length-r-2)+`]`}return`[`+`a`.repeat(n.length-2)+`]`};n=n.replace(e,t)}n=n.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode,(e,t,n)=>n?`+`.repeat(e.length):t?t+e.slice(t.length,-t.length).replace(/`/g,`+`)+t:e),n=n.replace(this.tokenizer.rules.inline.blockSkip,(e,t,n)=>{let r=n?n.length:0;return e.slice(0,r)+`[`+`a`.repeat(e.length-r-2)+`]`}),n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let r=!1,i=``,a=1/0;for(;e;){if(e.length<a)a=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}r||(i=``),r=!1;let o;if(this.options.extensions?.inline?.some(n=>(o=n.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if((o=this.tokenizer.escape(e))||(o=this.tokenizer.tag(e))||(o=this.tokenizer.link(e))){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let n=t.at(-1);o.type===`text`&&n?.type===`text`?(n.raw+=o.raw,n.text+=o.text):t.push(o);continue}if((o=this.tokenizer.emStrong(e,n,i))||(o=this.tokenizer.codespan(e))||(o=this.tokenizer.br(e))||(o=this.tokenizer.del(e,n,i))||(o=this.tokenizer.autolink(e))||!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),t.push(o);continue}let s=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(o=this.tokenizer.inlineText(s)){e=e.substring(o.raw.length),o.raw.slice(-1)!==`_`&&(i=o.raw.slice(-1)),r=!0;let n=t.at(-1);n?.type===`text`?(n.raw+=o.raw,n.text+=o.text):t.push(o)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return t}infiniteLoopError(e){let t=`Infinite loop on byte: `+e;if(this.options.silent)console.error(t);else throw Error(t)}},Yn=class{options;parser;constructor(e){this.options=e||F}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(z.notSpaceStart)?.[0],i=e?e.replace(z.endingNewline,``)+`
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
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${K(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,text:n,tokens:r,autolink:i}){let a=i?K(n,!0):this.parser.parseInline(r),o=zn(e);if(o===null)return a;e=K(o,i);let s=`<a href="`+e+`"`;return t&&(s+=` title="`+K(t)+`"`),s+=`>`+a+`</a>`,s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=zn(e);if(i===null)return K(n);e=i;let a=`<img src="${K(e)}" alt="${K(n)}"`;return t&&(a+=` title="${K(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:K(e.text)}},Xn=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return``+e}image({text:e}){return``+e}br(){return``}checkbox({raw:e}){return e}},Y=class e{options;renderer;textRenderer;constructor(e){this.options=e||F,this.options.renderer=this.options.renderer||new Yn,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Xn}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`checkbox`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n||``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`checkbox`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e||``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},X=class{options;block;constructor(e){this.options=e||F}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(e=this.block){return e?J.lex:J.lexInline}provideParser(e=this.block){return e?Y.parse:Y.parseInline}};function Z(e,t){if(Array.isArray(t))for(let n=0;n<t.length;n++)e.push(t[n]);else e.push(t)}var Q=new class{defaults=St();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Y;Renderer=Yn;TextRenderer=Xn;Lexer=J;Tokenizer=Jn;Hooks=X;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(Z(n,t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)Z(n,this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)Z(n,this.walkTokens(e.tokens,t));break}case`list`:{let e=r;Z(n,this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);Z(n,this.walkTokens(i,t))}):e.tokens&&Z(n,this.walkTokens(e.tokens,t))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new Yn(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n||``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new Jn(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new X;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];t[r]=X.passThroughHooks.has(n)?e=>{if(this.defaults.async&&X.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:(...e)=>{if(this.defaults.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&Z(n,t.call(this,e)),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return J.lex(e,t??this.defaults)}parser(e,t){return Y.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer(e):e?J.lex:J.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser(e):e?Y.parse:Y.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer(e):e?J.lex:J.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser(e):e?Y.parse:Y.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+K(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function $(e,t){return Q.parse(e,t)}$.options=$.setOptions=function(e){return Q.setOptions(e),$.defaults=Q.defaults,Ct($.defaults),$},$.getDefaults=St,$.defaults=F;function Zn(...e){return Q.use(...e),$.defaults=Q.defaults,Ct($.defaults),$}$.use=Zn,$.walkTokens=function(e,t){return Q.walkTokens(e,t)},$.parseInline=Q.parseInline,$.Parser=Y,$.parser=Y.parse,$.Renderer=Yn,$.TextRenderer=Xn,$.Lexer=J,$.lexer=J.lex,$.Tokenizer=Jn,$.Hooks=X,$.parse=$,$.options,$.setOptions,$.walkTokens,$.parseInline,Y.parse,J.lex;var Qn=[{id:`guides`,label:`App Guides`,icon:`menu_book`},{id:`math`,label:`Quilt Math`,icon:`calculate`},{id:`techniques`,label:`Techniques`,icon:`content_cut`},{id:`resources`,label:`Resources`,icon:`link`}],$n=e=>e.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``);function er(e){let t=/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(e),n={};for(let e of(t?.[1]??``).split(/\r?\n/)){let t=e.indexOf(`:`);t>0&&(n[e.slice(0,t).trim()]=e.slice(t+1).trim())}return{meta:n,body:t?e.slice(t[0].length):e}}function tr(e){let t=[],n=[],r=()=>{let e=n.join(`
`).trim();if(!e)return;let r=$.parse(e,{async:!1,gfm:!0}).replace(/<h2>(.*?)<\/h2>/g,(e,t)=>`<h2 id="${$n(t)}">${t}</h2>`);t.push({kind:`html`,html:r.replace(/<a href="(https?:[^"]*)"/g,`<a href="$1" target="_blank" rel="noopener noreferrer"`)}),n=[]};for(let i of e.split(/\r?\n/)){let e=/^::calc\s+(\S+)\s*$/.exec(i),a=/^::diagram\s+(\S+)\s*$/.exec(i);if(a){let e=/<svg[\s\S]*?<\/svg>/.exec(rr[`./${a[1]}.md`]??``)?.[0];n.push(e??`<p>Missing diagram ${a[1]}</p>`)}else e?(r(),t.push({kind:`calc`,name:e[1]})):n.push(i)}return r(),t}function nr(e){let t=[...e.matchAll(/^## (.+)$/gm)].map(e=>({id:$n(e[1]),title:e[1]}));return t.length>1?t:void 0}var rr=Object.assign({"./guides/block-colorings.md":Ge,"./guides/colors-and-palettes.md":Ke,"./guides/credits-and-licenses.md":qe,"./guides/designing-a-quilt.md":Je,"./guides/drawing-blocks.md":Ye,"./guides/getting-started.md":Xe,"./guides/libraries.md":Ze,"./guides/printing.md":Qe,"./guides/settings.md":$e,"./guides/sketchbook.md":et,"./math/backing.md":tt,"./math/binding.md":nt,"./math/borders.md":rt,"./math/flying-geese.md":it,"./math/half-square-triangles.md":at,"./math/on-point-settings.md":ot,"./math/quarter-square-triangles.md":st,"./math/rounding.md":ct,"./math/seam-allowance.md":lt,"./math/square-in-a-square.md":ut,"./math/squares-and-rectangles.md":dt,"./math/yardage-and-fat-quarters.md":ft,"./resources/calculators.md":pt,"./resources/directories.md":mt,"./resources/learning-to-quilt.md":ht,"./resources/licenses.md":gt,"./resources/rrquilts-project.md":_t,"./techniques/continuous-binding.md":vt,"./techniques/flying-geese-units.md":yt,"./techniques/hst-units.md":bt,"./techniques/square-in-a-square-units.md":xt}),ir=Object.entries(rr).map(([e,t])=>{let[,n,r]=/^\.\/([^/]+)\/([^/]+)\.md$/.exec(e),{meta:i,body:a}=er(t);return{section:n,id:r,title:i.title??r,order:Number(i.order??100),summary:i.summary??``,text:`${i.title??``} ${i.summary??``} ${a}`.toLowerCase(),segments:tr(a),toc:nr(a)}}).sort((e,t)=>e.order-t.order||e.title.localeCompare(t.title)),ar=e=>ir.filter(t=>t.section===e),or=(e,t)=>ir.find(n=>n.section===e&&n.id===t);function sr(e,t){let n=t.toLowerCase().split(/\s+/).filter(Boolean);return e.filter(e=>n.every(t=>e.text.includes(t)))}var cr={class:`row no-wrap`,style:{gap:`24px`}},lr={key:0,class:`topics column`,"aria-label":`Topics`},ur={key:0,class:`text-caption text-grey-7`},dr={key:0,class:`text-grey-7 q-pa-sm`},fr={class:`topic-title`},pr=[`innerHTML`],mr={key:2,class:`toc`,"aria-label":`On this page`},hr=[`href`,`onClick`],gr={key:3,class:`col text-grey-7 q-pt-sm`},_r=O(x({__name:`HelpPage`,setup(a){let u=ue(),b=e(),x=_e(),ie=me(),T=f(()=>x.params.section),oe=f(()=>Qn.find(e=>e.id===T.value)?.label??``),E=f(()=>x.params.topic??``),de=f(()=>ar(T.value)),D=f(()=>E.value?or(T.value,E.value):u.screen.gt.sm?de.value[0]:void 0),he=f(()=>E.value&&!D.value?E.value:``),O=ee(``);r(T,()=>O.value=``);let xe=f(()=>sr(de.value,O.value??``)),Se={"file-access":ce},Ce=e=>e.replace(/\{\{yours:([\w-]+)\}\}/g,(e,t)=>Se[t]?Se[t]()?`yours does`:`yours doesn't`:e),k=e=>document.getElementById(e)?.scrollIntoView({behavior:`smooth`});function we(e){let t=e.target.closest(`.help-md a`),n=t?.getAttribute(`href`);n?.startsWith(`/`)&&!t?.target&&(e.preventDefault(),ie.push(n))}return(e,r)=>{let a=o(`router-link`);return i(),_(be,{padding:``,class:`help`},{default:c(()=>[r[5]||=v(`h1`,{class:`page-title q-mb-sm`},`Help`,-1),d(ye,{"model-value":T.value,dense:``,"no-caps":``,align:`left`,class:`q-mb-md`,"onUpdate:modelValue":r[0]||=e=>p(ie).push(`/help/${e}`)},{default:c(()=>[(i(!0),m(y,null,s(p(Qn),e=>(i(),_(ve,{key:e.id,name:e.id,icon:e.icon,label:e.label},null,8,[`name`,`icon`,`label`]))),128))]),_:1},8,[`model-value`]),v(`div`,cr,[!D.value||p(u).screen.gt.sm?(i(),m(`nav`,lr,[d(re,{modelValue:O.value,"onUpdate:modelValue":r[1]||=e=>O.value=e,dense:``,outlined:``,clearable:``,placeholder:`Search ${oe.value}`,class:`q-mb-sm`},{prepend:c(()=>[d(te,{name:`search`})]),_:1},8,[`modelValue`,`placeholder`]),(i(!0),m(y,null,s(xe.value,e=>(i(),_(a,{key:e.id,to:`/help/${T.value}/${e.id}`,class:n([`topic-link`,{active:e.id===D.value?.id}])},{default:c(()=>[v(`div`,null,g(e.title),1),e.summary?(i(),m(`div`,ur,g(e.summary),1)):h(``,!0)]),_:2},1032,[`to`,`class`]))),128)),xe.value.length?h(``,!0):(i(),m(`div`,dr,`No topics match “`+g(O.value)+`”.`,1))])):h(``,!0),D.value?(i(),m(`article`,{key:1,class:n([`col content`,{"is-dark":p(u).dark.isActive}]),onClick:we},[p(u).screen.gt.sm?h(``,!0):(i(),m(`div`,{key:0,class:n([`mobile-bar row items-center justify-between q-mb-sm`,{reverse:p(b).settings.sidesSwapped}]),style:t({background:p(u).dark.isActive?`var(--q-dark-page)`:`#fff`})},[d(w,{flat:``,dense:``,"no-caps":``,icon:`arrow_back`,label:oe.value,to:`/help/${T.value}`},null,8,[`label`,`to`]),D.value.toc?(i(),_(w,{key:0,flat:``,dense:``,round:``,icon:`menu`,"aria-label":`On this page`},{default:c(()=>[d(fe,null,{default:c(()=>[d(se,{dense:``,style:{"min-width":`220px`}},{default:c(()=>[d(ae,{header:``},{default:c(()=>[...r[2]||=[S(`On this page`,-1)]]),_:1}),(i(!0),m(y,null,s(D.value.toc,e=>l((i(),_(le,{key:e.id,clickable:``,onClick:t=>k(e.id)},{default:c(()=>[d(ne,null,{default:c(()=>[S(g(e.title),1)]),_:2},1024)]),_:2},1032,[`onClick`])),[[pe]])),128))]),_:1})]),_:1})]),_:1})):h(``,!0)],6)),v(`h2`,fr,g(D.value.title),1),(i(!0),m(y,null,s(D.value.segments,(e,t)=>(i(),m(y,{key:`${D.value.section}/${D.value.id}/${t}`},[e.kind===`html`?(i(),m(`div`,{key:0,class:`help-md`,innerHTML:Ce(e.html)},null,8,pr)):(i(),_(We,{key:1,name:e.name},null,8,[`name`]))],64))),128))],2)):h(``,!0),D.value?.toc&&p(u).screen.gt.sm?(i(),m(`nav`,mr,[r[3]||=v(`div`,{class:`text-caption text-grey-7 q-mb-xs`},`On this page`,-1),(i(!0),m(y,null,s(D.value.toc,e=>(i(),m(`a`,{key:e.id,href:`#${e.id}`,class:`topic-link`,onClick:C(t=>k(e.id),[`prevent`])},g(e.title),9,hr))),128))])):p(u).screen.gt.sm?(i(),m(`div`,gr,[he.value?(i(),_(ge,{key:0,dense:``,class:`bg-warning text-dark q-mb-md`},{default:c(()=>[S(` There's no topic “`+g(he.value)+`” in `+g(oe.value)+`. `,1)]),_:1})):h(``,!0),r[4]||=S(` Pick a topic. `,-1)])):h(``,!0)])]),_:1})}}}),[[`__scopeId`,`data-v-2a894290`]]);export{_r as default};