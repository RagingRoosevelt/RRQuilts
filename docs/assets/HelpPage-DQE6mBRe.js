import{o as e,t,y as n}from"./project-C8VHe9AK.js";import{$ as r,G as i,H as a,Mt as o,Nt as s,Q as c,W as l,X as u,b as d,ct as f,f as p,g as m,h,kt as g,m as _,mt as v,p as y,s as b,st as x,x as S,y as C,z as w}from"./create-1s3Rzb7I.js";import{H as T,n as E,t as D,y as ee}from"./_plugin-vue_export-helper-CR9-uGE4.js";import{_ as te,i as ne,n as re,t as O}from"./QCard-COE3_gKp.js";import{a as ie}from"./render-14VoT2U0.js";import{D as ae,F as oe,I as se,L as ce,T as le,r as ue,s as de,w as fe}from"./units-DNi8ufnl.js";import{Mt as pe,Pt as me,yt as he}from"./index-CpZhBW8L.js";import{n as ge,t as _e}from"./QTabs-D-G0L4Yq.js";import{t as ve}from"./QPage-GR1f5I2A.js";import{n as k,r as ye,t as A}from"./format-C_MAcbKB.js";import{a as j,f as be,i as xe,n as Se,o as Ce,r as we,t as Te,u as Ee}from"./yardage-B_kv5tRK.js";import{t as De}from"./QMarkupTable-vBrm_cnd.js";var Oe=e=>Ee[e].filter(e=>!e.fatQuarter);function ke(e,t,n){let r=Ee[e].find(e=>e.id===n)??Oe(e)[0];return{units:e,seam:t.seam[e],step:t.rounding[e],slack:t.miterSlack[e],usable:r.usable,fabric:r,fabricStep:t.fabricStep[e],overhang:t.overhang[e],bindingWidth:t.bindingWidth[e]}}var Ae=e=>({poly:e,curved:!1,fill:`x`,marks:[]}),M=(e,t)=>Ae([[0,0],[e,0],[e,t],[0,t]]),je=e=>Ae([[0,0],[e,0],[0,e]]),Me=e=>Ae([[0,0],[e,0],[e/2,e/2]]),Ne=(e,t)=>Ae([[0,0],[e,0],[e-t,t],[t,t]]),N=(e,t)=>k(e,t.units),P=(e,t)=>e.cut[0]===e.cut[1]?`${N(e.cut[0],t)} square`:`${N(e.cut[0],t)} × ${N(e.cut[1],t)}`,F=(e,t)=>({in:e,cm:t}),Pe={square:{title:`Square`,inputs:[{key:`f`,label:`Finished side`,start:F(3,8)}],rows:({f:e},t)=>[{label:`Cut`,value:P(j(M(e,e),t.seam,t.step),t)}]},rect:{title:`Rectangle`,inputs:[{key:`w`,label:`Finished length`,start:F(6,15)},{key:`h`,label:`Finished width`,start:F(3,8)}],rows:({w:e,h:t},n)=>[{label:`Cut`,value:P(j(M(e,t),n.seam,n.step),n)}]},hst:{title:`Half-square triangles`,inputs:[{key:`f`,label:`Finished leg`,start:F(3,8)}],rows:({f:e},t)=>{let n=j(je(e),t.seam,t.step),r=ye((e+(2+Math.SQRT2)*t.seam)*Math.SQRT2,t.step);return[{label:`Two at a time`,value:`${P(n,t)}, one per pair · cut once diagonally`},{label:`Four at a time`,value:`${N(r,t)} square, one per pair · sew all around, cut both diagonals`},{label:`Eight at a time`,value:`${N(2*n.cut[0],t)} square, one per pair · sew both diagonals, cut into 8`}]}},qst:{title:`Quarter-square triangles`,inputs:[{key:`f`,label:`Finished long side`,start:F(4,10)}],rows:({f:e},t)=>[{label:`Cut`,value:`${P(j(Me(e),t.seam,t.step),t)} · cut both diagonals: 4 triangles`}]},geese:{title:`Flying geese`,inputs:[{key:`w`,label:`Finished width`,start:F(4,10),link:{key:`h`,factor:.5}},{key:`h`,label:`Finished height`,start:F(2,5),link:{key:`w`,factor:2}}],rows:({w:e},t)=>{let n=e/2,r=j(Me(e),t.seam,t.step),i=j(je(n),t.seam,t.step);return[{label:`Stitch and flip (1)`,value:`${P(j(M(e,n),t.seam,t.step),t)} rectangle + 2 × ${P(j(M(n,n),t.seam,t.step),t)}`},{label:`Four at a time (4)`,value:`1 × ${P(r,t)} + 4 × ${P(i,t)}`},{label:`Pieced (1)`,value:`goose: ¼ of a ${P(r,t)}; sky: 2 halves of a ${P(i,t)}`}]}},sqinsq:{title:`Square in a square`,inputs:[{key:`f`,label:`Finished unit side`,start:F(4,10)}],rows:({f:e},t)=>{let n=e/Math.SQRT2;return[{label:`Center`,value:P(j(M(n,n),t.seam,t.step),t)},{label:`Corners`,value:`2 × ${P(j(je(e/2),t.seam,t.step),t)}, cut once diagonally`}]}},onpoint:{title:`On-point setting`,inputs:[{key:`f`,label:`Finished block side`,start:F(10,25)},{key:`n`,label:`Blocks across`,start:F(3,3),count:!0},{key:`m`,label:`Blocks down`,start:F(2,2),count:!0}],rows:({f:e,n:t,m:n},r)=>{let i=e*Math.SQRT2,a=Math.max(1,Math.round(t)),o=Math.max(1,Math.round(n)),s=2*(a-1)+2*(o-1);return[{label:`Finished quilt`,value:`${N(a*i,r)} × ${N(o*i,r)}`},{label:`Block diagonal`,value:N(i,r)},{label:`Blocks`,value:String(a*o+(a-1)*(o-1))},{label:`Side setting triangles`,value:`${Math.ceil(s/4)} × ${P(j(Me(i),r.seam,r.step),r)}, cut both diagonals (${s} needed)`},{label:`Corner setting triangles`,value:`2 × ${P(j(je(e/Math.SQRT2),r.seam,r.step),r)}, cut once (4 corners)`}]}},border:{title:`Borders`,inputs:[{key:`w`,label:`Finished width, no border`,start:F(48,120)},{key:`h`,label:`Finished height, no border`,start:F(60,150)},{key:`b`,label:`Finished border width`,start:F(4,10)}],rows:({w:e,h:t,b:n},r)=>[{label:`Straight: sides`,value:`2 × ${P(j(M(t,n),r.seam,r.step),r)}`},{label:`Straight: top and bottom`,value:`2 × ${P(j(M(e+2*n,n),r.seam,r.step),r)}`},{label:`Mitered: sides`,value:`2 × ${P(j(Ne(t+2*n,n),r.seam,r.step,r.slack),r)}`},{label:`Mitered: top and bottom`,value:`2 × ${P(j(Ne(e+2*n,n),r.seam,r.step,r.slack),r)}`}]},binding:{title:`Binding`,widths:!0,inputs:[{key:`w`,label:`Quilt width`,start:F(48,120)},{key:`h`,label:`Quilt height`,start:F(48,120)}],rows:({w:e,h:t},n)=>{let r=we(2*(e+t),n.bindingWidth,Te[n.units],n.usable,n.fabricStep);return[{label:`Strips`,value:`${r.strips} × ${N(n.bindingWidth,n)} wide`},{label:`Total length`,value:N(2*(e+t)+Te[n.units],n)},{label:`Fabric`,value:A(r.length,n.units)}]}},backing:{title:`Backing`,widths:!0,inputs:[{key:`w`,label:`Quilt width`,start:F(60,150)},{key:`h`,label:`Quilt height`,start:F(72,180)}],rows:({w:e,h:t},n)=>[{label:`Fabric`,value:A(Se(e,t,n.overhang,n.usable,n.fabricStep),n.units)},{label:`Overhang`,value:`${N(n.overhang,n)} each side`}]},yardage:{title:`Patches from yardage`,widths:`any`,inputs:[{key:`n`,label:`How many patches`,start:F(40,40),count:!0},{key:`w`,label:`Finished length`,start:F(3,8),newLine:!0},{key:`h`,label:`Finished width`,start:F(3,8)}],rows:({n:e,w:t,h:n},r)=>{let i=Array.from({length:Math.max(1,Math.round(e))},()=>M(t,n)),a=Ce(i,r.seam,r.step,r.usable),o=xe(a,r.fabric,r.fabricStep)[0];return[{label:`Strips`,value:`${a[0].strips} × ${N(a[0].stripWidth,r)} (${a[0].perStrip} per strip)`},r.fabric.fatQuarter?{label:`Fat quarters`,value:String(o.fatQuarters)}:{label:`Fabric (${N(r.usable,r)} usable)`,value:A(o.length,r.units)}]}},rounding:{title:`Rounding to the ruler`,inputs:[{key:`x`,label:`Exact length`,start:F(3.854,9.31),raw:!0}],rows:({x:e},t)=>[{label:`Exact`,value:N(e,t)},{label:`Cut (rounded up)`,value:N(ye(e,t.step),t)}]}},Fe={class:`text-subtitle2`},Ie={class:`text-caption text-grey-7`},Le={key:0,class:`full-width`},Re={class:`text-grey-8`},ze={class:`text-weight-medium`},Be=D(S({__name:`HelpCalc`,props:{name:{}},setup(e){let r=e,i=t(),o=n(),l=p(()=>Pe[r.name]),g=p(()=>i.doc?.units??o.settings.units),S=f(Oe(g.value)[0].id);u(g,e=>S.value=Oe(e)[0].id);let T=p(()=>ke(g.value,be(o.settings.print),S.value)),E=x(Object.fromEntries((l.value?.inputs??[]).map(e=>[e.key,e.start[g.value]])));function D(e,t){E[e.key]=t,e.link&&(E[e.link.key]=t*e.link.factor)}let te=p(()=>{let e=l.value;return!e||e.inputs.some(e=>!(E[e.key]>0))?[]:e.rows(E,T.value)});return(t,n)=>l.value?(w(),_(O,{key:0,bordered:``,class:`help-calc q-my-md shadow-2`},{default:c(()=>[d(re,{class:`q-pb-sm`},{default:c(()=>[y(`div`,Fe,[d(ee,{name:`calculate`,class:`q-mr-xs`}),C(s(l.value.title)+` calculator `,1)]),y(`div`,Ie,` Seam allowance `+s(v(k)(T.value.seam,g.value))+` · cut sizes rounded up to `+s(T.value.step?v(k)(T.value.step,g.value):`exact sizes`)+` (change in Print settings) `,1)]),_:1}),d(re,{class:`inputs row q-pt-none`},{default:c(()=>[l.value.widths?(w(),_(ue,{key:0,modelValue:S.value,"onUpdate:modelValue":n[0]||=e=>S.value=e,options:(l.value.widths===`any`?v(Ee)[g.value]:v(Oe)(g.value)).map(e=>({label:e.label,value:e.id})),"emit-value":``,"map-options":``,outlined:``,dense:``,label:`Fabric width`,style:{width:`200px`}},null,8,[`modelValue`,`options`])):h(``,!0),(w(!0),m(b,null,a(l.value.inputs,e=>(w(),m(b,{key:e.key},[e.newLine?(w(),m(`div`,Le)):h(``,!0),e.count||e.raw?(w(),_(ne,{key:1,modelValue:E[e.key],"onUpdate:modelValue":t=>E[e.key]=t,modelModifiers:{number:!0},type:`number`,step:e.count?1:`any`,min:+!!e.count,outlined:``,dense:``,label:e.label,style:{width:`140px`}},null,8,[`modelValue`,`onUpdate:modelValue`,`step`,`min`,`label`])):(w(),_(he,{key:2,"model-value":E[e.key],"onUpdate:modelValue":t=>D(e,t),units:g.value,min:.25,label:e.label,style:{width:`240px`}},null,8,[`model-value`,`onUpdate:modelValue`,`units`,`label`]))],64))),128))]),_:1}),d(De,{flat:``,dense:``,separator:`horizontal`,class:`q-mx-md q-mb-md`},{default:c(()=>[y(`tbody`,null,[(w(!0),m(b,null,a(te.value,e=>(w(),m(`tr`,{key:e.label},[y(`td`,Re,s(e.label),1),y(`td`,ze,s(e.value),1)]))),128))])]),_:1})]),_:1})):(w(),_(me,{key:1,dense:``,class:`bg-warning text-dark q-my-md`},{default:c(()=>[C(`Unknown calculator “`+s(e.name)+`”.`,1)]),_:1}))}}),[[`__scopeId`,`data-v-5c7e7680`]]),Ve=`---
title: File formats
order: 30
summary: The files RRQuilts reads and writes, and their published schemas.
---

Every RRQuilts file is plain JSON (text) or a zip holding JSON and images. Each starts with a
\`format\` name and a \`version\` number. A newer RRQuilts opens files made by an older one, and
upgrades them when you save.

## The files

| File       | Holds                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| \`.rrq\`     | One project: its quilts, blocks, palettes, fabrics and settings. Your own fabric images are inside. Library fabric images are referenced, unless you include them when saving. |
| \`.rrqbl\`   | One block, with the colors and fabric images its colorings use.                                                                                                                |
| \`.rrqplt\`  | One palette: its colors and fabric images.                                                                                                                                     |
| \`.rrqlib\`  | A library: a backup of My library and installed packs, or a pack to share. It's a zip when it holds fabric images.                                                             |
| \`.rrqconf\` | Your settings, exported from **Settings**.                                                                                                                                     |

## For developers

Anyone writing tools that read or make these files can use the published JSON Schemas:

- [Project file (\`.rrq\`), version 8](../../schemas/rrq.v8.json)
- [Bundled libraries list](../../schemas/bundled_libraries.v1.json)
- [Current version of each format](../../schemas/formats.json)

A library on the web is a git repository with a \`library.json\` index at its top and a folder for
each pack. A library's index and files can name its web pages in \`links\`: a \`homepage\`, a
\`gallery\`, and \`others\`, each with a \`name\` and \`url\`.
`,He=`---
title: Got an idea?
order: 20
summary: Suggest a feature, ask for a fabric collection, or report a problem.
---

Ideas and reports are welcome on GitHub. You need a free GitHub account to post. Each link opens a
short form.

- [Suggest a feature](https://github.com/RagingRoosevelt/RRQuilts/issues/new?template=feature_request.yml)
  for something RRQuilts could do, or do better.
- [Ask for a fabric collection](https://github.com/RagingRoosevelt/RRQuilts/issues/new?template=fabric_collection.yml)
  to be added to one of the fabric libraries.
- [Report a problem](https://github.com/RagingRoosevelt/RRQuilts/issues/new?template=bug_report.yml)
  when something doesn't work as it should. A small project file that shows it helps a lot.

Before posting, see [what others have asked](https://github.com/RagingRoosevelt/RRQuilts/issues).
If someone already asked for the same thing, add a thumbs up or a comment there.
`,Ue=`---
title: Roadmap
order: 35
summary: Features planned for the next versions.
---

These are the plans for the next few versions. Plans change as people use the app, so something here
may move to another version, arrive in a different form, or not at all. To ask for something that
isn't listed, see [Got an idea?](/help/about/got-an-idea).

## 0.7.4

- A guide for each month, week or day of a data quilt: which pieces of its block to cut in which
  fabric, day by day, printed or on screen.
- View grayscale in the block previews of the project's Blocks tab and of Libraries.
- Choose how strongly lines snap to the grid and to other lines while drawing blocks, and which of
  them pull at all. Lines can also snap level with, or straight above, another corner.
- Drag quilts and blocks into order with a finger as well as a mouse, see where a block will land as
  you can for quilts. The Move earlier and Move later menu items go. Fix: letting go
  past the end of the list drops the card where the glow shows.
- Block and quilt cards show each in its own shape, with a soft shadow, instead of on a gray square.
- Library blocks listed by shape, then by name, and a choice to group them by shape.
- Fix: a link to a secret gist opens its project.

## 0.8.0

- English paper piecing layouts, such as hexagon flower gardens, with printable paper templates.
- Stamps for English paper piecing: save a group of shapes, such as a hexagon flower, and place it
  like a single shape.
- Select several English paper piecing shapes and stamps and move, turn or mirror them together.

## 0.9.0

- Apply to Empty: set a block in, or color, only the spaces and pieces that are still empty.
- Hints in a block's Details about which techniques may suit it, for the block's designer to tick.
- Step by step instructions for making a quilt, built from its layout and blocks.
- A Move tool for quilts: select several blocks to drag, turn or flip together, replacing what they
  land on.

## 0.10.0

- Turn blocks before placing them: choose Rotate again and the block picker, and the blocks you
  set, turn with it.
- Choose how large imported fabric photos are kept: smaller to save space, larger to stay sharp in
  print and up close.
- Shrink a palette's fabric photos later to free space, and give a fabric a better photo.
- Diamond Point quilts with 45° diamonds as well as 60° ones.
- Techniques marked on the built-in blocks, so you can filter them by technique.
`,We=`---
title: RRQuilts project
order: 10
summary: What RRQuilts is for, its principles, and where its source code lives.
---

RRQuilts is a quilt design tool that anyone can use for free, on any device with a web browser. It
aims to be a good place to plan a quilt: draw blocks, lay out quilts, try colors and real fabric
prints, and print what you need to cut and sew. It also aims to treat your work, and other people's
work, with care.

## Project principles

- **Free, with no account.** There's no sign-up, no subscription, and nothing held back for a paid
  version.
- **Works offline.** After the first visit the whole app is on your device. Install it from your
  browser's menu and use it in a sewing room, at a retreat, or at a show with no signal. The only
  things it downloads are library packs you choose to add.
- **Your work stays yours.** Projects are files you save where you like. Nothing is sent anywhere,
  and the app has no server to send it to. Unsaved changes are kept on your device until you save
  or discard them.
- **Open files.** Projects, palettes, blocks and libraries are plain, documented files
  ([File formats](/help/about/file-formats)). They don't depend on RRQuilts to be read, now or
  later.
- **Credit where it's due.** Blocks and fabrics from libraries keep their author and license, and
  copies keep crediting the original. The app follows each license's rules when you share
  ([Credits and licenses](/help/guides/credits-and-licenses)).

## What it isn't

RRQuilts doesn't open files from other quilt software. It reads and writes only its own formats.
It also has no social features, comments or sharing service. To share a design, you send the file
to whoever you choose.

## How it's made

RRQuilts is built in the open by volunteers. The source code is MIT licensed and is on
[GitHub](https://github.com/RagingRoosevelt/RRQuilts). The built-in blocks
are reproductions of traditional quilt blocks found in historical quilts. Ideas, problem reports and requests for fabric collections
are welcome ([Got an idea?](/help/about/got-an-idea)).
`,Ge=`---
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
**View grayscale**, just above, shows the block in grays to check its values.

- **Save as new coloring** copies the current one so you can change it freely.
- The pencil under a coloring renames it.
- The bin under a coloring deletes it (a block always keeps at least one). Quilts that used it keep
  their colors.

To recolor a whole coloring at once, open a block's menu in the sketchbook's **My blocks** and
choose **New coloring from palette swap…**. Pick a palette and each color or fabric in the coloring
becomes its nearest match there (fabrics match by their average color). Change any of them from that
palette, then **Add coloring** keeps the result as a new coloring.

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
summary: Make project palettes of colors and fabric images, and paint with them.
---

A **color** is one swatch. A **fabric** is a photo or scan of a print, drawn at its real size. A
**palette** is a named group of colors and fabrics. A project has palettes of its own (listed first
in the project's **Palettes** tab). You can also tick palettes from your libraries to use in the
project's quilts.

## Add a project color

1. Open your project and choose the **Palettes** tab.
2. Click a project palette, then the **+** at the start of its swatches (or **Add color**, the **+**
   button, in the quilt editor's **Colors** tray, which adds to the first palette). **New palette**
   makes another palette.
3. In the dialog, type a **Name**, then pick the color with the **Picker** tab, the **RGB** tab, or by typing a **Hex** value.
4. Click **Add**.

To change a project color later, right-click (or long-press) it in the tray and choose **Edit…**, or
click it in its palette and use **Change color**. To rename a color or fabric there, click its name,
type, and click the check mark. The bin button removes it.

## Add fabric images

1. In the project's **Palettes** tab, open a palette and click the picture button beside **+**, or
   drop image files onto the palette (or use the picture button next to **Add color** in the quilt
   editor's **Colors** tray).
2. Click **Pick images or a zip** or **Pick a folder**. JPEG, PNG, and WebP images work, and several
   at once.
3. Leave **Crop each image to a square** ticked unless your images are already trimmed. Click an
   image's thumbnail to move its crop, or drag a corner to resize it. You can also drop image files
   onto the dialog.
4. Type the **Real width of each image**, the width of fabric the photo shows. Left empty, it's
   8 in, and the fabric shows "≈" until you set it.
5. Check the names in the list, then click **Add**.

Each image is reduced to 256 and 512 px and kept on this device. Saved projects carry your own
fabrics' images, at the size chosen in **Settings › Fabrics**.

## Use library palettes

1. In the project's **Palettes** tab, scroll to **Library palettes**.
2. Tick the checkbox beside each palette you want. Its colors and fabrics then appear in the quilt
   editor's **Colors** tray, under the library's name.

Library colors are read-only. Right-click one in the tray and choose **Edit a copy…** to make your own version. If the list is empty, check **Settings › Project**, where **Hide library palettes from projects** hides it.

## Sort a palette

A palette's **Actions** menu has **Sort by**: **Saved order**, **Hue**, **Value** (light to dark),
**Saturation** (vivid to muted) or **Name**, and **Reverse**. In the **Library palettes** list, use
the sort button beside the tags button. The palette then shows that way on its card, in its preview
and in the editor trays. Colors you add take their place in the sort.

Sorting only changes how the palette looks on this device. The palette itself keeps its order, so
saving, exporting or sharing it is unchanged. Library and pack palettes can be sorted too. **Settings
› Quilt and block design › Sorted palettes** lists every sorted palette, each with **Clear**.

## Find palettes by color

The filter sidebar on the Libraries page (Palettes or All) and in the project's **Palettes** tab has
a **Color** card. Switch on **Hue** and slide to the color you want, with **±** for how wide a range
around it. **Value** (dark to light) and **Saturation** (muted to vivid) take a range too. A palette
stays when one of its swatches is in every range you set. Its other swatches are dimmed, or hidden
with **Hide non-matching swatches**. Grays have no hue, so a hue never finds them. Fabrics count by
their average color.

## Paint a quilt

1. Open a quilt and choose its **Design** tab.
2. In the tray, open the **Colors** tab and click a color or fabric.
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
title: Data quilts
order: 35
summary: Color a quilt from a year of data, such as daily temperatures or moods.
---

A **data quilt** colors each day's place from that day's value: a temperature, a mood, hours of
daylight, rainfall, or numbers and categories of your own. You design where each day goes and which
color each value gets. The app fills in the colors from the data.

## Make a data quilt

Start a quilt with **Data quilt** turned on in the first step of the wizard, and pick **12 months**,
**52 weeks**, or **365 days**. To make an existing quilt a data quilt, turn on **Data quilt** in its
**Details** tab. Its **Design** tab then has three tabs in the tray.

| Tab    | What it holds                                                    |
| ------ | ---------------------------------------------------------------- |
| Blocks | the data block types and the numbered list of block spaces       |
| Colors | the usual colors and fabrics, for sashing, borders, and the rest |
| Data   | the period, the data, and the colors for each value              |

The plan says how days are grouped. Change it under **Data quilt** in the quilt's **Details** tab. Placed
blocks that can't stay in the new plan, such as week blocks in a Months plan, come off the quilt.
The app asks first and says how many.

| Plan   | Each number stands for                                      |
| ------ | ----------------------------------------------------------- |
| Months | a month, 12 numbers                                         |
| Weeks  | 7 days each, 52 numbers, and a number for the day left over |
| Days   | one day, a number for every day of the period               |

With **Data quilt** on, the wizard's size step and the quilt's **Layout** tab say how many whole
block spaces the layout has and how many the plan needs. Blocks cut down at the quilt's edge don't
count, and they can't take a number.

The period is one year from **Period starts**. A Months period starts on the 1st of a month.

A year of 365 days leaves one day over in a Weeks plan. It comes last (Dec 31 for a year from
January), unless you start the year with it. Place a 1-day block on **Wk 1**, or a week block on
the single day at the end, and the single day moves to the start (Jan 1), with the weeks starting
the day after. Place a week block on Jan 1, a 1-day block on **Wk 52**, or take Jan 1's last block
off, and it goes back to the end. Blocks keep their places in the list when the single day moves,
so their labels shift by one: moving it to the start, the block on Wk 2 becomes Wk 1, and moving it
back, Wk 1 becomes Wk 2. The app asks first when other blocks would shift.

### Leap years

A period that holds 29 February has 366 days. Months plans need nothing more, since February
takes its block's 29-day variant. For a Weeks or Days plan, **Leap day** in the quilt's **Details**
tab, under **Data quilt**, picks what happens to the extra day.

| Leap day                      | What happens                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| **Average Feb 28 and Feb 29** | 28 February shows the average of the two days, and 29 February has no place         |
| **Ignore Feb 29**             | 29 February has no place and its value is left out                                  |
| **Use a 2-day block variant** | Weeks only. The two days left over are one number, shown by a 2-day variant         |
| **Extra single-day number**   | Weeks get a single day at each end of the year. Days give 29 February its own place |

Averaging a category value, such as a mood, takes the category halfway between the two days in
the list. When that falls between two categories, **Categories round** picks the earlier one
(**Down**) or the later one (**Up**). The data entry table still lists 29 February, so your record
stays complete.

## Make a data block

A data block is a block a data quilt places for each month, week, or day. Its pieces carry day
numerals that say which day colors them.

1. Make a block with **Data block** turned on in the new block window, or turn it on in a block's
   **Details** tab.
2. Pick its type under **Data block type**: **Day**, **Week**, or **Month**.
3. Draw it as usual in the **Draw** tab.
4. In the **Color** tab, open **Day numerals**. Drag a numeral onto a patch, or pick a numeral and
   tap patches. With **Next numeral after each tap** on, the next numeral is picked for you.

A month block has numerals 1 to 31, a week block 1 to 7, and a day block only 1. A numeral can go
on more than one patch, so one day can color several pieces. Tap a patch that has the picked
numeral to take it off. Numerals not on any patch yet show faded. **Clear all numerals** takes every numeral, of every value, off the drawing shown. A new variant
starts with its colors but no numerals. A numbered patch keeps the color
it had underneath. That color is what **As designed** shows.

**Value** picks A, B, C, or D. Use B, C, and D when a day records more than one value, such as a
high and a low temperature. Each value has its own numerals and its own order line. **Show
numerals** and **Show order line** draw the numerals and a line through the patches in order. A
numeral on several patches branches the line, the same way as on the quilt (see **Place the
numbers**).

### Variants for shorter months and single days

A month block's own drawing is for 31 days. At the top of the **Draw** and **Color** tabs,
**Variant** adds a 30, 29, or 28-day variant, which starts as a copy of the 31-day drawing. Pick a
variant to draw and number it on its own. A month shows the variant with the fewest days that still
covers it: February takes the 28-day variant (the 29 in a leap year), and a 30-day month without a
30-day variant takes the 31. Places past a month's last day show the filler or their own color, as
set under **Places past a number’s days**.

Month and week blocks can also add a **1 day** variant. It stands for a single day, so it serves
the day a Weeks plan leaves over and the days of a Days plan, and the block is listed with the day
blocks too, pictured as its 1-day variant. Week blocks can add a **2 days** variant for a leap year's two days left over (see
**Leap years** above).

The built-in library has a square **Month Strip** with 30, 29, and 28-day variants (31 bars each,
the days past the month in black), a **Week Strip** of 7 bars, and a **Day Square** with one place,
all filed under **Data**. Months and weeks also come with their strips turning a corner, day 1 at
the top left: **Curved Month Strip** and **Curved Week Strip** in quarter rings, **Cornered Month
Strip** and **Cornered Week Strip** in nested right angles, and **Month Fan** and **Week Fan** as
wedges fanning out from the corner.

To find data blocks, use the **Data** filter in the project's **Blocks** tab and in the libraries.
The project's **Quilts** tab can show only data quilts or only the others.

## Place the numbers

The **Blocks** tab has **Data blocks** and **Other blocks** at the top. **Other blocks** places your
usual blocks, such as a center block or plain spaces between the months, the same way as in any
quilt. A numbered space given another block gives its number back. **Data blocks** places the
numbers.

With **Data blocks**, pick a block at the top. A Months plan lists month blocks, Weeks lists week
blocks and day blocks, and Days lists day blocks. A week or month block with a 1-day variant shows
under day blocks too. Picked there, it places its 1-day variant.

Under **Place numbers**, **Value** picks the quilt value the block shows, **qA** to **qD**, as
**Value** does in the block editor. Hover over one to see its name, such as High or Low. Values the
quilt doesn't have yet are grayed out. A block whose numerals use several values, say A and B, has
a row for each one, and several of them can show the same quilt value, so a block with values A, B,
and C works in a quilt with only qA and qB. The same block can show High in one space and Low in
another.

The tab then lists every number of the plan. Months go by name (Jan, Feb, and so on from the period
start), weeks by number (Wk 1, Wk 2, and on), and days by date (Jan 1, Jan 2). A single day in a
Weeks plan goes by date too. With **Place numbers** on, tap block spaces on the quilt. Each gets the
highlighted number and the picked block, and the highlight moves on to the next number. Tap a
number in the list to place from there. A number can go on as many spaces as you like, so tap it
again to place another.

Tap a placed space to change it. With the same number, block, and value picked, the tap takes the
block off. Otherwise the space takes whatever differs. A different number changes its number, a
different block changes its block, and a different value changes its value.

**Fill empty numbers** puts the block spaces still empty on the numbers with no block yet, by
**Rows**, **Columns**, or **Snake**, with the picked block. **Clear** takes every block off.

**Erase** on the left takes a placed block off its space, and **Find** lights up every space a
data block is placed on.

Beside each label are the blocks placed for it, each an uncolored picture with its values. Hover
over one, or click it, and its block space lights up on the quilt. On the quilt, each placed space
shows its number, with its values on the line below in the block's own order. A line joins the
numbers in order, a line of its own for each value (qA, qB), joining only the blocks that show it.
When a number sits on several spaces, the line from one number to the next
branches. One space joins every space of the next number, and several join one. When both have
several, each space joins the nearest one not yet joined, in the order they were placed. A lighter
arrow inside each placed block runs through its days in order.

The tab lists anything that needs attention, such as numbers not placed yet or days without a
place.

## Map values to colors

Each value has a **Label** and a **Kind**. Temperature, Hours of daylight, and Rainfall map ranges
of numbers to colors. Mood maps each choice to a color. Custom starts with three number ranges.

The values are in the **Data** tab. Right above each value's ranges or categories, a small chart
shows how many days of the sample fall in each. The first range holds every value under its end, and the last every value from
its start. A range between holds values from its first number up to (not including) its second.
Ranges stay joined, so changing where one ends moves where the next starts. Change a range's
numbers, color, or fabric, add or remove ranges, and the quilt recolors as you go. **Add a
value** adds B, C, and D.

In a colorway other than the primary, each range or category shows its primary color and what it
becomes in this colorway. Pick a replacement there. Each value's **Sample** shows there too. The sample data is
the quilt's, so every colorway shows the same days. Show the primary colorway to change the values
themselves.

## Preview with sample data

**Sample data** shows the quilt colored by a made-up year, so you can judge the colors before your
own data comes in. Each value's **Sample** picks which made-up series feeds it, from those that fit its **Kind**.
Temperatures come as daily highs and lows for a temperate place, Fairbanks in Alaska, and Honolulu
in Hawaii. Moods come as an even mood, a mostly low one with good days, and an optimist's with bad
days. Rainfall comes for a temperate place, Hilo in Hawaii, and Phoenix in Arizona, and hours of
daylight for a temperate place, Fairbanks, and Austin in Texas. They follow each place's usual
weather, not a real year's records. **CSV…** loads your
own sample instead: open a file or paste rows, then pick the date column and the column for each
value. A sample from another year is matched by day of the year.

## Enter real data

Switch **Show** to **Real data**. Then:

- **Table** lists every day of the period with a field for each value.
- **Today's entry** opens today's row.
- **Missing** lists days up to today without an entry.
- **Import** reads a CSV file or pasted rows into the table. Days already entered take the new values.

With the **Data** tab open, tapping a day's piece opens its row. **Days without an entry**
sets what a day shows until it has a value: its own color, the sample value, or the filler.

## Print it

The printed quilt picture has a legend of each value's colors. Yardage can't know your data ahead of
time, so it counts a worst case. Each range or category counts its **most days expected**, each in
the largest piece of its value. Set those numbers under **Yardage** › **Most days expected** in the
**Data** tab. Left empty, each takes its number of days in the sample.
`,Ye=`---
title: Designing a quilt
order: 30
summary: Set the layout and borders, place blocks, color patches, and use Apply to for repeats.
---

Open a quilt from the sketchbook's **Quilts** tab (or create one from **Start a quilt**). The quilt
editor has five tabs along the top named **Details**, **Layout**, **Borders**, **Design**, and
**Print**. The **menu** button at the right hides or shows the sidebar. Two toggles on the left rail
show or hide the seam lines and the block names, and the bar under the quilt reports its finished
size. **Download image** in the **Details** tab saves the quilt's picture with seam lines when they
are shown.

## Layout

1. Open the **Layout** tab. **Style** is **Straight Set** (blocks in rows and columns), **On-Point**
   (blocks turned 45°), **Diamond Point**, **Variable Point**, **Shaped Blocks**, **One Patch**,
   **Baby Blocks**, **Variable Patch**, or **Horizontal Strip** and **Vertical Strip** (see below).
   **Custom Set** is coming soon. In **Start a quilt**, the **Blocks** and **Patches** buttons above
   the pictures switch between layouts for blocks and layouts for patches. Straight Set, On-Point and
   the strips are in both.
2. Set **Columns** and **Rows** (1 to 100).
3. Set the **Finished block size** (**Width** and **Height**). Switch on **Keep width and height
   equal** to keep blocks square.
4. Set the **Sashing** (the strips between blocks) the same way. 0 means none. **Sashing around the
   outside** adds strips around the edge too. Where sashes cross are cornerstones.

### Reference overlay

Below the layout settings, **Reference overlay** draws a size to aim for as a dashed outline over
the quilt: a bed with its drop, a placemat, a garment piece, or a custom size. Pick it under
**Target size**, as in the new quilt wizard. It's saved with the quilt. **Show** hides or shows the outline, **Fill** sets how strongly it's shaded, the color swatch picks its tint, **Invert** shades outside the shape instead, and **None** removes it.

## On-point layouts

Choose **On-Point** as the **Style** to turn the blocks 45° so they sit as diamonds. A second set of
blocks fills the spaces between them, and setting pieces finish the edge.

1. **Blocks across** and **Blocks down** count the main blocks. Between them the layout adds a
   second set of blocks, so a 3 by 3 layout also holds 2 by 2 in between. The counts go in halves:
   3½ down ends on the short row after the third long row, one block fewer across, and 4 adds the
   next long row. Diamond Point and Variable Point count the same way.
2. **Finished block size** is the finished side of a block. The width of a block on point, corner to
   corner, is shown under it. It is the side times about 1.41.
3. **Sashing width** frames every block, with cornerstones where the strips cross. Use 0 for none.
   At the quilt's corners, choose **Corner triangle** for one triangle in each corner, or **Seam**
   to split each corner in two, continuing the line of the side triangles.
4. **Edge** decides what happens where the diamonds meet the edge of the quilt.
   - **Exact** puts the block points right on the edge, with setting triangles in the gaps. New
     quilts start here, and the edge stays put when you set a block into a setting triangle.
   - **Floating** cuts the setting triangles larger, so the blocks float inside the edge. Trim the
     quilt top to its final size after piecing. **Float** sets how much extra the triangles get.
   - **Trimmed blocks** uses partial blocks along the edge. They are cut by the edge, but they are
     cut and counted as whole blocks.
   - You can also set a block into a single setting triangle. It's placed whole, turned like the
     others, and cut at the edge. That side of the quilt is then cut at the block points, so it
     loses its float until the block is removed.
   - **No fill** leaves the zigzag edge as it is, and the binding follows it. Borders are set aside
     until you choose another finish.
5. The Print tab notes when the quilt top needs trimming.

Switching between **Straight Set** and **On-Point** keeps the blocks in the main grid. Blocks that
only exist in one style are listed in a warning before they are removed.

## Shaped block quilts

**Shaped Blocks**, **Baby Blocks**, and **Diamond Point** hold triangle, 60° diamond, or hexagon
blocks. Draw those in the block editor (see Drawing blocks). A space takes only a block of its shape.

- **Shaped Blocks** repeats **Triangles**, **60° diamonds**, or **Hexagons** over the quilt. Set the
  number across and down and the **Side** (for diamonds, the width across, which is the same as a
  side).
- **Baby Blocks** are cubes of three 60° diamond blocks. **Alternate** sets the tops, lefts, and
  rights apart.
- **Diamond Point** is like On-Point with 60° diamonds standing on their points. Set the **Leg**,
  **Width**, or **Height** of a diamond and the other two are worked out. Setting pieces take colors
  and fabrics.

**Rotate** turns a shaped block by the steps its shape allows: a third of a turn for triangles, half
a turn for diamonds, and a sixth for hexagons. **Flip** mirrors it left to right.

Any block space also takes a color or fabric. Paint an empty space and the whole space takes it.
Setting a block there later replaces it.

## Flow angle

Layouts of triangles, diamonds, or hexagons (Shaped Blocks, Baby Blocks, Variable Patch, and One
Patch with those shapes) have a **Flow angle** slider. It turns the direction the rows run, from 0°
to 360°. The slider settles on multiples of 15° when you drag near one. With **Trimmed straight**
the quilt keeps its size and the turned rows are cut at its edge.

## Patch quilts

**Variable Point**, **One Patch**, and **Variable Patch** are made of patches. You color patches
with colors and fabrics, not blocks. **Alternate** colors every other patch.

- **Variable Point** is like On-Point, but the diamonds can be taller or wider than they are across.
  Set the **Diamond width** and **Diamond height**, measured point to point through the diamond, or
  the **Point angle** at the top and bottom points, or the **Leg length** of each side. Tick the two
  you want to set, and the others are worked out. With width and height equal (a 90° angle), the
  diamonds are on-point squares.
- **One Patch** repeats one shape over the quilt. Pick the **Shape** (squares, rectangles, bricks,
  half-square triangles, triangles, 60° diamonds, hexagons, tumblers, clamshells, or octagons and
  squares), then the number of patches across and down and the patch size.
- **Variable Patch** is a cube of three diamonds you can squash or stretch. Set the **Cube width**,
  the **Top height**, and the **Side height**. **Alternate** colors the tops, lefts, and rights
  apart, so three taps give the cubes their light, medium, and dark faces. Quilts made with Baby
  Blocks in RRQuilts 0.4 open as Variable Patch, since their diamonds were patches.

Where the rows don't end in a straight line, **Edge** chooses **Trimmed straight** (patches cut off
along a straight edge) or **Whole patches** (a zigzag edge, bound along the shapes). With whole
patches, borders are set aside until you choose a straight edge again.

## Strip quilts

A strip quilt is a stack of strips. With **Horizontal Strip** they run left to right, stacked top to
bottom. With **Vertical Strip** they run top to bottom, side by side. Every strip is the same
**Strip length (all strips)**, and each has its own style and **Strip width**.

1. Pick a strip in the list or tap it on the quilt.
2. Choose its **Style**.
   - **Plain** is one piece of fabric.
   - **Pieced Blocks** and **Half Drop Blocks** are a **Block strip** or a **Pieced strip**. A block
     strip holds blocks, and keeps them square, so its width follows the length and the units along.
     A pieced strip is rectangles of any width that you color with fabric. Half Drop starts and ends
     with half units, cut from whole ones.
   - **Spaced Squares**, **Points A** and **B**, **Diamonds**, **Double Diamonds** (each also in a
     **Half Drop** version), and **Checker Board** are pieced patterns. You color them with fabric
     and colors, not blocks. **Alternate** colors every other shape, so the points and their
     background take different colors in one tap.
3. Set its **Strip width** and **Units along**, the number of units along the strip. **Checker
   Board** also has **Units across**. The unit size shows below. When the units aren't square (or
   the points aren't right angles), a **Make square** button offers the number of units that fixes
   them.
4. To add a strip, point between two strips in the list (or above the first, or below the last) and
   click the **+** at the start of the line that appears. On a phone the lines always show. The new
   strip is a plain 2″ strip. The **×** at the end of a strip's row deletes it. To move a strip,
   drag it by the grip at the start of its row.

Two tools on the left rail help rearrange strips.

- **Swap strips** trades two strips. Tap one, then the other. Each keeps its blocks and colors. Tap
  the first strip again or press Escape to cancel.
- **Strip style** opens a menu of the styles. Pick one, then tap strips to give them that style.

## Borders

1. Open the **Borders** tab. Borders are numbered from the inside out (1 is innermost).
2. **Add outside** adds a border, **Insert inside** adds one just inside the selected border,
   **Clone** copies it. The arrow buttons **Move inward / outward**, and the trash button deletes.
3. Choose a **Style**. **Long horizontal** and **Long vertical** are plain strips (the long strips
   run the full length on that side), and **Mitered** has diagonal corners. The other styles are
   pieced: blocks, squares, diamonds, and points along each side, with a square in each corner.
   **Points out** point away from the quilt and **Points in** point toward it.
4. Set the width of each side with **Left**, **Top**, **Right**, **Bottom**. **All sides**, **L+R /
   T+B**, and **Each** choose how many sides move together.
5. For a pieced style, set the **Units along top and bottom** and **Units down the sides**. They
   start at the count that keeps the shapes square (or the points at right angles). **Blocks aligned
   inside** and **Half drop aligned** follow the columns and rows of the blocks inside.

Pieced borders take colors and fabrics. **Alternate** colors the shapes and their background apart.

For cutting lengths, see [Borders](/help/math/borders).

## Place blocks

1. Open the **Design** tab. The sidebar shows the tray with **Blocks** and **Colors** tabs. Library
   blocks appear only if ticked in the sketchbook's **Blocks** tab. Above the blocks, **Fits layout**
   shows only blocks that fit a layout's spaces (pick one from the pictures), and **Shape** shows only
   square, triangle, diamond or hexagon blocks. Clear a filter with its **x**.
2. Click a block in the **Blocks** tab. If it has several colorings, a small number on its tile lets
   you choose which coloring to place.
3. Pick the **Set block** tool (the first tool on the left rail) and tap a space in the quilt.

## Tools

The left rail holds the tools. Tooltips and a hint line above the tray say what each does.

| Tool                      | What a tap does                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Set block**             | Places the selected block                                                                                                                                            |
| **Rotate**                | Turns a block 90°                                                                                                                                                    |
| **Flip**                  | Mirrors a block across the quilt, tap the tool again to switch left↔right and top↕bottom. On a turned block, such as in On-Point, it still mirrors as the quilt runs |
| **Erase block**           | Removes a block                                                                                                                                                      |
| **Find block**            | Selects that block in the tray and outlines every place it's used                                                                                                    |
| **Paint**                 | Colors one patch                                                                                                                                                     |
| **Spray (same color)**    | Recolors every patch of the same color                                                                                                                               |
| **Swap color everywhere** | Replaces that color throughout the quilt                                                                                                                             |
| **Eyedropper**            | Picks up a patch's color                                                                                                                                             |
| **Pan**                   | Drag to move around (with the other tools, pinch with two fingers or drag with the right mouse button)                                                               |

A middle-button click picks up what is under the pointer, whatever tool is on. On a block, it
picks the block for **Set** and the clicked patch's color or fabric. On a sash, border, or other
patch, it picks the color or fabric for **Paint**. On a data quilt's data block, it picks the block,
its values, and its number for placing (see **Data quilts**). A middle-button drag still moves the
view.

## Color

1. Click the **Colors** tab in the tray and click a swatch. **+** adds a new color.
2. Choose **Paint** and tap a patch. Sashes, cornerstones, and borders can be painted too.
3. A placed block follows its block's coloring until you recolor a patch in the quilt. The change
   then applies only to the quilt.

## Colorways

A quilt can have colorways: the same quilt in other colors, the way a pattern comes in several
fabric lines. In the Design tab, **Colorways** shows each one. The first is the primary colorway,
which you paint as usual. **Save as new colorway** copies the one shown.

In any other colorway, the Colors tab lists each color of the primary colorway with a menu beside
it. Pick what that color becomes in this colorway. Pieces are painted in the primary colorway, and
every colorway follows the design: blocks you place or change show in all of them.

Each colorway can be renamed or deleted while another is left. Deleting the primary makes the next
one the primary. The colorway shown is saved with the quilt, and printing and pictures use it.

On the project's Quilts tab, the count on a quilt's card picks the colorway shown.

**View grayscale**, above Colorways, shows the quilt in grays so you can check light and dark
values. It only changes the view.

**New colorway from palette…** is on the card's menu and beside **Save as new colorway**. Pick a
palette (the list shows each palette's swatches), and each color of the primary colorway becomes its
nearest color or fabric there, whichever colorway is shown. Change any
you like, then **Add colorway**. Choose **Manual** for a one-time copy, or **Auto mapping** to keep
it following: when the colors it follows or the palette change, its matches change too.

An auto-mapped colorway's Colors tab says what it **Follows** (the primary colorway) and
which **Palette** it maps to. Pick a color by hand to keep it, and **Automatic** puts it back.
Switching to **Manual** keeps the colors it shows. If the colorway it follows or its palette is
deleted, it keeps its colors as a manual colorway. In **Manual**, **Pick from** limits the choices
to one palette.

## Apply to

Above the tray, **Apply to** controls how many spaces a tap affects.

- **This** colors only the space you tap.
- **All** covers every space of the same kind (all blocks of that block, all sashes, one border…).
- **Alternate** takes every other one of those spaces, in a checkerboard.

## Details and Print

The **Details** tab holds the quilt's title, author, license, and notes. The **Print** tab makes
templates, cutting charts, and yardage ([Printing](/help/guides/printing)). Undo and redo are on the
rail (Ctrl+Z, Ctrl+Shift+Z).
`,Xe=`---
title: Drawing blocks
order: 40
summary: Draw a block from seams (lines and arcs) and let the app find the patches.
---

A block is a square or rectangle, or a triangle, 60° diamond, or hexagon, drawn with **seams**. Wherever seams close a shape, the app
finds a **patch** that you can color. Start from **New block** in the sketchbook's **Blocks** tab,
or open one of your blocks with **Open in block editor** (its menu, or its preview). The block editor has four tabs named **Details**, **Draw**, **Color**, and
**Print**. Library blocks open read-only, with only Details and Print: look, print, or use **Edit (make a copy)** or **Create a
coloration variant** at the top of the editor to change your own version.

## Pick a shape

**New block** asks for a name and a shape: **Square**, **Triangle**, **60° diamond**, or
**Hexagon**. The shape stays with the block. To draw the same design in another shape, start a new
block. Shaped blocks go in layouts with spaces of their shape (see Designing a quilt).

## Set the size

In the **Draw** sidebar, **Block name**, **Width**, and **Height** set the finished size, in the
project's units. If you change the proportions of a block with curved seams, the curves change
shape too.

A shaped block keeps its proportions. Choose **Leg** (the length of a side), **Width**, or
**Height** and type it. The other two are shown, worked out from it.

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

Shaped blocks snap to a triangle grid instead. **Grid steps per side** cuts each side of the shape
into that many steps, and the grid's lines run at 60° to each other through the shape's corners.

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

**Details** holds the title, author, license, notes, and the block's **Technique** checklists:
**Techniques** and **Efficiency** (see [Libraries](/help/guides/libraries)). **Print** makes templates for the block
([Printing](/help/guides/printing)). Edits and copies of someone else's block credit them
automatically ([Credits and licenses](/help/guides/credits-and-licenses)).
`,Ze=`---
title: Getting started
order: 10
summary: Start a quilt, save it to a file, open it again, recover unsaved work, and use the app offline.
---

RRQuilts runs entirely in your browser. There is no account, and nothing is sent to a server. Your
work lives in a **project**, one file (ending in \`.rrq\`) that holds your quilts, blocks, and colors.

## Start a quilt

1. On the home page (the **RRQuilts** button in the header), choose **Start a quilt**.
2. The wizard has four steps. Use **Next** to move on, or click a step's title. A picture of the
   quilt beside the steps (under them on a phone) changes as you choose.
   - **Layout** picks the style, such as **Straight Set** (blocks in rows and columns), **On-Point**
     (blocks turned to sit as diamonds), **One Patch**, or **Strips**. **Target size** can show a
     size to aim for, from a placemat to a king bed, as an outline over the picture. For a bed, the
     outline is the mattress top with the **Drop over the sides and foot** around it. Tick
     **Pillow tuck** for a quilt that tucks under and over the pillows (extra at the head). **US
     sizes** and **European sizes** switch the list of beds, and **Tall (XL)** picks a bed's long
     version (Twin XL, or 210 cm for European beds). **Custom** takes any width and height.
     Under **Garments**, **Top** and **Pants** show a garment piece's shape for a size you pick
     (the **?** beside the size shows the size chart). Choose **Front**, **Back**, or (for a top)
     **Sleeve** with its **Sleeve length** from the shoulder to the hem. A top's front is one side of a buttoned front, and a pants front has its fly. Garments start with no borders. The size of
     your quilt and the target show at the bottom.
   - **Size** sets how many blocks (or patches, or cubes) and how big they are. For **One Patch**
     it's **Shape**, with a picture of each shape. For strip quilts it's **Strips**:
     **Horizontal** or **Vertical**, the **Strip length**, and each strip's style and **Strip
     width**, as in the Layout tab.
   - **Sashing** has **Sashing width (0 for none)**. Horizontal quilts can also have **Sashing
     around the outside**.
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
- **Open from a gist** opens a project someone shared as a GitHub gist. Paste the gist's link. The
  app shows the gist's name and the GitHub account that shared it, and the project opens when you
  choose **Open**. If the gist has more than one \`.rrq\` file, pick the one to open. This needs an internet connection, and
  saving makes a file of your own (nothing is sent back to the gist).
- To share a project as a link, put it in a GitHub gist and add the gist's link after
  \`?open_gist=\` on the app's address, for example
  \`https://ragingroosevelt.github.io/RRQuilts/?open_gist=https://gist.github.com/you/1234abcd…\`.
  Opening the link shows the gist's name and owner, and asks before it opens the project.
- **Recent projects** lists your latest ones. Click one to open it. This needs a browser that can reopen
  files, such as Chrome, Edge, or another Chromium-based browser on a computer ({{yours:file-access}}).
  Unsaved work is listed there too, in every browser.

If you start or open something else while the current project has unsaved changes, the app asks
first. Closing the tab with unsaved changes also asks you to confirm.

## Recover unsaved work

While you edit, the app keeps a **draft** of your project in the browser (within about 15 seconds of each change). A draft
is crash insurance and not a save, because clearing site data can erase it.

1. Unsaved work shows in the home page's **Recent projects** list. A project with a file gets an
   **Unsaved changes** button. Click it to open those changes. Work that was never saved to a file
   is listed as **Not saved to a file yet**. Click it to open it, or the bin to discard it.
2. Clicking a recent project that has unsaved changes asks whether to open those changes or the
   saved file. Opening the file discards the changes.
3. **Restore unsaved project**, below the recent projects on the home page, also lists all unsaved work.
4. Once it's open, press save to put the work in a file.

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
`,Qe=`---
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
2. In the **Libraries** list on the side (the **Filters** button on phones), each library has a switch.
   Libraries and packs that are off stay out of this page and your projects' trays and pickers
   (click an off pack's name to look at it). Click a library's name to
   show only it, and **Show all libraries** to see them all again. **Find a pack** at the top
   searches every library's packs. A library of packs has **All off** under its name, and
   **Get updates** and **Disconnect** when it's from the web (**Remove** when imported). Its arrow folds the list of packs away.
   If the open project uses colors or fabrics from a library you switch off, you can **Swap…** them
   for others (in the project's **Palettes** tab), **Copy to My library** to keep them, or
   **Cancel**.
3. Use **Type** to show **Blocks**, **Palettes** or **All**, then the search box. Under **Metadata**,
   the **Category**, **Tags** and **Technique** filters offer only what the shown type uses. In
   **Blocks**, **Shape** has **Fits layout** (blocks that fit a quilt layout's spaces) and **Shape**,
   and **Construction** has **Seams** and **Difficulty** (see below).
4. In **Blocks**, use **Group blocks by** to arrange blocks by **Nothing**, **Category**, **Tags** or
   **Technique**. The contents list below takes the same name.
5. Open an item's **Actions** menu for **Preview**, **Tags…**, **Rename…**, **Category…**, **Copy to my library** or **Export (.rrqbl)**. Palettes use **Export (.rrqplt)** instead, and their files carry their fabric images.
6. Click a palette, or one of its swatches, to see its colors and fabrics large. In your own
   palettes, **+** adds a color, the picture button adds fabric images, and you can drop image files
   on a palette or on this view. Click a name to rename it, then the check mark to save. **Change
   color** and the bin are under the name.

Pack items cannot be renamed or changed. Use **Copy to my library** and edit the copy. The copy keeps credit for the original author ([Credits and licenses](/help/guides/credits-and-licenses)).

## Tags and technique

**Tags** are your own words for finding things, such as _Christmas_, _scraps_ or _for Mum_. You can
tag any block or palette, including built-in ones and those in packs: choose **Tags…** in its
**Actions** menu. Tags on your own items are saved with them. Tags on other people's items are kept
in My library, so they are part of your backups, and they come back if you remove a pack and add it
again later. When you remove a pack whose items you tagged, you are asked whether to keep those
tags. Tags on items you no longer have are listed at the top of this page, with **Remove them**.

Tags stay yours: packs you make and block files you export leave them out. Suggestions while you
type come from the tags you already use, and a tag that differs only in capital letters joins the
one you have.

**Technique** is what a block's designer marks it with, in its **Details** tab (your own blocks
only). **Techniques** says what it takes beyond ordinary machine piecing: **Foundation paper piecing**,
**Appliqué** or **Hand sewing**. **Efficiency** says which faster methods it suits: **Strip
piecing**, **Quick units** (half-square triangles, quarter-square triangles or flying geese made
several at a time) or **Stitch and flip** (corners sewn on and flipped). A block with no technique is
ordinary machine piecing. The **Technique** filter lists them under the same two headings.

**⭐ Favorite** is always first in the tag list, ready to use. Blocks you mark Favorite show a star
in the top right of their picture.

**Construction** filters read each block's drawing:

- **Seams**: **Straight seams only**, **Curved seams**, or **Set-in seams** (a block that can't be
  put together with straight seams right across each part needs a set-in or partial seam).
- **Difficulty**: **Beginner** has straight seams, at most 16 pieces, and no piece narrower than
  1½ in. **Advanced** has curved or set-in seams, more than 49 pieces, or a piece narrower than
  ¾ in. Everything else is **Intermediate**.

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
2. Choose **My library** and/or **Installed packs**, then click **Back up**. You get one \`.rrqlib\` file.
   Packs that can still be downloaded from their library on the web are saved as the library's
   address, so the file stays small. Restoring connects to them again and downloads the packs.
   Packs that can't be downloaded (the library is private, gone, or you're offline) are copied in
   with their images. Which packs were switched off is kept too.
3. To restore, click **Import resource…** and pick the file. If you already have items, choose **Merge into my library (keep what's here)** or **Replace my library with the backup's**. For packs already installed, choose **Keep** or **Replace**. Then click **Restore**.

Libraries live in browser storage. If the page warns that storage is blocked, back up before closing.

## Install a pack

Under the **Libraries** list, click **Import resource…** and choose a \`.rrqlib\` pack (or a
\`.rrqplt\` palette). A file with several packs
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
5. Click **Download pack** and send the \`.rrqlib\` file.

Packs contain only what you chose. A pack never includes your projects.

## Fabric libraries

A fabric library is a set of **packs**, usually one palette of fabric images per collection.

1. In **Libraries**, click **Import resource…** and pick the library's \`.rrqlib\` file, then tick
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
4. Click **Get updates** under the library's name. Before anything changes you see which colors and
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

**Back up…** saves My library with its fabric images, as one \`.rrqlib\` file.
`,$e=`---
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
`,et=`---
title: Settings
order: 100
summary: Your name and socials, appearance, units, library options, and moving settings between devices.
---

Click the gear in the header to open **Settings** as a panel over the current screen. Changes apply at once and are stored in this browser. If the panel warns that your browser isn't keeping settings (private mode or blocked storage), use **Export** to keep a copy.

## You

- **Your name** goes into projects, blocks and packs you make. The ids of new items start with a short form of it.
- **Socials** are added with **Add a social**. Pick a **Type** (Website, a site, or one you type) and a **Handle or link**. Drag the handle at the left to reorder. The selected radio button is the one shown in printed credits.

**Show the welcome again** opens the welcome you saw on your first visit: your name, units, your
sizes, and help.

## Interface

- **Theme** can be **Auto**, **Light** or **Dark**.
- **Use the system accent color** applies where the browser shares it, and the app is blue otherwise.
- **Units for new projects** can be **Inches** or **Centimeters**. An open project's units are in its **Details** tab.
- **Show help buttons** shows the **?** buttons that open help about a screen or section.
- **Editor layout** puts the panels either as **Toolbar left, sidebar right** or as **Sidebar left, toolbar right**.

## Project

- **Hide library blocks from projects** and **Hide library palettes from projects** leave the libraries' lists out of the project's **Blocks** and **Palettes** tabs. Blocks and palettes already in use stay available.
- **Hide "My Library" blocks and palettes when they are synced with the project's** tidies the
  project's **Blocks** and **Palettes** tabs ([Libraries](/help/guides/libraries)).

## Quilt and block design

- **Sort colors and fabrics in palette by most recent use** moves the colors you picked last to the front of
  each palette in the Design tab. It's off at first, so palettes keep their own order and the color
  you pick is only highlighted.
- **Reference overlay** sets where a target size starts in the new quilt wizard and the Layout tab.
  - **Size lists** picks the US or European sizes. **Auto** follows your units.
  - **Your top** and **Your pants** keep your size (and sleeve length or inseam). Picking **Top** or
    **Pants** as a target starts from them.
  - **Your bed** keeps your bed with its drop, pillow tuck, and Tall (XL). Picking that bed starts
    from them.
  - Each starts unset. **Set now** sets it here, or the first one you use in the new quilt wizard
    sets it. **Clear** unsets it.

Each part of these sections is a card. Click its title to close or open it.

## Fabrics

- **Fabric images** chooses how fabrics appear. **Show them, with average colors while they load**
  is the default. **Average colors only (never load images)** is fastest and uses no space for
  library images.
- **Image size on screen** picks **Light (256 px)** or **Standard (512 px)**. After switching to
  Standard, fabrics from libraries added from the web download their larger images as they're
  shown.
- **Your fabric images in saved projects** sets the size your own fabrics are saved at. Library
  fabrics are saved as references, not images.

While fabric images load, a spinner with a count shows in the header. Images missing from this
device are downloaded from their library when it was added from the web. Any that still can't be
found show as a warning with a count, and their fabrics use average colors. Click it to try again.

## Move settings to another device

1. In Settings, under **Settings file (.rrqconf)**, click **Export**.
2. On the other device, open Settings and click **Import**, then pick the file.

Anything in the file that isn't valid is reset to its default, and the message says which. Print options live in the Print tab ([Printing](/help/guides/printing)) but travel in the same file.
`,tt=`---
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
2. **Import quilts** reads another project file (\`.rrq\`). Tick the quilts to add to this project.
   The blocks, colors and fabrics they use come with them. Anything already here is shared, and a
   block that differs from your version of it comes in as a copy. Undo removes
   the whole import.
3. Use the three-dot **Actions** menu on a card for **Open**, **Create copy** (a copy to
   try other colors on), **Export quilt…**, **Details**, and **Delete** (you can undo). **Export
   quilt…** saves a project file holding just that quilt and the blocks, colors and fabrics it uses.
   Open it as a project, or bring the quilt into another project with **Import quilts**.
4. Drag cards to reorder them, with a mouse or, on a touch screen, by pressing a card until it lifts.
   The card you move stays faded in its place while a copy follows your finger or pointer, and the
   edges either side of where the quilt will land light up. Let go anywhere and it lands there. Esc
   puts it back. Near the top or bottom of the window the page scrolls.
5. With the keyboard, tab to the handle left of a quilt's name and use the arrow keys, or Home and
   End to move it to the start or end.

## Blocks

**My blocks** are the blocks stored in this project.

The sidebar beside the blocks (on a phone, the **Filters** button) works as on the Libraries page: a search of names and notes, **Metadata**
(**Category**, **Tags**, **Technique**), **Shape** (**Fits layout**, for blocks that fit a quilt
layout's spaces, and **Shape**) and **Construction** (**Seams**, **Difficulty**). They narrow
both My blocks and Library blocks. **Group library blocks by** sorts library blocks into sections by
category, tag or technique, and the contents list below it jumps to My blocks or a library section.
See [Libraries](/help/guides/libraries) for tags, technique and construction.
While a filter is on, blocks can't be moved.

1. **New block** asks for a name and opens the block editor ([Drawing blocks](/help/guides/drawing-blocks)).
2. **Import blocks** reads blocks from a \`.rrqbl\` file or from another project. Tick the ones to add.
3. A block's **Actions** menu offers **Edit a copy**, **Preview**, **Open in block editor**, **Print**, **Details**, **Tags…**,
   **Export (.rrqbl)**, **Delete**, plus **Add to my library…** or **Sync to my library** for the My library
   links. Small icons on a card show that the block is
   placed in a quilt, is in My library, or has changed since it was saved there. Drag My blocks into
   order as you do quilts, or tab to the handle left of a block's name and use the arrow keys.
4. **Library blocks** lists blocks from the built-in set and your libraries, grouped by library and
   category. Tick the ones to use in this project's quilts. You can't edit them directly. **Edit
   (make a copy)** makes your own copy, and **Create a coloration variant** keeps the drawing but
   lets you recolor it ([Block colorings](/help/guides/block-colorings)). A project has one
   coloration variant per library block: asking again adds a new coloring to the one you have. **Open in block
   editor** and **Print** show a library block in the block editor, read-only, with both of those
   buttons at the top. A quilt's menu has **Print** too.

Deleting a block that is placed in a quilt asks first. It can also remove it from those quilts.
Libraries themselves are covered in [Libraries](/help/guides/libraries).

## Palettes

**Project palettes** hold your own colors and fabric images ([Colors and
palettes](/help/guides/colors-and-palettes)). **New palette** adds one.

- Click a palette to see its colors and fabrics large. There, **+** adds a color and the picture
  button adds fabric images. Drop image files on a palette to add them too.
- A palette's **⋮** menu renames it, saves it to My library, exports it, or deletes it.
- A palette saved to My library stays linked to it. A sync icon beside its name is green while
  both match and amber when they differ. **Synchronize changes** brings each side's changes to the
  other. A color or fabric changed in both is listed for you to choose. **Break sync link** ends
  the link.
- **Import palette (.rrqplt)** adds a palette file.
- **Library palettes** lists palettes you can turn on. Ticked ones appear in the color trays.

## Details

The **Details** tab holds the project's title, author, license, units (**Inches** or
**Centimeters**), and notes. See [Credits and licenses](/help/guides/credits-and-licenses).
`,nt=`---
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

<svg viewBox="0 0 250 120" width="375" role="img" aria-label="A quilt top of two Mexican Cross II blocks centered on a larger gold backing, with overhang on every side. Brackets mark the quilt width and height">
  <defs><pattern id="mx-backing" patternUnits="userSpaceOnUse" x="25" y="25" width="40" height="40"><polygon points="11.51,20.0 14.34,22.83 17.17,20.0 14.34,17.17" fill="#c4282c"/><polygon points="14.34,17.17 17.17,20.0 20.0,17.17 17.17,14.34" fill="#5a78a0"/><polygon points="17.17,14.34 20.0,17.17 22.83,14.34 20.0,11.51" fill="#c4282c"/><polygon points="14.34,22.83 17.17,25.66 20.0,22.83 17.17,20.0" fill="#5a78a0"/><polygon points="17.17,20.0 20.0,22.83 22.83,20.0 20.0,17.17" fill="#c4282c"/><polygon points="20.0,17.17 22.83,20.0 25.66,17.17 22.83,14.34" fill="#5a78a0"/><polygon points="17.17,25.66 20.0,28.49 22.83,25.66 20.0,22.83" fill="#c4282c"/><polygon points="20.0,22.83 22.83,25.66 25.66,22.83 22.83,20.0" fill="#5a78a0"/><polygon points="22.83,20.0 25.66,22.83 28.49,20.0 25.66,17.17" fill="#c4282c"/><polygon points="25.66,22.83 40.0,37.17 40.0,40.0 37.17,40.0 22.83,25.66" fill="#f4ecd8"/><polygon points="17.17,25.66 2.83,40.0 0.0,40.0 0.0,37.17 14.34,22.83" fill="#f4ecd8"/><polygon points="14.34,17.17 0.0,2.83 0.0,0.0 2.83,0.0 17.17,14.34" fill="#f4ecd8"/><polygon points="22.83,14.34 37.17,0.0 40.0,0.0 40.0,2.83 25.66,17.17" fill="#f4ecd8"/><polygon points="31.51,40.0 20.0,28.49 22.83,25.66 31.51,34.34" fill="#5a78a0"/><polygon points="0.0,31.51 11.51,20.0 14.34,22.83 5.66,31.51" fill="#5a78a0"/><polygon points="8.49,0.0 20.0,11.51 17.17,14.34 8.49,5.66" fill="#5a78a0"/><polygon points="40.0,8.49 28.49,20.0 25.66,17.17 34.34,8.49" fill="#5a78a0"/><polygon points="28.49,20.0 40.0,31.51 34.34,31.51 25.66,22.83" fill="#5a78a0"/><polygon points="20.0,28.49 8.49,40.0 8.49,34.34 17.17,25.66" fill="#5a78a0"/><polygon points="11.51,20.0 0.0,8.49 5.66,8.49 14.34,17.17" fill="#5a78a0"/><polygon points="20.0,11.51 31.51,0.0 31.51,5.66 22.83,14.34" fill="#5a78a0"/><polygon points="37.17,40.0 31.51,40.0 31.51,34.34" fill="#c4282c"/><polygon points="0.0,37.17 0.0,31.51 5.66,31.51" fill="#c4282c"/><polygon points="2.83,0.0 8.49,0.0 8.49,5.66" fill="#c4282c"/><polygon points="40.0,2.83 40.0,8.49 34.34,8.49" fill="#c4282c"/><polygon points="40.0,31.51 40.0,37.17 34.34,31.51" fill="#c4282c"/><polygon points="8.49,40.0 2.83,40.0 8.49,34.34" fill="#c4282c"/><polygon points="0.0,8.49 0.0,2.83 5.66,8.49" fill="#c4282c"/><polygon points="31.51,0.0 37.17,0.0 31.51,5.66" fill="#c4282c"/><polygon points="31.51,40.0 8.49,40.0 20.0,28.49" fill="#96c4e8"/><polygon points="0.0,31.51 0.0,8.49 11.51,20.0" fill="#96c4e8"/><polygon points="8.49,0.0 31.51,0.0 20.0,11.51" fill="#96c4e8"/><polygon points="40.0,8.49 40.0,31.51 28.49,20.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="110" height="70" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="80" height="40" fill="url(#mx-backing)" stroke="currentColor" stroke-width="1.5"/>
  <defs><pattern id="mx-backing-key" patternUnits="userSpaceOnUse" x="140" y="72" width="12" height="12"><polygon points="3.45,6.0 4.3,6.85 5.15,6.0 4.3,5.15" fill="#c4282c"/><polygon points="4.3,5.15 5.15,6.0 6.0,5.15 5.15,4.3" fill="#5a78a0"/><polygon points="5.15,4.3 6.0,5.15 6.85,4.3 6.0,3.45" fill="#c4282c"/><polygon points="4.3,6.85 5.15,7.7 6.0,6.85 5.15,6.0" fill="#5a78a0"/><polygon points="5.15,6.0 6.0,6.85 6.85,6.0 6.0,5.15" fill="#c4282c"/><polygon points="6.0,5.15 6.85,6.0 7.7,5.15 6.85,4.3" fill="#5a78a0"/><polygon points="5.15,7.7 6.0,8.55 6.85,7.7 6.0,6.85" fill="#c4282c"/><polygon points="6.0,6.85 6.85,7.7 7.7,6.85 6.85,6.0" fill="#5a78a0"/><polygon points="6.85,6.0 7.7,6.85 8.55,6.0 7.7,5.15" fill="#c4282c"/><polygon points="7.7,6.85 12.0,11.15 12.0,12.0 11.15,12.0 6.85,7.7" fill="#f4ecd8"/><polygon points="5.15,7.7 0.85,12.0 0.0,12.0 0.0,11.15 4.3,6.85" fill="#f4ecd8"/><polygon points="4.3,5.15 0.0,0.85 0.0,0.0 0.85,0.0 5.15,4.3" fill="#f4ecd8"/><polygon points="6.85,4.3 11.15,0.0 12.0,0.0 12.0,0.85 7.7,5.15" fill="#f4ecd8"/><polygon points="9.45,12.0 6.0,8.55 6.85,7.7 9.45,10.3" fill="#5a78a0"/><polygon points="0.0,9.45 3.45,6.0 4.3,6.85 1.7,9.45" fill="#5a78a0"/><polygon points="2.55,0.0 6.0,3.45 5.15,4.3 2.55,1.7" fill="#5a78a0"/><polygon points="12.0,2.55 8.55,6.0 7.7,5.15 10.3,2.55" fill="#5a78a0"/><polygon points="8.55,6.0 12.0,9.45 10.3,9.45 7.7,6.85" fill="#5a78a0"/><polygon points="6.0,8.55 2.55,12.0 2.55,10.3 5.15,7.7" fill="#5a78a0"/><polygon points="3.45,6.0 0.0,2.55 1.7,2.55 4.3,5.15" fill="#5a78a0"/><polygon points="6.0,3.45 9.45,0.0 9.45,1.7 6.85,4.3" fill="#5a78a0"/><polygon points="11.15,12.0 9.45,12.0 9.45,10.3" fill="#c4282c"/><polygon points="0.0,11.15 0.0,9.45 1.7,9.45" fill="#c4282c"/><polygon points="0.85,0.0 2.55,0.0 2.55,1.7" fill="#c4282c"/><polygon points="12.0,0.85 12.0,2.55 10.3,2.55" fill="#c4282c"/><polygon points="12.0,9.45 12.0,11.15 10.3,9.45" fill="#c4282c"/><polygon points="2.55,12.0 0.85,12.0 2.55,10.3" fill="#c4282c"/><polygon points="0.0,2.55 0.0,0.85 1.7,2.55" fill="#c4282c"/><polygon points="9.45,0.0 11.15,0.0 9.45,1.7" fill="#c4282c"/><polygon points="9.45,12.0 2.55,12.0 6.0,8.55" fill="#96c4e8"/><polygon points="0.0,9.45 0.0,2.55 3.45,6.0" fill="#96c4e8"/><polygon points="2.55,0.0 9.45,0.0 6.0,3.45" fill="#96c4e8"/><polygon points="12.0,2.55 12.0,9.45 8.55,6.0" fill="#96c4e8"/></pattern></defs>
  <rect x="140" y="72" width="12" height="12" fill="url(#mx-backing-key)" stroke="currentColor"/>
  <text x="158" y="82" font-size="11" fill="currentColor">quilt top</text>
  <rect x="140" y="90" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="158" y="100" font-size="11" fill="currentColor">backing</text>
  <line x1="25.0" y1="67.0" x2="25.0" y2="77.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="105.0" y1="67.0" x2="105.0" y2="77.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="25.0" y1="73.0" x2="105.0" y2="73.0" stroke="currentColor"/>
  <line x1="25.0" y1="77.0" x2="25.0" y2="69.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="105.0" y1="77.0" x2="105.0" y2="69.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="65.0" y="98.0" font-size="11" fill="currentColor" text-anchor="middle">quilt width</text>
  <line x1="107.0" y1="25.0" x2="117.0" y2="25.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="107.0" y1="65.0" x2="117.0" y2="65.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="113.0" y1="25.0" x2="113.0" y2="65.0" stroke="currentColor"/>
  <line x1="109.0" y1="25.0" x2="117.0" y2="25.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="109.0" y1="65.0" x2="117.0" y2="65.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="127.0" y="49.0" font-size="11" fill="currentColor">quilt height</text>
</svg>

## Worked examples

| Quilt        | Backing      | Panels (40″ / 105 cm usable)              | Fabric        |
| ------------ | ------------ | ----------------------------------------- | ------------- |
| 60″ × 72″    | 68″ × 80″    | 2 side to side, 2 × 68 = 136″ (vs 160″)   | 139½″ = 3⅞ yd |
| 150 × 180 cm | 170 × 200 cm | 2 side to side, 2 × 170 = 340 cm (vs 400) | 340 cm        |

::calc backing
`,rt=`---
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
`,it=`---
title: Borders
order: 80
summary: Straight and mitered border strips, and why a mitered strip is longer.
---

Borders frame the quilt. The calculator gives both kinds for a quilt of a given size (before the
border) and border width. All three are finished sizes, without seam allowances. To get the quilt's
finished size, measure the center edge to edge and subtract two seam allowances. The calculator adds
the seam allowances to the strips.

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
- **SA** for the seam allowance on the border's outer edge, which pushes the strip's edge out, and so the
  diagonal's end point along the edge, by one more SA.

<svg viewBox="0 0 345 170" width="517" role="img" aria-label="A quilt center with a mitered border all around. Brackets mark the width and height before the border and the border width">
  <rect x="22" y="26" width="156" height="104" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="44" width="120" height="68" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="22" y1="26" x2="40" y2="44" stroke="currentColor"/>
  <line x1="178" y1="26" x2="160" y2="44" stroke="currentColor"/>
  <line x1="22" y1="130" x2="40" y2="112" stroke="currentColor"/>
  <line x1="178" y1="130" x2="160" y2="112" stroke="currentColor"/>
  <line x1="40.0" y1="114.0" x2="40.0" y2="148.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="160.0" y1="114.0" x2="160.0" y2="148.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="40.0" y1="144.0" x2="160.0" y2="144.0" stroke="currentColor"/>
  <line x1="40.0" y1="148.0" x2="40.0" y2="140.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="160.0" y1="148.0" x2="160.0" y2="140.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="100.0" y="158.0" font-size="11" fill="currentColor" text-anchor="middle">finished width, no border</text>
  <line x1="162.0" y1="44.0" x2="196.0" y2="44.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="162.0" y1="112.0" x2="196.0" y2="112.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="192.0" y1="44.0" x2="192.0" y2="112.0" stroke="currentColor"/>
  <line x1="188.0" y1="44.0" x2="196.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="188.0" y1="112.0" x2="196.0" y2="112.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="198.0" y="82.0" font-size="11" fill="currentColor">finished height, no border</text>
  <line x1="102.0" y1="26.0" x2="104.0" y2="26.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="102.0" y1="44.0" x2="104.0" y2="44.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="100.0" y1="26.0" x2="100.0" y2="44.0" stroke="currentColor"/>
  <line x1="96.0" y1="26.0" x2="104.0" y2="26.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="96.0" y1="44.0" x2="104.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="100.0" y="20" font-size="11" fill="currentColor" text-anchor="middle">finished border width</text>
  <rect x="222" y="104" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="240" y="114" font-size="11" fill="currentColor">quilt center</text>
  <rect x="222" y="122" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="240" y="132" font-size="11" fill="currentColor">border, mitered</text>
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
`,at=`---
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

<svg viewBox="0 0 345 130" width="517" role="img" aria-label="A flying-geese unit: the goose triangle pointing up, a sky triangle in each top corner. Brackets mark the finished width and height">
  <rect x="10" y="10" width="160" height="80" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="10,10 90,10 10,90" fill="#daa828" stroke="currentColor"/>
  <polygon points="170,10 90,10 170,90" fill="#daa828" stroke="currentColor"/>
  <line x1="10.0" y1="92.0" x2="10.0" y2="108.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="170.0" y1="92.0" x2="170.0" y2="108.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="10.0" y1="104.0" x2="170.0" y2="104.0" stroke="currentColor"/>
  <line x1="10.0" y1="108.0" x2="10.0" y2="100.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="170.0" y1="108.0" x2="170.0" y2="100.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="90.0" y="118.0" font-size="11" fill="currentColor" text-anchor="middle">finished width</text>
  <line x1="172.0" y1="10.0" x2="188.0" y2="10.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="172.0" y1="90.0" x2="188.0" y2="90.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="184.0" y1="10.0" x2="184.0" y2="90.0" stroke="currentColor"/>
  <line x1="180.0" y1="10.0" x2="188.0" y2="10.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="180.0" y1="90.0" x2="188.0" y2="90.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="190.0" y="54.0" font-size="11" fill="currentColor">finished height</text>
  <rect x="210" y="76" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="228" y="86" font-size="11" fill="currentColor">goose (large square)</text>
  <rect x="210" y="92" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="228" y="102" font-size="11" fill="currentColor">sky (small squares)</text>
</svg>

## Worked examples

A 4″ × 2″ finished unit made by stitch and flip needs a 4½″ × 2½″ rectangle and two 2½″ squares. Four at
a time uses one 5¼″ square for the geese and four 2⅞″ squares for the sky. For 10 × 5 cm, stitch and flip
needs an 11.5 × 6.5 cm rectangle with two 6.5 cm squares, and four at a time needs one 14 cm square and four 8 cm squares.

::calc geese
`,ot=`---
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

<svg viewBox="0 0 390 155" width="585" role="img" aria-label="A cut square halved on the diagonal, and one of its triangles with the finished triangle dashed inside it, a seam allowance from every side. A bracket marks the finished leg">
  <rect x="10" y="40" width="92.5" height="92.5" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="132.5" x2="102.5" y2="40" stroke="currentColor" stroke-width="1.5"/>
  <text x="56.2" y="148.5" font-size="11" fill="currentColor" text-anchor="middle">cut square</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="110.5" y1="86.2" x2="140" y2="86.2" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <polygon points="150,40 242.5,40 150,132.5" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="156.0,46.0 228.0,46.0 156.0,118.0" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="156.0" y1="44.0" x2="156.0" y2="20.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="228.0" y1="44.0" x2="228.0" y2="20.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="156.0" y1="24.0" x2="228.0" y2="24.0" stroke="currentColor"/>
  <line x1="156.0" y1="28.0" x2="156.0" y2="20.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="228.0" y1="28.0" x2="228.0" y2="20.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="192.0" y="22.0" font-size="11" fill="currentColor" text-anchor="middle">finished leg</text>
  <text x="255" y="80" font-size="11" fill="currentColor">one triangle at its cut</text>
  <text x="255" y="96" font-size="11" fill="currentColor">size (solid), finished</text>
  <text x="255" y="112" font-size="11" fill="currentColor">triangle (dashed)</text>
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
`,st=`---
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
- **The quilt**, with n blocks across the top row and m down the side, is n × f × √2 wide and
  m × f × √2 tall. It holds n × m + (n − 1)(m − 1) blocks and 2(n − 1) + 2(m − 1) side triangles.
  A half in either count adds half a block's width on point to that side, and the quilt ends on a
  short row (or column) there.

<svg viewBox="0 0 420 150" width="630" role="img" aria-label="Eight blocks turned on point, with side triangles along the edges and corner triangles at the corners. A bracket marks the side of one block">
  <rect x="10" y="30" width="144" height="96" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="34,30 58,54 34,78 10,54" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="34,78 58,102 34,126 10,102" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="58,54 82,78 58,102 34,78" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="82,30 106,54 82,78 58,54" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="82,78 106,102 82,126 58,102" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="106,54 130,78 106,102 82,78" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="130,30 154,54 130,78 106,54" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="130,78 154,102 130,126 106,102" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="212,54 236,78 212,102 188,78" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="213.4" y1="52.6" x2="221.9" y2="44.1" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="237.4" y1="76.6" x2="245.9" y2="68.1" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="219.1" y1="46.9" x2="243.1" y2="70.9" stroke="currentColor"/>
  <line x1="216.2" y1="49.8" x2="221.9" y2="44.1" stroke="currentColor" stroke-width="1.5"/>
  <line x1="240.2" y1="73.8" x2="245.9" y2="68.1" stroke="currentColor" stroke-width="1.5"/>
  <text x="232" y="46" font-size="11" fill="currentColor">finished block side</text>
  <text x="212" y="118" font-size="11" fill="currentColor" text-anchor="middle">one block</text>
  <rect x="270" y="74" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="288" y="84" font-size="11" fill="currentColor">blocks on point</text>
  <rect x="270" y="92" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="288" y="102" font-size="11" fill="currentColor">side and corner triangles</text>
</svg>

## Worked examples

| Finished block | Block diagonal | Side triangles (cut both diagonals) | Corner triangles (cut once) |
| -------------- | -------------- | ----------------------------------- | --------------------------- |
| 10″            | 14.142″        | 15⅜″ square (15.349″)               | 8″ square (7.925″)          |
| 25 cm          | 35.36 cm       | 39 cm square (38.98 cm)             | 20.5 cm square (20.24 cm)   |

The calculator gives sizes for one side triangle square (it makes 4 triangles) and one corner square
(2 triangles). The number you need depends on the layout.

::calc onpoint
`,ct=`---
title: Patches from yardage and fat quarters
order: 110
summary: How much fabric a set of patches needs, from the bolt or in fat quarters.
---

Yardage depends on how pieces are cut from strips. The app plans whole strips across the usable
width of the fabric.

## The method

1. Work out the cut size of one patch (see [Squares and rectangles](/help/math/squares-and-rectangles)).
2. The strip is as wide as the patch's shorter cut side, and the patches lie along it. **Patches per
   strip = ⌊usable width ÷ longer cut side⌋.** The rest of each strip is left over.
3. **Strips = ⌈patches ÷ patches per strip⌉.**
4. **Fabric = strips × strip width**, rounded up to your fabric step (⅛ yd or 10 cm by default).

Usable width is a little less than the printed width, since selvages are trimmed (a 42″ bolt gives
40″, 110 cm gives 105 cm).

## Fat quarters

A fat quarter is 18″ × 21″ (50 × 55 cm), with 20″ (53 cm) usable. Strips are packed into the 18″ (50
cm) depth. The calculator counts how many fat quarters the strips fit into.

<svg viewBox="0 0 500 135" width="750" role="img" aria-label="Fabric with three strips marked across its usable width and the leftover below, the three strips cut apart with the first cut into patches and a leftover end, and one patch with its finished length and width bracketed">
  <rect x="10" y="14" width="150" height="90" fill="#daa828" fill-opacity="0.35" stroke="currentColor" stroke-width="1.5"/>
  <rect x="10" y="14" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="10" y="38" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="10" y="62" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <text x="85.0" y="99" font-size="11" fill="#333" text-anchor="middle">leftover</text>
  <line x1="10.0" y1="106.0" x2="10.0" y2="120.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="160.0" y1="106.0" x2="160.0" y2="120.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="10.0" y1="116.0" x2="160.0" y2="116.0" stroke="currentColor"/>
  <line x1="10.0" y1="120.0" x2="10.0" y2="112.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="160.0" y1="120.0" x2="160.0" y2="112.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="85.0" y="130.0" font-size="11" fill="currentColor" text-anchor="middle">usable width</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="166" y1="54" x2="184" y2="54" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <rect x="190" y="14" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="190" y="44" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="190" y="74" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <line x1="222" y1="14" x2="222" y2="38" stroke="currentColor"/>
  <line x1="254" y1="14" x2="254" y2="38" stroke="currentColor"/>
  <line x1="286" y1="14" x2="286" y2="38" stroke="currentColor"/>
  <rect x="318" y="14" width="22" height="24" fill="#f6e7bd" stroke="currentColor"/>
  <text x="265.0" y="114" font-size="11" fill="currentColor" text-anchor="middle">strips, cut into patches</text>
  <line x1="346" y1="26.0" x2="364" y2="26.0" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <rect x="370" y="14" width="32" height="24" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="373" y="17" width="26" height="18" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="373.0" y1="37.0" x2="373.0" y2="52.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="399.0" y1="37.0" x2="399.0" y2="52.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="373.0" y1="48.0" x2="399.0" y2="48.0" stroke="currentColor"/>
  <line x1="373.0" y1="52.0" x2="373.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="399.0" y1="52.0" x2="399.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="386.0" y="62.0" font-size="11" fill="currentColor" text-anchor="middle">finished length</text>
  <line x1="401.0" y1="17.0" x2="416.0" y2="17.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="401.0" y1="35.0" x2="416.0" y2="35.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="412.0" y1="17.0" x2="412.0" y2="35.0" stroke="currentColor"/>
  <line x1="408.0" y1="17.0" x2="416.0" y2="17.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="408.0" y1="35.0" x2="416.0" y2="35.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="418.0" y="30.0" font-size="11" fill="currentColor">finished width</text>
  <text x="386.0" y="90" font-size="11" fill="currentColor" text-anchor="middle">one patch</text>
</svg>

## Worked examples (40 patches)

| Finished  | Cut           | Per strip (bolt) | Strips | Fabric (bolt)                | Fat quarters       |
| --------- | ------------- | ---------------- | ------ | ---------------------------- | ------------------ |
| 4″ × 2″   | 4½″ × 2½″     | 8                | 5      | 12½″, rounded up to ⅜ yd     | 2 (10 strips of 4) |
| 10 × 5 cm | 11.5 × 6.5 cm | 9                | 5      | 32.5 cm, rounded up to 40 cm | 2 (10 strips of 4) |

::calc yardage
`,lt=`---
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

<svg viewBox="0 0 395 150" width="592" role="img" aria-label="A cut square quartered on both diagonals, and one of its triangles with the finished triangle dashed inside it. A bracket marks the finished long side">
  <rect x="10" y="18.3" width="93.7" height="93.7" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="18.3" x2="103.7" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <line x1="103.7" y1="18.3" x2="10" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <text x="56.9" y="128" font-size="11" fill="currentColor" text-anchor="middle">cut square</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="111.7" y1="88.6" x2="140" y2="88.6" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <polygon points="150,112 243.7,112 196.9,65.1" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="160.9,107.5 232.9,107.5 196.9,71.5" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="160.9" y1="109.5" x2="160.9" y2="130.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="232.9" y1="109.5" x2="232.9" y2="130.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="160.9" y1="126.0" x2="232.9" y2="126.0" stroke="currentColor"/>
  <line x1="160.9" y1="130.0" x2="160.9" y2="122.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="232.9" y1="130.0" x2="232.9" y2="122.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="196.9" y="140.0" font-size="11" fill="currentColor" text-anchor="middle">finished long side</text>
  <text x="255" y="64" font-size="11" fill="currentColor">one of the 4 triangles at</text>
  <text x="255" y="80" font-size="11" fill="currentColor">its cut size (solid),</text>
  <text x="255" y="96" font-size="11" fill="currentColor">finished triangle (dashed)</text>
</svg>

## Worked examples

| Finished long side | Exact cut | Cut (rounded up)             | Makes       |
| ------------------ | --------- | ---------------------------- | ----------- |
| 4″                 | 5.207″    | 5¼″ square                   | 4 triangles |
| 10 cm              | 13.62 cm  | 14 cm square (5 mm rounding) | 4 triangles |

::calc qst
`,ut=`---
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
`,dt=`---
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

<svg viewBox="0 0 230 110" width="345" role="img" aria-label="A cut square of fabric with a dashed sewing line inside it. The band between them is the seam allowance">
  <rect x="10" y="10" width="100" height="90" style="fill: #daa828; filter: brightness(0.8)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="70" height="60" fill="#daa828" stroke="#333" stroke-dasharray="4 3"/>
  <text x="125" y="40" font-size="11" fill="currentColor">cut edge (solid)</text>
  <text x="125" y="58" font-size="11" fill="currentColor">sewing line (dashed)</text>
  <text x="125" y="76" font-size="11" fill="currentColor">seam allowance (darker)</text>
</svg>

## Where it shows up

- A square or rectangle adds **2 × SA** to each dimension (one seam on each side). See
  [Squares and rectangles](/help/math/squares-and-rectangles).
- Triangles add more than 2 × SA, because their points and angled seams need extra. See
  [Half-square triangles](/help/math/half-square-triangles) and
  [Quarter-square triangles](/help/math/quarter-square-triangles).
- The final size is rounded up to a mark on the ruler. See [Rounding](/help/math/rounding).
`,ft=`---
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

<svg viewBox="0 0 260 150" width="390" role="img" aria-label="A square with a tilted center square inside it, touching the middle of each side, and a triangle in each corner. A bracket marks the finished unit side">
  <rect x="10" y="10" width="100" height="100" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="60,10 110,60 60,110 10,60" style="fill: var(--q-primary)" stroke="currentColor"/>
  <line x1="10.0" y1="112.0" x2="10.0" y2="128.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="110.0" y1="112.0" x2="110.0" y2="128.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="10.0" y1="124.0" x2="110.0" y2="124.0" stroke="currentColor"/>
  <line x1="10.0" y1="128.0" x2="10.0" y2="120.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="110.0" y1="128.0" x2="110.0" y2="120.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="60.0" y="138.0" font-size="11" fill="currentColor" text-anchor="middle">finished unit side</text>
  <rect x="130" y="40" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="148" y="50" font-size="11" fill="currentColor">tilted center</text>
  <rect x="130" y="58" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="148" y="68" font-size="11" fill="currentColor">4 corner triangles</text>
</svg>

## Worked examples

| Finished unit | Center cut            | Corner squares (cut once) |
| ------------- | --------------------- | ------------------------- |
| 4″            | 3.328″ → 3⅜″ square   | 2 × 2⅞″ square            |
| 10 cm         | 8.57 cm → 9 cm square | 2 × 8 cm square           |

The calculator rounds up to your ruler. See [Rounding](/help/math/rounding). For several units at
once, see [Square-in-a-square units](/help/techniques/square-in-a-square-units).

::calc sqinsq
`,pt=`---
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

<svg viewBox="0 0 345 130" width="517" role="img" aria-label="A rectangle of fabric with the finished area dashed inside it and a seam allowance on every side. Brackets mark the finished length and width">
  <rect x="10" y="10" width="120" height="80" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="90" height="50" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="25.0" y1="77.0" x2="25.0" y2="110.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="115.0" y1="77.0" x2="115.0" y2="110.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="25.0" y1="106.0" x2="115.0" y2="106.0" stroke="currentColor"/>
  <line x1="25.0" y1="110.0" x2="25.0" y2="102.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="115.0" y1="110.0" x2="115.0" y2="102.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="70.0" y="120.0" font-size="11" fill="currentColor" text-anchor="middle">finished length</text>
  <line x1="117.0" y1="25.0" x2="150.0" y2="25.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="117.0" y1="75.0" x2="150.0" y2="75.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="146.0" y1="25.0" x2="146.0" y2="75.0" stroke="currentColor"/>
  <line x1="142.0" y1="25.0" x2="150.0" y2="25.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="142.0" y1="75.0" x2="150.0" y2="75.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="152" y="66" font-size="11" fill="currentColor">finished width</text>
  <text x="190" y="20" font-size="11" fill="currentColor">cut (solid) = finished</text>
  <text x="190" y="36" font-size="11" fill="currentColor">(dashed) + SA on each side</text>
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
[Patches from yardage and fat quarters](/help/math/patches-from-yardage).
`,mt=`---
title: Calculators
order: 10
summary: Every Quilt Math calculator on one page, for cut sizes, borders, binding, backing, and yardage.
cards: true
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

## Patches from yardage

::diagram math/patches-from-yardage

The formula is in [patches from yardage and fat quarters](/help/math/patches-from-yardage).

::calc yardage

## Rounding

The formula is in [rounding](/help/math/rounding).

::calc rounding
`,ht=`---
title: Block and quilt directories
order: 10
summary: Reference books of quilt blocks, patterns, and techniques.
---

- _1000 Great Quilt Blocks_ by Maggi McCormick Gordon ([Google Books](https://books.google.com/books/about/1000_Great_Quilt_Blocks/AaDUPAAACAAJ), [Internet Archive](https://archive.org/details/1000greatquiltbl0000gord/))
- _Creative Log Cabin Quilting_, edited by Jeanne Stauffer and Sandra L. Hatch ([Google Books](https://books.google.com/books/about/Creative_Log_Cabin_Quilting/pv1YJDz-QnYC), [Internet Archive](https://archive.org/details/creativelogcabin0000unse/))
- _Make a Quilt in a Day: Log Cabin Pattern_ by Eleanor Burns ([Google Books](https://books.google.com/books/about/Make_a_Quilt_in_a_Day/TIcxcAAACAAJ), [Internet Archive](https://archive.org/details/makequiltindaylo0000burn))
- _The Quilting Bible: The Complete Photo Guide to Machine Quilting_, 3rd edition, by Creative Publishing International ([Google Books](https://www.google.com/books/about/The_Quilting_Bible_3rd_Edition/N2PKGQYAZmYC), [Internet Archive](https://archive.org/details/quiltingbiblecom00crea))
- _Ultimate Quilting Bible: A Complete Reference with Step-by-Step Techniques_ by Marie Clayton ([Google Books](https://www.google.com/books/about/Ultimate_Quilting_Bible/SlAmEAAAQBAJ), [Internet Archive](https://archive.org/details/ultimatequilting0000clay))
`,gt=`---
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
`,_t=`---
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
  <line x1="10" y1="46" x2="124" y2="46" stroke="#fff" stroke-dasharray="4 3"/>
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
  <g transform="translate(139.5 178) rotate(90)">
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

<svg viewBox="0 0 370 103.3" width="555" role="img" aria-label="One unit as cut, light fabric wrong side up with the seam a quarter inch in from the long side, and the same unit pressed open toward the dark fabric: a square with a small dog ear at each end of the seam">
  <polygon points="76.0,70.0 14.0,70.0 76.0,8.0" fill="#f6e7bd" stroke="currentColor" stroke-width="1.5"/>
  <line x1="19.7" y1="70.0" x2="76.0" y2="13.7" stroke="#333" stroke-dasharray="4 3"/>
  <text x="45.0" y="86.0" font-size="11" fill="currentColor" text-anchor="middle">as cut</text>
  <polygon points="155.7,75.7 155.7,81.3 161.3,75.7" fill="#daa828" stroke="currentColor"/>
  <polygon points="212.0,19.3 217.7,19.3 212.0,25.0" fill="#daa828" stroke="currentColor"/>
  <polygon points="212.0,75.7 155.7,75.7 212.0,19.3" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="155.7,19.3 155.7,75.7 212.0,19.3" fill="#daa828" stroke="currentColor"/>
  <text x="183.8" y="97.3" font-size="11" fill="currentColor" text-anchor="middle">pressed</text>
  <rect x="240" y="14" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="258" y="24" font-size="11" fill="currentColor">light fabric, wrong side</text>
  <rect x="240" y="30" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="258" y="40" font-size="11" fill="currentColor">light fabric, right side</text>
  <rect x="240" y="46" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="258" y="56" font-size="11" fill="currentColor">dark fabric, right side</text>
  <text x="240" y="80" font-size="11" fill="currentColor">trim off the dog ears</text>
  <text x="240" y="96" font-size="11" fill="currentColor">at the seam's ends</text>
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

3. Sew a triangle to two opposite sides of the center, matching the marks. Press the triangles away
   from the center square.

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

4. Sew the other two triangles to the remaining sides in the same way, and press them away from the center square.

<svg viewBox="0 0 330 124" width="495" role="img" aria-label="Before pressing: the other two corner triangles, wrong side up, on the top and bottom edges of the unit, long sides along the edges and centered, with the seam a quarter inch in from each edge">
  <polygon points="76.2,26.3 71.2,21.3 71.2,102.7 76.2,97.7" fill="#f6e7bd" stroke="currentColor"/>
  <polygon points="133.8,26.3 138.8,21.3 138.8,102.7 133.8,97.7" fill="#f6e7bd" stroke="currentColor"/>
  <rect x="76.2" y="28.2" width="57.5" height="67.5" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="76.2,26.3 76.2,97.7 40.6,62" fill="#daa828" stroke="currentColor"/>
  <polygon points="133.8,26.3 133.8,97.7 169.4,62" fill="#daa828" stroke="currentColor"/>
  <polygon points="64.3,28.2 145.7,28.2 105,68.9" fill="#f6e7bd" stroke="currentColor"/>
  <line x1="69.3" y1="33.2" x2="140.7" y2="33.2" stroke="#333" stroke-dasharray="4 3"/>
  <polygon points="64.3,95.8 145.7,95.8 105,55.1" fill="#f6e7bd" stroke="currentColor"/>
  <line x1="69.3" y1="90.8" x2="140.7" y2="90.8" stroke="#333" stroke-dasharray="4 3"/>
  <rect x="200" y="20" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="30" font-size="11" fill="currentColor">center, right side</text>
  <rect x="200" y="36" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="218" y="46" font-size="11" fill="currentColor">corners, right side</text>
  <rect x="200" y="52" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="218" y="62" font-size="11" fill="currentColor">corners, wrong side</text>
  <text x="200" y="92" font-size="11" fill="currentColor">sew the dashed lines</text>
</svg>

<svg viewBox="0 0 345 150" width="518" role="img" aria-label="All four corner triangles pressed away from the center square, with dog ears at the seams and the trim line dashed a seam allowance beyond the center's points">
  <polygon points="76.2,39.3 71.2,34.3 71.2,115.7 76.2,110.7" fill="#f6e7bd" stroke="currentColor"/>
  <polygon points="133.8,39.3 138.8,34.3 138.8,115.7 133.8,110.7" fill="#f6e7bd" stroke="currentColor"/>
  <polygon points="69.3,46.2 64.3,41.2 145.7,41.2 140.7,46.2" fill="#f6e7bd" stroke="currentColor"/>
  <polygon points="69.3,103.8 64.3,108.8 145.7,108.8 140.7,103.8" fill="#f6e7bd" stroke="currentColor"/>
  <rect x="76.2" y="46.2" width="57.5" height="57.5" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="76.2,39.3 76.2,110.7 40.6,75" fill="#daa828" stroke="currentColor"/>
  <polygon points="133.8,39.3 133.8,110.7 169.4,75" fill="#daa828" stroke="currentColor"/>
  <polygon points="69.3,46.2 140.7,46.2 105,10.6" fill="#daa828" stroke="currentColor"/>
  <polygon points="69.3,103.8 140.7,103.8 105,139.4" fill="#daa828" stroke="currentColor"/>
  <polygon points="105,11.4 168.6,75 105,138.6 41.4,75" fill="none" stroke="#333" stroke-width="1.5" stroke-dasharray="5 3"/>
  <rect x="200" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="218" y="40" font-size="11" fill="currentColor">center, right side</text>
  <rect x="200" y="46" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="218" y="56" font-size="11" fill="currentColor">corners, right side</text>
  <rect x="200" y="62" width="12" height="12" fill="#f6e7bd" stroke="currentColor"/>
  <text x="218" y="72" font-size="11" fill="currentColor">corners, wrong side (seam allowance)</text>
  <text x="200" y="104" font-size="11" fill="currentColor">trim on the dashed line</text>
</svg>

5. Trim the unit to the finished size plus a seam allowance on each side. In
   this example that is a 4½″ (11.5 cm) square. The points of the center square sit ¼″ (7.5 mm) in from each edge.

<svg viewBox="0 0 330 110" width="495" role="img" aria-label="The trimmed unit, turned so its edges are level: the center's points sit a seam allowance in from each edge, on the dashed finished size">
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
`,St=`# Changelog

What changed in each version of RRQuilts, newest first.

## 0.7.3 (2026-10-29)

### New features

- [major] From the next update on, a dialog tells you as soon as a new version is ready, names the
  version you have and the new one, and lists what's new in this update. Unsaved work is saved or
  kept as a draft first.
- Updates are delivered as smaller bundles, so a new version is ready sooner.
- The changelog in Help lists each version's major changes first.

## 0.7.2 (2026-10-29)

### New features

- [major] A data quilt can place several blocks on the same month, week or day, each showing the value you
  pick, such as High on one and Low on another. Blocks go on with the number brush, the way
  numerals go on a data block, and the order line branches to every block of a number.
- [major] A block with several values picks which of the quilt's values each one shows, even when the quilt
  has fewer values than the block.
- A Weeks quilt can start the year with Jan 1 as a single day, so its last week ends on Dec 31.
- In a leap year, week and day quilts can average Feb 28 and Feb 29, leave Feb 29 out, give it a
  place of its own, or show a week block's new 2-day variant.
- [major] View grayscale shows a quilt or a block in grays of the same lightness, to check its values.
- [major] A middle click picks up the block, color, or data block under the pointer. It and Find scroll the
  tray to what they pick.
- Clicking a number or a value in a data quilt's list lights up its blocks on the quilt.
- Erase and Find work in data quilts.
- [major] Older projects, block files, and libraries open and are upgraded. Files saved with this version
  need it or a newer one.

### Fixes

- A block used in a data quilt only as its 1-day variant shows as in use.

## 0.7.1 (2026-10-23)

### Fixes

- [major] On iPhones, dialog buttons no longer hide under Safari's address bar.
- In a data block, Undo also takes back the picked day numeral, so the next tap places it again.
- Picking a day numeral unselects the picked color, so it's clear which one a tap paints.

## 0.7.0 (2026-10-22)

### New features

- [major] Data quilts: color a quilt from a year of temperatures, moods, hours of daylight, rainfall or your own numbers. Turn on Data quilt in a quilt's Details tab or in the new quilt window, and pick months, weeks or days.
- [major] Data blocks: make any block a month, week or day block and number its patches with day numerals. Month blocks can have 30, 29, 28 and 1-day variants, and week blocks a 1-day one. The built-in library has a Month Strip, a Week Strip and a Day Square, and month and week strips that turn a corner in curves, right angles or a fan.
- Place a data quilt's blocks month by month (or week by week, or day by day), drag them to other months, and see each block's month and its days in order on the quilt. Ordinary blocks can fill the other spaces.
- Preview a data quilt with a made-up sample year (temperatures for Alaska or Hawaii, rain for Hawaii or Arizona, daylight for Alaska or Texas, and moods) or your own CSV file, then enter real days in a table, by pasting or importing, or with Today's entry.
- Printouts of data quilts show a legend of each value's colors and count yardage for the worst case.
- Sort a palette's swatches by hue, value, saturation or name.
- Filter palettes by hue, value and saturation.
- [major] Make a new colorway from a palette: each color of the quilt is matched to the closest color or fabric in it, and you can change any match.
- On-Point, Variable Point and Diamond Point quilts can be half a row or column longer, ending on a short row.
- [major] Export a single quilt as a project file of its own.
- Drag quilt cards to rearrange them. A glow shows where the quilt will land.
- Filter blocks and quilts in the project and the libraries to find data blocks and data quilts.
- Hovering a quilt outlines the piece under the pointer in a color that tells data blocks, other blocks and sashing or borders apart. The block editor outlines the patch under the pointer.

### Fixes

- The outline on a hovered block stands out over the reference overlay.
- A color variant of a library block follows the block when the library redraws it.
- Flip on On-Point quilts mirrors across the quilt, as it looks on screen.
- Color menus in palette swaps and colorway mappings are wide enough to read.
- Projects from older versions open and are upgraded. Library and block files saved with 0.7.0 need 0.7.0 or later to open.

## 0.6.1 (2026-10-20)

### New features

- [major] Open any block in the block editor from its menu or its preview, right after Preview.
- Print a block or a quilt straight from its menu.

### Fixes

- Library blocks open in the block editor read-only, with buttons to make your own copy or a coloration variant.
- A project keeps one coloration variant per library block. Making another adds a new coloring to the one you have.
- Threadloop profile links (threadloop.app/members/…) are recognized in your socials.

## 0.6.0 (2026-10-20)

### New features

- [major] 21 new 60° triangle blocks in the built-in library, for Shaped Blocks quilts.
- A new library, RagingRoosevelt's Novelty, is listed on the Libraries page. Its Fractals and Memes packs download when you switch them on.
- [major] Tag your project's palettes and star your favorite palettes, including library palettes. The project's Palettes tab has the same filters as the Libraries page.
- [major] Edit a block's tags and category in its Details tab.
- The quilt editor's block list shows only blocks that fit the quilt's layout. Switch off "Compatible with this layout" to see them all.
- When imported quilts or fabric images are already in the project, you see both side by side and choose which to keep, or keep both.
- Removing a pack, a library, or a tagged item asks whether to keep your tags in case it comes back.
- Select every block of a library at once in the project's Blocks tab, with a count of how many are selected.
- Categories with the same name in different libraries show once in the filter, and ticking a category ticks all of its subcategories.
- New On-Point, Variable Point and Diamond Point quilts start with an Exact edge, so the edge stays at the block points.
- Every dialog has a close button, and a project reopens on the tab you left it on.
- [major] Plain Block is gone from the built-in library. Paint an empty block space instead.

### Fixes

- Exported blocks, packs and backups keep colorings made with fabric images.
- The reference overlay stays in place when you set a block into an On-Point setting triangle.
- [major] Several built-in blocks are redrawn to match how they are sewn, and the Seams filter is more accurate. Lettered variants now use numbers (King's Crown II). Projects that use them still open.
- Projects, libraries, and block files from older versions open and are upgraded.

## 0.5.0 (2026-10-19)

### New features

- [major] Shaped blocks. Draw triangle, 60° diamond, and hexagon blocks, and set them in the Shaped Blocks, Baby Blocks, and Diamond Point layouts. A flow angle turns the whole layout. Starter shaped blocks are in the built-in library.
- Find blocks with a filter sidebar on the Libraries page and the project's Blocks tab. Search, then narrow by shape, by the layouts a block fits, by seams (straight, curved, set-in), or by difficulty.
- In a block's Details tab, mark what it needs (foundation paper piecing, appliqué, hand sewing) and the faster methods it suits (strip piecing, quick units, stitch and flip). Filter and group blocks by technique.
- [major] Tag any block with your own words, built-in and pack blocks too, and star your favorites. Tags stay in your own library and are never shared in packs or block files. Styles from older files become tags.
- [major] Import quilts from another project, with the blocks, colors, and fabrics they use.
- [major] Open a project shared as a GitHub gist, from the home page or a link ending in \`?open_gist=\` and the gist's address. The app shows who shared it before it opens.
- A quilt picture downloaded from its Details tab includes seam lines when they are shown.

### Fixes

- Dragging one finger over a quilt or block only pans with the Pan tool, so painting and drawing by touch no longer move the view.
- Projects, libraries, and block files from older versions open and are upgraded.

## 0.4.0 (2026-10-16)

### New features

- [major] Four new layouts. Variable Point lays out diamonds of any width, height, or point angle. One Patch tiles a single shape such as hexagons. Baby Blocks tiles tumbling-block cubes, and Variable Blocks lets you squash or stretch them.
- [major] Pieced borders in 19 styles, including points, diamonds, spaced squares, and checkerboard.
- [major] Quilt colorways. Try a quilt in other colors and switch between them. A new colorway can start from a palette swap, and its colors are changed by picking a replacement for each color of the original.
- [major] Pick a target size when you start a quilt, from a placemat to a king bed, US or European, or a top or pants in your size. It is drawn as an outline over the quilt and can be changed later in the Layout tab.
- [major] The reference overlay shows that outline with your choice of tint, opacity, and fill, on screen and in print.
- A welcome on your first visit asks for your name for credits, your units, and your bed and clothing sizes.
- The printed quilt picture can show its title, author, and project name, with a slider for the picture's size.
- Templates for quilt pieces that need them, such as one-patch shapes, setting triangles, and pieced border pieces.
- The yardage list shows a large swatch of each color and fabric photo.
- Download a quilt's picture from its Details tab.

### Fixes

- Unsaved work from an older version of the app opens and is upgraded. If it can't be read, you can download it to keep it.
- The Libraries page and the project's block list open faster.

### Known issues

- An empty palette in Libraries has no place to drop fabric images. Use Add fabric images instead.

## 0.3.0 (2026-10-16)

### New features

- [major] Make On-Point quilts, with blocks turned on point, blocks between them, sashing, and a choice of edge. Setting triangles can be cut to size or oversized so the blocks float, the edge can be partial blocks, or the zigzag edge can be bound as it is.
- [major] Build a quilt from strips, each with its own style (plain, blocks, half-drop blocks, points, diamonds, double diamonds, spaced squares, or checkerboard) and width. Drag strips to reorder them, or swap and restyle them from the toolbar.
- Start a quilt shows a live preview and a picture card for each layout style, with its own step for setting up strips.
- A Plain Block in the built-in library, for plain alternate squares.
- Clearer templates. Long thin pieces get their labels in a row, labels on small pieces can use the seam allowance, and sizes that are off the ruler grid show their fractions on a line below.
- The Horizontal layout is now called Straight Set. Older projects open and are upgraded.
- [major] A setting to show recently used colors first in each palette.

### Fixes

- Blocks no longer get stretched into sashing and borders. These take colors and fabrics, and square cornerstones can hold a block.
- Picking a color in the Design tab no longer moves it within its palette.

## 0.2.0 (2026-10-15)

### New features

- [major] Add a library from the web by pasting its link, or import a library file and pick which of its packs to install.
- [major] Back up a library with its packs and images, and restore it later, even when its web source can no longer be reached.
- [major] Make your own pack from chosen items, and link a library's home page, gallery, and repository.
- The import picker checks packs you already have, and offers larger or smaller fabric images when a file has them.
- [major] Save a quilt or block as a PNG image.
- Help buttons beside Start a quilt, New project, and New palette, with a setting to hide them.

### Fixes

- A switched-off pack frees its images only when its library still answers on the web.
- Removing a library clears the name filter.

## 0.1.0 (2026-10-15)

### New features

- [major] Draw your own blocks with seam lines, then set them in a quilt with sashes, cornerstones, and borders.
- Undo and redo any change.
- [major] Keep a personal library of blocks, colors, and fabrics, and reuse them in any project.
- [major] Import photos of fabrics and see them at true scale in your quilt.
- [major] Save projects as .rrq files. If the browser crashes, your work comes back from an automatic draft.
- [major] Print templates for every block, rotary cutting sizes, a yardage estimate, and a print preview.
- [major] Share blocks as .rrqbl files, palettes as .rrqplt files, and whole libraries as .rrqlib files.
- Record the author, license, and credits of your work, with a Details tab that shows the full chain of authors.
- Read built-in help guides and use calculators for quilt math.
- Works offline after the first load and installs like an app.
`;function Ct(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var I=Ct();function wt(e){I=e}var L={exec:()=>null};function R(e){let t=[];return n=>{let r=Math.max(0,Math.min(3,n-1)),i=t[r];return i||(i=e(r),t[r]=i),i}}function z(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(B.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var Tt=((e=``)=>{try{return!!RegExp(`(?<=1)(?<!1)`+e)}catch{return!1}})(),B={codeRemoveIndent:/^(?: {0,3}\t| {1,4})/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,endingSpaceTabChar:/[ \t]$/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,leadingSpaceTab:/^[ \t]+/,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,numericCharacterReference:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,numericCharacterReferenceOrAmpersand:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:R(e=>RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:R(e=>RegExp(`^ {0,${e}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),fencesBeginRegex:R(e=>RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),headingBeginRegex:R(e=>RegExp(`^ {0,${e}}#`)),htmlBeginRegex:R(e=>RegExp(`^ {0,${e}}(?:</?(?:${H})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`,`i`)),blockquoteBeginRegex:R(e=>RegExp(`^ {0,${e}}>`))},Et=/^(?:[ \t]*(?:\n|$))+/,Dt=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Ot=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,V=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,kt=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,At=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,jt=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,Mt=z(jt).replace(/bull/g,At).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),Nt=z(jt).replace(/bull/g,At).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Pt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,Ft=/^[^\n]+/,It=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,Lt=z(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,It).replace(`title`,/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Rt=z(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,At).getRegex(),H=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,zt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Bt=z(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,zt).replace(`tag`,H).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Vt=e=>z(Pt).replace(`hr`,V).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,e).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,H).getRegex(),Ht=Vt(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),Ut=Vt(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),Wt={blockquote:z(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace(`paragraph`,Ut).getRegex(),code:Dt,def:Lt,fences:Ot,heading:kt,hr:V,html:Bt,lheading:Mt,list:Rt,newline:Et,paragraph:Ht,table:L,text:Ft},Gt=z(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,V).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,H).getRegex(),Kt={...Wt,lheading:Nt,table:Gt,paragraph:z(Pt).replace(`hr`,V).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,Gt).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,H).getRegex()},qt={...Wt,html:z(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace(`comment`,zt).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:L,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:z(Pt).replace(`hr`,V).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,Mt).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},Jt=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Yt=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Xt=/^( {2,}|\\)\n(?!\s*$)[ \t]*/,Zt=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,U=/[\p{P}\p{S}]/u,W=/[\s\p{P}\p{S}]/u,G=/[^\s\p{P}\p{S}]/u,Qt=z(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,W).getRegex(),$t=/[\p{Pi}\p{Ps}"']/u,en=/(?!~)[\p{P}\p{S}]/u,tn=/(?!~)[\s\p{P}\p{S}]/u,nn=/(?:[^\s\p{P}\p{S}]|~)/u,rn=z(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,Tt?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),an=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,on=z(an,`u`).replace(/punct/g,U).getRegex(),sn=z(an,`u`).replace(/punct/g,en).getRegex(),cn=z(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,`u`).replace(/openQuote/g,$t).replace(/punct/g,U).getRegex(),ln=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,un=z(ln,`gu`).replace(/notPunctSpace/g,G).replace(/punctSpace/g,W).replace(/punct/g,U).getRegex(),dn=z(ln,`gu`).replace(/notPunctSpace/g,nn).replace(/punctSpace/g,tn).replace(/punct/g,en).getRegex(),fn=z(`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,G).replace(/punctSpace/g,W).replace(/punct/g,U).getRegex(),pn=z(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,G).replace(/punctSpace/g,W).replace(/punct/g,U).getRegex(),mn=z(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,G).replace(/punctSpace/g,W).replace(/punct/g,U).getRegex(),hn=z(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,U).getRegex(),gn=z(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,G).replace(/punctSpace/g,W).replace(/punct/g,U).getRegex(),_n=z(/\\(punct)/,`gu`).replace(/punct/g,U).getRegex(),vn=z(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/,`gu`).replace(/punct/g,U).getRegex(),yn=z(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),bn=z(zt).replace(`(?:-->|$)`,`-->`).getRegex(),xn=z(`^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,bn).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Sn=/\[(?:\\[\s\S]|[^\[\]\\])*\]/,Cn=z(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace(`brackets`,Sn).getRegex(),wn=z(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace(`label`,Cn).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace(`title`,/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Tn=z(/^!?\[(label)\]\[(ref)\]/).replace(`label`,Cn).replace(`ref`,It).getRegex(),En=z(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,It).getRegex(),Dn=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,On=z(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace(`brackets`,Sn).getRegex(),kn=z(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,z(/^!?\[(label)\]\[(ref)\]/).replace(`label`,On).replace(`ref`,Dn).getRegex()).replace(`nolink`,z(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,Dn).getRegex()).getRegex(),An=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,jn=z(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g,/[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),Mn={_backpedal:L,anyPunctuation:_n,anyPunctuationOutsideCode:vn,autolink:yn,blockSkip:rn,br:Xt,code:Yt,del:L,delLDelim:L,delRDelim:L,emStrongLDelim:on,emStrongRDelimAst:un,emStrongRDelimUnd:pn,escape:Jt,link:wn,nolink:En,punctuation:Qt,reflink:Tn,reflinkSearch:kn,tag:xn,text:Zt,url:L},Nn={...Mn,emStrongLDelim:cn,emStrongRDelimAst:fn,emStrongRDelimUnd:mn,link:z(/^!?\[(label)\]\((.*?)\)/).replace(`label`,Cn).getRegex(),reflink:z(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,Cn).getRegex()},Pn={...Mn,emStrongRDelimAst:dn,emStrongLDelim:sn,delLDelim:hn,delRDelim:gn,url:z(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`emailProtocol`,jn).replace(`protocol`,An).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:z(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace(`protocol`,An).replace(/emailProtocol/g,/(?:mailto|xmpp):/).getRegex()},Fn={...Pn,br:z(Xt).replace(`{2,}`,`*`).getRegex(),text:z(Pn.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},In={normal:Wt,gfm:Kt,pedantic:qt},K={normal:Mn,gfm:Pn,breaks:Fn,pedantic:Nn},Ln={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},Rn=e=>Ln[e];function q(e,t){if(t){if(B.escapeTest.test(e))return e.replace(B.escapeReplace,Rn)}else if(B.escapeTestNoEncode.test(e))return e.replace(B.escapeReplaceNoEncode,Rn);return e}function zn(e){return B.numericCharacterReference.test(e)?e.replace(B.numericCharacterReferenceOrAmpersand,(e,t,n)=>{if(t===void 0&&n===void 0)return`&amp;`;let r=t===void 0?Number.parseInt(n,16):Number.parseInt(t,10);return r===0||r>1114111||r>=55296&&r<=57343?`�`:r===38?`&amp;`:String.fromCodePoint(r)}):e}function Bn(e){try{e=encodeURI(e).replace(B.percentDecode,`%`)}catch{return null}return e}function Vn(e,t){let n=e.replace(B.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(B.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t){if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``)}for(;r<n.length;r++)n[r]=n[r].trim().replace(B.slashPipe,`|`);return n}function J(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function Hn(e){let t=e.split(`
`),n=t.length-1;for(;n>=0&&B.blankLine.test(t[n]);)n--;return t.length-n<=2?e:t.slice(0,n+1).join(`
`)}function Un(e){return e.trim().toLowerCase().toUpperCase().toLowerCase()}function Wn(e,t){if(e.indexOf(t[0])===-1&&e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}function Gn(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function Kn(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`),c=e[0].charAt(0)===`!`,l=r.state.inLink,u=r.state.linkEmitted,d=r.state.inRawBlock;r.state.inLink=!0,r.state.linkEmitted=!1;let f=r.inlineTokens(s),p=r.state.linkEmitted;if(r.state.linkEmitted=u,r.state.inLink=l,!c){if(p){r.state.inRawBlock=d;return}r.state.linkEmitted=!0}return{type:c?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:f}}function qn(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return e.slice(Math.min(r.length,i.length))}).join(`
`)}function Jn(e,t,n,r){if(!t.includes(`<`))return!1;for(let i=0;i<t.length;i++){if(t[i]===`\\`){i++;continue}if(t[i]==="`"){let e=r.inline.code.exec(t.slice(i));if(e){i+=e[0].length-1;continue}}if(t[i]!==`<`)continue;let a=e.slice(n+i),o=r.inline.tag.exec(a)||r.inline.autolink.exec(a);if(o){if(o[0].length>t.length-i)return!0;i+=o[0].length-1}}return!1}var Yn=class{options;rules;lexer;constructor(e){this.options=e||I}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=this.options.pedantic?t[0]:Hn(t[0]);return{type:`code`,raw:e,codeBlockStyle:`indented`,text:e.replace(this.rules.other.codeRemoveIndent,``)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=qn(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=J(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceTabChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:J(t[0],`
`),depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:J(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=J(t[0],`
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
`,1)[0],d=t[1].length,f=this.options.pedantic?Gn(u,d):u.replace(this.rules.other.leadingSpaceTab,e=>Gn(e,d)),p=e.split(`
`,1)[0],m=!f.trim(),h=0;if(this.options.pedantic?(h=2,a=f.trimStart()):m?h=d+1:(h=f.search(this.rules.other.nonSpaceChar),h=h>4?1:h,a=f.slice(h),h+=d),m&&this.rules.other.blankLine.test(p)&&(e=e.substring(p.length+1),i=!0),!i){let t=this.rules.other.nextBulletRegex(h),n=this.rules.other.hrRegex(h),r=this.rules.other.fencesBeginRegex(h),i=this.rules.other.headingBeginRegex(h),o=this.rules.other.htmlBeginRegex(h),s=this.rules.other.blockquoteBeginRegex(h);for(;e;){let c=e.split(`
`,1)[0],l;if(p=c,this.options.pedantic?(p=p.replace(this.rules.other.listReplaceNesting,`  `),l=p):l=p.replace(this.rules.other.leadingSpaceTab,e=>Gn(e)),r.test(p)||i.test(p)||o.test(p)||s.test(p)||t.test(p)||n.test(p))break;if(l.search(this.rules.other.nonSpaceChar)>=h||!p.trim())a+=`
`+l.slice(h);else{if(m||f.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||r.test(f)||i.test(f)||n.test(f))break;a+=`
`+p}m=!p.trim(),e=e.substring(c.length+1),f=l.slice(h)}}let g=n.slice(l,r());o.loose||(c?o.loose=!0:this.rules.other.doubleBlankLine.test(g)&&(c=!0)),o.items.push({type:`list_item`,raw:g,task:!!this.options.gfm&&this.rules.other.listIsTask.test(a),loose:!1,text:a,tokens:[]})}let l=o.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;o.raw=n.slice(0,r()).trimEnd();for(let e of o.items)if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),!o.loose){let t=e.tokens.filter(e=>e.type===`space`);o.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}for(let e of o.items){let t=e.tokens[0];if(e.task&&(t?.type===`text`||t?.type===`paragraph`)){e.text=e.text.replace(this.rules.other.listReplaceTask,``),t.raw=t.raw.replace(this.rules.other.listReplaceTask,``),t.text=t.text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}let n=this.rules.other.listTaskCheckbox.exec(e.raw);if(n){let t={type:`checkbox`,raw:n[0]+` `,checked:n[0]!==`[ ]`};e.checked=t.checked,o.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=t.raw+e.tokens[0].raw,e.tokens[0].text=t.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(t)):e.tokens.unshift({type:`paragraph`,raw:t.raw,text:t.raw,tokens:[t]}):e.tokens.unshift(t)}}else e.task&&=!1}if(o.loose)for(let e of o.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return o}}html(e){let t=this.rules.block.html.exec(e);if(t){let e=Hn(t[0]);return{type:`html`,block:!0,raw:e,pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:e}}}def(e){let t=this.rules.block.def.exec(e);if(t){if(!this.rules.other.startAngleBracket.test(t[2])&&Wn(t[2],`()`)!==-1)return;let e=Un(t[1]).replace(this.rules.other.multipleSpaceGlobal,` `),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:J(t[0],`
`),href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=Vn(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:J(t[0],`
`),header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(Vn(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:J(t[0],`
`),depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){if(this.lexer.state.linkParenPossible===!1)return;let t=this.rules.inline.link.exec(e);if(t){let n=t[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&Jn(e,t[1],n,this.rules))return;let r=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let e=J(r.slice(0,-1),`\\`);if((r.length-e.length)%2==0)return}else{let e=Wn(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let i=t[2],a=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(i);e&&(i=e[1],a=e[3])}else a=t[3]?t[3].slice(1,-1):``;return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(i=this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?i.slice(1):i.slice(1,-1)),Kn(t,{href:i&&i.replace(this.rules.inline.anyPunctuation,`$1`),title:a&&a.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=n[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&Jn(e,n[1],r,this.rules))return;let i=t[Un((n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal,` `))];if(!i){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return Kn(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[3])||!n||this.rules.inline.punctuation.exec(n))){let i=[...r[0]].length-1,a,o,s=i,c=0,l=r[0][0],u=n===l,d=l===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(d.lastIndex=0,t=t.slice(-1*e.length+i);(r=d.exec(t))!==null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a)continue;if(o=[...a].length,r[3]||r[4]){s+=o;continue}if(r[5]||r[6]){if(i%3&&!((i+o)%3)){c+=o;continue}if(u)break}if(s-=o,s>0)continue;o=Math.min(o,o+s+c);let t=[...r[0]][0].length,n=e.slice(0,i+r.index+t+o);if(Math.min(i,o)%2){let e=n.slice(1,-1);return{type:`em`,raw:n,text:e,tokens:this.lexer.inlineTokens(e)}}let l=n.slice(2,-2);return{type:`strong`,raw:n,text:l,tokens:this.lexer.inlineTokens(l)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim;for(s.lastIndex=0,t=t.slice(-1*e.length+n);(r=s.exec(t))!==null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:e?t[0]:zn(t[0]),escaped:e}}}},Y=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||I,this.options.tokenizer=this.options.tokenizer||new Yn,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,linkParenPossible:!0,top:!0};let t={other:B,block:In.normal,inline:K.normal};this.options.pedantic?(t.block=In.pedantic,t.inline=K.pedantic):this.options.gfm&&(t.block=In.gfm,t.inline=this.options.breaks?K.breaks:K.gfm),this.tokenizer.rules=t}static get rules(){return{block:In,inline:K}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(B.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(B.tabCharGlobal,`    `).replace(B.spaceLine,``));let r=1/0;for(;e;){if(e.length<r)r=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let i;if(this.options.extensions?.block?.some(n=>(i=n.call({lexer:this},e,t))?(e=e.substring(i.raw.length),t.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let n=t.at(-1);i.raw.length===1&&n!==void 0?n.raw+=`
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
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(i)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes(`[`))return!1;let t=this.tokenizer.rules.inline.link;for(let n of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(n[0])&&e.charAt(n.index-1)!==`!`)return!0;for(let t of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let e=t[0],n=e.lastIndexOf(`[`);if(e.charAt(0)!==`!`&&Object.hasOwn(this.tokens.links,Un(e.slice(n+1,-1)))&&!(n>1&&this.linkInText(e.slice(1,n-1))))return!0}return!1}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=this.state.linkParenPossible;this.state.linkParenPossible=n&&e.includes(`)`);try{return this.#e(e,t)}finally{this.state.linkParenPossible=n}}#e(e,t){let n=e;if(this.tokens.links&&e.includes(`[`)){let e=this.tokenizer.rules.inline.reflinkSearch,t=n=>{let r=n.lastIndexOf(`[`);if(!Object.hasOwn(this.tokens.links,Un(n.slice(r+1,-1))))return n;if(r>1&&n.charAt(0)!==`!`){let i=n.slice(1,r-1);if(this.linkInText(i))return`[`+i.replace(e,t)+`][`+`a`.repeat(n.length-r-2)+`]`}return`[`+`a`.repeat(n.length-2)+`]`};n=n.replace(e,t)}n=n.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode,(e,t,n)=>n?`+`.repeat(e.length):t?t+e.slice(t.length,-t.length).replace(/`/g,`+`)+t:e),n=n.replace(this.tokenizer.rules.inline.blockSkip,(e,t,n)=>{let r=n?n.length:0;return e.slice(0,r)+`[`+`a`.repeat(e.length-r-2)+`]`}),n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let r=!1,i=``,a=1/0;for(;e;){if(e.length<a)a=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}r||(i=``),r=!1;let o;if(this.options.extensions?.inline?.some(n=>(o=n.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if((o=this.tokenizer.escape(e))||(o=this.tokenizer.tag(e))||(o=this.tokenizer.link(e))){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let n=t.at(-1);o.type===`text`&&n?.type===`text`?(n.raw+=o.raw,n.text+=o.text):t.push(o);continue}if((o=this.tokenizer.emStrong(e,n,i))||(o=this.tokenizer.codespan(e))||(o=this.tokenizer.br(e))||(o=this.tokenizer.del(e,n,i))||(o=this.tokenizer.autolink(e))||!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),t.push(o);continue}let s=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(o=this.tokenizer.inlineText(s)){e=e.substring(o.raw.length),o.raw.slice(-1)!==`_`&&(i=o.raw.slice(-1)),r=!0;let n=t.at(-1);n?.type===`text`?(n.raw+=o.raw,n.text+=o.text):t.push(o)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return t}infiniteLoopError(e){let t=`Infinite loop on byte: `+e;if(this.options.silent)console.error(t);else throw Error(t)}},Xn=class{options;parser;constructor(e){this.options=e||I}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(B.notSpaceStart)?.[0],i=e?e.replace(B.endingNewline,``)+`
`:``;return r?`<pre><code class="language-`+q(r)+`">`+(n?i:q(i,!0))+`</code></pre>
`:`<pre><code>`+(n?i:q(i,!0))+`</code></pre>
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
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${q(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,text:n,tokens:r,autolink:i}){let a=i?q(n,!0):this.parser.parseInline(r),o=Bn(e);if(o===null)return a;e=q(o,i);let s=`<a href="`+e+`"`;return t&&(s+=` title="`+q(t)+`"`),s+=`>`+a+`</a>`,s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=Bn(e);if(i===null)return q(n);e=i;let a=`<img src="${q(e)}" alt="${q(n)}"`;return t&&(a+=` title="${q(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:q(e.text)}},Zn=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return``+e}image({text:e}){return``+e}br(){return``}checkbox({raw:e}){return e}},X=class e{options;renderer;textRenderer;constructor(e){this.options=e||I,this.options.renderer=this.options.renderer||new Xn,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Zn}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`checkbox`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n||``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`checkbox`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e||``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},Qn=class{options;block;constructor(e){this.options=e||I}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(e=this.block){return e?Y.lex:Y.lexInline}provideParser(e=this.block){return e?X.parse:X.parseInline}};function Z(e,t){if(Array.isArray(t))for(let n=0;n<t.length;n++)e.push(t[n]);else e.push(t)}var Q=new class{defaults=Ct();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=X;Renderer=Xn;TextRenderer=Zn;Lexer=Y;Tokenizer=Yn;Hooks=Qn;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(Z(n,t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)Z(n,this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)Z(n,this.walkTokens(e.tokens,t));break}case`list`:{let e=r;Z(n,this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);Z(n,this.walkTokens(i,t))}):e.tokens&&Z(n,this.walkTokens(e.tokens,t))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new Xn(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n||``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new Yn(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new Qn;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];t[r]=Qn.passThroughHooks.has(n)?e=>{if(this.defaults.async&&Qn.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:(...e)=>{if(this.defaults.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&Z(n,t.call(this,e)),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return Y.lex(e,t??this.defaults)}parser(e,t){return X.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer(e):e?Y.lex:Y.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser(e):e?X.parse:X.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer(e):e?Y.lex:Y.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser(e):e?X.parse:X.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+q(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function $(e,t){return Q.parse(e,t)}$.options=$.setOptions=function(e){return Q.setOptions(e),$.defaults=Q.defaults,wt($.defaults),$},$.getDefaults=Ct,$.defaults=I;function $n(...e){return Q.use(...e),$.defaults=Q.defaults,wt($.defaults),$}$.use=$n,$.walkTokens=function(e,t){return Q.walkTokens(e,t)},$.parseInline=Q.parseInline,$.Parser=X,$.parser=X.parse,$.Renderer=Xn,$.TextRenderer=Zn,$.Lexer=Y,$.lexer=Y.lex,$.Tokenizer=Yn,$.Hooks=Qn,$.parse=$,$.options,$.setOptions,$.walkTokens,$.parseInline,X.parse,Y.lex;var er=[{id:`guides`,label:`App Guides`,icon:`menu_book`},{id:`math`,label:`Quilt Math`,icon:`calculate`},{id:`techniques`,label:`Techniques`,icon:`content_cut`},{id:`resources`,label:`Resources`,icon:`link`},{id:`about`,label:`About`,icon:`info`}],tr=e=>e.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``);function nr(e){let t=/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(e),n={};for(let e of(t?.[1]??``).split(/\r?\n/)){let t=e.indexOf(`:`);t>0&&(n[e.slice(0,t).trim()]=e.slice(t+1).trim())}return{meta:n,body:t?e.slice(t[0].length):e}}function rr(e){let t=[],n=[],r=()=>{let e=n.join(`
`).trim();if(!e)return;let r=$.parse(e,{async:!1,gfm:!0}).replace(/<h2>(.*?)<\/h2>/g,(e,t)=>`<h2 id="${tr(t)}">${t}</h2>`);t.push({kind:`html`,html:r.replace(/<a href="(https?:[^"]*)"/g,`<a href="$1" target="_blank" rel="noopener noreferrer"`)}),n=[]};for(let i of e.split(/\r?\n/)){let e=/^::calc\s+(\S+)\s*$/.exec(i),a=/^::diagram\s+(\S+)\s*$/.exec(i);if(a){let e=/<svg[\s\S]*?<\/svg>/.exec(ar[`./${a[1]}.md`]??``)?.[0];n.push(e??`<p>Missing diagram ${a[1]}</p>`)}else e?(r(),t.push({kind:`calc`,name:e[1]})):n.push(i)}return r(),t}function ir(e){let t=[...e.matchAll(/^## (.+)$/gm)].map(e=>({id:tr(e[1]),title:e[1]}));return t.length>1?t:void 0}var ar=Object.assign({"./about/file-formats.md":Ve,"./about/got-an-idea.md":He,"./about/roadmap.md":Ue,"./about/rrquilts-project.md":We,"./guides/block-colorings.md":Ge,"./guides/colors-and-palettes.md":Ke,"./guides/credits-and-licenses.md":qe,"./guides/data-quilts.md":Je,"./guides/designing-a-quilt.md":Ye,"./guides/drawing-blocks.md":Xe,"./guides/getting-started.md":Ze,"./guides/libraries.md":Qe,"./guides/printing.md":$e,"./guides/settings.md":et,"./guides/sketchbook.md":tt,"./math/backing.md":nt,"./math/binding.md":rt,"./math/borders.md":it,"./math/flying-geese.md":at,"./math/half-square-triangles.md":ot,"./math/on-point-settings.md":st,"./math/patches-from-yardage.md":ct,"./math/quarter-square-triangles.md":lt,"./math/rounding.md":ut,"./math/seam-allowance.md":dt,"./math/square-in-a-square.md":ft,"./math/squares-and-rectangles.md":pt,"./resources/calculators.md":mt,"./resources/directories.md":ht,"./resources/learning-to-quilt.md":gt,"./resources/licenses.md":_t,"./techniques/continuous-binding.md":vt,"./techniques/flying-geese-units.md":yt,"./techniques/hst-units.md":bt,"./techniques/square-in-a-square-units.md":xt}),or=Object.values(Object.assign({"/CHANGELOG.md":St})).map(e=>`---\ntitle: Changelog\norder: 40\nsummary: What changed in each version.\n---\n${pe(e.replace(/^# .*\n/,``))}`),sr=[...Object.entries(ar),...or.map(e=>[`./about/changelog.md`,e])].map(([e,t])=>{let[,n,r]=/^\.\/([^/]+)\/([^/]+)\.md$/.exec(e),{meta:i,body:a}=nr(t);return{section:n,id:r,title:i.title??r,order:Number(i.order??100),summary:i.summary??``,text:`${i.title??``} ${i.summary??``} ${a}`.toLowerCase(),segments:rr(a),toc:ir(a),cards:i.cards===`true`}}).sort((e,t)=>e.order-t.order||e.title.localeCompare(t.title)),cr=e=>sr.filter(t=>t.section===e),lr=(e,t)=>sr.find(n=>n.section===e&&n.id===t);function ur(e,t){let n=t.toLowerCase().split(/\s+/).filter(Boolean);return e.filter(e=>n.every(t=>e.text.includes(t)))}var dr={class:`row no-wrap`,style:{gap:`24px`}},fr={key:0,class:`topics column`,"aria-label":`Topics`},pr={key:0,class:`text-caption text-grey-7`},mr={key:0,class:`text-grey-7 q-pa-sm`},hr={class:`topic-title`},gr=[`innerHTML`],_r={key:2,class:`toc`,"aria-label":`On this page`},vr=[`href`,`onClick`],yr={key:3,class:`toc`,"aria-hidden":`true`},br={key:4,class:`col text-grey-7 q-pt-sm`},xr=D(S({__name:`HelpPage`,setup(t){let x=ie(),S=n(),D=fe(),re=le(),O=p(()=>D.params.section),ue=p(()=>er.find(e=>e.id===O.value)?.label??``),pe=p(()=>D.params.topic??``),he=p(()=>cr(O.value)),k=p(()=>pe.value?lr(O.value,pe.value):x.screen.gt.sm?he.value[0]:void 0),ye=p(()=>pe.value&&!k.value?pe.value:``),A=f(``);u(O,()=>A.value=``);let j=p(()=>ur(he.value,A.value??``)),be={"file-access":e},xe=e=>e.replace(/\{\{yours:([\w-]+)\}\}/g,(e,t)=>be[t]?be[t]()?`yours does`:`yours doesn't`:e),Se=p(()=>{let e=[{card:!1,segs:[]}];for(let t of k.value?.segments??[])if(t.kind!==`html`)e.at(-1).segs.push(t);else for(let n of t.html.split(/(?=<h2[ >])/))n.startsWith(`<h2`)&&e.push({card:!0,segs:[]}),n.trim()&&e.at(-1).segs.push({kind:`html`,html:n});return e.filter(e=>e.segs.length)}),Ce=e=>document.getElementById(e)?.scrollIntoView({behavior:`smooth`});function we(e){let t=e.target.closest(`.help-md a`),n=t?.getAttribute(`href`);n?.startsWith(`/`)&&!t?.target&&(e.preventDefault(),re.push(n))}return(e,t)=>{let n=l(`router-link`);return w(),_(ve,{padding:``,class:`help`},{default:c(()=>[t[5]||=y(`h1`,{class:`page-title q-mb-sm`},`Help`,-1),d(_e,{"model-value":O.value,dense:``,"no-caps":``,align:`left`,class:`q-mb-md`,"onUpdate:modelValue":t[0]||=e=>v(re).push(`/help/${e}`)},{default:c(()=>[(w(!0),m(b,null,a(v(er),e=>(w(),_(ge,{key:e.id,name:e.id,icon:e.icon,label:e.label},null,8,[`name`,`icon`,`label`]))),128))]),_:1},8,[`model-value`]),y(`div`,dr,[!k.value||v(x).screen.gt.sm?(w(),m(`nav`,fr,[d(ne,{modelValue:A.value,"onUpdate:modelValue":t[1]||=e=>A.value=e,dense:``,outlined:``,clearable:``,placeholder:`Search ${ue.value}`,class:`q-mb-sm`},{prepend:c(()=>[d(ee,{name:`search`})]),_:1},8,[`modelValue`,`placeholder`]),(w(!0),m(b,null,a(j.value,e=>(w(),_(n,{key:e.id,to:`/help/${O.value}/${e.id}`,class:g([`topic-link`,{active:e.id===k.value?.id}])},{default:c(()=>[y(`div`,null,s(e.title),1),e.summary?(w(),m(`div`,pr,s(e.summary),1)):h(``,!0)]),_:2},1032,[`to`,`class`]))),128)),j.value.length?h(``,!0):(w(),m(`div`,mr,`No topics match “`+s(A.value)+`”.`,1))])):h(``,!0),k.value?(w(),m(`article`,{key:1,class:g([`col content`,{"is-dark":v(x).dark.isActive}]),onClick:we},[v(x).screen.gt.sm?h(``,!0):(w(),m(`div`,{key:0,class:g([`mobile-bar row items-center justify-between q-mb-sm`,{reverse:v(S).settings.sidesSwapped}]),style:o({background:v(x).dark.isActive?`var(--q-dark-page)`:`#fff`})},[d(E,{flat:``,dense:``,"no-caps":``,icon:`arrow_back`,label:ue.value,to:`/help/${O.value}`},null,8,[`label`,`to`]),k.value.toc?(w(),_(E,{key:0,flat:``,dense:``,round:``,icon:`menu`,"aria-label":`On this page`},{default:c(()=>[d(ae,null,{default:c(()=>[d(oe,{dense:``,style:{"min-width":`220px`}},{default:c(()=>[d(de,{header:``},{default:c(()=>[...t[2]||=[C(`On this page`,-1)]]),_:1}),(w(!0),m(b,null,a(k.value.toc,e=>r((w(),_(se,{key:e.id,clickable:``,onClick:t=>Ce(e.id)},{default:c(()=>[d(ce,null,{default:c(()=>[C(s(e.title),1)]),_:2},1024)]),_:2},1032,[`onClick`])),[[te]])),128))]),_:1})]),_:1})]),_:1})):h(``,!0)],6)),y(`h2`,hr,s(k.value.title),1),(w(!0),m(b,null,a(Se.value,(e,t)=>(w(),_(i(k.value.cards&&e.card?`section`:`div`),{key:`${k.value.section}/${k.value.id}/${t}`,class:g({"section-card":k.value.cards&&e.card})},{default:c(()=>[(w(!0),m(b,null,a(e.segs,(e,t)=>(w(),m(b,{key:t},[e.kind===`html`?(w(),m(`div`,{key:0,class:`help-md`,innerHTML:xe(e.html)},null,8,gr)):(w(),_(Be,{key:1,name:e.name},null,8,[`name`]))],64))),128))]),_:2},1032,[`class`]))),128))],2)):h(``,!0),k.value?.toc&&v(x).screen.gt.sm?(w(),m(`nav`,_r,[t[3]||=y(`div`,{class:`text-caption text-grey-7 q-mb-xs`},`On this page`,-1),(w(!0),m(b,null,a(k.value.toc,e=>(w(),m(`a`,{key:e.id,href:`#${e.id}`,class:`topic-link`,onClick:T(t=>Ce(e.id),[`prevent`])},s(e.title),9,vr))),128))])):k.value&&v(x).screen.gt.sm?(w(),m(`div`,yr)):v(x).screen.gt.sm?(w(),m(`div`,br,[ye.value?(w(),_(me,{key:0,dense:``,class:`bg-warning text-dark q-mb-md`},{default:c(()=>[C(` There's no topic “`+s(ye.value)+`” in `+s(ue.value)+`. `,1)]),_:1})):h(``,!0),t[4]||=C(` Pick a topic. `,-1)])):h(``,!0)])]),_:1})}}}),[[`__scopeId`,`data-v-d7726ae5`]]);export{xr as default};