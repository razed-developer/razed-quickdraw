# Animated GIFs — experimental phase 2

The initial implementation is opt-in:

```js
const board = createQuickdraw({
  container: document.getElementById('board'),
  animatedGifs: true,
})

// Playback visibility is local to this editor; it is not synchronized.
board.gifs.setPlaying(false)
board.gifs.setPlaying(true)
```

Import a GIF through the existing image picker, drag-and-drop, or `editor.insertImageBlob(gifBlob)`. GIFs retain their original encoded frames even when their dimensions exceed the usual still-image downscaling limit. With `assetStorage.upload`, the original GIF is uploaded and its URL stored in the board document; without storage, the encoded data URL remains in the document (which can make synchronization heavy).

The overlay is a non-interactive DOM image positioned over the canvas and updated during normal editor renders. The canvas image still supplies a frame for static PNG exports. Playback is **not** synchronized, and `setPlaying(false)` hides the animation overlay, exposing the canvas-rendered frame rather than freezing the current animated frame.

## Current limitations

- GIFs use browser-native playback; there is no frame-accurate pause, seek, or deterministic synchronized playback.
- GIF overlay content may overlap other shapes differently from the canvas stacking order; this first pass does not interleave DOM GIFs between canvas-rendered shapes.
- Exports are static PNGs, not animated GIFs. Their frame is browser-dependent.
- Animation may be affected by browser reduced-motion settings; hosts should offer a playback toggle.
- Very large GIF files are preserved rather than downscaled; enforce upload limits and watch memory/network use.
- The demo room must opt into `animatedGifs` independently of the Feature Lab.

Test before production: insert a small animated GIF, move/resize/rotate it, zoom/pan, pause and resume, export PNG, and refresh with external storage. Verify with two participants when enabling in the room demo.
