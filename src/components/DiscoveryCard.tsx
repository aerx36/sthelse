import { useEffect, useState } from 'react'
import type * as React from 'react'
import { getDiscoveryImages, type Discovery, type DiscoveryImage } from '../lib/discoveries'
import Icon from './Icon'

const imageWidths = [400, 800]

function cdnUrl(source: string, width: number): string {
  return `/.netlify/images?${new URLSearchParams({ url: source, w: String(width), fm: 'avif', q: '80' })}`
}

function FeatureImage({ image, title, index, loading }: { image?: DiscoveryImage; title: string; index: number; loading: boolean }) {
  const [attempt, setAttempt] = useState<'cdn' | 'direct' | 'failed'>('cdn')
  const optimized = attempt === 'cdn'

  return <figure className="feature-image"><div className="feature-image-frame">{image && attempt !== 'failed' ? <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Hình ${index + 1}: ${image.title} — xem nguồn`}><img key={attempt} src={optimized ? cdnUrl(image.url, 800) : image.url} srcSet={optimized ? imageWidths.map(width => `${cdnUrl(image.url, width)} ${width}w`).join(', ') : undefined} sizes="(max-width: 600px) 100vw, (max-width: 850px) 220px, 340px" width={800} height={600} alt={image.title || title} loading="lazy" decoding="async" onError={() => setAttempt(optimized ? 'direct' : 'failed')} /></a> : <div className={`image-placeholder ${loading ? 'is-loading' : ''}`}><Icon name="star" /><span>{loading ? 'Đang tìm hình từ bài viết…' : image && attempt === 'failed' ? 'Hình ảnh chưa tải được.' : 'Nguồn chưa có thêm hình phù hợp.'}</span><span className="placeholder-number">{String(index + 1).padStart(2, '0')} / 03</span></div>}</div>{image && <figcaption><a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.artist} · {image.license} ↗</a></figcaption>}</figure>
}

export function CardFace({ discovery, heading = false }: { discovery: Discovery; heading?: boolean }) {
  return <>
    <span className="face-category"><i /> {discovery.mode.toUpperCase()} <span className="meta-divider">/</span> {discovery.topic}</span>
    {heading ? <h2 id="discovery-title" className="face-title" tabIndex={-1}>{discovery.title}</h2> : <strong className="face-title">{discovery.title}</strong>}
    <span className="face-description">{discovery.description}</span>
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
    <article className="discovery-card result-discovery" aria-labelledby="discovery-title">
      <div className="result-card" ref={faceRef}><div className="card-face result-face"><CardFace discovery={discovery} heading /></div></div>
      <div className="result-detail">
        <div className="discovery-meta"><span><i /> DISCOVERY {String(number).padStart(3, '0')}</span><span>{discovery.mode.toUpperCase()} <span className="meta-divider">/</span> {discovery.topic}</span></div>
        {discovery.language === 'en' && <p className="language-note">Chưa có bản tiếng Việt phù hợp. Một chuyến đi bằng tiếng Anh nhé.</p>}
        <div className="feature-gallery" aria-label="Ba hình ảnh từ bài viết">{Array.from({ length: 3 }, (_, index) => <FeatureImage key={`${attempt}-${index}`} image={images[index]} title={discovery.title} index={index} loading={loading} />)}</div>
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
