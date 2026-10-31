# Unrestricted colour picker and swatch collections

Status: agreed feature concept; not yet implemented.

## Goal
Replace the current fixed colour-choice limitation with arbitrary colour selection while retaining existing colours as convenient **default saved swatches**.

## Colour controls
- Visual colour picker supporting any sRGB colour; editable HEX input, optionally RGB/HSL controls.
- Eyedropper to sample a colour from the canvas, with browser Screen EyeDropper API where supported and appropriate permission/gesture. Provide a canvas-only fallback or explain unavailable support; do not silently claim screen sampling.
- Apply arbitrary selected colours consistently to freehand ink, lines, arrows, geometry, text, notes, highlights, and selected shapes.
- Existing palette remains a default swatch collection, not a restriction.
- Add/remove/reorder/rename swatches and select one with a click.

## Collections
- Named swatch collections (e.g. Mathematics, Writing, Personal), with create, rename, duplicate, and delete.
- Distinguish **personal collections** (persist across boards in user preferences) from **document collections** (stored in the shared document and synchronized to collaborators).
- Preserve defaults and avoid destructive overwrites. Consider import/export and sharing later.
- Do not confuse swatches (user preferences) with the actual colour saved on each shape. Shape colour must remain stable even when a swatch is removed or changed.

## Technical considerations
- Existing named colour IDs may be embedded in shape records; support migration/compatibility before introducing arbitrary HEX colours.
- Contrast and visibility on dark, paper, custom, and mixed region backgrounds should be considered; do not forcibly recolour saved shapes.
- Screen eyedropper permissions/browser support differ; keep basic picker fully functional without it.
- Future colour opacity controls should be evaluated independently, especially for highlights.

## Suggested order
1. Audit colour IDs and rendering paths across core and SDKs.
2. Introduce canonical colour parsing/resolution with backwards compatibility.
3. Implement visual picker and current default swatches.
4. Add eyedropper with graceful fallback.
5. Add persistent personal and document swatch collections, tests, and migration.
