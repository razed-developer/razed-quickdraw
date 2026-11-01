// Animated GIFs are DOM images positioned over the canvas. The canvas retains
// its ordinary static rendering for export; animation never drives a redraw loop.
export function mountGifOverlay(editor, { enabled = false } = {}) {
  if (!enabled) return { destroy() {}, setPlaying() {} }
  const layer = document.createElement('div')
  layer.className = 'qd-gif-layer'
  layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2'
  editor.container.append(layer)
  const nodes = new Map()
  let playing = true
  function update() {
    const active = new Set()
    for (const shape of editor.store.shapes()) {
      if (shape.type !== 'image') continue
      const asset = editor.store.asset(shape.props?.assetId)
      if (!asset || !(asset.animated || asset.mimeType === 'image/gif' || /^data:image\/gif[;,]/i.test(asset.src) || /\.gif(?:[?#]|$)/i.test(asset.src))) continue
      active.add(shape.id)
      let node = nodes.get(shape.id)
      if (!node) {
        node = document.createElement('img')
        node.alt = ''
        node.setAttribute('aria-hidden', 'true')
        node.style.cssText = 'position:absolute;pointer-events:none;transform-origin:center center;object-fit:fill'
        nodes.set(shape.id, node)
        layer.append(node)
      }
      if (node.dataset.assetSrc !== asset.src) {
        node.src = asset.src
        node.dataset.assetSrc = asset.src
      }
      const { x, y } = editor.pageToScreen(shape.x, shape.y)
      const zoom = editor.camera.z
      node.style.left = x + 'px'
      node.style.top = y + 'px'
      node.style.width = shape.props.w * zoom + 'px'
      node.style.height = shape.props.h * zoom + 'px'
      node.style.transform = 'rotate(' + (shape.rot || 0) + 'rad)'
      node.style.display = playing ? '' : 'none'
    }
    for (const [id, node] of nodes) if (!active.has(id)) { node.remove(); nodes.delete(id) }
  }
  const offRender = editor.on('render', update)
  const offStore = editor.store.listen(() => editor.requestRender())
  update()
  return {
    setPlaying(value) { playing = !!value; update() },
    destroy() { offRender(); offStore(); layer.remove(); nodes.clear() },
  }
}
