import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import WebSocket from 'ws'
import { Store } from '../../packages/core/src/store.js'
import { createRoomSyncServer } from './room-server.mjs'

function next(socket) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out')), 2000)
    socket.once('message', bytes => { clearTimeout(timer); resolve(JSON.parse(bytes.toString())) })
  })
}
async function joinRoom(port) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}`)
  await new Promise(resolve => socket.once('open', resolve))
  const response = next(socket)
  socket.send(JSON.stringify({ type: 'join', room: 'saved' }))
  return { socket, snapshot: await response }
}
describe('durable room persistence', () => {
  it('restores a committed drawing after the server restarts', async () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'quickdraw-room-'))
    let server
    try {
      server = createRoomSyncServer({ dataDir })
      let { port } = await server.listen()
      const a = await joinRoom(port)
      const record = { id: 'shape:persist', typeName: 'shape', type: 'rect', x: 1, y: 2, z: 1, props: {} }
      const acknowledged = next(a.socket)
      a.socket.send(JSON.stringify({
        type: 'diff', baseRevision: 0, clientId: 'test',
        diff: { added: { [record.id]: record }, removed: {}, updated: {} },
      }))
      assert.equal((await acknowledged).revision, 1)
      await server.close()
      server = createRoomSyncServer({ dataDir })
      ;({ port } = await server.listen())
      const b = await joinRoom(port)
      assert.equal(b.snapshot.revision, 1)
      const store = new Store()
      store.loadSnapshot(b.snapshot.snapshot, 'remote')
      assert.equal(store.has(record.id), true)
      await server.close()
      server = null
    } finally {
      if (server) await server.close()
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})
