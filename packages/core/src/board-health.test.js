import { describe, expect, it } from 'vitest'
import { Store } from './store.js'
import { measureBoardHealth } from './board-health.js'

const makeStore = (shapes = [], assets = []) => {
  const store = new Store()
  store.transact(() => {
    for (const record of [...shapes, ...assets]) store.put(record)
  })
  return store
}
const shape = (id, type = 'rect') => ({ id, typeName: 'shape', type, props: {} })
const asset = (id, src) => ({ id, typeName: 'asset', src })

describe('measureBoardHealth', () => {
  it('reports an empty board as healthy', () => {
    const result = measureBoardHealth(makeStore())
    expect(result.level).toBe('healthy')
    expect(result.shapes).toBe(0)
    expect(result.images).toBe(0)
    expect(result.embeddedBytes).toBe(0)
  })

  it('counts image shapes separately from stored assets', () => {
    const result = measureBoardHealth(makeStore(
      [shape('s1', 'image'), shape('s2', 'rect')],
      [asset('a1', '/api/assets/one.png'), asset('a2', '/api/assets/two.png')],
    ))
    expect(result.shapes).toBe(2)
    expect(result.images).toBe(1)
    expect(result.externalAssets).toBe(2)
    expect(result.embeddedBytes).toBe(0)
  })

  it('estimates embedded base64 bytes', () => {
    const result = measureBoardHealth(makeStore([], [asset('a1', 'data:image/png;base64,AAAA')]))
    expect(result.embeddedBytes).toBe(3)
  })

  it('marks large shape counts as heavy or at risk', () => {
    expect(measureBoardHealth(makeStore(Array.from({ length: 500 }, (_, i) => shape('s' + i)))).level).toBe('heavy')
    expect(measureBoardHealth(makeStore(Array.from({ length: 2000 }, (_, i) => shape('s' + i)))).level).toBe('risk')
  })

  it('does not change the document', () => {
    const store = makeStore([shape('s1')])
    const before = JSON.stringify(store.getSnapshot())
    measureBoardHealth(store)
    expect(JSON.stringify(store.getSnapshot())).toBe(before)
  })
})
