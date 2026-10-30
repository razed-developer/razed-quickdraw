# Collaboration foundation (Razed Quickdraw)

## Ownership

Razed Quickdraw is the canonical SDK. SQA Live's `feature/tutor-hub-jitsi-integration` branch is a reference implementation only; this work does not change SQA Live or its package dependencies.

## Existing reusable contract

- Each Quickdraw instance has its own editor, camera and selection.
- The document store emits JSON-safe diffs via `store.listen(fn, { source: 'user' })`.
- Peers apply received changes with `store.applyDiff(diff, 'remote')`, avoiding feedback loops and remote changes in local undo history.
- `store.getSnapshot()` and `store.loadSnapshot(snapshot, 'remote')` support state transfer.
- `editor.setCamera()` and `editor.on('camera', fn)` are independent of the document store.

The existing `examples/sync/` relay is a minimal demonstration, **not** a production collaboration server. It broadcasts bytes to connected peers and has no authoritative document snapshot, authorization, durable state, room isolation or offline-change reconciliation.

## What we learned from SQA Live

SQA Live has a separate transport and a whiteboard adapter that exchanges `diff`, `snapshot` and `snapshot-request` messages. Its camera is not transmitted, so users navigate independently. The workspace call/presence logic is SQA-specific and does not belong in the Quickdraw SDK.

SQA Live's snapshot merging is a prototype, not a general conflict-resolution algorithm. Blindly replaying all local records after a remote snapshot can resurrect records another user deleted. Do not transplant it without tests and a defined merge policy.

## Next implementation milestones

1. Keep the existing two-client relay demo working and extend automated tests for bidirectional edits and local undo isolation.
2. Add a **separate optional** room-aware example server/client protocol with late-join snapshots, reconnect and explicit conflict semantics. Do not make network dependencies mandatory for `@quickdrawjs/core`.
3. Test reconnect with edits on both sides, deletion conflicts, ordering and duplicate messages before advertising offline-edit preservation.
4. Add optional camera event origin metadata if required by a generic follow-camera example. Host applications own Follow/Call policy, permissions and transport.
5. Before SQA Live migration, verify package provenance, version compatibility and a two-browser regression test.

## Test commands

From the repository root: `npm test` (includes the sync example's Node tests), `npm run typecheck`, and `npm run dev:sync` for the browser demo. The tests exercise the store/relay protocol, not rendered camera behaviour; independent panning still requires a browser-level test.
