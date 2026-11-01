# Animated media stacking — renderer design

## Goal

Animated GIFs must obey the same stacking order as ordinary Quickdraw shapes, including cases with multiple GIFs interleaved among strokes, text, images, and notes. Do not solve this by always placing the GIF DOM layer above or below the whole canvas.

## Current architecture

- `Editor.shapesSorted()` is the authoritative order: highlighters first, then ascending `z` with stable ID tie-breaking.
- `Editor.renderScene()` paints background and every shape to a single canvas; it is also reused for capture and PNG export.
- `mountGifOverlay()` creates non-interactive HTML images over that canvas and tracks position/rotation/zoom on the editor's `render` event.
- With `animatedGifs: false`, nothing changes. With animation paused, the normal canvas frame is visible.

## Proposed implementation

Build a *screen-only* compositing stack from the sorted shapes. Each run of ordinary shapes becomes a transparent canvas; each animated GIF is a DOM image between those canvases. Keep one background canvas at the bottom, and keep selection handles and UI overlays at the top. For example:

```text
UI + selection handles
canvas: strokes above GIF B
GIF B
canvas: text and notes between GIFs
GIF A
canvas: strokes below GIF A
background canvas: paper, grid, regions
```

A layer plan should be a pure function of the sorted shapes and asset records, making ordering testable without a browser. Reuse existing `drawShape` and camera transforms to draw canvas runs; don't create an independent shape renderer. Reuse layer DOM nodes where practical rather than replacing images each frame (which would restart animations). Keep the stack pointer-events:none so existing editor hit-testing and interactions remain authoritative.

**Screen-only distinction:** `renderScene()` must remain a single ordered canvas pass for static exports and capture, with GIFs represented by a still frame. It must not accidentally include duplicate DOM media or omit ordinary shapes.

## Engineering requirements

1. Test a single GIF above/below strokes, two GIFs interleaved with ordinary shapes, and changes from bring-forward/send-back.
2. Test zoom, pan, rotation, resize, deletion, undo/redo, asset URL changes, and playback toggle.
3. Preserve the highlighter-under-ink ordering from `shapesSorted()`.
4. Keep existing SDK API `animatedGifs` and `board.gifs.setPlaying(boolean)`; no new synced playback state.
5. Manage canvas pixel density, resize and cleanup carefully; cap or recycle canvas layers on large mixed-media boards.
6. Ensure board background, selection overlays, floating UI, and Board Health retain their current visual hierarchy.
7. Add performance checks before enabling this compositor in collaborative production sessions.

## Rollout

Phase A: pure layer-plan function and tests.
Phase B: screen-only compositor behind opt-in `animatedGifs`.
Phase C: browser validation in Feature Lab and two-person room demo.
Phase D: optimization and documented limits.

Avoid introducing the compositor into the standard static-only rendering path until it is validated.
