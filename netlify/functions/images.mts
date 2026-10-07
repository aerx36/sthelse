import type { Config } from '@netlify/functions'
import type { DiscoveryImage } from '../../src/lib/discoveries'

interface ImagePage {
  title: string
  imageinfo?: { thumburl?: string; url: string; descriptionurl: string; extmetadata?: Record<string, { value: string }> }[]
}

function article(value: string | null): URL | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && /^(en|vi)\.wikipedia\.org$/.test(url.hostname) && url.pathname.startsWith('/wiki/') && !decodeURIComponent(url.pathname.slice(6)).includes(':') ? url : null
  } catch { return null }
}

function plain(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
}

async function imagesFor(url: URL, signal: AbortSignal): Promise<DiscoveryImage[]> {
  const endpoint = new URL('/w/api.php', url)
  endpoint.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', generator: 'images', titles: decodeURIComponent(url.pathname.slice(6)), gimlimit: '40', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '900', iiextmetadatafilter: 'Artist|LicenseShortName|ImageDescription', redirects: '1' }).toString()
  const response = await fetch(endpoint, { signal, headers: { 'User-Agent': 'sthelse/1.0 (https://sthelse.netlify.app; discovery toy)' } })
  if (!response.ok) throw new Error('Image source unavailable')
  const data = await response.json() as { query?: { pages?: ImagePage[] } }
  const images: DiscoveryImage[] = []
  for (const page of data.query?.pages || []) {
    if (/\b(flag|logo|icon|symbol|commons|wiki|edit|speaker|question|ambox|lock|padlock|cscr|disambig|red pog|blue pog)\b/i.test(page.title.replace(/_/g, ' '))) continue
    const info = page.imageinfo?.[0]
    if (!info) continue
    const imageUrl = new URL(info.thumburl || info.url)
    const sourceUrl = new URL(info.descriptionurl)
    if (imageUrl.protocol !== 'https:' || imageUrl.hostname !== 'upload.wikimedia.org' || sourceUrl.protocol !== 'https:' || !/^(commons\.wikimedia\.org|(?:en|vi)\.wikipedia\.org)$/.test(sourceUrl.hostname)) continue
    const license = plain(info.extmetadata?.LicenseShortName?.value || '')
    if (!license || /non-free|fair use|copyrighted/i.test(license)) continue
    images.push({ url: imageUrl.href, title: plain(info.extmetadata?.ImageDescription?.value || page.title.replace(/^File:/, '').replace(/_/g, ' ')), sourceUrl: sourceUrl.href, artist: plain(info.extmetadata?.Artist?.value || 'Wikimedia contributor'), license })
  }
  return images.sort((first, second) => Number(/\.svg/i.test(first.url)) - Number(/\.svg/i.test(second.url)))
}

async function englishArticle(url: URL, signal: AbortSignal): Promise<URL | null> {
  if (url.hostname !== 'vi.wikipedia.org') return null
  const endpoint = new URL('/w/api.php', url)
  endpoint.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'langlinks', titles: decodeURIComponent(url.pathname.slice(6)), lllang: 'en', llprop: 'url', redirects: '1' }).toString()
  const response = await fetch(endpoint, { signal, headers: { 'User-Agent': 'sthelse/1.0 (https://sthelse.netlify.app; discovery toy)' } })
  if (!response.ok) return null
  const data = await response.json() as { query?: { pages?: { langlinks?: { url: string }[] }[] } }
  return article(data.query?.pages?.[0]?.langlinks?.[0]?.url || null)
}

function uniqueImages(images: DiscoveryImage[]): DiscoveryImage[] {
  return images.filter((image, index) => images.findIndex(other => other.sourceUrl === image.sourceUrl) === index).slice(0, 3)
}

export default async (request: Request) => {
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET' } })
  const params = new URL(request.url).searchParams
  const original = article(params.get('url'))
  const localized = article(params.get('localized'))
  if (!original || (params.has('localized') && !localized)) return Response.json({ error: 'Invalid Wikipedia article' }, { status: 400 })
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(12000)])
  try {
    const batches = await Promise.allSettled([imagesFor(original, signal), ...(localized && localized.href !== original.href ? [imagesFor(localized, signal)] : [])])
    if (batches.every(batch => batch.status === 'rejected')) return Response.json({ error: 'Images unavailable' }, { status: 503 })
    const images = batches.flatMap(batch => batch.status === 'fulfilled' ? batch.value : [])
    if (uniqueImages(images).length < 3 && original.hostname === 'vi.wikipedia.org' && !signal.aborted) {
      try { const english = await englishArticle(original, signal); if (english) images.push(...await imagesFor(english, signal)) } catch {}
    }
    const unique = uniqueImages(images)
    return Response.json({ images: unique }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
  } catch { return Response.json({ error: 'Images unavailable' }, { status: 503 }) }
}

export const config: Config = { method: ['GET'] }
