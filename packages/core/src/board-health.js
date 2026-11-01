// Board Health v1: heuristic document-size signals, not a measured FPS diagnostic.
// Hosts can use these pure metrics without mounting Quickdraw's UI.
export function measureBoardHealth(store) {
  const records = store.all()
  const shapes = records.filter(r => r.typeName === 'shape')
  const assets = records.filter(r => r.typeName === 'asset')
  let embeddedBytes = 0
  let externalAssets = 0
  for (const asset of assets) {
    const src = typeof asset.src === 'string' ? asset.src : ''
    if (src.startsWith('data:')) {
      const comma = src.indexOf(',')
      if (comma >= 0) embeddedBytes += Math.ceil((src.length - comma - 1) * 0.75)
    } else if (src) externalAssets++
  }
  const snapshotBytes = new TextEncoder().encode(JSON.stringify(store.getSnapshot())).length
  // Conservative provisional thresholds; validate against real devices.
  const risk = shapes.length >= 2000 || embeddedBytes >= 12 * 1024 * 1024 || snapshotBytes >= 16 * 1024 * 1024
  const heavy = shapes.length >= 500 || embeddedBytes >= 3 * 1024 * 1024 || snapshotBytes >= 4 * 1024 * 1024
  return {
    level: risk ? 'risk' : heavy ? 'heavy' : 'healthy',
    shapes: shapes.length,
    images: shapes.filter(s => s.type === 'image').length,
    externalAssets,
    embeddedBytes,
    snapshotBytes,
  }
}

export function mountBoardHealth(editor, { enabled = true } = {}) {
  if (!enabled) return { destroy() {} }
  const root = editor.container
  const details = document.createElement('details')
  details.className = 'qd-board-health'
  details.style.cssText = 'position:absolute;top:12px;right:12px;z-index:12;background:#fff;color:#183638;border:1px solid #a9bdbe;box-shadow:0 2px 8px #0002;padding:6px 9px;font:12px system-ui;max-width:min(290px,75%);'
  const summary = document.createElement('summary')
  summary.style.cssText = 'cursor:pointer;font-weight:600'
  const body = document.createElement('div')
  body.style.cssText = 'padding-top:8px;line-height:1.65'
  details.append(summary, body)
  details.addEventListener('click', (event) => {
    if (details.open && !summary.contains(event.target)) details.open = false
  })
  root.append(details)
  const format = n => (n / (1024 * 1024)).toFixed(2) + ' MB'
  const update = () => {
    const m = measureBoardHealth(editor.store)
    summary.textContent = m.level === 'risk' ? '⚠ Performance Risk' : m.level === 'heavy' ? '◐ Getting Heavy' : '● Healthy'
    summary.title = 'Board Health — estimated document complexity'
    body.replaceChildren()
    for (const line of [
      'Shapes: ' + m.shapes,
      'Images: ' + m.images,
      'Externally stored assets: ' + m.externalAssets,
      'Embedded image bytes (estimate): ' + format(m.embeddedBytes),
      'Document snapshot: ' + format(m.snapshotBytes),
      m.level === 'healthy' ? 'No action suggested.' : 'Consider removing unused content or moving work to another board. Nothing is removed automatically.',
      'Estimates only; not a live performance measurement.',
    ]) {
      const div = document.createElement('div')
      div.textContent = line
      body.append(div)
    }
  }
  const off = editor.store.listen(update)
  update()
  return { destroy() { off(); details.remove() } }
}
