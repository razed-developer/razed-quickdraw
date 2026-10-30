// Optional revision-aware client adapter for the room-server example.
// No camera state or application roles are synchronized.
// The server is authoritative; unsent edits are never silently replayed.
export function connectRoom({ store, url, room, WebSocketImpl = globalThis.WebSocket, onStatus = () => {}, onConflict = () => {} }) {
  if (!store || !url || !room || !WebSocketImpl) throw new Error('store, url, room and WebSocket required')
  let socket = null
  let revision = null
  let awaiting = false
  let stopped = false
  let pending = []
  let conflicted = false
  let hasSynced = false
  const clientId = Math.random().toString(36).slice(2) + Date.now().toString(36)
  let reconnectDelay = 250
  let retryTimer = null

  function status(value) { onStatus(value) }
  function send(message) {
    if (!socket || socket.readyState !== WebSocketImpl.OPEN) return false
    socket.send(JSON.stringify(message))
    return true
  }
  function pump() {
    if (stopped || conflicted || awaiting || revision === null || !pending.length) return
    if (send({ type: 'diff', baseRevision: revision, diff: pending[0], clientId })) awaiting = true
  }
  const unsubscribe = store.listen(diff => {
    if (stopped) return
    pending.push(diff)
    pump()
  }, { source: 'user' })

  function connect() {
    if (stopped) return
    status('connecting')
    const current = new WebSocketImpl(url)
    socket = current
    current.addEventListener('open', () => {
      if (stopped || socket !== current) return
      reconnectDelay = 250
      revision = null
      awaiting = false
      send({ type: 'join', room })
    })
    current.addEventListener('message', event => {
      if (stopped || socket !== current) return
      let msg
      try { msg = JSON.parse(String(event.data)) } catch { return }
      if (msg.type === 'snapshot' && Number.isSafeInteger(msg.revision)) {
        revision = msg.revision
        awaiting = false
        // Never replace locally edited content without an explicit decision.
        const local = store.getSnapshot()
        const localHasRecords = Object.keys(local.records || local).length > 0
        const remoteHasRecords = Object.keys(msg.snapshot?.records || msg.snapshot || {}).length > 0
        if (pending.length || (hasSynced && localHasRecords && !remoteHasRecords)) {
          conflicted = true
          status('conflict')
          onConflict({ snapshot: msg.snapshot, revision, pending: pending.slice() })
          return
        }
        store.loadSnapshot(msg.snapshot, 'remote')
        hasSynced = true
        status('connected')
        pump()
      } else if (msg.type === 'diff' && Number.isSafeInteger(msg.revision)) {
        if (revision === null) return
        if (msg.revision !== revision + 1) {
          status('resyncing')
          revision = null
          awaiting = false
          send({ type: 'resync' })
          return
        }
        if (awaiting && msg.clientId !== clientId) {
          // Another writer advanced the server while our write was in flight.
          // Resync rather than pretending our pending edit was accepted.
          revision = null
          awaiting = false
          status('resyncing')
          send({ type: 'resync' })
          return
        }
        if (msg.clientId === clientId) {
          // Acknowledged local edit: it is already present in this store.
          pending.shift()
          awaiting = false
        } else {
          store.applyDiff(msg.diff, 'remote')
        }
        revision = msg.revision
        pump()
      } else if (msg.type === 'conflict') {
        conflicted = true
        awaiting = false
        status('conflict')
        onConflict({ snapshot: msg.snapshot, revision: msg.revision, pending: pending.slice() })
      } else if (msg.type === 'error') {
        status('error')
      }
    })
    current.addEventListener('close', () => {
      if (socket !== current || stopped) return
      socket = null
      revision = null
      awaiting = false
      status('disconnected')
      retryTimer = setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, 4000)
    })
    current.addEventListener('error', () => { if (socket === current) status('error') })
  }
  connect()
  return {
    // Explicitly abandon local queued edits and adopt the server snapshot.
    // Applications can instead export the queued edits before calling this.
    acceptServer(snapshot, nextRevision) {
      if (!conflicted || !Number.isSafeInteger(nextRevision)) return false
      store.loadSnapshot(snapshot, 'remote')
      hasSynced = true
      revision = nextRevision
      pending = []
      awaiting = false
      conflicted = false
      status('connected')
      return true
    },
    disconnect() {
      stopped = true
      unsubscribe()
      if (retryTimer !== null) clearTimeout(retryTimer)
      if (socket) socket.close()
      socket = null
      status('disconnected')
    },
  }
}
