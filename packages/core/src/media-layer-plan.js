// Pure screen-compositor plan. The input must already be in the editor's
// authoritative rendering order (Editor.shapesSorted()).
export function isAnimatedImage(shape, asset) {
  if (shape?.type !== 'image' || !asset || typeof asset.src !== 'string') return false
  return asset.animated === true || asset.mimeType === 'image/gif' ||
    /^data:image\/gif[;,]/i.test(asset.src) || /\.gif(?:[?#]|$)/i.test(asset.src)
}

// Each canvas run holds only consecutive nonanimated shapes. Empty runs are
// omitted, so adjacent GIFs don't create unnecessary transparent canvases.
export function planMediaLayers(sortedShapes, assetFor) {
  if (!Array.isArray(sortedShapes)) throw new TypeError('sortedShapes must be an array')
  if (typeof assetFor !== 'function') throw new TypeError('assetFor must be a function')
  const layers = []
  let run = []
  const flush = () => {
    if (run.length) { layers.push({ kind: 'canvas', shapes: run }); run = [] }
  }
  for (const shape of sortedShapes) {
    const asset = shape?.type === 'image' ? assetFor(shape.props?.assetId) : null
    if (isAnimatedImage(shape, asset)) {
      flush()
      layers.push({ kind: 'gif', shape, asset })
    } else {
      run.push(shape)
    }
  }
  flush()
  return layers
}
