export type Mode = 'weird' | 'learn' | 'explore' | 'chaos'
export type ContentMode = Exclude<Mode, 'chaos'>

export interface Discovery {
  id: string
  title: string
  description: string
  mode: ContentMode
  topic: string
  source: string
  url: string
  language: 'vi' | 'en'
  originalTitle: string
  translationUrl?: string
  image?: string
  explanation: string
  tags: string[]
}

export interface DiscoveryImage {
  url: string
  title: string
  sourceUrl: string
  artist: string
  license: string
}

export interface InterestProfile {
  shown: string[]
  known: string[]
  unknown: string[]
  weights: Record<string, number>
}

export const emptyProfile: InterestProfile = { shown: [], known: [], unknown: [], weights: {} }

export interface DiscoveryBatch {
  discoveries: Discovery[]
}

export async function getDiscoveries(mode: Mode, signal: AbortSignal): Promise<Discovery[]> {
  const response = await fetch(`/.netlify/functions/discover?mode=${mode}`, { signal })
  if (!response.ok) {
    throw new Error(response.status === 429
      ? 'Wikipedia đang bận một chút. Đợi vài giây rồi ROLL lại nhé.'
      : 'Tín hiệu từ Wikipedia đang gián đoạn. Thử ROLL lại nhé.')
  }
  const data = await response.json() as DiscoveryBatch
  if (!Array.isArray(data.discoveries) || data.discoveries.length < 5) {
    throw new Error('Chưa tìm thấy điều đủ thú vị. Thử một cú ROLL nữa nhé.')
  }
  return data.discoveries
}

export async function getDiscoveryImages(discovery: Discovery, signal: AbortSignal): Promise<DiscoveryImage[]> {
  const params = new URLSearchParams({ url: discovery.url, ...(discovery.translationUrl ? { localized: discovery.translationUrl } : {}) })
  const response = await fetch(`/.netlify/functions/images?${params}`, { signal })
  if (!response.ok) throw new Error('Chưa kết nối được với hình ảnh. Thử lại nhé.')
  const data = await response.json() as { images: DiscoveryImage[] }
  return data.images.filter(image => !/\bsongbird\b/i.test(`${image.title} ${image.sourceUrl}`)).slice(0, 3)
}

export async function getProfile(signal: AbortSignal): Promise<InterestProfile> {
  const response = await fetch('/.netlify/functions/interests', { signal })
  if (!response.ok) throw new Error('Không thể kết nối bộ nhớ khám phá.')
  return response.json() as Promise<InterestProfile>
}

export async function recordInterest(discovery: Discovery, action: 'shown' | 'known' | 'unknown'): Promise<InterestProfile> {
  const response = await fetch('/.netlify/functions/interests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: discovery.id, mode: discovery.mode, topic: discovery.topic, tags: discovery.tags, action }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Chưa lưu được lựa chọn. Bạn vẫn có thể khám phá tiếp.')
  return response.json() as Promise<InterestProfile>
}

export function drawDiscoveries(discoveries: Discovery[], profile: InterestProfile): Discovery[] {
  return discoveries.map(discovery => {
    const keys = [discovery.mode, discovery.topic, ...discovery.tags]
    const interest = keys.reduce((total, key) => total + (profile.weights[key] || 0), 0) / keys.length
    const novelty = profile.known.includes(discovery.id) ? .15 : profile.shown.includes(discovery.id) ? .45 : 1
    const weight = novelty * Math.max(.25, Math.min(2, 1 + interest * .15)) * (discovery.language === 'vi' ? 1.6 : 1)
    return { discovery, score: -Math.log(Math.max(Number.EPSILON, Math.random())) / weight }
  }).sort((first, second) => first.score - second.score).slice(0, 5).map(item => item.discovery)
}
