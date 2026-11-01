# External image assets — implementation contract

Status: architecture agreed for incremental implementation; **not yet enabled**.

## Problem
Current image assets store base64 data URLs in Store records. Every room diff, undo entry, snapshot, and server persistence includes image bytes. The room lab's 24 MiB frame ceiling is a temporary workaround, not an asset architecture.

## Backward compatibility
- Existing asset records with `src: "data:image/..."` must continue rendering, importing, exporting, and syncing.
- New external assets will retain the same `typeName: "asset"`, `id`, dimensions and attribution metadata, but `src` will be a retrievable asset URL.
- Old room snapshots must load unchanged; no automatic destructive migration.

## Proposed host contract
```js
const assetStorage = {
  // Upload complete before publishing the asset record in the document.
  async upload(blob, { signal, mimeType } = {}) {
    return { url: '/api/quickdraw/assets/<opaque-id>' }
  },
  // Optional, for apps that require signed URLs or authenticated fetching.
  async resolve(assetRecord, { signal } = {}) {
    return assetRecord.src
  },
}
```

Host applications own authentication, authorization, upload size policy, retention, access control, and any storage credentials. Do not store secrets in the browser.

## Transaction ordering
1. Validate and decode the image locally, producing a Blob (not a base64 string).
2. Upload to host storage; on failure, show an error and do **not** add a dangling shape.
3. On successful upload, atomically add the external asset record and image shape.
4. Room sync publishes only asset URL and metadata. The server persists the reference, not image bytes.
5. Renderers resolve URLs; failed loads show a non-destructive placeholder/retry state.
6. Deleting an image shape must not immediately delete storage: undo, shared references, and other rooms may still need it. Garbage collection belongs to the host.

## Room demo storage
- Development-only HTTP upload and download routes; files stored outside public source directories.
- Validate content type and size, generate opaque IDs, prevent traversal, and return a same-origin URL.
- Test two browser clients, reconnect, persistence after restart, undo/redo, failed uploads, and legacy data URL snapshots.
- The demo is not an authenticated production media server.

## Risks and follow-ups
- A URL alone is not proof of access; host authorization must allow all intended participants.
- Canvas export may be tainted by cross-origin images without appropriate CORS.
- URL-based images must be loaded asynchronously without blocking rendering.
- A future migration can replace legacy embedded data with uploaded assets, but only with explicit user consent and verified backups.
- Board Health should report embedded bytes separately from externally stored asset counts.
