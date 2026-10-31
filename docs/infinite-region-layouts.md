# Infinite region layouts — design specification

Status: agreed concept, not yet implemented.

## Core model

A Quickdraw document remains **one infinite canvas**. A new document's starting camera is centered on world origin (0, 0), and the selected layout is anchored to that origin. Region boundaries are mathematical partitions of the plane, **not finite panels/pages**. Each region extends indefinitely wherever its partition allows.

Layout presets, inspired by the seven sketches:
- Vertical split: x=0.
- Horizontal split: y=0.
- Four quadrants: x=0 and y=0.
- Top split: y=0 globally; x=0 for y<0.
- Bottom split: y=0 globally; x=0 for y>=0.
- Left focus: x=0 globally; y=0 for x>=0 (large left, split right).
- Right focus: x=0 globally; y=0 for x<0 (split left, large right).

Coordinates assume screen-like +y downward; the origin and partition rules remain stable across camera movements. The initial viewport is centered on origin regardless of viewport size.

## Region properties

Each region independently selects a background: solid, custom solid color, graph, dots, paper, dark. Backgrounds are rendering-only and must not create drawable grid records or affect hit testing, undo/redo, or document geometry. Patterns are calculated in world coordinates and clipped to visible region intersections, maintaining alignment while panning/zooming. Content may cross boundaries.

A layout and its region settings belong to the **shared document** (not an individual editor's camera) and should synchronize/persist through the existing document model. Changes should be undoable and merge-safe; avoid storing region configuration in ephemeral camera messages.

The global canvas still exists underneath the partition; no finite page limits or off-canvas regions.

## Deferred capability: split-screen views

Record an architectural extension point for **multiple independent viewports of the same document**, possibly with different cameras and active tools. This is distinct from region partitions. Do not implement working split-screen UI in this milestone. Avoid baking a single-camera assumption into persisted region metadata.

## Implementation order

1. Define and unit-test pure region partition/lookup functions and background configuration validation.
2. Extend the document schema and synchronization safely, including migration/defaults for existing boards.
3. Implement world-anchored, viewport-clipped region background rendering.
4. Add layout/background selection UI and browser tests (pan, zoom, sync, reload).
5. Consider editing/locking boundaries, configurable divider offsets, and later split-screen views separately.

## Design constraints

- Avoid DOM-sized panels or enormous canvas rectangles to represent infinity.
- Render only the visible portion of the plane.
- Keep the origin anchored while allowing unrestricted navigation.
- Preserve independent cameras, follow, call, and presence indicators.
- Do not modify SQA Live; Quickdraw is the canonical reusable SDK.
