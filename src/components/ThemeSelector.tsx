import { useEffect, useRef, useState } from 'react'
import { applyTheme, initialTheme, themes, type ThemeGroup } from '../lib/themes'

const groups: ThemeGroup[] = ['DARK / DEVELOPER', 'COLOR / EXPERIMENTAL', 'LIGHT / PAPER']

export default function ThemeSelector() {
  const [selected, setSelected] = useState(initialTheme)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { applyTheme(selected) }, [selected])
  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
    const dismiss = (event: PointerEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus() } }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [open])

  return <div className="theme-selector" ref={containerRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
    <button className="theme-toggle" ref={buttonRef} aria-expanded={open} aria-controls="theme-panel" onClick={() => setOpen(value => !value)}><span className="theme-preview" aria-hidden="true">◐</span><span>THEME</span></button>
    {open && <div className="theme-popover" id="theme-panel" ref={panelRef} role="region" aria-label="36 bảng màu"><div className="theme-heading"><span>CHOOSE YOUR ATMOSPHERE</span><span>36</span></div>{groups.map(group => <section key={group}><h2>{group}</h2><div className="theme-grid">{themes.filter(theme => theme.group === group).map(theme => <button key={theme.id} aria-pressed={theme.id === selected} className="theme-option" onClick={() => setSelected(theme.id)}><span className="theme-swatches" aria-hidden="true">{[theme.background, theme.accent, theme.secondary].map((swatch, index) => <i key={index} style={{ background: swatch }} />)}</span><span>{theme.name}</span><span className="theme-check" aria-hidden="true">{theme.id === selected ? '✓' : ''}</span></button>)}</div></section>)}</div>}
  </div>
}
