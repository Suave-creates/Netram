# Eyewear Physics And Maths Memory

This memory file records the geometry rules the labeller should preserve while the user corrects visible labels. The PDF and CAD files remain the source of truth; this file explains how labelled shapes relate to physical eyewear components.

## Core Structure

- The eyewear front is built around two rims: left and right. Each rim surrounds one lens/former opening.
- The nose bridge connects the left and right rims at the center. It attaches near the inner rim tips and controls the DBL, the distance between lenses.
- Nose pads sit near the bridge and inner rim area. They support the frame on the nose and are visible in front/top/detail views depending on projection.
- Temples connect to the outer rim edges through end pieces and hinge joints. The hinge is the rotational joint where the temple can fold.
- Temple tips are the distal ends of temples. They bend around the ear and are usually shown best in side/top views.
- A browbar or top bar sits over the rims at the roof line when present. It spans across the upper rim region and remains connected to the rim, bridge, or end-piece structure.
- Rim locks are small mechanical locking features on or near a rim split. They are separate from the rim outline but physically belong to the rim assembly.
- Wire cores are internal reinforcing wires inside temple or temple-tip material. They are visible as hidden/dashed or centerline geometry.

## View Logic

- Front view is the main source for rim shape, bridge placement, DBL, lens/former shape, nose pad placement, and rim lock locations.
- Top view is the main source for pantoscopic/wrap geometry, temple spread, hinge/end-piece position, and temple-tip bend.
- Side or left/right views are the main source for temple length, temple bend radius, temple-tip angle, hinge stack thickness, and end-piece height.
- Detail views at scale 2:1 show small mechanical parts such as bridge, end piece, rim lock, and section profiles. These should be labelled separately and grouped with the physical part when useful.

## VC S19003 Source Cues

- The part table names `Eye Rim round (R1-Round)`, `Rim Lock`, `Nose bridge(VC S13110)`, `Temple (T5-VC E14506)`, `End peice (T5-VC E14506)`, and `Tip (TT3)`.
- Size text indicates `58□16 145`, which maps to lens width 58 mm, bridge width 16 mm, and temple length 145 mm.
- The front-view bridge region has a 15.6 mm DBL callout and a 17.0 mm bridge-height callout.
- The top view carries the front-to-rear temple depth cue at `153 mm`; its horizontal spans narrow from the `140 mm` front cue toward the rear temple-tip span.
- The side-view temple and tip details show the 145 mm temple length, 70 mm tip section, R30 bend, and angled tip geometry.

## Relationship Rules For Grouping

- A physical rim group may contain the rim outline in front view, rim profile in top view, rim outline in detail views, and rim lock labels attached to that rim.
- A physical bridge group may contain front bridge geometry, top bridge geometry, and bridge detail callouts.
- A physical temple group may contain top-view temple geometry, side-view temple geometry, wire core, temple-tip bend, and related detail views.
- A physical hinge/end-piece group may contain hinge joint labels, end-piece labels, section callouts, and the visible connection between rim and temple.
- Adjacent visible labels should be grouped only when they represent the same physical part or a mechanical subassembly that must move or fit together.

## Constraint Notes

- Rims should remain symmetric in function but not necessarily identical in visible drawing orientation.
- The bridge must remain between the rims and should not be grouped with temple labels.
- Temples should not be grouped with rims unless the group is explicitly an assembly group. Their primary connection is through hinge/end-piece labels.
- The temple root must physically enter or overlap the hinge/end-piece sleeve. In 3D, render a short connector from the hinge sleeve into the temple body so the temple never appears as a detached strip.
- Nose pads should remain separate from the bridge unless a later workflow needs a full nose-support assembly group.
- Dimension/reference labels are useful for context but should not be grouped as physical geometry unless the user deliberately includes them.
- Temple-tip drawings may show a straight dashed extension near the curved ear tip. Treat that straight dashed tip as construction/reference geometry only. The physical 3D temple tip is the arched/curved bent body from the side-view PDF/CAD, using the R30 bend, visible tip length, and end-height dimensions.

## VC S19003 3D Reconstruction Notes

- The first 3D reconstruction uses millimeters as the working unit.
- The wearer-right rim is placed on the viewer-left side in the front camera, matching the corrected front-view mapping.
- Rim centers are separated by `58 + 15.6 = 73.6 mm`; each rim uses the `58 mm` A-width and `42.4 mm` B-height source cues.
- VC S19003 front rims use the actual CAD front-view LWPOLYLINE geometry, not a generic ellipse: entity `2570` is the wearer-right/viewer-left rim and entity `2565` is the wearer-left/viewer-right rim. Their bulge arcs are sampled and normalized to the PDF `58 mm` A-width and `42.4 mm` B-height cues.
- The nose bridge is the shallow VC S13110 center bridge, not a tall arch: use the front bridge cluster plus detail cues `17.94 mm` width and `2.13 mm` profile depth while keeping the ends tied to the DBL/inner rim tips.
- The browbar/top bar uses CAD entity `13437`, matching the front-view `84.1 mm` by `1.2 mm` top-bar cue above the rim roof.
- The hinge/end-piece assemblies sit at the outer front width cue, approximately `±70 mm` from center for the `140 mm` front.
- Temples extend rearward from the hinges and use the `145 mm` temple-length cue, with the final tip section following the `70 mm` TT3, `R30`, and `42°` side-view cues.
- The top-view temple geometry converges inward from the `140 mm` front width toward the rear `99 mm` span; the `153 mm` cue is front-to-rear top-view depth, not lateral spread.
- The side-view TT3 tip does not start dropping immediately at the 75 mm material transition. For VC S19003 it remains nearly straight through the early TT3 segment until about `100 mm` from the hinge, then follows the R30/42 degree downward bend and finishes about `22 mm` below the temple baseline at the rear tip.
- The VC S19003 temple and TT3 tip should render from side-view outlines, not round placeholder tubes: the temple has a `3.3 mm` strip, and the visible TT3 tip is one bent sleeve body that sits over the temple end before following the side-view `R30` bend plus `42°`/`40 mm` angled cue. Do not render the dotted/straight TT3 construction line as a second visible temple tip.
- For VC S19000, VC S19001, VC S19002, VC S19004, and VC S19005, the TT1/TT4 visible temple tip should use the solid arched side-view tip only. The 75 mm or 79.5 mm visible length defines where the sleeve/tip starts, while the 10.1-10.4 mm rear end-height defines the local rear cross-section thickness only. The total downward drop comes from the R30 bend, the 35 degree tip angle, and the 40 mm angled cue; the dashed straight construction line must not flatten the 3D centerline or either side outline.
- Nose pads are modeled as separate translucent supports behind the bridge/inner rim area, not as part of the bridge mesh. For VC S19003 each nose pad must include the visible metal nose arm from the top view; the arm foot mounts on the inner rim edge near the pad height, then curls into the pad, using the `85°±1°`, `1.8`, and `2.0` top-view cues.
- The hinge, end piece, and rim lock are an interlocked mechanical junction at the outer rim. The front view shows the rim-lock clamp/tab at the rim split, while the top view shows curved end-piece/hinge leaves with circular screw or pivot heads. Do not model this area as independent plain blocks.
