import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mergeSnapshots, snapshotDiff } from './room-merge.mjs'
const snap = store => ({ document: { store } })
const shape = (id,x=0) => ({ id, typeName:'shape', x })
describe('three-way offline recovery', () => {
  it('retains non-overlapping additions from both participants', () => {
    const base = snap({ a: shape('a') })
    const local = snap({ a: shape('a'), b: shape('b') })
    const remote = snap({ a: shape('a'), c: shape('c') })
    const result = mergeSnapshots(base,local,remote)
    assert.deepEqual(result.conflicts,[])
    assert.deepEqual(Object.keys(result.snapshot.document.store).sort(),['a','b','c'])
    assert.deepEqual(Object.keys(snapshotDiff(remote,result.snapshot).added),['b'])
  })
  it('does not resurrect an object deleted remotely', () => {
    const base = snap({ a: shape('a') })
    const local = snap({ a: shape('a'), b: shape('b') })
    const remote = snap({})
    const result = mergeSnapshots(base,local,remote)
    assert.deepEqual(Object.keys(result.snapshot.document.store),['b'])
  })
  it('refuses overlapping changes and delete-versus-edit', () => {
    const base = snap({ a: shape('a') })
    assert.deepEqual(mergeSnapshots(base,snap({a:shape('a',2)}),snap({a:shape('a',3)})).conflicts,['a'])
    assert.deepEqual(mergeSnapshots(base,snap({a:shape('a',2)}),snap({})).conflicts,['a'])
  })
})
