import { useEffect, useRef, useState } from 'react'
import type * as React from 'react'
import Icon from './components/Icon'
import DiscoveryCard from './components/DiscoveryCard'
import ThemeSelector from './components/ThemeSelector'
import { drawDiscoveries, emptyProfile, getDiscoveries, getProfile, recordInterest, type Discovery, type InterestProfile, type Mode } from './lib/discoveries'

type Phase = 'idle' | 'waiting' | 'start' | 'fast' | 'slow' | 'land' | 'draw' | 'flipping' | 'result' | 'returning'

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
  const [result, setResult] = useState<Discovery | null>(null)
  const [reelText, setReelText] = useState('')
  const [reelKey, setReelKey] = useState(0)
  const [error, setError] = useState('')
  const [rolls, setRolls] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [deck, setDeck] = useState<Discovery[]>([])
  const [chosenIndex, setChosenIndex] = useState<number | null>(null)
  const [reelDuration, setReelDuration] = useState(650)
  const [expanded, setExpanded] = useState(false)
  const [memoryNotice, setMemoryNotice] = useState('')
  const [profile, setProfile] = useState<InterestProfile>(initialProfile)
  const requestRef = useRef<AbortController | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const interestQueue = useRef<Promise<void>>(Promise.resolve())
  const resultRef = useRef<HTMLDivElement | null>(null)
  const aboutRef = useRef<HTMLDialogElement | null>(null)
  const aboutButtonRef = useRef<HTMLButtonElement | null>(null)
  const currentMode = modes.find(item => item.id === mode)!

  useEffect(() => () => { requestRef.current?.abort(); void audioRef.current?.close() }, [])

  useEffect(() => {
    const controller = new AbortController()
    void getProfile(AbortSignal.any([controller.signal, AbortSignal.timeout(8000)])).then(remote => setProfile(local => ({
      shown: [...new Set([...remote.shown, ...local.shown])].slice(-250),
      known: [...new Set([...remote.known.filter(id => !local.unknown.includes(id)), ...local.known])].slice(-250),
      unknown: [...new Set([...remote.unknown.filter(id => !local.known.includes(id)), ...local.unknown])].slice(-250),
      weights: { ...remote.weights, ...local.weights },
    }))).catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    try { localStorage.setItem('sthelse-interests', JSON.stringify(profile)) } catch {}
  }, [profile])

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
    const timeout = window.setTimeout(() => controller.abort(), 28000)
    let phraseTimer: number | undefined
    setRolling(true)
    setError('')
    setExpanded(false)
    setPhase(result ? 'returning' : 'start')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await sleep(reducedMotion ? 0 : 150, controller.signal).catch(() => {})
    if (controller.signal.aborted) { window.clearTimeout(timeout); requestRef.current = null; setRolling(false); return }
    setResult(null)
    setDeck([])
    setChosenIndex(null)
    setPhase('waiting')
    setReelDuration(650)
    setReelText(waitingPhrases[0])
    if (soundOn) {
      try {
        audioRef.current ??= new AudioContext()
        await audioRef.current.resume()
      } catch { setSoundOn(false) }
    }
    let phraseIndex = 0
    phraseTimer = window.setInterval(() => {
      phraseIndex += 1
      setReelText(waitingPhrases[phraseIndex % waitingPhrases.length])
      setReelKey(value => value + 1)
    }, reducedMotion ? 1400 : 700)
    try {
      const discoveries = await getDiscoveries(mode, controller.signal)
      window.clearInterval(phraseTimer)
      const candidates = drawDiscoveries(discoveries, profile)
      const delays = reducedMotion ? [150] : [65, 65, 65, 70, 80, 90, 110, 130, 160, 190, 220]
      for (let index = 0; index < delays.length; index += 1) {
        const item = candidates[index % candidates.length]
        setPhase(index < 7 ? 'fast' : 'slow')
        setReelDuration(delays[index])
        setReelText(item.title)
        setReelKey(value => value + 1)
        tick()
        await sleep(delays[index], controller.signal)
      }
      setPhase('land')
      setReelDuration(260)
      tick(true)
      await sleep(reducedMotion ? 0 : 260, controller.signal)
      setDeck(candidates)
      setPhase('draw')
      setRolls(value => value + 1)
    } catch (cause) {
      setPhase('idle')
      if (controller.signal.aborted) {
        setError('Chuyến đi mất hơi lâu. Thử ROLL lại để kết nối với Wikipedia nhé.')
      } else {
        setError(cause instanceof Error ? cause.message : 'Có chút trục trặc. Thử ROLL lại nhé.')
      }
    } finally {
      window.clearTimeout(timeout)
      window.clearInterval(phraseTimer)
      requestRef.current = null
      setRolling(false)
    }
  }

  const selectCard = async (index: number) => {
    if (requestRef.current || chosenIndex !== null) return
    const controller = new AbortController()
    requestRef.current = controller
    setChosenIndex(index)
    setPhase('flipping')
    tick(true)
    try {
      await sleep(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720, controller.signal)
      const discovery = deck[index]
      remember(discovery, 'shown')
      setResult(discovery)
      setPhase('result')
      setDeck([])
    } catch {} finally { requestRef.current = null }
  }

  const markKnown = async () => {
    if (!result || requestRef.current) return
    remember(result, 'known')
    const controller = new AbortController()
    requestRef.current = controller
    setPhase('returning')
    try {
      await sleep(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200, controller.signal)
      setResult(null)
      setDeck([])
      setChosenIndex(null)
      setExpanded(false)
      setPhase('idle')
      window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.roll-button')?.focus())
    } catch {} finally { requestRef.current = null }
  }

  useEffect(() => {
    if (!result || !resultRef.current) return
    resultRef.current.querySelector<HTMLHeadingElement>('h2')?.focus({ preventScroll: true })
    resultRef.current.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }, [result])

  useEffect(() => {
    if (phase === 'draw') document.querySelector<HTMLButtonElement>('.draw-card')?.focus({ preventScroll: true })
  }, [phase])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="sthelse — trang chủ"><Icon name="star" /><span>sthelse<span className="wordmark-dot">↗</span></span></a>
        <span className="header-note">AN INTERNET WANDERING MACHINE</span>
        <div className="header-actions"><ThemeSelector /><button className="sound-button" aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={soundOn} onClick={() => setSoundOn(value => !value)} disabled={rolling}><Icon name={soundOn ? 'sound' : 'mute'} /><span>SOUND {soundOn ? 'ON' : 'OFF'}</span></button></div>
      </header>

      <main>
        {!result && <section className={`machine phase-${phase}`} aria-labelledby="main-title">
          <div className="hero-eyebrow"><span className="status-dot" /> LESS SCROLLING. MORE SERENDIPITY.</div>
          <h1 id="main-title">sthelse<span className="title-asterisk" aria-hidden="true">*</span></h1>
          <div className="hero-copy"><p>Không biết xem gì?</p><span>Bạn không cần một đích đến. Chỉ cần một chút tò mò.</span></div>

          <div className="mode-area">
            <div className="mode-selectors" role="group" aria-label="Chọn chế độ khám phá">
              {modes.map(item => <button key={item.id} className={`mode-button ${mode === item.id ? 'selected' : ''}`} aria-pressed={mode === item.id} title={item.hint} onClick={() => setMode(item.id)} disabled={rolling || deck.length > 0}><Icon name={item.id} />{item.label}{mode === item.id && <span className="selection-dot" />}</button>)}
            </div>
            <p className="mode-description">{currentMode.description}</p>
          </div>

          {!deck.length && <div className={`randomizer ${rolling ? 'is-rolling' : ''} phase-${phase}`} aria-busy={rolling}>
            <div className="randomizer-top"><span><span className="tiny-cross">+</span> THE POSSIBILITY ENGINE</span><span>{rolling ? 'SEARCHING THE UNKNOWN' : result ? 'SOMETHING FOUND' : 'AWAITING CURIOSITY'}<span className={`engine-dot ${rolling ? 'active' : ''}`} /></span></div>
            <div className="reel-window">
              <span className="reel-marker marker-left" aria-hidden="true">›</span>
              <div className={`reel ${rolling ? 'moving' : ''}`}>
                {rolling ? <><span className="ghost-text" aria-hidden="true">{currentMode.hint}</span><span key={reelKey} className="reel-title" style={{ animationDuration: `${reelDuration}ms` }}>{reelText}</span><span className="ghost-text" aria-hidden="true">Đi đâu cũng được.</span></> : <div className="idle-reel"><span className="coordinate coordinate-left" aria-hidden="true">∞ POSSIBILITIES</span><div className="orbit-symbol" aria-hidden="true"><Icon name="star" /><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit-satellite" /></div><span className="coordinate coordinate-right" aria-hidden="true">01 CLICK AWAY</span><p>{rolls ? 'Thế giới còn nhiều điều hay.' : 'Đi đâu đó. Bất cứ đâu.'}</p></div>}
              </div>
              <span className="reel-marker marker-right" aria-hidden="true">‹</span>
            </div>
            <div className="roll-row"><button className="roll-button" onClick={() => void roll()} disabled={rolling} aria-label={rolling ? 'Đang khám phá' : 'ROLL — khám phá một điều mới'}><span className="roll-button-star"><Icon name="star" /></span><span>{rolling ? 'ROLLING' : 'ROLL'}</span><span className="roll-button-arrow"><Icon name="arrow" /></span></button></div>
            <div className="randomizer-bottom"><span>{rolling ? 'THE INTERNET IS A BIG PLACE.' : 'ONE CLICK. SOMEWHERE NEW.'}</span><span className="keyboard-hint">{rolling ? 'LET IT HAPPEN' : 'TAKE A CHANCE'} <span aria-hidden="true">↗</span></span></div>
          </div>}
          {!!deck.length && <section className="card-draw" aria-label="Chọn một trong năm lá bài"><p className="draw-eyebrow">FIVE POSSIBILITIES. ONE LITTLE DETOUR.</p><h2>Chọn một lá. Đi một nơi.</h2><div className={`card-spread ${chosenIndex !== null ? 'has-choice' : ''}`}>{deck.map((discovery, index) => <button key={discovery.id} className={`draw-card ${chosenIndex === index ? 'is-chosen' : ''}`} style={{ '--rotation': `${(index - 2) * 4}deg`, '--lift': `${Math.abs(index - 2) * 9}px`, '--deal-delay': `${index * 65}ms` } as React.CSSProperties} aria-label={`Chọn lá bài ${index + 1} trên 5`} disabled={chosenIndex !== null} onPointerMove={event => { const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--tilt', `${((event.clientX - rect.left) / rect.width - .5) * 6}deg`) }} onPointerLeave={event => event.currentTarget.style.setProperty('--tilt', '0deg')} onClick={() => void selectCard(index)}><span className="card-flipper"><span className="card-back"><span className="card-corner">sthelse / {String(index + 1).padStart(2, '0')}</span><span className="card-emblem"><Icon name="star" /></span><span className="card-back-title">sthelse</span><span className="card-back-caption">SOMETHING YOU HAVEN’T MET.</span><span className="card-bottom-number">? / ∞</span></span><span className="card-front"><span className="card-corner">{discovery.topic}</span><strong>{discovery.title}</strong><span>{discovery.description}</span><span className="card-corner">WIKIPEDIA ↗</span></span></span></button>)}</div><p className="draw-hint">Năm khả năng. Chỉ một lựa chọn. Không có đáp án sai.</p><button className="shuffle-link" disabled={chosenIndex !== null} onClick={() => void roll()}>↻ SHUFFLE AGAIN</button></section>}
          <p className="below-machine">Không tài khoản. Không đích đến. <span>Một chút tò mò, một chút bất ngờ.</span></p>
          <div className="live-status" role="status" aria-live="polite" aria-atomic="true">{rolling ? 'Đang tìm và chọn một khám phá mới…' : result ? `Đã tìm thấy: ${result.title}` : ''}</div>
          {error && <div className="error-message" role="alert"><span className="error-symbol">!</span><p>{error}</p></div>}
        </section>}

        {result && <div ref={resultRef} className={`result-section focused-result ${phase === 'returning' ? 'is-leaving' : ''}`}><div className="result-label"><span>sthelse / YOUR LITTLE DETOUR</span><span>{String(rolls).padStart(3, '0')}</span></div><DiscoveryCard key={`${rolls}-${result.id}`} discovery={result} number={rolls} expanded={expanded} /><div className="knowledge-actions"><button className="knowledge-button" disabled={rolling || phase === 'returning'} onClick={() => void markKnown()}>OH, I KNOW THAT <span aria-hidden="true">↗</span></button><button className="knowledge-button interest-button" aria-expanded={expanded} aria-controls="discovery-explanation" disabled={expanded || rolling || phase === 'returning'} onClick={() => { remember(result, 'unknown'); setExpanded(true) }}>I DON'T KNOW ABOUT THAT <span aria-hidden="true">+</span></button></div>{expanded && <p className="interest-note" role="status">Một lối rẽ đáng giữ lại. Những lần ROLL sau sẽ có thêm chút điều bạn thích.</p>}<button className="shuffle-link result-shuffle" disabled={rolling || phase === 'returning'} onClick={() => void roll()}>↻ SHUFFLE AGAIN</button><p className="result-footnote">Không phải bài kiểm tra. Chỉ là cách sự tò mò dẫn đường.</p></div>}

        {memoryNotice && <p className="memory-notice" role="status">{memoryNotice}</p>}
        {!result && <div className="manifesto"><span className="manifesto-line" /><p>The internet is still a weird, wonderful place.<br /><span>Let’s get a little lost.</span></p><span className="manifesto-line" /></div>}
      </main>

      <footer className="site-footer"><span>A SIDE QUEST FOR YOUR MIND.</span><span className="footer-center"><span className="status-dot" /> POWERED BY CURIOSITY & WIKIPEDIA</span><button ref={aboutButtonRef} onClick={() => setAboutOpen(true)}>WHAT IS THIS? <span aria-hidden="true">↗</span></button></footer>

      <dialog ref={aboutRef} className="about-dialog" aria-labelledby="about-title" onCancel={() => setAboutOpen(false)} onClose={() => { setAboutOpen(false); aboutButtonRef.current?.focus() }} onClick={event => { if (event.target === event.currentTarget) setAboutOpen(false) }}>
        <div className="about-content"><button className="close-button" aria-label="Đóng giới thiệu" onClick={() => setAboutOpen(false)}><Icon name="close" /></button><Icon name="star" className="about-star" /><span className="about-eyebrow">A SMALL ESCAPE FROM THE ALGORITHM</span><h2 id="about-title">Đi lạc một chút.</h2><p>sthelse là một món đồ chơi nhỏ cho những lúc bạn không biết xem gì. Chọn tâm trạng, nhấn ROLL, chọn một trong năm lá bài, và để sự tò mò dẫn đường.</p><p>Mỗi chuyến đi tìm nội dung trực tiếp từ Wikipedia: lọc bài định hướng, bài quá ngắn và trang quản trị, rồi ưu tiên bản tiếng Việt. CHAOS trộn cả WEIRD, LEARN và EXPLORE. Chủ đề ưu tiên những điều gần gũi, thêm chút khác thường và một chút kỳ lạ.</p><p>Không tài khoản. Bảng màu và lựa chọn được giữ trên thiết bị; bộ nhớ khám phá được đồng bộ bằng mã ẩn danh trong cookie, không cần tên hay email. Những điều đã biết xuất hiện ít hơn, điều bạn muốn hiểu thêm có cơ hội trở lại — nhưng vẫn luôn có chỗ cho bất ngờ.</p><p>Các bài viết thuộc cộng đồng Wikipedia. Hình ảnh lấy từ chính bài viết, kèm tác giả, giấy phép và trang nguồn. Nếu nguồn thiếu hình, sthelse không thay bằng ảnh không liên quan.</p><span className="about-ending">NO DESTINATION REQUIRED. ↗</span></div>
      </dialog>
    </div>
  )
}
