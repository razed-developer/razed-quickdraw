import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import WebSocket from 'ws'
import { Store } from '../../packages/core/src/store.js'
import { createSyncServer } from './relay.mjs'

// Exercises the same store-diff contract used by SQA Live, against the
// standalone Razed Quickdraw relay. No tutor/student roles or shared camera.
const servers = new Set()
const sockets = new Set()
afterEach(async () => {
  for (const socket of sockets) socket.terminate()
  sockets.clear()
  await Promise.all([...servers].map(server => server.close()))
  servers.clear()
})

async function peer(url) {
  const store = new Store()
  const socket = await new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    ws.once('open', () => resolve(ws))
    ws.once('error', reject)
  })
  sockets.add(socket)
  const stop = store.listen(diff => {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(diff))
  }, { source: 'user' })
  socket.on('message', data => store.applyDiff(JSON.parse(data.toString()), 'remote'))
  return { store, socket, stop }
}

async function waitFor(predicate, timeout = 2000) {
  const until = Date.now() + timeout
  while (!predicate()) {
    if (Date.now() > until) throw new Error('Timed out waiting for synchronized state')
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

function shape(id, x) {
  return { id, typeName: 'shape', type: 'rect', x, y: 0, z: 1, props: {} }
}

describe('Razed Quickdraw collaboration contract', () => {
  it('synchronizes independent additions in both directions without echo loops', async () => {
    const server = createSyncServer()
    servers.add(server)
    const { port } = await server.listen(0)
    const url = `ws://127.0.0.1:${port}`
    const a = await peer(url)
    const b = await peer(url)
    let remoteEventsA = 0
    let remoteEventsB = 0
    a.store.listen(() => { remoteEventsA++ }, { source: 'remote' })
    b.store.listen(() => { remoteEventsB++ }, { source: 'remote' })

    a.store.put(shape('shape:a', 10))
    b.store.put(shape('shape:b', 20))
    await waitFor(() => a.store.has('shape:b') && b.store.has('shape:a'))

    assert.deepEqual(a.store.get('shape:b'), b.store.get('shape:b'))
    assert.deepEqual(a.store.get('shape:a'), b.store.get('shape:a'))
    assert.equal(remoteEventsA, 1)
    assert.equal(remoteEventsB, 1)
    a.stop()
    b.stop()
  })

  it('preserves local undo ownership after receiving remote edits', async () => {
    const server = createSyncServer()
    servers.add(server)
    const { port } = await server.listen(0)
    const url = `ws://127.0.0.1:${port}`
    const a = await peer(url)
    const b = await peer(url)

    a.store.put(shape('shape:a', 10))
    b.store.put(shape('shape:b', 20))
    await waitFor(() => a.store.has('shape:b') && b.store.has('shape:a'))

    a.store.undo()
    await waitFor(() => !b.store.has('shape:a'))
    assert.equal(a.store.has('shape:b'), true)
    assert.equal(b.store.has('shape:b'), true)
    a.stop()
    b.stop()
  })
})
