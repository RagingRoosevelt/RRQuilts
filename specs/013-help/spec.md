# Feature Specification: Help

**Feature Branch**: `013-help`

**Created**: 2026-10-12

**Status**: Draft (user stories only)

**Input**: User description: "let's add a new app module in addition to home, project, libraries.
this will be "help". we'll have guides for using the app as one section. and we'll have quilt math
as a second section. and we'll have useful resources as another section."

> A fourth header destination next to Home, Project, and Libraries. Spec 012 is reserved for
> resource repositories. Help content ships with the app (works offline, constitution: no server
> calls); only links in Resources lead off the app, and only when the user follows them. All six
> stories, calculators included, are v1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Help (Priority: P1)

Help is always one tap away, from any screen, with or without an open project.

**Independent Test**: From the home screen, the quilt editor, and Libraries, open Help → it shows
Guides, Quilt math, Techniques, and Resources; go back → the previous screen is as it was.

**Acceptance Scenarios**:

1. **Given** any screen, **Then** the header offers Help with Home, Project, and Libraries (a button
   on wide screens, an entry in the compact menu on phones).
2. **Given** Help, **Then** it has four sections, in this order — Guides, Quilt math, Techniques,
   Resources — each with its own address (`/help/guides`, `/help/math`, `/help/techniques`,
   `/help/resources`) so a link can open one directly; `/help` opens Guides.
3. **Given** an open project with unsaved changes, **When** the user opens Help, **Then** nothing is
   lost and Project returns to it.
4. **Given** no network, **Then** Guides, Quilt math, and Techniques work fully.

### User Story 2 - Guides for using the app (Priority: P1)

Short task-based guides explain how to get things done in RRQuilts, in the app's own words.

**Independent Test**: Open Guides → "Print templates for a block" → follow the steps in the app
and get the printout described.

**Acceptance Scenarios**:

1. **Given** Guides, **Then** it lists topics covering at least: starting, saving, and opening
   projects (files, drafts, offline use); the sketchbook; designing a quilt (layout, borders,
   placing blocks, coloring, Apply to); drawing blocks and colorings; colors and palettes;
   libraries (My library, packs, backup and restore, sharing); credits and licenses; printing
   (templates, rotary chart, yardage, corner guides); settings.
2. **Given** a guide, **Then** it gives numbered steps naming the screens, tabs, and buttons as the
   app labels them.
3. **Given** Guides, **Then** a search box filters topics by words in their titles and text.

### User Story 3 - Quilt math (Priority: P1)

Formulas quilters use, explained, with the same numbers the printouts use.

**Independent Test**: Open Quilt math → Half-square triangles → for a 3″ finished leg it says cut
3⅞″ squares, matching the rotary chart.

**Acceptance Scenarios**:

1. **Given** Quilt math, **Then** it covers at least: seam allowance; squares and rectangles;
   half-square and quarter-square triangles; flying geese; on-point settings (diagonals, side and
   corner setting triangles); straight and mitered borders (why a mitered strip's ends add
   seam × (1 + √2) each); binding; backing; yardage and fat quarters; rounding to the ruler.
2. **Given** a formula, **Then** it shows the general form (in terms of finished size and seam
   allowance), a worked example in inches and in centimeters, and a small diagram.
3. **Given** a formula the app uses in printing, **Then** the result matches the printout for the
   same input (one source of truth for the math).
4. **Given** a topic with a calculator, **When** the user enters a finished size, **Then** it
   shows the cut size in the user's units and rounding.

### User Story 4 - Quilting techniques (Priority: P1)

Step-by-step how-tos for quilting techniques, next to Resources: what the printouts tell you to cut,
and how to sew it.

**Independent Test**: Open Techniques → Continuous strip mitered binding → follow the steps for a
48″ × 48″ quilt with 2½″ strips: the strip count and length match the yardage page's binding line.

**Acceptance Scenarios**:

1. **Given** Techniques, **Then** it covers at least:
   - **Continuous strip mitered binding**: cutting strips (from the binding calculator), joining
     them end to end with diagonal seams, pressing in half, sewing to the quilt, mitering each
     corner (fold up at 45°, fold down, keep sewing), joining the two ends, and turning to the back.
   - **Unit cutting techniques**: making common units whole instead of cutting each patch — flying
     geese by stitch and flip and four at a time; half-square triangles two, four, and eight at a
     time; square-in-a-square — each with what to cut (calculator), sewing lines, the cut order,
     and how many units it makes. (The rotary chart suggesting these is spec 010 US6, deferred.)
2. **Given** a technique, **Then** it has numbered steps, a diagram per key step, and the sizes in
   the user's units, worked out by the same formulas as Quilt math.
3. **Given** a printout that uses a technique (binding on the yardage page, the mitered corner
   guide), **Then** a help link opens it (US6).

### User Story 5 - Useful resources (Priority: P1)

A curated list of places to learn more and get help.

**Independent Test**: Open Resources → each link opens in a new tab; offline, the list still shows
and says the links need a connection.

**Acceptance Scenarios**:

1. **Given** Resources, **Then** it lists, grouped: the RRQuilts project (source, reporting
   problems, the file-format schemas), licenses (what the Creative Commons licenses allow), and
   quilting learning resources.
2. **Given** a link, **Then** it opens in a new tab and says where it goes; nothing is fetched
   until the user follows it.
3. **Given** Resources, **Then** other quilt software is not promoted or named.

### User Story 6 - Help from where you are (Priority: P1)

Screens link to the help that explains them.

**Acceptance Scenarios**:

1. **Given** an editor tab or a print section (e.g. the corner guide page, the rotary chart),
   **Then** a help link opens the matching guide, Quilt math topic, or technique.
2. **Given** a first-use hint, **Then** it can link to its guide.

### Edge Cases

- Deep link to a topic that doesn't exist → the section opens with a short notice.
- Help opened in a read-only tab (another tab is editing) → works the same.
- Metric projects and settings → examples and calculators use centimeters and 7.5 mm seams.
