// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mountGifOverlay } from '../src/gif-overlay.js'

function harness() {
  const container = document.createElement('div')
  document.body.append(container)
  const records = [
    { id: 'gif-shape', type: 'image', x: 10, y: 20, rot: 0, props: { assetId: 'gif', w: 100, h: 60 } },
    { id: 'still-shape', type: 'image', x: 0, y: 0, props: { assetId: 'still', w: 20, h: 20 } },
  ]
  const assets = {
    gif: { src: '/assets/animation.gif', animated: true },
    still: { src: '/assets/still.png' },
  }
  const handlers = new Map()
  const overlay = document.createElement('canvas')
  container.append(overlay)
  const editor = {
    container,
    overlay,
    shapesSorted: () => records,
    viewSize: () => ({ w: 400, h: 300 }),
    renderScene: vi.fn(),
    camera: { z: 2 },
    pageToScreen: (x, y) => ({ x: x * 2, y: y * 2 }),
    store: {
      shapes: () => records,
      asset: (id) => assets[id],
      listen: () => () => {},
    },
    on(event, callback) { handlers.set(event, callback); return () => handlers.delete(event) },
    requestRender: vi.fn(),
  }
  return { editor, container, records, handlers }
}

describe('GIF overlay', () => {
  it('does not mount when disabled', () => {
    const { editor, container } = harness()
    const overlay = mountGifOverlay(editor)
    expect(container.querySelector('.qd-gif-layer')).toBeNull()
    overlay.destroy()
    container.remove()
  })

  it('renders only animated images and tracks camera and shape changes', () => {
    const { editor, container, records, handlers } = harness()
    const overlay = mountGifOverlay(editor, { enabled: true })
    const image = container.querySelector('.qd-gif-layer img')
    expect(container.querySelectorAll('.qd-gif-layer img')).toHaveLength(1)
    expect(image.style.left).toBe('20px')
    expect(image.style.top).toBe('40px')
    expect(image.style.width).toBe('200px')
    records[0].x = 30
    handlers.get('render')()
    expect(image.style.left).toBe('60px')
    overlay.setPlaying(false)
    expect(image.style.display).toBe('none')
    overlay.setPlaying(true)
    expect(image.style.display).not.toBe('none')
    records.splice(0, 1)
    handlers.get('render')()
    expect(container.querySelectorAll('.qd-gif-layer img')).toHaveLength(0)
    overlay.destroy()
    expect(container.querySelector('.qd-gif-layer')).toBeNull()
    container.remove()
  })
})
