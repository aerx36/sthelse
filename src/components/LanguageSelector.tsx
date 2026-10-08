import { useEffect, useRef, useState } from 'react'
import { locales, type Locale } from '../lib/i18n'
import Icon from './Icon'

export default function LanguageSelector({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus() } }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [open])
  const current = locales.find(item => item.id === locale) || locales[0]
  return <div className="language-selector" ref={containerRef}>
    <button className="language-toggle" ref={buttonRef} aria-expanded={open} aria-controls="language-panel" onClick={() => setOpen(value => !value)}><Icon name="language" /><span aria-hidden="true">{current.flag}</span><span>{current.native}</span></button>
    {open && <div className="language-popover" id="language-panel" role="menu" aria-label="Language"><div className="language-heading">LANGUAGE / 07</div>{locales.map(item => <button key={item.id} role="menuitemradio" aria-checked={item.id === locale} className="language-option" onClick={() => { onChange(item.id); setOpen(false) }}><span aria-hidden="true">{item.flag}</span><span>{item.native}</span><span>{item.label}</span><span>{item.id === locale ? '✓' : ''}</span></button>)}</div>}
  </div>
}
