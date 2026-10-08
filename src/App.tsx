import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type * as React from 'react'
import Icon from './components/Icon'
import DiscoveryCard, { CardFace } from './components/DiscoveryCard'
import ThemeSelector from './components/ThemeSelector'
import LanguageSelector from './components/LanguageSelector'
import { drawDiscoveries, emptyProfile, getDiscoveries, getProfile, recordInterest, type Discovery, type InterestProfile, type Mode } from './lib/discoveries'
import { initialLocale, type Locale } from './lib/i18n'

type Phase = 'idle' | 'timeline' | 'result' | 'returning'


const cardCount = 1
const rollingDuration = 3000
const cardTimelineDuration = 3000
const requestTimeout = 28000

function initialProfile(): InterestProfile {
  try {
    const profile = JSON.parse(localStorage.getItem('sthelse-interests') || 'null') as InterestProfile | null
    if (profile && Array.isArray(profile.shown) && Array.isArray(profile.known) && Array.isArray(profile.unknown) && profile.weights && typeof profile.weights === 'object') return profile
  } catch {}
  return emptyProfile
}

const modes: { id: Mode; label: string; description: string; hint: string }[] = [
  { id: 'weird', label: 'WEIRD', description: 'Một chút kỳ lạ. Một chút không thể giải thích.', hint: 'Những điều kỳ lạ' },
  { id: 'learn', label: 'LEARN', description: 'Một điều mới. Một góc nhìn khác.', hint: 'Hiểu thêm một chút' },
  { id: 'explore', label: 'EXPLORE', description: 'Những nơi xa lạ. Những thế giới chưa biết.', hint: 'Đi xa thêm một chút' },
  { id: 'chaos', label: 'CHAOS', description: 'Không quy luật. Không đoán trước. Cứ đi thôi.', hint: 'Để vũ trụ quyết định' },
]

const waitingPhrases = ['Tìm một lối rẽ…', 'Băng qua những ý tưởng…', 'Đi xa hơn một chút…', 'Lạc vào điều chưa biết…', 'Một điều bất ngờ đang đến…']

function sleep(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const timeout = window.setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, duration)
    const abort = () => { window.clearTimeout(timeout); reject(new DOMException('Aborted', 'AbortError')) }
    signal.addEventListener('abort', abort, { once: true })
  })
}

export default function App() {
  const [mode, setMode] = useState<Mode>('weird')
  const [rolling, setRolling] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Discovery | null>(null)
  const [error, setError] = useState('')
  const [rolls, setRolls] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [deck, setDeck] = useState<Discovery[]>([])
  const [chosenIndex, setChosenIndex] = useState<number | null>(null)
  const [memoryNotice, setMemoryNotice] = useState('')
  const [profile, setProfile] = useState<InterestProfile>(initialProfile)
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const requestRef = useRef<AbortController | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const interestQueue = useRef<Promise<void>>(Promise.resolve())
  const resultCardRef = useRef<HTMLDivElement | null>(null)
  const revealRectRef = useRef<DOMRect | null>(null)
  const aboutRef = useRef<HTMLDialogElement | null>(null)
  const aboutButtonRef = useRef<HTMLButtonElement | null>(null)
  const currentMode = modes.find(item => item.id === mode)!

  useEffect(() => () => { requestRef.current?.abort(); void audioRef.current?.close() }, [])

  useEffect(() => {
    const controller = new AbortController()
    const loadProfile = () => {
      void getProfile(AbortSignal.any([controller.signal, AbortSignal.timeout(8000)])).then(remote => setProfile(local => ({
        shown: [...new Set([...remote.shown, ...local.shown])].slice(-250),
        known: [...new Set([...remote.known.filter(id => !local.unknown.includes(id)), ...local.known])].slice(-250),
        unknown: [...new Set([...remote.unknown.filter(id => !local.known.includes(id)), ...local.unknown])].slice(-250),
        weights: { ...remote.weights, ...local.weights },
      }))).catch(() => {})
    }
    const idleTimer = window.setTimeout(loadProfile, 1200)
    return () => { window.clearTimeout(idleTimer); controller.abort() }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('sthelse-interests', JSON.stringify(profile)) } catch {}
  }, [profile])

  useEffect(() => {
    try { localStorage.setItem('sthelse-locale', locale); document.documentElement.lang = locale } catch {}
  }, [locale])

  const remember = (discovery: Discovery, action: 'shown' | 'known' | 'unknown') => {
    setProfile(previous => {
      const weights = { ...previous.weights }
      const prior = previous.known.includes(discovery.id) ? 'known' : previous.unknown.includes(discovery.id) ? 'unknown' : 'shown'
      const change = action === 'shown' ? -.15 : (action === 'unknown' ? 3 : -2) - (prior === 'unknown' ? 3 : prior === 'known' ? -2 : 0)
      for (const key of new Set([discovery.mode, discovery.topic, ...discovery.tags])) weights[key] = Math.max(-12, Math.min(12, (weights[key] || 0) + change))
      return {
        shown: [...previous.shown.filter(id => id !== discovery.id), discovery.id].slice(-250),
        known: action === 'unknown' ? previous.known.filter(id => id !== discovery.id) : action === 'known' ? [...new Set([...previous.known, discovery.id])].slice(-250) : previous.known,
        unknown: action === 'known' ? previous.unknown.filter(id => id !== discovery.id) : action === 'unknown' ? [...new Set([...previous.unknown, discovery.id])].slice(-250) : previous.unknown,
        weights,
      }
    })
    interestQueue.current = interestQueue.current.then(async () => {
      try { await recordInterest(discovery, action); setMemoryNotice('') } catch { setMemoryNotice('Bộ nhớ trực tuyến đang nghỉ. Lựa chọn vẫn được giữ trên thiết bị này.') }
    })
  }

  useEffect(() => {
    if (aboutOpen) aboutRef.current?.showModal()
    else if (aboutRef.current?.open) aboutRef.current.close()
  }, [aboutOpen])

  const tick = (landing = false) => {
    const context = audioRef.current
    if (!soundOn || !context || context.state !== 'running') return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(landing ? 660 : 180 + Math.random() * 100, context.currentTime)
    gain.gain.setValueAtTime(landing ? 0.08 : 0.025, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (landing ? 0.3 : 0.055))
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + (landing ? 0.32 : 0.06))
  }

  const roll = async () => {
    if (requestRef.current) return
    const controller = new AbortController()
    requestRef.current = controller
    const timeout = window.setTimeout(() => controller.abort(), requestTimeout)
    const rollingTimer = window.setTimeout(() => setLoading(true), rollingDuration)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pause = (duration: number) => sleep(reducedMotion ? 0 : duration, controller.signal)
    const leaving = Boolean(result) || deck.length > 0
    setRolling(true)
    setLoading(false)
    setError('')
    setPhase(leaving ? 'returning' : 'idle')
    try {
      if (leaving) await pause(260)
      setResult(null)
      setDeck([])
      setChosenIndex(null)
      setPhase('idle')
      if (soundOn) {
        try {
          audioRef.current ??= new AudioContext()
          await audioRef.current.resume()
        } catch { setSoundOn(false) }
      }
      const discoveries = await getDiscoveries(mode, controller.signal)
      window.clearTimeout(timeout)
      const candidates = drawDiscoveries(discoveries, profile).slice(0, cardCount)
      const discovery = candidates[0]
      if (!discovery) throw new Error('Không tìm thấy khám phá phù hợp. Thử ROLL lại nhé.')
      setDeck(candidates)
      setLoading(false)
      setRolls(value => value + 1)
      setChosenIndex(0)
      setPhase('timeline')
      tick(true)
      await pause(reducedMotion ? 0 : cardTimelineDuration)
      if (!reducedMotion) tick(true)
      revealRectRef.current = document.querySelector('.card-slot.is-chosen .draw-card')?.getBoundingClientRect() ?? null
      remember(discovery, 'shown')
      setResult(discovery)
      setPhase('result')
      setDeck([])
    } catch (cause) {
      setDeck([])
      setPhase('idle')
      if (controller.signal.aborted) {
        setError('Chuyến đi mất hơi lâu. Thử ROLL lại để kết nối với Wikipedia nhé.')
      } else {
        setError(cause instanceof Error ? cause.message : 'Có chút trục trặc. Thử ROLL lại nhé.')
      }
    } finally {
      window.clearTimeout(timeout)
      window.clearTimeout(rollingTimer)
      requestRef.current = null
      setRolling(false)
      setLoading(false)
    }
  }

  useLayoutEffect(() => {
    if (!result && !rolling && deck.length === 0) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [result, rolling, deck.length])

  useLayoutEffect(() => {
    const card = resultCardRef.current
    const from = revealRectRef.current
    revealRectRef.current = null
    if (!result || !card) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = card.getBoundingClientRect().top
    if (top < 70 || top > window.innerHeight * .5) window.scrollBy({ top: top - 96, behavior: 'instant' })
    card.closest('article')?.querySelector<HTMLHeadingElement>('h2')?.focus({ preventScroll: true })
    if (!from || reducedMotion || typeof card.animate !== 'function') return
    const to = card.getBoundingClientRect()
    const origin = 'top left'
    const animation = card.animate([
      { transformOrigin: origin, transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` },
      { transformOrigin: origin, transform: 'none' },
    ], { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' })
    return () => animation.cancel()
  }, [result])

  const tiltCard = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    const rect = (event.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
    event.currentTarget.style.setProperty('--tilt-x', `${-((event.clientX - rect.left) / rect.width - .5) * 14}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${((event.clientY - rect.top) / rect.height - .5) * 14}deg`)
  }

  const resetTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  const showDeck = deck.length > 0 && !result
  const showMachine = !result && !showDeck
  const statusText = phase === 'timeline' ? 'Đang mở một lối rẽ mới…' : result ? `Đã tìm thấy: ${result.title}` : ''
  const isShuffling = rolling || loading || phase === 'timeline'

  return (
    <div className={`site-shell ${result ? 'has-result' : 'is-landing'}`}>
      <div className="site-atmosphere" aria-hidden="true"><span className="landing-orbit landing-orbit-one" /><span className="landing-orbit landing-orbit-two" /><span className="landing-signal landing-signal-one">01 / CURIOUS</span><span className="landing-signal landing-signal-two">NO MAP REQUIRED ↗</span><span className="landing-signal landing-signal-three">SIGNAL / 07</span><span className="landing-signal landing-signal-four">WANDER / 02</span><span className="landing-spark landing-spark-one">✦</span><span className="landing-spark landing-spark-two">·</span><span className="landing-spark landing-spark-three">+</span><span className="landing-coordinate landing-coordinate-one">N 37° 46′</span><span className="landing-coordinate landing-coordinate-two">E 122° 25′</span><span className="landing-cross landing-cross-one">+</span><span className="landing-cross landing-cross-two">+</span><span className="landing-axis landing-axis-one" /><span className="landing-axis landing-axis-two" /><Icon name="star" className="landing-star landing-star-one" /><Icon name="star" className="landing-star landing-star-two" /><Icon name="star" className="landing-star landing-star-three" /><Icon name="star" className="landing-star landing-star-four" /></div>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="sthelse — trang chủ"><Icon name="star" /><span>sthelse<span className="wordmark-dot">↗</span></span></a>
        <span className="header-note">A RANDOM SEARCH MACHINE</span>
        <div className="header-actions"><LanguageSelector locale={locale} onChange={setLocale} /><ThemeSelector /><button className="sound-button" aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={soundOn} onClick={() => setSoundOn(value => !value)} disabled={rolling}><Icon name={soundOn ? 'sound' : 'mute'} /><span>SOUND {soundOn ? 'ON' : 'OFF'}</span></button></div>
      </header>

      <main>
        {!result && <section className={`machine phase-${phase} ${showDeck ? 'has-deck' : ''} ${rolling || loading ? 'is-rolling' : ''}`} aria-labelledby="main-title">
          <h1 id="main-title">sthelse<span className="title-asterisk" aria-hidden="true">*</span></h1>
          <div className="hero-copy"><div className="hero-copy-inner"><p>Để internet chọn một điều cho bạn.</p><span>Không thuật toán. Không kế hoạch. Chỉ có sự tò mò.</span></div></div>

          <div className="mode-area">
            <div className="mode-selectors" role="group" aria-label="Chọn chế độ khám phá">
              {modes.map(item => <button key={item.id} className={`mode-button ${mode === item.id ? 'selected' : ''}`} aria-pressed={mode === item.id} title={item.hint} onClick={() => setMode(item.id)} disabled={rolling || showDeck}><Icon name={item.id} />{item.label}{mode === item.id && <span className="selection-dot" />}</button>)}
            </div>
            <p className="mode-description">{currentMode.description}</p>
          </div>

          <div className="stage">
            {showMachine && <div className={`randomizer ${rolling || loading ? 'is-rolling' : ''} ${loading ? 'is-loading' : ''} phase-${phase}`} aria-busy={rolling || loading}>
              {(rolling || loading) && <div className="shuffle-deck" aria-hidden="true">{[0, 1, 2, 3, 4].map(index => <span key={index} className={`shuffle-card ${index === 2 ? 'is-draw-card' : ''}`} style={{ '--shuffle-index': index } as React.CSSProperties}><span /><Icon name="star" className="shuffle-card-logo" /></span>)}</div>}
              <div className="roll-row"><button type="button" className="roll-button" onClick={() => void roll()} disabled={rolling || loading} aria-label={isShuffling ? 'Đang xáo bài' : rolling ? 'Đang khám phá' : 'ROLL — khám phá một điều mới'}><span className="roll-button-star"><Icon name="star" /></span><span>{isShuffling ? 'SHUFFLING' : rolling ? 'ROLLING' : 'ROLL'}</span><span className="roll-button-arrow"><Icon name="arrow" /></span></button></div>
            </div>}
            {showDeck && <section className={`card-draw phase-${phase} ${loading ? 'is-waiting' : ''} ${phase === 'returning' ? 'is-leaving' : ''}`} aria-label="Lá bài đang được mở">
              <div className="card-spread" data-phase={phase} data-has-choice={chosenIndex !== null ? '' : undefined} role="group" aria-label="Một lá bài úp mặt">
                {deck.map((discovery, index) => {
                  const chosen = chosenIndex === index
                  return <div key={discovery.id} className={`card-slot ${chosen ? 'is-chosen' : ''} ${chosen && phase === 'timeline' ? 'is-timeline' : ''}`} style={{ '--i': index, '--offset': 0, '--distance': 0, '--deal-delay': '0ms' } as React.CSSProperties}>
                    <button className="draw-card" aria-label={`Lá bài ${index + 1} trên ${cardCount}, đang được mở`} aria-pressed={chosen} aria-disabled="true" tabIndex={-1} onPointerMove={tiltCard} onPointerLeave={resetTilt}>
                      <span className="card-flipper">
                        <span className="card-back" aria-hidden="true"><span className="card-emblem"><Icon name="star" /></span><span className="card-bottom-number">{String(index + 1).padStart(2, '0')} / {String(cardCount).padStart(2, '0')}</span></span>
                        <span className="card-face card-front"><CardFace discovery={discovery} /></span>
                      </span>
                    </button>
                  </div>
                })}
              </div>
              <p className="draw-hint">Một lối rẽ. Không cần lựa chọn.</p>
              <button type="button" className="shuffle-link" disabled>↻ SHUFFLE AGAIN</button>
            </section>}
          </div>
          <p className="below-machine">Không tài khoản. Không đích đến. <span>Một chút tò mò, một chút bất ngờ.</span></p>
          <div className="live-status" role="status" aria-live="polite" aria-atomic="true">{statusText}</div>
          {error && <div className="error-message" role="alert"><span className="error-symbol">!</span><p>{error}</p></div>}
        </section>}

        {result && <div className={`result-section focused-result ${phase === 'returning' ? 'is-leaving' : ''}`}><div className="result-label"><span>sthelse / YOUR LITTLE DETOUR</span><span>{String(rolls).padStart(3, '0')}</span></div><DiscoveryCard key={`${rolls}-${result.id}`} discovery={result} number={rolls} expanded={false} faceRef={resultCardRef}><button type="button" className="shuffle-link result-shuffle" disabled={rolling || phase === 'returning'} onClick={() => void roll()}>↻ SHUFFLE AGAIN</button></DiscoveryCard><div className="live-status" role="status" aria-live="polite" aria-atomic="true">{statusText}</div></div>}

        {memoryNotice && <p className="memory-notice" role="status">{memoryNotice}</p>}
        {!result && !rolling && !loading && <div className="manifesto"><span className="manifesto-line" /><p>The internet is still a weird, wonderful place.<br /><span>Let’s get a little lost.</span></p><span className="manifesto-line" /></div>}
      </main>

      <footer className="site-footer"><span>A SIDE QUEST FOR YOUR MIND.</span><span className="footer-center"><span className="status-dot" /> POWERED BY CURIOSITY & WIKIPEDIA</span><span className="footer-actions"><a className="github-link" href="https://github.com/aerx36/sthelse" target="_blank" rel="noopener noreferrer">GITHUB <span aria-hidden="true">↗</span></a><button ref={aboutButtonRef} onClick={() => setAboutOpen(true)}>WHAT IS THIS? <span aria-hidden="true">↗</span></button></span></footer>

      <dialog ref={aboutRef} className="about-dialog" aria-labelledby="about-title" onCancel={() => setAboutOpen(false)} onClose={() => { setAboutOpen(false); aboutButtonRef.current?.focus() }} onClick={event => { if (event.target === event.currentTarget) setAboutOpen(false) }}>
        <div className="about-content"><button className="close-button" aria-label="Đóng giới thiệu" onClick={() => setAboutOpen(false)}><Icon name="close" /></button><Icon name="star" className="about-star" /><span className="about-eyebrow">A SMALL ESCAPE FROM THE ALGORITHM</span><h2 id="about-title">Đi lạc một chút.</h2><p>sthelse là một món đồ chơi nhỏ cho những lúc bạn không biết xem gì. Chọn tâm trạng, nhấn ROLL, chọn một trong năm lá bài, và để sự tò mò dẫn đường.</p><p>Mỗi chuyến đi tìm nội dung trực tiếp từ Wikipedia: lọc bài định hướng, bài quá ngắn và trang quản trị, rồi ưu tiên bản tiếng Việt. CHAOS trộn cả WEIRD, LEARN và EXPLORE. Chủ đề ưu tiên những điều gần gũi, thêm chút khác thường và một chút kỳ lạ.</p><p>Không tài khoản. Bảng màu và lựa chọn được giữ trên thiết bị; bộ nhớ khám phá được đồng bộ bằng mã ẩn danh trong cookie, không cần tên hay email. Những điều đã biết xuất hiện ít hơn, điều bạn muốn hiểu thêm có cơ hội trở lại — nhưng vẫn luôn có chỗ cho bất ngờ.</p><p>Các bài viết thuộc cộng đồng Wikipedia. Hình ảnh lấy từ chính bài viết, kèm tác giả, giấy phép và trang nguồn. Nếu nguồn thiếu hình, sthelse không thay bằng ảnh không liên quan.</p><span className="about-ending">NO DESTINATION REQUIRED. ↗</span></div>
      </dialog>
    </div>
  )
}
