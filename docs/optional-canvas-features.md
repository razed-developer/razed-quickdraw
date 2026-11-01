# Optional canvas backgrounds and regions

Quickdraw's drawing, tools, colours, personal swatches, collections, collaboration, camera, and editing remain foundational. **Only backgrounds and infinite region layouts are optional.** No general plugin system is required.

## Host configuration

```js
createQuickdraw({
  container,
  features: { backgrounds: false, regions: false }, // plain infinite canvas
})
```

- `features` omitted: preserve existing Quickdraw grid behaviour (backward compatibility).
- `backgrounds: true`: enable the existing whole-canvas grid preference.
- `backgrounds: false`: suppress whole-canvas grid rendering.
- `regions: true` plus `regions: {layout, backgrounds}`: render independent region backgrounds, clipped to infinite partitions.
- `regions: false`: do not display region backgrounds; any stored region configuration is retained.
- Regions take visual precedence over the whole-canvas grid when enabled and configured.
- Both flags are display capabilities, not document deletion or access controls.

```js
const board = createQuickdraw({
  container,
  features: { backgrounds: true, regions: true },
  regions: {
    layout: 'vertical',
    backgrounds: [{ type: 'graph' }, { type: 'dots' }],
  },
})
board.editor.setFeatures({ regions: false }) // hide, preserve configuration
board.editor.setFeatures({ regions: true })  // show again
board.editor.setRegions('quadrants', [
  { type: 'paper' }, { type: 'solid' },
  { type: 'dark' }, { type: 'custom', color: '#d7e8f4' },
])
```

## Next steps

The editor rendering foundation is opt-in; the collaboration demo does **not yet** expose a layout selector or synchronize region metadata. Do not treat local display settings as shared room state until room persistence and revision handling are implemented and tested. Also test rendering at non-default zoom and export.
