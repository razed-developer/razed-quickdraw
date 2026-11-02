import { wikimediaCommonsProvider } from './media-providers.js'
// The board's chrome: a floating dock of tools, a styles popover, and the
// board menu — plain DOM, one implementation for every host framework.
// The dock is responsive: tools overflow into a "more" flyout as the frame
// narrows, and a very small frame folds the whole kit into one button.
// Icons follow the Lucide geometry (24px grid, 2px stroke) so they read as
// the standard set users already know.
// Dependency-free ESM (see palette.js).

import { resolveShapeColor, COLOR_IDS, SIZE_IDS, DASH_IDS, FILL_IDS, GEO_IDS, GRID_IDS, THEMES } from './palette.js'

const SVG = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

const ICONS = {
  select: SVG('<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>'),
  hand: SVG('<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'),
  draw: SVG('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>'),
  highlight: SVG('<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4l8 8Z"/>'),
  eraser: SVG('<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),
  // a pointer wand with sparks at the tip — the sun-burst read as brightness
  laser: SVG('<path d="m3 21 9-9"/><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h-2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="M12.2 6.2 11 5"/>'),
  line: SVG('<path d="M19 5 5 19"/>'),
  arrow: SVG('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
  text: SVG('<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>'),
  note: SVG('<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>'),
  image: SVG('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
  undo: SVG('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>'),
  redo: SVG('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/>'),
  menu: SVG('<circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none"/>'),
  // double chevron up (the flyout opens above the dock) — dots would read as
  // a second dot-menu next to the board menu's vertical dots
  more: SVG('<path d="m7 12.5 5-5 5 5"/><path d="m7 18.5 5-5 5 5"/>'),
  // geo kinds
  rectangle: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/>'),
  ellipse: SVG('<circle cx="12" cy="12" r="9"/>'),
  triangle: SVG('<path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/>'),
  diamond: SVG('<path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/>'),
  hexagon: SVG('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'),
  star: SVG('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
  cloud: SVG(`<path d="M7 17h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 7 10a3.5 3.5 0 0 0 0 7z"/>`),
  // menu glyphs
  download: SVG('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>'),
  transparent: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/><rect x="4" y="4" width="8" height="8" fill="currentColor" fill-opacity=".22" stroke="none"/><rect x="12" y="12" width="8" height="8" fill="currentColor" fill-opacity=".22" stroke="none"/>'),
  copy: SVG('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>'),
  fit: SVG('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>'),
  trash: SVG('<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'),
  check: SVG('<path d="M20 6 9 17l-5-5"/>'),
  chevronRight: SVG('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: SVG('<path d="m15 18-6-6 6-6"/>'),
  sun: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
  moon: SVG('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
}
// the action bar wears the same glyphs the menu already uses
ICONS.duplicate = ICONS.copy
ICONS.delete = ICONS.trash

// grid backdrops: bare paper, ruled lines, dotted intersections
const GRID_ICONS = {
  none: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/>'),
  lines: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke-width="1.4"/>'),
  ruled: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 8.5h18M3 13h18M3 17.5h18" stroke-width="1.4"/>'),
  dots: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" stroke-width="2.2"/>'),
  crosses: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 6.5v3M6.5 8h3M16 6.5v3M14.5 8h3M12 10.5v3M10.5 12h3M8 14.5v3M6.5 16h3M16 14.5v3M14.5 16h3" stroke-width="1.3"/>'),
  iso: SVG('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m3 7 10.4 14M8.6 3 19 17M21 7 10.6 21M15.4 3 5 17" stroke-width="1.2"/>'),
}
const GRID_TIPS = {
  none: 'No grid', lines: 'Grid lines', ruled: 'Ruled paper',
  dots: 'Grid dots', crosses: 'Crosses', iso: 'Isometric',
}
const GRID_LABELS = { none: 'None', lines: 'Lines', ruled: 'Ruled', dots: 'Dots', crosses: 'Crosses', iso: 'Isometric' }

const DASH_ICONS = {
  draw: SVG('<path d="M4 15c3.2-4.5 6-5.5 8-3.5s5 1.5 8-4.5"/>'),
  solid: SVG('<path d="M4 12h16"/>'),
  dashed: SVG('<path d="M4 12h3.2M10.4 12h3.2M16.8 12h3.2"/>'),
  dotted: SVG('<path d="M4.5 12h.01M9.5 12h.01M14.5 12h.01M19.5 12h.01" stroke-width="3"/>'),
}
const FILL_ICONS = {
  none: SVG('<rect x="5" y="5" width="14" height="14" rx="2"/>'),
  semi: SVG('<rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" fill-opacity="0.18"/>'),
  solid: SVG('<rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" fill-opacity="0.45" stroke="none"/><rect x="5" y="5" width="14" height="14" rx="2"/>'),
  pattern: SVG('<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M6 15 15 6M9 18l9-9" stroke-width="1.3"/>'),
}

const TIPS = {
  select: 'Select — V', hand: 'Hand — H', draw: 'Draw — D', highlight: 'Highlight — I',
  eraser: 'Eraser — E', laser: 'Laser — K', line: 'Line — L', arrow: 'Arrow — A',
  geo: 'Shape — G', text: 'Text — T', note: 'Sticky note — N', image: 'Insert image',
  undo: 'Undo — ⌘Z', redo: 'Redo — ⇧⌘Z', menu: 'Board menu', more: 'More tools',
  tools: 'Tools', duplicate: 'Duplicate — ⌘D', delete: 'Delete — ⌫',
}

// dock buttons in visual order (styles/more/menu ride at the end, always)
const DOCK_NAMES = ['select', 'hand', 'draw', 'highlight', 'eraser', 'laser', 'line', 'arrow', 'geo', 'text', 'note', 'image']
// what gives way first as the frame narrows (select and draw never yield)
const DROP_ORDER = ['hand', 'laser', 'line', 'note', 'image', 'highlight', 'text', 'arrow', 'eraser', 'geo']

export function buildUI(editor, { hidden = false, onSave, themeToggle = true, gridControl = true, mediaProviders = [wikimediaCommonsProvider] } = {}) {
  const root = editor.container
  // menu switches the host can drop — an app that owns its own theme chrome
  // doesn't want a second control for it on the canvas
  const opts = { themeToggle: themeToggle !== false, gridControl: gridControl !== false }
  const ui = el('div', 'qd-ui')
  root.appendChild(ui)

  let popover = null // { name, el }
  let canvasPanel = null
  let mediaPanel = null
  const closeMediaPanel = () => { if (mediaPanel) { mediaPanel.controller.abort(); mediaPanel.el.remove(); mediaPanel = null } }
  const closeCanvasPanel = () => { if (canvasPanel) { canvasPanel.dispatchEvent(new Event('qd-close'));canvasPanel.remove();canvasPanel = null } }
  const closePopover = () => {
    if (popover) { popover.el.remove(); popover = null; refresh() }
  }
  const openPopover = (name, build, anchor) => {
    if (popover?.name === name) return closePopover()
    closePopover()
    closeCanvasPanel()
    closeMediaPanel()
    const p = el('div', 'qd-popover')
    build(p)
    ui.appendChild(p)
    popover = { name, el: p }
    // keep it inside the frame, roughly above its anchor
    requestAnimationFrame(() => {
      const ar = anchor.getBoundingClientRect()
      const rr = root.getBoundingClientRect()
      const pw = p.offsetWidth
      let left = ar.left - rr.left + ar.width / 2 - pw / 2
      left = Math.max(8, Math.min(left, rr.width - pw - 8))
      p.style.left = left + 'px'
    })
    refresh()
  }

  const openMediaPanel = () => {
    closePopover(); closeCanvasPanel(); closeMediaPanel()
    const controller = new AbortController()
    const panel = el('div', 'qd-media-gallery')
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', 'Insert image')
    panel.style.cssText = 'position:absolute;z-index:65;pointer-events:auto;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;background:var(--qd-panel,#fff);color:var(--qd-text,#222);border:1px solid #b5bac3;box-shadow:0 8px 28px #0003;padding:12px;box-sizing:border-box;'
    panel.addEventListener('wheel', e => e.stopPropagation(), { passive: true })
    ui.append(panel)
    mediaPanel = { el: panel, controller }
    const position = () => {
      if (mediaPanel?.el !== panel) return
      const w = Math.min(410, Math.max(0, root.clientWidth - 16))
      const h = Math.max(0, root.clientHeight - 16)
      panel.style.width = w + 'px'
      panel.style.maxHeight = h + 'px'
      panel.style.left = Math.max(8, (root.clientWidth - w) / 2) + 'px'
      panel.style.top = Math.max(8, (root.clientHeight - Math.min(panel.scrollHeight, h)) / 2) + 'px'
    }
    const observer = new ResizeObserver(position)
    observer.observe(root)
    controller.signal.addEventListener('abort', () => observer.disconnect(), { once: true })
    const header = el('div')
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px'
    const title = el('strong'); title.textContent = 'Insert image'
    const done = el('button'); done.textContent = 'Done'; done.onclick = closeMediaPanel
    header.append(title, done)
    const form = el('form')
    form.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px'
    const input = el('input'); input.type = 'search'; input.placeholder = 'Search images'; input.setAttribute('aria-label','Search images')
    input.style.cssText = 'flex:1;min-width:120px;padding:7px'
    const select = el('select'); select.setAttribute('aria-label','Image source')
    for (const provider of mediaProviders) {
      const opt = el('option'); opt.value = provider.id; opt.textContent = provider.label; select.append(opt)
    }
    const search = el('button'); search.type = 'submit'; search.textContent = 'Search'
    const upload = el('button'); upload.type = 'button'; upload.textContent = 'Upload file'
    upload.onclick = () => { closeMediaPanel(); editor.pickImage() }
    form.append(input, select, search, upload)
    const status = el('div'); status.setAttribute('role','status'); status.style.cssText = 'font-size:12px;margin:6px 0'
    const results = el('div')
    results.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px'
    let request = null
    form.onsubmit = async e => {
      e.preventDefault()
      const query = input.value.trim()
      if (!query && select.value !== 'skimage') { status.textContent = 'Enter a search term.'; return }
      request?.abort()
      request = new AbortController()
      const signal = request.signal
      const provider = mediaProviders.find(p => p.id === select.value)
      if (!provider) return
      results.replaceChildren(); status.textContent = 'Searching…'
      try {
        const items = await provider.search(query, { signal })
        if (signal.aborted || mediaPanel?.el !== panel) return
        status.textContent = items.length ? items.length + ' images found. Select one to insert.' : 'No images found.'
        for (const item of items) {
          const tile = el('button'); tile.type = 'button'
          tile.style.cssText = 'display:flex;flex-direction:column;gap:4px;min-width:0;padding:5px;cursor:pointer;border:1px solid #a9afb8;background:transparent;color:inherit'
          const img = el('img'); img.src = item.thumbnailUrl; img.alt = item.title || 'Search result'
          img.loading = 'lazy'; img.style.cssText = 'width:100%;height:95px;object-fit:contain'
          const label = el('span'); label.textContent = item.title || 'Untitled image'
          label.style.cssText = 'font-size:11px;overflow-wrap:anywhere'
          const credit = el('span'); credit.textContent = [item.source?.author,item.source?.license].filter(Boolean).join(' · ') || 'Check source licence'
          credit.style.cssText = 'font-size:10px;opacity:.7;overflow-wrap:anywhere'
          tile.append(img,label,credit)
          tile.onclick = async () => {
            tile.disabled = true; status.textContent = 'Importing image…'
            try {
              const blob = await provider.getBlob(item, { signal: controller.signal })
              if (controller.signal.aborted) return
              await editor.insertImageBlob(blob, { source: item.source })
              status.textContent = 'Image inserted.'
              closeMediaPanel()
            } catch (err) {
              if (!controller.signal.aborted) status.textContent = 'Import failed: ' + err.message
              tile.disabled = false
            }
          }
          results.append(tile)
        }
        position()
      } catch (err) {
        if (!signal.aborted) status.textContent = 'Search failed: ' + err.message
      }
    }
    panel.append(header, form, status, results)
    status.textContent = mediaProviders.length ? 'Search an image source or upload a file.' : 'No search providers configured. Upload a file.'
    position()
    input.focus()
    controller.signal.addEventListener('abort', () => request?.abort(), { once:true })
  }

  // ---- actions -------------------------------------------------------------
  const run = (name, b) => {
    if (name === 'image') { closePopover(); return openMediaPanel() }
    if (name === 'geo') return geoTap(b)
    if (name === 'draw' || name === 'highlight' || name === 'line' || name === 'arrow') {
      editor.setTool(name)
      return openPopover('drawing-style', buildDrawingStyles, b)
    }
    closePopover()
    editor.setTool(name)
  }
  // the shape button: every tap arms the current kind AND shows the kinds,
  // so picking a shape never takes a second hunt for the menu
  const geoTap = (b) => {
    editor.setTool('geo')
    openPopover('geo', (p) => {
      p.classList.add('qd-geo-pop')
      for (const g of GEO_IDS) {
        const gb = el('button', 'qd-tool' + (editor.geoKind === g ? ' on' : ''))
        gb.innerHTML = ICONS[g]
        gb.title = g
        gb.addEventListener('click', (ev) => {
          ev.stopPropagation()
          editor.setGeoKind(g)
          editor.setTool('geo')
          closePopover()
        })
        p.appendChild(gb)
      }
    }, b)
  }

  const makeBtn = (name, onClick, cls = 'qd-tool') => {
    const b = el('button', cls)
    b.dataset.name = name
    b.innerHTML = ICONS[name] || ''
    b.title = TIPS[name] || name
    b.addEventListener('pointerdown', (e) => e.stopPropagation())
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(e, b) })
    return b
  }

  // ---- dock ----------------------------------------------------------------
  const dock = el('div', 'qd-dock')
  ui.appendChild(dock)

  const dockBtns = new Map()
  const dividers = []
  const addBtn = (name) => {
    const b = makeBtn(name, (e, b2) => run(name, b2))
    dock.appendChild(b)
    dockBtns.set(name, b)
    return b
  }
  const divider = () => { const d = el('i', 'qd-div'); dock.appendChild(d); dividers.push(d) }

  addBtn('select'); addBtn('hand')
  divider()
  addBtn('draw'); addBtn('highlight'); addBtn('eraser'); addBtn('laser')
  divider()
  addBtn('line'); addBtn('arrow')
  addBtn('geo').classList.add('qd-geo-btn')
  addBtn('text'); addBtn('note'); addBtn('image')
  divider()

  // folded mode: one button wearing the current tool's icon opens the kit
  const toolsBtn = makeBtn('tools', (e, b) => openPopover('tools', (p) => buildGrid(p, [...DOCK_NAMES]), b))
  dock.appendChild(toolsBtn)

  // Colour and drawing-style controls have separate popovers.
  const styleBtn = makeBtn('styles', (e, b) => openPopover('colors', buildColors, b))
  styleBtn.classList.add('qd-style-btn')
  styleBtn.title = 'Colour & swatches'
  const styleDot = el('span', 'qd-style-dot')
  styleBtn.appendChild(styleDot)
  dock.appendChild(styleBtn)

  const moreBtn = makeBtn('more', (e, b) => openPopover('more', (p) => buildGrid(p, hiddenNames), b))
  dock.appendChild(moreBtn)

  const menuBtn = makeBtn('menu', (e, b) => openPopover('menu', buildMenu, b))
  dock.appendChild(menuBtn)

  // ---- action bar ----------------------------------------------------------
  // history + selection actions ride their own small pill so they stay one
  // tap away no matter how far the tool dock folds
  const actionBar = el('div', 'qd-actions')
  ui.appendChild(actionBar)
  const actBtns = new Map()
  const addAction = (name, fn) => {
    const b = makeBtn(name, fn)
    actionBar.appendChild(b)
    actBtns.set(name, b)
    return b
  }
  addAction('undo', () => editor.store.undo())
  addAction('redo', () => editor.store.redo())
  actionBar.appendChild(el('i', 'qd-div'))
  addAction('duplicate', () => editor.duplicateSelection())
  addAction('delete', () => editor.deleteSelection())

  // ---- overflow grid (compact "more" / folded "tools") ---------------------
  function buildGrid(p, names) {
    p.classList.add('qd-grid-pop')
    for (const name of names) {
      const isTool = name !== 'image'
      const b = makeBtn(name, (e, b2) => run(name, b2))
      if (name === 'geo') b.innerHTML = ICONS[editor.geoKind]
      if (isTool && editor.tool === name) b.classList.add('on')
      p.appendChild(b)
    }
  }

  // ---- styles popover ------------------------------------------------------
  const theme = () => THEMES[editor.theme.id]
  function buildColors(p) {
    p.classList.add('qd-style-pop')
    const cur = editor.currentStyles()
    const row = (cls) => el('div', 'qd-row ' + cls)

    const paletteLayout=el('div','qd-palette-layout')
    const paletteLeft=el('div','qd-palette-left')
    const paletteRight=el('div','qd-palette-right')
    paletteLayout.append(paletteLeft,paletteRight)
    p.append(paletteLayout)
    const colors = row('qd-colors')
    paletteLeft.append(colors)
    for (const c of COLOR_IDS) {
      const b = el('button', 'qd-dot' + (cur.color === c ? ' on' : ''))
      b.style.setProperty('--dot', theme().colors[c].stroke)
      b.title = c
      b.addEventListener('click', (e) => { e.stopPropagation(); editor.setStyle('color', c); restyle() })
      colors.appendChild(b)
    }
    const customRow = row('qd-custom-color')
    const picker = document.createElement('input')
    picker.type = 'color'
    picker.title = 'Choose any colour'
    picker.value = /^#[0-9a-f]{6}$/i.test(cur.color || '') ? cur.color : resolveShapeColor(theme(),cur.color || 'blue').stroke
    const applyColor = value => {
      if (!/^#[0-9a-f]{6}$/i.test(value)) return
      picker.value = value
      editor.setStyle('color',value.toLowerCase())
      restyle()
    }
    picker.addEventListener('input',e=>{e.stopPropagation();applyColor(picker.value)})
    customRow.append(picker)
    paletteLeft.append(customRow)
    // Personal palette state. V2 migrates previous collections into a permanent holding tray.
    const owner=editor.container.dataset.qdSwatchOwner||'default'
    const key='quickdraw:palette:v2:'+owner
    const previousKey='quickdraw:swatch-collections:v1:'+owner
    const legacyKey='quickdraw:personal-swatches:v2:'+owner
    const valid=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)
    const clean=xs=>Array.isArray(xs)?[...new Set(xs.filter(valid).map(x=>x.toLowerCase()))].slice(0,48):[]
    const load=()=>{
      try {
        const v=JSON.parse(localStorage.getItem(key)||'null')
        if(v&&Array.isArray(v.collections)&&Array.isArray(v.saved))return {
          saved:clean(v.saved),collections:v.collections.slice(0,20).filter(x=>x&&typeof x.name==='string')
            .map(x=>({id:String(x.id).slice(0,80),name:x.name.slice(0,40),colors:clean(x.colors)}))
        }
      }catch{}
      try {
        const v=JSON.parse(localStorage.getItem(previousKey)||'null')
        if(v&&Array.isArray(v.collections))return {saved:[],collections:v.collections.slice(0,20)
          .filter(x=>x&&typeof x.name==='string').map(x=>({id:String(x.id).slice(0,80),name:x.name.slice(0,40),colors:clean(x.colors)}))}
      }catch{}
      let saved=[]
      try{saved=clean(JSON.parse(localStorage.getItem(legacyKey)||'[]'))}catch{}
      return {saved,collections:[]}
    }
    const state=load()
    const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
    const selectedHex=()=>resolveShapeColor(theme(),editor.currentStyles().color||'blue').stroke.toLowerCase()
    const icon=(name,title,fn)=>{
      const b=el('button','qd-opt qd-palette-action')
      const extras={
        save:SVG('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>'),
        upload:SVG('<path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4"/>'),
        'share-2':SVG('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4"/>'),
        settings:SVG('<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="12" r="2"/>'),
        'arrow-up':SVG('<path d="m6 14 6-6 6 6"/>'),
        'arrow-down':SVG('<path d="m6 10 6 6 6-6"/>'),
        pencil:ICONS.draw,
        'clear-all':SVG('<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13M10 11v6m4-6v6"/>'),
        'trash-2':ICONS.trash
      }
      b.innerHTML=ICONS[name]||extras[name]||name
      b.title=title;b.setAttribute('aria-label',title)
      b.addEventListener('click',e=>{e.stopPropagation();fn()})
      return b
    }
    const saveColor=(target,value)=>{
      value=value.toLowerCase()
      if(valid(value)&&!target.includes(value)&&target.length<48){target.push(value);persist();render()}
    }
    const editSwatch=(target,value,container)=>{
      container.querySelector('.qd-palette-swatch-editor')?.remove()
      const editorRow=el('div','qd-palette-swatch-editor')
      const input=document.createElement('input')
      input.type='color';input.value=value
      input.title='Choose replacement colour'
      const done=icon('save','Save changed colour',()=>{
        const replacement=input.value.toLowerCase()
        const index=target.indexOf(value)
        if(index>=0){
          if(!target.includes(replacement)||replacement===value)target[index]=replacement
          else target.splice(index,1)
          persist();render()
        }
      })
      const remove=icon('trash-2','Delete this colour',()=>{
        const index=target.indexOf(value)
        if(index>=0){target.splice(index,1);persist();render()}
      })
      const cancel=icon('x','Cancel editing',()=>editorRow.remove())
      cancel.textContent='×'
      editorRow.append(input,done,remove,cancel)
      container.append(editorRow)
      input.focus()
    }
    const swatch=(value,container,onEdit)=>{
      const b=el('button','qd-dot'+(selectedHex()===value?' on':''))
      b.style.setProperty('--dot',value)
      b.title=value+' — click to apply, double-click to edit'
      b.setAttribute('aria-label','Apply '+value)
      b.draggable=true
      b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',value);e.dataTransfer.effectAllowed='copy'})
      b.addEventListener('click',e=>{
        e.stopPropagation()
        // Do not rebuild the swatch DOM here: doing so destroys the button
        // between the first and second click, preventing dblclick from firing.
        picker.value=value
        editor.setStyle('color',value)
        p.querySelectorAll('.qd-dot').forEach(dot=>dot.classList.toggle('on',dot.style.getPropertyValue('--dot').toLowerCase()===value))
        refresh()
      })
      b.addEventListener('dblclick',e=>{e.stopPropagation();onEdit?.(value)})
      container.append(b)
      return b
    }
    const acceptDrop=(element,fn)=>{
      element.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('text/plain'))e.preventDefault()})
      element.addEventListener('drop',e=>{e.preventDefault();const value=e.dataTransfer.getData('text/plain');if(valid(value))fn(value)})
    }
    const heading=(label,parent=paletteLeft)=>{
      const h=el('div','qd-palette-heading');h.textContent=label;parent.append(h);return h
    }
    heading('SAVED')
    const savedRow=row('qd-colors')
    paletteLeft.append(savedRow)
    const savedActions=row('qd-palette-actions')
    const savedHeading=paletteLeft.querySelector('.qd-palette-heading')
    const savedHeader=el('div','qd-palette-saved-header')
    savedHeading.replaceWith(savedHeader)
    savedHeader.append(savedHeading,savedActions)
    savedActions.append(
      icon('save','Save selected colour',()=>saveColor(state.saved,selectedHex())),
      icon('copy','Create collection from saved colours',()=>createCollection(true)),
      icon('download','Import JSON file',()=>importFile.click()),
      icon('upload','Export saved colours as JSON file',()=>downloadJSON({format:'quickdraw-swatches-v1',name:'Saved colours',colors:state.saved},'quickdraw-saved.json')),
      icon('clear-all','Clear all saved colours',()=>{
        if(state.saved.length && confirm('Clear all saved colours? Collections will not be changed.')){
          state.saved=[];persist();render()
        }
      })
    )
    const importFile=document.createElement('input')
    importFile.type='file';importFile.accept='.json,application/json';importFile.hidden=true;p.append(importFile)
    importFile.addEventListener('change',async()=>{
      const file=importFile.files?.[0];if(!file)return
      try{
        const v=JSON.parse(await file.text())
        if(v.format!=='quickdraw-swatches-v1'||!Array.isArray(v.colors))throw Error()
        if(state.collections.length>=20)throw Error()
        state.collections.push({id:'import-'+Date.now(),name:String(v.name||'Imported').slice(0,40),colors:clean(v.colors)})
        persist();render()
      }catch{alert('Unable to import this swatch file.')}
      importFile.value=''
    })
    function downloadJSON(data,name){
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
      const url=URL.createObjectURL(blob),a=document.createElement('a')
      a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
    }
    function createCollection(copySaved=false){
      if(state.collections.length>=20)return
      const number=state.collections.length+1
      state.collections.push({id:'collection-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
        name:'Collection #'+number,colors:copySaved?[...state.saved]:[]})
      persist();render()
    }
    const collectionsHeader=heading('COLLECTIONS',paletteRight)
    const collectionActions=row('qd-palette-actions')
    const collectionsHead=el('div','qd-palette-saved-header')
    collectionsHeader.replaceWith(collectionsHead)
    collectionsHead.append(collectionsHeader,collectionActions)
    const columns=el('div','qd-palette-collections')
    paletteRight.append(columns)
    collectionActions.append(icon('copy','New empty collection',()=>createCollection()),icon('settings','Collection gallery',()=>{gallery.hidden=!gallery.hidden}))
    const gallery=el('div','qd-palette-gallery');gallery.hidden=true;paletteRight.append(gallery)
    function render(){
      savedRow.replaceChildren()
      for(const value of state.saved)swatch(value,savedRow,v=>editSwatch(state.saved,v,paletteLeft))
      columns.replaceChildren();gallery.replaceChildren()
      for(const [index,collection] of state.collections.entries()){
        const section=el('div','qd-palette-collection')
        const head=el('div','qd-palette-collection-head')
        const name=el('button','qd-palette-name')
        name.textContent=collection.name
        name.title='Double-click to rename'
        const editName=()=>{
          const input=document.createElement('input')
          input.type='text';input.className='qd-palette-inline-name'
          input.maxLength=40;input.value=collection.name
          name.replaceWith(input);input.focus();input.select()
          let finished=false
          const finish=save=>{
            if(finished)return
            finished=true
            if(save && input.value.trim()){
              collection.name=input.value.trim().slice(0,40)
              persist()
            }
            render()
          }
          input.addEventListener('keydown',e=>{
            e.stopPropagation()
            if(e.key==='Enter')finish(true)
            if(e.key==='Escape')finish(false)
          })
          input.addEventListener('blur',()=>finish(true))
        }
        name.addEventListener('dblclick',editName)
        head.append(name)
        head.append(icon('share-2','Export this collection',()=>downloadJSON({format:'quickdraw-swatches-v1',name:collection.name,colors:collection.colors},'quickdraw-'+collection.id+'.json')))
        section.append(head)
        const dots=el('div','qd-colors')
        for(const value of collection.colors)swatch(value,dots,v=>editSwatch(collection.colors,v,section))
        acceptDrop(dots,value=>saveColor(collection.colors,value))
        section.append(dots);columns.append(section)
        const manage=el('div','qd-palette-gallery-row')
        const title=el('span');title.textContent=collection.name;manage.append(title)
        manage.append(icon('arrow-up','Move collection up',()=>moveCollection(index,-1)))
        manage.append(icon('arrow-down','Move collection down',()=>moveCollection(index,1)))
        manage.append(icon('pencil','Rename collection',()=>{
          gallery.hidden=true
          editName()
        }))
        manage.append(icon('trash-2','Delete collection',()=>{
          if(confirm('Delete '+collection.name+'?')){state.collections.splice(index,1);persist();render()}
        }))
        manage.draggable=true
        manage.addEventListener('dragstart',e=>e.dataTransfer.setData('application/x-quickdraw-collection',String(index)))
        manage.addEventListener('dragover',e=>e.preventDefault())
        manage.addEventListener('drop',e=>{
          e.preventDefault();const from=Number(e.dataTransfer.getData('application/x-quickdraw-collection'))
          if(Number.isInteger(from)&&from>=0&&from<state.collections.length&&from!==index){
            const [item]=state.collections.splice(from,1);state.collections.splice(index,0,item);persist();render()
          }
        })
        gallery.append(manage)
      }
    }
    function moveCollection(index,dir){
      const next=index+dir
      if(next<0||next>=state.collections.length)return
      ;[state.collections[index],state.collections[next]]=[state.collections[next],state.collections[index]]
      persist();render()
    }
    render()
    function restyle() {
      const color = editor.currentStyles().color
      colors.querySelectorAll('.qd-dot').forEach((b,i)=>b.classList.toggle('on',COLOR_IDS[i] === color))
      render()
      refresh()
    }
  }

  function buildDrawingStyles(p) {
    p.classList.add('qd-style-pop')
    const cur = editor.currentStyles()
    const row = cls => { const r = el('div', 'qd-row ' + cls); p.appendChild(r); return r }
    const sizes = row('qd-sizes')
    SIZE_IDS.forEach((s, i) => {
      const b = el('button', 'qd-opt' + (cur.size === s ? ' on' : ''))
      b.title = 'Size ' + s.toUpperCase()
      b.innerHTML = `<span class="qd-size-pip" style="--pip:${4 + i * 3}px"></span>`
      b.addEventListener('click', (e) => { e.stopPropagation(); editor.setStyle('size', s); restyle() })
      sizes.appendChild(b)
    })
    const dashes = row('qd-dashes')
    for (const d of DASH_IDS) {
      const b = el('button', 'qd-opt' + (cur.dash === d ? ' on' : ''))
      b.title = d === 'draw' ? 'hand-drawn' : d
      b.innerHTML = DASH_ICONS[d]
      b.addEventListener('click', (e) => { e.stopPropagation(); editor.setStyle('dash', d); restyle() })
      dashes.appendChild(b)
    }
    const fills = row('qd-fills')
    for (const f of FILL_IDS) {
      const b = el('button', 'qd-opt' + (cur.fill === f ? ' on' : ''))
      b.title = 'fill: ' + f
      b.innerHTML = FILL_ICONS[f]
      b.addEventListener('click', (e) => { e.stopPropagation(); editor.setStyle('fill', f); restyle() })
      fills.appendChild(b)
    }
    function restyle() {
      const current = editor.currentStyles()
      for (const [container, values, key] of [
        [sizes, SIZE_IDS, 'size'],
        [dashes, DASH_IDS, 'dash'],
        [fills, FILL_IDS, 'fill'],
      ]) {
        container.querySelectorAll('.qd-opt').forEach((button, index) => {
          const selected = values[index] === current[key]
          button.classList.toggle('on', selected)
          button.setAttribute('aria-pressed', String(selected))
        })
      }
      refresh()
    }
  }

  // ---- menu ----------------------------------------------------------------
  function buildMenu(p) {
    p.classList.add('qd-menu-pop')
    const item = (icon, label, key, fn) => {
      const b = el('button', 'qd-menu-item')
      b.innerHTML = `<span class="qd-mi-ico">${ICONS[icon] || ''}</span><span class="qd-mi-label"></span>`
      b.querySelector('.qd-mi-label').textContent = label
      if (key) {
        const k = el('span', 'qd-mi-key')
        k.textContent = key
        b.appendChild(k)
      }
      b.addEventListener('click', async (e) => {
        e.stopPropagation()
        closePopover()
        try { await fn() } catch (err) { console.warn('board menu action failed', err) }
      })
      p.appendChild(b)
      return b
    }
    // a labelled row of mutually exclusive icon buttons
    const segment = (label, ids, { icons, tips, current, onPick }) => {
      const row = el('div', 'qd-menu-row')
      const cap = el('span', 'qd-mi-label')
      cap.textContent = label
      row.appendChild(cap)
      const seg = el('div', 'qd-seg')
      for (const id of ids) {
        const b = el('button', 'qd-seg-btn' + (current === id ? ' on' : ''))
        b.innerHTML = icons[id]
        b.title = tips[id]
        b.setAttribute('aria-label', tips[id])
        b.addEventListener('click', (e) => {
          e.stopPropagation()
          onPick(id)
          seg.querySelectorAll('.qd-seg-btn').forEach((x, i) => x.classList.toggle('on', ids[i] === id))
        })
        seg.appendChild(b)
      }
      row.appendChild(seg)
      p.appendChild(row)
      return row
    }

    const hasSel = editor.selection.size > 0
    item('download', 'Export as PNG', null, () => saveImage(true, null))
    item('transparent', 'Export — transparent', null, () => saveImage(false, null))
    if (hasSel) item('image', 'Export selection', null, () => saveImage(true, new Set(editor.selection)))
    item('copy', hasSel ? 'Copy selection as image' : 'Copy as image', null, async () => {
      const blob = await editor.exportImage({ background: true, ids: hasSel ? new Set(editor.selection) : null })
      if (blob) await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    })
    p.appendChild(el('i', 'qd-menu-div'))
    if (hasSel) item('trash', 'Delete selection', '⌫', () => editor.deleteSelection())
    item('fit', 'Zoom to fit', '⇧1', () => editor.fitContent({ animate: 220 }))
    item('trash', 'Clear board', '⇧⌘⌫', () => editor.clearBoard())

    if (opts.gridControl || opts.themeToggle) p.appendChild(el('i', 'qd-menu-div'))
    if (opts.gridControl) {
      const ID='quickdraw:board-settings:regions'
      const layouts={single:'Single',vertical:'Vertical',horizontal:'Horizontal',quadrants:'Quadrants',
        'top-split':'Top split','bottom-split':'Bottom split','left-focus':'Left focus','right-focus':'Right focus'}
      const counts={vertical:2,horizontal:2,quadrants:4,'top-split':3,'bottom-split':3,'left-focus':3,'right-focus':3}
      const patterns={solid:'None',graph:'Lines',paper:'Ruled',dots:'Dots',crosses:'Crosses',iso:'Isometric',dark:'Dark',custom:'Colour'}
      const saved=editor.store.get(ID)
      const state={id:ID,typeName:'board-settings',enabled:false,layout:'quadrants',backgrounds:[],
        grid:editor.grid,boundaries:false,...(saved?.typeName==='board-settings'?saved:{})}
      const css='font:inherit;cursor:pointer;border:1px solid #a9afb8;background:transparent;color:inherit;border-radius:3px;'
      const cell=(parent,label,svg,selected,fn)=>{
        const button=document.createElement('button');button.type='button'
        button.style.cssText=css+'padding:5px;display:flex;flex-direction:column;gap:5px;align-items:center;min-width:0;'
        if(selected){button.style.outline='2px solid #6674cf';button.style.outlineOffset='-2px';button.setAttribute('aria-pressed','true')}
        button.innerHTML=svg
        const caption=document.createElement('span');caption.textContent=label;caption.style.fontSize='11px'
        button.append(caption);button.title=label
        button.onclick=e=>{e.stopPropagation();fn()}
        parent.append(button);return button
      }
      const layoutSvg=id=>{
        const paths={single:'',vertical:'M50 0V100',horizontal:'M0 50H100',
          quadrants:'M50 0V100 M0 50H100','top-split':'M0 50H100 M50 0V50',
          'bottom-split':'M0 50H100 M50 50V100','left-focus':'M50 0V100 M50 50H100',
          'right-focus':'M50 0V100 M0 50H50'}
        // Positions correspond to regionAt() in regions.js, not visual reading order.
        const labels={single:[[50,50,1]],vertical:[[25,50,1],[75,50,2]],
          horizontal:[[50,25,1],[50,75,2]],
          quadrants:[[25,25,1],[75,25,2],[25,75,3],[75,75,4]],
          'top-split':[[25,25,1],[75,25,2],[50,75,3]],
          'bottom-split':[[50,25,1],[25,75,2],[75,75,3]],
          'left-focus':[[25,50,1],[75,25,2],[75,75,3]],
          'right-focus':[[25,25,1],[25,75,2],[75,50,3]]}
        const nums=labels[id].map(([x,y,n])=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-size="16" fill="currentColor">'+n+'</text>').join('')
        return '<svg viewBox="0 0 100 100" width="65" height="65" aria-hidden="true"><rect x="2" y="2" width="96" height="96" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="'+paths[id]+'" fill="none" stroke="currentColor" stroke-width="1.8"/>'+nums+'</svg>'
      }
      const patternSvg=id=>{
        const ink='#8995a5'
        let content=''
        if(id==='graph')content='<path d="M12 0V48 M24 0V48 M36 0V48 M48 0V48 M0 12H64 M0 24H64 M0 36H64" />'
        if(id==='paper')content='<path d="M0 10H64 M0 20H64 M0 30H64 M0 40H64"/>'
        if(id==='dots'||id==='crosses')for(let x=8;x<64;x+=12)for(let y=8;y<48;y+=12)
          content+=id==='dots'?'<circle cx="'+x+'" cy="'+y+'" r="1.3" fill="'+ink+'" stroke="none"/>':
            '<path d="M'+(x-2)+' '+y+'h4 M'+x+' '+(y-2)+'v4"/>'
        if(id==='iso')for(let x=-70;x<100;x+=22)content+='<path d="M'+x+' 0l80 48 M'+x+' 48l80 -48"/>'
        const fill=id==='dark'?'#242933':id==='custom'?'#d7e8f4':'#f9fafb'
        return '<svg viewBox="0 0 64 48" width="64" height="48" aria-hidden="true"><rect width="64" height="48" fill="'+fill+'"/><g stroke="'+ink+'" stroke-width=".7" fill="none">'+content+'</g></svg>'
      }
      const save=patch=>{
        Object.assign(state,patch)
        editor.store.put({...state,backgrounds:state.backgrounds.map(x=>({...x}))})
      }
      const trigger=el('button','qd-menu-item')
      trigger.innerHTML='<span class="qd-mi-ico">'+(GRID_ICONS[editor.grid]||'')+'</span><span class="qd-mi-label">Canvas settings</span><span class="qd-mi-chev">'+ICONS.chevronRight+'</span>'
      p.append(trigger)
      trigger.onclick=e=>{
        e.stopPropagation()
        closePopover()
        closeCanvasPanel()
        const gallery=el('div','qd-canvas-gallery')
        gallery.setAttribute('role','dialog')
        gallery.setAttribute('aria-label','Canvas settings')
        gallery.style.cssText='position:absolute;z-index:60;pointer-events:auto;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;background:var(--qd-panel,#fff);color:var(--qd-text,#222);border:1px solid #b5bac3;box-shadow:0 8px 28px #0003;padding:12px;box-sizing:border-box;'
        ui.append(gallery)
        // Wheel input must scroll this panel, never zoom or pan the board beneath.
        gallery.addEventListener('wheel',e=>e.stopPropagation(),{passive:true})
        canvasPanel=gallery
        const positionGallery=()=>{
          if(canvasPanel!==gallery)return
          const width=root.clientWidth,height=root.clientHeight
          const inset=8
          const w=Math.min(350,Math.max(0,width-inset*2))
          const h=Math.max(0,height-inset*2)
          gallery.style.width=w+'px'
          gallery.style.maxHeight=h+'px'
          gallery.style.left=Math.max(inset,(width-w)/2)+'px'
          gallery.style.top=Math.max(inset,(height-Math.min(gallery.scrollHeight,h))/2)+'px'
          gallery.style.bottom='auto'
        }
        requestAnimationFrame(positionGallery)
        const panelResize=new ResizeObserver(positionGallery)
        panelResize.observe(root)
        // Observer is tied to this gallery and disconnected on closure.
        gallery.addEventListener('qd-close',()=>panelResize.disconnect(),{once:true})
        let selectedRegion=0
        const heading=(title)=>{
          const h=document.createElement('div');h.textContent=title;h.style.cssText='font-size:13px;font-weight:600;margin:8px 0';gallery.append(h)
        }
        const tiles=(cols)=>{
          const g=document.createElement('div');g.style.cssText='display:grid;grid-template-columns:repeat('+cols+',minmax(0,1fr));gap:7px;'
          gallery.append(g);return g
        }
        const draw=()=>{
          const scrollPosition=gallery.scrollTop
          gallery.replaceChildren()
          const top=document.createElement('div');top.style.cssText='display:flex;align-items:center;justify-content:space-between;'
          const title=document.createElement('strong');title.textContent='Canvas settings'
          const done=document.createElement('button');done.textContent='Done';done.style.cssText=css+'padding:5px 10px'
          done.onclick=e=>{e.stopPropagation();closeCanvasPanel()}
          top.append(title,done);gallery.append(top)
          heading('Layout')
          const lg=tiles(root.clientWidth<400?2:4)
          for(const [id,label] of Object.entries(layouts))cell(lg,label,layoutSvg(id),id==='single'?!state.enabled:state.enabled&&state.layout===id,()=>{
            if(id==='single')save({enabled:false})
            else save({enabled:true,layout:id,backgrounds:Array.from({length:counts[id]},(_,i)=>state.backgrounds[i]||{type:'solid'})})
            selectedRegion=0;draw()
          })
          heading(state.enabled?'Select a region':'Background')
          if(state.enabled){
            const count=counts[state.layout]||4
            const preview=document.createElement('div')
            preview.style.cssText='display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin-bottom:8px'
            // Regions are selected by their numbered preview tiles, preserving geometry in the layout thumbnail above.
            for(let i=0;i<count;i++){
              const bg=state.backgrounds[i]||{type:'solid'}
              cell(preview,'Region '+(i+1),patternSvg(bg.type),selectedRegion===i,()=>{selectedRegion=i;draw()})
            }
            gallery.append(preview)
          }
          const bg=state.enabled?(state.backgrounds[selectedRegion]||{type:'solid'}):{type:({none:'solid',lines:'graph',ruled:'paper',dots:'dots',crosses:'crosses',iso:'iso'})[state.grid]||'solid'}
          const pg=tiles(root.clientWidth<400?2:4)
          const available=state.enabled?Object.entries(patterns):Object.entries(patterns).filter(([id])=>!['dark','custom'].includes(id))
          for(const [id,label] of available)cell(pg,label,patternSvg(id),bg.type===id,()=>{
            if(state.enabled){
              const next=Array.from({length:counts[state.layout]},(_,i)=>state.backgrounds[i]||{type:'solid'})
              next[selectedRegion]=id==='custom'?{type:'custom',color:bg.color||'#d7e8f4'}:{type:id}
              save({backgrounds:next})
            }else{
              const grid={solid:'none',graph:'lines',paper:'ruled',dots:'dots',crosses:'crosses',iso:'iso'}[id]
              if(grid){save({grid});editor.setGrid(grid)}
            }
            draw()
          })
          if(state.enabled&&bg.type==='custom'){
            const picker=document.createElement('input');picker.type='color';picker.value=bg.color||'#d7e8f4'
            picker.title='Custom background colour'
            picker.oninput=()=>{
              const next=state.backgrounds.map(x=>({...x}));next[selectedRegion]={type:'custom',color:picker.value}
              save({backgrounds:next})
            };gallery.append(picker)
          }
          const foot=document.createElement('div');foot.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:8px'
          const boundary=document.createElement('label');boundary.textContent=' Show boundaries'
          const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!!state.boundaries
          checkbox.onchange=()=>save({boundaries:checkbox.checked})
          boundary.prepend(checkbox)
          const reset=document.createElement('button');reset.textContent='Reset';reset.style.cssText=css+'padding:5px 10px'
          reset.onclick=()=>{save({enabled:false,layout:'quadrants',backgrounds:[],grid:'lines',boundaries:false});draw()}
          foot.append(boundary,reset);gallery.append(foot)
          gallery.scrollTop=scrollPosition
        }
        draw()
      }
    }
    if (opts.themeToggle) {
      segment('Theme', ['light', 'dark'], {
        icons: { light: ICONS.sun, dark: ICONS.moon },
        tips: { light: 'Light theme', dark: 'Dark theme' },
        current: editor.theme.id,
        onPick: (id) => editor.setTheme(id),
      })
    }
  }
  async function saveImage(background, ids) {
    const blob = await editor.exportImage({ background, ids })
    if (!blob) return
    if (onSave) return onSave(blob, background)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'quickdraw-' + new Date().toISOString().slice(0, 19).replaceAll(':', '.') + '.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 5000)
  }
  // ---- keyboard help overlay (press ?) -----------------------------------
  const SHORTCUTS = [
    { label: 'Tools', rows: [
      ['Select', 'V / 1'], ['Hand (hold Space)', 'H'], ['Draw', 'D / P / B'],
      ['Highlight', 'I'], ['Eraser', 'E'], ['Laser', 'K'],
      ['Arrow', 'A'], ['Line', 'L'], ['Shape', 'G'],
      ['Rectangle', 'R'], ['Ellipse', 'O'], ['Text', 'T'], ['Sticky note', 'N'],
    ]},
    { label: 'Edit', rows: [
      ['Undo', '⌘Z'], ['Redo', '⇧⌘Z'], ['Select all', '⌘A'],
      ['Copy', '⌘C'], ['Cut', '⌘X'], ['Paste', '⌘V'], ['Duplicate', '⌘D'],
    ]},
    { label: 'Arrange', rows: [
      ['Bring to front', ']'], ['Send to back', '['], ['Nudge', 'Arrows (Shift = 8px)'],
    ]},
    { label: 'View', rows: [
      ['Zoom to fit', '⇧1'], ['Reset zoom', '⇧0'], ['Zoom in / out', '⌘+ / ⌘−'],
    ]},
    { label: 'Board', rows: [
      ['Delete selection', '⌫'], ['Clear board', '⇧⌘⌫'],
      ['Edit / finish text', 'Enter'], ['Cancel / deselect', 'Esc'],
    ]},
    { label: 'Help', rows: [['Keyboard shortcuts', '?']] },
  ]
  const buildHelp = () => {
    const backdrop = el('div', 'qd-help-backdrop')
    const panel = el('div', 'qd-help-panel')
    const head = el('div', 'qd-help-head')
    const title = el('div', 'qd-help-title'); title.textContent = 'Keyboard shortcuts'
    const close = el('button', 'qd-help-close')
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    close.setAttribute('aria-label', 'Close')
    head.appendChild(title); head.appendChild(close)
    panel.appendChild(head)
    for (const g of SHORTCUTS) {
      const sec = el('div', 'qd-help-group')
      const gl = el('div', 'qd-help-glabel'); gl.textContent = g.label
      sec.appendChild(gl)
      for (const [name, keys] of g.rows) {
        const row = el('div', 'qd-help-row')
        const nm = el('span', 'qd-help-name'); nm.textContent = name
        const kc = el('span', 'qd-help-keys'); kc.textContent = keys
        row.appendChild(nm); row.appendChild(kc)
        sec.appendChild(row)
      }
      panel.appendChild(sec)
    }
    backdrop.appendChild(panel)
    backdrop.addEventListener('pointerdown', (e) => { if (e.target === backdrop) closeHelp() })
    close.addEventListener('click', () => closeHelp())
    return backdrop
  }
  let helpEl = null
  const closeHelp = () => {
    if (!helpEl) return
    helpEl.remove(); helpEl = null
    document.removeEventListener('keydown', onHelpKey, true)
  }
  const onHelpKey = (e) => {
    if (e.key === 'Escape' || e.key === '?') { e.preventDefault(); e.stopPropagation(); closeHelp() }
  }
  const toggleHelp = () => {
    if (helpEl) { closeHelp(); return }
    helpEl = buildHelp()
    ui.appendChild(helpEl)
    document.addEventListener('keydown', onHelpKey, true)
    refresh()
  }
  editor.on('help', toggleHelp)

  // ---- responsive fit ------------------------------------------------------
  // Instead of scaling down, the dock sheds tools into the "more" flyout as
  // its frame narrows; below ~5 buttons of room it folds into a single
  // tools button. Fixed metrics keep the math cheap and honest.
  const BTN = 34 // 32px button + 2px gap
  const PAD = 16 // dock padding + border
  let hiddenNames = []
  let mode = null
  const fit = () => {
    const avail = (root.clientWidth || 600) - 16
    const fullW = PAD + (DOCK_NAMES.length + 2) * BTN + dividers.length * 7
    const slots = Math.floor((avail - PAD) / BTN)
    let m, hid
    if (avail >= fullW) {
      m = 'full'
      hid = []
    } else if (slots < 5) {
      m = 'mini'
      hid = [...DOCK_NAMES]
    } else {
      m = 'compact'
      // styles/more/menu take 3 slots; select and draw are pinned; the rest
      // of the room goes to the tools that yield last
      const extra = Math.max(0, slots - 5)
      const keep = new Set(['select', 'draw'])
      for (let i = DROP_ORDER.length - 1, n = extra; i >= 0 && n > 0; i--, n--) keep.add(DROP_ORDER[i])
      hid = DOCK_NAMES.filter((n) => !keep.has(n))
    }
    const changed = m !== mode || hid.join() !== hiddenNames.join()
    mode = m
    hiddenNames = hid
    if (!changed) return
    const hideSet = new Set(hid)
    for (const [n, b] of dockBtns) b.style.display = hideSet.has(n) ? 'none' : ''
    for (const d of dividers) d.style.display = m === 'full' ? '' : 'none'
    toolsBtn.style.display = m === 'mini' ? '' : 'none'
    moreBtn.style.display = m === 'compact' ? '' : 'none'
    dock.classList.toggle('qd-compact', m !== 'full')
    if (popover && ['more', 'tools', 'geo'].includes(popover.name)) closePopover()
    refresh()
  }
  const ro = new ResizeObserver(fit)
  ro.observe(root)
  fit()

  // ---- state sync ----------------------------------------------------------
  function refresh() {
    for (const n of DOCK_NAMES) {
      const b = dockBtns.get(n)
      if (n === 'image') continue
      b.classList.toggle('on', editor.tool === n)
    }
    const geoBtn = dockBtns.get('geo')
    geoBtn.innerHTML = ICONS[editor.geoKind]
    actBtns.get('undo').disabled = !editor.store.canUndo
    actBtns.get('redo').disabled = !editor.store.canRedo
    const hasSel = editor.selection.size > 0
    actBtns.get('duplicate').disabled = !hasSel
    actBtns.get('delete').disabled = !hasSel
    // the folded button wears the active tool so the state stays visible
    toolsBtn.innerHTML = ICONS[editor.tool === 'geo' ? editor.geoKind : editor.tool] || ICONS.select
    toolsBtn.classList.toggle('on', popover?.name === 'tools')
    styleDot.style.background = resolveShapeColor(editor.theme,editor.currentStyles().color || 'blue').stroke
    menuBtn.classList.toggle('on', popover?.name === 'menu')
    styleBtn.classList.toggle('on', popover?.name === 'styles')
    moreBtn.classList.toggle('on', popover?.name === 'more')
  }
  const offs = [
    editor.on('tool', refresh),
    editor.on('styles', refresh),
    editor.on('history', refresh),
    editor.on('selection', refresh),
    editor.on('theme', refresh),
    editor.on('grid', refresh),
  ]

  // popovers close when the pointer goes to the canvas
  const closeOnCanvas = (e) => { if (!ui.contains(e.target)) closePopover() }
  root.addEventListener('pointerdown', closeOnCanvas, { capture: true })

  const setHidden = (h) => ui.classList.toggle('qd-hidden', !!h)
  setHidden(hidden)
  refresh()

  return {
    setHidden,
    // live toggles for the menu switches; an open menu is rebuilt on next open
    setOptions(next = {}) {
      if ('themeToggle' in next) opts.themeToggle = next.themeToggle !== false
      if ('gridControl' in next) opts.gridControl = next.gridControl !== false
      if (popover?.name === 'menu') closePopover()
    },
    destroy() {
      offs.forEach((f) => f())
      ro.disconnect()
      root.removeEventListener('pointerdown', closeOnCanvas, { capture: true })
      closeHelp()
      closeCanvasPanel()
      closeMediaPanel()
      ui.remove()
    },
  }
}

const el = (tag, cls) => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  return e
}
