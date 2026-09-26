import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  registerShape,
  unregisterShape,
  shapeUtil,
  registeredShapeTypes,
} from '../src/shape-registry.js'
import {
  localBounds,
  drawShape,
  hitShape,
  marqueeHits,
  scaleShape,
} from '../src/shapes.js'

const TYPE = 'test-custom'

function shape(overrides = {}) {
  return {
    id: 'custom-1',
    type: TYPE,
    x: 100,
    y: 200,
    rot: 0,
    props: {},
    ...overrides,
  }
}

afterEach(() => {
  unregisterShape(TYPE)
})

describe('custom shape registry', () => {
  it('registers and unregisters custom shape utilities', () => {
    const util = { bounds: () => ({ x: 0, y: 0, w: 10, h: 20 }) }

    registerShape(TYPE, util)

    expect(shapeUtil(TYPE)).toBe(util)
    expect(registeredShapeTypes()).toContain(TYPE)

    unregisterShape(TYPE)

    expect(shapeUtil(TYPE)).toBeNull()
    expect(registeredShapeTypes()).not.toContain(TYPE)
  })

  it('uses custom bounds', () => {
    registerShape(TYPE, {
      bounds: () => ({ x: 2, y: 3, w: 40, h: 50 }),
    })

    expect(localBounds(shape())).toEqual({ x: 2, y: 3, w: 40, h: 50 })
  })

  it('uses custom hit testing with local coordinates', () => {
    const hit = vi.fn(() => true)

    registerShape(TYPE, {
      bounds: () => ({ x: 0, y: 0, w: 100, h: 100 }),
      hit,
    })

    const store = { marker: true }
    expect(hitShape(shape(), 125, 240, 4, store)).toBe(true)
    expect(hit).toHaveBeenCalledOnce()

    const [calledShape, point, tolerance, calledStore] = hit.mock.calls[0]
    expect(calledShape.type).toBe(TYPE)
    expect(point).toEqual({ x: 25, y: 40 })
    expect(tolerance).toBe(4)
    expect(calledStore).toBe(store)
  })

  it('uses custom marquee testing', () => {
    const marquee = vi.fn(() => true)

    registerShape(TYPE, {
      bounds: () => ({ x: 0, y: 0, w: 100, h: 100 }),
      marquee,
    })

    const rect = { x: 110, y: 210, w: 20, h: 20 }

    expect(marqueeHits(shape(), rect)).toBe(true)
    expect(marquee).toHaveBeenCalledWith(expect.objectContaining({ type: TYPE }), rect)
  })

  it('uses custom resize behavior', () => {
    const resize = vi.fn((current, sx, sy) => ({
      ...current,
      props: { scaledX: sx, scaledY: sy },
    }))

    registerShape(TYPE, { resize })

    const result = scaleShape(shape(), 2, 3)

    expect(resize).toHaveBeenCalledOnce()
    expect(result.props).toEqual({ scaledX: 2, scaledY: 3 })
  })

  it('invokes custom drawing inside the normal shape transform', () => {
    const draw = vi.fn()

    registerShape(TYPE, {
      bounds: () => ({ x: 0, y: 0, w: 100, h: 100 }),
      draw,
    })

    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      globalAlpha: 1,
    }

    const opts = {
      ghost: false,
      theme: { colors: { black: '#000000' } },
    }

    const current = shape()
    drawShape(ctx, current, opts)

    expect(ctx.save).toHaveBeenCalledOnce()
    expect(ctx.translate).toHaveBeenCalledWith(100, 200)
    expect(draw).toHaveBeenCalledWith(ctx, current, opts)
    expect(ctx.restore).toHaveBeenCalledOnce()
  })
})
