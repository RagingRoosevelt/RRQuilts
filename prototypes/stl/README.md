# EPP cutting template prototype (spec 027 stretch goal)

Throwaway page: a 3D-printable cutting template (STL) from an EPP shape, built the way the owner
models one by hand. Plain HTML and JavaScript, no build, nothing fetched. Open `template.html`
in a browser (file:// works), pick a shape, its size in U (1U to 4U, as in the app) and the 1U
length, download the STL, open it in a slicer.

## The owner's steps, as the page reads them

1. Extrude the outline to 4 mm (Height).
2. Shell it with an open top, 1.2 mm thick (Floor).
3. Bring the walls in so the outer wall is 4 mm (Outer wall, measured in from the outline).
4. Round the outside corners to 2 mm (the outer wall's corners, seen from above).
5. Round the pocket's corners to 6 mm.
6. Chamfer the outer edges 0.4 mm (the outside wall's top and bottom edges).
7. Chamfer the inner edges (4 − 1.2) / 2 = 1.4 mm: the pocket's top edge and its edge on the
   floor. The two chamfers meet, so the pocket wall is one 45° slope (see the section drawing).

Paper templates use the finished shape. Fabric templates add the seam allowance the same way the
app's print does (mitred corners, bevelled where a mitre would pass 4× the allowance, points
sharper than 90° trimmed by default).

## Text and hanging hole (owner, 2026-11-13)

- Debossed into the floor (a solid template's top), 0.6 mm deep (Text depth): `Edge: 1"` and
  `SA: 3/8"` (mm when 1U is in mm). Paper templates say `SA: 0`, which marks them as paper.
- Smooth letters: Noto Sans Bold outlines (SIL Open Font License 1.1) for just the characters
  used, embedded in the page, so the text is the same on every machine.
- Text first: aim for 6 mm (font size) per inch of edge (12 mm at 2", 3 mm at 1/2"), 5% smaller
  each step until it fits, down to 2.5 mm. Then the biggest
  hanging hole that still fits with it (3/4", else 3/8"), above the text if it can, else below.
  No room for text: the hole alone. A note says what was left out.

When the pocket doesn't fit, the pocket's corner radius shrinks until it does (a note says so).
Smaller still (about 1/2 in triangles and diamonds), the template is solid.

## How it's built

Every step is an offset of the outline, so the solid is a stack of rounded rings joined by bands:
no CAD kernel needed. Each ring takes a point at the same outward directions (from the outline's
corners), so every band is made of trapezoids that can't flip. The floor, with the letters and the
hole cut out of it, is split into triangles by ear clipping (each hole cut open to the outside
first). The page checks each mesh (closed,
each edge used once each way, faces out, flat faces the right way up). All 13 built-in shapes, at
1/2, 1, 1 1/2 and 2 in, paper and fabric (with and without trimmed points), with text and hole,
pass, and trimesh agrees (watertight, one solid).

Only convex outlines (every built-in shape). A concave custom shape needs a general offset.

For the app: the geometry and STL writer need no library. The page draws with a small software
renderer to stay one file. In the app, three.js would only be the 3D view.

## Questions

- Inner chamfers: both pocket edges (one 45° slope, as built here), or only the top edge?
- Paper templates: the 2 mm outside rounding blunts the paper's corners (a 60° diamond's point
  loses about 2 mm). Keep it, or sharp outside corners on paper templates?
- Tiny shapes going solid: fine, or a smaller wall for them?
