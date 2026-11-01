import { planMediaLayers } from './media-layer-plan.js'

// Screen-only compositor. Export/capture still use Editor.renderScene's normal
// ordered single-canvas pass; only the interactive viewport is layered.
export function mountGifOverlay(editor, { enabled = false } = {}) {
  if (!enabled) return { destroy() {}, setPlaying() {} }
  const layer = document.createElement('div')
  layer.className = 'qd-gif-layer'
  layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2'
  editor.container.append(layer)
  // Reuse GIF elements by shape ID so normal board edits do not restart playback.
  const gifs = new Map()
  const canvases = []
  let playing = true

  function update() {
    if (!playing) return
    const plan = planMediaLayers(editor.shapesSorted(), id => editor.store.asset(id))
    const { w, h } = editor.viewSize()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const ordered = []
    const usedGifs = new Set()
    let canvasIndex = 0
    for (const entry of plan) {
      if (entry.kind === 'canvas') {
        let canvas = canvases[canvasIndex++]
        if (!canvas) {
          canvas = document.createElement('canvas')
          canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'
          canvases.push(canvas)
        }
        const cw = Math.round(w * dpr), ch = Math.round(h * dpr)
        if (canvas.width !== cw) canvas.width = cw
        if (canvas.height !== ch) canvas.height = ch
        editor.renderScene(canvas.getContext('2d'), editor.camera, w, h, {
          dpr, background: false, hideEditing: true, shapes: entry.shapes,
        })
        ordered.push(canvas)
        continue
      }
      const { shape, asset } = entry
      usedGifs.add(shape.id)
      let node = gifs.get(shape.id)
      if (!node) {
        node = document.createElement('img')
        node.alt = ''
        node.setAttribute('aria-hidden', 'true')
        node.style.cssText = 'position:absolute;pointer-events:none;transform-origin:center center;object-fit:fill'
        gifs.set(shape.id, node)
      }
      if (node.dataset.assetSrc !== asset.src) {
        node.src = asset.src
        node.dataset.assetSrc = asset.src
      }
      const pos = editor.pageToScreen(shape.x, shape.y)
      node.style.left = pos.x + 'px'
      node.style.top = pos.y + 'px'
      node.style.width = shape.props.w * editor.camera.z + 'px'
      node.style.height = shape.props.h * editor.camera.z + 'px'
      node.style.transform = 'rotate(' + (shape.rot || 0) + 'rad)'
      ordered.push(node)
    }
    for (const [id, node] of gifs) {
      if (!usedGifs.has(id)) { node.remove(); gifs.delete(id) }
    }
    for (let i = canvasIndex; i < canvases.length; i++) canvases[i].remove()
    canvases.length = canvasIndex
    // append() moves existing nodes without recreating them or resetting src.
    layer.append(...ordered)
  }

  editor._mediaCompositorActive = true
  // Keep editor selection handles above all media and below toolbar chrome.
  const oldOverlayZ = editor.overlay.style.zIndex
  editor.overlay.style.zIndex = '3'
  const offRender = editor.on('render', update)
  update()
  editor.requestRender()
  return {
    setPlaying(value) {
      playing = !!value
      editor._mediaCompositorActive = playing
      layer.style.display = playing ? '' : 'none'
      if (playing) update()
      editor.requestRender()
    },
    destroy() {
      offRender()
      editor._mediaCompositorActive = false
      editor.overlay.style.zIndex = oldOverlayZ
      layer.remove()
      gifs.clear()
      canvases.length = 0
      editor.requestRender()
    },
  }
}
