import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import WebSocket from 'ws'
import { Store } from '../../packages/core/src/store.js'
import { createRoomSyncServer } from './room-server.mjs'
import { connectRoom } from './room-client.mjs'

const resources = []
afterEach(async () => {
  for (const item of resources.reverse()) await item()
  resources.length = 0
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function until(fn) {
  for (let i = 0; i < 200; i++) {
    if (fn()) return
    await delay(10)
  }
  throw new Error('timed out waiting for client sync')
}
function record(id) { return { id, typeName: 'shape', type: 'rect', x: 1, y: 2, z: 1, props: {} } }
async function setup() {
  const server = createRoomSyncServer()
  resources.push(() => server.close())
  const { port } = await server.listen()
  const url = `ws://127.0.0.1:${port}`
  function client(room = 'demo') {
    const store = new Store()
    let status = ''
    const conflicts = []
    const connection = connectRoom({
      store, url, room, WebSocketImpl: WebSocket,
      onStatus: value => { status = value },
      onConflict: conflict => conflicts.push(conflict),
    })
    resources.push(() => connection.disconnect())
    return { store, connection, conflicts, get status() { return status } }
  }
  return { client }
}

describe('room client adapter', () => {
  it('acknowledges local changes and synchronizes subsequent edits', async () => {
    const { client } = await setup()
    const a = client()
    const b = client()
    await until(() => a.status === 'connected' && b.status === 'connected')
    a.store.put(record('shape:one'))
    await until(() => b.store.has('shape:one'))
    await delay(50)
    b.store.put(record('shape:two'))
    await until(() => a.store.has('shape:two'))
    assert.equal(a.conflicts.length, 0)
    assert.equal(b.conflicts.length, 0)
  })

  it('loads the authoritative document for a late join', async () => {
    const { client } = await setup()
    const a = client()
    await until(() => a.status === 'connected')
    a.store.put(record('shape:existing'))
    await delay(60)
    const b = client()
    await until(() => b.status === 'connected' && b.store.has('shape:existing'))
    assert.equal(b.store.has('shape:existing'), true)
  })
})
