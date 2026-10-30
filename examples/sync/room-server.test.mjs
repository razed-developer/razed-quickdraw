import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import WebSocket from 'ws'
import { Store } from '../../packages/core/src/store.js'
import { createRoomSyncServer } from './room-server.mjs'

const servers = new Set()
const sockets = new Set()
afterEach(async () => {
  for (const socket of sockets) socket.terminate()
  sockets.clear()
  await Promise.all([...servers].map(server => server.close()))
  servers.clear()
})
async function setup() {
  const server = createRoomSyncServer()
  servers.add(server)
  const { port } = await server.listen()
  return `ws://127.0.0.1:${port}`
}
async function connect(url, room) {
  const socket = await new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    ws.once('open', () => resolve(ws))
    ws.once('error', reject)
  })
  sockets.add(socket)
  const snapshot = next(socket)
  socket.send(JSON.stringify({ type: 'join', room }))
  return { socket, initial: await snapshot }
}
function next(socket) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off('message', onMessage)
      reject(new Error('message timeout'))
    }, 2000)
    const onMessage = bytes => { clearTimeout(timer); resolve(JSON.parse(bytes.toString())) }
    socket.once('message', onMessage)
  })
}
function record(id) {
  return { id, typeName: 'shape', type: 'rect', x: 1, y: 2, z: 1, props: {} }
}
function added(id) {
  return { added: { [id]: record(id) }, updated: {}, removed: {} }
}
function send(socket, msg) { socket.send(JSON.stringify(msg)) }

describe('revisioned room relay', () => {
  it('sends retained state to a late joiner without mixing rooms', async () => {
    const url = await setup()
    const a = await connect(url, 'one')
    assert.equal(a.initial.revision, 0)
    const ack = next(a.socket)
    send(a.socket, { type: 'diff', baseRevision: 0, diff: added('shape:one') })
    assert.equal((await ack).revision, 1)
    const late = await connect(url, 'one')
    const copy = new Store()
    copy.loadSnapshot(late.initial.snapshot, 'remote')
    assert.equal(late.initial.revision, 1)
    assert.equal(copy.has('shape:one'), true)
    const other = await connect(url, 'two')
    const isolated = new Store()
    isolated.loadSnapshot(other.initial.snapshot, 'remote')
    assert.equal(isolated.has('shape:one'), false)
  })

  it('rejects stale writes and supplies a current snapshot for recovery', async () => {
    const url = await setup()
    const a = await connect(url, 'shared')
    const b = await connect(url, 'shared')
    const ackA = next(a.socket)
    const broadcastB = next(b.socket)
    send(a.socket, { type: 'diff', baseRevision: 0, diff: added('shape:first') })
    assert.equal((await ackA).revision, 1)
    assert.equal((await broadcastB).revision, 1)
    const conflict = next(b.socket)
    send(b.socket, { type: 'diff', baseRevision: 0, diff: added('shape:stale') })
    const reply = await conflict
    assert.equal(reply.type, 'conflict')
    assert.equal(reply.revision, 1)
    const recovered = new Store()
    recovered.loadSnapshot(reply.snapshot, 'remote')
    assert.equal(recovered.has('shape:first'), true)
    assert.equal(recovered.has('shape:stale'), false)
  })

  it('retains state after disconnect for reconnecting peers', async () => {
    const url = await setup()
    const a = await connect(url, 'resume')
    const ack = next(a.socket)
    send(a.socket, { type: 'diff', baseRevision: 0, diff: added('shape:kept') })
    await ack
    await new Promise(resolve => { a.socket.once('close', resolve); a.socket.close() })
    sockets.delete(a.socket)
    const rejoined = await connect(url, 'resume')
    const store = new Store()
    store.loadSnapshot(rejoined.initial.snapshot, 'remote')
    assert.equal(store.has('shape:kept'), true)
    assert.equal(rejoined.initial.revision, 1)
  })
})
