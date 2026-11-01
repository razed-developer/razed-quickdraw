# External image storage integration

Quickdraw's core is provider-agnostic. Supply `assetStorage` to `createQuickdraw` (or `new Editor`) to store image bytes outside synchronized board records.

```js
const board = createQuickdraw({
  container: document.querySelector('#board'),
  assetStorage: {
    async upload(blob, { mimeType } = {}) {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': mimeType || blob.type },
        body: blob,
      })
      if (!response.ok) throw new Error('Upload failed: ' + response.status)
      return response.json() // { url: '/api/assets/<opaque-id>.png' }
    },
  },
})
```

The upload completes **before** Quickdraw adds the asset and image shape to the Store. Collaborative sync then transfers only the URL and metadata. With no `assetStorage`, legacy embedded data URLs remain supported.

## Host responsibilities

- Implement authenticated upload and download routes with participant authorization.
- Return URLs reachable by every authorized participant, including after reconnect or server restart.
- Enforce file type, size, quotas, retention, and cleanup policies on the server. Avoid exposing credentials to browsers.
- Serve cross-origin images with appropriate CORS headers if canvas export is needed.
- Do not delete stored bytes immediately when a shape is removed: undo and other documents may still reference them.

The development demo implements `POST /api/assets` and `GET /api/assets/:id.ext`. Files are written under the room server's data directory. **This is not a production asset service** and has no authentication.

## Errors and status

Image insertion failures reject the insertion promise and emit `editor.on('asset-error', ({message, error}) => ...)`. The demo displays the error in its notice area. Hosts should surface this event in their own UI. No image shape is published when upload fails.

## Verification checklist

1. Start the room demo, open both participants, and insert an image in A. B should display it automatically without clicking.
2. Refresh B and confirm the image reloads.
3. Stop and restart the room server, reconnect, and confirm the image remains available.
4. Test an image upload failure: no dangling image shape should appear, and an error should be shown.
5. Test undo/redo, legacy embedded images, and export.
6. For production, verify access controls, URL lifetime, and cross-origin export.

## Future improvements

Loading and failed-download placeholders with retry; a host-provided URL resolver for signed URLs; browser upload progress; explicit asset garbage collection; and Board Health statistics distinguishing embedded from external image bytes.
