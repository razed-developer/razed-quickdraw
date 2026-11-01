import { describe, expect, it } from 'vitest'
import { isAnimatedImage, planMediaLayers } from '../src/media-layer-plan.js'

const shape = (id, type = 'draw', assetId) => ({
  id, type, z: Number(id.replace(/\D/g, '')) || 0,
  props: assetId ? { assetId } : {},
})
const assets = {
  a: { src: '/assets/a', animated: true },
  b: { src: 'data:image/gif;base64,AAAA' },
  still: { src: '/assets/still.png' },
}
const plan = (shapes) => planMediaLayers(shapes, (id) => assets[id])
const signature = (layers) => layers.map((layer) =>
  layer.kind === 'gif' ? 'gif:' + layer.shape.id :
    'canvas:' + layer.shapes.map((s) => s.id).join(','))

describe('animated media layer plan', () => {
  it('does not create layers for an empty board', () => {
    expect(plan([])).toEqual([])
  })
  it('keeps ordinary shapes in one canvas run', () => {
    expect(signature(plan([shape('s1'), shape('s2')]))).toEqual(['canvas:s1,s2'])
  })
  it('places a GIF between two ordinary shape runs', () => {
    expect(signature(plan([shape('s1'), shape('g2', 'image', 'a'), shape('s3')]))).toEqual([
      'canvas:s1', 'gif:g2', 'canvas:s3',
    ])
  })
  it('supports consecutive GIFs without empty canvases', () => {
    expect(signature(plan([shape('g1', 'image', 'a'), shape('g2', 'image', 'b')]))).toEqual([
      'gif:g1', 'gif:g2',
    ])
  })
  it('interleaves multiple GIFs and preserves supplied order', () => {
    const shapes = [shape('s1'), shape('g2', 'image', 'a'), shape('s3'), shape('g4', 'image', 'b'), shape('s5')]
    expect(signature(plan(shapes))).toEqual(['canvas:s1', 'gif:g2', 'canvas:s3', 'gif:g4', 'canvas:s5'])
    expect(signature(plan([...shapes].reverse()))).toEqual(['canvas:s5', 'gif:g4', 'canvas:s3', 'gif:g2', 'canvas:s1'])
  })
  it('keeps still images and missing assets on the canvas', () => {
    expect(signature(plan([shape('s1', 'image', 'still'), shape('s2', 'image', 'missing')]))).toEqual(['canvas:s1,s2'])
  })
  it('detects GIF data URLs and extensionless assets with metadata', () => {
    expect(isAnimatedImage(shape('g1', 'image', 'b'), assets.b)).toBe(true)
    expect(isAnimatedImage(shape('g1', 'image', 'a'), assets.a)).toBe(true)
    expect(isAnimatedImage(shape('s1'), assets.a)).toBe(false)
  })
  it('does not mutate its inputs', () => {
    const shapes = Object.freeze([Object.freeze(shape('s1')), Object.freeze(shape('g2', 'image', 'a'))])
    expect(signature(plan(shapes))).toEqual(['canvas:s1', 'gif:g2'])
    expect(shapes).toHaveLength(2)
  })
})
