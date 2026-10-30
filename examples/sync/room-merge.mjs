// Conservative three-way merge of Quickdraw snapshots.
// Records are atomic: overlapping edits remain unresolved rather than guessing.
const records = snapshot => snapshot?.document?.store || {}
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b)
export function mergeSnapshots(base, local, remote, choices = {}) {
  const before = records(base), mine = records(local), theirs = records(remote)
  const merged = {}, conflicts = []
  for (const id of new Set([...Object.keys(before), ...Object.keys(mine), ...Object.keys(theirs)])) {
    const b = before[id], l = mine[id], r = theirs[id]
    const localChanged = !equal(l,b), remoteChanged = !equal(r,b)
    if (localChanged && remoteChanged && !equal(l,r)) {
      if (choices[id] !== 'local' && choices[id] !== 'server') {
        conflicts.push(id)
        continue
      }
      const selected = choices[id] === 'local' ? l : r
      if (selected !== undefined) merged[id] = selected
      continue
    }
    const chosen = localChanged ? l : r
    if (chosen !== undefined) merged[id] = chosen
  }
  return { snapshot: { document: { store: merged } }, conflicts }
}
export function snapshotDiff(from, to) {
  const old = records(from), next = records(to)
  const diff = { added: {}, updated: {}, removed: {} }
  for (const id of new Set([...Object.keys(old), ...Object.keys(next)])) {
    if (equal(old[id],next[id])) continue
    if (old[id] === undefined) diff.added[id] = next[id]
    else if (next[id] === undefined) diff.removed[id] = old[id]
    else diff.updated[id] = [old[id],next[id]]
  }
  return diff
}
