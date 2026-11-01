// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mountContextMenu } from '../src/context-menu.js'

describe('Reorder context submenu', () => {
  it('offers all four stacking commands and invokes the selected action', () => {
    const container = document.createElement('div')
    document.body.append(container)
    const calls = { bringToFront: vi.fn(), bringForward: vi.fn(), sendBackward: vi.fn(), sendToBack: vi.fn() }
    const editor = {
      container, selection: new Set(['a']), readonly: false,
      screenToPage: (x, y) => ({ x, y }),
      hitTest: () => ({ id: 'a' }),
      ...calls,
    }
    const context = mountContextMenu(editor)
    container.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }))
    const reorder = [...container.querySelectorAll('[role="menuitem"]')].find(el => el.textContent.includes('Reorder'))
    expect(reorder).toBeTruthy()
    reorder.click()
    const items = [...container.querySelectorAll('.qd-context-submenu [role="menuitem"]')]
    expect(items.map(el => el.textContent)).toEqual(['Bring to front', 'Bring forward', 'Send backward', 'Send to back'])
    items[1].click()
    expect(calls.bringForward).toHaveBeenCalledOnce()
    expect(container.querySelector('.qd-context-submenu')).toBeNull()
    context.destroy()
    container.remove()
  })
})
