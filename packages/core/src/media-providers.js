// Optional Wikimedia Commons search adapter. No API key required.
// Host applications can supply their own provider with the same search/import shape.
const ENDPOINT = 'https://commons.wikimedia.org/w/api.php'
const safeText = (html = '') => String(html).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim()
export const wikimediaCommonsProvider = {
  id: 'wikimedia',
  label: 'Wikimedia Commons',
  async search(query, { limit = 16, signal } = {}) {
    if (!String(query || '').trim()) return []
    const url = new URL(ENDPOINT)
    for (const [key, value] of Object.entries({
      action: 'query', generator: 'search', gsrsearch: 'filetype:bitmap ' + query.trim(),
      gsrnamespace: '6', gsrlimit: String(Math.max(1, Math.min(30, limit))),
      prop: 'imageinfo', iiprop: 'url|extmetadata|mime', iiurlwidth: '320',
      format: 'json', origin: '*'
    })) url.searchParams.set(key, value)
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error('Wikimedia search failed (' + response.status + ')')
    const json = await response.json()
    return Object.values(json.query?.pages || {}).flatMap((page) => {
      const info = page.imageinfo?.[0]
      if (!info?.url || !info.mime?.startsWith('image/')) return []
      const meta = info.extmetadata || {}
      return [{
        id: String(page.pageid), title: page.title.replace(/^File:/, ''),
        thumbnailUrl: info.thumburl || info.url, imageUrl: info.url,
        source: { provider: 'wikimedia', title: page.title,
          author: safeText(meta.Artist?.value), license: safeText(meta.LicenseShortName?.value),
          sourceUrl: info.descriptionurl || info.url }
      }]
    })
  },
  async getBlob(item, { signal } = {}) {
    const response = await fetch(item.imageUrl, { signal })
    if (!response.ok) throw new Error('Image download failed (' + response.status + ')')
    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) throw new TypeError('Remote response was not an image')
    return blob
  }
}

// Pixabay's API key must be held by the host backend, never in browser code.
// Supply a same-origin endpoint that accepts ?q= and returns Pixabay's JSON response.
export function createPixabayProvider({ searchEndpoint }) {
  if (typeof searchEndpoint !== 'string' || !searchEndpoint.startsWith('/') || searchEndpoint.startsWith('//')) {
    throw new TypeError('Pixabay searchEndpoint must be a same-origin path')
  }
  return {
    id: 'pixabay',
    label: 'Pixabay',
    async search(query, { limit = 16, signal } = {}) {
      if (!String(query || '').trim()) return []
      const url = new URL(searchEndpoint, window.location.origin)
      url.searchParams.set('q', query.trim())
      url.searchParams.set('per_page', String(Math.max(3, Math.min(30, limit))))
      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error('Pixabay search failed (' + response.status + ')')
      const json = await response.json()
      if (!Array.isArray(json.hits)) throw new Error('Invalid Pixabay response')
      return json.hits.filter(hit => hit.webformatURL && hit.previewURL).map(hit => ({
        id: String(hit.id), title: hit.tags || 'Pixabay image',
        thumbnailUrl: hit.previewURL, imageUrl: hit.webformatURL,
        source: { provider: 'pixabay', title: hit.tags || 'Pixabay image',
          author: hit.user || '', license: 'Pixabay Content License',
          sourceUrl: hit.pageURL || '' }
      }))
    },
    async getBlob(item, { signal } = {}) {
      const response = await fetch(item.imageUrl, { signal })
      if (!response.ok) throw new Error('Pixabay image download failed (' + response.status + ')')
      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) throw new TypeError('Remote response was not an image')
      return blob
    }
  }
}
