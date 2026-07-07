# VC S19003 Eyewear Labeller Design

## Goal

Build the first local labeller for `VC S19003` so the user can inspect the PDF-derived eyewear drawing, correct component labels, group adjacent visible shapes into physical components, delete mistakes, and reopen the drawing with saved memory intact.

## Source Of Truth

- `files_PDF/VC S19003.pdf` and `files_CAD/VC S19003.dwg` are the source drawings.
- The UI displays a rendered image of the PDF sheet for human verification.
- DWG exports may be used later for geometry assistance, but the current DWG layers are generic, so semantic labels come from editable memory rather than CAD layer names.
- Human corrections are stored separately from the source PDF/DWG and never modify source files.

## First-File Scope

- Only `VC S19003` is supported in this pass.
- Each visible drawing shape is labelled separately.
- Groups represent real physical components across selected visible shapes/views.
- The first seed data is intentionally editable and must not be treated as final truth.

## Component Vocabulary

The first pass supports these labels:

- `rim`
- `nose_bridge`
- `nose_pad`
- `browbar`
- `temple`
- `temple_tip`
- `end_piece`
- `hinge_joint`
- `rim_lock`
- `lens_former`
- `wire_core`
- `dimension_reference`
- `view_label`
- `other`

`VC S19003` visibly includes eye rim round, rim lock, nose bridge `VC S13110`, temple `T5-VC E14506`, end piece `T5-VC E14506`, temple tip `TT3 70MM`, front/top/left/right views, lens/former references, hinge/nose pad fields, and detail callouts.

## Eyewear Physics And Geometry Memory

Create a memory document describing eyewear part relationships:

- The nose bridge connects the left and right rims at the center and attaches at the inner rim tips.
- The temples connect to the outer rim edges via hinge/end-piece joints.
- Temple tips are the distal wearer-contact ends of the temples.
- A browbar/top bar sits above the rims, spans the roof line, and remains connected to rim or bridge/end-piece structure when present.
- Nose pads sit near the bridge and inner rim area and support the frame on the nose.
- Rim locks are small mechanical join/lock features on or near the rim, often close to a split or fastener.
- The front view is best for rim, bridge, pad, lock, and lens/former relationships.
- The top and side views are best for temple length, hinge/end-piece placement, temple bend, and tip geometry.

## UI

- Use a browser canvas-style workspace over the rendered `VC S19003` PDF page.
- Support two label drawing modes: rectangle and polygon.
- Support pan by drag, two-finger trackpad pan through normal browser wheel/trackpad events, and pinch/trackpad zoom.
- Support Shift-click multi-selection of labels.
- Provide a group action that creates or updates a physical component group from selected visible labels.
- Provide delete for selected labels and groups.
- Provide a side panel listing labels, groups, selected item metadata, and save status.
- Keep controls compact and work-focused, not a landing page.

## Persistence

- Save label memory to `eyewear_labeller/memory/VC S19003.labels.json`.
- Save eyewear physics/maths memory to `eyewear_labeller/memory/eyewear-physics-maths.md`.
- The app must load saved memory on open.
- Saving must write atomically enough to avoid a partially written JSON file.
- JSON validation rejects malformed label and group payloads.

## Architecture

- A small Python standard-library server serves the static UI, the rendered source image, and JSON memory endpoints.
- The frontend is dependency-free browser JavaScript.
- Pure label-state functions handle creating, selecting, grouping, deleting, serializing, and deserializing labels.
- Backend tests verify memory load/save validation and persistence.
- Frontend state tests verify Shift-style additive selection, grouping, deletion, and JSON round-tripping.

## Testing

- Use Python `unittest` for backend memory persistence.
- Use Node's built-in test runner for pure frontend state functions.
- Use a local browser check after starting the server to verify the page renders the drawing, loads seed labels, and can save memory.

## Constraints

- No network package install is required.
- The app must remain contained under `eyewear_labeller/` except for the spec/plan docs.
- The original source PDF/DWG files must not be edited.
- This folder is not a git repository, so commits are not possible unless the user initializes or moves it into version control.
