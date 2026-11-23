# 3D EPP fold prototype (spec 027, User Story 7)

Throwaway page: a 2D EPP design with seams, folded into 3D. Plain HTML and JavaScript, no build,
nothing fetched. Open `fold.html` in a browser (file:// works).

## Owner's rules it follows (2026-11-19)

- The 2D design can hold several assemblies that don't touch; the 3D view pulls them together until
  their seams line up.
- Every seam is a hinge about the seam line. Edges that touch in 2D are seams on their own; explicit
  seams are only for edges that don't touch.
- Any seam bends when the forces call for it. Faces are flat for now; puffy is decided later.
- three.js for the 3D view.
- Explode: a click on the object toggles explode mode, where every piece moves a bit away from the
  middle (a quarter of the object's radius, along the line from the middle through the piece).
  Drags only turn the view and leave the mode as it is. Explode only moves the drawing; the fold
  is unchanged.
- Stuffed (checkbox in the header). A closed shape rounds out as a whole: every point of the
  surface (face middles, seams, corners) moves 60% of the way toward the ball with the same
  surface area, so faces push out, seams bow outward and corners pull in a little, as fabric that
  can't stretch does. Neighboring pieces' seams stay together (within 1e-6 U), and piece
  outlines, stitches and glue follow the curved seams. An open shape has no inside to stuff, so
  each piece puffs into a dome on its right side (height 0.4 × the distance from its middle to its
  nearest edge), flat at the seams. Each piece is drawn as rings from its middle to its outline
  (6 rings, 4 points per edge). Display only; it eases in and out, and works with explode.
- Exploded seams (picker in the header): **Stitches** (default) or **Glue**.
- Lighting (picker in the header), against the inside-out illusion when turning a hollow shape:
  **Fixed light, shadows** (default): a light above and a little in front that stays put as the
  view turns,
  pieces casting shadows on each other (three.js soft shadow maps; in `stuff.html` each piece
  shades only itself, owner 2026-11-20: one shadow pass per piece), a soft fill, and a 50° lens
  for stronger perspective. **Plain**: the first look, a lamp on the camera and a 35° lens.
  Seen from behind, the star's hollow now reads as a bowl: darker upper inside, lit lower inside.
  Not tried yet: a floor with the object's shadow on it, and darkening in the creases (ambient
  occlusion).
- Front: once a fold settles, the object turns until its front faces you and the 2D design's up
  is up, so the light and the starting view are the same for every shape. An open shape (the
  star) faces the way its right side faces overall (each piece's direction weighted by its area).
  A closed shape (cube, ball) has no overall direction, so one piece faces you: the piece nearest
  the middle of the largest assembly, unless the quilter double-clicks another (◉ in the 2D view).
  A single click waits 250 ms to tell it from a double-click. The camera then frames the folded
  object once, with room to explode. The cube and ball designs are laid out level (first edge of
  the first piece along x), so the cube sits square.
- Stitches: exploded, every seam (shared or explicit) shows thread lacing back and forth across the
  gap, about 6 stitches per unit of edge (at least 3), inset 8% from the corners. Each thread is a
  white core with a soft magenta glow (two see-through sleeves) so it stands out on the pieces and
  on a light or dark background. Drawn as instanced cylinders, one draw per layer.
- Glue: exploded, every seam (shared or explicit) shows a see-through film stretched flat between
  the two pieces' edges. Like glue pulled thin by surface tension, its open ends bow inward in
  circular arcs (each bows in 30% of the gap it spans, at most 45% of the edge), so the film
  narrows at its waist, more as the pieces spread: to about 80% of the edge on the cube and
  ball.

## Designs

- **Five-diamond star**: five 60° diamonds in a fan, the last edge sewn to the first (SC-004).
- **Cube**: one assembly (a cross), two assemblies (two strips of three) and six loose squares.
- **Ball**: a dodecahedron from two pentagon rosettes (a middle and five petals each), the
  classic EPP ball. Petals don't touch in 2D, so every petal-to-petal seam is explicit.

More, each unfolded from the solid itself (so the explicit seams are right by construction),
pieces colored by number of sides:

- **Open**: Ruffle (seven triangles round one point, in two fans: more than a flat circle, so it
  waves), Box with no lid, Pentagon basket (half the ball).
- **Closed**: tetrahedron, octahedron, icosahedron, square pyramid, hexagonal prism, truncated
  tetrahedron (hexagons, triangles), cuboctahedron (squares, triangles), truncated octahedron
  (hexagons, squares), and the soccer ball (12 dark pentagons, 20 white hexagons).

Bigger solids are split into assemblies that lie flat without overlapping: each grows from a
seed piece (the soccer ball's pentagons, at most 6 pieces each, so pentagon rosettes), and a
piece that would overlap waits for a later assembly. Checked: every closed shape folds shut,
right side out, with its exact volume (soccer ball 55.29 for 1U edges) and fold angles.

Click edges to add or remove seams and watch the fold change.

## How the fold works

- Each piece is a rigid flat plate (its pose: a rotation and a position).
- Each pass: the two ends of every seam move to their meeting point; every hinge turns its two
  plates a small share of its fold back toward flat (fabric would rather lie flat); then each plate
  takes the rigid pose that best fits where its points were sent (a shape-matching fit); then the
  whole object is put back where it was, so the flat-pull can't make it drift or spin.
- Once that settles, a last round without the flat-pull closes the seams exactly. Seams that still
  don't close are listed and drawn red.
- The fold starts by curling the flat design away from the viewer, so the right side ends up
  outside. Every seam change folds again from that start (from flat, a seam can't lift pieces out
  of the plane).
- A closed shape's signed volume says whether it is right side out.
- A fold that keeps moving without settling (the ruffle's wave rolls round its middle, every
  position equally good) counts as settled once its movement stops shrinking for 400 passes.

Checked in Chromium and Firefox: every design closes (gaps under 1e-6 U), the cube has volume 1 and
the ball 7.663 (exact for unit edges), every hinge of the star folds 42°, the cube 90°, the ball
63.4°. Unsewn, the star lies flat.

## stuff.html: physical stuffing

A copy of `fold.html` where stuffing is simulated instead of drawn (owner, 2026-11-19: "Let's do
the fold solve first then the stuffing sim. I expect that we'll have shapes that don't have a fold
solution until stuffed.").

- Fold first, as in `fold.html`. Then **Stuff** (closed shapes only, once the fold settles) turns
  every piece into fabric: the mesh it's drawn with (rings from its middle to its outline, 4 points
  per unit along each edge, so seams line up). Seams are sewn by sharing points, so a seam the
  rigid fold couldn't close is closed by the fabric bending; each shared point starts in the middle
  of its seam's gap.
- Each step (position-based dynamics, 4 substeps a frame): stuffing pushes every triangle outward
  (pressure × area, along the right side), the fabric moves with damping, then every mesh edge is
  put back to its flat length 12 times over. A stretched edge is pulled back fully; a squashed
  one only 3% as hard, since fabric bunches up and wrinkles far more easily than it stretches
  (without that a square pillow holds about half as much).
- Settled when the volume stops growing (40 frames under 0.01% change). The status shows the
  volume and the most any bit of fabric stretched. **Firmness** sets the pressure: loose to firm
  changes a pillow from 0.16 to 0.19 U³ and the stretch from under 0.1% to 0.3%.
- Explode, stitches and glue work on the stuffed shape (seams follow the fabric). Unstuff goes
  back to the fold.
- Results (firmness 0.5): two-square pillow 0.19 U³ (two unit squares sewn round can hold about
  0.2 at best), cube 1 to 1.27, pentagon ball 7.66 to 8.58, soccer ball 55.3 to 58.0, all under
  1.5% stretch, settled in 3 to 5 seconds.
- Designs that only work stuffed: **Pillow** (two squares), **Pincushion** (two hexagon flowers),
  **Star pillow** (two six-diamond stars) and **Star ornament** (two five-diamond stars) all fold
  flat, two layers on each other ("Closed, but flat: stuff it"). **Twisted pincushion** has its
  sides sewn one edge round: no flat fold closes it (gaps up to 0.47U), the fabric does.
- The two sides of each pillow are mirror images: the outline's edges are listed from a corner on
  a mirror line, and edge i of one side meets edge (-i - 1) of the other.
- Not modeled: fabric bending stiffness, gravity, how much stuffing there is (pressure stands in
  for it), the fabric touching itself.

## For the app

- The model and solver are about 250 lines with no library. three.js only draws.
- `vendor/three.min.js` is three.js r159 (MIT, `vendor/three-LICENSE.txt`), the last release with a
  single classic-script file, so the page opens from file://. The app would use the current npm
  `three` as ES modules.
- Pieces don't collide yet: pieces can pass through each other on the way.
