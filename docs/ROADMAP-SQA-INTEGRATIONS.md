# Razed Quickdraw: colour, media, and graphing roadmap

Status: **proposal / not implemented**. Canonical development repository for the Quickdraw integration used by SQA projects: `razed-developer/razed-quickdraw`. Verify npm package publishing ownership and provenance before changing consumers; existing `@quickdrawjs/*` packages may originate upstream.

## Architectural boundary

Quickdraw owns reusable canvas interactions, visual objects, editing, serialization, rendering, and extension hooks. SQA Tools owns advanced mathematical exploration and learning workflows. SQA Live owns session membership, permissions, and realtime transport. Do not duplicate the graphing calculator in Quickdraw.

## 1. Unlimited colour selection

- Preserve current named colours as one-click swatches.
- Add arbitrary colour picker, HEX entry, recent colours, and optional user-defined swatches; eyedropper is a follow-up subject to browser support.
- Store concrete colour values on shapes/strokes while retaining backward compatibility with existing named theme-aware colours.
- Define alpha and contrast behaviour; test light/dark themes, PNG exports, serialization, undo/redo, clipboard, and remote diffs.
- Keep UI compact and keyboard accessible. Migration must not silently change old documents.

## 2. Search and insert images/GIFs

- Provide an optional provider-agnostic media-search extension with query, previews, licence/attribution metadata, and insert-to-board.
- SQA hosts configure providers, safe-search policy, credentials and any proxy. Reuse patterns from SQA Creative after reviewing its implementation; do not embed provider API secrets in browser code.
- Candidate providers include Pixabay and suitable GIF services, subject to actual API terms, attribution and age-appropriate filtering.
- Download/validate media before storing; enforce file size, MIME, content, dimensions, rate limits, and licence restrictions. Avoid hotlink-only persistence.
- Audit current image pipeline for GIF animation: preview, storage, realtime sync, export, and fallback static frame. Do not promise animation until tested.
- Support ordinary local uploads regardless of provider availability; avoid forcing network access into core.

## 3. Basic graph objects for whiteboards

- Insert a coordinate plane with configurable bounds, axis labels, tick spacing and grid; support manual points, lines and annotations.
- Offer lightweight plotting from one or a few expressions only if it can reuse the SQA Tools graph definition/engine without importing its full application UI.
- Graphs remain editable, resizeable, serializable objects. Support lock of graph geometry while allowing annotations above it.
- Use the existing shape registry where feasible. Avoid mixing graph coordinate units with canvas pixel units.
- Define a versioned import/export contract for receiving graph definitions or static previews from SQA Graphing Lab; preserve provenance and editable mathematical metadata.
- Ensure export to PNG and collaboration round trips do not alter coordinate values.

## Integration and release

1. Audit `@quickdrawjs/core` / `@quickdrawjs/react` publication ownership and package versions against this fork.
2. Agree on source/release strategy and use versioned, reproducible dependencies in SQA Live.
3. Implement and test each capability separately; publish a new version and update consumers only after CI passes.
4. Test document migration, rendering, collaboration, accessibility, and offline behaviour.
5. Keep advanced expression editing, sliders, intersections, regression and guided lessons in SQA Tools, not Quickdraw.

## Proposed delivery order

1. Colour model + picker + compatibility tests.
2. Provider interface + local media insertion + safe search.
3. Basic coordinate-plane shape and graph exchange contract.
4. SQA Tools integration with Graphing Lab when its shared engine is ready.

No runtime feature, release, or dependency change is included in this planning document.
