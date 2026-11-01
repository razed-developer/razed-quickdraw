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
