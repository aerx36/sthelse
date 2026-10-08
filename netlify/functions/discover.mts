import type { Config } from '@netlify/functions'
import type { ContentMode, Discovery, Mode } from '../../src/lib/discoveries'
import { readProfile, visitorId } from './interests.mts'

interface Topic {
  vi: string
  en: string
  label: string
}

interface WikiPage {
  pageid: number
  ns: number
  title: string
  length?: number
  extract?: string
  fullurl?: string
  missing?: boolean
  pageprops?: { disambiguation?: string }
  langlinks?: { lang: string; title: string; url: string }[]
  thumbnail?: { source: string }
  images?: { title: string }[]
}

interface WikiResponse {
  error?: { code: string; info: string }
  query?: { pages?: WikiPage[] }
}

function getTopics(mode: ContentMode): Topic[] {
  const topics: Record<ContentMode, Topic[]> = {
    weird: [
      { vi: '"động vật" "ngụy trang"', en: 'animal camouflage', label: 'THIÊN NHIÊN LẠ' },
      { vi: '"hiện tượng tự nhiên"', en: 'unusual natural phenomenon', label: 'HIỆN TƯỢNG LẠ' },
      { vi: '"phát quang sinh học"', en: 'bioluminescence', label: 'THIÊN NHIÊN LẠ' },
      { vi: '"ảo giác"', en: 'optical illusion', label: 'ẢO GIÁC' },
      { vi: '"giấc mơ"', en: 'dream sleep phenomenon', label: 'CON NGƯỜI' },
      { vi: '"động vật" "kỳ lạ"', en: 'unusual animal adaptation', label: 'ĐỘNG VẬT' },
      { vi: '"lịch sử" "kỳ lạ"', en: 'unusual historical events', label: 'CHUYỆN LẠ' },
      { vi: '"bí ẩn"', en: 'incategory:"Unexplained phenomena"', label: 'BÍ ẨN' },
      { vi: '"nghịch lý"', en: 'incategory:"Paradoxes"', label: 'NGHỊCH LÝ' },
      { vi: '"chữ viết" "giải mã"', en: 'incategory:"Undeciphered writing systems"', label: 'MẬT MÃ' },
    ],
    learn: [
      { vi: '"động vật" "trí thông minh"', en: 'animal intelligence', label: 'ĐỘNG VẬT' },
      { vi: '"phát minh"', en: 'everyday inventions', label: 'PHÁT MINH' },
      { vi: '"hệ Mặt Trời"', en: 'solar system', label: 'THIÊN VĂN' },
      { vi: '"trí nhớ"', en: 'memory psychology', label: 'TÂM LÝ' },
      { vi: '"khảo cổ"', en: 'archaeological discoveries', label: 'LỊCH SỬ' },
      { vi: '"thụ phấn"', en: 'pollination nature', label: 'TỰ NHIÊN' },
      { vi: '"văn hóa" "truyền thống"', en: 'cultural traditions', label: 'VĂN HÓA' },
      { vi: '"thí nghiệm" "khoa học"', en: 'famous science experiments', label: 'KHOA HỌC' },
      { vi: '"công nghệ" "lịch sử"', en: 'history of technology', label: 'CÔNG NGHỆ' },
      { vi: '"thích nghi" "sinh học"', en: 'incategory:"Extremophiles"', label: 'SINH HỌC' },
    ],
    explore: [
      { vi: '"di sản thế giới"', en: 'world heritage natural wonders', label: 'DI SẢN' },
      { vi: '"vườn quốc gia"', en: 'national park natural landscape', label: 'TỰ NHIÊN' },
      { vi: '"bảo tàng"', en: 'famous museum', label: 'BẢO TÀNG' },
      { vi: '"hang động"', en: 'spectacular caves', label: 'DƯỚI LÒNG ĐẤT' },
      { vi: '"núi lửa"', en: 'volcano', label: 'ĐỊA LÝ' },
      { vi: '"hành tinh"', en: 'planet space exploration', label: 'VŨ TRỤ' },
      { vi: '"rạn san hô"', en: 'coral reef', label: 'ĐẠI DƯƠNG' },
      { vi: '"thành phố" "bỏ hoang"', en: 'ghost town history', label: 'NƠI BỊ LÃNG QUÊN' },
      { vi: '"thư viện số"', en: 'digital archives', label: 'KHO LƯU TRỮ' },
      { vi: '"đảo" "hoang"', en: 'uninhabited island natural history', label: 'NGOÀI KHƠI' },
    ],
  }
  return topics[mode]
}

function chooseTopic(mode: ContentMode, weights: Record<string, number>): Topic {
  const topics = getTopics(mode)
  const chance = Math.random()
  const tier = chance < .7 ? topics.slice(0, 7) : chance < .9 ? topics.slice(7, 9) : topics.slice(9)
  const weighted = tier.map(topic => ({ topic, weight: Math.max(.35, Math.min(1.8, 1 + (weights[topic.label] || 0) * .08)) }))
  let choice = Math.random() * weighted.reduce((total, item) => total + item.weight, 0)
  for (const item of weighted) { choice -= item.weight; if (choice <= 0) return item.topic }
  return tier[0]
}

function shuffle<Value>(items: Value[]): Value[] {
  const shuffled = [...items]
  for (let remaining = shuffled.length - 1; remaining > 0; remaining -= 1) {
    const index = Math.floor(Math.random() * (remaining + 1))
    const previous = shuffled[remaining]
    shuffled[remaining] = shuffled[index]
    shuffled[index] = previous
  }
  return shuffled
}

function chooseMode(mode: Mode): ContentMode {
  if (mode !== 'chaos') return mode
  const chance = Math.random()
  return chance < 0.4 ? 'weird' : chance < 0.75 ? 'learn' : 'explore'
}

function randomTopic(mode: ContentMode): Topic {
  const labels: Record<ContentMode, string[]> = {
    weird: ['NGẪU NHIÊN / THIÊN NHIÊN', 'NGẪU NHIÊN / HIỆN TƯỢNG', 'NGẪU NHIÊN / CHUYỆN LẠ'],
    learn: ['NGẪU NHIÊN / KHOA HỌC', 'NGẪU NHIÊN / LỊCH SỬ', 'NGẪU NHIÊN / ĐỜI SỐNG'],
    explore: ['NGẪU NHIÊN / ĐỊA LÝ', 'NGẪU NHIÊN / VĂN HÓA', 'NGẪU NHIÊN / THẾ GIỚI'],
  }
  const label = labels[mode][Math.floor(Math.random() * labels[mode].length)]
  return { vi: '', en: '', label }
}

async function wiki(language: 'vi' | 'en', params: Record<string, string>, signal: AbortSignal): Promise<WikiPage[]> {
  const url = new URL(`https://${language}.wikipedia.org/w/api.php`)
  url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', ...params }).toString()
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(9000)]),
    headers: { 'User-Agent': 'sthelse/1.0 (https://sthelse.netlify.app; discovery toy)', Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Wikimedia ${response.status}`)
  const data = await response.json() as WikiResponse
  if (data.error) throw new Error(`Wikimedia ${data.error.code}`)
  return data.query?.pages || []
}

function pageParams(): Record<string, string> {
  return {
    prop: 'extracts|pageimages|pageprops|info|langlinks|images',
    exintro: '1',
    explaintext: '1',
    exchars: '1100',
    exlimit: '20',
    piprop: 'thumbnail',
    pithumbsize: '800',
    inprop: 'url',
    lllang: 'vi',
    llprop: 'url',
    lllimit: '20',
    imlimit: 'max',
    redirects: '1',
  }
}

function isInteresting(page: WikiPage): boolean {
  if (page.missing || page.ns !== 0 || !page.extract || !page.fullurl) return false
  if (page.pageprops && 'disambiguation' in page.pageprops) return false
  if ((page.length || 0) < 2400 || page.extract.trim().length < 220) return false
  if (/^(list of|lists of|danh sách|index of|outline of|glossary of|timeline of|wikipedia:|portal:|template:|category:|thể loại:|bản mẫu:|cổng thông tin:|\d{1,4}\b)/i.test(page.title)) return false
  if (/\((disambiguation|định hướng)\)$/i.test(page.title)) return false
  if (/(may refer to|có thể đề cập đến|có thể chỉ đến|có thể là:)\s*/i.test(page.extract)) return false
  if (/\b(election|football season|footballer|politician|member of parliament)\b/i.test(page.extract.slice(0, 200))) return false
  if (/\b(journal|doctoral|finite element|tensor|murder|pornograph|sexual abuse)\b/i.test(page.extract.slice(0, 300))) return false
  if (/\b(was born|is a .* (professor|researcher|politician))\b|sinh ngày/i.test(page.extract.slice(0, 160))) return false
  return true
}

function hasFeatureImages(page: WikiPage): boolean {
  return (page.images || []).filter(image => /\.(jpe?g|png|webp|gif|svg)$/i.test(image.title) && !/\b(flag|logo|icon|symbol|commons|wiki|edit|speaker|question|ambox|lock|padlock|cscr|disambig|red pog|blue pog)\b/i.test(image.title.replace(/_/g, ' '))).length >= 3
}

function summarize(extract: string): string {
  const clean = extract.replace(/\s+/g, ' ').trim()
  if (clean.length <= 480) return clean
  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s|$)/g)
  let summary = ''
  for (const sentence of sentences || []) {
    if ((summary + sentence).length > 480) break
    summary += sentence
  }
  if (summary.trim().length >= 160) return summary.trim()
  return `${clean.slice(0, 450).replace(/\s+\S*$/, '')}…`
}

function validSourceUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && /^(vi|en)\.wikipedia\.org$/.test(url.hostname) ? url.href : undefined
  } catch { return undefined }
}

function validImageUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'upload.wikimedia.org' ? url.href : undefined
  } catch { return undefined }
}

function makeDiscovery(page: WikiPage, language: 'vi' | 'en', mode: ContentMode, topic: Topic, localized?: WikiPage): Discovery | null {
  const url = validSourceUrl(page.fullurl)
  if (!url) return null
  const displayPage = localized && isInteresting(localized) ? localized : page
  return {
    id: `${displayPage === localized ? 'vi' : language}:${displayPage.pageid}`,
    title: displayPage.title,
    originalTitle: page.title,
    description: summarize(displayPage.extract!),
    explanation: displayPage.extract!.replace(/\s+/g, ' ').trim(),
    tags: [mode, topic.label],
    mode,
    topic: topic.label,
    source: `Wikipedia · ${language === 'vi' ? 'Tiếng Việt' : 'English'}`,
    url,
    language: displayPage === localized ? 'vi' : language,
    translationUrl: displayPage === localized ? validSourceUrl(localized?.fullurl) : undefined,
    image: validImageUrl(displayPage.thumbnail?.source || page.thumbnail?.source),
  }
}

async function searchTopic(language: 'vi' | 'en', topic: Topic, signal: AbortSignal): Promise<WikiPage[]> {
  return wiki(language, {
    ...pageParams(),
    generator: 'search',
    gsrsearch: language === 'vi' ? topic.vi : topic.en,
    gsrnamespace: '0',
    gsrlimit: '18',
    gsrsort: 'relevance',
  }, signal)
}

async function searchRandom(language: 'vi' | 'en', signal: AbortSignal): Promise<WikiPage[]> {
  return wiki(language, {
    ...pageParams(),
    generator: 'random',
    grnnamespace: '0',
    grnlimit: '24',
    grnfilterredir: 'nonredirects',
  }, signal)
}

export default async (request: Request) => {
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET' } })
  const rawMode = new URL(request.url).searchParams.get('mode') || 'weird'
  if (!['weird', 'learn', 'explore', 'chaos'].includes(rawMode)) return Response.json({ error: 'Invalid mode' }, { status: 400 })
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(21000)])

  try {
    let weights: Record<string, number> = {}
    const visitor = visitorId(request)
    if (visitor) {
      try { weights = (await Promise.race([readProfile(visitor), new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Memory timeout')), 800))])).weights } catch {}
    }
    const contentModes: ContentMode[] = rawMode === 'chaos' ? shuffle(['weird', 'learn', 'explore'] as ContentMode[]) : [chooseMode(rawMode as Mode), chooseMode(rawMode as Mode), chooseMode(rawMode as Mode)]
    const seeds = contentModes.map(mode => ({ mode, topic: chooseTopic(mode, weights) }))
    const topicSearches = await Promise.allSettled(seeds.flatMap(seed => [searchTopic('vi', seed.topic, signal), searchTopic('en', seed.topic, signal)]))
    const randomMode = chooseMode(rawMode as Mode)
    const randomTopicValue = randomTopic(randomMode)
    const randomSearches = await Promise.allSettled([searchRandom('vi', signal), searchRandom('en', signal)])
    const vietnamese = topicSearches.flatMap((search, index) => index % 2 === 0 && search.status === 'fulfilled' ? search.value.map(page => ({ page, ...seeds[Math.floor(index / 2)] })) : [])
      .concat(randomSearches[0].status === 'fulfilled' ? randomSearches[0].value.map(page => ({ page, mode: randomMode, topic: randomTopicValue })) : [])
      .filter(item => isInteresting(item.page) && hasFeatureImages(item.page))
    const english = topicSearches.flatMap((search, index) => index % 2 === 1 && search.status === 'fulfilled' ? search.value.map(page => ({ page, ...seeds[Math.floor(index / 2)] })) : [])
      .concat(randomSearches[1].status === 'fulfilled' ? randomSearches[1].value.map(page => ({ page, mode: randomMode, topic: randomTopicValue })) : [])
      .filter(item => isInteresting(item.page) && hasFeatureImages(item.page))
    const seen = new Set<number>()
    const candidates = shuffle(english.filter(({ page }) => {
      if (seen.has(page.pageid)) return false
      seen.add(page.pageid)
      return true
    })).slice(0, 15)

    const localizedTitles = [...new Set(candidates.flatMap(({ page }) => page.langlinks?.filter(link => link.lang === 'vi').map(link => link.title) || []))]
    let localizedPages: WikiPage[] = []
    if (localizedTitles.length && !signal.aborted) {
      try { localizedPages = await wiki('vi', { ...pageParams(), titles: localizedTitles.join('|') }, signal) } catch { localizedPages = [] }
    }
    const translations = new Map(localizedPages.map(page => [page.title, page]))
    const discoveries = [
      ...shuffle(vietnamese).slice(0, 12).map(({ page, mode, topic }) => makeDiscovery(page, 'vi', mode, topic)),
      ...candidates.map(({ page, mode, topic: candidateTopic }) => {
        const translation = page.langlinks?.find(link => link.lang === 'vi')
        return makeDiscovery(page, 'en', mode, candidateTopic, translation ? translations.get(translation.title) : undefined)
      }),
    ].filter((discovery): discovery is Discovery => discovery !== null)

    const unique = discoveries.filter((discovery, index, all) => all.findIndex(item => item.title === discovery.title) === index)
    const preferred = unique.filter(discovery => discovery.language === 'vi')
    const fallback = unique.filter(discovery => discovery.language === 'en')
    const results = [...shuffle(preferred), ...shuffle(fallback)].slice(0, 18)
    if (results.length < 5) return Response.json({ error: 'Not enough suitable discoveries. Please roll again.' }, { status: 503 })
    return Response.json({ discoveries: results }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Wikipedia is temporarily unavailable. Please roll again.' }, { status: 503 })
  }
}

export const config: Config = { method: ['GET'] }
