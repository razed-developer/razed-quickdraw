# Quickdraw media integration plan

Status: Phase 1 in progress (2026-10-31). Core whiteboard remains provider-agnostic.

## Architecture
- **Core:** insert static image Blobs using existing image assets; expose a public import API and optional search-provider interface.
- **Hosts:** configure search providers, credentials, content policy, licensing and any backend proxy. Never bundle API secrets in browser code.
- **Gallery:** search terms, provider selector, thumbnails, credit/license/source metadata, insert action, loading/error/empty states.
- **Persistence:** static images are imported into the existing document asset pipeline; retain source/credit/license metadata alongside the asset when available.
- **Security:** validate image content and size; avoid unrestricted cross-origin fetches. Provider adapters return an image Blob or an allowed URL fetched through a host-controlled proxy.
- **Collaboration:** imported images use existing shape/asset sync. Verify room asset size limits before deploying large images.

## Phases
1. **Search and insert static images** from host-configured providers, initially Wikimedia Commons and Pixabay adapters; prefer Wikimedia for public demo without credentials. Implement core provider contract, gallery and image import, tests, and demo configuration. Check source licensing and attribution.
2. **Animated GIFs:** distinct media object and optional playback layer, play/pause, positioning, resizing; decide persistence, accessibility, and animation export behavior.
3. **Video embeds:** opt-in positioned interactive overlay for supported providers such as YouTube, URL validation, host permissions, persistence, and optional synchronized playback. Avoid executing arbitrary embed HTML.

## Decisions / acceptance
- Image search should not require a Quickdraw-specific backend or expose a provider API key.
- A host can disable media search or allow only selected providers.
- Existing local file insertion and static canvas rendering must remain unchanged.
- Search and import failures must be visible, not silent.
- Confirm external media license and attribution handling before production.
