// Extension boundary for host-defined Quickdraw shapes.
//
// Applications can register additional shape behavior without baking
// application-specific shape types into the core package. The registry lives
// on globalThis so one browser realm shares registrations even when a bundler
// evaluates Quickdraw through more than one module graph.
const REGISTRY_KEY = Symbol.for('quickdraw.shapeRegistry')
const registry = globalThis[REGISTRY_KEY] || (globalThis[REGISTRY_KEY] = new Map())

export function registerShape(type, util) {
  if (!type || typeof type !== 'string') throw new Error('shape type must be a string')
  if (!util || typeof util !== 'object') throw new Error(`shape util required for ${type}`)
  registry.set(type, util)
  return util
}

export function unregisterShape(type) {
  return registry.delete(type)
}

export function shapeUtil(type) {
  return registry.get(type) || null
}

export function registeredShapeTypes() {
  return [...registry.keys()]
}
