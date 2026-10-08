import { useEffect, useMemo, useState } from 'react'
import type * as React from 'react'
import { getDiscoveryImages, type Discovery, type DiscoveryImage } from '../lib/discoveries'
import Icon from './Icon'

const imageWidths = [400, 800, 1920]
const smartCuePattern = /được định nghĩa|có nghĩa là|được gọi là|nguyên nhân|vì vậy|do đó|dẫn đến|kết quả là|đóng vai trò|được phát hiện|được chứng minh|được sử dụng|được hình thành|được biết đến|đầu tiên|duy nhất|lớn nhất|nhỏ nhất|cổ nhất|hiếm nhất|kỷ lục|đặc biệt|khái niệm|định nghĩa|lý thuyết|nguyên lý|định luật|giả thuyết|thuật ngữ|đặc điểm|tác động|ảnh hưởng|vai trò|ý nghĩa|phương pháp|ứng dụng|tiến hóa|sinh học|vật lý|hóa học|tâm lý học|thiên văn học|lịch sử|địa lý|văn hóa|xã hội học/i
const quantifiedPattern = /\b(?:\d{4}|\d{1,4}(?:[.,]\d+)?%?|\d{1,2}\s+(?:tháng|năm|giờ|km|mét|triệu|tỷ))\b/i
const dependentReferencePattern = /\b(?:điều này|việc này|nó|chúng|họ|this|that|it|they|these)\b/i

type TextRange = { start: number; end: number; score: number }

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function smartHighlightRanges(text: string, mode: Discovery['mode']): TextRange[] {
  const sentences = Array.from(text.matchAll(/[^.!?]+(?:[.!?]+|$)/g)).map((match, index) => {
    const value = match[0]
    const start = match.index ?? 0
    let score = index === 0 ? 5 : 0
    if (smartCuePattern.test(value)) score += 4
    if (quantifiedPattern.test(value)) score += 3
    if (mode === 'learn' && smartCuePattern.test(value)) score += 2
    if (value.length > 90 && index < 2) score += 1
    if (dependentReferencePattern.test(value) && index > 0) score -= 2
    return { start, end: start + value.length, score, value }
  })
  const budget = Math.max(8, Math.ceil(wordCount(text) * .25))
  let used = 0
  const selected: TextRange[] = []

  for (const sentence of sentences.sort((first, second) => second.score - first.score)) {
    const words = wordCount(sentence.value)
    if (sentence.score < 3 || (used > 0 && used + words > budget)) continue
    selected.push({ start: sentence.start, end: sentence.end, score: sentence.score })
    used += words
  }

  if (!selected.length && sentences[0]) {
    selected.push({ start: sentences[0].start, end: sentences[0].end, score: sentences[0].score })
  }
  return selected.sort((first, second) => first.start - second.start)
}

function HighlightedDescription({ text, mode }: { text: string; mode: Discovery['mode'] }) {
  const ranges = useMemo(() => smartHighlightRanges(text, mode), [text, mode])
  let cursor = 0
  return <>{ranges.flatMap((range, index) => {
    const before = text.slice(cursor, range.start)
    const highlighted = text.slice(range.start, range.end)
    cursor = range.end
    return [before, <mark key={`${range.start}-${index}`}>{highlighted}</mark>]
  }).concat(cursor < text.length ? [text.slice(cursor)] : [])}</>
}

function cdnUrl(source: string, width: number): string {
  return `/.netlify/images?${new URLSearchParams({ url: source, w: String(width), fm: 'avif', q: '80' })}`
}

function FeatureImage({ image, title, index, loading }: { image?: DiscoveryImage; title: string; index: number; loading: boolean }) {
  const [attempt, setAttempt] = useState<'cdn' | 'direct' | 'failed'>('cdn')
  const optimized = attempt === 'cdn'
  const eager = index < 3

  return <figure className="feature-image"><div className="feature-image-frame">{image && attempt !== 'failed' ? <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Hình ${index + 1}: ${image.title} — xem nguồn`}><img key={attempt} src={optimized ? cdnUrl(image.url, 1920) : image.url} srcSet={optimized ? imageWidths.map(width => `${cdnUrl(image.url, width)} ${width}w`).join(', ') : undefined} sizes="(max-width: 600px) 100vw, (max-width: 850px) 220px, 340px" width={1920} height={1080} alt={image.title || title} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setAttempt(optimized ? 'direct' : 'failed')} /></a> : <div className={`image-placeholder ${loading ? 'is-loading' : ''}`}><Icon name="star" /><span>{loading ? 'Đang tìm hình từ bài viết…' : image && attempt === 'failed' ? 'Hình ảnh chưa tải được.' : 'Nguồn chưa có thêm hình phù hợp.'}</span><span className="placeholder-number">{String(index + 1).padStart(2, '0')} / 03</span></div>}</div>{image && <figcaption><a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.artist} · {image.license} ↗</a></figcaption>}</figure>
}

export function CardFace({ discovery, heading = false, description = discovery.description }: { discovery: Discovery; heading?: boolean; description?: string }) {
  return <>
    <span className="face-category"><i /> {discovery.mode.toUpperCase()} <span className="meta-divider">/</span> {discovery.topic}</span>
    {heading ? <h2 id="discovery-title" className="face-title" tabIndex={-1}>{discovery.title}</h2> : <strong className="face-title">{discovery.title}</strong>}
    <span className={`face-description ${discovery.mode === 'learn' ? 'is-learning' : ''}`}><HighlightedDescription text={description} mode={discovery.mode} /></span>
    <span className="face-source"><span>{discovery.source} ↗</span><span>{discovery.language === 'vi' ? 'TIẾNG VIỆT' : 'ENGLISH'}</span></span>
  </>
}

export default function DiscoveryCard({ discovery, number, expanded, faceRef, children }: { discovery: Discovery; number: number; expanded: boolean; faceRef: React.Ref<HTMLDivElement>; children: React.ReactNode }) {
  const [images, setImages] = useState<DiscoveryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setImageError('')
    void getDiscoveryImages(discovery, AbortSignal.any([controller.signal, AbortSignal.timeout(15000)])).then(setImages).catch(() => {
      if (!controller.signal.aborted) setImageError('Hình ảnh đang gián đoạn. Nội dung và nguồn vẫn ở đây.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [discovery, attempt])

  return (
    <article className={`discovery-card result-discovery ${!loading && images.length === 0 ? 'no-images' : ''}`} aria-labelledby="discovery-title">
      <div className="result-card" ref={faceRef}><div className="card-face result-face"><CardFace discovery={discovery} heading description={!loading && images.length === 0 ? discovery.explanation : undefined} /></div></div>
      <div className="result-detail">
        <div className="discovery-meta"><span><i /> DISCOVERY {String(number).padStart(3, '0')}</span><span>{discovery.mode.toUpperCase()} <span className="meta-divider">/</span> {discovery.topic}</span></div>
        {discovery.language === 'en' && <p className="language-note">Chưa có bản tiếng Việt phù hợp. Một chuyến đi bằng tiếng Anh nhé.</p>}
        {images.length > 0 && <div className={`feature-gallery feature-gallery-count-${images.length}`} aria-label={`${images.length} hình ảnh từ bài viết`}>{images.map((image, index) => <FeatureImage key={`${attempt}-${image.url}`} image={image} title={discovery.title} index={index} loading={loading} />)}</div>}
        {imageError && <p className="gallery-notice" role="status">{imageError} <button onClick={() => setAttempt(value => value + 1)}>Thử tải lại ↻</button></p>}
        {!loading && !imageError && images.length < 3 && <p className="gallery-notice">Bài viết chỉ có {images.length} hình phù hợp có giấy phép rõ ràng. Không dùng ảnh không liên quan.</p>}
        <section id="discovery-explanation" className="discovery-explanation" hidden={!expanded}><span className="explanation-label">A LITTLE DEEPER</span><p>{discovery.explanation}</p><a className="explore-link" href={discovery.translationUrl || discovery.url} target="_blank" rel="noopener noreferrer">Explore <Icon name="arrow" /></a></section>
        <div className="discovery-bottom">
          <div className="source"><a href={discovery.url} target="_blank" rel="noopener noreferrer">{discovery.source}<span aria-hidden="true"> ↗</span></a><span>{discovery.language === 'vi' ? 'NỘI DUNG TIẾNG VIỆT' : 'NỘI DUNG GỐC · ENGLISH'}</span></div>
          <span className="source-language">{discovery.language === 'vi' ? 'TÒ MÒ THÊM MỘT CHÚT.' : 'ORIGINAL SOURCE, ALWAYS.'}</span>
        </div>
        {children}
      </div>
    </article>
  )
}
