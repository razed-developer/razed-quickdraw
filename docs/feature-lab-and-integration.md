# Razed Quickdraw integration and Feature Lab

## Try the labs

From the repository root:

```powershell
npm run dev:rooms --workspace=quickdraw-sync-example
```

- `http://127.0.0.1:8081/feature-lab` — single-board SDK configuration playground.
- `http://127.0.0.1:8081/demo` — two-participant collaborative room with image storage.

## Application roles, not room ownership

Quickdraw is a drawing engine; your application decides roles and permissions. A tutor is not necessarily the person who created the room. Determine role from the host application's authenticated session, then pass only the UI features appropriate to that participant:

```js
const board = createQuickdraw({
  container: document.getElementById('board'),
  boardHealth: session.permissions.canViewBoardHealth === true,
})
```

This is **visibility only**. Never use a browser-only feature flag as security authorization for privileged actions. The server must separately enforce tutor permissions for future session-management or moderation endpoints.

## Board Health

`boardHealth: true` mounts a compact panel in the board's top-right. It is off by default. Clicking its summary opens it; clicking its expanded content closes it.

For a custom dashboard, use the pure function:

```js
import { measureBoardHealth } from '@quickdrawjs/core'
const metrics = measureBoardHealth(board.editor.store)
```

Metrics include shapes, images, externally stored asset count, approximate embedded image bytes, and serialized snapshot size. The Healthy / Getting Heavy / Performance Risk thresholds are **initial heuristics**, not measured latency or frame rate. The panel never deletes or optimizes content automatically.

## External images

See [External Image Storage Integration](external-image-storage-integration.md). Production hosts must implement authorized upload/download endpoints; the local room server's endpoints are development-only.

## Adding future features

1. Implement the capability in Quickdraw core when it is reusable across hosts.
2. Expose a documented opt-in setting or API; default off for optional teaching controls.
3. Add a focused control and test scenario to the Feature Lab.
4. Add a two-participant test in the collaboration lab if synchronization or permissions are involved.
5. Document how hosts enable it, what they must provide, and what stays local versus synchronized.

The Feature Lab demonstrates UI configuration only. It does not simulate real authenticated users, storage authorization, or network performance.
