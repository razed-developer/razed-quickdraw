// Optional, development-only room-aware sync server.
// The SDK itself has no network dependency. This example deliberately rejects
// stale revisions rather than silently overwriting concurrent edits.
import { createServer } from 'node:http'
import { WebSocket, WebSocketServer } from 'ws'
import { Store } from '../../packages/core/src/store.js'

const MAX_MESSAGE_BYTES = 1024 * 1024
const ROOM_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/

export function createRoomSyncServer() {
  const http = createServer((_, res) => res.writeHead(404).end())
  const wss = new WebSocketServer({ server: http, maxPayload: MAX_MESSAGE_BYTES })
  const rooms = new Map()

  function send(socket, payload) {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload))
  }

  function roomFor(name) {
    let room = rooms.get(name)
    if (!room) {
      room = { store: new Store(), revision: 0, peers: new Set() }
      rooms.set(name, room)
    }
    return room
  }

  wss.on('connection', socket => {
    let joined = null
    socket.on('message', (bytes, binary) => {
      if (binary) { socket.close(1003, 'JSON only'); return }
      let msg
      try { msg = JSON.parse(bytes.toString()) } catch {
        send(socket, { type: 'error', code: 'invalid-json' })
        return
      }
      if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
        send(socket, { type: 'error', code: 'invalid-message' })
        return
      }
      if (msg.type === 'join') {
        if (joined || typeof msg.room !== 'string' || !ROOM_PATTERN.test(msg.room)) {
          send(socket, { type: 'error', code: 'invalid-join' })
          return
        }
        joined = roomFor(msg.room)
        joined.peers.add(socket)
        send(socket, { type: 'snapshot', revision: joined.revision, snapshot: joined.store.getSnapshot() })
        return
      }
      if (!joined) { send(socket, { type: 'error', code: 'join-required' }); return }
      if (msg.type === 'resync') {
        send(socket, { type: 'snapshot', revision: joined.revision, snapshot: joined.store.getSnapshot() })
        return
      }
      if (msg.type !== 'diff') { send(socket, { type: 'error', code: 'unknown-type' }); return }
      if (!Number.isSafeInteger(msg.baseRevision) || msg.baseRevision !== joined.revision) {
        send(socket, { type: 'conflict', revision: joined.revision, snapshot: joined.store.getSnapshot() })
        return
      }
      // Validate the diff before applying anything. All mutations are isolated
      // to the room's in-memory store; this is not an authenticated service.
      const diff = msg.diff
      if (!diff || typeof diff !== 'object' || Array.isArray(diff) ||
          !['added', 'updated', 'removed'].every(k => diff[k] && typeof diff[k] === 'object' && !Array.isArray(diff[k]))) {
        send(socket, { type: 'error', code: 'invalid-diff' })
        return
      }
      try {
        joined.store.applyDiff(diff, 'remote')
      } catch {
        // Do not continue after a potentially partial mutation.
        send(socket, { type: 'error', code: 'apply-failed' })
        socket.close(1011, 'Room state requires restart')
        return
      }
      joined.revision++
      const packet = { type: 'diff', revision: joined.revision, diff }
      for (const peer of joined.peers) send(peer, packet)
    })
    socket.on('close', () => {
      if (!joined) return
      joined.peers.delete(socket)
      // Intentionally retain room state for late joins during this process.
    })
  })

  return {
    listen(port = 0, host = '127.0.0.1') {
      return new Promise((resolve, reject) => {
        http.once('error', reject)
        http.listen(port, host, () => { http.off('error', reject); resolve(http.address()) })
      })
    },
    close() {
      for (const peer of wss.clients) peer.terminate()
      return new Promise((resolve, reject) => {
        wss.close(() => http.close(error => error ? reject(error) : resolve()))
      })
    },
  }
}
