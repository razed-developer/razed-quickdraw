// Context menu deliberately exposes only actions that Quickdraw implements.
// Host applications may add entries later without forking the editor.
export function mountContextMenu(editor, { enabled = true } = {}) {
  if (!enabled) return { destroy() {} }
  const root = editor.container
  const menu = document.createElement('div')
  menu.className = 'qd-context-menu'
  menu.setAttribute('role', 'menu')
  menu.tabIndex = -1
  menu.style.cssText = 'position:absolute;z-index:60;min-width:180px;max-width:260px;padding:5px;background:var(--qd-pop-bg,#fff);color:var(--qd-ink-strong,#222);border:1px solid var(--qd-border,#ddd);box-shadow:var(--qd-pop-shadow,0 8px 28px #0003);font:13px system-ui,sans-serif;display:none'
  root.append(menu)
  let visible = false
  let submenu = null
  let submenuTrigger = null
  const closeSubmenu = () => { submenu?.remove(); submenu = null; submenuTrigger = null }
  const close = () => { closeSubmenu(); menu.style.display = 'none'; visible = false }
  const add = (label, action, shortcut = '') => {
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('role', 'menuitem')
    button.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:22px;width:100%;padding:8px 10px;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;font:inherit'
    const name = document.createElement('span')
    name.textContent = label
    button.append(name)
    if (shortcut) {
      const hint = document.createElement('span')
      hint.textContent = shortcut
      hint.style.opacity = '.55'
      button.append(hint)
    }
    button.addEventListener('pointerenter', () => { button.style.background = 'var(--qd-hover, #eee)' })
    button.addEventListener('pointerleave', () => { button.style.background = 'transparent' })
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      close()
      action()
    })
    menu.append(button)
  }
  const addSubmenu = (label, actions) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('role', 'menuitem')
    button.setAttribute('aria-haspopup', 'menu')
    button.setAttribute('aria-expanded', 'false')
    button.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:22px;width:100%;padding:8px 10px;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;font:inherit'
    button.textContent = label
    const arrow = document.createElement('span')
    arrow.textContent = '›'
    button.append(arrow)
    const show = () => {
      if (submenuTrigger === button) return
      closeSubmenu()
      submenuTrigger = button
      button.setAttribute('aria-expanded', 'true')
      submenu = document.createElement('div')
      submenu.className = 'qd-context-submenu'
      submenu.setAttribute('role', 'menu')
      submenu.style.cssText = menu.style.cssText.replace('display:none', 'display:block')
      submenu.style.position = 'absolute'
      submenu.style.zIndex = '61'
      submenu.style.visibility = 'hidden'
      root.append(submenu)
      for (const [name, action] of actions) {
        const item = document.createElement('button')
        item.type = 'button'
        item.setAttribute('role', 'menuitem')
        item.textContent = name
        item.style.cssText = 'display:block;width:100%;padding:8px 10px;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;font:inherit'
        item.addEventListener('pointerenter', () => { item.style.background = 'var(--qd-hover,#eee)' })
        item.addEventListener('pointerleave', () => { item.style.background = 'transparent' })
        item.addEventListener('click', e => { e.stopPropagation(); close(); action() })
        submenu.append(item)
      }
      const a = button.getBoundingClientRect(), b = root.getBoundingClientRect()
      const left = a.right - b.left + submenu.offsetWidth <= root.clientWidth
        ? a.right - b.left : a.left - b.left - submenu.offsetWidth
      submenu.style.left = Math.max(0, left) + 'px'
      submenu.style.top = Math.max(0, Math.min(a.top - b.top, root.clientHeight - submenu.offsetHeight)) + 'px'
      submenu.style.visibility = ''
    }
    button.addEventListener('pointerenter', show)
    button.addEventListener('click', e => { e.stopPropagation(); show(); submenu.querySelector('button')?.focus() })
    menu.append(button)
  }
  const divider = () => {
    const line = document.createElement('div')
    line.setAttribute('role', 'separator')
    line.style.cssText = 'height:1px;background:var(--qd-border,#ddd);margin:5px 0'
    menu.append(line)
  }
  const open = (event) => {
    if (event.target.closest?.('.qd-ui, .qd-context-menu, .qd-watermark')) return
    event.preventDefault()
    event.stopPropagation()
    const bounds = root.getBoundingClientRect()
    const screen = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    const page = editor.screenToPage(screen.x, screen.y)
    const hit = editor.hitTest(page.x, page.y)
    if (hit && !editor.selection.has(hit.id)) editor.setSelection([hit.id])
    if (!hit) editor.setSelection([])
    closeSubmenu()
    menu.replaceChildren()
    const hasSelection = editor.selection.size > 0
    if (hasSelection) {
      if (!editor.readonly) {
        addSubmenu('Reorder', [
          ['Bring to front', () => editor.bringToFront()],
          ['Bring forward', () => editor.bringForward()],
          ['Send backward', () => editor.sendBackward()],
          ['Send to back', () => editor.sendToBack()],
        ])
        divider()
        add('Cut', () => { void editor.cutSelection() }, 'Ctrl+X')
      }
      add('Copy', () => { void editor.copySelection() }, 'Ctrl+C')
      if (!editor.readonly) {
        add('Paste', () => { void editor.pasteFromClipboard() }, 'Ctrl+V')
        add('Duplicate', () => editor.duplicateSelection(), 'Ctrl+D')
        add('Delete', () => editor.deleteSelection(), 'Del')
      }
      divider()
      add('Select all', () => editor.selectAll(), 'Ctrl+A')
    } else {
      if (!editor.readonly) {
        add('Paste', () => { void editor.pasteFromClipboard() }, 'Ctrl+V')
        divider()
      }
      add('Select all', () => editor.selectAll(), 'Ctrl+A')
      if (typeof editor.fitContent === 'function') add('Fit to content', () => editor.fitContent({ animate: 220 }))
    }
    menu.style.display = 'block'
    menu.style.visibility = 'hidden'
    const maxX = Math.max(0, root.clientWidth - menu.offsetWidth - 8)
    const maxY = Math.max(0, root.clientHeight - menu.offsetHeight - 8)
    menu.style.left = Math.max(0, Math.min(screen.x, maxX)) + 'px'
    menu.style.top = Math.max(0, Math.min(screen.y, maxY)) + 'px'
    menu.style.visibility = ''
    visible = true
    menu.focus({ preventScroll: true })
  }
  const outside = (event) => { if (visible && !menu.contains(event.target) && !submenu?.contains(event.target)) close() }
  const keydown = (event) => {
    if (!visible) return
    if (event.key === 'Escape') { event.preventDefault(); close(); root.focus({ preventScroll: true }) }
    if (event.key === 'ArrowLeft' && submenu) { event.preventDefault(); closeSubmenu(); menu.focus(); return }
    if (event.key === 'ArrowRight' && document.activeElement?.getAttribute('aria-haspopup') === 'menu') { event.preventDefault(); document.activeElement.click(); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const items = [...(submenu?.contains(document.activeElement) ? submenu : menu).querySelectorAll('button')]
      const i = items.indexOf(document.activeElement)
      items[(i + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
    }
  }
  root.addEventListener('contextmenu', open)
  document.addEventListener('pointerdown', outside)
  document.addEventListener('keydown', keydown, true)
  return {
    destroy() {
      root.removeEventListener('contextmenu', open)
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', keydown, true)
      menu.remove()
    },
  }
}
